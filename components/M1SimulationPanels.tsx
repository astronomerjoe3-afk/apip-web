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
  note: string;
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
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-slate-700">{note}</div>
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
      <span className="font-medium text-slate-900">{label}</span>
      <span className="ml-2 text-slate-500">
        {value}
        {suffix}
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

function scalePoint(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
) {
  if (domainMax === domainMin) return rangeMin;
  const ratio = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + ratio * (rangeMax - rangeMin);
}

function polyline(points: Array<[number, number]>) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
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
    const maxDistance = Math.max(finishDistance, 20);
    const graphPoints = [
      [0, 0],
      [firstDuration, openingSpeed * firstDuration],
      [firstDuration + pauseTime, openingSpeed * firstDuration],
      [totalTime, finishDistance],
    ] as Array<[number, number]>;
    const scaled = graphPoints.map(([t, s]) => [
      scalePoint(t, 0, totalTime, 70, 540),
      scalePoint(s, 0, maxDistance, 250, 40),
    ]) as Array<[number, number]>;
    const comparison = [
      [70, 250],
      [540, scalePoint(finishDistance, 0, maxDistance, 250, 40)],
    ] as Array<[number, number]>;

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
          <svg viewBox="0 0 620 300" role="img" aria-label="Distance-time mission log comparison">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="22" y="20" width="576" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <text x="48" y="54" fill="#1e293b" fontSize="18" fontWeight="700">
              Mission log
            </text>
            <line x1="70" y1="250" x2="540" y2="250" stroke="#94a3b8" strokeWidth="3" />
            <line x1="70" y1="250" x2="70" y2="40" stroke="#94a3b8" strokeWidth="3" />
            <polyline points={polyline(scaled)} fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <polyline
              points={polyline(comparison)}
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 10"
            />
            <text x="150" y="276" fill="#475569" fontSize="15">
              mission clock, t
            </text>
            <text x="20" y="160" fill="#475569" fontSize="15" transform="rotate(-90 20 160)">
              recorded progress, s
            </text>
            <text x="372" y="96" fill="#1d4ed8" fontSize="16" fontWeight="700">
              pause keeps height fixed
            </text>
            <text x="372" y="116" fill="#475569" fontSize="14">
              time changes, distance does not
            </text>
            <text x="400" y="222" fill="#047857" fontSize="15" fontWeight="700">
              Same final point, different journey
            </text>
          </svg>
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
        note="M1 goes beyond F2 by treating the graph as a representation system. The main job here is separating the physical run from the recorded graph story."
      />
    );
  }

  if (lessonKey === "M1_L2") {
    const startSpeed = Math.max(0, Math.min(12, simVectorMagnitude));
    const endSpeed = Math.max(0, Math.min(12, simVectorAngle));
    const duration = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const acceleration = (endSpeed - startSpeed) / duration;
    const maxSpeed = Math.max(startSpeed, endSpeed, 2);
    const y1 = scalePoint(startSpeed, 0, maxSpeed, 250, 40);
    const y2 = scalePoint(endSpeed, 0, maxSpeed, 250, 40);
    const midSpeed = (startSpeed + endSpeed) / 2;

    return (
      <ExplorerLayout
        title="Pace log reasoning board"
        mission="Set one flat, one rising, and one falling pace log, then compare what the graph height says and what the graph slope says at the same instant."
        watchFor={[
          "Height answers a speed-now question.",
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
          <svg viewBox="0 0 620 300" role="img" aria-label="Speed-time graph with height and slope emphasis">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="22" y="20" width="576" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="70" y1="250" x2="540" y2="250" stroke="#94a3b8" strokeWidth="3" />
            <line x1="70" y1="250" x2="70" y2="40" stroke="#94a3b8" strokeWidth="3" />
            <line x1="70" y1={y1} x2="540" y2={y2} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
            <circle cx="305" cy={scalePoint(midSpeed, 0, maxSpeed, 250, 40)} r="8" fill="#f59e0b" />
            <text x="332" y="118" fill="#1d4ed8" fontSize="16" fontWeight="700">
              height = speed now
            </text>
            <text x="332" y="138" fill="#475569" fontSize="14">
              midpoint speed can be read from the graph height
            </text>
            <text x="332" y="178" fill="#b45309" fontSize="16" fontWeight="700">
              slope = acceleration
            </text>
            <text x="332" y="198" fill="#475569" fontSize="14">
              tilt tells how quickly the speed itself is changing
            </text>
          </svg>
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
        note="This lesson is a graph-reading upgrade over F2: students must stop treating graph height and graph slope as the same physical idea."
      />
    );
  }

  if (lessonKey === "M1_L3") {
    const initialVelocity = Math.max(-10, Math.min(10, simVectorMagnitude));
    const finalVelocity = Math.max(-10, Math.min(10, simVectorAngle));
    const duration = Math.max(1, Math.min(8, Math.round(simMetricMeters)));
    const acceleration = (finalVelocity - initialVelocity) / duration;
    const arrowX = (value: number) => scalePoint(value, -10, 10, 90, 530);

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
          <svg viewBox="0 0 620 300" role="img" aria-label="Signed velocity arrows and acceleration sign">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="22" y="20" width="576" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <text x="44" y="58" fill="#1e293b" fontSize="18" fontWeight="700">
              Signed velocity bar
            </text>
            <line x1="90" y1="145" x2="530" y2="145" stroke="#94a3b8" strokeWidth="4" />
            <line x1="310" y1="110" x2="310" y2="180" stroke="#64748b" strokeWidth="3" />
            <line x1="310" y1="115" x2={arrowX(initialVelocity)} y2="115" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
            <polygon
              points={`${arrowX(initialVelocity)},115 ${initialVelocity >= 0 ? arrowX(initialVelocity) - 16 : arrowX(initialVelocity) + 16},105 ${initialVelocity >= 0 ? arrowX(initialVelocity) - 16 : arrowX(initialVelocity) + 16},125`}
              fill="#2563eb"
            />
            <line x1="310" y1="185" x2={arrowX(finalVelocity)} y2="185" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
            <polygon
              points={`${arrowX(finalVelocity)},185 ${finalVelocity >= 0 ? arrowX(finalVelocity) - 16 : arrowX(finalVelocity) + 16},175 ${finalVelocity >= 0 ? arrowX(finalVelocity) - 16 : arrowX(finalVelocity) + 16},195`}
              fill="#f59e0b"
            />
            <text x="330" y="230" fill="#475569" fontSize="15">
              a = (v - u) / t, so the sign comes from the signed velocity change.
            </text>
          </svg>
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
    const topSpeed = Math.max(u, v, 2);
    const y1 = scalePoint(u, 0, topSpeed, 250, 50);
    const y2 = scalePoint(v, 0, topSpeed, 250, 50);

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
          <svg viewBox="0 0 620 300" role="img" aria-label="Constant acceleration forecast board">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="22" y="20" width="576" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="70" y1="250" x2="540" y2="250" stroke="#94a3b8" strokeWidth="3" />
            <line x1="70" y1="250" x2="70" y2="50" stroke="#94a3b8" strokeWidth="3" />
            <polygon points={`70,250 70,${y1} 540,${y2} 540,250`} fill="#bfdbfe" fillOpacity="0.55" />
            <polyline points={polyline([[70, y1], [540, y2]])} fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
            <text x="96" y="78" fill="#166534" fontSize="16" fontWeight="700">
              Knowns to unknown
            </text>
            <text x="96" y="102" fill="#475569" fontSize="14">
              Pick the equation from the story, not from symbol memory.
            </text>
            <text x="330" y="82" fill="#b45309" fontSize="16" fontWeight="700">
              Condition
            </text>
            <text x="330" y="106" fill="#475569" fontSize="14">
              This board is valid only while acceleration stays constant.
            </text>
          </svg>
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
        note="This lesson should feel more advanced than F2 because it asks for strategic equation choice, condition checking, and representation links between graph area and algebra."
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
          <svg viewBox="0 0 620 300" role="img" aria-label="Same slope on two different graphs">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="20" y="20" width="270" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="330" y="20" width="270" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="58" y1="235" x2="250" y2="235" stroke="#94a3b8" strokeWidth="3" />
            <line x1="58" y1="235" x2="58" y2="60" stroke="#94a3b8" strokeWidth="3" />
            <line x1="95" y1="210" x2="220" y2="95" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
            <text x="155" y="256" fill="#1d4ed8" fontSize="15" textAnchor="middle">
              distance-time to speed
            </text>

            <line x1="368" y1="235" x2="560" y2="235" stroke="#94a3b8" strokeWidth="3" />
            <line x1="368" y1="235" x2="368" y2="60" stroke="#94a3b8" strokeWidth="3" />
            <line x1="405" y1="210" x2="530" y2="95" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
            <text x="465" y="256" fill="#b45309" fontSize="15" textAnchor="middle">
              speed-time to acceleration
            </text>
            <text x="310" y="52" fill="#475569" fontSize="16" textAnchor="middle">
              Same geometry, different physics
            </text>
          </svg>
        }
        chips={
          <>
            <MetricChip label="Distance-time meaning" value={`${formatSimulationNumber(sharedTilt, 0)} m/s`} tone="sky" />
            <MetricChip label="Speed-time meaning" value={`${formatSimulationNumber(sharedTilt, 0)} m/s^2`} tone="violet" />
            <MetricChip label="Interpretation" value="You must name the axes before naming the slope." tone="slate" />
          </>
        }
        note="This is one of the clearest places where M1 should feel above F2: students are not only reading a graph, they are comparing rate meanings across graph families."
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
    const topSpeed = Math.max(u, v, 2);
    const y1 = scalePoint(u, 0, topSpeed, 250, 50);
    const y2 = scalePoint(v, 0, topSpeed, 250, 50);
    const baseTop = scalePoint(Math.min(u, v), 0, topSpeed, 250, 50);

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
          <svg viewBox="0 0 620 300" role="img" aria-label="Area under speed-time graph split into rectangle and triangle">
            <rect x="0" y="0" width="620" height="300" rx="28" fill="#f8fafc" />
            <rect x="22" y="20" width="576" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="70" y1="250" x2="540" y2="250" stroke="#94a3b8" strokeWidth="3" />
            <line x1="70" y1="250" x2="70" y2="50" stroke="#94a3b8" strokeWidth="3" />
            <rect x="70" y={baseTop} width="470" height={250 - baseTop} fill="#93c5fd" fillOpacity="0.35" />
            <polygon
              points={
                v >= u
                  ? polyline([
                      [70, y1],
                      [540, y1],
                      [540, y2],
                    ])
                  : polyline([
                      [70, y2],
                      [70, y1],
                      [540, y2],
                    ])
              }
              fill="#f59e0b"
              fillOpacity="0.42"
            />
            <polyline points={polyline([[70, y1], [540, y2]])} fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
            <text x="210" y="274" fill="#1d4ed8" fontSize="15" textAnchor="middle">
              rectangle = base distance
            </text>
            <text x="430" y="274" fill="#b45309" fontSize="15" textAnchor="middle">
              triangle = extra distance
            </text>
          </svg>
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
