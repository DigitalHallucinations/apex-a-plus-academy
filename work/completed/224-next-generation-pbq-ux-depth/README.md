# 224 - Next-generation PBQ UX depth

> **Status**: Completed
> **Owners**: Builder lead; Content and Accessibility Specialists support.
> **Depends on**: 216.

## Intent

PBQs should feel closer to technician work. Matching, ordering, and fill-in are a
solid base; this item explores and ships a richer interaction while improving
review feedback for all PBQs.

## Candidate Formats

- Hotspot/diagram click target.
- Categorization / drag-to-bucket or keyboard equivalent.
- Command or tool-output interpretation simulation.
- Multi-step scenario with partial-credit sub-tasks.

## Closeout

Close when one richer format is shipped end to end, validated, accessible, and
backed by original content.

## Closeout Evidence

Completed 2026-06-30.

- Added categorization PBQs end to end across the shared type, grading logic,
  PBQ Lab, mock exam rendering, content validators, and authoring docs.
- Added original Network+ PBQ `netplus-p010` for categorizing switch-port
  troubleshooting observations.
- Added per-item review feedback for matching, categorization, fill-in, and
  ordering PBQs so partial credit is inspectable.
- Added accessibility validator coverage for categorization select labels and
  labelled PBQ feedback.
- Added `audits/AUDIT-2026-06-30-next-generation-pbq-ux-depth.md`.
- Added `evidence/runs/20260630-224-next-generation-pbq-ux-depth.json`.

Validation:

- `npm run validate:content` passed.
- `node scripts/validate-content.mjs --strict-coverage` passed.
- `npm run validate:a11y` passed.
- `npm test -- --run` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- In-app browser smoke passed for desktop and 390px mobile viewport; mobile
  categorization rows collapse to one column and selects keep 44px touch height.
- `python -m repopact_cli validate` still fails on the repo-wide
  preflight-marker requirement affecting existing work items.
