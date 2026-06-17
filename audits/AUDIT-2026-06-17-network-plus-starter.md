# AUDIT-2026-06-17-network-plus-starter: Network+ Starter Track

Type: content / implementation
Status: passed-with-notes
Date: 2026-06-17
Auditor: Claude
Related Todo: `003`

## Scope

Implement work item `003` — add a minimal but real CompTIA Network+ (N10-009)
starter track that proves the certification factory with a second certification,
kept small enough to review carefully.

## Context

`001-true-cert-factory` made the app ingest tracks from the manifest, and
`005-multi-track-ux-and-analytics` settled track ordering, availability, and the
all-tracks UX. Network+ is the first additional track those two items were
building toward. This track is a starter sample, not full exam coverage.

## Method

Files added under `src/content/network-plus/`:

- `domains.json` — all five N10-009 domains with exam-blueprint weights.
- `questions.json` — 18 original scenario questions (3-4 per domain, mixed difficulty).
- `flashcards.json` — 15 original cards (3 per domain).
- `lessons.json` — 2 lessons (OSI model; troubleshooting method) proving lesson support.
- `pbqs.json` — 2 PBQs (one matching, one ordering) proving the optional bank.

Manifest: added the `network-plus` entry to `src/content/certifications.json`
(`order: 2`, single exam `N10-009`, `passThreshold` 0.75) and set the existing
A+ entry to `order: 1` so the default track stays first.

Commands run:

```text
npm run scaffold:cert -- --id network-plus --prefix netplus ...
npm run validate:content
npm test -- --run
npm run build
npm run validate:a11y
```

## Findings

### AC: Network+ appears as a selectable track

Status: addressed. Two available tracks now order A+ → Network+ deterministically
(`sortCertifications`), so the switcher exposes Network+ as selectable.

### AC: Network+ content validates

Status: addressed. `validate:content` reports `network-plus: 5 domains, 18
questions, 15 flashcards, 2 PBQs, 2 lessons` with no errors.

### AC: Practice, flashcards, and learning path work

Status: addressed structurally. Every domain has ≥3 questions and ≥2 flashcards,
two domains carry lessons, and the learning path falls back to topic grids for the
others. Mock exams have enough weighted questions and two PBQs to assemble.

### AC: Network+ does not pollute A+ state; switching preserves per-cert state

Status: addressed. All Network+ ids are `netplus-` prefixed and every item's
`certId` is `network-plus`; `checkCertRefs` in validation enforces prefix +
cross-cert scoping and rejects duplicate ids, so A+ progress, analytics,
bookmarks, card ratings, and attempts remain filtered to their own track. Per-cert
progress buckets were already covered by `005`/migration tests.

### AC: No live exam dumps or proprietary content

Status: addressed. All questions, explanations, flashcards, lessons, and PBQs are
original educational material covering standard networking fundamentals (OSI,
ports, subnetting, VLANs, wireless, monitoring, security, troubleshooting).

## Evidence

```text
npm run validate:content
✓ Content valid: 2 certification(s), 14 domains, 151 questions, 51 flashcards, 10 PBQs, 38 lessons
  per cert -> a-plus: 9 domains, 133 questions, 36 flashcards, 8 PBQs, 36 lessons
  network-plus: 5 domains, 18 questions, 15 flashcards, 2 PBQs, 2 lessons

npm test -- --run
Test Files  3 passed (3)
Tests       48 passed (48)

npm run build
✓ built

npm run validate:a11y
Accessibility validation passed (6 checks).
```

## Risks

- This is a starter sample, not full Network+ coverage — docs and the manifest
  description label it as such to avoid implying complete coverage.
- `npm run desktop:build` was not run; no Rust or bundling config changed, and the
  existing `../src/content` resource mapping ships the new banks automatically.
- Network+ objectives can change; the target exam (N10-009) should be reconfirmed
  before any full buildout.

## Final Status

Passed with notes. Work item `003` acceptance criteria are satisfied.
