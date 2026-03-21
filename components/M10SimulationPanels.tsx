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

export default function M10SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
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
  if (lessonKey === "M10_L1") {
    const carrierCount = clamp(simMetricMeters, 20, 120);
    const carrierSpeed = clamp(simVectorMagnitude, 0.5, 4);
    const closedLoop = clamp(Math.round(simBias), 0, 1) === 1;
    const checkpointRate = closedLoop ? carrierCount * carrierSpeed * 0.06 : 0;
    return renderPanel(
      "Carrier Loop",
      <>
        {sliderField(
          "Carrier count",
          `${formatSimulationNumber(carrierCount, 0)} tokens`,
          <input className="w-full" type="range" min="20" max="120" step="5" value={carrierCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Carrier speed",
          `${formatSimulationNumber(carrierSpeed, 1)} laps/s`,
          <input className="w-full" type="range" min="0.5" max="4" step="0.1" value={carrierSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Loop switch",
          closedLoop ? "closed" : "open",
          <input className="w-full" type="range" min="0" max="1" step="1" value={closedLoop ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Carrier loop board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eef2ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Charge is the moving carrier quantity</text>
        <rect x="88" y="84" width="468" height="88" rx="44" fill="none" stroke="#1d4ed8" strokeWidth="10" strokeDasharray={closedLoop ? "0" : "370 22 24 22"} />
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <circle
            key={index}
            cx={128 + index * 58}
            cy={index < 4 ? 98 + index * 10 : 164 - (index - 3) * 12}
            r="10"
            fill="#2563eb"
          />
        ))}
        <rect x="504" y="78" width="34" height="100" rx="12" fill="#16a34a" />
        <rect x="84" y="108" width="18" height="40" rx="8" fill="#f59e0b" />
        <text x="66" y="196" fill="#b45309" fontSize="15">checkpoint</text>
        <text x="470" y="70" fill="#166534" fontSize="15">lift station</text>
        <text x="240" y="214" fill="#475569" fontSize="16">{closedLoop ? "Closed route lets carriers circulate." : "Open route breaks the steady current."}</text>
      </svg>,
      <>
        {metricCard("Carrier count", `${formatSimulationNumber(carrierCount, 0)} tokens`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Checkpoint rate", `${formatSimulationNumber(checkpointRate, 2)} C/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Loop status", closedLoop ? "complete route" : "broken route", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Quantity story", "charge moves; current is the rate", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Name the moving carriers before naming any rate.", "A closed loop is needed for sustained current.", "Carrier count and checkpoint rate are different measurements."],
      "This explorer keeps the charge carriers, the loop condition, and the checkpoint meter visible together so current does not get mistaken for stored charge.",
    );
  }

  if (lessonKey === "M10_L2") {
    const chargePassed = clamp(simDensityMass, 2, 24);
    const timeSeconds = clamp(simVectorMagnitude, 1, 8);
    const carrierPool = clamp(simMetricMeters, 20, 120);
    const current = chargePassed / timeSeconds;
    return renderPanel(
      "Checkpoint Rate",
      <>
        {sliderField(
          "Charge passed",
          `${formatSimulationNumber(chargePassed, 1)} C`,
          <input className="w-full" type="range" min="2" max="24" step="1" value={chargePassed} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Time interval",
          `${formatSimulationNumber(timeSeconds, 1)} s`,
          <input className="w-full" type="range" min="1" max="8" step="0.5" value={timeSeconds} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Carrier pool",
          `${formatSimulationNumber(carrierPool, 0)} tokens`,
          <input className="w-full" type="range" min="20" max="120" step="5" value={carrierPool} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Checkpoint board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#eff6ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Current means charge per second at one checkpoint</text>
        <rect x="170" y="84" width="20" height="108" rx="8" fill="#f59e0b" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <line
            key={index}
            x1={74 + index * 78}
            y1={98 + (index % 2) * 26}
            x2={154 + index * 78}
            y2={98 + (index % 2) * 26}
            stroke="#2563eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
        ))}
        <text x="84" y="198" fill="#1d4ed8" fontSize="16">charge passing the checkpoint</text>
        <text x="210" y="114" fill="#0f172a" fontSize="18" fontWeight="700">Q / t</text>
        <text x="210" y="146" fill="#475569" fontSize="16">rate, not total amount</text>
      </svg>,
      <>
        {metricCard("Charge passed", `${formatSimulationNumber(chargePassed, 1)} C`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Time", `${formatSimulationNumber(timeSeconds, 1)} s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Current", `${formatSimulationNumber(current, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Unit meaning", "1 A = 1 C/s", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Read current from charge passing a point each second.", "A large carrier pool does not automatically mean a large current.", "Translate amperes back into coulombs per second."],
      "The checkpoint board keeps the rate story physical: current is what crosses the gate per unit time.",
    );
  }

  if (lessonKey === "M10_L3") {
    const voltage = clamp(simMetricMeters, 1, 12);
    const packetCharge = clamp(simDensityMass, 1, 6);
    const energyGain = voltage * packetCharge;
    const carrierCount = clamp(simDensityVolume, 20, 80);
    return renderPanel(
      "Lift Station",
      <>
        {sliderField(
          "Boost per token",
          `${formatSimulationNumber(voltage, 1)} J/C`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={voltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Charge packet",
          `${formatSimulationNumber(packetCharge, 1)} C`,
          <input className="w-full" type="range" min="1" max="6" step="0.5" value={packetCharge} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Loop carrier count",
          `${formatSimulationNumber(carrierCount, 0)} tokens`,
          <input className="w-full" type="range" min="20" max="80" step="5" value={carrierCount} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Lift-station board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#ecfeff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Voltage is the boost given to each carrier</text>
        <rect x="84" y="92" width="118" height="86" rx="24" fill="#bfdbfe" />
        <rect x="262" y="82" width="146" height="108" rx="28" fill="#86efac" />
        <rect x="466" y="92" width="108" height="86" rx="24" fill="#fde68a" />
        <text x="116" y="140" fill="#1d4ed8" fontSize="18" fontWeight="700">carrier in</text>
        <text x="292" y="124" fill="#166534" fontSize="18" fontWeight="700">lift station</text>
        <text x="292" y="154" fill="#166534" fontSize="16">{formatSimulationNumber(voltage, 1)} J/C boost</text>
        <text x="486" y="140" fill="#92400e" fontSize="18" fontWeight="700">carrier out</text>
      </svg>,
      <>
        {metricCard("Voltage", `${formatSimulationNumber(voltage, 1)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Charge packet", `${formatSimulationNumber(packetCharge, 1)} C`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Energy gain", `${formatSimulationNumber(energyGain, 1)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Source role", "gives energy per charge", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Voltage belongs to the boost each carrier receives.", "The battery is not a tank of current.", "Energy per charge is different from total energy in the whole loop."],
      "This board keeps voltage tied to energy-per-carrier language before the current story is introduced again.",
    );
  }

  if (lessonKey === "M10_L4") {
    const length = clamp(simMetricMeters, 1, 10);
    const width = clamp(simVectorMagnitude, 1, 5);
    const roughness = clamp(simDensityMass, 1, 5);
    const resistanceIndex = (length * roughness) / width;
    return renderPanel(
      "Route Drag",
      <>
        {sliderField(
          "Route length",
          `${formatSimulationNumber(length, 1)} m`,
          <input className="w-full" type="range" min="1" max="10" step="0.5" value={length} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Route width",
          `${formatSimulationNumber(width, 1)} units`,
          <input className="w-full" type="range" min="1" max="5" step="0.5" value={width} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Material roughness",
          `${formatSimulationNumber(roughness, 1)} drag units`,
          <input className="w-full" type="range" min="1" max="5" step="0.5" value={roughness} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "Resistance board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#f8fafc" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Resistance belongs to the path geometry and material</text>
        <rect x="86" y="96" width="172" height="28" rx="14" fill="#38bdf8" />
        <rect x="86" y="146" width="344" height="18" rx="9" fill="#0f766e" />
        <text x="90" y="90" fill="#0f172a" fontSize="15">short, wide, smoother route</text>
        <text x="90" y="142" fill="#0f172a" fontSize="15">longer, narrower, draggier route</text>
        <text x="454" y="124" fill="#1d4ed8" fontSize="18" fontWeight="700">lower R</text>
        <text x="454" y="164" fill="#0f766e" fontSize="18" fontWeight="700">higher R</text>
      </svg>,
      <>
        {metricCard("Length", `${formatSimulationNumber(length, 1)} m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Width", `${formatSimulationNumber(width, 1)} units`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Roughness", `${formatSimulationNumber(roughness, 1)} drag`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Resistance index", `${formatSimulationNumber(resistanceIndex, 2)} ohm-like`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Resistance is a route property.", "Longer paths increase resistance.", "Wider paths reduce resistance for the same material story."],
      "The route-drag board keeps the battery out of the resistance story so students attach resistance to path and material instead.",
    );
  }

  if (lessonKey === "M10_L5") {
    const voltage = clamp(simMetricMeters, 2, 18);
    const resistance = clamp(simDensityMass, 1, 12);
    const ohmicRoute = clamp(Math.round(simBias), 0, 1) === 1;
    const ohmicCurrent = voltage / resistance;
    const current = ohmicRoute ? ohmicCurrent : voltage / (resistance + 0.08 * voltage * voltage);
    return renderPanel(
      "Ohmic Route",
      <>
        {sliderField(
          "Voltage",
          `${formatSimulationNumber(voltage, 1)} V`,
          <input className="w-full" type="range" min="2" max="18" step="0.5" value={voltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Resistance",
          `${formatSimulationNumber(resistance, 1)} ohms`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistance} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Route type",
          ohmicRoute ? "ohmic" : "non-ohmic",
          <input className="w-full" type="range" min="0" max="1" step="1" value={ohmicRoute ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Rate-rule board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="28" width="572" height="184" rx="26" fill="#fefce8" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">An ohmic route follows the simple rate rule</text>
        <rect x="78" y="94" width="130" height="82" rx="22" fill="#bfdbfe" />
        <rect x="252" y="94" width="130" height="82" rx="22" fill="#fde68a" />
        <rect x="426" y="94" width="130" height="82" rx="22" fill="#bbf7d0" />
        <text x="112" y="128" fill="#1d4ed8" fontSize="18" fontWeight="700">V</text>
        <text x="102" y="154" fill="#1d4ed8" fontSize="16">boost</text>
        <text x="306" y="128" fill="#92400e" fontSize="18" fontWeight="700">R</text>
        <text x="284" y="154" fill="#92400e" fontSize="16">route drag</text>
        <text x="472" y="128" fill="#166534" fontSize="18" fontWeight="700">I</text>
        <text x="454" y="154" fill="#166534" fontSize="16">checkpoint rate</text>
      </svg>,
      <>
        {metricCard("Voltage", `${formatSimulationNumber(voltage, 1)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Resistance", `${formatSimulationNumber(resistance, 1)} ohms`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Current", `${formatSimulationNumber(current, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Route rule", ohmicRoute ? "I = V / R holds" : "simple proportion breaks", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["For an ohmic route, hold one quantity fixed while changing the other.", "Higher voltage gives higher current if resistance stays fixed.", "Higher resistance gives lower current if voltage stays fixed."],
      ohmicRoute
        ? `With this ohmic route, the simple rate rule gives ${formatSimulationNumber(ohmicCurrent, 2)} A from ${formatSimulationNumber(voltage, 1)} V and ${formatSimulationNumber(resistance, 1)} ohms.`
        : "This comparison keeps the idea honest: Ohm's law is the simple rule for ohmic routes, not an automatic rule for every possible element.",
    );
  }

  if (lessonKey === "M10_L6") {
    const sourceVoltage = clamp(simMetricMeters, 4, 18);
    const routeA = clamp(simDensityVolume, 1, 10);
    const routeB = clamp(simFluidDensity, 1, 10);
    const carrierCount = clamp(simDensityMass, 40, 120);
    const packetCharge = clamp(simSpread, 1, 5);
    const currentA = sourceVoltage / routeA;
    const currentB = sourceVoltage / routeB;
    const energyPerPacket = sourceVoltage * packetCharge;
    return renderPanel(
      "Loop Ledger",
      <>
        {sliderField(
          "Shared source voltage",
          `${formatSimulationNumber(sourceVoltage, 1)} V`,
          <input className="w-full" type="range" min="4" max="18" step="0.5" value={sourceVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Route A drag",
          `${formatSimulationNumber(routeA, 1)} ohms`,
          <input className="w-full" type="range" min="1" max="10" step="0.5" value={routeA} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
        {sliderField(
          "Route B drag",
          `${formatSimulationNumber(routeB, 1)} ohms`,
          <input className="w-full" type="range" min="1" max="10" step="0.5" value={routeB} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />,
        )}
        {sliderField(
          "Charge packet",
          `${formatSimulationNumber(packetCharge, 1)} C`,
          <input className="w-full" type="range" min="1" max="5" step="0.5" value={packetCharge} onChange={(e) => setSimSpread(Number(e.target.value))} />,
        )}
        {sliderField(
          "Carrier count",
          `${formatSimulationNumber(carrierCount, 0)} tokens`,
          <input className="w-full" type="range" min="40" max="120" step="5" value={carrierCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "Ledger board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="34" y="28" width="572" height="194" rx="26" fill="#eff6ff" />
        <text x="58" y="58" fill="#0f172a" fontSize="22" fontWeight="700">Same source, different route drag, different current</text>
        <rect x="78" y="86" width="120" height="98" rx="24" fill="#bfdbfe" />
        <rect x="242" y="86" width="150" height="98" rx="24" fill="#bbf7d0" />
        <rect x="430" y="86" width="150" height="98" rx="24" fill="#fecdd3" />
        <text x="104" y="132" fill="#1d4ed8" fontSize="18" fontWeight="700">shared source</text>
        <text x="110" y="160" fill="#1d4ed8" fontSize="16">{formatSimulationNumber(sourceVoltage, 1)} J/C</text>
        <text x="294" y="124" fill="#166534" fontSize="18" fontWeight="700">Loop A</text>
        <text x="274" y="152" fill="#166534" fontSize="16">drag {formatSimulationNumber(routeA, 1)} ohms</text>
        <text x="482" y="124" fill="#be123c" fontSize="18" fontWeight="700">Loop B</text>
        <text x="462" y="152" fill="#be123c" fontSize="16">drag {formatSimulationNumber(routeB, 1)} ohms</text>
      </svg>,
      <>
        {metricCard("Loop A current", `${formatSimulationNumber(currentA, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Loop B current", `${formatSimulationNumber(currentB, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Energy per packet", `${formatSimulationNumber(energyPerPacket, 1)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Ledger view", "charge, current, voltage, resistance stay separate", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Use the same-source comparison to break the 'battery gives the same current' myth.", "Track voltage as energy per charge and resistance as route drag.", "Current depends on the whole loop, not on the battery alone."],
      "The ledger view keeps the moving charge, the source boost, and the route drag on different lines so the electrical quantities do not collapse into one vague word.",
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      Each M10 lesson should own its electrical-quantities explorer directly. If you see this fallback, the M10 lesson key is missing a dedicated panel.
    </div>
  );
}
