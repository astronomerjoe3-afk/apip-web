"use client";

import { m10SimulationCopy } from "./m10LessonContent";

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
    visual_caption: "The source raises the energy of each unit of charge, so voltage belongs to energy per charge rather than to charge amount or current.",
    visual_callouts: [
      "Voltage is measured in joules per coulomb.",
      "A larger potential difference gives more energy to each coulomb.",
      "Voltage and current are linked in circuits but are not the same quantity.",
    ],
  },
  M9L4: {
    image_url: "/lesson_assets/M10/M10_L4/diagrams/m10-l4-route-drag.svg",
    visual_title: "Resistance belongs to the route, not to the battery",
    visual_caption: "Length, cross-sectional area, and material determine how strongly the path opposes charge flow.",
    visual_callouts: [
      "Longer wires give greater resistance.",
      "Wider wires give lower resistance.",
      "Resistance depends on material and geometry together.",
    ],
  },
  M9L5: {
    image_url: "/lesson_assets/M10/M10_L5/diagrams/m10-l5-ohmic-rule.svg",
    visual_title: "Ohm's law links voltage, current, and resistance for ohmic conductors",
    visual_caption: "At fixed conditions, current is proportional to voltage and inversely related to resistance for an ohmic component.",
    visual_callouts: [
      "At fixed resistance, increasing voltage increases current.",
      "At fixed voltage, increasing resistance decreases current.",
      "A straight I-V graph through the origin is the ohmic clue.",
    ],
  },
  M9L6: {
    image_url: "/lesson_assets/M11/M11_L4/diagrams/m11-l4-route-map.svg",
    visual_title: "Series and parallel circuits must be read from the route structure",
    visual_caption: "One-path chains and branch networks obey different current-and-voltage rules, so the route shape has to be identified first.",
    visual_callouts: [
      "Series circuits have one uninterrupted path.",
      "Parallel branches connect across the same two junctions.",
      "Series and parallel networks do not share the same current-and-voltage rule.",
    ],
  },
};

const M9_L6_SIMULATION: M9SimulationCopy = {
  title: "Series and parallel compare lab",
  instructions: "Switch between a one-path chain and a branching network before you decide which current-and-voltage rule to use.",
  taskPrompt: "Compare one series route with one parallel route, then explain which quantity stays common in each circuit and how the total current changes.",
  exploreSteps: [
    "Start with the series route and read the one common current story.",
    "Switch to the parallel route and read the common branch-voltage story.",
    "Change one resistor and compare how the source current responds in each network.",
  ],
  watchFor: [
    "Series circuits keep one common current through the chain.",
    "Parallel branches share the same potential difference across matching junctions.",
    "Adding or removing branches changes the total behaviour of the whole circuit.",
  ],
  tryFirst: "Start with two equal resistors in series on one supply, then switch the same two resistors into parallel and compare the source current before saying anything about brightness or layout.",
  takeaway: "Circuit behaviour stays much safer when the learner identifies the route structure first and only then chooses the current-and-voltage rule.",
};

function normalizeItemId(itemId: string): string {
  return String(itemId || "").trim().replace(/-/g, "_").toUpperCase();
}

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function remapM9ToM10(code: string): string {
  return normalizeCode(code).replace(/^M9_/, "M10_");
}

export function m9QuestionVisualMeta(itemId: string): M9QuestionVisualMeta | undefined {
  const normalized = normalizeItemId(itemId);
  const match = normalized.match(/^(M9L[1-6])_[A-Z]+\d+$/);
  return match ? M9_VISUAL_META[match[1]] : undefined;
}

export function m9SimulationCopy(code: string): M9SimulationCopy | undefined {
  const normalized = normalizeCode(code);
  if (/^M9_L[1-5]$/.test(normalized)) {
    return m10SimulationCopy(remapM9ToM10(normalized));
  }
  if (normalized === "M9_L6") return M9_L6_SIMULATION;
  return undefined;
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
        "Keep source-boost language separate from current language.",
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
        "Link I-V graph shape back to proportional reasoning.",
      ];
    case "M9_L6":
      return [
        "Decide first whether the network is series or parallel.",
        "Keep same-current and same-voltage rules separate.",
        "Use junctions and paths rather than page layout to classify the circuit.",
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
        "A source gives each coulomb an energy rise.",
        "Voltage and current are different electrical quantities.",
      ];
    case "M9_L4":
      return [
        "Resistance is a property of the component or path.",
        "Longer routes increase resistance.",
        "Greater cross-sectional area reduces resistance.",
      ];
    case "M9_L5":
      return [
        "For an ohmic conductor, current is proportional to voltage when conditions stay constant.",
        "At fixed resistance, larger voltage gives larger current.",
        "At fixed voltage, larger resistance gives smaller current.",
      ];
    case "M9_L6":
      return [
        "Series circuits have one path and the same current through each component.",
        "Parallel branches share the same potential difference across matching junctions.",
        "Current splits at a junction and recombines after parallel branches.",
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
