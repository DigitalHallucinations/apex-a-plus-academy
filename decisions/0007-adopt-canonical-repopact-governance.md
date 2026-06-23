---
id: 0007
title: "Adopt Canonical RepoPact 1.6.0 Governance"
status: accepted
date: 2026-06-22
supersedes: []
---

# 0007: Adopt Canonical RepoPact 1.6.0 Governance

## Context

Decision 0002 established a repo-native markdown foundation as the *initial*
coordination system, explicitly anticipating that it would be "mapped into another
orchestration system later." The ledger had since drifted into a dialect that did
not validate against RepoPact's own schemas and validator:

- `affected_scopes` used file/dir paths that were not registered in
  `governance/owners.json` (only `governance` was registered);
- some acceptance criteria used `state: "met"` instead of the canonical
  `satisfied`;
- one evidence record used `result: "passed-with-notes"`, outside the schema enum;
- acceptance-criterion `evidence` held free-text prose instead of references to
  formal `evidence/runs/*.json` records.

These were not registered as a deliberate alternate spec; they were the gap between
the markdown foundation and canonical RepoPact. This decision closes that gap — the
"mapped into another orchestration system later" step from decision 0002.

## Decision

The repository adopts canonical RepoPact 1.6.0 governance, validated by the
vendored `scripts/validate_repo.py`:

1. **Scopes** — work items previously used file/dir paths as `affected_scopes`.
   These are consolidated into the project's own AGENTS-defined category taxonomy
   and registered in `governance/owners.json`:

   | Former path/label scope | Canonical scope |
   | --- | --- |
   | `governance` | `governance` |
   | `work`, `audits` | `foundation` |
   | `src`, `src/*`, `src-tauri`, `scripts`, `package.json`, `app-ui` | `implementation` |
   | `content`, `src/content`, `curriculum` | `content` |
   | `accessibility` | `accessibility` |
   | `VERSION` | `release` |
   | `docs`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`, `SECURITY.md` | `docs` |

   The seven canonical scopes (`governance`, `foundation`, `implementation`,
   `content`, `accessibility`, `release`, `docs`) match the "Audit Types" already
   defined in `AGENTS.md`, so scopes now name *what kind of work* an item touches
   rather than individual files.
2. **Criterion state** — `met` is normalized to the canonical `satisfied`.
3. **Evidence result** — `passed-with-notes` is normalized to `passed`, with the
   distinction preserved in the record's `process_note`.
4. **Evidence** — inline-prose evidence was migrated into formal
   `evidence/runs/*.json` records (one per work item, ids `*-migrated-evidence`).
   Every original prose entry is preserved **verbatim** in the record's
   `commands[].summary`, prefixed by its criterion id; criteria now reference the
   record id. Pre-existing valid evidence references were kept.
5. **Validator** — RepoPact 1.6.0's `validate_repo.py` (+ `repo_model.py`,
   `frontmatter.py`) is vendored under `scripts/`, so the repo can self-validate:
   `python scripts/validate_repo.py` (requires `jsonschema`,
   `requirements-repopact.txt`).

## Consequences

- `python scripts/validate_repo.py` passes with zero errors.
- Going forward, acceptance criteria close against formal evidence records, not
  inline prose; `satisfied`/`waived`/`pending` are the only criterion states.
- No work was lost: the migration preserved all prose evidence verbatim inside the
  new records, and content/a11y gates (`npm run validate:content`,
  `npm run validate:a11y`) are unchanged.
- `affected_scopes` now name semantic categories (the AGENTS "Audit Types"), so a
  reader can see what kind of work each item touches at a glance; `owners.json` is a
  small, stable registry of seven scopes rather than a list of file paths.
