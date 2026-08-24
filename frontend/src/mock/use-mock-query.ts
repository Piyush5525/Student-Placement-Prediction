import { useEffect, useState } from "react";

/**
 * Simulates an async data fetch for a piece of mock data — gives every
 * dashboard page a real loading→loaded transition (and thus a genuine
 * reason to show its Skeleton state) without a backend. Deliberately not
 * wired through React Query: there's no server to cache against yet, and
 * routing static mock data through a query client would just be
 * decoration. Swapping this for `useQuery` later is a drop-in change —
 * callers only see `{ data, isLoading }`.
 */
export function useMockQuery<T>(data: T, delayMs = 650): { data: T | undefined; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return { data: isLoading ? undefined : data, isLoading };
}
