/** A certification track id, e.g. "a-plus", "network-plus". */
export type CertId = string;
/** A specific exam within a certification, e.g. "220-1201", "n10-009". */
export type ExamId = string;
/**
 * Track availability. "available" tracks have authored content and are
 * selectable; "coming-soon" tracks are advertised on the roadmap (track
 * switcher and all-tracks analytics) but cannot be entered yet.
 */
export type CertStatus = "available" | "coming-soon";
export type View = "dashboard" | "learn" | "practice" | "pbq" | "mock" | "flashcards" | "analytics" | "notes" | "settings";
export type Difficulty = "Foundation" | "Intermediate" | "Advanced";

/** One exam (paper) belonging to a certification. A+ has two cores; most certs have one. */
export interface ExamMeta {
  id: ExamId;
  certId: CertId;
  /** Display label, e.g. "Core 1" — empty for single-exam certifications. */
  name: string;
  /** Default question count for a full-length mock of this exam. */
  defaultQuestions: number;
  /** Default time limit (minutes) for a full-length mock of this exam. */
  defaultMinutes: number;
}

/** A certification track. The manifest of these is the umbrella over all content. */
export interface Certification {
  id: CertId;
  name: string;        // "CompTIA A+"
  shortName: string;   // "A+"
  vendor: string;      // "CompTIA"
  /** Slug every content id in this track must be prefixed with, e.g. "aplus". */
  idPrefix: string;
  description: string;
  /** Mock-exam pass line as a fraction (0..1). */
  passThreshold: number;
  /**
   * Explicit position in the track switcher and overviews (ascending). Tracks
   * without an order sort after ordered ones, then alphabetically by name.
   */
  order?: number;
  /** Availability of the track. Defaults to "available" when omitted. */
  status?: CertStatus;
  exams: ExamMeta[];
}

export interface Domain {
  id: string;
  certId: CertId;
  exam: ExamId;
  name: string;
  weight: number;
  color: string;
  description: string;
  topics: string[];
}

/**
 * One published exam objective (e.g., Security+ "1.2 Summarize fundamental
 * security concepts"). The objective registry per track is the spec that
 * lessons, questions, flashcards, and PBQs map to via `objectiveId`, so
 * coverage can be measured objective by objective.
 */
export interface Objective {
  /** Globally unique, cert-prefixed id, e.g. "secplus-1.2" or "aplus-c1-1.1". */
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  /** Official objective number within its exam, e.g. "1.2". */
  code: string;
  title: string;
  /** Whether the title/number has been confirmed against the official objectives PDF. */
  verified?: boolean;
}

export interface Question {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Human-readable objective label shown in the UI. */
  objective: string;
  /** Optional reference to an Objective.id in the track's objective registry. */
  objectiveId?: string;
}

interface PbqBase {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  difficulty: Difficulty;
  prompt: string;
  objective: string;
  /** Optional reference to an Objective.id in the track's objective registry. */
  objectiveId?: string;
  explanation: string;
}

/** Assign each item to the correct category/target (e.g. port -> protocol). */
export interface MatchingPbq extends PbqBase {
  kind: "matching";
  items: { id: string; text: string }[];
  targets: { id: string; label: string }[];
  /** itemId -> correct targetId */
  answer: Record<string, string>;
}

/** Put the steps in the correct order (e.g. troubleshooting sequence). */
export interface OrderingPbq extends PbqBase {
  kind: "ordering";
  steps: { id: string; text: string }[];
  /** step ids in their correct order */
  answer: string[];
}

export type Pbq = MatchingPbq | OrderingPbq;

export interface Flashcard {
  id: string;
  certId: CertId;
  domain: string;
  front: string;
  back: string;
  /** Optional reference to an Objective.id in the track's objective registry. */
  objectiveId?: string;
}

/** An illustration shown within a lesson section. Assets live under public/lessons/. */
export interface LessonImage {
  /** Path under public/lessons/, e.g. "a-plus/raid-levels.svg". */
  src: string;
  /** Required alternative text for accessibility. */
  alt: string;
  caption?: string;
}

/** A block of teaching content within a lesson. */
export interface LessonSection {
  /** Optional sub-heading for the block. */
  heading?: string;
  /** A paragraph of prose. May contain inline `code` spans (backtick-delimited). */
  body: string;
  /** Optional bullet list rendered after the paragraph. */
  bullets?: string[];
  /** Optional illustration rendered after the prose. */
  image?: LessonImage;
}

/** A short "class" that teaches one topic of a domain before the knowledge checks. */
export interface Lesson {
  id: string;
  certId: CertId;
  exam: ExamId;
  domain: string;
  title: string;
  /** Sequence within the domain (ascending). */
  order: number;
  /** Estimated reading time in minutes. */
  estMinutes: number;
  /** Objective strings this lesson covers (human-readable). */
  objectives: string[];
  /** Optional reference to an Objective.id in the track's objective registry. */
  objectiveId?: string;
  sections: LessonSection[];
}

export interface Attempt {
  id: string;
  certId: CertId;
  date: string;
  exam: ExamId | "Mixed";
  score: number;
  total: number;
  durationSec: number;
  domainScores: Record<string, { correct: number; total: number }>;
  /** "practice" (default) or "mock" for full-length timed exams. */
  kind?: "practice" | "mock";
  /** Whether a mock exam met the pass threshold. */
  passed?: boolean;
}

export interface AnsweredStat {
  correct: number;
  attempts: number;
  /** Whether the most recent attempt at this question was correct. */
  lastCorrect: boolean;
}

export interface CardSchedule {
  ease: number;
  interval: number;
  due: string;
  /** Successful repetitions in a row (SM-2). Reset to 0 on a lapse. */
  reps: number;
  /** Number of times the card has been failed ("Again"). */
  lapses: number;
}

/** Study cadence and exam target for a single certification track. */
export interface CertProgress {
  targetDate: string;
  dailyGoal: number;
  streak: number;
  lastStudyDate: string;
  /** Questions answered per local day, keyed YYYY-MM-DD. */
  dailyCounts: Record<string, number>;
}

export interface LearnerState {
  /** Bumped when the persisted shape changes; drives migrate-on-load. */
  schemaVersion: number;
  name: string;
  /** The certification track currently in focus. */
  activeCertId: CertId;
  /** Per-track cadence/streak/goal/exam-date. Keyed by CertId. */
  progress: Record<CertId, CertProgress>;
  // Id-keyed maps stay flat; ids are cert-prefixed, so a track's slice is a filter.
  answered: Record<string, AnsweredStat>;
  attempts: Attempt[];
  bookmarks: string[];
  /** Ids of lessons the learner has opened/read (cert-prefixed). */
  lessonsRead: string[];
  notes: { id: string; title: string; body: string; updatedAt: string }[];
  cardRatings: Record<string, CardSchedule>;
  theme: "dark" | "light";
}
