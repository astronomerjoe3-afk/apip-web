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

export default function A8SimulationPanels({
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
  if (lessonKey === "A8_L1") {
    const sourceSign = clamp(Math.round(simBias), 0, 1) === 1 ? -1 : 1;
    const sourceCharge = clamp(simVectorMagnitude, 1, 8);
    const distance = clamp(simMetricMeters, 0.3, 2.5);
    const testChargeSign = clamp(Math.round(simDensityMass), 0, 1) === 1 ? -1 : 1;
    const testCharge = clamp(simDensityVolume, 0.5, 4);
    const fieldStrength = (sourceCharge * 1800) / (distance * distance);
    const forceMagnitude = (fieldStrength * testCharge) / 1000;
    const fieldDirection = sourceSign > 0 ? "away from source" : "toward source";
    const forceDirection = testChargeSign === sourceSign ? fieldDirection : fieldDirection === "away from source" ? "toward source" : "away from source";
    return renderPanel(
      "Field Mapper",
      <>
        {sliderField("Source sign", sourceSign > 0 ? "+Q" : "-Q", <input className="w-full" type="range" min="0" max="1" step="1" value={sourceSign > 0 ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Source size", `${formatSimulationNumber(sourceCharge, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={sourceCharge} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Probe distance", `${formatSimulationNumber(distance, 2)} m`, <input className="w-full" type="range" min="0.3" max="2.5" step="0.05" value={distance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Test-charge sign", testChargeSign > 0 ? "+q" : "-q", <input className="w-full" type="range" min="0" max="1" step="1" value={testChargeSign > 0 ? 0 : 1} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Test-charge size", `${formatSimulationNumber(testCharge, 1)} units`, <input className="w-full" type="range" min="0.5" max="4" step="0.1" value={testCharge} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Source and probe board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eff6ff" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">The field belongs to the location; the test charge only samples it</text>
        <circle cx="190" cy="128" r="38" fill={sourceSign > 0 ? "#ef4444" : "#2563eb"} />
        <text x="178" y="138" fill="#fff" fontSize="28" fontWeight="700">{sourceSign > 0 ? "+" : "-"}</text>
        <circle cx={190 + distance * 120} cy="128" r="18" fill={testChargeSign > 0 ? "#f59e0b" : "#8b5cf6"} />
        <text x={182 + distance * 120} y="135" fill="#fff" fontSize="18" fontWeight="700">{testChargeSign > 0 ? "+" : "-"}</text>
        <path d={`M238 128H${190 + distance * 120 - 24}`} stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
        <polygon points={sourceSign > 0 ? `${190 + distance * 120 - 10},128 ${190 + distance * 120 - 24},120 ${190 + distance * 120 - 24},136` : `252,128 266,120 266,136`} fill="#0ea5e9" />
        <path d={forceDirection === "away from source" ? `M${190 + distance * 120 + 20} 160H${190 + distance * 120 + 92}` : `M${190 + distance * 120 - 20} 160H${190 + distance * 120 - 92}`} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <polygon points={forceDirection === "away from source" ? `${190 + distance * 120 + 106},160 ${190 + distance * 120 + 92},152 ${190 + distance * 120 + 92},168` : `${190 + distance * 120 - 106},160 ${190 + distance * 120 - 92},152 ${190 + distance * 120 - 92},168`} fill="#10b981" />
        <text x="82" y="198" fill="#475569" fontSize="16">Double the test charge and the force changes, but the field at the point does not.</text>
      </svg>,
      <>
        {metricCard("Field direction", fieldDirection, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Field strength", `${formatSimulationNumber(fieldStrength, 0)} N/C`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Force on probe", `${formatSimulationNumber(forceMagnitude, 2)} N`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Inverse-square cue", distance < 1 ? "near source -> much stronger" : "farther away -> weaker", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Source sign sets whether field arrows point away or toward the charge.", "Changing the probe changes force, not the field itself.", "Distance matters strongly because point-charge field follows an inverse-square pattern."],
      "This explorer is meant to stop the common collapse of field and force into one idea. We keep the source, the location, and the chosen probe separate the whole time.",
    );
  }

  if (lessonKey === "A8_L2") {
    const sourceSign = clamp(Math.round(simBias), 0, 1) === 1 ? -1 : 1;
    const sourceCharge = clamp(simVectorMagnitude, 1, 8);
    const startRadius = clamp(simMetricMeters, 0.4, 2.0);
    const endRadius = clamp(simDensityVolume, 0.5, 2.4);
    const testCharge = (clamp(simFluidDensity, 1, 6) / 2) * (clamp(Math.round(simDensityMass), 0, 1) === 1 ? -1 : 1);
    const vStart = (sourceSign * sourceCharge * 900) / startRadius;
    const vEnd = (sourceSign * sourceCharge * 900) / endRadius;
    const deltaV = vEnd - vStart;
    const deltaEp = testCharge * deltaV;
    return renderPanel(
      "Potential Terrace",
      <>
        {sliderField("Source sign", sourceSign > 0 ? "+Q" : "-Q", <input className="w-full" type="range" min="0" max="1" step="1" value={sourceSign > 0 ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Source size", `${formatSimulationNumber(sourceCharge, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={sourceCharge} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Start radius", `${formatSimulationNumber(startRadius, 2)} m`, <input className="w-full" type="range" min="0.4" max="2.0" step="0.05" value={startRadius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("End radius", `${formatSimulationNumber(endRadius, 2)} m`, <input className="w-full" type="range" min="0.5" max="2.4" step="0.05" value={endRadius} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Travelling charge", `${testCharge > 0 ? "+" : "-"}${formatSimulationNumber(Math.abs(testCharge), 1)} C`, <input className="w-full" type="range" min="1" max="6" step="0.5" value={clamp(simFluidDensity, 1, 6)} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Charge sign", testCharge > 0 ? "positive" : "negative", <input className="w-full" type="range" min="0" max="1" step="1" value={testCharge > 0 ? 0 : 1} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Equipotential terrace board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Potential is the height map; field is the downhill direction across it</text>
        <circle cx="170" cy="128" r="34" fill={sourceSign > 0 ? "#ef4444" : "#2563eb"} />
        <text x="158" y="138" fill="#fff" fontSize="28" fontWeight="700">{sourceSign > 0 ? "+" : "-"}</text>
        <circle cx="170" cy="128" r="64" stroke="#94a3b8" strokeWidth="4" fill="none" strokeDasharray="10 8" />
        <circle cx="170" cy="128" r="104" stroke="#cbd5e1" strokeWidth="4" fill="none" strokeDasharray="10 8" />
        <circle cx="170" cy="128" r="144" stroke="#e2e8f0" strokeWidth="4" fill="none" strokeDasharray="10 8" />
        <path d="M370 90H560" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
        <path d="M370 128H560" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
        <path d="M370 166H560" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
        <text x="386" y="80" fill="#0f172a" fontSize="16">equipotentials: same electric height</text>
        <path d="M520 78V178" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <polygon points="520,194 508,170 532,170" fill="#10b981" />
        <text x="534" y="132" fill="#047857" fontSize="16">field cuts across them</text>
      </svg>,
      <>
        {metricCard("Start potential", `${formatSimulationNumber(vStart, 0)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("End potential", `${formatSimulationNumber(vEnd, 0)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Potential difference", `${formatSimulationNumber(deltaV, 0)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Energy change", `${formatSimulationNumber(deltaEp, 1)} J`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Same equipotential means zero potential difference along that route.", "Potential difference depends on start and end points, not the path taken between them.", "Field direction is perpendicular to equipotentials and points downhill for positive charge."],
      "This board makes potential and field coexist without collapsing them. Equipotentials keep the same height, while field arrows show where the height changes most steeply.",
    );
  }

  if (lessonKey === "A8_L3") {
    const voltage = clamp(simVectorMagnitude, 100, 1500);
    const gap = clamp(simMetricMeters, 0.01, 0.08);
    const charge = (clamp(simDensityVolume, 1, 8) * 1e-6) * (clamp(Math.round(simBias), 0, 1) === 1 ? -1 : 1);
    const mass = clamp(simDensityMass, 1, 10) * 1e-4;
    const fieldStrength = voltage / gap;
    const force = Math.abs(charge) * fieldStrength;
    const acceleration = force / mass;
    const direction = charge > 0 ? "toward negative plate" : "toward positive plate";
    return renderPanel(
      "Plate Gradient",
      <>
        {sliderField("Potential difference", `${formatSimulationNumber(voltage, 0)} V`, <input className="w-full" type="range" min="100" max="1500" step="20" value={voltage} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Plate separation", `${formatSimulationNumber(gap, 3)} m`, <input className="w-full" type="range" min="0.01" max="0.08" step="0.002" value={gap} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Particle charge", `${charge > 0 ? "+" : "-"}${formatSimulationNumber(Math.abs(charge) * 1e6, 1)} microC`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={clamp(simDensityVolume, 1, 8)} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Charge sign", charge > 0 ? "positive" : "negative", <input className="w-full" type="range" min="0" max="1" step="1" value={charge > 0 ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Particle mass", `${formatSimulationNumber(mass * 1000, 2)} g`, <input className="w-full" type="range" min="1" max="10" step="0.2" value={clamp(simDensityMass, 1, 10)} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Parallel-plate field board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eff6ff" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Same voltage across a smaller gap means a steeper electric slope</text>
        <rect x="140" y="82" width="34" height="112" rx="10" fill="#ef4444" />
        <rect x="466" y="82" width="34" height="112" rx="10" fill="#2563eb" />
        <text x="150" y="102" fill="#fff" fontSize="20" fontWeight="700">+</text>
        <text x="476" y="102" fill="#fff" fontSize="20" fontWeight="700">-</text>
        {Array.from({ length: 6 }).map((_, index) => (
          <path key={index} d={`M192 ${94 + index * 18}H448`} stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
        ))}
        {Array.from({ length: 6 }).map((_, index) => (
          <polygon key={`arrow-${index}`} points={`${448},${94 + index * 18} ${434},${88 + index * 18} ${434},${100 + index * 18}`} fill="#0ea5e9" />
        ))}
        <circle cx="318" cy="146" r="16" fill={charge > 0 ? "#f59e0b" : "#8b5cf6"} />
        <text x="311" y="153" fill="#fff" fontSize="16" fontWeight="700">{charge > 0 ? "+" : "-"}</text>
        <path d={charge > 0 ? "M318 170V214" : "M318 122V78"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <polygon points={charge > 0 ? "318,224 306,202 330,202" : "318,68 306,90 330,90"} fill="#10b981" />
      </svg>,
      <>
        {metricCard("Field strength", `${formatSimulationNumber(fieldStrength, 0)} V/m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Force magnitude", `${formatSimulationNumber(force, 3)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Acceleration", `${formatSimulationNumber(acceleration, 1)} m/s^2`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Particle motion", direction, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Uniform field means same-sized arrows through the central gap.", "E = V / d makes the field a packed-potential-drop story.", "Once E is fixed, F = qE and a = F/m explain the particle response."],
      "This explorer keeps the field itself, the force on the particle, and the particle acceleration as three linked but distinct steps.",
    );
  }

  if (lessonKey === "A8_L4") {
    const q1 = clamp(simVectorMagnitude, 1, 8);
    const q2 = clamp(simDensityVolume, 1, 8);
    const q1Sign = clamp(Math.round(simBias), 0, 1) === 1 ? -1 : 1;
    const q2Sign = clamp(Math.round(simSpread), 0, 1) === 1 ? -1 : 1;
    const separation = clamp(simMetricMeters, 0.1, 1.0);
    const force = (9 * q1 * q2) / (separation * separation);
    const interaction = q1Sign === q2Sign ? "repulsion" : "attraction";
    return renderPanel(
      "Coulomb Comparator",
      <>
        {sliderField("Charge 1 size", `${formatSimulationNumber(q1, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={q1} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Charge 1 sign", q1Sign > 0 ? "+Q1" : "-Q1", <input className="w-full" type="range" min="0" max="1" step="1" value={q1Sign > 0 ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Charge 2 size", `${formatSimulationNumber(q2, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={q2} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Charge 2 sign", q2Sign > 0 ? "+Q2" : "-Q2", <input className="w-full" type="range" min="0" max="1" step="1" value={q2Sign > 0 ? 0 : 1} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Separation", `${formatSimulationNumber(separation, 2)} m`, <input className="w-full" type="range" min="0.1" max="1.0" step="0.02" value={separation} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Radial-force board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Charge size sets scale; separation sets the inverse-square weakening</text>
        <circle cx="200" cy="128" r="34" fill={q1Sign > 0 ? "#ef4444" : "#2563eb"} />
        <circle cx={200 + separation * 240} cy="128" r="34" fill={q2Sign > 0 ? "#ef4444" : "#2563eb"} />
        <text x="188" y="138" fill="#fff" fontSize="28" fontWeight="700">{q1Sign > 0 ? "+" : "-"}</text>
        <text x={188 + separation * 240} y="138" fill="#fff" fontSize="28" fontWeight="700">{q2Sign > 0 ? "+" : "-"}</text>
        <path d={interaction === "repulsion" ? "M252 128H318" : `M${200 + separation * 240 - 52} 128H318`} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <path d={interaction === "repulsion" ? `M${200 + separation * 240 - 52} 128H386` : "M252 128H386"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <polygon points={interaction === "repulsion" ? "332,128 318,120 318,136" : "318,128 332,120 332,136"} fill="#10b981" />
        <polygon points={interaction === "repulsion" ? "372,128 386,120 386,136" : "386,128 372,120 372,136"} fill="#10b981" />
        <text x="232" y="196" fill="#475569" fontSize="16">double separation to quarter the force | double one charge to double the force</text>
      </svg>,
      <>
        {metricCard("Interaction", interaction, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Relative force", `${formatSimulationNumber(force, 1)} units`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Distance rule", "inverse square", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Force line", "along line joining charges", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Charge sign decides attraction or repulsion.", "Charge size and separation decide how large the force is.", "The force is radial: it acts along the line joining the charges."],
      "This board is built to stop sign language and magnitude language from being mixed up. First decide attraction or repulsion, then compare the charge product and the distance squared.",
    );
  }

  if (lessonKey === "A8_L5") {
    const mode = clamp(Math.round(simBias), 0, 1) === 1 ? "wire" : "charge";
    const field = clamp(simMetricMeters, 0.1, 1.2);
    const mover = clamp(simVectorMagnitude, 1, 8);
    const secondFactor = clamp(simDensityVolume, 1, 8);
    const angle = clamp(simVectorAngle, 0, 90);
    const reversed = clamp(Math.round(simSpread), 0, 1) === 1;
    const angleFactor = Math.sin((angle * Math.PI) / 180);
    const force = field * mover * secondFactor * angleFactor * 0.08;
    const direction = reversed ? "side-kick reversed" : "side-kick standard";
    return renderPanel(
      "Magnetic Side-Kick",
      <>
        {sliderField("Mode", mode, <input className="w-full" type="range" min="0" max="1" step="1" value={mode === "wire" ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Magnetic field B", `${formatSimulationNumber(field, 2)} T`, <input className="w-full" type="range" min="0.1" max="1.2" step="0.02" value={field} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField(mode === "wire" ? "Current I" : "Charge q", `${formatSimulationNumber(mover, 1)} ${mode === "wire" ? "A" : "units"}`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={mover} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField(mode === "wire" ? "Active length L" : "Speed v", `${formatSimulationNumber(secondFactor, 1)} ${mode === "wire" ? "m" : "x10^5 m/s"}`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={secondFactor} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Crossing angle", `${formatSimulationNumber(angle, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="5" value={angle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Direction flip", reversed ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={reversed ? 1 : 0} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Force-geometry board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eef2ff" />
        <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Magnetic force is perpendicular to the field and to the motion or current</text>
        {Array.from({ length: 7 }).map((_, index) => (
          <path key={index} d={`M108 ${90 + index * 18}H532`} stroke="#a78bfa" strokeWidth="4" strokeDasharray="8 8" />
        ))}
        <text x="82" y="82" fill="#6d28d9" fontSize="16">uniform magnetic field</text>
        <path d={mode === "wire" ? "M236 170H420" : "M236 170L404 104"} stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <circle cx="236" cy="170" r="8" fill="#0f172a" />
        <path d={reversed ? "M330 154V216" : "M330 154V94"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
        <polygon points={reversed ? "330,226 318,204 342,204" : "330,84 318,106 342,106"} fill="#10b981" />
        <text x="360" y={reversed ? 214 : 102} fill="#047857" fontSize="16">{direction}</text>
      </svg>,
      <>
        {metricCard("Force size", `${formatSimulationNumber(force, 2)} N`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Angle factor", formatSimulationNumber(angleFactor, 2), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Strongest case", "90 deg crossing", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("What changes", "direction more than speed", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Parallel to the field gives zero force because there is no crossing component.", "Perpendicular crossing gives the largest force.", "Changing just one direction vector flips the force direction."],
      "This explorer keeps the geometry visible. The important idea is not 'magnet pushes forward' but 'magnet gives a sideways steering force set by the crossing angle.'",
    );
  }

  if (lessonKey === "A8_L6") {
    const mode = clamp(Math.round(simBias), 0, 1) === 1 ? "motor" : "orbit";
    const field = clamp(simMetricMeters, 0.1, 1.2);
    const mover = clamp(simVectorMagnitude, 1, 8);
    const massOrLength = clamp(simDensityMass, 1, 8);
    const chargeOrCurrent = clamp(simDensityVolume, 1, 8);
    const reversed = clamp(Math.round(simSpread), 0, 1) === 1;
    const orbitRadius = (massOrLength * mover) / (Math.max(chargeOrCurrent * field, 0.1));
    const sideForce = field * mover * chargeOrCurrent * 0.08;
    const couple = sideForce * (massOrLength / 2);
    return renderPanel(
      "Orbit And Motor Link",
      <>
        {sliderField("Mode", mode, <input className="w-full" type="range" min="0" max="1" step="1" value={mode === "motor" ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Magnetic field B", `${formatSimulationNumber(field, 2)} T`, <input className="w-full" type="range" min="0.1" max="1.2" step="0.02" value={field} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField(mode === "motor" ? "Current I" : "Speed v", `${formatSimulationNumber(mover, 1)} ${mode === "motor" ? "A" : "x10^5 m/s"}`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={mover} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField(mode === "motor" ? "Coil width" : "Particle mass", `${formatSimulationNumber(massOrLength, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={massOrLength} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField(mode === "motor" ? "Active side current-length scale" : "Charge magnitude", `${formatSimulationNumber(chargeOrCurrent, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={chargeOrCurrent} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Sense flip", reversed ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={reversed ? 1 : 0} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      mode === "motor" ? "Current-loop turning board" : "Charged-particle orbit board",
      mode === "motor" ? (
        <svg viewBox="0 0 640 250" className="w-full">
          <rect x="24" y="24" width="592" height="202" rx="28" fill="#fefce8" />
          <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Opposite side-kicks on the loop create a turning couple</text>
          {Array.from({ length: 6 }).map((_, index) => (
            <path key={index} d={`M108 ${94 + index * 20}H532`} stroke="#f59e0b" strokeWidth="4" strokeDasharray="8 8" />
          ))}
          <rect x="250" y="86" width="140" height="92" rx="12" fill="none" stroke="#1d4ed8" strokeWidth="8" />
          <path d={reversed ? "M250 112L214 112" : "M250 112L286 112"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          <path d={reversed ? "M390 152L426 152" : "M390 152L354 152"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          <polygon points={reversed ? "204,112 226,100 226,124" : "296,112 274,100 274,124"} fill="#10b981" />
          <polygon points={reversed ? "436,152 414,140 414,164" : "344,152 366,140 366,164"} fill="#10b981" />
        </svg>
      ) : (
        <svg viewBox="0 0 640 250" className="w-full">
          <rect x="24" y="24" width="592" height="202" rx="28" fill="#eff6ff" />
          <text x="48" y="56" fill="#0f172a" fontSize="22" fontWeight="700">The same sideways force can bend a path into a circular orbit</text>
          <circle cx="320" cy="128" r={Math.max(40, Math.min(88, orbitRadius * 20))} stroke="#2563eb" strokeWidth="8" fill="none" />
          <circle cx="408" cy="128" r="14" fill="#f59e0b" />
          <path d={reversed ? "M408 128L408 88" : "M408 128L408 168"} stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          <polygon points={reversed ? "408,78 396,100 420,100" : "408,178 396,156 420,156"} fill="#10b981" />
          <text x="168" y="198" fill="#475569" fontSize="16">stronger field or bigger charge gives tighter bend | faster or heavier particle gives wider orbit</text>
        </svg>
      ),
      <>
        {metricCard(mode === "motor" ? "Side force per active side" : "Orbit radius", `${formatSimulationNumber(mode === "motor" ? sideForce : orbitRadius, 2)} ${mode === "motor" ? "N" : "units"}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard(mode === "motor" ? "Turning couple" : "Curvature sense", mode === "motor" ? `${formatSimulationNumber(couple, 2)} N m` : reversed ? "reversed" : "standard", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Shared idea", "perpendicular magnetic force", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Key comparison", mode === "motor" ? "two forces -> rotation" : "one force -> circular path", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Orbit story: magnetic force acts as centripetal force without being a forward push.", "Motor story: separated forces on opposite sides of a loop form a couple.", "Both stories come from the same perpendicular-force geometry."],
      "This final A8 explorer is the bridge lesson: the field does not need a new kind of physics to make motors and orbits. It is the same sideways magnetic force applied in two different geometries.",
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      Use the lesson board and the prompts above to compare the named quantities before you continue.
    </div>
  );
}
