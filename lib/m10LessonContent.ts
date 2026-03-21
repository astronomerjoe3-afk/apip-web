"use client";

type UnknownRecord = Record<string, unknown>;

export type M10QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M10SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M10_ASSET_BASE = "/lesson_assets/M10";

const M10_VISUAL_META: Record<string, M10QuestionVisualMeta> = {
  M10L1: {
    image_url: `${M10_ASSET_BASE}/M10_L1/diagrams/m10-l1-carrier-loop.svg`,
    visual_title: "Carrier tokens circulate; the loop stays complete",
    visual_caption: "The moving thing is the charge carrier, while the checkpoint meter tracks rate separately from the total number of carriers.",
    visual_callouts: [
      "Charge is represented by the carrier tokens.",
      "A closed loop allows the same carriers to circulate repeatedly.",
      "Current is not the same as the number of carriers in the loop.",
    ],
  },
  M10L2: {
    image_url: `${M10_ASSET_BASE}/M10_L2/diagrams/m10-l2-checkpoint-rate.svg`,
    visual_title: "Current is a checkpoint-rate idea",
    visual_caption: "The amount of charge present and the amount passing a point each second are different questions.",
    visual_callouts: [
      "Current measures charge passing a point per second.",
      "A large carrier count can still give a small current.",
      "1 A means 1 C passes the checkpoint each second.",
    ],
  },
  M10L3: {
    image_url: `${M10_ASSET_BASE}/M10_L3/diagrams/m10-l3-lift-station.svg`,
    visual_title: "Voltage is boost per carrier",
    visual_caption: "The source gives each carrier an energy boost; it does not pour out current as if current were stored liquid.",
    visual_callouts: [
      "Voltage is energy per unit charge.",
      "A larger boost per token means a larger voltage.",
      "Voltage and current are linked but not the same quantity.",
    ],
  },
  M10L4: {
    image_url: `${M10_ASSET_BASE}/M10_L4/diagrams/m10-l4-route-drag.svg`,
    visual_title: "Resistance belongs to the route",
    visual_caption: "Longer, narrower, or rougher routes make it harder for carriers to move, so the resistance is a path property.",
    visual_callouts: [
      "Longer routes increase resistance.",
      "Wider routes reduce resistance.",
      "Resistance belongs to the material and geometry of the path.",
    ],
  },
  M10L5: {
    image_url: `${M10_ASSET_BASE}/M10_L5/diagrams/m10-l5-ohmic-rule.svg`,
    visual_title: "Ohmic routes obey the simple rate rule",
    visual_caption: "For an ohmic route, increasing voltage raises current while increasing resistance reduces current.",
    visual_callouts: [
      "At fixed resistance, larger voltage gives larger current.",
      "At fixed voltage, larger resistance gives smaller current.",
      "Ohm's law is a proportional rule for ohmic elements.",
    ],
  },
  M10L6: {
    image_url: `${M10_ASSET_BASE}/M10_L6/diagrams/m10-l6-loop-ledger.svg`,
    visual_title: "The loop ledger keeps the quantities separate",
    visual_caption: "Charge keeps circulating, the source gives energy per carrier, and the route decides how much current actually flows.",
    visual_callouts: [
      "Track charge, current, voltage, and resistance as separate quantities.",
      "The same source can give different currents in different loops.",
      "The battery provides energy per charge, not a fixed current regardless of circuit.",
    ],
  },
};

export function m10QuestionVisualMeta(itemId: string): M10QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M10L[1-6])_[A-Z]+\d+$/);
  return match ? M10_VISUAL_META[match[1]] : undefined;
}

const M10_SIMULATION_COPY: Record<string, M10SimulationCopy> = {
  M10_L1: {
    title: "Carrier Loop lab",
    instructions: "Keep the moving carriers, the checkpoint rate, and the loop status visible as separate ideas from the start.",
    taskPrompt: "Open and close the loop, change the carrier count, and explain what is moving and why current needs a complete route.",
    exploreSteps: [
      "Start with a closed loop and visible carrier tokens.",
      "Break the loop and compare the checkpoint rate immediately.",
      "Increase the carrier count without calling it current.",
    ],
    watchFor: [
      "Charge is represented by the moving carriers.",
      "A closed loop is needed for sustained current.",
      "Carrier count and current are not the same quantity.",
    ],
    tryFirst: "Start with a closed loop, then open the switch. The carrier tokens are still the charge carriers, but the checkpoint rate collapses because the route is broken.",
    takeaway: "Charge is the moving carrier quantity, and a steady current needs a complete loop.",
  },
  M10_L2: {
    title: "Checkpoint Rate lab",
    instructions: "Use the checkpoint gate as the measurement story so current stays tied to charge per second.",
    taskPrompt: "Compare loops with different carrier counts and different speeds, then explain why current is a rate rather than an amount.",
    exploreSteps: [
      "Fix the carrier count and raise the carrier speed.",
      "Fix the speed and change the carrier count.",
      "Read the checkpoint meter in charge per second.",
    ],
    watchFor: [
      "Current is charge flow rate.",
      "The same total charge can still give different current values.",
      "1 A means 1 C passes the checkpoint each second.",
    ],
    tryFirst: "Set 12 C to pass a checkpoint in 3 s. The current is 4 A because current measures charge per time, not total charge alone.",
    takeaway: "Current is best read as charge passing a chosen point per unit time.",
  },
  M10_L3: {
    title: "Lift Station lab",
    instructions: "Keep the source role on the energy-per-carrier side of the story rather than treating the source as a tank of current.",
    taskPrompt: "Change the boost per token, compare the energy gained by each carrier, and explain why voltage is energy per charge.",
    exploreSteps: [
      "Set one boost-per-token level and read the energy gain for one carrier.",
      "Double the boost and compare the new energy-per-carrier value.",
      "Separate voltage from current language before you describe the result.",
    ],
    watchFor: [
      "Voltage is the source boost given to each carrier.",
      "The source does not supply a fixed current in every loop.",
      "Voltage is not the same thing as total stored energy.",
    ],
    tryFirst: "Compare a 3 J/C lift station with a 9 J/C lift station. Each carrier gets three times the energy boost in the second case, so the voltage is three times as large.",
    takeaway: "Voltage is energy per unit charge, so it belongs to the boost each carrier receives.",
  },
  M10_L4: {
    title: "Route Drag lab",
    instructions: "Treat resistance as a route property controlled by material and geometry, not as something the battery directly decides.",
    taskPrompt: "Compare long, short, wide, and narrow paths, then explain why resistance belongs to the route rather than to the source.",
    exploreSteps: [
      "Lengthen the path while keeping the material story the same.",
      "Widen the path and compare the drag index.",
      "Use route language before you use resistance symbols.",
    ],
    watchFor: [
      "Longer paths increase resistance.",
      "Wider paths reduce resistance.",
      "Resistance is a property of the route, not a second kind of current.",
    ],
    tryFirst: "Keep the material fixed and double the route length. The drag rises because carriers have a longer difficult path to travel.",
    takeaway: "Resistance belongs to the path, and material plus geometry decide how hard the route makes carrier motion.",
  },
  M10_L5: {
    title: "Ohmic Route lab",
    instructions: "Hold one quantity fixed while you vary the other, so the proportional rate rule becomes visible instead of turning into symbol juggling.",
    taskPrompt: "Test a fixed ohmic route by changing voltage and resistance separately, then explain how the current responds.",
    exploreSteps: [
      "Keep resistance fixed and raise the boost per token.",
      "Keep voltage fixed and increase the route drag.",
      "Switch between ohmic and non-ohmic routes and compare the pattern.",
    ],
    watchFor: [
      "At fixed resistance, larger voltage gives larger current.",
      "At fixed voltage, larger resistance gives smaller current.",
      "Ohm's law is the simple proportional rule for ohmic routes.",
    ],
    tryFirst: "Set an ohmic route to 6 V and 3 ohms. The current is 2 A. Keep the route ohmic and raise the voltage to 12 V; the current rises to 4 A because the resistance stayed fixed.",
    takeaway: "Ohm's law works best when students see current as jointly controlled by voltage and resistance, not by one quantity alone.",
  },
  M10_L6: {
    title: "Loop Ledger lab",
    instructions: "Track who moves, what the source gives to each mover, and what part of the path limits the rate so the full quantity picture stays clean.",
    taskPrompt: "Compare two loops with the same source but different route drag, then explain why the current can change while the source voltage stays the same.",
    exploreSteps: [
      "Start with two loops sharing the same lift station.",
      "Change the route drag on only one loop.",
      "Read charge, voltage, current, and route drag as separate ledger lines.",
    ],
    watchFor: [
      "The same source can produce different currents in different loops.",
      "Charge keeps circulating even while energy per carrier changes around the loop.",
      "A complete explanation needs charge, current, voltage, and resistance kept separate.",
    ],
    tryFirst: "Give both loops the same 12 J/C boost, then make one route rougher. The voltage stays the same, but the rougher loop has the lower current because its resistance is larger.",
    takeaway: "The loop ledger keeps the electrical quantities distinct: charge moves, voltage boosts each charge, and resistance limits the resulting current.",
  },
};

export function m10SimulationCopy(code: string): M10SimulationCopy | undefined {
  return M10_SIMULATION_COPY[code];
}

export function m10ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M10_L1":
      return ["Name the moving carriers before you name the rate.", "Use closed-loop language for sustained current.", "Keep charge conservation separate from energy transfer."];
    case "M10_L2":
      return ["Read the checkpoint rate as charge per second.", "Keep amount and rate separate.", "Translate amperes back into coulombs per second."];
    case "M10_L3":
      return ["Treat voltage as energy per charge.", "Keep source boost language separate from current language.", "Do not call the battery a store of current."];
    case "M10_L4":
      return ["Put the resistance story on the route, not the battery.", "Use length and width language before algebra.", "Keep material and geometry visible together."];
    case "M10_L5":
      return ["Hold one variable fixed before changing the other.", "Treat Ohm's law as a route rule, not a universal magic formula.", "Say what happens to current when voltage or resistance changes."];
    case "M10_L6":
      return ["Keep charge, current, voltage, and resistance as different ledger lines.", "Ask what each carrier gets from the source.", "Use same-source different-loop comparisons to break the 'battery gives the same current' myth."];
    default:
      return [];
  }
}

export function m10ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M10_L1":
      return ["Charge is represented by the moving carriers in the loop.", "A steady current needs a complete closed path.", "Charge is conserved; it is not used up by components."];
    case "M10_L2":
      return ["Current is the rate of charge flow.", "1 A means 1 C passes a point each second.", "Current is not the same as the total charge in the loop."];
    case "M10_L3":
      return ["Voltage is energy per unit charge.", "The source gives each carrier an energy boost.", "Voltage and current are linked but not identical quantities."];
    case "M10_L4":
      return ["Resistance belongs to the route.", "Longer routes increase resistance.", "Wider routes reduce resistance."];
    case "M10_L5":
      return ["For an ohmic route, current depends on both voltage and resistance.", "At fixed resistance, larger voltage gives larger current.", "At fixed voltage, larger resistance gives smaller current."];
    case "M10_L6":
      return ["Keep charge, current, voltage, and resistance as separate electrical quantities.", "The same source can give different currents in different loops.", "A clean circuit explanation names what moves, what each mover gets, and what limits the rate."];
    default:
      return [];
  }
}

export function m10ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M10_VISUAL_META[code.replace("_", "")];
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

export function m10ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M10_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key electrical relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
