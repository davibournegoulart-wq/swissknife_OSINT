"use client";

import { useState } from "react";
import toolsData from "@/data/tools.json";
import { ToolCard } from "@/components/ToolCard";
import { 
  Search, Grid, Shield, Fingerprint, Database, Code, 
  MapPin, Coins, Monitor, FileSearch, HardDrive, Filter, Activity, Server
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, any> = {
  "Search Engines": Search,
  "Social Media Intelligence (SOCMINT)": Fingerprint,
  "Public Records & Background Checks": Database,
  "IP & Domain Intelligence": Server,
  "Breach & Leak Data": Shield,
  "Dark Web Intelligence": HardDrive,
  "Cryptocurrency & Blockchain": Coins,
  "Geospatial Intelligence (GEOINT)": MapPin,
  "Corporate & Financial Data": Activity,
  "Developer & Code Repositories": Code,
  "Web Archives & History": FileSearch,
  "Image & Video Forensics": Monitor,
  "Threat Intelligence": Shield,
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(toolsData.map(t => t.category)))].sort();

  const filteredTools = toolsData.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full max-h-full overflow-hidden bg-transparent">
      
      {/* ── LEFT PANEL (HUD CONTROLS) ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-cyan-900/40 pr-4 mr-4">
        
        {/* Status Block */}
        <div className="bg-[#050a10] border border-cyan-800/50 p-4 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/10" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          <h2 className="text-sm font-black text-cyan-400 tracking-widest uppercase mb-1">DATASTREAMS</h2>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-cyan-600 uppercase">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            Active Nodes: {filteredTools.length}
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || Grid;
            const count = cat === "All" ? toolsData.length : toolsData.filter(t => t.category === cat).length;
            const active = selectedCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-all border",
                  active 
                    ? "bg-cyan-950/50 border-cyan-500 text-cyan-300" 
                    : "border-transparent text-cyan-700 hover:text-cyan-400 hover:bg-[#050a10]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-cyan-400" : "text-cyan-800")} />
                <span className="truncate flex-1">{cat}</span>
                <span className={cn("text-[9px]", active ? "text-cyan-500" : "text-cyan-900")}>
                  [{count.toString().padStart(3, '0')}]
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN MATRIX ── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top HUD Bar */}
        <div className="flex items-center gap-4 mb-4 shrink-0 border-b border-cyan-900/30 pb-4">
          <div className="text-xl font-bold text-cyan-500 tracking-[0.2em] uppercase flex items-center gap-3 shrink-0">
            <span className="text-cyan-700">&gt;_</span> GLOBAL FEED
          </div>
          <div className="flex-1 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-700" />
            <input
              type="text"
              placeholder="QUERY DATABANKS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#050a10]/80 border border-cyan-800 text-cyan-300 text-xs tracking-[0.2em] uppercase py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-400 focus:bg-[#08121d] transition-all placeholder:text-cyan-900"
            />
            <div className="absolute right-0 top-0 h-full w-2 bg-cyan-900/30" />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filteredTools.map((tool, idx) => (
              <ToolCard key={idx} tool={tool} />
            ))}
          </div>
          {filteredTools.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-cyan-900/50 mt-4">
              <Shield className="w-12 h-12 text-cyan-900 mb-3" />
              <p className="text-xs text-cyan-600 tracking-[0.3em] uppercase">No intelligence found matching query.</p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
