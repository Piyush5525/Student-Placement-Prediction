import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-in-view";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { EASE, REVEAL_IN_VIEW } from "@/lib/motion";

const STEPS = [
  {
    number: "01",
    title: "Enter your profile",
    description: "CGPA, branch, internships, projects, coding scores — the signals that matter.",
  },
  {
    number: "02",
    title: "AI analyzes 20+ signals",
    description: "The model weighs every input against outcomes from thousands of past students.",
  },
  {
    number: "03",
    title: "Get prediction + growth plan",
    description: "See your placement odds, salary range, and exactly what to improve next.",
  },
] as const;

/**
 * How It Works — FRONTEND_ARCHITECTURE §6.1.4. 3-step sequence with a
 * connecting animated progress line, revealed on scroll (Nolith-style
 * layered section reveal — steps fade/rise in sequence rather than at once).
 */
export function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>(REVEAL_IN_VIEW);

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="container max-w-content px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">
            How it works
          </span>
          <h2 className="mt-3 text-2xl font-display font-semibold text-text-primary">
            Three steps to your prediction
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          {/* Connecting line — draws in left→right as the section enters view. */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border-subtle md:block">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: inView ? 1 : 0 }}
              transition={{ duration: 1.1, ease: EASE.expoOut, delay: 0.2 }}
              style={{ transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-accent-from to-accent-to"
            />
          </div>

          <RevealGroup
            staggerChildren={0.15}
            className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
          >
            {STEPS.map((step) => (
              <RevealItem key={step.number} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <span className="flex size-12 items-center justify-center rounded-full border border-border-strong bg-bg-elevated font-mono text-sm text-accent-ink">
                  {step.number}
                </span>
                <h3 className="mt-5 text-md font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
