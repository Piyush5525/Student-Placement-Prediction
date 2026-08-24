import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/motion/reveal";

const CREDIBILITY = [
  { value: "Every branch", isNumeric: false },
  { value: 26, suffix: " signals", isNumeric: true },
  { value: "Retrained on fresh outcomes", isNumeric: false },
] as const;

/**
 * About — FRONTEND_ARCHITECTURE §6.1.7, anchor target "About". Compact
 * two-column block: mission statement + lightweight credibility strip.
 * Deliberately not a full "About Us" page — one or two paragraphs only.
 */
export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">
              About
            </span>
            <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary">
              Why placement prediction
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
              Most students prepare for placements blind — no sense of where they stand, which
              skills actually move the needle, or which companies are a realistic fit. We built
              this platform to replace that guesswork with a clear, data-driven picture, updated
              every time your profile changes.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary md:text-base">
              It's not a black box — every prediction comes with the factors behind it, so you
              always know exactly what to work on next.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col justify-center gap-3">
            {CREDIBILITY.map((item) => (
              <GlassPanel
                key={item.value.toString()}
                interactive
                blur="md"
                fill="light"
                className="flex items-center justify-between rounded-md px-5 py-4"
              >
                <span className="text-sm text-text-secondary">
                  {item.isNumeric ? "Trained across" : "Built for"}
                </span>
                <span className="font-display text-md font-semibold text-text-primary">
                  {item.isNumeric ? (
                    <AnimatedCounter value={item.value as number} suffix={item.suffix} />
                  ) : (
                    item.value
                  )}
                </span>
              </GlassPanel>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
