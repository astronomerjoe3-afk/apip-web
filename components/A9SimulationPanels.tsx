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

export default function A9SimulationPanels({
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
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A9_L1") {
    const turns = clamp(simDensityMass, 20, 300);
    const fieldStrength = clamp(simVectorMagnitude, 0.2, 1.6);
    const area = clamp(simMetricMeters, 0.1, 0.6);
    const startAngle = clamp(simBias, 0, 90);
    const endAngle = clamp(simVectorAngle, 0, 90);
    const time = clamp(simSpread, 0.1, 2.0);
    const startFlux = fieldStrength * area * Math.cos((startAngle * Math.PI) / 180);
    const endFlux = fieldStrength * area * Math.cos((endAngle * Math.PI) / 180);
    const deltaFlux = endFlux - startFlux;
    const averageEmf = (turns * Math.abs(deltaFlux)) / time;

    return renderPanel(
      "Flux window",
      <>
        {sliderField("Turns", `${formatSimulationNumber(turns, 0)} turns`, <input className="w-full" type="range" min="20" max="300" step="10" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Field strength", `${formatSimulationNumber(fieldStrength, 2)} T`, <input className="w-full" type="range" min="0.2" max="1.6" step="0.05" value={fieldStrength} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Loop area", `${formatSimulationNumber(area, 2)} m^2`, <input className="w-full" type="range" min="0.1" max="0.6" step="0.01" value={area} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Start angle", `${formatSimulationNumber(startAngle, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="5" value={startAngle} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("End angle", `${formatSimulationNumber(endAngle, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="5" value={endAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Change time", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0.1" max="2.0" step="0.05" value={time} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Faraday board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#ecfeff" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Changing field-thread through the loop is what drives induction</text>
        <path d="M90 88H550" stroke="#38bdf8" strokeWidth="10" strokeDasharray="12 8" />
        <path d="M90 128H550" stroke="#38bdf8" strokeWidth="10" strokeDasharray="12 8" />
        <path d="M90 168H550" stroke="#38bdf8" strokeWidth="10" strokeDasharray="12 8" />
        <g transform={`translate(210 128) rotate(${startAngle})`}>
          <rect x="-58" y="-34" width="116" height="68" rx="18" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
          <text x="-26" y="6" fill="#0f172a" fontSize="18" fontWeight="700">start</text>
        </g>
        <g transform={`translate(430 128) rotate(${endAngle})`}>
          <rect x="-58" y="-34" width="116" height="68" rx="18" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="5" />
          <text x="-18" y="6" fill="#1d4ed8" fontSize="18" fontWeight="700">end</text>
        </g>
        <path d="M288 128H352" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="364,128 346,118 346,138" fill="#0f172a" />
        <text x="238" y="204" fill="#475569" fontSize="16">same field and area, but changing orientation changes the flux linkage</text>
      </svg>,
      <>
        {metricCard("Start flux", `${formatSimulationNumber(startFlux, 3)} Wb`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("End flux", `${formatSimulationNumber(endFlux, 3)} Wb`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Delta flux", `${formatSimulationNumber(deltaFlux, 3)} Wb`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Average emf", `${formatSimulationNumber(averageEmf, 2)} V`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Flux depends on B, area, and angle to the loop normal.",
        "Induced emf depends on the rate of change of flux linkage, not just flux size.",
        "A fast change in the same flux window gives a larger emf.",
      ],
      "This board is meant to stop the usual collapse of 'flux exists' into 'emf exists.' A9_L1 only rewards answers that keep flux size and flux change separate.",
    );
  }

  if (lessonKey === "A9_L2") {
    const mode = clamp(Math.round(simBias), 0, 3);
    const rate = clamp(simVectorMagnitude, 0.5, 5);
    const labels = [
      { change: "into-page flux increasing", field: "out of page", current: "anticlockwise" },
      { change: "into-page flux decreasing", field: "into page", current: "clockwise" },
      { change: "out-of-page flux increasing", field: "into page", current: "clockwise" },
      { change: "out-of-page flux decreasing", field: "out of page", current: "anticlockwise" },
    ];
    const active = labels[mode];

    return renderPanel(
      "Opposition mapper",
      <>
        {sliderField("Flux-change case", active.change, <input className="w-full" type="range" min="0" max="3" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Change rate", `${formatSimulationNumber(rate, 1)} flux units/s`, <input className="w-full" type="range" min="0.5" max="5" step="0.1" value={rate} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Lenz board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Name the change first, then choose the induced field that pushes back</text>
        <circle cx="210" cy="128" r="72" fill="none" stroke="#334155" strokeWidth="6" />
        <circle cx="430" cy="128" r="72" fill="none" stroke="#2563eb" strokeWidth="6" />
        <text x="142" y="88" fill="#334155" fontSize="18" fontWeight="700">original change</text>
        <text x="382" y="88" fill="#1d4ed8" fontSize="18" fontWeight="700">induced response</text>
        <text x="122" y="134" fill="#0f172a" fontSize="16">{active.change}</text>
        <text x="404" y="124" fill="#1d4ed8" fontSize="16">{active.field}</text>
        <text x="404" y="150" fill="#1d4ed8" fontSize="16">{active.current}</text>
        <path d="M286 128H354" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="366,128 348,118 348,138" fill="#0f172a" />
        <text x="172" y="204" fill="#475569" fontSize="16">the loop responds against the increase or decrease, not against flux in general</text>
      </svg>,
      <>
        {metricCard("Original change", active.change, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Induced field", active.field, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Current sense", active.current, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Response size", `${formatSimulationNumber(rate, 1)} relative`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Lenz's law opposes the change that caused the induction.",
        "Direction comes from increase-versus-decrease, not from flux direction alone.",
        "A larger rate of change can strengthen the response without changing the opposition rule.",
      ],
      "This panel makes the reasoning sequence visible: identify the flux change, choose the opposing induced field, then infer the current direction. That sequence is what we want learners to say in A9_L2 answers.",
    );
  }

  if (lessonKey === "A9_L3") {
    const rpm = clamp(simVectorMagnitude, 300, 3600);
    const turns = clamp(simDensityMass, 50, 400);
    const fluxSwing = clamp(simMetricMeters, 0.01, 0.08);
    const timeSlice = clamp(simFluidDensity, 0.01, 0.12);
    const frequency = rpm / 60;
    const period = 1 / frequency;
    const avgEmf = (turns * (2 * fluxSwing)) / timeSlice;

    return renderPanel(
      "Generator trace",
      <>
        {sliderField("Spin rate", `${formatSimulationNumber(rpm, 0)} rpm`, <input className="w-full" type="range" min="300" max="3600" step="50" value={rpm} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Turns", `${formatSimulationNumber(turns, 0)} turns`, <input className="w-full" type="range" min="50" max="400" step="10" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Flux swing", `${formatSimulationNumber(fluxSwing, 3)} Wb`, <input className="w-full" type="range" min="0.01" max="0.08" step="0.002" value={fluxSwing} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Time slice", `${formatSimulationNumber(timeSlice, 3)} s`, <input className="w-full" type="range" min="0.01" max="0.12" step="0.005" value={timeSlice} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Generator board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eef2ff" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Repeated flux change from rotation becomes an alternating emf trace</text>
        <rect x="130" y="76" width="44" height="100" rx="12" fill="#ef4444" />
        <rect x="466" y="76" width="44" height="100" rx="12" fill="#3b82f6" />
        <text x="144" y="98" fill="#fff" fontSize="18" fontWeight="700">N</text>
        <text x="480" y="98" fill="#fff" fontSize="18" fontWeight="700">S</text>
        <rect x="248" y="98" width="120" height="56" rx="18" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="6" />
        <path d="M394 170c30-38 52-38 82 0s52 38 82 0" stroke="#7c3aed" strokeWidth="6" fill="none" />
        <path d="M394 170c-30-38-52-38-82 0" stroke="#7c3aed" strokeWidth="6" fill="none" />
        <path d="M394 170H580" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
        <text x="412" y="204" fill="#475569" fontSize="16">each full turn repeats the waveform once in a simple a.c. generator</text>
      </svg>,
      <>
        {metricCard("Frequency", `${formatSimulationNumber(frequency, 1)} Hz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Period", `${formatSimulationNumber(period, 3)} s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Average emf", `${formatSimulationNumber(avgEmf, 1)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Output type", "alternating", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "A full rotation repeats the emf cycle in a simple two-pole generator.",
        "Faster rotation raises both cycle frequency and rate of flux change.",
        "More turns or bigger flux swing increase emf amplitude without changing the alternation rule.",
      ],
      "This explorer ties the waveform back to the induction mechanism so A9_L3 does not collapse into isolated formulas about rpm and frequency.",
    );
  }

  if (lessonKey === "A9_L4") {
    const primaryTurns = clamp(simDensityMass, 100, 1000);
    const secondaryTurns = clamp(simDensityVolume, 50, 1500);
    const primaryVoltage = clamp(simVectorMagnitude, 12, 240);
    const primaryCurrent = clamp(simMetricMeters, 0.2, 8.0);
    const secondaryVoltage = primaryVoltage * (secondaryTurns / primaryTurns);
    const secondaryCurrent = secondaryVoltage > 0 ? (primaryVoltage * primaryCurrent) / secondaryVoltage : 0;

    return renderPanel(
      "Transformer bridge",
      <>
        {sliderField("Primary turns", `${formatSimulationNumber(primaryTurns, 0)} turns`, <input className="w-full" type="range" min="100" max="1000" step="20" value={primaryTurns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Secondary turns", `${formatSimulationNumber(secondaryTurns, 0)} turns`, <input className="w-full" type="range" min="50" max="1500" step="25" value={secondaryTurns} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Primary voltage", `${formatSimulationNumber(primaryVoltage, 0)} V`, <input className="w-full" type="range" min="12" max="240" step="6" value={primaryVoltage} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Primary current", `${formatSimulationNumber(primaryCurrent, 2)} A`, <input className="w-full" type="range" min="0.2" max="8.0" step="0.1" value={primaryCurrent} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Core-link board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#fefce8" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Changing primary flux links both coils, then the turns ratio sets the voltages</text>
        <rect x="214" y="78" width="212" height="92" rx="24" fill="#94a3b8" />
        {Array.from({ length: 6 }).map((_, index) => (
          <path key={`p-${index}`} d={`M${112 + index * 14} 92c10 0 10 64 0 64`} stroke="#f97316" strokeWidth="8" fill="none" strokeLinecap="round" />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <path key={`s-${index}`} d={`M${438 + index * 12} 92c10 0 10 64 0 64`} stroke="#2563eb" strokeWidth="8" fill="none" strokeLinecap="round" />
        ))}
        <text x="100" y="188" fill="#c2410c" fontSize="16">primary</text>
        <text x="472" y="188" fill="#1d4ed8" fontSize="16">secondary</text>
        <path d="M236 124H404" stroke="#facc15" strokeWidth="6" strokeDasharray="10 7" />
        <text x="254" y="114" fill="#a16207" fontSize="16">shared changing flux in the core</text>
      </svg>,
      <>
        {metricCard("Secondary voltage", `${formatSimulationNumber(secondaryVoltage, 1)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Secondary current", `${formatSimulationNumber(secondaryCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Transformer type", secondaryTurns > primaryTurns ? "step-up" : secondaryTurns < primaryTurns ? "step-down" : "1:1", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Ideal power", `${formatSimulationNumber(primaryVoltage * primaryCurrent, 1)} W`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Transformers need changing primary current so the core flux keeps changing.",
        "Voltage ratio follows the turns ratio in the ideal model.",
        "If voltage is stepped up ideally, current steps down to keep power balanced.",
      ],
      "This panel keeps transformer action inside the induction story instead of letting it drift into disconnected ratio memorization.",
    );
  }

  if (lessonKey === "A9_L5") {
    const peakVoltageKV = clamp(simVectorMagnitude, 20, 400);
    const deliveredPowerKW = clamp(simDensityMass, 200, 2000);
    const lineResistance = clamp(simMetricMeters, 2, 20);
    const rmsVoltageKV = peakVoltageKV / Math.sqrt(2);
    const lineCurrent = deliveredPowerKW / rmsVoltageKV;
    const lineLoss = lineCurrent * lineCurrent * lineResistance;

    return renderPanel(
      "Rms transmission route",
      <>
        {sliderField("Peak line voltage", `${formatSimulationNumber(peakVoltageKV, 0)} kV`, <input className="w-full" type="range" min="20" max="400" step="10" value={peakVoltageKV} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Delivered power", `${formatSimulationNumber(deliveredPowerKW, 0)} kW`, <input className="w-full" type="range" min="200" max="2000" step="50" value={deliveredPowerKW} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Cable resistance", `${formatSimulationNumber(lineResistance, 1)} ohm`, <input className="w-full" type="range" min="2" max="20" step="0.5" value={lineResistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Transmission board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#fff7ed" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Rms makes a.c. power practical, and high voltage cuts cable current and I squared R loss</text>
        <path d="M92 170c32-46 64-46 96 0s64 46 96 0s64-46 96 0s64 46 96 0" stroke="#7c3aed" strokeWidth="6" fill="none" />
        <path d="M92 170H548" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 6" />
        <rect x="88" y="86" width="108" height="40" rx="16" fill="#2563eb" />
        <rect x="442" y="86" width="108" height="40" rx="16" fill="#f97316" />
        <text x="108" y="112" fill="#fff" fontSize="16" fontWeight="700">step up</text>
        <text x="458" y="112" fill="#fff" fontSize="16" fontWeight="700">step down</text>
        <text x="204" y="112" fill="#475569" fontSize="16">long line, same power, lower current</text>
        <text x="208" y="204" fill="#475569" fontSize="16">compare voltage first, then current, then cable heating loss</text>
      </svg>,
      <>
        {metricCard("Rms voltage", `${formatSimulationNumber(rmsVoltageKV, 1)} kV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Line current", `${formatSimulationNumber(lineCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Cable loss", `${formatSimulationNumber(lineLoss, 1)} W`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Rms meaning", "d.c.-equivalent heating", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Vrms is the effective value for heating and power comparison.",
        "For the same delivered power, higher voltage means lower current.",
        "Lower current cuts I squared R heating losses very strongly.",
      ],
      "A9_L5 needs both bridges visible at once: rms translates a.c. into practical power values, and the transmission route then shows why current reduction matters.",
    );
  }

  if (lessonKey === "A9_L6") {
    const mode = clamp(Math.round(simBias), 0, 2);
    const baseCurrent = clamp(simVectorMagnitude, 1, 12);
    const resistance = clamp(simMetricMeters, 0.1, 2.0);
    const interruption = clamp(simDensityMass, 0, 5);
    const effectiveCurrent = baseCurrent / (1 + interruption * 0.35);
    const heating = effectiveCurrent * effectiveCurrent * resistance;
    const modes = ["braking", "heating", "core loss"];
    const application = modes[mode] ?? "braking";

    return renderPanel(
      "Eddy-current applications",
      <>
        {sliderField("Application", application, <input className="w-full" type="range" min="0" max="2" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Base induced current", `${formatSimulationNumber(baseCurrent, 1)} A`, <input className="w-full" type="range" min="1" max="12" step="0.2" value={baseCurrent} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Resistance", `${formatSimulationNumber(resistance, 2)} ohm`, <input className="w-full" type="range" min="0.1" max="2.0" step="0.05" value={resistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Interruptions", `${formatSimulationNumber(interruption, 0)} cuts`, <input className="w-full" type="range" min="0" max="5" step="1" value={interruption} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Eddy-current board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Changing flux drives local loops; design decides whether the effect is useful or unwanted</text>
        <circle cx="206" cy="128" r="66" fill="none" stroke="#334155" strokeWidth="6" />
        <circle cx="206" cy="128" r="34" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeDasharray="10 8" />
        <rect x="360" y="76" width="168" height="104" rx="24" fill="#e2e8f0" stroke="#64748b" strokeWidth="5" />
        {Array.from({ length: interruption }).map((_, index) => (
          <rect key={index} x={386 + index * 24} y="76" width="8" height="104" rx="4" fill="#fff" />
        ))}
        <text x="156" y="206" fill="#475569" fontSize="16">solid or slotted route changes the loop strength</text>
        <text x="394" y="206" fill="#475569" fontSize="16">{application === "braking" ? "more continuous paths -> stronger drag" : application === "heating" ? "more continuous paths -> stronger heating" : "interrupt paths to reduce waste"}</text>
      </svg>,
      <>
        {metricCard("Effective current", `${formatSimulationNumber(effectiveCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("I squared R heating", `${formatSimulationNumber(heating, 2)} W`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Current loops", interruption === 0 ? "continuous" : "interrupted", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Application read", application, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Eddy currents are local induced loops in bulk conductors.",
        "The same mechanism can give useful heating, useful braking, or unwanted core loss.",
        "Slots and laminations reduce the loop strength by interrupting the current paths.",
      ],
      "This final A9 explorer keeps the mechanism identical across the applications so learners can explain why braking, induction heating, and laminated-core design all belong to the same induction chapter.",
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      Use the lesson board and the prompts above to compare the named quantities before you continue.
    </div>
  );
}
