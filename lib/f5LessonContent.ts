"use client";

type UnknownRecord = Record<string, unknown>;

export type F5QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type F5SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const F5_ASSET_BASE = "/lesson_assets/F5";

const F5_VISUAL_META: Record<string, F5QuestionVisualMeta> = {
  F5L1: {
    image_url: `${F5_ASSET_BASE}/F5_L1/diagrams/f5-l1-earth-moon-sun-court.svg`,
    visual_title: "Earth, Moon, and Sun stay on one shared court",
    visual_caption: "This system board keeps Earth, Moon, Sun, orbit, and scale on one picture so sky patterns do not split into unrelated facts.",
    visual_callouts: [
      "Earth orbits the Sun while the Moon mainly orbits Earth.",
      "Gravity keeps the family organized into linked routes.",
      "The same shared system helps explain several sky patterns together.",
    ],
  },
  F5L2: {
    image_url: `${F5_ASSET_BASE}/F5_L2/diagrams/f5-l2-day-night-spin.svg`,
    visual_title: "Earth's spin carries places into day and night",
    visual_caption: "The lit-half board keeps rotation separate from yearly orbit so day and night stay a spin story rather than a distance or revolution myth.",
    visual_callouts: [
      "At any moment one half of Earth is lit and one half is dark.",
      "A city changes from day to night because Earth rotates.",
      "One day belongs to one spin, not one orbit.",
    ],
  },
  F5L3: {
    image_url: `${F5_ASSET_BASE}/F5_L3/diagrams/f5-l3-season-tilt.svg`,
    visual_title: "Tilt and sunlight angle explain the seasons",
    visual_caption: "The June-December comparison keeps the axis direction fixed in space so opposite hemispheres and directness of sunlight stay visible together.",
    visual_callouts: [
      "Earth's axis stays tilted in the same direction in space.",
      "One hemisphere leans toward the Sun while the other leans away.",
      "Season changes are stronger as a tilt story than a near-far story.",
    ],
  },
  F5L4: {
    image_url: `${F5_ASSET_BASE}/F5_L4/diagrams/f5-l4-moon-phases-eclipses.svg`,
    visual_title: "Phases are a viewing story and eclipses are special alignments",
    visual_caption: "The phase board keeps the Moon half lit at all times so ordinary phases stay separate from the rarer shadow events called eclipses.",
    visual_callouts: [
      "The Sun lights half of the Moon all the time.",
      "Phases change because our viewing angle changes.",
      "Eclipses need a special shadow line-up and are not the monthly rule.",
    ],
  },
  F5L5: {
    image_url: `${F5_ASSET_BASE}/F5_L5/diagrams/f5-l5-solar-system-family.svg`,
    visual_title: "The Solar System is one Sun-centered family with several body types",
    visual_caption: "This family map keeps planets, moons, dwarf planets, asteroids, and comets distinct by role and main host instead of flattening them into one group.",
    visual_callouts: [
      "Not every Sun-orbiting body is a planet.",
      "Moons mainly orbit larger worlds rather than the Sun directly.",
      "Body type and main host together strengthen classification.",
    ],
  },
  F5L6: {
    image_url: `${F5_ASSET_BASE}/F5_L6/diagrams/f5-l6-sky-motion-scale.svg`,
    visual_title: "Apparent motion, real motion, and scale must stay separate",
    visual_caption: "The final board keeps day, year, orbit size, and compressed scale visible together so the daily sky sweep does not get mistaken for the whole real-motion story.",
    visual_callouts: [
      "A day comes from Earth's rotation and a year comes from Earth's orbit.",
      "Apparent sky motion is what we see from our viewpoint.",
      "Solar System drawings often compress huge real distances.",
    ],
  },
};

export function f5QuestionVisualMeta(itemId: string): F5QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(F5L[1-6])_[A-Z]+\d+$/);
  return match ? F5_VISUAL_META[match[1]] : undefined;
}

const F5_SIMULATION_COPY: Record<string, F5SimulationCopy> = {
  F5_L1: {
    title: "Earth-Moon-Sun system board",
    instructions: "Keep Earth, Moon, and Sun on one shared board so orbit, gravity, and scale stay linked while you explain familiar sky patterns.",
    taskPrompt: "Trace the main orbits, compare host bodies, and explain why one linked system picture is stronger than memorizing separate day-night, phase, and eclipse facts.",
    exploreSteps: [
      "Start with the Sun at the center and place Earth on its wider route.",
      "Add the Moon on its route around Earth.",
      "Use the same board to explain why several sky patterns belong together.",
    ],
    watchFor: [
      "Earth and Moon do not have the same main host.",
      "Gravity keeps the family organized into routes.",
      "Scale is much larger than a small classroom sketch suggests.",
    ],
    tryFirst: "Place Earth and Moon on the same board and say what each one mainly orbits before you explain anything else.",
    takeaway: "The Earth-Moon-Sun story is strongest as one linked gravity system.",
  },
  F5_L2: {
    title: "Day-night spin lab",
    instructions: "Track one city on a rotating Earth so daylight change stays tied to spin instead of sliding into a yearly-orbit explanation.",
    taskPrompt: "Rotate Earth through one full spin, watch one city cross from dark to lit and back again, and explain why rotation is enough to create day and night.",
    exploreSteps: [
      "Start with the city on the dark side.",
      "Rotate until it crosses into sunlight.",
      "Complete the full spin and connect one day to one rotation.",
    ],
    watchFor: [
      "The Sun's light direction stays fixed while Earth turns.",
      "Half of Earth is lit at any moment.",
      "A day is a spin-timescale idea, not a year-timescale idea.",
    ],
    tryFirst: "Move one city marker from darkness into sunlight before you mention orbit at all.",
    takeaway: "Day and night are explained by Earth rotating under a fixed sunlight direction.",
  },
  F5_L3: {
    title: "Seasons tilt lab",
    instructions: "Keep tilt and orbit position on one board so sunlight angle stays the seasonal cause instead of a simple distance myth.",
    taskPrompt: "Compare June-like and December-like positions and explain why opposite hemispheres swap which one leans toward the Sun.",
    exploreSteps: [
      "Set the axis tilt first and keep its direction fixed in space.",
      "Move Earth halfway around the orbit.",
      "Compare the hemisphere that now gets more direct sunlight.",
    ],
    watchFor: [
      "Tilt is the main seasonal cause.",
      "Opposite hemispheres show opposite seasonal patterns.",
      "Distance alone cannot explain those opposite patterns at the same time.",
    ],
    tryFirst: "Look at which hemisphere leans toward the Sun in one position, then jump half an orbit later and check which hemisphere has swapped roles.",
    takeaway: "Seasons stay clearest as a tilt-and-sunlight-angle story.",
  },
  F5_L4: {
    title: "Moon phase and eclipse lab",
    instructions: "Keep the Sun-lit half of the Moon visible while the Earth viewpoint changes so phases and eclipses stay separate.",
    taskPrompt: "Move the Moon around Earth, compare new, quarter, and full cases, then explain how a special shadow alignment differs from an ordinary phase.",
    exploreSteps: [
      "Start with a full-moon case and identify the visible lit fraction.",
      "Move the Moon toward quarter and crescent positions.",
      "Switch on the eclipse line-up and compare what is truly different.",
    ],
    watchFor: [
      "The Moon stays half lit by the Sun all month.",
      "Earth's shadow is not the normal phase cause.",
      "Eclipses need a special alignment rather than the usual orbit position alone.",
    ],
    tryFirst: "Compare a full moon and a crescent moon and ask what stays constant about the sunlight before you mention shadows.",
    takeaway: "Phases are a viewing-angle story, while eclipses are special shadow events.",
  },
  F5_L5: {
    title: "Solar System family sorter",
    instructions: "Sort Solar System bodies by host and body type so planets, moons, dwarf planets, asteroids, and comets do not collapse into one bucket.",
    taskPrompt: "Compare what each body mainly orbits and what kind of body it is, then explain why those two clues together strengthen the classification.",
    exploreSteps: [
      "Start by separating Sun-orbiting bodies from companion riders around larger worlds.",
      "Compare rocky small bodies with icy visitors.",
      "Finish by checking why a dwarf planet still stays distinct from a full planet.",
    ],
    watchFor: [
      "Main host helps separate moons from planets.",
      "Asteroids and comets are not the same kind of small body.",
      "The Solar System is a family with several categories, not one object type.",
    ],
    tryFirst: "Sort one planet, one moon, one dwarf planet, one asteroid, and one comet before you try to summarize the family rule.",
    takeaway: "The Solar System is a Sun-centered family with several distinct body types and roles.",
  },
  F5_L6: {
    title: "Sky motion and scale lab",
    instructions: "Keep daily appearance, yearly timing, and large-scale spacing on one board so the apparent sky sweep does not replace the real-motion story.",
    taskPrompt: "Compare day and year timescales, compare inner and outer orbits, and explain why a classroom sketch can show a pattern while still compressing the real distances heavily.",
    exploreSteps: [
      "Compare one day with one year and match each to the correct motion.",
      "Compare one inner orbit with one outer orbit in the same time window.",
      "Use the scale bar to explain why the drawing is not literal distance-for-distance.",
    ],
    watchFor: [
      "Apparent motion is what we see from Earth's viewpoint.",
      "Rotation and orbit answer different timing questions.",
      "Farther orbits usually mean longer year laps.",
    ],
    tryFirst: "Match one day to one rotation and one year to one orbit before you read the orbit-size comparison.",
    takeaway: "Sky motion becomes much clearer when viewpoint, real motion, and scale are kept in separate slots.",
  },
};

export function f5SimulationCopy(code: string): F5SimulationCopy | undefined {
  return F5_SIMULATION_COPY[code];
}

export function f5ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "F5_L1":
      return ["Keep Earth, Moon, and Sun on one shared board.", "Use gravity and main host to explain the routes.", "Treat scale as compressed rather than literal."];
    case "F5_L2":
      return ["Use spin before orbit when you explain day and night.", "Keep a lit half and a dark half visible together.", "Track one city marker through the turn."];
    case "F5_L3":
      return ["Keep the axis direction fixed in space.", "Use opposite-hemisphere comparison.", "Treat sunlight angle as stronger than simple distance for seasons."];
    case "F5_L4":
      return ["Keep the Moon half lit all month.", "Use viewpoint language for phases.", "Reserve shadow language for eclipses."];
    case "F5_L5":
      return ["Sort by body type and main host together.", "Do not flatten every orbiting body into planet.", "Keep rocky and icy small bodies distinct."];
    case "F5_L6":
      return ["Separate apparent motion from real motion.", "Match day to rotation and year to orbit.", "Use scale-compression language before trusting the sketch literally."];
    default:
      return [];
  }
}

export function f5ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "F5_L1":
      return ["Earth, Moon, and Sun form one linked system.", "Earth orbits the Sun and the Moon mainly orbits Earth.", "Gravity keeps the routes organized.", "Scale is much larger than a small sketch suggests."];
    case "F5_L2":
      return ["Earth's rotation causes day and night.", "Half of Earth is lit and half is dark at any moment.", "One day belongs to one spin rather than one orbit."];
    case "F5_L3":
      return ["Axial tilt drives the seasons.", "Opposite hemispheres experience opposite seasonal lean.", "Distance from the Sun is too weak as the main seasons explanation."];
    case "F5_L4":
      return ["The Moon is always half lit by the Sun.", "Phases come from changing viewing angle.", "Eclipses are special shadow alignments rather than the monthly phase rule."];
    case "F5_L5":
      return ["The Solar System contains planets, moons, dwarf planets, asteroids, comets, and more.", "Main host helps distinguish moons from Sun-orbiting worlds.", "Body type and role keep the family organized."];
    case "F5_L6":
      return ["A day comes from Earth's rotation.", "A year comes from Earth's orbit around the Sun.", "Apparent sky motion is viewpoint-based and Solar System scale is heavily compressed in most drawings."];
    default:
      return [];
  }
}

export function f5ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = F5_VISUAL_META[code.replace("_", "")];
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

export function f5ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = F5_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    F5_L1: "Use the shared system visual to explain why Earth, Moon, and Sun are stronger as one linked picture than as separate facts.",
    F5_L2: "Use the day-night visual to explain why one city changes from daylight to darkness because Earth rotates.",
    F5_L3: "Use the seasons visual to explain why opposite hemispheres can have opposite seasons at the same time.",
    F5_L4: "Use the Moon-phase visual to explain why phases are not just Earth's shadow every month.",
    F5_L5: "Use the Solar System family visual to explain why main host and body type both matter in classification.",
    F5_L6: "Use the sky-motion visual to explain why day, year, apparent motion, and scale should not be collapsed into one idea.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the F5 visual to explain the lesson's core astronomy relationship in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
