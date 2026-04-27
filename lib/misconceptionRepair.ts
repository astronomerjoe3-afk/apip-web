export type MisconceptionRepairSummary = {
  tag: string;
  title: string;
  diagnosis: string;
  repair: string;
  noticeNext: string;
};

type MisconceptionRepairContext = {
  tag?: string | null;
  prompt?: string | null;
  learnerAnswer?: string | string[] | null;
  correctAnswer?: string | string[] | null;
  teachingFocus?: string | null;
};

type MisconceptionTemplate = Omit<MisconceptionRepairSummary, "tag">;

function normalizeRepairText(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.join(" ").trim().toLowerCase();
  }
  return String(value || "").trim().toLowerCase();
}

function displayRepairText(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.join(" / ").trim();
  }
  return String(value || "").trim();
}

function includesAny(source: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(source));
}

function genericContextualRepair(
  tag: string | null | undefined,
  correctText: string,
  focusText: string,
): MisconceptionRepairSummary | null {
  const cleanCorrect = displayRepairText(correctText);
  const cleanFocus = displayRepairText(focusText);
  if (!cleanCorrect && !cleanFocus) {
    return null;
  }

  const title = cleanFocus || "Use the correct physics idea here";
  const answerLead = cleanCorrect
    ? `For this question, use ${cleanCorrect}.`
    : "For this question, rebuild the answer from the physics idea, not from the surface wording.";
  const why = cleanFocus
    ? `${cleanFocus} Make that idea do the work before you choose an option.`
    : "The correction works because it matches the quantity or relationship the question is actually testing.";

  return {
    tag: String(tag || "contextual_repair"),
    title,
    diagnosis: why,
    repair: answerLead,
    noticeNext: "Next time, name the quantity first, then decide what the question is asking you to compare or calculate.",
  };
}

type JourneyDirection = "east" | "west" | "north" | "south";

type JourneyLeg = {
  magnitude: number;
  direction: JourneyDirection;
  unit: string;
};

type JourneySummary = {
  legs: JourneyLeg[];
  unit: string;
  totalDistance: number;
  distanceText: string;
  displacementText: string;
  stageText: string;
  totalTime: number | null;
  totalTimeText: string | null;
  averageSpeedText: string | null;
};

type DensityUnit = "kg/m^3" | "g/cm^3";

type DensityValue = {
  value: number;
  unit: DensityUnit;
};

function formatJourneyNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function parseJourneyLegs(text: string): JourneyLeg[] {
  const legs: JourneyLeg[] = [];
  const legPattern = /\b(\d+(?:\.\d+)?)\s*(km|cm|mm|m)\s*(east|west|north|south)\b/gi;
  let match: RegExpExecArray | null;

  while ((match = legPattern.exec(text)) !== null) {
    legs.push({
      magnitude: Number(match[1]),
      unit: match[2].toLowerCase(),
      direction: match[3].toLowerCase() as JourneyDirection,
    });
  }

  return legs;
}

function summarizeJourney(text: string): JourneySummary | null {
  const legs = parseJourneyLegs(text);
  if (legs.length === 0) {
    return null;
  }

  const unit = legs[0].unit;
  let totalDistance = 0;
  let eastWest = 0;
  let northSouth = 0;

  for (const leg of legs) {
    totalDistance += leg.magnitude;
    if (leg.direction === "east") {
      eastWest += leg.magnitude;
    } else if (leg.direction === "west") {
      eastWest -= leg.magnitude;
    } else if (leg.direction === "north") {
      northSouth += leg.magnitude;
    } else {
      northSouth -= leg.magnitude;
    }
  }

  const stageText = legs
    .map((leg) => `${formatJourneyNumber(leg.magnitude)} ${leg.unit}`)
    .join(" + ");

  let displacementText = `0 ${unit}`;
  if (eastWest !== 0 && northSouth === 0) {
    displacementText = `${formatJourneyNumber(Math.abs(eastWest))} ${unit} ${eastWest > 0 ? "east" : "west"}`;
  } else if (northSouth !== 0 && eastWest === 0) {
    displacementText = `${formatJourneyNumber(Math.abs(northSouth))} ${unit} ${northSouth > 0 ? "north" : "south"}`;
  } else if (eastWest !== 0 || northSouth !== 0) {
    const parts: string[] = [];
    if (eastWest !== 0) {
      parts.push(`${formatJourneyNumber(Math.abs(eastWest))} ${unit} ${eastWest > 0 ? "east" : "west"}`);
    }
    if (northSouth !== 0) {
      parts.push(`${formatJourneyNumber(Math.abs(northSouth))} ${unit} ${northSouth > 0 ? "north" : "south"}`);
    }
    displacementText = parts.join(" and ");
  }

  const timeMatches = [...text.matchAll(/\b(\d+(?:\.\d+)?)\s*s\b/gi)];
  const totalTime =
    timeMatches.length > 0
      ? timeMatches.reduce((sum, match) => sum + Number(match[1]), 0)
      : null;
  const totalTimeText = totalTime === null ? null : `${formatJourneyNumber(totalTime)} s`;
  const averageSpeedText =
    totalTime && totalTime > 0
      ? `${formatJourneyNumber(totalDistance / totalTime)} ${unit}/s`
      : null;

  return {
    legs,
    unit,
    totalDistance,
    distanceText: `${formatJourneyNumber(totalDistance)} ${unit}`,
    displacementText,
    stageText,
    totalTime,
    totalTimeText,
    averageSpeedText,
  };
}

function extractRepairNumber(text: string): number | null {
  const match = text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i);
  if (!match) {
    return null;
  }
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

function detectDensityUnit(text: string): DensityUnit | null {
  if (includesAny(text, [/kg\/m\^?3/, /kg\/m3/, /kg\/m³/, /kg m\^-?3/, /kg per m\^?3/, /kg per m3/, /kg per m³/])) {
    return "kg/m^3";
  }
  if (includesAny(text, [/g\/cm\^?3/, /g\/cm3/, /g\/cm³/, /g cm\^-?3/, /g per cm\^?3/, /g per cm3/, /g per cm³/])) {
    return "g/cm^3";
  }
  return null;
}

function parseDensityValue(text: string): DensityValue | null {
  const unit = detectDensityUnit(text);
  const value = extractRepairNumber(text);
  if (!unit || value === null) {
    return null;
  }
  return { value, unit };
}

function isApproxFactor(
  numerator: number,
  denominator: number,
  target: number,
  tolerance = 0.05,
): boolean {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return false;
  }
  const ratio = numerator / denominator;
  return Math.abs(ratio - target) / target <= tolerance;
}

const EXACT_SUMMARIES: Record<string, MisconceptionTemplate> = {
  vector_scalar_confusion: {
    title: "Vector vs scalar direction logic",
    diagnosis: "The answer is mixing up quantity size with quantity direction, so two related ideas are being treated as the same thing.",
    repair: "Name the quantity first, then ask whether direction changes its meaning. If direction is essential, the quantity is acting like a vector.",
    noticeNext: "Watch for unit pairs that look similar but mean different physics once direction matters.",
  },
  distance_displacement_confusion: {
    title: "Distance vs displacement reasoning",
    diagnosis: "The answer is treating total journey length as the same idea as overall change in position.",
    repair: "Track the full path for distance, but compare start and finish position for displacement.",
    noticeNext: "When a journey includes turning back, distance and displacement usually separate sharply.",
  },
  velocity_direction_confusion: {
    title: "Velocity needs direction",
    diagnosis: "The answer is reading velocity like speed and dropping the directional part of the motion.",
    repair: "Keep speed for size-only motion and velocity for speed with direction attached.",
    noticeNext: "If the prompt asks about east, west, up, down, or reversal, direction is part of the physics.",
  },
  acceleration_sign_confusion: {
    title: "Acceleration sign and direction",
    diagnosis: "The answer is reading negative acceleration as 'slowing down' automatically instead of checking the chosen direction convention.",
    repair: "State the positive direction first, then decide whether the acceleration points with it or against it.",
    noticeNext: "Negative acceleration means opposite to the chosen positive direction, not automatically less speed.",
  },
  distance_time_graph_error: {
    title: "Distance-time graph meaning",
    diagnosis: "The answer is matching the graph by appearance instead of translating the axes and the segment meaning into a motion story.",
    repair: "Read one segment at a time. Height gives distance from the reference point, and slope tells how that distance changes.",
    noticeNext: "A flat line means time still passes while distance stays constant.",
  },
  velocity_time_graph_error: {
    title: "Velocity-time graph meaning",
    diagnosis: "The answer is mixing up graph height, graph slope, and graph area on a velocity-time graph.",
    repair: "Height gives velocity at that instant, slope gives acceleration, and area gives change in displacement.",
    noticeNext: "Name the axes first before deciding what the graph feature means.",
  },
  balanced_force_motion_confusion: {
    title: "Balanced force and motion change",
    diagnosis: "The answer is assuming balanced forces mean no motion instead of no change in motion.",
    repair: "Use the resultant first. A zero resultant means zero acceleration, so the current velocity can stay unchanged.",
    noticeNext: "Keep 'no change in velocity' separate from 'velocity equals zero'.",
  },
  resultant_force_error: {
    title: "Resultant force reasoning",
    diagnosis: "The answer is focusing on the number or appearance of forces instead of the single combined force on one object.",
    repair: "Collapse the force story to one object and one resultant before you predict what the motion does next.",
    noticeNext: "Counted arrows do not matter as much as the final force balance on the object.",
  },
  inertia_force_confusion: {
    title: "Inertia vs force",
    diagnosis: "The answer is treating inertia as if it were an extra force acting on the object.",
    repair: "Keep inertia as the tendency to resist change in velocity, while forces are the interactions that can cause that change.",
    noticeNext: "If the question is about resisting change, ask whether it is describing a property or an interaction.",
  },
  fma_relationship_error: {
    title: "Force, mass, and acceleration link",
    diagnosis: "The answer is not keeping the proportional relationship in F = ma tied to the same object and the same resultant force.",
    repair: "Name the resultant force, then compare how mass and acceleration change for that object only.",
    noticeNext: "A larger mass changes acceleration only when you are comparing the same resultant force.",
  },
  work_energy_transfer_confusion: {
    title: "Work as an energy hand-off",
    diagnosis: "The answer is not keeping work tied to the transfer of energy through a force acting over a distance.",
    repair: "Describe the hand-off first: force through distance transfers energy into or out of a store.",
    noticeNext: "If the question mentions pushing through a distance, check whether it is really asking about energy transfer.",
  },
  gravitational_potential_energy_error: {
    title: "Gravitational store factors",
    diagnosis: "The answer is dropping one of the three key factors in gravitational store: mass, field strength, or height.",
    repair: "Keep all three factors visible and change only one at a time when comparing situations.",
    noticeNext: "If two situations keep height the same, field strength can still change the store.",
  },
  kinetic_energy_relationship_error: {
    title: "Kinetic energy relationship",
    diagnosis: "The answer is underestimating how strongly speed changes the motion store.",
    repair: "Compare mass and speed carefully, then remember that kinetic energy grows with the square of speed.",
    noticeNext: "Doubling speed has a much bigger effect than doubling mass.",
  },
  efficiency_calculation_error: {
    title: "Efficiency and useful fraction",
    diagnosis: "The answer is treating the total input as if it all stays useful.",
    repair: "Separate the full input from the useful output, then compare the useful fraction to the total.",
    noticeNext: "A faster machine is not automatically a more efficient one.",
  },
  power_rate_confusion: {
    title: "Power as rate",
    diagnosis: "The answer is mixing up total energy transferred with how fast that transfer happens.",
    repair: "Keep the total transfer and the transfer time separate, then compare the rate.",
    noticeNext: "Power changes when the same energy moves in a different time.",
  },
  momentum_vector_confusion: {
    title: "Momentum direction logic",
    diagnosis: "The answer is treating momentum as size only and dropping its directional nature.",
    repair: "Track momentum with both magnitude and direction, just as you would for velocity.",
    noticeNext: "Collisions and reversals usually punish momentum questions that ignore direction.",
  },
  momentum_conservation_confusion: {
    title: "Momentum conservation logic",
    diagnosis: "The answer is applying conservation to one object instead of the full system or ignoring how momenta balance together.",
    repair: "Choose the system boundary first, then compare total momentum before and after within that same system.",
    noticeNext: "Conservation claims are strongest when you can name the whole interacting system explicitly.",
  },
  collision_safety_reasoning_confusion: {
    title: "Collision safety reasoning",
    diagnosis: "The answer is skipping the change-in-time idea that explains why safety features reduce force on the body.",
    repair: "Connect the same change in momentum to a longer stopping time, then to a smaller average force.",
    noticeNext: "Safety questions often hinge on impulse spread over time, not on removing momentum entirely.",
  },
  braking_energy_comparison_confusion: {
    title: "Braking and energy comparison",
    diagnosis: "The answer is not keeping the energy change and the speed comparison tied together through the whole stop.",
    repair: "Start from the motion energy before braking, then compare how much must be transferred out during the stop.",
    noticeNext: "Braking questions often reward comparing initial motion stores before thinking about stopping force.",
  },
  unit_quantity_mismatch: {
    title: "Unit-to-quantity mismatch",
    diagnosis: "The answer is pairing a quantity with the wrong standard unit.",
    repair: "Name the physical quantity first, then match it to the agreed unit rather than a familiar-looking symbol.",
    noticeNext: "Related quantities can share words in the prompt but still need different units.",
  },
  unit_as_label_only: {
    title: "Units as scale, not just labels",
    diagnosis: "The answer is treating the unit like a label instead of a scale that changes the size of the number.",
    repair: "State the conversion factor explicitly so the new unit stays tied to the same physical quantity.",
    noticeNext: "Prefixes only make sense when the factor linking the two scales is clear.",
  },
  prefix_scale_error: {
    title: "Prefix and scale conversion",
    diagnosis: "The answer is moving the decimal without naming the power-of-ten factor underneath it.",
    repair: "Write the factor first, then convert the number using that factor.",
    noticeNext: "The safest conversion is the one you can justify with the unit scale, not just a decimal trick.",
  },
  precision_vs_accuracy: {
    title: "Precision vs accuracy",
    diagnosis: "The answer is mixing up closeness to the accepted value with closeness between repeated results.",
    repair: "Use accuracy for closeness to the accepted value and precision for spread between repeated results.",
    noticeNext: "A result can be precise without being accurate if the readings cluster around the wrong value.",
  },
  random_vs_systematic_error: {
    title: "Random vs systematic error",
    diagnosis: "The answer is not separating scatter in the readings from a consistent bias in the setup.",
    repair: "Random error changes the spread. Systematic error shifts the whole set in one direction.",
    noticeNext: "If the same bias appears every time, it is probably not a random effect.",
  },
  precision_trust_error: {
    title: "Measurement trust and uncertainty",
    diagnosis: "The answer is reporting a value without checking whether the scale and uncertainty justify that confidence.",
    repair: "Read the instrument carefully, then state the value only to the precision the scale can support.",
    noticeNext: "Trustworthy measurements are limited by the instrument, not by how many digits you want to write.",
  },
  flat_line_time_confusion: {
    title: "Flat line and passing time",
    diagnosis: "The answer is reading a flat segment as if time stopped instead of distance staying constant.",
    repair: "Keep time moving along the horizontal axis and let the unchanged vertical value tell you the object is stationary.",
    noticeNext: "Flat does not mean blank; it means the tracked quantity stayed fixed while time continued.",
  },
  height_vs_slope_confusion: {
    title: "Graph height vs slope",
    diagnosis: "The answer is mixing the value shown by the graph height with the change rate shown by the slope.",
    repair: "Ask whether the question wants the vertical-axis value now or how quickly that value is changing.",
    noticeNext: "Height and steepness can both matter, but they rarely mean the same thing.",
  },
  slope_meaning_confusion: {
    title: "Slope depends on the axes",
    diagnosis: "The answer is assuming the same steepness always means the same physics quantity.",
    repair: "Name the axes before naming the slope. The graph family decides what the steepness represents.",
    noticeNext: "The geometry can match while the physics meaning changes completely.",
  },
  area_under_graph_confusion: {
    title: "Area under the graph meaning",
    diagnosis: "The answer is treating the line itself as the total quantity instead of the shaded region beneath it.",
    repair: "Use the units made by the vertical and horizontal axes together to decide why the area matters.",
    noticeNext: "Area questions reward checking the combined units, not just the shape.",
  },
  third_law_cancellation: {
    title: "Third-law pair cancellation",
    diagnosis: "The answer is cancelling equal and opposite forces that act on different objects.",
    repair: "Choose one object first, then keep only the forces acting on that object in the free-body story.",
    noticeNext: "Equal and opposite does not mean cancel if the forces belong to different objects.",
  },
  zero_resultant_zero_motion: {
    title: "Zero resultant vs zero motion",
    diagnosis: "The answer is turning 'no change in velocity' into 'velocity must be zero.'",
    repair: "Use the resultant to decide acceleration, then ask what the current velocity was already doing.",
    noticeNext: "Balanced forces freeze the change, not necessarily the motion.",
  },
  torque_reach_confusion: {
    title: "Torque depends on reach",
    diagnosis: "The answer is focusing on force size alone and ignoring how far the force acts from the pivot.",
    repair: "Compare the perpendicular distance from the pivot before you compare turning effect.",
    noticeNext: "A large force through the pivot can still produce no turning effect.",
  },
  stability_line_of_action: {
    title: "Stability follows the line of action",
    diagnosis: "The answer is predicting tipping from size or mass alone without checking where the weight line lands.",
    repair: "Track the line of action relative to the support base before you predict whether the system tips.",
    noticeNext: "Stability questions are usually decided by position, not by one headline number.",
  },
  energy_leak_accounting: {
    title: "Leak and useful gain accounting",
    diagnosis: "The answer is letting useful output ignore the energy that leaked away.",
    repair: "Balance the input as useful gain plus leak before you place the useful part into stores.",
    noticeNext: "A ledger only works when every joule ends up in a named destination.",
  },
  gravitational_store_factor_confusion: {
    title: "Gravitational store comparison",
    diagnosis: "The answer is collapsing mass, field strength, and height into one vague rule.",
    repair: "Hold two factors steady and change one at a time so the store comparison stays honest.",
    noticeNext: "The store comparison is clearer when the changing factor is named explicitly.",
  },
  useful_transfer_confusion: {
    title: "Useful gain vs total transfer",
    diagnosis: "The answer is treating the useful gain as identical to the full input transfer.",
    repair: "Keep the total hand-off and the useful part separate, then place the losses where they occur.",
    noticeNext: "Useful output becomes smaller whenever leaks are real parts of the chain.",
  },
  power_efficiency_confusion: {
    title: "Power vs efficiency",
    diagnosis: "The answer is turning 'faster' into 'more efficient' without checking the useful fraction.",
    repair: "Use time for power and useful fraction for efficiency, then keep those two comparisons apart.",
    noticeNext: "Rate and yield are different questions even when they describe the same machine.",
  },
  multi_stage_energy_order: {
    title: "Multi-stage energy order",
    diagnosis: "The answer is skipping straight to the final stage without following the intermediate gains and losses.",
    repair: "Run the chain in sequence so each stage becomes the next stage's input before you judge the outcome.",
    noticeNext: "Multi-stage problems usually break when one intermediate step is skipped.",
  },
};

function titleCaseTag(tag: string): string {
  return tag
    .replace(/^concept_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function templateFromHeuristic(tag: string): MisconceptionTemplate {
  if (tag.includes("graph")) {
    return {
      title: "Graph meaning interpretation",
      diagnosis: "The answer is reading the graph by surface appearance instead of by the quantity shown on each axis.",
      repair: "Name the axes, then decide what the feature means physically before you choose an answer.",
      noticeNext: "Graph questions usually reward physics meaning over visual pattern-matching.",
    };
  }
  if (tag.includes("vector") || tag.includes("direction")) {
    return {
      title: "Direction-sensitive quantity reasoning",
      diagnosis: "The answer is losing the directional part of the quantity and flattening it into a size-only idea.",
      repair: "Ask whether direction changes the meaning of the quantity before you classify or compare it.",
      noticeNext: "Shared units do not guarantee two quantities mean the same thing.",
    };
  }
  if (tag.includes("force") || tag.includes("torque") || tag.includes("stability")) {
    return {
      title: "Force-system reasoning",
      diagnosis: "The answer is not keeping the object, pivot, or resultant clear enough before predicting the outcome.",
      repair: "Reduce the situation to one object or pivot, then decide what the combined force or turning effect says.",
      noticeNext: "Mechanics gets clearer when the force story is tied to one system at a time.",
    };
  }
  if (tag.includes("energy") || tag.includes("power") || tag.includes("efficiency") || tag.includes("work")) {
    return {
      title: "Energy-transfer accounting",
      diagnosis: "The answer is not keeping the full transfer chain and the useful share separate enough.",
      repair: "Track input, useful gain, and leak in order before deciding what reaches the final store.",
      noticeNext: "Energy questions reward honest accounting more than shortcut language.",
    };
  }
  if (tag.includes("unit") || tag.includes("measurement") || tag.includes("prefix")) {
    return {
      title: "Measurement and unit reasoning",
      diagnosis: "The answer is using a number rule without anchoring it to the physical scale or unit meaning.",
      repair: "State the quantity and conversion factor first, then complete the number step.",
      noticeNext: "A safe measurement answer can always explain the scale behind it.",
    };
  }

  return {
    title: titleCaseTag(tag),
    diagnosis: "The answer is mixing up the core relationship this question is testing.",
    repair: "Name the quantity or relationship first, then rebuild the answer from that idea instead of from pattern-matching.",
    noticeNext: "When the idea is named clearly, the exam move usually becomes much easier to see.",
  };
}

export function misconceptionSummaryForTag(tag?: string | null): MisconceptionRepairSummary | null {
  const normalized = String(tag || "").trim();
  if (!normalized) {
    return null;
  }

  const template = EXACT_SUMMARIES[normalized] || templateFromHeuristic(normalized);
  return {
    tag: normalized,
    ...template,
  };
}

export function misconceptionSummaryForContext({
  tag,
  prompt,
  learnerAnswer,
  correctAnswer,
  teachingFocus,
}: MisconceptionRepairContext): MisconceptionRepairSummary | null {
  const promptText = normalizeRepairText(prompt);
  const answerText = normalizeRepairText(learnerAnswer);
  const correctText = normalizeRepairText(correctAnswer);
  const focusText = normalizeRepairText(teachingFocus);
  const displayCorrectText = displayRepairText(correctAnswer);
  const displayFocusText = displayRepairText(teachingFocus);
  const source = [promptText, answerText, correctText, focusText].filter(Boolean).join(" ");
  const journeySummary = summarizeJourney(promptText);

  const isConstantVelocityAccelerationCheck =
    /constant velocity|same velocity|keeps the same velocity|velocity stays the same|horizontal line|horizontal section|flat line/.test(source)
    && /acceleration/.test(source)
    && (/0/.test(correctText) || /0 m\/s\^2|0 m s\^-2|zero acceleration/.test(source));

  if (isConstantVelocityAccelerationCheck) {
    return {
      tag: String(tag || "constant_velocity_zero_acceleration"),
      title: "Constant velocity means the acceleration is zero",
      diagnosis: "Acceleration tells you how quickly velocity changes. If the velocity stays at the same value, there is no change to measure.",
      repair: cleanCorrectionText(displayCorrectText, "A constant velocity of 5 m/s means the velocity is staying at 5 m/s, so the acceleration is 0 m/s^2."),
      noticeNext: "Ask one question first: is the velocity changing? If it is not changing, the acceleration is zero.",
    };
  }

  const isVelocityGraphAccelerationCheck =
    includesAny(source, [/velocity-time/, /velocity time/, /speed-time/, /speed time/])
    && /acceleration/.test(source);

  if (isVelocityGraphAccelerationCheck) {
    return {
      tag: String(tag || "velocity_time_graph_error"),
      title: "Use the gradient, not the graph height",
      diagnosis: "On a velocity-time or speed-time graph, the line height tells you the velocity or speed. The gradient tells you the acceleration.",
      repair: cleanCorrectionText(displayCorrectText, "Here, acceleration comes from the gradient of the graph, not the height of the line."),
      noticeNext: "If the line is horizontal, the gradient is zero, so the acceleration is zero.",
    };
  }

  const isVelocityGraphAreaCheck =
    includesAny(source, [/velocity-time/, /velocity time/, /speed-time/, /speed time/])
    && includesAny(source, [/area/, /displacement/, /distance travelled/, /distance traveled/]);

  if (isVelocityGraphAreaCheck) {
    return {
      tag: String(tag || "area_under_graph_confusion"),
      title: "Area under the graph gives the change in displacement",
      diagnosis: "For a velocity-time graph, the area under the graph combines velocity and time, so it represents displacement change.",
      repair: cleanCorrectionText(displayCorrectText, "Do not read this from the line height. Use the area under the graph."),
      noticeNext: "When the prompt asks for displacement from a velocity-time graph, think area first.",
    };
  }

  const isDistanceGraphStationaryCheck =
    includesAny(source, [/distance-time/, /distance time/])
    && includesAny(source, [/stopped/, /stationary/, /not moving/, /constant distance/]);

  if (isDistanceGraphStationaryCheck) {
    return {
      tag: String(tag || "distance_time_graph_error"),
      title: "A flat line means the object is stationary",
      diagnosis: "On a distance-time graph, time keeps moving along the horizontal axis while the distance stays fixed on a flat segment.",
      repair: cleanCorrectionText(displayCorrectText, "The stopped part is the flat section because the distance does not change."),
      noticeNext: "If time increases but the distance stays the same, the object is stationary.",
    };
  }

  const isDistanceGraphSpeedCheck =
    !/acceleration/.test(source)
    && (
      (
        includesAny(source, [/distance-time/, /distance time/])
        && includesAny(source, [/\bspeed\b/, /\bm\/s\b/, /\bm s\^-?1\b/, /metres per second/, /meters per second/])
      ) ||
      includesAny(source, [
        /graph gradient as speed/,
        /gradient gives speed/,
        /slope gives speed/,
        /speed on (this|that|the) segment/,
        /which segment.*speed/,
      ])
    );

  if (isDistanceGraphSpeedCheck) {
    return {
      tag: String(tag || "distance_time_graph_error"),
      title: "Use the gradient of that distance-time segment",
      diagnosis: "On a distance-time graph, the line height tells you the total distance reached by that time. The speed comes from how much the distance changes during that segment.",
      repair: cleanCorrectionText(displayCorrectText, "This question is asking for speed, so use the segment slope: change in distance divided by change in time."),
      noticeNext: "When a distance-time graph asks for speed, do not read the graph height. Use the steepness of the segment.",
    };
  }

  const learnerUsedDirectionWord =
    includesAny(answerText, [/\beast\b/, /\bwest\b/, /\bnorth\b/, /\bsouth\b/, /\bup\b/, /\bdown\b/, /\bleft\b/, /\bright\b/]);

  const correctIncludesDirectionWord =
    includesAny(correctText, [/\beast\b/, /\bwest\b/, /\bnorth\b/, /\bsouth\b/, /\bup\b/, /\bdown\b/, /\bleft\b/, /\bright\b/]);

  const asksForDistanceOnly =
    includesAny(promptText, [/\bdistance\b/])
    && !includesAny(promptText, [/displacement/, /average speed/, /\bspeed\b/]);

  if (asksForDistanceOnly) {
      const directDistanceCorrection =
        journeySummary && learnerUsedDirectionWord
          ? `You wrote ${displayRepairText(learnerAnswer)}. That is the displacement because it gives the start-to-finish change with a direction. This question asks for distance, so add the whole route instead: ${journeySummary.stageText} = ${journeySummary.distanceText}. Write ${journeySummary.distanceText}, not ${journeySummary.displacementText}.`
          : journeySummary
            ? `Distance means total ground covered. Add the full route: ${journeySummary.stageText} = ${journeySummary.distanceText}. Do not attach a direction word, because distance is scalar.`
            : learnerUsedDirectionWord
              ? `You wrote ${displayRepairText(learnerAnswer)}, which reads like a displacement because it keeps a direction. For distance, add every stage of the route and then drop the direction word.`
              : "Distance means total route length, so add every stage of the journey.";
      return {
        tag: String(tag || "distance_displacement_confusion"),
        title: learnerUsedDirectionWord
          ? "You gave displacement, but the question asked for distance"
          : "Distance means add the whole route",
        diagnosis:
          learnerUsedDirectionWord
            ? `${displayRepairText(learnerAnswer)} tells you where the journey ends relative to the start. That is displacement. Distance ignores direction and counts every metre travelled.`
            : "This is a distance question, so every stage of the journey still counts even if the route turns back.",
        repair: directDistanceCorrection,
        noticeNext: learnerUsedDirectionWord
          ? "If your answer still says east, west, north, or south, pause and check whether you have written displacement instead of distance."
          : "For distance, ask one question first: how much ground was covered altogether?",
      };
    }

  const asksForDisplacementOnly =
    includesAny(promptText, [/displacement/])
    && !includesAny(promptText, [/\bdistance\b/, /average speed/, /\bspeed\b/]);

    if (asksForDisplacementOnly) {
      const directDisplacementCorrection =
        journeySummary
          ? `This question asks for displacement, so compare the finish with the start instead of adding the whole route. The net change is ${journeySummary.displacementText}, not ${journeySummary.distanceText}.`
          : correctIncludesDirectionWord
            ? "This question asks for displacement, so work out the net start-to-finish change and keep the direction because displacement is a vector."
            : "This question asks for displacement, so find the net start-to-finish change instead of adding the full route.";
      return {
        tag: String(tag || "distance_displacement_confusion"),
        title: "Displacement means the net change with direction",
        diagnosis: "This question is asking where the journey finishes relative to where it started. Displacement keeps only the start-to-finish change and the direction of that change.",
        repair: directDisplacementCorrection,
        noticeNext: "If the question says displacement, compare finish with start first. Only add every stage when the question is asking for distance.",
      };
    }

  const asksForAverageSpeedOnly =
    includesAny(promptText, [/average speed/])
    || (includesAny(promptText, [/\bspeed\b/]) && includesAny(promptText, [/whole journey/, /entire journey/, /total time/, /covers .* in .* s/, /travels .* in .* s/]));

    if (asksForAverageSpeedOnly) {
      const directAverageSpeedCorrection =
        journeySummary && journeySummary.totalTimeText && journeySummary.averageSpeedText
          ? `Average speed uses the whole-trip totals. Take distance ${journeySummary.distanceText} and time ${journeySummary.totalTimeText}, then divide: ${journeySummary.distanceText} ÷ ${journeySummary.totalTimeText} = ${journeySummary.averageSpeedText}. Do not use displacement and do not average the stage speeds.`
          : "Average speed uses total distance divided by total time for the whole journey. Do not use displacement and do not average the stage speeds.";
      return {
        tag: String(tag || "distance_displacement_confusion"),
        title: "Average speed uses the whole journey totals",
        diagnosis: "Average speed comes from the whole trip: total distance divided by total time. It does not come from the displacement or from averaging stage speeds.",
        repair: directAverageSpeedCorrection,
        noticeNext: "When you see average speed, collect the whole-trip distance and the whole-trip time before you divide.",
      };
    }

  const isDistanceDisplacementCheck =
    includesAny(source, [/distance/]) && includesAny(source, [/displacement/]);

    if (isDistanceDisplacementCheck) {
      const directPairCorrection =
        journeySummary
          ? `Keep the two quantities separate. Distance uses the full route: ${journeySummary.stageText} = ${journeySummary.distanceText}. Displacement compares the finish with the start: ${journeySummary.displacementText}.`
          : "Keep the two quantities separate: use total path length for distance, but use the start-to-finish change for displacement.";
      return {
        tag: String(tag || "distance_displacement_confusion"),
        title: "Distance and displacement are not the same quantity",
        diagnosis: "This question is asking for both quantities at once, so the full route length and the net start-to-finish change must stay separate.",
        repair: directPairCorrection,
        noticeNext: "Do the route total first for distance, then do the start-to-finish comparison for displacement.",
      };
    }

  const isVectorScalarCheck =
    tag === "vector_scalar_confusion"
    || (includesAny(source, [/vector/, /scalar/]) && includesAny(source, [/direction/, /displacement/, /velocity/, /force/, /acceleration/]));

  if (isVectorScalarCheck) {
    const cleanCorrect = displayCorrectText;
    const direct =
      /vector/i.test(cleanCorrect)
        ? "This is a vector because direction is part of the quantity."
        : /scalar/i.test(cleanCorrect)
          ? "This is a scalar because only size matters here, not direction."
          : cleanCorrectionText(displayCorrectText, "Decide whether direction changes the meaning of the quantity.");
    return {
      tag: String(tag || "vector_scalar_confusion"),
      title: "Decide whether direction matters",
      diagnosis: "A quantity is scalar if it only needs size. It is vector if it needs both size and direction.",
      repair: direct,
      noticeNext: "Ask one question: would changing the direction change the answer? If yes, it is a vector idea.",
    };
  }

  const isBalancedForceCheck =
    includesAny(source, [/balanced force/, /zero resultant/, /resultant force/, /net force/])
    && includesAny(source, [/motion/, /moving/, /velocity/, /acceleration/]);

  if (isBalancedForceCheck) {
    return {
      tag: String(tag || "balanced_force_motion_confusion"),
      title: "Zero resultant means zero acceleration, not zero motion",
      diagnosis: "Balanced forces stop the velocity changing. They do not automatically make the velocity zero.",
      repair: cleanCorrectionText(displayCorrectText, "Use the resultant force to decide acceleration first. Then decide whether the object keeps moving with the same velocity."),
      noticeNext: "No resultant force means no change in velocity.",
    };
  }

  const isEfficiencyCheck =
    includesAny(source, [/efficiency/, /useful output/, /useful energy/, /useful power/]);

  if (isEfficiencyCheck) {
    return {
      tag: String(tag || "efficiency_calculation_error"),
      title: "Efficiency compares useful output to total input",
      diagnosis: "Efficiency is the useful fraction, not just the output value by itself.",
      repair: cleanCorrectionText(displayCorrectText, "Use useful output divided by total input, then convert to a percentage if needed."),
      noticeNext: "The moment you see efficiency, look for both useful output and total input.",
    };
  }

  const isSigFigMultiplyDivideRuleCheck =
    (
      includesAny(source, [/significant figure/, /significant figures/, /sig fig/, /sig figs/])
      && includesAny(source, [/least precise measurement/, /fewest significant figures/, /least significant figures/])
    )
    || (
      includesAny(source, [/multiply/, /multiplication/, /divide/, /division/, /product/, /quotient/])
      && includesAny(source, [/least significant figures/, /fewest significant figures/])
    );

  if (isSigFigMultiplyDivideRuleCheck) {
    return {
      tag: String(tag || "significant_figures"),
      title: "Use the least significant figures rule",
      diagnosis: "For multiplication and division, the final answer is limited by the measurement with the fewest significant figures. This is the precision rule being tested here.",
      repair: cleanCorrectionText(
        displayCorrectText,
        "Find the measurement with the fewest significant figures, do the calculation, then round the final answer to that many significant figures.",
      ),
      noticeNext: "Check the operation first: multiplication or division uses significant figures, while addition or subtraction uses decimal places.",
    };
  }

  const isDecimalPlacesRuleCheck =
    (
      includesAny(source, [/decimal place/, /decimal places/])
      && includesAny(source, [/least decimal places/, /fewest decimal places/])
    )
    || (
      includesAny(source, [/\badd\b/, /\badding\b/, /\baddition\b/, /\bsubtract\b/, /\bsubtraction\b/, /\bsum\b/, /\bdifference\b/, /\bplus\b/, /\bminus\b/])
      && includesAny(source, [/least decimal places/, /fewest decimal places/])
    );

  if (isDecimalPlacesRuleCheck) {
    return {
      tag: String(tag || "rounding_rules"),
      title: "Use the least decimal places rule",
      diagnosis: "For addition and subtraction, the final answer is limited by the least precise decimal place in the measurements, not by total significant figures.",
      repair: cleanCorrectionText(
        displayCorrectText,
        "Line up the decimal places, do the calculation, then round the final answer to the fewest decimal places shown by the original measurements.",
      ),
      noticeNext: "Check the operation first: addition or subtraction uses decimal places, while multiplication or division uses significant figures.",
    };
  }

  const isCountingSigFigsCheck =
    includesAny(source, [/how many significant figures/, /count the significant figures/, /number of significant figures/]);

  if (isCountingSigFigsCheck) {
    return {
      tag: String(tag || "significant_figures"),
      title: "Count from the first meaningful digit",
      diagnosis: "Counting significant figures starts at the first non-zero digit. Leading zeros only place the decimal point, while trailing zeros may count if they show measured precision.",
      repair: cleanCorrectionText(
        displayCorrectText,
        "Start at the first non-zero digit and count every digit that still shows measured precision.",
      ),
      noticeNext: "Ignore leading zeros first, then decide whether any trailing zeros are showing real precision.",
    };
  }

  const isRoundingSigFigsCheck =
    includesAny(source, [/\bround\b/, /\brounded\b/, /\brounding\b/])
    && includesAny(source, [/significant figure/, /significant figures/, /sig fig/, /sig figs/]);

  if (isRoundingSigFigsCheck) {
    return {
      tag: String(tag || "rounding_rules"),
      title: "Round to the requested significant figures",
      diagnosis: "Keep only the required significant figures, then use the next digit to decide whether the last kept digit stays the same or rounds up.",
      repair: cleanCorrectionText(
        displayCorrectText,
        "Keep the required significant figures first, then look at the next digit once to decide whether to round up.",
      ),
      noticeNext: "Mark the last digit you are allowed to keep before you start rounding.",
    };
  }

  const densityAnswer = parseDensityValue(answerText);
  const densityCorrect = parseDensityValue(correctText);
  const isDensityCheck =
    includesAny(source, [/\bdensity\b/, /\bdenser\b/, /\bless dense\b/, /float/, /sink/])
    || Boolean(densityAnswer)
    || Boolean(densityCorrect);

  if (isDensityCheck && densityAnswer && densityCorrect) {
    const mentionsGramPerCentimetreCube = includesAny(source, [/g\/cm\^?3/, /g\/cm3/, /g\/cm³/, /g per cm\^?3/, /g per cm3/, /g per cm³/]);
    const sameDisplayedUnit = densityAnswer.unit === densityCorrect.unit;
    const massOnlyConversionSlip =
      densityCorrect.unit === "kg/m^3"
      && densityAnswer.unit === "kg/m^3"
      && isApproxFactor(densityCorrect.value, densityAnswer.value, 1_000_000);
    const unitLabelOnlySlip =
      densityCorrect.unit === "kg/m^3"
      && densityAnswer.unit === "kg/m^3"
      && isApproxFactor(densityCorrect.value, densityAnswer.value, 1000);
    const leftOriginalUnitSlip =
      densityCorrect.unit === "kg/m^3"
      && densityAnswer.unit === "g/cm^3"
      && isApproxFactor(densityCorrect.value, densityAnswer.value, 1000);

    if (massOnlyConversionSlip) {
      return {
        tag: String(tag || "density_unit_scale_error"),
        title: "This density was converted the wrong way",
        diagnosis: `The answer ${displayRepairText(learnerAnswer)} is far too small because only the mass part was treated as changing. Density is mass per volume, so the whole ratio has to be converted together.`,
        repair: cleanCorrectionText(
          displayCorrectText,
          mentionsGramPerCentimetreCube
            ? `Treat the density as one full ratio: 1 g/cm^3 = 1000 kg/m^3. So 1.5 g/cm^3 becomes ${displayCorrectText}, not ${displayRepairText(learnerAnswer)}.`
            : `You wrote ${displayRepairText(learnerAnswer)}, which is what happens when the mass is converted but the per-volume scale is left behind. Keep the whole mass-per-volume ratio together when you convert.`,
        ),
        noticeNext: "For density, never convert just the number in front. Convert the whole unit ratio and remember that 1 g/cm^3 = 1000 kg/m^3.",
      };
    }

    if (unitLabelOnlySlip || leftOriginalUnitSlip) {
      return {
        tag: String(tag || "density_unit_scale_error"),
        title: "You changed the unit, but not the density scale",
        diagnosis: "The physical density stays the same, but kg/m^3 is a much larger scale than g/cm^3. Changing only the label or keeping the same number gives the wrong size.",
        repair: cleanCorrectionText(
          displayCorrectText,
          mentionsGramPerCentimetreCube || leftOriginalUnitSlip
            ? `If the density is written in g/cm^3 first, multiply by 1000 to express the same density in kg/m^3. That is why the answer is ${displayCorrectText}, not ${displayRepairText(learnerAnswer)}.`
            : "A density written in kg/m^3 must keep the per-volume scale as well as the mass scale. Check the conversion factor before you reuse the original number.",
        ),
        noticeNext: "When a density changes from g/cm^3 to kg/m^3, multiply by 1000. When it changes the other way, divide by 1000.",
      };
    }

    if (sameDisplayedUnit && densityCorrect.unit === "kg/m^3" && /consistent units|convert/.test(source)) {
      return {
        tag: String(tag || "density_unit_scale_error"),
        title: "Keep the density ratio together while you convert",
        diagnosis: "This question is testing whether the mass unit and the volume unit were both converted before the density was written.",
        repair: cleanCorrectionText(
          displayCorrectText,
          "Density is mass divided by volume, so the mass unit and the volume unit must be made consistent before you divide or compare.",
        ),
        noticeNext: "If the answer is in kg/m^3, pause and check both parts of the unit: kilograms and cubic metres.",
      };
    }
  }

  const contextualFallback = genericContextualRepair(tag, displayCorrectText, displayFocusText);
  if (contextualFallback) {
    return contextualFallback;
  }

  return misconceptionSummaryForTag(tag);
}

function cleanCorrectionText(correctText: string, fallback: string): string {
  const cleanCorrect = displayRepairText(correctText);
  if (!cleanCorrect) {
    return fallback;
  }
  return `${fallback} For this question, the correct answer is ${cleanCorrect}.`;
}

export function misconceptionSummariesForTags(
  tags: Array<string | null | undefined>,
  limit = 3,
): MisconceptionRepairSummary[] {
  const seen = new Set<string>();
  const summaries: MisconceptionRepairSummary[] = [];

  for (const entry of tags) {
    const summary = misconceptionSummaryForTag(entry);
    if (!summary || seen.has(summary.tag)) {
      continue;
    }
    seen.add(summary.tag);
    summaries.push(summary);
    if (summaries.length >= limit) {
      break;
    }
  }

  return summaries;
}

export function primaryMisconceptionSummary(
  tags: Array<string | null | undefined>,
): MisconceptionRepairSummary | null {
  return misconceptionSummariesForTags(tags, 1)[0] ?? null;
}
