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
  hint = "Rebuild the wave or optics mechanism before choosing.",
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
    throw new Error(`A3 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Add the overlapping displacements algebraically at the same place and time.";
  return [
    mc("Which statement best matches a progressive wave?", ["it transfers energy as the disturbance travels", "it transfers matter permanently along the medium", "it keeps every point fixed in space", "it can exist only when the medium is at rest"], 0, "A progressive wave carries energy through the medium while the medium oscillates locally.", hint),
    mc("What does the principle of superposition tell you to do when two waves overlap?", ["add the displacements at the same place and time", "average the amplitudes", "keep only the larger wave", "add the frequencies instead"], 0, "Superposition is an algebraic displacement-addition rule.", hint),
    mc("At one instant a point on wave A has displacement +2 mm and wave B has displacement -3 mm. What is the resultant displacement?", ["-1 mm", "+1 mm", "-5 mm", "+5 mm"], 0, "The signed sum is +2 mm + (-3 mm) = -1 mm.", hint),
    mc("Two equal waves meet exactly in phase. What happens to the displacement at points where they overlap?", ["constructive interference gives a larger resultant amplitude", "the waves cancel completely", "the waves stop moving", "the frequency doubles automatically"], 0, "Equal in-phase contributions reinforce.", hint),
    mc("Two equal waves meet exactly in antiphase. What happens to the displacement at matching points?", ["complete cancellation occurs", "the larger wave survives unchanged", "the amplitude doubles", "the wavelength halves"], 0, "Equal opposite displacements sum to zero.", hint),
    mc("A crest of +4 mm overlaps a trough of -1 mm. Which description is best?", ["partial cancellation giving +3 mm", "complete cancellation", "constructive interference giving +5 mm", "a stationary wave is formed immediately"], 0, "The resultant is +4 mm + (-1 mm) = +3 mm, so the overlap is only partial cancellation.", hint),
    mc("At one point the displacements are +5 mm and +1 mm. What is the resultant displacement?", ["+6 mm", "+4 mm", "+5 mm", "+1 mm"], 0, "Signed displacements add to +6 mm.", hint),
    mc("At one point the displacements are +5 mm and -5 mm. What is the resultant displacement?", ["0 mm", "+10 mm", "-10 mm", "+5 mm"], 0, "Equal and opposite displacements cancel exactly.", hint),
    mc("After two pulses overlap and then separate in a linear medium, what happens to the original pulses?", ["they continue with their original shapes and speeds", "they merge permanently into one pulse", "the larger pulse absorbs the smaller one", "both pulses stop at the overlap point"], 0, "In a linear medium, superposition is temporary; the original pulses continue afterward.", hint),
    mc("Which quantity is added directly in a superposition question?", ["displacement", "wave speed", "frequency", "time period"], 0, "Superposition adds the instantaneous displacements.", hint),
    mc("Why is it incorrect to say 'the bigger wave wins' when two waves overlap?", ["because the resultant depends on the signed sum of both displacements", "because the bigger wave always stops first", "because amplitudes cannot be compared", "because wave speed becomes zero during overlap"], 0, "Both contributions matter; one wave does not replace the other.", hint),
    mc("What remains the safest first step in any superposition snapshot question?", ["read the individual signed displacements before combining them", "guess from whichever crest looks taller", "convert everything to frequency first", "ignore the sign and add magnitudes only"], 0, "The signs of the individual displacements control the resultant.", hint),
    ...shortCases([
      { prompt: "A wave that travels while carrying energy is a ... wave.", acceptedAnswers: ["progressive", "progressive wave"], hint: "Use the travelling-wave term." },
      { prompt: "When two waves overlap, the rule used is called ...", acceptedAnswers: ["superposition", "principle of superposition"], hint: "Name the addition rule." },
      { prompt: "The quantity added directly during overlap is the wave ...", acceptedAnswers: ["displacement"], hint: "It is the signed distance from equilibrium." },
      { prompt: "Equal in-phase contributions produce ... interference.", acceptedAnswers: ["constructive"], hint: "That is the reinforcement case." },
      { prompt: "Equal antiphase contributions produce ... interference.", acceptedAnswers: ["destructive"], hint: "That is the cancellation case." },
      { prompt: "Superposition must be applied at the same place and ...", acceptedAnswers: ["time"], hint: "The snapshot must line up in both ways." },
      { prompt: "A crest and trough of equal size give complete ...", acceptedAnswers: ["cancellation", "destructive interference"], hint: "Use the zero-resultant word." },
      { prompt: "After overlap in a linear medium, each pulse keeps its original ...", acceptedAnswers: ["shape", "speed", "shape and speed"], hint: "The overlap is temporary, not permanent." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Keep the explanation tied to signed displacement, phase, and the same-place same-time rule.";
  return [
    mc("Why does a superposition answer have to compare the waves at the same place and time?", ["because displacement is defined point-by-point and instant-by-instant", "because wave speed changes randomly during overlap", "because wavelength can only be measured at one point", "because amplitudes cannot be signed"], 0, "Superposition is a local snapshot rule.", hint),
    mc("Why is it weak to describe overlap as 'one wave taking over from the other'?", ["both waves contribute simultaneously to the resultant displacement", "waves disappear during overlap", "frequencies always cancel during overlap", "only the larger amplitude wave exists in a medium"], 0, "The overlap is a sum, not a handoff.", hint),
    mc("Why do opposite-sign displacements matter more than the visual word 'crest' or 'trough' alone?", ["because the algebraic sign decides whether the resultant grows or cancels", "because crest and trough change the wave speed", "because sign only affects stationary waves", "because sign is irrelevant in wave questions"], 0, "The signed displacement is the mathematically relevant quantity.", hint),
    mc("A student says 'the waves collided, so some energy must have been destroyed at the cancellation point.' What is the best correction?", ["cancellation in the resultant displacement does not mean the waves cease to exist after overlap", "destructive interference destroys both waves permanently", "energy always disappears when displacement is zero", "the medium cannot store energy during overlap"], 0, "Zero resultant displacement at one instant does not mean the waves are gone.", hint),
    mc("Why is phase language useful in superposition explanations?", ["it predicts whether the displacement contributions will reinforce or cancel", "it replaces the need to know amplitude", "it sets the wave speed directly", "it matters only for electromagnetic waves"], 0, "Relative phase controls the sign pattern of the overlap.", hint),
    mc("Why does superposition not justify averaging the two amplitudes?", ["because the rule is algebraic addition of displacement, not averaging", "because averages apply only to sound", "because amplitudes are never measured numerically", "because averages are used only in antiphase cases"], 0, "Averages would give the wrong resultant in many cases.", hint),
    mc("Why is a snapshot diagram often enough to solve a superposition question?", ["because the instantaneous signed displacements determine the resultant at that moment", "because wave speed is the only needed quantity", "because phase never matters in diagrams", "because wavelength becomes irrelevant in all wave problems"], 0, "A superposition question is often a same-instant geometry read.", hint),
    mc("What makes constructive interference a mechanism statement rather than a slogan?", ["showing that same-sign displacements add to a larger resultant", "calling every tall wave constructive", "saying the wave looks stronger", "naming the colour of the crest"], 0, "Mechanism means linking the label to the displacement rule.", hint),
    mc("Why do the original waves reappear after overlap in a linear medium?", ["because superposition is temporary and each wave keeps its own propagation", "because the medium creates a brand-new pulse after every collision", "because cancellation freezes the medium permanently", "because the frequency becomes zero at the meeting point"], 0, "Linear superposition does not permanently merge or destroy the waves.", hint),
    mc("Why should a worked explanation mention signed displacement before mentioning amplitude?", ["because amplitude labels alone do not tell you whether the resultant should add or cancel", "because amplitude is never important in waves", "because amplitude decides the wavelength", "because sign matters only after the waves have separated"], 0, "The sign determines the direction of the displacement contribution.", hint),
    mc("Which statement best protects the A3_L1 lesson meaning?", ["Overlapping progressive waves share one resultant displacement because the individual displacements are added at the same place and time.", "The larger wave replaces the smaller one whenever they overlap.", "Wave overlap is solved by averaging the two amplitudes.", "Destructive interference means the waves stop existing after the meeting point."], 0, "That statement keeps mechanism, not slogan, at the center.", hint),
    mc("Why is 'same frequency' not enough by itself to predict reinforcement or cancellation in one snapshot?", ["the relative phase or signed displacement at that point is still needed", "frequency always fixes the resultant amplitude exactly", "frequency tells you the wave speed in every medium", "frequency matters only for stationary waves"], 0, "Frequency alone does not reveal the instantaneous alignment.", hint),
    ...shortCases([
      { prompt: "A rigorous overlap explanation starts with signed ...", acceptedAnswers: ["displacement", "displacements"], hint: "That is the quantity the rule combines." },
      { prompt: "Constructive and destructive outcomes are controlled by relative ...", acceptedAnswers: ["phase", "phase difference"], hint: "That is the comparison word." },
      { prompt: "Superposition is a temporary ... rule, not a permanent merger.", acceptedAnswers: ["addition", "summing", "sum"], hint: "Use the mathematics word." },
      { prompt: "Cancellation at one point does not mean the original waves are permanently ...", acceptedAnswers: ["destroyed", "gone"], hint: "The waves continue afterward in a linear medium." },
      { prompt: "A strong A3_L1 answer keeps the mechanism ... rather than using a slogan only.", acceptedAnswers: ["visible", "clear"], hint: "That is what the audit is protecting." },
      { prompt: "The two waves must be compared at the same place and the same ...", acceptedAnswers: ["time"], hint: "That is the local snapshot rule." },
      { prompt: "Partial cancellation still means the resultant is found by algebraic ...", acceptedAnswers: ["addition", "adding"], hint: "Even cancellation cases use the same rule." },
      { prompt: "After overlap, each original pulse keeps propagating with its own ...", acceptedAnswers: ["shape", "speed", "shape and speed"], hint: "The overlap is not permanent." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Keep nodes, antinodes, boundary fit, and the harmonic formula on one board.";
  return [
    mc("How is a stationary wave formed on a string?", ["by two waves of the same frequency traveling in opposite directions", "by a single pulse stopping in the middle", "by two waves of different frequencies moving together", "by one wave changing medium"], 0, "Standing patterns come from matched opposite-traveling waves.", hint),
    mc("What is a node?", ["a point that always remains at zero displacement", "a point of maximum displacement", "the midpoint of every wave", "a point where wave speed is greatest"], 0, "Nodes stay permanently quiet.", hint),
    mc("What is an antinode?", ["a point of maximum oscillation amplitude", "a point of zero displacement", "the place where wavelength is measured only", "the place where frequency becomes zero"], 0, "Antinodes are the strongest oscillation points.", hint),
    mc("What is true about net energy transfer along an ideal stationary wave?", ["there is no net energy transfer along the pattern", "energy travels steadily from left to right", "energy travels steadily from right to left", "energy transfer doubles at nodes"], 0, "A stationary wave is a standing pattern, not a traveling energy route.", hint),
    mc("What is the distance between adjacent nodes in a stationary wave?", ["lambda / 2", "lambda / 4", "lambda", "2 lambda"], 0, "Node-to-node spacing is half a wavelength.", hint),
    mc("What is the distance from a node to the nearest antinode?", ["lambda / 4", "lambda / 2", "lambda", "2 lambda"], 0, "A node and neighboring antinode are a quarter wavelength apart.", hint),
    mc("A string is fixed at both ends and has length 1.2 m. What is the wavelength of the second harmonic?", ["1.2 m", "2.4 m", "0.6 m", "0.3 m"], 0, "For fixed ends, L = n lambda / 2, so lambda = 2L / n = 1.2 m.", hint),
    mc("A string of length 1.5 m carries stationary waves with wave speed 240 m/s. What is the frequency of the third harmonic?", ["240 Hz", "160 Hz", "120 Hz", "80 Hz"], 0, "f = n v / (2L) = 3 x 240 / (2 x 1.5) = 240 Hz.", hint),
    mc("For the fundamental on a string fixed at both ends, which relation is correct?", ["the string length equals half a wavelength", "the string length equals a full wavelength", "the string length equals a quarter wavelength", "the string length equals two wavelengths"], 0, "The first harmonic fits one half-wavelength into the length.", hint),
    mc("How many antinodes are on the third harmonic of a string fixed at both ends?", ["3", "2", "4", "6"], 0, "The nth harmonic on a fixed-fixed string has n antinodes.", hint),
    mc("Which condition must be satisfied for a clean stationary wave pattern to persist?", ["the boundary condition must fit an allowed wavelength", "the amplitude must always be zero at antinodes", "the frequency must keep changing", "the two waves must move in the same direction"], 0, "Only allowed harmonics fit the boundaries cleanly.", hint),
    mc("Why can a stationary wave not be described as 'a progressive wave that stopped moving'?", ["the pattern is maintained by continuous opposite-traveling waves, not by one frozen shape", "stationary waves have no wavelength", "stationary waves can exist only in vacuum", "progressive waves never have amplitude"], 0, "The mechanism is ongoing superposition.", hint),
    ...shortCases([
      { prompt: "A standing pattern formed by opposite-traveling waves is a ... wave.", acceptedAnswers: ["stationary", "stationary wave", "standing", "standing wave"], hint: "Use the standing-pattern term." },
      { prompt: "A point of zero displacement in a stationary wave is a ...", acceptedAnswers: ["node"], hint: "It stays quiet." },
      { prompt: "A point of maximum oscillation in a stationary wave is an ...", acceptedAnswers: ["antinode"], hint: "It swings the most." },
      { prompt: "An allowed standing-wave mode is called a ...", acceptedAnswers: ["harmonic"], hint: "Use the mode word." },
      { prompt: "Adjacent nodes are separated by half a ...", acceptedAnswers: ["wavelength", "lambda"], hint: "That is the spacing rule." },
      { prompt: "The distance from a node to the nearest antinode is one quarter of a ...", acceptedAnswers: ["wavelength", "lambda"], hint: "That is the quarter-wave spacing." },
      { prompt: "A stationary wave on a fixed string needs the wavelength to fit the boundary ...", acceptedAnswers: ["condition", "conditions"], hint: "Use the boundary-fit phrase." },
      { prompt: "A clean stationary pattern has no net energy ... along the string.", acceptedAnswers: ["transfer"], hint: "It stands rather than carries energy along." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Explain the standing pattern using opposite-traveling waves, nodes, antinodes, and boundary fit.";
  return [
    mc("Why is it not enough to say 'a stationary wave has nodes and antinodes'?", ["you must explain that the pattern is built by superposition of opposite-traveling waves", "nodes and antinodes already prove the wavelength is zero", "stationary waves do not need a source once formed", "boundary conditions are irrelevant"], 0, "The features follow from a specific mechanism.", hint),
    mc("Why do nodes stay fixed in position?", ["permanent destructive interference occurs there", "the wave speed is greatest there", "the string cannot move anywhere else", "constructive interference is strongest there"], 0, "Opposite contributions cancel at the same places every cycle.", hint),
    mc("Why do antinodes oscillate with maximum amplitude?", ["the opposite-traveling waves reinforce there repeatedly", "they are points of zero displacement", "they must sit halfway between two sources only", "wave speed becomes infinite there"], 0, "Antinodes are repeated constructive-interference points.", hint),
    mc("Why do only certain harmonics survive on a fixed-length string?", ["only certain wavelengths satisfy the boundary condition at both ends", "all wavelengths survive equally but some are hidden", "frequency does not matter for fixed ends", "the string chooses the largest amplitude automatically"], 0, "Boundary fit decides the allowed modes.", hint),
    mc("A learner says 'the wave is standing still, so there cannot be any oscillation.' What is the correction?", ["the pattern is fixed in space, but the medium still oscillates except at nodes", "stationary waves have no displacement anywhere", "the frequency becomes zero in a stationary wave", "only antinodes are fixed"], 0, "The pattern stands; the particles do not stop oscillating.", hint),
    mc("Why is the relation L = n lambda / 2 stronger than just counting bumps?", ["it ties the visible pattern to the allowed wavelength mathematically", "it shows every string has the same frequency", "it makes nodes unnecessary", "it works only for progressive waves"], 0, "The equation expresses boundary-fit rigorously.", hint),
    mc("Why is there no net energy transfer along the string in a stationary wave?", ["energy sloshes locally in the standing pattern instead of traveling steadily one way", "the source has switched off completely", "the amplitude is zero everywhere", "the frequency is not defined"], 0, "Standing patterns do not carry energy along like progressive waves do.", hint),
    mc("Why should a worked example identify the boundary condition first?", ["because the allowed harmonics depend on how the ends are constrained", "because wavelength no longer matters once nodes appear", "because nodes decide the wave speed directly", "because only the amplitude matters in standing waves"], 0, "Boundary condition determines which modes are possible.", hint),
    mc("Why is a stationary wave not just a special case of one progressive wave traveling very slowly?", ["the standing pattern needs two opposite-traveling waves, not one slow traveler", "slow waves always have nodes", "progressive waves cannot interfere", "wave speed alone fixes nodes and antinodes"], 0, "Mechanism matters more than the picture label.", hint),
    mc("What makes the third harmonic different from the first harmonic on the same string?", ["it fits more half-wavelengths into the same length and therefore has a higher frequency", "it removes the fixed ends", "it transfers energy progressively instead of standing", "it has fewer nodes"], 0, "Higher harmonics fit more segments into the same boundary length.", hint),
    mc("Which statement best protects the A3_L2 lesson meaning?", ["Stationary waves are standing patterns caused by opposite-traveling waves, with nodes and antinodes fixed by boundary-matched harmonics.", "Stationary waves are single progressive waves that pause at regular intervals.", "Nodes are just places where the wave has run out of energy forever.", "Any wavelength can produce a clean standing pattern if the amplitude is large enough."], 0, "That statement keeps both mechanism and boundary rigor visible.", hint),
    mc("Why should node-antinode spacing be read before attempting a frequency calculation?", ["because the geometry helps confirm which harmonic or wavelength is actually present", "because frequency is unrelated to wavelength", "because spacing matters only for diagrams", "because calculations replace the physical pattern"], 0, "The geometry checks the mode identification.", hint),
    ...shortCases([
      { prompt: "A node is a point of permanent ... interference.", acceptedAnswers: ["destructive"], hint: "That is why it stays at zero displacement." },
      { prompt: "An antinode is a point of repeated ... interference.", acceptedAnswers: ["constructive"], hint: "That is why the amplitude is largest there." },
      { prompt: "Only wavelengths that satisfy the boundary ... produce clean harmonics.", acceptedAnswers: ["condition", "fit"], hint: "That is the mode-selection rule." },
      { prompt: "A standing pattern is built from two ...-traveling waves.", acceptedAnswers: ["opposite", "oppositely"], hint: "That is the formation mechanism." },
      { prompt: "The string pattern stands in space, but the medium still ...", acceptedAnswers: ["oscillates", "vibrates"], hint: "The particles continue moving except at nodes." },
      { prompt: "The nth harmonic on a fixed-fixed string contains n ...", acceptedAnswers: ["antinodes"], hint: "That is the clean counting rule." },
      { prompt: "A strong A3_L2 answer keeps the boundary-fit mechanism ...", acceptedAnswers: ["visible", "clear"], hint: "Do not collapse it into a label only." },
      { prompt: "Stationary waves do not carry net energy ... the string.", acceptedAnswers: ["along", "along the string"], hint: "That is the contrast with progressive waves." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Keep coherence, path difference, and fringe spacing tied together.";
  return [
    mc("What is the essential property of coherent sources?", ["they maintain a constant phase difference", "they have very large amplitudes", "they always produce only one fringe", "they travel in opposite directions"], 0, "Coherence keeps the interference pattern stable.", hint),
    mc("What path difference gives constructive interference?", ["n lambda", "(n + 1/2) lambda", "lambda / 4", "0.3 lambda"], 0, "A whole-number wavelength difference gives reinforcement.", hint),
    mc("What path difference gives destructive interference?", ["(n + 1/2) lambda", "n lambda", "2 n lambda", "0"], 0, "A half-integer wavelength difference gives cancellation.", hint),
    mc("At the central point of a symmetric double-slit pattern, what is the path difference?", ["0", "lambda / 2", "lambda", "2 lambda"], 0, "Equal routes give zero path difference.", hint),
    mc("A point has path difference 1.5 lambda. What kind of fringe is it?", ["dark", "bright", "central", "undefined"], 0, "1.5 lambda is a half-integer multiple, so it is destructive.", hint),
    mc("A point has path difference 2 lambda. What kind of fringe is it?", ["bright", "dark", "only partially bright", "unrelated to interference"], 0, "A whole-number multiple gives constructive interference.", hint),
    mc("For a double-slit pattern, fringe spacing w is given by which relation?", ["w = lambda D / a", "w = a D / lambda", "w = v / f", "w = n lambda / 2"], 0, "Fringe spacing depends on wavelength, screen distance, and slit separation.", hint),
    mc("Light of wavelength 600 nm passes through slits separated by 0.30 mm onto a screen 2.0 m away. What is the fringe spacing?", ["4.0 mm", "2.0 mm", "6.0 mm", "0.4 mm"], 0, "w = lambda D / a = 6e-7 x 2.0 / 3e-4 = 4.0e-3 m = 4.0 mm.", hint),
    mc("If the screen distance D doubles while lambda and a stay fixed, what happens to fringe spacing?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "w is directly proportional to D.", hint),
    mc("If the slit separation a doubles while lambda and D stay fixed, what happens to fringe spacing?", ["it halves", "it doubles", "it stays the same", "it becomes zero"], 0, "w is inversely proportional to a.", hint),
    mc("If the wavelength increases while D and a stay fixed, what happens to fringe spacing?", ["it increases", "it decreases", "it is unchanged", "it becomes impossible"], 0, "Larger wavelength gives larger fringe spacing.", hint),
    mc("Why is path difference more useful than absolute path length in interference questions?", ["the outcome depends on the difference between the routes, not the total distance each wave traveled separately", "absolute path length fixes the amplitude directly", "only one path matters at a time", "interference ignores geometry"], 0, "Interference is a comparison between the two routes.", hint),
    ...shortCases([
      { prompt: "Sources that keep a constant phase relationship are called ...", acceptedAnswers: ["coherent", "coherent sources"], hint: "Use the stable-phase term." },
      { prompt: "Constructive interference occurs when path difference is a whole number of ...", acceptedAnswers: ["wavelengths", "lambda"], hint: "That is the bright-fringe condition." },
      { prompt: "Destructive interference occurs when path difference is a half-odd number of ...", acceptedAnswers: ["wavelengths", "lambda"], hint: "That is the dark-fringe condition." },
      { prompt: "The route comparison used in interference is called path ...", acceptedAnswers: ["difference"], hint: "It is the geometry bridge." },
      { prompt: "Fringe spacing in a double-slit pattern is usually written as w = lambda D / ...", acceptedAnswers: ["a"], hint: "a is the slit separation." },
      { prompt: "The central fringe of a symmetric double-slit pattern is ...", acceptedAnswers: ["bright"], hint: "Equal paths reinforce there." },
      { prompt: "A stable interference pattern needs a constant phase ...", acceptedAnswers: ["difference"], hint: "That is what coherence provides." },
      { prompt: "Interference should be explained through route comparison, not one path viewed in ...", acceptedAnswers: ["isolation", "alone"], hint: "Both paths matter together." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Tie the fringe outcome back to coherence plus path and phase comparison.";
  return [
    mc("Why is coherence essential for a stable interference pattern?", ["without a constant phase relationship the bright and dark positions drift randomly", "without coherence the wavelength becomes zero", "coherence only matters for diffraction gratings", "coherence fixes amplitude but not pattern"], 0, "Stable phase difference is what keeps the fringe pattern fixed.", hint),
    mc("Why is it weak to say 'the bright fringe is where the waves meet nicely'?", ["the answer should state that the path difference gives a whole-number wavelength difference and therefore constructive interference", "brightness is caused only by larger slit width", "bright fringes do not depend on phase", "interference is not a wave effect"], 0, "Mechanism means route and phase reasoning, not vague wording.", hint),
    mc("Why should path difference be treated as a route into phase difference?", ["because route difference sets how far out of step the waves arrive", "because phase difference changes the speed of light", "because path difference removes the need for wavelength", "because path difference matters only at the source"], 0, "Geometry determines the arrival alignment.", hint),
    mc("A learner says 'both paths are long, so the interference must be constructive.' What is the correction?", ["the absolute path lengths are less important than their difference", "longer paths always give bright fringes", "constructive interference depends only on amplitude", "interference disappears when the paths are unequal"], 0, "Only the difference between the routes sets the condition.", hint),
    mc("Why is the central fringe bright in the usual symmetric arrangement?", ["the path difference is zero, which is a constructive condition", "the central fringe receives the largest amplitude source only", "the central fringe has half a wavelength path difference", "it is bright only because the screen is closer there"], 0, "Zero path difference is a whole-number multiple of lambda.", hint),
    mc("Why does increasing slit separation reduce fringe spacing?", ["a larger slit separation requires a smaller angle change to reach the next constructive condition", "larger slit separation increases wavelength", "slit separation changes the speed of light", "larger slit separation destroys coherence"], 0, "The same path-difference condition is met more quickly in angle when a is larger.", hint),
    mc("Why does increasing wavelength spread the fringes further apart?", ["the next whole-wavelength path-difference condition needs a larger geometric shift", "wavelength changes only brightness", "larger wavelength reduces screen distance automatically", "wavelength matters only for sound"], 0, "Bigger lambda means the fringe condition is reached at larger spacing.", hint),
    mc("What makes interference a better explanation than a label-only answer?", ["it specifies how route difference and phase difference produce the visible fringe", "it replaces the need for geometry", "it works only for the central fringe", "it uses brightness words without equations"], 0, "A mechanism answer explains why the pattern forms.", hint),
    mc("Why is it unsafe to answer an interference question using amplitude alone?", ["two points with the same source amplitude can still differ because their path differences are different", "amplitude decides path difference directly", "amplitude sets coherence automatically", "amplitude makes every fringe bright"], 0, "The route comparison is the key extra ingredient.", hint),
    mc("Why does a final A3_L3 explanation often compare both paths explicitly?", ["because interference is defined by the relation between the two routes", "because one path is enough to locate every dark fringe", "because the second path only affects wavelength", "because the second path matters only in diffraction"], 0, "The pattern is relational, not one-path physics.", hint),
    mc("Which statement best protects the A3_L3 lesson meaning?", ["Interference patterns stay reliable when coherent waves are compared through path difference, which sets the phase relation and therefore the bright or dark outcome.", "Interference is mainly about whichever path is longer.", "Dark fringes happen when amplitude disappears at the source.", "Constructive interference means the wave speed doubles."], 0, "That statement keeps coherence, route difference, and phase all visible.", hint),
    mc("Why is a memorized condition like 'dark means half a wavelength' incomplete on its own?", ["the answer still needs to say that the half-wavelength path difference makes the waves arrive out of phase", "the half-wavelength rule works without any wave model", "dark fringes are caused only by screen colour", "half a wavelength means the sources are incoherent"], 0, "The condition should be tied back to mechanism.", hint),
    ...shortCases([
      { prompt: "Coherence keeps the phase relationship ...", acceptedAnswers: ["constant", "fixed"], hint: "That is why the fringes stay put." },
      { prompt: "The bridge from route geometry to wave outcome is path ...", acceptedAnswers: ["difference"], hint: "That is the comparison quantity." },
      { prompt: "A whole-number wavelength path difference gives ... interference.", acceptedAnswers: ["constructive"], hint: "That is the bright case." },
      { prompt: "A half-odd-multiple path difference gives ... interference.", acceptedAnswers: ["destructive"], hint: "That is the dark case." },
      { prompt: "Fringe spacing gets larger when wavelength gets ...", acceptedAnswers: ["larger", "longer"], hint: "Use the proportionality idea." },
      { prompt: "Fringe spacing gets smaller when slit separation gets ...", acceptedAnswers: ["larger", "bigger"], hint: "Use the inverse relation." },
      { prompt: "A strong A3_L3 answer keeps the two-path mechanism ...", acceptedAnswers: ["visible", "clear"], hint: "Do not flatten it into a slogan." },
      { prompt: "Interference is a comparison between two wave ...", acceptedAnswers: ["routes", "paths"], hint: "Both must be read together." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep slit spacing, wavelength, order number, and angle together.";
  return [
    mc("What is a diffraction grating?", ["a large number of equally spaced slits", "a single narrow slit", "a polished mirror surface", "a prism with one refracting edge"], 0, "A grating uses many evenly spaced slits.", hint),
    mc("Which equation gives the condition for bright orders in a diffraction grating?", ["n lambda = d sin(theta)", "w = lambda D / a", "L = n lambda / 2", "n1 sin(theta1) = n2 sin(theta2)"], 0, "This is the grating-order condition.", hint),
    mc("What does d represent in the grating formula?", ["the spacing between adjacent slits", "the screen distance", "the order number", "the wave speed"], 0, "d is the slit separation or grating spacing.", hint),
    mc("A grating has 500 lines per mm. What is the slit spacing d?", ["2.0 x 10^-6 m", "5.0 x 10^-4 m", "2.0 x 10^-3 m", "5.0 x 10^-6 m"], 0, "500 lines/mm = 5.0 x 10^5 lines/m, so d = 1 / N = 2.0 x 10^-6 m.", hint),
    mc("For first order with lambda = 500 nm and d = 1.0 x 10^-6 m, what is the diffraction angle?", ["30 degrees", "60 degrees", "45 degrees", "15 degrees"], 0, "sin(theta) = lambda / d = 0.5, so theta = 30 degrees.", hint),
    mc("If wavelength increases while d and order stay fixed, what happens to the diffraction angle?", ["it increases", "it decreases", "it stays unchanged", "it becomes zero"], 0, "Larger lambda requires larger sin(theta).", hint),
    mc("If the grating has more lines per mm, what happens to d?", ["d becomes smaller", "d becomes larger", "d stays unchanged", "d becomes zero only for first order"], 0, "Line density and spacing are reciprocals.", hint),
    mc("What happens to the first-order angle if d becomes smaller while wavelength stays fixed?", ["the angle increases", "the angle decreases", "the angle stays unchanged", "the order disappears automatically"], 0, "Smaller d means larger sin(theta) for the same order.", hint),
    mc("Why can a high order be impossible?", ["because the formula would require sin(theta) to exceed 1", "because higher orders always have zero wavelength", "because order number changes the grating spacing", "because coherent light cannot diffract"], 0, "No real angle exists if sin(theta) would be greater than 1.", hint),
    mc("A grating has d = 2.0 x 10^-6 m and light of wavelength 600 nm. What is the highest possible order?", ["3", "2", "4", "5"], 0, "d / lambda = 2.0e-6 / 6.0e-7 = 3.33, so the largest whole order is 3.", hint),
    mc("What is the central maximum order number?", ["0", "1", "2", "-1 only"], 0, "The undeviated central beam is order zero.", hint),
    mc("Why are grating maxima sharper than ordinary two-slit fringes?", ["many slits reinforce the principal maxima and cancel strongly between them", "gratings remove coherence requirements", "gratings make wavelength irrelevant", "only gratings can produce first order"], 0, "Many-slit interference narrows the bright maxima.", hint),
    ...shortCases([
      { prompt: "A diffraction grating contains many equally spaced ...", acceptedAnswers: ["slits"], hint: "That is the physical structure." },
      { prompt: "The spacing between adjacent slits is called the grating ...", acceptedAnswers: ["spacing"], hint: "Use the standard d term." },
      { prompt: "In n lambda = d sin theta, the symbol n labels the diffraction ...", acceptedAnswers: ["order"], hint: "That is the counting term." },
      { prompt: "To find slit spacing from lines per metre, take the ... of the line density.", acceptedAnswers: ["reciprocal", "inverse"], hint: "d = 1 / line density." },
      { prompt: "The central maximum is the ... order.", acceptedAnswers: ["zero", "0"], hint: "It is undeviated." },
      { prompt: "A forbidden order would require sin theta to be greater than ...", acceptedAnswers: ["1", "one"], hint: "That is the trig limit." },
      { prompt: "More lines per millimetre means smaller slit ...", acceptedAnswers: ["spacing", "separation"], hint: "The density rises as d falls." },
      { prompt: "Grating questions turn wavelength into a measurable diffraction ...", acceptedAnswers: ["angle"], hint: "That is the key observable." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Explain orders through many-slit interference, spacing, wavelength, and angle.";
  return [
    mc("Why do diffraction gratings produce discrete orders instead of a random spread of bright directions?", ["only certain angles satisfy the path-difference condition for constructive interference", "the grating removes wavelength from the calculation", "angles are chosen by the screen position alone", "higher orders are arbitrary labels"], 0, "The condition n lambda = d sin(theta) selects the allowed directions.", hint),
    mc("Why must lines per mm be converted into a spacing before the main formula is used?", ["because the grating equation needs d, the slit spacing in metres", "because line density and wavelength have the same units", "because the formula works only in millimetres", "because theta is measured in line density"], 0, "The equation uses spacing, not density directly.", hint),
    mc("Why is a higher order found at a larger angle for the same wavelength and grating?", ["a larger order needs a larger path difference and therefore a larger sin(theta)", "higher order means lower wavelength", "angle depends only on brightness", "higher order means the central maximum disappears"], 0, "Order number scales the allowed path difference.", hint),
    mc("A student says 'order 3 is impossible because the line would be too dim.' What is the better correction?", ["an order is impossible only if the geometry would require sin(theta) > 1", "brightness always decides whether an order exists", "order number changes the refractive index", "dim lines are never real maxima"], 0, "Existence is a geometry and wavelength question, not a brightness guess.", hint),
    mc("Why is a diffraction grating useful for wavelength measurement?", ["the bright-order angles can be linked quantitatively to lambda through the grating spacing", "wavelength can only be guessed visually", "the grating equation does not depend on wavelength", "gratings work only for monochromaticity, not measurement"], 0, "Angle and known spacing let you solve for lambda.", hint),
    mc("Why do many slits make the bright maxima narrower and more precise?", ["waves from many slits reinforce strongly only near the exact allowed directions", "many slits increase the wave speed", "many slits remove the need for coherence", "many slits make every angle equally bright"], 0, "Extra slits sharpen the constructive directions and deepen the cancellations between them.", hint),
    mc("Why is it weak to answer a grating question with 'the spectrum spreads out more' only?", ["the explanation should connect the spread to wavelength, slit spacing, and the order condition", "spread alone proves the source is incoherent", "spreading removes the need for equations", "spectra never depend on grating spacing"], 0, "A mechanism answer keeps the formula meaning visible.", hint),
    mc("Why is the zero-order beam not enough to determine wavelength?", ["its angle is zero for every wavelength at normal incidence", "zero order depends only on screen distance", "zero order exists only for lasers", "zero order automatically equals the first order"], 0, "You need the higher-order geometry to distinguish wavelengths.", hint),
    mc("Why should an answer mention normal incidence or the chosen setup assumptions before calculating?", ["because the standard grating formula assumes a particular geometry", "because assumptions remove the need for units", "because order number determines the apparatus", "because only zero order needs assumptions"], 0, "The formula is tied to a specific geometry model.", hint),
    mc("Why does decreasing d increase the angular spread for the same wavelength set?", ["the same order condition needs a larger angle when the slit spacing is smaller", "smaller d decreases wavelength", "smaller d destroys constructive interference", "d matters only for the central maximum"], 0, "Smaller spacing pushes the allowed maxima further out.", hint),
    mc("Which statement best protects the A3_L4 lesson meaning?", ["A diffraction grating sends light into discrete orders because only certain angles satisfy the many-slit path-difference condition for a given spacing and wavelength.", "A grating acts mainly by increasing brightness at every angle.", "Order number is just a label with no geometric meaning.", "The pattern can be explained without comparing wavelength and slit spacing."], 0, "That statement keeps the geometry and interference mechanism visible.", hint),
    mc("Why is it safer to reject impossible orders mathematically than by eye?", ["the trig limit on sin(theta) is the rigorous physical test", "forbidden orders are determined only by the colour of the light", "if the line looks faint, it is impossible", "the screen position alone decides the maximum order"], 0, "The allowed-order check is a calculation, not a visual guess.", hint),
    ...shortCases([
      { prompt: "Allowed grating directions come from the path-difference ...", acceptedAnswers: ["condition"], hint: "That is the constructive-interference rule." },
      { prompt: "A grating question compares wavelength with slit ...", acceptedAnswers: ["spacing", "separation"], hint: "That is the d term." },
      { prompt: "More slits make the principal maxima more ...", acceptedAnswers: ["sharp", "sharper", "narrow"], hint: "That is the many-slit benefit." },
      { prompt: "The highest possible order is limited by the sine ...", acceptedAnswers: ["limit", "condition"], hint: "sin(theta) cannot exceed 1." },
      { prompt: "To extract wavelength, the measured quantity is usually an order ...", acceptedAnswers: ["angle"], hint: "That is the geometry output." },
      { prompt: "Line density and slit spacing are ... quantities.", acceptedAnswers: ["reciprocal", "inverse"], hint: "One rises as the other falls." },
      { prompt: "A strong A3_L4 answer keeps the spacing-wavelength mechanism ...", acceptedAnswers: ["visible", "clear"], hint: "That is the audit goal." },
      { prompt: "Order zero corresponds to the beam that is not ...", acceptedAnswers: ["deviated", "bent"], hint: "It travels straight through." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Keep speed change, refractive index, critical angle, and TIR in one boundary story.";
  return [
    mc("What causes refraction at a boundary?", ["a change in wave speed between the two media", "a sideways force pulling the ray", "a change in frequency at the boundary", "the colour of the source only"], 0, "Refraction is caused by speed changing across media.", hint),
    mc("When light travels from air into glass, how does it bend?", ["toward the normal", "away from the normal", "it does not bend at all", "it reflects totally"], 0, "Entering the optically denser medium makes the ray bend toward the normal.", hint),
    mc("When light travels from glass into air at an angle below the critical angle, how does it bend?", ["away from the normal", "toward the normal", "not at all", "it must totally internally reflect"], 0, "Leaving the denser medium for the less dense one bends the ray away from the normal.", hint),
    mc("What happens to the frequency of light when it refracts into a different medium?", ["it stays the same", "it increases in a denser medium", "it decreases in a denser medium", "it becomes zero at the boundary"], 0, "Frequency is fixed by the source; speed and wavelength change instead.", hint),
    mc("What happens to the wavelength of light when it enters a denser medium?", ["it decreases", "it increases", "it stays the same", "it becomes infinite"], 0, "Lower speed with unchanged frequency means shorter wavelength.", hint),
    mc("How is the critical angle defined?", ["the angle of incidence in the denser medium that gives a refracted angle of 90 degrees", "the angle at which reflection first disappears", "the angle of refraction in air when light enters glass", "the angle where frequency changes"], 0, "The refracted ray grazes the boundary at the critical angle.", hint),
    mc("What two conditions are required for total internal reflection?", ["light travels from higher refractive index to lower refractive index, and the incident angle exceeds the critical angle", "light travels from lower refractive index to higher refractive index, and the incident angle exceeds the critical angle", "the refracted angle is less than the incident angle, and the wavelength increases", "the frequency changes at the boundary, and the angle is large"], 0, "Both the direction of travel and the angle threshold matter.", hint),
    mc("For glass of refractive index 1.5 in air, what is the critical angle?", ["about 42 degrees", "about 30 degrees", "about 60 degrees", "about 75 degrees"], 0, "sin(c) = 1 / 1.5, so c is about 41.8 degrees.", hint),
    mc("A ray travels from glass to air with an incident angle of 30 degrees. What happens?", ["it refracts out into the air", "it totally internally reflects", "it stops at the boundary", "it must bend toward the normal"], 0, "30 degrees is below the critical angle for glass-air, so the ray refracts out.", hint),
    mc("A ray travels from glass to air with an incident angle of 50 degrees. What happens?", ["it totally internally reflects", "it refracts away from the normal", "it bends toward the normal", "it keeps the same direction"], 0, "50 degrees is above the critical angle, so TIR occurs.", hint),
    mc("Can total internal reflection happen when light goes from air into glass?", ["no, because the light is going from lower to higher refractive index", "yes, if the angle is bigger than 90 degrees", "yes, for any angle above the critical angle", "only if the wavelength stays the same"], 0, "TIR requires travel from higher n to lower n.", hint),
    mc("Which relation is Snell's law?", ["n1 sin(theta1) = n2 sin(theta2)", "n lambda = d sin(theta)", "f = 1 / T", "V = I R"], 0, "Snell's law is the boundary-angle relation for refraction.", hint),
    ...shortCases([
      { prompt: "Refraction is caused by a change in wave ...", acceptedAnswers: ["speed"], hint: "That is the mechanism to name." },
      { prompt: "On entering a denser medium, light bends ... the normal.", acceptedAnswers: ["toward", "towards"], hint: "That is the standard direction change." },
      { prompt: "On leaving a denser medium for a less dense one, light bends ... the normal.", acceptedAnswers: ["away from"], hint: "That is the outward bend." },
      { prompt: "The incident angle that gives a 90 degree refracted ray is the ... angle.", acceptedAnswers: ["critical"], hint: "Use the threshold name." },
      { prompt: "Beyond the critical angle in the correct direction of travel, the effect is total internal ...", acceptedAnswers: ["reflection"], hint: "That is the trapped-ray case." },
      { prompt: "Across refraction, light frequency stays the ...", acceptedAnswers: ["same", "constant"], hint: "The source fixes it." },
      { prompt: "Across refraction into a denser medium, wavelength becomes ...", acceptedAnswers: ["shorter", "smaller"], hint: "Speed falls while frequency stays fixed." },
      { prompt: "TIR requires travel from higher refractive index to ... refractive index.", acceptedAnswers: ["lower", "smaller"], hint: "That is the direction requirement." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Explain boundary behavior through speed, refractive index, and the critical-angle threshold.";
  return [
    mc("Why is it weak to say 'light bends because the surface pushes it'?", ["the more rigorous explanation is that the wave changes speed when it enters a medium with a different refractive index", "surfaces never affect light at all", "only mirrors can change direction", "frequency is the only thing that changes"], 0, "Refraction is explained through speed and index, not a sideways force picture.", hint),
    mc("Why does the frequency stay the same when light crosses a boundary?", ["the source fixes the oscillation rate, while speed and wavelength adjust to the new medium", "the boundary removes all phase information", "frequency depends only on angle of incidence", "frequency changes but detectors cannot see it"], 0, "Frequency continuity is a central part of refraction reasoning.", hint),
    mc("Why must the critical angle be defined in the denser medium?", ["because only the higher-to-lower refractive-index direction can produce the grazing-out threshold that leads to TIR", "because all media have the same critical angle", "because critical angle depends only on frequency", "because air has no refractive index"], 0, "The threshold belongs to the dense-to-less-dense route.", hint),
    mc("Why is the critical angle called the 'last escape case'?", ["at that incident angle the refracted ray is exactly along the boundary before TIR begins for larger angles", "it is the largest angle at which reflection can happen", "it makes the reflected ray vanish", "it is the only angle where frequency changes"], 0, "The refracted ray just grazes the interface at c.", hint),
    mc("Why can total internal reflection not be explained by angle alone?", ["the direction of travel between the media must also be correct", "every large angle gives TIR in any pair of media", "angle matters only for sound", "TIR happens whenever brightness is high"], 0, "You need both the threshold and the correct higher-to-lower index route.", hint),
    mc("A learner says 'light bent toward the normal, so the frequency must have gone up.' What is the correction?", ["bending toward the normal indicates lower speed and shorter wavelength in the denser medium, not a frequency change", "toward the normal always means higher frequency", "frequency is controlled by refractive index only", "frequency disappears in a denser medium"], 0, "Keep frequency separate from speed and wavelength.", hint),
    mc("Why is Snell's law stronger than a verbal rule like 'toward the normal'?", ["it quantifies the angle change and keeps the refractive-index comparison explicit", "it works only for total internal reflection", "it replaces the need to identify the media", "it ignores the speed change mechanism"], 0, "The equation makes the boundary story calculable.", hint),
    mc("Why should a TIR answer mention the critical angle before naming the reflection?", ["because TIR is a threshold case that begins only after the grazing-out limit is passed", "because the critical angle is always larger than 90 degrees", "because TIR does not involve refractive index", "because critical angle only matters for mirrors"], 0, "The threshold is the mechanism pivot point.", hint),
    mc("Why is it incomplete to say 'glass is denser, so light bends more'?", ["the explanation should also connect denser optical medium to refractive index, lower speed, and the specific boundary angle change", "density alone replaces the need for the normal", "mass density is the only quantity that matters", "bending happens even if the speed is unchanged"], 0, "A rigorous optics answer keeps the speed/index link visible.", hint),
    mc("Why does wavelength change at refraction even though frequency does not?", ["because v = f lambda and the speed changes in the new medium", "because wavelength is independent of speed", "because wavelength changes only during reflection", "because Snell's law forces the source frequency to change"], 0, "With f fixed, lambda must follow the new speed.", hint),
    mc("Which statement best protects the A3_L5 lesson meaning?", ["Refraction and total internal reflection belong to one boundary story in which wave speed changes, frequency stays fixed, and the critical angle marks the last escape case.", "Refraction is mainly about the boundary pushing the ray sideways.", "TIR can happen whenever the incident angle is large, regardless of direction of travel.", "The critical angle is the angle where the reflected ray becomes 90 degrees."], 0, "That statement keeps the full mechanism visible.", hint),
    mc("Why should a worked example identify the initial and final media before using equations?", ["because the angle behavior and even whether TIR is possible depend on which medium the ray starts in", "because refractive index does not belong in the equation", "because the normal changes from one medium to another", "because the source frequency depends on the medium order"], 0, "The media order controls the physical interpretation.", hint),
    ...shortCases([
      { prompt: "A rigorous refraction answer starts with a change in wave ...", acceptedAnswers: ["speed"], hint: "That is the mechanism word." },
      { prompt: "Across a boundary, the source keeps the frequency ...", acceptedAnswers: ["constant", "same"], hint: "That is the quantity that does not change." },
      { prompt: "The critical angle is the ... escape case.", acceptedAnswers: ["last", "final"], hint: "That is the lesson phrase." },
      { prompt: "Total internal reflection needs the correct direction of ...", acceptedAnswers: ["travel"], hint: "Angle alone is not enough." },
      { prompt: "Snell's law keeps the refractive-index comparison ...", acceptedAnswers: ["explicit", "visible"], hint: "That is why it is stronger than a slogan." },
      { prompt: "When speed falls at fixed frequency, wavelength must ...", acceptedAnswers: ["decrease", "shorten", "become shorter"], hint: "Use v = f lambda." },
      { prompt: "A strong A3_L5 answer keeps the threshold mechanism ...", acceptedAnswers: ["visible", "clear"], hint: "That is the audit goal." },
      { prompt: "TIR begins only when the incident angle is ... the critical angle.", acceptedAnswers: ["above", "greater than"], hint: "That is the threshold comparison." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Read the oscilloscope as a voltage-time graph before calculating.";
  return [
    mc("What quantity is plotted on the vertical axis of an oscilloscope trace?", ["voltage", "time", "distance", "frequency"], 0, "The vertical axis shows voltage.", hint),
    mc("What quantity is plotted on the horizontal axis of an oscilloscope trace?", ["time", "voltage", "distance", "wavelength"], 0, "The horizontal axis is the time base.", hint),
    mc("A sinusoidal trace is 4 divisions high peak-to-peak on a setting of 2 V/div. What is Vpp?", ["8 V", "4 V", "2 V", "16 V"], 0, "Vpp = 4 x 2 V = 8 V.", hint),
    mc("If Vpp is 8 V, what is the peak voltage Vpeak?", ["4 V", "8 V", "2 V", "5.7 V"], 0, "Peak voltage is half the peak-to-peak value.", hint),
    mc("One full cycle covers 5 horizontal divisions on a 0.2 ms/div setting. What is the period?", ["1.0 ms", "0.2 ms", "2.5 ms", "5.0 ms"], 0, "T = 5 x 0.2 ms = 1.0 ms.", hint),
    mc("If the period is 1.0 ms, what is the frequency?", ["1000 Hz", "100 Hz", "500 Hz", "10 000 Hz"], 0, "f = 1 / T = 1 / 0.001 s = 1000 Hz.", hint),
    mc("A sinusoidal trace has Vpp = 10 V. What is the rms voltage?", ["about 3.5 V", "about 7.1 V", "10 V", "5 V"], 0, "Vpeak = 5 V, so Vrms = 5 / sqrt(2) ≈ 3.54 V.", hint),
    mc("What does a flat horizontal trace above the center line represent?", ["a constant DC voltage", "zero voltage only", "a higher frequency AC voltage", "total internal reflection"], 0, "A steady non-zero voltage appears as a horizontal line offset from zero.", hint),
    mc("Why is an oscilloscope trace not a picture of the wave's route through space?", ["because it is a graph of voltage against time", "because waves cannot be measured", "because the vertical axis is wavelength", "because the trace shows only current"], 0, "The trace is a time graph, not a spatial path.", hint),
    mc("If the volts-per-division setting is reduced while the input signal stays the same, what happens to the displayed trace height?", ["it becomes taller in divisions", "it becomes shorter in divisions", "it stays the same", "it disappears"], 0, "Smaller volts/div means the same voltage uses more vertical divisions.", hint),
    mc("If the time-per-division setting is reduced while the input signal stays the same, what happens to the width of one cycle in divisions?", ["it becomes wider in divisions", "it becomes narrower in divisions", "it stays the same", "it becomes impossible to display"], 0, "Smaller time/div means the same period occupies more horizontal divisions.", hint),
    mc("Which formula should be used after reading the period from an oscilloscope trace?", ["f = 1 / T", "V = I R", "lambda = v / f", "n lambda = d sin(theta)"], 0, "Once the period is known, frequency follows by inversion.", hint),
    ...shortCases([
      { prompt: "The horizontal axis setting on an oscilloscope is the time ...", acceptedAnswers: ["base"], hint: "That is the sweep control name." },
      { prompt: "The full vertical height of one sinusoidal cycle is called the peak-to-peak ...", acceptedAnswers: ["voltage", "value"], hint: "Use the Vpp phrase." },
      { prompt: "The top value above the center line is the ... voltage.", acceptedAnswers: ["peak"], hint: "It is half of Vpp." },
      { prompt: "One complete cycle takes one ...", acceptedAnswers: ["period"], hint: "That is the timing word." },
      { prompt: "Frequency is the reciprocal of the ...", acceptedAnswers: ["period"], hint: "Use f = 1 / T." },
      { prompt: "An oscilloscope trace is a graph against ...", acceptedAnswers: ["time"], hint: "That is why it is not a path-in-space picture." },
      { prompt: "For a sinusoidal AC trace, rms voltage is smaller than ... voltage.", acceptedAnswers: ["peak"], hint: "Vrms = Vpeak / sqrt(2)." },
      { prompt: "A flat line above zero indicates a steady ... voltage.", acceptedAnswers: ["dc", "direct current"], hint: "Use the non-alternating label." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Keep the axes, trace meaning, and voltage-time calculations explicit.";
  return [
    mc("Why should a learner label the oscilloscope axes before doing any calculation?", ["because the graph only makes sense once voltage and time are not confused", "because the axes change the input signal", "because frequency is plotted vertically", "because Vpp is read horizontally"], 0, "Misreading the axes causes most oscilloscope errors.", hint),
    mc("Why is Vpp not the same thing as Vpeak?", ["Vpp spans from the top peak to the bottom peak, while Vpeak is measured from the center line to one peak", "Vpp is used only for DC traces", "Vpeak is always twice Vpp", "Vpp and Vpeak differ only when frequency changes"], 0, "The full height is twice the single-sided peak.", hint),
    mc("Why must period be read from the horizontal spacing rather than the vertical height?", ["period is a time quantity, and time is on the horizontal axis", "horizontal spacing gives voltage", "vertical height gives wavelength only", "period can be read from either axis equally"], 0, "The axis meaning determines which measurement belongs to which quantity.", hint),
    mc("Why is a flat non-zero line best described as a constant voltage rather than 'no wave'?", ["the trace still shows a voltage-time state, just one that does not vary with time", "flat traces always mean the oscilloscope is broken", "a flat trace means infinite frequency", "a flat trace has no measurable voltage"], 0, "Zero variation is not the same as zero value.", hint),
    mc("Why is it incomplete to describe a trace as 'the wave shape' without more explanation?", ["the trace is specifically a graph of voltage against time, not a picture of the wave propagating through space", "the trace gives wavelength directly", "the trace is independent of the signal source", "the trace applies only to DC"], 0, "The representation must be interpreted correctly.", hint),
    mc("Why does changing the time base alter the displayed width but not the actual signal frequency?", ["the oscilloscope is changing the graph scale, not the source signal itself", "the source frequency always follows the time base setting", "time base changes the input voltage", "frequency depends only on volts per division"], 0, "Display settings change representation, not the signal.", hint),
    mc("Why is rms voltage used instead of peak voltage for AC power comparisons?", ["it gives the DC-equivalent value for heating or power effect", "it is always larger than the peak voltage", "it depends only on frequency", "it removes the need for a waveform shape"], 0, "Rms compares AC with the equivalent DC effect.", hint),
    mc("Why is a trace-reading answer stronger when it states the divisions and the scale together?", ["because the measured voltage or time comes from both the count and the scale", "because scale settings are only decorative", "because divisions matter only for AC", "because the center line fixes frequency automatically"], 0, "Raw division count without scale is incomplete.", hint),
    mc("A learner says 'the signal is taller, so the frequency is larger.' What is the correction?", ["vertical height tells voltage amplitude, while frequency comes from horizontal timing", "taller traces always mean shorter period", "frequency is measured on the vertical axis", "height and frequency are the same quantity"], 0, "Amplitude and frequency are read from different axes.", hint),
    mc("Why should an A3_L6 answer mention whether the trace is sinusoidal before using Vrms = Vpeak / sqrt(2)?", ["because that relation is the standard sinusoidal AC result", "because Vrms never depends on waveform shape", "because only DC traces have rms values", "because sinusoidal traces have no period"], 0, "The rms relation used here is tied to the sinusoidal case.", hint),
    mc("Which statement best protects the A3_L6 lesson meaning?", ["An oscilloscope is a voltage-time graph, so the trace must be read through the axis scales before calculating Vpp, period, frequency, or rms values.", "An oscilloscope shows the path the wave takes through space.", "Frequency is read from the tallest part of the trace.", "A flat line always means zero voltage."], 0, "That statement keeps the representation and the calculations correctly aligned.", hint),
    mc("Why is 'just count the squares' an incomplete oscilloscope method?", ["the square count must still be paired with volts per division or time per division to give a physical quantity", "square count is enough because scales never matter", "counting squares measures wavelength directly", "only one square is needed for all traces"], 0, "Scale information turns divisions into physics.", hint),
    ...shortCases([
      { prompt: "Before calculations, the oscilloscope axes should be kept ...", acceptedAnswers: ["clear", "labeled", "labelled"], hint: "That prevents mix-ups." },
      { prompt: "Vpp is the full peak-to-peak height, while Vpeak is the ...-sided value.", acceptedAnswers: ["single", "one"], hint: "It is measured from the center line." },
      { prompt: "Frequency comes from horizontal ... information.", acceptedAnswers: ["timing", "time"], hint: "That is what the period uses." },
      { prompt: "Amplitude comes from the vertical ... information.", acceptedAnswers: ["voltage"], hint: "That is the y-axis reading." },
      { prompt: "Changing the display scale does not change the source ...", acceptedAnswers: ["signal", "frequency", "voltage"], hint: "It changes the representation only." },
      { prompt: "For sinusoidal AC, rms gives the DC-equivalent ... effect.", acceptedAnswers: ["heating", "power"], hint: "That is why it is useful." },
      { prompt: "A strong A3_L6 answer keeps the graph meaning ...", acceptedAnswers: ["visible", "clear"], hint: "Do not treat the trace as a picture only." },
      { prompt: "A trace is a voltage-time ... rather than a path-in-space sketch.", acceptedAnswers: ["graph"], hint: "That is the key representation word." },
    ]),
  ];
}

const A3_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A3_L1: l1DiagnosticRaw,
  A3_L2: l2DiagnosticRaw,
  A3_L3: l3DiagnosticRaw,
  A3_L4: l4DiagnosticRaw,
  A3_L5: l5DiagnosticRaw,
  A3_L6: l6DiagnosticRaw,
};

const A3_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A3_L1: l1ConceptRaw,
  A3_L2: l2ConceptRaw,
  A3_L3: l3ConceptRaw,
  A3_L4: l4ConceptRaw,
  A3_L5: l5ConceptRaw,
  A3_L6: l6ConceptRaw,
};

const A3_MASTERY_BUILDERS: Record<string, () => RawItem[]> = Object.fromEntries(
  Object.keys(A3_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A3_DIAGNOSTIC_BUILDERS[code](), ...A3_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawItem[]>;

export function a3GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A3_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a3GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A3_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a3GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A3_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
