"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Camera, X, Globe, MapPin, ExternalLink, Search, 
  Filter, Grid, Maximize2, Radio, Sparkles, Navigation, 
  Clock, ShieldAlert, Video, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { PUBLIC_CAMERAS, PublicCamera } from "@/data/publicCameras";
import { sfx } from "@/utils/sfxEngine";

interface PublicCamerasModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCamera?: PublicCamera | null;
  onFocusCameraOnMap?: (cam: PublicCamera) => void;
}

export default function PublicCamerasModal({
  isOpen,
  onClose,
  selectedCamera,
  onFocusCameraOnMap
}: PublicCamerasModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeRegion, setActiveRegion] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCamId, setActiveCamId] = useState<string>(PUBLIC_CAMERAS[0].id);
  const [viewLayout, setViewLayout] = useState<"spotlight" | "grid">("spotlight");

  // Sync with selectedCamera if provided by parent click
  useEffect(() => {
    if (selectedCamera) {
      setActiveCamId(selectedCamera.id);
      setViewLayout("spotlight");
    }
  }, [selectedCamera]);

  const categories = ["ALL", "Strategic Chokepoints", "Metropolises", "Volcanoes & Nature", "Maritime Ports", "Space & Orbit"];
  const regions = ["ALL", "Americas", "Europe", "Asia-Pacific", "Middle East & Africa", "Global"];

  const filteredCameras = useMemo(() => {
    return PUBLIC_CAMERAS.filter(cam => {
      const matchCat = activeCategory === "ALL" || cam.category === activeCategory;
      const matchRegion = activeRegion === "ALL" || cam.region === activeRegion;
      const matchSearch = !searchQuery || 
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.operator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchRegion && matchSearch;
    });
  }, [activeCategory, activeRegion, searchQuery]);

  const currentCam = useMemo(() => {
    return PUBLIC_CAMERAS.find(c => c.id === activeCamId) || filteredCameras[0] || PUBLIC_CAMERAS[0];
  }, [activeCamId, filteredCameras]);

  // Compute local time for the current camera
  const localTime = useMemo(() => {
    try {
      return new Date().toLocaleTimeString("en-US", {
        timeZone: currentCam.timezone || "UTC",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return new Date().toISOString().substring(11, 19) + " UTC";
    }
  }, [currentCam]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono text-cyan-300">
      
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Command Console Container */}
      <div className="relative z-10 w-full max-w-6xl h-full bg-[#02050e]/95 border-2 border-cyan-500/70 shadow-[0_0_60px_rgba(0,243,255,0.25)] rounded-sm flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#020714] border-b border-cyan-500/40 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.4)]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.25em] text-white">
                  PUBLIC GLOBAL CAMERAS // CCTV &amp; SATELLITE MATRIX
                </span>
                <span className="text-[8px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold animate-pulse">
                  ● {PUBLIC_CAMERAS.length} CHANNELS ONLINE
                </span>
              </div>
              <p className="text-[8px] text-cyan-600 tracking-wider">
                LIVE 24/7 OPTICAL SURVEILLANCE &bull; STRATEGIC CHOKEPOINTS &bull; VOLCANO OBSERVATORIES &bull; WORLD METROPOLISES
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-black/60 border border-cyan-900/60 p-0.5 flex gap-1 text-[9px]">
              <button 
                onClick={() => { sfx.playClick(); setViewLayout("spotlight"); }}
                className={`px-2 py-0.5 flex items-center gap-1 transition-all ${viewLayout === "spotlight" ? "bg-cyan-950 border border-cyan-400 text-cyan-200" : "text-cyan-600 hover:text-cyan-300"}`}
              >
                <Maximize2 className="w-3 h-3" /> SPOTLIGHT
              </button>
              <button 
                onClick={() => { sfx.playClick(); setViewLayout("grid"); }}
                className={`px-2 py-0.5 flex items-center gap-1 transition-all ${viewLayout === "grid" ? "bg-cyan-950 border border-cyan-400 text-cyan-200" : "text-cyan-600 hover:text-cyan-300"}`}
              >
                <Grid className="w-3 h-3" /> 4X CCTV WALL
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1 border border-cyan-900/60 hover:border-amber-400 hover:text-amber-400 text-cyan-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-[#030a1c] border-b border-cyan-900/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[9px] shrink-0">
          
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-cyan-600 font-bold mr-1">CATEGORY:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { sfx.playClick(); setActiveCategory(cat); }}
                className={`px-2 py-0.5 border text-[8px] font-bold tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat 
                    ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_8px_rgba(0,243,255,0.3)]" 
                    : "border-cyan-900/40 bg-black/40 text-cyan-700 hover:text-cyan-300"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center w-full sm:w-56">
            <Search className="w-3 h-3 absolute left-2 text-cyan-600 pointer-events-none" />
            <input 
              type="text"
              placeholder="SEARCH CAMERAS / CITIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#01040a] border border-cyan-900/80 focus:border-cyan-400 text-cyan-200 text-[8px] pl-6 pr-2 py-1 placeholder:text-cyan-800 outline-none"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Camera Directory & Thumbnail List */}
          <div className="w-full md:w-72 bg-[#02050c] border-r border-cyan-900/60 flex flex-col shrink-0 min-h-0">
            <div className="p-2 border-b border-cyan-900/50 flex items-center justify-between text-[8px] text-cyan-600 tracking-widest bg-[#030817]">
              <span>CHANNEL DIRECTORY ({filteredCameras.length})</span>
              <span>GEO-INDEXED</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              {filteredCameras.map((cam) => {
                const isSelected = cam.id === currentCam.id;
                return (
                  <div
                    key={cam.id}
                    onClick={() => {
                      sfx.playClick();
                      setActiveCamId(cam.id);
                      if (viewLayout === "grid") setViewLayout("spotlight");
                    }}
                    className={`p-2 border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected 
                        ? "border-cyan-400 bg-cyan-950/80 shadow-[0_0_12px_rgba(0,243,255,0.2)]" 
                        : "border-cyan-900/30 bg-black/40 hover:border-cyan-700/60 hover:bg-[#03091c]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[8px]">
                      <span className={`font-bold truncate ${isSelected ? "text-white" : "text-cyan-300"}`}>
                        {cam.name}
                      </span>
                      <span className="text-[7px] px-1 py-0.2 bg-black/80 border border-cyan-900 text-cyan-500">
                        {cam.category.split(" ")[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[7px] text-cyan-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-cyan-500" /> {cam.city}, {cam.country}
                      </span>
                      <span className="text-amber-400 font-mono">
                        {cam.lat > 0 ? `${cam.lat.toFixed(1)}°N` : `${Math.abs(cam.lat).toFixed(1)}°S`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredCameras.length === 0 && (
                <div className="p-4 text-center text-[9px] text-cyan-700">
                  NO LIVE CAMERAS MATCH CURRENT FILTER.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Video Feeds & Telemetry Viewport */}
          <div className="flex-1 bg-[#010308] p-3 sm:p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            
            {viewLayout === "spotlight" ? (
              /* SPOTLIGHT 1-CAM VIEW */
              <div className="flex flex-col gap-3 h-full">
                
                {/* Embedded Live Video Player with CRT Overlay */}
                <div className="relative aspect-video w-full max-h-[52vh] bg-black border border-cyan-500/70 shadow-[0_0_30px_rgba(0,243,255,0.25)] rounded-xs overflow-hidden flex flex-col justify-center">
                  <iframe 
                    src={`https://www.youtube-nocookie.com/embed/${currentCam.youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
                    title={currentCam.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />

                  {/* Top-Left REC Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/85 border border-[#00ff88] px-2 py-0.5 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                    <span className="text-[8px] text-[#00ff88] font-mono tracking-widest font-bold">
                      LIVE CCTV BROADCAST
                    </span>
                  </div>

                  {/* Top-Right Telemetry Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/85 border border-cyan-900 px-2 py-0.5 text-[8px] text-cyan-400 font-mono pointer-events-none">
                    LOCAL TIME: <strong className="text-white">{localTime}</strong> ({currentCam.timezone})
                  </div>

                  {/* Scanline CRT FX */}
                  <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00f3ff_2px,#00f3ff_4px)]" />
                </div>

                {/* Camera Dossier & Action Telemetry */}
                <div className="bg-[#030919] border border-cyan-900/80 p-3 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-[8px] uppercase tracking-wider">
                        {currentCam.category}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {currentCam.name}
                      </h3>
                    </div>
                    <p className="text-[9px] text-cyan-300/80 font-sans leading-relaxed max-w-2xl">
                      {currentCam.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[8px] text-cyan-500 pt-0.5">
                      <span>LOCATION: <strong className="text-cyan-300">{currentCam.city}, {currentCam.country}</strong></span>
                      <span>LAT: <strong className="text-cyan-300">{currentCam.lat.toFixed(4)}</strong></span>
                      <span>LNG: <strong className="text-cyan-300">{currentCam.lng.toFixed(4)}</strong></span>
                      <span>OPERATOR: <strong className="text-cyan-300">{currentCam.operator}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                    {onFocusCameraOnMap && (
                      <button 
                        onClick={() => {
                          sfx.playTargetLock();
                          onFocusCameraOnMap(currentCam);
                          onClose();
                        }}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 hover:text-white text-[9px] font-bold tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,243,255,0.2)] cursor-pointer"
                      >
                        <Navigation className="w-3 h-3 text-cyan-400" /> FOCUS ON MAP
                      </button>
                    )}

                    <a 
                      href={`https://www.youtube.com/watch?v=${currentCam.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-black/60 hover:bg-black/90 border border-cyan-800 hover:border-cyan-400 text-cyan-400 hover:text-white text-[9px] font-bold tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> FULLSCREEN 4K FEED
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              /* 4X CCTV MULTI-CAMERA WALL */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full overflow-y-auto">
                {filteredCameras.slice(0, 4).map((cam) => (
                  <div 
                    key={cam.id}
                    onClick={() => {
                      sfx.playClick();
                      setActiveCamId(cam.id);
                      setViewLayout("spotlight");
                    }}
                    className="relative aspect-video bg-black border border-cyan-900 hover:border-cyan-400 rounded-xs overflow-hidden shadow-[0_0_15px_rgba(0,243,255,0.15)] flex flex-col justify-between cursor-pointer group"
                  >
                    <iframe 
                      src={`https://www.youtube-nocookie.com/embed/${cam.youtubeId}?autoplay=1&mute=1&controls=0&rel=0`}
                      title={cam.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full h-full border-0 pointer-events-none"
                    />

                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/85 border border-cyan-500 px-1.5 py-0.5 pointer-events-none">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[7px] font-bold text-white truncate max-w-[140px]">{cam.name}</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black/85 border border-cyan-900 px-1.5 py-0.5 text-[7px] text-cyan-400 pointer-events-none group-hover:border-cyan-400 transition-colors">
                      [ CLICK TO SPOTLIGHT ]
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
