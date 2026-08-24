/** Mock placement-prediction & salary-intelligence data — see mock/README-like note in student-profile.ts. */

export interface FactorContribution {
  label: string;
  /** Signed percentage-point contribution to the overall probability. */
  impact: number;
  explanation: string;
}

export interface PredictionHistoryPoint {
  date: string;
  probability: number;
  salaryLpa: number;
}

export const mockPlacementProbability = 78;
export const mockConfidenceScore = 92;
export const mockPredictionVerdict = "Strong chance of placement";

export const mockFactorContributions: FactorContribution[] = [
  { label: "CGPA", impact: 14, explanation: "Your 8.4 CGPA sits in the top quartile for your branch." },
  { label: "Internships", impact: 11, explanation: "2 internships signal real-world exposure recruiters value." },
  { label: "Coding Score", impact: 9, explanation: "78/100 coding score is above the placement-line average of 64." },
  { label: "Projects", impact: 6, explanation: "5 completed projects, 3 with public repos." },
  { label: "Communication Score", impact: -4, explanation: "66/100 is slightly below the benchmark for target roles." },
  { label: "Backlogs", impact: 0, explanation: "No active backlogs — neutral, as expected." },
  { label: "Mock Interview Score", impact: -3, explanation: "69/100 — practice interviews trend below your other scores." },
];

export const mockPredictionHistory: PredictionHistoryPoint[] = [
  { date: "Mar 2026", probability: 61, salaryLpa: 5.8 },
  { date: "Apr 2026", probability: 65, salaryLpa: 6.0 },
  { date: "May 2026", probability: 68, salaryLpa: 6.2 },
  { date: "Jun 2026", probability: 70, salaryLpa: 6.4 },
  { date: "Jul 2026", probability: 74, salaryLpa: 6.8 },
  { date: "Aug 2026", probability: 78, salaryLpa: 7.1 },
];

export type PlacementStatus = "on-track" | "at-risk" | "strong";

export const mockPlacementStatus: { label: string; status: PlacementStatus; note: string }[] = [
  { label: "Academic Standing", status: "strong", note: "CGPA + attendance well above cutoff" },
  { label: "Technical Readiness", status: "on-track", note: "Coding score improving, 1 cert short of target" },
  { label: "Interview Readiness", status: "at-risk", note: "Mock interview score below target band" },
];

// ---- Salary Intelligence ----

export const mockPredictedSalaryLpa = 7.1;
export const mockSalaryRangeLpa: [number, number] = [6.2, 8.4];

export interface SalaryComparisonPoint {
  label: string;
  value: number;
  isOwn?: boolean;
}

export const mockSalaryComparison: SalaryComparisonPoint[] = [
  { label: "You", value: 7.1, isOwn: true },
  { label: "Branch Avg", value: 6.3 },
  { label: "College Tier Avg", value: 5.9 },
  { label: "Platform Avg", value: 6.6 },
];

export interface SalaryDistributionBucket {
  range: string;
  count: number;
}

export const mockSalaryDistribution: SalaryDistributionBucket[] = [
  { range: "3-5", count: 12 },
  { range: "5-7", count: 34 },
  { range: "7-9", count: 28 },
  { range: "9-11", count: 14 },
  { range: "11-13", count: 6 },
  { range: "13+", count: 3 },
];

export interface CompensationComponent {
  label: string;
  amountLpa: number;
  description: string;
}

export const mockCompensationBreakdown: CompensationComponent[] = [
  { label: "Base Salary", amountLpa: 5.4, description: "Fixed annual component" },
  { label: "Performance Bonus", amountLpa: 0.9, description: "Variable, avg. payout" },
  { label: "Joining Bonus", amountLpa: 0.5, description: "One-time, year 1 only" },
  { label: "ESOPs / RSUs", amountLpa: 0.3, description: "Vested over 4 years" },
];

export interface IndustryComparisonPoint {
  industry: string;
  avgLpa: number;
}

export const mockIndustryComparison: IndustryComparisonPoint[] = [
  { industry: "Product (SaaS)", avgLpa: 8.2 },
  { industry: "Fintech", avgLpa: 7.6 },
  { industry: "IT Services", avgLpa: 5.1 },
  { industry: "E-commerce", avgLpa: 6.9 },
  { industry: "Consulting", avgLpa: 7.0 },
];
