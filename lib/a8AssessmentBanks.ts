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
  hint = "Rebuild the lesson mechanism before choosing.",
): RawMcItem {
  return { kind: "mc", prompt, choices, answerIndex, hint, explanation };
}

function short(prompt: string, acceptedAnswers: string[], hint: string): RawShortItem {
  return { kind: "short", prompt, acceptedAnswers: Array.from(new Set(acceptedAnswers)), hint };
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
    throw new Error(`A8 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function shortCases(cases: Array<{ prompt: string; acceptedAnswers: string[]; hint: string }>): RawItem[] {
  return cases.map((entry) => short(entry.prompt, entry.acceptedAnswers, entry.hint));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Keep the field at a location separate from the force on one chosen charge.";
  return [
    mc("What is electric field strength at a point?", ["force per unit positive charge", "energy per unit mass", "charge per unit force", "current per unit voltage"], 0, "Electric field strength is defined as force on a small positive test charge divided by the charge.", hint),
    mc("Why is a test charge described as a probe rather than the cause of the field?", ["the source charges create the field and the test charge only samples it", "the test charge removes the field", "the test charge changes the proton number of the source", "the test charge is always neutral"], 0, "The field belongs to the source configuration, not to the probe.", hint),
    mc("At a point where the field points east, what direction is the force on a positive charge?", ["east", "west", "north", "south"], 0, "A positive charge feels force in the field direction.", hint),
    mc("At the same point, what direction is the force on a negative charge?", ["west", "east", "north", "south"], 0, "A negative charge feels force opposite to the field direction.", hint),
    mc("What do closer electric field lines indicate in a qualitative field map?", ["a stronger field", "a larger test charge", "a smaller source charge always", "a lower current"], 0, "Line density is the school clue to relative field strength.", hint),
    mc("Around a single positive point charge, electric field lines are best described as...", ["radially outward", "radially inward", "circular", "parallel everywhere"], 0, "Field lines leave a positive point charge.", hint),
    mc("Around a single negative point charge, electric field lines are best described as...", ["radially inward", "radially outward", "circular", "parallel everywhere"], 0, "Field lines enter a negative point charge.", hint),
    mc("If the distance from a point charge doubles, how does the field strength change?", ["it becomes one quarter", "it halves", "it doubles", "it stays the same"], 0, "Point-charge field strength follows an inverse-square rule.", hint),
    mc("A force of 6.0 x 10^-6 N acts on a 2.0 x 10^-9 C positive test charge. What is the field strength?", ["3.0 x 10^3 N/C", "1.2 x 10^-14 N/C", "1.2 x 10^3 N/C", "3.0 x 10^-3 N/C"], 0, "Use E = F / q.", hint),
    mc("A field strength of 4.0 x 10^2 N/C acts on a charge of 3.0 x 10^-6 C. What is the force magnitude?", ["1.2 x 10^-3 N", "7.5 x 10^-9 N", "1.3 x 10^8 N", "4.0 x 10^2 N"], 0, "Use F = qE.", hint),
    mc("What is the unit of electric field strength?", ["N/C", "J/C", "C/N", "V/A"], 0, "Electric field strength is force per unit charge.", hint),
    mc("If the test charge is doubled while the source configuration stays fixed, what happens to the field at that location?", ["it stays the same", "it doubles", "it halves", "it reverses"], 0, "The field is a property of the location set by the sources.", hint),
    ...shortCases([
      { prompt: "Electric field strength equals force divided by ...", acceptedAnswers: ["charge", "the charge"], hint: "Use E = F / q." },
      { prompt: "State the direction of field lines around a positive point charge.", acceptedAnswers: ["outward", "radially outward", "away from the charge"], hint: "Field lines leave a positive source." },
      { prompt: "State the direction of field lines around a negative point charge.", acceptedAnswers: ["inward", "radially inward", "toward the charge"], hint: "Field lines enter a negative source." },
      { prompt: "If the field at P points north, the force on a positive charge at P points ...", acceptedAnswers: ["north"], hint: "Positive charge follows the field direction." },
      { prompt: "If the field at P points north, the force on a negative charge at P points ...", acceptedAnswers: ["south"], hint: "Negative charge feels force opposite to the field." },
      { prompt: "A force of 8.0 x 10^-6 N acts on a charge of 2.0 x 10^-9 C. Find the field strength.", acceptedAnswers: answers("4.0 x 10^3", "N/C", "4000", "4000 N/C"), hint: "Use E = F / q." },
      { prompt: "A charge of 5.0 x 10^-6 C is in a field of 300 N/C. Find the force magnitude.", acceptedAnswers: answers("1.5 x 10^-3", "N", "0.0015", "0.0015 N"), hint: "Use F = qE." },
      { prompt: "If distance from a point charge becomes 3 times larger, the field strength becomes one over ... times the original.", acceptedAnswers: ["9"], hint: "Use the inverse-square pattern." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Explain whether the change comes from the source, the location, or the probe.";
  return [
    mc("Why is it weak to say, 'The test charge creates the field arrow'?", ["the source charges create the field and the test charge only reveals the force per charge there", "the test charge is always too heavy to move", "electric fields exist only inside metals", "field arrows are always random"], 0, "The field belongs to the source-and-location story.", hint),
    mc("What is the best correction to 'electric field is just the force'?", ["field is force per unit positive charge, so it separates the location from the chosen probe", "field and force are always identical quantities", "field is charge per unit energy only", "field exists only when the charge moves"], 0, "Field and force are related but not the same quantity.", hint),
    mc("Why can a negative charge accelerate opposite to the field direction?", ["its force is qE, so the negative sign reverses the force direction", "negative charges have no mass", "field lines reverse themselves for moving particles only", "negative charges are unaffected by electric fields"], 0, "The charge sign matters in F = qE.", hint),
    mc("Two different positive test charges are placed at the same point. Which statement is strongest?", ["they experience different forces but the same field", "they experience the same force and different fields", "both the field and force must be identical", "the stronger force means the field has changed"], 0, "Field is location-based; force depends on q as well.", hint),
    mc("Why are field lines not literal particle tracks?", ["they map the field direction, while actual motion depends on charge sign, speed, and other forces", "field lines show the proton number of the source", "particles must stay exactly on the drawn lines", "field lines measure current only"], 0, "Field maps are directional models, not guaranteed trajectories.", hint),
    mc("What changes the field more directly: doubling the source charge or doubling the test charge?", ["doubling the source charge", "doubling the test charge", "both change the field equally", "neither can change the field"], 0, "The source charge helps create the field; the probe does not.", hint),
    mc("At a fixed distance from a point charge, what happens to field strength if the source charge doubles?", ["it doubles", "it halves", "it becomes one quarter", "it stays the same"], 0, "Point-charge field is proportional to the source charge.", hint),
    mc("Why is a small test charge preferred in the field model?", ["it reduces disturbance to the source configuration while still revealing the local field", "it makes the field disappear", "it forces the field to become uniform", "it changes N/C into J/C"], 0, "The probe should sample the field without substantially altering it.", hint),
    mc("Which statement best separates source pattern from local reading?", ["the overall pattern identifies the source, while the arrow at one point gives the local direction", "one local arrow alone tells the whole source story", "source type depends only on the unit N/C", "local direction is always enough to find charge magnitude exactly"], 0, "Global pattern and local direction answer different questions.", hint),
    mc("A student says, 'The field is stronger because the test charge feels more force.' What extra condition must be checked?", ["whether the test charge itself stayed the same", "whether the compass needle changed color", "whether the unit changed from N/C to kg", "whether the field lines became equipotentials"], 0, "A larger force can come from larger q as well as larger E.", hint),
    mc("Why does inverse-square weakening matter in the point-charge model?", ["the field spreads out with distance, so the push-per-charge falls rapidly away from the source", "it proves all fields are uniform", "it shows the test charge controls distance", "it makes the force independent of position"], 0, "Inverse-square weakening is the central distance rule for a point charge.", hint),
    mc("What is the strongest interpretation of 'field at a point'?", ["the local push-per-charge that any small positive test charge would reveal there", "the exact path a charge must follow", "the charge stored permanently at that point", "the mass density of the region"], 0, "Field at a point is a local rule, not a travel command.", hint),
    mc("If the field at a location is zero, what must be true for a positive test charge placed there?", ["the electric force on it is zero at that instant", "the charge has no mass", "the source charges must all be zero", "the potential must also be zero"], 0, "Zero field means zero electric force on a positive test charge there.", hint),
    mc("Which statement best links E = F/q to the test-charge idea?", ["dividing out q removes the particular probe and leaves the location's field value", "multiplying by q removes the source", "the equation works only for negative charges", "the equation makes field independent of force"], 0, "The division by q is what separates field from chosen probe.", hint),
    mc("At two points on the same radial line from a point charge, what comparison is strongest?", ["the nearer point has the larger field strength", "the farther point has the larger field strength", "both must have equal field because the source is the same", "direction vanishes at the nearer point"], 0, "Point-charge field grows stronger at smaller separation.", hint),
    mc("A charge is released from rest in a uniform field. Which statement is strongest?", ["a positive charge accelerates with the field while a negative charge accelerates against it", "all charges accelerate in the same direction", "the field depends on the charge mass only", "the field becomes zero once the charge moves"], 0, "The acceleration direction depends on the sign of q.", hint),
    ...shortCases([
      { prompt: "The electric field belongs to the source-and-... configuration, not to the probe alone.", acceptedAnswers: ["location", "position"], hint: "Field is attached to where you sample it." },
      { prompt: "A larger test charge gives a larger force, but the field at that point stays the ...", acceptedAnswers: ["same", "unchanged"], hint: "Separate field from force." },
      { prompt: "For a negative charge, the electric force is ... to the field direction.", acceptedAnswers: ["opposite"], hint: "Use the sign of q in F = qE." },
      { prompt: "Point-charge field strength falls with the ... of the distance.", acceptedAnswers: ["square", "inverse square", "inverse-square"], hint: "State the distance rule clearly." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep electric height, energy change, and field direction as separate ideas.";
  return [
    mc("What is electric potential at a point?", ["potential energy per unit charge", "force per unit charge", "charge per unit potential energy", "current per unit voltage"], 0, "Potential is the energy-per-charge quantity.", hint),
    mc("What does potential difference measure?", ["energy transferred per unit charge between two points", "force per unit mass", "charge created between two points", "current lost in a wire"], 0, "Potential difference is work or energy per charge.", hint),
    mc("What is true for two points on the same equipotential line?", ["the potential difference between them is zero", "the electric field is zero everywhere there", "the force on every charge is zero", "they must be the same distance from every charge"], 0, "Same equipotential means same electric potential.", hint),
    mc("Why is no work done moving a charge along an equipotential path?", ["there is no potential difference along the path", "the charge becomes neutral", "the field becomes parallel to the path", "the source charge disappears"], 0, "No change in electric potential means no electrical work transfer.", hint),
    mc("How do electric field lines meet equipotential lines?", ["at right angles", "parallel to them", "randomly", "they never meet"], 0, "Field points in the direction of greatest potential decrease, so it crosses equipotentials perpendicularly.", hint),
    mc("A charge of 2.0 C gains 10 J of potential energy. What is the potential difference?", ["5.0 V", "20 V", "0.20 V", "12 V"], 0, "Use delta(Ep) = q delta(V).", hint),
    mc("A charge of 3.0 C moves through a potential difference of 4.0 V. What is the change in potential energy magnitude?", ["12 J", "0.75 J", "7 J", "1.0 J"], 0, "Use delta(Ep) = q delta(V).", hint),
    mc("What is the unit of electric potential difference?", ["volt", "newton", "tesla", "coulomb per second"], 0, "Potential difference is measured in volts.", hint),
    mc("Around a positive point charge, the electric potential generally becomes...", ["smaller farther from the charge", "larger farther from the charge", "constant everywhere", "negative everywhere"], 0, "Potential around a positive point charge falls with increasing distance.", hint),
    mc("What is the value of potential difference if 24 J of work is done moving 6.0 C of charge?", ["4.0 V", "30 V", "0.25 V", "144 V"], 0, "Use V = W / Q.", hint),
    mc("What happens to the potential energy of a positive charge when it moves to lower potential?", ["it decreases", "it increases", "it stays constant always", "it becomes negative charge"], 0, "For positive q, Ep follows V.", hint),
    mc("Which statement best describes equipotential lines?", ["they join points of equal electric potential", "they show the direction of force on a positive charge", "they are literal routes a charge must take", "they measure current density"], 0, "Equipotentials are same-potential maps.", hint),
    ...shortCases([
      { prompt: "Electric potential difference equals energy transferred per unit ...", acceptedAnswers: ["charge", "the charge"], hint: "Use the energy-per-charge meaning." },
      { prompt: "Two points on the same equipotential have zero potential ...", acceptedAnswers: ["difference"], hint: "State the quantity that vanishes." },
      { prompt: "Electric field lines cross equipotential lines at ... angles.", acceptedAnswers: ["right", "90 degree", "ninety degree", "perpendicular"], hint: "Field and equipotential are not parallel." },
      { prompt: "A charge of 5.0 C moves through 3.0 V. Find the change in potential energy magnitude.", acceptedAnswers: answers("15", "J"), hint: "Use delta(Ep) = q delta(V)." },
      { prompt: "12 J of work is done moving 4.0 C. Find the potential difference.", acceptedAnswers: answers("3", "V"), hint: "Use V = W / Q." },
      { prompt: "Moving a charge along one equipotential requires ... electrical work.", acceptedAnswers: ["no", "zero", "no work", "zero work"], hint: "There is no change in potential." },
      { prompt: "For a positive point charge, potential gets smaller as distance gets ...", acceptedAnswers: ["larger", "greater"], hint: "Compare near and far from the source." },
      { prompt: "Potential is a height-style map, while electric field is the local ... of that map.", acceptedAnswers: ["slope", "gradient"], hint: "Use the terrace analogy carefully." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Ask whether the statement is about same height, change in height, or the slope of height.";
  return [
    mc("Why is it weak to say 'potential is the same thing as field'?", ["potential is energy per charge, while field is the local force-per-charge or slope of potential", "potential is always zero when field exists", "field has units of coulomb only", "potential can only exist in magnetic topics"], 0, "Potential and field are linked but not identical.", hint),
    mc("What is the best interpretation of an equipotential line?", ["a route along which electric potential stays constant", "the path a positive charge must follow", "a place where there is always no field", "a line of constant current"], 0, "Equipotential means same potential, not compulsory travel path.", hint),
    mc("Why is no work done moving a charge along one equipotential even though a field may exist nearby?", ["the start and finish are at the same potential, so delta(V) is zero", "the charge becomes neutral on the route", "the field disappears everywhere on the line", "the line blocks all forces"], 0, "Work depends on potential difference between start and finish.", hint),
    mc("What does the right-angle meeting of field lines and equipotentials tell you?", ["the field points across the potential contours rather than along them", "potential and field are identical vectors", "charges can move only at 45 degrees", "equipotentials are stronger where they are horizontal"], 0, "Field is perpendicular to equal-potential routes.", hint),
    mc("A student says, 'Point P and Q are joined by the same field line, so they must have the same potential.' What is the best correction?", ["sharing a field line does not mean same potential; potential changes along the line", "field lines are equipotential lines", "potential depends only on charge sign of the probe", "potential vanishes on every field line"], 0, "Potential usually changes in the field direction.", hint),
    mc("Why does a positive charge naturally move toward lower electric potential energy?", ["lower potential for a positive charge means lower Ep, so electrical energy is released from the store", "lower potential means stronger mass", "lower potential means no field", "lower potential turns the charge negative"], 0, "For positive q, potential and potential energy change together.", hint),
    mc("How does a negative charge differ in potential-energy reasoning?", ["its potential-energy change is opposite in sign to the potential difference", "it ignores potential difference completely", "it always moves to higher Ep and higher V together", "it makes equipotentials disappear"], 0, "Use delta(Ep) = q delta(V) with negative q.", hint),
    mc("Why can different routes between the same two points give the same potential difference?", ["potential difference depends on the endpoints, not on which route is taken", "all routes have the same field strength", "the charge becomes neutral while moving", "distance alone fixes potential difference"], 0, "Potential difference is a start-to-finish quantity.", hint),
    mc("What is the strongest reason field lines point from higher potential to lower potential for positive charges?", ["positive charges lose potential energy moving with the field", "potential and charge are always identical", "field lines are chosen to match current direction only", "higher potential means lower force"], 0, "Field direction is the downhill direction for positive charge.", hint),
    mc("For a positive point charge, why is potential highest near the charge?", ["bringing a positive test charge close requires the greatest energy per charge against repulsion", "field lines are longest there", "potential is defined as force divided by charge", "nearby points always have zero work"], 0, "Potential measures energy per charge in the source's field.", hint),
    mc("A student says, 'If delta(V)=0 then the field must be zero.' Why is that too strong?", ["delta(V)=0 along one chosen route only means same endpoints on that route; field can still exist perpendicular to the route", "zero potential difference means there can never be any source charge", "field depends only on mass", "equipotential lines are impossible in real fields"], 0, "Zero change along an equipotential does not mean zero field everywhere.", hint),
    mc("Which statement best protects the point-charge potential rule?", ["potential around a point charge changes with distance and is not a uniform value through space", "potential around a point charge is identical everywhere", "potential depends only on the test charge used", "potential follows inverse square exactly like field strength"], 0, "Potential and field have different distance dependences.", hint),
    mc("Why is it useful to call potential a 'height map'?", ["it helps separate same-level routes from steep downhill field direction", "it proves charges have mass like hills", "it shows field lines are circular always", "it makes numerical calculation unnecessary"], 0, "The analogy distinguishes contour from slope.", hint),
    mc("If 1 C moves through 1 V, what does that mean physically?", ["1 J of energy is transferred", "1 N of force always acts", "1 T of field is present", "1 C of charge is created"], 0, "One volt is one joule per coulomb.", hint),
    mc("Which comparison is strongest between electric field and electric potential?", ["field is a vector slope quantity, while potential is a scalar height quantity", "both are vectors", "both are always zero on equipotentials", "potential is the force and field is the energy"], 0, "This is the clean conceptual separation.", hint),
    mc("A charge moves from A to B and loses 8 J of potential energy. If q = 2 C and positive, what is the potential difference from A to B?", ["-4 V", "4 V", "-16 V", "16 V"], 0, "Use delta(Ep) = q delta(V), keeping the sign.", hint),
    ...shortCases([
      { prompt: "Potential difference depends on the start and end ..., not the route.", acceptedAnswers: ["points", "positions", "endpoints"], hint: "Think path independence." },
      { prompt: "Equipotential routes are constant-potential routes, while field lines show the local ... direction.", acceptedAnswers: ["force", "field", "field-force"], hint: "Name the directional story." },
      { prompt: "For a positive charge, moving with the field means moving to ... potential.", acceptedAnswers: ["lower", "lower electric potential"], hint: "Field points downhill in potential." },
      { prompt: "One volt equals one joule per ...", acceptedAnswers: ["coulomb", "charge"], hint: "Use the definition of potential difference." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Treat uniform field strength as potential drop per metre, then use F = qE.";
  return [
    mc("What is a uniform electric field?", ["a field with the same magnitude and direction throughout the region considered", "a field that is zero everywhere", "a field that is always circular", "a field made only by negative charges"], 0, "Uniform means same size and same direction across the chosen region.", hint),
    mc("Between parallel plates, electric field direction is from the...", ["positive plate to the negative plate", "negative plate to the positive plate", "top plate to the bottom plate only", "centre outward equally"], 0, "Field direction follows the force on a positive test charge.", hint),
    mc("Which relation gives field strength between parallel plates?", ["E = V / d", "E = q / V", "E = F / m", "E = d / V"], 0, "Uniform field strength is potential difference per unit separation.", hint),
    mc("If the potential difference is fixed and the plate separation is halved, what happens to the field strength?", ["it doubles", "it halves", "it stays the same", "it becomes one quarter"], 0, "Use E = V / d.", hint),
    mc("If the separation is fixed and the potential difference doubles, what happens to the field strength?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Field strength is proportional to V for fixed d.", hint),
    mc("What force acts on a charge q in a uniform electric field E?", ["F = qE", "F = E / q", "F = q / E", "F = Ed / q"], 0, "Once E is known, force comes from qE.", hint),
    mc("A positive charge released between the plates accelerates toward the...", ["negative plate", "positive plate", "nearest plate regardless of sign", "middle point only"], 0, "A positive charge moves with the field.", hint),
    mc("A negative charge released between the plates accelerates toward the...", ["positive plate", "negative plate", "field midpoint only", "lower-voltage plate always regardless of sign"], 0, "A negative charge moves opposite to the field.", hint),
    mc("Why can the motion of a particle in a uniform electric field have constant acceleration?", ["the force magnitude stays constant if q and E stay constant", "the charge disappears after release", "the field strength becomes zero while moving", "potential difference and force are unrelated"], 0, "Constant E gives constant F for a fixed charge.", hint),
    mc("Which unit is also valid for electric field strength in this lesson?", ["V/m", "J/C^2", "C/V", "A s"], 0, "N/C and V/m are equivalent field units.", hint),
    mc("A 600 V potential difference acts across plates 0.020 m apart. What is the field strength?", ["3.0 x 10^4 V/m", "30 V/m", "1.2 x 10^4 V/m", "1.2 x 10^7 V/m"], 0, "Use E = V / d.", hint),
    mc("A field of 5.0 x 10^3 N/C acts on a charge of 2.0 x 10^-6 C. What is the force magnitude?", ["1.0 x 10^-2 N", "2.5 x 10^9 N", "4.0 x 10^-10 N", "2.5 x 10^-3 N"], 0, "Use F = qE.", hint),
    ...shortCases([
      { prompt: "In a uniform field between plates, the field lines are approximately ... to each other.", acceptedAnswers: ["parallel"], hint: "Uniform fields are drawn with equal, parallel arrows." },
      { prompt: "A 200 V potential difference acts across a 0.050 m gap. Find the field strength.", acceptedAnswers: answers("4.0 x 10^3", "V/m", "4000", "4000 V/m"), hint: "Use E = V / d." },
      { prompt: "A 1200 V potential difference acts across a 0.040 m gap. Find the field strength.", acceptedAnswers: answers("3.0 x 10^4", "V/m", "30000", "30000 V/m"), hint: "Use E = V / d." },
      { prompt: "A charge of 4.0 x 10^-6 C is in a field of 2.0 x 10^4 N/C. Find the force magnitude.", acceptedAnswers: answers("8.0 x 10^-2", "N", "0.08", "0.08 N"), hint: "Use F = qE." },
      { prompt: "A charge of 1.5 x 10^-6 C is in a field of 6.0 x 10^3 N/C. Find the force magnitude.", acceptedAnswers: answers("9.0 x 10^-3", "N", "0.009", "0.009 N"), hint: "Use F = qE." },
      { prompt: "A particle of mass 2.0 x 10^-3 kg experiences a force of 1.0 x 10^-2 N. Find its acceleration.", acceptedAnswers: answers("5", "m/s^2", "5 m s^-2"), hint: "Use a = F / m." },
      { prompt: "A particle of mass 4.0 x 10^-3 kg experiences a force of 8.0 x 10^-3 N. Find its acceleration.", acceptedAnswers: answers("2", "m/s^2", "2 m s^-2"), hint: "Use a = F / m." },
      { prompt: "If the gap is halved at fixed voltage, the field strength becomes ... times the original.", acceptedAnswers: ["2", "twice", "double"], hint: "Use E = V / d." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Keep voltage drop, plate gap, and charge response tied together in one field story.";
  return [
    mc("Why is it helpful to call field strength between plates the potential gradient?", ["it reminds you the field is the potential drop per metre across the gap", "it means voltage and distance are unrelated", "it shows the plates are circular", "it proves charges move at constant speed"], 0, "The uniform field is a slope-of-potential story.", hint),
    mc("What is the strongest reason the field is approximately uniform only in the central region between large parallel plates?", ["edge effects disturb the pattern near the ends, while the middle stays nearly parallel", "charges only exist in the middle", "potential difference is zero at the edges", "fields cannot exist near boundaries"], 0, "Real plates are most uniform away from the edges.", hint),
    mc("Why does a smaller plate gap at fixed voltage give a stronger field?", ["the same potential drop occurs over a shorter distance", "the charge on the particle becomes larger", "field lines become equipotential lines", "voltage is cancelled by the smaller gap"], 0, "A steeper potential drop per metre means larger E.", hint),
    mc("Why can the force on a charge stay constant in a uniform field?", ["the field strength is constant, so a fixed charge experiences a constant qE", "the charge value changes to match the field", "potential difference is zero everywhere", "the particle stops moving"], 0, "Constant E gives constant F for fixed q.", hint),
    mc("A student says, 'Higher voltage always means a stronger field.' What missing condition should be added?", ["the plate separation must also be considered", "the charge sign must be positive", "the particle mass must be unchanged", "the field must be magnetic"], 0, "Field strength depends on both V and d.", hint),
    mc("Why is it weak to say 'positive charges move to lower voltage because they like negative plates'?", ["the better explanation is that the field gives a force toward lower potential for positive charge", "positive charges always move to the nearest plate only", "voltage is a type of mass", "charge sign does not affect motion"], 0, "Use field and potential-energy reasoning, not slogans.", hint),
    mc("How does a negative charge differ from a positive charge between the same plates?", ["the force direction reverses because q changes sign", "the field direction changes", "the plate polarity disappears", "the potential gradient becomes zero"], 0, "The field is unchanged; q changes the force direction.", hint),
    mc("Which statement best links equipotentials to parallel plates?", ["equipotentials are roughly parallel to the plates while field lines cross between them", "equipotentials run from positive plate straight to negative plate", "equipotentials are the same as field lines", "equipotentials show current through the plate"], 0, "In a uniform field, equal-potential surfaces follow the plates.", hint),
    mc("Why can a charged particle entering sideways between plates follow a curved path?", ["the electric force acts continuously across the gap, changing the velocity component in the field direction", "the field disappears once the particle enters", "potential difference acts as friction", "the particle becomes neutral at the midpoint"], 0, "The field adds acceleration in one fixed direction.", hint),
    mc("What is the strongest meaning of E = V/d in this lesson?", ["field strength is controlled by both the potential drop and how tightly that drop is packed into space", "field strength depends only on V", "field strength depends only on q", "field strength is the same as potential"], 0, "It is a packed-potential-drop relation.", hint),
    mc("A student says, 'If there is no motion along an equipotential, there is no field.' Why is that wrong?", ["field can still act perpendicular to the equipotential direction", "equipotential means zero charge everywhere", "fields exist only where work is done along the chosen route", "potential and force are identical"], 0, "Zero work along one route does not mean zero field.", hint),
    mc("Which comparison is strongest for two parallel-plate setups with the same voltage?", ["the smaller separation gives the larger field strength", "the larger separation gives the larger field strength", "both have equal field regardless of gap", "field strength depends only on plate area"], 0, "Use E = V/d.", hint),
    mc("Which comparison is strongest for two plate setups with the same gap?", ["the larger voltage gives the larger field strength", "the smaller voltage gives the larger field strength", "both have equal field regardless of voltage", "field strength depends only on charge mass"], 0, "Use E = V/d.", hint),
    mc("A 900 V potential difference acts across a 0.030 m gap. A charge of 2.0 x 10^-6 C is placed there. What is the force magnitude?", ["6.0 x 10^-2 N", "1.5 x 10^-5 N", "6.0 x 10^-5 N", "6.0 N"], 0, "First find E = 3.0 x 10^4 V/m, then use F = qE.", hint),
    mc("A force of 3.0 x 10^-3 N acts on a 1.0 x 10^-6 C charge between parallel plates. What is the field strength?", ["3.0 x 10^3 N/C", "3.0 x 10^-9 N/C", "3.0 x 10^-3 N/C", "3.0 x 10^6 N/C"], 0, "Use E = F / q.", hint),
    mc("What is the cleanest reason a uniform field gives constant acceleration but not necessarily constant speed?", ["acceleration stays constant in one direction while the velocity can still build up over time", "constant acceleration means speed must be zero", "speed and acceleration are the same quantity", "uniform field means the particle cannot move"], 0, "Constant acceleration changes velocity steadily.", hint),
    ...shortCases([
      { prompt: "Field strength between parallel plates is the potential difference divided by the plate ...", acceptedAnswers: ["separation", "distance", "gap"], hint: "Use E = V / d." },
      { prompt: "In the central region between large parallel plates, the field is approximately ...", acceptedAnswers: ["uniform"], hint: "Think same size and same direction." },
      { prompt: "For a fixed charge in a uniform field, constant field strength means constant ...", acceptedAnswers: ["force"], hint: "Use F = qE." },
      { prompt: "For a positive charge, moving with the field means moving toward the ... plate.", acceptedAnswers: ["negative", "negative plate"], hint: "Positive charge follows the field." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Track both charge size and separation before deciding how the force changes.";
  return [
    mc("What happens between two like charges?", ["they repel", "they attract", "they become neutral", "they produce no field"], 0, "Like charges repel.", hint),
    mc("What happens between two unlike charges?", ["they attract", "they repel", "they produce zero force", "they become identical"], 0, "Unlike charges attract.", hint),
    mc("Which law gives the force between point charges?", ["Coulomb's law", "Ohm's law", "Hooke's law", "Snell's law"], 0, "This is the charge-force relation.", hint),
    mc("How does electric force between point charges depend on separation?", ["inverse square", "direct square", "independent of separation", "inverse first power only"], 0, "Force falls with the square of distance.", hint),
    mc("If the separation doubles, what happens to the force magnitude?", ["it becomes one quarter", "it halves", "it doubles", "it becomes four times"], 0, "Use the inverse-square rule.", hint),
    mc("If one charge doubles and the other stays fixed, what happens to the force magnitude?", ["it doubles", "it halves", "it becomes one quarter", "it stays the same"], 0, "Force is proportional to each charge value.", hint),
    mc("If both charge magnitudes double, what happens to the force magnitude?", ["it becomes four times", "it doubles", "it halves", "it becomes eight times"], 0, "Doubling both makes the product four times larger.", hint),
    mc("In what direction does the Coulomb force act?", ["along the line joining the charges", "perpendicular to the line joining the charges", "always vertically upward", "always in a circle"], 0, "The electric force between point charges is radial.", hint),
    mc("Which constant appears in Coulomb's law in vacuum?", ["k", "g", "h", "mu"], 0, "Coulomb's law uses the electrostatic constant k.", hint),
    mc("Two charges 2.0 x 10^-6 C and 3.0 x 10^-6 C are 0.30 m apart. What is the force magnitude?", ["0.60 N", "0.060 N", "6.0 N", "0.0060 N"], 0, "Use F = kQq/r^2 with k = 9.0 x 10^9.", hint),
    mc("Two charges 4.0 x 10^-6 C and 2.0 x 10^-6 C are 0.20 m apart. What is the force magnitude?", ["1.8 N", "0.18 N", "18 N", "0.018 N"], 0, "Use F = kQq/r^2.", hint),
    mc("If charge signs change from unlike to like while magnitudes and distance stay the same, what changes?", ["the force direction changes from attraction to repulsion", "the force magnitude becomes zero", "the distance rule disappears", "the constant k changes"], 0, "The sign decides attraction or repulsion.", hint),
    ...shortCases([
      { prompt: "Coulomb force between point charges acts along the line ... the charges.", acceptedAnswers: ["joining", "between", "joining the centres of"], hint: "It is a radial force." },
      { prompt: "If separation becomes 3 times larger, Coulomb force becomes one over ... times the original.", acceptedAnswers: ["9"], hint: "Use the inverse-square pattern." },
      { prompt: "Two like charges ... each other.", acceptedAnswers: ["repel"], hint: "State the interaction." },
      { prompt: "Two unlike charges ... each other.", acceptedAnswers: ["attract"], hint: "State the interaction." },
      { prompt: "Two charges 1.0 x 10^-6 C and 2.0 x 10^-6 C are 0.30 m apart. Find the force magnitude.", acceptedAnswers: answers("0.20", "N", "0.2", "0.2 N"), hint: "Use F = kQq/r^2." },
      { prompt: "Two charges 3.0 x 10^-6 C and 5.0 x 10^-6 C are 0.30 m apart. Find the force magnitude.", acceptedAnswers: answers("1.5", "N", "1.5 N"), hint: "Use F = kQq/r^2." },
      { prompt: "Two charges 2.0 x 10^-6 C and 2.0 x 10^-6 C are 0.60 m apart. Find the force magnitude.", acceptedAnswers: answers("0.10", "N", "0.1", "0.1 N"), hint: "Use F = kQq/r^2." },
      { prompt: "If one charge is tripled while distance stays the same, the Coulomb force becomes ... times the original.", acceptedAnswers: ["3", "three"], hint: "Force is proportional to each charge." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Ask separately what the sign decides and what the magnitude factors decide.";
  return [
    mc("Why is it weak to say, 'Large charge means attraction'?", ["charge sign decides attraction or repulsion, while charge size affects force magnitude", "large charges are always negative", "attraction depends only on distance", "large charges cancel all fields"], 0, "Sign and size do different jobs in Coulomb's law.", hint),
    mc("What is the strongest interpretation of the inverse-square part of Coulomb's law?", ["spreading the interaction over greater distance weakens the force rapidly as separation grows", "doubling distance only halves force", "distance does not matter once charges are fixed", "it applies only to unlike charges"], 0, "Inverse square is the central distance rule.", hint),
    mc("Why does swapping the positions of the two charges not change the force magnitude?", ["the law depends on the product of the charge magnitudes and the same separation", "the sign of k changes", "the charges lose their fields", "the force stops being radial"], 0, "The interaction magnitude is symmetric between the pair.", hint),
    mc("What stays the same for the pair of forces the charges exert on each other?", ["magnitude", "direction", "sign of charge", "location"], 0, "The forces are equal in magnitude but opposite in direction.", hint),
    mc("Why do like charges repel?", ["the force directions on the two charges point away from each other along the line joining them", "their fields vanish", "their masses become different", "repulsion depends only on one charge"], 0, "Use the sign and radial-force language.", hint),
    mc("What is the cleanest reason unlike charges attract?", ["the force directions point toward each other along the line joining them", "their charge magnitudes become zero", "the inverse-square rule disappears", "k changes sign"], 0, "Attraction is the sign pattern of the radial force.", hint),
    mc("A student says, 'If the force gets smaller, one of the charges must have changed.' What correction is best?", ["the separation could also have increased, and distance changes can dominate because of the inverse-square rule", "distance never matters", "k varies from point to point in vacuum", "sign alone fixes magnitude"], 0, "Do not ignore separation.", hint),
    mc("Which comparison is strongest: quadrupling distance or doubling one charge?", ["quadrupling distance weakens force more strongly because it makes the force one sixteenth", "doubling one charge changes force more strongly", "both have no effect", "they always cancel exactly"], 0, "Compare a factor of 2 with an inverse-square factor of 16.", hint),
    mc("Why is Coulomb force called radial in the point-charge model?", ["it acts along the radius line joining the charges", "it acts in circles around the charges", "it is always perpendicular to the field", "it depends only on potential"], 0, "Radial means centre-to-centre line.", hint),
    mc("What is the best distinction between electric field and Coulomb force?", ["field belongs to the source configuration at a location, while Coulomb force is the force on a particular charge", "they are always the same quantity", "force exists without any field", "field depends only on the test charge"], 0, "This protects the field-versus-force distinction.", hint),
    mc("If both charges are halved while distance stays fixed, what happens to the force magnitude?", ["it becomes one quarter", "it halves", "it becomes one half squared plus one half", "it stays the same"], 0, "The product of charges becomes one quarter.", hint),
    mc("If the distance is halved while charge magnitudes stay fixed, what happens to the force magnitude?", ["it becomes four times", "it doubles", "it halves", "it becomes one quarter"], 0, "Inverse-square means smaller distance greatly increases force.", hint),
    mc("A pair of unlike charges attracts with force F. If both magnitudes double and the distance doubles, what is the new force magnitude?", ["F", "2F", "F/2", "4F"], 0, "Charge product x4 and distance-square x4 cancel.", hint),
    mc("Why is it useful to keep sign language and magnitude language separate in Coulomb's law?", ["sign answers attraction or repulsion, while magnitudes and distance set the size", "sign determines the constant k", "distance only matters for sign", "magnitude determines whether fields exist"], 0, "Two different reasoning jobs must not be collapsed together.", hint),
    mc("Which statement best fits IGCSE-style reasoning about point charges?", ["always compare charge product and separation together before claiming how force changes", "distance can be ignored once the signs are known", "charge sign fixes magnitude exactly", "force does not act along the joining line"], 0, "This is the robust comparison rule.", hint),
    mc("Two charges attract. Which change would reverse the direction of the force but keep the same magnitude?", ["change one charge sign only", "double both charges", "halve the distance", "double the distance"], 0, "Changing one sign flips attraction to repulsion without changing magnitudes or distance.", hint),
    ...shortCases([
      { prompt: "In Coulomb's law, charge sign decides attraction or ...", acceptedAnswers: ["repulsion"], hint: "Name the other interaction type." },
      { prompt: "Charge magnitudes and separation decide the force ...", acceptedAnswers: ["magnitude", "size"], hint: "Keep direction/sign separate from size." },
      { prompt: "If distance is halved, Coulomb force becomes ... times larger.", acceptedAnswers: ["4", "four"], hint: "Use inverse square." },
      { prompt: "For point charges, the electric force is a ... force acting along the joining line.", acceptedAnswers: ["radial"], hint: "Use the standard geometry word." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Keep the force perpendicular to both the field and the motion/current direction.";
  return [
    mc("What is the direction of magnetic force on a moving positive charge in a magnetic field?", ["perpendicular to both the field and the velocity", "parallel to the field always", "parallel to the velocity always", "toward the source charge always"], 0, "Magnetic force is a sideways effect.", hint),
    mc("What is the magnetic-force equation for a moving charge?", ["F = Bqv sin(theta)", "F = qE", "F = BIL", "F = kQq/r^2"], 0, "This is the charged-particle magnetic-force relation.", hint),
    mc("What is the magnetic-force equation for a current-carrying wire?", ["F = BIL sin(theta)", "F = qV", "F = qE", "F = V/d"], 0, "This is the current-wire magnetic-force relation.", hint),
    mc("When is the magnetic force on a moving charge zero?", ["when the motion is parallel to the field", "when the charge is positive", "when the speed is large", "when the field is uniform"], 0, "Use the sin(theta) factor.", hint),
    mc("When is the magnetic force largest for fixed B, q, and v?", ["when the motion is at 90 deg to the field", "when the motion is parallel to the field", "when the charge is zero only", "when the field is reversed"], 0, "sin(theta) is largest at 90 deg.", hint),
    mc("What happens to force direction if the field reverses but the velocity/current stays the same?", ["the force direction reverses", "the force direction stays the same", "the force becomes zero automatically", "the force becomes electric"], 0, "Reversing one direction flips the sideways force.", hint),
    mc("What happens to force direction if the current or moving charge direction reverses but the field stays fixed?", ["the force direction reverses", "the force direction stays the same", "the force magnitude becomes zero always", "the force becomes potential energy"], 0, "Reversing one vector reverses the cross-product direction.", hint),
    mc("If both the field and current directions reverse together for a wire, what happens to the force direction?", ["it stays the same", "it reverses", "it becomes zero", "it becomes random"], 0, "Reversing both vectors leaves the force direction unchanged.", hint),
    mc("A 0.20 T field acts on a charge of 3.0 x 10^-6 C moving at 4.0 x 10^5 m/s at 90 deg to the field. What is the force?", ["0.24 N", "2.4 x 10^-1 N", "2.4 x 10^-7 N", "24 N"], 0, "Use F = Bqv.", hint),
    mc("A wire 0.50 m long carries 4.0 A at 90 deg to a 0.30 T field. What force acts on it?", ["0.60 N", "6.0 N", "0.060 N", "0.15 N"], 0, "Use F = BIL.", hint),
    mc("What does a magnetic field mainly do to a moving charged particle when the force stays perpendicular to its motion?", ["it changes the direction of motion", "it must increase the speed", "it must decrease the mass", "it removes all kinetic energy"], 0, "A perpendicular force steers motion.", hint),
    mc("Why is a magnetic field not a forward-driving force in this lesson?", ["the force is sideways to the motion/current direction", "the field has no direction", "the field is always zero inside a conductor", "force and field are the same quantity"], 0, "This is a steering geometry, not a forward push.", hint),
    ...shortCases([
      { prompt: "Magnetic force is perpendicular to the field and to the particle's ...", acceptedAnswers: ["velocity", "motion"], hint: "Name the motion vector." },
      { prompt: "A particle moving parallel to a magnetic field experiences ... magnetic force.", acceptedAnswers: ["zero", "no", "no magnetic", "zero magnetic"], hint: "Use sin 0 = 0." },
      { prompt: "A 0.50 T field acts on a 2.0 x 10^-6 C charge moving at 3.0 x 10^5 m/s at 90 deg. Find the force.", acceptedAnswers: answers("0.30", "N", "0.3", "0.3 N"), hint: "Use F = Bqv." },
      { prompt: "A wire 0.40 m long carries 5.0 A at 90 deg to a 0.20 T field. Find the force.", acceptedAnswers: answers("0.40", "N", "0.4", "0.4 N"), hint: "Use F = BIL." },
      { prompt: "A wire 0.25 m long carries 2.0 A parallel to a 0.60 T field. Find the force.", acceptedAnswers: answers("0", "N", "0 N"), hint: "Use sin 0 = 0." },
      { prompt: "If the angle to the field is 90 degrees, the magnetic force is ...", acceptedAnswers: ["maximum", "largest"], hint: "Use the sin(theta) factor." },
      { prompt: "Reversing only the field or only the current reverses the force ...", acceptedAnswers: ["direction"], hint: "This is the sideways-force rule." },
      { prompt: "For a moving charge, magnetic force depends on B, q, v, and the ... to the field.", acceptedAnswers: ["angle", "angle of motion", "crossing angle"], hint: "Use the sin(theta) factor." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Ask whether the field changes the speed, the direction, or both.";
  return [
    mc("Why is it weak to say, 'A magnetic field speeds the particle up' in the perpendicular-force case?", ["the force is sideways, so it changes direction rather than directly increasing speed", "magnetic fields cannot exert force", "speed always falls to zero in a field", "the particle becomes neutral"], 0, "Sideways force changes direction of velocity.", hint),
    mc("What is the strongest reason the magnetic force can do no work on a charge moving at right angles to the field?", ["the force is perpendicular to the displacement at each instant", "the field has no energy", "the charge has no kinetic energy", "all magnetic forces are zero"], 0, "Perpendicular force does not transfer energy by work.", hint),
    mc("Why can a magnetic field bend a path without changing the speed magnitude in the ideal case?", ["it continuously changes the velocity direction while staying perpendicular to the motion", "it removes the particle mass", "it makes the field disappear", "it acts as a potential difference"], 0, "This is steering without forward energy transfer.", hint),
    mc("What common idea links the force on a moving charge and the force on a current-carrying wire?", ["both arise from motion of charge across a magnetic field", "both are electric-potential effects only", "both act parallel to the field", "both require point charges only"], 0, "Current in a wire is moving charge collectively.", hint),
    mc("Why is the force zero when motion or current is parallel to the field?", ["there is no crossing component through the field, so sin(theta)=0", "the field strength becomes zero", "charge sign vanishes", "voltage cancels the current"], 0, "The magnetic interaction depends on the perpendicular component.", hint),
    mc("Why does reversing charge sign also reverse the force direction on a moving particle?", ["the q factor changes sign in F = Bqv sin(theta)", "the field direction changes automatically", "speed becomes negative", "the particle loses mass"], 0, "Sign of q matters directly in the force direction.", hint),
    mc("What is the strongest distinction between electric and magnetic force in these lessons?", ["electric force can act along the field direction, while magnetic force is perpendicular to the field and motion", "magnetic force is always stronger", "electric force depends only on mass", "magnetic force needs no moving charge"], 0, "This protects the geometry contrast.", hint),
    mc("A student says, 'If the force is larger, the speed must be larger too.' Why is that incomplete in magnetism?", ["force magnitude also depends on field strength, charge/current, active length, and angle", "force and speed are always equal quantities", "magnetic force never depends on angle", "field strength can be ignored"], 0, "Do not collapse all variables into speed alone.", hint),
    mc("Why is it not enough to memorize 'use Fleming's left-hand rule' without the geometry?", ["you still need to know which vector is field, which is current or velocity, and that force is perpendicular to both", "the hand rule replaces all formulas", "the hand rule works only for electric fields", "geometry is irrelevant in magnetism"], 0, "The rule is a direction aid, not the full explanation.", hint),
    mc("How does increasing the angle from 30 deg to 90 deg affect magnetic force for fixed B, q, v or B, I, L?", ["it increases the force because sin(theta) becomes larger", "it decreases the force to zero", "it leaves the force unchanged", "it reverses the force automatically"], 0, "The sine factor controls the crossing strength.", hint),
    mc("Which statement best protects the lesson meaning of magnetic force?", ["it is a sideways steering force set by the geometry of field and motion", "it is a forward thrust from the field lines", "it works only when the particle is stationary", "it is the same thing as electric potential"], 0, "This is the core causal statement.", hint),
    mc("A wire is perpendicular to a field and feels force upward. What happens if both current and field reverse?", ["the force stays upward", "the force becomes downward", "the force becomes zero", "the force becomes electric"], 0, "Reversing both leaves the cross-product direction unchanged.", hint),
    mc("Why can a stronger magnetic field produce a larger sideways force but still not increase particle speed in the ideal perpendicular case?", ["a larger sideways force can curve the path more strongly without doing work", "stronger fields remove kinetic energy completely", "speed depends only on the field sign", "magnetic force always acts along displacement"], 0, "Bigger steering force need not mean bigger speed.", hint),
    mc("What should stay fixed if you want to test only the effect of angle on magnetic force?", ["B, charge/current, speed/length, and sign choices", "angle and B only", "charge sign only", "nothing needs to stay fixed"], 0, "Change one factor at a time.", hint),
    mc("Why is a current-carrying wire in a field a good bridge to electric motors?", ["the sideways force on opposite sides of a coil can combine into a turning effect", "wires ignore magnetic forces completely", "current in wires cannot be reversed", "motors work without magnetic fields"], 0, "The motor story grows from the wire-force story.", hint),
    mc("Which sentence is strongest for an IGCSE answer?", ["magnetic force is perpendicular to the field and to the motion/current, so it changes direction of motion rather than pushing along the field", "magnetism pulls everything forward", "the field lines are the exact route of the particle", "speed alone fixes magnetic force"], 0, "This sentence keeps the key geometry visible.", hint),
    ...shortCases([
      { prompt: "In the ideal perpendicular case, magnetic force changes the particle's ... of motion rather than its speed.", acceptedAnswers: ["direction"], hint: "Think steering." },
      { prompt: "Magnetic force does no work in the perpendicular case because force is ... to displacement.", acceptedAnswers: ["perpendicular"], hint: "Use the work idea carefully." },
      { prompt: "For a moving charge, reversing the charge sign reverses the force ...", acceptedAnswers: ["direction"], hint: "The sign of q matters." },
      { prompt: "A larger crossing angle gives a larger sin(theta) and therefore a larger force ...", acceptedAnswers: ["magnitude", "size"], hint: "Keep direction and size separate." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Link the sideways magnetic force either to circular motion or to a turning couple.";
  return [
    mc("A charged particle enters a uniform magnetic field at 90 deg to the field. What path can it follow?", ["a circular path", "a straight path with increasing speed", "a radial electric-field path", "a random zigzag"], 0, "A constant sideways force can provide centripetal force.", hint),
    mc("Which relation links magnetic force to centripetal force for circular motion?", ["qvB = mv^2 / r", "qE = mv / r", "BIL = mg", "V = IR"], 0, "This is the orbit condition in a uniform magnetic field.", hint),
    mc("What is the radius formula for a charged particle moving perpendicular to a magnetic field?", ["r = mv / qB", "r = qB / mv", "r = qv / mB", "r = mvB / q"], 0, "Rearrange qvB = mv^2 / r.", hint),
    mc("If particle speed increases while q, m, and B stay fixed, what happens to the orbit radius?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "Radius is proportional to v.", hint),
    mc("If magnetic field strength increases while q, m, and v stay fixed, what happens to orbit radius?", ["it decreases", "it increases", "it stays the same", "it becomes negative"], 0, "Radius is inversely proportional to B.", hint),
    mc("If particle mass increases while q, v, and B stay fixed, what happens to orbit radius?", ["it increases", "it decreases", "it stays the same", "it becomes zero"], 0, "Radius is proportional to m.", hint),
    mc("If charge magnitude increases while m, v, and B stay fixed, what happens to orbit radius?", ["it decreases", "it increases", "it stays the same", "it becomes independent of B"], 0, "Radius is inversely proportional to q.", hint),
    mc("What changes if the sign of the charge is reversed but the speed and field stay the same?", ["the sense of curvature reverses", "the orbit radius doubles", "the speed becomes zero", "the field direction disappears"], 0, "Charge sign changes the force direction.", hint),
    mc("Why does a current loop in a magnetic field turn?", ["opposite sides experience forces in opposite directions, creating a couple", "both sides feel no force", "the field acts only at the centre of the loop", "current stops flowing"], 0, "A pair of separated forces makes a turning effect.", hint),
    mc("What is the role of a split-ring commutator in a simple d.c. motor?", ["it reverses the current every half-turn so the turning effect continues in the same sense", "it removes the magnetic field each half-turn", "it stops the coil after one turn", "it increases the mass of the coil"], 0, "The commutator keeps the torque direction helpful.", hint),
    mc("A proton of mass 1.0 x 10^-6 kg and charge 2.0 x 10^-3 C moves at 4.0 x 10^3 m/s perpendicular to a 2.0 T field. What is the orbit radius?", ["1.0 m", "4.0 m", "0.25 m", "8.0 m"], 0, "Use r = mv / qB.", hint),
    mc("A particle of mass 3.0 x 10^-6 kg, charge 1.5 x 10^-3 C, and speed 2.0 x 10^3 m/s enters a 4.0 T field at 90 deg. What is the radius?", ["1.0 m", "0.10 m", "4.0 m", "2.0 m"], 0, "Use r = mv / qB.", hint),
    ...shortCases([
      { prompt: "For circular motion in a magnetic field, magnetic force provides the ... force.", acceptedAnswers: ["centripetal"], hint: "Name the inward force role." },
      { prompt: "If particle speed doubles while q, m, and B stay fixed, the orbit radius ...", acceptedAnswers: ["doubles", "gets larger", "increases"], hint: "Use r = mv / qB." },
      { prompt: "If B doubles while q, m, and v stay fixed, the orbit radius ...", acceptedAnswers: ["halves", "gets smaller", "decreases"], hint: "Use r = mv / qB." },
      { prompt: "A particle has m = 2.0 x 10^-6 kg, v = 3.0 x 10^3 m/s, q = 1.0 x 10^-3 C, and B = 3.0 T. Find the orbit radius.", acceptedAnswers: answers("2.0", "m", "2", "2 m"), hint: "Use r = mv / qB." },
      { prompt: "A particle has m = 4.0 x 10^-6 kg, v = 2.0 x 10^3 m/s, q = 2.0 x 10^-3 C, and B = 2.0 T. Find the orbit radius.", acceptedAnswers: answers("2.0", "m", "2", "2 m"), hint: "Use r = mv / qB." },
      { prompt: "A current loop turns because the magnetic forces form a turning ...", acceptedAnswers: ["couple", "torque"], hint: "Use the motor word from the lesson." },
      { prompt: "In a simple d.c. motor, the split-ring commutator reverses the ... every half-turn.", acceptedAnswers: ["current", "coil current"], hint: "This keeps the turning sense consistent." },
      { prompt: "Reversing the sign of the charge reverses the sense of path ...", acceptedAnswers: ["curvature", "bending", "turning"], hint: "The force direction flips." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Keep the common sideways-force idea visible while separating orbit and motor outcomes.";
  return [
    mc("What common idea links circular particle motion and motor turning?", ["both come from magnetic forces acting perpendicular to current or motion", "both come from electric potential difference only", "both require inverse-square attraction", "both happen only in electric fields"], 0, "One sideways-force geometry underlies both stories.", hint),
    mc("Why can a magnetic field keep a particle in a circle without changing its speed in the ideal case?", ["the force is always perpendicular to the velocity, so it changes direction but not speed", "the field removes the particle mass", "the particle stops accelerating", "the field does positive work each second"], 0, "Centripetal force changes direction of velocity.", hint),
    mc("Why does increasing magnetic field strength shrink the orbit radius for fixed m, q, and v?", ["a stronger sideways force can bend the path more tightly", "a stronger field always reduces speed", "the particle loses charge", "centripetal force becomes zero"], 0, "Smaller radius means tighter curvature.", hint),
    mc("What is the best reason a heavier particle has a larger orbit radius at the same speed, charge, and field?", ["more mass needs more inward force for the same curvature, so the path bends less tightly", "heavier particles feel no magnetic force", "mass changes the field direction", "heavy particles become neutral"], 0, "Mass resists the same sideways bend more strongly.", hint),
    mc("Why is it weak to say 'the magnetic field pulls the particle inward' without qualification?", ["the field provides a perpendicular force through qvB, not a generic inward pull independent of motion", "magnetic fields do not depend on motion at all", "all inward forces are electric", "inward force means the field must be radial"], 0, "The force comes from motion across the field.", hint),
    mc("A student says, 'If the particle curves, its speed must be changing.' What is the best correction?", ["curving alone shows direction change, not necessarily speed change", "speed and velocity are identical in every sense", "curvature means the mass has changed", "magnetic fields cannot curve motion"], 0, "Velocity can change because direction changes.", hint),
    mc("Why does a current loop experience a turning effect rather than a simple net translation in the motor model?", ["forces on opposite sides are equal and opposite but separated, so they form a couple", "the forces are all in the same direction", "the current becomes zero on one side", "the field acts only at the axle"], 0, "Separated opposite forces give rotation.", hint),
    mc("What is the strongest reason a split-ring commutator is needed in a simple d.c. motor?", ["without current reversal each half-turn, the torque would reverse and the coil would not keep turning the same way", "it increases the magnetic field strength to infinity", "it removes all resistance from the coil", "it makes the field perpendicular to itself"], 0, "The commutator keeps the turning effect aligned with the rotation.", hint),
    mc("How does reversing the field direction affect a particle orbit if q, m, and v stay the same?", ["the sense of curvature reverses", "the orbit radius doubles", "the speed becomes zero", "nothing changes"], 0, "Reversing B reverses the magnetic-force direction.", hint),
    mc("How does reversing both the velocity/current direction and the field direction affect the magnetic-force direction?", ["it stays the same", "it reverses", "it becomes zero", "it becomes electric"], 0, "Reversing both vectors preserves the sideways-force direction.", hint),
    mc("Why is the orbit formula r = mv / qB a stronger answer than saying 'bigger B means smaller circles'?", ["it shows exactly how mass, speed, charge, and field strength trade off together", "it removes the need for explanation", "it works only for electric fields", "it proves radius is independent of charge"], 0, "The formula captures the full dependence.", hint),
    mc("What is the cleanest reason magnetic force can power motor rotation without being the same as electric potential difference?", ["the field exerts sideways forces on moving charges in the conductor, while potential difference is what drives the current through the circuit", "magnetic fields replace the power supply", "motors work with no current", "potential difference is a type of magnetic field"], 0, "Keep current-driving and force-turning roles separate.", hint),
    mc("A particle with the same charge and field enters twice as fast. Why is the orbit radius twice as large?", ["the same field bends a faster particle less sharply because r is proportional to v", "the field becomes weaker automatically", "the charge halves itself", "the particle experiences no force"], 0, "The geometry is set by the formula r = mv / qB.", hint),
    mc("Why is a simple motor example a good extension of the force-on-wire lesson?", ["the turning couple comes from the same force-on-current idea applied on two sides of a loop", "motors do not involve current in magnetic fields", "motor action is an electric-field-only topic", "wire-force ideas stop being valid in loops"], 0, "The motor is a structured extension, not a new unrelated effect.", hint),
    mc("Which sentence is strongest for an advanced-school answer?", ["charged-particle orbits and motor turning both arise because magnetic forces act perpendicular to motion or current, producing curvature or a couple", "magnetic fields always make things speed up", "orbit radius depends only on charge sign", "commutators create the magnetic field"], 0, "This sentence keeps the shared mechanism explicit.", hint),
    mc("A proton and an alpha particle enter the same field with the same speed. Which extra information do you need to compare their orbit radii properly?", ["their mass and charge values together", "their colours only", "their electric potential only", "their distances from Earth"], 0, "r depends on m/q as well as v and B.", hint),
    ...shortCases([
      { prompt: "In a magnetic orbit, the inward force is supplied by the magnetic ...", acceptedAnswers: ["force"], hint: "State the source of centripetal force." },
      { prompt: "A magnetic field changes particle velocity by changing its ...", acceptedAnswers: ["direction"], hint: "In the ideal perpendicular case, not the speed." },
      { prompt: "A motor coil turns because separated magnetic forces form a turning ...", acceptedAnswers: ["couple", "torque"], hint: "Use the motor-effect language." },
      { prompt: "For fixed m, q, and B, orbit radius is directly proportional to particle ...", acceptedAnswers: ["speed", "velocity"], hint: "Use r = mv / qB." },
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

const A8_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A8_L1: l1DiagnosticRaw,
  A8_L2: l2DiagnosticRaw,
  A8_L3: l3DiagnosticRaw,
  A8_L4: l4DiagnosticRaw,
  A8_L5: l5DiagnosticRaw,
  A8_L6: l6DiagnosticRaw,
};

const A8_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A8_L1: l1ConceptRaw,
  A8_L2: l2ConceptRaw,
  A8_L3: l3ConceptRaw,
  A8_L4: l4ConceptRaw,
  A8_L5: l5ConceptRaw,
  A8_L6: l6ConceptRaw,
};

const A8_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  A8_L1: l1MasteryRaw,
  A8_L2: l2MasteryRaw,
  A8_L3: l3MasteryRaw,
  A8_L4: l4MasteryRaw,
  A8_L5: l5MasteryRaw,
  A8_L6: l6MasteryRaw,
};

export function a8GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A8_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function a8GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A8_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function a8GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A8_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
