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
    throw new Error(`F2 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function speedAnswers(value: number): string[] {
  return numericAnswers(value, "m/s");
}

function accelerationAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "m/s^2"), numericAnswers(value, "m/s/s"));
}

function forceScalarAnswers(value: number): string[] {
  return numericAnswers(value, "N");
}

function displacementAnswers(value: number, direction: string): string[] {
  const plain = formatNumber(value);
  return words(`${plain} m ${direction}`, `${plain}${"m"} ${direction}`, `${plain} ${direction}`);
}

function forceDirectionalAnswers(value: number, direction: string): string[] {
  const plain = formatNumber(value);
  return words(`${plain} N ${direction}`, `${plain}${"N"} ${direction}`, `${plain} ${direction}`);
}

function percentageAnswers(value: number): string[] {
  const plain = formatNumber(value);
  return words(`${plain}%`, plain);
}

function zeroMeasureAnswers(unit: string): string[] {
  return words("0", `0 ${unit}`, "zero");
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Separate the whole route, the net change, and the time-based rate.";
  return [
    mc("Which quantity from this lesson needs direction to be complete?", ["distance", "average speed", "displacement", "time"], 2, "Displacement is a vector, so direction is part of the answer.", hint),
    mc("Which quantity is scalar?", ["displacement", "velocity", "average speed", "force"], 2, "Average speed uses magnitude only.", hint),
    mc("A learner walks 18 m east and then 18 m west. Which quantity is zero at the end?", ["distance", "average speed", "displacement", "time"], 2, "The learner finishes where the trip started, so the net change is zero.", hint),
    mc("A runner covers 240 m in 40 s. What is the average speed?", ["4 m/s", "5 m/s", "6 m/s", "8 m/s"], 2, "Average speed is total distance divided by total time.", hint),
    mc("A trolley moves 12 m east and then 5 m west. Which pair is correct?", ["distance 7 m, displacement 7 m east", "distance 17 m, displacement 7 m east", "distance 17 m, displacement 17 m east", "distance 7 m, displacement 17 m east"], 1, "Distance adds the full route, but displacement keeps the net change with direction.", hint),
    mc("Which quantity tells where the finish point is relative to the start point?", ["distance", "average speed", "time taken", "displacement"], 3, "Displacement is the directed start-to-finish change.", hint),
    mc("Which expression should be used for average speed?", ["total distance / total time", "displacement / total time", "largest distance / smallest time", "final speed / initial speed"], 0, "Average speed uses the whole route and the whole time.", hint),
    mc("Which quantity can be zero even when a long route has been travelled?", ["distance", "time", "average speed", "displacement"], 3, "A round trip can return to the starting point.", hint),
    mc("A walker goes 30 m north and then 30 m south. What is the total distance?", ["0 m", "30 m", "60 m", "60 m north"], 2, "Distance adds the full route regardless of direction.", hint),
    mc("Two journeys end at the same final point but one takes a detour. Which quantity must be the same?", ["distance", "average speed", "displacement", "time"], 2, "If the start and finish are the same, the net change is the same.", hint),
    mc("A car travels 120 m in 20 s. Which statement is correct?", ["Its average speed is 6 m/s", "Its displacement must be 120 m east", "Its average speed is a vector", "Its distance must be zero"], 0, "Only the route-time ratio is fixed by the information given.", hint),
    mc("A cyclist rides 8 m east, 8 m west, and 8 m east. What is the displacement?", ["8 m east", "8 m", "24 m east", "24 m"], 0, "Compare the finish with the start, not the whole route.", hint),
    shortCases([
      { prompt: "A scooter covers 150 m in 30 s. What is the average speed?", acceptedAnswers: speedAnswers(5), hint: "Use total distance divided by total time." },
      { prompt: "A runner goes 15 m east and then 9 m east. What is the displacement?", acceptedAnswers: displacementAnswers(24, "east"), hint: "The finish is 24 m east of the start." },
      { prompt: "A runner goes 20 m east and then 8 m west. What is the total distance?", acceptedAnswers: numericAnswers(28, "m"), hint: "Distance adds both stages of the route." },
      { prompt: "A quantity with magnitude only is called a ...", acceptedAnswers: words("scalar", "a scalar"), hint: "This type does not need direction." },
      { prompt: "A quantity with magnitude and direction is called a ...", acceptedAnswers: words("vector", "a vector"), hint: "This type needs direction as well as size." },
      { prompt: "A round trip that finishes where it started has displacement ...", acceptedAnswers: zeroMeasureAnswers("m"), hint: "The net start-to-finish change is zero." },
      { prompt: "A shuttle covers 0.6 km in 120 s. What is its average speed in m/s?", acceptedAnswers: speedAnswers(5), hint: "Convert 0.6 km to 600 m before dividing." },
      { prompt: "If two trips have the same start and finish, the quantity that must match is ...", acceptedAnswers: words("displacement", "the displacement"), hint: "This lesson separates net change from route length." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep whole-route length, net change, and route-time rate separate.";
  return [
    mc("Why can distance be larger than the magnitude of displacement for the same journey?", ["Because distance adds every part of the route while displacement only compares finish with start", "Because displacement uses bigger units", "Because distance is always a vector", "Because displacement includes time"], 0, "Distance and displacement do different jobs.", hint),
    mc("Why is displacement not the right quantity for average-speed calculations?", ["Average speed is based on total distance covered, not just the start-to-finish change", "Displacement has no unit", "Displacement is always zero", "Average speed needs direction"], 0, "Average speed is a scalar route rate.", hint),
    mc("A student says a round trip has no motion because the displacement is zero. What is the best correction?", ["Zero displacement only shows the finish matches the start; distance may still have been covered", "Zero displacement means zero time", "Zero displacement means average speed is undefined", "Zero displacement proves the path was straight"], 0, "Do not confuse zero net change with zero route travelled.", hint),
    mc("When does distance equal the magnitude of displacement?", ["When the motion is in one straight direction with no reversal or detour", "Whenever the time is constant", "Only on a round trip", "Only when the speed is constant"], 0, "The whole route and the straight start-to-finish change match only in a direct trip.", hint),
    mc("Why is '5 m/s east' a stronger motion description than '5 m/s'?", ["It includes the direction, so it can describe velocity rather than just speed", "It removes the need for time", "It makes the units optional", "It proves the path is straight"], 0, "Velocity needs direction as well as magnitude.", hint),
    mc("Why can average speed never be zero for a journey with non-zero distance and non-zero time?", ["Distance divided by time stays positive as long as some route was covered", "Because average speed is a vector", "Because time cancels the distance", "Because displacement is always positive"], 0, "Average speed is based on route length, which is not negative.", hint),
    mc("Which statement best protects the scalar-vector distinction?", ["A scalar has magnitude only, while a vector has magnitude and direction", "A scalar has no unit, while a vector has a unit", "A vector is always larger than a scalar", "A scalar can be negative but a vector cannot"], 0, "That is the central classification rule.", hint),
    mc("Two hikers finish 10 m east of the start, but one takes a long curved detour. Which quantity is changed by the detour?", ["distance only", "displacement only", "both must stay unchanged", "time only"], 0, "A detour alters route length without altering the net start-to-finish change.", hint),
    mc("Why can the magnitude of displacement never exceed the distance travelled?", ["The straight start-to-finish separation cannot be longer than the full route taken", "Because displacement has smaller units", "Because distance ignores the starting point", "Because distance is a vector"], 0, "The direct separation is the shortest connection between two positions.", hint),
    mc("A car travels 60 m east in 30 s and 60 m west in 30 s. Which statement is correct?", ["Average speed is 2 m/s even though displacement is zero", "Average speed is zero because displacement is zero", "Distance is zero because the car returned", "Velocity and average speed must be identical"], 0, "Route length and net change must not be collapsed into one number.", hint),
    mc("Which quantity best tells whether an object finished north or south of where it started?", ["distance", "average speed", "displacement", "time"], 2, "The answer depends on net change with direction.", hint),
    mc("Why is 'distance 20 m east' a weak phrase in this lesson?", ["Distance should not carry a direction word because it is scalar", "Distance must always be zero", "Distance can only be measured in kilometres", "Distance is the same as acceleration"], 0, "Do not attach vector language to a scalar quantity.", hint),
    mc("Which statement best compares two trips with the same distance but different displacements?", ["They can cover equal route lengths but end in different final positions relative to the start", "They must take the same time", "They must have the same average speed", "They must follow the same path"], 0, "Same distance does not lock the finish point.", hint),
    mc("Why does a detour raise the odometer-style quantity more than the map-arrow quantity?", ["Distance counts every extra segment, but displacement only updates the final start-to-finish separation", "Displacement uses larger numbers", "Distance includes mass", "Displacement includes acceleration"], 0, "This lesson uses route versus net change as the core contrast.", hint),
    mc("Which statement about direction is correct?", ["Direction is required for displacement and velocity but not for distance and speed", "Direction is required for every motion quantity", "Direction is optional for displacement", "Direction matters only for time"], 0, "Keep the vector quantities separate from the scalar ones.", hint),
    mc("Why is average speed still based on the whole journey when there are stops in between?", ["Because the total-time denominator includes moving and stopped intervals together", "Because stops are removed from physics calculations", "Because average speed uses only the fastest stage", "Because stopping changes distance into displacement"], 0, "Average means the whole journey, not just moving sections.", hint),
    mc("What common mistake is F2_L1 trying to prevent?", ["Treating distance and displacement as if they were interchangeable", "Treating time as a vector", "Ignoring units in force questions", "Reading graph area as acceleration"], 0, "This lesson is about separating route length from directed change.", hint),
    mc("Which result is physically possible?", ["distance 40 m, displacement 10 m east", "distance 10 m, displacement 40 m east", "distance 0 m, displacement 5 m east", "distance 5 m, displacement 12 m"], 0, "Distance cannot be smaller than the magnitude of displacement.", hint),
    mc("Why can two objects have the same average speed but different displacements?", ["They may travel different route shapes or directions even if distance/time matches", "Average speed already contains displacement", "Displacement is always equal to speed", "Same average speed forces the same finish point"], 0, "A route rate does not uniquely determine the net change.", hint),
    mc("Which statement best matches strong F2_L1 reasoning?", ["Route length, directed change, and average route rate should be checked as separate ideas before concluding", "Distance alone tells the whole motion story", "Displacement alone tells the whole motion story", "Time alone decides whether the journey is direct"], 0, "The lesson depends on keeping the three ideas separated.", hint),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Track the change in velocity, including its direction, before dividing by time.";
  return [
    mc("What is acceleration?", ["distance travelled each second", "rate of change of velocity", "force multiplied by time", "speed with direction"], 1, "Acceleration tells how velocity changes with time.", hint),
    mc("Velocity changes from 2 m/s to 10 m/s in 4 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "4 m/s^2", "8 m/s^2"], 1, "Use change in velocity divided by time.", hint),
    mc("If velocity stays constant, the acceleration is...", ["negative", "positive", "zero", "impossible to tell"], 2, "No change in velocity means zero acceleration.", hint),
    mc("A car moves at constant speed around a bend. Why can its acceleration still be non-zero?", ["Because the direction of the velocity changes", "Because time stops", "Because mass changes", "Because speed is a scalar"], 0, "Turning changes velocity even if the speed stays the same.", hint),
    mc("Velocity changes from -3 m/s to 5 m/s in 2 s. What is the acceleration?", ["2 m/s^2", "4 m/s^2", "6 m/s^2", "8 m/s^2"], 1, "The change in velocity is 8 m/s in 2 s.", hint),
    mc("What does a negative acceleration sign tell you by itself?", ["The acceleration points in the chosen negative direction", "The object must be slowing down", "The object must be moving backwards", "The speed must be zero"], 0, "The sign tells direction relative to the sign convention.", hint),
    mc("If an object is moving east and its acceleration is west, what happens to its speed?", ["It increases", "It decreases", "It stays constant", "It becomes undefined"], 1, "Acceleration opposite to the velocity reduces the speed.", hint),
    mc("If west is chosen as the negative direction and an object speeds up toward the west, what sign can the acceleration have?", ["positive only", "negative only", "zero only", "it cannot be signed"], 1, "Speeding up in the negative direction means the acceleration points negative too.", hint),
    mc("Velocity changes from 6 m/s east to 2 m/s east in 2 s. What is the acceleration?", ["-2 m/s^2", "2 m/s^2", "4 m/s^2", "8 m/s^2"], 0, "The velocity decreases by 4 m/s in 2 s.", hint),
    mc("A motion sensor shows 4 m/s east and later 4 m/s west. Which statement is correct?", ["The acceleration could be non-zero because the velocity changed direction", "The acceleration must be zero because the speed stayed 4 m/s", "The displacement must be zero", "The mass must have changed"], 0, "Velocity includes direction, so a reversal is a change.", hint),
    mc("If speed and direction both stay unchanged, the acceleration is...", ["positive", "negative", "zero", "equal to the speed"], 2, "No velocity change means no acceleration.", hint),
    mc("Which case has the greatest acceleration magnitude?", ["velocity changes by 2 m/s in 1 s", "velocity changes by 4 m/s in 4 s", "velocity changes by 6 m/s in 6 s", "velocity changes by 3 m/s in 3 s"], 0, "Compare change in velocity divided by time, not the change alone.", hint),
    shortCases([
      { prompt: "Velocity changes from 5 m/s to 17 m/s in 4 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(3), hint: "Use change in velocity divided by time." },
      { prompt: "Velocity changes from -2 m/s to 4 m/s in 3 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(2), hint: "Subtract initial velocity from final velocity before dividing by time." },
      { prompt: "Velocity changes from 9 m/s to 3 m/s in 2 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(-3), hint: "Keep the sign on the change in velocity." },
      { prompt: "The quantity that must change for acceleration to exist is ...", acceptedAnswers: words("velocity", "the velocity"), hint: "Acceleration tracks change in this vector quantity." },
      { prompt: "If the velocity arrow keeps the same length but points in a new direction, has the velocity changed?", acceptedAnswers: words("yes"), hint: "Direction is part of velocity." },
      { prompt: "Velocity changes from 0 m/s to 12 m/s in 6 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(2), hint: "Use final velocity minus initial velocity, divided by time." },
      { prompt: "Velocity changes from 7 m/s to -1 m/s in 4 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(-2), hint: "A reversal can still be handled with the same signed formula." },
      { prompt: "If velocity is unchanged over time, the acceleration is ...", acceptedAnswers: words("0", "0 m/s^2", "0 m/s/s", "zero"), hint: "No change in velocity means zero acceleration." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Acceleration is about signed change in velocity, not just about whether something feels faster.";
  return [
    mc("Why is acceleration defined using velocity rather than speed?", ["Because direction changes can also count as acceleration", "Because speed has no unit", "Because velocity removes the need for time", "Because speed is always zero on a curve"], 0, "Turning motion is the key reason velocity must be used.", hint),
    mc("Why can an object accelerate even when its speed stays the same?", ["Its direction can change, which changes the velocity", "Its mass changes automatically", "Its time becomes negative", "Its displacement stays constant"], 0, "Velocity includes direction as well as magnitude.", hint),
    mc("Why does a negative acceleration not automatically mean the object is slowing down?", ["The sign tells acceleration direction relative to the chosen positive direction, not speed change by itself", "Negative acceleration removes direction", "Negative acceleration means zero force", "Acceleration signs never matter"], 0, "Speeding up in the negative direction is still possible.", hint),
    mc("Which statement is always true when acceleration is zero?", ["Velocity is constant", "The object is at rest", "The force must be zero in each direction separately", "The speed is zero"], 0, "Zero acceleration means no change in velocity.", hint),
    mc("Why does sign convention matter in acceleration problems?", ["The sign of velocity and acceleration depends on which direction was chosen as positive", "It changes the physical motion", "It changes the mass", "It removes the need for units"], 0, "Signs describe directions relative to the chosen axis.", hint),
    mc("Which statement best matches the velocity-arrow model?", ["Acceleration describes how the velocity arrow changes between moments", "Acceleration is the same thing as the velocity arrow", "Acceleration describes the position arrow only", "Acceleration is the same as displacement"], 0, "The before-and-after arrow comparison is the key idea.", hint),
    mc("A car moves clockwise around a circular track at constant speed. Why is the acceleration not zero?", ["Because the velocity direction keeps changing at each point on the circle", "Because the speedometer reading rises", "Because the distance is zero", "Because the mass changes on the bend"], 0, "Turning motion means changing velocity.", hint),
    mc("Velocity changes from -6 m/s to -2 m/s. Why is the acceleration positive?", ["Because the signed velocity increased by 4 m/s", "Because the speed increased", "Because the object reversed direction", "Because negative numbers cannot be used in physics"], 0, "A less-negative final value is a positive change.", hint),
    mc("An object moves east and has a westward acceleration. Which statement is safest?", ["Its speed decreases while it keeps moving east, at least initially", "It must reverse direction immediately", "Its acceleration is zero", "Its mass must be changing"], 0, "Opposite-direction acceleration first reduces the speed.", hint),
    mc("An object moves west and has a westward acceleration. Which statement is safest?", ["Its speed increases because velocity and acceleration point the same way", "Its speed must decrease", "Its acceleration is zero", "Its displacement becomes zero"], 0, "Same-direction acceleration increases speed magnitude.", hint),
    mc("Why can two objects have the same speed but different accelerations?", ["One may be changing direction or changing speed while the other is not", "Acceleration depends only on mass", "Acceleration is always equal to speed", "Same speed forces same velocity history"], 0, "Acceleration depends on the change in velocity, not the current speed alone.", hint),
    mc("Which lesson mistake is most important to avoid in F2_L2?", ["Treating acceleration as 'change in speed only' instead of change in velocity", "Forgetting that time has units", "Thinking mass is scalar", "Using metres for distance"], 0, "This lesson is built around the velocity distinction.", hint),
    mc("Why must a time interval be included when describing acceleration?", ["A change in velocity alone does not tell how quickly the change happened", "Because time is a vector", "Because velocity has no unit", "Because acceleration ignores time"], 0, "Acceleration is a rate, so the interval matters.", hint),
    mc("Why is it weak to decide acceleration from one velocity reading alone?", ["Acceleration needs a comparison between at least two moments of velocity", "One reading already shows the whole change", "Velocity and acceleration are the same thing", "A single reading removes uncertainty"], 0, "Acceleration is a change-between-moments idea.", hint),
    mc("If an object reverses direction, which statement must be true?", ["Its velocity changed, so some non-zero acceleration must have acted during the change", "Its acceleration stayed zero throughout", "Its speed must have stayed constant", "Its displacement must be zero"], 0, "A reversal is a clear velocity change.", hint),
    mc("Why is 'slowing down' not the same statement as 'negative acceleration'?", ["Slowing down depends on the relative directions of velocity and acceleration, not the sign alone", "Because negative acceleration is impossible", "Because slowing down is a scalar", "Because only force has signs"], 0, "The sign by itself is not the whole story.", hint),
    mc("Which statement about constant-velocity motion is correct?", ["It has zero acceleration because neither speed nor direction changes", "It always has positive acceleration", "It must be stationary", "It must move in the negative direction"], 0, "Constant velocity means no change to the motion vector.", hint),
    mc("Why does a change in direction count as a change in velocity even when the speedometer reading is unchanged?", ["Velocity is a vector, so direction is part of what makes the quantity different", "Because speed secretly has direction", "Because time disappears on curves", "Because displacement equals velocity"], 0, "This is the core vector idea of the lesson.", hint),
    mc("What is the strongest way to interpret acceleration in this lesson?", ["As the signed rate at which the velocity vector changes", "As distance travelled per second", "As the same thing as speed", "As a force without time"], 0, "Signed change in the vector is the formal meaning.", hint),
    mc("Which statement best matches strong F2_L2 reasoning?", ["Always compare initial and final velocity, keep the sign convention visible, and then divide by the time interval", "Use only the speed values and ignore direction", "Use the biggest number in the question", "Ignore the time interval if the direction changes"], 0, "That process protects the full physics meaning.", hint),
  ];
}
function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "On a distance-time graph, graph height and graph steepness answer different questions.";
  return [
    mc("On a distance-time graph, what does the graph height at 8 s show?", ["the speed at 8 s", "the total distance covered by 8 s", "the acceleration at 8 s", "the direction of motion"], 1, "Graph height on a distance-time graph is distance, not speed.", hint),
    mc("A flat section on a distance-time graph means the object is...", ["speeding up", "stopped", "moving backward", "accelerating negatively"], 1, "If distance is not changing while time passes, the object is stationary.", hint),
    mc("Which section shows the greater speed on a distance-time graph?", ["the steeper straight section", "the flatter straight section", "the horizontal section", "all sections have the same speed"], 0, "Steeper slope means more distance added each second.", hint),
    mc("A graph rises by 20 m in 4 s on one straight section. What speed does that section show?", ["2 m/s", "4 m/s", "5 m/s", "20 m/s"], 2, "Use gradient = change in distance divided by change in time.", hint),
    mc("Two straight sections have the same steepness. What does that mean?", ["the object was stopped in both sections", "the object moved with the same speed in both sections", "the object moved backward in one section", "the distance covered must be zero"], 1, "Equal slope means equal speed on a distance-time graph.", hint),
    mc("If a later section is less steep than an earlier section, the object is...", ["moving faster later", "moving slower later", "moving backward later", "stopped for the whole graph"], 1, "A smaller gradient means a smaller speed.", hint),
    mc("Why would a downward-sloping line be invalid on a distance-time graph for total distance travelled?", ["Because total distance covered cannot decrease as time passes", "Because time cannot increase", "Because slope is not allowed to be negative", "Because acceleration must be positive"], 0, "Distance travelled is cumulative.", hint),
    mc("A graph is flat from 3 s to 7 s. For how long is the object stopped?", ["3 s", "4 s", "7 s", "10 s"], 1, "Use the time interval spanned by the flat section.", hint),
    mc("A straight distance-time line with constant slope shows...", ["constant speed", "constant acceleration", "zero speed", "negative displacement"], 0, "A constant gradient means a constant speed.", hint),
    mc("Which graph feature on a distance-time graph tells you the speed?", ["the gradient", "the graph height", "the time-axis label only", "the total width of the graph"], 0, "Steepness is the speed clue.", hint),
    mc("If the graph is at 24 m when t = 6 s, what does 24 m mean?", ["the speed at 6 s is 24 m/s", "24 m has been covered by 6 s", "the object has 24 s left to move", "the acceleration is 24 m/s^2"], 1, "Read graph height as distance covered, not as a rate.", hint),
    mc("A graph rises 12 m in 6 s and later rises 12 m in 3 s. Which section is faster?", ["the 6 s section", "the 3 s section", "both are equally fast", "neither can be compared"], 1, "Covering the same distance in less time means a larger gradient.", hint),
    shortCases([
      { prompt: "A distance-time graph rises by 18 m in 6 s on one straight section. What speed does that section show?", acceptedAnswers: speedAnswers(3), hint: "Use change in distance divided by change in time." },
      { prompt: "A distance-time graph is flat from 2 s to 5 s. For how long is the object stopped?", acceptedAnswers: numericAnswers(3, "s"), hint: "Subtract the start time of the flat section from the end time." },
      { prompt: "A graph rises from 12 m at 4 s to 24 m at 8 s. What speed does that section show?", acceptedAnswers: speedAnswers(3), hint: "The section adds 12 m in 4 s." },
      { prompt: "The line steepness on a distance-time graph tells you the ...", acceptedAnswers: words("speed", "the speed"), hint: "This quantity comes from the gradient." },
      { prompt: "If the graph is flat, the object is ...", acceptedAnswers: words("stopped", "stationary", "at rest"), hint: "Distance is not increasing during that interval." },
      { prompt: "A graph rises by 40 m in 10 s. What speed does that section show?", acceptedAnswers: speedAnswers(4), hint: "Use gradient = 40 / 10." },
      { prompt: "Two graph sections with the same slope show the same ...", acceptedAnswers: words("speed", "the speed"), hint: "Equal steepness means equal rate of distance change." },
      { prompt: "A graph rises from 5 m at 1 s to 17 m at 5 s. What speed does that section show?", acceptedAnswers: speedAnswers(3), hint: "The section adds 12 m in 4 s." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep graph height and graph gradient doing different jobs.";
  return [
    mc("Why does slope, not graph height, tell you speed on a distance-time graph?", ["Speed depends on how quickly distance changes with time, not on the total distance already covered", "Because height has no unit", "Because height always means acceleration", "Because slope removes time"], 0, "A rate comes from a change over an interval.", hint),
    mc("Why does a flat section mean the object is stopped rather than moving backward?", ["The distance is staying unchanged while time passes, so no extra distance is being added", "Because the graph has lost its units", "Because backward motion is impossible in physics", "Because the time axis becomes negative"], 0, "Flat means zero gradient and zero speed.", hint),
    mc("Why would a downward line be wrong for total distance travelled?", ["Distance covered is cumulative and cannot reduce as time passes", "Because lines cannot slope down in graphs", "Because the object must be speeding up", "Because time only works with positive slope"], 0, "Total distance travelled never subtracts previously covered route.", hint),
    mc("Why does a steeper section mean greater speed?", ["More distance is added in each second", "The object is higher above the page", "The time axis is larger", "The graph has a bigger area"], 0, "Steeper means larger distance change per second.", hint),
    mc("Why does a straight section represent constant speed?", ["Its gradient stays unchanged across that interval", "Its height stays zero", "Its time value is fixed", "Its distance value is negative"], 0, "Constant gradient means constant speed.", hint),
    mc("Why must a multi-stage journey graph be read section by section?", ["Different segments can tell different speed stories", "Because graph height only works at the end", "Because time does not flow continuously", "Because only the last section matters"], 0, "Each segment can have its own gradient.", hint),
    mc("Two journeys finish at 30 m after 10 s, but one graph has a flat middle section. What must be different?", ["The speed history during the journey", "The final distance", "The total time", "The graph units"], 0, "Same finish does not force the same segment-by-segment motion.", hint),
    mc("Why does a higher graph point not automatically mean a greater speed?", ["Graph height shows accumulated distance, while speed comes from the slope", "Because higher points are always slower", "Because speed has no unit", "Because distance-time graphs cannot compare speeds"], 0, "Height and slope answer different questions.", hint),
    mc("Why can time keep increasing on a flat section even though distance does not?", ["The object can remain at rest while the clock continues running", "Because time depends on distance", "Because the graph is switching to velocity", "Because a flat section stops the experiment"], 0, "The motion can pause while time keeps passing.", hint),
    mc("Why do two sections with the same steepness show the same speed even if one starts at a larger distance value?", ["Speed depends on the rate of distance change, not on the starting height of the graph", "Because both sections have zero time", "Because all graphs start from zero", "Because height and speed are identical"], 0, "Only the gradient matters for speed.", hint),
    mc("Why is the correct formula on one section of a distance-time graph v = Δdistance / Δtime?", ["Speed is the gradient of that section", "Speed is the graph height divided by time zero", "Speed equals the total area under the graph", "Speed is the same as displacement"], 0, "The graph is visualising a rate.", hint),
    mc("Which unit should the graph height carry on a distance-time graph?", ["metres", "metres per second", "seconds per metre", "newtons"], 0, "Height is distance covered.", hint),
    mc("Why does the time axis matter in judging whether one section is faster than another?", ["The same distance covered in less time means a larger speed", "Time only affects the graph colour", "Time changes the units of distance", "Time is irrelevant once distance is known"], 0, "A rate always depends on how much happens per unit time.", hint),
    mc("If a graph becomes steeper later, what is the safest conclusion?", ["The object is moving faster later in the journey", "The object must be moving backward", "The object has no distance", "The time axis has changed"], 0, "A larger gradient means a larger speed.", hint),
    mc("A graph curves upward so its gradient increases with time. What does that suggest?", ["The speed is increasing, not staying constant", "The speed is constant because the graph is rising", "The object is stopped", "The object is moving backward"], 0, "Changing gradient means changing speed.", hint),
    mc("Why does a horizontal section have zero speed?", ["Its gradient is zero, so distance is not changing with time", "Its height is zero", "Its time value is zero", "Its unit is wrong"], 0, "Zero slope means no distance is being added each second.", hint),
    mc("One section covers 10 m in 2 s while another covers 10 m in 5 s. Why is the first section faster?", ["The same distance is covered in less time, so its gradient is larger", "Because it ends at a higher point", "Because it has a flatter line", "Because speed is independent of time"], 0, "Larger distance-per-second means greater speed.", hint),
    mc("What common mistake is F2_L3 designed to prevent?", ["Reading graph height as speed instead of reading slope as speed", "Thinking time belongs on the x-axis", "Using metres for distance", "Thinking flat lines are impossible"], 0, "This is the main graph-reading trap.", hint),
    mc("Why is it weak to describe a whole distance-time graph with one speed when the slopes differ?", ["Different slopes show different speeds during different intervals", "Every journey has only one possible speed", "Changing slope only changes the units", "Flat sections do not count"], 0, "A changing gradient means the speed story changes.", hint),
    mc("Which statement best matches strong F2_L3 reasoning?", ["Read graph height for distance, read gradient for speed, and tell the motion story section by section", "Read graph height for speed and ignore slope", "Use the final distance to describe every section", "Treat any rising line as constant speed"], 0, "That keeps each graph feature tied to the right quantity.", hint),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "On a velocity-time graph, slope answers acceleration and area answers displacement.";
  return [
    mc("What does the area under a velocity-time graph represent?", ["force", "displacement", "acceleration", "mass"], 1, "Area combines velocity with time to give displacement.", hint),
    mc("What does the slope of a velocity-time graph represent?", ["displacement", "mass", "acceleration", "distance"], 2, "Gradient on this graph tells how quickly velocity changes.", hint),
    mc("A horizontal line at 5 m/s on a velocity-time graph means...", ["constant velocity of 5 m/s", "constant acceleration of 5 m/s^2", "zero displacement", "the object is stopped"], 0, "A horizontal line means the velocity is staying unchanged.", hint),
    mc("What does a section below the time axis mean on a velocity-time graph?", ["velocity in the chosen negative direction", "negative time", "negative mass", "zero displacement only"], 0, "Below the axis means negative velocity by the chosen sign convention.", hint),
    mc("An object moves at 6 m/s for 4 s. What displacement does the graph area show?", ["10 m", "18 m", "24 m", "30 m"], 2, "For constant velocity, displacement is velocity x time.", hint),
    mc("Velocity rises from 2 m/s to 10 m/s in 4 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "4 m/s^2", "8 m/s^2"], 1, "Use change in velocity divided by time.", hint),
    mc("If one section has a steeper slope than another, what does that mean?", ["Its acceleration magnitude is larger", "Its displacement must be larger", "Its velocity must be zero", "Its mass must be smaller"], 0, "A steeper slope means velocity is changing faster.", hint),
    mc("What can a negative area contribution show on a velocity-time graph?", ["displacement in the negative direction", "negative time", "negative mass", "positive acceleration only"], 0, "Area keeps the sign of the velocity region.", hint),
    mc("A section has zero slope but is above the time axis. Which statement is correct?", ["The object has constant positive velocity and zero acceleration", "The object is stopped", "The displacement is zero", "The graph has no meaning"], 0, "Flat above the axis means constant positive velocity.", hint),
    mc("Velocity falls from 9 m/s to 3 m/s in 2 s. What is the acceleration?", ["-3 m/s^2", "3 m/s^2", "-6 m/s^2", "6 m/s^2"], 0, "The change in velocity is -6 m/s in 2 s.", hint),
    mc("Velocity rises linearly from 0 to 8 m/s in 4 s. What displacement is shown by the triangular area?", ["8 m", "12 m", "16 m", "32 m"], 2, "Triangle area = 1/2 x base x height.", hint),
    mc("If the graph crosses the time axis, what does that show?", ["The velocity changes sign, so the direction of motion reverses", "Time becomes zero", "Acceleration becomes impossible", "Mass changes sign"], 0, "Crossing the axis means switching between positive and negative velocity.", hint),
    shortCases([
      { prompt: "An object moves at 4 m/s for 5 s. What displacement does the graph area show?", acceptedAnswers: numericAnswers(20, "m"), hint: "Multiply velocity by time for a constant-velocity rectangle." },
      { prompt: "Velocity changes from 0 m/s to 6 m/s in 3 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(2), hint: "Use change in velocity divided by time." },
      { prompt: "Velocity changes from 7 m/s to -1 m/s in 4 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(-2), hint: "Use the signed change in velocity." },
      { prompt: "On a velocity-time graph, the quantity read from the area is ...", acceptedAnswers: words("displacement", "the displacement"), hint: "Area builds up the signed motion over time." },
      { prompt: "On a velocity-time graph, the quantity read from the slope is ...", acceptedAnswers: words("acceleration", "the acceleration"), hint: "Gradient shows the rate of change of velocity." },
      { prompt: "A graph section below the time axis shows velocity in the ... direction.", acceptedAnswers: words("negative", "chosen negative"), hint: "The sign convention sets this direction." },
      { prompt: "An object moves at 3 m/s for 5 s. What displacement does the graph area show?", acceptedAnswers: numericAnswers(15, "m"), hint: "For a rectangle, multiply velocity by time." },
      { prompt: "Velocity changes from 5 m/s to 11 m/s in 3 s. What is the acceleration?", acceptedAnswers: accelerationAnswers(2), hint: "Use final velocity minus initial velocity, divided by time." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep graph height, slope, and area assigned to the right physical meanings.";
  return [
    mc("Why can one velocity-time graph answer two different physics questions?", ["Its slope gives acceleration while its area gives displacement", "Its height gives mass while its width gives force", "It automatically gives density and pressure", "It removes the need for calculations"], 0, "This graph carries two different motion readings at once.", hint),
    mc("Why does a horizontal line above the axis not mean zero displacement?", ["The object still has non-zero velocity, so area keeps building up with time", "Because horizontal lines ignore time", "Because acceleration is large", "Because displacement depends on mass"], 0, "Zero slope does not mean zero area.", hint),
    mc("Why does a region below the axis contribute negative displacement?", ["Velocity there is in the chosen negative direction, so the area carries a negative sign", "Because time is negative there", "Because the graph is upside down", "Because displacement cannot be positive"], 0, "The sign comes from the velocity, not from time.", hint),
    mc("Why does crossing the time axis show a direction change?", ["Velocity changes sign when it moves from positive to negative or vice versa", "Time starts again from zero", "Acceleration disappears", "Distance becomes negative"], 0, "The axis crossing marks a sign change in velocity.", hint),
    mc("Why does slope, rather than area, give acceleration?", ["Acceleration is the rate of change of velocity with time", "Area has the same unit as acceleration", "Slope ignores time", "Acceleration depends on position"], 0, "A rate comes from change over an interval.", hint),
    mc("Why does area, rather than slope, give displacement?", ["Displacement accumulates velocity over time", "Area has no unit", "Slope always stays positive", "Displacement ignores time"], 0, "Area combines how fast and for how long.", hint),
    mc("Why does constant velocity imply zero acceleration?", ["The graph has zero slope because the velocity is not changing", "The area is zero", "The graph must be below the axis", "The time axis stops"], 0, "Zero change in velocity means zero acceleration.", hint),
    mc("Why does a steeper slope mean a larger acceleration magnitude?", ["The velocity is changing more per second", "The graph is higher on the page", "The object has travelled farther", "The mass is smaller"], 0, "Acceleration depends on how quickly the velocity changes.", hint),
    mc("A horizontal line on the time axis itself means...", ["the object is at rest with zero velocity", "the object has constant positive velocity", "the object has large displacement", "the object has negative mass"], 0, "Zero height means zero velocity throughout that interval.", hint),
    mc("Why can a journey have zero net displacement even when the object moved a lot?", ["Positive and negative velocity-time areas can cancel", "Because the slope is always zero", "Because time can reverse", "Because velocity has no sign"], 0, "Signed areas can offset each other.", hint),
    mc("Why can a velocity-time graph go below the axis when a distance-time graph for total distance should not?", ["Velocity can be negative by sign convention, but total distance travelled does not decrease", "Because distance graphs use bigger units", "Because time is different in the two graphs", "Because area is always positive"], 0, "The two graphs represent different quantities.", hint),
    mc("Why is a triangle area valid for displacement on a sloping velocity-time section?", ["The changing velocity still occupies a measurable area under the graph", "Triangles only apply to force graphs", "Area is ignored when velocity changes", "The graph becomes a distance-time graph"], 0, "Displacement is still the area, whatever the shape.", hint),
    mc("Which expression is safest for average acceleration on one section?", ["change in velocity divided by change in time", "area divided by time", "velocity divided by mass", "distance divided by acceleration"], 0, "Average acceleration is a rate of velocity change.", hint),
    mc("What common mistake is F2_L4 designed to prevent?", ["Swapping the meanings of slope and area on a velocity-time graph", "Using metres for displacement", "Reading time from the x-axis", "Using positive and negative signs"], 0, "This is the main interpretation trap.", hint),
    mc("Why can a graph show positive velocity and negative acceleration at the same time?", ["The object can be moving in the positive direction while slowing down", "Because velocity and acceleration must always match signs", "Because one of the quantities must be zero", "Because time is negative"], 0, "Direction and change-of-direction are separate ideas.", hint),
    mc("Why does graph height at one instant not tell you displacement directly?", ["Height gives the velocity at that instant; displacement is built from the area over an interval", "Height has no unit", "Height only works when the graph is horizontal", "Displacement is always zero at one instant"], 0, "Instantaneous value and accumulated effect are different.", hint),
    mc("Which statement is true for a section with constant negative velocity?", ["The slope is zero but the area contribution is negative", "The slope is positive and the area is zero", "The slope is negative and the area is positive", "Both slope and area are zero"], 0, "Flat below the axis means constant negative velocity.", hint),
    mc("Why is time essential when comparing two equal velocity changes on different graph sections?", ["The shorter interval has the larger acceleration magnitude", "Equal velocity change always means equal acceleration", "Time does not affect slope", "Time only affects area"], 0, "Acceleration depends on how quickly the change happens.", hint),
    mc("Which lesson idea should stay visible in F2_L4?", ["Use slope for acceleration and area for displacement before making any conclusion from the graph", "Use graph height for every quantity", "Ignore the sign of regions below the axis", "Treat every straight line as zero displacement"], 0, "The lesson hinges on keeping the interpretations distinct.", hint),
    mc("Which statement best matches strong F2_L4 reasoning?", ["Choose the graph feature that matches the quantity: slope for acceleration, area for displacement, and height for instantaneous velocity", "Read only the graph height", "Read only the final point", "Ignore any region below the axis"], 0, "That keeps each graph feature tied to its own physical role.", hint),
  ];
}
function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Combine all the forces with direction before deciding what the object will do.";
  return [
    mc("Two forces of 4 N and 7 N both act to the right. What is the resultant force?", ["3 N right", "7 N right", "11 N right", "0 N"], 2, "Forces in the same direction add together.", hint),
    mc("14 N right and 9 N left act on a box. What is the resultant force?", ["5 N right", "5 N left", "23 N right", "0 N"], 0, "Subtract opposite forces and keep the direction of the larger side.", hint),
    mc("Equal opposite forces produce a resultant force of...", ["0 N", "the larger force", "double one force", "an unknown force"], 0, "Equal opposite forces cancel completely.", hint),
    mc("If a moving object has zero resultant force, what can it do?", ["keep moving at constant velocity", "speed up by itself", "reverse direction automatically", "lose its mass"], 0, "Zero resultant force means zero acceleration.", hint),
    mc("How are forces combined when they act in the same direction?", ["they subtract", "they add", "they always cancel", "they become mass"], 1, "Same-direction forces reinforce each other.", hint),
    mc("When opposite forces are unequal, the resultant points...", ["with the larger force", "with the smaller force", "in both directions at once", "nowhere because forces always cancel"], 0, "The leftover force points with the larger side.", hint),
    mc("Balanced forces mean...", ["zero resultant force", "the object must be moving", "the object must be at rest", "all forces are zero"], 0, "Balanced means the forces cancel overall.", hint),
    mc("A box has 9 N right, 5 N left, and 2 N right acting on it. What is the resultant force?", ["2 N right", "6 N right", "6 N left", "16 N right"], 1, "Add the rightward forces before comparing sides.", hint),
    mc("If the forces on an object are unbalanced, what must happen?", ["The object accelerates in the direction of the resultant force", "The object must already be moving", "Its mass must change", "Its velocity must instantly become zero"], 0, "A non-zero resultant force causes acceleration.", hint),
    mc("A car is moving right. Its driving force equals its resistive force. What happens next?", ["It keeps moving at constant velocity", "It must stop immediately", "It speeds up to the right", "It turns around"], 0, "Balanced forces give zero acceleration, not necessarily zero motion.", hint),
    mc("An object is at rest and the forces are balanced. What happens next?", ["It remains at rest", "It must start moving", "It accelerates in the larger-force direction", "Its mass doubles"], 0, "With zero resultant force, there is no acceleration.", hint),
    mc("What does 'resultant force' mean?", ["the net force after combining all the forces with direction", "the largest single force only", "the first force listed", "the same as mass"], 0, "Resultant force is the single overall effect of all the forces together.", hint),
    shortCases([
      { prompt: "6 N left and 6 N right act on a trolley. What is the resultant force?", acceptedAnswers: forceScalarAnswers(0), hint: "Equal opposite forces cancel completely." },
      { prompt: "12 N right and 3 N left act on a trolley. What is the resultant force?", acceptedAnswers: forceDirectionalAnswers(9, "right"), hint: "Subtract the opposite forces and keep the larger direction." },
      { prompt: "Forces that are equal and opposite are called ... forces.", acceptedAnswers: words("balanced", "balanced forces"), hint: "This word means the overall force is zero." },
      { prompt: "10 N right, 4 N left, and 1 N left act on a box. What is the resultant force?", acceptedAnswers: forceDirectionalAnswers(5, "right"), hint: "Compare the total rightward and total leftward forces." },
      { prompt: "If the resultant force is zero, the acceleration is ...", acceptedAnswers: words("0", "zero", "0 m/s^2", "0 m/s/s"), hint: "Zero resultant force means no change in velocity." },
      { prompt: "5 N left and 5 N left act together. What is the resultant force?", acceptedAnswers: forceDirectionalAnswers(10, "left"), hint: "Same-direction forces add together." },
      { prompt: "3 N right and 4 N right act together. What is the resultant force?", acceptedAnswers: forceDirectionalAnswers(7, "right"), hint: "Add same-direction forces." },
      { prompt: "A non-zero resultant force causes ...", acceptedAnswers: words("acceleration", "an acceleration"), hint: "This is the motion change caused by an unbalanced force." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep 'zero resultant', 'balanced forces', and 'motion state' separate before you judge what happens.";
  return [
    mc("Why can balanced forces still allow motion?", ["Zero resultant force means zero acceleration, so existing constant velocity can continue", "Balanced forces automatically stop motion", "Balanced forces remove all forces from the object", "Balanced forces create negative mass"], 0, "No acceleration does not mean no motion.", hint),
    mc("Why does a non-zero resultant force matter more than the largest individual force?", ["Acceleration depends on the overall combined force after directions are accounted for", "The largest force always decides alone", "Individual forces have no units", "Only friction affects motion"], 0, "Resultant force is the force that drives the motion change.", hint),
    mc("Why is 'moving object = force in the direction of motion' a weak rule?", ["An object can keep moving at constant velocity with zero resultant force", "Motion is impossible without force", "Forces only matter when the object is at rest", "Every moving object must accelerate"], 0, "The rule confuses motion with acceleration.", hint),
    mc("Which statement is always true for balanced forces?", ["The resultant force is zero", "The object is at rest", "No forces are acting", "The object has zero speed"], 0, "Balanced means the forces cancel overall.", hint),
    mc("Why must opposite forces be subtracted rather than added?", ["They act in opposite directions, so one reduces the effect of the other", "Because subtraction gives bigger numbers", "Because opposite forces have no unit", "Because addition is only for masses"], 0, "Direction controls whether forces reinforce or oppose.", hint),
    mc("Why can friction and driving force create a constant-speed motion state?", ["They can balance so the resultant force becomes zero", "Because friction always speeds objects up", "Because driving force cancels mass", "Because constant speed needs positive acceleration"], 0, "Balanced opposing forces remove acceleration.", hint),
    mc("Why is zero resultant force not the same as zero forces present?", ["Several forces can act but cancel overall", "Zero resultant means there are no interactions at all", "Zero resultant only happens in a vacuum", "Zero resultant means the object has zero mass"], 0, "Cancellation is different from absence.", hint),
    mc("If the resultant force points left while the object is moving right, what is the safest conclusion?", ["The object accelerates left, so its rightward speed decreases", "The object must instantly move left", "The resultant force is zero", "The object has no displacement"], 0, "Acceleration follows the resultant, even if motion initially points the other way.", hint),
    mc("Why is the direction of the resultant force important?", ["Acceleration points in the direction of the resultant force", "Direction only matters for displacement", "Resultant force has no sign", "Direction matters only when forces are equal"], 0, "The direction tells you which way velocity will change.", hint),
    mc("Why can a moving car remain in equilibrium?", ["Its forward and resistive forces can balance to zero resultant force", "Equilibrium only means being at rest", "A moving car cannot have balanced forces", "Mass cancels all forces in motion"], 0, "Equilibrium in this lesson means zero resultant force.", hint),
    mc("What common mistake is F2_L5 designed to prevent?", ["Confusing balanced forces with 'no motion' instead of 'no acceleration'", "Thinking newtons are units of mass", "Thinking time is a vector", "Swapping graph slope and area"], 0, "This is the main force-motion trap.", hint),
    mc("Why do same-direction forces add?", ["They reinforce the motion change in the same direction", "They become balanced automatically", "They remove acceleration", "They change into displacement"], 0, "Same-direction pushes or pulls combine into a larger overall force.", hint),
    mc("Which statement best matches resultant-force reasoning?", ["Combine every force with direction first, then decide whether a leftover force remains", "Choose the largest force and ignore the rest", "Average the force numbers without signs", "Use only the force in the direction of motion"], 0, "The combination step is the key part of the lesson.", hint),
    mc("If three forces act and two almost cancel the third, what decides the acceleration?", ["The small leftover resultant after all three are combined", "The biggest force by itself", "The average of the three forces", "The direction of motion only"], 0, "A small non-zero resultant still causes acceleration.", hint),
    mc("Why is an unbalanced-force diagram stronger than a label-only statement such as 'it speeds up'?", ["It shows which forces were compared and why a leftover resultant exists", "It removes the need for units", "It proves the speed numerically", "It turns force into energy"], 0, "The force comparison is the mechanism behind the motion change.", hint),
    mc("Which statement about equilibrium is correct?", ["It means zero resultant force, so velocity stays constant if the object is already moving", "It means the object must be stationary", "It means only one force is present", "It means acceleration is large"], 0, "Equilibrium is a zero-resultant condition.", hint),
    mc("Why can a smaller force still matter in a force diagram?", ["It contributes to the combined net force even if it is not the largest force", "Smaller forces are ignored in physics", "Only the first force listed matters", "Small forces change units"], 0, "Every force contributes to the resultant.", hint),
    mc("If the forward force doubles while the resistive force stays the same, what changes first in the model?", ["The resultant force becomes larger forward", "The object must instantly reach constant speed", "The resistive force disappears", "The mass becomes smaller"], 0, "The first check is the new net force, not the final motion label.", hint),
    mc("Which lesson idea should stay visible in F2_L5?", ["Motion changes because of the resultant force, not because motion itself 'uses up' force", "Any motion proves an unbalanced force", "Balanced forces remove all forces", "The biggest force alone always decides"], 0, "That is the module's key force principle.", hint),
    mc("Which statement best matches strong F2_L5 reasoning?", ["Ask whether the forces balance to zero or leave a resultant, then link that resultant to acceleration", "Ask only whether the object is moving", "Ask only which force is largest", "Ignore the directions and compare magnitudes only"], 0, "That keeps the force comparison tied to the correct motion consequence.", hint),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use the resultant force, compare it with the mass, and keep the proportion visible.";
  return [
    mc("Which force should be used in F = ma?", ["the resultant force", "the smallest force only", "the friction force only", "the first force listed"], 0, "The equation uses the net force after all forces are combined.", hint),
    mc("An 18 N resultant force acts on a 6 kg trolley. What is the acceleration?", ["2 m/s^2", "3 m/s^2", "6 m/s^2", "18 m/s^2"], 1, "Use a = F / m.", hint),
    mc("A 4 kg trolley accelerates at 2.5 m/s^2. What resultant force acts on it?", ["6 N", "8 N", "10 N", "12 N"], 2, "Use F = ma.", hint),
    mc("The same resultant force acts on two trolleys. Which one accelerates more?", ["the smaller-mass trolley", "the larger-mass trolley", "both equally", "neither trolley"], 0, "For the same force, a smaller mass gives a larger acceleration.", hint),
    mc("If mass doubles while the same resultant force acts, the acceleration...", ["doubles", "halves", "stays the same", "becomes zero"], 1, "Acceleration is inversely related to mass when force is fixed.", hint),
    mc("If the resultant force doubles while the mass stays the same, the acceleration...", ["doubles", "halves", "stays the same", "becomes zero"], 0, "Acceleration is directly proportional to force for fixed mass.", hint),
    mc("If both the resultant force and the mass double, the acceleration...", ["doubles", "halves", "stays the same", "must become negative"], 2, "The ratio F / m stays unchanged.", hint),
    mc("What does inertia describe?", ["resistance to changes in motion", "the force that keeps objects moving", "the area under a graph", "the unit of acceleration"], 0, "Inertia is a property of matter, not an extra force.", hint),
    mc("Why is a heavier trolley harder to accelerate with the same push?", ["A larger mass gives more inertia, so the same force gives less acceleration", "A larger mass removes the force", "Heavier trolleys cannot move", "A larger mass changes the unit of force"], 0, "Greater mass means more resistance to motion change.", hint),
    mc("If the same acceleration is required and the mass doubles, the resultant force must...", ["double", "halve", "stay the same", "become zero"], 0, "Use F = ma and keep a fixed.", hint),
    mc("If the resultant force is zero, the acceleration is...", ["positive", "negative", "zero", "undefined"], 2, "Zero resultant force gives zero acceleration.", hint),
    mc("A 30 N resultant force acts on a 10 kg object. What is the acceleration?", ["2 m/s^2", "3 m/s^2", "10 m/s^2", "30 m/s^2"], 1, "Use a = F / m.", hint),
    shortCases([
      { prompt: "A 14 N resultant force acts on a 7 kg trolley. What is the acceleration?", acceptedAnswers: accelerationAnswers(2), hint: "Use a = F / m." },
      { prompt: "A 3 kg trolley accelerates at 4 m/s^2. What resultant force acts on it?", acceptedAnswers: forceScalarAnswers(12), hint: "Use F = ma." },
      { prompt: "If the same force acts on a trolley with three times the mass, the acceleration becomes ... of the original.", acceptedAnswers: words("one-third", "1/3", "a third", "one third"), hint: "For fixed force, acceleration is inversely proportional to mass." },
      { prompt: "The property that resists changes in motion is called ...", acceptedAnswers: words("inertia", "the inertia"), hint: "This is the mass-linked resistance to acceleration." },
      { prompt: "If the resultant force doubles while mass stays fixed, the acceleration ...", acceptedAnswers: words("doubles", "double"), hint: "Force and acceleration change in the same ratio for fixed mass." },
      { prompt: "If the mass doubles while the same resultant force acts, the acceleration ...", acceptedAnswers: words("halves", "half", "is halved"), hint: "Mass and acceleration change in opposite ratios for fixed force." },
      { prompt: "If the resultant force is zero, the acceleration is ...", acceptedAnswers: words("0", "zero", "0 m/s^2", "0 m/s/s"), hint: "No net force means no acceleration." },
      { prompt: "Write the equation linking resultant force, mass, and acceleration.", acceptedAnswers: words("f = ma", "f=ma"), hint: "This is Newton's second-law relation in compact form." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep the net force, the mass, and the acceleration in one proportional story.";
  return [
    mc("Why must the resultant force be used in F = ma rather than any one force from the diagram?", ["Acceleration depends on the overall combined force after all directions are accounted for", "Because individual forces have no unit", "Because the largest force is always irrelevant", "Because mass cancels all other forces"], 0, "Net force is the force that drives the motion change.", hint),
    mc("Which statement best describes the relationship in F = ma?", ["Acceleration is proportional to resultant force and inversely proportional to mass", "Acceleration is proportional to mass and inversely proportional to force", "Force is proportional to time only", "Mass depends on acceleration"], 0, "The equation is a force-to-mass ratio story.", hint),
    mc("Why does the same push produce less acceleration in a heavier trolley?", ["A larger mass gives more inertia, so the same force is spread over more mass", "Because heavy objects cannot move", "Because the force becomes smaller", "Because time stops"], 0, "Mass resists changes in motion.", hint),
    mc("Why does constant-velocity motion not need a continued non-zero resultant force?", ["Zero resultant force already gives zero acceleration, which is enough to keep velocity unchanged", "Motion uses up force", "Objects stop unless force is always added", "Resultant force equals speed"], 0, "This lesson corrects the 'force is needed to keep moving' misconception.", hint),
    mc("Why is inertia linked to mass rather than to speed?", ["Mass measures resistance to changing motion, while speed only tells the current motion state", "Speed causes all resistance", "Inertia is a force", "Inertia only matters when stationary"], 0, "Mass is the object property in this law.", hint),
    mc("If the forces balance to zero, what does F = ma imply?", ["Acceleration is zero", "Mass is zero", "Velocity is zero", "Time is zero"], 0, "Zero net force means zero acceleration.", hint),
    mc("Why is a larger resultant force needed to give the same acceleration to a larger mass?", ["Because F = ma says force must rise in proportion to mass when acceleration is fixed", "Because mass removes direction", "Because acceleration changes unit", "Because inertia disappears"], 0, "Same acceleration with more mass needs more force.", hint),
    mc("Why is it weak to substitute one named force into F = ma before combining the force diagram?", ["The chosen force may not equal the net force that actually causes the acceleration", "Because named forces have no size", "Because the equation works only for friction", "Because mass should be combined first"], 0, "The diagram must be reduced to a resultant first.", hint),
    mc("Why can two objects under the same resultant force have different accelerations?", ["Different masses give different force-to-mass ratios", "Acceleration ignores mass", "The same force always gives the same acceleration", "Their units must be different"], 0, "Mass is the second part of the law.", hint),
    mc("If two objects have the same mass but different resultant forces, what decides which accelerates more?", ["The one with the larger resultant force", "The one with the larger volume", "The one with the smaller speed", "The one with the longer time"], 0, "With equal mass, acceleration tracks force directly.", hint),
    mc("What does a negative acceleration in a signed axis system tell you in F = ma problems?", ["The resultant force points in the chosen negative direction", "The mass is negative", "The object must be slowing down", "The force is zero"], 0, "The sign tracks direction relative to the chosen axis.", hint),
    mc("Why is N = kg m/s^2 a useful unit link for this lesson?", ["It shows that force is the mass-acceleration combination named as a newton", "It proves mass and force are the same quantity", "It removes the need for equations", "It means acceleration is measured in newtons"], 0, "The unit relation is the unit form of F = ma.", hint),
    mc("What common mistake is F2_L6 designed to prevent?", ["Using force as if it were needed to keep steady motion instead of to cause acceleration", "Using kilograms for mass", "Using seconds for time", "Reading graph slope as speed"], 0, "This is the Newton's-law misconception being targeted.", hint),
    mc("Why is it wrong to say that a heavy object must always move more slowly than a light one?", ["Mass controls how strongly a given force changes velocity, not the current speed by itself", "Heavy objects cannot move", "Speed and mass are the same quantity", "Mass fixes the direction of motion"], 0, "F = ma is about acceleration, not an object's present speed.", hint),
    mc("Which direction does the acceleration point in this lesson model?", ["In the same direction as the resultant force", "Always in the direction of motion", "Always opposite to the motion", "Always upward"], 0, "Acceleration follows the net force.", hint),
    mc("If the resultant force doubles and the mass triples, what happens to the acceleration?", ["It becomes two-thirds of the original", "It doubles", "It triples", "It halves"], 0, "Use the ratio change in F / m.", hint),
    mc("Why can zero acceleration still occur when several forces act?", ["Those forces can cancel to zero resultant force", "Several forces always produce acceleration", "Zero acceleration requires vacuum only", "Only one force may act when acceleration is zero"], 0, "Cancellation, not absence, is the key idea.", hint),
    mc("Why is 'bigger force means bigger acceleration' incomplete on its own?", ["The mass must also be considered because the same force affects different masses differently", "Because force has no unit", "Because acceleration depends only on time", "Because bigger forces always mean bigger speed"], 0, "F2_L6 needs force and mass together.", hint),
    mc("Which lesson idea should stay visible in F2_L6?", ["Motion changes according to the force-to-mass ratio, and the force in that ratio is the resultant force", "Mass alone sets acceleration", "Any single force can be used in F = ma", "Constant velocity needs a positive resultant force"], 0, "That is the main conceptual rule of the lesson.", hint),
    mc("Which statement best matches strong F2_L6 reasoning?", ["Combine the forces to a resultant, compare that resultant with the mass, and then infer the acceleration", "Use the largest force and ignore the rest", "Look only at the mass", "Look only at whether the object is already moving"], 0, "That sequence protects the full Newton's-law meaning.", hint),
  ];
}

const F2_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F2_L1: l1DiagnosticRaw,
  F2_L2: l2DiagnosticRaw,
  F2_L3: l3DiagnosticRaw,
  F2_L4: l4DiagnosticRaw,
  F2_L5: l5DiagnosticRaw,
  F2_L6: l6DiagnosticRaw,
};

const F2_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F2_L1: l1ConceptRaw,
  F2_L2: l2ConceptRaw,
  F2_L3: l3ConceptRaw,
  F2_L4: l4ConceptRaw,
  F2_L5: l5ConceptRaw,
  F2_L6: l6ConceptRaw,
};

const F2_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(F2_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...F2_DIAGNOSTIC_BUILDERS[code](), ...F2_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function f2GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F2_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function f2GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F2_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function f2GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F2_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
