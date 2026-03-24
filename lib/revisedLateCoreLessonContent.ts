"use client";

import { m10QuestionVisualMeta, m10ReflectionVisualCheck, m10ScaffoldCoreBullets, m10ScaffoldFocusExtras, m10ScaffoldMediaCards, m10SimulationCopy } from "./m10LessonContent";
import { m12QuestionVisualMeta, m12ReflectionVisualCheck, m12ScaffoldCoreBullets, m12ScaffoldFocusExtras, m12ScaffoldMediaCards, m12SimulationCopy } from "./m12LessonContent";
import { m13QuestionVisualMeta, m13ReflectionVisualCheck, m13ScaffoldCoreBullets, m13ScaffoldFocusExtras, m13ScaffoldMediaCards, m13SimulationCopy } from "./m13LessonContent";
import { m14QuestionVisualMeta, m14ReflectionVisualCheck, m14ScaffoldCoreBullets, m14ScaffoldFocusExtras, m14ScaffoldMediaCards, m14SimulationCopy } from "./m14LessonContent";
import { m12NuclearQuestionVisualMeta, m12NuclearReflectionVisualCheck, m12NuclearScaffoldCoreBullets, m12NuclearScaffoldFocusExtras, m12NuclearScaffoldMediaCards, m12NuclearSimulationCopy } from "./m12NuclearLessonContent";

type UnknownRecord = Record<string, unknown>;

export type RevisedLateCoreQuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type RevisedLateCoreSimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

function normalizeItemId(itemId: string): string {
  return String(itemId || "").trim().replace(/-/g, "_").toUpperCase();
}

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function remapItemIdToModule(itemId: string, targetModule: string): string {
  return normalizeItemId(itemId).replace(/^[A-Z]\d+/, targetModule);
}

function remapCodeToModule(code: string, targetModule: string): string {
  return normalizeCode(code).replace(/^[A-Z]\d+/, targetModule);
}

const M9_L6_VISUAL: RevisedLateCoreQuestionVisualMeta = {
  image_url: "/lesson_assets/M11/M11_L2/diagrams/m11-l2-branch-deck.svg",
  visual_title: "Series and parallel routes change current and voltage behaviour in different ways",
  visual_caption: "The comparison board keeps one-path and branch-path behaviour separate so learners stop mixing the rules for current, voltage, and equivalent resistance.",
  visual_callouts: [
    "Series circuits keep one common current through the path.",
    "Parallel branches share the same potential difference across matching junctions.",
    "Changing the route structure changes the whole circuit behaviour.",
  ],
};

const M9_L6_SIMULATION: RevisedLateCoreSimulationCopy = {
  title: "Circuit behaviour compare lab",
  instructions: "Switch between one-route and branch-route networks so series and parallel behaviour stay visibly different.",
  taskPrompt: "Compare a series circuit with a parallel circuit, then explain how the route shape changes current and voltage behaviour.",
  exploreSteps: [
    "Start with one simple series loop and read the common current story.",
    "Switch to a branch circuit and compare what stays shared across the branches.",
    "Add or remove one component and compare how the overall circuit responds.",
  ],
  watchFor: [
    "Series and parallel networks do not follow the same current-and-voltage pattern.",
    "Branch circuits share voltage between the same two junctions.",
    "Adding branches changes the total behaviour of the whole circuit.",
  ],
  tryFirst: "Read the series case first, then switch to a branch deck and ask which quantity now stays the same across both branches.",
  takeaway: "Circuit behaviour gets clearer when learners decide first whether the route is a one-path chain or a branching network.",
};

const M13_SOLAR_VISUAL_META: Record<string, RevisedLateCoreQuestionVisualMeta> = {
  M13L1: {
    image_url: "/lesson_assets/M14/M14_L1/diagrams/m14-l1-solar-court.svg",
    visual_title: "Earth, Moon, and Sun form one linked orbital system",
    visual_caption: "The system board keeps host body, orbit path, and relative role together so Solar System observations are read as one organized model.",
    visual_callouts: [
      "Earth orbits the Sun while the Moon mainly orbits Earth.",
      "Gravity organizes the main routes in the system.",
      "A linked system picture explains several sky observations at once.",
    ],
  },
  M13L2: {
    image_url: "/lesson_assets/M14/M14_L2/diagrams/m14-l2-hub-pull-routes.svg",
    visual_title: "Gravity and sideways motion produce orbital paths",
    visual_caption: "The orbit board keeps inward gravitational pull separate from sideways motion so orbit is not mistaken for a straight-line fall or a force-free path.",
    visual_callouts: [
      "Orbit needs gravity and sideways motion together.",
      "The path curves because the pull stays inward.",
      "Different orbital sizes produce different route lengths and periods.",
    ],
  },
  M13L3: {
    image_url: "/lesson_assets/M14/M14_L3/diagrams/m14-l3-spin-for-daylight.svg",
    visual_title: "Earth's rotation carries locations through day and night",
    visual_caption: "The spin board keeps rotation separate from yearly orbit so daylight change stays a rotation story.",
    visual_callouts: [
      "At any moment one half of Earth is lit and one half is dark.",
      "A city changes from day to night because Earth rotates.",
      "One day belongs to one spin rather than one orbit.",
    ],
  },
  M13L4: {
    image_url: "/lesson_assets/M14/M14_L4/diagrams/m14-l4-season-switch.svg",
    visual_title: "Axial tilt changes sunlight angle and drives the seasons",
    visual_caption: "The season board keeps fixed axis direction, orbit position, and hemisphere comparison on one picture so seasons do not collapse into a simple distance myth.",
    visual_callouts: [
      "Earth's axis stays tilted in the same direction in space.",
      "Opposite hemispheres lean toward the Sun at different times.",
      "Season changes are stronger as a tilt-and-sunlight-angle story.",
    ],
  },
  M13L5: {
    image_url: "/lesson_assets/M14/M14_L5/diagrams/m14-l5-moon-face-challenge.svg",
    visual_title: "Moon phases depend on viewing geometry and eclipses need special alignment",
    visual_caption: "The Moon board keeps the always-lit half, the Earth viewpoint, and the rarer eclipse alignment separate so phases and eclipses are not confused.",
    visual_callouts: [
      "The Sun lights half of the Moon all the time.",
      "Phases change because our viewing angle changes.",
      "Eclipses need a special shadow line-up rather than the normal monthly geometry.",
    ],
  },
  M13L6: {
    image_url: "/lesson_assets/M14/M14_L6/diagrams/m14-l6-outer-lap-puzzle.svg",
    visual_title: "Solar System structure and orbital scale must stay separate from the sketch",
    visual_caption: "The scale board keeps orbit size, orbital period, and system family structure visible together so apparent motion is not mistaken for literal spacing.",
    visual_callouts: [
      "Farther orbits usually take longer to complete.",
      "A classroom sketch compresses huge real distances.",
      "The Solar System contains planets, moons, and smaller bodies in one Sun-centered family.",
    ],
  },
};

const M13_SOLAR_SIMULATION_COPY: Record<string, RevisedLateCoreSimulationCopy> = {
  M13_L1: {
    title: "Earth-Moon-Sun system lab",
    instructions: "Keep Earth, Moon, and Sun on one board so their linked motions stay connected while you explain sky patterns.",
    taskPrompt: "Trace the main routes in the Earth-Moon-Sun system and explain why one shared orbital model is stronger than a list of disconnected facts.",
    exploreSteps: [
      "Start with Earth on its wider route around the Sun.",
      "Add the Moon on its route around Earth.",
      "Use the same system picture to explain several observations together.",
    ],
    watchFor: [
      "Earth and Moon do not share the same main host body.",
      "Gravity keeps the family organized into linked routes.",
      "One system model explains more than one separate sky event.",
    ],
    tryFirst: "Say what Earth mainly orbits and what the Moon mainly orbits before you add any other detail.",
    takeaway: "Earth, Moon, and Sun are best understood as one linked orbital system.",
  },
  M13_L2: {
    title: "Orbit route lab",
    instructions: "Track inward pull and sideways motion together so orbit reads as a curved path made by both ingredients.",
    taskPrompt: "Change orbital size and route speed, then explain why gravity and sideways motion are both needed for an orbit.",
    exploreSteps: [
      "Start with a body that would move straight on without the pull.",
      "Turn on the inward pull and compare the curved path.",
      "Compare a smaller and a larger orbital route.",
    ],
    watchFor: [
      "Orbit is not a force-free motion.",
      "The inward pull keeps changing the direction of motion.",
      "Different orbital sizes produce different periods.",
    ],
    tryFirst: "Ask what would happen without gravity before you explain the final orbital path.",
    takeaway: "Orbit explanations improve when the learner keeps the inward pull and sideways motion in the same picture.",
  },
  M13_L3: {
    title: "Day-night rotation lab",
    instructions: "Track one location on a rotating Earth so day and night stay tied to rotation rather than yearly orbit.",
    taskPrompt: "Rotate Earth through one full turn and explain why one location moves from darkness into sunlight and back again.",
    exploreSteps: [
      "Start with one location on the dark side.",
      "Rotate until it crosses into sunlight.",
      "Complete the full turn and relate it to one day.",
    ],
    watchFor: [
      "The Sun's light direction stays fixed while Earth turns.",
      "Half of Earth is lit at any moment.",
      "One day is a rotation-timescale idea.",
    ],
    tryFirst: "Move one city marker from night to day before you mention the yearly orbit.",
    takeaway: "Day and night are explained by Earth's rotation under steady sunlight.",
  },
  M13_L4: {
    title: "Seasons and tilt lab",
    instructions: "Keep tilt and orbit position on one board so sunlight angle stays the seasonal cause.",
    taskPrompt: "Compare opposite positions in Earth's orbit and explain why opposite hemispheres swap which one leans toward the Sun.",
    exploreSteps: [
      "Set the axis tilt first and keep its direction fixed in space.",
      "Move Earth halfway around the orbit.",
      "Compare which hemisphere now gets more direct sunlight.",
    ],
    watchFor: [
      "Tilt is the main seasonal cause.",
      "Opposite hemispheres show opposite seasonal patterns.",
      "Distance alone cannot explain those opposite patterns at the same time.",
    ],
    tryFirst: "Check which hemisphere leans toward the Sun before you say anything about temperature or season names.",
    takeaway: "Seasons stay clearest as a tilt-and-sunlight-angle story.",
  },
  M13_L5: {
    title: "Moon phases and eclipses lab",
    instructions: "Keep the Sun-lit half of the Moon visible while the Earth viewpoint changes so phases and eclipses stay separate.",
    taskPrompt: "Move the Moon around Earth, compare phase cases, and explain how a special shadow alignment differs from an ordinary phase.",
    exploreSteps: [
      "Start with a full-Moon case and identify the visible lit fraction.",
      "Move to quarter and crescent positions.",
      "Switch on the eclipse alignment and compare what is truly different.",
    ],
    watchFor: [
      "The Moon stays half lit by the Sun all month.",
      "Earth's shadow is not the normal phase cause.",
      "Eclipses need a special alignment rather than the usual orbit position alone.",
    ],
    tryFirst: "Ask what stays constant about the sunlight before you explain what changes in the visible phase.",
    takeaway: "Phases are a viewing-angle story, while eclipses are special shadow events.",
  },
  M13_L6: {
    title: "Solar System scale lab",
    instructions: "Keep route size, year length, and body classification on one board so the Solar System stays organized.",
    taskPrompt: "Compare inner and outer routes, compare different body types, and explain why simple sketches compress the real distances heavily.",
    exploreSteps: [
      "Compare one inner orbit with one outer orbit.",
      "Sort planets, moons, and smaller bodies by role.",
      "Use the scale clue to explain why the drawing is not literal.",
    ],
    watchFor: [
      "Farther routes usually mean longer orbital periods.",
      "Main host helps separate planets from moons.",
      "Real Solar System distances are much larger than classroom sketches suggest.",
    ],
    tryFirst: "Match a shorter year to a smaller route before you talk about the family sorting.",
    takeaway: "Solar System structure becomes clearer when orbit size, period, and body type are kept in separate but linked slots.",
  },
};

function revisedM9QuestionVisualMeta(itemId: string): RevisedLateCoreQuestionVisualMeta | undefined {
  const normalized = normalizeItemId(itemId);
  if (/^M9L[1-5]_/.test(normalized)) {
    return m10QuestionVisualMeta(remapItemIdToModule(normalized, "M10"));
  }
  if (/^M9L6_/.test(normalized)) {
    return M9_L6_VISUAL;
  }
  return undefined;
}

function revisedM9SimulationCopy(code: string): RevisedLateCoreSimulationCopy | undefined {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10SimulationCopy(remapCodeToModule(normalized, "M10"));
  }
  if (normalized === "M9_L6") {
    return M9_L6_SIMULATION;
  }
  return undefined;
}

function revisedM9FocusExtras(code: string): string[] {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10ScaffoldFocusExtras(remapCodeToModule(normalized, "M10"));
  }
  if (normalized === "M9_L6") {
    return [
      "Decide first whether the route is series or parallel.",
      "Keep current behaviour separate from voltage behaviour.",
      "Use junctions and paths to explain the rule, not the picture alone.",
    ];
  }
  return [];
}

function revisedM9CoreBullets(code: string): string[] {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10ScaffoldCoreBullets(remapCodeToModule(normalized, "M10"));
  }
  if (normalized === "M9_L6") {
    return [
      "Series circuits keep one common current in the single path.",
      "Parallel branches share the same potential difference across the same two junctions.",
      "Changing the route structure changes the whole circuit behaviour.",
    ];
  }
  return [];
}

function revisedM9MediaCards(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10ScaffoldMediaCards(remapCodeToModule(normalized, "M10"));
  }
  if (normalized === "M9_L6") {
    return [{
      kind: "visual",
      title: M9_L6_VISUAL.visual_title,
      caption: M9_L6_VISUAL.visual_caption,
      image_url: M9_L6_VISUAL.image_url,
      highlights: M9_L6_VISUAL.visual_callouts,
    }];
  }
  return [];
}

function revisedM9ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10ReflectionVisualCheck(remapCodeToModule(normalized, "M10"));
  }
  if (normalized === "M9_L6") {
    return {
      title: M9_L6_VISUAL.visual_title,
      prompt: "Use the visual to explain how series and parallel circuit behaviour differ.",
      image_url: M9_L6_VISUAL.image_url,
      callouts: M9_L6_VISUAL.visual_callouts,
    };
  }
  return undefined;
}

function revisedM13QuestionVisualMeta(itemId: string): RevisedLateCoreQuestionVisualMeta | undefined {
  const normalized = normalizeItemId(itemId);
  const match = normalized.match(/^(M13L[1-6])_/);
  return match ? M13_SOLAR_VISUAL_META[match[1]] : undefined;
}

function revisedM13SimulationCopy(code: string): RevisedLateCoreSimulationCopy | undefined {
  return M13_SOLAR_SIMULATION_COPY[normalizeCode(code)];
}

function revisedM13FocusExtras(code: string): string[] {
  switch (normalizeCode(code)) {
    case "M13_L1":
      return ["Keep Earth, Moon, and Sun on one linked system board.", "Use main host and orbit route together.", "Treat gravity as the organizer of the family."];
    case "M13_L2":
      return ["Track inward pull and sideways motion together.", "Do not explain orbit as a force-free path.", "Compare orbital size with orbital period."];
    case "M13_L3":
      return ["Use rotation before orbit when explaining day and night.", "Track one location through the turn.", "Keep the lit-half picture visible."];
    case "M13_L4":
      return ["Keep axis direction fixed in space.", "Compare opposite hemispheres directly.", "Use sunlight angle instead of simple distance for seasons."];
    case "M13_L5":
      return ["Keep the Moon half lit all month.", "Use viewing geometry for phases.", "Reserve shadow language for eclipses."];
    case "M13_L6":
      return ["Separate route size from sketch size.", "Link longer orbital route to longer period.", "Sort bodies by role and main host together."];
    default:
      return [];
  }
}

function revisedM13CoreBullets(code: string): string[] {
  switch (normalizeCode(code)) {
    case "M13_L1":
      return ["Earth orbits the Sun while the Moon mainly orbits Earth.", "Gravity keeps the linked system organized.", "One system model explains several sky patterns together."];
    case "M13_L2":
      return ["Orbit needs gravity and sideways motion together.", "The inward pull continually changes the direction of motion.", "Different orbital sizes produce different periods."];
    case "M13_L3":
      return ["Day and night come from Earth's rotation.", "At any moment one half of Earth is lit and one half is dark.", "One day is tied to one rotation, not one orbit."];
    case "M13_L4":
      return ["Earth's axis stays tilted in the same direction in space.", "Opposite hemispheres swap which one leans toward the Sun.", "Seasons are driven by tilt and sunlight angle."];
    case "M13_L5":
      return ["The Sun lights half of the Moon all the time.", "Phases change because the Earth-based viewing angle changes.", "Eclipses need special alignment and are not the normal monthly case."];
    case "M13_L6":
      return ["The Solar System is a Sun-centered family of different body types.", "Farther orbital routes usually mean longer years.", "Real Solar System distances are heavily compressed in classroom sketches."];
    default:
      return [];
  }
}

function revisedM13MediaCards(code: string): UnknownRecord[] {
  const visual = M13_SOLAR_VISUAL_META[normalizeCode(code).replace("_", "")];
  if (!visual) return [];
  return [{ kind: "visual", title: visual.visual_title, caption: visual.visual_caption, image_url: visual.image_url, highlights: visual.visual_callouts }];
}

function revisedM13ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M13_SOLAR_VISUAL_META[normalizeCode(code).replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the main Earth-and-Solar-System idea from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}

export function revisedLateCoreQuestionVisualMeta(itemId: string): RevisedLateCoreQuestionVisualMeta | undefined {
  const normalized = normalizeItemId(itemId);
  if (normalized.startsWith("M9L")) return revisedM9QuestionVisualMeta(normalized);
  if (normalized.startsWith("M10L")) return m12QuestionVisualMeta(remapItemIdToModule(normalized, "M12"));
  if (normalized.startsWith("M11L")) return m13QuestionVisualMeta(remapItemIdToModule(normalized, "M13"));
  if (normalized.startsWith("M12L")) return m12NuclearQuestionVisualMeta(normalized);
  if (normalized.startsWith("M13L")) return revisedM13QuestionVisualMeta(normalized);
  if (normalized.startsWith("M14L")) return m14QuestionVisualMeta(normalized);
  return undefined;
}

export function revisedLateCoreSimulationCopy(code: string): RevisedLateCoreSimulationCopy | undefined {
  const normalized = normalizeCode(code);
  if (normalized.startsWith("M9_")) return revisedM9SimulationCopy(normalized);
  if (normalized.startsWith("M10_")) return m12SimulationCopy(remapCodeToModule(normalized, "M12"));
  if (normalized.startsWith("M11_")) return m13SimulationCopy(remapCodeToModule(normalized, "M13"));
  if (normalized.startsWith("M12_")) return m12NuclearSimulationCopy(normalized);
  if (normalized.startsWith("M13_")) return revisedM13SimulationCopy(normalized);
  if (normalized.startsWith("M14_")) return m14SimulationCopy(normalized);
  return undefined;
}

export function revisedLateCoreFocusExtras(code: string): string[] {
  const normalized = normalizeCode(code);
  if (normalized.startsWith("M9_")) return revisedM9FocusExtras(normalized);
  if (normalized.startsWith("M10_")) return m12ScaffoldFocusExtras(remapCodeToModule(normalized, "M12"));
  if (normalized.startsWith("M11_")) return m13ScaffoldFocusExtras(remapCodeToModule(normalized, "M13"));
  if (normalized.startsWith("M12_")) return m12NuclearScaffoldFocusExtras(normalized);
  if (normalized.startsWith("M13_")) return revisedM13FocusExtras(normalized);
  if (normalized.startsWith("M14_")) return m14ScaffoldFocusExtras(normalized);
  return [];
}

export function revisedLateCoreCoreBullets(code: string): string[] {
  const normalized = normalizeCode(code);
  if (normalized.startsWith("M9_")) return revisedM9CoreBullets(normalized);
  if (normalized.startsWith("M10_")) return m12ScaffoldCoreBullets(remapCodeToModule(normalized, "M12"));
  if (normalized.startsWith("M11_")) return m13ScaffoldCoreBullets(remapCodeToModule(normalized, "M13"));
  if (normalized.startsWith("M12_")) return m12NuclearScaffoldCoreBullets(normalized);
  if (normalized.startsWith("M13_")) return revisedM13CoreBullets(normalized);
  if (normalized.startsWith("M14_")) return m14ScaffoldCoreBullets(normalized);
  return [];
}

export function revisedLateCoreMediaCards(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  if (normalized.startsWith("M9_")) return revisedM9MediaCards(normalized);
  if (normalized.startsWith("M10_")) return m12ScaffoldMediaCards(remapCodeToModule(normalized, "M12"));
  if (normalized.startsWith("M11_")) return m13ScaffoldMediaCards(remapCodeToModule(normalized, "M13"));
  if (normalized.startsWith("M12_")) return m12NuclearScaffoldMediaCards(normalized);
  if (normalized.startsWith("M13_")) return revisedM13MediaCards(normalized);
  if (normalized.startsWith("M14_")) return m14ScaffoldMediaCards(normalized);
  return [];
}

export function revisedLateCoreReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const normalized = normalizeCode(code);
  if (normalized.startsWith("M9_")) return revisedM9ReflectionVisualCheck(normalized);
  if (normalized.startsWith("M10_")) return m12ReflectionVisualCheck(remapCodeToModule(normalized, "M12"));
  if (normalized.startsWith("M11_")) return m13ReflectionVisualCheck(remapCodeToModule(normalized, "M13"));
  if (normalized.startsWith("M12_")) return m12NuclearReflectionVisualCheck(normalized);
  if (normalized.startsWith("M13_")) return revisedM13ReflectionVisualCheck(normalized);
  if (normalized.startsWith("M14_")) return m14ReflectionVisualCheck(normalized);
  return undefined;
}
