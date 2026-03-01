"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowPath,
  HiOutlineCalendarDays,
  HiOutlineSparkles,
  HiOutlinePlayCircle,
} from "react-icons/hi2";

interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: string;
  copyright?: string;
}

// Demo fallback w razie braku API
const FALLBACK_APOD: APODData = {
  title: "Mgławica Oriona — M42",
  explanation:
    "Mgławica Oriona (znana również jako Messier 42, M42 lub NGC 1976) to rozproszona mgławica znajdująca się poniżej Pasa Oriona w gwiazdozbiorze Oriona. Jest jedną z najjaśniejszych mgławic i jest widoczna gołym okiem na nocnym niebie. Odległa o około 1344 lata świetlne, jest najbliższym masywnym rejonem formowania się gwiazd od Ziemi.",
  url: "https://apod.nasa.gov/apod/image/2402/OrionNeb_HubbleSerrano_960.jpg",
  hdurl: "https://apod.nasa.gov/apod/image/2402/OrionNeb_HubbleSerrano_4592.jpg",
  date: new Date().toISOString().split("T")[0],
  media_type: "image",
  copyright: "NASA/ESA/Hubble",
};

export default function NasaApod() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchAPOD = useCallback(async (skipCache = false) => {
    try {
      // Sprawdź cache (chyba że wymuszamy odświeżenie)
      if (!skipCache) {
        const cached = sessionStorage.getItem("astrofor-apod");
        const cachedDate = sessionStorage.getItem("astrofor-apod-date");
        const today = new Date().toISOString().split("T")[0];

        if (cached && cachedDate === today) {
          const parsed = JSON.parse(cached);
          // Upewnij się, że cache nie zawiera danych fallback i jest z dzisiaj
          if (parsed.url && parsed.url !== FALLBACK_APOD.url) {
            setApod(parsed);
            setLoading(false);
            return;
          }
        } else {
          // Stary cache — wyczyść, żeby pobrać na nowo
          sessionStorage.removeItem("astrofor-apod");
          sessionStorage.removeItem("astrofor-apod-date");
        }
      }

      // Pobierz z naszego API route (parsuje stronę APOD lub NASA API)
      const res = await fetch("/api/apod", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const data: APODData = await res.json();
      if (data.url || data.media_type === "video") {
        setApod(data);
        // Zapisz do cache
        const today = new Date().toISOString().split("T")[0];
        sessionStorage.setItem("astrofor-apod", JSON.stringify(data));
        sessionStorage.setItem("astrofor-apod-date", today);
      } else {
        throw new Error("No image/video URL");
      }
    } catch {
      // Fallback na demo dane
      setApod(FALLBACK_APOD);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAPOD(false);

    // Auto-odświeżanie co 60 minut — APOD zmienia się raz dziennie
    const interval = setInterval(() => {
      fetchAPOD(true);
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAPOD]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Wyczyść cache i pobierz na nowo
    sessionStorage.removeItem("astrofor-apod");
    sessionStorage.removeItem("astrofor-apod-date");
    fetchAPOD(true);
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-video bg-night-800" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-night-800 rounded w-1/3" />
          <div className="h-6 bg-night-800 rounded w-2/3" />
          <div className="h-3 bg-night-800 rounded w-full" />
          <div className="h-3 bg-night-800 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!apod) return null;

  const truncatedExplanation =
    apod.explanation.length > 200
      ? apod.explanation.slice(0, 200) + "..."
      : apod.explanation;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group">
      {/* Nagłówek */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-night-700/50 bg-night-900/40">
        <HiOutlineSparkles className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          NASA — Zdjęcie Dnia
        </span>
        <div className="flex-1" />
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 rounded-md text-night-500 hover:text-night-300 hover:bg-night-800/50 transition-all disabled:opacity-50"
          title="Odśwież zdjęcie"
        >
          <HiOutlineArrowPath className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        <div className="flex items-center gap-1 text-xs text-night-500">
          <HiOutlineCalendarDays className="h-3.5 w-3.5" />
          {apod.date}
        </div>
      </div>

      {/* Zdjęcie / Video */}
      <div className="relative">
        {apod.media_type === "video" ? (
          <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
            {apod.url.match(/\.(mp4|mov|webm)(\?|$)/i) && !videoError ? (
              /* Natywny tag <video> dla plików mp4/webm */
              <video
                ref={videoRef}
                key={apod.url}
                className="absolute inset-0 w-full h-full object-contain"
                controls
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
                crossOrigin="anonymous"
              >
                <source src={apod.url.replace(/^http:/, "https:")} type="video/mp4" />
                Twoja przeglądarka nie obsługuje wideo HTML5.
              </video>
            ) : apod.url.match(/\.(mp4|mov|webm)(\?|$)/i) && videoError ? (
              /* Fallback gdy wideo mp4 nie wczytało się (np. CORS) */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <HiOutlinePlayCircle className="h-16 w-16 text-night-400 opacity-60" />
                <p className="text-sm text-night-400">
                  Film nie może być wyświetlony bezpośrednio.
                </p>
                <a
                  href={apod.url.replace(/^http:/, "https:")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cosmos-600 hover:bg-cosmos-500 text-white text-sm font-medium transition-colors"
                >
                  <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                  Otwórz film bezpośrednio
                </a>
              </div>
            ) : (
              /* iframe dla YouTube / Vimeo i innych */
              <iframe
                src={(() => {
                  let url = apod.url.replace(/^http:/, "https:");
                  url = url.replace(
                    /youtube\.com\/watch\?v=([^&"]+)/,
                    "youtube.com/embed/$1"
                  );
                  url = url.replace(
                    /youtu\.be\/([^?&"]+)/,
                    "youtube.com/embed/$1"
                  );
                  if (url.includes("youtube.com/embed/")) {
                    const sep = url.includes("?") ? "&" : "?";
                    url += `${sep}rel=0&modestbranding=1`;
                  }
                  url = url.replace(
                    /(?:www\.)?vimeo\.com\/(\d+)/,
                    "player.vimeo.com/video/$1"
                  );
                  return url;
                })()}
                title={apod.title}
                className="absolute inset-0 w-full h-full border-0"
                style={{ border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={apod.url}
              alt={apod.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
            {apod.hdurl && (
              <a
                href={apod.hdurl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 p-2 rounded-lg bg-night-900/70 backdrop-blur-sm text-night-300 hover:text-white hover:bg-night-900 transition-all opacity-0 group-hover:opacity-100"
                title="Otwórz w pełnej rozdzielczości"
              >
                <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-night-100 mb-2">{apod.title}</h3>
        <p className="text-sm text-night-400 leading-relaxed">
          {expanded ? apod.explanation : truncatedExplanation}
        </p>
        {apod.explanation.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-cosmos-400 hover:text-cosmos-300 mt-2 transition-colors"
          >
            {expanded ? "Zwiń" : "Czytaj więcej..."}
          </button>
        )}
        {apod.copyright && (
          <p className="text-xs text-night-600 mt-3">© {apod.copyright}</p>
        )}
      </div>
    </div>
  );
}
