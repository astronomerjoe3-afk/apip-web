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

type SimulationPanelMeta = {
  src: string;
  title: string;
  description: string;
  checks: string[];
  note: string;
};

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

const PANEL_META: Record<string, SimulationPanelMeta> = {
  M13_L1: {
    src: "/lesson_assets/M14/M14_L1/simulations/m14_solar_court_sort_lab/index.html",
    title: "Earth-Moon-Sun system explorer",
    description:
      "Use the linked-system sim to keep main host body, orbit path, and the gravity-organized family on the same board.",
    checks: [
      "Earth mainly orbits the Sun while the Moon mainly orbits Earth.",
      "One shared system picture should explain several sky observations at once.",
      "Gravity is the organizing rule, not a list of disconnected facts.",
    ],
    note:
      "This sim remaps M13 onto the Earth-and-Solar-System interaction set so the lesson stops inheriting the old atomic module tools.",
  },
  M13_L2: {
    src: "/lesson_assets/M14/M14_L2/simulations/m14_hub_pull_routes_lab/index.html",
    title: "Orbit route explorer",
    description:
      "Use the orbit sim to test inward gravitational pull and sideways motion together instead of treating orbit as a force-free drift.",
    checks: [
      "Ask what would happen without gravity before naming the final orbit.",
      "Track how the inward pull bends the motion continuously.",
      "Compare smaller and larger orbits without losing the period idea.",
    ],
    note:
      "The important habit here is to keep curved motion, inward pull, and orbital period in one explanation.",
  },
  M13_L3: {
    src: "/lesson_assets/M14/M14_L3/simulations/m14_spin_for_daylight_lab/index.html",
    title: "Day-night rotation explorer",
    description:
      "Use the rotating-Earth sim to follow one location from darkness into sunlight and back again while keeping yearly orbit out of the explanation.",
    checks: [
      "Half of Earth is lit at any moment and half is dark.",
      "Day and night are caused by rotation, not by Earth moving nearer or farther from the Sun.",
      "One day belongs to one spin of Earth.",
    ],
    note:
      "If a location changes from night to day in the sim, the explanation should mention rotation first and orbit second or not at all.",
  },
  M13_L4: {
    src: "/lesson_assets/M14/M14_L4/simulations/m14_season_switch_lab/index.html",
    title: "Seasons and tilt explorer",
    description:
      "Use the seasons sim to compare opposite orbital positions while keeping the axis tilt fixed in space.",
    checks: [
      "Opposite hemispheres lean toward the Sun at different times of year.",
      "Sunlight angle, not Earth-Sun distance, is the main seasonal cause.",
      "The axis direction stays fixed as Earth orbits.",
    ],
    note:
      "A strong answer after this sim should compare hemispheres directly instead of giving a one-hemisphere slogan.",
  },
  M13_L5: {
    src: "/lesson_assets/M14/M14_L5/simulations/m14_moon_face_challenge_lab/index.html",
    title: "Moon phases and eclipses explorer",
    description:
      "Use the Moon geometry sim to separate the always-lit half, the Earth viewpoint, and the rarer eclipse alignment.",
    checks: [
      "The Sun lights half of the Moon all month.",
      "Phases change because our viewing angle changes.",
      "Eclipses need a special shadow line-up and are not the normal phase cause.",
    ],
    note:
      "This sim is here to stop the common mistake of explaining every Moon phase as Earth shadow.",
  },
  M13_L6: {
    src: "/lesson_assets/M14/M14_L6/simulations/m14_outer_lap_puzzle_lab/index.html",
    title: "Solar System scale explorer",
    description:
      "Use the Solar System scale sim to compare orbit size, orbital period, and body type without reading the sketch as literal spacing.",
    checks: [
      "Farther orbits usually mean longer years.",
      "Planets, moons, and smaller bodies must be sorted by role and main host.",
      "Classroom diagrams compress the real distances heavily.",
    ],
    note:
      "The diagram is a model, not a scale drawing. The explanation should keep family structure and scale compression separate.",
  },
};

export default function M13SimulationPanels({ lessonKey }: Props) {
  const panel = PANEL_META[lessonKey];
  if (!panel) return null;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{panel.title}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-700">{panel.description}</p>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">What To Check</h4>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700">
            {panel.checks.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
            {panel.note}
          </div>
        </div>
      </div>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">Interactive Board</h4>
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <iframe
            key={panel.src}
            title={panel.title}
            src={panel.src}
            className="h-[640px] w-full bg-white"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
