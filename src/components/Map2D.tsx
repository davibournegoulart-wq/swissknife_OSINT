"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js
import L from "leaflet";
L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";

interface Map2DProps {
  points: any[];
  allEvents?: any[];
  theme?: "tactical" | "satellite";
  target?: any;
  onHover: (info: any) => void;
  onSelect?: (info: any) => void;
}

function MapController({ target, theme }: { target?: any; theme?: string }) {
  const map = useMap();

  useEffect(() => {
    if (target && typeof target.lat === "number" && typeof target.lng === "number") {
      map.flyTo([target.lat, target.lng], 5.5, { duration: 1.5 });
    }
  }, [target, map]);

  return null;
}

export default function Map2D({ points, allEvents = [], theme = "tactical", target, onHover, onSelect }: Map2DProps) {
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
    >
      <MapController target={target} theme={theme} />
      
      <TileLayer
        key={theme} // Force re-render when switching between tactical and satellite
        url={tileUrl}
        attribution={attribution}
        maxZoom={18}
      />
      
      {renderData.map((pt, i) => {
        const isSelected = target?.lat === pt.lat && target?.lng === pt.lng;
        const radius = isSelected ? 12 : pt.type === "news" ? Math.min(pt.size * 20, 18) : pt.type === "flight" ? 6 : 8;

        return (
          <CircleMarker
            key={`${pt.type || 'pt'}-${i}-${pt.lat}-${pt.lng}`}
            center={[pt.lat, pt.lng]}
            radius={radius}
            pathOptions={{
              color: isSelected ? "#f59e0b" : pt.color || "#00f3ff",
              fillColor: isSelected ? "#f59e0b" : pt.color || "#00f3ff",
              fillOpacity: isSelected ? 0.9 : pt.type === "news" ? 0.6 : 0.75,
              weight: isSelected ? 3 : 1
            }}
            eventHandlers={{
              mouseover: () => onHover(pt),
              mouseout: () => onHover(null),
              click: () => {
                if (onSelect) onSelect(pt);
                if (pt.url) window.open(pt.url, "_blank");
              }
            }}
          />
        );
      })}
    </MapContainer>
  );
}
