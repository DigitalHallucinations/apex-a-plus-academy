# Documentation screenshots

The PNGs in this folder are used by the [README](../../README.md) and the
[getting-started guide](../getting-started.md). They are **regenerated from the
live app**, not captured by hand, so they stay consistent every time.

## How they're produced

1. **Deterministic demo data.** `npm run demo:state` (script:
   [`scripts/demo-state.mjs`](../../scripts/demo-state.mjs)) synthesizes a
   realistic `LearnerState` from the real content banks and writes
   `demo-state.json`. The content selection is seeded, so the same questions,
   lessons, and cards are chosen every run; only the dates float relative to the
   day you generate it, so streaks and "cards due" stay believable. This file is
   git-ignored — it's a regenerated intermediate, not a committed artifact.

2. **Headless capture.** `npm run screenshots` (script:
   [`scripts/screenshots.mjs`](../../scripts/screenshots.mjs)) launches Chromium
   via Playwright, seeds the demo state (and suppresses the first-run tour), sizes
   the viewport to **1440×900 at 2× scale**, and captures each view.

## Regenerating

```powershell
npm run dev          # terminal 1 — dev server on http://localhost:1420
npm run screenshots  # terminal 2 — writes the PNGs here (demo-state auto-generated if missing)
```

Point at a different build with `SCREENSHOT_URL` (e.g. a `vite preview` of
`dist/`).

## The shot list

| File | View | Notes |
| --- | --- | --- |
| `01-command-center.png` | Dashboard | Readiness, streak, trend, domain mastery |
| `02-learning-paths.png` | Learning Paths | Objectives, lessons, progress |
| `03-practice-lab.png` | Practice Lab | Active single-answer question |
| `04-mock-exam.png` | Mock Exam | Active, timed, domain-weighted question |
| `05-recall-deck.png` | Recall Deck | Spaced-repetition flashcard |
| `06-performance.png` | Performance | Multi-track progress + objective heatmap |
| `07-multi-select.png` | Mock Exam | Multi-select ("choose TWO") format |
| `08-track-switcher.png` | Dashboard | Track switcher open (multi-track) |

## Adding or changing a shot

Edit the capture steps in [`scripts/screenshots.mjs`](../../scripts/screenshots.mjs)
— each shot navigates the app (clicking real controls) and calls `shot(name)`.
Keep the viewport and naming consistent, then re-run `npm run screenshots` and
update the table above and any references in the README.
