# A5 Audit Fix List

## Simulations
- Keep `components/A5SimulationPanels.tsx` as the canonical A5 explorer set. Its six lesson panels are already aligned to oscillation basics, SHM condition, SHM graphs, SHM energy, resonance, and damping.
- Keep the lesson-aligned public A5 simulations:
  - `A5_L1/simulations/a5_l1_oscillation_basics_lab`
  - `A5_L2/simulations/a5_l2_simple_harmonic_motion_lab`
  - `A5_L3/simulations/a5_l3_shm_graphs_equations_lab`
  - `A5_L4/simulations/a5_l4_energy_in_shm_lab`
  - `A5_L5/simulations/a5_l5_forced_resonance_lab`
  - `A5_L6/simulations/a5_l6_damping_applications_lab`
- No A5 simulation code remap was required in this pass.

## Diagrams
- Keep the lesson-aligned A5 diagram files:
  - `a5_l1_oscillation_basics.svg`
  - `a5_l2_simple_harmonic_motion.svg`
  - `a5_l3_shm_graphs_equations.svg`
  - `a5_l4_energy_in_shm.svg`
  - `a5_l5_forced_resonance.svg`
  - `a5_l6_damping_applications.svg`
- Remove stale cross-topic diagram leftovers that did not belong in oscillations:
  - `a5-l1-release-gate.svg`
  - `a5-l2-packet-kick.svg`
  - `a5-l3-hit-pattern.svg`
  - `a5-l4-core-bundle.svg`
  - `a5-l5-light-clock.svg`
  - `a5-l6-frame-slip.svg`

## Tests
- Add a dedicated generated A5 assessment bank in `lib/a5AssessmentBanks.ts`.
- Route A5 through generated diagnostic, concept-gate, and mastery pools in `lib/lessonRunnerApi.ts`.
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
  - prioritize mechanism-first oscillation reasoning over slogan-first phrasing

## Technical Words
- Remove the stale duplicate A5 fallback technical-word block in `lib/technicalWords.ts` that had been overriding the oscillations glossary with unrelated modern-physics terms.
- Keep A5 fallback vocabulary aligned to oscillations, including:
  - oscillation
  - equilibrium position
  - restoring force
  - amplitude
  - simple harmonic motion
  - phase
  - period
  - frequency
  - natural frequency
  - resonance
  - damping

## Formulas
- Expand A5 formula support in `lib/supplementalEquationFallbacks.ts` so all six lessons are covered rather than only lessons 1, 4, 5, and 6.
- Added / kept formula coverage:
  - `A5_L1`: `F = -k x`
  - `A5_L2`: `a = -omega^2 x`
  - `A5_L3`: `f = 1 / T`, `v_max = omega A`
  - `A5_L4`: `E_total = E_k + E_p`, `E_p = 1/2 k x^2`, `E_total = 1/2 k A^2`
  - `A5_L5`: `f_drive ~= f_natural at resonance`
  - `A5_L6`: `F_d = -b v`, `A = A0 e^(-b t / 2m)`

## Video Assets
- Current A5 video routing in `lib/lessonRunnerApi.ts` is lesson-aligned and points to the expected static lesson asset folders.
- Sampled A5 caption and manifest assets are aligned to the current oscillations lesson intents for `A5_L1` through `A5_L6`.
- No code-side video remap was needed for A5 in this pass.
- Residual risk:
  - actual `final.mp4` footage could still diverge visually from the captions or current diagrams, but that cannot be proven from source text alone. If visual QA finds mismatch, the A5 videos should be rerendered against the current lesson state.
