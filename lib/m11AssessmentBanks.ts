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

type McSpec = [string, string[], number, string, string?];
type ShortSpec = { prompt: string; acceptedAnswers: string[]; hint?: string };

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
  hint = "Rebuild the lesson mechanism before choosing.",
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
}

function mcMany(defaultHint: string, specs: McSpec[]): RawItem[] {
  return specs.map(([prompt, choices, answerIndex, explanation, hint]) =>
    mc(prompt, choices, answerIndex, explanation, hint ?? defaultHint),
  );
}

function shortMany(defaultHint: string, specs: ShortSpec[]): RawItem[] {
  return specs.map((spec) => short(spec.prompt, spec.acceptedAnswers, spec.hint ?? defaultHint));
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
    throw new Error(`M11 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function exact(value: string, ...extra: string[]): string[] {
  return Array.from(new Set([value, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Keep proton number, mass number, and charge on separate ledgers.";
  return [
    ...mcMany(hint, [
      ["What does atomic number tell you?", ["the number of protons", "the number of neutrons", "the total number of nucleons", "the number of electrons in every case"], 0, "Atomic number is the proton count, and that fixes the element identity."],
      ["What does mass number tell you?", ["the number of neutrons only", "the number of electrons only", "the total number of protons and neutrons", "the total number of electrons and neutrons"], 2, "Mass number counts nucleons: protons plus neutrons."],
      ["Which particles are found in the nucleus?", ["protons and neutrons", "protons and electrons", "electrons and neutrons", "electrons only"], 0, "The nucleus contains protons and neutrons."],
      ["A neutral atom has atomic number 8. How many electrons does it have?", ["6", "8", "10", "16"], 1, "A neutral atom has equal numbers of protons and electrons."],
      ["A particle has 11 protons and 10 electrons. What is its charge?", ["1-", "0", "1+", "2+"], 2, "One extra proton compared with electrons gives a 1+ ion."],
      ["A particle has 17 protons and 18 electrons. What is its charge?", ["1-", "1+", "2-", "0"], 0, "One extra electron compared with protons gives a 1- ion."],
      ["Which change makes a different element?", ["changing the number of electrons only", "changing the number of neutrons only", "changing the number of protons", "changing the charge state only"], 2, "Element identity changes only when the proton number changes."],
      ["If an atom loses one electron, what happens?", ["it becomes a positive ion", "it becomes a different element", "its mass number increases by 1", "its neutron number changes"], 0, "Removing an electron leaves more protons than electrons, so the atom becomes positive."],
      ["If the neutron number changes but the proton number stays fixed, what has changed?", ["the isotope", "the element", "the charge state only", "the atomic number"], 0, "A neutron change gives a different isotope of the same element."],
      ["An atom has atomic number 13 and mass number 27. How many neutrons does it have?", ["13", "14", "27", "40"], 1, "Neutrons = mass number - atomic number."],
      ["Which statement is strongest?", ["Element identity depends on proton number.", "Element identity depends on electron number only.", "Mass number always equals electron number.", "Neutron number decides ion charge."], 0, "Proton number is the clean identity test for the element."],
      ["Why is a neutral atom not defined by mass number alone?", ["mass number can change between isotopes of the same element", "mass number is always zero in neutral atoms", "mass number counts electrons only", "mass number decides current"], 0, "Atoms of the same element can have different mass numbers if neutron number changes."],
    ]),
    ...shortMany(hint, [
      { prompt: "An atom has atomic number 12 and mass number 24. How many neutrons does it have?", acceptedAnswers: exact("12") },
      { prompt: "A neutral atom has 9 protons. How many electrons does it have?", acceptedAnswers: exact("9") },
      { prompt: "A particle has 15 protons and 13 electrons. State the charge.", acceptedAnswers: exact("2+", "+2", "2 +") },
      { prompt: "A particle has 20 protons and 22 electrons. State the charge.", acceptedAnswers: exact("2-", "-2", "2 -") },
      { prompt: "A nucleus has 26 protons and 30 neutrons. What is the mass number?", acceptedAnswers: exact("56") },
      { prompt: "An atom has mass number 23 and atomic number 11. How many neutrons does it have?", acceptedAnswers: exact("12") },
      { prompt: "If an atom becomes a positive ion, which particle number changed: protons, neutrons, or electrons?", acceptedAnswers: exact("electrons", "electron number") },
      { prompt: "Complete the statement: element identity depends on the number of ...", acceptedAnswers: exact("protons", "the number of protons") },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Decide first whether the question is about identity, mass, or charge.";
  return [
    ...mcMany(hint, [
      ["Why is 'this atom became a different element because it lost one electron' a weak statement?", ["electron loss changes charge, not element identity", "electrons are inside the nucleus", "mass number must always change first", "neutrons control charge"], 0, "Changing electron number changes ion charge, while element identity stays fixed if proton number is unchanged."],
      ["Two particles both have 17 protons but different numbers of electrons. What is the strongest conclusion?", ["they are different elements", "they are the same element with different charge states", "they must have the same mass number", "they cannot both be atoms"], 1, "Same proton number means same element, but different electron number can give different ions."],
      ["Why is mass number alone not enough to identify an element?", ["different elements can have nuclei with the same mass number", "mass number is always equal to electron number", "mass number decides charge", "mass number is not part of atomic structure"], 0, "You must check proton number, because different elements can share the same total nucleon count."],
      ["Which comparison best separates mass number from charge?", ["mass number tracks protons plus neutrons, while charge tracks proton-electron imbalance", "mass number and charge always change together", "charge decides the nucleus, while mass number decides the shell", "both are controlled by neutron number only"], 0, "Mass number and charge answer different questions about the particle."],
      ["A particle has 8 protons, 8 neutrons, and 10 electrons. Which description is strongest?", ["a neutral oxygen atom", "an oxygen 2- ion", "a nitrogen ion", "a neon atom"], 1, "Eight protons gives oxygen, and two extra electrons gives a 2- ion."],
      ["If one proton is added to a nucleus and electrons are left unchanged, what is the strongest conclusion?", ["the charge state changes but the element does not", "the element changes because atomic number changes", "only the mass number changes", "nothing important changes"], 1, "Changing proton number changes atomic number, so the element changes."],
      ["Why do electrons not contribute to mass number in this school model?", ["mass number counts nucleons in the nucleus only", "electrons do not exist in atoms", "electrons always have zero charge", "electrons decide isotope identity instead"], 0, "Mass number is the count of protons and neutrons only."],
      ["Which statement best protects the lesson meaning of an ion?", ["an ion is a charged particle formed by unequal proton and electron numbers", "an ion is any atom with neutrons", "an ion is a nucleus with no protons", "an ion is the same as an isotope"], 0, "Ion is the charge-state idea, not the isotope idea."],
      ["Two particles both have mass number 40, but one has 18 protons and the other has 20 protons. What is the strongest conclusion?", ["they are isotopes of the same element", "they are different elements", "they must have the same charge", "they must both be neutral"], 1, "Different proton numbers mean different elements, even if mass number matches."],
      ["Why must proton number be checked before electron number when naming the element?", ["because element identity is a nuclear property", "because electrons are heavier than protons", "because electrons decide mass number", "because neutron number is always zero"], 0, "The element is set by the nucleus, not by the ion state."],
      ["A neutral atom and a 1+ ion of the same element are compared. Which quantity definitely stays the same?", ["electron number", "charge", "proton number", "proton-electron balance"], 2, "The ion state can change, but the element identity remains fixed by proton count."],
      ["Why is it stronger to say 'charge changed' rather than 'the atom changed completely' when electrons are removed?", ["electron change affects only one ledger in the atomic model", "removing electrons changes the neutron number", "mass number depends on electrons", "the nucleus disappears"], 0, "Good atomic reasoning isolates which part of the structure actually changed."],
      ["Which statement is strongest about protons, neutrons, and electrons?", ["protons fix element, neutrons help set isotope, electrons set charge", "neutrons fix element, protons set charge, electrons set mass", "electrons fix element, protons set isotope, neutrons set charge", "all three always answer the same question"], 0, "Each particle count answers a different structural question."],
      ["An atom becomes a 2+ ion. Which event must have happened?", ["it lost two electrons", "it gained two electrons", "it lost two protons", "it gained two neutrons"], 0, "A positive ion forms when electrons are removed."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: charge depends on the difference between proton number and ... number.", acceptedAnswers: exact("electron", "electron number", "the electron number") },
      { prompt: "Complete the sentence: mass number counts protons and ...", acceptedAnswers: exact("neutrons", "the neutrons") },
      { prompt: "If electrons are added but proton number stays fixed, the element stays the same but the ... changes.", acceptedAnswers: exact("charge", "charge state", "ion charge") },
      { prompt: "If proton number changes, the ... changes.", acceptedAnswers: exact("element", "element identity") },
      { prompt: "A positive ion forms when an atom loses ...", acceptedAnswers: exact("electrons", "electron", "one or more electrons") },
      { prompt: "Protons and neutrons are found in the ...", acceptedAnswers: exact("nucleus", "the nucleus") },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Check proton number before you say anything about isotopes.";
  return [
    ...mcMany(hint, [
      ["What are isotopes?", ["atoms of the same element with different neutron numbers", "atoms with the same mass number but different charges only", "atoms with the same neutron number but different proton number", "ions with the same electron number"], 0, "Isotopes keep the proton number fixed and vary the neutron number."],
      ["Chlorine-35 and chlorine-37 are isotopes because they have the same number of...", ["electrons", "neutrons", "protons", "nucleons"], 2, "Same proton number means same element."],
      ["Chlorine has atomic number 17. How many neutrons are in chlorine-35?", ["17", "18", "35", "52"], 1, "Neutrons = 35 - 17 = 18."],
      ["Chlorine has atomic number 17. How many neutrons are in chlorine-37?", ["17", "18", "20", "37"], 2, "Neutrons = 37 - 17 = 20."],
      ["Which pair is an isotopic pair?", ["carbon-12 and carbon-14", "oxygen-16 and nitrogen-16", "sodium-23 and magnesium-23", "helium-4 and lithium-4"], 0, "An isotopic pair keeps the element the same while neutron number changes."],
      ["Which statement is strongest?", ["same proton number means same element", "same mass number means same element", "same electron number means same isotope", "same charge means same nucleus"], 0, "Proton number settles the identity question."],
      ["If two nuclei have the same mass number but different proton numbers, they are...", ["isotopes", "different elements", "always the same element", "neutral atoms only"], 1, "Different proton numbers mean different elements."],
      ["Why can isotopes of the same element have different masses?", ["their neutron numbers can differ", "their proton numbers must differ", "their electrons count toward mass number", "their charge states are always different"], 0, "Mass number changes if neutron number changes."],
      ["Which quantity stays fixed across isotopes of one element?", ["neutron number", "mass number", "proton number", "all three must change"], 2, "The proton number stays fixed for one element."],
      ["Which statement about isotopes is correct?", ["they can have different stability even if proton number is the same", "they must all have the same neutron number", "they are always ions", "they cannot be radioactive"], 0, "Stability can differ between isotopes of the same element."],
      ["Magnesium has atomic number 12. Which nucleus is magnesium-26?", ["12 protons and 12 neutrons", "12 protons and 14 neutrons", "14 protons and 12 neutrons", "26 protons and 12 neutrons"], 1, "Neutrons = 26 - 12 = 14."],
      ["Why does neutron number have to be checked after proton number in isotope work?", ["because proton number decides the element before neutron number decides the isotope", "because neutrons decide charge first", "because proton number always equals mass number", "because electron number is irrelevant in atoms"], 0, "Identity comes first, then isotope classification."],
    ]),
    ...shortMany(hint, [
      { prompt: "How many neutrons are in carbon-14?", acceptedAnswers: exact("8") },
      { prompt: "How many neutrons are in carbon-12?", acceptedAnswers: exact("6") },
      { prompt: "How many neutrons are in magnesium-24?", acceptedAnswers: exact("12") },
      { prompt: "Complete the sentence: isotopes of the same element have the same number of ...", acceptedAnswers: exact("protons", "the number of protons") },
      { prompt: "Complete the sentence: isotopes differ in the number of ...", acceptedAnswers: exact("neutrons", "the number of neutrons") },
      { prompt: "Chlorine-35 and chlorine-37 have atomic number 17. State the proton number in each nucleus.", acceptedAnswers: exact("17") },
      { prompt: "A nucleus has mass number 40 and atomic number 20. How many neutrons does it have?", acceptedAnswers: exact("20") },
      { prompt: "Two nuclei have the same proton number but different neutron numbers. Name the relationship.", acceptedAnswers: exact("isotopes", "they are isotopes") },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Keep identity, neutron count, and stability as separate questions.";
  return [
    ...mcMany(hint, [
      ["Why is 'chlorine-37 is a different element from chlorine-35 because it is heavier' a weak conclusion?", ["heavier isotopes can still be the same element if proton number is unchanged", "mass number decides charge, not element", "heavier nuclei cannot be atoms", "all heavy nuclei are neutral"], 0, "Mass number can change within the same element family."],
      ["Why is same mass number not enough to prove two nuclei are isotopes?", ["different elements can share the same mass number", "mass number never changes", "isotopes always have identical masses", "electrons decide isotope identity"], 0, "You must check proton number, not just total nucleon count."],
      ["Two nuclei both have 17 protons. One is stable and one is radioactive. What is the strongest statement?", ["they can still be isotopes of the same element", "they must be different elements", "the radioactive one must have more protons", "stability alone fixes the element identity"], 0, "Stability can differ within one isotope family."],
      ["What is the cleanest reason chlorine-35 and chlorine-37 are both called chlorine?", ["both nuclei have atomic number 17", "both nuclei have charge 0", "both nuclei have 35 or more nucleons", "both nuclei have the same mass number"], 0, "The shared proton number fixes the element name."],
      ["Which pair is NOT an isotopic pair?", ["carbon-12 and carbon-14", "oxygen-16 and oxygen-18", "argon-40 and calcium-40", "chlorine-35 and chlorine-37"], 2, "The non-isotopic pair changes proton number, so it changes the element."],
      ["Why should isotope notation include mass number as well as the element name?", ["it distinguishes nuclei of the same element that have different neutron numbers", "it tells you the electron speed", "it makes the charge state obvious in every case", "it replaces the need for proton number"], 0, "The mass number separates one isotope from another within the same element."],
      ["If a neutral atom of one isotope and a neutral atom of another isotope of the same element are compared, what must be true?", ["their proton numbers are equal", "their neutron numbers are equal", "their mass numbers are equal", "their nuclei have equal stability"], 0, "Isotopes keep proton number fixed."],
      ["Why can two isotopes of the same element have different neutron numbers but similar chemical behavior?", ["the element identity still comes from the same proton number", "neutron number controls electron shell arrangement directly", "mass number replaces proton number in chemistry", "radioactivity removes all electrons"], 0, "At this level, keeping the same element identity is the main point."],
      ["A nucleus has 20 protons and 22 neutrons. Another has 20 protons and 20 neutrons. How should they be classified?", ["same isotope", "same element but different isotopes", "different elements", "same mass number"], 1, "Same proton number but different neutron number means different isotopes of the same element."],
      ["Which statement is strongest about radioactive isotopes?", ["radioactivity is about nuclear stability, not about a different element identity", "a radioactive isotope must be a different element", "radioactive isotopes always have different charges", "radioactivity proves the proton number changed"], 0, "Instability does not by itself create a new element family."],
      ["Why is it stronger to compare proton number before mass number in isotope questions?", ["proton number decides the element before neutron number refines the isotope", "mass number decides everything needed alone", "electron number always equals proton number", "proton number can be ignored for neutral atoms"], 0, "A good isotope comparison starts with identity, then moves to neutron difference."],
      ["Carbon-14 and nitrogen-14 have the same mass number but are different elements. Why?", ["their proton numbers are different", "their neutron numbers are equal", "their electron numbers are equal", "their charges must be opposite"], 0, "Different proton numbers mean different elements, whatever the mass number."],
      ["Which quick test shows that two nuclei belong to the same element family?", ["same proton number", "same mass number", "same neutron number", "same activity"], 0, "Proton number is the decisive family test."],
      ["A student says, 'Same proton number and same neutron number means same isotope.' What is the best comment?", ["that is correct if the nuclei being compared are the same element", "same neutron number alone is enough", "same proton number alone proves the same isotope every time", "isotopes are defined by electron number"], 0, "If both proton and neutron numbers match, you are describing the same isotope."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: isotopes can differ in nuclear ... even when the element stays the same.", acceptedAnswers: exact("stability", "nuclear stability") },
      { prompt: "Carbon-14 and carbon-12 stay in the same element family because they have the same number of ...", acceptedAnswers: exact("protons", "the number of protons") },
      { prompt: "If proton number changes, the ... changes.", acceptedAnswers: exact("element", "element identity") },
      { prompt: "Chlorine-35 has 18 neutrons. Chlorine-37 has how many neutrons?", acceptedAnswers: exact("20") },
      { prompt: "Complete the sentence: same mass number does not always mean same ...", acceptedAnswers: exact("element", "element identity") },
      { prompt: "Changing neutron number while keeping proton number fixed changes the ...", acceptedAnswers: exact("isotope", "isotope identity", "the isotope") },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Track both what leaves the nucleus and what happens to A and Z.";
  return [
    ...mcMany(hint, [
      ["What is an alpha particle?", ["a helium nucleus", "a high-speed electron from the shell", "a gamma photon", "a neutron"], 0, "Alpha radiation is the emission of a helium nucleus."],
      ["What is beta-minus radiation?", ["a proton leaving the nucleus", "a high-speed electron emitted from the nucleus", "a helium nucleus", "an atom losing an orbital electron"], 1, "Beta-minus is a nuclear electron emission, not shell ionisation."],
      ["What is gamma radiation?", ["a stream of neutrons", "a charged particle", "high-energy electromagnetic radiation", "a helium nucleus"], 2, "Gamma is electromagnetic radiation from the nucleus."],
      ["Which radiation is stopped by paper or skin most easily?", ["alpha", "beta-minus", "gamma", "all equally"], 0, "Alpha is the least penetrating."],
      ["Which radiation is the most penetrating?", ["alpha", "beta-minus", "gamma", "all equally"], 2, "Gamma is the most penetrating of the three."],
      ["Which radiation is the most strongly ionising?", ["alpha", "beta-minus", "gamma", "none of them ionises"], 0, "Alpha is strongly ionising because it carries more charge and mass."],
      ["If a nucleus emits alpha radiation, what happens to mass number and atomic number?", ["A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A stays the same and Z stays the same", "A decreases by 1 and Z decreases by 1"], 0, "Alpha emission removes two protons and two neutrons."],
      ["If a nucleus emits beta-minus radiation, what happens to mass number and atomic number?", ["A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A stays the same and Z stays the same", "A increases by 1 and Z decreases by 1"], 1, "Beta-minus changes a neutron into a proton."],
      ["If a nucleus emits gamma radiation, what happens to mass number and atomic number?", ["both stay the same", "A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A decreases by 1 and Z stays the same"], 0, "Gamma changes the nuclear energy state, not the nuclear counts."],
      ["A radiation type is weakly ionising and very penetrating. Which type is it?", ["alpha", "beta-minus", "gamma", "all three"], 2, "Very penetrating and weakly ionising points to gamma."],
      ["Radium-226 undergoes alpha decay. Which daughter nucleus is formed?", ["radon-222", "radium-222", "actinium-226", "radon-226"], 0, "Alpha lowers mass number by 4 and atomic number by 2, giving radon-222."],
      ["Which statement is strongest?", ["shielding order and count-change rules both matter when identifying radiation", "penetration alone always tells you the daughter nucleus", "count changes are enough and shielding never matters", "gamma radiation always changes atomic number"], 0, "A robust identification keeps nuclear bookkeeping and shielding ideas together."],
    ]),
    ...shortMany(hint, [
      { prompt: "After alpha decay, by how much does mass number change?", acceptedAnswers: exact("4", "-4", "decreases by 4") },
      { prompt: "After alpha decay, by how much does atomic number change?", acceptedAnswers: exact("2", "-2", "decreases by 2") },
      { prompt: "After beta-minus decay, atomic number changes by ...", acceptedAnswers: exact("1", "+1", "increases by 1") },
      { prompt: "After gamma emission, does atomic number change? Answer yes or no.", acceptedAnswers: exact("no") },
      { prompt: "Name the radiation type with the greatest penetrating power.", acceptedAnswers: exact("gamma", "gamma radiation", "gamma ray") },
      { prompt: "Name the radiation type with the greatest ionising power.", acceptedAnswers: exact("alpha", "alpha radiation", "alpha particle") },
      { prompt: "Name the emitted particle in beta-minus decay.", acceptedAnswers: exact("electron", "a high-speed electron") },
      { prompt: "Paper is enough to stop which radiation most effectively?", acceptedAnswers: exact("alpha", "alpha radiation") },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Do not let shielding clues replace the nuclear bookkeeping.";
  return [
    ...mcMany(hint, [
      ["Why is beta-minus decay not the same as an atom simply losing one outer electron?", ["beta-minus is a nuclear change in which a neutron becomes a proton", "outer electrons are heavier than protons", "beta-minus always lowers atomic number", "shell electrons decide mass number"], 0, "Beta-minus is a nuclear conversion, not ordinary ionisation."],
      ["Why can gamma emission leave the element unchanged?", ["gamma emission does not change proton number", "gamma has zero speed", "gamma is blocked by paper", "gamma adds neutrons to the nucleus"], 0, "If proton number stays fixed, the element stays the same."],
      ["Why is it weak to identify radiation type from shielding alone?", ["different questions are involved: shielding tells penetration, while A and Z changes tell nuclear bookkeeping", "shielding always gives atomic number directly", "shielding is unrelated to radiation", "alpha and beta-minus always need identical shielding"], 0, "Good reasoning separates penetration from count changes."],
      ["A decay leaves mass number unchanged but increases atomic number by 1. Which process is strongest?", ["alpha", "beta-minus", "gamma", "electron loss from the shell"], 1, "That is the signature of beta-minus decay."],
      ["A decay changes neither mass number nor atomic number. Which process is strongest?", ["alpha", "beta-minus", "gamma", "fission"], 2, "Unchanged A and Z indicates gamma emission."],
      ["Why does beta-minus decay increase atomic number by 1 even though an electron is emitted?", ["the nucleus gains a proton when a neutron changes into a proton", "the electron enters the nucleus and counts as a proton", "mass number decides atomic number", "gamma radiation is also emitted"], 0, "Atomic number counts protons, and beta-minus creates one more proton in the nucleus."],
      ["Which comparison is strongest?", ["alpha changes both A and Z, while gamma changes neither", "gamma changes A more than alpha", "beta-minus lowers Z by 1", "all three radiations change A equally"], 0, "Alpha and gamma are strongly different in the nuclear ledger."],
      ["Why is alpha more strongly ionising than gamma but less penetrating?", ["alpha interacts strongly and loses energy quickly in matter", "alpha has no charge", "gamma is a heavy charged particle", "penetration depends only on sample size"], 0, "Alpha causes strong ionisation and is therefore absorbed quickly."],
      ["Which observation best points to alpha rather than gamma?", ["the daughter nucleus has A lower by 4 and Z lower by 2", "the radiation is very penetrating", "the radiation leaves A and Z unchanged", "lead is required before any absorption occurs"], 0, "Alpha has a distinctive nuclear-count change."],
      ["Which statement is strongest about gamma radiation?", ["it can require thick lead or concrete for strong attenuation and it leaves A and Z unchanged", "it is the most ionising and lowers A by 4", "it is a proton emitted from the shell", "it always changes the element identity"], 0, "Gamma is very penetrating and does not alter the nuclear counts."],
      ["A student says, 'Beta-minus should lower atomic number because something negative leaves.' What is the best correction?", ["beta-minus increases atomic number because a neutron turns into a proton inside the nucleus", "the emitted electron counts as negative mass only", "atomic number measures neutron count", "beta-minus does not involve the nucleus"], 0, "Atomic number is about the proton count after the nuclear conversion."],
      ["Why should count change and shielding be compared together in nuclear questions?", ["one identifies the nuclear process while the other identifies the penetration hazard", "they always give the same information", "count change matters only for chemistry", "shielding matters only for graphs"], 0, "The two comparison routes answer different but linked questions."],
      ["If a proposal says 'gamma decay produced a different element', what is the strongest response?", ["that cannot be pure gamma emission because proton number would have to change", "that is correct because all radiation changes element", "gamma always removes two protons", "gamma always increases mass number"], 0, "A changed element would need a changed proton number."],
      ["Which statement best protects the lesson meaning of radiation type?", ["each type must be identified by emitted signal, change in A and Z, and penetration pattern", "penetration alone tells everything", "the daughter nucleus does not matter", "charge state and isotope mean the same thing"], 0, "A robust identification uses all the lesson clues together."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the statement: beta-minus decay increases atomic number by ...", acceptedAnswers: exact("1", "+1", "1 more", "increases by 1") },
      { prompt: "Complete the statement: gamma emission changes neither mass number nor ... number.", acceptedAnswers: exact("atomic", "atomic number") },
      { prompt: "Complete the statement: alpha decay lowers mass number by ...", acceptedAnswers: exact("4", "four", "decreases by 4") },
      { prompt: "Name the radiation that usually needs lead or concrete for strong shielding.", acceptedAnswers: exact("gamma", "gamma radiation") },
      { prompt: "Name the radiation that is an emitted helium nucleus.", acceptedAnswers: exact("alpha", "alpha radiation", "alpha particle") },
      { prompt: "Complete the statement: beta-minus is a ... process, not just electron loss from the shell.", acceptedAnswers: exact("nuclear", "nucleus", "nuclear change") },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Count half-lives first, then halve what remains.";
  return [
    ...mcMany(hint, [
      ["What is half-life?", ["the time for the whole sample to disappear", "the time for the number of undecayed nuclei or activity to fall to half", "the time for the background count to double", "the time for one nucleus to decay"], 1, "Half-life describes the halving interval for a large sample or its activity."],
      ["After one half-life, what fraction of the original undecayed sample remains?", ["1/4", "1/2", "3/4", "2"], 1, "One half-life leaves one half remaining."],
      ["After three half-lives, what fraction remains?", ["1/2", "1/4", "1/8", "1/16"], 2, "Each interval halves what remains: (1/2)^3 = 1/8."],
      ["A sample falls from 160 counts per minute to 20 counts per minute. How many half-lives have passed?", ["2", "3", "4", "8"], 1, "160 -> 80 -> 40 -> 20 is three halvings."],
      ["A radioactive isotope has a half-life of 5 h. What fraction remains after 15 h?", ["1/2", "1/4", "1/8", "1/16"], 2, "15 h is three half-lives, so 1/8 remains."],
      ["Which statement is strongest about one nucleus?", ["its exact decay time is random", "it always decays exactly after one half-life", "it determines the whole graph by itself", "it never decays if the sample is small"], 0, "Single-nucleus decay is random."],
      ["Which statement is strongest about a large sample?", ["its overall decay pattern is predictable even though single decays are random", "every nucleus decays at the same moment", "half-life becomes zero", "randomness disappears completely"], 0, "Large samples show a stable statistical pattern."],
      ["If a sample starts at 200 counts per minute, what remains after two half-lives?", ["100 counts per minute", "50 counts per minute", "25 counts per minute", "150 counts per minute"], 1, "200 -> 100 -> 50."],
      ["A sample starts at 640 counts per minute and has a half-life of 6 h. What remains after 18 h?", ["320 counts per minute", "160 counts per minute", "80 counts per minute", "40 counts per minute"], 2, "18 h is three half-lives, so 640 -> 320 -> 160 -> 80."],
      ["What is the time for a sample to fall to one quarter of its original activity?", ["one half-life", "two half-lives", "three half-lives", "four half-lives"], 1, "One quarter is (1/2)^2."],
      ["Why is half-life not a fixed subtraction rule?", ["each interval halves what remains, so the amount lost gets smaller", "the amount lost is always the same", "the graph is always straight", "background radiation prevents halving"], 0, "Radioactive decay is multiplicative, not a fixed-drop process."],
      ["If two samples are the same isotope but different starting sizes, what is strongest?", ["they have the same half-life", "the larger sample must have the shorter half-life", "the smaller sample cannot decay", "their decay laws are unrelated"], 0, "Half-life is a property of the isotope, not of the starting amount."],
    ]),
    ...shortMany(hint, [
      { prompt: "A sample starts at 120 counts per second. What remains after one half-life?", acceptedAnswers: exact("60", "60 counts per second", "60 counts/s") },
      { prompt: "A sample starts at 120 counts per second. What remains after two half-lives?", acceptedAnswers: exact("30", "30 counts per second", "30 counts/s") },
      { prompt: "A sample starts at 80 counts per minute. What remains after three half-lives?", acceptedAnswers: exact("10", "10 counts per minute", "10 counts/min") },
      { prompt: "If the half-life is 4 h, how long does it take for only one quarter to remain?", acceptedAnswers: exact("8", "8 h", "8 hours") },
      { prompt: "If the half-life is 3 days, how long does it take for one eighth to remain?", acceptedAnswers: exact("9", "9 days") },
      { prompt: "What fraction remains after four half-lives?", acceptedAnswers: exact("1/16", "one sixteenth") },
      { prompt: "What fraction remains after two half-lives?", acceptedAnswers: exact("1/4", "one quarter") },
      { prompt: "Complete the sentence: half-life halves what ...", acceptedAnswers: exact("remains", "what remains") },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Separate single-nucleus randomness from large-sample predictability.";
  return [
    ...mcMany(hint, [
      ["Why is 'a sample loses 100 nuclei every half-life forever' incorrect?", ["half-life halves what remains, so the number lost each interval shrinks", "nuclei cannot be counted", "half-life depends on background only", "radioactive decay is always linear"], 0, "Halving what remains is not the same as subtracting a constant amount."],
      ["Why can one nucleus decay now and another identical nucleus decay much later?", ["individual radioactive decay is random", "their atomic numbers are different", "half-life fixes the exact decay time for each nucleus", "background radiation chooses the later time"], 0, "The unpredictability is part of the single-nucleus story."],
      ["Why can the decay curve of a large sample still be predictable?", ["large numbers smooth the randomness into a stable statistical pattern", "all nuclei decay at the same time", "the sample stops being random", "background radiation becomes zero"], 0, "Large numbers give a predictable overall trend."],
      ["A sample has a half-life of 2 h. Why is 25 percent remaining after 4 h and not after 2 h?", ["25 percent remaining needs two halvings, not one", "25 percent always means one half-life", "the first half-life removes 75 percent", "half-life applies only to mass, not to count rate"], 0, "One half-life gives 50 percent remaining, two half-lives give 25 percent."],
      ["Which statement is strongest about half-life?", ["it is a property of the isotope and does not depend on the initial amount", "it doubles when the sample doubles", "it depends on the room background count only", "it is the exact life of each nucleus"], 0, "Half-life belongs to the isotope itself."],
      ["Why does the amount lost per half-life get smaller as time goes on?", ["there is less undecayed material left to halve", "the isotope changes into a different element every minute", "background radiation blocks decay", "half-life becomes shorter"], 0, "The halving always applies to the remaining amount."],
      ["Which description best fits a decay graph?", ["a curve that falls by repeated halving rather than a straight-line drop", "a straight line with constant slope", "a graph that reaches zero after one half-life", "a graph that rises because nuclei gain energy"], 0, "Repeated halving gives a curved fall."],
      ["Two equal samples of the same isotope start at different count rates because one detector is closer. Which quantity still belongs to the isotope itself?", ["the half-life", "the starting count rate", "the detector position", "the background setting"], 0, "Experimental setup can change the count rate, but not the half-life."],
      ["Why is it wrong to call half-life 'the time for the sample to vanish'?", ["the sample keeps halving and does not all disappear in one fixed interval", "all samples vanish after one half-life", "half-life is measured in volts", "gamma radiation prevents total disappearance"], 0, "Half-life is a repeated halving interval, not a disappearance time."],
      ["If a sample falls from 400 to 50, which reasoning is strongest?", ["three half-lives passed because 400 -> 200 -> 100 -> 50", "two half-lives passed because the count fell a lot", "four half-lives passed because 50 is small", "one half-life passed because only one sample is involved"], 0, "Count the number of halvings directly."],
      ["Which statement best protects the lesson meaning of half-life?", ["it can apply to count rate or activity as well as undecayed nuclei", "it applies only to mass in grams", "it applies only to one nucleus", "it applies only to background radiation"], 0, "The same halving logic can be read from several large-sample quantities."],
      ["Why can a decay graph flatten as time goes on?", ["because the same fractional drop corresponds to a smaller absolute drop when less remains", "because half-life stops working", "because the isotope becomes stable instantly", "because count rate turns into voltage"], 0, "The curve reflects repeated multiplication by one half."],
      ["A student says, 'The sample is random, so the graph cannot be predicted.' What is the best correction?", ["single decays are random, but large-sample behavior is predictable", "random means no pattern is possible at any scale", "the graph is fixed only by detector type", "background radiation removes randomness"], 0, "You must separate one-particle randomness from population behavior."],
      ["Why is 1/8 remaining after three half-lives stronger than saying 'three chunks were lost'?", ["it tracks the fraction left after repeated halving", "it assumes a fixed subtraction rule", "it ignores the half-life entirely", "it proves all nuclei decay together"], 0, "Fraction language protects the multiplicative decay story."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: one nucleus decays ... , but a large sample follows a predictable trend.", acceptedAnswers: exact("randomly", "at random") },
      { prompt: "Complete the sentence: half-life is the time for the number of undecayed nuclei to fall to ...", acceptedAnswers: exact("half", "one half") },
      { prompt: "After three half-lives, the remaining fraction is ...", acceptedAnswers: exact("1/8", "one eighth") },
      { prompt: "If a sample has half-life 10 min, what time is needed for one quarter to remain?", acceptedAnswers: exact("20", "20 min", "20 minutes") },
      { prompt: "Complete the sentence: half-life is a ... rule, not a fixed subtraction rule.", acceptedAnswers: exact("halving", "multiplicative halving", "multiplicative") },
      { prompt: "If the same isotope starts with twice as many undecayed nuclei, does the half-life change? Answer yes or no.", acceptedAnswers: exact("no") },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Subtract background before comparing source strength.";
  return [
    ...mcMany(hint, [
      ["What is corrected count rate?", ["measured count rate - background count rate", "measured count rate + background count rate", "background count rate only", "the highest single reading"], 0, "Corrected count rate removes the environmental background from the measurement."],
      ["A detector reads 86 counts per second near a sample. Background is 14 counts per second. What is the corrected source count rate?", ["72 counts per second", "100 counts per second", "60 counts per second", "14 counts per second"], 0, "Corrected rate = 86 - 14 = 72 counts per second."],
      ["A detector reads 62 counts per second near a second sample in the same background of 14 counts per second. What is the corrected source count rate?", ["48 counts per second", "76 counts per second", "62 counts per second", "14 counts per second"], 0, "Corrected rate = 62 - 14 = 48 counts per second."],
      ["Using the last two corrected rates, which sample is more active?", ["the first sample", "the second sample", "they are equally active", "it cannot be decided after subtraction"], 0, "72 counts per second is larger than 48 counts per second."],
      ["Why can a detector click in an empty room?", ["background radiation is normally present", "the detector creates radioactive nuclei", "empty rooms always contain alpha sources", "the count rate must always be zero without a sample"], 0, "Background radiation is a normal environmental signal."],
      ["Why should background be measured before deciding whether a source is strong?", ["raw readings mix source plus environment together", "background makes radiation safe", "background always equals zero in school labs", "raw readings already exclude environmental effects"], 0, "You must subtract background to isolate the source contribution."],
      ["If measured count rate equals background count rate, what is the corrected source count rate?", ["zero", "equal to the background", "double the background", "it must be negative"], 0, "No extra count above background means zero corrected source rate."],
      ["Which unit best matches count rate?", ["counts per second", "joules", "newtons", "tesla"], 0, "Count rate is the number of counts recorded each second."],
      ["Why might repeated count readings from the same source fluctuate?", ["radioactive counting is random from moment to moment", "the atomic number changes every second", "background radiation disappears", "count rate is not measurable"], 0, "The count process is statistical, so repeated readings vary."],
      ["Which statement is strongest about background radiation?", ["it is a normal part of detector evidence and must be allowed for", "it only exists when a source is nearby", "it can be ignored because it is always zero", "it proves contamination"], 0, "Background is a real physical signal, not just measurement noise."],
      ["Sample A gives 55 counts per second in a background of 20. Sample B gives 50 counts per second in a background of 10. Which sample is more active?", ["sample A", "sample B", "they are equally active", "raw readings are enough, so sample A"], 1, "Corrected rates are 35 and 40, so sample B is more active."],
      ["Why is raw count rate alone not enough to compare two samples measured in different backgrounds?", ["the environmental contribution may differ and change the raw reading", "raw count rate already removes all background", "raw readings always rank sources correctly", "count rate depends only on mass number"], 0, "Corrected rates must be compared, not raw mixed signals."],
    ]),
    ...shortMany(hint, [
      { prompt: "Measured count rate is 90 counts per minute and background is 18 counts per minute. What is the corrected source count rate?", acceptedAnswers: exact("72", "72 counts per minute", "72 counts/min") },
      { prompt: "Measured count rate is 44 counts per second and background is 11 counts per second. What is the corrected source count rate?", acceptedAnswers: exact("33", "33 counts per second", "33 counts/s") },
      { prompt: "Measured count rate is 31 counts per second and background is 31 counts per second. What is the corrected source count rate?", acceptedAnswers: exact("0", "zero", "0 counts per second", "0 counts/s") },
      { prompt: "Sample A gives 70 counts/s with background 20 counts/s. What is the corrected source rate?", acceptedAnswers: exact("50", "50 counts/s", "50 counts per second") },
      { prompt: "Sample B gives 54 counts/s with background 14 counts/s. What is the corrected source rate?", acceptedAnswers: exact("40", "40 counts/s", "40 counts per second") },
      { prompt: "Complete the sentence: corrected source count rate = measured count rate minus ... count rate.", acceptedAnswers: exact("background", "background count rate", "the background count rate") },
      { prompt: "Complete the sentence: a non-zero reading in an empty room can be explained by ... radiation.", acceptedAnswers: exact("background", "background radiation") },
      { prompt: "If repeated counts fluctuate, name one quantity you should compare after subtraction: corrected count ...", acceptedAnswers: exact("rate", "count rate", "corrected count rate") },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Treat the detector reading as source plus background until subtraction proves otherwise.";
  return [
    ...mcMany(hint, [
      ["Why is 'the detector is clicking, so there must be a hidden source' a weak conclusion?", ["background radiation already gives a non-zero reading", "detectors only click for alpha radiation", "all rooms contain the same radioactive isotope", "count rate always equals zero without a source"], 0, "A non-zero reading alone does not prove an added source."],
      ["Why is corrected count rate stronger evidence than raw count rate?", ["it isolates the source contribution from the environmental background", "it always gives a larger number", "it removes the need for repeated readings", "it proves the exact isotope"], 0, "Corrected count rate is the cleaner comparison quantity."],
      ["Two measurements are taken in different locations. Why might a new background reading be needed?", ["background radiation can vary from place to place", "background never changes anywhere", "the detector stops working after one reading", "count rate can only be measured once"], 0, "Background is environmental, so location can matter."],
      ["Why can repeated readings from the same source and same setup still vary?", ["radioactive counting is random and statistical", "the source changes element every second", "the detector swaps radiation type", "corrected count rate must always be constant"], 0, "The count process fluctuates even in a steady setup."],
      ["Sample A gives 48 counts/s in background 12 counts/s. Sample B gives 39 counts/s in background 6 counts/s. What is the strongest comparison?", ["sample A is more active", "sample B is more active", "they are equally active after correction", "raw readings already show sample A is stronger"], 2, "Corrected rates are 36 counts/s for both samples."],
      ["What is the best reason to average several count-rate measurements?", ["to reduce the effect of random fluctuations and get a more reliable estimate", "to make the background disappear completely", "to change the isotope half-life", "to convert gamma into beta-minus"], 0, "Averaging helps smooth random variation."],
      ["Why is a corrected source count rate of zero a meaningful result?", ["it suggests no detectable source signal above background", "it proves the detector is broken", "it means the background is negative", "it means all radiation has stopped existing"], 0, "Zero after subtraction means the source contribution is not detected above background."],
      ["Why should two raw readings not be compared directly when their backgrounds differ?", ["a larger raw reading might still hide a smaller corrected source rate", "background never affects detector data", "raw readings always rank sources correctly", "count rate depends only on mass number"], 0, "Different backgrounds can change the raw total in different ways."],
      ["Which statement best protects the lesson meaning of detector evidence?", ["source strength is judged after background subtraction, not before", "the biggest raw reading always means the most active source", "background is only a detector fault", "one reading is enough for exact certainty"], 0, "The source must be separated from the environment first."],
      ["Why can a detector record counts with no sample present and still be working correctly?", ["the detector is responding to normal background radiation", "the detector creates gamma rays internally", "the room must contain a dangerous source", "the detector cannot ever be quiet"], 0, "Background response is expected and normal."],
      ["What is the strongest criticism of the statement 'I measured 80 counts/s, so the sample activity is 80 counts/s'?", ["the reading still contains the background contribution", "activity cannot be measured with detectors", "count rate and activity are always unrelated", "the measured rate must be doubled"], 0, "Raw count rate is not yet the corrected source evidence."],
      ["A source is moved farther from the detector and the raw count rate falls. Which explanation is strongest?", ["the detector now receives a smaller source contribution on top of the background", "the background disappears", "the source atomic number changed", "gamma becomes alpha"], 0, "Distance can change the source contribution while background remains."],
      ["Why is a background reading part of the physics rather than just an annoying mistake?", ["background radiation is a real environmental effect that detectors genuinely record", "background comes only from student error", "background exists only in incorrect experiments", "background changes mass number"], 0, "The detector is measuring a real physical signal."],
      ["What is the best reason to state the unit with a detector reading?", ["count rate is a rate quantity, so the time interval must be clear", "units remove background automatically", "count rate has no units", "units determine the isotope"], 0, "Counts per second and counts per minute are different rates and must not be confused."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: raw detector reading = source contribution + ...", acceptedAnswers: exact("background", "background radiation", "background count rate") },
      { prompt: "Why should several readings be averaged? Complete with one word: to reduce random ...", acceptedAnswers: exact("fluctuations", "variation", "scatter") },
      { prompt: "A non-zero empty-room reading does not by itself prove a hidden source because of ... radiation.", acceptedAnswers: exact("background", "background radiation") },
      { prompt: "If corrected source count rate is measured minus background, what operation joins them? Answer with one word.", acceptedAnswers: exact("subtraction", "subtract", "minus") },
      { prompt: "Complete the sentence: the fair comparison quantity is the ... count rate, not the raw count rate.", acceptedAnswers: exact("corrected", "corrected source", "corrected source count") },
      { prompt: "Counts per second is a unit of count ...", acceptedAnswers: exact("rate", "count rate") },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Balance both mass number and atomic number, then include the emitted radiation.";
  return [
    ...mcMany(hint, [
      ["Which two quantities must balance in a nuclear equation?", ["mass number and atomic number", "charge and temperature", "volume and density", "speed and time"], 0, "Nuclear equations conserve mass number and atomic number."],
      ["What happens to mass number and atomic number in alpha decay?", ["A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A and Z both stay the same", "A decreases by 1 and Z stays the same"], 0, "Alpha emission removes two protons and two neutrons."],
      ["What happens to mass number and atomic number in beta-minus decay?", ["A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A and Z both stay the same", "A increases by 1 and Z decreases by 1"], 1, "Beta-minus keeps A the same and raises Z by 1."],
      ["What happens to mass number and atomic number in gamma emission?", ["A and Z both stay the same", "A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A decreases by 1 and Z increases by 1"], 0, "Gamma emission changes the energy state only."],
      ["Carbon-14 undergoes beta-minus decay. Which daughter nucleus is formed?", ["boron-14", "carbon-13", "nitrogen-14", "oxygen-14"], 2, "Beta-minus raises atomic number from 6 to 7 while keeping A = 14."],
      ["Radium-226 undergoes alpha decay. Which daughter nucleus is formed?", ["radon-222", "radium-222", "radon-226", "actinium-226"], 0, "Alpha lowers A by 4 and Z by 2."],
      ["A nucleus emits gamma radiation. Which statement is strongest?", ["the daughter nucleus has the same A and Z as the parent", "the daughter loses two protons", "the daughter gains one proton", "the daughter becomes a different mass number"], 0, "Gamma does not alter the nuclear counts."],
      ["Which decay type matches the rule 'A unchanged, Z increased by 1'?", ["alpha", "beta-minus", "gamma", "fission"], 1, "That is the beta-minus bookkeeping rule."],
      ["Which decay type matches the rule 'A decreased by 4, Z decreased by 2'?", ["alpha", "beta-minus", "gamma", "ionisation"], 0, "That is the alpha bookkeeping rule."],
      ["Which decay type matches the rule 'A unchanged, Z unchanged'?", ["alpha", "beta-minus", "gamma", "all of them"], 2, "That is the gamma bookkeeping rule."],
      ["Why must the emitted radiation appear explicitly in the equation?", ["it carries away the missing balance in A and or Z", "it is optional decoration only", "it replaces the daughter nucleus", "it always has zero effect"], 0, "The emitted radiation is part of the full conservation ledger."],
      ["Which statement is strongest about a valid nuclear equation?", ["the totals of A and Z must match before and after", "the element symbol on the left must stay the same", "the background count must be zero", "the charge state of the shell must be shown first"], 0, "Both nuclear-count totals must balance."],
    ]),
    ...shortMany(hint, [
      { prompt: "Carbon-14 undergoes beta-minus decay. Name the daughter nucleus.", acceptedAnswers: exact("nitrogen-14", "nitrogen 14") },
      { prompt: "Radium-226 undergoes alpha decay. Name the daughter nucleus.", acceptedAnswers: exact("radon-222", "radon 222") },
      { prompt: "Complete the sentence: in gamma emission, mass number stays ...", acceptedAnswers: exact("the same", "unchanged") },
      { prompt: "Complete the sentence: in beta-minus decay, atomic number increases by ...", acceptedAnswers: exact("1", "+1", "one") },
      { prompt: "Complete the sentence: in alpha decay, mass number decreases by ...", acceptedAnswers: exact("4", "four") },
      { prompt: "Complete the sentence: nuclear equations conserve atomic number and ... number.", acceptedAnswers: exact("mass", "mass number") },
      { prompt: "A decay leaves both A and Z unchanged. Name the decay type.", acceptedAnswers: exact("gamma", "gamma emission", "gamma decay") },
      { prompt: "A decay lowers A by 4 and Z by 2. Name the decay type.", acceptedAnswers: exact("alpha", "alpha decay", "alpha emission") },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Treat the equation like a ledger: parent, daughter, emission, and both balances.";
  return [
    ...mcMany(hint, [
      ["Why must beta-minus decay still conserve atomic number even though an electron is emitted?", ["the emitted electron carries -1, balancing the daughter's +1 increase in Z", "atomic number is ignored in beta-minus decay", "the electron counts as a neutron", "beta-minus decay changes only mass number"], 0, "The emitted beta-minus particle is part of the conservation ledger."],
      ["Why can gamma emission leave the element unchanged?", ["the daughter nucleus keeps the same proton number", "gamma removes two neutrons only", "gamma adds an electron to the shell", "gamma always lowers mass number"], 0, "No change in proton number means no change in element."],
      ["Why does alpha decay usually produce a different element?", ["the proton number decreases by 2", "the neutron number always becomes zero", "gamma is emitted at the same time", "electrons define the element"], 0, "Changing proton number changes atomic number and therefore the element."],
      ["Why is it weak to write only the daughter nucleus and ignore the emitted radiation?", ["the conservation totals of A and or Z may no longer balance visibly", "emitted radiation never matters", "daughter nuclei always determine the emission automatically", "nuclear equations track electrons only"], 0, "A full equation needs every particle that carries the balance."],
      ["A proposed beta-minus equation keeps A the same but lowers Z by 1. Why is that wrong?", ["beta-minus should increase Z by 1, not decrease it", "beta-minus should lower A by 4", "beta-minus should leave Z unchanged", "beta-minus must always emit gamma only"], 0, "Beta-minus converts a neutron into a proton, so Z rises by 1."],
      ["A proposed gamma equation changes mass number. What is the strongest criticism?", ["gamma emission should not change mass number at all", "gamma emission always lowers Z by 2", "gamma emission adds an electron", "gamma emission changes only background radiation"], 0, "Gamma is the unchanged-count case."],
      ["Why is 'the daughter has the same element symbol, so the equation must be gamma' incomplete?", ["the count balances still need to be checked because same symbol alone is not enough evidence", "gamma never keeps the same symbol", "same symbol proves alpha", "mass number is irrelevant"], 0, "Even if the symbol looks unchanged, the equation must still obey both conservation rules."],
      ["Which statement best protects the lesson meaning of a balanced nuclear equation?", ["both A and Z must match when the emitted particle is included", "only the daughter name matters", "mass number can be ignored if the element name looks right", "shielding decides the equation"], 0, "Nuclear equations are bookkeeping for A and Z together."],
      ["Why is beta-minus decay stronger as a ledger problem than as a memorized slogan?", ["because you must track the daughter, the emitted electron, and both conservation totals", "because the daughter can be guessed from penetration only", "because shielding alone fixes the daughter nucleus", "because atomic number is optional"], 0, "The balance works only when all parts of the event are included."],
      ["If a proposed alpha-decay daughter keeps the same mass number as the parent, what is the best criticism?", ["alpha decay must lower mass number by 4", "alpha decay must increase atomic number by 1", "alpha decay leaves both totals unchanged", "alpha decay changes electrons only"], 0, "Alpha emission removes two protons and two neutrons."],
      ["Why should the daughter nucleus be identified from its new atomic number rather than from the emitted radiation alone?", ["element identity follows proton number in the daughter nucleus", "emitted radiation always names the daughter directly", "atomic number is only for neutral atoms", "the daughter symbol does not matter"], 0, "The daughter element is set by its proton count."],
      ["A student says, 'Mass number is what matters most because it is larger.' What is the strongest correction?", ["both mass number and atomic number must balance, and atomic number determines the element", "mass number alone fixes the daughter element", "atomic number matters only in chemistry", "gamma changes mass number most strongly"], 0, "Mass number and atomic number have different roles and both must be tracked."],
      ["Why is a nuclear equation not balanced by using ordinary masses in grams?", ["the conservation rules at this level are written in mass number and atomic number, not laboratory mass in grams", "grams always equal atomic number", "mass in grams never changes", "background radiation replaces mass"], 0, "The school nuclear ledger uses A and Z, not weighed sample mass."],
      ["Which comparison is strongest?", ["alpha changes both A and Z, beta-minus changes Z only, gamma changes neither", "alpha and gamma both leave A unchanged", "beta-minus lowers Z while gamma raises it", "all three always produce the same daughter"], 0, "Each radiation type has its own bookkeeping signature."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: nuclear equations must conserve mass number and ... number.", acceptedAnswers: exact("atomic", "atomic number") },
      { prompt: "Complete the sentence: in beta-minus decay, mass number stays the same while atomic number ...", acceptedAnswers: exact("increases", "increases by 1", "goes up", "rises") },
      { prompt: "Complete the sentence: in gamma emission, both A and Z stay ...", acceptedAnswers: exact("the same", "unchanged") },
      { prompt: "Complete the sentence: alpha decay changes the element because proton number ...", acceptedAnswers: exact("decreases", "decreases by 2", "falls") },
      { prompt: "Carbon-14 beta-minus decay produces nitrogen-14. What quantity changed from 6 to 7?", acceptedAnswers: exact("atomic number", "proton number", "z") },
      { prompt: "To keep a nuclear equation balanced, the emitted radiation must be included on the ... side if it is produced.", acceptedAnswers: exact("right", "product side", "products side") },
    ]),
  ];
}

function l1MasteryRaw(): RawItem[] { return [...l1DiagnosticRaw(), ...l1ConceptRaw()]; }
function l2MasteryRaw(): RawItem[] { return [...l2DiagnosticRaw(), ...l2ConceptRaw()]; }
function l3MasteryRaw(): RawItem[] { return [...l3DiagnosticRaw(), ...l3ConceptRaw()]; }
function l4MasteryRaw(): RawItem[] { return [...l4DiagnosticRaw(), ...l4ConceptRaw()]; }
function l5MasteryRaw(): RawItem[] { return [...l5DiagnosticRaw(), ...l5ConceptRaw()]; }
function l6MasteryRaw(): RawItem[] { return [...l6DiagnosticRaw(), ...l6ConceptRaw()]; }

const M11_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  M11_L1: l1DiagnosticRaw,
  M11_L2: l2DiagnosticRaw,
  M11_L3: l3DiagnosticRaw,
  M11_L4: l4DiagnosticRaw,
  M11_L5: l5DiagnosticRaw,
  M11_L6: l6DiagnosticRaw,
};

const M11_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  M11_L1: l1ConceptRaw,
  M11_L2: l2ConceptRaw,
  M11_L3: l3ConceptRaw,
  M11_L4: l4ConceptRaw,
  M11_L5: l5ConceptRaw,
  M11_L6: l6ConceptRaw,
};

const M11_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  M11_L1: l1MasteryRaw,
  M11_L2: l2MasteryRaw,
  M11_L3: l3MasteryRaw,
  M11_L4: l4MasteryRaw,
  M11_L5: l5MasteryRaw,
  M11_L6: l6MasteryRaw,
};

export function m11GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M11_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function m11GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M11_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function m11GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M11_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
