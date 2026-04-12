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

const panelClass = "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function slider(label: string, value: string, input: ReactNode) {
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

function metric(title: string, value: string, tone: string) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function frame(title: string, controls: ReactNode, board: ReactNode, metrics: ReactNode, bullets: string[], note: string) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
          {controls}
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Quantum lens</h4>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700">
            {bullets.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Explorer board</h4>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">{board}</div>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{metrics}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );
}

export default function A2SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simDensityMass,
  setSimDensityMass,
  simFluidDensity,
  setSimFluidDensity,
  simBias,
  setSimBias,
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A2_L1") {
    const photon = clamp(simMetricMeters, 0, 9);
    const gap1 = clamp(simVectorMagnitude, 1, 5);
    const gap2 = Math.max(gap1 + 1, clamp(simVectorAngle, 2, 8));
    const outcome = Math.abs(photon - gap1) < 0.05 ? "first excited" : Math.abs(photon - gap2) < 0.05 ? "second excited" : "no jump";
    return frame(
      "Energy-ladder lab",
      <>
        {slider("Photon packet", `${formatSimulationNumber(photon, 1)} eV`, <input className="w-full" type="range" min="0" max="9" step="0.1" value={photon} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {slider("First gap", `${formatSimulationNumber(gap1, 1)} eV`, <input className="w-full" type="range" min="1" max="5" step="0.1" value={gap1} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {slider("Second gap", `${formatSimulationNumber(gap2, 1)} eV`, <input className="w-full" type="range" min="2" max="8" step="0.1" value={gap2} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl bg-slate-900/95 p-5 text-white">
          <div className="h-2 w-40 rounded-full bg-white/80" />
          <div className="h-2 w-52 rounded-full bg-blue-400" />
          <div className="h-2 w-64 rounded-full bg-violet-400" />
          <div className="text-sm text-slate-200">Packet: {formatSimulationNumber(photon, 1)} eV to {outcome}</div>
        </div>
        <div className="text-sm text-slate-700">Exact packet-gap matching causes the jump. A nearly-correct packet still leaves the electron on the same rung.</div>
      </div>,
      <>
        {metric("Packet", `${formatSimulationNumber(photon, 1)} eV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metric("Gap 1", `${formatSimulationNumber(gap1, 1)} eV`, "border-blue-200 bg-blue-50 text-blue-900")}
        {metric("Gap 2", `${formatSimulationNumber(gap2, 1)} eV`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metric("Outcome", outcome, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Allowed levels are discrete.", "Partial jumps are not allowed states.", "The ground state stays visible as the reference rung."],
      "Try one packet that misses the gap and one that matches it exactly before deciding whether the atom changed level.",
    );
  }

  if (lessonKey === "A2_L2") {
    const emission = Math.round(clamp(simBias, 0, 1)) === 0;
    const atomA = Math.round(clamp(simSpread, 0, 1)) === 0;
    const lines = atomA ? [1.9, 2.6, 3.1] : [2.2, 2.9, 3.8];
    const selected = Math.round(clamp(simMetricMeters, 0, 2));
    const wavelength = 1240 / lines[selected];
    return frame(
      "Spectral-barcode lab",
      <>
        {slider("View mode", emission ? "emission" : "absorption", <input className="w-full" type="range" min="0" max="1" step="1" value={emission ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {slider("Atom pattern", atomA ? "atom A" : "atom B", <input className="w-full" type="range" min="0" max="1" step="1" value={atomA ? 0 : 1} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {slider("Selected line", `line ${selected + 1}`, <input className="w-full" type="range" min="0" max="2" step="1" value={selected} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      <div className="space-y-4">
        <div className={`rounded-3xl p-5 ${emission ? "bg-slate-950" : "bg-slate-200"}`}>
          <div className="flex items-end gap-10">
            {lines.map((line, index) => (
              <div key={line} className={`w-3 rounded-full ${index === selected ? "opacity-100" : "opacity-60"} ${emission ? "bg-sky-300" : "bg-slate-700"}`} style={{ height: `${48 + line * 14}px` }} />
            ))}
          </div>
        </div>
        <div className="text-sm text-slate-700">{emission ? "Bright lines appear where electrons drop." : "Dark lines mark the absorbed wavelengths from the same allowed gaps."}</div>
      </div>,
      <>
        {metric("Mode", emission ? "bright-line view" : "missing-line view", "border-sky-200 bg-sky-50 text-sky-900")}
        {metric("Gap", `${formatSimulationNumber(lines[selected], 1)} eV`, "border-blue-200 bg-blue-50 text-blue-900")}
        {metric("Wavelength", `${formatSimulationNumber(wavelength, 0)} nm`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metric("Fingerprint", atomA ? "atom A barcode" : "atom B barcode", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["One line belongs to one transition.", "Emission and absorption use the same gap pattern.", "Different atoms keep different spectral barcodes."],
      "Switch between two atoms and notice that the line pattern changes because the allowed level spacings are different.",
    );
  }

  if (lessonKey === "A2_L3") {
    const photon = clamp(simMetricMeters, 1, 6);
    const phi = clamp(simVectorMagnitude, 1.5, 4.5);
    const intensity = clamp(simDensityMass, 1, 10);
    const emitted = photon >= phi;
    const kmax = emitted ? photon - phi : 0;
    return frame(
      "Photoelectric-threshold lab",
      <>
        {slider("Photon energy", `${formatSimulationNumber(photon, 1)} eV`, <input className="w-full" type="range" min="1" max="6" step="0.1" value={photon} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {slider("Work function", `${formatSimulationNumber(phi, 1)} eV`, <input className="w-full" type="range" min="1.5" max="4.5" step="0.1" value={phi} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {slider("Intensity", `${formatSimulationNumber(intensity, 0)} packets`, <input className="w-full" type="range" min="1" max="10" step="1" value={intensity} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <div className="flex items-end gap-4">
            <div className="h-32 w-28 rounded-2xl bg-amber-400/80" />
            <div className={`h-12 w-12 rounded-full ${emitted ? "bg-sky-300" : "bg-slate-500"}`} />
          </div>
          <div className="mt-4 text-sm">{emitted ? "Above threshold: electrons are emitted." : "Below threshold: no emission, however bright the beam becomes."}</div>
        </div>
      </div>,
      <>
        {metric("Photon", `${formatSimulationNumber(photon, 1)} eV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metric("Work function", `${formatSimulationNumber(phi, 1)} eV`, "border-blue-200 bg-blue-50 text-blue-900")}
        {metric("K max", `${formatSimulationNumber(kmax, 1)} eV`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metric("Rate trend", emitted ? `${formatSimulationNumber(intensity * 12, 0)} emitted` : "0 emitted", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Threshold checks packet energy first.", "Intensity mainly changes how many electrons are emitted above threshold.", "Extra packet energy becomes electron kinetic energy."],
      "Keep one bright low-energy beam on the board and compare it with one above-threshold beam so brightness does not replace packet logic.",
    );
  }

  if (lessonKey === "A2_L4") {
    const packet = clamp(simMetricMeters, 0, 18);
    const excite = clamp(simVectorMagnitude, 2, 8);
    const ionise = Math.max(excite + 2, clamp(simVectorAngle, 6, 16));
    const outcome = packet < excite ? "no transition" : packet < ionise ? "excitation" : "ionisation";
    const excess = outcome === "ionisation" ? packet - ionise : 0;
    return frame(
      "Excitation-versus-ionisation lab",
      <>
        {slider("Incoming energy", `${formatSimulationNumber(packet, 1)} eV`, <input className="w-full" type="range" min="0" max="18" step="0.1" value={packet} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {slider("Excitation gap", `${formatSimulationNumber(excite, 1)} eV`, <input className="w-full" type="range" min="2" max="8" step="0.1" value={excite} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {slider("Ionisation threshold", `${formatSimulationNumber(ionise, 1)} eV`, <input className="w-full" type="range" min="6" max="16" step="0.1" value={ionise} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl bg-slate-900/95 p-5 text-white">
          <div className="h-2 w-40 rounded-full bg-white/80" />
          <div className="h-2 w-48 rounded-full bg-blue-400" />
          <div className="h-2 w-60 rounded-full bg-red-400" />
          <div className="text-sm text-slate-200">Outcome: {outcome}</div>
        </div>
      </div>,
      <>
        {metric("Packet", `${formatSimulationNumber(packet, 1)} eV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metric("Excitation", `${formatSimulationNumber(excite, 1)} eV`, "border-blue-200 bg-blue-50 text-blue-900")}
        {metric("Ionisation", `${formatSimulationNumber(ionise, 1)} eV`, "border-red-200 bg-red-50 text-red-900")}
        {metric("Freed KE", outcome === "ionisation" ? `${formatSimulationNumber(excess, 1)} eV` : "still bound", "border-violet-200 bg-violet-50 text-violet-900")}
      </>,
      ["Excitation keeps the electron bound.", "Ionisation frees the electron into the continuum.", "Energy above ionisation can appear as kinetic energy."],
      "Compare the same packet with both thresholds before naming the outcome. That is the real lesson distinction.",
    );
  }

  if (lessonKey === "A2_L5") {
    const voltage = clamp(simMetricMeters, 20, 400);
    const aperture = clamp(simVectorMagnitude, 0.3, 1.8);
    const hits = Math.round(clamp(simDensityMass, 20, 180));
    const lambdaNm = 1.227 / Math.sqrt(voltage);
    const spread = clamp((lambdaNm / aperture) * 18, 1, 7);
    return frame(
      "Matter-wave lab",
      <>
        {slider("Accelerating voltage", `${formatSimulationNumber(voltage, 0)} V`, <input className="w-full" type="range" min="20" max="400" step="5" value={voltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {slider("Aperture width", `${formatSimulationNumber(aperture, 2)} nm scale`, <input className="w-full" type="range" min="0.3" max="1.8" step="0.05" value={aperture} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {slider("Detected electrons", `${hits}`, <input className="w-full" type="range" min="20" max="180" step="5" value={hits} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      <div className="space-y-4">
        <div className="rounded-3xl bg-slate-900 p-5 text-white">
          <div className="mb-4 flex gap-3">
            <div className="h-24 w-3 rounded-full bg-white" />
            <div className="h-24 w-3 rounded-full bg-white" />
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((index) => <div key={index} className="rounded-full bg-sky-300/80" style={{ height: 6, width: `${120 + spread * 18 - Math.abs(index - 2) * 26}px` }} />)}
          </div>
        </div>
        <div className="text-sm text-slate-700">Localized hits build the pattern over time; changing momentum changes lambda and therefore the spread.</div>
      </div>,
      <>
        {metric("lambda", `${formatSimulationNumber(lambdaNm, 3)} nm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metric("Spread index", `${formatSimulationNumber(spread, 1)}`, "border-blue-200 bg-blue-50 text-blue-900")}
        {metric("Hits", `${hits} localized detections`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metric("Trend", spread > 3 ? "broader pattern" : "narrower pattern", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Increasing momentum shortens the de Broglie wavelength.", "Smaller wavelength gives less obvious diffraction for the same opening.", "Localized detections and a wave-like pattern belong to the same evidence story."],
      "Move the voltage first, then compare how the pattern width responds. That makes the inverse lambda-p link easier to see.",
    );
  }

  const evidence = Math.round(clamp(simMetricMeters, 0, 2));
  const lens = Math.round(clamp(simVectorMagnitude, 0, 2));
  const cards = [
    { title: "Line spectra", clue: "discrete levels", relation: "Delta E = h f" },
    { title: "Photoelectric effect", clue: "packet thresholds", relation: "h f = phi + K max" },
    { title: "Electron diffraction", clue: "matter waves", relation: "lambda = h / p" },
  ];
  const active = cards[evidence];
  const themes = ["quantum states are discrete", "energy transfer is packet-based", "moving particles can show wave evidence"];
  return frame(
    "Quantum-evidence lab",
    <>
      {slider("Evidence panel", active.title, <input className="w-full" type="range" min="0" max="2" step="1" value={evidence} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      {slider("Interpretation lens", themes[lens], <input className="w-full" type="range" min="0" max="2" step="1" value={lens} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      {slider("Confidence", `${formatSimulationNumber(clamp(simFluidDensity, 1, 4), 1)}x`, <input className="w-full" type="range" min="1" max="4" step="0.1" value={clamp(simFluidDensity, 1, 4)} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
    </>,
    <div className="grid gap-3 md:grid-cols-3">
      {cards.map((card, index) => (
        <div key={card.title} className={`rounded-2xl border p-4 ${index === evidence ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
          <div className="font-semibold">{card.title}</div>
          <div className="mt-2 text-sm opacity-80">{card.clue}</div>
        </div>
      ))}
    </div>,
    <>
      {metric("Evidence", active.title, "border-sky-200 bg-sky-50 text-sky-900")}
      {metric("Best relation", active.relation, "border-blue-200 bg-blue-50 text-blue-900")}
      {metric("Strongest clue", active.clue, "border-violet-200 bg-violet-50 text-violet-900")}
      {metric("Shared model", themes[lens], "border-emerald-200 bg-emerald-50 text-emerald-900")}
    </>,
    ["Spectra are strongest for discrete levels.", "Photoelectric thresholds are strongest for photon packet transfer.", "Electron diffraction is strongest for matter-wave evidence."],
    "Use the controls comparatively: switch evidence panels, say what each one proves best, then state the shared quantum model rather than a slogan.",
  );
}
