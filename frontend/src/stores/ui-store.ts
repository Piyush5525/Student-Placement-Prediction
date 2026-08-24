import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  /** Sidebar collapsed to icon-rail — persists across sessions (a user preference). */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;

  /** Mobile off-canvas drawer / marketing nav slide-in — ephemeral, not persisted. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      mobileNavOpen: false,
      setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
    }),
    {
      name: "placement-prediction-ui",
      // Only the durable preference is persisted — the transient drawer-open
      // flag is deliberately excluded so a reload never resumes with the
      // mobile drawer stuck open.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
