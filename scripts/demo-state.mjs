// Generates a deterministic demo LearnerState used for documentation screenshots
// and the onboarding walkthrough. The content selection is seeded (stable across
// runs); only the dates float relative to the day you generate it, so streaks and
// "cards due" stay believable whenever the screenshots are refreshed.
//
//   node scripts/demo-state.mjs            -> writes docs/screenshots/demo-state.json
//
// To preview it manually: open the dev app, run in the console
//   localStorage.setItem('apex-state', <paste file contents>); location.reload();
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SCHEMA_VERSION = 3;
const DAILY_GOAL = 25;
const OUT = "docs/screenshots/demo-state.json";

const load = (track, file) => JSON.parse(readFileSync(`src/content/${track}/${file}`, "utf8"));
const certs = JSON.parse(readFileSync("src/content/certifications.json", "utf8"));

// Deterministic PRNG so the same questions/lessons are chosen every run.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260620);
const chance = p => rnd() < p;
const pick = (arr, n) => arr.filter(() => chance(n));

const now = new Date();
const dayKey = offset => {
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};
const isoAt = offset => {
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  d.setHours(18, 30, 0, 0);
  return d.toISOString();
};
const futureDay = offset => {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

// How fully each track is studied. A+ is the showcase track.
const PROFILE = {
  "a-plus": { answered: 0.78, correct: 0.82, lessons: 0.72, cards: 0.7, due: 0.35, streak: 12, exams: 6 },
  "network-plus": { answered: 0.5, correct: 0.74, lessons: 0.45, cards: 0.5, due: 0.3, streak: 4, exams: 2 },
  "security-plus": { answered: 0.34, correct: 0.7, lessons: 0.3, cards: 0.35, due: 0.25, streak: 2, exams: 1 }
};

const answered = {};
const cardRatings = {};
const lessonsRead = [];
const bookmarks = [];
const attempts = [];
const progress = {};

for (const cert of certs) {
  const t = cert.id;
  const prof = PROFILE[t];
  const questions = load(t, "questions.json");
  const domains = load(t, "domains.json");
  const lessons = load(t, "lessons.json");
  const flashcards = load(t, "flashcards.json");

  // Answered question stats (lastCorrect drives "mastered" counts and domain mastery).
  for (const q of questions) {
    if (!chance(prof.answered)) continue;
    const lastCorrect = chance(prof.correct);
    const tries = 1 + (chance(0.3) ? 1 : 0) + (chance(0.1) ? 1 : 0);
    answered[q.id] = {
      correct: lastCorrect ? tries : Math.max(0, tries - 1),
      attempts: tries,
      lastCorrect
    };
  }

  // Lessons read.
  for (const l of lessons) if (chance(prof.lessons)) lessonsRead.push(l.id);

  // A few bookmarks from the harder questions.
  for (const q of pick(questions.filter(q => q.difficulty === "Advanced"), 0.02).slice(0, 3)) bookmarks.push(q.id);

  // Spaced-repetition schedule: some cards due now, the rest spread into the future.
  let dueBudget = Math.round(flashcards.length * prof.cards * prof.due);
  for (const f of flashcards) {
    if (!chance(prof.cards)) continue;
    const reps = 1 + Math.floor(rnd() * 4);
    const giveDue = dueBudget > 0 && chance(0.6);
    if (giveDue) dueBudget--;
    cardRatings[f.id] = {
      ease: 2.2 + rnd() * 0.6,
      interval: giveDue ? 1 : 2 + Math.floor(rnd() * 12),
      due: giveDue ? dayKey(Math.floor(rnd() * 2)) : futureDay(1 + Math.floor(rnd() * 14)),
      reps,
      lapses: chance(0.2) ? 1 : 0
    };
  }

  // Exam attempts, trending upward, to populate readiness + the score-trend chart.
  const examIds = cert.exams.map(e => e.id);
  const base = t === "a-plus" ? 0.6 : t === "network-plus" ? 0.58 : 0.55;
  for (let i = 0; i < prof.exams; i++) {
    const exam = examIds[i % examIds.length];
    const examDomains = domains.filter(d => d.exam === exam);
    const frac = Math.min(0.94, base + i * 0.05 + (rnd() * 0.04 - 0.02));
    const total = 30 + Math.floor(rnd() * 10);
    const score = Math.round(total * frac);
    const domainScores = {};
    let left = score;
    examDomains.forEach((d, k) => {
      const dt = Math.max(2, Math.round(total / examDomains.length));
      const dc = k === examDomains.length - 1 ? Math.max(0, Math.min(dt, left)) : Math.min(dt, Math.round(dt * frac));
      left -= dc;
      domainScores[d.id] = { correct: dc, total: dt };
    });
    const kind = i % 2 === 0 ? "mock" : "practice";
    attempts.push({
      id: `demo-${t}-${i}`,
      certId: t,
      date: isoAt((prof.exams - i) * 3),
      exam,
      score,
      total,
      durationSec: 1800 + Math.floor(rnd() * 2400),
      domainScores,
      kind,
      passed: kind === "mock" ? frac >= cert.passThreshold : undefined
    });
  }

  // Per-track cadence: streak, daily goal, recent daily activity.
  const dailyCounts = {};
  for (let d = 0; d < 16; d++) {
    if (d < prof.streak || chance(0.5)) dailyCounts[dayKey(d)] = 10 + Math.floor(rnd() * 22);
  }
  progress[t] = {
    targetDate: futureDay(t === "a-plus" ? 24 : t === "network-plus" ? 45 : 70),
    dailyGoal: DAILY_GOAL,
    streak: prof.streak,
    lastStudyDate: dayKey(0),
    dailyCounts
  };
}

const state = {
  schemaVersion: SCHEMA_VERSION,
  name: "Jordan Lee",
  activeCertId: "a-plus",
  progress,
  answered,
  attempts: attempts.sort((a, b) => a.date.localeCompare(b.date)),
  bookmarks,
  lessonsRead,
  notes: [
    { id: "demo-note-1", title: "Common ports cheat sheet", body: "20/21 FTP · 22 SSH · 25 SMTP · 53 DNS · 80 HTTP · 443 HTTPS · 3389 RDP. Drill these until automatic.", updatedAt: isoAt(2) },
    { id: "demo-note-2", title: "Troubleshooting method", body: "Identify the problem → establish a theory → test it → plan → implement → verify → document. Memorize the order.", updatedAt: isoAt(5) }
  ],
  cardRatings,
  theme: "dark"
};

mkdirSync("docs/screenshots", { recursive: true });
writeFileSync(OUT, JSON.stringify(state, null, 2) + "\n");

const masteredA = Object.entries(answered).filter(([id, a]) => id.startsWith("aplus") && a.lastCorrect).length;
console.log(`Wrote ${OUT}`);
console.log(`  answered: ${Object.keys(answered).length} | lessonsRead: ${lessonsRead.length} | cards: ${Object.keys(cardRatings).length} | attempts: ${attempts.length}`);
console.log(`  A+ mastered: ${masteredA} | A+ streak: ${progress["a-plus"].streak}`);
