"use client";

import { useMemo, useState } from "react";

import { misconceptionSummaryForTag } from "@/lib/misconceptionRepair";
import styles from "./missionDemo.module.css";

type QuestionKey = "pauseSegment" | "fastestSegment" | "distanceAtSeven";

type MissionOption = {
  value: string;
  label: string;
  feedback: string;
  misconceptionTag?: string;
};

type MissionQuestion = {
  key: QuestionKey;
  prompt: string;
  answer: string;
  hint: string;
  focus: string;
  watchFor: string;
  difficulty: "Foundation" | "Core" | "Advanced";
  intuition: string;
  whyRight: string;
  temptingWrong: string;
  examMove: string;
  options: MissionOption[];
};

type RepairSummary = NonNullable<ReturnType<typeof misconceptionSummaryForTag>>;

const CLARITY_ROUTE = [
  {
    label: "What is happening",
    body: "The rover moves away from base, waits for a short interval, then returns toward base.",
  },
  {
    label: "What to notice",
    body: "Read the line segment by segment. Upward means farther away, flat means stopped, and downward means coming back.",
  },
  {
    label: "What changes",
    body: "The slope and direction change from one segment to the next, so the motion story changes too.",
  },
  {
    label: "What stays the same",
    body: "The axes keep the same meaning all the way through: time on the horizontal axis and distance from base on the vertical axis.",
  },
  {
    label: "Common mistake",
    body: "Treating the graph as a picture of the road instead of a record of how distance changes with time.",
  },
  {
    label: "Exam-style check",
    body: "Use the segment meaning first, then choose the statement or value that best matches the graph.",
  },
] as const;

const GRAPH_SEGMENTS = [
  { label: "A", startTime: 0, endTime: 3, startDistance: 0, endDistance: 24 },
  { label: "B", startTime: 3, endTime: 5, startDistance: 24, endDistance: 24 },
  { label: "C", startTime: 5, endTime: 8, startDistance: 24, endDistance: 12 },
] as const;

const QUESTIONS: MissionQuestion[] = [
  {
    key: "pauseSegment",
    prompt: "Which segment shows the rover stopped?",
    answer: "B",
    hint: "Look for the part of the graph where distance does not change while time keeps moving.",
    focus: "Interpreting flat segments",
    watchFor: "treating constant distance as constant time",
    difficulty: "Foundation",
    intuition: "A stopped object still lets time pass. On this graph, that means the distance value stays fixed while the time value keeps increasing.",
    whyRight: "Segment B is flat, so the rover keeps the same distance from base throughout that interval.",
    temptingWrong: "The tempting wrong move is to treat any non-horizontal segment as the answer because it looks more active, but motion only stops when the distance stops changing.",
    examMove: "In exams, identify what the axes mean first, then translate the line shape into the motion story.",
    options: [
      {
        value: "A",
        label: "Segment A",
        feedback: "Not quite. Segment A slopes upward, so the rover is still moving away from base.",
        misconceptionTag: "flat_line_time_confusion",
      },
      {
        value: "B",
        label: "Segment B",
        feedback: "Exactly. A flat line means the distance from base stays constant, so the rover is stopped.",
      },
      {
        value: "C",
        label: "Segment C",
        feedback: "Close, but Segment C slopes downward. That means the rover is moving back toward base.",
        misconceptionTag: "flat_line_time_confusion",
      },
    ],
  },
  {
    key: "fastestSegment",
    prompt: "Which segment has the greatest speed?",
    answer: "A",
    hint: "Speed is how steep the graph is. The steeper the segment, the larger the speed.",
    focus: "Comparing gradient and speed",
    watchFor: "judging motion by appearance instead of slope",
    difficulty: "Core",
    intuition: "On a distance-time graph, speed is the size of the slope. The steepest segment shows the biggest change in distance each second.",
    whyRight: "Segment A rises the fastest, so it shows the largest change in distance per second and therefore the greatest speed.",
    temptingWrong: "The tempting wrong move is to compare only whether a segment is moving or flat instead of comparing how steep the moving segments really are.",
    examMove: "In exams, compare gradients rather than raw line length or how dramatic the picture looks.",
    options: [
      {
        value: "A",
        label: "Segment A",
        feedback: "Yes. Segment A is the steepest, so it represents the greatest speed.",
      },
      {
        value: "B",
        label: "Segment B",
        feedback: "A flat segment means zero speed, so it cannot be the fastest part.",
        misconceptionTag: "height_vs_slope_confusion",
      },
      {
        value: "C",
        label: "Segment C",
        feedback: "Segment C is moving, but its slope is gentler than Segment A, so it is slower.",
        misconceptionTag: "height_vs_slope_confusion",
      },
      {
        value: "same",
        label: "They are all the same",
        feedback: "The graph says otherwise. Comparing slope is the key move here.",
        misconceptionTag: "height_vs_slope_confusion",
      },
    ],
  },
  {
    key: "distanceAtSeven",
    prompt: "At 7 seconds, how far is the rover from base?",
    answer: "16",
    hint: "Segment C drops from 24 m at 5 s to 12 m at 8 s. Use the graph, not the total journey length.",
    focus: "Interpolating on a graph",
    watchFor: "grabbing an endpoint instead of the asked time",
    difficulty: "Core",
    intuition: "This is an interpolation question. Stay on Segment C, work out how the distance is changing each second, then read the value at 7 s.",
    whyRight: "Segment C drops by 12 m over 3 s, so the distance falls by 4 m each second. Starting from 24 m at 5 s, the rover is 16 m from base at 7 s.",
    temptingWrong: "The tempting wrong move is to grab the end value or a familiar number from the graph instead of tracking the segment's change rate to the exact time asked.",
    examMove: "In exams, keep your eye on the segment that contains the time you were asked about, not the whole journey.",
    options: [
      {
        value: "12",
        label: "12 m",
        feedback: "That is the distance at 8 seconds, not at 7 seconds.",
        misconceptionTag: "distance_time_graph_error",
      },
      {
        value: "16",
        label: "16 m",
        feedback: "Correct. One second before 8 s, the rover is 16 m from base on the downward segment.",
      },
      {
        value: "20",
        label: "20 m",
        feedback: "A common trap. The graph is dropping by 4 m each second on Segment C, so at 7 s the distance is 16 m.",
        misconceptionTag: "distance_time_graph_error",
      },
      {
        value: "28",
        label: "28 m",
        feedback: "The rover never reaches 28 m on this graph. The maximum distance shown is 24 m.",
        misconceptionTag: "height_vs_slope_confusion",
      },
    ],
  },
];

const GRAPH_FRAME = {
  width: 560,
  height: 360,
  left: 72,
  right: 36,
  top: 28,
  bottom: 46,
  maxTime: 8,
  maxDistance: 24,
};

function graphX(time: number): number {
  const plotWidth = GRAPH_FRAME.width - GRAPH_FRAME.left - GRAPH_FRAME.right;
  return GRAPH_FRAME.left + (time / GRAPH_FRAME.maxTime) * plotWidth;
}

function graphY(distance: number): number {
  const plotHeight = GRAPH_FRAME.height - GRAPH_FRAME.top - GRAPH_FRAME.bottom;
  return GRAPH_FRAME.top + (1 - distance / GRAPH_FRAME.maxDistance) * plotHeight;
}

function distanceAtTime(time: number): number {
  if (time <= 3) {
    return time * 8;
  }
  if (time <= 5) {
    return 24;
  }
  return 24 - (time - 5) * 4;
}

function motionDescription(time: number): string {
  if (time < 3) {
    return "moving away from base at a steady speed";
  }
  if (time < 5) {
    return "stopped, even though time is still passing";
  }
  if (time === 5) {
    return "just beginning the return trip";
  }
  return "coming back toward base at a slower steady speed";
}

export default function PublicMissionClient() {
  const [time, setTime] = useState(4);
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});
  const [repairTags, setRepairTags] = useState<string[]>([]);

  const currentDistance = useMemo(() => distanceAtTime(time), [time]);
  const currentDescription = useMemo(() => motionDescription(time), [time]);
  const answeredCount = useMemo(
    () => QUESTIONS.filter((question) => typeof answers[question.key] === "string").length,
    [answers],
  );
  const correctCount = useMemo(
    () =>
      QUESTIONS.filter((question) => {
        const value = answers[question.key];
        return typeof value === "string" && value === question.answer;
      }).length,
    [answers],
  );
  const missionProgress = QUESTIONS.length > 0 ? (correctCount / QUESTIONS.length) * 100 : 0;
  const allChecksCorrect = correctCount === QUESTIONS.length;
  const capturedRepairs = useMemo(
    () =>
      repairTags
        .map((tag) => misconceptionSummaryForTag(tag))
        .filter((repair): repair is RepairSummary => repair !== null),
    [repairTags],
  );

  const activePoint = useMemo(
    () => ({
      x: graphX(time),
      y: graphY(currentDistance),
    }),
    [currentDistance, time],
  );

  function handleAnswer(questionKey: QuestionKey, value: string, misconceptionTag?: string) {
    setAnswers((current) => ({ ...current, [questionKey]: value }));

    if (misconceptionTag) {
      setRepairTags((current) => (current.includes(misconceptionTag) ? current : [...current, misconceptionTag]));
    }
  }

  return (
    <section className={styles.missionExperience}>
      <div className={styles.sectionCopy}>
        <p className={styles.sectionEyebrow}>Public playable mission</p>
        <h2>Read a motion graph like a record of what really happened.</h2>
        <p>
          A rover leaves base, waits, then comes back. In the full platform, Cognispark would unpack this with visuals,
          guided questions, targeted corrections, and teacher-ready follow-through. This public mission shows that logic in miniature.
        </p>
      </div>

      <div className={styles.missionWorkspace}>
        <div className={styles.graphShell}>
          <div className={styles.graphHeader}>
            <div>
              <p className={styles.graphEyebrow}>Mission console</p>
              <h3>Rover return run</h3>
            </div>
            <div className={styles.progressChip}>
              {correctCount}/{QUESTIONS.length} mission checks locked in
              <span>{answeredCount}/{QUESTIONS.length} attempted</span>
            </div>
          </div>

          <div className={styles.readoutBand}>
            <div className={styles.readoutCard}>
              <span>Mission time</span>
              <strong>{time.toFixed(1)} s</strong>
            </div>
            <div className={styles.readoutCard}>
              <span>Distance from base</span>
              <strong>{currentDistance.toFixed(0)} m</strong>
            </div>
            <div className={styles.readoutNarrative}>
              At {time.toFixed(1)} seconds, the rover is <strong>{currentDescription}</strong>.
            </div>
          </div>

          <div className={styles.sliderPanel}>
            <label htmlFor="mission-time" className={styles.sliderLabel}>
              Scrub through the mission timeline
            </label>
            <input
              id="mission-time"
              className={styles.slider}
              type="range"
              min={0}
              max={8}
              step={0.1}
              value={time}
              onChange={(event) => setTime(Number(event.target.value))}
            />
            <div className={styles.sliderScale}>
              {[0, 2, 4, 6, 8].map((mark) => (
                <span key={mark}>{mark}s</span>
              ))}
            </div>
          </div>

          <div className={styles.graphBoard}>
            <svg
              viewBox={`0 0 ${GRAPH_FRAME.width} ${GRAPH_FRAME.height}`}
              className={styles.graph}
              role="img"
              aria-label="Distance-time graph for a rover that moves away, stops, and then returns"
            >
              {[0, 6, 12, 18, 24].map((distance) => (
                <g key={distance}>
                  <line
                    x1={GRAPH_FRAME.left}
                    y1={graphY(distance)}
                    x2={GRAPH_FRAME.width - GRAPH_FRAME.right}
                    y2={graphY(distance)}
                    className={styles.gridLine}
                  />
                  <text x={GRAPH_FRAME.left - 16} y={graphY(distance) + 5} className={styles.axisLabel}>
                    {distance}
                  </text>
                </g>
              ))}
              {[0, 2, 4, 6, 8].map((mark) => (
                <g key={mark}>
                  <line
                    x1={graphX(mark)}
                    y1={GRAPH_FRAME.top}
                    x2={graphX(mark)}
                    y2={GRAPH_FRAME.height - GRAPH_FRAME.bottom}
                    className={styles.gridLine}
                  />
                  <text x={graphX(mark)} y={GRAPH_FRAME.height - 14} textAnchor="middle" className={styles.axisLabel}>
                    {mark}
                  </text>
                </g>
              ))}

              <line
                x1={GRAPH_FRAME.left}
                y1={GRAPH_FRAME.height - GRAPH_FRAME.bottom}
                x2={GRAPH_FRAME.width - GRAPH_FRAME.right}
                y2={GRAPH_FRAME.height - GRAPH_FRAME.bottom}
                className={styles.axisLine}
              />
              <line
                x1={GRAPH_FRAME.left}
                y1={GRAPH_FRAME.top}
                x2={GRAPH_FRAME.left}
                y2={GRAPH_FRAME.height - GRAPH_FRAME.bottom}
                className={styles.axisLine}
              />

              <text x={GRAPH_FRAME.width / 2} y={GRAPH_FRAME.height - 2} textAnchor="middle" className={styles.axisTitle}>
                Time (s)
              </text>
              <text
                x={18}
                y={GRAPH_FRAME.height / 2}
                textAnchor="middle"
                transform={`rotate(-90 18 ${GRAPH_FRAME.height / 2})`}
                className={styles.axisTitle}
              >
                Distance from base (m)
              </text>

              {GRAPH_SEGMENTS.map((segment) => (
                <g key={segment.label}>
                  <line
                    x1={graphX(segment.startTime)}
                    y1={graphY(segment.startDistance)}
                    x2={graphX(segment.endTime)}
                    y2={graphY(segment.endDistance)}
                    className={styles.segmentLine}
                  />
                  <text
                    x={(graphX(segment.startTime) + graphX(segment.endTime)) / 2}
                    y={Math.min(graphY(segment.startDistance), graphY(segment.endDistance)) - 12}
                    textAnchor="middle"
                    className={styles.segmentLabel}
                  >
                    {segment.label}
                  </text>
                </g>
              ))}

              <line
                x1={activePoint.x}
                y1={GRAPH_FRAME.top}
                x2={activePoint.x}
                y2={GRAPH_FRAME.height - GRAPH_FRAME.bottom}
                className={styles.focusLine}
              />
              <line
                x1={GRAPH_FRAME.left}
                y1={activePoint.y}
                x2={activePoint.x}
                y2={activePoint.y}
                className={styles.focusLine}
              />
              <circle cx={activePoint.x} cy={activePoint.y} r={10} className={styles.focusPointGlow} />
              <circle cx={activePoint.x} cy={activePoint.y} r={5} className={styles.focusPoint} />
            </svg>
          </div>

          <div className={styles.graphLegend}>
            <div>
              <strong>Segment A</strong>
              <span>moving away quickly</span>
            </div>
            <div>
              <strong>Segment B</strong>
              <span>stopped at constant distance</span>
            </div>
            <div>
              <strong>Segment C</strong>
              <span>returning more slowly</span>
            </div>
          </div>
        </div>

        <div className={styles.challengeColumn}>
          <div className={styles.challengeHeader}>
            <p className={styles.graphEyebrow}>Mission checks</p>
            <h3>Read the graph, then answer the checks</h3>
            <p>Use the graph story first, then choose the answer that matches what the rover is doing.</p>
          </div>

          <section className={styles.clarityPanel} aria-label="Mission clarity route">
            <div className={styles.clarityHeader}>
              <p className={styles.graphEyebrow}>Clarity route</p>
              <h3>Use this route before you commit</h3>
            </div>
            <div className={styles.clarityGrid}>
              {CLARITY_ROUTE.map((card) => (
                <article key={card.label} className={styles.clarityCard}>
                  <p className={styles.clarityLabel}>{card.label}</p>
                  <p className={styles.clarityValue}>{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.progressRail} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${missionProgress}%` }} />
          </div>

          <div className={styles.questionList}>
            {QUESTIONS.map((question, index) => {
              const selectedAnswer = answers[question.key];
              const selectedOption = question.options.find((option) => option.value === selectedAnswer);
              const answeredCorrectly = selectedAnswer === question.answer;
              const misconceptionSummary =
                !answeredCorrectly && selectedOption?.misconceptionTag
                  ? misconceptionSummaryForTag(selectedOption.misconceptionTag)
                  : null;

              return (
                <article key={question.key} className={styles.questionCard}>
                  <div className={styles.questionTop}>
                    <span className={styles.questionIndex}>Check {index + 1}</span>
                    <div className={styles.questionPromptBlock}>
                      <h4>{question.prompt}</h4>
                      <p>{question.hint}</p>
                    </div>
                  </div>

                  <div className={styles.optionGrid}>
                    {question.options.map((option) => {
                      const isSelected = selectedAnswer === option.value;
                      const isCorrect = question.answer === option.value;
                      const stateClass = isSelected
                        ? isCorrect
                          ? styles.optionCorrect
                          : styles.optionIncorrect
                        : "";

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`${styles.optionButton} ${stateClass}`}
                          onClick={() => handleAnswer(question.key, option.value, option.misconceptionTag)}
                          aria-pressed={isSelected}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption ? (
                    <div className={`${styles.feedbackPanel} ${answeredCorrectly ? styles.feedbackGood : styles.feedbackNeedsWork}`}>
                      <strong>{answeredCorrectly ? "Good read." : "Useful correction."}</strong>
                      <p>{selectedOption.feedback}</p>
                      {misconceptionSummary ? (
                        <div className={styles.repairPanel}>
                          <strong>Try this correction</strong>
                          <div className={styles.repairGrid}>
                            <div className={styles.repairBlock}>
                              <p className={styles.reasoningLabel}>What got mixed up</p>
                              <p>{misconceptionSummary.diagnosis}</p>
                            </div>
                            <div className={styles.repairBlock}>
                              <p className={styles.reasoningLabel}>Why that reasoning breaks</p>
                              <p>{misconceptionSummary.repair}</p>
                            </div>
                            <div className={styles.repairBlock}>
                              <p className={styles.reasoningLabel}>What to notice next</p>
                              <p>{misconceptionSummary.noticeNext}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div
            className={`${styles.debriefCard} ${allChecksCorrect ? styles.debriefComplete : ""}`}
            aria-label="Mission debrief"
            aria-live="polite"
            role="region"
          >
            <p className={styles.graphEyebrow}>Mission debrief</p>
            <h3>
              {allChecksCorrect
                ? "You just used slope, flat-line meaning, and interpolation the way a stronger physics learner does."
                : "The key move is to read line shape as motion meaning, not as picture matching."}
            </h3>
            <p>
              In the full platform, this is where Cognispark would chain the graph idea into worked examples, targeted correction, and the next module lesson.
            </p>
            {allChecksCorrect ? (
              <div className={styles.masterySnapshot}>
                <div className={styles.masteryHeader}>
                  <span>Mastery snapshot</span>
                  <strong>Graph meaning mission complete</strong>
                </div>
                <div className={styles.masteryGrid}>
                  <article>
                    <span>Core idea</span>
                    <strong>Graphs are records, not road pictures.</strong>
                  </article>
                  <article>
                    <span>Clean read</span>
                    <strong>Flat means distance stayed fixed while time moved on.</strong>
                  </article>
                  <article>
                    <span>Transfer move</span>
                    <strong>Use slope and segment rate before grabbing endpoints.</strong>
                  </article>
                </div>
                <div className={styles.repairMemory}>
                  <p className={styles.reasoningLabel}>What Cognispark would remember</p>
                  {capturedRepairs.length > 0 ? (
                    <ul>
                      {capturedRepairs.map((repair) => (
                        <li key={repair.tag}>
                          <strong>{repair.title}:</strong> {repair.noticeNext}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No repair path was needed this time. The next step should stretch the same idea in a new graph.</p>
                  )}
                </div>
                <div className={styles.debriefActions}>
                  <a href="/graph-lab" className={styles.primaryButton}>
                    Open graph lab
                  </a>
                  <a href="/register" className={styles.secondaryButton}>
                    Save progress
                  </a>
                  <a href="/learn" className={styles.secondaryButton}>
                    See full route
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
