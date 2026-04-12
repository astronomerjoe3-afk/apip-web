"use client";

type UnknownRecord = Record<string, unknown>;

export type A1QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A1SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A1_ASSET_BASE = "/lesson_assets/A1";

const A1_VISUAL_META: Record<string, A1QuestionVisualMeta> = {
  A1L1: {
    image_url: `${A1_ASSET_BASE}/A1_L1/diagrams/a1_l1_subatomic_inventory.svg`,
    visual_title: "Radiation messengers, solo travelers, and nucleus bundles stay distinct",
    visual_caption: "The inventory board keeps photons, leptons, and nucleons in separate slots so particle classification starts from role and structure rather than one generic 'tiny thing' label.",
    visual_callouts: [
      "Matter travelers are matter particles such as electrons and nucleons; photons are radiation messengers, not matter travelers.",
      "A charge tag is the particle's electric-charge label, such as +1e, 0, or -1e.",
      "Leptons are a different family from hadrons.",
      "Protons and neutrons belong in the nucleus-bundle slot.",
    ],
  },
  A1L2: {
    image_url: `${A1_ASSET_BASE}/A1_L2/diagrams/a1_l2_quarks_hadrons.svg`,
    visual_title: "Quark packing decides whether the hadron is a baryon or a meson",
    visual_caption: "The hadron builder labels the cargo pieces, the baryon route, and the meson route so hadron classification comes from quark composition rather than from size or charge alone.",
    visual_callouts: [
      "Quarks are the cargo pieces used to build hadrons.",
      "A hadron is the umbrella family for baryons and mesons.",
      "Baryons are built from three quarks.",
      "Mesons are built from a quark-antiquark pair.",
      "Protons and neutrons are baryons, not elementary particles.",
    ],
  },
  A1L3: {
    image_url: `${A1_ASSET_BASE}/A1_L3/diagrams/a1_l3_antiparticles_pairs.svg`,
    visual_title: "Pair production and annihilation only work when the event still balances",
    visual_caption: "The event board keeps mirror partners, photon energy, and allowed products on one ledger so pair processes are read as balanced exchanges rather than as magic creation or disappearance.",
    visual_callouts: [
      "Antiparticles are matched partners with opposite charge where relevant.",
      "Pair production needs enough photon energy to make both members.",
      "Annihilation still has to satisfy the conservation ledger.",
    ],
  },
  A1L4: {
    image_url: `${A1_ASSET_BASE}/A1_L4/diagrams/a1_l4_interactions_exchange.svg`,
    visual_title: "Interactions are carried by exchange messengers",
    visual_caption: "The exchange board keeps messenger particles, event change, and interaction family together so forces are read as carried interactions instead of unexplained pushes.",
    visual_callouts: [
      "Exchange particles carry the interaction.",
      "Strong interaction helps bind quarks and nucleons.",
      "Weak interaction is tied to particle-changing events.",
    ],
  },
  A1L5: {
    image_url: `${A1_ASSET_BASE}/A1_L5/diagrams/a1_l5_conservation_rules.svg`,
    visual_title: "Every particle event must pass the charge, baryon-number, and lepton-number gates",
    visual_caption: "The ledger visual keeps before-and-after bookkeeping visible so plausible-looking reactions are still checked against conserved quantities.",
    visual_callouts: [
      "Charge must balance before and after the event.",
      "Baryon number blocks impossible matter-balance stories.",
      "Lepton number is essential in beta and neutrino events.",
    ],
  },
  A1L6: {
    image_url: `${A1_ASSET_BASE}/A1_L6/diagrams/a1_l6_particle_event_analysis.svg`,
    visual_title: "A full event analysis needs classification, interaction clues, and ledger checks together",
    visual_caption: "The final analysis board keeps particle family, interaction type, and conservation evidence on one frame so the event is not guessed from one striking product.",
    visual_callouts: [
      "Reaction channels should be compared systematically.",
      "Decay and scattering are different event families.",
      "The safest interpretation combines several checks, not one clue.",
    ],
  },
};

export function a1QuestionVisualMeta(itemId: string): A1QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A1L[1-6])_[A-Z]+\d+$/);
  return match ? A1_VISUAL_META[match[1]] : undefined;
}

const A1_SIMULATION_COPY: Record<string, A1SimulationCopy> = {
  A1_L1: {
    title: "Particle inventory lab",
    instructions: "Keep photons, leptons, and nucleons on one classification board so matter and radiation are separated before later interaction stories arrive.",
    taskPrompt: "Sort the selected particles by family and role, then explain why a photon, an electron, and a proton should not start in the same category.",
    exploreSteps: [
      "Start with one clear radiation messenger and one clear matter traveler, meaning a matter particle such as an electron or proton.",
      "Read the charge tag next, meaning the particle's electric-charge label such as +1e, 0, or -1e.",
      "Add nucleus particles and compare which ones belong in the nucleus slot.",
      "Explain the inventory rule before using any interaction vocabulary.",
    ],
    watchFor: [
      "Photons belong to radiation, not to the hadron family.",
      "Charge tags help compare neutral and charged particles, but charge alone does not decide the family.",
      "Leptons are not hadrons.",
      "Nucleons are composite nuclear particles, not free electrons.",
    ],
    tryFirst: "Place a photon, electron, and proton on the board and ask what role each one plays before naming families.",
    takeaway: "A strong particle story begins with clean classification of messengers, travelers, and nucleus bundles.",
  },
  A1_L2: {
    title: "Quark packing lab",
    instructions: "Use the quark-packing board to compare three-quark bundles with quark-antiquark pair bundles before deciding whether the particle is a baryon or a meson.",
    taskPrompt: "Build several quark bundles, then explain why quark composition is a stronger classification rule than size or charge alone.",
    exploreSteps: [
      "Start with a known baryon and count the quarks.",
      "Switch on an antiquark and compare the new packing rule.",
      "Use the final composition to decide whether the finished particle is a baryon or a meson.",
    ],
    watchFor: [
      "Three quarks means baryon.",
      "Quark plus antiquark means meson.",
      "Use quark packing before size or charge.",
    ],
    tryFirst: "Compare a proton with a quark-antiquark pair and say what changed in the packing before you talk about charge.",
    takeaway: "Baryon-versus-meson classification is strongest when the quark-packing rule is read first.",
  },
  A1_L3: {
    title: "Antiparticle pair lab",
    instructions: "Use one event board to compare annihilation with pair production so you can see when a pair is allowed and why the totals still have to balance.",
    taskPrompt: "Switch between annihilation and pair production, change the photon energy, and explain why one case is allowed while another is not.",
    exploreSteps: [
      "Start with an electron and a positron and run annihilation.",
      "Swap to pair production and test a photon below and above the energy threshold.",
      "Check that charge and the overall before-and-after story still balance in both directions.",
    ],
    watchFor: [
      "A below-threshold photon cannot create the pair.",
      "An electron and a positron are matched opposite-charge partners.",
      "Annihilation and pair production still obey the same conservation rules.",
    ],
    tryFirst: "Start just below the photon-energy threshold, then nudge it above the threshold and watch when the pair first becomes allowed.",
    takeaway: "Pair production needs enough photon energy, and both pair processes still have to satisfy conservation.",
  },
  A1_L4: {
    title: "Interaction sorter lab",
    instructions: "Compare strong and weak interaction cases on one board so binding events and particle-change events do not blur together.",
    taskPrompt: "Switch between a binding case and a particle-change case, then explain which interaction fits each one and why.",
    exploreSteps: [
      "Start with a strong-interaction example that keeps particles bound together.",
      "Move to a weak-interaction example where one particle changes into another.",
      "Use the change in the event to decide which interaction family you are looking at.",
    ],
    watchFor: [
      "Strong interaction is the binding story.",
      "Weak interaction is the particle-change story.",
      "Exchange particles help explain how the interaction is carried.",
    ],
    tryFirst: "Ask what the event is doing first: is it holding particles together or changing one particle into another?",
    takeaway: "Interaction questions are easier when you identify the kind of change first and then match the interaction.",
  },
  A1_L5: {
    title: "Conservation check lab",
    instructions: "Keep charge, baryon number, and lepton number visible on the same ledger so every event is checked the same way.",
    taskPrompt: "Change one product at a time, then decide whether the event still passes the charge, baryon-number, and lepton-number checks.",
    exploreSteps: [
      "Start with an allowed event and read all three totals before and after.",
      "Change one outgoing particle and recalculate the totals.",
      "Reject the event as soon as one conservation rule no longer balances.",
    ],
    watchFor: [
      "Charge is not the only rule that matters.",
      "Baryon number helps track baryons through the event.",
      "Lepton number matters whenever leptons appear in the event.",
    ],
    tryFirst: "Keep the charge balanced but break either baryon number or lepton number. That shows why one correct total is not enough.",
    takeaway: "A particle event is only allowed when all three conservation checks agree.",
  },
  A1_L6: {
    title: "Particle-event analysis lab",
    instructions: "Put particle identity, interaction clue, and conservation check on one board so the event is judged from several clues together.",
    taskPrompt: "Compare two possible explanations for the same event, then decide which one fits the particles, the interaction clue, and the conservation rules best.",
    exploreSteps: [
      "Start by naming the particles that appear before and after the event.",
      "Decide whether the overall story looks more like a decay or a scattering event.",
      "Use the interaction clue and the conservation checks to confirm the best explanation.",
    ],
    watchFor: [
      "Do not decide from one dramatic particle alone.",
      "Decay and scattering are different kinds of event story.",
      "The safest answer uses identity, interaction, and conservation together.",
    ],
    tryFirst: "Hide the final label and try to justify the event from the particle list, the interaction clue, and the conservation check alone.",
    takeaway: "The best particle-event explanation is the one supported by several matching clues, not by one guess.",
  },
};

export function a1SimulationCopy(code: string): A1SimulationCopy | undefined {
  return A1_SIMULATION_COPY[code];
}

export function a1ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A1_L1":
      return ["Matter travelers are matter particles such as electrons and nucleons, while photons are radiation messengers.", "A charge tag is the electric-charge label carried by the particle, such as +1e, 0, or -1e.", "Use family and role before interaction stories.", "Do not collapse every subatomic object into one generic category."];
    case "A1_L2":
      return ["Read quark composition before charge or size.", "Keep baryons and mesons structurally distinct.", "Treat hadron as the umbrella family, not the final answer."];
    case "A1_L3":
      return ["Use threshold language before brightness-style language.", "Keep pair production and annihilation as balanced exchanges.", "Check the conservation ledger in both directions."];
    case "A1_L4":
      return ["Ask what change the event allows.", "Use messenger language to classify the interaction.", "Keep binding stories separate from particle-change stories."];
    case "A1_L5":
      return ["Audit charge, baryon number, and lepton number together.", "Reject plausible-sounding reactions that fail the ledger.", "Use conservation as the first filter, not the last check."];
    case "A1_L6":
      return ["Combine classification, interaction clues, and conservation evidence.", "Compare alternative channels before deciding.", "Do not over-trust one dramatic product in the event list."];
    default:
      return [];
  }
}

export function a1ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A1_L1":
      return ["Matter travelers are matter particles such as electrons and nucleons, not radiation carriers.", "A charge tag is the electric-charge label used to compare particles such as +1e, 0, or -1e.", "Atoms contain electrons around nuclei made from protons and neutrons.", "Photons carry radiation and energy inside particle events.", "Leptons are not hadrons, while nucleons are composite hadrons."];
    case "A1_L2":
      return ["Hadrons are composite particles built from quarks.", "Baryons contain three quarks.", "Mesons contain a quark-antiquark pair."];
    case "A1_L3":
      return ["Antiparticles are matched partners, not unrelated extras.", "Annihilation converts a pair into allowed radiation products.", "Pair production needs enough photon energy and still obeys conservation."];
    case "A1_L4":
      return ["Interactions can be modeled as messenger exchanges.", "The strong interaction is a binding story.", "The weak interaction is associated with particle-changing processes."];
    case "A1_L5":
      return ["Charge is conserved in every allowed particle event.", "Baryon number and lepton number are useful bookkeeping tags.", "Conservation checks are the fastest first filter for event questions."];
    case "A1_L6":
      return ["A full event analysis combines identity, interaction type, and conservation rules.", "Different reaction channels can be compared by allowed products.", "Decay and scattering are different event families but obey the same bookkeeping checks."];
    default:
      return [];
  }
}

export function a1ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A1_VISUAL_META[code.replace("_", "")];
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

export function a1ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A1_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A1_L1: "Use the particle inventory visual to explain why photons, leptons, and nucleons must be separated before later particle stories are built.",
    A1_L2: "Use the hadron builder visual to explain why quark packing is the safest way to classify baryons and mesons.",
    A1_L3: "Use the pair-event visual to explain why pair production and annihilation still have to satisfy threshold and conservation conditions.",
    A1_L4: "Use the exchange visual to explain how messenger particles help distinguish interaction families.",
    A1_L5: "Use the conservation ledger visual to explain why charge, baryon number, and lepton number must all be checked.",
    A1_L6: "Use the event-analysis visual to explain why a strong particle interpretation combines more than one clue.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the A1 visual to explain the lesson's key particle-physics relationship clearly.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
