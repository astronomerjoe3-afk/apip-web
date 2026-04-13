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
  return { kind: "mc", prompt, choices, answerIndex, explanation, hint };
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
      return "D";
    case "concept":
      return "C";
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
    const id = `${compactCode(code)}_${stageLabel(kind)}${index + 1}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`M4 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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

function mergeAnswers(...groups: string[][]): string[] {
  return Array.from(new Set(groups.flat()));
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function pressureAnswers(value: number, digits = 3): string[] {
  return mergeAnswers(numericAnswers(value, "Pa", digits), words(`${formatNumber(value, digits)} pascals`));
}

function forceAnswers(value: number, digits = 3): string[] {
  return mergeAnswers(numericAnswers(value, "N", digits), words(`${formatNumber(value, digits)} newtons`));
}

function areaAnswers(value: number, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain} m^2`, `${plain} m2`]));
}

function depthAnswers(value: number, digits = 3): string[] {
  return numericAnswers(value, "m", digits);
}

function densityAnswers(value: number, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain} kg/m^3`, `${plain} kg/m3`]));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use pressure = force / area and keep force and area separate.";
  return [
    mc("Which formal relation belongs to pressure in solids?", ["p = F / A", "F = ma", "E = Pt", "p = rho g h"], 0, "This is the basic force-per-area relation.", hint),
    mc("A 600 N force acts on an area of 0.20 m^2. What pressure is produced?", ["3000 Pa", "120 Pa", "30 Pa", "120000 Pa"], 0, "Divide force by area.", hint),
    mc("If the same force acts on a smaller area, the pressure becomes...", ["larger", "smaller", "unchanged", "zero"], 0, "The push is more concentrated.", hint),
    mc("If the contact area doubles while the force stays fixed, the pressure becomes...", ["half as large", "twice as large", "four times as large", "unchanged"], 0, "Pressure is inversely proportional to area for fixed force.", hint),
    mc("If the force doubles while the area stays fixed, the pressure becomes...", ["twice as large", "half as large", "unchanged", "four times as large"], 0, "At fixed area, pressure rises in step with force.", hint),
    mc("What is the SI unit of pressure?", ["pascal", "joule", "newton", "watt"], 0, "Pressure is measured in pascals.", hint),
    mc("Two objects each push with 400 N. One has area 0.10 m^2 and the other 0.40 m^2. What is true?", ["The smaller area gives four times the pressure", "The larger area gives four times the pressure", "They give the same pressure", "Pressure cannot be compared"], 0, "400/0.10 is four times 400/0.40.", hint),
    mc("Which shoe gives lower pressure on soft ground for the same weight?", ["the wider shoe", "the narrower shoe", "both give the same pressure", "the heavier shoe"], 0, "Larger area spreads the force.", hint),
    mc("Which statement is strongest?", ["Pressure depends on both the push and the contact area", "Pressure depends on the push only", "Pressure depends on the area only", "Pressure is unrelated to contact"], 0, "Both factors must stay visible.", hint),
    mc("A 900 N crate stands on a base area of 0.30 m^2. What pressure does it exert?", ["3000 Pa", "270 Pa", "1200 Pa", "3 Pa"], 0, "900 / 0.30 = 3000.", hint),
    mc("Why can a wide base protect a fragile floor?", ["Because the same force is spread over more area", "Because it removes the force", "Because it changes the mass into energy", "Because it makes pressure impossible"], 0, "It lowers the concentration of the force.", hint),
    mc("Which statement is weakest physics?", ["A heavier object always gives the greater pressure even if it has a much wider base", "Pressure can change if the contact area changes", "The same force on less area gives greater pressure", "Pressure is force per unit area"], 0, "Area can overturn a force-only guess.", hint),
    shortCases([
      { prompt: "Pressure is force per unit ...", acceptedAnswers: words("area"), hint },
      { prompt: "One pascal means one newton per square ...", acceptedAnswers: words("metre", "meter"), hint },
      { prompt: "A 1200 N force acts on 0.40 m^2. What pressure is produced?", acceptedAnswers: pressureAnswers(3000), hint },
      { prompt: "If the same force is spread over more area, pressure ...", acceptedAnswers: words("falls", "decreases", "drops"), hint },
      { prompt: "If the same area is kept but the force doubles, pressure ...", acceptedAnswers: words("doubles", "double"), hint },
      { prompt: "A 5000 Pa floor reading is a measure of ...", acceptedAnswers: words("pressure", "patch load", "force per unit area", "the force per unit area"), hint },
      { prompt: "A snowshoe lowers pressure mainly by increasing the contact ...", acceptedAnswers: words("area"), hint },
      { prompt: "Pressure is measured in ...", acceptedAnswers: words("Pa", "pascal", "pascals"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "The main trap is turning pressure into a force-only idea.";
  return [
    mc("Why is 'pressure is just force' an incomplete statement?", ["Because pressure depends on how the force is spread over area", "Because force never matters", "Because pressure is measured in joules", "Because area is only decorative"], 0, "Area is part of the relation.", hint),
    mc("Why can two objects with the same weight give different floor pressures?", ["Because their contact areas can be different", "Because pressure ignores contact", "Because one weight must be wrong", "Because the units change"], 0, "Different footprints can give different pressure.", hint),
    mc("Why is a high pressure not necessarily a large force?", ["Because a modest force on a very small area can still give a high pressure", "Because large force always means low pressure", "Because pressure is unrelated to force", "Because only mass matters"], 0, "Force and area work together.", hint),
    mc("Why is a larger base often a safer design on fragile ground?", ["Because it reduces pressure without changing the total force", "Because it removes the force completely", "Because it increases the force", "Because it turns pressure into energy"], 0, "The same push is spread more widely.", hint),
    mc("Why is p = F / A better than a slogan like 'big things sink'?", ["Because it keeps both force and area visible", "Because it ignores numbers", "Because it works only for liquids", "Because it replaces the need for units"], 0, "The formal relation is more precise than a slogan.", hint),
    mc("Why does the pressure unit Pa help conceptually?", ["Because it reminds you that pressure is newtons per square metre", "Because it means pressure is dimensionless", "Because it hides the area term", "Because it replaces force"], 0, "The unit itself contains the relation.", hint),
    mc("Which explanation best repairs 'the force stayed the same, so the pressure stayed the same'?", ["Pressure can still change if the area changes", "Pressure must stay the same for any fixed force", "Area only matters in liquids", "Pressure does not depend on contact"], 0, "Holding force fixed does not hold pressure fixed.", hint),
    mc("Why is contact area called the denominator in the pressure relation?", ["Because increasing it reduces the pressure for the same force", "Because it always raises pressure", "Because it is measured in pascals", "Because it cancels force"], 0, "The denominator effect is the key inverse relationship.", hint),
    mc("Why should pressure questions be read as concentration questions?", ["Because they ask how crowded the force is on the surface", "Because they ask how long the force acts", "Because they ask only what the mass is", "Because they ignore contact area"], 0, "Pressure is about concentration of push.", hint),
    mc("Why is the phrase 'same force, different pressure' physically sensible?", ["Because the area can be different", "Because forces can change without a cause", "Because pressure is unrelated to area", "Because pressure is another name for force"], 0, "A different denominator can change the quotient.", hint),
    shortCases([
      { prompt: "Pressure changes if the contact ... changes, even when the force does not.", acceptedAnswers: words("area"), hint },
      { prompt: "Pressure is best thought of as force ...", acceptedAnswers: words("concentration", "per unit area", "spread over area"), hint },
      { prompt: "A very small area can make a moderate force give very ... pressure.", acceptedAnswers: words("high", "large", "greater"), hint },
      { prompt: "A larger footprint often lowers the floor ...", acceptedAnswers: words("pressure", "patch load"), hint },
      { prompt: "The pressure unit Pa can be rewritten as N per square ...", acceptedAnswers: words("metre", "meter"), hint },
      { prompt: "A safe design often changes the area rather than changing the total ...", acceptedAnswers: words("force", "push"), hint },
      { prompt: "Pressure questions should keep force and ... visible together.", acceptedAnswers: words("area"), hint },
      { prompt: "The key inverse relationship is: larger area, ... pressure.", acceptedAnswers: words("lower", "less", "smaller"), hint },
      { prompt: "Pressure is not the same thing as ...", acceptedAnswers: words("force"), hint },
      { prompt: "A good repair to force-only reasoning is to ask 'over what ...?'", acceptedAnswers: words("area", "surface area"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Start from the safe pressure limit, then work backward to area or forward to maximum force.";
  return [
    mc("Which rearranged relation gives the minimum safe area for a given force and pressure limit?", ["A = F / p", "p = F / A", "F = pA", "A = p / F"], 0, "You are solving for area from the same pressure relation.", hint),
    mc("A floor can safely tolerate 4000 Pa. What minimum area is needed for an 800 N load?", ["0.20 m^2", "3200000 m^2", "5000 m^2", "0.05 m^2"], 0, "Use A = F / p.", hint),
    mc("A plate has area 0.25 m^2 and the safe limit is 6000 Pa. What is the maximum safe force?", ["1500 N", "24000 N", "6000 N", "24 N"], 0, "Use F = pA.", hint),
    mc("If the safe pressure limit becomes smaller while the force stays the same, the required minimum area becomes...", ["larger", "smaller", "unchanged", "zero"], 0, "A stricter limit needs a larger footprint.", hint),
    mc("If the force doubles while the safe pressure limit stays the same, the required minimum area becomes...", ["twice as large", "half as large", "four times as large", "unchanged"], 0, "Area must rise in step with force at a fixed limit.", hint),
    mc("A drone shares its weight equally across 4 identical skids. If the minimum total area is 0.40 m^2, what area must each skid provide?", ["0.10 m^2", "0.40 m^2", "0.04 m^2", "1.60 m^2"], 0, "Divide the total equally among four skids.", hint),
    mc("A candidate design gives 5200 Pa on a floor rated to 5000 Pa. Which verdict is correct?", ["unsafe", "safe", "exactly safe because the numbers are close", "pressure does not decide"], 0, "Exceeding the limit makes the design unsafe.", hint),
    mc("Why is a minimum-area answer still a pressure answer?", ["Because it is found by keeping pressure below a limit", "Because area replaces pressure", "Because force is ignored", "Because it uses geometry only"], 0, "The goal is still safe pressure.", hint),
    mc("A 1200 N load must stay under 3000 Pa. What minimum area is needed?", ["0.40 m^2", "3600000 m^2", "4.0 m^2", "0.25 m^2"], 0, "1200 / 3000 = 0.40.", hint),
    mc("If the available area is fixed but the pressure limit is raised, the maximum safe force becomes...", ["larger", "smaller", "unchanged", "zero"], 0, "F_max = p_limit A.", hint),
    shortCases([
      { prompt: "A 900 N load must stay under 6000 Pa. What minimum area is needed?", acceptedAnswers: areaAnswers(0.15), hint },
      { prompt: "A support area of 0.30 m^2 with limit 5000 Pa can safely support ... N.", acceptedAnswers: forceAnswers(1500), hint },
      { prompt: "Safe design starts from the pressure ...", acceptedAnswers: words("limit", "threshold"), hint },
      { prompt: "If four equal skids share the load, each skid gets one ... of the total area.", acceptedAnswers: words("quarter", "fourth"), hint },
      { prompt: "If candidate pressure is above the limit, the design is ...", acceptedAnswers: words("unsafe"), hint },
      { prompt: "If the pressure limit is stricter, the required area must ...", acceptedAnswers: words("increase", "rise", "get larger"), hint },
      { prompt: "The forward design relation for maximum safe force is F = p times ...", acceptedAnswers: words("A", "area"), hint },
      { prompt: "A minimum-area answer should be measured in square ...", acceptedAnswers: words("metres", "meters"), hint },
      { prompt: "A design right at the safe limit is at the maximum allowed ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "For a fixed area, higher allowed pressure means greater maximum safe ...", acceptedAnswers: words("force", "load"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "This lesson is about threshold design, not just algebra rearrangement.";
  return [
    mc("Why is a pressure-limit question naturally a design question?", ["Because it asks what area or force keeps the system below a safe threshold", "Because it ignores the pressure relation", "Because it removes the need for numbers", "Because it is only about geometry"], 0, "The whole point is satisfying a constraint.", hint),
    mc("Why is working backward to a minimum area physically meaningful?", ["Because the floor limit fixes the maximum allowed pressure", "Because area is more important than pressure", "Because force disappears in design problems", "Because thresholds replace physics"], 0, "The limit determines the required footprint.", hint),
    mc("Why is 'the force is fixed, so the design is fixed' too weak?", ["Because the area can still be redesigned to lower the pressure", "Because fixed force makes pressure irrelevant", "Because force never matters", "Because safe limits apply only to liquids"], 0, "Area remains a design variable.", hint),
    mc("Why must 'safe' and 'unsafe' be decided by pressure rather than by force alone?", ["Because the same force can be safe on one area and unsafe on another", "Because force never matters", "Because pressure is only a unit conversion", "Because safety has no threshold"], 0, "The limit belongs to pressure.", hint),
    mc("Why does equal load sharing matter when several skids or feet support a machine?", ["Because the total required area can be divided among them", "Because sharing changes the total force", "Because each foot gets the full force", "Because pressure stops applying"], 0, "Equal sharing lets you convert total area into per-support area.", hint),
    mc("Why is it useful to state a design as 'minimum area' or 'maximum force'?", ["Because those phrases show which side of the threshold is acceptable", "Because they remove the need for units", "Because they mean the same thing as pressure", "Because they make the answer exact even when the model is wrong"], 0, "The answer is about allowable limits.", hint),
    mc("Why is 'close to the limit' not the same as 'safe'?", ["Because exceeding the limit by any amount still breaks the design condition", "Because all close values are automatically safe", "Because the limit is only a suggestion", "Because safety depends only on mass"], 0, "Thresholds matter precisely.", hint),
    mc("Why is A = F / p_limit not a new law?", ["Because it is the same pressure relation rearranged for the design unknown", "Because it works only in one experiment", "Because it ignores pressure", "Because area creates force"], 0, "The physics relation is unchanged.", hint),
    mc("Why might a designer increase area instead of reducing force?", ["Because the required function may need the same load but a safer footprint", "Because reducing force always raises pressure", "Because area and pressure are unrelated", "Because force cannot ever be changed"], 0, "Footprint changes can solve a pressure problem.", hint),
    mc("Why is a pressure-limit design more advanced than just calculating pressure once?", ["Because it uses the relation to plan what must be true before the object is used", "Because it stops using the pressure formula", "Because it avoids thresholds", "Because it works without any physical interpretation"], 0, "The relation becomes a planning tool.", hint),
    shortCases([
      { prompt: "Design questions usually ask for the minimum safe ... or the maximum safe force.", acceptedAnswers: words("area", "footprint area"), hint },
      { prompt: "A pressure threshold divides designs into safe and ...", acceptedAnswers: words("unsafe"), hint },
      { prompt: "Working backward from a limit is still ... physics.", acceptedAnswers: words("pressure"), hint },
      { prompt: "If the total area is shared equally between supports, divide it ...", acceptedAnswers: words("equally", "fairly", "by the number of supports"), hint },
      { prompt: "A design that exceeds the pressure limit by any amount is still ...", acceptedAnswers: words("unsafe"), hint },
      { prompt: "A maximum-force answer comes from combining the limit with the fixed ...", acceptedAnswers: words("area"), hint },
      { prompt: "A minimum-area answer comes from combining the limit with the fixed ...", acceptedAnswers: words("force", "load"), hint },
      { prompt: "Threshold design turns a formula into a planning ...", acceptedAnswers: words("tool", "constraint"), hint },
      { prompt: "Safe versus unsafe is decided by whether pressure stays below the allowed ...", acceptedAnswers: words("limit", "threshold"), hint },
      { prompt: "Rearranging the equation changes the unknown, not the underlying ...", acceptedAnswers: words("physics", "relationship", "law"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "For liquid pressure, keep density, gravitational field strength, and depth together.";
  return [
    mc("Which formal relation belongs to hydrostatic pressure?", ["p = rho g h", "p = F / A", "F = ma", "E = Pt"], 0, "This is the liquid-pressure relation.", hint),
    mc("Water has density 1000 kg/m^3. At depth 4 m with g = 10 N/kg, what is the pressure due to the water?", ["40000 Pa", "4000 Pa", "250 Pa", "14000 Pa"], 0, "Use rho g h.", hint),
    mc("If depth doubles while density and g stay fixed, the liquid pressure becomes...", ["twice as large", "four times as large", "half as large", "unchanged"], 0, "Depth enters linearly.", hint),
    mc("If density doubles while depth and g stay fixed, the liquid pressure becomes...", ["twice as large", "four times as large", "half as large", "unchanged"], 0, "Density also enters linearly.", hint),
    mc("If g doubles while depth and density stay fixed, the liquid pressure becomes...", ["twice as large", "four times as large", "half as large", "unchanged"], 0, "The gravitational factor is also linear.", hint),
    mc("Oil has density 800 kg/m^3. At depth 5 m with g = 10 N/kg, what pressure is produced?", ["40000 Pa", "50000 Pa", "8000 Pa", "160000 Pa"], 0, "800 x 10 x 5 = 40000.", hint),
    mc("What happens to liquid pressure at the same depth if the liquid is denser?", ["It becomes larger", "It becomes smaller", "It stays the same", "It becomes zero"], 0, "Heavier liquid layers above the point increase pressure.", hint),
    mc("Which factor does not directly determine liquid pressure at a point in a resting liquid?", ["tank width", "depth", "density", "g"], 0, "Container width is not in the relation.", hint),
    mc("A point is moved from 2 m depth to 5 m depth in water with g = 10 N/kg. How much does pressure increase?", ["30000 Pa", "50000 Pa", "7000 Pa", "20000 Pa"], 0, "Use delta p = rho g delta h = 1000 x 10 x 3.", hint),
    mc("A liquid pressure is 24000 Pa at depth 3 m with g = 10 N/kg. What is the density?", ["800 kg/m^3", "80 kg/m^3", "7200 kg/m^3", "1000 kg/m^3"], 0, "rho = p / gh.", hint),
    shortCases([
      { prompt: "Hydrostatic pressure depends on density, g, and ...", acceptedAnswers: words("depth"), hint },
      { prompt: "A 1000 kg/m^3 liquid at depth 6 m with g = 10 N/kg gives ... Pa.", acceptedAnswers: pressureAnswers(60000), hint },
      { prompt: "At fixed density and g, deeper points have ... pressure.", acceptedAnswers: words("greater", "higher", "more"), hint },
      { prompt: "At fixed depth and g, a denser liquid gives ... pressure.", acceptedAnswers: words("greater", "higher", "more"), hint },
      { prompt: "Pressure increase between two depths depends on the depth ...", acceptedAnswers: words("difference", "change"), hint },
      { prompt: "The factor often called World Pull in this module is gravitational field ...", acceptedAnswers: words("strength"), hint },
      { prompt: "Liquid pressure in a resting fluid is measured in ...", acceptedAnswers: words("Pa", "pascal", "pascals"), hint },
      { prompt: "Container width is not one of the direct hydrostatic ...", acceptedAnswers: words("factors", "variables"), hint },
      { prompt: "A 1200 kg/m^3 liquid at depth 2 m with g = 10 N/kg gives ... Pa.", acceptedAnswers: pressureAnswers(24000), hint },
      { prompt: "The shortcut relation for a pressure change is delta p = rho g delta ...", acceptedAnswers: words("h"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "The main trap is blaming the container shape instead of the liquid stack above the point.";
  return [
    mc("Why is container width a weak explanation for liquid pressure at a point?", ["Because pressure depends on depth, density, and g, not on the tank's width", "Because wider tanks remove gravity", "Because width is always equal to depth", "Because pressure ignores depth"], 0, "The point pressure is a local relation.", hint),
    mc("Why does a deeper point have greater pressure in the same liquid?", ["Because there is more liquid weight above it", "Because the container gets wider lower down", "Because density becomes zero at the surface", "Because pressure is a vector"], 0, "The taller liquid stack gives the greater pressure.", hint),
    mc("Why can a denser liquid give greater pressure at the same depth?", ["Because each metre of liquid above is heavier", "Because density changes the area", "Because density removes gravity", "Because depth no longer matters"], 0, "Denser layers contribute more weight per depth.", hint),
    mc("Why should g stay visible in a hydrostatic explanation?", ["Because the liquid pressure depends on the local gravitational field strength", "Because g is always equal to one", "Because g replaces density", "Because g only matters for solids"], 0, "This is a three-factor relation.", hint),
    mc("Why is a depth-change method often cleaner than calculating two full pressures and subtracting?", ["Because the increase depends only on the extra liquid stack added", "Because full pressures are always wrong", "Because delta h cancels density", "Because pressure does not depend on start depth"], 0, "Use the change directly when the change is what matters.", hint),
    mc("Why is the phrase 'pressure increases with depth' incomplete by itself?", ["Because density and g can also change the value", "Because depth never matters", "Because only density matters", "Because the pressure unit changes with depth"], 0, "Depth is essential but not alone.", hint),
    mc("Why is p = rho g h more rigorous than 'deeper means more pressure'?", ["Because it shows exactly which variables control the pressure and how", "Because it removes numbers", "Because it works only for one liquid", "Because it ignores the field"], 0, "The formula makes the mechanism explicit.", hint),
    mc("Why can two different liquids at the same depth give different pressures?", ["Because their densities can differ", "Because depth automatically fixes the pressure", "Because pressure ignores the liquid", "Because only the tank shape matters"], 0, "The rho term matters.", hint),
    mc("Why is hydrostatic pressure best thought of as a layer-stack story?", ["Because the point supports the liquid above it", "Because each layer cancels the next one", "Because stack height does not matter", "Because only the bottom of the tank matters"], 0, "This is the most useful mental model.", hint),
    mc("Why is 'same depth means same pressure' not always safe?", ["Because the liquid must also be the same", "Because same depth never matters", "Because depth is unrelated to pressure", "Because g automatically changes with depth"], 0, "The equality rule needs full conditions.", hint),
    shortCases([
      { prompt: "The hydrostatic relation keeps density, gravitational field strength, and ... together.", acceptedAnswers: words("depth"), hint },
      { prompt: "A deeper point has more liquid ... above it.", acceptedAnswers: words("above", "stack", "weight"), hint },
      { prompt: "At the same depth, a denser liquid gives ... pressure.", acceptedAnswers: words("greater", "higher"), hint },
      { prompt: "Tank width is a ...-shape issue, not a direct pressure factor.", acceptedAnswers: words("container", "vessel"), hint },
      { prompt: "A pressure increase comes from extra liquid ...", acceptedAnswers: words("depth", "layers", "stack"), hint },
      { prompt: "The local field factor in hydrostatic pressure is called gravitational field ...", acceptedAnswers: words("strength"), hint },
      { prompt: "The equation is more rigorous than a slogan because it keeps the real ... visible.", acceptedAnswers: words("variables", "factors"), hint },
      { prompt: "Same depth only guarantees equal pressure when the ... is also the same.", acceptedAnswers: words("liquid", "fluid"), hint },
      { prompt: "Hydrostatic pressure is a ... property in a resting liquid.", acceptedAnswers: words("local", "point"), hint },
      { prompt: "The phrase 'deeper means more pressure' should be repaired by adding the other two ...", acceptedAnswers: words("factors", "variables"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "The same-level rule needs the same liquid and the same depth.";
  return [
    mc("Two points in the same resting liquid are at the same depth. What is true?", ["They have the same pressure", "The wider side has more pressure", "The point nearer the wall has more pressure", "Pressure cannot be compared"], 0, "Equal depth in the same liquid gives equal pressure.", hint),
    mc("Two points are at the same depth but in different liquids. Can you assume equal pressure?", ["No, because the densities may differ", "Yes, depth alone is always enough", "Yes, because pressure ignores the liquid", "No, because pressure is only defined at the surface"], 0, "Same depth is not enough if the liquid changes.", hint),
    mc("In a weirdly shaped water tank, point A and point B are on different sides but at the same depth. Which statement is strongest?", ["Their pressures are equal", "The narrower side has higher pressure", "The curved side has lower pressure", "The lower wall angle decides the pressure"], 0, "Shape does not change pressure at one depth.", hint),
    mc("Point C is deeper than point A in the same water tank. Which is correct?", ["Point C has greater pressure", "Point C has the same pressure", "Point C has lower pressure", "Pressure cannot change within one tank"], 0, "Greater depth gives greater pressure.", hint),
    mc("Which condition breaks the same-level rule?", ["changing the depth", "changing the vessel shape only", "moving sideways at the same depth", "keeping the same liquid and level"], 0, "Depth or liquid changes break the equality.", hint),
    mc("Why is the same-level rule a local rule?", ["Because it compares pressure at chosen points, not whole container shapes", "Because it only works in small tanks", "Because local means near the surface", "Because pressure depends on wall angle"], 0, "Pressure is a property at a point.", hint),
    mc("If one point is 0.8 m deeper than another in the same liquid, which statement is correct?", ["The deeper point has greater pressure", "Both pressures are equal because the liquid is the same", "The shallower point has greater pressure", "The vessel shape decides"], 0, "Depth difference changes h.", hint),
    mc("Two sensors are at equal depth in the same water tank, one on a narrow section and one on a wide section. Their readings should...", ["match", "differ because of width", "differ because of shape", "be impossible to compare"], 0, "Equal depth wins over shape.", hint),
    mc("Which statement is weakest physics?", ["Narrower containers always give larger pressure at the same depth", "Pressure in a resting liquid depends on local conditions", "Same liquid and same depth give equal pressure", "A deeper point has greater pressure"], 0, "Container outline does not directly change the local pressure.", hint),
    mc("What is the key hidden condition in 'same level, same pressure'?", ["same liquid", "same container shape", "same wall angle", "same area"], 0, "The liquid must be the same too.", hint),
    shortCases([
      { prompt: "Same liquid and same depth gives the same ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "If the liquid changes, equal depth does not automatically mean equal ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "A deeper point in the same liquid has ... pressure.", acceptedAnswers: words("greater", "higher", "more"), hint },
      { prompt: "Container shape does not directly change pressure at one ...", acceptedAnswers: words("point", "location"), hint },
      { prompt: "The same-level rule compares local ...", acceptedAnswers: words("points", "locations"), hint },
      { prompt: "Equal depth in the same liquid defeats the shape ...", acceptedAnswers: words("misconception", "intuition"), hint },
      { prompt: "Pressure equality fails if depth or the ... changes.", acceptedAnswers: words("liquid", "fluid"), hint },
      { prompt: "The same-level rule is a hydrostatic ... condition.", acceptedAnswers: words("equality", "comparison"), hint },
      { prompt: "Pressure is a local property in a resting ...", acceptedAnswers: words("liquid", "fluid"), hint },
      { prompt: "The strongest shortcut sentence is same liquid plus same ... gives same pressure.", acceptedAnswers: words("depth", "level"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "This lesson is mainly about defeating the shape misconception carefully.";
  return [
    mc("Why is vessel shape not part of the same-level rule?", ["Because pressure at a point depends on the local liquid conditions, not the overall outline", "Because shape changes density to zero", "Because pressure exists only in straight tanks", "Because width cancels gravity"], 0, "The rule belongs to local hydrostatics.", hint),
    mc("Why is 'same depth, same pressure' safer than 'same container, same pressure'?", ["Because the local depth condition is what matters physically", "Because pressure ignores depth", "Because containers always have one pressure", "Because same container means same density automatically"], 0, "Depth is the decisive local condition.", hint),
    mc("Why must 'same liquid' stay in the rule?", ["Because different densities can give different pressures at the same depth", "Because liquids always have the same density", "Because the liquid never matters", "Because shape matters more than density"], 0, "The rho term must stay visible.", hint),
    mc("Why is a point-pressure idea more rigorous than a whole-tank slogan?", ["Because it tells you exactly where the pressure is being compared", "Because whole tanks cannot contain liquids", "Because pressure is not measured at points", "Because the whole tank has one single pressure"], 0, "Pressure is compared at locations.", hint),
    mc("Why is the same-level rule powerful in unusual vessel shapes?", ["Because it blocks the false idea that narrow regions automatically create higher pressure at equal depth", "Because it makes pressure independent of depth", "Because it removes density from physics", "Because it proves pressure is constant everywhere"], 0, "It directly defeats the shape-based misconception.", hint),
    mc("Why is a deeper point still different even in the same liquid?", ["Because the local h value is larger there", "Because same liquid forces equal pressure everywhere", "Because deeper points ignore rho", "Because depth changes only the container"], 0, "Depth still matters after the same-liquid condition is met.", hint),
    mc("Why is equal depth not enough across two different liquids?", ["Because the density factor can still differ", "Because equal depth never matters", "Because pressure cannot be compared across liquids", "Because only tank shape matters"], 0, "The same-level shortcut has conditions.", hint),
    mc("Why should a learner ask 'what is the same and what changed?' before using the same-level rule?", ["Because the rule works only when the correct conditions are preserved", "Because the rule is always true anyway", "Because pressure needs no conditions", "Because the liquid can be ignored"], 0, "Condition checking is the whole discipline.", hint),
    mc("Which statement best repairs 'the narrow side has greater pressure because the walls squeeze the water'?", ["Pressure at the same depth is set by the hydrostatic conditions, not wall crowding", "The narrow side is always higher pressure", "Walls create extra density", "Squeezing removes gravity"], 0, "The fluid statics relation beats the shape intuition.", hint),
    mc("Why is this lesson still connected to p = rho g h?", ["Because equal pressure at equal depth in the same liquid comes from matching rho, g, and h", "Because the same-level rule replaces the formula completely", "Because rho g h applies only to solids", "Because the same-level rule ignores h"], 0, "The shortcut is rooted in the full formula.", hint),
    shortCases([
      { prompt: "The same-level rule is a shortcut built from matching rho, g, and ...", acceptedAnswers: words("h", "depth"), hint },
      { prompt: "Shape affects the container outline, not the local ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "Equal depth across different liquids is unsafe because the ... may differ.", acceptedAnswers: words("density", "rho"), hint },
      { prompt: "Pressure comparisons should be tied to specific ...", acceptedAnswers: words("points", "locations"), hint },
      { prompt: "A narrow section does not automatically create higher pressure at the same ...", acceptedAnswers: words("depth", "level"), hint },
      { prompt: "The same-level shortcut is valid only when the liquid and the depth are both the ...", acceptedAnswers: words("same"), hint },
      { prompt: "A deeper point changes the local h value, so the pressure becomes ...", acceptedAnswers: words("greater", "higher"), hint },
      { prompt: "This lesson mainly repairs the vessel-shape ...", acceptedAnswers: words("misconception", "intuition"), hint },
      { prompt: "The strongest explanation uses local hydrostatic ...", acceptedAnswers: words("conditions", "variables"), hint },
      { prompt: "Pressure at a point is not set by wall crowding but by the fluid ... above.", acceptedAnswers: words("conditions", "column", "stack"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Pressure belongs to the location; force depends on pressure and the chosen patch area.";
  return [
    mc("Which formal relation links pressure at a point to force on a chosen patch?", ["F = pA", "p = rho g h", "F = ma", "P = E / t"], 0, "Use local pressure times patch area.", hint),
    mc("The pressure at a point is 12000 Pa. What force acts on a 0.30 m^2 patch there?", ["3600 N", "40000 N", "12000 N", "40 N"], 0, "Multiply pressure by area.", hint),
    mc("If the pressure stays fixed but the patch area doubles, the force becomes...", ["twice as large", "half as large", "unchanged", "four times as large"], 0, "Force is proportional to area at fixed pressure.", hint),
    mc("If the patch area stays fixed but the pressure doubles, the force becomes...", ["twice as large", "half as large", "unchanged", "four times as large"], 0, "Force is proportional to pressure at fixed area.", hint),
    mc("At the same point in a liquid, what stays the same for a wall patch and a floor patch?", ["the pressure value", "the force direction", "the force size for every area", "the unit of area"], 0, "Pressure is scalar at the point.", hint),
    mc("How does the force due to pressure act on a surface?", ["normal to the surface", "always vertically downward", "always horizontally inward", "parallel to the surface"], 0, "The force acts perpendicular to the patch.", hint),
    mc("A patch feels 9600 N where the pressure is 24000 Pa. What is the patch area?", ["0.40 m^2", "2.5 m^2", "230400000 m^2", "0.25 m^2"], 0, "A = F / p.", hint),
    mc("Which quantity is scalar in this lesson?", ["pressure", "force on the patch", "surface normal force direction", "resultant force"], 0, "Pressure has magnitude but no direction.", hint),
    mc("Which quantity changes when the patch is rotated at the same point?", ["the force direction", "the pressure value", "the liquid density", "the depth"], 0, "Patch orientation changes the normal direction.", hint),
    mc("Which statement is strongest?", ["At fixed pressure, a larger area collects a larger total force", "At fixed pressure, force is unchanged for every area", "A larger patch lowers the pressure at the point", "Pressure becomes a vector on a tilted surface"], 0, "The area controls the total force gathered by the patch.", hint),
    shortCases([
      { prompt: "At fixed pressure, doubling the patch area makes the force ...", acceptedAnswers: words("double", "doubles"), hint },
      { prompt: "The force due to pressure acts ... to the surface.", acceptedAnswers: words("normal", "perpendicular"), hint },
      { prompt: "A 18000 Pa pressure on a 0.20 m^2 patch gives ... N.", acceptedAnswers: forceAnswers(3600), hint },
      { prompt: "Pressure at a point is a ... quantity.", acceptedAnswers: words("scalar"), hint },
      { prompt: "Force on a patch depends on pressure and patch ...", acceptedAnswers: words("area"), hint },
      { prompt: "If force and pressure are known, area = force divided by ...", acceptedAnswers: words("pressure", "p"), hint },
      { prompt: "Changing the patch orientation changes the force direction, not the local ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "The unit of force on the patch is ...", acceptedAnswers: words("N", "newton", "newtons"), hint },
      { prompt: "A 15000 Pa pressure on 0.40 m^2 gives ... N.", acceptedAnswers: forceAnswers(6000), hint },
      { prompt: "At one point in a resting fluid, pressure does not care which ... you choose.", acceptedAnswers: words("patch", "surface patch", "orientation"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Do not collapse scalar pressure into the force vector on a chosen surface.";
  return [
    mc("Why is pressure described as scalar at a point?", ["Because it has magnitude but no direction of its own", "Because it is always vertical", "Because it is always normal to the wall", "Because it cannot change with depth"], 0, "The direction belongs to the force on a chosen patch, not to pressure itself.", hint),
    mc("Why can two patches at the same point have the same pressure but different force sizes?", ["Because the patch areas can differ", "Because pressure changes with patch tilt", "Because pressure becomes a vector on one patch", "Because only walls feel force"], 0, "F = pA explains the difference.", hint),
    mc("Why can two patches at the same point have forces in different directions?", ["Because each force is normal to its own surface", "Because the pressure chooses a direction", "Because depth changes instantly", "Because density depends on the wall angle"], 0, "Orientation changes the normal direction.", hint),
    mc("Why is 'pressure points sideways' a weak statement?", ["Because pressure is not itself a vector direction in this lesson", "Because sideways forces are impossible", "Because only vertical forces exist in fluids", "Because fluids have no pressure"], 0, "Keep pressure scalar and force vector separate.", hint),
    mc("Why is F = pA stronger than a force-only description for surface patches?", ["Because it keeps the local pressure and the patch area visible together", "Because it ignores area", "Because it removes pressure from the story", "Because force alone fixes pressure"], 0, "The relation shows where the force comes from.", hint),
    mc("Why should a learner ask 'same point or different point?' before comparing fluid forces?", ["Because pressure changes from point to point in the fluid", "Because all points have the same pressure", "Because patch area never matters", "Because force direction fixes the depth"], 0, "Location is part of the comparison.", hint),
    mc("Why is a larger patch at the same point not evidence of larger pressure?", ["Because the pressure can stay the same while the larger area gathers more total force", "Because larger area always lowers force", "Because pressure equals force only", "Because only small patches can feel pressure"], 0, "Area changes force without changing p.", hint),
    mc("Why is a point-pressure story different from a hydrostatic-depth story?", ["Because one fixes the local pressure first, then studies the chosen patch and force", "Because depth no longer matters anywhere", "Because force replaces pressure", "Because patch area sets the depth"], 0, "This lesson builds from the local pressure value to the surface force.", hint),
    mc("Why must surface orientation stay visible in M4_L5?", ["Because the force due to pressure turns to remain perpendicular to the chosen surface", "Because orientation changes pressure", "Because orientation changes density", "Because only horizontal surfaces are valid"], 0, "Orientation affects force direction, not pressure value.", hint),
    mc("Why is a point-pressure reading not enough by itself to know the force on a hatch?", ["Because you also need the hatch area", "Because force never depends on pressure", "Because all hatches feel the same force", "Because the pressure unit already contains area"], 0, "Area is still required in F = pA.", hint),
    shortCases([
      { prompt: "Pressure at a point is a ..., but the force on a patch is a vector.", acceptedAnswers: words("scalar"), hint },
      { prompt: "The force due to pressure acts along the surface ...", acceptedAnswers: words("normal", "perpendicular"), hint },
      { prompt: "At the same point, larger area means larger ...", acceptedAnswers: words("force"), hint },
      { prompt: "At the same point, changing patch tilt changes force ..., not pressure.", acceptedAnswers: words("direction"), hint },
      { prompt: "To get force from pressure, multiply by the patch ...", acceptedAnswers: words("area"), hint },
      { prompt: "Pressure belongs to the ... in the fluid.", acceptedAnswers: words("location", "point"), hint },
      { prompt: "The force vector belongs to the chosen ...", acceptedAnswers: words("surface", "patch"), hint },
      { prompt: "A larger force at the same point does not automatically mean larger ...", acceptedAnswers: words("pressure"), hint },
      { prompt: "Pressure and force should be kept conceptually ...", acceptedAnswers: words("separate", "distinct"), hint },
      { prompt: "Orientation matters because the force stays ... to the surface.", acceptedAnswers: words("normal", "perpendicular"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Below an open surface, total pressure is atmospheric pressure plus the liquid contribution.";
  return [
    mc("Which relation belongs to total pressure below the surface of an open liquid?", ["p_total = p_atm + rho g h", "p = F / A", "F = ma", "P = E / t"], 0, "Open-liquid pressure includes atmosphere and liquid.", hint),
    mc("Atmospheric pressure is 100000 Pa. At depth 3 m in water with rho = 1000 kg/m^3 and g = 10 N/kg, what is the total pressure?", ["130000 Pa", "30000 Pa", "103000 Pa", "70000 Pa"], 0, "Add 100000 Pa and 30000 Pa.", hint),
    mc("What does rho g h represent in an open-liquid total-pressure question?", ["the liquid contribution only", "the total pressure always", "the atmospheric pressure only", "the force on the patch"], 0, "Do not silently drop the atmosphere.", hint),
    mc("At the same depth in the same liquid, which diver has the greater total pressure?", ["the diver at lower altitude with higher atmospheric pressure", "the diver at higher altitude", "they always match", "pressure cannot be compared"], 0, "The liquid part is the same, so the atmosphere decides the difference.", hint),
    mc("If depth doubles in the same open liquid at the same altitude, what happens to the liquid contribution?", ["it doubles", "it quadruples", "it halves", "it stays the same"], 0, "rho g h is linear in depth.", hint),
    mc("If atmospheric pressure falls by 10000 Pa while depth and liquid stay fixed, total pressure...", ["falls by 10000 Pa", "stays the same", "rises by 10000 Pa", "falls by 5000 Pa"], 0, "The liquid part is unchanged, so the total follows the atmospheric change.", hint),
    mc("A point 5 m below water has liquid contribution 50000 Pa. If atmospheric pressure is 86000 Pa, what total pressure is produced?", ["136000 Pa", "50000 Pa", "36000 Pa", "43000 Pa"], 0, "Add the two contributions.", hint),
    mc("Which statement is strongest?", ["Air also loads the liquid surface, so open-liquid pressure includes atmospheric pressure", "Atmospheric pressure can be ignored below the surface", "Only rho g h matters in every liquid question", "Atmospheric pressure matters only in solids"], 0, "The total open-liquid story keeps the atmosphere visible.", hint),
    mc("Two divers are each 3 m below the surface of water. Sea-level atmospheric pressure is 101000 Pa; plateau atmospheric pressure is 89000 Pa. What is the difference in their total pressures?", ["12000 Pa", "30000 Pa", "101000 Pa", "0 Pa"], 0, "The liquid part is equal, so subtract the atmospheric values.", hint),
    mc("Which statement is weakest physics?", ["At any depth in an open liquid, total pressure is just rho g h", "Total pressure in an open liquid includes atmospheric pressure", "Same depth but different altitude can change total pressure", "The liquid contribution depends on rho, g, and h"], 0, "rho g h alone is not the total pressure in an open liquid.", hint),
    shortCases([
      { prompt: "In an open liquid, total pressure is atmospheric pressure plus the liquid ...", acceptedAnswers: words("contribution", "part"), hint },
      { prompt: "At 2 m depth in water with rho = 1000 kg/m^3 and g = 10 N/kg, the liquid contribution is ... Pa.", acceptedAnswers: pressureAnswers(20000), hint },
      { prompt: "If atmospheric pressure is 95000 Pa and the liquid contribution is 40000 Pa, total pressure is ... Pa.", acceptedAnswers: pressureAnswers(135000), hint },
      { prompt: "At the same depth in the same liquid, the difference in total pressure between two sites comes from the ... pressure.", acceptedAnswers: words("atmospheric", "air"), hint },
      { prompt: "rho g h does not include the ... contribution.", acceptedAnswers: words("atmospheric", "air"), hint },
      { prompt: "Lower altitude usually means ... atmospheric pressure.", acceptedAnswers: words("greater", "higher"), hint },
      { prompt: "Open-liquid pressure belongs to one combined ... story.", acceptedAnswers: words("total", "account", "ledger"), hint },
      { prompt: "If the liquid depth stays fixed but altitude rises, total pressure ...", acceptedAnswers: words("falls", "decreases", "drops"), hint },
      { prompt: "The total open-liquid pressure is measured in ...", acceptedAnswers: words("Pa", "pascal", "pascals"), hint },
      { prompt: "The atmospheric part plus the liquid part gives the ... pressure.", acceptedAnswers: words("total"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "The main trap is treating rho g h as if it were already the full open-liquid pressure.";
  return [
    mc("Why is rho g h not the whole answer for total pressure below an open liquid surface?", ["Because atmospheric pressure also presses on the liquid from above", "Because rho g h already includes the air automatically", "Because liquids have no atmosphere", "Because total pressure equals force"], 0, "The atmosphere is an extra contribution.", hint),
    mc("Why can two divers at the same depth have different total pressures?", ["Because the atmospheric pressure at the surface can differ between locations", "Because same depth fixes total pressure everywhere", "Because water density always changes with altitude", "Because depth no longer matters"], 0, "The atmosphere can shift the total while the liquid part stays the same.", hint),
    mc("Why is it useful to calculate the liquid contribution first and then add the atmospheric part?", ["Because it keeps the two contributions conceptually separate before forming the total", "Because the atmospheric part cancels", "Because total pressure is impossible otherwise", "Because the liquid part already equals the total"], 0, "This sequencing prevents dropping a term.", hint),
    mc("Why is 'same depth means same total pressure' too weak in open-liquid problems?", ["Because the atmospheric pressure may differ even if the liquid depth is the same", "Because same depth never matters", "Because depth changes only the atmosphere", "Because total pressure ignores the liquid"], 0, "Same depth fixes only the liquid contribution if the liquid is the same.", hint),
    mc("Why does lower altitude often give greater total pressure at the same depth?", ["Because the atmospheric contribution is usually larger lower down", "Because lower altitude changes the depth", "Because the liquid becomes less dense", "Because gravity disappears"], 0, "More air above means more atmospheric load.", hint),
    mc("Why is M4_L6 still part of the same pressure module instead of a separate air-pressure topic?", ["Because atmospheric and liquid pressures add into one total patch-load story", "Because atmospheric pressure has different units", "Because liquids stop obeying pressure laws", "Because air pressure replaces hydrostatic pressure"], 0, "The module is unifying the contributions, not splitting them.", hint),
    mc("Why is 'ignore the atmosphere because water is denser' not a safe rule?", ["Because atmospheric pressure can still be a large part of the total", "Because density makes the atmosphere impossible", "Because only the atmosphere matters", "Because denser liquids remove the surface"], 0, "The total depends on both contributions.", hint),
    mc("Why does p_total = p_atm + rho g h give a more rigorous answer than a single-term shortcut?", ["Because it keeps both the sky-blanket load and the liquid-stack load visible", "Because it removes the need for depth", "Because it works only for air", "Because it ignores the field strength"], 0, "The full relation makes the physics explicit.", hint),
    mc("Why is a same-liquid same-depth comparison still useful in M4_L6?", ["Because it isolates the atmospheric difference when the liquid contribution is the same", "Because it proves the atmosphere never matters", "Because it removes rho g h from the problem", "Because all totals must then be identical"], 0, "Equal liquid parts can make the atmospheric contrast clearer.", hint),
    mc("Why is total pressure best described as a combined account?", ["Because separate contributions add together at the point", "Because one term replaces the other", "Because only the larger term survives", "Because pressure cannot be decomposed"], 0, "The total is a sum of contributions.", hint),
    shortCases([
      { prompt: "Below an open surface, rho g h is the liquid part, not the full ...", acceptedAnswers: words("total pressure", "total"), hint },
      { prompt: "At fixed depth, a lower-altitude site often has higher ... pressure.", acceptedAnswers: words("total"), hint },
      { prompt: "Open-liquid pressure combines the liquid stack with the sky-... contribution.", acceptedAnswers: words("blanket", "atmospheric"), hint },
      { prompt: "Atmospheric pressure is a surface contribution from the ... above.", acceptedAnswers: words("air"), hint },
      { prompt: "Same depth in the same liquid can isolate the atmospheric ... between sites.", acceptedAnswers: words("difference"), hint },
      { prompt: "The strongest total-pressure equation keeps two ... visible.", acceptedAnswers: words("contributions", "parts", "terms"), hint },
      { prompt: "Ignoring the atmosphere in an open-tank total-pressure question leaves the answer ...", acceptedAnswers: words("incomplete", "wrong"), hint },
      { prompt: "Total pressure is a combined ... rather than a one-term shortcut.", acceptedAnswers: words("account", "ledger", "sum"), hint },
      { prompt: "Lower altitude usually means more ... above the surface.", acceptedAnswers: words("air"), hint },
      { prompt: "The full M4_L6 story is atmosphere plus liquid, not atmosphere versus ...", acceptedAnswers: words("liquid"), hint },
    ]),
  ];
}

const M4_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M4_L1: l1DiagnosticRaw,
  M4_L2: l2DiagnosticRaw,
  M4_L3: l3DiagnosticRaw,
  M4_L4: l4DiagnosticRaw,
  M4_L5: l5DiagnosticRaw,
  M4_L6: l6DiagnosticRaw,
};

const M4_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  M4_L1: l1ConceptRaw,
  M4_L2: l2ConceptRaw,
  M4_L3: l3ConceptRaw,
  M4_L4: l4ConceptRaw,
  M4_L5: l5ConceptRaw,
  M4_L6: l6ConceptRaw,
};

const M4_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(M4_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...M4_DIAGNOSTIC_BUILDERS[code](), ...M4_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function m4GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M4_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function m4GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M4_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function m4GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = M4_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
