"use client";

type UnknownRecord = Record<string, unknown>;

export type M6QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M6SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M6_VISUAL_META: Record<string, M6QuestionVisualMeta> = {
  M6L1: {
    image_url: "/lesson-media/m6/m6-l1-warmth-level.svg",
    visual_title: "Warmth Level and the Forge Ledger",
    visual_caption: "Temperature is the Warmth Level reading, while heat is the energy transferred into or out of the block.",
    visual_callouts: [
      "Warmth Level answers how hot the block is now.",
      "The Forge Ledger records the energy hand-off.",
      "Same energy does not force the same temperature rise.",
    ],
  },
  M6L2: {
    image_url: "/lesson-media/m6/m6-l2-level-cost.svg",
    visual_title: "Level Cost sets the heating bill",
    visual_caption: "Mass, Level Cost, and temperature rise all matter when you calculate a warm-up energy bill.",
    visual_callouts: [
      "Bigger Build Size means more material to warm.",
      "Higher Level Cost means more energy per kilogram per degree.",
      "Q = m c delta T is the formal Forge Ledger rule.",
    ],
  },
  M6L3: {
    image_url: "/lesson-media/m6/m6-l3-form-gate.svg",
    visual_title: "The Form Gate plateau",
    visual_caption: "A flat temperature can still go with rising total energy when the energy is paying the Morph Fee.",
    visual_callouts: [
      "A Form Gate is the temperature where the state starts to change.",
      "The Morph Fee stands for latent heat.",
      "A plateau does not mean the heater switched off.",
    ],
  },
  M6L4: {
    image_url: "/lesson-media/m6/m6-l4-touch-relay.svg",
    visual_title: "Touch Relay through a solid path",
    visual_caption: "Conduction passes energy through direct contact without the whole solid flowing from one end to the other.",
    visual_callouts: [
      "Direct contact is the route clue.",
      "Metals conduct well because electrons help the transfer.",
      "Poor conductors slow the relay path.",
    ],
  },
  M6L5: {
    image_url: "/lesson-media/m6/m6-l5-carrier-loop.svg",
    visual_title: "A full Carrier Loop",
    visual_caption: "Convection is a moving-fluid loop, not just the slogan 'heat rises'.",
    visual_callouts: [
      "Warm fluid rises because it becomes less dense.",
      "Cooler fluid moves in or sinks to complete the loop.",
      "A fixed solid cannot form a convection current.",
    ],
  },
  M6L6: {
    image_url: "/lesson-media/m6/m6-l6-glow-ledger.svg",
    visual_title: "Glow Cast and the stage ledger",
    visual_caption: "Radiation crosses the gap, then the Forge Ledger totals the separate warm-up and gate stages.",
    visual_callouts: [
      "Radiation can cross a vacuum gap.",
      "Dark dull surfaces are stronger absorbers than shiny ones.",
      "Multi-stage problems need separate stage totals before the final sum.",
    ],
  },
};

export function m6QuestionVisualMeta(itemId: string): M6QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M6L[1-6])_[A-Z]+\d+$/);
  return match ? M6_VISUAL_META[match[1]] : undefined;
}

const M6_SIMULATION_COPY: Record<string, M6SimulationCopy> = {
  M6_L1: {
    title: "Warmth Level lab",
    instructions: "Use the meters to separate the current temperature reading from the energy hand-off story.",
    taskPrompt: "Hold the energy payment steady while you change size or Level Cost, then explain why the temperature rise changes even though the ledger payment matches.",
    exploreSteps: [
      "Match the starting Warmth Level first.",
      "Keep Transfer Energy fixed and compare a small block with a larger one.",
      "Keep size fixed and compare a low-cost material with a high-cost material.",
    ],
    watchFor: [
      "Warmth Level is temperature, not stored heat.",
      "The Forge Ledger records transfer, not the current temperature.",
      "Same energy can still give different temperature rises.",
    ],
    tryFirst: "Start with equal Warmth Levels, give the same payment to both blocks, and then double the mass of one block. The ledger matches, but the level rise does not.",
    takeaway: "The first thermal distinction to protect is temperature versus transferred energy.",
  },
  M6_L2: {
    title: "Level Cost calculator lab",
    instructions: "Turn the warm-up rule into numbers by controlling mass, Level Cost, and target rise.",
    taskPrompt: "Build one heating bill from scratch with Q = m c delta T, then rearrange the same rule to predict a temperature rise when the energy bill is fixed.",
    exploreSteps: [
      "Choose mass, c, and delta T.",
      "Predict the Forge Ledger total before reading it.",
      "Reverse the rule so delta T becomes the unknown.",
    ],
    watchFor: [
      "Specific heat capacity is energy per kilogram per degree.",
      "Mass and c are separate multipliers in the bill.",
      "Rearranging the formula does not change the physical story.",
    ],
    tryFirst: "Set mass to 2 kg, c to 500, and delta T to 6. Then compute the bill and compare it with the displayed ledger.",
    takeaway: "Q = m c delta T is just the Level-Forge warm-up rule written in symbols.",
  },
  M6_L3: {
    title: "Form Gate lab",
    instructions: "Watch the plateau stage carefully so you can see energy transfer continue while temperature stays flat.",
    taskPrompt: "Heat a block to the Form Gate, keep the heater on, and explain why the Warmth Level pauses while the Morph Fee meter keeps filling.",
    exploreSteps: [
      "Reach the gate first.",
      "Continue the same energy input through the plateau.",
      "Compare a small sample with a larger sample at the same gate.",
    ],
    watchFor: [
      "A temperature plateau does not mean zero energy transfer.",
      "The Morph Fee stands for latent heat.",
      "Q = m L applies only to the state-change stage.",
    ],
    tryFirst: "Heat the block to the gate and keep the same power on. The Warmth Level pauses, but the Morph Fee meter and total ledger keep climbing.",
    takeaway: "State changes become much clearer when learners ask what the energy is paying for.",
  },
  M6_L4: {
    title: "Touch Relay lab",
    instructions: "Compare fast and slow solid pathways without ever letting the whole solid flow from one end to the other.",
    taskPrompt: "Build one strong metal relay path and one weak insulated path, then explain the far-end temperature change using contact and material properties.",
    exploreSteps: [
      "Keep a hot end and a cool end visible.",
      "Compare a metal path with an insulating path.",
      "Break the contact route and watch what happens.",
    ],
    watchFor: [
      "Conduction needs direct contact.",
      "Metals conduct well because electrons help.",
      "The solid path stays in place while energy passes through it.",
    ],
    tryFirst: "Run the same temperature difference through a metal bar and then through an insulated bar. The metal relay reaches the far end much faster.",
    takeaway: "Conduction is a relay through matter, not the whole material moving like a fluid.",
  },
  M6_L5: {
    title: "Carrier Loop lab",
    instructions: "Follow one warm parcel and one cool parcel so the convection current stays visible as a full loop.",
    taskPrompt: "Create a clear convection current in a fluid, then explain it without using the shortcut phrase 'heat rises' by itself.",
    exploreSteps: [
      "Warm the fluid from below or one side.",
      "Track the rising warm parcel.",
      "Explain how cooler fluid completes the loop.",
    ],
    watchFor: [
      "Convection is a moving-fluid route.",
      "Warm fluid rises because it becomes less dense.",
      "Cool fluid must move in or sink to complete the circulation.",
    ],
    tryFirst: "Use strong heating from below and watch one parcel loop upward, across, downward, and back toward the heater.",
    takeaway: "A full convection explanation is stronger than any slogan because it shows the complete fluid loop.",
  },
  M6_L6: {
    title: "Glow Cast and Ledger lab",
    instructions: "Use the beam to identify radiation, then switch to stage-by-stage ledger totals for the later heating mission.",
    taskPrompt: "Show that the beam still works across a vacuum gap, compare a shiny and a dark surface, then total a warm-up stage and a gate stage correctly.",
    exploreSteps: [
      "Keep the source and target separated by a gap.",
      "Compare absorption for two surface finishes.",
      "Add the warming and state-change stage totals explicitly.",
    ],
    watchFor: [
      "Radiation is the route that crosses the vacuum gap.",
      "Dark dull surfaces absorb more strongly than shiny surfaces.",
      "Multi-stage totals must be built from separate bills.",
    ],
    tryFirst: "Set a vacuum gap, compare a shiny target with a dark target, then total one warm-up bill and one melting bill for the darker target.",
    takeaway: "The capstone skill is route choice first, then stage-by-stage thermal bookkeeping.",
  },
};

export function m6SimulationCopy(code: string): M6SimulationCopy | undefined {
  return M6_SIMULATION_COPY[code];
}

export function m6ScaffoldFocusExtras(code: string): string[] {
  return M6_VISUAL_META[code.replace("_", "")]?.visual_callouts ?? [];
}

export function m6ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M6_L1":
      return [
        "Temperature is the Warmth Level reading right now.",
        "Heat means transferred energy, not a stored substance.",
        "Same energy can still produce different temperature rises.",
      ];
    case "M6_L2":
      return [
        "Specific heat capacity is energy per kilogram per degree.",
        "Mass and c both matter in Q = m c delta T.",
        "The heating bill grows with mass, cost, and target rise.",
      ];
    case "M6_L3":
      return [
        "A Form Gate is a state-change temperature.",
        "Latent heat is a constant-temperature state-change payment.",
        "A plateau can still represent real energy transfer.",
      ];
    case "M6_L4":
      return [
        "Conduction is energy transfer by direct contact.",
        "Metals conduct well because electrons help.",
        "The solid path stays in place while energy passes through it.",
      ];
    case "M6_L5":
      return [
        "Convection is moving-fluid transfer.",
        "Warm fluid rises because it becomes less dense.",
        "Cooler fluid completes the full loop.",
      ];
    case "M6_L6":
      return [
        "Radiation can cross a vacuum gap.",
        "Surface finish changes absorption and emission.",
        "Complex thermal processes need stage-by-stage totals.",
      ];
    default:
      return [];
  }
}

export function m6ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M6_VISUAL_META[code.replace("_", "")];
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

export function m6ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M6_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key thermal relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
