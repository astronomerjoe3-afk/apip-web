# M4 Audit And Fix List

Module `M4` is the pressure module covering pressure in solids, pressure-limit design, hydrostatic pressure, equal pressure at the same level in a resting liquid, force on a surface due to pressure, and total pressure in an open liquid. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be completed directly in code.

## Summary

- Module state after this pass:
  - M4 now has dedicated lesson-owned generated assessment banks for all six lessons.
  - The assessment banks satisfy the requested minimum size floor for every lesson.
  - The runner still delivers tests using the standard lesson rules:
    - diagnostic: `2-5` questions
    - concept check: first correct answer gate
    - mastery: `5-10` questions
- Main weakness found:
  - M4 was still relying on small authored lesson pools rather than a dedicated module-owned bank
  - that made the test layer vulnerable to repetition and left the module below the required bank depth for a full audit standard

## Simulations

- Audit result:
  - `components/M4SimulationPanels.tsx` is already aligned lesson-by-lesson with the pressure sequence:
    - `M4_L1`: pressure in solids as force spread over area
    - `M4_L2`: backward design from a safe pressure limit
    - `M4_L3`: hydrostatic pressure with depth, density, and gravitational field strength
    - `M4_L4`: equal pressure at the same depth in the same liquid
    - `M4_L5`: pressure at a point versus force on a chosen patch
    - `M4_L6`: total pressure in an open liquid as atmospheric plus liquid contribution
- Fix result:
  - no simulation remap was required in this pass
  - the main M4 gap was the assessment-bank layer rather than simulation-topic mismatch

## Diagrams

- Audit result:
  - `lib/m4LessonContent.ts` already maps M4 to lesson-appropriate pressure diagrams:
    - `m4-l1-patch-load.svg`
    - `m4-l2-footprint-rescue.svg`
    - `m4-l3-liquid-stack.svg`
    - `m4-l4-same-level.svg`
    - `m4-l5-surface-normal.svg`
    - `m4-l6-sky-blanket.svg`
  - the live M4 worked-example layer in `lib/lessonRunnerApi.ts` is also topic-aligned and uses standard pressure physics rather than off-topic filler
- Fix result:
  - no diagram remap was required in this pass

## Tests

- Audit result before fixes:
  - M4 had no dedicated `m4AssessmentBanks.ts` file
  - the module was therefore still dependent on small authored lesson pools and fallback logic in `lib/lessonRunnerApi.ts`
  - that structure was weaker on:
    - bank size
    - anti-repetition resilience
    - systematic numeric rigor across all six lessons
- Fixes applied:
  - added a dedicated bank file at `lib/m4AssessmentBanks.ts`
  - wired the runner in `lib/lessonRunnerApi.ts` so M4 diagnostics, concept gates, and mastery checks all use the new dedicated generated banks
  - built lesson-owned banks for:
    - `M4_L1`: pressure in solids and area-ratio reasoning
    - `M4_L2`: minimum safe area and maximum safe force design
    - `M4_L3`: hydrostatic pressure with `rho g h` and pressure differences
    - `M4_L4`: same-level rule with explicit conditions
    - `M4_L5`: force on a patch with `F = pA` and surface-normal reasoning
    - `M4_L6`: open-liquid total pressure with atmospheric contribution
  - the new banks emphasize:
    - pressure calculation
    - inverse calculation
    - threshold design
    - conditional reasoning
    - shape-misconception repair
    - distinction between scalar pressure and force vector
- Verified bank sizes after this fix:
  - `M4_L1`: diagnostic `20`, concept `20`, mastery `40`
  - `M4_L2`: diagnostic `20`, concept `20`, mastery `40`
  - `M4_L3`: diagnostic `20`, concept `20`, mastery `40`
  - `M4_L4`: diagnostic `20`, concept `20`, mastery `40`
  - `M4_L5`: diagnostic `20`, concept `20`, mastery `40`
  - `M4_L6`: diagnostic `20`, concept `20`, mastery `40`
- Rigor result:
  - M4 now has a much better mix of definition, condition checking, reverse calculation, design judgment, and explanatory pressure reasoning, which is a better match for standard IGCSE-style difficulty than a shallow slogan-heavy pool

## Technical Words

- Audit result:
  - the M4 glossary was aligned but too thin for the stronger pressure banks
- Fixes applied in `lib/technicalWords.ts`:
  - added:
    - `Hydrostatic pressure`
    - `Gravitational field strength`
    - `Surface normal`
    - `Total pressure`
  - retained:
    - `Pressure`
    - `Area`
    - `Density`
    - `Depth`
    - `Atmospheric pressure`
    - `Pascal`
- Result:
  - the glossary now better supports the stronger M4 reasoning layer instead of forcing key terms to remain implicit

## Formulas

- Audit result:
  - the main M4 formula bridge was already broadly aligned, but the module needed a little more explicit support for pressure-difference and surface-force reasoning
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - retained:
    - `p = F / A`
    - `A = F / p`
    - `F = pA`
    - `p = rho g h`
    - `p1 = p2`
    - `p_total = p_atm + rho g h`
  - added:
    - `delta p = rho g delta h`
    - `force due to pressure acts normal to the surface`
- Result:
  - the formula support now better matches the upgraded assessment bank, especially in `M4_L3` and `M4_L5`

## Video Assets

- Audit result:
  - M4 already has dedicated lesson video assets for every lesson:
    - `public/lesson_assets/M4/M4_L1/videos`
    - `public/lesson_assets/M4/M4_L2/videos`
    - `public/lesson_assets/M4/M4_L3/videos`
    - `public/lesson_assets/M4/M4_L4/videos`
    - `public/lesson_assets/M4/M4_L5/videos`
    - `public/lesson_assets/M4/M4_L6/videos`
  - each lesson includes:
    - `captions.vtt`
    - `final.mp4`
    - `thumbnail.png`
- Result:
  - no video remap was required in this pass

## Concrete Fix List

- Simulations:
  - confirmed aligned, no simulation remap required this pass
- Diagrams:
  - confirmed aligned, no diagram remap required this pass
- Tests:
  - done: add dedicated M4 assessment banks
  - done: bring every lesson to `20 / 20 / 40`
  - done: strengthen numeric, design-threshold, and explanatory rigor
- Technical words:
  - done: expand glossary support for stronger M4 pressure reasoning
- Formulas:
  - done: strengthen the M4 formula bridge with pressure-difference and surface-normal support
- Video assets:
  - confirmed present and lesson-specific; no remap required this pass
