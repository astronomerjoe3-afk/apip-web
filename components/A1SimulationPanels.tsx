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
          <h4 className="text-lg font-semibold text-slate-900">Probe-Field lens</h4>
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

export default function A1SimulationPanels({
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
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A1_L1") {
    const u = clamp(simMetricMeters, -5, 20);
    const a = clamp(simVectorMagnitude, -6, 6);
    const t = clamp(simVectorAngle, 0, 8);
    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;
    const avg = (u + v) / 2;
    return renderPanel(
      "Motion card",
      <>
        {sliderField("Start pace", `${formatSimulationNumber(u, 1)} m/s`, <input className="w-full" type="range" min="-5" max="20" step="0.5" value={u} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Steady shift", `${formatSimulationNumber(a, 1)} m/s^2`, <input className="w-full" type="range" min="-6" max="6" step="0.2" value={a} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Clock count", `${formatSimulationNumber(t, 1)} s`, <input className="w-full" type="range" min="0" max="8" step="0.2" value={t} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Motion card board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="28" width="592" height="188" rx="28" fill="#eff6ff" />
        <text x="48" y="58" fill="#0f172a" fontSize="22" fontWeight="700">One constant-acceleration story fills one five-slot motion card</text>
        <g transform="translate(54 94)">
          {["u", "v", "s", "a", "t"].map((slot, index) => (
            <g key={slot} transform={`translate(${index * 112} 0)`}>
              <rect x="0" y="0" width="96" height="78" rx="18" fill="#fff" stroke="#93c5fd" strokeWidth="3" />
              <text x="16" y="28" fill="#1d4ed8" fontSize="24" fontWeight="700">{slot}</text>
              <text x="16" y="54" fill="#334155" fontSize="20">{slot === "u" ? formatSimulationNumber(u, 1) : slot === "v" ? formatSimulationNumber(v, 1) : slot === "s" ? formatSimulationNumber(s, 1) : slot === "a" ? formatSimulationNumber(a, 1) : formatSimulationNumber(t, 1)}</text>
            </g>
          ))}
        </g>
        <text x="70" y="202" fill="#475569" fontSize="18">Read the card as one linked event, then choose an equation that matches the known and unknown entries.</text>
      </svg>,
      <>
        {metricCard("End pace", `${formatSimulationNumber(v, 2)} m/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Run span", `${formatSimulationNumber(s, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Average pace", `${formatSimulationNumber(avg, 2)} m/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Lane status", a === 0 ? "uniform speed" : "steady acceleration", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["The card works only because acceleration stays constant.", "Keep the sign of acceleration attached to direction.", "Use the card to decide what is known, not to memorize isolated letters."],
      "This explorer keeps SUVAT inside one constant-acceleration motion card, which is the cleanest way to stop it from turning into blind formula selection.",
    );
  }

  if (lessonKey === "A1_L2") {
    const u = clamp(simMetricMeters, -4, 18);
    const accelMag = clamp(simVectorMagnitude, 0, 6);
    const negative = clamp(Math.round(simBias), 0, 1) === 1;
    const a = negative ? -accelMag : accelMag;
    const t = clamp(simVectorAngle, 0, 8);
    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;
    const paceScale = 18;
    const endX = 130 + (v / paceScale) * 180;
    return renderPanel(
      "Steady-Push lane",
      <>
        {sliderField("Start pace", `${formatSimulationNumber(u, 1)} m/s`, <input className="w-full" type="range" min="-4" max="18" step="0.5" value={u} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Steady-shift size", `${formatSimulationNumber(accelMag, 1)} m/s^2`, <input className="w-full" type="range" min="0" max="6" step="0.2" value={accelMag} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Steady-shift direction", negative ? "negative" : "positive", <input className="w-full" type="range" min="0" max="1" step="1" value={negative ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Time in lane", `${formatSimulationNumber(t, 1)} s`, <input className="w-full" type="range" min="0" max="8" step="0.2" value={t} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Lane board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="26" y="24" width="588" height="194" rx="28" fill="#ecfeff" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">A steady push changes the velocity arrow by the same amount each second</text>
        <line x1="70" y1="150" x2="570" y2="150" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
        <line x1="130" y1="112" x2={130 + (u / paceScale) * 180} y2="112" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <polygon points={`${130 + (u / paceScale) * 180},112 ${118 + (u / paceScale) * 180},106 ${118 + (u / paceScale) * 180},118`} fill="#2563eb" />
        <text x="74" y="102" fill="#1d4ed8" fontSize="18">start pace</text>
        <line x1="130" y1="88" x2={endX} y2="88" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" />
        <polygon points={`${endX},88 ${endX - 12},82 ${endX - 12},94`} fill="#0f766e" />
        <text x="74" y="78" fill="#0f766e" fontSize="18">end pace</text>
        <line x1="320" y1="176" x2="320" y2={a >= 0 ? 110 : 210} stroke="#f97316" strokeWidth="9" strokeLinecap="round" />
        <polygon points={a >= 0 ? "320,110 312,124 328,124" : "320,210 312,196 328,196"} fill="#f97316" />
        <text x="338" y="168" fill="#c2410c" fontSize="18">steady shift</text>
        <text x="70" y="204" fill="#475569" fontSize="18">Negative acceleration still belongs on the same card; it just points opposite to the chosen positive direction.</text>
      </svg>,
      <>
        {metricCard("End pace", `${formatSimulationNumber(v, 2)} m/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Run span", `${formatSimulationNumber(s, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Velocity change", `${formatSimulationNumber(a * t, 2)} m/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Signed acceleration", `${formatSimulationNumber(a, 2)} m/s^2`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Equal times create equal changes in velocity.", "Signed acceleration tells direction of the change, not simply faster or slower.", "Displacement still depends on the whole velocity story over time."],
      "The lane view keeps signed acceleration visible, which is the quickest way to stop negative acceleration from turning into a memorized buzzword.",
    );
  }

  if (lessonKey === "A1_L3") {
    const speed = clamp(simVectorMagnitude, 6, 36);
    const angle = clamp(simVectorAngle, 10, 80);
    const time = clamp(simMetricMeters, 0, 3.6);
    const g = 9.8;
    const radians = (angle * Math.PI) / 180;
    const ux = speed * Math.cos(radians);
    const uy = speed * Math.sin(radians);
    const x = ux * time;
    const y = uy * time - 0.5 * g * time * time;
    const vy = uy - g * time;
    const topTime = uy / g;
    return renderPanel(
      "Launch split",
      <>
        {sliderField("Launch speed", `${formatSimulationNumber(speed, 1)} m/s`, <input className="w-full" type="range" min="6" max="36" step="0.5" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Launch angle", `${formatSimulationNumber(angle, 0)} deg`, <input className="w-full" type="range" min="10" max="80" step="1" value={angle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Flight clock", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0" max="3.6" step="0.05" value={time} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Launch Sky board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="198" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Split the launch arrow before you read the curved path</text>
        <line x1="70" y1="188" x2="580" y2="188" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
        <path d="M90 188 Q220 70 350 104 T560 188" stroke="#2563eb" strokeWidth="8" fill="none" />
        <line x1="96" y1="184" x2="190" y2="126" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <line x1="96" y1="184" x2="176" y2="184" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" strokeDasharray="8 8" />
        <line x1="176" y1="184" x2="176" y2="112" stroke="#f97316" strokeWidth="7" strokeLinecap="round" strokeDasharray="8 8" />
        <circle cx={96 + x * 10} cy={184 - Math.max(y, -2) * 8} r="8" fill="#7c3aed" />
        <line x1={96 + x * 10} y1={184 - Math.max(y, -2) * 8} x2={156 + x * 10} y2={184 - Math.max(y, -2) * 8} stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <line x1={96 + x * 10} y1={184 - Math.max(y, -2) * 8} x2={96 + x * 10} y2={132 - vy * 2} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
        <text x="196" y="176" fill="#0f766e" fontSize="18">u_x stays constant</text>
        <text x="190" y="110" fill="#c2410c" fontSize="18">u_y changes under gravity</text>
      </svg>,
      <>
        {metricCard("u_x", `${formatSimulationNumber(ux, 2)} m/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("u_y", `${formatSimulationNumber(uy, 2)} m/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("v_y now", `${formatSimulationNumber(vy, 2)} m/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Top reached at", `${formatSimulationNumber(topTime, 2)} s`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Horizontal and vertical motion are solved separately.", "Time is the bridge linking the two components.", "At the highest point, vertical velocity can be zero while acceleration remains downward."],
      "This board stops projectile motion from turning into one mysterious curve by making the component split visible at every moment.",
    );
  }

  if (lessonKey === "A1_L4") {
    const speed = clamp(simVectorMagnitude, 2, 20);
    const radius = clamp(simMetricMeters, 2, 12);
    const mass = clamp(simDensityMass, 1, 8);
    const ac = (speed * speed) / radius;
    const fc = mass * ac;
    return renderPanel(
      "Orbit Ring",
      <>
        {sliderField("Orbital speed", `${formatSimulationNumber(speed, 1)} m/s`, <input className="w-full" type="range" min="2" max="20" step="0.2" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Ring radius", `${formatSimulationNumber(radius, 1)} m`, <input className="w-full" type="range" min="2" max="12" step="0.2" value={radius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Probe mass", `${formatSimulationNumber(mass, 1)} kg`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={mass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Ring board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="22" width="584" height="198" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Constant speed still needs inward turning</text>
        <circle cx="320" cy="128" r="78" fill="none" stroke="#93c5fd" strokeWidth="10" />
        <circle cx="398" cy="128" r="10" fill="#2563eb" />
        <line x1="398" y1="128" x2="398" y2="76" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" />
        <polygon points="398,76 390,90 406,90" fill="#0f766e" />
        <line x1="398" y1="128" x2="320" y2="128" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
        <polygon points="320,128 334,120 334,136" fill="#f97316" />
        <circle cx="320" cy="128" r="14" fill="#1e293b" />
        <text x="418" y="86" fill="#0f766e" fontSize="18">tangent velocity</text>
        <text x="246" y="116" fill="#c2410c" fontSize="18">centripetal pull</text>
        <text x="70" y="202" fill="#475569" fontSize="18">The inward arrow changes direction continuously; there is no outward balancing force on the probe.</text>
      </svg>,
      <>
        {metricCard("Centripetal a", `${formatSimulationNumber(ac, 2)} m/s^2`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Center pull", `${formatSimulationNumber(fc, 2)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Radius", `${formatSimulationNumber(radius, 1)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Speed story", "direction changing", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Circular motion needs inward acceleration even at constant speed.", "Centripetal acceleration points toward the center.", "Force and acceleration are inward because the velocity arrow is turning."],
      "The ring explorer is built to protect the key misconception here: circular motion requires an inward pull, not an outward one.",
    );
  }

  if (lessonKey === "A1_L5") {
    const sourceMass = clamp(simDensityMass, 2, 12);
    const radius = clamp(simMetricMeters, 2, 10);
    const testMass = clamp(simDensityVolume, 0.5, 6);
    const field = (sourceMass * 10) / (radius * radius);
    const force = field * testMass;
    return renderPanel(
      "Gravity Beacon",
      <>
        {sliderField("Beacon mass scale", `${formatSimulationNumber(sourceMass, 1)} units`, <input className="w-full" type="range" min="2" max="12" step="0.2" value={sourceMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Probe distance", `${formatSimulationNumber(radius, 1)} units`, <input className="w-full" type="range" min="2" max="10" step="0.2" value={radius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Test mass", `${formatSimulationNumber(testMass, 1)} kg`, <input className="w-full" type="range" min="0.5" max="6" step="0.1" value={testMass} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Field map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="26" y="20" width="588" height="202" rx="28" fill="#f8fafc" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Mass beacons fill space with inward pull maps</text>
        <circle cx="320" cy="128" r="28" fill="#334155" />
        <circle cx="320" cy="128" r="56" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="320" cy="128" r="96" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx={320 + radius * 18} cy="128" r="9" fill="#7c3aed" />
        {[[430, 128], [320, 40], [210, 128], [320, 216]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x} y1={y} x2={320 + (x - 320) * 0.65} y2={128 + (y - 128) * 0.65} stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
            <polygon points={`${320 + (x - 320) * 0.65},${128 + (y - 128) * 0.65} ${320 + (x - 320) * 0.72 + (y === 128 ? 0 : y > 128 ? -6 : 6)},${128 + (y - 128) * 0.72 + (x === 320 ? 0 : x > 320 ? 6 : -6)} ${320 + (x - 320) * 0.72 + (y === 128 ? 0 : y > 128 ? 6 : -6)},${128 + (y - 128) * 0.72 + (x === 320 ? 0 : x > 320 ? -6 : 6)}`} fill="#0f766e" />
          </g>
        ))}
        <text x="424" y="116" fill="#0f766e" fontSize="18">field points inward</text>
        <text x="70" y="202" fill="#475569" fontSize="18">The field belongs to the location around the source mass. Changing the test mass changes force, not the field map itself.</text>
      </svg>,
      <>
        {metricCard("Field strength", `${formatSimulationNumber(field, 2)} N/kg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Force on probe", `${formatSimulationNumber(force, 2)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Distance effect", radius <= 4 ? "strong region" : "weaker region", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Map rule", "radial inward", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Field strength is pull per kilogram at that point.", "Distance changes the field strongly because of the inverse-square pattern.", "Heavier test masses feel more force in the same field."],
      "This board makes it easier to separate the field map in space from the force on a chosen probe, which is the central gravity-field distinction.",
    );
  }

  if (lessonKey === "A1_L6") {
    const speed = clamp(simVectorMagnitude, 2, 18);
    const radius = clamp(simMetricMeters, 2, 10);
    const sourceMass = clamp(simDensityMass, 4, 20);
    const required = (speed * speed) / radius;
    const localField = (sourceMass * 5) / (radius * radius);
    const match = Math.abs(required - localField) < 0.6;
    return renderPanel(
      "Orbit Bridge",
      <>
        {sliderField("Orbit speed", `${formatSimulationNumber(speed, 1)} m/s`, <input className="w-full" type="range" min="2" max="18" step="0.2" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Orbit radius", `${formatSimulationNumber(radius, 1)} units`, <input className="w-full" type="range" min="2" max="10" step="0.2" value={radius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Source mass scale", `${formatSimulationNumber(sourceMass, 1)} units`, <input className="w-full" type="range" min="4" max="20" step="0.5" value={sourceMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Bridge board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="194" rx="28" fill="#f5f3ff" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Compare the orbit requirement with the local gravitational field</text>
        <circle cx="188" cy="136" r="52" fill="#cbd5f5" />
        <circle cx="250" cy="136" r="8" fill="#2563eb" />
        <line x1="250" y1="136" x2="250" y2="88" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
        <line x1="250" y1="136" x2="188" y2="136" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
        <text x="84" y="94" fill="#0f766e" fontSize="17">tangent velocity</text>
        <text x="76" y="156" fill="#c2410c" fontSize="17">gravity inward</text>
        <rect x="350" y="72" width="200" height="100" rx="20" fill="#fff" stroke="#c4b5fd" strokeWidth="3" />
        <text x="370" y="104" fill="#6d28d9" fontSize="18" fontWeight="700">required a_c = {formatSimulationNumber(required, 2)}</text>
        <text x="370" y="134" fill="#7c3aed" fontSize="18" fontWeight="700">local g = {formatSimulationNumber(localField, 2)}</text>
        <text x="370" y="164" fill={match ? "#15803d" : "#b45309"} fontSize="18" fontWeight="700">{match ? "bridge match" : "bridge mismatch"}</text>
        <text x="70" y="202" fill="#475569" fontSize="18">A circular orbit works when the inward turning requirement can be supplied by the inward gravitational field at that radius.</text>
      </svg>,
      <>
        {metricCard("Required a_c", `${formatSimulationNumber(required, 2)} m/s^2`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Local g field", `${formatSimulationNumber(localField, 2)} m/s^2`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Bridge state", match ? "gravity can supply it" : "requirements do not match", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Orbit story", "free fall + sideways motion", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Required centripetal acceleration comes from circular motion.", "Local gravitational field comes from the source mass and radius.", "Orbiting is the place where these two inward stories meet."],
      "This final explorer is designed to make Module A1 feel unified: the same inward turning requirement from the Orbit Ring can be supplied by the Gravity Beacon field.",
    );
  }

  return null;
}
