export type LeaderboardLens = "probability" | "coding" | "improved" | "skillRating";

export interface LeaderboardEntry {
  id: string;
  name: string;
  branch: string;
  collegeTier: "Tier 1" | "Tier 2" | "Tier 3";
  probability: number;
  codingScore: number;
  improvedDelta: number;
  skillRating: number;
  rankTrend: number[];
  isSelf?: boolean;
}

export const mockLeaderboardEntries: LeaderboardEntry[] = [
  { id: "s1", name: "Rohan Mehta", branch: "Computer Science", collegeTier: "Tier 1", probability: 96, codingScore: 94, improvedDelta: 4, skillRating: 91, rankTrend: [12, 9, 6, 3, 1] },
  { id: "s2", name: "Priya Nair", branch: "Information Technology", collegeTier: "Tier 1", probability: 94, codingScore: 90, improvedDelta: 2, skillRating: 89, rankTrend: [5, 4, 4, 3, 2] },
  { id: "s3", name: "Karan Verma", branch: "Computer Science", collegeTier: "Tier 2", probability: 91, codingScore: 88, improvedDelta: 9, skillRating: 85, rankTrend: [20, 15, 10, 5, 3] },
  { id: "s4", name: "Ishita Rao", branch: "Electronics", collegeTier: "Tier 1", probability: 89, codingScore: 85, improvedDelta: -1, skillRating: 87, rankTrend: [3, 3, 4, 4, 4] },
  { id: "s5", name: "Aditya Kulkarni", branch: "Computer Science", collegeTier: "Tier 2", probability: 87, codingScore: 83, improvedDelta: 6, skillRating: 80, rankTrend: [18, 14, 11, 7, 5] },
  { id: "s6", name: "Sneha Iyer", branch: "Information Technology", collegeTier: "Tier 2", probability: 85, codingScore: 81, improvedDelta: 1, skillRating: 78, rankTrend: [8, 8, 7, 7, 6] },
  { id: "s7", name: "Ananya Sharma", branch: "Computer Science", collegeTier: "Tier 2", probability: 78, codingScore: 78, improvedDelta: 4, skillRating: 74, rankTrend: [15, 13, 12, 9, 7], isSelf: true },
  { id: "s8", name: "Vivaan Joshi", branch: "Mechanical", collegeTier: "Tier 3", probability: 74, codingScore: 70, improvedDelta: -3, skillRating: 68, rankTrend: [6, 7, 8, 8, 8] },
  { id: "s9", name: "Meera Pillai", branch: "Computer Science", collegeTier: "Tier 3", probability: 71, codingScore: 68, improvedDelta: 2, skillRating: 66, rankTrend: [11, 11, 10, 9, 9] },
  { id: "s10", name: "Arjun Das", branch: "Electronics", collegeTier: "Tier 2", probability: 68, codingScore: 65, improvedDelta: 0, skillRating: 63, rankTrend: [10, 10, 10, 10, 10] },
];

export const SELF_ID = "s7";

export interface TopMover {
  id: string;
  name: string;
  delta: number;
}

export const mockTopMovers: TopMover[] = mockLeaderboardEntries
  .filter((e) => e.improvedDelta > 0)
  .sort((a, b) => b.improvedDelta - a.improvedDelta)
  .slice(0, 4)
  .map((e) => ({ id: e.id, name: e.name, delta: e.improvedDelta }));

export const mockSelfRankTrend = [
  { period: "Apr", rank: 42 },
  { period: "May", rank: 31 },
  { period: "Jun", rank: 22 },
  { period: "Jul", rank: 15 },
  { period: "Aug", rank: 7 },
];
