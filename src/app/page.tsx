"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, ShieldAlert, Fingerprint, Map, DollarSign, Database, Server, Smartphone, MessagesSquare, Hash } from "lucide-react";
import toolsData from "@/data/tools.json";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, any> = {
  "AI & Threat Detection": ShieldAlert,
  "Archives & Databases": Database,
  "Blockchain & Cryptocurrency": Hash,
  "Business & Corporate Registers": Server,
  "Classifieds & E-commerce": DollarSign,
  "Cloud Security & Recon": Server,
  "Compliance, Sanctions & Legal": ShieldAlert,
  "Cyber Threat Intelligence (CTI)": ShieldAlert,
  "Dark Web & Anonymity": Fingerprint,
  "Dating & Communities": MessagesSquare,
  "Digital Forensics & Incident Response (DFIR)": ShieldAlert,
  "Domain & IP Analysis": Server,
  "Email & Username OSINT": MessagesSquare,
  "Encoding & Data Conversion": Hash,
  "Geospatial & Mapping": Map,
  "Media & Document Analysis": LayoutGrid,
  "Phone OSINT": Smartphone,
  "Social Media Intelligence (SOCMINT)": MessagesSquare,
  "Transportation OSINT": Map,
  "OSINT Training & Guides": LayoutGrid,
  "General OSINT Tools": LayoutGrid,
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
    <div className="flex min-h-screen flex-col lg:flex-row bg-neutral-950 text-neutral-200 selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 border-r border-neutral-800 bg-neutral-900/30 flex flex-col h-auto lg:h-screen lg:sticky top-0">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
            OSINT Master Key
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {toolsData.length} indexed tools
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
              selectedCategory === null 
                ? "bg-blue-600/10 text-blue-400" 
                : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            All Tools
            <span className="ml-auto text-xs opacity-50 font-mono">{toolsData.length}</span>
          </button>
          
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Categories
            </h3>
          </div>

          {categories.map(category => {
            const Icon = CATEGORY_ICONS[category] || LayoutGrid;
            const count = toolsData.filter(t => t.category === category).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                  selectedCategory === category
                    ? "bg-blue-600/10 text-blue-400" 
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate flex-1">{category}</span>
                <span className="text-xs opacity-50 font-mono">{count}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search tools, descriptions, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-100">
              {selectedCategory || "All OSINT Tools"}
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              Showing {filteredTools.length} results
            </p>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {filteredTools.map((tool, idx) => (
                <ToolCard key={`${tool.url}-${idx}`} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-300">No tools found</h3>
              <p className="text-neutral-500 mt-1 max-w-sm">
                We couldn't find any tools matching your search criteria. Try adjusting your filters or search query.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
