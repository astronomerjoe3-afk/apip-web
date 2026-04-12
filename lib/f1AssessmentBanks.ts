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
    throw new Error(`F1 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the quantity fixed and check whether the unit and scale make sense.";
  return [
    mc("Which measurement is complete?", ["18", "18 cm", "centimetre", "length"], 1, "A complete measurement needs both a number and a unit.", hint),
    mc("Which is the SI base unit for length?", ["metre", "centimetre", "millimetre", "kilometre"], 0, "The SI base unit for length is the metre.", hint),
    mc("Which is the SI base unit for mass?", ["gram", "kilogram", "milligram", "tonne"], 1, "The SI base unit for mass is the kilogram.", hint),
    mc("Which prefix means one-thousandth of the base unit?", ["kilo-", "centi-", "milli-", "mega-"], 2, "milli- means 1/1000 of the base unit.", hint),
    mc("Which conversion is correct?", ["0.45 m = 45 cm", "0.45 m = 4.5 cm", "0.45 m = 450 cm", "0.45 m = 0.045 cm"], 0, "One metre contains 100 centimetres, so 0.45 m is 45 cm.", hint),
    mc("Which conversion is correct?", ["7.2 km = 720 m", "7.2 km = 7200 m", "7.2 km = 72 m", "7.2 km = 0.72 m"], 1, "One kilometre is 1000 m, so 7.2 km is 7200 m.", hint),
    mc("Which unit is most sensible for the thickness of a coin?", ["km", "m", "cm", "mm"], 3, "A coin is very thin, so millimetres are the sensible scale.", hint),
    mc("Which unit is most sensible for the mass of an apple?", ["kg", "g", "mg", "tonne"], 1, "An apple mass is usually a few hundred grams, not kilograms or milligrams.", hint),
    mc("Which pair represents the same length?", ["3.5 cm and 0.35 m", "3.5 cm and 35 mm", "3.5 cm and 350 mm", "3.5 cm and 0.0035 m"], 1, "3.5 cm equals 35 mm.", hint),
    mc("If a length is rewritten from metres into centimetres, what happens to the number?", ["It usually becomes larger", "It usually becomes smaller", "It must stay unchanged", "It becomes negative"], 0, "Smaller unit chunks need a larger count for the same physical length.", hint),
    mc("Which quantity is measured in amperes?", ["length", "mass", "electric current", "time"], 2, "The ampere is the SI base unit for electric current.", hint),
    mc("Why is the result 'mass = 14' scientifically weak?", ["The number is too small", "The unit is missing", "The mass should be negative", "Mass cannot be measured"], 1, "Without a unit, the number does not fully describe the measurement.", hint),
    shortCases([
      { prompt: "Convert 250 cm to m.", acceptedAnswers: numericAnswers(2.5, "m", 1), hint: "Use 100 cm = 1 m." },
      { prompt: "Convert 3.2 kg to g.", acceptedAnswers: numericAnswers(3200, "g"), hint: "Use 1 kg = 1000 g." },
      { prompt: "Convert 850 mL to L.", acceptedAnswers: numericAnswers(0.85, "L", 2), hint: "Use 1000 mL = 1 L." },
      { prompt: "Convert 4.5 mm to m.", acceptedAnswers: numericAnswers(0.0045, "m", 4), hint: "Use 1000 mm = 1 m." },
      { prompt: "What is missing from the statement 'length = 12'?", acceptedAnswers: words("unit", "a unit", "the unit"), hint: "A scientific measurement needs a number and a unit." },
      { prompt: "Convert 0.8 km to m.", acceptedAnswers: numericAnswers(800, "m"), hint: "Use 1 km = 1000 m." },
      { prompt: "Convert 1.2 L to mL.", acceptedAnswers: numericAnswers(1200, "mL"), hint: "Use 1 L = 1000 mL." },
      { prompt: "Convert 60 s to min.", acceptedAnswers: numericAnswers(1, "min"), hint: "Use 60 s = 1 min." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Ask what is being measured and whether the chosen unit keeps the number readable.";
  return [
    mc("Why do scientists use agreed standard units?", ["To remove all uncertainty", "To make comparisons reliable between people and places", "To stop measurements needing numbers", "To avoid conversions completely"], 1, "Shared units make measurements comparable across labs and countries.", hint),
    mc("Why is a bare number such as '5' not a full measurement in physics?", ["Because it has no decimal point", "Because it does not state what quantity or unit is meant", "Because it is always too small", "Because numbers must always be whole"], 1, "The number alone does not tell the reader whether the 5 means metres, seconds, kilograms, or something else.", hint),
    mc("Which statement best explains why 0.50 kg and 500 g represent the same mass?", ["The units changed but the physical quantity did not", "The kilogram value is more accurate", "The gram value removes uncertainty", "Mass depends on the chosen prefix"], 0, "Changing the unit changes the written number, not the physical amount.", hint),
    mc("Why is millimetre better than metre for the thickness of a page?", ["It makes the page physically thicker", "It matches the small scale so the number stays readable", "It turns length into mass", "It removes the need for a number"], 1, "A sensible unit matches the scale of the object.", hint),
    mc("Why must units be matched before adding 0.40 m and 12 cm?", ["Because metres cannot be added to anything", "Because mixed units hide the true size of each part", "Because centimetres are not real units", "Because addition only works with kilograms"], 1, "You need both quantities expressed in compatible units before combining them reliably.", hint),
    mc("Which statement is safest about SI base units?", ["They are the agreed starting units from which smaller or larger prefixed units are built", "They are always the smallest possible units", "They only apply to length", "They replace all derived units"], 0, "The base unit is the common reference point.", hint),
    mc("A student records room temperature as 25 K in an ordinary classroom. What is the best criticism?", ["The number should have no unit", "The value and unit together are unrealistic for that situation", "Temperature must be measured in metres", "Kelvin can never be used in science"], 1, "The problem is not that kelvin is invalid, but that 25 K is not a realistic classroom temperature.", hint),
    mc("Which choice keeps the physical quantity fixed while only the unit changes?", ["0.8 m and 80 cm", "0.8 m and 80 kg", "0.8 m and 80 s", "0.8 m and 0.8 kg"], 0, "Equivalent length statements change the unit, not the quantity itself.", hint),
    mc("Why does the number usually grow when the unit gets smaller?", ["Because the object grows", "Because more small unit chunks are needed to cover the same quantity", "Because smaller units are less accurate", "Because the measurement becomes a vector"], 1, "The count changes because the chunk size changed.", hint),
    mc("Which is the most sensible way to report the width of a notebook?", ["0.00018 km", "18 cm", "1800 mm", "18 000 um"], 1, "All four can represent a width, but 18 cm is the most readable and sensible classroom-scale choice.", hint),
    mc("Why is 'convert by moving the decimal point' a weak rule on its own?", ["Because it can work only for time", "Because it hides the factor linking the old unit to the new unit", "Because decimals are banned in science", "Because prefixes never use powers of ten"], 1, "A strong conversion always keeps the unit-size factor visible.", hint),
    mc("Which statement best protects good unit choice?", ["Choose the largest unit possible", "Choose the unit that makes the number closest to one hundred", "Choose a unit that matches the object scale and keeps the measurement easy to read", "Always rewrite every answer in millimetres"], 2, "Sensible reporting balances meaning and readability.", hint),
    mc("Which comparison is meaningful without extra conversion?", ["35 cm compared with 0.35 m", "2 kg compared with 500 g", "1.5 m compared with 140 cm after rewriting one of them", "All of them are impossible"], 2, "The comparison becomes safe once one value is rewritten into the other's unit.", hint),
    mc("Why is 1.2 L often better than 1200 mL for a large water bottle label?", ["Because litres are more scientific than millilitres", "Because the bottle changes size in litres", "Because the larger unit keeps the number readable for that scale", "Because millilitres cannot measure volume"], 2, "Sensible units keep the quantity readable at the scale of the object.", hint),
    mc("Which statement best links quantity and unit correctly?", ["The quantity tells what is measured; the unit tells the agreed size used to measure it.", "The quantity and the unit are the same thing.", "The unit tells direction while the quantity tells size.", "The quantity is optional if the unit is written."], 0, "Quantity and unit do different jobs in one complete measurement.", hint),
    mc("A student writes 0.004 km for the width of a classroom. What is the best improvement?", ["Rewrite it in metres so the number matches the room scale better", "Rewrite it with no unit", "Make the number larger without changing the unit", "Convert it to kilograms"], 0, "The value is equivalent, but metres communicate the classroom scale more clearly.", hint),
    mc("Why is 1000 mm not a better answer than 1.0 m for the height of a child?", ["Because more digits always mean less precision", "Because the smaller unit makes the number unnecessarily large for that scale", "Because millimetres cannot measure height", "Because people have no height in SI"], 1, "The issue is readability and scale, not mathematical validity.", hint),
    mc("Which lesson idea should stay visible during unit conversions?", ["The object changes size during conversion", "The quantity stays fixed while the unit size changes", "The number stays fixed while the unit changes", "Every conversion needs the same prefix"], 1, "That is the central measurement idea for this lesson.", hint),
    mc("Why is it safe to compare 2.50 kg with 2.5 kg directly?", ["Because they already use the same unit", "Because trailing zeros change the mass", "Because kilograms ignore precision", "Because comparison never depends on units"], 0, "The unit match makes the comparison direct; the extra zero affects reported precision, not the physical mass.", hint),
    mc("Which statement best matches strong F1_L1 reasoning?", ["Unit choice is part of scientific meaning, not decoration after the number.", "The number matters but the unit does not.", "Prefixes create new physical quantities.", "Conversions work only for length."], 0, "The unit is part of the measurement itself.", hint),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Decide whether direction matters and keep route length separate from start-to-finish change.";
  return [
    mc("Which quantity is a vector?", ["mass", "time", "displacement", "temperature"], 2, "Displacement needs both magnitude and direction.", hint),
    mc("Which quantity is a scalar?", ["velocity", "force", "distance", "acceleration"], 2, "Distance needs magnitude only.", hint),
    mc("Which description is definitely a vector?", ["8 m", "8 m east", "8 s", "8 kg"], 1, "A vector description includes direction.", hint),
    mc("What extra information turns speed into velocity?", ["mass", "time", "direction", "charge"], 2, "Velocity is speed with direction.", hint),
    mc("Which pair contains only vectors?", ["distance and mass", "velocity and force", "time and temperature", "speed and distance"], 1, "Both velocity and force require direction.", hint),
    mc("Which pair contains only scalars?", ["speed and mass", "displacement and velocity", "force and acceleration", "velocity and weight"], 0, "Scalars need magnitude only.", hint),
    mc("A cyclist rides 6 km east and then 6 km west. Which quantity is zero at the end?", ["distance", "speed", "displacement", "time"], 2, "The cyclist returns to the starting point, so the net change is zero.", hint),
    mc("A ball moves at constant speed around a circular track. Which quantity must keep changing?", ["mass", "velocity", "distance", "time"], 1, "The direction changes continuously, so the velocity changes.", hint),
    mc("Two vectors can have the same magnitude but still be different because they can have different...", ["units", "directions", "names", "decimal places"], 1, "Direction is part of a vector's identity.", hint),
    mc("Which statement best compares distance and displacement?", ["Both always use direction", "Distance follows the route while displacement is the directed start-to-finish change", "Displacement ignores direction", "Distance is always smaller"], 1, "Distance is scalar route length; displacement is vector change in position.", hint),
    mc("If a runner goes 10 m north and then 4 m south, what is the displacement?", ["14 m", "6 m north", "6 m south", "0 m"], 1, "The runner finishes 6 m north of the start.", hint),
    mc("If a runner goes 10 m north and then 4 m south, what is the total distance?", ["6 m", "10 m", "14 m", "0 m"], 2, "Distance adds the whole route.", hint),
    shortCases([
      { prompt: "A quantity with magnitude only is called a ...", acceptedAnswers: words("scalar", "a scalar"), hint: "This is the no-direction class." },
      { prompt: "A quantity with magnitude and direction is called a ...", acceptedAnswers: words("vector", "a vector"), hint: "This class needs direction." },
      { prompt: "A walker goes 12 m east and then 5 m east. What is the distance?", acceptedAnswers: numericAnswers(17, "m"), hint: "Distance adds the whole route." },
      { prompt: "A walker goes 12 m east and then 5 m east. What is the displacement?", acceptedAnswers: words("17 m east", "17 east", "17m east"), hint: "The finish is 17 m east of the start." },
      { prompt: "A walker goes 12 m east and then 5 m west. What is the displacement?", acceptedAnswers: words("7 m east", "7 east", "7m east"), hint: "Keep the net start-to-finish change with direction." },
      { prompt: "A round trip that ends where it started has displacement ...", acceptedAnswers: words("0", "0 m", "zero", "zero metres", "zero meters"), hint: "The start-to-finish change is zero." },
      { prompt: "What missing feature turns 20 m/s into velocity?", acceptedAnswers: words("direction", "a direction", "the direction"), hint: "Velocity needs magnitude and direction." },
      { prompt: "If speed stays the same but direction changes, the quantity that changes is ...", acceptedAnswers: words("velocity", "the velocity"), hint: "Velocity includes direction; speed does not." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Ask whether the question is about amount only, or amount plus direction.";
  return [
    mc("Why is '5 m east' stronger information than '5 m'?", ["It adds direction, so it can act as a vector description", "It removes the need for units", "It guarantees the motion is faster", "It changes the magnitude"], 0, "Direction adds a second layer of meaning.", hint),
    mc("Why are distance and displacement not interchangeable on a return journey?", ["Distance follows the whole route, while displacement depends only on the start and finish positions", "Distance always needs direction, while displacement does not", "Displacement is always larger", "Distance is only used outdoors"], 0, "One tracks route length; the other tracks net change.", hint),
    mc("Why can two students travel the same distance but have different displacement?", ["Because displacement depends on the finishing position as well as the starting position", "Because distance includes direction but displacement does not", "Because displacement ignores the path completely and can never differ", "Because only one student has speed"], 0, "Different end positions can give different net changes even with the same route length.", hint),
    mc("Which statement best protects vector meaning?", ["Direction is optional if the magnitude is large enough", "Vectors combine magnitude with direction, so direction cannot be dropped without changing the quantity", "Vectors and scalars differ only in unit", "All moving quantities are vectors"], 1, "The direction part is essential, not decorative.", hint),
    mc("Why does turning at constant speed still change velocity?", ["Because velocity includes direction, and the direction changed", "Because speed and velocity are identical", "Because mass changes on a bend", "Because time has a vector direction"], 0, "Turning changes a vector even if the scalar speed is fixed.", hint),
    mc("Which statement best compares speed and velocity?", ["Speed is route length while velocity is time", "Speed is scalar; velocity is the vector version that also needs direction", "Velocity is always larger than speed", "Speed only exists in a straight line"], 1, "Velocity is not a new unit; it is a direction-aware quantity.", hint),
    mc("Why can opposite vectors cancel even when each one is large?", ["Because their directions are opposite, so the net change can become zero", "Because vectors ignore magnitude", "Because opposite units cancel automatically", "Because all vectors are negative"], 0, "Direction controls the sign or sense of a vector combination.", hint),
    mc("What is the strongest reason to draw displacement as an arrow?", ["An arrow makes both size and direction visible together", "An arrow removes the need for numbers", "An arrow makes the route longer", "An arrow is only decoration"], 0, "The arrow picture matches the structure of a vector.", hint),
    mc("Which question is scalar rather than vector?", ["How far did the runner travel?", "Which way did the runner end up from the start?", "What was the force direction?", "What was the displacement?"], 0, "Distance asks about amount only.", hint),
    mc("Which question is vector rather than scalar?", ["How much mass is there?", "How long did it take?", "Where is the object relative to the start?", "How hot is the liquid?"], 2, "Relative position from a starting point needs direction.", hint),
    mc("Why is 'the distance is 0 m east' a weak statement?", ["Because distance is scalar and should not carry a direction label", "Because east is not a real direction", "Because zero cannot be measured", "Because all zero values are vectors"], 0, "Distance does not use direction.", hint),
    mc("Why is 'the displacement is 12 m' an incomplete statement in many contexts?", ["Because displacement is a vector and usually needs a direction", "Because 12 is not enough significant figures", "Because metres can only be used for scalars", "Because displacement must always be zero"], 0, "A vector result is usually incomplete without direction.", hint),
    mc("A car travels around a rectangular block and stops at the starting point. Which statement is strongest?", ["Distance and displacement are both zero", "Distance is non-zero but displacement is zero", "Distance is zero but displacement is non-zero", "Both are vectors"], 1, "The route length is real even when the net change is zero.", hint),
    mc("Why is mass not a vector?", ["Because it has magnitude only and no associated direction", "Because it is always small", "Because it uses kilograms", "Because it cannot be measured"], 0, "Mass does not point anywhere.", hint),
    mc("Why is force treated as a vector in physics?", ["Because a push or pull must act in a particular direction", "Because it is always measured in newtons", "Because it is always caused by motion", "Because its magnitude is unknown"], 0, "Forces are directional interactions.", hint),
    mc("Which lesson idea should stay visible when comparing route length with start-to-finish change?", ["Speed and mass are both vectors", "Distance follows the path, but displacement keeps the net change with direction", "All journeys have zero displacement", "Displacement is always longer"], 1, "This is the central contrast of the lesson.", hint),
    mc("Why is a vector unchanged only when both magnitude and direction stay the same?", ["Because changing either part changes the vector itself", "Because vectors ignore size", "Because directions can be renamed without effect", "Because only magnitude matters"], 0, "A vector has two defining parts.", hint),
    mc("Which statement best fits a journey with large distance but small displacement?", ["The path doubled back so the route was long while the finish stayed near the start", "The object did not move", "The speed was zero all the time", "The distance must equal the displacement"], 0, "Doubling back grows distance without necessarily moving far from the start.", hint),
    mc("Why should distance and displacement be answered separately in a worked example?", ["Because one is scalar and one is vector, so they answer different questions", "Because one uses metres and one uses seconds", "Because only one can be measured", "Because both are always numerically equal"], 0, "They are not two names for the same quantity.", hint),
    mc("Which statement best matches strong F1_L2 reasoning?", ["Direction is part of the quantity whenever the lesson is about vectors.", "Magnitude alone is enough for every motion quantity.", "Distance and displacement differ only in unit.", "Velocity is just another word for speed."], 0, "The lesson stands or falls on keeping direction visible when needed.", hint),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Match the tool to the scale, then report only the detail the instrument supports.";
  return [
    mc("Which instrument is most suitable for measuring the diameter of a thin wire?", ["metre rule", "measuring tape", "vernier caliper", "micrometer screw gauge"], 3, "A micrometer screw gauge is designed for very small thicknesses.", hint),
    mc("Which instrument is most suitable for measuring the internal diameter of a tube?", ["vernier caliper", "balance", "thermometer", "newton meter"], 0, "A vernier caliper is suitable for small diameters.", hint),
    mc("A ruler has 1 mm divisions. What reading uncertainty is usually reasonable?", ["+/- 1 mm", "+/- 0.5 mm", "+/- 0.1 mm", "+/- 2 mm"], 1, "Half the smallest division is a common estimate.", hint),
    mc("What does resolution describe?", ["The color of the instrument", "The smallest change the instrument can show", "The exact true value", "The number of repeated readings"], 1, "Resolution is about the instrument's smallest visible change.", hint),
    mc("Repeated readings are 12.3 cm, 12.3 cm, 12.4 cm, and 12.3 cm. What does the tight grouping suggest?", ["low precision", "greater precision", "systematic error only", "the instrument has no unit"], 1, "Close agreement among repeats suggests good precision.", hint),
    mc("A balance reads 0.2 g when empty. This is best described as...", ["random error", "systematic error", "no error", "significant figures"], 1, "A constant offset is systematic error.", hint),
    mc("Which action best reduces random error when timing repeated events?", ["Take several readings and average them", "Write more digits on one reading", "Ignore all unusual readings immediately", "Change the unit to minutes"], 0, "Averaging repeated readings reduces the effect of random scatter.", hint),
    mc("Why is a caliper often better than a rough ruler for a small cylinder diameter?", ["It has finer divisions and usually smaller uncertainty", "It always removes all error", "It uses larger units", "It measures mass at the same time"], 0, "Finer scale divisions support a smaller uncertainty.", hint),
    mc("Which statement best describes zero error?", ["The readings scatter above and below the best value", "The instrument has a built-in offset before measurement starts", "The unit label is missing", "The scale has many divisions"], 1, "Zero error is a starting offset, not random spread.", hint),
    mc("Which tool is usually most suitable for timing a pendulum swing?", ["stopwatch", "micrometer screw gauge", "measuring cylinder", "ammeter"], 0, "A stopwatch is the appropriate time-measuring tool.", hint),
    mc("Why is '6.3721 cm' a weak report from a ruler with 1 mm divisions?", ["The reading claims more precision than the ruler supports", "The value is too large", "Centimetres cannot be used on rulers", "The report should have no unit"], 0, "A report should not pretend to be more exact than the instrument allows.", hint),
    mc("Which reading pattern is strongest evidence for random error?", ["All readings shifted high by 0.2 g", "Readings scattered around a central value", "The instrument has no zero mark", "One unit written wrongly"], 1, "Random error shows up as scatter.", hint),
    shortCases([
      { prompt: "A scale has 0.2 cm divisions. What uncertainty is usually reasonable?", acceptedAnswers: words("0.1 cm", "+/- 0.1 cm"), hint: "Use about half the smallest division." },
      { prompt: "Name the error type when every reading is shifted upward by the same amount.", acceptedAnswers: words("systematic error", "systematic"), hint: "A repeated one-way offset is the clue." },
      { prompt: "Name the error type when repeated readings scatter unpredictably around a value.", acceptedAnswers: words("random error", "random"), hint: "Scatter from trial to trial is the clue." },
      { prompt: "Repeated readings are 6.2 cm, 6.3 cm, and 6.3 cm. Give a sensible best estimate.", acceptedAnswers: words("6.3 cm", "6.3"), hint: "Use the clustered central value." },
      { prompt: "A micrometer has 0.02 mm divisions. What uncertainty is usually reasonable?", acceptedAnswers: words("0.01 mm", "+/- 0.01 mm"), hint: "Use half the smallest division." },
      { prompt: "Which instrument is usually best for a very small thickness: ruler, caliper, or micrometer screw gauge?", acceptedAnswers: words("micrometer", "micrometer screw gauge", "a micrometer screw gauge"), hint: "Choose the tool designed for the finest thickness readings." },
      { prompt: "What should you check before measuring if you want to catch zero error?", acceptedAnswers: words("the zero reading", "zero reading", "calibration", "the calibration"), hint: "Look for the starting offset before the real measurement begins." },
      { prompt: "State one way repeated readings improve trust.", acceptedAnswers: words("average random error", "reduce random error", "spot anomalies", "spot anomalous readings", "estimate uncertainty", "check consistency"), hint: "Think about scatter, averaging, and spotting odd readings." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "A trustworthy reading joins tool choice, resolution, repeats, and error checking.";
  return [
    mc("Why is it weak to choose an instrument only because it is familiar?", ["Suitability depends on the size of the object and the resolution needed", "All instruments have identical uncertainty", "Familiar tools remove random error", "Only digital tools can be trusted"], 0, "Tool choice should be matched to the measurement job.", hint),
    mc("Why does a finer scale usually support a smaller uncertainty?", ["Because it shows smaller changes more clearly", "Because it always gives the true value", "Because it changes the unit automatically", "Because it removes the need for repeats"], 0, "Finer resolution makes smaller differences readable.", hint),
    mc("Why can averaging repeated readings reduce random error but not fix zero error?", ["Random scatter cancels somewhat when averaged, but a constant offset remains", "Averages change the unit", "Zero error disappears when you repeat a measurement", "Random error and zero error are the same thing"], 0, "A constant bias survives averaging.", hint),
    mc("Why is a calibration check important before collecting data?", ["It can reveal a built-in offset or poor adjustment before the results are trusted", "It guarantees there will be no uncertainty", "It makes repeated readings unnecessary", "It changes a scalar into a vector"], 0, "Calibration is the first defence against systematic error.", hint),
    mc("Which statement best protects the idea of measurement resolution?", ["Resolution tells the smallest change the instrument can show, so it limits the precision you may claim", "Resolution is the same as the true value", "Resolution measures how accurate the theory is", "Resolution is just the unit name"], 0, "Resolution constrains the level of detail in the report.", hint),
    mc("Why is a single isolated reading weaker than a set of repeated readings?", ["One reading hides the spread, so it gives little evidence about random variation", "One reading always has the wrong unit", "One reading cannot have uncertainty", "Repeated readings change the object"], 0, "Spread becomes visible only when there is more than one reading.", hint),
    mc("Why is it poor practice to invent extra digits beyond the instrument's scale?", ["It creates false precision that the instrument did not measure", "It improves accuracy automatically", "It changes the quantity being measured", "It makes conversion impossible"], 0, "Extra digits can overstate what the tool actually resolved.", hint),
    mc("Which statement best separates random and systematic error?", ["Random error scatters readings; systematic error shifts them together", "Random error changes the unit; systematic error changes the quantity", "Systematic error always makes precision low", "Random error can be removed by changing the color of the scale"], 0, "The two errors show different patterns in the data.", hint),
    mc("Why might a micrometer screw gauge be preferred over a ruler for wire thickness even if both are read carefully?", ["The micrometer is built for much smaller dimensions and usually has finer resolution", "The ruler always overestimates thickness", "The micrometer removes the need for units", "The ruler can only measure time"], 0, "Careful reading cannot overcome a tool whose scale is too coarse.", hint),
    mc("What is the strongest reason to report uncertainty with a measurement?", ["It tells the reader how tightly the result is known rather than pretending it is exact", "It avoids the need for units", "It proves the answer is correct", "It removes random error"], 0, "Uncertainty makes the report honest about its limits.", hint),
    mc("Which situation shows a trustworthy method improving?", ["The same object is measured with a better-suited tool and repeated carefully", "The unit is removed from the answer", "The reading is rounded before it is taken", "The value is copied without checking the zero mark"], 0, "Better tool choice plus repeated careful readings strengthens trust.", hint),
    mc("Why is a zeroed instrument important when the measurement itself is small?", ["A constant offset can be a large fraction of a small reading", "Small readings have no unit", "Large readings are the only ones affected by zero error", "Small readings cannot be repeated"], 0, "Relative error matters especially when the quantity is small.", hint),
    mc("Which action best turns an unexplained scatter pattern into useful evidence?", ["Record several repeats and compare their spread", "Discard all but the highest reading", "Convert the readings into a different unit", "Write every value to more decimal places"], 0, "The spread is informative when you examine repeated data directly.", hint),
    mc("Why should the chosen instrument be named or obvious in a full method?", ["Because the instrument controls the scale division and therefore the likely uncertainty", "Because instrument names replace units", "Because methods do not need quantities", "Because the instrument decides whether the quantity is scalar"], 0, "Method quality depends partly on what tool was actually used.", hint),
    mc("Which statement best fits good measurement practice?", ["Choose the right tool, read to the justified detail, repeat, and check for bias", "Use the nearest instrument and trust one reading", "Report as many digits as possible", "Ignore the zero mark if the values look tidy"], 0, "This sequence captures the lesson's full logic.", hint),
    mc("Why is a coarse metre rule a poor choice for the thickness of a sheet of paper?", ["The relevant detail is smaller than the ruler can resolve well", "Paper thickness is not a length", "Metre rules only measure speed", "Paper must be measured in kilograms"], 0, "The tool is too coarse for the scale of the object.", hint),
    mc("What is the safest interpretation of tightly grouped readings far from the accepted value?", ["They are precise but likely affected by systematic error", "They are automatically accurate", "They have no uncertainty", "They show no measurement issue"], 0, "Tight grouping alone does not guarantee accuracy.", hint),
    mc("Why is 'repeat and average' not a complete measurement strategy on its own?", ["Because you must still use a suitable instrument and check for systematic bias", "Because averaging always worsens accuracy", "Because repeats remove the need for resolution", "Because averages cannot be calculated for measurements"], 0, "Good measurement needs tool choice and bias checks as well as repeats.", hint),
    mc("Which lesson idea should stay visible in F1_L3?", ["Measurement trust comes from method, not just from the final number", "Every measurement should be exact", "All instruments have the same uncertainty", "Only random error matters"], 0, "The lesson is about method-driven trustworthiness.", hint),
    mc("Which statement best matches strong F1_L3 reasoning?", ["Resolution, repeats, and bias checks should all be visible before the result is trusted", "One reading is enough if the digits look neat", "Uncertainty is only needed when the answer is wrong", "Calibration matters only after the data are analyzed"], 0, "That brings the whole measurement-quality chain together.", hint),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep only the digits the measurement justifies, then apply the rule that matches the operation.";
  return [
    mc("How many significant figures are in 0.00450?", ["2", "3", "4", "5"], 1, "Leading zeros do not count, but the trailing zero after the decimal does count.", hint),
    mc("How many significant figures are in 2.050?", ["2", "3", "4", "5"], 2, "Zeros between or after significant digits can count.", hint),
    mc("Round 12.349 to 3 significant figures.", ["12.3", "12.4", "12.35", "12.34"], 0, "Keep 1, 2, and 3, then inspect the next digit 4.", hint),
    mc("Round 0.00678 to 2 significant figures.", ["0.0067", "0.0068", "0.0070", "0.067"], 1, "Keep 6 and 7, then round using the next digit 8.", hint),
    mc("Which zeros do not count as significant figures?", ["Zeros between non-zero digits", "Leading zeros before the first non-zero digit", "Trailing zeros after a decimal point", "All zeros always count"], 1, "Leading zeros only place the decimal point.", hint),
    mc("For multiplication or division, the final answer should usually keep...", ["the most significant figures from the inputs", "the least significant figures from the inputs", "all calculator digits", "no decimal places"], 1, "The least precise measurement controls the precision.", hint),
    mc("For addition or subtraction, the final answer should usually keep...", ["the least decimal places", "the least significant figures only", "the most decimal places", "all the digits shown"], 0, "Addition and subtraction are controlled by decimal places.", hint),
    mc("Calculate 12.34 + 1.2 with the correct final precision.", ["13.5", "13.54", "13.6", "13"], 0, "The raw sum is 13.54, then round to 1 decimal place.", hint),
    mc("Calculate 2.5 x 3.42 with the correct final precision.", ["8.55", "8.6", "8.55 to 3 sf", "9"], 1, "The raw product is 8.55, then round to 2 significant figures.", hint),
    mc("Why is it weak to copy every digit from a calculator display?", ["The calculator can show more digits than the measurements justify", "Calculators only display approximate units", "Displayed digits are always wrong", "Scientific answers must be whole numbers"], 0, "The screen does not decide the justified precision; the measurements do.", hint),
    mc("Calculate 6.40 / 2.0 with the correct number of significant figures.", ["3.2", "3.20", "3", "3.200"], 0, "The raw answer is 3.2 and the limiting input has 2 significant figures.", hint),
    mc("Which statement about trailing zeros after a decimal point is correct?", ["They can show real measured precision", "They never count", "They always mean the unit changed", "They are only placeholders"], 0, "Trailing zeros after the decimal often carry precision information.", hint),
    shortCases([
      { prompt: "How many significant figures are in 0.0205?", acceptedAnswers: words("3"), hint: "Ignore leading zeros, but count the zero between 2 and 5." },
      { prompt: "Round 98.76 to 2 significant figures.", acceptedAnswers: words("99"), hint: "Keep 9 and 8, then round using the next digit." },
      { prompt: "State the rule for addition and subtraction in a few words.", acceptedAnswers: words("least decimal places", "fewest decimal places", "use the least decimal places"), hint: "This rule is about decimal places, not total significant figures." },
      { prompt: "State the rule for multiplication and division in a few words.", acceptedAnswers: words("least significant figures", "fewest significant figures", "use the least significant figures"), hint: "This rule is about the least precise measurement." },
      { prompt: "Round 0.00346 to 2 significant figures.", acceptedAnswers: words("0.0035"), hint: "Keep the first two significant digits and inspect the next one." },
      { prompt: "Calculate 1.25 + 0.3 with correct final precision.", acceptedAnswers: words("1.6"), hint: "Add first, then round to the least decimal places." },
      { prompt: "Calculate 4.0 x 2.31 with correct final precision.", acceptedAnswers: words("9.2"), hint: "Multiply first, then keep the least significant figures." },
      { prompt: "How many significant figures are in 150.0?", acceptedAnswers: words("4"), hint: "The trailing zero after the decimal counts." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Ask which digits genuinely come from the measurement and which rule matches the calculation.";
  return [
    mc("Why do leading zeros not usually count as significant figures?", ["They only locate the decimal point and do not show measured precision", "They always mean the measurement is exact", "They belong to the unit, not the number", "They make the value a vector"], 0, "Leading zeros place the decimal point but do not carry precision.", hint),
    mc("Why can a trailing zero after a decimal point be significant?", ["It can show that the measurement was known to that place value", "It always means the value is rounded badly", "It changes the unit", "It can never be measured"], 0, "A trailing decimal zero can be evidence of reported precision.", hint),
    mc("Why is the addition rule different from the multiplication rule?", ["Because addition aligns place value, while multiplication combines measured precision in a different way", "Because multiplication never uses significant figures", "Because addition ignores uncertainty", "Because calculator displays change the rule"], 0, "Different operations propagate precision differently.", hint),
    mc("Which statement best protects honest reporting?", ["A final answer should not claim more precision than the measurements used to produce it", "More digits always make a result better", "Calculator digits are always exact", "Rounding is only cosmetic"], 0, "This is the central reporting principle.", hint),
    mc("Why is '0.02050 m' more informative than '0.0205 m' in some contexts?", ["It can show one more significant figure of reported precision", "It means the length is physically larger", "It changes the unit from metres to centimetres", "It proves the measurement has no uncertainty"], 0, "The extra trailing zero after the decimal can carry precision information.", hint),
    mc("Why should rounding happen after the calculation, not before, in most worked examples?", ["Early rounding can throw away useful information and distort the final result", "Because intermediate values must always be exact", "Because physics forbids intermediate numbers", "Because decimals cannot be used during calculations"], 0, "Keep precision until the end, then round according to the correct rule.", hint),
    mc("Which statement best matches a justified final answer to 12.34 + 1.2?", ["13.54 because calculators show two decimal places", "13.5 because the least precise input has one decimal place", "13 because 13 is simpler", "13.540 because zeros always improve precision"], 1, "The addition rule depends on decimal places.", hint),
    mc("Which statement best matches a justified final answer to 2.5 x 3.42?", ["8.55 because all digits from multiplication should be kept", "8.6 because the least precise input has 2 significant figures", "8.60 because trailing zeros are always needed", "9 because products should be whole numbers"], 1, "The multiplication rule depends on significant figures.", hint),
    mc("Why is a calculator display not the final authority on reported precision?", ["The measurements, not the screen, set the justified number of digits", "Screens cannot show decimals", "Calculators change the units", "Displayed digits remove uncertainty"], 0, "The screen gives a raw numerical result, not the reporting rule.", hint),
    mc("Which statement is strongest about significant figures?", ["They help preserve honesty about measured precision", "They eliminate uncertainty from experiments", "They are only for very large numbers", "They matter only when there are zeros"], 0, "Significant figures are a reporting discipline, not a trick with zeros alone.", hint),
    mc("Why is 1200 a potentially ambiguous statement of precision?", ["Without more notation, it can be unclear how many digits were intended as significant", "Because 1200 is too large for science", "Because whole numbers cannot have significant figures", "Because 1200 must be a vector"], 0, "Some numbers need decimal points or standard form to make precision explicit.", hint),
    mc("Which rule should control the result of 7.186 - 0.42?", ["least decimal places", "least significant figures", "most decimal places", "unit prefix rule"], 0, "Subtraction follows decimal places.", hint),
    mc("Which rule should control the result of 4.50 / 1.2?", ["least significant figures", "least decimal places", "most decimal places", "calculator display digits"], 0, "Division follows significant figures.", hint),
    mc("Why is 'precision' the right idea to protect on this page?", ["Because this page is about how many digits the evidence justifies in a reported answer", "Because this page is about direction of vectors", "Because this page is about the size of density only", "Because this page is about energy transfer"], 0, "F1_L4 is about disciplined numerical reporting.", hint),
    mc("What common mistake is F1_L4 trying to prevent?", ["Over-reporting digits that were never supported by the original measurements", "Using units with every answer", "Comparing route length with displacement", "Repeating measurements"], 0, "That is the main reporting trap in this lesson.", hint),
    mc("Why does 0.00450 have more significant figures than 0.0045?", ["The final zero after the decimal is part of the reported precision", "The zero changes the physical quantity", "The decimal point moved", "The unit became smaller"], 0, "That last zero is not a placeholder; it can be a measured digit.", hint),
    mc("Which statement best protects the least-precise-measurement principle?", ["The weakest input precision limits how precise the final reported result may be", "The strongest input decides everything", "The final answer should always have at least 5 significant figures", "Precision can be chosen after seeing the answer"], 0, "The least precise measurement controls the reporting limit.", hint),
    mc("Why is rounding 'for neatness' a weak reason?", ["Rounding should reflect justified precision, not just appearance", "Neat answers are always wrong", "Rounded answers cannot have units", "Only unrounded answers are scientific"], 0, "The motive for rounding should be measurement logic, not style.", hint),
    mc("Which lesson idea should stay visible in F1_L4?", ["Keep only the digits the evidence truly supports", "Always copy the calculator", "Use the same rounding rule for every operation", "Count every zero"], 0, "This is the lesson's main reporting discipline.", hint),
    mc("Which statement best matches strong F1_L4 reasoning?", ["Operation type matters because different calculations preserve precision in different ways", "Once a value is calculated, precision no longer matters", "Significant figures only matter in chemistry", "Decimal places and significant figures are interchangeable ideas"], 0, "F1_L4 depends on keeping the two reporting rules distinct.", hint),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep mass and volume together, then compare densities rather than size alone.";
  return [
    mc("Which equation gives density?", ["density = mass x volume", "density = mass / volume", "density = volume / mass", "density = mass + volume"], 1, "Density compares mass with volume by division.", hint),
    mc("Which unit is suitable for density?", ["kg", "m^3", "kg/m^3", "N"], 2, "Density is mass per unit volume.", hint),
    mc("Two blocks have the same volume. Which one is denser?", ["The one with more mass", "The one with less mass", "They must have the same density", "You cannot compare them"], 0, "More mass packed into the same space means greater density.", hint),
    mc("Two samples have the same mass. Which one is denser?", ["The larger-volume sample", "The smaller-volume sample", "They must have the same density", "Density depends only on temperature"], 1, "The same mass packed into less space is denser.", hint),
    mc("A block has mass 120 g and volume 40 cm^3. What is its density?", ["2 g/cm^3", "3 g/cm^3", "4 g/cm^3", "6 g/cm^3"], 1, "Use density = mass / volume.", hint),
    mc("A material has density 2 g/cm^3 and volume 5 cm^3. What is its mass?", ["2.5 g", "7 g", "10 g", "25 g"], 2, "Use mass = density x volume.", hint),
    mc("An object floats in water when...", ["its density is greater than water", "its density is less than water", "its mass is always small", "its volume is always large"], 1, "Floating depends on density comparison, not mass alone.", hint),
    mc("Why must units be made consistent before using the density formula?", ["Mixed units can distort the numerical value", "Density has no units", "The formula only works with kilograms", "Consistent units remove all uncertainty"], 0, "Density compares mass and volume directly, so mismatched units spoil the result.", hint),
    mc("What is 1.5 g/cm^3 in kg/m^3?", ["150 kg/m^3", "1500 kg/m^3", "15 kg/m^3", "0.0015 kg/m^3"], 1, "1 g/cm^3 equals 1000 kg/m^3.", hint),
    mc("What is 2700 kg/m^3 in g/cm^3?", ["0.27 g/cm^3", "2.7 g/cm^3", "27 g/cm^3", "270 g/cm^3"], 1, "1000 kg/m^3 equals 1 g/cm^3.", hint),
    mc("A liquid has density 0.8 g/cm^3. A block has density 1.2 g/cm^3. What happens?", ["The block floats", "The block sinks", "The block has zero weight", "The block disappears"], 1, "An object denser than the liquid sinks.", hint),
    mc("Which statement best describes density?", ["How much mass is packed into each unit of volume", "How much volume is packed into each unit of mass", "How heavy something feels", "How large the object is"], 0, "Density is the packing of mass into space.", hint),
    shortCases([
      { prompt: "A block has mass 60 g and volume 20 cm^3. What is its density?", acceptedAnswers: words("3", "3 g/cm^3", "3 g per cm^3"), hint: "Divide mass by volume." },
      { prompt: "A liquid has density 0.80 g/cm^3 and volume 50 cm^3. What is its mass?", acceptedAnswers: numericAnswers(40, "g"), hint: "Use mass = density x volume." },
      { prompt: "A sample has mass 24 g and density 3 g/cm^3. What is its volume?", acceptedAnswers: numericAnswers(8, "cm^3"), hint: "Use volume = mass / density." },
      { prompt: "Convert 3000 kg/m^3 to g/cm^3.", acceptedAnswers: words("3", "3 g/cm^3"), hint: "1000 kg/m^3 equals 1 g/cm^3." },
      { prompt: "If an object's density is lower than the liquid's density, it will ...", acceptedAnswers: words("float", "it will float"), hint: "Compare the two densities directly." },
      { prompt: "State in words what density compares.", acceptedAnswers: words("mass per unit volume", "mass packed into each unit volume", "mass packed into a given volume"), hint: "Think about mass relative to space occupied." },
      { prompt: "What is the density of 0.24 kg in 0.0001 m^3?", acceptedAnswers: numericAnswers(2400, "kg/m^3"), hint: "Divide mass by volume in consistent SI units." },
      { prompt: "What is the volume of 1800 kg of a material with density 900 kg/m^3?", acceptedAnswers: numericAnswers(2, "m^3"), hint: "Use volume = mass / density." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Do not let size alone answer a density question; compare mass with volume together.";
  return [
    mc("Why can a small steel block be denser than a larger foam block?", ["Density compares mass with volume, so size alone does not decide it", "Small objects are always denser", "Foam has no volume", "Large objects cannot float"], 0, "Density is about packing, not size alone.", hint),
    mc("Why is 'the heavier object is denser' a weak rule on its own?", ["Because density also depends on how much volume the mass occupies", "Because heavy objects have no density", "Because only liquids have density", "Because mass and density are identical"], 0, "Mass alone is not enough; volume matters too.", hint),
    mc("Why is 'the larger object is less dense' also a weak rule on its own?", ["Because volume alone is not enough; mass must be compared at the same time", "Because larger objects always sink", "Because density depends only on shape", "Because density has no unit"], 0, "Volume alone does not settle density either.", hint),
    mc("Which statement best protects the lesson meaning?", ["Density is the mass packed into each unit volume, so both mass and volume matter together", "Density is just another word for mass", "Density depends only on whether something floats", "Density is the same as weight"], 0, "This keeps the formula tied to the physical meaning.", hint),
    mc("Why does a same-volume comparison make density reasoning easier?", ["Because the object with more mass is then automatically denser", "Because volume stops existing", "Because density no longer needs units", "Because all same-volume objects float"], 0, "Fixing one variable helps isolate the other.", hint),
    mc("Why does a same-mass comparison make density reasoning easier?", ["Because the smaller volume then means greater density", "Because mass becomes unimportant", "Because the density formula changes", "Because the unit must be kg/m^3"], 0, "The same mass packed into less space is denser.", hint),
    mc("Why should density answers keep the compound unit?", ["Because the unit shows that the value is mass per volume, not a bare number", "Because density units can replace the formula", "Because compound units remove uncertainty", "Because density has no SI form"], 0, "The unit carries the meaning of the relationship.", hint),
    mc("Why can 1 g/cm^3 and 1000 kg/m^3 describe the same density?", ["They are equivalent units written on different scales", "The material changes when the unit changes", "One is for solids and one is for liquids only", "The first is more accurate"], 0, "Changing the unit scale does not change the physical density.", hint),
    mc("Why is density often useful for float-or-sink predictions?", ["Floating depends on comparison between object density and fluid density", "Heavier objects always sink", "Only mass matters in fluids", "Volume becomes irrelevant in fluids"], 0, "The density comparison predicts whether the fluid can support the object.", hint),
    mc("A hollow metal ship can float even though steel is dense. Which idea best explains this?", ["The average density of the whole ship, including trapped air, can be less than water", "Steel loses its density on water", "Water has no density", "Mass stops mattering in large objects"], 0, "The relevant comparison is for the whole object's average density.", hint),
    mc("Why is unit consistency especially important in density questions?", ["Because the formula divides one quantity by another, so mismatched units distort the value", "Because density has no defined unit", "Because one must always use grams and centimetres", "Because SI units cannot be converted"], 0, "Consistent units keep the quotient meaningful.", hint),
    mc("Which statement best compares density with mass?", ["Mass tells how much matter there is; density tells how tightly that matter is packed", "They are two names for the same idea", "Density is mass with direction", "Mass depends on the surrounding liquid"], 0, "Density adds the volume comparison that mass alone lacks.", hint),
    mc("Why is an iceberg mostly below the water line even though it floats?", ["Its density is lower than water, but only slightly lower, so most of its volume must still be submerged", "Floating objects must always stay fully above water", "Ice has zero mass", "Water pushes only on the top surface"], 0, "Float does not mean 'all above the surface'.", hint),
    mc("Why does increasing volume while keeping mass fixed reduce density?", ["The same mass is spread through more space", "Volume and density always rise together", "The unit changes to a smaller one", "Density depends only on temperature"], 0, "A fixed mass packed less tightly has lower density.", hint),
    mc("Why does increasing mass while keeping volume fixed raise density?", ["More mass is packed into the same space", "Volume must become smaller automatically", "The unit changes to grams", "Objects with more mass always float"], 0, "More packing in the same volume means higher density.", hint),
    mc("What common mistake is F1_L5 preventing?", ["Using only mass or only size to answer a density question", "Using units in the final answer", "Comparing two objects in water", "Rearranging a formula"], 0, "The lesson stops one-variable guessing.", hint),
    mc("Why is density a better comparison than mass alone when materials are different sizes?", ["Density removes the size effect by comparing mass with volume", "Density ignores mass completely", "Density changes the shape of the object", "Mass can only be compared for liquids"], 0, "Density lets you compare materials fairly across different sizes.", hint),
    mc("Which lesson idea should stay visible in F1_L5?", ["Density is a relationship between mass and volume, not a one-word label for heavy objects", "Density is the same as weight", "Big things are always denser", "All floating objects have no mass"], 0, "This is the page's core contrast.", hint),
    mc("Why is a density formula useful even after the concept is understood?", ["It lets you move between calculation, comparison, and rearrangement without losing the physical meaning", "It replaces the need to think about mass or volume", "It works only for floating objects", "It removes all unit conversions"], 0, "The formula is a compact way to preserve the concept in calculations.", hint),
    mc("Which statement best matches strong F1_L5 reasoning?", ["Float-or-sink predictions should come from density comparison, not from a guess based on mass alone", "Anything light must float", "Anything large must sink", "Density matters only for solids"], 0, "That keeps the lesson's main mechanism visible.", hint),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Separate closeness to the true value, closeness among repeats, and the size of the uncertainty.";
  return [
    mc("What does accuracy describe?", ["How close repeated readings are to one another", "How close a result is to the accepted or true value", "How many digits a calculator shows", "How large the unit is"], 1, "Accuracy is closeness to the accepted or true value.", hint),
    mc("What does precision describe?", ["How close a result is to the true value", "How closely repeated readings agree with one another", "How many units were used", "How long the experiment lasted"], 1, "Precision is closeness among repeated readings.", hint),
    mc("A set of readings is tightly grouped but far from the true value. This set is...", ["accurate and precise", "accurate but not precise", "precise but not accurate", "neither accurate nor precise"], 2, "Tight grouping shows precision; being off target shows poor accuracy.", hint),
    mc("A set of readings is spread out, but the mean is close to the true value. This set is...", ["accurate but not very precise", "precise but not accurate", "accurate and precise", "systematic only"], 0, "The average is on target, but the spread is wide.", hint),
    mc("A balance always reads 0.20 g too high. What does this suggest?", ["random error only", "systematic error such as zero error", "perfect accuracy", "the unit is missing"], 1, "A constant offset points to systematic bias.", hint),
    mc("Why should a measurement report include uncertainty?", ["To make it look advanced", "To show the result is not pretending to be exact", "To remove the need for units", "To guarantee the value is true"], 1, "Uncertainty gives an honest range or trust limit.", hint),
    mc("Which formula gives percentage uncertainty?", ["absolute uncertainty / measured value x 100%", "measured value / absolute uncertainty x 100%", "absolute uncertainty x measured value", "measured value - uncertainty"], 0, "Percentage uncertainty compares the uncertainty with the measured value.", hint),
    mc("A length is 25.0 cm +/- 0.5 cm. What is the percentage uncertainty?", ["1%", "2%", "5%", "20%"], 1, "0.5 / 25.0 x 100% = 2%.", hint),
    mc("A mass is 50.0 g +/- 1.0 g. What is the percentage uncertainty?", ["0.5%", "1%", "2%", "5%"], 2, "1.0 / 50.0 x 100% = 2%.", hint),
    mc("Which set of readings is more precise?", ["10.1, 9.9, 10.0", "10.0, 10.0, 10.1", "8.5, 10.0, 11.5", "9.0, 10.0, 11.0"], 1, "The tightest cluster is the most precise.", hint),
    mc("Which measurement is more trustworthy if all else is equal?", ["4% uncertainty", "12% uncertainty", "The one with smaller percentage uncertainty", "They are equally trustworthy"], 2, "A smaller percentage uncertainty usually means a tighter relative measurement.", hint),
    mc("Which pattern best shows both good accuracy and good precision?", ["A tight cluster around the accepted value", "A tight cluster away from the accepted value", "A wide spread around the accepted value", "One single reading with no unit"], 0, "Good measurements are on target and tightly grouped.", hint),
    shortCases([
      { prompt: "In a few words, what does precision describe?", acceptedAnswers: words("closeness of repeated readings", "how close repeated readings are", "agreement among repeated readings", "spread of repeated readings"), hint: "Think about the cluster, not the target." },
      { prompt: "In a few words, what does accuracy describe?", acceptedAnswers: words("closeness to the true value", "closeness to the accepted value", "how close the result is to the true value", "how close the result is to the accepted value"), hint: "Think about the target, not the spread." },
      { prompt: "What is the percentage uncertainty of 12.0 cm +/- 0.3 cm?", acceptedAnswers: words("2.5%", "2.5"), hint: "Use uncertainty / value x 100%." },
      { prompt: "What is the percentage uncertainty of 80 s +/- 4 s?", acceptedAnswers: words("5%", "5"), hint: "Use uncertainty / value x 100%." },
      { prompt: "If readings are tightly grouped but far from the true value, they are ...", acceptedAnswers: words("precise but not accurate"), hint: "Keep spread and target separate." },
      { prompt: "If a measuring device always reads too high by the same amount, the error is ...", acceptedAnswers: words("systematic error", "systematic"), hint: "A fixed offset is the clue." },
      { prompt: "Which is usually more trustworthy: 2% uncertainty or 8% uncertainty?", acceptedAnswers: words("2%", "2"), hint: "Smaller percentage uncertainty is generally stronger." },
      { prompt: "A result close to the true value is said to be ...", acceptedAnswers: words("accurate"), hint: "This word refers to target-closeness." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep target-closeness, cluster tightness, bias, and uncertainty as separate ideas.";
  return [
    mc("Why can a set of readings be precise but not accurate?", ["Because the readings can agree closely with each other while all being shifted away from the true value", "Because precision automatically means accuracy", "Because precise readings have no units", "Because accuracy depends only on sample size"], 0, "Precision and accuracy answer different questions.", hint),
    mc("Why can a set of readings be accurate on average but not very precise?", ["Because the mean can be close to the true value even if individual readings are widely spread", "Because wide spread proves the mean is wrong", "Because accurate sets must always be tight", "Because precision is the same as units"], 0, "Average position and spread are different features.", hint),
    mc("Why is percentage uncertainty useful when comparing measurements of different sizes?", ["It compares the uncertainty relative to the measured value", "It removes units from physics", "It always equals the absolute uncertainty", "It tells the true value exactly"], 0, "A relative comparison is often more informative than an absolute one.", hint),
    mc("Which statement best protects the lesson meaning?", ["Accuracy, precision, and uncertainty should be judged separately before deciding how trustworthy a result is", "Precision is just another word for accuracy", "Uncertainty only matters when the answer is wrong", "A single reading is enough to judge precision"], 0, "F1_L6 depends on keeping the measurement-quality ideas distinct.", hint),
    mc("Why is a constant zero error especially harmful to accuracy?", ["It pushes the whole cluster away from the true value even if the readings stay tight", "It makes the readings impossible to group tightly", "It only changes the units", "It improves the percentage uncertainty"], 0, "A constant bias damages accuracy directly.", hint),
    mc("Why is a smaller percentage uncertainty usually stronger evidence than a larger one?", ["The uncertainty is a smaller fraction of the measured value", "The units disappear", "The result becomes exact", "Precision no longer matters"], 0, "Smaller relative uncertainty usually means a tighter claim.", hint),
    mc("Why is a single reading weak evidence for precision?", ["Precision is about how repeated readings compare with one another", "Precision is about unit choice only", "A single reading is automatically precise", "Precision and accuracy are the same"], 0, "You need repeats to judge spread.", hint),
    mc("Why can repeated readings improve trust even when none is exact?", ["They reveal the spread and support a best estimate with uncertainty", "They force the true value to appear", "They remove systematic error automatically", "They change a scalar into a vector"], 0, "Repeats strengthen evidence without guaranteeing perfection.", hint),
    mc("Which statement best fits a trustworthy report?", ["It states the measured value, the unit, and a reasonable uncertainty based on the method", "It states only the number with many digits", "It states the mean only and hides the spread", "It avoids all discussion of error"], 0, "A trustworthy report is explicit about its limits.", hint),
    mc("Why is a tightly grouped wrong cluster still useful evidence?", ["It suggests the method may be consistent but biased, so systematic error should be investigated", "It proves the accepted value is wrong", "It means uncertainty is zero", "It means the instrument should be ignored"], 0, "The pattern points toward bias rather than random scatter.", hint),
    mc("Why is wide scatter around the true value not ideal even if the average is right?", ["Low precision means any single reading is weak and the uncertainty must be larger", "Accuracy is all that matters", "Wide scatter removes the need for units", "The average cannot be right if there is scatter"], 0, "Wide spread weakens the quality of individual measurements.", hint),
    mc("Why should the accepted or true value be named when judging accuracy?", ["Accuracy is defined by closeness to that target reference", "Precision needs the target more than accuracy does", "Accepted values remove uncertainty", "Without a target, precision becomes impossible"], 0, "Accuracy needs a reference point.", hint),
    mc("What common mistake is F1_L6 trying to prevent?", ["Using 'precise' and 'accurate' as if they meant the same thing", "Writing units with answers", "Calculating density in cm^3", "Repeating measurements"], 0, "This vocabulary confusion is the central trap.", hint),
    mc("Why is uncertainty part of trustworthiness rather than an optional extra?", ["It shows how tightly the measurement is supported by the evidence and method", "It is only decoration for formal reports", "It replaces the measurement value", "It matters only for very small numbers"], 0, "Without uncertainty, the claim can sound more exact than the method deserves.", hint),
    mc("Which result is more trustworthy if both are unbiased: 2.0% uncertainty or 0.5% uncertainty?", ["0.5% uncertainty", "2.0% uncertainty", "They are equally trustworthy", "Trust does not depend on uncertainty"], 0, "The smaller relative uncertainty is usually stronger.", hint),
    mc("Why can a better instrument improve both precision and trustworthiness?", ["It can give finer resolution and often a smaller uncertainty when used properly", "It guarantees the true value", "It removes the need for repeats", "It makes every reading accurate"], 0, "Better tools help, but they do not magically remove all error.", hint),
    mc("Why is bias harder to spot from one reading than from a pattern of repeats or calibration checks?", ["Bias often shows itself as a consistent shift, which needs comparison evidence", "Bias changes the unit immediately", "One reading always reveals zero error", "Bias makes all readings random"], 0, "Patterns and checks are what expose systematic shifts.", hint),
    mc("Which lesson idea should stay visible in F1_L6?", ["Measurement quality is multi-part: target-closeness, spread, bias, and uncertainty all matter", "Only the mean matters", "Only the largest reading matters", "All uncertainty should be ignored if the units are right"], 0, "That is the page's main audit rule.", hint),
    mc("Why is a smaller absolute uncertainty not always the better measurement?", ["Because the measured values may be different sizes, so percentage uncertainty can be the fairer comparison", "Because absolute uncertainty never matters", "Because the bigger value is always worse", "Because uncertainty only applies to time"], 0, "Relative size matters when comparing measurements.", hint),
    mc("Which statement best matches strong F1_L6 reasoning?", ["A trustworthy result should explain whether the method is accurate, precise, unbiased, and honestly reported", "Precision alone is enough", "Accuracy alone is enough", "Uncertainty should be hidden unless the result is poor"], 0, "The lesson ends by joining the quality checks into one judgement.", hint),
  ];
}

const F1_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F1_L1: l1DiagnosticRaw,
  F1_L2: l2DiagnosticRaw,
  F1_L3: l3DiagnosticRaw,
  F1_L4: l4DiagnosticRaw,
  F1_L5: l5DiagnosticRaw,
  F1_L6: l6DiagnosticRaw,
};

const F1_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F1_L1: l1ConceptRaw,
  F1_L2: l2ConceptRaw,
  F1_L3: l3ConceptRaw,
  F1_L4: l4ConceptRaw,
  F1_L5: l5ConceptRaw,
  F1_L6: l6ConceptRaw,
};

const F1_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(F1_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...F1_DIAGNOSTIC_BUILDERS[code](), ...F1_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function f1GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F1_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function f1GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F1_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function f1GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F1_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
