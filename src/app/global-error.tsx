"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: "#0a0a1a", color: "#e2e8f0" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>💥</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
            Krytyczny błąd
          </h1>
          <p style={{ color: "#94a3b8", maxWidth: "28rem", marginBottom: "2rem" }}>
            Wystąpił poważny problem. Spróbuj odświeżyć stronę.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#6d28d9",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
