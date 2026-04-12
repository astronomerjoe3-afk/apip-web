# M2 Audit Fix List

## Scope

Module `M2` was audited across simulations, diagrams, tests, technical words, formulas, and video assets.

## Simulations

- Current state: `M2_L1` to `M2_L6` already point to lesson-matched forces-and-moments simulations through `lib/m2LessonContent.ts`.
- Audit verdict: aligned with the module progression from resultant force through vector resolution.
- Fix applied: no simulation remap required in this pass.

## Diagrams

- Current state: M2 already uses lesson-specific mechanics diagrams for:
  - resultant force and Newton's first law
  - Newton's second and third laws
  - momentum conservation
  - torque and moments
  - stability and centre of mass
  - vector resolution
- Audit verdict: diagrams are aligned with the current lesson sequence and not reusing off-topic material from another module.
- Fix applied: no diagram remap required in this pass.

## Tests

- Problem found: M2 assessment coverage was structurally too thin.
- Original bank size per lesson:
  - diagnostic: `4`
  - concept: `4`
  - mastery: `8`
- Impact:
  - too little variation
  - not enough IGCSE-style quantitative reasoning
  - too easy for repeated re-attempts
  - mastery coverage below the module standard
- Fix applied:
  - added `lib/m2AssessmentBanks.ts`
  - created lesson-owned generated banks for `M2_L1` to `M2_L6`
  - routed `lib/lessonRunnerApi.ts` to use the new M2-owned diagnostic, concept, and mastery banks directly
  - expanded question coverage across:
    - force balance and first-law interpretation
    - `F = ma` reasoning and action-reaction pairs
    - momentum conservation in one-dimensional collisions
    - torque from force and perpendicular distance
    - stability from centre of mass and support base
    - vector component combination, magnitude rebuilding, and direction from `+x`
- Target standard for every lesson after this pass:
  - at least `20` diagnostic items
  - at least `20` concept-gate items
  - at least `40` mastery items
- Runner behavior preserved:
  - diagnostic still serves `2-5` questions
  - concept gate still stops on the first correct answer
  - mastery still serves `5-10` questions

## Technical Words

- Current state: M2 technical words were already aligned with the module vocabulary, including:
  - resultant force
  - Newton's laws
  - momentum
  - moment
  - centre of mass
  - stability
  - vector component
  - conservation of momentum
- Audit verdict: aligned.
- Fix applied: no glossary rewrite required in this pass.

## Formulas

- Problem found:
  - M2_L6 still had corrupted vector-angle notation in parts of the runner text.
  - One duplicated M2_L6 worked-example block contained contradictory numbers:
    - one part said `11.3 N east` and `6.0 N north`
    - another part incorrectly rebuilt the resultant from `5` and `6` to get `7.8 N`
- Fix applied:
  - normalized the M2_L6 vector-angle wording to plain ASCII:
    - `theta = tan^-1(y / x)` in lesson content
    - `tan(theta) = y / x` in scaffold copy
  - corrected the duplicated worked-example block so it consistently gives:
    - net x-component: `11.3 N east`
    - net y-component: `6.0 N north`
    - resultant magnitude: about `12.8 N`
    - direction: about `28 degrees` above the `+x` axis

## Video Assets

- Current state: lesson-specific M2 video asset folders exist for `M2_L1` to `M2_L6`, including video, captions, and thumbnails.
- Audit verdict: asset presence is aligned with the current lesson structure.
- Fix applied: no video remap required in this pass.

## Summary

The main M2 weakness was assessment ownership, bank size, and rigor rather than topic mismatch. This pass fixes the structural assessment gap, hardens the runner routing, and cleans the remaining M2_L6 vector-direction and worked-example inconsistencies while leaving already aligned simulations, diagrams, technical words, and video routing intact.
