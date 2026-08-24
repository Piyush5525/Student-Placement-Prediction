import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

/**
 * Mirrors GET /dashboard exactly (snake_case, per the backend contract).
 * Rewritten around the real trained model — no company data, no mocked
 * trend. `latest_prediction`/`input_summary`/`history` are null/empty until
 * the student completes onboarding (see backend/app/services/dashboard_service.py).
 */
export interface PredictionHistoryEntry {
  id: string;
  prediction: "Placed" | "NotPlaced";
  placement_probability: number;
  not_placed_probability: number;
  confidence: "Low" | "Medium" | "High";
  chance_category: "Low Chance" | "Moderate Chance" | "High Chance";
  created_at: string;
}

export interface InputSummary {
  cgpa: number;
  major_projects: number;
  workshops_certifications: number;
  mini_projects: number;
  skills: number;
  communication_skill_rating: number;
  twelfth_percentage: number;
  tenth_percentage: number;
  backlogs: number;
  internship: "Yes" | "No";
  hackathon: "Yes" | "No";
}

export interface InsightItem {
  label: string;
  tone: "strong" | "watch";
  explanation: string;
}

export interface DashboardData {
  student_name: string;
  branch: string;
  college_tier: string;
  onboarding_complete: boolean;
  latest_prediction: PredictionHistoryEntry | null;
  input_summary: InputSummary | null;
  history: PredictionHistoryEntry[];
  insights: InsightItem[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<DashboardData>("/dashboard");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your dashboard."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
