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
type McSpec = [string, string[], number, string, string?];
type ShortSpec = { prompt: string; acceptedAnswers: string[]; hint?: string };

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function compactCode(code: string): string {
  return normalizeCode(code).replace("_", "");
}

function normalizePrompt(prompt: string): string {
  return String(prompt || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint = "Reconnect the lesson mechanism before choosing.",
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
}

function mcMany(defaultHint: string, specs: McSpec[]): RawItem[] {
  return specs.map(([prompt, choices, answerIndex, explanation, hint]) =>
    mc(prompt, choices, answerIndex, explanation, hint ?? defaultHint),
  );
}

function shortMany(defaultHint: string, specs: ShortSpec[]): RawItem[] {
  return specs.map((spec) => short(spec.prompt, spec.acceptedAnswers, spec.hint ?? defaultHint));
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
      return "DG";
    case "concept":
      return "CG";
    case "mastery":
      return "M";
    default:
      return "Q";
  }
}

function minimumSize(kind: BankKind): number {
  return kind === "mastery" ? 40 : 20;
}

function materializeBank(code: string, kind: BankKind, rawItems: RawItem[]): UnknownRecord[] {
  const seen = new Set<string>();
  const deduped = rawItems.flatMap((item, index) => {
    const signature = item.kind === "mc"
      ? `${normalizePrompt(item.prompt)}::${item.choices.map((choice) => normalizePrompt(choice)).join("|")}`
      : `${normalizePrompt(item.prompt)}::${item.acceptedAnswers.map((answer) => normalizePrompt(answer)).join("|")}`;
    if (!item.prompt || seen.has(signature)) return [];
    seen.add(signature);
    const id = `${compactCode(code)}-${stageLabel(kind)}-${String(index + 1).padStart(2, "0")}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`M14 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function exact(value: string, ...extra: string[]): string[] {
  return Array.from(new Set([value, ...extra]));
}

function combine(...groups: RawItem[][]): RawItem[] {
  return groups.flat();
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Classify by the source of the light before using appearance.";
  return [
    ...mcMany(hint, [
      ["Which statement best defines a star?", ["a self-luminous body powered by fusion", "a bright body that reflects sunlight", "a rocky body orbiting a star", "a moon seen at night"], 0, "A star is identified by making its own light through fusion."],
      ["Why can Venus look bright without being a star?", ["it reflects sunlight", "it contains fusion in its core", "it is the center of the Solar System", "it produces light by eclipses"], 0, "A planet can appear bright by reflecting light from a star."],
      ["What powers the Sun's light output?", ["nuclear fusion in the core", "reflection from Earth", "chemical burning", "Moonlight"], 0, "At this level the Sun is powered by fusion, not by reflection or ordinary burning."],
      ["Which object is best classified as a planet?", ["an object seen mainly by reflected starlight", "an object powered by fusion", "an object producing its own starlight", "an object at the center of a galaxy"], 0, "A planet is typically seen because it reflects starlight."],
      ["Which question is strongest when classifying a bright object in the sky?", ["Where does its light come from?", "How large does it look?", "What season is it?", "How close is the Moon?"], 0, "The physical source of the light is the key classification clue."],
      ["Why is brightness alone too weak to identify a star?", ["a reflective planet can look bright too", "stars are always blue", "planets never appear in the night sky", "all bright objects are nearby"], 0, "Apparent brightness does not tell you whether the body makes its own light."],
      ["A distant object produces its own light by fusion. It is a ...", ["star", "planet", "moon", "galaxy"], 0, "Fusion-powered self-luminosity is the defining star clue."],
      ["Which body is self-luminous at school level?", ["the Sun", "Venus", "Earth's Moon", "Mars"], 0, "The Sun is a star and makes its own light."],
      ["What is the main difference between a star and a planet in this lesson?", ["stars make their own light while planets mainly reflect it", "stars are always smaller", "planets are always hotter", "planets cannot be seen from Earth"], 0, "The lesson contrast is about light source, not size or visibility."],
      ["If two objects look equally bright, what is still needed before classifying them?", ["the physical source of the light", "their color only", "their distance from the Moon", "their season in the sky"], 0, "Equal brightness does not settle whether the light is produced or reflected."],
      ["Which statement about planets is strongest?", ["they can be visible without producing their own light", "they are self-luminous like stars", "they are powered by core fusion", "they are all brighter than stars"], 0, "Planets can be seen clearly even though they mostly reflect starlight."],
      ["What does self-luminous mean?", ["making its own light", "orbiting a star", "having a shadow", "being close to Earth"], 0, "Self-luminous means the body is the source of the light it emits."],
    ]),
    ...shortMany(hint, [
      { prompt: "A star makes its own ...", acceptedAnswers: exact("light") },
      { prompt: "A planet is usually seen by ... starlight.", acceptedAnswers: exact("reflected", "reflecting") },
      { prompt: "The Sun is powered by nuclear ...", acceptedAnswers: exact("fusion") },
      { prompt: "To classify a bright object, first ask where the ... comes from.", acceptedAnswers: exact("light") },
      { prompt: "Brightness alone does not prove an object is a ...", acceptedAnswers: exact("star") },
      { prompt: "Self-luminous means making your own ...", acceptedAnswers: exact("light") },
      { prompt: "A planet does not usually produce its own ...", acceptedAnswers: exact("light") },
      { prompt: "The strongest internal clue for a star is core ...", acceptedAnswers: exact("fusion") },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Keep apparent brightness separate from the physical source of the light.";
  return [
    ...mcMany(hint, [
      ["Why can a very distant star look dim and still be a star?", ["distance changes apparent brightness but not the light source", "dim objects cannot be stars", "stars stop being stars when far away", "only planets can look dim"], 0, "A star remains a star even when distance makes it appear faint."],
      ["Why can a nearby planet look brighter than a distant star?", ["reflection and distance can change apparent brightness", "planets are always hotter than stars", "planets produce fusion light", "stars cannot be seen near Earth"], 0, "Appearance can change with distance and reflection without changing the object's type."],
      ["Why is color alone too weak to classify an object as a star?", ["classification depends on light source, not just appearance", "all stars are the same color", "planets have no color", "color determines fusion rate directly"], 0, "A physical definition is stronger than a color label."],
      ["A bright object reflects starlight but has no fusion in its core. What is the strongest classification?", ["planet", "star", "galaxy", "constellation"], 0, "Without fusion and self-luminosity, the object is not a star."],
      ["Why is fusion a stronger clue than night-sky brightness?", ["fusion identifies the energy source directly", "fusion measures distance only", "brightness never changes with distance", "fusion tells the season"], 0, "Fusion explains why a star makes its own light."],
      ["A learner says, 'The brightest object must be a star.' Why is that weak?", ["a reflective planet can outshine a distant star", "stars cannot be bright", "planets are all self-luminous", "all stars are the same distance away"], 0, "Brightness ranking alone can misclassify planets as stars."],
      ["Why is the Sun still a star even in daylight?", ["it remains self-luminous regardless of when we view it", "daylight turns planets into stars", "daytime removes fusion", "stars exist only at night"], 0, "Classification depends on physics, not on the time of observation."],
      ["Why is 'large-looking object equals star' a weak rule?", ["apparent size can change with distance and does not reveal the light source", "all stars look larger than planets", "planets cannot look large", "distance does not affect appearance"], 0, "Apparent size is another appearance clue, not the core definition."],
      ["Why should reflected light be treated carefully in astronomy classification?", ["it can copy brightness from a star without the body being self-luminous", "it removes the need for spectra", "it proves fusion is happening", "it makes distance irrelevant"], 0, "Reflection can make a planet look star-like if the mechanism is ignored."],
      ["A cloud hides a star from view. What is the strongest statement?", ["it is still a star because the physical source has not changed", "it becomes a planet while hidden", "it stops producing light", "classification depends only on whether Earth can see it"], 0, "Observation conditions do not alter the object's physical type."],
      ["Which summary is strongest?", ["Classify stars by self-luminous fusion-powered light, not by appearance alone", "Classify stars by whichever object looks brightest", "Classify planets by color only", "Classify everything in space by size in the sky"], 0, "This keeps the lesson's cause-and-effect language intact."],
      ["Why is reflected starlight a weaker clue than core fusion?", ["reflection depends on another light source while fusion is the object's own source", "reflection proves a star is nearby", "fusion is only a color effect", "reflection never changes apparent brightness"], 0, "Fusion identifies the body itself, while reflection depends on external lighting."],
    ]),
    ...shortMany(hint, [
      { prompt: "A far star can appear dim because of ...", acceptedAnswers: exact("distance") },
      { prompt: "A near planet can look bright by ... sunlight.", acceptedAnswers: exact("reflecting", "reflected") },
      { prompt: "Classification should be based on energy ...", acceptedAnswers: exact("source") },
      { prompt: "Apparent size and apparent brightness both depend on ...", acceptedAnswers: exact("distance") },
      { prompt: "Planets seen at night are usually visible by ... starlight.", acceptedAnswers: exact("reflected", "reflecting") },
      { prompt: "The Sun is still a star because it is self-...", acceptedAnswers: exact("luminous") },
      { prompt: "A reflective body can seem bright without core ...", acceptedAnswers: exact("fusion") },
      { prompt: "In this lesson, appearance is weaker than physical ...", acceptedAnswers: exact("source", "cause") },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Track the stage and the stellar mass together.";
  return [
    ...mcMany(hint, [
      ["Stars are formed from a cloud of gas and dust called a ...", ["nebula", "galaxy", "planet", "phase"], 0, "A nebula is the starting cloud for star formation."],
      ["Which stage comes after protostar in a simple school-level lifecycle?", ["main sequence", "black hole", "galaxy", "redshift"], 0, "After the protostar stage, a star reaches the long main-sequence stage."],
      ["What mainly determines the later path of a star?", ["its initial mass", "its color alone", "the number of planets", "the phase of the Moon"], 0, "Mass is the key branching variable in stellar evolution."],
      ["Which remnant is most likely for a low-mass star?", ["white dwarf", "black hole", "galaxy", "nebula"], 0, "At this level, low-mass stars end as white dwarfs."],
      ["Which event belongs to the high-mass stellar route?", ["supernova", "planetary nebula only", "Moon phase", "solar eclipse"], 0, "A supernova is part of the high-mass stellar pathway."],
      ["After a supernova, a compact remnant can be a ...", ["neutron star", "planet", "light-year", "constellation"], 0, "A neutron star is one common compact remnant after supernova."],
      ["Which route is the stronger low-mass sequence?", ["red giant to white dwarf", "red supergiant to black hole only", "main sequence to galaxy", "protostar to redshift"], 0, "Low-mass stars swell to red giants and end as white dwarfs."],
      ["Which route is the stronger high-mass sequence?", ["red supergiant to supernova", "planet to moon", "white dwarf to nebula", "galaxy to universe"], 0, "High-mass stars can become red supergiants and then explode as supernovae."],
      ["Why do not all stars share the same ending?", ["different masses produce different later paths", "all stars stop existing in the same way", "the Sun controls every remnant", "galaxies choose the ending"], 0, "The lesson's main mechanism is that mass changes the later branch."],
      ["What is a stellar remnant?", ["the compact leftover after a star finishes its main life", "the cloud before star formation", "the average brightness of a star", "the distance to a star"], 0, "A remnant is what is left behind at the end of the main stellar story."],
      ["Which stage is usually the long steady phase of a star's life?", ["main sequence", "supernova", "black hole", "nebula"], 0, "Main sequence is the long stable fusion stage."],
      ["Which outcome is most plausible for a very massive star after supernova?", ["black hole", "ordinary planet", "main sequence star", "Moon"], 0, "Very large remaining mass can produce a black hole."],
    ]),
    ...shortMany(hint, [
      { prompt: "Stars begin in a ...", acceptedAnswers: exact("nebula") },
      { prompt: "The common stable fusion stage before the branch is the main ...", acceptedAnswers: exact("sequence") },
      { prompt: "The later path depends mainly on stellar ...", acceptedAnswers: exact("mass") },
      { prompt: "A low-mass star can end as a white ...", acceptedAnswers: exact("dwarf") },
      { prompt: "A high-mass star may explode as a ...", acceptedAnswers: exact("supernova") },
      { prompt: "A compact remnant after some supernovae is a neutron ...", acceptedAnswers: exact("star") },
      { prompt: "A very massive stellar remnant can be a black ...", acceptedAnswers: exact("hole") },
      { prompt: "The dense leftover after the main life is a ...", acceptedAnswers: exact("remnant") },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Read the lifecycle as a mass-dependent branch, not one flat list.";
  return [
    ...mcMany(hint, [
      ["Why is 'all stars end as white dwarfs' a weak statement?", ["high-mass stars can go through supernova and leave different remnants", "white dwarfs are galaxies", "all stars avoid the main sequence", "stars never leave nebulae"], 0, "A white-dwarf ending belongs mainly to the low-mass route."],
      ["Why must stellar mass stay visible in the explanation?", ["the early stages overlap but the later stages branch by mass", "mass only changes the color label", "mass decides the Moon phase", "mass is irrelevant after protostar"], 0, "Mass is the cause of the later branching."],
      ["Star X has 1 solar mass and Star Y has 20 solar masses. Which one can plausibly go supernova?", ["Star Y", "Star X", "both must become white dwarfs", "neither can leave the main sequence"], 0, "A very massive star is the one that can follow the supernova route."],
      ["Why can a low-mass star not simply be assigned a black-hole ending at this level?", ["its mass is too small for the high-mass collapse route", "black holes form before the main sequence", "white dwarfs always explode", "all stars have identical remnants"], 0, "The lesson keeps black holes on the very-high-mass branch."],
      ["Why is the main-sequence stage shown in both low-mass and high-mass routes?", ["it is the long common fusion stage before the later branch", "every star becomes a black hole there", "it is the explosion stage", "it comes after the remnant"], 0, "The shared middle stage must stay visible before the lifecycle splits."],
      ["Why is a flat list of stage names weaker than a branched diagram?", ["it hides the mass-dependent change in later outcomes", "it proves all stars have the same mass", "it removes the nebula stage from astronomy", "it makes planets into stars"], 0, "A flat list can blur together routes that should stay distinct."],
      ["What is the stronger comparison between a low-mass and a high-mass star?", ["compare their shared early stages and then follow the different later branches", "compare only their apparent brightness", "ignore the main sequence entirely", "give both the same remnant"], 0, "A good comparison keeps both the overlap and the branch."],
      ["What decides whether a supernova remnant is more likely to be a neutron star or a black hole?", ["how much mass remains in the collapsed core", "the phase of the Moon", "the number of planets around the star", "the galaxy's color"], 0, "Remaining mass is the key compact-remnant clue."],
      ["Why is 'supernova is the normal ending for every star' too weak?", ["many stars are too low in mass for the supernova route", "supernova happens before protostar", "white dwarfs always explode later", "all stars finish in one year"], 0, "Supernova is not the default ending for the whole stellar population."],
      ["Which order is strongest for the start of stellar evolution?", ["nebula to protostar to main sequence", "main sequence to nebula to white dwarf", "black hole to protostar to galaxy", "supernova to Moon phase to remnant"], 0, "The early formation order should stay causally correct."],
      ["Which summary is strongest?", ["stellar mass changes the later route and remnant even though many stars share early stages", "all stars differ from the first stage onward", "every star has the same remnant", "remnants depend only on galaxy size"], 0, "This summary preserves both the shared and branching parts of the lifecycle."],
      ["Why is core fusion not enough by itself to predict the final remnant?", ["many stars fuse for a long time, but the later outcome depends on mass", "fusion happens only in white dwarfs", "fusion guarantees a black hole", "fusion stops the star from changing"], 0, "Fusion explains the star stage, but mass explains the later branch."],
    ]),
    ...shortMany(hint, [
      { prompt: "Stellar lifecycle is a mass-dependent ...", acceptedAnswers: exact("branch", "pathway", "path") },
      { prompt: "Low- and high-mass stars share early ...", acceptedAnswers: exact("stages", "stage") },
      { prompt: "Supernova belongs to the ...-mass route.", acceptedAnswers: exact("high") },
      { prompt: "White dwarf belongs to the ...-mass route.", acceptedAnswers: exact("low") },
      { prompt: "The long steady fusion stage is the main ...", acceptedAnswers: exact("sequence") },
      { prompt: "A black hole requires very large remaining ...", acceptedAnswers: exact("mass") },
      { prompt: "A flat list hides the later ... in the lifecycle.", acceptedAnswers: exact("branching", "branch") },
      { prompt: "The object left behind is the stellar ...", acceptedAnswers: exact("remnant") },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Separate star, Solar System, galaxy, and universe by scale and gravity.";
  return [
    ...mcMany(hint, [
      ["Which definition best fits a galaxy?", ["a gravitationally bound system of many stars, gas, and dust", "one star and its planets only", "the whole universe", "a Moon orbit"], 0, "A galaxy contains many stars and is held together by gravity."],
      ["What is the Milky Way?", ["our home galaxy", "our Solar System", "one planet", "a light-year"], 0, "The Milky Way is the galaxy that contains the Solar System."],
      ["Where does the Solar System fit?", ["inside the Milky Way", "outside all galaxies", "equal to the whole universe", "at the center of every galaxy"], 0, "The Solar System is a very small part of the Milky Way."],
      ["Which statement about scale is strongest?", ["a galaxy is far larger than a Solar System but smaller than the universe", "a galaxy is smaller than a star", "a Solar System is larger than the universe", "the Milky Way equals one planet"], 0, "Galaxy, Solar System, and universe belong to different scale levels."],
      ["What holds a galaxy together as one physical system?", ["gravity", "chemical burning", "Moon phases", "eclipses"], 0, "Gravity is the binding idea in the galaxy definition."],
      ["How should the Sun be classified inside the Milky Way?", ["as one star", "as the whole galaxy", "as the whole universe", "as a remnant only"], 0, "The Sun is one star inside a much larger galactic system."],
      ["What does the universe contain at this level?", ["many galaxies", "only the Milky Way", "only the Solar System", "only one star"], 0, "The universe is larger than any single galaxy."],
      ["Why is 'the Milky Way is just another name for the Solar System' weak?", ["a galaxy contains many star systems, not just ours", "the Sun is outside the Milky Way", "the universe has no galaxies", "a Solar System contains billions of galaxies"], 0, "The Solar System is one local system inside the Milky Way."],
      ["Which object is best described as one star among many billions?", ["the Sun", "the Milky Way", "the universe", "a light-year"], 0, "The Sun is one star, not the whole galaxy."],
      ["Which statement about Andromeda is strongest at this level?", ["it is another galaxy", "it is our Solar System", "it is the Sun's orbit", "it is a Moon phase"], 0, "Andromeda is another galaxy, not a local Solar System body."],
      ["Which order is correct from small to large?", ["star, Solar System, galaxy, universe", "universe, galaxy, star, Solar System", "Solar System, star, universe, galaxy", "galaxy, planet, universe, star"], 0, "The hierarchy must keep the scale levels in order."],
      ["Why is the universe not the same thing as the Milky Way?", ["the universe contains many galaxies", "the Milky Way contains many universes", "the Milky Way is smaller than a planet", "the universe is one star"], 0, "One galaxy is not the whole universe."],
    ]),
    ...shortMany(hint, [
      { prompt: "A galaxy is held together by ...", acceptedAnswers: exact("gravity") },
      { prompt: "The Milky Way contains our Solar ...", acceptedAnswers: exact("System", "system") },
      { prompt: "The Sun is one ... in the Milky Way.", acceptedAnswers: exact("star") },
      { prompt: "The universe contains many ...", acceptedAnswers: exact("galaxies", "galaxy") },
      { prompt: "A galaxy has many ... not just one.", acceptedAnswers: exact("stars", "star") },
      { prompt: "The Solar System is a tiny part of the ...", acceptedAnswers: exact("Milky Way", "milky way") },
      { prompt: "The Milky Way is our home ...", acceptedAnswers: exact("galaxy") },
      { prompt: "A galaxy is larger than a Solar ...", acceptedAnswers: exact("System", "system") },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Use the hierarchy and the gravity-bound definition together.";
  return [
    ...mcMany(hint, [
      ["A student says, 'The Milky Way is the same as our Solar System, just written bigger.' What is the stronger correction?", ["The Milky Way is a galaxy containing many star systems, including ours", "The Milky Way is the Sun only", "The Milky Way is the whole universe", "The Solar System contains many galaxies"], 0, "The Solar System is one tiny part of the Milky Way."],
      ["Why is gravity part of the galaxy definition?", ["it explains why the stars, gas, and dust count as one physical system", "it decides the Moon phase", "it makes every star identical", "it replaces the need for stars"], 0, "A galaxy is not just a naming list; it is a bound system."],
      ["Why can the Sun not be the Milky Way?", ["the Sun is one star, while the Milky Way contains vast numbers of stars", "the Sun is a planet", "the Milky Way is smaller than the Sun", "stars cannot sit inside galaxies"], 0, "The scale difference is enormous."],
      ["Why is 'the universe equals the Milky Way' weak?", ["the universe contains many galaxies, not only ours", "the Milky Way contains every universe", "galaxies are smaller than stars", "the universe has no structure"], 0, "The universe sits at a higher scale than any single galaxy."],
      ["Which hierarchy is strongest?", ["star system inside galaxy inside universe", "universe inside galaxy inside Solar System", "galaxy inside star inside universe", "star inside Solar System inside planet"], 0, "The levels must be nested in the correct order."],
      ["Why is 'any bright thing in the sky is a galaxy' too weak?", ["a single star can look bright without being a galaxy", "galaxies contain no stars", "brightness always proves distance", "only planets can be seen"], 0, "Brightness alone does not identify the scale of the object."],
      ["Why is the Solar System not enough to define a galaxy?", ["a galaxy includes many stars and systems, not just one star and its planets", "a Solar System is always larger than a galaxy", "galaxies have no gravity", "the Sun sits outside all galaxies"], 0, "A Solar System is one local example, not the whole galactic structure."],
      ["If an object contains billions of stars plus gas and dust, what is the strongest classification?", ["galaxy", "single star", "planetary orbit", "Moon phase"], 0, "Many stars plus gravity-bound structure is the galaxy clue."],
      ["Why is 'the Milky Way contains every object in the universe' a weak claim?", ["other galaxies also exist", "the Milky Way is smaller than Earth", "the Milky Way is a light-year", "the universe contains no galaxies"], 0, "A single galaxy cannot contain the whole universe."],
      ["What question best distinguishes a galaxy from a star?", ["Does it contain many stars held together by gravity?", "Is it visible at night?", "Is it round?", "Is it near Earth?"], 0, "This question tests the correct scale and mechanism."],
      ["Which summary is strongest?", ["A galaxy is a gravity-bound system much larger than one Solar System, and the Milky Way is our home galaxy", "The Milky Way and the Solar System are interchangeable terms", "The universe is one galaxy only", "The Sun is the whole Milky Way"], 0, "This summary keeps the module's scale logic intact."],
      ["Why does the word 'system' matter in the galaxy definition?", ["it shows the components belong to one bound structure rather than a random list", "it means every galaxy has only one star", "it removes gravity from the picture", "it makes the universe smaller"], 0, "The physical relationship between parts matters, not just the names."],
    ]),
    ...shortMany(hint, [
      { prompt: "A galaxy is a gravitationally ... system.", acceptedAnswers: exact("bound") },
      { prompt: "The Solar System is one tiny part of the ...", acceptedAnswers: exact("Milky Way", "milky way") },
      { prompt: "The universe is ... than one galaxy.", acceptedAnswers: exact("larger", "bigger") },
      { prompt: "The Sun is a ... not a galaxy.", acceptedAnswers: exact("star") },
      { prompt: "The Milky Way is one ... among many in the universe.", acceptedAnswers: exact("galaxy") },
      { prompt: "Gravity keeps a galaxy ...", acceptedAnswers: exact("together", "bound") },
      { prompt: "The scale order ends with the ...", acceptedAnswers: exact("universe") },
      { prompt: "One star and its planets make a star ...", acceptedAnswers: exact("system") },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep the unit meaning and the distance calculation together.";
  return [
    ...mcMany(hint, [
      ["What does a light-year measure?", ["distance", "time", "mass", "temperature"], 0, "A light-year is a distance unit even though the word year appears in the name."],
      ["What is one light-year?", ["the distance light travels in one year", "the time light needs to cross Earth", "the mass of a star after one year", "the brightness of a galaxy"], 0, "The unit comes from distance = speed x time for light."],
      ["Which relation underlies the definition of a light-year?", ["distance = speed x time", "force = mass x acceleration", "current = charge x time", "pressure = force x area"], 0, "A light-year is built from how far light travels in a given time."],
      ["Using c = 3.0 x 10^8 m/s and 1 year = 3.15 x 10^7 s, what is 1 light-year approximately?", ["9.45 x 10^15 m", "9.45 x 10^7 m", "9.45 x 10^3 m", "3.15 x 10^15 m"], 0, "Multiplying c by one year gives about 9.45 x 10^15 m."],
      ["Which unit is most suitable for the distance to a nearby star?", ["light-year", "millimetre", "gram", "newton"], 0, "Interstellar distances are so large that light-years are convenient."],
      ["A star is 4.2 light-years away. What does that mean?", ["light from the star takes about 4.2 years to reach us", "the star is 4.2 years old", "the star moves 4.2 times each year", "the star has a mass of 4.2 years"], 0, "The number tells you the distance by using light-travel time."],
      ["Why are kilometres awkward for star distances?", ["the numbers become extremely large", "kilometres stop working in space", "light cannot travel in kilometres", "stars have no distance"], 0, "Kilometres still work physically, but the numbers are unwieldy."],
      ["Which star is farther away?", ["the one at 10 light-years", "the one at 2 light-years", "they are the same distance", "light-year cannot compare distances"], 0, "A larger light-year value means a greater distance."],
      ["What does the symbol c represent in the light-year definition?", ["speed of light", "charge", "specific heat capacity", "centripetal force"], 0, "c is the speed of light in vacuum."],
      ["Why is the word year potentially misleading in light-year?", ["because the unit still answers a distance question, not a time question", "because it is actually a force unit", "because astronomy does not use time", "because stars do not emit light"], 0, "The defining time interval is used to construct a distance unit."],
      ["Compared with 1 AU, 1 light-year is ...", ["much larger", "much smaller", "exactly equal", "a unit of mass instead"], 0, "A light-year is far larger than Solar System distance units such as AU."],
      ["Which question does a light-year answer most directly?", ["How far?", "How massive?", "How hot?", "How bright?"], 0, "Light-year is a distance unit."],
    ]),
    ...shortMany(hint, [
      { prompt: "A light-year is a unit of ...", acceptedAnswers: exact("distance") },
      { prompt: "Use distance = ... x time.", acceptedAnswers: exact("speed") },
      { prompt: "The symbol c stands for the speed of ...", acceptedAnswers: exact("light") },
      { prompt: "The word year in light-year does not make it a unit of ...", acceptedAnswers: exact("time") },
      { prompt: "Astronomy uses light-years because distances are very ...", acceptedAnswers: exact("large", "huge") },
      { prompt: "4.2 light-years means light takes 4.2 ... to arrive.", acceptedAnswers: exact("years", "year") },
      { prompt: "A light-year answers how ..., not how long.", acceptedAnswers: exact("far") },
      { prompt: "One light-year is much bigger than one astronomical ...", acceptedAnswers: exact("unit", "au") },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Do not let the word year hide the fact that the unit measures distance.";
  return [
    ...mcMany(hint, [
      ["Why is 'light-year is a time unit because year is in the name' a weak statement?", ["the time interval is used to define a distance, not the quantity measured", "light cannot travel for a year", "astronomy avoids time completely", "years always mean mass"], 0, "The word year is part of the definition, but the unit answers a distance question."],
      ["Why does the light-year definition use distance = speed x time?", ["because it turns the known speed of light and one year of travel into a distance", "because it calculates mass from brightness", "because it removes the need for distance units", "because it measures temperature"], 0, "The definition is built from the standard motion relation."],
      ["Why are light-years often better than kilometres for interstellar scales?", ["they avoid extremely large kilometre values", "kilometres cannot be used outside Earth", "light-years measure time more accurately", "stars emit in light-years only"], 0, "The advantage is convenience on very large scales."],
      ["A star is 12 light-years away and another is 8 light-years away. Which statement is strongest?", ["the 12 light-year star is farther away", "the 8 light-year star is farther away", "they are the same distance", "light-year values cannot be compared"], 0, "A larger light-year number means a larger distance."],
      ["If light from a star has travelled for about 6 years before reaching Earth, the distance is roughly ...", ["6 light-years", "6 AU", "6 kilograms", "6 volts"], 0, "Light-year is defined from one year of light travel."],
      ["Why is 'the star is 100 light-years old' incorrect?", ["light-year is a distance unit, not an age unit", "stars cannot be older than one year", "age is measured in metres", "light-year measures mass"], 0, "Using light-year for age is a unit mistake."],
      ["Why is a light-year especially helpful inside our galaxy?", ["star separations are far larger than Solar System scales", "galaxies remove the speed of light", "light-year is smaller than kilometre", "the Milky Way is measured only in seconds"], 0, "Galactic distances are large enough that a bigger unit is useful."],
      ["If an object is 0.5 light-year away, about how long does its light take to reach us?", ["half a year", "half a second", "five years", "no time at all"], 0, "The light-travel time matches the distance value in light-years."],
      ["Which relation is strongest for 1 light-year?", ["about 9.46 x 10^15 m", "about 9.46 x 10^3 m", "about 1 m", "about 9.46 x 10^8 m"], 0, "The light-year is enormous in metres."],
      ["Why is AU less useful than light-year for nearby stars?", ["AU is convenient inside the Solar System but becomes too small for interstellar distances", "AU measures mass not distance", "AU is larger than a galaxy", "AU cannot be compared with light-year"], 0, "Different scales call for different distance units."],
      ["Why are 'light takes four years' and 'distance is four light-years' linked but not identical statements?", ["one gives the travel time while the other names the distance unit built from that travel", "they are about different stars only", "one is about mass and one is about force", "they are unrelated"], 0, "The first is a travel-time statement; the second is the corresponding distance statement."],
      ["Which summary is strongest?", ["A light-year is a large astronomy distance unit built from the speed of light and one year of travel", "A light-year is an age unit for stars", "A light-year replaces metres everywhere", "A light-year measures brightness"], 0, "This summary keeps both the formula basis and the unit meaning visible."],
    ]),
    ...shortMany(hint, [
      { prompt: "Unit misuse happens when light-year is treated as ...", acceptedAnswers: exact("time", "age") },
      { prompt: "A light-year comes from speed x ...", acceptedAnswers: exact("time") },
      { prompt: "Interstellar distances need a much ... unit than kilometre.", acceptedAnswers: exact("larger", "bigger") },
      { prompt: "6 light-years means light has travelled for 6 ...", acceptedAnswers: exact("years", "year") },
      { prompt: "The distance unit is built from the speed of ...", acceptedAnswers: exact("light") },
      { prompt: "Astronomy uses AU inside the Solar System but ... for stars.", acceptedAnswers: exact("light-years", "light-year") },
      { prompt: "A larger number of light-years means a ... star.", acceptedAnswers: exact("farther", "further", "more distant") },
      { prompt: "The key question answered by light-year is how ...", acceptedAnswers: exact("far") },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Compare emitted and observed wavelength before naming the trend.";
  return [
    ...mcMany(hint, [
      ["What does redshift mean?", ["the observed wavelength is longer than the emitted wavelength", "the light is always brighter than before", "the source temperature must be lower", "the galaxy has stopped moving"], 0, "Redshift is a shift to longer observed wavelength."],
      ["Which formula gives redshift z?", ["z = (lambda_observed - lambda_emitted) / lambda_emitted", "z = lambda_emitted / lambda_observed", "z = lambda_observed + lambda_emitted", "z = distance / time"], 0, "School-level redshift compares the wavelength change with the emitted wavelength."],
      ["A line is emitted at 500 nm and observed at 550 nm. What is z?", ["0.10", "0.50", "1.10", "50"], 0, "The wavelength change is 50 nm, so z = 50 / 500 = 0.10."],
      ["What does a positive redshift usually suggest at this level?", ["the galaxy is moving away", "the galaxy is moving toward us", "the galaxy has no wavelength", "the galaxy is inside the Solar System"], 0, "Positive redshift is the usual recession clue."],
      ["What trend is commonly seen for very distant galaxies?", ["farther galaxies usually show larger redshifts", "farther galaxies always show zero redshift", "distance has no link to redshift", "nearer galaxies always have larger redshifts"], 0, "The lesson ties larger distance to larger redshift trend."],
      ["Redshift is mainly a change in ...", ["wavelength", "mass", "charge", "temperature only"], 0, "The measured change is in wavelength."],
      ["If a spectral line is emitted at 400 nm and observed at 400 nm, what is z?", ["0", "1", "400", "cannot be defined"], 0, "No shift means zero redshift."],
      ["If the observed wavelength were shorter than the emitted wavelength, the shift would be ...", ["toward blue", "toward red", "no shift", "a supernova"], 0, "A shorter observed wavelength corresponds to blueshift."],
      ["Which quantity must be compared to calculate redshift?", ["emitted and observed wavelengths of the same line", "distance and mass", "time and force", "brightness and orbit"], 0, "Redshift is measured by comparing the same spectral line before and after observation."],
      ["Why are spectral lines useful in redshift work?", ["their positions can be compared accurately with known emitted wavelengths", "they remove the need for telescopes", "they measure mass directly", "they cause galaxies to expand"], 0, "The line positions give a quantitative wavelength comparison."],
      ["What does z = 0.2 mean most directly?", ["the observed wavelength is 20% larger than the emitted wavelength", "the emitted wavelength is zero", "the galaxy is 20 light-years away", "the galaxy is not moving"], 0, "Redshift is a fractional wavelength increase."],
      ["Which statement is strongest?", ["redshift evidence supports the idea of an expanding universe", "redshift proves galaxies are made of red material", "redshift is only a brightness change", "redshift means the source is a planet"], 0, "The lesson uses redshift as evidence for cosmic expansion."],
    ]),
    ...shortMany(hint, [
      { prompt: "Redshift means longer observed ...", acceptedAnswers: exact("wavelength", "wavelengths") },
      { prompt: "Positive redshift suggests motion ...", acceptedAnswers: exact("away", "away from us") },
      { prompt: "The symbol z compares wavelength ...", acceptedAnswers: exact("change", "shift") },
      { prompt: "Farther galaxies usually show ... redshift.", acceptedAnswers: exact("larger", "greater", "more") },
      { prompt: "A stretched wave has larger ...", acceptedAnswers: exact("wavelength", "wavelengths") },
      { prompt: "If observed and emitted wavelengths are equal, z = ...", acceptedAnswers: exact("0", "zero") },
      { prompt: "Redshift is not mainly about light ...", acceptedAnswers: exact("brightness") },
      { prompt: "Spectral lines shift toward the ... end for redshift.", acceptedAnswers: exact("red") },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Treat redshift as a measurable wavelength-stretch effect, not a vague color slogan.";
  return [
    ...mcMany(hint, [
      ["Why is 'a galaxy just looks redder' a weak explanation of redshift?", ["the key evidence is the shift of known spectral lines to longer wavelengths", "all galaxies are painted red", "brightness automatically gives the wavelength", "red light has no wavelength"], 0, "The rigorous clue is the measured line shift, not a casual color impression."],
      ["Why does a larger redshift for farther galaxies support cosmic expansion?", ["it shows a systematic wavelength-stretch trend with distance", "it proves distance removes gravity", "it means only far galaxies emit red light", "it shows galaxies stop moving"], 0, "The trend is the evidence, not the color word by itself."],
      ["Why is a drop in brightness not the same as redshift?", ["brightness and wavelength are different measured quantities", "brightness always determines wavelength exactly", "redshift is about shadow only", "faint light has no spectrum"], 0, "Redshift changes wavelength, not merely how bright the source looks."],
      ["A line is emitted at 500 nm and observed at 600 nm. What is z?", ["0.20", "0.10", "1.20", "100"], 0, "The change is 100 nm, so z = 100 / 500 = 0.20."],
      ["Why does positive z suggest recession at school level?", ["the observed wavelength is stretched compared with the emitted wavelength", "the source has lost all energy", "the galaxy must be turning blue", "the line no longer exists"], 0, "A stretched wavelength is the redshift clue."],
      ["Why does the formula divide by the emitted wavelength?", ["to express the change as a fractional shift", "to convert wavelength into mass", "to remove the observed wavelength", "to calculate galaxy brightness"], 0, "z is a relative wavelength increase, not just an absolute change."],
      ["Why is 'redshift proves the galaxy is cooler' too weak in cosmology?", ["the lesson is about a shift in measured wavelength, not simply temperature", "cool objects emit no light", "temperature always equals distance", "cooling creates galaxies"], 0, "Here the redshift is interpreted as a change in observed wavelength pattern."],
      ["If z = 0, what is the strongest statement?", ["there is no wavelength shift in that line", "the galaxy has infinite distance", "the line has disappeared", "the source must be a planet"], 0, "Zero redshift means no measured shift in wavelength."],
      ["Which observation is strongest for measuring redshift?", ["comparing the same spectral line in the laboratory and in galaxy light", "judging the galaxy's color by eye", "comparing its brightness with the Moon", "counting the number of stars"], 0, "A line-by-line wavelength comparison is the rigorous method."],
      ["Why is a spectral-line shift stronger evidence than image color alone?", ["image color can be affected by many things, but line positions give a direct wavelength comparison", "spectral lines are always brighter", "image color has no physics", "image color measures mass"], 0, "The measured shift of known lines is the stronger scientific test."],
      ["Which summary is strongest?", ["Redshift is a fractional increase in observed wavelength that is measured from spectral lines", "Redshift is just any dim red-looking galaxy", "Redshift measures galaxy mass directly", "Redshift means the source has stopped emitting light"], 0, "This summary keeps both the measurement and the interpretation clear."],
      ["Why should the emitted wavelength be kept visible in every redshift calculation?", ["without it you cannot tell how large the fractional shift is", "the observed wavelength alone gives z directly", "emitted wavelength sets the galaxy mass", "redshift does not need a reference"], 0, "The emitted value is the reference against which the shift is judged."],
    ]),
    ...shortMany(hint, [
      { prompt: "To measure redshift, compare ... and observed wavelengths.", acceptedAnswers: exact("emitted", "emitted wavelength", "the emitted") },
      { prompt: "Redshift is a wavelength-... effect.", acceptedAnswers: exact("stretch", "stretching") },
      { prompt: "A larger z means a larger fractional ... in wavelength.", acceptedAnswers: exact("increase", "change", "shift") },
      { prompt: "The comparison must use the same spectral ...", acceptedAnswers: exact("line") },
      { prompt: "Positive z means the observed wavelength is ...", acceptedAnswers: exact("longer") },
      { prompt: "Image color alone is weaker than spectral ... evidence.", acceptedAnswers: exact("line", "line-shift", "line shift") },
      { prompt: "z = 0 means no wavelength ...", acceptedAnswers: exact("shift", "change") },
      { prompt: "Farther galaxies usually sit higher on the redshift ...", acceptedAnswers: exact("trend", "relation") },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Keep the hot dense early state, expansion language, and Hubble trend together.";
  return [
    ...mcMany(hint, [
      ["Which statement best describes the Big Bang model at this level?", ["the universe expanded from an earlier hot dense state", "one star exploded inside empty space", "the Solar System formed the whole universe", "all galaxies are fixed and unmoving"], 0, "The school-level model is an expanding universe from a hot dense early state."],
      ["Why is 'ordinary explosion from one point into empty space' too weak?", ["the model is better described as expansion of space itself", "the Big Bang contains no matter", "all explosions create galaxies", "space did not exist before telescopes"], 0, "The lesson contrasts expanding space with everyday explosion language."],
      ["What does Hubble's law relate?", ["recession speed and distance", "mass and temperature", "orbit and charge", "brightness and shadow"], 0, "Hubble's law links how fast a galaxy recedes to how far away it is."],
      ["Using H0 = 70 km s^-1 Mpc^-1, what is the recession speed of a galaxy 200 Mpc away?", ["14,000 km/s", "140 km/s", "35,000 km/s", "70 km/s"], 0, "v = H0 d = 70 x 200 = 14,000 km/s."],
      ["Which galaxy is expected to recede faster according to Hubble's law?", ["the one at 300 Mpc", "the one at 100 Mpc", "both must have the same speed", "distance gives no clue"], 0, "A larger distance gives a larger recession speed in the simple model."],
      ["Which observation supports the expanding-universe model?", ["distant galaxies commonly show redshift", "the Moon changes phase", "planets reflect sunlight", "stars form in nebulae"], 0, "Cosmological redshift is the lesson's key evidence line."],
      ["What does H0 stand for?", ["the Hubble constant", "the heating constant", "the hydrogen number", "the horizon phase"], 0, "H0 is the proportionality constant in Hubble's law."],
      ["If most distant galaxies show redshift, what does that suggest?", ["space is expanding and galaxies are receding on the large-scale trend", "all galaxies orbit Earth", "the universe is shrinking", "stars have stopped emitting light"], 0, "The redshift trend is read as evidence for large-scale expansion."],
      ["Why is the Big Bang not just an explosion from one special place?", ["the model describes expanding space rather than fragments flying from a fixed center", "the universe contains no distance trend", "explosions cannot involve hot matter", "galaxies do not move"], 0, "The lesson protects expanding-space language against everyday explosion language."],
      ["Which proportionality belongs to Hubble's law?", ["v is proportional to d", "v is proportional to 1/d", "v is proportional to mass only", "v is independent of d"], 0, "Recession speed increases with distance in the simple Hubble model."],
      ["Which summary is strongest?", ["farther galaxies usually recede faster, supporting an expanding-universe model", "only nearby planets show motion", "Big Bang means the Sun exploded", "redshift has no link to cosmology"], 0, "This keeps the evidence and the model connected."],
      ["Why is a straight distance-speed trend important?", ["it gives a quantitative pattern rather than a vague story", "it proves galaxies are planets", "it removes the need for spectra", "it shows stars never change"], 0, "A measurable pattern is stronger than a slogan."],
    ]),
    ...shortMany(hint, [
      { prompt: "The Big Bang model starts from a hot, ... state.", acceptedAnswers: exact("dense") },
      { prompt: "Hubble's law links recession speed to ...", acceptedAnswers: exact("distance") },
      { prompt: "A farther galaxy usually has a larger recession ...", acceptedAnswers: exact("speed", "velocity") },
      { prompt: "Redshift is evidence for cosmic ...", acceptedAnswers: exact("expansion") },
      { prompt: "The Big Bang is better described as expanding ...", acceptedAnswers: exact("space") },
      { prompt: "In Hubble's law, H0 is the Hubble ...", acceptedAnswers: exact("constant") },
      { prompt: "A straight distance-speed trend supports an expanding ...", acceptedAnswers: exact("universe") },
      { prompt: "The model is not just an ... into empty space.", acceptedAnswers: exact("explosion", "ordinary explosion") },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Use the model language and the distance-speed evidence together.";
  return [
    ...mcMany(hint, [
      ["Why is 'the Big Bang was just an ordinary explosion into empty space' a weak explanation?", ["the model describes space expanding, not debris moving into pre-existing emptiness from one fixed center", "the universe contains no galaxies", "all explosions are impossible", "redshift removes the need for space"], 0, "The lesson asks for expanding-space language rather than everyday explosion language."],
      ["Why is Hubble's law stronger than the slogan 'farther means faster'?", ["it gives a quantitative proportional relation between recession speed and distance", "it removes distance from astronomy", "it only applies to planets", "it replaces all evidence with one word"], 0, "A relation is stronger than a slogan because it can be used and tested."],
      ["Using H0 = 70 km s^-1 Mpc^-1, what speed is predicted for a galaxy 50 Mpc away?", ["3,500 km/s", "35 km/s", "1,400 km/s", "7,000 km/s"], 0, "v = 70 x 50 = 3,500 km/s."],
      ["Why does a larger redshift for more distant galaxies fit the expansion model?", ["it matches the trend that more distant galaxies recede faster on the large-scale pattern", "it proves Earth is the unique center", "it shows gravity has switched off", "it means galaxies are cooling only"], 0, "The evidence trend and the model trend point in the same direction."],
      ["Why is 'all galaxies move away from Earth because Earth is the center' too weak?", ["the large-scale expansion trend would be seen from any typical galaxy, not because Earth is special", "Earth creates all redshift", "the Sun defines the universe", "distance is measured from Earth only"], 0, "The model is not an Earth-centered explosion story."],
      ["If distance doubles in the simple Hubble model, what happens to recession speed?", ["it doubles", "it halves", "it stays fixed", "it becomes zero"], 0, "Direct proportionality means speed rises with distance by the same factor."],
      ["Why is the phrase 'hot dense early universe' better than 'a giant bomb'?", ["it keeps the cosmology model tied to physical conditions rather than everyday explosion imagery", "it means the universe had no matter", "it removes expansion", "it proves the Solar System is the whole universe"], 0, "The model language should stay physical and not collapse into metaphor."],
      ["What is the strongest use of Hubble's law in this lesson?", ["estimating recession speed from known distance", "classifying planets and moons", "measuring star color only", "finding Moon phases"], 0, "The relation is used quantitatively on galaxy recession data."],
      ["Why should the evidence and the model be kept together when teaching the Big Bang?", ["otherwise it collapses into a vague story with no observational support", "because models do not need evidence", "because evidence works only for stars", "because the Big Bang removes all equations"], 0, "The lesson is stronger when the model is tied to redshift and Hubble-law trends."],
      ["Which statement best avoids the center-of-explosion mistake?", ["the large-scale pattern is expansion of space, so recession is not from one ordinary central point", "Earth sits at the center of all galaxy motion", "the Milky Way is the Big Bang center", "the Sun controls Hubble's law"], 0, "This keeps the explanation inside the modern expansion picture."],
      ["Which summary is strongest?", ["The Big Bang model uses a hot dense early state plus redshift and Hubble-law evidence for expansion", "The Big Bang is only a mythological story", "The model needs no measurements", "Only nearby planets support cosmology"], 0, "This summary holds together state, evidence, and quantitative relation."],
      ["Why is a graph of recession speed against distance scientifically useful here?", ["it tests whether the large-scale trend matches Hubble's law", "it shows galaxy color only", "it measures Moon shadows", "it removes the need for distance"], 0, "The graph is where the model meets the data."],
    ]),
    ...shortMany(hint, [
      { prompt: "Hubble's law is v = H0 times ...", acceptedAnswers: exact("d", "distance") },
      { prompt: "The expansion story is supported by a distance-redshift ...", acceptedAnswers: exact("trend", "relation") },
      { prompt: "A proportional increase means if distance doubles, speed ...", acceptedAnswers: exact("doubles") },
      { prompt: "The Big Bang is not modeled as an ordinary ...", acceptedAnswers: exact("explosion") },
      { prompt: "Many galaxies see the same expansion trend, so no special ... is required.", acceptedAnswers: exact("center", "centre") },
      { prompt: "Redshift gives evidence that galaxies are moving ...", acceptedAnswers: exact("away", "away from us") },
      { prompt: "A hot dense early universe later became more ...", acceptedAnswers: exact("expanded", "spread out") },
      { prompt: "The Hubble-law graph links distance and recession ...", acceptedAnswers: exact("speed", "velocity") },
    ]),
  ];
}

const M14_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  M14_L1: l1DiagnosticRaw,
  M14_L2: l2DiagnosticRaw,
  M14_L3: l3DiagnosticRaw,
  M14_L4: l4DiagnosticRaw,
  M14_L5: l5DiagnosticRaw,
  M14_L6: l6DiagnosticRaw,
};

const M14_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  M14_L1: l1ConceptRaw,
  M14_L2: l2ConceptRaw,
  M14_L3: l3ConceptRaw,
  M14_L4: l4ConceptRaw,
  M14_L5: l5ConceptRaw,
  M14_L6: l6ConceptRaw,
};

const M14_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  M14_L1: () => combine(l1DiagnosticRaw(), l1ConceptRaw()),
  M14_L2: () => combine(l2DiagnosticRaw(), l2ConceptRaw()),
  M14_L3: () => combine(l3DiagnosticRaw(), l3ConceptRaw()),
  M14_L4: () => combine(l4DiagnosticRaw(), l4ConceptRaw()),
  M14_L5: () => combine(l5DiagnosticRaw(), l5ConceptRaw()),
  M14_L6: () => combine(l6DiagnosticRaw(), l6ConceptRaw()),
};

export function m14GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M14_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function m14GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M14_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function m14GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M14_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
