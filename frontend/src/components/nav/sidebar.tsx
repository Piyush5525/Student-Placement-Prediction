import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { NAV_CLUSTERS, logoutIcon as LogoutIcon } from "@/lib/nav-items";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/context/auth-context";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Persistent left sidebar for /app/* — FRONTEND_ARCHITECTURE §5. Active
 * route: accent-gradient left border + filled icon. Collapses to an
 * icon-rail via the `sidebarCollapsed` UI store flag (auto-collapse at
 * `lg` breakpoint is handled by the consumer/AppShell via a resize
 * listener, kept out of this component so it stays a pure presentation
 * piece driven by one boolean).
 */
export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const { logout } = useAuth();

  return (
    <motion.aside
      layout
      transition={{ duration: DURATION.component, ease: EASE.expoOut }}
      style={{ width: collapsed ? 76 : 248 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle bg-bg-elevated py-6 md:flex"
    >
      <div className={cn("mb-8 px-5", collapsed && "px-0 text-center")}>
        <Link
          to="/"
          className="font-display text-sm font-semibold text-text-primary transition-opacity hover:opacity-80"
        >
          {collapsed ? "P" : (
            <>
              Placement<span className="text-accent-ink">AI</span>
            </>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 scrollbar-none">
        {NAV_CLUSTERS.map((cluster) => (
          <div key={cluster.id} className="flex flex-col gap-1 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0">
            {cluster.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-sm border-l-[3px] border-transparent px-2.5 py-2.5 text-sm transition-colors",
                    isActive
                      ? "border-l-accent-solid bg-accent-soft text-text-primary"
                      : "text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary",
                    collapsed && "justify-center",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive ? "text-accent-ink" : "text-text-secondary group-hover:text-text-primary",
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border-subtle px-3 pt-3">
        <button
          type="button"
          onClick={() => void logout()}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-elevated-2 hover:text-danger",
            collapsed && "justify-center",
          )}
        >
          <LogoutIcon className="size-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
