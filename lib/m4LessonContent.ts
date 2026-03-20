"use client";

type UnknownRecord = Record<string, unknown>;

export type M4QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M4SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M4_VISUAL_META: Record<string, M4QuestionVisualMeta> = {
  M4L1: {
    image_url: "/lesson-media/m4/m4-l1-patch-load.svg",
    visual_title: "Patch load in solids",
    visual_caption: "The same push can feel very different to the floor once the push is crowded onto fewer patches.",
    visual_callouts: [
      "Pressure is push per patch, not just total push.",
      "Smaller contact area raises patch load.",
      "Wider footprints protect fragile patches.",
    ],
  },
  M4L2: {
    image_url: "/lesson-media/m4/m4-l2-footprint-rescue.svg",
    visual_title: "Footprint rescue design",
    visual_caption: "Pressure design works backward from a safe patch-load limit to a required footprint.",
    visual_callouts: [
      "A pressure limit defines safe and unsafe designs.",
      "Minimum area answers still belong to pressure physics.",
      "Rearranging the equation preserves the same relationship.",
    ],
  },
  M4L3: {
    image_url: "/lesson-media/m4/m4-l3-liquid-stack.svg",
    visual_title: "Liquid stack and depth load",
    visual_caption: "Deeper patches carry more liquid layers above, so pressure grows with the layer stack.",
    visual_callouts: [
      "Depth, density, and World Pull all matter.",
      "A denser liquid gives heavier layers at the same depth.",
      "Tank width is not one of the hydrostatic factors.",
    ],
  },
  M4L4: {
    image_url: "/lesson-media/m4/m4-l4-same-level.svg",
    visual_title: "Same level, same liquid, same pressure",
    visual_caption: "The liquid does not care about the vessel outline at a given level in the same resting liquid.",
    visual_callouts: [
      "Equal depth in the same liquid gives equal pressure.",
      "Shape changes the outline, not the local patch load.",
      "Changing the liquid or the depth breaks the equality.",
    ],
  },
  M4L5: {
    image_url: "/lesson-media/m4/m4-l5-surface-normal.svg",
    visual_title: "Pressure at a point and force on a patch",
    visual_caption: "Pressure belongs to the location, while the force due to pressure turns to stay perpendicular to the chosen surface.",
    visual_callouts: [
      "Pressure is scalar at the location.",
      "Force on a patch acts normal to the surface.",
      "At fixed pressure, larger area gives larger total force.",
    ],
  },
  M4L6: {
    image_url: "/lesson-media/m4/m4-l6-sky-blanket.svg",
    visual_title: "Sky blanket and total pressure",
    visual_caption: "Air also loads patches, and open-liquid total pressure adds atmospheric pressure to the liquid contribution.",
    visual_callouts: [
      "Lower altitude means more air above and more atmospheric pressure.",
      "Open-surface total pressure is p_atm + rhogh.",
      "Air pressure stays in the same Patch-Dome world as liquid pressure.",
    ],
  },
};

export function m4QuestionVisualMeta(itemId: string): M4QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M4L[1-6])_[A-Z]+\d+$/);
  return match ? M4_VISUAL_META[match[1]] : undefined;
}

const M4_SIMULATION_COPY: Record<string, M4SimulationCopy> = {
  M4_L1: {
    title: "Patch spread explorer",
    instructions: "Keep the total push visible while you change how many floor patches share it, so pressure becomes a crowding story rather than a force-only story.",
    taskPrompt: "Build one narrow-footprint case and one wide-footprint case with the same push. Then explain why the patch load changes even though the total push does not.",
    exploreSteps: [
      "Start with one medium footprint and note the total push and patch load.",
      "Shrink the footprint while holding the push fixed.",
      "Widen the footprint and compare how the patch load falls.",
    ],
    watchFor: [
      "Pressure is push per patch, not total push alone.",
      "The same push can become dangerous if it is crowded onto too few patches.",
      "A wider footprint protects the surface by sharing the push.",
      "Pressure is measured in pascals (Pa), meaning newtons per square metre.",
    ],
    tryFirst: "Try 600 N on 6 patches, then keep 600 N and squeeze it onto 3 patches. The total push is unchanged, but each patch load doubles.",
    takeaway: "Pressure in solids is the crowdedness of a push across area, not the push by itself.",
  },
  M4_L2: {
    title: "Footprint rescue lab",
    instructions: "Treat pressure as a design constraint: start from a safe patch-load limit and work backward to the footprint that keeps the floor safe.",
    taskPrompt: "Create one unsafe design and then redesign it until it just becomes safe. Explain why the limit belongs to pressure rather than force alone.",
    exploreSteps: [
      "Set a safe patch-load limit.",
      "Choose a push that fails with a narrow footprint.",
      "Increase the footprint until the patch load drops under the threshold.",
    ],
    watchFor: [
      "Pressure limits create safe and unsafe regions.",
      "Minimum area is a pressure answer, not just a geometry answer.",
      "Rearranging the formula still preserves the same patch-load story.",
    ],
    tryFirst: "Set a 3000 Pa limit and a 900 N push. The design becomes safe once the footprint reaches 0.30 m^2.",
    takeaway: "Pressure design is backward planning from a patch-load limit to the footprint or force that is allowed.",
  },
  M4_L3: {
    title: "Liquid stack explorer",
    instructions: "Change depth, liquid density, and World Pull separately so hydrostatic pressure becomes a layer-stack story rather than a container-shape story.",
    taskPrompt: "Build one deeper-patch comparison and one denser-liquid comparison. Then explain both using the idea of heavier or taller liquid stacks above the patch.",
    exploreSteps: [
      "Keep the liquid fixed and move the patch deeper.",
      "Reset depth, then switch to a denser liquid.",
      "Change World Pull last so the third factor stays visible too.",
    ],
    watchFor: [
      "Deeper patches carry more layers above them.",
      "Denser liquids make each layer heavier.",
      "Tank width does not decide pressure at a location.",
    ],
    tryFirst: "Use water at 4 m depth with g = 10 N/kg. That gives 40000 Pa. Then keep the depth and switch to a denser liquid to see the pressure rise again.",
    takeaway: "Liquid pressure grows with depth because the patch is carrying a taller or heavier layer stack above it.",
  },
  M4_L4: {
    title: "Same-level showdown",
    instructions: "Compare equal-depth patches in different vessel shapes so the same-level rule becomes stronger than the container-shape intuition.",
    taskPrompt: "Choose one marked depth in two different vessels and prove that the pressure matches. Then break the same-depth condition and explain why the match fails.",
    exploreSteps: [
      "Mark one depth in both vessels with the same liquid.",
      "Change only the vessel shape and keep the depth marker fixed.",
      "Move one patch deeper to show what really changes pressure.",
    ],
    watchFor: [
      "Same liquid plus same depth gives the same patch load.",
      "Shape changes the outline, not the local pressure.",
      "The rule fails only when depth or liquid changes.",
    ],
    tryFirst: "Keep both patches 2 m below the water surface in a narrow and a wide vessel. The patch meters match even though the vessels do not.",
    takeaway: "Same level, same liquid, same patch load is the cleanest way to defeat the shape misconception.",
  },
  M4_L5: {
    title: "Surface patch explorer",
    instructions: "Hold the pressure value fixed at one fluid location while you rotate the patch and change its area, so pressure and force stop collapsing into one idea.",
    taskPrompt: "Place a wall patch, floor patch, and slanted patch at the same depth. Then compare the force directions and the total forces for different patch areas.",
    exploreSteps: [
      "Use one depth to fix the pressure value at the location.",
      "Rotate the patch to watch the force direction turn normal to the surface.",
      "Change patch area to compare total force at the same pressure.",
    ],
    watchFor: [
      "Pressure stays with the location.",
      "Force due to pressure stays perpendicular to the chosen patch.",
      "At fixed pressure, larger patch area gives larger total force.",
    ],
    tryFirst: "Fix the location at 12000 Pa, then compare a 0.20 m^2 wall patch and a 0.40 m^2 slanted patch. The pressure stays the same, but the larger patch feels twice the force.",
    takeaway: "Pressure is scalar at the point; force from pressure depends on the chosen surface and its area.",
  },
  M4_L6: {
    title: "Sky blanket explorer",
    instructions: "Treat air as another fluid and combine it with liquid pressure so open-surface total pressure becomes one Patch-Dome accounting story.",
    taskPrompt: "Compare a low station and a high station, then add liquid depth under an open surface. Explain the total patch load as sky blanket plus liquid stack.",
    exploreSteps: [
      "Move from a low station to a high station and compare atmospheric pressure.",
      "Add a liquid depth below an open surface.",
      "Combine the atmospheric and liquid contributions into one total pressure.",
    ],
    watchFor: [
      "Lower altitude means more air above and more atmospheric pressure.",
      "rhogh is the liquid contribution only.",
      "Open-surface total pressure is atmosphere plus liquid stack.",
    ],
    tryFirst: "Start at 100000 Pa atmospheric pressure and add 3 m of water. The liquid adds 30000 Pa, so the total becomes 130000 Pa.",
    takeaway: "Air also loads patches, so open-liquid pressure is the sum of the sky blanket and the liquid stack.",
  },
};

export function m4SimulationCopy(code: string): M4SimulationCopy | undefined {
  return M4_SIMULATION_COPY[code];
}

export function m4ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M4_L1":
      return [
        "Pressure is about how concentrated the push is, not just how large the push is.",
        "Changing area can change pressure even when force does not change.",
        "The same push on fewer patches means more load on each patch.",
        "Pressure is measured in pascals (Pa), which are equivalent to N/m^2.",
      ];
    case "M4_L2":
      return [
        "Safe design often starts from a pressure limit, not from force alone.",
        "A minimum area answer still belongs to pressure because the goal is safe patch load.",
        "Rearranging the formula does not change the physical relationship.",
      ];
    case "M4_L3":
      return [
        "Liquid pressure depends on depth, density, and World Pull together.",
        "A deeper patch carries more liquid stack above it.",
        "Heavier liquid layers create greater pressure at the same depth.",
      ];
    case "M4_L4":
      return [
        "Same level in the same resting liquid means the same patch load.",
        "Container shape is not part of the hydrostatic rule at one point.",
        "The same-level rule fails when depth or liquid changes.",
      ];
    case "M4_L5":
      return [
        "Pressure belongs to the location in the fluid.",
        "Force due to pressure acts perpendicular to the chosen surface.",
        "Area changes total force without changing the pressure value at that point.",
      ];
    case "M4_L6":
      return [
        "Atmospheric pressure comes from the weight of the air above.",
        "Open-surface total pressure adds atmospheric pressure to rhogh.",
        "Altitude changes the sky blanket while depth changes the liquid stack.",
      ];
    default:
      return [];
  }
}

export function m4ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M4_L1":
      return [
        "Pressure in solids is push divided by area.",
        "The pressure unit is the pascal (Pa), which means one newton per square metre.",
        "The same force can give different pressure if the contact area changes.",
        "Smaller contact area raises pressure by crowding the push onto fewer patches.",
      ];
    case "M4_L2":
      return [
        "Pressure design works backward from a safe limit.",
        "Use A = F / P when the footprint is the unknown.",
        "Use F = PA when the safe force is the unknown.",
      ];
    case "M4_L3":
      return [
        "Liquid pressure increases with depth.",
        "Liquid pressure also depends on density and g.",
        "Use p = rhogh for a resting liquid of roughly constant density.",
      ];
    case "M4_L4":
      return [
        "Same liquid and same depth give the same pressure.",
        "Vessel shape does not change pressure at one depth.",
        "Pressure at a point is a location rule, not a whole-container rule.",
      ];
    case "M4_L5":
      return [
        "Pressure at a point in a fluid is scalar.",
        "Force due to pressure acts perpendicular to the surface.",
        "Use F = pA to link point pressure to force on a chosen patch.",
      ];
    case "M4_L6":
      return [
        "Atmospheric pressure comes from the weight of the air above.",
        "Atmospheric pressure decreases with altitude.",
        "Below an open liquid surface, total pressure is p_atm + rhogh.",
      ];
    default:
      return [];
  }
}

export function m4ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M4_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];

  switch (code) {
    case "M4_L1":
      return [
        {
          kind: "visual",
          title: "Patch load on the floor",
          caption: "See the same push spread across different footprints before you calculate.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    case "M4_L2":
      return [
        {
          kind: "visual",
          title: "Safety-limit design board",
          caption: "A pressure limit turns area into a design choice rather than an afterthought.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    case "M4_L3":
      return [
        {
          kind: "visual",
          title: "Liquid stack picture",
          caption: "Keep the taller or heavier liquid stack visible while you compare depths and densities.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    case "M4_L4":
      return [
        {
          kind: "visual",
          title: "Equal-level challenge",
          caption: "Use one depth line across weird vessel shapes so the same-level rule wins over the container outline.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    case "M4_L5":
      return [
        {
          kind: "visual",
          title: "Patch orientation compass",
          caption: "Pressure stays at the location while the force on the patch turns with the surface.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    case "M4_L6":
      return [
        {
          kind: "visual",
          title: "Sky blanket pressure board",
          caption: "Keep atmospheric pressure and liquid pressure in one account instead of treating them as separate worlds.",
          image_url: visual.image_url,
          highlights: visual.visual_callouts,
        },
      ];
    default:
      return [];
  }
}

export function m4ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M4_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the main pressure relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}

export function m4SupplementalScaffoldSections(code: string): UnknownRecord[] {
  switch (code) {
    case "M4_L1":
      return [
        {
          heading: "Pressure units",
          body: "Pressure is measured in pascals (Pa). One pascal means one newton of force spread over one square metre, so Pa and N/m^2 describe the same pressure unit relationship.",
          check_for_understanding: "What does 1 Pa mean in force-and-area language?",
        },
      ];
    default:
      return [];
  }
}
