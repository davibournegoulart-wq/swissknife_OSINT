"use client";

import { useState } from "react";
import { 
  Ruler, X, Navigation, Gauge, ShieldAlert, 
  Crosshair, Plane, Flame, ChevronRight, Zap, Target
} from "lucide-react";
import { GeodesicMeasurement, ThreatZone, STRATEGIC_THREAT_HUBS } from "@/utils/geoCalc";
import { sfx } from "@/utils/sfxEngine";

interface RangeMeasureModalProps {
  measurement: GeodesicMeasurement | null;
  onClear: () => void;
  threatRingsEnabled: boolean;
  onToggleThreatRings: () => void;
  selectedThreatHub: ThreatZone | null;
  onSelectThreatHub: (hub: ThreatZone | null) => void;
}

export default function RangeMeasureModal({
  measurement,
  onClear,
  threatRingsEnabled,
  onToggleThreatRings,
  selectedThreatHub,
  onSelectThreatHub
}: RangeMeasureModalProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!measurement && !threatRingsEnabled) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#02050e]/95 border border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] font-mono text-amber-200 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between p-2.5 bg-[#080500] border-b border-amber-900/60 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-950/80 border border-amber-500/80 flex items-center justify-center text-amber-400">
            <Ruler className="w-3 h-3" />
          </div>
          <span className="font-bold text-amber-400 tracking-widest">
            GEODESIC RANGE &amp; THREAT INTERCEPT MATRIX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[8px] px-2 py-0.5 border border-amber-900/60 hover:border-amber-400 text-amber-400 transition-colors"
          >
            {isExpanded ? "[ MINIMIZE ]" : "[ EXPAND ]"}
          </button>
          <button 
            onClick={() => { sfx.playClick(); onClear(); }}
            className="p-1 text-amber-700 hover:text-amber-300 hover:bg-amber-950/50 transition-colors"
            title="Close / Reset Vector"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 text-[9px]">
          {measurement && (
            <>
              {/* Origin -> Target Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/60 p-2 border border-amber-950">
                <div className="border-l-2 border-cyan-400 pl-2">
                  <span className="text-cyan-600 block text-[8px]">ORIGIN (POINT A):</span>
                  <div className="font-bold text-cyan-300 truncate">
                    {measurement.pointA.label || `LAT ${measurement.pointA.lat.toFixed(2)}, LNG ${measurement.pointA.lng.toFixed(2)}`}
                  </div>
                </div>
                <div className="border-l-2 border-[#ff003c] pl-2">
                  <span className="text-red-600 block text-[8px]">INTERCEPT TARGET (POINT B):</span>
                  <div className="font-bold text-red-300 truncate">
                    {measurement.pointB.label || `LAT ${measurement.pointB.lat.toFixed(2)}, LNG ${measurement.pointB.lng.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {/* Distance Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 border border-amber-900/50 bg-amber-950/20">
                  <span className="text-amber-600 block text-[7px]">GREAT CIRCLE DISTANCE</span>
                  <span className="text-xs font-bold text-amber-300">
                    {measurement.distanceKm.toLocaleString()} <span className="text-[8px] font-normal">KM</span>
                  </span>
                </div>
                <div className="p-2 border border-cyan-900/50 bg-cyan-950/20">
                  <span className="text-cyan-600 block text-[7px]">NAUTICAL MILES</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {measurement.distanceNm.toLocaleString()} <span className="text-[8px] font-normal">NM</span>
                  </span>
                </div>
                <div className="p-2 border border-purple-900/50 bg-purple-950/20">
                  <span className="text-purple-600 block text-[7px]">STATUTE MILES</span>
                  <span className="text-xs font-bold text-purple-300">
                    {measurement.distanceMiles.toLocaleString()} <span className="text-[8px] font-normal">MI</span>
                  </span>
                </div>
                <div className="p-2 border border-emerald-900/50 bg-emerald-950/20">
                  <span className="text-emerald-600 block text-[7px]">TRUE BEARING</span>
                  <span className="text-xs font-bold text-emerald-300">
                    {measurement.bearingDeg}° <span className="text-[8px] font-normal">AZ</span>
                  </span>
                </div>
              </div>

              {/* Intercept Flight Time Calculator */}
              <div>
                <div className="text-[8px] text-amber-500 font-bold border-b border-amber-950 pb-1 mb-1.5 flex items-center gap-1">
                  <Gauge className="w-2.5 h-2.5 text-amber-400" /> ESTIMATED TIME OF ARRIVAL / FLIGHT INTERCEPT (ETA)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[8px]">
                  
                  {/* Mach 0.8 */}
                  <div className="p-1.5 border border-cyan-900/40 bg-black/40">
                    <span className="text-cyan-500 block">✈️ CRUISE (MACH 0.8)</span>
                    <span className="font-bold text-cyan-200">
                      {measurement.timeSubsonicMach08.hours > 0 ? `${measurement.timeSubsonicMach08.hours}h ` : ''}
                      {measurement.timeSubsonicMach08.minutes}m
                    </span>
                  </div>

                  {/* Mach 2.0 */}
                  <div className="p-1.5 border border-orange-900/40 bg-black/40">
                    <span className="text-orange-500 block">⚡ SPRINT (MACH 2.0)</span>
                    <span className="font-bold text-orange-200">
                      {measurement.timeSupersonicMach2.hours > 0 ? `${measurement.timeSupersonicMach2.hours}h ` : ''}
                      {measurement.timeSupersonicMach2.minutes}m
                    </span>
                  </div>

                  {/* Drone 180 km/h */}
                  <div className="p-1.5 border border-yellow-900/40 bg-black/40">
                    <span className="text-yellow-500 block">🛸 DRONE (180 KM/H)</span>
                    <span className="font-bold text-yellow-200">
                      {measurement.timeDroneCruise.hours > 0 ? `${measurement.timeDroneCruise.hours}h ` : ''}
                      {measurement.timeDroneCruise.minutes}m
                    </span>
                  </div>

                  {/* Hypersonic Mach 5 */}
                  <div className="p-1.5 border border-red-900/40 bg-black/40">
                    <span className="text-red-500 block">💥 HYPERSONIC (MACH 5)</span>
                    <span className="font-bold text-red-300">
                      {measurement.timeBallisticMach5.hours > 0 ? `${measurement.timeBallisticMach5.hours}h ` : ''}
                      {measurement.timeBallisticMach5.minutes}m
                    </span>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* Strategic Threat Hubs Selector */}
          <div className="pt-2 border-t border-amber-950/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span className="text-[8px] text-amber-500 font-bold">THREAT RADIUS RINGS:</span>
              <button 
                onClick={() => { sfx.playClick(); onToggleThreatRings(); }}
                className={`px-2 py-0.5 border text-[8px] font-bold tracking-wider transition-all ${
                  threatRingsEnabled ? "border-red-500 bg-red-950/60 text-red-300" : "border-amber-900/40 text-amber-700 hover:text-amber-300"
                }`}
              >
                [{threatRingsEnabled ? "ON" : "OFF"}]
              </button>
            </div>

            {threatRingsEnabled && (
              <div className="flex flex-wrap items-center gap-1">
                {STRATEGIC_THREAT_HUBS.map((hub) => {
                  const isSelected = selectedThreatHub?.id === hub.id;
                  return (
                    <button
                      key={hub.id}
                      onClick={() => {
                        sfx.playClick();
                        onSelectThreatHub(isSelected ? null : hub);
                      }}
                      className={`px-1.5 py-0.5 border text-[7px] transition-all ${
                        isSelected 
                          ? "border-amber-400 bg-amber-950 text-amber-200 font-bold" 
                          : "border-amber-900/30 text-amber-700 hover:text-amber-400"
                      }`}
                    >
                      {hub.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
