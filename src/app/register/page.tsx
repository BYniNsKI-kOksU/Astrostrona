"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

const PASSWORD_RULES = [
  { label: "Min. 8 znaków", test: (p: string) => p.length >= 8 },
  { label: "Wielka litera", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Mała litera", test: (p: string) => /[a-z]/.test(p) },
  { label: "Cyfra", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Znak specjalny (!@#$%...)",
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptRules) {
      setError("Musisz zaakceptować regulamin");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      email,
      username,
      displayName,
      password,
    });

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Błąd rejestracji");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <span className="text-4xl">🔭</span>
            <span className="font-display text-3xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
              Astrofor
            </span>
          </Link>
          <p className="text-night-400 text-sm">Dołącz do społeczności astronomów!</p>
        </div>

        {/* Formularz */}
        <div className="glass-card rounded-2xl border border-night-700 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Błąd */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Adres e-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="twoj@email.pl"
                required
                autoComplete="email"
              />
            </div>

            {/* Nazwa użytkownika + Nazwa wyświetlana */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    className="input-field pl-8"
                    placeholder="user_name"
                    required
                    maxLength={20}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-night-300 mb-1.5">
                  Wyświetlana nazwa *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="Jan Kowalski"
                  required
                  maxLength={50}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Hasło */}
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Hasło *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
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

              {/* Siła hasła */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : passwordStrength <= 4
                              ? "bg-blue-500"
                              : "bg-green-500"
                            : "bg-night-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {PASSWORD_RULES.map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-1 text-xs"
                      >
                        {rule.test(password) ? (
                          <HiOutlineCheckCircle className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <HiOutlineXMark className="h-3.5 w-3.5 text-night-600" />
                        )}
                        <span
                          className={
                            rule.test(password)
                              ? "text-green-400"
                              : "text-night-500"
                          }
                        >
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Potwierdzenie hasła */}
            <div>
              <label className="block text-sm font-medium text-night-300 mb-1.5">
                Powtórz hasło *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-field ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? "border-green-500/50 focus:ring-green-500/30"
                      : "border-red-500/50 focus:ring-red-500/30"
                    : ""
                }`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1">Hasła nie są takie same</p>
              )}
            </div>

            {/* Regulamin */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptRules}
                onChange={(e) => setAcceptRules(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-night-600 bg-night-800 text-cosmos-500 focus:ring-cosmos-500/50"
              />
              <span className="text-xs text-night-400">
                Akceptuję{" "}
                <Link
                  href="/rules"
                  className="text-cosmos-400 hover:text-cosmos-300 underline"
                  target="_blank"
                >
                  regulamin
                </Link>{" "}
                i{" "}
                <Link
                  href="/privacy"
                  className="text-cosmos-400 hover:text-cosmos-300 underline"
                  target="_blank"
                >
                  politykę prywatności
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !acceptRules || !passwordsMatch}
              className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Rejestracja...
                </span>
              ) : (
                "Zarejestruj się"
              )}
            </button>
          </form>
        </div>

        {/* Link do logowania */}
        <p className="text-center text-sm text-night-400 mt-6">
          Masz już konto?{" "}
          <Link
            href="/login"
            className="text-cosmos-400 hover:text-cosmos-300 font-medium transition-colors"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
