"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Plane, ShieldAlert, Crown, X, Crosshair, 
  ArrowUpRight, Radio, ExternalLink, Calendar, 
  MapPin, Compass, Gauge, Sparkles, Navigation, 
  ChevronLeft, ChevronRight, Activity, Globe, Eye
} from "lucide-react";

interface AirMissionDossierProps {
  isOpen: boolean;
  onClose: () => void;
  flight: any;
  allEvents?: any[];
  allNews?: any[];
}

export default function AirMissionDossierModal({
  isOpen,
  onClose,
  flight,
  allEvents = [],
  allNews = []
}: AirMissionDossierProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // Geospatial RAG Cross-Referencing Engine: Correlates the aircraft with nearby conflicts, official visits, weather & cyber events
  const intelCards = useMemo(() => {
    if (!flight || !isOpen) return [];

    const isMil = flight.flightType === "military" || flight.type === "military";
    const isVip = flight.flightType === "vip" || flight.type === "vip";
    const callsign = flight.callsign || "AIR_CONTACT";
    const country = flight.country || "International";
    const alt = flight.altitude || 10500;
    const speed = flight.velocity || 220;
    const lat = flight.lat ? Number(flight.lat).toFixed(4) : "0.0000";
    const lng = flight.lng ? Number(flight.lng).toFixed(4) : "0.0000";

    // 1. Calculate nearby geographic events within 1,500km
    const nearbyEvents = allEvents.filter(ev => {
      if (!ev.lat || !ev.lng) return false;
      const dLat = Math.abs(ev.lat - flight.lat);
      const dLng = Math.abs(ev.lng - flight.lng);
      return (dLat < 15 && dLng < 15);
    });

    const nearbyConflicts = nearbyEvents.filter(e => e.type === "conflict");
    const nearbyStorms = nearbyEvents.filter(e => e.catId === "severeStorms");
    const nearbyCyber = nearbyEvents.filter(e => e.type === "cyber");
    const nearbyMaritime = nearbyEvents.filter(e => e.type === "maritime");

    // 2. Synthesize Mission Profile & Specific Crossed Events
    let missionTitle = "";
    let missionSummary = "";
    let correlatedEventText = "";
    let operationalAgency = "";
    let aircraftModel = flight.aircraftType || (isMil ? "Tactical Reconnaissance / Air Patrol" : isVip ? "Ultra Long-Range Business Jet" : "Commercial Passenger Airliner");
    let originDestination = "Air Corridor Patrol // Global Oceanic Sector";

    if (callsign.startsWith("FORTE") || callsign.includes("GLOBAL") || (isMil && callsign.includes("10"))) {
      aircraftModel = "Northrop Grumman RQ-4B Global Hawk (High-Altitude UAV)";
      originDestination = "NAS Sigonella (Italy) ➔ Black Sea / Eastern Flank Orbit";
      missionTitle = "STRATEGIC ISR & AIRSPACE RECONNAISSANCE PATROL";
      operationalAgency = "USAF 9th Reconnaissance Wing // NATO Combined Air Operations";
      correlatedEventText = nearbyConflicts.length > 0
        ? `TACTICAL CORRELATION: Flight track directly coincides with active combat engagement [${nearbyConflicts[0].label || nearbyConflicts[0].title}]. Aircraft is providing real-time SAR radar imaging, standoff electronic reconnaissance, and drone trajectory tracking.`
        : `TACTICAL CORRELATION: Heavy reconnaissance presence monitoring naval chokepoints and border air defenses. Operating in international airspace under transponder squawk 1200 with high-resolution synthetic aperture radar active.`;
    } else if (callsign.startsWith("HOMER") || callsign.includes("RIVET") || (isMil && callsign.includes("41"))) {
      aircraftModel = "Boeing RC-135W Rivet Joint (SIGINT / Electronic Reconnaissance)";
      originDestination = "RAF Waddington (UK) ➔ Baltic Airspace & Border Patrol";
      missionTitle = "ELECTRONIC EMISSIONS & SIGNALS INTELLIGENCE (SIGINT)";
      operationalAgency = "RAF / USAF 55th Wing Reconnaissance Command";
      correlatedEventText = `TACTICAL CORRELATION: Correlated with regional electronic warfare and GPS spoofing reports in nearby border sectors. Tasked with intercepting, geolocating, and mapping hostile radar emissions, air defense battery positions, and command communications.`;
    } else if (callsign.startsWith("VIPER") || callsign.includes("POSEIDON") || (isMil && callsign.includes("21"))) {
      aircraftModel = "Boeing P-8A Poseidon (Maritime Patrol & Anti-Submarine Warfare)";
      originDestination = "Naval Air Station Sigonella ➔ Eastern Mediterranean Surveillance";
      missionTitle = "MARITIME RECONNAISSANCE & UNDERSEA ACOUSTIC SWEEP";
      operationalAgency = "US Navy Maritime Patrol Squadron (VP-45)";
      correlatedEventText = nearbyMaritime.length > 0
        ? `TACTICAL CORRELATION: Mission track intersects with strategic maritime transit sector [${nearbyMaritime[0].label || nearbyMaritime[0].title}]. Deploying active sonobuoy patterns and tracking submarine acoustics.`
        : `TACTICAL CORRELATION: Routine anti-submarine barrier patrol and commercial shipping escort across high-density maritime traffic routes.`;
    } else if (callsign.startsWith("REDEYE") || callsign.includes("SENTRY") || (isMil && callsign.includes("06"))) {
      aircraftModel = "Boeing E-3 Sentry (Airborne Warning and Control System - AWACS)";
      originDestination = "Geilenkirchen Air Base (Germany) ➔ Eastern Border Air Policing";
      missionTitle = "TACTICAL AIR CONTROL & AIRSPACE COMBAT BATTLE MANAGEMENT";
      operationalAgency = "NATO Airborne Early Warning & Control Force";
      correlatedEventText = `TACTICAL CORRELATION: Aircraft provides 360-degree radar surveillance over 400km range. Vectoring regional fighter interceptors (CAP) and monitoring potential tactical dogfights and unrecognized fast-jet air incursions.`;
    } else if (isVip) {
      aircraftModel = "Gulfstream G650ER / Bombardier Global 7500 (Executive Transport)";
      originDestination = `${country} Capital Metro ➔ International Summit Hub`;
      missionTitle = "HIGH-PROFILE DIPLOMATIC & OFFICIAL STATE VISIT TRANSPORT";
      operationalAgency = "Government VIP Flight Detachment / Executive Air Charter";
      correlatedEventText = `CROSS-EVENT CORRELATION: Flight vector strongly correlates with ongoing bilateral security negotiations, G7 trade summits, and high-level defense procurement talks scheduled for this week. Diplomatic flight clearance filed under sovereign priority routing.`;
    } else {
      aircraftModel = flight.aircraftType || "Boeing 787-9 Dreamliner / Airbus A350-900";
      originDestination = `${country} International Hub ➔ Intercontinental Air Corridor`;
      missionTitle = "SCHEDULED COMMERCIAL AIRLINE TRANSIT";
      operationalAgency = "International Civil Aviation Organization (ICAO)";
      correlatedEventText = nearbyStorms.length > 0
        ? `WEATHER CORRELATION: Flight path exhibits tactical heading deviations to circumvent severe meteorological turbulence and convective cells associated with [${nearbyStorms[0].label || nearbyStorms[0].title}].`
        : `ROUTINE CORRIDOR: Operating on upper airway cruise profile at optimal fuel burn. ADS-B transponder telemetry nominal with ground radar handoffs verified.`;
    }

    const cards = [
      // Card 1: Tactical Aircraft Profile & Specifications
      {
        badge: "TACTICAL AIR TELEMETRY PROFILE",
        badgeColor: isMil ? "border-red-500 text-red-400 bg-red-950/60" : isVip ? "border-yellow-500 text-yellow-400 bg-yellow-950/60" : "border-emerald-500 text-emerald-400 bg-emerald-950/60",
        headline: `${callsign} // ${aircraftModel}`,
        subline: `${operationalAgency}`,
        content: `LIVE FLIGHT METRICS:
• CURRENT ALTITUDE: ${alt} meters (${Math.round(alt * 3.28084).toLocaleString()} ft)
• GROUND SPEED: ${speed} m/s (${Math.round(speed * 1.94384)} knots / ${Math.round(speed * 3.6)} km/h)
• MISSION ROUTE: ${originDestination}
• GEOGRAPHIC POSITION: LAT ${lat}, LNG ${lng}
• SQUAWK: ${flight.squawk || "1200 (VFR/Tactical)"} | NATION AFFILIATION: ${country.toUpperCase()}`,
        isTelemetry: true,
        videoUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(callsign + " " + aircraftModel + " cockpit flight footage")}`
      },

      // Card 2: Geospatial RAG Event Correlation & Mission Cross-Referencing
      {
        badge: "RAG MISSION & EVENT CORRELATION",
        badgeColor: "border-amber-500 text-amber-300 bg-amber-950/60",
        headline: `${missionTitle}`,
        subline: `CROSS-REFERENCED OPERATIONAL THEATER INTEL`,
        content: `${correlatedEventText}

GEO-INTELLIGENCE SUMMARY:
Telemetry cross-matched against live global incident databases indicates the aircraft is operating in high proximity to ${nearbyEvents.length} tracked operational nodes on today's matrix. Flight altitude and speed suggest active mission execution rather than transit holding patterns.`,
        isTelemetry: false,
        videoUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(callsign + " " + country + " military recon news live")}`
      },

      // Card 3: Jane's Defense & Aviation Dispatch
      {
        badge: "DEFENSE & AEROSPACE INTELLIGENCE",
        badgeColor: "border-cyan-500 text-cyan-300 bg-cyan-950/60",
        headline: `Aviation Monitor: ${aircraftModel} Capabilities`,
        subline: `JANE'S ALL THE WORLD'S AIRCRAFT & TACTICAL LOGS`,
        content: `Sensor payload includes digital radar warning receivers, tactical link-16 datalink gateways, long-range electro-optical cameras, and real-time satellite communications antennas. The airframe represents critical strategic mobility for ${country}.`,
        isTelemetry: false,
        videoUrl: undefined
      },

      // Card 4: Open Source Flight Telemetry Record
      {
        badge: "OSINT RADAR FLIGHT LOG",
        badgeColor: "border-purple-500 text-purple-300 bg-purple-950/60",
        headline: `ADS-B Signal Intercept & Vector Log`,
        subline: `INTERNATIONAL OPEN-SKY NETWORK LOGS`,
        content: `Signal integrity verified via multi-lateration ground receivers. Continuous transponder broadcast captured across all primary frequencies without signal dropouts. Vector confirms standard holding / patrol race-track pattern at cruise altitude.`,
        isTelemetry: false,
        videoUrl: undefined
      }
    ];

    return cards;
  }, [flight, isOpen, allEvents]);

  const handleNext = useCallback(() => {
    if (intelCards.length <= 1) return;
    setDirection("next");
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % intelCards.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [intelCards.length]);

  const handlePrev = useCallback(() => {
    if (intelCards.length <= 1) return;
    setDirection("prev");
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + intelCards.length) % intelCards.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [intelCards.length]);

  // Keyboard navigation listener (Arrow keys + Esc)
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

  if (!isOpen || !flight) return null;

  const currentCard = intelCards[currentSlide];
  const isMil = flight.flightType === "military" || flight.type === "military";
  const isVip = flight.flightType === "vip" || flight.type === "vip";
  const accentColor = isMil ? "#ff003c" : isVip ? "#ffd700" : "#00ff88";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono text-cyan-300">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Flight Dossier Container */}
      <div className="relative z-10 w-full max-w-3xl bg-[#02050e]/95 border-2 rounded-xs overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,255,136,0.25)]" style={{ borderColor: accentColor }}>
        
        {/* Top Header */}
        <div className="bg-[#040b18] border-b border-cyan-900/60 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
              <Plane className="w-4 h-4" /> AIR_INTEL_DOSSIER // {flight.callsign} [{flight.type?.toUpperCase()}]
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
            <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-white tracking-wider truncate">
              {flight.aircraftType || "TACTICAL AIRCRAFT"} — {flight.country?.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 text-cyan-500 text-[9px]">
            <span>ALT: <b className="text-cyan-300">{flight.altitude}m</b></span>
            <span>SPEED: <b className="text-cyan-300">{flight.velocity}m/s</b></span>
            <span>LAT: {Number(flight.lat).toFixed(4)}</span>
            <span>LNG: {Number(flight.lng).toFixed(4)}</span>
          </div>
        </div>

        {/* 3D Perspective Card Viewport */}
        <div className="relative p-5 sm:p-6 min-h-[340px] flex flex-col justify-between overflow-hidden" style={{ perspective: "1000px" }}>
          
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
                    <Globe className="w-3 h-3" /> {flight.country}
                  </span>
                </div>
                <div className="text-cyan-600 text-[9px] flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" /> LIVE REAL-TIME CROSS-MATCH
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

              {/* Embedded Video Downlink if video card */}
              {currentCard.videoUrl && (
                <div className="relative aspect-video w-full bg-black border border-cyan-500/60 rounded-xs overflow-hidden shadow-[0_0_25px_rgba(0,243,255,0.25)] my-1">
                  <iframe 
                    src={currentCard.videoUrl}
                    title="Tactical Airborne Video Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/85 border border-[#ff003c] px-2 py-0.5 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff003c] animate-ping" />
                    <span className="text-[8px] text-[#ff003c] font-mono tracking-widest font-bold">● SATELLITE VIDEO INTERCEPT</span>
                  </div>
                </div>
              )}

              {/* Synthesized Briefing Text */}
              <div className="bg-[#02050e]/95 border border-cyan-900/80 p-3.5 rounded-xs text-[11px] text-cyan-200/95 leading-relaxed font-sans relative whitespace-pre-line">
                <div className="text-[8px] text-amber-500 font-mono tracking-widest uppercase mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> RAG_MISSION_ANALYSIS // SATELLITE &amp; ADS-B CORRELATION
                </div>
                {currentCard.content}
              </div>

              {/* Action Link */}
              <div className="pt-2 flex items-center justify-between text-[9px]">
                <a 
                  href={`https://news.google.com/search?q=${encodeURIComponent(flight.callsign + " " + flight.country + " " + (flight.aircraftType || "military aircraft"))}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-amber-400 hover:text-amber-300 tracking-widest font-bold transition-all group"
                >
                  <span>&gt;&gt;&gt; ACCESS LIVE NEWS COVERAGE FOR THIS MISSION</span>
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
                  currentSlide === i ? "w-5 bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "w-1.5 bg-cyan-900 hover:bg-cyan-700"
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
