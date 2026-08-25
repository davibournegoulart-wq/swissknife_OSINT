import { NextResponse } from "next/server";
import Parser from "rss-parser";
import feedsConfig from "@/data/rss_feeds.json";

const parser = new Parser({
  timeout: 6000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ShomerBot/1.0)" },
});

interface CacheEntry {
  data: any[];
  timestamp: number;
}

// In-memory cache with 10-min TTL
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 10 * 60 * 1000;
let globalCache: CacheEntry | null = null;
const GLOBAL_TTL = 5 * 60 * 1000;

const CONTINENT_COLORS: Record<string, string> = {
  Africa: "#10b981",
  Americas: "#3b82f6",
  Asia: "#f59e0b",
  Europe: "#a855f7",
  Oceania: "#06b6d4",
  Unknown: "#6b7280",
};

const CONTINENT_FOR_COUNTRY: Record<string, string> = {
  // Fill gaps for outlets with missing continents
  "Algeria": "Africa", "Egypt": "Africa", "Ethiopia": "Africa", "Ghana": "Africa",
  "Kenya": "Africa", "Nigeria": "Africa", "South Africa": "Africa", "Tanzania": "Africa",
  "Uganda": "Africa", "Morocco": "Africa", "Tunisia": "Africa", "Senegal": "Africa",
  "United States": "Americas", "Canada": "Americas", "Mexico": "Americas",
  "Brazil": "Americas", "Argentina": "Americas", "Colombia": "Americas",
  "Chile": "Americas", "Peru": "Americas", "Venezuela": "Americas", "Ecuador": "Americas",
  "Costa Rica": "Americas", "Panama": "Americas", "Guatemala": "Americas", "Cuba": "Americas",
  "Dominican Republic": "Americas", "Uruguay": "Americas", "Bolivia": "Americas",
  "El Salvador": "Americas", "Honduras": "Americas", "Paraguay": "Americas", "Nicaragua": "Americas",
  "United Kingdom": "Europe", "France": "Europe", "Germany": "Europe", "Italy": "Europe",
  "Spain": "Europe", "Portugal": "Europe", "Netherlands": "Europe", "Belgium": "Europe",
  "Sweden": "Europe", "Norway": "Europe", "Finland": "Europe", "Denmark": "Europe",
  "Poland": "Europe", "Czech Republic": "Europe", "Romania": "Europe", "Greece": "Europe",
  "Ireland": "Europe", "Switzerland": "Europe", "Austria": "Europe", "Russia": "Europe",
  "Ukraine": "Europe", "Turkey": "Europe",
  "China": "Asia", "Japan": "Asia", "South Korea": "Asia", "India": "Asia",
  "Pakistan": "Asia", "Bangladesh": "Asia", "Thailand": "Asia", "Vietnam": "Asia",
  "Philippines": "Asia", "Indonesia": "Asia", "Malaysia": "Asia", "Singapore": "Asia",
  "Myanmar": "Asia", "Taiwan": "Asia", "Hong Kong": "Asia", "Cambodia": "Asia",
  "Saudi Arabia": "Asia", "UAE": "Asia", "Israel": "Asia", "Iran": "Asia",
  "Iraq": "Asia", "Lebanon": "Asia", "Jordan": "Asia", "Qatar": "Asia", "Bahrain": "Asia",
  "Australia": "Oceania", "New Zealand": "Oceania",
};

async function fetchSingleFeed(feed: typeof feedsConfig[0]): Promise<any[]> {
  const cacheKey = feed.rss;
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const result = await parser.parseURL(feed.rss);
    const continent = feed.continent !== "Unknown" 
      ? feed.continent 
      : CONTINENT_FOR_COUNTRY[feed.country] || "Unknown";

    const items = (result.items || []).slice(0, 10).map((item) => ({
      title: (item.title || "").replace(/<[^>]*>/g, "").trim(),
      link: item.link || "",
      pubDate: item.pubDate || item.isoDate || "",
      thumbnail:
        item.enclosure?.url ||
        (item as any)["media:thumbnail"]?.["$"]?.url ||
        (item as any)["media:content"]?.["$"]?.url ||
        "",
      description: (item.contentSnippet || item.content || "")
        .replace(/<[^>]*>/g, "")
        .trim()
        .slice(0, 250),
      source: feed.name,
      country: feed.country,
      continent,
      accentColor: CONTINENT_COLORS[continent] || "#6b7280",
      language: feed.language,
    }));

    cache[cacheKey] = { data: items, timestamp: Date.now() };
    return items;
  } catch {
    // Return cached data if available (even if stale)
    if (cached) return cached.data;
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const continent = searchParams.get("continent");
  const country = searchParams.get("country");
  const limit = Math.min(parseInt(searchParams.get("limit") || "200"), 500);

  // Check global cache
  if (globalCache && Date.now() - globalCache.timestamp < GLOBAL_TTL && !continent && !country) {
    return NextResponse.json({
      articles: globalCache.data.slice(0, limit),
      total: globalCache.data.length,
      sources: feedsConfig.length,
      cached: true,
      timestamp: new Date(globalCache.timestamp).toISOString(),
    });
  }

  // Filter feeds by continent/country if requested
  let targetFeeds = feedsConfig;
  if (continent && continent !== "All") {
    targetFeeds = feedsConfig.filter((f) => {
      const c = f.continent !== "Unknown" ? f.continent : CONTINENT_FOR_COUNTRY[f.country] || "Unknown";
      return c === continent;
    });
  }
  if (country) {
    targetFeeds = feedsConfig.filter((f) => f.country === country);
  }

  // Fetch in parallel with concurrency limit
  const BATCH_SIZE = 15;
  const allItems: any[] = [];
  
  for (let i = 0; i < targetFeeds.length; i += BATCH_SIZE) {
    const batch = targetFeeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(fetchSingleFeed));
    results.forEach((r) => {
      if (r.status === "fulfilled") allItems.push(...r.value);
    });
  }

  // Sort newest first, deduplicate
  const seen = new Set<string>();
  const deduped = allItems
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .filter((item) => {
      if (!item.title) return false;
      const key = item.title.slice(0, 50).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Store in global cache
  if (!continent && !country) {
    globalCache = { data: deduped, timestamp: Date.now() };
  }

  return NextResponse.json({
    articles: deduped.slice(0, limit),
    total: deduped.length,
    sources: targetFeeds.length,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}
