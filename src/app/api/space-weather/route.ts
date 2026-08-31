import { NextResponse } from 'next/server';

let cache: any = null;
let lastFetch = 0;

export async function GET() {
  const now = Date.now();
  if (cache && now - lastFetch < 15 * 60 * 1000) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1];
        
        let status = "NORMAL";
        let level = 1;
        
        if (latest.Kp >= 7) {
          status = "SEVERE GEOMAGNETIC STORM";
          level = 4;
        } else if (latest.Kp >= 5) {
          status = "GEOMAGNETIC STORM ACTIVE";
          level = 3;
        } else if (latest.Kp >= 4) {
          status = "ACTIVE / UNSETTLED";
          level = 2;
        }

        cache = {
          kp: latest.Kp,
          time: latest.time_tag,
          status,
          level
        };
        lastFetch = now;
        return NextResponse.json(cache);
      }
    }
  } catch (err) {
    console.error("Space weather fetch error", err);
  }
  
  return NextResponse.json(cache || { kp: 0, status: "OFFLINE", level: 0 });
}
