// Strategic NATO & ICAO Flight Information Regions (FIR), Air Defense Identification Zones (ADIZ), and MGRS Quadrants

export interface FirSector {
  id: string;
  name: string;
  code: string;
  type: "FIR" | "ADIZ" | "MIL_SECTOR";
  country: string;
  color: string;
  center: [number, number]; // [lat, lng]
  boundaries: [number, number][]; // [[lat, lng], ...]
}

export const STRATEGIC_FIR_SECTORS: FirSector[] = [
  // 1. Taiwan Air Defense Identification Zone (ADIZ)
  {
    id: "taiwan-adiz",
    name: "TAIPEI FIR / TAIWAN ADIZ SECTOR",
    code: "RCAA-ADIZ",
    type: "ADIZ",
    country: "TAIWAN",
    color: "#ff003c",
    center: [23.5, 121.0],
    boundaries: [
      [21.0, 117.5],
      [21.0, 124.0],
      [26.5, 124.0],
      [26.5, 117.5],
      [21.0, 117.5]
    ]
  },
  // 2. Black Sea & Crimea Air Control Sector
  {
    id: "black-sea-fir",
    name: "SIMFEROPOL / BLACK SEA MARITIME FIR",
    code: "UKFV-FIR",
    type: "MIL_SECTOR",
    country: "BLACK SEA THEATER",
    color: "#ffff00",
    center: [44.5, 33.5],
    boundaries: [
      [42.0, 28.0],
      [42.0, 41.5],
      [46.5, 41.5],
      [46.5, 28.0],
      [42.0, 28.0]
    ]
  },
  // 3. Persian Gulf / Emirates FIR & Hormuz Chokepoint
  {
    id: "emirates-fir",
    name: "EMIRATES & STRAIT OF HORMUZ FIR",
    code: "OMAE-FIR",
    type: "FIR",
    country: "UAE / OMAN / GULF",
    color: "#00f0ff",
    center: [25.0, 55.0],
    boundaries: [
      [22.5, 51.0],
      [22.5, 60.0],
      [27.5, 60.0],
      [27.5, 51.0],
      [22.5, 51.0]
    ]
  },
  // 4. Baltic Sea NATO Air Policing Enclave (Suwalki / Kaliningrad)
  {
    id: "baltic-nato-fir",
    name: "BALTIC NATO AIR POLICING SECTOR (VILNIUS/RIGA)",
    code: "EYVL-FIR",
    type: "MIL_SECTOR",
    country: "NATO BALTIC FLANK",
    color: "#38bdf8",
    center: [55.5, 24.0],
    boundaries: [
      [53.5, 19.5],
      [53.5, 28.5],
      [58.5, 28.5],
      [58.5, 19.5],
      [53.5, 19.5]
    ]
  },
  // 5. Eastern Mediterranean & Levant Air Corridor
  {
    id: "levant-fir",
    name: "NICOSIA / LEVANT MARITIME FIR",
    code: "LCCC-FIR",
    type: "FIR",
    country: "EAST MEDITERRANEAN",
    color: "#a855f7",
    center: [34.5, 33.0],
    boundaries: [
      [31.5, 29.0],
      [31.5, 37.0],
      [36.5, 37.0],
      [36.5, 29.0],
      [31.5, 29.0]
    ]
  },
  // 6. South China Sea Spratly Air Control Sector
  {
    id: "south-china-sea-fir",
    name: "SOUTH CHINA SEA MARITIME SECTOR",
    code: "VVTS-FIR",
    type: "ADIZ",
    country: "SCS MARITIME THEATER",
    color: "#ff4500",
    center: [12.0, 114.0],
    boundaries: [
      [6.0, 108.0],
      [6.0, 120.0],
      [18.0, 120.0],
      [18.0, 108.0],
      [6.0, 108.0]
    ]
  }
];

// Generate Global Latitude & Longitude Tactical Graticule Lines (15-degree increments)
export function generateGraticulePaths(): { name: string; color: string; coords: [number, number, number][] }[] {
  const paths: { name: string; color: string; coords: [number, number, number][] }[] = [];

  // Parallels (Latitude lines from -75 to +75 by 15 deg)
  for (let lat = -75; lat <= 75; lat += 15) {
    const coords: [number, number, number][] = [];
    for (let lng = -180; lng <= 180; lng += 5) {
      coords.push([lat, lng, 0.002]);
    }
    paths.push({
      name: `LAT ${lat > 0 ? lat + "°N" : lat < 0 ? Math.abs(lat) + "°S" : "EQUATOR 0°"}`,
      color: lat === 0 ? "rgba(0, 243, 255, 0.45)" : "rgba(0, 243, 255, 0.15)",
      coords
    });
  }

  // Meridians (Longitude lines from -180 to +180 by 15 deg)
  for (let lng = -180; lng < 180; lng += 15) {
    const coords: [number, number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 5) {
      coords.push([lat, lng, 0.002]);
    }
    paths.push({
      name: `LNG ${lng > 0 ? lng + "°E" : lng < 0 ? Math.abs(lng) + "°W" : "PRIME MERIDIAN 0°"}`,
      color: lng === 0 ? "rgba(245, 158, 11, 0.45)" : "rgba(0, 243, 255, 0.15)",
      coords
    });
  }

  // FIR Sector Boundaries
  STRATEGIC_FIR_SECTORS.forEach(sec => {
    paths.push({
      name: sec.name,
      color: sec.color,
      coords: sec.boundaries.map(([lat, lng]) => [lat, lng, 0.004])
    });
  });

  return paths;
}
