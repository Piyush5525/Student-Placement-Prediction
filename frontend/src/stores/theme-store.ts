import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeChoice = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";

interface ThemeState {
  theme: ThemeChoice;
  /** Explicit override, independent of OS `prefers-reduced-motion` — Settings §14. */
  reducedMotionOverride: boolean;
  density: Density;
  setTheme: (theme: ThemeChoice) => void;
  setReducedMotionOverride: (value: boolean) => void;
  setDensity: (density: Density) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      reducedMotionOverride: false,
      density: "comfortable",
      setTheme: (theme) => set({ theme }),
      setReducedMotionOverride: (reducedMotionOverride) => set({ reducedMotionOverride }),
      setDensity: (density) => set({ density }),
    }),
    { name: "placement-prediction-theme" },
  ),
);
