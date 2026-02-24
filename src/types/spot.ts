// =============================================
// Typy spotów obserwacyjnych
// =============================================

export interface ObservationSpot {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  bortleScale: number; // 1-9
  addedBy: string;
  addedByAvatar: string;
  addedAt: string;
  likes: number;
  rating: number; // 1-5
  ratingsCount: number;
  tags: string[];
  images: string[]; // URLs
  accessibility: SpotAccessibility;
  features: SpotFeature[];
}

export type SpotAccessibility = "easy" | "moderate" | "hard";

export type SpotFeature =
  | "parking"
  | "flat_terrain"
  | "no_light_pollution"
  | "electricity"
  | "shelter"
  | "water"
  | "camping"
  | "mountain_view"
  | "lake_view";

export const SPOT_FEATURE_LABELS: Record<SpotFeature, { label: string; icon: string }> = {
  parking: { label: "Parking", icon: "🅿️" },
  flat_terrain: { label: "Płaski teren", icon: "🏕️" },
  no_light_pollution: { label: "Brak zanieczyszczenia świetlnego", icon: "🌑" },
  electricity: { label: "Prąd", icon: "⚡" },
  shelter: { label: "Schronienie", icon: "🏠" },
  water: { label: "Woda", icon: "💧" },
  camping: { label: "Pole namiotowe", icon: "⛺" },
  mountain_view: { label: "Widok na góry", icon: "🏔️" },
  lake_view: { label: "Widok na jezioro", icon: "🏞️" },
};

export const ACCESSIBILITY_LABELS: Record<SpotAccessibility, { label: string; color: string }> = {
  easy: { label: "Łatwy dojazd", color: "text-green-400" },
  moderate: { label: "Średni dojazd", color: "text-yellow-400" },
  hard: { label: "Trudny dojazd", color: "text-red-400" },
};

export const BORTLE_COLORS: Record<number, string> = {
  1: "#000000",
  2: "#1a1a2e",
  3: "#16213e",
  4: "#0f3460",
  5: "#533483",
  6: "#e94560",
  7: "#ff6b35",
  8: "#ffa500",
  9: "#ffff00",
};
