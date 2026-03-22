"use client";

type UnknownRecord = Record<string, unknown>;

export type M15QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M15SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M15_ASSET_BASE = "/lesson_assets/M15";

const M15_VISUAL_META: Record<string, M15QuestionVisualMeta> = {
  M15L1: {
    image_url: `${M15_ASSET_BASE}/M15_L1/diagrams/m15-l1-star-vs-planet.svg`,
    visual_title: "Self-lit beacons differ from reflective worlds",
    visual_caption: "The comparison board keeps fusion-powered starlight separate from reflected light so students classify by cause, not appearance.",
    visual_callouts: [
      "A star makes its own light.",
      "A planet can look bright without being self-luminous.",
      "Fusion is the internal energy source for the beacon.",
    ],
  },
  M15L2: {
    image_url: `${M15_ASSET_BASE}/M15_L2/diagrams/m15-l2-stellar-lifecycle.svg`,
    visual_title: "Mass changes the later stellar path",
    visual_caption: "The lifecycle map keeps shared early stages and branched later endings on one board so not all stars collapse into one fate.",
    visual_callouts: [
      "Stars form in glow cradles and pass through a steady shining stage.",
      "Lower-mass and higher-mass stars do not share the same ending.",
      "Supernova, neutron-star, and black-hole ideas belong to the high-mass route.",
    ],
  },
  M15L3: {
    image_url: `${M15_ASSET_BASE}/M15_L3/diagrams/m15-l3-galaxy-milky-way.svg`,
    visual_title: "A galaxy is a gravity-bound beacon-city",
    visual_caption: "The Milky Way board separates one star, one Solar System, and one galaxy so scale and gravity stay readable together.",
    visual_callouts: [
      "A galaxy contains many stars, gas, and dust.",
      "Gravity holds the beacon-city together.",
      "The Solar System sits inside the Milky Way rather than equaling it.",
    ],
  },
  M15L4: {
    image_url: `${M15_ASSET_BASE}/M15_L4/diagrams/m15-l4-light-year-scale.svg`,
    visual_title: "Signal-years are distance markers, not time markers",
    visual_caption: "The scale ladder keeps nearby stars, wider Milky Way distances, and the meaning of one light-year on one distance board.",
    visual_callouts: [
      "A light-year is how far light travels in one year.",
      "Astronomy needs very large distance units.",
      "The unit answers how far, not how long.",
    ],
  },
  M15L5: {
    image_url: `${M15_ASSET_BASE}/M15_L5/diagrams/m15-l5-redshift-expansion.svg`,
    visual_title: "Expansion stretches traveling light to redder wavelengths",
    visual_caption: "The wavelength board keeps emitted light, stretched light, and the farther-city larger-redshift trend visible together.",
    visual_callouts: [
      "Redshift is a wavelength-stretch effect.",
      "Farther galaxies usually show larger redshift.",
      "The color shift is evidence for expansion, not just cooling.",
    ],
  },
  M15L6: {
    image_url: `${M15_ASSET_BASE}/M15_L6/diagrams/m15-l6-big-bang-timeline.svg`,
    visual_title: "The Great Unfurling is expansion of space itself",
    visual_caption: "The final board pairs a hot dense early state with expanding-space geometry and redshift evidence so the Big Bang is not mistaken for an ordinary explosion from one point.",
    visual_callouts: [
      "The early universe is modeled as hot and dense.",
      "Space itself expands in the modern picture.",
      "Redshift evidence supports the expansion story.",
    ],
  },
};

export function m15QuestionVisualMeta(itemId: string): M15QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M15L[1-6])_[A-Z]+\d+$/);
  return match ? M15_VISUAL_META[match[1]] : undefined;
}

const M15_SIMULATION_COPY: Record<string, M15SimulationCopy> = {
  M15_L1: {
    title: "Beacon light lab",
    instructions: "Compare self-lit and reflective objects on one board so the star definition stays tied to the source of the light.",
    taskPrompt: "Switch between a fusion-powered beacon and a reflective world, then explain why brightness alone is too weak to classify an object as a star.",
    exploreSteps: [
      "Start with one clearly self-lit star case.",
      "Swap to a reflective world with similar apparent brightness.",
      "Toggle fusion off and check which classification survives.",
    ],
    watchFor: [
      "Self-produced light is the defining clue for a star.",
      "Reflected light can still look bright.",
      "Fusion is the internal source that keeps the beacon shining.",
    ],
    tryFirst: "Make the star and planet appear similarly bright, then ask where each one gets its light. The cause should separate them immediately.",
    takeaway: "Stars are self-lit beacons; planets are usually visible because they reflect starlight.",
  },
  M15_L2: {
    title: "Star path lab",
    instructions: "Keep mass, life stage, and remnant on one board so the stellar lifecycle stays causal rather than list-like.",
    taskPrompt: "Change stellar mass, follow the later path, and explain why some stars end as white dwarfs while more massive ones can end in supernovae, neutron stars, or black holes.",
    exploreSteps: [
      "Start from a glow cradle and young spark stage.",
      "Move one low-mass star to its later stages.",
      "Raise the mass and compare the new branch and remnant.",
    ],
    watchFor: [
      "Many stars share an early path before branching later.",
      "Mass is the main variable changing the later route.",
      "Not all stars follow the blast-bloom ending.",
    ],
    tryFirst: "Compare one obviously low-mass star with one clearly high-mass star. The difference in ending should be more obvious than memorizing every stage name first.",
    takeaway: "The stellar lifecycle is strongest as a mass-shaped branch, not one universal fate.",
  },
  M15_L3: {
    title: "Beacon-city builder",
    instructions: "Switch between one star, one Solar System, and one galaxy map so the Milky Way scale story stays organized.",
    taskPrompt: "Place the Sun inside the Milky Way and explain why a galaxy is a gravity-bound beacon-city rather than one star or the whole universe.",
    exploreSteps: [
      "Start with a single beacon.",
      "Zoom out to a galaxy map and place the Sun marker.",
      "Compare star scale with galaxy scale before naming the Milky Way.",
    ],
    watchFor: [
      "A galaxy contains many stars, gas, and dust.",
      "Gravity is the reason the city counts as one system.",
      "The Solar System belongs inside the Milky Way.",
    ],
    tryFirst: "Show the Sun first, then zoom out until it becomes only one marked point inside the spiral city. That scale jump is the key idea.",
    takeaway: "The Milky Way is our home galaxy, not our Solar System and not the whole universe.",
  },
  M15_L4: {
    title: "Signal-year scale lab",
    instructions: "Keep cosmic distances on a single scale board so a light-year reads as distance from the beginning.",
    taskPrompt: "Compare kilometer-sized intuition with light-year-sized astronomy distances, then explain why a light-year is used and why it is not a time unit.",
    exploreSteps: [
      "Start with a nearby star comparison.",
      "Move outward to a much wider Milky Way distance.",
      "Use the definition of one light-year to explain the unit.",
    ],
    watchFor: [
      "A light-year measures distance.",
      "Astronomy uses it because the distances are enormous.",
      "The phrase includes year only because light travels for that duration.",
    ],
    tryFirst: "Read the definition of one light-year first, then test whether it answers how far or how long. That clears the unit type before the big numbers arrive.",
    takeaway: "A light-year is a distance marker chosen for very large astronomy scales.",
  },
  M15_L5: {
    title: "Stretch-red drift lab",
    instructions: "Keep emitted and observed wavelength bars on one board so redshift stays a stretch effect, not a vague color label.",
    taskPrompt: "Increase the map stretch, compare emitted and observed light, and explain why farther beacon-cities usually show larger redshifts.",
    exploreSteps: [
      "Start with a small stretch and compare the wavelength bars.",
      "Increase the stretch for a farther city.",
      "Rank near and far galaxies by likely redshift.",
    ],
    watchFor: [
      "Expansion stretches the wavelength during travel.",
      "Redder observed light means a longer wavelength.",
      "Farther galaxies usually show the larger stretch-red drift.",
    ],
    tryFirst: "Compare one nearby city and one farther city with the same emitted light. The farther one should end with the larger redshift.",
    takeaway: "Cosmological redshift is a wavelength-stretch clue that the universe is expanding.",
  },
  M15_L6: {
    title: "Great Unfurling evidence lab",
    instructions: "Keep model language and evidence together so the Big Bang is understood as expanding space rather than as a simple explosion into emptiness.",
    taskPrompt: "Compare a hot dense early-state picture with a redshift trend across galaxies, then explain why the Big Bang model is stronger as an expanding-universe story.",
    exploreSteps: [
      "Start with the hot dense early-state caption.",
      "Turn on the galaxy redshift evidence panel.",
      "Compare an expanding-space explanation with a center-explosion explanation.",
    ],
    watchFor: [
      "The Big Bang model describes an early hot dense universe.",
      "Space itself expands in the model.",
      "Distance-redshift evidence supports expansion.",
    ],
    tryFirst: "Switch between the two captions while keeping the same redshift evidence visible. Only one description should keep the geometry and evidence aligned.",
    takeaway: "The Big Bang is best understood as cosmic expansion from an early hot dense state, supported by redshift evidence.",
  },
};

export function m15SimulationCopy(code: string): M15SimulationCopy | undefined {
  return M15_SIMULATION_COPY[code];
}

export function m15ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M15_L1":
      return ["Ask where the light comes from before classifying the object.", "Keep brightness separate from light source.", "Use fusion as the internal star clue."];
    case "M15_L2":
      return ["Read the life path as a branch, not a flat chain.", "Use mass to choose the later route.", "Keep low-mass and high-mass endings distinct."];
    case "M15_L3":
      return ["Separate star, Solar System, galaxy, and universe scales.", "Keep gravity in the galaxy definition.", "Place the Sun inside the Milky Way, not equal to it."];
    case "M15_L4":
      return ["Use light-year as a distance unit.", "Tie the unit to huge scale, not to timekeeping.", "Compare distances before worrying about exact numbers."];
    case "M15_L5":
      return ["Treat redshift as wavelength stretching.", "Compare near and far galaxies qualitatively.", "Do not turn redshift into just a color-name fact."];
    case "M15_L6":
      return ["Use expanding-space language rather than center-explosion language.", "Connect the model to evidence.", "Keep hot dense early-state language visible."];
    default:
      return [];
  }
}

export function m15ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M15_L1":
      return ["Stars are luminous bodies.", "Fusion in the core powers starlight.", "Planets and moons usually reflect starlight rather than producing it."];
    case "M15_L2":
      return ["Stars form in nebulae and protostars.", "Main-sequence stars are the long steady stage.", "Stellar mass changes the later path and remnant."];
    case "M15_L3":
      return ["A galaxy is a gravity-bound system of stars, gas, and dust.", "The Milky Way is our home galaxy.", "The Solar System is one tiny part of the Milky Way."];
    case "M15_L4":
      return ["A light-year is a distance unit.", "It is the distance light travels in one year.", "It is useful because cosmic distances are enormous."];
    case "M15_L5":
      return ["Redshift means light is observed at longer wavelengths.", "Cosmological redshift is tied to expansion of space.", "Farther galaxies usually show larger redshifts."];
    case "M15_L6":
      return ["The Big Bang model describes an early hot dense universe.", "The universe expands over time.", "Redshift evidence supports the expansion model."];
    default:
      return [];
  }
}

export function m15ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M15_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [
    {
      kind: "visual",
      title: visual.visual_title,
      caption: visual.visual_caption,
      image_url: visual.image_url,
      highlights: visual.visual_callouts,
    },
  ];
}

export function m15ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M15_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    M15_L1: "Use the star-versus-planet visual to explain why astronomy should classify by light source rather than apparent brightness.",
    M15_L2: "Use the stellar lifecycle visual to explain why mass makes the later star path branch.",
    M15_L3: "Use the Milky Way beacon-city visual to explain why a galaxy is more than one star and less than the whole universe.",
    M15_L4: "Use the signal-year scale visual to explain why a light-year answers a distance question, not a time question.",
    M15_L5: "Use the redshift visual to explain why stretching space makes the arriving light redder.",
    M15_L6: "Use the Great Unfurling visual to explain why the Big Bang is better described as expanding space than as a simple explosion from one point.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the Beacon-City Stretchmap visual to explain the lesson's key universe idea.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
