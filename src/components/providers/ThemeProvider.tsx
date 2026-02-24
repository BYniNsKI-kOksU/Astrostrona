"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "dark" | "light" | "midnight" | "amoled";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: "small" | "normal" | "large";
  setFontSize: (size: "small" | "normal" | "large") => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [fontSize, setFontSizeState] = useState<"small" | "normal" | "large">("normal");
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("astrofor-theme") as Theme | null;
    if (saved) setThemeState(saved);
    const savedFont = localStorage.getItem("astrofor-fontsize") as "small" | "normal" | "large" | null;
    if (savedFont) setFontSizeState(savedFont);
    const savedMotion = localStorage.getItem("astrofor-reduced-motion");
    if (savedMotion === "true") setReducedMotionState(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Usuwamy stare klasy
    root.classList.remove("theme-dark", "theme-light", "theme-midnight", "theme-amoled");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("astrofor-theme", theme);

    // Font size
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (fontSize === "small") root.classList.add("text-sm");
    else if (fontSize === "large") root.classList.add("text-lg");
    localStorage.setItem("astrofor-fontsize", fontSize);

    // Reduced motion
    if (reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    localStorage.setItem("astrofor-reduced-motion", String(reducedMotion));
  }, [theme, fontSize, reducedMotion, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setFontSize = (s: "small" | "normal" | "large") => setFontSizeState(s);
  const setReducedMotion = (v: boolean) => setReducedMotionState(v);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, fontSize, setFontSize, reducedMotion, setReducedMotion }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
