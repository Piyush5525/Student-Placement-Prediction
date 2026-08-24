import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "@/components/nav/sidebar";
import { Topbar } from "@/components/nav/topbar";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";
import { AppMobileDrawer } from "@/components/nav/app-mobile-drawer";
import { useUiStore } from "@/stores/ui-store";
import { PageTransition } from "@/components/motion/page-transition";

/**
 * Authenticated shell — persistent sidebar + topbar around a transitioning
 * content outlet (FRONTEND_ARCHITECTURE §5/§0). Sidebar/topbar never
 * remount on navigation; only the <Outlet> content animates between
 * routes via <PageTransition>, which is required for the smooth
 * page-transition requirement (§0 routing rationale).
 */
export function AppShell() {
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);

  // Auto-collapse to icon-rail at `lg` per FRONTEND_ARCHITECTURE §8 —
  // kept as a one-way floor (never force-expands a user's manual choice
  // back open above the breakpoint).
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1279px)");
    const apply = (matches: boolean) => {
      if (matches) setSidebarCollapsed(true);
    };
    apply(mql.matches);
    const listener = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [setSidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      <Sidebar />
      <AppMobileDrawer />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-32 pt-6 md:px-8 md:pb-10">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
