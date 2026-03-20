"use client";

type UnknownRecord = Record<string, unknown>;

export type M3QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M3SimulationCopy = {
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

function phraseGroups(...groups: string[][]): UnknownRecord {
  return { phrase_groups: groups };
}

function shortItem(
  id: string,
  prompt: string,
  acceptedAnswers: string[],
  hint: string,
  acceptanceRules?: UnknownRecord,
): UnknownRecord {
  return {
    id,
    prompt,
    choices: [],
    accepted_answers: acceptedAnswers,
    hint,
    feedback: [hint],
    ...(acceptanceRules ? { acceptance_rules: acceptanceRules } : {}),
  };
}

function cloneBank(items: UnknownRecord[]): UnknownRecord[] {
  return items.map((item) => JSON.parse(JSON.stringify(item)) as UnknownRecord);
}

const M3_VISUAL_META: Record<string, M3QuestionVisualMeta> = {
  M3L1: {
    image_url: "/lesson-media/m3/m3-l1-ledger-world.svg",
    visual_title: "Lift-Launch world and Energy Ledger",
    visual_caption: "The pod can fill different stores, machines perform hand-offs, and the ledger shows where every joule goes.",
    visual_callouts: [
      "Height Store and Motion Store are different stores, not different forces.",
      "Machine input can split into useful gain and Leak Trail.",
      "A balanced ledger is the first check before any deeper calculation.",
    ],
  },
  M3L2: {
    image_url: "/lesson-media/m3/m3-l2-height-store.svg",
    visual_title: "Height Store factors",
    visual_caption: "Height Store grows with load, deck level, and World Grip, so the store is about position in a field, not about motion.",
    visual_callouts: [
      "More load means a bigger store at the same height.",
      "Higher deck means a bigger store for the same pod.",
      "Stronger World Grip increases the store even when mass and height stay fixed.",
    ],
  },
  M3L3: {
    image_url: "/lesson-media/m3/m3-l3-motion-store.svg",
    visual_title: "Motion Store and the speed-squared effect",
    visual_caption: "Motion Store depends on both load and pace, but pace has the stronger effect because the store scales with speed squared.",
    visual_callouts: [
      "Doubling speed does not just double Motion Store.",
      "A heavier pod at the same speed also stores more motion energy.",
      "The lesson compares proportional reasoning before formula memorization.",
    ],
  },
  M3L4: {
    image_url: "/lesson-media/m3/m3-l4-hand-off.svg",
    visual_title: "Energy Hand-off and work",
    visual_caption: "Work is the hand-off that changes a store; sometimes it is read from force and distance, and sometimes from the store change directly.",
    visual_callouts: [
      "No displacement means no work by that force in the simple aligned-force case.",
      "When the store change is already known, W = Delta E is often the cleaner first move.",
      "Work is a transfer idea, not a synonym for trying hard.",
    ],
  },
  M3L5: {
    image_url: "/lesson-media/m3/m3-l5-rate-yield.svg",
    visual_title: "Transfer Rate and Useful Yield",
    visual_caption: "Power tells how fast energy moves, while efficiency tells how much of the input becomes useful output.",
    visual_callouts: [
      "Fast and wasteful is possible.",
      "Slow and efficient is also possible.",
      "Rate and yield must stay separate in both words and equations.",
    ],
  },
  M3L6: {
    image_url: "/lesson-media/m3/m3-l6-ledger-mission.svg",
    visual_title: "Ledger mission planner",
    visual_caption: "Mixed energy problems become mission-planning problems: mark the stores, hand-offs, leaks, targets, and equation order before calculating.",
    visual_callouts: [
      "One mission can require several linked equations.",
      "Useful output from one step can become the starting point for the next step.",
      "Equation choice is part of the physics reasoning, not just bookkeeping after the fact.",
    ],
  },
};

export function m3QuestionVisualMeta(itemId: string): M3QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M3L[1-6])_[A-Z]+\d+$/);
  return match ? M3_VISUAL_META[match[1]] : undefined;
}

const M3_SIMULATION_COPY: Record<string, M3SimulationCopy> = {
  M3_L1: {
    title: "Lift-Launch ledger explorer",
    instructions: "Track the pod through one machine input, one useful store gain, and one Leak Trail so energy stays visible as a mission ledger rather than a loose slogan.",
    taskPrompt: "Build one clean transfer, one leaky transfer, and one split-store transfer. Then explain each mission with a balanced ledger statement before using any formal equation.",
    exploreSteps: [
      "Start with one machine input and a high useful fraction so almost all the energy becomes store gain.",
      "Keep the input fixed while raising the leak fraction so the useful gain shrinks.",
      "Move the useful share between Height Store and Motion Store so one mission world still produces different store stories.",
    ],
    watchFor: [
      "Energy is being stored or transferred; it is not another name for force.",
      "If useful gain falls while input stays fixed, the Leak Trail must rise.",
      "A good answer names stores, hand-offs, and leaks before it reaches for an equation.",
    ],
    tryFirst: "Try 240 J input, 75% useful gain, and a 60% Height Store share. That gives 180 J useful, 60 J leak, 108 J into Height Store, and 72 J into Motion Store.",
    takeaway: "The first advanced move in energy is not formula recall. It is keeping the ledger balanced across stores, hand-offs, and leaks.",
  },
  M3_L2: {
    title: "Height Store explorer",
    instructions: "Vary load, deck level, and World Grip to see that Height Store belongs to the whole mgh story, not to height alone.",
    taskPrompt: "Create one comparison where mass changes, one where height changes, and one where World Grip changes. Then decide which variable change explains each difference in Height Store.",
    exploreSteps: [
      "Hold height and World Grip fixed while changing only the load.",
      "Reset, then hold load and World Grip fixed while changing only the deck level.",
      "Finally hold load and height fixed while changing only World Grip so the field-strength idea stays visible.",
    ],
    watchFor: [
      "A raised pod can hold energy even while standing still.",
      "Height Store grows linearly with each of the three factors in E_p = mgh.",
      "Students often drop g from the story, so keep World Grip visible on purpose.",
    ],
    tryFirst: "Try load 4 kg, deck level 6 m, and World Grip 10 N/kg. The Height Store is 240 J. Then double the deck level and watch the store double too.",
    takeaway: "Height Store is a three-factor position store. The lesson becomes richer when mass, height, and field strength all stay explicit.",
  },
  M3_L3: {
    title: "Motion Store explorer",
    instructions: "Compare mass changes with pace changes so the squared-speed effect becomes visible instead of hiding inside a formula.",
    taskPrompt: "Run one same-mass speed comparison, one same-speed mass comparison, and one doubled-speed case. Then explain why Motion Store responds much more strongly to speed than to mass.",
    exploreSteps: [
      "Keep the load fixed and raise the speed so you can watch the Motion Store grow sharply.",
      "Reset, then keep the speed fixed and change only the load.",
      "Use the doubled-speed comparison to test whether the store doubles or quadruples.",
    ],
    watchFor: [
      "Motion Store depends on both mass and pace.",
      "Doubling speed quadruples the Motion Store because speed is squared.",
      "The faster pod is not just 'a bit more energetic'; the scaling is much stronger than that.",
    ],
    tryFirst: "Try 2 kg at 4 m/s. The Motion Store is 16 J. Then raise the pace to 8 m/s and notice the store jumps to 64 J, not 32 J.",
    takeaway: "Motion Store is where qualitative reasoning has to become proportional reasoning. Speed matters especially strongly because the store scales with v squared.",
  },
  M3_L4: {
    title: "Energy Hand-off explorer",
    instructions: "Compare force-distance hand-offs with direct store-change hand-offs so work is understood as energy transfer, not as effort language.",
    taskPrompt: "Build one push-distance case, one no-displacement case, and one direct store-gain case. Then explain when W = Fd is the right first tool and when W = Delta E is cleaner.",
    exploreSteps: [
      "Start with an aligned push over a distance so the hand-off is visible as force times distance.",
      "Set the distance to zero and watch the work fall to zero in that simple push story.",
      "Use the same total hand-off and a leak fraction to compare input work with useful store gain.",
    ],
    watchFor: [
      "Work is a transfer, not a personality trait or an effort rating.",
      "In the simple aligned case, force without displacement gives no work on the pod.",
      "When the store change is already known, Delta E can be the most direct route.",
    ],
    tryFirst: "Try 12 N over 5 m with a 20% leak. The input hand-off is 60 J, the useful store gain is 48 J, and the leak is 12 J.",
    takeaway: "Work is best understood as an energy hand-off. Force-distance is one route to it; store change is another.",
  },
  M3_L5: {
    title: "Transfer Rate and Useful Yield explorer",
    instructions: "Keep power and efficiency apart by comparing how fast energy moves with how much of that input becomes useful.",
    taskPrompt: "Create one faster-but-equally-efficient case and one more-efficient-but-not-more-powerful case. Then explain why those two comparisons answer different questions.",
    exploreSteps: [
      "Keep the same input energy while shortening the transfer time so only the rate changes.",
      "Hold input and time fixed while raising the useful fraction so only the yield changes.",
      "Compare the derived useful output and leak trail so power and efficiency stay visibly separate.",
    ],
    watchFor: [
      "Power is energy per time, not energy itself.",
      "Efficiency is useful output divided by total input, not energy per time.",
      "A machine can be powerful but wasteful, or efficient but not especially powerful.",
    ],
    tryFirst: "Try 1200 J input in 6 s at 50% Useful Yield. That gives 200 W power, 600 J useful output, and 600 J leak. Then keep 1200 J and 50% yield but cut the time to 3 s so the power doubles while the efficiency stays the same.",
    takeaway: "Rate and yield are different dimensions of machine performance. Students need both in view before mixed calculations make sense.",
  },
  M3_L6: {
    title: "Ledger mission explorer",
    instructions: "Plan a whole lift-launch-target mission and decide the equation order from the story instead of from pattern recognition.",
    taskPrompt: "Solve one mission that succeeds and one that fails. Then explain which store or machine quantity had to be found first and why that order mattered.",
    exploreSteps: [
      "Start with lift input energy and Useful Yield so you can find the first useful store gain.",
      "Apply a second-stage leak during launch or descent so the next store amount changes before the final target check.",
      "Compare the final useful energy with the gate threshold and explain the success or failure with a ledger sentence.",
    ],
    watchFor: [
      "A multi-step mission is not one giant substitution problem.",
      "Useful output from one stage can become the starting store for the next stage.",
      "Equation choice belongs to the reasoning, especially when efficiency and leaks appear before the final target.",
    ],
    tryFirst: "Try 1500 J lift input at 60% Useful Yield, then a 20% launch leak, with a 700 J gate threshold. The lift gives 900 J useful Height Store, the launch leaves 720 J for Motion Store, and the mission succeeds by 20 J.",
    takeaway: "The strongest M3 move is deliberate mission planning: stores, transfers, leaks, target, then equation order.",
  },
};

export function m3SimulationCopy(code: string): M3SimulationCopy | undefined {
  return M3_SIMULATION_COPY[code];
}

const M3_DIAGNOSTIC_ITEMS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_D5", "Which statement best fits the Lift-Launch model?", ["Energy sits in stores, moves by hand-offs, and is tracked in a ledger", "Energy is just another name for force", "Energy exists only while the pod is moving", "Energy disappears when the task ends"], 0, "This lesson treats energy as stored, transferred, and accounted for.", "The model treats energy as something stored, transferred, and accounted for across the mission."),
    mcItem("M3L1_D6", "A machine inputs 300 J and 210 J becomes useful store gain. What is the Leak Trail?", ["90 J", "210 J", "300 J", "510 J"], 0, "Use input = useful gain + leak trail.", "300 J input with 210 J useful leaves 90 J in the Leak Trail."),
    shortItem("M3L1_D7", "Why must the Energy Ledger balance?", ["because energy is accounted for in stores and leaks", "because energy is tracked in stores and leak trail", "because energy does not disappear but changes store or leaks", "because energy must be conserved in a closed system", "because total energy is conserved and must be accounted for"], "Answer in terms of energy being accounted for rather than disappearing.", phraseGroups(["energy"], ["accounted for", "balanced", "tracked", "conserved", "conservation"], ["store", "stores", "leak", "trail", "waste", "system", "ledger"])),
    mcItem("M3L1_D8", "A pod is high and held still. Which claim is strongest?", ["It can still hold Height Store", "It cannot hold energy because its pace is zero", "Only Motion Store can exist while still", "Any energy must already be lost"], 0, "Stillness does not erase stored energy.", "A raised but still pod can still hold Height Store."),
    mcItem("M3L1_D9", "Which mission description shows a hand-off rather than a store?", ["The launcher transfers 180 J into the pod", "The pod currently has 180 J of Motion Store", "The pod is on the high deck", "The pod is heavier than before"], 0, "A hand-off is a transfer event, not a stored amount.", "The launcher transferring 180 J is a hand-off because it describes energy moving into the pod."),
    shortItem("M3L1_D10", "A mission has 500 J input and 80 J leak. How much useful store gain remains?", ["420 J", "420"], "Subtract the leak from the total input using the ledger.", phraseGroups(["420"])),
  ],
  M3_L2: [
    mcItem("M3L2_D5", "Which change definitely increases Height Store for the same pod on the same world?", ["raising the deck level", "painting the pod", "waiting longer", "making the launcher stronger"], 0, "Height Store depends on load, World Grip, and deck level.", "Raising the deck level increases Height Store because E_p depends on height."),
    mcItem("M3L2_D6", "A 5 kg pod is raised 4 m in a world where g = 10 N/kg. What Height Store is gained?", ["200 J", "50 J", "40 J", "20 J"], 0, "Use E_p = mgh.", "The Height Store is 5 x 10 x 4 = 200 J."),
    shortItem("M3L2_D7", "What three things set Height Store?", ["mass, height, and gravitational field strength", "load, deck level, and world grip", "m, g, and h"], "Name load, deck level, and World Grip or the formal m, g, h version.", phraseGroups(["mass", "load", "m"], ["height", "deck", "h"], ["g", "world grip", "field strength", "gravitational"])),
    mcItem("M3L2_D8", "If the same pod is lifted to the same height on a stronger-gravity world, the Height Store is...", ["larger", "smaller", "unchanged", "zero"], 0, "World Grip is one of the three factors.", "The Height Store is larger because stronger World Grip increases mgh."),
    mcItem("M3L2_D9", "Two pods are lifted to the same height on the same world. Pod A has twice the mass of pod B. How do their Height Stores compare?", ["Pod A has twice the Height Store", "Pod A has four times the Height Store", "They are equal", "Pod A has half the Height Store"], 0, "Height Store is proportional to mass when the other factors stay fixed.", "With the same g and h, doubling the mass doubles the Height Store."),
    shortItem("M3L2_D10", "A 3 kg pod gains 150 J of Height Store on a world with g = 10 N/kg. How high was it raised?", ["5 m", "5"], "Use h = E / mg.", phraseGroups(["5"])),
  ],
  M3_L3: [
    mcItem("M3L3_D5", "Which change has the stronger effect on Motion Store?", ["doubling speed", "doubling mass", "they always have the same effect", "neither can change Motion Store"], 0, "Speed matters more strongly because it is squared.", "Doubling speed has the stronger effect because kinetic energy scales with speed squared."),
    mcItem("M3L3_D6", "A 4 kg pod moves at 6 m/s. What Motion Store does it have?", ["72 J", "24 J", "12 J", "144 J"], 0, "Use E_k = 0.5mv^2.", "The Motion Store is 0.5 x 4 x 6^2 = 72 J."),
    shortItem("M3L3_D7", "Why does doubling speed not just double Motion Store?", ["because speed is squared", "because kinetic energy depends on v squared", "because doubling speed quadruples the store"], "Use the squared-speed idea in your answer.", phraseGroups(["speed", "v"], ["squared", "square", "v^2", "quadruple", "four times"])),
    mcItem("M3L3_D8", "If a pod's speed doubles while its mass stays the same, the Motion Store becomes...", ["four times as large", "twice as large", "half as large", "unchanged"], 0, "The speed term is squared.", "When speed doubles, Motion Store becomes four times as large because of the squared-speed term."),
    mcItem("M3L3_D9", "Two pods move at the same speed. Pod A has twice the mass of pod B. How do their Motion Stores compare?", ["Pod A has twice the Motion Store", "Pod A has four times the Motion Store", "They are equal", "Pod A has half the Motion Store"], 0, "At fixed speed, Motion Store is proportional to mass.", "At the same speed, doubling the mass doubles the Motion Store."),
    shortItem("M3L3_D10", "A pod has 100 J of Motion Store and mass 2 kg. What speed does it have?", ["10 m/s", "10"], "Use E_k = 0.5mv^2 and solve for v.", phraseGroups(["10"])),
  ],
  M3_L4: [
    mcItem("M3L4_D5", "Which statement best defines work in this module?", ["An energy hand-off", "Any situation with a large force", "A synonym for effort", "The same thing as power"], 0, "Work is introduced as energy transferred.", "Work is an energy hand-off, not just a statement about effort."),
    mcItem("M3L4_D6", "A 15 N push acts through 4 m in the same direction. What work is done?", ["60 J", "11 J", "19 J", "0 J"], 0, "Use W = Fd for the simple aligned case.", "The work done is 15 x 4 = 60 J."),
    shortItem("M3L4_D7", "When is W = Fd a good first equation?", ["when a force acts through a distance in its direction", "when the force and displacement are aligned", "in a simple aligned force-distance story"], "Explain it as a force-distance hand-off story.", phraseGroups(["force"], ["distance", "displacement"], ["aligned", "same direction", "in its direction"])),
    mcItem("M3L4_D8", "A learner pushes hard on a wall but the wall does not move. In the simple model, the work done on the wall is...", ["0 J", "the same as the force", "impossible to tell", "large because the effort is large"], 0, "No displacement in the force direction means no work is done by that force in the simple model.", "The work done is 0 J because there is no displacement in the force direction."),
    mcItem("M3L4_D9", "A machine increases the pod's store energy by 180 J. What is the cleanest work statement?", ["The machine did 180 J of work on the pod", "The machine had 180 W of power", "The machine had 180 N of force", "The pod had 180 m of displacement"], 0, "When store change is known, work matches the energy transferred.", "If the pod's store energy rises by 180 J, the machine did 180 J of work on the pod."),
    shortItem("M3L4_D10", "A launcher transfers 96 J into Motion Store while 24 J leaks away. How much input work did it do?", ["120 J", "120"], "Input work must cover useful gain plus leak.", phraseGroups(["120"])),
  ],
  M3_L5: [
    mcItem("M3L5_D5", "Two machines transfer the same total energy, but one finishes in half the time. Which claim is correct?", ["The faster machine has greater power", "The faster machine must be more efficient", "The machines must have the same power", "The slower machine has greater power"], 0, "Power compares energy hand-off with time.", "The faster machine has greater power because it transfers the same energy in less time."),
    mcItem("M3L5_D6", "A machine transfers 900 J in 3 s. What is its power?", ["300 W", "30 W", "2700 W", "903 W"], 0, "Use P = E / t.", "Its power is 900 / 3 = 300 W."),
    shortItem("M3L5_D7", "How can a machine be powerful but inefficient?", ["it can transfer energy quickly but waste a lot of the input", "it can have a high rate but a lot of leak trail", "it can have high power and low useful yield"], "Keep transfer rate and useful fraction separate in your wording.", phraseGroups(["fast", "quickly", "high rate", "powerful"], ["waste", "leak", "low efficiency", "low useful yield"])),
    mcItem("M3L5_D8", "A machine inputs 1000 J and gives 700 J useful output. What efficiency does it have?", ["70%", "30%", "700%", "170%"], 0, "Use useful output divided by total input.", "The efficiency is 700/1000 = 0.70, so 70%."),
    mcItem("M3L5_D9", "Which comparison keeps efficiency the same but changes power?", ["same input and useful fraction, shorter time", "same input and time, bigger useful fraction", "same useful output and bigger leak with same input", "same time and lower input"], 0, "Changing time changes power; changing useful fraction changes efficiency.", "Keeping the input and useful fraction the same but shortening the time changes power while leaving efficiency unchanged."),
    shortItem("M3L5_D10", "A machine runs at 250 W for 8 s. How much energy does it transfer?", ["2000 J", "2000"], "Use E = Pt.", phraseGroups(["2000"])),
  ],
  M3_L6: [
    mcItem("M3L6_D5", "Why is equation order important in a ledger mission?", ["because one step often creates the quantity needed by the next step", "because the longest equation should always be used first", "because all energy equations give the same information", "because the last step decides all earlier values"], 0, "Mixed missions usually have a necessary sequence.", "Equation order matters because one stage often creates the quantity needed for the next stage."),
    mcItem("M3L6_D6", "A lift inputs 1200 J at 75% Useful Yield. How much Height Store is gained first?", ["900 J", "300 J", "1600 J", "75 J"], 0, "Find the useful gain before the next step.", "The lift gains 0.75 x 1200 = 900 J of useful Height Store first."),
    shortItem("M3L6_D7", "What should you decide before choosing equations in a long energy mission?", ["which store or hand-off each step describes", "the mission stages and ledger changes", "what changes, what leaks, and what the target is"], "Use store-change planning language, not just 'pick a formula'.", phraseGroups(["step", "stage", "sequence"], ["store", "transfer", "hand-off", "leak", "target"])),
    mcItem("M3L6_D8", "A mission loses 500 J from Height Store, leaks 80 J, and sends the rest into Motion Store. How much Motion Store reaches the gate?", ["420 J", "580 J", "80 J", "500 J"], 0, "Store lost = useful gain + leak.", "500 J lost from Height Store with 80 J leak leaves 420 J for Motion Store."),
    mcItem("M3L6_D9", "A gate needs 600 J. The mission delivers 540 J at the final step. Which judgment is correct?", ["The mission fails by 60 J", "The mission succeeds by 60 J", "The mission fails by 540 J", "The mission succeeds because some energy arrived"], 0, "Compare the final useful amount with the target threshold.", "The mission fails by 60 J because it reaches only 540 J when 600 J is required."),
    shortItem("M3L6_D10", "A mission must supply 800 J of useful output and the final machine is 80% efficient. What input energy is required?", ["1000 J", "1000"], "Required input = useful output / efficiency.", phraseGroups(["1000"])),
  ],
};

const M3_DIAGNOSTIC_EXPANSIONS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_D11", "If a machine input stays fixed but the useful gain rises, what must happen to the Leak Trail?", ["it must shrink", "it must grow", "it must stay the same", "it becomes meaningless"], 0, "Use the ledger balance.", "If the input stays fixed and the useful gain rises, the Leak Trail must shrink so the ledger still balances."),
    shortItem("M3L1_D12", "Name the two main stores in the Lift-Launch model.", ["Height Store and Motion Store", "motion store and height store"], "Use the model's two store names.", phraseGroups(["height", "store"], ["motion", "store"])),
  ],
  M3_L2: [
    mcItem("M3L2_D11", "If the same pod is lifted through twice the height change on the same world, what happens to the Height Store gained?", ["it doubles", "it quadruples", "it halves", "it stays the same"], 0, "Height Store is proportional to height change.", "With the other factors fixed, doubling the height change doubles the Height Store gained."),
    shortItem("M3L2_D12", "If mass and height stay the same but World Grip doubles, what happens to Height Store?", ["it doubles", "double"], "Height Store is proportional to World Grip.", phraseGroups(["double", "doubles", "twice"])),
  ],
  M3_L3: [
    mcItem("M3L3_D11", "Two pods have the same mass. Pod A moves at twice the speed of Pod B. How do their Motion Stores compare?", ["Pod A has four times the Motion Store", "Pod A has twice the Motion Store", "They are equal", "Pod A has eight times the Motion Store"], 0, "Use the speed-squared effect.", "For the same mass, doubling speed makes Motion Store four times as large."),
    shortItem("M3L3_D12", "A pod's mass stays fixed while its speed triples. By what factor does Motion Store change?", ["9", "nine times", "9 times"], "Tripling speed multiplies v squared by nine.", phraseGroups(["9", "nine"])),
  ],
  M3_L4: [
    mcItem("M3L4_D11", "Which statement is safest if the displacement direction is unclear?", ["Do not trust the simple W = Fd shortcut until the displacement story is clear", "The work must equal force times any distance mentioned", "Work and power are the same, so it does not matter", "The work must be zero"], 0, "The lesson keeps the aligned-force condition explicit.", "If the displacement direction is unclear, you should not trust the simple W = Fd shortcut yet."),
    shortItem("M3L4_D12", "A hand-off delivers 280 J and 40 J leaks away. How much useful store gain remains?", ["240 J", "240"], "Subtract the leak from the input hand-off.", phraseGroups(["240"])),
  ],
  M3_L5: [
    mcItem("M3L5_D11", "Two machines have the same Useful Yield, but one transfers the same energy in less time. What differs?", ["their power", "their efficiency", "their useful fraction", "none of them"], 0, "Same yield does not force same rate.", "If the same energy is transferred in less time, the power differs even when the Useful Yield stays the same."),
    shortItem("M3L5_D12", "A machine transfers 1500 J in 5 s. What is its power?", ["300 W", "300"], "Use power = energy / time.", phraseGroups(["300"])),
  ],
  M3_L6: [
    mcItem("M3L6_D11", "A mission planner already knows the gate threshold and the final stage efficiency. What is the best first move?", ["work backward from the target through that efficiency", "start with mgh no matter what", "calculate power first", "ignore the efficiency until the end"], 0, "Backward planning is often the cleanest first move.", "If the final target and final efficiency are known, the best first move is often to work backward through that efficiency."),
    shortItem("M3L6_D12", "A stage starts with 1000 J and leaks 30%. How much useful energy leaves the stage?", ["700 J", "700"], "Keep 70% of the stage input.", phraseGroups(["700"])),
  ],
};

export function m3GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  return cloneBank([...(M3_DIAGNOSTIC_ITEMS[code] || []), ...(M3_DIAGNOSTIC_EXPANSIONS[code] || [])]);
}

const M3_CONCEPT_ITEMS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_C3", "A mission starts with 450 J input, 330 J useful store gain, and 120 J leak. Which sentence is strongest?", ["The ledger balances because input equals useful gain plus leak", "Energy disappeared because the pod kept only part of it", "Leak Trail means no energy transfer happened", "The useful gain must equal the input exactly"], 0, "Use the ledger statement directly.", "The ledger balances because 450 J input equals 330 J useful gain plus 120 J leak."),
    mcItem("M3L1_C4", "Which description correctly separates a store from a hand-off?", ["Motion Store is what the pod has; a launcher hand-off is how energy enters it", "A launcher is a store and Motion Store is the machine", "Both are just forces with different names", "Stores and hand-offs mean exactly the same thing"], 0, "One is what the pod has; the other is how energy moves.", "Motion Store is what the pod has, while a launcher hand-off is the transfer that puts energy there."),
    shortItem("M3L1_C5", "In a few words, where does the 'missing' energy go if useful gain is smaller than input?", ["into the Leak Trail", "into leaks", "it spreads into waste such as heat or sound", "into wasted energy"], "Use Leak Trail or wasted-spread language, not disappearance language.", phraseGroups(["leak", "waste", "heat", "sound", "spread"])),
    mcItem("M3L1_C6", "Why is 'energy is a force' a weak statement?", ["Because stores and transfers answer different questions from forces", "Because forces never matter in physics", "Because only motion can have force", "Because energy and force are the same unit"], 0, "Keep energy-accounting language separate from force language.", "It is weak because stores and transfers answer different questions from forces."),
  ],
  M3_L2: [
    mcItem("M3L2_C3", "Which comparison best shows that Height Store depends on more than height alone?", ["same height, different mass", "same pod, same height, same world", "same color, different deck label", "same pod at rest on the same deck"], 0, "Change one factor while holding the others fixed.", "Comparing the same height with different masses shows that Height Store depends on more than height alone."),
    mcItem("M3L2_C4", "If height doubles while mass and World Grip stay fixed, the Height Store...", ["doubles", "quadruples", "halves", "stays the same"], 0, "Height Store is proportional to height.", "If height doubles with the other factors fixed, the Height Store doubles."),
    shortItem("M3L2_C5", "Why can a still pod have Height Store?", ["because being high gives room to fall in a gravitational field", "because height stores energy even when pace is zero", "because gravitational potential energy depends on position not motion"], "Explain it as position in a field, not as motion.", phraseGroups(["high", "height", "position"], ["fall", "gravitational", "field"], ["still", "not moving", "pace is zero"])),
    mcItem("M3L2_C6", "Which formal equation summarizes the Height Store pattern?", ["E_p = mgh", "E_k = 0.5mv^2", "P = E/t", "W = Fd"], 0, "Use the load-height-World-Grip equation.", "E_p = mgh summarizes the Height Store pattern."),
  ],
  M3_L3: [
    mcItem("M3L3_C3", "Which comparison best reveals the speed-squared effect?", ["same mass, speed doubled", "same speed, different color", "same speed, same mass", "same mass, same speed"], 0, "Change speed while holding mass fixed.", "Comparing the same mass with doubled speed best reveals the speed-squared effect."),
    mcItem("M3L3_C4", "If mass doubles while speed stays fixed, the Motion Store...", ["doubles", "quadruples", "halves", "stays the same"], 0, "At fixed speed, kinetic energy is proportional to mass.", "If mass doubles at fixed speed, the Motion Store doubles."),
    shortItem("M3L3_C5", "What is the cleanest reason that 8 N east and 15 N north style thinking does not belong here?", ["because Motion Store is about scalar energy, not vector addition", "because kinetic energy depends on speed size, not velocity components in this lesson", "because this lesson compares scalar stores, not force vectors"], "Keep scalar store reasoning separate from vector-combination reasoning.", phraseGroups(["scalar", "energy", "store"], ["not vector", "not components", "not vector addition"])),
    mcItem("M3L3_C6", "Which formal equation summarizes Motion Store?", ["E_k = 0.5mv^2", "E_p = mgh", "P = E/t", "W = Fd"], 0, "Use the load-and-speed-squared equation.", "E_k = 0.5mv^2 summarizes Motion Store."),
  ],
  M3_L4: [
    mcItem("M3L4_C3", "A force acts but there is no displacement in the force direction. In the simple aligned-force model, what work is done?", ["0 J", "the same as the force", "the same as the energy store already present", "the same as the time"], 0, "No displacement means no work in this simple case.", "No displacement in the force direction means 0 J of work in the simple aligned-force model."),
    mcItem("M3L4_C4", "Which choice is usually cleaner if the question already tells you how much a store changed?", ["W = Delta E", "W = Fd first", "P = E/t", "efficiency = output/input"], 0, "Start from the quantity the story gives directly.", "If the story already gives the store change, W = Delta E is usually the cleaner first move."),
    shortItem("M3L4_C5", "Why is 'work = effort' a poor physics definition?", ["because work is energy transferred", "because work measures hand-off not how hard something feels", "because effort language misses the transfer idea"], "Use hand-off or energy-transfer language.", phraseGroups(["energy", "transfer", "hand-off"], ["not effort", "not just trying hard", "not feeling hard"])),
    mcItem("M3L4_C6", "A 90 J hand-off increases the pod's store by 90 J with no leak. Which statement is correct?", ["The work done equals the store gain", "The power must be 90 W", "The force must be 90 N", "The efficiency must be below 100%"], 0, "With no leak, input hand-off equals useful store change.", "If there is no leak, the work done equals the store gain exactly."),
  ],
  M3_L5: [
    mcItem("M3L5_C3", "Which statement best distinguishes power from efficiency?", ["Power is transfer rate; efficiency is useful fraction", "Power is useful fraction; efficiency is transfer rate", "They are two names for the same quantity", "Both depend only on time"], 0, "Keep rate and fraction separate.", "Power is transfer rate, while efficiency is the useful fraction of the input."),
    mcItem("M3L5_C4", "Two machines are both 60% efficient, but one transfers the same energy in half the time. What differs?", ["their power", "their efficiency", "their useful fraction", "their total input energy must differ"], 0, "Same yield does not force same rate.", "Their power differs because the same energy is transferred in different times."),
    shortItem("M3L5_C5", "In a few words, what does efficiency compare?", ["useful output to total input", "useful energy over total energy", "useful gain divided by total input", "useful output divided by input"], "State it as useful part compared with total input.", phraseGroups(["useful"], ["input", "total"], ["divide", "fraction", "compared", "over"])),
    mcItem("M3L5_C6", "Which formula matches Transfer Rate?", ["P = E / t", "E_p = mgh", "E_k = 0.5mv^2", "efficiency = output/input x 100%"], 0, "Transfer Rate is power.", "P = E / t matches Transfer Rate."),
  ],
  M3_L6: [
    mcItem("M3L6_C3", "A mission gives total input and efficiency, then asks for height reached. What should come first?", ["find the useful store gain first", "jump straight to mgh with the total input", "use power first", "find the leak at the end only"], 0, "Useful gain is the bridge quantity to the next step.", "You should find the useful store gain first because it becomes the input to the mgh step."),
    mcItem("M3L6_C4", "Why is a ledger table powerful in a mixed mission?", ["because it keeps stores, leaks, and targets separate across the steps", "because it removes the need for equations", "because it guarantees there is only one step", "because it turns all energy into force"], 0, "A good ledger keeps the chain organized.", "A ledger table keeps stores, leaks, and targets separate across the steps so equation choice becomes clearer."),
    shortItem("M3L6_C5", "What is the first question to ask in a long energy mission?", ["what changes store first", "which step happens first", "what quantity is created before the next step", "what the first ledger step is"], "Use sequence and store-change language.", phraseGroups(["first", "step", "stage"], ["store", "change", "created", "gain"])),
    mcItem("M3L6_C6", "Which judgment best fits a final target check?", ["Compare the final useful amount with the required target", "Compare the starting amount with the largest equation", "Use the longest equation available", "Ignore any leaks after the first step"], 0, "The final target cares about the final useful amount.", "A final target check compares the final useful amount with the required target."),
  ],
};

const M3_CONCEPT_EXPANSIONS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_C7", "Which statement best fits a high, fast pod?", ["It can hold both Height Store and Motion Store at once", "It can only hold one store at a time", "It must have zero energy because no transfer is happening", "It can only produce Leak Trail"], 0, "Different stores can coexist in one mission state.", "A pod can be both high and moving, so it can hold both Height Store and Motion Store at once."),
    shortItem("M3L1_C8", "What mistake does ledger language prevent?", ["thinking energy disappears", "thinking the missing energy is gone", "thinking energy vanishes"], "Use vanish/disappear language in the correction.", phraseGroups(["disappear", "gone", "vanish"], ["energy"])),
  ],
  M3_L2: [
    shortItem("M3L2_C7", "If mass doubles while height and World Grip stay fixed, what happens to Height Store?", ["it doubles", "double"], "Height Store is directly proportional to mass.", phraseGroups(["double", "doubles", "twice"])),
    mcItem("M3L2_C8", "Why does the reference level matter in Height Store problems?", ["Because the store depends on the height change relative to a chosen reference", "Because the reference level changes the pod's mass", "Because the reference level decides the power", "Because the reference level removes World Grip"], 0, "Height Store uses the change in position.", "The reference level matters because the Height Store depends on the height change relative to that chosen level."),
  ],
  M3_L3: [
    mcItem("M3L3_C7", "Two pods have the same Motion Store, but one is heavier. Which is strongest?", ["The heavier pod can be moving more slowly", "The heavier pod must be moving faster", "Their speeds must match", "Their masses must match"], 0, "Equal kinetic energy can pair different masses with different speeds.", "For the same Motion Store, a heavier pod can be moving more slowly."),
    shortItem("M3L3_C8", "If speed doubles while mass stays fixed, by what factor does Motion Store change?", ["4", "four times", "4 times"], "Use the speed-squared relationship.", phraseGroups(["4", "four"])),
  ],
  M3_L4: [
    mcItem("M3L4_C7", "Which sentence best keeps the advanced meaning of work?", ["Work is the energy hand-off that changes a store", "Work is how hard the machine tried", "Work is just the same as power", "Work is whatever force is present"], 0, "Keep work tied to energy transfer.", "Work is the energy hand-off that changes a store."),
    shortItem("M3L4_C8", "What must the displacement story tell you before using the simple W = Fd route?", ["that the displacement is in the force direction", "that force and displacement are aligned", "that the motion is along the force"], "Use aligned-force language.", phraseGroups(["displacement", "motion"], ["force direction", "aligned", "same direction"])),
  ],
  M3_L5: [
    mcItem("M3L5_C7", "A machine becomes more efficient while its power stays the same. What changed?", ["the useful fraction improved", "the transfer rate increased", "the time alone changed", "power and efficiency must both change together"], 0, "Efficiency tracks useful fraction, not rate.", "If power stays the same but efficiency improves, the useful fraction improved."),
    shortItem("M3L5_C8", "What does Useful Yield compare?", ["useful output with total input", "useful energy over total input", "the useful fraction of the input"], "Use useful-fraction language.", phraseGroups(["useful"], ["input", "total"], ["fraction", "over", "compared"])),
  ],
  M3_L6: [
    mcItem("M3L6_C7", "If a mission gives total input and efficiency before asking for height reached, what bridge quantity should be found first?", ["the useful gain into the relevant store", "the power at the end", "the biggest number in the question", "the leak only after the final check"], 0, "The useful gain is the bridge quantity.", "You should first find the useful gain into the relevant store because that becomes the input to the next stage."),
    shortItem("M3L6_C8", "Why is backward planning sometimes helpful in long missions?", ["because the final target can tell you the earlier required input", "because it traces the target back through yields or leaks"], "Use target-backward language.", phraseGroups(["target", "final"], ["back", "backward", "trace"], ["input", "required", "earlier"])),
  ],
};

export function m3GeneratedConceptGateItems(code: string): UnknownRecord[] {
  return cloneBank([...(M3_CONCEPT_ITEMS[code] || []), ...(M3_CONCEPT_EXPANSIONS[code] || [])]);
}

const M3_MASTERY_ITEMS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_M1", "A mission inputs 500 J, gives 350 J useful store gain, and leaks 150 J. Which statement is correct?", ["The ledger balances", "Energy disappeared", "The machine transferred no energy", "The useful gain should equal 500 J"], 0, "Check input against useful gain plus leak.", "The ledger balances because 500 J input equals 350 J useful gain plus 150 J leak."),
    mcItem("M3L1_M2", "Which mission story is most clearly about Motion Store?", ["The pod moves faster across the deck", "The pod is lifted higher and held still", "The machine leaks energy as sound", "The ledger is written in a table"], 0, "Motion Store belongs to moving pace.", "The pod moving faster is a Motion Store story."),
    shortItem("M3L1_M3", "A mission inputs 640 J and 220 J leaks away. How much useful store gain remains?", ["420 J", "420"], "Subtract the Leak Trail from the input.", phraseGroups(["420"])),
    mcItem("M3L1_M4", "Why is 'the missing energy is gone' a weak explanation?", ["Because the ledger must place it in a store change or leak", "Because missing energy always turns into force", "Because the pod must have destroyed it", "Because all leaks are impossible"], 0, "Ledger reasoning prevents disappearance stories.", "It is weak because the ledger must place the energy in a store change or in the Leak Trail."),
    mcItem("M3L1_M5", "A pod is both high and moving. Which claim is strongest?", ["It can hold both Height Store and Motion Store at once", "It must choose only one store", "It cannot hold energy while moving", "Only the Leak Trail can exist"], 0, "Different stores can coexist in one mission state.", "A high, moving pod can hold both Height Store and Motion Store at the same time."),
    shortItem("M3L1_M6", "Why is energy not the same as force in the Lift-Launch model?", ["because energy is stored or transferred while force is a push interaction", "because stores and hand-offs are different from forces", "because energy bookkeeping answers different questions from force"], "Use store-transfer language versus push-interaction language.", phraseGroups(["store", "stored", "transfer", "hand-off"], ["force", "push", "interaction"], ["different", "not the same"])),
    mcItem("M3L1_M7", "If useful gain rises while input stays fixed, what must happen to the Leak Trail?", ["It must shrink", "It must grow", "It must stay fixed", "It becomes irrelevant"], 0, "Input = useful gain + leak trail.", "If the input stays fixed and useful gain rises, the Leak Trail must shrink."),
    mcItem("M3L1_M8", "Which statement best describes how energy should be tracked in a Lift-Launch mission?", ["Energy should be tracked as stores, hand-offs, leaks, and targets in one ledger", "Energy is mostly about memorizing one formula", "Energy is just the same as force with new units", "Only moving pods can matter in energy"], 0, "Track the mission as one connected energy-accounting story.", "Energy should be tracked as stores, hand-offs, leaks, and targets in one connected ledger."),
  ],
  M3_L2: [
    shortItem("M3L2_M1", "A 6 kg pod is raised 5 m on a world where g = 10 N/kg. What Height Store is gained?", ["300 J", "300"], "Use E_p = mgh.", phraseGroups(["300"])),
    mcItem("M3L2_M2", "Which comparison gives the largest Height Store?", ["5 kg raised 8 m on a 10 N/kg world", "5 kg raised 4 m on a 10 N/kg world", "2.5 kg raised 8 m on a 10 N/kg world", "5 kg raised 8 m on a 5 N/kg world"], 0, "Compare mgh for each option.", "5 kg at 8 m on a 10 N/kg world gives the largest Height Store because it has the largest mgh product."),
    mcItem("M3L2_M3", "Why is 'gravitational potential energy depends only on height' incomplete?", ["Because mass and field strength matter too", "Because height never matters", "Because only speed matters", "Because potential energy is only a force story"], 0, "Keep all three mgh factors visible.", "It is incomplete because mass and field strength matter as well as height."),
    shortItem("M3L2_M4", "A pod gains 360 J of Height Store when lifted 9 m on a world where g = 10 N/kg. What is its mass?", ["4 kg", "4"], "Use m = E / gh.", phraseGroups(["4"])),
    mcItem("M3L2_M5", "If the same pod is lifted to twice the height on the same world, what happens to the Height Store?", ["It doubles", "It quadruples", "It halves", "It stays the same"], 0, "Height Store is proportional to height.", "It doubles because E_p is proportional to height."),
    shortItem("M3L2_M6", "Why can a raised pod have energy while standing still?", ["because gravitational potential energy comes from position in a field", "because height store depends on being high not on moving", "because it has room to fall and transfer that store later"], "Answer with position/field language.", phraseGroups(["position", "high", "height"], ["field", "gravity", "fall"], ["still", "not moving", "pace is zero"])),
    mcItem("M3L2_M7", "A 2 kg pod on a 5 N/kg world is raised 12 m. What Height Store is gained?", ["120 J", "24 J", "60 J", "19 J"], 0, "Use mgh carefully.", "The Height Store is 2 x 5 x 12 = 120 J."),
    mcItem("M3L2_M8", "Which variable change could increase Height Store without changing the pod's mass?", ["raising the deck level", "changing the pod color", "waiting longer", "decreasing the world grip"], 0, "Height is one of the three direct factors.", "Raising the deck level increases Height Store without changing the pod's mass."),
  ],
  M3_L3: [
    shortItem("M3L3_M1", "A 5 kg pod moves at 4 m/s. What Motion Store does it have?", ["40 J", "40"], "Use E_k = 0.5mv^2.", phraseGroups(["40"])),
    mcItem("M3L3_M2", "Which change gives the bigger increase in Motion Store?", ["doubling speed", "doubling mass", "they always match", "neither affects Motion Store"], 0, "Speed is squared.", "Doubling speed gives the bigger increase because Motion Store depends on speed squared."),
    mcItem("M3L3_M3", "A pod's speed triples while its mass stays fixed. How does its Motion Store change?", ["It becomes nine times as large", "It becomes three times as large", "It becomes six times as large", "It stays the same"], 0, "Tripling speed multiplies v squared by nine.", "Tripling speed makes Motion Store nine times as large because the speed term is squared."),
    shortItem("M3L3_M4", "A pod has 162 J of Motion Store and mass 4 kg. What speed does it have?", ["9 m/s", "9"], "Solve E_k = 0.5mv^2 for v.", phraseGroups(["9"])),
    mcItem("M3L3_M5", "Which explanation best repairs 'fast means a little more energy'?", ["Because Motion Store rises sharply with speed and can quadruple when speed doubles", "Because mass never matters", "Because energy depends only on the route shape", "Because moving fast removes Height Store automatically"], 0, "The squared-speed effect is the key repair.", "Motion Store rises sharply with speed and can quadruple when speed doubles."),
    shortItem("M3L3_M6", "Why is speed more influential than mass in Motion Store comparisons?", ["because speed is squared while mass is linear", "because kinetic energy depends on v squared", "because doubling speed quadruples the store but doubling mass only doubles it"], "Use the squared-speed contrast explicitly.", phraseGroups(["speed", "v"], ["squared", "square", "quadruple", "four times"], ["mass", "linear", "double"])),
    mcItem("M3L3_M7", "Two pods have the same Motion Store. Pod A is heavier. Which claim is strongest?", ["Pod A must be moving more slowly", "Pod A must be moving faster", "Their speeds must match", "Their masses must match"], 0, "For equal kinetic energy, a larger mass can pair with a lower speed.", "If two pods have the same Motion Store and one is heavier, the heavier one can be moving more slowly."),
    mcItem("M3L3_M8", "A 1 kg pod moves at 12 m/s and a 4 kg pod moves at 6 m/s. What is true?", ["They have the same Motion Store", "The 4 kg pod has four times the Motion Store", "The 1 kg pod has twice the Motion Store", "Neither pod has Motion Store"], 0, "Compare 0.5mv^2 for both.", "Both have 72 J of Motion Store, so they are equal."),
  ],
  M3_L4: [
    shortItem("M3L4_M1", "A 20 N push acts through 3 m in the same direction. What work is done?", ["60 J", "60"], "Use W = Fd in the simple aligned-force case.", phraseGroups(["60"])),
    mcItem("M3L4_M2", "Which scenario is best solved first by W = Delta E?", ["A store rises by 250 J", "A known force pushes through 5 m", "A machine runs for 4 s at known power", "A velocity doubles"], 0, "If the story gives the store change directly, use it.", "A known store rise of 250 J is best solved first by W = Delta E."),
    mcItem("M3L4_M3", "A launcher does 400 J of work on the pod and 50 J leaks away. What useful store gain remains?", ["350 J", "450 J", "50 J", "400 J"], 0, "Useful gain equals input work minus leak.", "The useful store gain is 400 J minus 50 J, so 350 J remains."),
    shortItem("M3L4_M4", "Why is no-displacement pushing not counted as work in the simple model?", ["because there is no movement in the force direction", "because work needs displacement in the force direction", "because a hand-off is not completed without displacement"], "Use force-direction displacement language.", phraseGroups(["no movement", "no displacement"], ["force direction", "same direction"], ["work", "hand-off"])),
    mcItem("M3L4_M5", "Which statement keeps work and power separate?", ["Work is the total hand-off; power is how fast the hand-off happens", "Work is rate and power is amount", "Work and power are interchangeable", "Power measures useful fraction only"], 0, "Total transfer and rate are different ideas.", "Work is the total hand-off, while power is how fast that hand-off happens."),
    shortItem("M3L4_M6", "A store falls by 180 J and 30 J leaks away. How much work reaches the useful next stage?", ["150 J", "150"], "Useful next-stage gain is the store change minus the leak.", phraseGroups(["150"])),
    mcItem("M3L4_M7", "A 12 N force acts while the pod moves 0.5 m at right angles to the force. In the lesson's simple aligned model, which statement is safest?", ["Do not use the simple W = Fd rule unless you know the displacement is in the force direction", "The work must be 6 J", "The work must be zero in every model", "Direction never matters for work"], 0, "This module keeps the aligned-direction condition explicit.", "The safest statement is that the simple W = Fd rule should only be used when the displacement is in the force direction."),
    mcItem("M3L4_M8", "If the same force acts through twice the aligned distance, the work done...", ["doubles", "quadruples", "halves", "stays the same"], 0, "In the simple aligned case, work is proportional to distance.", "If the same force acts through twice the aligned distance, the work done doubles."),
  ],
  M3_L5: [
    shortItem("M3L5_M1", "A machine transfers 1800 J in 6 s. What is its power?", ["300 W", "300"], "Use P = E / t.", phraseGroups(["300"])),
    mcItem("M3L5_M2", "Two machines each input 1200 J. Machine A finishes in 3 s, Machine B in 6 s. Which is correct?", ["Machine A is more powerful", "Machine B is more powerful", "They have the same power", "Power cannot be compared"], 0, "Same energy in less time means more power.", "Machine A is more powerful because it transfers the same energy in half the time."),
    mcItem("M3L5_M3", "A machine inputs 1500 J and produces 900 J useful output. What efficiency does it have?", ["60%", "40%", "90%", "150%"], 0, "Efficiency is useful output divided by total input.", "Its efficiency is 900/1500 = 0.60, so 60%."),
    shortItem("M3L5_M4", "Why can two machines have the same power but different efficiency?", ["because they can transfer energy at the same rate but waste different amounts", "because rate and useful fraction are different ideas", "because the same power does not force the same useful yield"], "Use rate-versus-yield language.", phraseGroups(["same rate", "same power"], ["different waste", "different useful fraction", "different efficiency", "different yield"])),
    mcItem("M3L5_M5", "Which machine is more efficient?", ["The one that turns a larger fraction of its input into useful output", "The one that always has the higher power", "The one that runs longer", "The heavier one"], 0, "Efficiency is about fraction of input, not about time alone.", "The more efficient machine is the one that turns a larger fraction of its input into useful output."),
    shortItem("M3L5_M6", "A 400 W machine runs for 12 s. How much energy does it transfer?", ["4800 J", "4800"], "Use E = Pt.", phraseGroups(["4800"])),
    mcItem("M3L5_M7", "A machine has 80% efficiency but low power. Which statement is strongest?", ["It is good at avoiding waste but not especially fast at transferring energy", "It must be more powerful than every inefficient machine", "Its useful output must exceed its input", "It cannot do useful work"], 0, "High yield does not automatically mean high rate.", "It is good at avoiding waste but not especially fast at transferring energy."),
    mcItem("M3L5_M8", "If input energy and efficiency stay fixed while time is halved, what happens?", ["Power doubles and useful output stays the same", "Power stays the same and useful output doubles", "Efficiency halves and power stays the same", "Power and efficiency both double"], 0, "Same total energy in less time means higher rate only.", "Power doubles because the same energy is transferred in half the time, while useful output and efficiency stay the same."),
  ],
  M3_L6: [
    mcItem("M3L6_M1", "A lift inputs 2000 J at 70% Useful Yield. The next stage leaks 200 J before the gate. How much energy reaches the gate?", ["1200 J", "1400 J", "1800 J", "600 J"], 0, "Find the useful lift gain first, then subtract the later leak.", "The lift gives 1400 J useful energy, and after the 200 J later leak, 1200 J reaches the gate."),
    mcItem("M3L6_M2", "A gate needs 900 J. A mission reaches the final stage with 840 J. What is the correct judgment?", ["The mission fails by 60 J", "The mission succeeds by 60 J", "The mission fails by 840 J", "The mission succeeds because the pod is moving"], 0, "Compare final useful energy with the target directly.", "The mission fails by 60 J because it is 60 J short of the 900 J target."),
    shortItem("M3L6_M3", "Why should a long energy problem start with a mission plan instead of a formula guess?", ["because you need to know which step creates the next needed quantity", "because stores, leaks, and targets must be separated first", "because equation choice depends on the story sequence"], "Use step-sequence and equation-choice language.", phraseGroups(["step", "sequence", "stage"], ["next quantity", "store", "leak", "target"], ["equation choice", "which equation"])),
    shortItem("M3L6_M4", "A mission needs 600 J useful output from a machine that is 75% efficient. What input energy is required?", ["800 J", "800"], "Required input = useful output / efficiency.", phraseGroups(["800"])),
    mcItem("M3L6_M5", "Which first step is best if a question gives mass, g, and height after telling you the useful lift energy?", ["use E_p = mgh to connect that useful lift energy to height", "jump straight to power", "use efficiency again even though it is already resolved", "ignore the useful lift energy"], 0, "Once useful lift energy is known, connect it to the Height Store relation.", "After the useful lift energy is known, E_p = mgh is the correct next step to connect it to height."),
    mcItem("M3L6_M6", "A mission planner shows: input 1800 J, useful lift gain 1260 J, launch leak 15%, gate threshold 1000 J. Does the mission succeed?", ["yes, because 1071 J reaches the gate", "no, because only 960 J reaches the gate", "yes, because 1260 J is already above the threshold", "no, because efficiency and leak cannot be used together"], 0, "Apply the later leak to the useful lift gain before the final check.", "The mission succeeds because 15% of 1260 J leaks away, leaving 1071 J to reach the gate."),
    shortItem("M3L6_M7", "A pod loses 900 J from Height Store and gains 720 J of Motion Store by the gate. How much leaked away in that stage?", ["180 J", "180"], "Store lost = useful gain + leak.", phraseGroups(["180"])),
    mcItem("M3L6_M8", "Which statement best captures the planning needed in a long energy mission?", ["It needs store-ledger planning, deliberate equation choice, and multi-step mission accounting", "It only repeats the same single-step formula questions with new numbers", "It avoids qualitative reasoning and uses only substitution", "It treats efficiency and power as the same shortcut"], 0, "Long missions need planning across stores, leaks, and targets.", "Long energy missions need store-ledger planning, deliberate equation choice, and multi-step mission accounting."),
  ],
};

const M3_MASTERY_EXPANSIONS: Record<string, UnknownRecord[]> = {
  M3_L1: [
    mcItem("M3L1_M9", "A mission moves 300 J into Height Store and 180 J into Motion Store while leaking 120 J. What was the total input hand-off?", ["600 J", "480 J", "420 J", "300 J"], 0, "Add the useful stores and the leak.", "The total input is 300 J + 180 J + 120 J = 600 J."),
    shortItem("M3L1_M10", "Why does a balanced ledger matter in an energy mission?", ["because it tracks stores, hand-offs, and leaks across the whole mission", "because it forces energy to be accounted for step by step"], "Use ledger-accounting language.", phraseGroups(["track", "account", "ledger"], ["store", "hand-off", "leak", "step"])),
  ],
  M3_L2: [
    mcItem("M3L2_M9", "A 3 kg pod rises from 2 m to 10 m on a 10 N/kg world. What Height Store is gained?", ["240 J", "300 J", "80 J", "30 J"], 0, "Use the 8 m height change in mgh.", "The Height Store gained is 3 x 10 x 8 = 240 J."),
    shortItem("M3L2_M10", "Why is a height-only explanation weak in this lesson?", ["because Height Store also depends on mass and World Grip", "because mgh has three factors not one"], "Use all-three-factors language.", phraseGroups(["mass", "load"], ["g", "world grip", "field"], ["height"], ["three", "factors"])),
  ],
  M3_L3: [
    mcItem("M3L3_M9", "A 2 kg pod speeds up from 5 m/s to 10 m/s. How does its Motion Store change?", ["it becomes four times as large", "it doubles", "it triples", "it stays the same"], 0, "Doubling speed quadruples Motion Store.", "Because the speed doubles, the Motion Store becomes four times as large."),
    shortItem("M3L3_M10", "A pod has 256 J of Motion Store and mass 8 kg. What speed does it have?", ["8 m/s", "8"], "Solve 0.5mv^2 = 256.", phraseGroups(["8"])),
  ],
  M3_L4: [
    mcItem("M3L4_M9", "A force does 90 J of work on a pod and 30 J leaks away. What useful store gain results?", ["60 J", "120 J", "30 J", "90 J"], 0, "Subtract the leak from the work input.", "The useful store gain is 90 J - 30 J = 60 J."),
    shortItem("M3L4_M10", "Why can W = Delta E be cleaner than W = Fd in some problems?", ["because the store change is given directly", "because the energy hand-off is already known from the change in store"], "Use direct-store-change language.", phraseGroups(["store", "change"], ["given", "known", "direct"])),
  ],
  M3_L5: [
    mcItem("M3L5_M9", "Two machines both transfer 900 J. Machine A takes 3 s and is 50% efficient. Machine B takes 6 s and is 80% efficient. Which statement is correct?", ["Machine A is more powerful, but Machine B is more efficient", "Machine B is more powerful and more efficient", "Machine A is both more powerful and more efficient", "They must be equal because the total transfer matches"], 0, "Separate rate from useful fraction.", "Machine A is more powerful because it transfers the same energy faster, but Machine B is more efficient because it has the larger useful fraction."),
    shortItem("M3L5_M10", "A machine is 60% efficient and gives 540 J useful output. What input energy did it receive?", ["900 J", "900"], "Input = useful output / efficiency.", phraseGroups(["900"])),
  ],
  M3_L6: [
    mcItem("M3L6_M9", "A mission needs 960 J at the gate after a stage that keeps only 80% of its incoming useful energy. How much useful energy must enter that stage?", ["1200 J", "768 J", "1000 J", "1440 J"], 0, "Work backward through the 80% stage.", "If 80% of the incoming energy remains, 960 J at the gate requires 1200 J to enter the stage."),
    shortItem("M3L6_M10", "Why is equation order part of the physics in M3_L6?", ["because one stage creates the quantity needed by the next", "because stores, leaks, and targets determine which equation should come first"], "Use sequence and bridge-quantity language.", phraseGroups(["stage", "next", "sequence"], ["quantity", "store", "leak", "target"], ["equation", "order", "first"])),
  ],
};

export function m3GeneratedMasteryItems(code: string): UnknownRecord[] {
  return cloneBank([...(M3_MASTERY_ITEMS[code] || []), ...(M3_MASTERY_EXPANSIONS[code] || [])]);
}

export function m3ContrastCodes(code: string): string[] {
  switch (code) {
    case "M3_L1":
      return ["F3_L1", "F3_L2", "M3_L2", "M3_L3", "M3_L6"];
    case "M3_L2":
      return ["F3_L2", "M3_L1", "M3_L3", "M3_L4", "M3_L6"];
    case "M3_L3":
      return ["F3_L2", "M3_L1", "M3_L2", "M3_L5", "M3_L6"];
    case "M3_L4":
      return ["F3_L1", "M3_L1", "M3_L2", "M3_L5", "M3_L6"];
    case "M3_L5":
      return ["F3_L3", "M3_L3", "M3_L4", "M3_L6", "M2_L2"];
    case "M3_L6":
      return ["F3_L1", "F3_L2", "F3_L3", "M3_L4", "M3_L5"];
    default:
      return [];
  }
}

export function m3PaddingPrompt(index: number): string {
  return index % 2 === 0
    ? "Which statement best keeps the Lift-Launch analogy and the physics meaning aligned?"
    : "Choose the option that respects the store-transfer-ledger logic of this lesson.";
}

export function m3ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M3_L1":
      return [
        "Separate stores from hand-offs before you calculate anything.",
        "The Leak Trail is where wasted spread is tracked, not a sign that energy vanished.",
        "Balanced ledger statements are the conceptual spine of the whole module.",
        "A useful gain can split across more than one store without breaking the accounting.",
      ];
    case "M3_L2":
      return [
        "Height Store depends on load, deck level, and World Grip together.",
        "A still pod can still hold energy if it is raised in a gravitational field.",
        "Keep g visible so gravitational field strength does not disappear from the reasoning.",
        "Reference level matters because the store change depends on the height difference that actually occurred.",
      ];
    case "M3_L3":
      return [
        "Motion Store depends on both load and pace, but pace has the stronger effect.",
        "The squared-speed effect is the qualitative surprise students need to notice early.",
        "Use proportional comparisons before switching to pure substitution.",
        "Equal Motion Store can come from different mass-speed combinations, so guessing from one variable alone is unsafe.",
      ];
    case "M3_L4":
      return [
        "Work is the hand-off that changes a store.",
        "Use W = Fd only when the force-distance story supports it.",
        "Use W = Delta E when the store change is already the cleanest known quantity.",
        "The aligned-displacement condition belongs to the reasoning, not just to the fine print.",
      ];
    case "M3_L5":
      return [
        "Transfer Rate asks how quickly energy moves.",
        "Useful Yield asks what fraction of the input becomes useful output.",
        "High power and high efficiency are different successes and can vary independently.",
        "Machine comparison is only clear when time and useful fraction are kept as separate columns in the reasoning.",
      ];
    case "M3_L6":
      return [
        "Mission-planning comes before equation-plugging.",
        "Useful output from one step often becomes the starting point for the next step.",
        "Final judgments come from comparing the final useful amount with the target, not from admiring a large intermediate number.",
        "Backward planning is part of the capstone toolkit when the final target is known first.",
      ];
    default:
      return [];
  }
}

export function m3ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M3_L1":
      return [
        "Energy lives in stores and moves by hand-offs.",
        "Useful gain plus Leak Trail must balance the input hand-off.",
        "Height Store and Motion Store are the two main stores in the Lift-Launch world.",
        "A ledger sentence is often the first equation choice in words.",
      ];
    case "M3_L2":
      return [
        "Height Store is gravitational potential energy.",
        "Height Store depends on mass, gravitational field strength, and height: E_p = mgh.",
        "Position in a field can store energy even when the pod is not moving.",
        "Reference level decides which height change matters in the calculation.",
      ];
    case "M3_L3":
      return [
        "Motion Store is kinetic energy.",
        "Motion Store depends on mass and speed: E_k = 0.5mv^2.",
        "Doubling speed quadruples Motion Store because speed is squared.",
        "Comparing factors before calculating is part of the lesson, not a side note.",
      ];
    case "M3_L4":
      return [
        "Work is an energy hand-off.",
        "In the simple aligned-force case, W = Fd.",
        "Whenever the store change is known directly, W = Delta E can be the cleaner first statement.",
        "No displacement in the force direction means no work in the lesson's simple model.",
      ];
    case "M3_L5":
      return [
        "Power is transfer rate: P = E / t or P = W / t.",
        "Efficiency is useful output divided by total input times 100%.",
        "Power and efficiency answer different questions and must not be collapsed together.",
        "A machine can win on rate and lose on yield, or the reverse.",
      ];
    case "M3_L6":
      return [
        "Long energy problems are solved as ledger missions.",
        "Equation choice should follow the physical sequence of the mission.",
        "A successful final answer explains stores, useful gains, leaks, and targets, not just the arithmetic.",
        "Backward planning is valid when the final target is given before the earlier stages.",
      ];
    default:
      return [];
  }
}

export function m3ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M3_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  const core = m3ScaffoldCoreBullets(code);
  const focus = m3ScaffoldFocusExtras(code);
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
      title: "Module 3 lens",
      caption: core[0] || "Use the Lift-Launch world carefully before you calculate anything.",
      highlights: [...core.slice(1, 3), ...focus.slice(0, 2)].slice(0, 3),
    },
    {
      kind: "visual",
      title: "What to compare",
      caption: focus[0] || "Keep the key contrast visible while you reason.",
      highlights: focus.slice(1, 4),
    },
    {
      kind: "visual",
      title: "Equation reveal",
      caption: core[1] || "Reveal the formal equation only after the underlying pattern is clear.",
      image_url: visual.image_url,
      highlights: [core[2], core[3], focus[2]].filter(Boolean),
    },
    {
      kind: "visual",
      title: "Advanced move",
      caption: focus[3] || "This module expects a deliberate higher-level reasoning move, not just a quick substitution.",
      image_url: visual.image_url,
      highlights: [focus[0], focus[1], core[0]].filter(Boolean),
    },
  ];
}

export function m3SupplementalScaffoldSections(code: string): UnknownRecord[] {
  switch (code) {
    case "M3_L1":
      return [
        {
          heading: "Store versus hand-off test",
          body: "Before you calculate, decide whether the sentence is naming energy the pod has now or energy moving between places now. That choice keeps stores, hand-offs, and leaks from collapsing into one blurred idea.",
          check_for_understanding: "If a sentence says 'the launcher transfers 180 J', is it naming a store or a hand-off?",
        },
        {
          heading: "Ledger sentence frame",
          body: "A good first move is often a sentence, not a symbol: input hand-off = useful gain + Leak Trail. The equation later is just a compressed form of that story.",
          check_for_understanding: "If the useful gain is smaller than the input, what must your ledger sentence still include?",
        },
      ];
    case "M3_L2":
      return [
        {
          heading: "Reference level awareness",
          body: "Height Store depends on the height change relative to the chosen reference level. The advanced move is to notice which vertical difference actually changed the store, not just which final number looks high.",
          check_for_understanding: "If a pod rises from 2 m to 9 m, which height should enter the store-gain calculation?",
        },
        {
          heading: "Proportional check before substitution",
          body: "Ask how the store changes if one factor doubles while the other two stay fixed. That turns mgh into a pattern students can reason with before they plug in numbers.",
          check_for_understanding: "If mass stays fixed and World Grip doubles, what happens to the Height Store?",
        },
      ];
    case "M3_L3":
      return [
        {
          heading: "Speed-squared shock",
          body: "Students often expect faster motion to give only a modest energy rise. This lesson corrects that by showing that pace enters as a squared term, so speed changes can dominate mass changes.",
          check_for_understanding: "If speed doubles, does Motion Store double, triple, or quadruple?",
        },
        {
          heading: "Compare before calculating",
          body: "Use same-mass speed comparisons and same-speed mass comparisons before substitution. That keeps the qualitative structure of 0.5mv^2 visible instead of reducing the lesson to button-pressing.",
          check_for_understanding: "Which comparison isolates the speed effect most cleanly: same mass with new speed, or same speed with new mass?",
        },
      ];
    case "M3_L4":
      return [
        {
          heading: "Two routes to work",
          body: "Sometimes the clean route is force and distance; sometimes it is store change. Higher-level reasoning means choosing the route that matches the information the story actually gives.",
          check_for_understanding: "If the problem already tells you the store rose by 200 J, which work statement is cleaner first?",
        },
        {
          heading: "Displacement is part of the concept",
          body: "A large force by itself does not guarantee work. In the lesson's simple model, a hand-off counts through force and distance only when the displacement is in the force direction.",
          check_for_understanding: "Why is a hard push on a wall not counted as work in the lesson's simple model?",
        },
      ];
    case "M3_L5":
      return [
        {
          heading: "Rate versus yield split",
          body: "Power answers how fast the total hand-off happens. Efficiency answers how much of the input becomes useful. Treating them as one idea destroys the logic of machine comparison.",
          check_for_understanding: "Can a machine be powerful but inefficient? Explain in one sentence.",
        },
        {
          heading: "Machine-comparison habit",
          body: "When machines are compared, decide whether the story is varying total transfer, time, useful fraction, or some combination. That habit keeps 'better machine' from becoming a vague label.",
          check_for_understanding: "If two machines transfer the same energy but one finishes faster, which quantity changed: power or efficiency?",
        },
      ];
    case "M3_L6":
      return [
        {
          heading: "Mission map before equations",
          body: "Long problems become solvable when you map the stages, the stores, the leaks, and the target before choosing formulas. The map is part of the physics, not an optional note.",
          check_for_understanding: "If a target is checked at the end, where should that judgment appear in the sequence?",
        },
        {
          heading: "Backward planning is allowed",
          body: "If the target is known at the end, work backward through later yields or leaks to reconstruct what an earlier stage had to provide. That is often the most deliberate and advanced route.",
          check_for_understanding: "If a gate needs 900 J after a stage keeps only 75%, should you multiply by 0.75 or divide by 0.75 to work backward?",
        },
      ];
    default:
      return [];
  }
}

export function m3SupplementalWorkedExampleSections(code: string): UnknownRecord[] {
  switch (code) {
    case "M3_L1":
      return [
        {
          heading: "Worked example 3",
          body: "This third example makes the accounting richer by splitting the useful part across both stores.",
          worked_example: {
            prompt: "A mission inputs 720 J. The useful store gain is 480 J, split equally between Height Store and Motion Store. Find the Leak Trail and each store amount.",
            steps: [
              "Start with the full ledger: input = useful gain + Leak Trail.",
              "Subtract 480 J from 720 J to find the leaked part.",
              "Then split the useful 480 J equally between the two stores.",
            ],
            answer: "Leak Trail = 240 J, Height Store = 240 J, Motion Store = 240 J.",
            answer_reason: "The leaked part is the difference between the total input and the useful gain, and the useful gain can then be divided between the two stores without changing the ledger balance.",
          },
        },
      ];
    case "M3_L2":
      return [
        {
          heading: "Worked example 3",
          body: "This example keeps the analogy but adds a non-zero starting height so students attend to height change rather than grabbing the final height blindly.",
          worked_example: {
            prompt: "A 3 kg pod on a world where g = 8 N/kg is raised from 2 m to 9 m above the reference level. Find the Height Store gained.",
            steps: [
              "Find the height change first: 9 m - 2 m = 7 m.",
              "Use E_p = mgh with 3 kg, 8 N/kg, and 7 m.",
              "Multiply to get the store gain.",
            ],
            answer: "Height Store gained = 168 J.",
            answer_reason: "The store change depends on the 7 m rise, so E_p = 3 x 8 x 7 = 168 J.",
          },
        },
      ];
    case "M3_L3":
      return [
        {
          heading: "Worked example 3",
          body: "This example is a comparison problem, not a one-line substitution, so the lesson stays conceptually richer than a formula drill.",
          worked_example: {
            prompt: "Pod A has mass 2 kg and speed 12 m/s. Pod B has mass 8 kg and speed 6 m/s. Compare their Motion Stores.",
            steps: [
              "Use E_k = 0.5mv^2 for each pod.",
              "Pod A: 0.5 x 2 x 12^2 = 144 J.",
              "Pod B: 0.5 x 8 x 6^2 = 144 J.",
            ],
            answer: "The two pods have the same Motion Store: 144 J each.",
            answer_reason: "The heavier slower pod can match the lighter faster pod because kinetic energy depends on both mass and the square of speed.",
          },
        },
      ];
    case "M3_L4":
      return [
        {
          heading: "Worked example 3",
          body: "This one combines force-distance work with leak accounting so students do not treat those as two disconnected subtopics.",
          worked_example: {
            prompt: "A 30 N force acts through 6 m in the force direction, but 25% of the input hand-off becomes Leak Trail. Find the useful store gain.",
            steps: [
              "Compute the input hand-off: W = Fd = 30 x 6 = 180 J.",
              "Find the leaked part: 25% of 180 J = 45 J.",
              "Subtract the leak from the input hand-off.",
            ],
            answer: "Useful store gain = 135 J.",
            answer_reason: "The push gives 180 J of input work, and after 45 J leaks away, 135 J remains as useful store change.",
          },
        },
      ];
    case "M3_L5":
      return [
        {
          heading: "Worked example 3",
          body: "This machine comparison keeps rate and yield separate all the way through, which is the central discipline of the lesson.",
          worked_example: {
            prompt: "Machine A transfers 2400 J in 8 s at 75% efficiency. Machine B transfers 2400 J in 4 s at 50% efficiency. Compare their power and useful output.",
            steps: [
              "Find each power from total transfer and time.",
              "Machine A power = 300 W and Machine B power = 600 W.",
              "Then find useful output: A gives 1800 J useful while B gives 1200 J useful.",
            ],
            answer: "Machine B is more powerful, but Machine A produces the larger useful output from the same input.",
            answer_reason: "Power compares rate, while efficiency compares useful fraction, so different machines can win on different measures.",
          },
        },
      ];
    case "M3_L6":
      return [
        {
          heading: "Worked example 3",
          body: "The capstone extension works backward from the target, which is one of the clearest signs that M3 is operating at a higher planning level.",
          worked_example: {
            prompt: "A gate needs 1000 J. A launch stage loses 20% of the useful lift energy, and the lift itself is 80% efficient. What minimum lift input is required?",
            steps: [
              "Work backward from the gate: if 80% remains after launch, divide 1000 J by 0.80 to get the useful lift energy needed.",
              "That gives 1250 J useful lift energy before launch losses.",
              "Now divide 1250 J by 0.80 to undo the lift efficiency.",
            ],
            answer: "Minimum lift input = 1562.5 J.",
            answer_reason: "The target must be traced backward through the later loss and then through the lift efficiency, so 1000 / 0.80 / 0.80 = 1562.5 J.",
          },
        },
      ];
    default:
      return [];
  }
}

export function m3ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  switch (code) {
    case "M3_L1":
      return {
        title: "Ledger reflection check",
        prompt: "Use the Lift-Launch ledger visual in your reflection and explain where the input goes when the useful gain is smaller than the total hand-off.",
        image_url: "/lesson-media/m3/m3-l1-ledger-world.svg",
        callouts: [
          "Stores and Leak Trail are separate destinations for the energy.",
          "The input does not vanish when only part becomes useful.",
          "A balanced ledger sentence should appear in the explanation.",
        ],
      };
    case "M3_L2":
      return {
        title: "Height Store reflection check",
        prompt: "Use the Height Store visual in your reflection and explain how load, deck level, and World Grip all change gravitational potential energy.",
        image_url: "/lesson-media/m3/m3-l2-height-store.svg",
        callouts: [
          "The same pod can gain more store by rising higher.",
          "The same height can hold more store for a heavier pod.",
          "World Grip is a real factor, not decorative background.",
        ],
      };
    case "M3_L3":
      return {
        title: "Motion Store reflection check",
        prompt: "Use the Motion Store visual in your reflection and explain why doubling speed changes kinetic energy more strongly than doubling mass.",
        image_url: "/lesson-media/m3/m3-l3-motion-store.svg",
        callouts: [
          "Same-mass speed comparisons reveal the squared effect.",
          "Mass still matters, but speed matters more strongly.",
          "The explanation should compare proportional changes, not just quote the formula.",
        ],
      };
    case "M3_L4":
      return {
        title: "Hand-off reflection check",
        prompt: "Use the hand-off visual in your reflection and explain when work is best read from force-distance and when it is better read from the store change directly.",
        image_url: "/lesson-media/m3/m3-l4-hand-off.svg",
        callouts: [
          "Work is a transfer quantity.",
          "Displacement matters in the simple W = Fd story.",
          "Store change can be the cleaner route when it is already known.",
        ],
      };
    case "M3_L5":
      return {
        title: "Rate and Yield reflection check",
        prompt: "Use the rate-yield visual in your reflection and explain how one machine can be powerful but inefficient and another can be efficient but not especially powerful.",
        image_url: "/lesson-media/m3/m3-l5-rate-yield.svg",
        callouts: [
          "Rate is about time.",
          "Yield is about useful fraction.",
          "A good answer keeps both ideas separate all the way through.",
        ],
      };
    case "M3_L6":
      return {
        title: "Mission planner reflection check",
        prompt: "Use the ledger mission planner in your reflection and explain why long energy questions should be solved by stages instead of by guessing one favorite equation.",
        image_url: "/lesson-media/m3/m3-l6-ledger-mission.svg",
        callouts: [
          "One stage can produce the quantity the next stage needs.",
          "Leaks and useful gains must stay visible across the chain.",
          "The final target check belongs at the end of the mission plan.",
        ],
      };
    default:
      return undefined;
  }
}
