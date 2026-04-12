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
  acceptedAnswers: string[];
  hint: string;
  prompt: string;
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
  return { answerIndex, choices, explanation, hint, kind: "mc", prompt };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint, kind: "short", prompt };
}

function shortCases(cases: Array<{ acceptedAnswers: string[]; hint: string; prompt: string }>): RawItem[] {
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
    answer_index: answerIndex,
    choices,
    feedback: choices.map((_, index) => (index === answerIndex ? explanation : hint)),
    hint,
    id,
    prompt,
  };
}

function shortItem(id: string, prompt: string, acceptedAnswers: string[], hint: string): UnknownRecord {
  return {
    accepted_answers: acceptedAnswers,
    choices: [],
    feedback: [hint],
    hint,
    id,
    prompt,
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
    throw new Error(`M3 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function energyAnswers(value: number, digits = 3): string[] {
  return mergeAnswers(numericAnswers(value, "J", digits), words(`${formatNumber(value, digits)} joules`));
}

function powerAnswers(value: number, digits = 3): string[] {
  return mergeAnswers(numericAnswers(value, "W", digits), words(`${formatNumber(value, digits)} watts`));
}

function percentAnswers(value: number, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain}%`, `${plain} %`]));
}

function heightAnswers(value: number, digits = 3): string[] {
  return numericAnswers(value, "m", digits);
}

function massAnswers(value: number, digits = 3): string[] {
  return numericAnswers(value, "kg", digits);
}

function speedAnswers(value: number, digits = 3): string[] {
  return numericAnswers(value, "m/s", digits);
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Balance input, useful gain, and leak before you describe the stores.";
  return [
    mc("Which sentence best matches the Lift-Launch ledger model?", ["Energy sits in stores, moves by hand-offs, and stays accounted for", "Energy is just another name for force", "Energy exists only while the pod is moving", "Energy disappears when the machine stops"], 0, "This module treats energy as stored, transferred, and accounted for.", hint),
    mc("A machine inputs 640 J and 140 J leaks away. How much useful gain remains?", ["500 J", "780 J", "140 J", "360 J"], 0, "Subtract the leak from the total input.", hint),
    mc("Which description names a store rather than a hand-off?", ["The pod currently has 180 J of Motion Store", "The launcher transfers 180 J into the pod", "The machine leaks 40 J away", "The gate removes 30 J from the mission"], 0, "A store is what the pod has, not how the energy moved.", hint),
    mc("A pod is high and moving. Which claim is strongest?", ["It can hold both Height Store and Motion Store at the same time", "It must choose only one store", "It cannot hold energy because it is already moving", "Any energy must already have leaked away"], 0, "Different stores can coexist in one mission state.", hint),
    mc("Which statement best describes the Leak Trail?", ["It is the energy spread that did not become useful gain", "It proves that energy vanished", "It is the same thing as the input hand-off", "It is another name for the pod's Motion Store"], 0, "Leak Trail tracks the non-useful part of the input.", hint),
    mc("An input of 900 J produces 300 J of Height Store and 250 J of Motion Store. How much energy leaked away?", ["350 J", "550 J", "650 J", "150 J"], 0, "Add the useful parts first, then compare with the input.", hint),
    mc("If the useful gain stays fixed while the input hand-off rises, what must happen to the Leak Trail?", ["It must increase", "It must decrease", "It must become zero", "It must become a store"], 0, "A larger input with the same useful gain leaves more leak.", hint),
    mc("Which relation best belongs to this lesson?", ["total input energy = useful output energy + wasted energy", "power = energy / time", "gravitational potential energy = mgh", "kinetic energy = 1/2 mv^2"], 0, "This is the basic ledger relation for the lesson.", hint),
    mc("Which quantity is not itself an energy store?", ["launcher hand-off", "Height Store", "Motion Store", "useful store gain"], 0, "A hand-off is a transfer event, not a stored amount.", hint),
    mc("A mission has zero leak. If the input is 420 J, what is the useful gain?", ["420 J", "0 J", "210 J", "840 J"], 0, "With zero leak, all of the input becomes useful gain.", hint),
    mc("Which statement is weakest physics?", ["The missing energy is gone forever", "The missing part is in the Leak Trail", "Useful gain can be smaller than input", "The ledger must still balance"], 0, "Energy must stay accounted for overall.", hint),
    mc("A machine sends 180 J into Height Store and 120 J into Motion Store from a 400 J input. Which judgment is correct?", ["The ledger balances with 100 J leak", "The ledger fails because two stores are impossible", "The useful gain must equal 400 J exactly", "The input must have been 300 J"], 0, "Add both useful stores and compare with the input.", hint),
    shortCases([
      { prompt: "A mission inputs 750 J and 210 J leaks away. How much useful gain remains?", acceptedAnswers: energyAnswers(540), hint },
      { prompt: "The bookkeeping name for the wasted spread in this module is the ...", acceptedAnswers: words("Leak Trail", "leak trail"), hint },
      { prompt: "Energy can be in Height Store and Motion Store at the same ...", acceptedAnswers: words("time", "moment", "mission state", "state"), hint },
      { prompt: "If useful gain plus leak equals the input, the ledger is ...", acceptedAnswers: words("balanced", "in balance"), hint },
      { prompt: "A launcher adding energy to the pod is a ...", acceptedAnswers: words("hand-off", "transfer", "energy transfer"), hint },
      { prompt: "A still raised pod can hold ... Store.", acceptedAnswers: words("Height", "height"), hint },
      { prompt: "A store tells what energy the pod currently ...", acceptedAnswers: words("has", "holds", "contains"), hint },
      { prompt: "If the input stays the same and the useful gain rises, the leak must ...", acceptedAnswers: words("shrink", "decrease", "fall", "drop"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep stores, hand-offs, and leaks as separate ideas.";
  return [
    mc("Why is a ledger sentence a good first move in M3_L1?", ["Because it keeps useful gain and leak accountable before any calculation", "Because it replaces all later equations forever", "Because it proves the pod must be moving", "Because it removes the need to name stores"], 0, "The sentence keeps the accounting structure visible.", hint),
    mc("Why is 'energy is a force' a weak statement here?", ["Because forces and energy-accounting answer different questions", "Because forces do not exist in mechanics", "Because only energy can change motion", "Because energy and force always have the same unit"], 0, "The lesson keeps energy language separate from force language.", hint),
    mc("Why can useful gain split across both Height Store and Motion Store?", ["Because one input hand-off can populate more than one store", "Because stores must always be identical", "Because leaks cannot happen once motion starts", "Because one store automatically turns into force"], 0, "A single useful gain can be distributed across different stores.", hint),
    mc("Why is the Leak Trail still part of the answer?", ["Because the non-useful part must still be accounted for", "Because leak energy counts as destroyed energy", "Because leaks replace the useful output", "Because the leak becomes a new force"], 0, "Wasted spread still belongs in the ledger.", hint),
    mc("Which explanation best repairs 'only moving objects have energy'?", ["A raised object can hold a position-based store even at rest", "Energy appears only after a force acts", "Rest means zero energy in every form", "A still object can only have Leak Trail"], 0, "Height Store is not a motion store.", hint),
    mc("Why can the same input energy produce different final store mixes?", ["Because the useful part can be divided differently across stores", "Because the ledger relation stops applying", "Because leak is always zero for split stores", "Because motion automatically deletes Height Store"], 0, "The accounting can stay balanced with different store distributions.", hint),
    mc("Which statement best fits conservation in this lesson?", ["Total energy stays accounted for even when part of it becomes less useful", "Only useful energy counts", "Leak energy is outside physics", "Energy can be destroyed if the machine is inefficient"], 0, "Conservation is about full accounting, not usefulness alone.", hint),
    mc("Why is 'the pod kept only 300 J so 200 J disappeared' wrong?", ["Because the remaining 200 J still has to appear in the Leak Trail or another store", "Because all machines are 100% efficient", "Because output can never be less than input", "Because 300 J is too small to be realistic"], 0, "The missing part must be placed somewhere in the ledger.", hint),
    mc("Why can a high fast pod carry two stores at once?", ["Because position and motion are different reasons for holding energy", "Because one store automatically cancels the other", "Because only fast pods can have Height Store", "Because only high pods can have Motion Store"], 0, "The stores answer different questions.", hint),
    mc("Why is the store-versus-hand-off distinction useful?", ["Because it separates what energy the pod has from how energy moved into or out of it", "Because it proves all stores are equal", "Because it removes the need for units", "Because it turns every problem into force balance"], 0, "The distinction organizes the story before arithmetic starts.", hint),
    mc("If the ledger does not balance, what is the right next move?", ["Find the missing store, leak, or arithmetic error", "Assume the extra energy vanished", "Ignore the leak and continue", "Switch immediately to power"], 0, "A non-balancing ledger means the accounting is incomplete.", hint),
    mc("Why should wasted spread still be named explicitly?", ["Because physics must say where the non-useful part went", "Because it always becomes Height Store later", "Because only useful output can be measured", "Because leak removes the need for conservation"], 0, "Naming the leak prevents disappearance language.", hint),
    shortCases([
      { prompt: "The ledger question is 'where did the rest ...?'", acceptedAnswers: words("go", "went"), hint },
      { prompt: "The Leak Trail tells you where the apparently missing energy ...", acceptedAnswers: words("went", "spread", "ended up"), hint },
      { prompt: "A store is energy the pod currently ...", acceptedAnswers: words("has", "holds", "contains"), hint },
      { prompt: "A hand-off is energy moving ...", acceptedAnswers: words("between systems", "into a store", "out of a store", "between places", "from one place to another"), hint },
      { prompt: "Balanced accounting means the total energy stays ...", acceptedAnswers: words("accounted for", "conserved", "tracked"), hint },
      { prompt: "A good first sentence in this lesson names stores, hand-offs, and ...", acceptedAnswers: words("leaks", "Leak Trail", "waste"), hint },
      { prompt: "A useful gain smaller than the input does not mean energy was ...", acceptedAnswers: words("destroyed", "lost", "gone"), hint },
      { prompt: "One mission state can include more than one energy ...", acceptedAnswers: words("store", "stores"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep mass, height, and gravitational field strength together in the mgh story.";
  return [
    mc("Which formal relation belongs to Height Store?", ["gravitational potential energy = mgh", "kinetic energy = 1/2 mv^2", "power = energy / time", "work done = force x distance"], 0, "This lesson is the mgh lesson.", hint),
    mc("A 4 kg pod is raised 5 m on a world with g = 10 N/kg. What Height Store is gained?", ["200 J", "50 J", "20 J", "400 J"], 0, "Use mgh directly.", hint),
    mc("If the same pod is lifted to the same height on a stronger-gravity world, the Height Store is...", ["larger", "smaller", "unchanged", "zero"], 0, "A stronger field increases mgh.", hint),
    mc("If height doubles while mass and g stay fixed, what happens to Height Store?", ["It doubles", "It quadruples", "It halves", "It stays the same"], 0, "Height enters linearly.", hint),
    mc("If mass doubles while height and g stay fixed, what happens to Height Store?", ["It doubles", "It quadruples", "It halves", "It stays the same"], 0, "Mass also enters linearly.", hint),
    mc("A pod gains 360 J of Height Store when its mass is 3 kg and its rise is 12 m. What g was used?", ["10 N/kg", "12 N/kg", "1 N/kg", "30 N/kg"], 0, "Rearrange mgh to solve for g.", hint),
    mc("Why can a still raised pod hold energy?", ["Because it is at a higher position in a gravitational field", "Because stillness creates kinetic energy", "Because power is always present", "Because height removes the need for gravity"], 0, "Height Store is position-based, not motion-based.", hint),
    mc("A pod moves from 2 m to 9 m above the reference level. Which height goes into the store-gain calculation?", ["7 m", "9 m", "2 m", "11 m"], 0, "Use the change in height.", hint),
    mc("When a pod is lowered, which store decreases?", ["Height Store", "Motion Store only", "Leak Trail only", "Power"], 0, "The position-based store decreases.", hint),
    mc("Two pods are lifted to the same height on the same world. Pod A has twice the mass of Pod B. Which is correct?", ["Pod A gains twice the Height Store", "Pod A gains four times the Height Store", "They gain the same store", "Pod A gains half the store"], 0, "At fixed g and h, store is proportional to mass.", hint),
    mc("A 600 J Height Store gain occurs on a world with g = 10 N/kg over a 15 m rise. What is the pod's mass?", ["4 kg", "6 kg", "10 kg", "9 kg"], 0, "Use m = E / gh.", hint),
    mc("Which change could increase Height Store without changing the pod's mass?", ["raising the deck level", "changing the pod color", "waiting longer", "switching off the stopwatch"], 0, "Height is one of the three direct factors.", hint),
    shortCases([
      { prompt: "Name the three factors that set Height Store.", acceptedAnswers: mergeAnswers(words("mass, height, and gravitational field strength", "mass, gravitational field strength, and height", "m, g, and h", "load, deck level, and world grip")), hint },
      { prompt: "A 2 kg pod is raised 8 m on a world with g = 10 N/kg. What Height Store is gained?", acceptedAnswers: energyAnswers(160), hint },
      { prompt: "A 5 kg pod gains 250 J of Height Store on a world with g = 10 N/kg. How high was it raised?", acceptedAnswers: heightAnswers(5), hint },
      { prompt: "If g doubles while mass and height stay fixed, the Height Store ...", acceptedAnswers: words("doubles", "double", "becomes twice as large"), hint },
      { prompt: "If the reference level changes, the calculation must use the height ...", acceptedAnswers: words("change", "difference", "rise"), hint },
      { prompt: "A raised pod can be still and yet still have gravitational ... energy.", acceptedAnswers: words("potential"), hint },
      { prompt: "Near Earth's surface, g is measured in ...", acceptedAnswers: words("N/kg", "newtons per kilogram"), hint },
      { prompt: "If mass halves while height and g stay fixed, the Height Store ...", acceptedAnswers: words("halves", "half", "is halved"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Height Store is a position-in-a-field story, not a height-only slogan.";
  return [
    mc("Why is a height-only explanation weak in this lesson?", ["Because Height Store also depends on mass and gravitational field strength", "Because height never matters", "Because only mass matters", "Because the field strength is always zero"], 0, "This lesson keeps all three factors visible.", hint),
    mc("Why does the reference level matter in Height Store problems?", ["Because the store change depends on the height difference relative to the chosen level", "Because the reference level changes the pod's mass", "Because the reference level changes the stopwatch", "Because the reference level removes gravity"], 0, "Store change uses the relevant rise or drop.", hint),
    mc("Which comparison best isolates the mass effect?", ["same height and same world, different masses", "same mass and same world, different heights", "same mass and same height, different colors", "different masses and different worlds at once"], 0, "Change one factor while the others stay fixed.", hint),
    mc("Why can two pods on the same shelf have different Height Store?", ["Because they can have different masses", "Because shelf height fixes the store completely", "Because stillness deletes energy", "Because the store ignores mass"], 0, "The same height does not force the same mgh if the masses differ.", hint),
    mc("Why can the same pod at the same shelf height have different Height Store on different worlds?", ["Because gravitational field strength is part of the relation", "Because height changes when the world changes", "Because the pod's mass vanishes", "Because mgh works only on Earth"], 0, "The field strength factor makes world-to-world differences real.", hint),
    mc("Which statement best repairs 'still means no energy'?", ["A pod can have a position-based store even at rest", "Stillness always means zero store", "Only moving objects can transfer energy later", "Rest turns GPE into power"], 0, "The pod can be still and raised.", hint),
    mc("Why should g stay visible in the reasoning?", ["Because it sets the store per kilogram per metre", "Because it is always equal to 1", "Because it cancels mass automatically", "Because it replaces the height term"], 0, "The field is not decorative background.", hint),
    mc("Which statement best describes the mgh structure?", ["Height Store is proportional to mass, g, and height", "Height Store depends only on height squared", "Height Store depends only on mass", "Height Store is independent of the field"], 0, "All three factors enter linearly.", hint),
    mc("Why does lowering an object reduce Height Store?", ["Because the object is at a lower position in the field", "Because lowering increases its mass", "Because the stopwatch runs backwards", "Because the object stops moving"], 0, "The position change reduces the store.", hint),
    mc("Which first move is strongest when a problem gives start and finish heights?", ["Find the height change before substituting", "Use the final height directly every time", "Ignore the starting height", "Jump to power"], 0, "The relevant rise or drop comes first.", hint),
    mc("Which statement is strongest about world comparison?", ["The same mass and height give more Height Store in the stronger field", "The same height always gives the same store", "A stronger field makes no difference to store", "World comparison matters only for speed"], 0, "The field-strength factor is explicit in the relation.", hint),
    mc("Why is the module's World Grip analogy useful?", ["Because it stops students from forgetting the g factor", "Because it removes the need for units", "Because it makes height irrelevant", "Because it turns potential energy into kinetic energy"], 0, "The analogy keeps the field active in the story.", hint),
    shortCases([
      { prompt: "The formal symbol often used for Height Store in this lesson is ...", acceptedAnswers: words("E_p", "gpe", "gravitational potential energy"), hint },
      { prompt: "Gravitational potential energy depends on position in a gravitational ...", acceptedAnswers: words("field"), hint },
      { prompt: "For store gain, use the height ... rather than a random final number.", acceptedAnswers: words("change", "difference", "rise"), hint },
      { prompt: "Mass, g, and h enter the Height Store relation ...", acceptedAnswers: words("linearly", "directly", "proportionally"), hint },
      { prompt: "World Grip is the lesson name for gravitational field ...", acceptedAnswers: words("strength"), hint },
      { prompt: "If the height change is zero, the GPE change is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "If only mass doubles, the Height Store ...", acceptedAnswers: words("doubles", "double"), hint },
      { prompt: "The unit of gravitational potential energy is ...", acceptedAnswers: words("J", "joule", "joules"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep both mass and speed visible, and remember that speed is squared.";
  return [
    mc("Which formal relation belongs to Motion Store?", ["kinetic energy = 1/2 mv^2", "gravitational potential energy = mgh", "power = energy / time", "work done = force x distance"], 0, "This is the speed-squared relation for motion energy.", hint),
    mc("A 3 kg pod moves at 4 m/s. How much Motion Store does it have?", ["24 J", "12 J", "48 J", "36 J"], 0, "Use 1/2 x 3 x 4^2.", hint),
    mc("If speed doubles while mass stays fixed, what happens to Motion Store?", ["It quadruples", "It doubles", "It halves", "It stays the same"], 0, "The speed term is squared.", hint),
    mc("If mass doubles while speed stays fixed, what happens to Motion Store?", ["It doubles", "It quadruples", "It halves", "It stays the same"], 0, "Mass enters linearly.", hint),
    mc("A 4 kg pod has 200 J of Motion Store. What is its speed?", ["10 m/s", "5 m/s", "20 m/s", "8 m/s"], 0, "Rearrange 1/2 mv^2 = 200.", hint),
    mc("Two pods have the same mass. Pod A moves twice as fast as Pod B. Which statement is correct?", ["Pod A has four times the Motion Store", "Pod A has twice the Motion Store", "Pod A has the same Motion Store", "Pod A has half the Motion Store"], 0, "Doubling speed multiplies KE by four.", hint),
    mc("Which change gives the larger Motion Store increase for the same pod?", ["tripling speed", "tripling mass", "halving mass", "keeping the same speed"], 0, "Tripling speed multiplies KE by nine, stronger than tripling mass.", hint),
    mc("Which quantity can still be large even when the object is low to the ground?", ["Motion Store", "Height Store only", "Power only", "Leak Trail only"], 0, "Motion Store depends on speed, not height.", hint),
    mc("A 2 kg pod at 12 m/s and an 8 kg pod at 6 m/s are compared. Which is correct?", ["They have the same Motion Store", "The 2 kg pod has more", "The 8 kg pod has four times more", "Both have zero because the speeds differ"], 0, "1/2 x 2 x 12^2 = 144 J and 1/2 x 8 x 6^2 = 144 J.", hint),
    mc("If speed falls to half while mass stays fixed, Motion Store becomes...", ["one quarter", "one half", "double", "unchanged"], 0, "Halving speed squares to one quarter.", hint),
    mc("A pod has 90 J of Motion Store and mass 5 kg. Which speed is correct?", ["6 m/s", "3 m/s", "9 m/s", "18 m/s"], 0, "Use v^2 = 180 / 5 = 36.", hint),
    mc("Which statement is weakest physics?", ["Faster means proportionally more Motion Store by the same factor every time", "Speed matters more strongly than mass in the KE relation", "Mass and speed both matter for Motion Store", "KE rises quickly as speed rises"], 0, "Speed does not act linearly in the KE relation.", hint),
    shortCases([
      { prompt: "A 6 kg pod moves at 5 m/s. What Motion Store does it have?", acceptedAnswers: energyAnswers(75), hint },
      { prompt: "A 1 kg pod moving at 12 m/s has ... J of Motion Store.", acceptedAnswers: energyAnswers(72), hint },
      { prompt: "If speed triples while mass stays fixed, Motion Store becomes ... times as large.", acceptedAnswers: words("9", "nine"), hint },
      { prompt: "If mass triples while speed stays fixed, Motion Store becomes ... times as large.", acceptedAnswers: words("3", "three"), hint },
      { prompt: "The factor that makes Motion Store rise sharply is speed being ...", acceptedAnswers: words("squared", "raised to the power of 2"), hint },
      { prompt: "A 4 kg pod with 72 J of Motion Store has speed ...", acceptedAnswers: speedAnswers(6), hint },
      { prompt: "A moving pod with zero speed has zero ... Store.", acceptedAnswers: words("Motion", "kinetic"), hint },
      { prompt: "The unit of Motion Store is ...", acceptedAnswers: words("J", "joule", "joules"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "The main trap is treating speed as a linear factor when it is squared.";
  return [
    mc("Why is 'twice the speed means twice the Motion Store' wrong?", ["Because the speed term is squared, so the store becomes four times larger", "Because speed never affects Motion Store", "Because only mass matters", "Because KE changes only with time"], 0, "Speed has a stronger-than-linear effect.", hint),
    mc("Why is same-mass comparison useful when studying Motion Store?", ["Because it isolates the effect of speed", "Because it removes the need for units", "Because same mass means same Motion Store", "Because mass cancels every energy change"], 0, "Holding one variable fixed clarifies the other one.", hint),
    mc("Why can a heavier pod moving more slowly still match a lighter faster pod?", ["Because mass and speed can combine to give the same 1/2 mv^2 value", "Because heavier objects ignore speed", "Because lighter objects cannot have Motion Store", "Because KE depends only on direction"], 0, "Different mass-speed combinations can produce the same KE.", hint),
    mc("Why is speed the more sensitive factor in the KE relation?", ["Because speed is squared while mass is not", "Because speed has different units", "Because mass cancels out of the equation", "Because speed is always bigger than mass"], 0, "That is the main structure of the formula.", hint),
    mc("Why is a motion-energy question not answered by mass alone?", ["Because a heavy pod at low speed can have less Motion Store than a light pod at high speed", "Because mass is never measured", "Because speed can be ignored in mechanics", "Because only the height matters"], 0, "Motion Store requires both variables.", hint),
    mc("Which statement best repairs 'a stopped pod still has Motion Store because it has mass'?", ["Motion Store needs speed as well as mass, so a stopped pod has zero KE", "Mass automatically guarantees KE", "Stopped objects have negative KE", "Stillness turns KE into power"], 0, "No speed means no kinetic energy.", hint),
    mc("Why is comparing 10 m/s with 20 m/s more dramatic than it first looks?", ["Because the Motion Store ratio is 1:4, not 1:2", "Because the masses must also double", "Because speed changes cannot affect energy", "Because 20 m/s always gives zero store"], 0, "Doubling speed quadruples KE.", hint),
    mc("Why is 'KE is just motion described with words' too weak?", ["Because the formula lets you compare how strongly different masses and speeds affect the store", "Because KE is not measurable", "Because only forces can describe motion", "Because energy and motion are unrelated"], 0, "The formula adds quantitative structure.", hint),
    mc("Why should units stay attached while comparing Motion Store?", ["Because KE is still an energy quantity measured in joules", "Because units cancel out of all motion problems", "Because only speed has units", "Because the unit changes with mass"], 0, "The store remains an energy value.", hint),
    mc("Why can two different journeys end with the same Motion Store?", ["Because different mass-speed pairs can lead to the same final KE value", "Because all moving objects share one KE", "Because travel time fixes KE automatically", "Because distance determines KE on its own"], 0, "Different combinations can produce equal totals.", hint),
    mc("Why is a speed-squared story better than a speed-only slogan?", ["Because it captures the real non-linear growth of Motion Store", "Because it is easier to memorize", "Because it ignores mass completely", "Because it removes the need for numbers"], 0, "The squared relation is the crucial physics.", hint),
    mc("Why should a learner solve for speed carefully after finding v^2?", ["Because the square root step is needed to return to speed", "Because v^2 is already the speed", "Because speed is always equal to KE", "Because mass becomes irrelevant at the end"], 0, "The algebra must return from squared speed to speed.", hint),
    shortCases([
      { prompt: "The reason speed matters so strongly is that v is ... in the KE relation.", acceptedAnswers: words("squared"), hint },
      { prompt: "At fixed mass, doubling speed makes Motion Store ... times as large.", acceptedAnswers: words("4", "four"), hint },
      { prompt: "At fixed speed, doubling mass makes Motion Store ...", acceptedAnswers: words("double", "doubles"), hint },
      { prompt: "A stopped pod has zero ... energy.", acceptedAnswers: words("kinetic", "motion"), hint },
      { prompt: "Comparing equal-mass pods isolates the effect of ...", acceptedAnswers: words("speed"), hint },
      { prompt: "Comparing equal-speed pods isolates the effect of ...", acceptedAnswers: words("mass"), hint },
      { prompt: "A heavier slower pod can match a lighter faster pod if the final 1/2 mv^2 values are the ...", acceptedAnswers: words("same", "equal"), hint },
      { prompt: "After solving for v^2, take the ... root to return to speed.", acceptedAnswers: words("square"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Work is an energy-transfer calculation, not a synonym for effort.";
  return [
    mc("Which formal relation belongs to the simple aligned-force work story?", ["work done = force x distance", "power = energy / time", "gravitational potential energy = mgh", "kinetic energy = 1/2 mv^2"], 0, "This is the standard work relation in the aligned case.", hint),
    mc("A 25 N force moves a box 4 m in the direction of the force. What work is done?", ["100 J", "29 J", "21 J", "6.25 J"], 0, "Multiply force by distance.", hint),
    mc("Which statement best matches work done in this module?", ["work done is energy transferred", "work done is just how tired something feels", "work done means motion only", "work done means power"], 0, "The lesson treats work as an energy hand-off.", hint),
    mc("A person pushes hard on a wall but the wall does not move. In the simple model, what work is done on the wall?", ["0 J", "large positive work", "equal to the applied force", "equal to the power"], 0, "No displacement means no work on the wall in this simple case.", hint),
    mc("A machine does 300 J of work on a pod and 60 J leaks away before the useful store is counted. How much useful gain remains?", ["240 J", "360 J", "60 J", "180 J"], 0, "Subtract the leak from the work input.", hint),
    mc("If the same force acts through twice the distance, the work done is...", ["twice as large", "four times as large", "half as large", "unchanged"], 0, "Distance enters linearly.", hint),
    mc("If the distance stays the same and the force doubles, the work done is...", ["twice as large", "four times as large", "half as large", "unchanged"], 0, "Force also enters linearly.", hint),
    mc("Which relation is often cleaner when the store change is already known?", ["work done = change in energy", "power = energy / time", "efficiency = useful / total", "kinetic energy = 1/2 mv^2"], 0, "If the store change is known, that may be the best route.", hint),
    mc("A lift increases a pod's Height Store by 450 J. Ignoring leaks, how much work was done on the pod?", ["450 J", "0 J", "225 J", "900 J"], 0, "Work done equals the energy transferred.", hint),
    mc("Which situation definitely includes work done on the load?", ["a crate is pulled 6 m across the floor by a steady force", "a crate is held still in one place", "a stopwatch is read", "the crate is described as heavy"], 0, "Force acting through distance is the key condition.", hint),
    mc("What is the unit of work done?", ["J", "N/kg", "m/s", "%"], 0, "Work is an energy quantity.", hint),
    mc("Which statement is weakest physics?", ["A big force automatically means a lot of work even if nothing moves", "Work depends on the force and the displacement", "Work can be tracked as an energy transfer", "The useful gain can be smaller than the work input if some energy leaks"], 0, "Force alone does not guarantee work.", hint),
    shortCases([
      { prompt: "A 12 N force moves a trolley 5 m in the force direction. What work is done?", acceptedAnswers: energyAnswers(60), hint },
      { prompt: "Work done is measured in ...", acceptedAnswers: words("J", "joule", "joules"), hint },
      { prompt: "If distance is zero, the simple-model work done is ...", acceptedAnswers: words("0", "zero", "0 J", "zero joules"), hint },
      { prompt: "Work done is another name for an energy ...", acceptedAnswers: words("transfer", "hand-off", "change"), hint },
      { prompt: "A 40 N force acting through 3 m does ... J of work.", acceptedAnswers: energyAnswers(120), hint },
      { prompt: "If force doubles and distance stays fixed, work done ...", acceptedAnswers: words("doubles", "double"), hint },
      { prompt: "If distance halves and force stays fixed, work done ...", acceptedAnswers: words("halves", "half", "is halved"), hint },
      { prompt: "When the store change is already known, work done can be found from the change in ...", acceptedAnswers: words("energy", "store energy"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "This lesson protects the force-through-distance condition and the work-as-transfer meaning.";
  return [
    mc("Why is 'work is just effort' a weak idea in physics?", ["Because physics defines work as energy transferred when a force acts through a distance", "Because effort and work always have the same unit", "Because work is the same as power", "Because work happens whenever time passes"], 0, "The definition is mechanistic, not emotional.", hint),
    mc("Why is pushing a wall not a good example of work done on the wall in the simple model?", ["Because there is no displacement of the wall", "Because no force exists", "Because walls have zero mass", "Because work needs speed"], 0, "Force alone is not enough in this model.", hint),
    mc("Why can work done equal a store change?", ["Because work is an energy transfer into or out of a store", "Because force and distance always cancel", "Because store change ignores force", "Because only height changes count as work"], 0, "This is the clean energy bridge in the lesson.", hint),
    mc("Why is a store-change route often stronger than forcing Fd into every problem?", ["Because some questions give the energy change directly", "Because force x distance is never correct", "Because distance is unmeasurable", "Because work stops being energy in those cases"], 0, "Choose the relation that matches the known quantities.", hint),
    mc("Why is big force by itself not enough to claim big work?", ["Because the displacement also matters", "Because force never matters", "Because only time matters", "Because large forces cancel work"], 0, "Work depends on both factors.", hint),
    mc("Why should leak still be tracked after a work input?", ["Because not all transferred energy must become useful store gain", "Because work done and leak are always equal", "Because leak replaces the store change completely", "Because leak means work was not done"], 0, "The input can split into useful and wasted parts.", hint),
    mc("Why is 'work done' a useful bridge topic in M3?", ["Because it links force stories to energy-ledger stories", "Because it replaces both force and energy permanently", "Because it removes the need for units", "Because it makes power unnecessary"], 0, "It connects mechanics and energy accounting.", hint),
    mc("Which statement best repairs 'distance moved proves work, even without force'?", ["Work in this lesson needs both force and displacement", "Distance alone is enough", "Force is only decorative", "Any moving object has the same work"], 0, "Both ingredients are required.", hint),
    mc("Why can the same work input lead to different useful gains in different machines?", ["Because different amounts can leak away before the final store is counted", "Because work is never conserved", "Because one joule means different things in different machines", "Because the force changes unit"], 0, "Efficiency matters after the work transfer.", hint),
    mc("Why is the unit of work the joule?", ["Because work is an energy transfer", "Because work is a force", "Because work is measured per second", "Because work is dimensionless"], 0, "The unit follows the energy meaning.", hint),
    mc("Why should the direction of the applied force matter in the simple Fd model?", ["Because the work relation here is for force acting along the displacement", "Because direction never matters in mechanics", "Because only vertical force can do work", "Because horizontal motion has zero energy"], 0, "The lesson is explicitly using the aligned case.", hint),
    mc("Why is work not the same thing as power?", ["Because work is total transferred energy, while power is the transfer rate", "Because power is always larger", "Because work has no unit", "Because work needs time but power does not"], 0, "This distinction prepares the next lesson.", hint),
    shortCases([
      { prompt: "In physics, work done is energy ...", acceptedAnswers: words("transferred", "transfer"), hint },
      { prompt: "The simple-model work relation uses force times ...", acceptedAnswers: words("distance"), hint },
      { prompt: "If nothing moves, the simple-model work done on the object is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "Work done links force stories to ... stories.", acceptedAnswers: words("energy", "energy ledger", "transfer"), hint },
      { prompt: "A known store change can sometimes replace force-times-...", acceptedAnswers: words("distance"), hint },
      { prompt: "Large force without displacement does not guarantee large ...", acceptedAnswers: words("work"), hint },
      { prompt: "After work is done on a machine, some of the input may still ... away.", acceptedAnswers: words("leak", "spread"), hint },
      { prompt: "Power is the ... of doing work, not the total work.", acceptedAnswers: words("rate"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep rate and usefulness separate: power is per time, efficiency is useful over total.";
  return [
    mc("Which formal relation belongs to power?", ["power = energy transferred / time", "work done = force x distance", "kinetic energy = 1/2 mv^2", "gravitational potential energy = mgh"], 0, "This is the transfer-rate relation.", hint),
    mc("A machine transfers 600 J in 3 s. What is its power?", ["200 W", "1800 W", "603 W", "20 W"], 0, "Divide energy by time.", hint),
    mc("Which statement best describes efficiency?", ["useful output divided by total input", "energy transferred divided by time", "force divided by area", "work divided by distance"], 0, "Efficiency is the usefulness fraction.", hint),
    mc("A device takes in 500 J and gives 350 J of useful output. What is its efficiency?", ["70%", "35%", "150%", "65%"], 0, "350 divided by 500 gives 0.70.", hint),
    mc("Two motors transfer the same energy, but Motor A does it in half the time of Motor B. Which is correct?", ["Motor A has twice the power", "Motor A has half the power", "They have the same power", "Power cannot be compared"], 0, "Same energy in less time means greater power.", hint),
    mc("Which machine is more efficient?", ["the one with the larger useful fraction of its input", "the one that takes longer", "the one with the largest input energy", "the one with the bigger mass"], 0, "Efficiency compares useful with total supplied.", hint),
    mc("A machine has power 150 W for 8 s. How much energy does it transfer?", ["1200 J", "18.75 J", "158 J", "1508 J"], 0, "Rearrange to E = Pt.", hint),
    mc("A device is 80% efficient and gives 240 J of useful output. What total input was needed?", ["300 J", "192 J", "80 J", "200 J"], 0, "Input = useful / 0.8.", hint),
    mc("Which statement is strongest?", ["A machine can be powerful but still inefficient", "A powerful machine must be efficient", "Efficiency and power are the same idea", "Efficiency is measured in watts"], 0, "Rate and fraction are different quantities.", hint),
    mc("If useful output stays fixed while the total input rises, efficiency...", ["falls", "rises", "stays the same", "becomes zero automatically"], 0, "The useful fraction becomes smaller.", hint),
    mc("What is the unit of power?", ["W", "J", "%", "N"], 0, "Power is measured in watts.", hint),
    mc("Which statement is weakest physics?", ["A machine that finishes quickly must also be efficient", "Power tells how fast energy is transferred", "Efficiency can be less than 100%", "Useful output can be smaller than the total input"], 0, "Speed of transfer does not guarantee usefulness fraction.", hint),
    shortCases([
      { prompt: "A machine transfers 900 J in 6 s. What is its power?", acceptedAnswers: powerAnswers(150), hint },
      { prompt: "Power is energy transferred per unit ...", acceptedAnswers: words("time"), hint },
      { prompt: "Efficiency is usually written as a fraction or a ...", acceptedAnswers: words("percentage", "percent"), hint },
      { prompt: "A device takes in 400 J and gives 300 J useful output. Its efficiency is ...", acceptedAnswers: percentAnswers(75), hint },
      { prompt: "A 250 W motor running for 4 s transfers ... J.", acceptedAnswers: energyAnswers(1000), hint },
      { prompt: "If the same useful output is produced from a smaller input, efficiency ...", acceptedAnswers: words("rises", "increases", "goes up"), hint },
      { prompt: "The unit watt means joules per ...", acceptedAnswers: words("second", "s"), hint },
      { prompt: "Power measures rate; efficiency measures the useful ...", acceptedAnswers: words("fraction", "share", "proportion"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "This lesson protects the difference between how fast and how usefully.";
  return [
    mc("Why are power and efficiency not the same quantity?", ["Because power is a rate while efficiency is a useful fraction", "Because both are measured in joules", "Because efficiency always fixes the rate", "Because power ignores energy"], 0, "They answer different questions.", hint),
    mc("Why can a machine be powerful but inefficient?", ["Because it can transfer energy quickly while still wasting a large fraction", "Because inefficiency makes power impossible", "Because only slow machines waste energy", "Because power guarantees 100% efficiency"], 0, "Rate and waste are separate ideas.", hint),
    mc("Why can two machines have the same efficiency but different power?", ["Because they can transfer energy at different rates while keeping the same useful fraction", "Because equal efficiency forces equal power", "Because power has no units", "Because efficiency depends only on time"], 0, "Same fraction does not mean same rate.", hint),
    mc("Why is 140% efficiency impossible in the simple model?", ["Because useful output cannot exceed total input", "Because machines cannot reach 50%", "Because power is too small", "Because percentages stop at 90%"], 0, "The useful fraction cannot be greater than one whole.", hint),
    mc("Why is 'this machine is better because it is more powerful' too weak?", ["Because the useful fraction might still be worse", "Because power never matters", "Because watts and joules are the same", "Because efficient machines cannot be fast"], 0, "Better depends on the question being asked.", hint),
    mc("Why should time stay visible in power problems?", ["Because power is defined by how much energy is transferred each second", "Because time changes efficiency directly", "Because time replaces energy", "Because time is only decorative"], 0, "Rate needs the time interval.", hint),
    mc("Why should total input stay visible in efficiency problems?", ["Because efficiency compares useful output with the whole supplied input", "Because useful output alone fixes efficiency", "Because input cancels every time", "Because only wasted energy matters"], 0, "The denominator matters.", hint),
    mc("Which statement best repairs 'higher power means less wasted energy'?", ["Higher power only means faster transfer, not automatically less waste", "Higher power always means zero waste", "Higher power removes the need for efficiency", "Higher power means lower useful output"], 0, "Power says nothing by itself about the useful fraction.", hint),
    mc("Why is a joule-per-second story more appropriate for power than for efficiency?", ["Because power has time in its definition while efficiency does not", "Because efficiency is also per second", "Because power never involves energy", "Because efficiency uses the same units as power"], 0, "Only power is a rate quantity.", hint),
    mc("Why does a useful-output-over-input story belong to efficiency rather than power?", ["Because it compares fractions of energy rather than transfer speed", "Because power always uses percentages", "Because efficiency is measured in watts", "Because power ignores output"], 0, "The ratio meaning identifies efficiency.", hint),
    mc("Why is 'the machine finished sooner so it used less energy' unreliable?", ["Because shorter time alone does not fix the total energy transferred", "Because time and energy are identical", "Because energy always falls with time", "Because efficient machines cannot finish quickly"], 0, "Rate does not determine total by itself.", hint),
    mc("Why is it helpful to ask two questions separately: 'How fast?' and 'How much useful?'", ["Because those are the separate jobs of power and efficiency", "Because both are solved by the same ratio", "Because only one question matters in energy systems", "Because it avoids all calculations"], 0, "This two-question structure is the lesson's main discipline.", hint),
    shortCases([
      { prompt: "Power answers 'how ... is energy transferred?'", acceptedAnswers: words("fast", "quickly"), hint },
      { prompt: "Efficiency answers 'what useful ... of the input was kept?'", acceptedAnswers: words("fraction", "share", "percentage"), hint },
      { prompt: "A machine can be fast but still ...", acceptedAnswers: words("inefficient"), hint },
      { prompt: "Efficiency above 100% is ... in this model.", acceptedAnswers: words("impossible", "not possible"), hint },
      { prompt: "Power uses time; efficiency uses useful output over total ...", acceptedAnswers: words("input"), hint },
      { prompt: "Watts measure a transfer ...", acceptedAnswers: words("rate"), hint },
      { prompt: "Percent efficiency compares useful output with the total supply, not with the ...", acceptedAnswers: words("time", "duration"), hint },
      { prompt: "The lesson separates 'how fast' from 'how ...'.", acceptedAnswers: words("useful", "efficient"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Treat a multi-stage mission as one ledger broken into linked steps.";
  return [
    mc("Which relation best belongs to a multi-stage energy mission?", ["output of one stage = input of the next stage", "kinetic energy = 1/2 mv^2 only", "pressure = force / area", "current = charge / time"], 0, "Linked stages feed each other in sequence.", hint),
    mc("A stage takes in 1500 J and is 60% efficient. How much useful output leaves that stage?", ["900 J", "600 J", "2500 J", "150 J"], 0, "Find the useful fraction of the input.", hint),
    mc("That 900 J then loses 20% in the next stage. How much useful energy remains?", ["720 J", "180 J", "1080 J", "880 J"], 0, "Keep 80% of 900 J.", hint),
    mc("A final device needs 700 J to operate. If 720 J arrives, what is the verdict?", ["the mission succeeds by 20 J", "the mission fails by 20 J", "the mission just breaks even", "there is not enough information"], 0, "Compare the final useful amount with the threshold.", hint),
    mc("If the final stage must deliver 600 J useful output at 75% efficiency, what input must that stage receive?", ["800 J", "450 J", "675 J", "900 J"], 0, "Input = useful / 0.75.", hint),
    mc("Which first move is strongest in a linked mission with a threshold at the end?", ["track each stage in order or work backward from the final requirement", "jump straight to speed", "ignore intermediate losses", "compare only the first input"], 0, "A stage map or backward plan keeps the logic visible.", hint),
    mc("Which statement is strongest about a big first input?", ["A large start can still fail if later stages leak too much", "A large start guarantees success", "Later stages cannot change the result", "Only the first stage matters"], 0, "The whole sequence must still balance.", hint),
    mc("A chain has stage efficiencies 80% then 50%. What fraction of the original input survives as final useful output?", ["40%", "30%", "80%", "50%"], 0, "Multiply the stage fractions: 0.8 x 0.5.", hint),
    mc("If a middle stage output is already known, what does it become for the next stage?", ["the next stage's input", "the next stage's leak", "the total mission power", "the final threshold"], 0, "That is the linking rule.", hint),
    mc("A mission starts with 2000 J. Stage 1 keeps 70%, then stage 2 keeps half of what arrives. What final useful output remains?", ["700 J", "1000 J", "1400 J", "350 J"], 0, "2000 x 0.7 x 0.5 = 700.", hint),
    mc("Which statement is weakest physics?", ["The first stage looked strong, so later leaks can be ignored", "Every stage must still obey the energy ledger", "One stage's output can feed the next", "A threshold check belongs at the end"], 0, "Later losses can still decide success or failure.", hint),
    mc("Why might working backward be helpful in a threshold mission?", ["Because the final required useful output can tell you what earlier stages must supply", "Because it removes the need for efficiency", "Because backward reasoning changes the laws", "Because stage order no longer matters"], 0, "Backward planning is often the cleanest route.", hint),
    shortCases([
      { prompt: "In a linked mission, the output of one stage becomes the next stage's ...", acceptedAnswers: words("input"), hint },
      { prompt: "A stage keeps 65% of 800 J. What useful output leaves that stage?", acceptedAnswers: energyAnswers(520), hint },
      { prompt: "A final stage must supply 300 J useful output and is 60% efficient. It needs ... J input.", acceptedAnswers: energyAnswers(500), hint },
      { prompt: "If 900 J enters a stage and 30% leaks away, ... J remains useful.", acceptedAnswers: energyAnswers(630), hint },
      { prompt: "To judge the mission, compare the final useful amount with the required ...", acceptedAnswers: words("threshold", "target"), hint },
      { prompt: "Two stage efficiencies of 80% and 50% combine to a final useful fraction of ...", acceptedAnswers: percentAnswers(40), hint },
      { prompt: "A later leak can still make an apparently strong start ...", acceptedAnswers: words("fail", "unsuccessful"), hint },
      { prompt: "A multi-stage mission is still one energy ...", acceptedAnswers: words("ledger", "account", "bookkeeping chain"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Sequence matters: one stage feeds the next, and the threshold is checked at the end.";
  return [
    mc("Why is a multi-stage mission not solved by looking only at the first number?", ["Because each stage can keep or leak different amounts before the final threshold is checked", "Because the first stage never matters", "Because only the last stage exists physically", "Because input energy cannot be measured"], 0, "The whole chain matters.", hint),
    mc("Why does the output-of-one-stage rule matter so much?", ["Because it links the stages into one continuous ledger", "Because it makes every stage identical", "Because it removes efficiency from the problem", "Because it changes the energy unit"], 0, "This is the connective tissue of the sequence.", hint),
    mc("Why can backward planning be stronger than guessing forward blindly?", ["Because the final requirement tells you what an earlier stage must deliver", "Because backward planning changes the efficiency", "Because thresholds only matter at the start", "Because stage order becomes irrelevant"], 0, "The end condition can determine the needed earlier input.", hint),
    mc("Why is 'the first machine was efficient, so the whole mission will work' a weak claim?", ["Because later stages can still waste enough energy to miss the final target", "Because early efficiency never matters", "Because one efficient stage sets all other stages to 100%", "Because the mission ignores thresholds"], 0, "Local success does not guarantee whole-chain success.", hint),
    mc("Why should the threshold check be left until the final useful amount is known?", ["Because success depends on what actually arrives at the end", "Because thresholds change the energy unit", "Because the first input equals the threshold automatically", "Because threshold checks replace the ledger"], 0, "The end comparison uses the final useful output.", hint),
    mc("Why does multiplying stage fractions make sense in a chain?", ["Because each stage keeps only a fraction of what it receives", "Because efficiencies must always be added", "Because percentages work only alone", "Because later stages ignore earlier ones"], 0, "Each stage acts on the surviving input from before.", hint),
    mc("Why is a stage map helpful?", ["Because it shows where each input, useful output, and leak belongs", "Because it removes the need for equations", "Because it makes every stage 100% efficient", "Because it turns energy into force"], 0, "The map organizes the ledger.", hint),
    mc("Which statement best repairs 'a large middle value proves the mission succeeds'?", ["Only the final useful amount compared with the threshold decides success", "Any large intermediate value guarantees success", "The middle value replaces the last stage", "Thresholds should be ignored"], 0, "Intermediate values are not the final verdict.", hint),
    mc("Why are later-stage leaks especially important?", ["Because they occur after earlier gains have already been made and can still erase the final margin", "Because later leaks count less than earlier ones", "Because later stages cannot waste energy", "Because leak stops being energy in later stages"], 0, "Late losses can destroy a narrow success margin.", hint),
    mc("Why is one overall ledger still valid for a many-stage mission?", ["Because total input still equals total useful output plus total wasted energy across the full chain", "Because conservation applies only to single-stage systems", "Because each stage creates new energy independently", "Because only the threshold matters"], 0, "The chain still obeys conservation overall.", hint),
    mc("Why is 'mission thinking' more advanced than a single-equation reflex?", ["Because it combines sequence, thresholds, fractions, and final judgment instead of one isolated step", "Because isolated equations are never useful", "Because missions avoid mathematics", "Because stage order is random"], 0, "This lesson is about multi-step structure.", hint),
    mc("Why should units be kept visible in a multi-stage chain?", ["Because each stage output is still an energy value that will feed the next stage", "Because units cancel after stage one", "Because percentages remove joules forever", "Because thresholds never use units"], 0, "The ledger stays physical all the way through.", hint),
    shortCases([
      { prompt: "A stage map helps keep the sequence of inputs, useful outputs, and ... visible.", acceptedAnswers: words("leaks", "losses", "waste"), hint },
      { prompt: "In a threshold mission, final success is judged at the ...", acceptedAnswers: words("end", "final stage", "final comparison"), hint },
      { prompt: "A stage fraction acts on what the stage actually ...", acceptedAnswers: words("receives", "gets", "takes in"), hint },
      { prompt: "To work backward from a threshold, find what earlier stage must ... it.", acceptedAnswers: words("supply", "deliver", "provide"), hint },
      { prompt: "Intermediate values matter, but the final ... decides success.", acceptedAnswers: words("comparison", "threshold check", "useful amount"), hint },
      { prompt: "A later leak can erase the final safety ...", acceptedAnswers: words("margin"), hint },
      { prompt: "Overall conservation still gives one total energy ... for the whole mission.", acceptedAnswers: words("ledger", "account"), hint },
      { prompt: "Mission problems need sequencing, not just one isolated ...", acceptedAnswers: words("equation", "formula"), hint },
    ]),
  ];
}

const M3_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M3_L1: l1DiagnosticRaw,
  M3_L2: l2DiagnosticRaw,
  M3_L3: l3DiagnosticRaw,
  M3_L4: l4DiagnosticRaw,
  M3_L5: l5DiagnosticRaw,
  M3_L6: l6DiagnosticRaw,
};

const M3_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M3_L1: l1ConceptRaw,
  M3_L2: l2ConceptRaw,
  M3_L3: l3ConceptRaw,
  M3_L4: l4ConceptRaw,
  M3_L5: l5ConceptRaw,
  M3_L6: l6ConceptRaw,
};

const M3_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(M3_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...M3_DIAGNOSTIC_BUILDERS[code](), ...M3_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function m3GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M3_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function m3GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M3_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function m3GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M3_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
