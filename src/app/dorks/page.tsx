"use client";

import { useState, useMemo } from "react";
import { Search, TerminalSquare, ExternalLink, Code2, ShieldAlert, Copy, Check } from "lucide-react";
import dorksData from "@/data/dorks.json";
import { cn } from "@/lib/utils";

export default function DorksDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(dorksData.map(d => d.category));
    return Array.from(cats).filter(Boolean).sort();
  }, []);

  // Filter dorks
  const filteredDorks = useMemo(() => {
    return dorksData.filter(dork => {
      const matchesCategory = selectedCategory ? dork.category === selectedCategory : true;
      const matchesSearch = searchQuery 
        ? dork.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
          dork.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dork.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleExecuteDork = (dorkStr: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(dorkStr)}`;
    window.open(url, '_blank');
  };

  const handleCopyDork = (dorkStr: string, idx: number) => {
    navigator.clipboard.writeText(dorkStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row bg-[#0a0a0c] text-amber-50 selection:bg-amber-500/30 font-sans relative overflow-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)',
             backgroundSize: '30px 30px',
             backgroundPosition: 'center center'
           }}>
      </div>
      
      {/* Cyberpunk Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      {/* Cyberpunk Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-[#0d0d12]/90 border-r border-amber-900/40 flex flex-col h-auto lg:h-full lg:sticky top-0 z-10 backdrop-blur-xl shadow-[4px_0_24px_rgba(245,158,11,0.05)]">
        
        {/* Header Branding */}
        <div className="p-6 border-b border-amber-900/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
          
          <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 flex items-center gap-3 uppercase relative z-10">
            <TerminalSquare className="w-6 h-6 text-amber-400" />
            <span className="drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">DORK_ENGINE</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
          
          <div>
            <div className="pb-2 flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.2em] font-mono">
                Target Vectors
              </h3>
              <div className="h-px bg-amber-900/50 flex-1"></div>
            </div>
            
            <div className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 text-[11px] font-medium transition-all text-left relative overflow-hidden border font-mono uppercase tracking-wider mb-2",
                    selectedCategory === null
                      ? "bg-amber-950/40 text-amber-300 border-amber-500/50" 
                      : "bg-transparent text-neutral-500 border-transparent hover:border-amber-900/50 hover:text-amber-200 hover:bg-amber-950/20"
                  )}
                >
                  <Code2 className={cn("w-3 h-3 flex-shrink-0", selectedCategory === null ? "text-amber-400" : "text-neutral-700")} />
                  <span className="truncate flex-1">All Vectors</span>
                  <span className="text-[9px] text-amber-700">[{dorksData.length}]</span>
              </button>

              {categories.map(category => {
                const count = dorksData.filter(d => d.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-1.5 text-[11px] font-medium transition-all text-left relative overflow-hidden border font-mono uppercase tracking-wider",
                      selectedCategory === category
                        ? "bg-amber-950/40 text-amber-300 border-amber-500/50" 
                        : "bg-transparent text-neutral-500 border-transparent hover:border-amber-900/50 hover:text-amber-200 hover:bg-amber-950/20"
                    )}
                  >
                    <ShieldAlert className={cn("w-3 h-3 flex-shrink-0", selectedCategory === category ? "text-amber-400" : "text-neutral-700")} />
                    <span className="truncate flex-1">{category}</span>
                    <span className="text-[9px] text-amber-700">[{count}]</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full overflow-hidden">
        
        {/* Cyberpunk Header */}
        <header className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-amber-900/30 px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-amber-500" />
              {selectedCategory || "Global Search Queries"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-0.5 w-8 bg-amber-500/50"></div>
              <p className="text-amber-500/50 text-xs font-mono uppercase tracking-widest">
                Payloads ready: <span className="text-amber-400">{filteredDorks.length}</span>
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-red-500 rounded-sm opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
            <div className="relative flex items-center bg-[#0d0d12] border border-amber-900/50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
              <Search className="absolute left-3 w-4 h-4 text-amber-600 group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                placeholder="GREP PAYLOADS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-amber-100 placeholder:text-amber-800 focus:outline-none font-mono uppercase tracking-wider"
              />
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {filteredDorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-fr pb-20">
              {filteredDorks.map((dork, idx) => (
                <div 
                  key={`${dork.query}-${idx}`}
                  className="group relative flex flex-col bg-[#0d0d12] border border-amber-900/40 p-5 transition-all duration-300 hover:border-amber-500/60 hover:bg-[#120d0a] h-full"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-red-500/5 transition-all duration-500 pointer-events-none"></div>
                  
                  {/* Tech accents */}
                  <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-amber-500/50 to-transparent"></div>
                  
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <span 
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest shrink-0 border bg-amber-950/40 text-amber-400 border-amber-800/50 mb-3 block w-fit"
                        )}
                        style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                      >
                        {dork.category}
                      </span>
                  </div>

                  <div className="bg-black/50 border border-neutral-800 p-3 font-mono text-sm text-amber-100 break-all mb-4 mt-1 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/30"></div>
                    <code>{dork.query}</code>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-auto mb-2">
                    <span>Target: <span className="text-amber-700">{dork.description}</span></span>
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-end gap-3 relative z-10 border-t border-amber-900/30 pt-4 items-end">
                    <button 
                      onClick={() => handleCopyDork(dork.query, idx)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 border px-4 py-2 text-xs font-mono font-bold transition-all focus:outline-none w-full sm:w-auto",
                        copiedIndex === idx 
                          ? "bg-green-950 border-green-700 text-green-400"
                          : "bg-[#0a0a0c] border-amber-900/50 text-amber-600 hover:bg-amber-950/50 hover:text-amber-400 hover:border-amber-700"
                      )}
                      style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? "COPIED" : "COPY"}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleExecuteDork(dork.query)}
                      className="flex items-center justify-center gap-1.5 bg-amber-950 border border-amber-700 px-4 py-2 text-xs font-mono font-bold text-amber-300 transition-all hover:bg-amber-900 hover:text-amber-100 hover:border-amber-400 focus:outline-none hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] group/btn w-full sm:w-auto"
                      style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                    >
                      <TerminalSquare className="w-3.5 h-3.5" />
                      <span>EXECUTE PAYLOAD</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center relative">
              <div className="absolute inset-0 bg-amber-900/5 blur-3xl rounded-full"></div>
              <div className="w-24 h-24 border border-amber-900/50 bg-[#0d0d12] flex items-center justify-center mb-6 relative" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <TerminalSquare className="w-10 h-10 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-amber-100 uppercase tracking-widest font-mono">No payloads found</h3>
              <p className="text-amber-600/70 mt-2 max-w-md font-mono text-xs uppercase leading-relaxed">
                The requested query returned zero matches in the Google Hacking Database.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="mt-8 px-6 py-2.5 bg-[#0d0d12] border border-amber-700 text-amber-400 hover:bg-amber-950 hover:text-amber-300 font-mono text-xs uppercase tracking-widest transition-all"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
