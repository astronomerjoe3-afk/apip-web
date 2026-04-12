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
          <h4 className="text-lg font-semibold text-slate-900">Wave-Route lens</h4>
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

function sinePath(
  width: number,
  amplitude: number,
  cycles: number,
  phaseDeg: number,
  yMid: number,
): string {
  const points: string[] = [];
  const phase = (phaseDeg * Math.PI) / 180;
  for (let index = 0; index <= 80; index += 1) {
    const x = 40 + ((width - 80) * index) / 80;
    const angle = (index / 80) * Math.PI * 2 * cycles + phase;
    const y = yMid - Math.sin(angle) * amplitude;
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function standingPath(
  width: number,
  amplitude: number,
  harmonic: number,
  snapshotDeg: number,
  yMid: number,
): string {
  const points: string[] = [];
  const snapshot = Math.cos((snapshotDeg * Math.PI) / 180);
  for (let index = 0; index <= 100; index += 1) {
    const fraction = index / 100;
    const x = 60 + ((width - 120) * fraction);
    const y = yMid - amplitude * Math.sin(harmonic * Math.PI * fraction) * snapshot;
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function oscilloscopeTracePath(
  width: number,
  peakDivisions: number,
  cycleDivisions: number,
  phaseDeg: number,
  yMid: number,
): string {
  const points: string[] = [];
  const phase = (phaseDeg * Math.PI) / 180;
  const gridWidth = width - 120;
  const pixelsPerDivision = gridWidth / 8;
  const amplitude = peakDivisions * 12;
  for (let index = 0; index <= 120; index += 1) {
    const x = 60 + (gridWidth * index) / 120;
    const divisionsAcross = (x - 60) / pixelsPerDivision;
    const angle = ((divisionsAcross / cycleDivisions) * Math.PI * 2) + phase;
    const y = yMid - Math.sin(angle) * amplitude;
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

function sampleY(
  width: number,
  amplitude: number,
  cycles: number,
  phaseDeg: number,
  fraction: number,
): number {
  const angle = (fraction * Math.PI * 2 * cycles) + ((phaseDeg * Math.PI) / 180);
  return -Math.sin(angle) * amplitude;
}

export default function A3SimulationPanels({
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
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A3_L1") {
    const amplitudeA = clamp(simVectorMagnitude, 1, 5);
    const amplitudeB = clamp(simDensityMass, 1, 5);
    const phaseDiff = clamp(simVectorAngle, 0, 180);
    const sampleFraction = clamp(simMetricMeters, 0, 1);
    const sampleX = 40 + ((620 - 80) * sampleFraction);
    const y1 = amplitudeA * Math.sin(sampleFraction * Math.PI * 2);
    const y2 = amplitudeB * Math.sin((sampleFraction * Math.PI * 2) + ((phaseDiff * Math.PI) / 180));
    const sum = y1 + y2;
    const outcome =
      Math.abs(sum) < 0.2
        ? "near cancellation"
        : y1 * y2 < 0
          ? "partial cancellation"
          : Math.abs(sum) > Math.max(Math.abs(y1), Math.abs(y2))
            ? "reinforcement"
            : "partial reinforcement";

    return renderPanel(
      "Superposition",
      <>
        {sliderField("Wave A amplitude", `${formatSimulationNumber(amplitudeA, 1)} mm`, <input className="w-full" type="range" min="1" max="5" step="0.1" value={amplitudeA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Wave B amplitude", `${formatSimulationNumber(amplitudeB, 1)} mm`, <input className="w-full" type="range" min="1" max="5" step="0.1" value={amplitudeB} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Phase difference", `${formatSimulationNumber(phaseDiff, 0)} deg`, <input className="w-full" type="range" min="0" max="180" step="1" value={phaseDiff} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Sample position/time", `${formatSimulationNumber(sampleFraction, 2)}`, <input className="w-full" type="range" min="0" max="1" step="0.01" value={sampleFraction} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Superposition board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#eff6ff" />
        <text x="44" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Same place + same time -&gt; add the displacements</text>
        <text x="44" y="82" fill="#334155" fontSize="16">Wave A</text>
        <text x="44" y="148" fill="#334155" fontSize="16">Wave B</text>
        <text x="44" y="214" fill="#334155" fontSize="16">Resultant</text>
        <line x1="40" y1="92" x2="580" y2="92" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="40" y1="158" x2="580" y2="158" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="40" y1="224" x2="580" y2="224" stroke="#cbd5e1" strokeWidth="2" />
        <polyline points={sinePath(620, amplitudeA * 8, 1.5, 0, 92)} fill="none" stroke="#2563eb" strokeWidth="5" />
        <polyline points={sinePath(620, amplitudeB * 8, 1.5, phaseDiff, 158)} fill="none" stroke="#7c3aed" strokeWidth="5" />
        <polyline points={Array.from({ length: 81 }).map((_, index) => {
          const fraction = index / 80;
          const x = 40 + ((620 - 80) * fraction);
          const y = 224 + sampleY(620, amplitudeA * 8, 1.5, 0, fraction) + sampleY(620, amplitudeB * 8, 1.5, phaseDiff, fraction);
          return `${x},${y}`;
        }).join(" ")} fill="none" stroke="#0f766e" strokeWidth="5" />
        <line x1={sampleX} y1="62" x2={sampleX} y2="244" stroke="#f97316" strokeWidth="3" strokeDasharray="8 7" />
        <circle cx={sampleX} cy={92 - y1 * 8} r="6" fill="#2563eb" />
        <circle cx={sampleX} cy={158 - y2 * 8} r="6" fill="#7c3aed" />
        <circle cx={sampleX} cy={224 - sum * 8} r="6" fill="#0f766e" />
      </svg>,
      <>
        {metricCard("Wave A at sample", `${formatSimulationNumber(y1, 2)} mm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Wave B at sample", `${formatSimulationNumber(y2, 2)} mm`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Resultant", `${formatSimulationNumber(sum, 2)} mm`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Overlap type", outcome, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Superposition is an addition rule, not a handoff rule.", "Use the same place and the same instant for both waves.", "Opposite signs reduce the resultant; matching signs increase it."],
      "This board keeps both contributions and the sum visible together so the learner cannot skip straight from phase language to a guessed outcome.",
    );
  }

  if (lessonKey === "A3_L2") {
    const length = clamp(simMetricMeters, 0.6, 1.8);
    const speed = clamp(simVectorMagnitude, 60, 240);
    const harmonic = Math.round(clamp(simBias, 1, 4));
    const amplitude = clamp(simDensityMass, 1, 4);
    const snapshot = clamp(simSpread, 0, 180);
    const wavelength = (2 * length) / harmonic;
    const frequency = speed / wavelength;
    const nodes = harmonic + 1;
    const antinodes = harmonic;

    return renderPanel(
      "Standing mode",
      <>
        {sliderField("String length", `${formatSimulationNumber(length, 2)} m`, <input className="w-full" type="range" min="0.6" max="1.8" step="0.02" value={length} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Wave speed", `${formatSimulationNumber(speed, 0)} m/s`, <input className="w-full" type="range" min="60" max="240" step="1" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Harmonic", `${harmonic}`, <input className="w-full" type="range" min="1" max="4" step="1" value={harmonic} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Snapshot phase", `${formatSimulationNumber(snapshot, 0)} deg`, <input className="w-full" type="range" min="0" max="180" step="1" value={snapshot} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Stationary-wave board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#eef2ff" />
        <text x="44" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Only wavelength fits that satisfy the boundary survive</text>
        <line x1="60" y1="156" x2="560" y2="156" stroke="#94a3b8" strokeWidth="3" />
        <polyline points={standingPath(620, amplitude * 12, harmonic, snapshot, 156)} fill="none" stroke="#2563eb" strokeWidth="6" />
        {Array.from({ length: nodes }).map((_, index) => {
          const x = 60 + (500 * index) / (nodes - 1);
          return (
            <circle key={x} cx={x} cy="156" r="6" fill="#0f766e" />
          );
        })}
        <text x="60" y="196" fill="#334155" fontSize="15">fixed end</text>
        <text x="492" y="196" fill="#334155" fontSize="15">fixed end</text>
      </svg>,
      <>
        {metricCard("Wavelength", `${formatSimulationNumber(wavelength, 3)} m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Frequency", `${formatSimulationNumber(frequency, 1)} Hz`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Nodes", `${nodes}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Antinodes", `${antinodes}`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["A stationary wave is built from matched opposite-traveling waves.", "Nodes stay fixed while antinodes oscillate most strongly.", "For a fixed string, harmonic number sets both node count and fitted wavelength."],
      "The explorer keeps boundary fit, node count, and frequency in one place so the mode number feels like a real geometric constraint rather than a label.",
    );
  }

  if (lessonKey === "A3_L3") {
    const wavelengthNm = clamp(simVectorMagnitude, 400, 700);
    const slitGapMm = clamp(simDensityMass, 0.10, 0.50);
    const screenDistance = clamp(simMetricMeters, 0.5, 2.0);
    const halfStep = Math.round(clamp(simBias, 0, 6));
    const pathMultiple = halfStep / 2;
    const fringeSpacingMm = ((wavelengthNm * 1e-9 * screenDistance) / (slitGapMm * 1e-3)) * 1000;
    const pointOffsetMm = pathMultiple * fringeSpacingMm;
    const outcome = halfStep % 2 === 0 ? "bright" : "dark";
    const targetY = 140 - clamp(pointOffsetMm * 10, -72, 72);

    return renderPanel(
      "Interference route",
      <>
        {sliderField("Wavelength", `${formatSimulationNumber(wavelengthNm, 0)} nm`, <input className="w-full" type="range" min="400" max="700" step="1" value={wavelengthNm} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Slit separation", `${formatSimulationNumber(slitGapMm, 2)} mm`, <input className="w-full" type="range" min="0.10" max="0.50" step="0.01" value={slitGapMm} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Screen distance", `${formatSimulationNumber(screenDistance, 2)} m`, <input className="w-full" type="range" min="0.5" max="2.0" step="0.01" value={screenDistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Path difference step", `${formatSimulationNumber(pathMultiple, 1)} lambda`, <input className="w-full" type="range" min="0" max="6" step="1" value={halfStep} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Interference board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#f8fafc" />
        <text x="44" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Compare both routes before you call the point bright or dark</text>
        <rect x="98" y="100" width="8" height="16" rx="4" fill="#334155" />
        <rect x="98" y="164" width="8" height="16" rx="4" fill="#334155" />
        <rect x="506" y="76" width="8" height="132" rx="4" fill="#cbd5e1" />
        <line x1="106" y1="108" x2="506" y2={targetY} stroke="#2563eb" strokeWidth="4" />
        <line x1="106" y1="172" x2="506" y2={targetY} stroke="#7c3aed" strokeWidth="4" />
        <circle cx="506" cy={targetY} r="7" fill="#0f766e" />
        <text x="390" y="98" fill="#334155" fontSize="16">delta = {formatSimulationNumber(pathMultiple, 1)} lambda</text>
        <text x="518" y={targetY - 10} fill="#0f766e" fontSize="16">{outcome}</text>
      </svg>,
      <>
        {metricCard("Fringe spacing", `${formatSimulationNumber(fringeSpacingMm, 2)} mm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Point offset", `${formatSimulationNumber(pointOffsetMm, 2)} mm`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Path difference", `${formatSimulationNumber(pathMultiple, 1)} lambda`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Prediction", outcome, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Whole-number lambda differences give bright points.", "Half-integer lambda differences give dark points.", "Fringe spacing is the geometry link between wavelength, screen distance, and slit gap."],
      "This board forces route comparison first, then turns the path-difference condition into a screen prediction instead of treating the bright-dark pattern as decorative.",
    );
  }

  if (lessonKey === "A3_L4") {
    const linesPerMm = Math.round(clamp(simDensityMass, 200, 1200));
    const wavelengthNm = clamp(simVectorMagnitude, 400, 700);
    const order = Math.round(clamp(simBias, 0, 4));
    const spacing = 1e-3 / linesPerMm;
    const ratio = order === 0 ? 0 : (order * wavelengthNm * 1e-9) / spacing;
    const allowed = ratio <= 1;
    const angleDeg = allowed ? (Math.asin(ratio) * 180) / Math.PI : Number.NaN;
    const maxOrder = Math.floor(spacing / (wavelengthNm * 1e-9));
    const rayLength = 170;
    const theta = allowed ? (angleDeg * Math.PI) / 180 : 0;
    const endX = 260 + (rayLength * Math.cos(theta));
    const endY = 168 - (rayLength * Math.sin(theta));

    return renderPanel(
      "Diffraction grating",
      <>
        {sliderField("Grating density", `${linesPerMm} lines/mm`, <input className="w-full" type="range" min="200" max="1200" step="1" value={linesPerMm} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Wavelength", `${formatSimulationNumber(wavelengthNm, 0)} nm`, <input className="w-full" type="range" min="400" max="700" step="1" value={wavelengthNm} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Order", `${order}`, <input className="w-full" type="range" min="0" max="4" step="1" value={order} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Grating board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#eff6ff" />
        <text x="44" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Allowed orders are angles that satisfy n lambda = d sin(theta)</text>
        <rect x="250" y="84" width="10" height="168" rx="4" fill="#334155" />
        {Array.from({ length: 8 }).map((_, index) => (
          <line key={index} x1={246} y1={92 + index * 18} x2={264} y2={92 + index * 18} stroke="#93c5fd" strokeWidth="3" />
        ))}
        <line x1="260" y1="168" x2="448" y2="168" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 7" />
        {allowed ? (
          <>
            <line x1="260" y1="168" x2={endX} y2={endY} stroke="#2563eb" strokeWidth="5" />
            <text x={endX + 8} y={endY} fill="#2563eb" fontSize="16">order {order}</text>
          </>
        ) : (
          <text x="328" y="134" fill="#b91c1c" fontSize="20" fontWeight="700">order {order} forbidden</text>
        )}
      </svg>,
      <>
        {metricCard("Spacing d", `${formatSimulationNumber(spacing * 1e6, 3)} um`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("sin(theta)", `${formatSimulationNumber(ratio, 3)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Angle", allowed ? `${formatSimulationNumber(angleDeg, 1)} deg` : "not allowed", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Highest order", `${maxOrder}`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Grating spacing is the reciprocal of line density.", "Higher order is allowed only while sin(theta) stays at or below 1.", "Order 0 is the straight-through central maximum."],
      "The grating explorer keeps spacing, order, and angle on one board so learners see why some orders exist and others are impossible.",
    );
  }

  if (lessonKey === "A3_L5") {
    const preset = Math.round(clamp(simBias, 0, 2));
    const incidentDeg = Math.round(clamp(simVectorAngle, 0, 80));
    const presets = [
      { label: "glass to air", n1: 1.5, n2: 1.0 },
      { label: "water to air", n1: 1.33, n2: 1.0 },
      { label: "air to glass", n1: 1.0, n2: 1.5 },
    ];
    const { label, n1, n2 } = presets[preset];
    const criticalDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;
    const sinOut = (n1 / n2) * Math.sin((incidentDeg * Math.PI) / 180);
    const tir = criticalDeg !== null && incidentDeg > criticalDeg;
    const refractedDeg = !tir ? (Math.asin(clamp(sinOut, -1, 1)) * 180) / Math.PI : null;
    const bends = n2 > n1 ? "toward normal" : "away from normal";
    const originX = 320;
    const originY = 150;
    const incidentLength = 120;
    const incidentX = originX - (incidentLength * Math.sin((incidentDeg * Math.PI) / 180));
    const incidentY = originY - (incidentLength * Math.cos((incidentDeg * Math.PI) / 180));
    const responseLength = 120;
    const outAngle = tir ? incidentDeg : (refractedDeg ?? incidentDeg);
    const responseX = originX + (responseLength * Math.sin((outAngle * Math.PI) / 180));
    const responseY = tir
      ? originY - (responseLength * Math.cos((outAngle * Math.PI) / 180))
      : originY + (responseLength * Math.cos((outAngle * Math.PI) / 180));

    return renderPanel(
      "Refraction threshold",
      <>
        {sliderField("Medium pair", label, <input className="w-full" type="range" min="0" max="2" step="1" value={preset} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Incident angle", `${incidentDeg} deg`, <input className="w-full" type="range" min="0" max="80" step="1" value={incidentDeg} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Boundary board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#eef2ff" />
        <text x="44" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Critical angle is the last escape case before lock-in reflection</text>
        <rect x="44" y="70" width="532" height="84" rx="18" fill="#dbeafe" />
        <rect x="44" y="154" width="532" height="84" rx="18" fill="#ecfeff" />
        <line x1="44" y1="154" x2="576" y2="154" stroke="#0f172a" strokeWidth="3" />
        <line x1={originX} y1="78" x2={originX} y2="236" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 7" />
        <line x1={incidentX} y1={incidentY} x2={originX} y2={originY} stroke="#2563eb" strokeWidth="5" />
        <line x1={originX} y1={originY} x2={responseX} y2={responseY} stroke={tir ? "#f97316" : "#0f766e"} strokeWidth="5" />
        <text x="52" y="98" fill="#334155" fontSize="16">medium 1: n = {n1}</text>
        <text x="52" y="212" fill="#334155" fontSize="16">medium 2: n = {n2}</text>
        <text x="388" y="112" fill="#334155" fontSize="16">incident: {incidentDeg} deg</text>
        <text x="388" y="208" fill={tir ? "#c2410c" : "#0f766e"} fontSize="16">{tir ? "TIR response" : `refracted: ${formatSimulationNumber(refractedDeg ?? 0, 1)} deg`}</text>
      </svg>,
      <>
        {metricCard("Medium pair", label, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Critical angle", criticalDeg === null ? "none" : `${formatSimulationNumber(criticalDeg, 1)} deg`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Outcome", tir ? "total internal reflection" : "refraction", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Direction change", tir ? "trapped back inside" : bends, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["TIR needs both the correct medium direction and an angle above the critical angle.", "Below the critical angle, Snell's law still predicts a refracted ray.", "Moving into a lower-index medium bends away from the normal."],
      "This board keeps refraction, grazing escape, and total internal reflection inside one boundary story instead of letting TIR feel like a separate rule.",
    );
  }

  if (lessonKey === "A3_L6") {
    const peakToPeakDivs = clamp(simDensityMass, 2, 8);
    const voltsPerDiv = clamp(simDensityVolume, 0.5, 5.0);
    const timePerDivMs = clamp(simVectorMagnitude, 0.1, 2.0);
    const cycleDivs = clamp(simMetricMeters, 2, 8);
    const phaseDeg = clamp(simVectorAngle, 0, 360);
    const vpp = peakToPeakDivs * voltsPerDiv;
    const vPeak = vpp / 2;
    const periodMs = cycleDivs * timePerDivMs;
    const frequencyHz = 1000 / periodMs;
    const vrms = vPeak / Math.sqrt(2);

    return renderPanel(
      "Oscilloscope trace",
      <>
        {sliderField("Peak-to-peak divisions", `${formatSimulationNumber(peakToPeakDivs, 1)} div`, <input className="w-full" type="range" min="2" max="8" step="0.1" value={peakToPeakDivs} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Volts per division", `${formatSimulationNumber(voltsPerDiv, 2)} V/div`, <input className="w-full" type="range" min="0.5" max="5.0" step="0.1" value={voltsPerDiv} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Time per division", `${formatSimulationNumber(timePerDivMs, 2)} ms/div`, <input className="w-full" type="range" min="0.1" max="2.0" step="0.05" value={timePerDivMs} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Divisions per cycle", `${formatSimulationNumber(cycleDivs, 1)} div`, <input className="w-full" type="range" min="2" max="8" step="0.1" value={cycleDivs} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Oscilloscope board",
      <svg viewBox="0 0 620 280" className="w-full">
        <rect x="20" y="20" width="580" height="240" rx="24" fill="#0f172a" />
        {Array.from({ length: 9 }).map((_, index) => (
          <line key={`v-${index}`} x1={60 + index * 62.5} y1="60" x2={60 + index * 62.5} y2="220" stroke="#334155" strokeWidth="1.5" />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <line key={`h-${index}`} x1="60" y1={60 + index * 26.7} x2="560" y2={60 + index * 26.7} stroke="#334155" strokeWidth="1.5" />
        ))}
        <polyline points={oscilloscopeTracePath(620, peakToPeakDivs / 2, cycleDivs, phaseDeg, 140)} fill="none" stroke="#38bdf8" strokeWidth="5" />
        <text x="60" y="44" fill="#e2e8f0" fontSize="20" fontWeight="700">Read height and width before naming the signal</text>
      </svg>,
      <>
        {metricCard("Vpp", `${formatSimulationNumber(vpp, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Vpeak", `${formatSimulationNumber(vPeak, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Period", `${formatSimulationNumber(periodMs, 2)} ms`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Frequency", `${formatSimulationNumber(frequencyHz, 1)} Hz`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Vrms", `${formatSimulationNumber(vrms, 2)} V`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Trace meaning", "voltage vs time", "border-cyan-200 bg-cyan-50 text-cyan-900")}
      </>,
      ["The horizontal axis is time, not position through space.", "Peak-to-peak height and one-cycle width answer different questions.", "For a sine wave, rms is the equal-heating effective value."],
      "The oscilloscope panel makes the learner read the graph as a time trace first, then turn screen measurements into amplitude, period, frequency, and rms value.",
    );
  }

  return null;
}
