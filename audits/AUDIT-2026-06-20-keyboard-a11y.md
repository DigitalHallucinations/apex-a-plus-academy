# AUDIT-2026-06-20-keyboard-a11y: Keyboard-Only And Assistive-Technology Pass

Type: accessibility
Status: passed
Date: 2026-06-20
Auditor: agent
Related Todo: `213` (`work/completed/213-continue-keyboard-only-and-assistive-technology-testing/`)

## Scope

A focused keyboard-only and assistive-technology pass over the app's overlays and
menus, continuing the baseline accessibility work from `209`. Priority on the
modal dialogs and menus, including the surfaces added in `210`/`211` (the
multi-select question format and the first-run onboarding walkthrough).

## Method

Live testing against the dev build via a headless browser: opened each overlay,
enumerated tabbable elements, inspected `inert`/`activeElement`, and exercised
Escape and outside-click dismissal. Findings were fixed in source and re-verified.

## Findings

1. **Modal dialogs did not trap focus (significant).** With the onboarding
   walkthrough open (`aria-modal="true"`), 16 tabbable elements remained reachable
   in the background (sidebar track switcher, primary navigation); the background
   was neither `inert` nor `aria-hidden`. Keyboard and screen-reader users could
   leave the dialog and operate hidden content. The command palette shared the
   pattern.

2. **Focus was not restored on dialog close (moderate).** Closing a dialog
   dropped focus to `<body>` instead of returning it to the control that opened
   the dialog, losing the keyboard user's place.

3. **Track-switcher menu was not keyboard-dismissable (moderate).** The dropdown
   had no Escape handler and no outside-click handler, so it could not be closed
   without re-clicking the toggle, and focus was unmanaged.

## Fixes

- The rest of the app (`<aside>`, `<main>`) is marked `inert` while a modal
  dialog is open, so focus and AT stay within the dialog. (React 19 `inert`.)
- A `useReturnFocus` hook captures the triggering element at open and restores
  focus to it on close; applied to the onboarding dialog and command palette.
- The track switcher now closes on Escape (returning focus to its toggle) and on
  an outside click.
- Four tripwire checks were added to `npm run validate:a11y` to catch regressions
  of the above (background-inert, focus-return, switcher dismissal, multi-select
  checkbox semantics).

## Verification

- Live: background-reachable tabbables outside an open dialog went from 16 → 0;
  focus returns to the trigger on close; track switcher closes via Escape (focus
  to toggle) and via outside click; no console errors.
- `npm run validate:a11y` → passed (10 checks) · `npm test` → passed ·
  `npm run build` → ok.

## Risks / Follow-ups

- Multi-select options use `role="checkbox"` on `<button>` elements with
  `aria-checked`; this reads correctly but a future pass could group them under a
  labelled container (e.g. a `role="group"` with the "Select N" hint as its name)
  for richer screen-reader grouping.
- Not yet exercised with a real screen reader (NVDA/VoiceOver) or full
  manual-keyboard walkthrough of every view — a natural next accessibility pass.

## Final Status

Passed. The keyboard and assistive-technology gaps found in the overlays and menus
are fixed and verified, with regression tripwires added. Remaining items are
enhancements, not blockers.
