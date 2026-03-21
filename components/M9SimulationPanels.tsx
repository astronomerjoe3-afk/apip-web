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
        {boardFrame(boardTitle, board)}
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );
}

export default function M9SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simDensityMass,
  setSimDensityMass,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M9_L1") {
    const beaconRate = clamp(simMetricMeters, 60, 600);
    const beaconSwing = clamp(simVectorMagnitude, 1, 6);
    const sourceOn = clamp(Math.round(simBias), 0, 1) === 1;
    return renderPanel(
      "Wake the Beacon",
      <>
        {sliderField("Beacon rate", `${formatSimulationNumber(beaconRate, 0)} Hz`, <input className="w-full" type="range" min="60" max="600" step="20" value={beaconRate} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Beacon swing", `${formatSimulationNumber(beaconSwing, 1)} mm`, <input className="w-full" type="range" min="1" max="6" step="0.5" value={beaconSwing} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Beacon state", sourceOn ? "on" : "off", <input className="w-full" type="range" min="0" max="1" step="1" value={sourceOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Beacon board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eff6ff" />
        <rect x="78" y="76" width="42" height="88" rx="20" fill="#1d4ed8" />
        <line x1="120" y1="120" x2="218" y2="120" stroke="#60a5fa" strokeWidth="12" strokeDasharray="14 10" />
        <line x1="224" y1="120" x2="332" y2="120" stroke="#93c5fd" strokeWidth="8" strokeDasharray="10 14" />
        <line x1="340" y1="120" x2="450" y2="120" stroke="#60a5fa" strokeWidth="12" strokeDasharray="14 10" />
        <text x="70" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Vibrating source launches the sound</text>
        <text x="78" y="188" fill="#1d4ed8" fontSize="16">Scout Beacon</text>
        <text x="198" y="98" fill="#0f766e" fontSize="16">Squeeze</text>
        <text x="276" y="154" fill="#475569" fontSize="16">Release</text>
        <text x="410" y="98" fill="#0f766e" fontSize="16">Squeeze</text>
      </svg>,
      <>
        {metricCard("Source state", sourceOn ? "vibrating" : "still", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Launched frequency", sourceOn ? `${formatSimulationNumber(beaconRate, 0)} Hz` : "0 Hz", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Swing size", `${formatSimulationNumber(beaconSwing, 1)} mm`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Launch rule", "no wiggle, no sound", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Start by identifying what is vibrating.", "The source rate sets the sound frequency.", "The nearby air is disturbed; it is not transported wholesale."],
      "This board keeps the source and the first pressure bands visible together so sound launch stays source-first.",
    );
  }

  if (lessonKey === "M9_L2") {
    const shift = clamp(simVectorMagnitude, 1, 5);
    const spacing = clamp(simMetricMeters, 2, 8);
    return renderPanel(
      "Crowd Relay",
      <>
        {sliderField("Particle shuffle", `${formatSimulationNumber(shift, 1)} mm`, <input className="w-full" type="range" min="1" max="5" step="0.5" value={shift} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Band spacing", `${formatSimulationNumber(spacing, 1)} units`, <input className="w-full" type="range" min="2" max="8" step="0.5" value={spacing} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Pressure-wave board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eef2ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Compressions and rarefactions move through the crowd</text>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <circle key={index} cx={92 + index * 68} cy="138" r="12" fill={index === 2 || index === 5 ? "#2563eb" : "#94a3b8"} />
        ))}
        <rect x="176" y="96" width="78" height="84" rx="24" fill="#bfdbfe" opacity="0.65" />
        <rect x="380" y="96" width="78" height="84" rx="24" fill="#bfdbfe" opacity="0.65" />
        <text x="174" y="88" fill="#1d4ed8" fontSize="16">Squeeze</text>
        <text x="288" y="88" fill="#475569" fontSize="16">Release</text>
        <text x="378" y="88" fill="#1d4ed8" fontSize="16">Squeeze</text>
        <line x1="86" y1="186" x2="554" y2="186" stroke="#475569" strokeWidth="4" strokeDasharray="8 8" />
      </svg>,
      <>
        {metricCard("Wave type", "longitudinal", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Particle motion", `${formatSimulationNumber(shift, 1)} mm local`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Band spacing", `${formatSimulationNumber(spacing, 1)} units`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Travel story", "pattern moves, crowd relays", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Compressions are crowded high-pressure regions.", "Rarefactions are spread-out low-pressure regions.", "Particles oscillate locally while the pattern travels onward."],
      "The diagram keeps the local crowd and the traveling pressure pattern separate so the medium does not get mistaken for the wave path.",
    );
  }

  if (lessonKey === "M9_L3") {
    const frequency = clamp(simMetricMeters, 120, 1200);
    const loudness = clamp(simVectorMagnitude, 1, 8);
    const wavelength = 340 / frequency;
    return renderPanel(
      "Pitch Match",
      <>
        {sliderField("Frequency", `${formatSimulationNumber(frequency, 0)} Hz`, <input className="w-full" type="range" min="120" max="1200" step="20" value={frequency} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Loudness bar", `${formatSimulationNumber(loudness, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.5" value={loudness} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Pitch board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eff6ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Frequency controls pitch; loudness is separate</text>
        <rect x="82" y="96" width="142" height="88" rx="24" fill="#dbeafe" />
        <rect x="278" y="96" width="88" height="88" rx="24" fill="#bfdbfe" />
        <rect x="408" y={184 - loudness * 12} width="76" height={loudness * 12} rx="18" fill="#16a34a" />
        <text x="104" y="142" fill="#1d4ed8" fontSize="18" fontWeight="700">Ping Rate</text>
        <text x="104" y="168" fill="#1d4ed8" fontSize="16">{formatSimulationNumber(frequency, 0)} Hz</text>
        <text x="286" y="142" fill="#312e81" fontSize="18" fontWeight="700">Pitch</text>
        <text x="284" y="168" fill="#312e81" fontSize="16">{frequency > 700 ? "higher" : frequency > 350 ? "middle" : "lower"}</text>
        <text x="408" y="92" fill="#166534" fontSize="16">Loudness</text>
      </svg>,
      <>
        {metricCard("Frequency", `${formatSimulationNumber(frequency, 0)} Hz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Pitch clue", frequency > 700 ? "higher tone" : frequency > 350 ? "mid tone" : "lower tone", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Loudness", `${formatSimulationNumber(loudness, 1)} units`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Wavelength", `${formatSimulationNumber(wavelength, 2)} m`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Pitch tracks frequency.", "Loudness is not the same quantity as pitch.", "In the same air, higher frequency shortens wavelength."],
      "This board keeps pitch and loudness on different displays so students do not read one as the other.",
    );
  }

  if (lessonKey === "M9_L4") {
    const frequency = clamp(simMetricMeters, 1000, 40000);
    const ultrasonic = frequency > 20000;
    return renderPanel(
      "Super-Scout",
      <>
        {sliderField("Frequency", `${formatSimulationNumber(frequency, 0)} Hz`, <input className="w-full" type="range" min="1000" max="40000" step="500" value={frequency} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Frequency-band board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eef2ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Hear Zone and Super-Scout Mode</text>
        <rect x="82" y="118" width="250" height="30" rx="15" fill="#60a5fa" />
        <rect x="336" y="118" width="216" height="30" rx="15" fill="#7c3aed" />
        <line x1="334" y1="96" x2="334" y2="174" stroke="#0f172a" strokeWidth="4" strokeDasharray="8 8" />
        <circle cx={82 + (frequency / 40000) * 470} cy="133" r="13" fill="#f59e0b" />
        <text x="104" y="106" fill="#1d4ed8" fontSize="16">Hear Zone</text>
        <text x="396" y="106" fill="#6d28d9" fontSize="16">Super-Scout</text>
        <text x="300" y="202" fill="#475569" fontSize="15">20 kHz boundary</text>
      </svg>,
      <>
        {metricCard("Frequency", `${formatSimulationNumber(frequency, 0)} Hz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Zone", ultrasonic ? "ultrasound" : "audible", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Wave family", "still sound", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Boundary use", "can still reflect", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Most human hearing sits around 20 Hz to 20 kHz.", "Ultrasound is sound above that range.", "Reflection and hearing range are different questions."],
      "The same band line handles audible sound and ultrasound so the classification change does not turn into a wave-family change.",
    );
  }

  if (lessonKey === "M9_L5") {
    const speed = clamp(simMetricMeters, 1200, 2000);
    const echoTime = clamp(simVectorMagnitude, 0.001, 0.008);
    const depth = (speed * echoTime) / 2;
    return renderPanel(
      "Scout Scan",
      <>
        {sliderField("Sound speed", `${formatSimulationNumber(speed, 0)} m/s`, <input className="w-full" type="range" min="1200" max="2000" step="50" value={speed} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Echo time", `${formatSimulationNumber(echoTime, 3)} s`, <input className="w-full" type="range" min="0.001" max="0.008" step="0.0005" value={echoTime} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Echo board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eff6ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Round-trip time becomes one-way depth</text>
        <rect x="82" y="104" width="34" height="58" rx="12" fill="#1d4ed8" />
        <line x1="116" y1="133" x2="430" y2="133" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="430" y1="133" x2="116" y2="176" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
        <rect x="430" y="86" width="22" height="94" rx="8" fill="#f59e0b" />
        <text x="82" y="90" fill="#1d4ed8" fontSize="16">Probe</text>
        <text x="412" y="74" fill="#b45309" fontSize="16">Boundary</text>
        <text x="246" y="116" fill="#1d4ed8" fontSize="15">outward pulse</text>
        <text x="232" y="194" fill="#0f766e" fontSize="15">echo return</text>
      </svg>,
      <>
        {metricCard("Echo time", `${formatSimulationNumber(echoTime, 3)} s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Round-trip distance", `${formatSimulationNumber(speed * echoTime, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Boundary depth", `${formatSimulationNumber(depth, 2)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Key move", "divide by 2", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Echo time is usually the round trip.", "Longer return time means greater depth in the same medium.", "Many echoes are needed to build an image rather than one clue."],
      "The board keeps the pulse out, the echo back, and the boundary depth in one frame so the divide-by-two step feels physical.",
    );
  }

  if (lessonKey === "M9_L6") {
    const sent = clamp(simMetricMeters, 2.5, 5);
    const shift = clamp(simDensityMass, -0.004, 0.004);
    const returned = sent + shift;
    const status = shift > 0.0002 ? "toward" : shift < -0.0002 ? "away" : "near-zero shift";
    return renderPanel(
      "Flow Tracker",
      <>
        {sliderField("Transmitted pulse", `${formatSimulationNumber(sent, 3)} MHz`, <input className="w-full" type="range" min="2.5" max="5" step="0.1" value={sent} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Return shift", `${formatSimulationNumber(shift, 3)} MHz`, <input className="w-full" type="range" min="-0.004" max="0.004" step="0.0005" value={shift} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Doppler board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eef2ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Frequency shift reveals motion direction</text>
        <rect x="82" y="104" width="36" height="62" rx="12" fill="#1d4ed8" />
        <ellipse cx="430" cy="134" rx="58" ry="32" fill="#bfdbfe" />
        <line x1="118" y1="134" x2="366" y2="134" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="366" y1="134" x2="118" y2="172" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
        <text x="82" y="92" fill="#1d4ed8" fontSize="16">Probe</text>
        <text x="406" y="188" fill="#475569" fontSize="16">Moving target</text>
        <text x="222" y="116" fill="#1d4ed8" fontSize="15">sent pulse</text>
        <text x="214" y="198" fill="#0f766e" fontSize="15">returned echo</text>
      </svg>,
      <>
        {metricCard("Sent", `${formatSimulationNumber(sent, 3)} MHz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Returned", `${formatSimulationNumber(returned, 3)} MHz`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Shift sign", shift > 0 ? "positive" : shift < 0 ? "negative" : "zero", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Flow clue", status, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Toward the probe gives a higher return frequency.", "Away from the probe gives a lower return frequency.", "Doppler compares returned frequency with transmitted frequency first."],
      "This board keeps the baseline pulse and the returned pulse side by side so the shift sign stays visible before any medical interpretation is made.",
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      Each M9 lesson should own its sound explorer directly. If you see this fallback, the M9 lesson key is missing a dedicated panel.
    </div>
  );
}
