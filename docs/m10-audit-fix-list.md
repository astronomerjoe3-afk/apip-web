# M10 Audit And Fix List

Date: 2026-04-11

This audit treats `M10` as the live magnetism and electromagnetic-effects module, and checks both content alignment and delivery rules.

## Simulations

- Fixed: M10 scaffold and simulation copy now resolve through M10-owned lesson content instead of the old M10-to-M12 remap path in `lib/revisedLateCoreLessonContent.ts`.
- Fixed: `components/M10SimulationPanels.tsx` now documents that it intentionally reuses the corrected magnetism simulator implementation while the dedicated M10 simulation namespace is being rebuilt.
- Remaining media debt: `public/lesson_assets/M10/.../simulations` is still the stale circuits-era pack and should be replaced with M10-native magnetism simulations when the asset namespace is rerendered.

## Diagrams

- Fixed: M10 question visuals, scaffold media cards, and reflection visuals now route through `lib/m10LessonContent.ts`.
- Fixed: the live M10 diagram URLs point at the corrected magnetism pack under `/lesson_assets/M12/...` until the M10 namespace is rebuilt.
- Remaining media debt: the physical `public/lesson_assets/M10/.../diagrams` tree is still legacy content and should be regenerated with M10-native filenames and artwork.

## Tests

- Fixed: added dedicated M10 assessment banks in `lib/m10AssessmentBanks.ts` for every lesson.
- Fixed: each lesson now enforces the minimum bank sizes required by the audit:
- Diagnostic bank: at least 20 items.
- Concept bank: at least 20 items.
- Mastery bank: at least 40 items.
- Fixed: M10 diagnostic, concept, and mastery routing in `lib/lessonRunnerApi.ts` now uses the dedicated M10 banks instead of falling through to generic generation.
- Verified in runner logic:
- Diagnostics are administered adaptively within `2-5` questions via `diagnosticTarget(...)`.
- Concept check is administered as a one-question gate per attempt with retry support.
- Mastery is clamped to `5-10` questions via `masteryQuestionCount(...)`.
- Quality direction of the new bank:
- stronger IGCSE-style conceptual separation between field patterns, electromagnet strength, motor effect, induction, and transformer logic
- more mathematical use of `F = BIL sin(theta)`, `torque = BINA`, `emf = N delta(Phi) / delta(t)`, turns ratio, and `P = VI`
- fewer label-only or slogan-only prompts

## Technical Words

- Fixed: strengthened the module glossary in `lib/technicalWords.ts`.
- Added or clarified: `Soft-iron core`, `Magnetic flux`, `Split-ring commutator`, `Primary coil`, and `Secondary coil`.
- Verified: current M10 worked examples and scaffold meaning text are already topic-aligned once the old remap is removed.

## Formulas

- Fixed: M10 now prefers lesson-local core formula fallback cards instead of borrowing M12-coded formula cards.
- Fixed: formula coverage is now stronger for the advanced M10 lessons:
- `M10_L2`: electromagnet strength relation and soft-iron-core strengthening note
- `M10_L3`: `F = B I L sin(theta)` plus force-direction reminder
- `M10_L4`: `torque = B I N A sin(theta)` and `maximum torque = B I N A`
- `M10_L5`: `emf = N delta(Phi) / delta(t)` plus rate-of-change cue
- `M10_L6`: turns ratio, ideal power balance, current ratio, `P = VI`, and line-loss cue

## Video Assets

- Fixed: pre-worked-example video URLs now remap live M10 lessons to the corrected magnetism video pack under `/lesson_assets/M12/...`.
- This prevents M10 from serving the stale circuits-era videos that still live under `public/lesson_assets/M10/.../videos`.
- Remaining media debt: the physical M10 video tree still needs a full remap and rerender so the correct magnetism assets live under the M10 namespace directly.

## Worked Examples

- Fixed: `lib/lessonRunnerApi.ts` no longer rewrites `M10_L*` worked-example requests to `M12_L*`.
- Result: the existing M10 worked examples now render directly and stay aligned with the lesson topic.

## Compatibility Note

- The `M10 -> M12` entry in `lib/moduleCurriculum.ts` was left in place on purpose.
- It acts as backward-compatible lesson-id canonicalization for legacy stored data, converting old `M12_*` lesson identifiers into current `M10_*` identifiers.
- It is not the same as the live content-routing bug, which has now been fixed in the M10 content and video paths.
