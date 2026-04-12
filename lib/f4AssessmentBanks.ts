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
    throw new Error(`F4 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function currentAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "A"), numericAnswers(value, "a"));
}

function chargeAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "C"), numericAnswers(value, "c"));
}

function voltageAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "V"), numericAnswers(value, "v"));
}

function energyAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "J"), numericAnswers(value, "j"));
}

function resistanceAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "ohm"), numericAnswers(value, "ohms"), [formatNumber(value)]);
}

function powerAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "W"), numericAnswers(value, "w"));
}

function timeAnswers(value: number): string[] {
  return numericAnswers(value, "s");
}

function zeroAnswers(unit?: string): string[] {
  return unit ? words("0", `0 ${unit}`, "zero") : words("0", "zero");
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep charge flow rate separate from energy transfer at a component.";
  return [
    mc("In one closed single-loop circuit, how does the current after a lamp compare with the current before it?", ["it is the same", "it is smaller because the lamp uses some current", "it is larger because the lamp adds current", "it is zero after the lamp"], 0, "A one-route loop carries one common charge flow rate at every checkpoint.", hint),
    mc("What does current measure in a circuit?", ["charge passing a point each second", "energy transferred to each charge", "difficulty of the path", "total energy stored in the battery"], 0, "Current is a rate of charge flow.", hint),
    mc("Why can a lamp get hot even though the current is the same before and after it?", ["It transfers electrical energy while the same charge keeps moving", "It creates extra charge inside the filament", "It stores current and releases it later", "It removes charge from the circuit"], 0, "The lamp changes energy, not the continuity of charge flow.", hint),
    mc("If a switch opens anywhere in one simple loop, what happens to the current?", ["It stops everywhere in the loop", "It stops only after the switch", "It doubles before the switch", "It keeps flowing through the lamp"], 0, "Breaking the only route stops the whole circulation.", hint),
    mc("Two loops move the same 12 C of charge. Loop A takes 3 s and Loop B takes 6 s. Which loop has the greater current?", ["Loop A", "Loop B", "both have the same current", "you need the voltage first"], 0, "Current compares the same charge with the time taken.", hint),
    mc("What is the unit of current?", ["ampere", "volt", "joule", "ohm"], 0, "Current is measured in amperes.", hint),
    mc("What must a circuit have for a steady current to continue flowing?", ["a complete conducting loop", "two different lamps", "a resistor in every branch", "a current that changes direction"], 0, "A sustained current needs a closed route.", hint),
    mc("If the same charge passes a checkpoint in half the time, what happens to the current?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Current is charge divided by time.", hint),
    mc("What does a current of 0.4 A mean?", ["0.4 C passes a point each second", "0.4 J is transferred each second", "0.4 C is stored in the lamp", "0.4 ohm of resistance is present"], 0, "An ampere means coulomb per second.", hint),
    mc("At which point in a simple steady loop is the current largest?", ["it is the same at every point", "just after the cell", "inside the lamp only", "just before the switch"], 0, "One-route steady flow means one common current.", hint),
    mc("If the cell is removed so the route is no longer complete, the current is...", ["zero everywhere", "larger near the wires", "the same as before", "shared unequally"], 0, "Without a complete route, there is no sustained current.", hint),
    mc("Two lamps are connected one after another in a single loop. How do their currents compare?", ["the same through both lamps", "larger through the first lamp", "larger through the second lamp", "zero through the second lamp"], 0, "The one-route current is common to the whole loop.", hint),
    shortCases([
      { prompt: "18 C of charge pass a checkpoint in 6 s. What current flows?", acceptedAnswers: currentAnswers(3), hint: "Use I = Q / t." },
      { prompt: "A current of 0.8 A flows for 10 s. How much charge passes?", acceptedAnswers: chargeAnswers(8), hint: "Use Q = It." },
      { prompt: "45 C of charge pass when the current is 5 A. How long does it take?", acceptedAnswers: timeAnswers(9), hint: "Rearrange I = Q / t to find time." },
      { prompt: "A current of 2.5 A flows for 4 s. How much charge passes?", acceptedAnswers: chargeAnswers(10), hint: "Multiply current by time." },
      { prompt: "0.4 C of charge pass a point each second. What current is that?", acceptedAnswers: currentAnswers(0.4), hint: "Current is charge per second." },
      { prompt: "30 C of charge pass in 15 s. What current flows?", acceptedAnswers: currentAnswers(2), hint: "Divide charge by time." },
      { prompt: "Current is the rate of charge ... in a circuit.", acceptedAnswers: words("flow", "flowing"), hint: "Think about what passes a point each second." },
      { prompt: "If the switch opens in a simple loop, the current everywhere becomes ...", acceptedAnswers: zeroAnswers("A"), hint: "An open loop stops the current completely." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the difference between moving charge and transferred energy.";
  return [
    mc("Why is the statement 'the lamp uses up current' wrong?", ["The same charge keeps circulating while the lamp transfers energy", "Lamps always increase the current", "Current only exists inside the cell", "Current turns directly into resistance"], 0, "The lamp changes the energy carried by charge, not whether charge continues round the loop.", hint),
    mc("Why is the current the same before and after a device in one simple steady loop?", ["The same charge flow rate passes every point on the single route", "The device creates charge after itself", "The battery inserts extra current after each device", "The resistor stores the missing current"], 0, "A single loop does not let charge disappear between checkpoints.", hint),
    mc("Why does opening the switch anywhere stop the current everywhere?", ["The only conducting route is broken", "The battery loses all its charge instantly", "The lamp blocks current only after the switch", "The current changes into voltage"], 0, "A simple loop works only while the route stays complete.", hint),
    mc("Which statement best keeps current and charge separate?", ["Current is charge flow rate, while charge is the amount moved", "Current and charge mean exactly the same thing", "Charge is energy per coulomb, while current is total energy", "Current is measured in coulombs, while charge is measured in amperes"], 0, "Current is the rate; charge is the quantity that passes.", hint),
    mc("Why can a device still work even though the same charge keeps circulating?", ["The device transfers energy from the moving charge to light, heat, or motion", "The device destroys some of the charge to do work", "The charge stops permanently inside the device", "The battery replaces the missing charge each second"], 0, "Useful transfer comes from energy changes, not charge loss.", hint),
    mc("A student says there should be more current near the cell because the cell starts the flow. What is the best correction?", ["In one steady loop the current is the same all around the route", "The current is largest only in the wires closest to the switch", "Current builds up slowly as it goes around the loop", "The lamp always sends back less current than it receives"], 0, "The cell provides the push, but the steady current is common to the whole path.", hint),
    mc("Why is a broken circuit not just a circuit with smaller current?", ["Because the complete route condition has failed, so sustained current is zero", "Because the voltage becomes larger automatically", "Because the lamp now stores current", "Because charge can no longer exist in the wires"], 0, "An incomplete route does not merely reduce current; it stops it.", hint),
    mc("Which comparison is correct for a one-route loop?", ["Current stays the same, but energy carried by the charge can change at components", "Current changes, but energy carried by the charge must stay fixed", "Current and voltage are both identical across every component", "Charge disappears wherever a lamp glows"], 0, "The key contrast is steady flow with changing energy transfer.", hint),
    mc("Why does a larger current mean more charge passes each second?", ["Because current is defined as charge divided by time", "Because current is the total energy in the battery", "Because current measures resistance", "Because current means the same thing as voltage"], 0, "Return to the definition, not just the unit name.", hint),
    mc("What is the main error in saying that current gets weaker after a resistor because charges get tired?", ["It confuses energy transfer with loss of charge flow in a single route", "It treats voltage as a unit of current", "It assumes charge is measured in ohms", "It ignores that batteries have no role in circuits"], 0, "Components may reduce the electrical energy per charge, but not the one-route current.", hint),
    mc("Why is current described as a rate quantity?", ["It tells how much charge passes a point in each second", "It tells how much energy each charge has", "It tells how long the battery lasts", "It tells how difficult the route is"], 0, "Current answers a per-second question.", hint),
    mc("If two points in the same simple steady loop had different currents, what would that suggest?", ["The single-route steady-circuit model has been broken or misread", "The voltage must be zero", "The lamp has created extra charge", "The battery has doubled its emf"], 0, "Different steady currents at different checkpoints do not fit one simple loop.", hint),
    mc("Which statement best explains why current is not 'used up' by a lamp?", ["The lamp transfers energy from the moving charge but the charge continues around the loop", "The lamp sends charge back to the battery only when cold", "The lamp stores all the current temporarily", "The lamp changes current into resistance"], 0, "This keeps charge conservation and energy transfer in the right roles.", hint),
    mc("Why is 'charge per second' a better clue for current than 'energy per charge'?", ["Because current is about how much charge passes each second, while energy per charge describes potential difference", "Because current is measured in joules", "Because current and potential difference are interchangeable", "Because charge per second tells you the resistance"], 0, "Do not swap the meanings of the two electrical quantities.", hint),
    shortCases([
      { prompt: "The electrical quantity that means charge flow each second is ...", acceptedAnswers: words("current", "electric current"), hint: "It is measured in amperes." },
      { prompt: "In one steady simple loop, the current is the ... at every point.", acceptedAnswers: words("same"), hint: "There is one common flow rate in a one-route circuit." },
      { prompt: "A lamp in a circuit transfers electrical ... from the moving charge.", acceptedAnswers: words("energy"), hint: "This is why it can heat up or emit light." },
      { prompt: "If the route is broken, the sustained current becomes ...", acceptedAnswers: zeroAnswers("A"), hint: "No complete route means no steady current." },
      { prompt: "The compact relation linking current, charge, and time is ...", acceptedAnswers: words("I = Q / t", "I=Q/t"), hint: "Think flow rate equals amount divided by time." },
      { prompt: "If the same charge takes longer to pass, the current becomes ...", acceptedAnswers: words("smaller", "lower", "less"), hint: "Charge per second falls when the time is larger." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep energy per charge separate from total charge moved.";
  return [
    mc("What does potential difference measure?", ["energy transferred per coulomb", "charge passing each second", "difficulty of the circuit path", "total energy stored in the device"], 0, "Potential difference compares energy transfer with charge.", hint),
    mc("What does 1 V mean exactly?", ["1 J transferred to each coulomb", "1 C transferred each second", "1 ohm of resistance", "1 J transferred in total"], 0, "A volt is a joule per coulomb.", hint),
    mc("If the same charge passes through a source with a larger potential difference, what changes?", ["each coulomb gains more energy", "more charge must exist", "the resistance becomes zero", "the current must stop"], 0, "Potential difference tells the energy transfer for each coulomb.", hint),
    mc("If the potential difference stays the same but twice as much charge moves, what happens to the total energy transferred?", ["it doubles", "it stays the same", "it halves", "it becomes zero"], 0, "Total energy depends on both voltage and charge.", hint),
    mc("A source gives each coulomb 6 J of energy. What is its potential difference?", ["6 V", "6 A", "6 ohm", "6 C"], 0, "Match joules per coulomb to volts.", hint),
    mc("Which unit is used for potential difference?", ["volt", "ampere", "joule", "watt"], 0, "Potential difference is measured in volts.", hint),
    mc("What is the best interpretation of a 12 V battery?", ["each coulomb gains 12 J of energy", "12 C pass each second", "12 J are transferred whatever the charge", "the battery has 12 ohm resistance"], 0, "Voltage is energy per coulomb, not total energy or current.", hint),
    mc("If two sources move the same charge, which source transfers more total energy?", ["the one with the larger potential difference", "the one with the smaller potential difference", "both transfer the same energy", "you cannot compare unless the current is known"], 0, "For the same charge, higher voltage means more energy transfer.", hint),
    mc("Which relation links energy transferred, charge, and potential difference?", ["E = VQ", "Q = E / t", "R = V / I", "P = VI"], 0, "Total energy transferred equals voltage times charge.", hint),
    mc("Which statement is correct?", ["Potential difference is energy per charge, not the amount of charge itself", "Potential difference tells charge per second", "Potential difference is the same thing as current", "Potential difference is stored inside the lamp"], 0, "Protect the meaning of voltage.", hint),
    shortCases([
      { prompt: "20 J are transferred to 4 C of charge. What is the potential difference?", acceptedAnswers: voltageAnswers(5), hint: "Use V = E / Q." },
      { prompt: "A source of 6 V moves 3 C of charge. How much energy is transferred?", acceptedAnswers: energyAnswers(18), hint: "Use E = VQ." },
      { prompt: "24 J are transferred to 8 C of charge. What is the potential difference?", acceptedAnswers: voltageAnswers(3), hint: "Energy per charge gives voltage." },
      { prompt: "A 9 V source moves 2 C of charge. How much energy is transferred?", acceptedAnswers: energyAnswers(18), hint: "Multiply volts by coulombs." },
      { prompt: "12 J are transferred by a source of 2 V. How much charge moved?", acceptedAnswers: chargeAnswers(6), hint: "Rearrange E = VQ." },
      { prompt: "A 4 V source moves 0.5 C of charge. How much energy is transferred?", acceptedAnswers: energyAnswers(2), hint: "Multiply potential difference by charge." },
      { prompt: "Potential difference is energy transferred per ...", acceptedAnswers: words("charge", "coulomb"), hint: "Think of the amount each coulomb gains or loses." },
      { prompt: "36 J are transferred to 3 C of charge. What is the potential difference?", acceptedAnswers: voltageAnswers(12), hint: "Divide energy by charge." },
      { prompt: "A source of 1.5 V moves 5 C of charge. How much energy is transferred?", acceptedAnswers: energyAnswers(7.5), hint: "Use E = VQ even with a decimal voltage." },
      { prompt: "The compact relation linking voltage, energy, and charge is ...", acceptedAnswers: words("V = E / Q", "V=E/Q"), hint: "Voltage is energy per charge." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the difference between energy per charge and total energy transferred.";
  return [
    mc("Why does a larger potential difference mean each coulomb leaves the source with more energy?", ["Voltage is defined as energy transferred per unit charge", "Voltage measures total charge in the wires", "Voltage is the same thing as current", "Voltage removes the need for energy calculations"], 0, "The definition is the key idea here.", hint),
    mc("Why does moving more charge at the same potential difference increase total energy transferred?", ["The same energy is transferred to each coulomb, so more coulombs mean more total energy", "More charge makes the voltage larger automatically", "Current and voltage become the same", "Resistance must fall to zero"], 0, "Keep per-coulomb energy separate from total amount of charge.", hint),
    mc("A student says a 12 V battery contains 12 C of charge. What is the best correction?", ["12 V means 12 J are transferred to each coulomb, not that the battery contains 12 C", "12 V means 12 C pass each second", "12 V means the battery has 12 ohm resistance", "12 V means only 12 J can ever be transferred"], 0, "Voltage tells a per-coulomb energy story.", hint),
    mc("Why can total energy transfer rise even if potential difference stays unchanged?", ["Because more charge may pass through the source or component", "Because voltage always turns into current", "Because potential difference is irrelevant", "Because resistance disappears over time"], 0, "Total energy depends on both V and Q.", hint),
    mc("Which statement best compares current and potential difference?", ["Current is charge per second, while potential difference is energy per charge", "Current is energy per charge, while potential difference is total charge", "Both describe exactly the same thing", "Both are measured in amperes"], 0, "Do not swap the meanings of these two quantities.", hint),
    mc("Why is a volt the same as a joule per coulomb?", ["Because voltage is defined by energy transferred divided by charge", "Because a joule and a coulomb are the same unit", "Because charge is measured in volts", "Because voltage does not involve energy"], 0, "The unit identity comes straight from the definition.", hint),
    mc("Why is it wrong to treat voltage as 'how much charge is moving'?", ["Charge moved is a different quantity; voltage tells how much energy each coulomb gains or loses", "Voltage is always equal to current", "Voltage only exists in parallel circuits", "Charge cannot move when voltage is present"], 0, "Potential difference and current answer different questions.", hint),
    mc("Two sources move the same 5 C of charge. Source A is 3 V and Source B is 9 V. Why does Source B transfer more total energy?", ["Each coulomb receives more energy from Source B", "Source B must move more charge", "Source B has no resistance", "Source B converts current into charge"], 0, "Same charge with greater energy per charge gives greater total energy.", hint),
    mc("Why can the same charge keep circulating in a circuit even though the potential difference across components changes?", ["Because the energy carried by each coulomb can change without changing the identity of the charge itself", "Because charge is destroyed and recreated at each component", "Because voltage and charge are unrelated to energy", "Because current stops whenever voltage changes"], 0, "This keeps the circuit story internally consistent.", hint),
    mc("What common mistake is this lesson trying to prevent?", ["Treating total energy transferred and energy transferred per charge as the same thing", "Treating charge as a vector", "Treating resistance as a unit of power", "Treating amperes as a measure of force"], 0, "Voltage is not the same as total energy.", hint),
    mc("Why is 'more voltage means more current' not automatically safe as a rule on its own?", ["Current also depends on resistance, so voltage alone does not fix the current", "Voltage never affects current", "Current determines voltage completely", "Voltage matters only in series circuits"], 0, "This lesson defines voltage first; current-response comes with resistance.", hint),
    mc("Why is it useful to read voltage as 'energy boost per coulomb' at a source?", ["It keeps the source story tied to how much energy each charge packet receives", "It proves all circuits have the same current", "It means charge is stored in the cell forever", "It shows resistance is unimportant"], 0, "The per-coulomb picture is the clean conceptual anchor.", hint),
    mc("A learner says total energy transferred and potential difference must rise together. What is missing from that claim?", ["The amount of charge moved also matters", "Potential difference has no units", "Current cannot be measured", "Resistance is the only electrical quantity"], 0, "Energy transfer is a two-variable relationship.", hint),
    mc("Why is a component's potential difference linked to energy transfer in that component?", ["Because the moving charge loses or gains a certain amount of energy per coulomb there", "Because the component stores all the current", "Because current disappears inside the component", "Because resistance and voltage are identical"], 0, "Potential difference is about energy change per charge at that part of the circuit.", hint),
    shortCases([
      { prompt: "The electrical quantity that means energy transferred per charge is ...", acceptedAnswers: words("potential difference", "voltage"), hint: "It is measured in volts." },
      { prompt: "If the voltage stays the same but more charge passes, the total energy transferred ...", acceptedAnswers: words("increases", "gets larger", "rises"), hint: "More coulombs each getting the same energy gives more total energy." },
      { prompt: "If the same charge passes through a larger voltage, each coulomb gains ... energy.", acceptedAnswers: words("more"), hint: "Voltage compares energy with each coulomb." },
      { prompt: "The compact relation linking total energy, voltage, and charge is ...", acceptedAnswers: words("E = VQ", "E=VQ"), hint: "Total energy transfer comes from voltage times charge." },
      { prompt: "One volt equals one joule per ...", acceptedAnswers: words("coulomb", "charge"), hint: "Think of the unit definition." },
      { prompt: "The compact relation that defines potential difference from energy per charge is ...", acceptedAnswers: words("V = E / Q", "V=E/Q"), hint: "Voltage means energy divided by charge." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep source push, current response, and path difficulty in separate roles.";
  return [
    mc("In the Flow-Grid model, what does resistance represent?", ["stored charge", "how hard the path is for charge to move through", "energy per charge at the source", "how long the battery lasts"], 1, "Resistance is the route difficulty, not stored charge or battery lifetime.", hint),
    mc("If the same voltage acts across two resistors, which resistor gives the larger current?", ["the one with higher resistance", "the one with lower resistance", "both must give the same current", "the one with the larger battery"], 1, "At the same push, the easier path gives the larger current.", hint),
    mc("If the same voltage acts across two resistors and one gives less current, what must be true?", ["it has lower resistance", "it has higher resistance", "it has zero resistance", "it has higher charge"], 1, "Less current at the same voltage means the path is harder.", hint),
    mc("What does a straight I-V graph through the origin show for an ohmic resistor?", ["current is proportional to voltage", "resistance is being used up", "current stays fixed while voltage changes", "voltage depends on time only"], 0, "A straight line through the origin shows a directly proportional response.", hint),
    mc("Which straight I-V line shows the greater resistance?", ["the flatter line", "the steeper line", "both show the same resistance", "you cannot compare them"], 0, "Less current per volt means a higher resistance.", hint),
    mc("If the voltage across the same ohmic resistor doubles, what happens to the current?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "For a fixed ohmic resistance, current changes in direct proportion to voltage.", hint),
    mc("What is the unit of resistance?", ["ohm", "ampere", "volt", "joule"], 0, "Resistance is measured in ohms.", hint),
    mc("Which relation links current, voltage, and resistance for an ohmic resistor?", ["I = V / R", "V = I / R", "R = VI", "P = VI"], 0, "Current equals push divided by path difficulty.", hint),
    mc("If the resistance rises while the voltage stays the same, what happens to the current?", ["it rises", "it falls", "it stays the same", "it becomes the voltage"], 1, "A harder path gives a smaller current at the same voltage.", hint),
    mc("Which statement is correct?", ["Resistance tells path difficulty, while current tells charge flow rate", "Resistance is a second kind of current", "Current is energy per charge", "Voltage is the same as resistance"], 0, "These quantities do different jobs in the circuit story.", hint),
    shortCases([
      { prompt: "A 12 V supply is connected across a 4 ohm resistor. What current flows?", acceptedAnswers: currentAnswers(3), hint: "Use I = V / R." },
      { prompt: "A resistor has 6 V across it and a current of 2 A. What is its resistance?", acceptedAnswers: resistanceAnswers(3), hint: "Use R = V / I." },
      { prompt: "A resistor has 9 V across it and a current of 3 A. What is its resistance?", acceptedAnswers: resistanceAnswers(3), hint: "Divide voltage by current." },
      { prompt: "A 10 V supply is connected across a 5 ohm resistor. What current flows?", acceptedAnswers: currentAnswers(2), hint: "Current is voltage divided by resistance." },
      { prompt: "A resistor carries 0.5 A when the voltage is 10 V. What is its resistance?", acceptedAnswers: resistanceAnswers(20), hint: "Use R = V / I." },
      { prompt: "A 4 ohm resistor has 2 V across it. What current flows?", acceptedAnswers: currentAnswers(0.5), hint: "Use I = V / R." },
      { prompt: "An ohmic component has a straight I-V graph through the ...", acceptedAnswers: words("origin"), hint: "The straight line starts from zero voltage and zero current." },
      { prompt: "If resistance doubles while voltage stays the same, the current ...", acceptedAnswers: words("halves"), hint: "Current is inversely related to resistance." },
      { prompt: "The quantity that represents path difficulty in a circuit is ...", acceptedAnswers: words("resistance"), hint: "It is measured in ohms." },
      { prompt: "The compact relation that defines resistance from voltage and current is ...", acceptedAnswers: words("R = V / I", "R=V/I"), hint: "Rearrange Ohm's law to make resistance the subject." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the roles of voltage, current, resistance, and I-V graph slope.";
  return [
    mc("Why does a steeper straight I-V graph slope mean lower resistance?", ["More current flows for each volt", "Voltage disappears faster", "The resistor stores more charge", "Steeper lines always mean larger resistance"], 0, "A steeper response means the current rises more easily with voltage.", hint),
    mc("Why is it wrong to say resistance is a kind of current?", ["Resistance describes opposition to flow, while current describes the rate of flow", "Resistance has no unit", "Current only exists in batteries", "Resistance is measured in coulombs"], 0, "These are different physical roles, not two names for the same thing.", hint),
    mc("Why does doubling the voltage across the same ohmic resistor double the current?", ["The current is proportional to voltage when the resistance is unchanged", "The resistor loses half its resistance", "The charge becomes heavier", "The graph stops passing through the origin"], 0, "For an ohmic resistor, the response to voltage is regular.", hint),
    mc("If two resistors carry the same current but one needs a larger voltage, what does that tell you?", ["It has the larger resistance", "It has the smaller resistance", "They must have equal resistance", "It has no resistance"], 0, "At the same current, needing more voltage means more opposition.", hint),
    mc("Why does a flatter straight I-V line represent higher resistance?", ["It gives less current for each volt", "It shows voltage without current", "It means the component is a battery", "It proves resistance is zero"], 0, "The flatter line is a weaker current response to the same push.", hint),
    mc("What common mistake is this lesson trying to prevent with I-V graphs?", ["Assuming a steeper line means more resistance", "Assuming voltage can be measured in amperes", "Assuming resistors store current", "Assuming batteries have no voltage"], 0, "The slope meaning is the trap students often invert.", hint),
    mc("Why is current not fixed by voltage alone?", ["Resistance also controls how strongly the current responds to the voltage", "Because current and voltage are unrelated", "Because resistance is always zero", "Because charge cannot move when voltage exists"], 0, "Push alone does not determine the stream rate; path difficulty matters too.", hint),
    mc("Why is a straight line through the origin important for an ohmic component?", ["It shows the current changes in direct proportion to voltage", "It shows the resistor is using up current", "It shows voltage is stored at the origin", "It shows time is the only variable"], 0, "The graph shape matches the regular Ohm's-law relationship.", hint),
    mc("A learner says 'higher resistance means more current because the number is larger.' What is the best correction?", ["Higher resistance means the path is harder, so the current is smaller at the same voltage", "Higher resistance only changes the unit, not the current", "Current and resistance always rise together", "The larger number must always be the larger current"], 0, "The numerical size of resistance does not act like the size of current.", hint),
    mc("Why is the Flow-Grid phrase 'stream rate = push / path difficulty' a good bridge to Ohm's law?", ["It maps directly onto current = voltage / resistance", "It proves current and voltage are identical", "It removes the need for equations", "It shows resistance is optional"], 0, "The analogy preserves the structure of the formal relation.", hint),
    mc("If a resistor gives less current at the same voltage, why does that not mean the battery is weaker?", ["The resistor itself is offering more opposition to charge flow", "Any smaller current means the voltage must be zero", "Current tells you nothing about the resistor", "The battery must have changed its unit"], 0, "Hold the source push fixed and compare only the path difficulty.", hint),
    mc("Why can resistance stay constant in an ohmic resistor while voltage and current both change?", ["Resistance is the ratio that links them for that component under those conditions", "Because resistance turns into voltage", "Because current is stored in the graph", "Because only the battery changes"], 0, "Ohmic behavior is about a steady ratio and a straight-line graph.", hint),
    mc("Why is 'more voltage means more resistance' an unsafe rule?", ["Resistance is a property of the component, while voltage is the push across it", "Voltage and resistance always have the same value", "Voltage is measured in ohms", "Resistance only exists when voltage is zero"], 0, "Do not merge source push with component property.", hint),
    mc("Which statement best links graph language and circuit language?", ["A steeper straight I-V graph means an easier route and therefore lower resistance", "A steeper straight I-V graph means a harder route and therefore higher resistance", "A flatter I-V graph means no resistance", "The graph slope has nothing to do with resistance"], 0, "The graph and the circuit story must tell the same resistance story.", hint),
    shortCases([
      { prompt: "For an ohmic component, current is proportional to ...", acceptedAnswers: words("voltage", "potential difference"), hint: "The I-V graph is a straight line through the origin." },
      { prompt: "If the path becomes harder at the same push, the current becomes ...", acceptedAnswers: words("smaller", "lower", "less"), hint: "Greater resistance gives less current." },
      { prompt: "If the voltage is the same and the current is smaller, the resistance is ...", acceptedAnswers: words("higher", "larger", "greater"), hint: "Less current at the same push means a harder route." },
      { prompt: "The compact relation linking current, voltage, and resistance is ...", acceptedAnswers: words("I = V / R", "I=V/R"), hint: "Current equals push divided by path difficulty." },
      { prompt: "A steeper straight I-V line means ... resistance.", acceptedAnswers: words("lower", "less", "smaller"), hint: "More current per volt means easier flow." },
      { prompt: "The quantity that opposes charge flow in a circuit is ...", acceptedAnswers: words("resistance"), hint: "It is the path difficulty." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Series circuits are one-route networks: same current, shared voltage.";
  return [
    mc("In a series circuit, how does the current in one component compare with the current in the next component?", ["it is the same", "it is always larger", "it is always smaller", "it becomes zero in the second component"], 0, "One route means one shared current through every component.", hint),
    mc("What happens to total resistance when resistors are added in series?", ["it decreases", "it stays the same", "it adds up", "it becomes zero"], 2, "Series route difficulties stack along the same path.", hint),
    mc("If another resistor is added in series to the same battery, what happens to the current everywhere in the loop?", ["it increases everywhere", "it decreases everywhere", "it stays the same everywhere", "it changes only after the new resistor"], 1, "Making the one route harder reduces the current through the whole loop.", hint),
    mc("Two equal resistors are connected in series across one battery. How is the battery voltage shared?", ["equally between the resistors", "all across the first resistor", "all across the second resistor", "voltage is not shared in series"], 0, "Equal resistors in series take equal shares of the supply voltage.", hint),
    mc("What happens to the whole series circuit if one lamp breaks and opens the path?", ["only the broken lamp turns off", "current keeps flowing around the rest of the loop", "the whole loop stops", "the battery doubles the voltage"], 2, "A series circuit needs one complete route.", hint),
    mc("Two resistors of different sizes are connected in series. Which resistor has the larger potential difference across it?", ["the larger resistor", "the smaller resistor", "they must always be equal", "you cannot compare voltages in series"], 0, "The harder section of the route takes a larger share of the voltage.", hint),
    mc("Which statement best describes a series circuit?", ["There is one complete route, the same current passes every component, and the supply voltage is shared", "There are several routes and current splits equally", "Each component gets the full supply voltage automatically", "The battery sends different currents to different parts"], 0, "A series circuit is defined by one route with common current.", hint),
    mc("Why are two identical lamps in series usually dimmer than one lamp on the same battery?", ["They share the supply voltage and the current is lower", "Potential difference cannot exist in series", "Each lamp creates extra current", "The battery increases its voltage automatically"], 0, "Both the shared voltage and the reduced current make each lamp dimmer.", hint),
    mc("Which quantity is shared across components in a series circuit?", ["potential difference from the supply", "current in each branch", "resistance of the battery only", "charge stored in the lamp"], 0, "The supply voltage is split across the components in the one route.", hint),
    mc("Three resistors of 2 ohm, 3 ohm, and 5 ohm are connected in series. What is the total resistance?", ["5 ohm", "8 ohm", "10 ohm", "30 ohm"], 2, "Add the resistances in series.", hint),
    shortCases([
      { prompt: "A 2 ohm resistor and a 3 ohm resistor are connected in series. What is the total resistance?", acceptedAnswers: resistanceAnswers(5), hint: "Add the series resistances." },
      { prompt: "A 12 V supply is connected to a series circuit with total resistance 4 ohm. What current flows?", acceptedAnswers: currentAnswers(3), hint: "Use I = V / R_total." },
      { prompt: "A 6 V supply is shared across two equal resistors in series. What potential difference is across each resistor?", acceptedAnswers: voltageAnswers(3), hint: "Equal series resistors share the supply voltage equally." },
      { prompt: "Three 2 ohm resistors are connected in series. What is the total resistance?", acceptedAnswers: resistanceAnswers(6), hint: "Add all the series resistances." },
      { prompt: "In a series circuit, the quantity that stays the same through every component is ...", acceptedAnswers: words("current"), hint: "One route means one current." },
      { prompt: "In a series circuit, the source potential difference is ... between the components.", acceptedAnswers: words("shared", "split"), hint: "The supply voltage is divided across the route sections." },
      { prompt: "A 4 ohm resistor and an 8 ohm resistor are connected in series across 12 V. What current flows?", acceptedAnswers: currentAnswers(1), hint: "First find the total resistance, then use I = V / R_total." },
      { prompt: "A 4 ohm resistor and an 8 ohm resistor are connected in series across 12 V. What potential difference is across the 8 ohm resistor?", acceptedAnswers: voltageAnswers(8), hint: "Use the series current and V = IR for that resistor." },
      { prompt: "If one component in a series loop opens, the current everywhere becomes ...", acceptedAnswers: zeroAnswers("A"), hint: "An open route stops the whole loop." },
      { prompt: "Adding another resistor in series makes the total resistance ...", acceptedAnswers: words("increase", "larger", "greater"), hint: "Series resistances add up." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the one-route logic of a series circuit.";
  return [
    mc("Why does adding another resistor in series affect the whole loop rather than just one location?", ["There is only one route, so changing the route difficulty changes the current everywhere", "The battery changes into a larger cell", "Only the nearest lamp responds to resistance", "Series circuits hide the extra resistor"], 0, "In a one-route network, every part shares the same current.", hint),
    mc("Why does current not split in a series circuit?", ["There is only one complete route for charge to follow", "The battery prevents current from splitting", "Resistance cancels the split automatically", "Voltage cannot exist in branches"], 0, "A split requires more than one route.", hint),
    mc("Why do equal resistors share the supply voltage equally in series?", ["They carry the same current and have equal resistance", "Voltage is always the same in every component", "The battery forces equal voltage whatever the resistors are", "Equal resistors remove the current"], 0, "Same current through equal resistors gives equal voltage drops.", hint),
    mc("Why does the larger resistor take a larger share of the supply voltage in series?", ["The same current passes through it, so the larger resistance gives a larger voltage drop", "The larger resistor attracts more charge", "The battery sends more current through the larger resistor", "Series circuits always give equal voltage"], 0, "Keep V = IR tied to the common series current.", hint),
    mc("Why does one broken lamp turn off every lamp in a series string?", ["The single route is broken, so the current stops everywhere", "The other lamps run out of voltage only", "The battery stores the broken current", "Series circuits need at least two batteries"], 0, "A series string works only while its one route remains complete.", hint),
    mc("Why are identical lamps usually dimmer in series than a single lamp on the same battery?", ["The current through the loop is reduced and the supply voltage is shared", "Current doubles in a series string", "Each lamp gets the full battery voltage", "Series circuits remove resistance"], 0, "The one-route current drops and each lamp gets only part of the supply.", hint),
    mc("What common mistake does this lesson try to prevent?", ["Sharing current in series instead of sharing voltage", "Thinking resistance has no unit", "Thinking current is measured in joules", "Thinking batteries have no role in circuits"], 0, "Series circuits keep the current common and the voltage divided.", hint),
    mc("Why do series resistances add directly?", ["Each extra resistor adds another section of difficulty to the same route", "Because voltage disappears in series", "Because current multiplies by resistance", "Because charge is stored between resistors"], 0, "All route difficulties lie one after another on the same path.", hint),
    mc("Why is it wrong to say each component gets the full battery voltage in a series circuit?", ["The supply potential difference is shared across the components in the one route", "Voltage cannot exist in series", "Only batteries can have voltage", "Current removes voltage completely"], 0, "Only the total around the whole route matches the supply.", hint),
    mc("How can the current stay the same through two series resistors even when their voltages are different?", ["Series circuits have one common current, while the voltage share depends on each resistance", "Current and voltage are always equal", "The larger resistor gets more current", "The smaller resistor gets no current"], 0, "Current sameness and voltage sharing are different rules.", hint),
    mc("A student adds a second identical lamp in series and says only the new lamp changes. What is the best correction?", ["The whole loop changes because the one-route current is reduced for every component", "Only the new lamp matters because it was added last", "The battery cancels the change", "Series brightness never changes"], 0, "Adding route difficulty changes the current through the whole string.", hint),
    mc("Why is the one-route analogy stronger for series circuits than the split-route analogy?", ["Series circuits really do have one continuous path with no junction current split", "Series circuits have zero resistance", "Series circuits ignore voltage", "Series circuits only work with identical components"], 0, "The path structure is the defining feature.", hint),
    mc("Why is a larger total resistance linked to a smaller current for the same battery?", ["The source push stays the same while the route becomes harder", "The battery loses all its energy", "Current turns into voltage", "Charge disappears before the resistor"], 0, "Use the same-push harder-route logic.", hint),
    mc("Which sentence best captures the series-circuit model?", ["One route gives one current, while the supply voltage is shared across the route sections", "Many routes give one voltage share only after current splits", "Every component receives a different battery", "Current is used up as it passes each resistor"], 0, "This ties the current rule and voltage-sharing rule together.", hint),
    shortCases([
      { prompt: "In a series circuit, the quantity that stays the same through every component is ...", acceptedAnswers: words("current"), hint: "There is one common flow rate in the route." },
      { prompt: "In a series circuit, the quantity shared between the components is ...", acceptedAnswers: words("voltage", "potential difference"), hint: "The supply is divided across the route sections." },
      { prompt: "The total resistance of series components is found by ... the resistances.", acceptedAnswers: words("adding", "sum", "summing"), hint: "Series route difficulties stack." },
      { prompt: "Adding another component in series makes the total resistance ...", acceptedAnswers: words("increase", "larger", "greater"), hint: "More route difficulty means a larger total." },
      { prompt: "If one component breaks open in a series circuit, the current everywhere ...", acceptedAnswers: words("stops", "becomes zero", "is zero"), hint: "The single route is broken." },
      { prompt: "A circuit with one complete route for charge is a ... circuit.", acceptedAnswers: words("series", "series circuit"), hint: "The route structure names the circuit type." },
      { prompt: "In a series network, the battery voltage is shared between the route ...", acceptedAnswers: words("sections", "components"), hint: "The supply potential difference is divided along the one route." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Parallel circuits are split-route networks: same branch voltage, divided current.";
  return [
    mc("In a parallel circuit, what is the potential difference across each branch compared with the supply?", ["the same as the supply", "half the supply", "different in every branch", "zero in one branch"], 0, "Each branch spans the same two supply points.", hint),
    mc("Which statement best describes current in a parallel circuit?", ["It splits at a junction and recombines later", "It stays identical in every branch whatever the resistances", "It disappears in one branch", "It can only flow in the branch with the largest resistor"], 0, "Parallel circuits have more than one route, so current can divide.", hint),
    mc("What usually happens to the total current when an extra branch is added in parallel?", ["it increases", "it decreases to zero", "it stays fixed", "it becomes equal to one branch current"], 0, "An extra route lowers the total difficulty and increases total current.", hint),
    mc("Two parallel branches have the same voltage across them. Which branch carries more current?", ["the branch with greater resistance", "the branch with lower resistance", "both always carry the same current", "you need the battery mass"], 1, "At the same voltage, the easier branch carries the larger current.", hint),
    mc("If one lamp in a simple parallel pair breaks and opens its branch, what usually happens to the other lamp?", ["It stays on because its branch is still complete", "It always goes out because the whole circuit is broken", "Its branch current must become zero too", "It gets no potential difference at all"], 0, "A separate branch can keep working if its own route stays complete.", hint),
    mc("Two identical resistors are connected in parallel. Which statement is correct?", ["The branch currents are equal because the branch voltages and resistances are equal", "One branch must carry more current because it is closer to the battery", "The branch voltages must be different", "Current cannot split equally"], 0, "Equal voltage and equal resistance give equal branch current.", hint),
    mc("What happens to the total current at a junction where branch currents recombine?", ["It becomes the sum of the branch currents", "It becomes the current in the smallest branch only", "It always halves", "It disappears after the junction"], 0, "The combined current matches the branch contributions added together.", hint),
    mc("Which statement best describes a parallel circuit?", ["There are several routes between the same two points", "There is only one route and the current is the same everywhere", "The supply voltage must be shared equally", "A break in one branch always stops every branch"], 0, "Parallel structure is defined by multiple routes across the same two points.", hint),
    mc("What happens to the supply potential difference when another branch is added in parallel?", ["Each branch still has the full supply potential difference", "Each branch gets half the supply", "The supply potential difference becomes zero", "The voltage disappears in one branch"], 0, "Adding a branch does not change the shared endpoints of each branch.", hint),
    mc("Adding another branch in parallel usually makes the total resistance...", ["increase", "stay the same", "decrease", "become infinite"], 2, "More routes make the overall circuit easier for charge to flow through.", hint),
    shortCases([
      { prompt: "One branch carries 0.25 A and another branch carries 0.35 A. What total current leaves the source?", acceptedAnswers: currentAnswers(0.6), hint: "Add the branch currents." },
      { prompt: "A parallel circuit has a 6 V supply. What is the potential difference across each branch?", acceptedAnswers: voltageAnswers(6), hint: "Each branch spans the same two supply points." },
      { prompt: "A 3 ohm branch and a 6 ohm branch are connected in parallel across 6 V. What total current is drawn?", acceptedAnswers: currentAnswers(3), hint: "Find each branch current, then add them." },
      { prompt: "Two identical 4 ohm branches are connected in parallel across 8 V. What current flows in each branch?", acceptedAnswers: currentAnswers(2), hint: "Each branch gets 8 V, then use I = V / R." },
      { prompt: "The total current is 1.1 A and one branch current is 0.4 A. What is the other branch current?", acceptedAnswers: currentAnswers(0.7), hint: "Subtract the known branch current from the total." },
      { prompt: "In a parallel circuit, the potential difference across every branch is the ...", acceptedAnswers: words("same"), hint: "All branches share the same endpoints." },
      { prompt: "At a junction in a parallel circuit, currents ... to make the total current.", acceptedAnswers: words("add", "sum"), hint: "The total current is the combined branch flow." },
      { prompt: "If one branch in a parallel pair opens, the other branch usually ...", acceptedAnswers: words("stays on", "keeps working", "continues"), hint: "Its own route is still complete." },
      { prompt: "Adding another route in parallel makes the total current ...", acceptedAnswers: words("increase", "larger", "greater"), hint: "Extra routes reduce overall opposition." },
      { prompt: "Adding another route in parallel makes the total resistance ...", acceptedAnswers: words("decrease", "lower", "smaller", "less"), hint: "More routes make the network easier overall." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the split-route logic of a parallel circuit.";
  return [
    mc("Why does each branch in a parallel circuit have the same potential difference?", ["Each branch is connected across the same two supply points", "The battery halves the voltage for each extra branch", "Branches create their own independent voltages", "Parallel circuits have zero resistance"], 0, "Same endpoints mean same potential difference.", hint),
    mc("Why can branch currents be different even though the branch voltages are the same?", ["The branch resistances can be different", "Current and voltage are unrelated", "Charge is used up in one branch", "Parallel circuits force the same current everywhere"], 0, "At fixed branch voltage, the branch resistance controls the current.", hint),
    mc("Why does adding another branch usually increase the total current from the source?", ["It adds another route and lowers the total resistance", "It forces every branch current to become zero", "It makes the battery voltage disappear", "It prevents current from recombining"], 0, "More available routes make the whole circuit easier overall.", hint),
    mc("Why can one lamp stay on when another lamp in a parallel circuit breaks?", ["Its own branch remains a complete route across the supply", "The broken lamp sends extra current into the other branch", "Parallel circuits do not need a supply", "The battery creates a new voltage just for that lamp"], 0, "Each branch can operate independently if its route remains complete.", hint),
    mc("Why is the total current equal to the sum of the branch currents?", ["The source current is the combined flow that splits and then recombines", "The battery chooses the largest branch current only", "Current disappears at the junction", "Voltage and current are the same quantity"], 0, "The junction bookkeeping must balance.", hint),
    mc("Why is it wrong to say the voltage is shared between branches as if the circuit were series?", ["Parallel branches all connect across the full supply, so each branch gets the same voltage", "Branches always have zero voltage", "Only current can exist in branches", "Series and parallel circuits use the same voltage rule"], 0, "Do not import the series rule into a parallel network.", hint),
    mc("Why do identical branches draw equal current in parallel?", ["They have the same voltage across them and the same resistance", "Current always splits equally whatever the branches are", "The branch closer to the battery draws less current", "Parallel circuits keep current fixed by time only"], 0, "Equal V and equal R give equal I.", hint),
    mc("What common mistake does this lesson try to prevent?", ["Treating branch current as always identical and branch voltage as shared", "Treating current as energy per charge", "Treating voltage as resistance", "Treating batteries as optional"], 0, "Parallel circuits keep voltage common and current divided.", hint),
    mc("Why does the lower-resistance branch draw more current?", ["At the same branch voltage, the easier route gives the larger current", "Lower resistance means lower voltage", "The current is used up less quickly", "Charge avoids the easier route"], 0, "Use the same-push easier-route logic.", hint),
    mc("Why can the total current be larger than any single branch current?", ["It is the sum of all the branch currents together", "The battery duplicates current after the junction", "Current is created in the wires", "Voltage adds to current directly"], 0, "The source current feeds all active branches together.", hint),
    mc("Why does the battery current change when another branch is added even if the supply voltage stays fixed?", ["The overall resistance changes when the route structure changes", "The battery always sends the same current whatever the circuit", "Parallel branches remove voltage from the battery", "Branch current never depends on resistance"], 0, "Changing the network changes the total current demand.", hint),
    mc("Why can each branch current be calculated using the full supply voltage?", ["Each branch is directly across the same source endpoints", "The branch voltage is divided by the number of branches", "Current sets the branch voltage after the calculation", "Only one branch receives the full voltage"], 0, "The branch endpoints match the supply endpoints.", hint),
    mc("Why are parallel circuits useful when independent operation is needed?", ["One branch can keep working even if another branch opens", "Every branch always has the same current", "Parallel circuits force all lamps to be dim", "Voltage disappears after one branch breaks"], 0, "Separate routes support independent operation.", hint),
    mc("Which sentence best captures the parallel-circuit model?", ["Branches share the same voltage, current splits between routes, and total current adds at junctions", "One route shares current and splits voltage", "Every branch gets less voltage as more branches are added", "Current is used up in the lowest-resistance branch"], 0, "This ties the branch-voltage rule and junction-current rule together.", hint),
    shortCases([
      { prompt: "In a parallel circuit, the quantity that is the same across every branch is ...", acceptedAnswers: words("voltage", "potential difference"), hint: "All branches share the same endpoints." },
      { prompt: "In a parallel circuit, the quantity that adds at a junction is ...", acceptedAnswers: words("current"), hint: "The source current is the sum of branch currents." },
      { prompt: "A circuit with several routes between the same two points is a ... circuit.", acceptedAnswers: words("parallel", "parallel circuit"), hint: "The route structure names the circuit type." },
      { prompt: "At the same branch voltage, branch current depends on branch ...", acceptedAnswers: words("resistance"), hint: "The easier route carries more current." },
      { prompt: "Adding another active branch usually makes the total current ...", acceptedAnswers: words("increase", "larger", "greater"), hint: "The overall resistance falls." },
      { prompt: "If two branches have the same voltage and the same resistance, their currents are ...", acceptedAnswers: words("equal", "the same"), hint: "Equal V and equal R give equal I." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep power as a rate, total energy as an accumulation, and fuse action as current safety.";
  return [
    mc("What does the power of an electrical device tell you?", ["how much electrical energy it transfers each second", "how much charge it stores", "how many branches the circuit has", "how long it must run before current starts"], 0, "Power is an energy-transfer rate.", hint),
    mc("Which relation links power, voltage, and current?", ["P = VI", "E = VQ", "R = V / I", "I = Q / t"], 0, "Electrical power comes from voltage times current.", hint),
    mc("Two devices run on the same voltage, but one draws a larger current. Which has the greater power?", ["the one with the larger current", "the one with the smaller current", "they have the same power", "you need the time first"], 0, "At fixed voltage, larger current means larger power.", hint),
    mc("If a device keeps the same power but runs for twice as long, what happens to the total energy transferred?", ["it halves", "it stays the same", "it doubles", "it becomes zero"], 2, "Total energy depends on power and time.", hint),
    mc("What is the job of a fuse in a circuit?", ["to stop excessive current before overheating causes damage", "to increase the voltage across every device", "to store extra charge for the battery", "to make every branch carry the same current"], 0, "A fuse is a safety device, not a power booster.", hint),
    mc("A route is protected by a 6 A fuse but the current rises to 8 A. What should happen?", ["the fuse should melt and open the circuit", "the fuse should increase the voltage", "the current should stay safe automatically", "the fuse should store the extra current"], 0, "The current is above the safe rating.", hint),
    mc("What is the unit of power?", ["watt", "joule", "ampere", "ohm"], 0, "Power is measured in watts.", hint),
    mc("What is the unit of energy transferred?", ["joule", "watt", "volt", "ampere"], 0, "Energy transfer is measured in joules.", hint),
    mc("A device uses the same power but runs for a shorter time. What happens to the total energy transferred?", ["it decreases", "it increases", "it stays the same", "it becomes the fuse rating"], 0, "Less time at the same rate gives less total energy.", hint),
    mc("Which relation can be used to find electrical energy from voltage, current, and time together?", ["E = VIt", "R = V / I", "Q = It", "P = E / Q"], 0, "Power times time becomes energy, and power is VI.", hint),
    shortCases([
      { prompt: "A device works at 24 V and 2 A. What power does it use?", acceptedAnswers: powerAnswers(48), hint: "Use P = VI." },
      { prompt: "A 60 W heater runs for 20 s. How much energy is transferred?", acceptedAnswers: energyAnswers(1200), hint: "Use E = Pt." },
      { prompt: "A device has 12 V across it and a current of 0.5 A. What power does it use?", acceptedAnswers: powerAnswers(6), hint: "Multiply voltage by current." },
      { prompt: "A 200 W appliance runs for 15 s. How much energy is transferred?", acceptedAnswers: energyAnswers(3000), hint: "Energy equals power times time." },
      { prompt: "A device transfers 1800 J in 60 s. What is its power?", acceptedAnswers: powerAnswers(30), hint: "Rearrange E = Pt." },
      { prompt: "A device runs at 10 V with a current of 3 A for 2 s. How much energy is transferred?", acceptedAnswers: energyAnswers(60), hint: "Use E = VIt." },
      { prompt: "The safety device that melts when the current is too high is a ...", acceptedAnswers: words("fuse"), hint: "It protects the circuit from overheating current." },
      { prompt: "The unit of power is the ...", acceptedAnswers: words("watt", "w"), hint: "Power is energy transferred each second." },
      { prompt: "If the same power acts for twice as long, the total energy transferred ...", acceptedAnswers: words("doubles"), hint: "Energy is power multiplied by time." },
      { prompt: "If the current rises above the fuse rating, the circuit should ...", acceptedAnswers: words("open", "break", "trip"), hint: "The fuse must interrupt dangerous current." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the difference between rate, total transfer, and safety limit.";
  return [
    mc("Why is power not the same thing as total energy transferred?", ["Power tells the rate of energy transfer, while total energy depends on both power and time", "Power and energy always have the same value", "Power is measured in joules, so it is total energy", "Total energy never depends on time"], 0, "Power answers a per-second question; energy answers an accumulated-total question.", hint),
    mc("Why can a low-power device still transfer a large total energy?", ["It can run for a long time", "Low power means very high current", "A fuse adds extra energy over time", "Voltage becomes irrelevant"], 0, "A small rate acting for long enough can still build a large total.", hint),
    mc("Why does a larger current mean a larger power when the voltage is unchanged?", ["Power equals voltage times current", "Current and power are identical units", "Voltage falls to zero", "Resistance must always increase"], 0, "At fixed voltage, more current means more energy transferred each second.", hint),
    mc("Why does a fuse respond to current rather than total energy used?", ["Overheating risk depends on current being too large in the circuit", "A fuse measures how long a device has run", "Total energy always matters more than current for wire safety", "A fuse is the same as an energy meter"], 0, "A fuse protects against excessive current in the route.", hint),
    mc("Two devices both work at 100 W, but Device A runs for 10 s and Device B runs for 30 s. Why does Device B transfer more total energy?", ["It runs at the same rate for longer", "It must draw more current", "It must have a larger voltage", "The fuse gives it more power"], 0, "At equal power, running time decides the energy total.", hint),
    mc("Why can a high current be dangerous even when the circuit still works?", ["It can overheat wires or components and create a fire risk", "It always means the voltage is zero", "It removes resistance from the circuit", "It proves the device is efficient"], 0, "Safety is about limiting current to keep heating under control.", hint),
    mc("Why is it wrong to use watts and joules as if they were interchangeable?", ["Watts measure rate, while joules measure total energy transferred", "Both are resistance units", "Watts measure charge and joules measure current", "They always describe the same thing"], 0, "Keep the unit roles distinct.", hint),
    mc("Why does a 100 W heater warm something faster than a 50 W heater under similar conditions?", ["It transfers more energy each second", "It stores more charge", "It has lower voltage automatically", "Its fuse always has a lower rating"], 0, "Higher power means faster energy transfer.", hint),
    mc("What common mistake does this lesson try to prevent about fuses?", ["Treating a fuse as a device that boosts power instead of limiting unsafe current", "Thinking a fuse increases current deliberately", "Thinking a fuse creates voltage", "Thinking a fuse stores energy for later"], 0, "A fuse is purely protective.", hint),
    mc("Why are both power and time needed to describe appliance energy use?", ["Power gives the rate and time tells how long that rate acts", "Power already includes the fuse rating", "Time changes the voltage directly", "Energy depends only on current"], 0, "The total needs both the size of the rate and the duration.", hint),
    mc("Why can the same appliance be safe in one case and unsafe in another?", ["The current can stay below the fuse rating in one case but exceed it in another", "Safety depends only on the color of the wire", "Fuses work only in parallel circuits", "Power never changes if the appliance is the same"], 0, "The protection decision depends on current compared with the safe limit.", hint),
    mc("Why would a fuse rated below the normal working current be a poor choice?", ["It would open even during normal operation", "It would increase the power too much", "It would stop voltage from reaching the device", "It would make the current larger"], 0, "A fuse must allow normal current but interrupt dangerous overload current.", hint),
    mc("Why can a higher-power device often heat faster on the same supply?", ["It transfers more electrical energy each second", "It contains more charge", "Its resistance must be zero", "Its fuse has already blown"], 0, "Higher power means a faster energy-transfer rate.", hint),
    mc("Why is the current limit a good safety gate for the circuit story?", ["Excessive current is what raises overheating risk in wires and devices", "Current tells you total energy used forever", "Current replaces voltage completely", "Current never changes in a real circuit"], 0, "The safe-current limit is the protection trigger.", hint),
    shortCases([
      { prompt: "The quantity that means electrical energy transferred each second is ...", acceptedAnswers: words("power"), hint: "It is measured in watts." },
      { prompt: "The safety device that responds when the current is too high is a ...", acceptedAnswers: words("fuse"), hint: "It protects the circuit from overload current." },
      { prompt: "The compact relation linking total energy to power and time is ...", acceptedAnswers: words("E = Pt", "E=Pt"), hint: "Total energy equals rate times time." },
      { prompt: "The compact relation linking electrical power to voltage and current is ...", acceptedAnswers: words("P = VI", "P=VI"), hint: "Electrical power equals push times flow rate." },
      { prompt: "If a device runs longer at the same power, the total energy transferred ...", acceptedAnswers: words("increases", "gets larger", "rises"), hint: "Energy accumulates as the rate continues." },
      { prompt: "If the current rises above the fuse rating, the circuit should ...", acceptedAnswers: words("open", "break", "trip"), hint: "The fuse must interrupt dangerous current." },
      { prompt: "A fuse is chosen to interrupt a current that becomes too ...", acceptedAnswers: words("large", "high"), hint: "It is there to stop unsafe overload current." },
    ]),
  ];
}

const F4_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F4_L1: l1DiagnosticRaw,
  F4_L2: l2DiagnosticRaw,
  F4_L3: l3DiagnosticRaw,
  F4_L4: l4DiagnosticRaw,
  F4_L5: l5DiagnosticRaw,
  F4_L6: l6DiagnosticRaw,
};

const F4_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F4_L1: l1ConceptRaw,
  F4_L2: l2ConceptRaw,
  F4_L3: l3ConceptRaw,
  F4_L4: l4ConceptRaw,
  F4_L5: l5ConceptRaw,
  F4_L6: l6ConceptRaw,
};

const F4_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(F4_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...F4_DIAGNOSTIC_BUILDERS[code](), ...F4_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function f4GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F4_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function f4GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F4_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function f4GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F4_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
