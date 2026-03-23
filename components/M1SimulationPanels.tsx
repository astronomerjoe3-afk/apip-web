import type { ReactNode } from "react";

type Props = {
  lessonKey: string;
  simMetricMeters: number;
  setSimMetricMeters: (value: number) => void;
  simVectorMagnitude: number;
  setSimVectorMagnitude: (value: number) => void;
  simVectorAngle: number;
  setSimVectorAngle: (value: number) => void;
  simDensityMass: number;
  setSimDensityMass: (value: number) => void;
  simDensityVolume: number;
  setSimDensityVolume: (value: number) => void;
  simFluidDensity: number;
  setSimFluidDensity: (value: number) => void;
  simBias: number;
  setSimBias: (value: number) => void;
  formatSimulationNumber: (value: number, digits?: number) => string;
};

const panelGridStyle = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  alignItems: "start",
} as const;

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";
const figureClass =
  "rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(239,246,255,0.92))] p-4";

function MetricChip({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "sky" | "emerald" | "amber" | "rose" | "violet";
}) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    sky: "bg-sky-50 text-sky-800",
    emerald: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-800",
    violet: "bg-violet-50 text-violet-800",
  } as const;
  const headingTones = {
    slate: "text-slate-900",
    sky: "text-sky-900",
    emerald: "text-emerald-900",
    amber: "text-amber-900",
    rose: "text-rose-900",
    violet: "text-violet-900",
  } as const;

  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <div className={`text-sm font-semibold ${headingTones[tone]}`}>{label}</div>
      <div className="mt-2 text-base">{value}</div>
    </div>
  );
}

function ExplorerLayout({
  title,
  controls,
  figure,
  chips,
  note,
  mission,
  watchFor,
}: {
  title: string;
  controls: ReactNode;
  figure: ReactNode;
  chips: ReactNode;
  note?: string;
  mission?: string;
  watchFor?: string[];
}) {
  return (
    <div style={panelGridStyle}>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
        {mission ? (
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/90 p-4 text-slate-700">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Try this mission</div>
            <p className="mt-2 text-sm leading-6">{mission}</p>
          </div>
        ) : null}
        {watchFor && watchFor.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-slate-700">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Watch for</div>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {watchFor.map((entry) => (
                <li key={entry} className="flex gap-2">
                  <span className="mt-1 text-sky-600">-</span>
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-4 space-y-4">{controls}</div>
      </div>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">Quest-Log physics board</h4>
        <div className={`mt-4 ${figureClass}`}>{figure}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{chips}</div>
        {note ? (
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-slate-700">{note}</div>
        ) : null}
      </div>
    </div>
  );
}

function control(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  onChange: (value: number) => void,
  suffix = "",
) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-medium text-slate-900">{label}</span>
        <span className="shrink-0 tabular-nums text-slate-500">
          {value}
          {suffix}
        </span>
      </span>
      <input
        className="mt-2 w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function GraphAgentFigure({
  primarySrc,
  primaryAlt,
  note,
  secondarySrc,
  secondaryAlt,
}: {
  primarySrc: string;
  primaryAlt: string;
  note?: string;
  secondarySrc?: string;
  secondaryAlt?: string;
}) {
  return (
    <div className="space-y-4">
      <img
        src={primarySrc}
        alt={primaryAlt}
        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-950/95"
      />
      {note ? (
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm leading-6 text-slate-700">
          {note}
        </div>
      ) : null}
      {secondarySrc ? (
        <img
          src={secondarySrc}
          alt={secondaryAlt || primaryAlt}
          className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-950/95"
        />
      ) : null}
    </div>
  );
}

export default function M1SimulationPanels(props: Props) {
  const {
    lessonKey,
    simMetricMeters,
    setSimMetricMeters,
    simVectorMagnitude,
    setSimVectorMagnitude,
    simVectorAngle,
    setSimVectorAngle,
    simBias,
    formatSimulationNumber,
  } = props;

  if (lessonKey === "M1_L1") {
    const openingSpeed = Math.max(1, Math.min(8, simVectorMagnitude));
    const pauseTime = Math.max(0, Math.min(6, Math.round(simMetricMeters)));
    const closingSpeed = Math.max(1, Math.min(8, simVectorAngle));
    const firstDuration = 4;
    const secondDuration = 4;
    const totalTime = firstDuration + pauseTime + secondDuration;
    const finishDistance = openingSpeed * firstDuration + closingSpeed * secondDuration;
    const catchUpSpeed = finishDistance / Math.max(totalTime, 1);

    return (
      <ExplorerLayout
        title="Distance-time story board"
        mission="Build one journey with motion, a pause, and motion again, then compare it with a different run that lands on the same final point."
        watchFor={[
          "Graph height tells the total distance recorded by that time.",
          "A flat strip means time is passing while distance is not changing.",
          "Two journeys can share one finish point without sharing one motion story.",
        ]}
        controls={
          <>
            {control("Opening pace", 1, 8, 1, openingSpeed, setSimVectorMagnitude, " m/s")}
            {control("Pause time", 0, 6, 1, pauseTime, setSimMetricMeters, " s")}
            {control("Closing pace", 1, 8, 1, closingSpeed, setSimVectorAngle, " m/s")}
          </>
        }
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L1/diagrams/m1_l1_distance_time_graph.svg"
            primaryAlt="Distance-time story graph"
            note="These M1 story graphs are now rendered from the physics graph agent, so the axes, scales, and plotted segments stay consistent with the lesson graphs students meet elsewhere in the module."
            secondarySrc="/lesson_assets/M1/M1_L1/diagrams/m1_l1_same_finish_graph.svg"
            secondaryAlt="Same finish comparison graph"
          />
        }
        chips={
          <>
            <MetricChip label="Final distance" value={`${formatSimulationNumber(finishDistance, 0)} m`} tone="sky" />
            <MetricChip label="Catch-up run" value={`${formatSimulationNumber(catchUpSpeed, 2)} m/s with no pause`} tone="emerald" />
            <MetricChip
              label="Interpretation"
              value="Height records total distance by that time; slope tells how fast distance is being added."
              tone="slate"
            />
          </>
        }
      />
    );
  }

  if (lessonKey === "M1_L2") {
    const startSpeed = Math.max(0, Math.min(12, simVectorMagnitude));
    const endSpeed = Math.max(0, Math.min(12, simVectorAngle));
    const duration = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const acceleration = (endSpeed - startSpeed) / duration;
    const midSpeed = (startSpeed + endSpeed) / 2;

    return (
      <ExplorerLayout
        title="Pace log reasoning board"
        mission="Set one flat, one rising, and one falling pace log, then compare what the graph height at a chosen time says and what the graph slope over an interval says."
        watchFor={[
          "Height at a chosen time answers a speed-at-that-time question.",
          "Slope answers a change-of-speed question.",
          "A flat line above zero still means constant motion, not rest.",
        ]}
        controls={
          <>
            {control("Start speed", 0, 12, 1, startSpeed, setSimVectorMagnitude, " m/s")}
            {control("End speed", 0, 12, 1, endSpeed, setSimVectorAngle, " m/s")}
            {control("Time interval", 1, 8, 1, duration, setSimMetricMeters, " s")}
          </>
        }
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L2/diagrams/m1_l2_speed_time_graph.svg"
            primaryAlt="Speed-time graph"
            note="The graph image stays on the graph-agent plot while your chosen numbers below let you test how changing the start, end, and time interval changes the midpoint speed and the slope."
          />
        }
        chips={
          <>
            <MetricChip label="Midpoint speed" value={`${formatSimulationNumber(midSpeed, 1)} m/s`} tone="sky" />
            <MetricChip label="Graph slope" value={`${formatSimulationNumber(acceleration, 2)} m/s^2`} tone="amber" />
            <MetricChip
              label="Interpretation"
              value="A flat line above zero still means motion. High speed and high acceleration are different graph questions."
              tone="slate"
            />
          </>
        }
        note="This lesson trains students to keep graph height and graph slope as separate physical ideas."
      />
    );
  }

  if (lessonKey === "M1_L3") {
    const initialVelocity = Math.max(-10, Math.min(10, simVectorMagnitude));
    const finalVelocity = Math.max(-10, Math.min(10, simVectorAngle));
    const duration = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const acceleration = (finalVelocity - initialVelocity) / duration;

    return (
      <ExplorerLayout
        title="Signed acceleration board"
        mission="Choose one positive, one negative, and one zero acceleration case, then explain the sign from the signed velocity change rather than from a feeling about speed."
        watchFor={[
          "Mark the positive direction before deciding the sign.",
          "Compare the initial and final velocity arrows, not just the speeds.",
          "Negative acceleration can mean slowing down or speeding up depending on the velocity direction.",
        ]}
        controls={
          <>
            {control("Initial velocity", -10, 10, 1, initialVelocity, setSimVectorMagnitude, " m/s")}
            {control("Final velocity", -10, 10, 1, finalVelocity, setSimVectorAngle, " m/s")}
            {control("Time interval", 1, 8, 1, duration, setSimMetricMeters, " s")}
          </>
        }
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L3/diagrams/m1_l3_signed_acceleration_graph.svg"
            primaryAlt="Velocity-time graph for signed acceleration"
            note="This lesson now uses the graph-agent velocity plot directly, so sign reasoning is tied to a proper velocity-time graph instead of a separate sketch."
          />
        }
        chips={
          <>
            <MetricChip label="Signed velocity change" value={`${formatSimulationNumber(finalVelocity - initialVelocity, 1)} m/s`} tone="sky" />
            <MetricChip label="Acceleration" value={`${formatSimulationNumber(acceleration, 2)} m/s^2`} tone={acceleration >= 0 ? "emerald" : "rose"} />
            <MetricChip
              label="Interpretation"
              value={
                acceleration === 0
                  ? "No velocity change."
                  : acceleration > 0
                    ? "Velocity is changing in the chosen positive direction."
                    : "Velocity is changing in the chosen negative direction."
              }
              tone="slate"
            />
          </>
        }
        note='The higher-level move here is sign reasoning: acceleration is a directional rate of velocity change, not just a synonym for "getting faster."'
      />
    );
  }

  if (lessonKey === "M1_L4") {
    const u = Math.max(0, Math.min(15, simVectorMagnitude));
    const a = Math.max(-4, Math.min(4, simVectorAngle));
    const t = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;

    return (
      <ExplorerLayout
        title="Constant-acceleration forecast board"
        mission="Use one constant-acceleration story to forecast v and s, then decide whether the same equations stay trustworthy if the acceleration pattern changes."
        watchFor={[
          "Choose an equation from the knowns and the unknown, not from surface memory.",
          "The forecast board assumes one constant acceleration pattern.",
          "The graph area and the algebra agree only when the change is uniform.",
        ]}
        controls={
          <>
            {control("Initial speed u", 0, 15, 1, u, setSimVectorMagnitude, " m/s")}
            {control("Acceleration a", -4, 4, 1, a, setSimVectorAngle, " m/s^2")}
            {control("Time t", 1, 8, 1, t, setSimMetricMeters, " s")}
          </>
        }
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L4/diagrams/m1_l4_constant_acceleration_graph.svg"
            primaryAlt="Constant-acceleration forecast graph"
            note="The forecast board now uses the graph-agent straight-line velocity plot, so the constant-acceleration condition is shown on a proper graph before students use the equations."
          />
        }
        chips={
          <>
            <MetricChip label="Final speed, v = u + at" value={`${formatSimulationNumber(v, 1)} m/s`} tone="emerald" />
            <MetricChip label="Distance, s = ut + 1/2at^2" value={`${formatSimulationNumber(s, 1)} m`} tone="sky" />
            <MetricChip
              label="Interpretation"
              value="The shaded region matches the algebra only because the acceleration pattern is uniform."
              tone="amber"
            />
          </>
        }
        note="This lesson asks for strategic equation choice, condition checking, and representation links between graph area and algebra."
      />
    );
  }

  if (lessonKey === "M1_L5") {
    const sharedTilt = Math.max(1, Math.min(6, simVectorMagnitude));

    return (
      <ExplorerLayout
        title="Gradient meaning comparator"
        mission="Hold one common tilt across the two graphs and explain why the same geometry means speed on one board and acceleration on the other."
        watchFor={[
          "The axes decide the physical meaning of the slope.",
          "Same steepness does not guarantee the same quantity.",
          "Graph height and graph slope must stay separate in both graph families.",
        ]}
        controls={<>{control("Shared tilt", 1, 6, 1, sharedTilt, setSimVectorMagnitude)}</>}
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L5/diagrams/m1_l5_distance_gradient_graph.svg"
            primaryAlt="Distance-time gradient graph"
            note="Both comparison graphs now come straight from the graph agent, so students are reading two proper plotted graphs instead of one hand-drawn comparison sketch."
            secondarySrc="/lesson_assets/M1/M1_L5/diagrams/m1_l5_speed_gradient_graph.svg"
            secondaryAlt="Speed-time gradient graph"
          />
        }
        chips={
          <>
            <MetricChip label="Distance-time meaning" value={`${formatSimulationNumber(sharedTilt, 0)} m/s`} tone="sky" />
            <MetricChip label="Speed-time meaning" value={`${formatSimulationNumber(sharedTilt, 0)} m/s^2`} tone="violet" />
            <MetricChip label="Interpretation" value="You must name the axes before naming the slope." tone="slate" />
          </>
        }
        note="This is one of the clearest places where students compare rate meanings across graph families instead of reading slope by appearance alone."
      />
    );
  }

  if (lessonKey === "M1_L6") {
    const u = Math.max(0, Math.min(10, simVectorMagnitude));
    const v = Math.max(0, Math.min(14, simVectorAngle));
    const t = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const rectangle = Math.min(u, v) * t;
    const triangle = 0.5 * Math.abs(v - u) * t;
    const distance = rectangle + triangle;

    return (
      <ExplorerLayout
        title="Area-to-distance builder"
        mission="Split one speed-time graph into rectangle and triangle pieces, then compare it with a different graph that still encloses the same total area."
        watchFor={[
          "Area works here because speed multiplied by time gives distance.",
          "Rectangle plus triangle can rebuild the total distance.",
          "Different graph shapes can still represent the same total distance if the total area matches.",
        ]}
        controls={
          <>
            {control("Initial speed u", 0, 10, 1, u, setSimVectorMagnitude, " m/s")}
            {control("Final speed v", 0, 14, 1, v, setSimVectorAngle, " m/s")}
            {control("Time interval", 1, 8, 1, t, setSimMetricMeters, " s")}
          </>
        }
        figure={
          <GraphAgentFigure
            primarySrc="/lesson_assets/M1/M1_L6/diagrams/m1_l6_area_distance_graph.svg"
            primaryAlt="Area under a speed-time graph"
            note="The plotted pace-log area is now rendered through the graph agent, so the shaded distance region is tied to a proper speed-time graph instead of a custom sketch."
          />
        }
        chips={
          <>
            <MetricChip label="Rectangle area" value={`${formatSimulationNumber(rectangle, 1)} m`} tone="sky" />
            <MetricChip label="Triangle area" value={`${formatSimulationNumber(triangle, 1)} m`} tone="amber" />
            <MetricChip label="Total distance" value={`${formatSimulationNumber(distance, 1)} m`} tone="emerald" />
          </>
        }
        note="This lesson becomes higher-level when students justify the area rule from the axes and can compare different graph shapes that still deliver the same total distance."
      />
    );
  }

  const fallbackAngle = Math.max(1, Math.min(8, simBias));
  return (
    <ExplorerLayout
      title="Quest-Log comparison"
      controls={<>{control("Reference tilt", 1, 8, 1, fallbackAngle, () => {}, "")}</>}
      figure={
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-5 text-slate-600">
          M1 explorer support is authored lesson by lesson, so this fallback card should not appear in normal M1 use.
        </div>
      }
      chips={<MetricChip label="Support" value="Check the lesson-specific M1 explorer branch." tone="rose" />}
      note="If this card appears, the lesson key is not mapped correctly."
    />
  );
}
