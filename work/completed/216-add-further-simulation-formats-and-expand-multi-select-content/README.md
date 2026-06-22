# 216 — Add further simulation formats and expand multi-select content

> **Status**: ✅ Completed 2026-06-21
> Follow-up split from work item [210](../../completed/210-expand-original-assessment-content-and-simulation-formats/) (scope decision 2026-06-20).

## Why

Item 210 added the multi-select MCQ format end-to-end plus a seed set of
questions. Two threads were intentionally deferred and are tracked here.

## Scope

1. **Additional simulation format(s)** — extend the assessment layer with at
   least one more CompTIA-style item type beyond multi-select MCQ. Candidates,
   roughly in order of effort:
   - **Categorization** — assign many items into buckets (a richer matching PBQ).
   - **Fill-in / CLI** — type a command or value into a blank, graded with
     normalized text matching.
   - **Hotspot / diagram** — click the correct region on an image; needs assets
     and click targets.

   Each format follows the same 5-point surface item 210 used: `types.ts` →
   `logic.ts` grading → `App.tsx` rendering (Practice + Mock) →
   `validate.ts` / `validate-content.mjs` → content JSON, with unit tests.

2. **Expand multi-select content** — grow multi-select coverage beyond the 210
   seed set (4 per track) toward a sensible density per domain/objective.

## Notes

- The multi-select pipeline, grading helpers (`gradeMcq`, `isMultiSelect`), and
  shared rendering helpers from item 210 are the model to follow for new formats.

## What changed

- Added a `fillin` PBQ format for typed command/value answers, including
  TypeScript types, normalized partial-credit grading, Practice/Mock rendering,
  validation in both validators, and unit coverage.
- Authored one fill-in PBQ per available track:
  `aplus-p09`, `netplus-p009`, and `secplus-p009`.
- Expanded multi-select MCQ coverage beyond the item 210 seed set with two more
  items per track:
  `aplus-q391`/`aplus-q392`, `netplus-q180`/`netplus-q181`, and
  `secplus-q198`/`secplus-q199`.

## Verification

- `npm run validate:content` — 3 tracks valid, 770 questions, 27 PBQs, objective
  coverage targets satisfied.
- `npm test -- --run` — 60 tests passed.
- `npm run validate:a11y` — 10 checks passed.
- `npm run build` — production build passed; Vite emitted the existing
  chunk-size warning.
