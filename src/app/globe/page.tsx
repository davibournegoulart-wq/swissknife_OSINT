"use client";

import * as THREE from "three";
import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Activity, Radio, Layers, Globe2, MapPin, Map, Crosshair, Terminal, Zap, PocketKnife } from "lucide-react";
import countryCoords from "@/data/country_coords.json";
const countriesGeo = require("@/data/countries.json");

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
const Map2D = dynamic(() => import("@/components/Map2D"), { ssr: false });

interface NewsItem { title: string; link: string; pubDate: string; source: string; country: string; accentColor: string; }
export interface PointData { lat: number; lng: number; size: number; color: string; label: string; type: "news" | "quake"; url?: string; desc?: string; }

export default function GlobeMonitor() {
  const globeRef = useRef<any>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [quakes, setQuakes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [layers, setLayers] = useState({ news: true, quakes: true, borders: true, arcs: true, labels: false, weather: false, storms: true, fires: true, volcanoes: true, conflicts: true, flights: true });
  const [globeTheme, setGlobeTheme] = useState<"tactical" | "satellite">("tactical");
  const [hoveredInfo, setHoveredInfo] = useState<PointData | null>(null);
  const [lockedInfo, setLockedInfo] = useState<PointData | null>(null);
  const [eonetEvents, setEonetEvents] = useState<any[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>("ARMED CONFLICTS");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/news?limit=200").then(r => r.json()).then(d => setNews(d.articles || []));
    
    // Fetch only recent/ongoing earthquakes (past 24h)
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson")
      .then(r => r.json()).then(d => setQuakes((d.features || []).slice(0, 300)));
      
    // Fetch all open events from NASA EONET (Storms, Wildfires, Volcanoes)
    fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open")
      .then(r => r.json()).then(d => setEonetEvents(d.events || []))
      .catch(e => console.error("EONET error", e));

    // Fetch Live ADS-B Flight Data via internal API proxy
    fetch("/api/flights")
      .then(r => r.json())
      .then(d => {
        if (d && Array.isArray(d.flights)) {
          setFlights(d.flights);
        }
      })
      .catch(e => console.error("Flight Radar fetch error", e));

    // Fetch ACLED Conflict Data (simulated via mock or public subset if available, using a static set of known conflict zones for now as ACLED requires API keys)
    setConflicts([
      { lat: 48.3794, lng: 31.1656, title: "Russo-Ukrainian War", desc: "Ongoing conventional warfare", color: "#ffff00" },
      { lat: 31.5, lng: 34.466667, title: "Gaza Strip Conflict", desc: "Armed conflict / Siege", color: "#ffff00" },
      { lat: 15.5007, lng: 32.5599, title: "Sudan Civil War", desc: "Clashes between SAF and RSF", color: "#ffff00" },
      { lat: 19.0, lng: -72.25, title: "Haiti Gang Conflict", desc: "Armed gang violence / State crisis", color: "#ffff00" },
      { lat: 12.0, lng: 15.0, title: "Sahel Insurgency", desc: "Militant insurgency operations", color: "#ffff00" },
      { lat: 16.0, lng: 96.0, title: "Myanmar Civil War", desc: "Junta vs Armed Ethnic Groups", color: "#ffff00" },
      { lat: -1.4558, lng: 29.3253, title: "Kivu Conflict (DRC)", desc: "M23 Rebellion / Armed clashes", color: "#ffff00" }
    ]);
  }, []);

  const { points, arcs, rings, labels, eonetPts, conflictPts, flightPts } = useMemo(() => {
    const pts: PointData[] = [];
    const arcList: any[] = [];
    const ringList: any[] = [];

    if (layers.news) {
      const countryNews: Record<string, NewsItem[]> = {};
      news.forEach(n => {
        if (!countryNews[n.country]) countryNews[n.country] = [];
        countryNews[n.country].push(n);
      });

      Object.entries(countryNews).forEach(([country, items]) => {
        const coords = (countryCoords as any)[country] || (countryCoords as any)[country.replace("The ", "")];
        if (coords) {
          const pt = {
            lat: coords.lat, lng: coords.lng,
            size: Math.min(1.5, 0.5 + (items.length * 0.05)),
            color: "#00f3ff",
            label: `[ ${country.toUpperCase()} ]`,
            type: "news" as const,
            url: items[0].link,
            desc: `LIVE: ${items.length} intel streams\n>>> ${items[0].title}`
          };
          pts.push(pt);
          
          // Only add rings for major news hubs to save performance
          if (items.length > 5) {
            ringList.push({ lat: coords.lat, lng: coords.lng, color: "#00f3ff", maxR: 2, propagationSpeed: 1, repeatPeriod: 2500 });
          }
          
          if (layers.arcs && Math.random() > 0.8) {
            arcList.push({
              startLat: coords.lat, startLng: coords.lng,
              endLat: 38.8951, endLng: -77.0364,
              color: ["rgba(0,243,255,0.1)", "rgba(0,243,255,0.8)"]
            });
          }
        }
      });
    }

    if (layers.quakes) {
      // Limit to 50 strongest quakes to prevent massive ring overlap
      const topQuakes = [...quakes].sort((a, b) => b.properties.mag - a.properties.mag).slice(0, 50);
      topQuakes.forEach(q => {
        const [lng, lat] = q.geometry.coordinates;
        const mag = q.properties.mag;
        pts.push({
          lat, lng, size: mag * 0.15, color: "#ff003c",
          label: `[ SEISMIC ] M${mag}`,
          type: "quake",
          url: q.properties.url,
          desc: `LOC: ${q.properties.place.toUpperCase()}`
        });
        
        // Much smaller, slower rings to avoid visual mess
        ringList.push({ lat, lng, color: "#ff003c", maxR: mag * 0.8, propagationSpeed: 1, repeatPeriod: 2000 });
      });
    }

    const eonetPtsList: any[] = [];
    let fireCount = 0;
    
    eonetEvents.forEach(s => {
      const catId = s.categories[0]?.id;
      if (catId === "severeStorms" && !layers.storms) return;
      if (catId === "wildfires" && !layers.fires) return;
      if (catId === "volcanoes" && !layers.volcanoes) return;
      
      // Heavily throttle wildfires to top 30
      if (catId === "wildfires") {
        if (fireCount > 30) return;
        fireCount++;
      }
      
      const latestGeom = s.geometry[s.geometry.length - 1];
      if (latestGeom) {
        const [lng, lat] = latestGeom.coordinates;
        eonetPtsList.push({
          lat, lng,
          size: 1.5,
          color: catId === "wildfires" ? "#ff4500" : catId === "volcanoes" ? "#ff8c00" : "#ff00ff",
          label: `[ ${s.title.toUpperCase()} ]`,
          type: "eonet",
          catId: catId,
          url: s.sources[0]?.url,
          desc: `CATEGORY: ${s.categories[0]?.title.toUpperCase()}\nDATE: ${new Date(latestGeom.date).toISOString()}`
        });
      }
    });

    const labelList: any[] = [];
    if (layers.labels) {
      Object.entries(countryCoords).forEach(([country, coords]: any) => {
        labelList.push({
          lat: coords.lat,
          lng: coords.lng,
          text: country.toUpperCase(),
        });
      });
    }

    const conflictPtsList: any[] = [];
    if (layers.conflicts) {
      conflicts.forEach(c => {
        conflictPtsList.push({
          lat: c.lat, lng: c.lng,
          size: 2,
          color: c.color,
          label: `[ ${c.title.toUpperCase()} ]`,
          type: "conflict",
          desc: c.desc
        });
        ringList.push({ lat: c.lat, lng: c.lng, color: c.color, maxR: 4, propagationSpeed: 0.5, repeatPeriod: 3000 });
      });
    }

    const flightPtsList: any[] = [];
    if (layers.flights) {
      flights.forEach(f => {
        flightPtsList.push({
          lat: f.lat, lng: f.lng,
          size: 0.8,
          color: "#00ff88",
          label: `[ FLIGHT: ${f.callsign || 'UNKNOWN'} ]`,
          type: "flight",
          desc: `ALT: ${f.altitude}m | VEL: ${f.velocity}m/s | ORG: ${f.country}`
        });
      });
    }

    return { points: pts, arcs: arcList, rings: ringList, labels: labelList, eonetPts: eonetPtsList, conflictPts: conflictPtsList, flightPts: flightPtsList };
  }, [news, quakes, layers, eonetEvents, conflicts, flights]);

  const [autoRotate, setAutoRotate] = useState(true);

  const focusTarget = (pt: any) => {
    if (!pt) return;
    setLockedInfo(pt);
    setHoveredInfo(pt);
    setAutoRotate(false); // Pause auto-rotation so user can inspect the target

    if (viewMode !== "3d") {
      setViewMode("3d");
    }

    setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: pt.lat, lng: pt.lng, altitude: 0.55 },
          1500
        );
      }
    }, 50);
  };

  useEffect(() => {
    if (viewMode === "3d" && globeRef.current) {
      globeRef.current.controls().autoRotate = autoRotate;
      globeRef.current.controls().autoRotateSpeed = 0.8;
    }
  }, [globeRef.current, viewMode, autoRotate]);

  return (
    <div className="flex h-full flex-col bg-[#020205] text-white overflow-hidden relative font-mono select-none">
      
      {/* ── MAP CONTAINER ── */}
      <div className="absolute inset-0 z-0 bg-[#020205]">
        {viewMode === "3d" ? (
          <Globe
            ref={globeRef}
            globeImageUrl={
              globeTheme === "tactical" 
                ? "//unpkg.com/three-globe/example/img/earth-dark.jpg"
                : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            }
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="#020205"
            atmosphereColor={globeTheme === "tactical" ? "#0055ff" : "#ffffff"}
            atmosphereAltitude={0.15}
            
            // Polygons (Osiris Wireframe Earth)
            polygonsData={layers.borders ? countriesGeo.features : []}
            polygonAltitude={0.005}
            polygonCapColor={() => "rgba(0, 20, 40, 0.2)"}
            polygonSideColor={() => "rgba(0, 255, 255, 0.02)"}
            polygonStrokeColor={() => "rgba(0, 243, 255, 0.3)"}
            
            // Points (Glowing nodes - flattened to surface)
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.005}
            pointRadius="size"
            pointsMerge={false}
            
            // Rings (Pulsing radar signals + active target lock reticle)
            ringsData={[
              ...rings,
              ...(lockedInfo ? [{
                lat: lockedInfo.lat,
                lng: lockedInfo.lng,
                color: "#f59e0b",
                maxR: 5,
                propagationSpeed: 2.5,
                repeatPeriod: 900
              }] : [])
            ]}
            ringColor="color"
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"

            // Arcs (Data Streams)
            arcsData={layers.arcs ? arcs : []}
            arcColor="color"
            arcDashLength={0.5}
            arcDashGap={1}
            arcDashAnimateTime={2000}
            arcAltitudeAutoScale={0.3}

            // Nation Labels
            labelsData={layers.labels ? labels : []}
            labelLat="lat"
            labelLng="lng"
            labelText="text"
            labelSize={0.4}
            labelDotRadius={0.3}
            labelColor={() => "rgba(245, 158, 11, 0.6)"}
            labelIncludeDot={false}
            labelResolution={2}
            labelAltitude={0.005}

            // EONET Alerts, Conflicts & Flights
            htmlElementsData={[...(eonetPts || []), ...(conflictPts || []), ...(flightPts || [])]}
            htmlLat="lat"
            htmlLng="lng"
            htmlElement={(d: any) => {
              const el = document.createElement('div');
              let innerHTML = '';
              const cat = d.catId;
              const type = d.type;
              
              if (type === "conflict") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <div class="absolute w-12 h-12 border border-[#ffff00] rounded-full opacity-20 group-hover:scale-110 group-hover:opacity-50 transition-all"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="group-hover:scale-125 transition-transform drop-shadow-[0_0_10px_rgba(255,255,0,1)]">
                      <polygon points="12 2 20 6 20 18 12 22 4 18 4 6" fill="none" stroke="#ffff00" stroke-width="1.5" stroke-dasharray="2 4"/>
                      <circle cx="12" cy="12" r="3" fill="#ffff00"/>
                      <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#ffff00" stroke-width="1.5"/>
                    </svg>
                  </div>
                `;
              } else if (type === "flight") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group" style="transform: rotate(${d.track || 45}deg);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="group-hover:scale-150 transition-all drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]">
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-1 1 2.5 4.5L13 22l1-1-1-3 3-3 5 6l1.2-.7c.4-.2.7-.6.6-1.1z" fill="none" stroke="#00ff88" stroke-width="2"/>
                    </svg>
                  </div>
                `;
              } else if (cat === "severeStorms") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <div class="absolute w-12 h-12 border border-dashed border-sky-300/40 rounded-full animate-[spin_8s_linear_infinite] group-hover:scale-125 transition-all"></div>
                    <div class="absolute w-7 h-7 bg-sky-400/10 rounded-full blur-[2px]"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" class="group-hover:scale-125 transition-transform animate-[spin_4s_linear_infinite] drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]">
                      <!-- Spiral Arm 1 -->
                      <path d="M12 2C8.5 2 4.5 5 4.5 9.5c0 3.2 2.5 5.8 5.5 6.5-1.8-1-2.5-2.8-2.5-4.5 0-3 2.5-5.5 5.5-5.5 2 0 3.8 1 4.8 2.5.5-3.5-2.3-6.5-5.8-6.5z" fill="#38bdf8" fill-opacity="0.85" stroke="#ffffff" stroke-width="0.8"/>
                      <!-- Spiral Arm 2 -->
                      <path d="M12 22c3.5 0 7.5-3 7.5-7.5 0-3.2-2.5-5.8-5.5-6.5 1.8 1 2.5 2.8 2.5 4.5 0 3-2.5 5.5-5.5 5.5-2 0-3.8-1-4.8-2.5-.5 3.5 2.3 6.5 5.8 6.5z" fill="#e0f2fe" fill-opacity="0.95" stroke="#38bdf8" stroke-width="0.8"/>
                      <!-- Eye of the Cyclone -->
                      <circle cx="12" cy="12" r="2" fill="#030712" stroke="#ffffff" stroke-width="1"/>
                    </svg>
                  </div>
                `;
              } else if (cat === "wildfires") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="group-hover:scale-125 transition-all drop-shadow-[0_0_12px_rgba(255,69,0,1)]">
                      <polygon points="12 1 22 21 2 21" stroke="#ff4500" stroke-width="1.5" fill="rgba(255,69,0,0.1)"/>
                      <path d="M12 18c-2 0-3-1.5-3-3 0-2 2-3 3-6 1 3 3 4 3 6 0 1.5-1 3-3 3z" fill="#ff4500"/>
                      <line x1="2" y1="21" x2="6" y2="21" stroke="#ff4500" stroke-width="2"/>
                      <line x1="18" y1="21" x2="22" y2="21" stroke="#ff4500" stroke-width="2"/>
                    </svg>
                  </div>
                `;
              } else if (cat === "volcanoes") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="group-hover:scale-125 transition-all drop-shadow-[0_0_10px_rgba(255,140,0,1)]">
                      <polygon points="3 20 10 9 14 9 21 20" stroke="#ff8c00" stroke-width="1.5" fill="rgba(255,140,0,0.2)"/>
                      <line x1="12" y1="9" x2="12" y2="20" stroke="#ff8c00" stroke-width="1.5" stroke-dasharray="2 2"/>
                      <circle cx="12" cy="5" r="1.5" fill="#ff8c00"/>
                      <circle cx="15" cy="3" r="1" fill="#ff8c00"/>
                      <circle cx="9" cy="2" r="1" fill="#ff8c00"/>
                      <line x1="0" y1="20" x2="24" y2="20" stroke="#ff8c00" stroke-width="1"/>
                    </svg>
                  </div>
                `;
              } else {
                innerHTML = `
                  <div class="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff] pointer-events-auto cursor-pointer"></div>
                `;
              }

              el.innerHTML = innerHTML;
              el.onclick = (e) => {
                e.stopPropagation();
                focusTarget(d);
              };
              el.onmouseenter = () => { if (!lockedInfo) setHoveredInfo(d); };
              el.onmouseleave = () => { if (!lockedInfo) setHoveredInfo(null); };
              return el;
            }}

            // Weather (Clouds)
            customLayerData={layers.weather ? [1] : []}
            customThreeObject={() => {
              const geometry = new THREE.SphereGeometry(100.5, 72, 72);
              const material = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load('//unpkg.com/three-globe/example/img/clouds.png'),
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false,
              });
              return new THREE.Mesh(geometry, material);
            }}

            onPointHover={(pt: any) => !lockedInfo && setHoveredInfo(pt)}
            onPointClick={(pt: any) => {
              if (pt === lockedInfo) {
                setLockedInfo(null);
              } else {
                focusTarget(pt);
              }
            }}
          />
        ) : (
          <Map2D points={points} onHover={setHoveredInfo} />
        )}
      </div>

      {/* ── OSIRIS HUD OVERLAYS ── */}
      
      {/* Target Crosshair removed per user request */}

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 4px)' }} />

      {/* HUD Frame */}
      <div className="absolute inset-4 pointer-events-none z-30 border border-cyan-900/30">
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />
      </div>

      <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-8">
        
        {/* Header & Left Sidebar */}
        <div className="flex flex-col gap-4 items-start pointer-events-none h-[calc(100vh-6rem)]">
          <div className="bg-[#0a0600]/90 p-3 border-l-2 border-amber-500 backdrop-blur-sm pointer-events-auto shrink-0 flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-amber-950/40 border border-amber-500/50" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
              <div className="absolute inset-0 border border-amber-400/30 animate-pulse" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <PocketKnife className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-[0.3em] text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                DAVI SWISS KNIFE
              </h1>
              <p className="text-[10px] text-amber-700 uppercase tracking-[0.4em] mt-0.5">
                GLOBAL SURVEILLANCE & INTEL MATRIX
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-64 pointer-events-auto custom-scrollbar flex-1 h-full">
            <div className="bg-[#020205]/80 border border-cyan-900/50 p-1 flex">
              <button onClick={() => setViewMode("2d")} className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest ${viewMode === "2d" ? "bg-cyan-950 text-cyan-300" : "text-cyan-900"}`}>[ 2D MAP ]</button>
              <button onClick={() => setViewMode("3d")} className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest ${viewMode === "3d" ? "bg-cyan-950 text-cyan-300" : "text-cyan-900"}`}>[ 3D GLOBE ]</button>
            </div>
            
            {viewMode === "3d" && (
              <div className="bg-[#020205]/80 border border-cyan-900/50 p-1 flex">
                <button onClick={() => setAutoRotate(!autoRotate)} className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest ${autoRotate ? "bg-cyan-950 text-cyan-300" : "text-cyan-900"}`}>
                  [ {autoRotate ? "AUTO-SPIN: ON" : "AUTO-SPIN: OFF"} ]
                </button>
              </div>
            )}

            <div className="bg-[#020205]/80 border border-cyan-900/50 p-3 flex flex-col gap-2 backdrop-blur-sm flex-1 overflow-y-auto custom-scrollbar">
              <div className="text-[8px] text-cyan-600 uppercase tracking-[0.3em] mb-1 sticky top-0 bg-[#020205] z-10 pb-1 border-b border-cyan-900/50">SYSTEM LAYERS</div>
              
              <button onClick={() => setGlobeTheme(t => t === "tactical" ? "satellite" : "tactical")} className="flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border border-cyan-900/30 hover:border-cyan-500 transition-colors">
                <span className="text-cyan-300">GLOBE TEXTURE</span>
                <span className="text-cyan-400">[{globeTheme.toUpperCase()}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, news: !l.news }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.news ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>INTEL STREAMS</span>
                <span>[{news.length}]</span>
              </button>
              
              <button onClick={() => setLayers(l => ({ ...l, quakes: !l.quakes }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.quakes ? "border-[#ff003c] text-[#ff003c]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>SEISMIC ACTIVITY</span>
                <span>[{quakes.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, borders: !l.borders }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.borders ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>NATION BORDERS</span>
                <span>[{layers.borders ? "ON" : "OFF"}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, labels: !l.labels }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.labels ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>NATION LABELS</span>
                <span>[{layers.labels ? "ON" : "OFF"}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, arcs: !l.arcs }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.arcs ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>DATA TRAJECTORIES</span>
                <span>[ON]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, weather: !l.weather }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.weather ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>CLOUD COVER (3D)</span>
                <span>[{layers.weather ? "ON" : "OFF"}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, storms: !l.storms }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.storms ? "border-[#38bdf8] text-[#38bdf8]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>STORMS & CYCLONES</span>
                <span>[{layers.storms ? "ON" : "OFF"}]</span>
              </button>
              
              <button onClick={() => setLayers(l => ({ ...l, fires: !l.fires }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.fires ? "border-[#ff4500] text-[#ff4500]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>WILDFIRES</span>
                <span>[{layers.fires ? "ON" : "OFF"}]</span>
              </button>
              
              <button onClick={() => setLayers(l => ({ ...l, volcanoes: !l.volcanoes }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.volcanoes ? "border-[#ff8c00] text-[#ff8c00]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>VOLCANOES</span>
                <span>[{layers.volcanoes ? "ON" : "OFF"}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, conflicts: !l.conflicts }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.conflicts ? "border-[#ffff00] text-[#ffff00]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>ARMED CONFLICTS</span>
                <span>[{conflictPts.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, flights: !l.flights }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.flights ? "border-[#00ff88] text-[#00ff88]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>FLIGHT RADAR (ADS-B)</span>
                <span>[{flights.length}]</span>
              </button>
            </div>

            {/* Target Telemetry (Embedded in Left Sidebar in Deus Ex Amber styling) */}
            <div className="bg-[#0a0600]/95 border border-amber-500/50 p-3 h-36 flex flex-col shrink-0">
              <div className="text-[9px] text-amber-500 tracking-[0.3em] font-bold border-b border-amber-900/60 pb-1 mb-2 flex justify-between items-center">
                <span>TARGET_TELEMETRY</span>
                <span className="text-[8px] text-amber-400 font-mono">
                  {lockedInfo ? "[LOCKED]" : hoveredInfo ? "[TRACKING]" : "[IDLE]"}
                </span>
              </div>

              {(lockedInfo || hoveredInfo) ? (
                <div className="flex-1 flex flex-col justify-between font-mono text-[9px]">
                  <div>
                    <div className="font-bold tracking-wider truncate" style={{ color: (lockedInfo || hoveredInfo)?.color }}>
                      {(lockedInfo || hoveredInfo)?.label}
                    </div>
                    <div className="text-amber-400/80 text-[8px] mt-0.5 line-clamp-2">
                      {(lockedInfo || hoveredInfo)?.desc}
                    </div>
                  </div>
                  <div className="text-amber-700 text-[8px] flex justify-between border-t border-amber-950/80 pt-1 mt-1">
                    <span>LAT: {(lockedInfo || hoveredInfo)?.lat.toFixed(4)}</span>
                    <span>LNG: {(lockedInfo || hoveredInfo)?.lng.toFixed(4)}</span>
                  </div>
                  {(lockedInfo || hoveredInfo)?.url && (
                    <button onClick={() => window.open((lockedInfo || hoveredInfo)?.url, "_blank")} className="text-[8px] text-amber-400 mt-1 hover:text-white transition-colors cursor-pointer block text-left underline">
                      &gt;&gt;&gt; CLICK TO INTERCEPT SIGNAL
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[9px] text-amber-900/60 tracking-widest text-center">
                  AWAITING TARGET LOCK...<br/>(CLICK ANY EVENT TO ZOOM)
                </div>
              )}
            </div>

          </div>
        </div>

        {/* EONET & Conflicts Alerts Sidebar (Right) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-[60vh] flex flex-col gap-2 pointer-events-auto">
          <div className="bg-[#020205]/80 border border-cyan-900/50 backdrop-blur-sm p-3 h-full flex flex-col custom-scrollbar overflow-y-auto">
            <div className="text-[10px] text-cyan-500 tracking-[0.3em] font-bold border-b border-cyan-900/50 pb-2 mb-2 flex justify-between items-center sticky top-0 bg-[#020205] z-10">
              <span>GLOBAL ALERTS</span>
              <span className="text-[#ff003c]">{eonetPts.length + conflictPts.length}</span>
            </div>
            
            {Object.entries({
              "ARMED CONFLICTS": conflictPts,
              "SEVERE STORMS": eonetPts.filter((p: any) => p.catId === "severeStorms"),
              "WILDFIRES": eonetPts.filter((p: any) => p.catId === "wildfires"),
              "VOLCANOES": eonetPts.filter((p: any) => p.catId === "volcanoes")
            }).map(([groupName, pts]) => {
              if (pts.length === 0) return null;
              const isOpen = openCategory === groupName;
              return (
                <div key={groupName} className="mb-2 border border-cyan-900/30 shrink-0">
                  <button 
                    onClick={() => setOpenCategory(isOpen ? null : groupName)}
                    className="w-full text-left p-2 bg-cyan-950/30 hover:bg-cyan-900/50 flex justify-between items-center transition-colors"
                  >
                    <span className="text-[9px] font-bold tracking-widest text-cyan-300">{groupName}</span>
                    <span className="text-[9px] text-cyan-600">[{pts.length}]</span>
                  </button>
                  {isOpen && (
                    <div className="p-1 flex flex-col gap-1 max-h-[30vh] overflow-y-auto custom-scrollbar bg-[#010103]">
                      {pts.map((pt: any, i: number) => {
                        const isSelected = lockedInfo?.lat === pt.lat && lockedInfo?.lng === pt.lng;
                        return (
                          <button key={i} className={`text-left group border p-2 transition-all shrink-0 ${isSelected ? "border-amber-500 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "border-cyan-900/20 hover:border-amber-500/60"}`}
                            onClick={() => focusTarget(pt)}
                          >
                            <div className="text-[8px] font-bold flex items-center justify-between" style={{ color: pt.color }}>
                              <span className="truncate">{pt.label}</span>
                              {isSelected && <span className="text-amber-400 text-[7px]">[LOCKED]</span>}
                            </div>
                            <div className="text-[7px] text-cyan-700 mt-1">{pt.desc.split('\n')[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pointer-events-none mt-auto pt-4">
          <div /> {/* Empty div to push Status block to the right */}
          {/* Status block */}
          <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <div className="flex items-center gap-2 bg-[#0a0600]/90 border border-amber-900/50 px-3 py-1">
              <Radio className="w-3 h-3 text-[#ff003c] animate-pulse" />
              <span className="text-[9px] text-amber-500 tracking-[0.3em]">SECURE UPLINK ESTABLISHED</span>
            </div>
            <div className="text-[7px] text-amber-800 tracking-[0.4em]">SYS.MEM: 4096TB // LATENCY: 12MS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
