import type { ReactNode } from "react";

type Props = {
  lessonKey: string;
  simMetricMeters: number;
  setSimMetricMeters: (value: number) => void;
  simVectorMagnitude: number;
  setSimVectorMagnitude: (value: number) => void;
  simVectorAngle: number;
  setSimVectorAngle: (value: number) => void;
};

type ParticleOption = {
  label: string;
  symbol: string;
  family: string;
  role: string;
  charge: string;
  slot: "radiation" | "matter" | "nucleus";
  color: string;
};

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

const particles: ParticleOption[] = [
  {
    label: "Photon",
    symbol: "gamma",
    family: "Radiation messenger",
    role: "Carries electromagnetic radiation.",
    charge: "0",
    slot: "radiation",
    color: "#38bdf8",
  },
  {
    label: "Electron",
    symbol: "e-",
    family: "Lepton",
    role: "Matter traveler outside the nucleus.",
    charge: "-1e",
    slot: "matter",
    color: "#818cf8",
  },
  {
    label: "Proton",
    symbol: "p+",
    family: "Nucleon",
    role: "Positive nucleus bundle inside the nucleus.",
    charge: "+1e",
    slot: "nucleus",
    color: "#f59e0b",
  },
  {
    label: "Neutron",
    symbol: "n0",
    family: "Nucleon",
    role: "Neutral nucleus bundle inside the nucleus.",
    charge: "0",
    slot: "nucleus",
    color: "#94a3b8",
  },
  {
    label: "Neutrino",
    symbol: "nu",
    family: "Lepton",
    role: "Matter traveler that rarely interacts.",
    charge: "0",
    slot: "matter",
    color: "#34d399",
  },
];

const slotOptions = [
  { key: "radiation" as const, label: "Radiation messengers", x: 56, y: 94 },
  { key: "matter" as const, label: "Matter travelers", x: 56, y: 154 },
  { key: "nucleus" as const, label: "Nucleus bundles", x: 56, y: 214 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sliderField(label: string, value: string, input: ReactNode): ReactNode {
  return (
    <label className="mt-4 block">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">{value}</span>
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

export default function A1SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
}: Props) {
  if (lessonKey !== "A1_L1") {
    return (
      <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
        This A1 lesson does not have a dedicated simulation panel yet.
      </div>
    );
  }

  const selectedParticle = particles[Math.round(clamp(simMetricMeters, 0, particles.length - 1))];
  const comparisonParticle = particles[Math.round(clamp(simVectorMagnitude, 0, particles.length - 1))];
  const selectedSlot = slotOptions[Math.round(clamp(simVectorAngle, 0, slotOptions.length - 1))];
  const slotMatch = selectedParticle.slot === selectedSlot.key;
  const sameFamily = selectedParticle.slot === comparisonParticle.slot;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Particle inventory controls</h4>
          {sliderField("Selected particle", selectedParticle.label, <input className="w-full" type="range" min="0" max={particles.length - 1} step="1" value={particles.indexOf(selectedParticle)} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
          {sliderField("Compare with", comparisonParticle.label, <input className="w-full" type="range" min="0" max={particles.length - 1} step="1" value={particles.indexOf(comparisonParticle)} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
          {sliderField("Board slot test", selectedSlot.label, <input className="w-full" type="range" min="0" max={slotOptions.length - 1} step="1" value={slotOptions.indexOf(selectedSlot)} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Particle-physics lens</h4>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Photons are radiation messengers, not matter travelers.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Leptons are matter travelers, while protons and neutrons belong in the nucleus bundle family.</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">A charge tag is the electric-charge label. It helps comparison, but family and role decide the category.</li>
          </ul>
        </div>
      </div>
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Inventory board</h4>
          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <svg viewBox="0 0 640 260" className="w-full">
              <rect x="24" y="24" width="592" height="212" rx="28" fill="#0f172a" />
              <text x="46" y="56" fill="#f8fafc" fontSize="22" fontWeight="700">Classify the particle before you tell its interaction story</text>
              {slotOptions.map((slot) => {
                const active = slot.key === selectedSlot.key;
                const occupants = [selectedParticle, comparisonParticle].filter(
                  (particle, index, all) =>
                    particle.slot === slot.key && all.findIndex((candidate) => candidate.label === particle.label) === index,
                );
                return (
                  <g key={slot.key}>
                    <rect x={slot.x} y={slot.y - 26} width="528" height="46" rx="18" fill={active ? "#1d4ed8" : "#1e293b"} stroke={active ? "#93c5fd" : "#334155"} strokeWidth="3" />
                    <text x={slot.x + 18} y={slot.y + 2} fill="#f8fafc" fontSize="20" fontWeight="700">{slot.label}</text>
                    {occupants.map((particle, index) => (
                      <g key={`${slot.key}-${particle.label}`} transform={`translate(${418 + index * 76}, ${slot.y - 3})`}>
                        <circle cx="0" cy="0" r="19" fill={particle.color} />
                        <text x="0" y="5" fill="#0f172a" fontSize="13" fontWeight="700" textAnchor="middle">{particle.symbol}</text>
                      </g>
                    ))}
                  </g>
                );
              })}
              <text x="46" y="224" fill="#cbd5e1" fontSize="18">Sorting by family and role keeps photons, leptons, and nucleons from being collapsed into one vague small-particle label.</text>
            </svg>
          </div>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {metricCard("Family", selectedParticle.family, "border-sky-200 bg-sky-50 text-sky-900")}
            {metricCard("Charge tag", selectedParticle.charge, "border-emerald-200 bg-emerald-50 text-emerald-900")}
            {metricCard("Correct slot", slotOptions.find((slot) => slot.key === selectedParticle.slot)?.label || selectedParticle.slot, "border-violet-200 bg-violet-50 text-violet-900")}
            {metricCard("Check", slotMatch ? "slot matches" : "move to the correct slot", slotMatch ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-900")}
          </div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
            {sameFamily
              ? `${selectedParticle.label} and ${comparisonParticle.label} belong in the same board family, but you should still name their separate roles and charge tags.`
              : `${selectedParticle.label} and ${comparisonParticle.label} separate into different board families, which is exactly what the inventory check is supposed to show.`}
          </div>
        </div>
      </div>
    </div>
  );
}
