import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/motion/tilt-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const FEATURES: {
  title: string;
  description: string;
  preview: string | null;
  comingSoon?: boolean;
}[] = [
  {
    title: "Resume Analyzer",
    description: "ATS score, missing keywords, and AI feedback on your resume.",
    preview: "72/100",
  },
  {
    title: "Interview Preparation",
    description: "HR and technical questions, difficulty levels, company-specific prep.",
    preview: "42 Qs",
  },
  {
    title: "Leaderboard",
    description: "See how you rank on coding score, probability, and improvement.",
    preview: "#312",
  },
  {
    title: "Analytics",
    description: "A deep-dive on your trends, score composition, and study habits.",
    preview: "+6%",
  },
  {
    title: "Progress Tracking",
    description: "Every prediction run, logged — see exactly how far you've come.",
    preview: "18 runs",
  },
  {
    title: "Mock Tests",
    description: "Timed practice tests mirroring real placement assessments.",
    preview: null,
    comingSoon: true,
  },
];

/**
 * Interactive feature grid — FRONTEND_ARCHITECTURE §6.1.6, anchor target
 * "Features". Bento-style 3-col grid, hover-tilt per card, micro-preview
 * reveal on hover.
 */
export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">
            Features
          </span>
          <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary">
            Everything you need to prepare
          </h2>
          <p className="mt-3 text-sm text-text-secondary md:text-base">
            One connected system — not a stack of disconnected tools.
          </p>
        </Reveal>

        <RevealGroup
          staggerChildren={0.08}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <RevealItem key={feature.title}>
              <TiltCard>
                <Card interactive padding="default" className="group relative h-full overflow-hidden">
                  {/* Ambient glow, GPU-composited (opacity only) — reinforces the tilt with a subtle spotlight rather than moving layout. */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-md opacity-0 transition-opacity duration-page group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(220px circle at 20% 0%, rgba(124,108,255,0.12), transparent 60%)",
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <h3 className="text-md font-semibold text-text-primary transition-transform duration-component group-hover:translate-x-0.5">
                      {feature.title}
                    </h3>
                    {feature.comingSoon && <Badge tone="info">Coming soon</Badge>}
                  </div>
                  <p className="relative mt-2 text-sm text-text-secondary">{feature.description}</p>

                  {feature.preview && (
                    <div className="relative mt-6 flex items-center justify-between rounded-sm border border-border-subtle bg-bg-elevated-2 px-3 py-2 opacity-0 transition-[opacity,transform] duration-component -translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
                        preview
                      </span>
                      <span className="font-mono text-sm text-accent-ink">{feature.preview}</span>
                    </div>
                  )}
                </Card>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
