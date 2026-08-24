import { Outlet, useLocation } from "react-router-dom";
import { MarketingNav } from "@/components/nav/marketing-nav";
import { MarketingMobileDrawer } from "@/components/nav/marketing-mobile-drawer";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { AmbientBackground } from "@/components/three/ambient-background";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

/**
 * Bare layout for the public marketing/auth surface — landing, login,
 * signup, forgot-password (FRONTEND_ARCHITECTURE §5). No sidebar. GSAP's
 * ScrollTrigger plugin registers at module-eval time in lib/gsap.ts, not
 * here — see that file for why. SmoothScrollProvider is scoped here too,
 * since it's driven by the same GSAP ticker and only the marketing surface
 * has the pinned/scrubbed sections that benefit from inertial scroll.
 *
 * AmbientBackground mounts here — once, for the whole marketing surface —
 * rather than per-section, so it's a persistent atmosphere sections scroll
 * over instead of a scene that mounts/unmounts per section.
 *
 * MarketingNav is suppressed on auth routes: AuthLayout renders its own
 * minimal top bar (logo + switch link) per §6.2, so showing both stacked
 * two navs on top of each other — the marketing pill nav serves no purpose
 * on a single-task auth screen anyway.
 */
export function MarketingLayout() {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-bg-base text-text-primary">
        <AmbientBackground />
        {!isAuthRoute && (
          <>
            <MarketingNav />
            <MarketingMobileDrawer />
          </>
        )}
        <main className="relative z-10">
          <Outlet />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
