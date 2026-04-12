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

function metricCard(title: string, value: string, tone: string): ReactNode {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function explainerCard(title: string, body: string, tone: string): ReactNode {
  return (
    <div className={`sm:col-span-2 rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-sm leading-6">{body}</div>
    </div>
  );
}

function boardFrame(title: string, body: ReactNode): ReactNode {
  return (
    <div className={panelClass}>
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">{body}</div>
    </div>
  );
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

export default function M3SimulationPanels({
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
  const render = (
    title: string,
    controls: ReactNode,
    boardTitle: string,
    board: ReactNode,
    readings: ReactNode,
    lens: string[],
    note: string,
  ) => (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
          {controls}
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Reasoning lens</h4>
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
        {boardFrame(boardTitle, board)}
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );

  if (lessonKey === "M3_L1") {
    const inputEnergy = clamp(simVectorMagnitude, 100, 600);
    const usefulPercent = clamp(simSpread, 0, 100);
    const heightShare = clamp(simBias, 0, 100);
    const usefulGain = inputEnergy * usefulPercent / 100;
    const leak = inputEnergy - usefulGain;
    const heightGain = usefulGain * heightShare / 100;
    const motionGain = usefulGain - heightGain;
    return render(
      "Lift-Launch ledger explorer",
      <>
        {sliderField("Machine input (J)", `${formatSimulationNumber(inputEnergy, 0)} J`, <input className="w-full" type="range" min="100" max="600" step="20" value={inputEnergy} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Useful gain (%)", `${formatSimulationNumber(usefulPercent, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="5" value={usefulPercent} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Useful share to Height Store (%)", `${formatSimulationNumber(heightShare, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="5" value={heightShare} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Lift-Launch mission board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#eff6ff" />
        <text x="32" y="40" fill="#0f172a" fontSize="22" fontWeight="700">One hand-off, two stores, one Leak Trail</text>
        <rect x="38" y="80" width="128" height="78" rx="20" fill="#dbeafe" stroke="#3b82f6" strokeWidth="4" />
        <text x="64" y="114" fill="#1d4ed8" fontSize="18" fontWeight="700">Input</text>
        <text x="64" y="138" fill="#1e3a8a" fontSize="16">{formatSimulationNumber(inputEnergy, 0)} J</text>
        <path d="M172 119 H278" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />
        <polygon points="278,119 258,108 258,130" fill="#2563eb" />
        <rect x="286" y="64" width="144" height="74" rx="20" fill="#dcfce7" stroke="#22c55e" strokeWidth="4" />
        <text x="312" y="98" fill="#166534" fontSize="18" fontWeight="700">Height Store</text>
        <text x="312" y="122" fill="#166534" fontSize="16">{formatSimulationNumber(heightGain, 0)} J</text>
        <rect x="286" y="148" width="144" height="74" rx="20" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
        <text x="312" y="182" fill="#b45309" fontSize="18" fontWeight="700">Motion Store</text>
        <text x="312" y="206" fill="#b45309" fontSize="16">{formatSimulationNumber(motionGain, 0)} J</text>
        <path d="M172 119 C220 119 228 119 260 90" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M172 119 C220 119 228 119 260 176" stroke="#f59e0b" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M170 126 C232 164 252 188 450 188" stroke="#ef4444" strokeWidth="8" fill="none" strokeLinecap="round" />
        <polygon points="450,188 430,177 430,199" fill="#ef4444" />
        <rect x="456" y="152" width="144" height="64" rx="18" fill="#fee2e2" stroke="#ef4444" strokeWidth="4" />
        <text x="486" y="184" fill="#b91c1c" fontSize="18" fontWeight="700">Leak Trail</text>
        <text x="486" y="204" fill="#b91c1c" fontSize="15">{formatSimulationNumber(leak, 0)} J</text>
      </svg>,
      <>
        {metricCard("Input hand-off", `${formatSimulationNumber(inputEnergy, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Useful gain", `${formatSimulationNumber(usefulGain, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Leak Trail", `${formatSimulationNumber(leak, 0)} J`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Ledger check", `${formatSimulationNumber(usefulGain + leak, 0)} J total accounted`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Height Store", `${formatSimulationNumber(heightGain, 0)} J`, "border-green-200 bg-green-50 text-green-900")}
        {metricCard("Motion Store", `${formatSimulationNumber(motionGain, 0)} J`, "border-yellow-200 bg-yellow-50 text-yellow-900")}
      </>,
      [
        "Energy-accounting starts by balancing input against useful gain and leak.",
        "Stores answer where the energy is; hand-offs answer how it moved.",
        "Useful gain can be redistributed between stores without changing the ledger total.",
      ],
      "The board is teaching the module's core grammar: input hand-off = useful store gain + Leak Trail, with the useful part allowed to sit in more than one store.",
    );
  }

  if (lessonKey === "M3_L2") {
    const load = clamp(simDensityMass, 1, 10);
    const deckLevel = clamp(simMetricMeters, 1, 12);
    const worldGrip = clamp(simDensityVolume, 4, 16);
    const compareGrip = clamp(simVectorAngle, 4, 16);
    const currentStore = load * deckLevel * worldGrip;
    const compareStore = load * deckLevel * compareGrip;
    return render(
      "Height Store explorer",
      <>
        {sliderField("Load Rating / mass (kg)", `${formatSimulationNumber(load, 0)} kg`, <input className="w-full" type="range" min="1" max="10" step="1" value={load} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Deck level (m)", `${formatSimulationNumber(deckLevel, 0)} m`, <input className="w-full" type="range" min="1" max="12" step="1" value={deckLevel} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("World Grip A (N/kg)", `${formatSimulationNumber(worldGrip, 0)} N/kg`, <input className="w-full" type="range" min="4" max="16" step="1" value={worldGrip} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("World Grip B (N/kg)", `${formatSimulationNumber(compareGrip, 0)} N/kg`, <input className="w-full" type="range" min="4" max="16" step="1" value={compareGrip} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Height Store board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="16" y="18" width="276" height="208" rx="24" fill="#eff6ff" stroke="#93c5fd" strokeWidth="3" />
        <rect x="348" y="18" width="276" height="208" rx="24" fill="#f0fdf4" stroke="#86efac" strokeWidth="3" />
        <text x="42" y="46" fill="#1d4ed8" fontSize="22" fontWeight="700">World A</text>
        <text x="374" y="46" fill="#166534" fontSize="22" fontWeight="700">World B</text>
        <line x1="122" y1="190" x2="122" y2={190 - deckLevel * 10} stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
        <line x1="454" y1="190" x2="454" y2={190 - deckLevel * 10} stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />
        <rect x="76" y={146 - deckLevel * 10} width="92" height="46" rx="16" fill="#dbeafe" stroke="#3b82f6" strokeWidth="4" />
        <rect x="408" y={146 - deckLevel * 10} width="92" height="46" rx="16" fill="#dcfce7" stroke="#22c55e" strokeWidth="4" />
        <text x="106" y={174 - deckLevel * 10} fill="#1e40af" fontSize="18" fontWeight="700">{formatSimulationNumber(load, 0)} kg</text>
        <text x="438" y={174 - deckLevel * 10} fill="#166534" fontSize="18" fontWeight="700">{formatSimulationNumber(load, 0)} kg</text>
        <text x="40" y="210" fill="#334155" fontSize="16">g = {formatSimulationNumber(worldGrip, 0)} N/kg</text>
        <text x="374" y="210" fill="#334155" fontSize="16">g = {formatSimulationNumber(compareGrip, 0)} N/kg</text>
      </svg>,
      <>
        {metricCard("World A Height Store", `${formatSimulationNumber(currentStore, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("World B Height Store", `${formatSimulationNumber(compareStore, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Load factor", `${formatSimulationNumber(load, 0)} kg`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Deck factor", `${formatSimulationNumber(deckLevel, 0)} m`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Equation", `${formatSimulationNumber(load, 0)} x ${formatSimulationNumber(worldGrip, 0)} x ${formatSimulationNumber(deckLevel, 0)}`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("World comparison", compareStore > currentStore ? "Stronger World Grip gives more store" : compareStore < currentStore ? "Weaker World Grip gives less store" : "Same World Grip, same store", "border-violet-200 bg-violet-50 text-violet-900")}
      </>,
      [
        "Height Store belongs to a raised position in a gravitational field, not to motion.",
        "Mass, World Grip, and height all matter linearly in the same store.",
        "Comparing different worlds keeps g visible and prevents height-only shortcuts.",
      ],
      "The same pod at the same deck level can have different Height Store values on different worlds because field strength is part of the physics, not a decorative constant.",
    );
  }

  if (lessonKey === "M3_L3") {
    const load = clamp(simDensityMass, 1, 8);
    const baseSpeed = clamp(simVectorMagnitude, 1, 12);
    const compareSpeed = clamp(simVectorAngle, 1, 12);
    const compareLoad = clamp(simDensityVolume, 1, 8);
    const baseStore = 0.5 * load * baseSpeed * baseSpeed;
    const speedStore = 0.5 * load * compareSpeed * compareSpeed;
    const loadStore = 0.5 * compareLoad * baseSpeed * baseSpeed;
    return render(
      "Motion Store explorer",
      <>
        {sliderField("Base load (kg)", `${formatSimulationNumber(load, 0)} kg`, <input className="w-full" type="range" min="1" max="8" step="1" value={load} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Base pace (m/s)", `${formatSimulationNumber(baseSpeed, 0)} m/s`, <input className="w-full" type="range" min="1" max="12" step="1" value={baseSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Comparison pace (m/s)", `${formatSimulationNumber(compareSpeed, 0)} m/s`, <input className="w-full" type="range" min="1" max="12" step="1" value={compareSpeed} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Comparison load at base pace (kg)", `${formatSimulationNumber(compareLoad, 0)} kg`, <input className="w-full" type="range" min="1" max="8" step="1" value={compareLoad} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Motion Store board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="24" width="176" height="182" rx="22" fill="#eff6ff" />
        <rect x="232" y="24" width="176" height="182" rx="22" fill="#fef3c7" />
        <rect x="444" y="24" width="176" height="182" rx="22" fill="#f0fdf4" />
        <text x="54" y="52" fill="#1d4ed8" fontSize="18" fontWeight="700">Base case</text>
        <text x="252" y="52" fill="#b45309" fontSize="18" fontWeight="700">Change pace</text>
        <text x="464" y="52" fill="#166534" fontSize="18" fontWeight="700">Change load</text>
        <rect x="58" y={176 - Math.min(baseStore, 120)} width="100" height={Math.min(baseStore, 120)} rx="18" fill="#3b82f6" />
        <rect x="270" y={176 - Math.min(speedStore, 120)} width="100" height={Math.min(speedStore, 120)} rx="18" fill="#f59e0b" />
        <rect x="482" y={176 - Math.min(loadStore, 120)} width="100" height={Math.min(loadStore, 120)} rx="18" fill="#22c55e" />
        <text x="56" y="196" fill="#334155" fontSize="14">{formatSimulationNumber(baseStore, 0)} J</text>
        <text x="268" y="196" fill="#334155" fontSize="14">{formatSimulationNumber(speedStore, 0)} J</text>
        <text x="480" y="196" fill="#334155" fontSize="14">{formatSimulationNumber(loadStore, 0)} J</text>
      </svg>,
      <>
        {metricCard("Base Motion Store", `${formatSimulationNumber(baseStore, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Same load, new pace", `${formatSimulationNumber(speedStore, 0)} J`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Same pace, new load", `${formatSimulationNumber(loadStore, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Speed effect", `${formatSimulationNumber(speedStore / baseStore, 2)} x base`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Load effect", `${formatSimulationNumber(loadStore / baseStore, 2)} x base`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Core relation", "Motion Store = 0.5mv^2", "border-rose-200 bg-rose-50 text-rose-900")}
      </>,
      [
        "Use side-by-side comparisons so mass effects and speed-squared effects do not blur together.",
        "A larger bar from speed change is expected because speed is squared in the store rule.",
        "Motion Store is scalar bookkeeping, not vector addition.",
      ],
      "This board intentionally compares one pace change and one load change so students can see that pace drives the sharper growth in Motion Store.",
    );
  }

  if (lessonKey === "M3_L4") {
    const force = clamp(simVectorMagnitude, 0, 20);
    const distance = clamp(simMetricMeters, 0, 10);
    const leakPercent = clamp(simSpread, 0, 60);
    const inputWork = force * distance;
    const usefulGain = inputWork * (1 - leakPercent / 100);
    const leak = inputWork - usefulGain;
    return render(
      "Energy Hand-off explorer",
      <>
        {sliderField("Aligned force (N)", `${formatSimulationNumber(force, 0)} N`, <input className="w-full" type="range" min="0" max="20" step="1" value={force} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Distance moved in force direction (m)", `${formatSimulationNumber(distance, 1)} m`, <input className="w-full" type="range" min="0" max="10" step="0.5" value={distance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Leak during hand-off (%)", `${formatSimulationNumber(leakPercent, 0)}%`, <input className="w-full" type="range" min="0" max="60" step="5" value={leakPercent} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Energy Hand-off board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="32" y="42" fill="#0f172a" fontSize="22" fontWeight="700">Hand-off through force and distance</text>
        <line x1="90" y1="154" x2="540" y2="154" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <line x1="90" y1="126" x2={90 + distance * 36} y2="126" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
        <polygon points={`${90 + distance * 36},126 ${70 + distance * 36},115 ${70 + distance * 36},137`} fill="#2563eb" />
        <rect x="92" y="108" width="82" height="34" rx="16" fill="#dbeafe" />
        <text x="104" y="131" fill="#1d4ed8" fontSize="15" fontWeight="700">{formatSimulationNumber(force, 0)} N push</text>
        <text x="92" y="186" fill="#334155" fontSize="16">Distance = {formatSimulationNumber(distance, 1)} m</text>
        <text x="92" y="212" fill="#334155" fontSize="16">Input work = {formatSimulationNumber(inputWork, 0)} J</text>
        <rect x="392" y="78" width="190" height="56" rx="18" fill="#dcfce7" stroke="#22c55e" strokeWidth="4" />
        <text x="420" y="110" fill="#166534" fontSize="17" fontWeight="700">Useful store gain</text>
        <text x="432" y="128" fill="#166534" fontSize="15">{formatSimulationNumber(usefulGain, 0)} J</text>
        <rect x="392" y="150" width="190" height="56" rx="18" fill="#fee2e2" stroke="#ef4444" strokeWidth="4" />
        <text x="442" y="182" fill="#b91c1c" fontSize="17" fontWeight="700">Leak Trail</text>
        <text x="452" y="200" fill="#b91c1c" fontSize="15">{formatSimulationNumber(leak, 0)} J</text>
      </svg>,
      <>
        {metricCard("Input work", `${formatSimulationNumber(inputWork, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Useful gain", `${formatSimulationNumber(usefulGain, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Leak Trail", `${formatSimulationNumber(leak, 0)} J`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("No-displacement check", distance <= 0.01 ? "0 J work in this simple model" : "displacement allows the hand-off", "border-amber-200 bg-amber-50 text-amber-900")}
        {explainerCard("Equation choice", inputWork > 0 ? "W = Fd gives the input hand-off here because the force-distance story is explicit. The useful store gain is smaller when part of that hand-off leaks away." : "With zero displacement, the simple aligned-force hand-off is zero. If a problem instead gives the store change directly, W = ΔE is often the better first move.", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Work is the total hand-off, not a synonym for effort.",
        "Use force-distance only when the displacement story supports it.",
        "Useful store gain can be smaller than the input hand-off when leaks are present.",
      ],
      "This board makes the two work readings visible at once: the input hand-off from force-distance and the useful store gain that remains after leaks.",
    );
  }

  if (lessonKey === "M3_L5") {
    const inputEnergy = clamp(simVectorMagnitude, 200, 2400);
    const timeA = clamp(simMetricMeters, 1, 12);
    const timeB = clamp(simVectorAngle, 1, 12);
    const usefulPercent = clamp(simSpread, 10, 100);
    const powerA = inputEnergy / timeA;
    const powerB = inputEnergy / timeB;
    const usefulOutput = inputEnergy * usefulPercent / 100;
    const leak = inputEnergy - usefulOutput;
    return render(
      "Transfer Rate and Useful Yield explorer",
      <>
        {sliderField("Total input energy (J)", `${formatSimulationNumber(inputEnergy, 0)} J`, <input className="w-full" type="range" min="200" max="2400" step="100" value={inputEnergy} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Machine A time (s)", `${formatSimulationNumber(timeA, 0)} s`, <input className="w-full" type="range" min="1" max="12" step="1" value={timeA} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Machine B time (s)", `${formatSimulationNumber(timeB, 0)} s`, <input className="w-full" type="range" min="1" max="12" step="1" value={timeB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Useful Yield (%)", `${formatSimulationNumber(usefulPercent, 0)}%`, <input className="w-full" type="range" min="10" max="100" step="5" value={usefulPercent} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Rate and Yield board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="18" y="22" width="264" height="182" rx="24" fill="#eff6ff" />
        <rect x="356" y="22" width="264" height="182" rx="24" fill="#f0fdf4" />
        <text x="44" y="50" fill="#1d4ed8" fontSize="22" fontWeight="700">Machine A</text>
        <text x="382" y="50" fill="#166534" fontSize="22" fontWeight="700">Machine B</text>
        <rect x="64" y={178 - Math.min(powerA / 4, 108)} width="72" height={Math.min(powerA / 4, 108)} rx="18" fill="#2563eb" />
        <rect x="402" y={178 - Math.min(powerB / 4, 108)} width="72" height={Math.min(powerB / 4, 108)} rx="18" fill="#16a34a" />
        <text x="54" y="198" fill="#334155" fontSize="15">{formatSimulationNumber(powerA, 0)} W</text>
        <text x="392" y="198" fill="#334155" fontSize="15">{formatSimulationNumber(powerB, 0)} W</text>
        <rect x="178" y="78" width="82" height="92" rx="18" fill="#fef3c7" />
        <rect x="516" y="78" width="82" height="92" rx="18" fill="#fee2e2" />
        <text x="188" y="110" fill="#b45309" fontSize="16" fontWeight="700">Useful</text>
        <text x="188" y="134" fill="#b45309" fontSize="15">{formatSimulationNumber(usefulOutput, 0)} J</text>
        <text x="526" y="110" fill="#b91c1c" fontSize="16" fontWeight="700">Leak</text>
        <text x="526" y="134" fill="#b91c1c" fontSize="15">{formatSimulationNumber(leak, 0)} J</text>
      </svg>,
      <>
        {metricCard("Machine A power", `${formatSimulationNumber(powerA, 0)} W`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Machine B power", `${formatSimulationNumber(powerB, 0)} W`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Useful Yield", `${formatSimulationNumber(usefulPercent, 0)}%`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Useful output", `${formatSimulationNumber(usefulOutput, 0)} J`, "border-yellow-200 bg-yellow-50 text-yellow-900")}
        {metricCard("Leak Trail", `${formatSimulationNumber(leak, 0)} J`, "border-rose-200 bg-rose-50 text-rose-900")}
        {explainerCard("Core distinction", "The left comparison changes only the transfer time, so it isolates power. The useful/leak split depends on Useful Yield, which is a separate fraction and does not automatically change when power changes.", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Power compares total energy with time; efficiency compares useful output with total input.",
        "A shorter time raises power even if the useful fraction stays the same.",
        "A better useful fraction can raise useful output without making the transfer faster.",
      ],
      "This board intentionally separates the rate comparison from the useful-fraction comparison so students do not confuse powerful with efficient.",
    );
  }

  if (lessonKey === "M3_L6") {
    const liftInput = clamp(simVectorMagnitude, 200, 2500);
    const liftYield = clamp(simSpread, 20, 100);
    const launchLeakPercent = clamp(simBias, 0, 60);
    const gateThreshold = clamp(simMetricMeters, 100, 1600);
    const usefulHeight = liftInput * liftYield / 100;
    const motionAtGate = usefulHeight * (1 - launchLeakPercent / 100);
    const shortfall = motionAtGate - gateThreshold;
    const succeeds = shortfall >= 0;
    return render(
      "Ledger mission explorer",
      <>
        {sliderField("Lift input (J)", `${formatSimulationNumber(liftInput, 0)} J`, <input className="w-full" type="range" min="200" max="2500" step="50" value={liftInput} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Lift Useful Yield (%)", `${formatSimulationNumber(liftYield, 0)}%`, <input className="w-full" type="range" min="20" max="100" step="5" value={liftYield} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Launch leak (%)", `${formatSimulationNumber(launchLeakPercent, 0)}%`, <input className="w-full" type="range" min="0" max="60" step="5" value={launchLeakPercent} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Gate threshold (J)", `${formatSimulationNumber(gateThreshold, 0)} J`, <input className="w-full" type="range" min="100" max="1600" step="50" value={gateThreshold} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Ledger mission planner",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="28" y="42" fill="#0f172a" fontSize="22" fontWeight="700">Solve the mission in stages</text>
        <rect x="32" y="76" width="156" height="92" rx="22" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
        <rect x="242" y="76" width="156" height="92" rx="22" fill="#dcfce7" stroke="#22c55e" strokeWidth="4" />
        <rect x="452" y="76" width="156" height="92" rx="22" fill={succeeds ? "#ecfccb" : "#fee2e2"} stroke={succeeds ? "#84cc16" : "#ef4444"} strokeWidth="4" />
        <text x="66" y="108" fill="#1d4ed8" fontSize="18" fontWeight="700">Lift input</text>
        <text x="74" y="132" fill="#1d4ed8" fontSize="16">{formatSimulationNumber(liftInput, 0)} J</text>
        <text x="260" y="108" fill="#166534" fontSize="18" fontWeight="700">Useful store</text>
        <text x="272" y="132" fill="#166534" fontSize="16">{formatSimulationNumber(usefulHeight, 0)} J</text>
        <text x="474" y="108" fill={succeeds ? "#4d7c0f" : "#b91c1c"} fontSize="18" fontWeight="700">Gate check</text>
        <text x="470" y="132" fill={succeeds ? "#4d7c0f" : "#b91c1c"} fontSize="16">{formatSimulationNumber(motionAtGate, 0)} J vs {formatSimulationNumber(gateThreshold, 0)} J</text>
        <path d="M190 122 H238" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <polygon points="238,122 218,111 218,133" fill="#2563eb" />
        <path d="M400 122 H448" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" />
        <polygon points="448,122 428,111 428,133" fill="#22c55e" />
        <text x="250" y="194" fill="#475569" fontSize="16">Launch leak: {formatSimulationNumber(launchLeakPercent, 0)}%</text>
        <text x="250" y="216" fill="#475569" fontSize="16">{succeeds ? `Mission succeeds by ${formatSimulationNumber(shortfall, 0)} J` : `Mission falls short by ${formatSimulationNumber(Math.abs(shortfall), 0)} J`}</text>
      </svg>,
      <>
        {metricCard("Useful lift gain", `${formatSimulationNumber(usefulHeight, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Motion Store at gate", `${formatSimulationNumber(motionAtGate, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Gate threshold", `${formatSimulationNumber(gateThreshold, 0)} J`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Mission result", succeeds ? "succeeds" : "fails", succeeds ? "border-lime-200 bg-lime-50 text-lime-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {explainerCard("Equation order", "The planner is forcing the correct order: efficiency first to find the useful lift gain, launch leak next to find the energy that reaches the gate, and only then the final target comparison.", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "One stage often creates the quantity that the next stage needs.",
        "Intermediate useful gains matter because they become real inputs to later steps.",
        "The final judgment belongs at the end of the chain, after leaks and yields have been accounted for.",
      ],
      "This is the M3 capstone board: it makes equation order visible by turning a long calculation into a deliberate mission sequence.",
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the Lift-Launch controls to compare stores, hand-offs, power, efficiency, and ledger missions.</div>;
}
