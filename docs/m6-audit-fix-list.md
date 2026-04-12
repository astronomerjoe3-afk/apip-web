# M6 Audit And Fix List

Module `M6` is the thermal-energy module covering temperature versus heat transfer, specific heat capacity, latent heat, conduction, convection, radiation, and mixed multi-stage thermal calculations. This pass audited the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that were needed in code and assets.

## Summary

- Module state after this pass:
  - `M6` now has dedicated lesson-owned generated assessment banks for all six lessons.
  - The lesson runner keeps the standard delivery rules unchanged:
    - diagnostic: `2-5` questions
    - concept check: first-correct gate
    - mastery: `5-10` questions
  - Every M6 lesson now meets the requested minimum bank size:
    - diagnostic: `20`
    - concept: `20`
    - mastery: `40`
- Main weaknesses found before fixes:
  - `M6` had no dedicated `m6AssessmentBanks.ts`, so assessment quality still depended too heavily on smaller authored pools and generic fallback wiring.
  - The glossary and formula bridge were aligned, but still a bit thin for stronger IGCSE-style thermal reasoning.
  - `public/lesson_assets/M6` was missing from this repo snapshot even though the runner was already wired to lesson-specific M6 videos.

## Simulations

- Audit result:
  - `components/M6SimulationPanels.tsx` is already lesson-specific and aligned to the thermal sequence:
    - `M6_L1`: temperature versus transferred energy
    - `M6_L2`: `Q = mc delta T`
    - `M6_L3`: latent heat and plateau stages
    - `M6_L4`: conduction by contact path
    - `M6_L5`: convection as a density-driven loop
    - `M6_L6`: radiation plus stage-by-stage thermal bookkeeping
- Fix result:
  - no simulation remap was required in this pass

## Diagrams

- Audit result:
  - `lib/m6LessonContent.ts` already maps each lesson to a dedicated thermal diagram:
    - `m6-l1-warmth-level.svg`
    - `m6-l2-level-cost.svg`
    - `m6-l3-form-gate.svg`
    - `m6-l4-touch-relay.svg`
    - `m6-l5-carrier-loop.svg`
    - `m6-l6-glow-ledger.svg`
  - The M6 worked examples in `lib/lessonRunnerApi.ts` are already lesson-aligned and topic-appropriate.
- Fix result:
  - no diagram remap was required in this pass

## Tests

- Audit result before fixes:
  - `M6` had no dedicated `lib/m6AssessmentBanks.ts`
  - that left the module underpowered on:
    - bank depth
    - repetition resistance
    - lesson-by-lesson differentiation
    - IGCSE-style reasoning across formula choice, route choice, and stage choice
- Fixes applied:
  - added `lib/m6AssessmentBanks.ts`
  - wired `lib/lessonRunnerApi.ts` so M6 diagnostics, concept gates, and mastery checks all use the dedicated generated banks
  - built lesson-owned banks for:
    - `M6_L1`: temperature versus heat transfer and why equal temperature is not the same as equal thermal energy
    - `M6_L2`: specific heat capacity and disciplined use of `Q = mc delta T`
    - `M6_L3`: latent heat, plateaus, and `Q = mL`
    - `M6_L4`: conduction as a contact-path process
    - `M6_L5`: convection as a full density-driven circulation
    - `M6_L6`: radiation, absorber/emitter logic, and mixed-stage totals
  - the new banks emphasize:
    - misconception repair
    - route-choice reasoning
    - stage-choice reasoning
    - formula selection and rearrangement
    - short numerical questions with exact thermal logic
    - stronger comparison and explanation tasks

## Technical Words

- Audit result:
  - the M6 glossary was aligned, but needed stronger support for radiation and latent-heat language
- Fixes applied in `lib/technicalWords.ts`:
  - retained the core M6 thermal vocabulary
  - added:
    - `Specific latent heat`
    - `Absorber`
    - `Emitter`
    - `Vacuum`

## Formulas

- Audit result:
  - the existing relation bridge was on-topic, but still too thin in four places:
    - same-temperature-versus-total-energy reasoning
    - rearranged heating calculations
    - plateau interpretation
    - absorber/emitter rules for radiation
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - added:
    - `same temperature does not imply same total thermal energy`
    - `delta T = Q / (mc)`
    - `state change at constant temperature still needs energy`
    - `larger temperature difference -> faster conduction along the same path`
    - `convection needs a fluid and a density-driven loop`
    - `good absorber = good emitter`

## Video Assets

- Audit result:
  - `lib/lessonRunnerApi.ts` was already wired to lesson-specific M6 videos, but the expected folder was missing in this repo snapshot
- Fix applied:
  - restored `public/lesson_assets/M6` with lesson-specific:
    - `captions.vtt`
    - `final.mp4`
    - `thumbnail.png`
  - for:
    - `M6_L1`
    - `M6_L2`
    - `M6_L3`
    - `M6_L4`
    - `M6_L5`
    - `M6_L6`

## Concrete Fix List

- Simulations:
  - confirmed aligned, no remap needed this pass
- Diagrams:
  - confirmed aligned, no remap needed this pass
- Tests:
  - done: add dedicated M6 assessment banks
  - done: bring every lesson to `20 / 20 / 40`
  - done: strengthen formula choice, stage choice, route choice, and IGCSE-style explanation rigor
- Technical words:
  - done: expand thermal vocabulary support for latent heat and radiation
- Formulas:
  - done: strengthen the relation bridge for heating, plateau, conduction, convection, and radiation reasoning
- Video assets:
  - done: restore the missing lesson-owned M6 video package expected by the runner
