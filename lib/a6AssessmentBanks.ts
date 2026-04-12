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
  hint = "Rebuild the thermal or gas relation before choosing.",
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

function materializeBank(code: string, kind: BankKind, rawItems: RawCollectionItem[]): UnknownRecord[] {
  const flattened = rawItems.flat();
  const seenSignatures = new Set<string>();
  const deduped = flattened.flatMap((item, index) => {
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
    throw new Error(`A6 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function formatNumber(value: number, digits = 3): string {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function valueWithUnit(value: number, unit: string, digits = 3): string {
  return `${formatNumber(value, digits)} ${unit}`;
}

function numericAnswers(value: number, unit: string, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain} ${unit}`]));
}

function oneDpAnswers(value: number, unit: string): string[] {
  return numericAnswers(value, unit, 1);
}

function twoDpAnswers(value: number, unit: string): string[] {
  return numericAnswers(value, unit, 2);
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Separate average-per-particle energy from whole-sample internal energy.";
  return [
    mc("What does temperature track in the ideal-gas particle model?", ["average kinetic energy per particle", "total internal energy of the whole sample", "number of particles only", "volume only"], 0, "Temperature is an average-particle-motion story.", hint),
    mc("What does internal energy describe?", ["the total microscopic kinetic and potential energy store of the sample", "the average energy of one particle only", "the mass of the gas", "the wall area of the container"], 0, "Internal energy belongs to the whole sample.", hint),
    mc("Two ideal-gas samples are at the same temperature. What must be the same?", ["their average kinetic energy per particle", "their total internal energy", "their number of particles", "their volume"], 0, "Equal temperature means equal average particle kinetic energy.", hint),
    mc("Two ideal-gas samples are at the same temperature, but one has more particles. Which sample has the larger internal energy?", ["the sample with more particles", "both have the same internal energy", "the sample with fewer particles", "it cannot be compared"], 0, "At the same temperature, more particles means a larger total store.", hint),
    ...[
      { t1: 300, t2: 600, factor: "double" },
      { t1: 250, t2: 500, factor: "double" },
      { t1: 200, t2: 400, factor: "double" },
      { t1: 300, t2: 450, factor: "increase by 1.5 times" },
    ].map((entry) =>
      mc(
        `An ideal-gas sample changes from ${entry.t1} K to ${entry.t2} K. What happens to the average kinetic energy per particle?`,
        [entry.factor, "it stays the same", "it halves", "it depends only on the particle count"],
        0,
        "Average kinetic energy is proportional to absolute temperature.",
        hint,
      ),
    ),
    ...[
      { celsius: 27, kelvin: 300 },
      { celsius: 47, kelvin: 320 },
      { celsius: 77, kelvin: 350 },
      { celsius: 127, kelvin: 400 },
    ].map((entry) =>
      mc(
        `${entry.celsius} C is closest to which absolute temperature?`,
        [`${entry.kelvin} K`, `${entry.celsius} K`, `${entry.kelvin + 273} K`, `${entry.kelvin - 100} K`],
        0,
        "Convert to kelvin by adding about 273.",
        hint,
      ),
    ),
    shortCases([
      { prompt: "Temperature is an ... per-particle energy story.", acceptedAnswers: ["average", "average kinetic"], hint: "It does not describe the whole total store directly." },
      { prompt: "Internal energy belongs to the ... sample, not just one particle.", acceptedAnswers: ["whole", "entire"], hint: "Think total microscopic store." },
      { prompt: "Equal temperature means equal average particle kinetic ...", acceptedAnswers: ["energy"], hint: "Name the shared quantity." },
      { prompt: "At the same temperature, more particles means larger internal ...", acceptedAnswers: ["energy"], hint: "The total store scales with how much gas there is." },
      { prompt: "Ideal-gas temperature relations should use ...", acceptedAnswers: ["kelvin", "k"], hint: "Use the absolute scale." },
      { prompt: "Temperature rise changes the average particle ... energy.", acceptedAnswers: ["kinetic"], hint: "That is the microscopic motion quantity." },
      { prompt: "A strong A6_L1 answer separates average particle energy from the whole-sample ...", acceptedAnswers: ["store", "internal energy", "energy store"], hint: "Keep average and total distinct." },
      { prompt: "Same temperature does not force equal internal ...", acceptedAnswers: ["energy"], hint: "Particle count still matters." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep average and total thermal stories separate.";
  return [
    mc("Why is it weak to say 'same temperature means same internal energy'?", ["temperature fixes an average per particle, while internal energy also depends on how many particles the sample contains", "temperature and internal energy are unrelated quantities", "internal energy depends only on volume", "same temperature means same mass"], 0, "A6_L1 protects average-versus-total reasoning.", hint),
    mc("Why must kelvin be used in ideal-gas particle-energy reasoning?", ["the relations depend on absolute temperature measured from zero kinetic baseline", "kelvin makes the numbers smaller", "celsius cannot describe gases", "kelvin removes the need to compare ratios"], 0, "Proportional temperature relations need the absolute scale.", hint),
    mc("Why can two containers at the same temperature have different internal energies?", ["one container can contain more particles, so the total microscopic store is larger even with the same average per particle", "the warmer container always has fewer particles", "internal energy depends only on container shape", "same temperature forces same particle count"], 0, "Internal energy is a whole-sample quantity.", hint),
    mc("Why is 'hotter means more internal energy' incomplete without extra context?", ["the amount of gas may differ, so total internal energy cannot be judged from temperature alone", "temperature never affects energy", "internal energy depends only on pressure", "same temperature means same mass"], 0, "A higher temperature raises average particle energy, but total store also depends on amount.", hint),
    mc("Which statement best protects the A6_L1 lesson meaning?", ["Temperature is an average-per-particle story, while internal energy belongs to the whole microscopic store.", "Temperature and internal energy are always interchangeable names.", "Internal energy can be found from temperature alone in every case.", "More volume always means higher temperature."], 0, "That statement keeps the key distinction visible.", hint),
    mc("Why is particle count central in whole-sample thermal comparisons?", ["the total microscopic store adds over all the particles", "particle count determines the unit of temperature", "particle count replaces kelvin conversion", "particle count only affects pressure"], 0, "More particles contribute more total energy at the same average energy per particle.", hint),
    mc("Why is the phrase 'average kinetic energy' better than just 'kinetic energy' in this lesson?", ["it makes clear that temperature refers to a per-particle average, not the total of the sample", "it means the gas cannot have internal energy", "it removes the need for kelvin", "it applies only to solids"], 0, "The average wording prevents total-store confusion.", hint),
    mc("Why does doubling the particle count at fixed temperature increase internal energy without changing temperature?", ["the average per particle stays the same while the sample contains more particles contributing to the total", "temperature depends directly on total internal energy only", "doubling particle count forces the kelvin temperature to double", "the gas stops being ideal"], 0, "Total and average do different jobs.", hint),
    mc("Why should a worked example show both same-temperature and different-particle-count cases?", ["it makes the average-versus-total contrast explicit instead of leaving it as a slogan", "it proves internal energy equals pressure", "it removes the need for kelvin", "it turns temperature into a whole-sample quantity"], 0, "Concrete contrasts prevent the common mix-up.", hint),
    mc("What common mistake is A6_L1 preventing?", ["equating temperature with total internal energy of the whole sample", "thinking gases have particles", "believing kelvin and celsius are identical scales", "thinking volume is measured in kelvin"], 0, "The lesson is defending average-versus-total clarity.", hint),
    mc("Why can a large cold sample still have more internal energy than a small hot sample?", ["the larger sample may contain enough more particles that the total microscopic store is greater", "internal energy depends only on temperature", "the cold sample must have higher pressure", "the hotter sample always has more particles"], 0, "Whole-sample amount matters alongside temperature.", hint),
    mc("Why should ideal-gas internal-energy reasoning not drift into pressure-first explanations here?", ["the lesson is distinguishing average particle energy and total store before later state-variable relations", "pressure and temperature are always identical", "internal energy depends only on wall area", "pressure removes the need to count particles"], 0, "A6_L1 is about thermal meaning before full gas-state bookkeeping.", hint),
    shortCases([
      { prompt: "Temperature is an average-per-... quantity in this lesson.", acceptedAnswers: ["particle"], hint: "One particle at a time." },
      { prompt: "Internal energy is a whole-... quantity.", acceptedAnswers: ["sample", "system"], hint: "It belongs to all the particles together." },
      { prompt: "Absolute temperature must be measured in ...", acceptedAnswers: ["kelvin", "k"], hint: "Use the SI absolute scale." },
      { prompt: "Same temperature does not force the same total microscopic ...", acceptedAnswers: ["store", "energy", "internal energy"], hint: "Average and total are different." },
      { prompt: "More particles at the same temperature means larger internal ...", acceptedAnswers: ["energy"], hint: "The total gets bigger." },
      { prompt: "A6_L1 mainly separates average from ...", acceptedAnswers: ["total", "whole-sample total"], hint: "That is the conceptual divide." },
      { prompt: "The common trap is treating temperature as the sample's total internal ...", acceptedAnswers: ["energy"], hint: "That is what this lesson corrects." },
      { prompt: "Average particle kinetic energy is proportional to absolute ...", acceptedAnswers: ["temperature"], hint: "Use the thermal variable." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep mass, specific heat capacity, and temperature rise together.";
  return [
    mc("Which relation is used for a heating stage with no change of state?", ["Q = m c Delta T", "Q = m L", "pV = nRT", "p = 1/3 rho c_rms^2"], 0, "Use the heating equation when temperature changes within one state.", hint),
    mc("What does specific heat capacity describe?", ["energy needed per kilogram per degree", "energy needed per whole sample only", "mass per unit volume", "pressure change per kelvin"], 0, "It is the heating cost per kilogram per degree.", hint),
    mc("If the same energy is given to two equal masses, which sample has the larger temperature rise?", ["the one with smaller specific heat capacity", "the one with larger specific heat capacity", "both always have the same rise regardless of c", "the one with larger density"], 0, "Smaller c means less energy is needed per degree.", hint),
    mc("If the same energy is given to two samples of the same material, which has the larger temperature rise?", ["the smaller mass", "the larger mass", "both have the same rise", "the one at lower starting temperature only"], 0, "Smaller mass needs less energy per degree rise.", hint),
    ...[
      { m: 2.0, c: 900, dt: 40, q: 72000 },
      { m: 1.5, c: 4200, dt: 20, q: 126000 },
      { m: 0.80, c: 500, dt: 60, q: 24000 },
      { m: 3.0, c: 390, dt: 50, q: 58500 },
    ].map((entry) =>
      mc(
        `A sample has mass ${entry.m} kg, specific heat capacity ${entry.c} J/kg K, and temperature rise ${entry.dt} K. What is Q?`,
        [valueWithUnit(entry.q, "J", 0), valueWithUnit(entry.q / 2, "J", 0), valueWithUnit(entry.q * 2, "J", 0), valueWithUnit(entry.dt, "J", 0)],
        0,
        "Use Q = m c Delta T.",
        hint,
      ),
    ),
    ...[
      { q: 54000, m: 1.5, c: 900, dt: 40 },
      { q: 84000, m: 2.0, c: 4200, dt: 10 },
      { q: 30000, m: 1.0, c: 500, dt: 60 },
      { q: 46800, m: 2.0, c: 390, dt: 60 },
    ].map((entry) =>
      mc(
        `A sample absorbs ${valueWithUnit(entry.q, "J", 0)}. Its mass is ${entry.m} kg and c = ${entry.c} J/kg K. What is the temperature rise?`,
        [valueWithUnit(entry.dt, "K", 0), valueWithUnit(entry.dt / 2, "K", 0), valueWithUnit(entry.dt * 2, "K", 0), valueWithUnit(entry.q / entry.c, "K", 1)],
        0,
        "Rearrange Q = m c Delta T to Delta T = Q / (m c).",
        hint,
      ),
    ),
    shortCases([
      { prompt: "Specific heat capacity is energy per kilogram per ...", acceptedAnswers: ["degree", "kelvin", "degree celsius"], hint: "Think one kilogram, one degree." },
      { prompt: "Heating energy in one state is found from m c Delta ...", acceptedAnswers: ["t", "temperature change"], hint: "Use the temperature-change symbol." },
      { prompt: "Larger mass needs more energy for the same temperature ...", acceptedAnswers: ["rise", "change"], hint: "It costs more to heat more material." },
      { prompt: "Larger c also needs more energy for the same temperature ...", acceptedAnswers: ["rise", "change"], hint: "Heating cost depends on the material too." },
      { prompt: "If Q is fixed, smaller m gives a larger Delta ...", acceptedAnswers: ["t", "temperature rise"], hint: "The rise becomes bigger." },
      { prompt: "If Q is fixed, smaller c gives a larger temperature ...", acceptedAnswers: ["rise", "change"], hint: "Lower heating cost means bigger rise." },
      { prompt: "A strong A6_L2 answer keeps m, c, and Delta T ...", acceptedAnswers: ["together", "visible"], hint: "Do not hide one factor." },
      { prompt: "The main trap is turning a full heating ledger into a one-number ...", acceptedAnswers: ["guess", "slogan"], hint: "All three factors matter." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Explain the full heating ledger rather than reciting the formula alone.";
  return [
    mc("Why is specific heat capacity described as a heating cost per kilogram per degree?", ["it tells how much energy is needed for each kilogram for each degree of temperature rise", "it is the total energy of the sample", "it is the pressure of the material", "it measures latent heat"], 0, "That wording keeps the units and meaning together.", hint),
    mc("Why is it weak to say 'this material heats slowly' without mentioning mass or energy input?", ["temperature rise depends on energy supplied and mass as well as specific heat capacity", "specific heat capacity removes the need for mass", "all materials heat equally under the same conditions", "mass affects only latent heat"], 0, "A6_L2 protects full bookkeeping.", hint),
    mc("Why can two blocks of the same material warm by different amounts under the same heating?", ["their masses or energy inputs may differ even if c is the same", "same material forces the same Delta T", "specific heat capacity changes every second", "temperature rise depends only on starting temperature"], 0, "Material identity alone does not fix the whole result.", hint),
    mc("Why is the unit J/kg K helpful rather than decorative?", ["it encodes the meaning 'energy per kilogram per kelvin'", "it means the sample must be a gas", "it replaces the formula", "it removes the need for mass"], 0, "The unit itself tells the story of the quantity.", hint),
    mc("Which statement best protects the A6_L2 lesson meaning?", ["Heating cost depends on mass, material, and temperature rise together.", "Specific heat capacity alone fully determines the energy transferred.", "Only mass matters once heating starts.", "Only temperature rise matters because the sample type is irrelevant."], 0, "That statement keeps all three factors visible.", hint),
    mc("Why does doubling the mass double the required energy when c and Delta T stay fixed?", ["Q is directly proportional to m in Q = m c Delta T", "specific heat capacity is halved automatically", "temperature becomes constant", "energy stops depending on the material"], 0, "Mass sits as a direct multiplier in the relation.", hint),
    mc("Why does doubling c double the required energy when m and Delta T stay fixed?", ["Q is directly proportional to c in the heating relation", "higher c means the mass disappears", "specific heat capacity affects latent heat only", "temperature rise becomes negative"], 0, "Material heating cost is a direct multiplier too.", hint),
    mc("Why is a temperature plateau not handled with Q = m c Delta T?", ["there is no temperature change during that stage, so latent heat reasoning is needed instead", "specific heat capacity becomes infinite", "mass becomes zero", "the energy transfer must be zero"], 0, "That boundary separates this lesson from latent-heat stages.", hint),
    mc("Why should worked examples state the state of the sample before applying Q = m c Delta T?", ["the formula applies only when the sample stays in the same state while its temperature changes", "the state never matters in thermal physics", "specific heat capacity works only for gases", "it is needed only to find density"], 0, "Stage selection matters before the arithmetic.", hint),
    mc("What common mistake is A6_L2 preventing?", ["dropping one of m, c, or Delta T and pretending the heating story is still complete", "thinking energy is measured in kelvin", "thinking mass is measured in joules", "thinking temperature rise is a force"], 0, "The lesson defends the full three-factor ledger.", hint),
    mc("Why is it stronger to compare two heating cases by ratios than by adjectives like 'fast' or 'slow'?", ["the ratio keeps the actual factors m, c, and Delta T explicit", "adjectives are more scientific than proportional reasoning", "ratios remove the need for units", "specific heat capacity is not a numerical quantity"], 0, "Quantitative comparison keeps the mechanism visible.", hint),
    mc("Why can a low-c material show a larger temperature rise for the same energy input?", ["it needs less energy per kilogram per degree", "its mass is always smaller", "it has no internal energy", "its latent heat is zero"], 0, "Lower c means lower heating cost per degree.", hint),
    shortCases([
      { prompt: "Specific heat capacity is a heating ... per kilogram per degree.", acceptedAnswers: ["cost"], hint: "That is the lesson metaphor." },
      { prompt: "Q = m c Delta T applies while the state stays the ...", acceptedAnswers: ["same"], hint: "No change of state in this stage." },
      { prompt: "A larger mass needs more energy for the same temperature ...", acceptedAnswers: ["rise", "change"], hint: "More sample to heat." },
      { prompt: "A larger c means more energy per kilogram per ...", acceptedAnswers: ["degree", "kelvin"], hint: "That is what c measures." },
      { prompt: "A6_L2 keeps mass, material, and temperature rise ...", acceptedAnswers: ["together", "visible"], hint: "Do not collapse the ledger." },
      { prompt: "The unit J/kg K reads as joules per kilogram per ...", acceptedAnswers: ["kelvin", "degree"], hint: "Finish the meaning phrase." },
      { prompt: "A thermal plateau belongs to ... heat reasoning, not specific-heat-capacity reasoning.", acceptedAnswers: ["latent"], hint: "That is the neighbouring lesson." },
      { prompt: "The main trap is one-factor thermal ...", acceptedAnswers: ["thinking", "reasoning"], hint: "This lesson wants full bookkeeping." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Name the stage first: temperature change or state change.";
  return [
    mc("Which relation is used during a melting or boiling plateau?", ["Q = m L", "Q = m c Delta T", "pV = nRT", "p = 1/3 rho c_rms^2"], 0, "Latent heat is the state-change payment.", hint),
    mc("During a pure change of state at constant pressure, what stays constant?", ["temperature", "mass", "internal energy", "energy transfer rate"], 0, "A phase-change plateau keeps the temperature fixed while energy still enters or leaves.", hint),
    mc("Where does latent heat go during melting?", ["into weakening and rearranging intermolecular binding rather than raising temperature", "into raising the average kinetic energy only", "into reducing the sample mass", "into creating pressure in the surroundings only"], 0, "Latent heat changes the state arrangement.", hint),
    mc("What does specific latent heat describe?", ["energy needed per kilogram for a state change", "energy needed per kilogram per kelvin", "pressure change per unit volume", "particle speed per kelvin"], 0, "It is a per-kilogram state-change cost.", hint),
    mc("A 0.50 kg block of ice at 0 C melts completely. Take Lf = 3.34 x 10^5 J/kg. How much energy is needed?", [valueWithUnit(167000, "J", 0), valueWithUnit(334000, "J", 0), valueWithUnit(83500, "J", 0), valueWithUnit(500, "J", 0)], 0, "Use Q = mL for the melting stage.", hint),
    mc("A 0.20 kg sample of boiling water turns fully into steam. Take Lv = 2.26 x 10^6 J/kg. How much energy is needed?", [valueWithUnit(452000, "J", 0), valueWithUnit(113000, "J", 0), valueWithUnit(2260000, "J", 0), valueWithUnit(45200, "J", 0)], 0, "Multiply the mass by the specific latent heat of vaporization.", hint),
    mc("A 0.60 kg sample absorbs 1.50 x 10^5 J during a change of state. What is the specific latent heat?", [valueWithUnit(250000, "J/kg", 0), valueWithUnit(90000, "J/kg", 0), valueWithUnit(150000, "J/kg", 0), valueWithUnit(60000, "J/kg", 0)], 0, "Rearrange to L = Q / m.", hint),
    mc("Steam condenses and releases 6.78 x 10^5 J. Take Lv = 2.26 x 10^6 J/kg. What mass condensed?", [valueWithUnit(0.30, "kg", 2), valueWithUnit(3.00, "kg", 2), valueWithUnit(0.15, "kg", 2), valueWithUnit(1.35, "kg", 2)], 0, "Use m = Q / L.", hint),
    mc("Which stage should be treated with Q = m c Delta T rather than Q = m L?", ["heating liquid water from 20 C to 60 C", "melting ice at 0 C", "boiling water at 100 C", "condensing steam at 100 C"], 0, "A temperature-rise stage uses specific heat capacity, not latent heat.", hint),
    mc("Which statement about a heating curve plateau is correct?", ["the sample can absorb energy while the temperature stays constant", "the heater must be off because temperature is constant", "the sample's mass must be zero", "the internal energy cannot change"], 0, "A plateau is not a zero-transfer stage.", hint),
    mc("If the same energy is supplied to equal masses of two different substances during melting, which quantity determines how much state change occurs?", ["their specific latent heats", "their specific heat capacities only", "their densities only", "their starting temperatures only"], 0, "The phase-change fraction depends on the latent-heat cost per kilogram.", hint),
    mc("Why is boiling usually associated with a larger specific latent heat than melting?", ["separating particles into a gas usually needs a larger structural energy change", "boiling always happens at lower temperature", "melting raises temperature faster", "gas particles have zero kinetic energy"], 0, "Vaporization typically needs a bigger structural separation payment.", hint),
    shortCases([
      { prompt: "Latent heat is the ...-change payment.", acceptedAnswers: ["state", "phase"], hint: "It is not a temperature-rise payment." },
      { prompt: "During a pure phase-change plateau, temperature stays ...", acceptedAnswers: ["constant", "the same"], hint: "That is the signature of the stage." },
      { prompt: "Q = m L uses the symbol L for specific ... heat.", acceptedAnswers: ["latent"], hint: "Name the kind of heat." },
      { prompt: "A plateau does not mean zero energy ...", acceptedAnswers: ["transfer", "input", "flow"], hint: "Energy can still be entering." },
      { prompt: "Latent heat mainly changes particle ... or arrangement.", acceptedAnswers: ["separation", "spacing", "arrangement"], hint: "Think structural change rather than temperature rise." },
      { prompt: "Melting uses the latent heat of ...", acceptedAnswers: ["fusion"], hint: "That is the solid-to-liquid case." },
      { prompt: "Boiling uses the latent heat of ...", acceptedAnswers: ["vaporization", "vaporisation"], hint: "That is the liquid-to-gas case." },
      { prompt: "A strong A6_L3 answer separates temperature-change stages from ...-change stages.", acceptedAnswers: ["state", "phase"], hint: "Choose the stage first." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep the plateau, the energy transfer, and the particle rearrangement on the same board.";
  return [
    mc("Why is it wrong to say 'temperature stayed constant, so no energy was transferred' during melting?", ["the energy can be used to change particle arrangement rather than to raise temperature", "constant temperature means the heater is off", "latent heat is measured in kelvin", "melting reduces the sample mass to zero"], 0, "A6_L3 keeps plateau and energy transfer together.", hint),
    mc("Why must a mixed thermal process be split into stages before calculation?", ["different stages use different thermal relations depending on whether temperature changes or the state changes", "one formula always covers the whole process", "latent heat replaces mass in all thermal problems", "all stages keep the same temperature"], 0, "Stage selection is the core reasoning move.", hint),
    mc("Why is Q = m c Delta T not the right equation during a boiling plateau?", ["there is no temperature rise during the plateau, so the energy goes into the state change instead", "specific heat capacity becomes zero", "the mass disappears", "pressure stops existing"], 0, "No Delta T means no specific-heat stage.", hint),
    mc("Why can a heating curve show a flat section even while power is still supplied?", ["the incoming energy is being used for the phase change rather than increasing the average kinetic energy", "flat lines always mean no energy enters", "temperature is measured incorrectly during boiling", "the sample has reached zero internal energy"], 0, "Plateaus are active state-change payments.", hint),
    mc("Why is specific latent heat measured per kilogram?", ["the energy required scales with how much substance changes state", "it removes the need for mass in calculations", "state changes happen only for one kilogram", "temperature is measured in kilograms"], 0, "The cost depends on the amount of substance.", hint),
    mc("Why is latent heat best described as a structural or binding-energy change?", ["the added energy changes particle separation and intermolecular arrangement without directly raising the temperature", "it increases pressure only", "it destroys the particles", "it removes the need for internal energy"], 0, "The particle arrangement is what changes during the plateau.", hint),
    mc("Which statement best protects the A6_L3 lesson meaning?", ["A flat temperature line can still hide a growing energy payment if the sample is changing state.", "Constant temperature always means thermal equilibrium with no transfer.", "Latent heat and specific heat capacity are interchangeable.", "A plateau proves the sample's internal energy is fixed."], 0, "That keeps the key contradiction visible.", hint),
    mc("Why is it weak to say 'boiling is just hot water' in this lesson?", ["boiling is a state-change process with a latent-heat payment, not simply a high-temperature liquid stage", "boiling means the temperature must keep increasing", "boiling removes the need for latent heat", "boiling can be described by density alone"], 0, "The lesson distinguishes the phase-change plateau from ordinary heating.", hint),
    mc("Why can equal masses need different latent-heat energies for the same type of state change?", ["their specific latent heats may differ because different substances have different state-change costs", "equal masses always need equal latent energy", "latent heat depends only on starting temperature", "pressure alone determines latent heat"], 0, "Material identity still matters.", hint),
    mc("Why does complete vaporization usually need more energy than complete melting for the same mass?", ["forming a gas usually requires a larger particle-separation change than forming a liquid", "melting always happens at higher temperature", "fusion changes temperature more", "liquids have no intermolecular forces"], 0, "Gas formation usually demands the larger structural payment.", hint),
    mc("What common mistake is A6_L3 preventing?", ["treating a temperature plateau as if it meant zero energy transfer", "thinking mass matters in thermal problems", "thinking temperature must be measured in pascals", "thinking state changes never involve energy"], 0, "The lesson is protecting plateau interpretation.", hint),
    mc("Why should worked examples say what happens to the sample physically during the plateau?", ["the process meaning is about changing state, not just substituting numbers into Q = mL", "the physical story is irrelevant once the formula is chosen", "plateaus only occur in gases", "the calculation can be done without naming the state change"], 0, "A6_L3 wants the mechanism and the arithmetic together.", hint),
    shortCases([
      { prompt: "A phase-change plateau can still hide an energy ...", acceptedAnswers: ["payment", "transfer", "input"], hint: "The temperature line alone is not the whole story." },
      { prompt: "Latent heat changes the sample's ... rather than its temperature.", acceptedAnswers: ["state", "phase"], hint: "Name what changes." },
      { prompt: "During boiling, energy is used to ... particles further apart.", acceptedAnswers: ["separate", "move", "pull"], hint: "Think intermolecular spacing." },
      { prompt: "Thermal questions with both warming and melting must be split into ...", acceptedAnswers: ["stages"], hint: "One stage at a time." },
      { prompt: "The melting constant is the latent heat of ...", acceptedAnswers: ["fusion"], hint: "Solid to liquid." },
      { prompt: "The boiling constant is the latent heat of ...", acceptedAnswers: ["vaporization", "vaporisation"], hint: "Liquid to gas." },
      { prompt: "A6_L3 protects the idea that constant temperature does not mean zero energy ...", acceptedAnswers: ["transfer", "input"], hint: "That is the key correction." },
      { prompt: "Latent heat is a ...-kilogram state-change cost.", acceptedAnswers: ["per"], hint: "Finish the measurement phrase." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep pressure, volume, amount, and temperature inside one chamber-state ledger.";
  return [
    mc("Which relation links the state variables of an ideal gas?", ["pV = nRT", "Q = m c Delta T", "Q = mL", "p = 1/3 rho c_rms^2"], 0, "The ideal-gas law links p, V, n, and T in one state relation.", hint),
    mc("What is gas pressure in kinetic terms?", ["the force per unit area caused by particle collisions with the walls", "the internal energy per particle", "the volume per mole", "the temperature per kilogram"], 0, "Pressure is a wall-hit effect.", hint),
    mc("If an ideal gas is compressed at fixed n and T, what happens to the pressure?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "At fixed n and T, smaller V means larger p.", hint),
    mc("If an ideal gas is heated at fixed n and V, what happens to the pressure?", ["it increases", "it decreases", "it stays the same", "it becomes independent of temperature"], 0, "At fixed n and V, pressure rises with temperature.", hint),
    mc("A cylinder contains 0.50 mol of ideal gas at 300 K in a volume of 1.2 x 10^-2 m^3. What is the pressure?", [valueWithUnit(104000, "Pa", 0), valueWithUnit(52000, "Pa", 0), valueWithUnit(208000, "Pa", 0), valueWithUnit(1250, "Pa", 0)], 0, "Use p = nRT / V.", hint),
    mc("An ideal gas is at pressure 2.0 x 10^5 Pa in a volume of 8.0 x 10^-3 m^3. The amount is 0.64 mol. What is the temperature?", [valueWithUnit(301, "K", 0), valueWithUnit(150, "K", 0), valueWithUnit(602, "K", 0), valueWithUnit(26, "K", 0)], 0, "Use T = pV / (nR).", hint),
    mc("A 1.0 mol ideal gas sample is at 300 K and pressure 1.0 x 10^5 Pa. What is its volume?", [valueWithUnit(0.0249, "m^3", 4), valueWithUnit(0.249, "m^3", 3), valueWithUnit(0.00249, "m^3", 5), valueWithUnit(24.9, "m^3", 1)], 0, "Rearrange to V = nRT / p.", hint),
    mc("An ideal gas has p = 1.5 x 10^5 Pa, V = 4.0 x 10^-3 m^3, and T = 400 K. How many moles are present?", [valueWithUnit(0.18, "mol", 2), valueWithUnit(1.80, "mol", 2), valueWithUnit(0.72, "mol", 2), valueWithUnit(18.0, "mol", 1)], 0, "Use n = pV / (RT).", hint),
    mc("Which unit set is correct for direct use in pV = nRT?", ["Pa, m^3, mol, K", "Pa, cm^3, g, C", "N, litre, kg, C", "bar, m^3, kg, K"], 0, "Use SI units in the gas law.", hint),
    mc("Which temperature should be used in the ideal-gas law?", ["absolute temperature in kelvin", "temperature in celsius without conversion", "temperature in either scale because ratios are the same", "temperature only if pressure is fixed"], 0, "The relation uses absolute temperature.", hint),
    mc("If the amount of gas doubles while V and T stay fixed, what happens to the pressure?", ["it doubles", "it halves", "it stays the same", "it quadruples"], 0, "Pressure is directly proportional to n at fixed V and T.", hint),
    mc("Which statement about the ideal-gas law is safest?", ["p, V, n, and T must be read together as one state relation", "pressure determines temperature without reference to volume", "volume is irrelevant once pressure is known", "amount of substance matters only during a chemical reaction"], 0, "A6_L4 keeps the full chamber-state story visible.", hint),
    shortCases([
      { prompt: "The ideal-gas law links p, V, n, and ...", acceptedAnswers: ["t", "temperature"], hint: "Name the fourth state variable." },
      { prompt: "Pressure is a wall-... effect.", acceptedAnswers: ["hit", "collision"], hint: "Think particle impacts." },
      { prompt: "Ideal-gas-law temperatures must be in ...", acceptedAnswers: ["kelvin", "k"], hint: "Use the absolute scale." },
      { prompt: "The SI volume unit in pV = nRT is cubic ...", acceptedAnswers: ["metre", "meter", "metres", "meters"], hint: "Use m^3." },
      { prompt: "At fixed T and n, smaller volume means larger ...", acceptedAnswers: ["pressure", "p"], hint: "Compression increases wall-hit load." },
      { prompt: "At fixed V and n, higher temperature means larger ...", acceptedAnswers: ["pressure", "p"], hint: "Hotter gas hits harder and more often." },
      { prompt: "The amount of gas is measured in ...", acceptedAnswers: ["mol", "mole", "moles"], hint: "That is n." },
      { prompt: "A strong A6_L4 answer treats p, V, n, and T as one chamber-... relation.", acceptedAnswers: ["state"], hint: "Do not split the variables into detached symbols." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep the wall-hit meaning and the full state-variable relation visible together.";
  return [
    mc("Why is pV = nRT best described as one state relation rather than four separate symbols?", ["the gas state is fixed only when pressure, volume, amount, and temperature are considered together", "pressure alone determines every other quantity", "the equation works only for one variable at a time", "volume and temperature are optional"], 0, "A6_L4 is defending joined-up state bookkeeping.", hint),
    mc("Why must kelvin be used in the ideal-gas law?", ["the law uses absolute temperature measured from zero kinetic baseline", "kelvin makes the arithmetic shorter", "celsius works only for solids", "pressure is already measured in kelvin"], 0, "The relation depends on absolute temperature.", hint),
    mc("Why is pressure described as a wall-hit effect in this lesson?", ["it ties the macroscopic variable back to particle collisions with the container walls", "it means pressure exists only in solids", "it removes the need for area", "it turns pressure into energy per kilogram"], 0, "That phrase keeps the microscopic mechanism visible.", hint),
    mc("Why is it weak to discuss pressure change without saying what happens to volume, amount, or temperature?", ["pressure is linked to the other state variables, so the condition must be named", "pressure is independent of every other quantity", "pressure can be read without units", "pressure depends only on wall area"], 0, "Gas-law reasoning needs the fixed and changing conditions.", hint),
    mc("Why should SI units be used before substituting into pV = nRT?", ["the gas constant R is defined for SI units, so mismatched units corrupt the result", "SI units are optional if the numbers look neat", "the equation corrects unit mistakes automatically", "moles can be replaced by kilograms without change"], 0, "Unit consistency is part of the physics, not a cosmetic step.", hint),
    mc("Why can pressure rise when a gas is heated at fixed volume?", ["higher temperature means faster particles and stronger wall-collision transfer in the same container", "heating destroys some of the particles", "the gas constant changes", "volume automatically doubles"], 0, "The fixed-volume collision story explains the rise.", hint),
    mc("Why can pressure rise when a gas is compressed at fixed temperature?", ["the particles hit the walls more often because the same gas is confined to a smaller volume", "compression always heats the gas in this lesson", "the amount of substance must double", "the collisions become impossible"], 0, "A shorter wall-to-wall distance raises collision rate.", hint),
    mc("Why is amount of substance included explicitly as n?", ["the state depends on how much gas is present, not just on pressure, volume, and temperature", "n is only needed for chemical reactions", "moles are used to hide the pressure", "amount and volume are identical"], 0, "More particles change the wall-hit load at fixed V and T.", hint),
    mc("Which statement best protects the A6_L4 lesson meaning?", ["Pressure, volume, amount, and temperature belong to one chamber-state story.", "Pressure can always be predicted from temperature alone.", "Volume matters only if the gas is heated.", "The ideal-gas law is just a mnemonic with no physical story."], 0, "That keeps the model joined together.", hint),
    mc("Why is a volume in cm^3 dangerous if it is substituted directly into pV = nRT?", ["the gas constant expects m^3, so the result will be numerically wrong unless the unit is converted", "cm^3 and m^3 are always interchangeable", "pressure must then be measured in celsius", "the mole unit disappears"], 0, "Unit conversion is essential.", hint),
    mc("Why is the ideal-gas law not itself a path description like 'isothermal' or 'isobaric'?", ["it links one state of the gas, while path labels describe which variable stays fixed during a change", "it works only during compression", "it removes the need for graph interpretation", "it is used only for boiling"], 0, "State relation and process condition are different ideas.", hint),
    mc("What common mistake is A6_L4 preventing?", ["treating pressure, volume, amount, and temperature as detached quantities instead of one coupled state", "thinking gases have particles", "thinking kelvin cannot be used with pressure", "thinking volume is measured in joules"], 0, "The lesson is preventing symbol-fragmentation.", hint),
    shortCases([
      { prompt: "pV = nRT is a gas ... relation.", acceptedAnswers: ["state"], hint: "It describes one gas state." },
      { prompt: "Gas-law temperature should be measured from absolute ...", acceptedAnswers: ["zero"], hint: "That is why kelvin is used." },
      { prompt: "Pressure is caused by particle ... with the walls.", acceptedAnswers: ["collisions", "hits"], hint: "That is the microscopic source." },
      { prompt: "Use the SI volume unit cubic ... in the gas law.", acceptedAnswers: ["metre", "meter", "metres", "meters"], hint: "Write m^3." },
      { prompt: "More gas at fixed V and T means more wall hits and larger ...", acceptedAnswers: ["pressure", "p"], hint: "The collision load rises." },
      { prompt: "A6_L4 keeps all four state variables ...", acceptedAnswers: ["together", "linked"], hint: "Do not split the chamber story apart." },
      { prompt: "The amount symbol in the ideal-gas law is ...", acceptedAnswers: ["n"], hint: "That is the mole-count variable." },
      { prompt: "A path label such as isothermal names what stays ... during a change.", acceptedAnswers: ["fixed", "constant"], hint: "State relation and process condition are different." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Name the fixed quantity before you describe the graph or choose the law.";
  return [
    mc("Which gas law applies when temperature is constant for a fixed amount of gas?", ["Boyle's law", "Charles's law", "pressure law", "Q = mL"], 0, "Isothermal conditions use Boyle's law.", hint),
    mc("Which gas law applies when pressure is constant for a fixed amount of gas?", ["Charles's law", "Boyle's law", "pressure law", "p = 1/3 rho c_rms^2"], 0, "Constant pressure gives V proportional to T.", hint),
    mc("Which gas law applies when volume is constant for a fixed amount of gas?", ["pressure law", "Boyle's law", "Charles's law", "Q = m c Delta T"], 0, "At fixed volume, pressure is proportional to absolute temperature.", hint),
    mc("What is the shape of a p-V graph for an isothermal ideal-gas change?", ["a downward-curving hyperbola", "a straight line through the origin", "a horizontal line only", "a vertical line only"], 0, "Pressure varies inversely with volume at constant temperature.", hint),
    mc("What is the shape of a V-T graph at constant pressure when temperature is in kelvin?", ["a straight line through the origin", "a downward curve", "a vertical line", "a horizontal line"], 0, "Volume is directly proportional to absolute temperature.", hint),
    mc("What is the shape of a p-T graph at constant volume when temperature is in kelvin?", ["a straight line through the origin", "a downward curve", "a horizontal line", "a vertical line"], 0, "Pressure is directly proportional to absolute temperature.", hint),
    mc("An ideal gas is compressed isothermally from 2.4 x 10^-2 m^3 to 1.5 x 10^-2 m^3. Its initial pressure is 1.2 x 10^5 Pa. What is the final pressure?", [valueWithUnit(192000, "Pa", 0), valueWithUnit(75000, "Pa", 0), valueWithUnit(160000, "Pa", 0), valueWithUnit(288000, "Pa", 0)], 0, "Use p1V1 = p2V2.", hint),
    mc("A gas is heated at constant pressure from 280 K to 350 K. Its initial volume is 1.8 x 10^-3 m^3. What is the final volume?", [valueWithUnit(0.00225, "m^3", 5), valueWithUnit(0.00144, "m^3", 5), valueWithUnit(0.00360, "m^3", 5), valueWithUnit(0.00090, "m^3", 5)], 0, "Use V1/T1 = V2/T2.", hint),
    mc("A gas at constant volume is heated from 300 K to 360 K. Its initial pressure is 1.0 x 10^5 Pa. What is the final pressure?", [valueWithUnit(120000, "Pa", 0), valueWithUnit(83300, "Pa", 0), valueWithUnit(360000, "Pa", 0), valueWithUnit(60000, "Pa", 0)], 0, "Use p1/T1 = p2/T2.", hint),
    mc("Why is using 27 C and 127 C directly in a direct gas-law ratio unsafe?", ["direct proportional gas laws require absolute temperature in kelvin", "celsius is only used for liquids", "temperatures above 100 C cannot be used", "pressure becomes zero in kelvin"], 0, "Use kelvin for proportional gas-law ratios.", hint),
    mc("Which condition must be stated before Boyle's law can be applied safely?", ["temperature and amount of gas fixed", "pressure fixed and mass changing", "volume fixed and temperature changing", "state change at constant temperature"], 0, "Boyle's law is an isothermal fixed-n relation.", hint),
    mc("Which statement about gas-law graphs is safest?", ["a graph shape becomes meaningful only after the fixed quantity is named", "all gas-law graphs are straight lines", "graph shapes do not depend on the process condition", "every p-V graph must be horizontal"], 0, "A6_L5 protects condition-first graph reading.", hint),
    shortCases([
      { prompt: "A constant-temperature gas process is called ...", acceptedAnswers: ["isothermal"], hint: "Temperature stays fixed." },
      { prompt: "A constant-pressure gas process is called ...", acceptedAnswers: ["isobaric"], hint: "Pressure stays fixed." },
      { prompt: "A constant-volume gas process is called ...", acceptedAnswers: ["isochoric"], hint: "Volume stays fixed." },
      { prompt: "Boyle's law links pressure and ...", acceptedAnswers: ["volume"], hint: "That is the inverse pair." },
      { prompt: "Charles's law links volume and absolute ...", acceptedAnswers: ["temperature"], hint: "At constant pressure." },
      { prompt: "The pressure law links pressure and absolute ...", acceptedAnswers: ["temperature"], hint: "At constant volume." },
      { prompt: "Direct gas-law proportionality must use ...", acceptedAnswers: ["kelvin", "k"], hint: "Use the absolute scale." },
      { prompt: "A strong A6_L5 answer names the fixed ... before reading the graph.", acceptedAnswers: ["quantity", "condition", "variable"], hint: "That is the first sorting step." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Tie each graph or law to the condition that stays fixed.";
  return [
    mc("Why should the fixed quantity be named before a gas-law graph is interpreted?", ["the same variables can produce different graph shapes under different conditions", "graph shape never depends on the process condition", "it makes units unnecessary", "temperature can then be ignored"], 0, "Condition-first reading is the core A6_L5 habit.", hint),
    mc("Why is a p-V isotherm curved rather than straight?", ["pressure is inversely proportional to volume at constant temperature", "pressure is directly proportional to volume", "pressure stays constant", "volume becomes negative during compression"], 0, "Inverse proportionality gives the curved shape.", hint),
    mc("Why do V-T and p-T direct-proportion graphs use kelvin rather than celsius?", ["the proportional relation is to absolute temperature, so only kelvin gives the correct origin behavior", "kelvin is only needed for high temperatures", "celsius is used only for gases above 0 C", "graphs never require temperature units"], 0, "Absolute temperature keeps the proportional law valid.", hint),
    mc("Why is it weak to say 'the line goes up' without naming the gas condition?", ["rising lines can represent different relations, so the fixed quantity must still be identified", "all gas lines mean constant volume", "upward lines remove the need for units", "gas-law graphs are purely visual with no physics"], 0, "Graph description without condition is incomplete.", hint),
    mc("Why does a straight V-T graph through the origin support Charles's law?", ["it shows volume is directly proportional to absolute temperature at constant pressure", "it proves pressure is inversely proportional to volume", "it shows the gas is changing state", "it means volume is independent of temperature"], 0, "A straight origin-through line is the signature of direct proportionality.", hint),
    mc("Why does a straight p-T graph through the origin support the pressure law?", ["it shows pressure is directly proportional to absolute temperature at constant volume", "it means pressure is inversely proportional to temperature", "it proves Boyle's law", "it only works if the amount changes"], 0, "That graph belongs to the constant-volume case.", hint),
    mc("Why is Boyle's law not safe to use if the gas is heated during compression?", ["the fixed-temperature condition has been broken", "volume is no longer a state variable", "pressure stops existing", "the gas constant R changes"], 0, "The named condition must survive the whole process.", hint),
    mc("Which statement best protects the A6_L5 lesson meaning?", ["Gas-law graphs become meaningful only when the changing path is tied to the quantity held fixed.", "Every gas-law graph can be memorized without any condition.", "All gas laws can be merged into one p-V graph only.", "The graph shape matters more than the physics condition."], 0, "That keeps the process meaning attached to the graph.", hint),
    mc("Why is a p-V graph described as a state map rather than picture art?", ["each point and curve represents linked values of state variables under a stated condition", "the graph is drawn only for decoration", "the axes can be swapped without changing meaning", "graphs remove the need for equations"], 0, "The graph encodes coupled gas states.", hint),
    mc("Why are ratio methods often safer than difference methods in ideal-gas graph questions?", ["the laws are proportional relations that compare before-and-after states multiplicatively", "differences always give more precise answers", "ratios avoid using units", "gas laws depend on subtraction rather than proportion"], 0, "These laws are about proportional change under fixed conditions.", hint),
    mc("What common mistake is A6_L5 preventing?", ["choosing a graph or law from its visual look alone without checking the fixed quantity", "thinking gases can be graphed", "thinking kelvin cannot be used on axes", "thinking volume has no unit"], 0, "The lesson is defending condition-first graph reasoning.", hint),
    mc("Why should a worked example compare isothermal, isobaric, and isochoric cases side by side?", ["the contrast makes it easier to stop the three laws from blending together", "only one gas law is real", "the laws differ only by units", "comparison removes the need for graphs"], 0, "Side-by-side contrast sharpens the distinctions.", hint),
    shortCases([
      { prompt: "Gas-law graphs are only meaningful after the fixed ... is named.", acceptedAnswers: ["quantity", "condition", "variable"], hint: "That is the first sorting step." },
      { prompt: "A p-V isotherm is ... rather than straight.", acceptedAnswers: ["curved", "a curve"], hint: "Inverse proportionality bends it." },
      { prompt: "Direct gas-law graphs should pass through the origin when temperature is in ...", acceptedAnswers: ["kelvin", "k"], hint: "Use the absolute scale." },
      { prompt: "Boyle's law needs temperature to stay ...", acceptedAnswers: ["constant", "fixed"], hint: "It is the isothermal law." },
      { prompt: "Charles's law needs pressure to stay ...", acceptedAnswers: ["constant", "fixed"], hint: "It is the isobaric law." },
      { prompt: "The pressure law needs volume to stay ...", acceptedAnswers: ["constant", "fixed"], hint: "It is the isochoric law." },
      { prompt: "A6_L5 is mainly protecting graph-and-... alignment.", acceptedAnswers: ["condition", "law"], hint: "Do not let the path lose its meaning." },
      { prompt: "A good gas-law explanation names the fixed quantity before the graph ...", acceptedAnswers: ["shape", "curve", "line"], hint: "Meaning comes before appearance." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Explain pressure and temperature from particle motion and wall collisions.";
  return [
    mc("Which statement is part of the kinetic theory of gases?", ["gas particles move randomly between collisions", "gas particles are fixed in place", "gas pressure is unrelated to particle motion", "temperature measures particle count only"], 0, "Random motion is a core kinetic-theory idea.", hint),
    mc("What causes gas pressure in kinetic theory?", ["collisions of moving particles with the container walls", "the color of the gas", "the latent heat of the gas", "the volume alone"], 0, "Pressure is a wall-collision effect.", hint),
    mc("What happens to the average kinetic energy of gas particles when temperature rises?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "Higher temperature means larger average kinetic energy.", hint),
    mc("A rigid container of gas is heated. Why does the pressure rise?", ["the particles move faster, so wall collisions are more frequent and harder", "the volume expands", "the gas loses particles", "the mass becomes smaller"], 0, "At fixed volume, faster collisions raise the wall-hit load.", hint),
    mc("Which relation links kinetic-theory pressure to density and rms speed?", ["p = 1/3 rho c_rms^2", "pV = nRT", "Q = m c Delta T", "Q = mL"], 0, "That is the kinetic-theory pressure formula.", hint),
    mc("An ideal gas has density 0.90 kg/m^3 and rms speed 500 m/s. What is the pressure?", [valueWithUnit(75000, "Pa", 0), valueWithUnit(225000, "Pa", 0), valueWithUnit(45000, "Pa", 0), valueWithUnit(150000, "Pa", 0)], 0, "Use p = (1/3) rho c_rms^2.", hint),
    mc("A gas has pressure 1.2 x 10^5 Pa and density 0.96 kg/m^3. What is the rms speed?", [valueWithUnit(612, "m/s", 0), valueWithUnit(354, "m/s", 0), valueWithUnit(1200, "m/s", 0), valueWithUnit(204, "m/s", 0)], 0, "Rearrange to c_rms = sqrt(3p / rho).", hint),
    mc("A gas has pressure 1.5 x 10^5 Pa and rms speed 600 m/s. What is the density?", [valueWithUnit(1.25, "kg/m^3", 2), valueWithUnit(0.42, "kg/m^3", 2), valueWithUnit(2.50, "kg/m^3", 2), valueWithUnit(0.83, "kg/m^3", 2)], 0, "Rearrange to rho = 3p / c_rms^2.", hint),
    mc("If the rms speed doubles while density stays fixed, what happens to the kinetic-theory pressure?", ["it becomes four times larger", "it doubles", "it halves", "it stays the same"], 0, "Pressure depends on the square of c_rms.", hint),
    mc("If the density doubles while rms speed stays fixed, what happens to the pressure?", ["it doubles", "it quadruples", "it halves", "it stays the same"], 0, "Pressure is directly proportional to density.", hint),
    mc("Why is a vacuum unable to exert gas pressure?", ["there are no gas particles to collide with the walls", "the temperature is always zero", "pressure needs a liquid", "rms speed is undefined only in solids"], 0, "No particles means no collision pressure.", hint),
    mc("Which statement best matches A6_L6?", ["Kinetic theory links gas pressure and temperature back to particle motion and collisions.", "Pressure can be explained without particles.", "Temperature is the same as pressure.", "Gas density is unrelated to collision rate."], 0, "That is the lesson takeaway.", hint),
    shortCases([
      { prompt: "Gas particles move ... between collisions.", acceptedAnswers: ["randomly", "at random"], hint: "That is the model assumption." },
      { prompt: "Gas pressure comes from wall ...", acceptedAnswers: ["collisions", "hits"], hint: "Name the microscopic mechanism." },
      { prompt: "Higher temperature means larger average ... energy.", acceptedAnswers: ["kinetic"], hint: "That is what temperature tracks microscopically." },
      { prompt: "The speed used in the pressure relation is the ... speed.", acceptedAnswers: ["rms"], hint: "Root-mean-square." },
      { prompt: "At fixed volume, heating makes particles move ...", acceptedAnswers: ["faster"], hint: "That raises the collision load." },
      { prompt: "More frequent and harder wall hits mean greater ...", acceptedAnswers: ["pressure"], hint: "That is the macroscopic effect." },
      { prompt: "No particles means no gas ...", acceptedAnswers: ["pressure"], hint: "Think vacuum." },
      { prompt: "A strong A6_L6 answer keeps particle motion and wall ... together.", acceptedAnswers: ["collisions", "hits"], hint: "Mechanism first." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep motion, collisions, and the resulting pressure on one microscopic story line.";
  return [
    mc("Why is gas pressure described as a collision effect rather than a stored quantity in the walls?", ["pressure comes from repeated particle impacts transferring momentum to the walls", "pressure is created by wall color", "pressure exists only if the gas changes state", "pressure is the same as internal energy"], 0, "Kinetic theory explains pressure through collisions.", hint),
    mc("Why does heating a gas at fixed volume raise its pressure in kinetic-theory terms?", ["the particles gain average kinetic energy, so collisions become more frequent and harder", "the number of particles must fall", "the volume expands automatically", "specific latent heat increases"], 0, "Faster particles give a larger wall-hit load.", hint),
    mc("Why is temperature linked to average kinetic energy rather than to total sample energy in kinetic theory?", ["temperature measures the average particle-motion level, not the whole-sample store", "temperature ignores particle motion", "temperature depends only on volume", "temperature is just another name for pressure"], 0, "A6_L6 stays consistent with the A6_L1 average-versus-total distinction.", hint),
    mc("Why does the rms speed appear squared in the pressure relation?", ["momentum-change and collision-rate effects combine so pressure scales with speed squared", "squaring removes the density term", "it is only a unit-conversion trick", "pressure does not depend on speed"], 0, "The quadratic dependence is a real physical consequence.", hint),
    mc("Why can a denser gas give a larger pressure at the same rms speed?", ["more mass per unit volume means more particle momentum transfer is available in the same space", "density changes only the temperature", "denser gases never collide with walls", "pressure depends only on the container material"], 0, "Pressure scales directly with density in the formula.", hint),
    mc("Why is the vacuum case useful in kinetic theory?", ["it shows that without particles there can be no collision pressure", "it proves pressure can exist without matter", "it removes the need for temperature", "it means volume is zero"], 0, "Vacuum is the clean no-collision limit.", hint),
    mc("Why should a rigid-container heating explanation mention both collision frequency and momentum change?", ["both contribute to the pressure rise when particles move faster", "only one of them matters", "pressure depends only on particle count", "volume change replaces both factors"], 0, "A full kinetic-theory answer keeps both effects visible.", hint),
    mc("Which statement best protects the A6_L6 lesson meaning?", ["Pressure and temperature should be explained from particle motion, collisions, and average kinetic energy.", "Pressure is a separate property with no particle explanation.", "Heating raises pressure only because the gas becomes heavier.", "Kinetic theory replaces the need for average kinetic energy."], 0, "That statement keeps the mechanism-centered account intact.", hint),
    mc("Why is it weak to say 'hot gas expands' when the container is rigid?", ["in a rigid container the volume does not change, so the key effect is the pressure rise from faster collisions", "rigid containers automatically lose particles", "all heating problems require expansion", "pressure becomes zero in rigid containers"], 0, "The container condition changes the outcome that must be explained.", hint),
    mc("Why is a microscopic particle story useful even when a formula is available?", ["it explains why the formula has its variable dependence instead of turning it into rote memory", "the formula becomes wrong if particles are mentioned", "kinetic theory is only for diagrams", "the microscopic story removes the need for units"], 0, "A6_L6 wants mechanism plus mathematics.", hint),
    mc("What common mistake is A6_L6 preventing?", ["explaining gas pressure and temperature with detached slogans instead of collision-based particle reasoning", "thinking gases have density", "thinking kelvin is not a temperature unit", "thinking pressure is measured in joules"], 0, "The lesson is protecting the microscopic explanation.", hint),
    mc("Why can pressure rise in a rigid container even though the number of particles stays fixed?", ["faster particles transfer more momentum per second to the walls", "pressure depends only on particle number", "the walls create extra particles", "density must fall"], 0, "Collision severity and rate both rise with temperature.", hint),
    shortCases([
      { prompt: "Kinetic theory explains pressure through particle ... with the walls.", acceptedAnswers: ["collisions", "hits"], hint: "That is the microscopic source." },
      { prompt: "Heating raises the average particle ... energy.", acceptedAnswers: ["kinetic"], hint: "That is temperature's microscopic meaning." },
      { prompt: "The speed symbol in p = 1/3 rho c_rms^2 is the ... speed.", acceptedAnswers: ["rms"], hint: "Root-mean-square." },
      { prompt: "At fixed volume, faster particles make wall hits more ...", acceptedAnswers: ["frequent"], hint: "The collision rate rises." },
      { prompt: "At fixed volume, faster particles also make each wall hit transfer more ...", acceptedAnswers: ["momentum"], hint: "That is the second part of the explanation." },
      { prompt: "Vacuum means no particles and therefore no gas ...", acceptedAnswers: ["pressure"], hint: "No collisions, no pressure." },
      { prompt: "A6_L6 keeps the gas explanation ... rather than slogan-first.", acceptedAnswers: ["microscopic", "particle"], hint: "The particle story is essential." },
      { prompt: "Pressure and temperature are linked back to particle ...", acceptedAnswers: ["motion", "collisions", "movement"], hint: "That is the kinetic-theory foundation." },
    ]),
  ];
}

const A6_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A6_L1: l1DiagnosticRaw,
  A6_L2: l2DiagnosticRaw,
  A6_L3: l3DiagnosticRaw,
  A6_L4: l4DiagnosticRaw,
  A6_L5: l5DiagnosticRaw,
  A6_L6: l6DiagnosticRaw,
};

const A6_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A6_L1: l1ConceptRaw,
  A6_L2: l2ConceptRaw,
  A6_L3: l3ConceptRaw,
  A6_L4: l4ConceptRaw,
  A6_L5: l5ConceptRaw,
  A6_L6: l6ConceptRaw,
};

const A6_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(A6_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A6_DIAGNOSTIC_BUILDERS[code](), ...A6_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function a6GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A6_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a6GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A6_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a6GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A6_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
