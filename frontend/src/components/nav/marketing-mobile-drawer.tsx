import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { DURATION, EASE } from "@/lib/motion";

const ACCOUNT_LINKS = [
  { label: "Dashboard", to: "/app/dashboard" },
  { label: "Profile", to: "/app/profile" },
  { label: "Settings", to: "/app/settings" },
] as const;

const NAV_LINKS = [
  { label: "Product", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const;

/** Slide-in drawer — marketing nav's mobile collapse target (FRONTEND_ARCHITECTURE §5). */
export function MarketingMobileDrawer() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  function handleSignOut() {
    setOpen(false);
    clearSession();
    navigate("/");
  }

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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs p-4 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut }}
          >
            <GlassPanel blur="xl" fill="heavy" className="flex h-full flex-col gap-2 p-6">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-3 py-2.5 text-md text-text-secondary hover:bg-bg-elevated-2 hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar name={user?.name ?? "Student"} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{user?.name ?? "Student"}</p>
                        {user?.email && <p className="truncate text-xs text-text-muted">{user.email}</p>}
                      </div>
                    </div>
                    {ACCOUNT_LINKS.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                    <Button variant="danger" className="w-full" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      <Button variant="primary" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
