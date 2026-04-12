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

const M11_ATOMIC_ASSET_BASE = "/lesson_assets/M13";

const M11_VISUAL_META: Record<string, M11QuestionVisualMeta> = {
  M11L1: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L1/diagrams/m13-l1-vault-house.svg`,
    visual_title: "Core-vault identity stays separate from the outer electron story",
    visual_caption: "The atomic-structure board keeps protons, neutrons, electrons, atomic number, mass number, and charge on separate ledgers so the nucleus and electron shell do not collapse into one vague picture.",
    visual_callouts: [
      "Element identity follows proton count in the nucleus.",
      "Mass number counts protons and neutrons together.",
      "Changing electrons changes charge state, not the element.",
    ],
  },
  M11L2: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L2/diagrams/m13-l2-same-badge-vaults.svg`,
    visual_title: "Same proton badge, different neutron balance: isotope comparison",
    visual_caption: "The isotope comparison board fixes proton number first, then varies neutron number and stability so isotope logic does not get replaced by a mass-number guess.",
    visual_callouts: [
      "Same proton count means same element family.",
      "Different neutron counts create isotope differences.",
      "Stability can differ even when proton count stays fixed.",
    ],
  },
  M11L3: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L3/diagrams/m13-l3-escape-signals.svg`,
    visual_title: "Alpha, beta-minus, and gamma stay distinct in both count change and shielding",
    visual_caption: "The radiation board compares what leaves the nucleus, how the daughter changes, and what shielding blocks each radiation type.",
    visual_callouts: [
      "Alpha changes both mass number and atomic number.",
      "Beta-minus changes atomic number while mass number stays the same.",
      "Gamma changes energy state without changing nuclear counts.",
    ],
  },
  M11L4: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L4/diagrams/m13-l4-half-life-curve.svg`,
    visual_title: "Half-life is a repeated halving pattern for large samples",
    visual_caption: "The half-life visuals pair a crowd-halving picture with a decay curve so students can connect equal intervals, remaining fraction, and the shape of radioactive decay.",
    visual_callouts: [
      "Equal half-life intervals halve what remains, not the same fixed number.",
      "Single nuclei decay unpredictably, but large samples follow a stable pattern.",
      "Graph shape and population story should agree with each other.",
    ],
  },
  M11L5: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L5/diagrams/m13-l5-ambient-buzz.svg`,
    visual_title: "Measured count rate mixes source plus background unless you subtract",
    visual_caption: "The detector board separates measured count rate, background count rate, and corrected source count rate so raw detector readings are not overinterpreted.",
    visual_callouts: [
      "Background radiation is a normal environmental presence.",
      "Corrected source reading comes from measured minus background.",
      "A non-zero reading alone does not prove contamination.",
    ],
  },
  M11L6: {
    image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L6/diagrams/m13-l6-vault-ledger.svg`,
    visual_title: "Decay equations work only when both mass number and atomic number balance",
    visual_caption: "The decay-ledger board keeps parent nucleus, daughter nucleus, emitted radiation, and both balancing rules on one line.",
    visual_callouts: [
      "Alpha lowers both mass number and atomic number.",
      "Beta-minus changes atomic number but not mass number.",
      "Gamma leaves both counts unchanged.",
    ],
  },
};

export function m11QuestionVisualMeta(itemId: string): M11QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M11L[1-6])_[A-Z]+\d+$/);
  return match ? M11_VISUAL_META[match[1]] : undefined;
}

const M11_SIMULATION_COPY: Record<string, M11SimulationCopy> = {
  M11_L1: {
    title: "Vault-house lab",
    instructions: "Keep proton count, neutron count, and electron count visible as three different jobs in the atomic model.",
    taskPrompt: "Adjust proton, neutron, and electron counts, then explain why element identity stays tied to proton number even when charge changes.",
    exploreSteps: [
      "Hold proton count fixed and vary electron count to compare charge change with element identity.",
      "Hold proton count fixed and vary neutron count to compare mass number change with element identity.",
      "Reset and compare what each count changes in the readout.",
    ],
    watchFor: [
      "Element identity comes from proton number in the nucleus.",
      "Mass number counts protons and neutrons together.",
      "Electron count changes charge state without changing the element.",
    ],
    tryFirst: "Set 12 protons, 12 neutrons, and 12 electrons first, then remove one electron. The charge changes, but the element stays the same because the proton count did not move.",
    takeaway: "Atomic structure becomes much clearer when the nucleus story and electron story stay separate from the start.",
  },
  M11_L2: {
    title: "Same-badge isotope lab",
    instructions: "Anchor element identity in proton number first, then use neutron number to build isotope differences and stability comparisons.",
    taskPrompt: "Compare two nuclei with the same proton number but different neutron counts, then explain why they are isotopes of one element rather than different elements.",
    exploreSteps: [
      "Choose one shared proton count.",
      "Vary the neutron count on one side only and compare the new mass number.",
      "Switch stability mode and compare isotope family with isotope stability.",
    ],
    watchFor: [
      "Same proton count means same element.",
      "Different neutron counts create different isotopes.",
      "Stability is a separate question from element identity.",
    ],
    tryFirst: "Fix the proton count at 17 and compare mass numbers 35 and 37. The nuclei stay in the same element family because Z is unchanged, even though the mass number and neutron count differ.",
    takeaway: "Isotopes are easiest to understand when proton number answers the identity question and neutron number answers the isotope question.",
  },
  M11_L3: {
    title: "Escape-signal lab",
    instructions: "Track count change, emitted radiation, shielding, and penetration together so alpha, beta-minus, and gamma never blur into one category.",
    taskPrompt: "Switch between alpha, beta-minus, and gamma, then explain how each signal changes the nucleus and why the shielding order is different.",
    exploreSteps: [
      "Start with alpha and read the daughter count change.",
      "Switch to beta-minus and compare what stays the same and what changes.",
      "Finish with gamma and compare penetration without changing the nuclear counts.",
    ],
    watchFor: [
      "Alpha removes two protons and two neutrons.",
      "Beta-minus raises atomic number by one while mass number stays fixed.",
      "Gamma changes energy state, not the nuclear counts.",
    ],
    tryFirst: "Start with gamma and dense shielding first, then switch to alpha with paper. The contrast helps separate penetration from count change, which is the core distinction learners often mix up.",
    takeaway: "Radiation types stay clearer when you compare what leaves the nucleus, how the numbers change, and how easily the signal is blocked on the same board.",
  },
  M11_L4: {
    title: "Settle-span lab",
    instructions: "Keep the crowd-halving picture and the decay-curve picture linked so half-life reads as one population story rather than a memorized graph shape.",
    taskPrompt: "Run equal half-life intervals, compare remaining count and remaining fraction, and explain why a large sample can be predictable even though single nuclei decay randomly.",
    exploreSteps: [
      "Start with one crowd size and one half-life duration.",
      "Advance one equal interval at a time and compare remaining number with remaining fraction.",
      "Match the crowd view to the graph view and explain the same trend in both forms.",
    ],
    watchFor: [
      "Half-life halves what remains, not the same fixed number.",
      "Single nuclei are random, but large populations follow a stable trend.",
      "Elapsed time, remaining fraction, and graph shape should all agree.",
    ],
    tryFirst: "Start at 160 nuclei with a half-life of 2 hours, then step through 2, 4, and 6 hours. The remaining counts fall by halving, not by subtracting the same number each time.",
    takeaway: "Half-life is strongest as a group-level halving rule linked to a decay curve, not as a timer attached to each individual nucleus.",
  },
  M11_L5: {
    title: "Ambient-buzz lab",
    instructions: "Separate raw detector reading, background reading, and corrected source reading before you decide what the detector evidence means.",
    taskPrompt: "Measure background first, add a source second, and explain why corrected count rate is better evidence than quoting the raw reading alone.",
    exploreSteps: [
      "Start in one location with no source and read the background.",
      "Add a source and compare the measured count with the background count.",
      "Switch location and compare how the background itself can change.",
    ],
    watchFor: [
      "Background radiation is normal.",
      "Corrected source count comes from subtracting background.",
      "Location and conditions can change the background reading.",
    ],
    tryFirst: "Start with no source on the mountain setting. The detector still clicks, which makes it easier to see why a non-zero reading is not enough evidence by itself.",
    takeaway: "Detector reasoning gets stronger when you treat background as a real physical signal that must be measured and subtracted, not ignored.",
  },
  M11_L6: {
    title: "Vault-ledger lab",
    instructions: "Balance decay events like bookkeeping: identify the decay type, write the daughter, then check both atomic number and mass number.",
    taskPrompt: "Switch between alpha, beta-minus, and gamma, then explain how the ledger stays balanced and when the daughter becomes a different element.",
    exploreSteps: [
      "Start with alpha and compare both count changes.",
      "Switch to beta-minus and explain why only one count changes.",
      "Finish with gamma and test the unchanged-count case.",
    ],
    watchFor: [
      "Both atomic number and mass number must balance.",
      "The emitted radiation is part of the bookkeeping.",
      "Changing atomic number changes the element identity.",
    ],
    tryFirst: "Start with gamma first. Because neither count changes, it gives you the cleanest baseline for seeing why alpha and beta-minus need different ledger rules.",
    takeaway: "Decay equations become less mechanical when they are read as full nuclear-event bookkeeping instead of isolated symbol shuffling.",
  },
};

export function m11SimulationCopy(code: string): M11SimulationCopy | undefined {
  return M11_SIMULATION_COPY[String(code || "").trim().replace(/-/g, "_").toUpperCase()];
}

export function m11ScaffoldFocusExtras(code: string): string[] {
  switch (String(code || "").trim().replace(/-/g, "_").toUpperCase()) {
    case "M11_L1":
      return ["Keep nucleus identity separate from outer-electron changes.", "Use Z and A for different questions.", "Anchor charge in electron imbalance rather than element identity."];
    case "M11_L2":
      return ["Check proton number before checking mass number.", "Treat neutron change as the isotope move.", "Keep isotope identity separate from isotope stability."];
    case "M11_L3":
      return ["Track count change and shielding together.", "Do not let penetration order replace nuclear-change logic.", "Use each radiation type as its own process."];
    case "M11_L4":
      return ["Read half-life as halving what remains.", "Keep individual randomness separate from group predictability.", "Connect the crowd picture to the decay graph."];
    case "M11_L5":
      return ["Measure background before naming the source effect.", "Subtract before concluding.", "Treat location change as part of the background story."];
    case "M11_L6":
      return ["Balance both A and Z.", "Include the emitted radiation in the bookkeeping.", "Use proton-number change to decide whether the element changes."];
    default:
      return [];
  }
}

export function m11ScaffoldCoreBullets(code: string): string[] {
  switch (String(code || "").trim().replace(/-/g, "_").toUpperCase()) {
    case "M11_L1":
      return ["Proton number fixes the element identity.", "Mass number counts protons and neutrons.", "Electron change affects charge state rather than element identity."];
    case "M11_L2":
      return ["Isotopes have the same proton number but different neutron numbers.", "Mass number can change while the element stays the same.", "Stability can differ between isotopes of the same element."];
    case "M11_L3":
      return ["Alpha, beta-minus, and gamma are different decay processes.", "Their count changes and shielding requirements differ.", "Gamma changes energy state without changing A or Z."];
    case "M11_L4":
      return ["Half-life is a statistical halving pattern.", "Equal half-life intervals halve what remains.", "A large sample can be predictable even though one nucleus decays randomly."];
    case "M11_L5":
      return ["Background radiation is a normal environmental presence.", "Corrected source count equals measured count minus background count.", "A non-zero detector reading is not enough evidence by itself."];
    case "M11_L6":
      return ["Decay equations conserve mass number and atomic number.", "Alpha, beta-minus, and gamma each obey a different ledger rule.", "A change in atomic number means a change in element identity."];
    default:
      return [];
  }
}

export function m11ScaffoldMediaCards(code: string): UnknownRecord[] {
  const normalized = String(code || "").trim().replace(/-/g, "_").toUpperCase();
  if (normalized === "M11_L4") {
    return [
      {
        kind: "visual",
        title: "See the crowd-halving picture",
        caption: "The crowd view keeps equal-interval halving visible before the graph formalism takes over.",
        image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L4/diagrams/m13-l4-half-life-crowd.svg`,
        highlights: [
          "Equal intervals cut the remaining undecayed group by half.",
          "The number removed each round changes because the sample is shrinking.",
          "One nucleus is random, but the group trend is stable.",
        ],
      },
      {
        kind: "visual",
        title: "See the decay-curve view",
        caption: "The graph view turns the same half-life story into a time-versus-undecayed-population curve.",
        image_url: `${M11_ATOMIC_ASSET_BASE}/M13_L4/diagrams/m13-l4-half-life-curve.svg`,
        highlights: [
          "The curve falls more gently as fewer undecayed nuclei remain.",
          "Equal horizontal steps in time correspond to halving remaining population.",
          "Graph shape and sample story should agree.",
        ],
      },
    ];
  }

  const visual = M11_VISUAL_META[normalized.replace("_", "")];
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

export function m11ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M11_VISUAL_META[String(code || "").trim().replace(/-/g, "_").toUpperCase().replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the M11 visual to explain the key atomic or radioactivity relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
