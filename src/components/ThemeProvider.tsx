import { useEffect, createContext, useContext, type ReactNode } from "react";
import { getCurrentTheme, applyTheme } from "@/lib/theme";
import { useTheme, type Theme } from "@/hooks/useTheme";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useTheme();

  // Initialize theme from cookie on mount (before first render)
  useEffect(() => {
    const initialTheme = getCurrentTheme();
    applyTheme(initialTheme);
  }, []);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
