"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import M3SimulationPanels from "../../components/M3SimulationPanels";
import styles from "../graph-lab/graphLab.module.css";

type WorkspaceKey = "M3_L1" | "M3_L2" | "M3_L4" | "M3_L5" | "M3_L6";

type WorkspaceOption = {
  value: string;
  label: string;
  feedback: string;
};

type WorkspaceCheckpoint = {
  prompt: string;
  hint: string;
  answer: string;
  options: WorkspaceOption[];
};

type WorkspaceDefinition = {
  key: WorkspaceKey;
  label: string;
  title: string;
  summary: string;
  signal: string;
  starter: {
    simMetricMeters: number;
    simVectorMagnitude: number;
    simVectorAngle: number;
    simDensityMass: number;
    simDensityVolume: number;
    simFluidDensity: number;
    simBias: number;
    simSpread: number;
  };
  checkpoint: WorkspaceCheckpoint;
};

const WORKSPACES: WorkspaceDefinition[] = [
  {
    key: "M3_L1",
    label: "Lift-Launch ledger",
    title: "Balance one input hand-off across useful gain, stores, and Leak Trail.",
    summary:
      "Split one machine input into useful gain and leak, then track how the useful share redistributes into height and motion stores.",
    signal: "Input hand-off must still equal useful gain plus leak after the split.",
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 420,
      simVectorAngle: 8,
      simDensityMass: 5,
      simDensityVolume: 8,
      simFluidDensity: 3,
      simBias: 55,
      simSpread: 70,
    },
    checkpoint: {
      prompt: "If the input hand-off is 420 J and 30% leaks away, what must be true about the useful gain?",
      hint: "The ledger still has to account for the full input after leak and useful parts are separated.",
      answer: "remaining-useful",
      options: [
        {
          value: "remaining-useful",
          label: "The useful gain must be the remaining 70% of the input.",
          feedback:
            "Exactly. Once 30% leaks, the rest is the useful gain that can be placed into stores.",
        },
        {
          value: "same-input",
          label: "The useful gain stays equal to the full input anyway.",
          feedback:
            "Not if part of the input leaks away. The ledger has to shrink the useful side when leak grows.",
        },
        {
          value: "stores-ignore-leak",
          label: "The stores can still add up to more than the useful gain if the mission is urgent.",
          feedback:
            "That breaks the ledger. Store gains must come from the useful part that remains after leaks are accounted for.",
        },
      ],
    },
  },
  {
    key: "M3_L2",
    label: "Height store",
    title: "See how mass, field strength, and height all shape gravitational store.",
    summary:
      "Compare the same load across two worlds so field strength stays visible instead of hiding inside a memorised shortcut.",
    signal: "Height store depends on mass, field strength, and height together.",
    starter: {
      simMetricMeters: 7,
      simVectorMagnitude: 8,
      simVectorAngle: 11,
      simDensityMass: 4,
      simDensityVolume: 9,
      simFluidDensity: 3,
      simBias: 40,
      simSpread: 65,
    },
    checkpoint: {
      prompt: "If the same load is raised to the same height on two worlds, what can still make the store different?",
      hint: "The comparison board keeps one factor visible on purpose.",
      answer: "field-strength",
      options: [
        {
          value: "field-strength",
          label: "A different field strength can change the store.",
          feedback:
            "Right. The same mass at the same height can have a different gravitational store if the field strength changes.",
        },
        {
          value: "height-only",
          label: "Only the height matters once the load is fixed.",
          feedback:
            "That is the shortcut trap. Height matters, but the field strength is part of the physics too.",
        },
        {
          value: "motion-only",
          label: "The store changes only if the load is moving faster.",
          feedback:
            "Speed belongs to motion store, not the gravitational store being compared here.",
        },
      ],
    },
  },
  {
    key: "M3_L4",
    label: "Energy hand-off",
    title: "Separate total work hand-off from the useful gain that survives leaks.",
    summary:
      "Change force, distance, and leak rate together, then compare the input hand-off against the useful energy that actually reaches the store.",
    signal: "Work can describe the total hand-off even when the useful gain is smaller.",
    starter: {
      simMetricMeters: 5,
      simVectorMagnitude: 12,
      simVectorAngle: 9,
      simDensityMass: 4,
      simDensityVolume: 8,
      simFluidDensity: 3,
      simBias: 35,
      simSpread: 25,
    },
    checkpoint: {
      prompt: "Why can the useful gain be smaller than the work hand-off on this board?",
      hint: "The board tracks something that happens after the input hand-off has already been counted.",
      answer: "leaks-reduce-useful",
      options: [
        {
          value: "leaks-reduce-useful",
          label: "Because some of the input hand-off leaks before it reaches the useful store.",
          feedback:
            "Yes. The total work hand-off can be larger than the useful gain when some energy leaks away during transfer.",
        },
        {
          value: "work-is-never-total",
          label: "Because work never measures the total transfer in the first place.",
          feedback:
            "Not here. This board uses work as the input hand-off and then separates useful output from losses.",
        },
        {
          value: "distance-cancels",
          label: "Because the distance cancels part of the force.",
          feedback:
            "Distance does not cancel force. It helps determine the input hand-off before leak is applied.",
        },
      ],
    },
  },
  {
    key: "M3_L5",
    label: "Rate and yield",
    title: "Keep power and efficiency separate when comparing machine performance.",
    summary:
      "Hold the same energy input while changing time and useful yield separately, so fast and efficient stop collapsing into one vague idea.",
    signal: "Power compares energy with time. Efficiency compares useful output with total input.",
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 1400,
      simVectorAngle: 8,
      simDensityMass: 4,
      simDensityVolume: 8,
      simFluidDensity: 3,
      simBias: 20,
      simSpread: 75,
    },
    checkpoint: {
      prompt: "A machine transfers the same total energy in less time but keeps the same useful yield. What definitely changes?",
      hint: "One quantity is tied directly to the transfer time.",
      answer: "power-rises",
      options: [
        {
          value: "power-rises",
          label: "Its power rises.",
          feedback:
            "Exactly. The same energy transferred in less time means a larger power value, even if efficiency stays unchanged.",
        },
        {
          value: "efficiency-rises",
          label: "Its efficiency must rise too.",
          feedback:
            "Not automatically. Efficiency only changes if the useful fraction changes.",
        },
        {
          value: "useful-fraction-falls",
          label: "Its useful fraction must fall because it is faster.",
          feedback:
            "Speed of transfer does not force a lower useful fraction. That is why the board keeps rate and yield separate.",
        },
      ],
    },
  },
  {
    key: "M3_L6",
    label: "Mission planner",
    title: "Solve a multi-stage energy mission in the right order.",
    summary:
      "Run the lift input through useful yield, then through launch leak, then compare the remaining motion store against the gate threshold.",
    signal: "Intermediate gains matter because one stage creates the input for the next stage.",
    starter: {
      simMetricMeters: 900,
      simVectorMagnitude: 1600,
      simVectorAngle: 8,
      simDensityMass: 5,
      simDensityVolume: 8,
      simFluidDensity: 3,
      simBias: 25,
      simSpread: 70,
    },
    checkpoint: {
      prompt: "What is the safest first move in this mission planner?",
      hint: "The final gate check only makes sense after the earlier stages have created the right intermediate quantity.",
      answer: "efficiency-first",
      options: [
        {
          value: "efficiency-first",
          label: "Find the useful lift gain first, then carry it into the next stage.",
          feedback:
            "Right. The useful gain from the first stage becomes the input for the next stage, so the planner has to run in sequence.",
        },
        {
          value: "gate-first",
          label: "Compare the lift input directly with the gate threshold first.",
          feedback:
            "That skips the whole mission logic. The gate is reached only after efficiency and launch leaks have reshaped the energy.",
        },
        {
          value: "final-leak-only",
          label: "Apply only the launch leak and ignore the useful yield stage.",
          feedback:
            "That drops a real stage from the mission. The planner is built to make the chain visible, not to compress it away.",
        },
      ],
    },
  },
];

function formatSimulationNumber(value: number, digits = 1): string {
  return Number(value).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export default function EnergyLedgerWorkspaceClient() {
  const [activeWorkspaceKey, setActiveWorkspaceKey] = useState<WorkspaceKey>("M3_L1");
  const [simMetricMeters, setSimMetricMeters] = useState<number>(4);
  const [simVectorMagnitude, setSimVectorMagnitude] = useState<number>(420);
  const [simVectorAngle, setSimVectorAngle] = useState<number>(8);
  const [simDensityMass, setSimDensityMass] = useState<number>(5);
  const [simDensityVolume, setSimDensityVolume] = useState<number>(8);
  const [simFluidDensity, setSimFluidDensity] = useState<number>(3);
  const [simBias, setSimBias] = useState<number>(55);
  const [simSpread, setSimSpread] = useState<number>(70);
  const [answers, setAnswers] = useState<Partial<Record<WorkspaceKey, string>>>({});

  const activeWorkspace = useMemo(
    () => WORKSPACES.find((workspace) => workspace.key === activeWorkspaceKey) || WORKSPACES[0],
    [activeWorkspaceKey],
  );

  useEffect(() => {
    setSimMetricMeters(activeWorkspace.starter.simMetricMeters);
    setSimVectorMagnitude(activeWorkspace.starter.simVectorMagnitude);
    setSimVectorAngle(activeWorkspace.starter.simVectorAngle);
    setSimDensityMass(activeWorkspace.starter.simDensityMass);
    setSimDensityVolume(activeWorkspace.starter.simDensityVolume);
    setSimFluidDensity(activeWorkspace.starter.simFluidDensity);
    setSimBias(activeWorkspace.starter.simBias);
    setSimSpread(activeWorkspace.starter.simSpread);
  }, [activeWorkspace]);

  const activeAnswer = answers[activeWorkspace.key];
  const activeOption =
    activeWorkspace.checkpoint.options.find((option) => option.value === activeAnswer) || null;
  const checkpointSolved = activeAnswer === activeWorkspace.checkpoint.answer;
  const solvedCount = useMemo(
    () => WORKSPACES.filter((workspace) => answers[workspace.key] === workspace.checkpoint.answer).length,
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
            <p className={styles.heroEyebrow}>Energy ledger workspace</p>
            <h1>Track where the energy goes before the calculation turns abstract.</h1>
            <p className={styles.heroText}>
              The Energy Ledger Workspace turns five high-value energy moves into one public tool: ledger balancing,
              gravitational store comparison, work hand-offs, power vs efficiency, and staged mission planning. No
              login required.
            </p>

            <div className={styles.heroActions}>
              <a href="#workspace" className={styles.primaryButton}>
                Open the workspace
              </a>
              <Link href="/force-builder" className={styles.secondaryButton}>
                Build force systems
              </Link>
              <Link href="/graph-lab" className={styles.secondaryButton}>
                Open graph lab
              </Link>
            </div>

            <div className={styles.signalRow}>
              <article className={styles.signalCard}>
                <span>Workspace modes</span>
                <strong>5 energy reasoning moves</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Student feel</span>
                <strong>Balance the ledger, compare the stores, then plan the mission path</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Built from the route</span>
                <strong>Powered by the same M3 energy lessons students keep using after signup</strong>
              </article>
            </div>
          </div>

          <div className={styles.heroBoard}>
            <p className={styles.boardEyebrow}>What this workspace trains</p>
            <h2>Energy gets clearer when students can see the accounting chain live.</h2>
            <div className={styles.boardList}>
              <article className={styles.boardItem}>
                <span>01</span>
                <div>
                  <strong>Ledger before algebra blur</strong>
                  <p>Balance input, useful gain, stores, and leaks so the energy story stays visible.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>02</span>
                <div>
                  <strong>Stores with context</strong>
                  <p>Compare field strength, pace, and load changes without collapsing them into one vague rule.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>03</span>
                <div>
                  <strong>Mission order that makes sense</strong>
                  <p>Run multi-stage energy problems in sequence so intermediate gains become real planning inputs.</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="workspace">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Energy ledger workspace</p>
          <h2>Choose one energy move and keep the accounting visible all the way through.</h2>
          <p>
            Each mode gives you one focused energy idea, one live explorer, and one checkpoint that shows whether the
            meaning really landed.
          </p>
        </div>

        <div className={styles.labTabs} role="tablist" aria-label="Energy ledger modes">
          {WORKSPACES.map((workspace) => {
            const isActive = workspace.key === activeWorkspace.key;
            const isSolved = answers[workspace.key] === workspace.checkpoint.answer;

            return (
              <button
                key={workspace.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.labTab} ${isActive ? styles.labTabActive : ""}`}
                onClick={() => setActiveWorkspaceKey(workspace.key)}
              >
                <span className={styles.labTabLabel}>{workspace.label}</span>
                <strong>{workspace.title}</strong>
                <small>{isSolved ? "Checkpoint solved" : workspace.signal}</small>
              </button>
            );
          })}
        </div>

        <div className={styles.labShell}>
          <div className={styles.labWorkspace}>
            <div className={styles.labHeading}>
              <div>
                <p className={styles.workspaceEyebrow}>Live explorer</p>
                <h3>{activeWorkspace.title}</h3>
              </div>
              <div className={styles.progressChip}>{solvedCount}/{WORKSPACES.length} checkpoints solved</div>
            </div>

            <p className={styles.labSummary}>{activeWorkspace.summary}</p>

            <M3SimulationPanels
              lessonKey={activeWorkspace.key}
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
              simSpread={simSpread}
              setSimSpread={setSimSpread}
              formatSimulationNumber={formatSimulationNumber}
            />
          </div>

          <aside className={styles.challengeColumn}>
            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>Checkpoint</p>
              <h3>{activeWorkspace.label}</h3>
              <div className={styles.questionPrompt}>{activeWorkspace.checkpoint.prompt}</div>
              <p className={styles.questionHint}>{activeWorkspace.checkpoint.hint}</p>

              <div className={styles.optionList}>
                {activeWorkspace.checkpoint.options.map((option) => {
                  const isChosen = activeAnswer === option.value;
                  const isCorrectChoice = option.value === activeWorkspace.checkpoint.answer;

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
                          [activeWorkspace.key]: option.value,
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
                  <p>The best way to use this workspace is simple: move the controls, balance the story, then commit.</p>
                </div>
              )}
            </div>

            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>What to notice</p>
              <h3>Why this matters</h3>
              <ul className={styles.noticeList}>
                <li>Energy reasoning gets stronger when students track stores, hand-offs, and leaks as one system.</li>
                <li>Power, efficiency, and useful gain belong to different questions, so the workspace keeps them separate.</li>
                <li>Longer mission problems get easier when each stage visibly creates the next stage’s input.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Next move</p>
          <h2>Keep the energy gains and step into the rest of the Cognispark route.</h2>
          <p>
            Start here to sharpen energy accounting, then carry the same habits into the full platform with progression,
            saved memory, richer lessons, and the rest of the physics pathway.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link href="/register" className={styles.primaryButton} prefetch={false}>
            Create account
          </Link>
          <Link href="/force-builder" className={styles.secondaryButton}>
            Build force systems
          </Link>
          <Link href="/graph-lab" className={styles.secondaryButton}>
            Open graph lab
          </Link>
        </div>
      </section>
    </main>
  );
}
