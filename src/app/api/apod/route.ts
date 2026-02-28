import { NextResponse } from "next/server";

/**
 * API Route — pobiera dzisiejsze APOD bezpośrednio ze strony NASA.
 * Nie wymaga klucza API, nie ma limitów requestów.
 * Parsuje HTML strony https://apod.nasa.gov/apod/astropix.html
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

export async function GET() {
  // Sprawdź cache serwerowy — ale waliduj datę (APOD zmienia się codziennie)
  const todayStr = new Date().toISOString().split("T")[0];
  if (cachedData && cachedData.date === todayStr && Date.now() - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    // Priorytet 1: Parsuj bezpośrednio stronę APOD HTML — zawsze aktualna, brak limitów
    try {
      const html = await fetch("https://apod.nasa.gov/apod/astropix.html", {
        next: { revalidate: 1800 },
        headers: { "User-Agent": "Astrofor/1.0 (astronomy community)" },
      }).then((r) => r.text());

      const data = parseApodHtml(html);
      if (data && data.url) {
        cachedData = data;
        cachedAt = Date.now();
        return NextResponse.json(data);
      }
    } catch {
      // Parsowanie się nie powiodło — spróbuj API
    }

    // Priorytet 2: NASA API z DEMO_KEY (może mieć limity 30-50 req/h)
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

function parseApodHtml(html: string): APODData | null {
  try {
    // Wyciągnij tytuł — APOD HTML ma format: <center><b> Title </b></center>
    // Tytuł pojawia się po sekcji z obrazem, zazwyczaj w <center><b>...</b>
    let title = "Astronomy Picture of the Day";
    
    // Metoda 1: szukaj tytułu między credit/image a explanation
    const titleBlockMatch = html.match(
      /(?:Credit|Copyright)[^]*?<center>\s*<b>\s*([^<]+?)\s*<\/b>/i
    );
    if (titleBlockMatch) {
      const t = titleBlockMatch[1].trim();
      if (t.length > 2 && t.length < 200) title = t;
    }
    
    // Metoda 2: fallback — szukaj <b> tagów z filtrami
    if (title === "Astronomy Picture of the Day") {
      const titleRegex = /<center>\s*<b>\s*([^<]+?)\s*<\/b>\s*<\/center>/gi;
      let boldMatch: RegExpExecArray | null;
      const skipWords = [
        "astronomy picture", "tomorrow", "archive", "authors",
        "explanation", "credit", "copyright", "editors", "nasa"
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

    // Wyciągnij URL obrazu — szukaj <a href="image/..."><img>
    let imageUrl = "";
    let hdUrl = "";

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

    // Sprawdź czy to video (iframe/embed zamiast img)
    const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
    const isVideo = !imgMatch && !!iframeMatch;
    if (isVideo && iframeMatch) {
      imageUrl = iframeMatch[1];
    }

    // Wyciągnij opis — tekst po "Explanation:" do następnego <p> lub <center>
    let explanation = "";
    const expMatch = html.match(
      /Explanation:\s*<\/b>\s*([\s\S]*?)(?:<p>\s*<center>|<center>\s*<b>\s*Tomorrow)/i
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
      /(?:Credit|Copyright)[^:]*:\s*<\/b>\s*([\s\S]*?)(?:<center>|<p>)/i
    );
    if (copyrightMatch) {
      copyright = copyrightMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Data
    const today = new Date().toISOString().split("T")[0];

    if (!imageUrl && !isVideo) return null;

    return {
      title,
      explanation: explanation || "Brak opisu.",
      url: imageUrl,
      hdurl: hdUrl || undefined,
      date: today,
      media_type: isVideo ? "video" : "image",
      copyright,
    };
  } catch {
    return null;
  }
}
