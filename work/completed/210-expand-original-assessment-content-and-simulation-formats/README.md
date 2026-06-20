# 210 — Expand original assessment content and simulation formats

> **Status**: ✅ Completed 2026-06-20
> Imported into RepoPact from `ROADMAP.md`; the source is preserved.

## Imported plan narrative

- Expand original assessment content and simulation formats

## Scope (decided 2026-06-20)

The existing assessment layer supported single-answer MCQs plus matching and
ordering PBQs. This item adds the **multi-select MCQ** ("choose TWO/THREE")
format — the smallest, cleanest expansion because it extends `Question` rather
than introducing a new PBQ kind — and a **seed set** of multi-select questions
proving the pipeline end-to-end.

Other CompTIA item types (categorization, fill-in/CLI simulation, hotspot) and
bulk multi-select authoring are intentionally deferred to a follow-up.

## What changed

- `Question.answer` now accepts `number | number[]`; an array marks a
  multi-select question (backward compatible — all existing questions stay
  single-answer).
- Central `gradeMcq` / `isMultiSelect` in `src/logic.ts`; multi-select is graded
  **all-or-nothing** (selected set must match exactly). `scoreMock` routes MCQ
  scoring through `gradeMcq`.
- Practice and Mock views render multi-select options as toggleable checkboxes
  (`role="checkbox"`, `aria-checked`) with a "Select N" hint; review/results
  format multiple selected and correct answers.
- Both validators (`src/content/validate.ts`, `scripts/validate-content.mjs`)
  accept array answers and enforce ≥2 distinct in-range indices that don't cover
  every option.
- 4 seed multi-select questions per track (A+, Network+, Security+), mapped to
  existing objectives.

## Verification

- `npm test` → 65 passed (incl. new single/multi MCQ grading + scoreMock cases)
- `npm run validate:content` → valid (764 questions)
- `npm run validate:a11y` → passed
- `npm run build` → ok
- Browser: mock-exam multi-select renders checkboxes + hint and holds two
  simultaneous selections; no console errors.
