export type ModuleGroupKey = "foundation" | "corePhysics" | "advancedPhysics";

export type CurriculumModuleMeta = {
  id: string;
  title: string;
  description: string;
  group: ModuleGroupKey;
};

export const MODULE_GROUP_ORDER: ModuleGroupKey[] = ["foundation", "corePhysics", "advancedPhysics"];

type ModuleLike = {
  id: string;
  title?: string;
  description?: string;
};

const INTERNAL_ANALOGY_TERMS = [
  "Measure-Map",
  "Mission-Track",
  "Pulse-Hearth",
  "Signal-Glow",
  "Lantern-Ring",
  "Balance Deck",
  "Lift-Launch",
  "Flow-Grid",
  "Carrier-Loop",
  "Field-Weave",
  "Core-Forge",
  "Beacon-City",
  "Skycourt",
  "Stretchmap",
  "Switchyard",
];

const ANALOGY_HEADING_CLAUSE_PATTERNS = [
  /[,:;]?\s+taught through the [^.?!]+/gi,
  /[,:;]?\s+using the [^.?!]+(?:model|world)[^.?!]*/gi,
  /[,:;]?\s+through the [^.?!]+(?:model|world)[^.?!]*/gi,
  /[,:;]?\s+inside one coherent [^.?!]+/gi,
  /[,:;]?\s+inside the [^.?!]+(?:model|world)[^.?!]*/gi,
  /[,:;]?\s+so [^.?!]+ stay inside [^.?!]+/gi,
];

const MODULE_CURRICULUM: Record<string, CurriculumModuleMeta> = {
  F1: {
    id: "F1",
    title: "Scientific Measurement and Representation",
    description: "Use SI units, conversions, scalars and vectors, measurement resolution, uncertainty, density, and graph-based representation.",
    group: "foundation",
  },
  F2: {
    id: "F2",
    title: "Motion, Forces and Energy",
    description: "Study motion, velocity, acceleration, resultant force, work done, power, energy stores, and conservation in foundation contexts.",
    group: "foundation",
  },
  F3: {
    id: "F3",
    title: "Matter, Particles and Thermal Behaviour",
    description: "Use the particle model to explain states of matter, temperature, internal energy, pressure, change of state, and thermal behaviour.",
    group: "foundation",
  },
  F4: {
    id: "F4",
    title: "Waves, Light and Electricity",
    description: "Study waves through amplitude, wavelength and frequency, sound and light behaviour, reflection and refraction, simple circuits, and electrical safety.",
    group: "foundation",
  },
  F5: {
    id: "F5",
    title: "Observable Earth and Sky",
    description: "Study Earth-Moon-Sun relationships, day and night, seasons, Moon phases, eclipses, the Solar System, and apparent sky motion.",
    group: "foundation",
  },
  M1: {
    id: "M1",
    title: "Motion and Kinematics",
    description: "Use displacement, velocity, acceleration, graphs, and constant-acceleration relations to describe and predict motion.",
    group: "corePhysics",
  },
  M2: {
    id: "M2",
    title: "Forces and Equilibrium",
    description: "Study resultant force, Newtonian motion, moments, equilibrium, stability, momentum, and vector components.",
    group: "corePhysics",
  },
  M3: {
    id: "M3",
    title: "Momentum, Work, Energy and Power",
    description: "Study momentum, collisions, work, energy transfers, power, and efficiency in quantitative contexts.",
    group: "corePhysics",
  },
  M4: {
    id: "M4",
    title: "Materials, Density and Pressure",
    description: "Study density, pressure in solids and fluids, atmospheric pressure, and how material properties affect physical behaviour.",
    group: "corePhysics",
  },
  M5: {
    id: "M5",
    title: "Particle Model and Internal Energy",
    description: "Use the particle model to explain solids, liquids, gases, Brownian motion, internal energy, and changes of state.",
    group: "corePhysics",
  },
  M6: {
    id: "M6",
    title: "Thermal Transfer and Gas Behaviour",
    description: "Study conduction, convection, radiation, specific heat capacity, latent heat, gas behaviour, and thermal equilibrium.",
    group: "corePhysics",
  },
  M7: {
    id: "M7",
    title: "Waves and Vibrations",
    description: "Study vibrations, wave properties, sound behaviour, wave speed, and the relationships among frequency, wavelength, and amplitude.",
    group: "corePhysics",
  },
  M8: {
    id: "M8",
    title: "Light and Optics",
    description: "Study reflection, refraction, lenses, total internal reflection, image formation, and optical paths.",
    group: "corePhysics",
  },
  M9: {
    id: "M9",
    title: "Electrical Quantities and Circuits",
    description: "Study charge conservation, current as charge flow rate, voltage as energy per charge, resistance from material and geometry, Ohm's law and I-V characteristics, and quantitative analysis of series, parallel, and mixed circuits.",
    group: "corePhysics",
  },
  M10: {
    id: "M10",
    title: "Magnetism and Electromagnetic Effects",
    description: "Study magnetic fields, electromagnets, the motor effect, electromagnetic induction, generators, transformers, and power transmission.",
    group: "corePhysics",
  },
  M11: {
    id: "M11",
    title: "Atomic Structure and Radioactivity",
    description: "Study atoms, isotopes, radiation types, radioactive decay, half-life, background radiation, and nuclear equations.",
    group: "corePhysics",
  },
  M12: {
    id: "M12",
    title: "Nuclear Energy and Applications",
    description: "Study binding energy, fission, fusion, reactors, radioisotope uses, and the benefits, hazards, and management of nuclear technologies.",
    group: "corePhysics",
  },
  M13: {
    id: "M13",
    title: "Earth and the Solar System",
    description: "Study orbital motion, Earth's rotation, axial tilt, Moon-phase geometry, eclipses, apparent sky motion, and Solar System structure.",
    group: "corePhysics",
  },
  M14: {
    id: "M14",
    title: "Stars and the Universe",
    description: "Study stars, stellar life cycles, galaxies, the Milky Way, light-years, redshift, and the Big Bang model.",
    group: "corePhysics",
  },
  A1: {
    id: "A1",
    title: "Matter, Radiation and Particles",
    description: "Study subatomic particles, radiation, quark structure, particle interactions, and conservation rules in particle events.",
    group: "advancedPhysics",
  },
  A2: {
    id: "A2",
    title: "Quantum Phenomena and Atomic Spectra",
    description: "Study quantized energy levels, line spectra, photoelectric emission, excitation, ionisation, and wave-particle duality.",
    group: "advancedPhysics",
  },
  A3: {
    id: "A3",
    title: "Advanced Waves and Optics",
    description: "Study superposition, stationary waves, interference, diffraction, refraction, total internal reflection, and wave evidence.",
    group: "advancedPhysics",
  },
  A4: {
    id: "A4",
    title: "Advanced Mechanics and Materials",
    description: "Study vector resolution, multi-dimensional motion, projectiles, momentum, circular motion, stress, strain, and material response.",
    group: "advancedPhysics",
  },
  A5: {
    id: "A5",
    title: "Oscillations",
    description: "Study restoring effects, simple harmonic motion, oscillation graphs, energy changes, resonance, damping, and applications.",
    group: "advancedPhysics",
  },
  A6: {
    id: "A6",
    title: "Thermal Physics and Gases",
    description: "Study thermal energy, internal energy, gas pressure, gas laws, and thermal behaviour through particle models.",
    group: "advancedPhysics",
  },
  A7: {
    id: "A7",
    title: "DC Circuits and Capacitors",
    description: "Study DC circuit analysis, resistance networks, EMF, internal resistance, capacitors, and charge-storage behaviour.",
    group: "advancedPhysics",
  },
  A8: {
    id: "A8",
    title: "Electric and Magnetic Fields",
    description: "Study electric fields, magnetic fields, field strength, forces on charges and currents, and motion in fields.",
    group: "advancedPhysics",
  },
  A9: {
    id: "A9",
    title: "Electromagnetic Induction and Power",
    description: "Study magnetic flux, induced EMF, AC generation, transformers, RMS values, and electrical power transmission.",
    group: "advancedPhysics",
  },
  A10: {
    id: "A10",
    title: "Nuclear and Particle Applications",
    description: "Study nuclear structure, decay, binding energy, fission, fusion, particle detection, and practical nuclear applications.",
    group: "advancedPhysics",
  },
  A11: {
    id: "A11",
    title: "Astrophysics, Gravitation and Cosmology",
    description: "Study gravitation, orbital motion, stellar evidence, galactic structure, and cosmological models of the universe.",
    group: "advancedPhysics",
  },
};

const REVISED_CURRICULUM_LEGACY_LESSON_PREFIXES: Record<string, string> = {
  M10: "M12",
  M11: "M13",
  M13: "M14",
};

export function normalizeModuleId(value: string | undefined | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const collapsed = raw.replace(/[^A-Za-z0-9]+/g, "").toUpperCase();
  if (/^F[1-9]\d*$/.test(collapsed)) return collapsed;
  if (/^A[1-9]\d*$/.test(collapsed)) return collapsed;

  const advancedAliasMatch = collapsed.match(/^MA([1-9]\d*)$/);
  if (advancedAliasMatch) {
    return `A${advancedAliasMatch[1]}`;
  }

  const moduleMatch = collapsed.match(/^(?:MODULE)?(\d+)$/);
  if (moduleMatch) {
    return `M${moduleMatch[1]}`;
  }

  const moduleKeyMatch = collapsed.match(/^M(\d+)$/);
  if (moduleKeyMatch) {
    return `M${moduleKeyMatch[1]}`;
  }

  return raw.toUpperCase();
}

export function canonicalizeModuleScopedLessonId(moduleId: string | undefined | null, lessonId: string | undefined | null): string {
  const normalizedLessonId = String(lessonId || "").trim().replace(/-/g, "_").toUpperCase();
  if (!normalizedLessonId) return "";

  const normalizedModuleId = normalizeModuleId(moduleId);
  const legacyPrefix = REVISED_CURRICULUM_LEGACY_LESSON_PREFIXES[normalizedModuleId];
  if (!legacyPrefix) return normalizedLessonId;

  return normalizedLessonId.replace(
    new RegExp(`^${legacyPrefix}((?:_)?L\\d+(?:_[A-Z0-9]+)*)$`),
    `${normalizedModuleId}$1`,
  );
}

export function curriculumMetaForModule(moduleId: string | undefined | null): CurriculumModuleMeta | undefined {
  const normalized = normalizeModuleId(moduleId);
  return normalized ? MODULE_CURRICULUM[normalized] : undefined;
}

export function sanitizeModuleHeadingDescription(description: string | undefined | null): string | undefined {
  let cleaned = String(description || "").trim();
  if (!cleaned) return undefined;

  for (const pattern of ANALOGY_HEADING_CLAUSE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  const firstAnalogyIndex = INTERNAL_ANALOGY_TERMS
    .map((term) => cleaned.toLowerCase().indexOf(term.toLowerCase()))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (typeof firstAnalogyIndex === "number") {
    cleaned = cleaned.slice(0, firstAnalogyIndex);
  }

  cleaned = cleaned
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[,:;\s-]+$/g, "")
    .trim();

  if (!cleaned) return undefined;
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

export function applyCurriculumModuleMeta<T extends ModuleLike>(moduleItem: T): T {
  const meta = curriculumMetaForModule(moduleItem.id);
  if (!meta) {
    const sanitizedDescription = sanitizeModuleHeadingDescription(moduleItem.description);
    if (sanitizedDescription === moduleItem.description) return moduleItem;
    return {
      ...moduleItem,
      description: sanitizedDescription,
    };
  }
  return {
    ...moduleItem,
    id: meta.id,
    title: meta.title,
    description: meta.description,
  };
}

export function curriculumModules(): CurriculumModuleMeta[] {
  return Object.values(MODULE_CURRICULUM).sort((left, right) => {
    const leftGroupIndex = MODULE_GROUP_ORDER.indexOf(left.group);
    const rightGroupIndex = MODULE_GROUP_ORDER.indexOf(right.group);
    if (leftGroupIndex !== rightGroupIndex) {
      return leftGroupIndex - rightGroupIndex;
    }
    return left.id.localeCompare(right.id, undefined, { numeric: true });
  });
}

export function curriculumModulesByGroup(): Record<ModuleGroupKey, CurriculumModuleMeta[]> {
  return curriculumModules().reduce<Record<ModuleGroupKey, CurriculumModuleMeta[]>>(
    (groups, moduleMeta) => {
      groups[moduleMeta.group].push(moduleMeta);
      return groups;
    },
    {
      foundation: [],
      corePhysics: [],
      advancedPhysics: [],
    },
  );
}
