# Content Quality Rubric

This rubric supplements schema validation and objective coverage checks. A bank
can be structurally valid and still teach poorly, overcue the answer, or produce
misleading exam-readiness signals.

Use it for new certification tracks, content expansions, and release-readiness
audits.

## Question Review

Score each sampled question on a 0-2 scale for each criterion:

| Criterion | 2 - Release-ready | 1 - Needs edit | 0 - Blocker |
| --- | --- | --- | --- |
| Objective fit | Tests the tagged objective directly and uses the right domain/exam context. | Related but broad, or objective text is weaker than the scenario. | Wrong objective, wrong domain, or unsupported by the lesson bank. |
| Clarity | Stem is concise, answerable, and includes enough scenario detail. | Minor ambiguity or unnecessary wording. | Multiple plausible answers or missing facts required to answer. |
| Originality | Original educational scenario; no recalled live-exam language. | Generic but acceptable. | Looks like a dump, vendor-proprietary prompt, or copied phrasing. |
| Distractors | Wrong answers are plausible misconceptions within the same topic family. | One or two obviously silly options. | Distractors give away the answer or are unrelated filler. |
| Explanation | Explains why the answer is right and why distractors are wrong or weaker. | Explains only the right answer. | Circular, absent, or contradicts the answer. |
| Difficulty label | Difficulty matches cognitive load, scenario depth, and distractor quality. | Slightly too easy or hard. | Mislabel hides a calibration problem. |

Multi-select extras:

- The stem must say exactly how many choices to select.
- The correct set must contain every item requested by the concept.
- There must be at least one plausible wrong choice after the correct set.
- Explanations must name all correct choices.

## PBQ Review

| Criterion | Release-ready expectation |
| --- | --- |
| Task authenticity | Feels like a technician/security/networking task, not a disguised vocabulary quiz. |
| Interaction fit | Matching, ordering, or fill-in is the right interaction for the skill being tested. |
| Partial credit | Sub-parts are independently meaningful and gradeable. |
| Feedback | Explanation helps learners diagnose the specific pattern, order, or command. |
| Accessibility | Keyboard users can complete the task; labels and prompts are explicit. |

## Flashcard Review

Flashcards should be short, recall-oriented, and atomic. Avoid front sides that
ask two unrelated facts at once. Backs should include the minimum durable fact
plus a cue that prevents a common confusion.

## Lesson Review

Lessons should teach before they test:

- Start with the operational reason the topic matters.
- Break dense lists into chunks with technician cues.
- Use objective terminology, but keep prose learner-friendly.
- Include warnings where a concept is commonly misused.
- Images must have useful alt text and must reinforce the surrounding section.

## Mock Calibration Review

Review these signals per track before claiming release-ready assessment quality:

- Domain weighting follows the domain bank weights.
- Difficulty mix includes enough intermediate and advanced items to make a pass
  meaningful.
- PBQs appear before MCQs and represent at least two interaction styles.
- Multi-select density is high enough to test precision, but not so high that
  scores become all-or-nothing noise.
- Pass threshold matches the product's stated interpretation for that track.
- Item pools are large enough that repeated mocks do not immediately repeat the
  same questions.

## Release Recommendation Scale

- **Ready:** no blockers; only minor edits or tracked improvements remain.
- **Ready with notes:** safe to ship, but calibration or depth should improve in
  a follow-up.
- **Blocked:** content includes objective mismatch, ambiguous scoring, missing
  explanation, dump-like material, broken assets, or misleading pass/fail
  behavior.
