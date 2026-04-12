# F1 Audit Fix List

## Simulations
- Current F1 simulation copy in `lib/lessonRunnerApi.ts` is lesson-aligned across the six topics:
  - `F1_L1`: units, prefixes, and sensible unit choice
  - `F1_L2`: scalars, vectors, distance, and displacement
  - `F1_L3`: tool choice, resolution, uncertainty, and error patterns
  - `F1_L4`: significant figures and reporting rules
  - `F1_L5`: density, rearrangement, and float-sink comparisons
  - `F1_L6`: accuracy, precision, and uncertainty comparison
- No cross-topic simulation copy leak was found in this pass.
- Current structural limitation:
  - F1 still relies on the generic lesson-runner simulation shell rather than a dedicated measurement-only panel set.
- Concrete follow-up if deeper interactivity is needed:
  - build a dedicated `components/F1SimulationPanels.tsx`
  - route `F1_` lessons to that component in `components/LessonRunner.tsx`
  - expose lesson-specific manipulatives for unit scaling, vector arrows, instrument reading, sig-fig rounding, density comparison, and accuracy-precision target boards

## Diagrams
- Current F1 scaffold visuals are present and lesson-specific in `public/lesson-media/f1`:
  - `f1-l1-metric-system.svg`
  - `f1-l1-unit-meaning.svg`
  - `f1-l2-vectors-scalars.svg`
  - `f1-l3-tool-resolution.svg`
  - `f1-l3-reading-errors.svg`
  - `f1-l4-significant-figures.svg`
  - `f1-l4-calculator-notebook.svg`
  - `f1-l5-density.svg`
  - `f1-l5-float-sink.svg`
  - `f1-l6-accuracy-precision.svg`
- No stale non-F1 diagram names were found in the sampled F1 media set.
- No diagram remap was required in this pass.

## Tests
- Add a dedicated generated F1 assessment bank in [lib/f1AssessmentBanks.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\f1AssessmentBanks.ts).
- Route F1 through generated diagnostic, concept-gate, and mastery pools in [lib/lessonRunnerApi.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\lessonRunnerApi.ts).
- Bank floor targets after this fix:
  - diagnostic: 20 items per lesson
  - concept: 20 items per lesson
  - mastery: 40 items per lesson
- Delivery rules preserved by the runner:
  - diagnostics adapt within 2-5 questions
  - concept gate serves one question at a time and ends on first correct answer
  - mastery stays within the 5-10 question window
- Audit goals applied in the new bank:
  - remove unnecessary repetition from the tiny hardcoded fallback pool
  - raise F1 beyond slogan-level prompts into cleaner IGCSE-style measurement reasoning
  - keep scalar-vector, error-quality, sig-fig, density, and uncertainty logic separated cleanly
  - include both conceptual and numerical checks instead of only label-matching

## Technical Words
- Expand the F1 fallback glossary in [lib/technicalWords.ts](C:\Users\User\OneDrive\Documents\Playground\apip-web-f1push\lib\technicalWords.ts).
- New or strengthened F1 terms in this pass:
  - base unit
  - displacement
  - random error
  - systematic error
  - zero error
  - percentage uncertainty
- Existing aligned F1 terms retained:
  - physical quantity
  - unit
  - prefix
  - scalar
  - vector
  - resolution
  - uncertainty
  - significant figures
  - density
  - accuracy
  - precision

## Formulas
- Current F1 formula support in `lib/lessonRunnerApi.ts` under `foundationFormulaFallbacks` is aligned and already covers the six lessons:
  - `F1_L1`: `1 km = 1000 m`, `1 m = 100 cm = 1000 mm`, `1 kg = 1000 g`
  - `F1_L2`: `vector quantity = magnitude + direction`, `scalar quantity = magnitude only`
  - `F1_L3`: `uncertainty ~= +/- (smallest division / 2)`, `best estimate ~= mean of repeated readings`
  - `F1_L4`: multiplication/division -> least significant figures, addition/subtraction -> least decimal places
  - `F1_L5`: `density = mass / volume`, `mass = density x volume`, `volume = mass / density`
  - `F1_L6`: `percentage uncertainty = (absolute uncertainty / measured value) x 100%`
- No formula remap was required in this pass.

## Video Assets
- Public lesson video assets are present for all six F1 lessons under `public/lesson_assets/F1/F1_L1` through `F1_L6` with:
  - `final.mp4`
  - `thumbnail.png`
  - `captions.vtt`
- Static F1 video routing is already present in `lib/lessonRunnerApi.ts`.
- No missing-asset blocker was found in this pass.
- Follow-up recommendation:
  - keep future rerenders tied to the current lesson state whenever scaffold copy, simulations, or worked examples are materially revised
