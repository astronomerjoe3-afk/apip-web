# M8 Audit And Fix List

Module `M8` is the optics module covering plane-mirror reflection, refraction, converging lenses, diverging lenses, total internal reflection, and disciplined ray-diagram reading. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that were needed directly in code.

## Summary

- Module state after this pass:
  - `M8` now has dedicated lesson-owned generated assessment banks for all six lessons.
  - The lesson runner still follows the standard delivery rules:
    - diagnostic: `2-5` questions
    - concept check: first-correct gate
    - mastery: `5-10` questions
  - Every M8 lesson now meets the requested minimum bank size:
    - diagnostic: `20`
    - concept: `20`
    - mastery: `40`
- Main weaknesses found before fixes:
  - `M8` had no dedicated `lib/m8AssessmentBanks.ts`, so its tests were not yet module-owned and were falling back to thinner authored pools.
  - The lesson content, simulations, diagrams, and video assets were already substantially aligned, but the terminology bridge and formula bridge were still lighter than the assessment rigor now expected.

## Simulations

- Audit result:
  - `components/M8SimulationPanels.tsx` is already lesson-specific and aligned across all six optics lessons:
    - `M8_L1`: mirror geometry and ghost-image distance
    - `M8_L2`: fast-versus-slow boundary bending
    - `M8_L3`: converging-lens real-image formation
    - `M8_L4`: diverging-lens virtual-image construction
    - `M8_L5`: critical-angle and lock-bounce threshold cases
    - `M8_L6`: line-role comparison across real and ghost image sketches
- Fix result:
  - no simulation remap was required in this pass

## Diagrams

- Audit result:
  - `lib/m8LessonContent.ts` already maps the lessons to optics-specific diagrams and scaffold visuals.
  - `public/lesson_assets/M8` already contains lesson-specific diagrams, animations, simulations, and videos for `M8_L1` through `M8_L6`.
  - The worked-example support inside the M8 lesson content is already topic-aligned to optics rather than generic carryover material.
- Fix result:
  - no diagram remap was required in this pass

## Tests

- Audit result before fixes:
  - `M8` had no dedicated `lib/m8AssessmentBanks.ts`
  - the runner had no M8-specific generated-bank wiring in:
    - diagnostics
    - concept gate
    - mastery
  - that left the module weaker on:
    - bank depth
    - repetition resistance
    - lesson-by-lesson differentiation
    - IGCSE-style optics rigor
- Fixes applied:
  - added `lib/m8AssessmentBanks.ts`
  - wired `lib/lessonRunnerApi.ts` so M8 diagnostics, concept gates, and mastery checks use the dedicated generated banks
  - built lesson-owned banks for:
    - `M8_L1`: normal-first mirror geometry, virtual image logic, and plane-mirror distance symmetry
    - `M8_L2`: refraction as a speed-change story, normal-based bend direction, and two-surface lens/block reasoning
    - `M8_L3`: converging-lens ray rules, `F/2F` anchor cases, real-image screening, and image-region comparisons
    - `M8_L4`: diverging-lens rules, backward-extension logic, virtual-image classification, and object-side focus reasoning
    - `M8_L5`: critical-angle threshold logic, total internal reflection conditions, and optical-fibre application
    - `M8_L6`: ray-diagram line roles, real-versus-virtual image tests, and screenability as a classification check
  - the new banks emphasize:
    - misconception repair
    - normal-line discipline
    - image classification by ray behavior
    - optical reasoning that is closer to standard IGCSE exam expectations

## Technical Words

- Audit result:
  - the M8 glossary was already on-topic but still a little thin for stronger optics questioning
- Fixes applied in `lib/technicalWords.ts`:
  - retained the existing M8 vocabulary
  - added:
    - `Angle of incidence`
    - `Refracted ray`
    - `Converging lens`
    - `Diverging lens`
    - `Ray diagram`
    - `Optical fibre`

## Formulas

- Audit result:
  - the existing M8 formula bridge was aligned, but still lighter than the lesson set now expects
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - added:
    - `surface angle + normal angle = 90 degrees`
    - `head-on incidence -> reflected ray retraces the same line`
    - `no speed change -> no refraction bend`
    - `parallel faces -> emergent ray parallel to incident ray`
    - `object at 2F -> image at 2F, same size, inverted`
    - `real image -> actual rays meet and can be screened`
    - `diverging-lens image -> virtual, upright, smaller`
    - `virtual image -> cannot be caught on a screen`
    - `angle = critical angle -> refracted ray travels along the boundary`
    - `TIR needs denser-to-less-dense direction and angle above critical`
    - `selected rays stand in for the full ray bundle`
    - `screen catches real image, not virtual image`

## Video Assets

- Audit result:
  - `public/lesson_assets/M8` is already present and complete for:
    - `M8_L1`
    - `M8_L2`
    - `M8_L3`
    - `M8_L4`
    - `M8_L5`
    - `M8_L6`
  - each lesson already has:
    - diagrams
    - animation HTML
    - simulation HTML
    - `final.mp4`
    - `captions.vtt`
    - `thumbnail.png`
- Fix result:
  - no video remap or restoration was required in this pass

## Concrete Fix List

- Simulations:
  - confirmed aligned, no remap needed this pass
- Diagrams:
  - confirmed aligned, no remap needed this pass
- Tests:
  - done: add dedicated M8 assessment banks
  - done: bring every lesson to `20 / 20 / 40`
  - done: strengthen optics geometry, image classification, and threshold reasoning
- Technical words:
  - done: expand optics vocabulary support for normal-based geometry, lens language, and fibre optics
- Formulas:
  - done: strengthen the relation bridge for mirrors, refraction, lenses, and total internal reflection
- Video assets:
  - confirmed present and aligned, no asset restoration needed this pass
