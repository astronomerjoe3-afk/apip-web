# A7 Audit Fix List

## Simulations
- Keep the A7 lesson simulation copy in `lib/a6ToA11LessonContentData.json` aligned to the six DC-circuit and capacitor lessons:
  - `A7_L1`: emf, terminal p.d., and internal resistance
  - `A7_L2`: Kirchhoff laws and node/loop bookkeeping
  - `A7_L3`: potential dividers
  - `A7_L4`: capacitance and charge storage
  - `A7_L5`: RC charging and discharging
  - `A7_L6`: capacitor energy and dielectrics
- Current code still routes A7 through the shared `components/A6ToA11SimulationPanels.tsx` scaffold shell rather than a dedicated A7 circuit-and-capacitor explorer.
- Concrete follow-up simulation remap if deeper interactivity is required:
  - build a dedicated `components/A7SimulationPanels.tsx`
  - route `A7_` lessons to that component in `components/LessonRunner.tsx`
  - give each lesson a true manipulable circuit or capacitor panel instead of a copy-and-diagram shell

## Diagrams
- Keep the lesson-aligned A7 diagram files:
  - `a7_l1_emf_terminal_pd_internal_resistance.svg`
  - `a7_l2_kirchhoff_laws_nodes.svg`
  - `a7_l3_potential_dividers.svg`
  - `a7_l4_capacitance_charge_storage.svg`
  - `a7_l5_rc_charging_discharging.svg`
  - `a7_l6_capacitor_energy_dielectrics.svg`
- No stale cross-topic A7 diagram leftovers were found in this pass.

## Tests
- Add a dedicated generated A7 assessment bank in [lib/a7AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a7push\lib\a7AssessmentBanks.ts).
- Route A7 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a7push\lib\lessonRunnerApi.ts).
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
  - keep IGCSE-level conceptual and numerical challenge visible
  - separate node-current, loop-voltage, divider-ratio, capacitor-storage, RC-timescale, and dielectric-condition reasoning cleanly
  - use lesson-specific prompts rather than generic slogan answers

## Technical Words
- Add an explicit A7 fallback technical-word block in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-a7push\lib\technicalWords.ts).
- Keep A7 fallback vocabulary aligned to DC circuits and capacitors, including:
  - emf
  - terminal potential difference
  - internal resistance
  - junction rule
  - loop rule
  - potential divider
  - output voltage
  - capacitance
  - capacitor
  - charge
  - time constant
  - charging curve
  - discharging curve
  - dielectric
  - capacitor energy

## Formulas
- Current A7 formula support in `lib/supplementalEquationFallbacks.ts` is aligned and already covers the six lessons:
  - `A7_L1`: `V = epsilon - I r`, `P_internal = I^2 r`
  - `A7_L2`: `sum I_in = sum I_out`, `sum V_rises = sum V_drops`
  - `A7_L3`: `V_out = V_supply x R_lower / (R_upper + R_lower)`
  - `A7_L4`: `Q = C V`
  - `A7_L5`: `tau = R C`, `V_C = V_supply (1 - e^(-t / R C))`, `V_C = V_0 e^(-t / R C)`
  - `A7_L6`: `E = 1/2 C V^2`, `C proportional to epsilon_r A / d`
- No formula remap was required in this pass.

## Video Assets
- No A7 static video routing was found in `lib/lessonRunnerApi.ts` in this pass.
- Public A7 lesson asset folders currently contain diagrams only; matching A7 `final.mp4`, `thumbnail.png`, and `captions.vtt` assets were not present in the sampled lesson-asset structure.
- Concrete video follow-up:
  - remap A7 lesson video routing in `lib/lessonRunnerApi.ts`
  - create or restore lesson-aligned captions, thumbnails, and final renders for `A7_L1` through `A7_L6`
  - rerender the current lesson videos against the present DC-circuit and capacitor lesson state before visual QA signoff
