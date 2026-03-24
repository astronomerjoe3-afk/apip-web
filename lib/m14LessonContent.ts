"use client";

type UnknownRecord = Record<string, unknown>;

export type M14QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M14SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M14_ASSET_BASE = "/lesson_assets/M14";

const M14_VISUAL_META: Record<string, M14QuestionVisualMeta> = {
  M14L1: {
    image_url: `${M14_ASSET_BASE}/M14_L1/diagrams/m14-l1-star-vs-planet.svg`,
    visual_title: "Self-luminous stars differ from reflective planets",
    visual_caption: "The comparison board keeps fusion-powered starlight separate from reflected light so learners classify by source, not appearance.",
    visual_callouts: [
      "A star makes its own light.",
      "A planet can look bright without being self-luminous.",
      "Fusion is the internal energy source for a star.",
    ],
  },
  M14L2: {
    image_url: `${M14_ASSET_BASE}/M14_L2/diagrams/m14-l2-stellar-lifecycle.svg`,
    visual_title: "Stellar mass changes the later life cycle",
    visual_caption: "The lifecycle map keeps shared early stages and branched later endings on one board so not all stars collapse into one fate.",
    visual_callouts: [
      "Stars form in nebulae and pass through a main-sequence stage.",
      "Lower-mass and higher-mass stars do not share the same ending.",
      "Supernova, neutron-star, and black-hole ideas belong to the high-mass route.",
    ],
  },
  M14L3: {
    image_url: `${M14_ASSET_BASE}/M14_L3/diagrams/m14-l3-galaxy-milky-way.svg`,
    visual_title: "A galaxy is a gravitationally bound system",
    visual_caption: "The Milky Way board separates one star, one Solar System, and one galaxy so scale and gravity stay readable together.",
    visual_callouts: [
      "A galaxy contains many stars, gas, and dust.",
      "Gravity holds the galaxy together.",
      "The Solar System sits inside the Milky Way rather than equaling it.",
    ],
  },
  M14L4: {
    image_url: `${M14_ASSET_BASE}/M14_L4/diagrams/m14-l4-light-year-scale.svg`,
    visual_title: "Light-years are distance units, not time units",
    visual_caption: "The scale ladder keeps nearby stars, wider Milky Way distances, and the meaning of one light-year on one distance board.",
    visual_callouts: [
      "A light-year is how far light travels in one year.",
      "Astronomy needs very large distance units.",
      "The unit answers how far, not how long.",
    ],
  },
  M14L5: {
    image_url: `${M14_ASSET_BASE}/M14_L5/diagrams/m14-l5-redshift-expansion.svg`,
    visual_title: "Expansion stretches light to longer wavelengths",
    visual_caption: "The wavelength board keeps emitted light, stretched light, and the farther-galaxy larger-redshift trend visible together.",
    visual_callouts: [
      "Redshift is a wavelength-stretch effect.",
      "Farther galaxies usually show larger redshift.",
      "The color shift is evidence for expansion, not just cooling.",
    ],
  },
  M14L6: {
    image_url: `${M14_ASSET_BASE}/M14_L6/diagrams/m14-l6-big-bang-timeline.svg`,
    visual_title: "The Big Bang model describes the expansion of space",
    visual_caption: "The final board pairs a hot dense early state with expanding-space geometry and redshift evidence so the Big Bang is not mistaken for an ordinary explosion from one point.",
    visual_callouts: [
      "The early universe is modeled as hot and dense.",
      "Space itself expands in the modern picture.",
      "Redshift evidence supports the expansion story.",
    ],
  },
};

export function m14QuestionVisualMeta(itemId: string): M14QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M14L[1-6])_[A-Z]+\d+$/);
  return match ? M14_VISUAL_META[match[1]] : undefined;
}

const M14_SIMULATION_COPY: Record<string, M14SimulationCopy> = {
  M14_L1: {
    title: "Star and planet classification lab",
    instructions: "Compare self-luminous and reflective objects on one board so the star definition stays tied to the source of the light.",
    taskPrompt: "Switch between a fusion-powered star and a reflective planet, then explain why brightness alone is too weak to classify an object as a star.",
    exploreSteps: [
      "Start with one clearly self-luminous star case.",
      "Swap to a reflective planet with similar apparent brightness.",
      "Reduce the fusion level and check which classification still makes sense.",
    ],
    watchFor: [
      "Self-produced light is the defining clue for a star.",
      "Reflected light can still look bright.",
      "Fusion is the internal source that keeps a star shining.",
    ],
    tryFirst: "Make the star and planet appear similarly bright, then ask where each one gets its light. The cause should separate them immediately.",
    takeaway: "Stars are self-luminous; planets are usually visible because they reflect starlight.",
  },
  M14_L2: {
    title: "Stellar lifecycle lab",
    instructions: "Keep mass, life stage, and remnant on one board so the stellar lifecycle stays causal rather than list-like.",
    taskPrompt: "Change stellar mass, follow the later path, and explain why some stars end as white dwarfs while more massive ones can end in supernovae, neutron stars, or black holes.",
    exploreSteps: [
      "Start from a nebula and protostar stage.",
      "Move one low-mass star to its later stages.",
      "Raise the mass and compare the new branch and remnant.",
    ],
    watchFor: [
      "Many stars share an early path before branching later.",
      "Mass is the main variable changing the later route.",
      "Not all stars follow the supernova ending.",
    ],
    tryFirst: "Compare one obviously low-mass star with one clearly high-mass star. The difference in ending should be more obvious than memorizing every stage name first.",
    takeaway: "The stellar lifecycle is strongest as a mass-dependent branch, not one universal fate.",
  },
  M14_L3: {
    title: "Milky Way scale lab",
    instructions: "Switch between one star, one Solar System, and one galaxy map so the Milky Way scale story stays organized.",
    taskPrompt: "Place the Sun inside the Milky Way and explain why a galaxy is a gravitationally bound system rather than one star or the whole universe.",
    exploreSteps: [
      "Start with a single star.",
      "Zoom out to a galaxy map and place the Sun marker.",
      "Compare star scale with galaxy scale before naming the Milky Way.",
    ],
    watchFor: [
      "A galaxy contains many stars, gas, and dust.",
      "Gravity is the reason the galaxy counts as one system.",
      "The Solar System belongs inside the Milky Way.",
    ],
    tryFirst: "Show the Sun first, then zoom out until it becomes only one marked point inside the Milky Way. That scale jump is the key idea.",
    takeaway: "The Milky Way is our home galaxy, not our Solar System and not the whole universe.",
  },
  M14_L4: {
    title: "Light-year scale lab",
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
  M14_L5: {
    title: "Redshift evidence lab",
    instructions: "Keep emitted and observed wavelength bars on one board so redshift stays a stretch effect, not a vague color label.",
    taskPrompt: "Increase the stretch, compare emitted and observed light, and explain why farther galaxies usually show larger redshifts.",
    exploreSteps: [
      "Start with a small stretch and compare the wavelength bars.",
      "Increase the stretch for a farther galaxy.",
      "Rank nearby and distant galaxies by likely redshift.",
    ],
    watchFor: [
      "Expansion stretches the wavelength during travel.",
      "Redder observed light means a longer wavelength.",
      "Farther galaxies usually show the larger redshift.",
    ],
    tryFirst: "Compare one nearby galaxy and one farther galaxy with the same emitted light. The farther one should end with the larger redshift.",
    takeaway: "Cosmological redshift is a wavelength-stretch clue that the universe is expanding.",
  },
  M14_L6: {
    title: "Big Bang evidence lab",
    instructions: "Keep model language and evidence together so the Big Bang is understood as expanding space rather than as a simple explosion into emptiness.",
    taskPrompt: "Compare a hot dense early-state picture with a redshift trend across galaxies, then explain why the Big Bang model is stronger as an expanding-universe story.",
    exploreSteps: [
      "Start with the hot dense early-state caption.",
      "Turn on the galaxy redshift evidence panel.",
      "Compare an expanding-space explanation with an explosion explanation.",
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

export function m14SimulationCopy(code: string): M14SimulationCopy | undefined {
  return M14_SIMULATION_COPY[code];
}

export function m14ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M14_L1":
      return ["Ask where the light comes from before classifying the object.", "Keep brightness separate from light source.", "Use fusion as the internal clue for a star."];
    case "M14_L2":
      return ["Read the lifecycle as a branch, not a flat chain.", "Use mass to choose the later route.", "Keep low-mass and high-mass endings distinct."];
    case "M14_L3":
      return ["Separate star, Solar System, galaxy, and universe scales.", "Keep gravity in the galaxy definition.", "Place the Sun inside the Milky Way, not equal to it."];
    case "M14_L4":
      return ["Use light-year as a distance unit.", "Tie the unit to huge scale, not to timekeeping.", "Compare distances before worrying about exact numbers."];
    case "M14_L5":
      return ["Treat redshift as wavelength stretching.", "Compare near and far galaxies qualitatively.", "Do not turn redshift into just a color-name fact."];
    case "M14_L6":
      return ["Use expanding-space language rather than explosion language.", "Connect the model to evidence.", "Keep hot dense early-state language visible."];
    default:
      return [];
  }
}

export function m14ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M14_L1":
      return ["Stars are luminous bodies.", "Fusion in the core powers starlight.", "Planets and moons usually reflect starlight rather than producing it."];
    case "M14_L2":
      return ["Stars form in nebulae and protostars.", "Main-sequence stars are the long steady stage.", "Stellar mass changes the later path and remnant."];
    case "M14_L3":
      return ["A galaxy is a gravitationally bound system of stars, gas, and dust.", "The Milky Way is our home galaxy.", "The Solar System is one tiny part of the Milky Way."];
    case "M14_L4":
      return ["A light-year is a distance unit.", "It is the distance light travels in one year.", "It is useful because cosmic distances are enormous."];
    case "M14_L5":
      return ["Redshift means light is observed at longer wavelengths.", "Cosmological redshift is tied to the expansion of space.", "Farther galaxies usually show larger redshifts."];
    case "M14_L6":
      return ["The Big Bang model describes an early hot dense universe.", "The universe expands over time.", "Redshift evidence supports the expansion model."];
    default:
      return [];
  }
}

export function m14ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M14_VISUAL_META[code.replace("_", "")];
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

export function m14ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M14_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    M14_L1: "Use the star-versus-planet visual to explain why astronomy should classify by light source rather than apparent brightness.",
    M14_L2: "Use the stellar lifecycle visual to explain why mass makes the later stellar path branch.",
    M14_L3: "Use the Milky Way visual to explain why a galaxy is more than one star and less than the whole universe.",
    M14_L4: "Use the light-year scale visual to explain why a light-year answers a distance question, not a time question.",
    M14_L5: "Use the redshift visual to explain why stretching space makes the arriving light redder.",
    M14_L6: "Use the Big Bang visual to explain why the model is better described as expanding space than as a simple explosion from one point.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the visual to explain the lesson's key universe idea.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
