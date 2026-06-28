/**
 * Cross-domain theme persistence utility
 * Uses cookies with domain=.afrisinc.com to sync theme across all Afrisinc subdomains
 */

const THEME_COOKIE_NAME = "afrisinc_theme";
const THEME_COOKIE_DOMAIN = ".afrisinc.com";
const THEME_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export type Theme = "light" | "dark" | "system";

/**
 * Get theme preference from shared cookie
 * Returns null if cookie doesn't exist
 */
export function getThemeFromCookie(): Theme | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === THEME_COOKIE_NAME) {
      const decoded = decodeURIComponent(value);
      if (decoded === "light" || decoded === "dark" || decoded === "system") {
        return decoded;
      }
    }
  }
  return null;
}

/**
 * Set theme preference in shared cookie
 * Cookie is accessible from all .afrisinc.com subdomains
 */
export function setThemeCookie(theme: Theme): void {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + THEME_COOKIE_MAX_AGE * 1000);

  // Use domain cookie for production, omit domain for localhost
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const domainPart = isLocalhost ? "" : `; domain=${THEME_COOKIE_DOMAIN}`;

  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/${domainPart}; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
}

/**
 * Clear theme cookie (for logout or reset)
 */
export function clearThemeCookie(): void {
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const domainPart = isLocalhost ? "" : `; domain=${THEME_COOKIE_DOMAIN}`;

  document.cookie = `${THEME_COOKIE_NAME}=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

/**
 * Get current effective theme
 * Priority: cookie → localStorage → 'system'
 */
export function getCurrentTheme(): Theme {
  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) return cookieTheme;

  // Fallback to localStorage for backward compatibility
  const storageTheme = localStorage.getItem("afrisinc-theme");
  if (
    storageTheme &&
    (storageTheme === "light" || storageTheme === "dark" || storageTheme === "system")
  ) {
    return storageTheme as Theme;
  }

  return "system";
}

/**
 * Apply theme to DOM
 */
export function applyTheme(theme: Theme): void {
  const html = document.documentElement;

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.classList.toggle("dark", prefersDark);
    html.classList.toggle("light", !prefersDark);
  } else {
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("light", theme === "light");
  }
}

/**
 * Get the resolved theme (what's actually displayed)
 */
export function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}
