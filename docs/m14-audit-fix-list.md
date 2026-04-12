# M14 Audit And Fix List

Module `M14` is the late-core astronomy and cosmology module built around stars, stellar evolution, galaxies, light-years, redshift, and the Big Bang model. The audit found that the live lesson content is broadly aligned, but the module was missing the dedicated generated assessment-bank layer and was underpowered in its formula and glossary support. This fix set closes those structural gaps and records the remaining media debt.

## Simulations

- Audit result:
  - the live M14 simulation copy and panel logic in [`components/M14SimulationPanels.tsx`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/components/M14SimulationPanels.tsx) are already aligned with the lesson sequence:
    - `M14_L1` star vs planet classification
    - `M14_L2` stellar lifecycle branching
    - `M14_L3` galaxy and Milky Way scale
    - `M14_L4` light-year distance scale
    - `M14_L5` redshift evidence
    - `M14_L6` Big Bang and expansion evidence
- Remaining structural note:
  - the public `M14` asset namespace still contains mixed legacy files because older Earth-and-Solar-System assets also live under [`public/lesson_assets/M14`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/public/lesson_assets/M14)
  - the live M14 simulation mapping itself is correct, but the namespace should eventually be cleaned when cross-module asset remapping is revisited

## Diagrams

- Audit result:
  - the live M14 diagram metadata in [`lib/m14LessonContent.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/m14LessonContent.ts) is topic-aligned
  - each lesson now points to the correct astronomy/cosmology visual, not a recycled off-topic board
- Remaining structural note:
  - the same mixed-namespace issue exists for diagrams: correct M14 star/universe diagrams and legacy solar-system diagrams currently coexist in the same `public/lesson_assets/M14` tree
  - this is asset debt rather than a live M14 diagram-mapping failure

## Tests

- Added a dedicated generated bank file for M14: [`lib/m14AssessmentBanks.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/m14AssessmentBanks.ts)
- Routed M14 into the generated-bank flow in [`lib/lessonRunnerApi.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts) for:
  - diagnostic
  - concept gate
  - mastery
- Bank targets implemented per lesson:
  - diagnostic bank: `20` items minimum
  - concept bank: `20` items minimum
  - mastery bank: `40` items minimum
- Content-quality corrections applied in the new banks:
  - removed reliance on ad hoc authored fallback counts
  - widened coverage across all six astronomy lessons instead of repeating one narrow skill
  - raised IGCSE-style rigor with mechanism, hierarchy, and quantitative items in light-year, redshift, and Hubble-law lessons
  - reduced repetition by separating diagnostic recall from concept-gate reasoning prompts before combining them into mastery
- Delivery-rule alignment preserved:
  - diagnostics still use the existing engine's `2-5` question window
  - concept check still runs on the existing first-correct gate behavior
  - mastery still uses the existing engine's `5-10` question window

## Technical Words

- Strengthened the M14 glossary in [`lib/technicalWords.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/technicalWords.ts)
- Added missing astronomy terms needed for better lesson coverage:
  - nebula
  - main sequence
  - white dwarf
  - neutron star
  - black hole
  - Hubble's law
- Kept and retained the core module terms:
  - star
  - fusion
  - galaxy
  - Milky Way
  - light-year
  - redshift
  - Big Bang
  - supernova
  - remnant

## Formulas

- Strengthened M14 formula support in [`lib/coreFormulaFallbacks.ts`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/coreFormulaFallbacks.ts)
- Corrections applied:
  - replaced the broken-encoding light-year and redshift strings with clean ASCII-safe formula text
  - expanded stellar-evolution relations beyond one generic slogan
  - added the quantitative cosmology relation already used by the worked examples
- M14 formula layer now includes:
  - low-mass star -> red giant -> white dwarf
  - high-mass star -> red supergiant -> supernova -> neutron star or black hole
  - `distance = speed x time`
  - `1 light-year = c x 1 year approx 9.46 x 10^15 m`
  - `z = (lambda_observed - lambda_emitted) / lambda_emitted`
  - `for small redshift, v approx zc`
  - `v = H0 d`
  - the distance-redshift/recession trend and Big Bang expansion framing

## Video Assets

- Audit result:
  - there are currently no dedicated M14 lesson video folders under [`public/lesson_assets/M14`](/C:/Users/User/OneDrive/Documents/Playground/apip-web/public/lesson_assets/M14)
  - this means M14 does not yet have a clean module-specific pre-worked-example video pack comparable to the newer remediated modules
- Remaining media task:
  - M14 lesson videos still need dedicated remapping and full rerendering for:
    - `M14_L1` to `M14_L6`
  - because the assets do not exist yet, this audit records the gap but does not pretend it was fixed by text-only code edits
