"use client";

type UnknownRecord = Record<string, unknown>;

export type A1QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A1SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A1_ASSET_BASE = "/lesson_assets/A1";

const A1_VISUAL_META: Record<string, A1QuestionVisualMeta> = {
  A1L1: {
    image_url: `${A1_ASSET_BASE}/A1_L1/diagrams/a1_l1_motion_card_diagram.svg`,
    visual_title: "The five-slot motion card only belongs to constant-acceleration stories",
    visual_caption: "Keep start pace, end pace, run span, steady shift, and clock count on one card so SUVAT feels like one bookkeeping system rather than a bag of letters.",
    visual_callouts: [
      "Use the full motion card only when acceleration stays constant.",
      "Each quantity answers a different question about the same motion.",
      "Equation choice should come from the story on the card, not pattern matching.",
    ],
  },
  A1L2: {
    image_url: `${A1_ASSET_BASE}/A1_L2/diagrams/a1_l2_steady_push_diagram.svg`,
    visual_title: "A steady push changes the velocity arrow by the same amount each second",
    visual_caption: "The lane view ties signed acceleration, velocity change, and displacement growth together on one board.",
    visual_callouts: [
      "Constant acceleration means equal velocity changes in equal times.",
      "Negative acceleration is a signed direction statement, not automatically slowing down.",
      "The displacement story and the velocity story must stay linked through time.",
    ],
  },
  A1L3: {
    image_url: `${A1_ASSET_BASE}/A1_L3/diagrams/a1_l3_launch_split_diagram.svg`,
    visual_title: "Projectile motion is one launch built from two independent components",
    visual_caption: "The launch-split visual keeps horizontal and vertical motion separate while time stays common to both.",
    visual_callouts: [
      "Horizontal velocity stays constant when air resistance is neglected.",
      "Vertical motion changes because gravity acts downward throughout the flight.",
      "At the top of the path, vertical velocity can be zero while vertical acceleration is still downward.",
    ],
  },
  A1L4: {
    image_url: `${A1_ASSET_BASE}/A1_L4/diagrams/a1_l4_orbit_ring_diagram.svg`,
    visual_title: "Circular motion needs a constant inward turn even at constant speed",
    visual_caption: "The orbit-ring visual separates speed from velocity change so inward acceleration stays visible.",
    visual_callouts: [
      "Constant speed can still mean changing velocity because direction changes.",
      "Centripetal acceleration always points toward the center.",
      "The required force is inward, not outward.",
    ],
  },
  A1L5: {
    image_url: `${A1_ASSET_BASE}/A1_L5/diagrams/a1_l5_gravity_beacon_diagram.svg`,
    visual_title: "Gravitational fields are radial pull maps that weaken with distance",
    visual_caption: "The beacon map makes field direction and inverse-square weakening visible before force calculations begin.",
    visual_callouts: [
      "Field lines point inward toward the source mass.",
      "Field strength is the pull per kilogram at that location.",
      "The same location gives the same field strength to any test mass.",
    ],
  },
  A1L6: {
    image_url: `${A1_ASSET_BASE}/A1_L6/diagrams/a1_l6_orbit_bridge_diagram.svg`,
    visual_title: "Orbiting is the bridge where gravity becomes the centripetal pull",
    visual_caption: "The bridge board compares required inward acceleration with local gravitational field strength so orbiting is seen as one connected mechanics story.",
    visual_callouts: [
      "Gravity can supply the inward turning needed for orbit.",
      "An orbiting satellite is still accelerating inward at every moment.",
      "Continuous free fall plus tangential speed is stronger language than floating in space.",
    ],
  },
};

export function a1QuestionVisualMeta(itemId: string): A1QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A1L[1-6])_[A-Z]+\d+$/);
  return match ? A1_VISUAL_META[match[1]] : undefined;
}

const A1_SIMULATION_COPY: Record<string, A1SimulationCopy> = {
  A1_L1: {
    title: "Motion card lab",
    instructions: "Use one five-slot motion card and decide whether the story really belongs in the Steady-Push Lane before trusting any SUVAT relation.",
    taskPrompt: "Complete a motion card from partial data, then explain why the five linked quantities belong to one constant-acceleration story rather than five independent symbols.",
    exploreSteps: ["Set a start pace, steady shift, and time.", "Compare the predicted end pace and run span.", "Change the sign of the acceleration and track which quantities reverse or stay positive."],
    watchFor: ["SUVAT works only when acceleration is constant.", "The motion card ties one time interval to one acceleration story.", "Equation choice depends on what the card already tells you."],
    tryFirst: "Start with u = 4 m/s, a = 2 m/s^2, and t = 3 s. The probe finishes at 10 m/s, and the card makes it easier to see which other quantities can be found consistently.",
    takeaway: "The motion card turns SUVAT into one bookkeeping system for constant acceleration instead of a random formula list.",
  },
  A1_L2: {
    title: "Steady-Push lane lab",
    instructions: "Keep the velocity arrow, its steady shift, and the run span visible together so the lane stays a signed-motion story.",
    taskPrompt: "Run the probe through a constant-acceleration lane, then compare how changing steady shift or time alters the end pace and displacement.",
    exploreSteps: ["Start with a positive acceleration.", "Flip the acceleration direction while keeping the same start pace.", "Compare a short run and a long run with the same steady shift."],
    watchFor: ["Equal time intervals give equal velocity changes.", "Displacement can stay positive even while acceleration is negative.", "Signed acceleration must be read relative to a chosen positive direction."],
    tryFirst: "Set u = 12 m/s, a = -3 m/s^2, and t = 2 s. The probe still moves forward, but its velocity arrow shrinks because the steady push points opposite to the motion.",
    takeaway: "A steady push is best understood as a uniform velocity change each second, not just as getting faster or slower.",
  },
  A1_L3: {
    title: "Launch split lab",
    instructions: "Split the launch arrow into horizontal and vertical components and let time be the only bridge between them.",
    taskPrompt: "Launch the probe at different angles and speeds, then explain why projectile motion is two independent one-dimensional problems running together.",
    exploreSteps: ["Set a launch speed and angle.", "Read the horizontal and vertical components at launch.", "Move through the flight and compare the constant horizontal pace with the changing vertical pace."],
    watchFor: ["Horizontal acceleration is zero in the simple model.", "Vertical acceleration remains downward throughout the flight.", "The top of the path is where vertical velocity is zero, not where gravity switches off."],
    tryFirst: "Launch at 20 m/s and 45 degrees. Watch the horizontal component stay fixed while the vertical component falls to zero at the top and then becomes downward.",
    takeaway: "Projectile motion becomes much easier when the diagonal path is treated as one horizontal story and one vertical story sharing the same clock.",
  },
  A1_L4: {
    title: "Orbit Ring lab",
    instructions: "Track the turning of the velocity arrow so circular motion never gets reduced to speed alone.",
    taskPrompt: "Vary radius and speed in a circular path, then explain why constant-speed motion still needs a permanent inward acceleration and force.",
    exploreSteps: ["Start with one radius and speed.", "Increase the speed and compare the inward turning requirement.", "Increase the radius and compare how the same speed changes the required centripetal acceleration."],
    watchFor: ["The velocity direction changes even when speed does not.", "Centripetal acceleration points toward the center.", "There is no extra outward force needed in the simple circular-motion model."],
    tryFirst: "Set v = 8 m/s and r = 4 m. The required inward acceleration is 16 m/s^2, which shows how strongly the velocity arrow has to turn each second.",
    takeaway: "Circular motion is a turning-velocity story, so inward acceleration is always present even at constant speed.",
  },
  A1_L5: {
    title: "Gravity Beacon lab",
    instructions: "Read the pull map as a field first, then use it to interpret force and acceleration at different distances.",
    taskPrompt: "Place the probe at different distances from a mass beacon and explain how field strength, force, and test mass are related without treating gravity as only weight near Earth.",
    exploreSteps: ["Start close to the beacon and read the strong field.", "Move farther away and compare the weakening field.", "Change the probe mass and compare the force reading with the field reading."],
    watchFor: ["Field direction is radial and inward.", "Field strength is force per kilogram.", "A heavier test mass feels more force, but the field at that point has not changed."],
    tryFirst: "Place the probe 2 units from the beacon, then move it to 4 units. The field readout falls sharply, which makes the inverse-square weakening visible before formal calculation.",
    takeaway: "Gravitational fields are pull maps in space, and the map belongs to the source mass rather than to whichever test object happens to enter it.",
  },
  A1_L6: {
    title: "Orbit Bridge lab",
    instructions: "Compare the inward turning requirement from circular motion with the inward gravitational pull from the field until they feel like one story.",
    taskPrompt: "Set an orbital speed and radius, compare the needed centripetal acceleration with the local gravitational field, and explain when gravity can provide the full center pull.",
    exploreSteps: ["Read the required v^2/r for one orbit.", "Read the local gravitational field at the same radius.", "Change speed, radius, or source mass and track whether the bridge still matches."],
    watchFor: ["Orbiting still involves continuous inward acceleration.", "Gravity can be the exact centripetal pull in a simple circular orbit.", "Tangential speed is what prevents direct radial fall."],
    tryFirst: "Start with a setting where required centripetal acceleration and local field strength match exactly. Then change the radius and watch the bridge break unless the other quantities change too.",
    takeaway: "The orbit bridge unifies the whole module: gravity is not a separate chapter but one possible source of the inward turning that circular motion requires.",
  },
};

export function a1SimulationCopy(code: string): A1SimulationCopy | undefined {
  return A1_SIMULATION_COPY[code];
}

export function a1ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A1_L1":
      return ["Use the full motion card before choosing an equation.", "Check that acceleration is constant before trusting SUVAT.", "Keep symbol meaning visible while you solve."];
    case "A1_L2":
      return ["Read acceleration as a signed direction statement.", "Track equal velocity changes across equal times.", "Keep displacement and acceleration from collapsing into one idea."];
    case "A1_L3":
      return ["Split the launch arrow before describing the path.", "Keep horizontal and vertical accelerations separate.", "Use the top of the path to test the zero-velocity versus zero-acceleration distinction."];
    case "A1_L4":
      return ["Treat turning as acceleration.", "Point every centripetal arrow inward.", "Do not invent an outward balancing force."];
    case "A1_L5":
      return ["Read the field map before naming the force.", "Keep force on the object separate from field strength at the location.", "Use distance change to explain inverse-square weakening."];
    case "A1_L6":
      return ["Compare required inward acceleration with available field strength.", "Use free-fall language carefully.", "Keep orbiting tied to gravity, not to force-free floating."];
    default:
      return [];
  }
}

export function a1ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A1_L1":
      return ["SUVAT is a constant-acceleration bookkeeping system.", "The five motion quantities describe one linked event.", "Equation choice should follow the known and unknown card entries."];
    case "A1_L2":
      return ["Constant acceleration means equal velocity changes in equal times.", "Negative acceleration is directional, not automatically slowing.", "Displacement depends on both velocity and acceleration over time."];
    case "A1_L3":
      return ["Projectile motion splits into horizontal and vertical components.", "Horizontal motion has zero acceleration in the simple model.", "Vertical motion always accelerates downward under gravity."];
    case "A1_L4":
      return ["Circular motion needs inward centripetal acceleration.", "Constant speed does not mean zero acceleration.", "The required force points toward the center."];
    case "A1_L5":
      return ["A gravitational field is a pull map around mass.", "Field strength weakens with distance.", "At one location the field strength is the same for any test mass."];
    case "A1_L6":
      return ["Gravity can act as the centripetal force in orbit.", "An orbiting object is still accelerating inward.", "Continuous free fall plus tangential speed explains orbital motion."];
    default:
      return [];
  }
}

export function a1ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A1_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [{ kind: "visual", title: visual.visual_title, caption: visual.visual_caption, image_url: visual.image_url, highlights: visual.visual_callouts }];
}

export function a1ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A1_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A1_L1: "Use the motion-card visual to explain why SUVAT belongs only to one constant-acceleration event.",
    A1_L2: "Use the steady-push visual to explain why negative acceleration is a signed direction statement rather than an automatic slowing-down label.",
    A1_L3: "Use the launch-split visual to explain why the projectile is still accelerating downward at the top of its path.",
    A1_L4: "Use the orbit-ring visual to explain why constant speed can still involve acceleration.",
    A1_L5: "Use the gravity-beacon visual to explain why field strength at one location does not depend on which test mass is placed there.",
    A1_L6: "Use the orbit-bridge visual to explain how gravity can act as the centripetal pull in a simple circular orbit.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the Probe-Field visual to explain the key mechanics relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
