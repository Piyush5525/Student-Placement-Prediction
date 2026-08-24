import { QueryClient } from "@tanstack/react-query";

/**
 * React Query is the server-state layer for everything the FastAPI backend
 * returns (predictions, recommendations, resume analysis, leaderboard
 * rankings) — FRONTEND_ARCHITECTURE §0/§1. Defaults below are conservative
 * for a data product where stale predictions are actively misleading:
 * short staleTime, retry once, refetch on window focus so a student
 * returning to a tab sees current data rather than a cached snapshot.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
