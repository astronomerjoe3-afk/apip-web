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
          <h4 className="text-lg font-semibold text-slate-900">Thread-Window lens</h4>
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

function wavePath(
  width: number,
  amplitude: number,
  cycles: number,
  yMid: number,
): string {
  const pts: string[] = [];
  for (let index = 0; index <= 80; index += 1) {
    const x = 40 + ((width - 80) * index) / 80;
    const angle = (index / 80) * Math.PI * 2 * cycles;
    const y = yMid - Math.sin(angle) * amplitude;
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
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
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A3_L1") {
    const field = clamp(simVectorMagnitude, 0.2, 2.5);
    const area = clamp(simMetricMeters, 0.2, 2.0);
    const tilt = clamp(simVectorAngle, 0, 90);
    const flux = field * area * Math.cos((tilt * Math.PI) / 180);
    const threadCount = Math.max(2, Math.round(field * area * 6));
    return renderPanel(
      "Window catch",
      <>
        {sliderField("Field strength", `${formatSimulationNumber(field, 2)} T`, <input className="w-full" type="range" min="0.2" max="2.5" step="0.05" value={field} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Loop area", `${formatSimulationNumber(area, 2)} m^2`, <input className="w-full" type="range" min="0.2" max="2.0" step="0.05" value={area} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Window tilt", `${formatSimulationNumber(tilt, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="1" value={tilt} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Flux board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Field threads through the window set the flux</text>
        {Array.from({ length: threadCount }).map((_, index) => {
          const x = 110 + index * 34;
          return <line key={x} x1={x} y1="82" x2={x} y2="192" stroke="#38bdf8" strokeWidth="5" strokeDasharray="12 8" />;
        })}
        <g transform={`translate(352 138) rotate(${tilt})`}>
          <rect x="-70" y="-50" width="140" height="100" rx="20" fill="none" stroke="#0f766e" strokeWidth="8" />
        </g>
        <text x="78" y="208" fill="#475569" fontSize="18">Face-on catches the most threads. Tilt reduces the perpendicular through-window score.</text>
      </svg>,
      <>
        {metricCard("Flux", `${formatSimulationNumber(flux, 3)} Wb`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Face-on value", `${formatSimulationNumber(field * area, 3)} Wb`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Tilt factor", `${formatSimulationNumber(Math.cos((tilt * Math.PI) / 180), 3)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Thread view", tilt < 20 ? "near maximum" : tilt > 70 ? "edge-on" : "reduced", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Flux is field-through-window, not field alone.", "Area and tilt stay in the story together.", "Face-on means the window catches the maximum perpendicular flow."],
      "This board keeps B, area, and tilt on the same picture so the flux symbol never loses its physical meaning.",
    );
  }

  if (lessonKey === "A3_L2") {
    const deltaFlux = clamp(simMetricMeters, 0, 1.2);
    const deltaTime = clamp(simVectorMagnitude, 0.1, 2.5);
    const mode = Math.round(clamp(simBias, 0, 2));
    const labels = ["steady", "increase", "decrease"];
    const emf = mode === 0 ? 0 : deltaFlux / deltaTime;
    return renderPanel(
      "Pulse trigger",
      <>
        {sliderField("Flux change", `${formatSimulationNumber(deltaFlux, 2)} Wb`, <input className="w-full" type="range" min="0" max="1.2" step="0.02" value={deltaFlux} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Change time", `${formatSimulationNumber(deltaTime, 2)} s`, <input className="w-full" type="range" min="0.1" max="2.5" step="0.05" value={deltaTime} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Change mode", labels[mode], <input className="w-full" type="range" min="0" max="2" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Induction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Only a changing through-thread score produces the loop push</text>
        <rect x="84" y="92" width="140" height="84" rx="18" fill="#fff" stroke="#93c5fd" strokeWidth="4" />
        <rect x="414" y="92" width="140" height="84" rx="18" fill="#fff" stroke="#93c5fd" strokeWidth="4" />
        <text x="154" y="84" fill="#334155" fontSize="18" textAnchor="middle">Before</text>
        <text x="484" y="84" fill="#334155" fontSize="18" textAnchor="middle">After</text>
        {Array.from({ length: 5 }).map((_, index) => {
          const x = 110 + index * 22;
          return <line key={`b-${x}`} x1={x} y1="104" x2={x} y2="164" stroke="#38bdf8" strokeWidth="5" strokeDasharray="10 7" />;
        })}
        {Array.from({ length: mode === 0 ? 5 : mode === 1 ? 8 : 2 }).map((_, index) => {
          const x = 440 + index * 16;
          return <line key={`a-${x}`} x1={x} y1="104" x2={x} y2="164" stroke="#38bdf8" strokeWidth="5" strokeDasharray="10 7" />;
        })}
        <text x="320" y="148" fill="#0f766e" fontSize="20" fontWeight="700" textAnchor="middle">{mode === 0 ? "No change -> no induced emf" : "Change detected -> loop push appears"}</text>
      </svg>,
      <>
        {metricCard("Average emf", `${formatSimulationNumber(emf, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Change mode", labels[mode], "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Rate", `${formatSimulationNumber(mode === 0 ? 0 : deltaFlux / deltaTime, 2)} Wb/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Cause", mode === 0 ? "steady flux" : "changing flux", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Steady unchanged flux gives no induced emf.", "Induction depends on rate of change, not field presence alone.", "Field, area, and angle changes can all trigger induction."],
      "This explorer makes it easy to contrast no-change, slow-change, and fast-change cases without losing sight of the flux story.",
    );
  }

  if (lessonKey === "A3_L3") {
    const turns = Math.round(clamp(simDensityMass, 1, 24));
    const fluxPerTurn = clamp(simMetricMeters, 0.02, 0.4);
    const deltaTime = clamp(simVectorMagnitude, 0.1, 2.0);
    const linkage = turns * fluxPerTurn;
    const emf = linkage / deltaTime;
    return renderPanel(
      "Flux linkage",
      <>
        {sliderField("Turn count", `${turns}`, <input className="w-full" type="range" min="1" max="24" step="1" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Flux per turn", `${formatSimulationNumber(fluxPerTurn, 3)} Wb`, <input className="w-full" type="range" min="0.02" max="0.4" step="0.01" value={fluxPerTurn} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Change time", `${formatSimulationNumber(deltaTime, 2)} s`, <input className="w-full" type="range" min="0.1" max="2.0" step="0.05" value={deltaTime} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Coil board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Many linked windows turn flux into linkage</text>
        {Array.from({ length: Math.min(turns, 10) }).map((_, index) => {
          const cx = 150 + index * 34;
          return <circle key={cx} cx={cx} cy="138" r="20" fill="none" stroke="#a78bfa" strokeWidth="5" />;
        })}
        {Array.from({ length: 7 }).map((_, index) => {
          const x = 138 + index * 48;
          return <line key={x} x1={x} y1="82" x2={x} y2="194" stroke="#38bdf8" strokeWidth="5" strokeDasharray="10 8" />;
        })}
        <text x="440" y="124" fill="#0f766e" fontSize="20" fontWeight="700">NPhi = N x Phi</text>
        <text x="440" y="156" fill="#475569" fontSize="18">{turns} turns x {formatSimulationNumber(fluxPerTurn, 3)} Wb per turn</text>
      </svg>,
      <>
        {metricCard("Flux linkage", `${formatSimulationNumber(linkage, 3)} Wb-turn`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Average emf", `${formatSimulationNumber(emf, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Per-turn flux", `${formatSimulationNumber(fluxPerTurn, 3)} Wb`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Linkage story", turns > 10 ? "many linked windows" : "few linked windows", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Flux linkage totals over all turns.", "More turns can increase induced emf without changing field strength.", "Faraday's law for coils is a rate-of-linkage-change law."],
      "The coil view keeps per-turn flux separate from total linkage so NPhi feels physical rather than decorative.",
    );
  }

  if (lessonKey === "A3_L4") {
    const changeMode = Math.round(clamp(simBias, 0, 3));
    const rate = clamp(simVectorMagnitude, 0.2, 3.0);
    const labels = ["outward increasing", "outward decreasing", "inward increasing", "inward decreasing"];
    const induced = changeMode === 0 ? "inward response" : changeMode === 1 ? "outward support" : changeMode === 2 ? "outward response" : "inward support";
    return renderPanel(
      "Oppose-turn",
      <>
        {sliderField("Flux change case", labels[changeMode], <input className="w-full" type="range" min="0" max="3" step="1" value={changeMode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Change rate", `${formatSimulationNumber(rate, 2)} arb`, <input className="w-full" type="range" min="0.2" max="3.0" step="0.05" value={rate} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Lenz board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#f8fafc" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Read the change first, then choose the response that resists it</text>
        <circle cx="180" cy="136" r="64" fill="none" stroke="#94a3b8" strokeWidth="6" />
        <circle cx="460" cy="136" r="64" fill="none" stroke="#94a3b8" strokeWidth="6" />
        <text x="180" y="92" fill="#2563eb" fontSize="18" textAnchor="middle">Flux change</text>
        <text x="460" y="92" fill="#0f766e" fontSize="18" textAnchor="middle">Induced response</text>
        <text x="180" y="142" fill="#1e3a8a" fontSize="20" textAnchor="middle">{labels[changeMode]}</text>
        <text x="460" y="142" fill="#0f766e" fontSize="20" textAnchor="middle">{induced}</text>
        <line x1="250" y1="136" x2="390" y2="136" stroke="#f97316" strokeWidth="8" />
        <polygon points="390,136 360,120 360,152" fill="#f97316" />
      </svg>,
      <>
        {metricCard("Diagnosed change", labels[changeMode], "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Induced choice", induced, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Rate note", rate > 1.6 ? "larger emf magnitude" : "smaller emf magnitude", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Minus sign", "direction rule", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Oppose the change, not the field blindly.", "Reversing the change reverses the response.", "Lenz's law explains direction while rate still controls magnitude."],
      "This board forces a two-step method: identify the change in flux first, then choose the response that resists it.",
    );
  }

  if (lessonKey === "A3_L5") {
    const mode = Math.round(clamp(simBias, 0, 1));
    const peak = clamp(simDensityMass, 1, 6);
    const frequency = clamp(simVectorMagnitude, 0.5, 4);
    const time = clamp(simMetricMeters, 0, 1);
    const period = 1 / frequency;
    const instant = mode === 0 ? peak : peak * Math.sin(time * frequency * Math.PI * 2);
    return renderPanel(
      "Drive sorter",
      <>
        {sliderField("Drive mode", mode === 0 ? "one-way (DC)" : "swing (AC)", <input className="w-full" type="range" min="0" max="1" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Peak level", `${formatSimulationNumber(peak, 1)}`, <input className="w-full" type="range" min="1" max="6" step="0.1" value={peak} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Frequency", `${formatSimulationNumber(frequency, 2)} Hz`, <input className="w-full" type="range" min="0.5" max="4" step="0.05" value={frequency} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Time marker", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0" max="1" step="0.01" value={time} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Waveform board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">One-way drive stays one-sided; swing drive crosses zero and reverses</text>
        <line x1="56" y1="138" x2="584" y2="138" stroke="#94a3b8" strokeWidth="4" />
        {mode === 0 ? (
          <line x1="60" y1={138 - peak * 15} x2="580" y2={138 - peak * 15} stroke="#f97316" strokeWidth="6" />
        ) : (
          <polyline points={wavePath(640, peak * 14, frequency, 138)} fill="none" stroke="#38bdf8" strokeWidth="6" />
        )}
        <line x1={60 + time * 520} y1="78" x2={60 + time * 520} y2="198" stroke="#0f766e" strokeWidth="3" strokeDasharray="10 8" />
      </svg>,
      <>
        {metricCard("Instant value", `${formatSimulationNumber(instant, 2)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Period", `${formatSimulationNumber(period, 3)} s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Peak", `${formatSimulationNumber(peak, 2)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Graph story", mode === 0 ? "stays one-sided" : "crosses zero", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["AC and DC are different time patterns.", "Frequency and period are inverse descriptions of the beat clock.", "Peak is the crest level, not the value at every instant."],
      "Watching the trace and a moving time marker together makes it much harder to confuse AC with merely 'smaller' DC.",
    );
  }

  const peak = clamp(simDensityMass, 2, 10);
  const resistance = clamp(simDensityVolume, 1, 20);
  const time = clamp(simMetricMeters, 0, 1);
  const vrms = peak / Math.sqrt(2);
  const instant = peak * Math.sin(time * Math.PI * 2);
  const power = (vrms * vrms) / resistance;
  return renderPanel(
    "Heat-match",
    <>
      {sliderField("Peak value", `${formatSimulationNumber(peak, 2)} V`, <input className="w-full" type="range" min="2" max="10" step="0.1" value={peak} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      {sliderField("Resistor", `${formatSimulationNumber(resistance, 1)} ohm`, <input className="w-full" type="range" min="1" max="20" step="0.5" value={resistance} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      {sliderField("Time marker", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0" max="1" step="0.01" value={time} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
    </>,
    "RMS board",
    <svg viewBox="0 0 640 250" className="w-full">
      <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
      <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">RMS is the heat-match level, not the simple average or the crest</text>
      <line x1="56" y1="138" x2="584" y2="138" stroke="#94a3b8" strokeWidth="4" />
      <polyline points={wavePath(640, peak * 10, 1, 138)} fill="none" stroke="#38bdf8" strokeWidth="6" />
      <line x1="60" y1={138 - vrms * 10} x2="580" y2={138 - vrms * 10} stroke="#f97316" strokeWidth="4" strokeDasharray="10 8" />
      <line x1="60" y1={138 + vrms * 10} x2="580" y2={138 + vrms * 10} stroke="#22c55e" strokeWidth="4" strokeDasharray="10 8" />
      <line x1={60 + time * 520} y1="78" x2={60 + time * 520} y2="198" stroke="#0f766e" strokeWidth="3" strokeDasharray="10 8" />
    </svg>,
    <>
      {metricCard("Vrms", `${formatSimulationNumber(vrms, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Instant value", `${formatSimulationNumber(instant, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("Equivalent DC power", `${formatSimulationNumber(power, 2)} W`, "border-violet-200 bg-violet-50 text-violet-900")}
      {metricCard("Comparison", "equal-heating DC", "border-amber-200 bg-amber-50 text-amber-900")}
    </>,
    ["RMS is the effective resistive value.", "Peak and average answer different questions.", "Equal-heating language is the cleanest way to explain RMS."],
    "This view keeps the crest, the instantaneous value, and the RMS level visible together so the effective-value story stays anchored to the sine wave.",
  );
}
