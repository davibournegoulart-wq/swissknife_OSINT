import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeodesicMeasurement, ThreatZone } from "@/utils/geoCalc";
import { STRATEGIC_FIR_SECTORS } from "@/data/firSectors";

interface Map2DProps {
  points: any[];
  allEvents?: any[];
  theme?: "tactical" | "satellite";
  target?: any;
  onHover: (info: any) => void;
  onSelect?: (info: any) => void;
  measurement?: GeodesicMeasurement | null;
  threatHubs?: ThreatZone[];
  threatRingsEnabled?: boolean;
  firSectorsEnabled?: boolean;
}

function MapController({ target, theme }: { target?: any; theme?: string }) {
  const map = useMap();

  useEffect(() => {
    if (target && typeof target.lat === "number" && typeof target.lng === "number") {
      map.flyTo([target.lat, target.lng], 6, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [target?.lat, target?.lng, target?.label, map]);

  return null;
}

// Generate high-tech custom SVG DivIcon for every category
function createTacticalIcon(pt: any, isSelected: boolean) {
  let html = "";
  const cat = pt.catId;
  const type = pt.type;

  if (type === "conflict") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-10 h-10 border border-[#ffff00] rounded-full opacity-30 animate-ping"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="drop-shadow-[0_0_10px_rgba(255,255,0,1)]">
          <polygon points="12 2 20 6 20 18 12 22 4 18 4 6" fill="rgba(255,255,0,0.15)" stroke="#ffff00" stroke-width="1.6" stroke-dasharray="2 4"/>
          <circle cx="12" cy="12" r="3" fill="#ffff00"/>
          <path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#ffff00" stroke-width="1.6"/>
        </svg>
      </div>
    `;
  } else if (type === "maritime") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-10 h-10 border border-dashed border-[#00f0ff]/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 32 32" class="drop-shadow-[0_0_10px_rgba(0,240,255,0.95)]">
          <circle cx="16" cy="6.5" r="3.2" fill="none" stroke="#00f0ff" stroke-width="1.8"/>
          <circle cx="16" cy="6.5" r="1.2" fill="#020817"/>
          <line x1="16" y1="9.7" x2="16" y2="12" stroke="#00f0ff" stroke-width="2"/>
          <path d="M8 12.5H24" stroke="#00f0ff" stroke-width="2" stroke-linecap="round"/>
          <circle cx="8" cy="12.5" r="1.5" fill="#00f0ff"/>
          <circle cx="24" cy="12.5" r="1.5" fill="#00f0ff"/>
          <line x1="16" y1="12" x2="16" y2="26" stroke="#00f0ff" stroke-width="2.2"/>
          <circle cx="16" cy="19" r="1" fill="#ffffff"/>
          <path d="M5.5 20C6.5 26.5 11 28.5 16 28.5C21 28.5 25.5 26.5 26.5 20" fill="none" stroke="#00f0ff" stroke-width="2.2" stroke-linecap="round"/>
          <polygon points="5.5,17 3,21.5 8,20.5" fill="#00f0ff" stroke="#00f0ff" stroke-width="0.8"/>
          <polygon points="26.5,17 29,21.5 24,20.5" fill="#00f0ff" stroke="#00f0ff" stroke-width="0.8"/>
          <polygon points="16,26.5 18,29 16,30.5 14,29" fill="#00f0ff"/>
        </svg>
      </div>
    `;
  } else if (type === "cyber") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-8 h-8 border border-[#a855f7] rounded-full opacity-40 animate-ping"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="drop-shadow-[0_0_12px_rgba(168,85,247,0.95)]">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(168,85,247,0.3)" stroke="#a855f7" stroke-width="1.8"/>
        </svg>
      </div>
    `;
  } else if (type === "flight") {
    const isMil = pt.flightType === "military";
    const isVip = pt.flightType === "vip";
    const track = pt.track || 45;

    if (isMil) {
      html = `
        <div class="relative flex items-center justify-center" style="transform: rotate(${track}deg);">
          <div class="absolute w-8 h-8 border border-dashed border-[#ff003c]/60 rounded-full animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="drop-shadow-[0_0_12px_rgba(255,0,60,1)]">
            <path d="M12 2L2 20L12 16L22 20L12 2Z" fill="rgba(255,0,60,0.35)" stroke="#ff003c" stroke-width="1.8" stroke-linejoin="round"/>
            <circle cx="12" cy="11" r="1.5" fill="#ffffff"/>
          </svg>
        </div>
      `;
    } else if (isVip) {
      html = `
        <div class="relative flex items-center justify-center" style="transform: rotate(${track}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class="drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]">
            <path d="M12 2L15 8L22 13L15 14L14 22L12 18L10 22L9 14L2 13L9 8L12 2Z" fill="rgba(255,215,0,0.25)" stroke="#ffd700" stroke-width="1.6"/>
          </svg>
        </div>
      `;
    } else {
      html = `
        <div class="relative flex items-center justify-center" style="transform: rotate(${track}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-1 1 2.5 4.5L13 22l1-1-1-3 3-3 5 6l1.2-.7c.4-.2.7-.6.6-1.1z" fill="rgba(0,255,136,0.2)" stroke="#00ff88" stroke-width="1.8"/>
          </svg>
        </div>
      `;
    }
  } else if (cat === "severeStorms") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-10 h-10 border border-dashed border-sky-300/40 rounded-full animate-[spin_8s_linear_infinite]"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" class="animate-[spin_4s_linear_infinite] drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]">
          <path d="M12 2C8.5 2 4.5 5 4.5 9.5c0 3.2 2.5 5.8 5.5 6.5-1.8-1-2.5-2.8-2.5-4.5 0-3 2.5-5.5 5.5-5.5 2 0 3.8 1 4.8 2.5.5-3.5-2.3-6.5-5.8-6.5z" fill="#38bdf8" fill-opacity="0.85" stroke="#ffffff" stroke-width="0.8"/>
          <path d="M12 22c3.5 0 7.5-3 7.5-7.5 0-3.2-2.5-5.8-5.5-6.5 1.8 1 2.5 2.8 2.5 4.5 0 3-2.5 5.5-5.5 5.5-2 0-3.8-1-4.8-2.5-.5 3.5 2.3 6.5 5.8 6.5z" fill="#e0f2fe" fill-opacity="0.95" stroke="#38bdf8" stroke-width="0.8"/>
          <circle cx="12" cy="12" r="2" fill="#030712" stroke="#ffffff" stroke-width="1"/>
        </svg>
      </div>
    `;
  } else if (cat === "wildfires") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" class="drop-shadow-[0_0_12px_rgba(255,69,0,1)]">
          <polygon points="12 1 22 21 2 21" stroke="#ff4500" stroke-width="1.5" fill="rgba(255,69,0,0.15)"/>
          <path d="M12 18c-2 0-3-1.5-3-3 0-2 2-3 3-6 1 3 3 4 3 6 0 1.5-1 3-3 3z" fill="#ff4500"/>
        </svg>
      </div>
    `;
  } else if (type === "satellite") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-10 h-10 border border-dashed border-cyan-400/60 rounded-full animate-ping"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" class="drop-shadow-[0_0_15px_rgba(0,243,255,1)]">
          <rect x="12" y="12" width="8" height="8" fill="#020817" stroke="${pt.color || '#00f3ff'}" stroke-width="1.8" rx="1.5"/>
          <circle cx="16" cy="16" r="2" fill="${pt.color || '#00f3ff'}"/>
          <rect x="2" y="13" width="8" height="6" fill="rgba(0,243,255,0.25)" stroke="${pt.color || '#00f3ff'}" stroke-width="1.2"/>
          <rect x="22" y="13" width="8" height="6" fill="rgba(0,243,255,0.25)" stroke="${pt.color || '#00f3ff'}" stroke-width="1.2"/>
          <line x1="16" y1="12" x2="16" y2="7" stroke="${pt.color || '#00f3ff'}" stroke-width="1.5"/>
          <path d="M12 7 Q16 4 20 7" fill="none" stroke="${pt.color || '#00f3ff'}" stroke-width="1.5"/>
          <circle cx="16" cy="5.5" r="1.2" fill="#ffffff"/>
        </svg>
      </div>
    `;
  } else if (cat === "volcanoes") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="drop-shadow-[0_0_10px_rgba(255,140,0,1)]">
          <polygon points="3 20 10 9 14 9 21 20" stroke="#ff8c00" stroke-width="1.5" fill="rgba(255,140,0,0.2)"/>
          <line x1="12" y1="9" x2="12" y2="20" stroke="#ff8c00" stroke-width="1.5" stroke-dasharray="2 2"/>
          <circle cx="12" cy="5" r="1.5" fill="#ff8c00"/>
          <circle cx="15" cy="3" r="1" fill="#ff8c00"/>
          <circle cx="9" cy="2" r="1" fill="#ff8c00"/>
        </svg>
      </div>
    `;
  } else if (type === "quake") {
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="absolute w-8 h-8 rounded-full border border-[#ff003c]/40 animate-ping"></div>
        <div class="w-3.5 h-3.5 bg-[#ff003c] rounded-full border border-white shadow-[0_0_10px_#ff003c]"></div>
      </div>
    `;
  } else {
    // News / Intel hubs
    html = `
      <div class="relative flex items-center justify-center ${isSelected ? 'scale-125' : ''}">
        <div class="w-3 h-3 bg-[#00f3ff] rounded-full border border-white/80 shadow-[0_0_8px_#00f3ff]"></div>
      </div>
    `;
  }

  // If selected, add an outer amber lock reticle
  if (isSelected) {
    html = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 border-2 border-amber-500 rounded-full animate-ping pointer-events-none"></div>
        <div class="absolute w-10 h-10 border border-amber-400/80 rounded-full pointer-events-none"></div>
        ${html}
      </div>
    `;
  }

  return L.divIcon({
    html: html,
    className: "tactical-map-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

export default function Map2D({ 
  points, 
  allEvents = [], 
  theme = "tactical", 
  target, 
  onHover, 
  onSelect,
  measurement,
  threatHubs = [],
  threatRingsEnabled = false
}: Map2DProps) {
  const tileUrl = theme === "satellite" 
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const attribution = theme === "satellite"
    ? "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    : "&copy; <a href=\"https://carto.com/\">CARTO</a>";

  const renderData = allEvents && allEvents.length > 0 ? allEvents : points;

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2.5} 
      style={{ height: "100%", width: "100%", background: "#020205" }}
      zoomControl={false}
      minZoom={2}
      wheelPxPerZoomLevel={60}
      zoomSnap={0.25}
      zoomDelta={0.5}
      wheelDebounceTime={30}
    >
      <MapController target={target} theme={theme} />
      
      <TileLayer
        key={theme} // Force re-render when switching between tactical and satellite
        url={tileUrl}
        attribution={attribution}
        maxZoom={18}
      />

      {/* Strategic NATO / ICAO FIR & ADIZ Sectors */}
      {firSectorsEnabled && STRATEGIC_FIR_SECTORS.map((sector) => (
        <Polygon
          key={sector.id}
          positions={sector.boundaries}
          pathOptions={{
            color: sector.color,
            fillColor: sector.color,
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: "5, 5"
          }}
        />
      ))}

      {/* Geodesic Range Measurement Line */}
      {measurement && (
        <Polyline 
          positions={[
            [measurement.pointA.lat, measurement.pointA.lng],
            [measurement.pointB.lat, measurement.pointB.lng]
          ]}
          pathOptions={{
            color: "#f59e0b",
            weight: 2.5,
            dashArray: "6, 6",
            opacity: 0.9
          }}
        />
      )}

      {/* Threat Radius Circles on 2D Map */}
      {threatRingsEnabled && threatHubs.map((hub) => (
        hub.ranges.map((range, rIdx) => (
          <Circle 
            key={`${hub.id}-${rIdx}`}
            center={[hub.lat, hub.lng]}
            radius={range.radiusKm * 1000}
            pathOptions={{
              color: range.color,
              fillColor: range.color,
              fillOpacity: 0.04,
              weight: 1.2,
              dashArray: "4, 6"
            }}
          />
        ))
      ))}
      
      {renderData.map((pt, i) => {
        const isSelected = target?.lat === pt.lat && target?.lng === pt.lng;
        const icon = createTacticalIcon(pt, isSelected);

        return (
          <Marker
            key={`${pt.type || 'pt'}-${i}-${pt.lat}-${pt.lng}-${isSelected}`}
            position={[pt.lat, pt.lng]}
            icon={icon}
            eventHandlers={{
              mouseover: () => onHover(pt),
              mouseout: () => onHover(null),
              click: () => {
                if (onSelect) onSelect(pt);
              }
            }}
          />
        );
      })}
    </MapContainer>
  );
}
