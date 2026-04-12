"use client";

type UnknownRecord = Record<string, unknown>;

export type M9QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M9SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M9_VISUAL_META: Record<string, M9QuestionVisualMeta> = {
  M9L1: {
    image_url: "/lesson_assets/M10/M10_L1/diagrams/m10-l1-carrier-loop.svg",
    visual_title: "Charge carriers circulate only when the loop stays complete",
    visual_caption: "The same carriers move all around one closed route, while the current story belongs to the common rate at every checkpoint.",
    visual_callouts: [
      "A steady current needs one complete conducting path.",
      "Charge carriers circulate; they are not used up by the lamp.",
      "Current in a simple loop is the same before and after a component.",
    ],
  },
  M9L2: {
    image_url: "/lesson_assets/M10/M10_L2/diagrams/m10-l2-checkpoint-rate.svg",
    visual_title: "Current is charge flow rate through a checkpoint",
    visual_caption: "The quantity of charge present and the rate at which charge passes one point are different electrical ideas.",
    visual_callouts: [
      "Current measures charge per second.",
      "1 A means 1 C passes a point each second.",
      "A large charge store does not automatically mean a large current.",
    ],
  },
  M9L3: {
    image_url: "/lesson_assets/M10/M10_L3/diagrams/m10-l3-lift-station.svg",
    visual_title: "Voltage is energy transferred to each coulomb",
    visual_caption: "The source raises the energy of each unit of charge, and component drops share that energy story around the loop rather than changing the amount of charge present.",
    visual_callouts: [
      "Voltage is measured in joules per coulomb.",
      "A larger potential difference gives more energy to each coulomb.",
      "Source and component voltages track energy transfer, not charge loss.",
    ],
  },
  M9L4: {
    image_url: "/lesson_assets/M10/M10_L4/diagrams/m10-l4-route-drag.svg",
    visual_title: "Resistance belongs to the route, not to the battery",
    visual_caption: "Length, cross-sectional area, and material determine how strongly the path opposes charge flow.",
    visual_callouts: [
      "For the same material, longer wires give greater resistance.",
      "For the same material, wider wires give lower resistance.",
      "Resistance depends on material and geometry together.",
    ],
  },
  M9L5: {
    image_url: "/lesson_assets/M10/M10_L5/diagrams/m10-l5-ohmic-rule.svg",
    visual_title: "Ohm's law and I-V characteristics show when resistance stays constant",
    visual_caption: "At fixed conditions, an ohmic component gives a straight origin-passing I-V graph, while non-ohmic behaviour appears when the effective resistance changes.",
    visual_callouts: [
      "At fixed resistance, increasing voltage increases current.",
      "At fixed voltage, increasing resistance decreases current.",
      "A straight I-V graph through the origin is the constant-resistance clue.",
    ],
  },
  M9L6: {
    image_url: "/lesson_assets/M11/M11_L4/diagrams/m11-l4-route-map.svg",
    visual_title: "Series, parallel, and mixed circuits must be reduced from structure first",
    visual_caption: "One-path chains, shared-junction branches, and mixed networks obey different current-and-voltage rules, so the valid section must be identified before the calculation starts.",
    visual_callouts: [
      "Series circuits have one uninterrupted path.",
      "Parallel branches connect across the same two junctions.",
      "Mixed circuits are solved section by section, not with one global slogan.",
    ],
  },
};

const M9_SIMULATION_COPY: Record<string, M9SimulationCopy> = {
  M9_L1: {
    title: "Complete-loop current ledger",
    instructions: "Open and close the route, then compare the current before and after the components while keeping charge conservation separate from energy transfer.",
    taskPrompt: "Use the switch, source, and component sliders to test whether one-path current changes position or only stops when the route breaks.",
    exploreSteps: [
      "Close the route and compare the two ammeter checkpoints.",
      "Open the route and notice which quantity collapses immediately.",
      "Raise the source voltage and keep watching what stays equal around the loop.",
    ],
    watchFor: [
      "A steady current needs one complete conducting path.",
      "In a simple loop, the current is the same before and after each component.",
      "Components transfer energy without using up charge carriers.",
    ],
    tryFirst: "Start with the switch open, then close it and compare the current at the two checkpoints before you change any resistance.",
    takeaway: "The safest first move is to test the route condition, then separate conserved charge flow from energy transfer in the components.",
  },
  M9_L2: {
    title: "Charge checkpoint rate lab",
    instructions: "Treat current as a rate question by changing charge and time independently at one checkpoint.",
    taskPrompt: "Compare amount and time together, then translate the reading back into coulombs per second instead of using a memorized symbol only.",
    exploreSteps: [
      "Fix the charge and shorten the time to see the current rise.",
      "Fix the time and raise the charge to see the current rise for a different reason.",
      "Read the result back as both amperes and charge per second.",
    ],
    watchFor: [
      "1 A means 1 C passes a point each second.",
      "A large total charge does not automatically mean a large current.",
      "Charge amount and charge-flow rate are different electrical ideas.",
    ],
    tryFirst: "Set 12 C and 6 s, then halve the time without changing the charge and explain why the current doubles.",
    takeaway: "Current questions become safer when the learner treats them as checkpoint-rate stories rather than as stored-charge stories.",
  },
  M9_L3: {
    title: "Energy-per-charge lift lab",
    instructions: "Compare the source voltage with one component voltage, then track how much energy each coulomb gains and loses around the same loop.",
    taskPrompt: "Use the source, component, and charge sliders to turn volts into joules per coulomb and total transferred energy.",
    exploreSteps: [
      "Set a source voltage and decide how much energy each coulomb gets from it.",
      "Choose a component voltage and calculate how much of that energy is transferred there.",
      "Compare the component drop with the rest of the loop instead of collapsing everything into one number.",
    ],
    watchFor: [
      "Voltage is energy transferred per unit charge.",
      "The same charge can transfer different amounts of energy at different voltages.",
      "Source and component voltages belong to the energy story, not the current story.",
    ],
    tryFirst: "Use a 12 V source with a 5 V lamp drop and 2 C of charge, then compare the lamp energy with the rest-of-circuit energy.",
    takeaway: "Potential-difference reasoning becomes stronger when each voltage is read as joules per coulomb before the total energy is calculated.",
  },
  M9_L4: {
    title: "Resistance route designer",
    instructions: "Change material factor, length, and cross-sectional area one at a time so the route property stays visible before the current response.",
    taskPrompt: "Build easier and harder routes, then explain why the same source drives different currents through them.",
    exploreSteps: [
      "Hold material and area fixed while you increase the length.",
      "Hold material and length fixed while you widen the route.",
      "Change the material factor and compare how the source current responds.",
    ],
    watchFor: [
      "For the same material, greater length gives greater resistance.",
      "For the same material, greater cross-sectional area gives lower resistance.",
      "Resistance depends on material and geometry together.",
    ],
    tryFirst: "Double the route length, then halve the route area and explain why the resistance jumps much faster than a one-word 'harder wire' answer suggests.",
    takeaway: "Route comparisons become much safer when material and geometry are named explicitly before the current change is predicted.",
  },
  M9_L5: {
    title: "I-V characteristic explorer",
    instructions: "Switch between ohmic and non-ohmic behaviour, then compare the graph shape with the current response instead of treating Ohm's law as a chant.",
    taskPrompt: "Use voltage, resistance, and mode controls to decide when resistance stays constant and when the I-V curve stops being straight.",
    exploreSteps: [
      "Keep the component ohmic and raise the voltage to check proportional current growth.",
      "Switch to the non-ohmic mode and compare the new current response.",
      "Use the graph cue to explain whether resistance is staying constant or changing.",
    ],
    watchFor: [
      "A straight origin-passing I-V graph is the constant-resistance clue.",
      "For an ohmic component, voltage and current stay proportional under fixed conditions.",
      "A curved I-V response means the effective resistance is changing over the range.",
    ],
    tryFirst: "Keep the resistance fixed in ohmic mode, then double the voltage and compare that with the same change in non-ohmic mode.",
    takeaway: "Ohm's law becomes more rigorous when the learner tests the graph shape and the fixed-conditions rule together.",
  },
  M9_L6: {
    title: "Network reduction and branch-law lab",
    instructions: "Switch between series, parallel, and mixed networks before you decide which current-and-voltage rule to use.",
    taskPrompt: "Reduce the valid section first, then explain what stays common, what splits, and how the source current is rebuilt.",
    exploreSteps: [
      "Start with the series chain and read the one common current story.",
      "Switch to the parallel pair and read the common branch-voltage story.",
      "Move to the mixed network and reduce the branch block before predicting the source current.",
    ],
    watchFor: [
      "Series circuits keep one common current through the chain.",
      "Parallel branches share the same potential difference across matching junctions.",
      "Mixed circuits are solved section by section rather than by one global rule.",
    ],
    tryFirst: "Start with a 2 ohm series resistor feeding 6 ohm and 3 ohm branches, then reduce the branch block before calculating any current.",
    takeaway: "Circuit analysis becomes much stronger when the learner identifies the valid series or parallel section first and only then applies the current-voltage rule.",
  },
};

function normalizeItemId(itemId: string): string {
  return String(itemId || "").trim().replace(/-/g, "_").toUpperCase();
}

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

export function m9QuestionVisualMeta(itemId: string): M9QuestionVisualMeta | undefined {
  const normalized = normalizeItemId(itemId);
  const match = normalized.match(/^(M9L[1-6])_[A-Z]+\d+$/);
  return match ? M9_VISUAL_META[match[1]] : undefined;
}

export function m9SimulationCopy(code: string): M9SimulationCopy | undefined {
  return M9_SIMULATION_COPY[normalizeCode(code)];
}

export function m9ScaffoldFocusExtras(code: string): string[] {
  switch (normalizeCode(code)) {
    case "M9_L1":
      return [
        "Name the moving charge carriers before naming the current.",
        "Use complete-loop language for sustained current.",
        "Keep charge conservation separate from energy transfer.",
      ];
    case "M9_L2":
      return [
        "Read current as charge per second at one point.",
        "Keep amount of charge separate from rate of flow.",
        "Translate amperes back into coulombs per second.",
      ];
    case "M9_L3":
      return [
        "Treat voltage as energy per unit charge.",
        "Track source and component drops in the same loop-energy story.",
        "Do not describe a battery as a store of current.",
      ];
    case "M9_L4":
      return [
        "Put the resistance story on the route, not the source.",
        "Use length, area, and material before algebra.",
        "Compare how route changes affect current for the same supply.",
      ];
    case "M9_L5":
      return [
        "Hold one variable fixed before changing the other.",
        "Use Ohm's law as an observed rule for ohmic conductors.",
        "Link I-V graph shape back to constant or changing resistance.",
      ];
    case "M9_L6":
      return [
        "Decide first whether the network is series, parallel, or mixed.",
        "Keep same-current and same-voltage rules tied to the correct section only.",
        "Reduce the valid block before calculating the source current.",
      ];
    default:
      return [];
  }
}

export function m9ScaffoldCoreBullets(code: string): string[] {
  switch (normalizeCode(code)) {
    case "M9_L1":
      return [
        "Charge carriers move around the loop and are not used up by components.",
        "A steady current needs a complete circuit.",
        "In a simple loop, the current is the same at every point.",
      ];
    case "M9_L2":
      return [
        "Current is the rate of charge flow.",
        "1 A means 1 C of charge passes a point each second.",
        "Current is not the same as the total charge in the circuit.",
      ];
    case "M9_L3":
      return [
        "Potential difference is energy transferred per unit charge.",
        "A source gives each coulomb an energy rise and components take defined shares of it.",
        "Voltage and current are different electrical quantities.",
      ];
    case "M9_L4":
      return [
        "Resistance is a property of the component or path.",
        "For the same material, longer routes increase resistance.",
        "For the same material, greater cross-sectional area reduces resistance.",
      ];
    case "M9_L5":
      return [
        "For an ohmic conductor, current is proportional to voltage when conditions stay constant.",
        "At fixed resistance, larger voltage gives larger current.",
        "A straight origin-passing I-V graph is the constant-resistance clue.",
      ];
    case "M9_L6":
      return [
        "Series circuits have one path and the same current through each component.",
        "Parallel branches share the same potential difference across matching junctions.",
        "Mixed circuits are reduced section by section before the source current is calculated.",
      ];
    default:
      return [];
  }
}

export function m9ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M9_VISUAL_META[normalizeCode(code).replace("_", "")];
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

export function m9ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M9_VISUAL_META[normalizeCode(code).replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key electrical relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
