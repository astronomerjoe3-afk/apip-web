"use client";

type UnknownRecord = Record<string, unknown>;
type BankKind = "diagnostic" | "concept" | "mastery";

type RawMcItem = {
  kind: "mc";
  prompt: string;
  choices: string[];
  answerIndex: number;
  hint: string;
  explanation: string;
};

type RawShortItem = {
  kind: "short";
  prompt: string;
  acceptedAnswers: string[];
  hint: string;
};

type RawItem = RawMcItem | RawShortItem;
type RawCollectionItem = RawItem | RawItem[];

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function compactCode(code: string): string {
  return normalizeCode(code).replace(/_/g, "");
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint: string,
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, explanation, hint };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
}

function shortCases(cases: Array<{ prompt: string; acceptedAnswers: string[]; hint: string }>): RawItem[] {
  return cases.map((entry) => short(entry.prompt, entry.acceptedAnswers, entry.hint));
}

function mcItem(
  id: string,
  prompt: string,
  choices: string[],
  answerIndex: number,
  hint: string,
  explanation: string,
): UnknownRecord {
  return {
    id,
    prompt,
    choices,
    answer_index: answerIndex,
    hint,
    feedback: choices.map((_, index) => (index === answerIndex ? explanation : hint)),
  };
}

function shortItem(id: string, prompt: string, acceptedAnswers: string[], hint: string): UnknownRecord {
  return {
    id,
    prompt,
    choices: [],
    accepted_answers: acceptedAnswers,
    hint,
    feedback: [hint],
  };
}

function stageLabel(kind: BankKind): string {
  switch (kind) {
    case "diagnostic":
      return "D";
    case "concept":
      return "C";
    case "mastery":
      return "M";
    default:
      return "Q";
  }
}

function minimumSize(kind: BankKind): number {
  return kind === "mastery" ? 40 : 20;
}

function normalizePrompt(prompt: string): string {
  return String(prompt || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function materializeBank(code: string, kind: BankKind, rawItems: RawCollectionItem[]): UnknownRecord[] {
  const flattened = rawItems.flat();
  const seenSignatures = new Set<string>();
  const deduped = flattened.flatMap((item, index) => {
    const signature = item.kind === "mc"
      ? `${normalizePrompt(item.prompt)}::${item.choices.map((choice) => normalizePrompt(choice)).join("|")}`
      : `${normalizePrompt(item.prompt)}::${item.acceptedAnswers.map((answer) => normalizePrompt(answer)).join("|")}`;
    if (!item.prompt || seenSignatures.has(signature)) return [];
    seenSignatures.add(signature);
    const id = `${compactCode(code)}_${stageLabel(kind)}${index + 1}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`M7 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep front travel separate from the local motion of the medium.";
  return [
    mc("What is the best description of a wave?", ["A traveling disturbance that transfers energy", "A mass of matter that travels across the medium", "A permanent movement of the whole medium", "A change in color across a surface"], 0, "A wave is a disturbance pattern that transfers energy.", hint),
    mc("A ripple crosses a pond while one cork bobs up and down. What actually travels across the pond?", ["The disturbance pattern", "The cork itself", "The whole body of water", "Only the amplitude"], 0, "The pattern propagates while the cork moves locally.", hint),
    mc("A crest travels 12 m in 3 s. What is the wave speed?", ["4 m/s", "3 m/s", "9 m/s", "36 m/s"], 0, "Wave speed = distance / time = 12 / 3.", hint),
    mc("Which statement should be rejected?", ["The medium travels across the tank with the wave", "The pattern travels across the tank", "Points on the medium oscillate locally", "Wave speed can be found from distance and time"], 0, "The medium does not travel with the wave.", hint),
    mc("What does amplitude describe?", ["The maximum displacement of a point from its equilibrium position", "The distance the wavefront crosses in one second", "The number of waves launched each second", "The spacing between two boundaries"], 0, "Amplitude belongs to local oscillation size.", hint),
    mc("Two pulses each cross 4 m in 2 s. One has larger amplitude. Which pulse is faster?", ["Neither; they have the same speed", "The larger-amplitude pulse", "The smaller-amplitude pulse", "There is not enough information"], 0, "Speed comes from travel distance and time here, not amplitude.", hint),
    mc("What is a wavefront?", ["A line joining points in the same phase", "The path of one particle in the medium", "The boundary of the container", "A graph of speed against time"], 0, "Wavefronts join same-phase points.", hint),
    mc("Which quantity is found from front distance and crossing time?", ["Wave speed", "Amplitude", "Mass", "Reflection angle"], 0, "That is the wave-speed calculation.", hint),
    mc("If one spectator in a stadium wave stands and sits in place, what does that show?", ["The local motion is not the same as the travel of the pattern", "The whole crowd travels around the stadium", "No energy is transferred", "The wave speed is zero"], 0, "This is the key pattern-versus-medium distinction.", hint),
    mc("A pulse crosses 10 m in 5 s. What is the speed?", ["2 m/s", "5 m/s", "50 m/s", "0.5 m/s"], 0, "10 / 5 = 2.", hint),
    shortCases([
      { prompt: "What travels across the medium in a wave: the pattern or the whole medium?", acceptedAnswers: words("the pattern", "the disturbance pattern", "the wave pattern"), hint },
      { prompt: "What is the wave speed if a pulse travels 15 m in 3 s?", acceptedAnswers: words("5", "5 m/s"), hint },
      { prompt: "Does one point in the medium usually travel with the wave across the whole tank?", acceptedAnswers: words("no"), hint },
      { prompt: "What does amplitude describe?", acceptedAnswers: words("maximum displacement", "the maximum displacement", "largest displacement"), hint },
      { prompt: "If distance stays the same but time doubles, does wave speed become larger or smaller?", acceptedAnswers: words("smaller"), hint },
      { prompt: "What line joins points in the same phase?", acceptedAnswers: words("wavefront", "a wavefront"), hint },
      { prompt: "What calculation gives wave speed from travel data?", acceptedAnswers: words("distance divided by time", "distance / time"), hint },
      { prompt: "In a stadium wave, do the people move around the stadium with the crest?", acceptedAnswers: words("no"), hint },
      { prompt: "If a crest crosses 1.8 m in 0.60 s, what is the speed?", acceptedAnswers: words("3", "3 m/s"), hint },
      { prompt: "Does a larger amplitude automatically mean a larger wave speed when distance and time are already known?", acceptedAnswers: words("no"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the pattern-versus-medium distinction before anything else.";
  return [
    mc("A rope wave travels right while one marker on the rope moves only up and down. Which statement is best?", ["The wave pattern moves right while the marker oscillates locally", "The marker moves right with the wavefront", "The whole rope moves right permanently", "The rope cannot transfer energy"], 0, "This is the core wave idea.", hint),
    mc("Why is 'the water moves across the pond with the wave' a weak statement?", ["Because the disturbance travels while the water mainly oscillates locally", "Because water cannot move", "Because waves do not transfer energy", "Because all waves are stationary"], 0, "The pattern and the medium must be separated.", hint),
    mc("A pulse crosses 24 seats in 3 s in a stadium wave. What is its speed in seats per second?", ["8 seats/s", "7 seats/s", "21 seats/s", "72 seats/s"], 0, "24 / 3 = 8.", hint),
    mc("Why does amplitude not by itself determine wave speed in a distance-time question?", ["Because speed comes from travel distance and time, not local oscillation size", "Because amplitude is measured in seconds", "Because amplitude is the same as wavelength", "Because waves never have amplitude"], 0, "Amplitude and speed are different properties.", hint),
    mc("Which quantity is most closely linked to how far one point in the medium moves from equilibrium?", ["Amplitude", "Wave speed", "Frequency", "Reflection angle"], 0, "Amplitude belongs to the local motion.", hint),
    mc("Why is wave speed described as pattern speed?", ["Because it belongs to how fast the disturbance crosses the medium", "Because every particle travels at that speed", "Because it is always the same as amplitude", "Because it does not involve time"], 0, "Wave speed refers to the disturbance propagation.", hint),
    mc("A crest crosses 6 m in 2 s while the marker amplitude is 4 cm. What is the speed?", ["3 m/s", "2 m/s", "4 m/s", "12 m/s"], 0, "6 / 2 = 3.", hint),
    mc("Which statement is strongest for wavefronts?", ["They show the positions of same-phase points across the wave", "They show the path of one particle", "They are always straight lines only", "They measure amplitude directly"], 0, "Wavefronts are same-phase loci.", hint),
    mc("Why can a wave transfer energy without transporting matter across the whole medium?", ["Because each part of the medium oscillates around its own place while the disturbance pattern moves on", "Because energy never needs a medium", "Because the medium is always solid", "Because only light is a wave"], 0, "This is the standard energy-transfer explanation.", hint),
    mc("A pulse on rope A and a pulse on rope B have the same crossing distance and time but different amplitudes. What should be concluded first?", ["Their wave speeds are equal from the given data", "The larger-amplitude pulse must be faster", "The smaller-amplitude pulse must be faster", "Amplitude replaces time in the speed formula"], 0, "The given travel data already fixes the speed.", hint),
    shortCases([
      { prompt: "What is the strongest reason one marker on a rope does not travel with the wavefront?", acceptedAnswers: words("because it only oscillates locally", "because it moves locally around equilibrium", "because it only oscillates"), hint },
      { prompt: "What is the speed if a disturbance crosses 18 m in 6 s?", acceptedAnswers: words("3", "3 m/s"), hint },
      { prompt: "Does amplitude describe front travel or local displacement?", acceptedAnswers: words("local displacement"), hint },
      { prompt: "What is transferred by a wave even though the medium does not travel across the whole system?", acceptedAnswers: words("energy"), hint },
      { prompt: "What kind of line joins points in the same phase?", acceptedAnswers: words("wavefront", "wavefronts"), hint },
      { prompt: "If the same distance is crossed in less time, does wave speed become larger or smaller?", acceptedAnswers: words("larger"), hint },
      { prompt: "A disturbance crosses 1.2 m in 0.4 s. What is the speed?", acceptedAnswers: words("3", "3 m/s"), hint },
      { prompt: "Should you use the amplitude value when the question directly gives travel distance and time?", acceptedAnswers: words("no"), hint },
      { prompt: "In a stadium wave, what travels around the stadium?", acceptedAnswers: words("the pattern", "the disturbance pattern"), hint },
      { prompt: "What property of one point in the medium tells you how big its oscillation is?", acceptedAnswers: words("amplitude"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Classify the wave by comparing local motion with propagation direction.";
  return [
    mc("What makes a wave transverse?", ["Local motion is perpendicular to the direction of travel", "Local motion is parallel to the direction of travel", "It always moves horizontally on a page", "It always has a high frequency"], 0, "Transverse means perpendicular local motion.", hint),
    mc("What makes a wave longitudinal?", ["Local motion is parallel to the direction of travel", "Local motion is perpendicular to the direction of travel", "It always looks like an up-down line", "It cannot carry energy"], 0, "Longitudinal means parallel local motion.", hint),
    mc("A wave travels east while the medium oscillates north-south. What type is it?", ["Transverse", "Longitudinal", "Neither", "Cannot be classified"], 0, "The two directions are perpendicular.", hint),
    mc("A sound wave in air is usually classified as which type?", ["Longitudinal", "Transverse", "Stationary", "Circular"], 0, "Sound in air is longitudinal.", hint),
    mc("Why is 'it goes up and down, so it is transverse' incomplete?", ["Because the propagation direction also has to be compared", "Because all waves go up and down", "Because only water waves are transverse", "Because amplitude decides the type"], 0, "Wave type depends on the directional relation.", hint),
    mc("If a pulse travels right while the medium moves left-right, what type is it?", ["Longitudinal", "Transverse", "Neither", "Cannot be known"], 0, "The local motion is parallel to propagation.", hint),
    mc("Which statement is strongest?", ["Wave type comes from a directional comparison, not the page layout", "Wave type is decided by color", "Wave type is decided by speed alone", "Wave type is decided by amplitude only"], 0, "Page orientation can mislead.", hint),
    mc("What feature of a longitudinal wave is often visible?", ["Compressions and rarefactions", "Crests and troughs only", "Equal reflection angles", "A normal line"], 0, "These are the usual longitudinal pattern features.", hint),
    mc("What feature is often used to describe a transverse wave profile?", ["Crests and troughs", "Compressions and rarefactions only", "Density changes only", "Mass flow"], 0, "Crests and troughs are transverse-profile language.", hint),
    mc("If the local motion is at 90 degrees to propagation, what is the wave?", ["Transverse", "Longitudinal", "Stationary", "Diffraction"], 0, "90 degrees means perpendicular.", hint),
    shortCases([
      { prompt: "What wave type has local motion perpendicular to travel?", acceptedAnswers: words("transverse"), hint },
      { prompt: "What wave type has local motion parallel to travel?", acceptedAnswers: words("longitudinal"), hint },
      { prompt: "A wave travels east while the medium oscillates north-south. Is it transverse or longitudinal?", acceptedAnswers: words("transverse"), hint },
      { prompt: "What sound-wave feature replaces crests and troughs?", acceptedAnswers: words("compressions and rarefactions", "compression and rarefaction"), hint },
      { prompt: "Does page orientation by itself classify the wave type?", acceptedAnswers: words("no"), hint },
      { prompt: "What angle relation defines a transverse wave?", acceptedAnswers: words("perpendicular", "90 degrees"), hint },
      { prompt: "What angle relation defines a longitudinal wave?", acceptedAnswers: words("parallel", "0 degrees"), hint },
      { prompt: "Name the usual type of sound wave in air.", acceptedAnswers: words("longitudinal"), hint },
      { prompt: "What must be compared to classify wave type?", acceptedAnswers: words("local motion and propagation direction", "the local motion and the travel direction"), hint },
      { prompt: "What is a common profile feature of a transverse wave?", acceptedAnswers: words("crests and troughs", "crest and trough"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Say the travel direction and the local motion direction explicitly before naming the type.";
  return [
    mc("A wavefront moves north while the medium oscillates east-west. What type is it?", ["Transverse", "Longitudinal", "Stationary", "Cannot be known"], 0, "The local motion is perpendicular to travel.", hint),
    mc("A compression wave moves right and the particles also move right-left. What type is it?", ["Longitudinal", "Transverse", "Neither", "Diffraction"], 0, "The local motion is parallel to propagation.", hint),
    mc("Why is 'longitudinal waves are the squashed-looking ones' a weak definition?", ["Because the type must be defined by the motion-travel relation", "Because every wave looks squashed", "Because only sound is longitudinal", "Because the page decides the type"], 0, "The visual style alone is not the definition.", hint),
    mc("A sketch shows a wavy line, but the wave actually travels vertically and the medium moves horizontally. What type is it?", ["Transverse", "Longitudinal", "Neither", "Cannot be known"], 0, "Horizontal local motion and vertical travel are perpendicular.", hint),
    mc("Which statement is strongest?", ["Transverse and longitudinal are classification rules based on direction, not on the picture style", "Every wavy line on paper is transverse", "Every sound diagram is longitudinal because of its shape only", "Wave type depends on wave speed only"], 0, "Direction comparison is the rigorous rule.", hint),
    mc("Why must the propagation direction be stated before classifying a wave?", ["Because local motion is only meaningful relative to the direction the wave travels", "Because propagation direction sets the amplitude", "Because without it the mass cannot be found", "Because it determines the temperature"], 0, "Classification is relational.", hint),
    mc("A wave travels left while the medium oscillates up and down. Which clue decides the type?", ["Perpendicular motion to travel", "The fact that left is horizontal", "The size of the amplitude", "The speed"], 0, "Perpendicular local motion defines transverse.", hint),
    mc("Why is sound in air not usually described with crests and troughs?", ["Because it is longitudinal and is better described by compressions and rarefactions", "Because sound cannot be graphed", "Because sound does not oscillate", "Because sound has no frequency"], 0, "Compression language fits longitudinal motion.", hint),
    mc("If a wave's local motion is neither perfectly parallel nor perfectly perpendicular to propagation, what is safest?", ["Do not force a simple transverse-longitudinal label without more context", "Always call it transverse", "Always call it longitudinal", "Ignore the motion direction"], 0, "The standard school categories rely on clear directional relations.", hint),
    mc("What is the strongest upgrade to 'up-down means transverse'?", ["Transverse means local motion is perpendicular to propagation", "Transverse means the page has vertical arrows", "Transverse means high amplitude", "Transverse means fast speed"], 0, "The relation is the definition.", hint),
    shortCases([
      { prompt: "What is the safest first step before classifying a wave type?", acceptedAnswers: words("state the travel direction and the local motion direction", "compare local motion with travel direction", "compare local motion and propagation"), hint },
      { prompt: "If local motion is perpendicular to travel, what type is the wave?", acceptedAnswers: words("transverse"), hint },
      { prompt: "If local motion is parallel to travel, what type is the wave?", acceptedAnswers: words("longitudinal"), hint },
      { prompt: "Why is page layout alone unsafe for classification?", acceptedAnswers: words("because the propagation direction matters", "because you must compare with travel direction"), hint },
      { prompt: "What pair of words usually describes a longitudinal wave pattern?", acceptedAnswers: words("compressions and rarefactions", "compression and rarefaction"), hint },
      { prompt: "What pair of words often describes a transverse profile?", acceptedAnswers: words("crests and troughs", "crest and trough"), hint },
      { prompt: "A wave moves east and the medium moves north-south. What type is it?", acceptedAnswers: words("transverse"), hint },
      { prompt: "A sound wave in air is usually what type?", acceptedAnswers: words("longitudinal"), hint },
      { prompt: "What word describes two directions at right angles?", acceptedAnswers: words("perpendicular"), hint },
      { prompt: "What word describes two directions along the same line?", acceptedAnswers: words("parallel"), hint },
    ]),
  ];
}
function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the three linked quantities together: speed, frequency, and wavelength.";
  return [
    mc("Which equation links wave speed, frequency, and wavelength?", ["v = f lambda", "v = d / t only", "Q = mc delta T", "F = ma"], 0, "This is the standard wave relation.", hint),
    mc("A wave has frequency 5 Hz and wavelength 2 m. What is its speed?", ["10 m/s", "7 m/s", "2.5 m/s", "3 m/s"], 0, "5 x 2 = 10.", hint),
    mc("A wave travels at 12 m/s and has frequency 4 Hz. What is its wavelength?", ["3 m", "48 m", "8 m", "0.33 m"], 0, "lambda = v / f = 12 / 4.", hint),
    mc("A wave travels at 3.6 m/s and has wavelength 0.24 m. What is the frequency?", ["15 Hz", "0.067 Hz", "0.86 Hz", "8.6 Hz"], 0, "f = v / lambda = 3.6 / 0.24 = 15.", hint),
    mc("Which quantity is set by the source?", ["Frequency", "Boundary shape", "Reflection angle", "Medium depth only"], 0, "Frequency is the source launch rate.", hint),
    mc("If frequency doubles while wavelength stays the same, what happens to speed?", ["It doubles", "It halves", "It stays the same", "It becomes zero"], 0, "v is directly proportional to f.", hint),
    mc("If wavelength halves while frequency stays the same, what happens to speed?", ["It halves", "It doubles", "It stays the same", "It becomes infinite"], 0, "v is directly proportional to wavelength too.", hint),
    mc("Why can two waves with different frequency and wavelength still have the same speed?", ["Because speed depends on the product f lambda", "Because frequency decides everything alone", "Because wavelength decides everything alone", "Because speed ignores both"], 0, "Different pairs can give the same product.", hint),
    mc("Wave P has 12 Hz and 0.18 m. Wave Q has 9 Hz and 0.24 m. Which is faster?", ["They have the same speed", "Wave P", "Wave Q", "Not enough information"], 0, "Both give 2.16 m/s.", hint),
    mc("Which unit pair is correct for frequency and wavelength?", ["Hz and m", "m/s and kg", "N and J", "Pa and m"], 0, "Frequency uses hertz and wavelength uses metres.", hint),
    shortCases([
      { prompt: "What equation links wave speed, frequency, and wavelength?", acceptedAnswers: words("v = f lambda", "v=f lambda", "v = fλ", "v=fλ"), hint },
      { prompt: "What is the speed of a 6 Hz wave with wavelength 0.5 m?", acceptedAnswers: words("3", "3 m/s"), hint },
      { prompt: "What is the wavelength of a 20 m/s wave with frequency 4 Hz?", acceptedAnswers: words("5", "5 m"), hint },
      { prompt: "What is the frequency of a wave with speed 8 m/s and wavelength 2 m?", acceptedAnswers: words("4", "4 hz", "4 Hz"), hint },
      { prompt: "Which quantity is the source launch rate?", acceptedAnswers: words("frequency"), hint },
      { prompt: "What unit is used for wavelength?", acceptedAnswers: words("m", "metres", "meters"), hint },
      { prompt: "If frequency doubles and wavelength stays fixed, what happens to speed?", acceptedAnswers: words("it doubles", "doubles"), hint },
      { prompt: "Can different frequency-wavelength pairs give the same speed?", acceptedAnswers: words("yes"), hint },
      { prompt: "What is 9 x 0.24 in the wave-speed relation?", acceptedAnswers: words("2.16", "2.16 m/s"), hint },
      { prompt: "What unit is used for frequency?", acceptedAnswers: words("hz", "hertz"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Judge speed from the full product, not from one quantity alone.";
  return [
    mc("Wave A has 10 Hz and 0.30 m. Wave B has 6 Hz and 0.50 m. What is true?", ["They have the same speed", "Wave A is faster", "Wave B is faster", "Neither can be compared"], 0, "Both speeds are 3.0 m/s.", hint),
    mc("Why is 'the wave with larger frequency is always faster' weak?", ["Because wavelength also matters in v = f lambda", "Because frequency is never used", "Because speed only depends on amplitude", "Because all waves have the same speed"], 0, "Speed depends on the product of two quantities.", hint),
    mc("A wave has speed 4.8 m/s and frequency 12 Hz. What is wavelength?", ["0.40 m", "57.6 m", "3.6 m", "0.25 m"], 0, "4.8 / 12 = 0.40.", hint),
    mc("A ripple has wavelength 0.12 m and frequency 20 Hz. What is speed?", ["2.4 m/s", "1.7 m/s", "20.12 m/s", "0.006 m/s"], 0, "20 x 0.12 = 2.4.", hint),
    mc("Why must wavelengths in centimetres be converted to metres before using v = f lambda?", ["Because the SI unit in the formula is metres", "Because hertz uses centimetres", "Because frequency changes during conversion", "Because speed is unitless"], 0, "Use consistent units.", hint),
    mc("A student finds a higher frequency but a shorter wavelength and cannot tell whether the speed is larger. What should they do?", ["Compare the full product f lambda", "Choose the higher frequency automatically", "Choose the shorter wavelength automatically", "Ignore the units"], 0, "The product determines the speed.", hint),
    mc("If a wave speed is fixed and frequency increases, what must happen to wavelength?", ["It decreases", "It increases", "It stays the same", "It becomes zero immediately"], 0, "At fixed speed, wavelength varies inversely with frequency.", hint),
    mc("Which statement is strongest?", ["Wave speed is controlled by frequency and wavelength together", "Frequency alone always decides speed", "Wavelength alone always decides speed", "Amplitude is part of the speed equation"], 0, "This is the correct relational statement.", hint),
    mc("A wave has frequency 15 Hz and wavelength 24 cm. What is speed in m/s?", ["3.6 m/s", "360 m/s", "0.36 m/s", "39 m/s"], 0, "24 cm = 0.24 m, then 15 x 0.24 = 3.6.", hint),
    mc("If two waves have the same speed but different frequencies, what must be true?", ["Their wavelengths are different", "Their amplitudes are equal", "Their reflection angles are equal", "They must be in the same medium"], 0, "At fixed speed, different frequencies require different wavelengths.", hint),
    shortCases([
      { prompt: "What should you compare if two waves have different frequency and wavelength but you want to know which is faster?", acceptedAnswers: words("the product f lambda", "the product", "f times lambda"), hint },
      { prompt: "What is the wavelength of a 9 m/s wave with frequency 3 Hz?", acceptedAnswers: words("3", "3 m"), hint },
      { prompt: "What is the speed of a 7 Hz wave with wavelength 0.4 m?", acceptedAnswers: words("2.8", "2.8 m/s"), hint },
      { prompt: "If speed is fixed and frequency goes up, what happens to wavelength?", acceptedAnswers: words("it decreases", "decreases"), hint },
      { prompt: "Why do you convert 18 cm to 0.18 m before using the wave formula?", acceptedAnswers: words("because wavelength should be in metres", "because the formula uses metres"), hint },
      { prompt: "Can a higher frequency still give the same speed as a lower frequency?", acceptedAnswers: words("yes"), hint },
      { prompt: "What is the frequency of a wave with speed 6 m/s and wavelength 0.5 m?", acceptedAnswers: words("12", "12 Hz", "12 hz"), hint },
      { prompt: "What does the source set in the wave relation?", acceptedAnswers: words("frequency"), hint },
      { prompt: "What is 12 x 0.18 in m/s?", acceptedAnswers: words("2.16", "2.16 m/s"), hint },
      { prompt: "Which two quantities together determine wave speed in M7_L3?", acceptedAnswers: words("frequency and wavelength"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Draw the normal first and measure both angles from it.";
  return [
    mc("Which line is used as the reference for reflection angles?", ["The normal", "The boundary surface", "The wavelength line", "The amplitude line"], 0, "Reflection angles are measured from the normal.", hint),
    mc("What rule applies at a flat reflecting boundary?", ["Angle of incidence = angle of reflection", "Speed always doubles", "Frequency always changes", "Amplitude always halves"], 0, "This is the reflection law.", hint),
    mc("A wave approaches at 35 degrees to the normal. What is the reflected angle?", ["35 degrees", "55 degrees", "70 degrees", "90 degrees"], 0, "The angles are equal to the normal.", hint),
    mc("A wave approaches at 25 degrees to the surface. What is the angle of incidence?", ["65 degrees", "25 degrees", "115 degrees", "45 degrees"], 0, "Incidence angle is measured from the normal, so 90 - 25.", hint),
    mc("If the incident wave travels head-on along the normal, what is the reflected angle?", ["0 degrees", "90 degrees", "180 degrees", "45 degrees"], 0, "Head-on reflection has zero angle to the normal.", hint),
    mc("What happens to the path in the head-on case?", ["It retraces the same path", "It bends away from the normal", "It spreads strongly", "It stops completely"], 0, "The wave travels straight back.", hint),
    mc("Which statement should be rejected?", ["Angles of reflection are measured from the surface", "Angles of reflection are measured from the normal", "Equal angles apply at a flat boundary", "Head-on waves retrace their path"], 0, "Surface angles are not the formal reference.", hint),
    mc("A reflected wave makes 40 degrees to the normal. What is the incident angle?", ["40 degrees", "50 degrees", "80 degrees", "90 degrees"], 0, "Equal-angle rule.", hint),
    mc("A wave hits a wall at 60 degrees to the surface. What is the angle of incidence?", ["30 degrees", "60 degrees", "120 degrees", "90 degrees"], 0, "90 - 60 = 30.", hint),
    mc("Why is the normal useful?", ["It gives one consistent reference line for both incoming and outgoing angles", "It gives the wavelength directly", "It sets the frequency", "It replaces the need for geometry"], 0, "The normal keeps the geometry consistent.", hint),
    shortCases([
      { prompt: "What line is the angle reference in reflection?", acceptedAnswers: words("normal", "the normal"), hint },
      { prompt: "What is the reflected angle if the incident angle is 45 degrees?", acceptedAnswers: words("45", "45 degrees"), hint },
      { prompt: "If a wave makes 20 degrees to the surface, what is the incident angle?", acceptedAnswers: words("70", "70 degrees"), hint },
      { prompt: "What is the incident angle for a head-on wave along the normal?", acceptedAnswers: words("0", "0 degrees"), hint },
      { prompt: "What happens to the path in the head-on reflection case?", acceptedAnswers: words("it retraces the path", "it goes straight back", "retraces its path"), hint },
      { prompt: "Should reflection angles be measured from the surface or the normal?", acceptedAnswers: words("the normal", "normal"), hint },
      { prompt: "If the reflected angle is 30 degrees, what is the incident angle?", acceptedAnswers: words("30", "30 degrees"), hint },
      { prompt: "What is 90 - 25 in the reflection conversion?", acceptedAnswers: words("65", "65 degrees"), hint },
      { prompt: "What law governs reflection at a flat barrier?", acceptedAnswers: words("angle of incidence equals angle of reflection", "i = r"), hint },
      { prompt: "Why is using the surface directly risky in reflection questions?", acceptedAnswers: words("because the formal angles are measured from the normal", "because you must use the normal"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Convert any surface angle to a normal angle before applying the equal-angle rule.";
  return [
    mc("A wave is shown making 32 degrees to the barrier surface. What angle should be used as the angle of incidence?", ["58 degrees", "32 degrees", "122 degrees", "90 degrees"], 0, "Use 90 - 32.", hint),
    mc("Why is 'the wave changes speed and reflects' a weak explanation for ordinary reflection at a rigid wall?", ["Because reflection is a boundary bounce, not a new-medium speed-change story", "Because reflected waves never have angles", "Because all reflections happen in vacuums", "Because walls set the frequency"], 0, "Speed-change turning is refraction language.", hint),
    mc("A wave approaches at 50 degrees to the normal. What angle does the reflected wave make to the surface?", ["40 degrees", "50 degrees", "90 degrees", "140 degrees"], 0, "It reflects at 50 to the normal, so 40 to the surface.", hint),
    mc("Why must both angles be measured from the same line?", ["So the equal-angle comparison is physically consistent", "So the speed stays constant", "So the wavelength stays constant", "So amplitude can be ignored"], 0, "Consistency of reference line matters.", hint),
    mc("If the incident angle to the normal is 0 degrees, which description is best?", ["The wave retraces its path straight back", "The wave bends away from the normal", "The wave diffracts strongly", "The wave cannot reflect"], 0, "This is the head-on case.", hint),
    mc("A student measures one angle from the surface and the other from the normal. Why is that unsafe?", ["Because equal-angle reflection only works when both are measured from the same reference line", "Because reflection has no geometry", "Because the surface sets the frequency", "Because the normal is only for light"], 0, "Mixing references breaks the rule.", hint),
    mc("Which statement is strongest?", ["Reflection keeps equal angles to the normal at a flat boundary", "Reflection keeps equal angles to the surface in all diagrams", "Reflection always changes frequency", "Reflection only happens for sound"], 0, "The normal-based rule is the rigorous one.", hint),
    mc("Why is surface-angle conversion often needed?", ["Because many sketches give a surface angle, but the reflection law uses the normal angle", "Because the surface angle is always zero", "Because only the surface angle has units", "Because the normal cannot be drawn"], 0, "This is a common exam trap.", hint),
    mc("A wave reflects from a straight barrier. Which quantity is most likely unchanged by ideal reflection?", ["Wave frequency", "Boundary orientation", "Normal direction", "All path angles to the surface"], 0, "Reflection changes direction, not the source frequency.", hint),
    mc("What is the safest order in a reflection calculation?", ["Draw normal, convert if needed, apply equal-angle rule", "Choose any angle and double it", "Use speed first", "Use amplitude first"], 0, "That order protects the geometry.", hint),
    shortCases([
      { prompt: "What should you draw first in a reflection diagram?", acceptedAnswers: words("the normal", "normal"), hint },
      { prompt: "If the wave makes 25 degrees to the surface, what is the angle of incidence?", acceptedAnswers: words("65", "65 degrees"), hint },
      { prompt: "What rule then gives the reflected angle?", acceptedAnswers: words("angle of incidence equals angle of reflection", "i = r"), hint },
      { prompt: "Why is measuring one angle from the surface and one from the normal unsafe?", acceptedAnswers: words("because the same reference line must be used", "because both must be measured from the same line"), hint },
      { prompt: "What happens in the head-on case?", acceptedAnswers: words("the wave retraces its path", "it goes straight back"), hint },
      { prompt: "Is reflection mainly a speed-change story or a boundary-bounce story?", acceptedAnswers: words("boundary-bounce story", "bounce"), hint },
      { prompt: "If the reflected angle to the normal is 42 degrees, what is the incident angle?", acceptedAnswers: words("42", "42 degrees"), hint },
      { prompt: "What is the angle to the surface if the angle to the normal is 35 degrees?", acceptedAnswers: words("55", "55 degrees"), hint },
      { prompt: "Does ideal reflection change the source frequency?", acceptedAnswers: words("no"), hint },
      { prompt: "What is the safest sentence for reflection geometry?", acceptedAnswers: words("angles are equal to the normal", "angle of incidence equals angle of reflection"), hint },
    ]),
  ];
}
function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep frequency source-fixed, then link the new speed to the new wavelength and bend direction.";
  return [
    mc("What is refraction?", ["A change in direction caused by a change in speed in a new medium", "A bounce back from a wall", "A spread through a gap", "A rise in amplitude"], 0, "Refraction is a speed-change turn.", hint),
    mc("What usually stays constant when a wave crosses into a new medium?", ["Frequency", "Wave speed", "Wavelength", "Direction"], 0, "The source keeps the frequency fixed.", hint),
    mc("If wave speed decreases in the new medium while frequency stays fixed, what happens to wavelength?", ["It decreases", "It increases", "It stays the same", "It becomes zero"], 0, "v = f lambda with fixed f means lower v gives lower lambda.", hint),
    mc("If a wave enters a slower medium, how does it bend?", ["Toward the normal", "Away from the normal", "Straight back", "It never bends"], 0, "Slower medium gives bending toward the normal.", hint),
    mc("If a wave enters a faster medium, how does it bend?", ["Away from the normal", "Toward the normal", "Straight back", "It must diffract"], 0, "Faster medium gives bending away from the normal.", hint),
    mc("A wave keeps frequency 5 Hz and its speed changes from 1.2 m/s to 0.75 m/s. What is the new wavelength?", ["0.15 m", "0.24 m", "1.95 m", "6.0 m"], 0, "0.75 / 5 = 0.15.", hint),
    mc("Why is 'the frequency changes at the boundary' a weak statement?", ["Because the source still sets the frequency", "Because frequency is not used in waves", "Because frequency must equal wavelength", "Because boundaries stop oscillations"], 0, "The medium changes speed, not source launch rate.", hint),
    mc("Which quantity is most directly controlled by the new medium?", ["Wave speed", "Source frequency", "Number of sources", "Amplitude definition"], 0, "The medium affects speed.", hint),
    mc("A wave of frequency 8 Hz speeds up from 0.60 m/s to 0.96 m/s. What happens to wavelength?", ["It increases from 0.075 m to 0.12 m", "It decreases from 0.12 m to 0.075 m", "It stays at 8 m", "It becomes 1.56 m"], 0, "lambda = v / f on each side.", hint),
    mc("Which statement is strongest?", ["Refraction is a speed-change story, not a reflection story", "Refraction keeps equal angles to the normal", "Refraction always means slower speed", "Refraction only happens to light"], 0, "Speed change in a new medium is the key idea.", hint),
    shortCases([
      { prompt: "What usually stays fixed across a boundary: frequency or speed?", acceptedAnswers: words("frequency"), hint },
      { prompt: "If speed falls in the new medium and frequency stays fixed, does wavelength increase or decrease?", acceptedAnswers: words("decrease", "it decreases"), hint },
      { prompt: "Which way does a wave bend on entering a slower medium?", acceptedAnswers: words("toward the normal"), hint },
      { prompt: "Which way does a wave bend on entering a faster medium?", acceptedAnswers: words("away from the normal"), hint },
      { prompt: "What is the wavelength of a 10 Hz wave traveling at 2 m/s?", acceptedAnswers: words("0.2", "0.20", "0.2 m", "0.20 m"), hint },
      { prompt: "What is the wavelength in the new medium if speed is 6 m/s and frequency is 3 Hz?", acceptedAnswers: words("2", "2 m"), hint },
      { prompt: "What does the new medium change first in refraction?", acceptedAnswers: words("speed", "wave speed"), hint },
      { prompt: "Does refraction describe a bounce or a turn caused by speed change?", acceptedAnswers: words("a turn caused by speed change", "speed-change turn"), hint },
      { prompt: "If a wave enters shallower water and slows down, what usually happens to wavelength?", acceptedAnswers: words("it gets shorter", "it decreases", "shorter"), hint },
      { prompt: "What relation still links speed, frequency, and wavelength after the boundary?", acceptedAnswers: words("v = f lambda", "v=f lambda", "v = fλ"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Build the whole chain: frequency fixed, speed changes, wavelength changes, then the bend direction follows.";
  return [
    mc("Why does a wave bend when it crosses into a slower region at an angle?", ["One side of the wavefront enters the slower region first, so the front pivots", "Because the frequency suddenly drops", "Because the boundary reflects half the wave", "Because the amplitude becomes zero"], 0, "This is the standard wavefront explanation.", hint),
    mc("A wave enters a region where speed increases but frequency stays fixed. What pair of statements is correct?", ["Wavelength increases and the wave bends away from the normal", "Wavelength decreases and the wave bends toward the normal", "Wavelength stays the same and the wave reflects", "Frequency increases and wavelength decreases"], 0, "Faster medium means larger lambda and bend away.", hint),
    mc("Why is 'the source changes its frequency at the boundary' wrong?", ["Because the source is unchanged; the medium changes the speed instead", "Because boundaries control the source", "Because frequency is measured in metres", "Because boundaries remove wavelength"], 0, "Source-fixed frequency is central to refraction.", hint),
    mc("A water wave of frequency 4 Hz travels at 12 m/s then enters a region where speed is 8 m/s. What is the new wavelength?", ["2 m", "3 m", "0.5 m", "20 m"], 0, "8 / 4 = 2.", hint),
    mc("What is the old wavelength in that case?", ["3 m", "2 m", "48 m", "0.33 m"], 0, "12 / 4 = 3.", hint),
    mc("Which statement is strongest?", ["At a boundary the source keeps frequency fixed while the new medium changes speed and wavelength", "At a boundary frequency and speed both stay fixed", "At a boundary only direction changes", "At a boundary wavelength never changes"], 0, "This is the complete refraction chain.", hint),
    mc("If a wave does not change speed at a boundary, what is safest?", ["There is no refraction turning", "It must reflect strongly", "Its frequency must double", "Its wavelength must become zero"], 0, "Without speed change, there is no refraction bend.", hint),
    mc("Why is refraction not just 'any change in direction'?", ["Because the cause must be a speed change in a new medium", "Because only reflection changes direction", "Because direction changes require amplitude changes", "Because refraction only happens in solids"], 0, "The cause story matters.", hint),
    mc("What is the best explanation of shallower-water refraction?", ["Waves slow down, their wavelengths shorten, and they bend toward the normal", "Waves speed up, their wavelengths lengthen, and they bend away", "Frequency drops and they bounce", "Amplitude alone changes"], 0, "This is the standard shallow-water rule.", hint),
    mc("Why do exam questions often ask for wavelength on both sides of a boundary?", ["Because the wavelength change shows whether the speed changed while frequency stayed fixed", "Because wavelength replaces direction", "Because only wavelength matters in waves", "Because frequency is never relevant"], 0, "The wavelength comparison exposes the full chain.", hint),
    shortCases([
      { prompt: "What quantity is source-fixed in refraction questions?", acceptedAnswers: words("frequency"), hint },
      { prompt: "If speed decreases in the new medium, what happens to wavelength?", acceptedAnswers: words("it decreases", "shorter", "it gets shorter"), hint },
      { prompt: "If a wave enters a slower medium, which way does it bend?", acceptedAnswers: words("toward the normal"), hint },
      { prompt: "What is the new wavelength if speed is 0.75 m/s and frequency is 5 Hz?", acceptedAnswers: words("0.15", "0.15 m"), hint },
      { prompt: "Why does the wavefront turn at an angled boundary?", acceptedAnswers: words("because one side changes speed first", "because one side enters the new medium first and changes speed first"), hint },
      { prompt: "What happens to wavelength if speed increases and frequency stays fixed?", acceptedAnswers: words("it increases", "longer"), hint },
      { prompt: "Can a boundary cause refraction without a speed change?", acceptedAnswers: words("no"), hint },
      { prompt: "What is the old wavelength if speed is 1.2 m/s and frequency is 5 Hz?", acceptedAnswers: words("0.24", "0.24 m"), hint },
      { prompt: "Why is refraction a better description than reflection for a wave entering a new medium?", acceptedAnswers: words("because the wave speed changes in the new medium", "because it is a speed-change story"), hint },
      { prompt: "What full relation still holds on both sides of the boundary?", acceptedAnswers: words("v = f lambda", "v=f lambda", "v = fλ"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Compare the gap size with the wavelength before judging the spread.";
  return [
    mc("What is diffraction?", ["The spreading of a wave at a gap or edge", "A bounce from a wall", "A speed-change turn at a boundary", "A change in frequency"], 0, "Diffraction is spreading around openings and edges.", hint),
    mc("When is diffraction strongest?", ["When the gap size is comparable to the wavelength", "When the gap is far wider than the wavelength", "When the amplitude is zero", "When reflection angles are equal"], 0, "Comparable size gives the strongest spread.", hint),
    mc("Two waves meet the same gap. Which diffracts more strongly?", ["The one with wavelength closer to the gap size", "The one with the smaller amplitude", "The one with lower reflection angle", "The one with larger mass"], 0, "Diffraction depends on the wavelength-gap comparison.", hint),
    mc("A wave of wavelength 0.25 m meets a 0.30 m gap. Is diffraction likely to be strong or weak?", ["Strong", "Weak", "Impossible", "Zero"], 0, "The sizes are comparable.", hint),
    mc("A wave of wavelength 0.05 m meets a 0.30 m gap. Is diffraction likely to be strong or weak?", ["Weak", "Strong", "Impossible", "Zero"], 0, "The gap is much wider than the wavelength.", hint),
    mc("Which statement should be rejected?", ["Only sound waves diffract", "All waves can diffract", "Gap size should be compared with wavelength", "Narrow comparable gaps spread waves more strongly"], 0, "Diffraction is a general wave behavior.", hint),
    mc("What is the best comparison for deciding how noticeable diffraction will be?", ["Gap width versus wavelength", "Amplitude versus speed", "Frequency versus angle of reflection", "Mass versus density"], 0, "This is the decisive comparison.", hint),
    mc("A wave of wavelength 0.12 m passes through a 0.10 m gap and then a 0.60 m gap. Which gives stronger diffraction?", ["The 0.10 m gap", "The 0.60 m gap", "They are equal", "Cannot be known"], 0, "0.10 m is close to 0.12 m.", hint),
    mc("Why can a very wide doorway seem to give little diffraction for a short-wavelength wave?", ["Because the doorway is much larger than the wavelength", "Because diffraction only happens to light", "Because the source frequency becomes zero", "Because waves cannot pass wide gaps"], 0, "Wide compared with wavelength means weak spreading.", hint),
    mc("Which clue most strongly supports diffraction rather than refraction?", ["Wave spreading after a gap", "Speed change in a new medium", "Equal incident and reflected angles", "A stationary medium"], 0, "Spreading at a gap is the diffraction clue.", hint),
    shortCases([
      { prompt: "What is the name for wave spreading at a gap or edge?", acceptedAnswers: words("diffraction"), hint },
      { prompt: "When is diffraction strongest?", acceptedAnswers: words("when the gap is comparable to the wavelength", "when gap size is comparable to wavelength"), hint },
      { prompt: "Which wave usually diffracts more at the same gap: longer wavelength or shorter wavelength?", acceptedAnswers: words("longer wavelength"), hint },
      { prompt: "Does diffraction belong only to sound waves?", acceptedAnswers: words("no"), hint },
      { prompt: "What should you compare with the gap width to judge diffraction?", acceptedAnswers: words("wavelength"), hint },
      { prompt: "Is spreading usually stronger for a 0.10 m gap or a 0.60 m gap when wavelength is 0.12 m?", acceptedAnswers: words("0.10 m gap", "the 0.10 m gap"), hint },
      { prompt: "If the gap is much wider than the wavelength, is diffraction usually strong or weak?", acceptedAnswers: words("weak"), hint },
      { prompt: "Can light diffract?", acceptedAnswers: words("yes"), hint },
      { prompt: "Can water waves diffract?", acceptedAnswers: words("yes"), hint },
      { prompt: "What is the strongest everyday clue for diffraction?", acceptedAnswers: words("spreading after a gap", "wave spreading through a gap"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Make the judgment relative: narrow or wide only means something compared with the wavelength.";
  return [
    mc("Why is calling a gap 'narrow' by itself a weak diffraction explanation?", ["Because the gap must be judged relative to the wavelength", "Because all gaps are equally narrow", "Because diffraction depends only on amplitude", "Because gap size never matters"], 0, "Relative size is the real issue.", hint),
    mc("Wave P has wavelength 0.25 m and Wave Q has wavelength 0.05 m. Both meet a 0.30 m gap. Which spreads more?", ["Wave P", "Wave Q", "They spread equally", "Cannot be known"], 0, "0.25 m is much closer to 0.30 m.", hint),
    mc("A 0.12 m wavelength meets a 0.60 m gap and a 0.10 m gap. Which is the stronger diffraction case?", ["0.10 m gap", "0.60 m gap", "Neither", "They are equal"], 0, "0.10 m is comparable to 0.12 m.", hint),
    mc("Why is 'only sound diffracts around corners' a weak statement?", ["Because diffraction is a general wave behavior; sound is just one easy example", "Because sound never diffracts", "Because only water waves diffract", "Because corners stop all waves"], 0, "All waves can diffract.", hint),
    mc("Which is the best reason a long-wavelength wave often diffracts more at a fixed opening?", ["Its wavelength is more comparable to the opening size", "Its amplitude is always larger", "Its frequency is always higher", "Its speed must be lower"], 0, "Wavelength-opening comparison controls the spread.", hint),
    mc("Which statement is strongest?", ["Diffraction is strongest when opening size and wavelength are similar", "Diffraction is strongest for the largest possible opening", "Diffraction depends only on color", "Diffraction needs reflection first"], 0, "This is the central rule.", hint),
    mc("A radio wave and a visible-light wave meet the same opening. Which often diffracts more noticeably?", ["The radio wave", "The visible-light wave", "They always diffract equally", "Cannot be known"], 0, "Radio waves often have much longer wavelengths.", hint),
    mc("What is the safest upgrade to 'the wave spreads because the gap is small'?", ["The wave spreads strongly because the gap size is comparable to the wavelength", "The wave spreads because frequency disappears", "The wave spreads because amplitude doubles", "The wave spreads because it reflects from both sides"], 0, "Relative size gives the rigorous explanation.", hint),
    mc("Why can the same gap produce strong diffraction for one wave and weak diffraction for another?", ["Because the wavelengths can be different", "Because the gap changes shape for each wave", "Because only one wave carries energy", "Because diffraction ignores wavelength"], 0, "The comparison changes with wavelength.", hint),
    mc("What is the best contrast with refraction?", ["Diffraction is spreading at a gap or edge, while refraction is turning because speed changes in a new medium", "Diffraction and refraction are identical", "Diffraction uses equal angles to the normal", "Refraction depends only on gap width"], 0, "This keeps the wave processes distinct.", hint),
    shortCases([
      { prompt: "What is weak about calling a gap narrow without mentioning wavelength?", acceptedAnswers: words("because the gap must be compared with the wavelength", "because narrow is only meaningful relative to wavelength"), hint },
      { prompt: "Which spreads more at the same gap: a longer wavelength or a shorter wavelength?", acceptedAnswers: words("a longer wavelength", "longer wavelength"), hint },
      { prompt: "Do all waves diffract or only sound waves?", acceptedAnswers: words("all waves", "all waves can diffract"), hint },
      { prompt: "Why can the same gap give different diffraction for different waves?", acceptedAnswers: words("because their wavelengths are different", "because wavelength changes the comparison"), hint },
      { prompt: "What is the opening-size rule for strongest diffraction?", acceptedAnswers: words("opening size comparable to wavelength", "gap comparable to wavelength"), hint },
      { prompt: "What process spreads a wave after a gap?", acceptedAnswers: words("diffraction"), hint },
      { prompt: "What process turns a wave because it changes speed in a new medium?", acceptedAnswers: words("refraction"), hint },
      { prompt: "Would a very long-wavelength radio wave usually diffract more or less than visible light at the same opening?", acceptedAnswers: words("more"), hint },
      { prompt: "Is a 0.10 m gap or a 0.60 m gap more comparable to a 0.12 m wavelength?", acceptedAnswers: words("0.10 m gap", "the 0.10 m gap"), hint },
      { prompt: "What word describes the relation between gap size and wavelength in the strongest diffraction case?", acceptedAnswers: words("comparable", "similar"), hint },
    ]),
  ];
}

function diagnosticRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M7_L1":
      return l1DiagnosticRaw();
    case "M7_L2":
      return l2DiagnosticRaw();
    case "M7_L3":
      return l3DiagnosticRaw();
    case "M7_L4":
      return l4DiagnosticRaw();
    case "M7_L5":
      return l5DiagnosticRaw();
    case "M7_L6":
      return l6DiagnosticRaw();
    default:
      return [];
  }
}

function conceptRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M7_L1":
      return l1ConceptRaw();
    case "M7_L2":
      return l2ConceptRaw();
    case "M7_L3":
      return l3ConceptRaw();
    case "M7_L4":
      return l4ConceptRaw();
    case "M7_L5":
      return l5ConceptRaw();
    case "M7_L6":
      return l6ConceptRaw();
    default:
      return [];
  }
}

export function m7GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  return materializeBank(code, "diagnostic", diagnosticRaw(code));
}

export function m7GeneratedConceptGateItems(code: string): UnknownRecord[] {
  return materializeBank(code, "concept", conceptRaw(code));
}

export function m7GeneratedMasteryItems(code: string): UnknownRecord[] {
  return materializeBank(code, "mastery", [...diagnosticRaw(code), ...conceptRaw(code)]);
}
