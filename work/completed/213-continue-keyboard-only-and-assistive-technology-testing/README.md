# 213 — Continue keyboard-only and assistive-technology testing

> **Status**: ✅ Completed 2026-06-20 (overlay/menu iteration)
> Imported into RepoPact from `ROADMAP.md`; the source is preserved.

## Imported plan narrative

- Continue keyboard-only and assistive-technology testing

## This iteration

A keyboard-only / assistive-technology pass over the app's overlays and menus,
focused on the surfaces added by 210/211. Full write-up in
[audits/AUDIT-2026-06-20-keyboard-a11y.md](../../../audits/AUDIT-2026-06-20-keyboard-a11y.md).

### Findings → fixes
- **Modals didn't trap focus** (16 tabbables reachable behind an open dialog) →
  the rest of the app is `inert` while a modal is open.
- **Focus wasn't restored on close** → `useReturnFocus` returns focus to the
  triggering control.
- **Track-switcher menu wasn't keyboard-dismissable** → closes on Escape (focus
  back to the toggle) and on outside click.

### Regression coverage
- `npm run validate:a11y` grown from 6 → 10 tripwire checks.
- `vite.config.ts` excludes Tauri build-copied test files under `src-tauri/**`
  (true test count restored to 56 across 3 files).

## Verification
- Live: tabbables outside an open dialog 16 → 0; focus returns to trigger;
  switcher dismisses via Escape + outside click; no console errors.
- `npm run validate:a11y` (10 checks), `npm test` (56 passed), `npm run build` —
  all green.

## Follow-up (not in this iteration)
- A real screen-reader (NVDA/VoiceOver) walkthrough of every view and the lesson
  reader — recorded in the audit and the audits index "Next Recommended Audit".
