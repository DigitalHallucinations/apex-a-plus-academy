# Audit System

Audits are durable reviews of repo state, implementation quality, release readiness, or process health. They are evidence packets, not vague notes.

## Files

- `index.md`: audit registry.
- `AUDIT-YYYY-MM-DD-slug.md`: one audit record.
- `TEMPLATE.md`: copyable audit skeleton.

## Audit Status

- `open`: findings or action items remain.
- `passed`: reviewed and no blocking findings remain.
- `passed-with-notes`: usable, with non-blocking follow-ups.
- `failed`: blocking findings exist.
- `superseded`: replaced by a newer audit.

## Required Sections

Every audit should include:

- Scope
- Context
- Method
- Findings
- Evidence
- Risks
- Actions
- Status

## Creating An Audit

1. Copy `TEMPLATE.md`.
2. Rename it to `AUDIT-YYYY-MM-DD-slug.md`.
3. Add it to `index.md`.
4. Link related todos, decisions, and risks.
5. Record command evidence or explain why commands were not run.

## Severity

- `P0`: data loss, security, build/release blocker, or severe user harm.
- `P1`: major functional gap, architectural blocker, or high-risk regression.
- `P2`: important but not blocking.
- `P3`: polish, cleanup, or documentation debt.
