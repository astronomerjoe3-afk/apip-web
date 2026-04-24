"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { misconceptionSummaryForTag } from "@/lib/misconceptionRepair";
import M1SimulationPanels from "../../components/M1SimulationPanels";
import styles from "./graphLab.module.css";

type LabKey = "M1_L1" | "M1_L2" | "M1_L5" | "M1_L6";

type LabOption = {
  value: string;
  label: string;
  feedback: string;
  misconceptionTag?: string;
};

type LabCheckpoint = {
  prompt: string;
  hint: string;
  answer: string;
  focus: string;
  watchFor: string;
  difficulty: "Foundation" | "Core" | "Advanced";
  options: LabOption[];
};

type LabClarity = {
  happening: string;
  notice: string;
  changes: string;
  staysSame: string;
  commonMistake: string;
  examCheck: string;
};

type LabDefinition = {
  key: LabKey;
  label: string;
  title: string;
  summary: string;
  signal: string;
  clarity: LabClarity;
  starter: {
    simMetricMeters: number;
    simVectorMagnitude: number;
    simVectorAngle: number;
    simBias: number;
  };
  checkpoint: LabCheckpoint;
};

const LABS: LabDefinition[] = [
  {
    key: "M1_L1",
    label: "Story board",
    title: "Read a distance-time graph as a story of what actually happened.",
    summary:
      "Move the pace and pause controls, then compare two journeys that can finish at the same point while telling very different motion stories.",
    signal: "Height tracks distance. Slope tracks speed. A flat strip means the object is stopped while time keeps moving.",
    clarity: {
      happening: "The rover moves away from base, pauses while time keeps running, then returns toward base.",
      notice: "Read the graph one segment at a time. Upward means farther away, flat means stopped, and downward means coming back.",
      changes: "The slope and direction change from segment to segment, so the motion story changes too.",
      staysSame: "The axes do not change meaning: time stays on the horizontal axis and distance from base stays on the vertical axis.",
      commonMistake: "Treating a flat line as 'nothing is happening' instead of 'time is still passing while distance stays constant'.",
      examCheck: "Choose the statement that best matches what one segment says about the motion.",
    },
    starter: {
      simMetricMeters: 2,
      simVectorMagnitude: 6,
      simVectorAngle: 3,
      simBias: 2,
    },
    checkpoint: {
      prompt: "If the graph stays flat while time continues, what is the right interpretation?",
      hint: "A flat segment means the recorded distance is not changing.",
      answer: "stopped",
      focus: "Interpreting flat graph segments",
      watchFor: "reading a flat line as no time passing",
      difficulty: "Foundation",
      options: [
        {
          value: "stopped",
          label: "The object is stopped at a constant distance.",
          feedback: "Exactly. Time keeps moving, but the distance value does not change, so the object is stationary.",
        },
        {
          value: "speeding-up",
          label: "The object is speeding up rapidly.",
          feedback: "Not this time. Speeding up would change the slope, not flatten it.",
          misconceptionTag: "flat_line_time_confusion",
        },
        {
          value: "turning-around",
          label: "The object has turned around automatically.",
          feedback: "A flat section says nothing about turning around by itself. It only says the distance stayed constant.",
          misconceptionTag: "flat_line_time_confusion",
        },
      ],
    },
  },
  {
    key: "M1_L2",
    label: "Pace log",
    title: "Separate graph height from graph slope on a speed-time graph.",
    summary:
      "Compare one instant with one interval so speed-at-the-moment and change-of-speed stop collapsing into one idea.",
    signal: "Height gives speed now. Slope gives acceleration over the interval. A flat line above zero still means motion.",
    clarity: {
      happening: "You are reading a speed-time graph where the line height and the line steepness tell different physics ideas.",
      notice: "Look at one instant first: the line height gives the speed value right then.",
      changes: "The slope changes when the speed is increasing or decreasing across an interval.",
      staysSame: "A flat line above zero still means the object is moving, because the speed value stays constant instead of dropping to zero.",
      commonMistake: "Reading height as distance or acceleration just because those are familiar quantities from other graphs.",
      examCheck: "Use the axis meaning first, then decide whether the question is asking for speed or for how speed changes.",
    },
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 4,
      simVectorAngle: 10,
      simBias: 2,
    },
    checkpoint: {
      prompt: "On a speed-time graph, what does the height of the line at one instant tell you?",
      hint: "Height answers the value on the vertical axis right then.",
      answer: "speed",
      focus: "Separating height from slope",
      watchFor: "mixing graph height with distance or acceleration",
      difficulty: "Foundation",
      options: [
        {
          value: "speed",
          label: "The speed at that instant.",
          feedback: "Right. Height on a speed-time graph tells the speed at that moment.",
        },
        {
          value: "distance",
          label: "The total distance travelled so far.",
          feedback: "That is a common mix-up. Distance is not read directly from graph height on a speed-time graph.",
          misconceptionTag: "height_vs_slope_confusion",
        },
        {
          value: "acceleration",
          label: "The acceleration for the whole segment.",
          feedback: "Close, but acceleration comes from the slope, not the height.",
          misconceptionTag: "height_vs_slope_confusion",
        },
      ],
    },
  },
  {
    key: "M1_L5",
    label: "Gradient meaning",
    title: "See why the same steepness can mean different physics on different graphs.",
    summary:
      "Hold one common tilt across two graph families so the axes, not the appearance, decide whether the slope means speed or acceleration.",
    signal: "You have to name the axes before you name the quantity. Same steepness does not guarantee the same meaning.",
    clarity: {
      happening: "Two graphs can look equally steep while describing different physics quantities.",
      notice: "Name the axes before you name the slope. The same geometry does not force the same meaning.",
      changes: "The graph family changes: distance-time and speed-time graphs use slope differently.",
      staysSame: "Steepness still compares rise with run, but the quantity behind that rise and run depends on the axes.",
      commonMistake: "Assuming 'steeper always means faster' even when the graph might be showing speed against time.",
      examCheck: "Identify the axes first, then choose the quantity the slope represents on that graph.",
    },
    starter: {
      simMetricMeters: 2,
      simVectorMagnitude: 3,
      simVectorAngle: 4,
      simBias: 2,
    },
    checkpoint: {
      prompt: "Two graphs have the same steepness. What must you decide first before naming the slope?",
      hint: "The graph family changes the meaning of the same geometry.",
      answer: "axes",
      focus: "Identifying slope meaning from axes",
      watchFor: "assuming the same steepness always means the same quantity",
      difficulty: "Core",
      options: [
        {
          value: "axes",
          label: "Which axes the graph is using.",
          feedback: "Exactly. The axes decide whether the slope means speed, acceleration, or something else.",
        },
        {
          value: "color",
          label: "Which line color is darker.",
          feedback: "Color is only visual styling here. The physics meaning comes from the axes.",
          misconceptionTag: "slope_meaning_confusion",
        },
        {
          value: "highest-point",
          label: "Which graph has the higher top point.",
          feedback: "That might matter for height questions, but slope meaning still comes from the axes first.",
          misconceptionTag: "slope_meaning_confusion",
        },
      ],
    },
  },
  {
    key: "M1_L6",
    label: "Area builder",
    title: "Turn area under a speed-time graph into total distance with shape logic.",
    summary:
      "Split the shaded region into rectangle and triangle parts, then watch different graph shapes still produce the same total distance when the area matches.",
    signal: "Area works here because speed multiplied by time gives distance. Rectangle plus triangle rebuilds the total.",
    clarity: {
      happening: "The shaded region under the speed-time graph is being rebuilt as simple shapes so total distance becomes visible.",
      notice: "Each rectangle or triangle is a speed multiplied by a time width.",
      changes: "The graph shape can change, but the total distance stays tied to the total shaded area.",
      staysSame: "The unit logic stays fixed: speed x time still gives distance across every shape.",
      commonMistake: "Treating the line itself as the distance instead of using the whole area beneath it.",
      examCheck: "Explain why the shaded area represents total distance before choosing the correct statement.",
    },
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 4,
      simVectorAngle: 10,
      simBias: 2,
    },
    checkpoint: {
      prompt: "Which statement best explains why the area under a speed-time graph represents total distance?",
      hint: "Think about the units made by the vertical and horizontal axes together.",
      answer: "speed-time",
      focus: "Linking area to distance",
      watchFor: "treating the line itself as total distance",
      difficulty: "Core",
      options: [
        {
          value: "speed-time",
          label: "Because speed multiplied by time gives distance.",
          feedback: "Yes. The area combines speed height and time width, so the units become distance.",
        },
        {
          value: "line-length",
          label: "Because the line itself measures how far the object went.",
          feedback: "Not quite. The line length is not the physics quantity here; the shaded area is.",
          misconceptionTag: "area_under_graph_confusion",
        },
        {
          value: "highest-speed",
          label: "Because the highest speed always equals the total distance.",
          feedback: "That is the trap. Highest speed is only one value. Total distance comes from the whole area over time.",
          misconceptionTag: "area_under_graph_confusion",
        },
      ],
    },
  },
];

function formatSimulationNumber(value: number, digits = 1): string {
  return Number(value).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export default function GraphReasoningLabClient() {
  const [activeLabKey, setActiveLabKey] = useState<LabKey>("M1_L1");
  const [simMetricMeters, setSimMetricMeters] = useState<number>(2);
  const [simVectorMagnitude, setSimVectorMagnitude] = useState<number>(6);
  const [simVectorAngle, setSimVectorAngle] = useState<number>(3);
  const [simDensityMass, setSimDensityMass] = useState<number>(5);
  const [simDensityVolume, setSimDensityVolume] = useState<number>(2);
  const [simFluidDensity, setSimFluidDensity] = useState<number>(3);
  const [simBias, setSimBias] = useState<number>(2);
  const [answers, setAnswers] = useState<Partial<Record<LabKey, string>>>({});

  const activeLab = useMemo(
    () => LABS.find((lab) => lab.key === activeLabKey) || LABS[0],
    [activeLabKey],
  );

  useEffect(() => {
    setSimMetricMeters(activeLab.starter.simMetricMeters);
    setSimVectorMagnitude(activeLab.starter.simVectorMagnitude);
    setSimVectorAngle(activeLab.starter.simVectorAngle);
    setSimBias(activeLab.starter.simBias);
  }, [activeLab]);

  const activeAnswer = answers[activeLab.key];
  const activeOption = activeLab.checkpoint.options.find((option) => option.value === activeAnswer) || null;
  const checkpointSolved = activeAnswer === activeLab.checkpoint.answer;
  const misconceptionSummary =
    !checkpointSolved && activeOption?.misconceptionTag
      ? misconceptionSummaryForTag(activeOption.misconceptionTag)
      : null;
  const activeLabIndex = LABS.findIndex((lab) => lab.key === activeLab.key) + 1;
  const solvedCount = useMemo(
    () => LABS.filter((lab) => answers[lab.key] === lab.checkpoint.answer).length,
    [answers],
  );
  const clarityCards = [
    { label: "What is happening", body: activeLab.clarity.happening },
    { label: "What to notice", body: activeLab.clarity.notice },
    { label: "What changes", body: activeLab.clarity.changes },
    { label: "What stays the same", body: activeLab.clarity.staysSame },
    { label: "Common mistake", body: activeLab.clarity.commonMistake },
    { label: "Exam-style check", body: activeLab.clarity.examCheck },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroNav}>
          <Link href="/" className={styles.homeLink}>
            Cognispark
          </Link>
          <div className={styles.heroNavActions}>
              <Link href="/login" className={styles.navLink} prefetch={false}>
                Login
              </Link>
              <Link href="/register" className={styles.navButton} prefetch={false}>
                Create account
              </Link>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Graph reasoning lab</p>
            <h1>Use graph meaning like a physics tool, not a memorised trick.</h1>
            <p className={styles.heroText}>
              The Graph Reasoning Lab turns four high-value motion-graph moves into one public workspace: story
              reading, speed-time interpretation, slope meaning, and area-as-distance. No login required.
            </p>

            <div className={styles.heroActions}>
              <a href="#lab-workspace" className={styles.primaryButton}>
                Open the lab
              </a>
              <Link href="/energy-ledger" className={styles.secondaryButton}>
                Plan energy ledgers
              </Link>
              <Link href="/force-builder" className={styles.secondaryButton}>
                Build force systems
              </Link>
              <Link href="/learn" className={styles.secondaryButton}>
                Explore full coverage
              </Link>
            </div>

            <div className={styles.signalRow}>
              <article className={styles.signalCard}>
                <span>Lab units</span>
                <strong>4 graph reasoning modes</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Student feel</span>
                <strong>Move sliders, compare cases, lock meaning</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Built from the route</span>
                <strong>Powered by the same graph lessons students keep using after signup</strong>
              </article>
            </div>
          </div>

          <div className={styles.heroBoard}>
            <p className={styles.boardEyebrow}>What this lab trains</p>
            <h2>Students should know what a graph says before they calculate from it.</h2>
            <div className={styles.boardList}>
              <article className={styles.boardItem}>
                <span>01</span>
                <div>
                  <strong>Story before equation</strong>
                  <p>Read pauses, returns, and steady motion from the graph as a physical story.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>02</span>
                <div>
                  <strong>Slope before shortcut</strong>
                  <p>Separate height from slope, and compare the same tilt across graph types without guessing.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>03</span>
                <div>
                  <strong>Area with meaning</strong>
                  <p>Build total distance from simple graph regions instead of treating area as magic.</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="lab-workspace">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Graph reasoning lab</p>
          <h2>Choose one reasoning move and push it until it becomes obvious.</h2>
          <p>
            Each mode gives you one focused graph idea, one live explorer, and one checkpoint that tells you whether the
            meaning actually landed.
          </p>
        </div>

        <div className={styles.labTabs} role="tablist" aria-label="Graph reasoning modes">
          {LABS.map((lab) => {
            const isActive = lab.key === activeLab.key;
            const isSolved = answers[lab.key] === lab.checkpoint.answer;

            return (
              <button
                key={lab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.labTab} ${isActive ? styles.labTabActive : ""}`}
                onClick={() => setActiveLabKey(lab.key)}
              >
                <span className={styles.labTabLabel}>{lab.label}</span>
                <strong>{lab.title}</strong>
                <small>{isSolved ? "Checkpoint solved" : lab.signal}</small>
              </button>
            );
          })}
        </div>

        <div className={styles.labShell}>
          <div className={styles.labWorkspace}>
            <div className={styles.labHeading}>
              <div>
                <p className={styles.workspaceEyebrow}>Live explorer</p>
                <h3>{activeLab.title}</h3>
              </div>
              <div className={styles.progressChip}>{solvedCount}/{LABS.length} checkpoints solved</div>
            </div>

            <p className={styles.labSummary}>{activeLab.summary}</p>

            <section className={styles.clarityPanel} aria-label="Concept-first clarity route">
              <div className={styles.clarityHeader}>
                <p className={styles.questionIndex}>Clarity route</p>
                <h4>Understand the physics before you answer</h4>
                <p className={styles.clarityLead}>
                  Move the controls, say what changed and what stayed the same, then use the check like an exam question.
                </p>
              </div>
              <div className={styles.clarityGrid}>
                {clarityCards.map((card) => (
                  <article key={card.label} className={styles.clarityCard}>
                    <p className={styles.clarityLabel}>{card.label}</p>
                    <p className={styles.clarityValue}>{card.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <M1SimulationPanels
              lessonKey={activeLab.key}
              simMetricMeters={simMetricMeters}
              setSimMetricMeters={setSimMetricMeters}
              simVectorMagnitude={simVectorMagnitude}
              setSimVectorMagnitude={setSimVectorMagnitude}
              simVectorAngle={simVectorAngle}
              setSimVectorAngle={setSimVectorAngle}
              simDensityMass={simDensityMass}
              setSimDensityMass={setSimDensityMass}
              simDensityVolume={simDensityVolume}
              setSimDensityVolume={setSimDensityVolume}
              simFluidDensity={simFluidDensity}
              setSimFluidDensity={setSimFluidDensity}
              simBias={simBias}
              setSimBias={setSimBias}
              formatSimulationNumber={formatSimulationNumber}
            />
          </div>

          <aside className={styles.challengeColumn}>
            <div key={activeLab.key} className={`${styles.challengeCard} ${styles.checkpointCard}`}>
              <div className={styles.questionMeta}>
                <div>
                  <p className={styles.questionIndex}>Exam-style check</p>
                  <h3>{activeLab.label}</h3>
                </div>
                <span className={styles.questionStatusPill}>Mode {activeLabIndex} of {LABS.length}</span>
              </div>
              <p className={styles.questionRoute}>{activeLab.title}</p>
              <div className={styles.questionPrompt} aria-live="polite">{activeLab.checkpoint.prompt}</div>
              <p className={styles.questionHint}>{activeLab.checkpoint.hint}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaBadge}>Focus: {activeLab.checkpoint.focus}</span>
                <span className={styles.metaBadge}>Difficulty: {activeLab.checkpoint.difficulty}</span>
                <span className={styles.metaBadge}>Watch for: {activeLab.checkpoint.watchFor}</span>
              </div>

              <div className={styles.reasoningPanel}>
                <div className={styles.reasoningBlock}>
                  <p className={styles.reasoningLabel}>Intuition first</p>
                  <p>{activeLab.clarity.notice}</p>
                </div>
                <div className={styles.reasoningBlock}>
                  <p className={styles.reasoningLabel}>Exam move</p>
                  <p>{activeLab.clarity.examCheck}</p>
                </div>
              </div>

              <div className={styles.optionList}>
                {activeLab.checkpoint.options.map((option) => {
                  const isChosen = activeAnswer === option.value;
                  const isCorrectChoice = option.value === activeLab.checkpoint.answer;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.optionButton} ${
                        isChosen ? (isCorrectChoice ? styles.optionButtonCorrect : styles.optionButtonSelected) : ""
                      }`}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [activeLab.key]: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {activeOption ? (
                <div className={`${styles.feedbackPanel} ${checkpointSolved ? styles.feedbackCorrect : styles.feedbackNeutral}`}>
                  <strong>{checkpointSolved ? "Locked in" : "Good catch to work through"}</strong>
                  <p>{activeOption.feedback}</p>
                  <div className={styles.feedbackBreakdown}>
                    <div>
                      <p className={styles.reasoningLabel}>{checkpointSolved ? "Why this is right" : "Why this answer falls short"}</p>
                      <p>{activeOption.feedback}</p>
                    </div>
                    <div>
                      <p className={styles.reasoningLabel}>Tempting wrong move</p>
                      <p>{activeLab.clarity.commonMistake}</p>
                    </div>
                    <div>
                      <p className={styles.reasoningLabel}>Exam move</p>
                      <p>{activeLab.clarity.examCheck}</p>
                    </div>
                  </div>
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
              ) : (
                <div className={styles.feedbackPanel}>
                  <strong>Choose one answer</strong>
                  <p>The fastest way to use this lab well is: move the controls, make a prediction, then commit.</p>
                </div>
              )}
            </div>

            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>Before you answer</p>
              <h3>Use this order</h3>
              <ul className={styles.noticeList}>
                <li>Name the graph story in plain language first.</li>
                <li>Say what changed and what stayed the same on the axes.</li>
                <li>Choose the option that matches the physics, not just the picture.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Next move</p>
          <h2>Keep the graph gains and step into the rest of the route.</h2>
          <p>
            Start here to sharpen graph meaning, then carry the same habits into the full platform with progression,
            saved memory, richer missions, and the rest of the physics pathway.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link href="/register" className={styles.primaryButton} prefetch={false}>
            Create account
          </Link>
          <Link href="/energy-ledger" className={styles.secondaryButton}>
            Plan energy ledgers
          </Link>
          <Link href="/force-builder" className={styles.secondaryButton}>
            Build force systems
          </Link>
          <Link href="/mission-demo" className={styles.secondaryButton}>
            Try the public mission
          </Link>
        </div>
      </section>
    </main>
  );
}
