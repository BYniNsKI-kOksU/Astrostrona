import { Achievement, UserAchievement, AchievementRarity } from "@/types";
import {
  getAchievementProgress,
  getRarityBgClass,
  getRarityBorderClass,
  RARITY_COLORS,
  RARITY_LABELS,
} from "@/lib/gamification";

interface AchievementCardProps {
  achievement: Achievement;
  userProgress?: UserAchievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, userProgress, compact = false }: AchievementCardProps) {
  const isCompleted = userProgress?.completed ?? false;
  const progress = userProgress ? getAchievementProgress(userProgress) : 0;
  const isLocked = !userProgress;
  const isSecret = achievement.secret && isLocked;

  const rarityColor = RARITY_COLORS[achievement.rarity];
  const rarityLabel = RARITY_LABELS[achievement.rarity];
  const bgClass = getRarityBgClass(achievement.rarity);
  const borderClass = getRarityBorderClass(achievement.rarity);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-lg border ${bgClass} ${borderClass}/30 ${
          isLocked ? "opacity-40 grayscale" : ""
        }`}
        title={isSecret ? "Tajne osiągnięcie" : achievement.description}
      >
        <span className="text-xl">{isSecret ? "❓" : achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {isSecret ? "???" : achievement.name}
          </p>
          <p className={`text-xs ${rarityColor}`}>{rarityLabel}</p>
        </div>
        {isCompleted && <span className="text-green-400 text-sm">✓</span>}
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl border ${bgClass} ${borderClass}/30 transition-all duration-200 hover:scale-[1.02] ${
        isLocked ? "opacity-50 grayscale" : ""
      }`}
    >
      {/* Rarity glow */}
      {isCompleted && (
        <div className={`absolute inset-0 rounded-xl ${bgClass} blur-sm -z-10`} />
      )}

      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">
          {isSecret ? "❓" : achievement.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-sm">
              {isSecret ? "Tajne osiągnięcie" : achievement.name}
            </h3>
            {isCompleted && (
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                ✓ Zdobyte
              </span>
            )}
          </div>

          <p className="text-night-400 text-xs mb-2">
            {isSecret ? "Odkryj, co się tutaj kryje..." : achievement.description}
          </p>

          <div className="flex items-center gap-2 text-xs">
            <span className={`${rarityColor} font-medium`}>{rarityLabel}</span>
            <span className="text-night-600">•</span>
            <span className="text-night-400">{achievement.points} pkt</span>
          </div>

          {/* Progress bar */}
          {userProgress && !isCompleted && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-night-400 mb-1">
                <span>
                  {userProgress.progress} / {achievement.maxProgress}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-night-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(achievement.rarity)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned date */}
          {isCompleted && userProgress?.earnedAt && (
            <p className="text-xs text-night-500 mt-2">
              Zdobyto: {new Date(userProgress.earnedAt).toLocaleDateString("pl-PL")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getProgressBarColor(rarity: AchievementRarity): string {
  const map: Record<AchievementRarity, string> = {
    common: "bg-night-400",
    uncommon: "bg-green-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-gradient-to-r from-amber-500 to-yellow-300",
  };
  return map[rarity];
}
