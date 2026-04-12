# A8 Audit And Fix List

Module `A8` is the advanced electric and magnetic fields module covering electric field, electric potential, uniform fields, Coulomb's law, magnetic force on charges and currents, and the bridge from charged-particle orbits to motor motion. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be made directly in code.

## Summary

- Module state after this pass:
  - A8 now has dedicated generated assessment banks instead of relying on generic fallback behavior.
  - A8 now has a dedicated `Try it in action` simulation layer instead of the shared `A6ToA11` copy-only panel.
  - A8 glossary and formula support are now aligned with the lesson sequence.
  - A8 question visual mapping now supports the generated-bank ID format used by the dedicated banks.
- Runner rules preserved:
  - diagnostic: `2-5` questions
  - concept check: first correct answer gate
  - mastery: `5-10` questions
- Remaining gap:
  - A8 still has no dedicated lesson video assets under `public/lesson_assets/A8/A8_L1` to `A8_L6` video folders.
  - The current lesson videos therefore still need to be remapped and rerendered completely to match the present lesson state.

## Simulations

- Audit result:
  - A8 had been routed through `components/A6ToA11SimulationPanels.tsx`, which is a scaffold-style explainer rather than a real interactive explorer.
  - That meant A8 `Try it in action` was largely descriptive instead of manipulable.
- Fixes applied:
  - added `components/A8SimulationPanels.tsx`
  - updated `components/LessonRunner.tsx` so `A8_` lessons now use the new dedicated component
  - added lesson-specific boards for:
    - `A8_L1`: source charge, probe charge, distance, field-vs-force separation
    - `A8_L2`: equipotential and potential-difference terrace model
    - `A8_L3`: parallel-plate field gradient with `E`, `F`, and `a`
    - `A8_L4`: Coulomb comparison board with sign and inverse-square separation
    - `A8_L5`: magnetic side-force geometry for charge and wire cases
    - `A8_L6`: orbit-versus-motor bridge from the same perpendicular magnetic-force idea
- Result:
  - A8 now has actual lesson-specific interaction rather than shared placeholder narration.

## Diagrams

- Audit result:
  - A8 already had topic-aligned diagrams in `public/lesson_assets/A8` for all six lessons.
  - The diagram mapping in `lib/a6ToA11LessonContentData.json` is coherent and lesson-specific:
    - `A8_L1`: electric field and test charges
    - `A8_L2`: potential and equipotentials
    - `A8_L3`: uniform fields and parallel plates
    - `A8_L4`: point charges and Coulomb's law
    - `A8_L5`: magnetic force on currents and charges
    - `A8_L6`: particle orbits and motor motion
- Supporting fix applied:
  - widened question-ID parsing in `lib/a6ToA11LessonContent.ts` so generated A8 bank items still resolve to the correct lesson visual metadata
- Result:
  - diagrams were already aligned; visual lookup is now robust for the new generated-bank IDs.

## Tests

- Audit result:
  - A8 previously had no dedicated generated-bank override in `lib/lessonRunnerApi.ts`
  - that meant it could fall back to authored/generic pools without guaranteeing the required bank sizes or module-specific rigor
- Fixes applied:
  - added `lib/a8AssessmentBanks.ts`
  - wired A8 into:
    - `generatedDiagnosticItems`
    - `diagnosticItems`
    - `generatedConceptGateItems`
    - `conceptGateBank`
    - `generatedMasteryItems`
    - `masteryItems`
  - built lesson-specific banks for:
    - `A8_L1` electric field and test charges
    - `A8_L2` electric potential and equipotentials
    - `A8_L3` uniform fields and parallel plates
    - `A8_L4` point charges and Coulomb's law
    - `A8_L5` magnetic force on charges and currents
    - `A8_L6` charged particle orbits and motor motion
- Bank-size outcome by construction:
  - every A8 lesson now has:
    - diagnostic `20`
    - concept `20`
    - mastery `40`
- Quality improvements in the new banks:
  - reduced unnecessary repetition by varying stems and asking different reasoning jobs
  - strengthened IGCSE-style rigor by combining:
    - direct definitions
    - sign and direction reasoning
    - formula selection
    - proportional reasoning
    - short calculations
    - mechanism explanations
  - kept mastery as a genuine broadened pool rather than a tiny recycled set

## Technical Words

- Audit result:
  - A8 was in the strict-authored module list but did not have an A8-specific curriculum supplement in `lib/technicalWords.ts`
  - that left fallback support too thin whenever authored lesson words were absent or sparse
- Fixes applied:
  - added `CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS.A8` with module-relevant terms:
    - `Electric field`
    - `Field strength`
    - `Test charge`
    - `Electric potential`
    - `Potential difference`
    - `Equipotential`
    - `Potential gradient`
    - `Uniform field`
    - `Parallel plates`
    - `Point charge`
    - `Coulomb's law`
    - `Inverse-square law`
    - `Magnetic flux density`
    - `Motor effect`
    - `Centripetal force`
    - `Turning couple`
- Result:
  - the glossary layer now supports the actual A8 conceptual ladder instead of depending too heavily on formula-symbol extraction.

## Formulas

- Audit result:
  - A8 already had solid baseline support in `lib/supplementalEquationFallbacks.ts`, but a few advanced bridges were missing.
- Fixes applied:
  - retained and verified:
    - `E = F / q`
    - `F = qE`
    - `delta(E_p) = q delta(V)`
    - `V = W / Q`
    - `E = V / d`
    - `F = kQq / r^2`
    - `F = Bqv sin(theta)`
    - `F = BIL sin(theta)`
    - `qvB = mv^2 / r`
    - `r = mv / (qB)`
  - added:
    - `E = kQ / r^2`
    - `V = kQ / r`
    - `T = 2 pi m / (qB)`
- Result:
  - the formula bridge now better matches the stronger point-charge, potential, and orbit reasoning used in the revised banks.

## Video Assets

- Audit result:
  - `public/lesson_assets/A8` contains diagram assets only
  - there are no current A8 lesson video assets in the repo
- Root media issue:
  - the written lesson state, assessment state, and simulation state are now more advanced than the media layer
  - any older lesson videos therefore no longer match the present A8 lesson state
- Concrete next media task:
  - remap and rerender all A8 lesson videos:
    - `A8_L1` field versus force and test-charge sampling
    - `A8_L2` potential, equipotential, and field-perpendicular geometry
    - `A8_L3` uniform-field gradient across parallel plates
    - `A8_L4` Coulomb sign and inverse-square reasoning
    - `A8_L5` perpendicular magnetic force on charges and currents
    - `A8_L6` magnetic orbit and motor couple as one shared-force idea

## Concrete Fix List

- Simulations:
  - done: replace the shared A6-A11 scaffold panel with dedicated A8 interactive explorers
- Diagrams:
  - done: preserve existing aligned A8 diagrams and make generated-bank visual resolution work correctly
- Tests:
  - done: add dedicated A8 assessment banks
  - done: guarantee `20 / 20 / 40`
  - done: improve rigor with calculation, sign reasoning, and mechanism explanations
- Technical words:
  - done: add A8-specific glossary fallback support
- Formulas:
  - done: add point-charge field, point-charge potential, and magnetic-orbit period support
- Video assets:
  - still outstanding: remap and rerender the full A8 lesson-video set so media matches the updated lesson state
