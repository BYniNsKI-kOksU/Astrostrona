import { ASTRO_TITLES } from "@/data/gamification";

interface TitleProgressProps {
  currentPoints: number;
  currentTitleId: string;
}

export function TitleProgress({ currentPoints, currentTitleId }: TitleProgressProps) {
  return (
    <div className="glass-card rounded-xl p-5 border border-cosmos-600/20">
      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
        🏛️ Drabinka tytułów
      </h3>

      <div className="space-y-2">
        {ASTRO_TITLES.map((title, idx) => {
          const isActive = title.id === currentTitleId;
          const isUnlocked = currentPoints >= title.requiredPoints;
          const isNext =
            !isUnlocked &&
            (idx === 0 || currentPoints >= ASTRO_TITLES[idx - 1].requiredPoints);

          return (
            <div
              key={title.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                isActive
                  ? "bg-cosmos-500/20 border border-cosmos-400/50"
                  : isUnlocked
                  ? "bg-night-800/30 opacity-70"
                  : "opacity-30"
              } ${isNext ? "ring-1 ring-nebula-500/50" : ""}`}
            >
              <span className="text-lg w-8 text-center">{title.icon}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isActive ? title.color : "text-night-300"}`}>
                    {title.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] bg-cosmos-500/30 text-cosmos-300 px-1.5 py-0.5 rounded-full">
                      AKTYWNY
                    </span>
                  )}
                  {isUnlocked && !isActive && (
                    <span className="text-[10px] text-green-400">✓</span>
                  )}
                </div>
                <p className="text-xs text-night-500">{title.subtitle}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-night-400">{title.requiredPoints} pkt</p>
                <p className="text-[10px] text-night-600">Tier {title.tier}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
