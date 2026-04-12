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
  hint = "Rebuild the mechanics or materials rule before choosing.",
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
    throw new Error(`A4 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Resolve the force into components and check each axis before deciding.";
  return [
    mc("Which statement defines a vector most safely?", ["it has magnitude and direction", "it has magnitude only", "it always acts vertically", "it always has zero resultant"], 0, "Vectors carry both size and direction.", hint),
    mc("A 10 N force acts at 60 degrees above the horizontal. What is its horizontal component?", ["5.0 N", "8.7 N", "10 N", "15 N"], 0, "Fx = 10 cos 60 degrees = 5.0 N.", hint),
    mc("A 10 N force acts at 60 degrees above the horizontal. What is its vertical component?", ["8.7 N", "5.0 N", "10 N", "6.0 N"], 0, "Fy = 10 sin 60 degrees, about 8.7 N.", hint),
    mc("Which condition must hold for translational equilibrium?", ["Sigma F_x = 0 and Sigma F_y = 0", "all forces must have equal magnitude", "there must be exactly two forces", "every force must point vertically"], 0, "Equilibrium is checked component by component.", hint),
    mc("The horizontal forces on an object are 6 N right and 8 N left. What is the horizontal resultant?", ["2 N left", "14 N left", "2 N right", "0 N"], 0, "Take right as positive: +6 + (-8) = -2 N, so 2 N left.", hint),
    mc("A 12 N force acts at 30 degrees above the horizontal. What is its horizontal component to one decimal place?", ["10.4 N", "6.0 N", "12.0 N", "3.6 N"], 0, "Fx = 12 cos 30 degrees, about 10.4 N.", hint),
    mc("A body has zero resultant force. Which motion is possible?", ["rest or constant velocity", "only acceleration", "only circular motion", "speed increasing in a straight line"], 0, "Zero resultant means no acceleration, so rest or constant velocity is possible.", hint),
    mc("The horizontal components balance exactly, but the vertical components do not. What is the safest conclusion?", ["the object is not in translational equilibrium", "the object is in full equilibrium", "the vertical imbalance can be ignored", "the resultant must be horizontal only"], 0, "Both axes must balance.", hint),
    mc("A 15 N force is resolved into 9 N horizontally and 12 N vertically. Which pair would balance it exactly?", ["9 N left and 12 N down", "9 N right and 12 N up", "12 N left and 9 N down", "15 N left only"], 0, "Each component must be opposed on the same axis.", hint),
    mc("A force has components 3 N right and 4 N up. What is the magnitude of the resultant?", ["5 N", "7 N", "1 N", "12 N"], 0, "Use Pythagoras: sqrt(3^2 + 4^2) = 5.", hint),
    mc("Why are axes usually chosen along the obvious horizontal and vertical directions?", ["they make the component bookkeeping cleaner", "they remove the need for trigonometry completely", "they change the size of the forces", "they force the resultant to become zero"], 0, "A smart axis choice simplifies the calculation without changing the physics.", hint),
    mc("Why is picture-only arrow counting unsafe in a diagonal-force problem?", ["equal-looking arrows can still hide unbalanced components", "diagonal arrows have no components", "only vertical arrows matter in mechanics", "force diagrams are never to scale"], 0, "Component mismatch can remain hidden in a visual guess.", hint),
    ...shortCases([
      { prompt: "A quantity with magnitude and direction is a ...", acceptedAnswers: ["vector"], hint: "Use the direction-carrying quantity word." },
      { prompt: "The projection of a vector on one chosen axis is a ...", acceptedAnswers: ["component"], hint: "That is the split part of the vector." },
      { prompt: "The single vector equivalent to several vectors is the ...", acceptedAnswers: ["resultant"], hint: "Use the combined-effect word." },
      { prompt: "A diagonal force should first be ... into components.", acceptedAnswers: ["resolved", "split"], hint: "That is the safest first move." },
      { prompt: "Translational equilibrium means zero net ...", acceptedAnswers: ["force", "resultant force"], hint: "That is the balance condition." },
      { prompt: "Component balance is checked on chosen ...", acceptedAnswers: ["axes", "axis"], hint: "Use the x-y bookkeeping word." },
      { prompt: "Zero resultant force allows constant ...", acceptedAnswers: ["velocity", "speed in a straight line"], hint: "It does not force the object to be at rest only." },
      { prompt: "Balanced forces must cancel algebraically with the correct ...", acceptedAnswers: ["sign", "direction"], hint: "Opposite directions matter." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Keep the component ledger visible instead of trusting the picture.";
  return [
    mc("Why is matching arrow count not enough to prove equilibrium?", ["the signed components can still fail to cancel on the chosen axes", "equilibrium ignores components", "the biggest arrow always decides", "only vertical forces count"], 0, "The resultant is checked through component sums, not arrow count.", hint),
    mc("Why should a diagonal force be resolved before it is compared with other forces?", ["its separate horizontal and vertical effects need to be balanced independently", "resolving changes the force size", "equilibrium can only be tested after removing the angle", "diagonal forces are not real forces"], 0, "The angle mixes two component stories until it is resolved.", hint),
    mc("Why can an object moving at constant velocity still be in equilibrium?", ["equilibrium means zero acceleration, not necessarily zero speed", "equilibrium means every force has vanished", "moving objects cannot be in equilibrium", "constant velocity creates a resultant force"], 0, "Zero resultant force means no acceleration.", hint),
    mc("Why do shared axes make hidden imbalance visible?", ["the same sign convention is applied to every force on each component ledger", "axes create extra forces", "axes always make every problem two-dimensional", "axes force the largest vector to dominate"], 0, "A consistent axis choice reveals what actually cancels.", hint),
    mc("Why are equal magnitudes not enough by themselves to prove balance?", ["direction and axis component both matter", "equilibrium uses magnitude only", "equal magnitudes always produce zero resultant", "components matter only for moments"], 0, "Two equal forces can still reinforce or misalign.", hint),
    mc("Why is 'the arrows look symmetric' a weak physics answer?", ["appearance can hide nonzero horizontal or vertical resultant", "symmetry removes the need for equations", "symmetry means every force is equal", "symmetry guarantees zero moment and zero force"], 0, "Visual symmetry is not the same as demonstrated component balance.", hint),
    mc("Which statement best protects the A4_L1 lesson meaning?", ["Resolve diagonal forces, compare components on shared axes, and then judge the resultant.", "Count the arrows and assume the picture is balanced.", "If one axis balances, the full system balances.", "Any equal pair of forces gives equilibrium."], 0, "That statement keeps the mechanism visible.", hint),
    mc("A student balances only the horizontal components and stops. What has been missed?", ["the vertical component ledger still needs to be checked", "nothing; equilibrium has already been proven", "only the force magnitudes matter", "the object must now be rotating"], 0, "Both axes matter.", hint),
    mc("Why is the resultant more useful than the phrase 'balanced forces' alone?", ["it tells you explicitly whether the vector sum is zero", "it removes the need for direction", "it works only for vertical forces", "it ignores the chosen axes"], 0, "Resultant language ties the label to the calculation.", hint),
    mc("Why is a smart axis choice part of the method rather than just presentation?", ["it can simplify the component calculations without changing the physics", "it changes which forces are present", "it changes the actual equilibrium condition", "it makes every diagonal force disappear"], 0, "Choosing axes is a reasoning step.", hint),
    mc("Why do algebraic signs matter in component equilibrium?", ["opposite directions must cancel rather than reinforce", "signs matter only for displacement", "signs change the force magnitude", "signs can be ignored if the picture is clear"], 0, "The component ledger is signed, not magnitude-only.", hint),
    mc("What is the main trap this lesson is preventing?", ["declaring balance from the look of a diagram without resolving forces", "thinking vectors have units", "believing force can act at an angle", "using x and y components in mechanics"], 0, "The lesson is stopping visual-guess equilibrium claims.", hint),
    ...shortCases([
      { prompt: "A rigorous A4_L1 check starts with force ...", acceptedAnswers: ["components", "resolution", "resolving"], hint: "That is the first safe move." },
      { prompt: "Diagonal-force balance must be tested on each chosen ...", acceptedAnswers: ["axis", "axes"], hint: "Use the bookkeeping directions." },
      { prompt: "Zero resultant means translational ...", acceptedAnswers: ["equilibrium"], hint: "That is the named condition." },
      { prompt: "Picture-only balance can hide unbalanced ...", acceptedAnswers: ["components"], hint: "That is the hidden trap." },
      { prompt: "Constant velocity with zero resultant is still ...", acceptedAnswers: ["equilibrium", "balanced motion"], hint: "No acceleration is the key." },
      { prompt: "A strong explanation keeps the component method ...", acceptedAnswers: ["visible", "clear"], hint: "Do not collapse it into a slogan." },
      { prompt: "Balanced horizontal components do not remove the need to check the ... ledger.", acceptedAnswers: ["vertical"], hint: "The other axis still matters." },
      { prompt: "The component sum must cancel with the correct algebraic ...", acceptedAnswers: ["sign", "direction"], hint: "Opposition is signed." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep displacement, velocity, and acceleration in separate component stories.";
  return [
    mc("Which quantity is the rate of change of displacement?", ["velocity", "acceleration", "force", "momentum"], 0, "Velocity measures how displacement changes.", hint),
    mc("Which quantity is the rate of change of velocity?", ["acceleration", "displacement", "distance", "impulse"], 0, "Acceleration measures how velocity changes.", hint),
    mc("Which quantity is a directed change in position?", ["displacement", "speed", "frequency", "power"], 0, "Displacement is the vector change in position.", hint),
    mc("If a particle has zero horizontal acceleration, what happens to its horizontal velocity?", ["it remains constant", "it must become zero", "it must increase", "it must reverse"], 0, "Zero acceleration means no change in that velocity component.", hint),
    mc("A particle has u_x = 4 m/s, a_x = 2 m/s^2, and t = 3 s. What is its horizontal displacement?", ["21 m", "18 m", "12 m", "9 m"], 0, "x = ut + 0.5at^2 = 4 x 3 + 0.5 x 2 x 9 = 21 m.", hint),
    mc("A particle has u_y = 6 m/s, a_y = -2 m/s^2, and t = 2 s. What is its vertical velocity after 2 s?", ["2 m/s", "4 m/s", "-2 m/s", "8 m/s"], 0, "v = u + at = 6 + (-2 x 2) = 2 m/s.", hint),
    mc("A particle has u_y = 5 m/s, a_y = -10 m/s^2, and t = 0.5 s. What is its vertical displacement?", ["1.25 m", "2.50 m", "0 m", "-1.25 m"], 0, "s = ut + 0.5at^2 = 2.5 - 1.25 = 1.25 m.", hint),
    mc("At one instant an object has v_y = 0 but a_y is still downward. What is the safest conclusion?", ["the vertical velocity is momentarily zero, but the vertical acceleration is not", "the whole motion has stopped", "the vertical acceleration must also be zero", "the horizontal motion must reverse"], 0, "Velocity and acceleration are different quantities.", hint),
    mc("If x-motion has constant velocity while y-motion accelerates downward, what is the safest description?", ["the component stories are different on the two axes", "the object can only be moving vertically", "the horizontal motion must be zero", "the acceleration is the same on both axes"], 0, "Two-dimensional motion can have different behavior on each axis.", hint),
    mc("A particle moves with horizontal speed 8 m/s for 2 s with zero horizontal acceleration. What horizontal displacement does it cover?", ["16 m", "8 m", "4 m", "32 m"], 0, "x = vt = 8 x 2 = 16 m.", hint),
    mc("Which statement best matches component kinematics?", ["each axis keeps its own displacement, velocity, and acceleration story", "a motion path should be described by one casual word only", "zero acceleration on one axis erases the other axis", "velocity and acceleration are interchangeable"], 0, "Component analysis keeps the quantities and axes separate.", hint),
    mc("Why is a zero component on one axis not enough to finish the whole problem?", ["the other axis can still have nonzero displacement, velocity, or acceleration", "one zero component always means rest", "the other axis becomes irrelevant", "all vectors must be zero together"], 0, "The two axes are linked by time, not by identical values.", hint),
    ...shortCases([
      { prompt: "A directed change in position is ...", acceptedAnswers: ["displacement"], hint: "It is the vector position change." },
      { prompt: "The rate of change of displacement is ...", acceptedAnswers: ["velocity"], hint: "Use the motion-state quantity." },
      { prompt: "The rate of change of velocity is ...", acceptedAnswers: ["acceleration"], hint: "That is the second-change quantity." },
      { prompt: "Two-dimensional motion is often split into horizontal and vertical ...", acceptedAnswers: ["components", "component stories"], hint: "That is the safer method." },
      { prompt: "Zero horizontal acceleration means constant horizontal ...", acceptedAnswers: ["velocity", "speed"], hint: "That component does not change." },
      { prompt: "A zero vertical velocity at one instant does not force zero vertical ...", acceptedAnswers: ["acceleration"], hint: "The top of a path shows that." },
      { prompt: "Horizontal and vertical motion share the same ...", acceptedAnswers: ["time", "clock"], hint: "That is the bridge variable." },
      { prompt: "A careful kinematics answer names the quantity and the ...", acceptedAnswers: ["axis", "direction"], hint: "Do not blur them together." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Describe the motion quantity and the axis before blending the story.";
  return [
    mc("Why is it weak to describe a two-dimensional motion using one casual phrase only?", ["displacement, velocity, and acceleration can differ from one another and from one axis to another", "two-dimensional motion never needs numbers", "one phrase always fixes the acceleration", "the path shape determines every quantity automatically"], 0, "The lesson is about separating the motion quantities clearly.", hint),
    mc("Why does v_y = 0 at one instant not prove a_y = 0?", ["velocity and acceleration are different quantities, so one can be zero while the other is not", "vertical acceleration exists only when v_y is positive", "zero velocity means zero force in every case", "components cannot be zero in projectile-style motion"], 0, "A turning point is the standard example.", hint),
    mc("Why is component analysis stronger than path-only description?", ["it preserves the separate equations and meanings on each axis", "it removes the need to track time", "it makes acceleration impossible", "it works only for horizontal motion"], 0, "Components make the state changes explicit.", hint),
    mc("Why should displacement, velocity, and acceleration not be treated as the same kind of quantity?", ["they answer different physics questions about position, change of position, and change of velocity", "they are all measured in the same units", "they are identical on a graph", "they all become zero together"], 0, "The lesson separates these meanings deliberately.", hint),
    mc("Why can a particle have zero acceleration on one axis but nonzero acceleration on another?", ["the component stories are independent except for sharing the same time", "acceleration must match on every axis", "the larger component dominates the smaller one", "one zero component forces the whole vector to zero"], 0, "The same clock does not mean identical component values.", hint),
    mc("Why is a sign convention important in component kinematics?", ["it keeps the direction of displacement, velocity, and acceleration explicit", "it changes the physics of the motion", "it removes the need for axes", "it applies only to forces"], 0, "The algebra only stays meaningful with a clear sign rule.", hint),
    mc("Why is a position snapshot not enough to tell you acceleration directly?", ["acceleration describes change of velocity, not position alone", "position and acceleration are always proportional", "position already includes time twice", "acceleration can be read from one coordinate instantly"], 0, "The quantities must stay distinct.", hint),
    mc("Which statement best protects the A4_L2 lesson meaning?", ["Separate displacement, velocity, and acceleration, then track each one on the relevant axis before recombining the motion.", "Blend all motion quantities into one path label to avoid confusion.", "If one component is zero, the whole vector story is finished.", "Velocity and acceleration differ only in units."], 0, "That statement keeps the full lesson discipline visible.", hint),
    mc("Why is the same time value still important even when the axes are treated separately?", ["it links the two component stories into one physical event", "it forces the components to have equal acceleration", "it makes direction unimportant", "it removes the need for velocity equations"], 0, "Time is the shared bridge variable.", hint),
    mc("Why is 'moving upward' not enough by itself to describe the vertical state?", ["you still need to know the vertical velocity and the vertical acceleration separately", "upward motion always means zero acceleration", "motion direction replaces vector quantities", "vertical motion never needs signs"], 0, "Direction alone does not give the full state.", hint),
    mc("Why is a zero component often only a local fact rather than a whole-motion conclusion?", ["the other components and other quantities can still be changing", "zero components stop the clock", "zero components remove displacement", "zero components force equilibrium"], 0, "One number on one axis does not finish the motion story.", hint),
    mc("What main mistake is A4_L2 preventing?", ["mixing up position, velocity, and acceleration when reading two-dimensional motion", "believing time exists only for one axis", "thinking displacement is always zero", "treating acceleration as a scalar only"], 0, "The audit is protecting quantity separation.", hint),
    ...shortCases([
      { prompt: "A strong A4_L2 answer keeps displacement, velocity, and acceleration ...", acceptedAnswers: ["separate", "distinct"], hint: "Do not blend the quantities." },
      { prompt: "A zero vertical velocity does not erase vertical ...", acceptedAnswers: ["acceleration"], hint: "Turning points matter here." },
      { prompt: "Two-dimensional motion is safest when split into axis ...", acceptedAnswers: ["components", "stories"], hint: "That is the method." },
      { prompt: "The x-story and y-story still share the same ...", acceptedAnswers: ["time", "clock"], hint: "That is the link." },
      { prompt: "A sign convention keeps the direction ...", acceptedAnswers: ["explicit", "visible"], hint: "The algebra needs that." },
      { prompt: "A position value alone does not tell you the ...", acceptedAnswers: ["acceleration", "velocity"], hint: "State changes need more than location." },
      { prompt: "Component kinematics prevents one-axis facts from being over-...", acceptedAnswers: ["generalised", "generalized"], hint: "One component is not the whole motion." },
      { prompt: "A rigorous explanation names both the motion quantity and the chosen ...", acceptedAnswers: ["axis", "direction"], hint: "That keeps the story precise." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Split the launch first, then link the components with the same time.";
  return [
    mc("Which description best matches an ideal projectile after launch?", ["it moves under gravity with no further driving force assumed", "it keeps gaining horizontal force", "it has zero vertical acceleration", "it stops at the highest point"], 0, "Ideal projectile motion keeps only gravity after launch.", hint),
    mc("A projectile is launched at 20 m/s at 30 degrees above the horizontal. What is the horizontal component of launch velocity?", ["17.3 m/s", "10.0 m/s", "20.0 m/s", "8.7 m/s"], 0, "u_x = 20 cos 30 degrees, about 17.3 m/s.", hint),
    mc("A projectile is launched at 20 m/s at 30 degrees above the horizontal. What is the vertical component of launch velocity?", ["10.0 m/s", "17.3 m/s", "20.0 m/s", "5.0 m/s"], 0, "u_y = 20 sin 30 degrees = 10.0 m/s.", hint),
    mc("In the ideal projectile model, what is the horizontal acceleration?", ["0", "9.8 m/s^2 downward", "9.8 m/s^2 upward", "depends on the launch angle"], 0, "Gravity acts vertically, so the horizontal acceleration is zero.", hint),
    mc("In the ideal projectile model, what is the vertical acceleration?", ["g downward", "0", "constant upward", "it changes sign at the top"], 0, "Gravity stays downward throughout the flight.", hint),
    mc("A projectile has initial vertical speed 15 m/s upward and g = 10 m/s^2 downward. How long does it take to reach the top?", ["1.5 s", "3.0 s", "0.75 s", "15 s"], 0, "At the top v_y = 0, so t = 15 / 10 = 1.5 s.", hint),
    mc("For the same projectile, if it lands at the same height, what is the total time of flight?", ["3.0 s", "1.5 s", "4.5 s", "0.75 s"], 0, "The upward and downward times are equal in this symmetric case.", hint),
    mc("A projectile has horizontal speed 12 m/s and total time of flight 3.0 s. What is the horizontal range?", ["36 m", "15 m", "24 m", "48 m"], 0, "Range = u_x t = 12 x 3 = 36 m.", hint),
    mc("At the highest point of a projectile, which statement is correct?", ["v_y = 0 but the vertical acceleration is still downward", "both v_y and a_y are zero", "the whole velocity is zero", "the horizontal velocity also becomes zero"], 0, "Only the vertical velocity momentarily reaches zero.", hint),
    mc("If launch speed stays the same but launch angle increases, what happens to the horizontal component of launch velocity?", ["it decreases", "it increases", "it stays the same", "it becomes zero for every angle"], 0, "More of the launch speed is allocated vertically.", hint),
    mc("Why do horizontal and vertical projectile equations share the same time variable?", ["both components belong to the same motion event", "the vertical motion controls the horizontal acceleration", "time depends only on the horizontal component", "the angle removes the time dependence"], 0, "One launch means one shared clock.", hint),
    mc("Which statement best matches projectile reasoning?", ["solve the horizontal and vertical stories separately, then recombine them", "use one curved-path equation only", "treat the path shape as the main unknown before resolving components", "ignore the vertical story at the top"], 0, "The split-then-recombine method is the core lesson idea.", hint),
    ...shortCases([
      { prompt: "A projectile's launch speed is split into horizontal and vertical ...", acceptedAnswers: ["components", "component velocities"], hint: "That is the first step." },
      { prompt: "In the ideal model, gravity provides the vertical ...", acceptedAnswers: ["acceleration"], hint: "That is the downward influence." },
      { prompt: "The total time the projectile stays in the air is the time of ...", acceptedAnswers: ["flight"], hint: "Use the full-flight term." },
      { prompt: "The sideways distance covered by a projectile is its ...", acceptedAnswers: ["range", "horizontal range"], hint: "That is the landing-distance word." },
      { prompt: "At the top of the flight, the vertical velocity is ...", acceptedAnswers: ["zero", "0"], hint: "Only for that instant." },
      { prompt: "Horizontal and vertical projectile stories share the same ...", acceptedAnswers: ["time", "clock"], hint: "That links the components." },
      { prompt: "An ideal projectile has zero horizontal ...", acceptedAnswers: ["acceleration"], hint: "Gravity does not act sideways in the ideal model." },
      { prompt: "Projectile motion should be solved by splitting, then ...", acceptedAnswers: ["recombining", "rebuilding"], hint: "That reconstructs the path." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Keep the two component stories and the common time visible.";
  return [
    mc("Why is it weaker to start from the curved path itself than from the launch components?", ["the curved path is explained by two simpler component motions that should be made explicit first", "the path removes the need for gravity", "the path fixes the range without time", "the path makes the launch angle irrelevant"], 0, "The lesson is protecting the component mechanism.", hint),
    mc("Why is the horizontal story called uniform in the ideal model?", ["the horizontal velocity stays constant because the horizontal acceleration is zero", "the horizontal displacement stays zero", "the vertical acceleration is constant", "uniform means the path is straight"], 0, "Uniform here means constant horizontal velocity.", hint),
    mc("Why is the vertical story different from the horizontal story?", ["gravity acts vertically, so the vertical velocity changes while the horizontal velocity does not in the ideal model", "the vertical motion has no time variable", "the horizontal story has more mass", "the angle changes the value of g"], 0, "The axis difference comes from the direction of gravity.", hint),
    mc("Why does v_y = 0 at the top not mean the projectile stops?", ["the horizontal velocity is still present", "the acceleration has vanished", "range becomes zero there", "the mass becomes zero"], 0, "Only the vertical component pauses momentarily.", hint),
    mc("Why does the same time variable belong in both component equations?", ["both components describe the same launched object during the same interval", "the horizontal motion decides how long gravity acts", "the vertical motion decides the horizontal speed", "time is needed only for the range"], 0, "One event, one clock.", hint),
    mc("Why is changing the launch angle at fixed speed really a change in component balance?", ["more speed is allocated to one component and less to the other", "gravity changes strength with angle", "horizontal acceleration appears", "the projectile mass changes"], 0, "The total launch speed is redistributed between x and y.", hint),
    mc("Why is the range not decided by horizontal speed alone?", ["the total time of flight also matters", "gravity does not affect the range", "range equals the launch speed directly", "the vertical component is irrelevant"], 0, "Range is a product of horizontal motion and shared time.", hint),
    mc("Which statement best protects the A4_L3 lesson meaning?", ["Projectile motion is rebuilt from horizontal and vertical component stories linked by a common time.", "Projectile motion is one curved mystery solved by shape recognition.", "At the top of the flight both velocity components are zero.", "The launch angle changes gravity."], 0, "That statement keeps the mechanism visible.", hint),
    mc("Why should a projectile worked example mention the ideal-model assumption?", ["because air resistance would otherwise change the clean component rules", "because mass decides the launch angle", "because ideal models remove time from the equations", "because gravity exists only in ideal questions"], 0, "The simplification matters to the reasoning.", hint),
    mc("Why is the vertical motion usually the place where time of flight is determined?", ["the landing condition is usually expressed through the vertical position story", "the horizontal story has no displacement", "only the vertical story has a velocity", "time can never be read from the horizontal motion"], 0, "Vertical conditions often set the duration, which then feeds the range.", hint),
    mc("Why is it incomplete to say 'projectiles move in parabolas' and stop there?", ["the parabola should be explained from constant horizontal velocity plus gravity-driven vertical change", "parabola is the only fact that matters", "parabolas prove horizontal acceleration exists", "the shape replaces the launch components"], 0, "The lesson wants the cause, not the slogan.", hint),
    mc("What main mistake is A4_L3 preventing?", ["treating the path as one undifferentiated motion instead of two linked component motions", "thinking gravity acts upward at the top", "thinking launch speed has no direction", "believing range equals height"], 0, "The component split is the protected method.", hint),
    ...shortCases([
      { prompt: "Projectile analysis begins by ... the launch velocity.", acceptedAnswers: ["splitting", "resolving"], hint: "That gives the two component stories." },
      { prompt: "The horizontal and vertical stories share the same ...", acceptedAnswers: ["time", "clock"], hint: "That is the bridge variable." },
      { prompt: "In the ideal model, gravity acts in the ... direction.", acceptedAnswers: ["vertical", "downward"], hint: "That is why only one component accelerates." },
      { prompt: "At the top of the path, only the vertical ... becomes zero.", acceptedAnswers: ["velocity"], hint: "The horizontal story continues." },
      { prompt: "The path shape should be explained from two ... motions.", acceptedAnswers: ["component", "one-dimensional"], hint: "That is the lesson method." },
      { prompt: "Horizontal speed stays constant because horizontal ... is zero.", acceptedAnswers: ["acceleration"], hint: "That is the ideal-model rule." },
      { prompt: "Range depends on horizontal speed and total time of ...", acceptedAnswers: ["flight"], hint: "Both are needed." },
      { prompt: "A rigorous A4_L3 answer keeps the component mechanism ...", acceptedAnswers: ["visible", "clear"], hint: "Do not hide it behind the curve." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Start with the momentum ledger, then bring in impulse or energy labels.";
  return [
    mc("Which relation defines momentum?", ["p = m v", "F = m a", "E = m c^2", "V = I R"], 0, "Momentum is mass multiplied by velocity.", hint),
    mc("What is the momentum of a 2.0 kg trolley moving at 3.0 m/s?", ["6.0 kg m/s", "1.5 kg m/s", "5.0 kg m/s", "9.0 kg m/s"], 0, "p = 2.0 x 3.0 = 6.0 kg m/s.", hint),
    mc("What is the momentum of a 1.5 kg trolley moving at 4.0 m/s?", ["6.0 kg m/s", "2.5 kg m/s", "5.5 kg m/s", "0.375 kg m/s"], 0, "p = 1.5 x 4.0 = 6.0 kg m/s.", hint),
    mc("Which relation defines impulse?", ["impulse = change in momentum", "impulse = mass x acceleration", "impulse = energy / time", "impulse = force / area"], 0, "Impulse is the momentum bridge.", hint),
    mc("A force of 2.0 N acts for 0.50 s. What impulse does it give?", ["1.0 N s", "4.0 N s", "0.25 N s", "2.5 N s"], 0, "Impulse = F Delta t = 2.0 x 0.50 = 1.0 N s.", hint),
    mc("A 1.0 kg trolley moving at 6.0 m/s sticks to a 2.0 kg trolley at rest. What is their common final speed?", ["2.0 m/s", "3.0 m/s", "6.0 m/s", "4.0 m/s"], 0, "Total momentum is 6.0 kg m/s, shared by 3.0 kg, so v = 2.0 m/s.", hint),
    mc("Which quantity is conserved for an isolated system in a collision?", ["total momentum", "kinetic energy only", "speed of each object", "mass x acceleration"], 0, "Momentum is the first safe system ledger.", hint),
    mc("Which statement about an elastic collision is correct?", ["momentum and kinetic energy are both conserved in the ideal model", "momentum is not conserved", "kinetic energy is destroyed completely", "the objects must stick together"], 0, "Elastic collisions keep both ledgers in the ideal model.", hint),
    mc("Which statement about an inelastic collision is correct?", ["momentum is conserved, but kinetic energy is not fully conserved", "momentum is lost", "kinetic energy is always conserved", "mass is not conserved"], 0, "Inelastic changes the kinetic-energy outcome, not the momentum law.", hint),
    mc("An explosion occurs from rest. What is the total momentum immediately after the explosion?", ["0", "equal to the mass lost", "always positive", "always negative"], 0, "If the system started from rest, the total momentum remains zero.", hint),
    mc("Why is the total-system momentum checked before labeling a collision elastic or inelastic?", ["momentum is usually the safest first conservation ledger", "energy labels decide the momentum automatically", "momentum only matters after the collision label", "elastic means the same as isolated"], 0, "The lesson sets the order deliberately.", hint),
    mc("When is the simple momentum-conservation model most reliable?", ["when external impulse is negligible during the interaction", "when the collision lasts a very long time under strong external forces", "when mass is ignored", "when the objects have equal speeds"], 0, "The system should be close to isolated during the short event.", hint),
    ...shortCases([
      { prompt: "Momentum equals mass times ...", acceptedAnswers: ["velocity"], hint: "Use the directed-motion quantity." },
      { prompt: "Impulse measures change in ...", acceptedAnswers: ["momentum"], hint: "That is the collision bridge." },
      { prompt: "A perfectly sticky collision is ... inelastic.", acceptedAnswers: ["perfectly", "completely"], hint: "The objects leave together." },
      { prompt: "An ideal elastic collision conserves kinetic ...", acceptedAnswers: ["energy"], hint: "That is the second ledger." },
      { prompt: "The first safe collision ledger is total ...", acceptedAnswers: ["momentum"], hint: "Use the system quantity." },
      { prompt: "Momentum conservation works best when external ... is negligible.", acceptedAnswers: ["impulse"], hint: "The system should be effectively isolated." },
      { prompt: "An explosion from rest still has total momentum ...", acceptedAnswers: ["zero", "0"], hint: "The vector sum stays unchanged." },
      { prompt: "Collision answers should define the ... before using conservation.", acceptedAnswers: ["system"], hint: "That tells you what is included in the ledger." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Use system momentum first, then explain impulse or energy behavior.";
  return [
    mc("Why is momentum usually checked before kinetic energy in collision questions?", ["momentum conservation is more generally reliable for an isolated system", "kinetic energy always fixes the momentum automatically", "momentum matters only in elastic collisions", "energy labels remove the need for system choice"], 0, "The lesson puts momentum first on purpose.", hint),
    mc("Why does system choice matter in momentum questions?", ["conservation applies to the defined system, so the included objects must be stated clearly", "system choice changes the law itself", "system choice matters only for energy", "momentum is never a system quantity"], 0, "The ledger must be defined before it is used.", hint),
    mc("Why is impulse a useful bridge idea in collisions?", ["it links force and interaction time to momentum change", "it replaces the need for momentum", "it gives the collision type directly", "it measures mass lost"], 0, "Impulse tells how the force-time interaction changes momentum.", hint),
    mc("Why can kinetic energy change even when momentum is conserved?", ["momentum and kinetic energy are different ledgers", "conserved momentum forces constant speed", "kinetic energy depends only on mass", "momentum ignores velocity direction"], 0, "Inelastic collisions show this clearly.", hint),
    mc("Why does an explosion from rest produce opposite momenta in the fragments?", ["the total system momentum must still add to zero", "the fragments always have equal masses", "the explosion creates extra external force", "energy conservation sets opposite speeds directly"], 0, "The zero starting momentum controls the after-state ledger.", hint),
    mc("Why is it weak to classify a collision from the word 'bounce' alone?", ["you still need to check the momentum ledger and then the kinetic-energy behavior", "bounce always means elastic", "bounce means no forces acted", "bounce means the masses were equal"], 0, "Everyday wording is weaker than the actual ledger check.", hint),
    mc("Which statement best protects the A4_L4 lesson meaning?", ["Define the system, secure total momentum first, then use impulse and kinetic-energy behavior to refine the collision story.", "Jump straight to the elastic label from the final motion picture.", "Ignore the system because momentum belongs to individual objects only.", "Use impulse instead of momentum because they are unrelated."], 0, "That statement preserves the reasoning order.", hint),
    mc("Why does direction sign matter in one-dimensional momentum questions?", ["momentum is a vector quantity, so opposite directions must cancel algebraically", "sign matters only for displacement", "sign changes the mass", "sign can be ignored if the speeds are equal"], 0, "Momentum bookkeeping is signed.", hint),
    mc("Why is 'the heavier object wins' a weak collision explanation?", ["the momentum balance depends on both mass and velocity, not a slogan", "heavier objects always stop less", "mass alone decides the final state", "impulse is irrelevant"], 0, "The ledger uses more than one quantity.", hint),
    mc("Why do internal collision forces not break total-system momentum conservation?", ["they come in equal and opposite pairs inside the system", "internal forces do not exist in collisions", "internal forces always increase kinetic energy", "only external forces can be equal and opposite"], 0, "Internal forces redistribute momentum but do not change the total.", hint),
    mc("Why is a long-lasting external push a problem for simple momentum conservation during a collision interval?", ["the external impulse may no longer be negligible", "external pushes remove mass from the system", "momentum is undefined over long times", "kinetic energy becomes identical to momentum"], 0, "The isolation assumption becomes weaker.", hint),
    mc("What main mistake is A4_L4 preventing?", ["label-first collision reasoning that skips the actual momentum ledger", "using mass in momentum", "using vectors in mechanics", "thinking elastic collisions conserve momentum"], 0, "The audit is protecting ledger-first reasoning.", hint),
    ...shortCases([
      { prompt: "A rigorous collision answer starts by defining the ...", acceptedAnswers: ["system"], hint: "That is what the conservation law applies to." },
      { prompt: "Impulse links force and time to change in ...", acceptedAnswers: ["momentum"], hint: "That is the bridge quantity." },
      { prompt: "Momentum is a ... quantity, so sign matters.", acceptedAnswers: ["vector"], hint: "Direction must be tracked." },
      { prompt: "Elastic versus inelastic is decided after checking kinetic ...", acceptedAnswers: ["energy"], hint: "That is the second ledger." },
      { prompt: "Explosion fragments from rest must still sum to total momentum ...", acceptedAnswers: ["zero", "0"], hint: "The starting ledger controls the total." },
      { prompt: "Internal forces redistribute momentum but leave the system total ...", acceptedAnswers: ["unchanged", "constant"], hint: "That is why conservation still works." },
      { prompt: "A strong A4_L4 answer keeps the momentum ledger ...", acceptedAnswers: ["first", "visible"], hint: "Do not hide it behind labels." },
      { prompt: "If external impulse is not negligible, simple momentum conservation becomes less ...", acceptedAnswers: ["reliable", "safe"], hint: "The isolation assumption is weaker." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Track the tangential velocity and the inward acceleration separately.";
  return [
    mc("Why is an object moving in a circle at constant speed still accelerating?", ["its velocity direction is changing", "its mass is changing", "its speed is increasing", "its radius is zero"], 0, "Velocity is a vector, so direction change means acceleration.", hint),
    mc("Which direction does centripetal acceleration point?", ["toward the center", "away from the center", "along the tangent", "upward only"], 0, "Centripetal means center-seeking.", hint),
    mc("Which direction does instantaneous velocity point in uniform circular motion?", ["along the tangent", "toward the center", "away from the center", "always upward"], 0, "Velocity is tangential, not radial.", hint),
    mc("A mass moves in a circle at 10 m/s with radius 5 m. What is its centripetal acceleration?", ["20 m/s^2", "2 m/s^2", "50 m/s^2", "5 m/s^2"], 0, "a = v^2 / r = 100 / 5 = 20 m/s^2.", hint),
    mc("A 2.0 kg mass has centripetal acceleration 20 m/s^2. What is the resultant inward force?", ["40 N", "10 N", "20 N", "80 N"], 0, "F = m a = 2.0 x 20 = 40 N.", hint),
    mc("If the radius doubles while speed stays the same, what happens to centripetal acceleration?", ["it halves", "it doubles", "it quadruples", "it stays the same"], 0, "a = v^2 / r, so a is inversely proportional to r.", hint),
    mc("If the speed doubles while radius stays the same, what happens to centripetal acceleration?", ["it becomes four times as large", "it doubles", "it halves", "it stays the same"], 0, "a depends on v^2.", hint),
    mc("A body moves in a circle of radius 2.0 m at 4.0 m/s. What is its period to two significant figures?", ["3.1 s", "1.6 s", "6.3 s", "8.0 s"], 0, "T = 2 pi r / v = 4 pi / 4 = pi, about 3.1 s.", hint),
    mc("Which statement about circular motion is correct?", ["constant speed does not mean zero acceleration", "constant speed means zero resultant force", "the velocity points inward", "acceleration points along the tangent"], 0, "Changing direction alone is enough for acceleration.", hint),
    mc("Which force description is safest in uniform circular motion?", ["the resultant force is inward", "a separate outward driving force balances the motion", "no resultant force is needed", "the tangential force is always the largest"], 0, "The turning requirement is an inward resultant force.", hint),
    mc("What does the radius measure in circular-motion questions?", ["distance from the center to the object", "distance traveled in one revolution", "diameter divided by four", "speed per unit time"], 0, "The radius sets the curvature scale.", hint),
    mc("Why is an outward-force myth unsafe?", ["the actual inertial-frame requirement is an inward resultant force", "outward forces always dominate motion", "tangential velocity causes outward acceleration", "centripetal force means two opposite forces"], 0, "The lesson is protecting the inward-resultant explanation.", hint),
    ...shortCases([
      { prompt: "The inward acceleration in circular motion is called ... acceleration.", acceptedAnswers: ["centripetal"], hint: "Use the center-seeking term." },
      { prompt: "Instantaneous circular-motion velocity is ... to the path.", acceptedAnswers: ["tangential", "tangent"], hint: "It points along the tangent." },
      { prompt: "The required resultant force in circular motion points ...", acceptedAnswers: ["inward", "toward the center"], hint: "That is the turning requirement." },
      { prompt: "The distance from the center to the object is the ...", acceptedAnswers: ["radius"], hint: "That is the curvature scale." },
      { prompt: "One complete revolution takes one ...", acceptedAnswers: ["period"], hint: "That is the cycle time." },
      { prompt: "Constant-speed circular motion still changes velocity ...", acceptedAnswers: ["direction"], hint: "That is why acceleration exists." },
      { prompt: "Centripetal acceleration depends on speed squared divided by ...", acceptedAnswers: ["radius", "r"], hint: "Use a = v^2 / r." },
      { prompt: "A strong circular-motion answer keeps the inward requirement ...", acceptedAnswers: ["visible", "clear"], hint: "Do not replace it with a slogan." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Explain the turning through direction change and inward resultant force.";
  return [
    mc("Why is 'constant speed' not enough to claim zero acceleration in circular motion?", ["acceleration depends on velocity change, and direction is changing continuously", "speed automatically includes direction", "constant speed removes all forces", "acceleration depends only on mass"], 0, "The velocity vector is changing even when its magnitude is steady.", hint),
    mc("Why is the velocity vector tangential while the acceleration vector is radial?", ["the motion is along the path, but the turning requirement points inward", "both vectors must always point in the same direction", "acceleration must point along motion", "radial and tangential mean the same thing"], 0, "These two directions answer different questions.", hint),
    mc("Why is an inward resultant force needed?", ["a change in velocity direction requires an inward acceleration and therefore an inward resultant force", "constant speed produces no force", "the outward motion needs balancing", "period determines force without radius"], 0, "The force is the cause of the inward acceleration.", hint),
    mc("Why is the idea of a separate outward driving force misleading here?", ["the inertial-frame explanation needs only the inward resultant force", "outward force always equals weight", "the tangent direction is outward", "circular motion needs balanced forces"], 0, "The lesson is pushing back on the outward-force myth.", hint),
    mc("Why does reducing the radius make the turn more demanding at the same speed?", ["the direction has to change more sharply, so v^2 / r becomes larger", "the speed becomes zero", "mass stops mattering", "the period always increases"], 0, "Smaller radius means tighter curvature.", hint),
    mc("Why does changing speed have a strong effect on the turning requirement?", ["centripetal acceleration depends on the square of the speed", "speed and acceleration are identical", "radius no longer matters", "mass is squared in the formula"], 0, "The v^2 term makes speed changes especially powerful.", hint),
    mc("Which statement best protects the A4_L5 lesson meaning?", ["Uniform circular motion still needs inward acceleration and inward resultant force because the velocity direction keeps changing.", "Constant speed means the object is in equilibrium.", "The velocity and acceleration both point along the tangent.", "Circular motion is produced by a separate outward force."], 0, "That statement keeps the full turning mechanism visible.", hint),
    mc("Why would zero resultant force fail to sustain circular motion?", ["without a resultant force there would be no inward acceleration to keep turning the velocity", "zero resultant force creates a tighter circle", "circular motion needs only tangential velocity", "resultant force matters only for straight motion"], 0, "Turning requires a nonzero inward resultant.", hint),
    mc("Why is mass absent from the formula for centripetal acceleration?", ["the turning rate set by v and r is kinematic, while mass enters only when converting to force", "mass does not matter anywhere in circular motion", "mass is hidden inside the radius", "mass changes the velocity direction directly"], 0, "Acceleration and force are related but not identical.", hint),
    mc("Why should examples mention both the tangential and radial directions?", ["they prevent the learner from mixing the velocity direction with the acceleration direction", "they make the path straighter", "they remove the need for formulas", "they prove the object is speeding up"], 0, "Circular motion is a two-direction story.", hint),
    mc("Why does period still matter in circular-motion problems?", ["it connects the geometric path length to how quickly each cycle is completed", "it replaces the need for radius", "it is unrelated to speed", "it decides the force direction"], 0, "Timing and geometry are both part of the motion description.", hint),
    mc("What main mistake is A4_L5 preventing?", ["treating constant-speed turning as force-free motion", "thinking radius is measured across the whole circle", "thinking period has units of hertz", "believing mass changes the radius automatically"], 0, "The lesson is protecting the inward-turning explanation.", hint),
    ...shortCases([
      { prompt: "Circular motion changes velocity ... even when speed is constant.", acceptedAnswers: ["direction"], hint: "That is why acceleration exists." },
      { prompt: "The acceleration vector points ... the center.", acceptedAnswers: ["toward", "towards"], hint: "That is the center-seeking direction." },
      { prompt: "The velocity vector is ... to the circular path.", acceptedAnswers: ["tangential", "tangent"], hint: "It follows the path locally." },
      { prompt: "A separate outward driving force is not part of the inertial-frame ...", acceptedAnswers: ["explanation", "story"], hint: "The inward resultant is enough." },
      { prompt: "Tighter radius at the same speed means larger centripetal ...", acceptedAnswers: ["acceleration"], hint: "Use v^2 / r." },
      { prompt: "Mass affects the required inward ... but not the centripetal acceleration itself.", acceptedAnswers: ["force"], hint: "That comes from F = m a." },
      { prompt: "A rigorous A4_L5 answer keeps the inward-resultant idea ...", acceptedAnswers: ["visible", "clear"], hint: "Do not hide it behind the word 'speed'." },
      { prompt: "Uniform circular motion is not translational ...", acceptedAnswers: ["equilibrium"], hint: "The velocity vector is still changing." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Normalize the load by area and original length before judging the material.";
  return [
    mc("Which statement best matches Hooke's law in the proportional region?", ["force is proportional to extension", "force is proportional to original length", "stress is proportional to area", "strain is proportional to radius"], 0, "That is the spring-like proportional rule.", hint),
    mc("A spring obeys Hooke's law. If the force doubles, what happens to the extension?", ["it doubles", "it halves", "it stays the same", "it quadruples"], 0, "In the proportional region, extension is directly proportional to force.", hint),
    mc("Which relation defines stress?", ["stress = force / area", "stress = force x area", "stress = extension / length", "stress = strain / force"], 0, "Stress normalizes load by cross-sectional area.", hint),
    mc("A wire carries 200 N through cross-sectional area 2.0 x 10^-4 m^2. What is the stress?", ["1.0 x 10^6 Pa", "4.0 x 10^2 Pa", "1.0 x 10^-6 Pa", "1.0 x 10^8 Pa"], 0, "Stress = 200 / (2.0 x 10^-4) = 1.0 x 10^6 Pa.", hint),
    mc("Which relation defines strain?", ["strain = extension / original length", "strain = force / area", "strain = stress / length", "strain = extension x area"], 0, "Strain compares extension with starting length.", hint),
    mc("A 2.0 m wire extends by 4.0 mm. What is the strain?", ["0.002", "0.004", "500", "0.0005"], 0, "Strain = 0.004 / 2.0 = 0.002.", hint),
    mc("Which relation defines Young modulus?", ["Young modulus = stress / strain", "Young modulus = force / extension", "Young modulus = extension / force", "Young modulus = area / stress"], 0, "Young modulus compares normalized elastic response.", hint),
    mc("Two samples carry the same force, but one has the smaller area. Which sample has the larger stress?", ["the smaller-area sample", "the larger-area sample", "both have the same stress", "stress cannot be compared"], 0, "Same force over smaller area gives larger stress.", hint),
    mc("Two samples extend by the same amount, but one started shorter. Which has the larger strain?", ["the shorter original sample", "the longer original sample", "both have the same strain", "strain depends only on force"], 0, "Strain is extension divided by original length.", hint),
    mc("Why is spring constant not the same idea as Young modulus?", ["spring constant describes one spring, while Young modulus is a material property based on stress and strain", "both always have the same units", "Young modulus ignores extension", "spring constant compares area only"], 0, "The lesson separates specimen response from material property.", hint),
    mc("What is the SI unit of stress?", ["pascal", "newton", "joule", "metre"], 0, "Stress is force per unit area, measured in Pa.", hint),
    mc("Which statement best matches materials comparison?", ["force alone is not enough; area and original length matter too", "force alone fully identifies a material", "extension alone always gives Young modulus", "stress and strain matter only for springs"], 0, "The module normalizes before comparing.", hint),
    ...shortCases([
      { prompt: "Force proportional to extension is called ...'s law.", acceptedAnswers: ["hooke", "hooke's"], hint: "Use the spring-law name." },
      { prompt: "Force divided by area is ...", acceptedAnswers: ["stress"], hint: "That is the load-normalized quantity." },
      { prompt: "Extension divided by original length is ...", acceptedAnswers: ["strain"], hint: "That is the size-normalized stretch." },
      { prompt: "Stress divided by strain gives Young ...", acceptedAnswers: ["modulus"], hint: "Use the stiffness property word." },
      { prompt: "The starting sample length is the ... length.", acceptedAnswers: ["original"], hint: "That is the denominator in strain." },
      { prompt: "Stress is measured in ...", acceptedAnswers: ["pa", "pascal", "pascals"], hint: "Use the SI pressure-style unit." },
      { prompt: "A spring's force-extension ratio is the spring ...", acceptedAnswers: ["constant"], hint: "That is not the same as Young modulus." },
      { prompt: "A careful materials answer normalizes the response before making a ...", acceptedAnswers: ["comparison"], hint: "That is the key habit here." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Explain the material through stress, strain, and elastic-region conditions rather than force alone.";
  return [
    mc("Why is force alone a weak basis for comparing two samples?", ["the same force can produce different stress and strain depending on area and original length", "force already contains area and length automatically", "samples under the same force always behave identically", "force removes the need for Hooke's law"], 0, "The lesson is protecting normalized comparison.", hint),
    mc("Why is stress stronger than force alone when comparing samples?", ["stress accounts for how the load is spread over cross-sectional area", "stress ignores geometry", "stress depends only on extension", "stress is always equal to Young modulus"], 0, "Area matters to the mechanical effect.", hint),
    mc("Why is strain stronger than extension alone when comparing samples?", ["strain accounts for the starting length of the sample", "strain removes the need for extension", "strain depends only on force", "strain is measured in pascals"], 0, "Original length matters in a fair comparison.", hint),
    mc("Why is Young modulus treated as a material property rather than a specimen-size property?", ["it compares stress with strain, which normalizes geometry effects", "it equals force divided by extension directly", "it depends only on original length", "it can be read from any nonelastic region"], 0, "Young modulus aims to describe the material, not just one sample shape.", hint),
    mc("Why should the elastic or proportional region be mentioned before using Young modulus confidently?", ["the stress-strain ratio is being used as the elastic-region stiffness measure", "Young modulus becomes larger outside the elastic region automatically", "elastic region is unrelated to material comparison", "Young modulus works only after breaking"], 0, "The lesson keeps the region condition visible.", hint),
    mc("Why can two wires under the same load show different extensions without proving they are made of different materials?", ["their areas or original lengths may differ", "same load forces identical extension", "extension depends only on mass", "different extension always means different material"], 0, "Geometry can change the response.", hint),
    mc("Which statement best protects the A4_L6 lesson meaning?", ["Compare materials with stress, strain, and Young modulus, not with force alone.", "Force and extension alone always identify the material.", "Young modulus is just another name for spring constant.", "Area can be ignored if the load is known."], 0, "That statement preserves the normalization idea.", hint),
    mc("Why is a thick sample often safer under the same load than a thin one?", ["the larger area gives lower stress for the same force", "the larger area gives larger strain automatically", "thicker samples remove Hooke's law", "stress does not depend on area"], 0, "Stress falls when the same load is spread over more area.", hint),
    mc("Why is a straight-line force-extension graph only part of the material story?", ["it applies to the proportional region and still does not normalize area or original length by itself", "it gives Young modulus directly in every case", "it means stress is constant", "it proves strain is zero"], 0, "The graph alone is not the whole normalized comparison.", hint),
    mc("Why is spring constant not enough to compare two differently shaped samples fairly?", ["spring constant depends on the specific specimen setup, while Young modulus aims to isolate the material response", "spring constant already includes strain", "spring constant is dimensionless", "spring constant ignores extension"], 0, "The lesson distinguishes specimen behavior from material property.", hint),
    mc("Why should a worked example keep area and original length on the same board as the load?", ["they are part of the normalized quantities needed for rigorous comparison", "they only decorate the diagram", "they matter only after fracture", "they cancel automatically"], 0, "Those geometric quantities are central, not optional.", hint),
    mc("What main mistake is A4_L6 preventing?", ["treating materials questions as force-only comparison questions", "thinking stress has units of metres", "thinking strain is a force", "thinking Hooke's law applies nowhere"], 0, "The module is protecting normalized materials reasoning.", hint),
    ...shortCases([
      { prompt: "A rigorous materials comparison starts with normalized ...", acceptedAnswers: ["quantities", "measures"], hint: "Force alone is not enough." },
      { prompt: "Stress keeps the sample's cross-sectional ... visible.", acceptedAnswers: ["area"], hint: "That is the geometry effect in the denominator." },
      { prompt: "Strain keeps the sample's original ... visible.", acceptedAnswers: ["length"], hint: "That is the size effect in the denominator." },
      { prompt: "Young modulus is used in the elastic or proportional ...", acceptedAnswers: ["region"], hint: "That condition should be stated." },
      { prompt: "Spring constant describes a specimen, while Young modulus aims to describe the ...", acceptedAnswers: ["material"], hint: "That is the key distinction." },
      { prompt: "A thicker sample under the same load has lower ...", acceptedAnswers: ["stress"], hint: "The area is larger." },
      { prompt: "A strong A4_L6 answer keeps geometry and material response ...", acceptedAnswers: ["together", "visible"], hint: "Do not separate the load from the normalization." },
      { prompt: "The main trap is force-only ...", acceptedAnswers: ["comparison", "reasoning"], hint: "That is what this lesson rejects." },
    ]),
  ];
}

const A4_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A4_L1: l1DiagnosticRaw,
  A4_L2: l2DiagnosticRaw,
  A4_L3: l3DiagnosticRaw,
  A4_L4: l4DiagnosticRaw,
  A4_L5: l5DiagnosticRaw,
  A4_L6: l6DiagnosticRaw,
};

const A4_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A4_L1: l1ConceptRaw,
  A4_L2: l2ConceptRaw,
  A4_L3: l3ConceptRaw,
  A4_L4: l4ConceptRaw,
  A4_L5: l5ConceptRaw,
  A4_L6: l6ConceptRaw,
};

const A4_MASTERY_BUILDERS: Record<string, () => RawItem[]> = Object.fromEntries(
  Object.keys(A4_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A4_DIAGNOSTIC_BUILDERS[code](), ...A4_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawItem[]>;

export function a4GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A4_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a4GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A4_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a4GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A4_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
