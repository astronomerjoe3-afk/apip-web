# M3 Audit And Fix List

Module `M3` is the energy module covering energy stores and transfers, gravitational potential energy, kinetic energy, work done, power, efficiency, and multi-stage energy chains. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be completed directly in code.

## Summary

- Module state after this pass:
  - M3 now has a dedicated lesson-owned assessment bank for every lesson instead of relying on the small generated pools embedded in the lesson content file.
  - The assessment banks satisfy the requested minimum sizes for every lesson.
  - The runner still delivers tests using the standard lesson rules:
    - diagnostic: `2-5` questions
    - concept check: first correct answer gate
    - mastery: `5-10` questions
- Main weakness found:
  - the core simulation and diagram layer was already largely aligned, but the test bank was far too small and not rigorous enough for module-level mastery use
  - formula fallback text also had broken symbols in the M3 support layer

## Simulations

- Audit result:
  - `components/M3SimulationPanels.tsx` is already aligned lesson-by-lesson with the energy sequence:
    - `M3_L1`: energy stores, useful gain, and leak-trail bookkeeping
    - `M3_L2`: gravitational potential energy and the `mgh` story
    - `M3_L3`: kinetic energy and the speed-squared effect
    - `M3_L4`: work done as a force-through-distance transfer
    - `M3_L5`: power and efficiency comparison
    - `M3_L6`: multi-stage energy-chain mission planning
- Fix result:
  - no simulation remap was required in this pass
  - the main module gap was assessment-bank depth rather than simulation-topic mismatch

## Diagrams

- Audit result:
  - `lib/m3LessonContent.ts` is already using lesson-appropriate energy diagrams and scaffold framing.
  - The worked-example and scaffold language stays inside the M3 energy topic rather than drifting into unrelated mechanics or electricity content.
- Fix result:
  - no diagram remap was required in this pass
  - M3 diagram support is currently aligned with the lesson sequence

## Tests

- Audit result before fixes:
  - the old generated pools inside `lib/m3LessonContent.ts` were far too small for module-level delivery:
    - every lesson was only `8` diagnostic, `6` concept, and `10` mastery items
  - that failed the requested floor badly and made repetition more likely
  - the old pool shape was also too light on calculation and structured comparison for an IGCSE-level module
- Fixes applied:
  - added a dedicated generated bank file at `lib/m3AssessmentBanks.ts`
  - moved M3 test generation in `lib/lessonRunnerApi.ts` to that new bank file
  - built lesson-owned diagnostic and concept banks for:
    - `M3_L1` energy ledger and leak-trail accounting
    - `M3_L2` `mgh`, field strength, and reference-level reasoning
    - `M3_L3` `1/2 mv^2`, speed-squared comparison, and reverse-solving for speed
    - `M3_L4` work done as energy transfer and force-through-distance reasoning
    - `M3_L5` power versus efficiency, including reverse efficiency/input calculations
    - `M3_L6` multi-stage energy chains, stage-link logic, and threshold reasoning
  - mastery banks are now built from the lesson-owned diagnostic plus concept pools, giving a broader and less repetitive draw space while preserving topic alignment
- Verified bank sizes after the fix:
  - `M3_L1`: diagnostic `20`, concept `20`, mastery `40`
  - `M3_L2`: diagnostic `20`, concept `20`, mastery `40`
  - `M3_L3`: diagnostic `20`, concept `20`, mastery `40`
  - `M3_L4`: diagnostic `20`, concept `20`, mastery `40`
  - `M3_L5`: diagnostic `20`, concept `20`, mastery `40`
  - `M3_L6`: diagnostic `20`, concept `20`, mastery `40`
- Rigor result:
  - M3 now mixes definition, mechanism, equation choice, reverse calculation, threshold judgment, and multi-stage reasoning more appropriately for module-level testing

## Technical Words

- Audit result:
  - the M3 glossary block was aligned, but still a little thin for the stronger lesson banks
- Fixes applied in `lib/technicalWords.ts`:
  - added:
    - `Energy store`
    - `Gravitational field strength`
    - `Useful output`
    - `Wasted energy`
  - retained:
    - `Kinetic energy`
    - `Gravitational potential energy`
    - `Work done`
    - `Power`
    - `Efficiency`
    - `Energy transfer`
    - `Conserved`
- Result:
  - the glossary now supports the stronger M3 lesson language more directly instead of leaving some key phrases implicit

## Formulas

- Audit result:
  - M3 formula support was conceptually aligned but had broken symbol rendering in the fallback layer
  - examples included corrupted text for:
    - `delta E`
    - multiplication sign in `work done = force x distance`
    - multiplication sign in the percentage efficiency relation
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - added explicit M3 override entries using clean ASCII-safe forms:
    - `delta E = energy transferred`
    - `work done = force x distance`
    - `efficiency = (useful output / total input) x 100%`
- Result:
  - M3 fallback formulas now render cleanly and stay consistent with the module's current lesson language

## Video Assets

- Audit result:
  - M3 already has dedicated lesson video assets for every lesson:
    - `public/lesson_assets/M3/M3_L1/videos`
    - `public/lesson_assets/M3/M3_L2/videos`
    - `public/lesson_assets/M3/M3_L3/videos`
    - `public/lesson_assets/M3/M3_L4/videos`
    - `public/lesson_assets/M3/M3_L5/videos`
    - `public/lesson_assets/M3/M3_L6/videos`
  - each lesson currently includes:
    - `captions.vtt`
    - `final.mp4`
    - `thumbnail.png`
- Result:
  - no video remap was required in this pass
  - unlike some other modules, M3 already has a complete lesson-video asset layer present

## Concrete Fix List

- Simulations:
  - confirmed aligned, no simulation remap required this pass
- Diagrams:
  - confirmed aligned, no diagram remap required this pass
- Tests:
  - done: replace undersized inline generated banks with dedicated `M3` assessment banks
  - done: bring all lessons to `20 / 20 / 40`
  - done: strengthen numeric, reverse-calculation, and reasoning coverage
- Technical words:
  - done: expand M3 glossary support for stronger energy-language prompts
- Formulas:
  - done: override corrupted M3 fallback strings with clean formula text
- Video assets:
  - confirmed present and lesson-specific; no remap required this pass
