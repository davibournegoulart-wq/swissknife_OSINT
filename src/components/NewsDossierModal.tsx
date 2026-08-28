"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  X, ChevronLeft, ChevronRight, ExternalLink, ShieldAlert, 
  Radio, Sparkles, Newspaper, Calendar, Globe, MapPin, 
  Search, AlertTriangle, Info, BookOpen
} from "lucide-react";
import { sfx } from "@/utils/sfxEngine";

export interface DossierArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  country: string;
  continent?: string;
  description?: string;
  thumbnail?: string;
  accentColor?: string;
  videoUrl?: string;
  extraLinks?: { label: string; url: string }[];
}

interface NewsDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: any;
  allNews: DossierArticle[];
}

interface WikiInfo {
  extract: string;
  thumbnail: string;
}

export default function NewsDossierModal({ isOpen, onClose, target, allNews }: NewsDossierModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [wikiData, setWikiData] = useState<WikiInfo | null>(null);

  // If the target is a real news article, find its index
  const isNews = target?.type === "news" || (target?.link && target?.source);
  
  useEffect(() => {
    if (!target || !isOpen) return;

    if (isNews && allNews.length > 0) {
      const idx = allNews.findIndex(n => n.link === target.link || n.title === target.title);
      if (idx !== -1) setCurrentIndex(idx);
      else setCurrentIndex(0);
      setWikiData(null);
    } else if (!isNews) {
      // For map events (Cyber, Conflict, Quake, etc.), try to fetch a Wiki summary
      setCurrentIndex(0);
      
      const cleanTitle = (target.title || target.label || "Event")
        .replace(/[\[\]]/g, "")
        .replace(/^[⚔️⚓⚡🌪️🔥🌋✈️👑\s]+/, "")
        .trim();
        
      // Try fetching from Wikipedia API based on the title or country
      const searchQuery = encodeURIComponent(cleanTitle.split(" ").slice(0, 4).join(" "));
      
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          if (data.type !== "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
            setWikiData({
              extract: data.extract || "",
              thumbnail: data.thumbnail?.source || ""
            });
          } else {
            // Fallback to country search
            if (target.country && target.country !== "International Zone") {
              fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(target.country)}`)
                .then(res => res.json())
                .then(cData => {
                   if (cData.type !== "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
                     setWikiData({
                        extract: cData.extract || "",
                        thumbnail: cData.thumbnail?.source || ""
                     });
                   }
                }).catch(() => setWikiData(null));
            } else {
              setWikiData(null);
            }
          }
        })
        .catch(() => setWikiData(null));
    }
  }, [target, isOpen, allNews, isNews]);

  const handleNext = useCallback(() => {
    if (!isNews || allNews.length <= 1) return;
    sfx.playCardFlip();
    setDirection("next");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % allNews.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [allNews.length, isNews]);

  const handlePrev = useCallback(() => {
    if (!isNews || allNews.length <= 1) return;
    sfx.playCardFlip();
    setDirection("prev");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? allNews.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  }, [allNews.length, isNews]);
  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!isNews || allNews.length <= 1) return;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') handleNext();
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev, isNews, allNews.length]);


  if (!isOpen || !target) return null;

  const targetType = (target.type || target.catId || "INTEL").toUpperCase();
  const targetLabel = (target.title || target.label || "CLASSIFIED INCIDENT").toUpperCase();

  const renderNewsArticle = (article: DossierArticle) => (
    <div 
      className={`flex flex-col gap-4 transition-all duration-300 transform ${
        isAnimating 
          ? direction === "next" 
            ? "opacity-0 translate-x-8 rotate-y-6 scale-95" 
            : "opacity-0 -translate-x-8 -rotate-y-6 scale-95"
          : "opacity-100 translate-x-0 rotate-y-0 scale-100"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] pb-2 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold tracking-widest uppercase">
            {article.source || "GLOBAL FEED"}
          </span>
          <span className="text-cyan-600 flex items-center gap-1">
            <Globe className="w-3 h-3" /> {article.country || "Global"}
          </span>
        </div>
        <div className="text-cyan-600 text-[9px] flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {article.pubDate ? new Date(article.pubDate).toLocaleString() : "RECENT DISPATCH"}
        </div>
      </div>

      <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
        {article.title}
      </h2>

      {article.thumbnail && (
        <div className="w-full relative pt-[56.25%] rounded overflow-hidden border border-cyan-900/50">
          <img 
            src={article.thumbnail} 
            alt="Intelligence Image" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-[#02050e]/90 border border-cyan-900/80 p-3.5 rounded-xs text-[12px] text-cyan-200/90 leading-relaxed font-sans">
        <div className="text-[8px] text-cyan-500 font-mono tracking-widest uppercase mb-2 flex items-center gap-1">
          <Newspaper className="w-2.5 h-2.5" /> ARTICLE SUMMARY
        </div>
        {article.description || "Intelligence intercept logged with no extensive description. Follow the link to access the full operational dispatch."}
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
        <a 
          href={article.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-amber-400 hover:text-amber-300 text-[10px] tracking-widest font-bold transition-all group"
        >
          <span>&gt;&gt;&gt; ACCESS FULL DISPATCH</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );

  const renderMapEvent = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-900/40">
        <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold tracking-widest uppercase text-[10px]">
          {targetType} EVENT
        </span>
        <span className="text-cyan-600 text-[10px] flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {target.country || "International Zone"}
        </span>
      </div>

      <h2 className="text-xl font-bold text-amber-400 tracking-wide leading-snug drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
        {targetLabel}
      </h2>

      {wikiData?.thumbnail && (
        <div className="w-full relative pt-[45%] rounded overflow-hidden border border-cyan-900/50">
          <img 
            src={wikiData.thumbnail} 
            alt="Context Image" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-[#02050e]/90 border border-cyan-900/80 p-4 rounded-xs text-[12px] text-cyan-100 leading-relaxed font-sans shadow-inner">
        <div className="text-[8px] text-amber-500 font-mono tracking-widest uppercase mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" /> TACTICAL DESCRIPTION
        </div>
        <p className="mb-4">{target.desc || "Active tactical incident logged in the global surveillance matrix. Awaiting ground telemetry."}</p>
        
        {wikiData?.extract && (
           <div className="mt-4 pt-4 border-t border-cyan-900/50">
              <div className="text-[8px] text-cyan-500 font-mono tracking-widest uppercase mb-2 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> STRATEGIC CONTEXT (WIKIPEDIA)
              </div>
              <p className="text-cyan-300/80 text-[11px] italic">{wikiData.extract}</p>
           </div>
        )}
      </div>

      <div className="pt-4 flex flex-wrap items-center gap-2">
        <a 
          href={`https://news.google.com/search?q=${encodeURIComponent(target.title || targetLabel)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-[10px] tracking-wider font-bold transition-all"
        >
          <Search className="w-3 h-3" /> SEARCH GOOGLE NEWS
        </a>
        <a 
          href={`https://twitter.com/search?q=${encodeURIComponent(target.title || targetLabel)}&f=live`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-[10px] tracking-wider font-bold transition-all"
        >
          <Radio className="w-3 h-3" /> X / TWITTER OSINT
        </a>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#02050c] border border-cyan-900/60 shadow-[0_0_50px_rgba(0,243,255,0.1)] w-full max-w-4xl flex flex-col h-[85vh] max-h-full">
        
        <div className="bg-[#02050c] border-b border-cyan-500/40 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase">
              RAG_INTEL_DOSSIER // {targetType}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isNews && (
              <span className="text-[9px] text-cyan-600 tracking-widest hidden sm:inline">
                USE [◀] [▶] KEYS TO NAVIGATE // [ESC] TO CLOSE
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-1 border border-cyan-900/60 hover:border-amber-400 hover:text-amber-400 text-cyan-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative p-6 min-h-[300px] flex flex-col justify-between overflow-y-auto custom-scrollbar flex-1">
          {isNews && allNews.length > 0 ? renderNewsArticle(allNews[currentIndex]) : renderMapEvent()}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00f3ff_2px,#00f3ff_4px)]" />
        </div>

        {isNews && allNews.length > 1 && (
          <div className="bg-[#02050c] border-t border-cyan-500/40 p-3 flex items-center justify-between">
            <button 
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 text-[10px] tracking-widest transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> PREV [A/◀]
            </button>
            <div className="text-[9px] text-cyan-600 font-mono">
              FEED [{currentIndex + 1}/{allNews.length}]
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 text-[10px] tracking-widest transition-all cursor-pointer"
            >
              NEXT [D/▶] <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
