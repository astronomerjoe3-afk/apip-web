# M14 Audit And Fix List

Module `M14` is the astronomy and cosmology module covering stars, stellar evolution, galaxies, cosmic distance scale, redshift, and the Big Bang model. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be made directly in code.

## Summary

- Module state after this pass:
  - M14 now has topic-aligned simulations, diagrams, generated tests, glossary support, and formula support.
  - The assessment banks satisfy the required size floor for every lesson.
  - The runner still delivers tests using the standard lesson rules:
    - diagnostic: `2-5` questions
    - concept check: first correct answer gate
    - mastery: `5-10` questions
- Remaining gap:
  - M14 still has no dedicated lesson video assets under `public/lesson_assets/M14/M14_L1` to `M14_L6` video folders.
  - The current lesson videos therefore still need to be remapped and rerendered completely to match the present lesson state.

## Simulations

- Audit result:
  - `components/M14SimulationPanels.tsx` is aligned lesson-by-lesson with the astronomy sequence:
    - `M14_L1`: star vs planet classification by light source
    - `M14_L2`: stellar lifecycle branching by mass
    - `M14_L3`: Milky Way and galaxy hierarchy
    - `M14_L4`: light-year distance scale
    - `M14_L5`: redshift and wavelength stretch
    - `M14_L6`: Big Bang model with expansion evidence
- Fixes applied:
  - strengthened `M14_L4` with explicit quantitative support:
    - `1 light-year = 9.46 x 10^15 m`
    - `distance = speed x time`
  - strengthened `M14_L5` with explicit redshift readout:
    - added calculated `z`
  - strengthened `M14_L6` with explicit Hubble-law support:
    - example distance in `Mpc`
    - predicted recession speed in `km/s`
    - visual `v = H0 d` cue
- Result:
  - the simulations are now less slogan-based and more clearly tied to the quantitative school physics model.

## Diagrams

- Audit result:
  - `lib/m14LessonContent.ts` maps each lesson to the correct astronomy or cosmology diagram.
  - The live M14 visual mapping is coherent and not reusing off-topic content from another module.
- Current live diagram mapping:
  - `M14_L1`: `m14-l1-star-vs-planet.svg`
  - `M14_L2`: `m14-l2-stellar-lifecycle.svg`
  - `M14_L3`: `m14-l3-galaxy-milky-way.svg`
  - `M14_L4`: `m14-l4-light-year-scale.svg`
  - `M14_L5`: `m14-l5-redshift-expansion.svg`
  - `M14_L6`: `m14-l6-big-bang-timeline.svg`
- Additional support fix:
  - updated scaffold and simulation copy so the diagrams are interpreted with the right physics emphasis:
    - light-year via `distance = speed x time`
    - redshift via wavelength comparison
    - Big Bang via redshift plus Hubble-law evidence

## Tests

- Audit result:
  - M14 already uses dedicated generated banks through `lib/m14AssessmentBanks.ts` and `lib/lessonRunnerApi.ts`.
  - The runner logic in `lib/lessonRunnerApi.ts` still enforces the expected delivery pattern.
- Verified bank sizes after this fix pass:
  - `M14_L1`: diagnostic `20`, concept `20`, mastery `42`
  - `M14_L2`: diagnostic `20`, concept `20`, mastery `42`
  - `M14_L3`: diagnostic `20`, concept `20`, mastery `44`
  - `M14_L4`: diagnostic `20`, concept `20`, mastery `44`
  - `M14_L5`: diagnostic `20`, concept `20`, mastery `44`
  - `M14_L6`: diagnostic `20`, concept `20`, mastery `44`
- Test-quality issues found:
  - some question stems were becoming too formulaic across lessons
  - mastery extension layers for the later lessons were underusing calculation and interpretation
  - some lesson prompts were strong on topic coverage but not yet strong enough on IGCSE-style rigor
- Fixes applied:
  - reduced unnecessary stem repetition by replacing several generic prompts such as repeated `"Which summary is strongest?"` with lesson-specific evaluative prompts
  - strengthened mastery extension items for:
    - `M14_L3`: galaxy-scale classification
    - `M14_L4`: metre-to-light-year conversion
    - `M14_L5`: observed wavelength from redshift
    - `M14_L6`: inverse Hubble-law calculation
  - widened the module's quantitative support so the tests better match the formula layer
- Result:
  - M14 tests now better balance definition, mechanism, hierarchy, and quantitative reasoning instead of leaning too heavily on summary-language questions.

## Technical Words

- Audit result:
  - M14 had a solid core glossary but was still missing some stage and cosmology terms needed by the stronger banks.
- Fixes applied in `lib/technicalWords.ts`:
  - added:
    - `Protostar`
    - `Red giant`
    - `Red supergiant`
    - `Recession speed`
    - `Hubble constant`
  - retained:
    - `Star`
    - `Fusion`
    - `Nebula`
    - `Main sequence`
    - `Galaxy`
    - `Milky Way`
    - `Light-year`
    - `Redshift`
    - `White dwarf`
    - `Neutron star`
    - `Black hole`
    - `Big Bang`
    - `Hubble's law`
    - `Supernova`
    - `Remnant`
- Result:
  - the glossary now better supports the stellar-lifecycle branch, redshift calculations, and Hubble-law reasoning used in the tests.

## Formulas

- Audit result:
  - M14 already had the main astronomy relations, but the stronger question bank needed a few more explicit bridges between formula form and test use.
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - retained and verified:
    - `distance = speed x time`
    - `1 light-year = c x 1 year approx 9.46 x 10^15 m`
    - `z = (lambda_observed - lambda_emitted) / lambda_emitted`
    - `for small redshift, v approx zc`
    - `v = H0 d`
  - added:
    - `lambda_observed = (1 + z) x lambda_emitted`
    - `d = v / H0`
  - retained stellar-evolution branch relations:
    - low-mass star route
    - high-mass star route
- Result:
  - the formula layer now matches the revised mastery items and gives M14 cleaner quantitative support.

## Video Assets

- Audit result:
  - `public/lesson_assets/M14` currently contains only diagrams and simulations.
  - there are no dedicated lesson video folders or current-render video assets for `M14_L1` to `M14_L6`.
- Root media issue:
  - the lesson state, assessment state, and scaffold state are now more advanced than the media layer
  - the current lesson videos therefore do not match the present M14 lesson state
- Concrete next media task:
  - remap and rerender all M14 lesson videos:
    - `M14_L1` star vs planet classification
    - `M14_L2` stellar lifecycle and mass-dependent endings
    - `M14_L3` galaxy hierarchy and Milky Way scale
    - `M14_L4` light-year distance scale and conversion meaning
    - `M14_L5` redshift from wavelength comparison
    - `M14_L6` Big Bang model with redshift and Hubble-law evidence

## Concrete Fix List

- Simulations:
  - done: add quantitative readouts to `M14_L4`, `M14_L5`, and `M14_L6`
  - next: if a future pass adds richer explorers, preserve the same lesson-specific physics framing
- Diagrams:
  - done: keep M14 visual mapping lesson-specific and aligned with astronomy/cosmology
  - next: only revisit if new rendered diagram assets replace current SVGs
- Tests:
  - done: verify all banks meet `20 / 20 / 40+`
  - done: reduce unnecessary repeated stems
  - done: add more calculation and interpretation items where the module needed more rigor
- Technical words:
  - done: add missing lifecycle and cosmology vocabulary
- Formulas:
  - done: add observed-wavelength redshift form and inverse Hubble-law form
- Video assets:
  - still outstanding: remap and rerender the full M14 lesson-video set so media matches the current lesson state
