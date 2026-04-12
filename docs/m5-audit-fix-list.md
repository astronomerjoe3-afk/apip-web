# M5 Audit And Fix List

Module `M5` is the particle-model module covering simple particle rules, solid-liquid comparison, gases and Brownian motion, temperature as an average-particle idea, internal energy as a whole-system total, and state-change energy routing. This audit checked the module holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be completed directly in code and assets.

## Summary

- Module state after this pass:
  - `M5` now has dedicated lesson-owned generated assessment banks for all six lessons.
  - The assessment banks satisfy the requested minimum size floor for every lesson.
  - The runner still delivers tests using the standard lesson rules:
    - diagnostic: `2-5` questions
    - concept check: first correct answer gate
    - mastery: `5-10` questions
- Main weaknesses found:
  - `M5` had no dedicated `m5AssessmentBanks.ts` file, so its tests were still overly dependent on small authored pools.
  - The M5 glossary and formula bridge were aligned, but a little too thin for a stronger IGCSE-grade assessment layer.
  - The M5 lesson-video folder expected by the runner was missing from this repo snapshot even though the code was already wired to it.

## Simulations

- Audit result:
  - `components/M5SimulationPanels.tsx` is already aligned lesson-by-lesson with the M5 particle-model sequence:
    - `M5_L1`: fixed particle size vs changing crowd pattern
    - `M5_L2`: close-packed solid vs close-packed-but-mobile liquid
    - `M5_L3`: gas spacing and Brownian-motion evidence
    - `M5_L4`: temperature as an average-particle idea, not a whole-sample total
    - `M5_L5`: internal energy as motion part plus arrangement part
    - `M5_L6`: state-change energy routing into motion vs link release
- Fix result:
  - no simulation remap was required in this pass

## Diagrams

- Audit result:
  - `lib/m5LessonContent.ts` already maps M5 to lesson-appropriate diagrams:
    - `m5-l1-particle-rules.svg`
    - `m5-l2-lock-slide.svg`
    - `m5-l3-brownian-pebble.svg`
    - `m5-l4-pulse-level.svg`
    - `m5-l5-plaza-store.svg`
    - `m5-l6-state-change.svg`
  - The worked-example layer in `lib/lessonRunnerApi.ts` is also topic-aligned and uses on-topic particle-model reasoning rather than unrelated filler.
- Fix result:
  - no diagram remap was required in this pass

## Tests

- Audit result before fixes:
  - `M5` had no dedicated `lib/m5AssessmentBanks.ts` file
  - the module was therefore still dependent on smaller authored lesson pools and fallback logic in `lib/lessonRunnerApi.ts`
  - that structure was weaker on:
    - bank size
    - anti-repetition resilience
    - conceptual progression across all six lessons
    - explicit IGCSE-style distinction between average, total, state, and evidence reasoning
- Fixes applied:
  - added `lib/m5AssessmentBanks.ts`
  - wired `lib/lessonRunnerApi.ts` so M5 diagnostics, concept gates, and mastery checks all use the new dedicated generated banks
  - built lesson-owned banks for:
    - `M5_L1`: fixed particle size, bulk vs particle properties, spacing-based expansion
    - `M5_L2`: solid vs liquid with close spacing and neighbor mobility
    - `M5_L3`: gases and Brownian motion as evidence for unseen collisions
    - `M5_L4`: temperature as average kinetic energy per particle
    - `M5_L5`: internal energy as total kinetic plus potential energy
    - `M5_L6`: state-change energy routing and the distinction between temperature rise and internal-energy rise
  - the new banks emphasize:
    - misconception repair
    - comparative reasoning
    - multi-clue state classification
    - average-vs-total separation
    - whole-system internal-energy logic
    - state-change energy destination reasoning
- Rigor result:
  - M5 now has a much stronger blend of definition, comparison, evidence, explanation, and simple quantitative reasoning, which is a better match for standard IGCSE-style particle-model questions than the earlier thin authored pool structure

## Technical Words

- Audit result:
  - the M5 glossary was aligned but too thin for the stronger bank
- Fixes applied in `lib/technicalWords.ts`:
  - retained:
    - `Particle`
    - `Solid`
    - `Liquid`
    - `Gas`
    - `Brownian motion`
    - `Temperature`
    - `Internal energy`
    - `Potential energy`
  - added:
    - `Average kinetic energy`
    - `Particle attraction`
    - `State change`
    - `Melting`
    - `Boiling`

## Formulas

- Audit result:
  - the main M5 relation bridge was already aligned, but the module needed more explicit support in three places:
    - Brownian-motion intensity as evidence for surrounding-particle motion
    - equal temperature as equal average kinetic energy per particle
    - state-change questions where internal energy rises without a large temperature rise
- Fixes applied in `lib/coreFormulaFallbacks.ts`:
  - retained:
    - `state description = particle spacing + particle motion + particle attractions`
    - `heating changes motion and spacing, not particle size`
    - `solid = close particles + fixed positions + vibration`
    - `liquid = close particles + changing neighbors + flow`
    - `gas = wide spacing + random motion + collisions`
    - `Brownian motion = visible evidence of invisible particle collisions`
    - `temperature is proportional to average kinetic energy per particle`
    - `internal energy = total kinetic energy + total potential energy of particles`
    - `increase in internal energy = energy transferred by heating`
    - `during a state change, added energy can raise potential energy more than temperature`
  - added:
    - `stronger Brownian motion -> more vigorous surrounding particle motion`
    - `same temperature -> same average kinetic energy per particle`
    - `same temperature does not imply same internal energy`
    - `during melting or boiling, temperature can stay nearly constant while internal energy rises`

## Video Assets

- Audit result:
  - `lib/lessonRunnerApi.ts` was already wired to lesson-specific M5 video assets, but `public/lesson_assets/M5` was missing from this repo snapshot
- Fix applied:
  - restored `public/lesson_assets/M5` with lesson-specific:
    - `captions.vtt`
    - `final.mp4`
    - `thumbnail.png`
  - for:
    - `M5_L1`
    - `M5_L2`
    - `M5_L3`
    - `M5_L4`
    - `M5_L5`
    - `M5_L6`

## Concrete Fix List

- Simulations:
  - confirmed aligned, no simulation remap required this pass
- Diagrams:
  - confirmed aligned, no diagram remap required this pass
- Tests:
  - done: add dedicated M5 assessment banks
  - done: bring every lesson to `20 / 20 / 40`
  - done: strengthen conceptual, comparative, and state-change rigor
- Technical words:
  - done: expand glossary support for stronger M5 reasoning
- Formulas:
  - done: strengthen the M5 relation bridge for average-vs-total and state-change reasoning
- Video assets:
  - done: restore the missing lesson-owned M5 video package expected by the runner
