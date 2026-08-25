import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Scan, Globe, Activity, Map } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SHOMER OSINT_NET",
  description: "Advanced Cyberpunk OSINT Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0c] text-cyan-50 antialiased overflow-hidden flex flex-col h-screen`}>
        {/* Global Navigation Bar */}
        <nav className="h-14 bg-[#0d0d12] border-b border-cyan-900/40 flex items-center justify-between px-6 shrink-0 relative z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Scan className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
              <span className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase text-sm">
                SHOMER <span className="opacity-50">CORE</span>
              </span>
            </Link>
            
            <div className="h-4 w-px bg-cyan-900/50 shrink-0"></div>
            
            <Link href="/" className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 hover:text-cyan-300 transition-colors flex items-center gap-2 shrink-0">
              <Activity className="w-3.5 h-3.5" />
              OSINT Tools
            </Link>
            
            <Link href="/geo" className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-emerald-600 hover:text-emerald-300 transition-colors flex items-center gap-2 shrink-0">
              <Map className="w-3.5 h-3.5" />
              Geo-Intel
            </Link>

            <Link href="/media" className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-fuchsia-600 hover:text-fuchsia-300 transition-colors flex items-center gap-2 shrink-0">
              <Globe className="w-3.5 h-3.5" />
              Global Media
            </Link>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <span className="hidden sm:inline text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">SECURE LINK</span>
          </div>
        </nav>
        
        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </body>
    </html>
  );
}
