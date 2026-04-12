"use client";

type UnknownRecord = Record<string, unknown>;

export type M12NuclearQuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M12NuclearSimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M12_NUCLEAR_VISUAL_META: Record<string, M12NuclearQuestionVisualMeta> = {
  M12L1: {
    image_url: "/lesson_assets/A10/A10_L4/diagrams/a10_l4_binding_energy_mass_defect.svg",
    visual_title: "Binding energy explains why nuclei can release large energy",
    visual_caption: "The comparison board keeps mass defect, binding energy, and nuclear stability together so nuclear energy is read as a nucleus-level change rather than a chemical one.",
    visual_callouts: [
      "Binding energy belongs to the nucleus, not to ordinary electron-bond changes.",
      "Mass defect is tied to nuclear binding energy.",
      "Small mass changes can correspond to large energy changes.",
    ],
  },
  M12L2: {
    image_url: "/lesson_assets/A10/A10_L5/diagrams/a10_l5_fission_chain_reactors.svg",
    visual_title: "Fission can start a controllable or runaway chain reaction",
    visual_caption: "The chain-reaction board keeps neutron release, multiplication, and reactor control on one frame so fission is not reduced to one isolated split.",
    visual_callouts: [
      "Fission splits a heavy nucleus into smaller nuclei.",
      "Released neutrons can trigger further fission events.",
      "Control matters because the reaction can multiply.",
    ],
  },
  M12L3: {
    image_url: "/lesson_assets/A10/A10_L6/diagrams/a10_l6_fusion_process_comparison.svg",
    visual_title: "Fusion joins light nuclei into heavier ones",
    visual_caption: "The joining-route board keeps conditions, energy release, and star-linked fusion reasoning visible together.",
    visual_callouts: [
      "Fusion joins smaller nuclei rather than splitting a heavy one.",
      "Very high temperature helps nuclei overcome electrostatic repulsion.",
      "Fusion is the energy source in stars.",
    ],
  },
  M12L4: {
    image_url: "/lesson_assets/A10/A10_L5/diagrams/a10_l5_fission_chain_reactors.svg",
    visual_title: "Reactor systems manage energy transfer and reaction rate",
    visual_caption: "The reactor board separates fuel, moderator, control rods, coolant, and turbine-side energy transfer so the whole plant reads as one controlled system.",
    visual_callouts: [
      "Control rods reduce the reaction rate by absorbing neutrons.",
      "Coolant transfers thermal energy away from the reactor core.",
      "Electrical output comes from staged energy transfers, not directly from the fuel rods alone.",
    ],
  },
  M12L5: {
    image_url: "/lesson_assets/A10/A10_L3/diagrams/a10_l3_decay_equations_activity.svg",
    visual_title: "Radioisotopes are useful when decay is matched to the task",
    visual_caption: "The applications board keeps tracer use, medical use, industrial use, and decay properties together so the choice of radioisotope is explained physically.",
    visual_callouts: [
      "Different applications need different half-lives and radiation types.",
      "Tracer work depends on detectability and safe dose control.",
      "Medical and industrial uses balance usefulness against hazard.",
    ],
  },
  M12L6: {
    image_url: "/lesson_assets/A10/A10_L2/diagrams/a10_l2_accelerators_detectors.svg",
    visual_title: "Benefits and hazards must be weighed together",
    visual_caption: "The comparison board keeps useful applications, radiation risk, shielding, and waste management on one frame so nuclear technology is judged with evidence rather than slogans.",
    visual_callouts: [
      "Ionising radiation can damage living tissue.",
      "Shielding, handling, and storage reduce risk rather than removing it by words alone.",
      "Waste management remains part of the full nuclear-technology story.",
    ],
  },
};

export function m12NuclearQuestionVisualMeta(itemId: string): M12NuclearQuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M12L[1-6])_[A-Z]+\d+$/);
  return match ? M12_NUCLEAR_VISUAL_META[match[1]] : undefined;
}

const M12_NUCLEAR_SIMULATION_COPY: Record<string, M12NuclearSimulationCopy> = {
  M12_L1: {
    title: "Binding-energy comparison lab",
    instructions: "Keep nucleus stability, mass defect, and released energy on one board so nuclear energy stays a binding-story explanation.",
    taskPrompt: "Compare a less tightly bound nucleus with a more tightly bound one, then explain why a small mass difference can correspond to a large energy change.",
    exploreSteps: [
      "Start with two nuclei that differ in binding per nucleon.",
      "Compare the mass-defect readout.",
      "Link the change to released or required energy.",
    ],
    watchFor: [
      "Nuclear energy belongs to changes inside the nucleus.",
      "Mass defect and binding energy are linked ideas.",
      "The energy change is not a chemical-bond story.",
    ],
    tryFirst: "Check which nucleus is more tightly bound before you mention energy release. That stabilizes the comparison.",
    takeaway: "Nuclear energy is strongest when students read it as a change in binding energy within the nucleus.",
  },
  M12_L2: {
    title: "Fission chain-reaction lab",
    instructions: "Track the first split, the released neutrons, and the next generation together so the chain logic stays visible.",
    taskPrompt: "Trigger one fission event, follow the released neutrons, and explain how a chain reaction can be amplified or controlled.",
    exploreSteps: [
      "Start with one unstable heavy nucleus.",
      "Trigger the first split and count the released neutrons.",
      "Compare the controlled and uncontrolled next-step cases.",
    ],
    watchFor: [
      "Fission can release more neutrons than it uses.",
      "A chain reaction depends on what those neutrons do next.",
      "Control is a reactor-design issue, not an optional extra detail.",
    ],
    tryFirst: "Read the neutron count after the first split before you decide whether the chain can grow.",
    takeaway: "Fission becomes a systems idea when students track neutron multiplication and control together.",
  },
  M12_L3: {
    title: "Fusion route lab",
    instructions: "Keep joining, repulsion, and energy release on one board so fusion is not treated as 'fission but the other way round' with no conditions.",
    taskPrompt: "Compare light nuclei under different conditions and explain why fusion needs extreme conditions before it can become an energy source.",
    exploreSteps: [
      "Start with two light nuclei approaching each other.",
      "Raise the collision conditions until the joining route becomes possible.",
      "Compare the joined nucleus with the starting pair.",
    ],
    watchFor: [
      "Fusion joins light nuclei into a heavier nucleus.",
      "Electrostatic repulsion matters before joining can occur.",
      "Stars are the familiar fusion context.",
    ],
    tryFirst: "Ask what stops the nuclei from joining at low energy before you talk about the energy release.",
    takeaway: "Fusion is clearest when learners keep the entry conditions and the energy outcome in the same story.",
  },
  M12_L4: {
    title: "Reactor control lab",
    instructions: "Treat the reactor as one controlled energy-transfer system rather than only as a fuel source.",
    taskPrompt: "Adjust the reaction rate and the heat-transfer path, then explain how control rods, coolant, and turbines belong to one linked reactor model.",
    exploreSteps: [
      "Start with a steady controlled reaction.",
      "Change the control-rod setting and compare the reaction rate.",
      "Follow the thermal energy from core to electrical output.",
    ],
    watchFor: [
      "Control rods manage the neutron population.",
      "Coolant carries thermal energy away from the core.",
      "Electrical generation is a later energy-transfer stage.",
    ],
    tryFirst: "Trace the energy path from nucleus to electricity before you summarize the reactor roles.",
    takeaway: "Reactor understanding improves when reaction control and energy transfer are read as one plant system.",
  },
  M12_L5: {
    title: "Radioisotope applications lab",
    instructions: "Compare half-life, radiation type, and task purpose together so application choice feels physical rather than arbitrary.",
    taskPrompt: "Choose radioisotopes for tracing, imaging, treatment, or industrial checking, then explain why the radiation properties must match the job.",
    exploreSteps: [
      "Start with one application and list the needed properties.",
      "Compare two candidate isotopes with different half-lives or emissions.",
      "Reject the poorer choice with a physics reason.",
    ],
    watchFor: [
      "Useful radioisotopes are chosen for specific physical reasons.",
      "Half-life and emission type both matter.",
      "Medical and industrial uses still require risk control.",
    ],
    tryFirst: "State the task need first, then choose the radiation properties that fit it.",
    takeaway: "Radioisotope applications make more sense when the choice is justified by half-life and emission behaviour.",
  },
  M12_L6: {
    title: "Benefits and hazards review lab",
    instructions: "Keep practical benefit, biological risk, shielding, and waste management on one board so evaluation stays balanced.",
    taskPrompt: "Compare a useful application with its hazards and controls, then explain why nuclear technologies need both technical value and risk management in the same judgment.",
    exploreSteps: [
      "Start with one useful application.",
      "Add the matching hazard and the main control method.",
      "Finish with the long-term handling or waste question.",
    ],
    watchFor: [
      "Benefit and hazard belong in the same evaluation.",
      "Shielding and procedures reduce risk but do not make physics disappear.",
      "Waste management is part of responsible use.",
    ],
    tryFirst: "Name the benefit and the hazard in the same sentence before deciding whether the application is justified.",
    takeaway: "Nuclear technology is best judged through paired evidence about usefulness, hazard, and control.",
  },
};

export function m12NuclearSimulationCopy(code: string): M12NuclearSimulationCopy | undefined {
  return M12_NUCLEAR_SIMULATION_COPY[code];
}

export function m12NuclearScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M12_L1":
      return ["Keep binding energy separate from chemical energy.", "Use mass defect as a clue to nuclear energy.", "Ask which nucleus is more stable before comparing release."];
    case "M12_L2":
      return ["Track neutron release after each split.", "Treat the chain reaction as a next-step question.", "Keep control language visible with the fission story."];
    case "M12_L3":
      return ["Ask what conditions allow joining to happen.", "Keep repulsion and release in the same explanation.", "Use stars as the familiar fusion context."];
    case "M12_L4":
      return ["Read the reactor as one system.", "Separate control from heat transfer from generation.", "Keep neutron control and energy transfer linked."];
    case "M12_L5":
      return ["Choose the isotope by the job requirements.", "Keep half-life and emission type together.", "Treat usefulness and safety as linked design constraints."];
    case "M12_L6":
      return ["Pair every benefit with a hazard and a control.", "Use ionising-radiation language precisely.", "Include waste management in the final judgment."];
    default:
      return [];
  }
}

export function m12NuclearScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M12_L1":
      return ["Binding energy and mass defect explain nuclear energy changes.", "Nuclear energy comes from the nucleus rather than ordinary chemical bonds.", "Small mass changes can correspond to large energy changes."];
    case "M12_L2":
      return ["Fission splits a heavy nucleus into smaller nuclei.", "A chain reaction depends on the released neutrons causing further fission.", "Reactor control matters because the reaction can multiply."];
    case "M12_L3":
      return ["Fusion joins light nuclei into a heavier nucleus.", "Fusion needs extreme conditions to overcome repulsion.", "Fusion is the energy source in stars."];
    case "M12_L4":
      return ["Control rods help manage the reaction rate.", "Coolant transfers thermal energy away from the core.", "Electrical power comes after several linked energy-transfer stages."];
    case "M12_L5":
      return ["Different applications need different half-lives and emissions.", "Radioisotopes are chosen by matching properties to the task.", "Usefulness must be balanced with exposure control."];
    case "M12_L6":
      return ["Ionising radiation creates real biological risk.", "Shielding, handling, and storage reduce risk.", "Waste management remains part of the full nuclear-technology story."];
    default:
      return [];
  }
}

export function m12NuclearScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M12_NUCLEAR_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [{ kind: "visual", title: visual.visual_title, caption: visual.visual_caption, image_url: visual.image_url, highlights: visual.visual_callouts }];
}

export function m12NuclearReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M12_NUCLEAR_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the main nuclear-physics idea from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
