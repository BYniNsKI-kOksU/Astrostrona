"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePhoto,
  HiOutlineNewspaper,
  HiOutlineBeaker,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineUserCircle,
  HiOutlinePlusCircle,
  HiOutlineTrophy,
  HiOutlineXMark,
  HiOutlineMapPin,
  HiOutlineBookmark,
  HiOutlineCog6Tooth,
  HiOutlinePencilSquare,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import clsx from "clsx";
import { useAuth } from "@/components/providers";

const SUBREDDITS = [
  { slug: "astrofoto", label: "a/astrofoto", icon: "📸", desc: "Zdjęcia astro" },
  { slug: "sprzet", label: "a/sprzet", icon: "🔭", desc: "Teleskopy, montaże, kamery" },
  { slug: "obserwacje", label: "a/obserwacje", icon: "👁️", desc: "Raporty z obserwacji" },
  { slug: "poczatkujacy", label: "a/poczatkujacy", icon: "🌱", desc: "Pytania na start" },
  { slug: "nauka", label: "a/nauka", icon: "🔬", desc: "Artykuły naukowe" },
  { slug: "software", label: "a/software", icon: "💻", desc: "PixInsight, Siril, N.I.N.A." },
  { slug: "newsy", label: "a/newsy", icon: "📰", desc: "Odkrycia i wydarzenia" },
  { slug: "ogolne", label: "a/ogolne", icon: "💬", desc: "Wszystko inne" },
];

const navItems = [
  { href: "/", label: "Strona główna", icon: HiOutlineHome },
  { href: "/forum", label: "Forum", icon: HiOutlineChatBubbleLeftRight },
  { href: "/gallery", label: "Galeria", icon: HiOutlinePhoto },
  { href: "/achievements", label: "Osiągnięcia", icon: HiOutlineTrophy },
  { href: "/map", label: "Mapa", icon: HiOutlineMapPin },
  { href: "/news", label: "Newsy", icon: HiOutlineNewspaper },
  { href: "/science", label: "Nauka", icon: HiOutlineBeaker },
];

const mockNotifications = [
  {
    id: "n1",
    text: "Anna Kosmiczna polubiła Twój post o Mgławicy Oriona",
    time: "5 min temu",
    read: false,
    href: "/forum/post/p1",
  },
  {
    id: "n2",
    text: "Michał Niebo skomentował Twój post",
    time: "2 godz. temu",
    read: false,
    href: "/forum/post/p1",
  },
  {
    id: "n3",
    text: "Zdobyto osiągnięcie: Nocny Marek 🦉",
    time: "1 dzień temu",
    read: false,
    href: "/achievements",
  },
  {
    id: "n4",
    text: "Nowy post w kategorii Sprzęt: Jaki teleskop na start?",
    time: "2 dni temu",
    read: true,
    href: "/forum/post/p2",
  },
  {
    id: "n5",
    text: "Twoje zdjęcie otrzymało 100 polubień! ❤️",
    time: "3 dni temu",
    read: true,
    href: "/gallery/img1",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Zamykanie paneli po kliknięciu poza nimi
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(e.target as Node)
      ) {
        setShowSearch(false);
      }
      if (
        notifPanelRef.current &&
        !notifPanelRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus na input po otwarciu
  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Sprawdź czy to wyszukiwanie a/
      const subMatch = searchQuery.match(/^a\/(\w+)$/i);
      if (subMatch) {
        const slug = subMatch[1].toLowerCase();
        const found = SUBREDDITS.find((s) => s.slug === slug);
        if (found) {
          const categoryMap: Record<string, string> = {
            astrofoto: "astrophoto",
            sprzet: "equipment",
            obserwacje: "observation",
            poczatkujacy: "beginner",
            nauka: "science",
            software: "software",
            newsy: "news",
            ogolne: "general",
          };
          router.push(`/forum?category=${categoryMap[slug] || slug}`);
          setShowSearch(false);
          setSearchQuery("");
          return;
        }
      }
      router.push(`/forum?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  // Filter subreddits based on query
  const filteredSubs = searchQuery.startsWith("a/")
    ? SUBREDDITS.filter((s) =>
        s.slug.includes(searchQuery.slice(2).toLowerCase()) ||
        s.label.includes(searchQuery.toLowerCase())
      )
    : [];

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-night-800 bg-night-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🔭</span>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
              Astrofor
            </span>
          </Link>

          {/* Nawigacja główna */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-cosmos-500/20 text-cosmos-300"
                      : "text-night-400 hover:text-night-100 hover:bg-night-800"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Prawa strona */}
          <div className="flex items-center gap-2">
            {/* Wyszukiwarka */}
            <div ref={searchPanelRef} className="relative">
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setShowNotifications(false);
                }}
                className="btn-ghost p-2 rounded-lg"
              >
                <HiOutlineMagnifyingGlass className="h-5 w-5" />
              </button>

              {/* Panel wyszukiwania */}
              {showSearch && (
                <div className="fixed inset-x-0 top-16 mx-auto max-w-lg px-4 sm:px-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 z-50">
                  <div className="rounded-xl border border-night-700 shadow-2xl p-4 bg-night-950/95 backdrop-blur-xl">
                  <form onSubmit={handleSearch}>
                    <div className="flex items-center gap-2 mb-3">
                      <HiOutlineMagnifyingGlass className="h-4 w-4 text-night-500 shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Szukaj... lub wpisz a/ (np. a/astrofoto)"
                        className="flex-1 bg-transparent text-base sm:text-sm text-night-100 outline-none placeholder:text-night-500"
                        style={{ fontSize: "16px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSearch(false)}
                        className="text-night-500 hover:text-night-300"
                      >
                        <HiOutlineXMark className="h-4 w-4" />
                      </button>
                    </div>
                  </form>

                  {/* Subreddit suggestions */}
                  {(searchQuery.startsWith("a/") || searchQuery === "a") && (
                    <div className="border-t border-night-700 pt-3 mb-3">
                      <p className="text-xs text-night-500 mb-2 font-semibold uppercase tracking-wider">
                        📂 Subfora (wpisz a/...)
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {(filteredSubs.length > 0 ? filteredSubs : SUBREDDITS).map((sub) => (
                          <button
                            key={sub.slug}
                            onClick={() => {
                              setSearchQuery(`a/${sub.slug}`);
                              const categoryMap: Record<string, string> = {
                                astrofoto: "astrophoto",
                                sprzet: "equipment",
                                obserwacje: "observation",
                                poczatkujacy: "beginner",
                                nauka: "science",
                                software: "software",
                                newsy: "news",
                                ogolne: "general",
                              };
                              router.push(`/forum?category=${categoryMap[sub.slug] || sub.slug}`);
                              setShowSearch(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2.5 w-full text-left px-2 py-2 rounded-lg text-sm text-night-300 hover:text-night-100 hover:bg-night-800 transition-colors"
                          >
                            <span className="text-base">{sub.icon}</span>
                            <div>
                              <span className="font-medium text-cosmos-400">{sub.label}</span>
                              <span className="text-night-500 ml-2 text-xs">{sub.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Szybkie linki — tylko gdy nie szukamy a/ */}
                  {!searchQuery.startsWith("a/") && searchQuery !== "a" && (
                  <div className="border-t border-night-700 pt-3">
                    <p className="text-xs text-night-500 mb-2 font-semibold uppercase tracking-wider">
                      Szybkie linki
                    </p>
                    <div className="space-y-1">
                      {[
                        {
                          label: "🔭 Sprzęt — dyskusje",
                          href: "/forum?category=equipment",
                        },
                        { label: "📷 Galeria zdjęć", href: "/gallery" },
                        { label: "📍 Mapa spotów", href: "/map" },
                        { label: "🏆 Osiągnięcia", href: "/achievements" },
                        { label: "📰 Najnowsze newsy", href: "/news" },
                      ].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowSearch(false)}
                          className="block text-sm text-night-400 hover:text-night-200 hover:bg-night-800 px-2 py-1.5 rounded transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* Powiadomienia — tylko dla zalogowanych */}
            {isAuthenticated && (
            <div ref={notifPanelRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSearch(false);
                }}
                className="btn-ghost p-2 rounded-lg relative"
              >
                <HiOutlineBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Panel powiadomień */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-night-700 shadow-2xl z-50 max-h-[70vh] flex flex-col bg-night-950/95 backdrop-blur-xl">
                  <div className="flex items-center justify-between p-4 border-b border-night-700">
                    <h3 className="text-sm font-bold text-night-100">
                      Powiadomienia
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-cosmos-400 hover:text-cosmos-300 transition-colors"
                      >
                        Oznacz jako przeczytane
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((notif) =>
                              notif.id === n.id ? { ...notif, read: true } : notif
                            )
                          );
                          setShowNotifications(false);
                        }}
                        className={clsx(
                          "block px-4 py-3 border-b border-night-800 hover:bg-night-800/50 transition-colors",
                          !n.read && "bg-cosmos-500/5"
                        )}
                      >
                        <div className="flex gap-2">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-cosmos-400 mt-1.5 shrink-0" />
                          )}
                          <div className={!n.read ? "" : "ml-4"}>
                            <p className="text-sm text-night-200 leading-snug">
                              {n.text}
                            </p>
                            <p className="text-xs text-night-500 mt-0.5">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-3 border-t border-night-700 text-center">
                    <button className="text-xs text-cosmos-400 hover:text-cosmos-300 transition-colors">
                      Zobacz wszystkie powiadomienia
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Nowy post — tylko dla zalogowanych */}
            {isAuthenticated && (
            <Link
              href="/forum/new"
              className="hidden sm:flex items-center gap-1.5 btn-primary text-sm"
            >
              <HiOutlinePlusCircle className="h-5 w-5" />
              Nowy post
            </Link>
            )}

            {/* Profil / Logowanie */}
            {isAuthenticated ? (
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowSearch(false);
                  setShowNotifications(false);
                }}
                className="btn-ghost p-1.5 rounded-full"
              >
                <HiOutlineUserCircle className="h-7 w-7" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-night-700 shadow-2xl z-50 bg-night-950/95 backdrop-blur-xl py-2">
                  <div className="px-3 py-2 border-b border-night-700 mb-1">
                    <p className="text-sm font-semibold text-night-100">{user?.displayName}</p>
                    <p className="text-xs text-night-500">@{user?.username}</p>
                  </div>
                  {[
                    { href: "/profile", label: "Mój profil", icon: HiOutlineUserCircle },
                    { href: "/profile/edit", label: "Edytuj profil", icon: HiOutlinePencilSquare },
                    { href: "/saved", label: "Zapisane", icon: HiOutlineBookmark },
                    { href: "/settings", label: "Ustawienia", icon: HiOutlineCog6Tooth },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-night-400 hover:text-night-200 hover:bg-night-800/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-night-700 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        router.push("/");
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-night-800/50 transition-colors w-full text-left"
                    >
                      <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}
            </div>
            ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn-ghost text-sm px-3 py-2 rounded-lg"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex btn-primary text-sm px-3 py-2"
              >
                Rejestracja
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobilna nawigacja */}
      <nav className="md:hidden flex items-center justify-evenly border-t border-night-800 py-1.5 px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 min-w-[3rem] px-2 py-1 rounded-lg text-[10px] transition-colors",
                isActive
                  ? "text-cosmos-400"
                  : "text-night-500 hover:text-night-300"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
