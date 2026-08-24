import { ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: {
    name: string;
    description: string;
    url: string;
    category: string;
    pricing: string;
    status: string;
  };
}

export function ToolCard({ tool }: ToolCardProps) {
  const isLive = tool.status === "live";

  return (
    <div 
      className="group relative flex flex-col bg-[#0d0d12] border border-cyan-900/40 p-5 transition-all duration-300 hover:border-cyan-500/60 hover:bg-[#111118] h-full"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500 pointer-events-none"></div>
      
      {/* Tech accents */}
      <div className="absolute top-0 right-0 w-16 h-px bg-gradient-to-l from-cyan-500/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-16 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      
      <div className="flex items-start justify-between gap-4 relative z-10">
        <h3 className="font-bold text-cyan-50 tracking-wide line-clamp-1 flex-1 uppercase" title={tool.name}>
          {tool.name}
        </h3>
        {isLive ? (
          <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" aria-label="Verified Live" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500/70 shrink-0" aria-label="Status Unknown" />
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-400 line-clamp-3 flex-1 font-mono leading-relaxed" title={tool.description}>
        {tool.description || "NO DATASTREAM DESCRIPTION PROVIDED."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 relative z-10 border-t border-cyan-900/30 pt-4">
        <div className="flex items-center gap-2">
          <span className="bg-cyan-950/40 border border-cyan-800/50 px-2 py-1 text-[10px] font-mono text-cyan-400 uppercase tracking-widest" style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
            {tool.category.split(' ')[0]}
          </span>
          {tool.pricing.toLowerCase() !== "free" && (
            <span className="bg-fuchsia-950/40 border border-fuchsia-800/50 px-2 py-1 text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest" style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}>
              {tool.pricing}
            </span>
          )}
        </div>
        
        <a 
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-cyan-950 border border-cyan-700 px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 transition-all hover:bg-cyan-900 hover:text-cyan-100 hover:border-cyan-400 focus:outline-none hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] group/btn"
          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
        >
          <span>INIT</span>
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}
