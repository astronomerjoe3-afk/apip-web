# M11 Audit And Fix List

## Audit Summary

Module `M11` should teach `Atomic Structure and Radioactivity`, but several core lesson surfaces were still serving stale circuits-era content. The main breakages were not isolated to one file: simulation routing, scaffold visuals, worked examples, formula fallbacks, technical words, test banks, and video lookups were partially or fully out of line with the current module topic.

The immediate fix strategy was:

- route M11 lesson content to the corrected atomic/radioactivity content already living in the legacy `M13` namespace,
- replace stale local M11 formula and glossary fallbacks with module-accurate atomic/radioactivity material,
- add a dedicated M11 assessment bank with adequate pool sizes and better physics precision,
- force the lesson runner to use those M11-local banks and fallbacks instead of stale authored or generic content,
- remap M11 video and simulation lookups to the working atomic/radioactivity assets while dedicated M11 assets are rebuilt.

## Simulations

- Fix applied: `components/M11SimulationPanels.tsx` now wraps the atomic/radioactivity simulation implementation from `M13` and remaps `M11_* -> M13_*`.
- Fix applied: M11 simulation copy is now served through `lib/m11LessonContent.ts`, which remaps M11 lesson codes to the corrected atomic/radioactivity simulation text.
- Remaining follow-up: `public/lesson_assets/M11` still needs a true M11-native simulation asset pack so this wrapper/remap layer can eventually be removed.

## Diagrams

- Fix applied: M11 question visuals, scaffold focus extras, scaffold core bullets, scaffold media cards, and reflection checks now point to atomic/radioactivity content instead of stale circuits content.
- Fix applied: local M11 worked examples now resolve through the corrected atomic/radioactivity worked-example set instead of the stale circuits block.
- Remaining follow-up: the physical diagram pack under `public/lesson_assets/M11` should be rerendered so M11 owns its own atomic/radioactivity diagrams instead of borrowing through the legacy `M13` namespace.

## Tests

- Fix applied: added `lib/m11AssessmentBanks.ts` with dedicated lesson-by-lesson diagnostic, concept, and mastery banks for `M11_L1` through `M11_L6`.
- Fix applied: every M11 lesson now has:
  - `20` diagnostic items,
  - `20` concept-gate items,
  - `40` mastery items.
- Fix applied: `lib/lessonRunnerApi.ts` now routes M11 directly to these dedicated banks for diagnostic, concept-gate, and mastery delivery.
- Delivery rule status:
  - diagnostics remain administered in the existing runner at `2-5` questions,
  - concept checks still gate on the first correct answer,
  - mastery remains administered at `5-10` questions.
- Quality improvement focus:
  - less redundant repetition,
  - stronger IGCSE-style atomic-structure and radioactivity prompts,
  - tighter short-answer acceptance around physically correct language,
  - clearer separation between identity, charge, isotope logic, radiation type, half-life, background subtraction, and nuclear-equation balancing.
- Remaining follow-up: live sampling should still be spot-checked in UI after any later curriculum edits so diversity stays high across runs.

## Technical Words

- Fix applied: replaced stale M11 circuits glossary entries with atomic/radioactivity vocabulary:
  - atom,
  - nucleus,
  - proton,
  - neutron,
  - electron,
  - atomic number,
  - mass number,
  - ion,
  - isotope,
  - radioactive decay,
  - alpha particle,
  - beta-minus,
  - gamma ray,
  - ionisation,
  - half-life,
  - background radiation,
  - count rate.
- Remaining follow-up: if the authored lesson copy is expanded later, the glossary can be extended with detector-specific terms such as Geiger-Muller tube only where the lesson text genuinely introduces them.

## Formulas

- Fix applied: replaced stale circuits fallback formulas in `lib/coreFormulaFallbacks.ts` with atomic/radioactivity relations for particle counts, isotope bookkeeping, decay changes, half-life, corrected count rate, and nuclear balancing.
- Fix applied: removed the old `M11 -> M13` formula remap in `lib/lessonRunnerApi.ts` so M11 now uses its own corrected local formula cards.
- Fix applied: M11 is now treated as a lesson family that prefers local formula cards in the same way M9 and M10 already do.
- Remaining follow-up: if future lessons add more quantitative radioactivity tasks, extra formula cards can be added without changing the delivery mechanism.

## Video Assets

- Fix applied: pre-worked-example video lookups now remap `M11_* -> M13_*`, so M11 can use the currently correct atomic/radioactivity video pack instead of stale circuits video assumptions.
- Fix applied: this keeps the current lesson state internally consistent while the dedicated asset namespace is repaired.
- Remaining follow-up: the current M11 video assets should still be treated as needing a full remap and rerender into the `M11` asset namespace. The module state is now academically aligned, but the long-term clean fix is for M11 to own M11-labelled atomic/radioactivity video files rather than borrowing from the legacy `M13` path.

