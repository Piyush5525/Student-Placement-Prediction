import { useEffect, useId, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/nav/contact-modal";
import { UserMenu } from "@/components/nav/user-menu";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { scrollToSmooth } from "@/lib/smooth-scroll";
import { DURATION, EASE, LAYOUT_SPRING } from "@/lib/motion";
import { useScrollStore } from "@/stores/scroll-store";

/**
 * Nav links per FRONTEND_ARCHITECTURE §5/§6.1 — Product, Features, How It
 * Works, About are in-page anchor scroll-spy targets; Contact opens a
 * modal rather than scrolling, since it's an action, not a section.
 */
const NAV_LINKS = [
  { label: "Product", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const;

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

/**
 * Floating glass pill nav — Cosmoq-style, transparent-over-hero → glass on
 * scroll past 80px (FRONTEND_ARCHITECTURE §5). Active link tracks the
 * section currently in view (IntersectionObserver scroll-spy, §6.1 User
 * Interactions); only runs on "/" since that's the only route with these
 * section IDs to spy on.
 */
export function MarketingNav() {
  const navIndicatorId = useId();
  const [activeSection, setActiveSection] = useState("top");
  const [contactOpen, setContactOpen] = useState(false);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  // Derived from the shared scroll store (Lenis/GSAP) rather than its own
  // `window` scroll listener — §3.2 "one shared scroll-progress context."
  const scrolled = useScrollStore((s) => s.scrollY > 80);

  useEffect(() => {
    if (!isLandingPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLandingPage]);

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isLandingPage) return; // let the Link-style navigation to "/" + hash happen natively
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const handled = scrollToSmooth(target, { offset: id === "top" ? 0 : -24 });
    if (!handled) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.page, ease: EASE.expoOut }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <GlassPanel
        as="nav"
        blur={scrolled ? "lg" : "sm"}
        fill={scrolled ? "mid" : "light"}
        className={cn(
          "flex w-full max-w-3xl items-center justify-between gap-6 rounded-full px-4 py-2.5 transition-[background-color] duration-component",
          !scrolled && "border-transparent shadow-none",
        )}
      >
        <Link to="/" className="font-display text-sm font-semibold text-text-primary">
          Placement<span className="text-accent-ink">AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = isLandingPage && activeSection === link.href.slice(1);
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => handleAnchorClick(event, link.href)}
                className={cn(
                  "relative rounded-full px-3 py-1.5 text-sm transition-colors",
                  isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={navIndicatorId}
                    transition={LAYOUT_SPRING}
                    className="absolute inset-0 -z-10 rounded-full bg-bg-elevated-2"
                  />
                )}
                {link.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="rounded-full px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Contact
          </button>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">
                Log in
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-full p-2 text-text-secondary md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <motion.span
            animate={{ rotate: mobileNavOpen ? 45 : 0 }}
            className="block h-0.5 w-5 bg-current"
          />
        </button>
      </GlassPanel>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </motion.header>
  );
}
