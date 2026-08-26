"use client";

import { useState, useEffect } from "react";
import { Cpu, Terminal, PocketKnife } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] bg-[#0a0600] text-amber-500 font-mono flex flex-col items-center justify-center overflow-hidden">
      {/* Scanline */}
      <div className="absolute inset-0 h-[10px] bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-scanline pointer-events-none" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(245,158,11,0.03)_2px,rgba(245,158,11,0.03)_4px)] pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] opacity-90 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Middle Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 border-4 border-amber-500/20 blur-xl rounded-full" />
            <div className="absolute inset-2 border border-amber-500/50 animate-[spin_3s_linear_infinite] rounded-full" />
            <div className="relative bg-[#0a0600] p-6 border border-amber-500/30 rounded-full" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
               <PocketKnife className="w-16 h-16 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-[0.3em] drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] flex items-center gap-3">
             DAVI <span className="text-amber-500">SWISS KNIFE</span>
             <span className="px-2 py-0.5 text-xs bg-amber-950 text-amber-400 border border-amber-800 tracking-widest rounded-sm">OSINT</span>
          </h1>
          <p className="mt-2 text-sm text-amber-700 tracking-widest font-mono">GLOBAL THREAT INTELLIGENCE MATRIX</p>
          
          {/* Terminal Box */}
          <div className="mt-12 w-full max-w-2xl bg-black/50 border border-amber-900/50 p-4 font-mono text-xs text-amber-500/80 rounded-sm">
            <p className="text-amber-400 mb-2">&gt; SYSTEM IDENTIFICATION: DAVI SWISS KNIFE</p>
            <p>&gt; AUTHORIZATION: ROOT ACCESS GRANTED</p>
            <p>&gt; ESTABLISHING NEURAL LINK... [OK]</p>
            <p>&gt; SYNCING GLOBAL SATELLITE FEEDS... [OK]</p>
            <p className="mt-4 text-[10px] text-amber-800 uppercase">Warning: Information displayed is live and unredacted.</p>
          </div>
        </div>

        {/* Bottom Action & Credit */}
        <div className="p-8 flex flex-col items-center gap-4 z-10">
          <div className="text-xs tracking-[0.2em] text-amber-600/80 text-center flex flex-col items-center gap-2">
            <span>Put together by Davi Martins, follow me on</span>
            <a 
              href="https://www.linkedin.com/in/davi-martins-a40349136/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition-all font-bold tracking-widest text-xs rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              [ LINKEDIN ]
            </a>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <button 
              onClick={() => setBooted(true)}
              className="px-8 py-3 bg-amber-500/10 border border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black font-bold tracking-[0.3em] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-amber-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              &gt; INITIALIZE DAVI SWISS KNIFE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
