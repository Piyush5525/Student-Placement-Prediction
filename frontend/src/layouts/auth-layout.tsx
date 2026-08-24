import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Avatar } from "@/components/ui/avatar";
import { DURATION, EASE } from "@/lib/motion";

interface AuthLayoutProps {
  children: ReactNode;
  /** Right-side switch link, e.g. "Don't have an account? Sign up". */
  switchPrompt: ReactNode;
}

const TESTIMONIAL = {
  quote:
    "Seeing my placement probability broken into the exact factors holding it back changed how I spent my last two semesters.",
  name: "Ananya Sharma",
  role: "Placed @ Nimbus · Batch 2025",
};

/**
 * Split-screen auth layout — FRONTEND_ARCHITECTURE §6.2. Left 55% dark
 * brand panel (reprising hero's glow via the persistent AmbientBackground
 * already mounted at MarketingLayout root, plus a short value-prop +
 * testimonial), right 45% glass form card centered vertically. Mobile:
 * single column, brand panel collapses to a compact top banner.
 *
 * Minimal top bar (logo → home) lives here rather than per-page so Login/
 * Signup/ForgotPassword share one nav treatment, per §6.2 "Navigation."
 */
export function AuthLayout({ children, switchPrompt }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="font-display text-sm font-semibold text-text-primary">
          Placement<span className="text-accent-ink">AI</span>
        </Link>
        <span className="text-sm text-text-secondary">{switchPrompt}</span>
      </header>

      {/* Brand panel — value prop + testimonial, collapses to a compact banner on mobile. */}
      <div className="relative flex min-h-[32vh] flex-col justify-end overflow-hidden px-6 pb-8 pt-24 lg:min-h-screen lg:w-[55%] lg:justify-center lg:px-16 lg:pb-0 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.page, ease: EASE.expoOut }}
          className="relative z-10 max-w-md"
        >
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">
            AI-powered placement intelligence
          </span>
          <h1 className="mt-3 text-2xl font-display font-semibold text-text-primary lg:text-3xl">
            Know exactly where you stand — before the placement season does.
          </h1>
          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.page, ease: EASE.expoOut, delay: 0.2 }}
            className="mt-10 hidden items-start gap-3 lg:flex"
          >
            <Avatar name={TESTIMONIAL.name} size="md" className="mt-0.5 shrink-0" />
            <div className="border-l-2 border-accent-solid/40 pl-4">
              <p className="text-sm italic leading-relaxed text-text-secondary">"{TESTIMONIAL.quote}"</p>
              <footer className="mt-3 text-xs text-text-muted">
                <span className="font-semibold text-text-secondary">{TESTIMONIAL.name}</span> — {TESTIMONIAL.role}
              </footer>
            </div>
          </motion.blockquote>
        </motion.div>
      </div>

      {/* Form panel — true glass over the rich ambient backdrop (glassmorphism
          reference: warm/saturated blur, not a flat dark card), radial
          highlight in the corner echoing the reference's light-source feel. */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 pt-6 lg:w-[45%] lg:px-10 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <GlassPanel blur="xl" fill="mid" className="rounded-lg p-6 shadow-glass sm:p-8">
            {children}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
