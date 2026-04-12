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
    throw new Error(`M1 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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
  return mergeAnswers(numericAnswers(value, "m/s"), numericAnswers(value, "ms^-1"), numericAnswers(value, "m s^-1"));
}

function accelerationAnswers(value: number): string[] {
  return mergeAnswers(
    numericAnswers(value, "m/s^2"),
    numericAnswers(value, "m/s2"),
    numericAnswers(value, "ms^-2"),
    numericAnswers(value, "m s^-2"),
  );
}

function distanceAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "m"), numericAnswers(value, "metres"), numericAnswers(value, "meters"));
}

function averageSpeedAnswers(value: number): string[] {
  return speedAnswers(value);
}

function formulaAnswers(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep graph height as distance and graph gradient as speed.";
  return [
    mc("On a distance-time graph, what does a horizontal segment mean?", ["the object is stationary", "the object is accelerating", "the object is moving fastest", "the object has returned to the start"], 0, "A flat line means time changes while distance stays constant.", hint),
    mc("Which distance-time graph segment represents the greatest speed?", ["the steepest segment", "the highest segment", "the longest segment", "the segment closest to the axis"], 0, "On a distance-time graph, steeper gradient means greater speed.", hint),
    mc("A runner covers 18 m in 6 s at constant speed. What is the speed?", ["2 m/s", "3 m/s", "6 m/s", "12 m/s"], 1, "Speed = distance / time = 18 / 6 = 3 m/s.", hint),
    mc("A cart travels 30 m in 10 s overall. What is the average speed?", ["2 m/s", "3 m/s", "4 m/s", "5 m/s"], 1, "Average speed = total distance / total time = 30 / 10.", hint),
    mc("Two distance-time graphs finish at the same distance after the same time. What must be true?", ["They show the same motion throughout", "They have the same average speed", "They must have the same steepest section", "They must contain the same pause"], 1, "Same total distance in the same total time guarantees the same average speed, not the same story.", hint),
    mc("What are the units of the gradient of a distance-time graph?", ["m", "s", "m/s", "m/s^2"], 2, "Gradient = distance / time, so the units are m/s.", hint),
    mc("A straight sloping line on a distance-time graph shows...", ["constant speed", "constant acceleration", "zero speed", "changing average speed only"], 0, "A constant gradient on a distance-time graph means constant speed.", hint),
    mc("A curved distance-time graph that gets steeper with time shows...", ["speed decreasing", "speed increasing", "distance staying constant", "time stopping"], 1, "The growing gradient shows increasing speed.", hint),
    mc("On a distance-time graph, the vertical axis represents...", ["speed", "distance", "time", "acceleration"], 1, "The y-axis is the distance axis.", hint),
    mc("Why is a distance-time graph not a picture of the route taken?", ["Because the graph shows how distance changes with time", "Because graphs can only show straight lines", "Because distance never changes on a route", "Because time is not needed in motion"], 0, "The graph is a relationship plot, not a map view.", hint),
    mc("A cyclist travels 12 m in 4 s. A walker travels 12 m in 6 s. Who is faster?", ["the walker", "they have the same speed", "the cyclist", "not enough information"], 2, "Covering the same distance in less time means greater speed.", hint),
    mc("What does the gradient of a steeper straight line mean compared with a shallower straight line on the same distance-time axes?", ["greater acceleration", "greater speed", "greater time", "greater mass"], 1, "Same axes means the steeper distance-time line corresponds to a greater speed.", hint),
    shortCases([
      { prompt: "A car covers 24 m in 8 s at constant speed. Find its speed.", acceptedAnswers: speedAnswers(3), hint },
      { prompt: "Write the motion meaning of a flat section on a distance-time graph.", acceptedAnswers: words("stationary", "stopped", "at rest"), hint },
      { prompt: "What physical quantity is given by the gradient of a distance-time graph?", acceptedAnswers: words("speed"), hint },
      { prompt: "If an object covers 10 m every 2 s, what is its speed?", acceptedAnswers: speedAnswers(5), hint },
      { prompt: "A journey covers 50 m in 10 s overall. Find the average speed.", acceptedAnswers: averageSpeedAnswers(5), hint },
      { prompt: "Which quantity is plotted on the vertical axis of a distance-time graph?", acceptedAnswers: words("distance"), hint },
      { prompt: "Which quantity is plotted on the horizontal axis of a distance-time graph?", acceptedAnswers: words("time"), hint },
      { prompt: "If the graph gets steeper as time goes on, is the object speeding up or slowing down?", acceptedAnswers: words("speeding up", "faster", "increasing speed"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Use distance-time graphs to reason from axes, gradient, and total distance over total time.";
  return [
    mc("Why does a pause appear as a horizontal section on a distance-time graph?", ["Because time still passes while distance stays unchanged", "Because the object has zero mass", "Because the graph must always flatten in the middle", "Because the route becomes horizontal"], 0, "A pause keeps distance fixed even though time continues.", hint),
    mc("Why can two journeys end at the same point and time but still have different distance-time graphs?", ["Because the speed history can differ during the journey", "Because the axes change automatically", "Because the distance-time graph ignores time", "Because the route shape must be identical"], 0, "The graphs can differ whenever the motion story differs.", hint),
    mc("Why is the gradient more important than the line's drawn length when reading speed from a distance-time graph?", ["Because speed depends on distance change per time change", "Because long lines always mean more speed", "Because graph paper changes the physics", "Because only horizontal lines have physical meaning"], 0, "Speed comes from rise over run on the axes.", hint),
    mc("Why does a straight sloping line imply constant speed?", ["Because equal time intervals give equal distance increases", "Because the object is always accelerating equally", "Because the line is drawn neatly", "Because average speed and instantaneous speed must be zero"], 0, "A constant gradient means the same speed at every moment.", hint),
    mc("Why is average speed for a whole journey found from total distance divided by total time?", ["Because it measures the overall rate for the full journey", "Because it uses only the fastest part", "Because pauses are ignored by definition", "Because graphs cannot show totals"], 0, "Average speed is an overall journey quantity.", hint),
    mc("What is the strongest reason a curved distance-time graph signals changing speed?", ["Its gradient changes from point to point", "Its vertical axis stops meaning distance", "Its time axis becomes unreliable", "Its total distance must be zero"], 0, "Changing gradient means changing speed.", hint),
    mc("Why does a higher point on a distance-time graph not automatically mean a higher speed?", ["Because height gives distance, not gradient", "Because higher points always mean lower speed", "Because speed only exists at the start", "Because graphs cannot compare points"], 0, "The y-value and the gradient do different jobs.", hint),
    mc("Why should a distance-time graph not be read as the shape of the path through space?", ["Because the graph tracks one changing quantity against time", "Because objects never move in space", "Because only maps have axes", "Because distance cannot be graphed"], 0, "A distance-time graph is a time plot, not a route drawing.", hint),
    mc("Why can a long horizontal section reduce average speed even though the moving parts may be quick?", ["Because the total time increases while distance does not", "Because horizontal sections add extra distance", "Because pauses make gradient infinite", "Because motion stops counting once a pause happens"], 0, "Average speed depends on the whole journey, including pauses.", hint),
    mc("Why is the y-intercept of a distance-time graph physically meaningful?", ["It shows the starting distance at time zero", "It always shows the maximum speed", "It gives the acceleration", "It tells you the total time"], 0, "The intercept shows the initial condition on the distance axis.", hint),
    mc("Why must units be checked when reading a distance-time gradient?", ["Because the rate should come out as distance per time", "Because units are decoration only", "Because gradient has no units on graphs", "Because distance-time graphs always use km/h"], 0, "Units confirm that the interpretation is speed.", hint),
    mc("What does the statement 'same final distance' fail to tell you by itself?", ["how the speed changed during the journey", "whether time was measured", "whether the graph has axes", "whether the object moved at all"], 0, "It hides the motion pattern between start and finish.", hint),
    shortCases([
      { prompt: "A distance-time graph is a plot of ... against time.", acceptedAnswers: words("distance"), hint },
      { prompt: "Equal distance gained in equal time intervals means ... speed.", acceptedAnswers: words("constant", "steady"), hint },
      { prompt: "Average speed uses total distance divided by total ...", acceptedAnswers: words("time"), hint },
      { prompt: "A changing gradient on a distance-time graph means changing ...", acceptedAnswers: words("speed"), hint },
      { prompt: "Graph height on a distance-time graph gives ... from the start.", acceptedAnswers: words("distance"), hint },
      { prompt: "A pause lowers average speed because it adds time but no extra ...", acceptedAnswers: words("distance"), hint },
      { prompt: "The start value on a distance-time graph is read from the ...-intercept.", acceptedAnswers: words("y", "vertical"), hint },
      { prompt: "To compare two distance-time journeys properly, keep route shape separate from graph ...", acceptedAnswers: words("shape", "form"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "On a speed-time graph, height gives speed and gradient gives acceleration.";
  return [
    mc("A horizontal speed-time line at 12 m/s means...", ["speed is increasing", "speed is constant at 12 m/s", "acceleration is 12 m/s^2", "the object is stationary"], 1, "A flat line at non-zero height means constant speed.", hint),
    mc("What does the vertical axis show on a speed-time graph?", ["distance", "time", "speed", "acceleration"], 2, "The y-axis is the speed axis.", hint),
    mc("What does the gradient of a speed-time graph represent?", ["distance", "speed", "acceleration", "mass"], 2, "Gradient on speed-time means change of speed per time.", hint),
    mc("A speed increases from 4 m/s to 10 m/s in 3 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "14 m/s^2"], 1, "Acceleration = (10 - 4) / 3 = 2 m/s^2.", hint),
    mc("A speed falls from 16 m/s to 4 m/s in 4 s. What is the acceleration?", ["-3 m/s^2", "-4 m/s^2", "3 m/s^2", "5 m/s^2"], 0, "Acceleration = (4 - 16) / 4 = -3 m/s^2.", hint),
    mc("A horizontal line on the time axis of a speed-time graph means...", ["constant non-zero speed", "zero speed throughout", "constant acceleration", "distance increasing steadily"], 1, "The height is zero, so the speed is zero.", hint),
    mc("Two speed-time lines end at the same speed. What can still be different?", ["their acceleration", "their final speed", "their final time", "their axes"], 0, "Different gradients can still lead to the same final speed.", hint),
    mc("A straight line rising on a speed-time graph shows...", ["constant positive acceleration", "constant negative acceleration", "constant speed", "zero acceleration"], 0, "A constant positive gradient means constant positive acceleration.", hint),
    mc("A straight line falling on a speed-time graph shows...", ["constant positive acceleration", "constant speed", "constant negative acceleration", "distance constant"], 2, "A negative straight-line gradient means constant negative acceleration.", hint),
    mc("Which feature determines the speed at a particular instant on a speed-time graph?", ["the graph height", "the graph width", "the graph area", "the number of segments"], 0, "Read instantaneous speed from the y-value.", hint),
    mc("Which feature determines whether acceleration is positive, negative, or zero?", ["the sign of the gradient", "the final speed only", "the line colour", "the total time only"], 0, "Acceleration sign comes from the slope direction.", hint),
    mc("A speed-time graph curves upward so the line gets steeper. What does that suggest?", ["constant acceleration", "increasing acceleration", "zero acceleration", "stationary motion"], 1, "A changing and increasing gradient suggests acceleration is increasing.", hint),
    shortCases([
      { prompt: "A line stays at 7 m/s for the whole graph. What is the speed?", acceptedAnswers: speedAnswers(7), hint },
      { prompt: "A speed rises from 0 m/s to 20 m/s in 5 s. Find the acceleration.", acceptedAnswers: accelerationAnswers(4), hint },
      { prompt: "What does zero gradient mean on a speed-time graph?", acceptedAnswers: words("zero acceleration", "constant speed"), hint },
      { prompt: "A speed drops from 15 m/s to 9 m/s in 3 s. Find the acceleration.", acceptedAnswers: accelerationAnswers(-2), hint },
      { prompt: "Which quantity is plotted on the horizontal axis of a speed-time graph?", acceptedAnswers: words("time"), hint },
      { prompt: "A body moves at constant speed 5 m/s. What is its acceleration?", acceptedAnswers: accelerationAnswers(0), hint },
      { prompt: "If the line rises as time increases, is the speed increasing or decreasing?", acceptedAnswers: words("increasing", "speed increasing", "getting faster"), hint },
      { prompt: "Which physical quantity is read from the graph height on a speed-time graph?", acceptedAnswers: words("speed"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Do not collapse graph height and graph gradient into the same idea.";
  return [
    mc("Why is a horizontal line at 12 m/s not a sign of zero motion?", ["Because the object still has speed even though acceleration is zero", "Because all horizontal lines mean motion is impossible", "Because gradient equals distance", "Because time has stopped"], 0, "Zero gradient here means no change of speed, not zero speed.", hint),
    mc("Why can two objects share the same final speed but have different accelerations?", ["Because acceleration depends on how quickly the speed changed", "Because final speed fixes acceleration automatically", "Because acceleration depends only on mass", "Because speed-time graphs do not show acceleration"], 0, "Same end value does not guarantee the same gradient.", hint),
    mc("Why is a speed-time graph better than a distance-time graph for reading acceleration directly?", ["Because its gradient is acceleration", "Because its area is acceleration", "Because its height is acceleration", "Because it ignores time"], 0, "The axes make the slope an acceleration directly.", hint),
    mc("Why does a downward line on a speed-time graph not necessarily mean the object is moving backward?", ["Because the graph is showing speed reducing, not direction reversal", "Because any downward line means negative distance", "Because speed-time graphs cannot show motion", "Because the object must be stationary"], 0, "The line shows a falling speed value, not a spatial route.", hint),
    mc("Why must height and slope be kept separate on a speed-time graph?", ["Because height gives current speed while slope gives rate of change of speed", "Because both always mean the same thing", "Because slope gives time and height gives distance", "Because only the area matters"], 0, "The graph carries two different pieces of information.", hint),
    mc("Why can a body have zero acceleration while still moving?", ["Because zero acceleration means speed is not changing", "Because acceleration and speed are identical", "Because zero acceleration means zero time", "Because all moving bodies accelerate"], 0, "Constant non-zero speed is a standard case.", hint),
    mc("Why does the y-intercept of a speed-time graph matter physically?", ["It gives the initial speed at time zero", "It gives the total distance travelled", "It gives the graph area", "It gives the final acceleration"], 0, "Intercepts show starting conditions.", hint),
    mc("Why does a curved speed-time graph suggest acceleration is not constant?", ["Because the gradient changes from point to point", "Because the axes swap during the graph", "Because curved lines mean the graph is invalid", "Because speed has no units"], 0, "Non-constant gradient means non-constant acceleration.", hint),
    mc("Why is it unsafe to describe acceleration from the final speed alone?", ["Because acceleration is a change over time, not a single speed value", "Because final speed is never measurable", "Because acceleration uses distance only", "Because the starting speed never matters"], 0, "You need a before-after-time comparison.", hint),
    mc("Why is a line on the time axis a special case?", ["Because it represents zero speed for every moment shown", "Because it represents maximum acceleration", "Because it means time is negative", "Because it cannot happen physically"], 0, "Height zero means speed zero.", hint),
    mc("Why do units help protect the meaning of the gradient on a speed-time graph?", ["Because speed divided by time gives acceleration units", "Because units are irrelevant once the graph is drawn", "Because gradient must be unitless", "Because only area has units"], 0, "The units confirm the gradient's interpretation.", hint),
    mc("Which misunderstanding does the lesson most need to prevent on a speed-time graph?", ["thinking line height and line slope both mean speed", "thinking time is on the horizontal axis", "thinking speed can be measured", "thinking graphs can compare motion"], 0, "This is the central contrast for the lesson.", hint),
    shortCases([
      { prompt: "On a speed-time graph, graph height tells the current ...", acceptedAnswers: words("speed"), hint },
      { prompt: "On a speed-time graph, graph gradient tells the ...", acceptedAnswers: words("acceleration"), hint },
      { prompt: "A flat speed-time line above zero means ... speed.", acceptedAnswers: words("constant", "steady"), hint },
      { prompt: "Acceleration depends on change in speed per unit ...", acceptedAnswers: words("time"), hint },
      { prompt: "A curved speed-time graph points to ... acceleration.", acceptedAnswers: words("changing", "non-constant", "variable"), hint },
      { prompt: "The start value on a speed-time graph is the initial ...", acceptedAnswers: words("speed"), hint },
      { prompt: "A line on the time axis shows the body is ...", acceptedAnswers: words("stationary", "stopped", "at rest"), hint },
      { prompt: "The strongest way to stop confusion here is to keep line height separate from line ...", acceptedAnswers: words("gradient", "slope"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use signed velocity change over time, not vague faster-or-slower language.";
  return [
    mc("Which equation defines acceleration for one-dimensional motion?", ["a = vt", "a = (v - u) / t", "a = s / t", "a = uv"], 1, "Acceleration is change in velocity divided by time.", hint),
    mc("Velocity changes from +2 m/s to +14 m/s in 4 s. What is the acceleration?", ["+2 m/s^2", "+3 m/s^2", "+4 m/s^2", "-3 m/s^2"], 1, "Acceleration = (14 - 2) / 4 = +3 m/s^2.", hint),
    mc("Velocity changes from +10 m/s to +4 m/s in 3 s. What is the acceleration?", ["-2 m/s^2", "+2 m/s^2", "-6 m/s^2", "+6 m/s^2"], 0, "Acceleration = (4 - 10) / 3 = -2 m/s^2.", hint),
    mc("Velocity changes from -12 m/s to -3 m/s in 3 s. What is the acceleration?", ["-3 m/s^2", "+3 m/s^2", "-5 m/s^2", "+5 m/s^2"], 1, "Acceleration = (-3 - -12) / 3 = +3 m/s^2.", hint),
    mc("Velocity changes from -5 m/s to -11 m/s in 2 s. What is the acceleration?", ["+3 m/s^2", "-3 m/s^2", "+8 m/s^2", "-8 m/s^2"], 1, "Acceleration = (-11 - -5) / 2 = -3 m/s^2.", hint),
    mc("If east is chosen as positive, an object moving west and slowing down has acceleration...", ["westward and negative", "eastward and positive", "zero", "impossible to tell"], 1, "Slowing while moving negative means acceleration points positive.", hint),
    mc("If east is chosen as positive, an object moving east and speeding up has acceleration...", ["negative", "positive", "zero", "always westward"], 1, "Speeding up in the positive direction gives positive acceleration.", hint),
    mc("Can an object have negative velocity and positive acceleration?", ["yes", "no", "only at zero speed", "only if time is negative"], 0, "That happens when it moves in the negative direction but slows down.", hint),
    mc("What does zero acceleration mean?", ["velocity is zero", "velocity is constant", "distance is zero", "time is zero"], 1, "Zero acceleration means no change in velocity.", hint),
    mc("Velocity changes from +6 m/s to -2 m/s in 4 s. What is the acceleration?", ["-2 m/s^2", "+2 m/s^2", "-8 m/s^2", "+8 m/s^2"], 0, "Acceleration = (-2 - 6) / 4 = -2 m/s^2.", hint),
    mc("Which statement is always needed before using signs in velocity and acceleration?", ["choose a positive direction", "choose a graph colour", "choose the mass", "choose a route shape"], 0, "The sign convention must be stated first.", hint),
    mc("Acceleration is best described here as...", ["how quickly speed changes only", "change in velocity per unit time", "distance travelled every second", "the same as force"], 1, "Velocity includes direction, which is why signs matter.", hint),
    shortCases([
      { prompt: "Write the SI unit of acceleration.", acceptedAnswers: words("m/s^2", "m/s2", "ms^-2", "m s^-2"), hint },
      { prompt: "Velocity changes from +8 m/s to 0 m/s in 4 s. Find the acceleration.", acceptedAnswers: accelerationAnswers(-2), hint },
      { prompt: "Velocity changes from -4 m/s to +2 m/s in 3 s. Find the acceleration.", acceptedAnswers: accelerationAnswers(2), hint },
      { prompt: "If velocity does not change, acceleration is ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "Before attaching signs to velocity, define a positive ...", acceptedAnswers: words("direction"), hint },
      { prompt: "A body moving negative and slowing down must have ... acceleration.", acceptedAnswers: words("positive"), hint },
      { prompt: "Acceleration is the rate of change of ...", acceptedAnswers: words("velocity"), hint },
      { prompt: "Velocity changing from +9 m/s to +3 m/s in 3 s gives acceleration ...", acceptedAnswers: accelerationAnswers(-2), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Acceleration is signed velocity change per time, not just a loose idea of getting faster.";
  return [
    mc("Why is 'acceleration means speeding up' too weak a definition?", ["Because acceleration can also mean slowing down or changing direction", "Because acceleration never changes speed", "Because acceleration only happens at rest", "Because acceleration is the same as distance"], 0, "Acceleration tracks velocity change, not just increases in speed.", hint),
    mc("Why must velocity be used instead of speed in the acceleration equation?", ["Because direction matters in the change", "Because speed has no units", "Because speed cannot be measured", "Because velocity is always bigger than speed"], 0, "Sign and direction are part of the physics.", hint),
    mc("Why can a positive acceleration still go with slowing down?", ["Because the object may already be moving in the negative direction", "Because positive acceleration always means speed must increase", "Because the time axis is inverted", "Because acceleration has no direction"], 0, "Sign must be compared with the sign of the velocity.", hint),
    mc("Why can a negative acceleration still go with speeding up?", ["Because the object may be moving in the negative direction already", "Because negative acceleration means no motion", "Because negative signs cancel speed", "Because acceleration is unrelated to direction"], 0, "A more negative velocity means faster motion in the negative direction.", hint),
    mc("Why must a positive direction be chosen before interpreting signs?", ["Because sign only has meaning relative to a defined direction convention", "Because east is always positive in all questions", "Because velocity can never be negative", "Because time needs a sign convention too"], 0, "Without a convention, positive and negative are undefined.", hint),
    mc("Why is zero acceleration not the same as zero velocity?", ["Because velocity can stay constant at any value", "Because zero acceleration cancels motion", "Because only stationary objects have zero acceleration", "Because velocity always changes if time passes"], 0, "Constant velocity is the zero-acceleration case.", hint),
    mc("Why is a direction reversal especially good for testing sign discipline?", ["Because the velocity can pass through zero while the acceleration sign still matters", "Because the acceleration vanishes automatically", "Because sign rules stop working during reversal", "Because reversal removes the need for time"], 0, "A reversal exposes whether the learner is truly tracking signed values.", hint),
    mc("What is lost if a learner ignores the sign on velocity values?", ["the physical direction story", "the unit of time", "the need for distance", "the shape of the graph paper"], 0, "Ignoring sign throws away the directional meaning.", hint),
    mc("Why is acceleration a rate quantity?", ["Because it compares the velocity change with the time taken", "Because it uses distance only", "Because it is always constant", "Because it has no unit"], 0, "The division by time is essential.", hint),
    mc("Why is 'negative acceleration means slowing down' not a safe universal rule?", ["Because the motion direction might already be negative", "Because negative acceleration never occurs", "Because speed and velocity are identical words", "Because negative values have no physical meaning"], 0, "You must compare acceleration sign with velocity sign.", hint),
    mc("Why does the lesson insist on signed arrows or conventions when discussing acceleration?", ["Because direction is part of velocity change", "Because arrows make the maths unnecessary", "Because acceleration is a scalar", "Because units disappear otherwise"], 0, "The sign carries the direction information.", hint),
    mc("Why is 'change in velocity' stronger than 'final velocity' when reasoning about acceleration?", ["Because acceleration depends on before-and-after comparison", "Because only final values matter in physics", "Because starting values are never known", "Because velocity cannot be compared across time"], 0, "Acceleration uses the difference between two velocity states.", hint),
    shortCases([
      { prompt: "Acceleration can mean speeding up, slowing down, or changing ...", acceptedAnswers: words("direction"), hint },
      { prompt: "Signed acceleration only makes sense after choosing a positive ...", acceptedAnswers: words("direction"), hint },
      { prompt: "A positive acceleration with a negative velocity often means the object is ... down.", acceptedAnswers: words("slowing", "slowing down"), hint },
      { prompt: "A negative acceleration with a negative velocity can mean the object is speeding ...", acceptedAnswers: words("up"), hint },
      { prompt: "Zero acceleration means velocity is ...", acceptedAnswers: words("constant", "steady"), hint },
      { prompt: "Acceleration uses change in ... divided by time.", acceptedAnswers: words("velocity"), hint },
      { prompt: "Ignoring the sign on velocity loses the motion ...", acceptedAnswers: words("direction", "direction story"), hint },
      { prompt: "A reversal through zero velocity is a good test of sign ...", acceptedAnswers: words("discipline", "control", "reasoning"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Choose the equation from the knowns and unknown, and only use it for constant acceleration.";
  return [
    mc("Which equation is best for finding final velocity when u, a, and t are known?", ["v = u + at", "s = ut + 0.5at^2", "v^2 = u^2 + 2as", "s = (u + v)t / 2"], 0, "This is the direct final-velocity relation.", hint),
    mc("Which equation is best for finding displacement when u, a, and t are known?", ["v = u + at", "s = ut + 0.5at^2", "v^2 = u^2 + 2as", "a = v / t"], 1, "It uses exactly u, a, and t.", hint),
    mc("Which relation avoids time completely?", ["v = u + at", "s = (u + v)t / 2", "v^2 = u^2 + 2as", "a = (v - u) / t"], 2, "This is the no-time equation.", hint),
    mc("Which equation is best for displacement when u, v, and t are known?", ["s = (u + v)t / 2", "v = u + at", "v^2 = u^2 + 2as", "s = at^2"], 0, "This is average velocity times time under constant acceleration.", hint),
    mc("What condition must hold before using the equations of motion in this lesson?", ["constant acceleration", "constant mass only", "zero displacement", "horizontal motion only"], 0, "These relations are for constant-acceleration motion.", hint),
    mc("A body has u = 5 m/s, a = 2 m/s^2, t = 4 s. What is v?", ["11 m/s", "12 m/s", "13 m/s", "14 m/s"], 2, "v = 5 + 2 x 4 = 13 m/s.", hint),
    mc("A body has u = 3 m/s, a = 2 m/s^2, t = 4 s. What is s?", ["24 m", "28 m", "32 m", "40 m"], 1, "s = ut + 0.5at^2 = 12 + 16 = 28 m.", hint),
    mc("A body has u = 4 m/s, v = 10 m/s, t = 3 s. What is s?", ["18 m", "21 m", "24 m", "30 m"], 1, "s = ((4 + 10) / 2) x 3 = 21 m.", hint),
    mc("A body changes velocity from 8 m/s to 20 m/s in 4 s. What is a?", ["2 m/s^2", "3 m/s^2", "4 m/s^2", "5 m/s^2"], 1, "a = (20 - 8) / 4 = 3 m/s^2.", hint),
    mc("A body has u = 2 m/s, v = 10 m/s, a = 4 m/s^2. What is s?", ["10 m", "12 m", "14 m", "16 m"], 1, "v^2 = u^2 + 2as gives 100 = 4 + 8s, so s = 12 m.", hint),
    mc("If time is missing from a constant-acceleration question, which equation family should you look for first?", ["the no-time relation v^2 = u^2 + 2as", "v = u + at only", "s = ut + 0.5at^2 only", "distance-time gradient"], 0, "Choose the equation that fits the missing variable pattern.", hint),
    mc("What is the biggest danger in using the equations by pattern matching only?", ["choosing a formula that does not fit the known variables or conditions", "making the object heavier", "changing the graph axes", "losing the time unit"], 0, "Equation choice should follow the story and the data.", hint),
    shortCases([
      { prompt: "A body has u = 6 m/s, a = 3 m/s^2, t = 2 s. Find v.", acceptedAnswers: speedAnswers(12), hint },
      { prompt: "A body starts from rest and accelerates at 2 m/s^2 for 5 s. Find s.", acceptedAnswers: distanceAnswers(25), hint },
      { prompt: "A body's velocity changes from 14 m/s to 2 m/s in 4 s. Find a.", acceptedAnswers: accelerationAnswers(-3), hint },
      { prompt: "Write one equation of motion that does not include time.", acceptedAnswers: formulaAnswers("v^2 = u^2 + 2as", "v^2=u^2+2as"), hint },
      { prompt: "The equations of motion in this lesson require ... acceleration.", acceptedAnswers: words("constant", "uniform"), hint },
      { prompt: "Under constant acceleration, average velocity is (u + v) divided by ...", acceptedAnswers: words("2", "two"), hint },
      { prompt: "If average velocity is 6 m/s for 5 s, the displacement is ...", acceptedAnswers: distanceAnswers(30), hint },
      { prompt: "Which symbol usually stands for displacement in the equations of motion?", acceptedAnswers: words("s"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Treat the equations as a constant-acceleration toolkit, not a bag of formulas to match by eye.";
  return [
    mc("Why must constant acceleration be checked before using the equations of motion?", ["Because the equations are derived for one steady acceleration", "Because they only work for horizontal motion", "Because they require zero initial speed", "Because they ignore time"], 0, "The assumption is built into the formula set.", hint),
    mc("Why is choosing an equation from the known and unknown variables better than picking by memory pattern?", ["Because it reduces irrelevant quantities and mismatched formulas", "Because all equations always use the same variables", "Because the shortest equation is always correct", "Because graphs do not matter"], 0, "The selection should follow the information actually given.", hint),
    mc("Why is v = u + at not enough when displacement is the target?", ["Because it gives velocity change, not displacement directly", "Because it has no units", "Because it uses too many symbols", "Because it only works from rest"], 0, "You still need an equation that includes s.", hint),
    mc("Why is the no-time equation useful in some problems?", ["Because it links v, u, a, and s without needing t", "Because it finds time more accurately", "Because it works only when acceleration changes", "Because it ignores initial velocity"], 0, "It is designed for the time-missing case.", hint),
    mc("Why does the average-velocity form s = (u + v)t / 2 depend on constant acceleration?", ["Because only then is velocity changing linearly between u and v", "Because constant acceleration makes time disappear", "Because average velocity is always zero otherwise", "Because displacement stops depending on time"], 0, "The simple mean of u and v is not generally safe without constant acceleration.", hint),
    mc("Why is it sensible to cross-check with a second equation when enough information exists?", ["Because two consistent results strengthen confidence in the answer", "Because one correct equation must always disagree with another", "Because cross-checking changes the physical story", "Because units become unnecessary"], 0, "Cross-checking can catch algebra or selection errors.", hint),
    mc("Why should signs be handled carefully in the equations of motion?", ["Because u, v, a, and s are directional quantities in one dimension", "Because the equations remove direction automatically", "Because signs only matter for time", "Because displacement can never be negative"], 0, "The equations keep the direction information alive.", hint),
    mc("Why is unit checking useful after solving a suvat question?", ["Because it helps confirm the quantity found matches the physical target", "Because correct physics has no units", "Because units decide the formula before the story does", "Because unit checks replace algebra"], 0, "Units are a strong sanity check.", hint),
    mc("Why is a straight-line speed-time graph a good clue for using the equations of motion?", ["Because it indicates constant acceleration", "Because it proves displacement is zero", "Because it means the object is stationary", "Because it makes the graph area irrelevant"], 0, "A straight speed-time line means the gradient is constant.", hint),
    mc("Why is 'plug into every equation and hope' a weak strategy?", ["Because some formulas include quantities you do not know or conditions that do not hold", "Because more equations always improves accuracy", "Because algebra becomes impossible with symbols", "Because time should never be used"], 0, "Equation use must stay tied to the motion story.", hint),
    mc("Why is initial speed often the first quantity to label carefully?", ["Because it anchors which state is the start of the motion story", "Because it is always zero", "Because it cancels from every equation", "Because it equals displacement"], 0, "The equations compare start and finish states.", hint),
    mc("What does the lesson want students to avoid most in suvat work?", ["formula pattern matching without checking assumptions", "using units", "using algebra", "using graphs"], 0, "The whole lesson is about disciplined equation choice.", hint),
    shortCases([
      { prompt: "The equations of motion form a constant-... toolkit.", acceptedAnswers: words("acceleration"), hint },
      { prompt: "Choose a suvat equation from the knowns, unknown, and the motion ...", acceptedAnswers: words("story", "context", "conditions"), hint },
      { prompt: "If time is not given, the first useful relation often removes ...", acceptedAnswers: words("time"), hint },
      { prompt: "The equation s = (u + v)t / 2 uses the ... velocity idea.", acceptedAnswers: words("average", "mean"), hint },
      { prompt: "A straight-line speed-time graph supports the constant-... assumption.", acceptedAnswers: words("acceleration"), hint },
      { prompt: "Checking units helps confirm the physical ... found.", acceptedAnswers: words("quantity", "answer"), hint },
      { prompt: "In one-dimensional motion, u, v, a, and s can all carry a ...", acceptedAnswers: words("sign", "direction sign"), hint },
      { prompt: "Blind pattern matching is weaker than equation choice tied to the given ...", acceptedAnswers: words("variables", "knowns"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Slope meaning comes from the axes, not from steepness alone.";
  return [
    mc("On a distance-time graph, the gradient represents...", ["speed", "acceleration", "distance", "time"], 0, "Distance divided by time gives speed.", hint),
    mc("On a speed-time graph, the gradient represents...", ["speed", "distance", "acceleration", "mass"], 2, "Speed divided by time gives acceleration.", hint),
    mc("What does zero gradient mean on a distance-time graph?", ["constant speed", "stationary", "constant acceleration", "zero time"], 1, "Distance stays constant, so the object is stationary.", hint),
    mc("What does zero gradient mean on a speed-time graph?", ["stationary", "constant speed", "zero distance", "changing acceleration"], 1, "Speed stays constant, so acceleration is zero.", hint),
    mc("A gradient of 4 on a distance-time graph means...", ["4 m", "4 m/s", "4 m/s^2", "4 s"], 1, "The units are distance per time.", hint),
    mc("A gradient of 4 on a speed-time graph means...", ["4 m", "4 m/s", "4 m/s^2", "4 s"], 2, "The units are speed per time.", hint),
    mc("Why can the same numerical slope mean different physics on two graphs?", ["Because the axes are different", "Because slope has no units", "Because all slopes mean acceleration", "Because graphs change the numbers"], 0, "The axis quantities decide the meaning and units.", hint),
    mc("A steeper distance-time graph on the same axes means...", ["greater speed", "greater acceleration", "greater time", "greater mass"], 0, "Steeper gradient here means more distance per second.", hint),
    mc("A steeper speed-time graph on the same axes means...", ["greater speed only", "greater displacement", "greater magnitude of acceleration", "greater average speed only"], 2, "Steeper slope here means larger acceleration magnitude.", hint),
    mc("A negative gradient on a speed-time graph indicates...", ["negative acceleration", "negative distance", "impossible motion", "zero speed"], 0, "The speed value is falling with time.", hint),
    mc("Which check is safest before naming the meaning of a gradient?", ["read both axis labels", "count the graph squares", "look at the line colour", "read the final point only"], 0, "Axis labels control the interpretation.", hint),
    mc("What gives the units of a graph gradient?", ["horizontal-axis units only", "vertical-axis units only", "vertical units divided by horizontal units", "the title of the graph"], 2, "Gradient always has rise-over-run units.", hint),
    shortCases([
      { prompt: "State the quantity given by the gradient of a distance-time graph.", acceptedAnswers: words("speed"), hint },
      { prompt: "State the quantity given by the gradient of a speed-time graph.", acceptedAnswers: words("acceleration"), hint },
      { prompt: "A horizontal distance-time graph means the body is ...", acceptedAnswers: words("stationary", "stopped", "at rest"), hint },
      { prompt: "A horizontal speed-time graph means the speed is ...", acceptedAnswers: words("constant", "steady"), hint },
      { prompt: "Give the units of the gradient of a distance-time graph.", acceptedAnswers: words("m/s", "ms^-1", "m s^-1"), hint },
      { prompt: "Give the units of the gradient of a speed-time graph.", acceptedAnswers: words("m/s^2", "m/s2", "ms^-2", "m s^-2"), hint },
      { prompt: "If the slope is 3 on a speed-time graph, the acceleration is ...", acceptedAnswers: accelerationAnswers(3), hint },
      { prompt: "If the slope is 3 on a distance-time graph, the speed is ...", acceptedAnswers: speedAnswers(3), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "The same line shape can tell different physics stories if the axes change.";
  return [
    mc("Why is the statement 'slope means speed' unsafe on its own?", ["Because slope meaning depends on the graph axes", "Because slope never has physical meaning", "Because slope always means acceleration", "Because only the graph area matters"], 0, "The axes decide which rate the slope represents.", hint),
    mc("Why can the same steepness mean speed on one graph and acceleration on another?", ["Because each graph plots different quantities on its axes", "Because steepness changes with colour", "Because one graph is wrong", "Because physics ignores units"], 0, "Different axes create different rates.", hint),
    mc("Why does a zero slope need careful reading?", ["Because zero slope can mean stationary on one graph and constant speed on another", "Because zero slope always means no motion of any kind", "Because zero slope has no units", "Because zero slope is impossible"], 0, "Zero rate depends on what the graph is plotting.", hint),
    mc("Why should units be attached when describing a gradient value?", ["Because the units reveal which physical rate the number belongs to", "Because units do not matter on graphs", "Because units always cancel in gradients", "Because only the number matters"], 0, "A slope of 4 is incomplete without units.", hint),
    mc("Why is reading axis labels before reading the slope an exam-safety step?", ["Because it prevents importing the wrong rate meaning from another graph type", "Because axis labels are decorative only", "Because gradient can be found without axes", "Because every graph in motion uses the same interpretation"], 0, "This prevents one of the common graph-reading errors.", hint),
    mc("Why is a horizontal speed-time graph not evidence that the body is stationary?", ["Because it shows speed staying constant, not speed being zero", "Because horizontal lines mean graphs fail", "Because only sloping graphs show motion", "Because time is not changing"], 0, "The height can stay above zero.", hint),
    mc("Why is a horizontal distance-time graph not evidence of constant speed?", ["Because distance is not changing, so the speed is zero", "Because horizontal lines always mean acceleration", "Because slope on distance-time graphs has no meaning", "Because only vertical graphs show speed"], 0, "Zero slope on distance-time means zero speed.", hint),
    mc("Why is rise-over-run language helpful here?", ["Because it reminds students that a gradient is a rate built from two axis quantities", "Because it replaces the need for units", "Because it applies only to speed-time graphs", "Because it means the route must slope upward"], 0, "Gradient meaning comes from what rises and what runs.", hint),
    mc("Why can a learner not decide the gradient meaning from the line alone?", ["Because the same line on relabelled axes represents a different quantity", "Because the line has no numerical value", "Because steep lines are always acceleration", "Because shallow lines are always speed"], 0, "Context comes from the axis labels.", hint),
    mc("Why is comparing a distance-time graph and a speed-time graph useful in the same lesson?", ["Because it exposes that rate meaning changes with the axes", "Because the two graphs always have identical gradients", "Because only one of them can be correct", "Because it removes the need for calculations"], 0, "The contrast is the lesson's main protection against confusion.", hint),
    mc("Why is 'gradient = y / x units' a strong thinking rule?", ["Because it keeps the slope tied to the plotted quantities", "Because it shows gradients are unitless", "Because it works only when the graph is horizontal", "Because it makes area and slope identical"], 0, "Use the axes to build the rate.", hint),
    mc("What misconception is most directly corrected by this lesson?", ["thinking steepness has one fixed meaning across all graphs", "thinking graphs cannot describe motion", "thinking time can never be on an axis", "thinking lines need units"], 0, "The lesson is about rate meaning changing with the axes.", hint),
    shortCases([
      { prompt: "The meaning of a gradient comes from the graph ...", acceptedAnswers: words("axes", "axis labels", "labels"), hint },
      { prompt: "A slope is a ... because it compares one changing quantity with another.", acceptedAnswers: words("rate"), hint },
      { prompt: "Zero slope on a speed-time graph means zero ...", acceptedAnswers: words("acceleration"), hint },
      { prompt: "Zero slope on a distance-time graph means zero ...", acceptedAnswers: words("speed"), hint },
      { prompt: "A number for gradient is incomplete without its ...", acceptedAnswers: words("units", "unit"), hint },
      { prompt: "The same steepness on two graph types can still mean different physics because the ... are different.", acceptedAnswers: words("axes", "axis labels"), hint },
      { prompt: "A horizontal speed-time graph can still show motion if the graph height is above ...", acceptedAnswers: words("zero", "0"), hint },
      { prompt: "The safest graph habit here is to read the ... before naming the slope meaning.", acceptedAnswers: words("axes", "axis labels", "labels"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use the enclosed area under a speed-time graph as accumulated distance.";
  return [
    mc("What physical quantity is given by the area under a speed-time graph?", ["distance travelled", "acceleration", "speed", "time"], 0, "Area = speed x time, so it gives distance.", hint),
    mc("A body moves at 6 m/s for 4 s. What distance is travelled?", ["10 m", "20 m", "24 m", "30 m"], 2, "Rectangle area = 6 x 4 = 24 m.", hint),
    mc("Speed rises uniformly from 0 to 10 m/s in 4 s. What distance is travelled?", ["10 m", "20 m", "30 m", "40 m"], 1, "Triangle area = 0.5 x 4 x 10 = 20 m.", hint),
    mc("Speed changes uniformly from 4 m/s to 8 m/s in 6 s. What distance is travelled?", ["24 m", "30 m", "36 m", "48 m"], 2, "Trapezium area = average speed x time = 6 x 6 = 36 m.", hint),
    mc("What are the units of area under a speed-time graph?", ["m/s^2", "m", "s", "m/s"], 1, "Speed multiplied by time gives distance in metres.", hint),
    mc("Two different speed-time graphs have the same enclosed area. What must be the same?", ["the maximum speed", "the distance travelled", "the acceleration", "the total time only"], 1, "Equal area means equal total distance.", hint),
    mc("A constant speed section on a speed-time graph is found by the area of a...", ["triangle", "trapezium", "rectangle", "circle"], 2, "Flat height over a time width forms a rectangle.", hint),
    mc("A body starts from rest and speeds up uniformly. Which simple shape often gives the distance under the graph?", ["rectangle", "triangle", "circle", "square root"], 1, "Starting from zero with a straight rise forms a triangle.", hint),
    mc("How should total distance be found when a speed-time graph has several simple sections?", ["subtract the gradients", "add the areas of the sections", "multiply the peak speed by the final time", "read the final speed only"], 1, "Distance accumulates, so add the enclosed areas.", hint),
    mc("A body travels at 5 m/s for 3 s, then at 9 m/s for 2 s. What total distance is travelled?", ["24 m", "27 m", "32 m", "45 m"], 1, "Distance = 5 x 3 + 9 x 2 = 27 m.", hint),
    mc("A speed rises from 0 to 12 m/s in 6 s. What distance is travelled?", ["24 m", "36 m", "48 m", "72 m"], 1, "Triangle area = 0.5 x 6 x 12 = 36 m.", hint),
    mc("What does a section lying on the time axis contribute to the total distance?", ["a negative distance", "the largest distance", "zero additional distance", "constant acceleration only"], 2, "Zero speed over that section adds no area.", hint),
    shortCases([
      { prompt: "A body moves at 8 m/s for 5 s. Find the distance travelled.", acceptedAnswers: distanceAnswers(40), hint },
      { prompt: "Speed rises uniformly from 0 to 6 m/s in 4 s. Find the distance travelled.", acceptedAnswers: distanceAnswers(12), hint },
      { prompt: "State the units of the area under a speed-time graph.", acceptedAnswers: words("m", "metres", "meters"), hint },
      { prompt: "To find total distance from a multi-part speed-time graph, add the ...", acceptedAnswers: words("areas", "area"), hint },
      { prompt: "If two speed-time graphs enclose the same area, they give the same total ...", acceptedAnswers: words("distance"), hint },
      { prompt: "Speed changes uniformly from 2 m/s to 10 m/s in 4 s. Find the distance travelled.", acceptedAnswers: distanceAnswers(24), hint },
      { prompt: "A graph segment on the time axis adds ... metres to the total distance.", acceptedAnswers: words("0", "zero"), hint },
      { prompt: "A speed-time graph uses the enclosed area to find total ...", acceptedAnswers: words("distance"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Treat the area as accumulated strips of speed x time, not as line length or graph decoration.";
  return [
    mc("Why does area under a speed-time graph represent distance?", ["Because each strip multiplies a speed by a small time interval", "Because the line length is being measured", "Because gradients always equal distance", "Because speed and time cancel to zero"], 0, "The region sums many speed x time pieces.", hint),
    mc("Why is the graph line itself not the distance travelled?", ["Because distance comes from the enclosed area, not the slanted boundary length", "Because graph lines have no geometry", "Because the line always equals time", "Because only the final point matters"], 0, "The lesson is about the region under the line.", hint),
    mc("Why can a tall narrow region and a shorter wider region give the same total distance?", ["Because distance depends on total area, not on height alone", "Because only the tallest speed counts", "Because wide regions always give more distance", "Because height and width do not affect area"], 0, "Different shapes can enclose the same area.", hint),
    mc("Why is splitting the region into rectangles and triangles useful?", ["Because those simple areas can be calculated reliably and added", "Because motion stops during splitting", "Because the graph changes units", "Because only rectangles are physical"], 0, "It turns the graph into manageable geometry.", hint),
    mc("Why does average speed help with a trapezium section?", ["Because distance is average speed multiplied by time for that linear change", "Because trapezia have no area formula", "Because speed-time graphs ignore time", "Because average speed equals acceleration"], 0, "Average speed is the mean of the parallel sides for uniform change.", hint),
    mc("Why should units be checked after finding an area on a speed-time graph?", ["Because the product should come out in metres if the interpretation is correct", "Because areas on graphs are unitless", "Because metres prove acceleration", "Because only time carries units"], 0, "Units are a strong meaning check.", hint),
    mc("Why does a zero-speed interval add no further distance?", ["Because speed x time is zero over that interval", "Because time has stopped", "Because the graph disappears", "Because acceleration must be maximum"], 0, "No speed means no extra distance accumulated.", hint),
    mc("Why is peak speed alone not enough to compare total distance on two speed-time graphs?", ["Because a lower speed held for longer can enclose the same or larger area", "Because peak speed always fixes distance", "Because only final speed matters", "Because area depends only on the axes"], 0, "Both height and width affect the area.", hint),
    mc("Why can two different motion stories give the same total distance?", ["Because their speed-time regions can have equal total area", "Because every motion story has the same area", "Because distance depends on starting speed only", "Because distance ignores time"], 0, "Equal area does not require identical graph shape.", hint),
    mc("Why is area under a speed-time graph a cumulative idea?", ["Because each time slice adds another piece of distance to the total", "Because only the last slice matters", "Because the graph resets every second", "Because acceleration removes earlier distance"], 0, "Distance builds up over the whole interval.", hint),
    mc("Why is a speed-time graph paired naturally with distance questions?", ["Because its area gives distance while its height gives speed", "Because both graphs always have the same slope", "Because distance-time graphs cannot show motion", "Because acceleration is never needed"], 0, "This graph holds both instantaneous speed and accumulated distance information.", hint),
    mc("What mistake is this lesson trying hardest to prevent?", ["treating the line shape or peak height as the distance instead of using area", "treating time as the horizontal axis", "treating speed as a vector here", "treating rectangles as areas"], 0, "Area, not the outline, is the key meaning.", hint),
    shortCases([
      { prompt: "Area under a speed-time graph works because each strip is speed multiplied by ...", acceptedAnswers: words("time"), hint },
      { prompt: "Different graph shapes can still give the same total ... if their areas match.", acceptedAnswers: words("distance"), hint },
      { prompt: "The sloping graph line is not the distance; the enclosed ... is.", acceptedAnswers: words("area", "region"), hint },
      { prompt: "A trapezium section can be handled using ... speed multiplied by time.", acceptedAnswers: words("average", "mean"), hint },
      { prompt: "A zero-speed interval adds zero extra ...", acceptedAnswers: words("distance"), hint },
      { prompt: "To calculate a complex region, break it into simple geometric ...", acceptedAnswers: words("shapes"), hint },
      { prompt: "Peak speed alone is not enough because total distance depends on both speed and ...", acceptedAnswers: words("time"), hint },
      { prompt: "The safest phrase for the quantity under a speed-time graph is accumulated ...", acceptedAnswers: words("distance"), hint },
    ]),
  ];
}

const M1_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M1_L1: l1DiagnosticRaw,
  M1_L2: l2DiagnosticRaw,
  M1_L3: l3DiagnosticRaw,
  M1_L4: l4DiagnosticRaw,
  M1_L5: l5DiagnosticRaw,
  M1_L6: l6DiagnosticRaw,
};

const M1_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M1_L1: l1ConceptRaw,
  M1_L2: l2ConceptRaw,
  M1_L3: l3ConceptRaw,
  M1_L4: l4ConceptRaw,
  M1_L5: l5ConceptRaw,
  M1_L6: l6ConceptRaw,
};

const M1_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(M1_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...M1_DIAGNOSTIC_BUILDERS[code](), ...M1_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function m1GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M1_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function m1GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M1_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function m1GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M1_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
