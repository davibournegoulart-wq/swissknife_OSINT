"use client";

import * as THREE from "three";
import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Activity, Radio, Layers, Globe2, MapPin, Map, Crosshair, 
  Terminal, Zap, PocketKnife, Search, Plane, ShieldAlert, 
  Crown, SlidersHorizontal, Compass, X, Filter, Anchor, Wifi, Sparkles
} from "lucide-react";
import countryCoords from "@/data/country_coords.json";
const countriesGeo = require("@/data/countries.json");

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
const Map2D = dynamic(() => import("@/components/Map2D"), { ssr: false });
import NewsDossierModal from "@/components/NewsDossierModal";

interface NewsItem { title: string; link: string; pubDate: string; source: string; country: string; accentColor: string; }
export interface PointData { lat: number; lng: number; size: number; color: string; label: string; type: "news" | "quake" | "conflict" | "flight" | "eonet" | "maritime" | "cyber"; url?: string; desc?: string; [key: string]: any; }

export default function GlobeMonitor() {
  const globeRef = useRef<any>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [quakes, setQuakes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [layers, setLayers] = useState({ 
    news: true, quakes: true, borders: true, arcs: true, labels: false, 
    weather: false, storms: true, fires: true, volcanoes: true, 
    conflicts: true, flights: true, maritime: true, cyber: true 
  });
  const [globeTheme, setGlobeTheme] = useState<"tactical" | "satellite">("tactical");
  const [hoveredInfo, setHoveredInfo] = useState<PointData | null>(null);
  const [lockedInfo, setLockedInfo] = useState<PointData | null>(null);
  const [eonetEvents, setEonetEvents] = useState<any[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>("TACTICAL AIR PATROLS");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [maritime, setMaritime] = useState<any[]>([]);
  const [cyber, setCyber] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [flightFilterType, setFlightFilterType] = useState<"all" | "military" | "commercial" | "vip">("all");
  const [flightSearch, setFlightSearch] = useState<string>("");
  const [showFlightFilters, setShowFlightFilters] = useState<boolean>(true);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [dossierTarget, setDossierTarget] = useState<any>(null);

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

    // Global Armed Conflicts & Warzones
    setConflicts([
      { lat: 48.3794, lng: 31.1656, title: "Russo-Ukrainian War", country: "Ukraine", desc: "Conventional warfare, missile strikes & frontlines", color: "#ffff00" },
      { lat: 31.5, lng: 34.466667, title: "Gaza Strip & Levant Conflict", country: "Israel", desc: "Active combat operations, airstrikes & border skirmishes", color: "#ffff00" },
      { lat: 15.5007, lng: 32.5599, title: "Sudan Civil War", country: "Sudan", desc: "Clashes between SAF and RSF paramilitary", color: "#ffff00" },
      { lat: 14.8, lng: 43.0, title: "Red Sea & Yemen Escalation", country: "Yemen", desc: "Houthi anti-ship missile & drone intercept operations", color: "#ffff00" },
      { lat: 19.0, lng: -72.25, title: "Haiti Gang Warfare & State Crisis", country: "Haiti", desc: "Armed gang turf wars & Port-au-Prince security lockdown", color: "#ffff00" },
      { lat: 12.0, lng: 15.0, title: "Sahel & Mali Insurgency", country: "Mali", desc: "Militant insurgency & counter-terror operations", color: "#ffff00" },
      { lat: 16.0, lng: 96.0, title: "Myanmar Civil War", country: "Myanmar", desc: "Junta military operations vs Ethnic Armed Alliances", color: "#ffff00" },
      { lat: -1.4558, lng: 29.3253, title: "Kivu Conflict (DRC)", country: "DR Congo", desc: "M23 rebel offensive & AFC clashes in North Kivu", color: "#ffff00" },
      { lat: 35.0, lng: 38.0, title: "Syria & Levant Clashes", country: "Syria", desc: "Insurgent activity & cross-border drone strikes", color: "#ffff00" },
      { lat: 38.3, lng: 127.1, title: "Korean Peninsula DMZ Alert", country: "South Korea", desc: "Heightened military readiness & ballistic tests", color: "#ffff00" }
    ]);

    // Strategic Maritime Chokepoints & Naval Security Zones
    setMaritime([
      { lat: 12.58, lng: 43.33, title: "Bab-el-Mandeb Strait", country: "Djibouti", desc: "High-threat maritime chokepoint / Anti-ship missile zone", color: "#00d2ff" },
      { lat: 26.56, lng: 56.25, title: "Strait of Hormuz", country: "Oman", desc: "Critical oil transit corridor / Naval surveillance patrol", color: "#00d2ff" },
      { lat: 1.43, lng: 102.89, title: "Malacca Strait Corridor", country: "Singapore", desc: "High-density commercial shipping channel & piracy watch", color: "#00d2ff" },
      { lat: 10.5, lng: 115.2, title: "Spratly Islands / South China Sea", country: "Philippines", desc: "Disputed maritime EEZ / Coast Guard standoff zone", color: "#00d2ff" },
      { lat: 24.2, lng: 119.8, title: "Taiwan Strait Maritime Median", country: "Taiwan", desc: "Naval patrol line & maritime exclusion surveillance", color: "#00d2ff" },
      { lat: 8.95, lng: -79.55, title: "Panama Canal Transit Gateway", country: "Panama", desc: "Global maritime canal operations & drought queue watch", color: "#00d2ff" }
    ]);

    // Critical Cyber Incidents & Subsea Infrastructure
    setCyber([
      { lat: 56.5, lng: 19.2, title: "Baltic Subsea Cable Watch (C-Lion1)", country: "Sweden", desc: "Undersea telecommunications cable sabotage investigation", color: "#a855f7" },
      { lat: 44.5, lng: 34.2, title: "Black Sea GPS/GNSS Spoofing Sector", country: "Ukraine", desc: "Severe electronic warfare & satellite navigation denial", color: "#a855f7" },
      { lat: 19.5, lng: 39.0, title: "Red Sea Subsea Fiber Junction", country: "Saudi Arabia", desc: "Undersea internet infrastructure alert & acoustic monitoring", color: "#a855f7" },
      { lat: 25.1, lng: 121.6, title: "Taiwan Subsea Cable Landing Hub", country: "Taiwan", desc: "Transpacific internet cable array security surveillance", color: "#a855f7" }
    ]);
  }, []);

  const { points, arcs, rings, labels, eonetPts, conflictPts, maritimePts, cyberPts, flightPts } = useMemo(() => {
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
          label: `[ ⚔️ ${c.title.toUpperCase()} ]`,
          title: c.title,
          country: c.country,
          type: "conflict",
          desc: c.desc
        });
        ringList.push({ lat: c.lat, lng: c.lng, color: c.color, maxR: 4, propagationSpeed: 0.5, repeatPeriod: 3000 });
      });
    }

    const maritimePtsList: any[] = [];
    if (layers.maritime) {
      maritime.forEach(m => {
        maritimePtsList.push({
          lat: m.lat, lng: m.lng,
          size: 1.8,
          color: m.color,
          label: `[ ⚓ ${m.title.toUpperCase()} ]`,
          title: m.title,
          country: m.country,
          type: "maritime",
          desc: m.desc
        });
        ringList.push({ lat: m.lat, lng: m.lng, color: m.color, maxR: 3.5, propagationSpeed: 0.8, repeatPeriod: 3500 });
      });
    }

    const cyberPtsList: any[] = [];
    if (layers.cyber) {
      cyber.forEach(cy => {
        cyberPtsList.push({
          lat: cy.lat, lng: cy.lng,
          size: 1.8,
          color: cy.color,
          label: `[ ⚡ ${cy.title.toUpperCase()} ]`,
          title: cy.title,
          country: cy.country,
          type: "cyber",
          desc: cy.desc
        });
        ringList.push({ lat: cy.lat, lng: cy.lng, color: cy.color, maxR: 3, propagationSpeed: 1.2, repeatPeriod: 2500 });
      });
    }

    const flightPtsList: any[] = [];
    if (layers.flights) {
      const filtered = flights.filter(f => {
        const matchesType = flightFilterType === "all" || f.type === flightFilterType;
        const matchesSearch = !flightSearch || 
          f.callsign.toLowerCase().includes(flightSearch.toLowerCase()) || 
          f.country.toLowerCase().includes(flightSearch.toLowerCase()) || 
          (f.aircraftType && f.aircraftType.toLowerCase().includes(flightSearch.toLowerCase())) ||
          (f.mission && f.mission.toLowerCase().includes(flightSearch.toLowerCase()));
        return matchesType && matchesSearch;
      });

      filtered.forEach(f => {
        const isMil = f.type === "military";
        const isVip = f.type === "vip";
        const color = isMil ? "#ff003c" : isVip ? "#ffd700" : "#00ff88";

        flightPtsList.push({
          lat: f.lat, 
          lng: f.lng,
          size: isMil ? 1.4 : isVip ? 1.1 : 0.8,
          color: color,
          label: isMil ? `[ ⚔️ MILITARY: ${f.callsign} ]` : isVip ? `[ 👑 VIP: ${f.callsign} ]` : `[ ✈️ FLIGHT: ${f.callsign} ]`,
          title: isMil ? `Military Patrol ${f.callsign}` : isVip ? `VIP Transport ${f.callsign}` : `Flight ${f.callsign}`,
          type: "flight",
          flightType: f.type,
          callsign: f.callsign,
          country: f.country,
          altitude: f.altitude,
          velocity: f.velocity,
          aircraftType: f.aircraftType || (isMil ? "Tactical Military Recon / Transport" : isVip ? "Private Jet" : "Commercial Airliner"),
          mission: f.mission,
          track: f.track,
          desc: `TYPE: ${f.aircraftType || f.type.toUpperCase()}${f.mission ? `\nMISSION: ${f.mission}` : ''}\nALT: ${f.altitude}m | VEL: ${f.velocity}m/s\nNATION / AFFILIATION: ${f.country.toUpperCase()}`
        });

        if (isMil) {
          ringList.push({ lat: f.lat, lng: f.lng, color: "#ff003c", maxR: 3, propagationSpeed: 1.5, repeatPeriod: 2000 });
        }
      });
    }

    return { 
      points: pts, 
      arcs: arcList, 
      rings: ringList, 
      labels: labelList, 
      eonetPts: eonetPtsList, 
      conflictPts: conflictPtsList, 
      maritimePts: maritimePtsList,
      cyberPts: cyberPtsList,
      flightPts: flightPtsList 
    };
  }, [news, quakes, layers, eonetEvents, conflicts, maritime, cyber, flights, flightFilterType, flightSearch]);

  const [autoRotate, setAutoRotate] = useState(true);

  const focusTarget = (pt: any) => {
    if (!pt) return;
    setLockedInfo(pt);
    setHoveredInfo(pt);
    setAutoRotate(false); // Pause auto-rotation so user can inspect the target

    if (viewMode === "3d" && globeRef.current) {
      globeRef.current.pointOfView(
        { lat: pt.lat, lng: pt.lng, altitude: 0.45 },
        1400
      );
    }
  };

  const openDossier = (pt: any) => {
    if (!pt) return;
    focusTarget(pt);
    setDossierTarget(pt);
    setIsDossierOpen(true);
  };

  // Keyboard shortcut listener: Press Space to open RAG Dossier on locked target
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isDossierOpen && (lockedInfo || hoveredInfo)) {
        e.preventDefault();
        openDossier(lockedInfo || hoveredInfo);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [lockedInfo, hoveredInfo, isDossierOpen]);

  const configureControls = () => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.8;
        controls.zoomSpeed = 1.8; // Fast, responsive zoom for trackpads and mouse wheel
        controls.rotateSpeed = 1.0;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 104; // Allows deep, close-up inspection
        controls.maxDistance = 550; // Fluid wide viewing bounds
      }
    }
  };

  useEffect(() => {
    if (viewMode === "3d") {
      configureControls();
    }
  }, [globeRef.current, viewMode, autoRotate]);

  return (
    <div className="flex h-full flex-col bg-[#020205] text-white overflow-hidden relative font-mono select-none">
      
      {/* ── MAP CONTAINER ── */}
      <div className="absolute inset-0 z-0 bg-[#020205]">
        {viewMode === "3d" ? (
          <Globe
            ref={globeRef}
            onGlobeReady={configureControls}
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

            // EONET Alerts, Conflicts, Maritime, Cyber & Flights
            htmlElementsData={[
              ...(eonetPts || []), 
              ...(conflictPts || []), 
              ...(maritimePts || []),
              ...(cyberPts || []),
              ...(flightPts || [])
            ]}
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
              } else if (type === "maritime") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <!-- Outer Sonar Radar Aura -->
                    <div class="absolute w-12 h-12 border border-dashed border-[#00f0ff]/40 rounded-full animate-[spin_10s_linear_infinite] group-hover:scale-125 transition-all pointer-events-none"></div>
                    <div class="absolute w-8 h-8 bg-[#00f0ff]/10 rounded-full blur-[2px]"></div>

                    <!-- Beautifully Crafted Tactical Naval Anchor SVG -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" class="group-hover:scale-125 transition-transform drop-shadow-[0_0_12px_rgba(0,240,255,0.95)]">
                      <!-- Top Shackle & Ring -->
                      <circle cx="16" cy="6.5" r="3.2" fill="none" stroke="#00f0ff" stroke-width="1.8"/>
                      <circle cx="16" cy="6.5" r="1.2" fill="#020817"/>
                      <line x1="16" y1="9.7" x2="16" y2="12" stroke="#00f0ff" stroke-width="2"/>

                      <!-- Cross Stock with End Studs -->
                      <path d="M8 12.5H24" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
                      <circle cx="8" cy="12.5" r="1.5" fill="#00f0ff"/>
                      <circle cx="24" cy="12.5" r="1.5" fill="#00f0ff"/>

                      <!-- Central Fluted Shank -->
                      <line x1="16" y1="12" x2="16" y2="26" stroke="#00f0ff" stroke-width="2.2"/>
                      <circle cx="16" cy="19" r="1" fill="#ffffff"/>

                      <!-- Sweeping Arms & Barbed Flukes (Palms) -->
                      <path d="M5.5 20C6.5 26.5 11 28.5 16 28.5C21 28.5 25.5 26.5 26.5 20" fill="none" stroke="#00f0ff" stroke-width="2.2" stroke-linecap="round"/>
                      
                      <!-- Left Fluke (Sharp Arrowhead) -->
                      <polygon points="5.5,17 3,21.5 8,20.5" fill="#00f0ff" stroke="#00f0ff" stroke-width="0.8"/>
                      
                      <!-- Right Fluke (Sharp Arrowhead) -->
                      <polygon points="26.5,17 29,21.5 24,20.5" fill="#00f0ff" stroke="#00f0ff" stroke-width="0.8"/>
                      
                      <!-- Bottom Crown Keystone -->
                      <polygon points="16,26.5 18,29 16,30.5 14,29" fill="#00f0ff"/>
                    </svg>
                  </div>
                `;
              } else if (type === "cyber") {
                innerHTML = `
                  <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group">
                    <div class="absolute w-10 h-10 border border-[#a855f7] rounded-full opacity-30 animate-ping"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="group-hover:scale-125 transition-transform drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(168,85,247,0.3)" stroke="#a855f7" stroke-width="1.8"/>
                    </svg>
                  </div>
                `;
              } else if (type === "flight") {
                const isMil = d.flightType === "military";
                const isVip = d.flightType === "vip";
                const color = isMil ? "#ff003c" : isVip ? "#ffd700" : "#00ff88";
                const dropShadow = isMil 
                  ? "drop-shadow-[0_0_12px_rgba(255,0,60,1)]" 
                  : isVip 
                  ? "drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]" 
                  : "drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]";

                if (isMil) {
                  // Stealth Bomber / Fighter Delta-wing Icon for Military Units
                  innerHTML = `
                    <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group" style="transform: rotate(${d.track || 45}deg);">
                      <div class="absolute w-8 h-8 border border-dashed border-[#ff003c]/60 rounded-full animate-ping pointer-events-none"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="group-hover:scale-150 transition-all ${dropShadow}">
                        <path d="M12 2L2 20L12 16L22 20L12 2Z" fill="rgba(255,0,60,0.35)" stroke="#ff003c" stroke-width="1.8" stroke-linejoin="round"/>
                        <circle cx="12" cy="11" r="1.5" fill="#ffffff"/>
                      </svg>
                      <div class="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 border border-[#ff003c] text-[#ff003c] text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-xs pointer-events-none whitespace-nowrap z-50">
                        ${d.label}
                      </div>
                    </div>
                  `;
                } else if (isVip) {
                  // Executive Sleek Private Jet Icon for VIPs
                  innerHTML = `
                    <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group" style="transform: rotate(${d.track || 45}deg);">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class="group-hover:scale-150 transition-all ${dropShadow}">
                        <path d="M12 2L15 8L22 13L15 14L14 22L12 18L10 22L9 14L2 13L9 8L12 2Z" fill="rgba(255,215,0,0.25)" stroke="#ffd700" stroke-width="1.6"/>
                      </svg>
                    </div>
                  `;
                } else {
                  // Commercial Airliner Icon
                  innerHTML = `
                    <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer group" style="transform: rotate(${d.track || 45}deg);">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="group-hover:scale-150 transition-all ${dropShadow}">
                        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-1 1 2.5 4.5L13 22l1-1-1-3 3-3 5 6l1.2-.7c.4-.2.7-.6.6-1.1z" fill="rgba(0,255,136,0.15)" stroke="#00ff88" stroke-width="1.8"/>
                      </svg>
                    </div>
                  `;
                }
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
                openDossier(d);
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
              openDossier(pt);
            }}
          />
        ) : (
          <Map2D 
            points={points} 
            allEvents={[
              ...(points || []), 
              ...(eonetPts || []), 
              ...(conflictPts || []), 
              ...(maritimePts || []), 
              ...(cyberPts || []), 
              ...(flightPts || [])
            ]}
            theme={globeTheme}
            target={lockedInfo}
            onHover={setHoveredInfo}
            onSelect={openDossier}
          />
        )}
      </div>

      {/* ── OSIRIS HUD OVERLAYS ── */}
      
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
              <div className="absolute inset-0 border border-amber-400/40 animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }} />
              <PocketKnife className="w-5 h-5 text-amber-400 relative z-10" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-500 tracking-[0.2em] flex items-center gap-2">
                <span>DAVI SWISS KNIFE</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono">OSINT_CORE</span>
              </div>
              <div className="text-[8px] text-amber-600/80 tracking-[0.3em] font-mono">GLOBAL SURVEILLANCE &amp; INTEL MATRIX</div>
            </div>
          </div>

          {/* Left Sub-Matrix (Controls & Telemetry) */}
          <div className="flex flex-col gap-2 w-64 pointer-events-auto flex-1 min-h-0">
            
            {/* View Mode Toggle */}
            <div className="bg-[#020205]/80 border border-cyan-900/50 p-1.5 flex gap-1 backdrop-blur-sm shrink-0">
              <button 
                onClick={() => setViewMode("2d")}
                className={`flex-1 py-1 text-[9px] tracking-widest border transition-all ${viewMode === "2d" ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_10px_rgba(0,243,255,0.3)]" : "border-cyan-900/30 text-cyan-700 hover:text-cyan-400"}`}
              >
                [ 2D MAP ]
              </button>
              <button 
                onClick={() => setViewMode("3d")}
                className={`flex-1 py-1 text-[9px] tracking-widest border transition-all ${viewMode === "3d" ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_10px_rgba(0,243,255,0.3)]" : "border-cyan-900/30 text-cyan-700 hover:text-cyan-400"}`}
              >
                [ 3D GLOBE ]
              </button>
            </div>

            {/* Layer Toggles */}
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

              <button onClick={() => setLayers(l => ({ ...l, conflicts: !l.conflicts }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.conflicts ? "border-[#ffff00] text-[#ffff00]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>ARMED CONFLICTS</span>
                <span>[{conflictPts.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, maritime: !l.maritime }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.maritime ? "border-[#00d2ff] text-[#00d2ff]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>MARITIME CHOKEPOINTS</span>
                <span>[{maritimePts.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, cyber: !l.cyber }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.cyber ? "border-[#a855f7] text-[#a855f7]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>CYBER &amp; SUBSEA</span>
                <span>[{cyberPts.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, storms: !l.storms }))} className={`flex items-center justify-between shrink-0 text-[9px] tracking-widest p-1.5 border ${layers.storms ? "border-[#38bdf8] text-[#38bdf8]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>STORMS &amp; CYCLONES</span>
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

              {/* Flight Radar Master Toggle */}
              <div className="border border-cyan-900/40 bg-black/40 p-1.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setLayers(l => ({ ...l, flights: !l.flights }))} 
                    className={`flex-1 text-left flex items-center justify-between text-[9px] tracking-widest p-1 border ${layers.flights ? "border-[#00ff88] text-[#00ff88]" : "border-cyan-900/30 text-cyan-900"}`}
                  >
                    <span className="flex items-center gap-1">
                      <Plane className="w-3 h-3" /> FLIGHT RADAR (ADS-B)
                    </span>
                    <span>[{flightPts.length}/{flights.length}]</span>
                  </button>
                  <button 
                    onClick={() => setShowFlightFilters(!showFlightFilters)}
                    className={`ml-1 p-1 text-[8px] border transition-colors ${showFlightFilters ? "border-cyan-400 text-cyan-300 bg-cyan-950/60" : "border-cyan-900/50 text-cyan-600 hover:text-cyan-300"}`}
                    title="Toggle Radar Filters"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                  </button>
                </div>

                {/* Interactive Flight Filter Sub-Panel */}
                {layers.flights && showFlightFilters && (
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-cyan-900/40 bg-black/60 p-1.5">
                    {/* Search Callsign / Unit / Country */}
                    <div className="relative flex items-center">
                      <Search className="w-2.5 h-2.5 absolute left-1.5 text-cyan-500 pointer-events-none" />
                      <input 
                        type="text" 
                        value={flightSearch}
                        onChange={(e) => setFlightSearch(e.target.value)}
                        placeholder="SEARCH CALLSIGN / UNIT..."
                        className="w-full bg-[#030610] border border-cyan-700/60 pl-5 pr-4 py-1 text-[8px] text-cyan-200 placeholder:text-cyan-800 focus:outline-none focus:border-cyan-400 font-mono uppercase"
                      />
                      {flightSearch && (
                        <button onClick={() => setFlightSearch("")} className="absolute right-1 text-cyan-600 hover:text-cyan-300">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Flight Class Filters */}
                    <div className="grid grid-cols-2 gap-1 text-[8px]">
                      <button 
                        onClick={() => setFlightFilterType("all")} 
                        className={`p-1 border text-center font-bold tracking-wider transition-colors ${flightFilterType === "all" ? "border-cyan-400 bg-cyan-950/80 text-cyan-200" : "border-cyan-900/40 text-cyan-700 hover:text-cyan-400"}`}
                      >
                        ALL ({flights.length})
                      </button>
                      <button 
                        onClick={() => setFlightFilterType("military")} 
                        className={`p-1 border text-center font-bold tracking-wider flex items-center justify-center gap-1 transition-colors ${flightFilterType === "military" ? "border-[#ff003c] bg-[#ff003c]/25 text-[#ff003c]" : "border-cyan-900/40 text-cyan-700 hover:text-[#ff003c]"}`}
                      >
                        <ShieldAlert className="w-2.5 h-2.5" /> MILITARY ({flights.filter(f => f.type === "military").length})
                      </button>
                      <button 
                        onClick={() => setFlightFilterType("commercial")} 
                        className={`p-1 border text-center font-bold tracking-wider transition-colors ${flightFilterType === "commercial" ? "border-[#00ff88] bg-[#00ff88]/25 text-[#00ff88]" : "border-cyan-900/40 text-cyan-700 hover:text-[#00ff88]"}`}
                      >
                        AIRLINERS ({flights.filter(f => f.type === "commercial").length})
                      </button>
                      <button 
                        onClick={() => setFlightFilterType("vip")} 
                        className={`p-1 border text-center font-bold tracking-wider flex items-center justify-center gap-1 transition-colors ${flightFilterType === "vip" ? "border-[#ffd700] bg-[#ffd700]/25 text-[#ffd700]" : "border-cyan-900/40 text-cyan-700 hover:text-[#ffd700]"}`}
                      >
                        <Crown className="w-2.5 h-2.5" /> VIP ({flights.filter(f => f.type === "vip").length})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Telemetry (Embedded in Left Sidebar in Deus Ex Amber styling) */}
            <div className="bg-[#0a0600]/95 border border-amber-500/50 p-3 h-44 flex flex-col shrink-0">
              <div className="text-[9px] text-amber-500 tracking-[0.3em] font-bold border-b border-amber-900/60 pb-1 mb-1.5 flex justify-between items-center">
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
                  
                  {/* Button to Open RAG Dossier */}
                  <button 
                    onClick={() => openDossier(lockedInfo || hoveredInfo)}
                    className="w-full mt-1.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500 text-amber-300 text-[8px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" /> OPEN RAG INTEL DOSSIER (3D)
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[9px] text-amber-900/60 tracking-widest text-center">
                  AWAITING TARGET LOCK...<br/>(CLICK ANY EVENT TO INTERCEPT)
                </div>
              )}
            </div>

          </div>
        </div>

        {/* EONET, Conflicts, Maritime, Cyber & Flights Alerts Sidebar (Right) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-[65vh] flex flex-col gap-2 pointer-events-auto">
          <div className="bg-[#020205]/80 border border-cyan-900/50 backdrop-blur-sm p-3 h-full flex flex-col custom-scrollbar overflow-y-auto">
            <div className="text-[10px] text-cyan-500 tracking-[0.3em] font-bold border-b border-cyan-900/50 pb-2 mb-2 flex justify-between items-center sticky top-0 bg-[#020205] z-10">
              <span>GLOBAL ALERTS</span>
              <span className="text-[#ff003c]">
                {eonetPts.length + conflictPts.length + maritimePts.length + cyberPts.length + flightPts.filter((p: any) => p.flightType === "military").length}
              </span>
            </div>
            
            {Object.entries({
              "TACTICAL AIR PATROLS": flightPts.filter((p: any) => p.flightType === "military"),
              "ARMED CONFLICTS": conflictPts,
              "MARITIME CHOKEPOINTS": maritimePts,
              "CYBER & SUBSEA": cyberPts,
              "SEVERE STORMS": eonetPts.filter((p: any) => p.catId === "severeStorms"),
              "WILDFIRES": eonetPts.filter((p: any) => p.catId === "wildfires"),
              "VOLCANOES": eonetPts.filter((p: any) => p.catId === "volcanoes"),
              "VIP FLIGHTS": flightPts.filter((p: any) => p.flightType === "vip")
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
                          <button key={i} className={`text-left group border p-2 transition-all shrink-0 cursor-pointer ${isSelected ? "border-amber-500 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "border-cyan-900/20 hover:border-amber-500/60"}`}
                            onClick={() => openDossier(pt)}
                          >
                            <div className="text-[8px] font-bold flex items-center justify-between" style={{ color: pt.color }}>
                              <span className="truncate">{pt.label}</span>
                              {isSelected && <span className="text-amber-400 text-[7px]">[LOCKED]</span>}
                            </div>
                            <div className="text-[7px] text-cyan-700 mt-1">{pt.desc ? pt.desc.split('\n')[0] : ''}</div>
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

        {/* Footer & Floating Situation Summary HUD */}
        <div className="flex items-end justify-between pointer-events-none mt-auto pt-4 relative">
          
          {/* Left spacing */}
          <div className="w-64" />

          {/* Prominent Floating Tactical Situation Briefing Card (Bottom Center) */}
          {(lockedInfo || hoveredInfo) && (
            <div className="pointer-events-auto max-w-xl w-full mx-4 bg-[#0a0600]/95 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] p-3 rounded-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: (lockedInfo || hoveredInfo)?.color || "#f59e0b" }} />
                  <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400">
                    SITUATION_RESUME // {((lockedInfo || hoveredInfo)?.type || 'INTEL').toUpperCase()}
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 bg-amber-950 border border-amber-500/60 text-amber-300 font-mono">
                    {lockedInfo ? "LOCKED" : "TRACKING"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[9px] text-amber-600 font-mono">
                  <span>LAT: {(lockedInfo || hoveredInfo)?.lat?.toFixed(4)}</span>
                  <span>LNG: {(lockedInfo || hoveredInfo)?.lng?.toFixed(4)}</span>
                  {lockedInfo && (
                    <button 
                      onClick={() => { setLockedInfo(null); setHoveredInfo(null); }}
                      className="text-amber-500 hover:text-white border border-amber-900/60 px-1 py-0.2 cursor-pointer"
                    >
                      [UNLOCK]
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Detailed Resume */}
              <div className="flex flex-col gap-1">
                <h3 className="text-xs sm:text-sm font-bold tracking-wide" style={{ color: (lockedInfo || hoveredInfo)?.color }}>
                  {(lockedInfo || hoveredInfo)?.label || (lockedInfo || hoveredInfo)?.title}
                </h3>
                <p className="text-[10px] text-amber-200/90 font-sans leading-relaxed">
                  {(lockedInfo || hoveredInfo)?.desc || "Active operational incident being monitored by global telemetry feeds."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 pt-2 border-t border-amber-950/80 flex items-center justify-between gap-2">
                <button 
                  onClick={() => openDossier(lockedInfo || hoveredInfo)}
                  className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 hover:text-white text-[9px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" /> OPEN 3D RAG NEWS DOSSIER [SPACE]
                </button>

                {(lockedInfo || hoveredInfo)?.url && (
                  <a 
                    href={(lockedInfo || hoveredInfo)?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[9px] tracking-widest font-bold transition-colors"
                  >
                    DISPATCH &gt;&gt;&gt;
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Right Status block */}
          <div className="flex flex-col items-end gap-1 pointer-events-auto ml-auto">
            <div className="flex items-center gap-2 bg-[#0a0600]/90 border border-amber-900/50 px-3 py-1">
              <Radio className="w-3 h-3 text-[#ff003c] animate-pulse" />
              <span className="text-[9px] text-amber-500 tracking-[0.3em]">SECURE UPLINK ESTABLISHED</span>
            </div>
            <div className="text-[7px] text-amber-800 tracking-[0.4em]">SYS.MEM: 4096TB // LATENCY: 12MS</div>
          </div>
        </div>
      </div>

      {/* 3D Holographic RAG News Dossier Modal */}
      <NewsDossierModal 
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        target={dossierTarget || lockedInfo}
        allNews={news as any}
      />
    </div>
  );
}
