"use client";

type UnknownRecord = Record<string, unknown>;

export type M13QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M13SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M13_SOLAR_VISUAL_META: Record<string, M13QuestionVisualMeta> = {
  M13L1: {
    image_url: "/lesson_assets/M14/M14_L1/diagrams/m14-l1-solar-court.svg",
    visual_title: "Earth, Moon, and Sun form one linked orbital system",
    visual_caption:
      "The system board keeps host body, orbit path, and relative role together so Solar System observations are read as one organized model.",
    visual_callouts: [
      "Earth orbits the Sun while the Moon mainly orbits Earth.",
      "Gravity organizes the main routes in the system.",
      "One linked model explains several sky observations at once.",
    ],
  },
  M13L2: {
    image_url: "/lesson_assets/M14/M14_L2/diagrams/m14-l2-hub-pull-routes.svg",
    visual_title: "Gravity and sideways motion together produce orbital paths",
    visual_caption:
      "The orbit board keeps inward gravitational pull separate from sideways motion so orbit is not mistaken for a force-free drift or a straight fall.",
    visual_callouts: [
      "Orbit needs gravity and sideways motion together.",
      "The path curves because the pull stays inward.",
      "Larger orbits usually take longer to complete.",
    ],
  },
  M13L3: {
    image_url: "/lesson_assets/M14/M14_L3/diagrams/m14-l3-spin-for-daylight.svg",
    visual_title: "Earth's rotation carries locations through day and night",
    visual_caption:
      "The spin board keeps rotation separate from yearly orbit so daylight change stays a rotation story rather than a distance-to-the-Sun myth.",
    visual_callouts: [
      "At any moment one half of Earth is lit and one half is dark.",
      "A city changes from day to night because Earth rotates.",
      "One day belongs to one spin rather than one orbit.",
    ],
  },
  M13L4: {
    image_url: "/lesson_assets/M14/M14_L4/diagrams/m14-l4-season-switch.svg",
    visual_title: "Axial tilt changes sunlight angle and drives the seasons",
    visual_caption:
      "The season board keeps fixed axis direction, orbit position, and hemisphere comparison together so seasons do not collapse into a simple distance explanation.",
    visual_callouts: [
      "Earth's axis stays tilted in the same direction in space.",
      "Opposite hemispheres lean toward the Sun at different times.",
      "Season change is strongest as a tilt-and-sunlight-angle story.",
    ],
  },
  M13L5: {
    image_url: "/lesson_assets/M14/M14_L5/diagrams/m14-l5-moon-face-challenge.svg",
    visual_title: "Moon phases depend on viewing geometry and eclipses need special alignment",
    visual_caption:
      "The Moon board keeps the always-lit half, the Earth viewpoint, and the rarer eclipse alignment separate so phases and eclipses are not confused.",
    visual_callouts: [
      "The Sun lights half of the Moon all the time.",
      "Phases change because our viewing angle changes.",
      "Eclipses need a special Sun-Earth-Moon line-up rather than ordinary monthly geometry.",
    ],
  },
  M13L6: {
    image_url: "/lesson_assets/M14/M14_L6/diagrams/m14-l6-outer-lap-puzzle.svg",
    visual_title: "Solar System structure and orbital scale must stay separate from the sketch",
    visual_caption:
      "The scale board keeps orbit size, orbital period, and system family structure visible together so apparent motion is not mistaken for literal spacing.",
    visual_callouts: [
      "Farther orbits usually take longer to complete.",
      "A classroom sketch compresses huge real distances.",
      "The Solar System contains planets, moons, and smaller bodies in one Sun-centered family.",
    ],
  },
};

export function m13QuestionVisualMeta(itemId: string): M13QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M13L[1-6])_[A-Z]+\d+$/);
  return match ? M13_SOLAR_VISUAL_META[match[1]] : undefined;
}

const M13_SIMULATION_COPY: Record<string, M13SimulationCopy> = {
  M13_L1: {
    title: "Earth-Moon-Sun system lab",
    instructions:
      "Keep Earth, Moon, and Sun on one board so their linked motions stay connected while you explain sky patterns.",
    taskPrompt:
      "Trace the main routes in the Earth-Moon-Sun system and explain why one shared orbital model is stronger than a list of disconnected facts.",
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
    tryFirst:
      "Say what Earth mainly orbits and what the Moon mainly orbits before you add any other detail.",
    takeaway: "Earth, Moon, and Sun are best understood as one linked orbital system.",
  },
  M13_L2: {
    title: "Orbit route lab",
    instructions:
      "Track inward pull and sideways motion together so orbit reads as a curved path made by both ingredients.",
    taskPrompt:
      "Change orbital size and route speed, then explain why gravity and sideways motion are both needed for an orbit.",
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
    takeaway:
      "Orbit explanations improve when the learner keeps the inward pull and sideways motion in the same picture.",
  },
  M13_L3: {
    title: "Day-night rotation lab",
    instructions:
      "Track one location on a rotating Earth so day and night stay tied to rotation rather than yearly orbit.",
    taskPrompt:
      "Rotate Earth through one full turn and explain why one location moves from darkness into sunlight and back again.",
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
    taskPrompt:
      "Compare opposite positions in Earth's orbit and explain why opposite hemispheres swap which one leans toward the Sun.",
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
    tryFirst:
      "Check which hemisphere leans toward the Sun before you say anything about temperature or season names.",
    takeaway: "Seasons stay clearest as a tilt-and-sunlight-angle story.",
  },
  M13_L5: {
    title: "Moon phases and eclipses lab",
    instructions:
      "Keep the Sun-lit half of the Moon visible while the Earth viewpoint changes so phases and eclipses stay separate.",
    taskPrompt:
      "Move the Moon around Earth, compare phase cases, and explain how a special shadow alignment differs from an ordinary phase.",
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
    tryFirst:
      "Ask what stays constant about the sunlight before you explain what changes in the visible phase.",
    takeaway: "Phases are a viewing-angle story, while eclipses are special shadow events.",
  },
  M13_L6: {
    title: "Solar System scale lab",
    instructions:
      "Keep route size, year length, and body classification on one board so the Solar System stays organized.",
    taskPrompt:
      "Compare inner and outer routes, compare different body types, and explain why simple sketches compress the real distances heavily.",
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
    takeaway:
      "Solar System structure becomes clearer when orbit size, period, and body type are kept in separate but linked slots.",
  },
};

export function m13SimulationCopy(code: string): M13SimulationCopy | undefined {
  return M13_SIMULATION_COPY[code];
}

export function m13ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M13_L1":
      return [
        "Keep Earth, Moon, and Sun on one linked system board.",
        "Use main host and orbit route together.",
        "Treat gravity as the organizer of the family.",
      ];
    case "M13_L2":
      return [
        "Track inward pull and sideways motion together.",
        "Do not explain orbit as a force-free path.",
        "Compare orbital size with orbital period.",
      ];
    case "M13_L3":
      return [
        "Use rotation before orbit when explaining day and night.",
        "Track one location through the turn.",
        "Keep the lit-half picture visible.",
      ];
    case "M13_L4":
      return [
        "Keep axis direction fixed in space.",
        "Compare opposite hemispheres directly.",
        "Use sunlight angle instead of simple distance for seasons.",
      ];
    case "M13_L5":
      return [
        "Keep the Moon half lit all month.",
        "Use viewing geometry for phases.",
        "Reserve shadow language for eclipses.",
      ];
    case "M13_L6":
      return [
        "Separate route size from sketch size.",
        "Link longer orbital route to longer period.",
        "Sort bodies by role and main host together.",
      ];
    default:
      return [];
  }
}

export function m13ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M13_L1":
      return [
        "Earth orbits the Sun while the Moon mainly orbits Earth.",
        "Gravity keeps the linked system organized.",
        "One system model explains several sky patterns together.",
      ];
    case "M13_L2":
      return [
        "Orbit needs gravity and sideways motion together.",
        "The inward pull continually changes the direction of motion.",
        "Different orbital sizes produce different periods.",
      ];
    case "M13_L3":
      return [
        "Day and night come from Earth's rotation.",
        "At any moment one half of Earth is lit and one half is dark.",
        "One day is tied to one rotation, not one orbit.",
      ];
    case "M13_L4":
      return [
        "Earth's axis stays tilted in the same direction in space.",
        "Opposite hemispheres swap which one leans toward the Sun.",
        "Seasons are driven by tilt and sunlight angle.",
      ];
    case "M13_L5":
      return [
        "The Sun lights half of the Moon all the time.",
        "Phases change because the Earth-based viewing angle changes.",
        "Eclipses need special alignment and are not the normal monthly case.",
      ];
    case "M13_L6":
      return [
        "The Solar System is a Sun-centered family of different body types.",
        "Farther orbital routes usually mean longer years.",
        "Real Solar System distances are heavily compressed in classroom sketches.",
      ];
    default:
      return [];
  }
}

export function m13ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M13_SOLAR_VISUAL_META[code.replace("_", "")];
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

export function m13ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M13_SOLAR_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key Earth-and-Solar-System idea from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
