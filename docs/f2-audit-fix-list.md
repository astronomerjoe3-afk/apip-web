# F2 Audit Fix List

## Simulations
- Current F2 simulation copy in `lib/lessonRunnerApi.ts` is lesson-aligned across the six topics:
  - `F2_L1`: distance, displacement, and average speed
  - `F2_L2`: velocity change and acceleration sign
  - `F2_L3`: distance-time graph reading
  - `F2_L4`: velocity-time graph slope and area
  - `F2_L5`: balanced and unbalanced forces
  - `F2_L6`: force, mass, acceleration, and inertia
- No cross-topic simulation-copy leak was found in this pass.
- Current structural limitation:
  - F2 still uses the generic lesson-runner simulation shell rather than a dedicated motion-and-forces panel set.
- Concrete follow-up if deeper interactivity is needed:
  - build `components/F2SimulationPanels.tsx`
  - route `F2_` lessons to that component in `components/LessonRunner.tsx`
  - expose lesson-specific manipulatives for route-vs-displacement paths, velocity-arrow change, graph sketching, resultant-force balancing, and `F = ma` ratio comparisons

## Diagrams
- Current F2 scaffold visuals are present and lesson-specific in `public/lesson-media/f2`:
  - `f2-l1-distance-displacement.svg`
  - `f2-l2-velocity-acceleration.svg`
  - `f2-l3-distance-time-graph.svg`
  - `f2-l3-reflection-graph-check.svg`
  - `f2-l4-velocity-time-graph.svg`
  - `f2-l5-resultant-force.svg`
  - `f2-l6-force-mass.svg`
- No stale non-F2 diagram names were found in the sampled F2 media set.
- No diagram remap was required in this pass.

## Tests
- Add a dedicated generated F2 assessment bank in [lib/f2AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f2AssessmentBanks.ts).
- Route F2 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- Bank floor targets after this fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within 2-5 questions
  - concept gate serves one question at a time and ends on first correct answer
  - mastery stays within the 5-10 question window
- Audit goals applied in the new bank:
  - remove unnecessary repetition from the tiny inline fallback pool
  - raise F2 beyond slogan-level prompts into stronger IGCSE-style motion and force reasoning
  - keep route/displacement, speed/velocity, slope/area, balanced/resultant, and force/mass distinctions cleanly separated
  - include both numerical and conceptual checks across motion, graphs, and Newton's second law

## Technical Words
- Expand the F2 fallback glossary in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\technicalWords.ts).
- New or strengthened F2 terms in this pass:
  - average speed
  - distance-time graph
  - velocity-time graph
  - balanced forces
  - unbalanced forces
  - Newton's second law
- Existing aligned F2 terms retained:
  - distance
  - displacement
  - speed
  - velocity
  - acceleration
  - force
  - resultant force
  - friction
  - air resistance
  - inertia

## Formulas
- Current F2 formula support in `lib/lessonRunnerApi.ts` under `foundationFormulaFallbacks` is aligned and already covers the six lessons:
  - `F2_L1`: `average speed = total distance / total time`, `displacement = final position - initial position`
  - `F2_L2`: `v = displacement / time`, `a = change in velocity / time`
  - `F2_L3`: `speed = gradient = change in distance / change in time`
  - `F2_L4`: `a = gradient = change in velocity / change in time`, `displacement = area under the velocity-time graph`
  - `F2_L5`: `F_resultant = sum of forces with direction`
  - `F2_L6`: `F = ma`, `a = F / m`
- No formula remap was required in this pass.

## Video Assets
- Public lesson video assets are present for all six F2 lessons under `public/lesson_assets/F2/F2_L1` through `F2_L6` with:
  - `final.mp4`
  - `thumbnail.png`
  - `captions.vtt`
- Static F2 video routing is already present in `lib/lessonRunnerApi.ts`.
- No missing-asset blocker was found in this pass.
- Follow-up recommendation:
  - keep future rerenders tied to the current lesson state whenever scaffold copy, worked examples, or simulation tasks are materially revised
