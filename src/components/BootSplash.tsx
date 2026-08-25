"use client";

import { useState, useEffect } from "react";
import { Cpu, Terminal } from "lucide-react";

export function BootSplash() {
  const [booted, setBooted] = useState(false);
  const [textStage, setTextStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setTextStage(1), 500);
    const t2 = setTimeout(() => setTextStage(2), 1500);
    const t3 = setTimeout(() => setTextStage(3), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (booted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020205] text-cyan-500 font-mono flex flex-col items-center justify-center overflow-hidden">
      {/* Scanline */}
      <div className="absolute inset-0 h-[10px] bg-cyan-400/20 shadow-[0_0_20px_rgba(0,255,255,0.4)] animate-scanline pointer-events-none" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_2px,rgba(0,255,255,0.03)_4px)] pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] opacity-90 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Middle Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 border-4 border-cyan-500/20 blur-xl rounded-full" />
            <div className="absolute inset-2 border border-cyan-500/50 animate-[spin_3s_linear_infinite] rounded-full" />
            <div className="relative bg-[#020205] p-6 border border-cyan-500/30 rounded-full" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 text-cyan-400" strokeWidth="1.5">
                  <path d="M4 18L18 4" strokeLinecap="round"/>
                  <path d="M14 6L18 10" strokeLinecap="round"/>
                  <path d="M6 14L10 18" strokeLinecap="round"/>
                  <path d="M12 2L14 6L18 8L16 12L18 16L14 18L12 22L10 18L6 16L8 12L6 8L10 6L12 2Z" fill="currentColor" fillOpacity="0.2"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
               </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] flex items-center gap-3">
             SWISS <span className="text-cyan-500">KNIFE</span>
             <span className="px-2 py-0.5 text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-widest rounded-sm">OSINT</span>
          </h1>
          <p className="mt-2 text-sm text-cyan-700 tracking-widest font-mono">GLOBAL THREAT INTELLIGENCE MATRIX</p>
          
          {/* Terminal Box */}
          <div className="mt-12 w-full max-w-2xl bg-black/50 border border-cyan-900/50 p-4 font-mono text-xs text-cyan-500/80 rounded-sm">
            <p className="text-cyan-400 mb-2">&gt; SYSTEM IDENTIFICATION: SWISS KNIFE</p>
            <p>&gt; AUTHORIZATION: ROOT ACCESS GRANTED</p>
            <p>&gt; ESTABLISHING NEURAL LINK... [OK]</p>
            <p>&gt; SYNCING GLOBAL SATELLITE FEEDS... [OK]</p>
            <p className="mt-4 text-[10px] text-cyan-800 uppercase">Warning: Information displayed is live and unredacted.</p>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-8 flex flex-col items-center gap-4 z-10">
          <div className="mt-8 flex flex-col items-center gap-2">
            <button 
              onClick={() => setBooted(true)}
              className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold tracking-[0.3em] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-cyan-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              &gt; INITIALIZE SWISS KNIFE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
