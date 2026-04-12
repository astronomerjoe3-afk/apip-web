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
  hint = "Rebuild the nuclear-physics rule before choosing.",
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
    throw new Error(`A10 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function answers(value: string, unit?: string, ...extra: string[]): string[] {
  const base = unit ? [value, `${value} ${unit}`] : [value];
  return Array.from(new Set([...base, ...extra]));
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Read the whole scattering pattern before naming the structure.";
  return [
    mc("In Rutherford scattering, most alpha particles pass straight through the foil. What does this show?", ["the atom is mostly empty space", "the atom is filled uniformly with positive charge", "the nucleus is larger than the atom", "alpha particles have no mass"], 0, "Most particles seeing almost no obstruction shows that most of the atom is empty.", hint),
    mc("A small fraction of alpha particles are deflected through small angles. What does this show?", ["positive charge is concentrated rather than spread through the whole atom", "electrons are heavier than alpha particles", "the atom is solid throughout", "the nucleus is negatively charged"], 0, "Deflection needs a concentrated repulsive region.", hint),
    mc("Very rare alpha particles rebound through angles greater than 90 degrees. What does this show best?", ["a tiny dense nucleus can produce very strong repulsion in close encounters", "electrons can reverse alpha particles", "the whole atom is a solid sphere", "alpha particles are neutral"], 0, "Rare large-angle scattering points to a tiny but intense positive core.", hint),
    mc("Why did the plum-pudding model fail against the scattering data?", ["it could not explain the rare large deflections and rebounds", "it predicted atoms would have no electrons", "it required neutrons to be negative", "it predicted zero alpha emission"], 0, "Diffuse charge would not produce the observed rare violent repulsions.", hint),
    mc("What is the charge on an alpha particle?", ["+2e", "-2e", "+1e", "0"], 0, "Alpha particles are helium nuclei, so they carry two positive elementary charges.", hint),
    mc("Which part of the atom repels an approaching alpha particle?", ["the positively charged nucleus", "the neutral neutron cloud", "the orbital electrons mainly", "empty space"], 0, "The strong electrostatic repulsion comes from the concentrated positive nucleus.", hint),
    mc("If the alpha particle passes closer to the nucleus, what happens to the deflection angle?", ["it becomes larger", "it becomes smaller", "it stays the same", "it becomes zero"], 0, "Closer approach means a stronger repulsive force and greater deflection.", hint),
    mc("Which statement best matches Rutherford evidence?", ["mass and positive charge are concentrated in a tiny nucleus", "mass is spread uniformly through the atom", "electrons provide most of the atomic mass", "the atom has no empty space"], 0, "The rare strong interactions point to a compact massive center.", hint),
    mc("Why are large-angle deflections rare?", ["only a small fraction of alpha particles pass very close to the tiny nucleus", "alpha particles usually lose all their charge", "most nuclei are neutral", "electrons stop most alpha particles"], 0, "The nucleus occupies only a tiny fraction of the atomic volume.", hint),
    mc("If positive charge were spread throughout the atom, which outcome would be expected?", ["large deflections would be much more common", "all particles would pass straight through", "the beam would gain electrons", "rebound would never depend on charge"], 0, "Diffuse positive charge would smear the repulsion instead of concentrating it.", hint),
    mc("What is the strongest interpretation of the straight-through majority?", ["the alpha particles mostly miss the nucleus altogether", "the nucleus has negative charge", "the foil has no atoms", "the beam contains no energy"], 0, "Straight paths mean most trajectories do not go close to the tiny nucleus.", hint),
    mc("Why were alpha particles suitable probes in the Rutherford experiment?", ["they are positively charged and energetic enough to test the nuclear electric field", "they are neutral and invisible", "they have zero mass", "they can only interact with electrons"], 0, "Their charge and momentum make their deflections informative.", hint),
    ...shortCases([
      { prompt: "Most of an atom is mostly empty ...", acceptedAnswers: ["space"], hint: "Use the standard Rutherford conclusion." },
      { prompt: "The atom's positive charge is concentrated in the ...", acceptedAnswers: ["nucleus"], hint: "Name the compact central region." },
      { prompt: "Rare backscattering implies a tiny, dense, and ... nucleus.", acceptedAnswers: ["massive"], hint: "Mass concentration is part of the conclusion." },
      { prompt: "An alpha particle is repelled because it is ... charged.", acceptedAnswers: ["positively", "positive"], hint: "Like charges repel." },
      { prompt: "A larger scattering angle usually means a ... approach to the nucleus.", acceptedAnswers: ["closer", "closer approach"], hint: "The force grows strongly at shorter range." },
      { prompt: "The Rutherford result ruled out the ...-pudding model.", acceptedAnswers: ["plum", "plum pudding", "plum-pudding"], hint: "Use the older atomic model name." },
      { prompt: "Only a very small fraction of alpha particles come close enough to the nucleus to be strongly ...", acceptedAnswers: ["deflected", "repelled", "turned back"], hint: "Think about the rare-event evidence." },
      { prompt: "Scattering evidence points to a tiny dense ... inside the atom.", acceptedAnswers: ["nucleus"], hint: "Use the core structural word." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Tie each observed pattern to one structural conclusion.";
  return [
    mc("Why is it weak to say 'Rutherford showed that atoms contain a nucleus' and stop there?", ["the scattering pattern also shows that the nucleus is tiny, dense, and positively charged inside mostly empty space", "the experiment did not involve atoms at all", "the nucleus was already known to be neutral", "the result tells you nothing about charge"], 0, "A strong answer uses the full pattern, not just the word nucleus.", hint),
    mc("Why does the straight-through majority matter more than one dramatic rebound track?", ["the overall distribution is the evidence, not one isolated path", "one rebound alone proves every atom is solid", "only the most extreme tracks matter in physics", "the majority of tracks are irrelevant noise"], 0, "Rutherford reasoning comes from the pattern of many events.", hint),
    mc("A student says 'alpha particles bounce because they hit electrons.' What is the best correction?", ["electrons are far too light to produce the rare large-angle rebounds", "electrons are positively charged and stronger than nuclei", "electrons are fixed in the nucleus", "electrons cannot interact with alpha particles"], 0, "Large reversals need a much more concentrated massive positive region.", hint),
    mc("Why does a tiny nucleus explain both frequent straight paths and rare large deflections together?", ["most alpha particles stay far from it, but a few come close enough for strong repulsion", "it makes all alpha particles follow identical paths", "it removes empty space from the atom", "it means electrons control every deflection"], 0, "The same tiny core explains both observations at once.", hint),
    mc("Why is the nuclear-charge conclusion electrical rather than gravitational?", ["the deflecting force depends on like-charge repulsion between alpha particles and the nucleus", "gravity is stronger than electric force inside atoms", "alpha particles are uncharged", "scattering angle depends only on foil thickness"], 0, "The sign and strength of the interaction are electrostatic.", hint),
    mc("What is the best reason a diffuse positive sphere could not give the observed backscattering?", ["the repulsion would be spread out and too weak for abrupt reversals in rare close encounters", "a diffuse sphere would have no electrons", "diffuse charge would make alpha particles neutral", "backscattering requires magnets"], 0, "Backscatter needs a concentrated strong field.", hint),
    mc("Why is 'mostly empty space' a structural conclusion instead of a guess?", ["because the overwhelming majority of alpha particles cross the foil with little or no deflection", "because atoms look empty in diagrams", "because electrons weigh nothing", "because the foil was thin"], 0, "The straight-through pattern is the evidence.", hint),
    mc("Why are alpha particles a better probe of nuclear structure than visible light in this context?", ["their charged-particle deflections respond directly to the nuclear electric field", "light has too much mass", "light is always absorbed by gold", "light cannot travel through empty space"], 0, "The experiment reads force and deflection from charged probes.", hint),
    mc("What should stay visible when explaining why the nucleus is tiny?", ["large deflections are very rare even though the foil contains many atoms", "every alpha particle rebounds", "electrons are found in shells", "gold is a dense metal"], 0, "Rarity of close encounters is the clue to tiny nuclear size.", hint),
    mc("A student says 'the atom must be hollow because particles go through.' What is the stronger refinement?", ["the atom is mostly empty space, but it still contains a concentrated nucleus that can deflect nearby alpha particles", "the atom contains nothing at all", "the atom has no positive charge", "the atom is a hollow metal shell"], 0, "Empty-space language must not erase the nucleus.", hint),
    mc("Why is the nucleus described as dense as well as small?", ["a great deal of atomic mass is packed into a very small region", "its temperature is always high", "its charge is spread out through the whole atom", "it contains only electrons"], 0, "Density is about much mass in little volume.", hint),
    mc("Why do stronger deflections correspond to smaller impact parameter or closer approach?", ["electrostatic repulsion grows rapidly at shorter distance from the nucleus", "the alpha particle becomes lighter near the nucleus", "the foil thickness changes mid-flight", "the atom becomes neutral at short range"], 0, "Force gets much stronger close to the nucleus.", hint),
    mc("What is the cleanest school-level summary sentence?", ["Rutherford scattering showed that atoms are mostly empty space with a tiny dense positively charged nucleus", "Rutherford scattering showed that atoms are solid spheres", "Rutherford scattering proved electrons are inside the nucleus", "Rutherford scattering showed every particle rebounds"], 0, "This sentence holds the three linked conclusions together.", hint),
    mc("Why is it weak to infer nuclear size from only the foil thickness?", ["the key clue is the rarity of large deflections, not the thickness label by itself", "thickness alone tells you the proton number", "foil thickness replaces the need for observations", "thin foils have no nuclei"], 0, "The event pattern is the evidence, not a material label.", hint),
    mc("Why would a thicker foil increase the chance of some scattering without changing the core Rutherford conclusion?", ["alpha particles would encounter more atoms, but the individual atom model would still be inferred from the same type of deflection pattern", "thicker foil makes nuclei negative", "thicker foil removes empty space from atoms", "thicker foil makes alpha particles neutral"], 0, "More encounters do not change the structural logic of each encounter.", hint),
    mc("What is the most rigorous way to handle a scattering question?", ["read the whole pattern, match each feature to one conclusion, then combine them into one atomic model", "memorize one slogan about the nucleus", "focus only on the rarest event", "ignore the straight-through majority"], 0, "That is the evidence-to-model route we want.", hint),
    ...shortCases([
      { prompt: "The Rutherford argument comes from the overall scattering ...", acceptedAnswers: ["pattern", "distribution"], hint: "Do not focus on one track only." },
      { prompt: "Large-angle scattering is rare because the nucleus occupies a tiny fraction of the atom's ...", acceptedAnswers: ["volume", "space"], hint: "Think about how little room the nucleus takes up." },
      { prompt: "The alpha-particle interaction with the nucleus is mainly electric ...", acceptedAnswers: ["repulsion", "electrostatic repulsion"], hint: "Like charges repel." },
      { prompt: "A stronger Rutherford answer says the nucleus is tiny, dense, and positively ...", acceptedAnswers: ["charged"], hint: "Keep the charge conclusion explicit." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Separate beam preparation from detection, then use the formulas carefully.";
  return [
    mc("What is the main job of a particle accelerator?", ["to increase particle energy before collision or probing", "to detect tracks after the collision", "to absorb radiation safely", "to count half-lives"], 0, "Accelerators prepare energetic beams.", hint),
    mc("What is the main job of a particle detector?", ["to convert particle interactions into measurable signals", "to create the beam energy", "to moderate neutrons", "to change proton number"], 0, "Detectors turn invisible events into readable evidence.", hint),
    mc("Which relation gives the kinetic energy gained by a charge accelerated through a potential difference?", ["E_k = qV", "V = IR", "r = mv / qB", "A = lambda N"], 0, "Accelerating voltage raises charged-particle kinetic energy by qV.", hint),
    mc("A proton is accelerated through 3.0 MV. What kinetic energy does it gain?", ["3.0 MeV", "1.5 MeV", "6.0 MeV", "0.30 MeV"], 0, "A single proton charge gains one electronvolt per volt.", hint),
    mc("If the accelerating potential difference doubles for the same particle, what happens to its gained kinetic energy?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "E_k is directly proportional to V.", hint),
    mc("Which formula gives the radius of a charged particle moving perpendicular to a magnetic field?", ["r = mv / qB", "E_k = qV", "P = E / t", "Delta E = Delta m c^2"], 0, "This is the magnetic-curvature relation.", hint),
    mc("If magnetic field strength increases while m, v, and q stay fixed, what happens to the track radius?", ["it decreases", "it increases", "it stays the same", "it becomes zero charge"], 0, "Stronger field bends the path more tightly.", hint),
    mc("If particle speed increases while q, m, and B stay fixed, what happens to the track radius?", ["it increases", "it decreases", "it stays the same", "it becomes independent of mass"], 0, "Faster particles curve less tightly in the same field.", hint),
    mc("What does opposite curvature in the same magnetic field most directly reveal?", ["opposite charge sign", "equal mass", "equal kinetic energy", "equal half-life"], 0, "The force direction flips with charge sign.", hint),
    mc("What does a tighter track curvature in the same field suggest about mv/q?", ["it is smaller", "it is larger", "it is unchanged", "it must be negative only"], 0, "Smaller radius means smaller momentum-to-charge ratio magnitude.", hint),
    mc("Which device would belong on the detection side rather than the acceleration side?", ["a tracker or sensor array", "a high-voltage accelerating gap", "a radiofrequency cavity", "a beam source electrode"], 0, "Detection is about recording the event.", hint),
    mc("Why is a magnetic field useful in detectors?", ["it bends charged particles so their charge sign and momentum-to-charge ratio can be inferred", "it always increases particle rest mass", "it makes all particles move straight", "it changes radioactive half-life"], 0, "Curvature carries information.", hint),
    ...shortCases([
      { prompt: "A particle accelerator increases particle ... before collisions or probing.", acceptedAnswers: ["energy", "kinetic energy"], hint: "That is the beam-preparation role." },
      { prompt: "A detector converts particle interactions into measurable ...", acceptedAnswers: ["signals", "signal"], hint: "That is the readout role." },
      { prompt: "A proton accelerated through 5.0 MV gains ... of kinetic energy.", acceptedAnswers: answers("5.0", "MeV", "5 MeV"), hint: "A proton gains qV." },
      { prompt: "If q, m, and v stay fixed but B doubles, the track radius ...", acceptedAnswers: ["halves", "decreases", "gets smaller"], hint: "Use r = mv / qB." },
      { prompt: "If q, m, and B stay fixed but speed doubles, the track radius ...", acceptedAnswers: ["doubles", "increases", "gets larger"], hint: "Use r = mv / qB." },
      { prompt: "Opposite bending in the same field indicates opposite charge ...", acceptedAnswers: ["sign", "signs"], hint: "The force direction flips." },
      { prompt: "The curvature formula compares momentum per unit ...", acceptedAnswers: ["charge"], hint: "That is what mv/q means." },
      { prompt: "A stronger magnetic field makes a charged-particle path curve more ...", acceptedAnswers: ["tightly", "sharply"], hint: "That means a smaller radius." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Keep beam preparation and event readout as two linked but different jobs.";
  return [
    mc("Why is it weak to describe a detector as the thing that 'gives particles energy'?", ["detectors record outcomes, while accelerators supply the beam energy", "detectors work only with neutrons", "detectors always reduce magnetic fields", "detectors set the particle charge"], 0, "A10_L2 separates preparation from measurement.", hint),
    mc("Why can accelerating voltage be treated as a kinetic-energy source for a charged particle?", ["electrical work qV is transferred to the particle as kinetic energy", "voltage changes the particle mass directly", "voltage removes the need for charge", "voltage is the same thing as magnetic field"], 0, "The beam gains energy from electrical work.", hint),
    mc("What is the strongest reason a curved detector track can reveal momentum-to-charge information?", ["the magnetic field bends the particle according to r = mv / qB", "track colour shows the proton number", "curved paths prove the particle is neutral", "only straight paths can be measured"], 0, "The curvature formula is the bridge from observation to property.", hint),
    mc("Why is tighter curvature not enough by itself to prove lower mass?", ["radius depends on momentum and charge as well as mass", "mass never affects curvature", "charge sign does not matter", "all particles in a detector have equal speed"], 0, "You must keep the full ratio mv/q in view.", hint),
    mc("Why can opposite track curvature reveal charge sign even when the speed is unknown?", ["the direction of magnetic force reverses with charge sign", "speed alone determines bend direction", "heavier particles always bend the other way", "detectors assign the sign by convention"], 0, "Bend direction is a sign clue.", hint),
    mc("A student says 'a larger radius means a larger charge.' Why is that weak?", ["for fixed v and B, larger radius actually means larger mv/q, so larger charge alone would shrink the radius", "radius never depends on charge", "larger radius means lower momentum-to-charge ratio", "charge sign determines radius size only"], 0, "Charge magnitude is in the denominator of the radius relation.", hint),
    mc("Why is an accelerator-detector system described as a designed experiment rather than a random event catcher?", ["the beam is prepared with chosen energy and the detector is built to read specific interaction evidence", "particles move randomly and apparatus does not matter", "detectors choose the laws of physics", "accelerators work only after decay has ended"], 0, "The system is engineered from preparation through readout.", hint),
    mc("Why is it useful to keep beam energy and detector signal separate in explanations?", ["one is about preparing the particle state, the other is about measuring the outcome", "they are exactly the same quantity", "energy matters only before the detector is built", "signals decide the accelerating voltage"], 0, "This is the main conceptual split in the lesson.", hint),
    mc("Why does a stronger magnetic field help separate particles with different momentum-to-charge ratios?", ["their radii respond differently, making their tracks easier to distinguish", "the field removes all detector uncertainty", "stronger fields make all particles straight", "magnetic fields affect only neutral particles"], 0, "Curvature separation is a measurement strategy.", hint),
    mc("Why is 'the particle had a curved track so it must have been losing energy' too strong?", ["curvature can come from magnetic steering even without energy loss", "curvature always means radioactive decay", "only straight tracks conserve energy", "magnetic fields destroy kinetic energy"], 0, "A magnetic field can change direction without doing work.", hint),
    mc("What is the cleanest interpretation of a charge accelerated through a potential difference V?", ["its kinetic energy gain is proportional to both its charge and the voltage", "its speed is fixed directly by the voltage alone", "its mass becomes qV", "its half-life changes to V seconds"], 0, "E_k = qV is the proper energy statement.", hint),
    mc("Why is it weak to say 'the detector sees the particle directly'?", ["detectors usually infer the particle from signals or tracks produced by its interactions", "particles are visible to the eye inside all detectors", "detectors measure only voltage and nothing else", "detectors never use magnetic fields"], 0, "Detection is signal-based, not literal seeing.", hint),
    mc("Which sentence best fits A10_L2 rigor?", ["accelerators prepare energetic beams, and detectors use signals such as track curvature to infer particle properties", "detectors speed particles up until they collide", "accelerators work by counting half-lives", "magnetic fields are useful only in reactors"], 0, "This sentence keeps both halves of the lesson aligned.", hint),
    mc("Why can two particles with the same charge sign still curve with different radii in the same field?", ["their momenta or masses and speeds can differ", "same sign forces identical paths", "the field chooses random radii", "radius depends only on detector length"], 0, "Same sign fixes bend direction, not bend size.", hint),
    mc("Why is 'high energy' not the same as 'easy to detect'?", ["beam energy prepares the interaction scale, but detection still depends on how the apparatus records the event", "all high-energy particles are visible light", "detectors work only at low energy", "energy automatically gives a radius of zero"], 0, "Preparation and readout are linked but not identical.", hint),
    mc("What should be checked before using r = mv / qB in a detector question?", ["that the motion is perpendicular or nearly perpendicular to the magnetic field", "that the particle is neutral", "that the accelerator voltage is zero", "that the detector contains no field"], 0, "The standard circular-path relation assumes perpendicular entry.", hint),
    ...shortCases([
      { prompt: "Accelerators prepare the ..., while detectors read the event.", acceptedAnswers: ["beam"], hint: "That is the prepared input." },
      { prompt: "Magnetic curvature is useful because it reveals momentum-to-charge ...", acceptedAnswers: ["ratio"], hint: "That is what the formula encodes." },
      { prompt: "A positive and a negative particle bend in ... directions in the same magnetic field.", acceptedAnswers: ["opposite"], hint: "Charge sign flips the force direction." },
      { prompt: "A stronger A10_L2 answer keeps beam preparation and detector ... separate.", acceptedAnswers: ["readout", "signal readout", "detection"], hint: "Those are the two roles." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Balance nucleon number and proton number, then separate activity from half-life.";
  return [
    mc("What is radioactive decay?", ["the spontaneous random change of an unstable nucleus", "the heating of a nucleus by a magnet", "the forced splitting of a stable atom by current", "the orbiting of electrons around the nucleus"], 0, "Radioactive decay is a spontaneous nuclear process.", hint),
    mc("What is activity?", ["the decay rate of a sample", "the mass number of the sample", "the energy stored in the nucleus", "the age of the source"], 0, "Activity measures how many decays occur each second.", hint),
    mc("What is the SI unit of activity?", ["becquerel", "tesla", "electronvolt", "pascal"], 0, "One becquerel is one decay per second.", hint),
    mc("Which relation links activity to the number of undecayed nuclei?", ["A = lambda N", "E_k = qV", "r = mv / qB", "Delta E = Delta m c^2"], 0, "Activity is proportional to both decay constant and remaining nuclei.", hint),
    mc("What is the half-life of a radioactive nuclide?", ["the time taken for the number of undecayed nuclei to fall to half", "the time for all nuclei to decay", "the time between two single decays", "the time needed for activity to become zero"], 0, "Half-life is the repeated halving interval for a large sample.", hint),
    mc("In alpha decay, how do mass number A and proton number Z change?", ["A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A decreases by 1 and Z stays the same", "A and Z stay the same"], 0, "An alpha particle is a helium nucleus.", hint),
    mc("In beta-minus decay, how do A and Z change?", ["A stays the same and Z increases by 1", "A decreases by 4 and Z decreases by 2", "A stays the same and Z decreases by 1", "A and Z both increase by 1"], 0, "A neutron turns into a proton, so Z rises while A stays fixed.", hint),
    mc("What changes in gamma emission?", ["neither A nor Z changes", "A decreases by 4 and Z decreases by 2", "A stays the same and Z increases by 1", "A decreases by 1 and Z decreases by 1"], 0, "Gamma emission is a release of energy only.", hint),
    mc("A source has a half-life of 4 h. What fraction of the original undecayed nuclei remains after 12 h?", ["1/8", "1/2", "1/4", "1/16"], 0, "Twelve hours is three half-lives, so the sample halves three times.", hint),
    mc("A source starts at 800 Bq and has a half-life of 6 h. What is its activity after 12 h?", ["200 Bq", "400 Bq", "100 Bq", "600 Bq"], 0, "Two half-lives reduce 800 Bq to 200 Bq.", hint),
    mc("A nuclide has half-life 10 s. Which value is closest to its decay constant?", ["0.069 s^-1", "0.10 s^-1", "6.9 s^-1", "14 s^-1"], 0, "Use lambda = ln(2) / t_(1/2).", hint),
    mc("Which daughter nucleus is produced when uranium-238 emits an alpha particle?", ["thorium-234", "uranium-234", "thorium-238", "protactinium-237"], 0, "Subtract 4 from A and 2 from Z.", hint),
    ...shortCases([
      { prompt: "Activity is the decay ... of a sample.", acceptedAnswers: ["rate"], hint: "Use the rate word." },
      { prompt: "One becquerel means one decay per ...", acceptedAnswers: ["second"], hint: "That is the unit definition." },
      { prompt: "After each half-life, the number of undecayed nuclei is ...", acceptedAnswers: ["halved", "half", "reduced by half"], hint: "Think repeated halving." },
      { prompt: "Alpha decay reduces the mass number by ...", acceptedAnswers: ["4", "four"], hint: "An alpha particle contains four nucleons." },
      { prompt: "Beta-minus decay increases the proton number by ...", acceptedAnswers: ["1", "one"], hint: "A neutron changes into a proton." },
      { prompt: "Gamma emission leaves mass number and proton number ...", acceptedAnswers: ["unchanged", "the same"], hint: "Only nuclear energy changes." },
      { prompt: "A sample starts with 160 undecayed nuclei. After three half-lives, ... nuclei remain.", acceptedAnswers: ["20", "twenty"], hint: "Halve 160 three times." },
      { prompt: "A nuclide has half-life 5 s. Its decay constant is about ...", acceptedAnswers: answers("0.139", "s^-1", "0.14", "0.14 s^-1"), hint: "Use lambda = ln(2) / t_(1/2)." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Keep activity, half-life, and nuclear-equation balance as separate jobs.";
  return [
    mc("Why is it weak to say 'every nucleus waits exactly one half-life before decaying'?", ["decay is random for each nucleus; half-life describes the behavior of a large sample", "half-life applies only to stable nuclei", "each nucleus decays at the same clock time", "half-life means one nucleus decays every second"], 0, "Half-life is statistical, not a personal timer for one nucleus.", hint),
    mc("Why does activity fall with time even though the decay constant stays the same?", ["the number of undecayed nuclei falls, so A = lambda N becomes smaller", "the unit becquerel changes size", "the nucleus loses all charge", "half-life increases automatically"], 0, "Lambda can stay fixed while N drops.", hint),
    mc("Why does beta-minus decay change proton number but not mass number?", ["a neutron changes into a proton, so the nucleon count stays the same", "a proton leaves the nucleus", "two neutrons are created", "gamma rays add mass"], 0, "The nucleus still contains the same total number of nucleons.", hint),
    mc("Why does gamma emission not change the nuclide identity?", ["it only removes excess nuclear energy without changing the numbers of protons or neutrons", "it removes one neutron", "it adds one proton", "it doubles the decay constant"], 0, "Gamma emission is a de-excitation step.", hint),
    mc("Why is activity not the same thing as the number of undecayed nuclei?", ["activity is a rate, while N is the amount still present", "activity measures charge only", "N measures half-life directly", "activity is the mass number"], 0, "Do not confuse amount with rate.", hint),
    mc("Two samples have the same half-life but different starting numbers of nuclei. Why can their initial activities be different?", ["the sample with larger N has larger A because A = lambda N", "half-life fixes the same activity for all samples", "activity ignores the amount of material", "the unit becquerel depends on element name"], 0, "Same lambda does not force same A.", hint),
    mc("Why are radioactive-decay predictions called random yet still predictable?", ["individual decays are unpredictable, but large populations follow stable statistical patterns", "every single decay can be timed exactly", "random means science cannot use the process at all", "predictable means all nuclei decay together"], 0, "This is the core probability idea.", hint),
    mc("Why must a nuclear decay equation balance both A and Z?", ["nucleon number and charge must both be conserved across the decay", "only the element name matters", "electron count is the only conserved quantity", "activity must stay constant"], 0, "A and Z are the bookkeeping quantities.", hint),
    mc("Why can a source with a shorter half-life have a larger activity than one with a longer half-life, even if both start with the same N?", ["shorter half-life means larger decay constant, so A = lambda N is larger", "shorter half-life means fewer nuclei are present", "longer half-life always means higher activity", "activity is unrelated to lambda"], 0, "Lambda is the link between half-life and activity.", hint),
    mc("Why do equal time intervals remove equal fractions rather than equal numbers of nuclei?", ["the decay rate depends on how many undecayed nuclei remain", "half-life forces the same number to disappear each time", "activity must stay constant", "nuclear charge changes the unit of time"], 0, "A falling N means the absolute drop also falls.", hint),
    mc("Why is 'gamma decay changes the nucleus because radiation leaves' too vague?", ["the key point is that gamma changes only energy level, not proton or nucleon number", "gamma always changes Z by 1", "gamma removes electrons from the atom", "gamma means the nucleus splits in two"], 0, "State what stays fixed as well as what changes.", hint),
    mc("Why is it incorrect to say a sample has zero activity after one half-life?", ["after one half-life the activity is halved, not eliminated", "after one half-life the source becomes stable forever", "half-life applies only to mass number", "activity doubles after one half-life"], 0, "Half-life is repeated halving, not instant disappearance.", hint),
    mc("Why does balancing an alpha-decay equation immediately identify the daughter nuclide?", ["alpha emission fixes the changes in A and Z, so the new nuclide is determined by those shifts", "alpha decay never changes the element", "the daughter is chosen from activity only", "half-life decides the daughter isotope"], 0, "A and Z bookkeeping identify the daughter.", hint),
    mc("Why can activity be measured even though you cannot watch single nuclei deciding when to decay?", ["detectors count many decay events over time, revealing the sample's overall rate", "activity is guessed from element names only", "one nucleus gives the full answer", "activity is visible without detectors"], 0, "The sample-rate idea comes from counted events.", hint),
    mc("What is the cleanest way to connect half-life and decay constant?", ["they describe the same decay tendency in different mathematical forms", "they are unrelated quantities", "one belongs only to alpha decay and the other only to beta decay", "both change from second to second"], 0, "Half-life and lambda are two ways to describe the same randomness level.", hint),
    mc("Which sentence best matches rigorous A10_L3 language?", ["Decay equations track what changes in A and Z, while activity tracks how quickly the unstable nuclei disappear", "Half-life tells you the daughter element directly", "Activity and half-life are the same number in different units", "Gamma emission changes both A and Z"], 0, "That sentence keeps balance and rate separate.", hint),
    ...shortCases([
      { prompt: "Half-life describes the behavior of a large ... of nuclei, not one individual nucleus.", acceptedAnswers: ["sample", "population"], hint: "Use the statistical word." },
      { prompt: "Activity falls because the number of undecayed ... falls.", acceptedAnswers: ["nuclei"], hint: "Use A = lambda N." },
      { prompt: "In beta-minus decay, nucleon number stays ...", acceptedAnswers: ["the same", "same", "unchanged"], hint: "A does not change." },
      { prompt: "Gamma emission leaves both A and Z ...", acceptedAnswers: ["unchanged", "the same"], hint: "It changes only energy state." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep mass defect, total binding energy, and binding energy per nucleon distinct.";
  return [
    mc("What is mass defect?", ["the difference between the mass of separated nucleons and the mass of the bound nucleus", "the loss of protons during alpha decay", "the mass of all electrons in the atom", "the difference between proton number and neutron number"], 0, "Mass defect is the missing mass after binding.", hint),
    mc("What is binding energy?", ["the energy needed to separate a nucleus completely into free nucleons", "the energy released when an atom ionizes", "the energy carried by one gamma ray only", "the kinetic energy of the nucleons in orbit"], 0, "Binding energy is the separation energy of the nucleus.", hint),
    mc("Which relation links mass defect to binding energy?", ["Delta E = Delta m c^2", "A = lambda N", "E_k = qV", "P = VI"], 0, "Mass-energy equivalence links the missing mass to stored binding energy.", hint),
    mc("A nucleus has mass defect 0.010 u. What is its binding energy to 2 significant figures?", ["9.3 MeV", "0.93 MeV", "93 MeV", "4.7 MeV"], 0, "Use 1 u c^2 approx 931.5 MeV.", hint),
    mc("A nucleus has total binding energy 56 MeV and mass number 7. What is its binding energy per nucleon?", ["8.0 MeV per nucleon", "7.0 MeV per nucleon", "49 MeV per nucleon", "0.125 MeV per nucleon"], 0, "Divide total binding energy by A.", hint),
    mc("Which nucleus is more stable in the school comparison sense?", ["the one with binding energy per nucleon 8.7 MeV", "the one with binding energy per nucleon 7.2 MeV", "both are equally stable because both are nuclei", "the one with the larger proton number automatically"], 0, "Higher binding energy per nucleon means nucleons are held more tightly on average.", hint),
    mc("How does nuclear radius R depend on mass number A in the standard model?", ["R is proportional to A^(1/3)", "R is proportional to A", "R is proportional to A^2", "R is inversely proportional to A"], 0, "Radius grows with the cube root of nucleon count.", hint),
    mc("If the mass number increases by a factor of 8, what happens to the nuclear radius in the R proportional to A^(1/3) model?", ["it doubles", "it increases by a factor of 8", "it halves", "it stays the same"], 0, "The cube root of 8 is 2.", hint),
    mc("Why is the mass of a bound nucleus smaller than the total mass of its separated nucleons?", ["energy was released when the nucleus formed, so the bound state has less mass-energy", "the nucleus has fewer protons than nucleons", "electrons escape from the nucleus", "half-life removes mass automatically"], 0, "The missing mass corresponds to released binding energy.", hint),
    mc("If free nucleons would total 7.059 u but the nucleus has mass 7.016 u, what is the mass defect?", ["0.043 u", "0.075 u", "0.007 u", "14.075 u"], 0, "Subtract bound mass from separated-nucleon mass.", hint),
    mc("Which quantity is best for comparing nuclear stability across nuclei of different sizes?", ["binding energy per nucleon", "total proton number only", "total binding energy only", "nuclear radius only"], 0, "Per-nucleon comparison removes the simple size effect.", hint),
    mc("What does a larger binding energy mean in physical terms?", ["more energy is required to pull the nucleus completely apart", "the nucleus has no protons", "the nucleus must decay faster", "the atom has higher electrical resistance"], 0, "Binding energy is the separation cost.", hint),
    ...shortCases([
      { prompt: "Mass defect is the missing ... between separated nucleons and the bound nucleus.", acceptedAnswers: ["mass"], hint: "Use the quantity in the name." },
      { prompt: "Binding energy is the energy needed to ... the nucleus completely.", acceptedAnswers: ["separate", "split apart"], hint: "Think of undoing the binding." },
      { prompt: "A mass defect of 0.020 u corresponds to about ...", acceptedAnswers: answers("18.6", "MeV", "18.63 MeV"), hint: "Use 1 u c^2 approx 931.5 MeV." },
      { prompt: "A nucleus has total binding energy 64 MeV and mass number 8. Its binding energy per nucleon is ...", acceptedAnswers: answers("8", "MeV", "8 MeV"), hint: "Divide by A." },
      { prompt: "In the standard model, nuclear radius is proportional to A to the power ...", acceptedAnswers: ["1/3", "one third"], hint: "Use the cube-root law." },
      { prompt: "If mass number increases by a factor of 8, radius changes by a factor of ...", acceptedAnswers: ["2", "two"], hint: "Take the cube root." },
      { prompt: "A nucleus that is harder to pull apart has larger binding energy per ...", acceptedAnswers: ["nucleon"], hint: "Use the averaged stability quantity." },
      { prompt: "A bound nucleus has ... mass than its separated nucleons.", acceptedAnswers: ["less", "smaller"], hint: "That is why there is a mass defect." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Ask whether the statement is about total binding, per-nucleon binding, or the mass-energy link.";
  return [
    mc("Why is total binding energy alone a weak way to compare nuclei of very different sizes?", ["larger nuclei can have larger total binding energy simply because they contain more nucleons", "total binding energy never changes", "only radius matters for stability", "binding energy cannot be measured"], 0, "Use binding energy per nucleon for fair comparison.", hint),
    mc("Why does a missing mass not mean matter has mysteriously vanished?", ["the missing mass corresponds to energy released when the nucleus formed", "protons are destroyed during binding", "all neutrons turn into electrons", "the nucleus becomes hollow"], 0, "Mass-energy equivalence keeps the bookkeeping consistent.", hint),
    mc("Why does higher binding energy per nucleon indicate greater nuclear stability?", ["each nucleon is held more tightly on average, so more energy per nucleon is needed to remove them", "the nucleus must decay faster", "the nucleus always has larger radius", "the proton number must be zero"], 0, "Per-nucleon binding is the stability guide.", hint),
    mc("Why can a small mass defect still correspond to a large energy change?", ["c^2 is a very large conversion factor in Delta E = Delta m c^2", "nuclear masses are measured in volts", "the speed of light becomes smaller in nuclei", "binding energy ignores mass"], 0, "The square of c makes the conversion huge.", hint),
    mc("Why is the binding energy equal to the energy needed to split the nucleus completely?", ["because that amount of energy is required to undo the energy released during formation", "because half-life sets the splitting energy", "because A and Z are equal", "because electrons supply the energy"], 0, "Formation release and separation cost are matched reverses.", hint),
    mc("Why is 'heavier nucleus means more stable nucleus' a weak rule?", ["stability depends more directly on binding energy per nucleon than on total size alone", "heavier nuclei have no neutrons", "all heavy nuclei are unstable automatically", "stability depends only on radius"], 0, "Do not replace a physics quantity with a size slogan.", hint),
    mc("What does the radius law R proportional to A^(1/3) imply about nuclear volume?", ["volume is proportional to A", "volume is proportional to A^3", "volume is independent of A", "volume is proportional to 1/A"], 0, "Since volume scales with R^3, it scales roughly with nucleon count.", hint),
    mc("Why does volume proportional to A suggest roughly constant nuclear density?", ["mass and volume both scale roughly with nucleon number", "radius is fixed for all nuclei", "binding energy does not change", "only protons contribute to mass"], 0, "The density stays of similar order because both numerator and denominator scale together.", hint),
    mc("Why is a bound nucleus at lower energy than the separated nucleons?", ["energy had to be released to form the bound state", "the nucleus contains fewer particles", "electric charge was removed from the atom", "mass defect always means higher energy"], 0, "Lower-energy bound states are more tightly held.", hint),
    mc("Why is binding energy per nucleon more informative than mass defect alone when comparing two different nuclei?", ["mass defect grows with nucleus size, but per-nucleon binding compares the average holding strength", "mass defect never depends on size", "mass defect measures only radius", "binding energy per nucleon ignores mass completely"], 0, "Average rather than total is the comparison we want.", hint),
    mc("Why is it valid to quote mass defect in atomic mass units and binding energy in MeV?", ["u and MeV are linked by the mass-energy conversion 1 u c^2 approx 931.5 MeV", "u and MeV measure exactly the same thing without conversion", "MeV measures proton number", "atomic mass units are only for electrons"], 0, "Different units can represent linked physical quantities.", hint),
    mc("Why is the sign of the mass defect taken from separated mass minus bound mass?", ["the separated nucleons must have the larger mass if binding released energy", "the nucleus must always weigh more after binding", "the mass defect is chosen randomly", "the bound mass is ignored"], 0, "The definition keeps mass defect positive for a bound system.", hint),
    mc("What is the cleanest meaning of 'more tightly bound'?", ["a larger energy input is needed to separate the nucleus", "the nucleus has a larger radius", "the activity is larger", "the decay constant is smaller automatically"], 0, "Tight binding is an energy statement.", hint),
    mc("Why can nuclear-energy release in later lessons be linked back to A10_L4?", ["energy-releasing reactions move toward products with more favorable binding-energy bookkeeping", "later nuclear lessons do not use mass-energy ideas", "binding energy matters only in scattering", "mass defect is unrelated to fission and fusion"], 0, "A10_L4 is the energy-bookkeeping bridge.", hint),
    mc("Which sentence best matches rigorous A10_L4 language?", ["A nucleus is lighter than its separated nucleons because energy was released on binding, and binding energy per nucleon is the stronger comparison for stability", "mass defect means matter disappears permanently", "total binding energy alone always decides stability", "radius law and binding energy are unrelated"], 0, "That sentence keeps both the energy and comparison logic visible.", hint),
    mc("Why should a question about 'hardest nucleus to separate' make you look for binding energy per nucleon or total binding energy carefully?", ["because 'hard to separate' is an energy comparison and you must decide whether the question is about average tightness or total breakup energy", "because separation depends only on charge sign", "because mass number alone gives the full answer", "because radius is always enough"], 0, "Read whether the question asks per nucleon or whole nucleus.", hint),
    ...shortCases([
      { prompt: "Binding energy per nucleon compares stability per ...", acceptedAnswers: ["nucleon"], hint: "It is an average measure." },
      { prompt: "The radius law implies nuclear volume is proportional to ...", acceptedAnswers: ["A", "mass number"], hint: "Cube the radius law." },
      { prompt: "A bound nucleus is at ... energy than the separated nucleons.", acceptedAnswers: ["lower", "less"], hint: "Energy was released on formation." },
      { prompt: "Because c squared is huge, a small mass change can mean a large ... change.", acceptedAnswers: ["energy"], hint: "Use Delta E = Delta m c^2." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Separate the fission event, the chain-reaction condition, and the reactor-control parts.";
  return [
    mc("What is nuclear fission?", ["the splitting of a heavy nucleus into lighter nuclei with energy release", "the joining of two light nuclei", "the removal of electrons from an atom", "the scattering of alpha particles"], 0, "Fission is the splitting process for a heavy nucleus.", hint),
    mc("What is a chain reaction in nuclear fission?", ["released neutrons trigger further fission events", "gamma rays change into electrons", "all nuclei decay at the same moment", "a magnetic field accelerates the fuel"], 0, "One fission can seed more fissions.", hint),
    mc("What is the role of a moderator in a thermal reactor?", ["to slow fast neutrons down", "to absorb all neutrons", "to remove electrical charge from fuel", "to increase the proton number"], 0, "Moderators slow neutrons to thermal energies.", hint),
    mc("What is the role of control rods?", ["to absorb neutrons and control the chain reaction", "to speed up neutrons", "to cool the fuel directly by convection only", "to increase the binding energy of uranium"], 0, "Control rods regulate neutron availability.", hint),
    mc("What is the role of the coolant in a reactor?", ["to carry thermal energy away from the core", "to slow neutrons like the moderator", "to absorb all gamma rays", "to increase the number of fissions per second automatically"], 0, "Coolant removes the heat generated in the core.", hint),
    mc("What are thermal neutrons?", ["slow neutrons that are easier for U-235 to capture in a thermal reactor", "very hot neutrons moving near light speed", "positively charged neutrons", "neutrons produced only by fusion"], 0, "Thermal means slowed to energies suited to capture in this model.", hint),
    mc("What does a critical reactor mean?", ["on average one neutron from each fission causes one more fission", "all neutrons are absorbed immediately", "the chain reaction has stopped", "power output must be zero"], 0, "Critical means self-sustaining and steady on average.", hint),
    mc("If the multiplication factor k is less than 1, the reactor is...", ["subcritical", "critical", "supercritical", "fusion-ready"], 0, "Fewer than one follow-on fission per generation means the chain dies away.", hint),
    mc("If the multiplication factor k is greater than 1, the reactor is...", ["supercritical", "critical", "subcritical", "stable by definition"], 0, "More than one follow-on fission per generation means growth.", hint),
    mc("A reactor delivers 600 MW. If each fission releases 200 MeV (3.2 x 10^-11 J), what is the fission rate?", ["1.9 x 10^19 s^-1", "1.9 x 10^16 s^-1", "5.3 x 10^-20 s^-1", "9.6 x 10^8 s^-1"], 0, "Use fission rate = power / energy per fission.", hint),
    mc("If the reactor power doubles while energy released per fission stays the same, what happens to the fission rate?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Power is proportional to fissions per second when energy per fission is fixed.", hint),
    mc("Where does the released fission energy ultimately come from?", ["the mass defect and binding-energy change of the nuclear system", "chemical burning of the fuel rods", "electrons orbiting faster", "the moderator creating energy"], 0, "Fission energy is nuclear, not chemical.", hint),
    ...shortCases([
      { prompt: "A moderator slows ... neutrons.", acceptedAnswers: ["fast", "the fast"], hint: "Thermal reactors need slower neutrons." },
      { prompt: "Control rods mainly absorb ...", acceptedAnswers: ["neutrons"], hint: "That is how they regulate the chain reaction." },
      { prompt: "A critical chain reaction is self-...", acceptedAnswers: ["sustaining", "maintaining", "steady"], hint: "One generation replaces itself on average." },
      { prompt: "If k > 1, the reactor is ...", acceptedAnswers: ["supercritical"], hint: "The chain grows." },
      { prompt: "If k < 1, the reactor is ...", acceptedAnswers: ["subcritical"], hint: "The chain dies away." },
      { prompt: "A reactor delivers 320 MW and each fission releases 200 MeV (3.2 x 10^-11 J). The fission rate is ...", acceptedAnswers: ["1 x 10^19 s^-1", "1.0 x 10^19 s^-1", "1.0e19 s^-1"], hint: "Use power divided by energy per fission." },
      { prompt: "The coolant removes ... energy from the core.", acceptedAnswers: ["thermal", "heat"], hint: "It carries heat away." },
      { prompt: "A typical U-235 fission releases about ... or 3 neutrons.", acceptedAnswers: ["2", "two"], hint: "That is what makes a chain possible." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "State which reactor part changes neutron speed, which changes neutron number, and which removes heat.";
  return [
    mc("Why is a moderator not the same thing as a control rod?", ["the moderator slows neutrons, while control rods absorb neutrons", "both do exactly the same job", "moderators cool the turbine, while rods create neutrons", "moderators absorb heat and rods change proton number"], 0, "These two components control different parts of the chain story.", hint),
    mc("Why are slow neutrons useful in a thermal U-235 reactor?", ["U-235 is more likely to capture them and undergo fission", "slow neutrons have more electric charge", "slow neutrons always create fusion", "slow neutrons remove the need for coolant"], 0, "Thermal reactors rely on efficient capture of slower neutrons.", hint),
    mc("Why does k = 1 correspond to steady power output on average?", ["each generation of fissions replaces itself without growth or collapse", "no fissions occur", "all neutrons are absorbed by the moderator", "the reactor has zero binding energy"], 0, "Critical means self-sustaining but not growing.", hint),
    mc("Why does k > 1 make reactor control important?", ["the fission rate tends to grow from one generation to the next", "the chain reaction disappears", "all neutrons become thermal instantly", "power becomes independent of fuel"], 0, "Supercritical growth must be controlled.", hint),
    mc("Why is it weak to say 'any piece of uranium will automatically run a chain reaction'?", ["enough neutrons must survive and cause further fissions, which depends on isotope, geometry, and control conditions", "all uranium isotopes fission equally easily", "a chain reaction needs no neutrons", "the moderator creates uranium"], 0, "Chain reaction requires the right conditions, not just the fuel name.", hint),
    mc("Why is coolant needed even if the control rods keep the reactor critical?", ["critical still means continuous energy release, so heat must be removed", "critical means no heat is produced", "coolant slows neutrons instead of removing heat", "control rods remove all gamma radiation"], 0, "Power control and heat removal are different jobs.", hint),
    mc("Why can a neutron trigger fission more easily than a positively charged projectile?", ["the neutron is uncharged, so it does not face Coulomb repulsion from the nucleus", "the neutron is heavier than every nucleus", "positive projectiles have no kinetic energy", "neutrons always travel faster than alpha particles"], 0, "No electric repulsion helps the neutron approach the nucleus.", hint),
    mc("Why does a subcritical reactor or assembly still sometimes contain fissions?", ["individual fissions can happen, but they do not replace themselves fast enough to sustain the chain", "subcritical means no nucleus can ever split", "subcritical means the moderator is absent by definition", "subcritical means fusion has started"], 0, "Subcritical means the chain dies away, not that every single fission is impossible.", hint),
    mc("Why does the energy release in fission count as nuclear rather than chemical?", ["the energy comes from changed nuclear binding, not from electron-bond rearrangement", "the fuel is hot", "all heavy elements are chemical by definition", "control rods add electrical energy"], 0, "The scale and source are nuclear.", hint),
    mc("Why is 'reactors use rods to slow neutrons' an unacceptable answer?", ["slowing neutrons is the moderator's role; rods mainly absorb neutrons to reduce k", "control rods are outside the reactor core", "rods heat the coolant", "rods increase the number of neutrons"], 0, "Match each component to the correct mechanism.", hint),
    mc("Why is it useful to define critical in terms of average neutron replacement rather than just 'safe' or 'unsafe'?", ["it gives a measurable physics condition for whether the chain stays steady, grows, or shrinks", "critical means dangerous only", "critical means the temperature must be low", "critical depends only on the fuel mass"], 0, "Average replacement is the rigorous condition.", hint),
    mc("What is the best reason control rods can lower reactor power?", ["absorbing more neutrons reduces the number available to cause further fissions", "they make the uranium lighter", "they increase the energy released per fission", "they turn fission into fusion"], 0, "Fewer follow-on neutrons means lower chain growth.", hint),
    mc("Why is the fission-rate formula a stronger answer than saying 'more power means more splitting'?", ["it quantifies exactly how power and energy per fission set the number of fissions per second", "it removes the need for units", "it shows power is unrelated to the chain", "it works only for fusion"], 0, "Use the equation to make the claim precise.", hint),
    mc("Why do reactor questions often mention moderator, control rods, and coolant together?", ["they control three different parts of the same system: neutron speed, neutron number, and heat removal", "they are three names for the same object", "all three are needed only in fusion reactors", "none of them affect reactor behavior"], 0, "The three functions must stay distinct.", hint),
    mc("Which sentence best matches rigorous A10_L5 language?", ["Fission of heavy nuclei releases nuclear energy, and a thermal reactor keeps the chain reaction near k = 1 by controlling neutron speed, neutron absorption, and heat removal", "Fission is just very hot chemical burning", "A reactor works because every neutron always triggers another fission", "Moderators and control rods do the same job"], 0, "That sentence keeps the mechanism and control logic together.", hint),
    mc("Why can the same reactor become more stable when control rods are inserted further?", ["more neutron absorption reduces k toward or below 1", "the rods increase the binding energy of the fuel", "the rods make the coolant unnecessary", "the rods change neutrons into protons"], 0, "Rod insertion changes neutron availability.", hint),
    ...shortCases([
      { prompt: "A moderator changes neutron ... rather than neutron number.", acceptedAnswers: ["speed", "energy"], hint: "It slows them down." },
      { prompt: "A critical reactor has multiplication factor ...", acceptedAnswers: ["1", "one", "equal to one"], hint: "That is the steady condition." },
      { prompt: "A chain reaction needs enough neutrons to avoid too much neutron ...", acceptedAnswers: ["escape", "loss", "leakage"], hint: "If too many are lost, the chain dies away." },
      { prompt: "Fission energy ultimately comes from changed binding energy per ...", acceptedAnswers: ["nucleon"], hint: "That is the stability comparison behind the release." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Keep fusion as joining light nuclei, then ask why the conditions are so extreme.";
  return [
    mc("What is nuclear fusion?", ["the joining of light nuclei to form a heavier nucleus", "the splitting of a heavy nucleus", "the ejection of electrons from a metal", "the scattering of neutrons by a detector"], 0, "Fusion combines light nuclei.", hint),
    mc("Why is very high temperature needed for fusion?", ["nuclei must have enough kinetic energy to overcome electrostatic repulsion", "nuclei must become neutral first", "high temperature increases proton number", "fusion works only in solids"], 0, "Temperature helps nuclei approach close enough for the strong force to act.", hint),
    mc("Which environment naturally sustains fusion?", ["the interiors of stars", "ordinary copper wires", "room-temperature air", "static permanent magnets"], 0, "Stars provide the needed temperature and confinement.", hint),
    mc("What are the main products of deuterium-tritium fusion?", ["helium-4 and a neutron", "uranium and a proton", "two alpha particles only", "gamma rays only"], 0, "D-T fusion produces He-4 and a neutron in the standard reaction.", hint),
    mc("A fusion reaction has mass defect 0.020 u. What energy is released to 2 significant figures?", ["19 MeV", "1.9 MeV", "190 MeV", "0.19 MeV"], 0, "Use 1 u c^2 approx 931.5 MeV.", hint),
    mc("Fusion of light nuclei releases energy when...", ["the products have greater binding energy per nucleon than the reactants", "the products have lower total binding energy", "the proton number stays constant", "the temperature becomes zero"], 0, "Energy release follows improved nuclear binding.", hint),
    mc("Why can fusion of light nuclei release energy whereas forcing together very heavy nuclei generally does not?", ["binding energy per nucleon rises for light nuclei but not beyond the iron region", "heavy nuclei have no neutrons", "light nuclei are always neutral", "heavy nuclei cannot interact"], 0, "The binding-energy-per-nucleon trend is the comparison rule.", hint),
    mc("What is plasma?", ["an ionized gas containing free nuclei and electrons", "a solid made of neutrons", "a type of moderator", "a radioactive isotope"], 0, "Fusion fuel is usually handled as a plasma.", hint),
    mc("Why is confinement needed in fusion devices?", ["the hot plasma must be kept together long enough for nuclei to collide and fuse", "confinement lowers the proton number", "confinement removes binding energy", "confinement replaces high temperature"], 0, "Temperature alone is not enough if the fuel escapes too quickly.", hint),
    mc("Which statement best compares fission and fusion?", ["fission splits heavy nuclei, while fusion joins light nuclei", "both split heavy nuclei", "both join only hydrogen nuclei", "fusion uses moderators and control rods in the same way as thermal fission"], 0, "The direction of the nuclear change is opposite.", hint),
    mc("What is the main electrical obstacle before two positively charged nuclei can fuse?", ["Coulomb repulsion", "gamma absorption", "electron capture", "magnetic braking"], 0, "Positive nuclei repel each other electrically.", hint),
    mc("If products are more tightly bound than reactants, what happens to the total mass-energy of the nuclear system?", ["it decreases and the difference is released as energy", "it increases automatically", "it stays exactly the same with no energy output", "it becomes chemical energy only"], 0, "Improved binding means released energy.", hint),
    ...shortCases([
      { prompt: "Fusion joins ... nuclei.", acceptedAnswers: ["light", "two light"], hint: "That is the opposite of fission." },
      { prompt: "Very high temperature helps nuclei overcome electrostatic ...", acceptedAnswers: ["repulsion", "coulomb repulsion", "coulomb barrier"], hint: "They are both positively charged." },
      { prompt: "Deuterium-tritium fusion produces helium and a ...", acceptedAnswers: ["neutron"], hint: "That is the other standard product." },
      { prompt: "In stars, fusion mainly turns hydrogen into ...", acceptedAnswers: ["helium"], hint: "That is the broad stellar summary." },
      { prompt: "A mass defect of 0.010 u corresponds to about ...", acceptedAnswers: answers("9.3", "MeV", "9.315 MeV"), hint: "Use 1 u c^2 approx 931.5 MeV." },
      { prompt: "If products have higher binding energy per nucleon, energy is ...", acceptedAnswers: ["released"], hint: "That is the sign of a profitable reaction." },
      { prompt: "A hot ionized gas is called a ...", acceptedAnswers: ["plasma"], hint: "Fusion fuel is often in this state." },
      { prompt: "Compared with fission, fusion requires much higher ... to start.", acceptedAnswers: ["temperature"], hint: "That is the main ignition condition." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Explain why fusion is favorable for light nuclei, then explain why it is still hard to achieve on Earth.";
  return [
    mc("Why can fusion of light nuclei release energy?", ["light nuclei move toward products with higher binding energy per nucleon", "fusion always lowers binding energy per nucleon", "light nuclei contain no charge", "fusion removes the strong interaction"], 0, "This is the binding-energy comparison behind the release.", hint),
    mc("Why does electrostatic repulsion matter before the strong force can help fusion?", ["the nuclei must first get very close, but like charges repel at larger separations", "the strong force pushes nuclei apart at all distances", "repulsion matters only after fusion happens", "neutrons cause the repulsion"], 0, "Coulomb repulsion is the entrance barrier.", hint),
    mc("Why is temperature alone not the whole fusion challenge on Earth?", ["the hot fuel must also be dense enough and confined long enough for enough collisions to occur", "temperature replaces all other conditions automatically", "fusion can happen in cold gas if the fuel is heavy enough", "only proton number matters"], 0, "Collision opportunity depends on more than one condition.", hint),
    mc("Why do stars manage fusion more easily than laboratory devices?", ["their enormous gravity supplies confinement as well as high temperature and pressure", "stars have no electrostatic repulsion", "stellar nuclei are neutral", "gravity changes protons into neutrons"], 0, "Stars naturally provide the confinement problem we struggle to build.", hint),
    mc("Why is it weak to say 'fusion is just the opposite of fission' and stop there?", ["both release nuclear energy, but they involve different nuclei, different conditions, and different control problems", "fusion and fission are the same equation", "fusion uses moderators just like thermal fission", "fission joins light nuclei"], 0, "A strong comparison keeps mechanism and conditions visible.", hint),
    mc("Why does the D-T reaction still produce a neutron even though the main comparison is about binding energy?", ["conservation of nucleon number and charge still determines the reaction products", "fusion ignores conservation laws", "the neutron is created only by the moderator", "binding energy replaces the need to balance A and Z"], 0, "Nuclear equations still have to balance.", hint),
    mc("Why can the mass of the products be smaller than the mass of the reactants in a fusion reaction?", ["some of the mass-energy difference is released as kinetic or radiation energy", "mass is destroyed without any bookkeeping", "the strong force removes protons from the universe", "the plasma becomes chemically lighter"], 0, "Mass-energy conservation keeps the account balanced.", hint),
    mc("Why is plasma a useful word in fusion rather than ordinary gas?", ["the electrons are no longer bound to atoms, so the fuel consists of free charged particles", "plasma means a solid nuclear fuel", "plasma has no temperature", "plasma is just another name for moderator"], 0, "Fusion fuel is ionized, not ordinary neutral gas.", hint),
    mc("Why is confinement often discussed together with temperature?", ["hot nuclei may have enough energy to fuse, but without confinement they escape before enough collisions occur", "confinement makes the nuclei neutral", "temperature matters only after confinement ends", "confinement lowers the Coulomb barrier to zero"], 0, "Both conditions support collision probability.", hint),
    mc("Why is 'fusion releases more energy because the nuclei are hotter' a weak explanation?", ["the energy release comes from binding-energy change, while temperature is mainly the condition needed to start the reaction", "temperature is the energy source itself", "hotter nuclei have lower proton number", "fusion energy is chemical"], 0, "Separate ignition condition from energy source.", hint),
    mc("Why does the iron region matter in nuclear comparison questions?", ["it marks where binding energy per nucleon is near its maximum, so trends differ on the light and heavy sides", "iron has no neutrons", "iron is the only fusion fuel", "iron prevents mass defect"], 0, "The binding-energy curve changes behavior there.", hint),
    mc("Why is fusion often described as hard to control but not in the same way as a fission chain reaction?", ["the challenge is maintaining extreme conditions, not keeping k near 1 with neutron control rods", "fusion uses the same moderator and control-rod system", "fusion has no energy release", "fission and fusion have identical engineering conditions"], 0, "The control problem is different.", hint),
    mc("Why can fusion still be considered attractive even though it is difficult to ignite?", ["the fuel is light, the energy per mass is large, and the long-lived waste problem is generally less severe than in fission", "fusion needs no confinement", "fusion works at room temperature", "fusion produces no neutrons ever"], 0, "The appeal is real even though the engineering is hard.", hint),
    mc("What is the best reason a fusion question should mention both temperature and repulsion?", ["temperature is the route to overcoming Coulomb repulsion so the nuclei can reach strong-force range", "temperature and repulsion are unrelated", "repulsion matters only in fission", "temperature lowers proton number"], 0, "One condition exists because of the other barrier.", hint),
    mc("Which sentence best matches rigorous A10_L6 language?", ["Fusion joins light nuclei and can release energy when the products are more tightly bound, but it needs very high temperature and confinement because positively charged nuclei repel before they get close enough to fuse", "Fusion is just hot chemistry", "Fusion and fission use the same control rules", "Fusion works because nuclei lose all charge"], 0, "That sentence keeps energy logic and condition logic together.", hint),
    mc("Why is 'products more tightly bound' stronger wording than 'products are heavier'?", ["energy release depends on nuclear binding bookkeeping, not on whether the product mass number is larger or smaller by itself", "heavier always means more stable", "mass number alone decides the sign of energy release", "fusion products are always lighter in A"], 0, "Use binding-energy language, not raw size language.", hint),
    ...shortCases([
      { prompt: "The electrostatic barrier before fusion is often called the Coulomb ...", acceptedAnswers: ["barrier"], hint: "Use the standard name." },
      { prompt: "Fusion needs very high temperature and ...", acceptedAnswers: ["confinement"], hint: "Keep both conditions visible." },
      { prompt: "Successful fusion products are more tightly ... than the reactants.", acceptedAnswers: ["bound"], hint: "Use the binding language." },
      { prompt: "Fusion of light nuclei moves toward higher binding energy per ...", acceptedAnswers: ["nucleon"], hint: "That is the comparison quantity." },
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

const A10_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A10_L1: l1DiagnosticRaw,
  A10_L2: l2DiagnosticRaw,
  A10_L3: l3DiagnosticRaw,
  A10_L4: l4DiagnosticRaw,
  A10_L5: l5DiagnosticRaw,
  A10_L6: l6DiagnosticRaw,
};

const A10_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A10_L1: l1ConceptRaw,
  A10_L2: l2ConceptRaw,
  A10_L3: l3ConceptRaw,
  A10_L4: l4ConceptRaw,
  A10_L5: l5ConceptRaw,
  A10_L6: l6ConceptRaw,
};

const A10_MASTERY_BUILDERS: Record<string, () => RawItem[]> = {
  A10_L1: l1MasteryRaw,
  A10_L2: l2MasteryRaw,
  A10_L3: l3MasteryRaw,
  A10_L4: l4MasteryRaw,
  A10_L5: l5MasteryRaw,
  A10_L6: l6MasteryRaw,
};

export function a10GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A10_DIAGNOSTIC_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "diagnostic", builder()) : [];
}

export function a10GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A10_CONCEPT_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "concept", builder()) : [];
}

export function a10GeneratedMasteryItems(code: string): UnknownRecord[] {
  const lessonCode = normalizeCode(code);
  const builder = A10_MASTERY_BUILDERS[lessonCode];
  return builder ? materializeBank(lessonCode, "mastery", builder()) : [];
}
