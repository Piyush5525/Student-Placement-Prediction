import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface RecommendedCompany {
  id: string;
  name: string;
  industry: string;
  fit_score: number;
  salary_range_lpa: [number, number];
  required_skills: string[];
  matched_skills: string[];
  logo_initial: string;
}

export interface RecommendedSkill {
  id: string;
  skill: string;
  current: number;
  target: number;
  priority: string;
  suggestion: string;
}

export interface RecommendationsData {
  companies: RecommendedCompany[];
  skills: RecommendedSkill[];
}

/** Mirrors GET /recommendations exactly (snake_case, per the backend contract). */
export function useRecommendations() {
  const [data, setData] = useState<RecommendationsData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<RecommendationsData>("/recommendations");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your recommendations."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
