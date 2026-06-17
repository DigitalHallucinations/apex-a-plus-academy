---
id: 0006
title: "Adopt Objective-Mapped Curriculum with Coverage Validation"
status: accepted
date: 2026-06-17
supersedes: []
---

# 0006: Adopt Objective-Mapped Curriculum with Coverage Validation

## Context

[0005](0005-adopt-course-first-content-architecture.md) committed SkillForge to a
course-first content model. The next step the operator asked for is true
objective-by-objective coverage: every published exam objective should have
real teaching material (lessons) plus assessment (questions, flashcards, PBQs)
tied to it, with coverage that is provable rather than asserted.

Until now, content carried only a free-text `objective` label. That cannot be
validated or measured against the official exam blueprint.

## Decision

Each certification track gains an **objective registry** at
`src/content/<cert>/objectives.json`: the published objectives (id, exam, domain,
code, title, `verified` flag) for that track. Lessons, questions, flashcards, and
PBQs may carry an optional `objectiveId` that references a registry entry.

Validation (`src/content/validate.ts` and `scripts/validate-content.mjs`):

- Validates registry structure (unique ids, cert/exam/domain references, prefix).
- Rejects any content whose `objectiveId` does not resolve to an objective in the
  same track.
- Reports objective coverage: per objective, whether it meets the **deep target**
  of at least one lesson and at least six tagged questions. `--strict-coverage`
  turns remaining gaps into a failing exit code (off by default while authoring).

The deep target (multiple lessons + ~6 questions per sub-objective) and full
scope (A+, Network+, Security+) were chosen by the operator.

## Alternatives considered

- **Keep free-text objective labels.** Rejected: coverage is not measurable or
  enforceable, so "objective by objective" cannot be guaranteed.
- **One exam first, then replicate.** Considered, but the operator chose to build
  all three tracks in parallel, so the registry and validator cover all tracks now.

## Consequences

- The objective registries are seeded from the publicly documented exam structure
  and marked `verified: false`; each must be confirmed against CompTIA's official
  objectives PDF (then flipped to `verified: true`). Exams get revised, so this
  status is tracked per objective.
- Authoring becomes a tracked program: the coverage report shows exactly which
  objectives still need lessons or questions. This is large (115 sub-objectives
  across the three tracks) and proceeds incrementally.
- Existing broad content remains valid; it is progressively tagged to objectives
  and supplemented until every objective meets the deep target.
- A future UI pass can surface objective coverage to learners (Learn view).
