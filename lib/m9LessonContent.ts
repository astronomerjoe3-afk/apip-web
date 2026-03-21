"use client";

type UnknownRecord = Record<string, unknown>;

export type M9QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type M9SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const M9_ASSET_BASE = "/lesson_assets/M9";

const M9_VISUAL_META: Record<string, M9QuestionVisualMeta> = {
  M9L1: {
    image_url: `${M9_ASSET_BASE}/M9_L1/diagrams/m9-l1-beacon-launch.svg`,
    visual_title: "A vibrating beacon launches sound",
    visual_caption: "The source must vibrate first, and the nearby air begins the squeeze-release relay.",
    visual_callouts: [
      "No vibration means no new sound launch.",
      "The source sets the sound frequency.",
      "Nearby air is disturbed; it is not fired across the room.",
    ],
  },
  M9L2: {
    image_url: `${M9_ASSET_BASE}/M9_L2/diagrams/m9-l2-crowd-relay.svg`,
    visual_title: "Compressions and rarefactions relay the message",
    visual_caption: "Sound in air is a longitudinal pressure pattern of crowded and spread regions.",
    visual_callouts: [
      "Squeeze Bands are compressions.",
      "Release Bands are rarefactions.",
      "Particles move locally while the pattern travels onward.",
    ],
  },
  M9L3: {
    image_url: `${M9_ASSET_BASE}/M9_L3/diagrams/m9-l3-pitch-meter.svg`,
    visual_title: "Ping Rate sets Tone Height",
    visual_caption: "Frequency controls pitch, while loudness is a separate sound-strength idea.",
    visual_callouts: [
      "Higher frequency means higher pitch.",
      "Pitch and loudness are not the same quantity.",
      "In the same medium, frequency changes wavelength more directly than sound speed.",
    ],
  },
  M9L4: {
    image_url: `${M9_ASSET_BASE}/M9_L4/diagrams/m9-l4-hear-zone.svg`,
    visual_title: "Hear Zone versus Super-Scout Mode",
    visual_caption: "Ultrasound is still sound; it just sits above the usual human hearing range.",
    visual_callouts: [
      "Most human hearing sits around 20 Hz to 20 kHz.",
      "Above 20 kHz is ultrasound.",
      "Ultrasound can still reflect from boundaries because it is still sound.",
    ],
  },
  M9L5: {
    image_url: `${M9_ASSET_BASE}/M9_L5/diagrams/m9-l5-echo-map.svg`,
    visual_title: "Echo returns place hidden boundaries",
    visual_caption: "Pulse-echo scanning turns return time into depth and many returns into a map.",
    visual_callouts: [
      "Longer return time usually means greater depth.",
      "The divide-by-two step comes from the round trip.",
      "Many echoes are needed to build an image.",
    ],
  },
  M9L6: {
    image_url: `${M9_ASSET_BASE}/M9_L6/diagrams/m9-l6-flow-tracker.svg`,
    visual_title: "Doppler shifts reveal flow",
    visual_caption: "A higher or lower returned frequency can show motion toward or away from the probe.",
    visual_callouts: [
      "Toward the probe means a higher return frequency.",
      "Away from the probe means a lower return frequency.",
      "Doppler extends ultrasound into flow tracking.",
    ],
  },
};

export function m9QuestionVisualMeta(itemId: string): M9QuestionVisualMeta | undefined {
  const match = itemId.toUpperCase().match(/^(M9L[1-6])_[A-Z]+\d+$/);
  return match ? M9_VISUAL_META[match[1]] : undefined;
}

const M9_SIMULATION_COPY: Record<string, M9SimulationCopy> = {
  M9_L1: {
    title: "Wake the Beacon lab",
    instructions: "Start with the source and keep asking what is vibrating before you describe anything else.",
    taskPrompt: "Change the beacon vibration rate, pause the source, and explain why the sound frequency follows the source while the medium does the relaying.",
    exploreSteps: [
      "Turn the beacon on and off deliberately.",
      "Raise the vibration rate without changing the medium story.",
      "Name the source job before the medium job.",
    ],
    watchFor: [
      "No vibration means no new sound wave launch.",
      "The source frequency becomes the sound frequency.",
      "The wave is not a packet of air fired across the room.",
    ],
    tryFirst: "Start with a quiet beacon, then switch it on at 300 vibrations per second. The sound frequency becomes 300 Hz because the source launch rate sets the wave rate.",
    takeaway: "Sound production stays clear when students anchor every case to a vibrating source first.",
  },
  M9_L2: {
    title: "Crowd Relay lab",
    instructions: "Track one particle and one pressure band at the same time so local motion does not get confused with wave travel.",
    taskPrompt: "Watch compressions and rarefactions move through the crowd, then explain why the particles oscillate locally even though the pattern travels onward.",
    exploreSteps: [
      "Highlight one particle first.",
      "Label a Squeeze Band and a Release Band second.",
      "Compare local motion with propagation direction.",
    ],
    watchFor: [
      "Sound in air is longitudinal.",
      "Compressions are crowded regions and rarefactions are spread-out regions.",
      "The pattern travels; the medium does not march across the room.",
    ],
    tryFirst: "Keep the wave moving right and watch one highlighted particle shuffle left-right around its own place. The crowd relays the disturbance, but that particle does not travel across the whole arena.",
    takeaway: "The sound-wave picture becomes much stronger when pattern travel and particle motion are kept separate.",
  },
  M9_L3: {
    title: "Pitch Match lab",
    instructions: "Use one tone meter for pitch and a separate bar for loudness so those ideas stay uncoupled.",
    taskPrompt: "Raise and lower the ping rate while holding loudness steady, then explain why pitch changes with frequency and why the same-air sound speed does not need to change.",
    exploreSteps: [
      "Set a target tone height first.",
      "Hold loudness fixed while changing frequency.",
      "Read the wavelength change in the same medium.",
    ],
    watchFor: [
      "Pitch follows frequency.",
      "Loudness is a separate sound-strength question.",
      "In the same medium, higher frequency means shorter wavelength rather than faster sound.",
    ],
    tryFirst: "Compare 340 Hz and 680 Hz in the same air. The 680 Hz tone is higher in pitch, while the wavelength is shorter and the sound speed stays tied to the medium.",
    takeaway: "Pitch questions calm down once frequency, loudness, and speed stop collapsing into one label.",
  },
  M9_L4: {
    title: "Super-Scout lab",
    instructions: "Slide one sound across the hearing boundary and keep the 'still sound' label visible the whole time.",
    taskPrompt: "Classify frequencies against the Hear Zone, then explain why ultrasound remains sound and can still reflect from hidden boundaries.",
    exploreSteps: [
      "Start with an audible frequency.",
      "Push above 20 kHz into Super-Scout Mode.",
      "Keep the boundary-use explanation visible.",
    ],
    watchFor: [
      "Most human hearing sits between about 20 Hz and 20 kHz.",
      "Ultrasound is sound above that range.",
      "Ultrasound can still reflect because it is still sound in a medium.",
    ],
    tryFirst: "Move from 5 kHz to 40 kHz and watch the label change from Hear Zone to Super-Scout Mode without ever changing the wave family away from sound.",
    takeaway: "Ultrasound works best conceptually when it is treated as a high-frequency sound case, not as a separate mysterious beam.",
  },
  M9_L5: {
    title: "Scout Scan lab",
    instructions: "Treat the return time as a round trip first, then convert to one-way depth before you place the boundary.",
    taskPrompt: "Change echo time and sound speed, compare near and far boundaries, and explain why many echoes are needed to build a map instead of one clue.",
    exploreSteps: [
      "Start with one boundary and one echo.",
      "Move the boundary deeper and compare the new return time.",
      "Add a second boundary and sort the echoes by arrival order.",
    ],
    watchFor: [
      "Longer return time means a longer round trip.",
      "Depth uses the divide-by-two step.",
      "Imaging comes from many timed echoes.",
    ],
    tryFirst: "Set sound speed to 1500 m/s and echo time to 0.002 s. The round-trip distance is 3 m, so the boundary depth is 1.5 m after halving.",
    takeaway: "Echo mapping becomes reliable when students protect the round-trip logic before touching the formula.",
  },
  M9_L6: {
    title: "Flow Tracker lab",
    instructions: "Compare the returned frequency with the transmitted one before saying anything about motion direction.",
    taskPrompt: "Move the target toward and away from the probe, then explain how positive and negative shifts reveal flow direction in Doppler ultrasound.",
    exploreSteps: [
      "Start with zero shift and a stationary target.",
      "Move the target toward the probe.",
      "Reverse the motion and compare the sign of the shift.",
    ],
    watchFor: [
      "Toward the probe gives a higher returned frequency.",
      "Away from the probe gives a lower returned frequency.",
      "Doppler extends ultrasound into motion and blood-flow tracking.",
    ],
    tryFirst: "Keep a 3.000 MHz transmitted pulse on screen, then push the target toward the probe until the return reads 3.002 MHz. The positive shift is the clue that the target is moving toward the probe.",
    takeaway: "Doppler reasoning becomes much easier when learners read the shift sign before trying to name the medical meaning.",
  },
};

export function m9SimulationCopy(code: string): M9SimulationCopy | undefined {
  return M9_SIMULATION_COPY[code];
}

export function m9ScaffoldFocusExtras(code: string): string[] {
  switch (code) {
    case "M9_L1":
      return ["Ask what is vibrating before naming any sound property.", "Separate the source role from the medium role.", "Treat the launched frequency as source-owned."];
    case "M9_L2":
      return ["Track one particle and one pressure band separately.", "Use compression and rarefaction language explicitly.", "Keep longitudinal motion parallel to the travel direction."];
    case "M9_L3":
      return ["Use Hz as cycles-per-second language, not as a mysterious label.", "Keep pitch and loudness apart.", "If the medium stays the same, frequency changes wavelength more directly than speed."];
    case "M9_L4":
      return ["Classify the frequency band before the application.", "Use 'still sound' language for ultrasound.", "Keep the hearing boundary and echo behavior as separate ideas."];
    case "M9_L5":
      return ["Ask first whether the time is round-trip time.", "Sort echoes by arrival time before naming boundary order.", "One echo gives one clue; many echoes build a map."];
    case "M9_L6":
      return ["Compare returned frequency with transmitted frequency first.", "Read higher-versus-lower shift before naming flow direction.", "Treat Doppler as motion-reading ultrasound, not as a brighter still image."];
    default:
      return [];
  }
}

export function m9ScaffoldCoreBullets(code: string): string[] {
  switch (code) {
    case "M9_L1":
      return ["Sound starts with a vibrating source.", "The source frequency becomes the sound frequency.", "The wave is not a blob of air moving across the room."];
    case "M9_L2":
      return ["Sound in air is a longitudinal pressure wave.", "Compressions are crowded regions and rarefactions are spread regions.", "Particles oscillate locally while the pattern travels onward."];
    case "M9_L3":
      return ["Frequency controls pitch.", "Pitch and loudness are different ideas.", "In the same medium, higher frequency means shorter wavelength rather than much faster sound."];
    case "M9_L4":
      return ["Most human hearing sits around 20 Hz to 20 kHz.", "Ultrasound is sound above the audible range.", "Ultrasound can still reflect from boundaries because it is still sound."];
    case "M9_L5":
      return ["Echo returns come from reflected pulses.", "Longer return time usually means greater depth.", "Depth comes from round-trip timing and a divide-by-two step."];
    case "M9_L6":
      return ["Doppler ultrasound tracks motion through frequency shifts.", "Toward the probe gives a higher return frequency.", "Away from the probe gives a lower return frequency."];
    default:
      return [];
  }
}

export function m9ScaffoldMediaCards(code: string): UnknownRecord[] {
  const visual = M9_VISUAL_META[code.replace("_", "")];
  if (!visual) return [];
  return [{
    kind: "visual",
    title: visual.visual_title,
    caption: visual.visual_caption,
    image_url: visual.image_url,
    highlights: visual.visual_callouts,
  }];
}

export function m9ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const visual = M9_VISUAL_META[code.replace("_", "")];
  if (!visual) return undefined;
  return {
    title: visual.visual_title,
    prompt: "Use the visual to explain the key sound relationship from this lesson in one clear sentence.",
    image_url: visual.image_url,
    callouts: visual.visual_callouts,
  };
}
