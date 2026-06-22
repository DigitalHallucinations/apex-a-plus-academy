# AUDIT-2026-06-22-multi-cert-launch-readiness: Multi-Cert Launch Readiness

Type: release / milestone
Status: passed-with-notes
Date: 2026-06-22
Auditor: Codex
Related Todo: `304`, `305`

## Scope

Close the second-additional-certification milestone and the multi-cert launch
readiness milestone after the 216 simulation/content expansion.

## Context

Network+ was closed as milestone 303. Security+ is the second additional
certification and already exists as an objective-complete `SY0-701` track. Item
216 also added fill-in / command-entry PBQs and expanded multi-select coverage,
so release docs needed a final count and feature wording pass before closing
launch readiness.

## Method

- Checked CompTIA's current Security+ certification page: it still lists
  Security+ V7 / `SY0-701` as the live exam series. CompTIA also lists a draft
  Security+ V8 objective set under development, so future Security+ work should
  watch that transition before a later release.
- Reviewed and updated `README.md`, `ROADMAP.md`, and `CHANGELOG.md` for current
  content counts and PBQ format wording.
- Reused the prior Security+ implementation evidence in
  `work/completed/004-security-plus-starter-track/` and
  `audits/AUDIT-2026-06-17-security-plus-starter.md`.

## Findings

### AC: Second additional certification

Status: satisfied.

Security+ is present in `src/content/certifications.json` with `order: 3`,
`idPrefix: secplus`, pass threshold `0.83`, and exam `SY0-701`. The
`src/content/security-plus/` banks include domains, objectives, lessons,
questions, flashcards, and PBQs.

### AC: Multi-cert release surface

Status: satisfied.

README, ROADMAP, CHANGELOG, and Tauri metadata represent all three tracks. The
release docs now reflect the current validator totals after item 216:

- A+: 392 questions, 68 lessons, 9 PBQs.
- Network+: 179 questions, 41 lessons, 9 PBQs.
- Security+: 199 questions, 41 lessons, 9 PBQs.
- Total: 770 questions, 135 flashcards, 27 PBQs, 150 lessons.

The docs also name matching, ordering, and fill-in / command-entry PBQs.

## Evidence

```text
node scripts/validate-content.mjs --strict-coverage
PASS - 3 certifications, 770 questions, 135 flashcards, 27 PBQs, 150 lessons.
A+: 63/63 objectives complete.
Network+: 25/25 objectives complete.
Security+: 28/28 objectives complete.

npm test -- --run
PASS - 3 files, 60 tests.

npm run validate:a11y
PASS - 10 checks.

npm run build
PASS - frontend production build; Vite emitted the existing chunk-size warning.

cargo fmt --check --manifest-path src-tauri/Cargo.toml
PASS.

cargo check --manifest-path src-tauri/Cargo.toml
PASS.

npm run desktop:build
PASS - built src-tauri/target/release/skillforge-academy.exe and
src-tauri/target/release/bundle/nsis/SkillForge Academy_1.4.0_x64-setup.exe.
Vite emitted the existing chunk-size warning.
```

## Risks

- Installer code signing remains blocked by work item 212 until a trusted
  certificate is available. The build is packageable, but Windows SmartScreen may
  still warn about an unrecognized publisher.
- CompTIA has a draft Security+ V8 objective set under development. The current
  launch remains aligned to live `SY0-701`; future Security+ updates should
  re-check official objectives before release claims are refreshed.

## Final Status

Passed with notes. Milestones 304 and 305 are ready to close; 212 remains
blocked for certificate funding/acquisition.
