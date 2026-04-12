# A2 Audit Fix List

## Simulations
- Fixed the live A2 simulation mount in `components/LessonRunner.tsx` so A2 lessons now render their own panel instead of falling through.
- Replaced the stale electricity-and-circuits content in `components/A2SimulationPanels.tsx` with quantum-specific explorers for:
  - `A2_L1` energy-level matching
  - `A2_L2` spectral barcodes
  - `A2_L3` photoelectric threshold
  - `A2_L4` excitation vs ionisation
  - `A2_L5` matter-wave behavior
  - `A2_L6` synthesis across evidence strands

## Diagrams
- Confirmed the primary A2 concept visuals in `lib/advancedConceptVisuals.ts` and `lib/a2LessonContent.ts` are already aligned to the module topic.
- Legacy public A2 lesson-asset folders still contain stale non-quantum leftovers and should be remapped or cleaned in a follow-up asset pass.

## Tests
- Added `lib/a2AssessmentBanks.ts` with lesson-specific generated banks for all six A2 lessons.
- Each lesson now targets:
  - diagnostic bank floor: 20
  - concept bank floor: 20
  - mastery bank floor: 40
- Wired A2 into the generated diagnostic, concept-gate, and mastery routing paths in `lib/lessonRunnerApi.ts`.
- This keeps A2 on the platform-wide delivery rules:
  - diagnostics administer 2-5 questions
  - concept checks stop on first correct answer
  - mastery serves 5-10 questions

## Technical Words
- Fixed the stale lower A2 fallback block in `lib/technicalWords.ts`, which was still describing electric fields and circuit ideas.
- The A2 fallback vocabulary now matches the quantum module:
  - energy levels
  - quantization
  - excitation
  - spectra
  - work function
  - threshold frequency
  - ionisation
  - de Broglie wavelength

## Formulas
- Confirmed A2 formula overrides in `lib/supplementalEquationFallbacks.ts` are already broadly aligned:
  - `Delta E = h f = h c / lambda`
  - `h f = phi + K_max`
  - `f_0 = phi / h`
  - `e V_s = K_max`
  - `lambda = h / p`
- No additional formula patch was required for this pass.

## Video Assets
- Confirmed A2 video metadata was pointing to missing files under `public/lesson_assets/A2/...`.
- Disabled A2 video metadata in `lib/lessonRunnerApi.ts` for now so the runner stops exposing broken video references.
- The current lesson videos do not match the current lesson state and need to be remapped and rerendered completely before A2 video support should be re-enabled.
