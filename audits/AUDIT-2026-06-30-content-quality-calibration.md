# AUDIT-2026-06-30-content-quality-calibration

## Summary

- **Type:** content / assessment calibration
- **Status:** passed-with-notes
- **Related work:** `222-content-quality-and-assessment-calibration-audit`
- **Date:** 2026-06-30
- **Reviewer:** Codex, Content Specialist lane

## Scope

Reviewed representative samples from A+, Network+, and Security+ across
questions, multi-select questions, PBQs, flashcards, and lessons. Also reviewed
whole-bank calibration signals: domain/exam counts, difficulty mix, multi-select
density, PBQ kind mix, objective question counts, pass thresholds, and mock-exam
pool size.

Manual sample:

- 12 questions, including single-answer and multi-select items.
- 9 PBQs.
- 9 flashcards.
- 9 lessons.
- 39 total content items across all three shipped tracks.

Automated/structured review:

- All 770 questions scanned for multi-select prompt/answer count mismatches.
- All track banks measured for difficulty mix, PBQ mix, multi-select density,
  question count per objective, default mock size, and pass threshold.

## Calibration Signals

| Track | Questions | Difficulty mix | Multi-select | PBQs | PBQ kinds | Objective question range | Pass line |
| --- | ---: | --- | ---: | ---: | --- | --- | ---: |
| A+ | 392 | 127 Foundation / 197 Intermediate / 68 Advanced | 6 | 9 | 4 matching / 4 ordering / 1 fill-in | 6-10 | 75% |
| Network+ | 179 | 45 Foundation / 86 Intermediate / 48 Advanced | 6 | 9 | 5 matching / 3 ordering / 1 fill-in | 6-17 | 80% |
| Security+ | 199 | 44 Foundation / 99 Intermediate / 56 Advanced | 6 | 9 | 6 matching / 2 ordering / 1 fill-in | 6-15 | 83% |

Mock exam review:

- Each track has enough MCQs for a 90-question mock without exhausting the pool.
- PBQs are available for each track and are placed before MCQs in mock exams.
- Domain weighting is implemented through the domain `weight` values.
- Pass thresholds are distinct per track and broadly reasonable for learner
  readiness signaling.
- A+ has the weakest multi-select density, especially Core 2. This is not a
  release blocker, but future A+ expansion should add more multi-select and
  higher-fidelity PBQs.

## Findings

### Addressed: Security+ CIA triad multi-select omitted Availability

`secplus-q194` asked which goals make up the classic CIA triad but only allowed
two answers because Availability was absent from the options. This was corrected
to a proper "Choose THREE" item with Confidentiality, Integrity, and
Availability as the answer set.

### Passed: representative sample quality

The sampled lessons are learner-friendly and original, with objective-aligned
prose. Sampled questions generally have clear stems, credible explanations, and
objective fit. PBQs cover useful matching and ordering patterns, and fill-in
coverage exists in each track.

### Note: distractor realism varies

Some questions intentionally use obvious distractors. That is acceptable for
Foundation items, but Intermediate/Advanced expansion should favor plausible
misconceptions over unrelated filler so scores better reflect exam readiness.

### Note: PBQ depth is useful but still limited

PBQs currently cover matching, ordering, and fill-in. They are valid and
gradable, but richer hotspot/diagram/tool-output simulations remain better
tracked by work item `224`.

## Rubric

Created `docs/content-quality-rubric.md` covering question, multi-select, PBQ,
flashcard, lesson, and mock-calibration review. Future content work should use
this rubric before marking a track release-ready.

## Evidence

- `node scripts/validate-content.mjs --strict-coverage`
- `npm run validate:content`
- `npm test -- --run`
- `docs/content-quality-rubric.md`
- `src/content/security-plus/questions.json`

## Residual Risks

- This was a representative audit, not a line-by-line human review of all 1,000+
  content records.
- Mock score feel is inferred from pool composition and weighting; it still
  needs real learner beta results from `228`.
- A+ multi-select density should improve in a future content expansion.
- Richer PBQ interactions remain tracked by `224`.

## Recommendation

Current content is release-ready with notes. The shipped tracks are broad,
original, and objective-aligned; future work should improve A+ multi-select
density, make more distractors scenario-realistic, and add next-generation PBQs.
