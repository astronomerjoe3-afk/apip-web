# M12 Audit Fix List

Module target: `M12 Nuclear Energy and Applications`

Audit date: 2026-04-12

## Simulations

- Problem found: the live `M12` simulation runtime was still the older magnetism/electromagnetic-effects simulator.
- Fix applied: route `M12` to a dedicated nuclear simulator component with lesson-specific boards for binding energy, fission, fusion, reactor control, radioisotope selection, and hazard-management tradeoffs.
- Follow-up note: the old magnetism simulation component is still retained internally because `M10` currently reuses that implementation while its asset remap remains separate.

## Diagrams

- Problem found: the old `public/lesson_assets/M12/...` diagram pack is magnetism-themed and no longer matches the curriculum target.
- Fix applied: canonical `M12` lesson-content exports now point to the nuclear content pack, and scaffold/question visuals resolve to the nuclear diagram set already hosted under `A10`.
- Remaining asset task: create a dedicated `M12` nuclear diagram namespace if the product needs module-local rather than shared `A10` visuals.

## Tests

- Problem found: `M12` had no dedicated local assessment bank, so the module could not guarantee a nuclear-aligned diagnostic, concept, and mastery pool with enough variety and rigor.
- Fix applied: add a dedicated `m12AssessmentBanks` file and route `M12` diagnostics, concept checks, and mastery tests through it.
- Bank targets enforced:
  - diagnostic pool minimum: 20 questions per lesson
  - concept pool minimum: 20 questions per lesson
  - mastery pool minimum: 40 questions per lesson
- Delivery-rule check:
  - diagnostics already run adaptively in the 2-5 question range
  - concept check already stops on the first correct answer
  - mastery already runs in the 5-10 question range
- Audit standard used: remove near-duplicates, strengthen question phrasing, and keep questions at standard IGCSE-level conceptual or quantitative difficulty.

## Technical Words

- Problem found: the module glossary for `M12` was still magnetism-based.
- Fix applied: replace the module glossary with nuclear-energy terms and add lesson-specific technical-word sets inside the lesson runner for better alignment with each lesson.

## Formulas

- Problem found: the formula bridge for `M12` still displayed magnetism relations.
- Fix applied: replace `M12` formula fallbacks with nuclear relations including mass-energy equivalence, binding energy per nucleon, controlled-chain logic, reactor power/efficiency links, half-life/application matching, and shielding-risk relations.
- Delivery fix: mark `M12` as a local-formula module so the lesson runner prefers the corrected nuclear formula cards.

## Worked Examples

- Problem found: the local `M12` worked examples were copied from the magnetism module.
- Fix applied: replace all six local worked-example sets with nuclear examples that match the lesson sequence and include stronger causal and quantitative reasoning.

## Video Assets

- Problem found: there is no dedicated nuclear `M12` video pack currently mapped into the lesson runner.
- Runtime state after fixes: `M12` no longer depends on the stale magnetism scaffold copy, but it still lacks a proper nuclear video asset set.
- Remaining media task:
  - remap or create lesson videos for `M12_L1` to `M12_L6`
  - rerender captions, poster frames, and final mp4 exports
  - publish under a dedicated `M12` nuclear asset namespace before enabling video insertion for the module
