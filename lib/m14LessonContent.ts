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
    image_url: `${M14_ASSET_BASE}/M14_L1/diagrams/m14-l1-solar-court.svg`,
    visual_title: "The Solar Court keeps the whole family around one central lantern",
    visual_caption: "This court view keeps planets, dwarf planets, moons, asteroids, and comets in one Sun-centered family instead of letting them blur into one category.",
    visual_callouts: [
      "The Sun is the central star and main light source.",
      "Not everything orbiting the Sun is a planet.",
      "Moons belong as companion riders around larger worlds.",
      "A dwarf planet can orbit the Sun directly and still stay a separate category.",
    ],
  },
  M14L2: {
    image_url: `${M14_ASSET_BASE}/M14_L2/diagrams/m14-l2-hub-pull-routes.svg`,
    visual_title: "Ring routes are pull-guided paths, not rigid tracks",
    visual_caption: "The hub-pull view keeps gravity and forward motion on the same board so orbit shape reads like caused motion instead of a rail in space.",
    visual_callouts: [
      "Gravity bends the path inward.",
      "Forward motion keeps the world moving around the Sun.",
      "The same idea explains moons around planets too.",
    ],
  },
  M14L3: {
    image_url: `${M14_ASSET_BASE}/M14_L3/diagrams/m14-l3-spin-for-daylight.svg`,
    visual_title: "Spin makes day-face and night-face",
    visual_caption: "The spin board keeps Earth's rotation separate from its yearly orbit so day and night stay tied to turning, not to revolution around the Sun.",
    visual_callouts: [
      "Rotation brings a place into and out of sunlight.",
      "Half the world is lit while half is dark at any moment.",
      "Orbit and rotation answer different timing questions.",
    ],
  },
  M14L4: {
    image_url: `${M14_ASSET_BASE}/M14_L4/diagrams/m14-l4-season-switch.svg`,
    visual_title: "Tilt, not distance, explains the seasonal switch",
    visual_caption: "The June-December comparison keeps Earth's axis pointing the same way in space so opposite hemispheres and sunlight angle stay readable.",
    visual_callouts: [
      "The axis stays tilted in the same direction in space.",
      "One hemisphere leans toward the Sun while the other leans away.",
      "Seasons come from tilt and sunlight angle, not a simple distance change.",
    ],
  },
  M14L5: {
    image_url: `${M14_ASSET_BASE}/M14_L5/diagrams/m14-l5-moon-face-challenge.svg`,
    visual_title: "Moon phases come from the viewing angle to the lit half",
    visual_caption: "The Sun-Earth-Moon geometry board keeps the Moon half lit at all times so ordinary phases stay clearly separate from eclipses.",
    visual_callouts: [
      "The Sun lights half of the Moon all the time.",
      "Phases change because our view of that lit half changes.",
      "Earth's shadow is an eclipse idea, not the monthly phase rule.",
    ],
  },
  M14L6: {
    image_url: `${M14_ASSET_BASE}/M14_L6/diagrams/m14-l6-outer-lap-puzzle.svg`,
    visual_title: "Farther ring reach usually means a longer year lap",
    visual_caption: "The inner-outer comparison turns year length into a distance pattern instead of a fact table to memorize.",
    visual_callouts: [
      "Inner worlds can complete more laps in the same interval.",
      "Outer worlds usually take longer for one full orbit.",
      "Orbital period is different from rotation period.",
    ],
  },
};

export function m14QuestionVisualMeta(itemId: string): M14QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M14L[1-6])_[A-Z]+\d+$/);
  return match ? M14_VISUAL_META[match[1]] : undefined;
}

const M14_SIMULATION_COPY: Record<string, M14SimulationCopy> = {
  M14_L1: {
    title: "Solar court sorter",
    instructions: "Keep the whole Solar System on one Sun-centered board so category sorting stays tied to host body and object type.",
    taskPrompt: "Sort bodies into planet, dwarf planet, moon, asteroid, or comet, then explain why one central Sun, main-host clues, and the dwarf-planet neighborhood rule keep this family organized.",
    exploreSteps: [
      "Start by separating Sun-orbiting worlds from companion riders.",
      "Then compare rocky small bodies with icy visitors.",
      "Finish by checking why not everything around the Sun counts as a planet, including the dwarf-planet clue.",
    ],
    watchFor: [
      "The Sun is the central lantern and main host.",
      "Moons mainly orbit larger worlds, not the Sun directly.",
      "Comets and asteroids stay different because icy and rocky bodies behave differently.",
      "Dwarf planets can orbit the Sun directly without counting as full planets.",
    ],
    tryFirst: "Place the Sun at the center, then sort one planet, one moon, one dwarf planet, one asteroid, and one comet. After that, compare the planet and dwarf planet and say what extra clue keeps them apart.",
    takeaway: "The Solar System is strongest as one organized Sun-centered family with several distinct body types.",
  },
  M14_L2: {
    title: "Hub pull routes lab",
    instructions: "Use one moving world and one central lantern so orbit shape stays tied to gravity plus forward motion instead of to an invisible track.",
    taskPrompt: "Change inward pull and forward motion, then explain why a stable ring route is a path produced by motion and gravity working together.",
    exploreSteps: [
      "Increase the inward pull while keeping forward motion fixed.",
      "Then reduce forward motion and compare the curvature.",
      "Finally connect the same gravity story to moons around planets.",
    ],
    watchFor: [
      "Orbits are curved paths, not rigid rails.",
      "Gravity shapes the route continuously.",
      "The same orbit principle works for planets and moons.",
    ],
    tryFirst: "Begin with a medium orbit, then strengthen hub pull without changing forward motion. The route should bend more strongly before you name the idea formally.",
    takeaway: "Orbit means pull-guided motion, not a built structure in space.",
  },
  M14_L3: {
    title: "Spin for daylight",
    instructions: "Keep Earth's spin and the Sun's light on one board so day and night stay a rotation story instead of sliding into an orbit story.",
    taskPrompt: "Turn Earth through one full spin, track one city marker, and explain how one rotation moves that place from night-face to day-face and back again.",
    exploreSteps: [
      "Start with the city in darkness.",
      "Rotate until the city crosses onto the lit half.",
      "Complete the spin and compare day length with one full rotation.",
    ],
    watchFor: [
      "Rotation, not yearly revolution, causes day and night.",
      "Each place alternates between lit and dark halves.",
      "A 24-hour day belongs to the spin cycle.",
    ],
    tryFirst: "Put the city just inside the dark half, then rotate until it enters sunlight. That first crossing makes the day-night mechanism feel immediate.",
    takeaway: "Day and night come from rotation carrying places toward and away from sunlight.",
  },
  M14_L4: {
    title: "Season switch",
    instructions: "Keep Earth's tilt fixed in space while it moves around the Sun so sunlight angle and opposite hemispheres stay visible together.",
    taskPrompt: "Compare June and December positions, then explain why one hemisphere gets more direct sunlight while the other gets less.",
    exploreSteps: [
      "Set the tilt first and keep it pointing the same way in space.",
      "Move Earth to the opposite side of the orbit.",
      "Compare which hemisphere leans toward the Sun in each position.",
    ],
    watchFor: [
      "Tilt is the seasonal cause.",
      "Opposite hemispheres get opposite seasonal lean.",
      "Distance alone is not enough to explain the seasonal pattern.",
    ],
    tryFirst: "Start with June and identify which hemisphere leans toward the Sun, then jump half a year later and check which hemisphere has swapped roles.",
    takeaway: "Seasons follow axial tilt and changing sunlight angle, not a simple close-far distance story.",
  },
  M14_L5: {
    title: "Moon face challenge",
    instructions: "Keep the Sun, Earth, and Moon on one geometry board so ordinary phases stay a viewing story rather than a shadow myth.",
    taskPrompt: "Move the Moon through new, quarter, and full positions, then explain how the visible part of the lit half changes from Earth.",
    exploreSteps: [
      "Start with the Moon near the Sun side of Earth.",
      "Move it to first quarter, then full moon.",
      "Switch to a waning position and compare the visible lit fraction.",
    ],
    watchFor: [
      "The Moon stays half lit by the Sun.",
      "Phases depend on the observer's view from Earth.",
      "Earth's shadow belongs to eclipse reasoning instead.",
    ],
    tryFirst: "Place the Moon opposite the Sun first so the full-moon case is obvious, then bring it back toward the Sun side and watch the visible lit portion shrink.",
    takeaway: "Moon phases come from changing viewpoint to the sunlit half of the Moon.",
  },
  M14_L6: {
    title: "Outer lap puzzle",
    instructions: "Compare inner and outer rings in the same time window so year length feels like a distance pattern instead of a memorized planet list.",
    taskPrompt: "Run one shared time interval, count laps for inner and outer worlds, and explain why the farther orbit usually takes longer for one complete revolution.",
    exploreSteps: [
      "Start with one inner and one outer ring.",
      "Run the same time interval and compare completed laps.",
      "Move the outer world farther away and compare again.",
    ],
    watchFor: [
      "Orbital period means one full lap around the Sun.",
      "Farther rings usually take longer.",
      "Day length and year length are different measurements.",
    ],
    tryFirst: "Use a close inner ring and a much farther outer ring, then count how many laps each completes in the same interval before you summarize the rule.",
    takeaway: "Farther solar orbits usually correspond to longer orbital periods.",
  },
};

export function m14SimulationCopy(code: string): M14SimulationCopy | undefined {
  return M14_SIMULATION_COPY[code];
}

export function m14ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M14_L1":
      return ["Keep the Sun at the center of the family.", "Sort by what the body is and what it mainly orbits.", "Use the dwarf-planet neighborhood clue before calling every round Sun-orbiting body a full planet.", "Do not collapse planets, moons, asteroids, comets, and dwarf planets into one bucket."];
    case "M14_L2":
      return ["Treat orbit as a path, not a track.", "Use gravity and forward motion together.", "Reuse the same pull story for planets and moons."];
    case "M14_L3":
      return ["Keep rotation separate from revolution.", "Use lit-half and dark-half language.", "Tie the local cycle to one spin, not one orbit."];
    case "M14_L4":
      return ["Keep tilt fixed in space across the orbit.", "Use hemisphere comparison.", "Treat sunlight angle as stronger than distance for seasons."];
    case "M14_L5":
      return ["Keep the Moon always half lit.", "Use viewpoint language instead of shadow language.", "Separate ordinary phases from eclipses."];
    case "M14_L6":
      return ["Compare inner and outer rings in the same time window.", "Use year lap for orbital period.", "Keep day length separate from year length."];
    default:
      return [];
  }
}

export function m14ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M14_L1":
      return ["The Solar System is one Sun-centered family.", "Planets, dwarf planets, moons, asteroids, and comets are different categories.", "Main host helps distinguish planets from moons.", "A dwarf planet can orbit the Sun directly and still stay distinct because it has not cleared its orbital neighborhood like a full planet has."];
    case "M14_L2":
      return ["Gravity is the hub pull.", "An orbit is a pull-guided path.", "Forward motion and inward pull combine to make the route curve."];
    case "M14_L3":
      return ["Earth's rotation causes day and night.", "Half the world is lit and half is dark at any moment.", "A daily cycle belongs to spin, not to the yearly orbit."];
    case "M14_L4":
      return ["Axial tilt causes seasons.", "Opposite hemispheres lean differently at different times of year.", "Seasons are not mainly caused by distance from the Sun."];
    case "M14_L5":
      return ["The Moon reflects sunlight.", "The Moon is always half lit by the Sun.", "Phases come from changing viewing geometry."];
    case "M14_L6":
      return ["A year lap is one full orbit.", "Farther ring reach usually means a longer year.", "Orbital period is different from rotation period."];
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
    M14_L1: "Use the Solar Court visual to explain why the Solar System is stronger as one Sun-centered family than as a random object list.",
    M14_L2: "Use the ring-route visual to explain why an orbit is better understood as a gravity-guided path than as a track.",
    M14_L3: "Use the spin visual to explain why day and night come from rotation instead of from Earth's yearly orbit.",
    M14_L4: "Use the season-switch visual to explain why axial tilt is a better cause of seasons than changing Earth-Sun distance.",
    M14_L5: "Use the Moon-face visual to explain why ordinary Moon phases are a viewing-angle story rather than an Earth-shadow story.",
    M14_L6: "Use the outer-lap visual to explain why farther solar rings usually mean longer orbital periods.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the M14 authored visual to explain the key solar-system relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
