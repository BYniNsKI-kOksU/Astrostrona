"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers";
import { useToast } from "@/components/ui";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const TEST_EMAILS = ["marek@astrofor.pl", "anna@astrofor.pl", "michal@astrofor.pl"];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login, isLocked, loginAttempts } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLocked) {
      setError("Konto zablokowane z powodu zbyt wielu nieudanych prób. Odczekaj 5 minut.");
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      // Toast w zależności od typu konta
      if (TEST_EMAILS.includes(email.toLowerCase())) {
        addToast({
          type: "warning",
          title: "⚠️ Konto testowe",
          message: "Zalogowano na konto demo. Nie używaj do prawdziwych danych — są publiczne.",
          duration: 7000,
        });
      } else {
        addToast({
          type: "success",
          title: "Zalogowano pomyślnie!",
          message: "Witaj z powrotem w Astrofor 🔭",
          duration: 4000,
        });
      }
      router.push(redirect);
      router.refresh();
    } else {
      setError(result.error || "Nieznany błąd logowania");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <span className="text-4xl">🔭</span>
            <span className="font-display text-3xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
              Astrofor
            </span>
          </Link>
          <p className="text-night-400 text-sm">Zaloguj się, aby kontynuować</p>
        </div>

        {/* Formularz */}
        <div className="glass-card rounded-2xl border border-night-700 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Komunikat błędu */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Blokada konta */}
            {isLocked && (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-xl text-sm">
                <HiOutlineLockClosed className="h-5 w-5 shrink-0 mt-0.5" />
                <span>
                  Konto tymczasowo zablokowane. Zbyt wiele nieudanych prób logowania.
                  Odczekaj 5 minut.
                </span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Adres e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="twoj@email.pl"
                required
                autoComplete="email"
                disabled={isLocked}
              />
            </div>

            {/* Hasło */}
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-night-500 hover:text-night-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Logowanie...
                </span>
              ) : (
                "Zaloguj się"
              )}
            </button>
          </form>

          {/* Testowe dane */}
          <div className="mt-6 pt-5 border-t border-night-700">
            <p className="text-xs text-night-500 font-semibold uppercase tracking-wider mb-2">
              🧪 Konta testowe
            </p>
            <div className="space-y-2 text-xs">
              {[
                { name: "Marek (Admin)", email: "marek@astrofor.pl" },
                { name: "Anna", email: "anna@astrofor.pl" },
                { name: "Michał", email: "michal@astrofor.pl" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("Test1234!");
                    setError("");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-night-800/50 hover:bg-night-800 text-night-400 hover:text-night-200 transition-colors"
                >
                  <span className="font-medium">{acc.name}</span>
                  <span className="text-night-600 ml-2">{acc.email}</span>
                </button>
              ))}
              <p className="text-night-600 mt-1">
                Hasło dla wszystkich: <code className="text-night-400">Test1234!</code>
              </p>
            </div>
          </div>
        </div>

        {/* Link do rejestracji */}
        <p className="text-center text-sm text-night-400 mt-6">
          Nie masz konta?{" "}
          <Link
            href="/register"
            className="text-cosmos-400 hover:text-cosmos-300 font-medium transition-colors"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="text-4xl">🔭</span>
            <span className="font-display text-3xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
              Astrofor
            </span>
          </div>
          <p className="text-night-400 text-sm">Ładowanie...</p>
        </div>
        <div className="glass-card rounded-2xl border border-night-700 p-6 sm:p-8 flex items-center justify-center min-h-[300px]">
          <span className="animate-spin h-8 w-8 border-2 border-cosmos-400/30 border-t-cosmos-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
