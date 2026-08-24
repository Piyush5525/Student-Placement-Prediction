import { ScrollProgressIndicator } from "@/components/motion/scroll-progress-indicator";
import { Hero } from "./sections/hero";
import { Statistics } from "./sections/statistics";
import { HowItWorks } from "./sections/how-it-works";
import { FeatureShowcase } from "./sections/feature-showcase";
import { PredictionShowcase } from "./sections/prediction-showcase";
import { ResumeShowcase } from "./sections/resume-showcase";
import { InterviewShowcase } from "./sections/interview-showcase";
import { LeaderboardShowcase } from "./sections/leaderboard-showcase";
import { DashboardPreview } from "./sections/dashboard-preview";
import { Features } from "./sections/features";
import { About } from "./sections/about";
import { TrustBand } from "./sections/trust-band";
import { FinalCta } from "./sections/final-cta";
import { Footer } from "./sections/footer";

/**
 * Landing page — FRONTEND_ARCHITECTURE §6.1. Full-bleed single-column
 * scroll, dark canvas throughout. Cosmoq for structural layout (nav pill,
 * hero bones, floating preview card), Nolith for layered scroll-triggered
 * reveals. Five product-showcase sections (Prediction/Resume/Interview/
 * Leaderboard/Dashboard) sit after the pinned FeatureShowcase and before
 * the bento Features grid — each is a real preview of that page's own UI,
 * following a natural product-journey order rather than an arbitrary one.
 */
export function LandingPage() {
  return (
    <>
      <ScrollProgressIndicator />
      <Hero />
      <Statistics />
      <HowItWorks />
      <FeatureShowcase />
      <PredictionShowcase />
      <ResumeShowcase />
      <InterviewShowcase />
      <LeaderboardShowcase />
      <DashboardPreview />
      <Features />
      <About />
      <TrustBand />
      <FinalCta />
      <Footer />
    </>
  );
}
