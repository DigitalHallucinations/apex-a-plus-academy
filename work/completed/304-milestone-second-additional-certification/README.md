# 304 - M4: Second Additional Certification

> **Status:** Completed 2026-06-22
> Imported milestone from `tracking/milestones.md#M4`; source preserved.

## M4: Second Additional Certification

Status: complete

Candidate:

- CompTIA Security+ (`SY0-701` or current target at time of authoring)

Dependency:

- M2 should be complete first.

Related:

- `todos/TODO-004-security-plus-starter-track.md`

## Completion Notes

Security+ (`SY0-701`) is the second additional certification track after A+ and
Network+. It is available in the manifest with `order: 3`, `idPrefix: secplus`,
and a per-track pass threshold of `0.83`. Its banks live under
`src/content/security-plus/` and include domains, objectives, lessons,
questions, flashcards, and PBQs.

The original starter-track implementation is recorded in
`work/completed/004-security-plus-starter-track/` and audited in
`audits/AUDIT-2026-06-17-security-plus-starter.md`. As of this closeout it
validates with 5 domains, 28 complete objectives, 41 lessons, 199 questions, 45
flashcards, and 9 PBQs.

## Verification

- Current target check: CompTIA's Security+ page still lists Security+ V7 /
  `SY0-701` as the live exam series. CompTIA has a draft Security+ V8 objective
  set under development, so future Security+ releases should re-check that.
- `node scripts/validate-content.mjs --strict-coverage` passed on 2026-06-22;
  Security+ reports 28/28 objectives complete with at least one lesson and at
  least six tagged questions per objective.
- See `audits/AUDIT-2026-06-22-multi-cert-launch-readiness.md`.
