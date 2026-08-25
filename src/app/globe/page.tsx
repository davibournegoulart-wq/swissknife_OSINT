"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Activity, Radio, Layers, Globe2, MapPin, Map, Crosshair, Terminal, Zap } from "lucide-react";
import countryCoords from "@/data/country_coords.json";
const countriesGeo = require("@/data/countries.geojson");

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
const Map2D = dynamic(() => import("@/components/Map2D"), { ssr: false });

interface NewsItem { title: string; link: string; pubDate: string; source: string; country: string; accentColor: string; }
export interface PointData { lat: number; lng: number; size: number; color: string; label: string; type: "news" | "quake"; url?: string; desc?: string; }

export default function GlobeMonitor() {
  const globeRef = useRef<any>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [quakes, setQuakes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [layers, setLayers] = useState({ news: true, quakes: true, borders: true, arcs: true });
  const [hoveredInfo, setHoveredInfo] = useState<PointData | null>(null);

  useEffect(() => {
    fetch("/api/news?limit=200").then(r => r.json()).then(d => setNews(d.articles || []));
    // Fetch only recent/ongoing earthquakes (past 24h)
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson")
      .then(r => r.json()).then(d => setQuakes((d.features || []).slice(0, 300)));
  }, []);

  const { points, arcs, rings } = useMemo(() => {
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
            size: 0.5 + (items.length * 0.1), // Increase radius size instead
            color: "#00f3ff",
            label: `[ ${country.toUpperCase()} ]`,
            type: "news" as const,
            url: items[0].link,
            desc: `LIVE: ${items.length} intel streams\n>>> ${items[0].title}`
          };
          pts.push(pt);
          ringList.push({ lat: coords.lat, lng: coords.lng, color: "#00f3ff", maxR: pt.size * 2, propagationSpeed: 1, repeatPeriod: 1000 });
          
          if (layers.arcs && Math.random() > 0.5) {
            arcList.push({
              startLat: coords.lat, startLng: coords.lng,
              endLat: 38.8951, endLng: -77.0364, // Route some data to DC hub
              color: ["rgba(0,243,255,0.1)", "rgba(0,243,255,0.8)"]
            });
          }
        }
      });
    }

    if (layers.quakes) {
      quakes.forEach(q => {
        const [lng, lat] = q.geometry.coordinates;
        const mag = q.properties.mag;
        pts.push({
          lat, lng,
          size: Math.max(0.3, (mag - 2) * 0.4), // Radius
          color: mag > 5 ? "#ff003c" : "#ff5500",
          label: `[ SEISMIC: M${mag} ]`,
          type: "quake",
          url: q.properties.url,
          desc: `LOC: ${q.properties.place}\nTIME: ${new Date(q.properties.time).toISOString()}`
        });
        if (mag > 4) {
          ringList.push({ lat, lng, color: "#ff003c", maxR: mag * 1.5, propagationSpeed: 2, repeatPeriod: 800 });
        }
      });
    }
    return { points: pts, arcs: arcList, rings: ringList };
  }, [news, quakes, layers]);

  useEffect(() => {
    if (viewMode === "3d" && globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.8;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    }
  }, [globeRef.current, viewMode]);

  return (
    <div className="flex h-full flex-col bg-[#020205] text-white overflow-hidden relative font-mono select-none">
      
      {/* ── MAP CONTAINER ── */}
      <div className="absolute inset-0 z-0 bg-[#020205]">
        {viewMode === "3d" ? (
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-water.png"
            backgroundColor="#020205"
            atmosphereColor="#0055ff"
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
            
            // Rings (Pulsing radar signals)
            ringsData={rings}
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

            onPointHover={(pt: any) => setHoveredInfo(pt)}
            onPointClick={(pt: any) => pt.url && window.open(pt.url, "_blank")}
          />
        ) : (
          <Map2D points={points} onHover={setHoveredInfo} />
        )}
      </div>

      {/* ── OSIRIS HUD OVERLAYS ── */}
      
      {/* Target Crosshair */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-20">
        <Crosshair className="w-96 h-96 text-cyan-500 stroke-[0.5px]" />
      </div>

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
        
        {/* Header */}
        <div className="flex items-start justify-between pointer-events-auto">
          <div className="bg-[#020205]/80 p-3 border-l-2 border-cyan-500 backdrop-blur-sm">
            <h1 className="text-xl font-black uppercase tracking-[0.3em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
              [ OSIRIS ENGINE ]
            </h1>
            <p className="text-[10px] text-cyan-800 uppercase tracking-[0.4em] mt-1">
              GLOBAL SURVEILLANCE & INTEL MATRIX
            </p>
          </div>

          <div className="flex flex-col gap-2 w-56">
            <div className="bg-[#020205]/80 border border-cyan-900/50 p-1 flex">
              <button onClick={() => setViewMode("2d")} className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest ${viewMode === "2d" ? "bg-cyan-950 text-cyan-300" : "text-cyan-900"}`}>[ 2D MAP ]</button>
              <button onClick={() => setViewMode("3d")} className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest ${viewMode === "3d" ? "bg-cyan-950 text-cyan-300" : "text-cyan-900"}`}>[ 3D GLOBE ]</button>
            </div>

            <div className="bg-[#020205]/80 border border-cyan-900/50 p-3 flex flex-col gap-2 backdrop-blur-sm">
              <div className="text-[8px] text-cyan-600 uppercase tracking-[0.3em] mb-1">SYSTEM LAYERS</div>
              
              <button onClick={() => setLayers(l => ({ ...l, news: !l.news }))} className={`flex items-center justify-between text-[9px] tracking-widest p-1.5 border ${layers.news ? "border-cyan-500 text-cyan-400" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>INTEL STREAMS</span>
                <span>[{news.length}]</span>
              </button>
              
              <button onClick={() => setLayers(l => ({ ...l, quakes: !l.quakes }))} className={`flex items-center justify-between text-[9px] tracking-widest p-1.5 border ${layers.quakes ? "border-[#ff003c] text-[#ff003c]" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>SEISMIC ACTIVITY</span>
                <span>[{quakes.length}]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, borders: !l.borders }))} className={`flex items-center justify-between text-[9px] tracking-widest p-1.5 border ${layers.borders ? "border-cyan-500/50 text-cyan-500/80" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>NATION BORDERS</span>
                <span>[ON]</span>
              </button>

              <button onClick={() => setLayers(l => ({ ...l, arcs: !l.arcs }))} className={`flex items-center justify-between text-[9px] tracking-widest p-1.5 border ${layers.arcs ? "border-cyan-500/50 text-cyan-500/80" : "border-cyan-900/30 text-cyan-900"}`}>
                <span>DATA TRAJECTORIES</span>
                <span>[ON]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pointer-events-auto">
          {/* Terminal / Target Lock */}
          <div className="w-80 h-32 bg-[#020205]/80 border border-cyan-900/50 p-3 backdrop-blur-sm relative flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
            
            <div className="flex items-center gap-2 text-[8px] text-cyan-600 tracking-[0.3em] mb-2 border-b border-cyan-900/50 pb-1">
              <Terminal className="w-3 h-3" />
              <span>TARGET_TELEMETRY</span>
            </div>

            {hoveredInfo ? (
              <div className="flex-1 overflow-hidden animate-[pulse_0.1s_ease-in-out]">
                <div className="text-[10px] text-white font-bold tracking-widest mb-1">{hoveredInfo.label}</div>
                <div className="text-[9px] text-cyan-400 leading-tight mb-2 whitespace-pre-wrap">{hoveredInfo.desc}</div>
                <div className="text-[8px] text-cyan-700">LAT: {hoveredInfo.lat.toFixed(4)} // LNG: {hoveredInfo.lng.toFixed(4)}</div>
                {hoveredInfo.url && <div className="text-[8px] text-[#ff003c] mt-1 animate-pulse">&gt;&gt;&gt; CLICK TO INTERCEPT SIGNAL</div>}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[9px] text-cyan-900 tracking-widest">
                AWAITING TARGET LOCK...
              </div>
            )}
          </div>
          
          {/* Status block */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-[#020205]/80 border border-cyan-900/50 px-3 py-1">
              <Radio className="w-3 h-3 text-[#ff003c] animate-pulse" />
              <span className="text-[9px] text-cyan-500 tracking-[0.3em]">SECURE UPLINK ESTABLISHED</span>
            </div>
            <div className="text-[7px] text-cyan-800 tracking-[0.4em]">SYS.MEM: 4096TB // LATENCY: 12MS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
