"use client";

type UnknownRecord = Record<string, unknown>;
type BankKind = "diagnostic" | "concept" | "mastery";

type RawMcItem = {
  kind: "mc";
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint: string;
  explanation: string;
};

type RawShortItem = {
  kind: "short";
  prompt: string;
  acceptedAnswers: string[];
  hint: string;
};

type RawItem = RawMcItem | RawShortItem;

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function compactCode(code: string): string {
  return normalizeCode(code).replace("_", "");
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint = "Rebuild the particle-physics rule before choosing.",
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
}

function shortCases(cases: Array<{ prompt: string; acceptedAnswers: string[]; hint: string }>): RawItem[] {
  return cases.map((entry) => short(entry.prompt, entry.acceptedAnswers, entry.hint));
}

function mcItem(
  id: string,
  prompt: string,
  choices: string[],
  answerIndex: number,
  hint: string,
  explanation: string,
): UnknownRecord {
  return {
    id,
    prompt,
    choices,
    answer_index: answerIndex,
    hint,
    feedback: choices.map((_, index) => (index === answerIndex ? explanation : hint)),
  };
}

function shortItem(id: string, prompt: string, acceptedAnswers: string[], hint: string): UnknownRecord {
  return {
    id,
    prompt,
    choices: [],
    accepted_answers: acceptedAnswers,
    hint,
    feedback: [hint],
  };
}

function stageLabel(kind: BankKind): string {
  switch (kind) {
    case "diagnostic":
      return "DG";
    case "concept":
      return "CG";
    case "mastery":
      return "M";
    default:
      return "Q";
  }
}

function minimumSize(kind: BankKind): number {
  return kind === "mastery" ? 40 : 20;
}

function normalizePrompt(prompt: string): string {
  return String(prompt || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function materializeBank(code: string, kind: BankKind, rawItems: RawItem[]): UnknownRecord[] {
  const seenSignatures = new Set<string>();
  const deduped = rawItems.flatMap((item, index) => {
    const signature = item.kind === "mc"
      ? `${normalizePrompt(item.prompt)}::${item.choices.map((choice) => normalizePrompt(choice)).join("|")}`
      : `${normalizePrompt(item.prompt)}::${item.acceptedAnswers.map((answer) => normalizePrompt(answer)).join("|")}`;
    if (!item.prompt || seenSignatures.has(signature)) return [];
    seenSignatures.add(signature);
    const id = `${compactCode(code)}-${stageLabel(kind)}-${String(index + 1).padStart(2, "0")}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`A1 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Classify by family and role before using the charge tag.";
  return [
    mc("Which particle is the radiation messenger in the lesson's starting inventory?", ["photon", "electron", "proton", "neutron"], 0, "Photons carry electromagnetic radiation in the particle story.", hint),
    mc("Which particle is a lepton in the opening A1 classification set?", ["electron", "proton", "neutron", "pion"], 0, "The electron is a lepton, not a hadron.", hint),
    mc("Which pair belongs in the nucleon slot?", ["proton and neutron", "electron and photon", "photon and neutrino", "electron and positron"], 0, "Nucleons are the proton and neutron.", hint),
    mc("Two particles both have charge 0e. Which pair still belongs to different categories?", ["photon and neutron", "proton and positron", "electron and proton", "proton and neutron"], 0, "Neutral charge alone does not force the same family or role.", hint),
    mc("What is the safest first rule when sorting a proton, electron, and photon?", ["separate them by family and role before using charge", "group all charged particles together first", "group all neutral particles together first", "ignore structure and focus only on mass"], 0, "A1_L1 begins by separating messengers, solo travelers, and nucleus particles.", hint),
    mc("What is the charge tag of the proton?", ["+1e", "0e", "-1e", "+2e"], 0, "The proton carries one positive elementary-charge unit.", hint),
    mc("What is the charge tag of the electron?", ["-1e", "0e", "+1e", "-2e"], 0, "The electron carries one negative elementary-charge unit.", hint),
    mc("What is the charge tag of the neutron?", ["0e", "-1e", "+1e", "+2/3e"], 0, "The neutron is neutral.", hint),
    mc("What is the total charge of one proton, one electron, and one neutron?", ["0e", "+1e", "-1e", "+2e"], 0, "The proton and electron cancel while the neutron adds zero.", hint),
    mc("Why is 'neutral' not enough to classify a particle correctly?", ["different particle families can share the same charge tag", "all neutral particles are photons", "charge always fixes the interaction type", "neutral particles cannot appear in nuclei"], 0, "Family and role are broader than the charge label.", hint),
    mc("Which statement about nucleons is correct?", ["nucleons are composite nucleus particles", "nucleons are radiation messengers", "nucleons are leptons", "nucleons are always neutral"], 0, "Protons and neutrons belong in the nucleus-building category.", hint),
    mc("Which statement about photons is correct?", ["photons are radiation messengers rather than matter particles", "photons are nucleons with zero charge", "photons are three-quark hadrons", "photons belong in the nucleus"], 0, "The photon carries radiation, not baryonic matter.", hint),
    ...shortCases([
      { prompt: "The proton and neutron together are called ...", acceptedAnswers: ["nucleons", "nucleon"], hint: "Use the nucleus-particle family name." },
      { prompt: "The electron belongs to the ... family.", acceptedAnswers: ["lepton", "leptons", "lepton family"], hint: "It is not a hadron." },
      { prompt: "The photon is a radiation ...", acceptedAnswers: ["messenger"], hint: "That is the role word used in the lesson." },
      { prompt: "A charge tag is an electric-charge ... attached to a particle.", acceptedAnswers: ["label", "tag"], hint: "It tells you +1e, 0e, or -1e." },
      { prompt: "A nucleus contains protons and ...", acceptedAnswers: ["neutrons"], hint: "Think of the two nucleons." },
      { prompt: "One proton and one electron together have total charge ...", acceptedAnswers: ["0", "0e", "zero"], hint: "The positive and negative charges cancel." },
      { prompt: "The neutron has charge tag ...", acceptedAnswers: ["0", "0e", "zero"], hint: "It is neutral." },
      { prompt: "Before later particle stories, keep messengers, leptons, and nucleons ...", acceptedAnswers: ["separate", "distinct"], hint: "That is the core inventory rule." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Use family, role, and charge tag together rather than one label alone.";
  return [
    mc("Why is it weak to sort all subatomic objects by charge tag only?", ["different particle families can share the same charge", "charge never matters in particle physics", "only mass decides the family", "every neutral particle is identical"], 0, "The lesson separates family and role from charge.", hint),
    mc("Why can a photon and a neutron both be neutral but still belong in different categories?", ["the photon is a radiation messenger while the neutron is a nucleon", "neutrons are not matter particles", "photons are built from quarks", "neutral particles always belong in nuclei"], 0, "Charge equality does not erase role and structure differences.", hint),
    mc("Why should the electron not be placed in the nucleon slot even though it is matter?", ["it is a lepton rather than a nucleus particle", "it has negative charge", "it moves too fast", "leptons always have zero mass"], 0, "Matter particles still belong to different families.", hint),
    mc("A student says 'proton and electron cancel to zero charge, so they must be the same kind of particle.' What is the correction?", ["equal and opposite charge does not mean the same family or role", "anything with total zero becomes a photon", "charge conservation only works for nucleons", "electrons are hidden protons"], 0, "The charge ledger is different from classification.", hint),
    mc("Why is 'matter traveler' stronger language than just saying 'tiny object' in A1_L1?", ["it distinguishes matter particles from radiation messengers before later interaction work", "it means the particle must be charged", "it replaces the need for families", "it tells you the particle is a hadron"], 0, "The lesson builds a usable inventory, not a vague list.", hint),
    mc("Why are protons and neutrons grouped together first in this lesson?", ["they share the nucleus-building nucleon role", "they both have the same charge tag", "they are both leptons", "they are both photons"], 0, "The shared nucleus role is the first organizing idea.", hint),
    mc("Which statement best matches the A1_L1 lesson meaning?", ["particle family and role should stay visible before later interactions and reactions are studied", "only charge matters in subatomic classification", "every neutral particle belongs in the same family", "all subatomic particles are hadrons"], 0, "This protects the module's opening distinction.", hint),
    mc("Why is the photon not treated as a 'solo matter traveler'?", ["it carries radiation rather than matter", "it must have zero speed", "it always stays inside the nucleus", "it has no energy"], 0, "Photon language is messenger language in this unit.", hint),
    mc("Why is it useful to name the nucleon family before naming hadrons later?", ["it gives the learner a stable nucleus category before quark-built subfamilies are introduced", "nucleon and hadron always mean the same thing", "hadron language removes the need for nuclei", "nucleons are not composite"], 0, "The early inventory prepares the later hadron lesson.", hint),
    mc("What should a rigorous A1_L1 explanation keep visible?", ["charge tags are helpful, but family and role decide the category", "charge tags replace family completely", "only neutral particles need classification", "nucleus particles are radiation messengers"], 0, "That is the discipline this lesson is teaching.", hint),
    mc("A board contains photon, electron, proton, and neutron. Which grouping is strongest?", ["photon alone, electron alone, proton with neutron", "photon with neutron, proton with electron", "all neutral together and all charged together", "all matter together with photon"], 0, "This grouping respects role and nucleus structure.", hint),
    mc("Why is a proton not just 'a positively charged electron-like particle'?", ["it belongs to a different family and nucleus role", "positive charge means it must be a lepton", "all positive particles are identical", "charge decides the structure"], 0, "Family is not reduced to sign of charge.", hint),
    mc("Why is a neutron not grouped with the photon just because both have 0e charge?", ["the neutron is a matter nucleon while the photon is a radiation messenger", "the photon is actually a nucleon", "neutral objects must stay together", "the neutron has hidden positive charge"], 0, "Role and structure separate them.", hint),
    mc("Which sentence is the safest short summary?", ["A1_L1 separates radiation messengers, leptons, and nucleons before later particle stories are built", "A1_L1 shows that all neutral particles are similar", "A1_L1 proves charge is enough to classify all particles", "A1_L1 merges photons with matter particles"], 0, "That summary preserves the lesson distinction.", hint),
    mc("Why does the lesson mention charge tags at all if family is the main classifier?", ["charge is still needed for bookkeeping and later event checks", "charge never matters after A1_L1", "charge determines whether something is a nucleon", "charge decides whether something is matter"], 0, "The lesson is not anti-charge; it is anti-charge-only.", hint),
    mc("What mistake does A1_L1 mainly prevent?", ["collapsing every subatomic object into one generic category", "thinking protons have no charge", "thinking electrons are larger than nuclei", "thinking photons are always charged"], 0, "The inventory is there to stop that collapse.", hint),
    ...shortCases([
      { prompt: "If two particles share a charge tag, you should still compare their ... and role.", acceptedAnswers: ["family", "particle family"], hint: "Charge is not enough." },
      { prompt: "The photon belongs in the radiation ... slot.", acceptedAnswers: ["messenger", "messengers"], hint: "Use the lesson's role word." },
      { prompt: "Protons and neutrons are grouped together first because they are nucleus ...", acceptedAnswers: ["particles", "bundles", "particles of the nucleus"], hint: "Think of their common role." },
      { prompt: "The safer A1_L1 classification starts with particle ... and role, not charge alone.", acceptedAnswers: ["family", "identity"], hint: "That is the opening discipline." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Use quark packing before using the charge total.";
  return [
    mc("What is the umbrella family that contains baryons and mesons?", ["hadrons", "leptons", "photons", "nucleons only"], 0, "Hadron is the broad quark-built family name.", hint),
    mc("What quark packing defines a baryon?", ["three quarks", "one quark and one antiquark", "two quarks only", "one lepton and one quark"], 0, "Baryons are three-quark hadrons.", hint),
    mc("What quark packing defines a meson?", ["one quark and one antiquark", "three quarks", "two antiquarks only", "one proton and one neutron"], 0, "Mesons are quark-antiquark hadrons.", hint),
    mc("Which bundle is a baryon?", ["uud", "u anti-d", "d anti-u", "electron + positron"], 0, "Three quarks gives the baryon pattern.", hint),
    mc("Which bundle is a meson?", ["u anti-d", "uud", "udd", "proton + neutron"], 0, "A quark-antiquark pair gives the meson pattern.", hint),
    mc("What is the charge of a u quark?", ["+2/3e", "-1/3e", "+1e", "0e"], 0, "The u quark carries positive two-thirds of e.", hint),
    mc("What is the charge of a d quark?", ["-1/3e", "+2/3e", "-1e", "0e"], 0, "The d quark carries negative one-third of e.", hint),
    mc("What is the charge of an anti-d quark?", ["+1/3e", "-1/3e", "+2/3e", "0e"], 0, "Antiquarks reverse the sign of the matching quark charge.", hint),
    mc("What is the net charge of uud?", ["+1e", "0e", "-1e", "+2e"], 0, "Add +2/3e +2/3e -1/3e.", hint),
    mc("What is the net charge of udd?", ["0e", "+1e", "-1e", "+2/3e"], 0, "Add +2/3e -1/3e -1/3e.", hint),
    mc("What is the net charge of u anti-d?", ["+1e", "0e", "-1e", "+4/3e"], 0, "Add +2/3e +1/3e.", hint),
    mc("Why is saying 'it is a hadron' not enough to finish the classification?", ["you still need to decide whether the hadron is a baryon or a meson", "hadron means the particle is neutral", "hadron means the particle is a lepton", "hadron already tells you the exact quark charges"], 0, "Hadron is the umbrella family, not the final subclass.", hint),
    ...shortCases([
      { prompt: "Three quarks means ...", acceptedAnswers: ["baryon", "a baryon"], hint: "Use the hadron subfamily name." },
      { prompt: "A quark-antiquark pair means ...", acceptedAnswers: ["meson", "a meson"], hint: "That is the pair-built hadron." },
      { prompt: "The proton's quark composition is ...", acceptedAnswers: ["uud"], hint: "Two up quarks and one down quark." },
      { prompt: "The neutron's quark composition is ...", acceptedAnswers: ["udd"], hint: "One up quark and two down quarks." },
      { prompt: "The charge of the u quark is ...", acceptedAnswers: ["+2/3e", "+2/3", "2/3e"], hint: "It is positive two thirds of e." },
      { prompt: "The charge of the d quark is ...", acceptedAnswers: ["-1/3e", "-1/3"], hint: "It is negative one third of e." },
      { prompt: "The hadron family splits into baryons and ...", acceptedAnswers: ["mesons", "meson"], hint: "Use the other hadron subclass." },
      { prompt: "An antiquark has the ... charge of its matching quark.", acceptedAnswers: ["opposite"], hint: "That is why anti-d is +1/3e." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Use structure first, then use the charge total as a check.";
  return [
    mc("Why is quark packing safer than charge alone for hadron classification?", ["different hadrons can share the same net charge while still having different structures", "charge never matters in hadrons", "quark packing tells you the interaction family only", "all baryons are neutral"], 0, "Structure distinguishes baryon from meson directly.", hint),
    mc("Why are the proton and the pion+ not the same kind of particle even though both have charge +1e?", ["the proton is a three-quark baryon while the pion+ is a quark-antiquark meson", "positive charge always means baryon", "the pion+ is a lepton", "the proton contains an antiquark pair"], 0, "Charge equality does not erase the packing difference.", hint),
    mc("Why is 'hadron' an umbrella word in this lesson?", ["it includes both baryons and mesons before the final subclass is chosen", "it means only three-quark particles", "it means only nucleus particles", "it means any charged particle"], 0, "The umbrella label comes before the structural split.", hint),
    mc("Why is the proton classified as a baryon rather than just as 'a positively charged hadron'?", ["the decisive rule is that it contains three quarks", "positive charge defines baryons", "all hadrons are baryons", "protons contain no quarks"], 0, "The lesson protects structure over label-only guessing.", hint),
    mc("What mistake does A1_L2 mainly prevent?", ["guessing baryon or meson from charge or size instead of quark packing", "thinking hadrons contain quarks", "thinking quarks have fractional charge", "thinking proton charge is +1e"], 0, "The lesson is about using the safest classifier.", hint),
    mc("Why is a meson not a lepton even though it may carry simple whole-number charge?", ["it is still built from quarks and therefore belongs to the hadron family", "only leptons can have +1e", "mesons are made from photons", "mesons are nucleus particles"], 0, "Family comes from composition, not from integer charge.", hint),
    mc("A bundle has one quark and one antiquark and net charge 0e. Why is 'neutral hadron' too weak as the final answer?", ["you should say it is a meson because the packing rule is the decisive classifier", "neutral charge proves it is a baryon", "zero charge means it is a photon", "the bundle cannot be a hadron"], 0, "The umbrella label is still not the endpoint.", hint),
    mc("Why do antiquark charges matter in these questions?", ["they let you check whether the proposed quark bundle matches the named hadron's net charge", "antiquarks never affect the total", "they matter only for leptons", "they replace the need for quark packing"], 0, "Charge bookkeeping is the second check after structure.", hint),
    mc("Why is the neutron still a baryon even though its net charge is 0e?", ["it contains three quarks, so the structural rule still says baryon", "neutral charge makes it a meson", "zero charge means it is not a hadron", "neutron contains a quark and antiquark"], 0, "Structure outranks charge sign.", hint),
    mc("Why does the lesson use familiar examples such as proton and neutron?", ["they show that common nucleus particles are baryons, not elementary particles", "they prove all baryons are charged", "they show mesons belong in nuclei", "they replace the need for quark charges"], 0, "The examples connect structure to known particles.", hint),
    mc("What should stay visible in a rigorous A1_L2 answer?", ["hadron is the umbrella family, and quark packing distinguishes baryon from meson", "charge sign alone distinguishes baryon from meson", "all hadrons are baryons", "mesons are not quark-built"], 0, "That keeps the lesson's main distinction intact.", hint),
    mc("Why is a quark-charge calculation not enough if you ignore the number of quarks in the bundle?", ["different packings can give plausible charges but still belong to different subfamilies", "charge totals never work for hadrons", "the number of quarks changes nothing", "baryons do not have net charge"], 0, "The packing rule must come first.", hint),
    mc("A student says 'u anti-d has charge +1e, so it must be a proton.' What is the correction?", ["the charge matches, but the structure is meson rather than baryon", "all +1e particles are protons", "u anti-d is a lepton", "protons are quark-antiquark pairs"], 0, "Matching charge does not guarantee matching identity.", hint),
    mc("Why is the quark model helpful before reaction analysis later in A1?", ["it gives a structural identity rule for hadrons before conservation and interaction clues are added", "it replaces all later particle rules", "it works only for photons", "it proves baryon number is unnecessary"], 0, "The module builds layer by layer.", hint),
    mc("Which sentence best matches A1_L2 rigor?", ["Use hadron as the broad family, then classify baryon versus meson by quark packing and finally check the charge bookkeeping", "Use charge only because baryons and mesons always differ in sign", "Ignore antiquarks because only quarks matter", "Hadron and baryon always mean the same thing"], 0, "That preserves the intended reasoning order.", hint),
    mc("Why is 'the particle is small, so it is a meson' not acceptable?", ["size is not the classification rule taught here; quark packing is", "mesons are always physically smaller than baryons", "size determines quark charges", "mesons are not hadrons"], 0, "The lesson rejects size-only guessing.", hint),
    ...shortCases([
      { prompt: "To finish a hadron classification, ask whether the pack is baryon or ...", acceptedAnswers: ["meson"], hint: "Use the other hadron subclass." },
      { prompt: "The safest classifier in A1_L2 is quark ...", acceptedAnswers: ["packing", "composition"], hint: "That is the structure rule." },
      { prompt: "A proton and a pion+ can share charge, but they differ in ...", acceptedAnswers: ["structure", "quark packing", "composition"], hint: "That is the key distinction." },
      { prompt: "Charge bookkeeping is the ... check after the structure rule.", acceptedAnswers: ["second", "next"], hint: "First structure, then charge." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Check both the energy threshold and the conservation ledger.";
  return [
    mc("What is the antiparticle partner of the electron?", ["positron", "proton", "neutron", "photon"], 0, "The positron has the same mass and opposite charge.", hint),
    mc("What pair process converts a photon into an electron and a positron when enough energy is available?", ["pair production", "annihilation", "alpha scattering", "beta decay"], 0, "This is the forward matter-creation case.", hint),
    mc("What pair process converts an electron and a positron into radiation?", ["annihilation", "pair production", "fusion", "ionisation"], 0, "This is the reverse pair process.", hint),
    mc("Which relation gives photon energy from frequency?", ["E = h f", "q = n e", "V = I R", "F = m a"], 0, "Photon energy is proportional to frequency.", hint),
    mc("Which relation gives photon energy from wavelength?", ["E = h c / lambda", "E = q V", "p = m v", "d = 1 / p"], 0, "Shorter wavelength means larger photon energy.", hint),
    mc("What is the minimum total photon energy needed to create an electron-positron pair?", ["1.022 MeV", "0.511 MeV", "2.044 MeV", "0.255 MeV"], 0, "You need the rest energy of both members.", hint),
    mc("Why can a long-wavelength photon fail to produce an electron-positron pair?", ["its energy is below the threshold needed for both rest masses", "long wavelength means positive charge", "pair production does not conserve charge", "photons cannot interact with matter"], 0, "Threshold is an energy gate.", hint),
    mc("When an electron and a positron annihilate from rest, what total photon energy must appear?", ["1.022 MeV", "0.511 MeV", "0 MeV", "2.0 MeV exactly"], 0, "The outgoing radiation must match the combined rest energy.", hint),
    mc("What key charge check holds for electron-positron pair production?", ["the total charge before and after remains zero", "the final state must have charge +1e", "the photon must carry -1e", "charge conservation is optional if threshold is met"], 0, "The photon starts neutral and the pair must sum to zero.", hint),
    mc("Which statement about antiparticles is correct?", ["they have the same mass as the matching particle and opposite charge where relevant", "they are always massless", "they always have positive charge", "they are just excited states of the particle"], 0, "That is the mirror-partner rule.", hint),
    mc("If photon frequency doubles, what happens to photon energy?", ["it doubles", "it halves", "it quadruples", "it stays the same"], 0, "E is directly proportional to f.", hint),
    mc("Which change increases photon energy?", ["decreasing wavelength", "decreasing frequency", "increasing wavelength", "lowering Planck's constant"], 0, "Use E = h c / lambda.", hint),
    ...shortCases([
      { prompt: "The electron's antiparticle is the ...", acceptedAnswers: ["positron"], hint: "It has charge +1e." },
      { prompt: "Pair production needs enough photon ...", acceptedAnswers: ["energy"], hint: "That is the threshold gate." },
      { prompt: "Annihilation of an electron and positron produces ...", acceptedAnswers: ["photons", "radiation"], hint: "The pair becomes allowed radiation products." },
      { prompt: "The rest energy of one electron is about 0.511 ...", acceptedAnswers: ["MeV"], hint: "Use the common particle-physics unit." },
      { prompt: "The threshold total energy for an electron-positron pair is 1.022 ...", acceptedAnswers: ["MeV"], hint: "That is twice 0.511 MeV." },
      { prompt: "Shorter wavelength means ... photon energy.", acceptedAnswers: ["higher", "more", "greater"], hint: "Energy is inversely proportional to wavelength." },
      { prompt: "A particle and antiparticle have opposite ... where relevant.", acceptedAnswers: ["charge"], hint: "That is the simplest mirror-partner clue." },
      { prompt: "Pair production must still conserve ...", acceptedAnswers: ["charge", "energy", "both charge and energy"], hint: "Do not ignore the ledger just because a threshold is mentioned." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Read pair production as a balanced event, not as free creation.";
  return [
    mc("Why is it weak to say pair production is just 'matter appearing from nowhere'?", ["the photon must provide enough energy and the before-and-after ledger still has to balance", "matter can appear without any condition", "pair production does not involve photons", "charge conservation stops applying"], 0, "Threshold plus conservation is the real story.", hint),
    mc("Why is annihilation not a 'vanishing trick'?", ["the particle pair's mass-energy reappears in allowed radiation products", "the energy disappears permanently", "the charge rule no longer matters", "the particles become neutrons"], 0, "Annihilation is a matter-radiation exchange.", hint),
    mc("Why must the created pair in the simplest pair-production example be electron and positron rather than electron and electron?", ["the total charge must stay zero because the incoming photon is neutral", "two electrons have too much mass", "positrons are lighter than electrons", "electrons cannot be created"], 0, "Charge conservation blocks the wrong pair.", hint),
    mc("Why does a shorter threshold wavelength correspond to a more difficult pair-production requirement?", ["shorter wavelength means the photon must be more energetic, so below-threshold longer wavelengths are excluded", "short wavelength means lower energy", "wavelength has nothing to do with energy", "threshold depends only on charge"], 0, "The wavelength form of the threshold is just the energy condition rewritten.", hint),
    mc("Why is 0.511 MeV not enough for photon pair production into electron and positron?", ["that is only one electron rest energy, but the pair needs two rest energies", "0.511 MeV is above the threshold", "because photons cannot carry MeV energy", "because conservation requires positive charge"], 0, "You need the energy for both members.", hint),
    mc("What is the strongest reason that electron + positron -> photon is usually written with at least two photons?", ["the outgoing radiation must conserve energy and momentum together", "because one photon always carries charge", "because annihilation destroys energy", "because electrons always split into neutrons"], 0, "A rigorous annihilation story checks more than charge.", hint),
    mc("Why does increasing photon frequency help pair production?", ["higher frequency raises E = h f, making it easier to reach the rest-energy threshold", "higher frequency lowers photon energy", "frequency affects charge but not energy", "pair production depends only on distance"], 0, "Frequency and energy rise together.", hint),
    mc("Why should threshold energy be mentioned before any dramatic description of pair production?", ["without enough photon energy, the event is blocked before the final state is even considered", "threshold is less important than naming the pair", "threshold replaces conservation laws", "below-threshold photons always produce protons"], 0, "The energy gate is the first filter.", hint),
    mc("Why is 'same mass, opposite charge' a useful but incomplete description of antiparticles?", ["pair and annihilation questions also need the conservation ledger and the event context", "mass and charge never matter", "all antiparticles are photons", "antiparticles are defined only by color"], 0, "The partner rule helps, but the full event still needs checking.", hint),
    mc("Why is the positron not just a proton with positive charge?", ["it matches the electron's mass and lepton identity rather than the proton's baryon identity", "all positive particles are protons", "positrons contain quarks", "protons are leptons"], 0, "A1 keeps family identity visible.", hint),
    mc("Why does the lesson connect pair production and annihilation in one story?", ["they are reverse processes linked by the same mass-energy and conservation rules", "they involve unrelated particles", "one obeys conservation and the other does not", "one is strong and the other is weak only"], 0, "The unit wants the reversible ledger visible.", hint),
    mc("What should stay visible in a rigorous A1_L3 answer?", ["photon energy threshold, mirror-partner matching, and conservation checks all matter", "threshold is optional if the pair looks familiar", "any particle and antiparticle always produce matter", "charge is the only rule worth checking"], 0, "That keeps the lesson from turning into slogan memory.", hint),
    mc("Why can annihilation still be discussed using the same 1.022 MeV total as pair production?", ["the reverse process returns the combined rest energy of the matched pair", "because the particles gain extra charge", "because the threshold is unrelated to mass-energy", "because photons always lose energy"], 0, "The same mass-energy ledger runs in both directions.", hint),
    mc("Why is it not enough to say 'a photon created two particles' when checking an answer?", ["you must also say whether the pair is an allowed particle-antiparticle pair and whether the energy threshold is cleared", "because photons never create particles", "because only charge matters", "because the pair must always be two protons"], 0, "The lesson wants a full criterion, not a dramatic phrase.", hint),
    mc("Which sentence best matches A1_L3 rigor?", ["Pair production and annihilation are balanced matter-radiation exchanges controlled by threshold energy and conservation laws", "Pair production is free creation once a photon arrives", "Annihilation means matter disappears without trace", "Antiparticles matter only because they have opposite charge"], 0, "That sentence captures the causal logic.", hint),
    mc("Why is photon wavelength often a stronger exam clue than color words here?", ["wavelength lets you calculate or compare photon energy quantitatively", "color words directly give rest mass", "wavelength decides baryon number", "pair production depends only on whether the photon looks blue"], 0, "Numerical wavelength information connects directly to energy.", hint),
    ...shortCases([
      { prompt: "In pair production, the incoming photon must clear the energy ...", acceptedAnswers: ["threshold"], hint: "That is the first gate." },
      { prompt: "Annihilation is strongest read as a matter-radiation ...", acceptedAnswers: ["exchange"], hint: "Do not say disappearance." },
      { prompt: "The simplest allowed created pair is electron plus ...", acceptedAnswers: ["positron"], hint: "Use the mirror partner." },
      { prompt: "A rigorous pair-process answer checks threshold and ...", acceptedAnswers: ["conservation", "the conservation ledger"], hint: "That is the other half of the story." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Ask what the event is doing before naming the interaction.";
  return [
    mc("Which interaction binds quarks inside hadrons?", ["strong interaction", "weak interaction", "electromagnetic interaction only", "gravitational interaction"], 0, "The strong interaction is the binding story.", hint),
    mc("Which interaction is associated with beta-decay-style particle changes?", ["weak interaction", "strong interaction", "gravitational interaction", "nuclear binding only"], 0, "Particle-change events point to the weak interaction.", hint),
    mc("Which messenger particle is associated with the electromagnetic interaction?", ["photon", "gluon", "W boson", "neutron"], 0, "The photon is the electromagnetic exchange particle.", hint),
    mc("Which messenger particle is associated with the strong interaction in the quark model?", ["gluon", "photon", "W boson", "electron"], 0, "Gluons are the strong-interaction messengers.", hint),
    mc("Which messenger particle is associated with weak charged-current processes in this lesson?", ["W boson", "gluon", "photon", "proton"], 0, "The W boson is the weak-interaction clue here.", hint),
    mc("A neutron changes into a proton, an electron, and an antineutrino. Which interaction best fits?", ["weak interaction", "strong interaction", "electromagnetic interaction", "no interaction"], 0, "This is a particle-change event.", hint),
    mc("Quarks staying bound in a hadron point most directly to which interaction?", ["strong interaction", "weak interaction", "electromagnetic interaction", "none"], 0, "Binding is the key clue.", hint),
    mc("A charged particle deflects in an electric field without changing identity. Which interaction is being highlighted?", ["electromagnetic interaction", "weak interaction", "strong interaction", "nuclear decay only"], 0, "No particle-change clue here; it is an electromagnetic force story.", hint),
    mc("What is an exchange particle?", ["the messenger that carries an interaction between particles", "a particle that swaps its mass with another", "any unstable particle", "the heaviest particle in a reaction"], 0, "The lesson uses messenger language to organize interactions.", hint),
    mc("Which statement about strong interaction is correct?", ["it helps bind quarks and also contributes to nuclear binding", "it changes neutrons into electrons", "it is carried by photons", "it acts only on light"], 0, "The strong interaction is a binding interaction.", hint),
    mc("Which statement about weak interaction is correct?", ["it is associated with particle-change processes such as beta decay", "it is the main quark-binding force inside hadrons", "it uses photons as its exchange particles in this lesson", "it changes nothing about particle identity"], 0, "Weak interaction language is event-change language.", hint),
    mc("Why is messenger language useful in A1_L4?", ["it helps distinguish interaction families by how the event is carried", "it replaces the need for all event clues", "it proves all forces are identical", "it classifies particles by size"], 0, "The messenger ties the event to the interaction family.", hint),
    ...shortCases([
      { prompt: "The strong interaction is mainly the ... story.", acceptedAnswers: ["binding"], hint: "What does it do inside hadrons and nuclei?" },
      { prompt: "The weak interaction is mainly the particle-... story.", acceptedAnswers: ["change", "changing"], hint: "Think beta decay." },
      { prompt: "The electromagnetic messenger particle is the ...", acceptedAnswers: ["photon"], hint: "It also appears in radiation questions." },
      { prompt: "The strong-interaction messenger particle is the ...", acceptedAnswers: ["gluon"], hint: "It carries the strong interaction between quarks." },
      { prompt: "The weak-interaction charged messenger in this lesson is the ... boson.", acceptedAnswers: ["w", "W"], hint: "Use the single-letter boson name." },
      { prompt: "An interaction question should start by asking what the event ...", acceptedAnswers: ["does", "is doing"], hint: "Binding or changing?" },
      { prompt: "Beta decay gives a ... interaction clue.", acceptedAnswers: ["weak"], hint: "Use the particle-change family." },
      { prompt: "Exchange particles act as interaction ...", acceptedAnswers: ["messengers", "messenger"], hint: "That is the lesson word." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Use the event clue first, then match the interaction and messenger.";
  return [
    mc("Why is it weak to memorize 'strong = nucleus' without asking what the event does?", ["because the real clue is binding behavior, not just one label word", "because strong interaction never acts in nuclei", "because all interactions bind equally", "because nucleus always means weak"], 0, "The lesson wants causal classification, not slogan recall.", hint),
    mc("Why does a neutron-to-proton change point to the weak interaction rather than the strong interaction?", ["particle identity changes, which is the weak-event clue", "all neutral particles use the weak interaction", "strong interaction changes leptons", "weak interaction is the only force with energy"], 0, "Weak interaction is the change story.", hint),
    mc("Why is 'there is a hadron in the event, so it must be strong' too weak?", ["the interaction family depends on what is happening, not just on one particle being present", "hadrons never appear in weak events", "hadron means photon exchange", "hadron automatically means scattering"], 0, "The event type matters more than one object label.", hint),
    mc("Why does messenger language improve an interaction explanation?", ["it ties the visible event pattern to the mechanism carrying the interaction", "it removes the need for particle identity", "it replaces all conservation checks", "it shows every interaction uses the same messenger"], 0, "Messenger choice supports the family classification.", hint),
    mc("Why is electromagnetic interaction a helpful contrast in A1_L4?", ["it shows that not every non-contact particle effect is strong or weak", "it proves all messenger particles are gluons", "it means photons are hadrons", "it removes the need for exchange particles"], 0, "The contrast sharpens the strong-versus-weak distinction.", hint),
    mc("A student says 'W boson' from memory but cannot explain the event clue. Why is that not strong enough?", ["the messenger name should be supported by the particle-change pattern in the event", "messenger names never matter", "W bosons carry the strong interaction", "the event clue is irrelevant"], 0, "Cause-and-effect language matters more than a memorized label.", hint),
    mc("Why is binding inside a hadron a stronger strong-interaction clue than simply saying 'nuclear'?", ["it describes what the interaction is physically doing", "because the word nuclear always means weak", "because binding does not involve quarks", "because strong interaction ignores hadrons"], 0, "The unit wants action words, not vague tags.", hint),
    mc("Why is beta decay a strong weak-interaction example?", ["the event changes one particle type into another and introduces leptons in the final state", "it keeps all particles identical", "it is only an electromagnetic event", "it contains no conservation rules"], 0, "The change pattern is decisive.", hint),
    mc("Why should you not classify an event by messenger name alone if the event clue disagrees?", ["the event pattern and the messenger clue should support the same interaction story", "messenger names always outrank the event", "event clues are optional", "interaction family never needs justification"], 0, "The explanation should cohere.", hint),
    mc("What mistake does A1_L4 mainly prevent?", ["mixing up binding stories with particle-change stories", "thinking all interactions use the same messenger", "thinking photons carry no interaction", "thinking charge conservation matters"], 0, "That is the core distinction.", hint),
    mc("Why is 'weak means weak force' a poor explanation here?", ["the lesson is about what the interaction changes, not about vague everyday language", "weak interaction is actually the strongest", "the weak interaction has no messenger", "force size alone classifies the event"], 0, "The unit needs the correct physical cue.", hint),
    mc("Why is 'gluon' a stronger answer when paired with quark binding than when stated alone?", ["the quark-binding clue shows why the strong-interaction messenger belongs there", "gluons can explain beta decay better than W bosons", "messengers should never be justified", "gluon means any charged interaction"], 0, "Name plus reason is stronger than name alone.", hint),
    mc("What should stay visible in a rigorous A1_L4 answer?", ["interaction family is chosen from the event clue and supported by the exchange messenger", "only the messenger name matters", "strong and weak are decided by particle charge only", "binding and changing mean the same thing"], 0, "That is the lesson's causal structure.", hint),
    mc("Why is a binding example not automatically electromagnetic just because charged particles are present?", ["binding of quarks or nucleons is a strong-interaction clue in this module", "charged particles always rule out strong interaction", "electromagnetic interaction binds quarks most strongly", "weak interaction never changes particles"], 0, "Presence of charge alone is not the classifier.", hint),
    mc("Which sentence best matches A1_L4 rigor?", ["Use what the event does to distinguish interaction families, then support that choice with the exchange messenger", "Memorize one messenger name and ignore the event", "Any event with hadrons is automatically strong", "Any event with leptons is automatically electromagnetic"], 0, "That keeps the lesson analytical rather than slogan-based.", hint),
    mc("Why is a force-family question easier once you ask 'binding or changing?'", ["because that separates the strong-interaction story from the weak-interaction story quickly", "because the answer is always electromagnetic", "because every interaction changes charge only", "because messenger particles stop mattering"], 0, "This is the decision rule the lesson teaches.", hint),
    ...shortCases([
      { prompt: "A strong A1_L4 answer starts with what the event ...", acceptedAnswers: ["does", "is doing"], hint: "Binding or changing?" },
      { prompt: "Weak interaction is strongly associated with particle ...", acceptedAnswers: ["change", "changing"], hint: "That is the event clue." },
      { prompt: "Strong interaction is the main ... clue inside hadrons.", acceptedAnswers: ["binding"], hint: "Think quarks held together." },
      { prompt: "Messenger name plus event clue gives a stronger interaction ...", acceptedAnswers: ["classification", "answer"], hint: "Do not rely on memory alone." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Check charge, baryon number, and lepton number together.";
  return [
    mc("Which conserved quantity tracks proton and neutron count in particle reactions?", ["baryon number", "frequency", "wavelength", "atomic number"], 0, "Baryon number tracks baryons through the event.", hint),
    mc("Which conserved quantity tracks leptons such as electrons and neutrinos?", ["lepton number", "baryon number", "mass number", "field strength"], 0, "Lepton number is the lepton bookkeeping tag.", hint),
    mc("What baryon number is assigned to a proton?", ["+1", "0", "-1", "+2"], 0, "Ordinary baryons carry +1 baryon number.", hint),
    mc("What baryon number is assigned to a meson?", ["0", "+1", "-1", "+2"], 0, "Mesons are not baryons, so they carry zero baryon number.", hint),
    mc("What lepton number is assigned to an electron?", ["+1", "0", "-1", "+2"], 0, "The electron is a lepton.", hint),
    mc("What lepton number is assigned to a positron?", ["-1", "+1", "0", "+2"], 0, "Antileptons carry the opposite lepton number.", hint),
    mc("What lepton number is assigned to an electron antineutrino?", ["-1", "+1", "0", "+2"], 0, "It is the electron-family antilepton partner.", hint),
    mc("A student writes neutron -> proton + electron. Which conserved quantity clearly fails?", ["lepton number", "charge", "baryon number", "all three fail"], 0, "The missing antineutrino is needed to repair the lepton ledger.", hint),
    mc("Which completed equation is the allowed neutron beta-decay channel?", ["n -> p + e- + antineutrino", "n -> p + e-", "n -> p + positron + neutrino", "n -> p + photon"], 0, "That is the standard conservation-balanced beta-decay form.", hint),
    mc("Why is charge alone not enough when screening a particle event?", ["an event can balance charge but still violate baryon number or lepton number", "charge is never conserved", "charge decides baryon number automatically", "baryon number matters only for atoms"], 0, "A1_L5 is about running all three ledgers.", hint),
    mc("Which reaction is allowed by charge, baryon number, and lepton number?", ["n -> p + e- + antineutrino", "p -> e+ + gamma", "e- -> gamma + gamma", "p + e- -> gamma"], 0, "The others break baryon or lepton bookkeeping.", hint),
    mc("What is the quickest first filter for a proposed particle event in this lesson?", ["run the conservation ledgers", "guess from the most dramatic particle", "ignore neutrinos first", "check only whether a photon appears"], 0, "Conservation is the first filter, not the last repair step.", hint),
    ...shortCases([
      { prompt: "The proton has baryon number ...", acceptedAnswers: ["+1", "1"], hint: "Ordinary baryons carry positive one." },
      { prompt: "The antiproton has baryon number ...", acceptedAnswers: ["-1"], hint: "Antibaryons reverse the sign." },
      { prompt: "The electron has lepton number ...", acceptedAnswers: ["+1", "1"], hint: "It is a lepton." },
      { prompt: "The positron has lepton number ...", acceptedAnswers: ["-1"], hint: "It is the electron's antilepton partner." },
      { prompt: "A meson has baryon number ...", acceptedAnswers: ["0", "zero"], hint: "Mesons are not baryons." },
      { prompt: "An allowed event must conserve charge, baryon number, and ... number.", acceptedAnswers: ["lepton"], hint: "That is the third ledger." },
      { prompt: "To complete neutron beta decay, include an electron anti...", acceptedAnswers: ["neutrino", "antineutrino"], hint: "That fixes the lepton ledger." },
      { prompt: "If any one conservation ledger fails, the event should be ...", acceptedAnswers: ["rejected", "reject", "ruled out"], hint: "Do not keep a broken reaction." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Treat conservation as a full bookkeeping test, not a slogan.";
  return [
    mc("Why is it weak to accept a particle reaction just because charge balances?", ["baryon number and lepton number can still fail even when charge is correct", "charge is never conserved", "charge decides the other ledgers automatically", "baryon number matters only for nuclei"], 0, "A1_L5 requires all three ledgers.", hint),
    mc("Why is the electron antineutrino needed in neutron beta decay?", ["it restores the lepton-number balance while keeping charge and baryon number correct", "it carries all the baryon number", "it makes the proton neutral", "it changes the interaction from weak to strong"], 0, "The missing lepton ledger is the main clue.", hint),
    mc("Why is 'looks plausible' not enough for a reaction answer in A1_L5?", ["a plausible product list can still violate a conservation ledger", "plausible-looking reactions are always allowed", "conservation applies only to annihilation", "bookkeeping is optional if the event is weak"], 0, "The lesson is about rejecting attractive but impossible stories.", hint),
    mc("Why does baryon number stop a proton from simply decaying into positrons and photons in ordinary school-level examples?", ["the final state would have zero baryon number instead of +1", "positrons carry baryon number +1", "photons carry hidden baryon number", "charge conservation would always fix it"], 0, "Baryon-number failure rules the event out.", hint),
    mc("Why can an event conserve charge but still fail lepton number?", ["because charge and lepton number are different bookkeeping quantities", "because lepton number is just another name for charge", "because only charged leptons count", "because photons change lepton number"], 0, "Separate the ledgers conceptually.", hint),
    mc("Why is neutrino language common in conservation questions?", ["neutrinos or antineutrinos often repair the lepton-number ledger in weak events", "neutrinos carry all electric charge", "neutrinos are baryons", "neutrinos replace the need for charge conservation"], 0, "They are often the missing invisible bookkeepers.", hint),
    mc("What mistake does A1_L5 mainly prevent?", ["passing a reaction after checking only one conserved quantity", "thinking charge is conserved", "thinking baryons exist", "thinking neutrinos are leptons"], 0, "The lesson enforces multi-ledger checking.", hint),
    mc("Why is the neutron -> proton + electron channel incomplete even though charge looks balanced?", ["the final state has lepton number +1, so an antineutrino is needed to bring the total back to zero", "the proton has the wrong baryon number", "the electron has no lepton number", "charge is actually not balanced"], 0, "This is the classic A1_L5 example.", hint),
    mc("Why are baryon number and lepton number called bookkeeping tags in the lesson?", ["they track whether a proposed event is allowed even when the particles look superficially reasonable", "they directly measure the force strength", "they replace mass and energy", "they tell you the particle color"], 0, "They are screening tools for allowed channels.", hint),
    mc("Why should conservation be the first filter, not the last check?", ["it quickly rejects impossible channels before you spend time on a false story", "it is useful only after you guess the answer", "it matters only in advanced university physics", "it works only for annihilation"], 0, "This is the method habit the lesson wants.", hint),
    mc("What should stay visible in a rigorous A1_L5 answer?", ["charge, baryon number, and lepton number must all be balanced before the event is accepted", "charge alone is enough if the products are familiar", "baryon number matters only when protons appear", "lepton number matters only for photons"], 0, "That is the complete ledger rule.", hint),
    mc("Why is an antiproton assigned baryon number -1 instead of +1?", ["antiparticles reverse the relevant bookkeeping sign of their particle partner", "because antiprotons are leptons", "because baryon number depends on charge sign only", "because antiprotons do not count in reactions"], 0, "Antibaryons reverse the baryon-number sign.", hint),
    mc("Why is a meson given baryon number 0?", ["it is a hadron, but not a baryon", "all neutral particles have zero baryon number", "mesons are leptons", "mesons have no quarks"], 0, "Meson versus baryon still matters in the ledger.", hint),
    mc("Why is 'weak event' not enough to justify a channel unless the ledgers balance?", ["interaction family does not override conservation laws", "weak interaction breaks charge conservation", "weak interaction ignores leptons", "bookkeeping matters only for strong events"], 0, "No interaction family gets to ignore the ledger.", hint),
    mc("Which sentence best matches A1_L5 rigor?", ["Accept a particle event only after charge, baryon number, and lepton number all balance, even if one ledger already looks correct", "Accept the event once charge works", "Baryon number and lepton number are optional refinements", "Only beta decay needs bookkeeping"], 0, "That sentence captures the lesson standard.", hint),
    mc("Why can a neutrino or antineutrino matter even though it is electrically neutral?", ["it still carries lepton number and therefore affects whether the event is allowed", "neutral particles never affect any ledger", "neutrinos are baryons", "neutral particles are ignored in conservation"], 0, "Charge neutrality does not remove lepton bookkeeping.", hint),
    ...shortCases([
      { prompt: "A reaction can pass charge and still fail ... number.", acceptedAnswers: ["baryon", "lepton", "baryon or lepton"], hint: "There is more than one ledger." },
      { prompt: "The missing particle in neutron beta decay repairs the ... ledger.", acceptedAnswers: ["lepton", "lepton number"], hint: "That is why the antineutrino appears." },
      { prompt: "Conservation is the first ... for event screening.", acceptedAnswers: ["filter"], hint: "Use the lesson phrase." },
      { prompt: "In A1_L5, an allowed event must balance all ... ledgers, not just one.", acceptedAnswers: ["three", "3"], hint: "Charge, baryon number, lepton number." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Combine particle identity, interaction clue, and conservation before naming the event.";
  return [
    mc("Which event is the standard weak-decay example used in A1?", ["n -> p + e- + antineutrino", "gamma -> p + p", "e- + e- -> gamma + gamma", "p -> n + photon"], 0, "This is the lesson's model weak decay.", hint),
    mc("Which event is the simplest annihilation example?", ["e- + e+ -> photons", "p + n -> photon", "gamma -> e- only", "u + d -> proton"], 0, "A matched particle-antiparticle pair can annihilate into radiation.", hint),
    mc("Which clue points most directly to a weak interaction in a full event analysis?", ["one particle changes identity and leptons appear", "two quarks stay bound", "a photon carries electromagnetic radiation", "the final state looks large"], 0, "Particle change is the weak clue.", hint),
    mc("Which event family label best fits an isolated neutron turning into three outgoing products?", ["decay", "scattering", "orbit", "diffraction"], 0, "One incoming unstable particle becoming products is decay language.", hint),
    mc("Which event family label best fits two incoming particles meeting and producing outgoing radiation?", ["annihilation interaction", "free-fall orbit", "standing wave", "refraction"], 0, "Two incoming matched partners becoming radiation is annihilation.", hint),
    mc("What should you do first when two event interpretations seem plausible?", ["compare the particle list, interaction clue, and conservation ledger", "choose the one with the most dramatic product", "pick the one with the largest charge", "ignore any invisible particles"], 0, "A1_L6 teaches a multi-clue comparison.", hint),
    mc("Why is a neutrino still important in a final event analysis even if it is hard to detect?", ["it can be required by the conservation ledger", "it changes baryons into mesons", "it always carries charge", "it replaces the interaction clue"], 0, "Invisible does not mean irrelevant.", hint),
    mc("Which proposed pair-production channel is simplest and allowed if threshold is met?", ["gamma -> e- + e+", "gamma -> e- + e-", "gamma -> proton only", "gamma -> neutron only"], 0, "The produced pair must be a particle-antiparticle pair.", hint),
    mc("Which statement about decay and scattering is correct?", ["they are different event families, but both still obey conservation rules", "scattering ignores conservation", "decay is always strong interaction", "scattering means one particle at rest"], 0, "A1_L6 keeps event-family language organized.", hint),
    mc("Why is 'I see an electron, so it is weak interaction' too weak as a final answer?", ["you still need the full particle list and the conservation check", "electrons never appear outside weak events", "any electron means baryon number is irrelevant", "electrons automatically prove decay"], 0, "One product alone is not enough.", hint),
    mc("What is the safest summary of A1_L6 method?", ["use several clues together before committing to one event label", "use the most surprising particle only", "use charge only because it is the fastest", "guess the interaction before checking products"], 0, "This is the lesson's meta-skill.", hint),
    mc("Which event is blocked because it fails the charge ledger immediately?", ["gamma -> e- only", "gamma -> e- + e+", "n -> p + e- + antineutrino", "e- + e+ -> photons"], 0, "A neutral photon cannot become a single charged particle by itself.", hint),
    ...shortCases([
      { prompt: "A full event analysis should use more than one ...", acceptedAnswers: ["clue", "clues"], hint: "Do not rely on one product alone." },
      { prompt: "An isolated unstable particle turning into products is a ...", acceptedAnswers: ["decay"], hint: "That is the event family name." },
      { prompt: "A matched particle-antiparticle pair becoming radiation is ...", acceptedAnswers: ["annihilation"], hint: "Use the pair-process term." },
      { prompt: "The event n -> p + e- + antineutrino is a weak ...", acceptedAnswers: ["decay"], hint: "It is a one-particle-to-products event." },
      { prompt: "Before accepting an interpretation, compare the conservation ...", acceptedAnswers: ["ledger", "ledgers"], hint: "That is the bookkeeping frame." },
      { prompt: "A neutrino belongs to the ... family.", acceptedAnswers: ["lepton", "leptons", "lepton family"], hint: "It is not a hadron." },
      { prompt: "A proton is both a nucleon and a ...", acceptedAnswers: ["baryon"], hint: "Use the hadron subfamily name." },
      { prompt: "An allowed pair-production channel must create a particle and its anti...", acceptedAnswers: ["particle", "partner"], hint: "That is the mirror-partner rule." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Build the explanation from several agreeing clues.";
  return [
    mc("Why is one striking product not enough to identify a particle event strongly?", ["the same product can appear in different event stories unless the full particle list and ledger are checked", "one product always tells the full interaction", "conservation laws do not apply once a lepton appears", "interaction type depends only on charge sign"], 0, "A1_L6 is about avoiding single-clue guessing.", hint),
    mc("Why should event-family language such as decay, scattering, or annihilation come before final interpretation?", ["it organizes the structure of what is happening before you assign the interaction and ledger story", "event-family labels replace conservation", "event-family labels are only for diagrams", "interaction type always comes first with no event clue"], 0, "The family label is part of the reasoning scaffold.", hint),
    mc("Why is n -> p + e- + antineutrino a stronger weak-interaction example than just saying 'a neutron changed'?", ["the full product list also balances charge, baryon number, and lepton number", "because weak interaction never needs evidence", "because the neutron and proton have the same charge", "because the antineutrino is a baryon"], 0, "The strength comes from several aligned clues.", hint),
    mc("Why is gamma -> e- + e+ stronger than just saying 'the photon made matter'?", ["the pair is a matched particle-antiparticle pair and the threshold plus ledger can be checked", "because all created matter is automatically allowed", "because photons always produce baryons first", "because charge conservation does not matter for photons"], 0, "The complete event story is more rigorous.", hint),
    mc("Why does a broken conservation ledger overrule an attractive-looking interpretation?", ["an event that violates a conservation law is not allowed, even if one clue looks persuasive", "the ledger matters only in weak events", "the most dramatic product should still decide", "conservation can be ignored once threshold is met"], 0, "This is the final screening habit the module wants.", hint),
    mc("Why is a neutrino often the deciding clue in a final event analysis?", ["it can repair lepton balance and complete an otherwise impossible weak event", "it supplies baryon number +1", "it identifies a strong interaction directly", "it proves the event is electromagnetic"], 0, "It is often the hidden bookkeeping partner.", hint),
    mc("Why should particle family still be checked even after you think you know the interaction?", ["family identity can confirm or challenge whether the proposed event channel is plausible", "family becomes irrelevant once the interaction is guessed", "only charge matters after that", "family applies only to hadrons"], 0, "A1_L6 combines several layers deliberately.", hint),
    mc("A student chooses the event with the biggest energy release as the answer without checking the channel. Why is that weak?", ["energy drama does not replace particle identity, event family, and conservation analysis", "the largest-energy channel is always correct", "interaction type depends only on energy", "conservation becomes optional for high energy"], 0, "The module rejects spectacle-only reasoning.", hint),
    mc("Why are decay and annihilation not interchangeable labels?", ["they describe different before-and-after particle layouts even though both still obey conservation", "they are just two words for the same event", "decay needs two incoming particles", "annihilation needs one incoming unstable particle"], 0, "Event-family structure matters.", hint),
    mc("Why is 'looks like beta decay' not enough until the products are checked carefully?", ["the correct leptons and conservation balances must also appear in the final state", "beta decay ignores baryon number", "weak events never need neutrinos", "product lists can be guessed from charge alone"], 0, "Pattern recognition needs ledger confirmation.", hint),
    mc("Why is pair production stronger when stated with threshold language?", ["the threshold explains why some proposed photon cases are allowed and others are blocked", "threshold language is optional decoration", "threshold affects only baryon number", "all photons can create pairs"], 0, "Cause-and-effect language matters.", hint),
    mc("What mistake does A1_L6 mainly prevent?", ["jumping from one clue to one label without checking the rest of the event", "thinking decay exists", "thinking protons are baryons", "thinking conservation matters"], 0, "It is the capstone anti-guessing lesson.", hint),
    mc("What should stay visible in a rigorous A1_L6 answer?", ["particle identity, event-family clue, interaction clue, and the conservation ledger should support the same interpretation", "only the interaction clue matters", "only the products matter", "the ledger alone gives the whole answer"], 0, "This is the capstone multi-clue method.", hint),
    mc("Why is a reaction channel comparison useful before committing to one answer?", ["it helps you reject near-miss channels that fail one key clue or ledger", "all channels with the same first product are equivalent", "conservation is unnecessary if there are multiple channels", "interaction family does not affect channel choice"], 0, "Alternative channels are part of the analysis habit.", hint),
    mc("Which sentence best matches A1_L6 rigor?", ["A good particle-event interpretation is the one for which particle family, event type, interaction clue, and conservation checks all agree", "Choose the channel with the most familiar particle", "If charge works, the event is done", "If the interaction is weak, ignore the rest"], 0, "That sentence captures the lesson's standard of proof.", hint),
    mc("Why does the final A1 lesson feel harder than the earlier ones by design?", ["it expects several earlier ideas to be combined into one justified event interpretation", "because it introduces completely unrelated content", "because conservation laws stop applying", "because there is no longer any particle classification"], 0, "It is the synthetic capstone of the module.", hint),
    ...shortCases([
      { prompt: "The safest capstone answer uses several agreeing ...", acceptedAnswers: ["clues"], hint: "Do not rely on one hint only." },
      { prompt: "A strong final interpretation must make particle family and conservation ...", acceptedAnswers: ["agree", "match"], hint: "The evidence layers should cohere." },
      { prompt: "A near-miss channel should be rejected if one key ledger ...", acceptedAnswers: ["fails", "breaks"], hint: "One broken conservation law is enough." },
      { prompt: "A1_L6 is the module's event-analysis ...", acceptedAnswers: ["capstone", "summary"], hint: "It brings the earlier ideas together." },
    ]),
  ];
}

const A1_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A1_L1: l1DiagnosticRaw,
  A1_L2: l2DiagnosticRaw,
  A1_L3: l3DiagnosticRaw,
  A1_L4: l4DiagnosticRaw,
  A1_L5: l5DiagnosticRaw,
  A1_L6: l6DiagnosticRaw,
};

const A1_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A1_L1: l1ConceptRaw,
  A1_L2: l2ConceptRaw,
  A1_L3: l3ConceptRaw,
  A1_L4: l4ConceptRaw,
  A1_L5: l5ConceptRaw,
  A1_L6: l6ConceptRaw,
};

const A1_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  A1_L1: () => [...l1DiagnosticRaw(), ...l1ConceptRaw()],
  A1_L2: () => [...l2DiagnosticRaw(), ...l2ConceptRaw()],
  A1_L3: () => [...l3DiagnosticRaw(), ...l3ConceptRaw()],
  A1_L4: () => [...l4DiagnosticRaw(), ...l4ConceptRaw()],
  A1_L5: () => [...l5DiagnosticRaw(), ...l5ConceptRaw()],
  A1_L6: () => [...l6DiagnosticRaw(), ...l6ConceptRaw()],
};

export function a1GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A1_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a1GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A1_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a1GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A1_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
