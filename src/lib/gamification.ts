import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  AstroTitle,
  GamificationProfile,
  UserAchievement,
  RARITY_POINTS,
  RARITY_COLORS,
  RARITY_LABELS,
} from "@/types";
import { ALL_ACHIEVEMENTS, ASTRO_TITLES } from "@/data/gamification";

// --------------------------------------------------
// Punkty
// --------------------------------------------------

/** Oblicz sumę punktów za ukończone osiągnięcia */
export function calculateTotalPoints(achievements: UserAchievement[]): number {
  return achievements
    .filter((ua) => ua.completed)
    .reduce((sum, ua) => {
      const def = getAchievementById(ua.achievementId);
      return sum + (def?.points ?? 0);
    }, 0);
}

// --------------------------------------------------
// Tytuły
// --------------------------------------------------

/** Zwróć aktualny tytuł na podstawie punktów */
export function getTitleForPoints(points: number): AstroTitle {
  const sorted = [...ASTRO_TITLES].sort((a, b) => b.requiredPoints - a.requiredPoints);
  return sorted.find((t) => points >= t.requiredPoints) ?? ASTRO_TITLES[0];
}

/** Zwróć tytuł po id */
export function getTitleById(id: string): AstroTitle | undefined {
  return ASTRO_TITLES.find((t) => t.id === id);
}

/** Zwróć następny tytuł (lub undefined jeśli najwyższy) */
export function getNextTitle(currentTitleId: string): AstroTitle | undefined {
  const idx = ASTRO_TITLES.findIndex((t) => t.id === currentTitleId);
  if (idx === -1 || idx >= ASTRO_TITLES.length - 1) return undefined;
  return ASTRO_TITLES[idx + 1];
}

/** Zwróć procent postępu do następnego tytułu (0-100) */
export function getProgressToNextTitle(points: number, currentTitleId: string): number {
  const current = getTitleById(currentTitleId);
  const next = getNextTitle(currentTitleId);
  if (!current || !next) return 100;
  const range = next.requiredPoints - current.requiredPoints;
  if (range <= 0) return 100;
  const progress = ((points - current.requiredPoints) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

// --------------------------------------------------
// Osiągnięcia
// --------------------------------------------------

/** Zwróć definicję osiągnięcia po id */
export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

/** Zwróć osiągnięcia według kategorii */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}

/** Zwróć osiągnięcia według rzadkości */
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

/** Zwróć pełne informacje o osiągnięciu użytkownika (definicja + postęp) */
export function getUserAchievementDetails(
  userAchievement: UserAchievement
): { achievement: Achievement; userProgress: UserAchievement } | null {
  const achievement = getAchievementById(userAchievement.achievementId);
  if (!achievement) return null;
  return { achievement, userProgress: userAchievement };
}

/** Procent postępu osiągnięcia (0-100) */
export function getAchievementProgress(ua: UserAchievement): number {
  if (ua.completed) return 100;
  const def = getAchievementById(ua.achievementId);
  if (!def?.maxProgress) return ua.progress > 0 ? 50 : 0;
  return Math.min(100, Math.round((ua.progress / def.maxProgress) * 100));
}

// --------------------------------------------------
// Statystyki profilu
// --------------------------------------------------

/** Liczba ukończonych osiągnięć */
export function countCompletedAchievements(profile: GamificationProfile): number {
  return profile.achievements.filter((a) => a.completed).length;
}

/** Podział ukończonych osiągnięć po rzadkości */
export function getRarityBreakdown(
  profile: GamificationProfile
): Record<AchievementRarity, number> {
  const breakdown: Record<AchievementRarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };
  profile.achievements
    .filter((ua) => ua.completed)
    .forEach((ua) => {
      const def = getAchievementById(ua.achievementId);
      if (def) breakdown[def.rarity]++;
    });
  return breakdown;
}

/** Podział ukończonych osiągnięć po kategorii */
export function getCategoryBreakdown(
  profile: GamificationProfile
): Record<AchievementCategory, number> {
  const breakdown: Record<AchievementCategory, number> = {
    posting: 0,
    photography: 0,
    social: 0,
    observation: 0,
    exploration: 0,
    science: 0,
    special: 0,
  };
  profile.achievements
    .filter((ua) => ua.completed)
    .forEach((ua) => {
      const def = getAchievementById(ua.achievementId);
      if (def) breakdown[def.category]++;
    });
  return breakdown;
}

/** Etykiety kategorii po polsku */
export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  posting: "Posty",
  photography: "Fotografia",
  social: "Społeczność",
  observation: "Obserwacje",
  exploration: "Aktywność",
  science: "Nauka",
  special: "Specjalne",
};

/** Ikony kategorii */
export const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  posting: "✍️",
  photography: "📷",
  social: "👥",
  observation: "👁️",
  exploration: "🧭",
  science: "🔬",
  special: "⭐",
};

/** Kolor tła rzadkości (tailwind bg class) */
export function getRarityBgClass(rarity: AchievementRarity): string {
  const map: Record<AchievementRarity, string> = {
    common: "bg-night-700/50",
    uncommon: "bg-green-900/30",
    rare: "bg-blue-900/30",
    epic: "bg-purple-900/30",
    legendary: "bg-amber-900/30",
  };
  return map[rarity];
}

/** Kolor obramowania rzadkości */
export function getRarityBorderClass(rarity: AchievementRarity): string {
  const map: Record<AchievementRarity, string> = {
    common: "border-night-500",
    uncommon: "border-green-500",
    rare: "border-blue-500",
    epic: "border-purple-500",
    legendary: "border-amber-500",
  };
  return map[rarity];
}

export { RARITY_POINTS, RARITY_COLORS, RARITY_LABELS };
