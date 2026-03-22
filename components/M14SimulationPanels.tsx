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
  simSpread: number;
  setSimSpread: (value: number) => void;
  formatSimulationNumber: (value: number, digits?: number) => string;
};

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sliderField(label: string, value: string, input: ReactNode): ReactNode {
  return (
    <label className="mt-4 block">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold tabular-nums text-slate-900">
          {value}
        </span>
      </div>
      <div className="mt-2">{input}</div>
    </label>
  );
}

function metricCard(title: string, value: string, tone: string): ReactNode {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function renderPanel(
  title: string,
  controls: ReactNode,
  boardTitle: string,
  board: ReactNode,
  readings: ReactNode,
  lens: string[],
  note: string,
): ReactNode {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
          {controls}
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Lantern-Ring lens</h4>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700">
            {lens.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{boardTitle}</h4>
          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">{board}</div>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );
}

function moonPhaseName(index: number): string {
  const phases = [
    "new moon",
    "waxing crescent",
    "first quarter",
    "waxing gibbous",
    "full moon",
    "waning gibbous",
    "third quarter",
    "waning crescent",
  ];
  return phases[((Math.round(index) % 8) + 8) % 8];
}

export default function M14SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simDensityMass,
  setSimDensityMass,
  simDensityVolume,
  setSimDensityVolume,
  simFluidDensity,
  setSimFluidDensity,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M14_L1") {
    const bodyIndex = Math.round(clamp(simBias, 0, 4));
    const hostIndex = Math.round(clamp(simMetricMeters, 0, 1));
    const bodyOptions = ["planet", "moon", "dwarf planet", "asteroid", "comet"] as const;
    const hostOptions = ["Sun", "larger world"] as const;
    const selectedBody = bodyOptions[bodyIndex];
    const selectedHost = hostOptions[hostIndex];
    const classification =
      selectedBody === "moon"
        ? "companion rider"
        : selectedBody === "planet"
          ? "world rider"
          : selectedBody === "dwarf planet"
            ? "small round rider"
            : selectedBody === "asteroid"
              ? "rock swarm piece"
              : "ice visitor";
    const hostNote =
      selectedBody === "moon"
        ? "mainly orbits a larger world"
        : "belongs in the Sun-centered family";

    return renderPanel(
      "Solar court sorter",
      <>
        {sliderField(
          "Body type",
          selectedBody,
          <input className="w-full" type="range" min="0" max="4" step="1" value={bodyIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Main host",
          selectedHost,
          <input className="w-full" type="range" min="0" max="1" step="1" value={hostIndex} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Solar Court board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="138" cy="126" r="44" fill="#facc15" />
        <text x="138" y="132" fill="#0f172a" fontSize="24" fontWeight="700" textAnchor="middle">
          Sun
        </text>
        <circle cx="138" cy="126" r="96" fill="none" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="138" cy="126" r="150" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 8" />
        <circle
          cx={selectedHost === "Sun" ? 288 : 388}
          cy={selectedHost === "Sun" ? 126 : 92}
          r={selectedBody === "planet" ? 18 : selectedBody === "moon" ? 10 : 14}
          fill={selectedBody === "planet" ? "#60a5fa" : selectedBody === "moon" ? "#e2e8f0" : selectedBody === "dwarf planet" ? "#a78bfa" : selectedBody === "asteroid" ? "#f97316" : "#38bdf8"}
        />
        {selectedHost === "larger world" ? (
          <>
            <circle cx="388" cy="126" r="22" fill="#60a5fa" />
            <circle cx="388" cy="126" r="42" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
            <text x="388" y="164" fill="#334155" fontSize="18" textAnchor="middle">
              larger world
            </text>
          </>
        ) : null}
        <text x="454" y="78" fill="#0f172a" fontSize="26" fontWeight="700">
          {selectedBody}
        </text>
        <text x="454" y="116" fill="#334155" fontSize="20">
          classification: {classification}
        </text>
        <text x="454" y="154" fill="#475569" fontSize="18">
          host: {hostNote}
        </text>
      </svg>,
      <>
        {metricCard("Selected body", selectedBody, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Main host", selectedHost, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Court role", classification, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Category clue", selectedBody === "comet" ? "icy visitor" : selectedBody === "asteroid" ? "rocky small body" : "orbit relationship", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Start with one central lantern.", "Sort by what the body is and what it mainly orbits.", "Use object category to stop everything from collapsing into 'planet'."],
      "This board makes the Solar System feel like one organized family with different roles instead of a loose object list.",
    );
  }

  if (lessonKey === "M14_L2") {
    const hubPull = clamp(simMetricMeters, 0.8, 2.4);
    const forwardMotion = clamp(simVectorMagnitude, 0.8, 2.4);
    const curvature = hubPull / forwardMotion;
    const routeLabel =
      curvature > 1.35 ? "tightly bent route" : curvature < 0.75 ? "wide route" : "balanced orbit path";

    return renderPanel(
      "Hub pull routes",
      <>
        {sliderField(
          "Hub pull",
          `${formatSimulationNumber(hubPull, 2)} g-units`,
          <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={hubPull} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Forward motion",
          `${formatSimulationNumber(forwardMotion, 2)} v-units`,
          <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={forwardMotion} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
      </>,
      "Orbit board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="160" cy="126" r="42" fill="#facc15" />
        <ellipse cx="160" cy="126" rx={130 + forwardMotion * 26} ry={70 + forwardMotion * 18} fill="none" stroke="#60a5fa" strokeWidth="4" />
        <circle cx={290 + forwardMotion * 20} cy="126" r="16" fill="#38bdf8" />
        <line x1={290 + forwardMotion * 20} y1="126" x2={224 + forwardMotion * 10} y2={100 - hubPull * 10} stroke="#f97316" strokeWidth="5" />
        <line x1={290 + forwardMotion * 20} y1="126" x2={348 + forwardMotion * 16} y2="126" stroke="#22c55e" strokeWidth="5" />
        <text x="430" y="86" fill="#334155" fontSize="20">
          hub pull bends inward
        </text>
        <text x="430" y="122" fill="#334155" fontSize="20">
          forward motion carries onward
        </text>
        <text x="430" y="166" fill="#0f172a" fontSize="24" fontWeight="700">
          {routeLabel}
        </text>
      </svg>,
      <>
        {metricCard("Curvature ratio", formatSimulationNumber(curvature, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Route read", routeLabel, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Hub idea", "gravity", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Track myth", "not a rail", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Orbit is a gravity-guided path.", "Forward motion and inward pull must be read together.", "The same pull story scales from planets to moons."],
      "The board keeps route shape tied to gravity and motion so the orbit never turns into an invisible track misconception.",
    );
  }

  if (lessonKey === "M14_L3") {
    const cityAngle = clamp(simVectorAngle, 0, 360);
    const radians = (cityAngle * Math.PI) / 180;
    const cityX = 320 + 88 * Math.cos(radians);
    const cityY = 126 + 88 * Math.sin(radians);
    const lit = cityX < 320;
    const localState = lit ? "day-face" : "night-face";

    return renderPanel(
      "Spin for daylight",
      <>
        {sliderField(
          "City position around the spin",
          `${formatSimulationNumber(cityAngle, 0)} deg`,
          <input className="w-full" type="range" min="0" max="360" step="1" value={cityAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Day-night board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="92" cy="126" r="34" fill="#facc15" />
        <line x1="132" y1="126" x2="220" y2="126" stroke="#fbbf24" strokeWidth="8" />
        <circle cx="320" cy="126" r="96" fill="#2563eb" />
        <path d="M320 30 A96 96 0 0 1 320 222 Z" fill="#0f172a" />
        <line x1="320" y1="18" x2="320" y2="234" stroke="#f8fafc" strokeWidth="4" />
        <circle cx={cityX} cy={cityY} r="10" fill="#ef4444" />
        <text x="320" y="24" fill="#334155" fontSize="18" textAnchor="middle">
          spin rod
        </text>
        <text x="248" y="40" fill="#f59e0b" fontSize="18">
          day-face
        </text>
        <text x="378" y="216" fill="#334155" fontSize="18">
          night-face
        </text>
      </svg>,
      <>
        {metricCard("City state", localState, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Cause", "rotation", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Not caused by", "yearly orbit", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Cycle idea", "one full spin", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Use spin, not revolution, to explain daylight.", "A place changes state because the world turns.", "Half lit and half dark is enough to explain the cycle."],
      "This explorer turns day and night into a rotation geometry problem instead of a Sun-moving-around-Earth story.",
    );
  }

  if (lessonKey === "M14_L4") {
    const tilt = clamp(simMetricMeters, 0, 30);
    const orbitPosition = clamp(simVectorAngle, 0, 100);
    const juneLike = orbitPosition < 50;
    const hemisphere = juneLike ? "northern hemisphere toward Sun" : "southern hemisphere toward Sun";

    return renderPanel(
      "Season switch",
      <>
        {sliderField(
          "Axial tilt",
          `${formatSimulationNumber(tilt, 1)} deg`,
          <input className="w-full" type="range" min="0" max="30" step="0.5" value={tilt} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Orbit position",
          juneLike ? "June side" : "December side",
          <input className="w-full" type="range" min="0" max="100" step="1" value={orbitPosition} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Season board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="120" cy="126" r="38" fill="#facc15" />
        <circle cx="340" cy={juneLike ? 84 : 168} r="54" fill="#2563eb" />
        <line
          x1={340 - 24}
          y1={juneLike ? 84 + 54 : 168 + 54}
          x2={340 + 24}
          y2={juneLike ? 84 - 54 : 168 - 54}
          stroke="#f8fafc"
          strokeWidth="4"
        />
        <line x1="158" y1="126" x2="284" y2={juneLike ? 84 : 168} stroke="#fbbf24" strokeWidth="5" />
        <text x="458" y="90" fill="#0f172a" fontSize="24" fontWeight="700">
          {hemisphere}
        </text>
        <text x="458" y="126" fill="#334155" fontSize="19">
          tilt = {formatSimulationNumber(tilt, 1)} deg
        </text>
        <text x="458" y="160" fill="#475569" fontSize="19">
          seasons follow lean and sunlight angle
        </text>
      </svg>,
      <>
        {metricCard("Season side", juneLike ? "June-like position" : "December-like position", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Sunward hemisphere", hemisphere, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Tilt cause", tilt > 0 ? "active" : "no seasons signal", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Misconception check", "not simple distance", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Keep the tilt direction fixed in space.", "Opposite hemispheres must swap lean through the year.", "Use sunlight angle, not distance, as the main season cause."],
      "The season board keeps June-December comparison tied to axis tilt so the distance myth never becomes the main explanation.",
    );
  }

  if (lessonKey === "M14_L5") {
    const moonIndex = Math.round(clamp(simBias, 0, 7));
    const phaseName = moonPhaseName(moonIndex);
    const phasePositions = [
      [208, 126],
      [244, 64],
      [320, 44],
      [396, 64],
      [432, 126],
      [396, 188],
      [320, 208],
      [244, 188],
    ] as const;
    const [moonX, moonY] = phasePositions[moonIndex];

    return renderPanel(
      "Moon face challenge",
      <>
        {sliderField(
          "Moon position",
          phaseName,
          <input className="w-full" type="range" min="0" max="7" step="1" value={moonIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Moon-phase board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="88" cy="126" r="30" fill="#facc15" />
        <line x1="120" y1="126" x2="220" y2="126" stroke="#fbbf24" strokeWidth="6" />
        <circle cx="320" cy="126" r="48" fill="#2563eb" />
        <circle cx="320" cy="126" r="82" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
        <circle cx={moonX} cy={moonY} r="18" fill="#e2e8f0" />
        <line x1="320" y1="126" x2={moonX} y2={moonY} stroke="#38bdf8" strokeWidth="3" />
        <text x="448" y="88" fill="#0f172a" fontSize="24" fontWeight="700">
          {phaseName}
        </text>
        <text x="448" y="124" fill="#334155" fontSize="19">
          Sun lights half the Moon
        </text>
        <text x="448" y="158" fill="#475569" fontSize="19">
          Earth sees different parts of that lit half
        </text>
      </svg>,
      <>
        {metricCard("Shown phase", phaseName, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Lighting rule", "always half lit", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Cause", "viewing geometry", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Not the cause", "Earth shadow", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Keep the Moon half lit by the Sun.", "Use Earth-view geometry to explain the visible phase.", "Save Earth's shadow for eclipse discussions only."],
      "This board keeps the phase cycle anchored in Sun-Earth-Moon geometry instead of the common shadow misconception.",
    );
  }

  if (lessonKey === "M14_L6") {
    const innerDistance = clamp(simMetricMeters, 1, 4);
    const outerDistance = Math.max(innerDistance + 0.6, clamp(simVectorMagnitude, 2, 8));
    const innerYear = Math.pow(innerDistance, 1.5);
    const outerYear = Math.pow(outerDistance, 1.5);
    const ratio = outerYear / innerYear;

    return renderPanel(
      "Outer lap puzzle",
      <>
        {sliderField(
          "Inner ring reach",
          `${formatSimulationNumber(innerDistance, 2)} AU-ish`,
          <input className="w-full" type="range" min="1" max="4" step="0.05" value={innerDistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Outer ring reach",
          `${formatSimulationNumber(outerDistance, 2)} AU-ish`,
          <input className="w-full" type="range" min="2" max="8" step="0.05" value={outerDistance} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
      </>,
      "Year-lap board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="128" cy="126" r="36" fill="#facc15" />
        <ellipse cx="128" cy="126" rx={70 + innerDistance * 24} ry={46 + innerDistance * 16} fill="none" stroke="#22c55e" strokeWidth="4" />
        <ellipse cx="128" cy="126" rx={110 + outerDistance * 24} ry={74 + outerDistance * 16} fill="none" stroke="#60a5fa" strokeWidth="4" />
        <text x="404" y="88" fill="#16a34a" fontSize="20">
          inner year: {formatSimulationNumber(innerYear, 2)}
        </text>
        <text x="404" y="124" fill="#2563eb" fontSize="20">
          outer year: {formatSimulationNumber(outerYear, 2)}
        </text>
        <text x="404" y="164" fill="#0f172a" fontSize="24" fontWeight="700">
          {"farther ring -> longer lap"}
        </text>
      </svg>,
      <>
        {metricCard("Inner period", formatSimulationNumber(innerYear, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Outer period", formatSimulationNumber(outerYear, 2), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Outer / inner", `${formatSimulationNumber(ratio, 2)} x`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Key distinction", "year != day", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Compare orbital distances directly.", "Treat year lap as orbital period.", "Keep orbital period separate from spin period."],
      "The outer-lap board turns year length into a distance pattern so the learner can generalize instead of memorizing isolated planet facts.",
    );
  }

  return renderPanel(
    "Lesson explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its lesson-specific Lantern-Ring panel.
    </div>,
    "Explorer placeholder",
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600">
      No generic fallback panel is being substituted here.
    </div>,
    <>
      {metricCard("Lesson", lessonKey, "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Status", "explicit panel required", "border-amber-200 bg-amber-50 text-amber-900")}
    </>,
    [
      "Each M14 lesson should own its explorer directly.",
      "If this appears, the M14 runner wiring needs a dedicated panel.",
      "The solar-system module should not silently fall through to another lesson view.",
    ],
    "This safety fallback is intentionally neutral so an unhandled M14 lesson key cannot masquerade as a different activity.",
  );
}
