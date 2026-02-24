import { GamificationProfile } from "@/types";
import {
  countCompletedAchievements,
  getRarityBreakdown,
  RARITY_LABELS,
  RARITY_COLORS,
} from "@/lib/gamification";
import { ALL_ACHIEVEMENTS } from "@/data/gamification";

interface PointsDisplayProps {
  profile: GamificationProfile;
}

export function PointsDisplay({ profile }: PointsDisplayProps) {
  const completed = countCompletedAchievements(profile);
  const total = ALL_ACHIEVEMENTS.length;
  const breakdown = getRarityBreakdown(profile);

  const rarities = ["common", "uncommon", "rare", "epic", "legendary"] as const;

  return (
    <div className="glass-card rounded-xl p-5 border border-cosmos-600/20">
      {/* Total points */}
      <div className="text-center mb-4">
        <p className="text-4xl font-bold bg-gradient-to-r from-cosmos-300 to-nebula-400 bg-clip-text text-transparent">
          {profile.totalPoints.toLocaleString("pl-PL")}
        </p>
        <p className="text-night-400 text-sm">punktów grywalizacji</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-night-800/50">
          <p className="text-lg font-bold text-white">{completed}</p>
          <p className="text-xs text-night-400">Osiągnięcia</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-night-800/50">
          <p className="text-lg font-bold text-white">
            {completed}/{total}
          </p>
          <p className="text-xs text-night-400">Postęp</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-night-800/50">
          <p className="text-lg font-bold text-white">
            {profile.streakDays} 🔥
          </p>
          <p className="text-xs text-night-400">Seria</p>
        </div>
      </div>

      {/* Rarity breakdown */}
      <div className="space-y-1.5">
        <p className="text-xs text-night-400 font-semibold uppercase tracking-wider mb-2">
          Rzadkość osiągnięć
        </p>
        {rarities.map((r) => (
          <div key={r} className="flex items-center gap-2">
            <span className={`text-xs ${RARITY_COLORS[r]} w-20`}>{RARITY_LABELS[r]}</span>
            <div className="flex-1 h-2 bg-night-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getRarityBarColor(r)}`}
                style={{
                  width: `${total > 0 ? (breakdown[r] / total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-night-400 w-6 text-right">{breakdown[r]}</span>
          </div>
        ))}
      </div>

      {/* Longest streak */}
      <div className="mt-4 pt-3 border-t border-night-700">
        <div className="flex justify-between text-xs text-night-400">
          <span>Najdłuższa seria</span>
          <span className="text-white font-medium">{profile.longestStreak} dni</span>
        </div>
        <div className="flex justify-between text-xs text-night-400 mt-1">
          <span>Członek od</span>
          <span className="text-white font-medium">
            {new Date(profile.joinedAt).toLocaleDateString("pl-PL")}
          </span>
        </div>
      </div>
    </div>
  );
}

function getRarityBarColor(rarity: string): string {
  const map: Record<string, string> = {
    common: "bg-night-400",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-gradient-to-r from-amber-500 to-yellow-300",
  };
  return map[rarity] ?? "bg-night-400";
}
