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
    image_url: `${A3_ASSET_BASE}/A3_L1/diagrams/a3_l1_progressive_superposition.svg`,
    visual_title: "Progressive waves overlap by adding displacement at the same place and time",
    visual_caption: "The overlap board keeps separate wave contributions and the combined trace on one frame so superposition is read as an addition rule rather than alternating turns.",
    visual_callouts: [
      "Progressive waves carry energy as they travel.",
      "Superposition adds displacement algebraically.",
      "Reinforcement and cancellation depend on phase relationship.",
    ],
  },
  A3L2: {
    image_url: `${A3_ASSET_BASE}/A3_L2/diagrams/a3_l2_stationary_waves.svg`,
    visual_title: "Stationary waves are standing patterns built from matched opposite-traveling waves",
    visual_caption: "The standing-wave board keeps nodes, antinodes, and boundary fit on one picture so stationary waves are not mistaken for single waves that stopped moving.",
    visual_callouts: [
      "Nodes remain at zero displacement.",
      "Antinodes are the strongest oscillation points.",
      "Only harmonics that fit the boundary condition survive cleanly.",
    ],
  },
  A3L3: {
    image_url: `${A3_ASSET_BASE}/A3_L3/diagrams/a3_l3_phase_path_interference.svg`,
    visual_title: "Interference depends on path difference and phase difference together",
    visual_caption: "The interference board keeps route difference, phase shift, and fringe outcome on one frame so constructive and destructive cases are read causally.",
    visual_callouts: [
      "Constructive interference comes from the right phase relation.",
      "Destructive interference comes from the opposite phase relation.",
      "Path difference is a geometric route into the phase story.",
    ],
  },
  A3L4: {
    image_url: `${A3_ASSET_BASE}/A3_L4/diagrams/a3_l4_diffraction_gratings.svg`,
    visual_title: "Diffraction gratings turn wavelength into angle-separated order patterns",
    visual_caption: "The grating board keeps slit spacing, order number, and angular spread on one display so pattern geometry stays readable.",
    visual_callouts: [
      "Greater order appears at larger angles when allowed.",
      "Wavelength and grating spacing shape the pattern.",
      "Orders are discrete allowed directions, not a blurred spread.",
    ],
  },
  A3L5: {
    image_url: `${A3_ASSET_BASE}/A3_L5/diagrams/a3_l5_refraction_tir.svg`,
    visual_title: "Refraction, critical angle, and total internal reflection belong to one route story",
    visual_caption: "The route board keeps refracting boundary, critical-angle threshold, and trapped-light behavior on one picture so TIR stays a change-of-medium story.",
    visual_callouts: [
      "Refraction changes direction when wave speed changes.",
      "The critical angle is the last escape case.",
      "Total internal reflection needs the correct direction of travel and enough incident angle.",
    ],
  },
  A3L6: {
    image_url: `${A3_ASSET_BASE}/A3_L6/diagrams/a3_l6_oscilloscope_wave_evidence.svg`,
    visual_title: "Oscilloscope traces are time graphs that reveal wave behavior",
    visual_caption: "The oscilloscope board keeps trace height, cycle spacing, and measured timing on one graph so learners do not confuse a time trace with a path-in-space drawing.",
    visual_callouts: [
      "An oscilloscope trace is plotted against time.",
      "Amplitude and period can be read from the graph.",
      "Wave evidence becomes clearer when trace meaning is read before calculations.",
    ],
  },
};

export function a3QuestionVisualMeta(itemId: string): A3QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A3L[1-6])_[A-Z]+\d+$/);
  return match ? A3_VISUAL_META[match[1]] : undefined;
}

const A3_SIMULATION_COPY: Record<string, A3SimulationCopy> = {
  A3_L1: {
    title: "Superposition lab",
    instructions: "Keep both input waves and the combined displacement on one board so overlap stays an addition rule rather than a handoff story.",
    taskPrompt: "Shift phase and amplitude, then explain why reinforcement and cancellation depend on the contributions at the same place and time.",
    exploreSteps: [
      "Start with two matching waves in phase.",
      "Introduce a phase offset and compare the new sum.",
      "Freeze one instant and read the displacement rule directly.",
    ],
    watchFor: [
      "Displacements add algebraically during overlap.",
      "Waves do not take turns at the overlap point.",
      "Phase controls whether the sum reinforces or cancels.",
    ],
    tryFirst: "Pause the board at one instant and read the individual displacements before looking at the final combined trace.",
    takeaway: "Superposition is the rule that lets overlapping progressive waves share one displacement story.",
  },
  A3_L2: {
    title: "Stationary-wave mode lab",
    instructions: "Use the standing-wave board to compare nodes, antinodes, and allowed harmonics under one boundary condition.",
    taskPrompt: "Change mode number and system length, then explain why stationary waves require matched opposite-traveling waves and allowed boundary fit.",
    exploreSteps: [
      "Start with the fundamental mode and count nodes and antinodes.",
      "Move to a higher harmonic and compare the new pattern.",
      "Change the boundary fit and check whether the mode still survives.",
    ],
    watchFor: [
      "Nodes remain fixed while antinodes oscillate strongly.",
      "Standing patterns require the right wavelength fit.",
      "The pattern is built from two opposite-traveling waves.",
    ],
    tryFirst: "Find the fixed nodes first, then ask what kind of overlap would keep those quiet points locked in place.",
    takeaway: "Stationary waves are standing modes created by boundary-matched superposition.",
  },
  A3_L3: {
    title: "Interference route lab",
    instructions: "Keep path difference and phase difference on one board so fringe outcomes stay causally linked to route geometry.",
    taskPrompt: "Vary route difference and compare the resulting phase relation, then explain why the same path story predicts constructive or destructive interference.",
    exploreSteps: [
      "Start with equal routes and identify the constructive case.",
      "Shift one path until the phase relation flips.",
      "Read the fringe outcome only after the route difference is clear.",
    ],
    watchFor: [
      "Path difference is a route-to-phase bridge.",
      "Constructive and destructive outcomes are predictable from phase relation.",
      "The pattern depends on comparison, not on one path alone.",
    ],
    tryFirst: "Match the two routes first, then disturb one route gradually until the interference outcome changes.",
    takeaway: "Interference is easiest to trust when route difference and phase difference are read as one linked story.",
  },
  A3_L4: {
    title: "Diffraction-grating lab",
    instructions: "Keep wavelength, grating spacing, and order angle together so diffraction patterns are read geometrically.",
    taskPrompt: "Change wavelength and slit spacing, then explain why allowed diffraction orders appear at specific directions rather than everywhere.",
    exploreSteps: [
      "Start with one wavelength and identify the first few visible orders.",
      "Increase the wavelength and compare the angular spread.",
      "Change grating spacing and watch the pattern tighten or widen.",
    ],
    watchFor: [
      "Order angle depends on wavelength and spacing.",
      "Orders are discrete allowed directions.",
      "Higher order does not mean random spread; it means another allowed path condition.",
    ],
    tryFirst: "Compare the same grating with two wavelengths before you try to summarize the order rule.",
    takeaway: "Diffraction gratings convert wavelength information into structured angular patterns.",
  },
  A3_L5: {
    title: "Critical-angle route lab",
    instructions: "Keep refracted, grazing, and trapped routes on one board so total internal reflection is read as a threshold case of refraction.",
    taskPrompt: "Change incident angle and medium pair, then explain how the critical angle marks the last possible escape before total internal reflection begins.",
    exploreSteps: [
      "Start with an angle clearly below critical and read the refracted route.",
      "Raise the angle until the refracted route grazes the boundary.",
      "Push past the threshold and compare the trapped-light case.",
    ],
    watchFor: [
      "Critical angle is the last escape case.",
      "TIR needs travel from the right medium into the lower-index side.",
      "The route story changes because wave speed changes across the boundary.",
    ],
    tryFirst: "Find the grazing-out case before saying 'total internal reflection.' That middle moment defines the threshold.",
    takeaway: "Critical angle and total internal reflection are best understood as one continuous boundary story.",
  },
  A3_L6: {
    title: "Oscilloscope trace lab",
    instructions: "Use the trace board to connect amplitude, period, and frequency on a time graph before applying the reading to wave evidence.",
    taskPrompt: "Change the signal settings, then explain what the oscilloscope is plotting and why the trace should not be mistaken for the wave's route through space.",
    exploreSteps: [
      "Start with one clean periodic trace.",
      "Measure height and cycle spacing on the graph.",
      "Translate the graph reading back into wave behavior in words.",
    ],
    watchFor: [
      "The horizontal axis is time.",
      "Trace height and spacing carry different meanings.",
      "A time trace is one representation of the wave, not the wave path itself.",
    ],
    tryFirst: "Label the two axes before you calculate anything. That one step prevents most oscilloscope misconceptions.",
    takeaway: "Oscilloscope traces become useful wave evidence once the time-graph meaning is kept explicit.",
  },
};

export function a3SimulationCopy(code: string): A3SimulationCopy | undefined {
  return A3_SIMULATION_COPY[code];
}

export function a3ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A3_L1":
      return ["Add displacements at the same place and time.", "Use phase to explain reinforcement or cancellation.", "Do not describe overlap as wave turn-taking."];
    case "A3_L2":
      return ["Keep nodes and antinodes distinct.", "Use opposite-traveling-wave language for standing patterns.", "Check boundary fit before naming a harmonic."];
    case "A3_L3":
      return ["Treat path difference as a route into phase difference.", "Compare both paths before reading the fringe result.", "Keep constructive and destructive language causal."];
    case "A3_L4":
      return ["Keep wavelength and grating spacing on the same board.", "Read orders as allowed directions.", "Do not flatten the pattern into a vague spread."];
    case "A3_L5":
      return ["Keep refraction and TIR in one threshold story.", "Use critical angle as the last escape case.", "Check the direction of travel between media."];
    case "A3_L6":
      return ["Read the oscilloscope as a time graph.", "Separate trace meaning from wave path.", "Use period and amplitude from the graph rather than guesswork."];
    default:
      return [];
  }
}

export function a3ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A3_L1":
      return ["Progressive waves travel while carrying energy.", "When waves overlap, displacements add by superposition.", "Reinforcement and cancellation depend on phase."];
    case "A3_L2":
      return ["Stationary waves are formed by matched opposite-traveling waves.", "Nodes stay fixed at zero displacement.", "Only certain harmonics fit the boundary conditions."];
    case "A3_L3":
      return ["Interference outcomes depend on path and phase difference together.", "Constructive interference comes from the right phase relation.", "Destructive interference comes from the opposite phase relation."];
    case "A3_L4":
      return ["Diffraction gratings produce discrete orders.", "Wavelength and grating spacing shape the pattern.", "Pattern geometry matters more than memorizing order names alone."];
    case "A3_L5":
      return ["Refraction changes direction because wave speed changes.", "The critical angle marks the last possible escape route.", "Total internal reflection needs the correct boundary direction and sufficient angle."];
    case "A3_L6":
      return ["Oscilloscope traces are graphs against time.", "Amplitude and period can be read from the trace.", "Wave evidence becomes clearer when the graph meaning is read before calculations."];
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
    A3_L1: "Use the superposition visual to explain why overlapping progressive waves should be added at the same place and time.",
    A3_L2: "Use the stationary-wave visual to explain how nodes and antinodes emerge from matched opposite-traveling waves.",
    A3_L3: "Use the interference visual to explain why path difference can predict constructive or destructive outcomes.",
    A3_L4: "Use the diffraction-grating visual to explain how wavelength becomes an angular pattern.",
    A3_L5: "Use the refraction-TIR visual to explain why the critical angle is the last escape case before total internal reflection.",
    A3_L6: "Use the oscilloscope visual to explain why the trace is a time graph and not the wave path itself.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the A3 visual to explain the lesson's key advanced-wave relationship clearly.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
