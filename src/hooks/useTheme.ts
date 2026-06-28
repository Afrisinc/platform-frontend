import { useState, useEffect, useCallback } from "react";
import {
  type Theme,
  getCurrentTheme,
  setThemeCookie,
  getResolvedTheme,
  applyTheme,
} from "@/lib/theme";

export type { Theme };

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from cookie or localStorage
    return getCurrentTheme();
  });

  const resolved = getResolvedTheme(theme);

  // Apply theme to DOM and persist
  useEffect(() => {
    applyTheme(theme);
    // Sync to both localStorage (backward compat) and cookie (cross-domain)
    localStorage.setItem("afrisinc-theme", theme);
    setThemeCookie(theme);
  }, [theme]);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "afrisinc-theme" && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (["light", "dark", "system"].includes(newTheme)) {
          setThemeState(newTheme);
        }
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return { theme, resolved, setTheme };
}
