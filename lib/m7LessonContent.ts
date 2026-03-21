"use client";

type UnknownRecord = Record<string, unknown>;

export type M7QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M7SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M7_VISUAL_META: Record<string, M7QuestionVisualMeta> = {
  M7L1: {
    image_url: "/lesson-media/m7/m7-l1-travel-pattern.svg",
    visual_title: "The pattern travels while pads pulse locally",
    visual_caption: "Each pad moves only around its own place, but the front pattern still crosses the whole stadium.",
    visual_callouts: [
      "The front travels across the field.",
      "Each pad only pulses when the front reaches it.",
      "Wave travel is not the same as medium travel.",
    ],
  },
  M7L2: {
    image_url: "/lesson-media/m7/m7-l2-mode-match.svg",
    visual_title: "Cross-Sway versus Push-Squeeze",
    visual_caption: "Wave type comes from comparing local motion with propagation direction.",
    visual_callouts: [
      "Transverse means perpendicular local motion.",
      "Longitudinal means parallel local motion.",
      "Page direction alone is not enough.",
    ],
  },
  M7L3: {
    image_url: "/lesson-media/m7/m7-l3-vflambda.svg",
    visual_title: "Beat Rate, Pulse Gap, and Ripple Run",
    visual_caption: "Wave speed grows from how often matching fronts are launched and how far apart they are.",
    visual_callouts: [
      "Beat Rate is frequency.",
      "Pulse Gap is wavelength.",
      "Ripple Run follows v = f lambda.",
    ],
  },
  M7L4: {
    image_url: "/lesson-media/m7/m7-l4-bounce-wall.svg",
    visual_title: "Bounce Wall reflection",
    visual_caption: "Reflection keeps equal angles to the normal line at a flat boundary.",
    visual_callouts: [
      "Angles are measured from the normal.",
      "Incident angle equals reflected angle.",
      "Head-on hits retrace the path.",
    ],
  },
  M7L5: {
    image_url: "/lesson-media/m7/m7-l5-pace-zone.svg",
    visual_title: "Pace Zone refraction",
    visual_caption: "A new medium changes speed, so the front turns and the wavelength changes while frequency stays fixed.",
    visual_callouts: [
      "The source keeps the frequency fixed.",
      "Speed changes in the new medium.",
      "Wavelength adjusts with the new speed.",
    ],
  },
  M7L6: {
    image_url: "/lesson-media/m7/m7-l6-gate-spread.svg",
    visual_title: "Gate Spread diffraction",
    visual_caption: "Diffraction is strongest when the opening size is comparable to the wavelength.",
    visual_callouts: [
      "Narrow gates spread more strongly.",
      "Very wide gates spread less noticeably.",
      "All waves can diffract.",
    ],
  },
};

export function m7QuestionVisualMeta(itemId: string): M7QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M7L[1-6])_[A-Z]+\d+$/);
  return match ? M7_VISUAL_META[match[1]] : undefined;
}

const M7_SIMULATION_COPY: Record<string, M7SimulationCopy> = {
  M7_L1: {
    title: "Travel pattern lab",
    instructions: "Watch a front cross the stadium while one chosen pad only pulses around its own place.",
    taskPrompt: "Hold the pad size steady, change the front travel, and explain what belongs to the local pad versus what belongs to the traveling pattern.",
    exploreSteps: [
      "Track one selected pad first.",
      "Then track the front crossing distance and time.",
      "Explain why the pad does not travel with the wave.",
    ],
    watchFor: [
      "Local motion and pattern travel are different.",
      "Wavefronts join same-phase points.",
      "Wave speed comes from front distance and time.",
    ],
    tryFirst: "Start with one front crossing 12 m in 3 s while the highlighted pad rises and settles in place. The front speed is 4 m/s, but the pad still stays local.",
    takeaway: "The first wave anchor is that the pattern travels while each point in the medium only pulses locally.",
  },
  M7_L2: {
    title: "Mode match lab",
    instructions: "Switch the same front between Cross-Sway and Push-Squeeze so the wave type comes from a directional comparison.",
    taskPrompt: "Keep the front travel visible, then decide whether the local motion is perpendicular or parallel to it before you name the wave type.",
    exploreSteps: [
      "Start with Cross-Sway Mode.",
      "Switch to Push-Squeeze Mode without changing the travel direction.",
      "Read the angle between local motion and propagation.",
    ],
    watchFor: [
      "Transverse means perpendicular local motion.",
      "Longitudinal means parallel local motion.",
      "Page direction alone is not enough.",
    ],
    tryFirst: "Keep the front moving right. In Cross-Sway Mode the pads move up-down at 90 degrees to travel, so the run is transverse. In Push-Squeeze Mode the pads move along the front direction, so the run is longitudinal.",
    takeaway: "Wave type is a relation between local motion and propagation, not a page-layout label.",
  },
  M7_L3: {
    title: "Beat-Rate and Pulse-Gap lab",
    instructions: "Change frequency and wavelength deliberately so Ripple Run becomes a visible relationship instead of a memorized rule.",
    taskPrompt: "Use one setup to calculate the speed, then build a second setup with a different frequency-wavelength pair that gives the same Ripple Run.",
    exploreSteps: [
      "Set the Beat Rate first.",
      "Change the Pulse Gap second.",
      "Compare how the product changes the speed.",
    ],
    watchFor: [
      "Frequency is set by the source.",
      "Wavelength is the spacing between matching fronts.",
      "v = f lambda links the two to wave speed.",
    ],
    tryFirst: "Set Beat Rate to 4 Hz and Pulse Gap to 3 m. The Ripple Run is 12 m/s. Then try 6 Hz with 2 m and notice the same speed can come from a different pair.",
    takeaway: "Wave speed is built from launch rate and front spacing, not from one quantity alone.",
  },
  M7_L4: {
    title: "Bounce Wall lab",
    instructions: "Send fronts toward a wall and measure both paths from the normal so the reflection rule stays geometric.",
    taskPrompt: "Change the incident angle, draw the normal, and explain why the reflected angle must match it.",
    exploreSteps: [
      "Draw the normal first.",
      "Measure the incident angle to that line.",
      "Compare it with the reflected angle.",
    ],
    watchFor: [
      "Reflection is a boundary bounce.",
      "Incident and reflected angles match.",
      "The normal is the reference line.",
    ],
    tryFirst: "Set an incident angle of 35 degrees to the normal. The reflected angle should also read 35 degrees to the normal, not to the wall surface.",
    takeaway: "Reflection becomes clear when students keep the equal-angle rule tied to the normal line.",
  },
  M7_L5: {
    title: "Pace Zone lab",
    instructions: "Send a front into slower and faster zones so the turn, speed change, and wavelength change stay linked.",
    taskPrompt: "Keep the source frequency fixed, swap the zone speed, and explain how the front bends because the new medium changes Ripple Run.",
    exploreSteps: [
      "Set the source frequency.",
      "Lower or raise the second-zone speed.",
      "Read the new wavelength before explaining the bend.",
    ],
    watchFor: [
      "Frequency stays fixed across the boundary.",
      "Speed changes in the new medium.",
      "Wavelength changes with the new speed.",
    ],
    tryFirst: "Keep frequency at 4 Hz. Start with a 12 m/s first zone and an 8 m/s second zone. The new wavelength becomes 2 m, and the front bends as it enters the slower region.",
    takeaway: "Refraction is a speed-change turn in a new medium, not a weird reflection.",
  },
  M7_L6: {
    title: "Gate Spread lab",
    instructions: "Compare narrow and wide gates against the same wavelength so diffraction becomes a size-comparison story.",
    taskPrompt: "Hold wavelength fixed, change the gate width, and explain why a gate close to one wavelength spreads the front much more strongly.",
    exploreSteps: [
      "Start with a very wide gate.",
      "Shrink the opening toward one wavelength.",
      "Switch on the edge case and compare the hidden-region reach.",
    ],
    watchFor: [
      "Opening size must be compared with wavelength.",
      "Narrower comparable gaps spread more.",
      "Diffraction is a general wave behavior.",
    ],
    tryFirst: "Try a 4 cm wavelength with a 20 cm gate first, then shrink the gate to 4 cm. The second case spreads much more strongly because the opening is now comparable to the wavelength.",
    takeaway: "Diffraction is strongest when the opening size and wavelength are similar.",
  },
};

export function m7SimulationCopy(code: string): M7SimulationCopy | undefined {
  return M7_SIMULATION_COPY[code];
}

export function m7ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M7_L1":
      return [
        "Watch one pad and the front separately before you describe the whole wave.",
        "Keep local oscillation and pattern travel as two different questions.",
        "Use front distance and time when you calculate wave speed.",
      ];
    case "M7_L2":
      return [
        "Name the wave travel direction first, then the local motion direction.",
        "Use perpendicular or parallel language explicitly.",
        "Ignore page layout when it hides the real propagation direction.",
      ];
    case "M7_L3":
      return [
        "Say what each quantity means before substituting into v = f lambda.",
        "Keep source-set frequency separate from medium-set speed.",
        "Use the product idea to compare same-speed, different-pair cases.",
      ];
    case "M7_L4":
      return [
        "Draw the normal before trusting any angle in a reflection diagram.",
        "Measure both incident and reflected angles from the same line.",
        "Separate bounce from speed-change turning.",
      ];
    case "M7_L5":
      return [
        "Ask what the source sets and what the new medium changes.",
        "Read speed and wavelength on each side of the boundary.",
        "Explain the bend from one side of the front entering first.",
      ];
    case "M7_L6":
      return [
        "Compare gate width with wavelength before judging spread.",
        "Use wide-versus-comparable openings as a direct contrast.",
        "Remember that diffraction belongs to all waves, not sound only.",
      ];
    default:
      return [];
  }
}

export function m7ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M7_L1":
      return [
        "A wave is a traveling disturbance pattern.",
        "Each point in the medium responds locally.",
        "Wavefronts join points in the same phase.",
      ];
    case "M7_L2":
      return [
        "Transverse means local motion perpendicular to propagation.",
        "Longitudinal means local motion parallel to propagation.",
        "Wave type comes from comparison, not page direction alone.",
      ];
    case "M7_L3":
      return [
        "Frequency is the number of fronts launched each second.",
        "Wavelength is the spacing between matching fronts.",
        "Wave speed follows v = f lambda.",
      ];
    case "M7_L4":
      return [
        "Reflection is a boundary bounce.",
        "Incident angle equals reflected angle.",
        "Both angles are measured from the normal.",
      ];
    case "M7_L5":
      return [
        "Refraction is turning caused by a speed change in a new medium.",
        "Frequency stays fixed across the boundary.",
        "Wavelength changes when speed changes.",
      ];
    case "M7_L6":
      return [
        "Diffraction is spreading around openings and edges.",
        "Comparable opening size and wavelength give stronger diffraction.",
        "All waves can diffract.",
      ];
    default:
      return [];
  }
}

export function m7ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M7_VISUAL_META[code.replace("_", "")];
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

export function m7ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M7_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key wave idea from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
