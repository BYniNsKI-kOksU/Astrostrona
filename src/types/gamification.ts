// =============================================
// System grywalizacji — tytuły, osiągnięcia, punkty
// =============================================

/**
 * Rzadkość osiągnięcia (wpływa na punkty)
 */
export type AchievementRarity =
  | "common"      // Pospolite — 10 pkt
  | "uncommon"    // Niepospolite — 25 pkt
  | "rare"        // Rzadkie — 50 pkt
  | "epic"        // Epickie — 100 pkt
  | "legendary";  // Legendarne — 250 pkt

/**
 * Kategoria osiągnięcia
 */
export type AchievementCategory =
  | "posting"       // Związane z postami
  | "photography"   // Astrofotografia
  | "social"        // Interakcje społeczne
  | "observation"   // Obserwacje
  | "exploration"   // Odkrywanie/aktywność
  | "science"       // Wkład naukowy
  | "special";      // Specjalne/eventowe

/**
 * Definicja osiągnięcia
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  points: number;
  requirement: string;           // Opis wymagania tekstowo
  maxProgress?: number;          // Jeśli progresywne — ile potrzeba
  secret?: boolean;              // Ukryte osiągnięcie
}

/**
 * Osiągnięcie zdobyte przez użytkownika
 */
export interface UserAchievement {
  achievementId: string;
  earnedAt: string;
  progress: number;              // Aktualny postęp
  completed: boolean;
}

/**
 * Tytuł użytkownika (od astronomów)
 * Od najniższego do najwyższego stopnia
 */
export interface AstroTitle {
  id: string;
  name: string;                  // Imię astronoma
  subtitle: string;              // Podtytuł / tytuł rangi
  icon: string;
  requiredPoints: number;        // Punkty potrzebne do odblokowania
  tier: number;                  // Poziom 1-12
  color: string;                 // Kolor Tailwind
  description: string;           // Krótki opis astronoma
}

/**
 * Profil grywalizacji użytkownika
 */
export interface GamificationProfile {
  userId: string;
  totalPoints: number;
  currentTitleId: string;
  achievements: UserAchievement[];
  streakDays: number;            // Ile dni z rzędu aktywny
  longestStreak: number;
  joinedAt: string;
}

/**
 * Punktacja za rzadkość
 */
export const RARITY_POINTS: Record<AchievementRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
};

/**
 * Kolory rzadkości
 */
export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: "text-night-300 border-night-500 bg-night-700/50",
  uncommon: "text-green-300 border-green-500/50 bg-green-500/10",
  rare: "text-blue-300 border-blue-500/50 bg-blue-500/10",
  epic: "text-purple-300 border-purple-500/50 bg-purple-500/10",
  legendary: "text-amber-300 border-amber-500/50 bg-amber-500/10",
};

/**
 * Etykiety rzadkości
 */
export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "Pospolite",
  uncommon: "Niepospolite",
  rare: "Rzadkie",
  epic: "Epickie",
  legendary: "Legendarne",
};
