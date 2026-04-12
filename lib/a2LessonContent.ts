"use client";

import { advancedConceptVisual } from "./advancedConceptVisuals";

type UnknownRecord = Record<string, unknown>;

export type A2QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A2SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A2_VISUAL_META: Record<string, A2QuestionVisualMeta> = {
  A2L1: {
    image_url: advancedConceptVisual("A2_L1"),
    visual_title: "Atomic electrons occupy locked energy floors",
    visual_caption: "The ladder board keeps allowed levels and packet-matched jumps on one frame so quantization is read as a discrete-state rule rather than a continuous ramp.",
    visual_callouts: [
      "Electrons occupy discrete allowed levels.",
      "A photon packet must match the energy gap for an allowed jump.",
      "Ground and excited states are different allowed floors, not arbitrary heights.",
    ],
  },
  A2L2: {
    image_url: advancedConceptVisual("A2_L2"),
    visual_title: "Line spectra are barcodes of allowed atomic transitions",
    visual_caption: "The spectrum board keeps return jumps, missing-color gates, and discrete lines together so emission and absorption stay linked to the same energy-level structure.",
    visual_callouts: [
      "Emission lines come from downward transitions.",
      "Absorption lines come from upward transitions.",
      "Each atom's line pattern depends on its allowed level spacings.",
    ],
  },
  A2L3: {
    image_url: advancedConceptVisual("A2_L3"),
    visual_title: "Photoelectric emission depends on packet energy, not brightness alone",
    visual_caption: "The threshold board keeps frequency, work function, and emission rate on one display so students separate packet energy from packet count.",
    visual_callouts: [
      "Below threshold frequency, no electrons are emitted.",
      "Above threshold, intensity mainly changes the number emitted.",
      "Photon energy pays the work-function unlock cost first.",
    ],
  },
  A2L4: {
    image_url: advancedConceptVisual("A2_L4"),
    visual_title: "Excitation and ionisation are different thresholds on the same ladder",
    visual_caption: "The ladder-plus-continuum board keeps raised bound states separate from full escape so ionisation is not mistaken for 'just more excitation'.",
    visual_callouts: [
      "Excitation keeps the electron bound.",
      "Ionisation removes the electron from the atom completely.",
      "The continuum lies beyond the ionisation threshold.",
    ],
  },
  A2L5: {
    image_url: advancedConceptVisual("A2_L5"),
    visual_title: "Matter travelers can produce localized hits and wave-like patterns together",
    visual_caption: "The duality board keeps single detections and spreading pattern evidence visible at the same time so de Broglie wavelength is tied to experiment, not treated as a slogan.",
    visual_callouts: [
      "Wave-like behavior appears in pattern buildup.",
      "Localized detections still occur at specific hit points.",
      "Greater momentum gives a shorter de Broglie wavelength.",
    ],
  },
  A2L6: {
    image_url: advancedConceptVisual("A2_L6"),
    visual_title: "Several experiments point back to one packet-and-level quantum model",
    visual_caption: "The synthesis board keeps spectra, thresholds, and matter-wave evidence on one comparison frame so quantum theory reads as one coherent structure.",
    visual_callouts: [
      "Spectra support discrete energy levels.",
      "Photoelectric thresholds support packet-like photon energy transfer.",
      "Matter-wave evidence supports the wave-particle picture for moving particles.",
    ],
  },
};

export function a2QuestionVisualMeta(itemId: string): A2QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A2L[1-6])_[A-Z]+\d+$/);
  return match ? A2_VISUAL_META[match[1]] : undefined;
}

const A2_SIMULATION_COPY: Record<string, A2SimulationCopy> = {
  A2_L1: {
    title: "Energy-ladder lab",
    instructions: "Keep the allowed levels and incoming photon packet on one ladder so atomic transitions stay discrete from the start.",
    taskPrompt: "Change packet size and ladder spacing, then explain why only exact energy gaps produce allowed jumps.",
    exploreSteps: [
      "Start with the electron in the ground state.",
      "Try one packet that misses the gap and one that matches it.",
      "Compare the result before naming quantization formally.",
    ],
    watchFor: [
      "A wrong-size packet does not partly lift the electron.",
      "Excited states are still allowed bound states.",
      "The ladder idea makes later spectra easier to trust.",
    ],
    tryFirst: "Use one packet that is slightly too small, then one that matches the gap exactly. The all-or-nothing contrast is the key idea.",
    takeaway: "Atomic transitions only occur between discrete allowed energy levels when the packet matches the gap.",
  },
  A2_L2: {
    title: "Spectral-barcode lab",
    instructions: "Keep level jumps and the resulting line pattern on one board so spectra stay tied to discrete transitions.",
    taskPrompt: "Toggle between emission and absorption views, then explain why line spectra act like fingerprints of the atom's allowed level spacings.",
    exploreSteps: [
      "Start with one downward transition and identify the emitted line.",
      "Switch to absorption mode and compare what is missing instead.",
      "Compare two atoms to see how the barcode changes.",
    ],
    watchFor: [
      "Emission and absorption are opposite views of the same gaps.",
      "Lines are discrete because levels are discrete.",
      "Different atoms give different barcodes.",
    ],
    tryFirst: "Compare one emitted line and one missing line that come from the same gap before trying to describe the whole spectrum.",
    takeaway: "Line spectra are direct evidence that atomic energy levels are quantized.",
  },
  A2_L3: {
    title: "Photoelectric-threshold lab",
    instructions: "Use the threshold board to separate packet grade from beam count so emission logic stays tied to frequency and work function.",
    taskPrompt: "Vary frequency, intensity, and work function, then explain why brighter low-frequency light can still fail to eject electrons.",
    exploreSteps: [
      "Start below threshold and increase intensity only.",
      "Raise frequency across threshold and recheck emission.",
      "Compare emission rate with maximum kinetic-energy behavior.",
    ],
    watchFor: [
      "Threshold frequency decides whether emission is possible.",
      "Intensity mainly changes how many photons arrive per second.",
      "Maximum kinetic energy rises once photon energy exceeds the work-function cost.",
    ],
    tryFirst: "Keep the beam bright but below threshold first, then cross the threshold with a dimmer beam. That comparison clears the misconception fastest.",
    takeaway: "Photoelectric emission is governed by photon energy per packet, with intensity mainly affecting the emission rate after threshold.",
  },
  A2_L4: {
    title: "Excitation-versus-ionisation lab",
    instructions: "Keep bound-state jumps and the top escape threshold on one ladder so excitation and ionisation are not blurred together.",
    taskPrompt: "Raise packet energy through several thresholds, then explain why some packets only excite while larger ones ionise.",
    exploreSteps: [
      "Start below the first excitation gap.",
      "Raise the packet to a bound-state transition.",
      "Push beyond the ionisation threshold and compare the outcome.",
    ],
    watchFor: [
      "Excitation leaves the electron bound.",
      "Ionisation frees the electron completely.",
      "The continuum begins above the ionisation threshold.",
    ],
    tryFirst: "Compare one packet that reaches an excited state with one that frees the electron. The difference in final state matters more than the size words.",
    takeaway: "Ionisation is a distinct threshold beyond excitation, not just a stronger ordinary jump.",
  },
  A2_L5: {
    title: "Matter-wave lab",
    instructions: "Keep pattern buildup and localized hits visible together so wave-particle duality is read as one experimental story.",
    taskPrompt: "Change particle momentum and aperture width, then explain how localized detections can still build a wave-like pattern.",
    exploreSteps: [
      "Start with one-particle-at-a-time detections.",
      "Let the full pattern build gradually.",
      "Change momentum and watch the wavelength and spread respond.",
    ],
    watchFor: [
      "Detections stay localized even while the full pattern is wave-like.",
      "Diffraction strength depends on wavelength and geometry.",
      "Greater momentum means shorter de Broglie wavelength.",
    ],
    tryFirst: "Look at the single hit dots before you look at the finished pattern. That keeps the duality evidence honest.",
    takeaway: "Wave-particle duality is strongest when localized detections and pattern evidence are kept on the same board.",
  },
  A2_L6: {
    title: "Quantum-evidence lab",
    instructions: "Use one evidence board to compare spectra, thresholds, and matter-wave behavior so the module ends as one quantum model instead of a list of facts.",
    taskPrompt: "Switch between the evidence panels and explain which shared packet-or-level idea each experiment supports.",
    exploreSteps: [
      "Start with spectra and identify the discrete-level clue.",
      "Compare the photoelectric threshold clue next.",
      "Finish with matter-wave evidence and state the common quantum theme.",
    ],
    watchFor: [
      "Different experiments support one coherent model.",
      "Discrete levels and packet transfer are repeated themes.",
      "Wave evidence extends quantum reasoning beyond atomic ladders alone.",
    ],
    tryFirst: "Place two evidence types side by side and ask what principle both are really supporting before you list their names.",
    takeaway: "Quantum theory is stronger when several experiments point back to the same packet-and-level structure.",
  },
};

export function a2SimulationCopy(code: string): A2SimulationCopy | undefined {
  return A2_SIMULATION_COPY[code];
}

export function a2ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A2_L1":
      return ["Treat atomic energy as discrete, not continuous.", "Use packet-gap matching before memorizing level names.", "Keep the ground-state reference visible."];
    case "A2_L2":
      return ["Tie every spectral line to a transition.", "Keep emission and absorption as opposite views of the same gaps.", "Use barcode language to compare atoms without flattening them."];
    case "A2_L3":
      return ["Separate packet energy from packet count.", "Use threshold frequency before brightness language.", "Keep work function and maximum kinetic energy in the same story."];
    case "A2_L4":
      return ["Keep excitation and ionisation as different outcomes.", "Use threshold language for full escape.", "Do not treat every absorbed packet as ionising."];
    case "A2_L5":
      return ["Keep localized hits and wave patterns together.", "Use momentum to explain wavelength change.", "Do not force the evidence into a classical either-or choice."];
    case "A2_L6":
      return ["Compare experiments instead of memorizing them separately.", "Look for the repeated packet-and-level theme.", "Treat synthesis as the final quantum skill, not an optional summary."];
    default:
      return [];
  }
}

export function a2ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A2_L1":
      return ["Atomic electrons occupy discrete energy levels.", "An electron changes level only by taking or giving the right energy packet.", "Excitation lifts an electron away from the ground state."];
    case "A2_L2":
      return ["Emission lines come from downward transitions.", "Absorption lines come from upward transitions.", "Line spectra are evidence for discrete energy levels."];
    case "A2_L3":
      return ["Photoelectron emission depends on photon energy, so frequency matters directly.", "Below threshold frequency, no electrons are emitted however bright the light becomes.", "Above threshold, intensity mainly changes the emission rate."];
    case "A2_L4":
      return ["Excitation keeps the electron bound, while ionisation frees it completely.", "Ionisation needs more energy than a smaller bound-state transition.", "The atomic ladder ends at a threshold above which the electron is free."];
    case "A2_L5":
      return ["Quantum objects can be detected as particles while still producing wave-like patterns.", "The de Broglie relation links momentum to wavelength.", "Wave-particle duality is about experiment-dependent evidence, not a classical contradiction."];
    case "A2_L6":
      return ["Several experiments point to the same quantum picture rather than unrelated tricks.", "Spectra support discrete atomic levels and photoelectric thresholds support packet transfer.", "Matter-wave behavior supports quantum descriptions beyond classical particle motion."];
    default:
      return [];
  }
}

export function a2ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A2_VISUAL_META[code.replace("_", "")];
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

export function a2ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A2_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A2_L1: "Use the energy-ladder visual to explain why only exact packet sizes produce allowed atomic transitions.",
    A2_L2: "Use the spectral-barcode visual to explain why line spectra are evidence for discrete energy levels.",
    A2_L3: "Use the threshold visual to explain why frequency and intensity play different roles in the photoelectric effect.",
    A2_L4: "Use the excitation-ionisation visual to explain why full ionisation is not just a larger excitation.",
    A2_L5: "Use the matter-wave visual to explain how localized detections and wave-like patterns can both be true.",
    A2_L6: "Use the quantum-evidence visual to explain what common packet-and-level idea links the module's major experiments.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the A2 visual to explain the lesson's key quantum relationship clearly.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
