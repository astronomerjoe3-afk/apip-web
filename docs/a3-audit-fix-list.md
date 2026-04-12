# A3 Audit Fix List

## Simulations
- Confirmed the live A3 lesson simulation copy and panel wiring are already aligned to advanced waves and optics.
- Removed stale induction and AC simulation leftovers from the public A3 lesson-asset folders so the module no longer mixes wrong-topic sim labs with the correct wave/optics labs.

## Diagrams
- Confirmed the primary A3 concept visuals in `lib/advancedConceptVisuals.ts` and `lib/a3LessonContent.ts` are aligned to the module topic.
- Removed stale wrong-topic diagram leftovers from the public A3 lesson-asset folders:
  - `a3-l1-flux-window.svg`
  - `a3-l2-induction-pulse.svg`
  - `a3-l3-flux-linkage.svg`
  - `a3-l4-lenz-opposition.svg`
  - `a3-l5-dc-ac-waveform.svg`
  - `a3-l6-rms-heat-match.svg`

## Tests
- Added `lib/a3AssessmentBanks.ts` with lesson-specific generated banks for all six A3 lessons.
- Each A3 lesson now targets:
  - diagnostic bank floor: 20
  - concept bank floor: 20
  - mastery bank floor: 40
- Wired A3 into the generated diagnostic, concept-gate, and mastery routing paths in `lib/lessonRunnerApi.ts`.
- This keeps A3 on the platform delivery rules:
  - diagnostics administer 2-5 questions
  - concept checks stop on first correct answer
  - mastery serves 5-10 questions
- The new banks were written to be more rigorous than vocabulary-only checks:
  - numerical superposition, harmonics, fringe spacing, grating-angle, critical-angle, and oscilloscope readings
  - stronger mechanism-first concept questions
  - less redundant wording across diagnostic and concept stages

## Technical Words
- Fixed the stale lower A3 fallback block in `lib/technicalWords.ts`, which was still describing induction and AC content.
- The A3 fallback vocabulary now matches the module:
  - progressive wave
  - superposition
  - stationary wave
  - nodes and antinodes
  - interference
  - diffraction grating
  - critical angle
  - total internal reflection
  - oscilloscope

## Formulas
- Confirmed A3 formula overrides in `lib/supplementalEquationFallbacks.ts` are already aligned and rigorous:
  - superposition displacement addition
  - `L = n lambda / 2`
  - `f = n v / (2L)`
  - constructive and destructive path-difference conditions
  - `w = lambda D / a`
  - `n lambda = d sin(theta)`
  - `d = 1 / line density`
  - `sin(c) = n2 / n1`
  - oscilloscope `Vpp`, `T`, `f`, and `Vrms`
- No formula patch was required in this pass.

## Video Assets
- Confirmed A3 video metadata is still wired and the lesson video files exist under `public/lesson_assets/A3/A3_L1` through `A3_L6`.
- No video-routing code change was needed in this pass.
- The current videos should still be visually re-reviewed against the updated lesson state in a follow-up asset pass before they are treated as fully remapped.
