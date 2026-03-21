"use client";

type UnknownRecord = Record<string, unknown>;

export type M11QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M11SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M11_ASSET_BASE = "/lesson_assets/M11";

const M11_VISUAL_META: Record<string, M11QuestionVisualMeta> = {
  M11L1: {
    image_url: `${M11_ASSET_BASE}/M11_L1/diagrams/m11-l1-series-chain.svg`,
    visual_title: "One-lane chains keep one common current",
    visual_caption: "The series-chain visual keeps one route, one common current, and shared voltage drops visible together.",
    visual_callouts: [
      "One path means every carrier visits every station.",
      "Series current is the same everywhere in the chain.",
      "The source voltage is shared across the stations.",
    ],
  },
  M11L2: {
    image_url: `${M11_ASSET_BASE}/M11_L2/diagrams/m11-l2-branch-deck.svg`,
    visual_title: "Branch decks share voltage while current splits",
    visual_caption: "The branch-deck visual separates shared branch voltage from split branch currents.",
    visual_callouts: [
      "Parallel branches share the same two junctions.",
      "Branch voltage is the same across each branch.",
      "Branch currents split and add again when they rejoin.",
    ],
  },
  M11L3: {
    image_url: `${M11_ASSET_BASE}/M11_L3/diagrams/m11-l3-shed-rate.svg`,
    visual_title: "Task stations shed energy each second",
    visual_caption: "The shed-rate visual shows why power is an energy-transfer rate rather than a synonym for current.",
    visual_callouts: [
      "Power is energy transferred each second.",
      "A larger current and or voltage drop can raise power.",
      "Brightness and heating link to shed rate, not used-up current.",
    ],
  },
  M11L4: {
    image_url: `${M11_ASSET_BASE}/M11_L4/diagrams/m11-l4-route-map.svg`,
    visual_title: "Route maps show connection logic",
    visual_caption: "The route-map visual contrasts physical layout with schematic structure so students read the network, not the furniture.",
    visual_callouts: [
      "A schematic is a symbolic map of connections.",
      "Series and parallel are read from junctions and paths.",
      "Different drawings can still represent the same circuit.",
    ],
  },
  M11L5: {
    image_url: `${M11_ASSET_BASE}/M11_L5/diagrams/m11-l5-guard-link.svg`,
    visual_title: "Guard links and fault bridges",
    visual_caption: "The safety visual shows how a low-resistance fault can drive unsafe current and why the guard link must interrupt the path.",
    visual_callouts: [
      "Short circuits create dangerous low-resistance paths.",
      "Fuses and breakers protect by opening the circuit.",
      "Insulation protects by blocking unsafe contact.",
    ],
  },
  M11L6: {
    image_url: `${M11_ASSET_BASE}/M11_L6/diagrams/m11-l6-equivalent-drag.svg`,
    visual_title: "Equivalent drag reduces a network step by step",
    visual_caption: "The reduction visual shows how a mixed circuit becomes one total resistance through valid series and parallel steps.",
    visual_callouts: [
      "Reduce one valid block at a time.",
      "Series and parallel need different reduction rules.",
      "The final total resistance unlocks the total current step.",
    ],
  },
};

export function m11QuestionVisualMeta(itemId: string): M11QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M11L[1-6])_[A-Z]+\d+$/);
  return match ? M11_VISUAL_META[match[1]] : undefined;
}

const M11_SIMULATION_COPY: Record<string, M11SimulationCopy> = {
  M11_L1: {
    title: "Series chain lab",
    instructions: "Keep one-path current and shared voltage separate from the start.",
    taskPrompt: "Build a one-lane chain, add series stations, and explain why the same current passes every station.",
    exploreSteps: ["Start with two series stations.", "Add a third station and compare the total current.", "Read current and voltage drop as different stories."],
    watchFor: ["One route means one common current.", "Series resistance adds.", "Voltage is shared across the series stations."],
    tryFirst: "Set two series drags on the same source. The current is the same through both because there is only one path.",
    takeaway: "Series chains keep one common current while the source voltage is divided into component drops.",
  },
  M11_L2: {
    title: "Branch deck lab",
    instructions: "Track shared branch voltage and split current without mixing the two.",
    taskPrompt: "Build a branch deck with unequal drags and explain why the branch currents differ while the branch voltage stays shared.",
    exploreSteps: ["Build two branches between the same junctions.", "Change one branch drag only.", "Add a branch and compare the source current."],
    watchFor: ["Parallel branches share voltage.", "Branch currents can differ.", "Adding branches lowers equivalent resistance."],
    tryFirst: "Set one branch to a larger drag than the other. The branch with the larger drag carries the smaller current even though both branches share the same voltage.",
    takeaway: "Branch decks share boost across branches while the current splits and recombines.",
  },
  M11_L3: {
    title: "Shed-rate lab",
    instructions: "Read power as energy transferred each second at the station.",
    taskPrompt: "Compare lamps and resistor stations, then explain why power depends on both current and voltage drop.",
    exploreSteps: ["Fix the current and change the voltage drop.", "Fix the voltage drop and change the current.", "Translate watts back into joules each second."],
    watchFor: ["Power is an energy-transfer rate.", "P = IV links current and voltage.", "Brightness and heating follow shed rate, not used-up current."],
    tryFirst: "Keep the current fixed and double the station voltage drop. The power doubles because the station sheds more energy each second.",
    takeaway: "Task stations are compared by shed rate, not by how much current they seem to use up.",
  },
  M11_L4: {
    title: "Route-map lab",
    instructions: "Read the network from junctions and paths, not from physical layout.",
    taskPrompt: "Match physical layouts to schematics and identify the series and parallel sections before calculating anything.",
    exploreSteps: ["Switch between physical and symbolic views.", "Mark the junctions.", "Trace one series path and one branch deck."],
    watchFor: ["Schematics are symbolic maps.", "Shared junctions define parallel.", "One uninterrupted path defines series."],
    tryFirst: "Take the same network and redraw it in a different layout. The physics stays the same because the connections stay the same.",
    takeaway: "Route maps make the connection logic easier to read than literal pictures of the hardware.",
  },
  M11_L5: {
    title: "Guard-link lab",
    instructions: "Treat safety as a network-current story and not only as a battery story.",
    taskPrompt: "Introduce a fault bridge, compare the current surge, and explain how the guard link and insulation protect in different ways.",
    exploreSteps: ["Start with a protected normal loop.", "Toggle in a fault bridge.", "Adjust the guard-link rating and compare the outcome."],
    watchFor: ["Short circuits create low-resistance shortcuts.", "Large current can overheat wires.", "Fuses, breakers, and insulation do different jobs."],
    tryFirst: "Toggle the fault bridge on. The current jumps because the shortcut path has very little drag, so the guard link has to open the loop.",
    takeaway: "Circuit safety depends on controlling dangerous current and blocking dangerous contact.",
  },
  M11_L6: {
    title: "Equivalent-drag lab",
    instructions: "Reduce the network one valid block at a time until one total resistance remains.",
    taskPrompt: "Simplify a mixed network step by step, then use the final equivalent resistance to find the total current.",
    exploreSteps: ["Reduce one parallel block.", "Redraw the remaining series path.", "Use the final total resistance with the source voltage."],
    watchFor: ["Equivalent resistance is one effective drag for the whole network.", "Mixed circuits must be reduced step by step.", "The final reduction unlocks the source-current calculation."],
    tryFirst: "Reduce the branch deck first, then add the remaining series drag. That final total resistance is what the source sees.",
    takeaway: "Equivalent drag turns a complicated network into one effective load without losing the underlying structure.",
  },
};

export function m11SimulationCopy(code: string): M11SimulationCopy | undefined {
  return M11_SIMULATION_COPY[code];
}

export function m11ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M11_L1":
      return ["Check the route shape before using any rule.", "Keep same current separate from shared voltage.", "Name the one-path story before the algebra."];
    case "M11_L2":
      return ["Mark the shared junctions first.", "Keep branch voltage separate from branch current.", "Use extra-path language for equivalent resistance."];
    case "M11_L3":
      return ["Translate watts back into joules per second.", "Keep power separate from current.", "Use shed-rate language for brightness and heating."];
    case "M11_L4":
      return ["Read the schematic as a symbolic map.", "Trace junctions and paths before naming series or parallel.", "Do not let page layout replace network logic."];
    case "M11_L5":
      return ["Name the fault path first.", "Connect low resistance to dangerous current.", "Keep protection devices and insulation as different safety roles."];
    case "M11_L6":
      return ["Reduce one valid block at a time.", "Redraw after each reduction.", "Use the final total resistance before the total current step."];
    default:
      return [];
  }
}

export function m11ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M11_L1":
      return ["Series circuits have one uninterrupted path.", "The current is the same through every series component.", "Series resistances add and the source voltage is shared."];
    case "M11_L2":
      return ["Parallel branches share the same voltage.", "Branch currents split and add again at the junction.", "Adding a branch lowers the equivalent resistance."];
    case "M11_L3":
      return ["Power is energy transferred each second.", "Component power depends on both current and voltage.", "A lamp glows more strongly when its shed rate is larger."];
    case "M11_L4":
      return ["A circuit diagram is a symbolic connection map.", "Series and parallel are read from paths and junctions.", "A different drawing can still show the same circuit if the connections match."];
    case "M11_L5":
      return ["Short circuits create dangerous low-resistance paths.", "Guard links protect by opening unsafe current paths.", "Insulation protects by blocking unsafe contact."];
    case "M11_L6":
      return ["Equivalent resistance is one effective resistance for the whole network.", "Series and parallel sections reduce with different rules.", "Mixed circuits must be simplified step by step."];
    default:
      return [];
  }
}

export function m11ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M11_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [{ kind: "visual", title: visual.visual_title, caption: visual.visual_caption, image_url: visual.image_url, highlights: visual.visual_callouts }];
}

export function m11ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M11_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key circuit rule from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
