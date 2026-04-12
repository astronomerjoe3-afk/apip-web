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
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
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
    const id = `${compactCode(code)}-${stageLabel(kind)}-${String(index + 1).padStart(2, "0")}`;
    return item.kind === "mc"
      ? [mcItem(id, item.prompt, item.choices, item.answerIndex, item.hint, item.explanation)]
      : [shortItem(id, item.prompt, item.acceptedAnswers, item.hint)];
  });

  const min = minimumSize(kind);
  if (deduped.length < min) {
    throw new Error(`F5 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function formatNumber(value: number, digits = 3): string {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function numericAnswers(value: number, unit: string, digits = 3): string[] {
  const plain = formatNumber(value, digits);
  return Array.from(new Set([plain, `${plain} ${unit}`]));
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function mergeAnswers(...groups: string[][]): string[] {
  return Array.from(new Set(groups.flat()));
}

function hourAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "h"), numericAnswers(value, "hour"), numericAnswers(value, "hours"));
}

function dayAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "day"), numericAnswers(value, "days"));
}

function monthAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "month"), numericAnswers(value, "months"));
}

function yearAnswers(value: number): string[] {
  return mergeAnswers(numericAnswers(value, "year"), numericAnswers(value, "years"), numericAnswers(value, "d"), dayAnswers(value));
}

function degreeAnswers(value: number): string[] {
  const plain = formatNumber(value);
  return words(plain, `${plain} degree`, `${plain} degrees`);
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep main host, nested orbit, and gravity on one Earth-Moon-Sun system picture.";
  return [
    mc("Which body does Earth mainly orbit in this lesson model?", ["the Sun", "the Moon", "Mars", "itself"], 0, "Earth's main host is the Sun.", hint),
    mc("Which body does the Moon mainly orbit?", ["the Sun", "Earth", "Venus", "the Milky Way"], 1, "The Moon's direct main host is Earth.", hint),
    mc("Which statement best matches the Earth-Moon-Sun system?", ["Earth orbits the Moon while both orbit the Sun", "Earth and Moon are fixed while the Sun moves around them", "Earth orbits the Sun while the Moon orbits Earth inside that larger journey", "The Moon cannot orbit Earth if Earth also moves"], 2, "The local Moon-Earth orbit sits inside the wider Earth-Sun orbit.", hint),
    mc("What keeps the Moon on a curved path around Earth rather than moving straight on forever?", ["gravity", "sunlight", "air resistance", "magnetism"], 0, "Gravity provides the inward pull needed for orbit.", hint),
    mc("A spacecraft circles Earth while Earth moves around the Sun. What is the spacecraft's main host?", ["Earth", "the Sun", "the Moon", "both equally"], 0, "Main host means the body it directly orbits.", hint),
    mc("Why is 'the Moon orbits Earth' not contradicted by 'Earth and Moon go around the Sun'?", ["Because orbit relationships can be nested", "Because the Sun stops pulling on the Moon", "Because Earth becomes a star in that case", "Because the Moon stays motionless relative to Earth"], 0, "The smaller local orbit and the larger shared orbit can happen together.", hint),
    mc("Which clue is strongest for identifying a body's main host?", ["the biggest object anywhere in the picture", "the body it mainly circles directly", "the brightest object in the system", "the body nearest the observer"], 1, "Main host is set by the direct orbit relation.", hint),
    mc("Which warning best fits most classroom Earth-Moon-Sun sketches?", ["The distances are heavily compressed", "The Moon is drawn too bright, so gravity changes", "The Sun should be smaller than Earth", "The Moon should touch Earth"], 0, "Astronomy sketches usually preserve relationships, not literal scale.", hint),
    mc("Which statement about orbital motion is strongest here?", ["Gravity plus sideways motion can produce orbit", "Gravity alone always means a straight-line path", "Sideways motion removes the need for gravity", "Orbit happens only if there is air"], 0, "An orbit needs inward pull and sideways motion together.", hint),
    mc("If something mainly orbits Earth, it belongs first in which family?", ["moon or satellite family", "star family", "planet family", "comet family"], 0, "Objects mainly orbiting Earth are Earth-hosted satellites or moons.", hint),
    mc("Which claim is wrong?", ["The Earth-Moon pair also moves around the Sun", "The Moon can circle Earth while both bodies move", "The Moon can orbit Earth only if Earth stands still", "Gravity matters for the curved path"], 2, "Earth does not need to stand still for the Moon to orbit it.", hint),
    mc("What is the best reading of the Moon's motion in this module?", ["It has only one motion and that must be Sun-centered", "It has a local orbit around Earth inside a wider Sun-centered motion", "It is fixed in space while Earth moves", "It moves only because light pushes it"], 1, "Keep the local and wider motions in separate slots.", hint),
    shortCases([
      { prompt: "Earth's main host body in this module is the ...", acceptedAnswers: words("Sun", "the Sun"), hint: "Think about the wider orbit." },
      { prompt: "The Moon's main host body is ...", acceptedAnswers: words("Earth", "the Earth"), hint: "Think about the smaller local orbit." },
      { prompt: "A body in orbit needs gravity plus ... motion.", acceptedAnswers: words("sideways", "forward", "tangential"), hint: "It is the motion that stops a straight fall inward." },
      { prompt: "An artificial object circling Earth is a ...", acceptedAnswers: words("satellite", "artificial satellite"), hint: "It is Earth-hosted." },
      { prompt: "The Earth-Moon pair also travels around the ...", acceptedAnswers: words("Sun", "the Sun"), hint: "That is the wider shared journey." },
      { prompt: "Astronomy system diagrams are often strongly ... in distance scale.", acceptedAnswers: words("compressed", "not to scale"), hint: "Do not trust the literal spacing." },
      { prompt: "The smaller-scale orbit in the Earth-Moon-Sun system is the Moon around ...", acceptedAnswers: words("Earth", "the Earth"), hint: "Name the direct host." },
      { prompt: "Main host is the body an object mainly ... directly.", acceptedAnswers: words("orbits", "circles"), hint: "Use host-language, not just biggest-body language." },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the difference between a local orbit and the wider shared motion of the whole system.";
  return [
    mc("Why is 'everything goes around the Sun' too weak as the only description of the Moon?", ["Because it hides the Moon's direct Earth-host relation", "Because the Sun has no gravity", "Because only planets move around the Sun", "Because the Moon never moves around the Sun at all"], 0, "The Sun-only sentence loses the important local Earth-Moon orbit.", hint),
    mc("Why can a satellite still be Earth-hosted while Earth moves around the Sun?", ["Because the direct orbit relation is with Earth", "Because the Sun switches off during satellite motion", "Because satellites are too small to feel solar gravity", "Because only the observer decides the host"], 0, "Main host depends on the direct circling relation.", hint),
    mc("Why are nested orbits not a contradiction?", ["Because a smaller local motion can sit inside a larger shared motion", "Because gravity works only one body at a time", "Because local motion removes the wider motion", "Because the Moon becomes fixed relative to the Sun"], 0, "The Moon can circle Earth while the pair also travels around the Sun.", hint),
    mc("What is missing if someone says 'gravity keeps the Moon in orbit' and stops there?", ["the sideways motion that keeps it from falling straight in", "the Moon's mass", "the color of the Moon", "the presence of sunlight"], 0, "Orbit needs both inward pull and sideways motion.", hint),
    mc("Why is main-host language better than just naming the largest object in the whole picture?", ["Because host means the body directly orbited", "Because the largest object never matters", "Because bright objects are always hosts", "Because host and mass are unrelated"], 0, "Host is about the direct orbit relation, not just size.", hint),
    mc("Why is the Moon not classed as a planet in this lesson picture?", ["Because it mainly orbits Earth rather than the Sun directly", "Because it is smaller than Earth", "Because it is gray", "Because it has no gravity"], 0, "The main host clue separates moons from Sun-hosted worlds.", hint),
    mc("If Earth suddenly lost its sideways orbital motion around the Sun, what would happen to the Sun-centered orbit picture?", ["The orbit would fail because inward pull alone is not enough for circling", "Nothing would change", "Earth would become a moon of the Moon", "The Sun would stop pulling on Earth"], 0, "This tests the gravity-plus-sideways-motion rule.", hint),
    mc("Why is a shared Earth-Moon-Sun diagram stronger than isolated facts about day, phases, and eclipses?", ["Because one linked system can support several sky explanations together", "Because separate facts are always wrong", "Because scale no longer matters at all", "Because diagrams replace all reasoning"], 0, "The shared system view keeps the ideas coherent.", hint),
    mc("Which statement best preserves the hierarchy of motion?", ["The Moon's Earth orbit is local, and the Earth-Moon pair has a wider Sun orbit", "The Sun locally orbits Earth while Earth widely orbits the Moon", "The Moon and Earth are both fixed while only the Sun moves", "The local orbit must be ignored once a wider orbit exists"], 0, "Keep the two motion scales visible together.", hint),
    mc("Why should learners not read the spacing on a sketch literally?", ["Because the system picture is often relational rather than true-scale", "Because distance never matters in astronomy", "Because only time matters in astronomy", "Because gravity changes whenever a picture is small"], 0, "The diagram is there to preserve structure, not exact size ratios.", hint),
    mc("What is the strongest answer to 'If Earth moves, the Moon cannot orbit it'?", ["Orbiting a moving host is still orbiting that host", "A moving Earth cancels the Moon's gravity", "The Moon really orbits only the classroom diagram", "Nothing can orbit a body that is also orbiting"], 0, "A moving host can still have its own satellite.", hint),
    mc("Why does 'directly orbits' matter in host questions?", ["It separates the local controlling relation from the wider shared journey", "It means the biggest object in the universe", "It means the object never changes position", "It means only circular paths count"], 0, "Direct orbit language stops over-general Sun-only descriptions.", hint),
    shortCases([
      { prompt: "A local orbit can sit inside a larger ...", acceptedAnswers: words("orbit", "journey", "path"), hint: "That is why nested motion is possible." },
      { prompt: "The Moon is not a planet here because it mainly orbits ...", acceptedAnswers: words("Earth", "the Earth"), hint: "Use the host clue." },
      { prompt: "A complete orbit story needs inward gravity and ... motion.", acceptedAnswers: words("sideways", "forward", "tangential"), hint: "That second ingredient stops a straight inward fall." },
      { prompt: "A Sun-only description hides the Moon's local ... relation.", acceptedAnswers: words("Earth", "Earth-host", "Earth orbit"), hint: "Think about what the Moon directly circles." },
      { prompt: "The safest astronomy sketch warning is that the picture is not to ...", acceptedAnswers: words("scale"), hint: "That is the standard caution." },
      { prompt: "Main host means the body an object directly ...", acceptedAnswers: words("orbits", "circles"), hint: "It is a relation question." },
      { prompt: "Keeping Earth, Moon, and Sun together supports one linked ... picture.", acceptedAnswers: words("system", "shared system"), hint: "Do not split the topic into disconnected facts." },
      { prompt: "The wider shared motion of Earth and Moon is around the ...", acceptedAnswers: words("Sun", "the Sun"), hint: "That is the larger host for the pair." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep day-night tied to Earth's rotation, not to the yearly orbit.";
  return [
    mc("What motion causes day and night on Earth?", ["Earth's rotation", "Earth's yearly orbit", "the Moon's orbit", "the Sun spinning once per day"], 0, "The daily light-dark cycle comes from Earth rotating.", hint),
    mc("About how long does one full Earth rotation take in this lesson?", ["6 h", "12 h", "24 h", "365 d"], 2, "One day is about one 24 h rotation.", hint),
    mc("How much of Earth is lit by the Sun at any one moment?", ["all of it", "about half of it", "one quarter", "none of it"], 1, "A sphere lit from one direction has one lit half and one dark half.", hint),
    mc("A place is at local noon now. About 6 hours later it is moving toward...", ["another noon", "sunset", "midnight", "another sunrise"], 1, "A quarter-turn takes noon toward sunset.", hint),
    mc("A place is at local midnight now. About 6 hours later it is moving toward...", ["sunrise", "another midnight", "sunset", "local noon"], 0, "A quarter-turn after midnight takes the place toward sunrise.", hint),
    mc("If one city is at local noon, a city on the opposite side of Earth is closest to...", ["sunrise", "sunset", "local midnight", "another noon"], 2, "Opposite sides face opposite lighting conditions.", hint),
    mc("About 12 hours after local noon, a place should be closest to...", ["sunrise", "sunset", "local midnight", "another noon"], 2, "Half a rotation swaps noon and midnight.", hint),
    mc("What part of Earth's motion does not explain the ordinary daily light-dark cycle?", ["Earth's rotation", "Earth turning a place into and out of sunlight", "Earth's yearly orbit around the Sun", "the fixed sunlight direction"], 2, "Orbit explains the year, not the ordinary daily cycle.", hint),
    mc("If Earth made one complete rotation in 12 h instead of 24 h, the length of one day-night cycle would...", ["double", "halve", "stay the same", "become one year"], 1, "Faster rotation means a shorter day.", hint),
    mc("What is the best explanation of sunrise in this lesson?", ["The Sun moves closer to Earth", "Earth rotates the place into the lit half", "Earth finishes one orbit", "The Moon reflects extra light there"], 1, "Sunrise happens because the location is carried into sunlight.", hint),
    mc("Which statement is correct?", ["Opposite sides of Earth can have opposite local times at the same moment", "All places on Earth have noon at the same time", "The Sun lights all longitudes equally at once", "Midnight happens because Earth is farthest from the Sun"], 0, "Different longitudes face the Sun differently at the same moment.", hint),
    mc("A quarter of a 24 h rotation is...", ["3 h", "6 h", "12 h", "18 h"], 1, "One quarter of 24 is 6.", hint),
    shortCases([
      { prompt: "The Earth motion that causes day and night is ...", acceptedAnswers: words("rotation", "Earth's rotation", "spin", "Earth's spin"), hint: "Think daily, not yearly." },
      { prompt: "One full Earth spin is about ...", acceptedAnswers: hourAnswers(24), hint: "This is the duration of one day." },
      { prompt: "Half of a 24 h rotation is ...", acceptedAnswers: hourAnswers(12), hint: "Divide the full spin time by two." },
      { prompt: "A quarter of a 24 h rotation is ...", acceptedAnswers: hourAnswers(6), hint: "Divide the full spin time by four." },
      { prompt: "At any moment about half of Earth is ... by the Sun.", acceptedAnswers: words("lit", "illuminated"), hint: "The other half is dark." },
      { prompt: "The opposite lighting condition to local noon is local ...", acceptedAnswers: words("midnight", "local midnight"), hint: "Think opposite side of Earth." },
      { prompt: "A place reaches a new daylight condition because Earth keeps ...", acceptedAnswers: words("rotating", "turning", "spinning"), hint: "The Sun direction stays roughly fixed over one day." },
      { prompt: "Earth's orbit around the Sun mainly explains the ... rather than the day.", acceptedAnswers: words("year", "yearly cycle"), hint: "Do not swap the two timescales." },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Separate the 24 h spin story from the 365 d orbit story.";
  return [
    mc("Why is Earth's yearly orbit too weak to explain ordinary day and night?", ["Because one orbit takes about a year, not one day", "Because the orbit stops at night", "Because the Moon blocks the orbit", "Because only the Sun rotates"], 0, "Daily change needs the 24 h motion, not the yearly one.", hint),
    mc("Why can opposite sides of Earth have local noon and local midnight at the same moment?", ["Because Earth is spherical and lit from one side at a time", "Because the Sun changes brightness every minute", "Because the Moon lights the dark side", "Because Earth stops rotating at noon"], 0, "One lit half and one dark half exist together.", hint),
    mc("Why does a city change from darkness to daylight even if the Sun's direction stays fixed over one day?", ["Earth rotates the city into the lit half", "The Sun teleports to a new position", "The Moon reflects enough light to make day", "Earth's axis disappears"], 0, "The place moves, not the sunlight direction in the daily model.", hint),
    mc("Which statement best protects the timescale difference?", ["Rotation explains the day; orbit explains the year", "Orbit explains the day; rotation explains the year", "Both day and year come from rotation only", "Both day and year come from orbit only"], 0, "Do not collapse daily and yearly motions into one idea.", hint),
    mc("Why is 'the Sun rises' appearance-language rather than the full physical cause?", ["Because the visible daily sweep comes from Earth's rotation from our viewpoint", "Because the Sun truly goes around Earth every day", "Because the Moon pulls the Sun upward", "Because sunrise has no motion in it"], 0, "This is a viewpoint statement, not the deepest cause.", hint),
    mc("Why is half-Earth-lit language useful before talking about specific cities?", ["It shows the global pattern that local times come from", "It proves all places have the same time", "It replaces the need for rotation", "It means orbit no longer matters at all"], 0, "Start with the whole-Earth geometry first.", hint),
    mc("A city starts at sunrise. About 6 hours later it should be nearest to...", ["midnight", "sunset", "local noon", "another sunrise"], 2, "Sunrise to noon is roughly a quarter-turn.", hint),
    mc("Why does a place not stay at noon all day?", ["Because Earth keeps rotating and carries it away from the Sun-facing line", "Because the Sun switches off after noon", "Because gravity disappears in the afternoon", "Because the orbit changes every hour"], 0, "Noon is just one moment in the full spin.", hint),
    mc("Why can the Sun's daily path be treated as apparent motion?", ["Because it is what we see from Earth while Earth rotates", "Because the Sun never moves in any wider sense", "Because apparent means imaginary and useless", "Because only stars can show apparent motion"], 0, "Apparent means viewpoint-based, not fake.", hint),
    mc("What would happen to the length of the day if Earth rotated more slowly?", ["The day would get longer", "The day would get shorter", "The year would vanish", "All places would share noon permanently"], 0, "Slower rotation stretches the daily cycle.", hint),
    mc("Why is one lit half and one dark half enough to explain opposite local times?", ["Because different longitudes sit at different positions relative to the Sun at the same moment", "Because every place sees the same Sun angle at once", "Because night is caused by clouds", "Because orbit changes each longitude separately"], 0, "Different longitudes sample the lit-dark pattern differently.", hint),
    mc("Which claim best corrects 'night happens when Earth is farther from the Sun'?", ["Night happens when a place is turned away from the Sun by rotation", "Night happens because the Sun cools down", "Night happens only in winter", "Night happens because the Moon absorbs sunlight"], 0, "This is a rotation-and-viewpoint story.", hint),
    shortCases([
      { prompt: "The daily light-dark cycle belongs to Earth's ... timescale.", acceptedAnswers: words("rotation", "spin", "daily rotation"), hint: "Use the shorter motion slot." },
      { prompt: "The yearly cycle belongs to Earth's ... around the Sun.", acceptedAnswers: words("orbit", "revolution"), hint: "Use the longer motion slot." },
      { prompt: "At any one moment one hemisphere faces the ... more directly.", acceptedAnswers: words("Sun", "the Sun"), hint: "That is why it is lit." },
      { prompt: "A place about 12 hours after local noon should be near local ...", acceptedAnswers: words("midnight", "local midnight"), hint: "Half a turn swaps the two." },
      { prompt: "From Earth's viewpoint, the Sun's daily sweep is called ... motion.", acceptedAnswers: words("apparent", "apparent motion"), hint: "It is what we see." },
      { prompt: "Different local times around Earth happen because the planet is ...", acceptedAnswers: words("rotating", "spinning", "turning"), hint: "This keeps different longitudes at different Sun-facing angles." },
      { prompt: "A place starting at sunrise is near local ... about 6 hours later.", acceptedAnswers: words("noon", "local noon"), hint: "That is a quarter-turn later." },
      { prompt: "The safest day-night summary is one lit half, one dark half, and Earth ...", acceptedAnswers: words("rotates", "spins", "turns"), hint: "That is the core mechanism." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use axial tilt plus orbit position before reaching for a simple distance explanation.";
  return [
    mc("What is the main cause of Earth's seasons in this module?", ["Earth's axial tilt", "Earth being much nearer the Sun in summer", "the Moon changing phase", "daily clouds"], 0, "Seasons are mainly a tilt-and-sunlight-angle story.", hint),
    mc("When the Northern Hemisphere leans toward the Sun, it is usually...", ["winter in the north", "summer in the north", "winter in both hemispheres", "summer in both hemispheres"], 1, "Leaning toward the Sun gives more direct sunlight and longer days.", hint),
    mc("At the same moment that it is summer in the Northern Hemisphere, it is most likely...", ["summer in the Southern Hemisphere", "winter in the Southern Hemisphere", "spring everywhere", "autumn everywhere"], 1, "Opposite hemispheres can have opposite seasons at the same time.", hint),
    mc("About how long does Earth take to complete one orbit around the Sun?", ["24 h", "30 d", "365 d", "10 y"], 2, "One year is about one orbit.", hint),
    mc("About how long is half of Earth's orbit?", ["6 hours", "6 days", "6 months", "12 months"], 2, "Half of a year is about six months.", hint),
    mc("What is Earth's axis tilt approximately?", ["2.35 degrees", "23.5 degrees", "45 degrees", "90 degrees"], 1, "This is the standard lesson value.", hint),
    mc("Which statement is the best correction to 'summer happens because Earth is closer to the Sun'?", ["Seasons are mainly due to tilt and sunlight angle", "Summer is caused by the Moon being fuller", "Summer happens when Earth rotates faster", "Summer happens only at the equator"], 0, "The opposite-hemisphere pattern rules out a simple distance story.", hint),
    mc("If Earth moves to the opposite side of its orbit while keeping the same axis direction in space, what happens to the seasonal lean?", ["It reverses between the hemispheres", "It stays summer in both hemispheres", "It disappears completely", "It makes the Sun move around Earth"], 0, "Half an orbit later the hemisphere leaning toward the Sun swaps.", hint),
    mc("Why does a hemisphere leaning toward the Sun get warmer conditions?", ["It gets more direct sunlight and usually longer daylight", "It gets much closer to the Sun than the other hemisphere", "It stops rotating", "Its gravity becomes weaker"], 0, "Directness and day length both matter.", hint),
    mc("Which observation best argues against simple Earth-Sun distance as the main seasonal cause?", ["Opposite hemispheres have opposite seasons at the same time", "Earth rotates once per day", "The Moon changes phase", "The Sun is bright"], 0, "The two hemispheres are on the same planet but can have opposite seasons.", hint),
    mc("Which statement about the axis is correct in this lesson?", ["The axis keeps nearly the same direction in space during the orbit", "The axis flips every month", "The axis always points straight at the Sun", "The axis vanishes at the equator"], 0, "That steady tilt direction is central to the seasons model.", hint),
    mc("If the Southern Hemisphere is leaning toward the Sun, the Northern Hemisphere is most likely in...", ["summer", "winter", "the same season as the south", "no season at all"], 1, "The hemispheres swap roles.", hint),
    shortCases([
      { prompt: "The main seasonal cause is Earth's axial ...", acceptedAnswers: words("tilt", "axial tilt", "tilted axis"), hint: "It is not the simple near-far story." },
      { prompt: "One full Earth orbit is about ...", acceptedAnswers: yearAnswers(365), hint: "Think one year." },
      { prompt: "Half an Earth orbit is about ...", acceptedAnswers: monthAnswers(6), hint: "Think half of a year." },
      { prompt: "Earth's axis tilt is about ...", acceptedAnswers: degreeAnswers(23.5), hint: "Use the lesson constant." },
      { prompt: "A hemisphere leaning toward the Sun receives more ... sunlight.", acceptedAnswers: words("direct", "more direct"), hint: "That angle clue matters." },
      { prompt: "North and south can have opposite ... at the same time.", acceptedAnswers: words("seasons", "season"), hint: "That is a key test of the model." },
      { prompt: "The simple near-far explanation is not the main ... of seasons.", acceptedAnswers: words("cause", "explanation"), hint: "Use the module's contrast language." },
      { prompt: "As Earth orbits, the axis keeps nearly the same ... in space.", acceptedAnswers: words("direction"), hint: "That keeps the seasonal swap coherent." },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Protect the tilt-and-hemisphere story against the tempting distance myth.";
  return [
    mc("Why do opposite hemispheres having opposite seasons at the same time argue against simple Earth-Sun distance as the main cause?", ["Because both hemispheres are almost the same distance from the Sun at any moment", "Because one hemisphere has no atmosphere", "Because the Moon controls the seasons", "Because distance never changes at all"], 0, "The same-planet opposite-season pattern points to tilt, not simple distance.", hint),
    mc("Why does leaning toward the Sun matter for a hemisphere?", ["It raises the sunlight angle and usually lengthens daylight", "It stops the hemisphere rotating", "It removes gravity from that hemisphere", "It makes the Sun closer only to that half"], 0, "The season mechanism is about angle and day length.", hint),
    mc("Why is the axis direction in space important to the seasons model?", ["It makes the lean relation swap only after Earth changes orbital position", "It means both hemispheres always lean toward the Sun", "It causes Earth to stop orbiting", "It proves distance is the main factor"], 0, "A steady tilt direction lets one hemisphere lean toward the Sun, then later the other.", hint),
    mc("If Earth had no axial tilt, what would happen to strong opposite-hemisphere seasons?", ["They would be much weaker because the lean contrast would disappear", "They would become stronger", "They would reverse every day", "They would depend only on Moon phases"], 0, "No tilt means no strong yearly lean contrast.", hint),
    mc("Why is 'summer means Earth is closer to the Sun' a weak explanation for the whole planet?", ["Because it cannot explain why the other hemisphere is often in winter at the same time", "Because Earth never moves around the Sun", "Because the Sun's temperature changes daily", "Because summer lasts only one day"], 0, "The opposite-hemisphere evidence is the key correction.", hint),
    mc("Why do longer daylight hours support warmer seasons?", ["Because sunlight can heat the surface for more of each day", "Because longer days stop Earth rotating", "Because longer days remove the Sun's gravity", "Because longer days make the orbit smaller"], 0, "Time under sunlight adds to the seasonal effect.", hint),
    mc("Why is direct sunlight more effective than slanting sunlight in this context?", ["Because the same incoming energy is spread over a smaller area", "Because direct rays travel faster", "Because direct rays have no color", "Because direct rays cancel the orbit"], 0, "Angle changes how concentrated the incoming energy is.", hint),
    mc("Which statement best preserves the seasons mechanism?", ["Tilt and orbit position together control which hemisphere receives more direct sunlight", "Distance alone decides every season", "Moon phases set the season pattern", "Daily rotation alone sets summer and winter"], 0, "Use the combined tilt-plus-orbit story.", hint),
    mc("Why is a one-hemisphere-only explanation incomplete?", ["Because the opposite hemisphere offers the strongest test of the model", "Because seasons happen only at the equator", "Because one hemisphere has no weather", "Because the Sun lights only one hemisphere all year"], 0, "The north-south contrast gives the model its force.", hint),
    mc("Roughly half an orbit after Northern Hemisphere summer, what should the north be in?", ["spring", "summer again", "winter", "no season"], 2, "Half an orbit later the lean relation reverses.", hint),
    mc("Why can the same Earth-Sun distance not give summer to one hemisphere and winter to the other by itself?", ["Because distance is nearly shared by both hemispheres on the same planet", "Because each hemisphere has its own Sun", "Because gravity changes direction between hemispheres", "Because distance only affects stars"], 0, "This is why tilt is stronger than the near-far myth.", hint),
    mc("Which evidence is strongest for tilt rather than distance?", ["One hemisphere's summer happening alongside the other's winter", "Earth taking one day to rotate", "The Moon showing phases", "The Sun being a star"], 0, "This is the most direct comparison.", hint),
    shortCases([
      { prompt: "Opposite simultaneous seasons point to axial ... rather than simple distance.", acceptedAnswers: words("tilt", "axial tilt"), hint: "Use the module's core cause." },
      { prompt: "A hemisphere leaning toward the Sun usually has longer ...", acceptedAnswers: words("daylight", "days", "daylight hours"), hint: "That adds to seasonal heating." },
      { prompt: "The yearly seasonal cycle follows Earth's ... around the Sun.", acceptedAnswers: words("orbit", "revolution"), hint: "That is the long-timescale motion." },
      { prompt: "At opposite sides of the orbit the seasonal roles ... between the hemispheres.", acceptedAnswers: words("swap", "reverse"), hint: "The two hemispheres trade the lean advantage." },
      { prompt: "The near-far myth fails because both hemispheres belong to the same ...", acceptedAnswers: words("planet", "Earth"), hint: "Their Sun distance is almost shared." },
      { prompt: "More direct sunlight concentrates the same incoming energy on a ... area.", acceptedAnswers: words("smaller"), hint: "That is why directness matters." },
      { prompt: "Without axial tilt, strong opposite-hemisphere seasonal contrast would be much ...", acceptedAnswers: words("smaller", "weaker", "reduced"), hint: "The lean contrast would be missing." },
      { prompt: "The cleanest season summary is tilt plus orbit ...", acceptedAnswers: words("position"), hint: "Those two ideas must stay together." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep ordinary Moon phases separate from the rarer shadow events called eclipses.";
  return [
    mc("How much of the Moon is lit by the Sun at any ordinary moment?", ["none", "one quarter", "half", "all of it"], 2, "The Sun lights half of the Moon all the time in the ordinary phase model.", hint),
    mc("What mainly causes the changing Moon phases we see from Earth?", ["Earth's daily rotation", "changing viewing angle as the Moon orbits Earth", "Earth's shadow every month", "the Sun changing size"], 1, "Phases come from changing geometry, not ordinary monthly shadowing.", hint),
    mc("At full Moon, what do we see from Earth?", ["all of the Moon's sunlit half", "none of the Moon's sunlit half", "only one quarter of the sunlit half", "Earth's shadow on the Moon"], 0, "Full Moon means the full sunlit face is turned toward us.", hint),
    mc("At new Moon, what do we see from Earth?", ["nearly none of the sunlit half", "all of the sunlit half", "half of the sunlit half", "Earth's entire shadow every time"], 0, "The lit half points mostly away from us.", hint),
    mc("At first quarter, how much of the Moon's sunlit half is visible from Earth?", ["none", "half", "all", "more than all"], 1, "First quarter shows half of the sunlit half.", hint),
    mc("A lunar eclipse needs which line-up?", ["Sun-Moon-Earth", "Sun-Earth-Moon", "Moon-Sun-Earth", "Earth-Sun-Moon"], 1, "Earth must lie between Sun and Moon for Earth's shadow to reach the Moon.", hint),
    mc("A solar eclipse needs which line-up?", ["Sun-Earth-Moon", "Earth-Sun-Moon", "Sun-Moon-Earth", "Moon-Earth-Sun"], 2, "The Moon must lie between Sun and Earth.", hint),
    mc("Which statement is correct?", ["Earth's shadow causes every ordinary phase", "Phases are a viewing-angle effect, while eclipses need special alignment", "Every full Moon is a lunar eclipse", "Every new Moon is a solar eclipse"], 1, "This cleanly separates monthly phases from special eclipse events.", hint),
    mc("Can a lunar eclipse happen at first quarter Moon?", ["yes, every month", "yes, if the Sun is brighter", "no, the geometry is wrong", "no, because the Moon is unlit"], 2, "A lunar eclipse needs full-Moon-type alignment, not quarter geometry.", hint),
    mc("Which moon phase is closest to the geometry needed for a solar eclipse?", ["full Moon", "new Moon", "first quarter", "third quarter"], 1, "Solar eclipse geometry is near new Moon.", hint),
    mc("Which moon phase is closest to the geometry needed for a lunar eclipse?", ["new Moon", "first quarter", "full Moon", "crescent"], 2, "Lunar eclipse geometry is near full Moon.", hint),
    mc("Why does a full Moon not automatically mean a lunar eclipse?", ["Because the special straight-line alignment is not perfect every month", "Because full Moon means the Moon is unlit", "Because Earth has no shadow", "Because the Sun blocks the Moon"], 0, "The phase can be right while the shadow line-up is still off.", hint),
    shortCases([
      { prompt: "The Moon is always half ... by the Sun in the ordinary phase model.", acceptedAnswers: words("lit", "illuminated"), hint: "That stays constant while the viewed fraction changes." },
      { prompt: "Moon phases change because our ... angle changes.", acceptedAnswers: words("viewing", "viewing angle"), hint: "Think geometry, not monthly shadow." },
      { prompt: "A lunar eclipse happens when the Moon enters Earth's ...", acceptedAnswers: words("shadow"), hint: "That is the special-event part." },
      { prompt: "A solar eclipse happens when the Moon blocks the ... from Earth.", acceptedAnswers: words("Sun", "the Sun"), hint: "The Moon sits between Earth and Sun." },
      { prompt: "An eclipse needs special straight-line ...", acceptedAnswers: words("alignment", "line-up", "lineup"), hint: "The ordinary phase cycle is not enough by itself." },
      { prompt: "At first quarter we see half of the Moon's ... half.", acceptedAnswers: words("sunlit", "lit"), hint: "The Moon itself is still half lit." },
      { prompt: "Ordinary monthly phases are not mainly caused by Earth's ...", acceptedAnswers: words("shadow"), hint: "Reserve that for eclipses." },
      { prompt: "A full Moon is a phase, not automatically a lunar ...", acceptedAnswers: words("eclipse"), hint: "Do not collapse the two ideas together." },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep constant sunlight on half the Moon separate from the changing fraction we can see.";
  return [
    mc("Why does 'the Moon is always half lit' stay true even when we see a crescent?", ["Because a crescent means we see only a small part of the sunlit half", "Because crescents happen when the Sun lights less than half the Moon", "Because only eclipses can make the Moon half lit", "Because Earth adds extra light to the dark side"], 0, "The visible fraction changes; the physical half-lit fact remains.", hint),
    mc("Why is Earth's shadow a weak explanation for ordinary monthly phases?", ["Because phases happen every orbit, while Earth's shadow is needed only in special eclipse alignments", "Because Earth has no shadow at all", "Because the Sun never lights the Moon", "Because phases happen only during daytime"], 0, "The phase cycle is regular; eclipses are rarer special cases.", hint),
    mc("Why can a full Moon occur without a lunar eclipse?", ["Because the phase geometry can be full-like without perfect Sun-Earth-Moon shadow alignment", "Because full Moon means the Moon is dark", "Because the Moon blocks the Sun instead", "Because full Moon happens only in daytime"], 0, "Phase and eclipse conditions are related but not identical.", hint),
    mc("Why can a new Moon occur without a solar eclipse?", ["Because the Moon can be near the Sun direction without lining up closely enough to cast its shadow on Earth", "Because new Moon means the Moon disappears from space", "Because solar eclipses need full Moon", "Because Earth blocks the Sun every month"], 0, "Again, the phase is not enough; the line-up must be special.", hint),
    mc("Why should first-quarter Moon never be used as evidence for a lunar eclipse?", ["Because lunar eclipse needs full-Moon-type alignment, not a right-angle viewing geometry", "Because first quarter means the Moon is unlit", "Because Earth's shadow reaches the Moon only at sunrise", "Because phases and eclipses are the same thing"], 0, "Quarter geometry is the wrong arrangement for Earth's shadow to hit the Moon fully.", hint),
    mc("Which statement best separates phase from eclipse?", ["A phase is the apparent shape of the lit part; an eclipse is a special shadow event", "A phase is when Earth blocks sunlight; an eclipse is the ordinary monthly cycle", "A phase and an eclipse are two words for the same event", "An eclipse changes the Sun's brightness while a phase changes Earth's rotation"], 0, "This is the clean contrast the lesson needs.", hint),
    mc("Why is comparing full Moon and crescent Moon useful before talking about eclipses?", ["Because both cases still start from the constant half-lit Moon", "Because crescents are caused by Earth's shadow", "Because full Moon means the Sun is behind Earth every day", "Because crescents happen only during eclipses"], 0, "Start with the ordinary phase mechanism before special shadows.", hint),
    mc("What stays physically true through new, crescent, quarter, and full Moon?", ["The Sun continues to light half of the Moon", "The Earth keeps shadowing half of the Moon", "The Moon changes its size", "The Moon's orbit stops and restarts"], 0, "This constant fact anchors the whole topic.", hint),
    mc("Why is alignment the key word for eclipses?", ["Because the shadow event needs a much straighter Sun-Earth-Moon line than the ordinary phase cycle", "Because alignment means the Moon stops moving", "Because alignment removes the Sun's light", "Because alignment is another name for phase"], 0, "Special line-up is what makes eclipse different.", hint),
    mc("Which pair is matched correctly?", ["new Moon with solar-eclipse-type geometry, full Moon with lunar-eclipse-type geometry", "full Moon with solar-eclipse-type geometry, new Moon with lunar-eclipse-type geometry", "first quarter with both eclipses", "crescent with both eclipses"], 0, "Solar eclipses cluster near new Moon; lunar eclipses near full Moon.", hint),
    mc("Why is 'full Moon means Earth shadow' unacceptable?", ["Because full Moon normally means we see the sunlit face, not that Earth is shadowing the Moon", "Because Earth has no shadow", "Because full Moon occurs only once in a year", "Because full Moon means the Moon makes its own light"], 0, "Full Moon is usually a phase, not an eclipse.", hint),
    mc("Why is 'new Moon means eclipse' also too strong?", ["Because new Moon gives the right rough direction but not the exact shadow-causing alignment every time", "Because new Moon means the Moon is behind Earth", "Because eclipses only happen at full Moon", "Because new Moon changes Earth's axis"], 0, "Phase geometry is necessary but not sufficient.", hint),
    shortCases([
      { prompt: "A phase is the apparent shape of the Moon's ... part.", acceptedAnswers: words("lit", "sunlit", "illuminated"), hint: "That is the definition slot." },
      { prompt: "Eclipses need special Sun-Earth-Moon ...", acceptedAnswers: words("alignment", "line-up", "lineup"), hint: "That is what makes them rarer than phases." },
      { prompt: "Ordinary phases come from changing ... rather than monthly shadow events.", acceptedAnswers: words("viewing angle", "viewpoint", "geometry"), hint: "Use the observer-language clue." },
      { prompt: "A lunar eclipse is closest to ... Moon geometry.", acceptedAnswers: words("full"), hint: "Earth must lie between Sun and Moon." },
      { prompt: "A solar eclipse is closest to ... Moon geometry.", acceptedAnswers: words("new"), hint: "The Moon must lie between Earth and Sun." },
      { prompt: "The phrase that should stay constant through all phases is 'half ... by the Sun'.", acceptedAnswers: words("lit", "illuminated"), hint: "Do not let the visible fraction replace the physical fact." },
      { prompt: "Earth's shadow is the direct cause of a lunar ...", acceptedAnswers: words("eclipse"), hint: "That is the shadow event, not the monthly phase cycle." },
      { prompt: "The clean topic split is phases as viewpoint, eclipses as special ...", acceptedAnswers: words("alignment", "shadow alignment"), hint: "That is the final contrast." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Classify Solar System bodies by main host plus body type, not by one vague label.";
  return [
    mc("A large world mainly orbiting the Sun and not producing its own light is best classed as a...", ["planet", "moon", "comet", "star"], 0, "That is the planet family clue.", hint),
    mc("A natural body mainly orbiting Earth is best classed as a...", ["planet", "moon", "star", "asteroid"], 1, "Main host Earth is a moon clue.", hint),
    mc("An icy object on a stretched Sun orbit that can develop a tail near the Sun is best classed as a...", ["asteroid", "planet", "comet", "moon"], 2, "That is the comet description.", hint),
    mc("A small rocky or metallic body orbiting the Sun directly is best classed as an...", ["asteroid", "comet", "moon", "star"], 0, "That is the asteroid family.", hint),
    mc("Which body in our Solar System produces its own light?", ["Earth", "the Moon", "the Sun", "a comet"], 2, "The Sun is the system's star.", hint),
    mc("Which statement is correct?", ["Every body orbiting the Sun is a planet", "Not every Sun-orbiting body is a planet", "Every object in space is either a planet or a star", "Moons mainly orbit the Sun"], 1, "Asteroids, comets, and dwarf planets also orbit the Sun.", hint),
    mc("If an object mainly orbits Jupiter, which clue is strongest?", ["It is likely a moon", "It must be a star", "It must be a comet", "It must be the Sun"], 0, "A planet host is a moon clue.", hint),
    mc("Why is the Sun not classed as a planet?", ["Because it is the central star and produces its own light", "Because it is smaller than Earth", "Because it mainly orbits Jupiter", "Because it has no gravity"], 0, "The Sun is the system's star, not one of its planets.", hint),
    mc("Which family label stays distinct from both full planets and moons in this lesson?", ["dwarf planet", "star", "hemisphere", "eclipse"], 0, "Dwarf planets stay a separate body label here.", hint),
    mc("Which pair is matched correctly?", ["moon - mainly orbits a planet", "planet - mainly orbits a moon", "comet - produces its own light", "asteroid - mainly orbits Earth"], 0, "Main host is one of the strongest classification clues.", hint),
    mc("Which body type is most strongly linked with a visible tail near the Sun?", ["planet", "moon", "asteroid", "comet"], 3, "That clue points to a comet.", hint),
    mc("What is the broadest description of the Solar System in this module?", ["only the eight planets", "the Sun plus the planets only", "the Sun and the family of bodies bound to it by gravity", "the Milky Way galaxy only"], 2, "The Solar System is the whole Sun-centered gravitational family.", hint),
    shortCases([
      { prompt: "A moon mainly orbits a ...", acceptedAnswers: words("planet", "larger world", "planet or dwarf planet"), hint: "Use the host clue." },
      { prompt: "A planet mainly orbits the ...", acceptedAnswers: words("Sun", "the Sun"), hint: "That is the main host in this module." },
      { prompt: "A comet can grow a ... near the Sun.", acceptedAnswers: words("tail"), hint: "That is the visual clue most learners remember." },
      { prompt: "Small rocky Sun-orbiting bodies are commonly called ...", acceptedAnswers: words("asteroids", "asteroid"), hint: "Keep them separate from comets." },
      { prompt: "The central star of the Solar System is the ...", acceptedAnswers: words("Sun", "the Sun"), hint: "That is the luminous host." },
      { prompt: "The Solar System is held together mainly by ...", acceptedAnswers: words("gravity"), hint: "That is the binding force of the family." },
      { prompt: "Not every body orbiting the Sun is a ...", acceptedAnswers: words("planet"), hint: "Asteroids, comets, and dwarf planets also orbit the Sun." },
      { prompt: "A dwarf planet is still a separate family ... in this module.", acceptedAnswers: words("label", "type", "category"), hint: "Do not flatten it into full planet or moon." },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Use main host and body type together whenever one clue alone is too weak.";
  return [
    mc("Why is 'orbits the Sun' too weak by itself for classifying an unfamiliar body?", ["Because planets, asteroids, comets, and dwarf planets can all orbit the Sun", "Because nothing actually orbits the Sun", "Because only stars orbit the Sun", "Because host never matters"], 0, "Main host alone is not enough; body type still matters.", hint),
    mc("Why is 'mainly orbits a planet' a strong clue that an object is a moon?", ["Because moons are planet-hosted rather than Sun-hosted", "Because planets orbit moons", "Because only stars can have moons", "Because moons produce their own light"], 0, "The host relation is doing the classification work.", hint),
    mc("Why should body type and host be used together?", ["Because one clue by itself can misclassify objects in the Solar System family", "Because host and type always say the same thing", "Because only size matters in astronomy", "Because names matter more than evidence"], 0, "The module wants a two-clue classification habit.", hint),
    mc("Why is a tail-bearing icy visitor near the Sun better classed as a comet than an asteroid?", ["Because body behavior and composition clues matter, not just direct Sun orbit", "Because asteroids produce their own light", "Because comets orbit planets only", "Because tails mean the object is a star"], 0, "Type clues refine the classification beyond host alone.", hint),
    mc("Why is the Sun-centered family map stronger than memorizing a list of object names?", ["Because it links each body to its role and host relation", "Because names are always wrong", "Because diagrams remove the need for definitions", "Because only planets matter"], 0, "The family structure keeps the topic coherent.", hint),
    mc("Why is the Sun excluded from the planet family?", ["Because it is a star rather than a non-luminous world", "Because it is too far away", "Because it has no mass", "Because it mainly orbits Earth"], 0, "The Sun's own-light clue is decisive.", hint),
    mc("Why does 'small body' fail as a full classification rule?", ["Because asteroids, comets, and moons can all be small but belong to different families", "Because all small bodies are planets", "Because only large bodies matter", "Because size fixes the main host"], 0, "Size alone is too weak for this module.", hint),
    mc("Which question is most useful when classifying a new Solar System body?", ["What does it mainly orbit, and what kind of body is it?", "How bright is the classroom projector?", "What color was it in the textbook?", "Did I already memorize its name?"], 0, "That two-part question matches the lesson method.", hint),
    mc("Why is a moon not just a 'small planet' in this module?", ["Because its main host relation is different", "Because it is always made of ice", "Because it has no gravity", "Because it cannot move"], 0, "Host relation beats vague size language.", hint),
    mc("Why is direct Sun orbit not enough to make something a planet?", ["Because comets, asteroids, and dwarf planets can also orbit the Sun directly", "Because planets never orbit the Sun", "Because only moons orbit the Sun", "Because host relation never matters"], 0, "This is the main overgeneralization the module corrects.", hint),
    mc("Which summary best fits the module's classification rule?", ["Classify by host plus body type", "Classify by size only", "Classify by color only", "Classify by memorized names only"], 0, "That is the discipline the module wants.", hint),
    mc("Why should dwarf planet remain its own label here?", ["Because the lesson treats it as a distinct Solar System family category", "Because it produces its own light", "Because it mainly orbits a planet", "Because it is not in the Solar System"], 0, "The label prevents oversimplified planet-only sorting.", hint),
    shortCases([
      { prompt: "The two strongest Solar System classification clues are main ... and body type.", acceptedAnswers: words("host", "host body"), hint: "This is the lesson's sorting pair." },
      { prompt: "A moon mainly rides around a larger ... rather than the Sun directly.", acceptedAnswers: words("world", "planet", "planetary body", "planet or dwarf planet"), hint: "Use the host clue." },
      { prompt: "The Solar System is a ... centered family.", acceptedAnswers: words("Sun", "Sun-centered", "sun"), hint: "That is the broad organizing idea." },
      { prompt: "Planets, moons, comets, and asteroids are different body ...", acceptedAnswers: words("types", "families", "categories"), hint: "Do not flatten them into one bucket." },
      { prompt: "The Sun is not a planet because it is a ...", acceptedAnswers: words("star"), hint: "It produces its own light." },
      { prompt: "Direct Sun orbit does not automatically mean the object is a ...", acceptedAnswers: words("planet"), hint: "There are several Sun-orbiting families." },
      { prompt: "An object with a tail near the Sun is more likely a ... than an asteroid.", acceptedAnswers: words("comet"), hint: "Use the icy-visitor clue." },
      { prompt: "Classification gets weak if you rely on size ...", acceptedAnswers: words("alone", "only"), hint: "The module wants two clues, not one." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep daily apparent motion, yearly orbit, and sketch scale in separate slots.";
  return [
    mc("What real Earth motion explains the Sun's daily apparent path across the sky?", ["Earth's rotation", "Earth's yearly orbit", "the Moon's orbit", "the Sun orbiting Earth once per day"], 0, "The daily sweep is a rotation-based appearance.", hint),
    mc("What Earth motion explains one year?", ["one rotation", "one orbit around the Sun", "one Moon phase cycle", "one eclipse"], 1, "A year is tied to Earth's orbit.", hint),
    mc("About how long is one Earth year?", ["24 h", "30 d", "365 d", "10 y"], 2, "Use the lesson year value.", hint),
    mc("Which statement best fits 'apparent motion'?", ["It is motion as seen from a viewpoint", "It means the motion is fake and useless", "It means only stars can move", "It means the object has no real motion"], 0, "Apparent means viewpoint-based.", hint),
    mc("Which warning best fits many Solar System classroom diagrams?", ["They are heavily compressed in scale", "They show literal distances exactly", "They remove all useful patterns", "They make inner and outer orbits identical"], 0, "They often keep relationships while shrinking size and distance enormously.", hint),
    mc("What usually happens to orbital period as orbit size increases in the Solar System overview story?", ["It usually gets shorter", "It usually gets longer", "It stays exactly the same", "It becomes zero"], 1, "Farther orbits generally take longer to complete.", hint),
    mc("Which statement best protects the difference between day and year?", ["A day comes from rotation, while a year comes from orbit", "A day and year both come from rotation only", "A day and year both come from orbit only", "A day comes from phases, while a year comes from eclipses"], 0, "Keep the two timescales tied to different motions.", hint),
    mc("If a model shows Earth and Sun only a few metres apart, what is the safest reading?", ["Trust the relationship pattern, not the literal distance scale", "Assume the real Solar System is only a few metres wide", "Ignore the model completely", "Assume the year now takes a few seconds"], 0, "Astronomy models often preserve structure better than exact scale.", hint),
    mc("Why is the Sun's daily path called apparent motion here?", ["Because we describe what we see from Earth while Earth rotates", "Because the Sun has no real motion in any wider sense", "Because apparent means imaginary", "Because only night-time motion can be apparent"], 0, "This is a viewpoint word, not a statement that the pattern is useless.", hint),
    mc("Which object type usually has the longer year in a simple inner-outer comparison?", ["the body on the wider orbit", "the body on the tighter inner orbit", "both are always equal", "the body with the brightest color"], 0, "Longer route size usually means longer orbital period.", hint),
    mc("Which statement about astronomy models is strongest?", ["They can show the right pattern while still distorting time or distance scale", "They are useful only if every distance is exact", "They cannot teach any real relationship", "They always make the Sun orbit Earth"], 0, "Pattern and literal scale should not be confused.", hint),
    mc("What is the cleanest interpretation of daily sky motion?", ["an appearance caused by Earth's rotation", "proof that Earth does not rotate", "proof that the Sun circles Earth once per day in the real model", "evidence that a year has ended"], 0, "Daily sky sweep is viewpoint-based rotation evidence.", hint),
    shortCases([
      { prompt: "A day comes from Earth's ...", acceptedAnswers: words("rotation", "spin", "Earth's rotation"), hint: "Use the daily motion slot." },
      { prompt: "A year comes from Earth's ... around the Sun.", acceptedAnswers: words("orbit", "revolution"), hint: "Use the yearly motion slot." },
      { prompt: "One year is about ...", acceptedAnswers: yearAnswers(365), hint: "Use the lesson constant." },
      { prompt: "Motion seen from a viewpoint is called ... motion.", acceptedAnswers: words("apparent", "apparent motion"), hint: "This is the observer-language word." },
      { prompt: "Solar System sketches are often heavily ... in scale.", acceptedAnswers: words("compressed"), hint: "Do not read the spacing literally." },
      { prompt: "Farther orbits usually take ... to complete.", acceptedAnswers: words("longer", "more time"), hint: "Compare inner with outer routes." },
      { prompt: "A useful but non-literal astronomy model can still preserve the right ...", acceptedAnswers: words("pattern", "relationship", "structure"), hint: "Trust the structure before the scale." },
      { prompt: "The Sun's daily sweep should not replace the whole real ... story.", acceptedAnswers: words("motion"), hint: "Keep appearance and underlying cause separate." },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Use viewpoint language carefully and do not let compressed models rewrite the real scale story.";
  return [
    mc("Why does the Sun seeming to move across the sky each day not prove the Sun really orbits Earth once per day?", ["Because the daily appearance is explained by Earth rotating", "Because apparent motion means nothing moves at all", "Because the Sun is fixed to the classroom wall", "Because only the Moon can show apparent motion"], 0, "A viewpoint effect can look like the other body is moving.", hint),
    mc("Why is 'apparent motion' a useful term instead of a dismissive one?", ["Because it separates what we see from the deeper real-motion explanation", "Because it means the observation should be ignored", "Because it proves no real motion exists anywhere", "Because it applies only to made-up diagrams"], 0, "Apparent motion is still a real observation.", hint),
    mc("Why must day and year stay in different conceptual slots?", ["Because they are produced by different Earth motions on different timescales", "Because both are produced by one identical motion", "Because years are caused by moon phases", "Because days are caused by eclipses"], 0, "Do not collapse rotation and orbit into one idea.", hint),
    mc("Why can a strongly compressed model still be valuable?", ["Because it can preserve the pattern of relationships even when the literal size scale is wrong", "Because exact scale never matters in astronomy", "Because compression makes the mathematics disappear", "Because all models must match true size exactly"], 0, "Useful model does not have to mean exact scale model.", hint),
    mc("Why is it risky to read orbit spacing literally from a small classroom diagram?", ["Because the real Solar System distances are vastly larger than the sketch suggests", "Because gravity vanishes in diagrams", "Because only inner planets have real spacing", "Because pictures reverse the order of the planets"], 0, "Scale compression is the key warning.", hint),
    mc("Why do outer bodies tend to have longer years in a simple Solar System overview?", ["Because larger orbits usually take longer to complete", "Because outer bodies rotate faster each day", "Because inner bodies do not orbit", "Because only stars have orbital periods"], 0, "This is the orbit-size versus period relationship.", hint),
    mc("Why should 'sunrise' be treated as an Earth-viewpoint description?", ["Because it names how the Sun appears from our rotating planet", "Because the Sun actually jumps upward from Earth", "Because sunrise proves Earth is stationary", "Because sunrise is caused by eclipses"], 0, "It is descriptive appearance-language tied to viewpoint.", hint),
    mc("What is lost if a learner uses one sentence to explain both day and year?", ["The different motions and timescales get blurred together", "The Moon becomes the Sun", "The planet stops rotating", "The scale of the diagram becomes exact"], 0, "Day and year need different explanatory anchors.", hint),
    mc("Why is 'the stars moved westward overnight' not the full physical explanation by itself?", ["Because it states an observed pattern without yet naming Earth's rotation as the cause", "Because stars never appear to move", "Because only the Sun can show apparent motion", "Because westward motion proves the stars orbit Earth every day"], 0, "Observation and explanation should be separated cleanly.", hint),
    mc("Why is the phrase 'trust the pattern, not the literal scale' so important in astronomy models?", ["Because models often keep relative structure while shrinking times or distances enormously", "Because patterns are always more exact than measurements", "Because scale never matters in real astronomy", "Because literal scale makes motion impossible"], 0, "This is the safe way to read classroom Solar System boards.", hint),
    mc("Which statement best protects all three ideas at once?", ["Rotation explains daily apparent sky motion, orbit explains the year, and diagrams often compress scale", "Orbit explains daily sky motion, rotation explains the year, and diagrams are always exact", "Phases explain the year, eclipses explain the day, and scale is irrelevant", "The Sun orbits Earth daily, and the diagram proves it literally"], 0, "This combines the module's key contrasts without mixing them.", hint),
    mc("Why should a learner compare inner and outer orbits rather than just memorize one planet order list?", ["Because the orbit comparison helps explain why year lengths differ", "Because planet order replaces all physics", "Because orbit size has no link to period", "Because only outer planets really orbit"], 0, "This turns the picture into a reasoning tool.", hint),
    shortCases([
      { prompt: "The observer-word for motion seen from Earth is ...", acceptedAnswers: words("apparent", "apparent motion"), hint: "Use the viewpoint term." },
      { prompt: "Astronomy models are often heavily ... in distance or time scale.", acceptedAnswers: words("compressed"), hint: "That is the standard warning." },
      { prompt: "Earth's rotation explains the daily ... of the sky.", acceptedAnswers: words("appearance", "apparent motion", "daily apparent motion"), hint: "Name the viewpoint-based pattern." },
      { prompt: "Earth's orbit explains the ... cycle around the Sun.", acceptedAnswers: words("yearly", "year", "yearly orbit"), hint: "Use the long-timescale slot." },
      { prompt: "Inner-orbit worlds usually have ... years than outer-orbit worlds.", acceptedAnswers: words("shorter"), hint: "Smaller orbit, shorter period in the simple overview." },
      { prompt: "Apparent motion is what we ... from our viewpoint.", acceptedAnswers: words("see", "observe"), hint: "It is still a real observation." },
      { prompt: "Daily sky motion and yearly orbit belong to different ...", acceptedAnswers: words("timescales", "time scales", "scales"), hint: "Do not collapse them together." },
      { prompt: "The safest way to read a classroom Solar System board is to trust the ... more than the literal scale.", acceptedAnswers: words("pattern", "relationship", "structure"), hint: "That is the model-reading rule." },
    ]),
  ];
}

const F5_DIAGNOSTIC_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F5_L1: l1DiagnosticRaw,
  F5_L2: l2DiagnosticRaw,
  F5_L3: l3DiagnosticRaw,
  F5_L4: l4DiagnosticRaw,
  F5_L5: l5DiagnosticRaw,
  F5_L6: l6DiagnosticRaw,
};

const F5_CONCEPT_BUILDERS: Record<string, () => RawCollectionItem[]> = {
  F5_L1: l1ConceptRaw,
  F5_L2: l2ConceptRaw,
  F5_L3: l3ConceptRaw,
  F5_L4: l4ConceptRaw,
  F5_L5: l5ConceptRaw,
  F5_L6: l6ConceptRaw,
};

const F5_MASTERY_BUILDERS: Record<string, () => RawCollectionItem[]> = Object.fromEntries(
  Object.keys(F5_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...F5_DIAGNOSTIC_BUILDERS[code](), ...F5_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawCollectionItem[]>;

export function f5GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F5_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function f5GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F5_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function f5GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = F5_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
