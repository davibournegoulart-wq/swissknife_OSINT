import { NextResponse } from "next/server";

interface Flight {
  lat: number;
  lng: number;
  callsign: string;
  country: string;
  altitude: number;
  velocity: number;
  track: number;
  isMil?: boolean;
}

let cachedFlights: Flight[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 15 * 1000; // 15 seconds cache

// Major international airport hubs for fallback trajectory generation
const AIR_CORRIDORS = [
  { from: { lat: 40.6413, lng: -73.7781, name: "JFK" }, to: { lat: 51.4700, lng: -0.4543, name: "LHR" }, prefix: "BAW", country: "United Kingdom" },
  { from: { lat: 51.4700, lng: -0.4543, name: "LHR" }, to: { lat: 25.2532, lng: 55.3657, name: "DXB" }, prefix: "UAE", country: "United Arab Emirates" },
  { from: { lat: 34.0522, lng: -118.2437, name: "LAX" }, to: { lat: 35.7720, lng: 140.3929, name: "NRT" }, prefix: "ANA", country: "Japan" },
  { from: { lat: -23.4356, lng: -46.4731, name: "GRU" }, to: { lat: 40.4839, lng: -3.5680, name: "MAD" }, prefix: "IBE", country: "Spain" },
  { from: { lat: -23.4356, lng: -46.4731, name: "GRU" }, to: { lat: 25.7959, lng: -80.2870, name: "MIA" }, prefix: "AAL", country: "United States" },
  { from: { lat: 50.0379, lng: 8.5622, name: "FRA" }, to: { lat: 1.3644, lng: 103.9915, name: "SIN" }, prefix: "SIA", country: "Singapore" },
  { from: { lat: 22.3080, lng: 113.9185, name: "HKG" }, to: { lat: -33.9399, lng: 151.1753, name: "SYD" }, prefix: "QFA", country: "Australia" },
  { from: { lat: 49.0097, lng: 2.5479, name: "CDG" }, to: { lat: 30.0444, lng: 31.2357, name: "CAI" }, prefix: "MSR", country: "Egypt" },
  { from: { lat: 41.9742, lng: -87.9073, name: "ORD" }, to: { lat: 47.4502, lng: -122.3088, name: "SEA" }, prefix: "DAL", country: "United States" },
  { from: { lat: 28.5562, lng: 77.1000, name: "DEL" }, to: { lat: 51.4700, lng: -0.4543, name: "LHR" }, prefix: "AIC", country: "India" },
  { from: { lat: 37.6213, lng: -122.3790, name: "SFO" }, to: { lat: 21.3187, lng: -157.9224, name: "HNL" }, prefix: "HAL", country: "United States" },
  { from: { lat: -34.8222, lng: -58.5358, name: "EZE" }, to: { lat: -33.3930, lng: -70.7858, name: "SCL" }, prefix: "LAN", country: "Chile" },
  { from: { lat: 55.9726, lng: 37.4146, name: "SVO" }, to: { lat: 39.9042, lng: 116.4074, name: "PEK" }, prefix: "CCA", country: "China" },
  { from: { lat: 52.3676, lng: 4.9041, name: "AMS" }, to: { lat: -26.1367, lng: 28.2411, name: "JNB" }, prefix: "KLM", country: "Netherlands" }
];

function generateSimulatedFlights(): Flight[] {
  const list: Flight[] = [];
  
  AIR_CORRIDORS.forEach((corridor, idx) => {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const progress = (i + Math.random() * 0.5) / count;
      const lat = corridor.from.lat + (corridor.to.lat - corridor.from.lat) * progress + (Math.random() - 0.5) * 1.5;
      const lng = corridor.from.lng + (corridor.to.lng - corridor.from.lng) * progress + (Math.random() - 0.5) * 1.5;
      
      const angle = Math.atan2(corridor.to.lat - corridor.from.lat, corridor.to.lng - corridor.from.lng) * (180 / Math.PI);
      const track = Math.round((90 - angle + 360) % 360);
      
      list.push({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        callsign: `${corridor.prefix}${100 + idx * 20 + i}`,
        country: corridor.country,
        altitude: Math.round(9000 + Math.random() * 3000),
        velocity: Math.round(220 + Math.random() * 60),
        track: track,
        isMil: false
      });
    }
  });

  return list;
}

export async function GET() {
  const now = Date.now();

  if (cachedFlights.length > 0 && now - lastFetchTime < CACHE_TTL) {
    return NextResponse.json({ flights: cachedFlights, total: cachedFlights.length, source: "cache" });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://opensky-network.org/api/states/all", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      signal: controller.signal,
      next: { revalidate: 15 }
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawStates = data.states || [];
      const liveFlights: Flight[] = rawStates
        .filter((s: any) => !s[8] && typeof s[5] === "number" && typeof s[6] === "number")
        .slice(0, 400)
        .map((s: any) => ({
          lat: s[6],
          lng: s[5],
          callsign: (s[1] || "").trim() || `ICAO-${s[0]?.toUpperCase()}`,
          country: s[2] || "International",
          altitude: s[7] || 10000,
          velocity: s[9] || 240,
          track: s[10] || 0
        }));

      if (liveFlights.length > 0) {
        cachedFlights = liveFlights;
        lastFetchTime = now;
        return NextResponse.json({ flights: liveFlights, total: liveFlights.length, source: "opensky_live" });
      }
    }
  } catch (err) {
    console.warn("OpenSky Network fetch error or timeout, engaging realistic ADS-B corridor simulation:", err);
  }

  // Fallback to simulated global flights if OpenSky is rate-limited or fails
  const simFlights = generateSimulatedFlights();
  cachedFlights = simFlights;
  lastFetchTime = now;

  return NextResponse.json({
    flights: simFlights,
    total: simFlights.length,
    source: "corridor_simulation"
  });
}
