"use client";

type UnknownRecord = Record<string, unknown>;

export type A4QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type A4SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const A4_ASSET_BASE = "/lesson_assets/A4";

const A4_VISUAL_META: Record<string, A4QuestionVisualMeta> = {
  A4L1: {
    image_url: `${A4_ASSET_BASE}/A4_L1/diagrams/a4_l1_vector_equilibrium.svg`,
    visual_title: "Diagonal forces must be resolved before balance is judged",
    visual_caption: "The vector rig keeps full arrows, axis components, and resultant checks on one board so equilibrium is tested by components rather than by visual guesswork.",
    visual_callouts: [
      "A vector has magnitude and direction.",
      "Components must balance on shared axes.",
      "Equilibrium depends on the resultant, not on arrow count alone.",
    ],
  },
  A4L2: {
    image_url: `${A4_ASSET_BASE}/A4_L2/diagrams/a4_l2_kinematics_maps.svg`,
    visual_title: "Position, velocity, and acceleration need separate component stories",
    visual_caption: "The motion map keeps displacement, velocity, and acceleration in separate slots so one blended everyday motion label does not replace the physics.",
    visual_callouts: [
      "Velocity and acceleration are not the same quantity.",
      "Component motion keeps horizontal and vertical stories separate.",
      "A zero change in one direction does not erase change in another.",
    ],
  },
  A4L3: {
    image_url: `${A4_ASSET_BASE}/A4_L3/diagrams/a4_l3_projectile_motion.svg`,
    visual_title: "Projectile motion splits into horizontal and vertical stories sharing one clock",
    visual_caption: "The launch board keeps the two components and the common time on one frame so the parabolic path is explained from the split rather than memorized as one mysterious curve.",
    visual_callouts: [
      "The horizontal component follows uniform motion in the ideal model.",
      "The vertical component changes under gravity.",
      "The two components share the same elapsed time.",
    ],
  },
  A4L4: {
    image_url: `${A4_ASSET_BASE}/A4_L4/diagrams/a4_l4_momentum_collisions.svg`,
    visual_title: "Momentum bookkeeping should be checked before collision shortcuts",
    visual_caption: "The collision ledger keeps before-and-after momentum, impulse, and energy comparison on one board so impact questions stay systematic.",
    visual_callouts: [
      "Momentum is the first safe collision ledger.",
      "Impulse measures momentum change.",
      "Elastic and inelastic outcomes differ in kinetic-energy behavior.",
    ],
  },
  A4L5: {
    image_url: `${A4_ASSET_BASE}/A4_L5/diagrams/a4_l5_circular_motion.svg`,
    visual_title: "Circular motion needs inward acceleration even when speed is constant",
    visual_caption: "The turn board keeps tangential velocity, inward acceleration, and inward resultant force visible together so turning is not mistaken for force-free motion.",
    visual_callouts: [
      "Velocity changes because direction changes continuously.",
      "Centripetal acceleration points inward.",
      "There is no extra outward driving force in the inertial-frame explanation.",
    ],
  },
  A4L6: {
    image_url: `${A4_ASSET_BASE}/A4_L6/diagrams/a4_l6_springs_materials.svg`,
    visual_title: "Materials must be compared with load, geometry, and response together",
    visual_caption: "The response board keeps force, extension, area, and original length visible so stress, strain, and Young modulus are read as normalized ideas rather than force-only facts.",
    visual_callouts: [
      "Hooke's-law response links load to extension in the proportional region.",
      "Stress compares force with area.",
      "Strain compares extension with original length.",
    ],
  },
};

export function a4QuestionVisualMeta(itemId: string): A4QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(A4L[1-6])_[A-Z]+\d+$/);
  return match ? A4_VISUAL_META[match[1]] : undefined;
}

const A4_SIMULATION_COPY: Record<string, A4SimulationCopy> = {
  A4_L1: {
    title: "Vector-rig balance lab",
    instructions: "Keep force arrows, components, and resultant checks on one board so balance is judged from axes, not from appearance.",
    taskPrompt: "Change force size and angle, then explain why diagonal balance problems should be resolved into components before equilibrium is claimed.",
    exploreSteps: [
      "Start with one diagonal force and show its horizontal and vertical parts.",
      "Add balancing forces one axis at a time.",
      "Check the resultant only after both component sums are visible.",
    ],
    watchFor: [
      "Angled arrows can hide unbalanced components.",
      "Equilibrium requires zero resultant on the chosen axes.",
      "Components are safer than picture-only intuition.",
    ],
    tryFirst: "Take one diagonal force and project it onto the axes before you add any new forces. That first move makes the balance logic cleaner.",
    takeaway: "Vector equilibrium is strongest when forces are resolved and compared component by component.",
  },
  A4_L2: {
    title: "Kinematics component-map lab",
    instructions: "Track displacement, velocity, and acceleration separately so motion is described by changing state rather than one blended path label.",
    taskPrompt: "Switch between one-dimensional and two-dimensional views, then explain why horizontal and vertical motion should keep their own velocity and acceleration stories.",
    exploreSteps: [
      "Start with a simple one-dimensional case.",
      "Turn on the component board for two-dimensional motion.",
      "Compare what changes and what stays separate on each axis.",
    ],
    watchFor: [
      "Velocity and acceleration answer different questions.",
      "One component can have zero acceleration while another does not.",
      "Two-dimensional motion becomes clearer when split before recombining.",
    ],
    tryFirst: "Read the horizontal and vertical acceleration entries separately before trying to describe the whole path.",
    takeaway: "Motion analysis improves when displacement, velocity, and acceleration are kept in distinct component stories.",
  },
  A4_L3: {
    title: "Projectile-split lab",
    instructions: "Keep launch speed, launch angle, and the split into components on one board so the path is rebuilt from two linked one-dimensional motions.",
    taskPrompt: "Change launch speed, angle, and gravity, then explain why projectile motion is best solved by separating the horizontal and vertical components.",
    exploreSteps: [
      "Start with the launch and read the horizontal and vertical components.",
      "Watch the vertical component change under gravity while the horizontal part remains uniform.",
      "Recombine the two stories to explain the full path.",
    ],
    watchFor: [
      "The two components share time but not the same acceleration.",
      "Gravity acts vertically throughout the flight.",
      "The path shape comes from recombining the two component stories.",
    ],
    tryFirst: "Split the launch into components before you look at the curve. That prevents the diagonal-path misconception.",
    takeaway: "Projectile motion becomes simpler when the horizontal and vertical stories are solved separately and linked by time.",
  },
  A4_L4: {
    title: "Collision-ledger lab",
    instructions: "Use the before-and-after ledger to compare momentum, impulse, and kinetic-energy change instead of guessing collision type from one outcome.",
    taskPrompt: "Change masses, incoming velocities, and collision mode, then explain why momentum is the safest first check in an impact problem.",
    exploreSteps: [
      "Start with the momentum totals before impact.",
      "Run the collision and compare the after state.",
      "Use the energy comparison only after the momentum ledger is secure.",
    ],
    watchFor: [
      "Momentum conservation is the first ledger for the full system.",
      "Impulse measures the momentum change of one object.",
      "Elastic and inelastic labels come from energy behavior after the momentum check.",
    ],
    tryFirst: "Read the total momentum before and after before you ask whether the collision was elastic or inelastic.",
    takeaway: "Collision reasoning is strongest when momentum bookkeeping comes before energy-style shortcuts.",
  },
  A4_L5: {
    title: "Circular-turning lab",
    instructions: "Keep velocity direction, radius, and inward acceleration on one board so circular motion is read as continuous turning, not as straight-line motion with no force.",
    taskPrompt: "Change speed, radius, and mass, then explain why constant-speed circular motion still needs inward acceleration and inward resultant force.",
    exploreSteps: [
      "Start with a slow wide circle and read the inward acceleration.",
      "Increase speed and compare the new turning need.",
      "Tighten the radius and compare how the inward requirement changes again.",
    ],
    watchFor: [
      "Direction change alone means acceleration is present.",
      "Centripetal acceleration and force point inward.",
      "There is no extra outward agent doing the turning.",
    ],
    tryFirst: "Follow the velocity arrow around the circle before you calculate anything. The turning arrow is the best clue that acceleration is still present.",
    takeaway: "Uniform circular motion still needs inward acceleration because velocity direction changes continuously.",
  },
  A4_L6: {
    title: "Materials-response lab",
    instructions: "Compare springs and stretched materials with load, area, and original length all visible so response is normalized before it is judged.",
    taskPrompt: "Change load, cross-sectional area, and original length, then explain why stress, strain, and Young modulus are stronger than force-only comparisons.",
    exploreSteps: [
      "Start with one spring-style extension example.",
      "Switch to a material sample and compare how the same load behaves with a different area.",
      "Use the normalized quantities to compare stiffness cleanly.",
    ],
    watchFor: [
      "The same force can give different stress in different areas.",
      "Strain compares extension with original length, not with force directly.",
      "Young modulus compares normalized elastic response.",
    ],
    tryFirst: "Apply the same force to two samples with different areas and compare stress before talking about material quality.",
    takeaway: "Materials are best compared with normalized response measures, not force alone.",
  },
};

export function a4SimulationCopy(code: string): A4SimulationCopy | undefined {
  return A4_SIMULATION_COPY[code];
}

export function a4ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "A4_L1":
      return ["Resolve diagonal forces before judging balance.", "Use resultant language, not arrow-count language.", "Keep axis choice visible."];
    case "A4_L2":
      return ["Separate displacement, velocity, and acceleration.", "Split two-dimensional motion into components.", "Do not let one zero component erase the other direction."];
    case "A4_L3":
      return ["Use horizontal and vertical components from the start.", "Keep gravity in the vertical story only in the ideal model.", "Let time link the two components."];
    case "A4_L4":
      return ["Check momentum before energy labels.", "Use impulse as momentum change.", "Keep elastic and inelastic classification for the second step."];
    case "A4_L5":
      return ["Keep tangential velocity and inward acceleration separate.", "Use inward-force language, not outward-force myths.", "Compare speed and radius effects on the turn."];
    case "A4_L6":
      return ["Normalize by area and original length.", "Separate spring stiffness from Young modulus.", "Do not compare material response with force alone."];
    default:
      return [];
  }
}

export function a4ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "A4_L1":
      return ["Vectors must be resolved before diagonal balances are judged cleanly.", "Equilibrium requires zero resultant on the chosen axes.", "Component comparison is safer than visual guesswork."];
    case "A4_L2":
      return ["Velocity, displacement, and acceleration are distinct quantities.", "Two-dimensional motion is safest when split into components.", "A zero acceleration component in one direction does not erase acceleration in another."];
    case "A4_L3":
      return ["Projectile motion is analyzed by splitting the launch velocity into components.", "Horizontal and vertical motion share time but have different acceleration stories.", "Gravity gives the vertical acceleration throughout the flight."];
    case "A4_L4":
      return ["Momentum bookkeeping is the first safe check in collision questions.", "Impulse measures the momentum change during a force-time interaction.", "Kinetic-energy behavior distinguishes elastic from inelastic collisions."];
    case "A4_L5":
      return ["Circular motion has changing velocity because the direction changes.", "That directional change requires inward centripetal acceleration.", "The required resultant force also points inward."];
    case "A4_L6":
      return ["Hooke's-law spring response links force to extension in the proportional region.", "Stress and strain normalize material response for size and area.", "Young modulus compares how hard a material is to stretch elastically."];
    default:
      return [];
  }
}

export function a4ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = A4_VISUAL_META[code.replace("_", "")];
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

export function a4ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = A4_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  const promptByLesson: Record<string, string> = {
    A4_L1: "Use the vector-equilibrium visual to explain why diagonal force problems should be resolved into components before equilibrium is judged.",
    A4_L2: "Use the motion-map visual to explain why displacement, velocity, and acceleration should stay in separate slots.",
    A4_L3: "Use the projectile visual to explain why horizontal and vertical motion share time but not the same acceleration.",
    A4_L4: "Use the collision-ledger visual to explain why momentum should be checked before energy-style shortcuts.",
    A4_L5: "Use the circular-motion visual to explain why constant-speed turning still requires inward acceleration and force.",
    A4_L6: "Use the materials-response visual to explain why stress and strain are stronger comparison tools than force alone.",
  };
  return {
    title: visual.visual_title,
    prompt: promptByLesson[code] || "Use the A4 visual to explain the lesson's key mechanics or materials relationship clearly.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
