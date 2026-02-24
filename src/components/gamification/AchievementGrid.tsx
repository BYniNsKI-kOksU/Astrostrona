"use client";

import { useState } from "react";
import { Achievement, AchievementCategory, AchievementRarity, UserAchievement } from "@/types";
import { AchievementCard } from "./AchievementCard";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  RARITY_LABELS,
  RARITY_COLORS,
} from "@/lib/gamification";

interface AchievementGridProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  showFilters?: boolean;
}

type FilterTab = "all" | AchievementCategory;
type RarityFilter = "all" | AchievementRarity;

export function AchievementGrid({
  achievements,
  userAchievements,
  showFilters = true,
}: AchievementGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
  const [showCompleted, setShowCompleted] = useState<"all" | "completed" | "inprogress">("all");

  const userMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

  const filtered = achievements.filter((a) => {
    if (activeTab !== "all" && a.category !== activeTab) return false;
    if (rarityFilter !== "all" && a.rarity !== rarityFilter) return false;
    if (showCompleted === "completed" && !userMap.get(a.id)?.completed) return false;
    if (showCompleted === "inprogress") {
      const ua = userMap.get(a.id);
      if (!ua || ua.completed) return false;
    }
    return true;
  });

  const categories: FilterTab[] = [
    "all",
    "posting",
    "photography",
    "social",
    "observation",
    "exploration",
    "science",
    "special",
  ];

  const rarities: RarityFilter[] = ["all", "common", "uncommon", "rare", "epic", "legendary"];

  return (
    <div>
      {showFilters && (
        <div className="space-y-3 mb-6">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeTab === cat
                    ? "bg-cosmos-500/30 border-cosmos-400 text-white"
                    : "border-night-600 text-night-400 hover:border-night-400 hover:text-night-300"
                }`}
              >
                {cat === "all"
                  ? "🌌 Wszystkie"
                  : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
              </button>
            ))}
          </div>

          {/* Rarity + status filters */}
          <div className="flex flex-wrap items-center gap-2">
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  rarityFilter === r
                    ? "bg-cosmos-500/20 border-cosmos-400 text-white"
                    : "border-night-600 text-night-400 hover:text-night-300"
                }`}
              >
                {r === "all" ? "Każda" : RARITY_LABELS[r]}
              </button>
            ))}

            <span className="text-night-600 mx-1">|</span>

            {(["all", "completed", "inprogress"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setShowCompleted(status)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  showCompleted === status
                    ? "bg-cosmos-500/20 border-cosmos-400 text-white"
                    : "border-night-600 text-night-400 hover:text-night-300"
                }`}
              >
                {status === "all" ? "Wszystkie" : status === "completed" ? "✓ Zdobyte" : "⏳ W trakcie"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <p className="text-xs text-night-400 mb-4">
        Wyświetlono {filtered.length} z {achievements.length} osiągnięć
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <AchievementCard
            key={a.id}
            achievement={a}
            userProgress={userMap.get(a.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-night-400">
          <p className="text-3xl mb-2">🔭</p>
          <p>Nie znaleziono osiągnięć dla wybranych filtrów.</p>
        </div>
      )}
    </div>
  );
}
