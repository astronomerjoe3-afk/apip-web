# M7 Audit And Fix List

Module `M7` is the waves module covering wave travel versus medium motion, transverse and longitudinal classification, `v = f lambda`, reflection, refraction, and diffraction. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that were needed directly in code.

## Summary

- Module state after this pass:
  - `M7` now has dedicated lesson-owned generated assessment banks for all six lessons.
  - The lesson runner still follows the standard delivery rules:
    - diagnostic: `2-5` questions
    - concept check: first-correct gate
    - mastery: `5-10` questions
  - Every M7 lesson now meets the requested minimum bank size:
    - diagnostic: `20`
    - concept: `20`
    - mastery: `40`
- Main weaknesses found before fixes:
  - `M7` had no dedicated `m7AssessmentBanks.ts`, so its tests were still dependent on smaller authored pools and fallback wiring.
  - The glossary and formula bridge were aligned, but still a bit thin for stronger IGCSE-style wave reasoning.
  - The lesson-specific M7 video package was already present and aligned, so it did not need restoration.

## Simulations

- Audit result:
  - `components/M7SimulationPanels.tsx` is already lesson-specific and aligned to the wave sequence:
    - `M7_L1`: pattern travel versus local oscillation
    - `M7_L2`: transverse versus longitudinal comparison
    - `M7_L3`: `v = f lambda`
    - `M7_L4`: reflection with the normal
    - `M7_L5`: refraction with fixed frequency and changed speed
    - `M7_L6`: diffraction as a wavelength-gap comparison
- Fix result:
  - no simulation remap was required in this pass

## Diagrams

- Audit result:
  - `lib/m7LessonContent.ts` already maps each lesson to a dedicated wave diagram:
    - `m7-l1-travel-pattern.svg`
    - `m7-l2-mode-match.svg`
    - `m7-l3-vflambda.svg`
    - `m7-l4-bounce-wall.svg`
    - `m7-l5-pace-zone.svg`
    - `m7-l6-gate-spread.svg`
  - The M7 worked examples in `lib/lessonRunnerApi.ts` are already lesson-aligned and topic-appropriate.
- Fix result:
  - no diagram remap was required in this pass

## Tests

- Audit result before fixes:
  - `M7` had no dedicated `lib/m7AssessmentBanks.ts`
  - that left the module weaker on:
    - bank depth
    - repetition resistance
    - lesson-by-lesson differentiation
    - IGCSE-style reasoning across geometry, proportionality, and wave-model explanations
- Fixes applied:
  - added `lib/m7AssessmentBanks.ts`
  - wired `lib/lessonRunnerApi.ts` so M7 diagnostics, concept gates, and mastery checks all use the dedicated generated banks
  - built lesson-owned banks for:
    - `M7_L1`: pattern travel versus medium motion
    - `M7_L2`: transverse and longitudinal classification
    - `M7_L3`: `v = f lambda` calculations and comparison logic
    - `M7_L4`: reflection geometry with the normal
    - `M7_L5`: refraction as a speed-change story with fixed frequency
    - `M7_L6`: diffraction as a wavelength-gap comparison
  - the new banks emphasize:
    - misconception repair
    - numerical fluency with unit control
    - geometry and normal-line discipline
    - frequency-versus-speed logic
    - relative-comparison reasoning rather than label-only answers

## Technical Words

- Audit result:
  - the M7 glossary was aligned, but too thin for stronger wave-geometry and pattern-language questions
- Fixes applied in `lib/technicalWords.ts`:
  - retained the existing M7 vocabulary
  - added:
    - `Amplitude`
    - `Crest`
    - `Trough`
    - `Compression`
    - `Rarefaction`
    - `Normal`

## Formulas

- Audit result:
  - the existing relation bridge was on-topic, but still too thin in four places:
    - amplitude versus wave-speed misconceptions
    - rearranged wavelength form of `v = f lambda`
    - head-on reflection
    - explicit refraction and diffraction comparison rules
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - added:
    - `larger amplitude does not by itself imply larger wave speed`
    - `lambda = v / f`
    - `head-on incidence -> reflected path retraces the same line`
    - `slower medium -> bends toward the normal`
    - `faster medium -> bends away from the normal`
    - `all waves can diffract`

## Video Assets

- Audit result:
  - `public/lesson_assets/M7` is already present in this repo snapshot
  - lesson-specific assets exist for:
    - `M7_L1`
    - `M7_L2`
    - `M7_L3`
    - `M7_L4`
    - `M7_L5`
    - `M7_L6`
  - the runner is already wired to lesson-specific M7 videos
- Fix result:
  - no video remap or restoration was required in this pass

## Concrete Fix List

- Simulations:
  - confirmed aligned, no remap needed this pass
- Diagrams:
  - confirmed aligned, no remap needed this pass
- Tests:
  - done: add dedicated M7 assessment banks
  - done: bring every lesson to `20 / 20 / 40`
  - done: strengthen wave reasoning, geometry, and mathematical rigor
- Technical words:
  - done: expand wave vocabulary support for stronger classification and geometry questions
- Formulas:
  - done: strengthen the relation bridge for wave speed, reflection, refraction, and diffraction
- Video assets:
  - confirmed present and aligned, no asset restoration needed this pass
