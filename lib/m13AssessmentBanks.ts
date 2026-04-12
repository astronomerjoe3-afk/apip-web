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
  hint = "Rebuild the Earth-and-Solar-System mechanism before choosing.",
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
    throw new Error(`M13 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
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
  const hint = "Keep main host body, wider system membership, and gravity together.";
  return [
    ...mcMany(hint, [
      ["What does Earth mainly orbit?", ["the Sun", "the Moon", "Mars", "the Milky Way"], 0, "Earth is a planet in a Sun-centered system, so its main orbit is around the Sun."],
      ["What does the Moon mainly orbit?", ["the Sun", "Earth", "Mars", "Venus"], 1, "The Moon is Earth's natural satellite, so its main orbit is around Earth."],
      ["Which body is the central star of our Solar System?", ["Earth", "the Sun", "the Moon", "Jupiter"], 1, "The Sun is the central star and the main source of light and gravity in the system."],
      ["Which statement best keeps the linked-system model correct?", ["Earth and the Moon orbit each other equally in the same sense", "Earth orbits the Sun while the Moon mainly orbits Earth", "the Moon orbits the Sun and Earth does not", "Earth mainly orbits the Moon"], 1, "A correct system model keeps the Sun-Earth route and the Earth-Moon route distinct."],
      ["What force organizes the Earth-Moon-Sun system?", ["magnetism", "gravity", "friction", "upthrust"], 1, "Gravity is the organizing force behind the orbital paths in the Solar System."],
      ["Which object is Earth's natural satellite?", ["the Sun", "the Moon", "Mars", "Mercury"], 1, "The Moon is Earth's natural satellite."],
      ["Why is it weak to say Earth and the Moon are two completely separate sky systems?", ["because they are linked by orbital relationships and gravity", "because the Moon is larger than Earth", "because the Sun orbits Earth", "because no force acts in space"], 0, "Earth, Moon, and Sun belong to one linked gravitational system."],
      ["Which route is nested inside the wider Sun-centered system?", ["the Moon's orbit around Earth", "Earth's orbit around the Moon", "the Sun's orbit around Earth", "Mercury's orbit around the Moon"], 0, "The Moon's path around Earth sits inside the wider Earth-Sun motion."],
      ["Which statement about the Moon and the Solar System is strongest?", ["the Moon is outside the Solar System because it does not mainly orbit the Sun", "the Moon is part of the Solar System even though it mainly orbits Earth", "the Moon is the system's central body", "the Moon controls the Sun's orbit"], 1, "The Moon belongs to the Solar System because Earth and Moon are part of the wider Sun-centered family."],
      ["Why is one system model stronger than three disconnected facts?", ["it keeps the body relationships and routes visible together", "it removes the need for gravity", "it proves all orbits are circles", "it makes the Moon a planet"], 0, "A linked model is stronger because it explains how the bodies are related physically."],
      ["If Earth were removed, which direct orbital relationship would the Moon lose first?", ["its main orbit around Earth", "the Sun's fusion", "the Milky Way", "the seasons"], 0, "The Moon's main host body is Earth, so that direct orbit would be lost first."],
      ["Which description best fits the Solar System?", ["a list of bright objects only", "a Sun-centered family of bodies linked by gravity", "a group of stars orbiting Earth", "one planet and no smaller bodies"], 1, "The Solar System is a gravity-bound family organized around the Sun."],
    ]),
    ...shortMany(hint, [
      { prompt: "Earth mainly orbits the ...", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "The Moon mainly orbits ...", acceptedAnswers: exact("Earth") },
      { prompt: "The force that organizes the Solar System is ...", acceptedAnswers: exact("gravity") },
      { prompt: "Earth, Moon, and Sun form one linked orbital ...", acceptedAnswers: exact("system") },
      { prompt: "The Moon is Earth's natural ...", acceptedAnswers: exact("satellite", "moon") },
      { prompt: "The central star of our Solar System is the ...", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "One orbit of Earth around the Sun takes one ...", acceptedAnswers: exact("year", "1 year") },
      { prompt: "The Moon still belongs to the wider ... System.", acceptedAnswers: exact("Solar", "solar") },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Keep main host body and wider Sun-centered membership separate.";
  return [
    ...mcMany(hint, [
      ["Why is 'the Moon cannot be in the Solar System because it mainly orbits Earth' a weak claim?", ["because Solar System membership is wider than one direct orbit and Earth-Moon still belongs to the Sun-centered system", "because the Moon is larger than Earth", "because the Moon is a star", "because gravity does not act on the Moon"], 0, "The Moon's main host is Earth, but the Earth-Moon pair still belongs inside the wider Solar System."],
      ["Why must 'main host body' and 'wider system membership' stay separate?", ["because they answer different classification questions", "because every body has two masses", "because the Sun orbits Earth in the same way", "because moons do not move in space"], 0, "Main host body identifies the direct orbit, while wider system membership locates the object in the larger family."],
      ["A probe circles the Moon while the Moon circles Earth and Earth circles the Sun. Which idea best describes this?", ["nested linked orbits", "one straight-line path only", "no gravity anywhere", "a proof that the Sun orbits Earth"], 0, "The system contains linked motions at more than one level."],
      ["Why is the statement 'the Moon and Earth share the same main host body in the same sense' weak?", ["because Earth mainly orbits the Sun while the Moon mainly orbits Earth", "because Earth is not moving", "because the Moon is brighter than Earth", "because the Sun is a moon"], 0, "Earth and Moon do not have the same main host body."],
      ["Which explanation best protects the hierarchy of bodies in the Earth-Moon-Sun system?", ["Sun as central star, Earth as planet, Moon as natural satellite", "Sun as moon, Earth as star, Moon as planet", "Sun and Moon as two planets", "Earth as central star"], 0, "A correct hierarchy keeps each body in its correct role."],
      ["Why is a list such as 'Sun, Earth, Moon' weaker than a linked-system explanation?", ["because the list hides the physical routes and relationships", "because the list proves the Sun is smallest", "because the list removes motion from the system", "because the list shows the Moon is a star"], 0, "A good model keeps both the objects and their relations visible."],
      ["A learner says, 'The Moon is separate from Earth's motion around the Sun.' What is the best response?", ["the Moon has its own main orbit around Earth, but the whole Earth-Moon system still moves around the Sun", "the Moon never moves with Earth", "the Sun mainly orbits the Moon", "Earth does not orbit the Sun"], 0, "The Earth-Moon system is nested inside the wider Sun-centered motion."],
      ["Which relationship is the strongest first classification step for the Moon?", ["its direct orbit around Earth", "its brightness at night", "its color", "its crater count"], 0, "The Moon is classified first by its direct orbital role as Earth's natural satellite."],
      ["Why is gravity part of the answer even in a qualitative Earth-Moon-Sun question?", ["because it is the physical cause organizing the routes", "because it makes the Moon luminous", "because it replaces orbital motion", "because it stops Earth rotating"], 0, "The system is not just a picture; gravity explains why the routes exist."],
      ["Which statement best explains why the Moon can still influence Earth-based observations while Earth orbits the Sun?", ["because the Moon remains linked to Earth while the pair belongs to the wider Solar System", "because the Moon is the system's star", "because Earth stops moving when the Moon rises", "because the Moon is outside the Solar System"], 0, "Local Earth-Moon geometry still matters inside the wider Sun-centered system."],
      ["Why is 'everything in space just orbits the Sun directly' too weak for this lesson?", ["because moons mainly orbit planets inside the wider Sun-centered system", "because Earth does not move", "because only stars can orbit", "because gravity works only on planets"], 0, "The Solar System contains nested orbital relationships, not one single direct pattern for every body."],
      ["Which summary is strongest?", ["The Earth-Moon-Sun system is one gravity-linked model with different host-body roles", "Earth and Moon are unrelated because they do not share the same main orbit", "Only the Sun matters; Earth and Moon can be ignored", "The Solar System is just a naming list"], 0, "This summary keeps the linked system and the different roles both visible."],
    ]),
    ...shortMany(hint, [
      { prompt: "The Moon can still be part of the Solar System because Earth and Moon travel around the ... together.", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "Main host body tells you the direct orbital ..., while the wider system tells you the larger family.", acceptedAnswers: exact("relationship", "route", "orbit") },
      { prompt: "The Moon's main host body is ..., but the wider system center is the Sun.", acceptedAnswers: exact("Earth") },
      { prompt: "A body orbiting a planet is classified first as a natural ...", acceptedAnswers: exact("satellite", "moon") },
      { prompt: "A stronger Earth-Moon-Sun explanation keeps the objects and their ... together.", acceptedAnswers: exact("relationships", "routes", "relationships and routes") },
      { prompt: "Gravity gives the system its physical ...", acceptedAnswers: exact("organization", "structure") },
      { prompt: "Earth is a ... in the Sun-centered system.", acceptedAnswers: exact("planet") },
      { prompt: "The Earth-Moon-Sun picture is best treated as one linked orbital ...", acceptedAnswers: exact("system") },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep inward pull and sideways motion in the same picture.";
  return [
    ...mcMany(hint, [
      ["What two ingredients are needed for an orbit?", ["gravity and sideways motion", "light and sound", "mass and temperature", "magnetism and friction"], 0, "An orbit is produced by forward motion continually bent by gravity."],
      ["If gravity suddenly vanished for a satellite, what would it do first?", ["move in a straight-line tangent", "stop immediately", "fall inward faster", "reverse direction"], 0, "Without the inward pull, the object continues in the direction it was already moving."],
      ["If a satellite had no sideways motion, what would gravity make it do?", ["fall inward toward the central body", "move into a wider orbit", "stay fixed with no force", "shine more brightly"], 0, "Without sideways motion, gravity would pull it inward."],
      ["In a circular orbit, the gravitational force points mainly ...", ["toward the central body", "along the direction of motion", "away from the central body", "nowhere because the forces cancel"], 0, "The force is inward toward the center of the orbit."],
      ["Why can a circular orbit still involve acceleration even if speed is constant?", ["because the direction of velocity changes", "because mass changes", "because gravity disappears", "because the orbit is a straight line"], 0, "Acceleration is any change in velocity, including a change in direction."],
      ["Which orbit usually has the longer period?", ["the larger orbit", "the smaller orbit", "both always have equal periods", "the one with the brighter central body"], 0, "Larger orbital routes usually take longer to complete."],
      ["What best explains the curved path of an orbiting body?", ["its direction is continually changed by gravity", "it chooses to follow a curve", "no force acts on it", "friction in space bends it"], 0, "Gravity keeps turning the direction of motion inward."],
      ["A satellite in orbit is best described as ...", ["still under gravity", "free of all forces", "motionless", "outside the Solar System"], 0, "A body in orbit is still under the inward pull of gravity."],
      ["If the sideways speed is too small, the path is more likely to ...", ["fall inward", "become perfectly straight outward", "stay unchanged without gravity", "turn into a moon phase"], 0, "Too little sideways speed means gravity wins and the body falls inward."],
      ["Which statement about orbit is strongest?", ["orbit is a curved route caused by inward pull and sideways motion together", "orbit is what happens when no force acts", "orbit is a straight line seen from far away", "orbit means gravity has switched off"], 0, "This keeps both ingredients visible together."],
      ["What changes continuously in uniform circular motion?", ["direction of velocity", "mass", "central body", "gravitational constant"], 0, "Even if speed stays the same, the direction of the velocity changes continuously."],
      ["Why do inner planets generally have shorter years than outer planets?", ["their orbital routes are smaller", "they do not experience gravity", "they spin faster on their axes", "they are brighter"], 0, "Smaller orbital routes usually mean shorter periods."],
    ]),
    ...shortMany(hint, [
      { prompt: "Without gravity, an orbiting body would move in a straight ...", acceptedAnswers: exact("line", "line tangent", "tangent line") },
      { prompt: "The force that bends an orbit points toward the ...", acceptedAnswers: exact("center", "central body", "Sun", "planet") },
      { prompt: "An orbit needs sideways ... as well as inward pull.", acceptedAnswers: exact("motion", "speed", "velocity") },
      { prompt: "A larger orbital route usually means a longer orbital ...", acceptedAnswers: exact("period", "year") },
      { prompt: "In circular motion the velocity changes because its ... changes.", acceptedAnswers: exact("direction") },
      { prompt: "If sideways speed vanished, gravity would pull the body ...", acceptedAnswers: exact("inward", "toward the center", "toward the central body") },
      { prompt: "A body in orbit is still under ...", acceptedAnswers: exact("gravity") },
      { prompt: "Orbit is not force-free because the pull stays ...", acceptedAnswers: exact("inward", "toward the center") },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Ask what happens to the direction of motion at each moment.";
  return [
    ...mcMany(hint, [
      ["Why is 'an orbit needs no force once the body is moving' a weak statement?", ["because gravity must keep changing the direction of motion", "because moving bodies stop by themselves in space", "because orbit is caused by friction", "because only stars can orbit"], 0, "Orbit requires a continuing inward force."],
      ["Why is 'the satellite floats because gravity is absent' incorrect?", ["because gravity is still pulling it inward while it moves forward", "because satellites are too light for gravity", "because only the Sun feels gravity", "because orbit makes mass zero"], 0, "Bodies in orbit are still under gravity."],
      ["A circular orbit has constant speed. Which quantity must still change?", ["velocity direction", "mass", "radius of the central body", "gravitational constant"], 0, "Velocity changes because direction changes."],
      ["Why is a larger orbital period usually linked to a larger orbit?", ["the route is larger and the orbital motion differs accordingly", "the outer body has no gravity", "the central body becomes weaker only because of color", "the body rotates more quickly on its axis"], 0, "The size of the route is part of the reason the period grows."],
      ["If a moon were suddenly brought to rest relative to its planet, what would happen first?", ["it would fall toward the planet", "it would move in a tangent line", "it would leave the system at constant speed", "it would become a phase"], 0, "With no sideways motion, the inward pull would make it fall inward."],
      ["Why is an orbit sometimes described as continual free fall?", ["because gravity keeps pulling inward while the forward motion keeps missing the central body", "because no force acts at all", "because the body never moves forward", "because the central body disappears"], 0, "The body keeps falling inward but its sideways motion keeps it missing the target."],
      ["Which statement best protects the mechanics of circular orbit?", ["gravity provides centripetal acceleration toward the center", "the force points along the path of motion", "no acceleration exists because speed is constant", "the body is outside all forces"], 0, "The acceleration is inward even when speed is constant."],
      ["If the gravitational pull vanished but the body's sideways speed stayed the same, what path would follow?", ["a straight-line tangent", "an inward spiral", "a circular orbit of the same size", "a stationary point"], 0, "The tangent-line outcome is the key 'no gravity' comparison."],
      ["Why do inner planets complete years more quickly than outer planets?", ["their orbital periods are shorter because their orbits are smaller", "their mass is always smaller", "they have no rotation", "they are closer to the Moon"], 0, "Inner planets generally have shorter orbital routes and shorter periods."],
      ["Which force direction is strongest for a stable circular orbit?", ["toward the center", "tangent to the orbit", "away from the center", "alternating randomly"], 0, "The centripetal force direction is inward."],
      ["A learner says, 'The orbit is curved because the body chooses to follow the path already drawn.' What is the better explanation?", ["gravity continually changes the direction of the motion", "the body remembers a previous curve", "the orbit is caused by heat", "the orbit is caused by shadows"], 0, "The curve is created dynamically by the inward force."],
      ["Why is sideways motion as important as gravity in an orbit explanation?", ["because without it gravity would make the body fall straight inward", "because sideways motion removes gravity", "because sideways motion makes the central body rotate", "because sideways motion replaces the orbital period"], 0, "Sideways motion is what keeps the body missing the central object while gravity bends the path."],
    ]),
    ...shortMany(hint, [
      { prompt: "In circular orbit, the acceleration points ...", acceptedAnswers: exact("inward", "toward the center", "towards the center") },
      { prompt: "A body can have constant speed but changing ... in orbit.", acceptedAnswers: exact("direction", "velocity direction") },
      { prompt: "Orbit combines forward motion with inward ...", acceptedAnswers: exact("gravity", "gravitational pull", "force") },
      { prompt: "A larger orbit usually means a longer orbital ...", acceptedAnswers: exact("period", "year") },
      { prompt: "If the central force disappeared, the body would move along the ...", acceptedAnswers: exact("tangent", "tangent line", "straight-line tangent") },
      { prompt: "A body in orbit is still in free ... toward the central body.", acceptedAnswers: exact("fall") },
      { prompt: "Without sideways motion, gravity would pull the body toward the ...", acceptedAnswers: exact("center", "central body", "planet", "Sun") },
      { prompt: "The key velocity change in circular orbit is a change of ...", acceptedAnswers: exact("direction") },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Keep Earth's rotation and the lit-half picture together.";
  return [
    ...mcMany(hint, [
      ["What causes day and night on Earth?", ["Earth's rotation", "Earth's yearly orbit only", "the Moon's orbit", "changes in Earth's distance from the Sun"], 0, "Day and night are caused by Earth rotating under steady sunlight."],
      ["One complete day is tied most directly to one complete ...", ["rotation of Earth", "orbit of Earth around the Sun", "orbit of the Moon", "eclipse cycle"], 0, "A day belongs to Earth's spin timescale."],
      ["At any moment, about what fraction of Earth is lit by the Sun?", ["one half", "one quarter", "all of it", "none of it"], 0, "One half is lit while the other half is dark."],
      ["Why does the Sun appear to move across the sky each day?", ["Earth rotates", "the Sun orbits Earth once each day", "the Moon pulls the Sun", "Earth changes season"], 0, "The daily apparent motion is caused by Earth's rotation."],
      ["If one city is at noon, a city on the opposite side of Earth is closest to ...", ["midnight", "sunrise", "the same noon", "summer"], 0, "Opposite sides of Earth face opposite lighting conditions at the same moment."],
      ["Which statement about day and night is strongest?", ["they come from Earth's rotation, not from Earth's yearly orbit", "they happen because Earth is sometimes closer to the Sun", "they happen because the Moon blocks the Sun each night", "they happen only in one hemisphere"], 0, "Rotation is the direct cause of the daily cycle."],
      ["If Earth rotated more slowly, what would happen to the length of the day?", ["it would become longer", "it would become shorter", "it would stay the same", "it would disappear only in summer"], 0, "A slower rotation means a longer rotation period and therefore a longer day."],
      ["What best explains why different places on Earth have different times of day at the same moment?", ["they are at different positions on a rotating Earth", "the Sun shines on one city only", "gravity stops at different places", "the Moon chooses one city at a time"], 0, "Different longitudes on a rotating Earth face the Sun differently at the same moment."],
      ["Which motion is most directly responsible for the apparent daily motion of the stars?", ["Earth's rotation", "Earth's revolution around the Sun", "the Moon's phase cycle", "seasonal tilt"], 0, "The apparent daily motion of stars is also a rotation effect."],
      ["If Earth stopped rotating but still orbited the Sun, which explanation of the daily cycle would fail?", ["day and night would no longer be explained by a regular 24-hour spin", "years would stop existing", "gravity would disappear", "the Moon would stop orbiting Earth"], 0, "The daily cycle depends on rotation, so stopping rotation removes the normal day-night pattern."],
      ["What crosses from darkness into sunlight because of Earth's rotation?", ["a location on Earth's surface", "the Sun", "the whole Solar System", "gravity"], 0, "As Earth turns, surface locations move through the lit and dark halves."],
      ["Which is the better timescale word for day and night?", ["rotation", "revolution around the Sun", "galaxy orbit", "light-year"], 0, "The correct timescale is Earth's rotation."],
    ]),
    ...shortMany(hint, [
      { prompt: "One day is one complete Earth ...", acceptedAnswers: exact("rotation", "spin") },
      { prompt: "Day and night are caused by Earth's ...", acceptedAnswers: exact("rotation", "spin") },
      { prompt: "At any moment one ... of Earth is lit.", acceptedAnswers: exact("half") },
      { prompt: "The Sun seems to cross the sky because Earth ...", acceptedAnswers: exact("rotates", "spins") },
      { prompt: "Earth's yearly orbit sets the year, not the daily ...", acceptedAnswers: exact("cycle", "day", "day-night cycle") },
      { prompt: "Opposite sides of Earth can have opposite times of ...", acceptedAnswers: exact("day", "daytime") },
      { prompt: "The daily apparent motion of stars is a ... effect.", acceptedAnswers: exact("rotation", "rotational") },
      { prompt: "A location moves from night into day because Earth ...", acceptedAnswers: exact("rotates", "spins") },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Use Earth's spin, not its orbit, to explain the daily cycle.";
  return [
    ...mcMany(hint, [
      ["Why is 'night happens because Earth moves farther from the Sun on one side' a weak explanation?", ["because day and night come from rotation and the lit-half geometry, not from one side being farther away", "because distance never changes in astronomy", "because the Moon causes night every day", "because only the poles have night"], 0, "Day and night are a rotation story, not a distance story."],
      ["Why can two cities have different local times at the same moment?", ["because Earth is rotating and they are at different longitudes", "because gravity acts only on one city", "because one city is closer to the Moon", "because the Sun shines on one city only"], 0, "Different longitudes on a rotating sphere face the Sun differently."],
      ["A place moves from noon to midnight in about half a rotation. What does this show?", ["half a turn changes which side of Earth faces the Sun", "Earth's orbit causes noon", "the Moon creates midnight", "gravity stops at night"], 0, "A half-turn carries a place from the lit side to the dark side."],
      ["Why is Earth's yearly orbit the wrong first explanation for sunrise and sunset?", ["because one orbit is a year-scale motion, while sunrise and sunset are daily rotation effects", "because Earth does not orbit the Sun", "because sunrise happens only in summer", "because only the Moon affects the horizon"], 0, "The timescale and mechanism both point to rotation."],
      ["If Earth rotated in the opposite direction, what would happen first to apparent sunrise?", ["it would appear from the opposite side of the horizon", "it would stop existing", "it would become a season", "the Sun would orbit more slowly"], 0, "Reversing the rotation reverses the apparent daily sky motion."],
      ["Which statement best protects the lit-half model?", ["sunlight arrives mainly from one direction while Earth rotates through it", "different halves of Earth take turns making their own light", "the Moon switches off sunlight on one side", "day and night are caused by seasons"], 0, "The Sun lights one side while rotation moves locations through that lighting pattern."],
      ["Why do noon and midnight exist simultaneously for different places on Earth?", ["because one rotating hemisphere faces the Sun while the opposite side faces away", "because the Sun splits into two beams", "because only one hemisphere rotates", "because gravity changes sign"], 0, "The lit and dark halves exist at the same moment."],
      ["Why is 'the Sun goes around Earth each day' a weak school-level explanation?", ["because the daily sky motion is apparent and is explained by Earth's rotation", "because the Sun never moves relative to Earth", "because only the Moon moves in the sky", "because the Sun is inside Earth's atmosphere"], 0, "The daily motion is apparent motion caused by Earth's spin."],
      ["If Earth made two rotations in 24 hours, the length of one day would be closest to ...", ["12 hours", "24 hours", "48 hours", "one year"], 0, "Two rotations in 24 hours means each rotation, and so each day, would last about 12 hours."],
      ["Why are longitudes useful in day-night reasoning?", ["they locate positions around the rotating Earth", "they measure Earth's mass", "they show the Moon's brightness", "they replace gravity"], 0, "Different longitudes correspond to different local times as Earth rotates."],
      ["Which daily observation is best explained by Earth's rotation?", ["the apparent motion of the Sun and stars across the sky", "the yearly season sequence", "the redshift of galaxies", "the color of planets"], 0, "Daily apparent sky motion is a rotation effect."],
      ["What is the strongest summary of the lesson?", ["day and night are caused by Earth's rotation under steady sunlight", "day and night are caused by Earth getting nearer and farther from the Sun each day", "day and night are caused by the Moon orbiting Earth", "day and night happen only in one hemisphere"], 0, "This summary keeps the correct mechanism and geometry together."],
    ]),
    ...shortMany(hint, [
      { prompt: "The apparent daily motion of the Sun is caused by Earth's ...", acceptedAnswers: exact("rotation", "spin") },
      { prompt: "If Earth rotated the opposite way, the Sun would appear to rise in the ...", acceptedAnswers: exact("west", "the west") },
      { prompt: "A half rotation takes a place from noon toward ...", acceptedAnswers: exact("midnight", "night") },
      { prompt: "Earth's yearly orbit defines one ...", acceptedAnswers: exact("year") },
      { prompt: "Day and night exist together because one half is lit and the other is ...", acceptedAnswers: exact("dark", "in darkness") },
      { prompt: "If Earth's rotation period became longer, one day would become ...", acceptedAnswers: exact("longer") },
      { prompt: "Different local times are linked to different ... around a rotating Earth.", acceptedAnswers: exact("longitudes", "positions") },
      { prompt: "Sunrise and sunset belong to Earth's ... timescale.", acceptedAnswers: exact("rotation", "daily rotation") },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep axial tilt, sunlight angle, and hemisphere comparison together.";
  return [
    ...mcMany(hint, [
      ["What is the main cause of the seasons on Earth?", ["axial tilt and changing sunlight angle", "Earth being much nearer the Sun in summer", "the Moon blocking sunlight", "Earth's daily rotation only"], 0, "Seasons are driven mainly by Earth's tilt and the resulting sunlight-angle changes."],
      ["When the Northern Hemisphere is tilted toward the Sun, it usually has ...", ["summer", "winter", "a solar eclipse", "a shorter year"], 0, "Leaning toward the Sun gives the Northern Hemisphere more direct sunlight and longer days."],
      ["At the same time that the Northern Hemisphere has summer, the Southern Hemisphere usually has ...", ["winter", "summer", "midnight everywhere", "no season"], 0, "Opposite hemispheres experience opposite seasons."],
      ["Why is the simple distance-from-the-Sun explanation weak?", ["because both hemispheres are almost the same distance from the Sun at the same time", "because distance never changes", "because the Moon controls the seasons", "because gravity is absent"], 0, "A distance-only story cannot explain opposite seasons in opposite hemispheres at the same time."],
      ["What stays tilted in nearly the same direction in space as Earth orbits the Sun?", ["Earth's axis", "the Moon's shadow", "the equator only", "the Sun's surface"], 0, "The axis keeps roughly the same direction in space through the orbit."],
      ["What usually happens to the Sun's height in the sky during summer in one hemisphere?", ["it is higher", "it is lower", "it disappears", "it causes an eclipse"], 0, "More direct sunlight in summer is linked to a higher Sun angle."],
      ["Which pair usually goes together in summer?", ["more direct sunlight and longer days", "less direct sunlight and shorter days", "no sunlight and no gravity", "full moon and eclipse"], 0, "Summer comes with more direct sunlight and longer daylight."],
      ["If Earth had no axial tilt, what would happen to the seasons?", ["they would be much weaker or nearly absent", "they would become stronger", "day and night would stop", "gravity would vanish"], 0, "Without tilt there would be far less seasonal contrast."],
      ["Which month-position pairing is correct at school level?", ["June: north tilted more toward the Sun; December: south tilted more toward the Sun", "June: both hemispheres tilted toward the Sun", "December: north tilted toward the Sun", "June and December: tilt disappears"], 0, "June and December are opposite seasonal positions for the hemispheres."],
      ["What quantity changes most directly to make summer and winter different?", ["sunlight angle and day length", "Earth's mass", "the Moon's phase", "galaxy distance"], 0, "Sunlight angle and day length are the direct seasonal differences."],
      ["What is one complete year in this topic?", ["one orbit of Earth around the Sun", "one rotation of Earth", "one lunar phase cycle", "one eclipse"], 0, "A year belongs to Earth's orbit around the Sun."],
      ["Which statement is strongest about opposite hemispheres?", ["they can have opposite seasons at the same time", "they always have the same season at the same time", "they receive identical sunlight angles all year", "they are different distances from the Sun by millions of kilometres"], 0, "Opposite hemispheres can lean differently relative to the Sun."],
    ]),
    ...shortMany(hint, [
      { prompt: "The main cause of seasons is Earth's axial ...", acceptedAnswers: exact("tilt") },
      { prompt: "Opposite hemispheres have opposite ...", acceptedAnswers: exact("seasons", "season") },
      { prompt: "A hemisphere tilted toward the Sun gets more ... sunlight.", acceptedAnswers: exact("direct", "more direct") },
      { prompt: "Earth's axis keeps nearly the same ... in space as Earth orbits.", acceptedAnswers: exact("direction") },
      { prompt: "Without axial tilt, seasons would be much ...", acceptedAnswers: exact("weaker", "smaller", "less marked") },
      { prompt: "One complete Earth orbit around the Sun is one ...", acceptedAnswers: exact("year") },
      { prompt: "Summer usually has longer ... hours.", acceptedAnswers: exact("daylight", "day") },
      { prompt: "Seasons are not mainly caused by Earth-Sun ...", acceptedAnswers: exact("distance") },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Reject the distance myth by comparing the two hemispheres directly.";
  return [
    ...mcMany(hint, [
      ["Why is the distance-only explanation for seasons weak?", ["because both hemispheres are almost the same Earth-Sun distance at the same time yet can have opposite seasons", "because Earth never changes distance at all", "because the Moon creates seasons", "because only rotation matters"], 0, "Opposite seasons in opposite hemispheres expose the weakness of the distance myth."],
      ["Why can Australia have summer while the UK has winter?", ["because the Southern Hemisphere can lean toward the Sun while the Northern Hemisphere leans away", "because Australia is always much closer to the Sun", "because the Moon blocks sunlight over the UK", "because gravity is stronger in the south"], 0, "Opposite hemispheres experience opposite lean directions relative to the Sun."],
      ["Which statement best protects the June-December comparison?", ["the hemisphere leaning toward the Sun swaps between June and December", "both hemispheres lean toward the Sun equally in June and December", "June and December differ only because Earth changes mass", "the tilt disappears halfway through the orbit"], 0, "A strong comparison keeps the hemisphere swap visible."],
      ["If Earth's tilt were zero, which explanation is strongest?", ["seasonal contrast would be much reduced because sunlight angle changes would be smaller", "summer would become hotter because Earth would be closer to the Sun", "day and night would stop", "the Moon would stop orbiting"], 0, "Tilt is the main seasonal cause, so removing it removes most seasonal contrast."],
      ["Why does more direct sunlight usually warm a hemisphere more effectively?", ["the same solar energy is concentrated on a smaller surface area", "gravity increases in summer", "the Sun becomes more massive", "the Moon reflects extra heat"], 0, "More direct rays spread the energy less."],
      ["Which feature usually accompanies summer besides more direct sunlight?", ["longer daylight", "shorter daylight", "no rotation", "permanent eclipse"], 0, "Longer daylight is the second key seasonal clue."],
      ["Which date type best matches roughly equal day and night between hemispheres?", ["an equinox", "a solstice only", "a new moon", "an eclipse"], 0, "At the school level, equinox is the point where day and night are roughly equal."],
      ["Why is 'summer happens because Earth is nearer the Sun' especially weak for the whole planet?", ["because it would make both hemispheres share the same season at the same time", "because Earth never moves in an orbit", "because the Sun is farther away in June for everyone", "because distance causes only day and night"], 0, "A distance-only story cannot explain opposite seasons at the same moment."],
      ["Which quantity stays nearly fixed in space as Earth travels around the Sun?", ["axis direction", "the equator's temperature", "the Moon's phase", "the number of daylight hours"], 0, "The fixed axis direction is the backbone of the seasonal model."],
      ["If the Northern Hemisphere is tilted away from the Sun, what is strongest for the Southern Hemisphere?", ["it is tilted toward the Sun", "it is also tilted away from the Sun", "it loses all seasons", "it stops rotating"], 0, "The hemispheres are opposite one another, so their tilt relation to the Sun is opposite."],
      ["Why do places often have shorter days in winter?", ["their hemisphere leans away from the Sun, so the daylight arc is shorter", "Earth rotates faster in winter", "the Moon blocks sunrise", "gravity vanishes sooner"], 0, "Winter combines lower Sun angle with shorter daylight."],
      ["Which summary is strongest?", ["Seasons are a tilt-and-sunlight-angle story played out through Earth's yearly orbit", "Seasons are a daily rotation story only", "Seasons are caused by Moon phases", "Seasons are caused only by distance"], 0, "This summary keeps the correct cause and timescale together."],
    ]),
    ...shortMany(hint, [
      { prompt: "Seasons swap because opposite hemispheres lean ... or away from the Sun.", acceptedAnswers: exact("toward", "towards") },
      { prompt: "More direct sunlight spreads the same energy over a smaller ...", acceptedAnswers: exact("area", "surface area") },
      { prompt: "Roughly equal day and night belongs to an ...", acceptedAnswers: exact("equinox", "an equinox") },
      { prompt: "Without axial tilt, seasonal contrast would ...", acceptedAnswers: exact("decrease", "be smaller", "be weaker") },
      { prompt: "When the Northern Hemisphere tilts away, the Southern Hemisphere tilts ...", acceptedAnswers: exact("toward", "towards") },
      { prompt: "Season changes are a tilt-and-sunlight-... story.", acceptedAnswers: exact("angle") },
      { prompt: "The summer hemisphere usually has longer ... hours.", acceptedAnswers: exact("daylight", "day") },
      { prompt: "A distance-only season story would wrongly predict the same season in both ...", acceptedAnswers: exact("hemispheres", "hemisphere") },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Keep the always-lit half, viewing angle, and special eclipse alignment separate.";
  return [
    ...mcMany(hint, [
      ["What mainly causes the Moon's phases?", ["changing view of the Moon's sunlit half", "Earth's shadow every month", "the Moon making less light", "the Sun turning on and off"], 0, "Phases are caused by changing viewing geometry, not by the Moon changing how much sunlight it receives."],
      ["How much of the Moon is lit by the Sun at any moment?", ["one half", "one quarter", "all of it", "none of it"], 0, "The Sun lights half of the Moon all the time."],
      ["At new moon, the Moon is roughly ...", ["between Earth and the Sun", "behind Earth on the far side from the Sun", "directly inside Earth's shadow every time", "far outside the Solar System"], 0, "New moon occurs when the Moon is roughly between Earth and the Sun."],
      ["At full moon, the Moon is roughly ...", ["opposite the Sun in the sky as seen from Earth", "between Earth and the Sun", "inside Earth's shadow every time", "closest to Earth always"], 0, "At full moon the Moon is on the opposite side from the Sun as seen from Earth."],
      ["What happens in a lunar eclipse?", ["Earth's shadow falls on the Moon", "the Moon's shadow falls on Earth", "the Sun's shadow falls on Earth", "the Moon stops being lit"], 0, "A lunar eclipse is when Earth blocks sunlight from reaching the Moon."],
      ["What happens in a solar eclipse?", ["the Moon's shadow falls on Earth", "Earth's shadow falls on the Moon", "the Sun disappears from space", "the Moon stops orbiting Earth"], 0, "A solar eclipse is when the Moon blocks sunlight from reaching part of Earth."],
      ["Why do eclipses not happen every month?", ["the alignment is usually not exact enough for shadow to line up", "the Sun stops lighting the Moon", "the Moon is never full", "Earth stops rotating"], 0, "Eclipses need a special alignment, not just the ordinary monthly orbit positions."],
      ["At quarter moon, how much of the Moon's visible face is lit?", ["half", "all", "none", "one quarter"], 0, "At quarter moon, half of the visible face is lit even though the name says 'quarter' because of the orbit position."],
      ["Which statement about phases is strongest?", ["they are a viewing-angle story", "they are caused by Earth's shadow every week", "they happen because the Moon changes size", "they happen because the Sun moves around Earth"], 0, "Viewing angle is the core phase idea."],
      ["Which statement about eclipses is strongest?", ["they need a special shadow alignment", "they are the normal cause of every phase", "they happen every time the Moon is visible", "they replace the Moon's orbit"], 0, "Eclipses are special alignment events."],
      ["What changes from crescent to full moon?", ["the visible fraction of the Moon's lit half", "the amount of the Moon lit by the Sun", "the Moon's mass", "the Earth-Sun distance"], 0, "The visible part changes, not the fact that half the Moon is sunlit."],
      ["What causes the monthly phase cycle?", ["the Moon orbiting Earth", "Earth rotating once each day", "Earth orbiting the Sun alone", "galaxies moving apart"], 0, "Phases repeat as the Moon moves around Earth."],
    ]),
    ...shortMany(hint, [
      { prompt: "Moon phase depends on viewing ...", acceptedAnswers: exact("angle", "geometry", "viewing angle") },
      { prompt: "The Sun always lights one ... of the Moon.", acceptedAnswers: exact("half", "side", "hemisphere") },
      { prompt: "In a lunar eclipse, Earth's ... falls on the Moon.", acceptedAnswers: exact("shadow") },
      { prompt: "In a solar eclipse, the Moon's ... falls on Earth.", acceptedAnswers: exact("shadow") },
      { prompt: "Ordinary Moon phases are not usually caused by Earth's ...", acceptedAnswers: exact("shadow") },
      { prompt: "New moon happens when the Moon is roughly between Earth and the ...", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "A rare special shadow line-up is called an ...", acceptedAnswers: exact("eclipse") },
      { prompt: "The monthly phase cycle follows the Moon's ... around Earth.", acceptedAnswers: exact("orbit", "motion", "movement") },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Use shadow language only for eclipses, not for ordinary phases.";
  return [
    ...mcMany(hint, [
      ["Why is 'Earth's shadow causes all Moon phases' a weak explanation?", ["because normal phases happen every month while exact shadow alignment for eclipses is rare", "because Earth has no shadow", "because the Moon is not lit by the Sun", "because phases happen only during the day"], 0, "Ordinary phases are viewing-angle effects, not shadow events."],
      ["Why can there be a full moon without a lunar eclipse?", ["because the alignment is not exact enough for Earth's shadow to cover the Moon", "because the Moon is not opposite the Sun", "because the Sun lights the Moon only at new moon", "because Earth stops rotating"], 0, "Full moon is a geometry position; lunar eclipse needs a stricter shadow alignment."],
      ["Which statement best protects the phase model?", ["the visible fraction of the Moon's lit half changes as the Moon orbits Earth", "the Sun lights different fractions of the Moon each week", "Earth's shadow always covers part of the Moon", "the Moon turns its light source on and off"], 0, "The lit half stays constant, but the visible portion changes."],
      ["If the Moon is between Earth and the Sun but slightly out of the exact line, what is strongest?", ["new moon without a solar eclipse", "full moon with a lunar eclipse", "quarter moon", "no phase at all"], 0, "The phase can still be new moon even without exact eclipse alignment."],
      ["Why can a half moon be visible even though the Sun lights half the Moon all the time?", ["because our viewing angle can show only half of the lit half", "because the Sun lights only a quarter at quarter moon", "because Earth blocks the other half every week", "because the Moon changes shape"], 0, "The visible portion depends on viewing geometry."],
      ["Which alignment gives a solar eclipse?", ["Sun-Moon-Earth", "Sun-Earth-Moon", "Earth-Sun-Moon", "Moon-Earth-Sun and Earth-Sun-Moon at once"], 0, "For a solar eclipse the Moon must block sunlight reaching Earth."],
      ["Which alignment gives a lunar eclipse?", ["Sun-Earth-Moon", "Sun-Moon-Earth", "Earth-Moon-Sun", "Moon-Sun-Earth"], 0, "For a lunar eclipse Earth must block sunlight reaching the Moon."],
      ["Why are solar eclipses usually brief for one location?", ["the exact shadow line-up is narrow and the motions continue", "because the Sun stops shining everywhere", "because the Moon stops orbiting", "because Earth stops rotating"], 0, "The alignment is special and the shadow path is limited."],
      ["Why is 'quarter moon means one quarter of the Moon is lit' weak?", ["because one quarter refers to the orbit position while half of the visible face is lit", "because none of the Moon is lit at quarter moon", "because the Sun lights a different total fraction each week", "because quarter moon is always an eclipse"], 0, "Quarter moon still shows half of the visible face illuminated."],
      ["What is the strongest difference between phases and eclipses?", ["phases are normal viewing geometry; eclipses are special shadow events", "phases happen only once a year; eclipses happen monthly", "phases and eclipses are exactly the same thing", "eclipses do not involve the Sun"], 0, "This keeps the two ideas clearly separated."],
      ["Why do phases repeat roughly monthly?", ["because the Moon's orbit around Earth changes the Earth-view angle in a repeating cycle", "because Earth rotates once a day", "because the Sun changes size each month", "because Earth's shadow changes length each month"], 0, "The repeating orbit gives the repeating viewing geometry."],
      ["What is the strongest summary?", ["Moon phases are a viewing-angle story; eclipses need a special shadow alignment", "all phases are shadows of Earth", "new moon is the same as solar eclipse every month", "full moon is the same as lunar eclipse every month"], 0, "This summary keeps the phase model and eclipse model separate and accurate."],
    ]),
    ...shortMany(hint, [
      { prompt: "A full moon is not usually an eclipse because exact ... is missing.", acceptedAnswers: exact("alignment", "line-up", "lineup") },
      { prompt: "Solar eclipse alignment is Sun-Moon-...", acceptedAnswers: exact("Earth") },
      { prompt: "Lunar eclipse alignment is Sun-Earth-...", acceptedAnswers: exact("Moon") },
      { prompt: "Ordinary phases are a viewing-... story.", acceptedAnswers: exact("angle", "geometry") },
      { prompt: "At quarter moon, half of the ... face is lit.", acceptedAnswers: exact("visible", "seen") },
      { prompt: "A rare special shadow event is an ...", acceptedAnswers: exact("eclipse") },
      { prompt: "The regular monthly sequence follows the Moon's ...", acceptedAnswers: exact("orbit", "orbital motion") },
      { prompt: "Earth's shadow matters mainly for ..., not for ordinary phases.", acceptedAnswers: exact("eclipses", "an eclipse") },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Separate body type, main host, orbital period, and sketch scale.";
  return [
    ...mcMany(hint, [
      ["Which description best fits the Solar System?", ["the Sun and the family of planets, moons, and smaller bodies bound to it by gravity", "one planet and one moon only", "all the stars in the Milky Way", "a list of constellations"], 0, "The Solar System is a Sun-centered gravitational family of many body types."],
      ["Which body usually has the shorter year?", ["an inner planet on a smaller orbit", "an outer planet on a larger orbit", "a moon around a planet", "a body outside the Solar System"], 0, "Smaller inner orbits usually mean shorter periods."],
      ["Which body mainly orbits a planet rather than the Sun directly?", ["a moon", "a planet", "the Sun", "a galaxy"], 0, "Moons are natural satellites of planets."],
      ["Why is a classroom Solar System sketch weak as a literal distance map?", ["because real distances are heavily compressed", "because planets do not orbit", "because only the Moon moves", "because gravity is missing from space"], 0, "The sketch is a model, not a full scale drawing."],
      ["Which pairing is correct?", ["Mercury: shorter year than Neptune", "Neptune: shorter year than Mercury", "all planets have the same year", "moons always have longer years than planets"], 0, "Inner planets have shorter orbital periods than outer planets."],
      ["What is the central body of the Solar System?", ["the Sun", "Earth", "Jupiter", "the Moon"], 0, "The Solar System is organized around the Sun."],
      ["Which statement about outer planets is strongest?", ["they usually have longer orbital periods because they are farther from the Sun", "they have shorter years because they are larger", "they do not experience gravity", "they orbit Earth"], 0, "Farther routes usually mean longer years."],
      ["If a body mainly orbits Jupiter, it is best classified first as a ...", ["moon", "planet", "star", "galaxy"], 0, "Main host body is the first classification question."],
      ["What is an astronomical unit based on?", ["the mean Earth-Sun distance", "the Moon's diameter", "the distance from Earth to Mars only", "one light-year"], 0, "An AU is built from the Earth-Sun distance scale."],
      ["Which statement best protects the structure of the Solar System?", ["planets orbit the Sun directly, while moons mainly orbit planets", "all bodies orbit Earth directly", "all bodies orbit the Sun in exactly the same way", "only planets belong to the Solar System"], 0, "The Solar System includes nested relationships and more than one body type."],
      ["Why is 'a bigger drawing gap means a bigger real distance by the same factor everywhere' weak?", ["because the sketch is compressed and not to scale", "because planets never change position", "because all real distances are equal", "because moons decide the scale"], 0, "Model drawings usually compress the real distances very strongly."],
      ["Which trend is strongest for planets orbiting the Sun?", ["farther from the Sun usually means a longer orbital period", "farther from the Sun always means a shorter orbital period", "orbital period is unrelated to route size", "inner planets have the longest years"], 0, "The main trend is longer period for farther orbits."],
    ]),
    ...shortMany(hint, [
      { prompt: "A farther orbit usually means a longer orbital ...", acceptedAnswers: exact("period", "year") },
      { prompt: "A body orbiting a planet is usually a ...", acceptedAnswers: exact("moon", "satellite", "natural satellite") },
      { prompt: "The Solar System is centered on the ...", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "A classroom Solar System diagram is not to ...", acceptedAnswers: exact("scale") },
      { prompt: "AU is based on the Earth-Sun ...", acceptedAnswers: exact("distance", "mean distance") },
      { prompt: "Inner planets generally have shorter ... than outer planets.", acceptedAnswers: exact("years", "orbital periods", "periods") },
      { prompt: "Planets, moons, asteroids, and comets belong to one Sun-centered ...", acceptedAnswers: exact("system", "family", "gravitational family") },
      { prompt: "Outer planets lie ... from the Sun than inner planets.", acceptedAnswers: exact("farther", "further") },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Use main host body and scale compression before reading the picture literally.";
  return [
    ...mcMany(hint, [
      ["Why is it weak to treat equal gaps in a Solar System diagram as literal equal real distances?", ["because the diagram is a compressed model and not to scale", "because planets never move", "because the Sun changes its size", "because gravity only works in drawings"], 0, "Solar System diagrams usually compress huge real distances."],
      ["Why is 'all Solar System bodies orbit the Sun in exactly the same way' too weak?", ["because moons mainly orbit planets even though the whole system is Sun-centered", "because planets do not move", "because only asteroids orbit the Sun", "because the Sun orbits Earth"], 0, "The system has nested orbital relationships, not one identical pattern for every body."],
      ["If Mercury has a shorter year than Neptune, what is the best reason?", ["Mercury's orbit is much smaller", "Mercury rotates more slowly", "Mercury is brighter", "Mercury has more moons"], 0, "The main reason is the smaller orbital route and shorter period."],
      ["A body mainly orbits Saturn but travels with Saturn around the Sun. Which classification is strongest?", ["moon", "planet", "star", "constellation"], 0, "Main host body is the first classification rule."],
      ["Why is main host body a useful classification idea?", ["it separates planets from moons and keeps nested orbits clear", "it tells the color of the body", "it replaces orbital period", "it makes diagrams exactly to scale"], 0, "Host-body thinking prevents planet-moon confusion."],
      ["Which description best fits asteroids and comets at this level?", ["smaller Sun-centered Solar System bodies", "stars that orbit Earth", "moons of the Sun", "eclipses"], 0, "They are part of the Solar System family as smaller bodies."],
      ["Why is 'outer planets have longer years because they spin more slowly' weak?", ["because year length is an orbital-period question, not an axis-rotation question", "because outer planets do not rotate", "because spinning sets Earth-Sun distance", "because only inner planets spin"], 0, "A year is one orbit, not one spin."],
      ["If a sketch shows Neptune only a little farther out than Earth, what should you say first?", ["the model is compressed and is not a scale drawing", "Neptune must actually be close to Earth", "the Sun has moved", "gravity no longer matters"], 0, "The first protection is to state that the sketch is not to scale."],
      ["Why is AU a useful distance unit in this topic?", ["because Solar System distances are so large that Earth-Sun distance is a convenient reference scale", "because AU measures mass", "because AU gives the number of moons", "because AU is the same as a light-year"], 0, "AU is a useful Solar System distance scale."],
      ["Which quantity is linked most directly to year length?", ["orbital period", "daily rotation period", "phase cycle", "apparent brightness"], 0, "A year is one orbital period."],
      ["Which summary is strongest?", ["The Solar System is a Sun-centered family with nested orbits, longer years farther out, and sketches that are usually not to scale", "The Solar System is only the planets shown at equal spacing", "All bodies orbit the Sun directly and equally", "Only planets matter because moons are separate systems"], 0, "This summary keeps structure, period trend, and scale caution together."],
      ["Why is sorting by role stronger than sorting by size alone?", ["because main host body and orbital relationship answer what kind of Solar System object it is", "because bigger objects are always planets", "because smaller objects never orbit anything", "because size replaces gravity"], 0, "Role and host body are more reliable than size alone for the family structure."],
    ]),
    ...shortMany(hint, [
      { prompt: "One reason Solar System diagrams can mislead is that they are not to ...", acceptedAnswers: exact("scale") },
      { prompt: "Outer planets generally take ... to orbit the Sun.", acceptedAnswers: exact("longer", "longer time") },
      { prompt: "The astronomical unit is based on the mean Earth-Sun ...", acceptedAnswers: exact("distance") },
      { prompt: "Planets orbit the ... directly.", acceptedAnswers: exact("Sun", "the Sun") },
      { prompt: "Moons usually orbit ...", acceptedAnswers: exact("planets", "a planet") },
      { prompt: "A longer year goes with a larger orbital ...", acceptedAnswers: exact("route", "orbit", "orbital path") },
      { prompt: "The Solar System is one Sun-centered gravitational ...", acceptedAnswers: exact("family", "system") },
      { prompt: "Main host body helps distinguish a moon from a ...", acceptedAnswers: exact("planet") },
    ]),
  ];
}

const M13_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  M13_L1: l1DiagnosticRaw,
  M13_L2: l2DiagnosticRaw,
  M13_L3: l3DiagnosticRaw,
  M13_L4: l4DiagnosticRaw,
  M13_L5: l5DiagnosticRaw,
  M13_L6: l6DiagnosticRaw,
};

const M13_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  M13_L1: l1ConceptRaw,
  M13_L2: l2ConceptRaw,
  M13_L3: l3ConceptRaw,
  M13_L4: l4ConceptRaw,
  M13_L5: l5ConceptRaw,
  M13_L6: l6ConceptRaw,
};

const M13_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  M13_L1: () => combine(l1DiagnosticRaw(), l1ConceptRaw()),
  M13_L2: () => combine(l2DiagnosticRaw(), l2ConceptRaw()),
  M13_L3: () => combine(l3DiagnosticRaw(), l3ConceptRaw()),
  M13_L4: () => combine(l4DiagnosticRaw(), l4ConceptRaw()),
  M13_L5: () => combine(l5DiagnosticRaw(), l5ConceptRaw()),
  M13_L6: () => combine(l6DiagnosticRaw(), l6ConceptRaw()),
};

export function m13GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M13_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function m13GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M13_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function m13GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = M13_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
