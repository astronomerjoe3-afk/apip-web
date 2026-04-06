import { useEffect, type ReactNode } from "react";

type Props = {
  lessonKey: string;
  simMetricMeters: number;
  setSimMetricMeters: (value: number) => void;
  simVectorMagnitude: number;
  setSimVectorMagnitude: (value: number) => void;
  simVectorAngle: number;
  setSimVectorAngle: (value: number) => void;
};

const panel = "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm";

const inventory = [
  { label: "Photon", symbol: "gamma", family: "Radiation messenger", charge: "0", slot: "Radiation messengers", color: "#38bdf8" },
  { label: "Electron", symbol: "e-", family: "Lepton", charge: "-1e", slot: "Matter travelers", color: "#818cf8" },
  { label: "Proton", symbol: "p+", family: "Nucleon", charge: "+1e", slot: "Nucleus bundles", color: "#f59e0b" },
  { label: "Neutron", symbol: "n0", family: "Nucleon", charge: "0", slot: "Nucleus bundles", color: "#94a3b8" },
  { label: "Neutrino", symbol: "nu", family: "Lepton", charge: "0", slot: "Matter travelers", color: "#34d399" },
] as const;

const slots = ["Radiation messengers", "Matter travelers", "Nucleus bundles"] as const;
const packGuesses = ["Baryon", "Meson", "Not one of the taught packs"] as const;
const pairModes = ["Pair production", "Annihilation"] as const;
const interactionGuesses = ["Strong", "Weak", "Electromagnetic"] as const;
const messengerGuesses = ["Gluon", "W boson", "Photon"] as const;
const eventShapes = ["Decay-like", "Scattering-like", "Mixed or unclear"] as const;
const eventHints = ["Weak clue", "Strong clue", "Electromagnetic clue"] as const;
const ledgerStates = ["Balanced", "Broken"] as const;

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

function chip(label: string, color: string) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-slate-950" style={{ backgroundColor: color }}>
      {label}
    </div>
  );
}

function tokenColor(label: string): string {
  if (label === "gamma") return "#facc15";
  if (label === "e+") return "#f472b6";
  if (label === "p+") return "#f59e0b";
  return "#38bdf8";
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
  useEffect(() => {
    switch (lessonKey) {
      case "A1_L1":
        setSimMetricMeters(1);
        setSimVectorMagnitude(2);
        setSimVectorAngle(1);
        break;
      case "A1_L2":
        setSimMetricMeters(3);
        setSimVectorMagnitude(0);
        setSimVectorAngle(0);
        break;
      case "A1_L3":
        setSimMetricMeters(0);
        setSimVectorMagnitude(4);
        setSimVectorAngle(0);
        break;
      case "A1_L4":
      case "A1_L5":
      case "A1_L6":
        setSimMetricMeters(0);
        setSimVectorMagnitude(0);
        setSimVectorAngle(0);
        break;
      default:
        break;
    }
  }, [lessonKey, setSimMetricMeters, setSimVectorMagnitude, setSimVectorAngle]);

  if (lessonKey === "A1_L1") {
    const selected = inventory[Math.round(clamp(simMetricMeters, 0, inventory.length - 1))];
    const compare = inventory[Math.round(clamp(simVectorMagnitude, 0, inventory.length - 1))];
    const slot = slots[Math.round(clamp(simVectorAngle, 0, slots.length - 1))];
    const slotMatch = selected.slot === slot;
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Particle inventory controls</h4>
            {slider("Selected particle", selected.label, <input className="w-full" type="range" min="0" max={inventory.length - 1} step="1" value={inventory.indexOf(selected)} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Compare with", compare.label, <input className="w-full" type="range" min="0" max={inventory.length - 1} step="1" value={inventory.indexOf(compare)} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider("Board slot test", slot, <input className="w-full" type="range" min="0" max={slots.length - 1} step="1" value={slots.indexOf(slot)} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Rule reminder</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Photons go in radiation, not in the matter or nucleus slots.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Leptons and nucleons are different particle families.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Charge helps comparison, but family and role decide the category.</li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Family", selected.family, "border-sky-200 bg-sky-50 text-sky-900")}
              {metric("Charge", selected.charge, "border-emerald-200 bg-emerald-50 text-emerald-900")}
              {metric("Correct slot", selected.slot, "border-violet-200 bg-violet-50 text-violet-900")}
              {metric("Check", slotMatch ? "slot matches" : "move it", slotMatch ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-900")}
            </div>
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Board view</h4>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                {chip(selected.symbol, selected.color)}
                {chip(compare.symbol, compare.color)}
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700">
                Testing <span className="font-semibold text-slate-900">{selected.label}</span> against <span className="font-semibold text-slate-900">{slot}</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonKey === "A1_L2") {
    const quarks = Math.round(clamp(simMetricMeters, 1, 3));
    const antiquarks = Math.round(clamp(simVectorMagnitude, 0, 1));
    const guessIndex = Math.round(clamp(simVectorAngle, 0, packGuesses.length - 1));
    const actual = quarks === 3 && antiquarks === 0 ? "Baryon" : quarks === 1 && antiquarks === 1 ? "Meson" : "Not one of the taught packs";
    const guess = packGuesses[guessIndex];
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Quark-packing controls</h4>
            {slider("Number of quarks", `${quarks}`, <input className="w-full" type="range" min="1" max="3" step="1" value={quarks} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Number of antiquarks", `${antiquarks}`, <input className="w-full" type="range" min="0" max="1" step="1" value={antiquarks} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider("Your family guess", guess, <input className="w-full" type="range" min="0" max={packGuesses.length - 1} step="1" value={guessIndex} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Packing rule</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Three quarks gives the baryon pattern.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">One quark plus one antiquark gives the meson pattern.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">If the pack does not match either structure, rebuild it before naming a family.</li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Bundle builder</h4>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                {Array.from({ length: quarks }, (_value, index) => <div key={`q-${index}`}>{chip("q", "#f59e0b")}</div>)}
                {Array.from({ length: antiquarks }, (_value, index) => <div key={`aq-${index}`}>{chip("qbar", "#f472b6")}</div>)}
              </div>
            </div>
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Actual family", actual, "border-sky-200 bg-sky-50 text-sky-900")}
              {metric("Your guess", guess, "border-violet-200 bg-violet-50 text-violet-900")}
              {metric("Check", guess === actual ? "matches the pack" : "recheck the structure", guess === actual ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Main clue", antiquarks === 1 ? "quark + antiquark" : `${quarks} quarks`, "border-amber-200 bg-amber-50 text-amber-900")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonKey === "A1_L3") {
    const modeIndex = Math.round(clamp(simMetricMeters, 0, pairModes.length - 1));
    const energy = Math.round(clamp(simVectorMagnitude, 0, 10));
    const choice = Math.round(clamp(simVectorAngle, 0, 2));
    const production = [
      { label: "electron + positron", before: ["gamma"], after: ["e-", "e+"], pairOk: true, afterCharge: "0" },
      { label: "electron + electron", before: ["gamma"], after: ["e-", "e-"], pairOk: false, afterCharge: "-2" },
      { label: "single electron", before: ["gamma"], after: ["e-"], pairOk: false, afterCharge: "-1" },
    ] as const;
    const annihilation = [
      { label: "electron + positron", before: ["e-", "e+"], after: ["gamma", "gamma"], pairOk: true, beforeCharge: "0" },
      { label: "electron + electron", before: ["e-", "e-"], after: ["gamma", "gamma"], pairOk: false, beforeCharge: "-2" },
      { label: "electron + proton", before: ["e-", "p+"], after: ["gamma", "gamma"], pairOk: false, beforeCharge: "0 but wrong pair" },
    ] as const;
    const thresholdMet = energy >= 6;
    const event = modeIndex === 0 ? production[choice] : annihilation[choice];
    const allowed = modeIndex === 0 ? event.pairOk && thresholdMet : event.pairOk;
    const chargeText = modeIndex === 0 ? `after ${production[choice].afterCharge}` : `before ${annihilation[choice].beforeCharge}`;
    const message = modeIndex === 0
      ? !event.pairOk ? "Blocked: the products are not a matched particle-antiparticle pair." : thresholdMet ? "Allowed: the photon has enough energy and the charges balance." : "Blocked: the photon energy is below threshold."
      : event.pairOk ? "Allowed: a matched pair can annihilate into radiation." : "Blocked: the incoming particles are not a particle-antiparticle pair.";
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Pair-process controls</h4>
            {slider("Event type", pairModes[modeIndex], <input className="w-full" type="range" min="0" max={pairModes.length - 1} step="1" value={modeIndex} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Photon energy level", `${energy}`, <input className="w-full" type="range" min="0" max="10" step="1" value={energy} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider(modeIndex === 0 ? "Proposed products" : "Incoming pair", event.label, <input className="w-full" type="range" min="0" max="2" step="1" value={choice} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Rule reminder</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Pair production needs enough photon energy to reach threshold.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Annihilation needs a matched particle-antiparticle pair.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Charge still has to balance before and after the event.</li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Event board</h4>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center gap-3">
                {event.before.map((entry, index) => <div key={`before-${entry}-${index}`}>{chip(entry, tokenColor(entry))}</div>)}
                <div className="text-sm font-semibold text-slate-600">-&gt;</div>
                {event.after.map((entry, index) => <div key={`after-${entry}-${index}`}>{chip(entry, tokenColor(entry))}</div>)}
              </div>
            </div>
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Status", allowed ? "allowed" : "blocked", allowed ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Threshold", thresholdMet ? "met" : "below threshold", thresholdMet ? "border-sky-200 bg-sky-50 text-sky-900" : "border-amber-200 bg-amber-50 text-amber-900")}
              {metric("Pair check", event.pairOk ? "matched pair" : "wrong pair", "border-violet-200 bg-violet-50 text-violet-900")}
              {metric("Charge", chargeText, "border-slate-200 bg-slate-50 text-slate-900")}
            </div>
            <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonKey === "A1_L4") {
    const caseIndex = Math.round(clamp(simMetricMeters, 0, 2));
    const interactionIndex = Math.round(clamp(simVectorMagnitude, 0, interactionGuesses.length - 1));
    const messengerIndex = Math.round(clamp(simVectorAngle, 0, messengerGuesses.length - 1));
    const cases = [
      { label: "Quarks stay bound inside a hadron.", clue: "This is a binding story.", interaction: "Strong", messenger: "Gluon" },
      { label: "A neutron changes into a proton and an electron.", clue: "One particle changes identity.", interaction: "Weak", messenger: "W boson" },
      { label: "A charged particle is deflected without changing identity.", clue: "Charge acts without a particle-change story.", interaction: "Electromagnetic", messenger: "Photon" },
    ] as const;
    const selected = cases[caseIndex];
    const interactionGuess = interactionGuesses[interactionIndex];
    const messengerGuess = messengerGuesses[messengerIndex];
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Interaction controls</h4>
            {slider("Event case", selected.label, <input className="w-full" type="range" min="0" max="2" step="1" value={caseIndex} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Interaction guess", interactionGuess, <input className="w-full" type="range" min="0" max={interactionGuesses.length - 1} step="1" value={interactionIndex} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider("Messenger guess", messengerGuess, <input className="w-full" type="range" min="0" max={messengerGuesses.length - 1} step="1" value={messengerIndex} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Case clue</h4>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Main clue:</span> {selected.clue}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Match board</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Best interaction", selected.interaction, "border-sky-200 bg-sky-50 text-sky-900")}
              {metric("Best messenger", selected.messenger, "border-violet-200 bg-violet-50 text-violet-900")}
              {metric("Interaction guess", interactionGuess === selected.interaction ? "matches" : "does not match", interactionGuess === selected.interaction ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Messenger guess", messengerGuess === selected.messenger ? "matches" : "does not match", messengerGuess === selected.messenger ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
            </div>
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
            <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
              Use the event clue first. This case points to the {selected.interaction.toLowerCase()} interaction and the {selected.messenger}.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonKey === "A1_L5") {
    const chargeDelta = Math.round(clamp(simMetricMeters, -2, 2));
    const baryonDelta = Math.round(clamp(simVectorMagnitude, -1, 1));
    const leptonDelta = Math.round(clamp(simVectorAngle, -1, 1));
    const allPass = chargeDelta === 0 && baryonDelta === 0 && leptonDelta === 0;
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Conservation controls</h4>
            {slider("Charge change", `${chargeDelta}`, <input className="w-full" type="range" min="-2" max="2" step="1" value={chargeDelta} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Baryon-number change", `${baryonDelta}`, <input className="w-full" type="range" min="-1" max="1" step="1" value={baryonDelta} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider("Lepton-number change", `${leptonDelta}`, <input className="w-full" type="range" min="-1" max="1" step="1" value={leptonDelta} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Rule reminder</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">Zero change means that quantity is conserved.</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">One correct total is not enough if another conserved quantity breaks.</li>
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Gate check</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Charge gate", chargeDelta === 0 ? "pass" : "fail", chargeDelta === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Baryon gate", baryonDelta === 0 ? "pass" : "fail", baryonDelta === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Lepton gate", leptonDelta === 0 ? "pass" : "fail", leptonDelta === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Overall event", allPass ? "allowed" : "reject", allPass ? "border-sky-200 bg-sky-50 text-sky-900" : "border-amber-200 bg-amber-50 text-amber-900")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lessonKey === "A1_L6") {
    const shapeIndex = Math.round(clamp(simMetricMeters, 0, eventShapes.length - 1));
    const hintIndex = Math.round(clamp(simVectorMagnitude, 0, eventHints.length - 1));
    const ledgerIndex = Math.round(clamp(simVectorAngle, 0, ledgerStates.length - 1));
    const shape = eventShapes[shapeIndex];
    const hint = eventHints[hintIndex];
    const ledger = ledgerStates[ledgerIndex];
    const balanced = ledger === "Balanced";
    let fit = "Keep comparing clues.";
    if (!balanced) fit = "Reject this event first: the conservation ledger is broken.";
    else if (shape === "Decay-like" && hint === "Weak clue") fit = "Strong fit: the clues point to a weak decay.";
    else if (shape === "Scattering-like" && hint === "Electromagnetic clue") fit = "Strong fit: the clues point to a scattering event.";
    else if (shape === "Scattering-like" && hint === "Strong clue") fit = "Reasonable fit: the clues point to a strong interaction event.";
    else fit = "The evidence layers do not line up cleanly yet, so do not jump to one label.";
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Event-analysis controls</h4>
            {slider("Event shape", shape, <input className="w-full" type="range" min="0" max={eventShapes.length - 1} step="1" value={shapeIndex} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
            {slider("Interaction hint", hint, <input className="w-full" type="range" min="0" max={eventHints.length - 1} step="1" value={hintIndex} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
            {slider("Conservation ledger", ledger, <input className="w-full" type="range" min="0" max={ledgerStates.length - 1} step="1" value={ledgerIndex} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Evidence rule</h4>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Use particle layout, interaction clue, and the conservation ledger together before you accept one final label.</div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Evidence summary</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metric("Shape clue", shape, "border-sky-200 bg-sky-50 text-sky-900")}
              {metric("Interaction clue", hint, "border-violet-200 bg-violet-50 text-violet-900")}
              {metric("Ledger", ledger, balanced ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
              {metric("Best fit", balanced ? "keep checking clues" : "reject first", "border-amber-200 bg-amber-50 text-amber-900")}
            </div>
          </div>
          <div className={panel}>
            <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
            <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{fit}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      This A1 lesson does not have a dedicated simulation panel yet.
    </div>
  );
}
