"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, ShieldAlert, Fingerprint, Map, DollarSign, Database, Server, Smartphone, MessagesSquare, Hash, Zap, Scan, Terminal, Cpu } from "lucide-react";
import toolsData from "@/data/tools.json";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, any> = {
  "AI & Threat Detection": Cpu,
  "Archives & Databases": Database,
  "Blockchain & Cryptocurrency": Hash,
  "Business & Corporate Registers": Server,
  "Classifieds & E-commerce": DollarSign,
  "Cloud Security & Recon": Server,
  "Compliance, Sanctions & Legal": ShieldAlert,
  "Cyber Threat Intelligence (CTI)": Scan,
  "Dark Web & Anonymity": Fingerprint,
  "Dating & Communities": MessagesSquare,
  "Digital Forensics & Incident Response (DFIR)": Zap,
  "Domain & IP Analysis": Terminal,
  "Email & Username OSINT": MessagesSquare,
  "Encoding & Data Conversion": Hash,
  "Geospatial & Mapping": Map,
  "Media & Document Analysis": LayoutGrid,
  "Phone OSINT": Smartphone,
  "Social Media Intelligence (SOCMINT)": MessagesSquare,
  "Transportation OSINT": Map,
  "OSINT Training & Guides": LayoutGrid,
  "Miscellaneous OSINT": LayoutGrid,
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(toolsData.map(t => t.category));
    return Array.from(cats).sort();
  }, []);

  // Filter tools
  const filteredTools = useMemo(() => {
    return toolsData.filter(tool => {
      const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
      const matchesSearch = searchQuery 
        ? tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex h-full flex-col lg:flex-row bg-[#0a0a0c] text-cyan-50 selection:bg-cyan-500/30 font-sans relative overflow-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)',
             backgroundSize: '30px 30px',
             backgroundPosition: 'center center'
           }}>
      </div>
      
      {/* Cyberpunk Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      {/* Cyberpunk Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-[#0d0d12]/90 border-r border-cyan-900/40 flex flex-col h-auto lg:h-full lg:sticky top-0 z-10 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,255,255,0.05)]">
        
        {/* Header Branding */}
        <div className="p-6 border-b border-cyan-900/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center gap-3 uppercase relative z-10">
            <Scan className="w-7 h-7 text-cyan-400" />
            <span className="drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">SHOMER</span>
            <span className="text-xs font-mono text-cyan-400/50 absolute -bottom-3 left-10 tracking-widest">OSINT_NET</span>
          </h1>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(0,255,255,1)]"></div>
            <p className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">
              SYS.STATUS: <span className="text-cyan-300">ONLINE</span>
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left relative overflow-hidden group border",
              selectedCategory === null 
                ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-[inset_0_0_12px_rgba(0,255,255,0.1)]" 
                : "bg-transparent text-neutral-400 border-transparent hover:border-cyan-900/50 hover:text-cyan-100 hover:bg-cyan-950/20"
            )}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
          >
            {selectedCategory === null && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>
            )}
            <LayoutGrid className={cn("w-4 h-4", selectedCategory === null ? "text-cyan-400" : "text-neutral-500 group-hover:text-cyan-400")} />
            <span className="font-mono uppercase tracking-wide">Global Feed</span>
            <span className="ml-auto text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 border border-cyan-900/50">{toolsData.length}</span>
          </button>
          
          <div className="pt-6 pb-2 flex items-center gap-2">
            <div className="h-px bg-cyan-900/50 flex-1"></div>
            <h3 className="text-[10px] font-bold text-cyan-500/50 uppercase tracking-[0.2em] font-mono">
              Datastreams
            </h3>
            <div className="h-px bg-cyan-900/50 flex-1"></div>
          </div>

          {categories.map(category => {
            const Icon = CATEGORY_ICONS[category] || LayoutGrid;
            const count = toolsData.filter(t => t.category === category).length;
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left relative overflow-hidden group border",
                  isSelected
                    ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-[inset_0_0_12px_rgba(0,255,255,0.1)]" 
                    : "bg-transparent text-neutral-400 border-transparent hover:border-cyan-900/50 hover:text-cyan-100 hover:bg-cyan-950/20"
                )}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isSelected ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" : "text-neutral-600 group-hover:text-cyan-500")} />
                <span className="truncate flex-1 font-mono text-[11px] uppercase tracking-wider">{category}</span>
                <span className="text-[10px] font-mono text-cyan-600 group-hover:text-cyan-400 transition-colors">[{count}]</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full overflow-hidden">
        
        {/* Cyberpunk Header */}
        <header className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-cyan-900/30 px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-500" />
              {selectedCategory || "Global Feed"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-0.5 w-8 bg-cyan-500/50"></div>
              <p className="text-cyan-500/50 text-xs font-mono uppercase tracking-widest">
                Nodes active: <span className="text-cyan-400">{filteredTools.length}</span>
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-sm opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
            <div className="relative flex items-center bg-[#0d0d12] border border-cyan-900/50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
              <Search className="absolute left-3 w-4 h-4 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="QUERY DATABANKS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-cyan-100 placeholder:text-cyan-800 focus:outline-none font-mono uppercase tracking-wider"
              />
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr pb-20">
              {filteredTools.map((tool, idx) => (
                <ToolCard key={`${tool.url}-${idx}`} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center relative">
              <div className="absolute inset-0 bg-cyan-900/5 blur-3xl rounded-full"></div>
              <div className="w-24 h-24 border border-cyan-900/50 bg-[#0d0d12] flex items-center justify-center mb-6 relative" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <Search className="w-10 h-10 text-cyan-700" />
                <div className="absolute inset-0 border border-cyan-500/20 animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              </div>
              <h3 className="text-xl font-bold text-cyan-100 uppercase tracking-widest font-mono">No nodes found</h3>
              <p className="text-cyan-600/70 mt-2 max-w-md font-mono text-xs uppercase leading-relaxed">
                The requested query returned zero matches in the current datastream.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="mt-8 px-6 py-2.5 bg-[#0d0d12] border border-cyan-700 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest transition-all relative overflow-hidden group"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                Reset Query
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
