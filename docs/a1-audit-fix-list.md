# A1 Audit Fix List

## Summary

A1 is structurally much healthier than several later modules: each lesson already has lesson-specific diagrams, videos, simulation copy, and a dedicated React simulation panel. The main shortfall was assessment governance and bank rigor. A1 was still relying on older inline/fallback assessment logic instead of a dedicated module bank file, which made repetition harder to control and made short-answer quality more vulnerable to generic fallback behavior.

This audit fixes the A1 assessment layer, strengthens vocabulary and formula coverage, and documents which other sections were verified as aligned versus which sections required code changes.

## Simulations

- Verified: A1 already uses [A1SimulationPanels.tsx](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\components\A1SimulationPanels.tsx) in the runner, so the live student-facing simulation layer is lesson-specific.
- Verified: each lesson has its own simulation copy in [a1LessonContent.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\a1LessonContent.ts).
- Audit note: static HTML simulation asset folders exist for all six lessons, but the runner's real simulation experience is the React panel layer. No runner remap was required in this pass.

## Diagrams

- Verified: each lesson has lesson-specific diagrams under `public/lesson_assets/A1/A1_L*/diagrams/`.
- Verified: diagram metadata and reflection prompts in [a1LessonContent.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\a1LessonContent.ts) are topic-aligned:
  - `A1_L1`: subatomic inventory
  - `A1_L2`: quarks, hadrons, baryons, mesons
  - `A1_L3`: antiparticles, pair production, annihilation
  - `A1_L4`: interactions and exchange particles
  - `A1_L5`: conservation ledgers
  - `A1_L6`: multi-clue event analysis
- No code changes were required for diagram mapping.

## Tests

- Fix implemented: added dedicated generated A1 banks in [a1AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\a1AssessmentBanks.ts).
- Fix implemented: wired A1 into [lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\lessonRunnerApi.ts) for:
  - generated diagnostic items
  - diagnostic pool selection
  - generated concept-gate items
  - concept-gate pool selection
  - generated mastery items
  - mastery pool selection
- Outcome:
  - diagnostic bank floor: `20` per lesson
  - concept bank floor: `20` per lesson
  - mastery bank floor: `40` per lesson
- Bank design goals addressed:
  - reduced redundancy by using a dedicated per-lesson bank builder rather than mixed inline/fallback logic
  - increased IGCSE-style challenge with more explicit classification, conservation, and threshold reasoning
  - increased mathematical rigor where appropriate through charge and energy calculations
- Delivery rules preserved by the runner:
  - diagnostic pulls from the bank while still administering only `2-5` questions
  - concept gate still follows the first-correct-answer progression rule
  - mastery still administers only `5-10` questions from the expanded bank

## Technical Words

- Fix implemented: expanded the A1 curriculum supplement block in [technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\technicalWords.ts).
- Added/strengthened terms include:
  - `Photon`
  - `Lepton`
  - `Neutrino`
  - `Antineutrino`
  - `Positron`
  - `Nucleon`
  - `Antiquark`
  - `Baryon`
  - `Meson`
  - `Antiparticle`
  - `Pair production`
  - `Annihilation`
  - `Rest energy`
  - `Exchange particle`
  - `Beta decay`
  - `Baryon number`
  - `Lepton number`
  - `Conservation law`

## Formulas

- Fix implemented: strengthened A1 entries in [supplementalEquationFallbacks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\supplementalEquationFallbacks.ts).
- Added or strengthened relations include:
  - `e = 1.60 x 10^-19 C`
  - `charge(u) = +2/3 e ; charge(d) = -1/3 e`
  - `charge(anti-quark) = opposite of matching quark`
  - `E_rest = m c^2`
  - `sum(energy)_before = sum(energy)_after`
  - `sum(momentum)_before = sum(momentum)_after`
- This keeps A1 formula support better aligned with pair-production thresholds, quark-charge arithmetic, and full event analysis.

## Video Assets

- Verified: all six lessons already have mapped `final.mp4`, `thumbnail.png`, and `captions.vtt` assets under `public/lesson_assets/A1/A1_L*/videos/`.
- Verified: video metadata in [lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-m14clean\lib\lessonRunnerApi.ts) is lesson-specific and topic-aligned.
- No video remap was required in this pass.

## Concrete Fix List

1. Move A1 off older inline/fallback assessment behavior onto a dedicated bank module.
2. Guarantee minimum bank sizes of `20 / 20 / 40` for diagnostic, concept, and mastery respectively.
3. Increase question quality by mixing structural classification, conservation logic, threshold reasoning, and short quantitative checks.
4. Expand A1 technical-word support so lesson vocabulary reflects the actual particle-physics content taught.
5. Expand A1 formula fallbacks so quark-charge, pair-threshold, and full-ledger analysis remain mathematically legible.
6. Keep simulations, diagrams, and videos documented as verified-aligned sections rather than changing them unnecessarily.
