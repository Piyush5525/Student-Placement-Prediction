export interface SkillRadarPoint {
  skill: string;
  current: number;
  benchmark: number;
}

/** Radar axes mirror FRONTEND_ARCHITECTURE §6.4's dataset skill axes. */
export const mockSkillRadar: SkillRadarPoint[] = [
  { skill: "Coding", current: 78, benchmark: 64 },
  { skill: "Aptitude", current: 71, benchmark: 60 },
  { skill: "Communication", current: 66, benchmark: 68 },
  { skill: "Logical Reasoning", current: 74, benchmark: 62 },
  { skill: "System Design", current: 52, benchmark: 58 },
  { skill: "Academics", current: 84, benchmark: 70 },
];

export type SkillPriority = "High" | "Medium" | "Low";

export interface SkillGap {
  id: string;
  skill: string;
  current: number;
  target: number;
  priority: SkillPriority;
  trend: "up" | "down" | "flat";
  suggestion: string;
  resource: { label: string; provider: string };
}

export const mockSkillGaps: SkillGap[] = [
  {
    id: "system-design",
    skill: "System Design",
    current: 52,
    target: 75,
    priority: "High",
    trend: "up",
    suggestion: "Study load balancing, caching, and database sharding patterns.",
    resource: { label: "System Design Primer", provider: "Self-paced course" },
  },
  {
    id: "communication",
    skill: "Communication",
    current: 66,
    target: 80,
    priority: "High",
    trend: "flat",
    suggestion: "Practice structured answers using the STAR method in mock interviews.",
    resource: { label: "Behavioral Interview Mastery", provider: "Interview Prep" },
  },
  {
    id: "distributed-systems",
    skill: "Distributed Systems",
    current: 41,
    target: 65,
    priority: "Medium",
    trend: "up",
    suggestion: "Build a small project using message queues and eventual consistency.",
    resource: { label: "Distributed Systems for Practitioners", provider: "Self-paced course" },
  },
  {
    id: "aptitude",
    skill: "Quantitative Aptitude",
    current: 71,
    target: 82,
    priority: "Medium",
    trend: "up",
    suggestion: "Timed practice sets on permutations, probability, and data interpretation.",
    resource: { label: "Aptitude Speed Drills", provider: "Practice bank" },
  },
  {
    id: "cloud",
    skill: "Cloud Fundamentals",
    current: 38,
    target: 60,
    priority: "Low",
    trend: "flat",
    suggestion: "Complete a hands-on lab deploying a containerized service.",
    resource: { label: "Cloud Foundations Lab", provider: "Self-paced course" },
  },
];
