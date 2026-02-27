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
  // Sprawdź cache serwerowy
  if (cachedData && Date.now() - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    // Najpierw spróbuj NASA API z DEMO_KEY
    const apiRes = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
      { next: { revalidate: 3600 } }
    );

    if (apiRes.ok) {
      const data: APODData = await apiRes.json();
      cachedData = data;
      cachedAt = Date.now();
      return NextResponse.json(data);
    }

    // Fallback: parsuj stronę APOD HTML
    const html = await fetch("https://apod.nasa.gov/apod/astropix.html", {
      next: { revalidate: 3600 },
    }).then((r) => r.text());

    const data = parseApodHtml(html);
    if (data) {
      cachedData = data;
      cachedAt = Date.now();
      return NextResponse.json(data);
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
    // Wyciągnij tytuł — szukaj <b> tagów z czystym tekstem
    const titleRegex = /<b>([^<]+)<\/b>/g;
    let title = "Astronomy Picture of the Day";
    let boldMatch: RegExpExecArray | null;
    while ((boldMatch = titleRegex.exec(html)) !== null) {
      const content = boldMatch[1].trim();
      if (
        content.length > 3 &&
        content.length < 200 &&
        !content.toLowerCase().includes("astronomy picture") &&
        !content.toLowerCase().includes("tomorrow") &&
        !content.toLowerCase().includes("archive") &&
        !content.toLowerCase().includes("authors") &&
        !content.toLowerCase().includes("explanation") &&
        !content.toLowerCase().includes("credit") &&
        !content.toLowerCase().includes("copyright")
      ) {
        title = content;
        break;
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
