import { ExternalLink, ShieldCheck } from "lucide-react";
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
  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all hover:border-blue-500/50 hover:bg-neutral-900 hover:shadow-lg hover:shadow-blue-900/10 h-full">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-neutral-200 line-clamp-1 flex-1" title={tool.name}>
          {tool.name}
        </h3>
        {tool.status === "live" && (
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Verified Live" />
        )}
      </div>

      <p className="mt-3 text-sm text-neutral-400 line-clamp-3 flex-1" title={tool.description}>
        {tool.description || "No description provided."}
      </p>

      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-300">
            {tool.category}
          </span>
          {tool.pricing.toLowerCase() !== "free" && (
            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500 border border-amber-500/20">
              {tool.pricing}
            </span>
          )}
        </div>
        
        <a 
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
        >
          <span>Open</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
