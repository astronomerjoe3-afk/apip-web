# A11 Audit And Fix List

Module `A11` is the advanced space-physics and astrophysics module covering gravitational fields and potential, satellites and orbital observation, stellar spectra and the H-R diagram, the distance ladder, stellar evolution and compact objects, and Hubble expansion with modern cosmology. This audit checked A11 holistically across simulations, diagrams, tests, technical words, formulas, and video assets, then applied the fixes that could be made directly in code.

## Summary

- Module state after this pass:
  - A11 now has dedicated generated assessment banks instead of relying on thinner generic-or-authored fallbacks.
  - A11 now has dedicated `Try it in action` simulation panels instead of the shared `A6ToA11` explainer scaffold.
  - A11 technical-word and formula fallback support now match the astrophysics sequence actually taught in the lesson set.
  - A11 diagrams were already aligned and were preserved.
- Runner rules preserved:
  - diagnostic: `2-5` questions
  - concept check: first correct answer gate
  - mastery: `5-10` questions
- Remaining media gap:
  - A11 still has no dedicated lesson video assets under `public/lesson_assets/A11/.../videos`.
  - The current lesson videos therefore still need to be remapped and rerendered completely to match the present lesson state.

## Simulations

- Audit result:
  - A11 had been routed through `components/A6ToA11SimulationPanels.tsx`, which is a shared explainer scaffold rather than a true lesson-specific manipulative layer.
  - That meant A11 `Try it in action` was not actually testing the astrophysics reasoning of each lesson.
- Fixes applied:
  - added `components/A11SimulationPanels.tsx`
  - updated `components/LessonRunner.tsx` so `A11_` lessons now use the dedicated A11 component
  - added lesson-specific boards for:
    - `A11_L1`: gravitational field and potential landscape
    - `A11_L2`: orbital radius, period, speed, and observation role
    - `A11_L3`: spectral peak, luminosity, and H-R placement
    - `A11_L4`: parallax, standard candles, and distance-ladder selection
    - `A11_L5`: stellar pathway, compact remnant, and Schwarzschild-radius comparison
    - `A11_L6`: redshift, recession speed, Hubble distance, and cosmology interpretation
- Result:
  - A11 now has real lesson-specific interaction instead of a generic placeholder explainer.

## Diagrams

- Audit result:
  - A11 already had topic-aligned diagrams for all six lessons in `public/lesson_assets/A11`.
  - The mapping in `lib/a6ToA11LessonContentData.json` is coherent and lesson-specific:
    - `A11_L1`: gravitational fields and potential
    - `A11_L2`: satellites and orbital observation
    - `A11_L3`: stellar spectra and the H-R story
    - `A11_L4`: parallax, standard candles, and the distance ladder
    - `A11_L5`: stellar evolution and compact objects
    - `A11_L6`: Hubble expansion, dark energy, and cosmology
- Fix applied:
  - no diagram remap was needed because the existing A11 visual layer is already aligned.
- Result:
  - diagrams are in line with the topic and remained stable in this pass.

## Tests

- Audit result:
  - A11 previously had no dedicated generated-bank override in `lib/lessonRunnerApi.ts`.
  - That meant A11 could fall back to thinner authored or generic pools without guaranteeing the required bank sizes, challenge level, or coverage.
- Fixes applied:
  - added `lib/a11AssessmentBanks.ts`
  - wired A11 into:
    - `generatedDiagnosticItems`
    - `diagnosticItems`
    - `generatedConceptGateItems`
    - `conceptGateBank`
    - `generatedMasteryItems`
    - `masteryItems`
- Bank-size outcome by construction:
  - every A11 lesson now has:
    - diagnostic `20`
    - concept `20`
    - mastery `40`
- Quality improvements in the new banks:
  - reduced unnecessary repetition by varying stems and reasoning jobs
  - strengthened IGCSE-style appropriateness by mixing:
    - gravitational field and potential comparison
    - orbit mechanics plus satellite-role selection
    - stellar spectrum and H-R interpretation
    - parallax and standard-candle distance logic
    - stellar-evolution pathway and compact-object thresholds
    - redshift, Hubble-law, and cosmology inference
    - short numerical calculations with realistic astrophysics units
  - kept mastery as a widened pool rather than a tiny repeated quiz

## Technical Words

- Audit result:
  - `A11` was in the strict-authored module list in `lib/technicalWords.ts`, but it did not yet have a curriculum supplement block.
  - That left fallback technical-word support too thin whenever authored lesson entries were sparse.
- Fixes applied:
  - added `CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS.A11` with vocabulary for:
    - gravitational field strength
    - gravitational potential
    - geostationary orbit
    - polar orbit
    - orbital period
    - spectrum
    - absorption line
    - H-R diagram
    - luminosity
    - standard candle
    - apparent brightness
    - parallax
    - parsec
    - red giant
    - white dwarf
    - neutron star
    - black hole
    - event horizon
    - Schwarzschild radius
    - redshift
    - Hubble's law
    - dark energy
- Result:
  - A11 technical words now reflect the actual astrophysics ladder instead of depending only on authored entries.

## Formulas

- Audit result:
  - A11 already had a useful baseline formula layer in `lib/supplementalEquationFallbacks.ts`, but the bridge set was still too thin in a few places.
- Fixes applied:
  - retained and verified:
    - `g = G M / r^2`
    - `V = -G M / r`
    - `v = sqrt(G M / r)`
    - `T^2 = 4 pi^2 r^3 / (G M)`
    - `lambda_max T = b`
    - `L = 4 pi R^2 sigma T^4`
    - `d(pc) = 1 / p(arcsec)`
    - `I = L / (4 pi d^2)`
    - `R_s = 2 G M / c^2`
    - `z = Delta lambda / lambda_emitted`
    - `v approx z c`
    - `v = H0 d`
  - added:
    - `F = G M m / r^2`
    - `E_p = m V`
    - `v = 2 pi r / T`
    - `d = sqrt(L / (4 pi I))`
    - `v_escape = sqrt(2 G M / r)`
    - `lambda_observed = (1 + z) lambda_emitted`
- Result:
  - the formula bridge now matches the stronger mathematical reasoning used in the revised A11 banks.

## Video Assets

- Audit result:
  - `public/lesson_assets/A11` currently contains diagram assets only.
  - There are no dedicated A11 lesson-video assets in the repo.
- Root media issue:
  - the updated lesson structure, explorer layer, and assessment layer are now ahead of the media layer.
  - Any older lesson videos therefore no longer match the present A11 lesson state.
- Concrete next media task:
  - remap and rerender all A11 lesson videos:
    - `A11_L1` gravitational fields and potential
    - `A11_L2` satellites, orbital period, and observation role
    - `A11_L3` stellar spectra, luminosity, and H-R placement
    - `A11_L4` parallax, standard candles, and the distance ladder
    - `A11_L5` stellar evolution, compact objects, and Schwarzschild-radius reasoning
    - `A11_L6` redshift, Hubble expansion, dark energy, and cosmology

## Concrete Fix List

- Simulations:
  - done: replace the shared A6-A11 scaffold panel with dedicated A11 interactive explorers
- Diagrams:
  - confirmed aligned and preserved
- Tests:
  - done: add dedicated A11 diagnostic, concept, and mastery banks
  - done: guarantee `20 / 20 / 40`
  - done: increase conceptual and mathematical rigor
- Technical words:
  - done: add A11-specific glossary fallback support
- Formulas:
  - done: strengthen the gravity, orbit, stellar, distance-ladder, compact-object, and cosmology bridge formulas
- Video assets:
  - still outstanding: remap and rerender the full A11 lesson-video set so media matches the updated lesson state
