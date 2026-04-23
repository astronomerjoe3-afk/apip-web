"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import M1SimulationPanels from "../../components/M1SimulationPanels";
import styles from "./graphLab.module.css";

type LabKey = "M1_L1" | "M1_L2" | "M1_L5" | "M1_L6";

type LabOption = {
  value: string;
  label: string;
  feedback: string;
};

type LabCheckpoint = {
  prompt: string;
  hint: string;
  answer: string;
  options: LabOption[];
};

type LabDefinition = {
  key: LabKey;
  label: string;
  title: string;
  summary: string;
  signal: string;
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
        },
        {
          value: "turning-around",
          label: "The object has turned around automatically.",
          feedback: "A flat section says nothing about turning around by itself. It only says the distance stayed constant.",
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
        },
        {
          value: "acceleration",
          label: "The acceleration for the whole segment.",
          feedback: "Close, but acceleration comes from the slope, not the height.",
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
        },
        {
          value: "highest-point",
          label: "Which graph has the higher top point.",
          feedback: "That might matter for height questions, but slope meaning still comes from the axes first.",
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
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 4,
      simVectorAngle: 10,
      simBias: 2,
    },
    checkpoint: {
      prompt: "Why does the area under a speed-time graph represent total distance?",
      hint: "Think about the units made by the vertical and horizontal axes together.",
      answer: "speed-time",
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
        },
        {
          value: "highest-speed",
          label: "Because the highest speed always equals the total distance.",
          feedback: "That is the trap. Highest speed is only one value. Total distance comes from the whole area over time.",
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
  const solvedCount = useMemo(
    () => LABS.filter((lab) => answers[lab.key] === lab.checkpoint.answer).length,
    [answers],
  );

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
            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>Checkpoint</p>
              <h3>{activeLab.label}</h3>
              <div className={styles.questionPrompt}>{activeLab.checkpoint.prompt}</div>
              <p className={styles.questionHint}>{activeLab.checkpoint.hint}</p>

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
                </div>
              ) : (
                <div className={styles.feedbackPanel}>
                  <strong>Choose one answer</strong>
                  <p>The fastest way to use this lab well is: move the controls, make a prediction, then commit.</p>
                </div>
              )}
            </div>

            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>What to notice</p>
              <h3>Why this matters</h3>
              <ul className={styles.noticeList}>
                <li>Cognispark treats graphs as physical stories before procedures.</li>
                <li>The lab reacts immediately, so students can test one misconception at a time.</li>
                <li>This is the same motion route students continue inside the full platform.</li>
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
          <Link href="/mission-demo" className={styles.secondaryButton}>
            Try the public mission
          </Link>
        </div>
      </section>
    </main>
  );
}
