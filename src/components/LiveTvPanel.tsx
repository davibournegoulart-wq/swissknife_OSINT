"use client";

import { useState } from "react";
import { MonitorPlay, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { id: "UCNye-wNBqNL5ZzHSJj3l8Bg", name: "Al Jazeera English", region: "Middle East / Global" },
  { id: "UCoMdktPbSTixAyNGwb-PUkQ", name: "Sky News", region: "UK / Europe" },
  { id: "UCknLrEdhRCp1aegoMqRaCEg", name: "DW News", region: "Germany / Europe" },
  { id: "UCpgHQVW85B4_7h6oK6B581g", name: "ABC News", region: "Australia / Oceania" },
  { id: "UCQfwfsi5VrQ8yKZ-UWmAEFg", name: "France 24", region: "France / Europe" },
  { id: "UCeY0bbntWzzVIaj2z3QigXg", name: "NBC News", region: "USA / Americas" },
  { id: "UC_gUM8rL-Lrg6O3adPW9K1g", name: "WION", region: "India / Asia" },
  { id: "UC16niRr50-MSBwiO3YDb3RA", name: "BBC News", region: "UK / Global" }
];

export function LiveTvPanel({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(CHANNELS[0]);

  return (
    <div className="absolute inset-0 z-50 bg-[#080810]/98 backdrop-blur-xl flex flex-col p-6 border-l border-cyan-900/50">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3 text-cyan-400">
          <MonitorPlay className="w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-black tracking-widest uppercase">GLOBAL LIVE TV STREAMS</h2>
        </div>
        <button onClick={onClose} className="text-cyan-600 hover:text-cyan-400 font-mono text-sm uppercase border border-cyan-900/50 px-3 py-1 hover:bg-cyan-950/30">
          [ CLOSE ]
        </button>
      </div>
      
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActive(ch)}
              className={cn("text-left p-3 border transition-all flex flex-col gap-1",
                active.id === ch.id ? "bg-cyan-950/40 border-cyan-500" : "border-cyan-900/30 hover:border-cyan-700 bg-[#050a10]"
              )}>
              <span className={cn("text-xs font-black uppercase tracking-wider", active.id === ch.id ? "text-cyan-300" : "text-neutral-400")}>{ch.name}</span>
              <span className="text-[9px] font-mono text-cyan-700">{ch.region}</span>
            </button>
          ))}
        </div>
        
        {/* Player */}
        <div className="flex-1 bg-black border border-cyan-900/50 relative overflow-hidden flex flex-col">
          <div className="shrink-0 p-2 border-b border-cyan-900/50 bg-[#050a10] flex items-center justify-between">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">LIVE SIGNAL INTERCEPT: {active.name}</span>
             </div>
          </div>
          <iframe 
            src={`https://www.youtube.com/embed/live_stream?channel=${active.id}&autoplay=1&mute=1`}
            className="w-full flex-1"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
