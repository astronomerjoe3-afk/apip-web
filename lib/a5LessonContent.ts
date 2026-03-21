"use client";

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

const A5_ASSET_BASE = "/lesson_assets/A5";

const A5_VISUAL_META: Record<string, A5QuestionVisualMeta> = {
  A5L1: {
    image_url: `${A5_ASSET_BASE}/A5_L1/diagrams/a5-l1-release-gate.svg`,
    visual_title: "Threshold beats brightness at the release gate",
    visual_caption: "The release-gate visual keeps packet grade, unlock toll, and beam count on one board so threshold stays a per-photon rule.",
    visual_callouts: [
      "A low-grade bright beam can still fail.",
      "Crossing threshold starts emission immediately.",
      "Intensity changes count, not photon energy.",
    ],
  },
  A5L2: {
    image_url: `${A5_ASSET_BASE}/A5_L2/diagrams/a5-l2-packet-kick.svg`,
    visual_title: "Pay the work-function toll, then keep the kick",
    visual_caption: "The energy-budget visual makes the photoelectric equation read like bookkeeping rather than symbol juggling.",
    visual_callouts: [
      "Photon energy splits into work function plus Kmax.",
      "Threshold means zero leftover kick.",
      "Frequency shifts Kmax; intensity mostly changes event count.",
    ],
  },
  A5L3: {
    image_url: `${A5_ASSET_BASE}/A5_L3/diagrams/a5-l3-hit-pattern.svg`,
    visual_title: "Hit dots build the pattern map",
    visual_caption: "The duality visual separates single localized detections from the accumulated wave-like distribution.",
    visual_callouts: [
      "One event gives one dot.",
      "Many dots build the pattern map.",
      "Matter joins the story through lambda = h/p.",
    ],
  },
  A5L4: {
    image_url: `${A5_ASSET_BASE}/A5_L4/diagrams/a5-l4-core-bundle.svg`,
    visual_title: "Tighter core bundles release binding credit",
    visual_caption: "The nuclear visual compares before-and-after bundles so binding change, mass defect, and released energy stay linked.",
    visual_callouts: [
      "Tighter final bundles can be lower in energy.",
      "Mass defect is energy bookkeeping, not disappearance without explanation.",
      "Nuclear energy is not just enlarged chemistry.",
    ],
  },
  A5L5: {
    image_url: `${A5_ASSET_BASE}/A5_L5/diagrams/a5-l5-light-clock.svg`,
    visual_title: "A moving pulse clock stretches its tick",
    visual_caption: "The light-clock visual keeps invariant c and the longer diagonal light path on the same frame board.",
    visual_callouts: [
      "The signal cap c stays fixed in every inertial frame.",
      "A longer path with the same c means a longer tick interval.",
      "Time dilation is a frame effect, not clock damage.",
    ],
  },
  A5L6: {
    image_url: `${A5_ASSET_BASE}/A5_L6/diagrams/a5-l6-frame-slip.svg`,
    visual_title: "Frame maps disagree on span and same-now",
    visual_caption: "The relativity map visual keeps proper length, contracted length, and simultaneity shift on one comparison board.",
    visual_callouts: [
      "Proper length belongs to the rest frame.",
      "Contraction is along the direction of motion.",
      "Simultaneity is not universal when c stays invariant.",
    ],
  },
};

export function a5QuestionVisualMeta(itemId: string): A5QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A5L[1-6])_[A-Z]+\d+$/);
  return match ? A5_VISUAL_META[match[1]] : undefined;
}

const A5_SIMULATION_COPY: Record<string, A5SimulationCopy> = {
  A5_L1: {
    title: "Release gate lab",
    instructions: "Separate packet grade from beam count so threshold stays a one-photon rule instead of sliding back into a brightness story.",
    taskPrompt: "Test low-grade bright light and high-grade dim light, then explain why only one can beat the release gate.",
    exploreSteps: ["Start below threshold.", "Double the beam count and compare.", "Raise the packet grade just above threshold."],
    watchFor: ["Threshold depends on photon energy.", "Intensity changes event count, not per-event energy.", "Emission starts immediately above threshold."],
    tryFirst: "Keep the beam bright but below threshold first, then raise only the packet grade. The sudden change should come from frequency, not from time spent shining the beam.",
    takeaway: "The photoelectric gate is beaten by one photon at a time, so frequency controls success and intensity controls crowd size.",
  },
  A5_L2: {
    title: "Packet kick lab",
    instructions: "Track where the incoming packet energy goes so hf = phi + Kmax reads like a two-part budget.",
    taskPrompt: "Change photon energy and work function, then explain what happens to the leftover kick.",
    exploreSteps: ["Set the threshold case.", "Raise the packet grade above threshold.", "Double beam count and compare Kmax."],
    watchFor: ["Threshold gives zero leftover kick.", "Frequency changes Kmax.", "Intensity mostly changes event count."],
    tryFirst: "Start just at threshold so the bonus kick is zero, then nudge the packet grade higher and watch the leftover energy appear immediately.",
    takeaway: "The work-function toll is paid first, and any remaining photon energy becomes the maximum photoelectron kinetic energy.",
  },
  A5_L3: {
    title: "Pattern map lab",
    instructions: "Keep localized hit dots and the built-up distribution on one board so duality stays evidential and concrete.",
    taskPrompt: "Send one particle at a time, build the final distribution, and explain how momentum changes the pattern scale.",
    exploreSteps: ["Run a few particles first.", "Build a large hit set.", "Increase momentum and compare the spacing scale."],
    watchFor: ["One event gives one dot.", "Many dots reveal a pattern.", "Higher momentum means shorter de Broglie wavelength."],
    tryFirst: "Pause after only a handful of hits so the board looks random, then continue to a larger sample until the structured pattern becomes undeniable.",
    takeaway: "Modern particles land as dots, but the statistics of many dots reveal a wave-like pattern map.",
  },
  A5_L4: {
    title: "Core bundle lab",
    instructions: "Compare before-and-after nuclei so binding energy, mass defect, and released energy stay one story.",
    taskPrompt: "Choose the tighter final bundle, then explain how the linked mass stamp and energy release change.",
    exploreSteps: ["Compare loose and tight bundles.", "Read the mass stamps before and after.", "Translate the mass difference into energy language."],
    watchFor: ["Tighter final bundles can be lower in energy.", "Mass defect tracks the energy change.", "The mechanism is nuclear, not chemical."],
    tryFirst: "Start with a small binding improvement so the energy release is modest, then make the final bundle tighter and compare how the released credit grows.",
    takeaway: "Nuclear energy comes from binding-energy change inside the nucleus, with mass defect providing the bookkeeping link.",
  },
  A5_L5: {
    title: "Pulse clock lab",
    instructions: "Use the moving light clock to keep invariant c and time dilation tied to one geometric argument.",
    taskPrompt: "Raise the relative speed between frame pods and explain why the moving pulse clock stretches its tick.",
    exploreSteps: ["Start with zero relative speed.", "Increase the frame speed.", "Compare proper time with the outside-frame tick interval."],
    watchFor: ["The signal cap c stays fixed.", "The outside observer sees a longer light path.", "Longer path with the same c means longer tick time."],
    tryFirst: "Set the pods at rest first so both clocks agree, then raise the speed and focus on how the longer diagonal light path forces the tick stretch.",
    takeaway: "Time dilation is the timing consequence of keeping the speed of light invariant in all inertial frames.",
  },
  A5_L6: {
    title: "Frame map lab",
    instructions: "Compare rods, event markers, and clocks together so contraction and simultaneity stay part of the same relativity rulebook.",
    taskPrompt: "Change frame speed, compare proper and contracted length, and decide whether two separated events stay simultaneous.",
    exploreSteps: ["Set a rest-frame rod length.", "Increase relative speed and read the contracted span.", "Place two separated events and compare simultaneity judgments."],
    watchFor: ["Proper length belongs to the rest frame.", "Only the motion-aligned span contracts in this treatment.", "Different frames can disagree about same-now."],
    tryFirst: "Start with matching frames, then increase the speed until the rod shortens and the event markers no longer line up as simultaneous in both pods.",
    takeaway: "Once c stays fixed, time, length, and simultaneity all become frame-dependent together.",
  },
};

export function a5SimulationCopy(code: string): A5SimulationCopy | undefined {
  return A5_SIMULATION_COPY[code];
}

export function a5ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A5_L1":
      return ["Treat threshold as per-photon, not cumulative.", "Keep frequency and intensity doing different jobs.", "Protect the immediate-emission clue."];
    case "A5_L2":
      return ["Read hf = phi + Kmax as bookkeeping.", "Use threshold as the zero-leftover case.", "Keep Kmax separate from beam count."];
    case "A5_L3":
      return ["Separate one-hit evidence from many-hit evidence.", "Keep localized detection and pattern map together.", "Use lambda = h/p to link motion and pattern scale."];
    case "A5_L4":
      return ["Keep nuclear binding distinct from chemistry.", "Read mass defect as bookkeeping, not disappearance.", "Use tighter final bundles as the release direction."];
    case "A5_L5":
      return ["Start from invariant c.", "Use the light clock as the time argument.", "Treat time dilation as frame geometry, not device failure."];
    case "A5_L6":
      return ["Keep proper length and contracted length separate.", "Contraction is along the direction of motion.", "Same-now judgments are frame-dependent."];
    default:
      return [];
  }
}

export function a5ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A5_L1":
      return ["Photon energy depends on frequency.", "Threshold is set by the work function.", "Intensity changes photon count, not per-photon energy."];
    case "A5_L2":
      return ["Photon energy is shared between work function and Kmax.", "Threshold means Kmax = 0.", "Kmax follows frequency, not brightness alone."];
    case "A5_L3":
      return ["Detection events are localized.", "Many events build a wave-like distribution.", "Matter wavelength follows lambda = h/p."];
    case "A5_L4":
      return ["Nuclear energy comes from binding-energy change.", "Mass defect links mass change and energy change.", "Nuclear energy is not chemical energy scaled up."];
    case "A5_L5":
      return ["c stays invariant across inertial frames.", "A longer light path with the same c means a longer tick interval.", "Proper time belongs to the clock at rest."];
    case "A5_L6":
      return ["Proper length belongs to the rest frame.", "Length contraction is along the motion direction.", "Simultaneity is frame-dependent in special relativity."];
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
    A5_L1: "Use the release-gate visual to explain why low-frequency brightness cannot replace threshold frequency.",
    A5_L2: "Use the packet-budget visual to explain why Kmax is leftover energy after the work-function toll is paid.",
    A5_L3: "Use the hit-pattern visual to explain why modern duality needs both localized detections and wave-like distributions.",
    A5_L4: "Use the core-bundle visual to explain how tighter binding and mass defect tell the same nuclear-energy story.",
    A5_L5: "Use the pulse-clock visual to explain why invariant c forces the moving clock to stretch its tick.",
    A5_L6: "Use the frame-map visual to explain why proper length, contracted length, and same-now judgments cannot all stay absolute.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the Packet-Pattern Frame visual to explain the key lesson idea in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
