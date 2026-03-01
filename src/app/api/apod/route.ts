import { NextResponse } from "next/server";

/**
 * API Route — pobiera dzisiejsze APOD.
 * Priorytet 1: Dedykowana strona APOD z dzisiejszą datą (apYYMMDD.html)
 * Priorytet 2: astropix.html (bieżąca strona — może być z poprzedniego dnia)
 * Priorytet 3: NASA API z DEMO_KEY
 * Obsługuje zarówno obrazy jak i filmy (YouTube/Vimeo itp.)
 */

interface APODData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: string;
  copyright?: string;
}

// Cache w pamięci serwera (revalidacja co 1h)
let cachedData: APODData | null = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 godzina

/**
 * Generuje URL APOD dla konkretnej daty: apYYMMDD.html
 */
function getApodUrlForDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `https://apod.nasa.gov/apod/ap${yy}${mm}${dd}.html`;
}

export async function GET() {
  // Sprawdź cache serwerowy — ale waliduj datę (APOD zmienia się codziennie)
  const todayStr = new Date().toISOString().split("T")[0];
  if (cachedData && cachedData.date === todayStr && Date.now() - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    // Priorytet 1: Dedykowana strona APOD z dzisiejszą datą
    // NASA publikuje APOD wg Eastern Time, więc sprawdzamy i dzisiejszą i wczorajszą datę
    const now = new Date();
    const todayUrl = getApodUrlForDate(now);
    
    // Próbuj dzisiejszą datę
    try {
      const html = await fetch(todayUrl, {
        next: { revalidate: 1800 },
        headers: { "User-Agent": "Astrofor/1.0 (astronomy community)" },
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      });

      const data = parseApodHtml(html, todayStr);
      if (data && (data.url || data.media_type === "video")) {
        cachedData = data;
        cachedAt = Date.now();
        return NextResponse.json(data);
      }
    } catch {
      // Dzisiejsza strona jeszcze nie istnieje — NASA nie opublikowała
    }

    // Priorytet 2: Parsuj stronę astropix.html (zawsze istnieje, ale może być wczorajsza)
    try {
      const html = await fetch("https://apod.nasa.gov/apod/astropix.html", {
        next: { revalidate: 1800 },
        headers: { "User-Agent": "Astrofor/1.0 (astronomy community)" },
      }).then((r) => r.text());

      const data = parseApodHtml(html, todayStr);
      if (data && (data.url || data.media_type === "video")) {
        cachedData = data;
        cachedAt = Date.now();
        return NextResponse.json(data);
      }
    } catch {
      // Parsowanie się nie powiodło — spróbuj API
    }

    // Priorytet 3: NASA API z DEMO_KEY (może mieć limity 30-50 req/h)
    const apiRes = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
      { next: { revalidate: 3600 } }
    );

    if (apiRes.ok) {
      const data: APODData = await apiRes.json();
      if (data.url) {
        cachedData = data;
        cachedAt = Date.now();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(
      { error: "Nie udało się pobrać APOD" },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Błąd serwera przy pobieraniu APOD" },
      { status: 500 }
    );
  }
}

function parseApodHtml(html: string, fallbackDate?: string): APODData | null {
  try {
    // Wyciągnij datę z HTML — format: "2026 March 1" lub "2026 February 28"
    let apodDate = fallbackDate || new Date().toISOString().split("T")[0];
    const dateMatch = html.match(/(\d{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i);
    if (dateMatch) {
      const months: Record<string, string> = {
        january: "01", february: "02", march: "03", april: "04",
        may: "05", june: "06", july: "07", august: "08",
        september: "09", october: "10", november: "11", december: "12"
      };
      const y = dateMatch[1];
      const m = months[dateMatch[2].toLowerCase()] || "01";
      const d = dateMatch[3].padStart(2, "0");
      apodDate = `${y}-${m}-${d}`;
    }

    // Wyciągnij tytuł — APOD HTML ma format:
    // <center><b> Title </b></center> (zaraz PO obrazku/video, PRZED Explanation)
    // WAŻNE: na dole strony jest też <b> Almost Hyperspace: </b> — MUSIMY to pomijać
    let title = "Astronomy Picture of the Day";
    
    // Metoda 1 (najlepsza): tytuł po Credit/Copyright, ale PRZED Explanation
    // Format: Credit: ... </center> ... <center> <b> TYTUŁ </b>
    const titleAfterCredit = html.match(
      /(?:Credit|Copyright)[^]*?<center>\s*<b>\s*([^<]+?)\s*<\/b>/i
    );
    if (titleAfterCredit) {
      const t = titleAfterCredit[1].trim();
      const skipWords = [
        "astronomy picture", "tomorrow", "almost hyperspace", "archive",
        "authors", "explanation", "credit", "copyright", "editors", "nasa",
        "random apod"
      ];
      if (t.length > 3 && t.length < 200 && !skipWords.some(w => t.toLowerCase().includes(w))) {
        title = t;
      }
    }
    
    // Metoda 2: szukaj w tagu <title> strony (obsłuż też HTML entities jak &ndash; &#8211; –)
    if (title === "Astronomy Picture of the Day") {
      const pageTitleMatch = html.match(/<title>[^<]*?(?:–|—|-|&ndash;|&mdash;|&#8211;|&#8212;)\s*([^<\n]+)/i);
      if (pageTitleMatch) {
        const t = pageTitleMatch[1].trim();
        if (t.length > 3 && t.length < 200) title = t;
      }
    }
    
    // Metoda 3: fallback — szukaj <b> tagów z filtrami (bardziej restrykcyjne)
    if (title === "Astronomy Picture of the Day") {
      const titleRegex = /<center>\s*<b>\s*([^<]+?)\s*<\/b>\s*(?:<br|<\/center>)/gi;
      let boldMatch: RegExpExecArray | null;
      const skipWords = [
        "astronomy picture", "tomorrow", "almost hyperspace", "archive", "authors",
        "explanation", "credit", "copyright", "editors", "nasa", "random apod",
        "video credit", "image credit"
      ];
      while ((boldMatch = titleRegex.exec(html)) !== null) {
        const content = boldMatch[1].trim();
        if (
          content.length > 3 &&
          content.length < 200 &&
          !skipWords.some(w => content.toLowerCase().includes(w))
        ) {
          title = content;
          break;
        }
      }
    }

    // === WYKRYWANIE MEDIA ===
    // Kolejność: <video> tag → <iframe> → <embed> → <img>
    // NIE szukamy <a href="...mp4"> bo to mogą być linki w tekście (opis)!
    let imageUrl = "";
    let hdUrl = "";
    let isVideo = false;

    // 1. Sprawdź tag <video> (natywne wideo HTML5 — np. NASA mp4)
    const videoTagMatch = html.match(/<video[^>]*>[\s\S]*?<source\s+src="([^"]+)"/i)
      || html.match(/<video[^>]+src="([^"]+)"/i);
    
    // 2. Sprawdź iframe (YouTube, Vimeo, Facebook, mp4 embed itp.)
    const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
    
    // 3. Sprawdź embed (starsze strony NASA)
    const embedMatch = html.match(/<embed[^>]+src="([^"]+)"/i);

    if (videoTagMatch) {
      // Natywne wideo — najczęściej lokalne pliki NASA
      let videoUrl = videoTagMatch[1];
      if (!videoUrl.startsWith("http")) {
        videoUrl = `https://apod.nasa.gov/apod/${videoUrl}`;
      }
      videoUrl = videoUrl.replace(/^http:\/\//, "https://");
      imageUrl = videoUrl;
      isVideo = true;
    } else if (iframeMatch) {
      let videoUrl = iframeMatch[1];
      if (videoUrl.startsWith("//")) videoUrl = "https:" + videoUrl;
      videoUrl = videoUrl.replace(/^http:\/\//, "https://");
      // YouTube: upewnij się, że mamy format /embed/ (nie /watch?v=)
      videoUrl = videoUrl.replace(
        /youtube\.com\/watch\?v=([^&"]+)/,
        "youtube.com/embed/$1"
      );
      // YouTube: obsłuż youtu.be short links
      videoUrl = videoUrl.replace(
        /youtu\.be\/([^?&"]+)/,
        "youtube.com/embed/$1"
      );
      // Vimeo: obsłuż vimeo.com/ID -> player.vimeo.com/video/ID
      videoUrl = videoUrl.replace(
        /(?:www\.)?vimeo\.com\/(\d+)/,
        "player.vimeo.com/video/$1"
      );
      if (videoUrl.includes("youtube.com/embed/") && !videoUrl.includes("rel=")) {
        videoUrl += (videoUrl.includes("?") ? "&" : "?") + "rel=0";
      }
      imageUrl = videoUrl;
      isVideo = true;
    } else if (embedMatch) {
      let videoUrl = embedMatch[1];
      if (videoUrl.startsWith("//")) videoUrl = "https:" + videoUrl;
      videoUrl = videoUrl.replace(/^http:\/\//, "https://");
      imageUrl = videoUrl;
      isVideo = true;
    }

    // Jeśli nie jest video, szukaj obrazu
    if (!isVideo) {
      // HD image link (duże zdjęcie)
      const hdMatch = html.match(/<a\s+href="(image\/[^"]+)"/i);
      if (hdMatch) {
        hdUrl = `https://apod.nasa.gov/apod/${hdMatch[1]}`;
      }

      // Obraz wyświetlany na stronie
      const imgMatch = html.match(/<img\s+[^>]*src="(image\/[^"]+)"/i);
      if (imgMatch) {
        imageUrl = `https://apod.nasa.gov/apod/${imgMatch[1]}`;
      } else if (hdUrl) {
        imageUrl = hdUrl;
      }
    }

    // Wyciągnij opis — tekst po "Explanation:" do następnego <p> lub <center>
    let explanation = "";
    const expMatch = html.match(
      /Explanation:\s*<\/b>\s*([\s\S]*?)(?:<p>\s*<center>|<center>\s*<b>\s*(?:Tomorrow|Almost|March|January|February|April|May|June|July|August|September|October|November|December))/i
    );
    if (expMatch) {
      explanation = expMatch[1]
        .replace(/<[^>]+>/g, "") // usuń tagi HTML
        .replace(/\s+/g, " ")   // normalizuj białe znaki
        .trim();
    }

    // Wyciągnij copyright
    let copyright: string | undefined;
    const copyrightMatch = html.match(
      /(?:(?:Image|Video)\s+)?(?:Credit|Copyright)[^:]*:\s*<\/b>\s*([\s\S]*?)(?:<center>|<p>)/i
    );
    if (copyrightMatch) {
      copyright = copyrightMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (!imageUrl && !isVideo) return null;

    return {
      title,
      explanation: explanation || "Brak opisu.",
      url: imageUrl,
      hdurl: hdUrl || undefined,
      date: apodDate,
      media_type: isVideo ? "video" : "image",
      copyright,
    };
  } catch {
    return null;
  }
}
