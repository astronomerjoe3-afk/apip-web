# A4 Audit Fix List

## Simulations
- Keep `components/A4SimulationPanels.tsx` as the canonical A4 explorer set. Its six lesson panels are already aligned to vector equilibrium, component kinematics, projectile motion, momentum, circular motion, and materials response.
- Remove stale public simulation leftovers that belong to a thermodynamics / generic minigame track rather than A4:
  - `A4_L1/simulations/a4_wall_hit_builder_lab`
  - `A4_L2/simulations/a4_chamber_resize_lab`
  - `A4_L3/simulations/a4_dash_level_lab`
  - `A4_L4/simulations/a4_average_dash_energy_lab`
  - `A4_L5/simulations/a4_partition_drop_lab`
  - `A4_L6/simulations/a4_option_count_boss`

## Diagrams
- Keep the lesson-aligned A4 diagram files:
  - `a4_l1_vector_equilibrium.svg`
  - `a4_l2_kinematics_maps.svg`
  - `a4_l3_projectile_motion.svg`
  - `a4_l4_momentum_collisions.svg`
  - `a4_l5_circular_motion.svg`
  - `a4_l6_springs_materials.svg`
- Remove stale cross-topic diagram leftovers that do not belong in advanced mechanics and materials:
  - `a4-l1-bounce-chamber-pressure.svg`
  - `a4-l2-gas-law-balance.svg`
  - `a4-l3-kinetic-theory-bridge.svg`
  - `a4-l4-average-dash-energy.svg`
  - `a4-l5-partition-expansion.svg`
  - `a4-l6-entropy-option-count.svg`

## Tests
- Add a dedicated generated A4 assessment bank in `lib/a4AssessmentBanks.ts`.
- Route A4 through generated diagnostic, concept-gate, and mastery pools in `lib/lessonRunnerApi.ts`.
- Bank floor targets after the fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules already enforced by the runner and preserved by this fix:
  - diagnostics adapt within 2-5 questions
  - concept gate delivers one question at a time and stops on first correct answer
  - mastery delivers within the 5-10 question window
- Audit goals applied in the new bank:
  - remove unnecessary repeats
  - keep IGCSE-level conceptual and numerical demand
  - prioritize mechanism-first questions over slogan-first phrasing

## Technical Words
- Replace the stale A4 fallback technical-word block in `lib/technicalWords.ts`.
- Remove thermodynamics terms that do not belong in A4, including:
  - ideal gas
  - pressure
  - volume
  - temperature
  - kinetic theory
  - internal energy
  - entropy
  - absolute temperature
- Replace them with A4-aligned fallback vocabulary:
  - vector
  - component
  - equilibrium
  - projectile
  - momentum
  - impulse
  - centripetal acceleration
  - stress
  - strain
  - Young modulus

## Formulas
- Expand A4 formula support in `lib/supplementalEquationFallbacks.ts` so it covers all six lessons rather than only equilibrium and momentum.
- Added / kept formula coverage:
  - `A4_L1`: `Sigma F_x = 0` and `Sigma F_y = 0`
  - `A4_L2`: `v = u + a t`, `s = u t + 1/2 a t^2`
  - `A4_L3`: `u_x = u cos theta`, `u_y = u sin theta`
  - `A4_L4`: `Sigma p_before = Sigma p_after`, `impulse = Delta p = F Delta t`
  - `A4_L5`: `a_c = v^2 / r`, `F_c = m v^2 / r`
  - `A4_L6`: `stress = F / A`, `strain = Delta L / L`, `E = stress / strain`

## Video Assets
- Current A4 video routing in `lib/lessonRunnerApi.ts` is lesson-aligned and points to the expected static lesson asset folders.
- Current A4 caption files are aligned to the mechanics / materials lesson intents for `A4_L1` through `A4_L6`.
- No code-side remap was needed for A4 videos in this pass.
- Residual risk:
  - actual `final.mp4` footage could still diverge visually from the captions, but that cannot be proven from source text alone. If visual QA finds mismatch, the A4 videos should be rerendered against the current lesson state.
