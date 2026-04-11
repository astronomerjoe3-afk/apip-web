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

function normalizePrompt(prompt: string): string {
  return String(prompt || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint = "Rebuild the nuclear-physics mechanism before choosing.",
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

function materializeBank(code: string, kind: BankKind, rawItems: RawItem[]): UnknownRecord[] {
  const seen = new Set<string>();
  const deduped = rawItems.flatMap((item, index) => {
    const signature = item.kind === "mc"
      ? `${normalizePrompt(item.prompt)}::${item.choices.map((choice) => normalizePrompt(choice)).join("|")}`
      : `${normalizePrompt(item.prompt)}::${item.acceptedAnswers.map((answer) => normalizePrompt(answer)).join("|")}`;
    if (!item.prompt || seen.has(signature)) return [];
    seen.add(signature);
    const id = `${compactCode(code)}-${stageLabel(kind)}-${String(index + 1).padStart(2, "0")}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`M12 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function exact(value: string, ...extra: string[]): string[] {
  return Array.from(new Set([value, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Separate mass defect, binding energy, and stability before answering.";
  return [
    ...mcMany(hint, [
      ["What does nuclear binding energy describe?", ["energy needed to separate a nucleus into free nucleons", "energy stored in electron shells", "energy released by a resistor each second", "energy needed to ionise one atom"], 0, "Binding energy is the energy associated with holding the nucleus together."],
      ["What is mass defect?", ["the difference between the total free-nucleon mass and the actual nucleus mass", "the missing electron mass in an ion", "the increase in mass during melting", "the difference between mass number and atomic number"], 0, "Mass defect compares separated nucleons with the bound nucleus."],
      ["If nucleus A has 7.6 MeV per nucleon and nucleus B has 8.4 MeV per nucleon, which is more stable?", ["nucleus A", "nucleus B", "both equally stable", "stability cannot be compared from binding energy per nucleon"], 1, "Higher binding energy per nucleon means the nucleons are more tightly bound and the nucleus is more stable."],
      ["Which relation links energy release to a mass change?", ["E = delta m c^2", "p = mv", "V = IR", "p = F / A"], 0, "Mass-energy equivalence links a small mass change to a potentially large energy change."],
      ["Why can nuclear reactions release much more energy than chemical reactions for the same mass of fuel?", ["nuclear reactions change binding inside the nucleus", "chemical reactions change proton number more strongly", "nuclear reactions make electrons move faster only", "chemical reactions violate conservation of energy"], 0, "Nuclear reactions access binding-energy changes in the nucleus, which are much larger than ordinary bond-energy changes."],
      ["Which statement about a stable nucleus is strongest?", ["its nucleons are tightly bound", "its electrons move slowly", "its mass number is always small", "its chemical bonds cannot change"], 0, "Nuclear stability is about how tightly the nucleus is bound."],
      ["If the actual nucleus mass is smaller than the total mass of its free nucleons, where did the missing mass go?", ["it is equivalent to the binding energy of the nucleus", "it turned into extra neutrons", "it was destroyed completely", "it became the atomic number"], 0, "The missing mass appears as binding energy by E = delta m c^2."],
      ["Which comparison should be used first when comparing the stability of nuclei with different sizes?", ["binding energy per nucleon", "total binding energy only", "number of electrons", "chemical symbol length"], 0, "Binding energy per nucleon is the fair comparison when nucleon numbers differ."],
      ["A process releases energy because the products are more tightly bound than the starting nuclei. What has increased?", ["binding energy per nucleon", "electron number", "electric current", "resistance"], 0, "Energy is released when the products have higher binding energy per nucleon."],
      ["Which change is definitely nuclear rather than chemical?", ["mass defect linked to binding energy", "formation of water from hydrogen and oxygen", "melting of ice", "charging a capacitor"], 0, "Mass defect and binding energy belong to the nucleus."],
      ["If two nuclei have the same binding energy per nucleon, what can you say first?", ["they are similarly tightly bound per nucleon", "they must be the same element", "they must have the same mass number", "they must release equal total energy in every reaction"], 0, "Binding energy per nucleon compares how tightly bound the nuclei are per particle, not whether they are identical."],
      ["What is the best reason to say that a small mass defect can still matter physically?", ["c^2 is very large in E = delta m c^2", "the speed of light becomes zero", "mass number is always tiny", "electrons carry away all the energy"], 0, "The large c^2 factor means even tiny mass changes correspond to large energy changes."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the relation: E = delta m ...", acceptedAnswers: exact("c^2", "c2", "c squared") },
      { prompt: "Complete the phrase: a more stable nucleus has a higher binding energy per ...", acceptedAnswers: exact("nucleon", "nucleon.") },
      { prompt: "Mass defect compares the free nucleons with the bound ...", acceptedAnswers: exact("nucleus", "nucleus mass", "mass of the nucleus") },
      { prompt: "Nuclear energy comes from changes in the ... rather than ordinary chemical bonds.", acceptedAnswers: exact("nucleus", "binding inside the nucleus") },
      { prompt: "If products are more tightly bound than reactants, energy is ...", acceptedAnswers: exact("released", "given out") },
      { prompt: "Binding energy per nucleon is used to compare nuclear ...", acceptedAnswers: exact("stability", "nuclear stability") },
      { prompt: "The missing mass in a nucleus is equivalent to binding ...", acceptedAnswers: exact("energy", "binding energy") },
      { prompt: "A nucleus with the higher binding energy per nucleon is generally the more ...", acceptedAnswers: exact("stable", "stable nucleus") },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Ask whether the question is about total binding, binding per nucleon, or the mass-energy link.";
  return [
    ...mcMany(hint, [
      ["Why is total binding energy alone a weak first comparison for two nuclei of very different size?", ["larger nuclei can have larger totals simply because they contain more nucleons", "total binding energy is unrelated to stability", "total binding energy applies only to electrons", "total binding energy is always negative in school problems"], 0, "Binding energy per nucleon is the better first comparison when nucleus sizes differ."],
      ["Why does a mass defect not mean matter has disappeared without trace?", ["the missing mass corresponds to energy in the bound system", "mass can vanish without any equivalent", "the missing mass turns into atomic number", "the missing mass is only a measurement mistake"], 0, "Mass-energy equivalence keeps the ledger closed."],
      ["A student says, 'A heavier nucleus must always be more stable because it contains more binding energy in total.' What is the best comment?", ["stability is judged better by binding energy per nucleon", "heavier nuclei cannot be stable", "total binding energy is never relevant", "stability depends only on electron arrangement"], 0, "Per-nucleon comparison matters more than total binding when comparing different-sized nuclei."],
      ["Why can both fission and fusion release energy even though one splits nuclei and the other joins them?", ["both can move nuclei toward a higher binding energy per nucleon", "both always increase proton number", "both always decrease mass number to zero", "both are chemical reactions in the nucleus"], 0, "The key is not splitting versus joining by itself, but the direction of the binding-energy-per-nucleon change."],
      ["Why is it stronger to say 'energy is released because the products are more tightly bound' rather than 'energy is released because the nucleus breaks'?", ["the tight-binding comparison gives the cause, not just a description of the event", "nuclei cannot break", "every nuclear event releases the same energy", "breaking alone proves instability"], 0, "Cause-and-effect language should track binding, not just visible change."],
      ["If nucleus X and nucleus Y have the same total binding energy, but X has fewer nucleons, which may be more stable?", ["X, because its binding energy per nucleon may be larger", "Y, because larger nuclei are always more stable", "they must be equally stable", "stability cannot depend on nucleon count"], 0, "Equal totals can hide different per-nucleon binding strengths."],
      ["Why is 'chemical energy from electrons' not enough to explain nuclear power stations?", ["the main energy change comes from nuclear binding, not electron rearrangement", "power stations have no electrons", "chemical reactions always increase proton number", "electron motion violates E = delta m c^2"], 0, "Nuclear energy is fundamentally a nucleus-level process."],
      ["Which statement best protects the lesson meaning of mass defect?", ["it is the mass equivalent of the energy released when nucleons bind", "it is the number of missing electrons", "it is the defect that makes isotopes radioactive only", "it is another name for atomic number"], 0, "Mass defect belongs to the binding-energy story."],
      ["A student compares two nuclei and chooses the one with the larger mass number as 'more energetic'. Why is this weak?", ["mass number alone does not reveal binding per nucleon or energy release", "mass number is always equal to atomic number", "energetic nuclei cannot be compared", "larger nuclei always absorb rather than release energy"], 0, "The lesson requires a binding argument, not a label-only guess."],
      ["Why is a small decrease in mass during nuclear binding physically important?", ["the equivalent energy can still be very large because c^2 is large", "small mass changes cannot matter", "the speed of light becomes part of the nucleus", "all the energy stays inside the atom and cannot be released"], 0, "Small mass changes can have large energy consequences."],
      ["What is the strongest way to describe a nucleus with low binding energy per nucleon compared with nearby alternatives?", ["its nucleons are held less tightly", "its electrons are more tightly bound", "it must be neutral", "it must be small"], 0, "Low binding energy per nucleon means weaker nuclear binding."],
      ["Why is it stronger to say 'products are more stable' rather than 'products are lighter' when explaining release of nuclear energy?", ["stability explains the energy direction through binding, while lighter alone does not", "lighter always means no nucleons remain", "lighter means chemical not nuclear", "lighter nuclei cannot be compared"], 0, "The stability argument is the physics reason."],
    ]),
    ...shortMany(hint, [
      { prompt: "Complete the sentence: when comparing nuclei of different sizes, use binding energy per ...", acceptedAnswers: exact("nucleon") },
      { prompt: "The missing mass in the nucleus is the mass equivalent of the nuclear ...", acceptedAnswers: exact("binding energy", "energy") },
      { prompt: "Fission or fusion release energy when the products have a higher binding energy per ...", acceptedAnswers: exact("nucleon") },
      { prompt: "A mass defect does not mean mass was destroyed; it means mass became ...", acceptedAnswers: exact("energy", "binding energy") },
      { prompt: "The phrase 'more tightly bound' is really a statement about nuclear ...", acceptedAnswers: exact("stability", "binding", "stability of the nucleus") },
      { prompt: "A higher total binding energy does not always mean higher stability because nucleus ... can differ.", acceptedAnswers: exact("size", "nucleon number", "number of nucleons") },
      { prompt: "Nuclear power is explained by changes inside the ... rather than by electron-shell chemistry.", acceptedAnswers: exact("nucleus") },
      { prompt: "A better explanation of energy release is that the products are more ... bound.", acceptedAnswers: exact("tightly", "more tightly") },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep the first split, the released neutrons, and the next fission event in one story.";
  return [
    ...mcMany(hint, [
      ["What is nuclear fission?", ["splitting a heavy nucleus into smaller nuclei", "joining light nuclei into a heavier nucleus", "removing electrons from an atom", "absorbing all radiation in a shield"], 0, "Fission is the splitting of a heavy nucleus."],
      ["What usually starts a fission event in a reactor fuel nucleus such as uranium-235?", ["absorption of a neutron", "absorption of an electron", "loss of a gamma ray only", "cooling below room temperature"], 0, "A neutron can make the heavy nucleus unstable enough to split."],
      ["Why can one fission event lead to more than one later event?", ["it can release neutrons that trigger further fission", "it creates extra electrons in the wires", "it reduces gravity inside the core", "it destroys the need for fuel"], 0, "Released neutrons can continue the chain."],
      ["What is a chain reaction?", ["a self-propagating series of fission events", "one nucleus changing into a neutral atom", "all radioactive decay stopping together", "one gamma ray crossing a metal plate"], 0, "A chain reaction means one event helps produce later events."],
      ["What is the job of control rods in a fission reactor?", ["absorb neutrons and reduce the reaction rate", "supply fresh electrons to the core", "increase the temperature of the turbine blades", "reflect light back into the fuel"], 0, "Control rods manage the neutron population."],
      ["What is critical mass?", ["the minimum amount of fissile material needed to sustain a chain reaction", "the mass at which a nucleus becomes electrically neutral", "the mass number of uranium only", "the point where all neutrons disappear"], 0, "Critical mass is about sustaining the chain reaction."],
      ["Which statement about fission products is strongest?", ["the products are smaller nuclei and released neutrons", "the products are always only electrons", "the products must be one single stable nucleus", "the products are chemical compounds"], 0, "Fission gives smaller nuclei plus neutrons and energy."],
      ["Why is a moderator used in many reactors?", ["to slow neutrons so they are more likely to cause further fission", "to cool the turbine directly", "to absorb all gamma radiation", "to supply oxygen to the fuel"], 0, "Slow neutrons are often more effective for sustaining thermal fission."],
      ["Which outcome best describes an uncontrolled chain reaction?", ["more than one neutron per event on average causes further fission", "all neutrons are absorbed immediately", "the fuel becomes chemically inert", "the core stops producing heat"], 0, "If too many neutrons continue the chain, the reaction grows too quickly."],
      ["Which fuel is commonly used as a fissile material in school-level reactor discussions?", ["uranium-235", "helium-4", "carbon-12", "oxygen-16"], 0, "Uranium-235 is the standard example."],
      ["Why is fission not explained well by saying 'the nucleus just breaks apart'?", ["the neutron-trigger and chain logic matter", "nuclei cannot split", "fission is only an electron effect", "the products are always the same"], 0, "The lesson mechanism is about trigger plus neutron multiplication, not a vague breaking slogan."],
      ["Why does fission release energy?", ["the products are more tightly bound than the original heavy nucleus", "all neutrons lose charge", "the atomic number becomes zero", "mass number is not conserved"], 0, "Energy release follows the binding-energy argument."],
    ]),
    ...shortMany(hint, [
      { prompt: "Fission usually begins when a heavy nucleus absorbs a ...", acceptedAnswers: exact("neutron", "a neutron") },
      { prompt: "A chain reaction continues because fission can release more ...", acceptedAnswers: exact("neutrons", "neutron") },
      { prompt: "Control rods reduce the chain reaction by absorbing ...", acceptedAnswers: exact("neutrons", "neutron") },
      { prompt: "Critical mass means the minimum amount of fissile material needed to sustain a chain ...", acceptedAnswers: exact("reaction", "chain reaction") },
      { prompt: "A moderator is used to ... the neutrons in many reactors.", acceptedAnswers: exact("slow", "slow down") },
      { prompt: "Fission is the splitting of a ... nucleus.", acceptedAnswers: exact("heavy", "large", "heavy nucleus") },
      { prompt: "In a controlled reactor, about ... released neutron per fission should continue the chain on average.", acceptedAnswers: exact("one", "1") },
      { prompt: "Fission products are generally smaller ... plus released neutrons.", acceptedAnswers: exact("nuclei", "smaller nuclei") },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Check what happens to the released neutrons before deciding whether the chain grows, stays steady, or dies out.";
  return [
    ...mcMany(hint, [
      ["Why is it stronger to describe reactor control in terms of neutron population rather than just temperature?", ["neutron balance decides whether further fission events occur", "temperature is unrelated to reactors", "control rods only cool the water", "heat alone starts every fission event"], 0, "The reaction rate is governed by what neutrons do next."],
      ["A reactor is steady when each fission event effectively leads to what average outcome?", ["about one further fission event", "no further fission event", "three further fission events", "a complete loss of all neutrons"], 0, "Steady critical operation means the chain neither grows nor dies away."],
      ["Why is 'control rods stop radiation' a weak explanation of their main role?", ["their main role is to absorb neutrons and control the chain reaction", "control rods create extra fuel", "control rods are outside the core only", "radiation is not produced in fission"], 0, "Control rods are about neutron control first."],
      ["Why does slowing neutrons help many uranium-235 chain reactions?", ["slow neutrons are more likely to be captured by fissile nuclei", "slow neutrons gain more charge", "slow neutrons become gamma rays", "slow neutrons always leave the reactor"], 0, "The moderator improves the chance of further fission by changing neutron speed."],
      ["A student says, 'Any number of released neutrons means the chain reaction must always run away.' What is the best correction?", ["what matters is how many of those neutrons actually cause later fission", "released neutrons cannot cause fission", "chain reactions do not involve neutrons", "all released neutrons are absorbed by electrons"], 0, "Chain growth depends on effective multiplication, not raw release count alone."],
      ["Why is critical mass a geometry-and-loss issue as well as a fuel-amount issue?", ["too small a sample lets too many neutrons escape before causing new fission", "only mass number matters", "geometry never affects neutron escape", "all fissile samples are automatically critical"], 0, "A small or poorly arranged sample can lose neutrons too easily."],
      ["Why is a nuclear weapon not just a 'large reactor'?", ["its chain reaction is designed to grow extremely rapidly rather than remain controlled", "reactors do not use neutrons", "weapons use only chemical fuel", "reactors cannot release energy"], 0, "The control objective is completely different."],
      ["Why is it stronger to say 'fission can be controlled in a reactor' than 'fission is always dangerous'?", ["the neutron chain can be managed with design features such as moderator and control rods", "fission produces no hazard at all", "danger depends only on the fuel color", "control rods make all waste disappear"], 0, "The controlled-chain mechanism is the key distinction."],
      ["If too many neutrons escape the fuel before causing further fission, what happens?", ["the chain reaction dies away", "the chain reaction automatically runs away", "the atomic number doubles", "the fuel becomes fusion fuel"], 0, "Neutron loss can stop the chain."],
      ["Why is it weak to explain reactor output by saying only 'uranium is hot'?", ["the plant output depends on a controlled chain reaction and staged energy transfer", "uranium cannot release energy", "temperature is the only useful reactor quantity", "heat and neutron balance are unrelated"], 0, "Good explanations include trigger, chain, control, and energy-transfer stages."],
      ["Which statement best protects the meaning of critical mass?", ["it is the threshold needed to sustain a chain reaction, not the threshold for any single nucleus to split", "it is the mass number of the fuel nucleus", "it is the exact mass of one neutron", "it is the mass at which a reactor becomes a fusion device"], 0, "Critical mass is a system threshold for the chain, not a property of one nucleus alone."],
      ["Why does fission fuel still need cooling even when the chain reaction is controlled?", ["energy release in the core still becomes thermal energy that must be transferred away", "controlled fission produces no heat", "cooling is only for the control rods", "cooling increases proton number"], 0, "Control does not mean zero heat output."],
    ]),
    ...shortMany(hint, [
      { prompt: "A steady reactor is achieved when about ... neutron from each fission causes the next one on average.", acceptedAnswers: exact("one", "1") },
      { prompt: "Critical mass is about sustaining a chain ...", acceptedAnswers: exact("reaction", "chain reaction") },
      { prompt: "If too many neutrons escape, the fission chain ...", acceptedAnswers: exact("dies away", "stops", "slows and dies away") },
      { prompt: "A moderator helps by ... the neutrons.", acceptedAnswers: exact("slowing", "slowing down") },
      { prompt: "Control rods mainly control the neutron ...", acceptedAnswers: exact("population", "number", "population in the core") },
      { prompt: "Runaway behavior happens when more than ... effective neutron continues the chain on average.", acceptedAnswers: exact("one", "1") },
      { prompt: "The key follow-up question after any fission event is what happens to the released ...", acceptedAnswers: exact("neutrons", "neutron") },
      { prompt: "A reactor is not just a hot fuel block; it is a controlled chain-reaction ...", acceptedAnswers: exact("system", "plant system", "system.") },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Keep light nuclei, repulsion, and the required conditions in one explanation.";
  return [
    ...mcMany(hint, [
      ["What is nuclear fusion?", ["joining light nuclei to form a heavier nucleus", "splitting a heavy nucleus into two smaller ones", "removing an electron from an atom", "absorbing all neutrons in a reactor"], 0, "Fusion joins light nuclei."],
      ["Why is very high temperature needed for fusion?", ["the nuclei must overcome electrostatic repulsion", "high temperature removes all neutrons", "temperature changes atomic number directly", "fusion only works in solids"], 0, "High temperature helps nuclei collide hard enough to get close despite repulsion."],
      ["Where does fusion naturally occur on a huge scale?", ["in stars", "in household batteries", "inside transformers", "inside ice crystals"], 0, "Stars are powered by fusion."],
      ["Which nuclei are used as the main school-level examples of fusion fuel?", ["light nuclei such as hydrogen isotopes", "heavy nuclei such as uranium", "electrons and protons in wires", "argon and neon only"], 0, "Fusion uses light nuclei."],
      ["Why does fusion release energy?", ["the product nucleus is more tightly bound per nucleon", "electrons are destroyed", "charge is not conserved", "the number of nuclei always increases"], 0, "The binding-energy argument explains the release."],
      ["Which statement about repulsion in fusion is strongest?", ["positive nuclei repel one another before they get close enough for the strong force to bind them", "nuclei attract electrically from far away", "repulsion is irrelevant in fusion", "only neutrons can fuse"], 0, "Electrostatic repulsion is the main barrier."],
      ["Why is fusion harder to start than fission?", ["light positive nuclei must first overcome repulsion", "fusion uses no energy at all", "fission does not involve nuclei", "fusion can occur at room temperature only"], 0, "Starting fusion requires extreme conditions."],
      ["Which product is commonly named in simple hydrogen fusion stories?", ["helium", "uranium", "chlorine", "copper"], 0, "Helium is the standard simple fusion product."],
      ["What is the strongest description of fusion fuel?", ["light nuclei that can join to form a heavier nucleus", "any radioactive material", "only gamma rays", "used control rods"], 0, "Fusion fuel is defined by the nuclei that can join."],
      ["Why is fusion considered attractive as an energy source?", ["it can release large energy from light nuclei and does not use the same long-lived fission fuel cycle", "it produces no heat", "it requires no extreme conditions", "it uses only electrons as fuel"], 0, "The energy potential is large, though the engineering is difficult."],
      ["Which statement about fusion in stars is strongest?", ["high temperature and pressure in stellar cores allow light nuclei to fuse", "stars are powered by fission only", "stellar fusion needs control rods", "fusion in stars happens because electrons repel"], 0, "Stars supply the needed conditions."],
      ["Which process is the reverse pairing of fission at the level of event type?", ["fusion", "ionisation", "evaporation", "reflection"], 0, "Fusion joins nuclei whereas fission splits them."],
    ]),
    ...shortMany(hint, [
      { prompt: "Fusion joins ... nuclei.", acceptedAnswers: exact("light", "light nuclei") },
      { prompt: "The natural large-scale site of fusion is a ...", acceptedAnswers: exact("star", "stars", "a star") },
      { prompt: "Very high temperature is needed to overcome electrostatic ...", acceptedAnswers: exact("repulsion") },
      { prompt: "Fusion can release energy because the product nucleus is more tightly ...", acceptedAnswers: exact("bound", "bound per nucleon") },
      { prompt: "A common simple fusion product is ...", acceptedAnswers: exact("helium") },
      { prompt: "Hydrogen isotopes are examples of fusion ...", acceptedAnswers: exact("fuel", "fuels") },
      { prompt: "Fusion is harder to start than fission because positive nuclei ... one another.", acceptedAnswers: exact("repel") },
      { prompt: "In stars, high temperature and ... help fusion occur.", acceptedAnswers: exact("pressure", "high pressure") },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Explain fusion through the barrier and the binding change, not by calling it 'fission backwards'.";
  return [
    ...mcMany(hint, [
      ["Why is 'fusion is just fission backwards' a weak explanation?", ["fusion also requires extreme conditions to overcome electrostatic repulsion", "fusion and fission are always identical in every detail", "fusion does not involve nuclei", "fission uses no binding-energy change"], 0, "Fusion has its own entry-condition logic, not just the opposite event description."],
      ["Why does a fusion reactor need confinement as well as high temperature?", ["the hot fuel must be kept dense and together long enough for useful fusion collisions", "confinement increases electron number only", "fusion removes the need for collisions", "confinement changes hydrogen into uranium"], 0, "Useful fusion needs enough successful collisions in a controlled volume."],
      ["A student says, 'If nuclei repel, fusion must be impossible.' What is the best reply?", ["very high collision energy can let nuclei get close enough for the strong force to act", "repulsion means the strong force does not exist", "fusion works only for neutral atoms", "repulsion is cancelled by electrons in every case"], 0, "The barrier is difficult, not impossible."],
      ["Why is stellar fusion easier to justify with temperature and pressure together rather than temperature alone?", ["the rate of successful collisions depends on both energetic collisions and dense conditions", "pressure is unrelated to star cores", "temperature alone guarantees every collision fuses", "pressure changes atomic number directly"], 0, "Fusion needs both collision energy and sufficient interaction opportunities."],
      ["Why does fusion of light nuclei release energy rather than absorb it in the simple lesson model?", ["the products lie in a more tightly bound state per nucleon", "the products always have fewer nucleons", "energy release happens only because electrons are lost", "fusion ignores mass-energy equivalence"], 0, "The same binding-energy argument used elsewhere explains the direction."],
      ["Why is it weak to judge fusion fuel only by its temperature requirement?", ["the explanation also needs product binding and collision/confinement logic", "temperature is never relevant", "all high-temperature matter fuses automatically", "fusion is a chemical process"], 0, "A full explanation includes barrier plus outcome."],
      ["Which statement best separates fusion from a reactor-fission lesson?", ["fusion joins light nuclei instead of managing a neutron-driven chain reaction", "fusion is controlled entirely by control rods", "fusion uses moderators to slow neutrons", "fusion cannot release energy"], 0, "Fission centers on neutron multiplication; fusion does not."],
      ["Why do hydrogen isotopes make more sense as fusion examples than very heavy nuclei?", ["light nuclei are the ones that can move toward greater binding per nucleon by joining", "heavy nuclei have no protons", "light nuclei are not repulsive", "heavy nuclei always fuse more easily"], 0, "Fusion examples need the right binding-direction story."],
      ["What is the strongest reason to mention stars in a fusion lesson?", ["they are the natural proof that sustained fusion can occur under the right conditions", "they show that fusion needs control rods", "they prove fusion is chemical", "they remove the need to explain repulsion"], 0, "Stars anchor fusion to a real physical context."],
      ["Why is it stronger to say 'fusion requires extreme conditions' rather than 'fusion is impossible on Earth'?", ["the challenge is engineering the required conditions, not a violation of physics", "Earth has no nuclei", "fusion happens only in fiction", "stars use a different force from all reactors"], 0, "Fusion difficulty is practical and technological, not a contradiction of the theory."],
      ["Which statement best protects the lesson meaning of electrostatic repulsion?", ["it is the barrier that nuclei must overcome before the strong force can bind them", "it is the force that permanently prevents all nuclear change", "it is a chemical-bond effect only", "it occurs only after fusion has already happened"], 0, "Repulsion matters before close approach."],
      ["Why is it stronger to explain fusion energy with both E = delta m c^2 and tighter binding?", ["the binding argument explains the direction, and the mass-energy relation explains the size of the energy change", "only one of the two can ever be used", "E = delta m c^2 replaces the need to discuss products", "binding energy makes mass-energy equivalence false"], 0, "The two statements complement each other."],
    ]),
    ...shortMany(hint, [
      { prompt: "Fusion is not just fission backwards because it must first overcome electrostatic ...", acceptedAnswers: exact("repulsion") },
      { prompt: "Useful fusion needs the fuel hot and also sufficiently ... or confined.", acceptedAnswers: exact("dense", "dense enough") },
      { prompt: "Stars matter in this lesson because they are real examples of sustained ...", acceptedAnswers: exact("fusion") },
      { prompt: "The strong force can bind nuclei only when they get sufficiently ... together.", acceptedAnswers: exact("close", "close together") },
      { prompt: "Fusion fuel examples usually use hydrogen ...", acceptedAnswers: exact("isotopes", "isotope") },
      { prompt: "Fusion releases energy when the products are more tightly bound per ...", acceptedAnswers: exact("nucleon") },
      { prompt: "High temperature alone is not the whole story; collision conditions and ... also matter.", acceptedAnswers: exact("confinement", "pressure", "density") },
      { prompt: "The main physical barrier to starting fusion is the electrostatic repulsion between positive ...", acceptedAnswers: exact("nuclei", "nucleus", "nuclear charges") },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Separate chain control, heat transfer, and electricity generation.";
  return [
    ...mcMany(hint, [
      ["What is the main job of control rods in a thermal reactor?", ["absorb neutrons and control the fission rate", "drive the turbine directly", "increase the output voltage of the generator", "cool the condenser water"], 0, "Control rods manage the chain reaction by neutron absorption."],
      ["What is the main job of the coolant?", ["transfer thermal energy away from the reactor core", "set the atomic number of the fuel", "absorb all gamma radiation", "supply fresh fuel rods"], 0, "Coolant carries heat to later stages."],
      ["What is the main job of the moderator?", ["slow neutrons so further fission is more likely", "turn steam directly into electricity", "store long-term radioactive waste", "increase the grid frequency"], 0, "Moderator and coolant are not the same role."],
      ["Which device is turned by steam in a nuclear power station?", ["turbine", "control rod", "fuel rod", "moderator block"], 0, "The steam drives a turbine."],
      ["Which component converts mechanical rotation into electrical energy?", ["generator", "moderator", "control rod", "reactor vessel"], 0, "The turbine drives the generator."],
      ["Which statement about reactor fuel rods is strongest?", ["they contain fissile fuel that undergoes controlled fission", "they are used only to absorb neutrons", "they cool the condenser water", "they are the same as control rods"], 0, "Fuel rods and control rods are different components."],
      ["Which energy-transfer sequence is best?", ["nuclear -> thermal -> kinetic -> electrical", "electrical -> nuclear -> thermal -> sound", "chemical -> nuclear -> light -> electrical", "kinetic -> nuclear -> thermal -> gravitational"], 0, "The reactor plant has several linked stages."],
      ["Why is shielding used around the reactor core?", ["to reduce exposure to ionising radiation", "to create more neutrons", "to replace the moderator", "to increase turbine speed"], 0, "Shielding is a protection feature."],
      ["What happens to the chain reaction if control rods are inserted further?", ["the reaction rate falls", "the turbine speed must automatically double", "the moderator disappears", "the fuel becomes fusion fuel"], 0, "More neutron absorption lowers the reaction rate."],
      ["Why is a condenser used after the turbine in many power stations?", ["to turn steam back into water for reuse", "to absorb neutrons in the core", "to increase the atomic number of the fuel", "to create gamma rays"], 0, "Condensing closes the water-steam loop."],
      ["Which statement best distinguishes moderator from coolant?", ["moderator changes neutron speed; coolant carries thermal energy", "moderator generates electricity; coolant absorbs neutrons", "moderator is fuel; coolant is waste", "moderator and coolant always mean the same part"], 0, "The two roles must stay separate."],
      ["Why is the reactor described as a system rather than just a fuel source?", ["electrical output depends on control, heat transfer, and generation stages working together", "only the fuel rods matter physically", "power stations do not use turbines", "the coolant alone decides the whole output"], 0, "The plant is a linked system."],
    ]),
    ...shortMany(hint, [
      { prompt: "Control rods mainly absorb ...", acceptedAnswers: exact("neutrons", "neutron") },
      { prompt: "The coolant transfers ... energy away from the core.", acceptedAnswers: exact("thermal", "heat", "thermal energy") },
      { prompt: "The moderator is used to ... the neutrons.", acceptedAnswers: exact("slow", "slow down") },
      { prompt: "Steam turns the ...", acceptedAnswers: exact("turbine") },
      { prompt: "The generator produces ... energy.", acceptedAnswers: exact("electrical", "electrical energy") },
      { prompt: "The energy path in a nuclear power station includes nuclear, thermal, kinetic, and ... energy.", acceptedAnswers: exact("electrical") },
      { prompt: "A condenser turns steam back into ...", acceptedAnswers: exact("water") },
      { prompt: "Shielding reduces exposure to ionising ...", acceptedAnswers: exact("radiation") },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Ask which part controls the reaction, which part moves heat, and which part generates electricity.";
  return [
    ...mcMany(hint, [
      ["Why is 'the reactor makes electricity directly' a weak statement?", ["the reactor core first releases heat, and electricity appears only after turbine-generator stages", "the generator is inside the fuel rods", "electricity is produced only by the moderator", "control rods create the grid output"], 0, "The plant output is staged, not direct from fuel to plug."],
      ["A student calls the moderator 'the thing that cools the reactor.' What is the best correction?", ["the moderator mainly slows neutrons, while coolant transfers heat away", "the moderator and coolant are identical by definition", "moderator means the turbine housing", "coolant means neutron absorber"], 0, "This lesson depends on keeping the component roles distinct."],
      ["Why can a reactor still become dangerous if the coolant system fails even when the fuel is not increasing its fission rate?", ["heat can still build up because thermal energy is not being removed effectively", "without coolant the chain reaction becomes fusion instantly", "coolant is irrelevant once fission is controlled", "temperature and heat transfer do not matter in a reactor"], 0, "Control and cooling are both necessary."],
      ["Why is it stronger to describe control rods as managing neutron economy rather than temperature alone?", ["the reaction rate changes because fewer neutrons remain available to continue the chain", "control rods never affect the chain reaction", "temperature is always fixed in the core", "all reactor design is just about steam pressure"], 0, "Neutron balance is the first-cause explanation."],
      ["Why must a power-station answer include turbine and generator as separate stages?", ["steam rotation and electrical generation are different physical processes", "the turbine is only decoration", "the generator is the same as the condenser", "the turbine changes mass defect directly"], 0, "Mechanical-to-electrical conversion is a distinct stage."],
      ["What is the strongest reason to keep fuel rods and control rods separate in explanations?", ["one provides the fissile material while the other manages the neutron population", "both are the same part under different names", "fuel rods cool the core while control rods carry steam", "control rods are only outside the reactor building"], 0, "Mixing the two destroys the system logic."],
      ["Why is a reactor best described as a controlled chain-reaction heat source rather than simply a 'nuclear engine'?", ["that wording keeps the neutron-control and heat-transfer steps visible", "it avoids mentioning any real physics", "reactors produce only kinetic energy", "engines never use systems"], 0, "The lesson asks for cause-and-effect, not slogans."],
      ["Which explanation best matches the role of shielding?", ["it protects workers and the surroundings by reducing radiation exposure", "it keeps steam pressure high in the turbine only", "it slows neutrons for fission", "it increases electrical voltage"], 0, "Shielding is a protection measure, not a chain-control part."],
      ["Why is waste handling part of a reactor-system discussion rather than a separate social issue only?", ["radioactive materials remain after power generation and still require controlled management", "reactors produce no radioactive products", "all waste disappears in the condenser", "waste management is unrelated to nuclear physics"], 0, "A complete reactor story includes outputs and by-products."],
      ["If control rods are withdrawn too far, why is the best first explanation about reaction rate rather than turbine speed?", ["the primary change is that more neutrons continue the chain reaction", "turbine speed determines neutron production", "the generator controls the core directly", "withdrawn rods lower the neutron population"], 0, "Reactor changes propagate outward from chain control, not backward from the turbine."],
      ["Why is it stronger to say 'coolant transfers thermal energy' rather than 'coolant removes all danger'?", ["heat transfer is one safety-critical role, but it does not erase all nuclear hazards", "coolant absorbs every kind of radiation completely", "coolant replaces shielding and waste storage", "coolant changes uranium into harmless gas"], 0, "Accurate system language matters."],
      ["Why does a nuclear power station still resemble other thermal power stations after the reactor stage?", ["steam, turbine, and generator stages are familiar thermal-power stages", "all later stages become chemical", "nuclear stations do not use moving parts", "the turbine runs on neutrons directly"], 0, "The difference is mainly the heat source, not the turbine-generator principle."],
    ]),
    ...shortMany(hint, [
      { prompt: "The moderator and the coolant should not be merged because one controls neutron speed and the other transfers ...", acceptedAnswers: exact("heat", "thermal energy") },
      { prompt: "Electricity is produced after the turbine drives the ...", acceptedAnswers: exact("generator") },
      { prompt: "Fuel rods provide fissile fuel; control rods manage the neutron ...", acceptedAnswers: exact("population", "number of neutrons", "population in the core") },
      { prompt: "A reactor is best described first as a controlled chain-reaction ... source.", acceptedAnswers: exact("heat", "thermal", "heat source") },
      { prompt: "Shielding reduces radiation ...", acceptedAnswers: exact("exposure") },
      { prompt: "If heat is not removed effectively, the core can ... up.", acceptedAnswers: exact("heat", "overheat", "heat up") },
      { prompt: "The familiar non-nuclear stages after the core are steam, turbine, and ...", acceptedAnswers: exact("generator", "electric generator") },
      { prompt: "Waste handling remains part of the reactor story because some products remain ...", acceptedAnswers: exact("radioactive", "radioactive for long periods", "active") },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Choose the isotope by the job requirements, especially half-life and radiation type.";
  return [
    ...mcMany(hint, [
      ["Why are radioisotopes useful in medicine and industry?", ["their decay can be detected and matched to a task", "they are always completely harmless", "they do not emit radiation", "they remove the need for safety procedures"], 0, "Applications depend on useful, measurable decay properties."],
      ["Which property is especially important when choosing a medical tracer?", ["half-life", "color of the container", "number of electrons only", "melting point of the shielding"], 0, "The isotope should last long enough for the test but not longer than necessary."],
      ["Why is a short half-life often preferred for a medical tracer?", ["it reduces long-term exposure after the test", "it makes the isotope impossible to detect", "it stops the need for diagnosis", "it increases the atomic number"], 0, "Shorter half-life helps reduce unnecessary dose after use."],
      ["Why is gamma radiation often useful for imaging from outside the body?", ["it can leave the body and be detected externally", "it is always absorbed completely by skin", "it cannot travel through air", "it changes the patient's proton number"], 0, "External detection needs radiation that can escape the body."],
      ["Why might beta or gamma radiation be useful for thickness monitoring in industry?", ["the amount transmitted changes with the material thickness", "they always stop at the first surface", "they never interact with matter", "their half-life becomes zero"], 0, "Transmission changes can reveal thickness differences."],
      ["What is a radioactive tracer?", ["a radioisotope used to follow the path or distribution of a substance", "a control rod with a warning label", "a permanent magnet used in imaging", "a cooled uranium fuel rod"], 0, "A tracer lets us track movement or location."],
      ["Why is a very long half-life often a poor choice for a temporary medical procedure?", ["the patient would remain radioactive for longer than needed", "the isotope would become invisible", "half-life does not matter in medicine", "long half-life means the isotope emits no radiation"], 0, "Task duration and exposure should be matched."],
      ["Which use best matches a sterilising radiation source?", ["killing microbes on equipment or food packaging", "controlling neutron speed in a reactor", "increasing the voltage in a transformer", "providing chemical fuel for a motor"], 0, "Sterilisation is a standard radioisotope application."],
      ["Why is detectability important for tracer work?", ["the emitted radiation must be measurable outside or around the system studied", "the isotope should never decay", "the isotope must be electrically neutral only", "the isotope should stop all radiation"], 0, "A tracer is useful only if its signal can be picked up."],
      ["Which statement about application choice is strongest?", ["the best isotope depends on both half-life and radiation type", "only the atomic symbol matters", "the strongest source is always best", "all radioisotopes are equally suitable"], 0, "Task matching is the key lesson idea."],
      ["Why is cobalt-60 discussed in school-level radiotherapy contexts?", ["its radiation can be used to damage cancer cells in a controlled way", "it produces electricity directly inside the body", "it is harmless enough to ignore shielding", "it cannot emit gamma radiation"], 0, "Radiotherapy uses ionising radiation to target harmful tissue."],
      ["Why are safety procedures still needed even when a radioisotope is useful?", ["the same ionising radiation that makes it useful can also be hazardous", "useful sources cannot cause harm", "half-life removes all risk immediately", "applications make contamination impossible"], 0, "Usefulness and hazard must be considered together."],
    ]),
    ...shortMany(hint, [
      { prompt: "A medical tracer should usually have a relatively ... half-life.", acceptedAnswers: exact("short", "shorter", "short half-life") },
      { prompt: "For imaging from outside the body, ... radiation is often preferred because it can escape and be detected.", acceptedAnswers: exact("gamma", "gamma radiation") },
      { prompt: "A tracer is used to ... the movement or distribution of a substance.", acceptedAnswers: exact("trace", "track", "follow") },
      { prompt: "Industrial thickness monitoring depends on how much radiation is ... through the material.", acceptedAnswers: exact("transmitted", "passed", "let through") },
      { prompt: "Application choice depends strongly on half-life and radiation ...", acceptedAnswers: exact("type", "types") },
      { prompt: "Sterilisation uses radiation to kill ...", acceptedAnswers: exact("microbes", "microorganisms", "bacteria") },
      { prompt: "A very long half-life can be a poor temporary medical choice because exposure lasts too ...", acceptedAnswers: exact("long", "longer") },
      { prompt: "Useful radioisotopes still need safety ...", acceptedAnswers: exact("controls", "procedures", "precautions") },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Match half-life and radiation type to the task before choosing the isotope.";
  return [
    ...mcMany(hint, [
      ["A hospital needs an isotope for a short imaging procedure. Which choice is strongest?", ["gamma emitter with a short half-life", "alpha emitter with a very long half-life", "any isotope with the largest possible activity and no timing check", "beta emitter chosen only by chemical symbol"], 0, "Imaging needs detectable radiation and limited duration."],
      ["Why is 'choose the strongest source available' a weak rule for medical applications?", ["the source must fit the task and keep unnecessary exposure low", "stronger always means safer", "activity is the only property that matters", "half-life has no effect on safety"], 0, "Application choice is about suitability, not brute strength."],
      ["Why can gamma radiation be preferable to alpha radiation for external imaging?", ["gamma can leave the body and reach the detector, whereas alpha cannot", "alpha is always more penetrating", "gamma cannot be detected", "alpha never ionises"], 0, "Imaging from outside requires exit and detection."],
      ["Why is it weak to choose a tracer by half-life alone?", ["radiation type and detectability also matter", "half-life never matters", "chemical state becomes irrelevant", "the isotope must always be alpha emitting"], 0, "A good choice combines more than one physical requirement."],
      ["An isotope used to trace flow in a pipe should be detectable without needing to dismantle the pipe. What property matters most first?", ["radiation that can be detected from outside", "very high neutron absorption only", "the isotope must be chemically inert in every case", "the isotope must have the longest half-life available"], 0, "External detection is the first practical constraint."],
      ["Why is it stronger to say 'the isotope should last just long enough for the job' rather than 'the shortest half-life is always best'?", ["the source must still remain active throughout the measurement or treatment", "very short half-life sources are always easiest to use", "timing never matters", "longer half-life always means less hazard"], 0, "The lesson is about matching, not one extreme rule."],
      ["Why can radiotherapy use more penetrating radiation than a simple tracer application?", ["the aim is controlled damage to harmful tissue rather than just tracking position", "radiotherapy never uses ionising radiation", "therapy requires a source that cannot be detected", "treatment is unrelated to dose"], 0, "Different jobs justify different radiation choices."],
      ["Why is background subtraction still relevant in some isotope measurements?", ["detectors may register environmental radiation as well as the source signal", "background radiation stops the source decaying", "background subtraction changes half-life", "background is only a chemical impurity"], 0, "Good measurements separate source counts from background counts."],
      ["A food-packaging plant needs to sterilise sealed items without heating them strongly. Which nuclear idea is most relevant?", ["ionising radiation can kill microbes without direct heating like an oven", "sterilisation works by increasing atomic number", "the package must become a reactor", "all radiation types are equally penetrating and equally safe"], 0, "The application uses ionising effects, not simple warming."],
      ["Why is it weak to describe all medical uses of radioisotopes as 'scans'?", ["some applications are for treatment rather than imaging", "radioisotopes are never used for scans", "treatment uses no radiation", "all isotopes give identical biological effects"], 0, "The module includes imaging, tracing, and treatment roles."],
      ["Why is it stronger to justify an industrial gauge by transmission change rather than by the source label alone?", ["thickness information comes from how the detected signal changes after passing through the material", "labels always determine outcome", "transmission is unrelated to thickness", "industrial gauges do not use radiation"], 0, "The physics mechanism should stay visible."],
      ["Which statement best protects the lesson meaning of a tracer?", ["it is chosen so its radioactive signal marks where the substance goes", "it is chosen only for maximum penetrating power", "it is the same as reactor fuel", "it is a source used only for shielding tests"], 0, "Tracer means follow the substance using a detectable signal."],
    ]),
    ...shortMany(hint, [
      { prompt: "A good tracer is chosen to be detectable and to have a half-life matched to the ...", acceptedAnswers: exact("task", "job", "application") },
      { prompt: "External imaging often prefers ... radiation because it can leave the body.", acceptedAnswers: exact("gamma") },
      { prompt: "The shortest possible half-life is not always best because the source still has to last for the ...", acceptedAnswers: exact("test", "procedure", "measurement", "job") },
      { prompt: "Background counts should be ... from the measured count rate before interpreting some source data.", acceptedAnswers: exact("subtracted") },
      { prompt: "Radiotherapy differs from tracing because the aim is controlled tissue ...", acceptedAnswers: exact("damage", "destruction", "cell damage") },
      { prompt: "Industrial gauges use changes in detected ... to infer thickness.", acceptedAnswers: exact("radiation", "count rate", "signal") },
      { prompt: "A tracer must be chosen for the task rather than by source ... alone.", acceptedAnswers: exact("strength", "activity") },
      { prompt: "Useful radioisotope selection is a property-matching problem, not a label-only ...", acceptedAnswers: exact("guess", "choice") },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Pair every benefit with its hazard and control.";
  return [
    ...mcMany(hint, [
      ["What is ionising radiation capable of doing in living tissue?", ["damaging cells by ionising atoms and molecules", "cooling the tissue automatically", "removing all neutrons from the body", "changing the body into a conductor"], 0, "Ionisation in tissue is the core hazard."],
      ["What is contamination?", ["radioactive material getting onto or into something", "being near a source without contact", "a neutral atom becoming an ion in a field", "coolant entering the turbine"], 0, "Contamination means radioactive matter is present in or on the object."],
      ["What is irradiation?", ["exposure to radiation from a source without the source necessarily being on or in the object", "radioactive material entering the bloodstream only", "a chain reaction in tissue", "shielding a source with paper"], 0, "Irradiation and contamination are different ideas."],
      ["Which radiation is stopped most easily by paper or skin?", ["alpha", "beta", "gamma", "all three equally"], 0, "Alpha is highly ionising but weakly penetrating."],
      ["Which radiation usually needs the thickest shielding?", ["gamma", "alpha", "beta", "none of them"], 0, "Gamma is the most penetrating of the three school-level types."],
      ["Why is internal alpha contamination especially dangerous?", ["alpha is strongly ionising once inside the body", "alpha can never ionise tissue", "alpha has the greatest penetration through lead", "alpha does not count as radiation"], 0, "Low penetration helps externally but not internally."],
      ["Why is nuclear waste management part of the technology story?", ["some waste remains radioactive for long periods and needs secure handling", "waste is chemically inert and harmless immediately", "all waste disappears when cooled", "waste affects only the turbine blades"], 0, "Long-term management is a real nuclear issue."],
      ["Which practice reduces exposure according to the standard safety approach?", ["using shielding and minimizing time near the source", "holding the source closer for a shorter look only", "ignoring background radiation", "removing the labels from the container"], 0, "Shielding, time, and distance are central control ideas."],
      ["Why are nuclear technologies still used despite hazards?", ["they offer real benefits in energy, medicine, and industry when managed well", "they are completely risk-free", "hazards disappear if a source is useful", "there are no alternatives to every nuclear use"], 0, "The lesson is about balanced judgment, not slogans."],
      ["Why is it weak to say 'gamma is the most dangerous' without context?", ["danger depends on exposure route, shielding, and whether the source is inside or outside the body", "gamma is never hazardous", "alpha is harmless in every situation", "all radiation has identical effects"], 0, "Hazard depends on circumstances, not one absolute label."],
      ["What is background radiation?", ["the low-level radiation always present in the environment", "only the radiation from one labelled source", "radiation created only inside reactors", "the same as contamination"], 0, "Background is always there from natural and human-made sources."],
      ["Why does shielding not mean the source has stopped being radioactive?", ["shielding reduces the radiation reaching you, but the source still emits radiation", "shielding changes the isotope into a stable atom immediately", "shielding stops nuclear decay itself", "shielding removes all contamination automatically"], 0, "Control does not erase the source physics."],
    ]),
    ...shortMany(hint, [
      { prompt: "Radioactive material getting into or onto an object is called ...", acceptedAnswers: exact("contamination") },
      { prompt: "Exposure to radiation from a source without the source entering the body is called ...", acceptedAnswers: exact("irradiation") },
      { prompt: "Alpha radiation is very strongly ...", acceptedAnswers: exact("ionising", "ionizing") },
      { prompt: "Gamma radiation usually needs thick ... for shielding.", acceptedAnswers: exact("lead", "concrete", "shielding", "lead or concrete") },
      { prompt: "Nuclear waste can remain radioactive for a very ... time.", acceptedAnswers: exact("long", "long time", "long period") },
      { prompt: "Time, distance, and ... are three standard ideas for reducing exposure.", acceptedAnswers: exact("shielding") },
      { prompt: "Background radiation is always present in the ...", acceptedAnswers: exact("environment") },
      { prompt: "Ionising radiation can damage living ...", acceptedAnswers: exact("tissue", "cells", "living tissue", "cells and tissue") },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Judge the application with benefit, hazard, and control in the same answer.";
  return [
    ...mcMany(hint, [
      ["Why is 'all nuclear technology is bad because radiation is dangerous' a weak judgment?", ["it ignores the real benefits and the control methods that can reduce risk", "radiation can never cause harm", "benefits do not matter in physics", "all hazards vanish in power stations"], 0, "The module asks for balanced evidence-based judgment."],
      ["Why is 'nuclear technology is safe because shielding exists' also a weak judgment?", ["shielding reduces risk but does not remove waste, contamination, or misuse problems", "shielding makes decay stop", "shielding eliminates all need for procedures", "shielding removes background radiation worldwide"], 0, "Controls help, but they do not erase all hazard."],
      ["Why is internal contamination often judged differently from external irradiation?", ["the source can continue irradiating nearby tissue from inside the body", "internal sources are always harmless", "irradiation and contamination are identical", "internal contamination affects only clothing"], 0, "Internal location changes the exposure pattern."],
      ["Why is it weak to rank alpha, beta, and gamma by one fixed danger order in every case?", ["penetration and ionisation matter differently in different exposure situations", "all three behave identically", "alpha is always safest and gamma always harmless", "beta is not ionising"], 0, "Context matters."],
      ["A source is sealed in a lead container and kept far away. What is the strongest statement?", ["risk is reduced, but the source is still radioactive and still needs handling rules", "the source is no longer radioactive", "lead changes it into stable matter", "distance has no effect on exposure"], 0, "Protection reduces exposure, not radioactivity itself."],
      ["Why does waste storage remain a major issue for nuclear power?", ["some products stay radioactive for very long times and need secure isolation", "all waste cools into harmless water quickly", "waste is only a public-relations issue", "nuclear reactors produce no waste"], 0, "Long-lived waste is a real physical management problem."],
      ["Which statement best balances a medical radioisotope application?", ["the source can be justified if the medical benefit outweighs the controlled radiation risk", "medical use means there is no risk", "any risk makes all use unacceptable automatically", "a useful source never needs dose control"], 0, "Benefit-risk comparison is the right structure."],
      ["Why is time near a source included in safety rules?", ["dose and exposure increase with longer time near the source", "time changes atomic number", "time eliminates contamination automatically", "only shielding matters"], 0, "Exposure duration matters physically."],
      ["Why is it stronger to talk about procedures and monitoring rather than simply 'being careful'?", ["specific controls such as shielding, distance, sealed handling, and monitoring reduce risk in identifiable ways", "physics hazards respond to feelings only", "monitoring is unrelated to radiation", "procedures make contamination impossible in every case"], 0, "Concrete controls are better than vague reassurance."],
      ["Why should a nuclear-power discussion include carbon emissions, reliability, accidents, and waste together?", ["a valid judgment needs both benefits and hazards in the same comparison", "only one of those factors is ever relevant", "carbon emissions prove there is no radiation hazard", "waste and accidents are social not physical"], 0, "Balanced evaluation needs multiple linked factors."],
      ["A student says, 'Background radiation means extra sources do not matter.' What is the best correction?", ["added exposure from extra sources can still matter even when background exists", "background means no detector can ever work", "background radiation is the same as reactor waste", "background eliminates contamination"], 0, "Background is a baseline, not a reason to ignore added dose."],
      ["Why is it stronger to say 'risk can be managed' rather than 'risk can be removed'?", ["management reduces probability or exposure, but hazard cannot be made conceptually nonexistent", "all hazards can be reduced to zero immediately", "management and removal mean exactly the same thing", "radioactivity can be switched off by labels"], 0, "The language should stay technically honest."],
    ]),
    ...shortMany(hint, [
      { prompt: "A balanced judgment compares nuclear ... with hazard and control.", acceptedAnswers: exact("benefit", "benefits") },
      { prompt: "Shielding reduces ..., but it does not stop the source being radioactive.", acceptedAnswers: exact("exposure", "dose", "radiation reaching you") },
      { prompt: "Internal contamination can be especially dangerous because the source is ... the body.", acceptedAnswers: exact("inside", "inside the body", "within") },
      { prompt: "Waste storage matters because some isotopes remain radioactive for very ... periods.", acceptedAnswers: exact("long", "long time") },
      { prompt: "Background radiation is a baseline, not an excuse to ignore added ...", acceptedAnswers: exact("exposure", "dose") },
      { prompt: "The safest answer structure is benefit, hazard, and ...", acceptedAnswers: exact("control", "controls", "risk control") },
      { prompt: "Specific safety procedures matter more than vague advice to just be ...", acceptedAnswers: exact("careful") },
      { prompt: "Risk can be managed, but not simply made to ...", acceptedAnswers: exact("disappear", "vanish", "go away") },
    ]),
  ];
}

function l1MasteryRaw(): RawItem[] { return [...l1DiagnosticRaw(), ...l1ConceptRaw()]; }
function l2MasteryRaw(): RawItem[] { return [...l2DiagnosticRaw(), ...l2ConceptRaw()]; }
function l3MasteryRaw(): RawItem[] { return [...l3DiagnosticRaw(), ...l3ConceptRaw()]; }
function l4MasteryRaw(): RawItem[] { return [...l4DiagnosticRaw(), ...l4ConceptRaw()]; }
function l5MasteryRaw(): RawItem[] { return [...l5DiagnosticRaw(), ...l5ConceptRaw()]; }
function l6MasteryRaw(): RawItem[] { return [...l6DiagnosticRaw(), ...l6ConceptRaw()]; }

const M12_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  M12_L1: l1DiagnosticRaw,
  M12_L2: l2DiagnosticRaw,
  M12_L3: l3DiagnosticRaw,
  M12_L4: l4DiagnosticRaw,
  M12_L5: l5DiagnosticRaw,
  M12_L6: l6DiagnosticRaw,
};

const M12_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  M12_L1: l1ConceptRaw,
  M12_L2: l2ConceptRaw,
  M12_L3: l3ConceptRaw,
  M12_L4: l4ConceptRaw,
  M12_L5: l5ConceptRaw,
  M12_L6: l6ConceptRaw,
};

const M12_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  M12_L1: l1MasteryRaw,
  M12_L2: l2MasteryRaw,
  M12_L3: l3MasteryRaw,
  M12_L4: l4MasteryRaw,
  M12_L5: l5MasteryRaw,
  M12_L6: l6MasteryRaw,
};

export function m12GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M12_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function m12GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M12_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function m12GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M12_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
