# 305 - M5: Multi-Cert Launch Readiness

> **Status:** Completed 2026-06-22
> Imported milestone from `tracking/milestones.md#M5`; source preserved.

## M5: Multi-Cert Launch Readiness

Status: complete

Definition:

Docs, release notes, screenshots, and product metadata accurately represent multiple certification tracks.

Related:

- `todos/TODO-006-multi-cert-brand-docs-and-release-readiness.md`

## Completion Notes

The multi-cert release surface now accurately represents the three available
tracks after the item 216 content and simulation expansion:

- README track counts now match validation output.
- ROADMAP lists fill-in / command-entry PBQs as shipped and moves further
  simulation expansion to future hotspots/categorization work.
- CHANGELOG records 770 questions, 150 lessons, the corrected 116-objective
  total, fill-in PBQs, and expanded multi-select coverage.
- Tauri metadata already names all three tracks.
- Code signing remains blocked by 212 until a trusted certificate is available.

## Verification

- `node scripts/validate-content.mjs --strict-coverage` — passed.
- `npm test -- --run` — 60 tests passed.
- `npm run validate:a11y` — 10 checks passed.
- `npm run build` — passed; Vite emitted the existing chunk-size warning.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml` — passed.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed.
- `npm run desktop:build` — passed and produced
  `src-tauri/target/release/bundle/nsis/SkillForge Academy_1.4.0_x64-setup.exe`.

See `audits/AUDIT-2026-06-22-multi-cert-launch-readiness.md`.
