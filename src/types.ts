export type ExamCode = "220-1201" | "220-1202";
export type View = "dashboard" | "learn" | "practice" | "flashcards" | "analytics" | "notes" | "settings";

export interface Domain {
  id: string;
  exam: ExamCode;
  name: string;
  weight: number;
  color: string;
  description: string;
  topics: string[];
}

export interface Question {
  id: string;
  exam: ExamCode;
  domain: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  objective: string;
}

export interface Flashcard {
  id: string;
  domain: string;
  front: string;
  back: string;
}

export interface Attempt {
  id: string;
  date: string;
  exam: ExamCode | "Mixed";
  score: number;
  total: number;
  durationSec: number;
  domainScores: Record<string, { correct: number; total: number }>;
}

export interface LearnerState {
  name: string;
  targetDate: string;
  dailyGoal: number;
  streak: number;
  lastStudyDate: string;
  answered: Record<string, { correct: number; attempts: number }>;
  attempts: Attempt[];
  bookmarks: string[];
  notes: { id: string; title: string; body: string; updatedAt: string }[];
  cardRatings: Record<string, { ease: number; due: string; interval: number }>;
  dailyActivity: Record<string, { questions: number; cards: number }>;
  theme: "dark" | "light";
}
