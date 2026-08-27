// Geodesic calculations (Great Circle / Haversine distance, bearings, and intercept times)

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
  type?: string;
}

export interface GeodesicMeasurement {
  pointA: GeoPoint;
  pointB: GeoPoint;
  distanceKm: number;
  distanceNm: number;
  distanceMiles: number;
  bearingDeg: number;
  // Intercept estimates in hours/minutes
  timeSubsonicMach08: { hours: number; minutes: number; totalMinutes: number }; // ~987 km/h
  timeSupersonicMach2: { hours: number; minutes: number; totalMinutes: number }; // ~2469 km/h
  timeDroneCruise: { hours: number; minutes: number; totalMinutes: number }; // ~180 km/h (Shahed / Reaper)
  timeBallisticMach5: { hours: number; minutes: number; totalMinutes: number }; // ~6174 km/h (Hypersonic/Ballistic)
}

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Convert radians to degrees
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Calculate Great Circle Distance in KM using Haversine formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate Initial Bearing in degrees (0 - 360)
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

// Format duration into hours and minutes
function formatTime(hoursFloat: number) {
  const totalMinutes = Math.round(hoursFloat * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
}

// Compute full tactical geodesic measurement
export function computeGeodesicMeasurement(pointA: GeoPoint, pointB: GeoPoint): GeodesicMeasurement {
  const distKm = calculateDistanceKm(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
  const distNm = distKm * 0.539957; // 1 KM = 0.539957 Nautical Miles
  const distMiles = distKm * 0.621371;
  const bearing = calculateBearing(pointA.lat, pointA.lng, pointB.lat, pointB.lng);

  // Speed constants
  const SPEED_MACH_08_KMH = 987.8; // Subsonic fighter cruise
  const SPEED_MACH_2_KMH = 2469.6;  // Supersonic fighter sprint
  const SPEED_DRONE_KMH = 180;      // Long range drone
  const SPEED_HYPERSONIC_KMH = 6174; // Hypersonic / Ballistic glide

  return {
    pointA,
    pointB,
    distanceKm: Math.round(distKm * 10) / 10,
    distanceNm: Math.round(distNm * 10) / 10,
    distanceMiles: Math.round(distMiles * 10) / 10,
    bearingDeg: Math.round(bearing * 10) / 10,
    timeSubsonicMach08: formatTime(distKm / SPEED_MACH_08_KMH),
    timeSupersonicMach2: formatTime(distKm / SPEED_MACH_2_KMH),
    timeDroneCruise: formatTime(distKm / SPEED_DRONE_KMH),
    timeBallisticMach5: formatTime(distKm / SPEED_HYPERSONIC_KMH)
  };
}

// Predefined Threat Range Rings (in KM) from designated centers
export interface ThreatZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ranges: {
    name: string;
    radiusKm: number;
    color: string;
    dashArray?: string;
  }[];
}

export const STRATEGIC_THREAT_HUBS: ThreatZone[] = [
  {
    id: "taiwan-strait",
    name: "Taiwan Strait & Eastern Theater",
    lat: 24.5,
    lng: 120.0,
    ranges: [
      { name: "Short-Range Artillery / Drone (300 km)", radiusKm: 300, color: "#ff003c" },
      { name: "Anti-Ship Cruise Missile YJ-12 (500 km)", radiusKm: 500, color: "#ff8c00" },
      { name: "DF-21D Anti-Ship Ballistic Missile (1500 km)", radiusKm: 1500, color: "#ffff00" },
      { name: "DF-26 Second Island Chain (3000 km)", radiusKm: 3000, color: "#a855f7" }
    ]
  },
  {
    id: "black-sea-crimea",
    name: "Crimea / Black Sea Theater",
    lat: 44.95,
    lng: 34.10,
    ranges: [
      { name: "Storm Shadow / SCALP-EG (250 km)", radiusKm: 250, color: "#00ff88" },
      { name: "Kalibr / Iskander-M (500 km)", radiusKm: 500, color: "#ff003c" },
      { name: "Shahed-136 Drone Standoff (1000 km)", radiusKm: 1000, color: "#ff8c00" }
    ]
  },
  {
    id: "persian-gulf",
    name: "Strait of Hormuz / Persian Gulf",
    lat: 26.56,
    lng: 56.25,
    ranges: [
      { name: "Coastal Anti-Ship Noor/Ghader (200 km)", radiusKm: 200, color: "#ff003c" },
      { name: "Fattah Hypersonic / Kheibar (1400 km)", radiusKm: 1400, color: "#ff8c00" },
      { name: "Arash-2 / Mohajer-6 Attack Drones (2000 km)", radiusKm: 2000, color: "#ffff00" }
    ]
  },
  {
    id: "baltic-kaliningrad",
    name: "Kaliningrad Suwalki Gap Enclave",
    lat: 54.71,
    lng: 20.51,
    ranges: [
      { name: "S-400 Triumf Anti-Air (400 km)", radiusKm: 400, color: "#00d2ff" },
      { name: "Iskander-M Nuclear-Capable (500 km)", radiusKm: 500, color: "#ff003c" },
      { name: "Kinzhal Air-Launched ALBM (1500 km)", radiusKm: 1500, color: "#a855f7" }
    ]
  }
];
