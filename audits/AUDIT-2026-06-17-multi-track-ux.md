# AUDIT-2026-06-17-multi-track-ux: Multi-Track UX, Availability, and Analytics

Type: implementation
Status: passed-with-notes
Date: 2026-06-17
Auditor: Claude
Related Todo: `005`

## Scope

Implement work item `005` — make track availability, ordering, active state,
empty states, and the all-tracks analytics overview clear and polished once more
than one certification exists.

## Context

After `001-true-cert-factory`, the app can ingest new tracks from the manifest,
but the multi-cert plan (`docs/multi-certification-plan.md` §7) left two UX
questions open: track ordering and a "coming soon" affordance for certs without
authored banks. The track switcher was binary (single = disabled), the all-tracks
analytics panel had no concept of unavailable tracks, and trademark copy
hardcoded CompTIA/A+ into shared UI.

## Method

Files changed:

- `src/types.ts` — `Certification` gains optional `order` and `status`; new `CertStatus`.
- `src/logic.ts` — `isCertAvailable`, `sortCertifications`, `resolveActiveCert`.
- `src/content/index.ts` — canonical sort of bundled and backend content; coming-soon banks not warned as missing.
- `src/content/validate.ts` — validates `status`/`order`; exempts coming-soon tracks from required banks.
- `scripts/validate-content.mjs` — mirrors the validation rules and bank-requirement exemption.
- `src/App.tsx` — track switcher rework (ordering + "Coming soon" group), active-cert guard, vendor-aware trademark copy, Practice/Mock empty-question guards.
- `src/Analytics.tsx` — all-tracks overview is deterministically ordered and coming-soon aware.
- `src/styles.css` — coming-soon menu/label/tag styles.
- `scripts/scaffold-cert.mjs` — `--status` / `--order`; coming-soon scaffolds empty banks.
- `src/logic.test.ts`, `src/content/validate.test.ts` — unit coverage for the new behavior.
- Docs: `docs/certification-authoring.md`, `docs/multi-certification-plan.md`, `CHANGELOG.md`.

Commands run:

```text
npm run validate:content
npm test -- --run
npm run build
```

Manual fixture check: temporarily added a `coming-soon` Network+ entry (no banks)
to the manifest, confirmed `validate:content` passes; flipped it to `available`
and confirmed validation then fails for the missing banks; reverted the manifest.

## Findings

### AC-1: Track switcher has deterministic ordering

Status: addressed. `sortCertifications` orders available tracks first, then by
`order`, then by name; used by the switcher, content bundle, and analytics.

### AC-2: Deliberate behavior for incomplete / coming-soon tracks

Status: addressed. `status: "coming-soon"` advertises a track in the switcher
(disabled, under a "Coming soon" heading) and analytics (roadmap row), exempts it
from required-bank validation, and keeps it unselectable.

### AC-3: All-tracks analytics is useful with ≥2 tracks

Status: addressed. The inline overview lists every track in canonical order,
active first, with readiness/streak for available tracks and a "Soon" tag for
coming-soon ones. Shown only when ≥2 tracks exist.

### AC-4: Per-track analytics stay scoped to the active cert

Status: unchanged/verified. All per-track views still filter by `activeCertId`.

### AC-5: Clear empty states for tracks without PBQs / lessons

Status: addressed/verified. Learn falls back to topics, PBQ/Flashcards already
showed empty states; added explicit empty states to Practice and Mock for tracks
with no questions (defensive — required-bank validation prevents this on shipped
available tracks).

### AC-6: Shared UI copy is not A+-specific

Status: addressed. Dashboard and Preferences disclaimers derive the vendor from
the active track.

### AC-7: Mobile-width track switching remains usable

Status: verified. The switcher markup/behavior is unchanged at mobile width; the
coming-soon group reuses the existing slide-over menu.

## Evidence

```text
npm run validate:content
✓ Content valid: 1 certification(s), 9 domains, 133 questions, 36 flashcards, 8 PBQs, 36 lessons

npm test -- --run
Test Files  3 passed (3)
Tests       48 passed (48)

npm run build
✓ built
```

## Risks

- A real desktop multi-track pass (Tauri resource bundling of a second track) is
  not exercised here; it is covered when the first additional track ships (`003`).
- The all-tracks overview remains an inline Analytics panel; a dedicated route may
  be warranted if it grows (follow-up candidate in `005`).
- `cargo`/`desktop:build` were not run because no Rust or bundling code changed.

## Final Status

Passed with notes. Work item `005` acceptance criteria are satisfied.
