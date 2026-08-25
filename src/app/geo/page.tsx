"use client";

import { useState, useMemo } from "react";
import { Search, Map, ExternalLink, MapPin, Radar, Database, Radio, Youtube, Network } from "lucide-react";
import geoData from "@/data/geo_osint.json";
import mediaData from "@/data/media.json";
import { cn } from "@/lib/utils";

export default function GeoDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Derive unique countries from both datasets
  const countries = useMemo(() => {
    const cntrys = new Set([
      ...geoData.map(m => m.country),
      ...mediaData.map(m => m.country)
    ]);
    return Array.from(cntrys).filter(Boolean).sort();
  }, []);

  // Filter geo resources (Databanks)
  const filteredGeo = useMemo(() => {
    return geoData.filter(item => {
      const matchesCountry = selectedCountry ? item.country === selectedCountry : true;
      const matchesSearch = searchQuery 
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.country.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCountry && matchesSearch;
    });
  }, [searchQuery, selectedCountry]);

  // Filter media resources (News Outlets)
  const filteredMedia = useMemo(() => {
    return mediaData.filter(item => {
      const matchesCountry = selectedCountry ? item.country === selectedCountry : true;
      const matchesSearch = searchQuery 
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.country.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCountry && matchesSearch;
    });
  }, [searchQuery, selectedCountry]);

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country === selectedCountry ? null : country);
  };

  return (
    <div className="flex h-full flex-col lg:flex-row bg-[#0a0a0c] text-emerald-50 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" 
           style={{
             backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)',
             backgroundSize: '30px 30px',
             backgroundPosition: 'center center'
           }}>
      </div>
      
      {/* Cyberpunk Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      {/* Cyberpunk Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0 bg-[#0d0d12]/90 border-r border-emerald-900/40 flex flex-col h-auto lg:h-full lg:sticky top-0 z-10 backdrop-blur-xl shadow-[4px_0_24px_rgba(16,185,129,0.05)]">
        
        {/* Header Branding */}
        <div className="p-6 border-b border-emerald-900/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          
          <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 flex items-center gap-3 uppercase relative z-10">
            <Radar className="w-6 h-6 text-emerald-400" />
            <span className="drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">NATIONS_DB</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
          
          <div>
            <div className="pb-2 flex items-center gap-2">
              <h3 className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] font-mono">
                Regions & Nations
              </h3>
              <div className="h-px bg-emerald-900/50 flex-1"></div>
            </div>
            
            <div className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              <button
                  onClick={() => setSelectedCountry(null)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-1.5 text-[11px] font-medium transition-all text-left relative overflow-hidden border font-mono uppercase tracking-wider mb-2",
                    selectedCountry === null
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50" 
                      : "bg-transparent text-neutral-500 border-transparent hover:border-emerald-900/50 hover:text-emerald-200 hover:bg-emerald-950/20"
                  )}
                >
                  <Map className={cn("w-3 h-3 flex-shrink-0", selectedCountry === null ? "text-emerald-400" : "text-neutral-700")} />
                  <span className="truncate flex-1">Global Overview</span>
              </button>

              {countries.map(country => {
                const geoCount = geoData.filter(m => m.country === country).length;
                const mediaCount = mediaData.filter(m => m.country === country).length;
                const totalCount = geoCount + mediaCount;
                
                return (
                  <button
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-1.5 text-[11px] font-medium transition-all text-left relative overflow-hidden border font-mono uppercase tracking-wider",
                      selectedCountry === country
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50" 
                        : "bg-transparent text-neutral-500 border-transparent hover:border-emerald-900/50 hover:text-emerald-200 hover:bg-emerald-950/20"
                    )}
                  >
                    <MapPin className={cn("w-3 h-3 flex-shrink-0", selectedCountry === country ? "text-emerald-400" : "text-neutral-700")} />
                    <span className="truncate flex-1">{country}</span>
                    <span className="text-[9px] text-emerald-700">[{totalCount}]</span>
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
        <header className="sticky top-0 z-20 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-emerald-900/30 px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-500" />
              {selectedCountry || "Global Overview"}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-0.5 w-8 bg-emerald-500/50"></div>
              <p className="text-emerald-500/50 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3" /> Databanks: <span className="text-emerald-400 font-bold">{filteredGeo.length}</span>
              </p>
              <p className="text-fuchsia-500/50 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-3 h-3" /> News: <span className="text-fuchsia-400 font-bold">{filteredMedia.length}</span>
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-fuchsia-500 rounded-sm opacity-20 group-focus-within:opacity-50 blur transition duration-500"></div>
            <div className="relative flex items-center bg-[#0d0d12] border border-emerald-900/50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
              <Search className="absolute left-3 w-4 h-4 text-emerald-600 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="SCAN DATABANKS & OUTLETS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-emerald-100 placeholder:text-emerald-800 focus:outline-none font-mono uppercase tracking-wider"
              />
            </div>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {(filteredGeo.length > 0 || filteredMedia.length > 0) ? (
            <div className="pb-20 space-y-12">
              
              {/* SECTION: OSINT DATABANKS */}
              {filteredGeo.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 uppercase">
                      Intelligence Databanks
                    </h3>
                    <div className="h-px bg-emerald-900/50 flex-1 ml-4"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
                    {filteredGeo.map((item, idx) => (
                      <div 
                        key={`geo-${item.url}-${idx}`}
                        className="group relative flex flex-col bg-[#0d0d12] border border-emerald-900/40 p-5 transition-all duration-300 hover:border-emerald-500/60 hover:bg-[#0d1210] h-full"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-500 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <h3 className="font-bold text-emerald-50 tracking-wide line-clamp-2 flex-1 uppercase" title={item.name}>
                            {item.name}
                          </h3>
                        </div>

                        <div className="mt-4 flex flex-col gap-1 text-xs font-mono text-neutral-400">
                          <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-700" /> {item.country}</p>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-t border-emerald-900/30 pt-4 flex-1 items-end">
                          <a 
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 bg-emerald-950 border border-emerald-700 px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 transition-all hover:bg-emerald-900 hover:text-emerald-100 hover:border-emerald-400 focus:outline-none hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] group/btn w-full"
                            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>ACCESS_DATABANK</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SECTION: NEWS OUTLETS */}
              {filteredMedia.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Radio className="w-5 h-5 text-fuchsia-400" />
                    <h3 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 uppercase">
                      News & Media Outlets
                    </h3>
                    <div className="h-px bg-fuchsia-900/50 flex-1 ml-4"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-fr">
                    {filteredMedia.map((media, idx) => (
                      <div 
                        key={`media-${media.url}-${idx}`}
                        className="group relative flex flex-col bg-[#0d0d12] border border-fuchsia-900/40 p-5 transition-all duration-300 hover:border-fuchsia-500/60 hover:bg-[#110d18] h-full"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 to-fuchsia-500/0 group-hover:from-fuchsia-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-fuchsia-500/50 to-transparent"></div>
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <h3 className="font-bold text-fuchsia-50 tracking-wide line-clamp-1 flex-1 uppercase" title={media.name}>
                            {media.name}
                          </h3>
                          {media.type && (
                            <span 
                              className={cn(
                                "px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest shrink-0 border",
                                media.type.toLowerCase() === 'outlet' 
                                  ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/50" 
                                  : "bg-purple-950/40 text-purple-400 border-purple-800/50"
                              )}
                              style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                            >
                              {media.type}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-col gap-1 text-xs font-mono text-neutral-400">
                          <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-fuchsia-700" /> {media.country}</p>
                          <p className="flex items-center gap-2 opacity-50 mt-1 uppercase tracking-widest text-[10px]">Lang: {media.language || 'Unknown'}</p>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-t border-fuchsia-900/30 pt-4 flex-1 items-end">
                          
                          <a 
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 bg-fuchsia-950 border border-fuchsia-700 px-3 py-1.5 text-xs font-mono font-bold text-fuchsia-300 transition-all hover:bg-fuchsia-900 hover:text-fuchsia-100 hover:border-fuchsia-400 focus:outline-none hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] group/btn w-full sm:w-auto"
                            style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                          >
                            <Network className="w-3.5 h-3.5" />
                            <span>WEBSITE</span>
                          </a>

                          {media.youtube_search_url && (
                            <a 
                              href={media.youtube_search_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 bg-red-950/30 border border-red-900/50 px-3 py-1.5 text-xs font-mono font-bold text-red-400 transition-all hover:bg-red-900/50 hover:text-red-300 hover:border-red-500 focus:outline-none hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] group/yt w-full sm:w-auto"
                              style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
                            >
                              <Youtube className="w-3.5 h-3.5 text-red-500 group-hover/yt:animate-pulse" />
                              <span>YT_CHANNEL</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center relative">
              <div className="absolute inset-0 bg-emerald-900/5 blur-3xl rounded-full"></div>
              <div className="w-24 h-24 border border-emerald-900/50 bg-[#0d0d12] flex items-center justify-center mb-6 relative" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <Radar className="w-10 h-10 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-emerald-100 uppercase tracking-widest font-mono">No nodes found</h3>
              <p className="text-emerald-600/70 mt-2 max-w-md font-mono text-xs uppercase leading-relaxed">
                The requested geography returned zero matches across Databanks and News Outlets.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCountry(null); }}
                className="mt-8 px-6 py-2.5 bg-[#0d0d12] border border-emerald-700 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300 font-mono text-xs uppercase tracking-widest transition-all"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                Recalibrate Scanners
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
