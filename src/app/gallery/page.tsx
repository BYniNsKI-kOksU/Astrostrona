"use client";

import { useState, useMemo } from "react";
import { mockImages } from "@/data";
import { ImageGrid } from "@/components/gallery";
import { SearchBar } from "@/components/ui";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

const objectFilters = [
  { value: "all", label: "Wszystkie", icon: "🌌" },
  { value: "nebula", label: "Mgławice", icon: "💨" },
  { value: "galaxy", label: "Galaktyki", icon: "🌀" },
  { value: "star_cluster", label: "Gromady", icon: "✨" },
  { value: "planet", label: "Planety", icon: "🪐" },
  { value: "wide_field", label: "Szerokie pole", icon: "🌃" },
];

const sortOptions = [
  { value: "newest", label: "Najnowsze" },
  { value: "popular", label: "Popularne" },
  { value: "views", label: "Wyświetlenia" },
];

// Wyciągnij unikalne wartości sprzętu z danych
function getUniqueEquipment(field: "telescope" | "camera" | "mount") {
  const values = new Set<string>();
  mockImages.forEach((img) => {
    if (img.equipment[field]) values.add(img.equipment[field]);
  });
  return Array.from(values).sort();
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEquipmentFilters, setShowEquipmentFilters] = useState(false);
  const [selectedTelescope, setSelectedTelescope] = useState("all");
  const [selectedCamera, setSelectedCamera] = useState("all");
  const [selectedMount, setSelectedMount] = useState("all");

  const telescopes = useMemo(() => getUniqueEquipment("telescope"), []);
  const cameras = useMemo(() => getUniqueEquipment("camera"), []);
  const mounts = useMemo(() => getUniqueEquipment("mount"), []);

  const hasEquipmentFilter =
    selectedTelescope !== "all" ||
    selectedCamera !== "all" ||
    selectedMount !== "all";

  const filteredImages = useMemo(() => {
    let result = [...mockImages];

    if (activeFilter !== "all") {
      result = result.filter((img) => img.objectType === activeFilter);
    }

    // Filtrowanie po sprzęcie
    if (selectedTelescope !== "all") {
      result = result.filter((img) => img.equipment.telescope === selectedTelescope);
    }
    if (selectedCamera !== "all") {
      result = result.filter((img) => img.equipment.camera === selectedCamera);
    }
    if (selectedMount !== "all") {
      result = result.filter((img) => img.equipment.mount === selectedMount);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(q) ||
          img.objectName.toLowerCase().includes(q) ||
          img.constellation.toLowerCase().includes(q) ||
          img.equipment.telescope.toLowerCase().includes(q) ||
          img.equipment.camera.toLowerCase().includes(q) ||
          img.equipment.mount.toLowerCase().includes(q) ||
          img.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "views":
        result.sort((a, b) => b.views - a.views);
        break;
    }

    return result;
  }, [activeFilter, sortBy, searchQuery, selectedTelescope, selectedCamera, selectedMount]);

  const clearEquipmentFilters = () => {
    setSelectedTelescope("all");
    setSelectedCamera("all");
    setSelectedMount("all");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-night-100">
            Galeria
          </h1>
          <p className="text-night-400 mt-1">
            Zdjęcia astronomiczne z pełnymi danymi technicznymi
          </p>
        </div>
        <button className="btn-primary">Dodaj zdjęcie</button>
      </div>

      {/* Wyszukiwarka + sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar
          placeholder="Szukaj obiektów, konstelacji, sprzętu..."
          wrapperClassName="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtry obiektów */}
      <div className="flex flex-wrap gap-2 mb-4">
        {objectFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              activeFilter === filter.value
                ? "bg-cosmos-500/20 border-cosmos-400 text-white"
                : "border-night-600 text-night-400 hover:text-night-200 hover:border-night-400"
            }`}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>

      {/* Filtrowanie po sprzęcie */}
      <div className="mb-6">
        <button
          onClick={() => setShowEquipmentFilters(!showEquipmentFilters)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors mb-3 ${
            hasEquipmentFilter
              ? "bg-nebula-500/20 border-nebula-400 text-nebula-300"
              : "border-night-600 text-night-400 hover:text-night-200 hover:border-night-400"
          }`}
        >
          🔧 Filtruj po sprzęcie
          {hasEquipmentFilter && (
            <span className="bg-nebula-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              aktywne
            </span>
          )}
          {showEquipmentFilters ? (
            <HiOutlineChevronUp className="h-4 w-4" />
          ) : (
            <HiOutlineChevronDown className="h-4 w-4" />
          )}
        </button>

        {showEquipmentFilters && (
          <div className="glass-card rounded-xl border border-night-700 p-4 space-y-4 animate-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Teleskop */}
              <div>
                <label className="block text-xs font-semibold text-night-400 uppercase tracking-wider mb-1.5">
                  🔭 Teleskop
                </label>
                <select
                  value={selectedTelescope}
                  onChange={(e) => setSelectedTelescope(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="all">Wszystkie teleskopy</option>
                  {telescopes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kamera */}
              <div>
                <label className="block text-xs font-semibold text-night-400 uppercase tracking-wider mb-1.5">
                  📷 Kamera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="all">Wszystkie kamery</option>
                  {cameras.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Montaż */}
              <div>
                <label className="block text-xs font-semibold text-night-400 uppercase tracking-wider mb-1.5">
                  ⚙️ Montaż
                </label>
                <select
                  value={selectedMount}
                  onChange={(e) => setSelectedMount(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="all">Wszystkie montaże</option>
                  {mounts.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasEquipmentFilter && (
              <div className="flex items-center justify-between pt-2 border-t border-night-700">
                <p className="text-xs text-night-500">
                  Aktywne filtry sprzętowe
                </p>
                <button
                  onClick={clearEquipmentFilters}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕ Wyczyść filtry sprzętu
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-night-500 mb-4">
        {filteredImages.length} zdjęć
      </p>

      <ImageGrid images={filteredImages} />
    </div>
  );
}
