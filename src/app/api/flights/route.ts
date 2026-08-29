import { NextResponse } from "next/server";
import { saveSnapshot } from "@/lib/db";

export interface Flight {
  lat: number;
  lng: number;
  callsign: string;
  country: string;
  altitude: number;
  velocity: number;
  track: number;
  type: "commercial" | "military" | "vip";
  aircraftType?: string;
  mission?: string;
  radarSource?: string;
  squawk?: string;
}

let cachedFlights: Flight[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 15 * 1000; // 15 seconds cache

let lastSnapshotTime = 0;
const SNAPSHOT_INTERVAL = 1 * 60 * 1000; // 1 minute for testing, later we can change to 5 min

// Known military prefixes and patterns
const MILITARY_PREFIXES = [
  "RCH", "RRR", "CNV", "CFC", "ASY", "PAT", "JAKE", "FORTE", "HOMER", 
  "VIPER", "TITAN", "REDEYE", "LAGR", "NCHO", "GAF", "BAF", "FAF", "IAM", 
  "FAB", "KAF", "UAF", "IAF", "PLAAF", "RFF", "SAM", "EXEC", "SWORD", 
  "VALKYRIE", "GHOST", "REAPER", "SHADOW", "HAWK", "TOPCAT", "NAVY", "ARMY", "USAF"
];

const VIP_PREFIXES = ["GLF", "EJA", "NJE", "LXJ", "VJT", "XOJ", "JTM", "FYG", "TAG"];

// Dedicated High-Interest Military Air Patrols
const ACTIVE_MILITARY_PATROLS: Flight[] = [
  { lat: 43.8, lng: 32.5, callsign: "FORTE10", country: "United States", altitude: 17500, velocity: 160, track: 85, type: "military", aircraftType: "RQ-4B Global Hawk (UAV)", mission: "Black Sea High-Altitude Strategic Reconnaissance" },
  { lat: 55.2, lng: 20.8, callsign: "HOMER41", country: "United Kingdom", altitude: 10600, velocity: 210, track: 240, type: "military", aircraftType: "RC-135W Rivet Joint", mission: "Baltic Electronic Signals Intelligence (SIGINT)" },
  { lat: 24.5, lng: 122.3, callsign: "VIPER21", country: "United States", altitude: 8500, velocity: 230, track: 190, type: "military", aircraftType: "P-8A Poseidon", mission: "Taiwan Strait Maritime Surveillance & ASW" },
  { lat: 26.8, lng: 54.2, callsign: "REDEYE06", country: "United States", altitude: 9400, velocity: 220, track: 120, type: "military", aircraftType: "E-3 Sentry (AWACS)", mission: "Persian Gulf Airborne Early Warning & Control" },
  { lat: 34.2, lng: 34.5, callsign: "RRR721", country: "United Kingdom", altitude: 8900, velocity: 215, track: 310, type: "military", aircraftType: "Eurofighter Typhoon FGR4", mission: "Eastern Mediterranean Combat Air Patrol (CAP)" },
  { lat: 49.8, lng: 23.5, callsign: "LAGR223", country: "United States", altitude: 8200, velocity: 190, track: 15, type: "military", aircraftType: "KC-135R Stratotanker", mission: "NATO Eastern Flank Aerial Refueling Orbit" },
  { lat: -22.1, lng: -44.2, callsign: "FAB2801", country: "Brazil", altitude: 11000, velocity: 240, track: 165, type: "military", aircraftType: "KC-390 Millennium", mission: "Strategic Tactical Air Transport & Refueling" },
  { lat: 38.8, lng: 128.5, callsign: "COBRA66", country: "United States", altitude: 9800, velocity: 225, track: 45, type: "military", aircraftType: "RC-135S Cobra Ball", mission: "Sea of Japan Ballistic Missile Telemetry Tracking" }
];

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

function classifyFlight(callsign: string): { type: "commercial" | "military" | "vip"; aircraftType: string; mission?: string } {
  const clean = callsign.toUpperCase();
  for (const p of MILITARY_PREFIXES) {
    if (clean.startsWith(p)) {
      return { 
        type: "military", 
        aircraftType: "Military / Strategic Transport / Recon", 
        mission: "Tactical Defense / Intercept Operation" 
      };
    }
  }
  for (const v of VIP_PREFIXES) {
    if (clean.startsWith(v)) {
      return { 
        type: "vip", 
        aircraftType: "Private Executive Jet", 
        mission: "VIP / Corporate Transport" 
      };
    }
  }
  return { 
    type: "commercial", 
    aircraftType: "Commercial Airliner" 
  };
}

function generateSimulatedFlights(): Flight[] {
  const list: Flight[] = [...ACTIVE_MILITARY_PATROLS];
  
  AIR_CORRIDORS.forEach((corridor, idx) => {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const progress = (i + Math.random() * 0.5) / count;
      const lat = corridor.from.lat + (corridor.to.lat - corridor.from.lat) * progress + (Math.random() - 0.5) * 1.5;
      const lng = corridor.from.lng + (corridor.to.lng - corridor.from.lng) * progress + (Math.random() - 0.5) * 1.5;
      
      const angle = Math.atan2(corridor.to.lat - corridor.from.lat, corridor.to.lng - corridor.from.lng) * (180 / Math.PI);
      const track = Math.round((90 - angle + 360) % 360);
      
      const isMil = (idx === 0 && i === 3) || (idx === 5 && i === 7);
      const isVip = (idx === 2 && i === 4) || (idx === 7 && i === 2);
      
      const callsign = isMil 
        ? `RCH${500 + i}` 
        : isVip 
        ? `NJE${200 + i}` 
        : `${corridor.prefix}${100 + idx * 20 + i}`;

      const meta = classifyFlight(callsign);

      list.push({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        callsign: callsign,
        country: corridor.country,
        altitude: Math.round(9000 + Math.random() * 3000),
        velocity: Math.round(220 + Math.random() * 60),
        track: track,
        type: meta.type,
        aircraftType: meta.aircraftType,
        mission: meta.mission,
        radarSource: isMil ? "MLAT (Secondary Triangulation)" : "ADS-B (GPS)",
        squawk: isMil ? "0000" : String(Math.floor(1000 + Math.random() * 8999))
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
      const allValidFlights = rawStates
        .filter((s: any) => !s[8] && typeof s[5] === "number" && typeof s[6] === "number")
        .map((s: any) => {
          const callsign = (s[1] || "").trim() || `ICAO-${s[0]?.toUpperCase()}`;
          const classification = classifyFlight(callsign);
          return {
            lat: s[6],
            lng: s[5],
            callsign: callsign,
            country: s[2] || "International",
            altitude: s[7] || 10000,
            velocity: s[9] || 240,
            track: s[10] || 0,
            type: classification.type,
            aircraftType: classification.aircraftType,
            mission: classification.mission,
            radarSource: s[16] === 0 ? "ADS-B (GPS)" : s[16] === 1 ? "ASTERIX (Primary/ATC)" : s[16] === 2 ? "MLAT (Secondary Triangulation)" : s[16] === 3 ? "FLARM" : "UNKNOWN RADAR",
            squawk: s[14] || "NONE"
          };
        });

      // Prioritize military and VIP flights, then pad with commercial up to 500
      const militaryFlights = allValidFlights.filter((f: any) => f.type === "military");
      const vipFlights = allValidFlights.filter((f: any) => f.type === "vip");
      const commercialFlights = allValidFlights.filter((f: any) => f.type === "commercial");
      
      const liveFlights: Flight[] = [
        ...militaryFlights,
        ...vipFlights,
        ...commercialFlights
      ].slice(0, 500);

      // Always prepend critical military patrols so user can test and inspect them immediately
      const merged = [...ACTIVE_MILITARY_PATROLS, ...liveFlights];

      if (merged.length > 0) {
        cachedFlights = merged;
        lastFetchTime = now;
        
        if (now - lastSnapshotTime > SNAPSHOT_INTERVAL) {
          saveSnapshot(cachedFlights);
          lastSnapshotTime = now;
        }

        return NextResponse.json({ flights: merged, total: merged.length, source: "opensky_live_enriched" });
      }
    }
  } catch (err) {
    console.warn("OpenSky Network fetch error or timeout, engaging realistic ADS-B corridor simulation:", err);
  }

  // Fallback to simulated global flights if OpenSky is rate-limited or fails
  const simFlights = generateSimulatedFlights();
  cachedFlights = simFlights;
  lastFetchTime = now;

  if (now - lastSnapshotTime > SNAPSHOT_INTERVAL) {
    saveSnapshot(cachedFlights);
    lastSnapshotTime = now;
  }

  return NextResponse.json({
    flights: simFlights,
    total: simFlights.length,
    source: "corridor_simulation_enriched"
  });
}
