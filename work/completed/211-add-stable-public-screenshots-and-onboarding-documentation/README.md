# 211 — Add stable public screenshots and onboarding documentation

> **Status**: ✅ Completed 2026-06-20
> Imported into RepoPact from `ROADMAP.md`; the source is preserved.

## Imported plan narrative

- Add stable public screenshots and onboarding documentation

## Scope (decided 2026-06-20)

Two deliverables, both expanded per the scope decision:

1. **Stable public screenshots** — not just refreshed images, but a *repeatable
   process* so they never drift: a deterministic demo-state generator plus a
   headless capture script. The refreshed set also resolves the open follow-up
   from `AUDIT-2026-06-20-multi-cert-release-readiness` (the old screenshots
   showed the A+ track only).
2. **Onboarding documentation** — all three forms: an end-user getting-started
   guide, a contributor onboarding guide, and an in-app first-run walkthrough.

## What changed

### Screenshots + process
- `scripts/demo-state.mjs` (`npm run demo:state`) — synthesizes a realistic,
  seeded `LearnerState` from the real content banks. Content selection is stable;
  only dates float, so streaks/"cards due" stay believable. Output is git-ignored.
- `scripts/screenshots.mjs` (`npm run screenshots`) — Playwright captures each
  view at 1440×900 @2×, seeded with the demo state (and with the first-run tour
  suppressed). Auto-generates the demo state if missing.
- `docs/screenshots/01..08` regenerated, now including the multi-track switcher,
  the Performance objective heatmap, and the multi-select format.
- `docs/screenshots/README.md` documents the process and shot list.

### Onboarding docs
- `docs/getting-started.md` — end-user guide (install, track choice, study loop,
  backups, suggested first week).
- `docs/contributor-onboarding.md` — repo map, dev loop, validation gates, adding
  content/tracks; linked from `CONTRIBUTING.md`.

### In-app walkthrough
- `Onboarding` component in `src/App.tsx` — a 4-step, keyboard-navigable dialog
  shown once on a genuinely fresh install (persists a `skillforge-onboarded`
  flag), replayable from Preferences → Product tour.

## Verification
- `npm run screenshots` → 8 PNGs captured.
- `npm run build` → ok · `npm test` → 65 passed · `npm run validate:a11y` →
  passed · `npm run validate:content` → valid.
- Browser: first-run tour appears on fresh state, all 4 steps navigate,
  Get started/Skip dismiss and persist, no reappear on reload, Preferences replay
  reopens it; no console errors.
