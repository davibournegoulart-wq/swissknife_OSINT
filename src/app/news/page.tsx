"use client";

import { useState, useEffect, useCallback } from "react";
import { Rss, ExternalLink, Globe, RefreshCw, Radio, AlertTriangle, Clock, ChevronRight, Filter, Zap, Satellite, MapPin, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketTicker } from "@/components/MarketTicker";
import { LiveTvPanel } from "@/components/LiveTvPanel";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
  source: string;
  country: string;
  continent: string;
  accentColor: string;
  language: string;
}

interface ApiResponse {
  articles: NewsItem[];
  total: number;
  sources: number;
  cached: boolean;
  timestamp: string;
}

const CONTINENTS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];

const CONTINENT_COLORS: Record<string, string> = {
  All: "text-red-400 border-red-500/60 bg-red-950/40",
  Africa: "text-green-400 border-green-500/60 bg-green-950/40",
  Americas: "text-blue-400 border-blue-500/60 bg-blue-950/40",
  Asia: "text-yellow-400 border-yellow-500/60 bg-yellow-950/40",
  Europe: "text-purple-400 border-purple-500/60 bg-purple-950/40",
  Oceania: "text-cyan-400 border-cyan-500/60 bg-cyan-950/40",
};

function timeAgo(dateStr: string): string {
  try {
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 0) return "just now";
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  } catch { return ""; }
}

function isLive(dateStr: string): boolean {
  try { return Date.now() - new Date(dateStr).getTime() < 7200000; }
  catch { return false; }
}

export default function NewsCenter() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContinent, setSelectedContinent] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [stats, setStats] = useState({ total: 0, sources: 0, cached: false });
  const [countrySearch, setCountrySearch] = useState("");
  
  const [ragLoading, setRagLoading] = useState(false);
  const [ragReport, setRagReport] = useState<string | null>(null);
  const [showRag, setShowRag] = useState(false);
  const [showLiveTv, setShowLiveTv] = useState(false);

  const runRagAnalysis = async () => {
    setRagLoading(true);
    setShowRag(true);
    try {
      const payload = articles.slice(0, 30);
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: payload })
      });
      const data = await res.json();
      setRagReport(data.result || data.error || "Failed to generate.");
    } catch (e) {
      setRagReport("Error generating report.");
    }
    setRagLoading(false);
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedContinent !== "All") params.set("continent", selectedContinent);
      if (selectedCountry) params.set("country", selectedCountry);
      params.set("limit", "300");

      const res = await fetch(`/api/news?${params.toString()}`, { signal: AbortSignal.timeout(45000) });
      const data: ApiResponse = await res.json();
      setArticles(data.articles);
      setStats({ total: data.total, sources: data.sources, cached: data.cached });
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Feed fetch error:", e);
    }
    setLoading(false);
  }, [selectedContinent, selectedCountry]);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => {
    const iv = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchNews]);

  // Ticker
  useEffect(() => {
    if (!articles.length) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % Math.min(articles.length, 40)), 3500);
    return () => clearInterval(t);
  }, [articles.length]);

  // Derive countries from articles for sidebar
  const countries = Array.from(new Set(articles.map(a => a.country))).filter(Boolean).sort();
  const filteredCountries = countrySearch
    ? countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const featured = articles[0];
  const secondary = articles.slice(1, 4);
  const rest = articles.slice(4);

  return (
    <div className="flex h-full flex-col bg-[#080810] text-white font-sans overflow-hidden relative">

      {/* Scanline + glows */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 4px)' }} />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-900/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-900/6 rounded-full blur-[120px] pointer-events-none" />

      {/* ── BREAKING TICKER ── */}
      <div className="relative z-20 bg-[#0d0008] border-b border-red-900/60 h-9 flex items-center overflow-hidden shrink-0">
        <div className="shrink-0 bg-red-600 px-4 h-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {articles.length > 0 ? (
            <span key={tickerIdx} className="absolute left-0 w-full pl-4 text-[11px] font-mono text-red-200/80 truncate transition-opacity">
              <span className="text-red-500 mr-2">▶</span>
              {articles[tickerIdx % articles.length]?.title}
              <span className="text-red-800 ml-4">// {articles[tickerIdx % articles.length]?.source} · {articles[tickerIdx % articles.length]?.country}</span>
            </span>
          ) : (
            <span className="pl-4 text-[11px] font-mono text-red-800 animate-pulse">CONNECTING TO {stats.sources || 342} GLOBAL SOURCES...</span>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-3 px-3 border-l border-red-900/40 h-full">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-red-700 uppercase tracking-widest">
            <Satellite className="w-3 h-3" />
            <span>{stats.sources} feeds</span>
          </div>
          <div className="w-px h-4 bg-red-900/30" />
          <div className="flex items-center gap-1 text-[9px] font-mono text-red-800 uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--"}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* LEFT SIDEBAR */}
        <aside className="w-52 shrink-0 bg-[#0a0a12]/95 border-r border-red-900/30 flex flex-col overflow-hidden backdrop-blur-xl">
          <div className="p-3 border-b border-red-900/30">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">LIVE MATRIX</span>
            </div>
            <p className="text-[8px] font-mono text-red-900/70 uppercase mt-0.5 tracking-wider">
              {stats.total} articles · {stats.sources} sources
              {stats.cached && <span className="text-green-800 ml-1">[cached]</span>}
            </p>
          </div>

          {/* Country search */}
          <div className="px-3 py-2 border-b border-red-900/20">
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-red-800" />
              <input
                type="text"
                placeholder="FIND COUNTRY..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full bg-[#080810] border border-red-900/30 py-1.5 pl-7 pr-2 text-[9px] text-red-200 placeholder:text-red-900/50 focus:outline-none focus:border-red-500/40 font-mono uppercase tracking-wider"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5 custom-scrollbar">
            <button onClick={() => { setSelectedCountry(null); setSelectedContinent("All"); }}
              className={cn("w-full text-left px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5",
                !selectedCountry && selectedContinent === "All" ? "bg-red-950/40 border-red-500/40 text-red-300" : "border-transparent text-neutral-600 hover:text-red-300 hover:border-red-900/40")}>
              <Globe className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">All Countries</span>
              <span className="ml-auto text-red-900 text-[9px]">[{articles.length}]</span>
            </button>

            {filteredCountries.map(country => {
              const cnt = articles.filter(a => a.country === country).length;
              return (
                <button key={country}
                  onClick={() => { setSelectedCountry(selectedCountry === country ? null : country); setSelectedContinent("All"); }}
                  className={cn("w-full text-left px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5",
                    selectedCountry === country ? "bg-red-950/40 border-red-500/40 text-red-300" : "border-transparent text-neutral-600 hover:text-red-300 hover:border-red-900/40")}>
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-red-900" />
                  <span className="truncate">{country}</span>
                  <span className="ml-auto text-red-900/60 text-[8px] shrink-0">[{cnt}]</span>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-red-900/30 flex flex-col gap-2">
            <button onClick={() => setShowLiveTv(true)}
              className="w-full flex items-center justify-center gap-2 py-1.5 border border-purple-800/50 text-purple-400 text-[9px] font-mono uppercase tracking-widest hover:bg-purple-950/40 hover:text-purple-300 transition-all"
              style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}>
              <MonitorPlay className="w-3 h-3" />
              GLOBAL LIVE TV
            </button>
            <button onClick={runRagAnalysis} disabled={ragLoading || articles.length === 0}
              className="w-full flex items-center justify-center gap-2 py-1.5 border border-cyan-800/50 text-cyan-500 text-[9px] font-mono uppercase tracking-widest hover:bg-cyan-950/40 hover:text-cyan-300 transition-all disabled:opacity-30"
              style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}>
              <Zap className={cn("w-3 h-3", ragLoading && "animate-pulse")} />
              {ragLoading ? "ANALYZING..." : "AI RAG ANALYSIS"}
            </button>
            <button onClick={fetchNews} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-1.5 border border-red-800/50 text-red-600 text-[9px] font-mono uppercase tracking-widest hover:bg-red-950/40 hover:text-red-300 transition-all disabled:opacity-30"
              style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}>
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              {loading ? "Scanning..." : "Refresh Feed"}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Continent filter bar */}
          <div className="shrink-0 bg-[#080810]/95 border-b border-red-900/30 px-3 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar backdrop-blur-md">
            {CONTINENTS.map(c => (
              <button key={c} onClick={() => { setSelectedContinent(c); setSelectedCountry(null); }}
                className={cn("shrink-0 px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all border whitespace-nowrap",
                  selectedContinent === c && !selectedCountry
                    ? CONTINENT_COLORS[c]
                    : "border-transparent text-neutral-600 hover:text-neutral-300 hover:border-neutral-700")}
                style={{ clipPath: 'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>
                {c}
              </button>
            ))}
            <div className="ml-auto shrink-0 flex items-center gap-1.5 text-[9px] font-mono text-red-900/80 uppercase">
              {loading ? (
                <><Zap className="w-3 h-3 animate-pulse text-red-700" /> Fetching...</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />LIVE · {articles.length} stories</>
              )}
            </div>
          </div>

          {/* Articles */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {loading && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-3 border border-red-500/40 rounded-full animate-[spin_2s_linear_infinite]" />
                  <Satellite className="absolute inset-0 m-auto w-7 h-7 text-red-600" />
                </div>
                <p className="text-[11px] font-mono text-red-800 uppercase tracking-[0.2em] animate-pulse">
                  Scanning {stats.sources || 342} global sources...
                </p>
                <p className="text-[9px] font-mono text-red-900/60 uppercase">Server-side aggregation in progress</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertTriangle className="w-10 h-10 text-red-900" />
                <p className="text-[11px] font-mono text-red-800 uppercase tracking-widest">No signal from this sector</p>
              </div>
            ) : (
              <div className="space-y-5 pb-20 max-w-6xl mx-auto">

                {/* FEATURED */}
                {featured && (
                  <a href={featured.link} target="_blank" rel="noopener noreferrer"
                    className="group relative flex flex-col lg:flex-row border overflow-hidden transition-all duration-300 hover:border-red-500/60 bg-[#0d0008] border-red-900/50"
                    style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 24px),calc(100% - 24px) 100%,0 100%)' }}>
                    {featured.thumbnail && (
                      <div className="relative w-full lg:w-[420px] h-52 lg:h-auto shrink-0 overflow-hidden bg-neutral-900">
                        <img src={featured.thumbnail} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d0008]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0008] to-transparent" />
                        <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-widest border"
                          style={{ background: featured.accentColor + '22', borderColor: featured.accentColor + '60', color: featured.accentColor }}>
                          {featured.source}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col p-6 flex-1 relative">
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: featured.accentColor }} />
                      <div className="flex items-center gap-2 mb-3 pl-1 flex-wrap">
                        {isLive(featured.pubDate) && (
                          <span className="px-2 py-0.5 bg-red-600 text-[8px] font-black uppercase tracking-widest text-white animate-pulse">● LIVE</span>
                        )}
                        {!featured.thumbnail && (
                          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                            style={{ color: featured.accentColor, borderColor: featured.accentColor + '40' }}>
                            {featured.source}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-neutral-700 uppercase">{featured.country}</span>
                        <span className="text-[9px] font-mono text-neutral-800">{featured.continent}</span>
                        <span className="ml-auto text-[9px] font-mono text-neutral-700">{timeAgo(featured.pubDate)}</span>
                      </div>
                      <h2 className="text-2xl font-black text-white group-hover:text-red-100 transition-colors uppercase leading-tight tracking-wide mb-3 pl-1">
                        {featured.title}
                      </h2>
                      {featured.description && (
                        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 pl-1 font-mono mb-4">
                          {featured.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-1.5 text-[10px] font-mono text-red-700 uppercase tracking-widest group-hover:text-red-400 transition-colors pl-1">
                        Read Full Report <ChevronRight className="w-3 h-3" /> <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </a>
                )}

                {/* SECONDARY */}
                {secondary.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {secondary.map((item, i) => (
                      <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                        className="group relative flex flex-col bg-[#0d0008] border border-red-900/40 overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:bg-[#110008]"
                        style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)' }}>
                        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg,${item.accentColor},transparent)` }} />
                        {item.thumbnail && (
                          <div className="h-36 overflow-hidden bg-neutral-900 relative">
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0008] to-transparent" />
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {isLive(item.pubDate) && <span className="px-1.5 bg-red-700 text-[7px] font-black uppercase text-white">LIVE</span>}
                            <span className="text-[8px] font-mono uppercase tracking-widest shrink-0" style={{ color: item.accentColor }}>{item.source}</span>
                            <span className="text-[8px] font-mono text-neutral-700">{item.country}</span>
                            <span className="ml-auto text-[8px] font-mono text-neutral-700 shrink-0">{timeAgo(item.pubDate)}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-red-100 uppercase leading-snug tracking-wide line-clamp-3">
                            {item.title}
                          </h3>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* DIVIDER */}
                {rest.length > 0 && (
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-red-900/25" />
                    <span className="text-[8px] font-mono text-red-900/60 uppercase tracking-[0.3em]">Wire Feed · {rest.length} Reports</span>
                    <div className="h-px flex-1 bg-red-900/25" />
                  </div>
                )}

                {/* COMPACT LIST */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {rest.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="group flex gap-3 bg-[#0a0a12] border border-red-950/40 p-3 hover:border-red-500/40 hover:bg-[#0d0008] transition-all"
                      style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)' }}>
                      {item.thumbnail && (
                        <div className="w-16 h-14 shrink-0 overflow-hidden bg-neutral-900">
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-55 group-hover:opacity-75 transition-all" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {isLive(item.pubDate) && <span className="shrink-0 px-1 bg-red-700 text-[7px] font-black uppercase text-white">LIVE</span>}
                          <span className="text-[8px] font-mono truncate" style={{ color: item.accentColor }}>{item.source}</span>
                          <span className="text-[7px] font-mono text-neutral-700">{item.country}</span>
                          <span className="ml-auto shrink-0 text-[8px] font-mono text-neutral-700">{timeAgo(item.pubDate)}</span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-400 group-hover:text-white uppercase leading-snug line-clamp-2 tracking-wide">
                          {item.title}
                        </h4>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RAG OVERLAY MODAL */}
          {showRag && (
            <div className="absolute inset-0 z-50 bg-[#080810]/98 backdrop-blur-xl flex flex-col p-6 border-l border-cyan-900/50">
              <div className="flex items-center justify-between border-b border-cyan-900/50 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3 text-cyan-400">
                  <Zap className={cn("w-6 h-6", ragLoading && "animate-pulse")} />
                  <h2 className="text-xl font-black tracking-widest uppercase">AI RAG INTEL ANALYSIS</h2>
                </div>
                <button onClick={() => setShowRag(false)} className="text-cyan-600 hover:text-cyan-400 font-mono text-sm uppercase border border-cyan-900/50 px-3 py-1 hover:bg-cyan-950/30">
                  [ CLOSE ]
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs text-cyan-100 whitespace-pre-wrap leading-relaxed max-w-5xl w-full p-4">
                {ragLoading ? (
                  <div className="flex flex-col gap-4 animate-pulse text-cyan-600">
                    <p>&gt; INITIATING RAG PIPELINE...</p>
                    <p>&gt; INGESTING TOP {Math.min(articles.length, 30)} GLOBAL THREAT REPORTS...</p>
                    <p>&gt; EXECUTING LLM THREAT ASSESSMENT PROMPT...</p>
                    <p className="text-cyan-400 mt-4">Awaiting neural network response from generative AI...</p>
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: ragReport?.replace(/\*\*(.*?)\*\*/g, '<span class="text-cyan-400 font-bold">$1</span>').replace(/\*/g, '<span class="text-cyan-700">•</span>') || '' }} />
                )}
              </div>
            </div>
          )}
          {/* LIVE TV OVERLAY MODAL */}
          {showLiveTv && <LiveTvPanel onClose={() => setShowLiveTv(false)} />}
        </main>
      </div>
      
      {/* ── MARKET TICKER ── */}
      <MarketTicker />
    </div>
  );
}
