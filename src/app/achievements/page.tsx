import { ALL_ACHIEVEMENTS, ASTRO_TITLES, mockGamificationProfiles } from "@/data";
import { ASTRONOMER_BIOS } from "@/data/astronomers";
import { AchievementGrid } from "@/components/gamification";

export default function AchievementsPage() {
  const profile = mockGamificationProfiles[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-night-100 mb-2">
          🏆 Osiągnięcia
        </h1>
        <p className="text-night-400">
          Odkrywaj osiągnięcia, zdobywaj punkty i awansuj na kolejne tytuły astronomiczne.
          Osiągnięcia mają 5 poziomów rzadkości — im rzadsze, tym więcej punktów!
        </p>
      </div>

      {/* Statystyki szybkie */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Łącznie osiągnięć", value: ALL_ACHIEVEMENTS.length, icon: "🎯" },
          { label: "Zwykłe", value: ALL_ACHIEVEMENTS.filter((a) => a.rarity === "common").length, icon: "⚪" },
          { label: "Rzadkie", value: ALL_ACHIEVEMENTS.filter((a) => a.rarity === "rare").length, icon: "🔵" },
          { label: "Epickie", value: ALL_ACHIEVEMENTS.filter((a) => a.rarity === "epic").length, icon: "🟣" },
          { label: "Legendarne", value: ALL_ACHIEVEMENTS.filter((a) => a.rarity === "legendary").length, icon: "🟡" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center border border-cosmos-600/20">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-night-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Drabinka tytułów */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-night-100 mb-4">
          🏛️ Tytuły astronomiczne
        </h2>
        <p className="text-night-400 text-sm mb-4">
          Tytuły nadawane są na cześć wielkich astronomów — od Ptolemeusza do legendy Astrofor.
          Zdobywaj punkty za osiągnięcia, aby awansować!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ASTRO_TITLES.map((title) => (
            <div key={title.id} className="glass-card rounded-xl p-4 border border-cosmos-600/20 hover:border-cosmos-400/40 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{title.icon}</span>
                <div>
                  <p className={`font-bold ${title.color}`}>{title.name}</p>
                  <p className="text-xs text-night-500">{title.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-night-400 mb-2">{title.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-night-500">Tier {title.tier}</span>
                <span className="text-cosmos-400">{title.requiredPoints} pkt</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biografie astronomów */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-night-100 mb-4">
          🧑‍🔬 Kim byli patroni tytułów?
        </h2>
        <p className="text-night-400 text-sm mb-6">
          Każdy tytuł nosi imię wielkiego astronoma, który zmienił nasze rozumienie kosmosu.
        </p>
        <div className="space-y-4">
          {ASTRONOMER_BIOS.map((bio) => (
            <details
              key={bio.titleId}
              className="glass-card rounded-xl border border-cosmos-600/20 group"
            >
              <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-night-800/30 transition-colors rounded-xl list-none">
                <span className="text-3xl">{bio.portrait}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-night-100">{bio.fullName}</h3>
                    <span className="text-xs text-night-500">({bio.born} — {bio.died})</span>
                    <span className="text-xs bg-cosmos-500/10 text-cosmos-400 px-2 py-0.5 rounded-full">{bio.nationality}</span>
                  </div>
                  <p className="text-sm text-night-400 mt-1 line-clamp-1">{bio.summary}</p>
                </div>
                <span className="text-night-500 group-open:rotate-180 transition-transform text-lg">▾</span>
              </summary>

              <div className="px-4 pb-4 pt-2 border-t border-night-800">
                <p className="text-sm text-night-300 leading-relaxed mb-4">{bio.summary}</p>

                <h4 className="text-xs font-semibold text-night-300 uppercase tracking-wider mb-2">
                  Najważniejsze osiągnięcia
                </h4>
                <ul className="space-y-1.5 mb-4">
                  {bio.keyAchievements.map((achievement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-night-400">
                      <span className="text-cosmos-400 mt-0.5">✦</span>
                      {achievement}
                    </li>
                  ))}
                </ul>

                <div className="bg-night-800/50 rounded-lg p-3">
                  <p className="text-xs text-night-500 uppercase tracking-wider mb-1 font-semibold">💡 Ciekawostka</p>
                  <p className="text-sm text-night-300">{bio.funFact}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Pełna lista osiągnięć */}
      <div>
        <h2 className="font-display text-xl font-bold text-night-100 mb-4">
          🎯 Wszystkie osiągnięcia
        </h2>
        <AchievementGrid
          achievements={ALL_ACHIEVEMENTS}
          userAchievements={profile.achievements}
          showFilters
        />
      </div>
    </div>
  );
}
