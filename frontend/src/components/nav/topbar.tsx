import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/context/auth-context";
import { useUiStore } from "@/stores/ui-store";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Topbar for /app/* — global search, notification bell, theme toggle,
 * avatar menu (FRONTEND_ARCHITECTURE §5). Search and notifications are
 * foundation-level chrome only; wiring them to real data/results is
 * page-level work.
 */
export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-bg-elevated px-4 md:px-8">
      <button
        type="button"
        className="flex items-center justify-center rounded-full p-2 text-text-secondary md:hidden"
        aria-label="Open menu"
        onClick={() => setMobileNavOpen(true)}
      >
        <span className="block h-0.5 w-5 bg-current before:absolute before:block before:h-0.5 before:w-5 before:-translate-y-1.5 before:bg-current after:absolute after:block after:h-0.5 after:w-5 after:translate-y-1.5 after:bg-current" />
      </button>

      <div className="hidden max-w-sm flex-1 md:block">
        <input
          type="search"
          placeholder="Search companies, skills, topics…"
          className="w-full rounded-full border border-border-subtle bg-bg-elevated-3 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-ink focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-full p-2.5 text-text-secondary transition-colors hover:bg-bg-elevated-2 hover:text-text-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            />
          </svg>
          {hasUnread && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-accent-ink" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-bg-elevated-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar name={user?.name ?? "Student"} size="sm" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DURATION.micro, ease: EASE.symmetric }}
                className="absolute right-0 top-full z-40 mt-2 w-48"
              >
                <GlassPanel blur="sm" className="flex flex-col gap-0.5 rounded-md p-1.5">
                  <Link
                    to="/app/profile"
                    className="rounded-sm px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/app/settings"
                    className="rounded-sm px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="rounded-sm px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    onClick={() => void logout()}
                  >
                    Sign out
                  </button>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
