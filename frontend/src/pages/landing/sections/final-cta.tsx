import { Link } from "react-router-dom";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";

/**
 * Final CTA — FRONTEND_ARCHITECTURE §6.1.9. Full-width glass panel,
 * particle/gradient background reprising the hero's material, single CTA.
 */
export function FinalCta() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <Reveal>
          <GlassPanel
            blur="lg"
            fill="mid"
            className="relative overflow-hidden rounded-lg px-6 py-16 text-center md:px-12 md:py-24"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 60% at 30% 0%, rgba(110,91,255,0.22), transparent 65%), radial-gradient(50% 60% at 70% 100%, rgba(34,211,238,0.18), transparent 65%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-xl text-2xl font-display font-semibold text-text-primary md:text-3xl">
                Start predicting your future
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-text-secondary md:text-base">
                Free to start. Takes under five minutes to see your first prediction.
              </p>
              <div className="mt-8 flex justify-center">
                <MagneticButton>
                  <Link to="/signup">
                    <Button variant="primary" size="lg">
                      Get Started
                    </Button>
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
