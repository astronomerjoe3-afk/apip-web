"use client";

type UnknownRecord = Record<string, unknown>;

export type M8QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

export type M8ScaffoldSectionVisual = {
  image_url: string;
  caption: string;
  highlights: string[];
};

type M8SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M8_L1_ASSET_BASE = "/lesson_assets/M8/M8_L1/diagrams";

const M8_VISUAL_META: Record<string, M8QuestionVisualMeta> = {
  M8L1: {
    image_url: `${M8_L1_ASSET_BASE}/m8-l1-bounce-panel.svg`,
    visual_title: "Bounce Panels use the Guide Line",
    visual_caption: "Mirror reflection is read from the normal, not from the surface, and the plane-mirror image is a ghost position behind the panel.",
    visual_callouts: [
      "Incident and reflected angles match around the Guide Line.",
      "Surface angles must be converted before using the mirror rule.",
      "The mirror image is found by backward extensions, not by real light behind the panel.",
    ],
  },
  M8L2: {
    image_url: "/lesson-media/m8/m8-l2-bend-gate.svg",
    visual_title: "Bend Gates compare fast and slow zones",
    visual_caption: "Refraction changes route direction because light speed changes at a boundary.",
    visual_callouts: [
      "Slower zone means toward the Guide Line.",
      "Faster zone means away from the Guide Line.",
      "A lens bends at entry and exit surfaces, not because the middle pulls rays.",
    ],
  },
  M8L3: {
    image_url: "/lesson-media/m8/m8-l3-gather-lens.svg",
    visual_title: "Gather Lens to a True Meeting Point",
    visual_caption: "A few key routes are enough to predict where real refracted routes meet.",
    visual_callouts: [
      "Parallel route goes through the far Focus Marker.",
      "Center route is treated as undeviated in the thin-lens model.",
      "A True Meeting Point is a real image that actual routes can reach.",
    ],
  },
  M8L4: {
    image_url: "/lesson-media/m8/m8-l4-spread-lens.svg",
    visual_title: "Spread Lens and the Ghost Image",
    visual_caption: "A diverging lens spreads real routes, so dashed backward extensions locate the virtual image.",
    visual_callouts: [
      "Parallel route appears to come from the near focus.",
      "Real routes spread, but extensions still locate the image reliably.",
      "The usual diverging-lens image is virtual, upright, and smaller.",
    ],
  },
  M8L5: {
    image_url: "/lesson-media/m8/m8-l5-lock-bounce.svg",
    visual_title: "Escape Edge and Lock-Bounce",
    visual_caption: "Critical-angle reasoning is strongest when learners see escape, skim, and total internal reflection as one boundary story.",
    visual_callouts: [
      "At the critical angle the refracted route skims the boundary.",
      "Above the critical angle there is no escape, only lock-bounce.",
      "Total internal reflection needs the correct medium direction as well as the angle condition.",
    ],
  },
  M8L6: {
    image_url: "/lesson-media/m8/m8-l6-route-sketch.svg",
    visual_title: "Route Sketches separate line roles",
    visual_caption: "A ray diagram mixes real routes, Guide Lines, and dashed extensions to predict real and virtual images.",
    visual_callouts: [
      "A few selected routes can stand in for the full ray bundle.",
      "Guide Lines are references, not beams.",
      "Ghost Meeting Points come from extensions; True Meeting Points come from actual crossings.",
    ],
  },
};

const M8_SCAFFOLD_SECTION_VISUALS: Record<string, Record<string, M8ScaffoldSectionVisual>> = {
  M8_L1: {
    "How to reason through it": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-equal-angles.svg`,
      caption: "Start from the Guide Line, then compare the incoming and outgoing angles to that same perpendicular reference.",
      highlights: [
        "Incoming and reflected angles match when they are measured to the Guide Line.",
        "The mirror surface is not the angle reference used by the reflection rule.",
        "Once the reference line is fixed, the mirror answer follows calmly.",
      ],
    },
    "Common trap": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-surface-conversion.svg`,
      caption: "A surface angle can be helpful, but it is not the incident angle in the rule until it is converted to the Guide Line.",
      highlights: [
        "Surface angle and Guide Line angle add to 90 deg.",
        "Using the wrong reference line creates the wrong reflected angle.",
        "Convert first, then apply the equal-angle rule.",
      ],
    },
    "Surface angle trap": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-surface-conversion.svg`,
      caption: "The reflection law is normal-first, so a surface reading has to be turned into the angle from the Guide Line before the rule is used.",
      highlights: [
        "20 deg to the surface means 70 deg to the Guide Line.",
        "The useful conversion is surface angle plus Guide Line angle equals 90 deg.",
        "The rule compares incident and reflected angles only after that conversion.",
      ],
    },
    "Ghost image clue": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-ghost-image.svg`,
      caption: "The reflected routes stay in front of the mirror. The image behind the mirror comes from dashed backward extensions, not from real light there.",
      highlights: [
        "Only the backward extensions meet behind the mirror.",
        "Real light travels to the eye in front of the mirror.",
        "That is why the plane-mirror image is virtual.",
      ],
    },
    "Worked example": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-equal-angles.svg`,
      caption: "If the route arrives at 35 deg to the Guide Line, the reflected route also leaves at 35 deg to that same line.",
      highlights: [
        "Read the angle from the Guide Line first.",
        "Apply the equal-angle rule second.",
        "Keep the same reference line in the final answer.",
      ],
    },
    "Worked example 2": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-surface-conversion.svg`,
      caption: "20 deg to the surface becomes 70 deg to the Guide Line because the surface and the Guide Line are perpendicular.",
      highlights: [
        "Start with the given surface angle.",
        "Subtract it from 90 deg to get the normal-based angle.",
        "Only then use the mirror rule.",
      ],
    },
    "Worked example 3": {
      image_url: `${M8_L1_ASSET_BASE}/m8-l1-image-distance.svg`,
      caption: "A plane mirror places the image the same distance behind the mirror as the object is in front of it.",
      highlights: [
        "Object distance and image distance are equal.",
        "The image is behind the mirror, not on the surface.",
        "Dashed extensions help locate the ghost image position.",
      ],
    },
  },
};

export function m8QuestionVisualMeta(itemId: string): M8QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M8L[1-6])_[A-Z]+\d+$/);
  return match ? M8_VISUAL_META[match[1]] : undefined;
}

export function m8ScaffoldSectionVisual(code: string, heading: string): M8ScaffoldSectionVisual | undefined {
  return M8_SCAFFOLD_SECTION_VISUALS[code]?.[heading];
}

const M8_SIMULATION_COPY: Record<string, M8SimulationCopy> = {
  M8_L1: {
    title: "Mirror Match lab",
    instructions: "Keep the Guide Line visible so mirror geometry stays normal-first instead of surface-first.",
    taskPrompt: "Change the incident angle, compare it with the reflected angle, and explain where the plane-mirror image appears without calling the dashed extensions real light.",
    exploreSteps: [
      "Draw or notice the Guide Line first.",
      "Compare the incoming angle and outgoing angle to that same reference line.",
      "Check the ghost image position behind the mirror.",
    ],
    watchFor: [
      "Mirror angles are measured from the Guide Line, not the surface.",
      "A plane-mirror image is a ghost position behind the mirror.",
      "Dashed extensions are geometry tools, not actual beams.",
    ],
    tryFirst: "Set the incident angle to 35 degrees, tilt the panel slightly, and confirm that the reflected angle still matches 35 degrees to the Guide Line. Then move the object farther away and watch the ghost image stay the same distance behind the panel.",
    takeaway: "Mirror questions become much calmer when the learner protects the Guide Line and the status of the dashed image lines.",
  },
  M8_L2: {
    title: "Bend Gate lab",
    instructions: "Compare fast-to-slow and slow-to-fast cases so the bend direction feels caused, not memorized.",
    taskPrompt: "Hold the incident angle steady, switch the boundary from fast-to-slow to slow-to-fast, and explain the turn using speed-change language rather than lens-pull language.",
    exploreSteps: [
      "Start with a fast-to-slow boundary.",
      "Reverse to a slow-to-fast boundary.",
      "Keep checking that the angle is being read from the Guide Line.",
    ],
    watchFor: [
      "Slower zone means toward the Guide Line.",
      "Faster zone means away from the Guide Line.",
      "A lens bends at entry and exit surfaces.",
    ],
    tryFirst: "Use an air-to-glass style case first, then swap it to glass-to-air while keeping the same incident angle. The route first turns toward the Guide Line and then away when the medium direction reverses.",
    takeaway: "Refraction is easier to trust when learners ask what happened to light speed at the boundary before naming the bend.",
  },
  M8_L3: {
    title: "Gather Lens lab",
    instructions: "Use selected routes deliberately so real-image formation feels like geometry instead of a guessing game.",
    taskPrompt: "Trace a parallel route and a center route through a Gather Lens, move the object between the standard F and 2F regions, and explain why the image is a True Meeting Point.",
    exploreSteps: [
      "Start with the object outside the focus.",
      "Trace the parallel route through the far focus.",
      "Compare beyond-2F and between-F-and-2F cases.",
    ],
    watchFor: [
      "A few selected routes can still locate the real image.",
      "The center route is treated as undeviated in the thin-lens model.",
      "A True Meeting Point is where actual routes meet.",
    ],
    tryFirst: "Place the object at 2F, trace the parallel route and the center route, and watch them meet at 2F on the far side. Then push the object beyond 2F and see the image move between F and 2F and shrink.",
    takeaway: "A converging-lens sketch is strongest when the learner sees selected rays as an efficient map to a real crossing.",
  },
  M8_L4: {
    title: "Ghost Finder lab",
    instructions: "Keep the real spread routes and the dashed backward extensions visually separate while you locate the virtual image.",
    taskPrompt: "Use the parallel and center routes for a Spread Lens, then explain why the image is on the object side even though no real routes meet there.",
    exploreSteps: [
      "Trace the real spread routes first.",
      "Add the dashed backward extensions second.",
      "Read the image position between the lens and the near focus.",
    ],
    watchFor: [
      "The parallel route appears to come from the near focus.",
      "The real routes spread, but the extensions still locate the image.",
      "The image is virtual, upright, and smaller.",
    ],
    tryFirst: "Turn the extension overlay off and on while keeping the same object distance. The real routes keep spreading on the far side, but the backward extensions still point to the same ghost image on the object side.",
    takeaway: "Diverging-lens sketches work well when the learner refuses to blur the difference between real routes and dashed construction lines.",
  },
  M8_L5: {
    title: "Escape Edge lab",
    instructions: "Move from escape to skim to lock-bounce so the critical angle becomes a limit, not just a number.",
    taskPrompt: "Increase the incident angle inside the slower medium, compare below/equal/above-critical cases, and explain why total internal reflection needs the correct medium direction as well as the angle threshold.",
    exploreSteps: [
      "Start below the critical angle.",
      "Raise the route to the exact boundary-skimming case.",
      "Push above the limit and watch lock-bounce take over.",
    ],
    watchFor: [
      "The critical angle is the last possible escape.",
      "Above the limit there is no refracted route escaping out.",
      "Lock-Bounce only works when light is trying to leave the slower medium.",
    ],
    tryFirst: "Set the critical angle to 42 degrees, compare 38 degrees, 42 degrees, and 55 degrees, and notice the pattern change from escape to skim to lock-bounce.",
    takeaway: "The critical angle stops feeling arbitrary once learners see the whole escape-limit story at one boundary.",
  },
  M8_L6: {
    title: "Route Sketch lab",
    instructions: "Switch between a real-image case and a ghost-image case so line roles stay explicit in every sketch.",
    taskPrompt: "Label which lines are real routes, which are Guide Lines, and which are dashed extensions, then explain why that separation makes optics sketches more trustworthy.",
    exploreSteps: [
      "Start with a converging-lens real image.",
      "Switch to a mirror or diverging-lens ghost image.",
      "Keep naming the status of each line you point to.",
    ],
    watchFor: [
      "A few selected routes are enough to predict an image.",
      "Guide Lines are references, not beams.",
      "True and Ghost Meeting Points come from different line behaviors.",
    ],
    tryFirst: "Use the real-image mode first and identify the true crossing, then switch to the ghost-image mode and watch the image survive only as backward extensions. The diagram still works, but not every line means the same thing.",
    takeaway: "Ray diagrams get much easier once learners stop asking only where the lines are and start asking what each line is doing.",
  },
};

export function m8SimulationCopy(code: string): M8SimulationCopy | undefined {
  return M8_SIMULATION_COPY[code];
}

export function m8ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M8_L1":
      return ["Draw the Guide Line before trusting any angle.", "Convert surface angles before using the mirror rule.", "Treat dashed image lines as extensions, not beams."];
    case "M8_L2":
      return ["Ask whether the new zone is faster or slower first.", "Keep angle readings tied to the Guide Line.", "Describe a lens as entry-refraction plus exit-refraction."];
    case "M8_L3":
      return ["Start with the parallel route and the center route.", "Use F and 2F anchor cases deliberately.", "Look for a real crossing before naming the image."];
    case "M8_L4":
      return ["Trace real spread routes before drawing the extensions.", "Keep the near focus visible for the parallel-ray rule.", "Label the image as ghost only after checking that no real routes meet."];
    case "M8_L5":
      return ["Check boundary direction before comparing angles.", "Treat the critical angle as the last escape, not just a number.", "Use optical fibers as repeated-lock-bounce evidence."];
    case "M8_L6":
      return ["Name the line role before naming the image.", "Separate Guide Lines, real routes, and dashed extensions.", "Use screenability to distinguish true from ghost meeting points."];
    default:
      return [];
  }
}

export function m8ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M8_L1":
      return ["Mirror angles match around the Guide Line.", "Plane-mirror images are virtual and lie behind the surface.", "The normal is the trusted angle reference."];
    case "M8_L2":
      return ["Refraction is caused by a speed change at a boundary.", "Toward the Guide Line means slower medium.", "Away from the Guide Line means faster medium."];
    case "M8_L3":
      return ["A Gather Lens can produce a True Meeting Point.", "Parallel route goes through the far focus.", "A few selected routes can still locate a real image."];
    case "M8_L4":
      return ["A Spread Lens usually gives a ghost image.", "Parallel route appears to come from the near focus.", "Backward extensions locate the image without being real beams."];
    case "M8_L5":
      return ["The critical angle is the last possible escape.", "Above that limit there is total internal reflection.", "Lock-Bounce needs the correct medium direction as well as the angle condition."];
    case "M8_L6":
      return ["A ray diagram is a smart route map.", "True Meeting Points come from actual crossings.", "Ghost Meeting Points come from apparent extensions."];
    default:
      return [];
  }
}

export function m8ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M8_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [{
    kind: "visual",
    title: visual.visual_title,
    caption: visual.visual_caption,
    image_url: visual.image_url,
    highlights: visual.visual_callouts,
  }];
}

export function m8ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M8_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key light relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
