"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ObservationSpot,
  SPOT_FEATURE_LABELS,
  ACCESSIBILITY_LABELS,
  BORTLE_COLORS,
} from "@/types";

interface SpotMapProps {
  spots: ObservationSpot[];
  onAddSpot?: (lat: number, lng: number) => void;
  isAddingMode?: boolean;
}

function getBortleColor(bortle: number): string {
  return BORTLE_COLORS[bortle] || "#888888";
}

function createSpotIcon(bortle: number): L.DivIcon {
  const color = getBortleColor(bortle);
  return L.divIcon({
    className: "custom-spot-marker",
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid rgba(255,255,255,0.8);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        cursor: pointer;
      ">
        <span style="color: ${bortle <= 4 ? '#fff' : '#000'}; font-weight: bold; font-size: 11px;">${bortle}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

function createNewSpotIcon(): L.DivIcon {
  return L.divIcon({
    className: "new-spot-marker",
    html: `
      <div style="
        width: 36px; height: 36px;
        background: #22d3ee;
        border: 3px solid #fff;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 15px rgba(34,211,238,0.6);
        cursor: pointer;
      ">
        <span style="color: #000; font-size: 18px; font-weight: bold;">+</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

export default function SpotMap({ spots, onAddSpot, isAddingMode }: SpotMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const newMarkerRef = useRef<L.Marker | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<ObservationSpot | null>(null);

  // Inicjalizacja mapy
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [51.9194, 19.1451], // Centrum Polski
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    // Ciemny styl mapy (pasuje do kosmicznego tematu)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Obsługa dodawania nowego spota
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!isAddingMode) return;

      // Usuń poprzedni marker nowego spota
      if (newMarkerRef.current) {
        newMarkerRef.current.remove();
      }

      const marker = L.marker(e.latlng, { icon: createNewSpotIcon() })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center; color:#111; font-size:13px;">
            <strong>Nowy spot</strong><br/>
            ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}<br/>
            <em style="color:#666;">Kliknij "Dodaj spot" aby zapisać</em>
          </div>`
        )
        .openPopup();

      newMarkerRef.current = marker;
      onAddSpot?.(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);

    // Zmień kursor
    if (isAddingMode) {
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.getContainer().style.cursor = "";
      if (newMarkerRef.current) {
        newMarkerRef.current.remove();
        newMarkerRef.current = null;
      }
    }

    return () => {
      map.off("click", handleClick);
    };
  }, [isAddingMode, onAddSpot]);

  // Aktualizacja markerów
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createSpotIcon(spot.bortleScale),
      });

      marker.on("click", () => {
        setSelectedSpot(spot);
      });

      const featuresHtml = spot.features
        .slice(0, 3)
        .map((f) => {
          const feat = SPOT_FEATURE_LABELS[f];
          return `<span style="font-size:11px;">${feat.icon} ${feat.label}</span>`;
        })
        .join(" · ");

      const access = ACCESSIBILITY_LABELS[spot.accessibility];

      marker.bindPopup(
        `<div style="min-width:200px; color:#111;">
          <strong style="font-size:14px;">${spot.name}</strong><br/>
          <span style="font-size:12px; color:#666;">Bortle: ${spot.bortleScale} · ⭐ ${spot.rating} (${spot.ratingsCount})</span><br/>
          <span style="font-size:11px;">${access.label}</span><br/>
          <div style="margin-top:4px;">${featuresHtml}</div>
          <div style="margin-top:4px; font-size:11px; color:#888;">❤️ ${spot.likes} polubień</div>
        </div>`,
        { maxWidth: 280 }
      );

      markersRef.current!.addLayer(marker);
    });
  }, [spots]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="w-full h-[500px] sm:h-[600px] rounded-xl overflow-hidden border border-night-700"
        style={{ zIndex: 1 }}
      />

      {/* Panel szczegółów spota */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-night-950/95 backdrop-blur-xl rounded-xl border border-night-700 p-4 shadow-2xl z-[1000]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-night-100 text-lg leading-tight pr-2">
              {selectedSpot.name}
            </h3>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-night-500 hover:text-night-300 text-lg shrink-0"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-night-400 mb-3 leading-relaxed">
            {selectedSpot.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                backgroundColor: getBortleColor(selectedSpot.bortleScale) + "33",
                color: selectedSpot.bortleScale <= 4 ? "#60a5fa" : "#fbbf24",
                border: `1px solid ${getBortleColor(selectedSpot.bortleScale)}66`,
              }}
            >
              Bortle {selectedSpot.bortleScale}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-night-800 text-night-300">
              ⭐ {selectedSpot.rating} ({selectedSpot.ratingsCount})
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full bg-night-800 ${
                ACCESSIBILITY_LABELS[selectedSpot.accessibility].color
              }`}
            >
              {ACCESSIBILITY_LABELS[selectedSpot.accessibility].label}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedSpot.features.map((f) => (
              <span
                key={f}
                className="text-xs bg-night-800 text-night-300 px-2 py-0.5 rounded"
              >
                {SPOT_FEATURE_LABELS[f].icon} {SPOT_FEATURE_LABELS[f].label}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-night-500 pt-2 border-t border-night-700">
            <span>Dodano przez {selectedSpot.addedBy}</span>
            <span>❤️ {selectedSpot.likes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
