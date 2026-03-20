"use client";

type UnknownRecord = Record<string, unknown>;

export type M5QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M5SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M5_VISUAL_META: Record<string, M5QuestionVisualMeta> = {
  M5L1: {
    image_url: "/lesson-media/m5/m5-l1-particle-rules.svg",
    visual_title: "Micro-pucks keep the same size",
    visual_caption: "Heating changes motion and spacing patterns, not the size of the particles themselves.",
    visual_callouts: [
      "Particle size stays fixed across the lesson.",
      "Bulk properties belong to the whole material, not one isolated particle.",
      "State language must combine motion, spacing, and attraction.",
    ],
  },
  M5L2: {
    image_url: "/lesson-media/m5/m5-l2-lock-slide.svg",
    visual_title: "Lock Mode and Slide Mode",
    visual_caption: "Solids and liquids both keep particles close, but only liquids let neighbors change readily.",
    visual_callouts: [
      "Solids: close particles, fixed positions, vibration.",
      "Liquids: close particles, mobile neighbors, flow.",
      "Liquid flow does not require gas-like huge gaps.",
    ],
  },
  M5L3: {
    image_url: "/lesson-media/m5/m5-l3-brownian-pebble.svg",
    visual_title: "Drift Mode and Brownian evidence",
    visual_caption: "The visible Wander Pebble jitters because surrounding unseen particles keep colliding with it unevenly.",
    visual_callouts: [
      "Gas particles are far apart and move freely between collisions.",
      "Brownian motion is a visible effect of invisible particle motion.",
      "The visible particle is not self-powered.",
    ],
  },
  M5L4: {
    image_url: "/lesson-media/m5/m5-l4-pulse-level.svg",
    visual_title: "Same Pulse, different crowd size",
    visual_caption: "Temperature is the average particle-motion reading, so equal pulse does not force equal whole-system total.",
    visual_callouts: [
      "Pulse Level is an average, not a total.",
      "Same temperature does not guarantee same internal energy.",
      "Crowd size can change the total without changing the average.",
    ],
  },
  M5L5: {
    image_url: "/lesson-media/m5/m5-l5-plaza-store.svg",
    visual_title: "Plaza Store and internal energy",
    visual_caption: "Internal energy counts both the motion of all particles and the energy stored in their arrangement.",
    visual_callouts: [
      "Internal energy is a whole-system total.",
      "Kinetic and potential parts both matter.",
      "Same temperature can still leave different total stores.",
    ],
  },
  M5L6: {
    image_url: "/lesson-media/m5/m5-l6-state-change.svg",
    visual_title: "State-change energy split",
    visual_caption: "Added energy can loosen links and raise internal energy even when temperature changes only a little.",
    visual_callouts: [
      "Added energy does not always mainly raise temperature.",
      "State change can feed the arrangement or potential-energy part.",
      "Track where the energy goes before deciding what changed.",
    ],
  },
};

export function m5QuestionVisualMeta(itemId: string): M5QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M5L[1-6])_[A-Z]+\d+$/);
  return match ? M5_VISUAL_META[match[1]] : undefined;
}

const M5_SIMULATION_COPY: Record<string, M5SimulationCopy> = {
  M5_L1: {
    title: "Particle rules lab",
    instructions: "Use the Pulse-Plaza starter to test which changes belong to one particle and which belong to the whole crowd pattern.",
    taskPrompt: "Raise the pulse, change the grip, and compare two crowd sizes. Then explain why the particles stay the same size while motion, spacing, and whole-material properties change.",
    exploreSteps: [
      "Change pulse while watching the particle-size readout stay fixed.",
      "Compare a locked and a drifting crowd without letting the particles grow.",
      "Use one crowd-level property and one single-particle property in your explanation.",
    ],
    watchFor: [
      "Heating changes motion and spacing patterns, not particle size.",
      "Bulk properties belong to the whole material, not one isolated particle.",
      "State descriptions need motion, spacing, and attraction together.",
    ],
    tryFirst: "Start with medium pulse and medium grip, then double the pulse. The crowd becomes livelier, but the micro-puck diameter stays exactly the same.",
    takeaway: "The particle model gets stronger when students stop copying whole-material properties onto one particle.",
  },
  M5_L2: {
    title: "Lock and slide builder",
    instructions: "Keep particles close while you compare fixed-position Lock Mode with mobile-neighbor Slide Mode.",
    taskPrompt: "Build one solid and one liquid without ever giving the liquid gas-like huge gaps. Then explain the difference using spacing and neighbor mobility together.",
    exploreSteps: [
      "Create a locked, close-packed pattern first.",
      "Loosen the crowd into a sliding pattern while keeping it crowded.",
      "Use the neighbor-swap readout to separate solid from liquid.",
    ],
    watchFor: [
      "Solids and liquids are both close-packed in the model.",
      "Liquids flow because neighbors can change, not because the particles are far apart.",
      "A motion clue and a spacing clue should appear together in a strong answer.",
    ],
    tryFirst: "Keep the spacing index high in both panels, but raise neighbor swaps only in the liquid panel. That creates Slide Mode without turning it into a gas.",
    takeaway: "Liquid is not 'half gas'; it is close-packed matter with particle mobility.",
  },
  M5_L3: {
    title: "Drift and jostle lab",
    instructions: "Switch from Slide Mode to Drift Mode and use the Wander Pebble to make invisible collisions visible.",
    taskPrompt: "Build one true gas state and one Brownian evidence case. Then explain the jagged path as random collisions from surrounding unseen particles.",
    exploreSteps: [
      "Raise pulse and weaken grip until the state becomes Drift Mode.",
      "Turn on the Wander Pebble path trace.",
      "Compare low-pulse and high-pulse Brownian jostling.",
    ],
    watchFor: [
      "Gas particles are far apart and move freely between collisions.",
      "Brownian motion is caused by surrounding particles, not by the visible particle itself.",
      "Stronger surrounding motion gives stronger Brownian jitter.",
    ],
    tryFirst: "Build a drift crowd first, then switch the Wander Pebble on and raise the pulse. The path gets shakier because the surrounding hits get more vigorous.",
    takeaway: "Brownian motion is one of the clearest visual clues that unseen particles are always moving and colliding.",
  },
  M5_L4: {
    title: "Pulse level comparer",
    instructions: "Match the Pulse Level across two plazas so temperature stays an average idea while crowd size changes the whole-system story.",
    taskPrompt: "Keep two plazas at the same pulse but with different crowd sizes. Then explain what matches, what does not, and why temperature is not the same as total internal energy.",
    exploreSteps: [
      "Set one pulse value and hold it steady.",
      "Change the size of Crowd A and Crowd B separately.",
      "Compare the average-jiggle match with the whole-plaza total.",
    ],
    watchFor: [
      "Temperature answers an average-particle question.",
      "Same pulse does not guarantee the same total store.",
      "More particles can raise total energy without raising temperature.",
    ],
    tryFirst: "Keep the pulse at 6 for both plazas, then change Crowd B from 12 to 24 pucks. The pulse stays matched while the whole-system total rises.",
    takeaway: "Temperature is an average, not a hidden measure of system size.",
  },
  M5_L5: {
    title: "Plaza Store ledger",
    instructions: "Keep Pulse Level visible while you compare internal-energy totals from different crowd sizes and different state arrangements.",
    taskPrompt: "Create one same-temperature crowd-size comparison and one same-temperature state comparison. Then explain why Plaza Store is bigger in one case even though the pulse is matched.",
    exploreSteps: [
      "Fix the pulse first.",
      "Change crowd size and compare the total store.",
      "Hold the pulse fixed again and change the state arrangement to compare the link part of the store.",
    ],
    watchFor: [
      "Internal energy is total kinetic plus total potential energy.",
      "Crowd size and arrangement can both change the total store.",
      "Same temperature still allows different internal energies.",
    ],
    tryFirst: "Keep the pulse matched, double the crowd size, and watch the total store climb. Then keep pulse matched again but compare Slide Mode with Drift Mode to change the link share.",
    takeaway: "The whole-system store is richer than the pulse reading because it counts both motion and arrangement.",
  },
  M5_L6: {
    title: "State-change mission deck",
    instructions: "Track where added energy goes during a state change so temperature and internal-energy changes stop collapsing into one rule.",
    taskPrompt: "Build one mission where most added energy raises pulse and another where most of it loosens links. Then explain why the second case can raise internal energy without a large temperature jump.",
    exploreSteps: [
      "Set a starting state close to a boundary.",
      "Add energy and compare the pulse rise with the link-release rise.",
      "Explain the state progress using kinetic and potential parts together.",
    ],
    watchFor: [
      "Added energy does not always mainly raise temperature.",
      "State change can feed the potential-energy part strongly.",
      "Internal energy can rise even while the pulse meter changes only a little.",
    ],
    tryFirst: "Start near melting, add energy, and route most of it into link release. The state changes while the pulse meter rises only a little.",
    takeaway: "State-change problems become much clearer when students track where the energy goes before naming the result.",
  },
};

export function m5SimulationCopy(code: string): M5SimulationCopy | undefined {
  return M5_SIMULATION_COPY[code];
}

export function m5ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M5_L1":
      return [
        "Particles do not get bigger when heated.",
        "Bulk properties belong to the whole material, not one isolated particle.",
        "State depends on motion, spacing, and attraction together.",
      ];
    case "M5_L2":
      return [
        "Solids and liquids both keep particles close together.",
        "Liquids differ because neighbors can change more readily.",
        "Flow is not evidence of gas-like spacing.",
      ];
    case "M5_L3":
      return [
        "Gas particles are far apart and move freely between collisions.",
        "Brownian motion is caused by surrounding unseen particles.",
        "The visible Brownian particle is not self-powered.",
      ];
    case "M5_L4":
      return [
        "Temperature is an average particle-motion reading.",
        "Equal temperature does not force equal internal energy.",
        "Crowd size can change the total without changing the average.",
      ];
    case "M5_L5":
      return [
        "Internal energy is total kinetic and potential energy.",
        "State arrangement changes the potential-energy part.",
        "Same pulse does not force the same Plaza Store.",
      ];
    case "M5_L6":
      return [
        "Added energy does not always mainly raise temperature.",
        "State change can feed the arrangement or potential-energy part.",
        "Track where the energy goes before deciding what changed.",
      ];
    default:
      return [];
  }
}

export function m5ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M5_L1":
      return [
        "Particle size stays fixed while motion and spacing patterns can change.",
        "Bulk material properties do not belong to one isolated particle.",
        "State descriptions must use motion, spacing, and attraction together.",
      ];
    case "M5_L2":
      return [
        "Solids have closely packed particles vibrating about fixed positions.",
        "Liquids have closely packed particles that can move around one another.",
        "Liquid particles remain close together rather than gas-like.",
      ];
    case "M5_L3":
      return [
        "Gases have particles far apart that move freely except during collisions.",
        "Brownian motion is random visible jitter caused by invisible collisions.",
        "The Brownian particle is not moving by itself.",
      ];
    case "M5_L4":
      return [
        "Temperature is tied to average particle motion at this level.",
        "Pulse Level answers an average question, not a whole-system total question.",
        "The same temperature does not guarantee the same internal energy.",
      ];
    case "M5_L5":
      return [
        "Internal energy is the total kinetic and potential energy of all particles.",
        "Plaza Store includes both motion and arrangement contributions.",
        "State and crowd size can change internal energy without changing temperature.",
      ];
    case "M5_L6":
      return [
        "During a state change, added energy can loosen links as well as raise motion.",
        "Internal energy can rise even when temperature changes only a little.",
        "State changes are arrangement and total-energy changes, not particle-size changes.",
      ];
    default:
      return [];
  }
}

export function m5ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M5_VISUAL_META[code.replace("_", "")];
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

export function m5ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M5_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the main particle-model relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
