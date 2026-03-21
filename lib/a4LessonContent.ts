"use client";

type UnknownRecord = Record<string, unknown>;

export type A4QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A4SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A4_ASSET_BASE = "/lesson_assets/A4";

const A4_VISUAL_META: Record<string, A4QuestionVisualMeta> = {
  A4L1: {
    image_url: `${A4_ASSET_BASE}/A4_L1/diagrams/a4-l1-bounce-chamber-pressure.svg`,
    visual_title: "Pressure as wall-hit load",
    visual_caption: "The chamber visual makes pressure a collision story on the walls instead of a floor-only weight story.",
    visual_callouts: [
      "Pressure comes from many wall collisions.",
      "Hotter or more numerous dashers raise the wall-hit load.",
      "Pressure acts on all walls, not just downward.",
    ],
  },
  A4L2: {
    image_url: `${A4_ASSET_BASE}/A4_L2/diagrams/a4-l2-gas-law-balance.svg`,
    visual_title: "The chamber balance rule",
    visual_caption: "The gas-law board keeps pV and nRT on one physical balance so the formula stays tied to chamber meaning.",
    visual_callouts: [
      "pV is the wall-hit side of the balance.",
      "nRT is the crowd-count and dash-level side.",
      "Changing one variable at a time makes the ratio story readable.",
    ],
  },
  A4L3: {
    image_url: `${A4_ASSET_BASE}/A4_L3/diagrams/a4-l3-kinetic-theory-bridge.svg`,
    visual_title: "Microscopic bridge to the gas law",
    visual_caption: "The bridge visual shows how collision momentum changes build the microscopic form of the gas law.",
    visual_callouts: [
      "Wall momentum change builds pressure.",
      "Mean square speed belongs in the bridge relation.",
      "Comparing the two pV equations links temperature to molecular motion.",
    ],
  },
  A4L4: {
    image_url: `${A4_ASSET_BASE}/A4_L4/diagrams/a4-l4-average-dash-energy.svg`,
    visual_title: "Dash level means average molecular energy",
    visual_caption: "The cool-hot chamber pair keeps temperature tied to average translational kinetic energy per molecule.",
    visual_callouts: [
      "Temperature is an average-per-molecule idea.",
      "Same temperature does not force the same molecular speed for different masses.",
      "Sample size can change total energy without changing temperature.",
    ],
  },
  A4L5: {
    image_url: `${A4_ASSET_BASE}/A4_L5/diagrams/a4-l5-partition-expansion.svg`,
    visual_title: "Partition drop and hidden playbooks",
    visual_caption: "The before-and-after chamber shows why free expansion is a multiplicity story rather than a vague disorder slogan.",
    visual_callouts: [
      "Macrostate is the visible dashboard.",
      "Microstate is one exact hidden arrangement.",
      "The spread-out state wins because it has many more compatible playbooks.",
    ],
  },
  A4L6: {
    image_url: `${A4_ASSET_BASE}/A4_L6/diagrams/a4-l6-entropy-option-count.svg`,
    visual_title: "Option count and spread score",
    visual_caption: "The entropy visual compares low-W and high-W states so S = k ln W reads like a compact count rule instead of an abstract slogan.",
    visual_callouts: [
      "Larger W means larger entropy.",
      "Entropy is stronger as option count than as 'messiness.'",
      "Spontaneous change heads toward larger multiplicity.",
    ],
  },
};

export function a4QuestionVisualMeta(itemId: string): A4QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A4L[1-6])_[A-Z]+\d+$/);
  return match ? A4_VISUAL_META[match[1]] : undefined;
}

const A4_SIMULATION_COPY: Record<string, A4SimulationCopy> = {
  A4_L1: {
    title: "Wall-hit builder lab",
    instructions: "Treat the gas as many hidden dashers in a chamber so pressure stays tied to collisions with all the walls.",
    taskPrompt: "Change crowd count, room size, and dash level one at a time, then explain every pressure change as a wall-hit story.",
    exploreSteps: ["Keep temperature fixed and change the chamber size.", "Keep volume fixed and add more dashers.", "Raise the dash level and compare harder collisions."],
    watchFor: ["Pressure acts on all walls.", "Smaller volume means more frequent wall hits.", "Hotter dashers create a larger wall-hit load."],
    tryFirst: "Start with a medium chamber, then shrink the room size without changing the crowd count. The collision rate should rise before you ever write a formula.",
    takeaway: "Pressure is the steady wall-hit load created by many molecular collisions.",
  },
  A4_L2: {
    title: "Chamber resize lab",
    instructions: "Use the chamber balance board so pV = nRT stays a physical comparison between the wall-hit side and the crowd-dash side.",
    taskPrompt: "Hold two variables fixed, change the third, and explain what the gas law says in chamber language before doing algebra.",
    exploreSteps: ["Keep n and T fixed while changing V.", "Keep n and V fixed while changing T.", "Switch between nRT and NkT language for the same state."],
    watchFor: ["Pressure and volume trade off when n and T stay fixed.", "Raising temperature at fixed volume raises pressure.", "The mole form and particle form describe the same state."],
    tryFirst: "Double the volume first while holding amount and temperature fixed. That makes the inverse pressure-volume story visible immediately.",
    takeaway: "The ideal gas law is one chamber balance rule, not a disconnected symbol string.",
  },
  A4_L3: {
    title: "Dash-level lab",
    instructions: "Track wall momentum changes so the microscopic pressure bridge feels like a derivation from motion rather than a second formula to memorize.",
    taskPrompt: "Compare count, mass, and mean-square speed cases, then explain how the microscopic bridge and macroscopic gas law say the same thing.",
    exploreSteps: ["Change mean square speed first.", "Then change particle count.", "Finally compare pV = NkT with the kinetic-theory bridge."],
    watchFor: ["Pressure follows the collision and speed statistics.", "Mean square speed is not the same as casual average speed.", "Temperature emerges as a molecular-energy bridge."],
    tryFirst: "Keep volume fixed and double the mean-square-speed term. The pressure readout should respond before you compare equations.",
    takeaway: "Kinetic theory explains the gas law by building pressure from molecular collisions and motion statistics.",
  },
  A4_L4: {
    title: "Average dash energy lab",
    instructions: "Compare cooler and hotter chambers while separating average energy per molecule from total energy of the whole sample.",
    taskPrompt: "Use cool-hot chamber comparisons, same-temperature different-mass comparisons, and sample-size changes to explain the real meaning of temperature.",
    exploreSteps: ["Double temperature and watch the average kinetic energy.", "Keep temperature fixed and change molecule mass.", "Keep temperature fixed and change sample size."],
    watchFor: ["Temperature is average energy per molecule.", "Lighter molecules can move faster at the same temperature.", "Total energy can change without changing temperature."],
    tryFirst: "Compare a light gas and a heavy gas at the same temperature. The average energy matches, but the speed picture should not.",
    takeaway: "Temperature tracks average translational kinetic energy per molecule, not total sample energy.",
  },
  A4_L5: {
    title: "Partition drop lab",
    instructions: "Remove the divider and compare concentrated and spread-out chamber states so macrostate and microstate stay clearly separated.",
    taskPrompt: "Compare visible chamber dashboards with hidden playbooks, then explain why free expansion is statistically favored.",
    exploreSteps: ["Begin with the gas on one side.", "Remove the partition.", "Compare concentrated and spread-out option counts."],
    watchFor: ["Macrostate is visible; microstate is hidden detail.", "Opening more volume increases accessible playbooks.", "The spread-out state is more probable because it has larger multiplicity."],
    tryFirst: "Open the partition with the same molecules and the same temperature. The new entropy story should come from more accessible playbooks, not from adding new matter.",
    takeaway: "Free expansion is favored because the expanded state fits many more hidden arrangements.",
  },
  A4_L6: {
    title: "Option-count boss",
    instructions: "Compare chamber states by W so entropy becomes a spread-score and multiplicity story instead of a weak 'chaos' slogan.",
    taskPrompt: "Compare low-W and high-W states, then explain why spontaneous change heads toward larger multiplicity and why S = k ln W captures that rule.",
    exploreSteps: ["Compare two different W values.", "Watch the entropy level rise with W.", "Switch to an energy-sharing view for hot-cold systems."],
    watchFor: ["Larger W means larger entropy.", "Entropy is stronger as multiplicity than as messiness.", "Spontaneous direction follows larger option count."],
    tryFirst: "Start with two states that have very different W values. Once that ranking feels clear, move to the hot-cold sharing example.",
    takeaway: "Entropy is the spread score because it tracks how many hidden playbooks fit the same visible state.",
  },
};

export function a4SimulationCopy(code: string): A4SimulationCopy | undefined {
  return A4_SIMULATION_COPY[code];
}

export function a4ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A4_L1":
      return ["Keep pressure tied to wall collisions.", "Use all-wall language, not floor-only language.", "Separate steady macrostate from frozen particles."];
    case "A4_L2":
      return ["Treat the gas law as a balance rule.", "Change one variable at a time.", "Keep pV and nRT tied to chamber meaning."];
    case "A4_L3":
      return ["Build pressure from momentum change.", "Keep the square inside the speed average.", "Use the bridge to connect micro and macro language."];
    case "A4_L4":
      return ["Use average-per-molecule language for temperature.", "Separate average energy from total energy.", "Keep same-temperature different-mass comparisons visible."];
    case "A4_L5":
      return ["Separate macrostate from microstate.", "Use multiplicity to explain partition drop.", "Treat spreading as an option-count story."];
    case "A4_L6":
      return ["Use W as the hidden option count.", "Treat entropy as multiplicity and dispersal.", "Tie spontaneous change to larger multiplicity."];
    default:
      return [];
  }
}

export function a4ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A4_L1":
      return ["Pressure is wall-hit load from collisions.", "Larger volume lowers the wall-hit rate.", "Hotter or more numerous dashers raise pressure."];
    case "A4_L2":
      return ["pV = nRT is a chamber balance rule.", "Pressure falls when volume rises at fixed n and T.", "Pressure rises with temperature or amount at fixed volume."];
    case "A4_L3":
      return ["Kinetic theory builds pressure from collisions.", "pV = (1/3)Nm<c^2> is the microscopic bridge.", "Comparing the pV equations links temperature to molecular motion."];
    case "A4_L4":
      return ["Temperature is average translational kinetic energy per molecule.", "Same temperature does not force the same molecular speed for different masses.", "Sample size changes total energy more easily than temperature."];
    case "A4_L5":
      return ["Macrostate is the visible dashboard state.", "Microstate is one exact hidden arrangement.", "Free expansion is favored because the spread state has more compatible microstates."];
    case "A4_L6":
      return ["Entropy grows with option count.", "S = k ln W compresses the multiplicity idea.", "Spontaneous change heads toward larger multiplicity."];
    default:
      return [];
  }
}

export function a4ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A4_VISUAL_META[code.replace("_", "")];
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

export function a4ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A4_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A4_L1: "Use the chamber visual to explain why pressure is stronger as wall-hit load than as gas weight.",
    A4_L2: "Use the balance visual to explain why pV = nRT is easier to trust when each symbol keeps its chamber role.",
    A4_L3: "Use the bridge visual to explain how the kinetic-theory equation makes the gas law feel derived rather than memorized.",
    A4_L4: "Use the cool-hot chamber visual to explain why temperature is an average energy per molecule rather than a total energy.",
    A4_L5: "Use the partition visual to explain why the spread-out state is more probable than the concentrated state.",
    A4_L6: "Use the option-count visual to explain why larger W means larger entropy and why spontaneity favors that direction.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the Bounce-Chamber visual to explain the main lesson idea in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
