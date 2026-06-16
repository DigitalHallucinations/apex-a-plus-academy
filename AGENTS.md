# SkillForge Academy Agent System

This file is the operating manual for humans and AI agents working in this repository. It defines the coordination system for planning, execution, audits, tracking, and handoff. It is a repo-native foundation that can later be mapped into another orchestration tool without losing history.

## Prime Directive

SkillForge Academy is an offline-first certification learning app. Preserve learner trust, local data, content originality, accessibility, and build reliability while expanding the product from a strong CompTIA A+ track into a clean multi-certification platform.

Every agent must optimize for:

1. Shippable increments that keep A+ working end to end.
2. Data-backed changes with tests or validation when behavior changes.
3. Explicit tracking of decisions, risks, and follow-up work.
4. Content integrity: no exam dumps, recalled live questions, or proprietary assessment content.
5. Compatibility with existing learner state and backups.

## Current System Of Record

- Work items: `todos/`
- Audit history: `audits/`
- Project tracking: `tracking/`
- Architecture plan: `docs/multi-certification-plan.md`
- Product docs: `README.md`, `ROADMAP.md`, `CHANGELOG.md`

When these disagree, prefer the most recent completed audit or explicit decision in `tracking/decisions.md`, then update stale docs as part of the work.

## Required Reading Order

Before making substantive changes, read:

1. `AGENTS.md`
2. `tracking/status.md`
3. `todos/index.md`
4. The active todo file
5. Relevant architecture or product docs
6. Relevant source files

For quick typo fixes, reading the active file and checking `git status` is enough.

## Tiered Agent Model

### Tier 0: Steward

Purpose: protect the product direction and repo integrity.

Responsibilities:

- Maintain this agent system.
- Decide when a todo is ready to start, split, block, or close.
- Keep `tracking/status.md`, `tracking/decisions.md`, and `tracking/risks.md` accurate.
- Demand evidence before marking high-impact work complete.
- Prevent broad rewrites that do not serve an active todo.

Typical outputs:

- Todo creation or closure.
- Audit requests.
- Risk escalation.
- Architecture decisions.

### Tier 1: Architect

Purpose: shape cross-cutting implementation plans.

Responsibilities:

- Read the surrounding code before proposing changes.
- Identify module boundaries and migration strategy.
- Define acceptance criteria for shared systems.
- Plan tests, validation, and rollback paths.
- Convert ambiguous goals into actionable todos.

Typical outputs:

- Implementation plan inside a todo.
- ADR-style entry in `tracking/decisions.md`.
- Audit checklist for the changed surface.

### Tier 2: Builder

Purpose: implement scoped changes.

Responsibilities:

- Work only from an active todo unless explicitly asked to triage.
- Keep edits focused.
- Preserve unrelated user or local changes.
- Update tests, validators, docs, and tracking records as needed.
- Leave the repo in a buildable state or clearly record the blocker.

Typical outputs:

- Code/content/doc changes.
- Passing command evidence.
- Updated todo progress.
- Work-log entry.

### Tier 3: Reviewer

Purpose: find defects and missing evidence before merge/release.

Responsibilities:

- Review for correctness, regressions, accessibility, data loss, and test gaps.
- Prefer specific findings with file and line references.
- Verify acceptance criteria, not just code style.
- Add audit entries when reviewing meaningful product or architecture changes.

Typical outputs:

- Review findings.
- Audit record.
- Risk updates.
- Recommendation to continue, block, or close the todo.

### Tier 4: Specialist

Purpose: handle bounded expert tasks.

Specialist lanes:

- Content Specialist: certification content structure, originality, objective mapping, explanation quality.
- Accessibility Specialist: keyboard flow, labels, focus, contrast, screen-reader affordances.
- Desktop Specialist: Tauri, Rust persistence, installer, signing, resource bundling.
- Data Migration Specialist: learner state, backups, schema versions, compatibility.
- QA Specialist: test strategy, validation commands, release smoke checks.

Specialists do not own product direction. They report findings into the active todo, audit, or tracking file.

## Operating Protocol

### Starting Work

1. Run `git status --short`.
2. Open the active todo and confirm status.
3. If no todo exists, create one before starting non-trivial work.
4. Record assumptions in the todo.
5. If the work changes architecture, add or update a decision entry.

### During Work

- Keep work scoped to the todo.
- If you discover new work, add it to `todos/index.md` or the active todo's follow-up section.
- If a risk becomes real, add it to `tracking/risks.md`.
- If a choice is made that future agents should not relitigate, add it to `tracking/decisions.md`.

### Completing Work

A todo is complete only when:

- Acceptance criteria are met or explicitly revised.
- Required commands have been run or documented as unavailable.
- Docs/tracking are updated.
- Any residual risks are recorded.
- `git status --short` has been checked.

## Evidence Standards

Use the smallest command set that proves the change.

Common gates:

- Content changes: `npm run validate:content`
- Accessibility-affecting UI changes: `npm run validate:a11y`
- TypeScript or app behavior changes: `npm test -- --run` and `npm run build`
- Rust/Tauri backend changes: `cargo fmt --check --manifest-path src-tauri/Cargo.toml` and `cargo check --manifest-path src-tauri/Cargo.toml`
- Release packaging changes: `npm run desktop:build`

If a command cannot be run, record why in the active todo and final handoff.

## Todo Statuses

Use exactly one:

- `proposed`: captured but not ready.
- `ready`: scoped and ready to start.
- `active`: currently being worked.
- `blocked`: cannot progress without an external decision or dependency.
- `review`: implemented and awaiting audit/review.
- `done`: accepted and verified.
- `superseded`: replaced by another todo.

## Audit Types

- `foundation`: validates the project management system itself.
- `architecture`: validates design and module boundaries.
- `implementation`: validates code/content against acceptance criteria.
- `release`: validates build, installer, documentation, and release readiness.
- `content`: validates originality, completeness, and objective mapping.
- `accessibility`: validates keyboard and assistive-technology readiness.

## Tracking Rules

- `tracking/status.md` is the current single-page project pulse.
- `tracking/decisions.md` records stable decisions.
- `tracking/risks.md` records known risks, owners, and mitigation.
- `tracking/work-log.md` records chronological work events.

Do not bury important status only in chat. Put durable information in tracking files.

## Orchestration Portability

The foundation here is intentionally portable and can coexist with, or be migrated into, another orchestration system:

- Todo IDs can map to external task systems.
- Audit IDs can map to future evidence packets.
- Decision and risk ledgers can be imported later.
- Agent tiers can map to future roles.

## Repository Map

- `src/`: React/TypeScript app.
- `src/content/`: certification manifest and content banks.
- `src/content/<cert-id>/`: per-cert domains, questions, flashcards, PBQs, and lessons.
- `src-tauri/`: Rust desktop shell, persistence commands, Tauri bundle config.
- `scripts/`: repo validation scripts.
- `docs/`: architecture and release-support documentation.
- `todos/`: planned and active work.
- `audits/`: dated reviews and evidence.
- `tracking/`: live status, decisions, risks, and work log.

## Product-Specific Guardrails

### Certification Factory Work

The desired end state is a true cert factory:

1. Add a manifest entry.
2. Add `src/content/<cert-id>/` banks.
3. Add optional lesson assets under `public/lessons/<cert-id>/`.
4. Run validation and build.
5. The app discovers and ships the track without hand-editing import lists or Tauri resource lists.

### Learner Data

- Never break existing A+ progress.
- Preserve the `apex-state` localStorage key and `.apexbackup` import compatibility unless a migration todo says otherwise.
- Schema changes require migration tests.

### Content

- Content must be original educational material.
- Every content item must carry `certId`.
- IDs must use the cert's `idPrefix`.
- Lessons with images must include useful alt text and existing asset paths.

### Accessibility

- Interactive UI requires keyboard access.
- Images need meaningful alt text or a deliberate empty alt when decorative.
- Focus states and landmarks should remain visible and testable.

## Handoff Template

Use this structure in final handoffs for meaningful work:

```md
Summary:
- ...

Changed:
- ...

Evidence:
- ...

Tracking:
- Todo: TODO-000 ...
- Audit: AUDIT-YYYY-MM-DD-...
- Risks/decisions updated: yes/no

Remaining:
- ...
```
