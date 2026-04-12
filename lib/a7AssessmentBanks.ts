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
  hint = "Rebuild the circuit or capacitor relation before choosing.",
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
    throw new Error(`A7 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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
  const hint = "Separate emf, delivered terminal p.d., and the internal drop.";
  return [
    mc("Which relation links emf, terminal p.d., current, and internal resistance for a loaded source?", ["V = epsilon - I r", "Q = C V", "V_out = V_supply x R_lower / (R_upper + R_lower)", "tau = R C"], 0, "A loaded source delivers emf minus the internal lost volts.", hint),
    mc("What is the terminal p.d. of a source when no current is drawn?", ["equal to the emf", "zero", "always half the emf", "greater than the emf"], 0, "With I = 0 there is no internal voltage drop.", hint),
    mc("If current through a source increases while emf and internal resistance stay fixed, what happens to the terminal p.d.?", ["it decreases", "it increases", "it stays the same", "it becomes equal to zero immediately"], 0, "Larger I gives a larger internal drop Ir.", hint),
    mc("What does internal resistance do inside a real source?", ["it causes a voltage drop and dissipates power inside the source", "it increases the emf", "it stores capacitor charge", "it removes current conservation at nodes"], 0, "Internal resistance creates lost volts and internal heating.", hint),
    mc("A battery has emf 12.0 V. When it supplies 4.0 A, the terminal p.d. is 10.4 V. What is the internal resistance?", [valueWithUnit(0.4, "ohm", 1), valueWithUnit(1.6, "ohm", 1), valueWithUnit(2.6, "ohm", 1), valueWithUnit(4.0, "ohm", 1)], 0, "Use r = (epsilon - V) / I.", hint),
    mc("A cell has emf 1.5 V and internal resistance 0.20 ohm. What is the terminal p.d. when it supplies 2.0 A?", [valueWithUnit(1.1, "V", 1), valueWithUnit(1.3, "V", 1), valueWithUnit(1.5, "V", 1), valueWithUnit(0.4, "V", 1)], 0, "Use V = epsilon - I r.", hint),
    mc("A 9.0 V source delivers 8.0 V at 2.0 A. What is the power dissipated inside the source?", [valueWithUnit(2.0, "W", 1), valueWithUnit(8.0, "W", 1), valueWithUnit(16.0, "W", 1), valueWithUnit(1.0, "W", 1)], 0, "The lost volts are 1.0 V, so internal power is I x lost volts.", hint),
    mc("A source has emf 6.0 V, internal resistance 0.50 ohm, and current 3.0 A. What is the terminal p.d.?", [valueWithUnit(4.5, "V", 1), valueWithUnit(5.5, "V", 1), valueWithUnit(3.0, "V", 1), valueWithUnit(6.0, "V", 1)], 0, "Subtract the internal drop I r from the emf.", hint),
    mc("If the internal resistance doubles while the current stays fixed, what happens to the lost volts?", ["they double", "they halve", "they stay the same", "they become zero"], 0, "Lost volts are I r.", hint),
    mc("What is the internal voltage drop when a 12 V source delivers 10 V under load?", [valueWithUnit(2.0, "V", 1), valueWithUnit(10.0, "V", 1), valueWithUnit(12.0, "V", 1), valueWithUnit(22.0, "V", 1)], 0, "The source split is emf = terminal p.d. + internal drop.", hint),
    mc("Which power relation is safest for heating inside the internal resistance?", ["P_internal = I^2 r", "P_internal = V / I", "P_internal = Q / V", "P_internal = tau / R"], 0, "The internal resistor dissipates I squared r.", hint),
    mc("Which statement about a real source is safest?", ["terminal p.d. can be less than emf because some energy is dissipated inside the source", "terminal p.d. must always equal emf", "internal resistance increases current delivered to the load", "emf disappears when current flows"], 0, "A7_L1 separates full source lift from delivered lift.", hint),
    shortCases([
      { prompt: "The full source lift per charge is the ...", acceptedAnswers: ["emf", "epsilon"], hint: "It is the open-circuit source quantity." },
      { prompt: "The delivered p.d. across the external circuit is the ... p.d.", acceptedAnswers: ["terminal"], hint: "Name the output reading." },
      { prompt: "Internal resistance creates the source's lost ...", acceptedAnswers: ["volts", "voltage drop", "drop"], hint: "That is the internal subtraction." },
      { prompt: "Open-circuit terminal p.d. equals the ...", acceptedAnswers: ["emf", "epsilon"], hint: "No current means no internal loss." },
      { prompt: "The internal power loss relation is I squared times ...", acceptedAnswers: ["r", "internal resistance"], hint: "That is the resistor-heating form." },
      { prompt: "More current through the same source means a larger internal ...", acceptedAnswers: ["drop", "voltage drop", "lost volts"], hint: "Think I r." },
      { prompt: "A strong A7_L1 answer separates source emf from delivered ...", acceptedAnswers: ["terminal p.d.", "terminal pd", "terminal voltage"], hint: "Do not merge the two voltages." },
      { prompt: "A real source behaves unlike an ideal source because it has internal ...", acceptedAnswers: ["resistance"], hint: "That is the non-ideal feature." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep full source lift, delivered lift, and internal loss on the same board.";
  return [
    mc("Why is it weak to treat a loaded cell as if terminal p.d. must always equal emf?", ["current through internal resistance creates lost volts inside the source", "emf only exists when the source is disconnected", "terminal p.d. measures charge directly", "internal resistance cancels current"], 0, "A7_L1 protects the source split.", hint),
    mc("Why does open-circuit terminal p.d. equal emf?", ["with no current there is no internal voltage drop", "the source has zero emf when open circuit", "internal resistance becomes infinite", "charge stops existing"], 0, "No current means no I r subtraction.", hint),
    mc("Why does increasing current reduce terminal p.d. for the same real source?", ["the internal drop I r grows, leaving less delivered p.d. for the external circuit", "emf is destroyed by current", "the load resistance increases automatically", "the source stops supplying charge"], 0, "More current means more internal lost volts.", hint),
    mc("Why is internal resistance best thought of as part of the source rather than part of the external load?", ["it dissipates some of the source energy inside the cell before the rest reaches the circuit", "it sits outside the source in every circuit diagram", "it removes emf from the source entirely", "it only matters for capacitors"], 0, "The lost energy is inside the source model.", hint),
    mc("Why is P_internal = I^2 r a useful complement to V = epsilon - I r?", ["it turns the voltage loss into a power-loss statement about heating inside the source", "it replaces the need for current", "it gives the emf directly", "it applies only when no current flows"], 0, "A7_L1 joins voltage split and power dissipation.", hint),
    mc("Which statement best protects the A7_L1 lesson meaning?", ["EMF is the full source lift, while terminal p.d. is what remains after the internal drop.", "Terminal p.d. and emf are interchangeable labels.", "Internal resistance only matters when the source is disconnected.", "The internal drop is part of the external load voltage."], 0, "That keeps the source bookkeeping correct.", hint),
    mc("Why is a larger internal resistance undesirable in a source that must deliver large current?", ["it creates a larger internal voltage drop and larger internal heating for the same current", "it raises the terminal p.d.", "it makes the emf larger", "it removes power dissipation"], 0, "Large r wastes more of the source lift internally.", hint),
    mc("Why is 'the battery is 12 V' incomplete in a loaded-circuit discussion?", ["you still need to know whether that is the emf or the terminal p.d. under a stated current", "voltage labels never matter", "12 V can only mean internal loss", "current is irrelevant in source questions"], 0, "Context matters for source readings.", hint),
    mc("Why should worked examples compare open-circuit and loaded readings?", ["the comparison makes the internal-drop mechanism visible instead of leaving it as a slogan", "the two cases always give the same reading", "open-circuit readings remove the need for emf", "loaded readings are only for ideal sources"], 0, "Concrete contrast clarifies the source split.", hint),
    mc("Why is terminal p.d. described as the delivered lift across the external circuit?", ["it is the energy per charge actually available to the rest of the circuit after internal loss", "it equals the internal heating only", "it exists only inside the cell", "it is always larger than emf"], 0, "That phrase keeps the external-circuit meaning visible.", hint),
    mc("What common mistake is A7_L1 preventing?", ["collapsing emf, terminal p.d., and internal loss into one undifferentiated battery voltage", "thinking current is conserved at a junction", "thinking capacitors have emf", "thinking resistance is measured in coulombs"], 0, "The lesson is defending source bookkeeping.", hint),
    mc("Why can a source show more internal power loss at higher current even when emf stays fixed?", ["the internal resistor dissipates power as I squared r, so current matters strongly", "emf falls with the square of current", "terminal p.d. always increases with current", "internal resistance disappears at high current"], 0, "The square dependence makes current especially important.", hint),
    shortCases([
      { prompt: "EMF is the source's full ... per charge.", acceptedAnswers: ["lift", "energy lift"], hint: "That is the lesson metaphor." },
      { prompt: "Terminal p.d. is the ... lift across the external circuit.", acceptedAnswers: ["delivered", "remaining"], hint: "It is what reaches the load." },
      { prompt: "Internal resistance causes lost ... inside the source.", acceptedAnswers: ["volts", "voltage"], hint: "That is the subtraction term." },
      { prompt: "No current means no internal ...", acceptedAnswers: ["drop", "voltage drop", "lost volts"], hint: "Set I to zero." },
      { prompt: "A7_L1 keeps emf, terminal p.d., and internal loss ...", acceptedAnswers: ["separate", "distinct"], hint: "Do not merge them." },
      { prompt: "Internal source heating is a power ...", acceptedAnswers: ["loss", "dissipation"], hint: "That is what I squared r measures." },
      { prompt: "A stronger source answer always states the current or the circuit ...", acceptedAnswers: ["condition", "load", "loading"], hint: "Source readings depend on context." },
      { prompt: "The non-ideal feature inside the source is its internal ...", acceptedAnswers: ["resistance"], hint: "That is the key property." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the node current check and the loop voltage check separate.";
  return [
    mc("Which relation is Kirchhoff's junction rule?", ["sum I_in = sum I_out", "sum V_rises = sum V_drops", "V = epsilon - I r", "Q = C V"], 0, "Current is conserved at a node.", hint),
    mc("Which relation is Kirchhoff's loop rule?", ["sum V_rises = sum V_drops", "sum I_in = sum I_out", "tau = R C", "P = I^2 r"], 0, "Potential changes balance around a closed loop.", hint),
    mc("A current of 5.0 A enters a junction. One branch carries 2.0 A away. What is the current in the other outgoing branch?", [valueWithUnit(3.0, "A", 1), valueWithUnit(7.0, "A", 1), valueWithUnit(2.5, "A", 1), valueWithUnit(10.0, "A", 1)], 0, "Use current conservation at the node.", hint),
    mc("A current of 6.0 A enters a node and splits into two branches. One branch carries 2.5 A. What is the other branch current?", [valueWithUnit(3.5, "A", 1), valueWithUnit(8.5, "A", 1), valueWithUnit(1.5, "A", 1), valueWithUnit(2.4, "A", 1)], 0, "Incoming current equals outgoing current.", hint),
    mc("A loop contains a 12 V supply and resistor drops of 3 V and 4 V. What must the remaining drop be?", [valueWithUnit(5.0, "V", 1), valueWithUnit(7.0, "V", 1), valueWithUnit(9.0, "V", 1), valueWithUnit(1.0, "V", 1)], 0, "Use loop-voltage balance.", hint),
    mc("A loop contains a 9 V cell and series resistors of 2 ohm and 7 ohm. What is the current?", [valueWithUnit(1.0, "A", 1), valueWithUnit(4.5, "A", 1), valueWithUnit(0.5, "A", 1), valueWithUnit(9.0, "A", 1)], 0, "Total series resistance is 9 ohm, so I = 9 / 9.", hint),
    mc("In the same 9 V loop with 2 ohm and 7 ohm series resistors, what is the p.d. across the 2 ohm resistor?", [valueWithUnit(2.0, "V", 1), valueWithUnit(7.0, "V", 1), valueWithUnit(9.0, "V", 1), valueWithUnit(4.5, "V", 1)], 0, "Use V = I R with the loop current.", hint),
    mc("A 15 V supply feeds a 3 ohm resistor in series before a junction. The current then splits through 6 ohm and 3 ohm branches. What is the total current?", [valueWithUnit(3.0, "A", 1), valueWithUnit(5.0, "A", 1), valueWithUnit(1.5, "A", 1), valueWithUnit(2.0, "A", 1)], 0, "The parallel section is 2 ohm, so total resistance is 5 ohm.", hint),
    mc("In that same circuit, what current flows in the 6 ohm branch?", [valueWithUnit(1.0, "A", 1), valueWithUnit(2.0, "A", 1), valueWithUnit(3.0, "A", 1), valueWithUnit(0.5, "A", 1)], 0, "The parallel network has 6 V across it, so I = 6 / 6.", hint),
    mc("Which rule should be used first to compare currents at a branching point?", ["the junction rule", "the loop rule", "the divider rule", "the capacitor energy rule"], 0, "A branch point is a node-current question.", hint),
    mc("Which rule should be used to check whether supply rises and resistor drops balance around a closed path?", ["the loop rule", "the junction rule", "the capacitance relation", "the emf relation only"], 0, "Closed-path p.d. bookkeeping is the loop rule.", hint),
    mc("Which statement about Kirchhoff analysis is safest?", ["node-current conservation and loop-voltage balance are different checks that should not be blended", "every circuit question can be solved by current conservation alone", "voltage balance replaces Ohm's law everywhere", "junction current and loop voltage are the same quantity"], 0, "A7_L2 keeps the two conservation stories distinct.", hint),
    shortCases([
      { prompt: "At a junction, current ... equals current out.", acceptedAnswers: ["in", "into"], hint: "That is Kirchhoff's current rule." },
      { prompt: "Around a closed loop, voltage rises ... voltage drops.", acceptedAnswers: ["equal", "equals", "balance"], hint: "Use the conservation idea." },
      { prompt: "A branching point is usually checked first with the ... rule.", acceptedAnswers: ["junction", "current", "junction rule"], hint: "Think node bookkeeping." },
      { prompt: "A closed path is checked with the ... rule.", acceptedAnswers: ["loop", "voltage", "loop rule"], hint: "Think p.d. balance." },
      { prompt: "A7_L2 keeps the node and loop stories ...", acceptedAnswers: ["separate", "distinct"], hint: "Do not blend them." },
      { prompt: "Series sections share the same ...", acceptedAnswers: ["current"], hint: "That is why the 3 ohm resistor current equals the total current." },
      { prompt: "Parallel branches share the same ... difference.", acceptedAnswers: ["potential", "voltage"], hint: "That is why each branch had 6 V in the worked example." },
      { prompt: "Kirchhoff work is circuit ... rather than guesswork.", acceptedAnswers: ["bookkeeping", "accounting"], hint: "That is the lesson tone." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Name whether the question is about current at a node or p.d. around a loop.";
  return [
    mc("Why is it risky to say 'Kirchhoff's laws' without naming which one you are using?", ["junction current balance and loop voltage balance answer different kinds of circuit questions", "both laws always give the same equation", "the loop rule only applies to ideal sources", "the junction rule replaces Ohm's law completely"], 0, "A7_L2 protects the two-rule distinction.", hint),
    mc("Why should a branch-current problem begin at the junction rather than around a loop?", ["current splitting is set by node conservation before any closed-path voltage check is applied", "loops must always be solved first in every circuit", "junctions do not conserve current", "voltage rules determine branch count"], 0, "The current story starts at the node.", hint),
    mc("Why does loop analysis track voltage rises and drops rather than currents alone?", ["the closed path is a potential-balance statement, not just a current-counting exercise", "current disappears in loops", "voltage is the same as resistance", "loop analysis is only for capacitors"], 0, "The loop rule is a p.d. bookkeeping rule.", hint),
    mc("Why is Kirchhoff work described as systematic bookkeeping?", ["the method succeeds by keeping conserved quantities organized at nodes and around loops", "it is based on guess-and-check only", "it avoids numerical calculation", "it uses only one universal resistor value"], 0, "The lesson is about disciplined conservation reasoning.", hint),
    mc("Why can branch currents differ even though the branches share the same p.d.?", ["their resistances can differ, so Ohm's law gives different currents for the same branch voltage", "parallel branches must always have the same current", "current conservation forbids different branch currents", "the loop rule removes resistance ratios"], 0, "Shared p.d. does not mean shared current.", hint),
    mc("Why must the sum of voltage drops equal the supply rise in a steady closed loop?", ["energy per charge is conserved around the circuit path", "current is destroyed by resistors", "resistance creates extra emf", "parallel branches cancel the source"], 0, "Loop balance is an energy-per-charge conservation statement.", hint),
    mc("Which statement best protects the A7_L2 lesson meaning?", ["Use the junction rule for current splitting and the loop rule for p.d. balance, then combine them with Ohm's law.", "Use the loop rule for every current question and ignore nodes.", "Use current conservation only; voltage balance is optional.", "Kirchhoff rules apply only to one-resistor circuits."], 0, "That keeps the role of each rule clear.", hint),
    mc("Why is it weak to stop after finding the total current in a branching circuit?", ["the branch currents still need the parallel p.d. and the junction check to be made explicit", "the total current automatically gives every branch current", "branch currents are not measurable", "the loop rule no longer applies after the total current is found"], 0, "A7_L2 wants full node-plus-loop reasoning.", hint),
    mc("Why should worked examples show both a junction equation and a loop equation?", ["the contrast stops current conservation from blending with voltage conservation", "the two equations are algebraically identical", "one of them is only for idealized diagrams", "showing both removes the need for Ohm's law"], 0, "Side-by-side contrast strengthens the distinction.", hint),
    mc("Why is the p.d. across each parallel branch the same?", ["both branch ends connect to the same two nodes in the circuit", "parallel branches always have the same resistance", "the junction rule forces equal current", "each branch contains the same number of resistors"], 0, "Shared endpoints mean shared potential difference.", hint),
    mc("What common mistake is A7_L2 preventing?", ["using one conservation slogan everywhere without checking whether the question is about nodes or loops", "thinking current has units", "thinking resistors can be added in series", "thinking voltage can be measured"], 0, "The lesson is defending problem classification before calculation.", hint),
    mc("Why does a series resistor before a junction carry the total current?", ["the split has not happened yet, so all the current still passes through the series section", "parallel branches cancel the series current", "series resistors always carry zero current", "current only exists after the junction"], 0, "Current can only split once the branch point is reached.", hint),
    shortCases([
      { prompt: "Kirchhoff current work begins at the ...", acceptedAnswers: ["junction", "node"], hint: "That is where the split happens." },
      { prompt: "Kirchhoff voltage work follows a closed ...", acceptedAnswers: ["loop", "path"], hint: "That is the p.d. circuit route." },
      { prompt: "Parallel branches share the same ...", acceptedAnswers: ["p.d.", "pd", "potential difference", "voltage"], hint: "They connect across the same two nodes." },
      { prompt: "Series sections before a branch share the same ...", acceptedAnswers: ["current"], hint: "The split has not happened yet." },
      { prompt: "A7_L2 protects current conservation and voltage conservation as two ... checks.", acceptedAnswers: ["different", "distinct", "separate"], hint: "Do not merge them." },
      { prompt: "Loop balance is an energy-per-... statement.", acceptedAnswers: ["charge"], hint: "That is the p.d. meaning." },
      { prompt: "A strong A7_L2 answer classifies the circuit step before it does the ...", acceptedAnswers: ["algebra", "calculation", "maths", "math"], hint: "Choose node or loop first." },
      { prompt: "Kirchhoff analysis works best as systematic circuit ...", acceptedAnswers: ["bookkeeping", "accounting"], hint: "That is the module phrasing." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the full supply, the series ratio, and the tapped output together.";
  return [
    mc("Which relation is used for an unloaded two-resistor potential divider with output across the lower resistor?", ["V_out = V_supply x R_lower / (R_upper + R_lower)", "V = epsilon - I r", "Q = C V", "tau = R C"], 0, "The output is the lower resistor's fraction of the total divider resistance.", hint),
    mc("Two equal resistors form an unloaded divider across 12 V. What is the output across the lower resistor?", [valueWithUnit(6.0, "V", 1), valueWithUnit(12.0, "V", 1), valueWithUnit(3.0, "V", 1), valueWithUnit(24.0, "V", 1)], 0, "Equal resistors split the supply equally.", hint),
    mc("If the lower resistor becomes a larger fraction of the divider total, what happens to the output across it?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "The output follows the lower-resistance fraction.", hint),
    mc("What assumption is built into the simple divider formula used in this lesson?", ["the divider is unloaded", "the source has zero emf", "the two resistors must be equal", "the lower resistor is always fixed"], 0, "The simple two-resistor ratio is for the unloaded case.", hint),
    mc("A 10 V divider has an 8.0 kohm top resistor and a 2.0 kohm lower resistor. What is the output across the lower resistor?", [valueWithUnit(2.0, "V", 1), valueWithUnit(8.0, "V", 1), valueWithUnit(5.0, "V", 1), valueWithUnit(10.0, "V", 1)], 0, "Use the lower fraction 2 / (8 + 2).", hint),
    mc("A 15 V divider has a 1.0 kohm top resistor and a 4.0 kohm lower resistor. What is the output across the lower resistor?", [valueWithUnit(12.0, "V", 1), valueWithUnit(3.0, "V", 1), valueWithUnit(10.0, "V", 1), valueWithUnit(15.0, "V", 1)], 0, "The lower resistor is 4/5 of the total divider resistance.", hint),
    mc("A 12 V divider uses an 8.0 kohm top resistor and an unknown lower resistor. The output across the lower resistor is 3.0 V. What is the lower resistance?", [valueWithUnit(2.67, "kohm", 2), valueWithUnit(4.00, "kohm", 2), valueWithUnit(8.00, "kohm", 2), valueWithUnit(1.00, "kohm", 2)], 0, "Solve the divider ratio equation for the lower resistance.", hint),
    mc("A 9.0 V divider uses a 6.0 kohm top resistor and a 3.0 kohm lower resistor. What is the output across the lower resistor?", [valueWithUnit(3.0, "V", 1), valueWithUnit(6.0, "V", 1), valueWithUnit(4.5, "V", 1), valueWithUnit(9.0, "V", 1)], 0, "The lower resistor is one third of the total 9 kohm.", hint),
    mc("A 12 V divider uses a 3.0 kohm top resistor and a 9.0 kohm lower resistor. What is the output across the lower resistor?", [valueWithUnit(9.0, "V", 1), valueWithUnit(3.0, "V", 1), valueWithUnit(6.0, "V", 1), valueWithUnit(12.0, "V", 1)], 0, "The lower resistor is 9/12 of the total resistance.", hint),
    mc("Which change can make the real output differ from the simple unloaded-divider prediction?", ["loading the divider with another component at the output", "using ohms as the resistance unit", "drawing the lower resistor below the upper resistor", "measuring the supply in volts"], 0, "Loading changes the effective lower side of the network.", hint),
    mc("Why is the equal-resistor divider a useful first reference case?", ["it gives a clean half-supply output that anchors later ratio reasoning", "it is the only divider that works", "it removes the need for resistance values", "it proves loading can be ignored"], 0, "The half-supply case is a good ratio checkpoint.", hint),
    mc("Which statement about a potential divider is safest?", ["the output is a selected fraction of the supply set by the resistance ratio", "the output must always equal the supply", "potential dividers only work with capacitors", "the top resistor determines the output alone"], 0, "A7_L3 is about ratio-based voltage sharing.", hint),
    shortCases([
      { prompt: "A potential divider shares one supply ... across a series path.", acceptedAnswers: ["drop", "voltage drop", "p.d.", "pd"], hint: "That is the lesson framing." },
      { prompt: "In the simple divider rule, the tapped output is the ... resistor's fraction of the total.", acceptedAnswers: ["lower"], hint: "The lesson takes output across the lower resistor." },
      { prompt: "Equal divider resistors give a ...-supply output.", acceptedAnswers: ["half", "half supply"], hint: "That is the clean reference case." },
      { prompt: "Divider output depends on the resistance ...", acceptedAnswers: ["ratio"], hint: "That is the governing idea." },
      { prompt: "The simple divider rule assumes the divider is ...", acceptedAnswers: ["unloaded"], hint: "No output loading branch." },
      { prompt: "Adding an output load can change the divider ...", acceptedAnswers: ["output", "voltage", "p.d.", "pd"], hint: "The simple ratio can shift." },
      { prompt: "A7_L3 keeps one supply drop and one tapped ... together.", acceptedAnswers: ["output"], hint: "That is the shared-route story." },
      { prompt: "A strong divider answer keeps the full supply and the resistor ... visible.", acceptedAnswers: ["ratio"], hint: "Do not reduce it to pattern matching." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Tie the output voltage to the resistance fraction instead of to a memorized pattern.";
  return [
    mc("Why is a divider output best described as a fraction of the supply rather than as an isolated voltage?", ["the output depends on how the full supply is shared across the series resistance ratio", "the supply no longer matters once the divider is built", "divider output is always half the supply", "the lower resistor creates voltage by itself"], 0, "A7_L3 keeps the one-supply shared-drop story visible.", hint),
    mc("Why do equal divider resistors make a useful first worked example?", ["they give a clean half-supply benchmark that makes later ratios easier to judge", "they are the only legal divider pair", "equal resistors remove the supply voltage from the question", "they prove that loading never matters"], 0, "Half-supply is a stable reference case.", hint),
    mc("Why does a larger lower resistor raise the unloaded output across it?", ["the lower branch becomes a larger fraction of the total series resistance", "the source emf increases", "current conservation is broken", "the top resistor stops carrying current"], 0, "The output follows the lower resistance fraction.", hint),
    mc("Why is it weak to say 'the divider gives 3 V' without naming the resistor arrangement?", ["the output value only makes sense relative to the supply and the resistance ratio that produced it", "potential dividers never need resistor values", "divider output is independent of supply voltage", "3 V is always the default output"], 0, "A7_L3 wants the ratio mechanism visible.", hint),
    mc("Why can loading change the divider output?", ["the output branch alters the effective resistance on the tapped side, so the sharing ratio changes", "loading makes the supply voltage disappear", "loading only changes current and never voltage", "loading turns the divider into a capacitor"], 0, "Output loading changes the lower side of the divider.", hint),
    mc("Which statement best protects the A7_L3 lesson meaning?", ["A potential divider shares one supply drop across a series route, so output is set by the resistance ratio.", "A divider output is decided by the supply alone.", "The lower resistor determines the output without reference to the total resistance.", "Potential dividers work only when both resistors are equal."], 0, "That keeps the ratio-based sharing model intact.", hint),
    mc("Why is half-supply pattern recognition not enough for A7_L3?", ["real divider questions require flexible ratio reasoning, unknown resistors, and output changes under different conditions", "every divider is built from equal resistors", "divider outputs cannot be calculated", "the ratio rule only works at half-supply"], 0, "The lesson wants predictive reasoning, not one remembered picture.", hint),
    mc("Why should a sensor-divider explanation mention how the sensor resistance changes?", ["the output changes because the resistance ratio changes when the sensor value changes", "sensor dividers ignore the supply voltage", "sensor outputs do not depend on the lower resistor", "resistance changes affect only current and never output"], 0, "The output follows the ratio, so changing one resistor matters directly.", hint),
    mc("Why is the divider still a series-circuit idea even though we only measure one output point?", ["the output exists because the full supply is being shared along one continuous series route", "series current stops at the tap point", "series circuits cannot have measured outputs", "the output makes the top resistor irrelevant"], 0, "The tap reads one part of the whole shared drop.", hint),
    mc("Why should worked examples compare unloaded and loaded cases?", ["the contrast stops students from treating the simple ratio formula as universally unchanged", "loaded and unloaded dividers always give the same output", "loading only changes resistor color", "the simple ratio works only when loaded"], 0, "The comparison makes the assumption visible.", hint),
    mc("What common mistake is A7_L3 preventing?", ["treating divider output as a memorized voltage pattern instead of a supply-sharing ratio", "thinking voltage has units", "thinking resistors can be in series", "thinking the supply can be measured"], 0, "The lesson is defending ratio-first reasoning.", hint),
    mc("Why is the tapped output read across one resistor rather than along the whole divider?", ["the task is to read one selected share of the full supply drop, not the whole supply again", "the whole divider has zero p.d.", "the top resistor blocks voltage from the lower resistor", "only one resistor can be connected in a series circuit"], 0, "The tap selects one part of the shared supply.", hint),
    shortCases([
      { prompt: "A divider output is a ... of the full supply.", acceptedAnswers: ["fraction", "share"], hint: "That is the key meaning." },
      { prompt: "The governing idea is the resistance ...", acceptedAnswers: ["ratio"], hint: "Not a memorized fixed voltage." },
      { prompt: "Equal divider resistors create a ...-supply reference case.", acceptedAnswers: ["half", "half supply"], hint: "That is the clean benchmark." },
      { prompt: "Output loading changes the effective tapped-side ...", acceptedAnswers: ["resistance"], hint: "That is why the simple output can change." },
      { prompt: "A7_L3 protects ratio-first rather than pattern-first ...", acceptedAnswers: ["thinking", "reasoning"], hint: "That is the lesson intention." },
      { prompt: "The output resistor in this lesson is the ... resistor.", acceptedAnswers: ["lower"], hint: "That is how the formula is presented." },
      { prompt: "A strong divider explanation still names the supply and the resistor ...", acceptedAnswers: ["ratio"], hint: "Keep both visible." },
      { prompt: "A potential divider is still a ... circuit idea.", acceptedAnswers: ["series"], hint: "The drop is shared along one route." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep charge, capacitance, and p.d. tied together as one storage relation.";
  return [
    mc("Which relation links capacitor charge, capacitance, and p.d.?", ["Q = C V", "V = epsilon - I r", "tau = R C", "E = 1/2 C V^2"], 0, "Capacitance is the storage ratio between charge and voltage.", hint),
    mc("What does capacitance describe?", ["stored charge per volt", "stored energy per joule", "current per branch", "lost volts per amp"], 0, "Capacitance is a charge-storage ratio.", hint),
    mc("At the same voltage, which capacitor stores more charge?", ["the one with larger capacitance", "the one with smaller capacitance", "both store the same charge", "the one with smaller plate area"], 0, "Q is proportional to C at fixed V.", hint),
    mc("For a fixed stored charge, what happens to the p.d. if capacitance becomes smaller?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "From Q = C V, smaller C means larger V when Q is fixed.", hint),
    mc("A capacitor stores 4.8 mC at 12 V. What is its capacitance?", [valueWithUnit(4.0e-4, "F", 4), valueWithUnit(5.8e-3, "F", 4), valueWithUnit(2.5e-4, "F", 4), valueWithUnit(12.0, "F", 1)], 0, "Use C = Q / V after converting mC to C.", hint),
    mc("A 400 microfarad capacitor is connected to 18 V. What charge does it store?", [valueWithUnit(7.2e-3, "C", 4), valueWithUnit(2.22e-5, "C", 5), valueWithUnit(4.0e-4, "C", 4), valueWithUnit(18.0, "C", 1)], 0, "Use Q = C V.", hint),
    mc("A 220 microfarad capacitor is connected to 12 V. What charge does it store?", [valueWithUnit(2.64e-3, "C", 4), valueWithUnit(1.83e-5, "C", 5), valueWithUnit(220.0, "C", 1), valueWithUnit(12.0, "C", 1)], 0, "Multiply capacitance by p.d.", hint),
    mc("A capacitor stores 1.0 mC of charge and has capacitance 250 microfarads. What is the p.d.?", [valueWithUnit(4.0, "V", 1), valueWithUnit(0.25, "V", 2), valueWithUnit(250.0, "V", 1), valueWithUnit(1.0, "V", 1)], 0, "Use V = Q / C.", hint),
    mc("Two capacitors are both at 10 V. Capacitor A has twice the capacitance of Capacitor B. Which stores more charge?", ["Capacitor A stores twice the charge", "they store the same charge", "Capacitor B stores twice the charge", "the charge cannot be compared"], 0, "At fixed V, charge is proportional to capacitance.", hint),
    mc("Which unit is correct for capacitance?", ["farad", "volt", "ohm", "joule"], 0, "Capacitance is measured in farads.", hint),
    mc("Which change tends to increase capacitance?", ["larger plate area or a dielectric between the plates", "larger plate separation only", "smaller plate area only", "removing charge from the capacitor"], 0, "Geometry and dielectric response affect the storage ratio.", hint),
    mc("Which statement about capacitance is safest?", ["capacitance is the storage ratio linking charge and p.d., not the charge itself", "capacitance and charge are the same quantity", "a capacitor with larger capacitance must always be at larger voltage", "capacitance depends only on the stored charge"], 0, "A7_L4 separates the ratio from the stored amount.", hint),
    shortCases([
      { prompt: "Capacitance is stored charge per ...", acceptedAnswers: ["volt", "v"], hint: "That is the ratio meaning." },
      { prompt: "The capacitor storage relation is Q equals C times ...", acceptedAnswers: ["v", "voltage", "p.d.", "pd"], hint: "Name the third quantity." },
      { prompt: "At fixed voltage, larger capacitance means more stored ...", acceptedAnswers: ["charge"], hint: "That is what Q measures." },
      { prompt: "The SI unit of capacitance is the ...", acceptedAnswers: ["farad"], hint: "That is the capacitor unit." },
      { prompt: "A7_L4 protects storage-ratio thinking rather than charge-only ...", acceptedAnswers: ["thinking", "reasoning"], hint: "Do not collapse C into Q." },
      { prompt: "For fixed charge, smaller capacitance means larger ...", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "Rearrange Q = C V." },
      { prompt: "Capacitance can be changed by geometry or by a ...", acceptedAnswers: ["dielectric"], hint: "That is the inserted material." },
      { prompt: "A strong A7_L4 answer keeps charge and p.d. linked by the storage ...", acceptedAnswers: ["ratio"], hint: "That is the governing idea." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Explain capacitance as a storage ratio rather than as stored charge alone.";
  return [
    mc("Why is capacitance not the same thing as stored charge?", ["capacitance tells how much charge is stored per volt, while charge also depends on the actual p.d.", "capacitance is measured in coulombs", "charge determines capacitance in every case", "capacitance exists only when the capacitor is discharged"], 0, "A7_L4 keeps the ratio and the amount separate.", hint),
    mc("Why does a larger capacitance store more charge at the same p.d.?", ["Q is proportional to C when V is fixed", "the p.d. must automatically increase", "charge is independent of capacitance", "the capacitor loses energy"], 0, "The storage relation is direct in C at fixed V.", hint),
    mc("Why can two capacitors at the same voltage hold different charges?", ["their capacitances may differ, so the storage ratio differs", "voltage always fixes the same charge", "charge depends only on plate color", "capacitance disappears when voltage is equal"], 0, "Equal voltage does not force equal charge.", hint),
    mc("Why is it weak to say 'this capacitor has more charge' without also mentioning voltage or capacitance?", ["stored charge depends on both the p.d. and the capacitance", "charge is the same for every capacitor", "voltage never matters in capacitors", "capacitance removes the need for units"], 0, "A7_L4 wants the full storage relation visible.", hint),
    mc("Why can geometry matter to capacitance?", ["plate area and separation affect how much charge can be stored per volt", "geometry changes the emf of the source", "geometry only affects resistor current", "geometry matters only after discharge"], 0, "Capacitance belongs to the capacitor's physical construction.", hint),
    mc("Why can a dielectric increase capacitance?", ["it changes the field response between the plates so more charge can be stored for the same p.d.", "it always raises the source voltage", "it removes the electric field", "it forces the capacitor to discharge"], 0, "The inserted material changes the storage ratio.", hint),
    mc("Which statement best protects the A7_L4 lesson meaning?", ["Capacitance is the storage ratio linking charge and p.d., not the charge itself.", "Capacitance is just another name for stored charge.", "A capacitor with higher capacitance must always have higher voltage.", "Capacitance depends only on the amount of charge placed on the plates."], 0, "That keeps the ratio meaning intact.", hint),
    mc("Why is the unit farad meaningful rather than decorative?", ["it encodes coulombs per volt, which is exactly the storage-ratio meaning", "it means the capacitor stores energy only", "it replaces the need for voltage", "it proves the capacitor is ideal"], 0, "The unit tells the story of the quantity.", hint),
    mc("Why should a worked example move both ways across Q = C V?", ["students need to treat capacitance as a relation that can be rearranged, not just a substitution formula in one direction", "Q can never be rearranged", "capacitance questions only ask for charge", "voltage can be ignored once C is known"], 0, "A7_L4 wants flexible relational thinking.", hint),
    mc("Why does fixed-charge reasoning often feel different from fixed-voltage reasoning?", ["changing capacitance then changes the other quantity differently depending on which one is held constant", "fixed charge and fixed voltage are the same condition", "capacitors ignore boundary conditions", "capacitance becomes zero when the charge is fixed"], 0, "The held-constant condition matters.", hint),
    mc("What common mistake is A7_L4 preventing?", ["treating capacitance as if it were simply the stored charge value", "thinking capacitors can have p.d.", "thinking voltage has units", "thinking plate area can change"], 0, "The lesson is defending the ratio meaning.", hint),
    mc("Why is the phrase 'charge stored per volt' stronger than just 'charge stored'?", ["it keeps the p.d. dependence visible in the definition of capacitance", "it removes the need for the farad unit", "it applies only after discharge", "it means the capacitor stores current"], 0, "The definition must include the per-volt part.", hint),
    shortCases([
      { prompt: "Capacitance is a storage ...", acceptedAnswers: ["ratio"], hint: "That is the central concept." },
      { prompt: "Stored charge depends on both capacitance and ...", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "Q = C V." },
      { prompt: "A dielectric can increase how much charge is stored per ...", acceptedAnswers: ["volt", "v"], hint: "That means larger capacitance." },
      { prompt: "The unit farad means coulombs per ...", acceptedAnswers: ["volt", "v"], hint: "Read the definition from the unit." },
      { prompt: "A7_L4 keeps the ratio and the stored ... separate.", acceptedAnswers: ["charge", "amount"], hint: "Do not merge them." },
      { prompt: "At fixed p.d., more capacitance means more stored ...", acceptedAnswers: ["charge"], hint: "The relation is direct." },
      { prompt: "At fixed charge, changing capacitance changes the ...", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "Use V = Q / C." },
      { prompt: "A strong capacitor answer always states what is being held ...", acceptedAnswers: ["constant", "fixed"], hint: "That controls the comparison." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Treat RC response as a changing-rate process, not a straight-line fill.";
  return [
    mc("Which relation gives the RC time constant?", ["tau = R C", "Q = C V", "V = epsilon - I r", "E = 1/2 C V^2"], 0, "The time constant is the product of resistance and capacitance.", hint),
    mc("What is the time constant of a 2.2 kohm resistor with a 1000 microfarad capacitor?", [valueWithUnit(2.2, "s", 1), valueWithUnit(0.455, "s", 3), valueWithUnit(22.0, "s", 1), valueWithUnit(1.0, "s", 1)], 0, "Convert microfarads to farads before multiplying.", hint),
    mc("During charging, what happens to the capacitor p.d.?", ["it rises toward the supply value", "it stays zero", "it falls exponentially from the supply", "it becomes larger than the supply"], 0, "The capacitor voltage rises during charging.", hint),
    mc("During charging, what happens to the current in the resistor?", ["it starts large and then falls", "it starts at zero and then rises linearly", "it stays constant", "it reverses direction immediately"], 0, "Charging current is largest at the start and then decays.", hint),
    mc("A 12 V RC circuit charges from zero. What is the capacitor voltage after one time constant?", [valueWithUnit(7.6, "V", 1), valueWithUnit(4.4, "V", 1), valueWithUnit(12.0, "V", 1), valueWithUnit(6.0, "V", 1)], 0, "After one tau, the capacitor reaches about 63.2% of the supply.", hint),
    mc("A capacitor discharges from 12 V. What is the capacitor voltage after one time constant?", [valueWithUnit(4.4, "V", 1), valueWithUnit(7.6, "V", 1), valueWithUnit(12.0, "V", 1), valueWithUnit(1.2, "V", 1)], 0, "After one tau, about 36.8% of the initial voltage remains.", hint),
    mc("At two time constants during charging from zero, about what fraction of the final voltage has been reached?", ["about 86.5%", "about 36.8%", "about 63.2%", "about 13.5%"], 0, "Charging approaches the supply asymptotically.", hint),
    mc("At two time constants during discharge, about what fraction of the initial voltage remains?", ["about 13.5%", "about 86.5%", "about 63.2%", "about 50%"], 0, "Discharge leaves e^-2 of the initial value after two tau.", hint),
    mc("If the resistance doubles and capacitance stays fixed, what happens to the time constant?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Tau is directly proportional to R.", hint),
    mc("If the capacitance halves and resistance stays fixed, what happens to the time constant?", ["it halves", "it doubles", "it stays the same", "it quadruples"], 0, "Tau is directly proportional to C.", hint),
    mc("Which statement about RC charging graphs is safest?", ["they are exponential curves, not straight lines", "they are always horizontal", "charging current increases linearly with time", "capacitor p.d. jumps instantly to the supply"], 0, "A7_L5 protects changing-rate reasoning.", hint),
    mc("Which statement about the charging and discharging time constant is correct for the same R and C?", ["the same tau governs both processes", "charging uses tau but discharging does not", "discharging uses a different tau automatically", "tau depends only on the starting voltage"], 0, "The same RC product sets the timescale for both.", hint),
    shortCases([
      { prompt: "The RC time constant is resistance times ...", acceptedAnswers: ["capacitance"], hint: "That is tau = RC." },
      { prompt: "After one time constant of charging, the capacitor p.d. is about ... percent of the final value.", acceptedAnswers: ["63.2", "63", "63.2%"], hint: "Use the e^-1 rule." },
      { prompt: "After one time constant of discharge, about ... percent of the initial voltage remains.", acceptedAnswers: ["36.8", "37", "36.8%"], hint: "That is e^-1 of the start value." },
      { prompt: "Charging current starts ... and then falls.", acceptedAnswers: ["large", "high"], hint: "It is greatest at the start." },
      { prompt: "RC response is a changing-... process.", acceptedAnswers: ["rate"], hint: "That is the point of the lesson." },
      { prompt: "A7_L5 protects exponential rather than straight-line ...", acceptedAnswers: ["thinking", "reasoning"], hint: "Do not picture a constant-rate fill." },
      { prompt: "Larger R or larger C means a larger time ...", acceptedAnswers: ["constant", "tau"], hint: "The timescale gets longer." },
      { prompt: "Charging and discharging in the same RC circuit share the same ...", acceptedAnswers: ["time constant", "tau"], hint: "R and C have not changed." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep capacitor p.d., current, and time on the same changing-rate story line.";
  return [
    mc("Why is RC charging not a straight-line fill?", ["the driving p.d. and current change as the capacitor charges, so the rate slows down", "the resistor value changes every second", "the supply emf falls to zero", "capacitance disappears during charging"], 0, "A7_L5 wants the changing-rate mechanism visible.", hint),
    mc("Why does the charging current fall as the capacitor voltage rises?", ["the resistor sees a shrinking p.d. as the capacitor takes more of the supply", "current conservation fails in RC circuits", "capacitance forces resistance to rise", "the source emf increases"], 0, "The resistor's share of the supply gets smaller during charging.", hint),
    mc("Why does a larger time constant mean a slower response?", ["it takes longer for the exponential charge or discharge curve to move through the same fraction of its change", "the final voltage becomes larger", "the capacitor stores less charge", "the current becomes constant"], 0, "Tau is the response timescale.", hint),
    mc("Why is one time constant a useful benchmark rather than a full completion time?", ["it gives a standard fractional checkpoint for the exponential curve, not the final finished state", "the process is fully complete at one tau", "it only applies to discharge", "it makes voltage linear"], 0, "One tau is a reference point, not total completion.", hint),
    mc("Why do charging and discharging in the same RC circuit share the same tau?", ["both are governed by the same product R C", "the sign of current changes tau", "the initial voltage sets tau", "charging always uses a longer tau"], 0, "The time constant depends only on R and C.", hint),
    mc("Which statement best protects the A7_L5 lesson meaning?", ["RC behaviour is exponential and governed by the time constant, not by a constant-rate ramp.", "Charging current is constant because the resistor is fixed.", "Discharge voltage falls linearly to zero.", "Time constant tells the final voltage directly."], 0, "That keeps the process model correct.", hint),
    mc("Why is it weak to say 'the capacitor charges more slowly later' without mentioning current or p.d.?", ["the slowing happens because the resistor current falls as the capacitor p.d. builds up", "late-time behaviour is random", "capacitors stop obeying Q = CV later", "the supply turns off automatically"], 0, "The mechanism is the changing resistor p.d. and current.", hint),
    mc("Why does discharge also have a changing rate rather than a constant fall?", ["the current shrinks as the remaining capacitor voltage shrinks", "the resistor forces a fixed current", "discharge does not involve tau", "voltage must drop by equal amounts in equal times"], 0, "Less capacitor voltage means less driving p.d. for the discharge current.", hint),
    mc("Why should worked examples compare capacitor p.d. and current together during charging?", ["they move in opposite ways, which makes the changing-rate behaviour easier to understand", "they are always numerically equal", "current stays fixed while voltage changes", "the comparison removes the need for tau"], 0, "The opposite trends are the key visual pattern.", hint),
    mc("Why is exponential language better than 'curved graph' language alone?", ["it names the quantitative response pattern instead of only describing the shape loosely", "curved graphs can only mean charging", "exponential means the process is linear", "exponential language is only for ideal sources"], 0, "A7_L5 wants mechanism plus mathematical form.", hint),
    mc("What common mistake is A7_L5 preventing?", ["imagining capacitor charging and discharging as straight-line constant-rate processes", "thinking resistors have units", "thinking capacitors store no charge", "thinking time constants use volts"], 0, "The lesson is defending exponential reasoning.", hint),
    mc("Why does increasing capacitance slow the response when resistance stays fixed?", ["more charge must be moved per volt of capacitor p.d., so the RC timescale increases", "capacitance lowers the final voltage", "the resistor value becomes zero", "current no longer changes"], 0, "Larger C stretches the response timescale.", hint),
    shortCases([
      { prompt: "RC response is ... rather than linear.", acceptedAnswers: ["exponential"], hint: "Name the mathematical pattern." },
      { prompt: "During charging, capacitor p.d. rises while current ...", acceptedAnswers: ["falls", "decreases"], hint: "The two trends go opposite ways." },
      { prompt: "The timescale symbol for RC response is ...", acceptedAnswers: ["tau"], hint: "That is the Greek-letter name." },
      { prompt: "One time constant is a standard fractional ...", acceptedAnswers: ["checkpoint", "benchmark"], hint: "Not a completion time." },
      { prompt: "A7_L5 protects changing-rate rather than constant-... thinking.", acceptedAnswers: ["rate"], hint: "That is the core correction." },
      { prompt: "Larger capacitance means more charge per volt and a ... response.", acceptedAnswers: ["slower"], hint: "Tau gets bigger." },
      { prompt: "Discharge current shrinks because the remaining capacitor ... shrinks.", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "Less driving push remains." },
      { prompt: "The strongest RC explanation keeps voltage, current, and ... together.", acceptedAnswers: ["time"], hint: "All three belong on one board." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep capacitance, voltage or charge condition, and field energy together.";
  return [
    mc("Which relation gives the energy stored in a capacitor at known capacitance and p.d.?", ["E = 1/2 C V^2", "Q = C V", "tau = R C", "V = epsilon - I r"], 0, "Use the capacitor-energy relation.", hint),
    mc("Where is energy stored in a charged capacitor?", ["in the electric field", "inside the resistor", "in the terminal p.d. only", "in the wire current"], 0, "Capacitor energy belongs to the field between the plates.", hint),
    mc("A 4.0 microfarad capacitor is charged to 200 V. What is the stored energy?", [valueWithUnit(0.08, "J", 2), valueWithUnit(0.16, "J", 2), valueWithUnit(0.40, "J", 2), valueWithUnit(0.004, "J", 3)], 0, "Use E = 1/2 C V^2.", hint),
    mc("If capacitance triples while voltage stays fixed, what happens to stored energy?", ["it triples", "it doubles", "it stays the same", "it becomes one third"], 0, "At fixed V, energy is directly proportional to C.", hint),
    mc("A 10 microfarad capacitor is charged to 12 V. What is the stored energy?", [valueWithUnit(7.2e-4, "J", 4), valueWithUnit(1.2e-4, "J", 4), valueWithUnit(1.44e-3, "J", 4), valueWithUnit(0.06, "J", 2)], 0, "Substitute into 1/2 C V squared.", hint),
    mc("If voltage doubles while capacitance stays fixed, what happens to stored energy?", ["it becomes four times larger", "it doubles", "it halves", "it stays the same"], 0, "Energy depends on V squared.", hint),
    mc("A 4.0 microfarad capacitor at 200 V is disconnected, then a dielectric triples the capacitance to 12 microfarads. What is the new voltage?", [valueWithUnit(66.7, "V", 1), valueWithUnit(200.0, "V", 1), valueWithUnit(600.0, "V", 1), valueWithUnit(133.3, "V", 1)], 0, "With the capacitor isolated, charge stays fixed so V = Q / C.", hint),
    mc("If a dielectric is inserted while the capacitor remains connected to a fixed-voltage supply, what definitely stays fixed?", ["the voltage", "the charge", "the energy", "the current"], 0, "Connection to the supply fixes V.", hint),
    mc("If a dielectric is inserted into an isolated charged capacitor, what definitely stays fixed?", ["the charge", "the voltage", "the capacitance", "the energy"], 0, "Isolation fixes the stored charge.", hint),
    mc("Which change tends to increase capacitance?", ["larger plate area, smaller separation, or adding a dielectric", "smaller area and larger separation", "removing the field entirely", "lower source emf only"], 0, "C scales with dielectric response and area, and inversely with separation.", hint),
    mc("Which statement about capacitor energy is safest?", ["stored energy depends on both capacitance and voltage, and the effect of a dielectric depends on what is held fixed", "stored energy depends on capacitance only", "dielectrics never change stored energy", "energy is stored only in the source"], 0, "A7_L6 joins calculation to physical constraint reasoning.", hint),
    mc("Why can a dielectric raise stored energy when the supply stays connected?", ["the voltage stays fixed while the capacitance increases, so E = 1/2 C V^2 increases", "the charge must fall to zero", "the electric field disappears", "time constant becomes larger"], 0, "Connected-supply and isolated-capacitor cases differ.", hint),
    shortCases([
      { prompt: "Capacitor energy is stored in the electric ...", acceptedAnswers: ["field"], hint: "That is the location of the energy." },
      { prompt: "At fixed voltage, larger capacitance means larger stored ...", acceptedAnswers: ["energy"], hint: "Use 1/2 C V squared." },
      { prompt: "At fixed capacitance, doubling voltage makes energy ... times larger.", acceptedAnswers: ["4", "four"], hint: "Energy depends on V squared." },
      { prompt: "A dielectric can increase the capacitor's ...", acceptedAnswers: ["capacitance"], hint: "That is its direct effect." },
      { prompt: "With the supply still connected, dielectric insertion keeps the ... fixed.", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "The source still sets it." },
      { prompt: "With the capacitor isolated, dielectric insertion keeps the ... fixed.", acceptedAnswers: ["charge"], hint: "No path for charge to leave or enter." },
      { prompt: "A7_L6 keeps field energy and constraint conditions ...", acceptedAnswers: ["together", "linked"], hint: "State what is held fixed." },
      { prompt: "A strong A7_L6 answer names whether voltage or ... is fixed.", acceptedAnswers: ["charge"], hint: "That decides the dielectric outcome." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Name the fixed condition before predicting what the dielectric changes.";
  return [
    mc("Why is capacitor energy described as field energy rather than as charge by itself?", ["the stored energy belongs to the electric field established between the plates", "charge and energy are the same quantity", "fields do not exist in capacitors", "energy is stored only in the battery"], 0, "A7_L6 keeps the physical storage location visible.", hint),
    mc("Why does doubling voltage have a stronger effect on stored energy than doubling capacitance?", ["energy depends on V squared but only linearly on C", "capacitance has no effect on energy", "doubling voltage halves the charge", "field energy ignores p.d."], 0, "The voltage dependence is quadratic.", hint),
    mc("Why must connected-supply and isolated-capacitor dielectric cases be kept separate?", ["the fixed quantity differs, so voltage-fixed and charge-fixed predictions are not the same", "dielectrics only work when the supply is disconnected", "connected capacitors cannot store energy", "isolated capacitors lose all charge immediately"], 0, "A7_L6 is about constraint-sensitive reasoning.", hint),
    mc("Why does a connected capacitor gain stored energy when a dielectric increases C at fixed V?", ["E = 1/2 C V^2 rises directly with capacitance when the supply keeps voltage fixed", "charge is forced to stay zero", "the field disappears", "the source emf becomes smaller"], 0, "Fixed V means larger C gives larger energy.", hint),
    mc("Why does an isolated capacitor's voltage fall when a dielectric increases C?", ["the charge stays fixed, so the same charge is now shared by a larger storage ratio", "the supply raises the voltage", "capacitance and voltage must rise together", "the dielectric removes charge from the plates"], 0, "Use Q = C V with fixed Q.", hint),
    mc("Which statement best protects the A7_L6 lesson meaning?", ["Capacitor energy depends on capacitance and voltage, and dielectric effects must be read under the correct fixed condition.", "Dielectrics always raise voltage.", "Stored energy depends on charge only and ignores capacitance.", "Connected and disconnected cases give the same dielectric outcome."], 0, "That keeps the full constraint-aware story intact.", hint),
    mc("Why is it weak to say 'a dielectric increases energy' without more context?", ["whether the energy rises or falls depends on what quantity is held fixed", "dielectrics never change capacitance", "field energy is unrelated to voltage", "all capacitors behave identically"], 0, "The fixed condition must be named.", hint),
    mc("Why is plate area part of an energy-storage discussion even before numbers are substituted?", ["plate area helps set capacitance, which then affects stored energy", "plate area changes emf directly", "area only matters in resistors", "geometry never affects capacitor behaviour"], 0, "Geometry matters through capacitance.", hint),
    mc("Why is smaller plate separation associated with larger capacitance?", ["the plate arrangement supports more stored charge per volt", "it always lowers the source voltage", "it removes the field", "it makes the capacitor ideal"], 0, "Capacitance tracks the storage ratio of the geometry.", hint),
    mc("Why should worked examples show both fixed-voltage and fixed-charge dielectric cases?", ["the contrast makes the role of the held-constant condition explicit", "the two cases are mathematically identical", "voltage and charge are never related", "dielectrics only affect disconnected capacitors"], 0, "Side-by-side comparison prevents overgeneralization.", hint),
    mc("What common mistake is A7_L6 preventing?", ["giving one universal dielectric answer without stating whether voltage or charge is fixed", "thinking capacitors can store energy", "thinking volts are measured in coulombs", "thinking fields can have energy"], 0, "The lesson is defending constraint-based interpretation.", hint),
    mc("Why is the formula C proportional to epsilon_r A / d useful conceptually even without detailed constants?", ["it shows how material response and geometry change the storage ratio before energy calculations are made", "it replaces the need for energy formulas", "it means capacitance is dimensionless", "it works only for batteries"], 0, "The proportionality links the physical construction to the circuit quantity.", hint),
    shortCases([
      { prompt: "Capacitor energy belongs to the electric ...", acceptedAnswers: ["field"], hint: "That is the storage location." },
      { prompt: "Energy depends linearly on capacitance but ... on voltage.", acceptedAnswers: ["quadratically", "as the square"], hint: "Use the V squared idea." },
      { prompt: "Dielectric reasoning must name what is held ...", acceptedAnswers: ["fixed", "constant"], hint: "That controls the outcome." },
      { prompt: "Connected-supply dielectric insertion keeps the ... fixed.", acceptedAnswers: ["voltage", "p.d.", "pd"], hint: "The source still sets it." },
      { prompt: "Isolated-capacitor dielectric insertion keeps the ... fixed.", acceptedAnswers: ["charge"], hint: "The plates are cut off from the source." },
      { prompt: "A7_L6 keeps energy, capacitance, and the fixed ... together.", acceptedAnswers: ["condition", "constraint"], hint: "Do not drop the setup detail." },
      { prompt: "Plate area and dielectric material affect stored energy through their effect on ...", acceptedAnswers: ["capacitance"], hint: "That is the bridge quantity." },
      { prompt: "A strong capacitor-energy answer names whether the capacitor is connected or ...", acceptedAnswers: ["isolated", "disconnected"], hint: "That sets the fixed quantity." },
    ]),
  ];
}

const A7_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A7_L1: l1DiagnosticRaw,
  A7_L2: l2DiagnosticRaw,
  A7_L3: l3DiagnosticRaw,
  A7_L4: l4DiagnosticRaw,
  A7_L5: l5DiagnosticRaw,
  A7_L6: l6DiagnosticRaw,
};

const A7_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A7_L1: l1ConceptRaw,
  A7_L2: l2ConceptRaw,
  A7_L3: l3ConceptRaw,
  A7_L4: l4ConceptRaw,
  A7_L5: l5ConceptRaw,
  A7_L6: l6ConceptRaw,
};

const A7_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(A7_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A7_DIAGNOSTIC_BUILDERS[code](), ...A7_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function a7GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A7_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a7GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A7_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a7GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A7_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
