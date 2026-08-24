import { useCallback, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import type { PredictionResult, PredictionScenario } from "@/hooks/use-prediction";

/** Wraps POST /onboarding — submits the 11 ML parameters once, writes them to the profile, marks onboarding complete, and returns the first real prediction. */
export function useOnboarding() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: PredictionScenario): Promise<PredictionResult> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post<PredictionResult>("/onboarding", payload);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, "Couldn't submit your details. Please try again.");
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}
