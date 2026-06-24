# 306 — Consume RepoPact from PyPI (repopact==1.8.0)

> **Status**: ✅ Complete
> **Owner**: governance

## Intent

Switch RepoPact governance tooling from a vendored copy to a pinned PyPI
dependency, and pick up the 1.8.0 decision-status vocabulary (`rejected`,
`deferred`). Rationale and trade-offs are in decision
[0008](../../../decisions/0008-consume-repopact-from-pypi.md).

## Scope

- `requirements-repopact.txt` → `repopact==1.8.0`.
- Removed vendored `scripts/validate_repo.py`, `scripts/frontmatter.py`,
  `scripts/repo_model.py`.
- `schemas/record-frontmatter.schema.json` → 1.8.0 status enum.
- Validation command → `python -m repopact_cli validate`.
- `schemas/` stay in-repo (RepoPact validates the repo's own contracts).

## Closeout

| Criterion | Evidence |
| --- | --- |
| AC-1 pip pin + vendored modules removed | [20260624-306-repopact-pypi-migration](../../../evidence/runs/20260624-306-repopact-pypi-migration.json) |
| AC-2 schema enum at 1.8.0 | [20260624-306-repopact-pypi-migration](../../../evidence/runs/20260624-306-repopact-pypi-migration.json) |
| AC-3 `repopact validate` passes | [20260624-306-repopact-pypi-migration](../../../evidence/runs/20260624-306-repopact-pypi-migration.json) |
