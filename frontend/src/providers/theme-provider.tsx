import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme-store";

/**
 * Stamps `data-theme` on <html> so tokens.css's three-state palette
 * (unstamped/system, [data-theme="dark"], [data-theme="light"]) resolves
 * correctly — see DESIGN_SYSTEM.html §02 for the theming contract this
 * mirrors.
 *
 * "system" is intentionally left UNSTAMPED (no data-theme attribute) rather
 * than resolved to a concrete value here, so the CSS `prefers-color-scheme`
 * media query stays the single source of truth and the page never fights
 * a stale JS-computed guess against a live OS theme change.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return <>{children}</>;
}
