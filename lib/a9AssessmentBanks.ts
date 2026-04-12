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
  hint = "Rebuild the lesson rule before choosing.",
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
    throw new Error(`A9 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Keep magnetic flux separate from the rate at which it changes.";
  return [
    mc("What is magnetic flux in the school model?", ["the magnetic field passing through an area", "the charge stored in a magnet", "the speed of a coil", "the resistance of the wire"], 0, "Magnetic flux is the field-thread through the chosen area.", hint),
    mc("What condition is needed for an induced emf to appear?", ["magnetic flux linkage must change", "flux must simply exist", "the loop must be hot", "the wire must be made of iron"], 0, "Induction needs changing flux linkage, not just flux being present.", hint),
    mc("Which relation gives the magnitude of the average induced emf?", ["induced emf = N delta(Phi) / delta(t)", "V = IR", "P = VI", "f = 1 / T"], 0, "Faraday's-law magnitude comes from change in flux linkage per time.", hint),
    mc("If magnetic field strength through the same coil doubles while area and angle stay fixed, what happens to the flux?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Phi is proportional to B when A and theta stay fixed.", hint),
    mc("If the loop area doubles while B and angle stay fixed, what happens to the flux?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Phi is proportional to area.", hint),
    mc("In Phi = BA cos(theta), what happens to the flux when theta changes from 0 deg to 90 deg while B and A stay fixed?", ["it falls to zero", "it doubles", "it stays the same", "it becomes negative automatically"], 0, "cos 90 deg is zero, so the flux is zero.", hint),
    mc("For a fixed B and A, when is magnetic flux maximum?", ["when theta = 0 deg", "when theta = 45 deg", "when theta = 90 deg", "when theta = 180 deg only"], 0, "Flux is largest when cos(theta) is largest.", hint),
    mc("A loop sits in a steady magnetic field without moving or changing shape. What induced emf is expected?", ["zero", "a steadily increasing emf", "a very large emf", "an emf equal to the flux"], 0, "No change in flux linkage means no induced emf.", hint),
    mc("If the same change in flux linkage happens in half the time, what happens to the average induced emf?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "A faster change means a larger rate of change.", hint),
    mc("If the number of turns is doubled while the same flux change happens in the same time, what happens to the induced emf?", ["it doubles", "it halves", "it stays the same", "it becomes one quarter"], 0, "Faraday's law is proportional to N.", hint),
    mc("A coil's flux changes from +0.20 Wb to -0.20 Wb. What is the size of the flux change?", ["0.40 Wb", "0.20 Wb", "0.00 Wb", "0.10 Wb"], 0, "The change in flux is the difference between final and initial values.", hint),
    mc("A 100-turn coil experiences a flux change of 0.020 Wb in 0.10 s. What average induced emf is produced?", ["20 V", "2.0 V", "0.20 V", "200 V"], 0, "Use induced emf = N delta(Phi) / delta(t).", hint),
    ...shortCases([
      { prompt: "Induction needs magnetic flux linkage to ...", acceptedAnswers: ["change", "be changing"], hint: "The key word is about flux not staying fixed." },
      { prompt: "Magnetic flux depends on field strength, area, and the ... between field and the loop normal.", acceptedAnswers: ["angle", "angle theta", "theta"], hint: "Use Phi = BA cos(theta)." },
      { prompt: "If magnetic flux stays constant, the induced emf is ...", acceptedAnswers: ["zero", "0"], hint: "No change means no induction." },
      { prompt: "For maximum flux in Phi = BA cos(theta), theta must be ...", acceptedAnswers: ["0", "0 deg", "zero", "zero degrees"], hint: "cos(theta) is largest there." },
      { prompt: "A loop has B = 0.40 T, A = 0.30 m^2, and theta = 0 deg. Find the flux.", acceptedAnswers: answers("0.12", "Wb", "0.12"), hint: "Use Phi = BA cos(theta)." },
      { prompt: "A 50-turn coil has a flux change of 0.040 Wb in 0.20 s. Find the average induced emf.", acceptedAnswers: answers("10", "V"), hint: "Use induced emf = N delta(Phi) / delta(t)." },
      { prompt: "If the same flux change happens in twice the time, the average induced emf ...", acceptedAnswers: ["halves", "is halved", "gets smaller"], hint: "The rate of change becomes smaller." },
      { prompt: "If the number of turns doubles while delta(Phi) and delta(t) stay fixed, the average induced emf ...", acceptedAnswers: ["doubles", "is doubled", "gets larger"], hint: "Faraday's law is proportional to N." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Ask what is changing in B, area, angle, or time.";
  return [
    mc("Why is it weak to say 'a magnet near a loop always induces a voltage'?", ["flux linkage must change; a nearby steady magnet can give fixed flux with no emf", "magnets never cause induction", "voltage appears only if the loop is broken", "only batteries can make voltage"], 0, "Induction is a change story, not a nearness story.", hint),
    mc("Why does moving a magnet faster toward the loop usually increase the induced emf?", ["the rate of change of flux linkage becomes larger", "the loop area becomes zero", "Faraday's law stops applying", "the number of turns falls"], 0, "A faster change raises delta(Phi) / delta(t).", hint),
    mc("Why can a rotating coil produce an emf even if the magnetic field strength stays constant?", ["rotation changes the angle and therefore the flux linkage", "rotation creates charge from nothing", "rotation removes the magnetic field", "rotation makes resistance irrelevant"], 0, "The angle term in Phi = BA cos(theta) can change the flux.", hint),
    mc("A loop remains in a field with large flux through it, but the flux is not changing. What is the best conclusion?", ["the induced emf is zero despite the non-zero flux", "the emf must equal the flux", "the emf is maximum because the flux is large", "the current must reverse"], 0, "Faraday's law depends on change, not just size.", hint),
    mc("Why does increasing the loop area help induction if the area is changing with time?", ["it changes the flux linkage because more or less field threads the loop", "it changes the resistance only", "it removes the need for a magnetic field", "it makes theta irrelevant"], 0, "Flux is field through area.", hint),
    mc("Why do more turns help a generator or pickup coil?", ["each turn shares the changing flux, so the total flux linkage change is larger", "more turns remove the magnetic field", "more turns force the emf to become direct current", "more turns make the area irrelevant"], 0, "N multiplies the flux change in Faraday's law.", hint),
    mc("A student says 'maximum flux means maximum induced emf.' Why is that incomplete?", ["emf depends on how quickly flux changes, not just on the flux size at one instant", "maximum flux makes time stop", "emf is unrelated to flux", "emf depends only on resistance"], 0, "Large flux can exist at a moment when the rate of change is zero.", hint),
    mc("What is the strongest way to compare slow and fast collapse of the same magnetic field through a coil?", ["the faster collapse gives the larger induced emf because the same flux change happens in less time", "both must give the same emf because the total flux change matches", "the slower collapse gives larger emf because it lasts longer", "neither gives emf once the field starts to change"], 0, "The rate of change is the deciding quantity.", hint),
    mc("Why does reversing a field direction through a coil give a large induction effect?", ["the flux changes sign, so the total change in flux can be large", "reversal makes area disappear", "reversal removes the number of turns", "reversal means there is no magnetic field"], 0, "A sign reversal can make delta(Phi) larger than a simple reduction to zero.", hint),
    mc("What is the best conclusion about a stationary loop in a changing field?", ["it can still show induction because changing B can change the flux linkage", "motion is the only route to induction", "a stationary loop cannot have flux", "the loop must rotate to feel magnetism"], 0, "Changing field strength is enough to drive induction.", hint),
    mc("Which statement best protects the role of time in Faraday's law?", ["the same flux change spread over a longer time gives a smaller average emf", "time matters only in a.c. circuits", "time matters only if the field becomes zero", "time can be ignored if the loop has many turns"], 0, "Induced emf is a rate quantity.", hint),
    mc("Which sentence best matches rigorous induction language?", ["Faraday induction appears when flux linkage changes, and the faster the change the larger the induced emf", "induction appears whenever a magnet is visible", "induction depends only on how many turns a coil has", "induction is just another word for magnetic field"], 0, "This keeps both cause and scaling visible.", hint),
    mc("Why is 'changing flux linkage' stronger wording than 'moving the magnet'?", ["it captures every valid cause: changing field, area, angle, or relative motion", "it applies only to one special apparatus", "it removes the role of coils", "it means the field must reverse"], 0, "Flux linkage is the general mechanism.", hint),
    mc("If a coil is turned from theta = 0 deg to theta = 90 deg, why does an emf appear during the turn?", ["the changing orientation changes cos(theta) and therefore the flux", "theta only changes resistance", "turning removes the number of turns", "the field direction vanishes"], 0, "Angle change is enough to change flux linkage.", hint),
    mc("What is the best interpretation of induced emf in this lesson?", ["it is the electrical response to changing flux linkage", "it is a stored magnetic charge", "it is the force holding a magnet in place", "it is the same thing as magnetic flux"], 0, "Induced emf is the response, not the flux itself.", hint),
    mc("Why can zero flux still be consistent with non-zero induced emf during a turn?", ["because the emf depends on the rate of change, not only on the flux value at one instant", "because zero flux means infinite current", "because Faraday's law fails at zero flux", "because the number of turns must be zero"], 0, "A quantity can pass through zero while changing rapidly.", hint),
    ...shortCases([
      { prompt: "Faraday induction is a ... in flux linkage, not just a presence-of-field story.", acceptedAnswers: ["change", "changing-flux story", "change story"], hint: "Use the mechanism word." },
      { prompt: "A steady magnet beside a steady coil gives ... induced emf.", acceptedAnswers: ["zero", "0"], hint: "No flux change means no induction." },
      { prompt: "If the same delta(Phi) happens faster, the induced emf gets ...", acceptedAnswers: ["larger", "bigger", "greater"], hint: "The rate of change increases." },
      { prompt: "Turning a coil can induce emf because it changes the ... in Phi = BA cos(theta).", acceptedAnswers: ["angle", "theta"], hint: "Focus on the geometry term." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Lenz's law sets the induced response against the change, not against the whole situation.";
  return [
    mc("What does Lenz's law state?", ["the induced effect opposes the change that causes it", "the induced effect always helps the change", "the induced effect removes all magnetic fields", "the induced effect depends only on resistance"], 0, "Lenz's law is the opposition rule.", hint),
    mc("If magnetic flux into the page is increasing through a loop, what induced magnetic field direction is required?", ["out of the page", "into the page", "upward", "there is no induced field"], 0, "The loop opposes the increase by creating the opposite field direction.", hint),
    mc("If magnetic flux into the page is decreasing, what induced magnetic field direction is required?", ["into the page", "out of the page", "left", "zero"], 0, "The loop tries to keep the original flux from dropping.", hint),
    mc("If magnetic flux out of the page is increasing, what induced magnetic field direction is required?", ["into the page", "out of the page", "clockwise only", "there is no response"], 0, "The induced field opposes the increase.", hint),
    mc("If magnetic flux out of the page is decreasing, what induced magnetic field direction is required?", ["out of the page", "into the page", "left", "zero"], 0, "The loop tries to maintain the original outward flux.", hint),
    mc("Viewed from the front of the page, which current direction produces a field out of the page?", ["anticlockwise", "clockwise", "no current can do that", "left to right"], 0, "Use the right-hand grip rule for a current loop.", hint),
    mc("Viewed from the front of the page, which current direction produces a field into the page?", ["clockwise", "anticlockwise", "both", "neither"], 0, "Clockwise loop current gives an into-page field.", hint),
    mc("What does the minus sign in induced emf = -N delta(Phi) / delta(t) remind you of?", ["the induced response opposes the change in flux linkage", "the emf must always be negative", "the loop loses all energy", "the flux must be into the page"], 0, "The sign is a direction rule, not a fixed negative number.", hint),
    mc("A magnet approaches a coil and increases the flux through it. What does the induced current do in general?", ["it produces a field that opposes the increase", "it increases the flux further", "it removes the coil area", "it makes Faraday's law stop working"], 0, "Opposition to change is the core rule.", hint),
    mc("A magnet moves away from a coil so the original flux falls. What does the induced current do in general?", ["it produces a field that tries to keep the flux from falling", "it helps the flux fall faster", "it switches off instantly because the magnet is moving away", "it makes the loop non-conducting"], 0, "The response acts against the decrease.", hint),
    mc("Why can a conductor moving through a magnetic field experience magnetic braking?", ["the induced current creates a magnetic effect that opposes the motion causing it", "Lenz's law makes the conductor lose all mass", "the conductor becomes an insulator", "the field always pulls along the motion"], 0, "Opposition to motion is a common Lenz-law consequence.", hint),
    mc("If the rate of flux change becomes larger, what happens to the magnitude of the induced emf?", ["it becomes larger", "it becomes smaller", "it must stay the same", "it becomes zero"], 0, "Lenz's law sets direction; Faraday's law sets size.", hint),
    ...shortCases([
      { prompt: "Lenz's law says the induced effect opposes the ... that causes it.", acceptedAnswers: ["change", "change in flux", "change in flux linkage"], hint: "Oppose the change, not the entire field forever." },
      { prompt: "If flux into the page is increasing, the induced field is ... the page.", acceptedAnswers: ["out of", "out of the page", "out"], hint: "Oppose the increase." },
      { prompt: "If flux into the page is decreasing, the induced field is ... the page.", acceptedAnswers: ["into", "into the page"], hint: "Try to maintain the original direction." },
      { prompt: "An induced field out of the page requires an ... current when viewed from the front.", acceptedAnswers: ["anticlockwise", "counterclockwise"], hint: "Use the loop right-hand rule." },
      { prompt: "An induced field into the page requires a ... current when viewed from the front.", acceptedAnswers: ["clockwise"], hint: "Use the loop right-hand rule." },
      { prompt: "The minus sign in Faraday-Lenz law marks ... to the original change.", acceptedAnswers: ["opposition", "opposite response", "opposes the change"], hint: "This is the Lenz-law meaning." },
      { prompt: "If the original flux change reverses direction, the induced direction also ...", acceptedAnswers: ["reverses", "changes direction"], hint: "Opposition tracks the change." },
      { prompt: "A moving conductor can feel magnetic ... because the induced current opposes the motion.", acceptedAnswers: ["drag", "braking", "magnetic braking"], hint: "Use the Lenz-law application word." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "State the original change first, then describe how the induced effect pushes back.";
  return [
    mc("Why is it weak to say 'the induced current opposes the magnetic field'?", ["Lenz's law is about opposing the change in flux, not permanently cancelling the whole field", "induced current never makes a field", "all magnetic fields are identical", "the loop does not respond to flux"], 0, "The law tracks the change that caused the induction.", hint),
    mc("Why does Lenz's law protect energy conservation?", ["because the induced response resists the change, so work must be done to keep the change happening", "because it makes all emf values negative", "because it removes magnetic fields automatically", "because it stops current flowing in every loop"], 0, "If the response helped the change, energy would appear for free.", hint),
    mc("If a magnet is held still near a coil after the initial movement stops, what is the best conclusion?", ["the induced current falls to zero because the flux is no longer changing", "the induced current stays constant forever", "the induced current grows larger because flux exists", "the coil becomes a battery"], 0, "A static situation with fixed flux gives no sustained induction.", hint),
    mc("Why is 'oppose the change' stronger than 'oppose the cause'?", ["it works directly for increase-versus-decrease in flux and predicts the induced direction cleanly", "it ignores energy conservation", "it means the loop always pushes against motion even when flux is fixed", "it applies only to magnets, not coils"], 0, "The change in flux is the immediate trigger inside the law.", hint),
    mc("A student says, 'If the flux is into the page, the induced field must be out of the page.' Why is that incomplete?", ["the induced field depends on whether the original into-page flux is increasing or decreasing", "induced fields cannot point out of the page", "flux direction never matters", "induced current is unrelated to flux"], 0, "Direction comes from change sense, not from the original field alone.", hint),
    mc("What is the best explanation for electromagnetic braking in a metal moving through a field?", ["induced currents create magnetic effects that oppose the motion producing the flux change", "the metal loses all charge carriers", "the field becomes an electric field", "the conductor stops because its mass becomes larger"], 0, "Braking is a direct Lenz-law consequence.", hint),
    mc("Why can the magnitude and direction parts of induction be separated conceptually?", ["Faraday's law gives the size from the rate of change, while Lenz's law gives the sign or direction", "direction has no physics content", "magnitude matters only in transformers", "Faraday's law and Lenz's law contradict each other"], 0, "The two rules complement each other.", hint),
    mc("If the flux is zero at one instant but is increasing from zero, what does Lenz's law predict?", ["an induced response still appears because the change is non-zero", "there can be no induction because the flux itself is zero at that instant", "the emf must be negative only", "the loop stops being conductive"], 0, "The law responds to change, even through zero.", hint),
    mc("Why does a faster approach of the same magnet produce a stronger opposing response?", ["the flux changes more quickly, so the induced emf and current can be larger", "faster motion removes the minus sign", "faster motion makes flux irrelevant", "the coil gains extra turns"], 0, "Rate of change sets the size of the response.", hint),
    mc("Which statement best matches a rigorous school answer?", ["the induced response is always directed so that its magnetic effect opposes the original change in flux linkage", "the induced response always destroys the field", "the induced current always points clockwise", "the induced field always matches the original field"], 0, "This is the clean Lenz-law sentence.", hint),
    mc("Why is it weak to answer a Lenz-law question with only 'clockwise' or 'anticlockwise'?", ["the direction should be justified by naming the original flux change being opposed", "clockwise is never allowed", "the direction words are too advanced for physics", "current direction and field direction are unrelated"], 0, "The mechanism explanation is part of the rigor.", hint),
    mc("A coil experiences decreasing into-page flux. Why is an into-page induced field the correct response?", ["because it tries to keep the original into-page flux from decreasing", "because the loop always produces into-page fields", "because clockwise currents do not exist", "because the flux must reverse sign instantly"], 0, "Oppose the decrease by supporting the original direction.", hint),
    mc("A coil experiences increasing outward flux. Why is an inward induced field the correct response?", ["because it pushes back against the outward increase", "because inward fields always have larger magnitude", "because flux cannot point outward in a loop", "because the loop must cancel all current"], 0, "Opposition to increase sets the direction.", hint),
    mc("What is the strongest way to handle a Lenz-law direction question?", ["identify the original flux change, decide the opposing induced field, then convert that field to current direction", "guess clockwise first and check later", "find the emf magnitude and ignore direction", "use resistance to decide clockwise or anticlockwise"], 0, "This sequence is the most reliable method.", hint),
    mc("Why does Lenz's law matter in practical devices rather than only in symbolic equations?", ["it predicts real opposition effects such as braking, drag, and required input work", "it matters only in textbook derivations", "it applies only when current is zero", "it removes the need for power sources"], 0, "The law has real mechanical and thermal consequences.", hint),
    mc("If the original change becomes smaller but stays in the same direction, what happens to the induced response magnitude?", ["it becomes smaller while keeping the opposition direction", "it becomes larger and reverses", "it stays identical", "it becomes unrelated to the change"], 0, "Lenz's law keeps the direction while Faraday scaling sets the size.", hint),
    ...shortCases([
      { prompt: "Lenz's law opposes the change in magnetic flux ..., not the existence of flux itself.", acceptedAnswers: ["linkage", "flux linkage"], hint: "Use the full quantity name." },
      { prompt: "The strongest route for a direction question is: identify the change, choose the induced field, then choose the current ...", acceptedAnswers: ["direction"], hint: "That is the final step." },
      { prompt: "If the magnet stops moving and the flux stops changing, the induced current becomes ...", acceptedAnswers: ["zero", "0"], hint: "No change means no sustained induction." },
      { prompt: "Electromagnetic braking works because the induced response opposes the ... that causes it.", acceptedAnswers: ["motion", "change", "motion causing the flux change"], hint: "Lenz's-law applications resist what drives the change." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Keep repeated flux change, alternating sign, and rotation frequency tied together.";
  return [
    mc("What energy change takes place in a generator?", ["mechanical energy is converted into electrical energy", "electrical energy is converted into chemical energy", "heat is converted directly into nuclear energy", "magnetic energy is destroyed"], 0, "A generator uses motion to induce electrical output.", hint),
    mc("Why does a rotating coil in a magnetic field produce an emf?", ["its flux linkage changes continuously as it turns", "its resistance falls to zero", "its turns disappear", "its current stays constant"], 0, "Rotation changes the coil orientation and therefore the flux linkage.", hint),
    mc("Why is the output of a simple generator alternating?", ["the sign of the induced emf reverses every half-turn", "the current is used up each half-turn", "the magnetic field disappears every half-turn", "the coil area changes to zero every half-turn"], 0, "The orientation reversal flips the emf direction.", hint),
    mc("What do slip rings do in an a.c. generator?", ["they maintain contact with the rotating coil while allowing the output to alternate naturally", "they reverse the current every half-turn", "they stop the coil from rotating", "they increase the number of turns"], 0, "Slip rings keep contact without rectifying the output.", hint),
    mc("For a simple two-pole generator, one full turn of the coil gives...", ["one full a.c. cycle", "half a cycle", "two full cycles", "no emf"], 0, "A full rotation returns the emf pattern to the start.", hint),
    mc("A generator coil rotates at 3000 revolutions per minute. What is the output frequency?", ["50 Hz", "3000 Hz", "60 Hz", "25 Hz"], 0, "3000 rpm is 50 revolutions per second.", hint),
    mc("If the output frequency is 25 Hz, what is the period?", ["0.040 s", "25 s", "0.25 s", "0.004 s"], 0, "Use T = 1 / f.", hint),
    mc("If the rotation speed doubles while the field and coil stay unchanged, what happens to the frequency?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "More turns per second means more cycles per second.", hint),
    mc("If the rotation speed doubles while the flux swing per half-turn stays the same, what happens to the average induced emf over the same fraction of a turn?", ["it increases", "it decreases", "it stays the same", "it becomes negative only"], 0, "The same change in flux happens in less time.", hint),
    mc("Which relation still gives generator average emf over a chosen time interval?", ["induced emf = N delta(Phi) / delta(t)", "P = VI", "V = IR", "Q = It"], 0, "Generator emf is still a Faraday-law result.", hint),
    mc("A 200-turn coil has a flux change of 0.015 Wb in 0.030 s during part of its motion. What is the average induced emf magnitude?", ["100 V", "10 V", "1.0 V", "0.10 V"], 0, "Use induced emf = N delta(Phi) / delta(t).", hint),
    mc("If the magnetic field strength is increased while speed, area, and turns stay fixed, what happens to the emf amplitude?", ["it increases", "it decreases", "it stays the same", "it becomes direct current"], 0, "Stronger B gives a larger flux swing.", hint),
    ...shortCases([
      { prompt: "A generator coil produces emf because its magnetic flux ... keeps changing.", acceptedAnswers: ["linkage", "flux linkage"], hint: "Use the full induction term." },
      { prompt: "The output of a simple generator is alternating because the emf ... every half-turn.", acceptedAnswers: ["reverses", "changes direction", "changes sign"], hint: "The coil orientation flips." },
      { prompt: "Generator frequency is the number of ... each second.", acceptedAnswers: ["cycles", "cycles per second"], hint: "That is what hertz counts." },
      { prompt: "A generator runs at 600 rpm. Find the output frequency for a simple two-pole machine.", acceptedAnswers: answers("10", "Hz"), hint: "Convert revolutions per minute to per second." },
      { prompt: "If f = 40 Hz, find the period.", acceptedAnswers: answers("0.025", "s", "0.025 s"), hint: "Use T = 1 / f." },
      { prompt: "If the spin rate doubles, the generator frequency ...", acceptedAnswers: ["doubles", "is doubled"], hint: "Cycles per second rise with turns per second." },
      { prompt: "If the number of turns is increased, the induced emf ...", acceptedAnswers: ["increases", "gets larger", "becomes larger"], hint: "Faraday's law is proportional to N." },
      { prompt: "A stationary coil in a steady field gives ... sustained output.", acceptedAnswers: ["no", "zero", "no sustained emf", "zero emf"], hint: "No changing flux linkage means no generator output." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Track one full turn of the coil and explain what flips every half-turn.";
  return [
    mc("Why is 'rotation creates electricity' weaker than the generator lesson explanation?", ["the key mechanism is changing flux linkage during rotation", "rotation works even without a magnetic field", "electricity appears because resistance vanishes", "rotation means current is constant"], 0, "The flux-change mechanism is the real cause.", hint),
    mc("Why does the emf reverse sign every half-turn?", ["the coil orientation relative to the field reverses, so the induced direction reverses", "the slip rings reverse the current", "the field strength becomes zero permanently", "the number of turns halves"], 0, "Alternation comes from orientation, not from charge being used up.", hint),
    mc("Why would replacing slip rings with a split-ring commutator change the kind of output?", ["the commutator would reverse the connection every half-turn and make the external output one-way", "it would make the emf impossible to induce", "it would stop the coil rotating", "it would keep the frequency at zero"], 0, "This is the difference between a.c. and d.c. output hardware.", hint),
    mc("Why does spinning the same generator faster increase the output frequency?", ["the flux-linkage pattern repeats more times each second", "the field becomes stronger only because of speed", "the coil gains more turns automatically", "the output stops alternating"], 0, "Frequency counts repeated cycles per second.", hint),
    mc("Why can faster rotation also increase emf magnitude?", ["the same flux changes happen in less time, increasing the rate of change", "faster motion removes the minus sign", "faster motion makes turns irrelevant", "speed affects frequency only and never emf size"], 0, "Faraday rate reasoning still applies.", hint),
    mc("A student says 'a generator works because the wire cuts field lines.' What stronger statement should replace it?", ["the rotating coil changes its flux linkage, and that changing linkage induces the emf", "field lines are real strings that are chopped by the wire", "the wire stores current until it is full", "field cutting matters only because of resistance"], 0, "Flux-linkage language is more rigorous than line-cutting slogans.", hint),
    mc("Why is a steady magnetic field still enough for generator action?", ["the coil motion changes the flux linkage even when B itself is constant", "a steady field cannot be used in induction", "the field must reverse by itself", "a steady field forces direct current only"], 0, "The change can come from motion through a steady field.", hint),
    mc("What is the strongest reason generator output is periodic?", ["the coil returns to the same orientation after each full turn", "the cell in the circuit repeats its charge", "the magnetic poles swap places physically each turn", "resistance repeats only in circles"], 0, "Periodic orientation gives periodic flux linkage and emf.", hint),
    mc("Why is one full turn used as a natural reference when explaining generator output?", ["it covers the full sequence of flux change and the return to the starting orientation", "it is the only time any emf exists", "half-turns cannot be analyzed", "frequency is measured in turns per minute only"], 0, "A full rotation completes one whole pattern.", hint),
    mc("If the field strength is reduced while the spin rate stays the same, what happens first to the induction story?", ["the flux swing becomes smaller, so the emf amplitude becomes smaller", "the frequency must fall because the field is weaker", "the output becomes direct current", "the coil stops rotating"], 0, "Amplitude follows the size of the flux change.", hint),
    mc("Why does adding more turns strengthen generator output without changing the cycle rate?", ["N increases the total flux-linkage change, while frequency still depends on how often the geometry repeats", "more turns reduce the spin rate automatically", "more turns remove the magnetic field", "more turns make the output non-periodic"], 0, "Amplitude and frequency are controlled by different parts of the story.", hint),
    mc("Why is 'the current alternates because the battery flips' nonsense for a generator?", ["a generator output is induced by rotating flux linkage and needs no battery to set the alternation", "generators always contain hidden batteries", "alternation comes from wire resistance", "a.c. means stored charge is reversing in the cell"], 0, "The device is an induction machine, not a battery circuit.", hint),
    mc("What is the cleanest bridge between Faraday's law and a.c. frequency?", ["Faraday's law gives the emf size from changing flux, while the repeated turning sets how often that change pattern repeats", "frequency replaces flux in all generator equations", "a.c. frequency is determined by resistance", "Faraday's law works only for direct current"], 0, "Size and repetition rate are linked but distinct.", hint),
    mc("Why does a generator need continuous motion for continuous a.c. output?", ["without ongoing motion, the flux linkage stops changing and the induced emf dies away", "once started, emf continues forever with no motion", "the field creates extra energy by itself", "continuous output comes from stored current in the coil"], 0, "Sustained induction needs sustained change.", hint),
    mc("Which sentence best fits advanced IGCSE wording?", ["A generator produces alternating emf because coil rotation causes repeated changes in flux linkage whose sign reverses every half-turn", "A generator makes current because magnets are strong", "A generator works only when the field changes sign by itself", "A generator is a transformer that spins"], 0, "This sentence keeps both periodicity and sign reversal visible.", hint),
    mc("What extra fact must be kept when comparing two generators with the same frequency but different emf amplitudes?", ["their turns, field strengths, areas, or flux swings may differ", "frequency alone fixes amplitude", "only the battery voltage matters", "generator amplitude is random"], 0, "Amplitude depends on the size of the flux change as well as timing.", hint),
    ...shortCases([
      { prompt: "Generator a.c. comes from repeated ... in flux linkage.", acceptedAnswers: ["changes", "change", "changes of sign and size"], hint: "The induction mechanism repeats." },
      { prompt: "Slip rings keep contact with the spinning coil without ... the external output.", acceptedAnswers: ["reversing", "reversing it", "rectifying"], hint: "That is why the output stays alternating." },
      { prompt: "Faster rotation raises frequency because the emf pattern repeats more times each ...", acceptedAnswers: ["second"], hint: "That is what hertz measures." },
      { prompt: "Increasing spin rate can raise emf size because the same flux change happens in less ...", acceptedAnswers: ["time"], hint: "Use the rate idea." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep changing primary flux, turns ratio, and ideal power together.";
  return [
    mc("Why does a transformer need alternating current in the primary coil?", ["only changing current gives changing magnetic flux in the core", "a.c. lowers resistance to zero", "d.c. gives a larger turns ratio", "a.c. removes the need for a core"], 0, "Transformer action is an induction story based on changing flux.", hint),
    mc("What does the primary coil do?", ["it receives the input alternating current and sets up changing core flux", "it always gives the output voltage to the load", "it stores direct current in the core", "it measures the secondary current"], 0, "Primary is the input side.", hint),
    mc("What does the secondary coil do?", ["it receives induced emf from the changing core flux", "it creates the magnetic field without the primary", "it makes the transformer work on d.c.", "it determines the frequency by itself"], 0, "Secondary is the induced output side.", hint),
    mc("Which relation is correct for an ideal transformer?", ["V_p / V_s = N_p / N_s", "V_p V_s = N_p + N_s", "I_p / I_s = N_p / N_s", "P = I^2 R only"], 0, "Voltage ratio matches turns ratio in the ideal model.", hint),
    mc("If the secondary has more turns than the primary, what kind of transformer is it?", ["step-up", "step-down", "rectifier", "motor"], 0, "More secondary turns gives a larger secondary voltage.", hint),
    mc("If the secondary has fewer turns than the primary, what kind of transformer is it?", ["step-down", "step-up", "generator", "ammeter"], 0, "Fewer secondary turns gives a smaller secondary voltage.", hint),
    mc("A transformer has 400 turns on the primary and 100 turns on the secondary. The primary voltage is 240 V. What is the secondary voltage?", ["60 V", "960 V", "240 V", "24 V"], 0, "Use V_p / V_s = N_p / N_s.", hint),
    mc("A transformer has 200 turns on the primary and 1000 turns on the secondary. The primary voltage is 12 V. What is the secondary voltage?", ["60 V", "2.4 V", "240 V", "1200 V"], 0, "Use the turns ratio.", hint),
    mc("Which relation expresses ideal power transfer in a transformer?", ["V_p I_p = V_s I_s", "V_p / I_p = V_s / I_s", "V_p + I_p = V_s + I_s", "N_p I_p = N_s V_s"], 0, "In the ideal model, input power equals output power.", hint),
    mc("If an ideal transformer steps voltage up, what happens to current for the same power?", ["it steps down", "it also steps up", "it stays the same", "it becomes zero"], 0, "Higher voltage with the same power means lower current.", hint),
    mc("What is the main role of the iron core in a transformer?", ["to link the two coils with the same changing magnetic flux", "to supply direct current", "to store electrical charge", "to increase frequency"], 0, "The core carries the changing flux efficiently between coils.", hint),
    mc("Why would steady direct current in the primary fail to give steady transformer output?", ["after the initial switch-on there is no continuing flux change to induce emf in the secondary", "d.c. makes turns ratio impossible", "d.c. removes the secondary coil", "d.c. makes the core non-magnetic"], 0, "No changing flux means no sustained induction.", hint),
    ...shortCases([
      { prompt: "A transformer works because changing current in the primary creates changing magnetic ... in the core.", acceptedAnswers: ["flux", "magnetic flux"], hint: "That is what links the coils." },
      { prompt: "If Ns is greater than Np, the transformer is ...", acceptedAnswers: ["step-up", "a step-up transformer"], hint: "More secondary turns means higher secondary voltage." },
      { prompt: "If Ns is less than Np, the transformer is ...", acceptedAnswers: ["step-down", "a step-down transformer"], hint: "Fewer secondary turns means lower secondary voltage." },
      { prompt: "A transformer has Np = 500, Ns = 100, and Vp = 250 V. Find Vs.", acceptedAnswers: answers("50", "V"), hint: "Use the voltage-turns ratio." },
      { prompt: "A transformer has Np = 100, Ns = 400, and Vp = 12 V. Find Vs.", acceptedAnswers: answers("48", "V"), hint: "Use the voltage-turns ratio." },
      { prompt: "An ideal transformer has Vp = 240 V, Ip = 0.50 A, and Vs = 24 V. Find Is.", acceptedAnswers: answers("5.0", "A", "5 A"), hint: "Use Vp Ip = Vs Is." },
      { prompt: "When voltage is stepped up ideally, current is stepped ...", acceptedAnswers: ["down"], hint: "Power stays the same in the ideal model." },
      { prompt: "A transformer needs ... current in the primary for sustained action.", acceptedAnswers: ["alternating", "a.c.", "ac"], hint: "The primary flux must keep changing." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Describe the transformer as a changing-flux bridge rather than as wires touching each other.";
  return [
    mc("Why is it weak to say 'the primary current just moves into the secondary coil'?", ["the secondary emf is induced by shared changing flux rather than by current crossing directly between coils", "the coils must touch electrically", "current cannot exist in coils", "the secondary always contains the same electrons as the primary"], 0, "The coils are linked magnetically, not by a direct conducting path.", hint),
    mc("Why does a transformer with equal turns on both coils give about equal voltages in the ideal model?", ["the turns ratio is 1:1, so the induced voltage ratio is 1:1", "equal turns cancel the magnetic field", "equal turns make current zero", "equal turns force direct current"], 0, "Voltage ratio follows turns ratio.", hint),
    mc("Why does step-up transformation not create power for free?", ["the increased voltage is balanced by a reduced current in the ideal model", "the core supplies the missing power", "the secondary battery provides the extra energy", "turns ratio changes conservation laws"], 0, "Ideal transformers trade voltage against current.", hint),
    mc("Why is alternating current essential to the core story?", ["it keeps the magnetic flux changing so the secondary keeps seeing induction", "it makes the core permanently magnetized one way", "it removes the need for turns", "it turns power into charge"], 0, "No changing current means no sustained changing flux.", hint),
    mc("A student says 'more secondary turns means more current and more voltage.' What is the best correction?", ["more secondary turns raise secondary voltage, but for the same power the secondary current falls", "turns do not affect voltage at all", "current and voltage always rise together in all circuits", "current ratio equals turns ratio in the same direction"], 0, "Do not collapse voltage gain into current gain.", hint),
    mc("Why is the iron core helpful instead of optional decoration?", ["it channels the changing magnetic flux through both coils more effectively", "it stores current for the secondary", "it creates alternating current by itself", "it fixes the turns ratio numerically"], 0, "The core makes the flux link both coils well.", hint),
    mc("What is the best explanation for the secondary emf in an unloaded transformer?", ["changing flux in the core still induces the secondary voltage even if little current is drawn", "the secondary needs a direct wire to the primary", "voltage exists only when current is large", "the secondary becomes a magnet only when loaded"], 0, "Induced emf is present before large load current flows.", hint),
    mc("Why is d.c. in the primary not enough after switch-on?", ["once the current becomes steady, the flux becomes steady and the induction effect disappears", "d.c. lowers the turns ratio to zero", "d.c. destroys the secondary coil", "d.c. makes power infinite"], 0, "Transformer action needs ongoing change, not just a one-time start.", hint),
    mc("What does the turns ratio actually compare?", ["how many loops of wire each coil has, which sets the induced voltage ratio", "how much current is stored in each coil", "how hot each coil becomes", "how strong the battery is"], 0, "Turns are the geometric induction leverage.", hint),
    mc("Why can transformers help with power transmission?", ["they let voltage be raised for transmission and lowered again later while keeping the power story practical", "they make resistance disappear from cables", "they change a.c. into nuclear energy", "they work only with direct current"], 0, "Transformers make the high-voltage, low-current strategy possible.", hint),
    mc("Which sentence best matches rigorous transformer language?", ["a transformer uses changing primary flux in a shared core to induce secondary emf, with voltage ratio set by the turns ratio", "a transformer sends current directly from one coil to the other", "a transformer increases both voltage and current automatically", "a transformer works because the core stores electrons"], 0, "That sentence keeps cause and ratio together.", hint),
    mc("Why is it useful to separate the induction story from the power story?", ["one explains how the voltage is created; the other explains how voltage and current trade off", "they are actually the same sentence repeated", "power removes the need for flux", "turns ratio matters only after power is ignored"], 0, "The module uses both stories together without collapsing them.", hint),
    mc("If a transformer steps 240 V down to 12 V ideally, why can the secondary current be much larger than the primary current?", ["because the lower voltage output can carry the same power only with a larger current", "because lower voltage always means less current", "because the core creates extra charge", "because the turns ratio affects resistance only"], 0, "Power conservation makes the inverse current change unavoidable.", hint),
    mc("What should be checked before applying the simple ideal-transformer formulas in a real device question?", ["that the question is treating the transformer as ideal or near-ideal and is about a.c. operation", "that both coils are made from different metals", "that the core is absent", "that the supply is definitely d.c."], 0, "The clean formulas come from the ideal a.c. model.", hint),
    mc("Why does a transformer count as an induction device?", ["the secondary voltage comes from changing magnetic flux linkage, not from direct electrical contact", "it works only by resistance heating", "it is a generator without coils", "it creates magnetic flux from nowhere"], 0, "Induction is the shared mechanism.", hint),
    mc("A student says 'turns ratio is just a shortcut, not real physics.' Why is that weak?", ["the turns ratio encodes how much emf each coil gets from the same changing flux", "the turns ratio applies only to batteries", "turns are irrelevant once the core exists", "turns ratio replaces conservation of energy"], 0, "Turns ratio is the physical induction leverage.", hint),
    ...shortCases([
      { prompt: "A transformer links two coils through shared magnetic ... in the core.", acceptedAnswers: ["flux", "magnetic flux"], hint: "That is the bridge quantity." },
      { prompt: "In the ideal model, stepping voltage up means stepping current ...", acceptedAnswers: ["down"], hint: "Keep power approximately constant." },
      { prompt: "Steady d.c. fails after switch-on because the core flux stops ...", acceptedAnswers: ["changing", "varying"], hint: "No continuing change means no continuing induction." },
      { prompt: "Turns ratio sets the induced ... ratio in the ideal transformer.", acceptedAnswers: ["voltage", "potential difference"], hint: "That is the main formal bridge." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Separate peak value, rms value, and transmission loss.";
  return [
    mc("What does rms voltage represent for an a.c. supply?", ["the d.c.-equivalent value for heating effect", "the maximum value reached each cycle", "the average algebraic value over a full cycle", "the minimum voltage in the cycle"], 0, "Rms is the heating-equivalent value.", hint),
    mc("For a sinusoidal supply, which relation is correct?", ["V_rms = V_peak / sqrt(2)", "V_peak = V_rms / sqrt(2)", "I_rms = V_peak / sqrt(2)", "P = I / R"], 0, "This is the standard peak-to-rms bridge.", hint),
    mc("Which relation is correct for current in a sinusoidal a.c.?", ["I_rms = I_peak / sqrt(2)", "I_peak = I_rms / sqrt(2)", "I_rms = V_peak / sqrt(2)", "I = V / t"], 0, "Current has the same peak-to-rms factor.", hint),
    mc("A sinusoidal supply has V_peak = 325 V. What is V_rms?", ["about 230 V", "about 460 V", "about 163 V", "325 V"], 0, "Divide the peak by sqrt(2).", hint),
    mc("A sinusoidal supply has V_peak = 170 V. What is V_rms?", ["about 120 V", "about 240 V", "about 85 V", "170 V"], 0, "Divide by sqrt(2).", hint),
    mc("A sinusoidal current has I_peak = 10 A. What is I_rms?", ["about 7.1 A", "about 14 A", "about 5.0 A", "10 A"], 0, "Divide by sqrt(2).", hint),
    mc("Why do national mains supplies quote rms values rather than peak values?", ["rms values connect directly to the d.c.-equivalent heating and power effect", "peak values are impossible to measure", "rms values are always larger", "peak values apply only to batteries"], 0, "Rms is the practical power-heating measure.", hint),
    mc("For a given transmitted power, what happens to current if transmission voltage is increased?", ["it decreases", "it increases", "it stays the same", "it becomes zero"], 0, "Use P = VI: for the same power, larger V means smaller I.", hint),
    mc("Which relation gives cable power loss by heating?", ["P_loss = I^2 R", "P_loss = VI / R", "P_loss = V / I", "P_loss = Q / t"], 0, "Line heating depends strongly on current.", hint),
    mc("If current in a cable is halved and the resistance stays the same, what happens to I^2R loss?", ["it becomes one quarter", "it halves", "it stays the same", "it doubles"], 0, "Loss scales with the square of current.", hint),
    mc("If current in a cable doubles and the resistance stays the same, what happens to I^2R loss?", ["it becomes four times larger", "it doubles", "it stays the same", "it halves"], 0, "Loss scales with I squared.", hint),
    mc("Why is high-voltage transmission useful?", ["it reduces current for the same power and therefore cuts I^2R losses", "it makes cables have zero resistance", "it turns a.c. into d.c. automatically", "it means no transformers are needed"], 0, "The main advantage is smaller current and smaller heating loss.", hint),
    ...shortCases([
      { prompt: "Rms stands for root mean ...", acceptedAnswers: ["square", "squared"], hint: "It is the middle word in the abbreviation." },
      { prompt: "The rms value gives the same ... effect as an equivalent d.c. supply.", acceptedAnswers: ["heating", "power-heating", "thermal"], hint: "Think resistor warming." },
      { prompt: "If V_peak = 100 V, find V_rms.", acceptedAnswers: answers("70.7", "V", "71 V"), hint: "Divide by sqrt(2)." },
      { prompt: "If I_peak = 8.0 A, find I_rms.", acceptedAnswers: answers("5.66", "A", "5.7 A"), hint: "Divide by sqrt(2)." },
      { prompt: "For the same power, if transmission voltage is increased by a factor of 10, the current is reduced by a factor of ...", acceptedAnswers: ["10"], hint: "Use P = VI." },
      { prompt: "If current is reduced to one third for the same cable resistance, the I^2R loss becomes one over ... of the original.", acceptedAnswers: ["9"], hint: "Loss scales with current squared." },
      { prompt: "Cable loss depends on I squared times ...", acceptedAnswers: ["resistance", "R"], hint: "Use the line-loss formula." },
      { prompt: "A high-voltage line carries the same power with lower current, so heating loss gets ...", acceptedAnswers: ["smaller", "lower", "reduced"], hint: "Smaller I means smaller I^2R." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Explain why rms is practical and why transmission strategy targets current.";
  return [
    mc("Why is the average algebraic value of a sinusoidal voltage over a full cycle a poor guide to useful power delivery?", ["positive and negative halves cancel even though heating still occurs in both halves", "average value is always larger than peak", "average value ignores resistance completely", "average value applies only to d.c."], 0, "Power-heating does not vanish just because the signed average is zero.", hint),
    mc("Why is rms voltage the stronger quantity for appliance ratings?", ["it tells you the d.c.-equivalent effect for heating and power in resistive loads", "it is always the largest number available", "it avoids the need for frequency", "it is the same as the peak value"], 0, "Rms bridges a.c. behavior to practical power effects.", hint),
    mc("A student says 'high voltage is used in transmission because it gives more power automatically.' What is the best correction?", ["for the same power demand, high voltage mainly lowers current and therefore reduces cable loss", "higher voltage means current must also rise", "power becomes irrelevant in transmission lines", "transformers can only step voltage down"], 0, "The goal is lower current, not magical extra power.", hint),
    mc("Why does reducing current help even if cable resistance cannot be made zero?", ["I^2R loss falls rapidly when current falls", "current affects only voltage, not heating", "resistance disappears at high voltage", "line loss depends on voltage squared only"], 0, "The square dependence on I is the key transmission idea.", hint),
    mc("Why do power stations step voltage down again near consumers?", ["appliances need practical lower voltages even though high voltage was useful for transport", "low voltage always reduces current and losses further", "transformers work only near homes", "stepping down increases transmission distance"], 0, "Transmission and usage want different voltage levels.", hint),
    mc("What is the best link between transformers and transmission lines?", ["transformers make the high-voltage low-current strategy possible for a.c. power systems", "transformers remove the need for wires", "transformers make line resistance negative", "transformers work only with direct current"], 0, "A.c. transmission is practical because voltage can be changed efficiently.", hint),
    mc("Why is it weak to compare two a.c. supplies using peak voltage alone when judging heater performance?", ["heater effect depends on rms value, not just on peak size", "peak value is never measured", "heaters ignore voltage completely", "peak value matters only for batteries"], 0, "Rms is the relevant comparison for heating effect.", hint),
    mc("What happens to line loss if voltage is doubled for the same transmitted power and cable resistance?", ["it falls to one quarter because current halves", "it halves only", "it stays the same", "it doubles"], 0, "P = VI makes current halve, then I^2R makes loss quarter.", hint),
    mc("Why is 'rms is just the midpoint of the wave' an unacceptable answer?", ["rms is a squared-average-root quantity chosen for equivalent heating effect, not just a geometric midpoint", "rms is exactly half the peak", "rms ignores negative half-cycles", "rms is the frequency of the wave"], 0, "The definition is about power/heating equivalence.", hint),
    mc("Why does the line-loss formula make transmission questions mathematically rigorous rather than slogan-based?", ["it lets you quantify exactly how much lowering current reduces wasted power", "it proves voltage does not matter at all", "it replaces Ohm's law permanently", "it works only for direct current"], 0, "I^2R turns the qualitative strategy into a measurable comparison.", hint),
    mc("A student says 'high voltage is dangerous, so it cannot be useful.' What is the better physics response in the transmission context?", ["it is useful precisely because it allows lower current and much smaller cable heating losses for the same power", "danger means it cannot reduce current", "all transmission uses low voltage", "higher voltage makes resistance disappear"], 0, "Usefulness here is about efficient power transfer.", hint),
    mc("Why is low current the hidden target in transmission design?", ["because current is the quantity that directly drives resistive heating loss in the cables", "because voltage alone causes all heating", "because power cannot be transmitted with current", "because current is not needed in a.c. systems"], 0, "Line loss is controlled by current.", hint),
    mc("Which sentence best matches rigorous A9 language?", ["rms values relate a.c. to equivalent d.c. heating, and high-voltage transmission reduces current so that I^2R cable losses fall", "peak voltage alone decides transmission efficiency", "high voltage makes power free", "rms and transmission are unrelated topics"], 0, "That sentence keeps both parts of the lesson visible.", hint),
    mc("Why can two supplies with different peaks still deliver similar heating if their rms values match?", ["rms is the quantity tied to equivalent thermal effect", "peak always determines heating alone", "frequency must be zero for that to happen", "matching rms means matching resistance"], 0, "Rms is the effective-value comparison.", hint),
    mc("What is the cleanest way to analyze a power-line comparison question?", ["fix the delivered power, use P = VI to compare currents, then use I^2R to compare losses", "compare only the peak voltages", "ignore current and resistance", "assume the larger voltage always means larger loss"], 0, "That is the full mathematical chain.", hint),
    mc("Why does the module pair rms ideas with transmission rather than teaching them separately?", ["rms supplies the practical a.c. values used in power calculations, while transmission uses those values to reason about efficient delivery", "they are unrelated chapters joined by accident", "rms replaces transformers", "transmission can be understood without current"], 0, "The two subtopics reinforce one practical power story.", hint),
    ...shortCases([
      { prompt: "Rms is the value used for the same ... effect as direct current.", acceptedAnswers: ["heating", "thermal", "power-heating"], hint: "Think of a resistor warming." },
      { prompt: "For a fixed delivered power, higher voltage means lower ...", acceptedAnswers: ["current"], hint: "Use P = VI." },
      { prompt: "Cable heating loss falls strongly because it depends on current ...", acceptedAnswers: ["squared", "square"], hint: "Use the I^2R structure." },
      { prompt: "Transmission questions usually chain P = VI first, then P_loss = ...", acceptedAnswers: ["I^2R", "I squared R"], hint: "That is the second step." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Keep eddy currents as induced loops in bulk conductors, then ask whether the effect is useful or unwanted.";
  return [
    mc("What are eddy currents?", ["induced circulating currents in a bulk conductor", "currents that flow only in batteries", "permanent currents locked inside magnets", "currents that exist only in vacuum"], 0, "Eddy currents are local induction loops inside conducting material.", hint),
    mc("What causes eddy currents?", ["changing magnetic flux through the conductor", "constant flux through a stationary conductor", "high temperature alone", "having zero resistance"], 0, "They are an induction effect.", hint),
    mc("Which formula helps quantify heating caused by eddy currents?", ["P = I^2 R", "V = IR only", "f = 1 / T", "p = mv"], 0, "Once a current exists in resistance, the heating follows I^2R.", hint),
    mc("If an induced eddy current doubles and resistance stays the same, what happens to the heating power?", ["it becomes four times larger", "it doubles", "it halves", "it stays the same"], 0, "Heating power scales with current squared.", hint),
    mc("Why are transformer cores laminated?", ["to reduce eddy currents and unwanted heating", "to increase current automatically", "to make the turns ratio larger", "to convert a.c. to d.c."], 0, "Thin insulated layers interrupt large current loops.", hint),
    mc("Which device uses eddy currents deliberately for heating?", ["an induction heater or induction hob", "a simple filament lamp", "a dry cell", "a transformer turns counter"], 0, "Eddy-current heating can be useful.", hint),
    mc("Which application uses eddy currents to oppose motion?", ["magnetic braking", "electrolysis", "transformer rectification", "electrostatic painting"], 0, "Braking is a standard eddy-current use.", hint),
    mc("A metal disc moving through a magnetic field slows down. What is the best explanation?", ["eddy currents are induced and their magnetic effect opposes the motion", "the disc loses all charge carriers", "the field removes the disc mass", "motion stops because voltage is zero"], 0, "This is Lenz-style braking through local loops.", hint),
    mc("Why does a slotted brake disc give weaker eddy-current braking than a solid disc?", ["the slots interrupt the current loops and reduce the induced currents", "the slots increase the magnetic field strength", "the slots make the conductor heavier", "the slots reverse the current direction automatically"], 0, "Breaking the loop paths weakens the eddy currents.", hint),
    mc("What is the strongest reason eddy currents can appear in a solid metal block under changing flux?", ["different parts of the conductor form closed paths for induced current loops", "only coils with wire turns can have induction", "solid metal cannot conduct current", "the block becomes a battery"], 0, "The conductor itself supplies the loop paths.", hint),
    mc("Which statement best matches unwanted eddy currents?", ["they waste energy as heating where the design wanted flux transfer rather than local current loops", "they always improve efficiency", "they occur only in insulators", "they make all fields disappear"], 0, "In some devices eddy currents are loss mechanisms.", hint),
    mc("Which statement best matches useful eddy currents?", ["they can provide heating or damping when the device is designed to use those effects", "they always count as energy loss and nothing more", "they require direct current only", "they appear only in thin wires"], 0, "The same mechanism can be useful or unwanted depending on the design.", hint),
    ...shortCases([
      { prompt: "Eddy currents are induced current ... inside a conductor.", acceptedAnswers: ["loops", "loops of current", "circulating loops"], hint: "They are local circulating paths." },
      { prompt: "Eddy currents need magnetic flux to be ...", acceptedAnswers: ["changing"], hint: "They are an induction effect." },
      { prompt: "Transformer cores are laminated to reduce eddy-current ...", acceptedAnswers: ["heating", "losses", "heating losses"], hint: "The goal is to cut unwanted I^2R loss." },
      { prompt: "A solid metal disc usually gives ... eddy-current braking than a slotted disc.", acceptedAnswers: ["stronger", "more", "greater"], hint: "Continuous loops are easier in the solid disc." },
      { prompt: "If eddy current is tripled and resistance stays the same, heating power becomes ... times larger.", acceptedAnswers: ["9", "nine"], hint: "Use P = I^2R." },
      { prompt: "An induction heater uses eddy currents for useful ...", acceptedAnswers: ["heating"], hint: "That is the deliberate application." },
      { prompt: "Magnetic braking uses eddy currents to oppose ...", acceptedAnswers: ["motion", "the motion"], hint: "This is the Lenz-law application." },
      { prompt: "Slots and laminations work by interrupting large current ...", acceptedAnswers: ["loops", "paths", "loop paths"], hint: "Breaking the paths weakens the eddies." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Use one mechanism first: changing flux induces local loops, and design decides whether that helps or hurts.";
  return [
    mc("Why is it weak to treat eddy currents as a completely separate phenomenon from induction?", ["they are induced currents caused by changing magnetic flux, just like other induction responses", "they happen without conductors", "they do not involve magnetic fields", "they belong only to batteries"], 0, "Eddy currents are an induction application, not a different law.", hint),
    mc("Why can a solid metal block support eddy currents without any wound coil?", ["the bulk conductor itself contains many closed pathways for local induced loops", "induction requires a manufactured coil only", "the block generates direct current chemically", "the block has zero resistance"], 0, "The geometry of the conductor can supply the loops.", hint),
    mc("Why do laminations reduce unwanted eddy-current losses?", ["they break large loop paths and raise the difficulty of sustaining strong circulating currents", "they increase the frequency to zero", "they turn a.c. into d.c.", "they make the core non-magnetic"], 0, "Laminations attack the current-loop geometry directly.", hint),
    mc("Why does a slotted disc brake less strongly than a solid disc in the same magnetic field?", ["the slots interrupt the eddy-current routes, so the induced currents and their opposing magnetic effects are weaker", "the slots always increase resistance and field strength together", "the slots make the disc move faster by themselves", "the slots remove the need for magnetic flux"], 0, "Weaker loops mean weaker braking.", hint),
    mc("What is the strongest reason eddy-current braking converts kinetic energy into thermal energy?", ["the induced currents do I^2R work in the conductor while opposing the motion", "the magnetic field destroys energy directly", "motion changes into charge permanently", "the conductor loses mass as it slows"], 0, "Braking and heating are the linked outcomes.", hint),
    mc("Why is 'eddy currents are bad' an incomplete statement?", ["they are unwanted in some devices but deliberately useful in heating and braking systems", "they never cause heating", "they can only reduce motion and never help a device", "they exist only in transformer cores"], 0, "Application purpose matters.", hint),
    mc("Why does changing flux matter more than simply 'having a magnet nearby' in eddy-current questions?", ["steady flux gives no sustained induced loops, while changing flux drives them", "near magnets always create large eddy currents", "distance never matters", "conductors do not respond to moving fields"], 0, "Again, induction is a change story.", hint),
    mc("Why can a conductor moving through a magnetic field generate eddy currents even if the field source is steady?", ["the conductor experiences changing flux as different parts move through the field pattern", "motion cannot change flux", "steady fields cannot interact with conductors", "only batteries can create current in solids"], 0, "Relative motion can make the flux through local paths change.", hint),
    mc("What is the cleanest bridge between Lenz's law and eddy-current braking?", ["the induced loops set up magnetic effects that oppose the change or motion that produced them", "Lenz's law matters only in transformers", "eddy currents always help motion", "braking has no connection to induction direction"], 0, "Braking is a direct opposition-to-change outcome.", hint),
    mc("Why does a stronger changing field often increase eddy-current effects?", ["it can produce a larger induced emf and therefore larger local currents", "it removes the conductor resistance", "it makes laminations unnecessary", "it changes a.c. into d.c."], 0, "Bigger induction drive usually means bigger eddy currents.", hint),
    mc("Why is an induction hob a useful example for this lesson?", ["it turns the same eddy-current heating that is unwanted in some devices into the intended outcome", "it has no magnetic field", "it works by static charge only", "it proves eddy currents exist only in kitchen appliances"], 0, "The same physics can be engineered toward a purpose.", hint),
    mc("Which sentence best matches rigorous A9 wording?", ["eddy currents are local induced current loops in conductors; they can cause heating or damping, and design features like laminations or slots control their size", "eddy currents are random extra charges that appear in magnets", "eddy currents always improve efficiency", "eddy currents occur only when resistance is zero"], 0, "That sentence keeps mechanism, effects, and control together.", hint),
    mc("Why is it useful to separate 'cause' from 'application' in eddy-current questions?", ["the cause is always changing flux, while the application decides whether heating or braking is wanted", "the cause changes from one device to another completely", "applications remove the need for induction", "heating and braking cannot coexist"], 0, "A shared mechanism supports different purposes.", hint),
    mc("What should be said before naming an appliance when answering an eddy-current question?", ["how changing flux drives local circulating currents in the conductor", "that current is always destroyed in metals", "that the voltage must be direct current", "that only looped wire can respond"], 0, "Mechanism first, example second.", hint),
    mc("Why are eddy currents often smaller in laminated transformer cores than in a solid iron core of the same size?", ["the laminations interrupt the circulating paths and limit the loop size", "the laminations remove magnetic flux completely", "the laminations increase turns ratio", "the laminations make current independent of emf"], 0, "Path interruption is the key physics reason.", hint),
    mc("If the induced current is reduced, why does the unwanted heating also fall?", ["because the heating follows I^2R", "because voltage disappears entirely", "because resistance stops existing", "because changing flux no longer matters"], 0, "This is the quantitative bridge for loss control.", hint),
    ...shortCases([
      { prompt: "Eddy currents are one more example of electromagnetic ...", acceptedAnswers: ["induction"], hint: "They are not a separate law." },
      { prompt: "Laminations and slots reduce eddy effects by breaking current ...", acceptedAnswers: ["paths", "loops", "loop paths"], hint: "Interrupt the circulation." },
      { prompt: "Magnetic braking works because the induced effect opposes the ... causing the change.", acceptedAnswers: ["motion", "movement"], hint: "This is the Lenz-law bridge." },
      { prompt: "In transformer cores, eddy currents are usually treated as unwanted energy ...", acceptedAnswers: ["losses", "waste", "heating losses"], hint: "The design tries to reduce them." },
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

function diagnosticRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "A9_L1":
      return l1DiagnosticRaw();
    case "A9_L2":
      return l2DiagnosticRaw();
    case "A9_L3":
      return l3DiagnosticRaw();
    case "A9_L4":
      return l4DiagnosticRaw();
    case "A9_L5":
      return l5DiagnosticRaw();
    case "A9_L6":
      return l6DiagnosticRaw();
    default:
      throw new Error(`Unknown A9 diagnostic lesson code: ${code}`);
  }
}

function conceptRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "A9_L1":
      return l1ConceptRaw();
    case "A9_L2":
      return l2ConceptRaw();
    case "A9_L3":
      return l3ConceptRaw();
    case "A9_L4":
      return l4ConceptRaw();
    case "A9_L5":
      return l5ConceptRaw();
    case "A9_L6":
      return l6ConceptRaw();
    default:
      throw new Error(`Unknown A9 concept lesson code: ${code}`);
  }
}

function masteryRaw(code: string): RawItem[] {
  switch (normalizeCode(code)) {
    case "A9_L1":
      return l1MasteryRaw();
    case "A9_L2":
      return l2MasteryRaw();
    case "A9_L3":
      return l3MasteryRaw();
    case "A9_L4":
      return l4MasteryRaw();
    case "A9_L5":
      return l5MasteryRaw();
    case "A9_L6":
      return l6MasteryRaw();
    default:
      throw new Error(`Unknown A9 mastery lesson code: ${code}`);
  }
}

export function a9GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "diagnostic", diagnosticRaw(normalized));
}

export function a9GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "concept", conceptRaw(normalized));
}

export function a9GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  return materializeBank(normalized, "mastery", masteryRaw(normalized));
}
