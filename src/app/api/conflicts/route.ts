import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 6000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; OSINT/2.0)" },
});

const CONFLICT_ZONES = [
  { id: 'ukraine', lat: 48.3794, lng: 31.1656, title: "Russo-Ukrainian War", country: "Ukraine", color: "#ffff00", feed: "https://ukraine.liveuamap.com/rss" },
  { id: 'gaza', lat: 31.5, lng: 34.466667, title: "Gaza Strip & Levant Conflict", country: "Israel", color: "#ffff00", feed: "https://israel.liveuamap.com/rss" },
  { id: 'sudan', lat: 15.5007, lng: 32.5599, title: "Sudan Civil War", country: "Sudan", color: "#ffff00", feed: null }, // fallback
  { id: 'yemen', lat: 14.8, lng: 43.0, title: "Red Sea & Yemen Escalation", country: "Yemen", color: "#ffff00", feed: "https://syria.liveuamap.com/rss" },
  { id: 'haiti', lat: 19.0, lng: -72.25, title: "Haiti Gang Warfare", country: "Haiti", color: "#ffff00", feed: null }
];

let cache: any = null;
let lastFetch = 0;

export async function GET() {
  const now = Date.now();
  if (cache && now - lastFetch < 15 * 60 * 1000) {
    return NextResponse.json({ conflicts: cache });
  }

  const activeConflicts = [];

  for (const zone of CONFLICT_ZONES) {
    let desc = "Active combat operations and frontline skirmishes";
    let active = true;

    if (zone.feed) {
      try {
        const result = await parser.parseURL(zone.feed);
        if (result.items && result.items.length > 0) {
          // Use the latest news headline as the live description
          desc = result.items[0].title || desc;
        }
      } catch (e) {
        console.error("Failed to fetch RSS for", zone.id);
      }
    }

    activeConflicts.push({
      lat: zone.lat,
      lng: zone.lng,
      title: zone.title,
      country: zone.country,
      desc: `[LIVE] ${desc}`,
      color: zone.color
    });
  }

  cache = activeConflicts;
  lastFetch = now;

  return NextResponse.json({ conflicts: activeConflicts });
}
