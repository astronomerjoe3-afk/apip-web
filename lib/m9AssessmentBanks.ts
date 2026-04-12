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
  hint = "Rebuild the lesson rule before choosing."
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
    throw new Error(`M9 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Check whether the loop is complete and keep charge separate from energy transfer.";
  return [
    mc("Which condition is needed for a steady current in a simple lamp circuit?", ["a complete conducting loop", "a large battery only", "a thick wire only", "a very hot lamp"], 0, "A steady current needs one unbroken conducting path.", hint),
    mc("A switch is opened in a one-loop circuit. What happens to the current?", ["It stops everywhere in the loop.", "It keeps flowing near the battery only.", "It doubles before the lamp.", "It becomes voltage."], 0, "Breaking the single route stops the sustained current everywhere.", hint),
    mc("Two ammeters are placed at different points in one simple loop. How should their readings compare?", ["They should be the same.", "The second must be smaller.", "The one nearer the cell must be larger.", "They cannot be compared."], 0, "In one simple path, the same current passes every point.", hint),
    mc("Which statement about a lamp in a simple circuit is best?", ["It transfers energy but does not use up charge.", "It uses up current and returns empty wire.", "It stores all the electrons that enter it.", "It creates extra charge after heating up."], 0, "A lamp transfers energy from moving charge; it does not destroy the charge.", hint),
    mc("What are the moving charge carriers in a metal wire?", ["electrons", "protons moving through the wire", "neutrons", "light rays"], 0, "In metals, electrons are the mobile charge carriers.", hint),
    mc("What is the main role of a cell or battery in a circuit?", ["to provide energy per unit charge", "to store current inside itself", "to remove resistance from the wires", "to create new electrons"], 0, "A cell raises the energy of each coulomb; it is not a tank of current.", hint),
    mc("Why does a bulb go out if there is a gap in the wire?", ["The route is incomplete, so sustained current cannot continue.", "The bulb has used up all the charge already.", "The battery has turned into a resistor.", "The electrons have disappeared from the metal."], 0, "An incomplete route prevents sustained charge flow.", hint),
    mc("One lamp is removed from a simple series loop with no branches. What happens?", ["Current stops everywhere because the path is broken.", "Only the removed lamp turns off.", "The current becomes larger in the remaining wire.", "The battery forces current across the gap."], 0, "Removing one component from a single loop breaks the path.", hint),
    mc("Which quantity is conserved around a simple circuit?", ["charge", "lamp brightness", "resistance", "battery voltage across every component"], 0, "Charge carriers circulate; they are not used up by components.", hint),
    mc("Which statement is wrong?", ["The current after a lamp is smaller because the lamp has used it up.", "A complete loop is needed for sustained current.", "The same current passes each point in a simple loop.", "Charge carriers remain in the wire."], 0, "Current is not used up by a component in a simple loop.", hint),
    mc("Why can there still be charge carriers in a wire when the current is zero?", ["The circuit can be open even though the wire still contains electrons.", "Charge carriers only appear when the lamp is lit.", "No metal contains charge carriers unless a battery is present.", "Zero current means the wire is empty."], 0, "Charge carriers can be present without a complete route for flow.", hint),
    mc("An ammeter reads 0.30 A just before a motor in a simple loop. What should it read just after the motor?", ["0.30 A", "0.15 A", "0.60 A", "0 A"], 0, "In one simple loop, the current is the same before and after a component.", hint),
    mc("What changes across a working lamp even though the same current continues?", ["the energy carried by each coulomb", "the amount of charge in the wire becomes zero", "the route becomes open", "the wire stops containing electrons"], 0, "Components transfer energy from the moving charge.", hint),
    mc("Which description best matches a complete circuit?", ["a closed route from one terminal of the cell, through the components, and back to the other terminal", "any wire touching one terminal of a cell", "a circuit with the largest battery available", "a loop that contains only one component"], 0, "A complete circuit is an unbroken route all the way round.", hint),
    mc("If the switch is open, which statement is best?", ["Charge carriers can still be present, but there is no sustained current.", "There can be no charges anywhere in the metal.", "The battery sends current up to the switch and stops there forever.", "The lamp still uses up the stored current in the wire."], 0, "The open switch breaks the route without removing the charge carriers.", hint),
    mc("Which pair belongs together in a simple loop?", ["complete route and sustained current", "open gap and same current everywhere", "battery and used-up charge", "lamp and destroyed electrons"], 0, "A complete route is what allows sustained current.", hint),
    mc("Why is the phrase 'current is spent by the bulb' weak?", ["The bulb transfers energy but the same current continues around the complete loop.", "A bulb never changes anything in a circuit.", "Current is a type of battery chemical.", "Bulbs increase the number of electrons in the wire."], 0, "The bulb changes the energy story, not the charge-conservation story.", hint),
    mc("Which fault would stop the whole current in a one-path circuit?", ["a broken filament in the only lamp", "a warmer battery case", "a brighter lamp cover", "a longer table under the circuit"], 0, "A single break in a one-path loop stops the whole circuit.", hint),
    mc("What should you identify before deciding whether current can flow steadily?", ["whether the conducting path is complete", "whether the wires are shiny", "whether the lamp is large", "whether the battery label is colorful"], 0, "Route completion is the first check.", hint),
    mc("A student says, 'The cell pushes out 0.4 A, and the lamp returns less because some current was used.' What is the first correction?", ["Current is the same all around a simple complete loop.", "The battery can only provide current at night.", "The lamp returns more current than it receives.", "The wire after the lamp contains no charge carriers."], 0, "In a one-path circuit, the current does not shrink after a component.", hint),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Keep the complete-route rule and charge-conservation rule visible together.";
  return [
    mc("Why is a cell-plus-wire picture not enough to prove a circuit is complete?", ["The route must return to the other terminal through an unbroken conducting path.", "A circuit is complete only if the battery is large.", "Current can flow only if there are two lamps.", "The wire must be glowing to count as complete."], 0, "A complete circuit is a closed path, not just one connection.", hint),
    mc("A lamp and buzzer are in one simple loop. If the buzzer is removed and not replaced, why does the lamp also stop?", ["The single route is broken, so the current stops everywhere.", "The lamp needed the buzzer to create electrons.", "The lamp uses only leftover current from the buzzer.", "The battery gives up after one component is removed."], 0, "In a single route, one break stops the whole current.", hint),
    mc("What is the strongest reason two ammeters in a one-path loop show the same reading?", ["The same charge flow rate passes each point in the only path.", "The battery gives different currents but the meters hide it.", "Current speeds up after each component.", "Ammeters always show the same number whatever the circuit."], 0, "Same route means same current at each checkpoint.", hint),
    mc("Which statement best separates charge from energy in a circuit?", ["Charge circulates, while components transfer energy from the moving charge.", "Charge turns into energy and vanishes in the lamp.", "Energy circulates but charge gets used up.", "Charge and energy are the same thing in different units."], 0, "Charge and energy play different roles in the circuit story.", hint),
    mc("Why can a motor spin even though the current after it is still the same as before it?", ["The motor transfers energy without changing the one-path current.", "The motor creates extra current while spinning.", "The current becomes voltage inside the motor and then back again.", "The current after the motor is always zero."], 0, "Energy transfer does not require current to be used up.", hint),
    mc("A student draws electrons piling up permanently before a lamp in a steady simple circuit. What is the best correction?", ["In a steady simple loop, the same current passes each point rather than permanently building up in one place.", "Electrons can pile up forever only if the lamp is bright.", "Charge must disappear inside the lamp to stop the pile-up.", "The battery removes all electrons before they reach the lamp."], 0, "A steady simple circuit is described by continuous circulation, not a permanent traffic jam.", hint),
    mc("Which statement about an open switch is strongest?", ["It breaks the conducting route, so sustained current cannot continue even though charge carriers remain in the metal.", "It removes all electrons from the wires instantly.", "It destroys the battery voltage everywhere permanently.", "It forces the lamp to use up the last stored current."], 0, "The switch changes the route condition first.", hint),
    mc("If a wire is intact and full of mobile electrons, why can current still be zero?", ["A complete loop back to the cell may still be missing.", "Electrons cannot move in metals.", "Current exists only in batteries, not in wires.", "Any intact wire must always have current."], 0, "Charge carriers alone are not enough without a complete loop.", hint),
    mc("What does the phrase 'same current before and after the lamp' protect you from?", ["the misconception that the lamp uses up current", "the idea that lamps transfer energy", "the fact that wires contain charge carriers", "the need for a complete path"], 0, "The one-path current rule blocks the 'used-up current' mistake.", hint),
    mc("Which explanation is strongest for a dark lamp in a circuit that still contains a cell and wires?", ["Somewhere the conducting route is incomplete.", "The current has already been used up by the wires.", "The wire has lost all of its electrons.", "The battery has become a resistor only."], 0, "First check the route completion.", hint),
    mc("Why is it weak to say the battery 'contains 0.5 A' before the circuit is closed?", ["Current is a flow rate in a complete circuit, not a quantity stored inside the battery by itself.", "Batteries cannot be connected to lamps.", "Current can exist only in open circuits.", "Ampere is a unit of voltage."], 0, "Current is a flow rate, not a stored ingredient.", hint),
    mc("Which sentence best uses the lesson idea?", ["The lamp glows because electrical energy is transferred from moving charge in a complete loop.", "The lamp glows because it consumes the current sent by the battery.", "The lamp glows because the wire creates new charge after the switch.", "The lamp glows because open gaps force current through the bulb."], 0, "The strongest answer keeps the loop, current, and energy roles separate.", hint),
    mc("Why do all components in one simple series loop share the same current?", ["There is only one route for the charge to take.", "Each component makes its own private current.", "The battery assigns different currents to different wires.", "Current always becomes larger after a resistor."], 0, "One route means one common current.", hint),
    mc("A student says a lamp is the 'destination' of current. What should be corrected first?", ["In a complete circuit, charge carriers continue around the loop after passing through the lamp.", "Current can travel only in one direction through a lamp and then vanish.", "The lamp is actually a battery.", "The lamp is a source of electrons for the circuit."], 0, "The lamp is part of the route, not the end of the current story.", hint),
    mc("Which scenario best shows charge conservation in a circuit?", ["The same current enters and leaves a component in a simple loop while energy is transferred.", "A lamp uses half the charge and returns the rest.", "The battery creates new charge every second to replace used current.", "A resistor destroys electrons so the current falls after it."], 0, "Charge conservation means the carriers keep circulating.", hint),
    mc("What is the cleanest first question when a circuit seems not to work?", ["Is the conducting path complete from one terminal of the cell back to the other?", "Is the battery label large enough?", "Is the lamp the only component present?", "Are the electrons colorful enough to move?"], 0, "Route completion is the first diagnostic check.", hint),
    mc("Why is 'there is no current because there is no battery chemical left in the wire' a weak answer to an open-switch circuit?", ["The immediate reason is the broken route, not a loss of charge carriers from the wire.", "A switch creates extra battery chemical when it opens.", "Current flows only if chemicals fill the lamp.", "Open switches increase current rather than stopping it."], 0, "The route change is the first causal step.", hint),
    mc("Which sentence best links the switch to the current story?", ["The switch controls whether the conducting path is complete.", "The switch creates the electrons that move through the lamp.", "The switch decides how much charge each electron contains.", "The switch turns voltage into resistance."], 0, "The switch changes the route condition.", hint),
    mc("What should stay visible when you explain why the current is the same at two checkpoints in one loop?", ["one complete path and conserved charge", "battery size and lamp color", "wire length and room temperature only", "switch label and resistor name"], 0, "The core explanation combines the one-path idea with charge conservation.", hint),
    mc("If a learner says 'the current stops because the battery runs out of current as it travels around the loop,' what is the better response?", ["Current stops when the route is broken; in a complete route the same current continues all the way round.", "The battery keeps half the current and sends half to the lamp.", "Only the wire nearest the battery has current.", "Current can flow even if the loop is incomplete."], 0, "The route explanation is stronger than the 'used-up current' story.", hint),
  ];
}

function l1MasteryRaw(): RawItem[] {
  const hint = "Keep the one-path current rule and the energy-transfer rule separate.";
  return [
    ...l1ConceptRaw(),
    mc("A loop contains a cell, switch, lamp, and motor. The switch is closed and the lamp is lit. Which statement is strongest?", ["The same current passes the lamp and the motor, while each component transfers energy in its own way.", "The lamp takes most of the current, so the motor gets less.", "The motor receives current only after the lamp is full.", "The battery creates fresh current after each component."], 0, "In one path, the current stays common while components transfer energy.", hint),
    mc("An ammeter reads 0.25 A next to the cell in a simple loop. Which reading is most likely just after the resistor in the same loop?", ["0.25 A", "0.10 A", "0.50 A", "0 A"], 0, "The one-path current is common all round the loop.", hint),
    mc("Why does a broken filament inside the only lamp stop the whole circuit?", ["It makes the loop incomplete.", "It increases the charge in the wire.", "It turns the battery into a conductor.", "It forces the current to go faster around the gap."], 0, "A broken filament is a break in the only path.", hint),
    mc("Which statement about a working cell is strongest?", ["It gives energy to each coulomb that moves through the circuit.", "It stores current until the lamp asks for it.", "It destroys charge to create brightness.", "It is the only place where electrons exist."], 0, "The cell's role is to provide energy per charge.", hint),
    mc("A learner says, 'The wire after the lamp must contain fewer electrons because some were turned into light.' What should be corrected first?", ["Electrons are not turned into light; charge carriers continue round the loop while energy is transferred.", "Electrons cannot move through lamps at all.", "The lamp creates extra electrons after glowing.", "The battery sends no electrons into the lamp."], 0, "Charge continues round the loop; energy transfer is the separate story.", hint),
    mc("Why is it stronger to say 'the circuit is incomplete' than 'the battery is weak' when an open switch stops a lamp lighting?", ["The open switch is the direct reason no sustained current can flow.", "Battery strength never matters in circuits.", "Open switches make the battery vanish.", "Current can jump across open gaps if the battery is strong."], 0, "The immediate cause is the broken route.", hint),
    mc("Which sentence best protects the model from the 'used-up current' idea?", ["Current is the rate of charge flow, and in a simple loop the same current enters and leaves each component.", "Current is a battery chemical that gets spent by the bulb.", "Current lives only inside the lamp and then disappears.", "Current turns permanently into heat after the first resistor."], 0, "A strong answer says what current is and keeps it common in a simple loop.", hint),
    mc("What must be true before any component in a simple loop can keep working continuously?", ["There must be a complete conducting path all the way round the circuit.", "The lamp must be the first component after the battery.", "The wire nearest the battery must be thicker than the rest.", "The current must be used up by only one component."], 0, "Continuous operation needs a complete loop.", hint),
    mc("A lamp glows and a buzzer sounds in the same simple loop. Which conclusion is strongest?", ["The components share one current path while each transfers energy differently.", "The current splits into two equal currents even without branches.", "The buzzer must receive the used current from the lamp.", "Only one component can be active at a time."], 0, "One path does not mean one kind of component only.", hint),
    short("Name the missing condition for sustained current in a simple loop.", ["complete circuit", "closed circuit", "complete conducting path", "unbroken conducting path"], "Use the route condition, not a battery slogan."),
    short("What quantity is conserved around a simple circuit?", ["charge", "electric charge"], "Think about what is not used up by the components."),
    short("In one simple loop, what stays the same at every point?", ["current", "the current"], "Use the one-path rule."),
    short("What does a cell provide to each coulomb in the circuit?", ["energy", "energy per charge", "an energy rise", "electrical energy"], "Keep the source role on the energy side of the story."),
    short("Why does removing one component from a one-path loop stop the whole current?", ["the circuit is incomplete", "the loop is broken", "the path is broken", "the route is incomplete"], "Answer with the route condition."),
    mc("Which is the better explanation for 'both lamps go off when one lamp is removed from a single loop'?", ["Removing one lamp breaks the only route, so the current stops everywhere.", "The first lamp was using up the current needed by the second.", "The battery can power only one lamp at a time.", "The wire after the removed lamp loses all electrons."], 0, "A one-path loop stops everywhere when it is broken.", hint),
    mc("Why is it weak to describe current as 'used fuel' in this lesson?", ["Because current is a flow rate of conserved charge, while energy transfer is the part that components change.", "Because fuel is always a voltage.", "Because current exists only in cells.", "Because charge cannot move in wires."], 0, "The lesson separates charge flow from energy transfer.", hint),
    mc("A student tests a simple loop and sees zero current. Which question should come first?", ["Is there any break in the conducting path?", "Is the lamp attractive enough to the electrons?", "Is the battery color correct?", "Is the resistor name too long?"], 0, "Start with route completion.", hint),
    mc("What remains true even when the current is zero because the switch is open?", ["The metal wire can still contain mobile charge carriers.", "The wire has no electrons at all.", "The battery has already sent all charge away permanently.", "The lamp must still glow faintly."], 0, "Open circuit means no flow, not no charge carriers.", hint),
    mc("Which response best answers 'why does the lamp not keep the current after it passes through'?", ["Because in a complete circuit the charge carriers continue moving through the rest of the loop.", "Because the lamp returns the current to the battery as voltage.", "Because the lamp has no connection to the battery.", "Because current can exist only before the first component."], 0, "The carriers continue round the route after the lamp.", hint),
    short("What does a lamp transfer even though the same current enters and leaves it?", ["energy", "electrical energy"], "Separate energy transfer from charge flow."),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Current is charge per second, so compare amount and time together.";
  return [
    mc("What does electric current measure?", ["charge flow rate", "total charge in the battery", "energy stored in a cell", "resistance of a wire"], 0, "Current measures how much charge passes a point each second.", hint),
    mc("What does 1 A mean?", ["1 C passes a point each second.", "1 J is stored in the wire.", "1 electron moves round the loop each second.", "1 V is used every second."], 0, "1 A means 1 C/s.", hint),
    mc("If the same charge passes in less time, what happens to the current?", ["It increases.", "It decreases.", "It stays the same.", "It becomes voltage."], 0, "Less time for the same charge means a larger flow rate.", hint),
    mc("If the same current flows for longer, what happens to the total charge that passes?", ["More charge passes.", "Less charge passes.", "The charge must stay the same.", "The charge becomes resistance."], 0, "At a steady current, more time means more charge.", hint),
    mc("Which equation matches the lesson meaning of current?", ["I = Q / t", "Q = V / I", "E = VQ", "R = V / I"], 0, "Current is charge divided by time.", hint),
    mc("Which unit pair is equivalent for current?", ["A and C/s", "V and J/C", "ohms and A", "C and J"], 0, "Ampere means coulomb per second.", hint),
    mc("A wire carries 8 C in 4 s. Which current is correct?", ["2 A", "4 A", "8 A", "32 A"], 0, "Use I = Q / t.", hint),
    mc("If 12 C passes a point each second, what current flows?", ["12 A", "6 A", "1/12 A", "24 A"], 0, "Current is coulombs per second.", hint),
    mc("Why is 'this circuit has lots of current because it has lots of charge' a weak claim?", ["Current needs time as well as charge.", "Current never depends on charge.", "Charge is the same as voltage.", "Only batteries can have charge."], 0, "Current is a rate, not charge by itself.", hint),
    mc("If 10 C passes in 5 s and 10 C passes in 10 s, which case has the larger current?", ["the 5 s case", "the 10 s case", "they are equal", "you need voltage first"], 0, "The same charge in less time gives a larger current.", hint),
    short("A charge of 6 C passes a point in 2 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("A charge of 9 C passes a point in 3 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("A charge of 12 C passes a point in 4 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("A charge of 15 C passes a point in 5 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("A current of 2 A flows for 4 s. How much charge passes?", answers("8", "C"), "Use Q = It."),
    short("A current of 3 A flows for 5 s. How much charge passes?", answers("15", "C"), "Use Q = It."),
    short("A current of 0.5 A flows for 8 s. How much charge passes?", answers("4", "C", "4.0 C"), "Use Q = It."),
    short("A current of 4 A flows for 3 s. How much charge passes?", answers("12", "C"), "Use Q = It."),
    short("10 C passes a point in 2 s. What current flows?", answers("5", "A"), "Use I = Q / t."),
    short("14 C passes a point in 7 s. What current flows?", answers("2", "A"), "Use I = Q / t."),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Read current as charge passing one checkpoint each second.";
  return [
    mc("Why is it wrong to call current 'the amount of charge in the circuit'?", ["Current is the rate at which charge passes a point, not the total charge present.", "Current and charge are identical quantities.", "Charge exists only when time is zero.", "Current is measured in coulombs only."], 0, "Current and charge are different electrical ideas.", hint),
    mc("Two wires each carry 12 C, but one does so in 3 s and the other in 6 s. Which has the larger current?", ["the 3 s wire", "the 6 s wire", "they are the same", "you need resistance first"], 0, "The same charge in less time means a larger current.", hint),
    mc("What should an ammeter measure in this lesson?", ["charge flow rate at a point", "stored energy in a battery", "resistance of a component", "number of electrons in the whole circuit"], 0, "An ammeter measures current, which is a flow rate.", hint),
    mc("Why is 'a bigger battery always means more current' too weak on its own?", ["Current also depends on the circuit and on how much charge passes per second.", "Batteries cannot affect current at all.", "Current depends only on wire color.", "Current is the same in every circuit regardless of conditions."], 0, "Current is a flow-rate statement, not a one-word battery label.", hint),
    mc("Which comparison best shows current as a rate?", ["8 C in 2 s versus 8 C in 4 s", "8 C in 2 s versus 16 C in 4 s only", "2 s versus 4 s with no charge values", "8 C versus 16 C with no times"], 0, "A rate comparison needs both amount and time visible.", hint),
    mc("If the current is steady at 4 A, how much charge passes each second?", ["4 C", "1 C", "4 J", "16 C"], 0, "Ampere means coulomb per second.", hint),
    mc("If the current falls while the total charge passing stays the same, what must have increased?", ["the time taken", "the battery voltage only", "the resistance only", "the number of electrons stored"], 0, "For the same charge, a smaller rate means a longer time.", hint),
    mc("Why is 1 A not the same kind of statement as '1 C'?", ["1 A includes a time rate, while 1 C is just an amount of charge.", "1 A is a type of voltage.", "1 C measures current more accurately than 1 A.", "1 A is energy per charge."], 0, "Current includes time; charge alone does not.", hint),
    mc("Which statement is strongest?", ["Current tells how quickly charge passes a chosen point.", "Current tells how much charge the battery contains in total.", "Current tells how hard the route is for charge to follow.", "Current tells how much energy each coulomb receives."], 0, "Current is a rate question.", hint),
    mc("A student says, '12 C and 12 A mean almost the same thing.' What is the first correction?", ["12 A is a flow rate, but 12 C is only an amount of charge.", "12 A is a voltage and 12 C is a current.", "12 C is larger than 12 A because C is a bigger unit.", "They are the same if the wire is long."], 0, "One unit includes time and the other does not.", hint),
    mc("If 24 C passes in 8 s, what current flows?", ["3 A", "2 A", "8 A", "32 A"], 0, "Use I = Q / t.", hint),
    mc("If a current of 5 A flows for 2 s, what charge passes?", ["10 C", "2.5 C", "7 C", "25 C"], 0, "Use Q = It.", hint),
    mc("Why is the phrase 'more current because there are more electrons in the wire' incomplete?", ["It ignores how quickly charge passes the checkpoint.", "Electrons never matter in current.", "Current is measured in volts, not electrons.", "Wires with more electrons always have zero current."], 0, "The rate part is missing.", hint),
    mc("Which pair must be known to calculate current directly?", ["charge and time", "voltage and resistance", "energy and resistance", "mass and charge"], 0, "Current comes directly from charge divided by time.", hint),
    mc("Which lesson sentence is strongest?", ["Current is about how much charge passes a point per second.", "Current is how much charge exists in the battery.", "Current is how much energy a resistor has.", "Current is how much resistance the wire has."], 0, "The strongest sentence includes the checkpoint and the time rate.", hint),
    mc("A larger current means what at one chosen point in the circuit?", ["More charge passes that point each second.", "Each electron has more mass.", "The wire has no resistance.", "The current is being used up more slowly."], 0, "A larger current means a larger charge flow rate.", hint),
    mc("What changes if 6 C still passes but the time doubles from 2 s to 4 s?", ["The current halves.", "The current doubles.", "The charge halves.", "The voltage must double."], 0, "Same charge in twice the time means half the rate.", hint),
    mc("What is the cleanest reading of 0.25 A?", ["0.25 C passes a point each second.", "0.25 J is stored in each coulomb.", "0.25 ohms of resistance is present.", "0.25 electrons pass each minute."], 0, "Read amperes back into coulombs per second.", hint),
    mc("Why does current need a checkpoint idea in its definition?", ["Because current is measured by how much charge passes one point over time.", "Because charge exists only at checkpoints.", "Because current cannot move through components.", "Because batteries store current at checkpoints."], 0, "Current is a rate through a location.", hint),
    mc("Which statement best separates current from charge?", ["Charge is an amount; current is an amount per second.", "Current is an amount; charge is an amount per second.", "Both are exactly the same but in different circuits.", "Neither needs time to be understood."], 0, "The rate distinction is the core lesson meaning.", hint),
  ];
}

function l2MasteryRaw(): RawItem[] {
  const hint = "Use I = Q / t or Q = It, then say the result back as charge per second.";
  return [
    ...l2ConceptRaw(),
    short("18 C passes a point in 6 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("20 C passes a point in 4 s. What current flows?", answers("5", "A"), "Use I = Q / t."),
    short("27 C passes a point in 9 s. What current flows?", answers("3", "A"), "Use I = Q / t."),
    short("32 C passes a point in 8 s. What current flows?", answers("4", "A"), "Use I = Q / t."),
    short("45 C passes a point in 9 s. What current flows?", answers("5", "A"), "Use I = Q / t."),
    short("7.5 C passes a point in 3 s. What current flows?", answers("2.5", "A", "2.50 A"), "Use I = Q / t."),
    short("0.8 C passes a point in 0.2 s. What current flows?", answers("4", "A", "4.0 A"), "Use I = Q / t."),
    short("14 C passes a point in 2 s. What current flows?", answers("7", "A"), "Use I = Q / t."),
    short("2.4 C passes a point in 6 s. What current flows?", answers("0.4", "A", "0.40 A"), "Use I = Q / t."),
    short("3.6 C passes a point in 1.2 s. What current flows?", answers("3", "A", "3.0 A"), "Use I = Q / t."),
    short("A current of 6 A flows for 4 s. How much charge passes?", answers("24", "C"), "Use Q = It."),
    short("A current of 2.5 A flows for 8 s. How much charge passes?", answers("20", "C"), "Use Q = It."),
    short("A current of 0.6 A flows for 5 s. How much charge passes?", answers("3", "C", "3.0 C"), "Use Q = It."),
    short("A current of 1.2 A flows for 10 s. How much charge passes?", answers("12", "C"), "Use Q = It."),
    short("A current of 4 A flows for 0.5 s. How much charge passes?", answers("2", "C", "2.0 C"), "Use Q = It."),
    short("A current of 0.25 A flows for 12 s. How much charge passes?", answers("3", "C", "3.0 C"), "Use Q = It."),
    short("A current of 7 A flows for 3 s. How much charge passes?", answers("21", "C"), "Use Q = It."),
    short("A current of 0.9 A flows for 20 s. How much charge passes?", answers("18", "C"), "Use Q = It."),
    short("A current of 1.5 A flows for 6 s. How much charge passes?", answers("9", "C"), "Use Q = It."),
    short("A current of 8 A flows for 2 s. How much charge passes?", answers("16", "C"), "Use Q = It."),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Voltage is energy per charge, so keep joules and coulombs in the same sentence.";
  return [
    mc("What does potential difference measure?", ["energy transferred per unit charge", "charge flow rate", "route difficulty", "total charge in the battery"], 0, "Voltage measures joules per coulomb.", hint),
    mc("What does 1 V mean?", ["1 J transferred per coulomb", "1 C passing per second", "1 ohm of resistance", "1 watt of power"], 0, "1 V = 1 J/C.", hint),
    mc("Which equation matches the lesson meaning of voltage?", ["V = E / Q", "I = Q / t", "Q = It", "R = V / I"], 0, "Voltage is energy per charge.", hint),
    mc("If each coulomb gains more energy from the source, which quantity has increased?", ["potential difference", "current only", "resistance only", "charge only"], 0, "More energy per coulomb means a larger voltage.", hint),
    mc("A component transfers 12 J when 3 C passes. What potential difference is across it?", ["4 V", "9 V", "36 V", "0.25 V"], 0, "Use V = E / Q.", hint),
    mc("Why is 'the battery stores current' a weak statement in this lesson?", ["A battery provides energy per charge rather than storing current as a substance.", "Batteries cannot affect circuits.", "Current and voltage are identical.", "Batteries remove charge from wires."], 0, "Keep source energy-per-charge separate from flow rate.", hint),
    mc("If 2 C passes through a 6 V component, how much energy is transferred?", ["12 J", "3 J", "8 J", "0.33 J"], 0, "Use E = VQ.", hint),
    mc("Which unit pair is equivalent for voltage?", ["V and J/C", "A and C/s", "ohms and V/A", "C and A"], 0, "Voltage is joules per coulomb.", hint),
    mc("Why is a 9 V cell said to be 'stronger' than a 1.5 V cell in this lesson?", ["Each coulomb gains more energy from it.", "It always sends more current in every circuit.", "It contains more charge carriers.", "It has less resistance inside it by definition."], 0, "Stronger here means more energy per charge.", hint),
    mc("If the charge doubles while the voltage stays the same, what happens to the transferred energy?", ["It doubles.", "It halves.", "It stays the same.", "It becomes current."], 0, "Use E = VQ.", hint),
    short("24 J is transferred when 4 C passes. What is the potential difference?", answers("6", "V"), "Use V = E / Q."),
    short("15 J is transferred when 3 C passes. What is the potential difference?", answers("5", "V"), "Use V = E / Q."),
    short("8 J is transferred when 2 C passes. What is the potential difference?", answers("4", "V"), "Use V = E / Q."),
    short("18 J is transferred when 6 C passes. What is the potential difference?", answers("3", "V"), "Use V = E / Q."),
    short("A 12 V source moves 2 C of charge. How much energy is transferred?", answers("24", "J"), "Use E = VQ."),
    short("A 9 V source moves 3 C of charge. How much energy is transferred?", answers("27", "J"), "Use E = VQ."),
    short("A 1.5 V cell moves 4 C of charge. How much energy is transferred?", answers("6", "J"), "Use E = VQ."),
    short("A 5 V source moves 8 C of charge. How much energy is transferred?", answers("40", "J"), "Use E = VQ."),
    short("20 J is transferred by 5 C. What potential difference is involved?", answers("4", "V"), "Use V = E / Q."),
    short("A 3 V component transfers energy to 7 C of charge. How much energy is transferred?", answers("21", "J"), "Use E = VQ."),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Say voltage back in words as energy per coulomb.";
  return [
    mc("Why is voltage not the same quantity as current?", ["Voltage is energy per charge, while current is charge flow rate.", "Voltage is the same as current in different wires.", "Voltage is a type of resistance.", "Current is measured in joules per coulomb."], 0, "Voltage and current answer different circuit questions.", hint),
    mc("What is the best interpretation of a 6 V supply?", ["Each coulomb gains 6 J of energy from the source.", "6 C passes each second.", "The route has 6 ohms of resistance.", "6 charges are stored in the battery."], 0, "A voltage statement is an energy-per-charge statement.", hint),
    mc("Why is 'more volts means more current' too weak on its own?", ["Current also depends on the circuit resistance, while voltage is only energy per charge.", "Voltage never affects current.", "Current and charge are the same.", "Voltage is measured without using charge."], 0, "Voltage and current are linked but not identical.", hint),
    mc("Which statement best matches the lesson idea?", ["A cell gives energy to each coulomb that passes through it.", "A cell uses up charge and sends back empty wire.", "A cell stores current until the switch opens.", "A cell is the same thing as a resistor."], 0, "The source role is to provide energy per charge.", hint),
    mc("If one source gives 12 J to each 2 C of charge, what is its voltage?", ["6 V", "24 V", "10 V", "0.17 V"], 0, "Use V = E / Q.", hint),
    mc("Which quantity must be known with charge to calculate voltage directly?", ["energy transferred", "time taken", "resistance", "current"], 0, "Voltage is energy per charge.", hint),
    mc("Why is 1 J not the same type of statement as 1 V?", ["1 J is an amount of energy, but 1 V is energy per coulomb.", "1 V is just a larger energy unit.", "1 J measures charge directly.", "1 V is current divided by time."], 0, "Voltage includes a per-charge idea.", hint),
    mc("If the voltage across a component stays the same but twice as much charge passes, what happens to the energy transferred?", ["It doubles.", "It halves.", "It stays fixed.", "It becomes resistance."], 0, "Use E = VQ.", hint),
    mc("Which sentence is strongest?", ["Voltage tells what each coulomb gets, not how many coulombs move each second.", "Voltage tells how many charges move past a point each second.", "Voltage tells how much charge is stored in a wire.", "Voltage tells how hard the route is for charge to follow."], 0, "Voltage is an energy-per-charge statement.", hint),
    mc("A learner says 'this battery is 9 V because it contains 9 C of charge.' What is the first correction?", ["Voltage is about energy per charge, not the total amount of charge inside the battery.", "Batteries can never contain charge.", "9 V is actually a current.", "Charge is measured in volts."], 0, "A voltage statement is not a charge-store statement.", hint),
    mc("Which pair belongs together?", ["voltage and joules per coulomb", "current and joules per coulomb", "resistance and coulombs per second", "charge and volts per second"], 0, "Voltage is measured as joules per coulomb.", hint),
    mc("What is the cleanest reading of 1.5 V?", ["1.5 J transferred per coulomb", "1.5 C transferred per second", "1.5 ohms of opposition", "1.5 J transferred in total"], 0, "Read voltage back as energy per charge.", hint),
    mc("Why is it useful to say voltage is 'energy per charge' before doing a calculation?", ["It keeps the symbols tied to the physical meaning and prevents current language from taking over.", "It removes the need to know charge.", "It proves all circuits have the same current.", "It turns voltage into a type of resistance."], 0, "Meaning first makes the symbols safer to use.", hint),
    mc("If a component transfers 30 J while 5 C passes, which statement is strongest?", ["The potential difference across it is 6 V.", "The current is 6 A.", "Its resistance is 6 ohms.", "Its power is 6 W."], 0, "Use V = E / Q and keep the quantity label correct.", hint),
    mc("What does increasing the voltage of a cell change first in the lesson story?", ["the energy given to each coulomb", "the number of electrons in each coulomb", "the total resistance of the wire", "the mass of the charge carriers"], 0, "Higher voltage means more energy per charge.", hint),
    mc("Which statement best separates energy transferred from potential difference?", ["Energy transferred is the total amount, while potential difference is the amount per unit charge.", "Potential difference is the total energy and energy transferred is the amount per charge.", "They are exactly the same quantity.", "Neither depends on charge."], 0, "Voltage is the per-charge version of the energy story.", hint),
    mc("A 3 V component receives 2 C, while a 6 V component receives the same 2 C. Which transfers more energy?", ["the 6 V component", "the 3 V component", "they transfer the same energy", "you need current first"], 0, "At the same charge, larger voltage means larger energy transfer.", hint),
    mc("Why is a 12 V car battery useful to describe before the circuit current is known?", ["It already tells you the energy per charge the source can provide.", "It already tells you the current in every possible circuit.", "It already tells you the resistance of the wires.", "It already tells you how many electrons exist in the car."], 0, "Voltage is a source property about energy per charge.", hint),
    mc("Which lesson claim is strongest?", ["A source can give a large voltage without you yet knowing the current, because voltage and current are different quantities.", "If the voltage is known, the current must always be known too.", "A large voltage means the circuit contains more charge carriers.", "Voltage is the same thing as resistance if the battery is strong enough."], 0, "Voltage and current are related but not the same quantity.", hint),
    mc("When you see V = E / Q, what should stay visible in words?", ["energy transferred for each coulomb", "charge per second", "route difficulty", "series current rule"], 0, "The equation should be read back into the lesson meaning.", hint),
  ];
}

function l3MasteryRaw(): RawItem[] {
  const hint = "Use V = E / Q or E = VQ, then say the answer back as energy per charge or total transferred energy.";
  return [
    ...l3ConceptRaw(),
    short("36 J is transferred when 6 C passes. What is the potential difference?", answers("6", "V"), "Use V = E / Q."),
    short("45 J is transferred when 9 C passes. What is the potential difference?", answers("5", "V"), "Use V = E / Q."),
    short("14 J is transferred when 2 C passes. What is the potential difference?", answers("7", "V"), "Use V = E / Q."),
    short("9 J is transferred when 1.5 C passes. What is the potential difference?", answers("6", "V", "6.0 V"), "Use V = E / Q."),
    short("5 J is transferred when 0.5 C passes. What is the potential difference?", answers("10", "V"), "Use V = E / Q."),
    short("32 J is transferred when 8 C passes. What is the potential difference?", answers("4", "V"), "Use V = E / Q."),
    short("2.4 J is transferred when 0.4 C passes. What is the potential difference?", answers("6", "V", "6.0 V"), "Use V = E / Q."),
    short("16 J is transferred when 4 C passes. What is the potential difference?", answers("4", "V"), "Use V = E / Q."),
    short("21 J is transferred when 7 C passes. What is the potential difference?", answers("3", "V"), "Use V = E / Q."),
    short("54 J is transferred when 6 C passes. What is the potential difference?", answers("9", "V"), "Use V = E / Q."),
    short("A 2 V source moves 5 C of charge. How much energy is transferred?", answers("10", "J"), "Use E = VQ."),
    short("A 4 V source moves 6 C of charge. How much energy is transferred?", answers("24", "J"), "Use E = VQ."),
    short("A 9 V source moves 2 C of charge. How much energy is transferred?", answers("18", "J"), "Use E = VQ."),
    short("A 1.5 V cell moves 8 C of charge. How much energy is transferred?", answers("12", "J"), "Use E = VQ."),
    short("A 7 V source moves 3 C of charge. How much energy is transferred?", answers("21", "J"), "Use E = VQ."),
    short("A 0.5 V source moves 10 C of charge. How much energy is transferred?", answers("5", "J"), "Use E = VQ."),
    short("A 12 V source moves 0.5 C of charge. How much energy is transferred?", answers("6", "J"), "Use E = VQ."),
    short("A 24 V source moves 1.5 C of charge. How much energy is transferred?", answers("36", "J"), "Use E = VQ."),
    short("A 3 V component receives 9 C. How much energy is transferred?", answers("27", "J"), "Use E = VQ."),
    short("A 6 V component receives 4 C. How much energy is transferred?", answers("24", "J"), "Use E = VQ."),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Put the resistance story on the route: material, length, and cross-sectional area.";
  return [
    mc("What does electrical resistance describe?", ["how strongly a component or path opposes current", "the energy per charge from a cell", "the charge flow rate in a wire", "the total charge stored in a circuit"], 0, "Resistance is opposition to current in the route.", hint),
    mc("Two wires are the same material and thickness, but one is longer. Which has greater resistance?", ["the longer wire", "the shorter wire", "they are equal", "you need the battery voltage only"], 0, "Longer route means greater resistance when other factors stay the same.", hint),
    mc("Two wires are the same material and length, but one is thicker. Which has lower resistance?", ["the thicker wire", "the thinner wire", "they are equal", "you cannot tell"], 0, "Greater cross-sectional area lowers resistance.", hint),
    mc("Why does a thin wire usually have more resistance than a thick wire of the same material and length?", ["Charge carriers have less cross-sectional area to move through.", "It always contains less charge.", "Its voltage must be smaller.", "It stores current more tightly."], 0, "Wider route means less opposition.", hint),
    mc("Which statement is strongest?", ["Resistance belongs to the route or component, not to the battery.", "Resistance is just another name for current.", "Resistance is energy per charge.", "Resistance is the amount of charge in the cell."], 0, "Resistance is a path property.", hint),
    mc("If two wires are made of different materials but have the same length and thickness, what can still differ?", ["their resistance", "their charge unit", "their voltage unit", "their time unit"], 0, "Material type affects resistance.", hint),
    mc("With the same cell attached, which route should carry the smaller current?", ["the route with the greater resistance", "the route with the smaller resistance", "both always carry the same current", "the route with the brighter wire color"], 0, "Greater resistance allows less current for the same source.", hint),
    mc("Which change tends to reduce resistance?", ["making the wire shorter", "making the wire thinner", "using a poorer conductor", "adding more route length"], 0, "Shorter route means less opposition.", hint),
    mc("Which combination gives the greatest resistance?", ["long, thin wire of a poorer conductor", "short, thick wire of a good conductor", "short, thin wire of copper", "thick, wide copper busbar"], 0, "Material and geometry both matter.", hint),
    mc("Why is it weak to say 'the battery has high resistance' when comparing wires?", ["The lesson's resistance story belongs mainly to the route or component being compared.", "Batteries can never be connected to wires.", "Resistance is measured only in joules.", "Current and resistance are identical."], 0, "Keep source and route roles separate.", hint),
    mc("What happens to resistance if wire length increases but material and area stay the same?", ["It increases.", "It decreases.", "It stays the same.", "It becomes voltage."], 0, "Longer route means more opposition.", hint),
    mc("What happens to resistance if cross-sectional area increases but material and length stay the same?", ["It decreases.", "It increases.", "It stays the same.", "It becomes current."], 0, "Wider route means easier flow.", hint),
    mc("Why does a heating element often use a material like nichrome rather than copper?", ["It offers more resistance for a similar shape.", "It removes the need for a power supply.", "It contains more charge carriers in total.", "It makes voltage unnecessary."], 0, "A heater uses a material with higher resistance.", hint),
    mc("Which route should allow charge to move most easily?", ["short, thick copper wire", "long, thin nichrome wire", "long, thin steel wire", "thin graphite strip"], 0, "Good conductor plus short and thick gives the least opposition.", hint),
    mc("If two otherwise identical wires are compared and one carries less current from the same source, what is the best explanation?", ["It has greater resistance.", "It contains less energy per charge.", "It has no charge carriers at all.", "Its current must be using itself up."], 0, "For the same source, smaller current points to greater route resistance.", hint),
    mc("What should you compare first when deciding which wire has greater resistance?", ["material, length, and cross-sectional area", "battery label and lamp brightness", "charge unit and time unit", "switch color and room temperature"], 0, "Resistance is a route-property comparison.", hint),
    mc("Which lesson sentence is strongest?", ["A longer path gives carriers more opposition, so resistance is larger.", "A longer path stores more current.", "A longer path increases voltage automatically.", "A longer path destroys electrons."], 0, "Use route language, not current-storage language.", hint),
    mc("Why can two circuits with the same cell still have different currents?", ["Their routes can have different resistances.", "Current never depends on the route.", "The battery can choose different units.", "Charge carriers can only move in one material."], 0, "Same source does not force same current if the route changes.", hint),
    mc("Which statement about resistance is wrong?", ["A wider wire has more resistance than a thinner wire of the same length and material.", "A longer wire can have greater resistance than a shorter one.", "Material type affects resistance.", "Resistance belongs to the route or component."], 0, "Wider wire usually lowers resistance, not raises it.", hint),
    mc("A student says 'current is smaller because the battery is tired' while comparing a long wire with a short wire on the same fresh cell. What should be corrected first?", ["The wire comparison changes the route resistance, which is the key lesson idea here.", "Battery age is the only thing that ever matters.", "Wire length does not affect circuits.", "Current and resistance are the same quantity."], 0, "The lesson focus is the route property, not a battery slogan.", hint),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Use material and geometry before any equation language.";
  return [
    mc("Why is resistance called a route property in this lesson?", ["Because it depends on the material and shape of the path charge must travel through.", "Because it is stored in the battery only.", "Because it measures charge flow rate directly.", "Because it is the same as voltage."], 0, "Resistance belongs to the path or component.", hint),
    mc("What is the strongest reason a long thin nichrome wire can have much greater resistance than a short thick copper wire?", ["It differs in both material and geometry.", "It differs only in battery type.", "It differs only in current unit.", "It differs only in charge amount."], 0, "Material and geometry combine in the resistance story.", hint),
    mc("Why is 'the thin wire has less current because it contains less charge' a weak explanation?", ["The key lesson idea is that thinner route geometry gives greater resistance.", "Charge never matters in circuits.", "Current is measured in volts.", "Thin wires always increase battery voltage."], 0, "The route property explains the current change.", hint),
    mc("Which change isolates the effect of length on resistance?", ["Change only the wire length while keeping material and area the same.", "Change material and thickness together.", "Change the battery and the lamp together.", "Change current and voltage at the same time."], 0, "To isolate length, keep the other route features fixed.", hint),
    mc("Which change isolates the effect of cross-sectional area on resistance?", ["Compare wires of the same material and length but different thickness.", "Compare different batteries only.", "Compare circuits with different numbers of lamps only.", "Compare wires with different lengths and materials together."], 0, "Area should be the only changed route feature.", hint),
    mc("Why does a good conductor usually have lower resistance than a poor conductor of the same size?", ["Its material lets charge carriers move with less opposition.", "It always contains more voltage.", "It stores less charge.", "It removes the need for a source."], 0, "Material affects how strongly the path opposes current.", hint),
    mc("What is the cleanest prediction for the same cell connected first to a short thick copper wire and then to a longer thinner copper wire?", ["The longer thinner wire will carry less current because its resistance is greater.", "Both wires must carry the same current because the cell is unchanged.", "The longer thinner wire will have no charge carriers.", "The longer thinner wire will raise the cell voltage."], 0, "Same source plus greater resistance means smaller current.", hint),
    mc("Why is it stronger to say 'the current is smaller because resistance is larger' than 'the current is smaller because the wire is weak'?", ["Resistance names the specific route property that matters.", "Weak wires cannot conduct at all.", "Current and resistance are the same quantity.", "The lesson bans comparing wire materials."], 0, "Use the proper quantity name.", hint),
    mc("Which route change should lower resistance the most?", ["shorter and thicker", "longer and thinner", "same length but poorer conductor", "thinner only"], 0, "Shorter and thicker both reduce opposition.", hint),
    mc("A learner says 'resistance belongs to the cell because changing the wire changed the current.' What should be corrected first?", ["Changing the wire changed the route property, so the wire is where the resistance story belongs.", "Cells never affect circuits.", "Current does not depend on the route.", "Resistance is just a unit label."], 0, "Changing the route changes the resistance story.", hint),
    mc("Which explanation best matches a filament lamp wire being thin and long?", ["That shape gives the route a relatively large resistance.", "That shape guarantees zero current.", "That shape removes the need for a battery.", "That shape means the lamp stores extra charge."], 0, "Thin and long both raise resistance.", hint),
    mc("Why can a short wide copper path be useful for connecting wires?", ["Its low resistance lets charge move more easily for the same source.", "It always increases voltage.", "It stores more current for later use.", "It removes the need for a return path."], 0, "Connecting wires are usually chosen to keep route resistance low.", hint),
    mc("Which statement best protects the topic from formula-only guessing?", ["Before calculating anything, compare the path material, length, and width.", "Current alone tells you resistance without any context.", "A bigger battery always means lower resistance.", "Resistance changes only when the circuit is switched off."], 0, "The route comparison comes first.", hint),
    mc("What is the most direct lesson reason a thicker wire usually carries more current from the same cell?", ["Its larger cross-sectional area gives lower resistance.", "It gives each coulomb more energy.", "It creates more charge carriers from nothing.", "It removes the need for a return path."], 0, "Larger area lowers resistance.", hint),
    mc("Why is 'the long wire has more resistance because there is more wire to oppose the charges' better than 'because the battery is weaker at the far end'?", ["It keeps the cause on the route instead of inventing a battery change.", "Batteries are never used with long wires.", "Charges cannot move far from a battery.", "Resistance is measured by distance alone."], 0, "The longer route is the key changed feature.", hint),
    mc("Two students compare steel and copper wires of the same size. Which prediction is strongest?", ["The copper wire should usually have lower resistance.", "The steel wire must always have zero current.", "Both must have identical resistance because their size matches.", "The copper wire must have higher voltage."], 0, "Material choice affects resistance even when size is fixed.", hint),
    mc("Which question is best when you see two circuits with different currents on the same source?", ["How do the route materials and geometries differ?", "Which battery label sounds stronger?", "Which wire is newer?", "Which component name is shorter?"], 0, "Route comparison is the lesson's first move.", hint),
    mc("Why can 'thin wire' and 'poor conductor' both reduce current without being the same reason?", ["One is a geometry change and the other is a material change, but both can increase resistance.", "They are actually the same physical change.", "Neither has anything to do with resistance.", "One changes current while the other changes only voltage."], 0, "Material and geometry are different levers on the same resistance story.", hint),
    mc("Which sentence is strongest?", ["Resistance changes how much current a given source can drive because it belongs to the route.", "Resistance is the same as charge flow rate.", "Resistance is created only inside batteries.", "Resistance tells you how many joules are in the circuit."], 0, "Keep route opposition and current response linked.", hint),
    mc("What should stay visible in a strong resistance explanation?", ["material, length, and cross-sectional area", "battery color, switch size, and lamp shape", "current unit, time unit, and energy unit", "charge amount only"], 0, "The route-comparison variables should stay explicit.", hint),
  ];
}

function l4MasteryRaw(): RawItem[] {
  const hint = "Keep the explanation on the route: material, length, width, then current response.";
  return [
    ...l4ConceptRaw(),
    mc("Wire A and wire B are the same material and length, but B has half the cross-sectional area of A. Which statement is strongest?", ["Wire B has greater resistance and should carry less current from the same cell.", "Wire B has lower resistance because it uses less metal.", "Both wires have the same resistance because their material matches.", "Wire B must carry more current because it is narrower."], 0, "Smaller area means greater resistance.", hint),
    mc("A long extension lead is made from the same material and thickness as a short lead. Why can the long lead reduce the current in the circuit?", ["Its greater length gives greater resistance.", "It stores the current inside itself.", "It creates extra voltage drop by making more charge.", "It destroys electrons before they reach the appliance."], 0, "Longer route means more opposition.", hint),
    mc("Which wire design is best if you want the smallest resistance connection to a battery?", ["short and thick copper", "long and thin nichrome", "long and thin copper", "short and thin steel"], 0, "Good conductor, short length, and large area minimize resistance.", hint),
    mc("Why is it weak to compare wires by saying only 'this one is better'?", ["The lesson needs you to name the route feature, such as material, length, or cross-sectional area.", "All wires behave exactly the same.", "Wire comparisons do not belong in electricity.", "Voltage cannot be affected by circuit design."], 0, "Strong answers name the actual resistance lever.", hint),
    mc("A student keeps the same cell but swaps a thick connecting wire for a thinner wire and sees a smaller current. Which explanation is strongest?", ["The thinner route has greater resistance.", "The cell has become weaker because of the swap.", "The wire now contains fewer joules per coulomb.", "Current has been used up before reaching the wire."], 0, "The route change is the cause.", hint),
    mc("A copper wire and a nichrome wire have the same dimensions. Which should usually have the higher resistance?", ["nichrome", "copper", "they must be equal", "you need time first"], 0, "Nichrome is used when a larger resistance is wanted.", hint),
    mc("Which comparison isolates the effect of material most cleanly?", ["same length and area, different material", "same material, different length", "same material, different area", "different battery, same wire"], 0, "Only the material should change.", hint),
    mc("A thin filament and a thick copper lead carry the same circuit current in a simple lamp circuit. Why does that not mean they have the same resistance?", ["The same series current does not force identical component resistances.", "Current always equals resistance.", "Resistance can be compared only when the circuit is open.", "The filament has no resistance because it glows."], 0, "Series current can be common even when route resistances differ.", hint),
    mc("Why can a resistor be described as making the route harder for charge?", ["It adds opposition to the charge flow.", "It gives each coulomb extra energy.", "It creates charge carriers inside the wire.", "It removes the need for a battery."], 0, "Resistance is opposition in the route.", hint),
    mc("Which design change would most likely increase resistance in a sensor wire?", ["make it longer and thinner", "make it shorter and thicker", "replace it with a better conductor", "remove part of its route"], 0, "Longer and thinner both raise resistance.", hint),
    mc("A question asks why two circuits on identical cells draw different currents. Which opening sentence is strongest?", ["First compare the resistance of the routes.", "First assume the batteries are secretly different.", "First ignore the wires and look only at charge units.", "First assume the current is being used up."], 0, "Route resistance is the first check.", hint),
    mc("Which sentence best matches IGCSE-style resistance reasoning?", ["Greater resistance means the same source drives less current.", "Greater resistance means a larger voltage per coulomb automatically.", "Greater resistance means more charge is created.", "Greater resistance means the circuit is always open."], 0, "Greater opposition reduces current for the same supply.", hint),
    mc("Why is a short thick copper busbar used where large currents are needed?", ["Its low resistance makes charge flow easier.", "It produces a much higher voltage by itself.", "It stores more current for later use.", "It removes the need for a return path."], 0, "Low-resistance routes are used where easy flow is needed.", hint),
    mc("Two routes have the same length and thickness, but one is copper and one is graphite. Which statement is strongest?", ["The graphite route can have greater resistance because the material differs.", "They must behave identically because size matches.", "The copper route must always have zero resistance.", "Graphite routes cannot carry current."], 0, "Material difference alone can change resistance.", hint),
    mc("What is the cleanest correction to 'resistance is just slower current'?", ["Resistance is the route property that helps explain why the current may be smaller.", "Resistance and current are exactly the same quantity.", "Resistance is measured in amperes.", "Resistance appears only when no charge carriers exist."], 0, "Resistance explains current; it is not the current itself.", hint),
    mc("Which route should usually be chosen for a heating element?", ["a route with relatively high resistance", "the route with the least possible resistance", "a route with no material at all", "a route that makes current and voltage identical"], 0, "A heater is built around a larger route opposition.", hint),
    mc("Why is 'more wire means more resistance' acceptable only when other details are kept fixed?", ["Because material and cross-sectional area also affect resistance.", "Because resistance depends only on time.", "Because batteries change resistance whenever wire length changes.", "Because wire length never matters in circuits."], 0, "Length is one factor, not the only factor.", hint),
    mc("A technician replaces a long sensor wire with a shorter wire of the same material and area. What is the best prediction?", ["The resistance falls, so the same source can drive a larger current.", "The resistance rises because the route is more direct.", "The voltage disappears from the circuit.", "The current must stay unchanged because the material is the same."], 0, "Shorter route means lower resistance.", hint),
    mc("Which sentence best protects the topic from battery-only explanations?", ["Even with the same source, changing the route can change the resistance and therefore the current.", "The source determines everything, so route changes do not matter.", "Only open switches affect current.", "Resistance belongs only to the battery terminals."], 0, "The route still matters even when the source is fixed.", hint),
    mc("When ranking resistance, what should you compare first if the circuits all use the same cell?", ["the component or path properties", "the color of the ammeter", "the total charge stored in the room", "the order of the component labels"], 0, "Resistance ranking starts with path comparison.", hint),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Hold the component conditions fixed and use Ohm's law as a relation between voltage, current, and resistance.";
  return [
    mc("Which equation gives current directly from voltage and resistance for an ohmic component?", ["I = V / R", "V = E / Q", "Q = It", "P = IV"], 0, "Ohm's law can be rearranged to I = V / R.", hint),
    mc("For an ohmic resistor at fixed conditions, if the voltage doubles what happens to the current?", ["It doubles.", "It halves.", "It stays the same.", "It becomes zero."], 0, "Current is proportional to voltage at fixed resistance.", hint),
    mc("For a fixed voltage supply, what happens to the current if the resistance doubles?", ["It halves.", "It doubles.", "It stays the same.", "It becomes voltage."], 0, "At fixed voltage, larger resistance means smaller current.", hint),
    mc("What does a straight I-V graph through the origin show?", ["current is proportional to voltage", "resistance is zero in every case", "charge is used up by the resistor", "current is independent of voltage"], 0, "A straight origin-passing graph is the ohmic clue.", hint),
    mc("A 12 V supply is connected across a 4 ohm resistor. What current flows?", ["3 A", "4 A", "8 A", "48 A"], 0, "Use I = V / R.", hint),
    mc("A 6 V supply drives 2 A through a resistor. What is its resistance?", ["3 ohms", "12 ohms", "8 ohms", "0.33 ohms"], 0, "Use R = V / I.", hint),
    mc("Why is Ohm's law not just a memorized slogan?", ["It explains how current responds when voltage or resistance changes under fixed conditions.", "It says all circuits have the same current.", "It replaces the need to know what voltage means.", "It works without caring about the component."], 0, "The law has a physical meaning and a condition.", hint),
    mc("Which statement is strongest?", ["At fixed resistance, a larger voltage gives a larger current.", "A larger voltage always means the same current.", "Current and resistance are identical.", "Resistance becomes smaller whenever current increases."], 0, "State what is fixed and what changes.", hint),
    mc("Which quantity should stay fixed if you want to isolate the effect of changing voltage on current?", ["resistance", "charge", "time", "mass"], 0, "Hold resistance fixed to study voltage-current proportionality.", hint),
    mc("Which quantity should stay fixed if you want to isolate the effect of changing resistance on current?", ["voltage", "charge", "current", "time"], 0, "Hold voltage fixed to study the resistance effect.", hint),
    short("A 10 V supply is connected across a 5 ohm resistor. What current flows?", answers("2", "A"), "Use I = V / R."),
    short("A 9 V supply is connected across a 3 ohm resistor. What current flows?", answers("3", "A"), "Use I = V / R."),
    short("A 15 V supply is connected across a 5 ohm resistor. What current flows?", answers("3", "A"), "Use I = V / R."),
    short("A 20 V supply is connected across a 4 ohm resistor. What current flows?", answers("5", "A"), "Use I = V / R."),
    short("A resistor carries 4 A when 8 V is applied. What is its resistance?", answers("2", "ohms"), "Use R = V / I."),
    short("A resistor carries 2 A when 12 V is applied. What is its resistance?", answers("6", "ohms"), "Use R = V / I."),
    short("A resistor carries 0.5 A when 6 V is applied. What is its resistance?", answers("12", "ohms"), "Use R = V / I."),
    short("A resistor carries 3 A when 18 V is applied. What is its resistance?", answers("6", "ohms"), "Use R = V / I."),
    short("A resistor of 8 ohms carries 2 A. What voltage is across it?", answers("16", "V"), "Use V = IR."),
    short("A resistor of 3 ohms carries 4 A. What voltage is across it?", answers("12", "V"), "Use V = IR."),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Say what is fixed before you say what changes.";
  return [
    mc("Why is it weak to say 'more current means more voltage' without naming any condition?", ["Because current also depends on resistance, so one variable must be held fixed.", "Because voltage never affects current.", "Because current and voltage are the same quantity.", "Because Ohm's law works only with batteries off."], 0, "Ohm's law is a relation with a condition, not a slogan.", hint),
    mc("What is the strongest reading of a straight I-V graph through the origin for an ohmic resistor?", ["Current is directly proportional to voltage under fixed conditions.", "Resistance becomes zero at all voltages.", "The battery is creating charge.", "Current is unrelated to voltage."], 0, "Graph shape supports the proportional statement.", hint),
    mc("Why must the phrase 'other conditions stay constant' matter in Ohm's law?", ["Because the proportional relation is for the same component under fixed conditions.", "Because current exists only when conditions change.", "Because voltage is measured only when conditions are ignored.", "Because resistance never matters."], 0, "The condition belongs to the meaning of the law.", hint),
    mc("Which sentence best links formula and meaning?", ["I = V / R means current gets larger if voltage rises while resistance stays fixed.", "I = V / R means voltage and resistance are the same thing.", "I = V / R means current depends only on voltage.", "I = V / R means resistance disappears once current flows."], 0, "Read the formula back into the lesson meaning.", hint),
    mc("A resistor's I-V graph is straight and passes through the origin. Which conclusion is strongest?", ["It behaves ohmically over that range.", "Its resistance must be zero.", "It creates charge at higher voltages.", "Its current is always constant."], 0, "The graph shape is the key ohmic clue.", hint),
    mc("If the voltage across an ohmic resistor is tripled and its resistance is unchanged, what happens to the current?", ["It triples.", "It stays the same.", "It becomes one-third.", "It falls to zero."], 0, "At fixed resistance, current is proportional to voltage.", hint),
    mc("If the resistance is tripled while the voltage is unchanged, what happens to the current?", ["It becomes one-third.", "It triples.", "It stays the same.", "It doubles."], 0, "At fixed voltage, current is inversely related to resistance.", hint),
    mc("Why is 'high current means low resistance' incomplete without more context?", ["Because voltage may also have changed.", "Because resistance never affects current.", "Because current is measured in ohms.", "Because voltage and resistance are identical."], 0, "You need to know what was held fixed.", hint),
    mc("Which pair should be compared to calculate resistance directly?", ["voltage and current", "charge and time", "energy and charge", "mass and length"], 0, "Use R = V / I.", hint),
    mc("What does the slope clue on an I-V graph help you compare?", ["how much current changes for a given change in voltage", "how much charge is stored in the resistor", "how long the current has existed", "whether the battery is charged"], 0, "The graph compares current response to voltage change.", hint),
    mc("Which statement best protects the lesson from memorized chanting?", ["A good Ohm's-law answer names what is fixed, what changes, and how the current responds.", "Just writing V = IR is always enough.", "The formula matters but the meaning does not.", "Current can be found without naming quantities."], 0, "Meaning and condition should stay visible.", hint),
    mc("A resistor gives points (2 V, 1 A), (4 V, 2 A), and (6 V, 3 A). What is the strongest conclusion?", ["The resistor is behaving ohmically with a constant resistance of 2 ohms.", "The resistance is increasing each time.", "The current is independent of voltage.", "The data show a broken circuit."], 0, "The ratio V/I stays constant and the graph would be straight.", hint),
    mc("Why is current not the same thing as voltage even though Ohm's law links them?", ["Current is charge flow rate, while voltage is energy per charge.", "They have the same unit.", "One is used only in series circuits and the other only in parallel.", "Current belongs to batteries and voltage belongs to wires."], 0, "Linked quantities are not identical quantities.", hint),
    mc("What should you say before using V = IR in words?", ["Potential difference equals current times resistance for an ohmic component under fixed conditions.", "Voltage is always current squared.", "Resistance is charge divided by time.", "Current is energy per charge."], 0, "State the actual meaning of the relation.", hint),
    mc("A learner says 'the current doubled, so the resistor doubled too.' What should be corrected first?", ["Resistance is not the response quantity; current can double because voltage doubled at fixed resistance.", "Resistors always double when current changes.", "Current never changes in a circuit.", "Voltage is irrelevant."], 0, "Separate the controlled variable from the response.", hint),
    mc("Which statement about proportionality is strongest?", ["If voltage doubles and current doubles, resistance can stay constant.", "If voltage doubles, resistance must double too.", "If current doubles, voltage must stay constant.", "Proportionality means current and resistance are equal."], 0, "Doubling V and I together can preserve the same resistance.", hint),
    mc("Why is a graph clue useful in this lesson?", ["It shows whether the current-voltage relation is proportional rather than just giving one isolated calculation.", "It removes the need for units.", "It makes resistance unimportant.", "It shows how much charge is stored."], 0, "The graph tests the relation, not just one number.", hint),
    mc("Which sentence best matches IGCSE-style circuit reasoning?", ["For a given ohmic resistor, larger potential difference gives proportionally larger current.", "Potential difference is just another name for current.", "Resistance depends only on charge and time.", "Any straight graph means charge is conserved."], 0, "Use the proper quantity meanings and the proportional rule.", hint),
    mc("What is the cleanest check if a student gives a current answer from Ohm's law?", ["Ask whether the voltage and resistance used belong to the same component or route under discussion.", "Ask whether the wire color looks correct.", "Ask whether the battery brand is famous.", "Ask whether the charge carriers are visible."], 0, "Good Ohm's-law work still has to match the physical circuit.", hint),
    mc("When does the formula V = IR become a safer answer?", ["When the learner can also explain the current-voltage-resistance relation in words.", "As soon as the symbols are memorized with no meaning.", "Only when the current is zero.", "Only in circuits with one lamp."], 0, "Formula and meaning should stay linked.", hint),
    mc("A component gives a curved I-V graph that becomes shallower as voltage rises. What is the strongest interpretation?", ["Its effective resistance is increasing as the operating point changes.", "Its resistance must stay constant because the graph still rises.", "It is behaving ohmically because current still increases.", "Its current and voltage are unrelated."], 0, "A shallower rise means less extra current for each extra volt.", hint),
    mc("Two straight origin-passing I-V graphs are drawn on the same axes. Graph X is steeper than graph Y. Which component has the lower resistance?", ["X", "Y", "Both have the same resistance.", "The graph does not give any resistance clue."], 0, "More current for each volt means a lower resistance.", hint),
    mc("A single point on an I-V graph gives 6 V and 2 A. Which statement is safest?", ["The resistance at that operating point is 3 ohms, but one point alone does not prove the whole component is ohmic.", "The component must be ohmic because V / I can be calculated once.", "The resistance can never change after that point.", "The voltage and current are the same quantity there."], 0, "One point gives one ratio, not the whole graph behaviour.", hint),
    mc("Why is a filament lamp often used as a contrast to an ohmic resistor?", ["Its I-V graph curves because the resistance changes as it heats up.", "Its graph is always a straight line through the origin.", "It keeps the same resistance at every operating point.", "It removes the need to compare voltage and current."], 0, "The contrast is about changing resistance, not about having no relationship at all.", hint),
  ];
}

function l5MasteryRaw(): RawItem[] {
  return [
    ...l5ConceptRaw(),
    short("A 24 V supply is connected across an 8 ohm resistor. What current flows?", answers("3", "A"), "Use I = V / R."),
    short("A 18 V supply is connected across a 6 ohm resistor. What current flows?", answers("3", "A"), "Use I = V / R."),
    short("A 7.5 V supply is connected across a 3 ohm resistor. What current flows?", answers("2.5", "A", "2.50 A"), "Use I = V / R."),
    short("A 30 V supply is connected across a 10 ohm resistor. What current flows?", answers("3", "A"), "Use I = V / R."),
    short("A 2.4 V supply is connected across a 6 ohm resistor. What current flows?", answers("0.4", "A", "0.40 A"), "Use I = V / R."),
    short("A 16 V supply is connected across a 4 ohm resistor. What current flows?", answers("4", "A"), "Use I = V / R."),
    short("A 5 V supply is connected across a 2 ohm resistor. What current flows?", answers("2.5", "A", "2.50 A"), "Use I = V / R."),
    short("A 9 V supply is connected across a 1.5 ohm resistor. What current flows?", answers("6", "A"), "Use I = V / R."),
    short("A 14 V supply is connected across a 7 ohm resistor. What current flows?", answers("2", "A"), "Use I = V / R."),
    short("A 3 V supply is connected across a 12 ohm resistor. What current flows?", answers("0.25", "A", "0.250 A"), "Use I = V / R."),
    short("A resistor carries 5 A when 25 V is applied. What is its resistance?", answers("5", "ohms"), "Use R = V / I."),
    short("A resistor carries 1.5 A when 12 V is applied. What is its resistance?", answers("8", "ohms"), "Use R = V / I."),
    short("A resistor carries 0.4 A when 2 V is applied. What is its resistance?", answers("5", "ohms"), "Use R = V / I."),
    short("A resistor carries 2 A when 30 V is applied. What is its resistance?", answers("15", "ohms"), "Use R = V / I."),
    short("A resistor carries 3 A when 9 V is applied. What is its resistance?", answers("3", "ohms"), "Use R = V / I."),
    short("A current of 4 A flows through a 6 ohm resistor. What voltage is across it?", answers("24", "V"), "Use V = IR."),
    short("A current of 0.5 A flows through a 20 ohm resistor. What voltage is across it?", answers("10", "V"), "Use V = IR."),
    short("A current of 2.5 A flows through a 8 ohm resistor. What voltage is across it?", answers("20", "V"), "Use V = IR."),
    short("A current of 1.2 A flows through a 5 ohm resistor. What voltage is across it?", answers("6", "V"), "Use V = IR."),
    short("A current of 6 A flows through a 2 ohm resistor. What voltage is across it?", answers("12", "V"), "Use V = IR."),
    short("An ohmic resistor gives the point (3 V, 0.75 A). What is its resistance?", answers("4", "ohms"), "Use R = V / I at that operating point."),
    short("The same straight origin-passing I-V graph also includes (9 V, ?). What current should match 9 V?", answers("2.25", "A", "2.25 A"), "For the same ohmic resistor, keep the same resistance or use direct proportionality."),
    short("A filament lamp gives 3.0 V and 0.50 A at one operating point. What is the resistance at that point?", answers("6", "ohms"), "Use R = V / I for that one operating point."),
    short("The same filament lamp gives 9.0 V and 0.80 A at a hotter operating point. What is the resistance there?", answers("11.25", "ohms", "11.3 ohms"), "Use R = V / I again and compare the new value."),
    short("A straight origin-passing I-V graph includes the point (10 V, 2 A). What current should the same component carry at 15 V?", answers("3", "A"), "Keep the same resistance or use direct proportionality."),
    short("A resistor carries 0.60 A when 12 V is applied. What is its resistance?", answers("20", "ohms"), "Use R = V / I."),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Identify the circuit layout first: one route means series, while shared start-and-end junctions mean parallel.";
  return [
    mc("Which description best identifies a series circuit?", ["There is one complete route for the charge through all components.", "Each component has its own separate battery.", "The current must split into branches.", "Every component gets a different current by design."], 0, "A series circuit is the one-route layout.", hint),
    mc("Which description best identifies a parallel circuit?", ["The components sit on separate branches between the same two junctions.", "There is only one route through every component.", "Every component must carry the same current.", "The battery voltage is used up by the first branch only."], 0, "Parallel circuits are branch circuits between the same two points.", hint),
    mc("What stays the same through components connected in series?", ["current", "potential difference across each component", "resistance of each component", "power of each component"], 0, "One route means one current.", hint),
    mc("What stays the same across branches connected in parallel?", ["potential difference", "current in every branch", "resistance of every branch", "power in every branch"], 0, "Each branch spans the same two supply points.", hint),
    mc("How is the source current related to branch currents in a parallel circuit?", ["The source current equals the sum of the branch currents.", "The source current equals the smallest branch current.", "The source current equals the voltage across one branch.", "The source current is always the same as one branch current."], 0, "Charge conservation at junctions gives the current-sum rule.", hint),
    mc("What happens to the total resistance when another resistor is added in series?", ["It increases.", "It decreases.", "It stays the same.", "It becomes zero."], 0, "Series difficulties add along one route.", hint),
    mc("What usually happens to the total current drawn from a cell when an extra branch is added in parallel?", ["It increases.", "It decreases to zero.", "It stays fixed.", "It becomes equal to the current in just one branch."], 0, "Adding a branch makes another path for charge.", hint),
    mc("One lamp breaks in a two-lamp series circuit. What happens?", ["Both lamps go out because the one route is broken.", "Only the broken lamp goes out.", "The other lamp gets brighter.", "The battery doubles its voltage."], 0, "A series circuit depends on one unbroken route.", hint),
    mc("One lamp breaks in one branch of a two-branch parallel circuit. What happens to the other branch?", ["It can keep working because its route is still complete.", "It must also switch off because all current stops.", "Its voltage becomes zero automatically.", "Its resistance must double."], 0, "Other complete branches can still operate.", hint),
    mc("Two parallel branches have the same voltage across them, but one branch has a smaller resistance. Which branch carries the larger current?", ["the smaller-resistance branch", "the larger-resistance branch", "both branches must carry the same current", "you cannot compare branch currents in parallel"], 0, "At the same voltage, the smaller resistance gives the larger current.", hint),
    short("A 2 ohm resistor and a 3 ohm resistor are connected in series. What is the total resistance?", answers("5", "ohms"), "In series, add the resistances."),
    short("A 4 ohm resistor and a 6 ohm resistor are connected in series. What is the total resistance?", answers("10", "ohms"), "In series, add the resistances."),
    short("A 12 V supply is connected across a series circuit with total resistance 6 ohms. What current flows?", answers("2", "A"), "Use I = V / R with the total series resistance."),
    short("A 9 V supply is connected across a 3 ohm branch in parallel. What current flows in that branch?", answers("3", "A"), "Use I = V / R for that branch."),
    short("A parallel branch is connected directly across a 12 V supply. What voltage is across the branch?", answers("12", "V"), "Each parallel branch has the full supply potential difference."),
    short("Two parallel branches carry currents of 0.4 A and 0.6 A. What total current leaves the source?", answers("1", "A", "1.0 A"), "Add the branch currents."),
    short("The current in a series circuit is 2 A. What current passes through each lamp in the series route?", answers("2", "A"), "In series, the current is the same everywhere."),
    short("Two identical resistors are connected in series across an 8 V supply. What potential difference is across one resistor?", answers("4", "V"), "Equal series resistors share the supply equally."),
    short("A 6 V supply is across a 2 ohm branch in parallel. What branch current flows?", answers("3", "A"), "Use I = V / R for the branch."),
    short("Three branches carry 3 A, 1 A, and 2 A. What total current leaves the source?", answers("6", "A"), "Add the branch currents."),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Keep the topology visible: one-route series rules differ from shared-node parallel rules.";
  return [
    mc("Why is 'one route' the first clue that a circuit is series?", ["Because one route forces the same current through each component in turn.", "Because one route makes every voltage equal automatically.", "Because one route removes all resistance.", "Because one route means no battery is needed."], 0, "The one-route idea leads straight to the series current rule.", hint),
    mc("Why is 'same two junctions' the first clue that a circuit is parallel?", ["Because branches between the same two points share the same potential difference.", "Because branches must all have the same current.", "Because branches remove the need for a complete circuit.", "Because branches force every resistor to be equal."], 0, "Shared junctions explain the parallel voltage rule.", hint),
    mc("Why is it weak to say only 'current is the same in this circuit' without naming the layout?", ["Because that is a series rule, not a universal rule for every circuit.", "Because current never stays the same anywhere.", "Because current is measured in volts.", "Because only voltage matters in a circuit."], 0, "You must tie the rule to the topology.", hint),
    mc("Why is it weak to say only 'voltage is shared' without naming the layout?", ["Because that is a series-voltage idea, while full supply voltage belongs across parallel branches.", "Because voltage is never shared in circuits.", "Because current is always the only useful quantity.", "Because resistance cannot affect voltage."], 0, "Series and parallel voltage stories are different.", hint),
    mc("A learner says 'each branch in parallel gets less voltage because the battery has to divide it up.' What should be corrected first?", ["Each branch spans the same two supply points, so each gets the full branch voltage.", "The battery sends a different current to make the voltages match.", "Parallel branches never carry current.", "Batteries work only in series circuits."], 0, "Parallel branches share the same node-to-node push.", hint),
    mc("A learner says 'the first resistor in series uses up current before the second resistor gets any.' What should be corrected first?", ["The same current passes each series component because charge is conserved in the one route.", "Current is stored inside the first resistor.", "The second resistor has zero resistance.", "Series circuits work only with one resistor."], 0, "Current is not used up.", hint),
    mc("Why can branch currents be different in a parallel circuit even when branch voltages are the same?", ["Because the branch resistances can be different.", "Because charge conservation fails at junctions.", "Because one branch has no current at all by definition.", "Because voltage and current are the same quantity."], 0, "Same voltage does not force same current when resistances differ.", hint),
    mc("Why can potential differences across series components be different even though the current is the same?", ["Because different resistances can take different shares of the supply voltage.", "Because series current is not really the same.", "Because each component has a different battery inside it.", "Because voltage disappears after the first resistor."], 0, "Same current does not force equal voltage shares.", hint),
    mc("Why does adding another resistor in series usually make the whole circuit current smaller?", ["Because the total route resistance increases while the source stays the same.", "Because the battery always gets weaker when components are added.", "Because current is absorbed by the new resistor.", "Because voltage can no longer exist in the circuit."], 0, "More series opposition lowers the one-route current.", hint),
    mc("Why can adding another branch in parallel increase the total source current?", ["Because the circuit gains another route for charge, so the overall opposition is reduced.", "Because the battery creates extra current from nothing.", "Because every branch current must fall to zero.", "Because the voltage across each branch disappears."], 0, "An added branch offers an extra path.", hint),
    mc("Which statement best explains why a broken lamp stops a series circuit but not every parallel circuit?", ["A series break opens the only route, but a parallel break can leave other branches complete.", "Series lamps are weaker than parallel lamps.", "Parallel circuits do not need complete routes.", "Current can jump across gaps only in parallel circuits."], 0, "Topology decides whether other routes still exist.", hint),
    mc("Which sentence best protects the topic from label-only guessing?", ["First identify whether the question is about one route or multiple branches, then apply the current and voltage rule that fits that topology.", "Just memorize that current always stays the same.", "Just memorize that voltage always stays the same.", "Ignore the circuit diagram and use the component names only."], 0, "Good circuit reasoning starts with structure.", hint),
    mc("Why is 'series is same current' not enough on its own for IGCSE-style reasoning?", ["Because you often also need to discuss shared supply voltage and increased total resistance.", "Because current never matters in series circuits.", "Because series circuits cannot contain resistors.", "Because only power can be tested in series circuits."], 0, "A strong explanation links several ideas, not one slogan.", hint),
    mc("Why is 'parallel is same voltage' not enough on its own for IGCSE-style reasoning?", ["Because branch-current splitting and total-source current also matter.", "Because voltage is never important in parallel circuits.", "Because parallel circuits cannot be compared mathematically.", "Because only resistance can be tested."], 0, "Parallel reasoning also needs the junction-current idea.", hint),
    mc("What is the strongest interpretation of source current in a parallel circuit?", ["It is the combined current drawn by all complete branches.", "It is always equal to the smallest branch current.", "It is always equal to the voltage across the source.", "It is unaffected by how many branches are connected."], 0, "The source supplies the total taken by the branches.", hint),
    mc("Which statement about total resistance is strongest?", ["Series connections increase total resistance, while parallel branches reduce the circuit's overall opposition.", "Both series and parallel always increase total resistance.", "Both series and parallel always decrease total resistance.", "Total resistance never changes when the layout changes."], 0, "Series stacks opposition; parallel adds routes.", hint),
    mc("A student says 'parallel means equal current because the branches look symmetrical.' What is the best correction?", ["Equal current needs equal branch resistance as well as equal branch voltage.", "All parallel branches always carry equal current by definition.", "Symmetry replaces the need for Ohm's law.", "Current in parallel cannot be compared."], 0, "Equal voltage alone is not enough for equal current.", hint),
    mc("Why is it helpful to compare junctions when deciding whether a question is about series or parallel behaviour?", ["Because shared junctions reveal where current can split or recombine.", "Because junctions show where voltage disappears.", "Because junctions measure resistance directly.", "Because junctions replace the need for a battery."], 0, "Junctions show whether multiple routes exist.", hint),
    mc("Which sentence best matches rigorous circuit language?", ["In series the current is common to the whole route, while in parallel the potential difference is common to each branch.", "In every circuit both current and voltage are the same everywhere.", "Series circuits share current and parallel circuits share current too.", "Voltage and current swap meanings when branches are added."], 0, "Keep the rule paired to the correct topology.", hint),
    mc("What should be checked before using a branch-current sum to find the source current?", ["That the listed currents belong to branches meeting at the same source split or recombination.", "That every resistor has the same value.", "That the battery voltage is zero.", "That the circuit is definitely series."], 0, "The current-sum rule belongs at junctions in a branch network.", hint),
    mc("In a mixed circuit containing one series resistor followed by a parallel pair, what should usually be reduced first?", ["the parallel pair", "the whole network in one step", "the source only", "the branch currents before any equivalent resistance"], 0, "Reduce the valid local block first.", hint),
    mc("Why is the current through the resistor before a junction the same as the source current in a mixed circuit?", ["Because that resistor lies in the single route before the current splits.", "Because every resistor in every network always has the same current.", "Because parallel branches force equal current everywhere.", "Because voltage and current are identical before a junction."], 0, "The topology before the split is still a one-path section.", hint),
    mc("A parallel block sits after a series resistor, so the full supply is not directly across the block. What should be found before branch currents are calculated?", ["the voltage across the parallel block", "the current in each branch by guessing equal shares", "the total resistance of each branch added directly", "the source current divided by the number of branches"], 0, "Branch currents need the actual branch voltage.", hint),
    mc("Which statement about equivalent resistance in a parallel pair is strongest?", ["It is smaller than the resistance of the smallest branch.", "It must equal the sum of the branch resistances.", "It must be larger than every branch resistance.", "It depends only on the battery voltage."], 0, "Parallel routes reduce the overall opposition.", hint),
    mc("Two equal resistors form a parallel pair and share the same branch voltage. Which branch-current statement is strongest?", ["The branch currents are equal because the branch voltages and resistances are equal.", "One branch must carry more current because it is nearer the cell.", "The branch currents cannot be compared in parallel.", "Both branch currents are zero unless the circuit is series."], 0, "Same V across equal R gives equal I.", hint),
  ];
}

function l6MasteryRaw(): RawItem[] {
  return [
    ...l6ConceptRaw(),
    short("A 3 ohm resistor and a 5 ohm resistor are connected in series. What is the total resistance?", answers("8", "ohms"), "In series, add the resistances."),
    short("A 4 ohm resistor and a 6 ohm resistor are connected in series. What is the total resistance?", answers("10", "ohms"), "In series, add the resistances."),
    short("A 12 V supply is connected across two 3 ohm resistors in series. What current flows in the circuit?", answers("2", "A"), "Find the total series resistance, then use I = V / R."),
    short("A 9 V supply is connected across a 1 ohm resistor and a 2 ohm resistor in series. What current flows?", answers("3", "A"), "Use the total series resistance first."),
    short("A series circuit carries 0.4 A. What current passes through each component in the route?", answers("0.4", "A", "0.40 A"), "Series circuits carry the same current everywhere."),
    short("Two identical resistors are connected in series across a 10 V supply. What potential difference is across one resistor?", answers("5", "V"), "Equal series resistors share the supply equally."),
    short("A branch is connected directly across a 6 V supply in a parallel circuit. What potential difference is across that branch?", answers("6", "V"), "Each branch has the full supply potential difference."),
    short("A 3 ohm branch is connected across a 6 V supply. What current flows in that branch?", answers("2", "A"), "Use I = V / R for that branch."),
    short("A 6 ohm branch is connected across the same 6 V supply. What current flows in that branch?", answers("1", "A"), "Use I = V / R for that branch."),
    short("Two parallel branches carry 2 A and 1 A. What total current leaves the source?", answers("3", "A"), "Add the branch currents."),
    short("A 4 ohm branch and a 12 ohm branch are connected in parallel across a 12 V supply. What current flows in the 4 ohm branch?", answers("3", "A"), "Use the full branch voltage with I = V / R."),
    short("In the same circuit, what current flows in the 12 ohm branch?", answers("1", "A"), "Use the same 12 V branch voltage."),
    short("In that same parallel circuit, what total current leaves the source?", answers("4", "A"), "Add the branch currents."),
    short("An 8 V supply feeds parallel branches of 8 ohms and 4 ohms. What total current leaves the source?", answers("3", "A"), "Find each branch current and add them."),
    short("Three parallel branches carry 0.2 A, 0.3 A, and 0.5 A. What source current is needed?", answers("1", "A", "1.0 A"), "Add the three branch currents."),
    short("An 18 V supply is connected across a 3 ohm resistor and a 6 ohm resistor in series. What current flows?", answers("2", "A"), "Use the total series resistance first."),
    short("In that same series circuit, what potential difference is across the 6 ohm resistor?", answers("12", "V"), "Use V = IR with the series current and that resistor."),
    short("In that same series circuit, what potential difference is across the 3 ohm resistor?", answers("6", "V"), "Use V = IR with the series current and that resistor."),
    short("Two identical 12 ohm branches are connected in parallel across a 12 V supply. What current flows in each branch?", answers("1", "A"), "Each branch gets 12 V, so use I = V / R."),
    short("In that same parallel circuit, what total current leaves the source?", answers("2", "A"), "Add the equal branch currents."),
    short("A 6 ohm resistor and a 3 ohm resistor are connected in parallel. What is their equivalent resistance?", answers("2", "ohms"), "Use the parallel-resistance relation."),
    short("A 2 ohm resistor is in series with that 6 ohm || 3 ohm parallel block. What is the total resistance?", answers("4", "ohms"), "Reduce the parallel block first, then add the series resistor."),
    short("A 12 V supply is connected to a 2 ohm resistor in series with a parallel pair of 6 ohm and 3 ohm. What current leaves the source?", answers("3", "A"), "Use the total resistance of the mixed network."),
    short("In that same mixed circuit, what potential difference is across the parallel block?", answers("6", "V"), "Find the series resistor drop first, then use the remaining supply."),
    short("In that same mixed circuit, what current flows in the 6 ohm branch?", answers("1", "A"), "Use the branch voltage with I = V / R."),
    short("In that same mixed circuit, what current flows in the 3 ohm branch?", answers("2", "A"), "Use the same branch voltage with the other branch resistance."),
    short("An 8 ohm resistor is in series with two 8 ohm branches in parallel. What is the equivalent resistance of the parallel pair?", answers("4", "ohms"), "Two equal 8 ohm branches in parallel halve the resistance."),
    short("A 12 V supply is connected to that 8 ohm series resistor plus the 8 ohm || 8 ohm block. What total current leaves the source?", answers("1.5", "A", "1.50 A"), "Find the total resistance first."),
    short("In that same mixed circuit, what potential difference is across the parallel block?", answers("6", "V"), "The two 4 ohm equivalent sections share the 12 V supply equally."),
    short("In that same mixed circuit, what current flows in each 8 ohm branch?", answers("0.75", "A", "0.75 A"), "Use the 6 V branch voltage with I = V / R."),
  ];
}

function diagnosticRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "M9_L1":
      return l1DiagnosticRaw();
    case "M9_L2":
      return l2DiagnosticRaw();
    case "M9_L3":
      return l3DiagnosticRaw();
    case "M9_L4":
      return l4DiagnosticRaw();
    case "M9_L5":
      return l5DiagnosticRaw();
    case "M9_L6":
      return l6DiagnosticRaw();
    default:
      throw new Error(`Unknown M9 diagnostic lesson code: ${code}`);
  }
}

function conceptRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "M9_L1":
      return l1ConceptRaw();
    case "M9_L2":
      return l2ConceptRaw();
    case "M9_L3":
      return l3ConceptRaw();
    case "M9_L4":
      return l4ConceptRaw();
    case "M9_L5":
      return l5ConceptRaw();
    case "M9_L6":
      return l6ConceptRaw();
    default:
      throw new Error(`Unknown M9 concept lesson code: ${code}`);
  }
}

function masteryRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "M9_L1":
      return l1MasteryRaw();
    case "M9_L2":
      return l2MasteryRaw();
    case "M9_L3":
      return l3MasteryRaw();
    case "M9_L4":
      return l4MasteryRaw();
    case "M9_L5":
      return l5MasteryRaw();
    case "M9_L6":
      return l6MasteryRaw();
    default:
      throw new Error(`Unknown M9 mastery lesson code: ${code}`);
  }
}

export function m9GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "diagnostic", diagnosticRaw(normalized));
}

export function m9GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "concept", conceptRaw(normalized));
}

export function m9GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "mastery", masteryRaw(normalized));
}
