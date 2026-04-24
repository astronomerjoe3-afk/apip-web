"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import M2SimulationPanels from "../../components/M2SimulationPanels";
import styles from "../graph-lab/graphLab.module.css";

type ToolKey = "M2_L1" | "M2_L2" | "M2_L4" | "M2_L5";

type ToolOption = {
  value: string;
  label: string;
  feedback: string;
};

type ToolCheckpoint = {
  prompt: string;
  hint: string;
  answer: string;
  focus: string;
  watchFor: string;
  difficulty: "Foundation" | "Core" | "Advanced";
  options: ToolOption[];
};

type ToolClarity = {
  happening: string;
  notice: string;
  changes: string;
  staysSame: string;
  commonMistake: string;
  examCheck: string;
};

type ToolDefinition = {
  key: ToolKey;
  label: string;
  title: string;
  summary: string;
  signal: string;
  clarity: ToolClarity;
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
  checkpoint: ToolCheckpoint;
};

const TOOLS: ToolDefinition[] = [
  {
    key: "M2_L1",
    label: "Master arrow",
    title: "Collapse multiple pushes into one Master Arrow before predicting motion.",
    summary:
      "Slide the forward and backward arrows, then test how a craft can keep moving while the Master Arrow stays at zero.",
    signal: "Zero resultant force means zero acceleration, not automatically zero velocity.",
    clarity: {
      happening: "Several pushes act on the same craft, and the builder combines them into one resultant Master Arrow.",
      notice: "Look at the resultant on one object, not just the number of forces in the picture.",
      changes: "The individual pushes can change size and direction, so the resultant can grow, shrink, or drop to zero.",
      staysSame: "Motion changes only when the resultant on that object is non-zero; a moving craft can keep cruising when the resultant is zero.",
      commonMistake: "Assuming zero resultant force means zero motion instead of no change in velocity.",
      examCheck: "Use the resultant first, then choose the statement that best predicts the craft's motion.",
    },
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 8,
      simVectorAngle: 8,
      simDensityMass: 5,
      simDensityVolume: 4,
      simFluidDensity: 3,
      simBias: 2,
      simSpread: 4,
    },
    checkpoint: {
      prompt: "If the Master Arrow is zero while the craft is already moving, what follows?",
      hint: "A zero resultant means the velocity stops changing, not that motion must disappear.",
      answer: "constant-motion",
      focus: "Resultant force and motion change",
      watchFor: "assuming zero resultant means zero motion",
      difficulty: "Foundation",
      options: [
        {
          value: "constant-motion",
          label: "The craft can keep moving at constant velocity.",
          feedback:
            "Exactly. A zero Master Arrow means zero acceleration, so an already-moving craft can continue cruising steadily.",
        },
        {
          value: "instant-stop",
          label: "The craft must stop immediately.",
          feedback:
            "That is the classic trap. Stopping would require the velocity to change, which needs a non-zero resultant force.",
        },
        {
          value: "speed-up",
          label: "The craft must speed up because two forces are acting.",
          feedback:
            "Not if those forces balance. What matters for the motion change is the Master Arrow, not the force count alone.",
        },
      ],
    },
  },
  {
    key: "M2_L2",
    label: "Pair-force contrast",
    title: "Separate one-object resultants from third-law force pairs.",
    summary:
      "Compare the same force size across two craft and keep the stories apart: the resultant on one object versus an interaction pair across two objects.",
    signal: "Equal and opposite pair forces act on different objects, so they do not cancel on one object.",
    clarity: {
      happening: "Two interacting objects exert equal and opposite forces on each other, but each object still has its own free-body story.",
      notice: "Ask which object each force acts on before you decide whether forces can cancel.",
      changes: "The interaction pair changes which object feels which force, not the equality of the pair itself.",
      staysSame: "Third-law forces stay equal in size and opposite in direction, even when the objects have different masses.",
      commonMistake: "Cancelling an action-reaction pair inside one free-body diagram just because the arrows look equal and opposite.",
      examCheck: "Identify the object first, then choose the statement that correctly explains why the pair does or does not cancel.",
    },
    starter: {
      simMetricMeters: 4,
      simVectorMagnitude: 10,
      simVectorAngle: 8,
      simDensityMass: 3,
      simDensityVolume: 6,
      simFluidDensity: 3,
      simBias: 2,
      simSpread: 4,
    },
    checkpoint: {
      prompt: "Which statement best explains why an action-reaction pair does not cancel on one object?",
      hint: "Cancellation only happens when forces act on the same object in the same force diagram.",
      answer: "different-objects",
      focus: "Third-law pairs versus resultants",
      watchFor: "cancelling equal and opposite forces on different objects",
      difficulty: "Core",
      options: [
        {
          value: "different-objects",
          label: "Because the two forces act on different objects.",
          feedback:
            "Right. Third-law forces are equal and opposite, but they belong to two different objects, so they cannot cancel within one object's free-body diagram.",
        },
        {
          value: "different-times",
          label: "Because they happen at different times.",
          feedback:
            "They happen together. The reason they do not cancel is that they act on different objects, not different moments.",
        },
        {
          value: "bigger-mass",
          label: "Because the heavier object keeps the bigger force.",
          feedback:
            "Mass changes acceleration, not the force equality in a third-law pair. The key point is still which object each force acts on.",
        },
      ],
    },
  },
  {
    key: "M2_L4",
    label: "Torque reach",
    title: "See how the same push can turn harder when it acts farther from the pivot.",
    summary:
      "Vary force size and perpendicular reach, then compare torque directly so turning effect feels geometric instead of mysterious.",
    signal: "Torque depends on both the push size and the perpendicular distance from the pivot.",
    clarity: {
      happening: "The same push is being applied at different perpendicular distances from a pivot, so the turning effect changes.",
      notice: "Track the perpendicular reach from the pivot, not just the raw force size.",
      changes: "Torque changes when either the push size or the perpendicular distance changes.",
      staysSame: "A force through the pivot still has no turning effect, even if the push itself is large.",
      commonMistake: "Thinking torque is only about force size and forgetting where the force acts relative to the pivot.",
      examCheck: "Compare the reach first, then choose the option that best explains the turning effect.",
    },
    starter: {
      simMetricMeters: 1.1,
      simVectorMagnitude: 7,
      simVectorAngle: 7,
      simDensityMass: 4,
      simDensityVolume: 4,
      simFluidDensity: 0.5,
      simBias: 2,
      simSpread: 4,
    },
    checkpoint: {
      prompt: "With the same push size, what is the clearest way to increase the turning effect?",
      hint: "Focus on the perpendicular reach from the pivot.",
      answer: "farther-from-pivot",
      focus: "Torque and perpendicular distance",
      watchFor: "thinking torque depends on force size alone",
      difficulty: "Core",
      options: [
        {
          value: "farther-from-pivot",
          label: "Apply the force farther from the pivot.",
          feedback:
            "Yes. With force held fixed, increasing the perpendicular reach increases torque.",
        },
        {
          value: "through-pivot",
          label: "Move the push closer to the pivot line.",
          feedback:
            "That does the opposite. A force through the pivot gives no turning effect because the perpendicular reach falls to zero.",
        },
        {
          value: "same-reach",
          label: "Keep the same reach and only rename the force as torque.",
          feedback:
            "Torque is not just a new label. It changes when force or perpendicular distance changes.",
        },
      ],
    },
  },
  {
    key: "M2_L5",
    label: "Stability margin",
    title: "Track stability by the weight line, not by guesswork.",
    summary:
      "Slide the Balance Core across the base and watch stability change as the line of action moves toward or beyond the support edge.",
    signal: "A system stays stable while the weight line lands inside the support zone.",
    clarity: {
      happening: "The load's line of action is moving across the support base, so the system becomes more or less stable.",
      notice: "Watch where the weight line lands relative to the base, because that decides the tipping risk.",
      changes: "The position of the line of action changes as the load shifts or the balance point moves.",
      staysSame: "The support base keeps the same role: the load stays stable only while the weight line remains inside it.",
      commonMistake: "Using size, mass, or height alone to predict tipping without checking the line of action.",
      examCheck: "Use the weight-line position first, then choose the statement that best explains the stability change.",
    },
    starter: {
      simMetricMeters: 8,
      simVectorMagnitude: 6,
      simVectorAngle: 4,
      simDensityMass: 4,
      simDensityVolume: 4,
      simFluidDensity: 0.7,
      simBias: 1.5,
      simSpread: 4,
    },
    checkpoint: {
      prompt: "What is the clearest sign that a load is about to tip?",
      hint: "Watch where the weight line lands relative to the support base.",
      answer: "outside-base",
      focus: "Weight line and stability",
      watchFor: "predicting tipping from height or mass alone",
      difficulty: "Core",
      options: [
        {
          value: "outside-base",
          label: "The weight line moves beyond the support edge.",
          feedback:
            "Exactly. Once the line of action falls outside the base, tipping begins.",
        },
        {
          value: "tall-alone",
          label: "The object is tall, so it must tip automatically.",
          feedback:
            "Height can matter, but height alone does not decide stability. The key check is still where the line of action lands.",
        },
        {
          value: "heavy-alone",
          label: "The object becomes heavier, so it must tip automatically.",
          feedback:
            "Weight size matters for loads, but tipping still depends on the line of action relative to the support zone.",
        },
      ],
    },
  },
];

function formatSimulationNumber(value: number, digits = 1): string {
  return Number(value).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export default function ForceSystemBuilderClient() {
  const [activeToolKey, setActiveToolKey] = useState<ToolKey>("M2_L1");
  const [simMetricMeters, setSimMetricMeters] = useState<number>(4);
  const [simVectorMagnitude, setSimVectorMagnitude] = useState<number>(8);
  const [simVectorAngle, setSimVectorAngle] = useState<number>(8);
  const [simDensityMass, setSimDensityMass] = useState<number>(5);
  const [simDensityVolume, setSimDensityVolume] = useState<number>(4);
  const [simFluidDensity, setSimFluidDensity] = useState<number>(3);
  const [simBias, setSimBias] = useState<number>(2);
  const [simSpread, setSimSpread] = useState<number>(4);
  const [answers, setAnswers] = useState<Partial<Record<ToolKey, string>>>({});

  const activeTool = useMemo(
    () => TOOLS.find((tool) => tool.key === activeToolKey) || TOOLS[0],
    [activeToolKey],
  );

  useEffect(() => {
    setSimMetricMeters(activeTool.starter.simMetricMeters);
    setSimVectorMagnitude(activeTool.starter.simVectorMagnitude);
    setSimVectorAngle(activeTool.starter.simVectorAngle);
    setSimDensityMass(activeTool.starter.simDensityMass);
    setSimDensityVolume(activeTool.starter.simDensityVolume);
    setSimFluidDensity(activeTool.starter.simFluidDensity);
    setSimBias(activeTool.starter.simBias);
    setSimSpread(activeTool.starter.simSpread);
  }, [activeTool]);

  const activeAnswer = answers[activeTool.key];
  const activeOption = activeTool.checkpoint.options.find((option) => option.value === activeAnswer) || null;
  const checkpointSolved = activeAnswer === activeTool.checkpoint.answer;
  const activeToolIndex = TOOLS.findIndex((tool) => tool.key === activeTool.key) + 1;
  const solvedCount = useMemo(
    () => TOOLS.filter((tool) => answers[tool.key] === tool.checkpoint.answer).length,
    [answers],
  );
  const clarityCards = [
    { label: "What is happening", body: activeTool.clarity.happening },
    { label: "What to notice", body: activeTool.clarity.notice },
    { label: "What changes", body: activeTool.clarity.changes },
    { label: "What stays the same", body: activeTool.clarity.staysSame },
    { label: "Common mistake", body: activeTool.clarity.commonMistake },
    { label: "Exam-style check", body: activeTool.clarity.examCheck },
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
            <p className={styles.heroEyebrow}>Force system builder</p>
            <h1>Build the force story before you reach for the equation.</h1>
            <p className={styles.heroText}>
              The Force System Builder turns four high-value mechanics moves into one public workspace: resultant
              force, pair-force comparison, torque from reach, and stability from line of action. No login required.
            </p>

            <div className={styles.heroActions}>
              <a href="#lab-workspace" className={styles.primaryButton}>
                Open the builder
              </a>
              <Link href="/energy-ledger" className={styles.secondaryButton}>
                Plan energy ledgers
              </Link>
              <Link href="/graph-lab" className={styles.secondaryButton}>
                Open graph lab
              </Link>
              <Link href="/learn" className={styles.secondaryButton}>
                Explore full coverage
              </Link>
            </div>

            <div className={styles.signalRow}>
              <article className={styles.signalCard}>
                <span>Builder modes</span>
                <strong>4 mechanics reasoning moves</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Student feel</span>
                <strong>Move one variable, compare one force story, lock one idea</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Built from the route</span>
                <strong>Powered by the same forces and equilibrium lessons students keep using after signup</strong>
              </article>
            </div>
          </div>

          <div className={styles.heroBoard}>
            <p className={styles.boardEyebrow}>What this tool trains</p>
            <h2>Mechanics gets clearer when students can build the force system live.</h2>
            <div className={styles.boardList}>
              <article className={styles.boardItem}>
                <span>01</span>
                <div>
                  <strong>Resultant before motion guess</strong>
                  <p>Collapse multiple pushes into one Master Arrow before predicting what changes.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>02</span>
                <div>
                  <strong>Pairs without false cancellation</strong>
                  <p>Keep one-object resultants separate from equal-and-opposite forces across two objects.</p>
                </div>
              </article>
              <article className={styles.boardItem}>
                <span>03</span>
                <div>
                  <strong>Geometry with meaning</strong>
                  <p>Watch torque and stability change as reach, pivot, and support geometry shift.</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="lab-workspace">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Force system builder</p>
          <h2>Choose one mechanics move and make the force story obvious.</h2>
          <p>
            Each mode gives you one focused force idea, one live explorer, and one checkpoint that shows whether the
            concept actually landed.
          </p>
        </div>

        <div className={styles.labTabs} role="tablist" aria-label="Force system modes">
          {TOOLS.map((tool) => {
            const isActive = tool.key === activeTool.key;
            const isSolved = answers[tool.key] === tool.checkpoint.answer;

            return (
              <button
                key={tool.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.labTab} ${isActive ? styles.labTabActive : ""}`}
                onClick={() => setActiveToolKey(tool.key)}
              >
                <span className={styles.labTabLabel}>{tool.label}</span>
                <strong>{tool.title}</strong>
                <small>{isSolved ? "Checkpoint solved" : tool.signal}</small>
              </button>
            );
          })}
        </div>

        <div className={styles.labShell}>
          <div className={styles.labWorkspace}>
            <div className={styles.labHeading}>
              <div>
                <p className={styles.workspaceEyebrow}>Live explorer</p>
                <h3>{activeTool.title}</h3>
              </div>
              <div className={styles.progressChip}>{solvedCount}/{TOOLS.length} checkpoints solved</div>
            </div>

            <p className={styles.labSummary}>{activeTool.summary}</p>

            <section className={styles.clarityPanel} aria-label="Concept-first clarity route">
              <div className={styles.clarityHeader}>
                <p className={styles.questionIndex}>Clarity route</p>
                <h4>Understand the force idea before you answer</h4>
                <p className={styles.clarityLead}>
                  Move the controls, identify the physical story, then use the check like an exam question.
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

            <M2SimulationPanels
              lessonKey={activeTool.key}
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
            <div key={activeTool.key} className={`${styles.challengeCard} ${styles.checkpointCard}`}>
              <div className={styles.questionMeta}>
                <div>
                  <p className={styles.questionIndex}>Exam-style check</p>
                  <h3>{activeTool.label}</h3>
                </div>
                <span className={styles.questionStatusPill}>Mode {activeToolIndex} of {TOOLS.length}</span>
              </div>
              <p className={styles.questionRoute}>{activeTool.title}</p>
              <div className={styles.questionPrompt} aria-live="polite">{activeTool.checkpoint.prompt}</div>
              <p className={styles.questionHint}>{activeTool.checkpoint.hint}</p>

              <div className={styles.metaRow}>
                <span className={styles.metaBadge}>Focus: {activeTool.checkpoint.focus}</span>
                <span className={styles.metaBadge}>Difficulty: {activeTool.checkpoint.difficulty}</span>
                <span className={styles.metaBadge}>Watch for: {activeTool.checkpoint.watchFor}</span>
              </div>

              <div className={styles.reasoningPanel}>
                <div className={styles.reasoningBlock}>
                  <p className={styles.reasoningLabel}>Intuition first</p>
                  <p>{activeTool.clarity.notice}</p>
                </div>
                <div className={styles.reasoningBlock}>
                  <p className={styles.reasoningLabel}>Exam move</p>
                  <p>{activeTool.clarity.examCheck}</p>
                </div>
              </div>

              <div className={styles.optionList}>
                {activeTool.checkpoint.options.map((option) => {
                  const isChosen = activeAnswer === option.value;
                  const isCorrectChoice = option.value === activeTool.checkpoint.answer;

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
                          [activeTool.key]: option.value,
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
                      <p>{activeTool.clarity.commonMistake}</p>
                    </div>
                    <div>
                      <p className={styles.reasoningLabel}>Exam move</p>
                      <p>{activeTool.clarity.examCheck}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.feedbackPanel}>
                  <strong>Choose one answer</strong>
                  <p>The best way to use this builder is simple: move the controls, make a prediction, then commit.</p>
                </div>
              )}
            </div>

            <div className={styles.challengeCard}>
              <p className={styles.questionIndex}>Before you answer</p>
              <h3>Use this order</h3>
              <ul className={styles.noticeList}>
                <li>Name which object or pivot the force story is about.</li>
                <li>Say what changed and what stayed the same in the system.</li>
                <li>Choose the option that matches the force logic, not the visual clutter.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Next move</p>
          <h2>Keep the mechanics gains and step into the full Cognispark route.</h2>
          <p>
            Start here to sharpen force reasoning, then carry the same habits into the full platform with progression,
            saved memory, richer lessons, and the rest of the physics pathway.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link href="/register" className={styles.primaryButton} prefetch={false}>
            Create account
          </Link>
          <Link href="/energy-ledger" className={styles.secondaryButton}>
            Plan energy ledgers
          </Link>
          <Link href="/mission-demo" className={styles.secondaryButton}>
            Try the public mission
          </Link>
          <Link href="/graph-lab" className={styles.secondaryButton}>
            Open graph lab
          </Link>
        </div>
      </section>
    </main>
  );
}
