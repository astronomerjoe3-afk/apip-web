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
  hint = "Rebuild the lesson mechanism before choosing."
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
}

function mcItem(id: string, prompt: string, choices: string[], answerIndex: number, hint: string, explanation: string): UnknownRecord {
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
    throw new Error(`M10 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function shortCases(cases: Array<{ prompt: string; acceptedAnswers: string[]; hint: string }>): RawItem[] {
  return cases.map((entry) => short(entry.prompt, entry.acceptedAnswers, entry.hint));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Separate source pattern, local direction, and relative strength.";
  return [
    mc("Which magnetic-field pattern best identifies a straight current-carrying wire?", ["concentric circles around the wire", "straight parallel lines only", "radial lines outward from the wire", "a single loop ending at the wire"], 0, "A straight wire produces circular magnetic field lines around itself.", hint),
    mc("Which clue shows the local magnetic-field direction at one chosen point?", ["the tangent direction of the field line or compass needle there", "the color of the wire", "the total number of lines drawn on the page", "the battery voltage only"], 0, "Local direction is read from the tangent to the field line or the compass alignment at that point.", hint),
    mc("What do closer magnetic field lines indicate in a school field map?", ["a stronger field region", "a faster particle speed", "a larger charge flow through the paper", "a lower temperature"], 0, "In the map model, denser lines indicate a stronger field.", hint),
    mc("What is a compass actually showing when placed in a magnetic field?", ["the field direction at that point", "the field strength in tesla directly", "the current in the nearest wire", "the mass of the magnet"], 0, "A compass aligns with the local field direction.", hint),
    mc("What happens to the field around a straight wire if the current reverses?", ["the circular field direction reverses", "the wire turns into a bar magnet", "the field becomes radial instead of circular", "the field strength becomes zero everywhere"], 0, "Reversing current reverses the direction of the circular field.", hint),
    mc("Outside a bar magnet, field direction is read as going...", ["from north pole to south pole", "from south pole to north pole", "toward the middle only", "in concentric circles"], 0, "Outside the magnet, field direction is from north to south.", hint),
    mc("Why is it weak to call a magnetic field line the route a charged particle must follow?", ["field lines are a map of field direction, not guaranteed travel tracks", "charged particles never interact with fields", "magnetic fields only exist inside iron", "field lines measure resistance"], 0, "Field lines show the field, not guaranteed particle trajectories.", hint),
    mc("Between opposite poles placed close together, the field in the gap is usually best described as...", ["strong and roughly uniform", "circular around one pole only", "zero because the poles cancel", "random with no clear direction"], 0, "Opposite poles close together produce a concentrated, nearly uniform field in the gap.", hint),
    mc("If two points lie on the same field line but the lines are more widely spaced at Q than at P, which statement is strongest?", ["the field is weaker at Q than at P", "the field direction disappears at Q", "the source has changed at Q", "the magnetic field is electric at Q"], 0, "Line spacing compares relative strength.", hint),
    mc("What happens to the magnetic field strength around a straight wire as you move farther from the wire?", ["it gets weaker", "it becomes electric", "it must reverse direction", "it becomes uniform"], 0, "The field weakens with distance from the wire.", hint),
    mc("Which source is most consistent with a field pattern that leaves one end, curves around, and enters the opposite end?", ["a bar magnet", "a single straight wire only", "a neutral plastic rod", "a resistor"], 0, "That is the familiar bar-magnet pattern.", hint),
    mc("Which statement is strongest about field maps?", ["one diagram can show source type, local direction, and relative strength together", "field maps show only strength and never direction", "field maps show particle energy directly", "field maps work only for bar magnets and never for current-carrying wires"], 0, "A good field map carries several pieces of information at once.", hint),
    ...shortCases([
      { prompt: "Name the source that produces concentric magnetic field lines around itself.", acceptedAnswers: ["current-carrying wire", "a straight current-carrying wire", "straight current-carrying wire"], hint: "Think about the source pattern, not the field strength." },
      { prompt: "What quantity does a compass reveal at one point in a magnetic field?", acceptedAnswers: ["field direction", "magnetic field direction", "the magnetic field direction"], hint: "A compass is a direction reader." },
      { prompt: "Closer magnetic field lines mean the field is...", acceptedAnswers: ["stronger"], hint: "Line density is the school clue to relative strength." },
      { prompt: "Outside a bar magnet, state the field direction in words.", acceptedAnswers: ["north to south", "from north to south", "from the north pole to the south pole"], hint: "Read the field outside the magnet." },
      { prompt: "If the current in a straight wire reverses, what happens to the field direction?", acceptedAnswers: ["it reverses", "the field direction reverses", "it changes to the opposite direction"], hint: "Keep the source location fixed and change only current direction." },
      { prompt: "Field lines are a map of field direction and pattern, not literal particle...", acceptedAnswers: ["paths", "tracks", "routes"], hint: "Do not turn a field diagram into a travel map." },
      { prompt: "If the tangent to a field line at P points east, what is the field direction at P?", acceptedAnswers: ["east"], hint: "Read local direction from the tangent." },
      { prompt: "Farther from a straight wire, the magnetic field is generally...", acceptedAnswers: ["weaker"], hint: "Compare line spacing with distance from the source." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Read source, direction, and strength as three separate jobs.";
  return [
    mc("A learner says, 'The field line itself is what pushes the compass.' What is the better correction?", ["the compass aligns with the magnetic field direction that the line represents", "field lines are tiny wires carrying current", "a compass measures voltage in the field", "the compass always points north regardless of the field"], 0, "Field lines are representational; the field is the physical thing.", hint),
    mc("Which combination of clues is strongest when reading a magnetic field map?", ["pattern identifies source, tangent gives direction, spacing compares strength", "spacing gives source, color gives direction, tangent gives charge", "tangent gives strength, spacing gives current, pattern gives temperature", "pattern gives voltage, tangent gives resistance, spacing gives power"], 0, "Each clue answers a different physics question.", hint),
    mc("Why can the wire stay in the same place while the circular field direction reverses?", ["the source location is fixed by the wire, but field direction depends on current direction", "the wire becomes a bar magnet when current reverses", "field direction depends only on the paper orientation", "field direction cannot reverse unless the wire moves"], 0, "Source position and field direction are different parts of the story.", hint),
    mc("Two compasses at different points around the same wire point in different directions. What is the strongest explanation?", ["the field direction changes from point to point around the circular pattern", "the current is splitting into two branches", "one compass is measuring field strength and the other current", "the wire creates two unrelated fields"], 0, "A circular field has different local directions around the wire.", hint),
    mc("If line spacing changes but the field-line tangent at a point does not, what has changed?", ["the relative field strength only", "the source type only", "the local direction only", "the charge on the wire only"], 0, "Spacing and tangent answer different questions.", hint),
    mc("What is the best reason to draw many field lines instead of one arrow only?", ["the full pattern helps identify the source and compare strong and weak regions", "field lines are needed to carry current across the page", "a single arrow cannot exist in physics", "magnets only work when many lines are drawn"], 0, "The overall pattern matters, not just one local direction.", hint),
    mc("What is the strongest comparison between a bar-magnet field and a straight-wire field?", ["a bar magnet gives a looped north-to-south pattern, while a straight wire gives concentric circles", "both always give exactly the same pattern", "a bar magnet gives circles and a wire gives north-to-south loops", "neither can be read with a compass"], 0, "Source identification comes from the whole field shape.", hint),
    mc("Why is it not enough to say, 'The field is strong here,' when interpreting a map?", ["you should also state the local direction and the source clue when relevant", "strength automatically tells you the current value exactly", "strength means the field lines are particle paths", "strength makes source identification impossible"], 0, "A good field reading is multi-part, not vague.", hint),
    mc("What is the best interpretation of a dense set of nearly parallel lines between opposite poles?", ["the field is strong and fairly uniform in that region", "the field is zero but the page is crowded", "the field must be electric instead of magnetic", "the poles are like poles"], 0, "Parallel crowded lines between unlike poles indicate a strong, near-uniform field.", hint),
    mc("If current in a wire becomes zero, what happens to the magnetic field due to that current?", ["the wire's magnetic field disappears", "it becomes a permanent magnet field", "it becomes stronger because charge is stationary", "it becomes uniform"], 0, "The current-produced field depends on current actually flowing.", hint),
    mc("A student compares two field maps and says, 'This one has more lines, so the battery must be bigger.' Why is that weak?", ["field-line drawings are qualitative maps, so you should compare pattern and spacing rather than count lines mechanically", "battery size is always read directly from compass needles", "magnetic fields cannot be drawn qualitatively", "line counting replaces all magnetism rules"], 0, "Drawn field lines are a model, not literal counted objects.", hint),
    mc("Which statement best protects the lesson meaning of a field map?", ["field maps are read locally and globally at the same time", "field maps are only decorative sketches", "field maps tell you current but not field direction", "field maps matter only for permanent magnets"], 0, "A field map combines local direction with global pattern.", hint),
    ...shortCases([
      { prompt: "Name the three different reading jobs in a magnetic field map: source, field..., and relative strength.", acceptedAnswers: ["direction", "field direction"], hint: "One of the jobs is local, not global." },
      { prompt: "If two points have the same local tangent direction but different line spacing, what differs?", acceptedAnswers: ["field strength", "relative field strength", "the field strength"], hint: "Spacing compares strength." },
      { prompt: "A compass tells you the field direction at one chosen...", acceptedAnswers: ["point"], hint: "Think locally." },
      { prompt: "A current-carrying wire creates a magnetic field pattern that is...", acceptedAnswers: ["circular", "circles", "concentric circles"], hint: "Name the overall shape." },
      { prompt: "A bar magnet field outside the magnet runs from the north pole to the...", acceptedAnswers: ["south pole", "south"], hint: "State the destination pole." },
      { prompt: "What happens to the field direction above a wire if the current reverses?", acceptedAnswers: ["it reverses", "it flips", "it changes to the opposite direction"], hint: "Change one factor at a time." },
      { prompt: "Field-line spacing is used as a qualitative clue to field...", acceptedAnswers: ["strength"], hint: "Not direction this time." },
      { prompt: "Field lines should not be read as particle...", acceptedAnswers: ["paths", "tracks", "routes"], hint: "Do not confuse a field map with motion." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Compare current, turns, and core one factor at a time.";
  return [
    mc("What is the best description of a solenoid?", ["a coil of wire that produces a magnetic field when current flows", "a permanent magnet with no current", "a resistor wrapped around a battery", "a compass made of iron only"], 0, "A solenoid is the standard electromagnet coil.", hint),
    mc("Which change makes an electromagnet stronger if everything else is unchanged?", ["increasing the current", "using a shorter lesson title", "disconnecting the coil", "removing all turns"], 0, "More current strengthens the field of the coil.", hint),
    mc("Which change also strengthens an electromagnet if current stays the same?", ["adding more turns to the coil", "making the wire a different color", "opening the switch", "removing the power source"], 0, "More turns reinforce the field from each loop.", hint),
    mc("Why is soft iron used as the core of a simple electromagnet?", ["it strengthens the field and is easy to magnetize and demagnetize", "it permanently keeps the magnet switched on", "it blocks the field from leaving the coil", "it removes the need for current"], 0, "Soft iron strengthens the electromagnet while keeping it controllable.", hint),
    mc("What usually happens when the current in an electromagnet is switched off?", ["most of the magnetism disappears", "the magnet becomes stronger permanently", "the poles reverse by themselves", "the coil produces voltage instead"], 0, "An electromagnet is meant to be controllable and temporary.", hint),
    mc("If the current in a solenoid reverses, what happens to the poles?", ["north and south swap over", "the field becomes electric", "the magnetic field strength becomes zero", "the coil stops having turns"], 0, "Reversing current reverses the pole pattern.", hint),
    mc("Which core material is usually better for a temporary electromagnet than steel?", ["soft iron", "hard steel", "plastic", "wood"], 0, "Soft iron is easier to magnetize and demagnetize.", hint),
    mc("An electromagnet used in a scrapyard crane must release metal when switched off. Which property matters most?", ["the core should lose most of its magnetism when current stops", "the current should be impossible to reverse", "the coil should behave like a permanent magnet", "the core should remain strongly magnetized"], 0, "A crane electromagnet must switch on and off cleanly.", hint),
    mc("If the number of turns doubles while current and core stay the same, the electromagnet should become...", ["stronger", "weaker", "unchanged", "electrically neutral"], 0, "More turns reinforce the field more strongly.", hint),
    mc("If current falls while turn count and core stay fixed, the electromagnet should become...", ["weaker", "stronger", "a permanent magnet", "a transformer"], 0, "Less current gives a weaker field.", hint),
    mc("Which statement is strongest?", ["the coil current is still the source of the electromagnet's field", "the core creates the field even without current", "the core replaces the need for a coil", "the poles are fixed even if current reverses"], 0, "The core strengthens the field; the current creates it.", hint),
    mc("Why does a solenoid often behave like a bar magnet?", ["its field pattern has north and south ends like a bar magnet", "it always contains a hidden permanent magnet", "its wire has no resistance", "current flows from north to south inside the wire"], 0, "A current-carrying coil produces a magnet-like field pattern.", hint),
    ...shortCases([
      { prompt: "Name the coil of wire used to make an electromagnet.", acceptedAnswers: ["solenoid", "coil"], hint: "Use the standard lesson word." },
      { prompt: "Name the best core material for a simple temporary electromagnet.", acceptedAnswers: ["soft iron"], hint: "Think of the easily magnetized core." },
      { prompt: "If current in a solenoid reverses, the poles...", acceptedAnswers: ["reverse", "swap", "swap over", "reverse direction"], hint: "The pole pattern follows current direction." },
      { prompt: "Increasing the number of turns makes an electromagnet...", acceptedAnswers: ["stronger"], hint: "More loops reinforce the field." },
      { prompt: "Increasing current makes an electromagnet...", acceptedAnswers: ["stronger"], hint: "A larger current strengthens the field." },
      { prompt: "When current is switched off, an electromagnet usually becomes...", acceptedAnswers: ["weak", "much weaker", "demagnetized", "mostly demagnetized"], hint: "It should not stay strongly magnetized." },
      { prompt: "A scrapyard crane uses an electromagnet because it can be switched on and...", acceptedAnswers: ["off"], hint: "Think controllability." },
      { prompt: "The core strengthens the field, but the magnetic field is created by the coil...", acceptedAnswers: ["current", "electric current", "the current"], hint: "Name the actual source." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Explain strength changes causally, not as disconnected tricks.";
  return [
    mc("Electromagnet A has more turns than B, but both carry the same current and use the same core. Why should A be stronger?", ["more loops reinforce the field from the current more strongly", "more turns remove the need for a power supply", "more turns change the magnetic field into an electric field", "more turns always make the coil longer and therefore weaker"], 0, "More turns strengthen the same current-produced field.", hint),
    mc("Why is it weak to say, 'The iron core is the magnet' when describing an electromagnet?", ["the current in the coil creates the field, while the core only strengthens it", "the core never affects magnetism", "the core is made of electricity", "the field exists only outside the coil"], 0, "The core matters, but it is not the full story.", hint),
    mc("What is the strongest reason not to use hard steel as the core of a switchable electromagnet?", ["it tends to stay magnetized too strongly after the current changes", "it has no atoms", "it prevents current from entering the wire", "it makes the coil have fewer turns"], 0, "Hard magnetic materials are poor for switchable electromagnets.", hint),
    mc("A relay needs a magnetic pull only when current flows. Which statement best matches that need?", ["soft iron gives strong temporary magnetism without strong permanent magnetism", "the coil should be replaced with a permanent magnet", "the current should be removed permanently", "the electromagnet should keep its poles after switch-off"], 0, "The relay needs magnetism that follows the current.", hint),
    mc("If current is fixed but one student adds a soft-iron core while another doubles the turns, what is the strongest summary?", ["both changes strengthen the same electromagnet story by different mechanisms", "only the core matters because turns never matter", "only turns matter because cores never matter", "the two changes must cancel"], 0, "Different strength levers act on the same field system.", hint),
    mc("Which explanation best fits the on-off behavior of an electromagnet?", ["its field is produced by current, so removing current removes most of the magnetic effect", "its poles are permanent and ignore the circuit", "its core stores current after switch-off", "its turns disappear when the switch opens"], 0, "The on-off behavior follows the current.", hint),
    mc("Why does reversing the current reverse the poles of the solenoid?", ["the magnetic field direction made by the coil reverses when current direction reverses", "the core turns inside the coil", "soft iron changes into steel", "the turns are counted backward"], 0, "Pole direction follows field direction.", hint),
    mc("What should stay fixed if you want to test only the effect of current on electromagnet strength?", ["turn count and core", "everything except the battery color", "the current and the turn count", "the magnetic field direction and the core material only"], 0, "Change one variable at a time.", hint),
    mc("What should stay fixed if you want to test only the effect of turn count?", ["current and core", "turn count and current", "the source and the field direction only", "nothing needs to stay fixed"], 0, "Fair comparison needs the other strength levers fixed.", hint),
    mc("Which statement best describes a solenoid field?", ["it resembles a bar-magnet field with north and south ends", "it is always circular around the whole coil with no poles", "it has no direction until a compass is added", "it exists only inside the metal core"], 0, "A solenoid has magnet-like poles and a magnet-like field pattern.", hint),
    mc("A student says, 'The core makes the magnet, so current size does not matter.' Which correction is best?", ["current still matters because the coil current is the original source of the magnetic field", "current never affects any magnetic field", "the core alone decides the pole direction and strength", "electromagnets work without a circuit"], 0, "The core does not replace the current.", hint),
    mc("Why can an electromagnet be better than a permanent magnet in a machine that sorts metal objects?", ["its strength can be controlled by changing the current or turning it off", "it always has zero resistance", "it cannot have north and south poles", "it never needs a wire"], 0, "Control is the key advantage.", hint),
    mc("If two coils have the same turns and same current but one has a soft-iron core and the other has air only, what is the best comparison?", ["the soft-iron-core coil should be stronger", "the air-core coil must be stronger", "they must be identical because the current is the same", "neither can act as a magnet"], 0, "The core concentrates the field.", hint),
    mc("What is the strongest reason to increase current in a coil when trying to pick up more paper clips?", ["a larger current strengthens the magnetic field produced by the coil", "current changes the coil into steel", "current removes the need for turns", "current makes field lines become particle tracks"], 0, "Strength comes from the stronger current-produced field.", hint),
    mc("Which combination would most strongly increase the strength of the same basic electromagnet?", ["more turns, larger current, and a soft-iron core", "fewer turns, smaller current, and no core", "more turns but an open switch", "a soft-iron core with no current"], 0, "All three effective levers act together.", hint),
    mc("What is the best interpretation of 'temporary magnet' in this lesson?", ["a magnetic effect that mainly exists while the current is present", "a bar magnet that lasts only one second", "a current that turns into a magnet forever", "a field line drawn with dotted ink"], 0, "Temporary here means controllable with the circuit.", hint),
    ...shortCases([
      { prompt: "Name one factor other than current that can strengthen a coil electromagnet.", acceptedAnswers: ["more turns", "increasing turns", "a soft-iron core", "soft iron core"], hint: "Think of the other strength levers." },
      { prompt: "Soft iron is useful because it is easy to magnetize and easy to...", acceptedAnswers: ["demagnetize"], hint: "Think switch-off behavior." },
      { prompt: "Reversing current reverses the solenoid's...", acceptedAnswers: ["poles", "pole directions", "north and south poles"], hint: "The pole pattern follows current direction." },
      { prompt: "A solenoid behaves like a bar...", acceptedAnswers: ["magnet"], hint: "Name the familiar source it resembles." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Use F = B I L sin(theta) for magnitude and keep direction separate.";
  return [
    mc("What is the motor effect?", ["the force on a current-carrying conductor in a magnetic field", "the voltage induced by a changing field", "the magnetic field inside a permanent magnet only", "the heating of a resistor by current"], 0, "The motor effect is the sideways magnetic force on a current-carrying conductor.", hint),
    mc("The motor-effect force on a current-carrying wire is perpendicular to...", ["both the field and the current", "the field only, never the current", "the current only, never the field", "neither the field nor the current"], 0, "The force is sideways to both.", hint),
    mc("What happens to the force direction if current reverses but the field stays the same?", ["the force direction reverses", "the force direction stays the same", "the force becomes electric", "the wire loses all current"], 0, "Changing current direction flips the magnetic force direction.", hint),
    mc("What happens to the force direction if the field reverses but the current stays the same?", ["the force direction reverses", "the force direction stays the same", "the wire becomes a magnet", "the force becomes zero automatically"], 0, "Changing field direction also flips the force.", hint),
    mc("When is the magnetic force on the wire zero in the simple formula model?", ["when the wire is parallel to the field", "when the wire is perpendicular to the field", "when the current is steady", "when the wire is made of copper"], 0, "Parallel to the field means no crossing component and no sideways force.", hint),
    mc("When is the magnetic force largest for fixed B, I, and L?", ["when the wire is at 90 deg to the field", "when the wire is parallel to the field", "when the current is zero", "when the field is reversed"], 0, "The sin(theta) factor is largest at 90 deg.", hint),
    mc("If field strength doubles while current, length, and angle stay fixed, the force becomes...", ["twice as large", "half as large", "unchanged", "zero"], 0, "Force is proportional to field strength.", hint),
    mc("If current doubles while field, length, and angle stay fixed, the force becomes...", ["twice as large", "half as large", "unchanged", "zero"], 0, "Force is proportional to current.", hint),
    mc("If the length of wire in the field doubles while B, I, and angle stay fixed, the force becomes...", ["twice as large", "half as large", "unchanged", "one quarter"], 0, "Force is proportional to the active length in the field.", hint),
    mc("If both current and field reverse together, what happens to the force direction?", ["it stays the same", "it reverses", "it becomes zero", "it becomes random"], 0, "Reversing both leaves the force direction unchanged in the vector rule.", hint),
    ...shortCases([
      { prompt: "A wire of length 0.30 m carries 2.0 A at 90 deg to a 0.50 T field. Find the force.", acceptedAnswers: answers("0.30", "N", "0.3", "0.3 N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.40 m carries 5.0 A at 90 deg to a 0.20 T field. Find the force.", acceptedAnswers: answers("0.40", "N", "0.4", "0.4 N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.20 m carries 1.5 A at 90 deg to a 0.80 T field. Find the force.", acceptedAnswers: answers("0.24", "N", "0.240", "0.240 N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.40 m carries 2.0 A at 30 deg to a 0.50 T field. Find the force.", acceptedAnswers: answers("0.20", "N", "0.2", "0.2 N"), hint: "Use sin 30 deg = 0.5." },
      { prompt: "A wire of length 0.25 m carries 4.0 A parallel to a 0.60 T field. Find the force.", acceptedAnswers: answers("0", "N", "0 N"), hint: "Parallel to the field means sin 0 = 0." },
      { prompt: "A wire of length 0.10 m carries 3.0 A at 90 deg to a 0.60 T field. Find the force.", acceptedAnswers: answers("0.18", "N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.50 m carries 4.0 A at 90 deg to a 0.25 T field. Find the force.", acceptedAnswers: answers("0.50", "N", "0.5", "0.5 N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.50 m carries 1.2 A at 90 deg to a 0.30 T field. Find the force.", acceptedAnswers: answers("0.18", "N"), hint: "Use F = B I L sin(theta)." },
      { prompt: "A wire of length 0.20 m carries 2.0 A at 30 deg to a 0.40 T field. Find the force.", acceptedAnswers: answers("0.08", "N"), hint: "Use sin 30 deg = 0.5." },
      { prompt: "A wire of length 0.60 m carries 1.0 A at 90 deg to a 0.30 T field. Find the force.", acceptedAnswers: answers("0.18", "N"), hint: "Use F = B I L sin(theta)." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Protect the sideways-force story and the sin(theta) factor together.";
  return [
    mc("Why is it weak to say the wire is pushed along the magnetic field lines in the motor effect?", ["the force is perpendicular to the field, not along it", "the field lines carry no information", "the wire has no current", "magnetic fields act only on stationary charges"], 0, "The motor-effect force is sideways, not along the field.", hint),
    mc("Which explanation best fits the zero-force case for a wire parallel to the field?", ["there is no perpendicular crossing component of the wire through the field", "the field becomes electric instead", "the current stops automatically", "parallel wires cannot conduct"], 0, "The sin(theta) factor falls to zero when theta = 0.", hint),
    mc("A wire is moved from 90 deg to 30 deg relative to the field while B, I, and L stay fixed. What happens?", ["the force decreases because the sin(theta) factor decreases", "the force increases because the wire is less stretched", "the force becomes independent of current", "the force direction disappears"], 0, "Angle affects magnitude through sin(theta).", hint),
    mc("If B is doubled and I is halved while L and angle stay fixed, what happens to the force magnitude?", ["it stays the same", "it doubles", "it halves", "it becomes zero"], 0, "The proportional changes cancel.", hint),
    mc("What is the cleanest reason to keep direction and magnitude separate in a motor-effect problem?", ["the formula gives magnitude, while field/current orientation determines the force direction", "direction can be ignored whenever B is known", "the formula gives direction only", "current direction matters only in generators"], 0, "Magnitude and direction come from different parts of the reasoning.", hint),
    mc("A conductor carrying current north in a field directed east feels a force up out of the page. If the current is reversed, the new force is...", ["into the page", "still out of the page", "east", "north"], 0, "Reverse one direction and the force flips.", hint),
    mc("Which change guarantees the same force magnitude but opposite force direction?", ["reverse current only while keeping B, L, and theta the same", "double current only", "halve field strength only", "rotate from 30 deg to 90 deg"], 0, "Reversing one direction flips the force without changing the magnitude factors.", hint),
    mc("What is the best reason a longer active wire in the field gives a larger force?", ["more of the current-carrying conductor is interacting with the field", "the wire becomes a permanent magnet", "longer wires remove the angle factor", "length changes the battery voltage automatically"], 0, "Active length matters directly in the force formula.", hint),
    mc("Why does the force depend on sin(theta) rather than on theta alone?", ["only the perpendicular component of the crossing matters", "angles are measured in current units", "parallel wires always produce electric fields", "magnetic fields ignore geometry"], 0, "The force depends on the perpendicular crossing component.", hint),
    mc("A student says, 'A stronger field changes the force direction.' What is the best correction?", ["a stronger field changes force magnitude, while direction depends on the relative directions of field and current", "field strength matters only when current is zero", "force direction depends only on wire length", "field strength removes the motor effect"], 0, "Strength and direction must not be collapsed into one idea.", hint),
    mc("If both field and current are reversed, why can the force direction stay the same?", ["the two direction reversals cancel in the cross-product rule", "the force is unrelated to current", "the wire becomes non-magnetic", "the battery changes the field pattern"], 0, "This is a strong direction-reasoning check.", hint),
    mc("Which set of variables determines the force magnitude in the school formula?", ["B, I, L, and theta", "B, mass, temperature, and time", "current only", "field direction only"], 0, "The full formula has four magnitude inputs.", hint),
    mc("What happens to force magnitude if the wire is rotated from 30 deg to 90 deg with all else fixed?", ["it doubles", "it stays the same", "it halves", "it becomes zero"], 0, "sin 90 / sin 30 = 1 / 0.5 = 2.", hint),
    mc("A wire at 90 deg to the field has force 0.24 N. If only the field strength is halved, the new force is...", ["0.12 N", "0.24 N", "0.48 N", "0 N"], 0, "Force is directly proportional to B.", hint),
    mc("A wire at 90 deg to the field has force 0.30 N. If only the current is tripled, the new force is...", ["0.90 N", "0.60 N", "0.30 N", "0.10 N"], 0, "Force is directly proportional to I.", hint),
    mc("A wire at 90 deg to the field has force 0.40 N. If only the active length in the field is quartered, the new force is...", ["0.10 N", "0.20 N", "0.40 N", "1.60 N"], 0, "Force is directly proportional to active length.", hint),
    ...shortCases([
      { prompt: "In F = B I L sin(theta), the force is largest when theta is ... deg.", acceptedAnswers: ["90", "90 deg"], hint: "The sin(theta) factor is largest at one special angle." },
      { prompt: "If current reverses while the field stays fixed, the force direction ...", acceptedAnswers: ["reverses", "flips"], hint: "Change one direction at a time." },
      { prompt: "If the wire is parallel to the field, the force is ...", acceptedAnswers: ["zero", "0", "0 N"], hint: "Use sin 0." },
      { prompt: "A stronger magnetic field gives a ... force on the same wire if all other factors stay fixed.", acceptedAnswers: ["larger", "greater", "stronger"], hint: "Force is proportional to B." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Read opposite side forces first, then the turning effect.";
  return [
    mc("Why does a current-carrying coil in a magnetic field rotate instead of simply moving sideways?", ["opposite sides feel opposite forces that form a turning couple", "the coil has no mass", "the battery pulls the coil around the axle", "the field lines become circular"], 0, "Rotation comes from a pair of opposite forces on opposite sides.", hint),
    mc("What is torque in this lesson?", ["the turning effect of a force or force pair about an axis", "the current in the motor coil", "the voltage across the commutator", "the magnetic field inside the battery"], 0, "Torque is the turning effect.", hint),
    mc("Which change increases motor torque if all other factors stay fixed?", ["increasing the current", "opening the circuit", "removing turns from the coil", "reducing the coil area"], 0, "Torque increases with current.", hint),
    mc("Which other change increases torque if B, I, and A stay fixed?", ["increasing the number of turns", "reversing the commutator labels only", "removing the axle", "disconnecting the battery"], 0, "Torque increases with turn count.", hint),
    mc("Which change also increases torque if B, I, and N stay fixed?", ["increasing the coil area", "making the wire shorter outside the field only", "removing the magnetic field", "changing the page color"], 0, "Torque increases with coil area.", hint),
    mc("Which change also increases torque if I, N, and A stay fixed?", ["increasing magnetic field strength", "using a weaker magnet", "switching to direct current with an open circuit", "turning the motor off"], 0, "Torque increases with field strength.", hint),
    mc("What is the role of the split-ring commutator in a simple d.c. motor?", ["it reverses the current every half-turn to keep the torque in the same overall direction", "it increases the battery voltage every half-turn", "it removes the need for brushes", "it turns the magnetic field on and off randomly"], 0, "The commutator preserves the direction of rotation.", hint),
    mc("What would happen without the split-ring commutator in a simple d.c. motor?", ["the torque would reverse after half a turn and the coil would tend to stall or rock", "the coil would rotate faster forever", "the magnetic field would disappear completely", "the motor would become a transformer"], 0, "Without commutation, the turning effect does not stay in the same direction.", hint),
    mc("Why is it weak to describe the commutator as the source of energy for the motor?", ["the commutator manages current connections; the electrical energy comes from the supply", "the commutator creates the magnetic field and the battery does nothing", "the commutator replaces the current in the coil", "the commutator removes the need for a magnetic field"], 0, "The commutator is a switching/contact part, not the power source.", hint),
    mc("What is the strongest reason the coil experiences a torque rather than a single net sideways push?", ["the forces act on opposite sides in opposite directions at different positions", "the same force acts at the same point twice", "the current is zero at one side", "the axle removes all motion"], 0, "A couple creates rotation.", hint),
    ...shortCases([
      { prompt: "A motor coil has B = 0.20 T, I = 0.50 A, N = 50, and area = 0.004 m^2 at maximum turning effect. Find the torque.", acceptedAnswers: answers("0.020", "N m", "0.02", "0.02 N m"), hint: "Use torque = B I N A at maximum turning effect." },
      { prompt: "A motor coil has B = 0.30 T, I = 0.40 A, N = 100, and area = 0.002 m^2. Find the torque.", acceptedAnswers: answers("0.024", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.10 T, I = 2.0 A, N = 40, and area = 0.005 m^2. Find the torque.", acceptedAnswers: answers("0.040", "N m", "0.04", "0.04 N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.25 T, I = 1.2 A, N = 80, and area = 0.002 m^2. Find the torque.", acceptedAnswers: answers("0.048", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.40 T, I = 0.50 A, N = 200, and area = 0.001 m^2. Find the torque.", acceptedAnswers: answers("0.040", "N m", "0.04", "0.04 N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.15 T, I = 0.80 A, N = 150, and area = 0.003 m^2. Find the torque.", acceptedAnswers: answers("0.054", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.60 T, I = 0.25 A, N = 120, and area = 0.002 m^2. Find the torque.", acceptedAnswers: answers("0.036", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.50 T, I = 1.5 A, N = 60, and area = 0.001 m^2. Find the torque.", acceptedAnswers: answers("0.045", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.18 T, I = 0.80 A, N = 120, and area = 0.0025 m^2. Find the torque.", acceptedAnswers: answers("0.0432", "N m"), hint: "Use torque = B I N A." },
      { prompt: "A motor coil has B = 0.24 T, I = 1.0 A, N = 100, and area = 0.003 m^2. Find the torque.", acceptedAnswers: answers("0.072", "N m"), hint: "Use torque = B I N A." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Protect the torque story and the commutator story at the same time.";
  return [
    mc("Why is a motor best explained as a torque problem rather than just a force problem?", ["opposite side forces form a couple that turns the coil about its axle", "the coil has no forces on it", "torque and force mean exactly the same thing here", "motors work without magnetic fields"], 0, "The motor uses a pair of forces to create rotation.", hint),
    mc("What is the best reason a larger coil area increases motor torque?", ["the opposite forces act with a larger turning leverage", "the commutator spins faster automatically", "the battery voltage becomes larger by itself", "the current stops needing a magnetic field"], 0, "Larger area means a larger loop and a larger turning effect.", hint),
    mc("If the number of turns doubles while B, I, and A stay fixed, what happens to the maximum torque?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Torque is proportional to N.", hint),
    mc("If the current doubles while B, N, and A stay fixed, what happens to the maximum torque?", ["it doubles", "it halves", "it stays the same", "it reverses"], 0, "Torque is proportional to current.", hint),
    mc("If the magnetic field halves while I, N, and A stay fixed, what happens to the maximum torque?", ["it halves", "it doubles", "it stays the same", "it becomes zero only if the current reverses"], 0, "Torque is proportional to field strength.", hint),
    mc("Why is it not enough to say, 'The motor spins because there is a force on the wire'?", ["you must also explain that opposite side forces create a turning couple on the coil", "one force always explains a rotating coil fully", "the force exists only after the coil has already spun", "motors do not depend on current"], 0, "A motor is a structured force arrangement, not a single-force story.", hint),
    mc("What exactly does the commutator protect in a d.c. motor?", ["the direction of the turning effect", "the value of the magnetic field strength", "the number of turns in the coil", "the size of the battery casing"], 0, "The commutator preserves the rotation direction.", hint),
    mc("Why can a single straight wire in a field translate while a coil can rotate?", ["the coil has opposite sides at different positions, so the forces form a torque", "coils have no current", "straight wires cannot be in magnetic fields", "coils do not obey the motor effect"], 0, "Geometry turns the motor effect into a torque.", hint),
    mc("A student says, 'The commutator gives extra push every half-turn.' What is the better correction?", ["it reverses the current connection so the torque stays in the same rotational sense", "it doubles the field strength every half-turn", "it stores charge and releases it into the coil", "it replaces the brushes with a permanent magnet"], 0, "The commutator manages current direction, not extra power.", hint),
    mc("Which formula gives the maximum turning effect for a motor coil in this lesson?", ["torque = B I N A", "F = B I L", "emf = N delta(Phi) / delta(t)", "Vp / Vs = Np / Ns"], 0, "This lesson's turning formula uses field, current, turns, and area.", hint),
    mc("If one motor has twice the field strength and half the area of another, with the same I and N, how do their maximum torques compare?", ["they are equal", "the first is twice as large", "the first is half as large", "you cannot compare them"], 0, "The proportional changes cancel.", hint),
    mc("Why does a motor coil not simply stop at the vertical position in a working d.c. motor?", ["the commutator reverses the current connection so the turning effect continues in the same direction", "the torque becomes unnecessary at that position", "the field disappears and reappears", "the coil loses all resistance"], 0, "Continuous rotation needs commutation.", hint),
    mc("What is the strongest reason torque depends on both current and field strength?", ["the turning pair comes from magnetic forces whose size depends on both factors", "current matters only for heating", "field strength matters only for direction", "neither affects the force on a coil"], 0, "Torque grows because the underlying magnetic forces grow.", hint),
    mc("If a motor coil's area is quartered while B, I, and N stay fixed, the maximum torque becomes...", ["one quarter as large", "half as large", "unchanged", "four times as large"], 0, "Torque is proportional to area.", hint),
    mc("Which statement best separates motor effect from electromagnetic induction?", ["motor effect turns electrical energy into motion using force on current, while induction creates emf from changing flux", "both are the same rule written in different units only", "motors and generators both need no magnetic field", "induction is just torque in a wire"], 0, "Keep the motor lesson separate from the induction lesson.", hint),
    mc("A coil's maximum torque is 0.030 N m. If the number of turns triples with all else fixed, the new maximum torque is...", ["0.090 N m", "0.060 N m", "0.030 N m", "0.010 N m"], 0, "Torque is proportional to turn count.", hint),
    ...shortCases([
      { prompt: "The split-ring commutator reverses the coil current every half-...", acceptedAnswers: ["turn"], hint: "State the missing word." },
      { prompt: "A motor rotates because opposite side forces create a turning ...", acceptedAnswers: ["moment", "torque", "turning moment"], hint: "Name the turning effect." },
      { prompt: "If B, I, N, and A are all known at maximum turning effect, you can calculate the coil's ...", acceptedAnswers: ["torque", "turning moment"], hint: "Name the output quantity." },
      { prompt: "In a simple d.c. motor, electrical energy is converted mainly into mechanical ...", acceptedAnswers: ["motion", "kinetic energy"], hint: "Think of the output form." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Ask what changes in the flux linkage before talking about emf.";
  return [
    mc("What is electromagnetic induction?", ["the production of an emf when magnetic flux changes", "the force on a current-carrying wire in a field", "the heating of a coil by current", "the magnetization of iron by touch"], 0, "Induction is an emf-from-change story.", hint),
    mc("Which situation gives a sustained induced emf in a coil?", ["changing the magnetic flux through the coil", "holding a magnet motionless near the coil", "keeping the flux exactly constant", "disconnecting the coil completely"], 0, "Induction needs change, not just field presence.", hint),
    mc("A bar magnet is held still inside a stationary coil. What is the best conclusion?", ["there is no sustained induced emf because the flux is not changing", "a large steady emf appears because the magnet is strong", "the coil becomes a motor", "the poles of the magnet reverse automatically"], 0, "Still magnet plus still coil gives no changing flux.", hint),
    mc("If a magnet is moved into a coil faster, what happens to the induced emf magnitude?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "Faster flux change gives larger emf.", hint),
    mc("If the number of turns in the coil is increased while the same flux change happens in the same time, the induced emf becomes...", ["larger", "smaller", "unchanged", "zero"], 0, "More turns increase flux linkage change.", hint),
    mc("What happens to the direction of induced emf if the relative motion is reversed?", ["it reverses", "it stays the same", "it becomes stronger only", "it disappears permanently"], 0, "Reverse the change and the induced direction reverses.", hint),
    mc("Which device uses repeated electromagnetic induction to produce electrical output?", ["a generator", "a resistor", "a fuse", "a bar magnet"], 0, "A generator is repeated induction in action.", hint),
    mc("Why does a simple generator produce alternating emf?", ["the changing orientation causes the induced direction to reverse each half-turn", "the current is used up in the coil", "the magnet loses its poles each half-turn", "alternating emf appears only when the wire is heated"], 0, "The induced direction reverses as the rotation continues.", hint),
    mc("Which change can also induce emf even if the magnet itself is fixed?", ["moving or rotating the coil so the flux linkage changes", "painting the coil a different color", "increasing the resistance only with no motion", "making the wire thicker with no flux change"], 0, "Any change in flux linkage can induce emf.", hint),
    mc("What does Lenz's law describe qualitatively?", ["the induced effect acts so as to oppose the change causing it", "the induced emf always increases current in the same direction", "the magnetic field disappears after induction", "current is proportional to resistance"], 0, "Lenz's law is the opposition-to-change idea.", hint),
    ...shortCases([
      { prompt: "A 100-turn coil has its magnetic flux change by 0.020 Wb in 0.10 s. Find the induced emf magnitude.", acceptedAnswers: answers("20", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 50-turn coil has its magnetic flux change by 0.040 Wb in 0.20 s. Find the induced emf magnitude.", acceptedAnswers: answers("10", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 200-turn coil has its magnetic flux change by 0.015 Wb in 0.50 s. Find the induced emf magnitude.", acceptedAnswers: answers("6", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 120-turn coil has its magnetic flux change by 0.015 Wb in 0.10 s. Find the induced emf magnitude.", acceptedAnswers: answers("18", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "An 80-turn coil has its magnetic flux change by 0.025 Wb in 0.25 s. Find the induced emf magnitude.", acceptedAnswers: answers("8", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 60-turn coil has its magnetic flux change by 0.050 Wb in 0.50 s. Find the induced emf magnitude.", acceptedAnswers: answers("6", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 150-turn coil has its magnetic flux change by 0.020 Wb in 0.05 s. Find the induced emf magnitude.", acceptedAnswers: answers("60", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 40-turn coil has its magnetic flux change by 0.010 Wb in 0.02 s. Find the induced emf magnitude.", acceptedAnswers: answers("20", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 300-turn coil has its magnetic flux change by 0.005 Wb in 0.10 s. Find the induced emf magnitude.", acceptedAnswers: answers("15", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
      { prompt: "A 25-turn coil has its magnetic flux change by 0.080 Wb in 0.40 s. Find the induced emf magnitude.", acceptedAnswers: answers("5", "V"), hint: "Use emf = N delta(Phi) / delta(t)." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Keep field presence separate from flux change and from rate of change.";
  return [
    mc("Why is 'there is a magnet nearby' too weak to explain induction?", ["induction requires changing flux linkage, not static field presence alone", "magnets never create any field", "coils cannot respond to magnetic fields", "emf appears only in permanent magnets"], 0, "Presence of field alone is not enough.", hint),
    mc("Which change would most directly increase the induced emf from the same coil?", ["making the flux change happen in a shorter time", "keeping the magnet and coil perfectly still", "removing all turns from the coil", "holding the coil parallel to a constant field forever"], 0, "A larger rate of change gives a larger emf.", hint),
    mc("Why can rotating a coil in a magnetic field induce emf even if the magnet does not move?", ["the flux linkage changes as the coil's orientation changes", "rotation turns the coil into a resistor", "the magnetic field disappears during rotation", "the coil no longer needs turns"], 0, "Changing orientation changes the linked flux.", hint),
    mc("What is the strongest explanation for the output of an a.c. generator?", ["continuous rotation keeps changing the flux linkage and reversing the induced direction periodically", "the current in the generator is used up each half-turn", "the magnet repeatedly loses its poles", "the brushes create voltage without magnetic fields"], 0, "A generator is repeated induction by ongoing flux change.", hint),
    mc("If the same flux change occurs but the coil has twice as many turns, the induced emf should be...", ["twice as large", "half as large", "unchanged", "zero"], 0, "Induced emf is proportional to turn count for the same flux change rate.", hint),
    mc("If the same coil experiences the same flux change in half the time, the induced emf should be...", ["twice as large", "half as large", "unchanged", "zero"], 0, "Induced emf is proportional to the rate of change.", hint),
    mc("What is the best reason a stationary magnet inside a stationary coil does not keep generating emf?", ["the flux linkage is constant, so there is no ongoing change to drive induction", "the magnet is too close to the coil", "the coil has too many turns", "the field lines are crowded"], 0, "No change means no sustained induction.", hint),
    mc("What qualitative prediction does Lenz's law add to Faraday's-law magnitude idea?", ["it gives the direction as opposing the change that produced it", "it removes the need for changing flux", "it proves the emf is always constant", "it says stronger magnets always produce direct current only"], 0, "Lenz adds the direction/opposition logic.", hint),
    mc("Which statement best separates induction from the motor effect?", ["induction creates emf from changing flux, whereas the motor effect gives force on current in a field", "both are exactly the same phenomenon with different words only", "induction needs no magnetic field", "motor effect needs no current"], 0, "These are related but distinct lesson ideas.", hint),
    mc("A coil is pulled out of a magnetic field region more quickly. What happens to the magnitude of the induced emf?", ["it increases because the flux linkage changes more quickly", "it decreases because the field is leaving the coil", "it stays fixed because the number of turns is unchanged", "it becomes zero because the coil is moving"], 0, "Faster change gives larger emf.", hint),
    mc("Which variable matters directly in the school emf formula for induction?", ["number of turns", "mass of the magnet", "color of the wire insulation", "resistance of the compass"], 0, "Turn count enters the flux-linkage formula directly.", hint),
    mc("If the direction of motion of the magnet is reversed, why can the induced emf direction reverse?", ["the flux change itself reverses", "the magnet stops having a field", "the coil loses its turns", "the generator becomes a motor"], 0, "Reversing the change reverses the induced direction.", hint),
    mc("Which statement is strongest about magnetic flux in this lesson?", ["it measures how much magnetic field passes through an area", "it is the same as current", "it is the same as field direction only", "it exists only in iron"], 0, "Flux is the through-an-area field idea.", hint),
    mc("What is the cleanest reason more turns can give a larger generator output?", ["the same flux change is linked by more turns, so the total flux-linkage change is larger", "more turns remove the need for motion", "more turns make the magnetic field disappear", "more turns always reduce resistance to zero"], 0, "Turn count multiplies the flux-linkage change.", hint),
    mc("A student says, 'Strong field means induced emf even if nothing changes.' What is the best correction?", ["a strong field can still give zero sustained emf if the flux linkage stays constant", "all strong fields automatically produce alternating current", "induction depends only on resistance", "motion prevents induction"], 0, "Strength alone is not enough without change.", hint),
    mc("Which lesson sentence is strongest?", ["induction is a rate-of-change story, not a presence-only story", "induction is any magnetic field anywhere", "induction means current destroys flux", "induction works best when nothing moves"], 0, "The change logic is the core lesson meaning.", hint),
    ...shortCases([
      { prompt: "Induction depends on the rate of change of magnetic ...", acceptedAnswers: ["flux", "magnetic flux"], hint: "Name the changing quantity." },
      { prompt: "A generator converts mechanical energy into electrical energy by electromagnetic ...", acceptedAnswers: ["induction"], hint: "State the process." },
      { prompt: "If the magnet and coil stay motionless relative to each other, the sustained induced emf is ...", acceptedAnswers: ["zero", "0", "0 V"], hint: "No flux change means no sustained induction." },
      { prompt: "More turns in the same flux change give a ... induced emf.", acceptedAnswers: ["larger", "greater", "stronger"], hint: "Think flux linkage." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Use turns ratio, ideal power balance, and transmission-current logic together.";
  return [
    mc("Why does a transformer need alternating current in the primary?", ["it needs changing current to produce changing flux in the core", "alternating current removes the need for a core", "direct current gives a larger changing flux", "transformers work only with batteries"], 0, "A transformer needs changing flux, and that comes from changing primary current.", hint),
    mc("What directly links the primary and secondary coils in a transformer?", ["changing magnetic flux in the shared core", "direct charge flow from one coil to the other", "a permanent magnet glued between the coils", "electrons jumping through the air"], 0, "The coils are magnetically linked, not directly connected electrically.", hint),
    mc("Which statement best describes a step-up transformer?", ["it has more turns on the secondary and a larger secondary voltage", "it has fewer turns on the secondary and a smaller secondary voltage", "it raises current and voltage together in the ideal model", "it works only with direct current"], 0, "Step-up means the output voltage is larger than the input voltage.", hint),
    mc("Which statement best describes a step-down transformer?", ["it has fewer turns on the secondary and a lower secondary voltage", "it has more turns on the secondary and a higher secondary voltage", "it keeps voltage fixed but reverses current only", "it works with no changing flux"], 0, "Step-down means the output voltage is smaller than the input voltage.", hint),
    mc("In the ideal transformer model, what is the best power statement?", ["input power is approximately equal to output power", "output power must always be larger than input power", "power disappears in the core completely", "current and voltage both rise together always"], 0, "The ideal model conserves power across the transformer.", hint),
    mc("For the same transmitted power, why does a higher transmission voltage help?", ["it allows a smaller line current", "it forces the line current to increase", "it removes the need for generators", "it turns the transmission line into a permanent magnet"], 0, "Higher voltage means smaller current for the same power.", hint),
    mc("Why does a smaller transmission current reduce cable heating losses?", ["heating losses depend strongly on current, so lower current wastes less energy in the lines", "lower current increases resistance to zero", "lower current removes the need for wires", "heating losses depend only on voltage"], 0, "Transmission efficiency improves because line-current heating falls.", hint),
    mc("Why is it weak to say charge flows from the primary coil into the secondary coil?", ["the two circuits are separate and are linked by changing magnetic flux only", "charge flows directly through the iron core", "the coils touch electrically at one hidden point", "transformers do not contain separate circuits"], 0, "Transformers transfer energy magnetically, not by direct charge transfer between coils.", hint),
    mc("What happens if direct current is used in the primary of a simple transformer after the initial transient?", ["there is no sustained output because the flux stops changing", "the secondary voltage becomes larger and larger", "the transformer becomes a motor automatically", "the turns ratio stops mattering because power becomes infinite"], 0, "No changing flux means no sustained transformed output.", hint),
    mc("If the turns ratio Np:Ns is 100:400, the secondary voltage is...", ["four times the primary voltage", "one quarter of the primary voltage", "equal to the primary voltage", "zero"], 0, "Voltage ratio follows turns ratio in the ideal school model.", hint),
    ...shortCases([
      { prompt: "An ideal transformer has 800 primary turns, 40 secondary turns, and 240 V across the primary. Find the secondary voltage.", acceptedAnswers: answers("12", "V"), hint: "Use Vp / Vs = Np / Ns." },
      { prompt: "An ideal transformer has 200 primary turns, 800 secondary turns, and 12 V across the primary. Find the secondary voltage.", acceptedAnswers: answers("48", "V"), hint: "Use Vp / Vs = Np / Ns." },
      { prompt: "An ideal transformer has 500 primary turns, 100 secondary turns, and 230 V across the primary. Find the secondary voltage.", acceptedAnswers: answers("46", "V"), hint: "Use Vp / Vs = Np / Ns." },
      { prompt: "An ideal transformer changes 120 V to 24 V. If the secondary current is 2.0 A, find the primary current.", acceptedAnswers: answers("0.4", "A", "0.40", "0.40 A"), hint: "Use ideal power balance Vp Ip = Vs Is." },
      { prompt: "An ideal transformer changes 240 V to 12 V. If the secondary current is 3.0 A, find the primary current.", acceptedAnswers: answers("0.15", "A"), hint: "Use ideal power balance Vp Ip = Vs Is." },
      { prompt: "A line transmits 10 kW at 25 kV. Find the line current.", acceptedAnswers: answers("0.4", "A", "0.40", "0.40 A"), hint: "Use P = V I." },
      { prompt: "A line transmits 10 kW at 250 kV. Find the line current.", acceptedAnswers: answers("0.04", "A"), hint: "Use P = V I." },
      { prompt: "A line transmits 5.0 kW at 10 kV. Find the line current.", acceptedAnswers: answers("0.5", "A", "0.50", "0.50 A"), hint: "Use P = V I." },
      { prompt: "A line transmits 5.0 kW at 100 kV. Find the line current.", acceptedAnswers: answers("0.05", "A"), hint: "Use P = V I." },
      { prompt: "An ideal transformer has 200 primary turns, 50 secondary turns, and 120 V across the primary. Find the secondary voltage.", acceptedAnswers: answers("30", "V"), hint: "Use Vp / Vs = Np / Ns." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Do not split turns ratio, ideal power, and transmission logic into separate silos.";
  return [
    mc("Why is 'the primary sends electrons into the secondary' not an acceptable transformer explanation?", ["the coils are separate circuits and energy is transferred by changing flux", "electrons cannot move in copper", "the secondary never has any current", "transformers work only with permanent magnets"], 0, "The transformer link is magnetic, not a direct charge bridge.", hint),
    mc("What is the strongest reason alternating current is required for continuous transformer action?", ["it keeps the core flux changing so emf is induced in the secondary", "it keeps the wire cooler than all direct current", "it makes the number of turns irrelevant", "it removes the need for a shared core"], 0, "Changing primary current keeps the flux changing.", hint),
    mc("Which quantity follows the turns ratio directly in the school transformer model?", ["voltage", "mass", "temperature", "resistance"], 0, "Voltage ratio follows turn ratio.", hint),
    mc("If secondary turns are doubled while primary turns and primary voltage stay fixed, what happens to the ideal secondary voltage?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Voltage is proportional to secondary turns when the primary side is fixed.", hint),
    mc("If an ideal transformer steps voltage up, what happens to current for the same power transfer?", ["it steps down", "it also steps up", "it stays the same", "it becomes undefined"], 0, "In the ideal model, current changes oppositely to voltage for the same power.", hint),
    mc("Why is it not enough to quote only Vp / Vs = Np / Ns when discussing power transmission?", ["you also need P = V I to explain why higher voltage reduces current for the same power", "turns ratio already tells you the cable temperature directly", "power transmission ignores current completely", "voltage ratio works only for direct current"], 0, "Transmission logic needs the power equation too.", hint),
    mc("What is the best reason high-voltage transmission lowers line losses?", ["lower current gives lower resistive heating in the cables", "higher voltage removes all resistance from the wires", "higher voltage creates energy in the lines", "lower current means the power transmitted becomes zero"], 0, "Transmission loss falls because current falls.", hint),
    mc("A student says, 'Use a step-down transformer before the long cables to make the current small.' What is the correction?", ["you step up before long-distance transmission to reduce current, then step down near the user", "step-down transformers always reduce current and losses in every case", "transformers are never used in transmission", "step-up and step-down mean the same thing"], 0, "The grid uses high voltage on the transmission line, then lowers it for use.", hint),
    mc("What happens to the secondary output of a simple transformer after direct current in the primary settles to a steady value?", ["the sustained output falls to zero", "the output keeps rising indefinitely", "the output becomes alternating automatically", "the output equals the primary current"], 0, "Once the flux stops changing, sustained induction stops.", hint),
    mc("Which statement best matches an ideal step-up transformer?", ["secondary voltage is larger, secondary current is smaller, and power is approximately conserved", "secondary voltage and current are both larger with no power change", "secondary voltage is smaller and current is smaller", "secondary voltage is larger because electrons cross from primary to secondary"], 0, "Ideal step-up raises voltage and lowers current for the same power.", hint),
    mc("Which statement best matches an ideal step-down transformer?", ["secondary voltage is smaller, secondary current is larger, and power is approximately conserved", "secondary voltage is larger and current is smaller", "secondary current is always zero", "step-down action works only with direct current"], 0, "Ideal step-down lowers voltage and raises current for the same power.", hint),
    mc("Why can the same transmitted power be carried with a much smaller current at a higher voltage?", ["because P = V I, so larger V allows smaller I for the same P", "because turns ratio removes the need for current", "because voltage and current must always rise together", "because line resistance becomes zero at high voltage"], 0, "The power equation makes the transmission argument quantitative.", hint),
    mc("Which explanation best links the primary and secondary in a transformer?", ["changing primary current -> changing core flux -> induced secondary emf", "primary current -> direct electron transfer -> secondary current", "secondary voltage -> primary current -> no core needed", "core resistance -> voltage drop -> current split"], 0, "The causal chain runs through changing core flux.", hint),
    mc("Why is it wrong to think the core itself is the electrical output source?", ["the core provides the changing magnetic link, but the emf appears in the secondary coil", "the core is the battery inside the transformer", "the core creates current without any primary input", "the core replaces the turns ratio"], 0, "The core links the circuits magnetically; it is not the output source.", hint),
    mc("A line must carry 20 kW. Which option gives the smaller line current?", ["200 kV rather than 20 kV", "20 kV rather than 200 kV", "both give the same current", "current cannot be compared without resistance only"], 0, "For the same power, higher transmission voltage means lower current.", hint),
    mc("Why should the final household supply usually be stepped down again after long-distance transmission?", ["end-user devices need a safer, lower voltage even though the grid benefited from high-voltage transmission", "lower voltage always improves long-distance transmission", "step-down action removes the need for current", "high voltage is needed at every final socket"], 0, "Transmission and end use have different voltage needs.", hint),
    ...shortCases([
      { prompt: "For ideal transformers, input power is approximately equal to output ...", acceptedAnswers: ["power"], hint: "State the conserved quantity in the simple model." },
      { prompt: "A transformer raises voltage for transmission so that the line current can be ...", acceptedAnswers: ["smaller", "lower"], hint: "Use P = V I." },
      { prompt: "The input coil of a transformer is called the ... coil.", acceptedAnswers: ["primary"], hint: "Name the source-side coil." },
      { prompt: "The output coil of a transformer is called the ... coil.", acceptedAnswers: ["secondary"], hint: "Name the load-side coil." },
    ]),
  ];
}

function l1MasteryRaw(): RawItem[] {
  return [...l1DiagnosticRaw(), ...l1ConceptRaw()];
}

function l2MasteryRaw(): RawItem[] {
  return [...l2DiagnosticRaw(), ...l2ConceptRaw()];
}

function l3MasteryRaw(): RawItem[] {
  return [...l3DiagnosticRaw(), ...l3ConceptRaw()];
}

function l4MasteryRaw(): RawItem[] {
  return [...l4DiagnosticRaw(), ...l4ConceptRaw()];
}

function l5MasteryRaw(): RawItem[] {
  return [...l5DiagnosticRaw(), ...l5ConceptRaw()];
}

function l6MasteryRaw(): RawItem[] {
  return [...l6DiagnosticRaw(), ...l6ConceptRaw()];
}

const M10_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  M10_L1: l1DiagnosticRaw,
  M10_L2: l2DiagnosticRaw,
  M10_L3: l3DiagnosticRaw,
  M10_L4: l4DiagnosticRaw,
  M10_L5: l5DiagnosticRaw,
  M10_L6: l6DiagnosticRaw,
};

const M10_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  M10_L1: l1ConceptRaw,
  M10_L2: l2ConceptRaw,
  M10_L3: l3ConceptRaw,
  M10_L4: l4ConceptRaw,
  M10_L5: l5ConceptRaw,
  M10_L6: l6ConceptRaw,
};

const M10_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  M10_L1: l1MasteryRaw,
  M10_L2: l2MasteryRaw,
  M10_L3: l3MasteryRaw,
  M10_L4: l4MasteryRaw,
  M10_L5: l5MasteryRaw,
  M10_L6: l6MasteryRaw,
};

export function m10GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M10_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function m10GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M10_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function m10GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M10_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
