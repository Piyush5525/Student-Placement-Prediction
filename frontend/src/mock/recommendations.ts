export type ImpactLevel = "High" | "Medium" | "Low";

export interface RecommendedProject {
  id: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  skillsGained: string[];
  estimatedWeeks: number;
}

export const mockRecommendedProjects: RecommendedProject[] = [
  {
    id: "url-shortener",
    title: "Distributed URL Shortener",
    description: "Build a horizontally-scalable link shortener with caching and rate limiting.",
    impact: "High",
    skillsGained: ["System Design", "Caching", "Go"],
    estimatedWeeks: 3,
  },
  {
    id: "ml-recommender",
    title: "Course Recommendation Engine",
    description: "Collaborative-filtering recommender trained on a public dataset.",
    impact: "Medium",
    skillsGained: ["Machine Learning", "Python", "Statistics"],
    estimatedWeeks: 4,
  },
  {
    id: "realtime-dashboard",
    title: "Real-Time Analytics Dashboard",
    description: "WebSocket-driven dashboard visualizing streaming event data.",
    impact: "Medium",
    skillsGained: ["React", "WebSockets", "Data Visualization"],
    estimatedWeeks: 2,
  },
];

export interface RecommendedCertification {
  id: string;
  title: string;
  provider: string;
  impact: ImpactLevel;
  durationWeeks: number;
}

export const mockRecommendedCertifications: RecommendedCertification[] = [
  { id: "aws-ccp", title: "AWS Certified Cloud Practitioner", provider: "AWS", impact: "High", durationWeeks: 3 },
  { id: "sys-design", title: "System Design Fundamentals", provider: "Self-paced course", impact: "High", durationWeeks: 4 },
  { id: "sql-adv", title: "Advanced SQL for Data Roles", provider: "Self-paced course", impact: "Medium", durationWeeks: 2 },
];

export interface SuggestedTechnology {
  id: string;
  name: string;
  reason: string;
}

export const mockSuggestedTechnologies: SuggestedTechnology[] = [
  { id: "go", name: "Go", reason: "Appears in 3 of your top 5 matched companies' stacks." },
  { id: "kubernetes", name: "Kubernetes", reason: "Common requirement for infrastructure-heavy roles you match well with." },
  { id: "graphql", name: "GraphQL", reason: "Complements your existing REST API experience." },
];

export interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  status: "done" | "in-progress" | "upcoming";
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: LearningPathStep[];
}

export const mockLearningPaths: LearningPath[] = [
  {
    id: "backend-track",
    title: "Backend Engineer Track",
    description: "Closes your System Design and Distributed Systems gaps in sequence.",
    steps: [
      { id: "s1", title: "Data structures refresher", description: "Trees, graphs, hashing", status: "done" },
      { id: "s2", title: "System Design Primer course", description: "Load balancing, caching, sharding", status: "in-progress" },
      { id: "s3", title: "Build the URL shortener project", description: "Apply system design concepts", status: "upcoming" },
      { id: "s4", title: "Mock system-design interview", description: "Practice with a structured rubric", status: "upcoming" },
    ],
  },
];

export interface CareerGrowthRecommendation {
  id: string;
  title: string;
  description: string;
  horizon: "Now" | "Next 3 months" | "Next 6 months";
}

export const mockCareerGrowthRecommendations: CareerGrowthRecommendation[] = [
  { id: "c1", title: "Target mid-fit companies first", description: "Apply to Ledgerly and BrightCart now — high eligibility match, faster feedback loop.", horizon: "Now" },
  { id: "c2", title: "Close the System Design gap", description: "Your biggest lever — a 10-point gain here raises placement probability by an estimated 6%.", horizon: "Next 3 months" },
  { id: "c3", title: "Build a portfolio case study", description: "Document the URL shortener project with metrics — strengthens applications to Nimbus-tier companies.", horizon: "Next 6 months" },
];

export interface NextAction {
  id: string;
  title: string;
  reason: string;
  impact: ImpactLevel;
  href: string;
}

/** Dashboard "Recommended Next Actions" — short, specific, one destination each. */
export const mockNextActions: NextAction[] = [
  {
    id: "n1",
    title: "Improve DSA",
    reason: "System Design sits 23 points below target — your single biggest lever right now.",
    impact: "High",
    href: "/app/recommendations",
  },
  {
    id: "n2",
    title: "Complete another project",
    reason: "A 6th project with measurable impact strengthens applications to Nimbus-tier companies.",
    impact: "Medium",
    href: "/app/recommendations",
  },
  {
    id: "n3",
    title: "Improve aptitude score",
    reason: "71/100 — timed practice sets on your weakest question types close this fastest.",
    impact: "Medium",
    href: "/app/recommendations",
  },
];
