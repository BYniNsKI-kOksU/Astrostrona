/**
 * Stałe aplikacji
 */

export const APP_NAME = "Astrofor";
export const APP_DESCRIPTION = "Społeczność astronomiczna — forum, galeria, nauka";
export const APP_URL = "https://astrofor.pl";

export const BORTLE_SCALE_LABELS: Record<number, string> = {
  1: "Doskonałe ciemne niebo",
  2: "Typowe ciemne niebo",
  3: "Wiejskie niebo",
  4: "Przejście wieś/przedmieścia",
  5: "Podmiejskie niebo",
  6: "Jasne podmiejskie niebo",
  7: "Przejście przedmieścia/miasto",
  8: "Miejskie niebo",
  9: "Centrum miasta",
};

export const NAV_LINKS = [
  { href: "/", label: "Strona główna", icon: "home" },
  { href: "/forum", label: "Forum", icon: "forum" },
  { href: "/gallery", label: "Galeria", icon: "gallery" },
  { href: "/achievements", label: "Osiągnięcia", icon: "achievements" },
  { href: "/map", label: "Mapa spotów", icon: "map" },
  { href: "/news", label: "Newsy", icon: "news" },
  { href: "/science", label: "Nauka", icon: "science" },
] as const;

export const FORUM_CATEGORIES = [
  { value: "all", label: "Wszystkie", icon: "🌌" },
  { value: "astrophoto", label: "Astrofoto", icon: "📸" },
  { value: "equipment", label: "Sprzęt", icon: "🔭" },
  { value: "software", label: "Oprogramowanie", icon: "💻" },
  { value: "observation", label: "Obserwacje", icon: "👁️" },
  { value: "science", label: "Nauka", icon: "🔬" },
  { value: "news", label: "Newsy", icon: "📰" },
  { value: "beginner", label: "Początkujący", icon: "🌱" },
  { value: "general", label: "Ogólne", icon: "💬" },
] as const;
