# Simulation Components

## Component Strategy

Cognispark should build a small set of reusable physics reasoning components before expanding content volume. Each component should support:

- live manipulation
- linked representation
- checkpoint integration
- misconception-specific prompts
- keyboard and screen-reader accessibility
- analytics events

## Component 1: MotionGraphLab

Purpose: teach distance-time and velocity-time graphs as records of change.

### Modes

- story board
- pace log
- gradient meaning
- area builder
- interpolation challenge

### Required Props

```ts
type MotionGraphLabProps = {
  mode: "story" | "pace" | "gradient" | "area" | "interpolation";
  initialState: MotionGraphState;
  showScaffold: boolean;
  checkpointId?: string;
  onStateChange: (state: MotionGraphState) => void;
  onMisconceptionSignal: (id: string) => void;
};
```

### Analytics Events

- `simulation_started`
- `slider_changed`
- `graph_segment_selected`
- `prediction_made`
- `misconception_signal_detected`
- `simulation_completed`

### Accessibility Requirements

- sliders have physical-unit labels
- graph has a text summary generated from state
- keyboard controls mirror pointer controls
- reduced-motion mode disables animated replay

## Component 2: ForceSystemBuilder

Purpose: help students build one-object force systems before predicting motion.

### Modes

- resultant force
- balanced vs unbalanced
- third-law pair contrast
- torque reach
- stability margin

### Required Interactions

- add force arrow
- adjust magnitude
- adjust direction
- toggle object boundary
- compare pair forces across objects
- show resultant vector

### Misconception Signals

| Signal | Misconception |
| --- | --- |
| treats equal pair forces as canceling on one object | third-law cancellation |
| says zero resultant means zero velocity | resultant-motion confusion |
| ignores lever arm in torque mode | torque equals force only |
| judges stability by object size only | stability without line of action |

## Component 3: EnergyLedgerWorkspace

Purpose: make energy accounting visible before algebra.

### Modes

- ledger balance
- store comparison
- work hand-off
- power vs efficiency
- multi-stage mission planner

### Required Interactions

- split input into useful gain and leak
- assign stores
- compare before/after states
- set time for power comparison
- preserve intermediate result into next stage

### Component Rule

Every energy interaction must preserve conservation language:

```text
input hand-off = useful gain + remaining store change + leak
```

## Component 4: MissionCheckpointPanel

Purpose: unify checks, feedback, repairs, and mastery events.

### States

- unanswered
- correct
- incorrect with targeted correction
- incorrect with repair step
- retry ready
- mastered
- scheduled for review

### Required UI

- concept focus
- difficulty
- misconception watch
- answer controls
- feedback panel
- repair prompt
- next action

## Component 5: MasteryTimeline

Purpose: show students that learning is cumulative.

### Required Data

- current concept score
- latest mistake pattern
- due review date
- next mission
- teacher-visible note

### Student Display

Use friendly, non-punitive labels:

- "getting clearer"
- "needs one repair"
- "ready to transfer"
- "strong"

## Component 6: TeacherMisconceptionHeatmap

Purpose: show teachers where the class is stuck.

### Views

- by concept
- by misconception
- by class group
- by assignment
- by individual student

### Required Actions

- assign repair mission
- message student or class
- export report
- view example wrong answer pattern
- open teacher note

## Build Order

1. MissionCheckpointPanel
2. MotionGraphLab flagship mode
3. MasteryTimeline
4. TeacherMisconceptionHeatmap
5. ForceSystemBuilder expansion
6. EnergyLedgerWorkspace expansion

## Component Quality Bar

A simulation component is world-class ready when:

- it teaches one concept visibly
- it has clear controls with units
- it produces meaningful learning events
- it supports keyboard use
- it has a text explanation fallback
- it can be reused in at least three lessons

