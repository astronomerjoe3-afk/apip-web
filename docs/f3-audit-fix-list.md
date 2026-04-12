# F3 Audit Fix List

## Simulations
- Current F3 simulation copy in `lib/lessonRunnerApi.ts` is lesson-aligned across the six topics:
  - `F3_L1`: work done as force-driven energy transfer
  - `F3_L2`: kinetic and gravitational potential energy comparisons
  - `F3_L3`: power versus efficiency
  - `F3_L4`: system momentum and collision bookkeeping
  - `F3_L5`: impulse, force-time area, and stopping-time trade-offs
  - `F3_L6`: braking safety through momentum, kinetic energy, and stopping force
- No cross-topic simulation-copy leak was found in this pass.
- Current structural limitation:
  - F3 still uses the generic lesson-runner simulation shell rather than a dedicated mechanics-energy panel set.
- Concrete follow-up if deeper interactivity is needed:
  - build `components/F3SimulationPanels.tsx`
  - route `F3_` lessons to that component in `components/LessonRunner.tsx`
  - expose lesson-specific manipulatives for work-transfer comparisons, energy-store sliders, power-efficiency audits, momentum-exchange boards, force-time graph area labs, and braking-safety scenarios

## Diagrams
- Current F3 scaffold visuals are present and lesson-specific in `public/lesson-media/f3`:
  - `f3-l1-work-energy.svg`
  - `f3-l2-energy-stores.svg`
  - `f3-l3-power-efficiency.svg`
  - `f3-l4-momentum-collision.svg`
  - `f3-l5-force-time-check.svg`
  - `f3-l5-impulse-time.svg`
  - `f3-l6-braking-safety.svg`
- No stale non-F3 diagram names were found in the sampled F3 media set.
- No diagram remap was required in this pass.

## Tests
- Add a dedicated generated F3 assessment bank in [lib/f3AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f3AssessmentBanks.ts).
- Route F3 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- Bank floor targets after this fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within 2-5 questions
  - concept gate serves one question at a time and ends on first correct answer
  - mastery stays within the 5-10 question window
- Audit goals applied in the new bank:
  - replace the small inline F3 fallback pool with full lesson-owned banks
  - remove unnecessary repetition across work, energy, power, momentum, impulse, and braking contexts
  - raise F3 toward stronger IGCSE-style conceptual and numerical reasoning instead of label-only recall
  - keep rate, store, conservation, system, and safety ideas cleanly separated rather than blended into slogans

## Technical Words
- Expand the F3 fallback glossary in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\technicalWords.ts).
- New or strengthened F3 terms in this pass:
  - kinetic energy
  - gravitational potential energy
  - momentum
  - impulse
  - crumple zone
- Existing aligned F3 terms retained:
  - energy
  - energy store
  - transfer
  - work done
  - power
  - conservation of energy
  - efficiency

## Formulas
- Current F3 formula support in `lib/lessonRunnerApi.ts` under `foundationFormulaFallbacks` is aligned and already covers the six lessons:
  - `F3_L1`: `W = Fs`, `change in energy = work done`
  - `F3_L2`: `E_k = 1/2mv^2`, `E_p = mgh`
  - `F3_L3`: `P = E / t`, `efficiency = useful output / total input x 100%`
  - `F3_L4`: `p = mv`, `total momentum before = total momentum after`
  - `F3_L5`: `impulse = F x t = change in momentum`
  - `F3_L6`: `F = change in momentum / time`, `E_k = 1/2mv^2`
- No formula remap was required in this pass.

## Video Assets
- Public lesson video assets are present for all six F3 lessons under `public/lesson_assets/F3/F3_L1` through `F3_L6` with:
  - `final.mp4`
  - `thumbnail.png`
  - `captions.vtt`
- Static F3 video routing is already present in `lib/lessonRunnerApi.ts`.
- No missing-asset blocker was found in this pass.
- Follow-up recommendation:
  - keep future rerenders tied to the current lesson state whenever worked examples, scaffold copy, or simulation tasks are materially revised
