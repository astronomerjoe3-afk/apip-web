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

// M10 now teaches the magnetism/electromagnetic-effects sequence.
// The dedicated M10 asset tree still contains stale legacy circuits media, so
// the live M10 lessons intentionally consume the corrected magnetism pack that
// currently lives under the M12 namespace until the M10 media set is remapped.
const M10_ASSET_BASE = "/lesson_assets/M12";

const M10_VISUAL_META: Record<string, M10QuestionVisualMeta> = {
  M10L1: {
    image_url: `${M10_ASSET_BASE}/M12_L1/diagrams/m12-l1-field-weave-map.svg`,
    visual_title: "Field towers and carrier routes both create readable weave patterns",
    visual_caption: "Use compass flags and weave density to separate field direction from field strength around magnets and current-carrying wires.",
    visual_callouts: [
      "Field lines show direction at each point, not particle tracks.",
      "Closer line spacing marks a stronger field region.",
      "A straight current-carrying wire produces circular weave around the route.",
    ],
  },
  M10L2: {
    image_url: `${M10_ASSET_BASE}/M12_L2/diagrams/m12-l2-coil-tower.svg`,
    visual_title: "Coil towers reinforce the weave into an electromagnet",
    visual_caption: "Turns, current, and a soft-iron core all strengthen the concentrated field inside and around the solenoid.",
    visual_callouts: [
      "More turns reinforce the field from each loop.",
      "Larger current strengthens the electromagnet.",
      "A soft-iron core concentrates and strengthens the weave.",
    ],
  },
  M10L3: {
    image_url: `${M10_ASSET_BASE}/M12_L3/diagrams/m12-l3-side-kick.svg`,
    visual_title: "A magnetic side-kick acts sideways to both field and current",
    visual_caption: "The conductor does not get pushed along the field lines; the force direction changes when either the field or the current reverses.",
    visual_callouts: [
      "Force is perpendicular to the current direction.",
      "Force is also perpendicular to the field direction.",
      "Reverse the field or the current and the side-kick reverses too.",
    ],
  },
  M10L4: {
    image_url: `${M10_ASSET_BASE}/M12_L4/diagrams/m12-l4-spin-frame.svg`,
    visual_title: "Opposite side-kicks on a loop create motor torque",
    visual_caption: "The motor effect is a turning version of the sideways magnetic force on current-carrying sides of the coil.",
    visual_callouts: [
      "Opposite coil sides feel opposite forces.",
      "Those forces form a turning pair, not a simple translation.",
      "The commutator keeps the overall rotation direction consistent.",
    ],
  },
  M10L5: {
    image_url: `${M10_ASSET_BASE}/M12_L5/diagrams/m12-l5-change-thread.svg`,
    visual_title: "Induction needs changing field-thread, not just a nearby field",
    visual_caption: "Move the magnet, move the coil, or rotate the loop so the magnetic flux changes and an emf appears.",
    visual_callouts: [
      "A steady field alone does not sustain induction.",
      "Faster change gives a larger induced effect.",
      "A generator is repeated induction by continuous rotation.",
    ],
  },
  M10L6: {
    image_url: `${M10_ASSET_BASE}/M12_L6/diagrams/m12-l6-grid-bridge.svg`,
    visual_title: "Transformers link two coils through changing core flux",
    visual_caption: "The turns ratio sets the voltage change, while the grid story explains why step-up transmission lowers line current and cable loss.",
    visual_callouts: [
      "The primary and secondary are linked by changing flux, not direct charge transfer.",
      "Voltage ratio follows turns ratio in the school model.",
      "High-voltage transmission reduces current for the same power.",
    ],
  },
};

export function m10QuestionVisualMeta(itemId: string): M10QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M10L[1-6])_[A-Z]+\d+$/);
  return match ? M10_VISUAL_META[match[1]] : undefined;
}

const M10_SIMULATION_COPY: Record<string, M10SimulationCopy> = {
  M10_L1: {
    title: "Weave Mapper lab",
    instructions: "Map direction and strength together so field lines never turn into literal particle roads.",
    taskPrompt: "Compare a field tower and a live straight route, place compass flags around both, and explain how weave direction and weave density answer different questions.",
    exploreSteps: [
      "Start with the permanent-field tower and read the compass direction at several points.",
      "Switch to the current-carrying route and compare the circular weave pattern.",
      "Move farther away and track how the weave density weakens.",
    ],
    watchFor: [
      "Magnets and currents both create magnetic fields.",
      "Field lines show direction while spacing suggests strength.",
      "A straight wire produces circular field loops around the route.",
    ],
    tryFirst: "Place one compass flag above a wire and one below it, then reverse the current. The flags swing the opposite way because the circular weave direction reverses with the current.",
    takeaway: "Field mapping becomes much clearer when you separate direction, strength, and source type instead of treating field lines like literal paths.",
  },
  M10_L2: {
    title: "Core Boost lab",
    instructions: "Treat the coil, current, and core as three separate strength levers for the same electromagnet story.",
    taskPrompt: "Build a coil tower, vary turns and current, add a core spine, and explain why those changes reinforce one magnetic field rather than creating three unrelated effects.",
    exploreSteps: [
      "Start with a few turns and a small current.",
      "Increase the turns while holding the current fixed.",
      "Insert the core spine and compare the strength jump.",
    ],
    watchFor: [
      "Coiling concentrates the magnetic field into a magnet-like pattern.",
      "More turns and larger current strengthen the electromagnet.",
      "A soft-iron core increases the field without becoming a permanent magnet.",
    ],
    tryFirst: "Keep the current fixed, double the turns, and compare the pickup strength. The coil becomes stronger because the field from each loop reinforces the others.",
    takeaway: "An electromagnet is just current-produced field made stronger by good coil geometry and a suitable core.",
  },
  M10_L3: {
    title: "Side-Kick Challenge lab",
    instructions: "Keep force direction, field direction, and current direction in separate slots before you predict the result.",
    taskPrompt: "Send a current-carrying route across a field, then reverse the current or the field and explain why the side-kick flips even though the conductor still sits in the same place.",
    exploreSteps: [
      "Start with field across the board and current into the active side of the route.",
      "Reverse only the current and compare the force arrow.",
      "Reset and reverse only the field instead.",
    ],
    watchFor: [
      "Magnetic force is sideways, not forward along the field.",
      "Reversing current reverses the force.",
      "Reversing field also reverses the force.",
    ],
    tryFirst: "Hold the field fixed and flip the current direction. The conductor jumps the opposite way because the side-kick depends on both current direction and field direction together.",
    takeaway: "The motor-force rule is easiest to trust when you picture it as a sideways kick caused by crossing the weave, not as a push along the lines.",
  },
  M10_L4: {
    title: "Spin Boss lab",
    instructions: "Read the motor as two matched side-kicks creating torque rather than as one mystery spinning device.",
    taskPrompt: "Place a coil in the field, compare the forces on opposite sides, and explain how the commutator keeps the turning in the same overall direction.",
    exploreSteps: [
      "Start with a single-turn loop and watch the opposite side-kicks.",
      "Increase the current and compare the torque.",
      "Toggle the commutator logic and compare continuous turning with stall behavior.",
    ],
    watchFor: [
      "Opposite sides of the coil feel opposite forces.",
      "Those forces create torque about the axle.",
      "The commutator swaps the current direction each half-turn to keep the spin going.",
    ],
    tryFirst: "Watch the left and right sides of the loop at the same moment. One is pushed up while the other is pushed down, so the pair makes the loop turn rather than slide sideways.",
    takeaway: "A motor is a carefully arranged current loop that turns because the magnetic side-kicks on its sides make a torque.",
  },
  M10_L5: {
    title: "Induction Alarm lab",
    instructions: "Ask what is changing before you ask what is induced.",
    taskPrompt: "Move magnets and coils, vary the change speed and turns, and explain why induction depends on changing field-thread instead of static field presence.",
    exploreSteps: [
      "Start with a still magnet and a still coil to confirm there is no sustained induced output.",
      "Move the magnet faster and compare the induced pulse.",
      "Increase the turn count and compare the generator-style output.",
    ],
    watchFor: [
      "Induction needs changing flux.",
      "Faster change gives a larger induced effect.",
      "A generator is continuous change-thread created by repeated rotation.",
    ],
    tryFirst: "Hold the magnet still inside the coil, then pull it out quickly. The still case gives no sustained push, but the quick change gives a larger induced pulse because the field-thread changes faster.",
    takeaway: "Induction is a change story: static field alone is not enough, but changing flux turns motion into emf.",
  },
  M10_L6: {
    title: "Grid Bridge lab",
    instructions: "Keep induction, turns ratio, and transmission logic visible as three linked layers of one transformer story.",
    taskPrompt: "Link two coils with a shared core, compare step-up and step-down cases, and explain why the grid raises voltage for transmission before lowering it again for use.",
    exploreSteps: [
      "Start with equal turns and note that the secondary voltage stays near the primary value.",
      "Increase the secondary turns and compare the step-up effect.",
      "Switch to transmission mode and compare line current and cable-loss clues.",
    ],
    watchFor: [
      "Transformers need changing current in the primary.",
      "Voltage ratio follows turns ratio in the simple model.",
      "For the same power, higher transmission voltage means lower line current and lower cable loss.",
    ],
    tryFirst: "Set the secondary to four times as many turns as the primary. The output voltage rises by about the same factor, and the transmission panel shows why a higher-voltage line can carry the same power with less current.",
    takeaway: "The transformer is the most complete Field-Weave machine: one changing field links two coils, turns ratio sets the voltage shift, and the grid uses that shift to reduce transmission losses.",
  },
};

export function m10SimulationCopy(code: string): M10SimulationCopy | undefined {
  return M10_SIMULATION_COPY[code];
}

export function m10ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M10_L1":
      return ["Use compass direction to read the field locally.", "Keep weave density separate from weave direction.", "Do not treat field lines as literal travel paths."];
    case "M10_L2":
      return ["Build the electromagnet story from current, turns, and core.", "Keep solenoid field concentration visible.", "Do not call the core a permanent magnet."];
    case "M10_L3":
      return ["Force is sideways to both field and current.", "Reverse one direction at a time.", "Use the left-hand rule only after you know what each finger represents."];
    case "M10_L4":
      return ["Read opposite side-kicks before naming torque.", "Keep motor effect separate from induction.", "Use the commutator as a direction-keeping device, not a power source."];
    case "M10_L5":
      return ["Ask what is changing in the field-thread.", "Keep motion-induced change separate from static field presence.", "Connect generator output to repeated flux change."];
    case "M10_L6":
      return ["Read the induction link before the turns ratio.", "Keep primary and secondary as separate circuits.", "Separate transmission efficiency from final user voltage."];
    default:
      return [];
  }
}

export function m10ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M10_L1":
      return ["Magnets and current-carrying wires both create magnetic fields.", "Field lines show direction, and line density suggests strength.", "A straight current-carrying wire has a circular magnetic field pattern."];
    case "M10_L2":
      return ["A solenoid is a coiled current route that behaves like a magnet.", "Increasing current, turn count, or adding a soft-iron core strengthens the electromagnet.", "The core strengthens the field by concentrating the weave."];
    case "M10_L3":
      return ["A current-carrying conductor in a magnetic field feels a sideways force.", "The force direction reverses if the current or the field reverses.", "The force is perpendicular to both field and current directions."];
    case "M10_L4":
      return ["A motor coil turns because opposite sides feel opposite forces.", "The turning effect is torque, not a simple straight-line push.", "A split-ring commutator keeps the rotation continuing in the same overall direction."];
    case "M10_L5":
      return ["Induction needs changing magnetic flux.", "Faster change and more turns increase the induced effect.", "An a.c. generator is repeated induction caused by continuous rotation."];
    case "M10_L6":
      return ["A transformer links two coils by a shared changing magnetic field.", "Voltage ratio follows turns ratio in the school transformer model.", "Step-up transmission lowers current and reduces cable losses for the same power."];
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
    prompt: "Use the visual to explain the main field, force, or induction relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
