# Teacher Dashboards And Analytics

## Teacher Product Promise

Cognispark should save teachers time while giving them better conceptual insight.

The dashboard should answer:

- who is stuck?
- what idea are they stuck on?
- what misconception is driving the mistake?
- what should I assign next?
- did the repair work?

## Dashboard Views

### 1. Class Overview

Purpose: quick weekly status.

Widgets:

- active students
- assignments due
- completion rate
- average mastery gain
- top three class misconceptions
- students needing intervention

### 2. Assignment Progress

Purpose: monitor assigned work.

Table columns:

- student
- status
- started at
- completed at
- mastery score
- attempts
- hints used
- weakest concept
- recommended action

### 3. Misconception Heatmap

Purpose: reveal class-level conceptual blockers.

Rows:

- concepts

Columns:

- named misconceptions
- affected students
- first-attempt miss rate
- repair success rate
- due review count

### 4. Student Profile

Purpose: diagnose one learner.

Sections:

- recent missions
- concept mastery timeline
- repeated misconception patterns
- delayed review performance
- teacher notes
- suggested next assignment

### 5. Intervention Queue

Purpose: reduce teacher decision load.

Rules:

- low mastery and high retry count
- repeated same misconception across missions
- failed delayed review after initial success
- inactive after starting assignment
- high hint dependence without improvement

## Student Analytics Events

| Event | Trigger | Key Fields |
| --- | --- | --- |
| `mission_started` | learner opens mission | studentId, missionId, source |
| `lesson_step_viewed` | step visible | stepId, conceptId |
| `simulation_started` | simulation first interaction | simulationId, mode |
| `simulation_state_changed` | meaningful control change | controlId, value, unit |
| `checkpoint_answered` | answer submitted | checkpointId, correctness, attemptNumber |
| `misconception_detected` | answer maps to misconception | misconceptionId, confidence |
| `feedback_viewed` | feedback panel shown | feedbackRuleId |
| `hint_viewed` | hint opened | hintId, attemptNumber |
| `repair_completed` | learner completes repair prompt | misconceptionId |
| `mission_completed` | mission complete | masteryScore, timeOnMission |
| `review_scheduled` | review created | conceptId, dueAt |
| `review_completed` | review answered | conceptId, correctness |

## Mastery Metrics

### Student-Level

- concept mastery score
- mission completion
- misconception frequency
- repair success
- delayed review success
- confidence if collected

### Class-Level

- average mastery gain
- class misconception concentration
- assignment completion rate
- intervention queue size
- retry recovery rate

### Product-Level

- public mission completion rate
- sign-up conversion after mission
- lesson drop-off step
- checkpoint difficulty calibration
- simulation engagement depth

## Data Model Additions

```ts
type LearningEvent = {
  id: string;
  eventName: string;
  studentId: string;
  classId?: string;
  assignmentId?: string;
  moduleId?: string;
  missionId?: string;
  stepId?: string;
  conceptId?: string;
  misconceptionId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
```

```ts
type ConceptMastery = {
  studentId: string;
  conceptId: string;
  score: number;
  label: "fragile" | "developing" | "stable" | "strong";
  latestMisconceptionId?: string;
  nextReviewAt?: string;
  updatedAt: string;
};
```

## Weekly Teacher Report

Every week, teachers should receive:

- class progress summary
- top misconceptions
- students needing attention
- recommended review assignment
- learning gains since previous week
- one printable parent/school-friendly summary

## Analytics Guardrails

- Do not shame students for attempts or hint usage.
- Do not rank students publicly.
- Do not show teachers irrelevant event noise.
- Always turn analytics into a next action.
- Keep school data tenant-scoped.

## Pilot Success Metrics

For a 4-week pilot:

- 70 percent of invited students complete at least one assigned mission
- 50 percent of students improve on delayed review after repair
- teacher can identify top class misconception in under 2 minutes
- teacher reports reduced marking or diagnosis time
- students report increased clarity or confidence after flagship M1 missions

