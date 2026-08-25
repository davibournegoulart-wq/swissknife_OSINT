"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js
import L from "leaflet";
L.Icon.Default.imagePath = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/";

interface Map2DProps {
  points: any[];
  onHover: (info: any) => void;
}

export default function Map2D({ points, onHover }: Map2DProps) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2.5} 
      style={{ height: "100%", width: "100%", background: "#050505" }}
      zoomControl={false}
      minZoom={2}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      
      {points.map((pt, i) => (
        <CircleMarker
          key={i}
          center={[pt.lat, pt.lng]}
          radius={pt.type === 'news' ? pt.size * 25 : pt.size * 15}
          pathOptions={{
            color: pt.color,
            fillColor: pt.color,
            fillOpacity: pt.type === 'news' ? 0.6 : 0.4,
            weight: 1
          }}
          eventHandlers={{
            mouseover: () => onHover(pt),
            mouseout: () => onHover(null),
            click: () => {
              if (pt.url) window.open(pt.url, "_blank");
            }
          }}
        />
      ))}
    </MapContainer>
  );
}
