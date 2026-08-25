"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Activity, Radio, AlertTriangle, Layers, Globe2, MapPin, Zap } from "lucide-react";
import countryCoords from "@/data/country_coords.json";

// Import Globe dynamically since it requires window
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  country: string;
  accentColor: string;
}

interface PointData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  type: "news" | "quake";
  url?: string;
  desc?: string;
}

export default function GlobeMonitor() {
  const globeRef = useRef<any>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [quakes, setQuakes] = useState<any[]>([]);
  
  const [layers, setLayers] = useState({
    news: true,
    quakes: true,
    weather: false
  });

  const [hoveredInfo, setHoveredInfo] = useState<PointData | null>(null);

  // Fetch News from our API
  useEffect(() => {
    fetch("/api/news?limit=150")
      .then(r => r.json())
      .then(d => setNews(d.articles || []))
      .catch(console.error);
  }, []);

  // Fetch Earthquakes (M2.5+ past 7 days)
  useEffect(() => {
    fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson")
      .then(r => r.json())
      .then(d => {
        setQuakes((d.features || []).slice(0, 500));
      })
      .catch(console.error);
  }, []);

  // Prepare points
  const pointsData = useMemo(() => {
    const pts: PointData[] = [];

    if (layers.news) {
      // Group news by country to avoid rendering 100 points on exactly the same lat/lng
      const countryNews: Record<string, NewsItem[]> = {};
      news.forEach(n => {
        if (!countryNews[n.country]) countryNews[n.country] = [];
        countryNews[n.country].push(n);
      });

      Object.entries(countryNews).forEach(([country, items]) => {
        const coords = (countryCoords as any)[country] || (countryCoords as any)[country.replace("The ", "")];
        if (coords) {
          pts.push({
            lat: coords.lat,
            lng: coords.lng,
            size: 0.15 + (items.length * 0.02),
            color: items[0].accentColor || "#ef4444",
            label: `${country} (${items.length} live reports)\n${items[0].title}`,
            type: "news",
            url: items[0].link,
            desc: `Source: ${items[0].source} | ${new Date(items[0].pubDate).toLocaleTimeString()}`
          });
        }
      });
    }

    if (layers.quakes) {
      quakes.forEach(q => {
        const [lng, lat] = q.geometry.coordinates;
        const mag = q.properties.mag;
        pts.push({
          lat,
          lng,
          size: Math.max(0.1, (mag - 2) * 0.15),
          color: mag > 5 ? "#ef4444" : mag > 4 ? "#f97316" : "#eab308",
          label: `M${mag} Earthquake`,
          type: "quake",
          url: q.properties.url,
          desc: `${q.properties.place} | ${new Date(q.properties.time).toLocaleString()}`
        });
      });
    }

    return pts;
  }, [news, quakes, layers]);

  // Initial rotation
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, [globeRef.current]);

  return (
    <div className="flex h-full flex-col bg-[#050505] text-white overflow-hidden relative">
      
      {/* ── GLOBE CONTAINER ── */}
      <div className="absolute inset-0 z-0">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="size"
          pointRadius="size"
          pointsMerge={true}
          onPointHover={(pt: any) => setHoveredInfo(pt)}
          onPointClick={(pt: any) => pt.url && window.open(pt.url, "_blank")}
          atmosphereColor="#00f3ff"
          atmosphereAltitude={0.15}
        />
      </div>

      {/* ── UI OVERLAYS ── */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pointer-events-auto">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              SHOMER GEO-PULSE
            </h1>
            <p className="text-xs font-mono text-cyan-800 uppercase tracking-widest mt-1">
              Global Event & Seismic Monitoring
            </p>
          </div>

          {/* Layer Controls */}
          <div className="bg-[#0a0a12]/80 border border-cyan-900/50 backdrop-blur-md p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Active Layers</span>
            </div>
            
            <button 
              onClick={() => setLayers(l => ({ ...l, news: !l.news }))}
              className={`flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 border transition-all ${layers.news ? "bg-red-950/40 border-red-500/50 text-red-400" : "border-transparent text-neutral-500 hover:border-neutral-800"}`}
            >
              <div className="flex items-center gap-2"><Globe2 className="w-3 h-3" /> Live News</div>
              <span>[{news.length}]</span>
            </button>
            
            <button 
              onClick={() => setLayers(l => ({ ...l, quakes: !l.quakes }))}
              className={`flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-wider px-2 py-1.5 border transition-all ${layers.quakes ? "bg-orange-950/40 border-orange-500/50 text-orange-400" : "border-transparent text-neutral-500 hover:border-neutral-800"}`}
            >
              <div className="flex items-center gap-2"><Activity className="w-3 h-3" /> Earthquakes</div>
              <span>[{quakes.length}]</span>
            </button>
          </div>
        </div>

        {/* Hover Info Panel */}
        <div className="flex items-end justify-between pointer-events-auto">
          {hoveredInfo ? (
            <div className="bg-[#0a0a12]/90 border border-cyan-500/50 p-4 max-w-sm backdrop-blur-md animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center gap-2 mb-2">
                {hoveredInfo.type === 'news' ? (
                  <span className="px-1.5 py-0.5 bg-red-600 text-[8px] font-black uppercase text-white">NEWS INTEL</span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-orange-600 text-[8px] font-black uppercase text-white animate-pulse">SEISMIC</span>
                )}
                <span className="text-[9px] font-mono text-cyan-600">{hoveredInfo.lat.toFixed(2)}, {hoveredInfo.lng.toFixed(2)}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 leading-snug">{hoveredInfo.label}</h3>
              <p className="text-[10px] font-mono text-cyan-400/70">{hoveredInfo.desc}</p>
              {hoveredInfo.url && (
                <p className="text-[8px] font-mono text-neutral-500 mt-2 uppercase">Click marker to open source</p>
              )}
            </div>
          ) : (
            <div className="bg-[#0a0a12]/50 border border-neutral-800/50 p-4 max-w-sm backdrop-blur-md">
              <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-mono uppercase tracking-widest">
                <MapPin className="w-3 h-3" />
                Hover over a node for telemetry
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-[#0a0a12]/80 border border-cyan-900/30 px-3 py-1.5 backdrop-blur-md">
            <Radio className="w-3 h-3 text-cyan-500 animate-pulse" />
            <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
