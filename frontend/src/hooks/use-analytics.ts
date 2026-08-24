import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface SkillGrowth {
  skill: string;
  current: number;
  benchmark: number;
}

export interface SalaryTrendPoint {
  date: string;
  salary_lpa: number;
}

export interface PlacementTrendPoint {
  date: string;
  probability: number;
}

export interface ScoreCategory {
  label: string;
  value: number;
}

export interface AnalyticsData {
  skills_growth: SkillGrowth[];
  salary_trend: SalaryTrendPoint[];
  placement_trend: PlacementTrendPoint[];
  score_categories: ScoreCategory[];
}

/** Mirrors GET /analytics exactly (snake_case, per the backend contract). */
export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<AnalyticsData>("/analytics");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your analytics."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
