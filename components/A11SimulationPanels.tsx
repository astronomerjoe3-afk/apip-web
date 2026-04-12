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

export default function A11SimulationPanels({
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
  if (lessonKey === "A11_L1") {
    const massRatio = clamp(simDensityMass, 0.5, 4);
    const planetRadius = clamp(simDensityVolume, 0.6, 2.0);
    const altitude = clamp(simMetricMeters, 0, 4);
    const r = planetRadius + altitude;
    const g = 9.81 * massRatio / (r * r);
    const v = -(6.25e7 * massRatio / r);
    const escape = Math.abs(v);
    return renderPanel(
      "Gravity landscape",
      <>
        {sliderField("Planet mass", `${formatSimulationNumber(massRatio, 2)} Earth masses`, <input className="w-full" type="range" min="0.5" max="4" step="0.05" value={massRatio} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Planet radius", `${formatSimulationNumber(planetRadius, 2)} Earth radii`, <input className="w-full" type="range" min="0.6" max="2" step="0.02" value={planetRadius} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Altitude above surface", `${formatSimulationNumber(altitude, 2)} planet radii`, <input className="w-full" type="range" min="0" max="4" step="0.05" value={altitude} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Field and potential map",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#eff6ff" />
        <circle cx="170" cy="125" r={34 + planetRadius * 28} fill="#2563eb" opacity="0.9" />
        <circle cx={340 + altitude * 45} cy="125" r="12" fill="#f59e0b" />
        <line x1="520" y1="70" x2="520" y2="180" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
        <path d={`M ${340 + altitude * 45} 125 L ${260 + altitude * 14} 125`} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points={`${256 + altitude * 14},125 ${274 + altitude * 14},115 ${274 + altitude * 14},135`} fill="#0f172a" />
        <text x="56" y="54" fill="#0f172a" fontSize="20" fontWeight="700">Same source, same radius scale, but g and V answer different questions</text>
        <text x="450" y="62" fill="#334155" fontSize="16">potential well</text>
        <text x="345" y="103" fill="#0f172a" fontSize="16">local field pull</text>
      </svg>,
      <>
        {metricCard("g at probe", `${formatSimulationNumber(g, 2)} N/kg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("V at probe", `${formatSimulationNumber(v / 1e7, 2)} x10^7 J/kg`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Escape energy per kg", `${formatSimulationNumber(escape / 1e7, 2)} x10^7 J/kg`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Field trend", g > 8 ? "steep near source" : "shallower farther out", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Field strength is force per kilogram.", "Potential is energy per kilogram measured from infinity.", "Moving outward makes potential less negative but also weakens the field."],
      "Keep source mass and radius fixed while you compare g with V. Doubling the test mass would change force, but not the field or the potential map itself.",
    );
  }

  if (lessonKey === "A11_L2") {
    const massRatio = clamp(simDensityMass, 0.6, 2.0);
    const orbitRadius = clamp(simMetricMeters, 1.1, 7.0);
    const orbitType = String(Math.round(clamp(simVectorAngle, 0, 2)));
    const speed = 7900 * Math.sqrt(massRatio / orbitRadius);
    const periodHours = 1.4 * Math.sqrt((orbitRadius ** 3) / massRatio);
    const coverage = orbitType === "2" ? "global sweep" : orbitRadius > 5 ? "fixed-region watch" : "fast revisit";
    return renderPanel(
      "Orbit and mission",
      <>
        {sliderField("Planet mass", `${formatSimulationNumber(massRatio, 2)} Earth masses`, <input className="w-full" type="range" min="0.6" max="2" step="0.02" value={massRatio} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Orbital radius", `${formatSimulationNumber(orbitRadius, 2)} Earth radii`, <input className="w-full" type="range" min="1.1" max="7" step="0.05" value={orbitRadius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        <label className="mt-4 block">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
            <span>Orbit style</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">{orbitType === "2" ? "polar" : orbitRadius > 5 ? "geostationary-like" : "low orbit"}</span>
          </div>
          <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={orbitType} onChange={(e) => setSimVectorAngle(Number(e.target.value))}>
            <option value="0">Low orbit</option>
            <option value="1">Geostationary-like</option>
            <option value="2">Polar mapping orbit</option>
          </select>
        </label>
      </>,
      "Orbit board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#ecfeff" />
        <circle cx="220" cy="125" r="42" fill="#0ea5e9" />
        <ellipse cx="220" cy="125" rx={72 + orbitRadius * 20} ry={orbitType === "2" ? 92 : 62} fill="none" stroke="#1d4ed8" strokeWidth="6" strokeDasharray={orbitType === "2" ? "14 10" : "0"} />
        <circle cx={220 + orbitRadius * 20} cy="125" r="12" fill="#f97316" />
        <text x="52" y="52" fill="#0f172a" fontSize="20" fontWeight="700">Altitude and orbit plane set both the mechanics and the observation role</text>
        <text x="420" y="105" fill="#0f172a" fontSize="16">{orbitType === "2" ? "polar track" : orbitRadius > 5 ? "fixed-sky communication arc" : "low-orbit detail pass"}</text>
      </svg>,
      <>
        {metricCard("Orbital speed", `${formatSimulationNumber(speed / 1000, 2)} km/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Period", `${formatSimulationNumber(periodHours, 2)} h`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Coverage style", coverage, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Mechanics check", orbitRadius > 5 ? "slow, long-period orbit" : "fast, short-period orbit", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Gravity is the centripetal pull.", "Higher orbit means lower speed and longer period.", "Mission role depends on altitude and orbit plane, not label alone."],
      "Compare low orbit with geostationary-like and polar choices. A good A11 answer explains both the motion and the observation tradeoff in one sentence.",
    );
  }

  if (lessonKey === "A11_L3") {
    const lambdaNm = clamp(simMetricMeters, 250, 900);
    const radiusSolar = clamp(simDensityMass, 0.01, 80);
    const t = 2.9e6 / lambdaNm;
    const luminositySolar = (radiusSolar ** 2) * ((t / 5800) ** 4);
    const region = radiusSolar < 0.05 ? "white dwarf side" : t < 5000 && luminositySolar > 20 ? "giant region" : "main sequence band";
    return renderPanel(
      "Spectrum and H-R",
      <>
        {sliderField("Peak wavelength", `${formatSimulationNumber(lambdaNm, 0)} nm`, <input className="w-full" type="range" min="250" max="900" step="5" value={lambdaNm} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Radius", `${formatSimulationNumber(radiusSolar, 2)} solar radii`, <input className="w-full" type="range" min="0.01" max="80" step="0.01" value={radiusSolar} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Spectrum and H-R board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#fff7ed" />
        <rect x="48" y="74" width="230" height="24" rx="12" fill="url(#gradA11)" />
        <line x1="110" y1="74" x2="110" y2="98" stroke="#0f172a" strokeWidth="4" />
        <line x1="170" y1="74" x2="170" y2="98" stroke="#0f172a" strokeWidth="4" />
        <line x1="235" y1="74" x2="235" y2="98" stroke="#0f172a" strokeWidth="4" />
        <rect x="350" y="60" width="220" height="140" rx="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
        <circle cx={520 - (t - 3000) / 35} cy={180 - Math.min(Math.log10(Math.max(luminositySolar, 0.02)) * 30, 100)} r="10" fill="#0ea5e9" />
        <text x="54" y="52" fill="#0f172a" fontSize="20" fontWeight="700">Spectrum anchors temperature first; H-R position adds luminosity and stage</text>
        <text x="380" y="214" fill="#475569" fontSize="14">hotter left</text>
        <defs>
          <linearGradient id="gradA11" x1="0" x2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>,
      <>
        {metricCard("Surface temperature", `${formatSimulationNumber(t, 0)} K`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Luminosity", `${formatSimulationNumber(luminositySolar, 2)} Lsun`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("H-R region", region, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Reading rule", lambdaNm < 500 ? "shorter lambda => hotter" : "longer lambda => cooler", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Use Wien's law for temperature.", "Use radius and temperature together for luminosity.", "Then decide whether the point behaves like main sequence, giant, or white dwarf."],
      "A11_L3 is strongest when you do not memorize the H-R region in isolation. Read the spectrum, calculate temperature, then use luminosity and radius to justify the region.",
    );
  }

  if (lessonKey === "A11_L4") {
    const parallax = clamp(simMetricMeters, 0.01, 1.0);
    const luminosity = clamp(simDensityMass, 0.1, 200);
    const brightness = clamp(simFluidDensity, 0.0001, 1.0);
    const parallaxDistance = 1 / parallax;
    const candleDistance = Math.sqrt(luminosity / brightness);
    return renderPanel(
      "Distance ladder",
      <>
        {sliderField("Parallax angle", `${formatSimulationNumber(parallax, 3)} arcsec`, <input className="w-full" type="range" min="0.01" max="1" step="0.01" value={parallax} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Standard-candle luminosity", `${formatSimulationNumber(luminosity, 1)} relative`, <input className="w-full" type="range" min="0.1" max="200" step="0.1" value={luminosity} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Apparent brightness", `${formatSimulationNumber(brightness, 4)} relative`, <input className="w-full" type="range" min="0.0001" max="1" step="0.0001" value={brightness} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Distance ladder board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#f8fafc" />
        <line x1="110" y1="56" x2="110" y2="194" stroke="#0f172a" strokeWidth="8" />
        <line x1="510" y1="56" x2="510" y2="194" stroke="#0f172a" strokeWidth="8" />
        <line x1="110" y1="94" x2="510" y2="94" stroke="#94a3b8" strokeWidth="6" />
        <line x1="110" y1="148" x2="510" y2="148" stroke="#94a3b8" strokeWidth="6" />
        <text x="146" y="88" fill="#0f172a" fontSize="18">parallax rung</text>
        <text x="146" y="142" fill="#0f172a" fontSize="18">standard-candle rung</text>
        <text x="54" y="52" fill="#0f172a" fontSize="20" fontWeight="700">Choose the rung by scale, then use the right relation</text>
      </svg>,
      <>
        {metricCard("Parallax distance", `${formatSimulationNumber(parallaxDistance, 1)} pc`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Candle distance", `${formatSimulationNumber(candleDistance, 1)} relative units`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Best rung", parallax > 0.05 ? "nearby-star geometry" : "move to brighter-distance indicators", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Reasoning check", brightness < 0.01 ? "dim may mean far or low L" : "apparent brightness alone is not enough", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Parallax is best nearby.", "Standard candles need known luminosity.", "Distance ladders exist because one method does not span every scale."],
      "A strong answer says why parallax stops helping, not just that astronomers 'switch methods'. Scale is the reason the ladder exists.",
    );
  }

  if (lessonKey === "A11_L5") {
    const initialMass = clamp(simDensityMass, 0.8, 30);
    const remnantMass = clamp(simVectorMagnitude, 0.6, 5.0);
    const remnantRadiusKm = clamp(simMetricMeters, 5, 20000);
    const schwarzschildKm = 2.95 * remnantMass;
    const pathway = initialMass < 8 ? "white-dwarf path" : initialMass < 20 ? "neutron-star path" : "black-hole path";
    const objectType = remnantRadiusKm < schwarzschildKm ? "black hole" : remnantRadiusKm < 20 ? "neutron star" : "white dwarf";
    return renderPanel(
      "Stellar fate and compact objects",
      <>
        {sliderField("Initial stellar mass", `${formatSimulationNumber(initialMass, 1)} Msun`, <input className="w-full" type="range" min="0.8" max="30" step="0.1" value={initialMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Remnant mass", `${formatSimulationNumber(remnantMass, 2)} Msun`, <input className="w-full" type="range" min="0.6" max="5" step="0.02" value={remnantMass} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Remnant radius", `${formatSimulationNumber(remnantRadiusKm, 0)} km`, <input className="w-full" type="range" min="5" max="20000" step="5" value={remnantRadiusKm} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Lifecycle and collapse board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#f8fafc" />
        <circle cx="120" cy="125" r="30" fill="#fde68a" />
        <path d="M160 125H300" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <polygon points="314,125 296,115 296,135" fill="#0f172a" />
        <circle cx="380" cy="125" r={Math.max(8, Math.min(42, remnantRadiusKm / 400))} fill={objectType === "black hole" ? "#020617" : objectType === "neutron star" ? "#475569" : "#cbd5e1"} />
        <text x="50" y="52" fill="#0f172a" fontSize="20" fontWeight="700">Initial mass sets the pathway; radius versus Rs tests the black-hole condition</text>
        <text x="340" y="188" fill="#334155" fontSize="16">{objectType}</text>
      </svg>,
      <>
        {metricCard("Likely pathway", pathway, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Rs threshold", `${formatSimulationNumber(schwarzschildKm, 2)} km`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Object class", objectType, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Lifetime clue", initialMass > 8 ? "massive stars burn faster" : "lower-mass stars live longer", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Initial mass decides the branch.", "More extreme collapse means more compact remnants.", "A black hole needs the actual radius to sit inside the Schwarzschild radius."],
      "Keep the narrative and the calculation together. A11_L5 is not just a list of remnants; it is a mass-dependent collapse story with a radius threshold test.",
    );
  }

  if (lessonKey === "A11_L6") {
    const emittedNm = clamp(simMetricMeters, 350, 700);
    const observedNm = clamp(simVectorMagnitude, 350, 950);
    const h0 = clamp(simFluidDensity, 60, 80);
    const z = (observedNm - emittedNm) / emittedNm;
    const speed = z * 3e5;
    const distance = speed / h0;
    const cosmologyNote = simBias > 0.6 ? "accelerated expansion language visible" : "simple Hubble trend only";
    return renderPanel(
      "Redshift and cosmology",
      <>
        {sliderField("Emitted wavelength", `${formatSimulationNumber(emittedNm, 0)} nm`, <input className="w-full" type="range" min="350" max="700" step="5" value={emittedNm} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Observed wavelength", `${formatSimulationNumber(observedNm, 0)} nm`, <input className="w-full" type="range" min="350" max="950" step="5" value={observedNm} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Hubble constant", `${formatSimulationNumber(h0, 0)} km/s/Mpc`, <input className="w-full" type="range" min="60" max="80" step="1" value={h0} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Dark-energy emphasis", `${formatSimulationNumber(clamp(simBias, 0, 1), 2)}`, <input className="w-full" type="range" min="0" max="1" step="0.01" value={clamp(simBias, 0, 1)} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Cosmology board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="20" width="600" height="210" rx="28" fill="#eef2ff" />
        <line x1="80" y1="88" x2="280" y2="88" stroke="#0f172a" strokeWidth="6" />
        <line x1="80" y1="150" x2="340" y2="150" stroke="#2563eb" strokeWidth="6" />
        <circle cx="450" cy="125" r="22" fill="#7c3aed" />
        <path d="M 470 125 C 520 102, 560 92, 590 92" stroke="#7c3aed" strokeWidth="6" fill="none" />
        <text x="46" y="54" fill="#0f172a" fontSize="20" fontWeight="700">Compare emitted and observed line positions before you claim expansion</text>
        <text x="84" y="77" fill="#0f172a" fontSize="16">emitted</text>
        <text x="84" y="139" fill="#2563eb" fontSize="16">observed</text>
      </svg>,
      <>
        {metricCard("Redshift z", `${formatSimulationNumber(z, 3)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Recession speed", `${formatSimulationNumber(speed, 0)} km/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Hubble distance", `${formatSimulationNumber(distance, 1)} Mpc`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Model note", cosmologyNote, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Start with the line shift, not the color word.", "Then move from z to v to d.", "Dark energy is the modern extension used for accelerated expansion."],
      "A rigorous A11_L6 answer uses the evidence chain explicitly: same line, longer wavelength, positive redshift, recession estimate, then Hubble trend and cosmology meaning.",
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      Use the lesson board and the prompts above to compare the astrophysics quantities before you continue.
    </div>
  );
}
