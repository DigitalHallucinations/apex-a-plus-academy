# 222 - Content quality and assessment calibration audit

> **Status**: Completed
> **Owners**: Content Specialist lead; QA Specialist support.
> **Depends on**: 215, 216.

## Intent

Coverage proves breadth, not quality. This item checks whether content teaches
well, asks fair questions, avoids ambiguity, and produces mock scores that feel
credible.

## Scope

- Sample all three tracks.
- Include single-answer, multi-select, PBQ, flashcard, and lesson content.
- Review objective mapping and distractors.
- Review mock exam composition and score interpretation.
- Produce a reusable review rubric.

## Closeout

Close when a content audit exists, high-confidence defects are fixed, and the
team has a sharper rubric for future authoring.

## Closeout Evidence

Completed 2026-06-30.

- Created `audits/AUDIT-2026-06-30-content-quality-calibration.md`.
- Created `docs/content-quality-rubric.md`.
- Reviewed 39 sampled content items across A+, Network+, and Security+:
  questions, multi-select questions, PBQs, flashcards, and lessons.
- Computed whole-bank calibration signals for 770 questions, 27 PBQs, 135
  flashcards, 150 lessons, difficulty mix, multi-select density, PBQ kind mix,
  objective question counts, and pass thresholds.
- Fixed `secplus-q194`, which omitted Availability from a CIA triad
  multi-select item.
- Evidence packet: `evidence/runs/20260630-222-content-quality-calibration.json`.

Validation:

- `node scripts/validate-content.mjs --strict-coverage` passed.
- `npm run validate:content` passed.
- `npm test -- --run` passed.
- `python -m repopact_cli validate` still fails on the repo-wide
  preflight-marker requirement affecting existing work items.
