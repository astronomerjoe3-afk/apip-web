# A10 Audit And Fix List

Module `A10` is the advanced nuclear-physics module covering Rutherford scattering, particle accelerators and detectors, radioactive decay and activity, binding energy and mass defect, fission and thermal reactors, and fusion with process comparison. This audit checked A10 holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be made directly in code.

## Summary

- Module state after this pass:
  - A10 now has dedicated generated assessment banks instead of falling back to generic authored-or-fallback behavior.
  - A10 now has a dedicated `Try it in action` simulation layer instead of the shared `A6ToA11` explainer panel.
  - A10 glossary and formula fallback support now match the nuclear sequence actually taught in the lesson set.
  - A10 diagrams were already aligned and were preserved.
- Runner rules preserved:
  - diagnostic: `2-5` questions
  - concept check: first correct answer gate
  - mastery: `5-10` questions
- Remaining media gap:
  - A10 still has no dedicated lesson video assets under `public/lesson_assets/A10/.../videos`.
  - The current lesson videos therefore still need to be remapped and rerendered completely to match the present lesson state.

## Simulations

- Audit result:
  - A10 had been routed through `components/A6ToA11SimulationPanels.tsx`, which is a shared explainer scaffold rather than a true lesson-specific manipulative board.
  - That meant A10 `Try it in action` was not actually testing the nuclear reasoning of each lesson.
- Fixes applied:
  - added `components/A10SimulationPanels.tsx`
  - updated `components/LessonRunner.tsx` so `A10_` lessons now use the dedicated A10 component
  - added lesson-specific boards for:
    - `A10_L1`: Rutherford scattering and rare close-pass deflections
    - `A10_L2`: accelerator-beam energy and detector-track curvature
    - `A10_L3`: decay equations, half-life, and activity drop
    - `A10_L4`: mass defect, binding energy, and binding energy per nucleon
    - `A10_L5`: fission rate, multiplication factor, and thermal-reactor control
    - `A10_L6`: fusion conditions, mass defect, and process comparison
- Result:
  - A10 now has real lesson-specific interaction instead of a generic placeholder description.

## Diagrams

- Audit result:
  - A10 already had topic-aligned diagrams for all six lessons in `public/lesson_assets/A10`.
  - The mapping in `lib/a6ToA11LessonContentData.json` is coherent and lesson-specific:
    - `A10_L1`: scattering and nuclear size
    - `A10_L2`: accelerators and detectors
    - `A10_L3`: decay equations and activity
    - `A10_L4`: binding energy and mass defect
    - `A10_L5`: fission, chain reactions, and thermal reactors
    - `A10_L6`: fusion and nuclear process comparison
- Fix applied:
  - no diagram remap was needed because the existing A10 visual layer is already aligned.
- Result:
  - diagrams are in line with the topic and remained stable in this pass.

## Tests

- Audit result:
  - A10 previously had no dedicated generated-bank override in `lib/lessonRunnerApi.ts`.
  - That meant A10 could fall back to thinner authored or generic pools without guaranteeing the required bank sizes, challenge level, or coverage.
- Fixes applied:
  - added `lib/a10AssessmentBanks.ts`
  - wired A10 into:
    - `generatedDiagnosticItems`
    - `diagnosticItems`
    - `generatedConceptGateItems`
    - `conceptGateBank`
    - `generatedMasteryItems`
    - `masteryItems`
- Bank-size outcome by construction:
  - every A10 lesson now has:
    - diagnostic `20`
    - concept `20`
    - mastery `40`
- Quality improvements in the new banks:
  - reduced unnecessary repetition by varying stems and asking different reasoning jobs
  - strengthened IGCSE-style appropriateness by mixing:
    - nuclear bookkeeping
    - half-life and activity reasoning
    - detector and accelerator interpretation
    - binding-energy comparisons
    - reactor-control logic
    - fusion-condition reasoning
    - short numerical calculations with realistic nuclear units
  - kept mastery as a widened pool rather than a tiny repeated quiz

## Technical Words

- Audit result:
  - `A10` was in the strict-authored module list in `lib/technicalWords.ts`, but it did not yet have a curriculum supplement block.
  - That left fallback technical-word support too thin whenever authored lesson entries were sparse.
- Fixes applied:
  - added `CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS.A10` with vocabulary for:
    - alpha scattering
    - impact parameter
    - backscattering
    - particle accelerator
    - particle detector
    - radioactive decay
    - activity
    - decay constant
    - half-life
    - mass defect
    - binding energy
    - binding energy per nucleon
    - fission
    - chain reaction
    - thermal neutron
    - moderator
    - control rod
    - critical state
    - fusion
    - Coulomb barrier
    - plasma
- Result:
  - A10 technical words now reflect the actual nuclear ladder instead of depending only on authored entries.

## Formulas

- Audit result:
  - A10 already had a useful baseline formula layer in `lib/supplementalEquationFallbacks.ts`, but the bridge set was still too thin in a few places.
- Fixes applied:
  - retained and verified:
    - `E_k = qV`
    - `r = mv / qB`
    - `A = lambda N`
    - `lambda = ln(2) / t_(1/2)`
    - `N = N_0 (1/2)^(t / t_(1/2))`
    - `Delta E = Delta m c^2`
    - `binding energy per nucleon = total binding energy / A`
    - `R = R0 A^(1/3)`
    - `P = E / t`
    - `fission rate = power / energy per fission`
  - added:
    - `E_k = 1/2 m v^2`
    - `p = qBr`
    - `A = A_0 (1/2)^(t / t_(1/2))`
    - `mass defect = Zm_p + Nm_n - m_nucleus`
    - `binding energy = mass defect x 931.5 MeV`
    - `critical reactor: k = 1`
    - `fusion energy released = (mass of reactants - mass of products)c^2`
- Result:
  - the formula bridge now matches the stronger mathematical reasoning used in the revised A10 banks.

## Video Assets

- Audit result:
  - `public/lesson_assets/A10` currently contains diagram assets only.
  - There are no dedicated A10 lesson-video assets in the repo.
- Root media issue:
  - the updated lesson structure, explorer layer, and assessment layer are now ahead of the media layer.
  - Any older lesson videos therefore no longer match the present A10 lesson state.
- Concrete next media task:
  - remap and rerender all A10 lesson videos:
    - `A10_L1` Rutherford scattering and nuclear-size inference
    - `A10_L2` beam preparation, acceleration, and detector readout
    - `A10_L3` decay balancing, half-life, and activity
    - `A10_L4` mass defect, binding energy, and nuclear stability
    - `A10_L5` fission chains, thermal reactors, and reactor control
    - `A10_L6` fusion conditions, binding-energy comparison, and process comparison

## Concrete Fix List

- Simulations:
  - done: replace the shared A6-A11 scaffold panel with dedicated A10 interactive explorers
- Diagrams:
  - confirmed aligned and preserved
- Tests:
  - done: add dedicated A10 diagnostic, concept, and mastery banks
  - done: guarantee `20 / 20 / 40`
  - done: increase conceptual and mathematical rigor
- Technical words:
  - done: add A10-specific glossary fallback support
- Formulas:
  - done: strengthen the accelerator, decay, mass-defect, reactor, and fusion bridge formulas
- Video assets:
  - still outstanding: remap and rerender the full A10 lesson-video set so media matches the updated lesson state
