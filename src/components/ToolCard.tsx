import { ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: {
    name: string;
    description: string;
    url: string;
    category: string;
    pricing?: string;
  };
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="group relative bg-[#050a10]/60 border border-cyan-900/40 p-4 flex flex-col h-full transition-all duration-300 hover:bg-[#08121d] hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]">
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b border-cyan-900/30 pb-2">
        <h3 className="text-sm font-bold text-cyan-50 group-hover:text-cyan-300 tracking-wider uppercase truncate pr-4">
          {tool.name}
        </h3>
        <ShieldCheck className="w-4 h-4 text-cyan-700 group-hover:text-cyan-400 shrink-0" />
      </div>
      
      {/* Description */}
      <p className="text-[11px] text-cyan-600/80 leading-relaxed mb-4 flex-1 line-clamp-4">
        {tool.description}
      </p>
      
      {/* Footer / Telemetry */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black tracking-widest text-cyan-800 uppercase bg-cyan-950/30 px-1.5 py-0.5 border border-cyan-900/30">
            {tool.category}
          </span>
          {tool.pricing && (
            <span className="text-[8px] tracking-widest text-emerald-600 uppercase">
              // {tool.pricing}
            </span>
          )}
        </div>
        
        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-cyan-500 bg-cyan-950/40 border border-cyan-800 px-3 py-1.5 hover:bg-cyan-500 hover:text-[#020205] transition-colors"
        >
          INIT <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
