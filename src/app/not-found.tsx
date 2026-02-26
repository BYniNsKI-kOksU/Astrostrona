import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl mb-6">🌌</div>
      <h1 className="font-display text-4xl font-bold text-night-100 mb-3">
        404 — Zgubiony w kosmosie
      </h1>
      <p className="text-night-400 max-w-md mb-8">
        Ta strona nie istnieje lub została pochłonięta przez czarną dziurę. 
        Spróbuj wrócić na stronę główną.
      </p>
      <Link href="/" className="btn-primary">
        Wróć na Ziemię
      </Link>
    </div>
  );
}
