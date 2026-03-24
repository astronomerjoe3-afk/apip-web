"use client";

import { advancedConceptVisual } from "./advancedConceptVisuals";

type UnknownRecord = Record<string, unknown>;

export type A5QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A5SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A5_VISUAL_META: Record<string, A5QuestionVisualMeta> = {
  A5L1: {
    image_url: advancedConceptVisual("A5_L1"),
    visual_title: "Oscillation needs a return tendency toward equilibrium",
    visual_caption: "The oscillation board keeps equilibrium, displacement, amplitude, and return direction on one frame so repeated motion is explained by restoring tendency rather than by repetition alone.",
    visual_callouts: [
      "Oscillation is repeated motion about equilibrium.",
      "The restoring effect points back toward the center.",
      "Amplitude measures the maximum displacement from equilibrium.",
    ],
  },
  A5L2: {
    image_url: advancedConceptVisual("A5_L2"),
    visual_title: "Simple harmonic motion is the special case with proportional restoring acceleration",
    visual_caption: "The SHM board keeps displacement and acceleration linked so learners see why SHM is more specific than 'any repeated motion'.",
    visual_callouts: [
      "SHM requires acceleration proportional to displacement.",
      "The acceleration always points back toward equilibrium.",
      "Zero displacement at equilibrium means zero restoring acceleration there.",
    ],
  },
  A5L3: {
    image_url: advancedConceptVisual("A5_L3"),
    visual_title: "Displacement, velocity, and acceleration traces are linked views of one oscillation",
    visual_caption: "The trace board keeps sinusoidal graphs and phase relationships on one display so the equations and graphs are read as one motion story.",
    visual_callouts: [
      "Ideal SHM produces sinusoidal time graphs.",
      "Period and frequency come from the repeating cycle spacing.",
      "Displacement, velocity, and acceleration remain phase-linked.",
    ],
  },
  A5L4: {
    image_url: advancedConceptVisual("A5_L4"),
    visual_title: "SHM swaps energy between motion and stored stretch without losing the total in the ideal case",
    visual_caption: "The energy board keeps kinetic, potential, and total energy together so the oscillator is not misread as 'using up' energy at equilibrium.",
    visual_callouts: [
      "Kinetic energy is largest at equilibrium.",
      "Potential energy is largest at maximum displacement.",
      "Total energy stays constant in the ideal undamped model.",
    ],
  },
  A5L5: {
    image_url: advancedConceptVisual("A5_L5"),
    visual_title: "Resonance appears when the driving rhythm matches the natural timing",
    visual_caption: "The driven-oscillator board keeps natural frequency, driving frequency, and response amplitude on one graph so resonance is read as a match condition rather than as a mysterious extra force.",
    visual_callouts: [
      "Forced oscillations are maintained by an external driver.",
      "The strongest response occurs near the natural frequency.",
      "Damping changes how sharply the resonance peak appears.",
    ],
  },
  A5L6: {
    image_url: advancedConceptVisual("A5_L6"),
    visual_title: "Damping is an energy-loss setting that shapes response style",
    visual_caption: "The damping board keeps underdamped, critically damped, and overdamped responses on one frame so application choices are tied to settling behavior.",
    visual_callouts: [
      "Damping removes energy from the oscillator.",
      "Underdamped systems still oscillate while fading.",
      "Critically damped response returns fastest without oscillating.",
    ],
  },
};

export function a5QuestionVisualMeta(itemId: string): A5QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A5L[1-6])_[A-Z]+\d+$/);
  return match ? A5_VISUAL_META[match[1]] : undefined;
}

const A5_SIMULATION_COPY: Record<string, A5SimulationCopy> = {
  A5_L1: {
    title: "Oscillation-return lab",
    instructions: "Keep equilibrium, displacement, and return direction on one board so oscillation starts as a restoring-tendency story.",
    taskPrompt: "Change starting displacement and restoring strength, then explain why repeated motion about equilibrium needs a return effect toward the center.",
    exploreSteps: [
      "Start from equilibrium and move to a displaced position.",
      "Read the return direction before the motion begins.",
      "Compare larger and smaller restoring settings.",
    ],
    watchFor: [
      "Repeated motion alone does not guarantee oscillation physics.",
      "The restoring effect points toward equilibrium.",
      "Amplitude is the maximum displacement, not the restoring force itself.",
    ],
    tryFirst: "Find equilibrium first, then ask which way the restoring effect points after a displacement. That one check anchors the whole lesson.",
    takeaway: "Oscillations are repeated motions about equilibrium sustained by a restoring tendency back toward the center.",
  },
  A5_L2: {
    title: "SHM-condition lab",
    instructions: "Use the SHM board to compare displacement and acceleration directly so the proportional restoring rule stays visible.",
    taskPrompt: "Probe different displacements, then explain why SHM is the special oscillation where restoring acceleration grows with displacement and points back toward equilibrium.",
    exploreSteps: [
      "Start close to equilibrium and read the acceleration.",
      "Move farther out and compare how the acceleration changes.",
      "Check the sign of the acceleration on both sides of equilibrium.",
    ],
    watchFor: [
      "Acceleration is proportional to displacement in magnitude.",
      "The acceleration points opposite to the displacement sign.",
      "SHM is more specific than a generic repeating motion.",
    ],
    tryFirst: "Compare two equal displacements on opposite sides of equilibrium and see how the acceleration direction flips.",
    takeaway: "SHM is defined by the proportional restoring acceleration rule, not by repetition alone.",
  },
  A5_L3: {
    title: "SHM-trace lab",
    instructions: "Keep displacement, velocity, and acceleration traces on one graph board so phase relationships stay visible.",
    taskPrompt: "Change time window and frequency, then explain how the sinusoidal traces represent one oscillation viewed in different ways.",
    exploreSteps: [
      "Start with the displacement trace and read one full cycle.",
      "Turn on velocity and acceleration traces for comparison.",
      "Measure the period and translate it into frequency.",
    ],
    watchFor: [
      "The traces are phase-linked, not independent signals.",
      "Period and frequency come from the same repeating pattern.",
      "Equations and graphs are two representations of the same motion.",
    ],
    tryFirst: "Read the cycle spacing on the displacement trace before you compare the other traces. That gives the period anchor first.",
    takeaway: "SHM graphs and equations become clearer when all traces are read as linked views of one oscillation.",
  },
  A5_L4: {
    title: "Energy-swap lab",
    instructions: "Keep motion energy, stored energy, and total energy together so SHM is read as an energy-exchange story rather than an energy-loss story.",
    taskPrompt: "Move around the cycle and explain why kinetic and potential energy swap roles while total energy stays constant in the ideal case.",
    exploreSteps: [
      "Start at maximum displacement and read the energy split.",
      "Move through equilibrium and compare the new energy shares.",
      "Return to the opposite side and compare the full cycle.",
    ],
    watchFor: [
      "Potential energy is largest at maximum displacement.",
      "Kinetic energy is largest at equilibrium.",
      "Total energy stays constant in the undamped ideal model.",
    ],
    tryFirst: "Compare the energy bars at maximum displacement and at equilibrium before you talk about formulas. The pattern is the main idea.",
    takeaway: "SHM continually swaps energy between stored stretch and motion while preserving the total in the ideal model.",
  },
  A5_L5: {
    title: "Resonance-drive lab",
    instructions: "Use the driver-response board to compare natural frequency, driving frequency, and damping in one place.",
    taskPrompt: "Change the driving rhythm and damping, then explain why resonance is the strong-response condition near natural-frequency match.",
    exploreSteps: [
      "Start away from the natural frequency and read the response amplitude.",
      "Move the driving frequency toward the natural value.",
      "Change damping and compare how the response peak changes.",
    ],
    watchFor: [
      "Natural frequency belongs to the system itself.",
      "Driving frequency belongs to the external source.",
      "Resonance is a match condition, not a new kind of force.",
    ],
    tryFirst: "Sweep the driver through the natural frequency slowly so the response peak can be seen rather than guessed.",
    takeaway: "Forced oscillations respond most strongly when the driver rhythm matches the system's own timing.",
  },
  A5_L6: {
    title: "Damping-response lab",
    instructions: "Keep underdamped, critically damped, and overdamped traces on one board so damping is read as an application-design choice.",
    taskPrompt: "Change damping level and application target, then explain why different jobs need different settling styles.",
    exploreSteps: [
      "Start with a lightly damped system and watch the fading oscillation.",
      "Raise the damping toward the critically damped case.",
      "Compare the overdamped return and decide which application it best suits.",
    ],
    watchFor: [
      "Damping removes energy from the system.",
      "Critically damped response returns fastest without overshoot.",
      "More damping is not automatically better; the application goal matters.",
    ],
    tryFirst: "Compare underdamped and critically damped traces side by side before you judge which one is 'best.'",
    takeaway: "Damping is an energy-loss setting that shapes how an oscillator settles and which applications it suits.",
  },
};

export function a5SimulationCopy(code: string): A5SimulationCopy | undefined {
  return A5_SIMULATION_COPY[code];
}

export function a5ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A5_L1":
      return ["Start from equilibrium and return direction.", "Use amplitude as displacement size, not as force.", "Do not call every repeated motion an oscillation story."];
    case "A5_L2":
      return ["Use the proportional restoring rule.", "Keep the acceleration directed back toward equilibrium.", "Treat SHM as a special case, not a synonym for all oscillations."];
    case "A5_L3":
      return ["Read the graphs as linked traces of one system.", "Use period and frequency together.", "Keep phase language visible when comparing traces."];
    case "A5_L4":
      return ["Track kinetic and potential energy together.", "Do not say energy is used up at equilibrium.", "Keep total energy visible in the ideal model."];
    case "A5_L5":
      return ["Separate natural frequency from driving frequency.", "Treat resonance as a response condition.", "Use damping to explain peak shape."];
    case "A5_L6":
      return ["Read damping as energy loss.", "Compare underdamped, critical, and overdamped returns.", "Choose damping by application goal, not by 'more is better' instinct."];
    default:
      return [];
  }
}

export function a5ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A5_L1":
      return ["Oscillations are repeated motions about equilibrium.", "A restoring effect points back toward the balance position.", "Amplitude is the maximum displacement from equilibrium."];
    case "A5_L2":
      return ["SHM is defined by acceleration being proportional to displacement and opposite in direction.", "Maximum displacement coincides with maximum restoring-acceleration magnitude.", "Acceleration is zero at equilibrium in the ideal model."];
    case "A5_L3":
      return ["Ideal SHM produces sinusoidal time graphs.", "Displacement, velocity, and acceleration have fixed phase relationships.", "Period and frequency are read from the repeating time spacing."];
    case "A5_L4":
      return ["Energy swaps continuously between kinetic and potential forms in SHM.", "Kinetic energy is greatest at equilibrium.", "The total energy stays constant in the ideal undamped model."];
    case "A5_L5":
      return ["Forced oscillations are maintained by an external driver.", "The strongest response occurs near the natural frequency.", "Amplitude depends on frequency match and damping."];
    case "A5_L6":
      return ["Damping removes energy from the oscillator.", "Different damping levels produce different return behaviors.", "Applications are best explained by matching damping style to the job."];
    default:
      return [];
  }
}

export function a5ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A5_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [
    {
      kind: "visual",
      title: visual.visual_title,
      caption: visual.visual_caption,
      image_url: visual.image_url,
      highlights: visual.visual_callouts,
    },
  ];
}

export function a5ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A5_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A5_L1: "Use the oscillation-basics visual to explain why restoring tendency toward equilibrium is the key condition for this lesson.",
    A5_L2: "Use the SHM visual to explain why proportional restoring acceleration makes SHM more specific than ordinary oscillation.",
    A5_L3: "Use the SHM-graphs visual to explain why displacement, velocity, and acceleration traces should be read as linked views of one motion.",
    A5_L4: "Use the SHM-energy visual to explain why energy swaps between kinetic and potential forms without being lost in the ideal model.",
    A5_L5: "Use the resonance visual to explain why the strongest response occurs near natural-frequency match.",
    A5_L6: "Use the damping visual to explain how damping level changes the settling style and the best application fit.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the A5 visual to explain the lesson's key oscillation relationship clearly.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
