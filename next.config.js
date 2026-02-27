/** @type {import('next').NextConfig} */
const nextConfig = {
  // =============================================
  // Bezpieczne nagłówki HTTP
  // =============================================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Ochrona przed clickjackingiem — strona nie może być wyświetlana w iframe
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Ochrona przed sniffingiem MIME type
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Polityka referrer — nie ujawniaj pełnego URL
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy — blokuj zbędne API przeglądarki
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          // Strict Transport Security — wymuszaj HTTPS (2 lata)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy — ochrona przed XSS
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://apod.nasa.gov https://*.nasa.gov https://esawebb.org https://*.esawebb.org",
              "connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://api.open-meteo.com https://geocoding-api.open-meteo.com https://api.nasa.gov https://nominatim.openstreetmap.org",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Ochrona XSS dla starszych przeglądarek
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Cross-Origin Opener Policy
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  // Wyłącz X-Powered-By header (nie ujawniaj technologii)
  poweredByHeader: false,
};

module.exports = nextConfig;
