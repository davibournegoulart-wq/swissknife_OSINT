"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  X, ChevronLeft, ChevronRight, ExternalLink, ShieldAlert, 
  Radio, Sparkles, Newspaper, Calendar, Globe, Navigation, 
  Cpu, Terminal, ArrowRight, CornerDownRight
} from "lucide-react";

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
}

interface NewsDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: any;
  allNews: DossierArticle[];
}

export default function NewsDossierModal({ isOpen, onClose, target, allNews }: NewsDossierModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [relatedArticles, setRelatedArticles] = useState<DossierArticle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // RAG Matching Algorithm: Match event keywords, country, and title against live news streams
  useEffect(() => {
    if (!target || !isOpen) {
      setRelatedArticles([]);
      setCurrentIndex(0);
      return;
    }

    const targetTitle = (target.title || target.label || "").toLowerCase();
    const targetDesc = (target.desc || "").toLowerCase();
    const targetCountry = (target.country || "").toLowerCase();
    const targetCategory = (target.catId || target.type || "").toLowerCase();

    // Extract search tokens
    const tokens = [
      ...targetTitle.replace(/[\[\]]/g, "").split(/[\s—\-\:\/]+/),
      ...targetCountry.split(/[\s]+/),
      ...targetDesc.split(/[\s\n]+/)
    ].filter(t => t.length >= 3 && !["the", "and", "for", "with", "from", "flight", "alert", "ongoing", "live"].includes(t));

    const scored = allNews.map(article => {
      let score = 0;
      const aTitle = article.title.toLowerCase();
      const aDesc = (article.description || "").toLowerCase();
      const aCountry = (article.country || "").toLowerCase();

      // Exact country match
      if (targetCountry && aCountry.includes(targetCountry)) score += 10;

      // Token overlap
      tokens.forEach(tok => {
        if (aTitle.includes(tok)) score += 5;
        if (aDesc.includes(tok)) score += 2;
      });

      // Special conflict/storm matches
      if (targetTitle.includes("ukrain") && (aTitle.includes("ukrain") || aTitle.includes("russia") || aTitle.includes("kyiv") || aTitle.includes("moscow"))) score += 15;
      if (targetTitle.includes("gaza") && (aTitle.includes("gaza") || aTitle.includes("israel") || aTitle.includes("lebanon") || aTitle.includes("middle east"))) score += 15;
      if (targetTitle.includes("sudan") && (aTitle.includes("sudan") || aTitle.includes("khartoum") || aTitle.includes("rsf"))) score += 15;
      if (targetTitle.includes("taiwan") && (aTitle.includes("taiwan") || aTitle.includes("china") || aTitle.includes("taipei"))) score += 15;
      if (targetTitle.includes("red sea") && (aTitle.includes("houthi") || aTitle.includes("yemen") || aTitle.includes("red sea"))) score += 15;
      if (targetCategory.includes("storm") && (aTitle.includes("storm") || aTitle.includes("cyclone") || aTitle.includes("typhoon") || aTitle.includes("hurricane"))) score += 10;
      if (targetCategory.includes("fire") && (aTitle.includes("fire") || aTitle.includes("wildfire") || aTitle.includes("blaze"))) score += 10;
      if (targetCategory.includes("volcano") && (aTitle.includes("volcano") || aTitle.includes("eruption") || aTitle.includes("ash"))) score += 10;

      return { article, score };
    });

    const topMatches = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => s.article);

    // Fallback: If no direct keyword match, provide newest global dispatches
    if (topMatches.length === 0) {
      setRelatedArticles(allNews.slice(0, 5));
    } else {
      setRelatedArticles(topMatches);
    }
    setCurrentIndex(0);
  }, [target, isOpen, allNews]);

  const handleNext = useCallback(() => {
    if (relatedArticles.length <= 1) return;
    setDirection("next");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % relatedArticles.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [relatedArticles.length]);

  const handlePrev = useCallback(() => {
    if (relatedArticles.length <= 1) return;
    setDirection("prev");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + relatedArticles.length) % relatedArticles.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [relatedArticles.length]);

  // Keyboard navigation listener (Arrow keys + Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !target) return null;

  const currentArticle = relatedArticles[currentIndex];
  const targetLabel = target.title || target.label || "TARGET INCIDENT";
  const targetType = target.aircraftType || target.catId || target.type?.toUpperCase() || "INTEL EVENT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Hologram 3D Perspective Modal Container */}
      <div className="relative z-10 w-full max-w-2xl bg-[#040812]/95 border-2 border-cyan-500/60 shadow-[0_0_50px_rgba(0,243,255,0.25)] rounded-sm overflow-hidden flex flex-col font-mono text-cyan-300">
        
        {/* Top Cyberpunk Scanner Header */}
        <div className="bg-[#02050c] border-b border-cyan-500/40 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400 uppercase">
              RAG_INTEL_DOSSIER // {targetType}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] text-cyan-600 tracking-widest hidden sm:inline">
              USE [◀] [▶] KEYS TO NAVIGATE // [ESC] TO CLOSE
            </span>
            <button 
              onClick={onClose}
              className="p-1 border border-cyan-900/60 hover:border-amber-400 hover:text-amber-400 text-cyan-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Incident Meta Banner */}
        <div className="bg-[#071326] px-4 py-2 border-b border-cyan-900/60 flex flex-wrap items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-white tracking-wider truncate max-w-xs">{targetLabel}</span>
          </div>
          <div className="flex items-center gap-3 text-cyan-500 text-[9px]">
            <span>LAT: {target.lat?.toFixed(4)}</span>
            <span>LNG: {target.lng?.toFixed(4)}</span>
            {target.country && <span className="text-amber-400">[{target.country.toUpperCase()}]</span>}
          </div>
        </div>

        {/* 3D Holographic Card Viewport */}
        <div className="relative p-6 min-h-[300px] flex flex-col justify-between overflow-hidden" style={{ perspective: "1000px" }}>
          
          {currentArticle ? (
            <div 
              key={currentIndex}
              className={`flex flex-col gap-3 transition-all duration-300 transform ${
                isAnimating 
                  ? direction === "next" 
                    ? "opacity-0 translate-x-8 rotate-y-6 scale-95" 
                    : "opacity-0 -translate-x-8 -rotate-y-6 scale-95"
                  : "opacity-100 translate-x-0 rotate-y-0 scale-100"
              }`}
            >
              {/* Article Meta Badges */}
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-cyan-900/40">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold tracking-widest uppercase">
                    {currentArticle.source}
                  </span>
                  <span className="text-cyan-600 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {currentArticle.country || "Global"}
                  </span>
                </div>
                <div className="text-cyan-600 text-[9px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {currentArticle.pubDate ? new Date(currentArticle.pubDate).toLocaleString() : "RECENT DISPATCH"}
                </div>
              </div>

              {/* Article Headline */}
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                {currentArticle.title}
              </h2>

              {/* RAG Synthesized Summary */}
              <div className="bg-[#02050e]/90 border border-cyan-900/80 p-3.5 rounded-xs text-[11px] text-cyan-200/90 leading-relaxed font-sans relative">
                <div className="text-[8px] text-amber-500 font-mono tracking-widest uppercase mb-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> RAG_SUMMARY_SYNTHESIS
                </div>
                {currentArticle.description || "Intelligence intercept intercepted from global feeds. Ground telemetry correlates with active operational theater."}
              </div>

              {/* Direct Intercept Link */}
              <div className="pt-2 flex items-center justify-between">
                <a 
                  href={currentArticle.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-amber-400 hover:text-amber-300 text-[10px] tracking-widest font-bold transition-all group"
                >
                  <span>&gt;&gt;&gt; ACCESS FULL DISPATCH SOURCE</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <div className="text-[9px] text-cyan-600 font-mono">
                  FEED [{currentIndex + 1}/{relatedArticles.length}]
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-cyan-700 text-[11px] tracking-widest">
              <Radio className="w-8 h-8 animate-pulse mb-2 text-cyan-600" />
              SCANNING INTEL FREQUENCIES...
            </div>
          )}

          {/* Hologram Scanlines Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00f3ff_2px,#00f3ff_4px)]" />
        </div>

        {/* Carousel Bottom Control Bar with Chevrons and Pagination */}
        <div className="bg-[#02050c] border-t border-cyan-500/40 p-3 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={relatedArticles.length <= 1}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 disabled:opacity-30 disabled:pointer-events-none text-[10px] tracking-widest transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> PREV [A/◀]
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {relatedArticles.slice(0, 8).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 transition-all rounded-xs ${
                  currentIndex === i ? "w-5 bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "w-1.5 bg-cyan-900 hover:bg-cyan-700"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={relatedArticles.length <= 1}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 disabled:opacity-30 disabled:pointer-events-none text-[10px] tracking-widest transition-all cursor-pointer"
          >
            NEXT [D/▶] <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
