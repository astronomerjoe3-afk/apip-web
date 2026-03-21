"use client";

type UnknownRecord = Record<string, unknown>;

export type A2QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A2SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A2_ASSET_BASE = "/lesson_assets/A2";

const A2_VISUAL_META: Record<string, A2QuestionVisualMeta> = {
  A2L1: {
    image_url: `${A2_ASSET_BASE}/A2_L1/diagrams/a2_l1_slope_map_diagram.svg`,
    visual_title: "Field arrows belong to the location, not to the scout",
    visual_caption:
      "The slope-map board separates the field at a point from the force on a chosen scout charge, so advanced electricity starts with the right distinction.",
    visual_callouts: [
      "Electric field is force per unit positive charge.",
      "The field exists before a scout charge is placed there.",
      "A negative scout feels force opposite to the field arrow.",
    ],
  },
  A2L2: {
    image_url: `${A2_ASSET_BASE}/A2_L2/diagrams/a2_l2_equipotential_diagram.svg`,
    visual_title: "Potential is terrace height and equipotentials are same-height routes",
    visual_caption:
      "The equipotential map keeps electric height, terrace drop, and zero-change routes on one board, which makes Delta V feel geometric rather than mysterious.",
    visual_callouts: [
      "Potential is electric energy level per unit charge.",
      "Equipotential routes have zero terrace drop along them.",
      "Field arrows cross equipotential paths rather than following them.",
    ],
  },
  A2L3: {
    image_url: `${A2_ASSET_BASE}/A2_L3/diagrams/a2_l3_uniform_plate_diagram.svg`,
    visual_title: "Between large plates, the electric slope is approximately uniform",
    visual_caption:
      "The plate-gap visual shows a straight electric slope so learners can read E as voltage drop per distance before the equation becomes algebra.",
    visual_callouts: [
      "Field direction runs from the positive plate to the negative plate.",
      "E = Delta V / d in a uniform field region.",
      "The same voltage across a smaller gap makes a stronger field.",
    ],
  },
  A2L4: {
    image_url: `${A2_ASSET_BASE}/A2_L4/diagrams/a2_l4_split_deck_diagram.svg`,
    visual_title: "A capacitor is a split-deck store holding separated charge",
    visual_caption:
      "The split-deck board keeps the two facing conductors, the no-cross gap, and the field-filled energy store together so capacitance feels structural.",
    visual_callouts: [
      "Capacitance is charge stored per volt.",
      "Larger area increases capacitance.",
      "Larger separation decreases capacitance.",
    ],
  },
  A2L5: {
    image_url: `${A2_ASSET_BASE}/A2_L5/diagrams/a2_l5_node_platform_diagram.svg`,
    visual_title: "Node platforms reveal the hidden voltage structure of a circuit",
    visual_caption:
      "The node-platform map uses shared terrace height to explain why parallel branches can have the same voltage difference while still carrying different currents.",
    visual_callouts: [
      "Ideal-wire-connected points share one potential.",
      "Current entering a node must equal current leaving it.",
      "Parallel branches between the same two nodes share the same Delta V.",
    ],
  },
  A2L6: {
    image_url: `${A2_ASSET_BASE}/A2_L6/diagrams/a2_l6_mesh_audit_diagram.svg`,
    visual_title: "Loop audits turn complex circuits into electric-height bookkeeping",
    visual_caption:
      "The mesh-audit board tracks source lifts, component drops, and node heights together so Kirchhoff analysis reads like conservation rather than magic.",
    visual_callouts: [
      "A full closed loop must return to its starting electric height.",
      "Component voltage is the difference between its end-node heights.",
      "KVL is a balance rule, not an all-voltages-equal rule.",
    ],
  },
};

export function a2QuestionVisualMeta(itemId: string): A2QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A2L[1-6])_[A-Z]+\d+$/);
  return match ? A2_VISUAL_META[match[1]] : undefined;
}

const A2_SIMULATION_COPY: Record<string, A2SimulationCopy> = {
  A2_L1: {
    title: "Slope-map lab",
    instructions:
      "Treat the electric field as the slope arrow at a location, then compare how different scouts feel force without pretending they redefine the field.",
    taskPrompt:
      "Change the source sign, scout sign, and distance, then explain why the field belongs to the location while the force depends on the chosen scout charge.",
    exploreSteps: [
      "Place a positive scout near a positive source.",
      "Flip the scout sign while keeping the same field location.",
      "Move farther out and compare how field strength changes.",
    ],
    watchFor: [
      "Field direction is defined using a positive scout.",
      "A negative scout reverses force direction without reversing the field itself.",
      "Steeper electric slope means stronger field.",
    ],
    tryFirst:
      "Start with a positive source and a positive scout. Then keep the source fixed and switch the scout negative so the field arrow stays the same while the force flips.",
    takeaway:
      "Electric field is the local push map; force is what a particular charge feels inside that map.",
  },
  A2_L2: {
    title: "Equipotential terrace lab",
    instructions:
      "Compare same-height routes with cross-terrace routes so potential, voltage, and energy change stay separate from current language.",
    taskPrompt:
      "Place two points on the terrace map, compare their heights, and explain why same-terrace travel causes no potential-energy change.",
    exploreSteps: [
      "Match two points to one terrace line.",
      "Move one point across terrace levels.",
      "Compare the route of the field arrow with the route of the equipotential line.",
    ],
    watchFor: [
      "Potential is electric height per unit charge.",
      "Equipotential paths have zero Delta V.",
      "Field arrows cross terrace lines rather than running along them.",
    ],
    tryFirst:
      "Put both points on the same terrace first so Delta V reads zero, then move one point downhill and watch the terrace drop appear immediately.",
    takeaway:
      "Voltage is a terrace drop between points, while equipotential paths are same-height routes of zero drop.",
  },
  A2_L3: {
    title: "Uniform plate-field lab",
    instructions:
      "Keep voltage and gap visible together so a uniform field reads as terrace drop per distance instead of as another vague arrow rule.",
    taskPrompt:
      "Change plate voltage and plate gap, then explain why the field strengthens when the same drop is squeezed into less distance.",
    exploreSteps: [
      "Fix the gap and increase the plate voltage.",
      "Fix the voltage and shrink the plate gap.",
      "Flip the scout sign and compare field direction with force direction.",
    ],
    watchFor: [
      "Field direction stays from the positive plate to the negative plate.",
      "E depends on Delta V and d together.",
      "A negative scout changes force direction, not field direction.",
    ],
    tryFirst:
      "Start with 24 V across a medium gap, then halve the gap while keeping the same voltage so the field steepens without changing its direction.",
    takeaway:
      "A uniform field is a straight electric slope set by voltage drop per distance.",
  },
  A2_L4: {
    title: "Split-deck store lab",
    instructions:
      "Change plate area, gap, and source voltage so capacitance reads as how much separated charge a given geometry can hold per volt.",
    taskPrompt:
      "Compare two capacitors with different plate geometry and explain why the field-filled gap is the real energy store.",
    exploreSteps: [
      "Increase plate area with the same gap.",
      "Increase plate gap with the same area.",
      "Raise the charging voltage and compare stored charge on the same capacitor.",
    ],
    watchFor: [
      "Capacitance belongs to the device geometry.",
      "Stored charge depends on both capacitance and voltage.",
      "The energy lives in the field between the plates.",
    ],
    tryFirst:
      "Keep the voltage fixed and double the plate area first, then widen the gap so you can see which geometry change strengthens the store and which weakens it.",
    takeaway:
      "A capacitor stores equal and opposite separated charge across a field-filled gap, and capacitance tells how much charge per volt that geometry can hold.",
  },
  A2_L5: {
    title: "Node-platform lab",
    instructions:
      "Read the circuit as a set of shared-height node platforms before you talk about branch voltages or current splits.",
    taskPrompt:
      "Set two branch resistances between the same nodes, then explain why the voltage matches across both branches even when the currents differ.",
    exploreSteps: [
      "Choose a source voltage for the two-node deck.",
      "Set equal branch resistances and compare currents.",
      "Make one branch more resistive and compare the split again.",
    ],
    watchFor: [
      "Parallel branches between the same two nodes share the same Delta V.",
      "Branch current changes when branch resistance changes.",
      "Current entering a node must equal current leaving it.",
    ],
    tryFirst:
      "Begin with equal branch resistances, then make one branch much larger so the node heights stay fixed while the branch currents separate cleanly.",
    takeaway:
      "Node heights control branch voltage; branch resistance controls how the current split is shared.",
  },
  A2_L6: {
    title: "Mesh audit lab",
    instructions:
      "Walk one closed loop at a time, record every source rise and component drop, and keep the node heights visible so the audit stays grounded.",
    taskPrompt:
      "Balance one source rise against several drops, then explain why Kirchhoff's loop law is an energy-bookkeeping rule rather than an equality slogan.",
    exploreSteps: [
      "Start with one known source rise and two known drops.",
      "Solve the missing drop from loop balance.",
      "Compare the solved drop with the difference between the end-node heights.",
    ],
    watchFor: [
      "A full closed loop must return to the starting terrace height.",
      "Ideal wires contribute negligible drop in the simple model.",
      "Node-height differences and loop balance should agree.",
    ],
    tryFirst:
      "Use one 12 V source with two known drops, solve the missing drop, then change one node height and check that the loop sum still closes back to zero.",
    takeaway:
      "Mesh analysis works when you treat circuits as node heights plus closed-loop balance rather than as isolated component facts.",
  },
};

export function a2SimulationCopy(code: string): A2SimulationCopy | undefined {
  return A2_SIMULATION_COPY[code];
}

export function a2ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A2_L1":
      return [
        "Keep field direction tied to a positive scout definition.",
        "Separate location-based field from charge-dependent force.",
        "Use slope language before equation language.",
      ];
    case "A2_L2":
      return [
        "Read height first, then drop.",
        "Treat equipotential routes as same-height travel.",
        "Keep voltage separate from current at every step.",
      ];
    case "A2_L3":
      return [
        "Use voltage-per-distance language before substitution.",
        "Keep field direction separate from force direction on a negative scout.",
        "Compare gap changes and voltage changes on the same board.",
      ];
    case "A2_L4":
      return [
        "Treat capacitance as a ratio and device property.",
        "Keep separated charge and gap field visible together.",
        "Do not let charge-crossing language replace storage language.",
      ];
    case "A2_L5":
      return [
        "Color the nodes before comparing branches.",
        "Use the same-end-nodes rule to read branch voltage.",
        "Keep current splitting and potential difference as separate ideas.",
      ];
    case "A2_L6":
      return [
        "List every rise and drop with sign.",
        "Use node heights to simplify component voltages.",
        "Treat KVL as a balance rule, not an equal-drop rule.",
      ];
    default:
      return [];
  }
}

export function a2ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A2_L1":
      return [
        "Electric field is force per unit positive charge.",
        "Field belongs to the location created by source charges.",
        "Force on a charge follows F = qE.",
      ];
    case "A2_L2":
      return [
        "Potential is electric energy level per unit charge.",
        "Potential difference is a terrace drop between points.",
        "Equipotential routes have no change in electric height.",
      ];
    case "A2_L3":
      return [
        "Parallel plates create an approximately uniform field in the gap.",
        "In a uniform field, E = Delta V / d.",
        "The same voltage across a smaller gap gives a stronger field.",
      ];
    case "A2_L4":
      return [
        "A capacitor stores equal and opposite separated charge on facing plates.",
        "Capacitance is charge stored per volt.",
        "The stored energy is in the electric field between the plates.",
      ];
    case "A2_L5":
      return [
        "Ideal-wire-connected points share one node potential.",
        "Current entering a node equals current leaving it.",
        "Parallel branches between the same nodes share the same voltage difference.",
      ];
    case "A2_L6":
      return [
        "Around a closed loop, total rises and drops in potential sum to zero.",
        "Ideal wires have negligible voltage drop in the simple model.",
        "Component voltage is the difference between the potentials of its end nodes.",
      ];
    default:
      return [];
  }
}

export function a2ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A2_VISUAL_META[code.replace("_", "")];
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

export function a2ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A2_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A2_L1: "Use the slope-map visual to explain why electric field belongs to the location while force depends on the chosen test charge.",
    A2_L2: "Use the equipotential visual to explain why same-terrace travel causes no potential-energy change.",
    A2_L3: "Use the plate-gap visual to explain why the same voltage across a smaller gap gives a stronger field.",
    A2_L4: "Use the split-deck visual to explain why capacitance is charge stored per volt rather than just the amount of charge present.",
    A2_L5: "Use the node-platform visual to explain why two branches can share the same voltage difference while carrying different currents.",
    A2_L6: "Use the mesh-audit visual to explain why a full closed loop must return to its starting electric height.",
  };
  return {
    title: visual.visual_title,
    prompt:
      promptByLesson[code] ||
      "Use the Charge-Terrace visual to explain the key advanced-electricity relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
