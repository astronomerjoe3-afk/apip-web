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
  hint = "Rebuild the quantum rule before choosing.",
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
    throw new Error(`A2 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function l1DiagnosticRaw(): RawItem[] {
  const hint = "Use the discrete-energy ladder, not a continuous-ramp picture.";
  return [
    mc("Which statement best matches a quantized atomic energy model?", ["electrons occupy specific allowed levels only", "electrons can rest at any energy between zero and infinity", "electrons absorb half a photon if the gap is slightly too large", "the atomic energy always changes continuously"], 0, "Quantization means the electron is restricted to allowed levels.", hint),
    mc("What must happen for an electron to move from one allowed level to a higher one?", ["it must absorb a packet whose energy matches the gap", "it must absorb any amount of light for long enough", "it must be closer to the nucleus", "it must first emit a photon"], 0, "The packet has to match the allowed energy difference.", hint),
    mc("What happens if an incoming photon has slightly less energy than the required gap?", ["no transition occurs", "a partial transition occurs", "the electron moves halfway and stops", "the atom ionises immediately"], 0, "Atomic transitions are all-or-nothing for allowed gaps.", hint),
    mc("What is the ground state?", ["the lowest allowed energy level", "the highest allowed energy level", "the ionised state", "the continuous band between levels"], 0, "Ground state means the lowest bound level.", hint),
    mc("An electron falls from a higher level to a lower level. What happens to the atom?", ["it emits a photon", "it absorbs a photon", "it becomes a positron", "its proton number changes"], 0, "Downward transitions release the energy gap as radiation.", hint),
    mc("If the energy gap between two levels doubles, what happens to the required photon frequency?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Delta E = h f, so frequency is proportional to the gap.", hint),
    mc("If the gap between two levels increases, what happens to the emitted wavelength from that transition?", ["it becomes shorter", "it becomes longer", "it stays the same", "it becomes infinite"], 0, "Larger photon energy means shorter wavelength.", hint),
    mc("What is an excited state?", ["a higher allowed bound level above the ground state", "the same as ionisation", "a forbidden level", "a state with zero energy"], 0, "Excitation keeps the electron bound but at a higher level.", hint),
    mc("Which formula links a level gap to the photon frequency for a transition?", ["Delta E = h f", "V = I R", "p = m v", "F = m a"], 0, "Photon energy equals the transition gap.", hint),
    mc("Which formula links a transition energy to photon wavelength?", ["Delta E = h c / lambda", "Q = I t", "p = F / A", "v = f lambda"], 0, "This is the wavelength form of photon energy.", hint),
    mc("Why does a line spectrum support the energy-ladder model rather than a continuous-ramp model?", ["only specific gaps are allowed, so only specific photon energies appear", "atoms emit every possible wavelength equally", "electrons move continuously through every energy", "the spectrum ignores atomic structure"], 0, "Discrete lines come from discrete energy differences.", hint),
    mc("If a student says 'the electron absorbed some of the photon energy and rose part way', what is the correction?", ["allowed transitions do not end between levels", "electrons always absorb half the packet first", "the electron must lose charge before rising", "only visible photons can cause transitions"], 0, "The atom either makes the allowed jump or it does not.", hint),
    ...shortCases([
      { prompt: "The lowest allowed atomic level is the ... state.", acceptedAnswers: ["ground", "ground state"], hint: "Use the standard lowest-level term." },
      { prompt: "An electron at a higher allowed but still bound level is in an ... state.", acceptedAnswers: ["excited", "excited state"], hint: "It is higher than the ground state but still bound." },
      { prompt: "Atomic energy levels are ... rather than continuous.", acceptedAnswers: ["discrete", "quantized", "quantised"], hint: "Use the ladder idea." },
      { prompt: "An upward transition happens when the atom ... a matching photon.", acceptedAnswers: ["absorbs", "absorbs energy"], hint: "The packet must be taken in." },
      { prompt: "A downward transition causes the atom to ... a photon.", acceptedAnswers: ["emit", "emit energy", "release"], hint: "The atom gives the gap energy back out." },
      { prompt: "If the packet energy does not match the gap, the safest first outcome is ... transition.", acceptedAnswers: ["no", "no transition"], hint: "There is no partial level." },
      { prompt: "The energy difference between two levels is written as ... E.", acceptedAnswers: ["delta", "Delta", "Delta E"], hint: "Use the change symbol wording." },
      { prompt: "Larger gap means higher photon frequency and ... wavelength.", acceptedAnswers: ["shorter"], hint: "Energy and wavelength move oppositely here." },
    ]),
  ];
}

function l1ConceptRaw(): RawItem[] {
  const hint = "Explain the outcome using exact packet-gap matching.";
  return [
    mc("Why is a continuous-ramp picture weak for atomic electrons?", ["it would predict a continuous spread of emitted energies instead of discrete transitions", "it would make Planck's constant zero", "it would force all electrons into the ground state", "it would prevent photons from carrying energy"], 0, "Discrete spectra need discrete atomic levels.", hint),
    mc("Why is 'close enough' photon energy not accepted in the ladder model?", ["the transition requires an exact allowed energy difference", "atoms always round energies to the nearest value", "frequency is not linked to energy", "the electron can store the leftover part without changing level"], 0, "The gap is exact, not approximate.", hint),
    mc("Why does a higher excited state not count as ionisation?", ["the electron is still bound to the atom", "the atom has lost its nucleus", "the electron now has zero energy", "photons cannot be emitted from excited states"], 0, "Ionisation means full escape, not a higher bound state.", hint),
    mc("A student says brighter light must always produce a larger upward jump. What is the correction in this lesson?", ["brightness does not replace the exact energy-match rule", "brightness changes Planck's constant", "brightness changes proton number", "brighter light always ionises the atom"], 0, "This lesson protects packet size from beam count language.", hint),
    mc("Why is the ground state kept visible in worked examples?", ["it provides a fixed reference for comparing upward and downward transitions", "it is the only state that can emit light", "it proves all atoms are neutral", "it makes the wavelength formula unnecessary"], 0, "The ground state is the base rung of the ladder.", hint),
    mc("Why is it safer to say 'allowed level' instead of just 'height' in A2_L1?", ["it keeps the idea tied to discrete atomic states rather than a continuous climb", "height automatically means wavelength", "all allowed levels have equal energy spacing", "height decides the photon charge"], 0, "The lesson is about allowed states, not arbitrary positions.", hint),
    mc("Which statement best protects the lesson meaning?", ["the atom changes state only when the photon energy matches an allowed difference", "any absorbed light raises the electron if the lamp is bright enough", "electrons can rest between levels for a short time", "transition size depends only on colour names"], 0, "This keeps the discrete-state rule visible.", hint),
    mc("Why do line spectra become believable once the ladder model is accepted?", ["each line can be read as one allowed gap rather than a random colour", "spectra no longer depend on energy", "lines prove photons are charged", "atoms must all have the same gap pattern"], 0, "The ladder model explains why lines are discrete.", hint),
    mc("Why is the statement 'the electron absorbed some energy, so it must have moved up a bit' not rigorous?", ["the new state must still be one of the allowed levels", "electrons always move up after any collision", "all absorbed energy becomes kinetic energy only", "atomic levels are only useful for ground states"], 0, "There is no 'in-between' allowed state.", hint),
    mc("Why can one atom give repeated photons of the same frequency from the same transition?", ["the level gap is fixed for that transition", "the atom forgets the previous transition", "frequency is chosen randomly by intensity", "all excited states have equal energy"], 0, "Same gap means same photon energy each time.", hint),
    mc("A learner says 'Delta E = h f means the photon causes the gap to change size.' What is the better reading?", ["the photon energy matches the fixed gap between the chosen levels", "the photon changes h", "the photon changes the electron charge", "the formula only works for ionisation"], 0, "The formula compares packet energy with the existing allowed difference.", hint),
    mc("Why is it helpful to link frequency and wavelength to the same gap?", ["it stops students from treating colour and energy as separate unrelated stories", "it proves all photons travel at different speeds in vacuum", "it removes the need for Planck's constant", "it shows longer wavelength always means more energy"], 0, "Frequency and wavelength are two views of the same photon energy.", hint),
    mc("Why should the answer mention 'discrete levels' before quoting formulas?", ["the formula only makes sense after the physical model is clear", "formulas and models are unrelated", "the formula automatically proves the gap is continuous", "discrete levels are only needed for nuclear physics"], 0, "The equation is a bridge, not the whole explanation.", hint),
    mc("Which explanation is strongest?", ["The atom has fixed allowed levels, so only a matching photon energy can move the electron between them.", "The atom climbs continuously until the photon runs out.", "The electron stores extra energy between levels until another photon arrives.", "The transition depends mainly on lamp brightness."], 0, "This is the clearest lesson summary.", hint),
    ...shortCases([
      { prompt: "A continuous-ramp model would predict a ... spread of photon energies instead of lines.", acceptedAnswers: ["continuous", "continuous range"], hint: "That is why it fails." },
      { prompt: "The phrase that keeps this lesson honest is exact energy ...", acceptedAnswers: ["match", "matching"], hint: "Use the packet-gap rule." },
      { prompt: "An excited level is still ... to the atom.", acceptedAnswers: ["bound"], hint: "It has not escaped." },
      { prompt: "A spectrum line can be read back to one allowed energy ...", acceptedAnswers: ["gap", "difference"], hint: "That is the ladder link." },
      { prompt: "The ground state is the lesson's fixed ... level.", acceptedAnswers: ["reference", "starting", "lowest"], hint: "It anchors comparisons." },
      { prompt: "The safe A2_L1 model is discrete levels plus photon-packet ...", acceptedAnswers: ["matching", "match"], hint: "That is the core mechanism." },
    ]),
  ];
}

function l2DiagnosticRaw(): RawItem[] {
  const hint = "Tie each line to a transition and the corresponding photon energy.";
  return [
    mc("What produces an emission line in an atom?", ["an electron falling to a lower level", "an electron staying at the same level", "a nucleus losing a proton", "a photon below threshold frequency"], 0, "Emission comes from a downward transition.", hint),
    mc("What produces an absorption line?", ["an electron absorbing a photon and moving to a higher level", "an electron dropping to the ground state", "a charged particle changing direction", "a continuous spread of energies"], 0, "Absorption is the upward version of the same gap story.", hint),
    mc("Why are atomic spectra line spectra rather than continuous rainbows?", ["only specific level differences are allowed", "all atoms emit the same colour", "photons have no wavelength", "electrons can use any energy continuously"], 0, "Discrete gaps make discrete lines.", hint),
    mc("Two atoms have different sets of allowed energy gaps. What should you expect about their line spectra?", ["they should have different line patterns", "they must have the same line pattern", "both should give continuous spectra", "only one atom can emit lines"], 0, "Different gaps mean different photon energies.", hint),
    mc("Which formula links a spectral line to the level gap?", ["Delta E = h f", "Q = I t", "p = m v", "F = q E"], 0, "The line comes from photon energy matching the gap.", hint),
    mc("If the transition gap is larger, what happens to the emitted photon frequency?", ["it is larger", "it is smaller", "it is unchanged", "it becomes zero"], 0, "Frequency increases with photon energy.", hint),
    mc("If two transitions have the same energy gap, what should be true about the photons involved?", ["they have the same frequency and wavelength", "they must come from different atoms only", "they have opposite charges", "they travel at different vacuum speeds"], 0, "Same gap gives the same photon energy.", hint),
    mc("Which statement about absorption and emission is correct?", ["they are opposite uses of the same allowed energy gaps", "absorption uses continuous energies but emission does not", "emission can happen without level differences", "absorption proves levels are not quantized"], 0, "Both trace the same level structure.", hint),
    mc("What happens to photon wavelength when the level gap increases?", ["it becomes shorter", "it becomes longer", "it stays fixed", "it becomes unrelated to energy"], 0, "Higher energy photons have shorter wavelength.", hint),
    mc("Why can a line spectrum act like a fingerprint of an element?", ["its allowed gaps are specific to the atom's structure", "every atom has the same line pattern", "only hydrogen emits light", "line colour depends only on intensity"], 0, "Different atomic structures give different gap patterns.", hint),
    mc("A hot low-pressure gas gives bright lines, while a cool gas in front of a continuous source gives dark lines. What connects the two cases?", ["both are governed by the same allowed transition energies", "the dark lines come from nuclear reactions only", "bright and dark lines are unrelated phenomena", "only bright lines support quantization"], 0, "Emission and absorption are two views of the same level spacings.", hint),
    mc("A transition produces a red line with longer wavelength than a blue line from the same atom. What is true about the red-line transition?", ["it has the smaller energy gap", "it has the larger energy gap", "it must be an absorption line", "it cannot be caused by an electron transition"], 0, "Longer wavelength means lower photon energy.", hint),
    ...shortCases([
      { prompt: "A downward transition produces an ... line.", acceptedAnswers: ["emission", "emission spectrum line", "emission line"], hint: "That is the light-giving case." },
      { prompt: "An upward transition that removes one colour from a continuous spectrum gives an ... line.", acceptedAnswers: ["absorption", "absorption line"], hint: "That is the missing-colour case." },
      { prompt: "Line spectra support ... energy levels.", acceptedAnswers: ["discrete", "quantized", "quantised"], hint: "Use the atomic-level idea." },
      { prompt: "A larger energy gap means a ... photon frequency.", acceptedAnswers: ["higher", "greater"], hint: "Use Delta E = h f." },
      { prompt: "A larger energy gap means a ... photon wavelength.", acceptedAnswers: ["shorter"], hint: "Energy and wavelength move oppositely." },
      { prompt: "Each spectral line maps back to one energy ...", acceptedAnswers: ["gap", "difference"], hint: "That is the ladder link." },
      { prompt: "Different atoms have different spectral ...", acceptedAnswers: ["patterns", "fingerprints", "barcodes"], hint: "The line set is characteristic." },
      { prompt: "Emission and absorption are opposite views of the same allowed ...", acceptedAnswers: ["transitions", "gaps"], hint: "They are not separate atomic stories." },
    ]),
  ];
}

function l2ConceptRaw(): RawItem[] {
  const hint = "Explain the line pattern by referring back to the allowed gaps.";
  return [
    mc("Why is it weak to describe a spectral line as 'just a colour from the atom'?", ["the line must be tied to a specific allowed transition energy", "colour names replace all equations", "spectra do not involve photons", "colour alone fixes the proton number"], 0, "The line is evidence for a level difference.", hint),
    mc("Why do emission and absorption both support the same energy-level model?", ["both require photon energies that match the allowed gaps", "one uses photons and the other does not", "absorption ignores the atomic structure", "emission lines come from nuclei only"], 0, "They are opposite directions across the same ladder.", hint),
    mc("A student says 'absorption lines are missing colours, so they tell us less than emission lines.' What is the correction?", ["they reveal the same level spacings from the opposite direction", "dark lines never depend on energy levels", "absorption only works for continuous spectra with no atoms", "missing colours are caused only by low intensity"], 0, "Absorption is still a gap-matching phenomenon.", hint),
    mc("Why can two different atoms not be expected to share the same full line spectrum?", ["their allowed energy-level spacings are generally different", "all atoms have the same outer electrons", "every atom emits only one line", "photon energy is unrelated to atomic structure"], 0, "Different structures give different barcodes.", hint),
    mc("Why is 'the atom emits a line because it is hot' not a sufficient explanation?", ["the temperature may allow excitation, but the line position is still set by the level gap", "heat changes Planck's constant", "hot atoms no longer have quantized levels", "temperature alone decides the wavelength without transitions"], 0, "Conditions may trigger emission, but the gap fixes the line.", hint),
    mc("Why should the answer mention the transition before the wavelength formula?", ["the formula measures the photon from a physical level change", "wavelength formulas replace the atomic model", "transitions only matter for absorption", "the formula works even if there are no levels"], 0, "Model first, equation second.", hint),
    mc("A learner sees a dark line and says 'that light was blocked.' What is the stronger explanation?", ["photons of one allowed energy were absorbed to lift electrons to higher levels", "the atom rejected all low-energy light randomly", "dark lines prove there are no excited states", "the source lamp changed colour"], 0, "Absorption has a specific atomic cause.", hint),
    mc("Why is a continuous spectrum poor evidence for quantized levels by itself?", ["it does not isolate specific allowed gaps in the way line spectra do", "continuous spectra prove no photons exist", "continuous spectra can only come from atoms", "continuous spectra always mean absorption"], 0, "Line structure is the key quantum clue here.", hint),
    mc("Why does the same gap give the same line again and again?", ["the atomic level spacing for that transition is fixed", "the atom chooses colours by brightness", "the transition energy drifts randomly", "the wavelength depends only on detector choice"], 0, "Fixed gap, fixed photon energy.", hint),
    mc("Why is fingerprint language helpful but incomplete?", ["it tells us spectra are characteristic, but the reason is the pattern of allowed level gaps", "it means the atom has literal coloured fingerprints", "it replaces the need for energy equations", "it implies every line comes from the ground state"], 0, "Use the metaphor without losing the physics.", hint),
    mc("Which statement best preserves the lesson distinction?", ["spectral lines are evidence for discrete transitions rather than a blur of continuous electron energies", "spectral lines show atoms emit every wavelength equally", "spectral lines make equations unnecessary", "spectral lines prove light is only a wave"], 0, "This is the main physics claim.", hint),
    mc("Why is a longer-wavelength absorption line linked to a smaller upward energy jump?", ["because photon energy is inversely proportional to wavelength", "because longer wavelength means larger energy", "because absorption lines ignore frequency", "because all upward jumps have the same energy"], 0, "Use the photon energy relation.", hint),
    mc("A student says 'if a line is brighter, the transition energy must be larger.' What is the correction?", ["brightness and line intensity do not by themselves set the energy gap; wavelength does", "brighter lines always mean shorter wavelength", "larger gaps always give brighter lines", "line intensity proves the atom is ionised"], 0, "Keep energy separate from how much light is emitted.", hint),
    mc("Why should a rigorous answer compare spectra between atoms using gap patterns instead of colour names only?", ["gap patterns explain why the spectra differ in a physically meaningful way", "colour names already determine the electron shell", "atomic spectra depend only on instrument settings", "different colours mean the same energy if the atom changes"], 0, "Pattern-of-gaps is the stronger reasoning frame.", hint),
    ...shortCases([
      { prompt: "An absorption line means one photon energy was ... by the atom.", acceptedAnswers: ["absorbed", "taken in"], hint: "Use the upward-transition verb." },
      { prompt: "Line spectra behave like fingerprints because the allowed energy ... are atom-specific.", acceptedAnswers: ["gaps", "differences", "spacings"], hint: "That is the structural reason." },
      { prompt: "Emission and absorption are opposite directions across the same energy ...", acceptedAnswers: ["levels", "ladder", "gaps"], hint: "Keep one model visible." },
      { prompt: "A spectral line is stronger evidence for a discrete ... than for a continuous ramp.", acceptedAnswers: ["transition", "gap", "level difference"], hint: "That is the quantum claim." },
      { prompt: "The safe explanation begins with the atomic ... change and then links it to the photon.", acceptedAnswers: ["level", "transition"], hint: "Name the atomic event first." },
      { prompt: "Fingerprint language is useful only if you still mention the allowed energy ... behind it.", acceptedAnswers: ["gaps", "levels", "differences"], hint: "Do not lose the mechanism." },
    ]),
  ];
}

function l3DiagnosticRaw(): RawItem[] {
  const hint = "Separate photon energy per packet from photon number per second.";
  return [
    mc("What decides whether photoelectric emission is possible at all?", ["whether photon frequency is above the threshold frequency", "whether the light is very bright", "whether the metal is thick", "whether the beam is spread out"], 0, "Threshold frequency is the first gate.", hint),
    mc("What is the work function?", ["the minimum energy needed to free an electron from the surface", "the total number of electrons in the metal", "the current produced by one photon", "the light intensity at threshold"], 0, "Work function is the unlock energy.", hint),
    mc("A beam is brighter but still below threshold frequency. What happens?", ["no electrons are emitted", "more electrons are emitted", "the maximum kinetic energy doubles", "the threshold frequency decreases"], 0, "Brightness does not replace packet energy.", hint),
    mc("If the light frequency rises above threshold while intensity stays low, what happens first?", ["photoelectrons can be emitted", "emission still cannot occur until brightness increases", "the work function becomes zero", "the metal becomes positively charged before emission"], 0, "Crossing threshold allows emission even for dim light.", hint),
    mc("In the photoelectric equation h f = phi + K_max, what does K_max represent?", ["the maximum kinetic energy of emitted electrons", "the total electrical power", "the work done by the metal", "the wavelength of the photons"], 0, "The leftover photon energy appears as electron kinetic energy.", hint),
    mc("If photon energy is 5 eV and the work function is 2 eV, what is the maximum kinetic energy?", ["3 eV", "7 eV", "2 eV", "5 eV"], 0, "Subtract the work function from the photon energy.", hint),
    mc("If photon energy equals the work function exactly, what is the maximum kinetic energy of the emitted electrons?", ["0 eV", "equal to the threshold frequency", "1 eV", "the same as the intensity"], 0, "All the photon energy is used to free the electron.", hint),
    mc("What mainly changes when intensity increases but frequency stays above threshold?", ["the number of emitted electrons per second", "the threshold frequency", "the work function", "the energy per photon"], 0, "Intensity changes photon rate, not photon energy.", hint),
    mc("What mainly changes when frequency increases above threshold while intensity is fixed?", ["the maximum kinetic energy", "the work function", "the proton number of the metal", "the number of energy levels in the atom"], 0, "Higher frequency means more energy per photon.", hint),
    mc("Which equation links maximum photoelectron kinetic energy to stopping potential?", ["K_max = e V_s", "Delta E = h c / lambda", "p = m v", "Q = C V"], 0, "Stopping potential measures the maximum kinetic energy per charge.", hint),
    mc("Which observation most strongly challenged a simple classical wave picture of light?", ["electrons are emitted only above a threshold frequency", "light travels in straight lines", "metals reflect some light", "electrons have charge"], 0, "Threshold behavior is the key clue.", hint),
    mc("Why is photoelectric emission often described as effectively immediate once threshold is exceeded?", ["one photon can transfer its packet energy to one electron without waiting for energy to build up continuously", "the work function becomes negative", "the metal stops interacting with light", "brightness instantly becomes infinite"], 0, "Packet transfer explains the lack of delay.", hint),
    ...shortCases([
      { prompt: "The minimum frequency needed for emission is the ... frequency.", acceptedAnswers: ["threshold"], hint: "Use the gate word." },
      { prompt: "The minimum energy needed to free the electron is the work ...", acceptedAnswers: ["function"], hint: "That is the material property." },
      { prompt: "Above threshold, increasing intensity mainly changes the emission ...", acceptedAnswers: ["rate", "number", "number emitted"], hint: "Think photon count per second." },
      { prompt: "Above threshold, increasing frequency mainly changes the maximum ... energy.", acceptedAnswers: ["kinetic"], hint: "That is the leftover share." },
      { prompt: "If the photon energy is below the work function, there is ... emission.", acceptedAnswers: ["no", "no photoelectric", "no photoelectron"], hint: "The threshold has not been crossed." },
      { prompt: "In h f = phi + K_max, the symbol phi stands for the ... function.", acceptedAnswers: ["work"], hint: "It is the unlock cost." },
      { prompt: "Stopping potential measures K_max per unit ...", acceptedAnswers: ["charge"], hint: "Use K_max = e V_s." },
      { prompt: "The photoelectric effect supports photon energy ... rather than brightness-only reasoning.", acceptedAnswers: ["packets", "packet transfer", "quanta"], hint: "That is the key modern-physics idea." },
    ]),
  ];
}

function l3ConceptRaw(): RawItem[] {
  const hint = "Use one-photon-one-electron energy transfer and threshold logic.";
  return [
    mc("Why is 'brighter light gives more energetic electrons' not generally correct in the photoelectric effect?", ["electron maximum energy depends mainly on photon frequency, not on photon count", "brightness changes the work function directly", "brighter light always lowers the threshold frequency", "brightness determines Planck's constant"], 0, "Keep packet energy separate from packet number.", hint),
    mc("Why can a dim ultraviolet beam eject electrons when a bright red beam cannot?", ["the ultraviolet photons can exceed the work function while the red photons cannot", "red light cannot interact with metals", "ultraviolet light has more photons only", "brightness never matters in physics"], 0, "Threshold depends on photon energy per packet.", hint),
    mc("Why does crossing threshold frequency matter more than increasing intensity below threshold?", ["because the electron needs enough energy from one photon to escape", "because intensity changes the electron charge", "because threshold only affects colour names", "because the metal stops reflecting light above threshold"], 0, "The unlock cost must be met per photon.", hint),
    mc("A student says 'the metal stores energy from many low-frequency photons until one electron escapes.' What is the better A2_L3 response?", ["the evidence fits single-photon packet transfer rather than slow energy accumulation", "the statement is correct only for very bright beams", "all photons have the same energy anyway", "the work function becomes irrelevant at high intensity"], 0, "Immediate threshold behavior argues against build-up.", hint),
    mc("Why is the stopping potential a better clue to photon energy than the emission current is?", ["it tracks the maximum kinetic energy of the fastest electrons", "it counts how many photons hit the surface", "it tells us the wavelength of the metal", "it measures the work function directly with no equation"], 0, "Current and energy are not the same output.", hint),
    mc("Why does h f = phi + K_max keep the physics cleaner than talking about brightness alone?", ["it forces the answer to include both the unlock cost and the leftover electron energy", "it proves intensity is always irrelevant", "it removes the need for threshold frequency", "it says every photon ejects exactly one electron with the same speed"], 0, "The equation exposes the energy ledger.", hint),
    mc("Why is a threshold frequency not just a threshold intensity written another way?", ["frequency changes photon energy while intensity changes photon number", "frequency and intensity are always proportional", "intensity changes the material's proton number", "frequency only affects the colour label"], 0, "The two controls do different jobs.", hint),
    mc("Why is the term 'work function' important in explanations?", ["it identifies a material-specific energy gate that photons must overcome", "it means the metal does mechanical work on the light", "it is the same as the stopping potential in every case", "it tells how many electrons the metal contains"], 0, "Do not skip the material threshold.", hint),
    mc("Why can emission current rise without changing K_max?", ["more above-threshold photons can arrive each second while each photon still has the same energy", "K_max always changes with current", "the work function increases with current", "current changes the photon frequency"], 0, "Number of emitted electrons can change without changing the energy per electron.", hint),
    mc("Which statement best protects the lesson meaning?", ["Threshold frequency decides whether emission can happen, and frequency above threshold controls the maximum electron energy.", "Brightness alone decides both whether emission occurs and how energetic the electrons are.", "Work function matters only after emission starts.", "Current and stopping potential always measure the same thing."], 0, "That is the strong summary.", hint),
    mc("Why is the lack of time delay after threshold evidence for photon packets?", ["it suggests electrons receive enough energy in one interaction instead of building it up gradually", "it proves all metals have the same work function", "it shows photons travel infinitely fast", "it means electrons were already free"], 0, "One interaction can clear the threshold immediately.", hint),
    mc("Why is a frequency increase above threshold linked to a higher stopping potential?", ["the emitted electrons can leave with greater maximum kinetic energy", "the current must fall to zero", "the work function disappears", "more electrons are trapped in the metal"], 0, "Stopping potential measures K_max.", hint),
    mc("Why does the threshold idea belong to quantum rather than classical continuous-wave reasoning?", ["the effect depends on packet energy per photon, not on continuously spreading intensity alone", "thresholds exist only in nuclear physics", "classical waves cannot carry any energy", "quantum theory removes all wave behavior"], 0, "This experiment supports packet transfer.", hint),
    mc("A strong answer to a photoelectric question should mention the work function before what?", ["the leftover kinetic energy", "the electron mass only", "the current direction only", "the proton number"], 0, "Freeing the electron is the first energy cost.", hint),
    ...shortCases([
      { prompt: "Frequency changes photon ... per packet.", acceptedAnswers: ["energy"], hint: "That is the threshold control." },
      { prompt: "Intensity mainly changes photon ... per second.", acceptedAnswers: ["number", "count", "rate"], hint: "That is why it affects current more directly." },
      { prompt: "The work function is the material's minimum escape ...", acceptedAnswers: ["energy"], hint: "That is the unlock cost." },
      { prompt: "The stopping potential is linked to maximum ... energy.", acceptedAnswers: ["kinetic"], hint: "Use K_max = e V_s." },
      { prompt: "Below threshold frequency there is ... photoelectric emission.", acceptedAnswers: ["no"], hint: "The gate is not crossed." },
      { prompt: "The photoelectric effect is strongest when explained as photon-packet ...", acceptedAnswers: ["transfer", "energy transfer"], hint: "That is the core mechanism." },
    ]),
  ];
}

function l4DiagnosticRaw(): RawItem[] {
  const hint = "Keep bound-state jumps separate from full escape into the continuum.";
  return [
    mc("What is excitation?", ["raising an electron to a higher allowed bound level", "removing the electron completely from the atom", "changing the proton number", "splitting the nucleus"], 0, "Excitation keeps the electron bound.", hint),
    mc("What is ionisation?", ["removing an electron completely from the atom", "raising an electron to a higher bound level only", "emitting a photon below threshold", "changing one element into another"], 0, "Ionisation means the electron escapes.", hint),
    mc("Which requires more energy for the same atom: excitation to a bound state or ionisation?", ["ionisation", "excitation", "they always require the same energy", "neither has a threshold"], 0, "Ionisation crosses the top escape threshold.", hint),
    mc("What is ionisation energy?", ["the minimum energy required to remove an electron completely", "the energy of the ground state", "the energy stored in one photon only", "the voltage across a circuit"], 0, "It is the escape threshold.", hint),
    mc("An electron is lifted to a higher allowed level but remains attached to the atom. Which outcome is this?", ["excitation", "ionisation", "annihilation", "pair production"], 0, "Bound but higher means excitation.", hint),
    mc("An electron leaves the atom with some kinetic energy. Which outcome is this?", ["ionisation", "excitation", "elastic scattering only", "spectral absorption only"], 0, "Free electron means ionisation.", hint),
    mc("What lies above the ionisation threshold in the ladder model?", ["the continuum of free-electron states", "the ground state", "only the nucleus", "a region of negative energy"], 0, "Above threshold the electron is no longer bound.", hint),
    mc("If an incoming packet has less energy than the first excitation gap, what happens first?", ["no excitation occurs", "ionisation occurs", "the electron enters the continuum", "the proton number changes"], 0, "The packet does not clear even the first bound-state jump.", hint),
    mc("If the packet energy is enough for excitation but not enough for ionisation, what is the correct result?", ["the electron reaches an excited bound state", "the electron always leaves the atom", "the atom loses a proton", "the atom becomes antimatter"], 0, "Below the ionisation threshold the electron stays bound.", hint),
    mc("If the packet energy is above the ionisation energy, what can happen to the extra energy?", ["it appears as kinetic energy of the freed electron", "it vanishes", "it changes the work function of all atoms", "it turns into charge"], 0, "After escape energy is paid for, leftover energy can remain as motion.", hint),
    mc("Why can de-excitation after excitation produce spectral lines?", ["the electron can drop between allowed bound levels and emit photons", "ionised electrons always emit one fixed line only", "continuum states give discrete lines directly", "spectral lines come only from nuclei"], 0, "Bound-state drops are the line-producing transitions.", hint),
    mc("Which formula still applies for an excitation caused by a photon?", ["Delta E = h f", "Q = I t", "F = m a", "lambda = h / p only"], 0, "Excitation still needs photon energy that matches a bound-state gap.", hint),
    ...shortCases([
      { prompt: "Excitation keeps the electron ... to the atom.", acceptedAnswers: ["bound"], hint: "It has not escaped." },
      { prompt: "Ionisation makes the electron ... from the atom.", acceptedAnswers: ["free", "escape", "removed"], hint: "It is no longer bound." },
      { prompt: "The minimum escape energy is the ionisation ...", acceptedAnswers: ["energy"], hint: "Use the threshold phrase." },
      { prompt: "Above the ionisation threshold lies the ...", acceptedAnswers: ["continuum", "continuum states"], hint: "That is the free-state region." },
      { prompt: "A photon can excite the atom only if its energy matches an allowed ...", acceptedAnswers: ["gap", "difference"], hint: "Use the ladder idea." },
      { prompt: "Ionisation needs ... energy than an ordinary bound-state excitation.", acceptedAnswers: ["more", "greater", "higher"], hint: "It crosses the full escape threshold." },
      { prompt: "If the packet energy is below the first allowed jump, there is ... excitation.", acceptedAnswers: ["no"], hint: "The threshold is not met." },
      { prompt: "An excited atom can later emit a photon by moving to a ... level.", acceptedAnswers: ["lower"], hint: "Downward transitions emit." },
    ]),
  ];
}

function l4ConceptRaw(): RawItem[] {
  const hint = "Identify whether the electron ends bound or free.";
  return [
    mc("Why is 'ionisation is just a bigger excitation' not a safe explanation?", ["ionisation changes the final state from bound to free, not just the energy amount", "ionisation never needs a threshold", "excitation always changes the element", "excitation and ionisation both remove the electron"], 0, "The final-state distinction matters.", hint),
    mc("Why should a strong answer mention the continuum in ionisation questions?", ["it marks the region where the electron is no longer bound to the atom", "it means the atom has infinite charge", "it replaces the need for the ionisation energy", "it proves every excitation becomes ionisation"], 0, "Continuum language keeps the free-state idea visible.", hint),
    mc("A learner says 'the electron moved up, so the atom must be ionised.' What is the correction?", ["moving up within allowed bound levels is excitation, not ionisation", "any rise immediately removes the electron", "higher levels are always in the continuum", "excitation only happens in molecules"], 0, "Higher bound states still count as bound.", hint),
    mc("Why is ionisation energy a threshold rather than just another line on the bound ladder?", ["crossing it ends the bound-state ladder and frees the electron", "it is the same as the first excitation gap", "it describes photon colour only", "it applies only to nuclei"], 0, "It marks full escape.", hint),
    mc("Why can two packets both interact with the atom but produce different outcomes?", ["one may match a bound-state gap while the other exceeds the ionisation threshold", "the atom chooses randomly between excitation and ionisation", "outcomes do not depend on energy", "every packet first ionises and then excites"], 0, "Outcome depends on where the packet energy sits relative to thresholds.", hint),
    mc("Why do spectral lines come more naturally from excitation/de-excitation than from continuum states?", ["bound-to-bound transitions have discrete energy gaps, while continuum energies are not restricted in the same way", "continuum states always give one fixed wavelength", "spectral lines only appear after ionisation", "continuum states remove the need for photons"], 0, "Discrete lines belong to discrete gaps.", hint),
    mc("Why is it helpful to compare packet energy with more than one threshold in this lesson?", ["it distinguishes no effect, excitation, and ionisation as genuinely different outcomes", "all thresholds mean the same thing", "packet energy only matters for photoelectric questions", "once one threshold is crossed all higher outcomes are identical"], 0, "This lesson has multiple regimes.", hint),
    mc("Which statement best preserves the lesson distinction?", ["excitation leaves the electron bound, but ionisation frees it completely", "excitation and ionisation are the same if the photon is bright", "ionisation is always caused by visible light only", "excited states lie above the continuum"], 0, "That is the key contrast.", hint),
    mc("Why can an ionised electron emerge with kinetic energy?", ["the packet can provide more energy than the minimum needed for escape", "free electrons always have zero kinetic energy", "the ionisation energy becomes negative", "the work function formula replaces ionisation energy in atoms"], 0, "Escape cost is paid first; excess can remain as motion.", hint),
    mc("Why is the phrase 'still bound' stronger than 'still near the atom'?", ["it names the physical status of the electron relative to the atomic potential, not just a sketch position", "bound means neutral", "bound means motionless", "bound means in the ground state"], 0, "Use the physical relationship, not vague distance language.", hint),
    mc("Why should a worked example ask for the final state of the electron, not only the size of the packet?", ["because the same packet-size language is ambiguous unless you decide whether the electron is bound or free", "packet size never matters", "the final state is always the ground state", "freedom and binding cannot be observed"], 0, "The outcome category is the real conceptual test.", hint),
    mc("Why is a packet just below ionisation still not enough for full escape?", ["the escape threshold is exact, so nearly enough is not enough", "electrons can borrow the missing energy from the nucleus", "the work function and ionisation energy always cancel", "every excited state is automatically free"], 0, "Threshold logic is not approximate.", hint),
    mc("Why does an excited atom often emit light later?", ["the electron can fall back to a lower bound state and release the energy difference as a photon", "every excited atom must ionise first", "excited states have no allowed downward paths", "light is emitted only during absorption"], 0, "Downward bound-state transitions emit.", hint),
    mc("Which explanation is strongest?", ["Packet energy must be compared with both bound-state gaps and the ionisation threshold so the final state is identified correctly.", "Any absorbed energy ionises the atom if it is large enough to notice.", "Only continuum states matter in atomic questions.", "Excitation and ionisation differ only in brightness."], 0, "This keeps the multiple-threshold logic visible.", hint),
    ...shortCases([
      { prompt: "The key distinction is whether the electron ends ... or free.", acceptedAnswers: ["bound"], hint: "Name the opposite of free." },
      { prompt: "Ionisation crosses the final escape ...", acceptedAnswers: ["threshold"], hint: "That is the gate word." },
      { prompt: "Spectral lines come from bound-to-bound energy ...", acceptedAnswers: ["gaps", "transitions"], hint: "That is why they stay discrete." },
      { prompt: "A packet below ionisation but above one bound gap can cause ...", acceptedAnswers: ["excitation"], hint: "The electron rises but stays attached." },
      { prompt: "After ionisation, excess energy can appear as electron ... energy.", acceptedAnswers: ["kinetic"], hint: "It becomes motion." },
      { prompt: "The free-state region above ionisation is called the ...", acceptedAnswers: ["continuum"], hint: "Use the lesson term." },
    ]),
  ];
}

function l5DiagnosticRaw(): RawItem[] {
  const hint = "Use the de Broglie relation and the evidence from diffraction.";
  return [
    mc("Which relation gives the de Broglie wavelength of a particle?", ["lambda = h / p", "E = h f", "V = I R", "Q = C V"], 0, "Matter wavelength is inversely proportional to momentum.", hint),
    mc("If a particle's momentum doubles, what happens to its de Broglie wavelength?", ["it halves", "it doubles", "it stays the same", "it becomes zero immediately"], 0, "Lambda is inversely proportional to p.", hint),
    mc("What kind of observation supports the wave nature of electrons?", ["diffraction or interference patterns", "their negative charge", "their rest mass alone", "their place in atoms"], 0, "Pattern formation is the wave-like clue.", hint),
    mc("What kind of observation supports the particle nature of electrons in the same experiments?", ["localized detections at specific hit points", "continuous smearing with no individual hits", "the absence of momentum", "constant wavelength for all particles"], 0, "Single hits keep the particle side visible.", hint),
    mc("Why is wave-particle duality not a claim that the electron is half-wave and half-particle at the same time in a classical sense?", ["different experiments reveal different aspects of the same quantum object", "it means the electron changes species randomly", "it means electrons break conservation laws", "it means wave behavior only happens in light"], 0, "The evidence depends on the measurement context.", hint),
    mc("Which change makes the de Broglie wavelength shorter?", ["increasing momentum", "decreasing momentum", "widening the slit only", "counting more particles"], 0, "Higher momentum gives smaller lambda.", hint),
    mc("Why are wave effects much harder to notice for large everyday objects?", ["their de Broglie wavelengths are extremely small because their momenta are large", "large objects have no momentum", "only charged particles have wavelengths", "Planck's constant becomes larger for large objects"], 0, "The wavelength becomes tiny.", hint),
    mc("What happens to diffraction if the particle wavelength becomes smaller while the slit size stays fixed?", ["the spreading becomes less pronounced", "the spreading becomes more pronounced", "the particle loses all localized detections", "momentum becomes zero"], 0, "Smaller lambda weakens diffraction for the same geometry.", hint),
    mc("Which quantity in lambda = h / p connects the matter-wave idea to motion?", ["momentum", "charge", "current", "pressure"], 0, "The wavelength is linked to how strongly the particle is moving.", hint),
    mc("A beam of electrons is sent one at a time through a double slit. What result still supports wave behavior?", ["the individual hits build up an interference pattern over time", "each hit spreads smoothly over the whole screen", "all hits land at one point only", "no detections occur"], 0, "Localized hits can still build a wave-like distribution.", hint),
    mc("If two particles have the same momentum, what is true about their de Broglie wavelengths?", ["they are the same", "the heavier one always has the longer wavelength", "the faster one always has the shorter wavelength regardless of momentum", "their wavelengths must be zero"], 0, "Lambda depends on p directly.", hint),
    mc("Which statement best matches matter-wave evidence?", ["quantum particles can show diffraction while still being detected as localized hits", "a particle must choose to be only a wave or only a particle forever", "localized hits disprove all wave behavior", "diffraction means the particle loses momentum"], 0, "This keeps both sides of the evidence together.", hint),
    ...shortCases([
      { prompt: "The de Broglie relation is lambda = h over ...", acceptedAnswers: ["p", "momentum"], hint: "Use the momentum symbol." },
      { prompt: "Higher momentum means ... de Broglie wavelength.", acceptedAnswers: ["shorter"], hint: "They vary inversely." },
      { prompt: "Electron diffraction is evidence for the ... nature of matter.", acceptedAnswers: ["wave", "wave-like"], hint: "That is the pattern clue." },
      { prompt: "Single electron hits on a screen are evidence for the ... nature of matter.", acceptedAnswers: ["particle", "particle-like"], hint: "That is the localized-detection clue." },
      { prompt: "Wave-particle ... means one quantum object can show both kinds of evidence.", acceptedAnswers: ["duality"], hint: "Use the standard term." },
      { prompt: "For the same slit width, a smaller wavelength gives ... diffraction spreading.", acceptedAnswers: ["less", "smaller", "reduced"], hint: "The pattern narrows." },
      { prompt: "Large everyday objects have tiny matter wavelengths because they have large ...", acceptedAnswers: ["momentum"], hint: "That drives lambda down." },
      { prompt: "A pattern built from many localized hits is still an ... pattern.", acceptedAnswers: ["interference", "diffraction", "wave"], hint: "That is the wave-like distribution." },
    ]),
  ];
}

function l5ConceptRaw(): RawItem[] {
  const hint = "Keep the localized hits and the built-up pattern on the same evidence board.";
  return [
    mc("Why is 'electrons are waves, not particles' too weak as a lesson summary?", ["the experiments still show localized detections as well as wave-like patterns", "electrons have no wavelength", "particles can never diffract", "wave evidence removes the need for momentum"], 0, "Do not erase the particle evidence.", hint),
    mc("Why is 'electrons are particles, not waves' also too weak?", ["single-hit detections can still build a diffraction or interference pattern", "localized hits automatically disprove diffraction", "only light can show wave effects", "matter waves do not depend on momentum"], 0, "Do not erase the pattern evidence either.", hint),
    mc("Why is momentum the natural control knob in the de Broglie relation?", ["changing momentum directly changes the wavelength scale", "momentum only changes charge", "wavelength depends only on intensity", "Planck's constant changes with momentum"], 0, "Lambda and p are inversely linked.", hint),
    mc("Why do wave effects become easier to see when the de Broglie wavelength is larger?", ["the wavelength becomes more comparable with apertures and crystal spacing", "large wavelength removes all localized hits", "the particle stops carrying momentum", "large wavelength means the particle loses mass"], 0, "Geometry and wavelength must be comparable.", hint),
    mc("A student says 'if the electron lands at one point, it cannot have behaved like a wave.' What is the correction?", ["the whole pattern formed by many localized detections can still show wave behavior", "localized detections mean no quantum theory is needed", "single hits prove the wavelength is zero", "the pattern is caused only by detector noise"], 0, "One hit and many-hit distribution tell different parts of the story.", hint),
    mc("Why is matter-wave language stronger than just saying 'quantum particles are strange'?", ["it links the observed pattern to a quantitative wavelength relation", "it removes the need for experiments", "it proves the particle has no mass", "it says every particle has the same wavelength"], 0, "Use the relation, not a slogan.", hint),
    mc("Why does diffraction weaken as momentum rises?", ["because the associated de Broglie wavelength becomes shorter", "because higher momentum removes all energy", "because higher momentum raises Planck's constant", "because diffraction depends only on charge"], 0, "Smaller lambda means less spreading for fixed geometry.", hint),
    mc("Why are macroscopic objects not used as everyday diffraction examples?", ["their wavelengths are far too small to produce visible diffraction in ordinary setups", "they have no momentum", "they are never localized", "they cannot be treated by mechanics"], 0, "The effect becomes negligible at large momentum scales.", hint),
    mc("Why is the phrase 'depends on the experiment' important in duality explanations?", ["because the observed evidence changes with the measurement setup, not because the particle switches species", "because the particle's charge changes in each experiment", "because only some experiments conserve energy", "because Planck's constant depends on the detector"], 0, "Context determines which aspect is visible.", hint),
    mc("Which statement best protects the lesson meaning?", ["Matter can show wave-like diffraction and still arrive in localized detections, with lambda = h / p linking the behavior to momentum.", "Wave-particle duality means the particle is literally split into two objects.", "Localized hits mean the wavelength formula fails.", "Diffraction proves charge is irrelevant to all experiments."], 0, "That keeps both the evidence and the relation visible.", hint),
    mc("Why is it misleading to call the de Broglie wavelength 'just a metaphor'?", ["it predicts measurable changes in diffraction behavior when momentum changes", "it has no formula", "it applies only to photons", "it replaces all kinematics"], 0, "The wavelength has observable consequences.", hint),
    mc("Why can two particles with different masses still share the same de Broglie wavelength?", ["they can have the same momentum", "wavelength depends only on mass", "heavier particles cannot diffract", "mass cancels Planck's constant"], 0, "The formula depends on p, not mass alone.", hint),
    mc("Why should a good explanation mention both the screen hits and the overall pattern?", ["because duality is supported by the combination of local detections and global wave-like distribution", "because only the local hits matter", "because only the overall pattern matters", "because they are unrelated experiments"], 0, "Use both pieces of evidence together.", hint),
    mc("A student says 'higher momentum means more wave behavior because the particle is stronger.' What is the correction?", ["higher momentum usually means a shorter wavelength and therefore less noticeable diffraction", "higher momentum always gives longer wavelength", "momentum is unrelated to matter waves", "more momentum means the particle stops being localized"], 0, "The inverse relation is the key correction.", hint),
    ...shortCases([
      { prompt: "The de Broglie relation makes wavelength depend on particle ...", acceptedAnswers: ["momentum"], hint: "Use the p word." },
      { prompt: "Duality explanations should keep localized ... and wave-like patterns together.", acceptedAnswers: ["hits", "detections"], hint: "That is the particle evidence." },
      { prompt: "Wave effects become easier to see when wavelength is comparable to the ... size.", acceptedAnswers: ["slit", "aperture", "gap"], hint: "Geometry matters." },
      { prompt: "Larger momentum gives ... wavelength and usually less diffraction.", acceptedAnswers: ["shorter"], hint: "They vary inversely." },
      { prompt: "The overall many-hit distribution can reveal ... or diffraction.", acceptedAnswers: ["interference"], hint: "That is the wave-like pattern word." },
      { prompt: "A rigorous answer should mention the experiment ... rather than treating duality as a slogan.", acceptedAnswers: ["setup", "context"], hint: "The evidence depends on how it is tested." },
    ]),
  ];
}

function l6DiagnosticRaw(): RawItem[] {
  const hint = "Identify which experiment supports which quantum claim, then connect them.";
  return [
    mc("Which experiment most directly supports discrete atomic energy levels?", ["line spectra", "Brownian motion", "thermal expansion", "electrolysis"], 0, "Discrete lines come from discrete transitions.", hint),
    mc("Which experiment most directly supports the idea that light transfers energy in packets?", ["the photoelectric effect", "electromagnetic induction", "gas pressure", "specific heat"], 0, "Threshold photoemission is the key packet-transfer clue.", hint),
    mc("Which experiment most directly supports matter-wave behavior?", ["electron diffraction", "radioactive decay", "capacitor charging", "resistive heating"], 0, "Diffraction is the wave-like evidence for matter.", hint),
    mc("What common quantum theme connects line spectra and the photoelectric effect?", ["energy transfer is constrained by discrete packet-or-gap conditions", "both depend only on brightness", "both prove electrons are always free", "both remove the need for frequency"], 0, "One uses level gaps and the other uses photon packets.", hint),
    mc("What common theme connects the photoelectric effect and de Broglie wavelength?", ["quantum behavior cannot be reduced to classical intensity-only or particle-only ideas", "both show that all wavelengths are continuous", "both prove charge is irrelevant", "both are caused by nuclear reactions"], 0, "Both challenge simple classical pictures.", hint),
    mc("Why is a single shared quantum model stronger than treating these experiments as isolated facts?", ["it explains why several very different experiments point back to packet-and-level rules", "it proves the experiments are identical", "it removes the need for equations", "it says every experiment measures the same quantity"], 0, "The module ends with synthesis, not memorized fragments.", hint),
    mc("Which statement best links line spectra and excitation?", ["spectral lines come from electrons moving between allowed bound levels", "spectral lines come only from free electrons in the continuum", "spectral lines are caused only by bright lamps", "spectral lines do not involve photons"], 0, "Excitation and de-excitation feed the spectral evidence.", hint),
    mc("Which statement best links threshold frequency and work function?", ["photoelectric emission begins only when each photon can meet the surface escape cost", "brightness replaces the work function below threshold", "threshold frequency is the same as light intensity", "the work function changes with the number of photons"], 0, "One photon must be energetic enough.", hint),
    mc("Which statement best links de Broglie wavelength and diffraction?", ["wave-like spreading depends on the particle wavelength set by its momentum", "diffraction depends only on particle charge", "higher momentum always means more diffraction", "localized hits cancel the wavelength idea"], 0, "Lambda = h / p sets the scale of the pattern.", hint),
    mc("What is the strongest reason A2 should not end as three separate memorized topics?", ["spectra, thresholds, and matter waves all contribute to one coherent quantum picture", "the topics use the same word list only", "they all use the same apparatus", "they all ignore mathematics"], 0, "Synthesis is the end goal.", hint),
    mc("A learner remembers only 'light comes in photons'. What crucial A2 evidence would still be missing?", ["the evidence for discrete atomic levels and the matter-wave behavior of particles", "the fact that photons have no energy", "the claim that every electron is free", "the rule that intensity always fixes K_max"], 0, "A2 needs more than one quantum clue.", hint),
    mc("A learner remembers only 'electrons diffract'. What crucial A2 evidence would still be missing?", ["the threshold packet logic of the photoelectric effect and the line-spectrum evidence for discrete levels", "the existence of momentum", "the fact that light travels in vacuum", "the use of SI units"], 0, "Matter waves are only one piece of the module.", hint),
    ...shortCases([
      { prompt: "Line spectra support discrete energy ...", acceptedAnswers: ["levels", "levels in atoms"], hint: "Use the ladder idea." },
      { prompt: "The photoelectric effect supports photon energy ...", acceptedAnswers: ["packets", "quanta", "packet transfer"], hint: "That is the threshold lesson." },
      { prompt: "Electron diffraction supports matter ...", acceptedAnswers: ["waves", "wave behavior", "wave-like behavior"], hint: "That is the duality lesson." },
      { prompt: "A2 becomes stronger when the experiments are treated as one shared quantum ...", acceptedAnswers: ["model", "picture"], hint: "Use the synthesis word." },
      { prompt: "Spectra, thresholds, and matter waves should be linked, not ... separately.", acceptedAnswers: ["memorized", "memorised"], hint: "That is the trap the lesson avoids." },
      { prompt: "The shared idea behind A2 is packet-and-level ...", acceptedAnswers: ["structure", "logic", "rules"], hint: "Use the synthesis phrasing." },
      { prompt: "A strong A2 explanation compares evidence types rather than isolated ...", acceptedAnswers: ["facts", "tricks"], hint: "Think synthesis." },
      { prompt: "The final lesson asks for one coherent quantum ... rather than separate slogans.", acceptedAnswers: ["argument", "model", "picture"], hint: "Use the synthesis language." },
    ]),
  ];
}

function l6ConceptRaw(): RawItem[] {
  const hint = "Name the evidence and the shared quantum claim it supports.";
  return [
    mc("Why is it weak to say 'A2 is about strange experiments'?", ["the module is really about how several experiments support one coherent quantum model", "the experiments have nothing in common", "no experiment in A2 uses equations", "the module only teaches history"], 0, "The end goal is synthesis.", hint),
    mc("Why does the line-spectrum evidence belong naturally with the photoelectric effect in a final comparison?", ["both make energy transfer discrete rather than continuous", "both depend mainly on brightness", "both describe free electrons only", "both remove the need for photons"], 0, "One uses gaps, the other uses packets.", hint),
    mc("Why does matter-wave evidence strengthen the quantum story instead of replacing the other topics?", ["it extends quantum reasoning beyond atomic levels and photon thresholds to moving particles themselves", "it proves spectra were classical after all", "it removes the need for momentum", "it applies only to photons"], 0, "It broadens the same quantum framework.", hint),
    mc("A student says 'line spectra prove light is quantized.' What is the better A2_L6 correction?", ["line spectra more directly show quantized atomic energy levels, while the photoelectric effect is the cleaner photon-packet clue", "line spectra prove all photons have the same frequency", "line spectra are unrelated to atoms", "photoelectric evidence only matters for heat"], 0, "Keep the evidences assigned to the strongest claim.", hint),
    mc("A student says 'photoelectric threshold proves electrons are waves.' What is the better correction?", ["photoelectric threshold mainly supports photon-packet energy transfer, while electron diffraction is the clearer wave clue for matter", "photoelectric threshold proves line spectra directly", "threshold behavior removes the need for work function", "waves and particles are unrelated topics"], 0, "Do not mix up what each experiment is best at showing.", hint),
    mc("Why should a synthesis answer compare what changes and what stays constant across experiments?", ["it helps identify the recurring quantum principles instead of memorized surface details", "the surface apparatus is the main lesson", "every experiment uses the same measured quantity", "quantum theory ignores mechanism"], 0, "Shared principles matter more than the gadget details.", hint),
    mc("Why is 'frequency matters' not enough as a full A2 summary?", ["A2 also needs discrete atomic levels and matter-wave evidence, not only photon-threshold reasoning", "frequency is irrelevant to spectra", "frequency alone explains ionisation and diffraction fully", "frequency replaces momentum in de Broglie reasoning"], 0, "One slogan cannot cover the full module.", hint),
    mc("Which summary best matches the module's mathematical rigor?", ["Use the correct relation for the correct evidence: Delta E = h f for level gaps, h f = phi + K_max for photoelectric emission, and lambda = h / p for matter waves.", "Use one favorite equation for every quantum question.", "Avoid formulas because the concepts are enough.", "Only the photoelectric equation belongs in quantum theory."], 0, "Different experiments need different relations inside one framework.", hint),
    mc("Why is it helpful to keep 'packet' and 'level' language separate but connected?", ["packet language explains photon transfer, while level language explains atomic states and together they form the stronger model", "packet and level mean exactly the same thing", "only packet language matters in A2", "only level language matters in A2"], 0, "The model has two linked pieces.", hint),
    mc("Why does a final worked example often ask which mechanism should stay visible?", ["because the challenge is to preserve the right causal model instead of choosing by slogan or vocabulary alone", "because quantum questions are only about wording", "mechanism does not matter if the answer is short", "only diagrams matter in synthesis"], 0, "The module is testing mechanism-level understanding.", hint),
    mc("Why is 'electron diffraction plus photoelectric effect' a stronger pair than either one alone?", ["together they show that quantum theory must handle both light packets and matter waves", "both measure the same threshold frequency", "both prove atoms are continuous", "either one removes the need for the other"], 0, "The combination widens the evidence base.", hint),
    mc("Why do spectra still matter in the final lesson even after photoelectric and de Broglie work?", ["they provide the cleanest evidence for discrete atomic levels, completing the quantum picture", "they are only historical decoration", "they are replaced completely by stopping potential", "they do not involve photons or electrons"], 0, "A2 needs all three evidence strands.", hint),
    mc("Which statement best protects the A2_L6 meaning?", ["Different experiments test different surfaces of quantum theory, but together they support discrete levels, photon packets, and matter waves as one coherent framework.", "Each experiment in A2 gives a separate unrelated rule.", "Only one experiment is really quantum; the others are optional.", "Quantum theory is just a list of formulas with no shared model."], 0, "That is the strong synthesis statement.", hint),
    mc("Why is it dangerous to answer A2_L6 with a memorized slogan such as 'light is a particle and matter is a wave'?", ["the module requires the supporting evidence, thresholds, and equations to be assigned accurately to each claim", "the slogan includes every needed mechanism already", "A2_L6 avoids evidence on purpose", "slogans are more rigorous than experiment-based answers"], 0, "Evidence and mechanism are the point.", hint),
    ...shortCases([
      { prompt: "Line spectra are the cleanest evidence for discrete atomic ...", acceptedAnswers: ["levels", "energy levels"], hint: "Use the ladder term." },
      { prompt: "The photoelectric effect is the clearest A2 evidence for photon energy ...", acceptedAnswers: ["packets", "quanta", "packet transfer"], hint: "That is the threshold lesson." },
      { prompt: "Electron diffraction is the clearest A2 evidence for matter ...", acceptedAnswers: ["waves", "wave behavior"], hint: "That is the de Broglie lesson." },
      { prompt: "A synthesis answer should preserve the shared quantum ... rather than separate slogans.", acceptedAnswers: ["model", "picture", "framework"], hint: "Use the integration word." },
      { prompt: "The final lesson is strongest when mechanism stays ...", acceptedAnswers: ["visible", "clear"], hint: "That is what the audit is protecting." },
      { prompt: "A2 asks for evidence-backed quantum ... rather than generic vocabulary.", acceptedAnswers: ["reasoning", "arguments", "explanations"], hint: "Use the rigor language." },
    ]),
  ];
}

const A2_DIAGNOSTIC_BUILDERS: Record<string, () => RawItem[]> = {
  A2_L1: l1DiagnosticRaw,
  A2_L2: l2DiagnosticRaw,
  A2_L3: l3DiagnosticRaw,
  A2_L4: l4DiagnosticRaw,
  A2_L5: l5DiagnosticRaw,
  A2_L6: l6DiagnosticRaw,
};

const A2_CONCEPT_BUILDERS: Record<string, () => RawItem[]> = {
  A2_L1: l1ConceptRaw,
  A2_L2: l2ConceptRaw,
  A2_L3: l3ConceptRaw,
  A2_L4: l4ConceptRaw,
  A2_L5: l5ConceptRaw,
  A2_L6: l6ConceptRaw,
};

const A2_MASTERY_BUILDERS: Record<string, () => RawItem[]> = Object.fromEntries(
  Object.keys(A2_DIAGNOSTIC_BUILDERS).map((code) => [
    code,
    () => [...A2_DIAGNOSTIC_BUILDERS[code](), ...A2_CONCEPT_BUILDERS[code]()],
  ]),
) as Record<string, () => RawItem[]>;

export function a2GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A2_DIAGNOSTIC_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "diagnostic", builder()) : [];
}

export function a2GeneratedConceptGateItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A2_CONCEPT_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "concept", builder()) : [];
}

export function a2GeneratedMasteryItems(code: string): UnknownRecord[] {
  const normalized = normalizeCode(code);
  const builder = A2_MASTERY_BUILDERS[normalized];
  return builder ? materializeBank(normalized, "mastery", builder()) : [];
}
