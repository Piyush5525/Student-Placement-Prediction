import { useCallback, useEffect, useState } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

export interface ResumeKeyword {
  id: string;
  keyword: string;
  severity: "matched" | "weak" | "missing";
  section: string;
}

export interface ResumeSectionAudit {
  id: string;
  section: string;
  status: string;
  your_resume: string;
  expected: string;
}

export interface ResumeVersion {
  id: string;
  label: string;
  uploaded_at: string;
  ats_score: number;
}

export interface ResumeAnalysis {
  ats_score: number;
  ats_verdict: string;
  keywords: ResumeKeyword[];
  section_audit: ResumeSectionAudit[];
  versions: ResumeVersion[];
}

export interface ResumeUploadResult {
  resume_id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  uploaded_at: string;
  status: string;
  message: string;
}

/**
 * Mirrors GET /resume (static mock analysis, per backend contract — NOT
 * derived from the uploaded file) and wraps POST /resume/upload.
 */
export function useResume() {
  const [data, setData] = useState<ResumeAnalysis | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<ResumeUploadResult | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ResumeAnalysis>("/resume");
      setData(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't load your resume analysis."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post<ResumeUploadResult>("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(res.data);
      return res.data;
    } catch (err) {
      const message = getApiErrorMessage(err, "Upload failed. Try a PDF, DOC, or DOCX under 5MB.");
      setUploadError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { data, isLoading, error, refetch: fetchData, upload, isUploading, uploadError, uploadResult };
}
