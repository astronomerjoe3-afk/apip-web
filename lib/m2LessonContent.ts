"use client";

type UnknownRecord = Record<string, unknown>;

export type M2QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M2SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

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
const M2_VISUAL_META: Record<string, M2QuestionVisualMeta> = {
  M2L1: {
    image_url: "/lesson-media/m2/m2-l1-master-arrow.svg",
    visual_title: "Drive Arrows and Master Arrow",
    visual_caption: "The Thruster-Deck view makes the combined push visible before students talk about motion.",
    visual_callouts: [
      "Different Drive Arrow sets can collapse into the same Master Arrow.",
      "Zero Master Arrow can appear at rest or during steady cruising.",
      "Individual forces and the combined overall push are not the same question.",
    ],
  },
  M2L2: {
    image_url: "/lesson-media/m2/m2-l2-load-rating.svg",
    visual_title: "Load Rating and Motion Shift",
    visual_caption: "The same Master Arrow can produce different motion changes because load changes how stubborn the craft is.",
    visual_callouts: [
      "Same Master Arrow, smaller Load Rating means bigger Motion Shift.",
      "Third-law pairs act on different objects even when their sizes match.",
      "Force changes motion; it does not create motion from nothing.",
    ],
  },
  M2L3: {
    image_url: "/lesson-media/m2/m2-l3-dock-exchange.svg",
    visual_title: "Carry Score through Dock Exchange",
    visual_caption: "Momentum becomes carried motion that can be redistributed across a closed docking system.",
    visual_callouts: [
      "Carry Score depends on both load and speed.",
      "The system total is conserved in a closed dock exchange.",
      "A faster craft does not automatically carry more momentum than a heavier slower one.",
    ],
  },
  M2L4: {
    image_url: "/lesson-media/m2/m2-l4-spin-pull.svg",
    visual_title: "Spin Pull, Torque, and Reach",
    visual_caption: "Spin Pull is torque, also called the moment of a force; the same push can translate, rotate, or do both depending on where the line of action sits.",
    visual_callouts: [
      "Push through the pivot gives zero turning effect.",
      "Greater perpendicular reach gives greater Spin Pull for the same push.",
      "Spin Pull is torque, also called the moment of a force.",
    ],
  },
  M2L5: {
    image_url: "/lesson-media/m2/m2-l5-balance-core.svg",
    visual_title: "Balance Core and Footprint Zone",
    visual_caption: "Stability becomes a visible relationship between the mass-balance point and the support area.",
    visual_callouts: [
      "Moving cargo shifts the Balance Core.",
      "A wider Footprint Zone gives more margin before tipping.",
      "Heavy does not automatically mean stable.",
    ],
  },
  M2L6: {
    image_url: "/lesson-media/m2/m2-l6-arrow-split.svg",
    visual_title: "Arrow Split and Components",
    visual_caption: "Arrow Split turns vector resolution into readable bookkeeping instead of a mystery move.",
    visual_callouts: [
      "Components are one angled force redrawn, not extra forces.",
      "Combine one axis at a time before rebuilding the resultant.",
      "Perpendicular parts add back to the same original arrow.",
    ],
  },
};

export function m2QuestionVisualMeta(itemId: string): M2QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M2L[1-6])_[A-Z]\d+$/);
  return match ? M2_VISUAL_META[match[1]] : undefined;
}
const M2_SIMULATION_COPY: Record<string, M2SimulationCopy> = {
  M2_L1: {
    title: "Master Arrow explorer",
    instructions: "Use the Thruster-Deck controls to compare individual Drive Arrows with the single Master Arrow, then separate zero net force from zero motion.",
    taskPrompt: "Build one balanced-thruster case, one unbalanced-thruster case, and one zero-Master-Arrow cruising case. Then explain why those stories do not all mean the same thing.",
    exploreSteps: [
      "Start with one forward and one backward Drive Arrow so you can compare cancellation with the no-thruster case.",
      "Keep the craft already cruising while you tune the Drive Arrows to make the Master Arrow zero.",
      "Build two different arrow sets that leave the same Master Arrow and compare the motion change they predict.",
    ],
    watchFor: [
      "Combine the Drive Arrows before you talk about motion.",
      "Zero Master Arrow means zero motion change, not automatically zero motion.",
      "Balanced forces and no forces are different force stories even when the resultant is the same.",
    ],
    tryFirst: "Try 10 N forward, 6 N backward, and a starting cruise of 4 m/s. The Master Arrow is 4 N forward, so the craft already moving right should speed up to the right. Then set both arrows to 8 N and notice that the craft can keep cruising even when the Master Arrow becomes zero.",
    takeaway: "The craft responds to the Master Arrow, not to one isolated Drive Arrow. Zero Master Arrow can describe rest or steady cruising because it means no change in motion.",
  },
  M2_L2: {
    title: "Load rating explorer",
    instructions: "Compare how one Master Arrow affects different Load Ratings, then keep third-law interaction pairs separate from the acceleration each object experiences.",
    taskPrompt: "Run the same Master Arrow on a light and heavy craft, then compare an interaction pair where both objects feel equal and opposite forces but still change motion differently.",
    exploreSteps: [
      "Keep the Master Arrow fixed while you raise the Load Rating so the Motion Shift shrinks.",
      "Reset the load and double the Master Arrow so the Motion Shift grows in direct proportion.",
      "Compare the same pair force acting on two different masses and explain why the accelerations can still differ.",
    ],
    watchFor: [
      "Name the Master Arrow first and the Load Rating second before predicting acceleration.",
      "Third-law pairs are equal and opposite on different objects.",
      "A craft can move with zero Master Arrow if its velocity is not changing.",
    ],
    tryFirst: "Try a 12 N Master Arrow with craft A at 2 kg and craft B at 6 kg. The light craft should show 6 m/s^2 while the heavy craft shows 2 m/s^2. Then keep the pair force at 8 N on both objects and compare how the lighter one still accelerates more.",
    takeaway: "Motion Shift depends on both Master Arrow and Load Rating, while third-law forces compare interactions across objects rather than acceleration on one object.",
  },
  M2_L3: {
    title: "Dock exchange explorer",
    instructions: "Use Carry Score to compare moving craft, then keep the system boundary visible so docking collisions are explained by conserved total momentum.",
    taskPrompt: "Compare a heavy slow craft with a light fast craft, then dock two craft and solve for the shared final motion without slipping back into force language.",
    exploreSteps: [
      "Calculate Carry Score for each craft before the docking event so the starting total is explicit.",
      "Treat both craft as one closed system and compare the total Carry Score before and after docking.",
      "Change the mass split while holding the system total similar so you can see why the shared speed changes.",
    ],
    watchFor: [
      "Carry Score depends on both load and velocity.",
      "Momentum conservation belongs to the system total, not to each object keeping its own speed.",
      "Force during the impact is not the same quantity as the momentum being conserved.",
    ],
    tryFirst: "Try craft A at 3 kg and 4 m/s toward a 1 kg craft at rest. The total Carry Score is 12 kg m/s, so if they dock the shared speed should be 3 m/s. Then compare that with a 6 kg craft at 2 m/s and notice the same total Carry Score can come from a different mass-speed mix.",
    takeaway: "Carry Score is motion-with-load, and closed Dock Exchange missions conserve the total system Carry Score even when the share on each craft changes.",
  },
  M2_L4: {
    title: "Spin pull / torque explorer",
    instructions: "Shift the push line around the pivot so Spin Pull, torque, and the moment of a force all stay visibly tied to both force size and perpendicular reach.",
    taskPrompt: "Compare a centered push, an off-center push, and two different force-reach pairs that give the same Spin Pull. Then explain why torque, the moment of a force, is not just force with a new label.",
    exploreSteps: [
      "Begin with the same push through the center line and then move it away from the pivot.",
      "Keep the push fixed and increase the perpendicular reach to watch Spin Pull grow.",
      "Build one large-force small-reach case and one smaller-force larger-reach case with the same torque, the same moment of a force.",
    ],
    watchFor: [
      "A push through the pivot gives zero turning effect even if the force is large.",
      "Spin Pull is torque, also called the moment of a force, so it uses both force and perpendicular reach.",
      "Translation and rotation depend on where the force acts as well as how hard it pushes.",
    ],
    tryFirst: "Try a 6 N push at 0.5 m from the pivot. The Spin Pull should be 3 N m. Then slide the line of action onto the pivot and notice the turning effect falls to zero without making the force disappear.",
    takeaway: "Off-center pushes create rotation because torque, the moment of a force, depends on force and reach together. Force alone cannot tell the whole turning story.",
  },
  M2_L5: {
    title: "Balance core explorer",
    instructions: "Move cargo, change support width, and raise the load so centre-of-mass reasoning and stability stay in one visible deck model.",
    taskPrompt: "Shift the same cargo to one side, compare a narrow and wide Footprint Zone, and test what raising the load does to stability while the total mass stays fixed.",
    exploreSteps: [
      "Start with the cargo centered so the Balance Core sits above the middle of the Footprint Zone.",
      "Move the cargo sideways and watch the Balance Core shift toward the moved mass.",
      "Keep the same cargo position but widen and narrow the Footprint Zone so stability changes without changing the total mass.",
    ],
    watchFor: [
      "Balance Core depends on mass distribution, not on material color or time.",
      "A heavier craft can still tip if the Balance Core line falls outside the support area.",
      "Raising the load usually makes tipping easier because the geometry becomes less forgiving.",
    ],
    tryFirst: "Try a centered load over a 6 m base first. Then move the cargo 2 m to the right and compare the result with the same cargo over a 10 m base. The wider Footprint Zone should keep the craft safer even though the mass has not changed.",
    takeaway: "Stability depends on where the Balance Core sits relative to the Footprint Zone. Weight alone does not guarantee balance.",
  },
  M2_L6: {
    title: "Arrow split explorer",
    instructions: "Resolve one diagonal Drive Arrow into deck-aligned parts, then combine components axis by axis so vectors feel organized instead of mysterious.",
    taskPrompt: "Split one diagonal arrow into horizontal and vertical parts, compare component-first combination with direct combination, and explain why components are not extra forces.",
    exploreSteps: [
      "Choose a diagonal Drive Arrow and read off its horizontal and vertical parts.",
      "Add another horizontal contribution so you can combine one axis at a time before rebuilding the resultant.",
      "Compare two different component pairs that reconstruct the same overall angled push.",
    ],
    watchFor: [
      "Components are a redescription of one force, not two new physical pushes.",
      "Combine horizontal with horizontal and vertical with vertical before rebuilding the resultant.",
      "Vector resolution is a bookkeeping move that makes later force combination easier.",
    ],
    tryFirst: "Try a 10 N arrow at about 53 degrees. The components are about 6 N east and 8 N north. Then add 2 N west on the horizontal axis so the net horizontal part becomes 4 N east before you rebuild the final arrow.",
    takeaway: "Arrow Split is a structured way to understand and combine angled forces. The original diagonal arrow is still the same force after it is resolved into components.",
  },
};

export function m2SimulationCopy(code: string): M2SimulationCopy | undefined {
  return M2_SIMULATION_COPY[code];
}
export function m2GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  switch (code) {
    case "M2_L1":
      return [
        mcItem("M2L1_D4", "Which pair of stories can both have zero Master Arrow?", ["a stopped craft and a steadily cruising craft", "a speeding-up craft and a slowing-down craft", "two craft with different non-zero accelerations", "a craft with only one thruster and a craft with two unequal thrusters"], 0, "Zero net force fixes acceleration, not one special velocity.", "A stopped craft and a steadily cruising craft can both have zero Master Arrow because both have zero acceleration."),
        mcItem("M2L1_D5", "Why is 'balanced arrows' not always the same thing as 'no arrows'?", ["Balanced arrows can still mean forces are acting and cancelling", "No arrows always means acceleration", "Balanced arrows make mass disappear", "No arrows always mean the craft is speeding up"], 0, "The resultant can match while the force story differs.", "Balanced arrows can still mean forces are acting and cancelling, while no arrows means no forces are acting at all."),
        shortItem("M2L1_D6", "In a few words, what does zero Master Arrow mean?", ["zero acceleration", "no acceleration", "no motion change", "motion stays unchanged", "constant velocity if already moving", "no resultant force", "zero resultant force", "no net force", "zero net force"], "Zero Master Arrow tells you about acceleration, not about one special speed value."),
        mcItem("M2L1_D7", "A craft has 12 N forward and 5 N backward. What Master Arrow remains?", ["7 N forward", "7 N backward", "17 N forward", "0 N"], 0, "Subtract opposite directions and keep the larger direction.", "12 N forward and 5 N backward leave a Master Arrow of 7 N forward."),
      ];
    case "M2_L2":
      return [
        mcItem("M2L2_D4", "If a 9 N Master Arrow acts on 3 kg and 9 kg craft, which comparison is correct?", ["the 3 kg craft accelerates three times as much", "the 9 kg craft accelerates three times as much", "they accelerate equally", "their accelerations depend only on starting speed"], 0, "For the same net force, acceleration is inversely related to mass.", "With the same 9 N Master Arrow, the 3 kg craft accelerates three times as much as the 9 kg craft."),
        mcItem("M2L2_D5", "Why is the claim 'the heavier craft pushes back harder' wrong in a collision?", ["Third-law forces are equal and opposite on the two objects", "Heavier objects feel no forces", "Only the lighter object feels the interaction", "Force size is decided by speed alone"], 0, "Separate force-pair size from acceleration outcome.", "The claim is wrong because third-law forces are equal and opposite; different masses create different accelerations, not different pair-force magnitudes."),
        shortItem("M2L2_D6", "In a few words, why can equal third-law forces still produce different accelerations?", ["because the masses can differ", "different masses", "same force on different masses", "equal force but different mass"], "Equal interaction forces do not force equal accelerations because mass still matters."),
        mcItem("M2L2_D7", "The same 20 N Master Arrow acts on 4 kg and 10 kg craft. Which acceleration pair is correct?", ["5 m/s^2 and 2 m/s^2", "2 m/s^2 and 5 m/s^2", "5 m/s^2 and 5 m/s^2", "4 m/s^2 and 10 m/s^2"], 0, "Use a = F / m for each craft.", "The 4 kg craft accelerates at 5 m/s^2 and the 10 kg craft accelerates at 2 m/s^2."),
      ];
    case "M2_L3":
      return [
        mcItem("M2L3_D4", "Which pair has the same Carry Score?", ["2 kg at 6 m/s and 3 kg at 4 m/s", "2 kg at 6 m/s and 2 kg at 3 m/s", "5 kg at 1 m/s and 1 kg at 5 m/s", "4 kg at 2 m/s and 4 kg at 4 m/s"], 0, "Compare mass times velocity for each craft.", "2 kg at 6 m/s and 3 kg at 4 m/s both give 12 kg m/s, so they have the same Carry Score."),
        mcItem("M2L3_D5", "Why is it useful to draw a system boundary around both craft before a collision?", ["because the total Carry Score of the closed system is conserved", "because each craft keeps its own speed", "because force disappears in a collision", "because mass stops mattering"], 0, "Conservation belongs to the whole isolated system.", "The system boundary matters because the total Carry Score of the closed system is conserved through the collision."),
        shortItem("M2L3_D6", "What two quantities set Carry Score?", ["mass and velocity", "mass and speed", "load and velocity", "mass times velocity"], "Momentum depends on both mass and velocity together."),
        mcItem("M2L3_D7", "A 6 kg craft moves at -2 m/s. What Carry Score does it have?", ["-12 kg m/s", "12 kg m/s", "-3 kg m/s", "3 kg m/s"], 0, "Momentum keeps the sign of the velocity.", "The craft has -12 kg m/s of Carry Score because 6 x -2 = -12."),
      ];
    case "M2_L4":
      return [
        mcItem("M2L4_D4", "Two equal pushes act on the same door. Which one makes the bigger Spin Pull?", ["the push farther from the hinge", "the push closer to the hinge", "they are always equal", "the one on the heavier door only"], 0, "Greater reach means greater turning effect.", "The push farther from the hinge makes the bigger Spin Pull because the perpendicular reach is larger."),
        mcItem("M2L4_D5", "Why can a force create translation without rotation?", ["its line of action can pass through the pivot", "force has lost its direction", "rotation needs zero mass", "translation cancels torque on all objects"], 0, "Zero turning reach blocks the torque, or moment of a force.", "A force can translate without rotating when its line of action passes through the pivot, giving zero turning reach and therefore zero torque, or moment of a force."),
        shortItem("M2L4_D6", "What two things decide Spin Pull?", ["force and perpendicular reach", "force and distance from the pivot", "force and moment arm", "force and reach"], "Turning effect depends on force and perpendicular reach together because Spin Pull is torque, the moment of a force."),
        mcItem("M2L4_D7", "Which pair gives the same Spin Pull?", ["4 N at 0.5 m and 2 N at 1.0 m", "4 N at 0.5 m and 4 N at 1.0 m", "6 N at 0.2 m and 2 N at 0.2 m", "8 N at 0.25 m and 8 N at 1.0 m"], 0, "Compare force x reach for each pair.", "4 x 0.5 and 2 x 1.0 both produce the same Spin Pull."),
      ];
    case "M2_L5":
      return [
        mcItem("M2L5_D4", "Which change can improve stability without changing total mass?", ["widening the Footprint Zone", "painting the craft", "waiting longer", "renaming the cargo"], 0, "Support geometry matters as well as mass.", "Widening the Footprint Zone can improve stability without changing the total mass because it gives more support margin."),
        mcItem("M2L5_D5", "Why can raising the same load make tipping easier?", ["the higher Balance Core gives less stability margin", "higher loads reduce mass", "support width stops mattering", "gravity becomes weaker"], 0, "A higher center of mass is less forgiving.", "Raising the same load makes tipping easier because the higher Balance Core gives a smaller stability margin."),
        shortItem("M2L5_D6", "If cargo is moved to the right, which way does the Balance Core shift?", ["right", "to the right", "toward the moved mass", "towards the moved mass", "toward the cargo", "towards the cargo"], "The Balance Core shifts toward the moved mass."),
        mcItem("M2L5_D7", "Which event marks the tipping threshold most directly?", ["the weight line reaches or crosses the support edge", "the object becomes heavier", "the support zone changes color", "the craft starts moving"], 0, "Tipping begins when the weight line leaves the support area.", "Tipping begins when the Balance Core line reaches or crosses the support edge."),
      ];
    case "M2_L6":
      return [
        mcItem("M2L6_D4", "A diagonal Drive Arrow is resolved into components. What stays true?", ["the components add back to the same original arrow", "the original force disappears", "the components are two extra forces that now act instead", "direction no longer matters"], 0, "Resolution rewrites one vector; it does not replace the physics.", "The components add back to the same original arrow because vector resolution is a redescription of one force."),
        mcItem("M2L6_D5", "Why do physicists combine components one axis at a time?", ["because it keeps the vector sum organized", "because components remove units", "because each axis becomes a scalar with no direction", "because diagonal arrows cannot be measured"], 0, "Axis-by-axis bookkeeping reduces confusion.", "Combining one axis at a time keeps the vector sum organized and makes multi-force resultants easier to track."),
        shortItem("M2L6_D6", "In a few words, what are components?", ["one force rewritten on chosen axes", "parts of one vector on axes", "one vector resolved on axes", "one force split into axis parts"], "Components are a cleaner description of one angled force."),
        mcItem("M2L6_D7", "A force has components 8 N east and 15 N north. What resultant magnitude does that give?", ["17 N", "7 N", "23 N", "15 N"], 0, "Use the 8-15-17 right triangle.", "The components 8 N and 15 N rebuild a resultant of 17 N."),
      ];
    default:
      return [];
  }
}
export function m2GeneratedConceptGateItems(code: string): UnknownRecord[] {
  switch (code) {
    case "M2_L1":
      return [
        mcItem("M2L1_C3", "A craft has 4 N left and 4 N right while moving east. Which statement is correct?", ["The forces are balanced and the craft can keep moving east steadily", "The craft must stop because the arrows cancel", "The craft accelerates east because it is moving east", "The craft has no forces at all"], 0, "Balanced force does not require rest.", "The forces are balanced and the craft can keep moving east steadily because the acceleration is zero."),
        mcItem("M2L1_C4", "Why can two different Drive Arrow patterns produce the same motion change?", ["they can leave the same Master Arrow", "motion depends only on the largest single arrow", "mass stops mattering whenever arrows change", "each arrow creates its own acceleration separately"], 0, "The resultant is what controls the change in motion.", "Two different Drive Arrow patterns can produce the same motion change if they leave the same Master Arrow."),
        shortItem("M2L1_C5", "In a few words, what does the Master Arrow decide?", ["how motion changes", "acceleration", "the motion change", "which way acceleration points"], "The Master Arrow determines the acceleration story."),
        mcItem("M2L1_C6", "Which pair leaves the same Master Arrow?", ["11 N right with 3 N left, and 8 N right only", "7 N right with 7 N left, and 7 N right only", "6 N left with 2 N right, and 6 N right with 2 N left", "4 N right with 1 N left, and 1 N right with 4 N left"], 0, "Compare the net push in each case.", "11 N right with 3 N left leaves the same 8 N right Master Arrow as one 8 N right force."),
      ];
    case "M2_L2":
      return [
        mcItem("M2L2_C3", "Two craft feel equal and opposite interaction arrows. Which extra fact decides whether their accelerations match?", ["their masses", "their colors", "their names", "their starting directions only"], 0, "Equal force does not guarantee equal acceleration.", "Their masses decide whether the accelerations match because equal force can produce different accelerations on different masses."),
        mcItem("M2L2_C4", "What does Newton's first law sound like in Thruster-Deck language?", ["No Master Arrow means no motion change", "No Drive Arrow means no motion", "More load always means more speed", "Every moving craft must have a forward Master Arrow"], 0, "The law is about motion change, not motion itself.", "In Thruster-Deck language, Newton's first law is: no Master Arrow means no motion change."),
        shortItem("M2L2_C5", "What real quantity is the lesson's Load Rating standing in for?", ["mass"], "Load Rating is the mass term in the model."),
        mcItem("M2L2_C6", "The same 10 N interaction pair acts on a 2 kg craft and a 5 kg craft. Which has the smaller acceleration?", ["the 5 kg craft", "the 2 kg craft", "they match because the forces match", "the faster craft"], 0, "For the same force, the larger mass accelerates less.", "The 5 kg craft has the smaller acceleration because the same force acts on more mass."),
      ];
    case "M2_L3":
      return [
        mcItem("M2L3_C3", "When two craft stick together after docking, the final speed is often smaller than the incoming speed because...", ["the same total Carry Score is shared by more total mass", "momentum disappears during impact", "the faster craft loses all motion by rule", "external forces always reverse the motion"], 0, "Conserve momentum, then divide by combined mass.", "The final speed can be smaller because the same total Carry Score is shared by more total mass after docking."),
        mcItem("M2L3_C4", "What is conserved in a closed Dock Exchange?", ["the total system Carry Score", "each craft's own speed", "the force on one craft", "the direction of every separate momentum"], 0, "The conserved quantity belongs to the system total.", "In a closed Dock Exchange, the total system Carry Score is conserved."),
        shortItem("M2L3_C5", "In a few words, what is conserved in a closed Dock Exchange?", ["total system carry score", "total momentum", "system momentum", "the total carry score of the system"], "The conserved quantity belongs to the whole closed system."),
        mcItem("M2L3_C6", "A closed system has 18 kg m/s total Carry Score before docking and a total mass of 6 kg after docking. What shared speed follows?", ["3 m/s", "6 m/s", "12 m/s", "18 m/s"], 0, "Shared speed = total momentum / combined mass.", "18 kg m/s shared across 6 kg gives a shared speed of 3 m/s."),
      ];
    case "M2_L4":
      return [
        mcItem("M2L4_C3", "Which statement best separates torque from force?", ["Torque, or moment of a force, depends on both force and where the force acts", "Torque is just a larger force", "Torque ignores direction and distance", "Torque belongs only to moving objects"], 0, "Location matters as well as size in torque, the moment of a force.", "Torque, or moment of a force, depends on both force and where the force acts, so it is not just a renamed force."),
        mcItem("M2L4_C4", "What happens to Spin Pull if the force halves but the perpendicular reach doubles?", ["it stays the same", "it halves", "it doubles", "it becomes zero"], 0, "Torque, the moment of a force, is the product of force and reach.", "If the force halves while the perpendicular reach doubles, the Spin Pull stays the same because the torque, or moment of a force, is unchanged."),
        shortItem("M2L4_C5", "Why are door handles placed far from hinges?", ["to increase turning effect for the same force", "to increase torque for the same force", "to increase the moment of a force for the same force", "to give more Spin Pull"], "More perpendicular reach gives more turning effect for the same push."),
        mcItem("M2L4_C6", "If a force acts through the pivot and the force doubles, the Spin Pull becomes...", ["0 N m", "double", "half", "impossible to tell"], 0, "No perpendicular reach still means no torque.", "A force through the pivot still produces zero Spin Pull, even if the force becomes larger."),
      ];
    case "M2_L5":
      return [
        mcItem("M2L5_C3", "What determines whether tipping begins?", ["whether the Balance Core line falls outside the Footprint Zone", "whether the mass is large", "whether the craft is metal", "whether the cargo is moving fast"], 0, "Tipping is a geometry question first.", "Tipping begins when the Balance Core line falls outside the Footprint Zone."),
        mcItem("M2L5_C4", "Why is 'heavy objects are always more stable' a poor rule?", ["because stability depends on center-of-mass position and support width", "because heavy objects have no center of mass", "because mass never matters in physics", "because lighter objects always tip"], 0, "Keep geometry and mass distribution in view.", "The rule is poor because stability depends on center-of-mass position and support width, not on weight alone."),
        shortItem("M2L5_C5", "In a few words, what decides whether tipping begins?", ["the weight line leaves the base", "the Balance Core line leaves the Footprint Zone", "the center of mass line goes outside the support area", "the line of action of weight reaches the edge"], "Tipping begins when the center-of-mass line no longer lands inside the support area."),
        mcItem("M2L5_C6", "If total mass stays the same but the load is raised higher, the craft is usually...", ["easier to tip", "more stable", "unchanged in stability", "impossible to compare"], 0, "A higher center of mass is less forgiving.", "Raising the load usually makes the craft easier to tip because the Balance Core sits higher."),
      ];
    case "M2_L6":
      return [
        mcItem("M2L6_C3", "What is the first move when two horizontal components oppose each other?", ["subtract the smaller from the larger and keep the larger direction", "add them regardless of direction", "ignore the horizontal axis", "turn them into masses"], 0, "Opposing components combine like opposing forces on one line.", "When two horizontal components oppose each other, subtract the smaller from the larger and keep the larger direction."),
        mcItem("M2L6_C4", "Why is Arrow Split helpful before combining several angled forces?", ["because it lets you organize the vector sum by axis", "because it removes the need for direction", "because it changes vectors into scalars forever", "because it creates extra forces you can ignore"], 0, "Axis-by-axis bookkeeping makes the structure clearer.", "Arrow Split is helpful because it lets you organize the vector sum by axis before rebuilding the final resultant."),
        shortItem("M2L6_C5", "Why combine components axis by axis?", ["to organize the vector sum", "to keep directions clear", "to combine one direction at a time", "to do the bookkeeping cleanly"], "Axis-by-axis work keeps multi-force vector sums readable."),
        mcItem("M2L6_C6", "If the vertical components are 7 N up and 9 N down, the net vertical component is...", ["2 N down", "2 N up", "16 N down", "16 N up"], 0, "Subtract opposite directions and keep the larger direction.", "7 N up and 9 N down leave a net vertical component of 2 N down."),
      ];
    default:
      return [];
  }
}
export function m2GeneratedMasteryItems(code: string): UnknownRecord[] {
  switch (code) {
    case "M2_L1":
      return [
        mcItem("M2L1_M1", "A craft has 6 N east, 6 N west, and is already moving east. What happens next on a friction-free deck?", ["it keeps moving east at constant velocity", "it stops immediately", "it accelerates east", "it accelerates west"], 0, "Balanced forces mean no acceleration.", "With zero Master Arrow, the craft keeps moving east at constant velocity because its motion does not change."),
        mcItem("M2L1_M2", "Which statement best corrects 'motion always needs a force in that direction'?", ["motion can continue unchanged with zero Master Arrow", "a moving object stores force inside itself", "only heavy craft can move without force", "forces vanish once speed is reached"], 0, "Newton's first law is the key correction.", "Motion can continue unchanged with zero Master Arrow, so motion alone is not evidence of a force in that direction."),
        mcItem("M2L1_M3", "Which question is the Master Arrow designed to answer most directly?", ["how the craft's motion changes", "what speed the craft already has", "how heavy the craft is", "what route shape the craft follows"], 0, "The Master Arrow is the combined force story, so it decides acceleration.", "The Master Arrow is designed to answer how the craft's motion changes because the resultant force determines acceleration."),
        mcItem("M2L1_M4", "A craft has 4 N north, 4 N south, and 9 N east. What Master Arrow remains?", ["9 N east", "5 N east", "13 N east", "0 N"], 0, "Cancel opposite vertical arrows first.", "The north and south arrows cancel, leaving a 9 N east Master Arrow."),
        mcItem("M2L1_M5", "Why are 'balanced arrows' and 'no arrows' not the same force story?", ["balanced arrows still mean forces are acting and cancelling", "no arrows always mean acceleration", "balanced arrows make the craft lighter", "no arrows prove the craft is stationary"], 0, "The Master Arrow can match while the force story still differs.", "Balanced arrows still mean forces are acting and cancelling, while no arrows mean no forces are acting at all."),
        mcItem("M2L1_M6", "A craft is moving in a straight east-west line and slowing down while heading east. Which way must the Master Arrow point?", ["west", "east", "north", "it must be zero"], 0, "In a straight east-west motion story, slowing down while heading east means the acceleration points west.", "If the craft is moving in a straight east-west line and slowing down while heading east, the acceleration must point west, so the Master Arrow points west."),
        shortItem("M2L1_M7", "In a few words, what does zero Master Arrow mean?", ["zero acceleration", "no acceleration", "no motion change", "motion stays unchanged", "constant velocity if already moving", "no resultant force", "zero resultant force", "no net force", "zero net force"], "Zero Master Arrow tells you about motion change, not about one special velocity."),
        mcItem("M2L1_M8", "A craft has no Drive Arrows acting at all. Which claim is strongest?", ["the Master Arrow is zero, but the craft could still be moving steadily", "the craft must be at rest", "the craft must accelerate backward", "balanced forces are acting"], 0, "Zero force still allows constant velocity.", "With no Drive Arrows acting, the Master Arrow is zero, but the craft could still be moving steadily if no force is changing its motion."),
      ];
    case "M2_L2":
      return [
        mcItem("M2L2_M1", "The same 16 N Master Arrow acts on craft A of 4 kg and craft B of 8 kg. Which is correct?", ["A accelerates twice as much as B", "B accelerates twice as much as A", "they accelerate equally", "their acceleration depends only on starting velocity"], 0, "Use a = F / m.", "Craft A accelerates twice as much as B because the same 16 N acts on half the mass."),
        shortItem("M2L2_M2", "A 24 N Master Arrow acts on a 6 kg craft. What Motion Shift occurs?", ["4 m/s^2", "4", "4 m/s/s"], "Acceleration is net force divided by mass."),
        mcItem("M2L2_M3", "Which statement best describes a third-law pair?", ["equal and opposite forces on different objects", "equal and opposite forces on the same object", "two forces that cancel because they act on one craft", "two accelerations that must be equal"], 0, "Third-law forces compare interacting objects.", "A third-law pair is an equal and opposite pair of forces on different objects."),
        mcItem("M2L2_M4", "What happens if the Master Arrow stays the same while the Load Rating doubles?", ["the Motion Shift halves", "the Motion Shift doubles", "the Motion Shift stays the same", "the Master Arrow becomes zero"], 0, "Larger mass gives smaller acceleration for the same force.", "If the Master Arrow stays the same while the Load Rating doubles, the Motion Shift halves."),
        mcItem("M2L2_M5", "Which Thruster-Deck sentence matches Newton's first law?", ["No Master Arrow means no motion change", "Every moving craft must have a forward Master Arrow", "More Load Rating means more force", "Third-law pairs act on the same craft"], 0, "State the zero-resultant rule directly.", "No Master Arrow means no motion change is the Thruster-Deck form of Newton's first law."),
        mcItem("M2L2_M6", "Which pair gives the same acceleration?", ["15 N on 3 kg and 30 N on 6 kg", "15 N on 3 kg and 15 N on 6 kg", "20 N on 5 kg and 20 N on 10 kg", "12 N on 4 kg and 8 N on 4 kg"], 0, "Compare F / m for each case.", "15/3 and 30/6 both give 5 m/s^2, so the two cases have the same acceleration."),
        shortItem("M2L2_M7", "Why can equal third-law forces still produce different accelerations?", ["because the masses can differ", "different masses", "equal force on different masses", "mass still matters"], "Force-pair equality does not erase mass differences."),
        shortItem("M2L2_M8", "A 18 N Master Arrow acts on a 1.5 kg craft. What Motion Shift occurs?", ["12 m/s^2", "12", "12 m/s/s"], "Use acceleration = net force / mass."),
      ];
    case "M2_L3":
      return [
        mcItem("M2L3_M1", "Which craft has the greater Carry Score?", ["3 kg at 5 m/s", "5 kg at 2 m/s", "they are equal", "it depends only on speed"], 0, "Compare mass times velocity.", "3 kg at 5 m/s has 15 kg m/s, which is greater than 10 kg m/s for 5 kg at 2 m/s."),
        shortItem("M2L3_M2", "A 4 kg craft moves at 3 m/s. What Carry Score does it have?", ["12 kg m/s", "12", "12 Ns"], "Use momentum = mass x velocity."),
        mcItem("M2L3_M3", "Two craft dock in a closed bay. Why is it wrong to conserve each craft's own momentum separately?", ["because only the whole-system total is conserved", "because momentum vanishes during contact", "because mass becomes zero", "because only one craft can carry momentum"], 0, "Conservation is a system rule.", "It is wrong because only the whole-system total is conserved in the closed bay, not each craft's own momentum separately."),
        shortItem("M2L3_M4", "A 2 kg craft moving at 6 m/s sticks to a 4 kg craft at rest. What common speed do they have after docking?", ["2 m/s", "2"], "Conserve total momentum, then divide by combined mass."),
        mcItem("M2L3_M5", "In a closed Dock Exchange, what can change while total Carry Score stays fixed?", ["how the total is shared between the craft", "the total system Carry Score", "the total system mass", "the fact that both craft are in the same collision"], 0, "Redistribution is allowed; loss of the total is not.", "The total can be shared differently between the craft while the total Carry Score stays fixed."),
        mcItem("M2L3_M6", "If the total system Carry Score before docking is zero, the shared final speed after they stick is...", ["0 m/s", "1 m/s", "the larger incoming speed", "impossible to tell"], 0, "Zero total momentum stays zero in the closed system.", "If the total system Carry Score is zero before docking, the shared final speed after they stick is 0 m/s."),
        shortItem("M2L3_M7", "In a few words, what is conserved in a closed Dock Exchange?", ["total system carry score", "total momentum", "system momentum", "the total carry score of the system"], "The conserved quantity belongs to the whole closed system."),
        shortItem("M2L3_M8", "A 4 kg craft moves at 3 m/s and a 2 kg craft moves at -1 m/s. What total Carry Score do they have together?", ["10 kg m/s", "10"], "Add the signed momenta: 12 plus negative 2."),
      ];
    case "M2_L4":
      return [
        shortItem("M2L4_M1", "A 8 N push acts 0.25 m from the pivot. What Spin Pull is produced?", ["2 N m", "2"], "Multiply force by perpendicular reach."),
        mcItem("M2L4_M2", "Which setup gives zero Spin Pull?", ["a push whose line of action passes through the pivot", "a small push far from the pivot", "a large push far from the pivot", "any push on a heavy object"], 0, "No turning reach means no torque.", "A push whose line of action passes through the pivot gives zero Spin Pull because the turning reach is zero."),
        mcItem("M2L4_M3", "A force stays fixed while the perpendicular reach triples. What happens to the Spin Pull?", ["it triples", "it halves", "it stays the same", "it becomes zero"], 0, "Torque, the moment of a force, is proportional to reach when force is fixed.", "If the force stays fixed while the reach triples, the Spin Pull triples because the torque, or moment of a force, triples."),
        mcItem("M2L4_M4", "Why does a door handle sit far from the hinge?", ["to increase turning effect for the same force", "to remove the need for force", "to reduce the door's mass", "to make the torque zero"], 0, "Larger reach makes turning easier.", "A door handle sits far from the hinge to increase the turning effect for the same force."),
        mcItem("M2L4_M5", "Which statement is the best correction to 'torque is just force'?", ["Torque, or moment of a force, depends on both force and perpendicular reach", "Torque ignores distance", "Torque is measured in newtons only", "Torque only exists while the object spins"], 0, "Use both size and location.", "Torque, or moment of a force, depends on both force and perpendicular reach, so it is not just force under a new name."),
        mcItem("M2L4_M6", "Which pair gives the same Spin Pull?", ["12 N at 0.25 m and 6 N at 0.5 m", "12 N at 0.25 m and 12 N at 0.5 m", "6 N at 0.5 m and 3 N at 0.25 m", "8 N at 0.4 m and 8 N at 0.2 m"], 0, "Compare force x reach.", "12 x 0.25 and 6 x 0.5 both produce a Spin Pull of 3 N m."),
        shortItem("M2L4_M7", "In a few words, what does perpendicular reach mean?", ["shortest distance from pivot to line of action", "distance from pivot to line of action", "moment arm", "perpendicular distance from the pivot"], "Reach is the perpendicular distance from the pivot to the force line."),
        shortItem("M2L4_M8", "A 5 N push acts 0.8 m from the pivot. What Spin Pull is produced?", ["4 N m", "4"], "Use torque, or moment of a force, = force x reach."),
      ];
    case "M2_L5":
      return [
        mcItem("M2L5_M1", "A craft becomes wider while the Balance Core stays in the same place. What happens to stability?", ["it usually increases", "it usually decreases", "it must stay identical", "it becomes impossible to judge"], 0, "A wider base gives more room before tipping.", "Stability usually increases because a wider Footprint Zone gives more room before the Balance Core line reaches the edge."),
        shortItem("M2L5_M2", "Cargo is moved to the left side of the craft. Which way does the Balance Core shift?", ["left", "to the left", "toward the moved mass", "towards the moved mass", "toward the cargo", "towards the cargo"], "The Balance Core shifts toward the moved mass."),
        mcItem("M2L5_M3", "Which change is most likely to make the same craft easier to tip?", ["raising the cargo stack higher", "making the base wider", "moving the cargo toward the center", "lowering the load"], 0, "A higher center of mass is less stable.", "Raising the cargo stack higher is most likely to make the craft easier to tip because the higher Balance Core gives less stability margin."),
        mcItem("M2L5_M4", "Why can two craft of the same total mass have different stability?", ["their mass distributions and support widths can differ", "mass alone fixes stability completely", "only color matters once mass matches", "centre of mass is identical for all equal-mass objects"], 0, "Same mass can be arranged in different ways.", "Two craft of the same total mass can have different stability because their mass distributions and support widths can differ."),
        mcItem("M2L5_M5", "Which rule best predicts stability in Thruster-Deck?", ["keep the Balance Core above the Footprint Zone", "make the craft as heavy as possible", "remove all cargo", "maximize speed"], 0, "The key rule is geometric.", "The best rule is to keep the Balance Core above the Footprint Zone."),
        mcItem("M2L5_M6", "If the base stays the same but the load is lowered, the craft usually becomes...", ["more stable", "less stable", "unchanged", "impossible to compare"], 0, "A lower center of mass usually increases the tipping margin.", "Lowering the load usually makes the craft more stable because the Balance Core sits lower."),
        shortItem("M2L5_M7", "Why is 'heavier means more stable' a weak rule?", ["because stability depends on center of mass and support width", "because center of mass and base matter too", "because weight alone does not decide tipping", "because geometry matters as well as mass"], "Stability is a geometry-and-distribution question, not just a total-mass question."),
        shortItem("M2L5_M8", "What does the Footprint Zone stand for?", ["base of support", "support area", "support region", "the area under the object"], "The Footprint Zone is the base-of-support idea in the model."),
      ];
    case "M2_L6":
      return [
        shortItem("M2L6_M1", "A force has components 8 N east and 6 N north. What resultant magnitude does that give?", ["10 N", "10"], "Use the 6-8-10 right triangle."),
        mcItem("M2L6_M2", "Why is Arrow Split useful when several angled forces act together?", ["it lets you combine forces one axis at a time", "it removes the need for direction", "it turns vectors into unrelated numbers", "it creates extra forces to cancel"], 0, "Components organize the bookkeeping.", "Arrow Split is useful because it lets you combine forces one axis at a time before rebuilding the resultant."),
        mcItem("M2L6_M3", "A diagonal arrow is resolved into horizontal and vertical parts. What must stay true?", ["those parts reconstruct the original arrow", "the original arrow no longer exists", "the components must each be larger than the original", "direction becomes irrelevant"], 0, "Resolution preserves the original vector.", "The horizontal and vertical parts must reconstruct the original arrow because resolution preserves the original vector."),
        mcItem("M2L6_M4", "If the vertical components are 7 N up and 2 N down, the net vertical part is...", ["5 N up", "5 N down", "9 N up", "9 N down"], 0, "Subtract opposite directions on the same axis.", "7 N up and 2 N down leave a net vertical part of 5 N up."),
        mcItem("M2L6_M5", "Which statement best rejects the misconception that components are extra forces?", ["components are one force rewritten on chosen axes", "components are separate pushes created by the split", "components replace the original vector permanently", "components only work if the mass is zero"], 0, "Component resolution changes the description, not the interaction.", "Components are one force rewritten on chosen axes; they are not separate pushes created by the split."),
        mcItem("M2L6_M6", "A force has components 12 N east and 5 N north. What resultant magnitude does that give?", ["13 N", "7 N", "17 N", "12 N"], 0, "Use the 5-12-13 triangle.", "The 12 N east and 5 N north components rebuild a 13 N resultant."),
        shortItem("M2L6_M7", "What stays the same after Arrow Split?", ["the original vector", "the same resultant", "the same overall force", "the same diagonal force"], "Resolving into components does not change the original force represented."),
        shortItem("M2L6_M8", "Two horizontal components are 8 N east and 6 N west. What net horizontal component remains?", ["2 N east", "2 east", "2 N"], "Subtract opposite directions and keep the larger direction."),
      ];
    default:
      return [];
  }
}
export function m2ContrastCodes(code: string): string[] {
  switch (code) {
    case "M2_L1":
      return ["F2_L5", "F2_L6", "M2_L2", "M2_L6", "M1_L3"];
    case "M2_L2":
      return ["F2_L6", "F3_L5", "M2_L1", "M2_L3", "M2_L4"];
    case "M2_L3":
      return ["F3_L4", "F3_L5", "M2_L2", "M2_L4", "M2_L6"];
    case "M2_L4":
      return ["M2_L1", "M2_L2", "M2_L5", "F2_L5", "F3_L1"];
    case "M2_L5":
      return ["M2_L4", "M2_L6", "F3_L6", "F2_L6", "M1_L5"];
    case "M2_L6":
      return ["F1_L2", "F2_L5", "M2_L1", "M2_L2", "M2_L3"];
    default:
      return [];
  }
}

export function m2PaddingPrompt(index: number): string {
  return index % 2 === 0
    ? "Which statement best matches this Thruster-Deck lesson point?"
    : "Choose the option that keeps the force-model meaning and the physics meaning aligned.";
}

export function m2ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M2_L1":
      return [
        "Collapse the whole force picture into one Master Arrow before you predict motion.",
        "Zero Master Arrow means zero acceleration, not automatically zero velocity.",
        "Balanced arrows and no arrows can share the same resultant while still telling different system stories.",
      ];
    case "M2_L2":
      return [
        "Load Rating is the mass term that resists motion change.",
        "The same Master Arrow gives more Motion Shift on the lighter craft.",
        "Third-law pairs compare interaction forces on two objects, not acceleration on one object.",
      ];
    case "M2_L3":
      return [
        "Carry Score belongs to a moving craft because of both mass and velocity.",
        "Momentum conservation belongs to the total system in a closed collision.",
        "Carry Score and force answer different questions in collision reasoning.",
      ];
    case "M2_L4":
      return [
        "Spin Pull depends on both force and perpendicular reach because it is torque, the moment of a force.",
        "A force through the pivot gives zero turning effect.",
        "A torque or moment-of-a-force explanation must mention where the force acts, not just how big it is.",
      ];
    case "M2_L5":
      return [
        "Balance Core is about mass distribution, not just total mass.",
        "A wider Footprint Zone can improve stability even when mass stays fixed.",
        "A craft can be heavy and still tip if the Balance Core line leaves the base.",
      ];
    case "M2_L6":
      return [
        "Arrow Split is a bookkeeping move that rewrites one angled force into components.",
        "Combine components axis by axis before rebuilding the resultant.",
        "Resolved components are not extra physical pushes.",
      ];
    default:
      return [];
  }
}

export function m2ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M2_L1":
      return [
        "Newton's first law: an object remains at rest or moves with constant velocity unless acted on by a non-zero resultant force.",
        "Drive Arrows are individual forces acting on the craft.",
        "The Master Arrow is the resultant force from all Drive Arrows together.",
        "In lesson language, zero Master Arrow means zero acceleration, so the motion state stays unchanged.",
      ];
    case "M2_L2":
      return [
        "Newton's first law: zero resultant force means zero acceleration, so motion stays unchanged.",
        "Newton's second law: the resultant force on an object equals mass x acceleration, so for constant mass a = Fnet / m.",
        "Newton's third law: when two objects interact, they exert equal and opposite forces on each other.",
        "Motion Shift is acceleration: how quickly velocity changes.",
        "Load Rating is mass: how hard the craft is to change.",
        "For the same Master Arrow, larger Load Rating means smaller Motion Shift, and third-law force pairs act on different objects.",
      ];
    case "M2_L3":
      return [
        "Carry Score = mass x velocity.",
        "Closed Dock Exchange missions conserve the total system Carry Score.",
        "Final speeds come from conserving the total and sharing it across the post-collision mass.",
      ];
    case "M2_L4":
      return [
        "Spin Pull is torque, also called the moment of a force: force x perpendicular reach.",
        "Zero reach means zero torque, so zero moment of a force.",
        "Torque, or moment of a force, describes turning effect, not just push size.",
      ];
    case "M2_L5":
      return [
        "Balance Core is the center-of-mass idea in the model.",
        "Footprint Zone is the support base that must stay under the Balance Core line.",
        "Stability depends on geometry as well as mass.",
      ];
    case "M2_L6":
      return [
        "Arrow Split rewrites a diagonal force as horizontal and vertical components.",
        "Components recombine to the same original vector.",
        "Vector resolution is structured bookkeeping, not a mysterious extra rule.",
      ];
    default:
      return [];
  }
}
export function m2ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M2_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  const core = m2ScaffoldCoreBullets(code);
  const focus = m2ScaffoldFocusExtras(code);
  return [
    {
      kind: "visual",
      title: visual.visual_title,
      caption: visual.visual_caption,
      image_url: visual.image_url,
      highlights: visual.visual_callouts,
    },
    {
      kind: "visual",
      title: "Module 2 lens",
      caption: core[0] || "Use the governing system rule before answering.",
      highlights: [...core.slice(1, 3), ...focus.slice(0, 2)].slice(0, 3),
    },
    {
      kind: "visual",
      title: "What to compare",
      caption: focus[0] || "Keep the main contrast visible while you reason.",
      highlights: focus.slice(1, 4),
    },
  ];
}

export function m2ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  switch (code) {
    case "M2_L1":
      return {
        title: "Master Arrow reflection check",
        prompt: "Use the Thruster-Deck force diagram in your reflection and explain why the balanced-thruster craft and the no-thruster craft can share zero Master Arrow without sharing the same force story.",
        image_url: "/lesson-media/m2/m2-l1-master-arrow.svg",
        callouts: [
          "One panel shows equal opposite Drive Arrows.",
          "One panel shows no Drive Arrows at all.",
          "Both panels can still have zero Master Arrow.",
        ],
      };
    case "M2_L2":
      return {
        title: "Load and Motion Shift check",
        prompt: "Use the load-rating diagram in your reflection and explain why the same Master Arrow gives different Motion Shifts on the light and heavy craft, and why that does not break Newton's third law.",
        image_url: "/lesson-media/m2/m2-l2-load-rating.svg",
        callouts: [
          "The same Master Arrow acts on both craft.",
          "The lighter craft shows the larger Motion Shift.",
          "The interaction arrows are equal and opposite on different objects.",
        ],
      };
    case "M2_L3":
      return {
        title: "Carry Score reflection check",
        prompt: "Use the Dock Exchange diagram in your reflection and explain what is conserved, what can change, and why the total Carry Score belongs to the whole system.",
        image_url: "/lesson-media/m2/m2-l3-dock-exchange.svg",
        callouts: [
          "Craft A and craft B each carry momentum before docking.",
          "The total before matches the total after in the closed bay.",
          "The final shared speed depends on the combined mass.",
        ],
      };
    case "M2_L4":
      return {
        title: "Spin Pull / torque reflection check",
        prompt: "Use the turning diagram in your reflection and explain why the centered push and the off-center push can have the same force but different Spin Pull, or torque.",
        image_url: "/lesson-media/m2/m2-l4-spin-pull.svg",
        callouts: [
          "One force acts through the pivot line.",
          "One force acts with a visible perpendicular reach.",
          "The turning outcome changes when the reach changes.",
        ],
      };
    case "M2_L5":
      return {
        title: "Balance Core reflection check",
        prompt: "Use the stability diagram in your reflection and explain how moving cargo and widening the base change the Balance Core rule for tipping.",
        image_url: "/lesson-media/m2/m2-l5-balance-core.svg",
        callouts: [
          "The Balance Core shifts toward the moved cargo.",
          "The narrow base leaves less margin before tipping.",
          "The wider Footprint Zone keeps the weight line inside for longer.",
        ],
      };
    case "M2_L6":
      return {
        title: "Arrow Split reflection check",
        prompt: "Use the component diagram in your reflection and explain why the horizontal and vertical parts are not extra forces, and how they rebuild the same original arrow.",
        image_url: "/lesson-media/m2/m2-l6-arrow-split.svg",
        callouts: [
          "One diagonal arrow is resolved onto the deck axes.",
          "Horizontal and vertical components are labeled separately.",
          "A rebuilt resultant matches the original arrow.",
        ],
      };
    default:
      return undefined;
  }
}
