import * as satellite from "satellite.js";
export interface SatelliteDef {
  id: string;
  name: string;
  noradId: number;
  type: "optical" | "sar" | "station" | "weather" | "comms";
  operator: string;
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  periodMin: number;
  raan0Deg: number; // Right ascension of ascending node
  meanAnomaly0Deg: number; // Initial mean anomaly
  color: string;
  payload: string;
  resolution: string;
  description: string;
  videoSearch: string;
}

export const SATELLITE_CATALOG: SatelliteDef[] = [
  {
    id: "iss",
    name: "ISS (ZARYA) // SPACE STATION",
    noradId: 25544,
    type: "station",
    operator: "NASA / ESA / JAXA / CSA",
    altitudeKm: 420,
    velocityKmS: 7.66,
    inclinationDeg: 51.64,
    periodMin: 92.9,
    raan0Deg: 120,
    meanAnomaly0Deg: 45,
    color: "#00f3ff",
    payload: "HDEV High-Definition Earth Viewing & Cupola Multi-Sensor Array",
    resolution: "Continuous HD Live Video Downlink",
    description: "Crewed orbital outpost conducting real-time Earth surveillance, scientific research, and orbital imaging across populated latitudes.",
    videoSearch: "ISS live earth from space stream nasa"
  },
  {
    id: "sentinel2a",
    name: "SENTINEL-2A // COPERNICUS",
    noradId: 40697,
    type: "optical",
    operator: "European Space Agency (ESA)",
    altitudeKm: 786,
    velocityKmS: 7.45,
    inclinationDeg: 98.62,
    periodMin: 100.6,
    raan0Deg: 280,
    meanAnomaly0Deg: 190,
    color: "#00ff88",
    payload: "Multi-Spectral Instrument (MSI) across 13 spectral bands",
    resolution: "10m Optical / Thermal Swath",
    description: "High-resolution optical Earth observation satellite providing rapid-revisit monitoring of coastlines, conflict zones, vegetation, and natural disasters.",
    videoSearch: "ESA Sentinel satellite earth observation"
  },
  {
    id: "landsat9",
    name: "LANDSAT-9 // NASA-USGS",
    noradId: 49260,
    type: "optical",
    operator: "NASA / USGS Geospatial Program",
    altitudeKm: 705,
    velocityKmS: 7.50,
    inclinationDeg: 98.22,
    periodMin: 98.8,
    raan0Deg: 60,
    meanAnomaly0Deg: 310,
    color: "#38bdf8",
    payload: "Operational Land Imager 2 (OLI-2) & Thermal Infrared Sensor 2 (TIRS-2)",
    resolution: "15m Panchromatic / 30m Multispectral",
    description: "Flagship US multispectral Earth observation satellite tracking land use change, thermal anomalies, wildfires, and critical water resources.",
    videoSearch: "NASA Landsat 9 satellite launch and imaging"
  },
  {
    id: "worldview3",
    name: "MAXAR WORLDVIEW-3 // RECON",
    noradId: 40115,
    type: "optical",
    operator: "Maxar Technologies / NGA",
    altitudeKm: 617,
    velocityKmS: 7.55,
    inclinationDeg: 97.96,
    periodMin: 97.0,
    raan0Deg: 190,
    meanAnomaly0Deg: 80,
    color: "#ffd700",
    payload: "Super-Resolution Optical, Shortwave Infrared (SWIR) & CAVIS Array",
    resolution: "0.31m (31cm) Tactical Optical",
    description: "Commercial & defense high-resolution reconnaissance satellite capable of imaging aircraft on runways, naval ship deployments, and urban developments in ultra-clarity.",
    videoSearch: "Maxar satellite high resolution imaging world view"
  },
  {
    id: "noaa20",
    name: "NOAA-20 (JPSS-1) // THERMAL RADAR",
    noradId: 43013,
    type: "weather",
    operator: "NOAA / NESDIS",
    altitudeKm: 824,
    velocityKmS: 7.43,
    inclinationDeg: 98.74,
    periodMin: 101.4,
    raan0Deg: 340,
    meanAnomaly0Deg: 140,
    color: "#ff4500",
    payload: "VIIRS Day-Night Band & Cross-track Infrared Sounder (CrIS)",
    resolution: "375m High-Sensitivity Thermal / Night Radiance",
    description: "Polar-orbiting environmental satellite detecting midnight thermal signatures of wildfires, volcanic eruptions, gas flares, and tropical cyclone cores.",
    videoSearch: "NOAA VIIRS satellite thermal earth monitoring"
  },
  {
    id: "starlink",
    name: "STARLINK ARRAY // TACTICAL SATCOM",
    noradId: 54100,
    type: "comms",
    operator: "SpaceX / US Space Force",
    altitudeKm: 550,
    velocityKmS: 7.58,
    inclinationDeg: 53.20,
    periodMin: 95.6,
    raan0Deg: 15,
    meanAnomaly0Deg: 240,
    color: "#a855f7",
    payload: "Ku/Ka-Band Phased Array Antennas & Optical Laser Inter-Satellite Links",
    resolution: "Low-Latency High-Bandwidth Orbital Uplink",
    description: "Low Earth orbit satellite constellation providing high-speed tactical connectivity, resilient battlefield communications, and emergency internet relays.",
    videoSearch: "Starlink satellite deployment and orbital operations"
  },
  {
    id: "goes16",
    name: "GOES-16 (EAST) // GEOSTATIONARY",
    noradId: 41866,
    type: "weather",
    operator: "NOAA / NASA",
    altitudeKm: 35786,
    velocityKmS: 3.07,
    inclinationDeg: 0.0,
    periodMin: 1436.1,
    raan0Deg: 0,
    meanAnomaly0Deg: 0,
    color: "#f59e0b",
    payload: "Advanced Baseline Imager (ABI) & Geostationary Lightning Mapper (GLM)",
    resolution: "500m Full-Disk Continental Imagery",
    description: "Geostationary surveillance platform parked at 75.2°W providing continuous 30-second rapid-scan imagery of the Americas and Atlantic hurricane corridors.",
    videoSearch: "GOES 16 satellite full disk earth live"
  }
];

// Propagates satellite position at any given timestamp
export function getSatellitePosition(sat: SatelliteDef, timeMs: number = Date.now(), tles?: string[]) {
  if (tles && tles.length === 2) {
    try {
      const satrec = satellite.twoline2satrec(tles[0], tles[1]);
      const date = new Date(timeMs);
      const positionAndVelocity = satellite.propagate(satrec, date);
      const positionEci = positionAndVelocity.position;
      
      if (typeof positionEci !== 'boolean' && positionEci) {
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        const lng = satellite.degreesLong(positionGd.longitude);
        const lat = satellite.degreesLat(positionGd.latitude);
        const alt = positionGd.height;
        
        return {
          lat,
          lng,
          alt: Math.min(0.25, (alt / 6371) * 0.6), 
          altitudeKm: alt,
          velocityKmS: sat.velocityKmS
        };
      }
    } catch (e) {
      console.error("satellite.js error:", e);
    }
  }

  const earthRotRate = 360 / (24 * 3600 * 1000); // deg per ms
  const timeSeconds = timeMs / 1000;
  
  if (sat.inclinationDeg === 0) {
    // Geostationary
    return {
      lat: 0,
      lng: -75.2,
      alt: sat.altitudeKm / 6371 * 0.5,
      altitudeKm: sat.altitudeKm,
      velocityKmS: sat.velocityKmS
    };
  }

  // Mean anomaly at time
  const periodMs = sat.periodMin * 60 * 1000;
  const meanAnomaly = ((sat.meanAnomaly0Deg + (timeMs / periodMs) * 360) % 360) * (Math.PI / 180);
  const inc = sat.inclinationDeg * (Math.PI / 180);
  
  // Approximate latitude & orbital progression
  const latRad = Math.asin(Math.sin(inc) * Math.sin(meanAnomaly));
  const lat = latRad * (180 / Math.PI);
  
  // Orbital longitude progression with Earth rotation subtraction
  const y = Math.sin(meanAnomaly) * Math.cos(inc);
  const x = Math.cos(meanAnomaly);
  const orbitalLng = Math.atan2(y, x) * (180 / Math.PI);
  
  const raan = (sat.raan0Deg - (timeMs * earthRotRate)) % 360;
  let lng = (raan + orbitalLng) % 360;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;

  // Altitude factor for 3D Globe (normalized radius)
  const globeAlt = Math.min(0.25, (sat.altitudeKm / 6371) * 0.6);

  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    alt: globeAlt,
    altitudeKm: sat.altitudeKm,
    velocityKmS: sat.velocityKmS
  };
}

// Generate 3D Orbit Path Polyline around the Earth for rendering
export function getOrbitPath(sat: SatelliteDef, steps: number = 64) {
  if (sat.inclinationDeg === 0) return [];
  const points: [number, number, number][] = [];
  const inc = sat.inclinationDeg * (Math.PI / 180);
  const earthAlt = Math.min(0.25, (sat.altitudeKm / 6371) * 0.6);
  const now = Date.now();
  const periodMs = sat.periodMin * 60 * 1000;

  for (let i = 0; i <= steps; i++) {
    const t = now + (i / steps) * periodMs;
    const pos = getSatellitePosition(sat, t);
    points.push([pos.lat, pos.lng, earthAlt]);
  }

  return points;
}
