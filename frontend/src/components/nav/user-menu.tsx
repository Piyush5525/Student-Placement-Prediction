import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from "@/context/auth-context";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

const MENU_ITEMS = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Profile", to: "/app/profile" },
  { label: "Settings", to: "/app/settings" },
] as const;

/**
 * Authenticated-state nav control — avatar trigger + accessible dropdown
 * (Dashboard / Profile / Settings / Sign out). Replaces "Log in" + CTA once
 * a session exists, on both the marketing nav and its mobile drawer.
 *
 * Sign out is the only action that clears the session — navigating to any
 * menu item is a plain client-side route change, so the session persists
 * (zustand `persist` store, untouched) and nothing forces a page reload.
 */
export function UserMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  useClickOutside([triggerRef, menuRef], () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleNavigate(to: string) {
    setOpen(false);
    navigate(to);
  }

  function handleSignOut() {
    setOpen(false);
    // Fire-and-forget: logout() clears the local session synchronously in
    // its `finally` regardless of whether the server-side revoke call
    // succeeds, so the UI doesn't need to wait on it.
    void logout();
    navigate("/");
  }

  return (
    <div className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.18, ease: EASE.expoOut }}
        className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
      >
        <Avatar name={user?.name ?? "Student"} size="sm" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE.expoOut }}
            className="absolute right-0 top-full z-40 mt-2 w-44 origin-top-right"
          >
            <GlassPanel blur="lg" fill="mid" className="flex flex-col gap-0.5 rounded-md p-1.5">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-text-primary">{user?.name ?? "Student"}</p>
                {user?.email && <p className="truncate text-xs text-text-muted">{user.email}</p>}
              </div>
              <div className="h-px bg-border-subtle" />
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  role="menuitem"
                  onClick={() => handleNavigate(item.to)}
                  className={cn(
                    "rounded-sm px-3 py-2 text-left text-sm text-text-secondary transition-colors duration-150",
                    "hover:bg-bg-elevated-2 hover:text-text-primary",
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-border-subtle" />
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="rounded-sm px-3 py-2 text-left text-sm text-danger transition-colors duration-150 hover:bg-danger/10"
              >
                Sign out
              </button>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
