import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { NAV_CLUSTERS } from "@/lib/nav-items";

/**
 * Mobile bottom tab bar — 4 primary destinations per FRONTEND_ARCHITECTURE
 * §5 (Dashboard, Prediction, Skills, Profile), the rest reachable via the
 * hamburger drawer (AppMobileDrawer).
 */
const PRIMARY_ROUTES = ["/app/dashboard", "/app/prediction", "/app/skills", "/app/profile"];

export function MobileTabBar() {
  const items = NAV_CLUSTERS.flatMap((c) => c.items).filter((item) =>
    PRIMARY_ROUTES.includes(item.to),
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border-subtle bg-bg-elevated pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs",
              isActive ? "text-accent-ink" : "text-text-secondary",
            )
          }
        >
          <item.icon className="size-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
