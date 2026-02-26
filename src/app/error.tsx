"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl mb-6">☄️</div>
      <h1 className="font-display text-3xl font-bold text-night-100 mb-3">
        Coś poszło nie tak
      </h1>
      <p className="text-night-400 max-w-md mb-8">
        Wygląda na to, że napotkaliśmy kosmiczny błąd. Spróbuj odświeżyć stronę.
      </p>
      <button onClick={() => reset()} className="btn-primary">
        Spróbuj ponownie
      </button>
    </div>
  );
}
