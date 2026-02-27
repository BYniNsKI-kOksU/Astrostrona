"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  HiOutlineMapPin,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineCloud,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import clsx from "clsx";
import { BORTLE_SCALE_LABELS } from "@/lib/constants";

// =============================================
// Types
// =============================================
interface WeatherData {
  temperature: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
  visibility: number; // km
  dewPoint: number;
  precipitation: number;
  isDay: boolean;
}

interface ForecastHour {
  time: string;
  cloudCover: number;
  humidity: number;
  temperature: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
}

interface LocationResult {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lng: number;
}

interface CategoryScore {
  score: number;
  verdict: "excellent" | "good" | "fair" | "poor" | "terrible";
  label: string;
  icon: string;
  tips: string[];
}

interface AstroConditions {
  overallScore: number; // 0-100
  seeingScore: number;
  transparencyScore: number;
  cloudScore: number;
  humidityScore: number;
  windScore: number;
  bortleEstimate: number;
  verdict: "excellent" | "good" | "fair" | "poor" | "terrible";
  recommendations: string[];
  bestHours: string[];
  visibleObjects: string[];
  categories: {
    widefield: CategoryScore;
    deepsky: CategoryScore;
    planetary: CategoryScore;
    lunar: CategoryScore;
    visual: CategoryScore;
  };
}

// =============================================
// Bortle estimation from coordinates (light pollution approximation)
// Based on real light pollution map data (lightpollutionmap.info)
// =============================================
function estimateBortle(lat: number, lng: number): number {
  // Źródła zanieczyszczenia świetlnego — miasta z realistycznymi radiusami
  // coreRadius = ścisłe centrum (Bortle = coreBortle)
  // Poza coreRadius Bortle spada liniowo z odległością
  // population wpływa na siłę "poświaty" (skyglow reach)
  const sources = [
    // Duże aglomeracje
    { lat: 52.23, lng: 21.01, coreBortle: 8, coreR: 0.08, pop: 1800000 }, // Warszawa
    { lat: 50.26, lng: 19.03, coreBortle: 8, coreR: 0.12, pop: 2700000 }, // Katowice/GOP
    { lat: 50.06, lng: 19.94, coreBortle: 7, coreR: 0.06, pop: 780000 },  // Kraków
    { lat: 51.75, lng: 19.46, coreBortle: 7, coreR: 0.06, pop: 670000 },  // Łódź
    { lat: 51.11, lng: 17.04, coreBortle: 7, coreR: 0.05, pop: 640000 },  // Wrocław
    { lat: 52.41, lng: 16.93, coreBortle: 6, coreR: 0.05, pop: 535000 },  // Poznań
    { lat: 54.35, lng: 18.65, coreBortle: 6, coreR: 0.06, pop: 470000 },  // Trójmiasto
    // Średnie miasta
    { lat: 51.25, lng: 22.57, coreBortle: 6, coreR: 0.03, pop: 340000 },  // Lublin
    { lat: 53.13, lng: 23.16, coreBortle: 6, coreR: 0.03, pop: 300000 },  // Białystok
    { lat: 50.87, lng: 20.63, coreBortle: 6, coreR: 0.03, pop: 195000 },  // Kielce
    { lat: 53.02, lng: 18.61, coreBortle: 6, coreR: 0.03, pop: 200000 },  // Bydgoszcz/Toruń
    { lat: 51.40, lng: 21.15, coreBortle: 5, coreR: 0.03, pop: 195000 },  // Radom
    { lat: 53.43, lng: 14.53, coreBortle: 6, coreR: 0.04, pop: 400000 },  // Szczecin
    { lat: 50.29, lng: 18.67, coreBortle: 6, coreR: 0.03, pop: 190000 },  // Gliwice
    { lat: 51.77, lng: 19.46, coreBortle: 5, coreR: 0.02, pop: 100000 },  // Pabianice/Zgierz
    { lat: 52.23, lng: 20.46, coreBortle: 5, coreR: 0.02, pop: 80000 },   // Pruszków/Grodzisk
  ];

  // Ciemne strefy — obniżają Bortle w tych regionach
  const darkZones = [
    { lat: 49.08, lng: 22.60, radius: 0.40, bortle: 1 },  // Bieszczady (najciemniejsze)
    { lat: 49.35, lng: 22.30, radius: 0.25, bortle: 2 },  // Bieszczady (szersze)
    { lat: 54.10, lng: 22.90, radius: 0.35, bortle: 2 },  // Suwalszczyzna
    { lat: 53.70, lng: 18.00, radius: 0.25, bortle: 3 },  // Bory Tucholskie
    { lat: 49.50, lng: 20.00, radius: 0.15, bortle: 3 },  // Gorce/Pieniny
    { lat: 53.80, lng: 20.50, radius: 0.20, bortle: 3 },  // Mazury (wschodnie)
    { lat: 51.00, lng: 23.50, radius: 0.20, bortle: 3 },  // Roztocze
    { lat: 50.70, lng: 22.40, radius: 0.15, bortle: 3 },  // Puszcza Solska
    { lat: 53.50, lng: 23.80, radius: 0.20, bortle: 2 },  // Puszcza Knyszyńska
    { lat: 51.55, lng: 23.50, radius: 0.15, bortle: 3 },  // Poleski Park Narodowy
  ];

  // Bazowy Bortle dla Polski (wiejski/podmiejski) = 4
  let baseBortle = 4;

  // Oblicz wpływ każdego źródła LP
  let totalLightContribution = 0;

  for (const src of sources) {
    const dist = Math.sqrt(
      Math.pow((lat - src.lat) * 111, 2) + // ~111km per degree latitude
      Math.pow((lng - src.lng) * 111 * Math.cos(lat * Math.PI / 180), 2) // skorygowane o szerokość
    ); // dystans w km

    const coreKm = src.coreR * 111;
    // Zasięg poświaty zależy od populacji: ~sqrt(pop) * 0.002 km
    const glowReach = Math.sqrt(src.pop) * 0.04; // np. Warszawa: ~54km, Poznań: ~29km

    if (dist < coreKm) {
      // W samym centrum miasta
      totalLightContribution += src.coreBortle;
    } else if (dist < glowReach) {
      // Spadek liniowy z odległością
      const factor = 1 - (dist - coreKm) / (glowReach - coreKm);
      totalLightContribution += src.coreBortle * factor * 0.6;
    }
  }

  // Przekształć sumę wpływu LP na Bortle
  // Kumulacja światła z wielu miast podnosi Bortle
  let estimatedBortle: number;
  if (totalLightContribution >= 8) estimatedBortle = 8;
  else if (totalLightContribution >= 6.5) estimatedBortle = 7;
  else if (totalLightContribution >= 5) estimatedBortle = 6;
  else if (totalLightContribution >= 3.5) estimatedBortle = 5;
  else if (totalLightContribution >= 1.5) estimatedBortle = 4;
  else if (totalLightContribution >= 0.5) estimatedBortle = 3;
  else estimatedBortle = baseBortle;

  // Jeśli obliczony Bortle jest niższy niż baza, użyj bazy
  estimatedBortle = Math.max(baseBortle, estimatedBortle);

  // Ciemne strefy mogą obniżyć poniżej bazy
  for (const zone of darkZones) {
    const dist = Math.sqrt(
      Math.pow((lat - zone.lat) * 111, 2) +
      Math.pow((lng - zone.lng) * 111 * Math.cos(lat * Math.PI / 180), 2)
    );
    const zoneKm = zone.radius * 111;

    if (dist < zoneKm) {
      // Im bliżej centrum ciemnej strefy, tym ciemniej
      const factor = 1 - dist / zoneKm;
      const darkBortle = zone.bortle + Math.round((estimatedBortle - zone.bortle) * (1 - factor));
      estimatedBortle = Math.min(estimatedBortle, darkBortle);
    }
  }

  // Poza Polską — bazowy Bortle 4 (wiejski europejski)
  const inPoland = lat >= 49 && lat <= 54.9 && lng >= 14 && lng <= 24.2;
  if (!inPoland) {
    // Uproszczona estymacja dla innych krajów — bazowy 4
    estimatedBortle = Math.max(3, Math.min(7, Math.round(totalLightContribution > 0 ? totalLightContribution : 4)));
  }

  return Math.max(1, Math.min(9, estimatedBortle));
}

// =============================================
// Category-specific scoring
// =============================================
function scoreToVerdict(score: number): CategoryScore["verdict"] {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  if (score >= 20) return "poor";
  return "terrible";
}

function calcCategories(
  cloudScore: number,
  seeingScore: number,
  transparencyScore: number,
  humidityScore: number,
  windScore: number,
  bortle: number,
  weather: WeatherData
): AstroConditions["categories"] {
  // ---- WIDEFIELD / SZEROKOKĄTNA ----
  // Zależy głównie od: przejrzystość, chmury, wiatr (krótkie ogniskowe = mniejsze seeing)
  // Bortle mało szkodzi bo duże pole widzenia łapie jasne struktury (Droga Mleczna, zodiacal)
  const wfScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.35 +
    transparencyScore * 0.30 +
    windScore * 0.15 +
    humidityScore * 0.10 +
    seeingScore * 0.10 -
    Math.max(0, (bortle - 4)) * 3 // lekka kara za LP
  )));
  const wfTips: string[] = [];
  if (wfScore >= 60) wfTips.push("Szeroki kąt pola widzenia sprawia, że seeing jest mniej istotny.");
  if (bortle <= 4) wfTips.push("Ciemne niebo — idealne na Drogę Mleczną i krajobraz nocny.");
  if (bortle >= 5 && wfScore >= 40) wfTips.push("Użyj filtra light pollution do krajobrazów nocnych.");
  if (weather.cloudCover > 30 && weather.cloudCover < 70) wfTips.push("Chmury mogą dać ciekawy efekt w landscape astrophoto.");
  if (wfTips.length === 0) wfTips.push("Sprawdź zachmurzenie — to kluczowy czynnik.");

  // ---- DEEP SKY ----
  // Najbardziej wymagająca: potrzebuje doskonałego seeing, przejrzystości, ciemnego nieba
  const bortlePenaltyDS = (bortle - 1) * 7; // 0-56 — bardzo surowa kara
  const dsScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.25 +
    seeingScore * 0.25 +
    transparencyScore * 0.25 +
    humidityScore * 0.10 +
    windScore * 0.15 -
    bortlePenaltyDS
  )));
  const dsTips: string[] = [];
  if (bortle >= 6) dsTips.push("Wysoki Bortle — użyj filtrów narrowband (Ha, OIII, SII).");
  if (bortle >= 6 && dsScore >= 20) dsTips.push("Skup się na jasnych mgławicach emisyjnych (M42, NGC 7000).");
  if (bortle <= 3) dsTips.push("Ciemne niebo! Broadband RGB/LRGB da świetne rezultaty.");
  if (seeingScore < 50) dsTips.push("Słaby seeing — wydłuż ekspozycje, zmniejsz rozdzielczość.");
  if (seeingScore >= 70 && bortle <= 4) dsTips.push("Dobry seeing + ciemne niebo — próbuj galaktyki i mgławice planetarne.");
  if (weather.windSpeed > 15) dsTips.push("Wiatr może powodować drgania — sprawdź prowadzenie.");
  if (dsTips.length === 0) dsTips.push("Warunki korzystne dla deep-sky.");

  // ---- PLANETARY / PLANETY ----
  // Seeing jest KLUCZOWY, Bortle prawie nieistotny (planety są jasne)
  const plScore = Math.max(0, Math.min(100, Math.round(
    seeingScore * 0.45 +
    cloudScore * 0.25 +
    windScore * 0.15 +
    transparencyScore * 0.10 +
    humidityScore * 0.05
    // Brak kary za Bortle!
  )));
  const plTips: string[] = [];
  if (seeingScore >= 70) plTips.push("Dobry seeing — idealne warunki na planety w dużym powiększeniu!");
  if (seeingScore < 40) plTips.push("Słaby seeing — obraz planet będzie \"gotował się\". Skróć ekspozycje.");
  if (seeingScore >= 50 && seeingScore < 70) plTips.push("Przeciętny seeing — nagraj dużo klatek, lucky imaging pomoże.");
  plTips.push("Bortle nie wpływa na fotografie planetarną — planety są jasne.");
  if (weather.windSpeed > 20) plTips.push("Silny wiatr pogorszy seeing na niskich wysokościach.");

  // ---- LUNAR / KSIĘŻYC ----
  // Seeing ważny, ale mniej niż dla planet. Bortle nieistotny. Chmury problemem.
  const lunarScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.35 +
    seeingScore * 0.30 +
    windScore * 0.15 +
    transparencyScore * 0.10 +
    humidityScore * 0.10
    // Brak kary za Bortle
  )));
  const lunarTips: string[] = [];
  if (lunarScore >= 60) lunarTips.push("Księżyc jest jasny — możesz fotografować nawet z miasta.");
  if (seeingScore >= 60) lunarTips.push("Dobry seeing pozwoli uchwycić drobne kratery i rille.");
  if (weather.cloudCover > 0 && weather.cloudCover < 30) lunarTips.push("Pojedyncze chmury mogą dać artystyczny efekt z Księżycem.");
  if (lunarTips.length === 0) lunarTips.push("Standardowe warunki dla obserwacji Księżyca.");

  // ---- VISUAL / OBSERWACJE WIZUALNE ----
  // Mix: chmury najważniejsze, potem seeing, Bortle umiarkowanie ważny
  const visBortlePenalty = (bortle - 1) * 4;
  const visScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.35 +
    seeingScore * 0.20 +
    transparencyScore * 0.20 +
    humidityScore * 0.10 +
    windScore * 0.15 -
    visBortlePenalty
  )));
  const visTips: string[] = [];
  if (bortle <= 3) visTips.push("Ciemne niebo — gołym okiem zobaczysz Drogę Mleczną!");
  if (bortle >= 5 && bortle <= 6) visTips.push("Użyj lornetki 10x50 — poprawi kontrast obiektów.");
  if (bortle >= 7) visTips.push("Miasto — ogranicz się do planet, Księżyca i jasnych gromad.");
  if (weather.temperature < 0) visTips.push("Mróz — ubierz się ciepło, baterie tracą pojemność!");
  if (visTips.length === 0) visTips.push("Dobre warunki do obserwacji wizualnych.");

  return {
    widefield: {
      score: wfScore,
      verdict: scoreToVerdict(wfScore),
      label: "Szerokokątna / Krajobraz",
      icon: "🌌",
      tips: wfTips,
    },
    deepsky: {
      score: dsScore,
      verdict: scoreToVerdict(dsScore),
      label: "Deep Sky",
      icon: "🔭",
      tips: dsTips,
    },
    planetary: {
      score: plScore,
      verdict: scoreToVerdict(plScore),
      label: "Planety",
      icon: "🪐",
      tips: plTips,
    },
    lunar: {
      score: lunarScore,
      verdict: scoreToVerdict(lunarScore),
      label: "Księżyc",
      icon: "🌙",
      tips: lunarTips,
    },
    visual: {
      score: visScore,
      verdict: scoreToVerdict(visScore),
      label: "Obserwacje wizualne",
      icon: "👁️",
      tips: visTips,
    },
  };
}

// =============================================
// Analyze conditions
// =============================================
function analyzeConditions(
  weather: WeatherData,
  forecast: ForecastHour[],
  bortle: number
): AstroConditions {
  // Cloud score (0-100, 100 = clear)
  const cloudScore = Math.max(0, 100 - weather.cloudCover);

  // Humidity score (ideal: 30-60%)
  const humidityScore =
    weather.humidity < 30
      ? 90
      : weather.humidity < 50
      ? 100
      : weather.humidity < 70
      ? 70
      : weather.humidity < 85
      ? 40
      : 10;

  // Wind score (ideal: < 15 km/h)
  const windScore =
    weather.windSpeed < 5
      ? 100
      : weather.windSpeed < 10
      ? 90
      : weather.windSpeed < 20
      ? 70
      : weather.windSpeed < 30
      ? 40
      : 10;

  // Seeing score (based on wind + humidity + temp-dewpoint spread)
  const tempDewSpread = Math.abs(weather.temperature - weather.dewPoint);
  const seeingScore = Math.min(
    100,
    Math.round(
      windScore * 0.4 +
        (tempDewSpread > 5 ? 80 : tempDewSpread * 16) * 0.3 +
        humidityScore * 0.3
    )
  );

  // Transparency score (based on humidity, visibility, precipitation)
  const visScore = Math.min(100, (weather.visibility / 50) * 100);
  const precipScore = weather.precipitation === 0 ? 100 : 0;
  const transparencyScore = Math.round(
    visScore * 0.4 + humidityScore * 0.3 + precipScore * 0.3
  );

  // Bortle penalty
  const bortlePenalty = (bortle - 1) * 5; // 0-40

  // Overall score
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        cloudScore * 0.35 +
          seeingScore * 0.2 +
          transparencyScore * 0.2 +
          humidityScore * 0.1 +
          windScore * 0.15 -
          bortlePenalty
      )
    )
  );

  // Verdict
  let verdict: AstroConditions["verdict"];
  if (overallScore >= 80) verdict = "excellent";
  else if (overallScore >= 60) verdict = "good";
  else if (overallScore >= 40) verdict = "fair";
  else if (overallScore >= 20) verdict = "poor";
  else verdict = "terrible";

  // Recommendations
  const recommendations: string[] = [];
  if (weather.cloudCover > 70)
    recommendations.push("Zachmurzenie zbyt duże — poczekaj na przejaśnienie.");
  if (weather.cloudCover > 30 && weather.cloudCover <= 70)
    recommendations.push("Częściowe zachmurzenie — szukaj przerw między chmurami.");
  if (weather.humidity > 80)
    recommendations.push("Wysoka wilgotność — ryzyko rosy na optyce. Użyj osuszacza.");
  if (weather.windSpeed > 20)
    recommendations.push("Silny wiatr — stabilizuj montaż, skróć ekspozycje.");
  if (tempDewSpread < 3)
    recommendations.push("Mała różnica temp./punkt rosy — mgła możliwa. Użyj grzałki na obiektyw.");
  if (bortle >= 6)
    recommendations.push("Duże zanieczyszczenie świetlne — użyj filtrów LP lub narrowband.");
  if (bortle <= 3 && weather.cloudCover < 20)
    recommendations.push("Doskonałe ciemne niebo! Wykorzystaj na obiekty deep-sky.");
  if (weather.precipitation > 0)
    recommendations.push("Opady — obserwacje niemożliwe. Poczekaj na poprawę.");
  if (recommendations.length === 0)
    recommendations.push("Warunki sprzyjające obserwacjom! Wykorzystaj tę noc. 🌟");

  // Best hours (find hours with lowest cloud cover in next 24h)
  const nightHours = forecast.filter((h) => {
    const hour = new Date(h.time).getHours();
    return hour >= 20 || hour <= 5;
  });
  const bestHours = nightHours
    .sort((a, b) => a.cloudCover - b.cloudCover)
    .slice(0, 3)
    .map((h) => {
      const d = new Date(h.time);
      return `${d.getHours().toString().padStart(2, "0")}:00 (chmury: ${h.cloudCover}%)`;
    });

  // Visible objects based on Bortle
  const visibleObjects: string[] = [];
  if (bortle <= 2) {
    visibleObjects.push(
      "Droga Mleczna (pełna)", "Zodiacal light", "Galaktyki (M31, M33, M81)",
      "Mgławice (M42, M8, M16, M17)", "Gromady kuliste (M13, M22)", "Komety (jasne)"
    );
  } else if (bortle <= 4) {
    visibleObjects.push(
      "Droga Mleczna (widoczna)", "M31 (Andromeda)", "M42 (Orion)",
      "Gromady otwarte (Plejady, Hyady)", "M13 (Herkules)", "Planety"
    );
  } else if (bortle <= 6) {
    visibleObjects.push(
      "M42 (z lornetką)", "Plejady", "Planety (Jowisz, Saturn, Mars, Wenus)",
      "Księżyc", "Jasne gwiazdy podwójne", "Jasne gromady"
    );
  } else {
    visibleObjects.push(
      "Planety", "Księżyc", "Najjaśniejsze gwiazdy",
      "ISS / satelity", "Jasne komety (rzadko)"
    );
  }

  return {
    overallScore,
    seeingScore,
    transparencyScore,
    cloudScore,
    humidityScore,
    windScore,
    bortleEstimate: bortle,
    verdict,
    recommendations,
    bestHours,
    visibleObjects,
    categories: calcCategories(cloudScore, seeingScore, transparencyScore, humidityScore, windScore, bortle, weather),
  };
}

// =============================================
// Score ring component
// =============================================
function ScoreRing({
  score,
  size = 120,
  label,
}: {
  score: number;
  size?: number;
  label: string;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
      ? "#3b82f6"
      : score >= 40
      ? "#f59e0b"
      : score >= 20
      ? "#f97316"
      : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl font-bold text-night-100">{score}</span>
        <span className="text-[10px] text-night-500 uppercase tracking-wider">
          /100
        </span>
      </div>
      <span className="text-xs text-night-400 font-medium">{label}</span>
    </div>
  );
}

// =============================================
// Mini score bar
// =============================================
function MiniScore({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: string;
}) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-blue-500"
      : score >= 40
      ? "bg-yellow-500"
      : score >= 20
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-night-400">
          {icon} {label}
        </span>
        <span className="text-night-300 font-medium">{score}/100</span>
      </div>
      <div className="h-1.5 bg-night-800 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// =============================================
// Verdict config
// =============================================
const VERDICT_CONFIG = {
  excellent: {
    label: "Doskonałe",
    emoji: "🌟",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    desc: "Idealne warunki do obserwacji i astrofotografii!",
  },
  good: {
    label: "Dobre",
    emoji: "👍",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    desc: "Dobre warunki — warto wyjść z teleskopem.",
  },
  fair: {
    label: "Przeciętne",
    emoji: "🤔",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    desc: "Możliwe obserwacje, ale z ograniczeniami.",
  },
  poor: {
    label: "Słabe",
    emoji: "😕",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    desc: "Słabe warunki — lepiej poczekać na poprawę.",
  },
  terrible: {
    label: "Beznadziejne",
    emoji: "🌧️",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    desc: "Obserwacje niemożliwe. Czas na processing zdjęć!",
  },
};

// =============================================
// Main Page Component
// =============================================
export default function WeatherPage() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastHour[]>([]);
  const [conditions, setConditions] = useState<AstroConditions | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Geocoding search (Open-Meteo Geocoding API — free, no key)
  const searchLocations = useCallback(async (q: string) => {
    if (q.length < 2) {
      setLocations([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=pl&format=json`
      );
      const data = await res.json();
      if (data.results) {
        setLocations(
          data.results.map((r: any) => ({
            name: r.name,
            country: r.country || "",
            admin1: r.admin1 || "",
            lat: r.latitude,
            lng: r.longitude,
          }))
        );
        setShowDropdown(true);
      } else {
        setLocations([]);
      }
    } catch {
      setLocations([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchLocations(value), 400);
  };

  // Fetch weather for location
  const fetchWeather = useCallback(async (loc: LocationResult) => {
    setIsLoading(true);
    setError("");
    setWeather(null);
    setConditions(null);
    setSelectedLocation(loc);
    setShowDropdown(false);
    setQuery(loc.name);

    // Check cache
    // Cache key z precyzją 1 miejsca (~11km) — bliscy sąsiedzi trafią w ten sam cache
    // Open-Meteo i tak interpoluje do siatki ~11km, więc wyższa precyzja nie ma sensu
    const cacheKey = `astrofor-weather-${loc.lat.toFixed(1)}-${loc.lng.toFixed(1)}`;
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(cacheKey + "-time");

    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 10 * 60 * 1000) {
      // Use cache (10 min — pogoda zmienia się szybko)
      const parsed = JSON.parse(cached);
      setWeather(parsed.weather);
      setForecast(parsed.forecast);
      const bortle = estimateBortle(loc.lat, loc.lng);
      setConditions(analyzeConditions(parsed.weather, parsed.forecast, bortle));
      setIsLoading(false);
      return;
    }

    try {
      // Open-Meteo API (free, no key required)
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}` +
          `&current=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,visibility,dew_point_2m,precipitation,is_day` +
          `&hourly=cloud_cover,relative_humidity_2m,temperature_2m,wind_speed_10m,visibility,precipitation` +
          `&forecast_days=2&timezone=auto`
      );

      if (!res.ok) throw new Error("Błąd pobierania danych pogodowych");

      const data = await res.json();

      const weatherData: WeatherData = {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        cloudCover: data.current.cloud_cover,
        windSpeed: data.current.wind_speed_10m,
        visibility: (data.current.visibility || 10000) / 1000, // m -> km
        dewPoint: data.current.dew_point_2m,
        precipitation: data.current.precipitation,
        isDay: data.current.is_day === 1,
      };

      // Next 48h forecast
      const forecastData: ForecastHour[] = data.hourly.time
        .slice(0, 48)
        .map((time: string, i: number) => ({
          time,
          cloudCover: data.hourly.cloud_cover[i],
          humidity: data.hourly.relative_humidity_2m[i],
          temperature: data.hourly.temperature_2m[i],
          windSpeed: data.hourly.wind_speed_10m[i],
          visibility: (data.hourly.visibility?.[i] || 10000) / 1000,
          precipitation: data.hourly.precipitation[i],
        }));

      setWeather(weatherData);
      setForecast(forecastData);

      // Estimate Bortle + analyze
      const bortle = estimateBortle(loc.lat, loc.lng);
      const analysis = analyzeConditions(weatherData, forecastData, bortle);
      setConditions(analysis);

      // Cache
      sessionStorage.setItem(cacheKey, JSON.stringify({ weather: weatherData, forecast: forecastData }));
      sessionStorage.setItem(cacheKey + "-time", String(Date.now()));
    } catch (err) {
      setError("Nie udało się pobrać danych pogodowych. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obsługa Enter — wyszukaj i załaduj pierwszy wynik
  const handleSearchSubmit = useCallback(async () => {
    if (!query || query.length < 2) return;
    setIsSearching(true);
    setShowDropdown(false);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pl&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        const loc: LocationResult = {
          name: r.name,
          country: r.country || "",
          admin1: r.admin1 || "",
          lat: r.latitude,
          lng: r.longitude,
        };
        fetchWeather(loc);
      } else {
        setError("Nie znaleziono miejscowości. Spróbuj innej nazwy.");
      }
    } catch {
      setError("Błąd wyszukiwania. Sprawdź połączenie z internetem.");
    } finally {
      setIsSearching(false);
    }
  }, [query, fetchWeather]);

  // Geolocation
  const useMyLocation = useCallback(() => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolokalizacja nie jest dostępna w tej przeglądarce.");
      return;
    }

    // Sprawdź cache lokalizacji (stałe współrzędne na sesję)
    const cachedGeo = sessionStorage.getItem("astrofor-geo-coords");
    if (cachedGeo) {
      try {
        const { lat, lng, name, country } = JSON.parse(cachedGeo);
        const loc: LocationResult = { name, country: country || "", lat, lng };
        fetchWeather(loc);
        return;
      } catch {
        sessionStorage.removeItem("astrofor-geo-coords");
      }
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Użyj pełnej precyzji z GPS/przeglądarki
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy; // w metrach

        // Reverse geocoding z Nominatim (OpenStreetMap) — prawdziwy reverse geocoder
        let name = "Twoja lokalizacja";
        let country = "";
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=pl`,
            { headers: { "User-Agent": "Astrofor/1.0" } }
          );
          const geoData = await geoRes.json();
          if (geoData.address) {
            const addr = geoData.address;
            name = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || "Twoja lokalizacja";
            country = addr.country || "";
          }
        } catch {
          // Ignore — use default name
        }

        // Cache współrzędne na czas sesji
        sessionStorage.setItem("astrofor-geo-coords", JSON.stringify({ lat, lng, name, country }));

        const loc: LocationResult = {
          name: accuracy > 1000 ? `${name} (±${Math.round(accuracy / 1000)} km)` : name,
          country,
          lat,
          lng,
        };
        fetchWeather(loc);
      },
      (geoError) => {
        let msg = "Nie udało się pobrać lokalizacji.";
        if (geoError.code === 1) {
          msg = "Odmowa dostępu do lokalizacji. Zezwól w ustawieniach przeglądarki (kłódka obok URL).";
        } else if (geoError.code === 2) {
          msg = "Pozycja niedostępna. Sprawdź czy GPS jest włączony.";
        } else if (geoError.code === 3) {
          msg = "Czas oczekiwania na lokalizację minął. Spróbuj ponownie.";
        }
        setError(msg);
        setIsLoading(false);
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 300000 }
    );
  }, [fetchWeather]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-night-100 mb-3 flex items-center justify-center gap-3">
          <HiOutlineSparkles className="h-8 w-8 text-cosmos-400" />
          Warunki Obserwacyjne
        </h1>
        <p className="text-night-400 max-w-2xl mx-auto">
          Wskaż lokalizację, a ocenimy warunki astronomiczne na podstawie aktualnej pogody,
          zachmurzenia, wilgotności i zanieczyszczenia świetlnego.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div ref={dropdownRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-night-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Jeśli dropdown jest otwarty i ma wyniki — wybierz pierwszy
                    if (showDropdown && locations.length > 0) {
                      fetchWeather(locations[0]);
                    } else {
                      handleSearchSubmit();
                    }
                  }
                }}
                onFocus={() => locations.length > 0 && setShowDropdown(true)}
                placeholder="Wpisz nazwę miejscowości..."
                className="input-field pl-10 w-full"
                style={{ fontSize: "16px" }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <HiOutlineArrowPath className="h-4 w-4 text-night-500 animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={isLoading || !query || query.length < 2}
              className="btn-primary flex items-center gap-2 shrink-0 disabled:opacity-50"
              title="Szukaj"
            >
              <HiOutlineMagnifyingGlass className="h-5 w-5" />
              <span className="hidden sm:inline">Szukaj</span>
            </button>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={isLoading}
              className="btn-secondary flex items-center gap-2 shrink-0 disabled:opacity-50"
              title="Użyj mojej lokalizacji"
            >
              <HiOutlineMapPin className="h-5 w-5" />
              <span className="hidden sm:inline">Moja lokalizacja</span>
            </button>
          </div>

          {/* Dropdown results */}
          {showDropdown && locations.length > 0 && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-night-700 bg-night-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {locations.map((loc, i) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${i}`}
                  onClick={() => fetchWeather(loc)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-night-800/50 transition-colors border-b border-night-800 last:border-0"
                >
                  <HiOutlineMapPin className="h-4 w-4 text-cosmos-400 shrink-0" />
                  <div>
                    <span className="text-sm text-night-200 font-medium">
                      {loc.name}
                    </span>
                    {(loc.admin1 || loc.country) && (
                      <span className="text-xs text-night-500 ml-2">
                        {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
          <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin text-4xl mb-4">🌍</div>
          <p className="text-night-400 text-sm">Analizuję warunki obserwacyjne...</p>
        </div>
      )}

      {/* Results */}
      {conditions && weather && selectedLocation && !isLoading && (
        <div className="space-y-6">
          {/* Location header */}
          <div className="flex items-center gap-2 text-sm text-night-400">
            <HiOutlineMapPin className="h-4 w-4 text-cosmos-400" />
            <span>
              {selectedLocation.name}
              {selectedLocation.admin1 && `, ${selectedLocation.admin1}`}
              {selectedLocation.country && ` (${selectedLocation.country})`}
            </span>
            <span className="text-night-600">•</span>
            <span>{selectedLocation.lat.toFixed(2)}°N, {selectedLocation.lng.toFixed(2)}°E</span>
            <span className="text-night-600">•</span>
            <span className="text-night-500 text-xs">Open-Meteo</span>
            <span className="text-night-600">•</span>
            <span className="flex items-center gap-1">
              {weather.isDay ? (
                <HiOutlineSun className="h-3.5 w-3.5 text-yellow-400" />
              ) : (
                <HiOutlineMoon className="h-3.5 w-3.5 text-blue-400" />
              )}
              {weather.isDay ? "Dzień" : "Noc"}
            </span>
          </div>

          {/* Main verdict card */}
          <div
            className={clsx(
              "glass-card rounded-2xl border p-6 md:p-8",
              VERDICT_CONFIG[conditions.verdict].bg
            )}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Score ring */}
              <div className="relative">
                <ScoreRing score={conditions.overallScore} size={140} label="" />
              </div>

              {/* Verdict info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-3xl">{VERDICT_CONFIG[conditions.verdict].emoji}</span>
                  <h2
                    className={clsx(
                      "text-2xl font-bold",
                      VERDICT_CONFIG[conditions.verdict].color
                    )}
                  >
                    {VERDICT_CONFIG[conditions.verdict].label}
                  </h2>
                </div>
                <p className="text-night-400 text-sm mb-3">
                  {VERDICT_CONFIG[conditions.verdict].desc}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-night-500">
                  <span className="flex items-center gap-1">
                    🌡️ {weather.temperature}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineCloud className="h-3.5 w-3.5" />
                    Chmury: {weather.cloudCover}%
                  </span>
                  <span className="flex items-center gap-1">
                    💧 Wilg.: {weather.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    💨 Wiatr: {weather.windSpeed} km/h
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineEye className="h-3.5 w-3.5" />
                    Widoczność: {weather.visibility.toFixed(0)} km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score breakdown */}
            <div className="glass-card rounded-xl border border-night-700 p-5">
              <h3 className="text-sm font-bold text-night-200 mb-4 flex items-center gap-2">
                <HiOutlineSparkles className="h-4 w-4 text-cosmos-400" />
                Szczegółowa Ocena
              </h3>
              <div className="space-y-3">
                <MiniScore label="Zachmurzenie" score={conditions.cloudScore} icon="☁️" />
                <MiniScore label="Seeing" score={conditions.seeingScore} icon="👁️" />
                <MiniScore label="Przejrzystość" score={conditions.transparencyScore} icon="✨" />
                <MiniScore label="Wilgotność" score={conditions.humidityScore} icon="💧" />
                <MiniScore label="Wiatr" score={conditions.windScore} icon="💨" />
              </div>
            </div>

            {/* Bortle + Light pollution */}
            <div className="glass-card rounded-xl border border-night-700 p-5">
              <h3 className="text-sm font-bold text-night-200 mb-4 flex items-center gap-2">
                🌑 Zanieczyszczenie Świetlne
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor:
                      conditions.bortleEstimate <= 2
                        ? "rgba(0,0,0,0.6)"
                        : conditions.bortleEstimate <= 4
                        ? "rgba(15,52,96,0.6)"
                        : conditions.bortleEstimate <= 6
                        ? "rgba(83,52,131,0.4)"
                        : "rgba(255,165,0,0.3)",
                    color:
                      conditions.bortleEstimate <= 3
                        ? "#60a5fa"
                        : conditions.bortleEstimate <= 5
                        ? "#a855f7"
                        : "#fbbf24",
                  }}
                >
                  {conditions.bortleEstimate}
                </div>
                <div>
                  <p className="text-night-200 font-semibold">
                    Bortle {conditions.bortleEstimate}
                  </p>
                  <p className="text-xs text-night-400">
                    {BORTLE_SCALE_LABELS[conditions.bortleEstimate]}
                  </p>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-night-400 uppercase tracking-wider mb-2">
                Widoczne obiekty przy tym Bortle:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {conditions.visibleObjects.map((obj) => (
                  <span
                    key={obj}
                    className="text-[11px] bg-night-800 text-night-400 px-2 py-1 rounded"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Category scores */}
          <div className="glass-card rounded-xl border border-night-700 p-5">
            <h3 className="text-sm font-bold text-night-200 mb-4 flex items-center gap-2">
              📊 Ocena wg Kategorii
            </h3>
            <p className="text-xs text-night-500 mb-4">
              Warunki mogą być dobre dla jednego typu obserwacji, a słabe dla innego.
              Poniżej ocena dla każdej kategorii.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.values(conditions.categories).map((cat) => {
                const verdictColor =
                  cat.verdict === "excellent"
                    ? "border-green-500/40 bg-green-500/5"
                    : cat.verdict === "good"
                    ? "border-blue-500/40 bg-blue-500/5"
                    : cat.verdict === "fair"
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : cat.verdict === "poor"
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-red-500/40 bg-red-500/5";
                const scoreColor =
                  cat.score >= 80
                    ? "text-green-400"
                    : cat.score >= 60
                    ? "text-blue-400"
                    : cat.score >= 40
                    ? "text-yellow-400"
                    : cat.score >= 20
                    ? "text-orange-400"
                    : "text-red-400";
                const verdictLabel = VERDICT_CONFIG[cat.verdict].label;

                return (
                  <div
                    key={cat.label}
                    className={clsx(
                      "rounded-lg border p-4 transition-colors",
                      verdictColor
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-semibold text-night-200">
                          {cat.label}
                        </span>
                      </div>
                      <span className={clsx("text-lg font-bold", scoreColor)}>
                        {cat.score}
                      </span>
                    </div>

                    {/* Mini bar */}
                    <div className="h-1.5 bg-night-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-700",
                          cat.score >= 80
                            ? "bg-green-500"
                            : cat.score >= 60
                            ? "bg-blue-500"
                            : cat.score >= 40
                            ? "bg-yellow-500"
                            : cat.score >= 20
                            ? "bg-orange-500"
                            : "bg-red-500"
                        )}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    <span className={clsx("text-[10px] font-medium uppercase tracking-wider", scoreColor)}>
                      {verdictLabel}
                    </span>

                    {/* Tips */}
                    <div className="mt-2 space-y-1">
                      {cat.tips.slice(0, 2).map((tip, i) => (
                        <p key={i} className="text-[11px] text-night-400 leading-tight">
                          • {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card rounded-xl border border-night-700 p-5">
            <h3 className="text-sm font-bold text-night-200 mb-3 flex items-center gap-2">
              <HiOutlineInformationCircle className="h-4 w-4 text-cosmos-400" />
              Rekomendacje
            </h3>
            <div className="space-y-2">
              {conditions.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {conditions.overallScore >= 60 ? (
                    <HiOutlineCheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <HiOutlineExclamationTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-night-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best hours */}
          {conditions.bestHours.length > 0 && (
            <div className="glass-card rounded-xl border border-night-700 p-5">
              <h3 className="text-sm font-bold text-night-200 mb-3 flex items-center gap-2">
                <HiOutlineMoon className="h-4 w-4 text-blue-400" />
                Najlepsze godziny (następna noc)
              </h3>
              <div className="flex flex-wrap gap-2">
                {conditions.bestHours.map((hour, i) => (
                  <span
                    key={i}
                    className="text-sm bg-night-800 text-night-300 px-3 py-1.5 rounded-lg border border-night-700"
                  >
                    🕐 {hour}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 24h cloud forecast mini chart */}
          <div className="glass-card rounded-xl border border-night-700 p-5">
            <h3 className="text-sm font-bold text-night-200 mb-4 flex items-center gap-2">
              <HiOutlineCloud className="h-4 w-4 text-night-400" />
              Prognoza zachmurzenia (48h)
            </h3>
            <div className="flex items-end gap-[2px] h-24">
              {forecast.slice(0, 48).map((h, i) => {
                const hour = new Date(h.time).getHours();
                const isNight = hour >= 20 || hour <= 5;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all group relative"
                    style={{
                      height: `${Math.max(4, h.cloudCover)}%`,
                      backgroundColor: isNight
                        ? h.cloudCover < 30
                          ? "rgba(34,197,94,0.6)"
                          : h.cloudCover < 60
                          ? "rgba(59,130,246,0.5)"
                          : "rgba(239,68,68,0.5)"
                        : "rgba(255,255,255,0.1)",
                    }}
                    title={`${new Date(h.time).getHours()}:00 — chmury: ${h.cloudCover}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-night-600 mt-1">
              <span>Teraz</span>
              <span>+12h</span>
              <span>+24h</span>
              <span>+36h</span>
              <span>+48h</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-night-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-green-500/60" /> Czyste (noc)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-blue-500/50" /> Częściowe (noc)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-red-500/50" /> Zachmurzone (noc)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-white/10" /> Dzień
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-night-600">
            Dane pogodowe: Open-Meteo API • Skala Bortle: estymacja na podstawie lokalizacji •
            Ocena warunków ma charakter orientacyjny
          </p>
        </div>
      )}

      {/* Empty state */}
      {!conditions && !isLoading && !error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔭</div>
          <h2 className="text-xl font-bold text-night-200 mb-2">
            Sprawdź warunki obserwacyjne
          </h2>
          <p className="text-night-400 text-sm max-w-md mx-auto">
            Wpisz nazwę miejscowości lub użyj geolokalizacji, aby sprawdzić
            aktualne warunki pogodowe i ocenić jakość nieba do obserwacji
            astronomicznych.
          </p>
        </div>
      )}
    </div>
  );
}
