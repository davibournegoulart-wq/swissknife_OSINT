import { NextResponse } from 'next/server';
import { FALLBACK_TLES } from '../../../data/fallback_tles';

let cache: Record<string, string[]> | null = null;
let lastFetch = 0;

export async function GET() {
  const now = Date.now();
  if (cache && now - lastFetch < 2 * 60 * 60 * 1000) {
    return NextResponse.json({ tles: cache });
  }

  try {
    const urls = [
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=military&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle"
    ];

    let allTles: string[] = [];
    for (const url of urls) {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (!text.includes("GP data has not updated")) {
            allTles = allTles.concat(text.split('\n').map(l => l.trim()).filter(l => l.length > 0));
        }
      }
    }

    if (allTles.length === 0) throw new Error("No TLEs fetched");

    const tlesMap: Record<string, string[]> = {};
    const tracking = [
      { id: 'iss', search: '25544U' },
      { id: 'sentinel2a', search: '40697U' },
      { id: 'landsat9', search: '49260U' },
      { id: 'worldview3', search: '40115U' },
      { id: 'kh11', search: '43013U' },
      { id: 'starlink', search: '54100U' },
      { id: 'sbirs', search: '41866U' },
    ];

    for (let i = 0; i < allTles.length; i++) {
      for (const t of tracking) {
        if (allTles[i].includes(t.search)) {
           // This is line 1, line 2 is i + 1
           if (i + 1 < allTles.length) {
             tlesMap[t.id] = [allTles[i], allTles[i+1]];
           }
        }
      }
    }

    // Merge with fallbacks if missing
    for (const k of Object.keys(FALLBACK_TLES)) {
      if (!tlesMap[k]) tlesMap[k] = FALLBACK_TLES[k];
    }

    cache = tlesMap;
    lastFetch = now;
    return NextResponse.json({ tles: cache });

  } catch (error) {
    console.error("Satellite fetch error:", error);
    return NextResponse.json({ tles: cache || FALLBACK_TLES }, { status: 500 });
  }
}
