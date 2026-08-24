export type QuestionCategory = "HR" | "Technical" | "Company-Specific";
export type QuestionDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type CompletionState = "unattempted" | "attempted" | "mastered";

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  question: string;
  guidance: string;
  estimatedMinutes: number;
  completion: CompletionState;
  companyId?: string;
}

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: "q1",
    category: "HR",
    difficulty: "Beginner",
    question: "Tell me about yourself.",
    guidance: "A strong answer covers: current academic focus, one or two concrete achievements, and why you're excited about this kind of role — kept under 90 seconds.",
    estimatedMinutes: 3,
    completion: "mastered",
  },
  {
    id: "q2",
    category: "HR",
    difficulty: "Intermediate",
    question: "Describe a time you disagreed with a teammate. How did you handle it?",
    guidance: "Use the STAR method — Situation, Task, Action, Result. Strong answers focus on the resolution process, not who was 'right.'",
    estimatedMinutes: 4,
    completion: "attempted",
  },
  {
    id: "q3",
    category: "HR",
    difficulty: "Advanced",
    question: "Why should we hire you over another candidate with a similar profile?",
    guidance: "Strong answers avoid generic claims ('I'm a hard worker') and instead name one specific, verifiable differentiator from your own experience.",
    estimatedMinutes: 3,
    completion: "unattempted",
  },
  {
    id: "q4",
    category: "Technical",
    difficulty: "Beginner",
    question: "What is the difference between an array and a linked list?",
    guidance: "Cover memory layout, access time (O(1) vs O(n)), and insertion/deletion cost. A strong answer gives a concrete use case for each.",
    estimatedMinutes: 4,
    completion: "mastered",
  },
  {
    id: "q5",
    category: "Technical",
    difficulty: "Intermediate",
    question: "How would you design a URL shortening service?",
    guidance: "Cover the encoding scheme, database choice, read/write ratio, and caching strategy. Mention scaling considerations if time allows.",
    estimatedMinutes: 8,
    completion: "attempted",
  },
  {
    id: "q6",
    category: "Technical",
    difficulty: "Advanced",
    question: "How would you design a rate limiter for a public API?",
    guidance: "Discuss token bucket vs sliding window, where the limiter lives (gateway vs service), and how to handle distributed rate limiting across nodes.",
    estimatedMinutes: 10,
    completion: "unattempted",
  },
  {
    id: "q7",
    category: "Technical",
    difficulty: "Intermediate",
    question: "Explain the difference between SQL and NoSQL databases, with an example of when you'd choose each.",
    guidance: "Cover schema flexibility, consistency guarantees, and horizontal scaling. Ground the answer in a specific scenario, not just definitions.",
    estimatedMinutes: 5,
    completion: "unattempted",
  },
  {
    id: "q8",
    category: "Company-Specific",
    difficulty: "Intermediate",
    question: "Nimbus Systems builds cloud infrastructure — how would you explain load balancing to a non-technical stakeholder?",
    guidance: "Strong answers use a real-world analogy (e.g. checkout lanes at a store) before introducing technical terms.",
    estimatedMinutes: 4,
    completion: "unattempted",
    companyId: "nimbus",
  },
  {
    id: "q9",
    category: "Company-Specific",
    difficulty: "Advanced",
    question: "Nimbus Systems values reliability — describe how you'd design for graceful degradation under partial outages.",
    guidance: "Cover circuit breakers, fallback responses, and how to communicate degraded state to end users.",
    estimatedMinutes: 7,
    completion: "unattempted",
    companyId: "nimbus",
  },
  {
    id: "q10",
    category: "Company-Specific",
    difficulty: "Beginner",
    question: "Quanta Analytics works with ML pipelines — what's the difference between supervised and unsupervised learning?",
    guidance: "Give one concrete example of each rather than only the textbook definition.",
    estimatedMinutes: 3,
    completion: "unattempted",
    companyId: "quanta",
  },
];

export interface InterviewTip {
  id: string;
  category: QuestionCategory;
  tip: string;
}

export const mockInterviewTips: InterviewTip[] = [
  { id: "t1", category: "HR", tip: "Use the STAR method for behavioral questions — Situation, Task, Action, Result." },
  { id: "t2", category: "HR", tip: "Keep 'Tell me about yourself' under 90 seconds — recruiters decide fast." },
  { id: "t3", category: "Technical", tip: "Think out loud during system design questions — the reasoning matters more than the final answer." },
  { id: "t4", category: "Technical", tip: "Always clarify constraints before diving into a coding problem." },
  { id: "t5", category: "Company-Specific", tip: "Research the company's engineering blog — referencing it shows genuine interest." },
];

export interface LearningPathItem {
  id: string;
  questionId: string;
  reason: string;
}

export const mockInterviewLearningPath: LearningPathItem[] = [
  { id: "lp1", questionId: "q6", reason: "Your weakest self-rated area: System Design (Advanced)" },
  { id: "lp2", questionId: "q9", reason: "Matches your top company match: Nimbus Systems" },
  { id: "lp3", questionId: "q7", reason: "Unattempted — closes a gap in Technical fundamentals" },
];
