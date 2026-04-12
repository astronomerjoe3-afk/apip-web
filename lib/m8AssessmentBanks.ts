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
    throw new Error(`M8 ${kind} bank for ${code} is too small: ${deduped.length} < ${min}`);
  }

  return deduped;
}

function words(...values: string[]): string[] {
  return Array.from(new Set(values));
}

function l1DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Tie the mirror geometry to the normal first, then classify the image carefully.";
  return [
    mc("Which statement is the reflection rule for a plane mirror?", ["Angle of incidence equals angle of reflection", "Angle to the surface always stays unchanged", "Reflected rays always leave at 90 deg", "Mirror images form where real light meets behind the mirror"], 0, "Plane-mirror reflection keeps equal angles to the normal.", hint),
    mc("From which line should mirror angles be measured?", ["The normal", "The mirror surface", "The principal axis only", "The image line"], 0, "Reflection angles are measured from the normal.", hint),
    mc("A ray is 20 deg to the mirror surface. What is its angle of incidence?", ["70 deg", "20 deg", "90 deg", "110 deg"], 0, "Surface angle and normal angle add to 90 deg.", hint),
    mc("A ray strikes a mirror at 35 deg to the normal. What is the reflected angle?", ["35 deg", "55 deg", "70 deg", "145 deg"], 0, "The reflected angle matches the incident angle to the same normal.", hint),
    mc("What happens for head-on incidence at 0 deg to the normal?", ["The reflected ray retraces the same line", "The reflected ray leaves at 90 deg", "The image becomes real", "No reflection occurs"], 0, "At normal incidence the path reverses along the same line.", hint),
    mc("An object is 6 cm in front of a plane mirror. Where is its image?", ["6 cm behind the mirror", "6 cm in front of the mirror", "12 cm behind the mirror", "At the mirror surface"], 0, "Plane mirrors place the image the same distance behind as the object is in front.", hint),
    mc("What type of image does a plane mirror produce?", ["Virtual", "Real", "Inverted only", "No image"], 0, "A plane-mirror image is virtual because the light does not actually meet there.", hint),
    mc("Compared with the object, a plane-mirror image is usually:", ["The same size", "Always smaller", "Always larger", "Always upside down"], 0, "A plane mirror gives an equal-size virtual image.", hint),
    mc("What do the dashed lines behind a plane mirror represent?", ["Backward extensions of reflected rays", "Real light beams behind the mirror", "The mirror surface", "The principal axis"], 0, "The dashed lines show where rays appear to come from.", hint),
    mc("If the object moves farther from a plane mirror, what happens to the image distance behind the mirror?", ["It increases by the same amount", "It stays fixed", "It becomes half the object distance", "It becomes zero"], 0, "Object distance and image distance stay equal for a plane mirror.", hint),
    shortCases([
      { prompt: "What line is used as the reference for mirror angles?", acceptedAnswers: words("the normal", "normal"), hint },
      { prompt: "If the angle of incidence is 50 deg, what is the angle of reflection?", acceptedAnswers: words("50", "50 deg", "50 degrees"), hint },
      { prompt: "A ray is 30 deg to the surface. What is its angle to the normal?", acceptedAnswers: words("60", "60 deg", "60 degrees"), hint },
      { prompt: "An object is 9 cm in front of a plane mirror. How far behind the mirror is the image?", acceptedAnswers: words("9", "9 cm"), hint },
      { prompt: "Does real light pass behind a plane mirror to form the image there?", acceptedAnswers: words("no"), hint },
      { prompt: "Can a plane-mirror image be caught on a screen?", acceptedAnswers: words("no"), hint },
      { prompt: "What word classifies a plane-mirror image: real or virtual?", acceptedAnswers: words("virtual"), hint },
      { prompt: "What relation links object distance and image distance in a plane mirror?", acceptedAnswers: words("they are equal", "object distance equals image distance", "same distance"), hint },
      { prompt: "What happens to the reflected ray at 0 deg incidence?", acceptedAnswers: words("it retraces the same path", "it retraces the same line", "same line back"), hint },
      { prompt: "If a mirror question gives the angle to the surface first, what should you do before using the law of reflection?", acceptedAnswers: words("convert it to the angle to the normal", "find the angle to the normal", "subtract from 90"), hint },
    ]),
  ];
}

function l1ConceptRaw(): RawCollectionItem[] {
  const hint = "Keep the normal and the virtual-image logic separate from the mirror surface itself.";
  return [
    mc("Why is using the surface angle directly a weak reflection method?", ["Because the reflection law compares angles to the normal, not to the surface", "Because surface angles are always zero", "Because reflected rays ignore the surface", "Because plane mirrors have no normals"], 0, "The normal is the disciplined reference line.", hint),
    mc("Why is a plane-mirror image described as virtual?", ["The rays only appear to come from behind the mirror", "The image is always upside down", "The image has no size", "The mirror absorbs the light"], 0, "Virtual means apparent, not a real crossing of light.", hint),
    mc("A candle is 4 cm in front of a plane mirror. What is the distance from the candle to its image?", ["8 cm", "4 cm", "2 cm", "16 cm"], 0, "Object and image are each 4 cm from the mirror on opposite sides.", hint),
    mc("If an observer steps backward while the object stays fixed, what happens to the image position relative to the mirror?", ["It stays in the same place", "It moves deeper behind the mirror", "It moves onto the mirror surface", "It becomes real"], 0, "The mirror image position is set by the object, not by the observer.", hint),
    mc("If the angle of incidence increases by 15 deg, what happens to the reflected angle?", ["It also increases by 15 deg", "It decreases by 15 deg", "It stays the same", "It becomes half as large"], 0, "The equality around the same normal still holds.", hint),
    mc("Which statement about a plane-mirror image is strongest?", ["It is behind the mirror, equal in size, and virtual", "It is on the mirror surface and real", "It is always smaller and inverted", "It forms only when the observer is close"], 0, "This combines the correct position, size, and image type.", hint),
    mc("Why can reflected rays reach the eye even though the image is behind the mirror?", ["The real rays travel in front of the mirror and only appear to come from behind it", "The eye sends light behind the mirror", "The image glows on its own", "The mirror stores light behind it"], 0, "The eye receives reflected rays in front of the mirror.", hint),
    mc("Which statement should be rejected?", ["A plane-mirror image can usually be formed on a screen", "A plane-mirror image is virtual", "The normal is perpendicular to the surface", "The reflected angle matches the incident angle"], 0, "A screen needs a real image made by actual converging rays.", hint),
    mc("A ray is 15 deg to the mirror surface. What is the reflected angle to the normal?", ["75 deg", "15 deg", "30 deg", "105 deg"], 0, "First convert 15 deg to 75 deg to the normal, then reflect equally.", hint),
    mc("What do dashed backward extensions contribute to a plane-mirror sketch?", ["They locate the apparent image position", "They show where real light is strongest", "They replace the reflected rays", "They measure focal length"], 0, "The extensions locate the virtual image.", hint),
    shortCases([
      { prompt: "Why are mirror angles measured from the normal instead of the surface?", acceptedAnswers: words("because the law of reflection uses the normal", "because the reflection rule compares angles to the normal", "because the normal is the reference line"), hint },
      { prompt: "Why is a plane-mirror image virtual?", acceptedAnswers: words("because the rays only appear to come from behind the mirror", "because no real rays meet at the image", "because only backward extensions meet"), hint },
      { prompt: "If an object is 4 cm in front of a plane mirror, how far is the image from the object?", acceptedAnswers: words("8", "8 cm"), hint },
      { prompt: "What happens to the image position if only the observer moves and the object does not?", acceptedAnswers: words("it stays the same", "no change"), hint },
      { prompt: "What remains equal in plane-mirror reflection?", acceptedAnswers: words("angle of incidence and angle of reflection", "the incident and reflected angles"), hint },
      { prompt: "Can a plane-mirror image be projected onto a screen?", acceptedAnswers: words("no"), hint },
      { prompt: "What do the dashed lines behind the mirror represent?", acceptedAnswers: words("backward extensions", "backward extensions of reflected rays", "extensions"), hint },
      { prompt: "If a reflected ray is 65 deg to the normal, what was the incident angle?", acceptedAnswers: words("65", "65 deg", "65 degrees"), hint },
      { prompt: "A ray is 25 deg to the mirror surface. What is its angle of incidence?", acceptedAnswers: words("65", "65 deg", "65 degrees"), hint },
      { prompt: "Do actual reflected rays meet behind a plane mirror?", acceptedAnswers: words("no"), hint },
    ]),
  ];
}

function l2DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Decide whether the light speeds up or slows down, then judge the bend from the normal.";
  return [
    mc("What is refraction?", ["The turning of light because its speed changes in a new medium", "The bounce from a mirror", "The production of a virtual image only", "The splitting of white light only"], 0, "Refraction is the speed-change turning process.", hint),
    mc("If a ray bends toward the normal on entering a new medium, what is the best inference?", ["The new medium is slower", "The new medium is faster", "The surface is acting like a mirror", "The frequency has doubled"], 0, "Toward the normal means the light has slowed down.", hint),
    mc("If a ray bends away from the normal on entering a new medium, what is the best inference?", ["The new medium is faster", "The new medium is slower", "There is no refraction", "The image must be real"], 0, "Away from the normal means the light has sped up.", hint),
    mc("What usually happens to a ray going from air into glass at an angle?", ["It bends toward the normal", "It bends away from the normal", "It reflects only", "It travels undeviated regardless of angle"], 0, "Glass is optically slower than air.", hint),
    mc("What usually happens to a ray going from glass into air at an angle?", ["It bends away from the normal", "It bends toward the normal", "It always undergoes total internal reflection", "It becomes parallel to the normal"], 0, "Leaving the slower medium makes the ray bend away.", hint),
    mc("From which line should the refracted angle be measured?", ["The normal", "The boundary surface", "The lens center only", "The image line"], 0, "Just like reflection work, refraction angles are measured from the normal.", hint),
    mc("What happens for normal incidence at 0 deg to the normal?", ["The ray continues without bending", "The ray must reflect back", "The ray turns by 90 deg", "The ray becomes virtual"], 0, "No sideways turning is needed at head-on incidence.", hint),
    mc("Why does a lens bend light at two surfaces?", ["Because the light changes speed at entry and exit boundaries", "Because the middle of the lens pulls rays inward", "Because the lens creates new light", "Because the principal axis is curved"], 0, "Each boundary can change the ray direction.", hint),
    mc("If light enters a new region but its speed does not change, what is the safest conclusion?", ["There is no refraction bend", "It must bend toward the normal", "It must bend away from the normal", "It must form a real image"], 0, "Refraction turning needs a speed change.", hint),
    mc("A ray passes through a rectangular glass block with parallel faces. What is true of the emergent ray?", ["It is parallel to the incident ray", "It leaves at 90 deg to the incident ray", "It must retrace the incoming path", "It cannot leave the block"], 0, "The second bend at the parallel face restores the original direction.", hint),
    shortCases([
      { prompt: "What is the name of the process when light changes direction because its speed changes at a boundary?", acceptedAnswers: words("refraction"), hint },
      { prompt: "If a ray bends toward the normal, is the new medium faster or slower?", acceptedAnswers: words("slower", "a slower medium"), hint },
      { prompt: "If a ray bends away from the normal, is the new medium faster or slower?", acceptedAnswers: words("faster", "a faster medium"), hint },
      { prompt: "What must change at a boundary for refraction turning to occur?", acceptedAnswers: words("speed", "light speed", "the speed of light"), hint },
      { prompt: "What line is used to measure refracted angles?", acceptedAnswers: words("the normal", "normal"), hint },
      { prompt: "What happens to a ray at normal incidence when it crosses a boundary?", acceptedAnswers: words("no bending", "it does not bend", "it continues straight"), hint },
      { prompt: "A ray goes from air into glass. Which way does it bend?", acceptedAnswers: words("toward the normal"), hint },
      { prompt: "A ray goes from glass into air. Which way does it bend?", acceptedAnswers: words("away from the normal"), hint },
      { prompt: "Why does a lens bend light at both entry and exit?", acceptedAnswers: words("because the speed changes at both boundaries", "because there are two boundaries where refraction happens", "because it refracts at both surfaces"), hint },
      { prompt: "For a glass block with parallel faces, how is the emergent ray directed compared with the incident ray?", acceptedAnswers: words("parallel", "parallel to the incident ray"), hint },
    ]),
  ];
}

function l2ConceptRaw(): RawCollectionItem[] {
  const hint = "Use speed-change language and the normal before reaching for any lens slogan.";
  return [
    mc("Why is 'the lens pulls the ray toward the middle' a weak explanation?", ["Because refraction happens at boundaries where speed changes, not from a pull in the middle", "Because lenses never bend light", "Because only mirrors can change direction", "Because the normal disappears inside the lens"], 0, "Boundary speed change is the stronger physics story.", hint),
    mc("A ray ends up closer to the normal after crossing a boundary. What should be concluded first?", ["It entered a slower medium", "It entered a faster medium", "It reflected from a mirror", "It formed a virtual image"], 0, "Closer to the normal means slower.", hint),
    mc("A ray ends up farther from the normal after crossing a boundary. What should be concluded first?", ["It entered a faster medium", "It entered a slower medium", "It was not refracted", "It must be at the critical angle"], 0, "Farther from the normal means faster.", hint),
    mc("Why does a rectangular glass block often give an emergent ray parallel to the incident ray?", ["The second surface bends the ray back by the opposite amount because the faces are parallel", "The light stops refracting at the second surface", "The glass becomes a mirror at exit", "The normal changes into the incident ray"], 0, "Parallel faces give opposite bending at exit.", hint),
    mc("If light crosses a boundary without any speed change, what is the strongest conclusion?", ["There is no refraction turning", "There must be total internal reflection", "The reflected angle doubles", "The wavelength must become zero"], 0, "No speed change means no turning due to refraction.", hint),
    mc("Which statement about refraction is strongest?", ["The source frequency stays the same while the medium changes the speed and route", "The boundary changes the source frequency first", "Refraction is only about the lens center", "Refraction means the ray always bends toward the surface"], 0, "The medium changes the speed, not the source.", hint),
    mc("What is the strongest distinction between reflection and refraction?", ["Reflection is a bounce at a surface, while refraction is a turn caused by speed change in a new medium", "Reflection and refraction are identical", "Reflection always uses the faster medium", "Refraction never changes direction"], 0, "This keeps the processes cleanly separated.", hint),
    mc("A ray enters glass along the normal. Which statement is best?", ["Its speed changes, but it does not bend", "It must bend toward the normal", "It must reflect back out", "It forms a real image at the surface"], 0, "Head-on entry changes speed without sideways turning.", hint),
    mc("A ray enters a glass block from air and leaves through a parallel face back into air. What is the best overall description?", ["It bends toward the normal on entry and away on exit, ending parallel to the original direction", "It bends the same way at both faces and keeps turning", "It never bends at either face", "It undergoes total internal reflection automatically"], 0, "The two bends oppose each other when the faces are parallel.", hint),
    mc("Why is 'toward the surface' a weak way to describe refraction?", ["Because the correct geometry uses the normal, not the surface, as the angle reference", "Because the surface angle is always zero", "Because surfaces do not exist in optics", "Because the ray cannot approach the surface"], 0, "The normal keeps the geometry disciplined.", hint),
    shortCases([
      { prompt: "Why is 'the lens pulls the ray' weaker than a boundary explanation?", acceptedAnswers: words("because refraction happens where the speed changes at boundaries", "because the bending is caused by speed change at the surfaces", "because the ray bends at the entry and exit boundaries"), hint },
      { prompt: "If a ray moves closer to the normal after crossing, what does that say about the new medium?", acceptedAnswers: words("it is slower", "slower medium"), hint },
      { prompt: "If a ray moves farther from the normal after crossing, what does that say about the new medium?", acceptedAnswers: words("it is faster", "faster medium"), hint },
      { prompt: "Why can a ray leave a rectangular block parallel to the incident ray?", acceptedAnswers: words("because the second parallel face bends it back by the opposite amount", "because parallel faces give opposite bends", "because the exit refraction cancels the entry turn"), hint },
      { prompt: "What quantity of the source stays fixed when light crosses into a new medium?", acceptedAnswers: words("frequency", "the frequency"), hint },
      { prompt: "What happens to direction if there is no speed change across a boundary?", acceptedAnswers: words("no bending", "no refraction bend", "it stays in the same direction"), hint },
      { prompt: "Why is normal incidence special in refraction sketches?", acceptedAnswers: words("because the ray does not bend", "because there is no sideways turning", "because it continues straight"), hint },
      { prompt: "What is the strongest reason a lens bends at two surfaces?", acceptedAnswers: words("because light changes speed at entry and exit", "because both surfaces are boundaries", "because there are two refraction events"), hint },
      { prompt: "What is the correct angle reference line in refraction?", acceptedAnswers: words("the normal", "normal"), hint },
      { prompt: "Why is refraction better described as a speed-change story than a label-only story?", acceptedAnswers: words("because the new medium changes the light speed and that causes the turn", "because bending follows from the speed change", "because the speed change causes the direction change"), hint },
    ]),
  ];
}

function l3DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Use the selected-ray rules and the F or 2F regions before naming the image.";
  return [
    mc("For a converging lens, what happens to a ray that starts parallel to the principal axis?", ["It passes through the far focus", "It appears to come from the near focus", "It reflects back on itself", "It travels undeviated through the center"], 0, "This is the standard parallel-ray rule for a converging lens.", hint),
    mc("What is the standard quick rule for the center ray in the thin-lens model?", ["It travels approximately undeviated", "It must pass through the focus first", "It always reflects", "It bends away from the axis"], 0, "The center ray is the fast second construction line.", hint),
    mc("What is a real image?", ["An image formed where actual rays meet", "An image seen only in dashed extensions", "An image that is always upright", "An image that cannot be projected"], 0, "A real image is a true crossing of real rays.", hint),
    mc("Which image can usually be caught on a screen?", ["A real image", "A virtual image only", "A plane-mirror image only", "No optical image"], 0, "A screen needs actual light to meet there.", hint),
    mc("For an object beyond 2F in front of a converging lens, where is the image?", ["Between F and 2F on the far side", "Beyond 2F on the object side", "At the lens center", "Between the lens and F on the object side"], 0, "This is the standard region pair.", hint),
    mc("For an object at 2F in front of a converging lens, where is the image?", ["At 2F on the far side", "At F on the far side", "At the lens center", "At the object"], 0, "The 2F case is symmetric across the lens.", hint),
    mc("For an object between F and 2F in front of a converging lens, where is the image?", ["Beyond 2F on the far side", "Between F and 2F on the object side", "At the focus only", "At the lens center"], 0, "Moving the object inward pushes the real image farther out.", hint),
    mc("At 2F, how does the image size compare with the object?", ["Same size", "Always smaller", "Always larger", "Zero size"], 0, "At 2F the image is the same size as the object.", hint),
    mc("What is the usual orientation of a real image formed by a converging lens for an object outside F?", ["Inverted", "Upright", "No orientation", "Sideways only"], 0, "The standard real image is inverted.", hint),
    mc("Which statement should be rejected for a converging-lens real image?", ["It is located only by backward dashed extensions", "Actual rays cross at the image point", "It can usually be projected onto a screen", "The parallel and center rays can locate it"], 0, "Dashed extension logic belongs to virtual images.", hint),
    shortCases([
      { prompt: "For a converging lens, what happens to a parallel ray?", acceptedAnswers: words("it goes through the far focus", "through the far focus", "passes through the far focus"), hint },
      { prompt: "What is the standard center-ray rule for a converging lens?", acceptedAnswers: words("it travels undeviated", "approximately undeviated", "straight through the center"), hint },
      { prompt: "What image type is formed where actual refracted rays meet?", acceptedAnswers: words("real image", "real"), hint },
      { prompt: "Can a real image usually be projected onto a screen?", acceptedAnswers: words("yes"), hint },
      { prompt: "If the object is beyond 2F, where is the image?", acceptedAnswers: words("between f and 2f", "between f and 2f on the far side"), hint },
      { prompt: "If the object is at 2F, where is the image?", acceptedAnswers: words("at 2f", "at 2f on the far side"), hint },
      { prompt: "If the object is between F and 2F, where is the image?", acceptedAnswers: words("beyond 2f", "beyond 2f on the far side"), hint },
      { prompt: "At 2F, is the image larger, smaller, or the same size as the object?", acceptedAnswers: words("same size", "the same size"), hint },
      { prompt: "What is the usual orientation of the real image from a converging lens?", acceptedAnswers: words("inverted"), hint },
      { prompt: "What phrase means actual rays cross at the image point?", acceptedAnswers: words("real image", "true meeting point"), hint },
    ]),
  ];
}

function l3ConceptRaw(): RawCollectionItem[] {
  const hint = "Track how the image region and size change when the object moves between the standard F and 2F cases.";
  return [
    mc("If the object moves farther beyond 2F, what usually happens to the real image?", ["It becomes smaller and moves closer to F", "It becomes larger and moves beyond 2F", "It becomes virtual", "It stays fixed at 2F"], 0, "A farther object gives a smaller image closer to the focus region.", hint),
    mc("If the object moves from beyond 2F toward F but stays outside F, what usually happens to the real image?", ["It moves farther from the lens and becomes larger", "It moves toward the lens and becomes smaller", "It becomes virtual immediately", "It disappears"], 0, "As the object approaches F from outside, the real image grows and shifts outward.", hint),
    mc("Why is the center ray useful in a quick converging-lens sketch?", ["It gives a second reliable construction line without a major bend in the thin-lens model", "It always passes through the focus first", "It shows the image size directly by itself", "It works only for virtual images"], 0, "The center ray is the standard fast second ray.", hint),
    mc("Why is 'the image is on the lens surface' a weak conclusion?", ["Because image position is set by the crossing of refracted rays, not by the glass surface itself", "Because images always form on the principal axis only", "Because the lens surface is the focus", "Because real images are always on the object side"], 0, "The crossing point matters, not the material surface.", hint),
    mc("If a screen shows a sharp image from a converging lens, what is the strongest inference?", ["Actual rays are meeting at the screen", "The image must be virtual", "The lens is reflecting instead of refracting", "The normal has become a ray"], 0, "A screen confirms a real image.", hint),
    mc("Which pair of rays is usually enough to locate a converging-lens image quickly?", ["A parallel ray and a center ray", "Two dashed backward extensions", "Two reflected rays", "Only one ray"], 0, "A small selected set can still predict the image location.", hint),
    mc("What is the safest statement for an object just outside F in a converging lens?", ["The image is real, inverted, and formed far from the lens", "The image is virtual, upright, and near the lens", "The image is always at 2F", "No image can form"], 0, "Just outside F gives a distant, magnified real image.", hint),
    mc("Why are dashed extensions not the main method for a standard converging-lens real image?", ["Because the real image is found from actual refracted rays crossing", "Because dashed lines cannot be drawn in optics", "Because converging lenses have no focus", "Because only mirrors use geometry"], 0, "Real images come from real-ray crossings.", hint),
    mc("Which statement about selected rays is strongest?", ["A few carefully chosen rays can stand in for the full ray bundle and still locate the image", "Every real ray must be drawn before any conclusion is allowed", "Selected rays are not allowed in IGCSE ray diagrams", "Only the center ray matters"], 0, "Ray diagrams are efficient route maps.", hint),
    mc("Which comparison is correct?", ["At 2F the image is the same size, while beyond 2F the image is smaller", "At 2F the image is always larger, while beyond 2F it is the same size", "At 2F and beyond 2F the image is always virtual", "At 2F and beyond 2F the image is always upright"], 0, "This keeps the two anchor cases distinct.", hint),
    shortCases([
      { prompt: "If the object moves farther beyond 2F, what happens to the image size?", acceptedAnswers: words("it gets smaller", "smaller"), hint },
      { prompt: "If the object moves from beyond 2F toward F while staying outside F, what happens to the image size?", acceptedAnswers: words("it gets larger", "larger"), hint },
      { prompt: "Why can a real converging-lens image be caught on a screen?", acceptedAnswers: words("because actual rays meet there", "because real rays cross there", "because it is a real image"), hint },
      { prompt: "What two named object-image anchor regions are commonly used in converging-lens sketches?", acceptedAnswers: words("f and 2f", "the f and 2f regions"), hint },
      { prompt: "Why is the center ray useful in a quick sketch?", acceptedAnswers: words("because it travels approximately undeviated", "because it is approximately undeviated", "because it gives a second construction line"), hint },
      { prompt: "For an object just beyond 2F, where is the image?", acceptedAnswers: words("between f and 2f", "between f and 2f on the far side"), hint },
      { prompt: "For an object between F and 2F, where is the image?", acceptedAnswers: words("beyond 2f", "beyond 2f on the far side"), hint },
      { prompt: "At 2F, what size is the image?", acceptedAnswers: words("same size", "the same size"), hint },
      { prompt: "What is the orientation of the standard real image from a converging lens?", acceptedAnswers: words("inverted"), hint },
      { prompt: "What is the best label for the point where actual refracted rays cross?", acceptedAnswers: words("real image", "true meeting point"), hint },
    ]),
  ];
}

function l4DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Keep the real spreading rays and the dashed backward extensions in different roles.";
  return [
    mc("For a diverging lens, what happens to a ray that starts parallel to the principal axis?", ["It appears to come from the near focus", "It passes through the far focus", "It reflects back on itself", "It always stays on the axis"], 0, "This is the standard parallel-ray rule for a diverging lens.", hint),
    mc("What is the standard quick rule for the center ray in the thin-lens model?", ["It travels approximately undeviated", "It must pass through the near focus", "It reflects at the lens center", "It always becomes horizontal"], 0, "The center ray remains a useful second construction line.", hint),
    mc("What type of image does a diverging lens usually form for a real object?", ["Virtual", "Real", "Projected only", "No image"], 0, "A single diverging lens usually gives a virtual image.", hint),
    mc("What is the usual orientation of the image from a diverging lens?", ["Upright", "Inverted", "Always sideways", "No orientation"], 0, "The standard diverging-lens image is upright.", hint),
    mc("Compared with the object, the image from a diverging lens is usually:", ["Smaller", "Larger", "The same size", "Always at 2F"], 0, "The usual diverging-lens image is diminished.", hint),
    mc("Where is the image from a diverging lens usually found?", ["On the object side between the lens and the focus", "On the far side beyond 2F", "Exactly at the lens surface", "Only on a screen"], 0, "The image is virtual and lies on the object side.", hint),
    mc("Do the real rays actually meet at the diverging-lens image position?", ["No", "Yes", "Only at 2F", "Only for large objects"], 0, "Only the backward extensions meet there.", hint),
    mc("Why can a diverging-lens image not usually be caught on a screen?", ["Because no real rays meet at the image point", "Because the lens blocks all light", "Because the principal axis is missing", "Because virtual images have zero size"], 0, "A screen needs real rays to meet there.", hint),
    mc("What do the dashed lines in a diverging-lens image sketch represent?", ["Backward extensions of the diverging rays", "Real rays inside the lens", "The lens material thickness", "The normal to the lens"], 0, "The dashed lines show apparent origin, not real travel.", hint),
    mc("Which statement should be rejected for a diverging lens?", ["The real rays cross at the virtual image point", "The real rays spread after the lens", "Backward extensions locate the image", "The image is usually upright"], 0, "Real rays do not cross at the virtual image.", hint),
    shortCases([
      { prompt: "For a diverging lens, what does a parallel ray appear to do after the lens?", acceptedAnswers: words("it appears to come from the near focus", "appear to come from the near focus", "comes from the near focus"), hint },
      { prompt: "What kind of image does a diverging lens usually form: real or virtual?", acceptedAnswers: words("virtual"), hint },
      { prompt: "Is the usual diverging-lens image upright or inverted?", acceptedAnswers: words("upright"), hint },
      { prompt: "Compared with the object, is the usual diverging-lens image larger or smaller?", acceptedAnswers: words("smaller"), hint },
      { prompt: "On which side of the lens is the usual diverging-lens image found?", acceptedAnswers: words("the object side", "object side"), hint },
      { prompt: "Can the usual diverging-lens image be caught on a screen?", acceptedAnswers: words("no"), hint },
      { prompt: "What do the dashed lines in a diverging-lens sketch represent?", acceptedAnswers: words("backward extensions", "backward extensions of the rays", "extensions"), hint },
      { prompt: "Do the real rays spread out or meet after a diverging lens?", acceptedAnswers: words("spread out", "diverge", "they diverge"), hint },
      { prompt: "Where is the ghost image relative to the lens and the near focus?", acceptedAnswers: words("between the lens and the focus", "between the lens and the near focus"), hint },
      { prompt: "Are the dashed extension lines real light beams?", acceptedAnswers: words("no"), hint },
    ]),
  ];
}

function l4ConceptRaw(): RawCollectionItem[] {
  const hint = "Say what the real rays do first, then explain what the dashed extensions are adding.";
  return [
    mc("Why is the image from a diverging lens called virtual?", ["Because the real rays only appear to come from that point", "Because the image is always brighter than the object", "Because the lens reflects instead of refracts", "Because the image has no position"], 0, "Virtual means apparent rather than an actual ray crossing.", hint),
    mc("Why is switching the extension overlay on and off useful in a diverging-lens simulation?", ["It separates the real spreading rays from the construction lines used to locate the image", "It changes the focal length", "It turns the lens into a mirror", "It makes the image real"], 0, "The two line roles need to stay distinct.", hint),
    mc("If the object moves farther from a diverging lens, what happens to the image?", ["It moves closer to the focus and remains virtual and smaller", "It moves beyond 2F and becomes real", "It moves onto the far side and inverts", "It disappears"], 0, "A distant object gives an image close to the focus.", hint),
    mc("Can a single diverging lens form a real image of a real object on its own?", ["No", "Yes, always", "Yes, but only at 2F", "Only if the image is upright"], 0, "A single diverging lens normally forms a virtual image for a real object.", hint),
    mc("Which statement about a diverging-lens image is strongest?", ["It is virtual because the image position comes from backward extensions, not a real crossing", "It is real because the lens is solid", "It is inverted because all lens images invert", "It must lie on the far side"], 0, "This keeps the image type tied to ray behavior.", hint),
    mc("Why does a screen fail to catch the usual diverging-lens image?", ["Because the rays reaching the screen are spreading rather than meeting", "Because the screen blocks the principal axis", "Because the image is behind the object", "Because the focus becomes zero"], 0, "No actual meeting means no sharp screen image.", hint),
    mc("What is the strongest contrast with a converging-lens real image?", ["A converging lens can make actual rays meet, while a diverging lens usually needs extensions to locate the image", "Both always use dashed lines to locate the final image", "Both always give inverted images", "Neither can form images on a screen"], 0, "The crossing-versus-extension contrast is the key difference.", hint),
    mc("What is the role of the near focus in a diverging-lens sketch?", ["It is the point from which the parallel ray appears to come", "It is where the real rays meet", "It is where the image always sits exactly", "It is the normal line"], 0, "The near focus anchors the backward-extension rule.", hint),
    mc("Why are dashed backward extensions still trustworthy even though they are not real rays?", ["Because they show the apparent source point consistent with the real rays reaching the eye", "Because dashed lines carry more energy", "Because virtual images need no geometry", "Because the lens projects them physically"], 0, "The extensions encode the apparent origin of the diverging bundle.", hint),
    mc("Which statement should be rejected?", ["A diverging lens usually gives an upright virtual image because actual rays cross on the far side", "A diverging lens usually gives a smaller image", "The real rays spread after the lens", "The image lies on the object side"], 0, "The first claim mixes virtual-image language with a real-ray crossing.", hint),
    shortCases([
      { prompt: "Why is the diverging-lens image virtual?", acceptedAnswers: words("because the real rays only appear to come from that point", "because no real rays meet there", "because only the extensions meet"), hint },
      { prompt: "Can a single diverging lens form a real image of a real object by itself?", acceptedAnswers: words("no"), hint },
      { prompt: "If the object is moved farther away, where does the diverging-lens image shift?", acceptedAnswers: words("toward the focus", "closer to the focus", "toward the near focus"), hint },
      { prompt: "Does the usual diverging-lens image stay upright or become inverted?", acceptedAnswers: words("upright"), hint },
      { prompt: "Why can a screen not catch the usual diverging-lens image?", acceptedAnswers: words("because no real rays meet there", "because the rays are still spreading", "because it is virtual"), hint },
      { prompt: "What kind of line locates the image in a diverging-lens sketch?", acceptedAnswers: words("dashed backward extensions", "backward extensions", "extensions"), hint },
      { prompt: "What do the real rays do after a diverging lens?", acceptedAnswers: words("they spread out", "they diverge", "spread out"), hint },
      { prompt: "Where is the virtual image found for a standard diverging lens?", acceptedAnswers: words("between the lens and the focus on the object side", "between the lens and the near focus on the object side"), hint },
      { prompt: "In the parallel-ray rule for a diverging lens, what role does the near focus play?", acceptedAnswers: words("the ray appears to come from it", "apparent source point", "the extension passes back through it"), hint },
      { prompt: "Compared with the object, is the standard diverging-lens image larger or smaller?", acceptedAnswers: words("smaller"), hint },
    ]),
  ];
}

function l5DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Check both conditions: the medium direction and the comparison with the critical angle.";
  return [
    mc("What is the critical angle?", ["The angle of incidence in the denser medium that gives a refracted ray along the boundary", "The reflected angle at which a mirror stops working", "The angle to the surface that gives a virtual image", "The angle at which all refraction stops in any direction"], 0, "The critical angle is the last escape case from the denser medium.", hint),
    mc("For total internal reflection to be possible, the light must start in:", ["The denser medium", "The less dense medium", "Air only", "Vacuum only"], 0, "TIR needs the light to be trying to leave the denser medium.", hint),
    mc("What happens to the refracted ray at exactly the critical angle?", ["It travels along the boundary", "It reflects straight back", "It goes through the normal", "It disappears completely"], 0, "At the critical angle the refracted ray skims the boundary.", hint),
    mc("What happens when the angle of incidence is above the critical angle in the correct medium direction?", ["Total internal reflection occurs", "The refracted ray leaves at 90 deg to the boundary", "There is no reflection at all", "The image becomes real"], 0, "Above the critical angle there is no escaping refracted ray.", hint),
    mc("What happens when the angle of incidence is below the critical angle in the correct medium direction?", ["Some light refracts out", "Total internal reflection occurs", "The refracted ray skims the boundary", "The normal disappears"], 0, "Below the limit there is still an escaping refracted ray.", hint),
    mc("Can total internal reflection happen when light goes from air into glass?", ["No", "Yes, always", "Yes, but only above 90 deg", "Only if the mirror is polished"], 0, "The direction is wrong for TIR because the light is entering the denser medium.", hint),
    mc("Which device relies on repeated total internal reflection?", ["An optical fibre", "A plane mirror only", "A thermometer", "A converging lens"], 0, "Optical fibres guide light by repeated TIR.", hint),
    mc("For a glass-to-air boundary with critical angle 42 deg, what happens at 55 deg incidence?", ["Total internal reflection", "Refraction along the boundary", "No reflection", "Normal incidence"], 0, "55 deg is above the critical angle and the medium direction is correct.", hint),
    mc("For a glass-to-air boundary with critical angle 42 deg, what happens at 42 deg incidence?", ["The refracted ray travels along the boundary", "Total internal reflection", "No refraction and no reflection", "The ray passes straight through undeviated"], 0, "Exactly critical means boundary-skimming refraction.", hint),
    mc("For an air-to-glass boundary with critical angle 42 deg quoted for glass-to-air, what happens at 55 deg incidence?", ["It refracts into the glass rather than showing total internal reflection", "Total internal reflection", "A ray skims the boundary", "No light enters"], 0, "The quoted critical-angle condition does not apply when entering the denser medium.", hint),
    shortCases([
      { prompt: "What does the critical angle mean?", acceptedAnswers: words("the angle in the denser medium that gives a refracted ray along the boundary", "the last escape angle", "the angle that gives a 90 degree refracted ray"), hint },
      { prompt: "At the critical angle, where does the refracted ray travel?", acceptedAnswers: words("along the boundary", "along the surface"), hint },
      { prompt: "Name one medium-direction condition needed for total internal reflection.", acceptedAnswers: words("light must travel from denser to less dense", "it must start in the denser medium", "from denser to less dense"), hint },
      { prompt: "Name the angle condition needed for total internal reflection.", acceptedAnswers: words("angle of incidence greater than the critical angle", "incident angle greater than critical angle", "above the critical angle"), hint },
      { prompt: "What is the repeated lock-bounce process inside an optical fibre called?", acceptedAnswers: words("total internal reflection"), hint },
      { prompt: "If the angle is 38 deg and the critical angle is 42 deg in the correct medium direction, does some light escape or not?", acceptedAnswers: words("some light escapes", "it refracts out", "escapes"), hint },
      { prompt: "If the angle is 55 deg and the critical angle is 42 deg in the correct medium direction, what happens?", acceptedAnswers: words("total internal reflection", "tir"), hint },
      { prompt: "Can total internal reflection happen from air to glass?", acceptedAnswers: words("no"), hint },
      { prompt: "Which device commonly uses repeated total internal reflection?", acceptedAnswers: words("optical fibre", "an optical fibre"), hint },
      { prompt: "Is the angle equal to the critical angle already total internal reflection?", acceptedAnswers: words("no"), hint },
    ]),
  ];
}

function l5ConceptRaw(): RawCollectionItem[] {
  const hint = "Treat the critical angle as a boundary story with three cases: below, equal, and above.";
  return [
    mc("Why is 'angle bigger than the critical angle' an incomplete rule by itself?", ["Because the light must also be trying to leave the denser medium", "Because the critical angle belongs to mirrors only", "Because every larger angle gives refraction instead", "Because the boundary surface is irrelevant"], 0, "The medium direction is essential as well.", hint),
    mc("Why is the critical angle called the last escape angle?", ["Because it is the largest incidence angle that still lets a refracted ray emerge", "Because it is the first angle that gives total internal reflection", "Because it is always 90 deg", "Because it removes reflection"], 0, "At exactly critical, light still escapes along the boundary.", hint),
    mc("Why does the wrong medium direction block total internal reflection?", ["Because entering a denser medium bends the ray toward the normal instead of creating the escape-limit situation", "Because the normal is reversed", "Because reflection stops existing", "Because the critical angle becomes zero"], 0, "TIR belongs to attempted escape from the denser side.", hint),
    mc("Why do optical fibres guide light effectively?", ["The core-boundary geometry keeps producing total internal reflection", "They keep increasing the frequency", "They make every ray parallel to the axis", "They remove the need for boundaries"], 0, "Repeated TIR traps the light in the fibre.", hint),
    mc("What is the strongest interpretation of a refracted ray that runs exactly along the boundary?", ["The incident angle is the critical angle", "Total internal reflection is already happening", "There is no reflection at all", "The medium direction does not matter"], 0, "Boundary-skimming refraction is the defining critical-angle clue.", hint),
    mc("Which sequence correctly describes the three cases in the correct medium direction?", ["Below critical: refracts out; at critical: skims boundary; above critical: total internal reflection", "Below critical: total internal reflection; at critical: no ray; above critical: refraction", "Below critical: no reflection; at critical: inversion; above critical: refraction only", "Below critical: skims boundary; at critical: total internal reflection; above critical: no reflection"], 0, "This preserves the full boundary story.", hint),
    mc("What is the strongest statement about the denser medium in a TIR problem?", ["It is the side from which the light must start before comparing the angle with the critical angle", "It is always air", "It is the side where the refracted ray travels", "It is irrelevant once the angle is known"], 0, "The denser side is built into the definition of the critical angle.", hint),
    mc("A light ray in water meets a water-air boundary at exactly the critical angle. What is the best description?", ["The refracted ray travels along the boundary", "Total internal reflection has already occurred", "The ray passes straight through undeviated", "The reflected ray disappears"], 0, "Exactly critical still has an escaping refracted ray.", hint),
    mc("If total internal reflection occurs, what happens to the transmitted refracted ray?", ["It does not escape into the second medium", "It leaves along the boundary", "It becomes a real image", "It moves through the normal"], 0, "Above the limit there is no escaping refracted ray.", hint),
    mc("Why can total internal reflection look mirror-like?", ["All the light is reflected back inside when the boundary conditions are satisfied", "The boundary becomes a metal mirror", "The refracted ray becomes brighter outside", "The image must be virtual"], 0, "The whole beam is sent back into the denser medium.", hint),
    shortCases([
      { prompt: "Why is 'angle greater than critical' incomplete as a total-internal-reflection rule?", acceptedAnswers: words("because the light must also be going from denser to less dense", "because the medium direction also matters", "because it must start in the denser medium"), hint },
      { prompt: "What does the critical angle mark in words?", acceptedAnswers: words("the last escape angle", "the last angle that still lets light escape", "the largest angle that still gives an escaping refracted ray"), hint },
      { prompt: "Why can no refracted ray escape above the critical angle in the correct direction?", acceptedAnswers: words("because total internal reflection sends the light back inside", "because all the light is reflected internally", "because no transmitted ray leaves"), hint },
      { prompt: "Why do optical fibres work?", acceptedAnswers: words("because they use repeated total internal reflection", "because repeated total internal reflection keeps the light inside", "because the light keeps reflecting internally"), hint },
      { prompt: "If a refracted ray skims along the boundary, what incident angle does that show?", acceptedAnswers: words("critical angle", "the critical angle"), hint },
      { prompt: "If the angle is below critical in the correct direction, does some light escape?", acceptedAnswers: words("yes"), hint },
      { prompt: "Can total internal reflection happen when light goes from air into glass?", acceptedAnswers: words("no"), hint },
      { prompt: "In a TIR problem, from which side must the light start?", acceptedAnswers: words("the denser medium", "denser medium"), hint },
      { prompt: "What is the event called when the incident angle is above critical in the correct direction?", acceptedAnswers: words("total internal reflection", "tir"), hint },
      { prompt: "Why is total internal reflection not just ordinary reflection at any boundary?", acceptedAnswers: words("because it needs the critical-angle and medium-direction conditions", "because it only happens above the critical angle from denser to less dense", "because it depends on the escape-limit condition"), hint },
    ]),
  ];
}

function l6DiagnosticRaw(): RawCollectionItem[] {
  const hint = "Name what each line is doing before you decide what image it proves.";
  return [
    mc("What is a ray diagram best thought of as?", ["A selected route map showing enough rays to predict the image", "A photograph of every beam in the system", "A graph of brightness against time", "A proof that all rays are straight forever"], 0, "Ray diagrams use a few representative rays, not every ray.", hint),
    mc("What is the normal in an optics sketch?", ["A reference line perpendicular to a surface", "A real light ray", "The image itself", "The principal focus"], 0, "The normal is a geometry aid, not a beam.", hint),
    mc("What does a dashed extension line usually represent?", ["The apparent continuation of a real ray", "A stronger real ray", "The mirror surface", "A screen position"], 0, "Dashed lines show apparent continuation, not real light travel.", hint),
    mc("What is a real image?", ["An image formed where actual rays meet", "An image found only by dashed extensions", "An image that must always be upright", "An image that cannot be projected"], 0, "Real images come from actual crossings.", hint),
    mc("What is a virtual image?", ["An image found where rays only appear to meet", "An image formed by actual crossing of rays", "An image that is always on a screen", "An image that always lies beyond 2F"], 0, "Virtual images come from apparent intersections.", hint),
    mc("Which image can normally be caught on a screen?", ["A real image", "A virtual image only", "A plane-mirror image only", "No image at all"], 0, "A screen needs actual rays to meet there.", hint),
    mc("What kind of image does a plane mirror produce?", ["Virtual", "Real", "Real and inverted only", "No image"], 0, "Plane mirrors use backward extensions to locate the image.", hint),
    mc("For a converging lens with the object outside F, the image is usually:", ["Real", "Virtual", "Always upright", "On the object side"], 0, "Outside F, a converging lens usually gives a real image.", hint),
    mc("For a diverging lens, the usual image is:", ["Virtual", "Real", "Always at 2F", "Always larger"], 0, "A single diverging lens usually gives a virtual image.", hint),
    mc("If actual rays cross on the far side of a lens, what kind of image is that?", ["Real", "Virtual", "No image", "A reflected image"], 0, "Actual crossing means a real image.", hint),
    shortCases([
      { prompt: "What kind of line is the normal in an optics sketch?", acceptedAnswers: words("a reference line", "reference line", "a line perpendicular to the surface"), hint },
      { prompt: "What kind of line is usually drawn dashed behind a mirror or lens sketch?", acceptedAnswers: words("an extension line", "a dashed extension", "backward extension"), hint },
      { prompt: "Which type of image can be caught on a screen?", acceptedAnswers: words("real image", "real"), hint },
      { prompt: "What kind of image comes from backward extensions meeting?", acceptedAnswers: words("virtual image", "virtual"), hint },
      { prompt: "Do selected rays in a ray diagram need to include every ray in the bundle?", acceptedAnswers: words("no"), hint },
      { prompt: "What phrase means actual rays intersect?", acceptedAnswers: words("true meeting point", "real image", "actual ray intersection"), hint },
      { prompt: "What phrase means only extensions intersect?", acceptedAnswers: words("ghost meeting point", "virtual image", "apparent intersection"), hint },
      { prompt: "Are guide lines such as normals real beams of light?", acceptedAnswers: words("no"), hint },
      { prompt: "What kind of image does a plane mirror produce?", acceptedAnswers: words("virtual"), hint },
      { prompt: "What kind of image does a converging lens usually form for an object outside F?", acceptedAnswers: words("real"), hint },
    ]),
  ];
}

function l6ConceptRaw(): RawCollectionItem[] {
  const hint = "Separate real rays, guide lines, and dashed extensions before deciding what the image means.";
  return [
    mc("Why does mixing line roles lead to weak optics answers?", ["Because a normal, a real ray, and a dashed extension do different jobs in the argument", "Because all lines in optics mean the same thing", "Because only the image line matters", "Because line color changes the physics"], 0, "The line role carries the meaning in a ray diagram.", hint),
    mc("Why are only a few rays needed in a standard sketch?", ["Because representative rays are enough to locate the image geometry", "Because the rest of the rays vanish", "Because thin lenses use only two rays physically", "Because only dashed lines matter"], 0, "Selected rays stand in for the full bundle.", hint),
    mc("What is the strongest contrast between real and virtual images?", ["Real images come from actual ray crossings and can usually be screened, while virtual images come from apparent crossings and cannot", "Real images are always smaller and virtual images are always larger", "Real images use normals while virtual images do not", "Real images belong only to mirrors"], 0, "Crossing behavior and screenability are the disciplined contrast.", hint),
    mc("If a student calls the normal a light ray, what is the best correction?", ["The normal is a reference line for angles, not a beam of light", "The normal is the brightest ray", "The normal is the image itself", "The normal is the reflected ray only"], 0, "This keeps the geometry tool separate from physical light travel.", hint),
    mc("What is the strongest similarity between a plane mirror and a diverging lens?", ["Both usually need backward extensions to locate a virtual image", "Both usually form real images on screens", "Both use a far focus for a parallel ray", "Both always invert the image"], 0, "They share virtual-image logic, not real-image screen logic.", hint),
    mc("What is the strongest contrast between a converging-lens real image and a plane-mirror image?", ["The converging-lens image comes from actual crossing, while the plane-mirror image comes from apparent extensions", "Both are produced by the same ray rule", "Both are always on the object side", "Both can be projected onto a screen"], 0, "This keeps real and virtual image stories distinct.", hint),
    mc("If dashed lines are removed from a virtual-image sketch, what is lost?", ["The apparent image position becomes unreadable", "The real rays disappear from the lens", "The surface normal stops existing", "The boundary no longer matters"], 0, "The extensions carry the virtual-image location.", hint),
    mc("Which statement about ray diagrams is strongest?", ["A ray diagram is trustworthy when each line is interpreted by role rather than treated as identical light", "Every line in a ray diagram is a beam of equal status", "A ray diagram works only if every ray in the bundle is shown", "Dashed lines prove the image is real"], 0, "Role discipline makes the sketch meaningful.", hint),
    mc("Why can selected rays still predict image position reliably?", ["Because image position depends on shared geometry that representative rays also obey", "Because all other rays are imaginary", "Because only one ray really exists in the system", "Because every lens has one fixed image point"], 0, "Representative rays obey the same optics rules as the rest of the bundle.", hint),
    mc("Which pair shares virtual-image logic most clearly?", ["A plane mirror and a diverging lens", "A converging lens outside F and a plane mirror", "A converging lens outside F and a screen", "A normal line and a focus"], 0, "Both rely on apparent backward intersections rather than actual crossings.", hint),
    shortCases([
      { prompt: "Why should line roles be labeled in a ray diagram?", acceptedAnswers: words("so you do not treat references and extensions as real rays", "so each line keeps its proper job", "to keep real rays, guide lines, and extensions separate"), hint },
      { prompt: "Why are a few selected rays enough in a standard sketch?", acceptedAnswers: words("because they are representative rays that still locate the image", "because representative rays obey the same geometry", "because they are enough to locate the image"), hint },
      { prompt: "What is the key difference between a true meeting point and a ghost meeting point?", acceptedAnswers: words("a true meeting point is an actual ray crossing while a ghost meeting point is only an apparent crossing", "real rays meet at a true meeting point but only extensions meet at a ghost meeting point", "actual rays versus extensions"), hint },
      { prompt: "Which image type can be formed on a screen?", acceptedAnswers: words("real image", "real"), hint },
      { prompt: "Why do plane mirrors and diverging lenses both need extensions to locate the image?", acceptedAnswers: words("because the real rays do not meet at the image point", "because the image is virtual in both cases", "because only extensions locate the apparent image"), hint },
      { prompt: "What is the normal used for in an optics sketch?", acceptedAnswers: words("measuring angles", "as the angle reference", "it is a reference line for angles"), hint },
      { prompt: "If actual rays cross, is the image real or virtual?", acceptedAnswers: words("real", "real image"), hint },
      { prompt: "If only backward extensions cross, is the image real or virtual?", acceptedAnswers: words("virtual", "virtual image"), hint },
      { prompt: "Why is a ray diagram a route map rather than a literal picture of all light?", acceptedAnswers: words("because selected rays stand in for the full bundle", "because it uses representative rays", "because not every ray is drawn"), hint },
      { prompt: "What should you never do with a dashed extension line?", acceptedAnswers: words("treat it as a real light ray", "treat it as a real beam", "call it real light"), hint },
    ]),
  ];
}

function diagnosticRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M8_L1":
      return l1DiagnosticRaw();
    case "M8_L2":
      return l2DiagnosticRaw();
    case "M8_L3":
      return l3DiagnosticRaw();
    case "M8_L4":
      return l4DiagnosticRaw();
    case "M8_L5":
      return l5DiagnosticRaw();
    case "M8_L6":
      return l6DiagnosticRaw();
    default:
      return [];
  }
}

function conceptRaw(code: string): RawCollectionItem[] {
  switch (normalizeCode(code)) {
    case "M8_L1":
      return l1ConceptRaw();
    case "M8_L2":
      return l2ConceptRaw();
    case "M8_L3":
      return l3ConceptRaw();
    case "M8_L4":
      return l4ConceptRaw();
    case "M8_L5":
      return l5ConceptRaw();
    case "M8_L6":
      return l6ConceptRaw();
    default:
      return [];
  }
}

export function m8GeneratedDiagnosticItems(code: string): UnknownRecord[] {
  return materializeBank(code, "diagnostic", diagnosticRaw(code));
}

export function m8GeneratedConceptGateItems(code: string): UnknownRecord[] {
  return materializeBank(code, "concept", conceptRaw(code));
}

export function m8GeneratedMasteryItems(code: string): UnknownRecord[] {
  return materializeBank(code, "mastery", [...diagnosticRaw(code), ...conceptRaw(code)]);
}
