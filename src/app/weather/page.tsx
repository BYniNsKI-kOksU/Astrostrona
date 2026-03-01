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
  cloudCoverLow: number;    // chmury niskie (0-3 km) — KLUCZOWE
  cloudCoverMid: number;    // chmury średnie (3-8 km)
  cloudCoverHigh: number;   // chmury wysokie (>8 km) — najmniej szkodliwe
  windSpeed: number;
  windGusts: number;        // podmuchy wiatru
  visibility: number; // km
  dewPoint: number;
  precipitation: number;
  isDay: boolean;
}

interface ForecastHour {
  time: string;
  cloudCover: number;
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;
  humidity: number;
  temperature: number;
  windSpeed: number;
  windGusts: number;
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
  evalSource: "current" | "night-forecast" | "blended-forecast";
  evalCloudLow: number;
  evalCloudMid: number;
  evalCloudHigh: number;
  evalHumidity: number;
  sunAltitude: number; // kąt słońca nad horyzontem
  twilightLabel: string; // etykieta pory dnia
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
    { lat: 52.25, lng: 17.10, coreBortle: 5, coreR: 0.02, pop: 25000 },   // Kórnik
    { lat: 52.46, lng: 16.82, coreBortle: 5, coreR: 0.02, pop: 20000 },   // Oborniki
    { lat: 52.20, lng: 16.60, coreBortle: 5, coreR: 0.02, pop: 30000 },   // Kościan
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
  // UWAGA: Używamy logiki „najsilniejsze źródło + skyglow" zamiast prostej sumy
  // Bo suma małe miasto (Bortle 5) + poświata Poznania dawała Bortle 6 dla Kórnika (realne: 5)
  let maxCoreBortle = 0; // Bortle najbliższego rdzenia miasta
  let totalGlowContribution = 0; // Skumulowana poświata z odległych miast

  for (const src of sources) {
    const dist = Math.sqrt(
      Math.pow((lat - src.lat) * 111, 2) + // ~111km per degree latitude
      Math.pow((lng - src.lng) * 111 * Math.cos(lat * Math.PI / 180), 2) // skorygowane o szerokość
    ); // dystans w km

    const coreKm = src.coreR * 111;
    // Zasięg poświaty zależy od populacji: ~sqrt(pop) * 0.04 km
    const glowReach = Math.sqrt(src.pop) * 0.04; // np. Warszawa: ~54km, Poznań: ~29km

    if (dist < coreKm) {
      // W samym centrum miasta — bierz maksimum (nie sumuj!)
      maxCoreBortle = Math.max(maxCoreBortle, src.coreBortle);
    } else if (dist < glowReach) {
      // Poświata spada liniowo z odległością — te się sumują (lekko)
      const factor = 1 - (dist - coreKm) / (glowReach - coreKm);
      totalGlowContribution += src.coreBortle * factor * 0.3; // zmniejszony mnożnik (0.3 zamiast 0.6)
    }
  }

  // Przekształć na Bortle:
  // Bierz max z: coreBortle (jeśli jesteśmy w rdzeniu) ALBO base + glow
  let estimatedBortle: number;
  
  if (maxCoreBortle > 0) {
    // Jesteśmy w rdzeniu jakiegoś miasta — użyj core Bortle
    // Poświata z dalszych miast może dodać max +1
    const glowBonus = totalGlowContribution >= 2 ? 1 : 0;
    estimatedBortle = Math.min(9, maxCoreBortle + glowBonus);
  } else {
    // Poza rdzeniami miast — bazowy + poświata
    if (totalGlowContribution >= 5) estimatedBortle = 7;
    else if (totalGlowContribution >= 3) estimatedBortle = 6;
    else if (totalGlowContribution >= 1.5) estimatedBortle = 5;
    else if (totalGlowContribution >= 0.5) estimatedBortle = 4;
    else estimatedBortle = baseBortle;
    
    estimatedBortle = Math.max(baseBortle, estimatedBortle);
  }

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
    estimatedBortle = Math.max(3, Math.min(7, Math.round(totalGlowContribution > 0 ? totalGlowContribution + 3 : maxCoreBortle > 0 ? maxCoreBortle : 4)));
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
  weather: WeatherData,
  moonIllumination: number
): AstroConditions["categories"] {
  // ---- WIDEFIELD / SZEROKOKĄTNA ----
  // Zależy głównie od: przejrzystość, chmury, wiatr (krótkie ogniskowe = mniejsze seeing)
  // Bortle mało szkodzi bo duże pole widzenia łapie jasne struktury (Droga Mleczna, zodiacal)
  // Księżyc — umiarkowana kara (jasny Księżyc wymywa Drogę Mleczną)
  const moonPenaltyWF = moonIllumination > 90 ? 30
    : moonIllumination > 75 ? 20
    : moonIllumination > 50 ? 10
    : moonIllumination > 25 ? 3
    : 0;
  const wfScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.35 +
    transparencyScore * 0.30 +
    windScore * 0.15 +
    humidityScore * 0.10 +
    seeingScore * 0.10 -
    Math.max(0, (bortle - 4)) * 3 - // lekka kara za LP
    moonPenaltyWF
  )));
  const wfTips: string[] = [];
  if (wfScore >= 60) wfTips.push("Szeroki kąt pola widzenia sprawia, że seeing jest mniej istotny.");
  if (bortle <= 4 && moonIllumination < 30) wfTips.push("Ciemne niebo + brak Księżyca — idealne na Drogę Mleczną i krajobraz nocny.");
  if (moonIllumination > 75) wfTips.push(`Księżyc ${moonIllumination}% — Droga Mleczna będzie słabo widoczna.`);
  if (bortle >= 5 && wfScore >= 40) wfTips.push("Użyj filtra light pollution do krajobrazów nocnych.");
  if (weather.cloudCover > 30 && weather.cloudCover < 70) wfTips.push("Chmury mogą dać ciekawy efekt w landscape astrophoto.");
  if (wfTips.length === 0) wfTips.push("Sprawdź zachmurzenie — to kluczowy czynnik.");

  // ---- DEEP SKY ----
  // Najbardziej wymagająca: potrzebuje doskonałego seeing, przejrzystości, ciemnego nieba
  // PLUS: faza Księżyca >90% = kara min 50 punktów!
  const bortlePenaltyDS = (bortle - 1) * 7; // 0-56 — bardzo surowa kara
  // Kara za Księżyc: >90% = -50, >75% = -35, >50% = -20, >25% = -8
  const moonPenaltyDS = moonIllumination > 90 ? 50
    : moonIllumination > 75 ? 35
    : moonIllumination > 50 ? 20
    : moonIllumination > 25 ? 8
    : 0;
  const dsScore = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.25 +
    seeingScore * 0.25 +
    transparencyScore * 0.25 +
    humidityScore * 0.10 +
    windScore * 0.15 -
    bortlePenaltyDS -
    moonPenaltyDS
  )));
  const dsTips: string[] = [];
  if (moonIllumination > 75) dsTips.push(`Księżyc ${moonIllumination}% — obiekty DSO będą "wymyte". Użyj filtrów narrowband (Ha, OIII).`);
  if (bortle >= 6) dsTips.push("Wysoki Bortle — użyj filtrów narrowband (Ha, OIII, SII).");
  if (bortle >= 6 && dsScore >= 20) dsTips.push("Skup się na jasnych mgławicach emisyjnych (M42, NGC 7000).");
  if (bortle <= 3 && moonIllumination < 30) dsTips.push("Ciemne niebo + brak Księżyca! Broadband RGB/LRGB da świetne rezultaty.");
  if (seeingScore < 50) dsTips.push("Słaby seeing — wydłuż ekspozycje, zmniejsz rozdzielczość.");
  if (seeingScore >= 70 && bortle <= 4 && moonIllumination < 40) dsTips.push("Dobry seeing + ciemne niebo — próbuj galaktyki i mgławice planetarne.");
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
  // Mix: chmury najważniejsze, potem seeing, Bortle umiarkowanie ważny, Księżyc przeszkadza
  const visBortlePenalty = (bortle - 1) * 4;
  const moonPenaltyVis = moonIllumination > 90 ? 25
    : moonIllumination > 75 ? 15
    : moonIllumination > 50 ? 8
    : 0;
  const visScoreCalc = Math.max(0, Math.min(100, Math.round(
    cloudScore * 0.35 +
    seeingScore * 0.20 +
    transparencyScore * 0.20 +
    humidityScore * 0.10 +
    windScore * 0.15 -
    visBortlePenalty -
    moonPenaltyVis
  )));
  const visTips: string[] = [];
  if (bortle <= 3 && moonIllumination < 30) visTips.push("Ciemne niebo + brak Księżyca — gołym okiem zobaczysz Drogę Mleczną!");
  if (moonIllumination > 75) visTips.push(`Księżyc ${moonIllumination}% — ogranicz obserwacje do jasnych obiektów.`);
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
      score: visScoreCalc,
      verdict: scoreToVerdict(visScoreCalc),
      label: "Obserwacje wizualne",
      icon: "👁️",
      tips: visTips,
    },
  };
}

// =============================================
// Moon phase calculation (simplified)
// =============================================
function getMoonPhase(): { phase: number; illumination: number; name: string } {
  // Obliczamy fazę Księżyca algorytmem Conwaya
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  let r = year % 100;
  r = r % 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= (year < 2000 ? 4 : 8.3);
  r = Math.floor(r + 0.5) % 30;
  if (r < 0) r += 30;

  // r jest teraz dniem cyklu księżycowego (0 = nów, 15 = pełnia)
  // Illumination: 0% przy nowiu, 100% przy pełni
  const illumination = Math.round(
    (1 - Math.cos((r / 29.53) * 2 * Math.PI)) / 2 * 100
  );

  let name = "Nów";
  if (r >= 1 && r < 7) name = "Przybywający sierp";
  else if (r >= 7 && r < 9) name = "Pierwsza kwadra";
  else if (r >= 9 && r < 14) name = "Przybywający garb";
  else if (r >= 14 && r < 16) name = "Pełnia";
  else if (r >= 16 && r < 22) name = "Ubywający garb";
  else if (r >= 22 && r < 24) name = "Trzecia kwadra";
  else if (r >= 24) name = "Ubywający sierp";

  return { phase: r, illumination, name };
}

// =============================================
// Estimate Jet Stream impact from wind speed at surface
// W rzeczywistości potrzebowalibyśmy danych z wyższych warstw atm.,
// ale aproksymujemy: silny wiatr przy powierzchni koreluje z Jet Streamem
// =============================================
function estimateJetStreamPenalty(windSpeed: number): number {
  // windSpeed w km/h na powierzchni
  // Jet Stream > 60 km/h na 200-300 hPa → drastyczne pogorszenie seeingu
  // Korelacja: wiatr powierzchniowy * ~3-4 ≈ szacunkowy Jet Stream
  const estimatedJetStream = windSpeed * 3.5; // m/s szacunkowo na ~10km wys.

  if (estimatedJetStream < 30) return 0;      // < 30 km/h = brak wpływu
  if (estimatedJetStream < 50) return 10;     // lekki wpływ
  if (estimatedJetStream < 70) return 25;     // umiarkowany
  if (estimatedJetStream < 100) return 40;    // silny — min 40% kary
  return 55;                                   // ekstremalny Jet Stream
}

// =============================================
// Sun Altitude calculation (solar position)
// =============================================
function getSunAltitude(lat: number, lng: number, date?: Date): number {
  const now = date || new Date();
  
  // Dzień roku
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Czas w godzinach UTC (z ułamkami)
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  
  // Deklinacja słoneczna (Spencer, 1971)
  const B = (2 * Math.PI / 365) * (dayOfYear - 1);
  const declinationRad = 0.006918 - 0.399912 * Math.cos(B) + 0.070257 * Math.sin(B)
    - 0.006758 * Math.cos(2 * B) + 0.000907 * Math.sin(2 * B)
    - 0.002697 * Math.cos(3 * B) + 0.00148 * Math.sin(3 * B);
  
  // Równanie czasu (w minutach)
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(B) - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(2 * B) - 0.04089 * Math.sin(2 * B));
  
  // Czas słoneczny lokalny
  const solarNoon = 12 - lng / 15; // w UTC
  const solarTime = utcHours + eot / 60;
  const hourAngle = (solarTime - solarNoon) * 15; // stopnie
  const hourAngleRad = hourAngle * Math.PI / 180;
  
  // Wysokość Słońca
  const latRad = lat * Math.PI / 180;
  const sinAlt = Math.sin(latRad) * Math.sin(declinationRad) +
    Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
  
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;
}

function getTwilightLabel(sunAlt: number): string {
  if (sunAlt > 0) return "Dzień";
  if (sunAlt > -6) return "Zmierzch cywilny";
  if (sunAlt > -12) return "Zmierzch nawigacyjny";
  if (sunAlt > -18) return "Zmierzch astronomiczny";
  return "Noc astronomiczna";
}

function getTwilightEmoji(sunAlt: number): string {
  if (sunAlt > 0) return "☀️";
  if (sunAlt > -6) return "🌇";
  if (sunAlt > -12) return "🌆";
  if (sunAlt > -18) return "🌃";
  return "🌑";
}

// =============================================
// Analyze conditions — SKORYGOWANY MODEL WAGOWY
// Uwzględnia: niskie chmury, Jet Stream, wilgotność jako czynnik negatywny,
// fazę Księżyca dla DSO
// =============================================
// Helper: oblicz cloud score z wartości warstw
function calcLayeredCloudScore(low: number, mid: number, high: number): number {
  let lowS: number;
  if (low <= 5) lowS = 100;
  else if (low <= 10) lowS = 85;
  else if (low <= 20) lowS = 60;
  else if (low <= 35) lowS = 35;
  else if (low <= 50) lowS = 15;
  else lowS = 0;

  let midS: number;
  if (mid <= 10) midS = 100;
  else if (mid <= 25) midS = 90;
  else if (mid <= 50) midS = 65;
  else if (mid <= 75) midS = 40;
  else midS = 20;

  let highS: number;
  if (high <= 20) highS = 100;
  else if (high <= 50) highS = 90;
  else if (high <= 80) highS = 75;
  else highS = 60;

  return Math.max(0, Math.min(100, Math.round(
    lowS * 0.65 + midS * 0.25 + highS * 0.10
  )));
}

function analyzeConditions(
  weather: WeatherData,
  forecast: ForecastHour[],
  bortle: number,
  lat: number,
  lng: number
): AstroConditions {
  // === WYSOKOŚĆ SŁOŃCA ===
  const sunAlt = getSunAltitude(lat, lng);
  const twilightLabel = getTwilightLabel(sunAlt);
  const isAstroNight = sunAlt <= -12; // zmierzch astronomiczny lub noc
  const isAnyNight = sunAlt <= 0;     // jakikolwiek zmierzch/noc

  // === WYZNACZ DANE DO OCENY ===
  // Szukamy NAJBLIŻSZEJ godziny w prognozie, by użyć danych warstwowych (low/mid/high)
  // zamiast polegać na `weather.current` (który może nie mieć warstw lub być opóźniony).
  // Dla oceny nocnej: zbieramy godziny nocne z prognozy.
  
  // Znajdź najbliższą godzinę w forecast (by mieć poprawne warstwy chmur)
  const nowMs = Date.now();
  let closestForecastIdx = 0;
  let closestDiff = Infinity;
  forecast.forEach((h, i) => {
    const diff = Math.abs(new Date(h.time).getTime() - nowMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestForecastIdx = i;
    }
  });
  const currentForecast = forecast.length > 0 ? forecast[closestForecastIdx] : null;
  
  // Zbierz godziny nocne z prognozy (najbliższe 18h)
  const upcomingNightHours = forecast.filter((h) => {
    const fHour = new Date(h.time).getHours();
    const fTime = new Date(h.time).getTime();
    const isNightHour = fHour >= 21 || fHour <= 4; // ścisła noc
    return isNightHour && fTime > nowMs && fTime - nowMs < 18 * 3600 * 1000;
  });

  let evalData: {
    cloudCoverLow: number;
    cloudCoverMid: number;
    cloudCoverHigh: number;
    cloudCover: number;
    humidity: number;
    windSpeed: number;
    windGusts: number;
    temperature: number;
    dewPoint: number;
    visibility: number;
    precipitation: number;
  };

  // Prognoza nocna gdy jest dzień/zmierzch cywilny i mamy >=3 godziny nocne
  const useNightForecast = sunAlt > -6 && upcomingNightHours.length >= 3;
  // Blended gdy jest noc, ale aktualne chmury > 70% i prognoza mówi inaczej
  const useBlendedForecast = !useNightForecast && isAnyNight && upcomingNightHours.length >= 2 && weather.cloudCover > 70;
  
  if (useNightForecast || useBlendedForecast) {
    const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b);
    const median = (arr: number[]) => {
      const s = sorted(arr);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    };
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const nh = upcomingNightHours;
    evalData = {
      cloudCoverLow: Math.round(median(nh.map(h => h.cloudCoverLow))),
      cloudCoverMid: Math.round(median(nh.map(h => h.cloudCoverMid))),
      cloudCoverHigh: Math.round(median(nh.map(h => h.cloudCoverHigh))),
      cloudCover: Math.round(median(nh.map(h => h.cloudCover))),
      humidity: Math.round(avg(nh.map(h => h.humidity))),
      windSpeed: Math.round(avg(nh.map(h => h.windSpeed)) * 10) / 10,
      windGusts: Math.round(avg(nh.map(h => h.windGusts)) * 10) / 10,
      temperature: weather.temperature,
      dewPoint: weather.dewPoint,
      visibility: weather.visibility,
      precipitation: Math.round(avg(nh.map(h => h.precipitation)) * 10) / 10,
    };
  } else {
    // Użyj danych z NAJBLIŻSZEJ godziny w forecast (zamiast current),
    // bo forecast ma spójne dane warstwowe cloud_cover_low/mid/high
    // które korelują z wykresem 72h i "Najlepszymi godzinami"
    if (currentForecast) {
      evalData = {
        cloudCoverLow: currentForecast.cloudCoverLow,
        cloudCoverMid: currentForecast.cloudCoverMid,
        cloudCoverHigh: currentForecast.cloudCoverHigh,
        cloudCover: currentForecast.cloudCover,
        humidity: currentForecast.humidity,
        windSpeed: currentForecast.windSpeed,
        windGusts: currentForecast.windGusts,
        temperature: weather.temperature,
        dewPoint: weather.dewPoint,
        visibility: currentForecast.visibility,
        precipitation: currentForecast.precipitation,
      };
    } else {
      evalData = {
        cloudCoverLow: weather.cloudCoverLow,
        cloudCoverMid: weather.cloudCoverMid,
        cloudCoverHigh: weather.cloudCoverHigh,
        cloudCover: weather.cloudCover,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        windGusts: weather.windGusts,
        temperature: weather.temperature,
        dewPoint: weather.dewPoint,
        visibility: weather.visibility,
        precipitation: weather.precipitation,
      };
    }
  }

  // === CHMURY — WARSTWOWA ANALIZA ===
  const cloudScore = calcLayeredCloudScore(
    evalData.cloudCoverLow,
    evalData.cloudCoverMid,
    evalData.cloudCoverHigh
  );

  // === WILGOTNOŚĆ === (ODWRÓCONA LOGIKA — wysoka wilgotność = ZŁO)
  let humidityScore: number;
  if (evalData.humidity < 30) humidityScore = 95;
  else if (evalData.humidity < 40) humidityScore = 100;
  else if (evalData.humidity < 55) humidityScore = 85;
  else if (evalData.humidity < 65) humidityScore = 65;
  else if (evalData.humidity < 75) humidityScore = 45;
  else if (evalData.humidity < 80) humidityScore = 30;
  else if (evalData.humidity < 85) humidityScore = 20;
  else if (evalData.humidity < 90) humidityScore = 12;
  else humidityScore = 5;

  // === WIATR ===
  // Uwzględnij podmuchy — to podmuchy powodują drgania montażu
  const effectiveWind = Math.max(evalData.windSpeed, evalData.windGusts * 0.7);
  let windScore: number;
  if (effectiveWind < 5) windScore = 100;
  else if (effectiveWind < 10) windScore = 90;
  else if (effectiveWind < 15) windScore = 75;
  else if (effectiveWind < 20) windScore = 55;
  else if (effectiveWind < 30) windScore = 30;
  else if (effectiveWind < 40) windScore = 10;
  else windScore = 0;

  // === SEEING ===
  const tempDewSpread = Math.abs(evalData.temperature - evalData.dewPoint);
  const jetPenalty = estimateJetStreamPenalty(evalData.windSpeed);

  const baseSeeingFromWind = evalData.windSpeed < 5 ? 90 : evalData.windSpeed < 10 ? 80 : evalData.windSpeed < 15 ? 65 : evalData.windSpeed < 20 ? 45 : evalData.windSpeed < 30 ? 25 : 5;
  const baseSeeingFromDew = tempDewSpread > 8 ? 85 : tempDewSpread > 5 ? 70 : tempDewSpread > 3 ? 50 : tempDewSpread > 1 ? 25 : 10;
  const baseSeeingFromHumidity = evalData.humidity < 50 ? 90 : evalData.humidity < 65 ? 75 : evalData.humidity < 75 ? 55 : evalData.humidity < 85 ? 35 : 15;

  const seeingScore = Math.max(0, Math.min(100, Math.round(
    baseSeeingFromWind * 0.35 +
    baseSeeingFromDew * 0.25 +
    baseSeeingFromHumidity * 0.20 +
    (100 - evalData.cloudCover * 0.3) * 0.20 -
    jetPenalty
  )));

  // === PRZEJRZYSTOŚĆ (Transparency) ===
  const visScore = evalData.visibility >= 30 ? 100 : evalData.visibility >= 20 ? 90 : evalData.visibility >= 15 ? 75 : evalData.visibility >= 10 ? 60 : evalData.visibility >= 5 ? 35 : 10;
  const precipScore = evalData.precipitation === 0 ? 100 : evalData.precipitation < 0.1 ? 30 : 0;
  const transparencyScore = Math.max(0, Math.round(
    visScore * 0.40 +
    humidityScore * 0.35 +
    precipScore * 0.25
  ));

  // === FAZA KSIĘŻYCA ===
  const moonData = getMoonPhase();
  // moonPenalty: pełnia (>90%) = do 50 pkt kary na overall, 50-90% = umiarkowana kara
  // Ale dotyczy głównie DSO — planety i Księżyc nie są karane
  let moonPenaltyOverall = 0;
  if (moonData.illumination > 90) moonPenaltyOverall = 15;
  else if (moonData.illumination > 75) moonPenaltyOverall = 8;
  else if (moonData.illumination > 50) moonPenaltyOverall = 4;
  else if (moonData.illumination > 25) moonPenaltyOverall = 1;

  // === BORTLE ===
  const bortlePenalty = Math.min(12, Math.round(Math.pow(Math.max(0, bortle - 2), 1.2)));

  // === OVERALL SCORE ===
  // Chmury najważniejsze, ale NIE jedyny czynnik
  // Info: jeśli użyto prognozy nocnej, cloudScore odzwierciedla nocne warunki
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        cloudScore * 0.35 +       // chmury
        seeingScore * 0.20 +      // seeing
        transparencyScore * 0.18 + // przejrzystość
        windScore * 0.15 +        // wiatr
        humidityScore * 0.12 -    // wilgotność
        bortlePenalty -           // zanieczyszczenie świetlne (max 12)
        moonPenaltyOverall        // faza Księżyca (max 15)
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

  // Recommendations (oparte na evalData — danych użytych do oceny)
  const recommendations: string[] = [];
  
  // Info o trybie oceny
  if (useNightForecast) {
    recommendations.push("📊 Ocena bazuje na prognozie na nadchodzącą noc (mediana godzin 20:00-05:00).");
  } else if (useBlendedForecast) {
    recommendations.push("📊 Aktualne zachmurzenie wysokie — ocena oparta na prognozie na resztę nocy.");
  }
  
  if (evalData.cloudCoverLow > 50)
    recommendations.push(`Niskie chmury ${evalData.cloudCoverLow}% — całkowicie blokują obserwacje.`);
  else if (evalData.cloudCoverLow > 20)
    recommendations.push(`Niskie chmury ${evalData.cloudCoverLow}% — poważne utrudnienia, szukaj przerw.`);
  if (evalData.cloudCoverMid > 70 && evalData.cloudCoverLow <= 20)
    recommendations.push(`Średnie chmury ${evalData.cloudCoverMid}% — mogą przeszkadzać, ale są cieńsze niż niskie.`);
  if (evalData.cloudCoverHigh > 50 && evalData.cloudCoverLow <= 10 && evalData.cloudCoverMid <= 30)
    recommendations.push(`Wysokie chmury (cirrusy) ${evalData.cloudCoverHigh}% — lekkie rozproszenie światła, obserwacje możliwe.`);
  if (evalData.cloudCover > 70 && evalData.cloudCoverLow <= 10)
    recommendations.push("Ogólne zachmurzenie wysokie, ale niskie chmury minimalne — warunki mogą być lepsze niż wskazuje ogólny %.");
  if (evalData.humidity > 85)
    recommendations.push("Wysoka wilgotność (>85%) — ryzyko rosy na optyce. Użyj grzałki na obiektyw.");
  else if (evalData.humidity > 75)
    recommendations.push("Podwyższona wilgotność — monitoruj rosę na optyce.");
  if (evalData.windSpeed > 20)
    recommendations.push("Silny wiatr — stabilizuj montaż, skróć ekspozycje.");
  if (jetPenalty >= 25)
    recommendations.push("Szacowany silny Jet Stream — seeing będzie słaby niezależnie od warunków przy gruncie.");
  if (tempDewSpread < 3)
    recommendations.push("Mała różnica temp./punkt rosy — mgła prawdopodobna. Użyj grzałki na obiektyw.");
  if (moonData.illumination > 75)
    recommendations.push(`Księżyc ${moonData.illumination}% (${moonData.name}) — obiekty deep-sky będą słabo widoczne. Skup się na planetach, Księżycu lub użyj filtrów narrowband.`);
  if (moonData.illumination > 50 && moonData.illumination <= 75)
    recommendations.push(`Księżyc ${moonData.illumination}% — unikaj obiektów DSO blisko Księżyca.`);
  if (bortle >= 6)
    recommendations.push("Duże zanieczyszczenie świetlne — użyj filtrów LP lub narrowband.");
  if (bortle <= 3 && evalData.cloudCover < 20 && moonData.illumination < 30)
    recommendations.push("Doskonałe ciemne niebo + brak Księżyca! Wykorzystaj na obiekty deep-sky.");
  if (evalData.precipitation > 0)
    recommendations.push("Opady — obserwacje niemożliwe. Poczekaj na poprawę.");
  if (recommendations.length === 0)
    recommendations.push("Warunki sprzyjające obserwacjom! Wykorzystaj tę noc. 🌟");

  // Best hours — sortuj po łącznym wpływie chmur, TYLKO przyszłe godziny nocne
  // Używamy danych prosto z forecast[] — te same dane co wykres 72h
  const now = Date.now();
  const nightHours = forecast.filter((h) => {
    const d = new Date(h.time);
    const hour = d.getHours();
    const isNightHour = hour >= 20 || hour <= 5;
    return isNightHour && d.getTime() > now;
  });
  const bestHours = nightHours
    .sort((a, b) => {
      // Priorytet: niskie chmury (najgorsze), potem średnie, potem ogólne
      // Używamy cloud score warstw, żeby wynik korelował z oceną
      const aScore = calcLayeredCloudScore(a.cloudCoverLow, a.cloudCoverMid, a.cloudCoverHigh);
      const bScore = calcLayeredCloudScore(b.cloudCoverLow, b.cloudCoverMid, b.cloudCoverHigh);
      return bScore - aScore; // malejąco — najlepszy (najwyższy) score pierwszy
    })
    .slice(0, 3)
    .map((h) => {
      const d = new Date(h.time);
      const dayStr = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      const score = calcLayeredCloudScore(h.cloudCoverLow, h.cloudCoverMid, h.cloudCoverHigh);
      return `${dayStr} ${d.getHours().toString().padStart(2, "0")}:00 — N:${h.cloudCoverLow}% Ś:${h.cloudCoverMid}% W:${h.cloudCoverHigh}% (${score}/100)`;
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
    evalSource: useNightForecast ? "night-forecast" as const : useBlendedForecast ? "blended-forecast" as const : "current" as const,
    evalCloudLow: evalData.cloudCoverLow,
    evalCloudMid: evalData.cloudCoverMid,
    evalCloudHigh: evalData.cloudCoverHigh,
    evalHumidity: evalData.humidity,
    sunAltitude: sunAlt,
    twilightLabel,
    categories: calcCategories(cloudScore, seeingScore, transparencyScore, humidityScore, windScore, bortle, weather, moonData.illumination),
  };
}

// =============================================
// Interactive Cloud Forecast Chart (72h) — Meteoblue-style
// =============================================
function CloudForecastChart({ forecast }: { forecast: ForecastHour[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Zbierz daty na oś X
  const dates = new Map<string, number>();
  forecast.forEach((h, i) => {
    const d = new Date(h.time);
    const key = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!dates.has(key)) dates.set(key, i);
  });

  // Kolor słupka total w zależności od wartości
  function totalColor(val: number, isNight: boolean): string {
    if (val === 0) return isNight ? "rgba(34,197,94,0.5)" : "rgba(34,197,94,0.3)";
    if (val <= 15) return isNight ? "rgba(34,197,94,0.8)" : "rgba(34,197,94,0.5)";
    if (val <= 30) return isNight ? "rgba(250,204,21,0.9)" : "rgba(250,204,21,0.6)";
    if (val <= 60) return isNight ? "rgba(251,146,60,0.9)" : "rgba(251,146,60,0.65)";
    return isNight ? "rgba(239,68,68,0.95)" : "rgba(239,68,68,0.7)";
  }

  // Kolor słupków warstw
  const layerColor = {
    low: "rgb(239,68,68)",
    mid: "rgb(251,191,36)",
    high: "rgb(96,165,250)",
  };

  const ROW_H = 36; // px wysokość wiersza total
  const LAYER_H = 20; // px wysokość wiersza warstw

  return (
    <div className="relative select-none">
      {/* === WIERSZ TOTAL === */}
      <div className="flex items-center gap-2 mb-[2px]">
        <span className="text-[10px] text-night-400 w-14 text-right shrink-0 font-semibold">Łącznie</span>
        <div className="flex-1 flex items-end gap-[1px]" style={{ height: `${ROW_H}px` }}>
          {forecast.map((h, i) => {
            const val = h.cloudCover ?? 0;
            const hour = new Date(h.time).getHours();
            const isNight = hour >= 20 || hour <= 5;
            const isHovered = hoveredIdx === i;
            const heightPx = val === 0 ? 1 : Math.max(2, Math.round((val / 100) * ROW_H));
            return (
              <div
                key={i}
                className={clsx("flex-1 rounded-t cursor-pointer transition-all duration-75", isHovered && "ring-1 ring-white/70")}
                style={{
                  height: `${heightPx}px`,
                  backgroundColor: totalColor(val, isNight),
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </div>
      </div>

      {/* === WIERSZE WARSTW === */}
      <div className="space-y-[2px] border-t border-night-800/60 pt-[3px]">
        {(["high", "mid", "low"] as const).map((layer) => {
          const label = layer === "high" ? "Wysokie" : layer === "mid" ? "Średnie" : "Niskie";
          const color = layerColor[layer];
          return (
            <div key={layer} className="flex items-center gap-2">
              <span className="text-[9px] text-night-600 w-14 text-right shrink-0">{label}</span>
              <div className="flex-1 flex items-end gap-[1px]" style={{ height: `${LAYER_H}px` }}>
                {forecast.map((h, i) => {
                  const val = layer === "high" ? (h.cloudCoverHigh ?? 0)
                    : layer === "mid" ? (h.cloudCoverMid ?? 0)
                    : (h.cloudCoverLow ?? 0);
                  const hour = new Date(h.time).getHours();
                  const isNight = hour >= 20 || hour <= 5;
                  const isHovered = hoveredIdx === i;
                  const heightPx = val === 0 ? 1 : Math.max(1, Math.round((val / 100) * LAYER_H));
                  return (
                    <div
                      key={i}
                      className={clsx("flex-1 rounded-t cursor-pointer transition-all duration-75", isHovered && "ring-1 ring-white/40")}
                      style={{
                        height: `${heightPx}px`,
                        backgroundColor: val === 0
                          ? (isNight ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.08)")
                          : color,
                        opacity: isNight ? 0.85 : 0.55,
                      }}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Oś czasu — godziny */}
      <div className="flex items-center gap-0 mt-1 ml-16">
        {forecast.map((h, i) => {
          const hour = new Date(h.time).getHours();
          const showLabel = hour % 6 === 0;
          const isMidnight = hour === 0;
          return (
            <div key={i} className="flex-1 text-center">
              {showLabel && (
                <span className={clsx("text-[8px]", isMidnight ? "text-cosmos-400 font-bold" : "text-night-600")}>
                  {hour}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Separatory dat */}
      <div className="flex items-center gap-0 ml-16">
        {forecast.map((h, i) => {
          const d = new Date(h.time);
          const hour = d.getHours();
          const key = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
          const isFirst = dates.get(key) === i;
          return (
            <div key={i} className="flex-1 text-center">
              {isFirst && hour === 0 && (
                <span className="text-[9px] text-cosmos-400 font-medium">{key}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredIdx !== null && (() => {
        const h = forecast[hoveredIdx];
        const d = new Date(h.time);
        const dayStr = `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
        const hourStr = `${d.getHours().toString().padStart(2, "0")}:00`;
        const total = h.cloudCover ?? 0;
        const low = h.cloudCoverLow ?? 0;
        const mid = h.cloudCoverMid ?? 0;
        const high = h.cloudCoverHigh ?? 0;
        const hour = d.getHours();
        const isNight = hour >= 20 || hour <= 5;
        const leftPct = ((hoveredIdx + 0.5) / forecast.length) * 100;
        const flipRight = leftPct > 70;

        return (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              top: "-8px",
              left: flipRight ? undefined : `calc(${leftPct}% + 60px)`,
              right: flipRight ? `calc(${100 - leftPct}% + 16px)` : undefined,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-night-900 border border-night-600 rounded-lg shadow-xl px-3 py-2 min-w-[180px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-night-200">{dayStr} {hourStr}</span>
                <span className="text-[10px] text-night-500">{isNight ? "🌙 Noc" : "☀️ Dzień"}</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-night-400 font-medium">☁️ Łącznie:</span>
                  <span className={clsx("font-bold", total > 70 ? "text-red-400" : total > 30 ? "text-yellow-400" : "text-green-400")}>{total}%</span>
                </div>
                <div className="border-t border-night-700/50 pt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-night-500">🔻 Niskie (0-3km):</span>
                    <span className={clsx("font-medium", low > 30 ? "text-red-400" : low > 10 ? "text-yellow-400" : "text-green-400")}>{low}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-night-500">🔸 Średnie (3-8km):</span>
                    <span className={clsx("font-medium", mid > 50 ? "text-orange-400" : mid > 20 ? "text-yellow-400" : "text-green-400")}>{mid}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-night-500">🔹 Wysokie (&gt;8km):</span>
                    <span className={clsx("font-medium", high > 70 ? "text-blue-400" : "text-green-400")}>{high}%</span>
                  </div>
                </div>
                <div className="border-t border-night-700/50 pt-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-night-500">💧 Wilgotność:</span>
                    <span className="text-night-300">{h.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-night-500">💨 Wiatr:</span>
                    <span className="text-night-300">{h.windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-night-500">🌡️ Temp.:</span>
                    <span className="text-night-300">{h.temperature}°C</span>
                  </div>
                </div>
              </div>
              {total === 0 && (
                <div className="mt-1 text-[10px] text-green-400 font-medium text-center">
                  ✓ Czyste niebo — idealne warunki
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Legenda */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-night-500 flex-wrap ml-16">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-green-500/50" /> 0-15%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-yellow-400/70" /> 16-30%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-orange-400/70" /> 31-60%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded bg-red-500/80" /> 61-100%
        </span>
        <span className="flex items-center gap-1 ml-2 border-l border-night-700 pl-2">
          <span className="text-[9px] text-night-600">warstwy:</span>
          <span className="w-3 h-1.5 rounded" style={{ backgroundColor: "rgb(239,68,68)", opacity: 0.7 }} /> N
          <span className="w-3 h-1.5 rounded" style={{ backgroundColor: "rgb(251,191,36)", opacity: 0.7 }} /> Ś
          <span className="w-3 h-1.5 rounded" style={{ backgroundColor: "rgb(96,165,250)", opacity: 0.7 }} /> W
        </span>
      </div>
    </div>
  );
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
    // v3 = po zmianie na multi-model ensemble (ICON-EU + GFS + Meteo-France, max warstw)
    const cacheKey = `astrofor-weather-v3-${loc.lat.toFixed(1)}-${loc.lng.toFixed(1)}`;
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(cacheKey + "-time");

    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 10 * 60 * 1000) {
      // Use cache (10 min — pogoda zmienia się szybko)
      const parsed = JSON.parse(cached);
      setWeather(parsed.weather);
      setForecast(parsed.forecast);
      const bortle = estimateBortle(loc.lat, loc.lng);
      setConditions(analyzeConditions(parsed.weather, parsed.forecast, bortle, loc.lat, loc.lng));
      setIsLoading(false);
      return;
    }

    try {
      // ================================================================
      // Multi-model ensemble — pobieramy 3 modele równolegle i bierzemy
      // MAKSIMUM z każdej warstwy chmur (pesymistyczne podejście dla astro).
      // Różne modele NWP klasyfikują warstwy chmur inaczej (np. ICON-EU
      // traktuje chmury niskie jako średnie/wysokie) — ensemble max
      // daje wynik najbliższy rzeczywistości obserwowanej.
      // ================================================================
      const baseParams =
        `&current=temperature_2m,relative_humidity_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_gusts_10m,visibility,dew_point_2m,precipitation,is_day` +
        `&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,relative_humidity_2m,temperature_2m,wind_speed_10m,wind_gusts_10m,visibility,precipitation` +
        `&forecast_days=3&timezone=auto`;

      // Model 1: DWD ICON-EU (2km Europa) — primary
      const iconEuUrl = `https://api.open-meteo.com/v1/dwd-icon?latitude=${loc.lat}&longitude=${loc.lng}${baseParams}`;
      // Model 2: GFS (globalny NOAA) — secondary, inne podejście do low clouds
      const gfsUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&models=gfs_seamless${baseParams}`;
      // Model 3: Meteo-France AROME (3.1km Europa) — tertiary
      const aromeUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&models=meteofrance_seamless${baseParams}`;

      // Pobierz wszystkie 3 równolegle, nie fail na błędach pomocniczych
      const [res1, res2, res3] = await Promise.allSettled([
        fetch(iconEuUrl),
        fetch(gfsUrl),
        fetch(aromeUrl),
      ]);

      // Zbierz te które się powiodły
      const allData: ReturnType<typeof JSON.parse>[] = [];
      for (const res of [res1, res2, res3]) {
        if (res.status === "fulfilled" && res.value.ok) {
          try { allData.push(await res.value.json()); } catch { /* skip */ }
        }
      }
      // Fallback — jeśli żaden się nie udał, spróbuj globalny
      if (allData.length === 0) {
        const fallback = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}${baseParams}`
        );
        if (!fallback.ok) throw new Error("Błąd pobierania danych pogodowych");
        allData.push(await fallback.json());
      }

      // Primary data (ICON-EU lub pierwszy dostępny) — do current weather + metadanych
      const primary = allData[0];

      // Helper: max z dostępnych modeli dla danego indeksu godziny
      const maxLayer = (field: string, i: number): number => {
        let mx = 0;
        for (const d of allData) {
          const val = d.hourly?.[field]?.[i];
          if (typeof val === "number" && val > mx) mx = val;
        }
        return mx;
      };

      const weatherData: WeatherData = {
        temperature: primary.current.temperature_2m,
        humidity: primary.current.relative_humidity_2m,
        cloudCover: primary.current.cloud_cover,
        cloudCoverLow: Math.max(...allData.map(d => d.current?.cloud_cover_low ?? 0)),
        cloudCoverMid: Math.max(...allData.map(d => d.current?.cloud_cover_mid ?? 0)),
        cloudCoverHigh: Math.max(...allData.map(d => d.current?.cloud_cover_high ?? 0)),
        windSpeed: primary.current.wind_speed_10m,
        windGusts: primary.current.wind_gusts_10m ?? 0,
        visibility: (primary.current.visibility || 10000) / 1000,
        dewPoint: primary.current.dew_point_2m,
        precipitation: primary.current.precipitation,
        isDay: primary.current.is_day === 1,
      };

      // Next 72h forecast — ensemble max per layer per hour
      const forecastData: ForecastHour[] = primary.hourly.time
        .slice(0, 72)
        .map((time: string, i: number) => ({
          time,
          cloudCover: primary.hourly.cloud_cover[i],
          cloudCoverLow: maxLayer("cloud_cover_low", i),
          cloudCoverMid: maxLayer("cloud_cover_mid", i),
          cloudCoverHigh: maxLayer("cloud_cover_high", i),
          humidity: primary.hourly.relative_humidity_2m[i],
          temperature: primary.hourly.temperature_2m[i],
          windSpeed: primary.hourly.wind_speed_10m[i],
          windGusts: primary.hourly.wind_gusts_10m?.[i] ?? 0,
          visibility: (primary.hourly.visibility?.[i] || 10000) / 1000,
          precipitation: primary.hourly.precipitation[i],
        }));

      setWeather(weatherData);
      setForecast(forecastData);

      // Estimate Bortle + analyze
      const bortle = estimateBortle(loc.lat, loc.lng);
      const analysis = analyzeConditions(weatherData, forecastData, bortle, loc.lat, loc.lng);
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

    // Zawsze pobierz świeżą pozycję — nie cachuj w sessionStorage
    // (użytkownik może zmienić lokalizację lub poprawić GPS)
    sessionStorage.removeItem("astrofor-geo-coords");

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

        const loc: LocationResult = {
          name: accuracy > 5000 ? `${name} (±${Math.round(accuracy / 1000)} km)` : name,
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
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
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
              {conditions.sunAltitude > 0 ? (
                <HiOutlineSun className="h-3.5 w-3.5 text-yellow-400" />
              ) : conditions.sunAltitude > -6 ? (
                <HiOutlineSun className="h-3.5 w-3.5 text-orange-400" />
              ) : (
                <HiOutlineMoon className="h-3.5 w-3.5 text-blue-400" />
              )}
              {conditions.twilightLabel}
              <span className="text-night-500 text-[10px]">({conditions.sunAltitude.toFixed(1)}°)</span>
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
                    Chmury: N:{conditions.evalCloudLow}% Ś:{conditions.evalCloudMid}% W:{conditions.evalCloudHigh}%
                  </span>
                  <span className="flex items-center gap-1">
                    💧 Wilg.: {conditions.evalHumidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    💨 Wiatr: {weather.windSpeed} km/h
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineEye className="h-3.5 w-3.5" />
                    Widoczność: {weather.visibility.toFixed(0)} km
                  </span>
                </div>
                {conditions.evalSource !== "current" && (
                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-cosmos-500/10 border border-cosmos-500/20 text-xs text-cosmos-300 flex items-center gap-2">
                    <HiOutlineInformationCircle className="h-4 w-4 shrink-0" />
                    <span>
                      {conditions.evalSource === "night-forecast" 
                        ? "Ocena oparta na prognozie na nadchodzącą noc (mediana godzin 21:00-04:00)"
                        : "Ocena oparta na prognozie na resztę nocy"}
                    </span>
                  </div>
                )}
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
                
                {/* Warstwy chmur — dane na których bazuje ocena */}
                <div className="ml-4 space-y-2 border-l-2 border-night-700/50 pl-3">
                  <p className="text-[10px] text-night-500 font-medium">
                    {conditions.evalSource === "night-forecast" 
                      ? "📊 Prognoza nocna (mediana godzin 21-04):"
                      : conditions.evalSource === "blended-forecast"
                      ? "📊 Prognoza na resztę nocy:"
                      : "Dane z najbliższej godziny prognozy:"}
                  </p>
                  {([
                    { label: "🔻 Niskie (0-3 km)", val: conditions.evalCloudLow, threshRed: 30, threshYellow: 10 },
                    { label: "🔸 Średnie (3-8 km)", val: conditions.evalCloudMid, threshRed: 70, threshYellow: 30 },
                    { label: "🔹 Wysokie (>8 km)", val: conditions.evalCloudHigh, threshRed: 70, threshYellow: 70 },
                  ] as const).map(({ label, val, threshRed, threshYellow }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-night-400">{label}</span>
                        <span className={clsx("font-medium", val > threshRed ? "text-red-400" : val > threshYellow ? "text-yellow-400" : "text-green-400")}>{val}%</span>
                      </div>
                      <div className="h-1 bg-night-800 rounded-full overflow-hidden">
                        <div className={clsx("h-full rounded-full", val > threshRed ? "bg-red-500" : val > threshYellow ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${Math.max(2, val)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <MiniScore label="Seeing" score={conditions.seeingScore} icon="👁️" />
                <MiniScore label="Przejrzystość" score={conditions.transparencyScore} icon="✨" />
                <MiniScore label="Wilgotność" score={conditions.humidityScore} icon="💧" />
                <MiniScore label="Wiatr" score={conditions.windScore} icon="💨" />
              </div>

              {/* Faza Księżyca */}
              {(() => {
                const moon = getMoonPhase();
                const moonEmoji = moon.illumination > 90 ? "🌕" : moon.illumination > 60 ? "🌖" : moon.illumination > 30 ? "🌓" : moon.illumination > 5 ? "🌒" : "🌑";
                return (
                  <div className="mt-4 pt-3 border-t border-night-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-night-400">{moonEmoji} Księżyc</span>
                      <span className="text-night-300 font-medium">{moon.illumination}% — {moon.name}</span>
                    </div>
                    {moon.illumination > 75 && (
                      <p className="text-[11px] text-yellow-400/80 mt-1">
                        ⚠️ Jasny Księżyc — obiekty Deep Sky będą trudne do obserwacji
                      </p>
                    )}
                  </div>
                );
              })()}
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

          {/* 72h cloud forecast chart — interactive */}
          <div className="glass-card rounded-xl border border-night-700 p-5">
            <h3 className="text-sm font-bold text-night-200 mb-1 flex items-center gap-2">
              <HiOutlineCloud className="h-4 w-4 text-night-400" />
              Prognoza zachmurzenia (72h) — warstwy chmur
            </h3>
            <p className="text-[10px] text-night-600 mb-3">
              Wiersz <span className="text-night-400 font-medium">Łącznie</span> = całkowite pokrycie nieba.
              Warstwy (N/Ś/W) = max z 3 modeli NWP (ICON-EU, GFS, Meteo-France).
              <span className="text-yellow-600/70"> ⚠ Modele otwartych danych mogą niedoszacowywać niskich chmur vs Meteoblue NEMS.</span>
            </p>
            <CloudForecastChart forecast={forecast} />
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-night-600">
            Dane pogodowe: Ensemble (ICON-EU + GFS + Meteo-France) via Open-Meteo • Warstwy chmur: max z 3 modeli • Skala Bortle: estymacja na podstawie lokalizacji •
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
