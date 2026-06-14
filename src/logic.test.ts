import { describe, expect, it } from "vitest";
import {
  pct, formatTime, shuffle, dateKey, questionsToday, applyStudyActivity, recordAnswer,
  scheduleCard, isCardDue, domainMastery, masteredCount, objectiveStats, migrateState,
  buildNotifications, initialState, SCHEMA_VERSION
} from "./logic";
import type { AnsweredStat, LearnerState, Question } from "./types";

const baseState = (over: Partial<LearnerState> = {}): LearnerState => ({ ...initialState, ...over });

const q = (id: string, domain: string, objective: string, exam: "220-1201" | "220-1202" = "220-1201"): Question => ({
  id, exam, domain, difficulty: "Foundation", prompt: id, options: ["a", "b"], answer: 0, explanation: "x", objective
});

describe("pct / formatTime", () => {
  it("rounds percentages and guards divide-by-zero", () => {
    expect(pct(1, 4)).toBe(25);
    expect(pct(2, 3)).toBe(67);
    expect(pct(5, 0)).toBe(0);
  });
  it("formats mm:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });
});

describe("shuffle", () => {
  it("preserves all members", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]); // does not mutate input
  });
});

describe("streak (applyStudyActivity)", () => {
  it("starts a streak at 1 on first activity", () => {
    const r = applyStudyActivity(baseState(), 3, "2026-06-13");
    expect(r.streak).toBe(1);
    expect(r.lastStudyDate).toBe("2026-06-13");
    expect(r.dailyCounts["2026-06-13"]).toBe(3);
  });
  it("increments on consecutive days", () => {
    const s = baseState({ streak: 4, lastStudyDate: "2026-06-12" });
    expect(applyStudyActivity(s, 1, "2026-06-13").streak).toBe(5);
  });
  it("does not change the streak twice in one day but accumulates count", () => {
    const s = baseState({ streak: 5, lastStudyDate: "2026-06-13", dailyCounts: { "2026-06-13": 2 } });
    const r = applyStudyActivity(s, 4, "2026-06-13");
    expect(r.streak).toBe(5);
    expect(r.dailyCounts["2026-06-13"]).toBe(6);
  });
  it("resets to 1 after a missed day", () => {
    const s = baseState({ streak: 9, lastStudyDate: "2026-06-10" });
    expect(applyStudyActivity(s, 1, "2026-06-13").streak).toBe(1);
  });
});

describe("questionsToday", () => {
  it("reads the per-day counter", () => {
    const s = baseState({ dailyCounts: { "2026-06-13": 7 } });
    expect(questionsToday(s, "2026-06-13")).toBe(7);
    expect(questionsToday(s, "2026-06-14")).toBe(0);
  });
});

describe("recordAnswer (recency)", () => {
  it("tracks cumulative counts and the latest correctness", () => {
    let a = recordAnswer(undefined, true);
    expect(a).toEqual({ correct: 1, attempts: 1, lastCorrect: true });
    a = recordAnswer(a, false);
    expect(a).toEqual({ correct: 1, attempts: 2, lastCorrect: false });
  });
});

describe("mastery", () => {
  const questions = [q("q1", "net", "ports"), q("q2", "net", "ports"), q("q3", "net", "wifi"), q("q4", "hw", "ram")];
  it("counts only questions whose latest attempt was correct, over the whole domain", () => {
    const answered: Record<string, AnsweredStat> = {
      q1: { correct: 1, attempts: 1, lastCorrect: true },
      q2: { correct: 5, attempts: 6, lastCorrect: false } // ground a lot but missed last -> not mastered
    };
    const net = questions.filter(x => x.domain === "net");
    expect(domainMastery(net, answered)).toBe(33); // 1 of 3 net questions
    expect(masteredCount(answered)).toBe(1);
  });
  it("surfaces weakest attempted objectives first", () => {
    const answered: Record<string, AnsweredStat> = {
      q1: { correct: 1, attempts: 1, lastCorrect: true },
      q2: { correct: 0, attempts: 1, lastCorrect: false },
      q3: { correct: 0, attempts: 1, lastCorrect: false }
    };
    const stats = objectiveStats(questions, answered);
    expect(stats[0].objective).toBe("wifi"); // 0% mastered
    expect(stats.map(s => s.objective)).not.toContain("ram"); // unattempted excluded
  });
});

describe("scheduleCard (SM-2)", () => {
  it("graduates intervals on repeated success and uses ease", () => {
    let c = scheduleCard(undefined, 3, 0); // Good
    expect(c.interval).toBe(1);
    expect(c.reps).toBe(1);
    c = scheduleCard(c, 3, 0);
    expect(c.interval).toBe(6);
    expect(c.reps).toBe(2);
    const third = scheduleCard(c, 3, 0);
    expect(third.interval).toBeGreaterThan(6); // 6 * ease
    expect(third.reps).toBe(3);
  });
  it("resets interval and counts a lapse on Again", () => {
    let c = scheduleCard(undefined, 4, 0);
    c = scheduleCard(c, 4, 0);
    const lapsed = scheduleCard(c, 1, 0); // Again
    expect(lapsed.interval).toBe(1);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
  });
  it("never lets ease drop below 1.3", () => {
    let c = scheduleCard(undefined, 1, 0);
    for (let i = 0; i < 10; i++) c = scheduleCard(c, 1, 0);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe("isCardDue", () => {
  it("treats unseen cards as due and respects due dates", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    expect(isCardDue(undefined, now)).toBe(true);
    expect(isCardDue({ ease: 2.5, interval: 1, reps: 1, lapses: 0, due: "2026-06-12T00:00:00Z" }, now)).toBe(true);
    expect(isCardDue({ ease: 2.5, interval: 1, reps: 1, lapses: 0, due: "2026-06-20T00:00:00Z" }, now)).toBe(false);
  });
});

describe("migrateState", () => {
  it("fills defaults for an empty/garbage save", () => {
    const s = migrateState(null);
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.streak).toBe(0);
    expect(s.answered).toEqual({});
    expect(s.theme).toBe("dark");
  });
  it("upgrades a legacy v1 record (no lastCorrect / reps / dailyCounts)", () => {
    const legacy = {
      name: "Tech", dailyGoal: 25, streak: 3, theme: "light",
      answered: { q1: { correct: 2, attempts: 3 } },
      cardRatings: { f1: { ease: 2.4, interval: 4, due: "2026-06-20T00:00:00Z" } }
    };
    const s = migrateState(legacy);
    expect(s.theme).toBe("light");
    expect(s.answered.q1.lastCorrect).toBe(true); // best-effort from correct>0
    expect(s.cardRatings.f1.reps).toBe(0);
    expect(s.cardRatings.f1.lapses).toBe(0);
    expect(s.dailyCounts).toEqual({});
  });
  it("drops corrupt fields without throwing", () => {
    const s = migrateState({ answered: "nope", attempts: 42, bookmarks: [1, "ok", null] });
    expect(s.answered).toEqual({});
    expect(s.attempts).toEqual([]);
    expect(s.bookmarks).toEqual(["ok"]);
  });
});

describe("buildNotifications", () => {
  const content = { flashcards: [{ id: "f1", domain: "net", front: "x", back: "y" }] };
  it("reports due cards, remaining goal, countdown, and baseline prompt", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    const s = baseState({ dailyGoal: 10, targetDate: "2026-06-20" });
    const notes = buildNotifications(s, content, now);
    const ids = notes.map(n => n.id);
    expect(ids).toContain("cards-due");
    expect(ids).toContain("daily-goal");
    expect(ids).toContain("exam-countdown");
    expect(ids).toContain("baseline");
  });
  it("clears the daily-goal note once the goal is met", () => {
    const now = new Date("2026-06-13T12:00:00Z");
    const s = baseState({ dailyGoal: 5, dailyCounts: { [dateKey(now)]: 5 }, attempts: [{ id: "a", date: "", exam: "Mixed", score: 5, total: 5, durationSec: 1, domainScores: {} }] });
    const ids = buildNotifications(s, content, now).map(n => n.id);
    expect(ids).not.toContain("daily-goal");
    expect(ids).not.toContain("baseline");
  });
});
