# AUDIT-2026-06-18-objective-coverage: Objective-by-Objective Curriculum Coverage

Type: content / implementation
Status: passed
Date: 2026-06-18
Auditor: Claude
Related Todo: `215` (and decisions `0005`, `0006`)

## Scope

Verify that all three certification tracks have complete, validated
objective-by-objective coverage: every published sub-objective has authored
teaching material (a lesson) plus assessment (>=6 questions) tagged to it.

## Method

- Built per-exam objective registries (`src/content/<cert>/objectives.json`) and
  verified them against the official CompTIA objectives PDFs (Security+ SY0-701,
  Network+ N10-009, A+ 220-1201/1202 V15) using pdfplumber extraction.
- Added an `objectiveId` field to lessons/questions/flashcards/PBQs and a
  validator invariant that the content item's `domain` must equal the mapped
  objective's `domain` (runtime `validate.ts` + CLI `validate-content.mjs`).
- Tagged existing content to objectives and authored the gaps domain by domain to
  the deep target (>=1 lesson and >=6 questions per objective).

Commands:

```text
node scripts/validate-content.mjs --strict-coverage
npm test -- --run
npm run build
npm run validate:a11y
```

## Findings

### Coverage complete for all tracks

Status: addressed.

```text
a-plus:        63 objectives | 63 complete
network-plus:  25 objectives | 25 complete
security-plus: 28 objectives | 28 complete
```

`--strict-coverage` exits 0 (no objective below target). Totals: 752 questions,
150 lessons, 24 PBQs, 135 flashcards across 116 objectives.

### Objective lists verified against official sources

Status: addressed. All registries are `verified: true`. Verification corrected
real errors: Network+ was missing 2.4 (physical installations); A+ was rebuilt to
the current V15 blueprint (different counts and titles, including new objectives
such as Core 2 4.10 AI concepts).

### Domain integrity enforced

Status: addressed. The domain==objective invariant prevents content from being
filed under a domain different from the objective it teaches; validation is clean.

## Risks / Notes

- Objective registries reflect the exam versions current as of June 2026; re-check
  when CompTIA revises an exam and flip `verified` as needed.
- A UI pass to surface objective coverage to learners in the Learn view is a
  reasonable follow-up but was out of scope here.
- Content is original educational material; no exam dumps or recalled items.

## Final Status

Passed. Work item `215` acceptance criteria (including AC-5, objective coverage)
are satisfied; decision `0006` is fully realized.
