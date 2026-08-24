export type KeywordSeverity = "matched" | "missing" | "weak";

export interface KeywordEntry {
  id: string;
  keyword: string;
  severity: KeywordSeverity;
  section: string;
}

export const mockResumeKeywords: KeywordEntry[] = [
  { id: "k1", keyword: "React", severity: "matched", section: "Skills" },
  { id: "k2", keyword: "TypeScript", severity: "matched", section: "Skills" },
  { id: "k3", keyword: "REST APIs", severity: "matched", section: "Experience" },
  { id: "k4", keyword: "System Design", severity: "missing", section: "Skills" },
  { id: "k5", keyword: "Docker", severity: "missing", section: "Skills" },
  { id: "k6", keyword: "Unit Testing", severity: "weak", section: "Experience" },
  { id: "k7", keyword: "CI/CD", severity: "missing", section: "Experience" },
  { id: "k8", keyword: "Data Structures", severity: "matched", section: "Education" },
  { id: "k9", keyword: "SQL", severity: "weak", section: "Skills" },
];

export type SectionStatus = "present" | "weak" | "missing";

export interface ResumeSectionAudit {
  id: string;
  section: string;
  status: SectionStatus;
  yourResume: string;
  expected: string;
}

export const mockResumeSectionAudit: ResumeSectionAudit[] = [
  { id: "s1", section: "Summary", status: "present", yourResume: "2-line summary present", expected: "A 2–3 line summary tailored to the target role" },
  { id: "s2", section: "Skills", status: "weak", yourResume: "9 skills listed, no proficiency levels", expected: "8–12 skills grouped by category (languages / frameworks / tools)" },
  { id: "s3", section: "Experience", status: "present", yourResume: "2 entries, quantified impact on 1", expected: "Each entry has 2–4 bullet points with a measurable outcome" },
  { id: "s4", section: "Projects", status: "present", yourResume: "3 projects listed with tech stacks", expected: "2–4 projects with tech stack + measurable outcome" },
  { id: "s5", section: "Education", status: "present", yourResume: "Complete with CGPA", expected: "Institution, degree, CGPA, graduation year" },
  { id: "s6", section: "Certifications", status: "missing", yourResume: "None listed", expected: "At least 1 relevant certification strengthens ATS match" },
];

export interface ResumeVersion {
  id: string;
  label: string;
  uploadedAt: string;
  atsScore: number;
}

export const mockResumeVersions: ResumeVersion[] = [
  { id: "v3", label: "resume_v3_final.pdf", uploadedAt: "2026-08-10", atsScore: 72 },
  { id: "v2", label: "resume_v2.pdf", uploadedAt: "2026-06-02", atsScore: 61 },
  { id: "v1", label: "resume_v1.pdf", uploadedAt: "2026-03-14", atsScore: 48 },
];

export const mockAtsScore = 72;
export const mockAtsVerdict = "Good ATS compatibility — a few structural gaps hold it back from Strong.";
