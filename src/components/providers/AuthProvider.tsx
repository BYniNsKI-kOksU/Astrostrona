"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types";
import { mockUsers } from "@/data";

// =============================================
// Mock baza użytkowników (hasła w pamięci)
// W produkcji -> backend + hashing bcrypt
// =============================================
interface MockAccount {
  email: string;
  password: string; // W produkcji NIGDY plaintext!
  userId: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  { email: "marek@astrofor.pl", password: "Test1234!", userId: "u1" },
  { email: "anna@astrofor.pl", password: "Test1234!", userId: "u2" },
  { email: "michal@astrofor.pl", password: "Test1234!", userId: "u3" },
];

// =============================================
// Auth Context
// =============================================
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAttempts: number;
  isLocked: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================
// Walidacja hasła
// =============================================
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Hasło musi mieć min. 8 znaków";
  if (!/[A-Z]/.test(password)) return "Hasło musi zawierać wielką literę";
  if (!/[a-z]/.test(password)) return "Hasło musi zawierać małą literę";
  if (!/[0-9]/.test(password)) return "Hasło musi zawierać cyfrę";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return "Hasło musi zawierać znak specjalny (!@#$%...)";
  return null;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanityzacja inputu — usuwanie potencjalnych skryptów
function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// =============================================
// Brute-force protection
// =============================================
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minut

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [accounts, setAccounts] = useState<MockAccount[]>(MOCK_ACCOUNTS);

  const isLocked = Date.now() < lockoutUntil;
  const isAuthenticated = !!user;

  // Sprawdź sesję przy starcie
  useEffect(() => {
    const savedAuth = localStorage.getItem("astrofor-auth-user");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        const foundUser = mockUsers.find((u) => u.id === parsed.userId);
        if (foundUser) {
          setUser(foundUser);
          // Ustaw cookie dla middleware
          document.cookie = `astrofor-auth=${parsed.userId}; path=/; max-age=86400; SameSite=Strict`;
        }
      } catch {
        localStorage.removeItem("astrofor-auth-user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Symulacja opóźnienia sieciowego
      await new Promise((r) => setTimeout(r, 500));

      // Sprawdź lockout
      if (Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        return {
          success: false,
          error: `Konto zablokowane. Spróbuj za ${remaining}s`,
        };
      }

      // Walidacja
      if (!email || !password) {
        return { success: false, error: "Podaj email i hasło" };
      }
      if (!validateEmail(email)) {
        return { success: false, error: "Nieprawidłowy format email" };
      }

      // Szukaj konta
      const account = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );

      if (!account) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_DURATION);
          setLoginAttempts(0);
          return {
            success: false,
            error: `Zbyt wiele prób. Konto zablokowane na 5 minut`,
          };
        }

        return {
          success: false,
          error: `Nieprawidłowy email lub hasło (próba ${newAttempts}/${MAX_LOGIN_ATTEMPTS})`,
        };
      }

      // Znajdź użytkownika
      const foundUser = mockUsers.find((u) => u.id === account.userId);
      if (!foundUser) {
        return { success: false, error: "Błąd serwera — nie znaleziono użytkownika" };
      }

      // Sukces
      setUser(foundUser);
      setLoginAttempts(0);
      localStorage.setItem(
        "astrofor-auth-user",
        JSON.stringify({ userId: foundUser.id, loginAt: Date.now() })
      );
      // Cookie dla middleware
      document.cookie = `astrofor-auth=${foundUser.id}; path=/; max-age=86400; SameSite=Strict`;

      return { success: true };
    },
    [accounts, loginAttempts, lockoutUntil]
  );

  // Register
  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
      await new Promise((r) => setTimeout(r, 500));

      // Walidacja
      if (!data.email || !data.username || !data.displayName || !data.password) {
        return { success: false, error: "Wszystkie pola są wymagane" };
      }
      if (!validateEmail(data.email)) {
        return { success: false, error: "Nieprawidłowy format email" };
      }
      const pwError = validatePassword(data.password);
      if (pwError) {
        return { success: false, error: pwError };
      }
      if (data.username.length < 3 || data.username.length > 20) {
        return { success: false, error: "Nazwa użytkownika: 3-20 znaków" };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        return { success: false, error: "Nazwa użytkownika: tylko litery, cyfry i _" };
      }

      // Sprawdź duplikaty
      if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: "Ten email jest już zarejestrowany" };
      }
      if (mockUsers.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
        return { success: false, error: "Ta nazwa użytkownika jest już zajęta" };
      }

      // Sanityzacja
      const safeName = sanitize(data.displayName);
      const safeUsername = sanitize(data.username);

      // "Utwórz" konto (mock)
      const newUserId = `u_${Date.now()}`;
      const newAccount: MockAccount = {
        email: data.email,
        password: data.password,
        userId: newUserId,
      };
      setAccounts((prev) => [...prev, newAccount]);

      // Logowanie od razu
      const newUser: User = {
        id: newUserId,
        username: safeUsername,
        displayName: safeName,
        avatar: "/avatars/default.png",
        bio: "",
        joinedAt: new Date().toISOString().split("T")[0],
        role: "newbie",
        badges: [],
        stats: { posts: 0, photos: 0, likes: 0, comments: 0, observations: 0 },
        gamification: {
          userId: newUserId,
          totalPoints: 0,
          currentTitleId: "title_ptolemeusz",
          achievements: [],
          joinedAt: new Date().toISOString(),
          streakDays: 0,
          longestStreak: 0,
        },
      };

      setUser(newUser);
      localStorage.setItem(
        "astrofor-auth-user",
        JSON.stringify({ userId: newUser.id, loginAt: Date.now() })
      );
      document.cookie = `astrofor-auth=${newUser.id}; path=/; max-age=86400; SameSite=Strict`;

      return { success: true };
    },
    [accounts]
  );

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("astrofor-auth-user");
    // Usuń cookie
    document.cookie = "astrofor-auth=; path=/; max-age=0; SameSite=Strict";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        loginAttempts,
        isLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
