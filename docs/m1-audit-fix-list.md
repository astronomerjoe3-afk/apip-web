# M1 Audit Fix List

## Scope

Module `M1` was audited across simulations, diagrams, tests, technical words, formulas, and video assets.

## Simulations

- Current state: `M1_L1` to `M1_L6` already point to lesson-specific simulation assets and lesson-matched prompts.
- Audit verdict: aligned with the motion-and-graphs progression.
- Fix applied: no simulation code changes required in this pass.

## Diagrams

- Current state: lesson-specific M1 diagram assets exist for distance-time, speed-time, signed acceleration, constant acceleration, gradient meaning, and area under graphs.
- Audit verdict: diagrams are aligned with the taught lesson ideas and current worked examples.
- Fix applied: no diagram remap required in this pass.

## Tests

- Problem found: `M1` was still using legacy inline assessment pools instead of a dedicated generated bank.
- Impact:
  - diagnostic and concept pools were undersized
  - mastery coverage was too thin
  - question variety and IGCSE-style rigor were below the newer module standard
- Fix applied:
  - added `lib/m1AssessmentBanks.ts`
  - created lesson-owned generated banks for `M1_L1` to `M1_L6`
  - each lesson now has:
    - at least 20 diagnostic items
    - at least 20 concept-gate items
    - at least 40 mastery items via combined lesson-owned bank generation
  - question mix now includes:
    - graph interpretation
    - numerical motion calculations
    - sign reasoning for velocity and acceleration
    - suvat equation choice under constant acceleration
    - axes-dependent gradient meaning
    - area-under-graph distance reasoning
  - runner wiring now routes M1 through generated diagnostic, concept, and mastery bank paths

## Technical Words

- Current state: M1 technical words already match the module's motion-and-graph vocabulary.
- Audit verdict: aligned.
- Fix applied: no glossary changes required in this pass.

## Formulas

- Current state: existing M1 formula scaffolds and worked examples already align with:
  - speed from gradient on distance-time graphs
  - acceleration from gradient on speed-time graphs
  - constant-acceleration equations
  - distance from area under speed-time graphs
- Audit verdict: aligned.
- Fix applied: no formula scaffold rewrite required in this pass.

## Video Assets

- Current state: lesson-specific video asset folders exist for `M1_L1` to `M1_L6`, including `final.mp4`, captions, and thumbnails.
- Audit verdict: asset presence and routing are aligned with the current lesson set.
- Fix applied: no video remap required in this pass.

## Summary

The main M1 weakness was not content-theme mismatch. It was assessment-bank ownership, size, and rigor. This pass fixes that structural gap while leaving already aligned simulations, diagrams, formulas, technical words, and video routing untouched.
