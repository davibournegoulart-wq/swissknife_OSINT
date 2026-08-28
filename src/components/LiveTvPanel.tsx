"use client";

import { useState } from "react";
import { MonitorPlay, X, LayoutGrid, LayoutTemplate, Square, Rows, Volume2, VolumeX, Maximize2, Minimize2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { id: "UCNye-wNBqNL5ZzHSJj3l8Bg", name: "Al Jazeera (EN)", region: "Middle East / Global", language: "English" },
  { id: "UCfiwzLy-8yKzIbsmZTzxDgw", name: "Al Jazeera (AR)", region: "Middle East", language: "Arabic" },
  { id: "UCoMdktPbSTixAyNGwb-PUkQ", name: "Sky News", region: "UK / Europe", language: "English" },
  { id: "UC16niRr50-MSBwiO3YDb3RA", name: "BBC News", region: "UK / Global", language: "English" },
  { id: "UCQfwfsi5VrQ8yKZ-UWmAEFg", name: "France 24 (EN)", region: "France / Europe", language: "English" },
  { id: "UCCCPCZNChQdGa9EkATeye4g", name: "France 24 (FR)", region: "France / Europe", language: "French" },
  { id: "UCudX1i9V_oR5_n7y3k9wO3g", name: "France 24 (ES)", region: "France / Europe", language: "Spanish" },
  { id: "UCdTyuXgmJkG_O8_75eqej-w", name: "France 24 (AR)", region: "France / Europe", language: "Arabic" },
  { id: "UCknLrEdhRCp1aegoMqRaCEg", name: "DW News (EN)", region: "Germany / Global", language: "English" },
  { id: "UCT4GcvAoKQYMBhlUOqzuXIA", name: "DW Español", region: "Germany / Global", language: "Spanish" },
  { id: "UC1n6hQjGz1g7d9E1uUeqqCQ", name: "DW Arabic", region: "Germany / Global", language: "Arabic" },
  { id: "UCSrZ3GW4E1YYNtvlX4M5s4Q", name: "Euronews", region: "Europe", language: "English" },
  { id: "UCpgHQVW85B4_7h6oK6B581g", name: "ABC News", region: "Australia / Oceania", language: "English" },
  { id: "UCeY0bbntWzzVIaj2z3QigXg", name: "NBC News", region: "USA / Americas", language: "English" },
  { id: "UC8p1vwvWtl6T73JiExfWs1g", name: "CBS News", region: "USA / Americas", language: "English" },
  { id: "UCIALMKvObZNtJ3RVq5ErRVg", name: "Bloomberg", region: "USA / Global Markets", language: "English" },
  { id: "UC_gUM8rL-Lrg6O3adPW9K1g", name: "WION", region: "India / Asia", language: "English" },
  { id: "UC83jt4dlz1Gjl58fzQrrKZg", name: "CNA", region: "Singapore / Asia", language: "English" },
  { id: "UCY-p2B2Vv2U7e8-z7c3M2OQ", name: "Arirang TV", region: "South Korea / Asia", language: "English" },
  { id: "UC7fWeaHhqgM4Ry-RMpM2YYw", name: "TRT World", region: "Turkey / Global", language: "English" },
  { id: "UCO0akOQLLxT00s-vM9C80_w", name: "Record News", region: "Brazil / Americas", language: "Portuguese" },
  { id: "UCCqK_z_xY8M0sO9aKzG1ZpQ", name: "CNN Brasil", region: "Brazil / Americas", language: "Portuguese" }
];

export function LiveTvPanel({ onClose }: { onClose: () => void }) {
  const [layout, setLayout] = useState<"1x1" | "1x2" | "2x2">("2x2");
  const [slots, setSlots] = useState<(typeof CHANNELS[0] | null)[]>([
    CHANNELS[0], CHANNELS[2], CHANNELS[4], CHANNELS[15]
  ]);
  const [activeAudioSlot, setActiveAudioSlot] = useState<number>(0);
  const [activeSlotSelection, setActiveSlotSelection] = useState<number>(0);
  const [isCleanMode, setIsCleanMode] = useState(false);

  const handleChannelSelect = (channel: typeof CHANNELS[0]) => {
    const newSlots = [...slots];
    newSlots[activeSlotSelection] = channel;
    setSlots(newSlots);
  };

  const activeChannelIds = slots.filter(Boolean).map(s => s!.id);

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] bg-[#02050c] flex",
      isCleanMode ? "" : "p-4 gap-4"
    )}>
      
      {/* Sidebar (Hidden in Clean Mode) */}
      {!isCleanMode && (
        <div className="w-80 shrink-0 flex flex-col bg-[#040814] border border-cyan-900/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10">
          <div className="p-4 border-b border-cyan-900/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <MonitorPlay className="w-5 h-5 animate-pulse" />
                <h2 className="text-sm font-black tracking-widest uppercase">GLOBAL VIDEO WALL</h2>
              </div>
              <button onClick={onClose} className="p-1 text-cyan-600 hover:text-red-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setLayout("1x1")} className={cn("flex flex-col items-center justify-center p-2 border gap-1 transition-colors", layout === "1x1" ? "border-amber-500 text-amber-400 bg-amber-950/30" : "border-cyan-900/50 text-cyan-600 hover:text-cyan-400")}>
                <Square className="w-4 h-4" />
                <span className="text-[9px] font-mono">1 STREAM</span>
              </button>
              <button onClick={() => setLayout("1x2")} className={cn("flex flex-col items-center justify-center p-2 border gap-1 transition-colors", layout === "1x2" ? "border-amber-500 text-amber-400 bg-amber-950/30" : "border-cyan-900/50 text-cyan-600 hover:text-cyan-400")}>
                <Rows className="w-4 h-4" />
                <span className="text-[9px] font-mono">2 STREAMS</span>
              </button>
              <button onClick={() => setLayout("2x2")} className={cn("flex flex-col items-center justify-center p-2 border gap-1 transition-colors", layout === "2x2" ? "border-amber-500 text-amber-400 bg-amber-950/30" : "border-cyan-900/50 text-cyan-600 hover:text-cyan-400")}>
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[9px] font-mono">4 STREAMS</span>
              </button>
            </div>
          </div>
          
          <div className="p-2 border-b border-cyan-900/50 bg-cyan-950/10 flex items-center justify-between text-[9px] font-mono text-cyan-500">
            <span>SELECT CHANNEL FOR SLOT:</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].slice(0, layout === "1x1" ? 1 : layout === "1x2" ? 2 : 4).map(slotIdx => (
                <button key={slotIdx} onClick={() => setActiveSlotSelection(slotIdx)}
                  className={cn("w-5 h-5 border flex items-center justify-center font-black", activeSlotSelection === slotIdx ? "bg-cyan-500 text-black border-cyan-400" : "border-cyan-900/60 text-cyan-600 hover:border-cyan-500")}>
                  {slotIdx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1.5">
            {CHANNELS.map(ch => {
              const isSelected = activeChannelIds.includes(ch.id);
              return (
                <button key={ch.id} onClick={() => handleChannelSelect(ch)}
                  className={cn("text-left p-2.5 border transition-all flex flex-col gap-0.5",
                    isSelected ? "border-cyan-500/50 bg-cyan-950/20" : "border-cyan-900/30 hover:border-cyan-700 bg-transparent"
                  )}>
                  <div className="flex justify-between items-center">
                    <span className={cn("text-[11px] font-black uppercase tracking-wider", isSelected ? "text-cyan-300" : "text-neutral-400")}>{ch.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[8px] font-mono text-cyan-700">{ch.region}</span>
                    <span className="text-[8px] font-mono text-cyan-600 px-1 border border-cyan-900/50">{ch.language}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className={cn("flex-1 relative flex flex-col", isCleanMode ? "bg-black" : "bg-[#050810] border border-cyan-900/50")}>
        
        {/* HUD Overlay toggle */}
        <button 
          onClick={() => setIsCleanMode(!isCleanMode)}
          className={cn("absolute top-4 left-4 z-50 p-2 border transition-all backdrop-blur-md flex items-center gap-2", 
            isCleanMode ? "border-white/20 text-white/50 bg-black/40 hover:bg-black/60 hover:text-white" : "border-cyan-500 text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900")}
          title={isCleanMode ? "Show Sidebar & Controls" : "Clean Screen Mode"}
        >
          {isCleanMode ? <Maximize2 className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
          {isCleanMode && <span className="text-[9px] font-mono tracking-widest uppercase">EXIT CLEAN MODE</span>}
        </button>

        <div className={cn(
          "w-full h-full grid gap-1 p-1",
          layout === "1x1" ? "grid-cols-1 grid-rows-1" :
          layout === "1x2" ? "grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1" :
          "grid-cols-2 grid-rows-2"
        )}>
          {[0, 1, 2, 3].slice(0, layout === "1x1" ? 1 : layout === "1x2" ? 2 : 4).map(idx => {
            const channel = slots[idx];
            const isAudioActive = activeAudioSlot === idx;
            
            return (
              <div key={idx} className={cn("relative group border", isAudioActive ? "border-amber-500" : "border-cyan-900/50")}>
                {channel ? (
                  <>
                    <div className="absolute top-0 right-0 z-40 p-2 flex items-center gap-2 bg-gradient-to-bl from-black/80 to-transparent pointer-events-none">
                       {isAudioActive ? (
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[9px] font-mono">
                           <Volume2 className="w-3 h-3" /> AUDIO LIVE
                         </div>
                       ) : (
                         <button onClick={() => setActiveAudioSlot(idx)} className="flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-white/20 text-white/60 hover:text-white hover:border-white/50 text-[9px] font-mono pointer-events-auto transition-colors">
                           <VolumeX className="w-3 h-3" /> MUTED
                         </button>
                       )}
                       {!isCleanMode && (
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-red-950/80 border border-red-500 text-red-400 text-[9px] font-mono uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> {channel.name}
                         </div>
                       )}
                    </div>
                    <iframe 
                      src={`https://www.youtube.com/embed/live_stream?channel=${channel.id}&autoplay=1&mute=${isAudioActive ? "0" : "1"}&controls=${isCleanMode ? "0" : "1"}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 text-cyan-900/60 font-mono">
                    <MonitorPlay className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm tracking-widest">NO SIGNAL [SLOT {idx + 1}]</span>
                    {!isCleanMode && <span className="text-[10px] mt-2">SELECT A CHANNEL FROM THE SIDEBAR</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
