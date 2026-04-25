# Lesson Schema And Misconception Model

## Why This Matters

The lesson schema is the engine that lets Cognispark scale without losing quality. Every mission should produce structured learning data, not just rendered content.

## Core Objects

- `Module`: a topic cluster such as M1 Motion and Kinematics
- `Mission`: a coherent learning journey inside a module
- `LessonStep`: one staged learning moment
- `Interaction`: a simulation, control, or response action
- `Checkpoint`: a graded or diagnostic question
- `Misconception`: a named wrong model
- `FeedbackRule`: targeted response tied to answer pattern
- `MasteryRecord`: student concept state over time

## Mission Schema

```ts
type Mission = {
  id: string;
  moduleId: string;
  title: string;
  promise: string;
  difficulty: "foundation" | "core" | "advanced";
  estimatedMinutes: number;
  prerequisites: string[];
  concepts: ConceptTag[];
  standards: StandardTag[];
  misconceptions: Misconception[];
  steps: LessonStep[];
  checkpoints: Checkpoint[];
  reviewBridge: ReviewBridge;
  analytics: MissionAnalyticsConfig;
};
```

## Lesson Step Schema

```ts
type LessonStep = {
  id: string;
  type:
    | "hook"
    | "meaning_setup"
    | "simulation"
    | "misconception_forecast"
    | "worked_example"
    | "checkpoint"
    | "lock_in"
    | "review_bridge";
  title: string;
  studentPrompt: string;
  teacherNote?: string;
  interactionId?: string;
  checkpointId?: string;
  successCriteria: string[];
};
```

## Checkpoint Schema

```ts
type Checkpoint = {
  id: string;
  conceptId: string;
  skillId: string;
  prompt: string;
  difficulty: "foundation" | "core" | "advanced";
  responseType: "multiple_choice" | "numeric" | "drag" | "graph" | "short_text";
  correctAnswer: unknown;
  distractors: Distractor[];
  feedbackRules: FeedbackRule[];
  masteryWeight: number;
  retryPolicy: {
    maxUnguidedAttempts: number;
    showHintAfterAttempt: number;
    requireRepairPrompt: boolean;
  };
};
```

## Misconception Schema

```ts
type Misconception = {
  id: string;
  name: string;
  conceptId: string;
  description: string;
  diagnosticSignals: string[];
  repairMove: string;
  reviewDelayDays: number[];
};
```

## Feedback Rule Schema

```ts
type FeedbackRule = {
  id: string;
  answerPattern: string;
  misconceptionId?: string;
  tone: "confirm" | "correct" | "coach" | "warn";
  headline: string;
  explanation: string;
  whyRight?: string;
  temptingWrongMove?: string;
  repairPrompt?: string;
  nextAction: "retry" | "review_hint" | "advance" | "schedule_review";
};
```

## Mastery Score V1

Each concept receives a score from 0 to 100.

Suggested formula:

```text
mastery =
  40 * first_attempt_accuracy
+ 20 * retry_recovery
+ 15 * low_hint_dependence
+ 15 * transfer_success
+ 10 * delayed_review_success
```

### Interpretation

| Score | Label | Product Behavior |
| --- | --- | --- |
| 0-39 | fragile | assign repair path |
| 40-59 | developing | schedule near review |
| 60-79 | stable | continue but revisit later |
| 80-100 | strong | unlock challenge or transfer item |

## M1 Misconception Taxonomy

| ID | Name | Diagnostic Signal | Repair Move |
| --- | --- | --- | --- |
| M1-GRAPH-PATH | Graph as road | chooses answer based on graph shape as physical route | restate axes and compare graph to map |
| M1-FLAT-TIME | Flat means time stopped | says nothing happens or time paused on flat segment | show time axis still advances while distance stays fixed |
| M1-HEIGHT-SPEED | Height equals speed | chooses higher graph point as faster object | compare slope vs height |
| M1-SLOPE-LENGTH | Line length means speed | chooses visually longest segment as fastest | calculate or compare gradient |
| M1-AREA-DISTANCE | Area always means distance | treats negative velocity area as positive distance | distinguish displacement from distance |
| M1-NEG-IMPOSSIBLE | Negative means impossible | rejects negative velocity or acceleration | connect sign to chosen direction |
| M1-ACCEL-FAST | Acceleration means fast | picks highest velocity as highest acceleration | compare change in velocity over time |
| M1-FORMULA-FIRST | Formula hunting | selects equation before naming physical story | require givens-to-meaning scaffold |

## Event Payload Example

```json
{
  "event": "checkpoint_answered",
  "studentId": "student_123",
  "missionId": "M1.1",
  "checkpointId": "M1.1.C2",
  "conceptId": "motion_graph_gradient",
  "answerState": "incorrect",
  "attemptNumber": 1,
  "misconceptionId": "M1-HEIGHT-SPEED",
  "hintViewed": false,
  "timeOnStepMs": 42000,
  "timestamp": "2026-04-25T00:00:00.000Z"
}
```

## Authoring Checklist

Before publishing any mission:

- every checkpoint has at least one distractor mapped to a misconception
- every misconception has a repair prompt
- every concept has at least one delayed review item
- every simulation emits meaningful interaction events
- every final mastery state gives the learner a useful next step

