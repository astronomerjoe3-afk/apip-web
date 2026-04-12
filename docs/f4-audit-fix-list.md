# F4 Audit Fix List

## Simulations
- Current F4 simulation copy in `lib/lessonRunnerApi.ts` is lesson-aligned across the six circuit lessons:
  - `F4_L1`: charge and current in a complete loop
  - `F4_L2`: potential difference as energy per charge
  - `F4_L3`: resistance and I-V response
  - `F4_L4`: one-route series circuits
  - `F4_L5`: split-route parallel circuits
  - `F4_L6`: power, total energy transfer, and fuse safety
- No cross-topic simulation-copy leak was found in this pass.
- Current structural limitation:
  - F4 still uses the generic lesson-runner simulation shell rather than a dedicated circuits panel set.
- Concrete follow-up if deeper interactivity is needed:
  - build `components/F4SimulationPanels.tsx`
  - route `F4_` lessons to that component in `components/LessonRunner.tsx`
  - expose lesson-specific manipulatives for current checkpoints, energy-per-charge comparisons, I-V graph response, series voltage sharing, parallel branch splitting, and power-fuse overload cases

## Diagrams
- Current F4 scaffold visuals are present and lesson-specific in `public/lesson-media/f4`:
  - `f4-l1-charge-current.svg`
  - `f4-l2-potential-difference.svg`
  - `f4-l3-resistance-iv.svg`
  - `f4-l4-series-circuit.svg`
  - `f4-l5-parallel-circuit.svg`
  - `f4-l6-power-safety.svg`
- No stale non-circuit diagram names were found in the sampled F4 media set.
- No diagram remap was required in this pass.

## Tests
- Add a dedicated generated F4 assessment bank in [lib/f4AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f4AssessmentBanks.ts).
- Route F4 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- Bank floor targets after this fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within 2-5 questions
  - concept gate serves one question at a time and ends on first correct answer
  - mastery stays within the 5-10 question window
- Audit goals applied in the new bank:
  - replace the undersized inline F4 fallback pool with full lesson-owned banks
  - reduce repetition across current, voltage, resistance, series, parallel, and power-safety prompts
  - raise F4 toward stronger IGCSE-style conceptual and numerical reasoning instead of label-only recall
  - keep charge flow, energy per charge, route difficulty, route structure, and safety current limits cleanly separated

## Technical Words
- Replace the stale wave glossary block in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\technicalWords.ts) with F4-specific circuit vocabulary.
- New F4-aligned fallback glossary terms in this pass:
  - charge
  - current
  - potential difference
  - resistance
  - ohmic component
  - I-V graph
  - series circuit
  - parallel circuit
  - power
  - fuse

## Formulas
- Current F4 formula support in `lib/lessonRunnerApi.ts` under `foundationFormulaFallbacks` is aligned and already covers the six lessons:
  - `F4_L1`: `I = Q / t`, `Q = It`
  - `F4_L2`: `V = E / Q`, `E = VQ`
  - `F4_L3`: `R = V / I`, `I = V / R`
  - `F4_L4`: `R_total = R1 + R2 + ...`, `V_total = V1 + V2 + ...`
  - `F4_L5`: `I_total = I1 + I2 + ...`, `V_branch = V_supply`
  - `F4_L6`: `P = IV`, `E = Pt`, `E = VIt`
- No formula remap was required in this pass.

## Video Assets
- Public lesson video assets are present for all six F4 lessons under `public/lesson_assets/F4/F4_L1` through `F4_L6` with:
  - `final.mp4`
  - `thumbnail.png`
  - `captions.vtt`
- Static F4 video routing is already present in `lib/lessonRunnerApi.ts`.
- No missing-asset blocker was found in this pass.
- Follow-up recommendation:
  - keep future rerenders tied to the current lesson state whenever worked examples, scaffold copy, or simulation tasks are materially revised
