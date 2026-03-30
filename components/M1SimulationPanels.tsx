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

type DistanceTimePoint = {
  time: number;
  distance: number;
};

function chartX(time: number, totalTime: number, left: number, right: number): number {
  const span = Math.max(totalTime, 1);
  return left + (time / span) * (right - left);
}

function chartY(distance: number, maxDistance: number, top: number, bottom: number): number {
  const span = Math.max(maxDistance, 1);
  return bottom - (distance / span) * (bottom - top);
}

function linePoints(
  points: DistanceTimePoint[],
  totalTime: number,
  maxDistance: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): string {
  return points
    .map((point) => `${chartX(point.time, totalTime, left, right)},${chartY(point.distance, maxDistance, top, bottom)}`)
    .join(" ");
}

function DistanceTimeStoryFigure({
  openingSpeed,
  pauseTime,
  closingSpeed,
  totalTime,
  finishDistance,
  catchUpSpeed,
  formatSimulationNumber,
}: {
  openingSpeed: number;
  pauseTime: number;
  closingSpeed: number;
  totalTime: number;
  finishDistance: number;
  catchUpSpeed: number;
  formatSimulationNumber: (value: number, digits?: number) => string;
}) {
  const left = 70;
  const right = 592;
  const top = 58;
  const bottom = 232;
  const maxDistance = Math.max(24, Math.ceil(finishDistance / 4) * 4);

  const storyPoints: DistanceTimePoint[] = [
    { time: 0, distance: 0 },
    { time: 4, distance: openingSpeed * 4 },
    { time: 4 + pauseTime, distance: openingSpeed * 4 },
    { time: totalTime, distance: finishDistance },
  ];

  const comparisonRunB: DistanceTimePoint[] = [
    { time: 0, distance: 0 },
    { time: totalTime, distance: finishDistance },
  ];

  const storyPolyline = linePoints(storyPoints, totalTime, maxDistance, left, right, top, bottom);
  const comparisonAPolyline = storyPolyline;
  const comparisonBPolyline = linePoints(comparisonRunB, totalTime, maxDistance, left, right, top, bottom);

  const firstMidX = chartX(2, totalTime, left, right);
  const firstMidY = chartY((openingSpeed * 4) / 2, maxDistance, top, bottom) - 12;
  const pauseMidX = chartX(4 + pauseTime / 2, totalTime, left, right);
  const pauseMidY = chartY(openingSpeed * 4, maxDistance, top, bottom) - 14;
  const closingMidX = chartX(4 + pauseTime + 2, totalTime, left, right);
  const closingMidDistance = openingSpeed * 4 + closingSpeed * 2;
  const closingMidY = chartY(closingMidDistance, maxDistance, top, bottom) - 12;
  const runBLabelX = chartX(totalTime * 0.68, totalTime, left, right);
  const runBLabelY = chartY(finishDistance * 0.68, maxDistance, top, bottom) - 12;

  const ticks = Array.from({ length: 5 }, (_, index) => index / 4);

  const renderGrid = () => (
    <>
      {ticks.map((ratio) => {
        const x = left + ratio * (right - left);
        const y = top + ratio * (bottom - top);
        return (
          <g key={`grid-${ratio}`}>
            <line x1={x} y1={top} x2={x} y2={bottom} stroke="#1f2937" strokeWidth="1" />
            <line x1={left} y1={y} x2={right} y2={y} stroke="#1f2937" strokeWidth="1" />
          </g>
        );
      })}
    </>
  );

  const renderAxisLabels = () => (
    <>
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#64748b" strokeWidth="2" />
      <line x1={left} y1={top} x2={left} y2={bottom} stroke="#64748b" strokeWidth="2" />
      <text x={(left + right) / 2} y="266" fill="#e2e8f0" fontSize="16" textAnchor="middle">
        Time (s)
      </text>
      <text x="22" y={(top + bottom) / 2} fill="#e2e8f0" fontSize="16" textAnchor="middle" transform={`rotate(-90 22 ${(top + bottom) / 2})`}>
        Distance from start (m)
      </text>
      <text x={left} y="250" fill="#94a3b8" fontSize="12" textAnchor="middle">
        0
      </text>
      <text x={chartX(totalTime / 2, totalTime, left, right)} y="250" fill="#94a3b8" fontSize="12" textAnchor="middle">
        {formatSimulationNumber(totalTime / 2, 1)}
      </text>
      <text x={right} y="250" fill="#94a3b8" fontSize="12" textAnchor="middle">
        {formatSimulationNumber(totalTime, 0)}
      </text>
      <text x="54" y={bottom + 4} fill="#94a3b8" fontSize="12" textAnchor="end">
        0
      </text>
      <text x="54" y={chartY(maxDistance / 2, maxDistance, top, bottom) + 4} fill="#94a3b8" fontSize="12" textAnchor="end">
        {formatSimulationNumber(maxDistance / 2, 0)}
      </text>
      <text x="54" y={top + 4} fill="#94a3b8" fontSize="12" textAnchor="end">
        {formatSimulationNumber(maxDistance, 0)}
      </text>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950/95 p-4">
        <svg viewBox="0 0 640 280" className="w-full">
          <text x="320" y="28" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle">
            Distance-Time Story Board
          </text>
          <text x="320" y="48" fill="#cbd5e1" fontSize="13" textAnchor="middle">
            Move the sliders and watch the journey shape change in real time.
          </text>
          {renderGrid()}
          {renderAxisLabels()}
          <polyline points={storyPolyline} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {storyPoints.map((point) => (
            <circle
              key={`story-point-${point.time}-${point.distance}`}
              cx={chartX(point.time, totalTime, left, right)}
              cy={chartY(point.distance, maxDistance, top, bottom)}
              r="3.5"
              fill="#38bdf8"
            />
          ))}
          <text x={firstMidX} y={Math.max(top + 18, firstMidY)} fill="#bbf7d0" fontSize="12" textAnchor="middle">
            opening slope = {formatSimulationNumber(openingSpeed, 0)} m/s
          </text>
          <text x={pauseMidX} y={Math.max(top + 18, pauseMidY)} fill="#fde68a" fontSize="12" textAnchor="middle">
            pause = 0 slope for {pauseTime} s
          </text>
          <text x={closingMidX} y={Math.max(top + 18, closingMidY)} fill="#93c5fd" fontSize="12" textAnchor="middle">
            closing slope = {formatSimulationNumber(closingSpeed, 0)} m/s
          </text>
        </svg>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm leading-6 text-slate-700">
        Run A pauses and then catches up. Run B changes automatically so both journeys still finish at the same distance after the same total time.
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950/95 p-4">
        <svg viewBox="0 0 640 280" className="w-full">
          <text x="320" y="28" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle">
            Same Finish Comparison
          </text>
          <text x="320" y="48" fill="#cbd5e1" fontSize="13" textAnchor="middle">
            Compare Run A's changing slope with Run B's steady slope over the same time.
          </text>
          {renderGrid()}
          {renderAxisLabels()}
          <polyline points={comparisonAPolyline} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={comparisonBPolyline} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {storyPoints.map((point) => (
            <circle
              key={`comparison-point-${point.time}-${point.distance}`}
              cx={chartX(point.time, totalTime, left, right)}
              cy={chartY(point.distance, maxDistance, top, bottom)}
              r="3.5"
              fill="#2563eb"
            />
          ))}
          <circle cx={right} cy={top + (bottom - top) - ((finishDistance / Math.max(maxDistance, 1)) * (bottom - top))} r="4" fill="#10b981" />
          <rect x="474" y="66" width="116" height="52" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <line x1="490" y1="85" x2="508" y2="85" stroke="#2563eb" strokeWidth="3" />
          <text x="518" y="89" fill="#e2e8f0" fontSize="12">Run A</text>
          <line x1="490" y1="104" x2="508" y2="104" stroke="#10b981" strokeWidth="3" />
          <text x="518" y="108" fill="#e2e8f0" fontSize="12">Run B</text>
          <text x={pauseMidX} y={Math.max(top + 18, pauseMidY)} fill="#fde68a" fontSize="12" textAnchor="middle">
            Run A pauses here
          </text>
          <text x={runBLabelX} y={Math.max(top + 18, runBLabelY)} fill="#6ee7b7" fontSize="12" textAnchor="middle">
            Run B steady slope = {formatSimulationNumber(catchUpSpeed, 2)} m/s
          </text>
          <text x={right - 10} y={chartY(finishDistance, maxDistance, top, bottom) - 10} fill="#e2e8f0" fontSize="12" textAnchor="end">
            same finish
          </text>
        </svg>
      </div>
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
          <DistanceTimeStoryFigure
            openingSpeed={openingSpeed}
            pauseTime={pauseTime}
            closingSpeed={closingSpeed}
            totalTime={totalTime}
            finishDistance={finishDistance}
            catchUpSpeed={catchUpSpeed}
            formatSimulationNumber={formatSimulationNumber}
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
            note="Use the graph to compare the speed shown at one moment with the slope that shows how speed is changing over time."
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
            note="Read the sign from the change in velocity on the graph, not from a vague feeling about whether the object seems faster or slower."
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
            note="The straight-line graph is the clue that acceleration is constant, which is why these equations apply."
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
            note="The two graphs share the same steepness on purpose, so you can compare how the axes change the meaning of the slope."
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
            note="Split the shaded region into simple shapes first, then add their areas to explain the total distance."
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
          This comparison board is loading. Use the lesson explorer controls to compare the graph patterns step by step.
        </div>
      }
      chips={<MetricChip label="Support" value="Check the lesson-specific M1 explorer branch." tone="rose" />}
      note="If this card appears, the lesson key is not mapped correctly."
    />
  );
}
