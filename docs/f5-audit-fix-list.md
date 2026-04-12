# F5 Audit Fix List

## Simulations
- Current F5 simulation copy in [lib/f5LessonContent.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f5LessonContent.ts) is already lesson-aligned across the six astronomy lessons:
  - `F5_L1`: Earth-Moon-Sun host relationships
  - `F5_L2`: day and night from Earth's rotation
  - `F5_L3`: seasons from axial tilt
  - `F5_L4`: Moon phases versus eclipses
  - `F5_L5`: Solar System family classification
  - `F5_L6`: apparent sky motion and scale
- No cross-topic simulation-copy leak was found in this pass.
- No simulation code remap was required in this fix.

## Diagrams
- F5 lesson-specific diagrams are present under `public/lesson_assets/F5/F5_L1` through `F5_L6`.
- The current diagram set is topic-aligned and already mapped through F5 lesson content.
- No stale non-astronomy diagram mapping was found in the sampled F5 visuals.
- No diagram remap was required in this fix.

## Tests
- Add a dedicated generated F5 assessment bank in [lib/f5AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f5AssessmentBanks.ts).
- Route F5 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- Bank floor targets enforced by the new F5 bank:
  - diagnostic: at least 20 items per lesson
  - concept: at least 20 items per lesson
  - mastery: at least 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within the 2-5 question window
  - concept check remains first-correct-exits
  - mastery stays within the 5-10 question window
- Audit goals applied in the new F5 bank:
  - remove reliance on the old fallback assessment path
  - reduce unnecessary repetition across orbit, rotation, seasons, phases, classification, and apparent-motion prompts
  - raise F5 toward stronger IGCSE-style reasoning by combining conceptual separation with lightweight quantitative time-scale checks
  - keep nested host relations, day versus year timescales, tilt versus distance, phase versus eclipse, and pattern versus literal scale cleanly separated

## Technical Words
- F5 is already treated as a strict-authored technical-word module in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\technicalWords.ts).
- No stale non-astronomy fallback glossary leak was found in this pass.
- No technical-word code change was required in this fix.

## Formulas
- Current F5 foundation-formula fallback support in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts) is already lesson-aligned:
  - `F5_L1`: orbit needs gravity plus sideways motion
  - `F5_L2`: one full rotation is about 24 h
  - `F5_L3`: one orbit is about 365 d and axis tilt is about 23.5 degrees
  - `F5_L4`: phases depend on Sun-Earth-Moon geometry and eclipses need special alignment
  - `F5_L5`: Solar System family structure
  - `F5_L6`: day-year timescale split and apparent daily sky motion from rotation
- No formula remap was required in this fix.

## Video Assets
- Public lesson video assets are present for all six F5 lessons under `public/lesson_assets/F5/F5_L1` through `F5_L6` with:
  - `final.mp4`
  - `thumbnail.png`
  - `captions.vtt`
- Static F5 video routing is already present in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- No missing-video blocker was found in this pass.
- Follow-up recommendation:
  - rerender only if future lesson copy, worked examples, or simulation tasks materially change
