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

export default function M7SimulationPanels({
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

  if (lessonKey === "M7_L1") {
    const beatRate = clamp(simMetricMeters, 1, 8);
    const frontDistance = clamp(simVectorMagnitude, 6, 30);
    const time = clamp(simDensityVolume, 1, 8);
    const padAmplitude = clamp(simDensityMass, 1, 5);
    const waveSpeed = frontDistance / time;
    const activePad = Math.min(5, Math.max(0, Math.round((frontDistance / 30) * 5)));
    return render(
      "Travel pattern lab",
      <>
        {sliderField("Beat rate", `${formatSimulationNumber(beatRate, 0)} Hz`, <input className="w-full" type="range" min="1" max="8" step="1" value={beatRate} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Front distance", `${formatSimulationNumber(frontDistance, 0)} m`, <input className="w-full" type="range" min="6" max="30" step="1" value={frontDistance} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Crossing time", `${formatSimulationNumber(time, 1)} s`, <input className="w-full" type="range" min="1" max="8" step="0.5" value={time} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Pad pulse size", `${formatSimulationNumber(padAmplitude, 1)} cm`, <input className="w-full" type="range" min="1" max="5" step="0.5" value={padAmplitude} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Signal-Stadium board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="30" width="584" height="176" rx="26" fill="#eff6ff" />
        <text x="52" y="62" fill="#0f172a" fontSize="22" fontWeight="700">The pattern travels; the pads pulse locally</text>
        <line x1="70" y1="164" x2="570" y2="164" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <circle
            key={index}
            cx={98 + index * 82}
            cy={index === activePad ? 164 - padAmplitude * 10 : 164}
            r="14"
            fill={index === activePad ? "#2563eb" : "#cbd5e1"}
          />
        ))}
        <line x1="86" y1="96" x2={86 + (frontDistance / 30) * 460} y2="96" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" />
        <polygon points={`${86 + (frontDistance / 30) * 460},96 ${66 + (frontDistance / 30) * 460},84 ${66 + (frontDistance / 30) * 460},108`} fill="#22c55e" />
        <text x="90" y="126" fill="#166534" fontSize="17">Front travel = {formatSimulationNumber(frontDistance, 0)} m</text>
        <text x="74" y="194" fill="#475569" fontSize="15">Only one pad is highlighted, but the front keeps crossing the arena.</text>
      </svg>,
      <>
        {metricCard("Ripple Run", `${formatSimulationNumber(waveSpeed, 2)} m/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Active pad", `Pad ${activePad + 1}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Beat Rate", `${formatSimulationNumber(beatRate, 0)} Hz`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Pad motion", `${formatSimulationNumber(padAmplitude, 1)} cm local pulse`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Track the front separately from one pad.",
        "The pad only oscillates around its place.",
        "Wave speed belongs to the front travel, not one pad.",
      ],
      "This board keeps local pad motion separate from pattern travel so students can see what actually crosses the stadium.",
    );
  }

  if (lessonKey === "M7_L2") {
    const mode = clamp(Math.round(simBias), 0, 1);
    const travelDirection = clamp(simVectorAngle, 0, 180);
    const motionAngle = mode === 0 ? 90 : 0;
    const modeLabel = mode === 0 ? "Cross-Sway / transverse" : "Push-Squeeze / longitudinal";
    return render(
      "Mode match lab",
      <>
        {sliderField("Wave mode", modeLabel, <input className="w-full" type="range" min="0" max="1" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Travel direction", `${formatSimulationNumber(travelDirection, 0)} degrees`, <input className="w-full" type="range" min="0" max="180" step="5" value={travelDirection} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Mode comparison board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="28" width="584" height="182" rx="26" fill="#eef2ff" />
        <text x="52" y="60" fill="#0f172a" fontSize="22" fontWeight="700">{modeLabel}</text>
        <line x1="100" y1="155" x2="520" y2="155" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <line x1="110" y1="102" x2="310" y2="102" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <polygon points="310,102 286,88 286,116" fill="#2563eb" />
        {mode === 0 ? (
          <>
            {[0, 1, 2, 3].map((index) => (
              <line key={index} x1={150 + index * 90} y1="155" x2={150 + index * 90} y2="108" stroke="#ec4899" strokeWidth="10" strokeLinecap="round" />
            ))}
          </>
        ) : (
          <>
            {[0, 1, 2, 3].map((index) => (
              <rect key={index} x={126 + index * 90} y="132" width="44" height="24" rx="10" fill={index % 2 === 0 ? "#22c55e" : "#86efac"} />
            ))}
          </>
        )}
        <text x="104" y="130" fill="#2563eb" fontSize="16">Propagation</text>
        <text x="352" y="118" fill="#475569" fontSize="16">Local motion angle = {motionAngle} degrees</text>
        <text x="352" y="145" fill="#475569" fontSize="16">Travel direction = {formatSimulationNumber(travelDirection, 0)} degrees</text>
      </svg>,
      <>
        {metricCard("Wave style", mode === 0 ? "Transverse" : "Longitudinal", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Motion-travel angle", `${motionAngle} degrees`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Propagation", `${formatSimulationNumber(travelDirection, 0)} degrees`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Classification clue", mode === 0 ? "perpendicular" : "parallel", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Wave type depends on a directional comparison.",
        "Transverse means perpendicular to propagation.",
        "Longitudinal means parallel to propagation.",
      ],
      "The board keeps one propagation arrow visible while the local response changes, so the classification stays relational.",
    );
  }

  if (lessonKey === "M7_L3") {
    const beatRate = clamp(simMetricMeters, 1, 8);
    const pulseGap = clamp(simVectorMagnitude, 0.5, 6);
    const speed = beatRate * pulseGap;
    return render(
      "Beat-Rate and Pulse-Gap lab",
      <>
        {sliderField("Beat rate", `${formatSimulationNumber(beatRate, 0)} Hz`, <input className="w-full" type="range" min="1" max="8" step="1" value={beatRate} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Pulse gap", `${formatSimulationNumber(pulseGap, 1)} m`, <input className="w-full" type="range" min="0.5" max="6" step="0.5" value={pulseGap} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Wave relation board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width="580" height="176" rx="26" fill="#eff6ff" />
        <text x="56" y="62" fill="#0f172a" fontSize="22" fontWeight="700">Ripple Run = Beat Rate x Pulse Gap</text>
        {[0, 1, 2, 3, 4].map((index) => (
          <line key={index} x1={90 + index * pulseGap * 22} y1="128" x2={115 + index * pulseGap * 22} y2="128" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        ))}
        <text x="90" y="98" fill="#2563eb" fontSize="16">Front spacing = {formatSimulationNumber(pulseGap, 1)} m</text>
        <rect x="360" y="92" width="198" height="54" rx="18" fill="#0f172a" />
        <text x="390" y="127" fill="#fff" fontSize="22" fontWeight="700">v = {formatSimulationNumber(speed, 1)} m/s</text>
        <text x="90" y="172" fill="#475569" fontSize="15">More fronts each second or wider spacing both push the speed upward.</text>
      </svg>,
      <>
        {metricCard("Beat Rate", `${formatSimulationNumber(beatRate, 0)} Hz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Pulse Gap", `${formatSimulationNumber(pulseGap, 1)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Ripple Run", `${formatSimulationNumber(speed, 1)} m/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Formal rule", "v = fλ", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Frequency is the source launch rate.",
        "Wavelength is spacing between matching fronts.",
        "Wave speed comes from the product of the two.",
      ],
      "This board keeps the three linked quantities visible together so the equation reads like a system relationship, not a slogan.",
    );
  }

  if (lessonKey === "M7_L4") {
    const incident = clamp(simVectorMagnitude, 0, 80);
    const reflected = incident;
    const surfaceAngle = 90;
    return render(
      "Bounce Wall lab",
      <>
        {sliderField("Incident angle", `${formatSimulationNumber(incident, 0)} degrees to the normal`, <input className="w-full" type="range" min="0" max="80" step="5" value={incident} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Wall orientation", `${surfaceAngle} degrees`, <input className="w-full" type="range" min="90" max="90" step="1" value={surfaceAngle} readOnly />)}
      </>,
      "Reflection board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width="580" height="176" rx="26" fill="#eef2ff" />
        <line x1="320" y1="58" x2="320" y2="196" stroke="#0f172a" strokeWidth="8" />
        <line x1="210" y1="127" x2="430" y2="127" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="185" y1="60" x2="320" y2="127" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="320" y1="127" x2="455" y2={194 - incident * 1.2} stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
        <text x="76" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Bounce Wall geometry</text>
        <text x="76" y="182" fill="#2563eb" fontSize="16">Incident = {formatSimulationNumber(incident, 0)} degrees</text>
        <text x="340" y="182" fill="#166534" fontSize="16">Reflected = {formatSimulationNumber(reflected, 0)} degrees</text>
        <text x="250" y="116" fill="#475569" fontSize="14">normal</text>
      </svg>,
      <>
        {metricCard("Incident angle", `${formatSimulationNumber(incident, 0)} degrees`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Reflected angle", `${formatSimulationNumber(reflected, 0)} degrees`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Reference line", "normal", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Boundary story", incident === 0 ? "head-on retrace" : "equal-angle bounce", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Reflection is a bounce at the boundary.",
        "Measure both angles from the normal.",
        "Head-on reflection retraces the path.",
      ],
      "This board keeps the normal line visible so the equal-angle rule does not get mixed up with wall-surface angles.",
    );
  }

  if (lessonKey === "M7_L5") {
    const frequency = clamp(simMetricMeters, 1, 8);
    const speedA = clamp(simVectorMagnitude, 6, 16);
    const speedB = clamp(simDensityMass, 3, 16);
    const lambdaA = speedA / frequency;
    const lambdaB = speedB / frequency;
    const bend = speedB < speedA ? "toward normal" : speedB > speedA ? "away from normal" : "no turn";
    return render(
      "Pace Zone lab",
      <>
        {sliderField("Source frequency", `${formatSimulationNumber(frequency, 0)} Hz`, <input className="w-full" type="range" min="1" max="8" step="1" value={frequency} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Zone A speed", `${formatSimulationNumber(speedA, 0)} m/s`, <input className="w-full" type="range" min="6" max="16" step="1" value={speedA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Zone B speed", `${formatSimulationNumber(speedB, 0)} m/s`, <input className="w-full" type="range" min="3" max="16" step="1" value={speedB} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Refraction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width="280" height="176" rx="26" fill="#dbeafe" />
        <rect x="330" y="30" width="280" height="176" rx="26" fill="#dcfce7" />
        <text x="56" y="58" fill="#1d4ed8" fontSize="20" fontWeight="700">Zone A</text>
        <text x="354" y="58" fill="#166534" fontSize="20" fontWeight="700">Zone B</text>
        <line x1="320" y1="52" x2="320" y2="204" stroke="#0f172a" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="160" y1="170" x2="320" y2="120" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="320" y1="120" x2="500" y2={bend === "toward normal" ? 104 : bend === "away from normal" ? 146 : 120} stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
        <text x="60" y="98" fill="#0f172a" fontSize="16">v = {formatSimulationNumber(speedA, 0)} m/s</text>
        <text x="60" y="126" fill="#0f172a" fontSize="16">λ = {formatSimulationNumber(lambdaA, 2)} m</text>
        <text x="354" y="98" fill="#0f172a" fontSize="16">v = {formatSimulationNumber(speedB, 0)} m/s</text>
        <text x="354" y="126" fill="#0f172a" fontSize="16">λ = {formatSimulationNumber(lambdaB, 2)} m</text>
      </svg>,
      <>
        {metricCard("Frequency", `${formatSimulationNumber(frequency, 0)} Hz`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Zone B wavelength", `${formatSimulationNumber(lambdaB, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Turn", bend, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Rule", "frequency stays fixed", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "The source keeps frequency fixed.",
        "The new medium changes speed.",
        "Wavelength adjusts with the new speed.",
      ],
      "This board keeps source frequency, zone speed, and wavelength visible together so refraction stays a speed-change story.",
    );
  }

  if (lessonKey === "M7_L6") {
    const wavelength = clamp(simVectorMagnitude, 1, 10);
    const gateWidth = clamp(simMetricMeters, 1, 20);
    const edgeMode = clamp(Math.round(simBias), 0, 1);
    const ratio = gateWidth / wavelength;
    const spread = clamp(90 / Math.max(1, ratio), 12, 80);
    return render(
      "Gate Spread lab",
      <>
        {sliderField("Wavelength", `${formatSimulationNumber(wavelength, 1)} cm`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={wavelength} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Gate width", `${formatSimulationNumber(gateWidth, 1)} cm`, <input className="w-full" type="range" min="1" max="20" step="0.5" value={gateWidth} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Boundary type", edgeMode ? "Obstacle edge" : "Gate opening", <input className="w-full" type="range" min="0" max="1" step="1" value={edgeMode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Diffraction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width="580" height="176" rx="26" fill="#eef2ff" />
        <line x1="300" y1="64" x2="300" y2="196" stroke="#0f172a" strokeWidth="12" />
        {!edgeMode ? <rect x="294" y="110" width="12" height={gateWidth * 4} fill="#eef2ff" /> : null}
        {!edgeMode
          ? [0, 1, 2, 3].map((index) => <line key={index} x1="84" y1={88 + index * wavelength * 10} x2="260" y2={88 + index * wavelength * 10} stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />)
          : [0, 1, 2, 3].map((index) => <line key={index} x1="84" y1={88 + index * wavelength * 10} x2="260" y2={88 + index * wavelength * 10} stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />)}
        <path d={`M310 128 Q ${360 + spread} ${128 - spread / 2} 540 78`} stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={`M310 128 Q ${360 + spread} 128 540 128`} stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={`M310 128 Q ${360 + spread} ${128 + spread / 2} 540 178`} stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round" />
        <text x="60" y="58" fill="#0f172a" fontSize="20" fontWeight="700">Gate Spread comparison</text>
        <text x="60" y="188" fill="#475569" fontSize="15">Comparable gate size and wavelength give a broader outgoing fan.</text>
      </svg>,
      <>
        {metricCard("Gate-width ratio", `${formatSimulationNumber(ratio, 2)} × λ`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Spread strength", `${formatSimulationNumber(spread, 0)} deg fan`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Boundary", edgeMode ? "edge" : "opening", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Diffraction", ratio <= 1.5 ? "strong" : ratio <= 3 ? "moderate" : "weak", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Compare opening size with wavelength first.",
        "Comparable sizes give stronger diffraction.",
        "All waves can show this spreading behavior.",
      ],
      "This board makes diffraction a size-comparison story instead of a sound-only fact or a random blur.",
    );
  }

  return render(
    "Lesson explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its lesson-specific Signal-Stadium panel.
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
      "Each M7 lesson should own its explorer directly.",
      "If this appears, the lesson wiring needs a dedicated panel.",
      "The waves module should not silently fall through to another lesson view.",
    ],
    "This safety fallback is intentionally neutral so an unhandled lesson key cannot masquerade as a different waves activity.",
  );
}
