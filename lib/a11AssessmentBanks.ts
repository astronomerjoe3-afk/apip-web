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

function normalizeCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function compactCode(code: string): string {
  return normalizeCode(code).replace("_", "");
}

function mc(
  prompt: string,
  choices: string[],
  answerIndex: number,
  explanation: string,
  hint = "Rebuild the astrophysics rule before choosing.",
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

function materializeBank(code: string, kind: BankKind, rawItems: RawItem[]): UnknownRecord[] {
  const seenSignatures = new Set<string>();
  const deduped = rawItems.flatMap((item, index) => {
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
    throw new Error(`A11 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Keep force per unit mass separate from energy per unit mass.";
  return [
    mc("What is gravitational field strength at a point?", ["force per unit mass on a small test mass", "energy per unit mass at that point", "total work done on the source planet", "mass per unit force"], 0, "Field strength tells you the local pull per kilogram.", hint),
    mc("What is gravitational potential at a point?", ["work done per unit mass in bringing a small test mass from infinity", "force on a 1 kg mass only", "energy stored only in the source mass", "mass per unit energy"], 0, "Potential is an energy-per-mass quantity.", hint),
    mc("Which formula gives gravitational field strength outside a spherical mass?", ["g = G M / r^2", "V = -G M / r", "F = m / g", "E = mc^2"], 0, "This is the inverse-square field relation.", hint),
    mc("Which formula gives gravitational potential outside a spherical mass?", ["V = -G M / r", "g = G M / r^2", "F = G M / r", "V = G M r"], 0, "Potential is inverse-first-power and negative with zero at infinity.", hint),
    mc("If the distance from the center of a planet doubles, what happens to g?", ["it becomes one quarter", "it becomes one half", "it doubles", "it stays the same"], 0, "Field strength follows 1 / r^2.", hint),
    mc("If the distance from the center of a planet doubles, what happens to the magnitude of V?", ["it halves", "it quarters", "it doubles", "it stays the same"], 0, "Potential follows 1 / r in magnitude.", hint),
    mc("If the test mass doubles at the same point in the field, what happens to g?", ["it stays the same", "it doubles", "it halves", "it becomes negative"], 0, "g depends on the source and location, not on the chosen test mass.", hint),
    mc("If the test mass doubles at the same point in the field, what happens to the gravitational force?", ["it doubles", "it stays the same", "it halves", "it becomes zero"], 0, "Force equals m g, so heavier test mass means larger force.", hint),
    mc("Why is gravitational potential negative in the usual convention?", ["zero potential is taken at infinity, so bound positions below that reference are negative", "gravity is a repulsive force", "negative means the field is weak", "the source mass is always negative"], 0, "Potential sign comes from the chosen infinity reference.", hint),
    mc("What are the units of gravitational potential?", ["J/kg", "N/kg", "N", "kg/J"], 0, "Potential is energy per unit mass.", hint),
    mc("A planet has mass 6.0 x 10^24 kg and radius 8.0 x 10^6 m. What is the surface field strength?", ["6.3 N/kg", "12.5 N/kg", "3.1 N/kg", "25 N/kg"], 0, "Using g = G M / r^2 gives about 6.3 N/kg.", hint),
    mc("A spacecraft moves from a point with potential -2.0 x 10^7 J/kg to a point with potential -1.2 x 10^7 J/kg. What does this mean?", ["its potential energy per kilogram has increased by 8.0 x 10^6 J/kg", "the field strength has doubled", "gravity has changed from attractive to repulsive", "the source mass has disappeared"], 0, "Less negative potential means higher potential energy per kilogram.", hint),
    ...shortCases([
      { prompt: "Gravitational field strength is force per unit ...", acceptedAnswers: ["mass"], hint: "Think kilogram, not joule." },
      { prompt: "Gravitational potential is work or energy per unit ...", acceptedAnswers: ["mass"], hint: "Potential is also normalized by kilogram." },
      { prompt: "At infinity, gravitational potential is usually taken as ...", acceptedAnswers: ["zero", "0"], hint: "That is the reference level." },
      { prompt: "If radius doubles, field strength falls by a factor of ...", acceptedAnswers: ["4", "four", "one quarter", "a quarter"], hint: "Use the inverse-square rule." },
      { prompt: "If radius doubles, gravitational potential magnitude falls by a factor of ...", acceptedAnswers: ["2", "two", "one half", "a half"], hint: "Potential depends on 1 / r." },
      { prompt: "A steeper gravitational potential change with distance means a ... field.", acceptedAnswers: ["stronger", "strong"], hint: "Steeper landscape means larger pull per kilogram." },
      { prompt: "To escape from a point in a gravitational field, energy must raise the potential to ...", acceptedAnswers: ["zero", "0"], hint: "Use the infinity reference." },
      { prompt: "Gravitational potential energy of a mass m at a point is m times the gravitational ...", acceptedAnswers: ["potential"], hint: "Multiply the per-kilogram quantity by mass." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Explain what changes for force, and what does not change for the field or potential map.";
  return [
    mc("Why is it weak to say gravitational field strength and gravitational potential are 'the same idea'?", ["field strength is force per kilogram, while potential is energy per kilogram", "potential has no units at all", "field strength exists only inside stars", "potential is measured in newtons"], 0, "They describe the same landscape in different ways.", hint),
    mc("Why can two spacecraft of different mass at the same point have the same gravitational potential but different gravitational force?", ["potential depends only on source and position, but force also depends on the spacecraft mass", "potential depends on the spacecraft mass more strongly than force", "force ignores spacecraft mass", "potential and force always have opposite signs"], 0, "Force changes with m, but field map quantities do not.", hint),
    mc("Why does a more negative gravitational potential mean more energy is needed to escape?", ["more energy per kilogram must be supplied to raise the potential back to zero at infinity", "the field becomes repulsive", "negative potential means zero force", "escape depends only on satellite mass"], 0, "Escape is about climbing back to the zero reference.", hint),
    mc("Why is field strength often described as the 'slope' of the potential landscape?", ["because stronger field means potential changes more rapidly with distance", "because potential and field always have the same units", "because slope means the field is flat", "because potential does not vary with distance"], 0, "Steeper potential change implies stronger pull per kilogram.", hint),
    mc("Why is a spherical shell at one radius from a planet a useful idea in potential questions?", ["all points at the same radius have the same gravitational potential in a spherical field", "field strength is zero outside the shell", "all points at the same radius have different potential by latitude", "radius changes with direction"], 0, "Potential depends on r, not compass direction, in a spherical field.", hint),
    mc("A student says 'doubling the satellite mass changes the gravitational field around Earth.' What is the correction?", ["it changes the force on that satellite, not Earth's field map", "it doubles Earth's mass", "it makes potential positive", "it removes the inverse-square law"], 0, "Keep source field separate from probe response.", hint),
    mc("Why is J/kg the correct unit for potential instead of N/kg?", ["potential tracks energy transfer per kilogram, while field strength tracks force per kilogram", "J/kg and N/kg always mean the same quantity", "J/kg is used only for black holes", "N/kg is a unit of potential energy"], 0, "Units help stop the confusion.", hint),
    mc("Why is the field stronger at the surface of a small dense planet than far away from it?", ["the radius is smaller, so G M / r^2 is larger close to the source", "the source mass disappears farther away", "potential becomes positive at the surface", "test masses become heavier near the planet"], 0, "Distance from the source matters strongly in g.", hint),
    mc("Two planets have the same surface field strength, but Planet A has the larger radius. Which has the more negative surface potential?", ["Planet A", "Planet B", "both are equal because g is equal", "it is impossible because potential cannot be compared"], 0, "If g is the same but radius is larger, the surface potential magnitude g r is larger.", hint),
    mc("Why is 'gravity gets weaker with distance' not enough for a strong A11_L1 answer?", ["you should say that g falls with 1 / r^2 while V changes with 1 / r and stays negative relative to infinity", "because gravity actually gets stronger far away", "because field strength and potential have no formulas", "because distance affects only test mass"], 0, "The lesson is about distinguishing two linked quantities.", hint),
    mc("A point has V = -3.0 x 10^7 J/kg. What is the minimum extra energy per kilogram needed to just escape?", ["3.0 x 10^7 J/kg", "1.5 x 10^7 J/kg", "6.0 x 10^7 J/kg", "0 J/kg"], 0, "You must raise the potential to zero.", hint),
    mc("Why can gravitational potential be negative while the field strength is quoted as a positive magnitude?", ["potential is relative to the infinity reference, while field strength is usually reported by size with direction given separately", "negative potential means negative mass", "field strength is never directional", "potential is a force"], 0, "The sign conventions differ because the quantities are different.", hint),
    mc("What should stay visible when comparing two radii around the same planet?", ["g and V both depend on the same source mass and radius, but in different mathematical ways", "test mass decides the whole field map", "potential ignores distance", "field strength is constant outside planets"], 0, "One source, two linked quantities, two different dependencies.", hint),
    mc("Why is gravitational potential useful in orbit and escape problems?", ["it tracks energy change per kilogram directly without needing to calculate force at every point", "it replaces the need for distance", "it applies only inside black holes", "it is a faster way to find mass"], 0, "Potential is the energy ledger.", hint),
    mc("Which statement best summarizes A11_L1 rigorously?", ["Gravitational field strength and potential describe the same gravitational landscape, but g gives force per unit mass while V gives energy per unit mass measured from infinity", "Field strength and potential are identical and interchangeable", "Potential is just another name for force", "Gravity has only one useful quantity"], 0, "That keeps the distinction and the reference point visible.", hint),
    mc("Why does a satellite moving outward experience an increase in gravitational potential?", ["the potential becomes less negative as radius increases", "the field becomes repulsive", "the source mass increases", "gravity stops acting outside the atmosphere"], 0, "Moving away raises the energy-per-kilogram level.", hint),
    ...shortCases([
      { prompt: "Gravitational field strength measures ... per kilogram.", acceptedAnswers: ["force", "force per kilogram"], hint: "Use the local pull language." },
      { prompt: "Gravitational potential measures ... per kilogram.", acceptedAnswers: ["energy", "work", "energy change", "work done"], hint: "Potential is an energy ledger." },
      { prompt: "A more rapid change of potential with distance means the field is ...", acceptedAnswers: ["stronger", "strong"], hint: "Think slope of the landscape." },
      { prompt: "To escape, a mass must gain enough energy to raise its potential to ...", acceptedAnswers: ["zero", "0"], hint: "That is the infinity reference." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep gravity-as-centripetal separate from the observation purpose of the orbit.";
  return [
    mc("What provides the centripetal force for a satellite in circular orbit?", ["gravity", "engine thrust all the time", "air resistance", "magnetic force"], 0, "Stable orbit is a gravity-turning story.", hint),
    mc("Which formula gives circular orbital speed around a large central mass?", ["v = sqrt(G M / r)", "v = G M / r^2", "T = 2 pi / v", "E = qV"], 0, "This is the circular-orbit speed relation.", hint),
    mc("If orbital radius increases, what happens to circular orbital speed around the same planet?", ["it decreases", "it increases", "it stays constant", "it becomes zero"], 0, "Higher orbit means slower circular speed.", hint),
    mc("If orbital radius increases, what happens to orbital period?", ["it increases", "it decreases", "it stays constant", "it becomes independent of mass"], 0, "Higher orbit means a longer route and slower speed.", hint),
    mc("What is required for a geostationary satellite?", ["equatorial orbit with a period of one sidereal day", "polar orbit with a 90-minute period", "elliptical orbit crossing both poles", "low orbit with constant thrust"], 0, "It must stay above one fixed point on Earth.", hint),
    mc("Why must a geostationary satellite orbit above the equator?", ["an inclined orbit would make it drift north and south in the sky", "gravity is zero at the equator", "only equatorial launches are possible", "polar regions block radio waves"], 0, "Fixed ground position requires the equatorial plane.", hint),
    mc("Which orbit is best for repeated global mapping, including polar regions?", ["polar low Earth orbit", "geostationary orbit", "submarine orbit", "inside-the-atmosphere orbit"], 0, "As Earth rotates under a polar orbit, global coverage becomes possible.", hint),
    mc("Which orbit is best for continuous communication with the same ground region?", ["geostationary orbit", "random elliptical orbit", "polar orbit", "escape trajectory"], 0, "Continuous line of sight to one region is the point of geostationary orbit.", hint),
    mc("If orbital radius is multiplied by 4, what happens to the orbital period?", ["it becomes 8 times larger", "it becomes 4 times larger", "it doubles", "it halves"], 0, "T^2 is proportional to r^3, so T scales as r^(3/2).", hint),
    mc("If orbital radius is multiplied by 4, what happens to the orbital speed?", ["it halves", "it quarters", "it doubles", "it stays the same"], 0, "v scales as 1 / sqrt(r).", hint),
    mc("For two satellites at the same radius around Earth, which one has the larger orbital speed?", ["they are the same", "the more massive satellite", "the less massive satellite", "the one with larger solar panels"], 0, "Orbital speed at one radius depends on Earth and the radius, not on satellite mass.", hint),
    mc("What is the main tradeoff when a satellite is placed much higher above Earth?", ["it sees a wider area but with lower detail and longer delay", "it becomes immune to gravity", "it always moves faster", "it can no longer send signals"], 0, "Orbit choice balances coverage and resolution.", hint),
    ...shortCases([
      { prompt: "A geostationary satellite stays above the same point on Earth's ...", acceptedAnswers: ["surface"], hint: "That is the visible ground effect." },
      { prompt: "In orbit, the satellite is in continuous free ...", acceptedAnswers: ["fall"], hint: "Gravity is still acting." },
      { prompt: "Higher circular orbit means a ... speed.", acceptedAnswers: ["lower", "slower"], hint: "Use v = sqrt(G M / r)." },
      { prompt: "Higher circular orbit means a ... period.", acceptedAnswers: ["longer", "greater"], hint: "Use the orbital-period relation." },
      { prompt: "A polar orbit is useful because Earth rotates ... it.", acceptedAnswers: ["beneath", "underneath"], hint: "That is how it scans different longitudes." },
      { prompt: "A geostationary satellite must have a period of about ... hours.", acceptedAnswers: ["24", "24 hours", "23.9", "23.9 hours"], hint: "Match Earth's rotation." },
      { prompt: "For the same orbit radius, satellite mass does not change the orbital ...", acceptedAnswers: ["speed", "period"], hint: "The central mass and radius set the orbit." },
      { prompt: "Gravity in orbit provides the inward or ... force.", acceptedAnswers: ["centripetal"], hint: "That is the turning force name." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Explain how the chosen orbit serves the mission, not just what the orbit is called.";
  return [
    mc("Why does a satellite not need constant forward engine thrust to stay in an ideal circular orbit?", ["gravity continuously bends its velocity into free fall around Earth", "there is no gravity in space", "air resistance pushes it around the orbit", "orbital motion happens without forces"], 0, "Orbit is persistent falling, not force-free motion.", hint),
    mc("Why is a geostationary satellite poor for detailed imaging of small regions on Earth?", ["it is very far from Earth, so each pixel covers a larger ground area", "it moves too fast to collect images", "it cannot see the equator", "it has no line of sight to Earth"], 0, "Altitude affects the observation tradeoff.", hint),
    mc("Why is a low polar orbit better than geostationary orbit for weather or mapping surveys of the whole globe?", ["it passes closer to Earth for detail and Earth rotates underneath to give broad coverage over time", "it remains above one city continuously", "it has a 24-hour period", "it avoids gravity"], 0, "Global mapping needs coverage, not fixed stare only.", hint),
    mc("Why must the period match Earth's rotation for a satellite to appear fixed above one longitude?", ["its angular speed must match Earth's angular speed", "its mass must equal Earth's mass", "its radius must be zero", "its radio signal must move at light speed"], 0, "Fixed sky position is an angular-speed condition.", hint),
    mc("Why would an inclined orbit fail to be geostationary even if its period were 24 hours?", ["it would move north and south relative to the equator", "inclined orbits have no gravity", "its speed would be zero", "the central mass formula stops working"], 0, "The orbit plane matters as well as the period.", hint),
    mc("A student says 'heavier satellites must orbit faster so they do not fall.' What is the correction?", ["orbital speed at one radius is independent of satellite mass", "heavier satellites do not feel gravity", "lighter satellites always escape", "mass changes Earth's G"], 0, "The orbit condition comes from the central field and radius.", hint),
    mc("Why is higher orbit associated with a longer period even though the field is weaker there?", ["the orbital path is larger and the satellite also moves more slowly", "weaker gravity means no orbit", "period depends only on satellite mass", "higher orbit means stronger gravity"], 0, "Both radius and speed change in the same direction for period.", hint),
    mc("Why is 'gravity pulls satellites down' too weak as an orbital explanation?", ["gravity does pull inward, but the sideways speed keeps the satellite missing Earth as it falls", "gravity does not act in orbit", "satellites float because they are massless", "only engines matter once the satellite is launched"], 0, "Sideways velocity is part of the orbital story.", hint),
    mc("Why is orbit choice tied to observation role in A11_L2?", ["different altitudes and planes trade off resolution, coverage, and apparent ground motion", "all satellite orbits observe the same way", "orbit labels replace the need for mechanics", "observation depends only on camera power"], 0, "The mission comes from mechanics plus geometry.", hint),
    mc("Why does a geostationary satellite give continuous communication coverage to one region?", ["its position in the sky is nearly fixed relative to that ground region", "it circles Earth every 90 minutes", "it passes over both poles each day", "it shuts off gravity"], 0, "Fixed apparent position makes continuous links easy.", hint),
    mc("Why does a low orbit usually give better image detail than a very high orbit?", ["the target is closer, so the same viewing angle covers a smaller ground region", "low orbit removes the inverse-square law", "high orbit has no signal return", "detail depends only on satellite mass"], 0, "Proximity improves spatial detail.", hint),
    mc("Why is a polar orbit not the best choice for uninterrupted communication with one single city?", ["it keeps moving overhead rather than staying fixed above that city", "polar orbit is impossible around Earth", "its period is always 24 hours", "it cannot transmit radio waves"], 0, "Coverage pattern and fixed-stare requirement differ.", hint),
    mc("What should stay visible in a rigorous A11_L2 answer?", ["gravity provides the orbit mechanics, and the chosen orbit geometry sets the satellite's usefulness", "only the orbit name matters", "observation role has nothing to do with altitude", "centripetal force and observation are unrelated"], 0, "The lesson joins mechanics and mission role.", hint),
    mc("Why is period-radius reasoning stronger than memorizing that 'geostationary is high'?", ["it explains why the orbit must sit at one specific radius to match Earth's rotation period", "high orbit means any period you want", "radius never affects period", "all circular orbits above Earth are geostationary"], 0, "The label comes from the mechanics.", hint),
    mc("Which sentence best matches A11_L2 rigor?", ["Satellites orbit because gravity supplies the centripetal pull, and orbit altitude and plane are chosen to fit the observation or communication task", "Satellites stay up because there is no gravity in space", "All useful satellites are geostationary", "Observation role is independent of the orbit"], 0, "This keeps both halves of the lesson visible.", hint),
    mc("Why can a high orbit widen coverage but still reduce detail?", ["greater distance lets one view a larger fraction of Earth while making the ground image scale coarser", "greater distance removes signal delay", "greater distance strengthens gravity", "greater distance makes the satellite mass larger"], 0, "This is the core observation tradeoff.", hint),
    ...shortCases([
      { prompt: "A geostationary orbit must be ... to the equator, not tilted.", acceptedAnswers: ["parallel", "equatorial", "in the equatorial plane"], hint: "Keep the orbit plane explicit." },
      { prompt: "In orbit, gravity continuously bends the satellite's ...", acceptedAnswers: ["velocity"], hint: "That is what produces the curved path." },
      { prompt: "A polar satellite is useful for global ...", acceptedAnswers: ["coverage", "mapping", "surveying"], hint: "Think Earth rotating underneath." },
      { prompt: "Higher orbit usually means wider coverage but less ...", acceptedAnswers: ["detail", "resolution"], hint: "That is the tradeoff word." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Keep spectral evidence, temperature, and H-R placement tied together.";
  return [
    mc("What does a star's continuous spectrum with absorption lines mainly tell you?", ["surface temperature and atmospheric composition clues", "its exact distance only", "its orbital speed around Earth", "its mass defect"], 0, "Spectra reveal temperature and chemical signatures.", hint),
    mc("What relation links peak wavelength to surface temperature?", ["lambda_max T = b", "v = H0 d", "d = 1 / p", "g = G M / r^2"], 0, "This is Wien's law.", hint),
    mc("If a star's peak wavelength is shorter, what does that imply?", ["it is hotter", "it is cooler", "it is necessarily nearer", "it must be a white dwarf"], 0, "Shorter peak wavelength means higher temperature.", hint),
    mc("What does the H-R diagram compare?", ["luminosity and temperature", "mass and distance", "field strength and potential", "redshift and time"], 0, "The H-R diagram is a luminosity-temperature map.", hint),
    mc("Where are white dwarfs found on an H-R diagram?", ["hot but low-luminosity region", "cool and very luminous region", "exactly on the main sequence only", "only at the center"], 0, "White dwarfs are hot but small and dim.", hint),
    mc("Where are red giants found on an H-R diagram?", ["cool but high-luminosity region", "hot and low-luminosity region", "only at the bottom right with no luminosity", "identical to white dwarfs"], 0, "Large radius can make a cooler star very luminous.", hint),
    mc("Which formula gives stellar luminosity from radius and temperature?", ["L = 4 pi R^2 sigma T^4", "V = -G M / r", "I = V / R", "A = lambda N"], 0, "This is the Stefan-Boltzmann luminosity relation.", hint),
    mc("Two stars have the same temperature, but Star A has twice the radius of Star B. How does their luminosity compare?", ["Star A is 4 times as luminous", "Star A is 2 times as luminous", "Star A is 8 times as luminous", "they have the same luminosity"], 0, "At fixed temperature, luminosity scales with R^2.", hint),
    mc("A star has lambda_max = 5.0 x 10^-7 m. What is its approximate surface temperature?", ["5.8 x 10^3 K", "5.8 x 10^2 K", "1.5 x 10^4 K", "2.9 x 10^3 K"], 0, "Use T = b / lambda_max.", hint),
    mc("Why can a giant star be cooler than the Sun but still more luminous?", ["its much larger radius gives a far larger emitting surface area", "cooler stars always emit more per square meter", "giants have no spectra", "luminosity depends only on temperature"], 0, "Radius matters as well as temperature.", hint),
    mc("What do dark absorption lines in a stellar spectrum mainly indicate?", ["specific elements absorbing selected wavelengths", "that the star emits no visible light", "the star is always a black hole", "the star is extremely near Earth"], 0, "The pattern of lines is a composition clue.", hint),
    mc("What is luminosity?", ["total power emitted by the star", "brightness seen from Earth only", "the star's temperature only", "energy per kilogram"], 0, "Luminosity is the total output, not just how bright it looks to us.", hint),
    ...shortCases([
      { prompt: "A shorter peak wavelength means a ... surface.", acceptedAnswers: ["hotter", "higher-temperature"], hint: "Use Wien's law qualitatively." },
      { prompt: "The H-R diagram compares luminosity with ...", acceptedAnswers: ["temperature"], hint: "That is the horizontal story." },
      { prompt: "A white dwarf is hot but has low ...", acceptedAnswers: ["luminosity"], hint: "Its small radius keeps total output down." },
      { prompt: "A red giant is cool but has large ...", acceptedAnswers: ["radius"], hint: "That is why it can still be bright." },
      { prompt: "Absorption lines help identify a star's chemical ...", acceptedAnswers: ["composition", "elements"], hint: "Think fingerprint of the atmosphere." },
      { prompt: "Luminosity is a star's total power ...", acceptedAnswers: ["output", "emitted"], hint: "Not just how bright it appears here." },
      { prompt: "At the same temperature, a larger star has a greater ...", acceptedAnswers: ["luminosity"], hint: "Use the R^2 factor." },
      { prompt: "Main-sequence stars lie on the long H-R ...", acceptedAnswers: ["band", "strip"], hint: "That is the main region name." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Use the spectrum to anchor temperature before you interpret H-R position.";
  return [
    mc("Why is it weak to say an H-R diagram only tells you a star's color?", ["the diagram compares luminosity with temperature, so size and evolutionary stage can also be inferred", "H-R diagrams do not involve stars", "color is the same as distance", "luminosity is never shown"], 0, "The point of H-R is the relationship between temperature and luminosity.", hint),
    mc("Why can a white dwarf be hot but faint?", ["it has a very small radius, so its emitting area is small even at high temperature", "hotter stars always have low power", "white dwarfs have no spectra", "its temperature is actually low"], 0, "This is the low-left H-R logic.", hint),
    mc("Why can a red giant be cool but very luminous?", ["its huge radius more than compensates for the lower temperature", "cool stars emit more power per square meter than hot stars", "giants must be near Earth", "luminosity depends only on color name"], 0, "Area matters strongly in L = 4 pi R^2 sigma T^4.", hint),
    mc("Two stars have the same luminosity, but Star A is hotter. Which star has the smaller radius?", ["Star A", "Star B", "both have the same radius", "the radius cannot be compared"], 0, "At fixed luminosity, higher temperature requires smaller radius.", hint),
    mc("Why is a spectrum a stronger temperature clue than just saying a star 'looks blue'?", ["peak wavelength and absorption pattern can be tied to quantitative temperature reasoning", "blue stars always have the same luminosity", "spectra are used only for nearby stars", "color words replace measurement"], 0, "Use measurable wavelength evidence.", hint),
    mc("Why are absorption lines useful in stellar classification?", ["they reveal which elements are present in the star's outer layers", "they measure the star's distance directly", "they set the Hubble constant", "they replace the need for temperature"], 0, "Lines carry composition information.", hint),
    mc("Why is 'hotter means brighter' not always correct?", ["brightness or luminosity also depends on size, not temperature alone", "temperature never affects luminosity", "brightness depends only on distance", "hot stars are always white dwarfs"], 0, "Keep temperature and radius both visible.", hint),
    mc("Why does a shorter peak wavelength place a star farther to the left on the usual H-R axis?", ["the H-R temperature axis increases toward the left in the standard convention", "short wavelength means lower temperature", "left always means greater distance", "the x-axis shows radius"], 0, "The H-R temperature direction is reversed in the standard layout.", hint),
    mc("Why is the main sequence described as a pattern rather than just a list of stars?", ["most ordinary stars line up in a band linking temperature and luminosity", "all stars have identical luminosity there", "the main sequence contains only giants", "stars move randomly on the chart"], 0, "It is a relationship, not just a category name.", hint),
    mc("Why does the Stefan-Boltzmann law strengthen H-R reasoning?", ["it turns luminosity, radius, and temperature into one linked quantitative relation", "it replaces Wien's law completely", "it works only for planets", "it shows all stars have the same radius"], 0, "This is the bridge from diagram to calculation.", hint),
    mc("Why is it useful to read the spectrum before naming the H-R region?", ["temperature evidence from the spectrum helps you place the star more intelligently on the H-R diagram", "the H-R diagram gives no temperature information", "spectra work only for black holes", "H-R position decides the wavelength"], 0, "That order matches the lesson logic.", hint),
    mc("Why is a giant star not necessarily hotter than a white dwarf?", ["H-R position depends on both temperature and luminosity, so giants and white dwarfs occupy different regions for different reasons", "giants are always the hottest stars", "white dwarfs are always the coolest stars", "only color matters"], 0, "Do not collapse the diagram into one variable.", hint),
    mc("What should stay visible in a rigorous A11_L3 answer?", ["spectra reveal temperature and composition clues, while H-R position combines temperature with luminosity to indicate stellar type or stage", "H-R diagrams replace all spectra", "spectra show distance only", "stellar type is just a color label"], 0, "That holds the two evidence layers together.", hint),
    mc("Why is 'the star is bright, so it must be hot' too weak?", ["brightness seen from Earth also depends on distance, while luminosity depends on both temperature and radius", "hot stars cannot be far away", "bright means low temperature", "distance never affects appearance"], 0, "Keep apparent brightness separate from intrinsic luminosity.", hint),
    mc("Which sentence best matches A11_L3 rigor?", ["A star's spectrum gives quantitative temperature and composition clues, and its H-R position combines temperature with luminosity so main-sequence stars, giants, and white dwarfs can be distinguished by physics rather than by labels alone", "Stars are classified by color only", "An H-R diagram is just a picture of star sizes", "Spectra and H-R diagrams are unrelated"], 0, "That sentence keeps both methods connected.", hint),
    mc("Why does a star with the same temperature but lower luminosity sit below another on the H-R diagram?", ["its radius is smaller, so its total emitted power is lower", "it must have a different composition only", "its spectrum has no peak wavelength", "luminosity does not depend on size"], 0, "At fixed temperature, radius controls the vertical separation.", hint),
    ...shortCases([
      { prompt: "At fixed luminosity, a hotter star must have a ... radius.", acceptedAnswers: ["smaller", "small"], hint: "Use L = 4 pi R^2 sigma T^4." },
      { prompt: "A white dwarf is hot but has a very ... radius.", acceptedAnswers: ["small", "tiny"], hint: "That is why its luminosity is low." },
      { prompt: "A red giant is bright mainly because its surface area is very ...", acceptedAnswers: ["large", "big"], hint: "The radius dominates." },
      { prompt: "Absorption lines are evidence for stellar ...", acceptedAnswers: ["composition", "elements"], hint: "Use the chemical clue language." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Choose the correct distance rung before you calculate.";
  return [
    mc("Which method is best for relatively nearby stars?", ["parallax", "standard candles only", "Hubble law only", "stellar evolution only"], 0, "Parallax is the geometric nearby-star rung.", hint),
    mc("Which formula gives distance in parsecs from parallax angle in arcseconds?", ["d = 1 / p", "I = L / (4 pi d^2)", "z = Delta lambda / lambda", "v = sqrt(G M / r)"], 0, "This is the standard parallax relation.", hint),
    mc("A star has parallax angle 0.10 arcsec. What is its distance?", ["10 pc", "0.10 pc", "100 pc", "1 pc"], 0, "Distance in parsecs is the reciprocal of parallax in arcseconds.", hint),
    mc("A star has parallax angle 0.020 arcsec. What is its distance?", ["50 pc", "20 pc", "5 pc", "200 pc"], 0, "Use d = 1 / 0.020.", hint),
    mc("What is a standard candle?", ["an object whose luminosity is known", "an object whose temperature never changes", "a star with zero redshift", "a planet with known radius"], 0, "Known luminosity lets brightness become a distance clue.", hint),
    mc("Which relation links luminosity, apparent brightness, and distance?", ["I = L / (4 pi d^2)", "g = G M / r^2", "V = -G M / r", "P = E / t"], 0, "This is the inverse-square brightness law.", hint),
    mc("If two identical standard candles are at distances d and 2d, how do their apparent brightnesses compare?", ["the farther one is one quarter as bright", "the farther one is one half as bright", "they are equally bright", "the farther one is twice as bright"], 0, "Brightness follows the inverse-square law.", hint),
    mc("If apparent brightness falls by a factor of 9 for the same luminosity, what happens to distance?", ["it becomes 3 times larger", "it becomes 9 times larger", "it becomes one third", "it stays the same"], 0, "Brightness scales as 1 / d^2.", hint),
    mc("What is apparent brightness?", ["power received per unit area at the observer", "total power emitted by the source", "distance per unit time", "work per unit mass"], 0, "This is what we measure at Earth.", hint),
    mc("Why is astronomy described as a distance ladder?", ["different methods are reliable over different distance ranges", "one method works perfectly for every scale", "distance can be read from color alone", "all stars are at the same distance"], 0, "No single rung spans every scale well.", hint),
    mc("Why does parallax become difficult for distant stars?", ["the angle becomes extremely small and hard to measure accurately", "the stars stop moving", "distance makes light travel slower", "the parsec formula stops working mathematically"], 0, "The geometry signal shrinks with distance.", hint),
    mc("What is 1 parsec?", ["the distance of an object with parallax angle 1 arcsec", "the brightness of a 1 W star", "the distance light travels in 1 second", "the radius of Earth's orbit"], 0, "The parsec is defined geometrically by parallax.", hint),
    ...shortCases([
      { prompt: "Parallax is the best distance method for ... stars.", acceptedAnswers: ["nearby", "near"], hint: "Use the short-range rung." },
      { prompt: "A standard candle has known ...", acceptedAnswers: ["luminosity"], hint: "That is what makes the method work." },
      { prompt: "Apparent brightness falls with the ... of distance.", acceptedAnswers: ["square", "inverse square"], hint: "Use the inverse-square relation." },
      { prompt: "If p = 0.50 arcsec, distance is ... parsecs.", acceptedAnswers: ["2", "2 pc", "two"], hint: "Take the reciprocal." },
      { prompt: "If a source is 4 times farther away, apparent brightness becomes ...", acceptedAnswers: ["one sixteenth", "1/16", "a sixteenth"], hint: "Square the distance factor." },
      { prompt: "The unit obtained directly from d = 1 / p is the ...", acceptedAnswers: ["parsec", "pc", "parsecs"], hint: "That is the parallax distance unit." },
      { prompt: "A more distant star with the same luminosity appears ...", acceptedAnswers: ["dimmer", "fainter"], hint: "That is the observed effect." },
      { prompt: "Different distance methods form a distance ...", acceptedAnswers: ["ladder"], hint: "Use the standard astronomy phrase." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Explain why the correct method depends on the scale.";
  return [
    mc("Why is it weak to ask for astronomical distance with no method in mind?", ["different distance scales need different evidence methods", "every distance can be found by parallax alone", "brightness always gives distance directly", "all stars have equal luminosity"], 0, "The whole lesson is about choosing the right rung.", hint),
    mc("Why does parallax stop being the main tool for distant galaxies?", ["the angular shift becomes too tiny to measure reliably", "galaxies have no spectra", "their luminosity is always unknown", "inverse-square brightness stops applying"], 0, "The geometric signal becomes too small.", hint),
    mc("Why does a standard candle require known luminosity rather than just known color?", ["distance is inferred by comparing intrinsic power with received brightness", "color alone always fixes distance", "luminosity is irrelevant", "distance depends only on temperature"], 0, "Intrinsic output is the missing piece.", hint),
    mc("Why is 'bright means near' a weak astronomy statement?", ["an object can look bright either because it is near or because it is intrinsically luminous", "brightness never depends on distance", "all stars have equal luminosity", "bright stars are always standard candles"], 0, "Apparent brightness mixes source and distance information.", hint),
    mc("Why does the inverse-square law matter in standard-candle questions?", ["it turns the measured brightness drop into a distance estimate", "it removes the need for luminosity", "it applies only inside galaxies", "it means all standard candles have equal apparent brightness"], 0, "Brightness-distance scaling is the heart of the method.", hint),
    mc("Why does a smaller parallax angle mean a greater distance?", ["the geometric shift caused by Earth's orbit shrinks with increasing distance", "because more distant stars are more luminous", "because the source mass grows", "because the star moves faster"], 0, "This is the geometry behind the reciprocal formula.", hint),
    mc("Why is the parsec a useful unit in astronomy?", ["it comes directly from the parallax relation and matches stellar distances conveniently", "it is the same as a light-second", "it is based on brightness, not geometry", "it is used only for black holes"], 0, "The unit belongs naturally to the method.", hint),
    mc("Why should parallax and standard candles not be treated as rival methods?", ["they are different rungs used at different scales in one distance ladder", "they always give contradictory answers", "one is modern and one is wrong", "both are only for nearby planets"], 0, "The methods complement each other.", hint),
    mc("A student says 'if two stars look equally bright, they must be equally distant.' Why is that weak?", ["their intrinsic luminosities may be different", "distance never affects brightness", "parallax would always be the same", "brightness determines mass only"], 0, "Apparent brightness alone is not enough.", hint),
    mc("Why is a Cepheid or supernova useful as a standard candle?", ["its intrinsic luminosity can be estimated from another measured property or from its class", "it has zero temperature", "it always lies in the Milky Way", "it gives parallax directly"], 0, "Known or inferable luminosity is the key.", hint),
    mc("Why is the distance ladder not evidence of confusion in astronomy?", ["it reflects the fact that one method becomes impractical and another takes over at larger scale", "astronomers keep changing methods at random", "distance cannot be measured at all", "every scale uses the same formula but different units"], 0, "A ladder is an organized strategy, not a weakness.", hint),
    mc("Why is 'parallax is better because it is geometric' still incomplete?", ["it is excellent nearby, but its angle becomes too small at large distance", "geometry never works in astronomy", "standard candles ignore physics", "brightness methods are always wrong"], 0, "Even a strong method has a range limit.", hint),
    mc("What should stay visible in a rigorous A11_L4 answer?", ["astronomical distance is measured with different rungs because parallax, standard candles, and other methods are each suitable over different scales", "parallax and candles are the same method", "distance comes only from spectra", "scale does not matter"], 0, "This is the lesson's main distinction.", hint),
    mc("Why is 'standard candle' stronger wording than 'bright star'?", ["the source has calibrated intrinsic luminosity, not just large apparent brightness", "it means the star is always close", "it means the star emits only yellow light", "it means the distance is already known"], 0, "Calibration is the important feature.", hint),
    mc("Which sentence best matches A11_L4 rigor?", ["Distance measurement is a ladder because nearby stars can be handled geometrically with parallax, while larger scales need known-luminosity sources and inverse-square brightness reasoning", "All distance work uses one formula only", "Bright stars are close stars", "Parallax works equally well for galaxies"], 0, "That keeps the scale logic clear.", hint),
    mc("Why can a dim star still be close to Earth?", ["it may simply have low intrinsic luminosity", "close stars must always be bright", "distance and brightness are unrelated", "nearby stars have zero parallax"], 0, "Apparent dimness does not automatically mean large distance.", hint),
    ...shortCases([
      { prompt: "The main reason astronomers need a ladder is different distance ...", acceptedAnswers: ["scales", "ranges"], hint: "One method does not cover everything." },
      { prompt: "A smaller parallax angle means a ... star.", acceptedAnswers: ["farther", "more distant"], hint: "The geometry shift is smaller." },
      { prompt: "A standard candle requires known intrinsic ...", acceptedAnswers: ["luminosity", "brightness"], hint: "Use the source-output word." },
      { prompt: "Apparent brightness depends on luminosity and ...", acceptedAnswers: ["distance"], hint: "That is why the reasoning is two-step." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Keep stellar fate tied to initial mass and to how strong the final core collapse becomes.";
  return [
    mc("What most strongly determines a star's final evolution pathway?", ["its initial mass", "its distance from Earth", "its color alone", "its parallax angle"], 0, "Mass controls the later branch.", hint),
    mc("What is the usual end state of a low-mass Sun-like star?", ["white dwarf", "black hole", "neutron star", "supernova remnant only"], 0, "Low-mass stars leave white dwarfs.", hint),
    mc("What can a very massive star become after supernova core collapse?", ["neutron star or black hole", "white dwarf only", "main-sequence star again", "planet"], 0, "Massive cores produce more extreme remnants.", hint),
    mc("What is a white dwarf?", ["the dense remnant core left after a low-mass star sheds its outer layers", "a cool gas cloud before star birth", "a galaxy with low luminosity", "a black hole's event horizon"], 0, "White dwarfs are compact low-mass endpoints.", hint),
    mc("What is a neutron star?", ["an extremely dense remnant formed when a massive star's core collapses after supernova", "a main-sequence star with many neutrons in its atmosphere", "an orbiting satellite", "a low-density red giant"], 0, "This is the compact-remnant outcome for sufficiently massive cores.", hint),
    mc("Which formula gives the Schwarzschild radius of a non-rotating black hole?", ["R_s = 2 G M / c^2", "g = G M / r^2", "z = Delta lambda / lambda", "L = 4 pi R^2 sigma T^4"], 0, "This is the event-horizon radius relation.", hint),
    mc("A 1-solar-mass black hole would have Schwarzschild radius closest to...", ["3 km", "30 km", "300 m", "300 km"], 0, "The rule of thumb is about 3 km per solar mass.", hint),
    mc("A 3-solar-mass remnant would have Schwarzschild radius closest to...", ["9 km", "3 km", "27 km", "90 km"], 0, "Schwarzschild radius scales directly with mass.", hint),
    mc("If a remnant of given mass has actual radius smaller than its Schwarzschild radius, what is it?", ["a black hole", "a white dwarf", "a red giant", "a main-sequence star"], 0, "Inside the event horizon, light cannot escape.", hint),
    mc("Why do massive stars usually have shorter lives than low-mass stars?", ["they burn their fuel much faster", "they have less gravity", "they stay cooler", "they have lower luminosity"], 0, "Greater mass usually means much faster energy use.", hint),
    mc("What happens when a star like the Sun exhausts core hydrogen?", ["it expands into a red giant", "it immediately becomes a black hole", "it stops radiating at once", "it becomes a neutron star without change"], 0, "Hydrogen exhaustion leads to the giant phase first.", hint),
    mc("What is an event horizon?", ["the boundary inside which escape would require faster than light", "the surface of a white dwarf", "the visible color band of a star", "the orbit of a geostationary satellite"], 0, "This is the black-hole escape boundary.", hint),
    ...shortCases([
      { prompt: "A low-mass star typically ends as a white ...", acceptedAnswers: ["dwarf"], hint: "Name the compact remnant." },
      { prompt: "A very massive star can leave a neutron star or a black ...", acceptedAnswers: ["hole"], hint: "That is the more extreme compact object." },
      { prompt: "The main branching factor in stellar evolution is initial ...", acceptedAnswers: ["mass"], hint: "That decides the pathway." },
      { prompt: "A star like the Sun first swells into a red ...", acceptedAnswers: ["giant"], hint: "That is the post-main-sequence stage." },
      { prompt: "The Schwarzschild radius of a 2-solar-mass black hole is about ... km.", acceptedAnswers: ["6", "six"], hint: "Use about 3 km per solar mass." },
      { prompt: "If radius is smaller than the Schwarzschild radius, the remnant is a black ...", acceptedAnswers: ["hole"], hint: "That is the defining comparison." },
      { prompt: "Massive stars have shorter lives because they use fuel more ...", acceptedAnswers: ["quickly", "rapidly", "fast"], hint: "Higher rate, shorter lifetime." },
      { prompt: "The no-escape boundary around a black hole is the event ...", acceptedAnswers: ["horizon"], hint: "Use the standard phrase." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Explain why the remnant becomes more extreme as the leftover core mass increases.";
  return [
    mc("Why is a list of white dwarf, neutron star, and black hole not enough on its own?", ["the key idea is that different initial masses leave different core masses and therefore different collapse outcomes", "the names are the whole physics", "all stars pass through all three states", "the outcome depends only on distance from Earth"], 0, "Mass-dependent pathway is the core lesson.", hint),
    mc("Why can a low-mass star stop at the white-dwarf stage while a more massive star cannot?", ["the low-mass remnant core is not heavy enough for collapse beyond white-dwarf support", "low-mass stars have no gravity", "high-mass stars cool more quickly", "white dwarfs have larger Schwarzschild radius than all other objects"], 0, "The remaining core mass sets the collapse strength.", hint),
    mc("Why does a higher-mass remnant core lead to a more extreme compact object?", ["stronger gravity makes collapse harder to resist", "higher mass weakens gravity", "compact objects are chosen randomly", "higher mass lowers density"], 0, "More mass deepens the collapse problem.", hint),
    mc("Why is a black hole not just 'a very dark star'?", ["its defining feature is an event horizon from which light cannot escape", "it is a star with low luminosity only", "it has no gravity", "it is the same as a neutron star"], 0, "Use the event-horizon idea, not a brightness slogan.", hint),
    mc("Why does Schwarzschild radius scale directly with mass?", ["R_s = 2 G M / c^2 is directly proportional to M", "R_s depends only on temperature", "R_s gets smaller when mass increases", "R_s is fixed for all stars"], 0, "The formula shows the proportionality clearly.", hint),
    mc("Why is the actual-radius comparison important in black-hole questions?", ["a remnant becomes a black hole only if it fits inside its Schwarzschild radius", "all compact remnants are black holes automatically", "radius never matters in gravity", "light escape depends only on color"], 0, "Mass alone is not the whole test.", hint),
    mc("Why do massive stars usually live shorter lives despite having more fuel?", ["their luminosity and burn rate rise so strongly that fuel is used up faster", "more fuel always guarantees longer life", "massive stars have lower temperature", "massive stars do not use fusion"], 0, "Lifetime depends on both fuel amount and rate of use.", hint),
    mc("Why is a supernova linked to massive stars but not to ordinary low-mass stellar endings?", ["the massive-core collapse is much more violent and can produce a neutron star or black hole", "low-mass stars always explode the same way", "supernovae are caused by parallax", "only nearby stars can explode"], 0, "The collapse pathway differs by mass.", hint),
    mc("Why is 'a black hole sucks everything in' a weak school-level description?", ["the main rigorous point is that once inside the event horizon escape would require speed greater than c", "black holes have no gravity outside the horizon", "they pull harder than gravity elsewhere at every distance", "objects fall in because the universe expands"], 0, "Event horizon is the correct defining idea.", hint),
    mc("Why is a neutron star more extreme than a white dwarf?", ["its matter is compressed much further by stronger core collapse", "it is always larger in radius", "it is cooler so it must be denser", "it contains no gravity"], 0, "The density and collapse severity are much greater.", hint),
    mc("Why does the lesson compare stellar evolution with compact-object calculation?", ["the pathway story tells you which remnant may form, and the Schwarzschild relation tests the black-hole condition quantitatively", "the calculation replaces the pathway", "stellar evolution is unrelated to compact objects", "black holes are found by temperature alone"], 0, "The lesson is both narrative and quantitative.", hint),
    mc("Why is a white dwarf still luminous at first even though fusion has ended?", ["it remains hot and radiates stored thermal energy", "white dwarfs keep core fusion running forever", "luminosity proves it is still on the main sequence", "light can escape only from black holes"], 0, "Radiation can continue without ongoing fusion.", hint),
    mc("Why is the event horizon a stronger phrase than 'surface of the black hole'?", ["it identifies the escape boundary rather than an ordinary solid surface", "black holes have a visible crust", "all event horizons are made of gas", "the two phrases always mean exactly the same thing in school physics"], 0, "Use the boundary concept, not a normal-surface picture.", hint),
    mc("What should stay visible in a rigorous A11_L5 answer?", ["initial stellar mass sets the pathway, and compact-remnant type depends on how strong the final core collapse becomes", "all stars end the same way", "remnant type depends only on distance", "black holes are defined by low temperature"], 0, "That is the module's main distinction.", hint),
    mc("Which sentence best matches A11_L5 rigor?", ["Lower-mass stars can end as white dwarfs, while more massive stars leave heavier cores that can collapse into neutron stars or black holes, with the Schwarzschild-radius test marking the event-horizon condition", "Every star eventually becomes a black hole", "Black holes are just stars that stop glowing", "Compact objects are unrelated astronomy facts"], 0, "This holds the branch logic and the calculation together.", hint),
    mc("Why does a 3-solar-mass remnant with radius 7 km count as a black hole in the simple school model?", ["its radius is smaller than the roughly 9 km Schwarzschild radius for that mass", "7 km is too large for gravity to matter", "all 3-solar-mass remnants are white dwarfs", "black holes are identified by temperature only"], 0, "Use the direct radius comparison.", hint),
    ...shortCases([
      { prompt: "A more massive leftover stellar core means a more ... gravitational collapse.", acceptedAnswers: ["extreme", "severe", "strong"], hint: "That is why the remnant changes." },
      { prompt: "The no-escape condition begins at the Schwarzschild ...", acceptedAnswers: ["radius"], hint: "That is the named threshold." },
      { prompt: "A white dwarf comes from the lower-... stellar pathway.", acceptedAnswers: ["mass"], hint: "Use the branch factor." },
      { prompt: "Massive stars usually have shorter ... than Sun-like stars.", acceptedAnswers: ["lives", "lifetimes"], hint: "Rate of fuel use matters." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Move from wavelength shift to recession speed to cosmology meaning.";
  return [
    mc("What is redshift?", ["an increase in observed wavelength compared with emitted wavelength", "a decrease in mass of the galaxy", "the brightness of a nearby star", "the force per unit mass in a field"], 0, "Redshift is a wavelength-stretch idea.", hint),
    mc("Which formula defines redshift z?", ["z = Delta lambda / lambda_emitted", "z = v / d", "z = G M / r^2", "z = 1 / p"], 0, "This is the standard wavelength-shift definition.", hint),
    mc("A line is emitted at 500 nm and observed at 550 nm. What is z?", ["0.10", "0.50", "0.05", "1.10"], 0, "z = (550 - 500) / 500 = 0.10.", hint),
    mc("For modest redshift, what speed estimate can be used?", ["v approx z c", "v = G M / r", "v = 1 / p", "v = lambda T"], 0, "This is the low-redshift speed approximation.", hint),
    mc("If z = 0.20, what is the recession speed approximately?", ["6.0 x 10^4 km/s", "6.0 x 10^3 km/s", "3.0 x 10^5 km/s", "1.5 x 10^4 km/s"], 0, "Use 0.20 times 3.0 x 10^5 km/s.", hint),
    mc("Which law links recession speed and distance?", ["v = H0 d", "V = -G M / r", "d = 1 / p", "L = 4 pi R^2 sigma T^4"], 0, "This is Hubble's law.", hint),
    mc("If H0 = 70 km/s/Mpc and a galaxy recedes at 700 km/s, what is its distance?", ["10 Mpc", "70 Mpc", "1 Mpc", "100 Mpc"], 0, "Distance equals speed divided by H0.", hint),
    mc("What does a greater positive redshift usually suggest on large scales?", ["greater recession and greater distance", "the galaxy is approaching", "the galaxy has no spectrum", "the galaxy is losing mass"], 0, "Redshift is the basic expansion clue.", hint),
    mc("What is the main interpretation of the Hubble redshift-distance trend?", ["space is expanding on large scales", "all galaxies orbit Earth", "gravity has become repulsive everywhere locally", "light slows down because it is old"], 0, "The large-scale trend supports expansion.", hint),
    mc("What is dark energy used to describe in modern cosmology?", ["accelerated expansion of the universe", "the gravity of black holes only", "nuclear fusion inside stars", "parallax measurement error"], 0, "Dark energy is the label used for the observed acceleration trend.", hint),
    mc("If galaxy distance doubles in the simple Hubble-law model, what happens to recession speed?", ["it doubles", "it halves", "it stays the same", "it quadruples"], 0, "Hubble's law is directly proportional.", hint),
    mc("Why must the emitted spectral line be identified before calculating redshift?", ["you need the correct emitted wavelength to compare with the observed wavelength", "redshift ignores wavelength", "distance is enough without spectra", "all lines have the same emitted value"], 0, "Line identification anchors the calculation.", hint),
    ...shortCases([
      { prompt: "Positive redshift means the observed wavelength is ... than the emitted wavelength.", acceptedAnswers: ["longer", "greater"], hint: "Think stretched light." },
      { prompt: "Hubble's law says recession speed is proportional to ...", acceptedAnswers: ["distance"], hint: "That is the large-scale trend." },
      { prompt: "A galaxy with larger positive redshift is usually ... away.", acceptedAnswers: ["farther", "further", "more distant"], hint: "Stay with the Hubble trend." },
      { prompt: "In modern cosmology, dark energy is linked to ... expansion.", acceptedAnswers: ["accelerated", "acceleration of"], hint: "That is the modern add-on to simple expansion." },
      { prompt: "If z = 0.05, then v is about ... c.", acceptedAnswers: ["0.05", "5%", "0.05 of"], hint: "Use the low-z approximation." },
      { prompt: "The quantity H0 is called the Hubble ...", acceptedAnswers: ["constant"], hint: "Use the standard name." },
      { prompt: "Redshift compares wavelength change with the ... wavelength.", acceptedAnswers: ["emitted"], hint: "That is the denominator." },
      { prompt: "The large-scale redshift pattern is evidence for an ... universe.", acceptedAnswers: ["expanding"], hint: "That is the cosmology word." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Keep the evidence chain visible: spectrum to redshift to speed to expansion trend.";
  return [
    mc("Why is it weak to say 'a galaxy is red' and call that cosmology?", ["cosmology uses identified spectral-line shifts and the redshift-distance trend, not color words alone", "galaxy color directly gives H0", "all red galaxies are nearby", "spectra are irrelevant"], 0, "Use line-shift evidence, not appearance language.", hint),
    mc("Why does a positive redshift support recession rather than the idea that light has simply slowed down in flight?", ["the same spectral lines appear at longer wavelengths, showing stretching rather than line replacement", "because red light always travels slower than blue light", "because galaxies stop emitting blue light", "because redshift depends only on mass"], 0, "The line pattern is the evidence.", hint),
    mc("Why is Hubble's law stronger than quoting one redshift on its own?", ["it shows a large-scale trend linking many galaxy distances with many recession speeds", "one redshift proves the age of the universe exactly", "Hubble's law works only inside the Milky Way", "one line shift gives the galaxy mass directly"], 0, "The pattern across many galaxies matters.", hint),
    mc("Why is 'the universe exploded into empty space from one point' a weak school-level description?", ["the modern model describes expansion of space itself, not debris flying into pre-existing emptiness from a central point", "because the universe never changed size", "because galaxies are fixed in space", "because redshift proves nothing moved"], 0, "Use expanding-space language.", hint),
    mc("Why does identifying the same spectral line in emission and observation matter?", ["it makes the wavelength comparison objective and measurable", "it tells you the galaxy's mass automatically", "it removes the need for Hubble's law", "it means the galaxy is stationary"], 0, "Correct line matching is the start of redshift work.", hint),
    mc("Why is dark energy mentioned together with Hubble expansion in modern cosmology?", ["it is the name given to the observed accelerated expansion beyond the simplest constant-rate picture", "it replaces redshift completely", "it is the same as gravitational field strength", "it is a standard candle"], 0, "The modern picture goes beyond simple expansion.", hint),
    mc("Why can a galaxy be very far away without showing a huge parallax angle?", ["parallax becomes far too small to measure at such distances, so cosmology uses redshift and other rungs", "redshift makes parallax larger", "far galaxies have no light", "parallax depends only on temperature"], 0, "Distance methods change with scale.", hint),
    mc("Why is the low-redshift relation v approx z c described as an approximation?", ["it works well for modest redshifts but not as a full exact treatment at very large z", "it is unrelated to light speed", "it gives distance directly without H0", "redshift is never measurable"], 0, "The approximation is useful, but limited.", hint),
    mc("Why is a greater-redshift galaxy usually placed farther away in the Hubble picture?", ["farther galaxies generally lie on the part of the trend with larger recession speeds and therefore larger z", "greater redshift means lower distance", "distance does not affect redshift", "redshift measures brightness only"], 0, "This is the core pattern of the lesson.", hint),
    mc("Why is it weak to say dark energy is 'proof that gravity is gone'?", ["the point is accelerated expansion on cosmic scales, not the disappearance of gravity in every local system", "gravity no longer exists anywhere", "dark energy is a new star type", "dark energy changes atomic spectra directly"], 0, "Keep the scale and claim proportional to the evidence.", hint),
    mc("Why should a rigorous cosmology answer move from spectrum to redshift to speed to distance?", ["each step uses the previous one to turn observed line data into an expansion inference", "speed should be guessed first", "distance is known without spectra", "redshift is unrelated to recession"], 0, "This is the clean chain of reasoning.", hint),
    mc("Why is one nearby galaxy moving oddly not enough to refute Hubble's law?", ["Hubble's law is a large-scale trend, and local motions can sit on top of that pattern", "one example automatically destroys every trend", "local motion cannot exist", "Hubble's law applies only to stars inside one galaxy"], 0, "Keep local variation separate from global pattern.", hint),
    mc("What should stay visible in a rigorous A11_L6 answer?", ["redshift is measured from spectral-line stretching and used with Hubble's law to support an expanding-universe model, with dark energy added in modern cosmology to describe accelerated expansion", "galaxies are farther away because they look red", "dark energy replaces the need for spectra", "one redshift proves every cosmological detail"], 0, "That sentence keeps evidence and interpretation aligned.", hint),
    mc("Why is the cosmic microwave background often grouped with redshift evidence in cosmology?", ["it is another large-scale clue supporting the hot expanding-universe model", "it is the same thing as parallax", "it gives orbital period directly", "it proves stars are nearby"], 0, "It is another evidence strand, not a replacement for redshift.", hint),
    mc("Which sentence best matches A11_L6 rigor?", ["Greater spectral redshift generally means greater recession and distance, so the large-scale galaxy trend supports expansion of space, while dark energy is used in the modern model to account for accelerated expansion", "Redshift is just another word for galaxy color", "The universe expands because gravity stops existing", "Every galaxy has the same recession speed"], 0, "This gives the evidence chain and the modern extension.", hint),
    mc("Why is it stronger to say 'space itself stretches' than 'galaxies fly through space like shrapnel'?", ["it better matches the large-scale metric expansion model used in modern cosmology", "because galaxies never move relative to one another", "because redshift means galaxies are stationary", "because Hubble's law measures force"], 0, "Use the modern model language rather than an explosion analogy.", hint),
    ...shortCases([
      { prompt: "Redshift is measured by comparing observed wavelength with the ... wavelength.", acceptedAnswers: ["emitted"], hint: "You need the line reference." },
      { prompt: "In the simple Hubble picture, farther galaxies recede ...", acceptedAnswers: ["faster"], hint: "That is the proportional trend." },
      { prompt: "Dark energy is used to describe ... cosmic expansion.", acceptedAnswers: ["accelerated"], hint: "Use the modern cosmology term." },
      { prompt: "The universe model supported by galaxy redshift is an ... universe.", acceptedAnswers: ["expanding"], hint: "That is the main cosmology conclusion." },
    ]),
  ];
}

function l1MasteryRaw(): RawItem[] {
  return [...l1DiagnosticRaw(), ...l1ConceptRaw()];
}

function l2MasteryRaw(): RawItem[] {
  return [...l2DiagnosticRaw(), ...l2ConceptRaw()];
}

function l3MasteryRaw(): RawItem[] {
  return [...l3DiagnosticRaw(), ...l3ConceptRaw()];
}

function l4MasteryRaw(): RawItem[] {
  return [...l4DiagnosticRaw(), ...l4ConceptRaw()];
}

function l5MasteryRaw(): RawItem[] {
  return [...l5DiagnosticRaw(), ...l5ConceptRaw()];
}

function l6MasteryRaw(): RawItem[] {
  return [...l6DiagnosticRaw(), ...l6ConceptRaw()];
}

const A11_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A11_L1: l1DiagnosticRaw,
  A11_L2: l2DiagnosticRaw,
  A11_L3: l3DiagnosticRaw,
  A11_L4: l4DiagnosticRaw,
  A11_L5: l5DiagnosticRaw,
  A11_L6: l6DiagnosticRaw,
};

const A11_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A11_L1: l1ConceptRaw,
  A11_L2: l2ConceptRaw,
  A11_L3: l3ConceptRaw,
  A11_L4: l4ConceptRaw,
  A11_L5: l5ConceptRaw,
  A11_L6: l6ConceptRaw,
};

const A11_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  A11_L1: l1MasteryRaw,
  A11_L2: l2MasteryRaw,
  A11_L3: l3MasteryRaw,
  A11_L4: l4MasteryRaw,
  A11_L5: l5MasteryRaw,
  A11_L6: l6MasteryRaw,
};

export function a11GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A11_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function a11GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A11_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function a11GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A11_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
