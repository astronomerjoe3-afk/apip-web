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
    throw new Error(`F3 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function formatNumber(value: number, digits = 3): string {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function numericAnswers(value: number, unit: string, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain} ${unit}`]));
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function mergeAnswers(...groups: string[][]): string[] {
  return Array.from(new Set(groups.flat()));
}

function energyAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "J"), numericAnswers(value, "j"));
}

function powerAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "W"), numericAnswers(value, "w"));
}

function momentumAnswers(value: number, direction?: string): string[] {
  const plain = formatNumber(value);
  if (!direction) return words(`${plain} kg m/s`, `${plain} kg m s^-1`, plain);
  return words(
    `${plain} kg m/s ${direction}`,
    `${plain} kg m s^-1 ${direction}`,
    `${plain} ${direction}`,
  );
}

function forceAnswers(value: number): string[] {
  return numericAnswers(value, "N");
}

function accelerationAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "m/s^2"), numericAnswers(value, "m/s/s"));
}

function impulseAnswers(value: number): string[] {
  return words(
    ...numericAnswers(value, "N s"),
    ...numericAnswers(value, "Ns"),
    ...numericAnswers(value, "kg m/s"),
  );
}

function percentageAnswers(value: number): string[] {
  const plain = formatNumber(value);
  return words(`${plain}%`, plain);
}

function zeroAnswers(unit?: string): string[] {
  return unit ? words("0", `0 ${unit}`, "zero") : words("0", "zero");
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Work in this lesson means energy transferred by a force through displacement in its direction.";
  return [
    mc("Which situation definitely involves work being done on an object?", ["A box moves in the direction of the push", "A wall is pushed but never moves", "A book rests on a desk", "A force is mentioned without movement"], 0, "Work needs displacement in the force direction.", hint),
    mc("A 20 N force pulls a crate 4 m in the same direction. What work is done?", ["40 J", "60 J", "80 J", "100 J"], 2, "Use W = F x s.", hint),
    mc("If the object does not move, the work done by that force on the object is...", ["zero", "equal to the force size", "equal to the mass", "always positive"], 0, "No displacement means no work by that force.", hint),
    mc("A force does 120 J of work while moving an object 6 m. What is the force?", ["10 N", "20 N", "60 N", "126 N"], 1, "Rearrange W = F x s.", hint),
    mc("A 15 N force does 90 J of work in the same direction as the motion. How far does the object move?", ["4 m", "5 m", "6 m", "15 m"], 2, "Distance = work / force.", hint),
    mc("What is the unit of work done?", ["newton", "joule", "watt", "kilogram"], 1, "Work is measured in joules.", hint),
    mc("If the same force acts through a greater distance in the same direction, the work done...", ["decreases", "stays the same", "increases", "becomes zero"], 2, "For fixed force, more distance means more work.", hint),
    mc("If the distance moved doubles while the force stays the same, the work done...", ["halves", "doubles", "stays the same", "becomes negative"], 1, "Work is proportional to distance for a constant force.", hint),
    mc("Two identical boxes are pulled 5 m. Box A by 10 N, Box B by 20 N. Which receives more work?", ["Box A", "Box B", "they receive the same work", "you need the time taken"], 1, "Compare force x distance.", hint),
    mc("Why does a force on a stationary wall not count as work on the wall in this lesson?", ["The wall has no mass", "There is no displacement in the force direction", "The force is too small", "Time is not given"], 1, "Displacement is essential in the work model.", hint),
    mc("Which expression matches work done in this lesson?", ["W = F/s", "W = Fs", "W = F + s", "W = F - s"], 1, "Force multiplied by distance in the force direction.", hint),
    mc("A 5 N force moves an object 3 m in the same direction. What work is done?", ["8 J", "10 J", "15 J", "20 J"], 2, "Multiply force by distance.", hint),
    shortCases([
      { prompt: "A 12 N force moves a box 5 m in the same direction. What work is done?", acceptedAnswers: energyAnswers(60), hint: "Use W = F x s." },
      { prompt: "A force of 30 N does 150 J of work. How far does the object move?", acceptedAnswers: numericAnswers(5, "m"), hint: "Distance = work / force." },
      { prompt: "A 9 N force moves a trolley 4 m. What work is done?", acceptedAnswers: energyAnswers(36), hint: "Multiply force by distance." },
      { prompt: "The unit of work done is the ...", acceptedAnswers: words("joule", "j"), hint: "This is the same unit used for energy transfer." },
      { prompt: "If there is no displacement in the force direction, the work done is ...", acceptedAnswers: zeroAnswers("J"), hint: "No displacement means no work done by that force." },
      { prompt: "Work done is energy ...", acceptedAnswers: words("transferred", "transfer"), hint: "That is the key meaning of work in this lesson." },
      { prompt: "A 25 N force does 200 J of work. How far does the object move?", acceptedAnswers: numericAnswers(8, "m"), hint: "Distance = work / force." },
      { prompt: "A 40 J work transfer happens over 2 m. What force acted?", acceptedAnswers: forceAnswers(20), hint: "Force = work / distance." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep everyday effort separate from the physics meaning of work.";
  return [
    mc("Why is work done treated as energy transferred in this lesson?", ["Because a force moving an object in its direction shifts energy into or between stores", "Because work is just another word for time", "Because work is the same as mass", "Because work removes the need for force"], 0, "Work is the force-through-distance energy-transfer idea.", hint),
    mc("Why is pushing hard on a wall still zero work on the wall if it never moves?", ["A force alone is not enough; there must be displacement in the force direction", "Because the wall has no energy", "Because time is not given", "Because work requires motion upward only"], 0, "This lesson separates effort from energy transferred by motion.", hint),
    mc("Which statement best protects the meaning of work done?", ["Work is only counted here when a force causes displacement in its direction", "Any force automatically counts as work", "Work depends only on how long the force acts", "Work is the same thing as power"], 0, "Displacement in the force direction is the gate condition.", hint),
    mc("Why is the joule used for work done?", ["Because work done is an energy transfer quantity", "Because force and distance have no units", "Because time is removed from the calculation", "Because joules only apply to thermal energy"], 0, "The same unit is used for energy and work.", hint),
    mc("If the same force acts through twice the distance, why does the work done double?", ["The energy transfer grows in proportion to the distance moved in the force direction", "Because the mass doubles automatically", "Because the time always doubles", "Because work depends only on force"], 0, "Force x distance makes the proportionality clear.", hint),
    mc("Why is it weak to say 'I tried hard, so work was done' in physics?", ["Physics work depends on force and displacement, not on personal effort alone", "Because effort has no unit", "Because work always equals time", "Because hard pushes make negative work"], 0, "This lesson rejects the everyday-language shortcut.", hint),
    mc("Why must the direction of displacement be considered in simple work problems?", ["Because only the component of motion in the force direction counts toward the work done", "Because work is a vector quantity", "Because distance has direction in all cases", "Because time changes with direction"], 0, "The lesson keeps displacement aligned with the force in the simple model.", hint),
    mc("Why is no-work-on-the-object not the same as no-energy-anywhere?", ["Energy may be transferred elsewhere, but that force did not transfer energy by moving the object", "Because energy is destroyed", "Because work and energy are unrelated", "Because forces never affect energy"], 0, "Stay specific about the object and the force doing work on it.", hint),
    mc("What common mistake is F3_L1 designed to prevent?", ["Using 'work' as a synonym for effort instead of as force-caused energy transfer", "Thinking joule is a force unit", "Thinking time is a vector", "Reading graph area as speed"], 0, "This meaning drift is the main lesson trap.", hint),
    mc("Why can two situations with the same force have different work done?", ["The displacement in the force direction can be different", "The unit of force changes", "Mass cancels the force", "Work ignores distance"], 0, "Work depends on both force and displacement.", hint),
    mc("Why can two situations with the same displacement have different work done?", ["The forces can be different", "The distance changes automatically", "Work ignores force", "The time must be different"], 0, "Force x distance means both factors matter.", hint),
    mc("Which statement best links work to motion?", ["No displacement in the force direction means no work done by that force on the object", "Any motion proves work is done by every force present", "Any force proves work is done even without motion", "Work is always zero when speed is constant"], 0, "This is the cleanest rule in the lesson.", hint),
    mc("Why is 'work = force x distance' not just a number trick?", ["It encodes the lesson idea that a larger push or a longer move transfers more energy", "It removes the need for units", "It only works for light objects", "It proves work is a vector"], 0, "The formula is a compact statement of the mechanism.", hint),
    mc("Why is a box carried horizontally at constant height not a strong example of vertical lifting work by the support force?", ["The displacement is not in the same direction as that support force in the simple model", "Because the box has no energy", "Because constant speed means zero force", "Because work always depends only on time"], 0, "The lesson keeps the direction condition visible.", hint),
    mc("Why is lifting a book onto a shelf a work-and-energy example?", ["A force acts through a displacement and energy is transferred into a higher-energy store", "Because the book becomes more massive", "Because time disappears", "Because lifting removes gravity"], 0, "The motion transfers energy by force through distance.", hint),
    mc("Which statement about work and energy is safest?", ["Work done on an object is one way energy can be transferred to or from it", "Work and energy are unrelated ideas", "Energy is created whenever force is mentioned", "Work only applies to machines"], 0, "This lesson is building the work-energy bridge.", hint),
    mc("Why can a longer push at the same force transfer more energy?", ["The force acts through more displacement", "Because the object becomes lighter", "Because time alone decides energy transfer", "Because work is independent of distance"], 0, "More distance with the same force means more work.", hint),
    mc("Which lesson idea should stay visible in F3_L1?", ["Force and displacement together determine whether work transfers energy", "Force alone determines all work", "Distance alone determines all work", "Time alone determines all work"], 0, "That is the main relationship for the lesson.", hint),
    mc("Which statement best matches strong F3_L1 reasoning?", ["Ask whether a force moved the object in its direction, then use that to judge work and energy transfer", "Ask only whether a force existed", "Ask only how much time passed", "Ignore the direction of motion"], 0, "That keeps the physics meaning tied to the mechanism.", hint),
    mc("Why is it not enough to say that an object moved, so work was done by every force on it?", ["Only forces with displacement in their direction are doing work in this simple lesson model", "Because motion removes all forces", "Because only gravity can do work", "Because work never depends on force"], 0, "Motion alone does not mean every force contributed work.", hint),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Separate motion energy, height energy, and energy-conservation reasoning.";
  return [
    mc("If speed doubles while mass stays the same, kinetic energy becomes...", ["twice as large", "four times as large", "six times as large", "unchanged"], 1, "Speed is squared in KE = 1/2mv^2.", hint),
    mc("If mass doubles while speed stays the same, kinetic energy becomes...", ["half as large", "twice as large", "four times as large", "unchanged"], 1, "Mass changes kinetic energy directly when speed is fixed.", hint),
    mc("A 2 kg trolley moves at 5 m/s. What is its kinetic energy?", ["10 J", "20 J", "25 J", "50 J"], 2, "Use KE = 1/2mv^2.", hint),
    mc("A 4 kg bag is lifted 3 m. Take g = 10 N/kg. What gravitational potential energy is gained?", ["30 J", "40 J", "120 J", "240 J"], 2, "Use GPE = mgh.", hint),
    mc("Which change directly increases gravitational potential energy for the same object near Earth?", ["making it move faster", "raising it higher above the reference level", "reducing the time taken to lift it", "changing its direction only"], 1, "GPE depends on mass, g, and height.", hint),
    mc("As an object falls freely, which change is correct?", ["GPE rises while KE falls", "GPE falls while KE rises", "both stay fixed", "both become zero"], 1, "Falling transfers energy from gravitational potential to kinetic.", hint),
    mc("Two identical trolleys move at 3 m/s and 6 m/s. How does the faster trolley's kinetic energy compare?", ["It is twice as large", "It is three times as large", "It is four times as large", "It is six times as large"], 2, "Doubling speed gives four times the KE.", hint),
    mc("Which quantity is measured in joules in this lesson?", ["energy", "mass", "height", "speed"], 0, "Kinetic and gravitational potential energy are both measured in joules.", hint),
    mc("A 3 kg object is raised 5 m. Take g = 10 N/kg. What GPE is gained?", ["15 J", "50 J", "150 J", "300 J"], 2, "Use mass x g x height.", hint),
    mc("Which situation mainly gives gravitational potential energy rather than kinetic energy?", ["a ball rolling quickly along the floor", "a cyclist speeding downhill", "a book resting on a high shelf", "a trolley moving at constant speed on a track"], 2, "Look for energy stored because of height.", hint),
    mc("If mass and height both stay the same, gravitational potential energy stays...", ["smaller", "larger", "the same", "undefined"], 2, "GPE depends on m, g, and h only.", hint),
    mc("A 5 kg box is lifted 2 m. Take g = 10 N/kg. What GPE is gained?", ["20 J", "50 J", "100 J", "200 J"], 2, "Use GPE = mgh.", hint),
    shortCases([
      { prompt: "A 4 kg trolley moves at 3 m/s. What is its kinetic energy?", acceptedAnswers: energyAnswers(18), hint: "Use KE = 1/2mv^2." },
      { prompt: "A 2 kg object is raised 6 m. Take g = 10 N/kg. What GPE is gained?", acceptedAnswers: energyAnswers(120), hint: "Use GPE = mgh." },
      { prompt: "If the speed of the same object doubles, kinetic energy becomes ... times as large.", acceptedAnswers: words("4", "four"), hint: "Speed is squared in the formula." },
      { prompt: "The energy store due to motion is ... energy.", acceptedAnswers: words("kinetic", "kinetic energy"), hint: "This is the motion energy store." },
      { prompt: "The energy store due to height in a gravitational field is ... potential energy.", acceptedAnswers: words("gravitational", "gravitational potential", "gravitational potential energy"), hint: "This store depends on height above a reference level." },
      { prompt: "A 1 kg object moves at 8 m/s. What is its kinetic energy?", acceptedAnswers: energyAnswers(32), hint: "Use one-half times mass times speed squared." },
      { prompt: "A 6 kg object is raised 2 m. Take g = 10 N/kg. What GPE is gained?", acceptedAnswers: energyAnswers(120), hint: "Use GPE = mgh." },
      { prompt: "As an object falls, gravitational potential energy is transferred mainly into ... energy.", acceptedAnswers: words("kinetic", "kinetic energy"), hint: "Falling speeds the object up." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep energy stores, transfer pathways, and formula sensitivities distinct.";
  return [
    mc("Why does speed affect kinetic energy more strongly than mass?", ["Because speed is squared in the kinetic-energy formula while mass is a direct multiplier", "Because mass has no unit", "Because speed is always bigger than mass", "Because kinetic energy ignores mass"], 0, "The squared speed term is the key difference.", hint),
    mc("Why does an object on a higher shelf have more gravitational potential energy?", ["It is farther above the chosen reference level in the gravitational field", "It is moving faster", "It has less mass", "It has more friction"], 0, "GPE is a position store, not a motion store.", hint),
    mc("Why is a reference level needed when talking about gravitational potential energy?", ["Height is measured relative to some chosen zero level", "Because g changes sign", "Because mass depends on the shelf", "Because energy has no unit"], 0, "GPE depends on height above a chosen level.", hint),
    mc("Why can a falling object have more kinetic energy lower down?", ["Energy is transferred from the gravitational potential store into the kinetic store", "Energy is created from nowhere", "Mass increases as it falls", "Speed does not affect KE"], 0, "The lesson is about store transfer, not energy creation.", hint),
    mc("Which statement best protects conservation of energy in this lesson?", ["Energy changes store rather than disappearing when motion and height change", "Energy is destroyed when an object slows down", "Only kinetic energy counts as real energy", "Gravitational potential energy cannot change"], 0, "Conservation means the total is accounted for even when the form changes.", hint),
    mc("Why can two objects have the same kinetic energy with different masses and speeds?", ["Kinetic energy depends on the combined effect of both mass and speed", "Because mass does not matter in KE", "Because speed and energy are the same thing", "Because KE is always fixed"], 0, "Both variables matter in the formula.", hint),
    mc("Why is a moving object at ground level not a strong example of gravitational potential energy change?", ["Its energy change is mainly in the kinetic store unless its height changes", "Because motion removes gravity", "Because ground level means zero energy always", "Because KE and GPE are the same"], 0, "This lesson separates motion-store and height-store ideas.", hint),
    mc("If an object's mass doubles at the same height, why does its GPE double?", ["Mass is a direct multiplier in GPE = mgh", "Because height is squared", "Because g doubles automatically", "Because energy ignores height"], 0, "This is a direct proportionality.", hint),
    mc("If the same object is raised twice as high, why does its GPE double?", ["Height is a direct multiplier in GPE = mgh", "Because mass doubles with height", "Because kinetic energy becomes zero", "Because gravity stops acting"], 0, "GPE grows in direct proportion to height.", hint),
    mc("What common mistake is F3_L2 trying to prevent?", ["Treating all energy questions as if only one store mattered", "Using joules as a force unit", "Thinking mass is a vector", "Reading graph slope as area"], 0, "This lesson wants students to track the correct store and transfer.", hint),
    mc("Why does doubling speed not merely double the kinetic energy?", ["Because the speed term is squared in KE = 1/2mv^2", "Because kinetic energy ignores speed", "Because mass is always changing too", "Because doubling is not allowed in physics"], 0, "The square is the essential feature.", hint),
    mc("Why can GPE decrease while total energy stays conserved?", ["The lost GPE can be transferred into other stores such as kinetic or thermal", "Because energy vanishes during falling", "Because GPE is not real energy", "Because only KE is conserved"], 0, "Conservation tracks the total across stores.", hint),
    mc("Which statement best compares kinetic and gravitational potential energy?", ["Kinetic energy is linked to motion, while gravitational potential energy is linked to height in a gravitational field", "Both are linked only to motion", "Both are linked only to height", "Neither can be calculated"], 0, "Keep the store meanings separate.", hint),
    mc("Why is 'higher means faster' a weak rule for energy questions?", ["Height and speed correspond to different energy stores and must be checked separately", "Because height has no effect on energy", "Because speed always decreases with height", "Because only time matters"], 0, "This lesson distinguishes stores before drawing conclusions.", hint),
    mc("Why does a book lifted onto a shelf gain energy even when it is at rest at the end?", ["The energy is stored as gravitational potential energy because of its height", "Because it is still moving invisibly", "Because rest removes the need for energy", "Because kinetic energy has become negative"], 0, "Stored energy is still energy even at rest.", hint),
    mc("Why is it weak to decide an energy question from one variable alone?", ["The relevant relation may depend on more than one quantity, and the lesson asks you to keep the full model visible", "Because equations are optional", "Because all variables affect energy equally", "Because units decide everything"], 0, "Mass, speed, height, and store type must be kept in view.", hint),
    mc("Which lesson idea should stay visible in F3_L2?", ["Energy is stored in identifiable ways, and changes are explained by transfers between those stores", "Energy is created when objects speed up", "Only kinetic energy matters in mechanics", "Gravitational energy depends on time"], 0, "That is the central modelling rule of the lesson.", hint),
    mc("Why can two objects at the same height have different GPE?", ["They may have different masses", "Because height alone fixes GPE", "Because GPE ignores mass", "Because only speed matters"], 0, "Mass is part of the GPE relation.", hint),
    mc("Which statement best matches strong F3_L2 reasoning?", ["Identify the energy store first, then check which variables the relevant relation depends on", "Always use the kinetic-energy formula first", "Always use the GPE formula first", "Ignore whether the object is moving or raised"], 0, "That keeps the store model and the math aligned.", hint),
    mc("Why is a rolling object on a hill a richer energy story than a single-store description?", ["Its energy can be shared between kinetic and gravitational potential stores at the same time", "Because one store must always be zero", "Because energy questions only work on flat ground", "Because motion removes all stored energy"], 0, "The lesson is about tracking multiple stores coherently.", hint),
  ];
}
function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep rate of transfer separate from useful fraction.";
  return [
    mc("A machine transfers 600 J in 3 s. What is its power?", ["50 W", "100 W", "200 W", "600 W"], 2, "Use P = E / t.", hint),
    mc("A device takes in 500 J and gives 350 J useful output. What is its efficiency?", ["35%", "50%", "70%", "85%"], 2, "Efficiency = useful output / total input x 100%.", hint),
    mc("A motor with power 120 W runs for 5 s. How much energy is transferred?", ["240 J", "500 J", "600 J", "1200 J"], 2, "Energy = power x time.", hint),
    mc("Two machines each transfer 800 J. Machine A takes 4 s and Machine B takes 8 s. Which is more powerful?", ["Machine A", "Machine B", "they have the same power", "it depends on efficiency only"], 0, "For the same energy transfer, less time means greater power.", hint),
    mc("A machine is 80% efficient and takes in 500 J. How much useful output does it deliver?", ["100 J", "250 J", "400 J", "450 J"], 2, "Find 80% of the input energy.", hint),
    mc("A device takes in 1000 J and delivers 600 J useful output. How much energy is wasted?", ["200 J", "400 J", "600 J", "1600 J"], 1, "Wasted energy = input - useful output.", hint),
    mc("Which quantity is measured in watts?", ["energy", "power", "efficiency", "momentum"], 1, "The watt is the unit of energy-transfer rate.", hint),
    mc("Which quantity is usually given as a percentage?", ["power", "efficiency", "energy", "momentum"], 1, "Efficiency is a fraction often written as a percentage.", hint),
    mc("If the same energy is transferred in half the time, the power...", ["halves", "stays the same", "doubles", "becomes zero"], 2, "Power rises when the same transfer happens faster.", hint),
    mc("Can a real machine have efficiency greater than 100%?", ["yes, if it is powerful", "yes, if it is small", "no, because useful output cannot exceed total input", "no, because energy has no unit"], 2, "Efficiency above 100% would mean more useful energy out than total energy in.", hint),
    mc("A device transfers 240 J in 6 s. What is its power?", ["20 W", "30 W", "40 W", "1440 W"], 2, "Use energy divided by time.", hint),
    mc("A lamp is 25% efficient and takes in 80 J. What useful output does it deliver?", ["10 J", "20 J", "25 J", "60 J"], 1, "Useful output is the chosen fraction of the input.", hint),
    shortCases([
      { prompt: "A heater transfers 900 J with a power of 150 W. How long does it run for?", acceptedAnswers: numericAnswers(6, "s"), hint: "Time = energy / power." },
      { prompt: "A machine transfers 300 J in 5 s. What is its power?", acceptedAnswers: powerAnswers(60), hint: "Use power = energy / time." },
      { prompt: "A device is 60% efficient and takes in 200 J. What useful output does it deliver?", acceptedAnswers: energyAnswers(120), hint: "Take 60% of 200 J." },
      { prompt: "The rate of energy transfer is called ...", acceptedAnswers: words("power", "the power"), hint: "This is the quantity measured in watts." },
      { prompt: "Efficiency compares useful output with total ...", acceptedAnswers: words("input", "input energy", "the input"), hint: "This is the whole energy supplied to the process." },
      { prompt: "A 50 W device runs for 8 s. How much energy is transferred?", acceptedAnswers: energyAnswers(400), hint: "Energy = power x time." },
      { prompt: "A device takes in 400 J and gives 100 J useful output. What is its efficiency?", acceptedAnswers: percentageAnswers(25), hint: "Useful / input x 100%." },
      { prompt: "Energy that is not transferred usefully is called ... energy.", acceptedAnswers: words("wasted", "waste", "wasted energy"), hint: "This is the non-useful part of the transfer." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Power is about how fast; efficiency is about how much of the input becomes useful.";
  return [
    mc("Why can a machine be powerful without being very efficient?", ["It can transfer energy quickly while still wasting a large fraction of the input", "Power and efficiency always mean the same thing", "Efficiency depends only on time", "Power has no unit"], 0, "These are different questions about the same process.", hint),
    mc("Why can two devices with the same efficiency have different powers?", ["They can transfer different amounts of energy per second", "Equal efficiency forces equal power", "Power depends only on percentage", "Efficiency removes the need for time"], 0, "Useful fraction and transfer rate are independent ideas.", hint),
    mc("Why is efficiency written as useful output divided by total input?", ["Because it measures the fraction of the supplied energy that becomes useful", "Because it measures speed", "Because it measures force", "Because it measures momentum"], 0, "Efficiency is a usefulness ratio.", hint),
    mc("Why is a shorter transfer time evidence of greater power for the same energy transfer?", ["Power is energy transferred per unit time", "Efficiency must have increased", "Energy is created faster", "Mass becomes smaller"], 0, "This is the rate meaning of power.", hint),
    mc("Why is efficiency above 100% impossible in normal physics?", ["The useful output cannot exceed the total input without violating energy accounting", "Because percentages stop at 99", "Because power is always less than energy", "Because only light bulbs have efficiency"], 0, "More useful energy out than total in would break conservation ideas.", hint),
    mc("Why must wasted energy be considered when judging a device?", ["A process can transfer energy quickly yet still send much of the input into non-useful forms", "Because waste always improves power", "Because wasted energy has no unit", "Because useful output is irrelevant"], 0, "This lesson asks you to separate total transfer from useful transfer.", hint),
    mc("Which statement best separates power from efficiency?", ["Power tells how quickly energy is transferred; efficiency tells what fraction is useful", "Power and efficiency are two names for the same quantity", "Power tells the wasted fraction; efficiency tells the time taken", "Efficiency only applies to moving objects"], 0, "Keep rate and fraction distinct.", hint),
    mc("Why can a slow process still be efficient?", ["It may convert a large fraction of the input into useful output even if the rate is low", "Slow processes cannot be efficient", "Efficiency depends only on speed", "Efficiency is the same as power"], 0, "High usefulness does not require a high rate.", hint),
    mc("Why can a fast process still be wasteful?", ["A large amount of input energy can still go into unwanted stores even when transfer is rapid", "Fast processes always have 100% efficiency", "Waste only happens in slow processes", "Power removes wasted energy"], 0, "Rate and useful fraction are independent.", hint),
    mc("What common mistake is F3_L3 designed to prevent?", ["Treating power and efficiency as if they were interchangeable", "Using watts for energy", "Thinking joules are a percentage", "Reading graph slope as momentum"], 0, "This confusion is the lesson's main trap.", hint),
    mc("Why is it weak to judge a machine from power alone?", ["A high power does not show how much of the input is useful", "Power already equals efficiency", "Power ignores time", "Power has no relation to energy"], 0, "You still need the usefulness fraction.", hint),
    mc("Why is it weak to judge a machine from efficiency alone?", ["A high efficiency does not show how quickly the transfer happens", "Efficiency already equals power", "Efficiency ignores useful output", "Efficiency removes the need for units"], 0, "You still need the transfer rate.", hint),
    mc("Why is a watt a different kind of unit from a joule?", ["A watt measures a rate of transfer, while a joule measures an amount of energy", "A watt is larger than a joule", "A joule is only for heat", "A watt has no link to time"], 0, "One is an amount, the other is an amount per second.", hint),
    mc("Why does the time interval appear in power but not in efficiency?", ["Power is a rate, while efficiency is a ratio of useful output to total input", "Efficiency is a vector", "Time cancels energy in all equations", "Power and efficiency always use the same variables"], 0, "That is the cleanest algebraic separation.", hint),
    mc("Why does a 60% efficient device with a larger input energy often give more useful output than a 90% efficient device with a tiny input?", ["Useful output depends on both the fraction and the size of the total input", "Because higher efficiency always means lower output", "Because efficiency changes energy units", "Because input energy is irrelevant"], 0, "Percentage alone is not the whole story.", hint),
    mc("Which lesson idea should stay visible in F3_L3?", ["Separate the rate question from the useful-fraction question before comparing devices", "Always choose the machine with the biggest wattage", "Always choose the machine with the highest percentage only", "Ignore wasted energy if power is high"], 0, "This is the key reasoning discipline of the lesson.", hint),
    mc("Why is 'more powerful means more efficient' not a safe conclusion?", ["A device can be fast at transferring energy without sending a large fraction of that energy to useful output", "Because power and efficiency are identical", "Because efficiency is always zero", "Because watts are percentages"], 0, "This false shortcut is what the lesson is correcting.", hint),
    mc("Why is useful output sometimes smaller even when input and time are the same?", ["Efficiency may be lower, so a smaller fraction becomes useful", "Power must be larger", "Momentum is conserved", "Mass may be zero"], 0, "Useful fraction is the deciding factor here.", hint),
    mc("Which statement best matches strong F3_L3 reasoning?", ["Check both how fast the energy transfer happens and how much of the input becomes useful", "Check only the wattage", "Check only the percentage", "Ignore wasted energy when comparing devices"], 0, "That preserves the full meaning of the topic.", hint),
    mc("Why is an energy-saver device not automatically low-power in the physics sense?", ["Reducing wasted energy does not by itself tell you the rate of transfer", "Because efficiency makes power impossible", "Because power only applies to engines", "Because low waste means zero time"], 0, "Again, rate and useful fraction must be kept apart.", hint),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Momentum belongs to the whole system and keeps direction.";
  return [
    mc("A 3 kg trolley moves at 4 m/s east. What is its momentum?", ["7 kg m/s east", "12 kg m/s east", "12 kg m/s", "1 kg m/s east"], 1, "Use p = mv and keep the direction.", hint),
    mc("Two equal trolleys move in opposite directions with equal speed. The total momentum is...", ["zero", "equal to one trolley", "double one trolley", "impossible to tell"], 0, "Equal and opposite momenta cancel.", hint),
    mc("A 2 kg trolley moving at 6 m/s sticks to a 4 kg trolley at rest. What common speed do they have afterward?", ["1 m/s", "2 m/s", "3 m/s", "6 m/s"], 1, "Conserve total momentum for the combined system.", hint),
    mc("What is the unit of momentum?", ["J", "W", "kg m/s", "N/kg"], 2, "Momentum is mass x velocity.", hint),
    mc("A 4 kg trolley moves at 3 m/s west. What is its momentum?", ["7 kg m/s west", "12 kg m/s west", "12 kg m/s", "1 kg m/s west"], 1, "Mass multiplied by speed, with direction.", hint),
    mc("Which statement best gives conservation of momentum?", ["Total momentum before equals total momentum after if external forces are negligible", "Each object keeps its own momentum unchanged in every collision", "The faster object always has more total momentum after", "Momentum is conserved only when masses are equal"], 0, "Treat it as a whole-system law.", hint),
    mc("A 2 kg trolley moves right at 5 m/s and a 2 kg trolley moves left at 5 m/s. What is the total momentum?", ["0 kg m/s", "10 kg m/s right", "20 kg m/s right", "5 kg m/s left"], 0, "Equal and opposite momenta cancel in the total.", hint),
    mc("After a sticking collision, why can the shared speed be smaller than the incoming speed?", ["The same total momentum is shared by a larger total mass", "Momentum disappears during the collision", "The heavier object always stops the lighter one", "Final speed must always be zero"], 0, "Combined mass matters after sticking.", hint),
    mc("A 3 kg trolley moving at 4 m/s hits a 1 kg trolley at rest and they stick together. What common speed do they have afterward?", ["1 m/s", "2 m/s", "3 m/s", "4 m/s"], 2, "Total momentum before divided by total mass after.", hint),
    mc("Why must momentum keep direction in collision problems?", ["Momentum is a vector quantity", "Momentum is always positive", "Direction only matters for force", "Mass cancels direction"], 0, "Velocity gives momentum its direction.", hint),
    mc("A 5 kg object is at rest. What is its momentum?", ["0 kg m/s", "5 kg m/s", "5 N s", "undefined"], 0, "Zero velocity means zero momentum.", hint),
    mc("If an isolated system has zero total momentum before a collision, the total momentum after the collision is...", ["negative", "positive", "zero", "equal to the larger object only"], 2, "Total momentum stays conserved for the system.", hint),
    shortCases([
      { prompt: "A 2 kg trolley moves at 8 m/s east. What is its momentum?", acceptedAnswers: momentumAnswers(16, "east"), hint: "Use mass x velocity and include direction." },
      { prompt: "A 6 kg trolley moves at 2 m/s west. What is its momentum?", acceptedAnswers: momentumAnswers(12, "west"), hint: "Momentum keeps the direction of the velocity." },
      { prompt: "A 4 kg trolley at rest has momentum ...", acceptedAnswers: zeroAnswers("kg m/s"), hint: "Zero velocity means zero momentum." },
      { prompt: "The quantity equal to mass multiplied by velocity is ...", acceptedAnswers: words("momentum", "the momentum"), hint: "This lesson's core conserved quantity." },
      { prompt: "A 2 kg trolley moving at 3 m/s sticks to a 1 kg trolley at rest. What common speed do they have afterward?", acceptedAnswers: numericAnswers(2, "m/s"), hint: "Conserve total momentum, then divide by total mass." },
      { prompt: "In an isolated collision, total momentum before equals total momentum ...", acceptedAnswers: words("after", "afterwards", "after the collision"), hint: "This is the conservation statement." },
      { prompt: "A 3 kg trolley moves east at 5 m/s. What is its momentum?", acceptedAnswers: momentumAnswers(15, "east"), hint: "Multiply mass by velocity and keep direction." },
      { prompt: "If equal and opposite momenta are combined, the total momentum is ...", acceptedAnswers: zeroAnswers("kg m/s"), hint: "Equal opposite vectors cancel." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Think whole-system momentum, not one-object momentum, and keep the sign or direction.";
  return [
    mc("Why must conservation of momentum be applied to the whole system rather than to one object alone?", ["Momentum can be transferred between objects while the total stays constant", "Because one object has no mass", "Because one object has no velocity", "Because systems remove direction"], 0, "The total is what is conserved in an isolated interaction.", hint),
    mc("Why can two large individual momenta still give zero total momentum?", ["They can be equal in magnitude and opposite in direction", "Because momentum has no direction", "Because mass cancels velocity", "Because only small momenta cancel"], 0, "Momentum is a vector quantity.", hint),
    mc("Why is a sticking collision often slower afterward than the incoming motion?", ["The same total momentum is shared by a larger combined mass", "Momentum is destroyed", "The final object loses all mass", "The direction stops mattering"], 0, "Combined mass reduces the common speed for the same total momentum.", hint),
    mc("Why is it weak to compare collision outcomes by mass alone?", ["Momentum depends on both mass and velocity, with direction included", "Because velocity never matters", "Because mass and momentum are identical", "Because heavier objects always win"], 0, "Momentum is a combined quantity, not just mass.", hint),
    mc("Why does a stationary object still matter in a momentum calculation?", ["Its momentum is zero, which still affects the total-system bookkeeping", "It has infinite momentum", "It removes the need for direction", "It cannot be included in conservation"], 0, "Zero momentum is still a defined contribution.", hint),
    mc("Why must a direction or sign convention be chosen in momentum problems?", ["Opposite momenta subtract when combined, so the vector direction matters", "Because mass can be negative", "Because time changes sign", "Because momentum has no unit"], 0, "Direction determines whether momenta add or cancel.", hint),
    mc("Why can one object lose momentum while another gains it during a collision?", ["Momentum can be transferred between objects even when the system total stays constant", "Because conservation fails during collisions", "Because momentum is created and destroyed inside the system", "Because only one object's momentum matters"], 0, "The change of one object can be balanced by the change of another.", hint),
    mc("Why is 'the bigger object always has the larger momentum' a weak rule?", ["A smaller object moving fast enough can have equal or greater momentum", "Because mass does not matter at all", "Because momentum depends only on collision time", "Because bigger objects cannot move"], 0, "Velocity matters alongside mass.", hint),
    mc("What common mistake is F3_L4 designed to prevent?", ["Treating momentum conservation as if each object's momentum stays unchanged separately", "Using kg m/s as an energy unit", "Thinking velocity has no direction", "Reading force-time area as power"], 0, "The system view is the essential correction.", hint),
    mc("Why does an isolated-system condition matter for momentum conservation?", ["External forces would change the total system momentum during the interaction", "Because external forces remove mass", "Because isolation changes the unit", "Because only isolated objects can move"], 0, "Negligible external force is the condition behind direct conservation use.", hint),
    mc("Why is zero total momentum before a collision a strong constraint?", ["The total after the collision must also be zero if the system is isolated", "Because every object must stop forever", "Because momentum can only become positive", "Because the heaviest object chooses the direction"], 0, "Conservation applies to the total system quantity.", hint),
    mc("Why does momentum use velocity rather than speed?", ["Direction matters in combining and conserving momentum", "Speed has no unit", "Velocity removes mass", "Speed is only for energy"], 0, "Direction is built into the law.", hint),
    mc("Why can the same total momentum correspond to different speeds in different collisions?", ["The total mass carrying that momentum can be different", "Because momentum fixes a unique speed always", "Because time is ignored", "Because collisions change the unit of momentum"], 0, "The p = mv relation allows different mass-speed pairings.", hint),
    mc("Why is a recoil event still a conservation-of-momentum example?", ["The parts move in opposite directions so the total system momentum can remain what it was before", "Because momentum only works when objects stick", "Because one side has no momentum", "Because recoil removes the need for isolation"], 0, "Equal-and-opposite internal changes can conserve the total.", hint),
    mc("Why is the final common speed in a sticking collision not found by averaging the two initial speeds directly?", ["Momentum must be conserved using mass weighting, not simple arithmetic averaging", "Because final speed is always zero", "Because speed and momentum are the same", "Because time must be averaged first"], 0, "Mass weighting matters in the momentum balance.", hint),
    mc("Why can an isolated collision change kinetic energy even when momentum is conserved?", ["Momentum conservation and kinetic-energy conservation are different conditions", "Because conserving momentum automatically conserves KE", "Because collisions destroy all energy", "Because KE has direction"], 0, "This lesson isolates momentum as the conserved quantity here.", hint),
    mc("Which lesson idea should stay visible in F3_L4?", ["Compare total momentum before and after for the whole system, keeping direction visible", "Compare only the heaviest object before and after", "Ignore direction and add speeds", "Use force instead of momentum"], 0, "That is the central model of the lesson.", hint),
    mc("Why is it weak to say 'the faster object wins the collision'?", ["The total outcome depends on the combined system momentum, not on speed alone", "Because faster objects have zero momentum", "Because collisions ignore velocity", "Because only mass decides collisions"], 0, "Speed alone is not the conserved quantity.", hint),
    mc("Which statement best matches strong F3_L4 reasoning?", ["Assign direction, calculate each momentum, combine to a total, and conserve that total across the interaction", "Compare masses only", "Compare speeds only", "Ignore any object that starts at rest"], 0, "That sequence protects the vector and system meanings together.", hint),
    mc("Why is opposite direction not just a label in momentum questions?", ["It determines whether momentum contributions add or subtract in the system total", "Because direction never changes the value", "Because only arrows on diagrams need direction", "Because masses cancel direction"], 0, "This is the vector heart of the lesson.", hint),
  ];
}
function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Impulse links force, stopping time, and momentum change in one relation.";
  return [
    mc("Impulse is equal to...", ["force x time", "force / time", "momentum / time", "mass x acceleration only"], 0, "Impulse is the product of force and time.", hint),
    mc("A force of 150 N acts for 0.4 s. What impulse is delivered?", ["15 N s", "30 N s", "60 N s", "150 N s"], 2, "Use impulse = force x time.", hint),
    mc("If the same momentum change happens over a longer time, the average force is...", ["larger", "smaller", "unchanged", "zero"], 1, "For a fixed impulse, more time means less force.", hint),
    mc("What does the area under a force-time graph represent?", ["velocity", "impulse", "power", "mass"], 1, "Area under a force-time graph gives impulse.", hint),
    mc("A 300 N force acts for 0.2 s. What impulse is delivered?", ["30 N s", "60 N s", "120 N s", "600 N s"], 1, "Use force multiplied by time.", hint),
    mc("If two force-time rectangles have the same area, they have the same...", ["impulse", "power", "mass", "velocity"], 0, "Equal area means equal impulse.", hint),
    mc("Which statement best links impulse to momentum?", ["Impulse equals the change in momentum", "Impulse is momentum divided by time", "Impulse is the same as speed", "Impulse only applies when objects stop"], 0, "Impulse measures how much momentum changes.", hint),
    mc("For the same impulse, what happens if the interaction time halves?", ["The average force doubles", "The average force halves", "The momentum change becomes zero", "The mass must double"], 0, "Delivering the same impulse in less time needs more force.", hint),
    mc("A force-time graph shows a rectangle 5 s wide and 40 N high. What impulse is represented?", ["8 N s", "45 N s", "200 N s", "400 N s"], 2, "Area = base x height.", hint),
    mc("Why does catching an egg with moving hands reduce the force?", ["It increases the stopping time for the same momentum change", "It removes the egg's mass", "It makes the egg's speed increase", "It reduces gravity to zero"], 0, "The same momentum change spread over more time lowers the force.", hint),
    mc("Which unit is valid for impulse?", ["N s", "J/s", "kg", "m/s^2"], 0, "Impulse can be written as N s and also equals kg m/s.", hint),
    mc("A car's momentum changes by 800 kg m/s in 0.5 s. What average force acts?", ["200 N", "400 N", "1600 N", "4000 N"], 2, "Use force = change in momentum / time.", hint),
    shortCases([
      { prompt: "A 50 N force acts for 3 s. What impulse is delivered?", acceptedAnswers: impulseAnswers(150), hint: "Impulse = force x time." },
      { prompt: "If the same impulse is delivered in twice the time, the average force becomes ... of the original.", acceptedAnswers: words("half", "one-half", "1/2", "halved"), hint: "Same impulse spread over more time lowers force." },
      { prompt: "The area under a force-time graph gives the ...", acceptedAnswers: words("impulse", "the impulse"), hint: "This is the quantity linked to momentum change." },
      { prompt: "Impulse equals the change in ...", acceptedAnswers: words("momentum", "the momentum"), hint: "This is the momentum-link statement." },
      { prompt: "A 120 N force acts for 0.5 s. What impulse is delivered?", acceptedAnswers: impulseAnswers(60), hint: "Multiply force by time." },
      { prompt: "A momentum change of 300 kg m/s happens in 0.6 s. What average force acts?", acceptedAnswers: forceAnswers(500), hint: "Force = change in momentum / time." },
      { prompt: "If stopping time increases for the same momentum change, the average force ...", acceptedAnswers: words("decreases", "gets smaller", "is smaller"), hint: "This is the safety idea behind impulse." },
      { prompt: "A 25 N force acts for 4 s. What impulse is delivered?", acceptedAnswers: impulseAnswers(100), hint: "Use force times time." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep the momentum change fixed when you reason about time and force trade-offs.";
  return [
    mc("Why does a longer stopping time reduce average force for the same collision outcome?", ["The same impulse is spread over more time", "Because the momentum change becomes larger", "Because the mass disappears", "Because time cancels force"], 0, "This is the main impulse-time safety relation.", hint),
    mc("Why is the area under a force-time graph useful in collisions?", ["It gives the impulse and therefore the change in momentum", "It gives the mass directly", "It gives power only", "It gives distance travelled"], 0, "Area links the graph to impulse.", hint),
    mc("Why can two different force-time shapes still give the same effect on momentum?", ["They can have the same area and therefore the same impulse", "They must have the same peak force", "They must last the same time", "They must have the same graph height everywhere"], 0, "Equal area means equal impulse even if the shapes differ.", hint),
    mc("Why is impulse not the same thing as force?", ["Impulse includes how long the force acts as well as how large it is", "Impulse has no unit", "Impulse ignores time", "Impulse is just another name for momentum"], 0, "Force is an instantaneous push; impulse is the accumulated effect over time.", hint),
    mc("Why is an airbag a force-reduction device in this lesson model?", ["It increases the stopping time for the same momentum change", "It removes all momentum instantly", "It increases the impact speed", "It makes the passenger mass smaller"], 0, "The same idea as crumple zones and cushioning.", hint),
    mc("What common mistake is F3_L5 designed to prevent?", ["Treating a large force as automatically more dangerous without checking the time interval and momentum change", "Using newtons for force", "Using seconds for time", "Thinking graphs can have area"], 0, "The lesson wants force and time kept in one combined story.", hint),
    mc("Why is it weak to describe a collision using force alone?", ["The same force can have very different effects depending on how long it acts", "Because force has no unit", "Because collisions never involve force", "Because momentum ignores force"], 0, "Impulse combines size and duration.", hint),
    mc("Why is it weak to describe a collision using time alone?", ["The force size still matters because impulse depends on both force and time", "Because time already determines momentum", "Because time has no unit", "Because longer time always means bigger force"], 0, "Duration alone is not enough either.", hint),
    mc("Why does a padded surface reduce average impact force?", ["It increases the time over which the momentum changes", "It removes the object's momentum before impact", "It increases the object's mass", "It makes the object stop faster"], 0, "Same safety mechanism: longer stop, smaller force.", hint),
    mc("Why can a sharp, short spike and a broad, lower pulse be equivalent on a force-time graph?", ["They can enclose the same area, so the impulse is the same", "Because only the tallest point matters", "Because only the width matters", "Because the graph unit changes"], 0, "Again, area is the impulse.", hint),
    mc("Why is the change in momentum the quantity paired with impulse?", ["Impulse measures the effect of force over time on motion state", "Because momentum ignores direction", "Because force is always conserved", "Because mass is always constant"], 0, "Impulse is the momentum-change bookkeeping quantity.", hint),
    mc("Which statement best separates force from impulse?", ["Force is the rate of momentum change at an instant or over an interval, while impulse is the total momentum change delivered", "Force and impulse are identical", "Impulse is the unit of force", "Force only matters when momentum is zero"], 0, "One is the push size; the other is the accumulated effect.", hint),
    mc("Why can a smaller average force still stop an object completely?", ["If it acts for long enough to produce the required impulse", "Because small forces are stronger", "Because stopping never needs momentum change", "Because time removes mass"], 0, "The required momentum change can be delivered more gently over longer time.", hint),
    mc("Why is a seat belt part of the same physics story as a crumple zone?", ["Both increase the time over which the passenger's momentum changes", "Both remove the passenger's mass", "Both make the collision speed increase", "Both eliminate all forces"], 0, "They use the same impulse-time principle.", hint),
    mc("Which lesson idea should stay visible in F3_L5?", ["For a fixed momentum change, longer interaction time means smaller average force", "For a fixed momentum change, longer time means larger force", "Force alone decides the momentum change", "Time alone decides the momentum change"], 0, "That is the central impulse rule of the lesson.", hint),
    mc("Why is the impulse formula useful even when the force is not constant?", ["The total area under the force-time graph still gives the impulse", "Because non-constant forces have no effect", "Because only constant forces change momentum", "Because time is ignored when force varies"], 0, "Graph area keeps the idea valid beyond simple constant-force rectangles.", hint),
    mc("Why does impulse share units with momentum?", ["Because impulse equals the change in momentum", "Because both are forms of energy", "Because both ignore direction", "Because both are percentages"], 0, "The unit equivalence comes from the equality of the quantities.", hint),
    mc("Why is it safer to stretch a stop over longer time in transport design?", ["It reduces the average force for the same momentum change", "It increases the momentum change", "It makes kinetic energy irrelevant", "It always reduces the distance travelled to zero"], 0, "This is the transport-safety application of impulse.", hint),
    mc("Which statement best matches strong F3_L5 reasoning?", ["Check the momentum change needed, then compare how force and time combine to produce that impulse", "Check only the largest force value", "Check only how long the event lasts", "Ignore the force-time graph area"], 0, "That keeps the mechanism and the math aligned.", hint),
    mc("Why is 'bigger force-time area means bigger momentum change' a safe reading rule?", ["Because force-time area is impulse, and impulse equals change in momentum", "Because area gives power", "Because area gives mass", "Because area removes the need for signs"], 0, "This is the key graph interpretation for the lesson.", hint),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep momentum, kinetic energy, stopping time, and average force linked in one braking story.";
  return [
    mc("A 1000 kg car moves at 12 m/s. What is its momentum?", ["1200 kg m/s", "12000 kg m/s", "120000 kg m/s", "6000 kg m/s"], 1, "Use p = mv.", hint),
    mc("A 900 kg car moves at 10 m/s. What is its kinetic energy?", ["9000 J", "18000 J", "45000 J", "90000 J"], 2, "Use KE = 1/2mv^2.", hint),
    mc("If the speed of the same car doubles, its kinetic energy becomes...", ["twice as large", "three times as large", "four times as large", "unchanged"], 2, "Kinetic energy depends on speed squared.", hint),
    mc("A car changes momentum by 6000 kg m/s in 0.3 s. What average force acts?", ["2000 N", "6000 N", "12000 N", "20000 N"], 3, "Use force = change in momentum / time.", hint),
    mc("Why does a crumple zone reduce injury risk?", ["It removes mass", "It increases stopping time and lowers average force", "It increases speed", "It makes kinetic energy disappear instantly"], 1, "A longer stopping time reduces average force for the same momentum change.", hint),
    mc("A car and a truck move at the same speed. Which has the greater momentum?", ["the car", "the truck", "they have the same momentum", "you need the stopping time first"], 1, "At the same speed, the vehicle with the larger mass has the larger momentum.", hint),
    mc("Which comparison is correct when the same car doubles its speed?", ["momentum doubles and kinetic energy quadruples", "momentum quadruples and kinetic energy doubles", "both double", "momentum stays the same and kinetic energy doubles"], 0, "Momentum depends directly on speed, but kinetic energy depends on speed squared.", hint),
    mc("If the same momentum change happens in a shorter stopping time, the average force...", ["decreases", "stays the same", "increases", "becomes zero"], 2, "Shorter time means a larger force for the same momentum change.", hint),
    mc("A 1200 kg car moving at 5 m/s comes to rest. What was its initial momentum?", ["240 kg m/s", "600 kg m/s", "6000 kg m/s", "12000 kg m/s"], 2, "Use mass x velocity.", hint),
    mc("A 1000 kg car moving at 20 m/s has kinetic energy...", ["10000 J", "20000 J", "100000 J", "200000 J"], 3, "Use 1/2mv^2.", hint),
    mc("If a car's stopping time doubles for the same initial momentum and same final stop, the average braking force...", ["doubles", "halves", "stays the same", "quadruples"], 1, "Same momentum change over twice the time means half the force.", hint),
    mc("Why is speed such a strong safety factor in braking?", ["Momentum rises with speed and kinetic energy rises with speed squared", "Because mass stops mattering", "Because time becomes irrelevant", "Because force is always constant"], 0, "Both momentum and KE get larger, with KE rising especially fast.", hint),
    shortCases([
      { prompt: "A 1500 kg car moves at 8 m/s. What is its momentum?", acceptedAnswers: momentumAnswers(12000), hint: "Use momentum = mass x velocity." },
      { prompt: "A 1000 kg car moving at 6 m/s has kinetic energy ...", acceptedAnswers: energyAnswers(18000), hint: "Use KE = 1/2mv^2." },
      { prompt: "A car's momentum changes by 9000 kg m/s in 0.5 s. What average force acts?", acceptedAnswers: forceAnswers(18000), hint: "Force = change in momentum / time." },
      { prompt: "If the same car doubles its speed, momentum becomes ... times as large.", acceptedAnswers: words("2", "two"), hint: "Momentum is directly proportional to speed." },
      { prompt: "If the same car doubles its speed, kinetic energy becomes ... times as large.", acceptedAnswers: words("4", "four"), hint: "Kinetic energy depends on speed squared." },
      { prompt: "The safety feature that increases stopping time to reduce force is a ... zone.", acceptedAnswers: words("crumple", "crumple zone"), hint: "This is the car-body feature highlighted in the lesson." },
      { prompt: "A 800 kg car moving at 15 m/s has momentum ...", acceptedAnswers: momentumAnswers(12000), hint: "Multiply mass by speed." },
      { prompt: "For the same momentum change, a longer stopping time gives a ... average force.", acceptedAnswers: words("smaller", "lower", "reduced"), hint: "Spread the same impulse over more time." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Braking safety depends on how momentum, kinetic energy, and stopping time interact.";
  return [
    mc("Why is doubling speed especially dangerous in braking problems?", ["Momentum doubles, but kinetic energy quadruples and must still be removed", "Because mass doubles automatically", "Because stopping time must go to zero", "Because force becomes constant"], 0, "Speed changes both momentum and kinetic energy, with KE rising faster.", hint),
    mc("Why does a longer stopping time reduce average impact or braking force?", ["The same momentum change happens over more time", "Because the car loses mass", "Because kinetic energy becomes zero before braking begins", "Because longer time increases speed"], 0, "This is the key safety mechanism of the lesson.", hint),
    mc("Why is vehicle mass still important even when comparing cars at the same speed?", ["Greater mass gives greater momentum and greater kinetic energy at the same speed", "Mass only affects momentum, not energy", "Mass has no effect in braking", "Mass always reduces risk"], 0, "Mass matters in both p = mv and KE = 1/2mv^2.", hint),
    mc("Why can the same stopping distance still hide different risks at different speeds?", ["The faster car starts with much larger kinetic energy and momentum to remove", "Stopping distance alone fixes the force automatically", "Speed only affects time, not energy", "Risk depends only on mass"], 0, "The starting motion state matters strongly.", hint),
    mc("Why is a crumple zone a momentum-change management feature rather than a 'force remover'?", ["It changes how long the momentum change takes, which changes the average force", "It prevents momentum from changing", "It removes the vehicle's mass", "It makes kinetic energy irrelevant"], 0, "The force is reduced by extending the time.", hint),
    mc("Why is it weak to explain braking safety using only momentum?", ["Kinetic energy also matters, and it grows more steeply with speed", "Because momentum is not real", "Because KE has direction and momentum does not", "Because only force matters"], 0, "The lesson joins momentum and KE in one safety story.", hint),
    mc("Why is it weak to explain braking safety using only kinetic energy?", ["The average force during stopping is directly linked to the momentum change over time as well", "Because energy never changes in braking", "Because KE ignores speed", "Because only momentum matters"], 0, "Force, impulse, momentum, and KE are all part of the braking model.", hint),
    mc("What common mistake is F3_L6 designed to prevent?", ["Treating higher speed as a simple linear risk change without recognising the stronger kinetic-energy effect", "Using kilograms for mass", "Using joules for energy", "Thinking cars have no momentum"], 0, "The lesson emphasises how sharply speed raises the hazard.", hint),
    mc("Why can two cars with the same momentum still have different kinetic energies?", ["Different mass-speed combinations can give the same momentum but different speed-squared energy values", "Because kinetic energy equals momentum always", "Because momentum has no unit", "Because both quantities ignore mass"], 0, "Momentum and KE are related but not interchangeable.", hint),
    mc("Why is stopping time part of a force explanation but not part of a momentum-only value?", ["Force depends on how quickly momentum changes, while momentum itself depends only on mass and velocity", "Because time has no unit", "Because momentum is a rate", "Because force ignores momentum"], 0, "This keeps the quantity roles separated.", hint),
    mc("Why do heavier vehicles need larger braking forces to achieve the same deceleration at the same speed?", ["They have larger momentum and require a larger force for the same rate of change", "Because heavier vehicles have no KE", "Because time stops in heavy vehicles", "Because deceleration ignores mass"], 0, "Mass raises the momentum that must be changed.", hint),
    mc("Why can a safety barrier work by deforming during a crash?", ["Deformation extends the stopping time and reduces the average force", "Deformation increases the car's mass", "Deformation removes all energy instantly", "Deformation stops momentum changing"], 0, "This is the same principle as the crumple zone.", hint),
    mc("Why is 'the car stopped, so the momentum is zero' not a complete safety explanation?", ["You still need to explain how much momentum changed and over what time the stop happened", "Because stopped cars keep moving", "Because zero momentum means infinite force", "Because KE does not matter"], 0, "Final momentum alone does not tell the severity.", hint),
    mc("Why is 'same speed means same crash danger' a weak rule?", ["Vehicle mass and stopping conditions also affect momentum, energy, and force", "Because speed never matters", "Because only stopping time matters", "Because energy and force are identical"], 0, "The full model has more than one variable.", hint),
    mc("Which lesson idea should stay visible in F3_L6?", ["Braking safety is explained by combining momentum change, kinetic energy, and stopping time rather than by one slogan alone", "Only momentum matters", "Only kinetic energy matters", "Only crumple zones matter"], 0, "This is the lesson's core synthesis rule.", hint),
    mc("Why can an apparently small speed increase produce a much larger braking-energy problem?", ["Kinetic energy depends on speed squared", "Momentum depends on speed cubed", "Mass must double with speed", "Stopping time becomes negative"], 0, "That square dependence is the big risk amplifier.", hint),
    mc("Why can braking force be reduced without changing the overall stop from moving to rest?", ["The same momentum change can be delivered over a longer time", "The momentum change becomes smaller automatically", "The car no longer has kinetic energy", "The speed must increase"], 0, "This is the central impulse-based safety strategy.", hint),
    mc("Why is it useful to compare both p = mv and KE = 1/2mv^2 in the same crash problem?", ["They highlight different but linked reasons why higher mass or speed raises the challenge of stopping safely", "Because the two equations always give the same number", "Because one equation is enough and the other is decorative", "Because KE replaces force"], 0, "The lesson is about keeping both quantities visible.", hint),
    mc("Which statement best matches strong F3_L6 reasoning?", ["Compare how mass and speed affect momentum and kinetic energy, then connect the required stop to stopping time and average force", "Check only the car's final speed", "Check only the crumple-zone label", "Ignore the time over which the stop occurs"], 0, "That preserves the full multi-quantity safety model.", hint),
    mc("Why is a seat belt part of the same physics story as braking distance and crumple zones?", ["It helps manage the passenger's momentum change over a longer time and distance", "It removes the passenger's mass", "It makes kinetic energy disappear before the crash", "It makes speed irrelevant"], 0, "The shared idea is reducing force by extending the stop.", hint),
  ];
}

const F3_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F3_L1: l1DiagnosticRaw,
  F3_L2: l2DiagnosticRaw,
  F3_L3: l3DiagnosticRaw,
  F3_L4: l4DiagnosticRaw,
  F3_L5: l5DiagnosticRaw,
  F3_L6: l6DiagnosticRaw,
};

const F3_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F3_L1: l1ConceptRaw,
  F3_L2: l2ConceptRaw,
  F3_L3: l3ConceptRaw,
  F3_L4: l4ConceptRaw,
  F3_L5: l5ConceptRaw,
  F3_L6: l6ConceptRaw,
};

const F3_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(F3_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...F3_DIAGNOSTIC_BUILDERS[code](), ...F3_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function f3GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F3_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function f3GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F3_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function f3GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F3_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
