# AUDIT-2026-06-20-multi-cert-release-readiness: Multi-Cert Brand, Docs, And Release Readiness

Type: release / documentation
Status: passed
Date: 2026-06-20
Auditor: agent
Related Todo: `006` (`work/active/006-multi-cert-brand-docs-and-release-readiness/`)

## Scope

The public documentation and release surface for SkillForge Academy now that the
product ships three CompTIA tracks (A+, Network+, Security+). Reviewed for stale
A+-only claims and truthful labeling of track depth.

## Context

The product was renamed to SkillForge Academy and grew from a single A+ track to
three objective-complete CompTIA tracks. Per TODO-006, the docs and release copy
needed a coordinated multi-certification pass before publishing a multi-cert
build, while keeping track depth honestly labeled.

## Method

- Files reviewed: `README.md`, `ROADMAP.md`, `CHANGELOG.md`,
  `src-tauri/tauri.conf.json`, `src/content/certifications.json`.
- Commands run: `npm run validate:content -- --strict-coverage` to confirm the
  coverage claims placed in the docs are true.
- Manual checks: read README top-to-bottom for A+-only claims; verified Tauri
  store metadata; confirmed trademark notice covers all three marks.

## Findings

### P2: Docs described the product as A+-only

Status: resolved
Evidence: `README.md` said "Current track: CompTIA A+"; Exam Coverage listed only
A+ exams; Project status said additional tracks "remain ongoing work".
`ROADMAP.md` listed only A+ under "Current track". `tauri.conf.json` descriptions
said "starting with CompTIA A+". `src/content/certifications.json` described
Network+/Security+ as "a small, original sample ... not full exam coverage".

Recommendation (applied):

- README tagline now lists all three tracks; added a "Certification Tracks"
  table with per-track objective coverage; Mock Exam section states per-track
  pass lines; Project status and Roadmap reflect three objective-complete tracks.
- ROADMAP "Current tracks" lists all three; multi-cert factory and per-track
  tracks moved to Shipped.
- Tauri short/long descriptions name A+, Network+, and Security+.
- Network+/Security+ manifest descriptions now state objective-complete coverage
  instead of "small sample".

### P2: Trademark notice covered only the A+ mark

Status: resolved
Evidence: `README.md` trademark notice read "CompTIA, A+, and related marks".
Recommendation (applied): now reads "CompTIA, A+, Network+, Security+, and
related marks", still disclaiming affiliation/endorsement.

### P3: CHANGELOG already current

Status: no action
Evidence: the `Unreleased` section already documents the multi-cert platform,
the Network+/Security+ tracks, per-track pass thresholds, and full objective
coverage (752 questions, 150 lessons). No change required.

## Evidence

```text
$ npm run validate:content -- --strict-coverage
✓ Content valid: 3 certification(s), 19 domains, 752 questions, 135 flashcards, 24 PBQs, 150 lessons
  a-plus: 63 objectives | 63 complete
  network-plus: 25 objectives | 25 complete
  security-plus: 28 objectives | 28 complete
```

## Risks

- Screenshots in `README.md` still show the A+ track only (tracked separately by
  work item `211`). They are representative of shared UI, so not misleading, but
  a multi-track screenshot refresh remains a follow-up.
- Track depth claims are tied to the strict-coverage gate; if objectives change,
  re-run `validate:content --strict-coverage` before re-asserting the numbers.

## Actions

- [x] README multi-track pass
- [x] ROADMAP multi-track pass
- [x] Tauri descriptions updated
- [x] Manifest track descriptions de-staled
- [x] Trademark notice covers all three marks
- [x] Release audit created (this document)
- [ ] Multi-track screenshot refresh (deferred to work item `211`)

## Final Status

Passed. Documentation and release surface accurately describe three
objective-complete CompTIA tracks with truthful depth labeling. The only open
follow-up (multi-track screenshots) is owned by work item `211`.
