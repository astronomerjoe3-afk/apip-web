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
  hint = "Rebuild the oscillation rule before choosing.",
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
    throw new Error(`A5 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function leftAnswers(): string[] {
  return ["left", "to the left", "left toward equilibrium", "toward equilibrium"];
}

function rightAnswers(): string[] {
  return ["right", "to the right", "right toward equilibrium", "toward equilibrium"];
}

function zeroAnswers(): string[] {
  return ["0", "zero", "zero force", "zero acceleration"];
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Anchor the reading to equilibrium, amplitude, and restoring direction.";
  return [
    mc("Which statement defines an oscillation most safely?", ["repeated motion about an equilibrium position", "any repeated motion with no reference point", "motion that always keeps constant speed", "motion that never reverses direction"], 0, "An oscillation is organized around a balance position.", hint),
    mc("What is the amplitude of an oscillation?", ["the maximum displacement from equilibrium", "the full turning-point to turning-point distance", "the speed at equilibrium", "the time for one cycle"], 0, "Amplitude is a one-side distance from the center.", hint),
    mc("At a turning point in an ideal oscillator, which statement is correct?", ["speed is zero there", "restoring force is zero there", "displacement is zero there", "the system has no energy there"], 0, "The motion reverses at the turning point, so the speed is zero.", hint),
    mc("If a mass is displaced to the right of equilibrium, the restoring force points...", ["to the left", "to the right", "upward", "nowhere because the force must be zero"], 0, "The restoring effect points back toward equilibrium.", hint),
    ...[0.08, 0.12, 0.15, 0.21].map((amplitude) =>
      mc(
        `An oscillator has amplitude ${valueWithUnit(amplitude, "m", 2)}. What is the full turning-point to turning-point excursion?`,
        [valueWithUnit(2 * amplitude, "m", 2), valueWithUnit(amplitude, "m", 2), valueWithUnit(4 * amplitude, "m", 2), valueWithUnit(amplitude / 2, "m", 2)],
        0,
        "Full excursion is twice the amplitude because it runs from one edge through the center to the opposite edge.",
        hint,
      ),
    ),
    ...[0.06, 0.10, 0.14, 0.18].map((amplitude) =>
      mc(
        `A simple oscillator has amplitude ${valueWithUnit(amplitude, "m", 2)}. How far does it travel in one complete cycle?`,
        [valueWithUnit(4 * amplitude, "m", 2), valueWithUnit(2 * amplitude, "m", 2), valueWithUnit(amplitude, "m", 2), valueWithUnit(8 * amplitude, "m", 2)],
        0,
        "One full cycle covers four amplitude lengths: center to one edge, all the way across, and back again.",
        hint,
      ),
    ),
    ...[0.11, 0.16].map((amplitude) =>
      mc(
        `The turning points are at +${formatNumber(amplitude, 2)} m and -${formatNumber(amplitude, 2)} m. What is the amplitude?`,
        [valueWithUnit(amplitude, "m", 2), valueWithUnit(2 * amplitude, "m", 2), valueWithUnit(amplitude / 2, "m", 3), "0 m"],
        0,
        "Amplitude is measured from equilibrium to one turning point.",
        hint,
      ),
    ),
    mc("At the exact equilibrium position in an ideal spring-mass oscillator, what is true about the restoring force?", ["it is zero there", "it is maximum there", "it points away from the center", "it equals the amplitude"], 0, "At x = 0, the restoring force is zero.", hint),
    shortCases([
      { prompt: "The balance position about which the motion repeats is the ... position.", acceptedAnswers: ["equilibrium", "equilibrium position"], hint: "Use the center-reference term." },
      { prompt: "Amplitude is the maximum ... from equilibrium.", acceptedAnswers: ["displacement"], hint: "It is a one-side distance." },
      { prompt: "The restoring effect points back toward ...", acceptedAnswers: ["equilibrium", "the equilibrium position", "the center"], hint: "Name the balance point." },
      { prompt: "The full edge-to-edge excursion is ... times the amplitude.", acceptedAnswers: ["2", "two"], hint: "Think turning point to turning point." },
      { prompt: "The distance traveled in one full cycle is ... times the amplitude.", acceptedAnswers: ["4", "four"], hint: "A full cycle covers four amplitude lengths." },
      { prompt: "The speed at a turning point is ...", acceptedAnswers: ["0", "zero"], hint: "The motion reverses there." },
      { prompt: "The force that brings an oscillator back toward the center is the ... force.", acceptedAnswers: ["restoring"], hint: "Use the return-tendency word." },
      { prompt: "A strong A5_L1 reading names the ... reference before the larger visible span.", acceptedAnswers: ["equilibrium", "center", "equilibrium position"], hint: "Start from the center." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep equilibrium, amplitude, and restoring direction visible in the explanation.";
  return [
    mc("Why is 'back and forth motion' not yet a full A5_L1 answer?", ["the equilibrium reference and restoring tendency still need to be identified", "oscillations never reverse", "only the period matters in this lesson", "amplitude replaces equilibrium"], 0, "The lesson is protecting the center-reference and return-direction structure.", hint),
    mc("Why is amplitude not the full turning-point to turning-point distance?", ["amplitude is measured from equilibrium to one turning point only", "amplitude is measured during two cycles", "amplitude is always smaller than displacement", "amplitude is a force rather than a distance"], 0, "Amplitude is a one-side displacement from the center.", hint),
    mc("Why should equilibrium be marked first on the diagram?", ["every later distance and restoring-direction statement is referenced to it", "equilibrium always has the largest speed and force together", "it removes the need for turning points", "it makes the period obvious without calculation"], 0, "The center is the reference for the whole reading.", hint),
    mc("Why does the restoring direction change when the displacement changes sign?", ["the restoring effect always points back toward equilibrium from either side", "the amplitude changes sign every half-cycle", "the system gains energy only on the left", "the turning points create new forces"], 0, "Return direction depends on which side of equilibrium the oscillator is on.", hint),
    mc("Why is the full excursion still useful even though it is not the amplitude?", ["some questions ask for edge-to-edge span rather than center-to-edge displacement", "it replaces the need for equilibrium", "it is the same as one-cycle distance", "it only matters for damping problems"], 0, "It is a different distance for a different question type.", hint),
    mc("Why is a turning point a better checkpoint than 'the edge' in oscillation language?", ["it identifies where the motion reverses and the speed is zero", "it proves the restoring force vanishes everywhere", "it tells you the frequency immediately", "it makes amplitude equal to one full cycle distance"], 0, "Turning-point language carries physics meaning.", hint),
    mc("Which statement best protects the A5_L1 lesson meaning?", ["Mark equilibrium, read one-side amplitude, and then state the restoring direction.", "Name the biggest visible span first because it is easiest to see.", "Treat amplitude and excursion as interchangeable.", "Read the period before you locate the center."], 0, "That sequence keeps the geometry and return rule visible.", hint),
    mc("Why is 'largest visible distance' a dangerous shortcut in oscillation diagrams?", ["it often confuses the full excursion with the amplitude", "it always gives the period instead", "it removes the need for equilibrium", "it guarantees the direction is correct"], 0, "The biggest span is not always the named quantity the question wants.", hint),
    mc("Why does the restoring-force idea matter already in the first lesson?", ["it explains why the motion keeps returning toward the center instead of wandering away", "it proves the oscillator has constant speed", "it shows that amplitude must shrink each cycle", "it replaces displacement"], 0, "The return tendency is the mechanism behind the oscillation.", hint),
    mc("Why is the speed zero at a turning point but not necessarily at equilibrium?", ["the oscillator reverses at the edge but passes through the center", "equilibrium is the place where all energy disappears", "the turning point has zero displacement", "equilibrium removes the restoring force everywhere"], 0, "The turning point is a reversal point, while equilibrium is a crossing point.", hint),
    mc("What core mistake is A5_L1 trying to prevent?", ["renaming the full span as amplitude and forgetting to state the restoring direction", "thinking oscillations can never have equilibrium", "believing the period is measured in metres", "treating displacement as always positive"], 0, "The lesson is preventing naming and direction errors before formulas arrive.", hint),
    mc("Why is an oscillation still described with displacement signs on both sides of the center?", ["the sign tells which side of equilibrium the system is on", "the sign changes the amplitude value itself", "signs matter only for frequency", "signs can be ignored because the motion repeats"], 0, "Sign keeps direction and side of center explicit.", hint),
    shortCases([
      { prompt: "A strong A5_L1 answer names the ... first.", acceptedAnswers: ["equilibrium", "center", "equilibrium position"], hint: "Start from the reference point." },
      { prompt: "Amplitude is a ...-side maximum displacement.", acceptedAnswers: ["one", "single"], hint: "It is not edge to edge." },
      { prompt: "The restoring effect tells which ... the oscillator tends to move next.", acceptedAnswers: ["direction", "way"], hint: "Use the motion-orientation word." },
      { prompt: "Turning-point to turning-point span is the full ...", acceptedAnswers: ["excursion", "span"], hint: "Use the edge-to-edge distance label." },
      { prompt: "At a turning point the motion ...", acceptedAnswers: ["reverses", "changes direction"], hint: "That is why the speed is zero there." },
      { prompt: "The center-to-edge distance should not be confused with the full ...", acceptedAnswers: ["excursion", "edge-to-edge span"], hint: "Keep the two distances separate." },
      { prompt: "The restoring effect exists because the oscillator is ... from equilibrium.", acceptedAnswers: ["displaced", "away"], hint: "The return tendency begins after a displacement." },
      { prompt: "The safest diagram reading is center, one side, full span, then return ...", acceptedAnswers: ["direction"], hint: "Finish with the directional statement." },
    ]),
  ];
}

function l1MasteryRaw(): RawCollectionItem[] {
  const hint = "Rebuild the center-reference picture before choosing.";
  return [
    ...[0.07, 0.09, 0.12, 0.15, 0.18, 0.22].map((amplitude) =>
      mc(
        `A spring-mass oscillator has amplitude ${valueWithUnit(amplitude, "m", 2)}. What is the turning-point to turning-point excursion?`,
        [valueWithUnit(2 * amplitude, "m", 2), valueWithUnit(amplitude, "m", 2), valueWithUnit(4 * amplitude, "m", 2), valueWithUnit(amplitude / 2, "m", 3)],
        0,
        "The full excursion is twice the amplitude because it spans both sides of the center.",
        hint,
      ),
    ),
    ...[0.14, 0.18, 0.22, 0.28, 0.34, 0.40].map((excursion) =>
      short(
        `An oscillator's turning-point to turning-point excursion is ${valueWithUnit(excursion, "m", 2)}. What is the amplitude?`,
        twoDpAnswers(excursion / 2, "m"),
        "Amplitude is half the edge-to-edge excursion.",
      ),
    ),
    ...[0.24, 0.36, 0.44, 0.56, 0.64, 0.80].map((cycleDistance) =>
      mc(
        `An oscillator travels ${valueWithUnit(cycleDistance, "m", 2)} in one complete cycle. What is its amplitude?`,
        [
          valueWithUnit(cycleDistance / 4, "m", 2),
          valueWithUnit(cycleDistance / 2, "m", 2),
          valueWithUnit(cycleDistance / 8, "m", 3),
          valueWithUnit(cycleDistance, "m", 2),
        ],
        0,
        "One complete cycle covers four amplitude lengths.",
        hint,
      ),
    ),
    ...[0.10, 0.12, 0.16, 0.19, 0.23, 0.27].map((amplitude) =>
      mc(
        `The turning points are at +${formatNumber(amplitude, 2)} m and -${formatNumber(amplitude, 2)} m. Which pair is correct?`,
        [
          `amplitude ${valueWithUnit(amplitude, "m", 2)} and full excursion ${valueWithUnit(2 * amplitude, "m", 2)}`,
          `amplitude ${valueWithUnit(2 * amplitude, "m", 2)} and full excursion ${valueWithUnit(amplitude, "m", 2)}`,
          `amplitude ${valueWithUnit(amplitude / 2, "m", 3)} and full excursion ${valueWithUnit(amplitude, "m", 2)}`,
          `amplitude 0 m and full excursion ${valueWithUnit(2 * amplitude, "m", 2)}`,
        ],
        0,
        "Amplitude is center to edge; excursion is edge to edge.",
        hint,
      ),
    ),
    ...[
      { side: "right", answer: 0, text: "to the left toward equilibrium" },
      { side: "left", answer: 1, text: "to the right toward equilibrium" },
      { side: "equilibrium", answer: 2, text: "zero because the displacement is zero" },
      { side: "right", answer: 0, text: "to the left toward equilibrium" },
      { side: "left", answer: 1, text: "to the right toward equilibrium" },
      { side: "equilibrium", answer: 2, text: "zero because the displacement is zero" },
    ].map((entry, index) =>
      mc(
        `A mass is ${entry.side} of equilibrium in case ${index + 1}. What is the safest statement about the restoring effect?`,
        ["to the left toward equilibrium", "to the right toward equilibrium", "zero because the displacement is zero", "it points away from equilibrium"],
        entry.answer,
        `The restoring effect is ${entry.text}.`,
        hint,
      ),
    ),
    mc("A learner says, 'Amplitude is the distance from the left turning point to the right turning point.' What is the best correction?", ["That is the full excursion; amplitude is center to one turning point.", "That is correct because amplitude means the biggest visible span.", "Amplitude is the same as one full cycle distance.", "Amplitude is the force at equilibrium."], 0, "The learner has mixed up excursion with amplitude.", hint),
    mc("A pendulum bob passes through equilibrium. Which quantity is zero there in the ideal model?", ["displacement", "speed", "kinetic energy", "motion"], 0, "At equilibrium the displacement is zero even though the motion continues.", hint),
    mc("A question asks for the maximum displacement from equilibrium. Which quantity is being requested?", ["amplitude", "full excursion", "period", "cycle distance"], 0, "Maximum displacement from equilibrium is the amplitude.", hint),
    mc("A question asks for the edge-to-edge span between turning points. Which quantity should be reported?", ["the full excursion 2A", "the amplitude A", "the one-cycle distance 4A", "the restoring force"], 0, "Turning-point to turning-point span is 2A.", hint),
    mc("Why is the phrase 'restoring direction' stronger than simply saying 'it goes back'?", ["it ties the motion to equilibrium as the reference direction", "it proves the period instantly", "it replaces amplitude entirely", "it means the speed is always constant"], 0, "The lesson wants the direction named relative to equilibrium.", hint),
    shortCases([
      { prompt: "A4.0? No. In A5_L1 the one-side maximum displacement is the ...", acceptedAnswers: ["amplitude"], hint: "Use the center-to-edge quantity." },
      { prompt: "If the full turning-point span is 0.50 m, the amplitude is ...", acceptedAnswers: ["0.25", "0.25 m"], hint: "Half the span gives the amplitude." },
      { prompt: "If the amplitude is 0.13 m, one full cycle distance is ...", acceptedAnswers: ["0.52", "0.52 m"], hint: "A full cycle is 4A." },
      { prompt: "At equilibrium the restoring force is ...", acceptedAnswers: ["0", "zero", "zero force"], hint: "Displacement is zero there." },
      { prompt: "From the left turning point the restoring effect points ...", acceptedAnswers: rightAnswers(), hint: "It points back toward the center." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the sign, displacement, and proportional rule visible together.";
  return [
    mc("Which equation captures the restoring-force rule for a spring in SHM?", ["F = -k x", "F = k / x", "F = m g", "F = k x^2"], 0, "The minus sign keeps the force directed back toward equilibrium.", hint),
    mc("Which statement best defines simple harmonic motion?", ["acceleration is proportional to displacement and opposite in direction", "speed is constant at all times", "force always equals weight", "displacement never changes sign"], 0, "SHM is the proportional restoring-acceleration case.", hint),
    mc("At equilibrium in ideal SHM, the restoring acceleration is...", ["zero", "maximum", "equal to g", "always positive"], 0, "When x = 0, the restoring acceleration is zero.", hint),
    mc("If displacement doubles in the same spring-mass system, what happens to the restoring-force magnitude?", ["it doubles", "it halves", "it stays the same", "it quadruples"], 0, "Force magnitude is proportional to displacement magnitude.", hint),
    ...[
      { k: 20, x: 0.10, correct: -2.0 },
      { k: 30, x: -0.05, correct: 1.5 },
      { k: 18, x: 0.20, correct: -3.6 },
    ].map((entry) =>
      mc(
        `A spring has k = ${entry.k} N/m. If x = ${formatNumber(entry.x, 2)} m, what is the restoring force?`,
        [valueWithUnit(entry.correct, "N", 1), valueWithUnit(-entry.correct, "N", 1), valueWithUnit(Math.abs(entry.correct) / 2, "N", 1), valueWithUnit(Math.abs(entry.correct) * 2, "N", 1)],
        0,
        "Use F = -k x and keep the sign of the displacement.",
        hint,
      ),
    ),
    ...[
      { k: 25, m: 0.50, x: 0.12, correct: -6.0 },
      { k: 16, m: 0.40, x: -0.10, correct: 4.0 },
      { k: 30, m: 0.60, x: 0.08, correct: -4.0 },
    ].map((entry) =>
      mc(
        `A mass ${entry.m} kg is attached to a spring with k = ${entry.k} N/m. If x = ${formatNumber(entry.x, 2)} m, what is the acceleration?`,
        [valueWithUnit(entry.correct, "m/s^2", 1), valueWithUnit(-entry.correct, "m/s^2", 1), valueWithUnit(Math.abs(entry.correct) / 2, "m/s^2", 1), valueWithUnit(Math.abs(entry.correct) * 2, "m/s^2", 1)],
        0,
        "Use a = -(k/m) x or calculate the restoring force first and divide by mass.",
        hint,
      ),
    ),
    mc("A positive displacement in SHM gives which acceleration sign?", ["negative", "positive", "zero only", "it depends only on the mass"], 0, "The restoring acceleration points back toward equilibrium.", hint),
    mc("A negative displacement in SHM gives which acceleration sign?", ["positive", "negative", "always zero", "it cannot be determined"], 0, "The sign reverses across equilibrium.", hint),
    mc("Why is SHM more specific than simply saying 'oscillation'?", ["it requires a proportional restoring acceleration rule", "it means the object has constant speed", "it ignores the equilibrium position", "it applies only to pendulums"], 0, "SHM adds a mathematical condition beyond repetition.", hint),
    mc("Which graph shape matches acceleration against displacement in SHM?", ["a straight line through the origin with negative slope", "a horizontal line above the axis", "a vertical line at x = 0", "a parabola that never crosses the axis"], 0, "a against x is linear with negative gradient in SHM.", hint),
    shortCases([
      { prompt: "In SHM the restoring acceleration is proportional to ...", acceptedAnswers: ["displacement"], hint: "Use the x quantity." },
      { prompt: "The restoring acceleration always points toward ...", acceptedAnswers: ["equilibrium", "the equilibrium position", "the center"], hint: "Name the balance point." },
      { prompt: "At x = 0 the restoring acceleration is ...", acceptedAnswers: ["0", "zero"], hint: "The proportional rule gives zero there." },
      { prompt: "The minus sign in F = -k x keeps the force directed ... toward equilibrium.", acceptedAnswers: ["back", "inward", "opposite"], hint: "It shows the return direction." },
      { prompt: "SHM is the ... case of oscillation with the proportional restoring rule.", acceptedAnswers: ["special"], hint: "It is not every repeating motion." },
      { prompt: "In the same system, halving x halves the restoring-force ...", acceptedAnswers: ["magnitude"], hint: "Think direct proportionality." },
      { prompt: "The acceleration-displacement graph for SHM has negative ...", acceptedAnswers: ["slope", "gradient"], hint: "Opposite signs make the line fall." },
      { prompt: "Across equilibrium, the acceleration sign ...", acceptedAnswers: ["flips", "changes", "reverses"], hint: "It follows the displacement sign change." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Explain SHM using the proportional restoring rule rather than the slogan 'back and forth.'";
  return [
    mc("Why is the minus sign essential in F = -k x?", ["it shows the restoring force points opposite to the displacement sign", "it means the spring has negative stiffness", "it removes the need for equilibrium", "it makes force a scalar"], 0, "The minus sign carries the return-direction meaning.", hint),
    mc("Why is SHM not the same as every repeated motion?", ["SHM requires the restoring acceleration magnitude to grow in proportion to displacement", "SHM means the speed never changes", "SHM has no equilibrium position", "SHM ignores direction"], 0, "The proportional rule is the defining extra condition.", hint),
    mc("Why does x = 0 imply a = 0 in ideal SHM?", ["the proportional rule makes acceleration vanish when displacement vanishes", "the system has no mass at equilibrium", "the force becomes weight there", "the oscillator stops forever there"], 0, "If a is proportional to x, zero x gives zero a.", hint),
    mc("Why does doubling the displacement double the acceleration magnitude in the same SHM system?", ["k and m stay fixed, so a is directly proportional to x", "the period doubles every time", "the sign disappears when x changes size", "the force law becomes quadratic"], 0, "Same system means the proportionality constant is unchanged.", hint),
    mc("Why is the acceleration sign opposite to the displacement sign?", ["the motion is always pulled back toward equilibrium", "acceleration always points with velocity", "the amplitude must stay positive", "the period decides the sign"], 0, "Return direction is the core SHM mechanism.", hint),
    mc("Why is a straight-line a against x graph stronger evidence of SHM than a casual motion description?", ["it shows both proportionality and opposite sign in one view", "it proves the object has constant speed", "it removes the need for equations", "it guarantees zero damping"], 0, "The graph visualizes the defining rule directly.", hint),
    mc("A learner says, 'The acceleration is largest where the speed is largest.' Why is that unsafe for SHM?", ["maximum acceleration magnitude occurs at maximum displacement, not at equilibrium where speed is largest", "speed and acceleration are always equal in SHM", "maximum speed occurs at turning points", "acceleration has no sign in SHM"], 0, "The lesson keeps speed and acceleration roles separate.", hint),
    mc("Why is equilibrium still important even in the more mathematical SHM lesson?", ["displacement and restoring acceleration are both measured relative to the equilibrium position", "equilibrium only matters for damping", "equilibrium is the same as maximum speed only", "equilibrium replaces the force law"], 0, "The whole proportional rule is referenced to the center.", hint),
    mc("Which statement best protects the A5_L2 lesson meaning?", ["SHM means acceleration is proportional to displacement and directed toward equilibrium.", "SHM just means repeated motion with any force law.", "SHM means the oscillator never has zero acceleration.", "SHM means force and displacement have the same sign."], 0, "That statement keeps the full defining rule visible.", hint),
    mc("Why is it weak to say 'the force gets bigger further out' and stop there?", ["the direction and proportional relationship still need to be stated", "force size alone proves the period", "the sign never matters in oscillations", "the mass cancels from every SHM question"], 0, "A5_L2 needs magnitude and direction together.", hint),
    mc("Why can the acceleration be positive even when the oscillator is moving left?", ["acceleration depends on displacement, not on which way the velocity happens to point at that instant", "positive acceleration always means motion to the right only", "velocity and acceleration must always share a sign", "this cannot happen in SHM"], 0, "Velocity and acceleration are different quantities.", hint),
    mc("What main mistake is A5_L2 preventing?", ["using 'back and forth' language without the proportional restoring rule", "believing springs can have equilibrium", "thinking displacement is a scalar only", "replacing acceleration with period"], 0, "The lesson is sharpening oscillation into SHM.", hint),
    shortCases([
      { prompt: "A complete A5_L2 answer must include proportionality and the ... direction.", acceptedAnswers: ["restoring", "return"], hint: "The minus sign carries it." },
      { prompt: "At equal distances on opposite sides of equilibrium, the acceleration magnitudes are ...", acceptedAnswers: ["equal", "the same"], hint: "Only the sign changes." },
      { prompt: "At equilibrium the restoring acceleration is ... because x is zero.", acceptedAnswers: ["zero", "0"], hint: "Use the proportional rule." },
      { prompt: "The a against x graph for SHM is a straight line with negative ...", acceptedAnswers: ["slope", "gradient"], hint: "It falls as x increases." },
      { prompt: "SHM is more ... than ordinary oscillation.", acceptedAnswers: ["specific", "strict"], hint: "It adds a mathematical condition." },
      { prompt: "Positive x gives negative a because the system is pulled back toward the ...", acceptedAnswers: ["center", "equilibrium", "equilibrium position"], hint: "Name the reference point." },
      { prompt: "In one fixed system, changing x changes a in direct ...", acceptedAnswers: ["proportion", "proportionality"], hint: "That is the mathematical link." },
      { prompt: "A strong SHM explanation keeps sign, magnitude, and ... visible together.", acceptedAnswers: ["equilibrium", "reference point"], hint: "The center reference matters." },
    ]),
  ];
}

function l2MasteryRaw(): RawCollectionItem[] {
  const hint = "Use the restoring-force rule first, then convert to acceleration if needed.";
  return [
    ...[
      { k: 18, x: 0.10, force: -1.8 },
      { k: 24, x: -0.08, force: 1.92 },
      { k: 30, x: 0.06, force: -1.8 },
      { k: 16, x: -0.12, force: 1.92 },
      { k: 40, x: 0.05, force: -2.0 },
      { k: 28, x: -0.15, force: 4.2 },
    ].map((entry) =>
      mc(
        `For k = ${entry.k} N/m and x = ${formatNumber(entry.x, 2)} m, what is the restoring force?`,
        [valueWithUnit(entry.force, "N", 2), valueWithUnit(-entry.force, "N", 2), valueWithUnit(Math.abs(entry.force) / 2, "N", 2), valueWithUnit(Math.abs(entry.force) * 2, "N", 2)],
        0,
        "Use F = -k x with the displacement sign included.",
        hint,
      ),
    ),
    ...[
      { k: 20, m: 0.50, x: 0.10, a: -4.0 },
      { k: 24, m: 0.60, x: -0.15, a: 6.0 },
      { k: 30, m: 0.75, x: 0.08, a: -3.2 },
      { k: 16, m: 0.40, x: -0.12, a: 4.8 },
      { k: 35, m: 0.70, x: 0.06, a: -3.0 },
      { k: 12, m: 0.30, x: -0.09, a: 3.6 },
    ].map((entry) =>
      mc(
        `A mass ${entry.m} kg on a spring with k = ${entry.k} N/m is at x = ${formatNumber(entry.x, 2)} m. What is the acceleration?`,
        [valueWithUnit(entry.a, "m/s^2", 1), valueWithUnit(-entry.a, "m/s^2", 1), valueWithUnit(Math.abs(entry.a) / 2, "m/s^2", 1), valueWithUnit(Math.abs(entry.a) * 2, "m/s^2", 1)],
        0,
        "Apply a = -(k/m) x and keep the sign.",
        hint,
      ),
    ),
    ...[
      { statement: "displacement is doubled in the same system", choices: ["acceleration magnitude doubles", "acceleration magnitude halves", "acceleration magnitude stays fixed", "acceleration changes sign only"], explanation: "Direct proportionality means doubling x doubles |a|." },
      { statement: "spring constant is doubled while mass and displacement stay fixed", choices: ["acceleration magnitude doubles", "acceleration magnitude halves", "acceleration becomes zero", "acceleration changes sign"], explanation: "a = -(k/m)x, so doubling k doubles |a|." },
      { statement: "mass is doubled while k and x stay fixed", choices: ["acceleration magnitude halves", "acceleration magnitude doubles", "acceleration becomes zero", "the sign must reverse"], explanation: "a = -(k/m)x, so larger mass reduces |a|." },
      { statement: "displacement changes from +x to -x with the same magnitude", choices: ["the acceleration sign reverses but the magnitude stays the same", "the acceleration becomes zero", "the magnitude doubles", "the period becomes zero"], explanation: "Equal distances on opposite sides give equal |a| with opposite sign." },
      { statement: "the oscillator reaches x = 0", choices: ["the restoring acceleration becomes zero there", "the acceleration reaches its maximum there", "the acceleration sign becomes positive only", "the restoring force becomes undefined"], explanation: "Zero displacement gives zero restoring acceleration." },
      { statement: "the object is at maximum displacement", choices: ["the acceleration magnitude is maximum there", "the acceleration must be zero there", "the speed must be maximum there", "the force must vanish there"], explanation: "Maximum |x| gives maximum |a| in SHM." },
    ].map((entry, index) =>
      mc(
        `In SHM, what happens when ${entry.statement} in case ${index + 1}?`,
        entry.choices,
        0,
        entry.explanation,
        hint,
      ),
    ),
    ...[
      { k: 18, m: 0.60, x: 0.10, value: -3.0 },
      { k: 24, m: 0.80, x: -0.10, value: 3.0 },
      { k: 32, m: 0.40, x: 0.05, value: -4.0 },
      { k: 12, m: 0.30, x: -0.15, value: 6.0 },
      { k: 10, m: 0.50, x: 0.20, value: -4.0 },
      { k: 27, m: 0.90, x: -0.12, value: 3.6 },
    ].map((entry) =>
      short(
        `For k = ${entry.k} N/m, m = ${entry.m} kg, and x = ${formatNumber(entry.x, 2)} m, what is the acceleration?`,
        oneDpAnswers(entry.value, "m/s^2"),
        "Use a = -(k/m) x and keep the sign.",
      ),
    ),
    mc("Why is 'the motion is back toward the center' still not enough for a full A5_L2 answer?", ["you still need the proportional relationship between acceleration and displacement", "the direction statement already gives the whole mathematics", "SHM ignores acceleration", "centers do not matter in SHM"], 0, "SHM needs both the return direction and the proportional rule.", hint),
    mc("Why is it safer to compare two displacements in the same system than in two unrelated systems?", ["the same k/m ratio keeps the proportional comparison valid", "different systems always give the same acceleration anyway", "SHM does not depend on mass", "the sign rule changes between systems"], 0, "The proportional constant belongs to the system.", hint),
    mc("Which statement best shows mathematical rigor in SHM?", ["positive x gives negative a, and doubling |x| doubles |a| for the same system", "speed is always constant in SHM", "restoring force always points with displacement", "equilibrium has maximum acceleration"], 0, "That statement keeps both sign and proportionality.", hint),
    mc("Why is maximum acceleration not at equilibrium in SHM?", ["because acceleration magnitude grows with displacement magnitude and x = 0 at equilibrium", "because speed is zero at equilibrium", "because the amplitude becomes negative there", "because the spring constant disappears"], 0, "Acceleration follows displacement, not speed.", hint),
    mc("What common mistake does A5_L2 correct?", ["treating SHM as a label without checking sign and proportionality", "thinking springs have no force", "assuming x is always positive", "replacing acceleration with period"], 0, "The lesson is preventing slogan-only SHM answers.", hint),
    shortCases([
      { prompt: "In SHM the restoring acceleration is proportional to ... and opposite in direction.", acceptedAnswers: ["displacement"], hint: "Use the x quantity." },
      { prompt: "A positive displacement gives a ... acceleration sign.", acceptedAnswers: ["negative"], hint: "The response points back." },
      { prompt: "A negative displacement gives a ... acceleration sign.", acceptedAnswers: ["positive"], hint: "The sign flips across the center." },
      { prompt: "The a against x line for SHM passes through the ...", acceptedAnswers: ["origin"], hint: "Zero x gives zero a." },
      { prompt: "A stronger SHM explanation names the return direction and the direct ...", acceptedAnswers: ["proportion", "proportionality"], hint: "That is the mathematical link." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Read amplitude and angular frequency first, then connect them to the graphs.";
  return [
    mc("Which formula converts frequency into period?", ["T = 1/f", "f = 1/T^2", "v = omega A", "a = -omega^2 x"], 0, "Period is the reciprocal of frequency.", hint),
    mc("Which formula links angular frequency and ordinary frequency?", ["omega = 2 pi f", "omega = f / 2 pi", "omega = A / T", "omega = v / x"], 0, "Angular frequency is 2 pi times ordinary frequency.", hint),
    mc("In ideal SHM, where is the speed greatest?", ["at equilibrium", "at a turning point", "halfway between turning points only", "speed is constant everywhere"], 0, "The oscillator moves fastest as it crosses the center.", hint),
    mc("In ideal SHM, where is the acceleration magnitude greatest?", ["at maximum displacement", "at equilibrium", "at every point equally", "only after one full cycle"], 0, "Maximum |x| gives maximum |a|.", hint),
    ...[
      { equation: "x = 0.040 cos(4 pi t)", amplitude: "0.040 m" },
      { equation: "x = 0.060 sin(6 pi t)", amplitude: "0.060 m" },
      { equation: "x = 0.080 cos(8 pi t)", amplitude: "0.080 m" },
    ].map((entry) =>
      mc(
        `For ${entry.equation}, what is the amplitude?`,
        [entry.amplitude, "0.020 m", "0.40 m", "depends on time"],
        0,
        "The coefficient of x gives the amplitude.",
        hint,
      ),
    ),
    ...[
      { equation: "x = 0.040 cos(4 pi t)", frequency: "2 Hz" },
      { equation: "x = 0.060 sin(6 pi t)", frequency: "3 Hz" },
      { equation: "x = 0.050 cos(10 pi t)", frequency: "5 Hz" },
    ].map((entry) =>
      mc(
        `For ${entry.equation}, what is the frequency?`,
        [entry.frequency, "1 Hz", "4 Hz", "10 Hz"],
        0,
        "Read omega from the equation and use f = omega / 2 pi.",
        hint,
      ),
    ),
    mc("If the displacement is zero in ideal SHM, which statement is safest?", ["speed is maximum and acceleration is zero", "speed is zero and acceleration is maximum", "both speed and acceleration are zero", "all energy is potential"], 0, "Equilibrium crossing means maximum speed and zero restoring acceleration.", hint),
    mc("Which graph type best matches ideal SHM time traces?", ["sinusoidal", "straight line only", "random spikes", "a permanent flat line"], 0, "Ideal SHM produces sinusoidal time graphs.", hint),
    mc("The coefficient of t inside cos or sin in x = A cos(omega t) is the ...", ["angular frequency", "amplitude", "period", "displacement"], 0, "That coefficient is omega.", hint),
    mc("A quarter of a cycle after starting at maximum positive displacement, the oscillator is...", ["at equilibrium", "at maximum negative displacement", "back at maximum positive displacement", "outside the allowed amplitude"], 0, "A quarter cycle takes the oscillator from a turning point to the center.", hint),
    shortCases([
      { prompt: "The time for one complete oscillation is the ...", acceptedAnswers: ["period"], hint: "Use the cycle-time term." },
      { prompt: "The number of oscillations per second is the ...", acceptedAnswers: ["frequency"], hint: "Use the per-second repetition term." },
      { prompt: "Angular frequency is usually written as ...", acceptedAnswers: ["omega"], hint: "Use the standard symbol word." },
      { prompt: "In x = A cos(omega t), the coefficient A gives the ...", acceptedAnswers: ["amplitude"], hint: "It is the size of the motion." },
      { prompt: "At equilibrium in ideal SHM, the speed is ...", acceptedAnswers: ["maximum", "greatest"], hint: "That is the center-crossing checkpoint." },
      { prompt: "At a turning point in ideal SHM, the speed is ...", acceptedAnswers: ["zero", "0"], hint: "The motion reverses there." },
      { prompt: "The displacement, velocity, and acceleration traces are different views of one ...", acceptedAnswers: ["oscillation", "motion"], hint: "They are linked, not separate stories." },
      { prompt: "A full cycle divided by four gives a ... cycle.", acceptedAnswers: ["quarter"], hint: "That checkpoint is often useful." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Treat the equation, graphs, and checkpoints as one SHM story.";
  return [
    mc("Why is x = A cos(omega t) more than just a displacement formula?", ["it also encodes amplitude and timing information for the whole oscillation", "it removes the need for period and frequency", "it means velocity is constant", "it only applies at turning points"], 0, "One SHM equation can reveal several motion properties.", hint),
    mc("Why should period and frequency be taught together?", ["they are reciprocal descriptions of the same cycle timing", "they are unrelated quantities that just share units", "period matters only for graphs while frequency matters only for equations", "frequency is always larger than period"], 0, "They are two linked ways to describe the same repetition.", hint),
    mc("Why is speed maximum at equilibrium in SHM?", ["all the energy is kinetic there and the displacement is zero", "the acceleration is maximum there", "the spring force is maximum there", "equilibrium is a turning point"], 0, "Equilibrium is the fastest crossing, not a stopping point.", hint),
    mc("Why is acceleration zero at equilibrium in ideal SHM?", ["restoring acceleration is proportional to displacement and x = 0 there", "the oscillator has stopped permanently", "period and frequency cancel there", "the energy becomes zero there"], 0, "Zero displacement means zero restoring acceleration.", hint),
    mc("Why is a turning point not the same as a quarter-cycle in every arbitrary starting description?", ["quarter-cycle meaning depends on where the oscillator is taken to start", "turning points do not belong to SHM", "quarter cycles only exist in sine graphs", "turning points have zero displacement"], 0, "Phase checkpoints must be read relative to the chosen start.", hint),
    mc("Why are displacement, velocity, and acceleration graphs phase-linked rather than identical?", ["they track different quantities of the same motion, so their peaks occur at different instants", "the oscillator changes system each quarter cycle", "only displacement is sinusoidal", "velocity and acceleration ignore time"], 0, "They are linked views, not duplicate traces.", hint),
    mc("Why is reading omega before substituting times a good habit?", ["omega sets frequency and period first, so the time value can then be interpreted within the cycle", "time substitution removes the need to know amplitude", "omega only matters after the graph is drawn", "frequency cannot be obtained from omega"], 0, "The lesson wants constants read before phase interpretation.", hint),
    mc("Which statement best protects the A5_L3 lesson meaning?", ["Read A and omega first, convert the timing, then classify the checkpoint on the cycle.", "Collect formulas first and worry about the graph later.", "Use the graph only; equations are a different topic.", "The speed and acceleration traces peak together."], 0, "That sequence keeps the motion story connected.", hint),
    mc("Why is it unsafe to say 'the graph crosses zero so the motion stops there'?", ["a zero displacement crossing in SHM is usually where the speed is largest", "zero on any graph always means rest", "acceleration and displacement must always match", "turning points sit at graph zeros"], 0, "A zero in displacement is not the same as zero motion.", hint),
    mc("Why can one time value be a useful checkpoint in SHM instead of just another number?", ["the phase at that time identifies where the oscillator is in the cycle", "time values never connect to displacement", "every time value gives the same state", "the sign of x stops mattering"], 0, "Time becomes a clue once the cycle is understood.", hint),
    mc("What common mistake is A5_L3 trying to prevent?", ["treating equations, graphs, and motion-state checkpoints as unrelated mini-topics", "thinking SHM has no phase", "believing period is measured in metres", "using equilibrium as a reference point"], 0, "The lesson is integrating the representations.", hint),
    mc("Why is maximum speed not read from the displacement coefficient alone?", ["the timing constant omega also matters through v_max = omega A", "speed in SHM never depends on amplitude", "the coefficient A is always the speed", "speed is the same as period"], 0, "Maximum speed depends on both size and timing.", hint),
    shortCases([
      { prompt: "A strong A5_L3 answer reads the constants first, then the phase ...", acceptedAnswers: ["checkpoint", "state"], hint: "Math first, state second." },
      { prompt: "In ideal SHM, zero displacement at equilibrium means zero restoring ...", acceptedAnswers: ["acceleration"], hint: "Use the proportional rule." },
      { prompt: "The period and frequency are ... descriptions of one cycle timing.", acceptedAnswers: ["reciprocal", "inverse"], hint: "One is the reciprocal of the other." },
      { prompt: "Maximum speed occurs at the ... crossing.", acceptedAnswers: ["equilibrium", "center"], hint: "That is the fastest checkpoint." },
      { prompt: "A turning point has maximum displacement but zero ...", acceptedAnswers: ["speed", "velocity"], hint: "The motion reverses there." },
      { prompt: "The displacement equation coefficient A gives the ...", acceptedAnswers: ["amplitude"], hint: "It measures the size of the oscillation." },
      { prompt: "The coefficient omega sets the motion ...", acceptedAnswers: ["timing", "frequency"], hint: "It is the timing hinge." },
      { prompt: "The SHM traces are phase-... rather than independent.", acceptedAnswers: ["linked"], hint: "They belong to one motion." },
    ]),
  ];
}

function l3MasteryRaw(): RawCollectionItem[] {
  const hint = "Read A and omega first, then use the phase checkpoint carefully.";
  return [
    ...[
      { eq: "x = 0.040 cos(4 pi t)", a: "0.040 m", f: "2 Hz" },
      { eq: "x = 0.060 sin(6 pi t)", a: "0.060 m", f: "3 Hz" },
      { eq: "x = 0.050 cos(8 pi t)", a: "0.050 m", f: "4 Hz" },
      { eq: "x = 0.030 sin(10 pi t)", a: "0.030 m", f: "5 Hz" },
      { eq: "x = 0.080 cos(2 pi t)", a: "0.080 m", f: "1 Hz" },
      { eq: "x = 0.070 sin(12 pi t)", a: "0.070 m", f: "6 Hz" },
    ].map((entry) =>
      mc(
        `For ${entry.eq}, which pair is correct?`,
        [
          `amplitude ${entry.a} and frequency ${entry.f}`,
          `amplitude ${entry.f} and frequency ${entry.a}`,
          `amplitude 0 and frequency ${entry.f}`,
          `amplitude ${entry.a} and frequency 0.5 Hz`,
        ],
        0,
        "Read A from the coefficient and use f = omega / 2 pi.",
        hint,
      ),
    ),
    ...[
      { f: 2, t: 0.5 },
      { f: 4, t: 0.25 },
      { f: 5, t: 0.2 },
      { f: 1.5, t: 0.667 },
      { f: 3, t: 0.333 },
      { f: 6, t: 0.167 },
    ].map((entry) =>
      short(
        `An oscillator has frequency ${valueWithUnit(entry.f, "Hz", 1)}. What is its period?`,
        numericAnswers(entry.t, "s", 3),
        "Use T = 1/f.",
      ),
    ),
    ...[
      { omega: 4 * Math.PI, a: 0.04 },
      { omega: 6 * Math.PI, a: 0.03 },
      { omega: 8 * Math.PI, a: 0.05 },
      { omega: 10 * Math.PI, a: 0.02 },
      { omega: 2 * Math.PI, a: 0.08 },
      { omega: 12 * Math.PI, a: 0.025 },
    ].map((entry) => {
      const vmax = entry.omega * entry.a;
      return mc(
        `For an SHM equation with A = ${valueWithUnit(entry.a, "m", 3)} and omega = ${formatNumber(entry.omega / Math.PI, 0)} pi rad/s, what is v_max?`,
        [
          valueWithUnit(vmax, "m/s", 2),
          valueWithUnit(vmax / 2, "m/s", 2),
          valueWithUnit(entry.a, "m/s", 3),
          valueWithUnit(entry.omega, "m/s", 2),
        ],
        0,
        "Maximum speed in SHM is omega A.",
        hint,
      );
    }),
    ...[
      { eq: "x = 0.080 cos(4 pi t)", time: 0.125, answer: "0 m" },
      { eq: "x = 0.050 cos(4 pi t)", time: 0.25, answer: "-0.050 m" },
      { eq: "x = 0.060 sin(2 pi t)", time: 0.25, answer: "0.060 m" },
      { eq: "x = 0.040 sin(4 pi t)", time: 0.25, answer: "0 m" },
      { eq: "x = 0.070 cos(2 pi t)", time: 0.5, answer: "-0.070 m" },
      { eq: "x = 0.030 sin(6 pi t)", time: 0.167, answer: "0 m" },
    ].map((entry) =>
      mc(
        `For ${entry.eq}, what is the displacement at t = ${formatNumber(entry.time, 3)} s?`,
        [entry.answer, "maximum positive displacement", "half the amplitude", "cannot be found from the equation"],
        0,
        "Use the phase at the specified time and evaluate the sine or cosine value.",
        hint,
      ),
    ),
    ...[
      "At equilibrium in ideal SHM, which pair is correct?",
      "At a turning point in ideal SHM, which pair is correct?",
      "One quarter cycle after leaving a positive turning point, where is the oscillator?",
      "One half cycle after leaving a positive turning point, where is the oscillator?",
      "When displacement is maximum positive, what is true of acceleration?",
      "When displacement is zero, what is true of restoring acceleration?",
    ].map((prompt, index) => {
      const choicesByIndex = [
        ["speed maximum and acceleration zero", "speed zero and acceleration maximum", "both zero", "both maximum"],
        ["speed zero and acceleration magnitude maximum", "speed maximum and acceleration zero", "both zero", "speed maximum and acceleration maximum"],
        ["at equilibrium", "at the opposite turning point", "back at the start", "outside the amplitude"],
        ["at the opposite turning point", "at equilibrium", "back at the start", "outside the amplitude"],
        ["its acceleration is maximum toward equilibrium", "its acceleration is zero", "its speed is maximum", "its period doubles"],
        ["it is zero", "it is maximum", "it points away from equilibrium", "it equals the frequency"],
      ];
      const explanations = [
        "Equilibrium crossing gives maximum speed and zero restoring acceleration.",
        "At a turning point the motion reverses, so speed is zero but |a| is largest.",
        "A quarter cycle takes the oscillator from a turning point to the center.",
        "A half cycle takes the oscillator to the opposite turning point.",
        "Maximum positive displacement means the acceleration is maximum toward the center.",
        "Zero displacement means zero restoring acceleration.",
      ];
      return mc(prompt, choicesByIndex[index], 0, explanations[index], hint);
    }),
    mc("Why is it stronger to say 'x, v, and a are phase-linked' than to just list three formulas?", ["because it explains why the peaks occur at different times for one motion", "because it means the three quantities are numerically equal", "because graphs remove the need for equations", "because phase only matters for damping"], 0, "Phase linkage explains how the representations fit together.", hint),
    mc("A learner substitutes a time value before identifying A and omega. Why is that weak?", ["the size and timing constants should be identified before phase interpretation begins", "time values should never be used in SHM", "A and omega only matter at the end", "frequency cannot be obtained from omega"], 0, "The lesson routine is read constants, then convert timing, then check phase.", hint),
    mc("Why does one SHM equation support both quantitative answers and motion-state answers?", ["the same phase and constants determine displacement, timing, and checkpoints", "equations only give the graph shape", "the graph has no relation to the equation", "the motion state depends only on amplitude"], 0, "A compact equation still describes the whole oscillator.", hint),
    mc("Why is 'speed is zero where the graph crosses zero' a common error?", ["graph zero may mean displacement zero, not speed zero", "all SHM graphs are speed graphs", "speed is never zero in SHM", "zero on any graph means turning point"], 0, "Different graphs represent different quantities.", hint),
    mc("What common mistake does A5_L3 correct?", ["treating equations, graphs, and checkpoints as disconnected facts", "thinking omega has units", "believing frequency and period are unrelated", "using amplitude in metres"], 0, "The lesson is integrating the representations.", hint),
    shortCases([
      { prompt: "In SHM, v_max is found from omega times ...", acceptedAnswers: ["a", "amplitude", "A"], hint: "Maximum speed uses the size and timing constants." },
      { prompt: "At an equilibrium crossing, restoring acceleration is ...", acceptedAnswers: ["zero", "0"], hint: "Displacement is zero there." },
      { prompt: "At a turning point, speed is ...", acceptedAnswers: ["zero", "0"], hint: "The motion reverses there." },
      { prompt: "The ordinary frequency is omega divided by two ...", acceptedAnswers: ["pi"], hint: "Use the angular-frequency conversion." },
      { prompt: "A strong A5_L3 answer links the equation, graph, and phase ...", acceptedAnswers: ["checkpoint", "state"], hint: "That is the motion-classification step." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Run the energy ledger: total first, then the split at the chosen displacement.";
  return [
    mc("In ideal SHM, what happens to the total mechanical energy?", ["it stays constant", "it falls to zero at equilibrium", "it is all potential at every point", "it is all kinetic at every point"], 0, "The ideal undamped oscillator keeps a constant total energy.", hint),
    mc("Where is the kinetic energy greatest in ideal SHM?", ["at equilibrium", "at maximum displacement", "it is the same everywhere", "at one turning point only"], 0, "Speed is greatest at equilibrium, so kinetic energy is greatest there.", hint),
    mc("Where is the elastic potential energy greatest for a spring oscillator?", ["at maximum displacement", "at equilibrium", "halfway to equilibrium only", "it is always zero"], 0, "Potential energy depends on x squared and is largest at maximum |x|.", hint),
    mc("Which formula gives the elastic potential energy in a spring oscillator?", ["E_p = 1/2 k x^2", "E_p = 1/2 m v^2", "E_p = k / x", "E_p = F / x"], 0, "Spring potential energy depends on stiffness and displacement squared.", hint),
    ...[
      { k: 20, a: 0.20, total: 0.40 },
      { k: 32, a: 0.10, total: 0.16 },
      { k: 50, a: 0.12, total: 0.36 },
    ].map((entry) =>
      mc(
        `A spring oscillator has k = ${entry.k} N/m and amplitude ${valueWithUnit(entry.a, "m", 2)}. What is the total energy?`,
        [valueWithUnit(entry.total, "J", 2), valueWithUnit(entry.total / 2, "J", 2), valueWithUnit(entry.total * 2, "J", 2), valueWithUnit(entry.a, "J", 2)],
        0,
        "Use E_total = 1/2 k A^2.",
        hint,
      ),
    ),
    ...[
      { k: 20, x: 0.10, potential: 0.10 },
      { k: 32, x: 0.05, potential: 0.04 },
      { k: 18, x: 0.20, potential: 0.36 },
    ].map((entry) =>
      mc(
        `For k = ${entry.k} N/m and x = ${valueWithUnit(entry.x, "m", 2)}, what is the elastic potential energy?`,
        [valueWithUnit(entry.potential, "J", 2), valueWithUnit(entry.potential / 2, "J", 2), valueWithUnit(entry.potential * 2, "J", 2), valueWithUnit(entry.k * entry.x, "J", 2)],
        0,
        "Use E_p = 1/2 k x^2.",
        hint,
      ),
    ),
    mc("At equilibrium in ideal SHM, what is true about spring potential energy?", ["it is zero for the spring model", "it is maximum", "it equals the amplitude", "it becomes negative"], 0, "At x = 0 the spring potential energy is zero.", hint),
    mc("Which formula connects kinetic energy to speed?", ["E_k = 1/2 m v^2", "E_k = m / v", "E_k = k x", "E_k = 1/2 k A^2"], 0, "Kinetic energy depends on mass and speed squared.", hint),
    mc("If the amplitude increases while k stays fixed, what happens to the total energy?", ["it increases with A squared", "it stays the same", "it halves", "it becomes zero"], 0, "Total energy in a spring oscillator depends on A squared.", hint),
    mc("Why is it unsafe to say 'energy is used up at equilibrium' in ideal SHM?", ["the energy is mostly kinetic there rather than lost", "equilibrium has no energy at all", "potential energy becomes negative there", "the oscillator stops there"], 0, "The energy changes form, not total size.", hint),
    shortCases([
      { prompt: "In ideal SHM, total mechanical energy stays ...", acceptedAnswers: ["constant", "the same"], hint: "It does not drain away in the ideal model." },
      { prompt: "Kinetic energy is greatest at ...", acceptedAnswers: ["equilibrium", "the center"], hint: "That is where speed is greatest." },
      { prompt: "Potential energy in a spring oscillator depends on x ...", acceptedAnswers: ["squared", "2"], hint: "The displacement is squared in the formula." },
      { prompt: "At maximum displacement, the speed is ...", acceptedAnswers: ["zero", "0"], hint: "The oscillator turns around there." },
      { prompt: "The missing share of the total after finding E_p is the ... energy.", acceptedAnswers: ["kinetic"], hint: "Use the energy ledger." },
      { prompt: "A strong A5_L4 solution finds the total energy before the position-specific ...", acceptedAnswers: ["split", "division", "ledger"], hint: "Total first, then the shares." },
      { prompt: "At x = 0 for the spring model, E_p is ...", acceptedAnswers: ["0", "zero"], hint: "Displacement is zero there." },
      { prompt: "Maximum speed in ideal SHM occurs where total energy is all ...", acceptedAnswers: ["kinetic"], hint: "That is the equilibrium checkpoint." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Explain the energy swap and keep the total visible.";
  return [
    mc("Why is it weak to say 'the energy changes' and stop there in A5_L4?", ["the answer still needs to state which forms exchange while the total stays constant", "energy never changes form in SHM", "kinetic energy is the only form present", "potential energy is always zero"], 0, "The lesson wants the split and the conserved total named together.", hint),
    mc("Why does amplitude determine the total energy of an ideal spring oscillator?", ["the amplitude fixes the maximum displacement and therefore the largest spring-energy store", "amplitude only affects the period", "amplitude matters only when damping is present", "total energy does not depend on displacement at all"], 0, "The total is set by the turning-point energy scale.", hint),
    mc("Why is the kinetic energy greatest at equilibrium?", ["the oscillator is moving fastest there", "the spring force is greatest there", "potential energy is greatest there", "the displacement is maximum there"], 0, "Maximum speed means maximum kinetic energy.", hint),
    mc("Why is the potential energy greatest at the turning points?", ["the displacement magnitude is greatest there", "the speed is greatest there", "the period is longest there", "acceleration must be zero there"], 0, "Spring potential energy grows with x squared.", hint),
    mc("Why is total energy a better anchor than speed alone in SHM energy questions?", ["it remains fixed in the ideal model while the forms swap", "speed determines potential energy directly", "total energy changes sign with displacement", "speed is constant in SHM"], 0, "The energy ledger is more stable than any one form.", hint),
    mc("A learner says, 'At equilibrium the oscillator has no energy because the spring is unstretched.' What is the best correction?", ["the energy is still present as kinetic energy at that point", "equilibrium removes both energy forms", "the spring model has negative energy there", "the oscillator stops there"], 0, "The total is not lost at equilibrium.", hint),
    mc("Why should E_p be calculated before E_k in many A5_L4 problems?", ["the position gives x directly, so E_p can be found and then subtracted from the fixed total", "kinetic energy is always the easier formula", "total energy can only be found last", "speed must be known before any energy can be found"], 0, "Displacement feeds directly into spring potential energy.", hint),
    mc("Which statement best protects the A5_L4 lesson meaning?", ["Find the total energy from the amplitude, then split it into E_p and E_k at the chosen position.", "Find speed first and assume the rest is potential.", "Treat total energy as changing through the cycle.", "At equilibrium the oscillator has no energy at all."], 0, "That keeps the energy bookkeeping rigorous.", hint),
    mc("Why is the total energy the same at every displacement in ideal SHM?", ["energy shifts between kinetic and potential without dissipative loss", "the displacement is always constant", "the spring force is always zero", "the acceleration is constant"], 0, "Ideal SHM assumes no damping or energy leakage.", hint),
    mc("Why is the formula E_total = 1/2 k A^2 stronger than a verbal statement alone?", ["it gives a calculable fixed energy scale for the whole oscillator", "it replaces the need for potential energy", "it proves the speed is constant", "it works only at equilibrium"], 0, "The formula quantifies the conserved total.", hint),
    mc("What main mistake is A5_L4 preventing?", ["saying energy has been used up when it has only changed form", "thinking potential energy depends on speed", "believing amplitude has no effect on energy", "treating mass as irrelevant to kinetic energy"], 0, "The lesson guards the energy ledger.", hint),
    mc("Why is speed not maximum where potential energy is maximum in SHM?", ["the turning points have maximum displacement but zero speed", "speed and potential energy always peak together", "kinetic energy is zero at equilibrium", "amplitude disappears at the turning point"], 0, "Turning points store energy rather than carry it as motion.", hint),
    shortCases([
      { prompt: "A5_L4 keeps total energy ... while the forms swap.", acceptedAnswers: ["visible", "constant"], hint: "The total is the anchor." },
      { prompt: "At equilibrium in the spring model, all the energy is ...", acceptedAnswers: ["kinetic"], hint: "The oscillator is moving fastest there." },
      { prompt: "At maximum displacement in the spring model, all the energy is ...", acceptedAnswers: ["potential", "elastic potential"], hint: "Speed is zero there." },
      { prompt: "A strong SHM-energy answer starts from the ... energy set by amplitude.", acceptedAnswers: ["total"], hint: "Use the fixed energy ledger first." },
      { prompt: "Spring potential energy depends on displacement ...", acceptedAnswers: ["squared", "2"], hint: "That is why sign does not matter for E_p." },
      { prompt: "The remaining share after subtracting E_p from E_total is ...", acceptedAnswers: ["kinetic energy", "kinetic"], hint: "Use the energy balance." },
      { prompt: "Ideal SHM assumes negligible ... so the total stays constant.", acceptedAnswers: ["damping", "energy loss"], hint: "No dissipative drain is assumed." },
      { prompt: "The largest speed occurs where the displacement is ...", acceptedAnswers: ["zero", "0"], hint: "That is the equilibrium crossing." },
    ]),
  ];
}

function l4MasteryRaw(): RawCollectionItem[] {
  const hint = "Find the conserved total first, then split it at the chosen displacement.";
  return [
    ...[
      { k: 20, a: 0.20, total: 0.40 },
      { k: 32, a: 0.10, total: 0.16 },
      { k: 50, a: 0.12, total: 0.36 },
      { k: 18, a: 0.20, total: 0.36 },
      { k: 40, a: 0.15, total: 0.45 },
      { k: 25, a: 0.08, total: 0.08 },
    ].map((entry) =>
      mc(
        `A spring oscillator has k = ${entry.k} N/m and amplitude ${valueWithUnit(entry.a, "m", 2)}. What is the total energy?`,
        [valueWithUnit(entry.total, "J", 2), valueWithUnit(entry.total / 2, "J", 2), valueWithUnit(entry.total * 2, "J", 2), valueWithUnit(entry.a, "J", 2)],
        0,
        "Use E_total = 1/2 k A^2.",
        hint,
      ),
    ),
    ...[
      { k: 20, x: 0.10, ep: 0.10 },
      { k: 30, x: 0.08, ep: 0.096 },
      { k: 16, x: 0.15, ep: 0.18 },
      { k: 40, x: 0.05, ep: 0.05 },
      { k: 18, x: 0.20, ep: 0.36 },
      { k: 24, x: 0.10, ep: 0.12 },
    ].map((entry) =>
      mc(
        `For k = ${entry.k} N/m and x = ${valueWithUnit(entry.x, "m", 2)}, what is E_p?`,
        [valueWithUnit(entry.ep, "J", 3), valueWithUnit(entry.ep / 2, "J", 3), valueWithUnit(entry.ep * 2, "J", 3), valueWithUnit(entry.k * entry.x, "J", 2)],
        0,
        "Use E_p = 1/2 k x^2.",
        hint,
      ),
    ),
    ...[
      { total: 0.40, ep: 0.10, ek: 0.30 },
      { total: 0.36, ep: 0.09, ek: 0.27 },
      { total: 0.45, ep: 0.05, ek: 0.40 },
      { total: 0.20, ep: 0.08, ek: 0.12 },
      { total: 0.16, ep: 0.04, ek: 0.12 },
      { total: 0.50, ep: 0.18, ek: 0.32 },
    ].map((entry) =>
      short(
        `If E_total = ${valueWithUnit(entry.total, "J", 2)} and E_p = ${valueWithUnit(entry.ep, "J", 2)}, what is E_k?`,
        numericAnswers(entry.ek, "J", 2),
        "Kinetic energy is the remaining share: E_total - E_p.",
      ),
    ),
    ...[
      { m: 0.50, ek: 0.125, v: 0.71 },
      { m: 0.40, ek: 0.20, v: 1.0 },
      { m: 0.80, ek: 0.16, v: 0.63 },
      { m: 0.60, ek: 0.27, v: 0.95 },
      { m: 0.50, ek: 0.32, v: 1.13 },
      { m: 0.75, ek: 0.15, v: 0.63 },
    ].map((entry) =>
      mc(
        `A ${entry.m} kg oscillator has kinetic energy ${valueWithUnit(entry.ek, "J", 3)} at one position. What is its speed?`,
        [valueWithUnit(entry.v, "m/s", 2), valueWithUnit(entry.v / 2, "m/s", 2), valueWithUnit(entry.v * 2, "m/s", 2), valueWithUnit(entry.ek, "m/s", 2)],
        0,
        "Use E_k = 1/2 m v^2.",
        hint,
      ),
    ),
    ...[
      { a: 0.20, k: 20, m: 0.50, vmax: 1.26 },
      { a: 0.12, k: 50, m: 0.80, vmax: 0.95 },
      { a: 0.10, k: 32, m: 0.40, vmax: 0.89 },
      { a: 0.15, k: 18, m: 0.60, vmax: 0.82 },
      { a: 0.08, k: 25, m: 0.50, vmax: 0.57 },
      { a: 0.18, k: 30, m: 0.75, vmax: 1.14 },
    ].map((entry) =>
      mc(
        `A spring oscillator has amplitude ${valueWithUnit(entry.a, "m", 2)}, k = ${entry.k} N/m, and m = ${entry.m} kg. What is its maximum speed?`,
        [valueWithUnit(entry.vmax, "m/s", 2), valueWithUnit(entry.vmax / 2, "m/s", 2), valueWithUnit(entry.vmax * 2, "m/s", 2), valueWithUnit(entry.a, "m/s", 2)],
        0,
        "Maximum speed occurs when all the total energy is kinetic at equilibrium.",
        hint,
      ),
    ),
    mc("Why should the total energy usually be found before the position-specific energies?", ["the amplitude fixes the conserved energy budget for the whole oscillator", "speed is always known first", "potential energy is independent of displacement", "the total energy changes with time"], 0, "The total budget is the anchor for the ledger.", hint),
    mc("Which statement best protects the A5_L4 lesson meaning?", ["The oscillator swaps E_p and E_k while keeping E_total constant in the ideal model.", "At equilibrium the oscillator has no energy left.", "Potential and kinetic energy always peak together.", "Amplitude affects speed but not energy."], 0, "That statement keeps the ledger correct.", hint),
    mc("Why is the sign of displacement irrelevant in E_p = 1/2 k x^2?", ["the displacement is squared", "potential energy depends on velocity only", "the spring constant changes sign", "energy in SHM is negative on the left"], 0, "The square removes the sign.", hint),
    mc("Why is it wrong to talk about energy being 'used up' at equilibrium in ideal SHM?", ["the total remains present there as kinetic energy", "equilibrium is outside the oscillation", "spring potential energy must be negative there", "the oscillator stops at equilibrium"], 0, "The form changes, not the total size.", hint),
    mc("What main mistake does A5_L4 prevent?", ["dropping the total-energy ledger and guessing from one energy form alone", "thinking springs can store energy", "confusing mass and spring constant units", "treating equilibrium as a turning point"], 0, "The lesson keeps the bookkeeping explicit.", hint),
    shortCases([
      { prompt: "At equilibrium in the spring model, the total energy is all ...", acceptedAnswers: ["kinetic"], hint: "That is the fastest point." },
      { prompt: "At the turning points in the spring model, the total energy is all ...", acceptedAnswers: ["potential", "elastic potential"], hint: "Speed is zero there." },
      { prompt: "The total SHM energy of a spring oscillator is set by the ...", acceptedAnswers: ["amplitude"], hint: "Use the turning-point displacement." },
      { prompt: "After finding E_p, the remaining energy share is ...", acceptedAnswers: ["kinetic", "kinetic energy"], hint: "Subtract from the total." },
      { prompt: "Ideal SHM assumes negligible ... so the total does not drain away.", acceptedAnswers: ["damping", "energy loss"], hint: "That is the idealization." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Compare natural frequency with driving frequency before judging the response.";
  return [
    mc("What is a forced oscillation?", ["an oscillation maintained by an external periodic driver", "an oscillation that never loses energy", "an oscillation with zero amplitude", "an oscillation with no natural frequency"], 0, "Forced oscillations are maintained by an external driving force.", hint),
    mc("What is the natural frequency of a system?", ["the frequency at which it oscillates most readily on its own", "the largest possible driving frequency", "the frequency of any external force", "the reciprocal of amplitude"], 0, "Natural frequency belongs to the system itself.", hint),
    mc("What is resonance?", ["the large response when driving frequency is close to natural frequency", "the complete absence of motion", "the point where damping is maximum", "the same as any oscillation"], 0, "Resonance is the strong-response frequency-match condition.", hint),
    mc("What does increased damping do to the resonance peak?", ["it lowers the peak and broadens it", "it raises the peak and narrows it", "it leaves the peak unchanged", "it removes natural frequency"], 0, "Damping reduces the sharpness and height of the response peak.", hint),
    ...[
      { period: 0.50, frequency: 2.0 },
      { period: 0.40, frequency: 2.5 },
      { period: 0.25, frequency: 4.0 },
    ].map((entry) =>
      mc(
        `A system has natural period ${valueWithUnit(entry.period, "s", 2)}. What is its natural frequency?`,
        [valueWithUnit(entry.frequency, "Hz", 1), valueWithUnit(entry.period, "Hz", 2), valueWithUnit(entry.frequency / 2, "Hz", 1), valueWithUnit(entry.frequency * 2, "Hz", 1)],
        0,
        "Use f = 1/T.",
        hint,
      ),
    ),
    ...[
      { natural: 2.5, drivers: ["1.8 Hz", "2.4 Hz", "3.3 Hz", "4.0 Hz"], answer: 1 },
      { natural: 3.0, drivers: ["2.9 Hz", "1.5 Hz", "4.4 Hz", "0.8 Hz"], answer: 0 },
      { natural: 1.6, drivers: ["0.9 Hz", "1.5 Hz", "2.5 Hz", "3.0 Hz"], answer: 1 },
    ].map((entry) =>
      mc(
        `A system has natural frequency ${valueWithUnit(entry.natural, "Hz", 1)}. Which driver gives the largest steady-state response?`,
        entry.drivers,
        entry.answer,
        "The driver closest to the natural frequency gives the strongest resonance response.",
        hint,
      ),
    ),
    mc("A stronger resonance answer compares frequencies rather than choosing the...", ["largest number", "smallest number", "zero frequency", "unit symbol"], 0, "Resonance depends on closeness of match, not the largest absolute number.", hint),
    mc("If the driving frequency is far from the natural frequency, the steady-state amplitude is usually...", ["smaller", "maximum", "independent of damping", "undefined"], 0, "Poor frequency match gives a weaker response.", hint),
    mc("Why is damping still important even after the natural frequency is known?", ["it changes how tall and how sharp the resonance peak becomes", "it changes the definition of frequency", "it removes the need to compare the frequencies", "it makes every driver equally effective"], 0, "Response strength also depends on damping.", hint),
    shortCases([
      { prompt: "The frequency that belongs to the system itself is the ... frequency.", acceptedAnswers: ["natural"], hint: "It is not imposed from outside." },
      { prompt: "The frequency that belongs to the external source is the ... frequency.", acceptedAnswers: ["driving"], hint: "It comes from the driver." },
      { prompt: "Resonance is strongest near frequency ...", acceptedAnswers: ["match", "matching"], hint: "The two frequencies should be close." },
      { prompt: "Increasing damping lowers the resonance ...", acceptedAnswers: ["peak", "amplitude"], hint: "The response is less sharp and less tall." },
      { prompt: "If period is known, frequency is found using one over ...", acceptedAnswers: ["period", "t"], hint: "Use the reciprocal." },
      { prompt: "A strong A5_L5 answer compares natural frequency with ... frequency first.", acceptedAnswers: ["driving"], hint: "That is the external one." },
      { prompt: "Forced oscillations are maintained by an external ...", acceptedAnswers: ["driver", "driving force"], hint: "Name the outside cause." },
      { prompt: "Heavy damping makes the response peak more ...", acceptedAnswers: ["broad", "broader"], hint: "The match becomes less sharp." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep frequency match and damping shape in the explanation.";
  return [
    mc("Why is resonance not simply 'big amplitude'?", ["the big response appears for a specific driving-frequency match with the system's natural frequency", "big amplitude happens at every driving frequency", "resonance removes the natural frequency", "amplitude depends only on mass"], 0, "Resonance is a condition, not just a size label.", hint),
    mc("Why is the natural frequency not the same thing as the driving frequency?", ["one belongs to the system and the other belongs to the external source", "they are always equal by definition", "driving frequency replaces the system frequency", "natural frequency exists only when damping is zero"], 0, "The two frequencies come from different parts of the setup.", hint),
    mc("Why can heavy damping make resonance less dramatic even near frequency match?", ["damping removes energy from the response and spreads the peak", "damping increases the natural frequency to infinity", "damping forces the driver to stop", "damping makes all amplitudes equal"], 0, "Damping reshapes the response curve.", hint),
    mc("Why is the closest match usually the safest first test when several drivers are offered?", ["resonance depends on closeness to natural frequency, not on the largest available number", "the highest number always resonates best", "the smallest number always resonates best", "damping makes the comparison unnecessary"], 0, "Match matters more than raw size.", hint),
    mc("Why is period-frequency conversion still relevant in resonance questions?", ["the natural timing may be given as period while the driver is given as frequency", "period and frequency are unrelated", "resonance uses period only and never frequency", "frequency cannot be compared with period"], 0, "You often need to convert to compare like with like.", hint),
    mc("Which statement best protects the A5_L5 lesson meaning?", ["Compare f_drive with f_natural first, then use damping to explain how sharply the response peak appears.", "Choose the highest driver frequency and call it resonance.", "Damping matters only after the oscillation stops.", "Natural frequency belongs to the external source."], 0, "That sequence keeps the mechanism visible.", hint),
    mc("Why is it weak to say 'the suspension vibrates more because the road is rough' and stop there?", ["the explanation still needs the relationship between the road's driving frequency and the suspension's natural frequency", "rough roads remove frequency effects", "vibration size never depends on damping", "suspension systems have no natural frequency"], 0, "A5_L5 wants the frequency comparison, not just a vague cause.", hint),
    mc("Why does broadening the resonance peak matter physically?", ["it means a wider range of driving frequencies can produce a relatively strong response", "it means resonance disappears completely", "it proves the natural frequency changed sign", "it means the system has zero damping"], 0, "Peak width affects sensitivity to match quality.", hint),
    mc("Why can a lightly damped system be more at risk from resonance than a heavily damped one?", ["light damping allows a taller, sharper response peak near the natural frequency", "light damping removes the natural frequency", "heavy damping always increases amplitude", "light damping makes frequency comparisons unnecessary"], 0, "Lighter damping lets the resonance build more strongly.", hint),
    mc("What common mistake is A5_L5 preventing?", ["choosing the largest driver frequency instead of the closest natural-frequency match", "thinking damping only changes mass", "believing period and frequency cannot be converted", "treating forced oscillations as self-sustaining"], 0, "The lesson is defending the match condition.", hint),
    mc("Why is a response-curve viewpoint stronger than a slogan in resonance questions?", ["it makes peak height, peak position, and damping shape visible together", "it removes the need for the natural frequency", "it proves every driver works the same way", "it shows amplitude is unrelated to driving frequency"], 0, "The curve organizes the mechanism.", hint),
    mc("Why does an exact match not guarantee infinite amplitude in real systems?", ["real damping and energy losses limit the build-up", "natural frequency disappears at exact match", "the driver stops automatically", "the oscillator becomes non-periodic"], 0, "Real systems do not behave like undamped idealizations.", hint),
    shortCases([
      { prompt: "Resonance is strongest near frequency ...", acceptedAnswers: ["match", "matching"], hint: "Compare driver with the system." },
      { prompt: "The system's own preferred timing is its ... frequency.", acceptedAnswers: ["natural"], hint: "It belongs to the oscillator." },
      { prompt: "The external source sets the ... frequency.", acceptedAnswers: ["driving"], hint: "That is the outside one." },
      { prompt: "Heavier damping makes the resonance peak less ...", acceptedAnswers: ["sharp", "tall"], hint: "It broadens and lowers the peak." },
      { prompt: "If natural timing is given as period, convert it to ... before comparing with a driver in hertz.", acceptedAnswers: ["frequency"], hint: "Compare like with like." },
      { prompt: "A strong A5_L5 answer compares the frequencies before it judges the response ...", acceptedAnswers: ["amplitude", "size"], hint: "Match first, size second." },
      { prompt: "Forced oscillations are kept going by an external ...", acceptedAnswers: ["driver", "driving force"], hint: "Name the outside influence." },
      { prompt: "Real damping limits resonance ...", acceptedAnswers: ["build-up", "amplitude"], hint: "The peak cannot grow without bound." },
    ]),
  ];
}

function l5MasteryRaw(): RawCollectionItem[] {
  return [...l5DiagnosticRaw(), ...l5ConceptRaw()];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Compare energy loss with settling style before deciding which response is best.";
  return [
    mc("What does damping do to an oscillator?", ["it removes energy from the motion", "it fixes the amplitude permanently", "it makes the frequency zero", "it changes displacement into force"], 0, "Damping drains energy from the system.", hint),
    mc("Which response is underdamped?", ["it still oscillates while the amplitude gradually decreases", "it returns to equilibrium with no overshoot in the shortest time", "it returns to equilibrium very slowly without oscillating", "it stays at maximum amplitude"], 0, "Underdamped motion still crosses the center repeatedly.", hint),
    mc("Which response is critically damped?", ["it returns to equilibrium fastest without oscillating", "it oscillates forever with constant amplitude", "it overshoots repeatedly", "it returns slower than every overdamped system"], 0, "Critical damping is the fastest no-overshoot return.", hint),
    mc("Which response is overdamped?", ["it returns without oscillating but more slowly than the critically damped case", "it oscillates with constant amplitude", "it crosses equilibrium many times", "it has zero restoring force"], 0, "Overdamping removes overshoot but slows the return.", hint),
    mc("If damping is increased in a real oscillator, what usually happens to the amplitude with time?", ["it falls more quickly", "it rises more quickly", "it stays fixed", "it changes sign only"], 0, "Heavier damping makes the energy drain faster.", hint),
    mc("Which system is usually designed to be close to critical damping?", ["a door closer that should shut quickly without bouncing", "a tuning fork that should ring for a long time", "a playground swing that should keep moving", "a resonance demonstration intended to show a tall peak"], 0, "Door closers should settle quickly without oscillating.", hint),
    mc("Which system is often intentionally underdamped?", ["a tuning fork that should keep oscillating audibly for a while", "a measuring pointer that must settle immediately", "an automatic door closer", "a platform that must avoid overshoot at all costs"], 0, "Some systems are designed to keep oscillating for a while.", hint),
    mc("Why is 'more damping is always better' a weak answer?", ["the best damping level depends on whether the application needs quick settling, continued oscillation, or overshoot prevention", "more damping always gives the fastest response", "more damping always increases resonance", "damping only matters in ideal systems"], 0, "Application goals decide what counts as best.", hint),
    ...[
      { a0: 8.0, a1: 6.0 },
      { a0: 10.0, a1: 7.0 },
      { a0: 5.0, a1: 3.5 },
    ].map((entry) =>
      mc(
        `A damped oscillator's amplitude falls from ${valueWithUnit(entry.a0, "cm", 1)} to ${valueWithUnit(entry.a1, "cm", 1)} after a short time. Which statement is safest?`,
        ["the system has lost energy while still oscillating", "the restoring force has vanished completely", "the natural frequency must now be zero", "the oscillator is overdamped by definition"],
        0,
        "A smaller amplitude shows energy loss; it does not by itself prove the damping class.",
        hint,
      ),
    ),
    ...[
      { app: "car suspension after a bump", answer: 1, choices: ["underdamped with many bounces", "close to critically damped", "completely undamped", "resonant at all road frequencies"] },
      { app: "analogue meter pointer", answer: 1, choices: ["lightly underdamped for long ringing", "critically damped or slightly overdamped", "undamped", "forced at resonance"] },
      { app: "decorative pendulum clock", answer: 0, choices: ["lightly damped so the motion continues", "heavily overdamped", "critically damped and non-oscillatory", "not oscillatory at all"] },
    ].map((entry) =>
      mc(
        `Which damping choice best suits ${entry.app}?`,
        entry.choices,
        entry.answer,
        "Choose the damping class that matches the job's settling or persistence goal.",
        hint,
      ),
    ),
    mc("What does an exponential-looking amplitude envelope in underdamped motion suggest?", ["the amplitude is shrinking by energy loss over time", "the oscillator has no restoring force", "the frequency is increasing without limit", "equilibrium is moving"], 0, "The envelope shows gradual damping of the oscillation.", hint),
    shortCases([
      { prompt: "Damping removes ... from the oscillator.", acceptedAnswers: ["energy"], hint: "That is what fades the motion." },
      { prompt: "The damping class that returns fastest without overshoot is ... damped.", acceptedAnswers: ["critically", "critical", "critically damped"], hint: "It is the fastest no-oscillation return." },
      { prompt: "A system that still oscillates while fading is ... damped.", acceptedAnswers: ["under", "underdamped", "under damped"], hint: "It still crosses the center repeatedly." },
      { prompt: "A system that returns too slowly without oscillating is ... damped.", acceptedAnswers: ["over", "overdamped", "over damped"], hint: "It settles without overshoot but too slowly." },
      { prompt: "A strong A5_L6 answer chooses damping by application ...", acceptedAnswers: ["goal", "need", "purpose"], hint: "It is not just 'more is better'." },
      { prompt: "Car suspension is usually designed to be near ... damping.", acceptedAnswers: ["critical", "critically damped", "critically"], hint: "It should settle quickly after a bump." },
      { prompt: "A long-ringing oscillator is usually only lightly ...", acceptedAnswers: ["damped"], hint: "It should keep oscillating for longer." },
      { prompt: "The shrinking outer trace of a damped oscillation is its amplitude ...", acceptedAnswers: ["envelope"], hint: "That outer curve shows the decay." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep energy loss, settling style, and application fit on the same board.";
  return [
    mc("Why is damping not just 'friction' in a vague sense?", ["the lesson uses it as an energy-loss setting that changes how the response settles", "damping only changes mass", "damping replaces restoring force", "damping matters only at resonance"], 0, "A5_L6 needs the response-style consequence, not a loose label.", hint),
    mc("Why is critically damped response often treated as a design target?", ["it returns to equilibrium as quickly as possible without overshoot", "it preserves oscillations for the longest time", "it produces the tallest resonance peak", "it eliminates the natural frequency"], 0, "It combines speed with no bounce.", hint),
    mc("Why is overdamped not automatically better than critically damped?", ["it avoids overshoot but can return more slowly than needed", "it always returns faster", "it increases oscillation amplitude", "it removes energy without affecting timing"], 0, "Too much damping can make the response sluggish.", hint),
    mc("Why is underdamped not automatically wrong?", ["some applications need oscillation to continue for a while, so fading oscillation can be useful", "underdamped systems have no energy loss", "underdamped systems never cross equilibrium", "underdamped means the restoring force has failed"], 0, "The best damping depends on the job.", hint),
    mc("Why is application choice central in A5_L6?", ["different jobs value fast settling, no overshoot, or continued oscillation differently", "all oscillators should be critically damped", "damping affects diagrams only", "once damping exists the application no longer matters"], 0, "The lesson is about choosing the right response style.", hint),
    mc("Which statement best protects the A5_L6 lesson meaning?", ["Compare underdamped, critical, and overdamped returns, then choose the one that suits the job.", "Heavier damping is always best because it removes motion fastest.", "If a system still oscillates, the design has failed.", "Critical damping means the oscillator has zero restoring force."], 0, "That keeps the design tradeoff visible.", hint),
    mc("Why is it weak to describe two traces as 'fast' and 'slow' without saying whether they overshoot?", ["settling quality depends on both return speed and whether oscillation continues", "overshoot never matters in damping questions", "fast traces are always overdamped", "slow traces are always critically damped"], 0, "A5_L6 needs the response class, not a vague adjective.", hint),
    mc("Why does a shrinking amplitude envelope point to energy loss rather than a changing equilibrium position?", ["the oscillation remains centered while its size decays", "equilibrium must move whenever damping is present", "energy loss can only change period", "damping removes the need for a restoring force"], 0, "The center stays the same while the amplitude shrinks.", hint),
    mc("Why can a car suspension not be left very lightly damped?", ["it would continue bouncing after each disturbance instead of settling quickly", "it would stop oscillating immediately", "it would remove the spring force", "it would become critically damped automatically"], 0, "Persistent bounce is undesirable in suspension.", hint),
    mc("Why is a tuning fork not designed to be critically damped?", ["its purpose is to keep oscillating audibly rather than stop as fast as possible", "critical damping gives the loudest sound forever", "critical damping removes the natural frequency", "tuning forks are not oscillators"], 0, "That instrument is meant to keep vibrating for a while.", hint),
    mc("What common mistake is A5_L6 preventing?", ["treating damping as a one-direction 'more is better' slider instead of a design tradeoff", "thinking damping changes displacement into mass", "thinking energy loss always increases resonance", "thinking underdamped systems never lose energy"], 0, "The lesson protects the tradeoff reasoning.", hint),
    mc("Why should the worked example keep all three damping classes on one board?", ["the contrast makes the settling-style differences easier to judge and justify", "only one class can exist at a time", "the classes differ only in colour", "the board removes the need for application context"], 0, "Side-by-side contrast reveals the design choice.", hint),
    shortCases([
      { prompt: "Critical damping gives the fastest return with no ...", acceptedAnswers: ["overshoot", "oscillation", "bouncing"], hint: "Name the behavior it avoids." },
      { prompt: "Underdamped motion still ... while fading.", acceptedAnswers: ["oscillates", "vibrates"], hint: "It crosses the center repeatedly." },
      { prompt: "Overdamped motion returns without oscillating but more ...", acceptedAnswers: ["slowly", "slow"], hint: "That is the tradeoff." },
      { prompt: "Damping choice should match the application ...", acceptedAnswers: ["goal", "purpose", "need"], hint: "Design context matters." },
      { prompt: "A tuning fork is usually only lightly ...", acceptedAnswers: ["damped"], hint: "It should keep vibrating for a while." },
      { prompt: "A door closer is usually near ... damping.", acceptedAnswers: ["critical", "critically damped", "critically"], hint: "It should settle quickly without bounce." },
      { prompt: "The decaying outer trace of an underdamped oscillation is the amplitude ...", acceptedAnswers: ["envelope"], hint: "That curve shows the shrinkage." },
      { prompt: "A strong A5_L6 explanation keeps settling speed and overshoot ... together.", acceptedAnswers: ["together", "visible"], hint: "Do not reduce the comparison to one adjective." },
    ]),
  ];
}

function l6MasteryRaw(): RawCollectionItem[] {
  return [...l6DiagnosticRaw(), ...l6ConceptRaw()];
}

const A5_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A5_L1: l1DiagnosticRaw,
  A5_L2: l2DiagnosticRaw,
  A5_L3: l3DiagnosticRaw,
  A5_L4: l4DiagnosticRaw,
  A5_L5: l5DiagnosticRaw,
  A5_L6: l6DiagnosticRaw,
};

const A5_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  A5_L1: l1ConceptRaw,
  A5_L2: l2ConceptRaw,
  A5_L3: l3ConceptRaw,
  A5_L4: l4ConceptRaw,
  A5_L5: l5ConceptRaw,
  A5_L6: l6ConceptRaw,
};

const A5_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(A5_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A5_DIAGNOSTIC_BUILDERS[code](), ...A5_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function a5GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A5_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a5GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A5_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a5GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A5_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
