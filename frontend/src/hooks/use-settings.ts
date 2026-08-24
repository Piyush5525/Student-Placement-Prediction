import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface NotificationSettings {
  new_prediction: boolean;
  weekly_digest: boolean;
  recommendation_alerts: boolean;
}

export interface AppearanceSettings {
  theme: string;
  density: string;
  reduced_motion: boolean;
}

export interface PrivacySettings {
  data_sharing_enabled: boolean;
}

export interface SettingsData {
  email: string;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
}

export interface SettingsUpdatePayload {
  notifications?: Partial<NotificationSettings>;
  appearance?: Partial<AppearanceSettings>;
  privacy?: Partial<PrivacySettings>;
}

/** Wraps GET/PUT /settings. */
export function useSettings() {
  const [data, setData] = useState<SettingsData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<SettingsData>("/settings");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your settings."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateSettings = useCallback(async (patch: SettingsUpdatePayload) => {
    const res = await apiClient.put<SettingsData>("/settings", patch);
    setData(res.data);
    return res.data;
  }, []);

  return { data, isLoading, error, refetch: fetchData, updateSettings };
}
