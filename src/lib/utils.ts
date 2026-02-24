import { PostCategory } from "@/types";

/**
 * Formatowanie daty relatywnie (np. "2 godziny temu")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return "przed chwilą";
  if (diffMin < 60) return `${diffMin} min temu`;
  if (diffHour < 24) return `${diffHour} godz. temu`;
  if (diffDay < 7) return `${diffDay} dn. temu`;
  if (diffWeek < 4) return `${diffWeek} tyg. temu`;
  if (diffMonth < 12) return `${diffMonth} mies. temu`;

  return date.toLocaleDateString("pl-PL");
}

/**
 * Formatowanie liczby (np. 1200 → "1.2k")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
}

/**
 * Ikona fazy księżyca
 */
export function getMoonPhaseIcon(phase: number): string {
  if (phase <= 5) return "🌑";
  if (phase <= 25) return "🌒";
  if (phase <= 40) return "🌓";
  if (phase <= 60) return "🌔";
  if (phase <= 75) return "🌕";
  if (phase <= 90) return "🌖";
  return "🌗";
}

/**
 * Label dla kategorii posta
 */
export function getCategoryLabel(category: PostCategory): string {
  const labels: Record<PostCategory, string> = {
    astrophoto: "Astrofoto",
    equipment: "Sprzęt",
    software: "Oprogramowanie",
    general: "Ogólne",
    observation: "Obserwacje",
    science: "Nauka",
    news: "Newsy",
    beginner: "Początkujący",
  };
  return labels[category];
}

/**
 * Kolor dla kategorii posta
 */
export function getCategoryColor(category: PostCategory): string {
  const colors: Record<PostCategory, string> = {
    astrophoto: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    equipment: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    software: "bg-green-500/20 text-green-300 border-green-500/30",
    general: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    observation: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    science: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    news: "bg-red-500/20 text-red-300 border-red-500/30",
    beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  return colors[category];
}

/**
 * Etykieta typu obiektu
 */
export function getObjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    galaxy: "Galaktyka",
    nebula: "Mgławica",
    star_cluster: "Gromada gwiazd",
    planetary_nebula: "Mgławica planetarna",
    supernova_remnant: "Pozostałość po supernowej",
    comet: "Kometa",
    planet: "Planeta",
    moon: "Księżyc",
    sun: "Słońce",
    wide_field: "Szerokie pole",
    other: "Inne",
  };
  return labels[type] || type;
}
