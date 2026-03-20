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

export default function M6SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
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

  if (lessonKey === "M6_L1") {
    const transfer = clamp(simVectorMagnitude, 200, 5000);
    const massA = clamp(simDensityMass, 1, 8);
    const massB = clamp(simDensityVolume, 1, 8);
    const cost = clamp(simMetricMeters, 100, 900);
    const riseA = transfer / (massA * cost);
    const riseB = transfer / (massB * cost);
    return render(
      "Warmth Level lab",
      <>
        {sliderField("Transfer Energy", `${formatSimulationNumber(transfer, 0)} J`, <input className="w-full" type="range" min="200" max="5000" step="100" value={transfer} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Block A mass", `${formatSimulationNumber(massA, 1)} kg`, <input className="w-full" type="range" min="1" max="8" step="0.5" value={massA} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Block B mass", `${formatSimulationNumber(massB, 1)} kg`, <input className="w-full" type="range" min="1" max="8" step="0.5" value={massB} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Shared Level Cost", `${formatSimulationNumber(cost, 0)} J/kg degree C`, <input className="w-full" type="range" min="100" max="900" step="50" value={cost} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Warmth Level board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="26" y="28" width="250" height="182" rx="24" fill="#dbeafe" />
        <rect x="364" y="28" width="250" height="182" rx="24" fill="#dcfce7" />
        <text x="60" y="58" fill="#1d4ed8" fontSize="20" fontWeight="700">Block A</text>
        <text x="398" y="58" fill="#166534" fontSize="20" fontWeight="700">Block B</text>
        <text x="60" y="96" fill="#0f172a" fontSize="16">Transfer: {formatSimulationNumber(transfer, 0)} J</text>
        <text x="60" y="126" fill="#0f172a" fontSize="16">Mass: {formatSimulationNumber(massA, 1)} kg</text>
        <text x="60" y="156" fill="#0f172a" fontSize="16">Rise: {formatSimulationNumber(riseA, 2)} degree C</text>
        <text x="398" y="96" fill="#0f172a" fontSize="16">Transfer: {formatSimulationNumber(transfer, 0)} J</text>
        <text x="398" y="126" fill="#0f172a" fontSize="16">Mass: {formatSimulationNumber(massB, 1)} kg</text>
        <text x="398" y="156" fill="#0f172a" fontSize="16">Rise: {formatSimulationNumber(riseB, 2)} degree C</text>
        <text x="54" y="198" fill="#475569" fontSize="15">Same payment, different rise: the mass still matters.</text>
      </svg>,
      <>
        {metricCard("Warmth Level rise A", `${formatSimulationNumber(riseA, 2)} degree C`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Warmth Level rise B", `${formatSimulationNumber(riseB, 2)} degree C`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Forge Ledger", `${formatSimulationNumber(transfer, 0)} J each`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Level Cost", `${formatSimulationNumber(cost, 0)} J/kg degree C`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Temperature is the current reading, not the name of the energy transfer.",
        "The ledger can match while the temperature rises differ.",
        "Mass and Level Cost still control the response.",
      ],
      "This board keeps the warm-level reading separate from the energy payment so the user can see why equal transfer does not force equal temperature rise.",
    );
  }

  if (lessonKey === "M6_L2") {
    const mass = clamp(simDensityMass, 0.5, 8);
    const cost = clamp(simMetricMeters, 100, 900);
    const deltaT = clamp(simVectorMagnitude, 1, 40);
    const q = mass * cost * deltaT;
    return render(
      "Level Cost calculator",
      <>
        {sliderField("Build Size", `${formatSimulationNumber(mass, 1)} kg`, <input className="w-full" type="range" min="0.5" max="8" step="0.5" value={mass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Level Cost", `${formatSimulationNumber(cost, 0)} J/kg degree C`, <input className="w-full" type="range" min="100" max="900" step="50" value={cost} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Target rise", `${formatSimulationNumber(deltaT, 0)} degree C`, <input className="w-full" type="range" min="1" max="40" step="1" value={deltaT} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Heating bill board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="30" width="584" height="170" rx="26" fill="#eff6ff" />
        <text x="54" y="64" fill="#0f172a" fontSize="24" fontWeight="700">Q = m c delta T</text>
        <text x="54" y="102" fill="#1d4ed8" fontSize="18">m = {formatSimulationNumber(mass, 1)} kg</text>
        <text x="54" y="132" fill="#166534" fontSize="18">c = {formatSimulationNumber(cost, 0)} J/kg degree C</text>
        <text x="54" y="162" fill="#7c3aed" fontSize="18">delta T = {formatSimulationNumber(deltaT, 0)} degree C</text>
        <rect x="360" y="88" width="208" height="60" rx="20" fill="#0f172a" />
        <text x="390" y="126" fill="#fff" fontSize="22" fontWeight="700">Q = {formatSimulationNumber(q, 0)} J</text>
        <text x="54" y="194" fill="#475569" fontSize="15">All three multipliers stay visible in the same bill.</text>
      </svg>,
      <>
        {metricCard("Mass", `${formatSimulationNumber(mass, 1)} kg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Level Cost", `${formatSimulationNumber(cost, 0)} J/kg degree C`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("delta T", `${formatSimulationNumber(deltaT, 0)} degree C`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Forge Ledger", `${formatSimulationNumber(q, 0)} J`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Specific heat capacity is energy per kilogram per degree.",
        "More mass or a larger target rise pushes the bill upward.",
        "Rearranging the formula does not change the physical meaning.",
      ],
      "This board keeps the energy bill visible as one product so users can see exactly which multiplier is growing the total.",
    );
  }

  if (lessonKey === "M6_L3") {
    const mass = clamp(simDensityMass, 0.5, 4);
    const latent = clamp(simMetricMeters, 50000, 400000);
    const paid = clamp(simVectorMagnitude, 0, mass * latent);
    const progress = paid / (mass * latent);
    return render(
      "Form Gate lab",
      <>
        {sliderField("Build Size", `${formatSimulationNumber(mass, 1)} kg`, <input className="w-full" type="range" min="0.5" max="4" step="0.5" value={mass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Morph Fee", `${formatSimulationNumber(latent, 0)} J/kg`, <input className="w-full" type="range" min="50000" max="400000" step="10000" value={latent} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Energy paid at gate", `${formatSimulationNumber(paid, 0)} J`, <input className="w-full" type="range" min="0" max={mass * latent} step="1000" value={paid} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Form Gate board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="32" width="580" height="170" rx="26" fill="#f8fafc" />
        <text x="58" y="66" fill="#0f172a" fontSize="22" fontWeight="700">Warmth Level plateau with rising Morph Fee</text>
        <line x1="78" y1="154" x2="558" y2="154" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
        <line x1="78" y1="154" x2="240" y2="108" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
        <line x1="240" y1="108" x2="500" y2="108" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" />
        <rect x="100" y="176" width={Math.min(420, progress * 420)} height="18" rx="9" fill="#22c55e" />
        <text x="86" y="98" fill="#1d4ed8" fontSize="16">Warm-up stage</text>
        <text x="312" y="98" fill="#7c3aed" fontSize="16">Gate stage</text>
      </svg>,
      <>
        {metricCard("Paid so far", `${formatSimulationNumber(paid, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Total gate bill", `${formatSimulationNumber(mass * latent, 0)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Morph progress", `${formatSimulationNumber(progress * 100, 0)}%`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Warmth Level", "flat at gate", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "A plateau can still represent continuing energy transfer.",
        "Latent heat is a per-kilogram state-change fee.",
        "Choose Q = m L only for the gate stage itself.",
      ],
      "The board makes the constant-temperature stage visible as a real energy-payment stage instead of a confusing pause.",
    );
  }

  if (lessonKey === "M6_L4") {
    const conductivity = clamp(simMetricMeters, 1, 10);
    const deltaT = clamp(simVectorMagnitude, 10, 120);
    const pathQuality = clamp(simBias, 0, 1);
    const relay = conductivity * deltaT * (0.35 + pathQuality * 0.65);
    return render(
      "Touch Relay lab",
      <>
        {sliderField("Material relay strength", `${formatSimulationNumber(conductivity, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={conductivity} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Temperature difference", `${formatSimulationNumber(deltaT, 0)} degree C`, <input className="w-full" type="range" min="10" max="120" step="5" value={deltaT} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Path status", pathQuality > 0.5 ? "continuous" : "broken", <input className="w-full" type="range" min="0" max="1" step="1" value={pathQuality > 0.5 ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Relay chain board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="32" width="580" height="176" rx="26" fill="#eef2ff" />
        <text x="54" y="62" fill="#0f172a" fontSize="22" fontWeight="700">Hot end to cool end through contact</text>
        {[0, 1, 2, 3, 4].map((step) => (
          <rect key={step} x={80 + step * 96} y="112" width="56" height="34" rx="14" fill={step * 22 < relay ? "#3b82f6" : "#cbd5e1"} />
        ))}
        <text x="84" y="100" fill="#ef4444" fontSize="16">hot</text>
        <text x="510" y="100" fill="#0ea5e9" fontSize="16">cool</text>
        {!pathQuality ? <rect x="300" y="110" width="36" height="40" rx="12" fill="#f8fafc" stroke="#ef4444" strokeWidth="4" /> : null}
      </svg>,
      <>
        {metricCard("Relay rate", formatSimulationNumber(relay, 0), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Conductivity", formatSimulationNumber(conductivity, 0), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("delta T", `${formatSimulationNumber(deltaT, 0)} degree C`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Path", pathQuality ? "contact intact" : "gap inserted", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Conduction needs a contact path.",
        "Metals conduct well because electrons help the relay.",
        "The solid stays in place while the energy passes through it.",
      ],
      "This board makes conduction look like a contact relay rather than a flowing-solid story, which helps block the common bulk-motion misconception.",
    );
  }

  if (lessonKey === "M6_L5") {
    const heatContrast = clamp(simVectorMagnitude, 1, 10);
    const fluidMobility = clamp(simMetricMeters, 1, 10);
    const loopStrength = heatContrast * fluidMobility;
    return render(
      "Carrier Loop lab",
      <>
        {sliderField("Warm-cool contrast", `${formatSimulationNumber(heatContrast, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={heatContrast} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Fluid mobility", `${formatSimulationNumber(fluidMobility, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={fluidMobility} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Convection loop board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="116" y="34" width="408" height="176" rx="28" fill="#ecfeff" stroke="#67e8f9" strokeWidth="4" />
        <path d="M240 172 C196 132 196 90 248 70" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
        <path d="M392 74 C444 92 448 142 404 176" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <path d="M248 70 H392" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
        <path d="M404 176 H240" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" />
        <text x="190" y="198" fill="#ef4444" fontSize="15">warm parcel rises</text>
        <text x="352" y="198" fill="#2563eb" fontSize="15">cool parcel sinks</text>
      </svg>,
      <>
        {metricCard("Loop strength", formatSimulationNumber(loopStrength, 0), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Fluid mobility", formatSimulationNumber(fluidMobility, 0), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Warm parcel", "less dense", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Cool parcel", "returns downward", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Convection is a moving-fluid route, not a floating heat substance.",
        "Warm fluid rises because it becomes less dense.",
        "Cool fluid completes the loop by returning downward or moving in.",
      ],
      "The board keeps the entire circulation visible so the explanation naturally becomes a loop instead of collapsing into the weak phrase 'heat rises'.",
    );
  }

  if (lessonKey === "M6_L6") {
    const beam = clamp(simVectorMagnitude, 100, 5000);
    const absorb = clamp(simMetricMeters, 20, 100);
    const warmStage = clamp(simDensityMass, 1000, 50000);
    const gateStage = clamp(simDensityVolume, 10000, 300000);
    const absorbed = (beam * absorb) / 100;
    const total = warmStage + gateStage;
    return render(
      "Glow Cast and Ledger lab",
      <>
        {sliderField("Beam energy", `${formatSimulationNumber(beam, 0)} J`, <input className="w-full" type="range" min="100" max="5000" step="100" value={beam} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Surface absorption", `${formatSimulationNumber(absorb, 0)}%`, <input className="w-full" type="range" min="20" max="100" step="5" value={absorb} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Warm-up stage", `${formatSimulationNumber(warmStage, 0)} J`, <input className="w-full" type="range" min="1000" max="50000" step="1000" value={warmStage} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Gate stage", `${formatSimulationNumber(gateStage, 0)} J`, <input className="w-full" type="range" min="10000" max="300000" step="5000" value={gateStage} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Beam and ledger board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="56" y="78" width="84" height="84" rx="22" fill="#0f172a" />
        <rect x="488" y="78" width="84" height="84" rx="22" fill="#334155" />
        <path d="M156 120 H472" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
        <text x="226" y="108" fill="#f59e0b" fontSize="18">vacuum gap</text>
        <rect x="194" y="178" width={Math.min(240, warmStage / 200)} height="18" rx="9" fill="#3b82f6" />
        <rect x="194" y="206" width={Math.min(240, gateStage / 2000)} height="18" rx="9" fill="#22c55e" />
        <text x="42" y="208" fill="#1d4ed8" fontSize="14">warm-up</text>
        <text x="46" y="232" fill="#166534" fontSize="14">gate</text>
      </svg>,
      <>
        {metricCard("Absorbed Glow Cast", `${formatSimulationNumber(absorbed, 0)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Surface finish", absorb >= 70 ? "dark and dull" : "shiny", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Warm-up + gate", `${formatSimulationNumber(total, 0)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Route across gap", "radiation only", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Radiation is the route that crosses the vacuum gap.",
        "Dark dull surfaces absorb more of the beam than shiny surfaces.",
        "Complex missions are solved by adding the separate stage bills.",
      ],
      "This capstone board keeps route choice and stage bookkeeping in one view: first pick radiation for the gap, then total the warm-up and gate stages separately.",
    );
  }

  return null;
}
