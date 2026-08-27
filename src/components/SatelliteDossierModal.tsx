"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Globe, X, Radio, Satellite as SatelliteIcon, 
  ExternalLink, Calendar, MapPin, Gauge, 
  ChevronLeft, ChevronRight, Activity, Sparkles, Eye, ShieldAlert, Cpu
} from "lucide-react";
import { SatelliteDef } from "@/data/satellites";
import { sfx } from "@/utils/sfxEngine";

interface SatelliteDossierProps {
  isOpen: boolean;
  onClose: () => void;
  satellite: any;
  allEvents?: any[];
}

export default function SatelliteDossierModal({
  isOpen,
  onClose,
  satellite,
  allEvents = []
}: SatelliteDossierProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const satData: SatelliteDef | null = satellite?.satDef || null;

  // Synthesize Satellite Orbital ISR & Mission Reports
  const intelCards = useMemo(() => {
    if (!satellite || !isOpen) return [];

    const name = satellite.title || satData?.name || "ORBITAL_RECON_SATELLITE";
    const operator = satData?.operator || "Global Space Command";
    const altKm = satellite.altitudeKm || satData?.altitudeKm || 420;
    const speedKmS = satData?.velocityKmS || 7.66;
    const speedKmH = Math.round(speedKmS * 3600).toLocaleString();
    const period = satData?.periodMin || 92.9;
    const inclination = satData?.inclinationDeg || 51.6;
    const payload = satData?.payload || "High-Resolution Optical & Multispectral Sensor Array";
    const resolution = satData?.resolution || "Sub-meter Ground Sampling Distance";
    const noradId = satData?.noradId || 25544;
    const lat = satellite.lat ? Number(satellite.lat).toFixed(4) : "0.0000";
    const lng = satellite.lng ? Number(satellite.lng).toFixed(4) : "0.0000";

    // Proximity ground target scan
    const groundTargets = allEvents.filter(ev => {
      if (!ev.lat || !ev.lng) return false;
      const dLat = Math.abs(ev.lat - satellite.lat);
      const dLng = Math.abs(ev.lng - satellite.lng);
      return (dLat < 20 && dLng < 20);
    });

    const primaryTargetText = groundTargets.length > 0
      ? `TACTICAL GROUND INTERSECT: Ground sensor footprint currently sweeps over [${groundTargets[0].label || groundTargets[0].title}]. Active multi-spectral imaging downlinking optical, infrared and radar data to ground telemetry stations.`
      : `ORBITAL SWATH MONITORING: Satellite currently traversing open maritime / continental corridor. High-aperture optics capturing wide-angle situational telemetry.`;

    let imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/International_Space_Station_after_undocking_of_STS-132.jpg/1280px-International_Space_Station_after_undocking_of_STS-132.jpg";
    let imageDescription = "ORBITAL TELEMETRY INTERCEPT";

    if (name.includes("ISS")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/International_Space_Station_after_undocking_of_STS-132.jpg/1280px-International_Space_Station_after_undocking_of_STS-132.jpg";
      imageDescription = "Modular space station in low Earth orbit, jointly operated by NASA, Roscosmos, JAXA, ESA, and CSA. Primary observation and research outpost.";
    } else if (name.includes("SENTINEL")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/0/07/Sentinel-2_%2816578029315%29.jpg";
      imageDescription = "Copernicus program optical imaging satellite. Provides high-resolution optical imagery for land services, agricultural monitoring, and emergency management.";
    } else if (name.includes("LANDSAT")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/c/c5/Landsat_9_illustration.jpg";
      imageDescription = "Earth observation satellite jointly managed by NASA and the USGS. Captures critical multispectral data for global land surface monitoring.";
    } else if (name.includes("WORLDVIEW") || name.includes("MAXAR")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/WorldView-2.jpg/1024px-WorldView-2.jpg";
      imageDescription = "High-resolution commercial Earth observation satellite. Provides panchromatic and multispectral optical imagery for military, intelligence, and commercial mapping.";
    } else if (name.includes("NOAA")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/52/NOAA-20_artist_rendering.jpg";
      imageDescription = "Joint Polar Satellite System (JPSS) environmental satellite. Tracks global weather patterns, thermal anomalies, and severe storm systems.";
    } else if (name.includes("STARLINK")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Starlink_Mission_%2847926144123%29.jpg/1024px-Starlink_Mission_%2847926144123%29.jpg";
      imageDescription = "Low Earth Orbit (LEO) satellite constellation providing global broadband coverage and resilient tactical communications networks.";
    } else if (name.includes("GOES")) {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/GOES-R_SpX_artist_rendering.jpg/1024px-GOES-R_SpX_artist_rendering.jpg";
      imageDescription = "Geostationary Operational Environmental Satellite. Provides continuous, high-definition meteorological observation and space weather monitoring.";
    } else {
      imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/NROL-39_patch.png/800px-NROL-39_patch.png";
      imageDescription = "Classified orbital reconnaissance asset. Intercepted telemetry suggests active intelligence gathering and signal downlink.";
    }

    return [
      // Card 1: Live Downlink & Orbital Telemetry
      {
        badge: "ORBITAL TELEMETRY & SATELLITE ASSET INTEL",
        badgeColor: "border-cyan-400 text-cyan-300 bg-cyan-950/60",
        headline: `${name}`,
        subline: `OPERATED BY ${operator.toUpperCase()}`,
        content: `LIVE KEPLERIAN TELEMETRY:
• NORAD CATALOG ID: ${noradId} | ORBITAL INCLINATION: ${inclination}°
• ORBITAL ALTITUDE: ${altKm} km (${Math.round(altKm * 0.621371).toLocaleString()} miles)
• GROUND SPEED: ${speedKmS} km/s (${speedKmH} km/h / Mach ${Math.round(speedKmS * 2.915)})
• ORBITAL PERIOD: ${period} minutes (15.5 orbits per 24-hour cycle)
• SUB-SATELLITE POINT (SSP): LAT ${lat}, LNG ${lng}`,
        imageUrl: imageUrl,
        imageDescription: imageDescription
      },

      // Card 2: Optical / SAR Sensor Payload Specifications
      {
        badge: "SENSOR PAYLOAD & RESOLUTION MATRIX",
        badgeColor: "border-emerald-500 text-emerald-300 bg-emerald-950/60",
        headline: `Payload: ${payload}`,
        subline: `GROUND RESOLUTION: ${resolution}`,
        content: `TECHNICAL PAYLOAD CAPABILITIES:
Equipped with advanced optical telescopes, synthetic aperture radar (SAR), thermal infrared sensors, and laser datalinks.

${primaryTargetText}

DOWNLINK SPECIFICATIONS:
Direct high-speed X-Band / Ka-Band microwave downlink transmitting real-time encrypted telemetry to defense and scientific ground stations.`,
        videoUrl: undefined
      },

      // Card 3: Space Defense & Space-Track Ephemeris Log
      {
        badge: "NORAD & SPACE-TRACK EPHEMERIS AUDIT",
        badgeColor: "border-purple-500 text-purple-300 bg-purple-950/60",
        headline: `Orbital Trajectory & Solar Geometry Audit`,
        subline: `SPACE SURVEILLANCE NETWORK (SSN) INTERCEPT`,
        content: `Two-Line Element (TLE) ephemeris propagation confirms nominal orbital trajectory. Solar panel orientation optimized at 90° beta angle for uninterrupted power generation. No collision hazard detected within 25km radius.`,
        videoUrl: undefined
      }
    ];
  }, [satellite, isOpen, allEvents, satData]);

  const handleNext = useCallback(() => {
    if (intelCards.length <= 1) return;
    sfx.playCardFlip();
    setDirection("next");
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % intelCards.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [intelCards.length]);

  const handlePrev = useCallback(() => {
    if (intelCards.length <= 1) return;
    sfx.playCardFlip();
    setDirection("prev");
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + intelCards.length) % intelCards.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [intelCards.length]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !satellite) return null;

  const currentCard = intelCards[currentSlide];
  const accentColor = satData?.color || "#00f3ff";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono text-cyan-300">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Satellite Dossier Container */}
      <div className="relative z-10 w-full max-w-3xl bg-[#02050e]/95 border-2 rounded-xs overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,243,255,0.3)] max-h-[calc(100vh-2rem)]" style={{ borderColor: accentColor }}>
        
        {/* Top Header */}
        <div className="bg-[#040b18] border-b border-cyan-900/60 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
              <SatelliteIcon className="w-4 h-4" /> SATELLITE_ORBITAL_ISR // {satellite.title || satData?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-cyan-600 tracking-widest hidden sm:inline">
              USE [◀] [▶] OR [A]/[D] TO SWIPE // [ESC] TO CLOSE
            </span>
            <button 
              onClick={onClose}
              className="p-1 border border-cyan-900/80 hover:border-amber-400 hover:text-amber-400 text-cyan-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetry Summary Banner */}
        <div className="bg-[#030814] px-4 py-2 border-b border-cyan-950 flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#00ff88] animate-pulse shrink-0" />
            <span className="font-bold text-white tracking-wider truncate">
              {satData?.operator || "GLOBAL SPACE RECON"} — NORAD ID #{satData?.noradId || 25544}
            </span>
          </div>
          <div className="flex items-center gap-3 text-cyan-500 text-[9px]">
            <span>ORBIT ALT: <b className="text-cyan-300">{satellite.altitudeKm || satData?.altitudeKm} km</b></span>
            <span>SPEED: <b className="text-cyan-300">{satData?.velocityKmS || 7.66} km/s</b></span>
            <span>PERIOD: <b className="text-cyan-300">{satData?.periodMin || 92.9} min</b></span>
          </div>
        </div>

        {/* 3D Perspective Card Viewport */}
        <div className="relative p-5 sm:p-6 min-h-[340px] flex flex-col justify-between overflow-x-hidden overflow-y-auto custom-scrollbar" style={{ perspective: "1000px" }}>
          
          {currentCard && (
            <div 
              key={currentSlide}
              className={`flex flex-col gap-3 transition-all duration-300 transform ${
                isAnimating 
                  ? direction === "next" 
                    ? "opacity-0 translate-x-8 rotate-y-6 scale-95" 
                    : "opacity-0 -translate-x-8 -rotate-y-6 scale-95"
                  : "opacity-100 translate-x-0 rotate-y-0 scale-100"
              }`}
            >
              {/* Card Meta Badge */}
              <div className="flex items-center justify-between pb-1 border-b border-cyan-900/40 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 border font-bold tracking-widest uppercase text-[9px] ${currentCard.badgeColor}`}>
                    {currentCard.badge}
                  </span>
                  <span className="text-cyan-600 text-[8px] flex items-center gap-1">
                    <Globe className="w-3 h-3" /> ORBITAL TLE
                  </span>
                </div>
                <div className="text-cyan-600 text-[9px] flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" /> LIVE REAL-TIME TELEMETRY
                </div>
              </div>

              {/* Card Headline */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  {currentCard.headline}
                </h2>
                <div className="text-[10px] text-amber-400 font-mono mt-0.5 tracking-wider">
                  &gt;&gt; {currentCard.subline}
                </div>
              </div>

              {/* Tactical Image Representation */}
              {currentCard.imageUrl && (
                <div className="relative aspect-video w-full bg-black border border-cyan-500/60 rounded-xs overflow-hidden shadow-[0_0_25px_rgba(0,243,255,0.25)] my-1">
                  <img src={currentCard.imageUrl} alt={currentCard.headline} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                  
                  {/* Label */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/50 rounded-sm shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                    <Eye className="w-2.5 h-2.5 text-cyan-400" />
                    <span className="text-[7px] text-cyan-300 font-bold tracking-widest uppercase">OSINT SATELLITE ASSET DATABASE</span>
                  </div>

                  {/* Description Bar */}
                  {currentCard.imageDescription && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/85 backdrop-blur-md border-t border-cyan-900/50 p-2 sm:p-3 text-[9px] text-cyan-300 leading-relaxed font-mono flex items-start gap-2 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                      <div className="shrink-0 mt-0.5"><SatelliteIcon className="w-3.5 h-3.5 text-cyan-400" /></div>
                      <div>
                        <span className="font-bold text-cyan-400 mr-1 block sm:inline mb-0.5 sm:mb-0">ORBITAL INTEL:</span>
                        <span className="text-cyan-200/90">{currentCard.imageDescription}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Synthesized Briefing Text */}
              <div className="bg-[#02050e]/95 border border-cyan-900/80 p-3.5 rounded-xs text-[11px] text-cyan-200/95 leading-relaxed font-sans relative whitespace-pre-line">
                <div className="text-[8px] text-amber-500 font-mono tracking-widest uppercase mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> SATELLITE_ORBITAL_ANALYSIS // NORAD SPACE-TRACK CORRELATION
                </div>
                {currentCard.content}
              </div>

              {/* Action Link */}
              <div className="pt-2 flex items-center justify-between text-[9px]">
                <a 
                  href={`https://www.n2yo.com/satellite/?s=${satData?.noradId || 25544}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:text-cyan-300 tracking-widest font-bold transition-all group"
                >
                  <span>&gt;&gt;&gt; ACCESS LIVE NORAD N2YO SATELLITE TRACKER</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <div className="text-cyan-600 font-mono">
                  DOSSIER SECTION [{currentSlide + 1}/{intelCards.length}]
                </div>
              </div>

            </div>
          )}

          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00f3ff_2px,#00f3ff_4px)]" />
        </div>

        {/* Carousel Bottom Control Bar */}
        <div className="bg-[#040b18] border-t border-cyan-900/60 p-3 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={intelCards.length <= 1}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 disabled:opacity-30 text-[10px] tracking-widest transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> PREV [A/◀]
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {intelCards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 transition-all rounded-xs ${
                  currentSlide === i ? "w-5 bg-cyan-400 shadow-[0_0_8px_#00f3ff]" : "w-1.5 bg-cyan-900 hover:bg-cyan-700"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={intelCards.length <= 1}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 disabled:opacity-30 text-[10px] tracking-widest transition-all cursor-pointer"
          >
            NEXT [D/▶] <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
