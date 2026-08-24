import { GlassPanel } from "@/components/ui/glass-panel";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const STATS: { value: number; prefix?: string; suffix: string; label: string }[] = [
  { value: 100000, suffix: "+", label: "student profiles analyzed" },
  { value: 92, suffix: "%", label: "prediction confidence" },
  { value: 500, suffix: "+", label: "companies mapped" },
  { value: 18, prefix: "+", suffix: "%", label: "avg. salary uplift after skill plan" },
];

/**
 * Animated statistics band — FRONTEND_ARCHITECTURE §6.1.3. Glass card row,
 * counters count up once on scroll-into-view.
 */
export function Statistics() {
  return (
    <section className="relative py-18 md:py-24">
      <div className="container max-w-content px-4">
        <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <RevealItem key={stat.label}>
              <GlassPanel
                interactive
                blur="md"
                fill="light"
                className="flex h-full flex-col items-center gap-1.5 rounded-md px-4 py-8 text-center"
              >
                <p className="font-display text-3xl font-bold text-text-primary md:text-4xl">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-text-secondary md:text-sm">{stat.label}</p>
              </GlassPanel>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
