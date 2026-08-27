"use client";

import { useState, useMemo } from "react";
import { 
  FileText, Download, Copy, Check, X, ShieldAlert, 
  Plane, Globe, Anchor, Wifi, Satellite as SatelliteIcon, 
  Printer, Sparkles, AlertTriangle, Flame, Compass
} from "lucide-react";
import { sfx } from "@/utils/sfxEngine";

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: any;
  conflicts: any[];
  flights: any[];
  satellites: any[];
  maritime: any[];
  cyber: any[];
  eonetEvents: any[];
  news: any[];
}

export default function SitrepModal({
  isOpen,
  onClose,
  target,
  conflicts = [],
  flights = [],
  satellites = [],
  maritime = [],
  cyber = [],
  eonetEvents = [],
  news = []
}: SitrepModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "markdown">("preview");

  const timestamp = useMemo(() => {
    return new Date().toUTCString();
  }, [isOpen]);

  const militaryFlights = useMemo(() => {
    return flights.filter((f: any) => f.type === "military" || f.flightType === "military");
  }, [flights]);

  const vipFlights = useMemo(() => {
    return flights.filter((f: any) => f.type === "vip" || f.flightType === "vip");
  }, [flights]);

  // Generate Clean Markdown String for Export / Copy
  const sitrepMarkdown = useMemo(() => {
    const lines: string[] = [];
    lines.push("# ========================================================");
    lines.push("# DAVI SWISS KNIFE // GLOBAL SITUATION REPORT (SITREP)");
    lines.push("# CLASSIFICATION: UNCLASSIFIED // DEFENSE & OSINT MATRIX");
    lines.push(`# DATE/TIME (UTC): ${timestamp}`);
    lines.push("# ========================================================");
    lines.push("");

    if (target) {
      lines.push("## 1. PRIMARY TARGET IN FOCUS");
      lines.push(`- **IDENTIFIER**: ${target.label || target.title || "UNKNOWN"}`);
      lines.push(`- **CATEGORY**: ${target.type?.toUpperCase() || "INTEL TARGET"}`);
      lines.push(`- **COORDINATES**: LAT ${target.lat?.toFixed(4)}, LNG ${target.lng?.toFixed(4)}`);
      if (target.country) lines.push(`- **NATION/ORIGIN**: ${target.country.toUpperCase()}`);
      if (target.altitude) lines.push(`- **ALTITUDE**: ${target.altitude}m | VELOCITY: ${target.velocity || 0}m/s`);
      if (target.desc) lines.push(`- **INTELLIGENCE SUMMARY**:\n  ${target.desc.replace(/\n/g, "\n  ")}`);
      lines.push("");
    }

    lines.push("## 2. STRATEGIC AIR RECONNAISSANCE & COMBAT PATROLS");
    lines.push(`- **ACTIVE MILITARY ISR ASSETS**: ${militaryFlights.length} tracked`);
    militaryFlights.slice(0, 10).forEach((f: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${f.callsign || f.title}** (${f.aircraftType || "ISR/COMBAT"}) — Origin: ${f.country || "UNKNOWN"} | Alt: ${f.altitude}m | Vel: ${f.velocity}m/s`);
    });
    if (vipFlights.length > 0) {
      lines.push(`- **VIP & DIPLOMATIC TRANSPORTS**: ${vipFlights.length} tracked`);
      vipFlights.slice(0, 5).forEach((f: any, idx: number) => {
        lines.push(`  ${idx + 1}. **${f.callsign || f.title}** (${f.aircraftType || "EXECUTIVE"}) — Nation: ${f.country || "GOVERNMENT"}`);
      });
    }
    lines.push("");

    lines.push("## 3. ORBITAL RECONNAISSANCE CONSTELLATIONS");
    lines.push(`- **TRACKED EARTH OBSERVATION BIRDS**: ${satellites.length} constellations active`);
    satellites.forEach((s: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${s.name || s.label}** [NORAD ${s.noradId || "N/A"}] — Operator: ${s.operator || "SPACE AGENCY"} | Sensor: ${s.sensor || "OPTICAL/SAR"} | Alt: ${s.altitude || 0}km`);
    });
    lines.push("");

    lines.push("## 4. ACTIVE THEATERS & ARMED CONFLICT ZONES");
    lines.push(`- **HOT ZONES TRACKED**: ${conflicts.length} incidents`);
    conflicts.slice(0, 8).forEach((c: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${c.label || c.title}** [LAT ${c.lat.toFixed(2)}, LNG ${c.lng.toFixed(2)}] — ${c.desc || "Active hostility reported"}`);
    });
    lines.push("");

    lines.push("## 5. MARITIME CHOKEPOINTS & CRITICAL INFRASTRUCTURE");
    lines.push(`- **KEY PASSAGES MONITORED**: ${maritime.length} maritime gateways`);
    maritime.forEach((m: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${m.label || m.title}** — Status: NORMAL COMMERCE / RESTRICTED TRANSIT`);
    });
    lines.push(`- **SUBSEA & CYBER INTERNET BACKBONES**: ${cyber.length} critical hubs`);
    cyber.forEach((cy: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${cy.label || cy.title}** — Node Integrity: OPERATIONAL`);
    });
    lines.push("");

    lines.push("## 6. GEOPHYSICAL & METEOROLOGICAL DISASTERS (NASA EONET)");
    lines.push(`- **ACTIVE HAZARDS TRACKED**: ${eonetEvents.length} events`);
    eonetEvents.slice(0, 8).forEach((e: any, idx: number) => {
      lines.push(`  ${idx + 1}. **${e.title || e.label}** (${e.category || "ENVIRONMENTAL"}) — Status: MONITORING`);
    });
    lines.push("");

    lines.push("## 7. GLOBAL OPEN SOURCE INTELLIGENCE (OSINT) WIRES");
    news.slice(0, 6).forEach((n: any, idx: number) => {
      lines.push(`  ${idx + 1}. [${n.source || "WIRE"}] **${n.title}** (${n.pubDate || "RECENT"})`);
    });
    lines.push("");
    lines.push("# ========================================================");
    lines.push("# END OF SITREP // AUTOMATED VIA DAVI SWISS KNIFE OSINT CORE");
    lines.push("# ========================================================");

    return lines.join("\n");
  }, [target, timestamp, militaryFlights, vipFlights, satellites, conflicts, maritime, cyber, eonetEvents, news]);

  // Handle Copy to Clipboard
  const handleCopy = () => {
    sfx.playClick();
    navigator.clipboard.writeText(sitrepMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Download as Markdown
  const handleDownload = () => {
    sfx.playClick();
    const element = document.createElement("a");
    const file = new Blob([sitrepMarkdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `SITREP_DAVI_SWISS_KNIFE_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle Print / PDF Generation
  const handlePrint = () => {
    sfx.playClick();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#02050e] border border-cyan-500/80 shadow-[0_0_40px_rgba(0,243,255,0.2)] flex flex-col font-mono text-cyan-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 bg-[#030a1c] border-b border-cyan-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.4)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-cyan-300 flex items-center gap-2">
                <span>EXECUTIVE SITREP COMPILER</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500 text-emerald-300">
                  REAL-TIME SYNTHESIS
                </span>
              </div>
              <div className="text-[8px] text-cyan-600 tracking-wider">
                TIMESTAMP (UTC): {timestamp}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex border border-cyan-900 bg-black/60 p-0.5 text-[9px]">
              <button 
                onClick={() => { sfx.playClick(); setActiveTab("preview"); }}
                className={`px-2.5 py-1 ${activeTab === "preview" ? "bg-cyan-950 text-cyan-200 border border-cyan-500" : "text-cyan-700 hover:text-cyan-300"}`}
              >
                DOCUMENT PREVIEW
              </button>
              <button 
                onClick={() => { sfx.playClick(); setActiveTab("markdown"); }}
                className={`px-2.5 py-1 ${activeTab === "markdown" ? "bg-cyan-950 text-cyan-200 border border-cyan-500" : "text-cyan-700 hover:text-cyan-300"}`}
              >
                RAW MARKDOWN
              </button>
            </div>

            <button 
              onClick={() => { sfx.playClick(); onClose(); }}
              className="p-1 text-cyan-600 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#01030a]">
          {activeTab === "preview" ? (
            <div className="space-y-6 text-xs leading-relaxed max-w-3xl mx-auto">
              
              {/* Header Box */}
              <div className="p-4 border border-cyan-800/60 bg-[#020714] relative">
                <div className="text-sm font-bold text-cyan-300 tracking-widest flex items-center justify-between border-b border-cyan-900/80 pb-2 mb-3">
                  <span>DAVI SWISS KNIFE // SITUATION REPORT</span>
                  <span className="text-[9px] text-amber-400 font-normal">UNCLASSIFIED // OSINT</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
                  <div>
                    <span className="text-cyan-600 block">TOTAL MIL ISR FLIGHTS:</span>
                    <span className="font-bold text-[#ff003c]">{militaryFlights.length} PATROLS</span>
                  </div>
                  <div>
                    <span className="text-cyan-600 block">ACTIVE SATELLITES:</span>
                    <span className="font-bold text-cyan-300">{satellites.length} ORBITS</span>
                  </div>
                  <div>
                    <span className="text-cyan-600 block">ARMED CONFLICTS:</span>
                    <span className="font-bold text-amber-400">{conflicts.length} THEATERS</span>
                  </div>
                  <div>
                    <span className="text-cyan-600 block">NATURAL HAZARDS:</span>
                    <span className="font-bold text-purple-300">{eonetEvents.length} EVENTS</span>
                  </div>
                </div>
              </div>

              {/* Target Focus Section if available */}
              {target && (
                <div className="p-3.5 border-l-2 border-amber-500 bg-amber-950/15">
                  <div className="text-[10px] font-bold text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" /> PRIMARY TARGET IN FOCUS
                  </div>
                  <div className="text-sm font-bold text-amber-200">{target.label || target.title}</div>
                  <div className="text-[9px] text-amber-500/80 mt-0.5">
                    LAT: {target.lat?.toFixed(4)} | LNG: {target.lng?.toFixed(4)} | TYPE: {target.type?.toUpperCase()}
                  </div>
                  {target.desc && (
                    <div className="text-[10px] text-amber-300/90 mt-2 bg-black/40 p-2 border border-amber-900/40">
                      {target.desc}
                    </div>
                  )}
                </div>
              )}

              {/* Section 2: Military Recon */}
              <div>
                <div className="text-xs font-bold text-cyan-400 border-b border-cyan-900 pb-1 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ff003c]" /> 1. STRATEGIC AIR RECONNAISSANCE & PATROLS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {militaryFlights.slice(0, 6).map((f: any, idx: number) => (
                    <div key={idx} className="p-2 border border-red-900/40 bg-red-950/10 text-[9px]">
                      <div className="font-bold text-red-300 flex justify-between">
                        <span>{f.callsign || f.title}</span>
                        <span className="text-red-500">{f.country || "UNKNOWN"}</span>
                      </div>
                      <div className="text-cyan-700 mt-1">
                        ALT: {f.altitude}m | SPD: {f.velocity}m/s | TYPE: {f.aircraftType || "MIL RECON"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Satellite Constellations */}
              <div>
                <div className="text-xs font-bold text-cyan-400 border-b border-cyan-900 pb-1 mb-2 flex items-center gap-1.5">
                  <SatelliteIcon className="w-3.5 h-3.5 text-cyan-400" /> 2. ORBITAL SATELLITE RECONNAISSANCE (NORAD)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {satellites.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 border border-cyan-900/40 bg-cyan-950/20 text-[9px]">
                      <div className="font-bold text-cyan-300">{s.name || s.label}</div>
                      <div className="text-cyan-600 mt-0.5 text-[8px]">NORAD ID: {s.noradId}</div>
                      <div className="text-cyan-700 text-[8px] mt-1">
                        {s.sensor || "OPTICAL / MULTISPECTRAL"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Theaters & Armed Conflicts */}
              <div>
                <div className="text-xs font-bold text-cyan-400 border-b border-cyan-900 pb-1 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-yellow-400" /> 3. ACTIVE ARMED CONFLICT THEATERS
                </div>
                <div className="space-y-1.5">
                  {conflicts.slice(0, 5).map((c: any, idx: number) => (
                    <div key={idx} className="p-2 border border-yellow-900/30 bg-yellow-950/10 text-[9px]">
                      <div className="font-bold text-yellow-300">{c.label || c.title}</div>
                      <div className="text-cyan-700 text-[8px] mt-0.5">{c.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Natural Disasters */}
              <div>
                <div className="text-xs font-bold text-cyan-400 border-b border-cyan-900 pb-1 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> 4. GEOPHYSICAL & SEVERE WEATHER HAZARDS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {eonetEvents.slice(0, 6).map((e: any, idx: number) => (
                    <div key={idx} className="p-2 border border-orange-900/30 bg-orange-950/10 text-[9px]">
                      <div className="font-bold text-orange-300">{e.title || e.label}</div>
                      <div className="text-cyan-700 text-[8px] mt-0.5">CAT: {e.category || "NATURAL EVENT"}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <pre className="text-[10px] leading-relaxed text-cyan-300 whitespace-pre-wrap font-mono p-4 bg-black/60 border border-cyan-950 select-all">
              {sitrepMarkdown}
            </pre>
          )}
        </div>

        {/* Action Footer Bar */}
        <div className="p-3 bg-[#030918] border-t border-cyan-900 flex flex-wrap items-center justify-between gap-2 text-[9px]">
          <div className="text-cyan-600 flex items-center gap-2">
            <span>READY FOR IMMEDIATE BRIEFING DISTRIBUTION</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)] cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY SITREP"}</span>
            </button>

            <button 
              onClick={handleDownload}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-[#00ff88] text-[#00ff88] font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,255,136,0.2)] cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>DOWNLOAD MARKDOWN (.MD)</span>
            </button>

            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900 border border-amber-500 text-amber-300 font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>PRINT / PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
