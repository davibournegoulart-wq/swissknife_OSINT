"use client";

import { useState, useEffect, useCallback } from "react";
import { Rss, ExternalLink, Globe, RefreshCw, Radio, Wifi, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  description: string;
  source: string;
  region: string;
  accentColor: string;
}

const FEEDS = [
  { name: "BBC World",      url: "http://feeds.bbci.co.uk/news/world/rss.xml",               region: "Global",      accentColor: "#ef4444", flag: "🇬🇧" },
  { name: "Al Jazeera",    url: "https://www.aljazeera.com/xml/rss/all.xml",                region: "Middle East", accentColor: "#f97316", flag: "🇶🇦" },
  { name: "DW World",      url: "https://rss.dw.com/xml/rss-en-world",                      region: "Europe",      accentColor: "#a855f7", flag: "🇩🇪" },
  { name: "France 24",     url: "https://www.france24.com/en/rss",                          region: "Europe",      accentColor: "#3b82f6", flag: "🇫🇷" },
  { name: "RT",            url: "https://www.rt.com/rss/news/",                             region: "Europe",      accentColor: "#dc2626", flag: "🇷🇺" },
  { name: "NHK World",     url: "https://www3.nhk.or.jp/rss/news/cat0.xml",                region: "Asia",        accentColor: "#06b6d4", flag: "🇯🇵" },
  { name: "ABC Australia", url: "https://www.abc.net.au/news/feed/1048/rss.xml",            region: "Oceania",     accentColor: "#10b981", flag: "🇦🇺" },
  { name: "Reuters",       url: "https://feeds.reuters.com/reuters/worldNews",              region: "Global",      accentColor: "#f59e0b", flag: "🌐" },
  { name: "The Hindu",     url: "https://www.thehindu.com/news/international/?service=rss", region: "Asia",        accentColor: "#ec4899", flag: "🇮🇳" },
];

const REGIONS = ["All", "Global", "Americas", "Europe", "Asia", "Middle East", "Africa", "Oceania"];

function timeAgo(dateStr: string): string {
  try {
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  } catch { return ""; }
}

function isRecent(dateStr: string): boolean {
  try { return (Date.now() - new Date(dateStr).getTime()) < 7200000; }
  catch { return false; }
}

function strip(html: string): string {
  return (html || "").replace(/<[^>]*>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#039;/g,"'").trim();
}

export default function NewsCenter() {
  const [articles, setArticles]           = useState<NewsItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingFeeds, setLoadingFeeds]   = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);
  const [tickerIdx, setTickerIdx]         = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadingFeeds(FEEDS.map(f => f.name));
    const allItems: NewsItem[] = [];

    await Promise.allSettled(FEEDS.map(async (feed) => {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=20`;
      try {
        const res  = await fetch(apiUrl, { signal: AbortSignal.timeout(9000) });
        const data = await res.json();
        if (data.status === "ok" && data.items) {
          data.items.forEach((item: any) => {
            allItems.push({
              title:       strip(item.title || ""),
              link:        item.link || "",
              pubDate:     item.pubDate || "",
              thumbnail:   item.thumbnail || item.enclosure?.link || "",
              description: strip(item.description || "").slice(0, 220),
              source:      feed.name,
              region:      feed.region,
              accentColor: feed.accentColor,
            });
          });
        }
      } catch {}
      setLoadingFeeds(prev => prev.filter(n => n !== feed.name));
    }));

    const seen = new Set<string>();
    const deduped = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .filter(item => {
        const k = item.title.slice(0, 50).toLowerCase();
        if (seen.has(k) || !item.title) return false;
        seen.add(k); return true;
      });

    setArticles(deduped);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  useEffect(() => {
    if (!articles.length) return;
    const t = setInterval(() => setTickerIdx(i => (i + 1) % Math.min(articles.length, 30)), 4000);
    return () => clearInterval(t);
  }, [articles.length]);

  const filtered = articles.filter(a =>
    (selectedRegion === "All" || a.region === selectedRegion) &&
    (!selectedSource || a.source === selectedSource)
  );

  const featured  = filtered[0];
  const secondary = filtered.slice(1, 4);
  const rest      = filtered.slice(4);

  return (
    <div className="flex h-full flex-col bg-[#080810] text-white font-sans overflow-hidden relative">
      {/* scanline overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 4px)' }} />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-900/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ── BREAKING TICKER ── */}
      <div className="relative z-20 bg-[#0d0008] border-b border-red-900/60 h-8 flex items-center overflow-hidden shrink-0">
        <div className="shrink-0 bg-red-600 px-3 h-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">BREAKING</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {articles.length > 0 ? (
            <span key={tickerIdx} className="absolute left-0 w-full pl-4 text-[11px] font-mono text-red-200/80 truncate">
              <span className="text-red-500 mr-2">▶</span>
              {articles[tickerIdx % articles.length]?.title}
              <span className="text-red-800 ml-4">// {articles[tickerIdx % articles.length]?.source}</span>
            </span>
          ) : (
            <span className="pl-4 text-[11px] font-mono text-red-800 animate-pulse">SCANNING GLOBAL FEEDS...</span>
          )}
        </div>
        {lastUpdated && (
          <div className="shrink-0 px-3 text-[9px] font-mono text-red-800 uppercase tracking-widest border-l border-red-900/40 h-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* LEFT SIDEBAR */}
        <aside className="w-48 shrink-0 bg-[#0a0a12]/95 border-r border-red-900/30 flex flex-col overflow-hidden backdrop-blur-xl">
          <div className="p-3 border-b border-red-900/30">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">LIVE FEEDS</span>
            </div>
            <p className="text-[8px] font-mono text-red-900/70 uppercase mt-0.5">{articles.length} articles indexed</p>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
            <button onClick={() => setSelectedSource(null)}
              className={cn("w-full text-left px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5",
                !selectedSource ? "bg-red-950/40 border-red-500/40 text-red-300" : "border-transparent text-neutral-600 hover:text-red-300 hover:border-red-900/40")}>
              <Globe className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">All Sources</span>
              <span className="ml-auto text-red-900 text-[9px]">[{articles.length}]</span>
            </button>

            {FEEDS.map(feed => {
              const cnt = articles.filter(a => a.source === feed.name).length;
              const busy = loadingFeeds.includes(feed.name);
              return (
                <button key={feed.name}
                  onClick={() => setSelectedSource(selectedSource === feed.name ? null : feed.name)}
                  className={cn("w-full text-left px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5",
                    selectedSource === feed.name ? "bg-red-950/40 border-red-500/40 text-red-300" : "border-transparent text-neutral-600 hover:text-red-300 hover:border-red-900/40")}>
                  <span className="shrink-0 text-[10px]">{feed.flag}</span>
                  <span className="truncate">{feed.name}</span>
                  {busy
                    ? <Wifi className="w-2.5 h-2.5 ml-auto text-red-700 animate-pulse shrink-0" />
                    : <span className="ml-auto text-red-900 text-[9px] shrink-0">[{cnt}]</span>}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-red-900/30">
            <button onClick={fetchAll} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-1.5 border border-red-800/50 text-red-600 text-[9px] font-mono uppercase tracking-widest hover:bg-red-950/40 hover:text-red-300 transition-all disabled:opacity-30"
              style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}>
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              {loading ? "Scanning" : "Refresh"}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Region filter bar */}
          <div className="shrink-0 bg-[#080810]/95 border-b border-red-900/30 px-3 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar backdrop-blur-md">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={cn("shrink-0 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest transition-all border whitespace-nowrap",
                  selectedRegion === r
                    ? "bg-red-950/60 border-red-500/60 text-red-300"
                    : "border-transparent text-neutral-600 hover:text-neutral-300 hover:border-neutral-700")}
                style={{ clipPath: 'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>
                {r}
              </button>
            ))}
            <div className="ml-auto shrink-0 flex items-center gap-1.5 text-[9px] font-mono text-red-900/80 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />LIVE · {filtered.length} stories
            </div>
          </div>

          {/* Articles */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {loading && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 border border-red-500/50 rounded-full animate-spin" />
                  <Rss className="absolute inset-0 m-auto w-6 h-6 text-red-600" />
                </div>
                <p className="text-[11px] font-mono text-red-800 uppercase tracking-widest animate-pulse">
                  Connecting to {loadingFeeds.length} live feeds...
                </p>
              </div>
            ) : filtered.length === 0 ? (
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
                        {/* Source badge on image */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-widest"
                          style={{ background: featured.accentColor + '22', border: `1px solid ${featured.accentColor}60`, color: featured.accentColor }}>
                          {featured.source}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col p-6 flex-1 relative">
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: featured.accentColor }} />
                      <div className="flex items-center gap-2 mb-3 pl-1">
                        {isRecent(featured.pubDate) && (
                          <span className="px-2 py-0.5 bg-red-600 text-[8px] font-black uppercase tracking-widest text-white animate-pulse">● LIVE</span>
                        )}
                        {!featured.thumbnail && (
                          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                            style={{ color: featured.accentColor, borderColor: featured.accentColor + '40' }}>
                            {featured.source}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-neutral-700 uppercase">{featured.region}</span>
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

                {/* SECONDARY 3-COL */}
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
                          <div className="flex items-center gap-2 mb-2">
                            {isRecent(item.pubDate) && <span className="px-1.5 bg-red-700 text-[7px] font-black uppercase text-white">LIVE</span>}
                            <span className="text-[8px] font-mono uppercase tracking-widest shrink-0" style={{ color: item.accentColor }}>{item.source}</span>
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
                    <span className="text-[8px] font-mono text-red-900/60 uppercase tracking-[0.3em]">Further Reports</span>
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
                        <div className="flex items-center gap-1.5 mb-1">
                          {isRecent(item.pubDate) && <span className="shrink-0 px-1 bg-red-700 text-[7px] font-black uppercase text-white">LIVE</span>}
                          <span className="text-[8px] font-mono truncate" style={{ color: item.accentColor }}>{item.source}</span>
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
        </main>
      </div>
    </div>
  );
}
