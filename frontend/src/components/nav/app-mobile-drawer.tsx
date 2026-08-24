import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { GlassPanel } from "@/components/ui/glass-panel";
import { NAV_CLUSTERS, logoutIcon as LogoutIcon } from "@/lib/nav-items";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { DURATION, EASE } from "@/lib/motion";

/** Off-canvas drawer — full sidebar contents, for mobile/tablet AppShell. */
export function AppMobileDrawer() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-bg-base/60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.component }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs p-4 md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut }}
          >
            <GlassPanel blur="xl" fill="heavy" className="flex h-full flex-col gap-4 overflow-y-auto p-5">
              {NAV_CLUSTERS.map((cluster) => (
                <div
                  key={cluster.id}
                  className="flex flex-col gap-1 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0"
                >
                  {cluster.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm",
                          isActive
                            ? "bg-accent-soft text-text-primary"
                            : "text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary",
                        )
                      }
                    >
                      <item.icon className="size-5 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={clearSession}
                className="mt-auto flex items-center gap-3 rounded-sm border-t border-border-subtle px-3 pt-4 text-sm text-text-secondary hover:text-danger"
              >
                <LogoutIcon className="size-5" />
                Log out
              </button>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
