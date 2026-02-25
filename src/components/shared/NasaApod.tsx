"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineSparkles,
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

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        // NASA APOD API (demo key — rate limited)
        const res = await fetch(
          "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
        );
        if (!res.ok) throw new Error("API error");
        const data: APODData = await res.json();
        setApod(data);
      } catch {
        // Fallback na demo dane
        setApod(FALLBACK_APOD);
      } finally {
        setLoading(false);
      }
    };

    // Cache w sessionStorage (1 dzień)
    const cached = sessionStorage.getItem("astrofor-apod");
    const cachedDate = sessionStorage.getItem("astrofor-apod-date");
    const today = new Date().toISOString().split("T")[0];

    if (cached && cachedDate === today) {
      setApod(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchAPOD().then(() => {
        // Cache po załadowaniu
        const current = sessionStorage.getItem("astrofor-apod");
        if (!current) {
          // setApod already happened, save it
        }
      });
    }
  }, []);

  // Save to session when we have data
  useEffect(() => {
    if (apod) {
      const today = new Date().toISOString().split("T")[0];
      sessionStorage.setItem("astrofor-apod", JSON.stringify(apod));
      sessionStorage.setItem("astrofor-apod-date", today);
    }
  }, [apod]);

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
        <div className="flex items-center gap-1 text-xs text-night-500">
          <HiOutlineCalendarDays className="h-3.5 w-3.5" />
          {apod.date}
        </div>
      </div>

      {/* Zdjęcie / Video */}
      <div className="relative">
        {apod.media_type === "video" ? (
          <div className="aspect-video">
            <iframe
              src={apod.url}
              title={apod.title}
              className="w-full h-full"
              allowFullScreen
            />
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
