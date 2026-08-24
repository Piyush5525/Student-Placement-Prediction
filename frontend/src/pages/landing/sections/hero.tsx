import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { scrollToSmooth } from "@/lib/smooth-scroll";
import { DURATION, EASE } from "@/lib/motion";

function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>) {
  const id = event.currentTarget.getAttribute("href")?.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  event.preventDefault();
  const handled = scrollToSmooth(target, { offset: -24 });
  if (!handled) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Hero — Cosmoq-style structural bones (nav pill above, eyebrow badge,
 * giant two-line headline, centered dual CTA, floating glass dashboard
 * preview peeking from the bottom edge). The 3D/aurora atmosphere lives in
 * the persistent AmbientBackground mounted at the marketing layout root —
 * this section is content-only, full viewport height per
 * FRONTEND_ARCHITECTURE §6.1.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-24 pt-32"
    >
      {/* Aurora arc glow — a vivid, low horizon-line band echoing the
          reference's warm→cool arc, layered under the hero content and
          above AmbientBackground's ambient wash so it reads as this
          section's own accent rather than the page-wide atmosphere. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.recompute * 1.3, ease: EASE.expoOut, delay: 0.15 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%] overflow-hidden"
      >
        <div
          className="absolute inset-x-[-10%] bottom-[-30%] h-[140%] rounded-[100%] blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(245,177,76,0.16), rgba(110,91,255,0.14) 45%, rgba(34,211,238,0.12) 70%, transparent 85%)",
          }}
        />
      </motion.div>

      <div className="container relative z-10 flex max-w-content flex-col items-center px-4 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.page, ease: EASE.expoOut }}
          className="mb-6 inline-flex items-center rounded-full border border-border-subtle bg-bg-elevated/60 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-accent-ink backdrop-blur-sm"
        >
          AI-powered placement intelligence
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.page, ease: EASE.expoOut, delay: 0.1 }}
          className="max-w-3xl text-hero font-display font-semibold text-text-primary"
        >
          Know your placement odds
          <br />
          before you graduate
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.page, ease: EASE.expoOut, delay: 0.2 }}
          className="mt-6 max-w-xl text-base text-text-secondary md:text-md"
        >
          Upload your profile and let AI analyze 20+ signals — academics, skills, projects,
          activity — to predict your placement probability, salary range, and exactly what to
          improve next.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.page, ease: EASE.expoOut, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton>
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
            </Link>
          </MagneticButton>
          <MagneticButton>
            <a href="#how-it-works" onClick={handleAnchorClick}>
              <Button variant="ghost" size="lg">
                See how it works
              </Button>
            </a>
          </MagneticButton>
        </motion.div>

        {/* Floating glass preview card — dashboard peeking up from the bottom edge. */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.recompute, ease: EASE.expoOut, delay: 0.45 }}
          className="relative z-10 mt-16 w-full max-w-3xl translate-y-16"
        >
          <GlassPanel blur="lg" fill="mid" className="rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <span className="size-2.5 rounded-full bg-danger/60" />
              <span className="size-2.5 rounded-full bg-warning/60" />
              <span className="size-2.5 rounded-full bg-success/60" />
              <span className="ml-3 font-mono text-xs text-text-muted">
                placement-ai.app/app/dashboard
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-md border border-border-subtle bg-bg-elevated-2 p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Placement Probability
                </p>
                <p className="mt-2 bg-gradient-to-r from-accent-from to-accent-to bg-clip-text font-display text-3xl font-bold text-transparent">
                  78%
                </p>
                <p className="mt-1 text-xs text-success">Strong chance</p>
              </div>
              <div className="rounded-md border border-border-subtle bg-bg-elevated-2 p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Salary
                </p>
                <p className="mt-2 font-display text-xl font-bold text-text-primary">₹7.1L</p>
                <p className="mt-1 text-xs text-text-muted">predicted</p>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  );
}
