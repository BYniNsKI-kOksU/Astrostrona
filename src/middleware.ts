import { NextRequest, NextResponse } from "next/server";

// =============================================
// Rate Limiting (prosty, in-memory na czas dev)
// W produkcji użyj Redis / Upstash
// =============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuta
const MAX_REQUESTS = 100; // maks. 100 req/min per IP

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// Czyść stare wpisy co 5 minut
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    const keys = Array.from(rateLimitMap.keys());
    keys.forEach((key) => {
      const value = rateLimitMap.get(key);
      if (value && now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  };
  // Edge runtime nie wspiera setInterval, więc czyścimy przy każdym req
  // (patrz rateLimit function powyżej — auto-reset)
}

// =============================================
// Ścieżki wymagające zalogowania
// =============================================
const PROTECTED_PATHS = [
  "/profile/edit",
  "/forum/new",
  "/saved",
  "/settings",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// =============================================
// Middleware
// =============================================
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return new NextResponse("Zbyt wiele żądań. Spróbuj ponownie za chwilę.", {
      status: 429,
      headers: {
        "Retry-After": "60",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  // 2. Ochrona ścieżek — sprawdzamy cookie auth
  if (isProtectedPath(pathname)) {
    const authCookie = request.cookies.get("astrofor-auth");

    if (!authCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Jeśli użytkownik zalogowany i próbuje wejść na /login lub /register — redirect na stronę główną
  if (pathname === "/login" || pathname === "/register") {
    const authCookie = request.cookies.get("astrofor-auth");
    if (authCookie?.value) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 4. Dodatkowe nagłówki bezpieczeństwa
  const response = NextResponse.next();

  // Zapobiegaj cache'owaniu stron z danymi użytkownika
  if (isProtectedPath(pathname)) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    // Dopasuj wszystko oprócz zasobów statycznych i API Next.js
    "/((?!_next/static|_next/image|favicon.ico|images|avatars).*)",
  ],
};
