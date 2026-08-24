import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface GitHubLanguage {
  language: string;
  bytes: number;
  percentage: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

export interface GitHubAccountData {
  connected: true;
  username: string;
  avatar_url: string | null;
  profile_url: string;
  public_repos_count: number;
  followers_count: number;
  following_count: number;
  top_languages: GitHubLanguage[];
  recent_repos: GitHubRepo[];
  recent_activity_count: number;
  developer_score: number;
  developer_score_breakdown: Record<string, number>;
  connected_at: string;
  last_synced_at: string;
}

export interface GitHubNotConnected {
  connected: false;
}

export type GitHubAccountState = GitHubAccountData | GitHubNotConnected;

/**
 * Wraps GET/POST/DELETE /integrations/github. `connect(code)` is called
 * from GitHubCallbackPage once GitHub redirects back with an authorization
 * code; the rest of the app (Settings' Connected Accounts row, the
 * analytics panel) reads `data` via this same hook.
 */
export function useGitHubIntegration() {
  const [data, setData] = useState<GitHubAccountState | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<GitHubAccountState>("/integrations/github");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your GitHub connection status."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const connect = useCallback(async (code: string) => {
    setIsConnecting(true);
    try {
      const res = await apiClient.post<GitHubAccountData>("/integrations/github/connect", { code });
      setData(res.data);
      return res.data;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const resync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await apiClient.post<GitHubAccountData>("/integrations/github/resync");
      setData(res.data);
      return res.data;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await apiClient.delete("/integrations/github");
    setData({ connected: false });
  }, []);

  return { data, isLoading, error, refetch: fetchData, connect, resync, disconnect, isConnecting, isSyncing };
}
