# M13 Audit And Fix List

Module `M13` is defined in the curriculum as `Earth and the Solar System`, covering orbital motion, Earth's rotation, axial tilt, Moon phases, eclipses, apparent sky motion, and Solar System structure. The audit found that the local M13 module layer was still carrying legacy atomic and radioactivity content. This fix set brings the module back into line with the stated topic.

- Dependency safety fix: M11 is no longer borrowing M13's live scaffold and simulation layer, so restoring M13 to Earth-and-Solar-System content does not silently regress `Atomic Structure and Radioactivity`.

## Simulations

- Replaced the stale `M13SimulationPanels` atomic/radioactivity simulator with M13-specific Earth-and-Solar-System simulation panels.
- M13 now embeds the correct interactive lesson assets:
  - `M13_L1` -> Earth-Moon-Sun system explorer
  - `M13_L2` -> orbit route explorer
  - `M13_L3` -> day-night rotation explorer
  - `M13_L4` -> seasons and tilt explorer
  - `M13_L5` -> Moon phases and eclipses explorer
  - `M13_L6` -> Solar System scale explorer
- Added lesson-specific simulation checks so the simulation stage reinforces the correct concept for each lesson.

## Diagrams

- Replaced the stale M13 authored diagram mapping with the correct Earth-and-Solar-System visual set.
- M13 diagram cards and reflection visuals now use:
  - linked Earth-Moon-Sun system
  - orbit mechanics
  - day-night rotation
  - seasons and axial tilt
  - Moon phases and eclipses
  - Solar System scale and orbital-period structure

## Tests

- Added a dedicated generated bank file for M13: [`lib/m13AssessmentBanks.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/m13AssessmentBanks.ts)
- Routed M13 through the same generated-bank flow used by corrected late-core modules in [`lib/lessonRunnerApi.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts)
- Bank targets implemented per lesson:
  - diagnostic bank: 20 items minimum
  - concept bank: 20 items minimum
  - mastery bank: 40 items minimum
- Verification result:
  - `M13_L1` to `M13_L6` now each resolve to `20` diagnostic items, `20` concept items, and `40` mastery items
- Delivery-rule alignment:
  - diagnostics still run under the existing engine's `2-5` question rule
  - concept check still uses the existing first-correct gate behavior
  - mastery still runs under the existing engine's `5-10` question rule
- Content audit goals applied in the new banks:
  - removed topic drift into atomic/radioactivity content
  - widened lesson coverage across each M13 topic instead of repeated single-skill questioning
  - increased IGCSE-style conceptual rigor by preferring mechanism, geometry, timescale, and model-reading questions over label-only recall

## Technical Words

- Replaced the M13 glossary from atomic/radioactivity terms to Earth-and-Solar-System terms:
  - orbit
  - rotation
  - axis
  - axial tilt
  - orbital period
  - hemisphere
  - phase
  - eclipse
  - planet
  - moon
  - Solar System
  - astronomical unit

## Formulas And Formal Relations

- Overrode the stale M13 atomic/radioactivity formal relations with the correct M13 lesson relations:
  - Earth mainly orbits the Sun; Moon mainly orbits Earth
  - orbit = sideways motion + inward gravitational pull
  - `1 day = 1 rotation of Earth`
  - seasons are driven by axial tilt and changing sunlight angle
  - Moon phase = visible fraction of the Moon's sunlit half
  - eclipse = special Sun-Earth-Moon shadow alignment
  - farther orbital route -> longer year
  - Solar System sketches are not to scale

## Worked Examples

- Replaced all stale M13 worked examples in the lesson runner.
- M13 worked examples now match the live lesson topics:
  - linked Earth-Moon-Sun system
  - orbit mechanics
  - day and night
  - seasons
  - Moon phases and eclipses
  - Solar System scale and structure

## Video Assets

- Audit result: the legacy `public/lesson_assets/M13` namespace still contains atomic/radioactivity-era animation and simulation assets.
- Code fix applied:
  - the live M13 lesson layer no longer points at those stale authored M13 diagrams or simulation panels
  - the live lesson scaffolds now remap to the correct Earth-and-Solar-System visuals and interactives
- Remaining asset task outside this code change:
  - M13 pre-worked-example videos still need dedicated remapping and full rerendering into a true Earth-and-Solar-System M13 asset namespace
  - the current legacy M13 media folder should be treated as a historical/legacy namespace rather than as valid live M13 content
