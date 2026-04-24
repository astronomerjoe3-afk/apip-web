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

export default function F5SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simDensityMass,
  setSimDensityMass,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "F5_L1") {
    const earthAngle = clamp(simMetricMeters, 25, 335);
    const moonAngle = clamp(simVectorAngle, 0, 360);
    const thetaEarth = (earthAngle * Math.PI) / 180;
    const thetaMoon = (moonAngle * Math.PI) / 180;
    const earthX = 250 + 128 * Math.cos(thetaEarth);
    const earthY = 126 + 78 * Math.sin(thetaEarth);
    const moonX = earthX + 42 * Math.cos(thetaMoon);
    const moonY = earthY + 42 * Math.sin(thetaMoon);

    return renderPanel(
      "Earth-Moon-Sun system",
      <>
        {sliderField(
          "Earth route position",
          `${formatSimulationNumber(earthAngle, 0)} deg`,
          <input className="w-full" type="range" min="25" max="335" step="1" value={earthAngle} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Moon route position",
          `${formatSimulationNumber(moonAngle, 0)} deg`,
          <input className="w-full" type="range" min="0" max="360" step="1" value={moonAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Shared system board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="116" cy="126" r="42" fill="#facc15" />
        <text x="116" y="132" fill="#0f172a" fontSize="22" fontWeight="700" textAnchor="middle">Sun</text>
        <ellipse cx="250" cy="126" rx="128" ry="78" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="10 8" />
        <circle cx={earthX} cy={earthY} r="18" fill="#2563eb" />
        <text x={earthX} y={earthY + 42} fill="#334155" fontSize="16" textAnchor="middle">Earth</text>
        <circle cx={earthX} cy={earthY} r="42" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx={moonX} cy={moonY} r="10" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        <text x={moonX + 18} y={moonY - 14} fill="#334155" fontSize="14">Moon</text>
        <line x1="116" y1="126" x2={earthX} y2={earthY} stroke="#f59e0b" strokeWidth="4" />
        <line x1={earthX} y1={earthY} x2={moonX} y2={moonY} stroke="#60a5fa" strokeWidth="3" />
        <text x="430" y="74" fill="#64748b" fontSize="14" fontWeight="700" letterSpacing="0.08em">SYSTEM CLUES</text>
        <text x="430" y="102" fill="#0f172a" fontSize="18">
          <tspan x="430" dy="0">Earth mainly orbits</tspan>
          <tspan x="430" dy="22">the Sun.</tspan>
        </text>
        <text x="430" y="162" fill="#0f172a" fontSize="18">
          <tspan x="430" dy="0">The Moon mainly</tspan>
          <tspan x="430" dy="22">orbits Earth.</tspan>
        </text>
      </svg>,
      <>
        {metricCard("Main host", "Sun for Earth, Earth for Moon", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("System idea", "one linked board", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Key cause", "gravity + motion", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Scale warning", "not to literal scale", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Keep all three bodies on one board.", "Match each body to its main host.", "Use gravity and route language instead of invisible rails."],
      "This board keeps familiar sky ideas inside one Earth-Moon-Sun system instead of splitting them into unrelated facts.",
    );
  }

  if (lessonKey === "F5_L2") {
    const cityAngle = clamp(simVectorAngle, 0, 360);
    const radians = (cityAngle * Math.PI) / 180;
    const cityX = 320 + 88 * Math.cos(radians);
    const cityY = 126 + 88 * Math.sin(radians);
    const lit = cityX < 320;

    return renderPanel(
      "Day-night spin",
      <>
        {sliderField(
          "City position around the spin",
          `${formatSimulationNumber(cityAngle, 0)} deg`,
          <input className="w-full" type="range" min="0" max="360" step="1" value={cityAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
        {sliderField(
          "Hours since midnight",
          `${formatSimulationNumber((cityAngle / 15) % 24, 1)} h`,
          <input className="w-full" type="range" min="0" max="360" step="15" value={cityAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Rotation board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="92" cy="126" r="34" fill="#facc15" />
        <line x1="132" y1="126" x2="220" y2="126" stroke="#fbbf24" strokeWidth="8" />
        <circle cx="320" cy="126" r="96" fill="#2563eb" />
        <path d="M320 30 A96 96 0 0 1 320 222 Z" fill="#0f172a" />
        <line x1="320" y1="18" x2="320" y2="234" stroke="#f8fafc" strokeWidth="4" />
        <circle cx={cityX} cy={cityY} r="10" fill="#ef4444" />
        <text x="248" y="44" fill="#f59e0b" fontSize="18">day side</text>
        <text x="386" y="210" fill="#334155" fontSize="18">night side</text>
      </svg>,
      <>
        {metricCard("City state", lit ? "day" : "night", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Main cause", "rotation", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Not caused by", "one yearly orbit", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("One full spin", "about 24 hours", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Track one city through the lit and dark halves.", "Use spin before orbit.", "Keep one day tied to one full rotation."],
      "The day-night board turns the pattern into a rotation geometry story instead of a Sun-moving-around-Earth myth.",
    );
  }

  if (lessonKey === "F5_L3") {
    const tilt = clamp(simMetricMeters, 0, 30);
    const juneLike = clamp(simBias, 0, 1) < 0.5;
    const hemisphere = juneLike ? "north leans toward Sun" : "south leans toward Sun";

    return renderPanel(
      "Season tilt",
      <>
        {sliderField(
          "Axis tilt",
          `${formatSimulationNumber(tilt, 1)} deg`,
          <input className="w-full" type="range" min="0" max="30" step="0.5" value={tilt} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Orbit side",
          juneLike ? "June-like side" : "December-like side",
          <input className="w-full" type="range" min="0" max="1" step="1" value={juneLike ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Season comparison board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="120" cy="126" r="38" fill="#facc15" />
        <circle cx="340" cy={juneLike ? 84 : 168} r="54" fill="#2563eb" />
        <line x1={340 - 28} y1={(juneLike ? 84 : 168) + 58} x2={340 + 28} y2={(juneLike ? 84 : 168) - 58} stroke="#f8fafc" strokeWidth="4" />
        <line x1="158" y1="126" x2="286" y2={juneLike ? 84 : 168} stroke="#fbbf24" strokeWidth="5" />
        <text x="428" y="74" fill="#64748b" fontSize="14" fontWeight="700" letterSpacing="0.08em">SEASON READ</text>
        <text x="428" y="104" fill="#0f172a" fontSize="20" fontWeight="700">{hemisphere}</text>
        <text x="428" y="148" fill="#334155" fontSize="18">tilt = {formatSimulationNumber(tilt, 1)} deg</text>
        <text x="428" y="188" fill="#475569" fontSize="16">
          <tspan x="428" dy="0">direct sunlight follows</tspan>
          <tspan x="428" dy="18">which hemisphere leans in.</tspan>
        </text>
      </svg>,
      <>
        {metricCard("Orbit side", juneLike ? "June-like" : "December-like", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Sunward hemisphere", hemisphere, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Main cause", tilt > 0 ? "tilt + sunlight angle" : "tilt removed", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Key reminder", "not simple distance", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Keep axis direction fixed in space.", "Compare opposite hemispheres.", "Use sunlight angle instead of close-far distance."],
      "The seasons board keeps tilt and orbit position together so opposite seasonal patterns stay easy to explain.",
    );
  }

  if (lessonKey === "F5_L4") {
    const moonIndex = Math.round(clamp(simBias, 0, 7));
    const eclipseMode = Math.round(clamp(simMetricMeters, 0, 1));
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
      "Moon phase and eclipse",
      <>
        {sliderField(
          "Moon position",
          phaseName,
          <input className="w-full" type="range" min="0" max="7" step="1" value={moonIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Alignment mode",
          eclipseMode === 1 ? "special eclipse line-up" : "ordinary phase view",
          <input className="w-full" type="range" min="0" max="1" step="1" value={eclipseMode} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Phase geometry board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="84" cy="126" r="30" fill="#facc15" />
        <line x1="120" y1="126" x2="206" y2="126" stroke="#fbbf24" strokeWidth="6" />
        <circle cx="320" cy="126" r="28" fill="#2563eb" />
        <circle cx={moonX} cy={moonY} r="16" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        <circle cx="320" cy="126" r="112" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
        {eclipseMode === 1 ? <line x1="84" y1="126" x2="432" y2="126" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 8" /> : null}
        <text x="430" y="70" fill="#64748b" fontSize="14" fontWeight="700" letterSpacing="0.08em">CURRENT READ</text>
        <text x="430" y="100" fill="#0f172a" fontSize="20" fontWeight="700">{phaseName}</text>
        <text x="430" y="146" fill="#334155" fontSize="18">
          {eclipseMode === 1 ? "special shadow alignment" : "ordinary viewing-angle change"}
        </text>
        <text x="430" y="186" fill="#475569" fontSize="16">
          <tspan x="430" dy="0">the Moon stays half lit</tspan>
          <tspan x="430" dy="18">even while the phase changes.</tspan>
        </text>
      </svg>,
      <>
        {metricCard("Phase", phaseName, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Lit-half rule", "always true", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Mode", eclipseMode === 1 ? "special shadow case" : "ordinary phase case", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Myth check", "phases are not monthly eclipses", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Keep the Moon half lit all month.", "Use viewpoint language for phases.", "Use shadow language only for special eclipse alignment."],
      "This board keeps ordinary phases and rarer eclipses on one geometry map without letting them blur together.",
    );
  }

  if (lessonKey === "F5_L5") {
    const bodyIndex = Math.round(clamp(simBias, 0, 4));
    const hostIndex = Math.round(clamp(simMetricMeters, 0, 1));
    const bodyOptions = ["planet", "moon", "dwarf planet", "asteroid", "comet"] as const;
    const hostOptions = ["Sun", "larger world"] as const;
    const selectedBody = bodyOptions[bodyIndex];
    const selectedHost = hostOptions[hostIndex];

    return renderPanel(
      "Solar System family",
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
      "Solar System sorter board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="132" cy="126" r="42" fill="#facc15" />
        <text x="132" y="132" fill="#0f172a" fontSize="22" fontWeight="700" textAnchor="middle">Sun</text>
        <circle cx="132" cy="126" r="96" fill="none" stroke="#cbd5e1" strokeWidth="3" />
        <circle cx="132" cy="126" r="150" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 8" />
        {selectedHost === "larger world" ? (
          <>
            <circle cx="370" cy="126" r="22" fill="#60a5fa" />
            <circle cx="370" cy="126" r="42" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 8" />
            <text x="370" y="164" fill="#334155" fontSize="16" textAnchor="middle">larger world</text>
          </>
        ) : null}
        <circle
          cx={selectedHost === "Sun" ? 288 : 410}
          cy={selectedHost === "Sun" ? 126 : 92}
          r={selectedBody === "planet" ? 18 : selectedBody === "moon" ? 10 : 14}
          fill={selectedBody === "planet" ? "#60a5fa" : selectedBody === "moon" ? "#e2e8f0" : selectedBody === "dwarf planet" ? "#a78bfa" : selectedBody === "asteroid" ? "#f97316" : "#38bdf8"}
        />
        <text x="456" y="74" fill="#64748b" fontSize="14" fontWeight="700" letterSpacing="0.08em">CLASSIFICATION CLUE</text>
        <text x="456" y="102" fill="#0f172a" fontSize="20" fontWeight="700">{selectedBody}</text>
        <text x="456" y="144" fill="#334155" fontSize="18">main host: {selectedHost}</text>
        <text x="456" y="188" fill="#475569" fontSize="16">
          <tspan x="456" dy="0">body type plus host</tspan>
          <tspan x="456" dy="18">keeps the family sorted.</tspan>
        </text>
      </svg>,
      <>
        {metricCard("Selected body", selectedBody, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Main host", selectedHost, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Family idea", "Sun-centered system", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Trap to avoid", "not everything is a planet", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Sort by body type and host together.", "Keep moons different from Sun-orbiting worlds.", "Separate rocky small bodies from icy visitors."],
      "The sorter helps students classify by role and host instead of flattening the Solar System into one category.",
    );
  }

  if (lessonKey === "F5_L6") {
    const sharedDays = Math.round(clamp(simDensityMass, 1, 6));
    const innerLaps = Math.round(clamp(simBias, 2, 8));
    const outerLag = Math.round(clamp(simMetricMeters, 1, 4));
    const outerLaps = Math.max(1, innerLaps - outerLag);
    const ratioLabel = `${innerLaps}:${outerLaps}`;

    return renderPanel(
      "Sky motion and scale",
      <>
        {sliderField(
          "Shared time window",
          `${sharedDays} day${sharedDays === 1 ? "" : "s"}`,
          <input className="w-full" type="range" min="1" max="6" step="1" value={sharedDays} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Inner-world laps in that shared time window",
          `${innerLaps} laps`,
          <input className="w-full" type="range" min="2" max="8" step="1" value={innerLaps} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "How much slower is the outer world?",
          `${outerLag} fewer lap${outerLag === 1 ? "" : "s"}`,
          <input className="w-full" type="range" min="1" max="4" step="1" value={outerLag} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Motion and scale board",
      <svg viewBox="0 0 640 250" className="w-full">
        <circle cx="116" cy="126" r="34" fill="#facc15" />
        <circle cx="276" cy="126" r="44" fill="none" stroke="#60a5fa" strokeWidth="4" />
        <circle cx="276" cy="126" r="84" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8 8" />
        <text x="320" y="30" fill="#334155" fontSize="16" textAnchor="middle">same time window = {sharedDays} day{sharedDays === 1 ? "" : "s"}</text>
        <text x="276" y="118" fill="#0f172a" fontSize="18" textAnchor="middle">inner</text>
        <text x="276" y="140" fill="#0f172a" fontSize="18" textAnchor="middle">{innerLaps} laps</text>
        <text x="450" y="118" fill="#0f172a" fontSize="18" textAnchor="middle">outer</text>
        <text x="450" y="140" fill="#0f172a" fontSize="18" textAnchor="middle">{outerLaps} laps</text>
        <text x="450" y="184" fill="#475569" fontSize="16" textAnchor="middle">farther ring means fewer laps in the same time</text>
        <rect x="66" y="190" width="468" height="14" rx="7" fill="#cbd5e1" />
        <rect x="66" y="190" width="112" height="14" rx="7" fill="#38bdf8" />
        <text x="300" y="226" fill="#334155" fontSize="16" textAnchor="middle">scale bar is compressed for the drawing</text>
      </svg>,
      <>
        {metricCard("Day clue", `${sharedDays} day${sharedDays === 1 ? "" : "s"} is a rotation-timescale window`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Year clue", `inner vs outer laps = ${ratioLabel}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Apparent motion", "what we see in the sky", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Scale warning", "drawing is compressed", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Compare both worlds over one shared time window.",
        "If the outer ring is farther out, it should complete fewer laps in that same time.",
        "Use one day for rotation, and one year for orbit, instead of collapsing them together.",
      ],
      "This board compares two orbit sizes over the same number of days. When the outer world completes fewer laps than the inner world, students can see why a farther orbit means a longer year, even though the sketch compresses the real distances.",
    );
  }

  return null;
}
