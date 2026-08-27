"use client";

import { useState, useMemo } from "react";
import { 
  Plane, ShieldAlert, Crown, Search, X, Crosshair, 
  ArrowUpRight, Radio, SlidersHorizontal, Navigation, Compass, Gauge
} from "lucide-react";
import { sfx } from "@/utils/sfxEngine";

export interface FlightItem {
  callsign: string;
  country: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading?: number;
  track?: number;
  type: "military" | "commercial" | "vip";
  aircraftType?: string;
  mission?: string;
  squawk?: string;
}

interface AirRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  flights: FlightItem[];
  onSelectFlight: (flight: FlightItem) => void;
  activeFilter: "all" | "military" | "commercial" | "vip";
  setActiveFilter: (filter: "all" | "military" | "commercial" | "vip") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function AirRadarModal({
  isOpen,
  onClose,
  flights,
  onSelectFlight,
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm
}: AirRadarModalProps) {
  const [altitudeFilter, setAltitudeFilter] = useState<"all" | "low" | "mid" | "high">("all");
  const [selectedSort, setSelectedSort] = useState<"callsign" | "altitude" | "velocity">("altitude");

  const filteredFlights = useMemo(() => {
    return flights.filter(f => {
      // Type match
      const matchesType = activeFilter === "all" || f.type === activeFilter;
      
      // Search match
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        f.callsign.toLowerCase().includes(term) ||
        f.country.toLowerCase().includes(term) ||
        (f.aircraftType && f.aircraftType.toLowerCase().includes(term)) ||
        (f.mission && f.mission.toLowerCase().includes(term));

      // Altitude match
      let matchesAlt = true;
      if (altitudeFilter === "low") matchesAlt = f.altitude < 4000;
      else if (altitudeFilter === "mid") matchesAlt = f.altitude >= 4000 && f.altitude < 10000;
      else if (altitudeFilter === "high") matchesAlt = f.altitude >= 10000;

      return matchesType && matchesSearch && matchesAlt;
    }).sort((a, b) => {
      if (selectedSort === "altitude") return b.altitude - a.altitude;
      if (selectedSort === "velocity") return b.velocity - a.velocity;
      return a.callsign.localeCompare(b.callsign);
    });
  }, [flights, activeFilter, searchTerm, altitudeFilter, selectedSort]);

  if (!isOpen) return null;

  const milCount = flights.filter(f => f.type === "military").length;
  const vipCount = flights.filter(f => f.type === "vip").length;
  const commCount = flights.filter(f => f.type === "commercial").length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono text-cyan-300">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Tactical Radar Console */}
      <div className="relative z-10 w-full max-w-4xl max-h-full bg-[#02050e]/95 border-2 border-cyan-500/70 shadow-[0_0_50px_rgba(0,243,255,0.3)] rounded-xs overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#040b18] border-b border-cyan-500/50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-ping" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#00ff88] flex items-center gap-2">
              <Plane className="w-4 h-4" /> AIRSPACE_RADAR_COMMAND // ADS-B INTERCEPT MATRIX
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-cyan-600 tracking-widest hidden md:inline">
              ONLINE CONTACTS: [{filteredFlights.length}/{flights.length}]
            </span>
            <button 
              onClick={onClose}
              className="p-1 border border-cyan-900/80 hover:border-amber-400 hover:text-amber-400 text-cyan-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactical Control Bar */}
        <div className="p-3 bg-[#030814] border-b border-cyan-900/60 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between text-[9px]">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH CALLSIGN, SQUADRON, COUNTRY (e.g. FORTE, USAF, BRAZIL)..."
              className="w-full bg-[#02040a] border border-cyan-700/80 pl-7 pr-7 py-1.5 text-xs text-cyan-200 placeholder:text-cyan-800 focus:outline-none focus:border-[#00ff88] uppercase font-mono"
              autoFocus
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Category Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => { sfx.playClick(); setActiveFilter("all"); }}
              className={`px-2.5 py-1.5 border font-bold tracking-wider transition-all cursor-pointer ${
                activeFilter === "all" ? "border-cyan-400 bg-cyan-950 text-cyan-200 shadow-[0_0_10px_rgba(0,243,255,0.3)]" : "border-cyan-900/50 text-cyan-700 hover:text-cyan-400"
              }`}
            >
              ALL ({flights.length})
            </button>
            <button 
              onClick={() => { sfx.playClick(); setActiveFilter("military"); }}
              className={`px-2.5 py-1.5 border font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                activeFilter === "military" ? "border-[#ff003c] bg-[#ff003c]/25 text-[#ff003c] shadow-[0_0_12px_rgba(255,0,60,0.4)]" : "border-cyan-900/50 text-cyan-700 hover:text-[#ff003c]"
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> MILITARY ({milCount})
            </button>
            <button 
              onClick={() => { sfx.playClick(); setActiveFilter("vip"); }}
              className={`px-2.5 py-1.5 border font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                activeFilter === "vip" ? "border-[#ffd700] bg-[#ffd700]/25 text-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.4)]" : "border-cyan-900/50 text-cyan-700 hover:text-[#ffd700]"
              }`}
            >
              <Crown className="w-3 h-3" /> VIP ({vipCount})
            </button>
            <button 
              onClick={() => { sfx.playClick(); setActiveFilter("commercial"); }}
              className={`px-2.5 py-1.5 border font-bold tracking-wider transition-all cursor-pointer ${
                activeFilter === "commercial" ? "border-[#00ff88] bg-[#00ff88]/25 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)]" : "border-cyan-900/50 text-cyan-700 hover:text-[#00ff88]"
              }`}
            >
              AIRLINERS ({commCount})
            </button>
          </div>
        </div>

        {/* Sub-Filters: Altitude & Sort */}
        <div className="bg-[#020610] px-3 py-1.5 border-b border-cyan-950 flex items-center justify-between text-[8px] text-cyan-600">
          <div className="flex items-center gap-2">
            <span>ALTITUDE:</span>
            <button 
              onClick={() => { sfx.playClick(); setAltitudeFilter("all"); }} 
              className={`px-1.5 py-0.5 border ${altitudeFilter === "all" ? "border-cyan-400 text-cyan-200 bg-cyan-950" : "border-transparent hover:border-cyan-900"}`}
            >
              ALL
            </button>
            <button 
              onClick={() => { sfx.playClick(); setAltitudeFilter("low"); }} 
              className={`px-1.5 py-0.5 border ${altitudeFilter === "low" ? "border-cyan-400 text-cyan-200 bg-cyan-950" : "border-transparent hover:border-cyan-900"}`}
            >
              LOW (&lt;4,000m)
            </button>
            <button 
              onClick={() => { sfx.playClick(); setAltitudeFilter("mid"); }} 
              className={`px-1.5 py-0.5 border ${altitudeFilter === "mid" ? "border-cyan-400 text-cyan-200 bg-cyan-950" : "border-transparent hover:border-cyan-900"}`}
            >
              CRUISE (4k-10km)
            </button>
            <button 
              onClick={() => { sfx.playClick(); setAltitudeFilter("high"); }} 
              className={`px-1.5 py-0.5 border ${altitudeFilter === "high" ? "border-cyan-400 text-cyan-200 bg-cyan-950" : "border-transparent hover:border-cyan-900"}`}
            >
              HIGH RECON (&gt;10,000m)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>SORT:</span>
            <button 
              onClick={() => { sfx.playClick(); setSelectedSort("altitude"); }} 
              className={`px-1.5 py-0.5 border ${selectedSort === "altitude" ? "border-amber-400 text-amber-300 bg-amber-950/40" : "border-transparent hover:border-cyan-900"}`}
            >
              ALTITUDE ▼
            </button>
            <button 
              onClick={() => { sfx.playClick(); setSelectedSort("velocity"); }} 
              className={`px-1.5 py-0.5 border ${selectedSort === "velocity" ? "border-amber-400 text-amber-300 bg-amber-950/40" : "border-transparent hover:border-cyan-900"}`}
            >
              SPEED ▼
            </button>
            <button 
              onClick={() => { sfx.playClick(); setSelectedSort("callsign"); }} 
              className={`px-1.5 py-0.5 border ${selectedSort === "callsign" ? "border-amber-400 text-amber-300 bg-amber-950/40" : "border-transparent hover:border-cyan-900"}`}
            >
              CALLSIGN
            </button>
          </div>
        </div>

        {/* Flight Targets Grid / Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[55vh]">
          {filteredFlights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredFlights.map((flight, idx) => {
                const isMil = flight.type === "military";
                const isVip = flight.type === "vip";
                const accentColor = isMil ? "#ff003c" : isVip ? "#ffd700" : "#00ff88";

                return (
                  <div 
                    key={`${flight.callsign}-${idx}`}
                    onClick={() => {
                      sfx.playTargetLock();
                      onSelectFlight(flight);
                      onClose();
                    }}
                    className={`border p-2.5 bg-[#01040a] hover:bg-[#040e20] transition-all cursor-pointer group flex flex-col justify-between gap-1.5 ${
                      isMil 
                        ? "border-red-900/50 hover:border-red-500 shadow-[0_0_10px_rgba(255,0,60,0.1)]" 
                        : isVip 
                        ? "border-yellow-900/50 hover:border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.1)]" 
                        : "border-cyan-900/40 hover:border-cyan-400"
                    }`}
                  >
                    {/* Top Row: Callsign & Classification */}
                    <div className="flex items-center justify-between border-b border-cyan-950 pb-1">
                      <div className="flex items-center gap-1.5">
                        {isMil ? (
                          <ShieldAlert className="w-3 h-3 text-[#ff003c] shrink-0" />
                        ) : isVip ? (
                          <Crown className="w-3 h-3 text-[#ffd700] shrink-0" />
                        ) : (
                          <Plane className="w-3 h-3 text-[#00ff88] shrink-0" />
                        )}
                        <span className="font-bold text-xs tracking-wider" style={{ color: accentColor }}>
                          {flight.callsign}
                        </span>
                      </div>

                      <span className="text-[8px] px-1.5 py-0.2 border tracking-widest uppercase font-mono" style={{ borderColor: `${accentColor}50`, color: accentColor }}>
                        {flight.type}
                      </span>
                    </div>

                    {/* Aircraft Type & Mission */}
                    <div className="text-[9px] text-cyan-200/90 truncate font-sans">
                      {flight.aircraftType || (isMil ? "Tactical Recon / Patrol" : isVip ? "Executive Jet" : "Commercial Transport")}
                    </div>
                    {flight.mission && (
                      <div className="text-[8px] text-amber-400 truncate font-mono">
                        MISSION: {flight.mission}
                      </div>
                    )}

                    {/* Telemetry Metrics */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[8px] text-cyan-600 font-mono border-t border-cyan-950">
                      <div>
                        <span className="block text-[7px] text-cyan-800">ALTITUDE</span>
                        <span className="text-cyan-300 font-bold">{flight.altitude}m</span>
                      </div>
                      <div>
                        <span className="block text-[7px] text-cyan-800">VELOCITY</span>
                        <span className="text-cyan-300 font-bold">{flight.velocity}m/s</span>
                      </div>
                      <div>
                        <span className="block text-[7px] text-cyan-800">AFFILIATION</span>
                        <span className="text-amber-400 truncate block">{flight.country}</span>
                      </div>
                    </div>

                    {/* Intercept Action */}
                    <div className="mt-1 pt-1 flex items-center justify-between text-[8px] text-cyan-500 group-hover:text-amber-300">
                      <span className="flex items-center gap-1 font-bold">
                        <Crosshair className="w-2.5 h-2.5" /> INTERCEPT TARGET
                      </span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-cyan-700">
              <Radio className="w-8 h-8 animate-pulse mb-2 text-cyan-600" />
              <div className="text-xs tracking-widest uppercase">NO AIR TARGETS MATCHING CURRENT FILTERS</div>
              <div className="text-[9px] text-cyan-800 mt-1">Try clearing search keywords or switching class filter</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#030610] p-2.5 border-t border-cyan-500/40 flex items-center justify-between text-[9px] text-cyan-600">
          <div>CLICK ANY AIRCRAFT TO LOCK TELEMETRY &amp; CINEMATIC REDIRECT</div>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-cyan-950 border border-cyan-700 text-cyan-300 hover:border-cyan-400 text-[8px] tracking-widest cursor-pointer"
          >
            [CLOSE CONSOLE]
          </button>
        </div>

      </div>
    </div>
  );
}
