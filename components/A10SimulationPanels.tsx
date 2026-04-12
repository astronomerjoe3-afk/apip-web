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

export default function A10SimulationPanels({
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
  if (lessonKey === "A10_L1") {
    const nuclearCharge = clamp(simDensityMass, 20, 92);
    const alphaEnergy = clamp(simVectorMagnitude, 2, 12);
    const impactParameter = clamp(simMetricMeters, 0.05, 1.2);
    const closePassShare = clamp(simBias, 1, 18);
    const foilThickness = clamp(simFluidDensity, 0.4, 1.6);
    const deflectionAngle = clamp((nuclearCharge * 7) / (alphaEnergy * (impactParameter + 0.18)), 3, 175);
    const largeAngleShare = clamp(closePassShare * foilThickness * (8 / alphaEnergy) * (nuclearCharge / 92), 0.2, 18);
    const smallAngleShare = clamp(largeAngleShare * 2.4, 1, 32);
    const straightShare = clamp(100 - largeAngleShare - smallAngleShare, 50, 99);

    return renderPanel(
      "Rutherford scattering",
      <>
        {sliderField("Nuclear charge", `${formatSimulationNumber(nuclearCharge, 0)} protons`, <input className="w-full" type="range" min="20" max="92" step="1" value={nuclearCharge} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Alpha energy", `${formatSimulationNumber(alphaEnergy, 1)} MeV`, <input className="w-full" type="range" min="2" max="12" step="0.2" value={alphaEnergy} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Impact parameter", `${formatSimulationNumber(impactParameter, 2)} fm`, <input className="w-full" type="range" min="0.05" max="1.2" step="0.02" value={impactParameter} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Close-pass share", `${formatSimulationNumber(closePassShare, 0)} %`, <input className="w-full" type="range" min="1" max="18" step="1" value={closePassShare} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Foil crowding", `${formatSimulationNumber(foilThickness, 2)} relative`, <input className="w-full" type="range" min="0.4" max="1.6" step="0.05" value={foilThickness} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Scattering board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Most alpha particles miss the tiny nucleus; rare close passes create large deflections</text>
        <line x1="88" y1="82" x2="552" y2="82" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="88" y1="124" x2="552" y2="124" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="88" y1="166" x2="552" y2="166" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 8" />
        <circle cx="354" cy="124" r="18" fill="#ef4444" />
        <text x="344" y="129" fill="#fff" fontSize="14" fontWeight="700">+Z</text>
        <path d="M88 82H300" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <path d={`M88 124H${330 - impactParameter * 20}`} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <path d={`M${330 - impactParameter * 20} 124 Q360 124 ${410 + deflectionAngle * 0.3} ${124 - deflectionAngle * 0.35}`} stroke="#0ea5e9" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M88 166H286" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <path d={`M286 166 Q330 166 300 ${190 + deflectionAngle * 0.15}`} stroke="#7c3aed" strokeWidth="8" fill="none" strokeLinecap="round" />
        <text x="92" y="206" fill="#475569" fontSize="16">straight-through paths dominate because the atom is mostly empty space</text>
      </svg>,
      <>
        {metricCard("Model deflection", `${formatSimulationNumber(deflectionAngle, 0)} deg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Straight through", `${formatSimulationNumber(straightShare, 1)} %`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Small-angle spread", `${formatSimulationNumber(smallAngleShare, 1)} %`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Large-angle events", `${formatSimulationNumber(largeAngleShare, 1)} %`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Large deflection needs a close encounter with concentrated positive charge.",
        "Most particles pass through because the atom is mostly empty space.",
        "Increasing alpha energy weakens the same repulsive encounter and reduces deflection.",
      ],
      "This panel deliberately ties the dramatic rebound events back to their rarity. A10_L1 should always read the whole scattering pattern, not one single path.",
    );
  }

  if (lessonKey === "A10_L2") {
    const particleMode = clamp(Math.round(simBias), 0, 2);
    const fieldReversed = clamp(Math.round(simSpread), 0, 1) === 1;
    const voltageKV = clamp(simVectorMagnitude, 5, 200);
    const fieldStrength = clamp(simMetricMeters, 0.2, 1.5);
    const typeMap = [
      { label: "electron", massKg: 9.11e-31, chargeUnits: -1, color: "#8b5cf6" },
      { label: "proton", massKg: 1.67e-27, chargeUnits: 1, color: "#ef4444" },
      { label: "alpha", massKg: 6.64e-27, chargeUnits: 2, color: "#f59e0b" },
    ] as const;
    const particle = typeMap[particleMode];
    const chargeC = particle.chargeUnits * 1.602e-19;
    const voltageV = voltageKV * 1000;
    const kineticEnergyKeV = Math.abs(particle.chargeUnits) * voltageKV;
    const speed = Math.sqrt((2 * Math.abs(chargeC) * voltageV) / particle.massKg);
    const radius = (particle.massKg * speed) / (Math.abs(chargeC) * fieldStrength);
    const bendSense = (particle.chargeUnits > 0) === fieldReversed ? "clockwise" : "anticlockwise";

    return renderPanel(
      "Accelerator and detector",
      <>
        {sliderField("Particle type", particle.label, <input className="w-full" type="range" min="0" max="2" step="1" value={particleMode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Accelerating voltage", `${formatSimulationNumber(voltageKV, 0)} kV`, <input className="w-full" type="range" min="5" max="200" step="5" value={voltageKV} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Magnetic field", `${formatSimulationNumber(fieldStrength, 2)} T`, <input className="w-full" type="range" min="0.2" max="1.5" step="0.05" value={fieldStrength} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Field orientation", fieldReversed ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={fieldReversed ? 1 : 0} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Beamline board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eef2ff" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Voltage prepares the beam; the magnetic detector bend reveals charge sign and momentum-to-charge ratio</text>
        <rect x="92" y="88" width="126" height="72" rx="20" fill="#dbeafe" stroke="#2563eb" strokeWidth="5" />
        <text x="120" y="130" fill="#1d4ed8" fontSize="18" fontWeight="700">accelerator gap</text>
        <path d="M220 124H312" stroke={particle.color} strokeWidth="8" strokeLinecap="round" />
        <path d={bendSense === "anticlockwise" ? "M312 124 Q402 124 418 70" : "M312 124 Q402 124 418 178"} stroke={particle.color} strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="312" cy="124" r="12" fill={particle.color} />
        <rect x="446" y="72" width="110" height="104" rx="22" fill="#f8fafc" stroke="#64748b" strokeWidth="4" />
        <text x="470" y="106" fill="#334155" fontSize="16" fontWeight="700">tracker</text>
        <text x="466" y="136" fill="#334155" fontSize="15">curvature readout</text>
        <text x="92" y="204" fill="#475569" fontSize="16">accelerator and detector are different jobs in the same experiment</text>
      </svg>,
      <>
        {metricCard("Beam energy", `${formatSimulationNumber(kineticEnergyKeV, 0)} keV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Speed", `${formatSimulationNumber(speed / 1e6, 1)} x10^6 m/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Track radius", `${formatSimulationNumber(radius, 2)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Bend sense", bendSense, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Use E_k = qV to connect the accelerator setting to beam energy.",
        "Use r = mv / qB to connect the detector bend to momentum-to-charge ratio.",
        "Reversing charge sign or field direction flips the bend sense.",
      ],
      "This is a school-model bridge, so the readout is qualitative first: accelerator gives energy, detector reads curvature. The numbers are there to support that reasoning rather than replace it.",
    );
  }

  if (lessonKey === "A10_L3") {
    const mode = clamp(Math.round(simBias), 0, 2);
    const initialN = clamp(simDensityMass, 200, 3200);
    const halfLifeHours = clamp(simVectorMagnitude, 1, 24);
    const elapsedHours = clamp(simMetricMeters, 0, 72);
    const detectionEfficiency = clamp(simFluidDensity, 0.4, 1.0);
    const examples = [
      { label: "alpha: Po-210 -> Pb-206", parent: "Po-210", daughter: "Pb-206", emitted: "alpha", delta: "A -4, Z -2", color: "#ef4444" },
      { label: "beta-minus: C-14 -> N-14", parent: "C-14", daughter: "N-14", emitted: "beta-minus", delta: "A same, Z +1", color: "#2563eb" },
      { label: "gamma: Co-60* -> Co-60", parent: "Co-60*", daughter: "Co-60", emitted: "gamma", delta: "A same, Z same", color: "#f59e0b" },
    ] as const;
    const example = examples[mode];
    const remainingFraction = Math.pow(0.5, elapsedHours / halfLifeHours);
    const remainingN = initialN * remainingFraction;
    const lambda = Math.log(2) / (halfLifeHours * 3600);
    const activity = lambda * remainingN;
    const detectedRate = activity * detectionEfficiency;

    return renderPanel(
      "Decay and activity",
      <>
        {sliderField("Decay example", example.label, <input className="w-full" type="range" min="0" max="2" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Initial nuclei", `${formatSimulationNumber(initialN, 0)} nuclei`, <input className="w-full" type="range" min="200" max="3200" step="100" value={initialN} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Half-life", `${formatSimulationNumber(halfLifeHours, 1)} h`, <input className="w-full" type="range" min="1" max="24" step="0.5" value={halfLifeHours} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Elapsed time", `${formatSimulationNumber(elapsedHours, 1)} h`, <input className="w-full" type="range" min="0" max="72" step="1" value={elapsedHours} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Detector efficiency", `${formatSimulationNumber(detectionEfficiency * 100, 0)} %`, <input className="w-full" type="range" min="0.4" max="1.0" step="0.05" value={detectionEfficiency} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Decay ledger",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#f8fafc" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Decay equations balance the nuclear bookkeeping, while activity tracks how fast undecayed nuclei disappear</text>
        <rect x="88" y="88" width="124" height="74" rx="18" fill="#e2e8f0" stroke="#334155" strokeWidth="4" />
        <rect x="428" y="88" width="124" height="74" rx="18" fill="#dbeafe" stroke={example.color} strokeWidth="4" />
        <text x="122" y="130" fill="#0f172a" fontSize="20" fontWeight="700">{example.parent}</text>
        <text x="456" y="130" fill={example.color} fontSize="20" fontWeight="700">{example.daughter}</text>
        <path d="M220 124H410" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="422,124 404,114 404,134" fill="#0f172a" />
        <text x="262" y="102" fill="#475569" fontSize="16">{example.emitted}</text>
        <text x="256" y="154" fill="#475569" fontSize="16">{example.delta}</text>
        <rect x="88" y="190" width="464" height="18" rx="9" fill="#e2e8f0" />
        <rect x="88" y="190" width={464 * remainingFraction} height="18" rx="9" fill={example.color} />
      </svg>,
      <>
        {metricCard("Remaining fraction", `${formatSimulationNumber(remainingFraction, 3)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Undecayed nuclei", `${formatSimulationNumber(remainingN, 0)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Activity", `${formatSimulationNumber(activity, 4)} Bq`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Detected count rate", `${formatSimulationNumber(detectedRate, 4)} counts/s`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Balance A and Z in the nuclear equation before you talk about count rate.",
        "Half-life describes repeated halving for a large sample, not the schedule of one nucleus.",
        "Activity falls because A = lambda N and the remaining N keeps falling.",
      ],
      "A10_L3 should not collapse into one decay slogan. This board keeps the nuclide change, the sample halving, and the activity equation visible at the same time.",
    );
  }

  if (lessonKey === "A10_L4") {
    const protons = clamp(simDensityMass, 2, 30);
    const neutrons = clamp(simDensityVolume, 2, 40);
    const massDefectU = clamp(simVectorMagnitude, 0.005, 0.25);
    const r0 = clamp(simMetricMeters, 1.1, 1.4);
    const A = protons + neutrons;
    const totalBindingEnergy = massDefectU * 931.5;
    const bindingPerNucleon = totalBindingEnergy / A;
    const radiusFm = r0 * Math.cbrt(A);
    const stabilityBand =
      bindingPerNucleon >= 8 ? "tightly bound" : bindingPerNucleon >= 6 ? "moderately bound" : "loosely bound";

    return renderPanel(
      "Binding-energy bridge",
      <>
        {sliderField("Proton number Z", `${formatSimulationNumber(protons, 0)}`, <input className="w-full" type="range" min="2" max="30" step="1" value={protons} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Neutron number N", `${formatSimulationNumber(neutrons, 0)}`, <input className="w-full" type="range" min="2" max="40" step="1" value={neutrons} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Mass defect", `${formatSimulationNumber(massDefectU, 3)} u`, <input className="w-full" type="range" min="0.005" max="0.25" step="0.005" value={massDefectU} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Radius constant r0", `${formatSimulationNumber(r0, 2)} fm`, <input className="w-full" type="range" min="1.1" max="1.4" step="0.01" value={r0} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Binding board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eef2ff" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Bound nuclei are lighter than the separated nucleons because formation released energy</text>
        <g transform="translate(150 128)">
          <circle cx="-34" cy="-18" r="14" fill="#ef4444" />
          <circle cx="-4" cy="8" r="14" fill="#ef4444" />
          <circle cx="28" cy="-8" r="14" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
          <circle cx="56" cy="18" r="14" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
          <text x="-66" y="54" fill="#475569" fontSize="16">separated nucleons</text>
        </g>
        <path d="M260 124H390" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="402,124 384,114 384,134" fill="#0f172a" />
        <circle cx="486" cy="124" r={Math.max(28, Math.min(48, radiusFm * 8))} fill="#dbeafe" stroke="#2563eb" strokeWidth="5" />
        <text x="448" y="188" fill="#475569" fontSize="16">one bound nucleus</text>
        <text x="278" y="102" fill="#475569" fontSize="16">energy released = mass defect x c^2</text>
      </svg>,
      <>
        {metricCard("Mass number A", `${formatSimulationNumber(A, 0)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Total binding energy", `${formatSimulationNumber(totalBindingEnergy, 1)} MeV`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Binding per nucleon", `${formatSimulationNumber(bindingPerNucleon, 2)} MeV`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Model radius", `${formatSimulationNumber(radiusFm, 2)} fm`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Mass defect is separated mass minus bound-nucleus mass.",
        "Binding energy per nucleon is the better stability comparison across different A.",
        "R proportional to A^(1/3) means volume rises roughly with nucleon count.",
      ],
      `This board keeps total binding and per-nucleon binding separate. The current setup reads as ${stabilityBand}, but the main lesson is why that conclusion comes from the averaged binding, not from total mass alone.`,
    );
  }

  if (lessonKey === "A10_L5") {
    const powerMW = clamp(simDensityMass, 100, 1500);
    const energyPerFissionMeV = clamp(simVectorMagnitude, 180, 220);
    const rodInsertion = clamp(simBias, 0, 100);
    const moderatorSetting = clamp(simFluidDensity, 0.6, 1.0);
    const energyPerFissionJ = energyPerFissionMeV * 1.602e-13;
    const powerW = powerMW * 1e6;
    const fissionRate = powerW / energyPerFissionJ;
    const k = clamp(0.8 + moderatorSetting * 0.45 - (rodInsertion / 100) * 0.45, 0.6, 1.25);
    const regime = k > 1.02 ? "supercritical" : k < 0.98 ? "subcritical" : "critical";

    return renderPanel(
      "Reactor control",
      <>
        {sliderField("Thermal power", `${formatSimulationNumber(powerMW, 0)} MW`, <input className="w-full" type="range" min="100" max="1500" step="25" value={powerMW} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Energy per fission", `${formatSimulationNumber(energyPerFissionMeV, 0)} MeV`, <input className="w-full" type="range" min="180" max="220" step="1" value={energyPerFissionMeV} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Control-rod insertion", `${formatSimulationNumber(rodInsertion, 0)} %`, <input className="w-full" type="range" min="0" max="100" step="5" value={rodInsertion} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Moderator effectiveness", `${formatSimulationNumber(moderatorSetting * 100, 0)} %`, <input className="w-full" type="range" min="0.6" max="1.0" step="0.02" value={moderatorSetting} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Chain-reaction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#fefce8" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Fission releases energy and neutrons; reactor control keeps neutron multiplication near one</text>
        <circle cx="128" cy="126" r="28" fill="#84cc16" />
        <text x="111" y="132" fill="#0f172a" fontSize="14" fontWeight="700">U-235</text>
        <path d="M156 126H234" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="246,126 228,116 228,136" fill="#0f172a" />
        <circle cx="306" cy="104" r="20" fill="#f59e0b" />
        <circle cx="334" cy="148" r="20" fill="#38bdf8" />
        <circle cx="396" cy="84" r="10" fill="#64748b" />
        <circle cx="420" cy="126" r="10" fill="#64748b" />
        <circle cx="396" cy="168" r="10" fill="#64748b" />
        <rect x="470" y="74" width="76" height="104" rx="18" fill="#475569" opacity={rodInsertion / 100} />
        <text x="462" y="196" fill="#475569" fontSize="16">more rod insertion {"->"} more neutron absorption</text>
      </svg>,
      <>
        {metricCard("Fission rate", `${formatSimulationNumber(fissionRate / 1e19, 2)} x10^19 s^-1`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Multiplication factor", `${formatSimulationNumber(k, 2)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Reactor state", regime, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Energy source", "mass defect", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Moderator and control rods do different jobs: speed versus absorption.",
        "Critical means about one follow-on fission per previous fission on average.",
        "Power fixes the required fission rate once the energy per fission is known.",
      ],
      "A10_L5 should not flatten into 'reactor makes energy.' The board keeps event energy, neutron multiplication, and control hardware on the same page.",
    );
  }

  if (lessonKey === "A10_L6") {
    const mode = clamp(Math.round(simBias), 0, 2);
    const temperatureMK = clamp(simVectorMagnitude, 20, 250);
    const confinement = clamp(simMetricMeters, 0.3, 1.0);
    const reactions = [
      { label: "D-T", deltaM: 0.0189, barrier: 80, products: "He-4 + n", color: "#ef4444" },
      { label: "D-D", deltaM: 0.0033, barrier: 140, products: "He-3 + n", color: "#2563eb" },
      { label: "He-3 + D", deltaM: 0.0190, barrier: 180, products: "He-4 + p", color: "#f59e0b" },
    ] as const;
    const reaction = reactions[mode];
    const energyMeV = reaction.deltaM * 931.5;
    const ignitionReady = temperatureMK >= reaction.barrier && confinement >= 0.65;
    const comparisonTag = energyMeV > 10 ? "strong energy release" : "modest energy release";

    return renderPanel(
      "Fusion comparison",
      <>
        {sliderField("Reaction family", reaction.label, <input className="w-full" type="range" min="0" max="2" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Plasma temperature", `${formatSimulationNumber(temperatureMK, 0)} million K`, <input className="w-full" type="range" min="20" max="250" step="5" value={temperatureMK} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Confinement quality", `${formatSimulationNumber(confinement, 2)} relative`, <input className="w-full" type="range" min="0.3" max="1.0" step="0.02" value={confinement} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Fusion board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="24" width="592" height="202" rx="28" fill="#eef2ff" />
        <text x="44" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Fusion joins light nuclei, but high temperature and confinement are needed before the strong force can win</text>
        <circle cx="166" cy="128" r="24" fill={reaction.color} />
        <circle cx="234" cy="128" r="24" fill={reaction.color} opacity="0.75" />
        <path d="M258 128H360" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="372,128 354,118 354,138" fill="#0f172a" />
        <circle cx="450" cy="124" r="34" fill="#dbeafe" stroke="#2563eb" strokeWidth="5" />
        <circle cx="518" cy="152" r="14" fill="#94a3b8" />
        <text x="130" y="188" fill="#475569" fontSize="16">Coulomb repulsion first, strong-force binding only at very short range</text>
        <text x="410" y="194" fill="#475569" fontSize="16">{reaction.products}</text>
      </svg>,
      <>
        {metricCard("Reaction products", reaction.products, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Energy released", `${formatSimulationNumber(energyMeV, 2)} MeV`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Barrier guide", `${formatSimulationNumber(reaction.barrier, 0)} million K`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Condition check", ignitionReady ? "fusion conditions plausible" : "more temperature or confinement needed", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Fusion releases energy for light nuclei because the products are more tightly bound.",
        "High temperature is needed because positively charged nuclei repel before they get close enough to fuse.",
        "Confinement matters because hot plasma must stay together long enough for collisions to happen.",
      ],
      `This last A10 board makes the comparison explicit: ${comparisonTag}, but only if the plasma conditions are good enough for nuclei to reach strong-force range. That is why fusion physics and fusion engineering are both part of the story.`,
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      Use the lesson board and the prompts above to compare the named quantities before you continue.
    </div>
  );
}
