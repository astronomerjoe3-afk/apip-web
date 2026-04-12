# A6 Audit Fix List

## Simulations
- Keep the A6 lesson simulation copy in `lib/a6ToA11LessonContentData.json` aligned to the six thermal-physics lessons:
  - `A6_L1`: internal energy vs temperature
  - `A6_L2`: specific heat capacity
  - `A6_L3`: latent heat and state change
  - `A6_L4`: ideal gas law and state variables
  - `A6_L5`: gas laws and state graphs
  - `A6_L6`: kinetic theory of gases
- Current code still routes A6 through the shared `components/A6ToA11SimulationPanels.tsx` scaffold shell rather than a dedicated thermal explorer component.
- Concrete follow-up simulation remap if deeper interactivity is required:
  - build a dedicated `components/A6SimulationPanels.tsx`
  - route `A6_` lessons to that component in `components/LessonRunner.tsx`
  - give each lesson a true manipulable thermal/gas-state panel instead of a copy-and-diagram shell

## Diagrams
- Keep the lesson-aligned A6 diagram files:
  - `a6_l1_internal_energy_temperature.svg`
  - `a6_l2_specific_heat_capacity.svg`
  - `a6_l3_latent_heat_state_change.svg`
  - `a6_l4_ideal_gas_state_variables.svg`
  - `a6_l5_gas_laws_state_graphs.svg`
  - `a6_l6_kinetic_theory_gases.svg`
- No stale cross-topic A6 diagram leftovers were found in this pass.

## Tests
- Add a dedicated generated A6 assessment bank in [lib/a6AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a6push\lib\a6AssessmentBanks.ts).
- Route A6 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a6push\lib\lessonRunnerApi.ts).
- Bank floor targets after this fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within 2-5 questions
  - concept gate delivers one question at a time and stops on first correct answer
  - mastery delivers within the 5-10 question window
- Audit goals applied in the new bank:
  - remove unnecessary repetition
  - increase IGCSE-level conceptual and numerical demand
  - keep mechanism-first thermal and gas reasoning visible
  - use lesson-specific prompts instead of generic slogan answers

## Technical Words
- Add an explicit A6 fallback technical-word block in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a6push\lib\technicalWords.ts).
- Keep A6 fallback vocabulary aligned to thermal physics and gases, including:
  - temperature
  - internal energy
  - specific heat capacity
  - latent heat
  - latent heat of fusion
  - latent heat of vaporization
  - ideal gas
  - pressure
  - volume
  - amount of substance
  - kelvin
  - isothermal
  - isobaric
  - isochoric
  - kinetic theory
  - root-mean-square speed

## Formulas
- Current A6 formula support in `lib/supplementalEquationFallbacks.ts` is aligned and already covers the six lessons:
  - `A6_L1`: `average kinetic energy = 3/2 k T`, `U = 3/2 N k T`
  - `A6_L2`: `Q = m c Delta T`
  - `A6_L3`: `Q = m L`
  - `A6_L4`: `pV = nRT`
  - `A6_L5`: `p1 V1 = p2 V2`, `V1 / T1 = V2 / T2`, `p1 / T1 = p2 / T2`
  - `A6_L6`: `p = 1/3 rho c_rms^2`, `average kinetic energy = 3/2 k T`
- No formula remap was required in this pass.

## Video Assets
- No A6 static video routing was found in `lib/lessonRunnerApi.ts` in this pass.
- Public A6 lesson asset folders currently contain diagrams only; matching A6 `final.mp4`, `thumbnail.png`, and `captions.vtt` assets were not present in the sampled lesson-asset structure.
- Concrete video follow-up:
  - remap A6 lesson video routing in `lib/lessonRunnerApi.ts`
  - create or restore lesson-aligned captions, thumbnails, and final renders for `A6_L1` through `A6_L6`
  - rerender the current lesson videos against the present thermal-physics lesson state before visual QA signoff
