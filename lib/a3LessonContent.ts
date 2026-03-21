"use client";

type UnknownRecord = Record<string, unknown>;

export type A3QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A3SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A3_ASSET_BASE = "/lesson_assets/A3";

const A3_VISUAL_META: Record<string, A3QuestionVisualMeta> = {
  A3L1: {
    image_url: `${A3_ASSET_BASE}/A3_L1/diagrams/a3-l1-flux-window.svg`,
    visual_title: "Field threads through the window loop",
    visual_caption: "The flux visual keeps field strength, loop area, and tilt on the same board so magnetic flux stays a field-through-window idea.",
    visual_callouts: [
      "Flux depends on field strength, area, and orientation.",
      "Face-on loops catch the maximum through-thread score.",
      "Tilt reduces the perpendicular field through the window.",
    ],
  },
  A3L2: {
    image_url: `${A3_ASSET_BASE}/A3_L2/diagrams/a3-l2-induction-pulse.svg`,
    visual_title: "Changing flux triggers the loop push",
    visual_caption: "The induction visual compares steady and changing thread counts so the learner sees that induction is a rate-of-change story, not a field-exists story.",
    visual_callouts: [
      "Only changing flux induces emf.",
      "Changing field, area, or angle can all trigger induction.",
      "Faster change gives a larger induced effect.",
    ],
  },
  A3L3: {
    image_url: `${A3_ASSET_BASE}/A3_L3/diagrams/a3-l3-flux-linkage.svg`,
    visual_title: "Many linked windows strengthen the effect",
    visual_caption: "The coil visual turns flux linkage into a visible total, so students can separate per-turn flux from the whole coil story.",
    visual_callouts: [
      "Flux linkage totals the linked flux across all turns.",
      "More turns can increase induced emf without changing field strength.",
      "Faraday's law for a coil tracks the rate of change of NPhi.",
    ],
  },
  A3L4: {
    image_url: `${A3_ASSET_BASE}/A3_L4/diagrams/a3-l4-lenz-opposition.svg`,
    visual_title: "Oppose-turn rule for changing flux",
    visual_caption: "The Lenz visual keeps the change and the induced response separate so students stop saying that the induced current simply opposes the field.",
    visual_callouts: [
      "Lenz's law opposes the change in flux.",
      "Reversing the change reverses the induced response.",
      "The minus sign is a direction rule, not a size rule.",
    ],
  },
  A3L5: {
    image_url: `${A3_ASSET_BASE}/A3_L5/diagrams/a3-l5-dc-ac-waveform.svg`,
    visual_title: "One-way and swing drives on a time graph",
    visual_caption: "The waveform comparison makes AC and DC different time behaviours rather than different sizes of the same thing.",
    visual_callouts: [
      "DC stays on one side of zero.",
      "AC crosses zero and reverses direction.",
      "Period and frequency describe the AC beat clock.",
    ],
  },
  A3L6: {
    image_url: `${A3_ASSET_BASE}/A3_L6/diagrams/a3-l6-rms-heat-match.svg`,
    visual_title: "Crest level and heat-match level",
    visual_caption: "The RMS graph keeps peak and effective value separate so the equal-heating idea stays visible on the same sine wave.",
    visual_callouts: [
      "RMS is lower than the peak for a sine wave.",
      "RMS matches the equal-heating DC value in a resistor.",
      "The ordinary average over a full cycle is not the effective heating value.",
    ],
  },
};

export function a3QuestionVisualMeta(itemId: string): A3QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A3L[1-6])_[A-Z]+\d+$/);
  return match ? A3_VISUAL_META[match[1]] : undefined;
}

const A3_SIMULATION_COPY: Record<string, A3SimulationCopy> = {
  A3_L1: {
    title: "Window catch lab",
    instructions: "Treat the loop as a window in a thread field so flux stays tied to field-through-area, not just to field strength.",
    taskPrompt: "Change field strength, loop area, and tilt, then explain why magnetic flux is a through-window score rather than a field-only label.",
    exploreSteps: ["Start with a face-on loop.", "Double the area and compare the flux.", "Tilt the loop and watch the through-thread score fall."],
    watchFor: ["Face-on gives the maximum flux.", "Area and field strength both matter.", "Tilt reduces the perpendicular component through the loop."],
    tryFirst: "Begin with a medium field and a face-on loop. Double the window size first, then tilt it so you can compare size and orientation on the same board.",
    takeaway: "Flux is the through-thread score set by field strength, area, and orientation together.",
  },
  A3_L2: {
    title: "Pulse trigger lab",
    instructions: "Make the through-thread score change slowly, quickly, or not at all so induction becomes a change story instead of a presence story.",
    taskPrompt: "Create one slow flux change, one fast flux change, and one steady-flux case, then explain which cases induce emf and why.",
    exploreSteps: ["Set a moderate flux change.", "Shorten the change time.", "Try a no-change case and compare the readout."],
    watchFor: ["Steady unchanged flux gives no induced emf.", "Faster change gives larger emf magnitude.", "Changing area, angle, or field can all create induction."],
    tryFirst: "Use the same flux change twice but make the second one happen faster. The larger induced effect should come from the faster rate, not from a new kind of field.",
    takeaway: "Induction is caused by changing flux, and the size of the effect depends on how quickly the change happens.",
  },
  A3_L3: {
    title: "Flux linkage lab",
    instructions: "Compare one loop and many linked loops so turn count feels like part of the physical story instead of a random multiplier.",
    taskPrompt: "Change the number of turns while holding flux per turn steady, then explain why the total linkage and induced effect grow.",
    exploreSteps: ["Set a flux per turn.", "Increase the number of turns.", "Change the linkage time and compare the emf."],
    watchFor: ["Flux linkage totals across all turns.", "More turns can increase emf.", "Faraday's law for coils is about change in NPhi."],
    tryFirst: "Compare a 1-turn loop and a 10-turn coil with the same flux per turn, then keep the 10-turn coil and make the linkage change happen faster.",
    takeaway: "A coil behaves like many linked windows, so Faraday's law naturally uses total flux linkage.",
  },
  A3_L4: {
    title: "Oppose-turn lab",
    instructions: "Read the sign of the flux change first, then choose the induced response that resists it so Lenz's law stays causal and clear.",
    taskPrompt: "Set increasing and decreasing flux cases, then explain how the induced response changes and why it must oppose the change.",
    exploreSteps: ["Choose an increasing-flux case.", "Reverse the change.", "Compare direction reasoning with the energy note."],
    watchFor: ["Lenz's law opposes the change, not the field in a blanket way.", "Reversing the change reverses the induced response.", "The opposition rule explains why energy input is needed."],
    tryFirst: "Start with increasing flux, then flip to decreasing flux without changing anything else. The direction should reverse because the change reversed.",
    takeaway: "Lenz's law is the induced-direction rule that makes induction resist the change that produced it.",
  },
  A3_L5: {
    title: "Drive sorter lab",
    instructions: "Switch between one-way and swing drive while watching the time graph so AC and DC become different behaviours, not different sizes.",
    taskPrompt: "Compare DC and AC traces, then explain how period, frequency, and peak help describe swing drive accurately.",
    exploreSteps: ["View a DC trace first.", "Switch to AC and increase the frequency.", "Pause the time marker to compare instantaneous values."],
    watchFor: ["AC crosses zero and reverses sign.", "DC stays one-sided.", "Frequency and period set the beat clock of the cycle."],
    tryFirst: "Compare a DC trace and an AC trace with similar top values. The key difference is the reversal pattern, not just the size of the graph.",
    takeaway: "DC is one-way drive, AC is swing drive, and time graphs reveal that difference cleanly.",
  },
  A3_L6: {
    title: "Heat-match lab",
    instructions: "Keep the crest level and the RMS level on the same graph so the effective-value idea stays tied to equal resistor heating.",
    taskPrompt: "Change the peak value of a sine wave, compare the RMS level, and explain why RMS is the fair AC-to-DC comparison.",
    exploreSteps: ["Set a peak value.", "Read the RMS value.", "Compare the equivalent DC heating readout."],
    watchFor: ["RMS is smaller than peak for a sine wave.", "RMS matches equal heating in a resistor.", "The average over a full cycle is not the same as RMS."],
    tryFirst: "Start with a moderate peak, then double it. Watch both the crest and the RMS move together while the RMS stays below the peak.",
    takeaway: "RMS is the heat-match level that gives the equal-heating DC value for a sinusoidal AC.",
  },
};

export function a3SimulationCopy(code: string): A3SimulationCopy | undefined {
  return A3_SIMULATION_COPY[code];
}

export function a3ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A3_L1":
      return ["Treat flux as field-through-window.", "Keep tilt visible, not hidden inside the symbol.", "Compare field, area, and angle together."];
    case "A3_L2":
      return ["Change causes induction.", "Keep steady-flux and changing-flux cases separate.", "Use rate language, not just change happened language."];
    case "A3_L3":
      return ["Separate flux per turn from total linkage.", "Treat a coil as many linked windows.", "Read Faraday's law as a rate-of-linkage-change law."];
    case "A3_L4":
      return ["Oppose the change, not the field blindly.", "Reverse the response when the change reverses.", "Use the energy story to justify the direction rule."];
    case "A3_L5":
      return ["Use the graph to separate AC and DC.", "Keep period and frequency linked as inverses.", "Treat peak as crest level, not every instant."];
    case "A3_L6":
      return ["Keep peak and RMS on the same graph.", "Use equal-heating language for RMS.", "Protect against the average-equals-RMS trap."];
    default:
      return [];
  }
}

export function a3ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A3_L1":
      return ["Flux is field passing through area.", "Flux depends on field strength, area, and orientation.", "Face-on loops give maximum flux."];
    case "A3_L2":
      return ["Induction needs changing flux.", "Faster flux change gives a larger induced effect.", "Steady flux does not keep inducing emf."];
    case "A3_L3":
      return ["Flux linkage totals across all turns.", "More turns can increase induced emf.", "Coil induction depends on the rate of change of NPhi."];
    case "A3_L4":
      return ["Lenz's law opposes the change in flux.", "Reversing the change reverses the induced response.", "The minus sign in Faraday's law is a direction rule."];
    case "A3_L5":
      return ["DC stays one-way in time.", "AC swings positive and negative and repeats.", "Period and frequency describe the repetition clock."];
    case "A3_L6":
      return ["RMS is the equal-heating DC comparison value.", "Peak is larger than RMS for a sine wave.", "The full-cycle average is not the same as RMS."];
    default:
      return [];
  }
}

export function a3ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A3_VISUAL_META[code.replace("_", "")];
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

export function a3ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A3_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A3_L1: "Use the flux visual to explain why field-through-window is stronger language than field strength alone.",
    A3_L2: "Use the induction visual to explain why steady flux does not keep producing emf.",
    A3_L3: "Use the coil visual to explain why more turns can increase the induced effect without strengthening the field.",
    A3_L4: "Use the Lenz visual to explain why the induced response opposes the change in flux rather than the field in a blanket way.",
    A3_L5: "Use the waveform visual to explain why AC is not just small DC.",
    A3_L6: "Use the RMS visual to explain why the ordinary average over a full sine-wave cycle is not the right heating comparison.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the Thread-Window visual to explain the key lesson idea in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
