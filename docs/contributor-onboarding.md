# Contributor onboarding

Everything you need to go from a fresh clone to a merged change. For the short
checklist, see [CONTRIBUTING.md](../CONTRIBUTING.md); this is the orientation
behind it.

## What the project is

SkillForge Academy is an offline-first CompTIA exam-prep desktop app. A **React 19
+ TypeScript** frontend runs inside a **Tauri 2 / Rust** shell that persists
learner state to the OS application-data directory. In browser dev mode it falls
back to `localStorage`, so most work needs no Rust toolchain at all.

The product is **multi-certification**: a content "factory" drives three CompTIA
tracks (A+, Network+, Security+) from per-track content directories, and a sidebar
track switcher keeps separate progress, streaks, and analytics for each.

## Set up

Minimum for frontend work:

```powershell
git clone https://github.com/ForgeWireLabs/skillforge-academy.git
cd skillforge-academy
npm install
npm run dev          # Vite dev server at http://localhost:1420 (localStorage data)
```

For the full desktop app you also need Rust stable and the
[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/), then:

```powershell
npm run desktop:dev
```

## Repository map

```text
src/                       React + TypeScript application
  App.tsx                  Navigation shell and all product views
  logic.ts                 Pure logic: scoring, streaks, SM-2, mock assembly, grading
  logic.test.ts            Vitest unit tests for logic.ts
  types.ts                 Learner + assessment data contracts
  data.ts                  Runtime state helpers
  Analytics.tsx            Performance view (lazy-loaded)
  ContentContext.tsx       Loads and provides the content bundle
  backup.ts                Encrypted portable-backup format
  styles.css               Dark/light theming
  content/                 The certification content factory
    certifications.json    Track manifest (the source of truth)
    <track>/               domains, objectives, questions, flashcards, pbqs, lessons
    validate.ts            Shared content validator (loader + CI both use it)
src-tauri/                 Rust desktop layer (persistence commands, NSIS bundle)
scripts/                   Authoring + tooling (scaffold, validate, screenshots)
docs/                      Authoring, content-model, and onboarding docs
work/                      RepoPact work items (active / completed / …)
schemas/                   JSON schemas for work items and content
```

## The dev loop

1. Make the change in `src/`.
2. If you touched `logic.ts` or any scoring/scheduling/grading behavior, add or
   update a test in `src/logic.test.ts`.
3. Run the validation gates (below).
4. Keep PRs narrow; describe user-visible behavior; include tests when logic
   changes.

This repo commits directly to `main` with focused, conventional commits
(`feat(...)`, `fix(...)`, `docs(...)`).

## Validation gates

Run these before opening a PR — they are the same checks CI expects:

```powershell
npm run validate:content   # schema-checks every track's banks against the manifest
npm run validate:a11y      # required keyboard/accessibility affordances
npm test                   # unit tests for scoring, streaks, scheduling, mastery, grading
npm run build              # tsc + vite production build
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
```

`validate:content` is strict: every domain, question, PBQ, flashcard, and lesson
must reference a known track and one of that track's exams, and every content id
must carry its track's id prefix so ids stay globally unique. Pass
`--strict-coverage` to fail on any objective lacking a lesson or enough questions.

## Adding assessment content

All practice material must be **original** — written in your own words, never
recalled from a live exam. Each item needs its exam, domain, objective, answer,
and a rationale. The banks live under `src/content/<track>/`:

- `questions.json` — MCQs. `answer` is a single index, or an array of indices for
  a multi-select ("choose TWO/THREE") question.
- `pbqs.json` — performance-based questions (`matching`, `ordering`).
- `flashcards.json`, `lessons.json`, `objectives.json`, `domains.json`.

After editing, run `npm run validate:content`. The full rules — id format, lesson
assets, quality bar — are in
[docs/certification-authoring.md](certification-authoring.md), and the lesson
structure is in [docs/course-lesson-content-model.md](course-lesson-content-model.md).

## Adding a new certification track

Scaffold and validate through the content factory:

```powershell
npm run scaffold:cert -- --id network-plus --prefix netplus --name "CompTIA Network+" --shortName "Network+" --exam N10-009
npm run validate:content
```

This creates the track directory and registers it in the manifest. Author its
objectives, lessons, and banks, then keep `validate:content --strict-coverage`
green.

## Regenerating the documentation screenshots

The README and getting-started guide use screenshots captured from the live app
with deterministic demo data, so they stay consistent. To refresh them:

```powershell
npm run dev            # in one terminal
npm run screenshots    # in another — writes docs/screenshots/*.png
```

`npm run screenshots` (Playwright) seeds a generated demo state
(`npm run demo:state`, auto-run if missing), sizes the viewport to 1440×900, and
captures each view. See [docs/screenshots/README.md](screenshots/README.md) for
the full process and how to add a shot.

## Where to ask

Open an issue for anything unclear. Good first contributions: original practice
scenarios, accessibility fixes, test coverage, and corrections to technical
explanations.
