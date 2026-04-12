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
type RawCollectionItem = RawItem | RawItem[];

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function compactCode(code: string): string {
  return normalizeCode(code).replace(/_/g, "");
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint: string,
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, explanation, hint };
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
      return "D";
    case "concept":
      return "C";
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

function materializeBank(code: string, kind: BankKind, rawItems: RawCollectionItem[]): UnknownRecord[] {
  const flattened = rawItems.flat();
  const seenSignatures = new Set<string>();
  const deduped = flattened.flatMap((item, index) => {
    const signature = item.kind === "mc"
      ? `${normalizePrompt(item.prompt)}::${item.choices.map((choice) => normalizePrompt(choice)).join("|")}`
      : `${normalizePrompt(item.prompt)}::${item.acceptedAnswers.map((answer) => normalizePrompt(answer)).join("|")}`;
    if (!item.prompt || seenSignatures.has(signature)) return [];
    seenSignatures.add(signature);
    const id = `${compactCode(code)}_${stageLabel(kind)}${index + 1}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`M5 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function numberAnswers(value: number): string[] {
  return words(String(value));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep single-particle claims separate from whole-material claims.";
  return [
    mc("Which statement best fits the simple particle model of heating a solid?", ["Particles move more vigorously but stay the same size", "Particles become larger and heavier", "Particles melt into energy packets", "Particles stop interacting"], 0, "Heating changes motion and often spacing patterns, not particle size.", hint),
    mc("A heated metal block expands slightly. What is the best particle-model explanation?", ["Average spacing increases slightly", "Each particle becomes bigger", "The particles disappear and reform", "The number of particles doubles"], 0, "Expansion is explained by changed spacing, not enlarged particles.", hint),
    mc("Which quantity is a bulk property rather than a one-particle property?", ["Density", "Mass of one particle", "Charge of one ion", "Position of one particle"], 0, "Density belongs to the sample as a whole.", hint),
    mc("Which statement about one particle should be rejected?", ["One particle has the sample density", "One particle has a mass", "One particle can move", "One particle can collide"], 0, "Density requires the mass and volume of a sample, not one isolated particle.", hint),
    mc("Which description is strongest when classifying a state of matter?", ["Use spacing, motion, and attraction together", "Use only how fast the particles move", "Use only the particle size", "Use only the color of the sample"], 0, "A strong state description needs several particle-model clues together.", hint),
    mc("What usually happens to the motion of particles when a solid is heated below melting point?", ["They vibrate more strongly", "They become larger", "They stop moving", "They all move in one straight line"], 0, "Heating raises the motion level first.", hint),
    mc("Which pair contains two whole-material properties?", ["Density and melting point", "Mass of one atom and melting point", "Charge of one ion and radius of one atom", "Mass of one atom and position of one atom"], 0, "Density and melting point are properties of the whole material.", hint),
    mc("Why is the claim 'the particles got bigger' weak physics in this topic?", ["It confuses a crowd-level change with a particle-size change", "It uses too many equations", "It ignores the sample color", "It assumes the sample is a gas"], 0, "The simple model keeps particle size fixed.", hint),
    mc("Which statement is strongest about different states of the same substance?", ["The same particles can have different arrangements and motion patterns", "The particles must change size in every state", "The particles vanish between states", "The states differ only by color"], 0, "State changes are about arrangement and motion, not new particle sizes.", hint),
    mc("Which clue most strongly shows that a learner is mixing levels of description?", ["They assign sample density to one particle", "They say particles move", "They say particles collide", "They say particles are attracted"], 0, "That assigns a bulk quantity to one particle.", hint),
    shortCases([
      { prompt: "In the simple particle model, particle size stays ...", acceptedAnswers: words("fixed", "constant", "the same"), hint },
      { prompt: "Heating a solid can increase average particle ...", acceptedAnswers: words("spacing", "separation"), hint },
      { prompt: "Density belongs to the whole ...", acceptedAnswers: words("material", "sample", "substance"), hint },
      { prompt: "Heating usually increases particle ...", acceptedAnswers: words("motion", "movement", "vibration"), hint },
      { prompt: "A strong state description uses motion, spacing, and ...", acceptedAnswers: words("attraction", "attractions"), hint },
      { prompt: "The statement 'the particles got bigger' should be ...", acceptedAnswers: words("rejected", "wrong"), hint },
      { prompt: "One particle can have mass, but not the sample ...", acceptedAnswers: words("density"), hint },
      { prompt: "Expansion is explained by increased average ... rather than larger particles.", acceptedAnswers: words("spacing", "separation"), hint },
      { prompt: "Bulk properties belong to the whole ... rather than one isolated particle.", acceptedAnswers: words("sample", "material", "substance"), hint },
      { prompt: "The same particles can still appear in different ... of matter.", acceptedAnswers: words("states", "state"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Repair the misconception by asking whether the claim belongs to one particle or to the whole sample.";
  return [
    mc("Why is it important to keep particle size fixed in this model?", ["It prevents bulk expansion from being misread as particles swelling", "It proves all particles have the same mass", "It removes the need for attraction", "It shows that heating cannot change state"], 0, "The fixed-size rule protects the correct explanation for expansion.", hint),
    mc("Why is density a poor one-particle description?", ["Density needs the mass and volume of a sample", "Density is measured only in liquids", "Density has no units", "Density is always constant for all substances"], 0, "One particle alone does not have the sample density.", hint),
    mc("Why is 'the particles moved more' acceptable while 'the particles got bigger' is not?", ["The model allows motion changes but keeps particle size fixed", "Both claims are equally wrong", "Only size changes can explain heating", "Motion never changes in the model"], 0, "The simple model changes motion and arrangement, not particle size.", hint),
    mc("Why is a one-clue state description too weak?", ["Because different states can share one clue but differ in the others", "Because states are decided only by color", "Because attraction never matters", "Because motion alone always gives the state"], 0, "You need the combination of clues, not just one.", hint),
    mc("Why can the same substance be solid or liquid without changing its particles into different kinds?", ["Because the particles can keep the same identity but change arrangement and mobility", "Because every state needs a different kind of particle", "Because particle mass vanishes in a liquid", "Because attraction is absent in both states"], 0, "The state changes, not the particle identity.", hint),
    mc("Why should attraction stay visible in a state description?", ["Because spacing and motion alone do not fully explain why particles hold or loosen their arrangement", "Because attraction is the same as density", "Because attraction measures color", "Because attraction only matters in gases"], 0, "Attraction helps explain why some crowded states hold shape better than others.", hint),
    mc("Why is sample expansion still a crowd-level effect even when every particle is moving more?", ["Because the enlarged sample size comes from changed average spacing in the crowd", "Because each particle doubles in size", "Because the particle number rises automatically", "Because expansion does not involve spacing"], 0, "The whole sample changes size through arrangement, not bigger particles.", hint),
    mc("Which repair best fixes 'a particle has the density of copper'?", ["Say that copper has a density as a material, not that one particle has the sample density", "Say that the particle is unusually heavy", "Say that density means particle speed", "Say that density is the same as temperature"], 0, "The material has the density; one particle does not.", hint),
    mc("Why is it useful to ask 'single particle or whole sample?' before answering M5_L1 questions?", ["Because it stops level-mixing errors before they happen", "Because it removes the need for evidence", "Because it proves all particles are identical", "Because it turns every question into a calculation"], 0, "That question is a strong checkpoint against the main misconception.", hint),
    mc("Why is 'the block expanded, so the atoms became larger' not IGCSE-standard reasoning?", ["Because it replaces the particle-model explanation with an unsupported particle-size story", "Because it uses too many words", "Because it assumes the block is liquid", "Because it forgets that atoms have mass"], 0, "The simple model uses changed motion and spacing to explain expansion.", hint),
    shortCases([
      { prompt: "The fixed-size rule stops learners from confusing expansion with larger ...", acceptedAnswers: words("particles", "atoms"), hint },
      { prompt: "Density needs the mass and volume of the whole ...", acceptedAnswers: words("sample", "material", "substance"), hint },
      { prompt: "A strong state answer combines motion, spacing, and ...", acceptedAnswers: words("attraction", "attractions"), hint },
      { prompt: "Expansion is a crowd-level change in average ...", acceptedAnswers: words("spacing", "separation"), hint },
      { prompt: "One particle can move, but it does not have the sample's ...", acceptedAnswers: words("density"), hint },
      { prompt: "The same substance can change state without changing particle ...", acceptedAnswers: words("identity", "type", "kind"), hint },
      { prompt: "Heating changes crowd pattern first, not particle ...", acceptedAnswers: words("size"), hint },
      { prompt: "The bulk-versus-particle check is: one particle or whole ...?", acceptedAnswers: words("sample", "material"), hint },
      { prompt: "Attraction helps explain why some crowded states keep their ...", acceptedAnswers: words("shape"), hint },
      { prompt: "A learner who says 'particles swell' is mixing sample change with particle ...", acceptedAnswers: words("size"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep spacing and neighbor mobility together when separating solids and liquids.";
  return [
    mc("Particles are close together and only vibrate about fixed positions. Which state is this?", ["Solid", "Liquid", "Gas", "Plasma"], 0, "Fixed positions with vibration describe a solid.", hint),
    mc("Particles are still close together but can move around one another. Which state is this?", ["Liquid", "Solid", "Gas", "Vacuum"], 0, "Close-packed with mobile neighbors describes a liquid.", hint),
    mc("Why is a liquid not a gas in the particle model?", ["Liquid particles are still close together", "Liquid particles are fixed in place", "Liquid particles are larger", "Liquid particles stop colliding"], 0, "A gas has much larger average gaps.", hint),
    mc("Why can a liquid take the shape of its container?", ["Its particles can move around one another", "Its particles are fixed in place", "Its particles become larger", "Its particles vanish into the walls"], 0, "Neighbor mobility explains flow and shape change.", hint),
    mc("Why does a solid usually keep its shape?", ["Its particles only vibrate about fixed positions", "Its particles are far apart", "Its particles flow around one another", "Its particles have no attraction"], 0, "Fixed positions explain the retained shape.", hint),
    mc("Which statement is strongest about solids and liquids?", ["Both are close-packed, but liquids have greater neighbor mobility", "Liquids are gases with smaller particles", "Solids have no moving particles", "Liquids always have huge gaps"], 0, "That keeps both the spacing clue and the mobility clue visible.", hint),
    mc("Which statement should be rejected?", ["Liquids flow because their particles are separated by gas-like huge gaps", "Solids vibrate about fixed positions", "Liquids keep particles close together", "Liquids can change shape"], 0, "Large gaps belong to gases, not to ordinary liquids.", hint),
    mc("If neighbor swapping increases but spacing stays close, which state is most likely?", ["Liquid", "Solid", "Gas", "No state can be named"], 0, "Close spacing plus changing neighbors points to a liquid.", hint),
    mc("Which feature do solids and liquids share in the simple model?", ["Particles are relatively close together", "Particles are far apart", "Particles have no attraction", "Particles always move in straight lines"], 0, "Both states are crowded compared with a gas.", hint),
    mc("Which clue separates a liquid from a solid most directly?", ["Whether particles can change neighbors", "Whether particles have mass", "Whether particles are visible", "Whether the sample has color"], 0, "Mobility is the cleanest separator when spacing is already close.", hint),
    shortCases([
      { prompt: "Solid particles vibrate about fixed ...", acceptedAnswers: words("positions", "position"), hint },
      { prompt: "Liquid particles stay close together but can move around one ...", acceptedAnswers: words("another"), hint },
      { prompt: "A gas has particles much farther ... than a liquid.", acceptedAnswers: words("apart"), hint },
      { prompt: "A liquid is not a gas because the particles are still ... together.", acceptedAnswers: words("close", "closely packed"), hint },
      { prompt: "A solid keeps shape because particles do not change ...", acceptedAnswers: words("neighbors", "position", "positions"), hint },
      { prompt: "A liquid changes shape because particles can ...", acceptedAnswers: words("flow", "move", "move around one another"), hint },
      { prompt: "A strong solid-liquid answer uses spacing and ...", acceptedAnswers: words("motion", "mobility"), hint },
      { prompt: "Close-packed but mobile describes a ...", acceptedAnswers: words("liquid"), hint },
      { prompt: "Huge average gaps belong to a ...", acceptedAnswers: words("gas"), hint },
      { prompt: "Solids and liquids both keep particles relatively ... together.", acceptedAnswers: words("close", "closely packed"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Repair liquid-versus-gas mistakes by checking spacing before naming the state.";
  return [
    mc("Why is calling a liquid 'half-gas' weak reasoning?", ["Because liquids still keep particles close together", "Because liquids have no motion", "Because gases have fixed positions", "Because liquids contain fewer particles"], 0, "The spacing clue is wrong in the 'half-gas' picture.", hint),
    mc("Why can a liquid flow while keeping nearly the same volume?", ["Particles can change neighbors but remain close together", "Particles become much larger", "Particles stop colliding", "Particles vanish from the sample"], 0, "Mobility changes shape, close spacing helps keep volume similar.", hint),
    mc("Why is 'it moves more, so it must be a gas' too weak?", ["Because liquids and gases can both have mobile particles, but their spacing is different", "Because only solids move", "Because gas particles are fixed in place", "Because motion never matters"], 0, "One clue is not enough by itself.", hint),
    mc("Why does a strong solid-liquid comparison mention both spacing and mobility?", ["Because close spacing alone does not separate the two states", "Because mobility is the same as density", "Because spacing never matters", "Because attraction is forbidden"], 0, "The best answers keep both clues together.", hint),
    mc("Why is the fixed-position idea central to solids?", ["It explains why the shape is retained while particles still vibrate", "It proves the particles have no mass", "It shows the particles never move", "It means the particles are farther apart"], 0, "Solids still have motion, but not neighbor-changing flow.", hint),
    mc("Why is a liquid still called condensed matter in school physics?", ["Because the particles remain relatively close together", "Because the particles have no kinetic energy", "Because the particles have no attraction", "Because the particles are invisible"], 0, "The spacing remains crowded compared with a gas.", hint),
    mc("Why is large-gap reasoning a warning sign in a liquid answer?", ["Because large average gaps belong to a gas model, not an ordinary liquid", "Because all liquids are solids", "Because gaps never exist in any state", "Because liquids have fixed positions"], 0, "Huge spacing is the wrong picture for liquids.", hint),
    mc("Why should shape and volume be explained with particle-model language rather than slogans?", ["Because shape change and close spacing come from different particle clues", "Because slogans are always equations", "Because particle models do not apply to liquids", "Because volume never matters"], 0, "A precise answer ties each bulk behavior to a particle explanation.", hint),
    mc("Why is 'liquid particles slide past one another' better than 'liquid particles are loose'?", ["Because it describes neighbor mobility without implying gas-like spacing", "Because it removes the need for spacing", "Because it means the particles are larger", "Because it shows solids can flow"], 0, "It names the correct difference more precisely.", hint),
    mc("Why should attraction remain visible in a solid-liquid comparison?", ["Because it helps explain why particles can stay close while having different freedom of movement", "Because attraction equals temperature", "Because attraction only matters in gases", "Because attraction replaces spacing"], 0, "Attraction helps support the close-packed picture.", hint),
    shortCases([
      { prompt: "A liquid is not a gas because its particles remain ... together.", acceptedAnswers: words("close", "closely packed"), hint },
      { prompt: "A liquid can change shape because particles can change ...", acceptedAnswers: words("neighbors", "neighbours"), hint },
      { prompt: "A solid keeps shape because particles stay in fixed ...", acceptedAnswers: words("positions", "position"), hint },
      { prompt: "One-clue answers are weak because states need more than one particle-model ...", acceptedAnswers: words("clue", "feature"), hint },
      { prompt: "Large average gaps point to a ... rather than a liquid.", acceptedAnswers: words("gas"), hint },
      { prompt: "Close spacing plus mobility is the key particle story for a ...", acceptedAnswers: words("liquid"), hint },
      { prompt: "Close spacing plus fixed positions is the key particle story for a ...", acceptedAnswers: words("solid"), hint },
      { prompt: "Flow comes from neighbor ... rather than from huge gaps.", acceptedAnswers: words("mobility", "movement"), hint },
      { prompt: "A strong volume explanation keeps the particles ... together.", acceptedAnswers: words("close", "closely packed"), hint },
      { prompt: "The phrase 'half-gas' hides the crucial spacing ...", acceptedAnswers: words("difference", "clue"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use Brownian motion as evidence for unseen random collisions from surrounding particles.";
  return [
    mc("Which state has particles far apart that move freely between collisions?", ["Gas", "Liquid", "Solid", "Crystal only"], 0, "That is the standard particle picture for a gas.", hint),
    mc("What does Brownian motion refer to here?", ["The random jiggling of a visible particle caused by unseen collisions", "The straight-line flight of one molecule", "A particle getting larger when heated", "A liquid turning into a gas"], 0, "Brownian motion is a visible effect of invisible collisions.", hint),
    mc("Why does a smoke particle show a jagged path in air?", ["Collisions from surrounding air molecules are random and uneven", "The smoke particle has a built-in motor", "Gravity changes direction every second", "The smoke particle is charged"], 0, "The path changes because the hits are not balanced.", hint),
    mc("Air is warmed and the Brownian jitter becomes stronger. What is the best explanation?", ["The surrounding molecules are moving faster and colliding more vigorously", "The smoke particle becomes larger", "The air molecules stop moving in random directions", "The smoke particle loses mass"], 0, "Warmer gas means more vigorous molecular motion.", hint),
    mc("Which statement is weakest physics?", ["The visible smoke particle proves itself to be one large air molecule", "Brownian motion is evidence for moving molecules", "The smoke path is irregular because collisions are uneven", "Heating can increase Brownian jitter"], 0, "The smoke particle is evidence, not one giant air molecule.", hint),
    mc("Which statement best uses Brownian motion as evidence?", ["The visible path reveals collisions from invisible moving particles", "The visible particle creates the motion of the air around it", "Brownian motion shows that particles are fixed in place", "Brownian motion proves particles are large and visible"], 0, "The evidence points from the visible effect to the unseen cause.", hint),
    mc("Between collisions, gas particles in the simple model mostly...", ["move freely", "vibrate about fixed positions", "remain locked to neighbors", "stop completely"], 0, "Gas particles are free between collisions.", hint),
    mc("If the surrounding gas becomes less vigorous, the Brownian motion should become...", ["weaker", "stronger", "perfectly straight", "more regular and periodic"], 0, "Less vigorous surrounding motion gives weaker jitter.", hint),
    mc("Why is the Brownian path irregular rather than straight?", ["The collisions come from many directions with changing imbalance", "The smoke particle chooses a path", "The gas particles are not moving", "The smoke particle has constant acceleration"], 0, "Irregularity comes from random collision imbalance.", hint),
    mc("What is the best role of the visible smoke particle in Brownian-motion questions?", ["It is a tracer that reveals unseen molecular motion", "It is the main gas particle being studied directly", "It provides the heat source", "It proves density is a particle property"], 0, "The visible particle is a tracer or evidence carrier.", hint),
    shortCases([
      { prompt: "Brownian motion is evidence for moving air ...", acceptedAnswers: words("molecules", "particles"), hint },
      { prompt: "The smoke path is irregular because collisions are random and ...", acceptedAnswers: words("uneven", "unbalanced"), hint },
      { prompt: "Warming the gas makes surrounding molecules move more ...", acceptedAnswers: words("fast", "faster", "quickly"), hint },
      { prompt: "Gas particles are far ... and move freely between collisions.", acceptedAnswers: words("apart"), hint },
      { prompt: "The visible Brownian particle does not have its own ...", acceptedAnswers: words("motor", "drive"), hint },
      { prompt: "Brownian motion turns unseen collisions into visible ...", acceptedAnswers: words("evidence", "motion", "jitter"), hint },
      { prompt: "Between collisions, gas particles move ...", acceptedAnswers: words("freely", "randomly"), hint },
      { prompt: "Stronger heating usually gives stronger Brownian ...", acceptedAnswers: words("jitter", "motion"), hint },
      { prompt: "The smoke particle is a visible ... for unseen particle motion.", acceptedAnswers: words("tracer", "indicator", "evidence"), hint },
      { prompt: "Brownian motion does not mean the visible particle is self-...", acceptedAnswers: words("propelled", "powered"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "The visible effect is the evidence; the unseen molecules are the cause.";
  return [
    mc("Why does Brownian motion count as evidence for molecules even when the molecules cannot be seen directly?", ["Because the visible particle shows the effect of many unseen collisions", "Because it lets you see each molecule clearly", "Because it removes the need for a particle model", "Because the visible particle is itself one molecule"], 0, "Evidence can come from a visible effect of an invisible cause.", hint),
    mc("Why is the smoke particle not treated as self-powered in Brownian-motion questions?", ["Because its changing path is explained by external collisions", "Because all visible particles are fixed in place", "Because it has no mass", "Because it is always charged"], 0, "The cause is the surrounding molecular bombardment.", hint),
    mc("Why does a warmer gas give a stronger Brownian effect?", ["Because the surrounding molecules transfer momentum more vigorously", "Because the smoke particle becomes hotter than the gas", "Because the gas becomes a liquid", "Because the visible particle stops colliding"], 0, "The surroundings become more active, so the tracer jitters more.", hint),
    mc("Why is a straight Brownian path not expected in ordinary air?", ["Because the collisions from different directions are never perfectly balanced for long", "Because the smoke particle has no inertia", "Because the gas particles are fixed in rows", "Because the visible particle has zero mass"], 0, "Random imbalance keeps bending the path.", hint),
    mc("Why is Brownian motion stronger evidence than simply saying 'gases move'?", ["Because it shows a visible consequence of that invisible motion", "Because it replaces all particle theory", "Because it proves gases have no collisions", "Because it means the tracer is a gas molecule"], 0, "It ties a claim about unseen particles to an observable effect.", hint),
    mc("Why should a strong answer mention both randomness and collisions?", ["Because both ideas explain the jagged, changing path", "Because randomness alone explains fixed positions", "Because collisions alone explain particle size", "Because neither idea matters"], 0, "The path depends on random, uneven collisions.", hint),
    mc("Why is 'the smoke particle is moving faster' not enough to explain a stronger Brownian effect?", ["Because you need the surrounding-molecule story that causes the stronger pushes", "Because the smoke particle never moves", "Because speed has nothing to do with motion", "Because Brownian motion only happens in liquids"], 0, "The cause sits in the surrounding molecules, not only in the tracer description.", hint),
    mc("Why does Brownian motion support the particle model rather than the continuous-matter model?", ["Because it is naturally explained by many tiny collisions", "Because it proves matter is perfectly smooth", "Because it shows particles have no random motion", "Because it removes the need for unseen causes"], 0, "The collision story is a particle story.", hint),
    mc("Why should the visible tracer and invisible molecules not be confused with one another?", ["Because they play different roles in the evidence chain", "Because they always have the same size", "Because they move in the same way", "Because they are both directly visible"], 0, "The tracer reveals the molecules; it is not the same thing as them.", hint),
    mc("Why does reducing the surrounding molecular motion weaken Brownian motion?", ["Because the uneven pushes on the tracer become smaller", "Because the tracer gains a motor", "Because the tracer becomes denser", "Because the gas stops having particles"], 0, "Weaker surrounding motion means weaker random pushes.", hint),
    shortCases([
      { prompt: "Brownian motion is visible evidence of unseen particle ...", acceptedAnswers: words("motion", "collisions"), hint },
      { prompt: "The tracer particle reveals the effect, while the surrounding molecules are the ...", acceptedAnswers: words("cause"), hint },
      { prompt: "A strong Brownian explanation mentions random ...", acceptedAnswers: words("collisions", "hits"), hint },
      { prompt: "Warmer gas gives more vigorous momentum ... to the tracer.", acceptedAnswers: words("transfer", "pushes", "collisions"), hint },
      { prompt: "The smoke particle is evidence for molecules, not one giant ...", acceptedAnswers: words("molecule"), hint },
      { prompt: "The jagged path changes because the collision balance keeps ...", acceptedAnswers: words("changing"), hint },
      { prompt: "Brownian motion helps turn an unseen cause into visible ...", acceptedAnswers: words("evidence"), hint },
      { prompt: "The tracer is not self-powered; it is externally ...", acceptedAnswers: words("jostled", "pushed"), hint },
      { prompt: "A weaker molecular bombardment gives weaker Brownian ...", acceptedAnswers: words("motion", "jitter"), hint },
      { prompt: "Brownian motion supports the particle ... of matter.", acceptedAnswers: words("model"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Temperature answers an average-particle question, not a whole-sample total question.";
  return [
    mc("In this module, temperature is linked most directly to...", ["Average kinetic energy per particle", "Total internal energy of the sample", "Number of particles only", "Sample color"], 0, "Temperature tracks an average motion idea at this level.", hint),
    mc("Sample A has 20 particles with average kinetic energy 3 units. Sample B has 50 particles with average kinetic energy 3 units. Which is correct?", ["Same temperature, but Sample B has greater total kinetic energy", "Sample B has higher temperature and same total kinetic energy", "Sample A has higher temperature because it has fewer particles", "Both temperature and total kinetic energy are the same"], 0, "Equal averages give equal temperature, but more particles give a larger total.", hint),
    mc("If the average kinetic energy per particle doubles, the temperature becomes...", ["Higher", "Lower", "Unchanged", "Impossible to compare"], 0, "Higher average particle motion means higher temperature.", hint),
    mc("Sample X has 30 particles with average kinetic energy 2 units. Sample Y has 10 particles with average kinetic energy 4 units. Which sample has the higher temperature?", ["Sample Y", "Sample X", "They have the same temperature", "It depends only on mass"], 0, "Temperature follows the average per particle, so 4 units beats 2 units.", hint),
    mc("Using the same samples, which sample has the greater total kinetic energy?", ["Sample X", "Sample Y", "They are equal", "It cannot be worked out"], 0, "30 x 2 = 60, while 10 x 4 = 40.", hint),
    mc("Which statement should be rejected?", ["Temperature is the total kinetic energy of all particles", "Temperature is linked to average particle motion", "More particles at the same temperature can give a larger total kinetic energy", "Equal temperature does not force equal internal energy"], 0, "That confuses average and total.", hint),
    mc("A sample loses half its particles, but the average kinetic energy per particle stays the same. What happens?", ["Temperature stays the same, but total kinetic energy falls", "Temperature doubles", "Both temperature and total kinetic energy stay the same", "Temperature falls to zero"], 0, "The average is unchanged, but the total depends on particle number too.", hint),
    mc("Which instrument reading best matches the idea of temperature here?", ["An average-motion reading", "A count of all particles", "The total mass directly", "The total internal energy directly"], 0, "The module treats temperature as an average motion indicator.", hint),
    mc("Two samples of the same liquid are both at 60 C. Sample B contains twice as much liquid. Which is most likely?", ["They have the same temperature, but Sample B has a larger total energy store", "Sample B must be hotter", "Sample A must have more total energy", "They must have the same internal energy"], 0, "Same temperature does not force the same total.", hint),
    mc("Which phrase best repairs a temperature mistake in M5_L4?", ["Average, not total", "Closer, not faster", "Bigger, not smaller", "Visible, not invisible"], 0, "That is the core correction in this lesson.", hint),
    shortCases([
      { prompt: "Temperature is linked to average ... energy per particle.", acceptedAnswers: words("kinetic"), hint },
      { prompt: "Same temperature means the same average particle ...", acceptedAnswers: words("motion", "kinetic energy"), hint },
      { prompt: "More particles at the same temperature give greater total ... energy.", acceptedAnswers: words("kinetic"), hint },
      { prompt: "A thermometer is not a direct meter of total ...", acceptedAnswers: words("energy", "internal energy"), hint },
      { prompt: "Temperature is an ... value, not a whole-sample total.", acceptedAnswers: words("average"), hint },
      { prompt: "Sample X has 30 particles at 2 units each. Its total kinetic energy is ... units.", acceptedAnswers: numberAnswers(60), hint },
      { prompt: "Sample Y has 10 particles at 4 units each. Its total kinetic energy is ... units.", acceptedAnswers: numberAnswers(40), hint },
      { prompt: "A larger sample can have the same temperature but a larger total ... store.", acceptedAnswers: words("energy", "internal energy"), hint },
      { prompt: "If average kinetic energy per particle rises, temperature ...", acceptedAnswers: words("rises", "increases"), hint },
      { prompt: "Temperature does not directly tell you the size of the ...", acceptedAnswers: words("sample", "system"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Ask whether the question is about average per particle or about the total for the whole sample.";
  return [
    mc("Why can two samples at the same temperature still have different total kinetic energies?", ["Because they can contain different numbers of particles", "Because temperature is a total by definition", "Because particle motion is fixed at one temperature", "Because only gases have kinetic energy"], 0, "Same average does not mean same total when the sample sizes differ.", hint),
    mc("Why is 'hotter means more total energy' too weak as a universal rule?", ["Because a larger cooler sample can still contain more total energy", "Because temperature never matters", "Because total energy and temperature are identical", "Because all samples contain the same number of particles"], 0, "Total energy depends on amount as well as average per particle.", hint),
    mc("Why is average kinetic energy the better phrase for temperature in this lesson?", ["Because it stops total sample size being mixed into the temperature idea", "Because it proves all particles are identical", "Because it removes the need for state descriptions", "Because it is measured in pascals"], 0, "Average language protects the concept boundary.", hint),
    mc("Why does doubling the amount of substance at the same temperature matter?", ["It increases the total contribution from particles even if the average stays the same", "It halves the temperature automatically", "It removes kinetic energy", "It proves temperature is a total"], 0, "The whole-sample total grows when more particles contribute.", hint),
    mc("Why should M5_L4 answers often compare two columns: average and total?", ["Because those two ideas answer different questions", "Because both columns are always equal", "Because total is never needed", "Because average is never needed"], 0, "The lesson is built around not mixing those columns.", hint),
    mc("Why is a thermometer reading not enough to compare two samples fully?", ["Because it does not directly tell you the sample size or whole-sample total", "Because it measures density instead", "Because it only works for solids", "Because it gives the number of particles"], 0, "Temperature alone does not tell the full whole-sample story.", hint),
    mc("Why is Sample B with more particles but the same average still not hotter?", ["Because temperature does not count how many particles share that average", "Because more particles always cool a sample", "Because temperature is a measure of mass only", "Because motion stops in larger samples"], 0, "The average can stay fixed while the total changes.", hint),
    mc("Why is a larger sample at the same temperature likely to have greater internal energy too?", ["Because the same average state is being shared by more particles", "Because temperature must rise with sample size", "Because larger samples have no potential energy", "Because internal energy ignores particle number"], 0, "This is the bridge from temperature to whole-system energy.", hint),
    mc("Why should a learner resist turning 'same temperature' into 'same internal energy'?", ["Because internal energy is a whole-system total, not just an average-movement reading", "Because temperature has no meaning", "Because internal energy is always fixed", "Because only solids have internal energy"], 0, "Same temperature is not a full total-energy statement.", hint),
    mc("Which explanation best repairs 'Sample B is hotter because it has more particles'?", ["Temperature follows the average per particle, not the particle count", "Particle count is the only thing that matters", "More particles always move faster", "Heat and temperature are identical"], 0, "Particle count changes totals, not the average by itself.", hint),
    shortCases([
      { prompt: "Temperature answers an ... per-particle question.", acceptedAnswers: words("average"), hint },
      { prompt: "Total kinetic energy answers a whole-... question.", acceptedAnswers: words("sample", "system"), hint },
      { prompt: "Same temperature does not guarantee the same total ...", acceptedAnswers: words("energy", "kinetic energy", "internal energy"), hint },
      { prompt: "A larger sample at the same temperature usually contains more ...", acceptedAnswers: words("particles"), hint },
      { prompt: "Particle count changes the total, while average motion sets the ...", acceptedAnswers: words("temperature"), hint },
      { prompt: "A thermometer does not directly reveal sample ...", acceptedAnswers: words("size", "amount"), hint },
      { prompt: "The phrase 'average, not total' protects the ... boundary.", acceptedAnswers: words("concept", "meaning"), hint },
      { prompt: "More particles can raise the whole-sample total without raising the ...", acceptedAnswers: words("temperature"), hint },
      { prompt: "Same temperature means the average per-particle motion is ...", acceptedAnswers: words("matched", "the same"), hint },
      { prompt: "To compare samples fairly, separate the average column from the ... column.", acceptedAnswers: words("total"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Internal energy is a whole-system total built from both kinetic and potential parts.";
  return [
    mc("Which statement best defines internal energy?", ["The total kinetic and potential energy of all the particles in the system", "The average kinetic energy of one particle", "The temperature times the mass only", "The energy in one chosen particle"], 0, "Internal energy is a total for the whole system.", hint),
    mc("Two equal-mass samples of the same substance are at the same temperature. One is liquid and one is gas. Which has the greater internal energy?", ["The gas sample", "The liquid sample", "They must be equal", "It depends only on color"], 0, "At the same temperature, the gas usually has the larger potential-energy share.", hint),
    mc("Two samples of the same liquid are at the same temperature, but Sample B has twice the mass. Which has the greater internal energy?", ["Sample B", "Sample A", "They are equal", "It cannot be compared"], 0, "A larger sample usually has a larger total store when state and temperature match.", hint),
    mc("Which part of internal energy changes when particle arrangement changes strongly?", ["Potential-energy part", "Mass part", "Charge part", "Color part"], 0, "Arrangement and separation belong to the potential-energy side.", hint),
    mc("Which statement should be rejected?", ["Internal energy is the same thing as temperature", "Internal energy includes a kinetic part", "Internal energy can change when the amount of substance changes", "Internal energy can differ at the same temperature"], 0, "Temperature is not the whole internal-energy story.", hint),
    mc("Why can two samples at the same temperature still have different internal energies?", ["Because state or amount can change the total store", "Because temperature measures total internal energy exactly", "Because particles disappear at constant temperature", "Because internal energy ignores particle arrangement"], 0, "Amount and state both matter.", hint),
    mc("A same-temperature solid and liquid of the same substance are compared. Which usually has the greater internal energy?", ["The liquid", "The solid", "They must be equal", "The one with the darker color"], 0, "The less tightly bound state usually has a larger potential-energy share.", hint),
    mc("If crowd size doubles while temperature and state stay the same, internal energy generally...", ["increases", "decreases", "stays the same", "falls to zero"], 0, "More particles contribute to the whole-system total.", hint),
    mc("Which statement best keeps temperature and internal energy separate?", ["Temperature is an average; internal energy is a total", "Temperature and internal energy are always identical", "Internal energy belongs to one particle", "Temperature depends only on sample size"], 0, "That is the key conceptual separation.", hint),
    mc("If a liquid becomes a gas at the same temperature, what happens to internal energy?", ["It increases", "It decreases", "It must stay the same", "It becomes undefined"], 0, "The gas state usually has a larger potential-energy contribution.", hint),
    shortCases([
      { prompt: "Internal energy includes kinetic and ... energy.", acceptedAnswers: words("potential"), hint },
      { prompt: "Internal energy belongs to the whole ...", acceptedAnswers: words("system", "sample"), hint },
      { prompt: "At the same temperature, a gas usually has greater internal energy than a ...", acceptedAnswers: words("liquid", "solid"), hint },
      { prompt: "A larger sample at the same temperature usually has greater internal ...", acceptedAnswers: words("energy"), hint },
      { prompt: "Changing state can change the ...-energy part strongly.", acceptedAnswers: words("potential"), hint },
      { prompt: "Temperature is an average, but internal energy is a ...", acceptedAnswers: words("total"), hint },
      { prompt: "Same temperature does not guarantee the same internal ...", acceptedAnswers: words("energy"), hint },
      { prompt: "If particle number rises at the same state and temperature, internal energy usually ...", acceptedAnswers: words("increases", "rises"), hint },
      { prompt: "Gas particles usually have a larger separation-related ...-energy share.", acceptedAnswers: words("potential"), hint },
      { prompt: "Internal energy is the total store for all the ... in the sample.", acceptedAnswers: words("particles"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Ask what changed in the whole-system ledger: the amount, the state, the motion part, or the arrangement part.";
  return [
    mc("Why is 'same temperature means same internal energy' too weak?", ["Because internal energy also depends on particle number and state", "Because temperature has no meaning", "Because only solids have internal energy", "Because internal energy is measured in pascals"], 0, "Temperature does not lock the whole-system total.", hint),
    mc("Why does the gas sample usually win the same-temperature comparison with the liquid sample?", ["Because the gas has the larger potential-energy share", "Because the gas always has the higher temperature", "Because the gas has fewer particles", "Because gases have no kinetic energy"], 0, "Same temperature keeps the average-motion clue matched; the difference sits in the arrangement side.", hint),
    mc("Why does a larger same-temperature sample usually have more internal energy?", ["Because more particles contribute to the whole-system total", "Because temperature automatically rises with mass", "Because the larger sample has no potential energy", "Because internal energy ignores particle number"], 0, "It is a total-store question, not an average-only question.", hint),
    mc("Why should M5_L5 answers keep kinetic and potential contributions separate before concluding?", ["Because one contribution may stay similar while the other changes", "Because only kinetic energy ever matters", "Because potential energy is not part of internal energy", "Because both contributions always stay equal"], 0, "Separating the parts helps explain why internal energy differs.", hint),
    mc("Why is 'internal energy belongs to one particle' incorrect?", ["Because internal energy is defined for the whole system", "Because one particle has no mass", "Because particles never move", "Because one particle has the sample density"], 0, "Internal energy is a total over all particles.", hint),
    mc("Why does state matter even when temperature is matched?", ["Because arrangement and separation affect the potential-energy part", "Because state only changes color", "Because state fixes the mass", "Because state removes motion"], 0, "State changes can alter the potential side strongly.", hint),
    mc("Why is the phrase 'whole-system store' useful in this lesson?", ["Because it keeps internal energy from collapsing into a one-particle or average-only idea", "Because it removes the need for particle models", "Because it means temperature and internal energy are equal", "Because it applies only to gases"], 0, "The wording reminds learners that it is a total.", hint),
    mc("Why can two equal-temperature samples still require different amounts of energy to reach the same new state?", ["Because their starting internal energies and sample sizes can differ", "Because temperature is unrelated to energy", "Because states never affect energy", "Because all samples contain the same particle count"], 0, "The total store matters for what comes next.", hint),
    mc("Why is 'temperature and internal energy are both about energy, so they are the same' not rigorous enough?", ["Because one is an average measure and the other is a total", "Because neither has anything to do with energy", "Because only internal energy has units", "Because only temperature changes during heating"], 0, "Related ideas are not necessarily identical ideas.", hint),
    mc("Why does a gas at the same temperature usually sit higher on the internal-energy ladder than the solid of the same substance?", ["Because the gas state stores more energy in arrangement and separation", "Because gas particles are larger", "Because gas particles stop moving", "Because solids contain no potential energy"], 0, "That is the state-based potential-energy difference.", hint),
    shortCases([
      { prompt: "Internal energy is a whole-system ..., not a one-particle property.", acceptedAnswers: words("total", "store"), hint },
      { prompt: "State matters because it changes the ...-energy contribution.", acceptedAnswers: words("potential"), hint },
      { prompt: "Sample size matters because more particles contribute to the whole ...", acceptedAnswers: words("total", "store"), hint },
      { prompt: "Same temperature fixes an average, not the full internal-... value.", acceptedAnswers: words("energy"), hint },
      { prompt: "A gas often sits above a liquid on the internal-energy ladder because its particles are more ...", acceptedAnswers: words("separated", "farther apart"), hint },
      { prompt: "The potential-energy side belongs to particle arrangement and ...", acceptedAnswers: words("separation"), hint },
      { prompt: "Internal energy should not be collapsed into average particle ...", acceptedAnswers: words("motion", "kinetic energy"), hint },
      { prompt: "A larger same-temperature sample usually contains more internal ...", acceptedAnswers: words("energy"), hint },
      { prompt: "Temperature and internal energy are related but not ...", acceptedAnswers: words("identical", "the same"), hint },
      { prompt: "M5_L5 works best when kinetic and ... parts are compared separately first.", acceptedAnswers: words("potential"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Track where the added energy goes before deciding what changed.";
  return [
    mc("During melting or boiling, added energy often increases which part most strongly?", ["Potential-energy part", "Mass part", "Charge part", "Color part"], 0, "State change often routes energy into loosening attractions and changing arrangement.", hint),
    mc("Which statement is correct during a state change at nearly constant temperature?", ["Internal energy can still increase", "No energy is absorbed", "Particle size must increase", "Average spacing cannot change"], 0, "The total store can rise even when the thermometer barely changes.", hint),
    mc("Two identical 100 J heating stages are compared. Stage A warms a solid below melting point. Stage B happens during melting. In which stage does more of the energy increase potential energy?", ["Stage B", "Stage A", "Both equally", "Neither"], 0, "During melting, more of the input goes into arrangement change.", hint),
    mc("What happens to internal energy in Stage A and Stage B?", ["It increases in both stages", "It decreases in both stages", "It increases only in Stage A", "It stays constant in Stage B"], 0, "Added energy raises the whole store in both cases.", hint),
    mc("Why can boiling continue while the thermometer changes very little?", ["Much of the added energy goes into overcoming attractions", "No energy is entering the sample", "Particles stop moving", "The sample has no internal energy"], 0, "The energy destination is mainly arrangement change.", hint),
    mc("Which statement should be rejected?", ["Constant temperature means zero energy transfer", "State change can absorb energy", "Internal energy can rise during boiling", "Added energy can change arrangement"], 0, "Temperature is not the only place the energy can go.", hint),
    mc("Away from a state boundary, added energy usually raises which idea more directly?", ["Particle motion and temperature", "Only particle size", "Only sample color", "Only particle count"], 0, "Ordinary warm-up stages route more energy into motion.", hint),
    mc("During a state change, what is happening to many particle links or attractions?", ["They are being loosened or overcome", "They are becoming infinitely strong", "They are turning into mass", "They stop existing as an idea"], 0, "That is why potential energy can rise strongly.", hint),
    mc("Which summary is strongest for this lesson?", ["Energy destination matters as much as energy amount", "Temperature is the only clue that matters", "A state change means particles grow", "Internal energy never changes at constant temperature"], 0, "The destination of energy is the key capstone idea.", hint),
    mc("If most of the added energy goes into link release, what is likely about the temperature rise?", ["It may be small", "It must be huge", "It must be negative", "It becomes impossible to define"], 0, "A large share can go into arrangement change instead of motion increase.", hint),
    shortCases([
      { prompt: "During a state change, added energy can strongly increase ... energy.", acceptedAnswers: words("potential"), hint },
      { prompt: "Boiling can occur at nearly constant ...", acceptedAnswers: words("temperature"), hint },
      { prompt: "Internal energy still ... during melting if energy is absorbed.", acceptedAnswers: words("increases", "rises"), hint },
      { prompt: "State-change energy often goes into loosening particle ...", acceptedAnswers: words("attractions", "links"), hint },
      { prompt: "A thermometer mainly tracks the motion-related ... reading.", acceptedAnswers: words("temperature"), hint },
      { prompt: "If energy goes mainly into link release, temperature may change only a ... amount.", acceptedAnswers: words("small", "little"), hint },
      { prompt: "Constant temperature does not mean zero energy ...", acceptedAnswers: words("transfer", "input"), hint },
      { prompt: "Melting changes particle arrangement and total ... energy.", acceptedAnswers: words("internal"), hint },
      { prompt: "Away from a state boundary, added energy often raises particle ...", acceptedAnswers: words("motion", "kinetic energy"), hint },
      { prompt: "During boiling, many attractions are being ...", acceptedAnswers: words("overcome", "loosened", "broken"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Do not use the thermometer as the whole energy story.";
  return [
    mc("Why can a sample absorb energy while the thermometer reading changes very little?", ["Because the energy can go into arrangement change rather than mainly into motion increase", "Because no energy is entering the sample", "Because temperature is not a physical quantity", "Because particles have no attractions"], 0, "The whole store can rise even with a small temperature rise.", hint),
    mc("Why does constant temperature during boiling not mean constant internal energy?", ["Because internal energy includes arrangement as well as motion", "Because boiling removes all particles", "Because internal energy is the same as temperature", "Because state change stops energy transfer"], 0, "The arrangement part can increase strongly.", hint),
    mc("Why is the pair 'input energy' and 'energy destination' important in M5_L6?", ["Because equal inputs can produce different results depending on where the energy goes", "Because destination never matters", "Because all heating stages are identical", "Because only potential energy matters"], 0, "The same input can affect motion or arrangement differently.", hint),
    mc("Why is 'the temperature stayed the same, so nothing changed' poor reasoning?", ["Because a state change and an internal-energy increase can still be happening", "Because all state changes lower temperature", "Because temperature is unrelated to energy", "Because particles stop moving at constant temperature"], 0, "Something important can still be changing in the arrangement.", hint),
    mc("Why does Stage B in the 100 J comparison route more energy into potential energy?", ["Because it is at a state boundary where attractions are being overcome", "Because it has fewer particles", "Because the sample becomes denser", "Because kinetic energy disappears"], 0, "State boundary stages emphasize arrangement change.", hint),
    mc("Why should learners separate 'temperature rise' from 'internal-energy rise' in this lesson?", ["Because they can differ strongly during a state change", "Because internal energy never rises", "Because temperature is always the larger quantity", "Because they are the same by definition"], 0, "This separation is the key capstone move.", hint),
    mc("Why is boiling a better misconception test than simple warming?", ["Because it exposes the false idea that all added energy must show up as a temperature rise", "Because boiling is easier to ignore", "Because simple warming has no particle model", "Because boiling removes kinetic energy"], 0, "It forces learners to think about the destination of energy.", hint),
    mc("Why do arrangement and attraction language belong in a strong state-change explanation?", ["Because the extra energy is often changing how tightly particles are held", "Because arrangement has nothing to do with energy", "Because attraction only matters in solids", "Because state change is only about particle size"], 0, "That is where much of the energy is going.", hint),
    mc("Why is the phrase 'internal energy still rises' so important in boiling questions?", ["Because it prevents learners from using temperature as the only marker of energy gain", "Because it proves temperature is meaningless", "Because it means the sample is cooling", "Because it removes the need for particle explanations"], 0, "The total store still climbs.", hint),
    mc("Which explanation best matches standard IGCSE particle-model reasoning for melting?", ["Added energy weakens or overcomes attractions and changes arrangement while the whole store rises", "Added energy makes particles larger", "Added energy creates new particles", "Added energy removes all kinetic energy"], 0, "That keeps the particle model and the energy story together.", hint),
    shortCases([
      { prompt: "During boiling, internal energy can still ...", acceptedAnswers: words("increase", "rise"), hint },
      { prompt: "A small temperature rise can hide a large increase in the arrangement or ...-energy part.", acceptedAnswers: words("potential"), hint },
      { prompt: "Equal energy inputs can give different results because the energy ... can differ.", acceptedAnswers: words("destination"), hint },
      { prompt: "The thermometer is not the whole energy ...", acceptedAnswers: words("story", "picture"), hint },
      { prompt: "During melting, added energy can be used to overcome particle ...", acceptedAnswers: words("attractions", "links"), hint },
      { prompt: "A state boundary is where arrangement change becomes especially ...", acceptedAnswers: words("important"), hint },
      { prompt: "Temperature alone is not a complete marker of energy ...", acceptedAnswers: words("gain", "change"), hint },
      { prompt: "Boiling helps expose the misconception that all heating must raise ...", acceptedAnswers: words("temperature"), hint },
      { prompt: "State-change answers should mention arrangement, attractions, and total internal ...", acceptedAnswers: words("energy"), hint },
      { prompt: "The M5_L6 capstone is that energy amount and energy ... both matter.", acceptedAnswers: words("destination"), hint },
    ]),
  ];
}

function diagnosticRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M5_L1":
      return l1DiagnosticRaw();
    case "M5_L2":
      return l2DiagnosticRaw();
    case "M5_L3":
      return l3DiagnosticRaw();
    case "M5_L4":
      return l4DiagnosticRaw();
    case "M5_L5":
      return l5DiagnosticRaw();
    case "M5_L6":
      return l6DiagnosticRaw();
    default:
      return [];
  }
}

function conceptRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M5_L1":
      return l1ConceptRaw();
    case "M5_L2":
      return l2ConceptRaw();
    case "M5_L3":
      return l3ConceptRaw();
    case "M5_L4":
      return l4ConceptRaw();
    case "M5_L5":
      return l5ConceptRaw();
    case "M5_L6":
      return l6ConceptRaw();
    default:
      return [];
  }
}

export function m5GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  return materializeBank(code, "diagnostic", diagnosticRaw(code));
}

export function m5GeneratedConceptGateItems(code: string): UnknownRecord[] {
  return materializeBank(code, "concept", conceptRaw(code));
}

export function m5GeneratedMasteryItems(code: string): UnknownRecord[] {
  return materializeBank(code, "mastery", [...diagnosticRaw(code), ...conceptRaw(code)]);
}
