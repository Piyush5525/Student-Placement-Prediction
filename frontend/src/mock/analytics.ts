export interface ScoreCategory {
  label: string;
  value: number;
}

/** Ranked bar list — mirrors FRONTEND_ARCHITECTURE §6.12's score breakdown categories. */
export const mockScoreCategories: ScoreCategory[] = [
  { label: "Coding", value: 78 },
  { label: "Aptitude", value: 71 },
  { label: "Logical Reasoning", value: 74 },
  { label: "Communication", value: 66 },
  { label: "Extracurricular", value: 58 },
  { label: "Leadership", value: 52 },
].sort((a, b) => b.value - a.value);

export interface ActivityPoint {
  date: string;
  studyHours: number;
  sleepHours: number;
}

export const mockActivityTrend: ActivityPoint[] = [
  { date: "Mon", studyHours: 3.5, sleepHours: 6.2 },
  { date: "Tue", studyHours: 4.1, sleepHours: 6.5 },
  { date: "Wed", studyHours: 4.8, sleepHours: 6.0 },
  { date: "Thu", studyHours: 3.9, sleepHours: 6.8 },
  { date: "Fri", studyHours: 5.2, sleepHours: 6.1 },
  { date: "Sat", studyHours: 4.4, sleepHours: 7.4 },
  { date: "Sun", studyHours: 3.1, sleepHours: 7.8 },
];

export interface MilestoneRow {
  id: string;
  date: string;
  probability: number;
  salaryLpa: number;
  delta: string;
}

export const mockMilestoneHistory: MilestoneRow[] = [
  { id: "m1", date: "Aug 12, 2026", probability: 78, salaryLpa: 7.1, delta: "+4% probability, +₹0.3L" },
  { id: "m2", date: "Jul 3, 2026", probability: 74, salaryLpa: 6.8, delta: "+4% probability, +₹0.4L" },
  { id: "m3", date: "Jun 1, 2026", probability: 70, salaryLpa: 6.4, delta: "+2% probability, +₹0.2L" },
  { id: "m4", date: "May 2, 2026", probability: 68, salaryLpa: 6.2, delta: "+3% probability, +₹0.2L" },
  { id: "m5", date: "Apr 1, 2026", probability: 65, salaryLpa: 6.0, delta: "+4% probability, +₹0.2L" },
];

export const mockAnalyticsStats = {
  probability: 78,
  salaryLpa: 7.1,
  skillsOnTarget: "4/6",
  daysToNextMilestone: 21,
};
