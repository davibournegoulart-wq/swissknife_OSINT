// Curated Global Live Public Cameras (CCTV, Strategic Chokepoints, Metropolises, Volcanoes, Ports)

export interface PublicCamera {
  id: string;
  name: string;
  city: string;
  country: string;
  region: "Americas" | "Europe" | "Asia-Pacific" | "Middle East & Africa" | "Global";
  category: "Strategic Chokepoints" | "Metropolises" | "Volcanoes & Nature" | "Maritime Ports" | "Space & Orbit";
  lat: number;
  lng: number;
  youtubeId: string;
  timezone: string;
  operator: string;
  description: string;
  color: string;
}

export const PUBLIC_CAMERAS: PublicCamera[] = [
  // --- Strategic Chokepoints & Maritime Ports ---
  {
    id: "panama-canal",
    name: "Panama Canal (Miraflores Locks)",
    city: "Panama City",
    country: "Panama",
    region: "Americas",
    category: "Strategic Chokepoints",
    lat: 8.9973,
    lng: -79.5932,
    youtubeId: "vG8p_f-3a2U",
    timezone: "America/Panama",
    operator: "Panama Canal Authority / EarthCam",
    description: "Critical maritime chokepoint connecting Pacific and Atlantic oceans. Live vessel lock operations and transit monitoring.",
    color: "#00f3ff"
  },
  {
    id: "bosphorus-strait",
    name: "Bosphorus Strait & Maiden's Tower",
    city: "Istanbul",
    country: "Turkey",
    region: "Europe",
    category: "Strategic Chokepoints",
    lat: 41.0211,
    lng: 29.0041,
    youtubeId: "9g29N2t-9B8",
    timezone: "Europe/Istanbul",
    operator: "Istanbul Metropolitan City Cam",
    description: "Strategic waterway connecting the Black Sea to the Mediterranean. Constant container, tanker, and naval passage tracking.",
    color: "#00f3ff"
  },
  {
    id: "rotterdam-port",
    name: "Port of Rotterdam (Europoort)",
    city: "Rotterdam",
    country: "Netherlands",
    region: "Europe",
    category: "Maritime Ports",
    lat: 51.9547,
    lng: 4.1378,
    youtubeId: "E0e4mN8z-04",
    timezone: "Europe/Amsterdam",
    operator: "Port of Rotterdam Live Cam",
    description: "Largest maritime freight gateway in Europe. Active container terminals, logistics cranes, and vessel berths.",
    color: "#00d2ff"
  },
  {
    id: "venice-grand-canal",
    name: "Venice Grand Canal & Rialto Bridge",
    city: "Venice",
    country: "Italy",
    region: "Europe",
    category: "Maritime Ports",
    lat: 45.4381,
    lng: 12.3359,
    youtubeId: "vFZpQ0PswJc",
    timezone: "Europe/Rome",
    operator: "SkylineWebcams Italy",
    description: "Historic maritime canal transit hub with continuous waterborne vessel traffic and tidal flood-barrier monitoring.",
    color: "#00d2ff"
  },

  // --- Global Metropolises & High-Profile Squares ---
  {
    id: "times-square",
    name: "Times Square Live 4K Street Cam",
    city: "New York",
    country: "United States",
    region: "Americas",
    category: "Metropolises",
    lat: 40.7580,
    lng: -73.9855,
    youtubeId: "1-iS7LArMPA",
    timezone: "America/New_York",
    operator: "EarthCam NYC Array",
    description: "Major global commercial hub and traffic center. High-density pedestrian and vehicle flow monitoring in Midtown Manhattan.",
    color: "#00ff88"
  },
  {
    id: "shibuya-crossing",
    name: "Shibuya Scramble Crossing",
    city: "Tokyo",
    country: "Japan",
    region: "Asia-Pacific",
    category: "Metropolises",
    lat: 35.6595,
    lng: 139.7005,
    youtubeId: "d6q4e4LgU3s",
    timezone: "Asia/Tokyo",
    operator: "Tokyo Live Cam Network",
    description: "The busiest pedestrian intersection on Earth. Strategic urban density sensor hub in central Tokyo.",
    color: "#00ff88"
  },
  {
    id: "copacabana-beach",
    name: "Copacabana Beach & Atlantic Coastline",
    city: "Rio de Janeiro",
    country: "Brazil",
    region: "Americas",
    category: "Metropolises",
    lat: -22.9698,
    lng: -43.1802,
    youtubeId: "jO3m9E7yXoE",
    timezone: "America/Sao_Paulo",
    operator: "Rio Live Cams / Skyline",
    description: "South American Atlantic shoreline surveillance, maritime weather monitoring, and high-density beach corridor.",
    color: "#00ff88"
  },
  {
    id: "london-abbey-road",
    name: "Abbey Road Crossing & West End",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    category: "Metropolises",
    lat: 51.5320,
    lng: -0.1773,
    youtubeId: "91hGZmgMh70",
    timezone: "Europe/London",
    operator: "Abbey Road Studios Live",
    description: "Urban corridor monitoring in North London with continuous vehicle and pedestrian tracking.",
    color: "#00ff88"
  },
  {
    id: "seoul-gangnam",
    name: "Gangnam Station & Han River Skyline",
    city: "Seoul",
    country: "South Korea",
    region: "Asia-Pacific",
    category: "Metropolises",
    lat: 37.4979,
    lng: 127.0276,
    youtubeId: "3m0Vv5XUqN8",
    timezone: "Asia/Seoul",
    operator: "Seoul Metropolitan Traffic CCTV",
    description: "High-tech commercial district and transit intersection in Seoul with live traffic flow analytics.",
    color: "#00ff88"
  },
  {
    id: "st-peters-vatican",
    name: "St. Peter's Square (Vatican City)",
    city: "Vatican City / Rome",
    country: "Italy",
    region: "Europe",
    category: "Metropolises",
    lat: 41.9022,
    lng: 12.4568,
    youtubeId: "K1R4Zg7yY2s",
    timezone: "Europe/Rome",
    operator: "Vatican Media Live",
    description: "International religious and diplomatic sovereign enclave monitoring. High-security plaza surveillance.",
    color: "#00ff88"
  },
  {
    id: "taipei-101",
    name: "Taipei 101 & Xiangshan View",
    city: "Taipei",
    country: "Taiwan",
    region: "Asia-Pacific",
    category: "Metropolises",
    lat: 25.0330,
    lng: 121.5654,
    youtubeId: "z_fY1QDzqbg",
    timezone: "Asia/Taipei",
    operator: "Taipei Travel Live Stream",
    description: "Strategic East Asian economic hub skyline and atmospheric visibility monitoring over the Taipei Basin.",
    color: "#00ff88"
  },
  {
    id: "dubai-marina",
    name: "Dubai Marina & Persian Gulf Skyline",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East & Africa",
    category: "Metropolises",
    lat: 25.0772,
    lng: 55.1333,
    youtubeId: "03q9N1y1s_Q",
    timezone: "Asia/Dubai",
    operator: "Dubai Media Live",
    description: "Persian Gulf trade gateway, luxury port marina, and airspace visibility observation point.",
    color: "#00ff88"
  },
  {
    id: "sydney-harbour",
    name: "Sydney Harbour & Opera House",
    city: "Sydney",
    country: "Australia",
    region: "Asia-Pacific",
    category: "Metropolises",
    lat: -33.8568,
    lng: 151.2153,
    youtubeId: "7OydpB3z9g4",
    timezone: "Australia/Sydney",
    operator: "Webcams Australia",
    description: "Key South Pacific maritime inlet, ferry terminal operations, and landmark surveillance.",
    color: "#00ff88"
  },
  {
    id: "kyiv-maidan",
    name: "Kyiv Independence Square (Maidan)",
    city: "Kyiv",
    country: "Ukraine",
    region: "Europe",
    category: "Metropolises",
    lat: 50.4501,
    lng: 30.5234,
    youtubeId: "tV_8kG_5-G8",
    timezone: "Europe/Kyiv",
    operator: "Kyiv Urban Cam Network",
    description: "Central geopolitical hub and capital city surveillance. Real-time civic atmosphere tracking.",
    color: "#ffff00"
  },

  // --- Volcanoes & Strategic Natural Points ---
  {
    id: "mount-fuji",
    name: "Mount Fuji (Lake Kawaguchi Panoramic)",
    city: "Yamanashi",
    country: "Japan",
    region: "Asia-Pacific",
    category: "Volcanoes & Nature",
    lat: 35.3606,
    lng: 138.7274,
    youtubeId: "1-W6o3xU0V4",
    timezone: "Asia/Tokyo",
    operator: "Fujisan Live Weather Cam",
    description: "Active stratovolcano and meteorological vantage point. Continuous seismic volcanic visual surveillance.",
    color: "#ff8c00"
  },
  {
    id: "mount-etna",
    name: "Mount Etna Active Summit Crater",
    city: "Sicily",
    country: "Italy",
    region: "Europe",
    category: "Volcanoes & Nature",
    lat: 37.7510,
    lng: 14.9934,
    youtubeId: "mX5A4UeX3rE",
    timezone: "Europe/Rome",
    operator: "INGV Volcano Monitoring Center",
    description: "Europe's most active volcano. Thermal plume, ash cloud emissions, and lava fountain surveillance.",
    color: "#ff4500"
  },
  {
    id: "popocatepetl",
    name: "Popocatépetl Volcano Observatory",
    city: "Puebla",
    country: "Mexico",
    region: "Americas",
    category: "Volcanoes & Nature",
    lat: 19.0224,
    lng: -98.6279,
    youtubeId: "C39m7L8x5vY",
    timezone: "America/Mexico_City",
    operator: "CENAPRED National Disaster Center",
    description: "Major active stratovolcano overlooking Mexico City. 24/7 volcanic hazard and pyroclastic alert sensor.",
    color: "#ff4500"
  },
  {
    id: "kilauea-hawaii",
    name: "Kilauea Caldera & Halemaʻumaʻu Crater",
    city: "Hawaii",
    country: "United States",
    region: "Americas",
    category: "Volcanoes & Nature",
    lat: 19.4069,
    lng: -155.2834,
    youtubeId: "U4mG3a2kE8g",
    timezone: "Pacific/Honolulu",
    operator: "USGS Hawaiian Volcano Observatory",
    description: "Continuous volcanic lake tracking, sulfur dioxide vent emissions, and crustal deformation monitoring.",
    color: "#ff4500"
  },

  // --- Space & Orbit ---
  {
    id: "iss-earth-cam",
    name: "International Space Station (ISS) HD Live Earth View",
    city: "Low Earth Orbit (420 km)",
    country: "International Space",
    region: "Global",
    category: "Space & Orbit",
    lat: 0.0,
    lng: 0.0,
    youtubeId: "21X5lGlDOfg",
    timezone: "UTC",
    operator: "NASA / Johnson Space Center",
    description: "Ultra high-definition live video downlink from the exterior cameras of the ISS orbiting Earth at 27,600 km/h.",
    color: "#a855f7"
  }
];
