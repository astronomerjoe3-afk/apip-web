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
      "Leptons are a different family from hadrons.",
      "Protons and neutrons belong in the nucleus-bundle slot.",
    ],
  },
  A1L2: {
    image_url: `${A1_ASSET_BASE}/A1_L2/diagrams/a1_l2_quarks_hadrons.svg`,
    visual_title: "Quark packing decides whether the hadron is a baryon or a meson",
    visual_caption: "The hadron builder keeps three-quark crates separate from quark-antiquark pair parcels so classification comes from composition, not from size or charge alone.",
    visual_callouts: [
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
      "Add nucleus particles and compare which ones belong in the nucleus slot.",
      "Explain the inventory rule before using any interaction vocabulary.",
    ],
    watchFor: [
      "Photons belong to radiation, not to the hadron family.",
      "Leptons are not hadrons.",
      "Nucleons are composite nuclear particles, not free electrons.",
    ],
    tryFirst: "Place a photon, electron, and proton on the board and ask what role each one plays before naming families.",
    takeaway: "A strong particle story begins with clean classification of messengers, travelers, and nucleus bundles.",
  },
  A1_L2: {
    title: "Hadron builder lab",
    instructions: "Use the quark-packing board to compare three-quark crates with quark-antiquark pair parcels before naming the hadron family.",
    taskPrompt: "Build several hadrons, then explain why quark composition is a stronger classification rule than size or charge alone.",
    exploreSteps: [
      "Start with a known baryon and count the quarks.",
      "Switch on an antiquark and compare the new packing rule.",
      "Use the final composition to classify the finished hadron.",
    ],
    watchFor: [
      "Three quarks means baryon.",
      "Quark plus antiquark means meson.",
      "Hadron is the umbrella family, not the final category itself.",
    ],
    tryFirst: "Compare a proton with a pion-like pair and say what changed in the packing before you talk about charge.",
    takeaway: "Hadron classification is strongest when the quark-packing rule is read first.",
  },
  A1_L3: {
    title: "Antimatter pair lab",
    instructions: "Keep photon energy, mirror partners, and the conservation ledger on one event board so pair processes stay causal.",
    taskPrompt: "Toggle between annihilation and pair production, then explain why energy threshold and conservation checks both matter.",
    exploreSteps: [
      "Start with a particle-antiparticle pair and run annihilation.",
      "Switch to pair production and raise photon energy across the threshold.",
      "Check the ledger before accepting the event.",
    ],
    watchFor: [
      "Below-threshold photons cannot create the pair.",
      "Annihilation is a matter-radiation exchange, not a vanishing trick.",
      "Conservation rules stay in force in both directions.",
    ],
    tryFirst: "Hold the photon energy just below threshold, then raise it until the pair can appear. That contrast makes the gate memorable.",
    takeaway: "Pair production and annihilation are balanced event swaps governed by threshold and conservation.",
  },
  A1_L4: {
    title: "Exchange-messenger lab",
    instructions: "Use the interaction board to compare binding stories and particle-change stories without collapsing all forces into one generic push.",
    taskPrompt: "Switch interaction family, read the messenger role, and explain how the event signature helps classify the interaction.",
    exploreSteps: [
      "Start with a strong-interaction binding example.",
      "Swap to a weak-interaction particle-change example.",
      "Compare what changed and which messenger story fits each case.",
    ],
    watchFor: [
      "The interaction messenger is part of the explanation.",
      "Strong interaction emphasizes binding.",
      "Weak interaction emphasizes allowed particle change.",
    ],
    tryFirst: "Ask what changed in the event first, then decide which messenger family makes that change possible.",
    takeaway: "Interaction classification becomes clearer when messenger role and event signature are read together.",
  },
  A1_L5: {
    title: "Conservation gate lab",
    instructions: "Audit charge, baryon number, and lepton number on one ledger so reaction checking becomes a structured gate process.",
    taskPrompt: "Edit one event product at a time, then explain which conservation gate fails first and why the full event should be rejected or accepted.",
    exploreSteps: [
      "Start with a valid event and read all three balances.",
      "Change one outgoing particle and recheck the ledger.",
      "Decide whether the event still passes every gate.",
    ],
    watchFor: [
      "Charge is only one of the required balances.",
      "Baryon and lepton number track family conservation.",
      "A plausible-looking event can still fail the ledger.",
    ],
    tryFirst: "Break just one outgoing product and see which gate catches the problem first before trying to repair the whole event.",
    takeaway: "Conservation checking is the fastest safe filter for particle reactions and decays.",
  },
  A1_L6: {
    title: "Event-classifier lab",
    instructions: "Keep family clues, messenger clues, and ledger evidence on one frame so full event interpretation becomes systematic.",
    taskPrompt: "Compare alternative channels, decide whether the event is a decay or scattering story, and justify the interpretation with more than one clue.",
    exploreSteps: [
      "Start with the product list and classify the particles.",
      "Read the interaction hint and conservation summary next.",
      "Choose the strongest channel only after the full board agrees.",
    ],
    watchFor: [
      "One striking particle is not enough to classify the event.",
      "Decay and scattering need different story structures.",
      "A strong interpretation uses classification, interaction, and conservation together.",
    ],
    tryFirst: "Hide the final label and try to justify the event from the evidence layers only. If one layer disagrees, keep investigating.",
    takeaway: "Particle-event analysis is strongest when several evidence layers point to the same story.",
  },
};

export function a1SimulationCopy(code: string): A1SimulationCopy | undefined {
  return A1_SIMULATION_COPY[code];
}

export function a1ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A1_L1":
      return ["Matter travelers are matter particles such as electrons and nucleons, while photons are radiation messengers.", "Use family and role before interaction stories.", "Do not collapse every subatomic object into one generic category."];
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
      return ["Matter travelers are matter particles such as electrons and nucleons, not radiation carriers.", "Atoms contain electrons around nuclei made from protons and neutrons.", "Photons carry radiation and energy inside particle events.", "Leptons are not hadrons, while nucleons are composite hadrons."];
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
