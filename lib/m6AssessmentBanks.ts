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
    throw new Error(`M6 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep temperature, transferred energy, mass, and material response as separate ideas.";
  return [
    mc("Two samples are both at 40 deg C. What is definitely true?", ["They have the same temperature", "They have the same total thermal energy", "They need the same energy for a 10 deg C rise", "They have the same mass"], 0, "Equal readings guarantee equal temperature only.", hint),
    mc("Which statement best describes heat?", ["Heat is energy transferred because of a temperature difference", "Heat is the same as temperature", "Heat is a substance trapped in objects", "Heat is mass"], 0, "Heat refers to transfer, not the current reading.", hint),
    mc("A thermometer measures which quantity directly?", ["Temperature", "Specific heat capacity", "Total thermal energy", "Latent heat"], 0, "A thermometer reads temperature.", hint),
    mc("Two blocks of the same material each receive 1000 J. One has mass 1 kg and the other 2 kg. Which rises more in temperature?", ["The 1 kg block", "The 2 kg block", "They rise by the same amount", "There is not enough information"], 0, "For equal material and equal transfer, the smaller mass rises more.", hint),
    mc("Two 1 kg blocks each receive 1000 J. Water rises less than copper. What does that suggest?", ["Water has the larger specific heat capacity", "Copper has the larger specific heat capacity", "Water received less energy", "The thermometers are wrong"], 0, "For equal mass and equal transfer, the smaller rise points to larger specific heat capacity.", hint),
    mc("Which statement should be rejected?", ["Equal temperature means equal total thermal energy", "Equal temperature means equal thermometer reading", "The same transfer can cause different temperature rises", "Mass and material still matter"], 0, "Equal temperature does not force equal total energy.", hint),
    mc("A bathtub and a mug are both at 35 deg C. What is strongest?", ["They are at the same temperature but may not have the same total thermal energy", "They contain the same heat", "They cool at the same rate", "They have the same mass"], 0, "Temperature matches, but the amounts are very different.", hint),
    mc("If two objects are in thermal equilibrium, what is true?", ["There is no net heat transfer between them", "They have equal total thermal energy", "They have equal mass", "They are the same material"], 0, "Thermal equilibrium is a balance of transfer.", hint),
    mc("What should be questioned first if equal energy transfers give unequal temperature rises?", ["Mass or material differences", "Whether energy can transfer at all", "Whether temperature exists", "Whether both are solids"], 0, "Different mass or different specific heat capacity can explain it.", hint),
    mc("Which quantity best matches 'how hot it is now'?", ["Temperature", "Heat transfer", "Latent heat", "Mass"], 0, "Temperature is the current-state reading.", hint),
    mc("A metal block and a plastic block start at the same temperature and receive the same energy. The metal rises more. What is the best inference?", ["The metal has lower specific heat capacity", "The metal received more energy", "The plastic must have lower mass", "Their temperatures cannot be compared"], 0, "Lower specific heat capacity gives a larger rise for equal mass and equal transfer.", hint),
    mc("Which description is strongest?", ["Temperature is a state reading, while heat is transferred energy", "Temperature is stored heat", "Heat and temperature are always interchangeable", "Heat is measured in degrees"], 0, "This distinction is the core idea.", hint),
    shortCases([
      { prompt: "What does a thermometer measure directly?", acceptedAnswers: words("temperature"), hint },
      { prompt: "If mass doubles while the same material receives the same energy transfer, what happens to the temperature rise?", acceptedAnswers: words("it halves", "the temperature rise halves", "smaller"), hint },
      { prompt: "Name one factor other than transferred energy that affects temperature rise.", acceptedAnswers: words("mass", "material", "specific heat capacity"), hint },
      { prompt: "Can two objects at the same temperature still have different total thermal energies?", acceptedAnswers: words("yes", "yes they can"), hint },
      { prompt: "If two identical blocks receive the same energy transfer, how should their temperature rises compare?", acceptedAnswers: words("the same", "equal"), hint },
      { prompt: "What is the correct phrase for energy moving because of a temperature difference?", acceptedAnswers: words("heat", "heat transfer", "thermal energy transfer"), hint },
      { prompt: "At thermal equilibrium, what happens to the net heat transfer?", acceptedAnswers: words("it is zero", "zero", "no net heat transfer"), hint },
      { prompt: "If one block rises less after the same energy transfer and same mass, what property may be larger?", acceptedAnswers: words("specific heat capacity"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the distinction between a temperature reading and the full energy story.";
  return [
    mc("A 50 g spoon and a 2 kg pan are both at 120 deg C. Which conclusion is safest?", ["They share a temperature reading, but not necessarily the same total thermal energy", "They contain the same heat", "They need the same energy to cool by 20 deg C", "They cool equally fast"], 0, "Temperature matches, but the energy story may differ.", hint),
    mc("Two samples of the same material have equal mass and receive equal energy transfers. What must be true?", ["Their temperature rises are equal", "Their total thermal energies become equal", "Their starting temperatures must have been equal", "Their latent heats are equal"], 0, "Equal Q, equal m, and same material give equal rise.", hint),
    mc("A student says, 'This object is hot, so it contains lots of heat.' What is the best correction?", ["Hot means high temperature, but that alone does not tell the full energy story", "Hot means high specific heat capacity", "Hot means the object is melting", "Hot means it has more mass"], 0, "Temperature alone is not the whole story.", hint),
    mc("A larger specific heat capacity means what in words?", ["More energy per kilogram per degree is needed", "The material cannot cool", "The material always reaches a higher temperature", "The material must be a liquid"], 0, "That is the meaning of a larger specific heat capacity.", hint),
    mc("Why can a swimming pool at 25 deg C involve more thermal energy than a cup at 60 deg C?", ["The pool contains far more mass", "Lower temperatures always mean more energy", "Cups cannot store energy", "The pool must have a larger latent heat"], 0, "Amount of substance matters.", hint),
    mc("Which case best illustrates heat transfer rather than temperature?", ["Energy flowing from a 70 deg C object to a 20 deg C object", "A thermometer reading of 70 deg C", "A mass of 2 kg", "A latent heat value"], 0, "Heat is about the transfer event.", hint),
    mc("Why is 'same temperature' weaker than 'same heating bill for the same rise'?", ["Equal temperature is only a snapshot, while the heating bill depends on mass and material too", "Equal temperature tells you the mass", "Equal temperature gives the latent heat", "Equal temperature means no heating occurred"], 0, "Heating comparisons need more than one clue.", hint),
    mc("If two objects are in contact and one is hotter, what should happen first?", ["Net heat transfer from hotter to cooler", "The cooler object loses energy to the hotter one", "Their masses become equal", "Their specific heat capacities match"], 0, "Transfer follows the temperature difference.", hint),
    mc("Which claim is strongest when comparing aluminium and water after the same energy transfer?", ["Water usually shows the smaller rise because its specific heat capacity is larger", "Aluminium cannot warm up", "Water must receive less energy", "The formula does not apply"], 0, "This is the standard comparison.", hint),
    mc("If two objects reach the same final temperature after contact, what can be concluded?", ["They have reached thermal equilibrium", "They must have equal masses", "They started at the same temperature", "They now have equal total thermal energy"], 0, "Thermal equilibrium is the strongest justified statement.", hint),
    shortCases([
      { prompt: "Why is equal temperature not enough to conclude equal total thermal energy?", acceptedAnswers: words("because mass can differ", "because mass and material can differ", "because the amount of substance can differ"), hint },
      { prompt: "If equal masses of the same material receive equal energy transfers, how do their temperature rises compare?", acceptedAnswers: words("they are equal", "the same"), hint },
      { prompt: "What flows from a hotter object to a cooler one: temperature or energy?", acceptedAnswers: words("energy", "heat", "thermal energy"), hint },
      { prompt: "If two objects are at the same temperature and there is no net transfer between them, what state have they reached?", acceptedAnswers: words("thermal equilibrium"), hint },
      { prompt: "A larger specific heat capacity means what kind of temperature rise for the same mass and same energy transfer?", acceptedAnswers: words("smaller", "a smaller rise"), hint },
      { prompt: "Name the two extra things you should check besides transferred energy when comparing temperature rise.", acceptedAnswers: words("mass and material", "mass and specific heat capacity"), hint },
      { prompt: "If a mug and a bathtub are both at 40 deg C, which is guaranteed to match?", acceptedAnswers: words("their temperature", "temperature"), hint },
      { prompt: "Which object usually needs more energy for the same temperature rise: a 3 kg block or a 1 kg block of the same material?", acceptedAnswers: words("the 3 kg block", "3 kg block"), hint },
      { prompt: "If the same energy is shared across more mass, does the temperature rise become larger or smaller?", acceptedAnswers: words("smaller"), hint },
      { prompt: "What is the best everyday meaning of temperature in this lesson?", acceptedAnswers: words("how hot or cold something is now", "the current thermal reading"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "For a heating stage with no state change, keep Q, m, c, and delta T visible together.";
  return [
    mc("Which equation should be used for a temperature rise with no change of state?", ["Q = mc delta T", "Q = mL", "P = IV", "F = ma"], 0, "Specific heat capacity questions use Q = mc delta T.", hint),
    mc("What are the units of specific heat capacity?", ["J/kg deg C", "J/kg", "kg/J", "deg C/J"], 0, "This quantity is energy per kilogram per degree.", hint),
    mc("How much energy is needed to warm 2 kg of a material with c = 500 J/kg deg C by 3 deg C?", ["3000 J", "1000 J", "6000 J", "1500 J"], 0, "Q = 2 x 500 x 3 = 3000 J.", hint),
    mc("If Q and m stay fixed but c increases, what happens to delta T?", ["delta T decreases", "delta T increases", "delta T stays the same", "delta T becomes zero"], 0, "A larger c gives a smaller rise for the same Q and m.", hint),
    mc("If Q and c stay fixed but mass doubles, what happens to delta T?", ["delta T halves", "delta T doubles", "delta T stays the same", "delta T becomes zero"], 0, "delta T is inversely proportional to mass.", hint),
    mc("If mass and c stay fixed but delta T doubles, what happens to Q?", ["Q doubles", "Q halves", "Q stays the same", "Q becomes zero"], 0, "Q is directly proportional to delta T.", hint),
    mc("A material with a larger specific heat capacity needs what for the same mass and same temperature rise?", ["More energy", "Less energy", "The same energy as every other material", "No energy"], 0, "Larger c means a larger heating bill.", hint),
    mc("What does specific heat capacity mean in words?", ["Energy needed to raise 1 kg by 1 deg C", "Mass needed to store 1 J", "Energy needed to melt 1 kg", "Temperature needed to heat 1 J"], 0, "This is the definition used in the lesson.", hint),
    mc("A 1.5 kg aluminium block has c = 900 J/kg deg C and rises by 12 deg C. What is Q?", ["16200 J", "10800 J", "2700 J", "1800 J"], 0, "Q = 1.5 x 900 x 12 = 16200 J.", hint),
    mc("A 2 kg sample receives 4800 J and rises by 6 deg C. What is c?", ["400 J/kg deg C", "2400 J/kg deg C", "1600 J/kg deg C", "600 J/kg deg C"], 0, "c = 4800 / (2 x 6) = 400.", hint),
    mc("A 0.20 kg sample with c = 4200 J/kg deg C receives 3360 J. What is the temperature rise?", ["4 deg C", "8 deg C", "2 deg C", "16 deg C"], 0, "delta T = 3360 / (0.2 x 4200) = 4.", hint),
    mc("Which question should not use Q = mc delta T?", ["Melting ice at constant temperature", "Warming water from 20 deg C to 30 deg C", "Cooling copper from 80 deg C to 50 deg C", "Heating oil by 10 deg C"], 0, "State-change stages need Q = mL instead.", hint),
    shortCases([
      { prompt: "What equation links heating energy, mass, specific heat capacity, and temperature change?", acceptedAnswers: words("Q = mc delta T", "q = mc delta t", "q=mc delta t", "mc delta t"), hint },
      { prompt: "How much energy is needed to warm 1 kg of a material with c = 400 J/kg deg C by 5 deg C?", acceptedAnswers: words("2000", "2000 J"), hint },
      { prompt: "A 2 kg sample receives 4800 J and rises by 6 deg C. What is c?", acceptedAnswers: words("400", "400 J/kg deg C"), hint },
      { prompt: "A 3360 J transfer warms water with c = 4200 J/kg deg C by 4 deg C. What mass was heated?", acceptedAnswers: words("0.2", "0.20", "0.2 kg", "0.20 kg"), hint },
      { prompt: "If the same material and same mass receive twice the energy, what happens to delta T?", acceptedAnswers: words("it doubles", "delta T doubles", "doubles"), hint },
      { prompt: "If the same Q and same c are used but mass is tripled, is the temperature rise larger or smaller?", acceptedAnswers: words("smaller"), hint },
      { prompt: "What does a larger specific heat capacity mean for the same mass and same temperature rise: more energy or less energy?", acceptedAnswers: words("more energy"), hint },
      { prompt: "What is the temperature rise if 900 J warms 0.5 kg of a material with c = 300 J/kg deg C?", acceptedAnswers: words("6", "6 deg C"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Choose the heating-stage formula first, then decide which quantity is unknown.";
  return [
    mc("Two 1 kg blocks are warmed by 10 deg C. Aluminium has c = 900 J/kg deg C and copper has c = 390 J/kg deg C. Which needs more energy?", ["Aluminium", "Copper", "They need the same energy", "There is not enough information"], 0, "For the same mass and rise, the larger c needs the larger Q.", hint),
    mc("A heater supplies 6000 J to a 2 kg sample with c = 500 J/kg deg C. What is the temperature rise?", ["6 deg C", "3 deg C", "12 deg C", "15 deg C"], 0, "delta T = 6000 / (2 x 500) = 6.", hint),
    mc("A sample warms by 8 deg C after receiving 3200 J. If its mass is 1 kg, what is c?", ["400 J/kg deg C", "3200 J/kg deg C", "25600 J/kg deg C", "40 J/kg deg C"], 0, "c = 3200 / (1 x 8) = 400.", hint),
    mc("What is the best interpretation of a larger specific heat capacity?", ["The material needs more energy per kilogram per degree", "The material always reaches a higher temperature", "The material cannot cool", "The material must be a liquid"], 0, "That is the physical meaning of c.", hint),
    mc("A fixed heater runs for the same time on equal masses of water and oil. Water warms less. What is the best reason?", ["Water has the larger specific heat capacity", "Water received less time", "Oil has a larger latent heat", "The thermometers are not comparable"], 0, "The transfer can be the same while c differs.", hint),
    mc("Which rearrangement is correct for delta T?", ["delta T = Q / (mc)", "delta T = mc / Q", "delta T = Qm / c", "delta T = c / (Qm)"], 0, "Rearranging the same formula keeps the physics unchanged.", hint),
    mc("A sample of mass 4 kg and c = 250 J/kg deg C warms by 2 deg C. What is Q?", ["2000 J", "500 J", "1000 J", "8000 J"], 0, "Q = 4 x 250 x 2 = 2000 J.", hint),
    mc("If two samples need the same energy for the same mass and same rise, what can you infer?", ["Their specific heat capacities are equal", "Their latent heats are equal", "They must be at the same starting temperature", "They must both be metals"], 0, "That is the clean inference from Q = mc delta T.", hint),
    mc("Why is Q = mc delta T stronger than a label-only answer?", ["It ties the heating bill to mass, material, and temperature change together", "It avoids using units", "It works during every state change", "It ignores mass"], 0, "The formula keeps the physical story coherent.", hint),
    mc("A 3 kg block needs 5400 J to warm by 6 deg C. What is c?", ["300 J/kg deg C", "900 J/kg deg C", "10800 J/kg deg C", "100 J/kg deg C"], 0, "c = 5400 / (3 x 6) = 300.", hint),
    shortCases([
      { prompt: "How much energy is needed to warm 2 kg of a material with c = 400 J/kg deg C by 5 deg C?", acceptedAnswers: words("4000", "4000 J"), hint },
      { prompt: "A 1 kg sample with c = 500 J/kg deg C receives 2500 J. What is the temperature rise?", acceptedAnswers: words("5", "5 deg C"), hint },
      { prompt: "A 2 kg material warms by 4 deg C after receiving 6400 J. What is c?", acceptedAnswers: words("800", "800 J/kg deg C"), hint },
      { prompt: "If c is larger, does the same energy give a larger or smaller temperature rise?", acceptedAnswers: words("smaller"), hint },
      { prompt: "Write c in words.", acceptedAnswers: words("energy needed to raise 1 kg by 1 deg c", "energy needed to raise one kilogram by one degree celsius"), hint },
      { prompt: "What is the unknown in c = Q / (m delta T)?", acceptedAnswers: words("specific heat capacity", "c"), hint },
      { prompt: "If the same heater gives the same energy to equal masses of copper and water, which usually shows the larger rise?", acceptedAnswers: words("copper"), hint },
      { prompt: "A material with low c warms quickly or slowly for the same mass and same energy transfer?", acceptedAnswers: words("quickly", "more quickly"), hint },
      { prompt: "What is the unit of c?", acceptedAnswers: words("J/kg deg C", "j/kg deg c"), hint },
      { prompt: "If mass is doubled and everything else is fixed, what happens to the heating bill Q?", acceptedAnswers: words("it doubles", "doubles"), hint },
    ]),
  ];
}
function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Before substituting, decide whether the stage is warming or changing state.";
  return [
    mc("Which equation should be used during a state change at constant temperature?", ["Q = mL", "Q = mc delta T", "P = IV", "E = Pt"], 0, "Latent-heat stages use Q = mL.", hint),
    mc("What does latent heat describe?", ["Energy transferred during a change of state without temperature change", "Energy needed to raise 1 kg by 1 deg C", "The current temperature of a sample", "The density of a fluid"], 0, "Latent heat belongs to the state-change stage.", hint),
    mc("If a sample is melting at constant temperature while energy is supplied, where is the energy going?", ["Into changing the state", "Into raising the temperature rapidly", "Into increasing the mass", "Into lowering the latent heat"], 0, "During the plateau, the energy pays the state-change bill.", hint),
    mc("What is the specific latent heat of fusion linked to?", ["Melting or freezing", "Boiling or condensing", "Heating by 1 deg C", "Conduction through a metal"], 0, "Fusion is the solid-liquid stage.", hint),
    mc("What is the specific latent heat of vaporization linked to?", ["Boiling or condensing", "Melting or freezing", "Convection", "Thermal equilibrium"], 0, "Vaporization is the liquid-gas stage.", hint),
    mc("How much energy is needed to melt 0.20 kg of ice if L = 3.3 x 10^5 J/kg?", ["6.6 x 10^4 J", "1.65 x 10^4 J", "3.3 x 10^5 J", "6.6 x 10^5 J"], 0, "Q = 0.20 x 3.3 x 10^5 = 6.6 x 10^4 J.", hint),
    mc("Water at 100 deg C receives 2.26 x 10^5 J. If L = 2.26 x 10^6 J/kg, how much evaporates?", ["0.10 kg", "1.0 kg", "0.01 kg", "10 kg"], 0, "m = Q / L = 0.10 kg.", hint),
    mc("Which clue shows that Q = mc delta T is the wrong rule?", ["The temperature is staying constant during the stage", "The sample has mass", "The material is a solid", "The heater is on"], 0, "No temperature change means the stage is not a warm-up stage.", hint),
    mc("If the mass doubles at the same latent heat, what happens to the total state-change energy bill?", ["It doubles", "It halves", "It stays the same", "It becomes zero"], 0, "Q = mL is directly proportional to mass.", hint),
    mc("Which statement is strongest?", ["A temperature plateau can still involve continuing energy transfer", "A plateau means the heater has stopped", "A plateau means the mass is zero", "A plateau means no energy is needed"], 0, "This is the key latent-heat idea.", hint),
    mc("What must be chosen first in a mixed thermal problem?", ["Which stage is warming and which stage is state change", "The final answer only", "The surface color", "The density of the container"], 0, "Stage choice protects the physics before calculation.", hint),
    mc("Which question definitely belongs to latent heat rather than specific heat capacity?", ["How much energy is needed to melt a solid at its melting point?", "How much energy is needed to warm water by 10 deg C?", "How much energy is lost while cooling from 80 deg C to 20 deg C?", "How large is the temperature rise after 500 J?"], 0, "Melting at the melting point is a state-change stage.", hint),
    shortCases([
      { prompt: "Write the latent-heat equation.", acceptedAnswers: words("Q = mL", "q = ml", "q=ml"), hint },
      { prompt: "During melting at constant temperature, does the energy mainly raise temperature or change state?", acceptedAnswers: words("change state", "it changes state"), hint },
      { prompt: "How much energy is needed to melt 0.5 kg if L = 200000 J/kg?", acceptedAnswers: words("100000", "100000 J"), hint },
      { prompt: "If 100000 J is used at a boiling stage with L = 500000 J/kg, what mass changes state?", acceptedAnswers: words("0.2", "0.20", "0.2 kg", "0.20 kg"), hint },
      { prompt: "What stays constant during a pure state-change plateau?", acceptedAnswers: words("temperature"), hint },
      { prompt: "What does a larger latent heat mean for the same mass?", acceptedAnswers: words("more energy", "a larger energy bill"), hint },
      { prompt: "Fusion refers to which pair of states?", acceptedAnswers: words("solid and liquid", "solid-liquid"), hint },
      { prompt: "Vaporization refers to which pair of states?", acceptedAnswers: words("liquid and gas", "liquid-gas"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "A plateau stage is a real transfer stage, so keep the state-change bill separate from warming.";
  return [
    mc("Ice at 0 deg C receives less energy than the full melting bill. What must be true?", ["Only part of the ice melts", "All of the ice melts and then warms", "The temperature rises above 0 deg C first", "Latent heat no longer applies"], 0, "If the available Q is below mL, only part can change state.", hint),
    mc("Why is Q = mc delta T wrong during boiling at 100 deg C?", ["Because the temperature is constant during the boiling stage", "Because the mass is too small", "Because boiling needs no energy", "Because c becomes zero"], 0, "The warm-up equation needs a non-zero temperature change.", hint),
    mc("A 0.40 kg sample has L = 150000 J/kg. What is the full state-change energy bill?", ["60000 J", "37500 J", "150000 J", "240000 J"], 0, "Q = 0.40 x 150000 = 60000 J.", hint),
    mc("A 0.30 kg sample receives 45000 J at a state-change stage with L = 150000 J/kg. What fraction changes state?", ["All of it", "Half of it", "One quarter of it", "None of it"], 0, "The full bill is 0.30 x 150000 = 45000 J, so the whole sample changes state.", hint),
    mc("What is the best explanation of a flat region on a heating curve during melting?", ["Energy is still being transferred but is used to separate particles into a new state", "The heater has failed", "No energy is entering the sample", "The sample has reached thermal equilibrium"], 0, "The plateau is a latent-heat stage.", hint),
    mc("A student uses Q = mL to warm liquid water from 20 deg C to 30 deg C. What is wrong?", ["That stage is a temperature-rise stage, so Q = mc delta T is needed", "The mass must be zero", "The latent heat is always larger", "Water cannot be heated"], 0, "Latent heat is only for state changes.", hint),
    mc("If the latent heat of vaporization is much larger than the latent heat of fusion, what follows for equal mass samples?", ["Boiling needs more energy than melting", "Melting needs more energy than boiling", "Both always need the same energy", "Neither needs energy"], 0, "The larger L creates the larger state-change bill.", hint),
    mc("What should be added at the end of a full thermal problem that includes warming and melting?", ["The separate stage energies", "The masses of the samples", "The temperatures directly", "The specific heats only"], 0, "Stage-by-stage totals must be summed.", hint),
    mc("If a sample is already at its melting point and receives energy, what should be checked first?", ["Whether the energy should go into a latent-heat stage", "Whether its mass is now zero", "Whether radiation has stopped", "Whether the specific heat capacity has doubled"], 0, "Stage choice comes before substitution.", hint),
    mc("Which answer best protects the physics?", ["A plateau means the transferred energy is paying for a state change rather than a temperature rise", "A plateau means no energy transfer is happening", "A plateau means the sample cannot melt", "A plateau means the sample is cooling"], 0, "That is the rigorous interpretation of the plateau.", hint),
    shortCases([
      { prompt: "Why can temperature stay constant while energy is still supplied during melting?", acceptedAnswers: words("because the energy changes the state", "because the energy is used for the state change", "because the energy goes into latent heat"), hint },
      { prompt: "What is the full melting bill for 0.20 kg if L = 330000 J/kg?", acceptedAnswers: words("66000", "66000 J"), hint },
      { prompt: "If only 33000 J is supplied in that case, does all the sample melt?", acceptedAnswers: words("no", "no it does not"), hint },
      { prompt: "At constant temperature, which equation is safer: Q = mc delta T or Q = mL?", acceptedAnswers: words("Q = mL", "q = ml"), hint },
      { prompt: "A larger mass at the same latent heat needs what kind of state-change energy bill?", acceptedAnswers: words("larger", "a larger bill", "more energy"), hint },
      { prompt: "If water is already boiling, what does extra energy mainly do first?", acceptedAnswers: words("change liquid to gas", "change state", "boil more water"), hint },
      { prompt: "What is the unit of latent heat in these questions?", acceptedAnswers: words("J/kg", "j/kg"), hint },
      { prompt: "Which stage uses Q = mc delta T: warming or changing state?", acceptedAnswers: words("warming", "the warming stage"), hint },
      { prompt: "What is the state pair for vaporization?", acceptedAnswers: words("liquid and gas", "liquid-gas"), hint },
      { prompt: "If the full bill is not reached, what happens to the state change?", acceptedAnswers: words("it is incomplete", "only part changes state", "it does not finish"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Trace the contact path first, then compare the materials.";
  return [
    mc("What is conduction?", ["Thermal energy transfer through matter by direct contact", "Thermal energy transfer by bulk fluid motion", "Thermal energy transfer through empty space only", "Mass transfer from hot to cold"], 0, "Conduction is the contact-route process.", hint),
    mc("Which material is usually the better thermal conductor?", ["Copper", "Wood", "Foam", "Air"], 0, "Metals conduct well.", hint),
    mc("Why does a metal spoon in hot soup warm at the handle quickly?", ["Conduction through the solid spoon", "Convection inside the metal spoon", "Radiation from the handle to the soup", "Latent heat at the handle"], 0, "The spoon provides a direct contact path.", hint),
    mc("What is the best explanation for foam on a saucepan handle?", ["It slows conduction to the hand", "It makes the pan colder", "It creates convection in the handle", "It increases latent heat"], 0, "Foam is a poor conductor.", hint),
    mc("Which clue most strongly supports conduction?", ["An unbroken solid contact path", "A moving fluid loop", "A vacuum gap", "A shiny surface"], 0, "The contact path is the route clue.", hint),
    mc("Why are metals often good conductors of thermal energy?", ["Free electrons help pass energy through the structure", "They always have lower mass", "They cannot change temperature", "They always emit less radiation"], 0, "This is the metal-specific reason.", hint),
    mc("What happens to strong conduction if a gap interrupts a metal rod?", ["The rate falls sharply because the contact path is broken", "The rate becomes larger", "Nothing changes", "Conduction turns into latent heat"], 0, "The relay route has been interrupted.", hint),
    mc("Which material is usually the better insulator?", ["Foam", "Aluminium", "Copper", "Steel"], 0, "Foam resists thermal transfer.", hint),
    mc("If the temperature difference across the same metal bar becomes larger, what usually happens to the conduction rate?", ["It increases", "It decreases", "It stays exactly the same", "It becomes zero"], 0, "A larger driving difference usually gives a faster transfer.", hint),
    mc("Which statement is strongest?", ["The solid stays in place while energy passes through it", "The whole solid flows from hot to cold", "Conduction needs a fluid current", "Conduction only works in a vacuum"], 0, "Conduction is not bulk motion.", hint),
    mc("A shiny metal pan handle still becomes hot if it is all metal. What matters most?", ["The continuous conducting path to the hot pan", "The fact that the handle is shiny", "The latent heat of the handle", "The color alone"], 0, "Path and material are the main clues.", hint),
    mc("Why does trapped air often make good insulation?", ["It reduces the ease of conduction and suppresses convection", "It is a better metal", "It increases temperature automatically", "It forces radiation to stop"], 0, "Air is a poor conductor and can reduce fluid motion when trapped.", hint),
    shortCases([
      { prompt: "Name the transfer route through a metal spoon from the soup to the handle.", acceptedAnswers: words("conduction"), hint },
      { prompt: "What kind of contact path does strong conduction need?", acceptedAnswers: words("an unbroken contact path", "a continuous contact path", "direct contact"), hint },
      { prompt: "Why is foam useful on a hot handle?", acceptedAnswers: words("it is a poor conductor", "it slows conduction", "it reduces conduction"), hint },
      { prompt: "What helps metals conduct thermal energy well?", acceptedAnswers: words("free electrons", "electrons"), hint },
      { prompt: "If a gap is introduced, does conduction become stronger or weaker?", acceptedAnswers: words("weaker"), hint },
      { prompt: "Which is usually the better conductor: copper or wood?", acceptedAnswers: words("copper"), hint },
      { prompt: "Does the solid itself flow from one end to the other during conduction?", acceptedAnswers: words("no"), hint },
      { prompt: "What usually happens to conduction if the temperature difference gets larger on the same path?", acceptedAnswers: words("it increases", "it becomes faster"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Explain conduction as a relay through matter, not as flowing solid material.";
  return [
    mc("A metal rod with one hot end is wrapped with insulation halfway along. What is the best effect?", ["The rate of energy transfer to the far end is reduced", "The hot end instantly becomes cold", "Conduction turns into convection inside the rod", "The rod can no longer have a temperature"], 0, "Insulation slows the route.", hint),
    mc("Why does a wooden spoon usually feel safer than a metal spoon in hot soup?", ["Wood is a poorer thermal conductor", "Wood has zero temperature", "Wood always has lower mass", "Wood absorbs all radiation"], 0, "The route is the same, but the material quality differs.", hint),
    mc("Which explanation is strongest for a metal pan heating all over on a hob?", ["Energy is passed through the metal by conduction", "The metal itself circulates like a fluid", "The pan is melting", "Latent heat is moving the metal"], 0, "The solid stays in place while energy spreads.", hint),
    mc("Why does a vacuum flask use a vacuum gap?", ["A vacuum removes conduction and convection across the gap", "A vacuum increases specific heat capacity", "A vacuum creates a metal path", "A vacuum guarantees no radiation"], 0, "Conduction and convection need matter.", hint),
    mc("What is the best route explanation for heat through a brick wall?", ["Mostly conduction through the wall material", "Convection through the solid bricks", "Latent heat through the wall", "Only radiation through the bricks"], 0, "Solid walls are conduction questions first.", hint),
    mc("What combination best reduces transfer through a pan handle?", ["A poor conductor and a broken direct contact path", "A larger mass and a darker surface", "A larger latent heat only", "A lower thermometer reading only"], 0, "Path plus poor material is strongest.", hint),
    mc("Why can a thin metal bar still conduct well?", ["Conduction depends on the material and the direct route, not only on thickness labels", "Thin bars cannot conduct", "Only thick bars conduct", "Conduction needs fluid motion"], 0, "The material identity still matters strongly.", hint),
    mc("Which statement is most rigorous?", ["Conduction is faster in good conductors and along direct contact paths", "Conduction only depends on color", "Conduction needs density differences in a fluid", "Conduction cannot happen in solids"], 0, "Both material and route matter.", hint),
    mc("What is the best reason a metal rod with a larger temperature difference transfers energy more quickly?", ["A larger driving difference pushes faster conduction along the same path", "Its latent heat increases", "The rod becomes a fluid", "Mass transfer begins"], 0, "The route is unchanged, but the driving difference is larger.", hint),
    mc("Why does trapped air in wool help keep a jumper warm?", ["It reduces conduction and prevents large convection currents", "It makes the jumper radioactive", "It turns the fibres into metals", "It increases the wearer's mass"], 0, "This is the standard insulation explanation.", hint),
    shortCases([
      { prompt: "Why does a gap in a rod reduce conduction strongly?", acceptedAnswers: words("because the contact path is broken", "because direct contact is broken", "because the conduction path is broken"), hint },
      { prompt: "Why are metals usually good conductors?", acceptedAnswers: words("because free electrons help transfer energy", "because electrons help transfer energy"), hint },
      { prompt: "What route mostly carries energy through a solid wall?", acceptedAnswers: words("conduction"), hint },
      { prompt: "In a vacuum gap, which two routes are removed first?", acceptedAnswers: words("conduction and convection"), hint },
      { prompt: "What kind of material is foam as a thermal pathway?", acceptedAnswers: words("an insulator", "poor conductor"), hint },
      { prompt: "If the same bar has a larger temperature difference, does the conduction rate usually become faster or slower?", acceptedAnswers: words("faster"), hint },
      { prompt: "Does conduction require the whole solid to move?", acceptedAnswers: words("no"), hint },
      { prompt: "What is the key route clue for conduction?", acceptedAnswers: words("direct contact", "contact path", "continuous contact"), hint },
      { prompt: "Why is a saucepan handle safer when wrapped?", acceptedAnswers: words("it reduces thermal energy transfer to the hand", "it slows conduction to the hand", "it reduces conduction"), hint },
      { prompt: "Which is the better insulator in everyday use: trapped air or copper?", acceptedAnswers: words("trapped air", "air"), hint },
    ]),
  ];
}
function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Convection needs a fluid loop with density changes, not just the slogan 'heat rises'.";
  return [
    mc("What is convection?", ["Thermal energy transfer by bulk movement of a fluid", "Thermal energy transfer by direct contact in a solid", "Thermal energy transfer only by radiation", "Energy stored during melting"], 0, "Convection is the moving-fluid route.", hint),
    mc("Why does warm fluid rise?", ["It becomes less dense", "Its latent heat becomes zero", "Its mass disappears", "Its specific heat capacity doubles"], 0, "Heating expands the fluid and lowers density.", hint),
    mc("What must happen elsewhere in a full convection current?", ["Cooler fluid must move in or sink to complete the loop", "Nothing else needs to happen", "The fluid must become a solid", "Only radiation continues"], 0, "A true current is a circulation loop.", hint),
    mc("Where is convection strongest?", ["In fluids such as liquids and gases", "Inside solid copper bars", "Across a vacuum gap only", "During every melting plateau"], 0, "Fluids can flow as bulk regions.", hint),
    mc("Why can a solid metal block not form a convection current inside itself?", ["A solid cannot flow as a bulk fluid loop", "A solid has no temperature", "A solid cannot conduct", "A solid always radiates instead"], 0, "Convection needs moving fluid parcels.", hint),
    mc("Why is heating from below often effective at creating convection?", ["Warm low-density fluid forms beneath cooler denser fluid", "The heater changes latent heat directly", "Heating from below stops radiation", "Heating from below removes mass"], 0, "That arrangement drives circulation well.", hint),
    mc("Which explanation is stronger than simply saying 'heat rises'?", ["Warm fluid becomes less dense and rises while cooler denser fluid returns", "Heat floats upward by itself", "Hot objects always rise no matter what", "Only the heater moves"], 0, "The loop explanation is more rigorous.", hint),
    mc("A radiator warms air near the floor. Why does warm air then rise?", ["The warmed air expands and becomes less dense", "Its mass becomes zero", "Its specific heat capacity becomes zero", "It changes state"], 0, "This is the density explanation.", hint),
    mc("What usually happens to cooler denser fluid in a convection current?", ["It sinks or moves in to replace the warm rising fluid", "It disappears", "It becomes the heater", "It blocks all radiation"], 0, "Return flow completes the loop.", hint),
    mc("Which clue most strongly indicates convection?", ["A circulating fluid current", "A metal contact path", "A vacuum gap", "A shiny surface"], 0, "Moving fluid is the route clue.", hint),
    mc("Why does water in a pan circulate when heated from below?", ["Density differences set up a convection current", "The water conducts like a metal bar only", "The water melts first", "The water loses all mass"], 0, "This is the classic fluid-loop case.", hint),
    mc("Which medium can support a convection current?", ["Air", "A vacuum", "A rigid solid block", "None of them"], 0, "Convection needs a fluid medium.", hint),
    shortCases([
      { prompt: "Which transfer route uses moving fluid parcels?", acceptedAnswers: words("convection"), hint },
      { prompt: "Why does warm fluid rise?", acceptedAnswers: words("because it becomes less dense", "because heating makes it less dense"), hint },
      { prompt: "What completes a convection current after warm fluid rises?", acceptedAnswers: words("cool fluid sinks", "cooler fluid sinks", "cooler fluid moves in"), hint },
      { prompt: "Can a solid block form a convection current inside itself?", acceptedAnswers: words("no"), hint },
      { prompt: "What kind of medium does convection need?", acceptedAnswers: words("a fluid", "fluid"), hint },
      { prompt: "Why is heating from below often stronger for convection than heating from above?", acceptedAnswers: words("because warm less dense fluid forms underneath cooler denser fluid", "because it puts warm fluid under cool fluid"), hint },
      { prompt: "Does a true convection explanation stop at 'heat rises'?", acceptedAnswers: words("no"), hint },
      { prompt: "Name one fluid that can convect.", acceptedAnswers: words("air", "water"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Show the whole circulation: heating, density change, rise, and return flow.";
  return [
    mc("Why does a room often warm more effectively when a radiator is near the floor?", ["It creates warm low-density air beneath cooler denser air, which drives circulation", "It removes radiation from the room", "It melts the air", "It turns conduction off"], 0, "The placement encourages a full loop.", hint),
    mc("A student says, 'Heat rises.' What is the best upgrade?", ["Warm fluid rises because it becomes less dense, and cooler fluid returns to complete a convection current", "Heat is a gas that floats upward by itself", "Only hot objects rise, not fluids", "Convection is the same as radiation"], 0, "The loop explanation is the rigorous one.", hint),
    mc("Why is convection weak or absent in a sealed vacuum flask gap?", ["There is no fluid present to circulate", "The gap contains too much metal", "Specific heat capacity is too low", "Temperature does not exist there"], 0, "Convection needs a fluid medium.", hint),
    mc("Which situation best supports convection?", ["Boiling water in a pan", "Heat moving through a copper rod", "Sunlight crossing space", "Ice melting at 0 deg C"], 0, "Only the water case is a moving-fluid loop.", hint),
    mc("Why can warm air from a heater move across the top of a room before later cooling and sinking?", ["It is part of the full convection circulation", "It means the air is conducting like metal", "It shows latent heat only", "It proves the air has zero density"], 0, "The loop includes more than the upward path.", hint),
    mc("Why does heating a liquid from the top usually give weaker convection than heating from below?", ["The warm low-density liquid is already on top, so the density arrangement drives less circulation", "The liquid becomes a solid", "Heating from the top removes gravity", "Latent heat becomes dominant"], 0, "The density arrangement matters.", hint),
    mc("Which is the best reason a solid saucepan base does not itself convect?", ["The solid does not flow as a bulk fluid", "The solid has no particles", "The solid cannot gain energy", "The solid is always less dense"], 0, "Convection needs bulk fluid motion.", hint),
    mc("What happens to convection if the warm-cool density contrast becomes stronger?", ["The circulation usually becomes stronger", "It must stop", "It becomes conduction", "It becomes latent heat"], 0, "A stronger density difference drives stronger motion.", hint),
    mc("Which route carries energy around a hot-air balloon envelope most directly as the surrounding air circulates?", ["Convection in the air", "Conduction through the vacuum", "Latent heat in the balloon fabric", "None of the above"], 0, "Moving air around the envelope is a convection story.", hint),
    mc("Why does cooler fluid need to move in when warmer fluid rises?", ["Mass must still fill the space, so the loop closes with return flow", "Because the fluid disappears", "Because all cool fluid is heavier than metals", "Because radiation cannot travel"], 0, "Convection is circulation, not one-way escape.", hint),
    shortCases([
      { prompt: "Why is 'heat rises' weaker than a full convection explanation?", acceptedAnswers: words("because convection needs a full loop", "because you must explain density change and return flow", "because you need the whole fluid loop"), hint },
      { prompt: "What property of warm fluid changes first to help it rise?", acceptedAnswers: words("density", "it becomes less dense"), hint },
      { prompt: "What must the cooler fluid do in a convection current?", acceptedAnswers: words("sink", "move in", "return downward"), hint },
      { prompt: "Can a vacuum support convection?", acceptedAnswers: words("no"), hint },
      { prompt: "Why does heating from below encourage convection?", acceptedAnswers: words("because warm less dense fluid forms underneath cooler denser fluid", "because it puts warm fluid under cool fluid"), hint },
      { prompt: "What kind of movement makes convection different from conduction?", acceptedAnswers: words("bulk movement of the fluid", "fluid movement", "movement of the fluid"), hint },
      { prompt: "Name one everyday place where convection happens.", acceptedAnswers: words("radiator", "boiling water", "air above a heater"), hint },
      { prompt: "If warm fluid rises and nothing returns, is that a full convection current?", acceptedAnswers: words("no"), hint },
      { prompt: "What usually happens to convection if the density difference is reduced?", acceptedAnswers: words("it becomes weaker", "weaker"), hint },
      { prompt: "What route usually spreads energy through the circulating water in a pan?", acceptedAnswers: words("convection"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Choose the route first, then split any multi-stage thermal calculation into separate bills.";
  return [
    mc("Which transfer route can cross a vacuum gap?", ["Radiation", "Conduction", "Convection", "Latent heat"], 0, "Radiation does not need matter.", hint),
    mc("Which surface is usually the better absorber of thermal radiation?", ["Dull black", "Shiny silver", "Transparent glass", "White polished metal"], 0, "Dark dull surfaces absorb more effectively.", hint),
    mc("Which surface is usually the poorer emitter of thermal radiation?", ["Shiny silver", "Dull black", "Rough black paint", "Matt dark metal"], 0, "Shiny silver surfaces emit poorly.", hint),
    mc("Why does the Earth receive energy from the Sun through space?", ["Radiation can travel through a vacuum", "Conduction is strongest in a vacuum", "Convection crosses space easily", "Latent heat travels through empty space"], 0, "This is the route clue.", hint),
    mc("A dull black can and a shiny can are placed the same distance from a heater. Which usually warms faster?", ["The dull black can", "The shiny can", "They always warm equally", "There is not enough information"], 0, "The better absorber warms faster.", hint),
    mc("Which planning step is safest for a problem that warms a solid and then melts it?", ["Calculate the warm-up stage and the melting stage separately, then add them", "Use Q = mc delta T for the whole story", "Use Q = mL for the whole story", "Ignore the state change"], 0, "Mixed stages need mixed rules.", hint),
    mc("A 0.80 kg sample warms from 20 deg C to 70 deg C with c = 420 J/kg deg C. What is the warm-up energy?", ["16800 J", "33600 J", "21000 J", "160800 J"], 0, "Q = 0.80 x 420 x 50 = 16800 J.", hint),
    mc("The same sample then melts with L = 1.8 x 10^5 J/kg. What is the melting energy?", ["144000 J", "14400 J", "180000 J", "160800 J"], 0, "Q = 0.80 x 1.8 x 10^5 = 144000 J.", hint),
    mc("What is the total energy for those two stages together?", ["160800 J", "144000 J", "16800 J", "126000 J"], 0, "Add 16800 J and 144000 J.", hint),
    mc("Which claim is strongest?", ["A good absorber is also usually a good emitter", "A shiny surface is always the best absorber", "Radiation needs direct contact", "Radiation cannot cross air"], 0, "Dark dull surfaces are strong absorbers and emitters.", hint),
    mc("Which route is most important between a heater and a target across a clear gap?", ["Radiation", "Conduction through the gap", "Convection through the solid target only", "Latent heat"], 0, "Across a gap, radiation is the main route.", hint),
    mc("What is wrong with using one formula for a process that warms, melts, and warms again?", ["Different stages use different equations", "Mass stops mattering", "Temperature stops existing", "Radiation is always larger"], 0, "Stage choice is the main protection.", hint),
    shortCases([
      { prompt: "Which transfer route crosses a vacuum gap?", acceptedAnswers: words("radiation"), hint },
      { prompt: "Which surface is usually the stronger absorber: dull black or shiny silver?", acceptedAnswers: words("dull black", "black"), hint },
      { prompt: "What is the warm-up energy for 2 kg with c = 500 J/kg deg C and delta T = 4 deg C?", acceptedAnswers: words("4000", "4000 J"), hint },
      { prompt: "What is the latent-heat energy for 0.5 kg with L = 200000 J/kg?", acceptedAnswers: words("100000", "100000 J"), hint },
      { prompt: "If a process has a warm-up stage and a melting stage, what do you do with the two energies?", acceptedAnswers: words("add them", "sum them", "calculate separately and add"), hint },
      { prompt: "Which surface is usually the poorer emitter: shiny or dull black?", acceptedAnswers: words("shiny", "shiny silver"), hint },
      { prompt: "Why can the Sun warm the Earth across space?", acceptedAnswers: words("because radiation can travel through a vacuum", "because radiation crosses a vacuum"), hint },
      { prompt: "What is the total of 12000 J and 200000 J?", acceptedAnswers: words("212000", "212000 J"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Across a gap, think radiation; across a mixed process, think separate stages and then sum.";
  return [
    mc("Why is a shiny silver flask lining useful?", ["It reduces emission and absorption of thermal radiation", "It increases convection", "It makes conduction through the vacuum stronger", "It adds latent heat"], 0, "Shiny silver is a poor absorber and emitter.", hint),
    mc("A dull black panel and a shiny panel face the same heater across a gap. Why does the dull black panel often warm more quickly?", ["It absorbs more radiation", "It conducts through the gap better", "It creates a stronger convection current in the vacuum", "Its latent heat is always smaller"], 0, "Surface absorption is the key difference.", hint),
    mc("A sample warms, melts, then warms again. Which set of equations is most appropriate?", ["Q = mc delta T for the warm-up stages and Q = mL for the melting stage", "Q = mL for every stage", "Q = mc delta T for every stage", "No equation is needed"], 0, "That matches the physics stage by stage.", hint),
    mc("If a dark surface is a good absorber, what else is it usually?", ["A good emitter", "A poor emitter", "A good conductor only", "Unable to radiate"], 0, "Absorption and emission track together.", hint),
    mc("Which is the best route explanation for the Sun heating the Earth?", ["Radiation carries the energy across space", "Conduction through the vacuum", "Convection in the vacuum", "Latent heat through space"], 0, "This is the standard route explanation.", hint),
    mc("Why is it unsafe to merge the latent-heat stage into Q = mc delta T in a multi-stage calculation?", ["The latent-heat stage happens without a temperature change", "The mass becomes zero", "Specific heat capacity becomes infinite", "Radiation stops existing"], 0, "That stage uses a different physical rule.", hint),
    mc("A 1 kg sample warms by 20 deg C with c = 400 J/kg deg C and then melts with L = 100000 J/kg. What is the total energy?", ["108000 J", "8000 J", "100000 J", "40000 J"], 0, "Warm-up is 8000 J and melting is 100000 J, so total is 108000 J.", hint),
    mc("Which surface property is most useful for reducing radiation loss from a hot object?", ["Shiny and reflective", "Dark and rough", "Large and black", "Transparent"], 0, "Shiny reflective surfaces emit less strongly.", hint),
    mc("Why do stage labels improve thermal calculations?", ["They stop you from forcing one equation across unlike stages", "They remove the need for units", "They make mass irrelevant", "They turn radiation into conduction"], 0, "Stage labels protect the model.", hint),
    mc("What is the best upgrade to a label-only answer in thermal transfer?", ["Name the route and explain why that route fits the physical setup", "Use any familiar formula", "Mention only the hottest object", "Ignore the gap or the contact path"], 0, "The route must match the setup clues.", hint),
    shortCases([
      { prompt: "Why is shiny silver useful for reducing radiation transfer?", acceptedAnswers: words("because it is a poor absorber and poor emitter", "because it reflects radiation well", "because it emits and absorbs less radiation"), hint },
      { prompt: "What route carries energy across the gap from the Sun to Earth?", acceptedAnswers: words("radiation"), hint },
      { prompt: "What is the warm-up energy for 1 kg, c = 400 J/kg deg C, and delta T = 20 deg C?", acceptedAnswers: words("8000", "8000 J"), hint },
      { prompt: "What is the melting energy for 1 kg with L = 100000 J/kg?", acceptedAnswers: words("100000", "100000 J"), hint },
      { prompt: "What is the total of those two stages?", acceptedAnswers: words("108000", "108000 J"), hint },
      { prompt: "A dark dull surface is usually a good absorber and what else?", acceptedAnswers: words("good emitter", "a good emitter"), hint },
      { prompt: "If a process includes warming and boiling, should you use one stage or separate stages?", acceptedAnswers: words("separate stages", "calculate separate stages"), hint },
      { prompt: "Why is radiation the safest route across a vacuum gap?", acceptedAnswers: words("because conduction and convection need matter", "because radiation does not need matter"), hint },
      { prompt: "Which surface usually warms faster under the same beam: shiny silver or dull black?", acceptedAnswers: words("dull black", "black"), hint },
      { prompt: "What final step comes after calculating each thermal stage correctly?", acceptedAnswers: words("add the stage energies", "sum the stage energies", "add them"), hint },
    ]),
  ];
}

function diagnosticRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M6_L1":
      return l1DiagnosticRaw();
    case "M6_L2":
      return l2DiagnosticRaw();
    case "M6_L3":
      return l3DiagnosticRaw();
    case "M6_L4":
      return l4DiagnosticRaw();
    case "M6_L5":
      return l5DiagnosticRaw();
    case "M6_L6":
      return l6DiagnosticRaw();
    default:
      return [];
  }
}

function conceptRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M6_L1":
      return l1ConceptRaw();
    case "M6_L2":
      return l2ConceptRaw();
    case "M6_L3":
      return l3ConceptRaw();
    case "M6_L4":
      return l4ConceptRaw();
    case "M6_L5":
      return l5ConceptRaw();
    case "M6_L6":
      return l6ConceptRaw();
    default:
      return [];
  }
}

export function m6GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  return materializeBank(code, "diagnostic", diagnosticRaw(code));
}

export function m6GeneratedConceptGateItems(code: string): UnknownRecord[] {
  return materializeBank(code, "concept", conceptRaw(code));
}

export function m6GeneratedMasteryItems(code: string): UnknownRecord[] {
  return materializeBank(code, "mastery", [...diagnosticRaw(code), ...conceptRaw(code)]);
}
