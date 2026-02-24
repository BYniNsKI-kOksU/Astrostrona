import { AstroTitle } from "@/types";
import { getNextTitle, getProgressToNextTitle } from "@/lib/gamification";

interface TitleBadgeProps {
  title: AstroTitle;
  points: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TitleBadge({ title, points, showProgress = false, size = "md" }: TitleBadgeProps) {
  const nextTitle = getNextTitle(title.id);
  const progress = getProgressToNextTitle(points, title.id);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const iconSize = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full glass-card border border-cosmos-600/30 ${sizeClasses[size]}`}
      >
        <span className={iconSize[size]}>{title.icon}</span>
        <span className={`font-bold ${title.color}`}>{title.name}</span>
        {size !== "sm" && (
          <span className="text-night-400 text-xs">— {title.subtitle}</span>
        )}
      </div>

      {showProgress && nextTitle && (
        <div className="w-full max-w-[200px] mt-1">
          <div className="flex justify-between text-xs text-night-400 mb-0.5">
            <span>{points} pkt</span>
            <span>{nextTitle.requiredPoints} pkt</span>
          </div>
          <div className="h-1.5 w-full bg-night-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nebula-500 to-cosmos-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-night-500 text-center mt-0.5">
            Następny: {nextTitle.icon} {nextTitle.name}
          </p>
        </div>
      )}
    </div>
  );
}
