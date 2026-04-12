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
    throw new Error(`M2 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function forceAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "N"), numericAnswers(value, "newtons"), numericAnswers(value, "newton"));
}

function accelerationAnswers(value: number): string[] {
  return mergeAnswers(
    numericAnswers(value, "m/s^2"),
    numericAnswers(value, "m/s2"),
    numericAnswers(value, "m s^-2"),
    numericAnswers(value, "ms^-2"),
  );
}

function momentumAnswers(value: number): string[] {
  return mergeAnswers(
    numericAnswers(value, "kg m/s"),
    numericAnswers(value, "kg m s^-1"),
    numericAnswers(value, "kgm/s"),
  );
}

function torqueAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "N m"), numericAnswers(value, "Nm"));
}

function speedAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "m/s"), numericAnswers(value, "m s^-1"), numericAnswers(value, "ms^-1"));
}

function angleAnswers(value: number): string[] {
  const plain = formatNumber(value);
  return words(plain, `${plain} degrees`, `${plain} degree`);
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Find the resultant force first, then decide whether motion changes.";
  return [
    mc("What does the resultant force on an object decide most directly?", ["its acceleration", "its current velocity only", "its mass", "its route shape"], 0, "Resultant force controls the change in motion.", hint),
    mc("A box has 12 N to the right and 7 N to the left acting on it. What is the resultant force?", ["5 N right", "5 N left", "19 N right", "0 N"], 0, "Subtract opposite forces and keep the larger direction.", hint),
    mc("A trolley has equal and opposite horizontal forces acting on it. What is the resultant force?", ["zero", "equal to one of the forces", "double one force", "not enough information"], 0, "Equal opposite forces cancel.", hint),
    mc("A spacecraft is moving east at constant velocity in deep space. What must be true about the resultant force?", ["it is zero", "it is eastward", "it is westward", "it equals the mass"], 0, "Constant velocity means zero acceleration.", hint),
    mc("Which statement matches Newton's first law?", ["An object stays at rest or in uniform motion unless a resultant force acts", "A moving object must always have a forward force", "Force is needed to keep constant speed", "Resultant force equals momentum"], 0, "This is the law of inertia.", hint),
    mc("A skater is gliding north. The resultant force becomes southward. What happens first?", ["the skater slows while still moving north", "the skater instantly moves south", "the skater keeps the same northward velocity", "the skater becomes stationary forever"], 0, "Acceleration opposite the motion reduces the speed first.", hint),
    mc("What are the units of force?", ["kg", "m/s", "N", "kg m/s"], 2, "Force is measured in newtons.", hint),
    mc("Which pair can both have zero resultant force?", ["an object at rest and an object moving at constant velocity", "an accelerating object and a stationary object", "two objects with different non-zero accelerations", "an object moving in a circle and an object at rest"], 0, "Zero resultant force does not mean one special motion state.", hint),
    mc("A car has 20 N forward and 20 N backward forces on it while already moving forward. What happens next?", ["it continues at constant velocity", "it speeds up", "it instantly stops", "it reverses"], 0, "Balanced forces mean no acceleration.", hint),
    mc("Why are 'balanced forces' and 'no forces' different stories?", ["Balanced forces still mean forces are present and cancel", "No forces always mean acceleration", "Balanced forces remove mass", "They always produce different resultant force"], 0, "The resultant can match while the force picture differs.", hint),
    mc("A crate has 9 N east, 3 N west, and 2 N west. What is the resultant force?", ["4 N east", "4 N west", "14 N east", "0 N"], 0, "Combine the opposite forces before deciding the net direction.", hint),
    mc("Which quantity is zero when the resultant force is zero?", ["acceleration", "velocity", "distance", "mass"], 0, "Zero resultant force means zero acceleration.", hint),
    shortCases([
      { prompt: "Write the term for the single overall force after all forces are combined.", acceptedAnswers: words("resultant force", "net force"), hint },
      { prompt: "If the resultant force is zero, the acceleration is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "A sled has 15 N east and 6 N west acting on it. Find the resultant force.", acceptedAnswers: forceAnswers(9).concat(words("9 N east")), hint },
      { prompt: "A 5 N north force and a 5 N south force act together. What is the resultant force?", acceptedAnswers: words("0", "zero", "0 N", "zero newtons"), hint },
      { prompt: "An object can keep moving with constant velocity if the resultant force is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "Balanced forces mean no change in ...", acceptedAnswers: words("velocity", "motion", "motion state"), hint },
      { prompt: "Force is measured in ...", acceptedAnswers: words("N", "newtons", "newton"), hint },
      { prompt: "A moving object with zero resultant force does not stop; it keeps a constant ...", acceptedAnswers: words("velocity", "speed and direction", "motion"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep resultant force separate from whatever motion the object already has.";
  return [
    mc("Why is 'a moving object must have a force in the direction of motion' wrong?", ["Because force is needed to change velocity, not to maintain constant velocity", "Because moving objects have no forces at all", "Because velocity causes force", "Because only heavy objects can move without force"], 0, "Newton's first law is the key correction.", hint),
    mc("Why can an object be moving even when the resultant force is zero?", ["Because zero resultant force means no change in motion, not zero motion", "Because zero force means the object has infinite mass", "Because velocity and acceleration are the same", "Because force matters only at the start of motion"], 0, "Zero force leaves the current velocity unchanged.", hint),
    mc("Why does a westward resultant force on an eastward-moving object not make it reverse instantly?", ["Because it first produces a westward acceleration that reduces the eastward velocity", "Because forces cannot oppose motion", "Because resultant force only changes mass", "Because velocity ignores direction"], 0, "Acceleration acts over time.", hint),
    mc("Why is the resultant force more important than one isolated force arrow?", ["Because all forces together determine the acceleration", "Because only the biggest force ever matters", "Because isolated forces decide velocity directly", "Because balanced forces are impossible"], 0, "You need the combined overall force.", hint),
    mc("Why are balanced forces and no forces not interchangeable descriptions?", ["Because one has forces present that cancel while the other has none present", "Because balanced forces always cause acceleration", "Because no forces imply constant acceleration", "Because no forces and balanced forces give opposite resultant forces"], 0, "Same resultant, different physical setup.", hint),
    mc("Why is zero resultant force compatible with both rest and constant velocity?", ["Because both motion states have zero acceleration", "Because both states have zero mass", "Because both states have zero distance", "Because velocity is undefined in both cases"], 0, "The shared feature is no change in velocity.", hint),
    mc("Why must the forces be combined with direction?", ["Because forces in opposite directions can cancel", "Because direction never affects forces", "Because forces are scalars", "Because only speed matters"], 0, "Force is a vector quantity.", hint),
    mc("Which misunderstanding is the lesson trying hardest to remove?", ["confusing zero resultant force with zero velocity", "confusing mass with force units", "confusing time with distance", "confusing acceleration with charge"], 0, "That confusion blocks correct first-law reasoning.", hint),
    mc("Why is inertia relevant to zero-resultant-force cases?", ["Because an object resists changes to its velocity", "Because inertia creates a forward force", "Because inertia means acceleration is constant", "Because inertia removes mass"], 0, "Inertia explains why unchanged motion persists.", hint),
    mc("Why should motion story and force story be described separately?", ["Because the current velocity and the resultant force answer different questions", "Because force makes velocity irrelevant", "Because velocity always determines the resultant force", "Because only one of them can be measured"], 0, "One describes the present motion, the other the change.", hint),
    mc("Why is a straight-line free-body style combination step useful before prediction?", ["Because it makes the resultant explicit before talking about acceleration", "Because it gives the final velocity directly", "Because it removes the need for units", "Because it makes opposite forces impossible"], 0, "Always collapse to the net force first.", hint),
    mc("What does Newton's first law say about a stationary object with zero resultant force?", ["it remains stationary unless a resultant force acts", "it must begin moving", "it gains force internally", "it instantly loses mass"], 0, "Rest is also a zero-acceleration state.", hint),
    shortCases([
      { prompt: "Force changes motion by producing ...", acceptedAnswers: words("acceleration", "a change in velocity"), hint },
      { prompt: "Zero resultant force means zero ...", acceptedAnswers: words("acceleration"), hint },
      { prompt: "A moving object with zero resultant force keeps constant ...", acceptedAnswers: words("velocity"), hint },
      { prompt: "Balanced forces and no forces can share the same ... force.", acceptedAnswers: words("resultant", "net"), hint },
      { prompt: "To predict motion change correctly, combine all forces into the ... force first.", acceptedAnswers: words("resultant", "net"), hint },
      { prompt: "An object resists changes in motion because of ...", acceptedAnswers: words("inertia"), hint },
      { prompt: "A force opposite the current velocity first makes the object ...", acceptedAnswers: words("slow down", "decelerate"), hint },
      { prompt: "Velocity and resultant force should be kept in separate reasoning ...", acceptedAnswers: words("stories", "slots", "steps"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use F = ma for one object, and keep third-law pairs on different objects.";
  return [
    mc("What is the acceleration of a 6 kg object acted on by a 24 N resultant force?", ["2 m/s^2", "3 m/s^2", "4 m/s^2", "6 m/s^2"], 2, "Use a = F / m.", hint),
    mc("A 12 N resultant force acts on a 3 kg cart. What is the acceleration?", ["2 m/s^2", "3 m/s^2", "4 m/s^2", "36 m/s^2"], 2, "12 / 3 = 4.", hint),
    mc("For the same resultant force, which object accelerates more?", ["the lighter object", "the heavier object", "both equally", "the faster object"], 0, "Acceleration is inversely related to mass for a fixed force.", hint),
    mc("Two interacting skaters push each other. What does Newton's third law say about the forces?", ["They are equal and opposite on different skaters", "The heavier skater pushes harder", "The lighter skater feels no force", "They cancel because they are on one object"], 0, "Third-law pairs act on different bodies.", hint),
    mc("If the same 18 N force acts on 2 kg and 6 kg objects, what is true?", ["the 2 kg object has three times the acceleration", "the 6 kg object has three times the acceleration", "the accelerations are equal", "both remain at rest"], 0, "18/2 = 9 and 18/6 = 3.", hint),
    mc("What is the SI unit of acceleration?", ["N", "kg", "m/s^2", "kg m/s"], 2, "Acceleration is measured in metres per second squared.", hint),
    mc("Which equation is the constant-mass form of Newton's second law?", ["F = mv", "F = ma", "p = mv", "a = vt"], 1, "This is the standard form for constant mass.", hint),
    mc("A 15 N interaction force acts on a 5 kg object. What acceleration does that object have?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "5 m/s^2"], 2, "15/5 = 3.", hint),
    mc("Why do equal third-law forces not always produce equal accelerations?", ["the masses may differ", "the forces are not really equal", "time cancels the force", "acceleration ignores mass"], 0, "Mass still matters in a = F / m.", hint),
    mc("If mass doubles while resultant force stays the same, acceleration...", ["doubles", "halves", "stays the same", "becomes zero"], 1, "a = F / m.", hint),
    mc("What resultant force is needed to accelerate a 4 kg body at 3 m/s^2?", ["7 N", "12 N", "16 N", "24 N"], 1, "Use F = ma = 4 x 3.", hint),
    mc("Which statement is correct about third-law pairs?", ["they must not be cancelled in one object's F = ma analysis", "they always cancel because they are equal and opposite", "they act on the same object", "they are only present when masses match"], 0, "Equal and opposite does not mean same object.", hint),
    shortCases([
      { prompt: "A 20 N resultant force acts on a 10 kg cart. Find the acceleration.", acceptedAnswers: accelerationAnswers(2), hint },
      { prompt: "Write Newton's second law for constant mass.", acceptedAnswers: words("F = ma", "F=ma"), hint },
      { prompt: "Equal and opposite interaction forces act on ... objects.", acceptedAnswers: words("different", "two different"), hint },
      { prompt: "If the same force acts on a larger mass, the acceleration becomes ...", acceptedAnswers: words("smaller", "less"), hint },
      { prompt: "A 5 kg object accelerates at 4 m/s^2. Find the resultant force.", acceptedAnswers: forceAnswers(20), hint },
      { prompt: "Newton's third law pairs act during an ... between objects.", acceptedAnswers: words("interaction", "contact", "collision"), hint },
      { prompt: "A one-object response question uses resultant force and ...", acceptedAnswers: words("mass"), hint },
      { prompt: "A 9 N force on a 3 kg body gives acceleration ...", acceptedAnswers: accelerationAnswers(3), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Separate one-object acceleration from two-object interaction pairs.";
  return [
    mc("Why is 'the heavier object pushes back harder' wrong in a collision?", ["Because third-law forces are equal and opposite", "Because heavier objects feel no force", "Because only the lighter object interacts", "Because force depends only on speed"], 0, "Third-law pair sizes match even when masses differ.", hint),
    mc("Why can equal forces give unequal accelerations?", ["Because acceleration also depends on mass", "Because equal forces are impossible", "Because acceleration depends only on speed", "Because masses cancel"], 0, "Use a = F / m.", hint),
    mc("Why must third-law forces not be cancelled in one object's equation of motion?", ["Because they act on different objects", "Because equal and opposite forces are always ignored", "Because one object never feels force", "Because acceleration cancels force"], 0, "Only forces on the same object belong in one net-force sum.", hint),
    mc("Why is a one-object resultant-force question different from a third-law pair question?", ["Because one asks about the net force on one object, while the other compares interaction forces across two objects", "Because they always give the same calculation", "Because one has no forces", "Because mass is irrelevant in both"], 0, "Keep the force stories separate.", hint),
    mc("Why does a larger mass reduce acceleration for the same resultant force?", ["Because the same force is spread over more inertia", "Because larger mass removes the force", "Because acceleration becomes a vector only for small mass", "Because time changes the force unit"], 0, "Mass resists changes in motion.", hint),
    mc("Why is Newton's first law still relevant inside Newton's second-law problems?", ["Because zero resultant force is the special case that gives zero acceleration", "Because first law replaces second law entirely", "Because first law measures mass", "Because first law only applies to stationary objects"], 0, "First law is the zero-net-force case.", hint),
    mc("Why should direction still be tracked in force and acceleration questions?", ["Because force and acceleration are vectors", "Because acceleration has no direction", "Because only mass sets the answer", "Because direction matters only in momentum"], 0, "The sign or direction of acceleration follows the resultant force.", hint),
    mc("Why is F = ma not enough by itself to analyse two bodies pushing each other?", ["Because you must also identify which object's motion you are analysing", "Because F = ma never works in interactions", "Because mass disappears in interactions", "Because third-law forces act on one object only"], 0, "Choose one object at a time for its acceleration.", hint),
    mc("Why can a lighter object react more strongly to the same interaction pair?", ["Because equal force on smaller mass gives larger acceleration", "Because lighter objects create larger forces", "Because lighter objects ignore Newton's third law", "Because lighter objects have zero inertia"], 0, "The force pair stays equal; the acceleration changes.", hint),
    mc("Why is 'force causes motion' weaker than 'resultant force causes acceleration'?", ["Because motion can already exist without changing", "Because force only exists at rest", "Because acceleration is not related to force", "Because motion is a scalar"], 0, "Force changes motion rather than creating motion from nothing.", hint),
    mc("Which confusion most often damages this lesson?", ["mixing equal pair forces with one object's resultant force", "mixing mass with time", "mixing speed with distance only", "mixing moment with momentum"], 0, "This is the structural trap the lesson addresses.", hint),
    mc("Why is the unit check useful in F = ma work?", ["Because N / kg gives m/s^2, confirming the acceleration meaning", "Because units disappear in all force questions", "Because units prove third-law pairs cancel", "Because units determine mass without numbers"], 0, "Units are a good conceptual check.", hint),
    shortCases([
      { prompt: "Equal and opposite third-law forces act on ... objects.", acceptedAnswers: words("different"), hint },
      { prompt: "For one object, acceleration depends on resultant force and ...", acceptedAnswers: words("mass"), hint },
      { prompt: "If force stays the same and mass increases, acceleration ...", acceptedAnswers: words("decreases", "gets smaller"), hint },
      { prompt: "Do not cancel third-law forces in one object's analysis because they act on ... objects.", acceptedAnswers: words("different"), hint },
      { prompt: "Newton's first law is the zero-resultant-force case of zero ...", acceptedAnswers: words("acceleration"), hint },
      { prompt: "Force and acceleration point in the same ...", acceptedAnswers: words("direction"), hint },
      { prompt: "A lighter object under the same force has less ... to changing motion.", acceptedAnswers: words("inertia"), hint },
      { prompt: "The lesson separates pair-force equality from acceleration ...", acceptedAnswers: words("response", "outcome"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the system total visible and use signed momentum.";
  return [
    mc("What is the formula for momentum?", ["p = mv", "F = ma", "p = ma", "v = s/t"], 0, "Momentum is mass multiplied by velocity.", hint),
    mc("A 4 kg object moves at 5 m/s east. What is its momentum?", ["9 kg m/s", "20 kg m/s east", "20 N", "1.25 kg m/s"], 1, "p = 4 x 5 = 20, with the direction of the velocity.", hint),
    mc("A 3 kg object moves at -6 m/s. What is its momentum?", ["-18 kg m/s", "18 kg m/s", "-9 kg m/s", "2 kg m/s"], 0, "Momentum keeps the sign of the velocity.", hint),
    mc("In a closed system, total momentum before an interaction is...", ["usually smaller than after", "equal to total momentum after", "zero in every case", "equal to the force"], 1, "This is conservation of momentum.", hint),
    mc("A 2 kg trolley moving at 4 m/s sticks to a 2 kg trolley at rest. What is the shared final velocity?", ["1 m/s", "2 m/s", "4 m/s", "8 m/s"], 1, "Initial momentum 8 kg m/s shared by 4 kg gives 2 m/s.", hint),
    mc("Which pair has the same momentum?", ["2 kg at 6 m/s and 3 kg at 4 m/s", "2 kg at 6 m/s and 2 kg at 4 m/s", "5 kg at 2 m/s and 1 kg at 10 m/s", "4 kg at 3 m/s and 4 kg at 4 m/s"], 0, "Both give 12 kg m/s.", hint),
    mc("What are the SI units of momentum?", ["N", "kg m/s", "m/s^2", "N m"], 1, "Momentum uses mass times velocity units.", hint),
    mc("A 5 kg object moves east at 3 m/s and a 1 kg object moves west at 3 m/s. Taking east as positive, what is the total momentum?", ["12 kg m/s", "18 kg m/s", "6 kg m/s", "-12 kg m/s"], 0, "15 + (-3) = 12.", hint),
    mc("If the total momentum of two trolleys before sticking is zero, the final shared velocity is...", ["zero", "equal to the larger initial speed", "always positive", "always negative"], 0, "Zero total momentum shared after sticking gives zero final velocity.", hint),
    mc("Why is momentum usually preferred over force during a very short collision?", ["Because the system total momentum is conserved in a closed system", "Because force becomes undefined", "Because mass disappears", "Because velocity cannot be measured"], 0, "Momentum gives the conserved quantity for the event.", hint),
    mc("A 6 kg object at rest is hit and moves off at 2 m/s east. What is its final momentum?", ["3 kg m/s east", "8 kg m/s east", "12 kg m/s east", "6 kg m/s east"], 2, "p = 6 x 2 = 12 kg m/s east.", hint),
    mc("Which statement is correct for a closed collision system?", ["Each object keeps its own momentum", "The total system momentum is conserved", "Total force is conserved", "Mass times acceleration is conserved"], 1, "The conserved quantity is the system total momentum.", hint),
    shortCases([
      { prompt: "Write the symbol equation for momentum.", acceptedAnswers: words("p = mv", "p=mv"), hint },
      { prompt: "A 7 kg object moves at 2 m/s north. Find its momentum magnitude.", acceptedAnswers: momentumAnswers(14), hint },
      { prompt: "If west is negative, what is the momentum of a 4 kg object moving west at 3 m/s?", acceptedAnswers: momentumAnswers(-12), hint },
      { prompt: "In a closed system, total ... is conserved during a collision.", acceptedAnswers: words("momentum"), hint },
      { prompt: "Two objects stick together after collision. To find the final speed, divide total momentum by total ...", acceptedAnswers: words("mass"), hint },
      { prompt: "Momentum depends on mass and ...", acceptedAnswers: words("velocity"), hint },
      { prompt: "A 2 kg trolley at 5 m/s has momentum ...", acceptedAnswers: momentumAnswers(10), hint },
      { prompt: "The SI units of momentum are kg ...", acceptedAnswers: words("m/s", "m s^-1"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Conserve the system total, not each object's own motion.";
  return [
    mc("Why must a system boundary be drawn in momentum problems?", ["Because conservation applies to the total momentum of the chosen closed system", "Because each object keeps its own momentum", "Because force and momentum are identical", "Because mass no longer matters"], 0, "The boundary tells you what belongs to the conserved total.", hint),
    mc("Why can one object lose momentum while total momentum is still conserved?", ["Because another object can gain that momentum within the same closed system", "Because momentum disappears in collisions", "Because only speed is conserved", "Because mass changes cancel everything"], 0, "The total is conserved, not the share on each object.", hint),
    mc("Why is signed momentum useful in one-dimensional collisions?", ["Because opposite directions must subtract when totals are combined", "Because direction does not matter in momentum", "Because signed momentum removes the need for mass", "Because all momentum is positive"], 0, "The sign keeps direction in the calculation.", hint),
    mc("Why is 'the bigger speed means the bigger momentum' unsafe?", ["Because mass also matters", "Because speed never affects momentum", "Because momentum is unitless", "Because only direction matters"], 0, "Momentum depends on both mass and velocity.", hint),
    mc("Why does sticking together after collision make the final momentum-sharing step simple?", ["Because the combined mass moves with one common final velocity", "Because all momentum becomes zero", "Because force becomes constant", "Because only one object remains real"], 0, "One final velocity is shared by the total mass.", hint),
    mc("Why does zero total momentum before collision force zero shared velocity after sticking?", ["Because the conserved total remains zero and is shared by the combined mass", "Because both masses vanish", "Because the collision cannot happen", "Because force cancels velocity"], 0, "0 divided by the total mass still gives 0.", hint),
    mc("Why should force language not replace momentum language in a closed collision calculation?", ["Because the conserved quantity is momentum, not force", "Because force is always zero in collisions", "Because force and momentum have the same units", "Because only momentum has direction"], 0, "Collision forces can be large, but momentum conservation does the calculation work.", hint),
    mc("Why can a heavy slow object match the momentum of a light fast object?", ["Because momentum is the product of mass and velocity", "Because heavy objects always move faster", "Because speed alone decides momentum", "Because momentum ignores direction"], 0, "Different mass-speed mixes can produce the same product.", hint),
    mc("Why is final velocity found after the total initial momentum is combined, not before?", ["Because the final common velocity belongs to the whole post-collision mass", "Because final velocity always equals the larger initial speed", "Because one object decides the final answer", "Because time determines momentum more directly than mass"], 0, "Combine the system first, then share it.", hint),
    mc("Why is a closed-system assumption important?", ["Because outside forces would change the total momentum", "Because outside forces change the masses", "Because closed systems must have zero velocity", "Because only open systems conserve momentum"], 0, "Conservation needs negligible external resultant force.", hint),
    mc("Which misunderstanding does this lesson most need to prevent?", ["treating momentum conservation as if each object keeps its own speed", "treating momentum as mass only", "treating collisions as unitless", "treating velocity as always positive"], 0, "The total is conserved, not each object's original motion.", hint),
    mc("Why is p = mv stronger than a label-only phrase like 'quantity of motion'?", ["Because it shows exactly which variables control momentum", "Because labels alone are enough for calculations", "Because momentum never uses numbers", "Because the equation removes direction"], 0, "The equation ties the meaning to measurable quantities.", hint),
    shortCases([
      { prompt: "Momentum conservation belongs to the total ...", acceptedAnswers: words("system", "closed system"), hint },
      { prompt: "Signed momentum is useful because direction can make momentum values ...", acceptedAnswers: words("add or subtract", "subtract", "oppose"), hint },
      { prompt: "A heavy slow object can match a light fast object if the mass-velocity ... is the same.", acceptedAnswers: words("product"), hint },
      { prompt: "After two bodies stick, one common final ... is shared by the combined mass.", acceptedAnswers: words("velocity", "speed"), hint },
      { prompt: "Zero total momentum before sticking gives zero final shared ...", acceptedAnswers: words("velocity", "speed"), hint },
      { prompt: "In collision calculations, conserve total ... rather than each body's own speed.", acceptedAnswers: words("momentum"), hint },
      { prompt: "Momentum keeps the sign of the ...", acceptedAnswers: words("velocity"), hint },
      { prompt: "Outside forces would change the total momentum, so the system must be effectively ...", acceptedAnswers: words("closed", "isolated"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Moment depends on force and perpendicular distance from the pivot.";
  return [
    mc("What is the formula for the moment of a force about a pivot?", ["moment = force x perpendicular distance", "moment = mass x velocity", "moment = force / distance", "moment = force x time"], 0, "Use force multiplied by perpendicular distance.", hint),
    mc("A 10 N force acts perpendicular to a lever 0.30 m from the pivot. What moment is produced?", ["3.0 N m", "3.3 N m", "30 N m", "0.3 N m"], 0, "10 x 0.30 = 3.0.", hint),
    mc("Which distance should be used in a moment calculation?", ["the perpendicular distance from pivot to line of action", "the total length of the object", "the horizontal distance only", "the distance moved"], 0, "Perpendicular distance is the moment arm.", hint),
    mc("What moment is produced if the line of action passes through the pivot?", ["zero", "equal to the force", "infinite", "not enough information"], 0, "Perpendicular distance is zero.", hint),
    mc("What are the units of moment?", ["N", "N m", "kg m/s", "m/s^2"], 1, "Moment is measured in newton metres.", hint),
    mc("Two forces act perpendicular to the same door. Which gives the greater moment?", ["8 N at 0.6 m", "10 N at 0.4 m", "they are equal", "not enough information"], 0, "4.8 N m is greater than 4.0 N m.", hint),
    mc("A 5 N force at 0.8 m gives what moment?", ["4 N m", "13 N m", "0.16 N m", "40 N m"], 0, "5 x 0.8 = 4.", hint),
    mc("If the perpendicular distance doubles and force stays the same, the moment...", ["doubles", "halves", "stays the same", "becomes zero"], 0, "Moment is proportional to perpendicular distance.", hint),
    mc("What is the clockwise moment of a 12 N force at 0.25 m from the pivot?", ["2 N m", "3 N m", "4 N m", "48 N m"], 1, "12 x 0.25 = 3.", hint),
    mc("A beam is in rotational equilibrium. Which statement must be true?", ["sum of clockwise moments equals sum of anticlockwise moments", "clockwise moments must be zero", "forces on one side must be larger", "the beam must be moving"], 0, "Balanced turning effects are required.", hint),
    mc("Which pair gives the same moment?", ["4 N at 0.5 m and 2 N at 1.0 m", "4 N at 0.5 m and 4 N at 1.0 m", "6 N at 0.2 m and 2 N at 0.2 m", "8 N at 0.25 m and 8 N at 1.0 m"], 0, "Both give 2 N m.", hint),
    mc("A larger force can still give a smaller moment if it acts...", ["closer to the pivot", "farther from the pivot", "perpendicular to the object", "with a greater mass"], 0, "Moment depends on both factors.", hint),
    shortCases([
      { prompt: "State the SI units of moment.", acceptedAnswers: words("N m", "Nm", "newton metre", "newton metres"), hint },
      { prompt: "A 15 N force acts 0.20 m from a pivot at right angles. Find the moment.", acceptedAnswers: torqueAnswers(3), hint },
      { prompt: "The useful distance in a moment question is the ... distance from the pivot to the line of action.", acceptedAnswers: words("perpendicular"), hint },
      { prompt: "If a force acts through the pivot, the moment is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "For equilibrium, clockwise moments equal ... moments.", acceptedAnswers: words("anticlockwise", "counterclockwise"), hint },
      { prompt: "A moment calculation needs force and ... distance.", acceptedAnswers: words("perpendicular"), hint },
      { prompt: "A 20 N force at 0.4 m gives a moment of ...", acceptedAnswers: torqueAnswers(8), hint },
      { prompt: "Door handles are placed far from the hinge to increase the ...", acceptedAnswers: words("moment", "turning effect", "torque"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Torque is not just force; where the force acts matters too.";
  return [
    mc("Why is 'bigger force means bigger turning effect' unsafe?", ["Because the perpendicular distance from the pivot also matters", "Because force never affects turning", "Because moments are unitless", "Because only mass matters"], 0, "Moment is force x perpendicular distance.", hint),
    mc("Why does a force through the pivot produce no moment?", ["Because the perpendicular distance is zero", "Because the force is zero", "Because pivots remove all forces", "Because the object must be stationary"], 0, "No moment arm means no turning effect.", hint),
    mc("Why is the line of action important in moment problems?", ["Because the moment uses the shortest perpendicular distance to that line", "Because it gives the object's mass", "Because it sets the unit of force", "Because it replaces the pivot"], 0, "The line of action determines the moment arm.", hint),
    mc("Why can two different force-distance pairs produce the same moment?", ["Because the product force x perpendicular distance can be equal", "Because moments ignore force", "Because distances always dominate", "Because all moments on a rigid object are equal"], 0, "Different pairs can share the same product.", hint),
    mc("Why must clockwise and anticlockwise moments be compared in equilibrium questions?", ["Because balanced turning effects are needed for no rotational acceleration", "Because forces always cancel regardless of turning", "Because moments only matter when the object moves", "Because equilibrium ignores pivot choice"], 0, "Equilibrium needs no net turning effect.", hint),
    mc("Why is 'distance from pivot' weaker than 'perpendicular distance from pivot to line of action'?", ["Because only the perpendicular distance enters the moment formula", "Because all distances give the same moment", "Because moment never uses geometry", "Because the pivot location is irrelevant"], 0, "Use the shortest distance to the line of action.", hint),
    mc("Why are door handles placed far from hinges?", ["Because the same push then gives a larger moment", "Because the force becomes larger automatically", "Because hinges cancel torque", "Because mass becomes smaller"], 0, "Greater perpendicular distance means greater turning effect.", hint),
    mc("Why is a moment a turning effect rather than just a force label?", ["Because it combines both force size and where the force acts", "Because it removes direction", "Because it only applies to moving objects", "Because it is always clockwise"], 0, "Moment describes rotational influence.", hint),
    mc("Why should moment units be checked after a calculation?", ["Because force multiplied by distance should produce N m", "Because moments are pure numbers", "Because N m is the unit of momentum", "Because unit checks replace geometry"], 0, "Units help protect the meaning.", hint),
    mc("Why can a smaller force farther out be more effective than a bigger force near the pivot?", ["Because the moment depends on the product of force and perpendicular distance", "Because smaller forces always rotate more", "Because the pivot weakens larger forces", "Because distance changes the unit of force"], 0, "Location can outweigh force size.", hint),
    mc("What misconception is the lesson most directly correcting?", ["treating turning effect as force size only", "treating pivots as masses", "treating all distances as equal", "treating doors as momentum systems"], 0, "The lesson wants force and reach kept together.", hint),
    mc("Why is the moment equation useful beyond levers?", ["Because any turning situation depends on force and perpendicular reach about a pivot", "Because it applies only to doors", "Because it replaces all force analysis", "Because it works only when the object spins fast"], 0, "The principle is general.", hint),
    shortCases([
      { prompt: "Moment is force multiplied by perpendicular ...", acceptedAnswers: words("distance"), hint },
      { prompt: "A force through the pivot gives zero ...", acceptedAnswers: words("moment", "torque", "turning effect"), hint },
      { prompt: "Equilibrium needs clockwise moments to equal ... moments.", acceptedAnswers: words("anticlockwise", "counterclockwise"), hint },
      { prompt: "The shortest distance from pivot to line of action is the ... distance.", acceptedAnswers: words("perpendicular"), hint },
      { prompt: "Door handles work better far from the hinge because the moment arm is ...", acceptedAnswers: words("larger", "greater"), hint },
      { prompt: "Moment describes the ... effect of a force.", acceptedAnswers: words("turning"), hint },
      { prompt: "Different force-distance pairs can match if their ... is the same.", acceptedAnswers: words("product"), hint },
      { prompt: "The lesson avoids judging turning effect from force ... alone.", acceptedAnswers: words("size", "magnitude"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Check where the weight line falls relative to the base of support.";
  return [
    mc("Which change usually makes an object more stable?", ["wider base", "higher centre of mass", "narrower base", "smaller mass only"], 0, "A wider base improves stability.", hint),
    mc("Which change usually makes an object less stable?", ["lower centre of mass", "wider base", "higher centre of mass", "greater symmetry"], 2, "A higher centre of mass usually makes toppling easier.", hint),
    mc("What is the centre of mass?", ["the point where the mass can be treated as concentrated", "the heaviest corner", "the point where velocity is zero", "the base edge"], 0, "This is the standard definition.", hint),
    mc("An object begins to topple when...", ["its weight line falls outside the base", "its mass becomes zero", "its base becomes wider", "its force becomes horizontal"], 0, "Toppling begins once the line of action of weight leaves the base.", hint),
    mc("Why can a wider base improve stability?", ["It gives a larger margin before the weight line reaches the edge", "It lowers the mass automatically", "It reduces the weight to zero", "It removes the centre of mass"], 0, "The support region becomes more forgiving.", hint),
    mc("A load is moved to the right on a trolley. What happens to the centre of mass?", ["it shifts right", "it shifts left", "it stays fixed", "it vanishes"], 0, "The centre of mass moves toward the moved mass.", hint),
    mc("Which object is usually more stable?", ["a low wide crate", "a tall narrow crate", "both equally", "the heavier one regardless of shape"], 0, "Low centre of mass and wide base help.", hint),
    mc("What is the base of support?", ["the area under the object that provides support", "the total mass of the object", "the point where force acts", "the object's speed"], 0, "This is the support region.", hint),
    mc("Why is 'heavier means more stable' unreliable?", ["Because stability also depends on centre of mass and base width", "Because heavy objects ignore gravity", "Because mass never matters", "Because stability depends only on colour"], 0, "Geometry matters as well as weight.", hint),
    mc("A tall load and a low load sit on identical bases. Which is easier to tip?", ["the tall load", "the low load", "both equally", "the heavier one only"], 0, "The higher centre of mass reduces stability.", hint),
    mc("Which line is checked in a tipping question?", ["the line of action of the weight", "the velocity line", "the acceleration line", "the diagonal of the base"], 0, "It is the weight line through the centre of mass.", hint),
    mc("If the weight line stays inside the base, the object is...", ["stable against toppling", "already tipped", "massless", "accelerating upward"], 0, "The support condition is still satisfied.", hint),
    shortCases([
      { prompt: "A wider ... of support usually makes toppling less likely.", acceptedAnswers: words("base", "base of support"), hint },
      { prompt: "A lower centre of ... usually improves stability.", acceptedAnswers: words("mass"), hint },
      { prompt: "Tipping begins when the weight line moves ... the base of support.", acceptedAnswers: words("outside", "beyond"), hint },
      { prompt: "Moving a load to the left shifts the centre of mass to the ...", acceptedAnswers: words("left"), hint },
      { prompt: "The area under an object that provides support is called the base of ...", acceptedAnswers: words("support"), hint },
      { prompt: "A high centre of mass generally makes an object more or less stable?", acceptedAnswers: words("less", "less stable"), hint },
      { prompt: "Stability depends on mass distribution and support ...", acceptedAnswers: words("geometry", "shape", "base width"), hint },
      { prompt: "The line checked in tipping questions is the line of action of the ...", acceptedAnswers: words("weight"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Stability is a geometry question as well as a mass question.";
  return [
    mc("Why does a lower centre of mass usually improve stability?", ["Because a larger tilt is needed before the weight line reaches the edge", "Because the object's mass becomes smaller", "Because the base widens automatically", "Because gravity becomes weaker"], 0, "The weight line stays inside the base for a larger range of tilt.", hint),
    mc("Why is base width important in toppling problems?", ["Because it sets how much sideways movement of the weight line can be tolerated", "Because it changes the mass", "Because it removes the centre of mass", "Because it changes the unit of weight"], 0, "A wider base gives more margin.", hint),
    mc("Why is 'heavy objects are always stable' a misconception?", ["Because even heavy objects can topple if the weight line leaves the base", "Because heavy objects have no centre of mass", "Because stability ignores gravity", "Because only light objects tip"], 0, "Weight alone does not guarantee the line stays inside the base.", hint),
    mc("Why does moving cargo sideways change stability?", ["Because it shifts the centre of mass and therefore the weight line", "Because it changes the units of mass", "Because it removes the base", "Because it makes the object weightless"], 0, "Mass distribution controls the centre of mass position.", hint),
    mc("Why does raising the same load make toppling easier?", ["Because the object needs a smaller tilt before the weight line leaves the base", "Because the base becomes narrower automatically", "Because the total mass doubles", "Because the weight line disappears"], 0, "Higher centre of mass reduces stability margin.", hint),
    mc("Why should the line of action of weight be checked before visible motion occurs?", ["Because instability begins once that line leaves the base, even before the full tip develops", "Because tipping only matters after the object falls", "Because weight lines appear only after motion", "Because visible motion sets the centre of mass"], 0, "The geometry predicts the tipping threshold.", hint),
    mc("Why can widening the base improve stability without changing the object's mass?", ["Because it changes the support geometry directly", "Because it lowers the centre of mass automatically", "Because it removes the weight", "Because it changes the object's inertia"], 0, "Base width is itself a stability control.", hint),
    mc("Why is the centre of mass a better guide than looking only at the shape outline?", ["Because stability depends on where the mass is distributed, not just on the outside appearance", "Because outlines determine mass exactly", "Because centre of mass ignores geometry", "Because shape never affects stability"], 0, "Mass distribution matters.", hint),
    mc("Why can a wider base and a lower centre of mass both help?", ["Because both increase the margin before the weight line reaches the edge", "Because both increase the object's force", "Because both reduce mass", "Because both make the object stationary"], 0, "They protect the same tipping condition in different ways.", hint),
    mc("What is the most important physical condition for remaining upright?", ["the line of action of weight must stay within the base", "the object must be heavy", "the object must have zero force", "the object must be symmetrical"], 0, "This is the central stability rule.", hint),
    mc("Why is stability often discussed with disturbances or pushes?", ["Because stability is about resistance to toppling when conditions are perturbed", "Because stable objects can never move", "Because only moving objects have weight lines", "Because mass is irrelevant without a push"], 0, "A stable object resists being tipped.", hint),
    mc("Which misunderstanding most weakens stability reasoning?", ["judging by mass alone and ignoring base width and centre of mass", "judging by centre of mass only and ignoring mass", "ignoring the existence of the base", "using units"], 0, "The lesson wants geometry and mass distribution kept visible together.", hint),
    shortCases([
      { prompt: "A lower centre of mass gives a larger tipping ...", acceptedAnswers: words("margin", "safety margin"), hint },
      { prompt: "A wider base means the weight line can move farther before reaching the ...", acceptedAnswers: words("edge"), hint },
      { prompt: "Stability is reduced if the line of action of weight falls ... the base.", acceptedAnswers: words("outside", "beyond"), hint },
      { prompt: "Moving mass sideways changes the centre of ...", acceptedAnswers: words("mass"), hint },
      { prompt: "Base width and centre of mass both affect tipping ...", acceptedAnswers: words("risk", "stability"), hint },
      { prompt: "An object can be heavy and still ... if the geometry is poor.", acceptedAnswers: words("topple", "tip"), hint },
      { prompt: "The key condition for stability is that the weight line stays ... the base.", acceptedAnswers: words("inside", "within"), hint },
      { prompt: "The lesson treats stability as a geometry-and-mass-distribution ...", acceptedAnswers: words("question", "problem"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Resolve onto axes, combine one axis at a time, then rebuild the resultant.";
  return [
    mc("What is a vector component?", ["part of a vector along a chosen axis", "a separate extra force", "the mass of the vector", "the unit of the vector"], 0, "Components describe one vector along chosen axes.", hint),
    mc("A force has components 6 N east and 8 N north. What is the resultant magnitude?", ["10 N", "14 N", "2 N", "48 N"], 0, "Use Pythagoras: sqrt(6^2 + 8^2) = 10.", hint),
    mc("Two horizontal forces are 9 N east and 4 N west. What net horizontal component remains?", ["5 N east", "5 N west", "13 N east", "13 N west"], 0, "Same-axis forces add algebraically.", hint),
    mc("Vertical components are 7 N up and 10 N down. What net vertical component remains?", ["3 N up", "3 N down", "17 N down", "17 N up"], 1, "Subtract opposite directions and keep the larger direction.", hint),
    mc("A force has components 12 N east and 5 N north. What is the resultant magnitude?", ["13 N", "17 N", "7 N", "60 N"], 0, "This is a 5-12-13 triangle.", hint),
    mc("Why cannot 8 N east and 15 N north be added as 23 N directly?", ["Because they are perpendicular components, not same-axis forces", "Because forces never add", "Because north is not a direction", "Because 23 N is too large a unit"], 0, "Perpendicular vectors rebuild a diagonal geometrically.", hint),
    mc("From which axis is the direction angle measured in this lesson?", ["from the +x axis", "from the +y axis", "from the nearest axis", "from the vertical only"], 0, "That is the stated convention.", hint),
    mc("In a first-quadrant vector problem, which ratio is used for the direction angle?", ["x/y", "y/x", "force/mass", "distance/time"], 1, "Use tan(theta) = y / x.", hint),
    mc("If net x = 4 N east and net y = 3 N north, what is the resultant magnitude?", ["5 N", "7 N", "1 N", "12 N"], 0, "Use Pythagoras.", hint),
    mc("If both net x and net y are positive, in which quadrant does the resultant lie?", ["first quadrant", "second quadrant", "third quadrant", "fourth quadrant"], 0, "Positive x and positive y place the vector in quadrant I.", hint),
    mc("What stays physically the same after resolving one force into components?", ["the original overall vector", "the number of forces acting", "the object's mass", "the reference axes"], 0, "Resolution is a redescription, not a new force set.", hint),
    mc("Which step should come immediately before finding the direction angle?", ["find the net x and net y components", "add all magnitudes directly", "measure from the y-axis", "remove the vector units"], 0, "Direction comes after axis totals are known.", hint),
    shortCases([
      { prompt: "A force has components 8 N east and 15 N north. Find the resultant magnitude.", acceptedAnswers: forceAnswers(17), hint },
      { prompt: "Net x is 7 N east and net y is 24 N north. Find the resultant magnitude.", acceptedAnswers: forceAnswers(25), hint },
      { prompt: "The direction angle in this lesson is measured from the +... axis.", acceptedAnswers: words("x"), hint },
      { prompt: "In first-quadrant cases, use tan(theta) = y divided by ...", acceptedAnswers: words("x"), hint },
      { prompt: "Components are parts of one vector along chosen ...", acceptedAnswers: words("axes", "axis"), hint },
      { prompt: "Two same-axis forces combine ... rather than geometrically.", acceptedAnswers: words("algebraically"), hint },
      { prompt: "A force with 5 N east and 12 N north components has resultant ...", acceptedAnswers: forceAnswers(13), hint },
      { prompt: "Before rebuilding the resultant, combine the net horizontal and net ... components.", acceptedAnswers: words("vertical"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Components are bookkeeping for one vector, not extra forces.";
  return [
    mc("Why are components not extra forces added to the situation?", ["Because they are just one vector rewritten on chosen axes", "Because vectors can never be split", "Because components remove direction", "Because only horizontal forces are real"], 0, "Resolution does not change the physical force.", hint),
    mc("Why is axis-by-axis combination safer than guessing the final diagonal directly?", ["Because it keeps directions and signs organized before reconstruction", "Because geometry stops working for vectors", "Because diagonal forces cannot be measured", "Because the final vector is always horizontal"], 0, "Component bookkeeping reduces confusion.", hint),
    mc("Why do same-axis components add algebraically but perpendicular ones do not?", ["Because perpendicular directions must be rebuilt geometrically into a diagonal", "Because perpendicular forces never combine", "Because same-axis forces have no magnitude", "Because only horizontal axes are valid"], 0, "Different directions require vector geometry.", hint),
    mc("Why must the quadrant be checked after using tan(theta) = y/x?", ["Because the ratio gives the size of the angle but the signs of x and y locate the direction", "Because tan only works in the first quadrant", "Because the quadrant changes the magnitude", "Because angle never depends on signs"], 0, "Signs control the placement.", hint),
    mc("Why is 'just add the component numbers' a weak rule?", ["Because it fails for perpendicular vectors", "Because vectors never add", "Because numbers cannot represent forces", "Because only angles matter"], 0, "It works only when directions are the same axis.", hint),
    mc("Why is the +x-axis convention useful?", ["Because it gives one consistent reference for direction angles", "Because it makes all vectors horizontal", "Because it removes the need for components", "Because it changes the magnitude"], 0, "A fixed reference avoids angle confusion.", hint),
    mc("Why does resolving a vector help in multi-force problems?", ["Because each axis can be combined separately before the final vector is rebuilt", "Because it removes the need for the resultant", "Because it turns forces into scalars permanently", "Because it makes the signs irrelevant"], 0, "This is the key practical advantage.", hint),
    mc("Why is the resultant rebuilt only after net x and net y are known?", ["Because the final vector must come from the combined perpendicular totals", "Because the original vector disappears first", "Because magnitude can be guessed before the components", "Because the angle fixes the components"], 0, "Build from the finished component totals.", hint),
    mc("Why is the city-grid analogy useful for components?", ["Because a diagonal move can be described as horizontal and vertical parts without changing the overall displacement", "Because city-grid moves remove vectors", "Because diagonal paths are impossible in cities", "Because only north and east directions matter"], 0, "It shows redescription without physics change.", hint),
    mc("Why should component units stay attached during the calculation?", ["Because each component is still a force and must retain force units", "Because units cancel when resolving", "Because only the angle carries units", "Because units are needed only at the end"], 0, "Components are still physical forces.", hint),
    mc("Which misunderstanding is this lesson mainly correcting?", ["treating components as extra forces or adding perpendicular parts like same-axis numbers", "treating vectors as masses", "treating angles as forces", "treating x and y as speeds"], 0, "That is the main resolution trap.", hint),
    mc("Why can a vector with positive x and positive y still need a direction angle statement?", ["Because magnitude alone does not tell the exact direction within the quadrant", "Because positive components remove the need for an angle", "Because angle changes the components after the fact", "Because only negative vectors need direction"], 0, "Direction needs both quadrant and angle size.", hint),
    shortCases([
      { prompt: "Components rewrite one vector on chosen ...", acceptedAnswers: words("axes", "axis"), hint },
      { prompt: "Perpendicular components rebuild the resultant ...", acceptedAnswers: words("geometrically", "with geometry"), hint },
      { prompt: "Same-axis vectors combine ...", acceptedAnswers: words("algebraically"), hint },
      { prompt: "After using tan(theta) = y/x, use the signs to choose the correct ...", acceptedAnswers: words("quadrant"), hint },
      { prompt: "Direction in this lesson is measured from the ... axis.", acceptedAnswers: words("+x", "x", "positive x"), hint },
      { prompt: "Components keep the same original ... represented by the vector.", acceptedAnswers: words("force", "vector"), hint },
      { prompt: "Magnitude alone does not fix direction, so you still need the ...", acceptedAnswers: words("angle"), hint },
      { prompt: "The main trap is adding perpendicular components like ordinary same-axis ...", acceptedAnswers: words("numbers", "vectors"), hint },
    ]),
  ];
}

const M2_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M2_L1: l1DiagnosticRaw,
  M2_L2: l2DiagnosticRaw,
  M2_L3: l3DiagnosticRaw,
  M2_L4: l4DiagnosticRaw,
  M2_L5: l5DiagnosticRaw,
  M2_L6: l6DiagnosticRaw,
};

const M2_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M2_L1: l1ConceptRaw,
  M2_L2: l2ConceptRaw,
  M2_L3: l3ConceptRaw,
  M2_L4: l4ConceptRaw,
  M2_L5: l5ConceptRaw,
  M2_L6: l6ConceptRaw,
};

const M2_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(M2_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...M2_DIAGNOSTIC_BUILDERS[code](), ...M2_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function m2GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M2_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function m2GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M2_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function m2GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M2_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
