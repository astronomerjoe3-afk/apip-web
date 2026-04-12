# A9 Audit And Fix List

Module `A9` is the advanced electromagnetic induction and alternating-current module covering magnetic flux, Faraday induction, Lenz's law, generators, transformers, rms values, power transmission, and eddy currents. This audit checked A9 holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be made directly in code.

## Summary

- Module state after this pass:
  - A9 now has dedicated generated assessment banks instead of relying on generic authored-or-fallback behavior.
  - A9 now has a dedicated `Try it in action` simulation layer instead of the shared `A6ToA11` explainer panel.
  - A9 glossary and formula fallback support now match the actual induction sequence.
  - A9 diagrams were already aligned and were preserved.
- Runner rules preserved:
  - diagnostic: `2-5` questions
  - concept check: first correct answer gate
  - mastery: `5-10` questions
- Remaining media gap:
  - A9 still has no dedicated lesson video assets under `public/lesson_assets/A9/.../videos`.
  - The current lesson videos therefore still need to be remapped and rerendered completely to match the present lesson state.

## Simulations

- Audit result:
  - A9 had been routed through `components/A6ToA11SimulationPanels.tsx`, which is a lesson-copy scaffold rather than a real manipulative explorer.
  - That meant A9 `Try it in action` stayed descriptive instead of operational.
- Fixes applied:
  - added `components/A9SimulationPanels.tsx`
  - updated `components/LessonRunner.tsx` so `A9_` lessons now use the dedicated A9 component
  - added lesson-specific boards for:
    - `A9_L1`: Faraday flux-window explorer
    - `A9_L2`: Lenz opposition-direction mapper
    - `A9_L3`: generator frequency and alternating-emf trace
    - `A9_L4`: transformer turns-ratio and ideal-power bridge
    - `A9_L5`: rms and transmission-loss route
    - `A9_L6`: eddy-current applications board
- Result:
  - A9 now has true lesson-specific interaction instead of shared placeholder explanation.

## Diagrams

- Audit result:
  - A9 already had topic-aligned diagrams for all six lessons in `public/lesson_assets/A9`.
  - The mapping in `lib/a6ToA11LessonContentData.json` is coherent and lesson-specific:
    - `A9_L1`: magnetic flux and Faraday induction
    - `A9_L2`: Lenz-law opposition
    - `A9_L3`: generators and a.c.
    - `A9_L4`: transformers and turns ratio
    - `A9_L5`: rms values and power transmission
    - `A9_L6`: eddy currents and applications
- Fix applied:
  - no remap was needed because the existing A9 visual layer is already aligned.
- Result:
  - diagrams are in line with the topic and remained stable in this pass.

## Tests

- Audit result:
  - A9 previously had no dedicated generated-bank override in `lib/lessonRunnerApi.ts`.
  - That meant A9 could fall back to thinner authored or generic pools without guaranteeing the required bank sizes, difficulty, or coverage.
- Fixes applied:
  - added `lib/a9AssessmentBanks.ts`
  - wired A9 into:
    - `generatedDiagnosticItems`
    - `diagnosticItems`
    - `generatedConceptGateItems`
    - `conceptGateBank`
    - `generatedMasteryItems`
    - `masteryItems`
- Bank-size outcome by construction:
  - every A9 lesson now has:
    - diagnostic `20`
    - concept `20`
    - mastery `40`
- Quality improvements in the new banks:
  - reduced unnecessary repetition by varying stems and asking different reasoning jobs
  - strengthened IGCSE-style appropriateness by mixing:
    - direct definition checks
    - mechanism explanations
    - sign and direction reasoning
    - proportional reasoning
    - short numerical calculations
    - device and application interpretation
  - kept mastery as a widened pool rather than a tiny repeated quiz

## Technical Words

- Audit result:
  - `A9` is in the strict-authored module list in `lib/technicalWords.ts`, but it did not yet have a curriculum supplement block.
  - That left fallback technical-word support too thin whenever authored lesson entries were sparse.
- Fixes applied:
  - added `CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS.A9` with vocabulary for:
    - magnetic flux
    - flux linkage
    - induced emf
    - Faraday's law
    - Lenz's law
    - generator
    - alternating current
    - slip rings
    - transformer
    - primary coil
    - secondary coil
    - turns ratio
    - rms value
    - peak value
    - transmission loss
    - eddy current
    - lamination
    - magnetic braking
- Result:
  - A9 technical words now reflect the actual induction and power-transmission ladder.

## Formulas

- Audit result:
  - A9 already had a strong baseline formula layer in `lib/supplementalEquationFallbacks.ts`, but a few bridge relations were still missing from the fallback set.
- Fixes applied:
  - retained and verified:
    - `induced emf = N delta(Phi) / delta(t)`
    - `induced emf = -N delta(Phi) / delta(t)`
    - `Phi = B A cos(theta)`
    - `f = 1 / T`
    - `V_p / V_s = N_p / N_s`
    - `V_p I_p = V_s I_s`
    - `V_rms = V_peak / sqrt(2)`
    - `I_rms = I_peak / sqrt(2)`
    - `P_loss = I^2 R`
    - `P = I^2 R`
  - added:
    - `I_p / I_s = N_s / N_p`
    - `P = V I`
- Result:
  - the formula bridge now matches the stronger transformer-current tradeoff and transmission-power reasoning used in the revised A9 banks.

## Video Assets

- Audit result:
  - `public/lesson_assets/A9` currently contains diagram assets only.
  - There are no dedicated A9 lesson-video assets in the repo.
- Root media issue:
  - the updated lesson structure, explorer layer, and assessment layer are now ahead of the media layer.
  - Any older lesson videos therefore no longer match the present A9 lesson state.
- Concrete next media task:
  - remap and rerender all A9 lesson videos:
    - `A9_L1` changing flux linkage and Faraday induction
    - `A9_L2` Lenz-law opposition and direction reasoning
    - `A9_L3` generator rotation, frequency, and alternating emf
    - `A9_L4` transformer action through shared changing core flux
    - `A9_L5` rms values and high-voltage transmission
    - `A9_L6` eddy-current heating, braking, and laminated-core design

## Concrete Fix List

- Simulations:
  - done: replace the shared A6-A11 scaffold panel with dedicated A9 interactive explorers
- Diagrams:
  - confirmed aligned and preserved
- Tests:
  - done: add dedicated A9 diagnostic, concept, and mastery banks
  - done: guarantee `20 / 20 / 40`
  - done: increase conceptual and mathematical rigor
- Technical words:
  - done: add A9-specific glossary fallback support
- Formulas:
  - done: strengthen the transformer-current and transmission-power bridge formulas
- Video assets:
  - still outstanding: remap and rerender the full A9 lesson-video set so media matches the updated lesson state
