import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface ProfileData {
  name: string;
  email: string;
  branch: string;
  college_tier: string;
  batch_year: number;
  cgpa: number;
  internships_count: number;
  projects_count: number;
  certifications_count: number;
  coding_skill_score: number;
  aptitude_score: number;
  communication_skill_score: number;
  logical_reasoning_score: number;
  hackathons_participated: number;
  github_repos: number;
  linkedin_connections: number;
  mock_interview_score: number;
  attendance_percentage: number;
  backlogs: number;
  extracurricular_score: number;
  leadership_score: number;
  sleep_hours: number;
  study_hours_per_day: number;
  member_since: string;
  profile_completeness: number;
}

/**
 * Subset of ProfileData that PUT /profile actually accepts — see
 * backend/app/schemas/profile.py ProfileUpdateRequest. Notably excludes
 * email, batch_year, and every AI-assessed score (coding/aptitude/etc.),
 * which the profile page already renders read-only.
 */
export type ProfileUpdatePayload = Partial<
  Pick<
    ProfileData,
    | "name"
    | "branch"
    | "college_tier"
    | "cgpa"
    | "backlogs"
    | "attendance_percentage"
    | "internships_count"
    | "projects_count"
    | "certifications_count"
    | "hackathons_participated"
    | "github_repos"
    | "linkedin_connections"
    | "sleep_hours"
    | "study_hours_per_day"
  >
>;

/** Wraps GET/PUT /profile. */
export function useProfile() {
  const [data, setData] = useState<ProfileData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ProfileData>("/profile");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your profile."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateProfile = useCallback(async (patch: ProfileUpdatePayload) => {
    const res = await apiClient.put<ProfileData>("/profile", patch);
    setData(res.data);
    return res.data;
  }, []);

  return { data, isLoading, error, refetch: fetchData, updateProfile };
}
