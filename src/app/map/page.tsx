"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { mockSpots } from "@/data";
import {
  ObservationSpot,
  SPOT_FEATURE_LABELS,
  ACCESSIBILITY_LABELS,
  SpotFeature,
  SpotAccessibility,
} from "@/types";
import {
  HiOutlineMapPin,
  HiOutlinePlusCircle,
  HiOutlineXMark,
  HiOutlineFunnel,
  HiOutlineStar,
  HiOutlineHeart,
} from "react-icons/hi2";

// Dynamiczny import mapy (Leaflet nie działa w SSR)
const SpotMap = dynamic(() => import("@/components/map/SpotMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] sm:h-[600px] rounded-xl bg-night-900 border border-night-700 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-3">🌍</div>
        <p className="text-night-400 text-sm">Ładowanie mapy...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [spots, setSpots] = useState<ObservationSpot[]>(mockSpots);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterBortle, setFilterBortle] = useState(0); // 0 = all
  const [filterAccess, setFilterAccess] = useState<SpotAccessibility | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "likes" | "bortle">("rating");

  // Formularz nowego spota
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBortle, setNewBortle] = useState(4);
  const [newAccess, setNewAccess] = useState<SpotAccessibility>("easy");
  const [newFeatures, setNewFeatures] = useState<SpotFeature[]>([]);

  const filteredSpots = useMemo(() => {
    let result = [...spots];

    if (filterBortle > 0) {
      result = result.filter((s) => s.bortleScale <= filterBortle);
    }

    if (filterAccess !== "all") {
      result = result.filter((s) => s.accessibility === filterAccess);
    }

    return result;
  }, [spots, filterBortle, filterAccess]);

  const sortedSpotsList = useMemo(() => {
    const sorted = [...filteredSpots];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "likes":
        sorted.sort((a, b) => b.likes - a.likes);
        break;
      case "bortle":
        sorted.sort((a, b) => a.bortleScale - b.bortleScale);
        break;
    }
    return sorted;
  }, [filteredSpots, sortBy]);

  const handleAddSpot = (lat: number, lng: number) => {
    setNewSpotCoords({ lat, lng });
    setShowAddForm(true);
  };

  const toggleFeature = (f: SpotFeature) => {
    setNewFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const submitNewSpot = () => {
    if (!newName.trim() || !newSpotCoords) return;

    const newSpot: ObservationSpot = {
      id: `spot_${Date.now()}`,
      name: newName,
      description: newDescription,
      lat: newSpotCoords.lat,
      lng: newSpotCoords.lng,
      bortleScale: newBortle,
      addedBy: "Ty",
      addedByAvatar: "/avatars/default.png",
      addedAt: new Date().toISOString(),
      likes: 0,
      rating: 0,
      ratingsCount: 0,
      tags: [],
      images: [],
      accessibility: newAccess,
      features: newFeatures,
    };

    setSpots((prev) => [newSpot, ...prev]);
    resetAddForm();
  };

  const resetAddForm = () => {
    setIsAddingMode(false);
    setShowAddForm(false);
    setNewSpotCoords(null);
    setNewName("");
    setNewDescription("");
    setNewBortle(4);
    setNewAccess("easy");
    setNewFeatures([]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-night-100 flex items-center gap-3">
            <HiOutlineMapPin className="h-8 w-8 text-cosmos-400" />
            Mapa Spotów Obserwacyjnych
          </h1>
          <p className="text-night-400 mt-1">
            Odkrywaj i dziel się najlepszymi miejscami do obserwacji nieba w
            Polsce
          </p>
        </div>

        <button
          onClick={() => {
            if (isAddingMode) {
              resetAddForm();
            } else {
              setIsAddingMode(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isAddingMode
              ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
              : "btn-primary"
          }`}
        >
          {isAddingMode ? (
            <>
              <HiOutlineXMark className="h-5 w-5" />
              Anuluj dodawanie
            </>
          ) : (
            <>
              <HiOutlinePlusCircle className="h-5 w-5" />
              Dodaj nowy spot
            </>
          )}
        </button>
      </div>

      {/* Info o trybie dodawania */}
      {isAddingMode && !showAddForm && (
        <div className="glass-card rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 mb-6 animate-pulse">
          <p className="text-cyan-300 text-sm font-medium flex items-center gap-2">
            <HiOutlineMapPin className="h-5 w-5" />
            Kliknij na mapę, aby wybrać lokalizację nowego spota
          </p>
        </div>
      )}

      {/* Filtry */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            filterBortle > 0 || filterAccess !== "all"
              ? "bg-cosmos-500/20 border-cosmos-400 text-cosmos-300"
              : "border-night-600 text-night-400 hover:text-night-200 hover:border-night-400"
          }`}
        >
          <HiOutlineFunnel className="h-4 w-4" />
          Filtry
          {(filterBortle > 0 || filterAccess !== "all") && (
            <span className="bg-cosmos-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              aktywne
            </span>
          )}
        </button>

        <div className="flex gap-1 text-xs">
          {(["rating", "likes", "bortle"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-full border transition-colors ${
                sortBy === s
                  ? "bg-cosmos-500/20 border-cosmos-400 text-white"
                  : "border-night-600 text-night-400 hover:text-night-200"
              }`}
            >
              {s === "rating" && "⭐ Ocena"}
              {s === "likes" && "❤️ Polubienia"}
              {s === "bortle" && "🌑 Bortle"}
            </button>
          ))}
        </div>

        <span className="text-xs text-night-500 ml-auto">
          {filteredSpots.length} spotów
        </span>
      </div>

      {showFilters && (
        <div className="glass-card rounded-xl border border-night-700 p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-night-400 uppercase tracking-wider mb-1.5">
                🌑 Maksymalna skala Bortle
              </label>
              <select
                value={filterBortle}
                onChange={(e) => setFilterBortle(Number(e.target.value))}
                className="input-field w-full text-sm"
              >
                <option value={0}>Wszystkie</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
                  <option key={b} value={b}>
                    Bortle ≤ {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-night-400 uppercase tracking-wider mb-1.5">
                🚗 Dostępność
              </label>
              <select
                value={filterAccess}
                onChange={(e) =>
                  setFilterAccess(e.target.value as SpotAccessibility | "all")
                }
                className="input-field w-full text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="easy">Łatwy dojazd</option>
                <option value="moderate">Średni dojazd</option>
                <option value="hard">Trudny dojazd</option>
              </select>
            </div>
          </div>
          {(filterBortle > 0 || filterAccess !== "all") && (
            <button
              onClick={() => {
                setFilterBortle(0);
                setFilterAccess("all");
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              ✕ Wyczyść filtry
            </button>
          )}
        </div>
      )}

      {/* Mapa */}
      <div className="mb-8">
        <SpotMap
          spots={filteredSpots}
          onAddSpot={handleAddSpot}
          isAddingMode={isAddingMode}
        />

        {/* Legenda Bortle */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-night-500 font-semibold">Skala Bortle:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
            <div
              key={b}
              className="flex items-center gap-1"
              title={`Bortle ${b}`}
            >
              <div
                className="w-4 h-4 rounded-full border border-white/30"
                style={{
                  backgroundColor:
                    b === 1
                      ? "#000000"
                      : b === 2
                      ? "#1a1a2e"
                      : b === 3
                      ? "#16213e"
                      : b === 4
                      ? "#0f3460"
                      : b === 5
                      ? "#533483"
                      : b === 6
                      ? "#e94560"
                      : b === 7
                      ? "#ff6b35"
                      : b === 8
                      ? "#ffa500"
                      : "#ffff00",
                }}
              />
              <span className="text-[10px] text-night-500">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formularz dodawania */}
      {showAddForm && newSpotCoords && (
        <div className="glass-card rounded-xl border border-cyan-500/30 p-6 mb-8 animate-in">
          <h2 className="text-lg font-bold text-night-100 mb-4 flex items-center gap-2">
            <HiOutlinePlusCircle className="h-5 w-5 text-cyan-400" />
            Dodaj nowy spot obserwacyjny
          </h2>
          <p className="text-xs text-night-500 mb-4">
            Współrzędne: {newSpotCoords.lat.toFixed(4)},{" "}
            {newSpotCoords.lng.toFixed(4)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1">
                Nazwa spota *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="np. Polana pod Turbaczem"
                className="input-field w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1">
                  Skala Bortle
                </label>
                <select
                  value={newBortle}
                  onChange={(e) => setNewBortle(Number(e.target.value))}
                  className="input-field w-full"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1">
                  Dostępność
                </label>
                <select
                  value={newAccess}
                  onChange={(e) =>
                    setNewAccess(e.target.value as SpotAccessibility)
                  }
                  className="input-field w-full"
                >
                  <option value="easy">Łatwy</option>
                  <option value="moderate">Średni</option>
                  <option value="hard">Trudny</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-night-300 mb-1">
              Opis
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Opisz warunki obserwacyjne, dojazd, otoczenie..."
              rows={3}
              className="input-field w-full resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-night-300 mb-2">
              Udogodnienia
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(SPOT_FEATURE_LABELS) as [SpotFeature, { label: string; icon: string }][]).map(
                ([key, { label, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFeature(key)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                      newFeatures.includes(key)
                        ? "bg-cosmos-500/20 border-cosmos-400 text-white"
                        : "border-night-600 text-night-400 hover:text-night-200"
                    }`}
                  >
                    {icon} {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={submitNewSpot}
              disabled={!newName.trim()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Dodaj spot
            </button>
            <button onClick={resetAddForm} className="btn-ghost px-4 py-2">
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Lista spotów */}
      <div>
        <h2 className="font-display text-xl font-bold text-night-100 mb-4">
          Popularne spoty ({sortedSpotsList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSpotsList.map((spot) => (
            <div
              key={spot.id}
              className="glass-card rounded-xl border border-night-700 p-4 hover:border-night-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-night-100">{spot.name}</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2"
                  style={{
                    backgroundColor:
                      spot.bortleScale <= 3
                        ? "rgba(96,165,250,0.2)"
                        : spot.bortleScale <= 5
                        ? "rgba(168,85,247,0.2)"
                        : "rgba(251,191,36,0.2)",
                    color:
                      spot.bortleScale <= 3
                        ? "#60a5fa"
                        : spot.bortleScale <= 5
                        ? "#a855f7"
                        : "#fbbf24",
                  }}
                >
                  Bortle {spot.bortleScale}
                </span>
              </div>

              <p className="text-sm text-night-400 mb-3 line-clamp-2">
                {spot.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {spot.features.slice(0, 4).map((f) => (
                  <span
                    key={f}
                    className="text-[11px] bg-night-800 text-night-400 px-2 py-0.5 rounded"
                  >
                    {SPOT_FEATURE_LABELS[f].icon} {SPOT_FEATURE_LABELS[f].label}
                  </span>
                ))}
                {spot.features.length > 4 && (
                  <span className="text-[11px] text-night-500">
                    +{spot.features.length - 4}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-night-500 pt-2 border-t border-night-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <HiOutlineStar className="h-3.5 w-3.5 text-yellow-400" />
                    {spot.rating} ({spot.ratingsCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineHeart className="h-3.5 w-3.5 text-red-400" />
                    {spot.likes}
                  </span>
                </div>
                <span
                  className={ACCESSIBILITY_LABELS[spot.accessibility].color}
                >
                  {ACCESSIBILITY_LABELS[spot.accessibility].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
