import type { Metadata } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import Link from "next/link";
import { Scan, Activity, Map, TerminalSquare, Newspaper, Globe2, Crosshair, Cpu, Database, Wifi } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const techMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-tech" });

export const metadata: Metadata = {
  title: "SHOMER // J.A.R.V.I.S CORE",
  description: "Advanced Threat Intelligence & OSINT HUD",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${techMono.variable}`}>
      <body className="antialiased bg-[#020205] text-cyan-400 font-tech overflow-hidden selection:bg-cyan-900 selection:text-cyan-100">
        
        {/* GLOBAL HUD OVERLAYS */}
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Scanline */}
          <div className="absolute inset-0 h-[10px] bg-cyan-400/10 shadow-[0_0_20px_rgba(0,255,255,0.3)] animate-scanline" />
          
          {/* Vignette & CRT curve */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] opacity-80" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.02)_2px,rgba(0,255,255,0.02)_4px)]" />

          {/* Corner Decals */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 opacity-70" />
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 opacity-70" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 opacity-70" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 opacity-70" />
        </div>

        <div className="flex flex-col h-screen relative z-10 p-4 pt-6 max-w-[1920px] mx-auto">
          
          {/* ── JARVIS TOP CONTROL BAR ── */}
          <header className="shrink-0 flex items-end justify-between border-b border-cyan-900/50 pb-2 mb-4">
            
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-1 border border-cyan-400/20 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-[0.3em] text-white drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                  SHOMER <span className="text-cyan-500">CORE</span>
                </h1>
                <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-cyan-600 mt-0.5">
                  <span className="flex items-center gap-1"><Wifi className="w-2.5 h-2.5 text-green-500" /> UPLINK: STABLE</span>
                  <span>//</span>
                  <span>SYS: MK-IV</span>
                </div>
              </div>
            </div>

            {/* Navigation Matrix */}
            <nav className="flex items-center gap-1 bg-[#020205] border border-cyan-900/50 p-1">
              <Link href="/" className="px-4 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-500 hover:bg-cyan-950/50 hover:text-cyan-300 transition-all border border-transparent hover:border-cyan-800">
                <Scan className="w-3 h-3" /> [ TOOLS ]
              </Link>
              <Link href="/geo" className="px-4 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-500 hover:bg-emerald-950/50 hover:text-emerald-300 transition-all border border-transparent hover:border-emerald-800">
                <Map className="w-3 h-3" /> [ NATIONS ]
              </Link>
              <Link href="/dorks" className="px-4 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-amber-500 hover:bg-amber-950/50 hover:text-amber-300 transition-all border border-transparent hover:border-amber-800">
                <TerminalSquare className="w-3 h-3" /> [ DORKS ]
              </Link>
              <div className="w-px h-6 bg-cyan-900/50 mx-1" />
              <Link href="/news" className="px-4 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-red-500 hover:bg-red-950/50 hover:text-red-300 transition-all border border-transparent hover:border-red-800">
                <Newspaper className="w-3 h-3" /> [ NEWS ]
              </Link>
              <Link href="/globe" className="px-4 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-950/50 hover:text-blue-300 transition-all border border-transparent hover:border-blue-800">
                <Globe2 className="w-3 h-3" /> [ PULSE ]
              </Link>
            </nav>

            {/* Telemetry Block */}
            <div className="text-right">
              <div className="text-[9px] text-cyan-600 tracking-[0.3em] mb-1 uppercase flex items-center justify-end gap-2">
                <Database className="w-2.5 h-2.5" /> SECURE LINK
              </div>
              <div className="text-[8px] text-cyan-800 tracking-widest font-mono">
                ENC: AES-256-GCM<br/>
                LATENCY: 14ms<br/>
                MEM: 8.4TB/12TB
              </div>
            </div>
          </header>

          {/* ── MAIN CONTENT AREA ── */}
          <main className="flex-1 overflow-hidden relative">
            <div className="jarvis-corner-tl" />
            <div className="jarvis-corner-tr" />
            <div className="jarvis-corner-bl" />
            <div className="jarvis-corner-br" />
            <div className="absolute inset-0 p-4 overflow-hidden">
              {children}
            </div>
          </main>
          
        </div>
      </body>
    </html>
  );
}
