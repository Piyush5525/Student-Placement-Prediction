import { useCallback, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface PredictionFactor {
  label: string;
  impact: number;
  explanation: string;
}

export interface PredictionResult {
  prediction: "Placed" | "NotPlaced";
  placement_probability: number;
  not_placed_probability: number;
  confidence: "Low" | "Medium" | "High";
  chance_category: "Low Chance" | "Moderate Chance" | "High Chance";
  verdict: string;
  factors: PredictionFactor[];
}

/**
 * The 11 features the trained placement model was actually built on (see
 * models/metadata.json `feature_order`). All fields are required — the
 * model has no defaults, so a partial payload isn't a real prediction.
 */
export interface PredictionScenario {
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

/**
 * Wraps POST /prediction, which now runs the real trained model (no more
 * mock arithmetic). `predict(scenario)` is exposed for the What-If
 * Simulator on prediction-page.tsx to call directly (debounced there),
 * while the hook itself fetches a baseline prediction on mount from the
 * student's profile-derived defaults.
 */
export function usePrediction() {
  const [data, setData] = useState<PredictionResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (scenario: PredictionScenario, saveToHistory = false) => {
    const res = await apiClient.post<PredictionResult>(
      "/prediction",
      scenario,
      saveToHistory ? { params: { save_to_history: true } } : undefined,
    );
    return res.data;
  }, []);

  const fetchBaseline = useCallback(
    async (scenario: PredictionScenario) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await predict(scenario);
        setData(result);
      } catch (err) {
        setError(getApiErrorMessage(err, "Couldn't load your prediction."));
      } finally {
        setIsLoading(false);
      }
    },
    [predict],
  );

  return { data, isLoading, error, fetchBaseline, predict };
}
