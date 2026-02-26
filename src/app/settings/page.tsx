"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme, Theme, useAuth } from "@/components/providers";
import {
  HiOutlineCog6Tooth,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineBell,
  HiOutlineEye,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import clsx from "clsx";

const themes: { id: Theme; label: string; icon: string; desc: string }[] = [
  { id: "dark", label: "Ciemny", icon: "🌙", desc: "Domyślny kosmiczny motyw" },
  { id: "light", label: "Jasny", icon: "☀️", desc: "Jasne tło dla dziennego użytku" },
  { id: "midnight", label: "Midnight", icon: "🌌", desc: "Głęboki ciemny z odcieniem granatu" },
  { id: "amoled", label: "AMOLED", icon: "⬛", desc: "Czysty czarny — oszczędzanie baterii" },
];

export default function SettingsPage() {
  const { theme, setTheme, fontSize, setFontSize, reducedMotion, setReducedMotion } =
    useTheme();
  const { logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifAchievements, setNotifAchievements] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [language, setLanguage] = useState("pl");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-night-800 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-night-800 rounded w-full" />
            <div className="h-4 bg-night-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?redirect=/settings");
    return null;
  }

  const saveSettings = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        value ? "bg-cosmos-500" : "bg-night-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Nagłówek */}
      <div className="flex items-center gap-3 mb-8">
        <HiOutlineCog6Tooth className="h-8 w-8 text-cosmos-400" />
        <div>
          <h1 className="font-display text-2xl font-bold text-night-100">
            Ustawienia
          </h1>
          <p className="text-night-400 text-sm">
            Dostosuj wygląd i zachowanie strony
          </p>
        </div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <HiOutlineCheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Ustawienia zapisane!</span>
        </div>
      )}

      <div className="space-y-8">
        {/* ============ WYGLĄD ============ */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineEye className="h-5 w-5 text-cosmos-400" />
            <h2 className="text-sm font-semibold text-night-200 uppercase tracking-wider">
              Wygląd
            </h2>
          </div>

          {/* Motyw */}
          <div className="mb-6">
            <p className="text-sm font-medium text-night-300 mb-3">Motyw</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={clsx(
                    "relative p-4 rounded-xl border-2 transition-all text-left",
                    theme === t.id
                      ? "border-cosmos-400 bg-cosmos-500/10"
                      : "border-night-700 hover:border-night-500 bg-night-900/50"
                  )}
                >
                  {theme === t.id && (
                    <span className="absolute top-2 right-2 text-cosmos-400 text-sm">
                      ✓
                    </span>
                  )}
                  <span className="text-2xl block mb-2">{t.icon}</span>
                  <span className="text-sm font-medium text-night-100 block">
                    {t.label}
                  </span>
                  <span className="text-xs text-night-500 block mt-0.5">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rozmiar czcionki */}
          <div className="mb-6">
            <p className="text-sm font-medium text-night-300 mb-3">
              Rozmiar tekstu
            </p>
            <div className="flex gap-2">
              {(["small", "normal", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={clsx(
                    "px-4 py-2 rounded-lg border text-sm transition-colors",
                    fontSize === size
                      ? "border-cosmos-400 bg-cosmos-500/10 text-cosmos-300"
                      : "border-night-700 text-night-400 hover:text-night-200 hover:border-night-500"
                  )}
                >
                  {size === "small" && "A⁻ Mały"}
                  {size === "normal" && "A Normalny"}
                  {size === "large" && "A⁺ Duży"}
                </button>
              ))}
            </div>
          </div>

          {/* Redukcja animacji */}
          <div className="flex items-center justify-between py-3 border-t border-night-700">
            <div>
              <p className="text-sm text-night-200">Redukcja animacji</p>
              <p className="text-xs text-night-500">
                Wyłącz animacje i przejścia dla lepszej dostępności
              </p>
            </div>
            <Toggle value={reducedMotion} onChange={setReducedMotion} />
          </div>
        </section>

        {/* ============ JĘZYK ============ */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineGlobeAlt className="h-5 w-5 text-cosmos-400" />
            <h2 className="text-sm font-semibold text-night-200 uppercase tracking-wider">
              Język i region
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-night-300 mb-1.5">
              Język interfejsu
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field w-full sm:w-64"
            >
              <option value="pl">🇵🇱 Polski</option>
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>
        </section>

        {/* ============ POWIADOMIENIA ============ */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineBell className="h-5 w-5 text-cosmos-400" />
            <h2 className="text-sm font-semibold text-night-200 uppercase tracking-wider">
              Powiadomienia
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-night-700">
            {[
              {
                label: "Polubienia",
                desc: "Gdy ktoś polubi Twój post lub zdjęcie",
                value: notifLikes,
                onChange: setNotifLikes,
              },
              {
                label: "Komentarze",
                desc: "Gdy ktoś skomentuje Twój post",
                value: notifComments,
                onChange: setNotifComments,
              },
              {
                label: "Nowi obserwujący",
                desc: "Gdy ktoś zacznie Cię obserwować",
                value: notifFollows,
                onChange: setNotifFollows,
              },
              {
                label: "Osiągnięcia",
                desc: "Gdy zdobędziesz nowe osiągnięcie",
                value: notifAchievements,
                onChange: setNotifAchievements,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm text-night-200">{item.label}</p>
                  <p className="text-xs text-night-500">{item.desc}</p>
                </div>
                <Toggle value={item.value} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </section>

        {/* ============ PRYWATNOŚĆ ============ */}
        <section className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineShieldCheck className="h-5 w-5 text-cosmos-400" />
            <h2 className="text-sm font-semibold text-night-200 uppercase tracking-wider">
              Prywatność
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-night-700">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-night-200">Profil publiczny</p>
                <p className="text-xs text-night-500">
                  Inni użytkownicy mogą widzieć Twój profil
                </p>
              </div>
              <Toggle value={profilePublic} onChange={setProfilePublic} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-night-200">Pokaż sprzęt</p>
                <p className="text-xs text-night-500">
                  Wyświetlaj informacje o sprzęcie na profilu
                </p>
              </div>
              <Toggle value={showEquipment} onChange={setShowEquipment} />
            </div>
          </div>
        </section>

        {/* ============ NIEBEZPIECZNA STREFA ============ */}
        <section className="glass-card rounded-xl p-6 border-red-500/20">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineTrash className="h-5 w-5 text-red-400" />
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              Strefa zagrożenia
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-night-200">Wyloguj się</p>
                <p className="text-xs text-night-500">
                  Zakończ bieżącą sesję
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="text-sm px-3 py-1.5 rounded-lg border border-night-600 text-night-400 hover:text-night-200 hover:border-night-400 transition-colors"
              >
                Wyloguj
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-night-700">
              <div>
                <p className="text-sm text-red-300">Usuń konto</p>
                <p className="text-xs text-night-500">
                  Trwale usuwa Twoje konto i wszystkie dane
                </p>
              </div>
              <button className="text-sm px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
                Usuń konto
              </button>
            </div>
          </div>
        </section>

        {/* Przycisk zapisu */}
        <div className="flex items-center gap-4 pt-2">
          <button onClick={saveSettings} className="btn-primary">
            Zapisz ustawienia
          </button>
          <Link href="/profile" className="btn-ghost px-4 py-2">
            Wróć do profilu
          </Link>
        </div>
      </div>
    </div>
  );
}
