# 216 — Add further simulation formats and expand multi-select content

> **Status**: 📋 Active
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
