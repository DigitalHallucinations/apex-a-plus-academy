# 214 — Prepare the content model for additional certification tracks

> **Status**: ✅ Completed 2026-06-20
> Imported into RepoPact from `ROADMAP.md`; the source is preserved.

## Imported plan narrative

- Prepare the content model for additional certification tracks

## Scope (decided 2026-06-20)

The content model already supports multiple tracks (manifest + per-track
directories + `scaffold:cert` + `validate:content`, with three CompTIA tracks
shipped). This item makes it ready for **additional, possibly non-CompTIA**
tracks — readiness work, not authoring a new track (that's milestone 303).

## What changed

- **Vendor-agnostic onboarding copy.** The first-run walkthrough no longer
  hardcodes "CompTIA" or the three track names; it derives the track list from the
  manifest (`src/App.tsx`). The trademark disclaimer and track switcher already
  read `vendor` per track.
- **Validation hardening.** `idPrefix` must now be unique across tracks
  (`src/content/validate.ts` + `scripts/validate-content.mjs`), preventing content
  id collisions between tracks. Covered by a new unit test.
- **Authoring docs.** `docs/certification-authoring.md` gains an "Other Vendors
  (Non-CompTIA Tracks)" section (vendor flag, automatic trademark/switcher
  wording, passThreshold guidance, single/multi-exam, an AWS scaffold example) and
  the objective-mapping wording is now vendor-neutral.

## Verification

- `npm run build`, `npm run validate:a11y` (10 checks), `npm run validate:content`
  (3 tracks valid), `npm test` (57 passed) — all green.
- Live: onboarding step 2 reads "move between A+ Track, Network+ Track, and
  Security+ Track"; no console errors.

## Follow-up

- Choosing and authoring the first additional track is
  [303](../303-milestone-first-additional-certification/README.md).
