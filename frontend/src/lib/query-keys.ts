/**
 * Centralized query key factory. Page-level data hooks (not yet built —
 * this is foundation only) should derive their keys from here rather than
 * hand-writing arrays, so cache invalidation after mutations (e.g.
 * "Re-run prediction" invalidating dashboard + prediction + analytics)
 * stays consistent across the whole app.
 */
export const queryKeys = {
  profile: () => ["profile"] as const,
  dashboard: () => ["dashboard"] as const,
  prediction: () => ["prediction"] as const,
  predictionSimulation: (scenario: Record<string, unknown>) =>
    ["prediction", "simulate", scenario] as const,
  salary: () => ["salary"] as const,
  companies: (filters?: Record<string, unknown>) => ["companies", filters ?? {}] as const,
  companyDetail: (id: string) => ["companies", id] as const,
  skills: (mode?: "benchmark" | "target-company", companyId?: string) =>
    ["skills", mode ?? "benchmark", companyId ?? null] as const,
  resume: () => ["resume"] as const,
  interviewQuestions: (category: string, companyId?: string) =>
    ["interview", "questions", category, companyId ?? null] as const,
  leaderboard: (lens: string, scope: string) => ["leaderboard", lens, scope] as const,
  analytics: (range: string) => ["analytics", range] as const,
} as const;
