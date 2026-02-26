"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockUsers, mockPosts, ALL_ACHIEVEMENTS } from "@/data";
import { PostCard } from "@/components/post";
import { Badge } from "@/components/ui";
import { TitleBadge, PointsDisplay, AchievementGrid, TitleProgress } from "@/components/gamification";
import { getTitleById, countCompletedAchievements } from "@/lib/gamification";
import { useAuth } from "@/components/providers";

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Szukamy pełnych danych użytkownika (mock) — fallback na dane z auth
  const user = authUser
    ? mockUsers.find((u) => u.id === authUser.id) || authUser
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="glass-card p-6 md:p-8 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-night-800" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-night-800 rounded w-48" />
              <div className="h-4 bg-night-800 rounded w-32" />
              <div className="h-3 bg-night-800 rounded w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Niezalogowany — redirect
  if (!isAuthenticated || !user) {
    router.push("/login?redirect=/profile");
    return null;
  }

  const userPosts = mockPosts.filter((p) => p.authorId === user.id);
  const gamification = user.gamification;
  const currentTitle = getTitleById(gamification.currentTitleId);
  const completedCount = countCompletedAchievements(gamification);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Nagłówek profilu */}
      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-cosmos-500/30 flex items-center justify-center text-cosmos-300 font-bold text-3xl shrink-0">
            {user.displayName.charAt(0)}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-night-100">{user.displayName}</h1>
            <p className="text-night-400 text-sm">@{user.username}</p>

            {/* Tytuł astronomiczny */}
            {currentTitle && (
              <div className="mt-2">
                <TitleBadge title={currentTitle} points={gamification.totalPoints} showProgress size="md" />
              </div>
            )}

            <p className="text-night-300 mt-2 text-sm">{user.bio}</p>

            {/* Odznaki */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {user.badges.map((badge) => (
                  <Badge key={badge.id} variant="cosmos">
                    {badge.icon} {badge.name}
                  </Badge>
                ))}
                <Badge variant="nebula">
                  {user.role === "admin" ? "👑 Admin" : user.role}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link href="/profile/edit" className="btn-secondary text-sm text-center">Edytuj profil</Link>
            <div className="flex gap-2">
              <Link href="/saved" className="btn-ghost text-xs px-3 py-1.5 text-center">📌 Zapisane</Link>
              <Link href="/settings" className="btn-ghost text-xs px-3 py-1.5 text-center">⚙️ Ustawienia</Link>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 pt-6 border-t border-night-700">
          {[
            { label: "Posty", value: user.stats.posts },
            { label: "Zdjęcia", value: user.stats.photos },
            { label: "Polubienia", value: user.stats.likes },
            { label: "Komentarze", value: user.stats.comments },
            { label: "Obserwacje", value: user.stats.observations },
            { label: "Osiągnięcia", value: `${completedCount}/${ALL_ACHIEVEMENTS.length}` },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-bold text-night-100">{stat.value}</div>
              <div className="text-xs text-night-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grywalizacja — 2-kolumnowy layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Lewa kolumna — punkty i drabinka */}
        <div className="space-y-6">
          <PointsDisplay profile={gamification} />
          <TitleProgress
            currentPoints={gamification.totalPoints}
            currentTitleId={gamification.currentTitleId}
          />
        </div>

        {/* Prawa kolumna — osiągnięcia */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-night-100 mb-4">
            🏆 Osiągnięcia
          </h2>
          <AchievementGrid
            achievements={ALL_ACHIEVEMENTS}
            userAchievements={gamification.achievements}
          />
        </div>
      </div>

      {/* Posty użytkownika */}
      <h2 className="font-display text-xl font-bold text-night-100 mb-4">
        📝 Posty
      </h2>
      {userPosts.length > 0 ? (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-night-400 text-sm">Nie masz jeszcze żadnych postów.</p>
          <Link href="/forum/new" className="btn-primary text-sm mt-4 inline-block">
            Napisz pierwszy post
          </Link>
        </div>
      )}
    </div>
  );
}
