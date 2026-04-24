"use client";

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
      <div className="mt-2 text-lg font-semibold leading-snug">{value}</div>
    </div>
  );
}

function boardCard(title: string, body: ReactNode, tone = "border-slate-200 bg-slate-50"): ReactNode {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-700">{body}</div>
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
          <div className="mt-4 grid gap-3">{board}</div>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );
}

function labelledDots(count: number, tone: string): ReactNode {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <span key={`${tone}-${index}`} className={`h-4 w-4 rounded-full ${tone}`} />
      ))}
    </div>
  );
}

export default function M12NuclearSimulationPanels({
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
  if (lessonKey === "M12_L1") {
    const reactantBinding = clamp(simMetricMeters, 6.4, 8.6);
    const productBinding = clamp(simVectorMagnitude, 6.4, 9.1);
    const nucleonCount = clamp(Math.round(simDensityMass), 4, 16);
    const massDefect = clamp(simSpread, 0.001, 0.03);
    const totalEnergy = massDefect * 931.5;
    const stabilityGap = productBinding - reactantBinding;
    const verdict =
      stabilityGap > 0.08 ? "products more stable -> energy released" : stabilityGap < -0.08 ? "products less stable -> energy required" : "nearly balanced -> little stability change";

    return renderPanel(
      "Binding-energy ledger",
      <>
        {sliderField("Reactant binding per nucleon", `${formatSimulationNumber(reactantBinding, 2)} MeV`, <input className="w-full" type="range" min="6.4" max="8.6" step="0.05" value={reactantBinding} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Product binding per nucleon", `${formatSimulationNumber(productBinding, 2)} MeV`, <input className="w-full" type="range" min="6.4" max="9.1" step="0.05" value={productBinding} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Nucleon count for comparison", `${formatSimulationNumber(nucleonCount, 0)} nucleons`, <input className="w-full" type="range" min="4" max="16" step="1" value={nucleonCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Mass defect", `${formatSimulationNumber(massDefect, 3)} u`, <input className="w-full" type="range" min="0.001" max="0.03" step="0.001" value={massDefect} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Nuclear-stability board",
      <>
        {boardCard(
          "Reactant nucleus",
          <>
            <div>{`${formatSimulationNumber(reactantBinding, 2)} MeV per nucleon across ${formatSimulationNumber(nucleonCount, 0)} nucleons`}</div>
            <div className="mt-2 text-slate-500">{`Total binding shown: ${formatSimulationNumber(reactantBinding * nucleonCount, 1)} MeV`}</div>
          </>,
          "border-amber-200 bg-amber-50",
        )}
        {boardCard(
          "Product nucleus",
          <>
            <div>{`${formatSimulationNumber(productBinding, 2)} MeV per nucleon across ${formatSimulationNumber(nucleonCount, 0)} nucleons`}</div>
            <div className="mt-2 text-slate-500">{`Total binding shown: ${formatSimulationNumber(productBinding * nucleonCount, 1)} MeV`}</div>
          </>,
          "border-emerald-200 bg-emerald-50",
        )}
        {boardCard(
          "Mass-energy link",
          <>
            <div>{`Using E = Δm c², the chosen mass defect corresponds to about ${formatSimulationNumber(totalEnergy, 1)} MeV.`}</div>
            <div className="mt-2 text-slate-500">This is why a tiny mass change can still matter physically.</div>
          </>,
          "border-sky-200 bg-sky-50",
        )}
      </>,
      <>
        {metricCard("Stability gap", `${formatSimulationNumber(stabilityGap, 2)} MeV per nucleon`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Energy equivalent", `${formatSimulationNumber(totalEnergy, 1)} MeV`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Fair comparison", "binding energy per nucleon", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Verdict", verdict, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Compare binding energy per nucleon before total binding when nucleus sizes differ.",
        "A more tightly bound product explains energy release better than a vague 'the nucleus changed' slogan.",
        "Mass defect is the mass equivalent of the nuclear energy change.",
      ],
      "This board is working if the learner can explain both the stability comparison and the mass-energy link without drifting into chemical-bond language.",
    );
  }

  if (lessonKey === "M12_L2") {
    const released = clamp(simDensityMass, 2, 4);
    const leakage = clamp(simMetricMeters, 0, 1.8);
    const rodCapture = clamp(simBias, 0, 1.8);
    const moderatorQuality = clamp(simVectorMagnitude, 0.6, 1.3);
    const continuingFactor = Math.max(0, ((released - leakage - rodCapture) * moderatorQuality) / 2);
    const generation1 = continuingFactor;
    const generation2 = generation1 * continuingFactor;
    const generation3 = generation2 * continuingFactor;
    const verdict =
      continuingFactor > 1.05 ? "growing chain reaction" : continuingFactor < 0.95 ? "chain reaction dies away" : "steady critical chain";

    return renderPanel(
      "Chain-reaction relay",
      <>
        {sliderField("Neutrons released per fission", `${formatSimulationNumber(released, 1)}`, <input className="w-full" type="range" min="2" max="4" step="0.1" value={released} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Leakage or missed neutrons", `${formatSimulationNumber(leakage, 1)}`, <input className="w-full" type="range" min="0" max="1.8" step="0.1" value={leakage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Control-rod capture", `${formatSimulationNumber(rodCapture, 1)}`, <input className="w-full" type="range" min="0" max="1.8" step="0.1" value={rodCapture} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Moderator effectiveness", `${formatSimulationNumber(moderatorQuality, 2)}`, <input className="w-full" type="range" min="0.6" max="1.3" step="0.05" value={moderatorQuality} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Neutron-budget board",
      <>
        {boardCard(
          "First fission event",
          <>
            <div>{`Released: ${formatSimulationNumber(released, 1)} neutrons`}</div>
            <div className="mt-2 text-slate-500">{`Lost to leakage/capture: ${formatSimulationNumber(leakage + rodCapture, 1)}`}</div>
          </>,
          "border-amber-200 bg-amber-50",
        )}
        {boardCard(
          "Average continuing relay",
          <>
            <div>{`Effective continuing neutrons per event: ${formatSimulationNumber(continuingFactor, 2)}`}</div>
            <div className="mt-2 text-slate-500">{verdict}</div>
          </>,
          "border-emerald-200 bg-emerald-50",
        )}
        {boardCard(
          "Three-generation picture",
          <div className="grid gap-3">
            <div>
              <div className="text-slate-500">Generation 1</div>
              {labelledDots(Math.max(1, Math.min(8, Math.round(generation1))), "bg-sky-500")}
            </div>
            <div>
              <div className="text-slate-500">Generation 2</div>
              {labelledDots(Math.max(1, Math.min(8, Math.round(generation2))), "bg-violet-500")}
            </div>
            <div>
              <div className="text-slate-500">Generation 3</div>
              {labelledDots(Math.max(1, Math.min(8, Math.round(generation3))), "bg-rose-500")}
            </div>
          </div>,
          "border-sky-200 bg-sky-50",
        )}
      </>,
      <>
        {metricCard("Continuing factor", formatSimulationNumber(continuingFactor, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Control state", rodCapture > 1.1 ? "strongly damped" : rodCapture < 0.5 ? "lightly damped" : "moderated control", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Reactor aim", "about one continuing neutron", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Outcome", verdict, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "The important question is how many neutrons continue the next step, not only how many were released.",
        "Control rods reduce the chain by absorbing neutrons, not by vaguely 'cooling' the story.",
        "A steady reactor sits near one continuing neutron per fission on average.",
      ],
      "This relay stays faithful to reactor logic because it makes the next generation visible. A single split is never the whole answer.",
    );
  }

  if (lessonKey === "M12_L3") {
    const temperature = clamp(simMetricMeters, 20, 220);
    const pressure = clamp(simFluidDensity, 1, 10);
    const confinement = clamp(simSpread, 0.5, 5);
    const fuelMode = clamp(Math.round(simBias), 0, 1) === 1 ? "deuterium-tritium" : "light nuclei";
    const fuelBonus = fuelMode === "deuterium-tritium" ? 1.2 : 0.95;
    const approachScore = (temperature / 80) * (pressure / 4) * (confinement / 2) * fuelBonus;
    const fusionWindow = approachScore >= 1.4;
    const bindingGain = clamp(simDensityVolume, 0.2, 1.2);

    return renderPanel(
      "Fusion gate",
      <>
        {sliderField("Core temperature", `${formatSimulationNumber(temperature, 0)} million K`, <input className="w-full" type="range" min="20" max="220" step="5" value={temperature} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Compression or pressure", `${formatSimulationNumber(pressure, 1)} relative units`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={pressure} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Confinement time", `${formatSimulationNumber(confinement, 1)} relative units`, <input className="w-full" type="range" min="0.5" max="5" step="0.1" value={confinement} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Fuel pairing", fuelMode, <input className="w-full" type="range" min="0" max="1" step="1" value={fuelMode === "deuterium-tritium" ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Binding gain after joining", `${formatSimulationNumber(bindingGain, 2)} relative units`, <input className="w-full" type="range" min="0.2" max="1.2" step="0.05" value={bindingGain} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Fusion-conditions board",
      <>
        {boardCard(
          "Repulsion barrier",
          <>
            <div>Positively charged nuclei push each other apart before they can join.</div>
            <div className="mt-2 text-slate-500">{fusionWindow ? "Barrier can be overcome in this setup." : "Barrier still blocks sustained joining."}</div>
          </>,
          "border-rose-200 bg-rose-50",
        )}
        {boardCard(
          "Conditions check",
          <>
            <div>{`Approach score: ${formatSimulationNumber(approachScore, 2)}`}</div>
            <div className="mt-2 text-slate-500">{fuelMode === "deuterium-tritium" ? "Easier school-model fusion pair" : "Higher barrier light-nuclei comparison"}</div>
          </>,
          "border-sky-200 bg-sky-50",
        )}
        {boardCard(
          "Outcome",
          <>
            <div>{fusionWindow ? "Joining route opens and a more tightly bound product can form." : "Conditions are still too weak for sustained fusion."}</div>
            <div className="mt-2 text-slate-500">{`Binding-gain cue: ${formatSimulationNumber(bindingGain, 2)}`}</div>
          </>,
          "border-emerald-200 bg-emerald-50",
        )}
      </>,
      <>
        {metricCard("Temperature role", temperature > 120 ? "very high" : "still limited", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Pressure role", pressure > 5 ? "close approach more likely" : "nuclei still sparse", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Fusion window", fusionWindow ? "open" : "closed", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Star link", "stellar cores supply heat and pressure", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Fusion explanations should mention the repulsion barrier before they mention energy release.",
        "Very high temperature is useful because it gives nuclei enough kinetic energy to approach closely.",
        "Stars are the standard real-world fusion context because they sustain the required conditions.",
      ],
      "This gate is working if students can explain why joining is difficult first, not merely repeat that fusion 'makes energy.'",
    );
  }

  if (lessonKey === "M12_L4") {
    const rodInsertion = clamp(simBias, 0, 100);
    const moderatorLevel = clamp(simDensityMass, 40, 100);
    const coolantFlow = clamp(simFluidDensity, 25, 100);
    const turbineEfficiency = clamp(simVectorAngle, 20, 55) / 100;
    const steamLoop = clamp(simDensityVolume, 30, 100);
    const reactionRate = Math.max(0.2, (1 - rodInsertion / 130) * (moderatorLevel / 80));
    const thermalOutput = reactionRate * 100;
    const transferredHeat = thermalOutput * (coolantFlow / 100) * (steamLoop / 100);
    const electricalOutput = transferredHeat * turbineEfficiency;
    const status =
      rodInsertion < 20 && coolantFlow < 45 ? "unstable hot core risk" : rodInsertion > 75 ? "heavily suppressed reactor" : "controlled power generation";

    return renderPanel(
      "Reactor control desk",
      <>
        {sliderField("Control-rod insertion", `${formatSimulationNumber(rodInsertion, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="2" value={rodInsertion} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Moderator effectiveness", `${formatSimulationNumber(moderatorLevel, 0)}%`, <input className="w-full" type="range" min="40" max="100" step="2" value={moderatorLevel} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Coolant flow", `${formatSimulationNumber(coolantFlow, 0)}%`, <input className="w-full" type="range" min="25" max="100" step="2" value={coolantFlow} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Steam-loop readiness", `${formatSimulationNumber(steamLoop, 0)}%`, <input className="w-full" type="range" min="30" max="100" step="2" value={steamLoop} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Turbine-generator efficiency", `${formatSimulationNumber(turbineEfficiency * 100, 0)}%`, <input className="w-full" type="range" min="20" max="55" step="1" value={turbineEfficiency * 100} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Plant-system board",
      <>
        {boardCard(
          "Core control",
          <>
            <div>{`Reaction-rate cue: ${formatSimulationNumber(reactionRate, 2)} relative units`}</div>
            <div className="mt-2 text-slate-500">Moderator helps the chain; control rods hold it back.</div>
          </>,
          "border-amber-200 bg-amber-50",
        )}
        {boardCard(
          "Heat-transfer line",
          <>
            <div>{`Thermal output from the core: ${formatSimulationNumber(thermalOutput, 1)} units`}</div>
            <div className="mt-2 text-slate-500">{`Transferred onward by coolant: ${formatSimulationNumber(transferredHeat, 1)} units`}</div>
          </>,
          "border-sky-200 bg-sky-50",
        )}
        {boardCard(
          "Electrical stage",
          <>
            <div>{`Electrical output after turbine-generator stages: ${formatSimulationNumber(electricalOutput, 1)} units`}</div>
            <div className="mt-2 text-slate-500">{status}</div>
          </>,
          "border-emerald-200 bg-emerald-50",
        )}
      </>,
      <>
        {metricCard("Reaction control", rodInsertion > 60 ? "strongly reduced" : rodInsertion < 25 ? "lightly reduced" : "managed", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Coolant role", coolantFlow < 45 ? "heat removal limited" : "heat transfer healthy", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Energy path", "nuclear -> thermal -> kinetic -> electrical", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Plant state", status, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Moderator, control rods, coolant, turbine, and generator are distinct jobs in one linked reactor system.",
        "The core is a controlled heat source, not a device that makes electricity directly.",
        "A safe reactor answer needs both neutron control and heat-transfer language.",
      ],
      "This desk does the job when students can point to which control affects the chain reaction and which control affects heat removal or output.",
    );
  }

  if (lessonKey === "M12_L5") {
    const taskIndex = clamp(Math.round(simBias), 0, 3);
    const tasks = ["medical imaging", "flow tracing", "radiotherapy", "thickness monitoring"] as const;
    const task = tasks[taskIndex];
    const halfLifeHours = clamp(simMetricMeters, 1, 120);
    const radiationIndex = clamp(Math.round(simDensityMass), 0, 2);
    const radiationType = ["alpha", "beta", "gamma"][radiationIndex];
    const measuredCount = clamp(simVectorMagnitude, 20, 240);
    const backgroundCount = clamp(simSpread * 40, 0, 80);
    const correctedCount = Math.max(0, measuredCount - backgroundCount);
    const fitScore =
      (task === "medical imaging" && radiationType === "gamma" ? 2 : 0) +
      (task === "flow tracing" && (radiationType === "gamma" || radiationType === "beta") ? 2 : 0) +
      (task === "radiotherapy" && (radiationType === "gamma" || radiationType === "beta") ? 2 : 0) +
      (task === "thickness monitoring" && (radiationType === "beta" || radiationType === "gamma") ? 2 : 0) +
      ((task === "medical imaging" || task === "flow tracing") && halfLifeHours <= 24 ? 2 : 0) +
      (task === "radiotherapy" && halfLifeHours >= 24 ? 2 : 0) +
      (task === "thickness monitoring" && halfLifeHours >= 12 ? 2 : 0);
    const verdict = fitScore >= 4 ? "good isotope-task match" : fitScore >= 2 ? "partly matched choice" : "poorly matched choice";

    return renderPanel(
      "Isotope-matching board",
      <>
        {sliderField("Application", task, <input className="w-full" type="range" min="0" max="3" step="1" value={taskIndex} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Half-life", `${formatSimulationNumber(halfLifeHours, 0)} hours`, <input className="w-full" type="range" min="1" max="120" step="1" value={halfLifeHours} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Radiation type", radiationType, <input className="w-full" type="range" min="0" max="2" step="1" value={radiationIndex} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Measured detector count", `${formatSimulationNumber(measuredCount, 0)} counts/s`, <input className="w-full" type="range" min="20" max="240" step="5" value={measuredCount} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Background count", `${formatSimulationNumber(backgroundCount, 0)} counts/s`, <input className="w-full" type="range" min="0" max="2" step="0.05" value={simSpread} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Application-fit board",
      <>
        {boardCard(
          "Task requirements",
          <>
            <div>{task === "medical imaging" ? "Needs radiation that can leave the body and a short-lived source." : task === "flow tracing" ? "Needs a detectable signal that lasts for the measurement window." : task === "radiotherapy" ? "Needs radiation that can damage harmful tissue in a controlled way." : "Needs a signal whose transmission changes with material thickness."}</div>
          </>,
          "border-amber-200 bg-amber-50",
        )}
        {boardCard(
          "Detector correction",
          <>
            <div>{`Corrected count rate = ${formatSimulationNumber(correctedCount, 0)} counts/s`}</div>
            <div className="mt-2 text-slate-500">Measured count minus background count keeps the evidence clean.</div>
          </>,
          "border-sky-200 bg-sky-50",
        )}
        {boardCard(
          "Selection verdict",
          <>
            <div>{verdict}</div>
            <div className="mt-2 text-slate-500">{`Current combination: ${radiationType} with ${formatSimulationNumber(halfLifeHours, 0)} h half-life for ${task}.`}</div>
          </>,
          "border-emerald-200 bg-emerald-50",
        )}
      </>,
      <>
        {metricCard("Radiation fit", radiationType, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Half-life fit", halfLifeHours <= 24 ? "short-lived" : halfLifeHours <= 72 ? "medium-lived" : "long-lived", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Corrected signal", `${formatSimulationNumber(correctedCount, 0)} counts/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Decision", verdict, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Application choice is a matching problem, not a source-label problem.",
        "Half-life should fit the duration of the job rather than being chosen by one rigid rule.",
        "Background subtraction matters because detectors count environmental radiation too.",
      ],
      "This board is succeeding if the learner can justify both why a source is useful for the task and why it is not automatically the best choice for every other task.",
    );
  }

  const sourceIndex = clamp(Math.round(simDensityMass), 0, 2);
  const sourceType = ["alpha", "beta", "gamma"][sourceIndex];
  const route = clamp(Math.round(simBias), 0, 1) === 1 ? "internal contamination" : "external exposure";
  const timeNearSource = clamp(simMetricMeters, 1, 60);
  const shielding = clamp(simFluidDensity, 0, 100);
  const distance = clamp(simVectorMagnitude, 0.5, 5);
  const applicationIndex = clamp(Math.round(simVectorAngle / 30), 0, 3);
  const application = ["electricity generation", "medical imaging", "radiotherapy", "sterilisation"][applicationIndex];
  const penetrationFactor = sourceType === "alpha" ? 0.6 : sourceType === "beta" ? 1.1 : 1.8;
  const routeFactor = route === "internal contamination" ? (sourceType === "alpha" ? 2.4 : 1.6) : 1;
  const shieldingFactor = Math.max(0.15, 1 - shielding / 115);
  const distanceFactor = 1 / distance;
  const riskScore = penetrationFactor * routeFactor * shieldingFactor * distanceFactor * (timeNearSource / 20);
  const verdict = riskScore > 1.8 ? "high-risk setup" : riskScore > 0.9 ? "moderate-risk setup" : "well-controlled setup";

  return renderPanel(
    "Benefit-risk ledger",
    <>
      {sliderField("Radiation type", sourceType, <input className="w-full" type="range" min="0" max="2" step="1" value={sourceIndex} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      {sliderField("Exposure route", route, <input className="w-full" type="range" min="0" max="1" step="1" value={route === "internal contamination" ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      {sliderField("Time near source", `${formatSimulationNumber(timeNearSource, 0)} min`, <input className="w-full" type="range" min="1" max="60" step="1" value={timeNearSource} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      {sliderField("Shielding strength", `${formatSimulationNumber(shielding, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="2" value={shielding} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      {sliderField("Distance from source", `${formatSimulationNumber(distance, 1)} m`, <input className="w-full" type="range" min="0.5" max="5" step="0.1" value={distance} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      {sliderField("Application under review", application, <input className="w-full" type="range" min="0" max="90" step="30" value={applicationIndex * 30} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
    </>,
    "Hazard-control board",
    <>
      {boardCard(
        "Benefit column",
        <>
          <div>{`Current application: ${application}`}</div>
          <div className="mt-2 text-slate-500">Useful applications can still be justified when the benefit is real and the controls are strong enough.</div>
        </>,
        "border-emerald-200 bg-emerald-50",
      )}
      {boardCard(
        "Hazard column",
        <>
          <div>{`${sourceType} with ${route} gives a risk score of ${formatSimulationNumber(riskScore, 2)}.`}</div>
          <div className="mt-2 text-slate-500">Internal contamination is especially serious for strongly ionising sources.</div>
        </>,
        "border-rose-200 bg-rose-50",
      )}
      {boardCard(
        "Control column",
        <>
          <div>{`Shielding: ${formatSimulationNumber(shielding, 0)}% | Distance: ${formatSimulationNumber(distance, 1)} m | Time: ${formatSimulationNumber(timeNearSource, 0)} min`}</div>
          <div className="mt-2 text-slate-500">{verdict}</div>
        </>,
        "border-sky-200 bg-sky-50",
      )}
    </>,
    <>
      {metricCard("Benefit side", application, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("Hazard side", `${sourceType} + ${route}`, "border-rose-200 bg-rose-50 text-rose-900")}
      {metricCard("Control side", shielding > 60 && distance > 2 ? "strong controls" : "controls still weak", "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Judgment", verdict, "border-amber-200 bg-amber-50 text-amber-900")}
    </>,
    [
      "A good answer pairs benefit, hazard, and control instead of giving a slogan.",
      "Contamination and irradiation are different; the source route matters to the danger.",
      "Shielding, time, and distance reduce exposure, but they do not make the source stop being radioactive.",
    ],
    "This final board is doing its job when the learner can make a balanced case for or against one application without pretending the hazard or the benefit disappears.",
  );
}
