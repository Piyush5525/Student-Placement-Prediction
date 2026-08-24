import { Reveal } from "@/components/motion/reveal";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

const COLLEGES = [
  "IIT Delhi",
  "NIT Trichy",
  "BITS Pilani",
  "VIT Vellore",
  "IIIT Hyderabad",
  "Anna University",
  "Manipal Institute",
  "SRM Institute",
] as const;

/**
 * Trust band — FRONTEND_ARCHITECTURE §6.1.8 (optional social proof).
 * Horizontal auto-scroll marquee of college names, glass style. Duplicated
 * once for a seamless CSS-only loop (no JS scroll listener needed).
 */
export function TrustBand() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-border-subtle py-10">
      <Reveal className="mb-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
          Trusted by students from
        </p>
      </Reveal>

      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className={cn(
            "flex shrink-0 items-center gap-12 pr-12",
            !reducedMotion && "animate-marquee",
          )}
        >
          {[...COLLEGES, ...COLLEGES].map((college, i) => (
            <span
              key={`${college}-${i}`}
              className="whitespace-nowrap font-display text-lg font-medium text-text-muted"
            >
              {college}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
