"use client";

type UnknownRecord = Record<string, unknown>;

export type TechnicalWordEntry = {
  term: string;
  meaning: string;
  why_it_matters?: string;
  source?: string;
};

const CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS: Record<string, TechnicalWordSeed[]> = {
  A1: [
    { term: "Charge tag", aliases: ["charge tag", "charge tags"], meaning: "A charge tag is the electric-charge label attached to a particle, such as +1e, 0, or -1e.", why_it_matters: "It helps compare charged and neutral particles without using charge as the only classification rule." },
    { term: "Hadron", aliases: ["hadron", "hadrons"], meaning: "A hadron is a composite particle built from quarks and held together by the strong interaction.", why_it_matters: "It is the umbrella family that contains baryons and mesons." },
    { term: "Quark", aliases: ["quark", "quarks"], meaning: "A quark is a fundamental particle that combines to form hadrons.", why_it_matters: "It explains hadron structure." },
    { term: "Fundamental interaction", aliases: ["fundamental interaction", "fundamental interactions"], meaning: "A fundamental interaction is a basic way particles influence one another.", why_it_matters: "It organizes particle events into families." },
    { term: "Strong interaction", aliases: ["strong interaction"], meaning: "The strong interaction binds quarks inside hadrons and helps bind nucleons in nuclei.", why_it_matters: "It explains hadron and nucleus stability." },
    { term: "Weak interaction", aliases: ["weak interaction"], meaning: "The weak interaction is involved in processes such as beta decay and neutrino interactions.", why_it_matters: "It connects particle change to nuclear and lepton events." },
    { term: "Reaction channel", aliases: ["reaction channel", "reaction channels"], meaning: "A reaction channel is one allowed set of products from a particle interaction.", why_it_matters: "It organizes alternative outcomes." },
    { term: "Decay", aliases: ["decay"], meaning: "A decay is the spontaneous transformation of an unstable particle into other particles.", why_it_matters: "It is a common event family that still obeys conservation rules." },
    { term: "Scattering", aliases: ["scattering"], meaning: "Scattering is an interaction where incoming particles deflect or exchange energy and momentum.", why_it_matters: "It broadens event analysis beyond simple decay." },
  ],
  A2: [
    { term: "Energy level", aliases: ["energy level", "energy levels"], meaning: "An energy level is a discrete allowed energy state for an electron in an atom.", why_it_matters: "It is the foundation of atomic spectra." },
    { term: "Quantized", aliases: ["quantized", "quantised"], meaning: "Quantized means limited to specific allowed values rather than any continuous value.", why_it_matters: "It protects the ladder-floor idea." },
    { term: "Excitation", aliases: ["excitation", "excited"], meaning: "Excitation is the lifting of an electron to a higher energy level.", why_it_matters: "It makes later emission and absorption readable." },
    { term: "Ground state", aliases: ["ground state"], meaning: "The ground state is the lowest allowed energy level of the atom.", why_it_matters: "It is the natural reference point for electron jumps." },
    { term: "Emission spectrum", aliases: ["emission spectrum"], meaning: "An emission spectrum is the set of discrete wavelengths emitted when electrons fall to lower levels.", why_it_matters: "It turns return jumps into visible evidence." },
    { term: "Absorption spectrum", aliases: ["absorption spectrum"], meaning: "An absorption spectrum is the set of wavelengths removed when electrons absorb specific photon energies.", why_it_matters: "It shows the same energy gaps from the opposite direction." },
    { term: "Line spectrum", aliases: ["line spectrum"], meaning: "A line spectrum contains discrete lines rather than a continuous spread.", why_it_matters: "It is the fingerprint of quantized levels." },
    { term: "Transition", aliases: ["transition", "transitions"], meaning: "A transition is a jump from one energy level to another.", why_it_matters: "It connects the ladder model to the spectrum lines." },
    { term: "Photoelectric effect", aliases: ["photoelectric effect"], meaning: "The photoelectric effect is the emission of electrons from a surface when light above threshold frequency strikes it.", why_it_matters: "It is key evidence for photon packets." },
    { term: "Threshold frequency", aliases: ["threshold frequency"], meaning: "Threshold frequency is the minimum light frequency needed to release electrons from a surface.", why_it_matters: "It blocks the intensity-only misconception." },
    { term: "Work function", aliases: ["work function"], meaning: "The work function is the minimum energy needed to liberate an electron from the surface.", why_it_matters: "It is the unlock gate for the material." },
    { term: "Photoelectron", aliases: ["photoelectron", "photoelectrons"], meaning: "A photoelectron is an electron emitted from the surface by the photoelectric effect.", why_it_matters: "It is the outgoing traveler in the event." },
    { term: "Ionisation", aliases: ["ionisation", "ionization"], meaning: "Ionisation is the complete removal of an electron from the atom.", why_it_matters: "It is the full unlock case beyond ordinary excitation." },
    { term: "Ionisation energy", aliases: ["ionisation energy", "ionization energy"], meaning: "Ionisation energy is the minimum energy needed to remove an electron completely from the atom.", why_it_matters: "It sets the top exit gate of the ladder." },
    { term: "Excited state", aliases: ["excited state"], meaning: "An excited state is a higher allowed atomic level reached without removing the electron from the atom.", why_it_matters: "It is a lifted but still bound state." },
    { term: "Continuum", aliases: ["continuum"], meaning: "The continuum is the range of energies above the ionisation threshold where the electron is no longer bound.", why_it_matters: "It separates bound levels from free states." },
    { term: "Wave-particle duality", aliases: ["wave-particle duality", "wave particle duality"], meaning: "Wave-particle duality means quantum objects show both localized particle-like and wave-like behavior depending on the experiment.", why_it_matters: "It prevents the false either-or view." },
    { term: "de Broglie wavelength", aliases: ["de broglie wavelength", "debroglie wavelength"], meaning: "The de Broglie wavelength is the wavelength associated with a particle's momentum.", why_it_matters: "It connects matter motion to wave behavior." },
    { term: "Diffraction", aliases: ["diffraction"], meaning: "Diffraction is the spreading of waves after passing through an aperture or around an obstacle.", why_it_matters: "It provides evidence for wave behavior." },
    { term: "Momentum", aliases: ["momentum"], meaning: "Momentum is the quantity p = m v for the moving particle.", why_it_matters: "It sets the matter-wave wavelength scale." },
    { term: "Atomic spectrum", aliases: ["atomic spectrum"], meaning: "An atomic spectrum is the set of allowed spectral lines associated with one atom.", why_it_matters: "It is the fingerprint output of its energy ladder." },
    { term: "Threshold behavior", aliases: ["threshold behavior", "threshold behaviour"], meaning: "Threshold behavior is the sudden onset of an effect only after a critical value is exceeded.", why_it_matters: "It appears in photoelectric and ionisation ideas." },
  ],
  A3: [
    { term: "Progressive wave", aliases: ["progressive wave", "progressive waves"], meaning: "A progressive wave transfers energy as the disturbance travels through space.", why_it_matters: "It separates traveling patterns from stationary ones." },
    { term: "Superposition", aliases: ["superposition"], meaning: "Superposition says the total displacement is the sum of the overlapping displacements.", why_it_matters: "It is the core addition rule for waves." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the signed distance of the medium from equilibrium.", why_it_matters: "It is the quantity that adds during overlap." },
    { term: "Stationary wave", aliases: ["stationary wave", "stationary waves", "standing wave", "standing waves"], meaning: "A stationary wave is a standing pattern formed by two opposite-traveling waves of the same frequency.", why_it_matters: "It explains fixed nodes and antinodes." },
    { term: "Node", aliases: ["node", "nodes"], meaning: "A node is a point that remains at zero displacement in a stationary wave.", why_it_matters: "It is the fixed quiet point in the pattern." },
    { term: "Antinode", aliases: ["antinode", "antinodes"], meaning: "An antinode is a point of maximum oscillation amplitude in a stationary wave.", why_it_matters: "It marks where the oscillation is strongest." },
    { term: "Harmonic", aliases: ["harmonic", "harmonics"], meaning: "A harmonic is one allowed standing-wave mode in the system.", why_it_matters: "It connects boundary conditions to allowed patterns." },
    { term: "Interference", aliases: ["interference"], meaning: "Interference is the pattern produced when coherent waves superpose.", why_it_matters: "It turns phase comparison into visible outcomes." },
    { term: "Path difference", aliases: ["path difference"], meaning: "Path difference is the difference in route length traveled by two waves.", why_it_matters: "It is the route measure that sets the meeting condition." },
    { term: "Phase difference", aliases: ["phase difference"], meaning: "Phase difference compares how far apart two oscillations are in the cycle.", why_it_matters: "It translates route difference into wave alignment." },
    { term: "Coherent sources", aliases: ["coherent sources", "coherent source"], meaning: "Coherent sources maintain a constant phase relationship.", why_it_matters: "They are needed for stable interference patterns." },
    { term: "Diffraction grating", aliases: ["diffraction grating"], meaning: "A diffraction grating is a large set of equally spaced slits.", why_it_matters: "It creates sharp interference maxima." },
    { term: "Grating spacing", aliases: ["grating spacing"], meaning: "Grating spacing is the distance between adjacent slits in the grating.", why_it_matters: "It controls the diffraction angles." },
    { term: "Order", aliases: ["order"], meaning: "Order labels a bright maximum in the grating pattern.", why_it_matters: "It turns the angle pattern into a countable family." },
    { term: "Refraction", aliases: ["refraction"], meaning: "Refraction is the change in direction caused by a change in wave speed between media.", why_it_matters: "It ties bending to speed, not sideways force." },
    { term: "Refractive index", aliases: ["refractive index"], meaning: "Refractive index measures how much the wave speed is reduced in a medium.", why_it_matters: "It helps compare optical density and route bending." },
    { term: "Critical angle", aliases: ["critical angle"], meaning: "The critical angle is the incident angle in the denser medium that gives a refracted angle of 90 degrees.", why_it_matters: "It marks the threshold for total internal reflection." },
    { term: "Total internal reflection", aliases: ["total internal reflection"], meaning: "Total internal reflection occurs when no refracted ray emerges and the wave is reflected back into the denser medium.", why_it_matters: "It explains light guiding in optical systems." },
    { term: "Oscilloscope", aliases: ["oscilloscope"], meaning: "An oscilloscope displays voltage against time as a trace.", why_it_matters: "It makes fast wave behavior readable." },
    { term: "Time base", aliases: ["time base"], meaning: "The time base sets how much time each horizontal division represents.", why_it_matters: "It is needed to extract frequency or period." },
  ],
  A4: [
    { term: "Vector", aliases: ["vector", "vectors"], meaning: "A vector has magnitude and direction.", why_it_matters: "It is the natural language for forces and motion." },
    { term: "Component", aliases: ["component", "components"], meaning: "A component is the projection of a vector on a chosen axis.", why_it_matters: "It makes diagonal forces calculable." },
    { term: "Equilibrium", aliases: ["equilibrium"], meaning: "Equilibrium means the resultant force and resultant moment are balanced for the situation studied.", why_it_matters: "It is the balance condition for the rig." },
    { term: "Resultant", aliases: ["resultant"], meaning: "The resultant is the single vector equivalent to the combined effect of several vectors.", why_it_matters: "It shows whether the system is balanced or not." },
    { term: "Velocity", aliases: ["velocity"], meaning: "Velocity is the rate of change of displacement and has direction.", why_it_matters: "It distinguishes directed motion from speed alone." },
    { term: "Acceleration", aliases: ["acceleration"], meaning: "Acceleration is the rate of change of velocity.", why_it_matters: "It tells how the motion state is changing." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the directed change in position.", why_it_matters: "It anchors kinematics to a vector quantity." },
    { term: "Component motion", aliases: ["component motion"], meaning: "Component motion treats horizontal and vertical motion separately before recombining them.", why_it_matters: "It is vital in two-dimensional reasoning." },
    { term: "Projectile", aliases: ["projectile", "projectiles"], meaning: "A projectile is an object moving under gravity after launch, with no further driving force assumed.", why_it_matters: "It frames the path after release." },
    { term: "Horizontal component", aliases: ["horizontal component"], meaning: "The horizontal component is the sideways part of the launch velocity.", why_it_matters: "It sets the sideways motion." },
    { term: "Vertical component", aliases: ["vertical component"], meaning: "The vertical component is the up-down part of the launch velocity.", why_it_matters: "It sets the rise and fall behavior." },
    { term: "Time of flight", aliases: ["time of flight"], meaning: "Time of flight is the total time the projectile remains in the air for the chosen model.", why_it_matters: "It links the two component stories with one clock." },
    { term: "Momentum", aliases: ["momentum"], meaning: "Momentum is the product of mass and velocity.", why_it_matters: "It is the central bookkeeping quantity in collisions." },
    { term: "Impulse", aliases: ["impulse"], meaning: "Impulse is the change in momentum produced by a force acting over a time interval.", why_it_matters: "It links force and collision time to momentum change." },
    { term: "Elastic collision", aliases: ["elastic collision"], meaning: "An elastic collision conserves kinetic energy as well as momentum in the ideal model.", why_it_matters: "It contrasts with inelastic outcomes." },
    { term: "Inelastic collision", aliases: ["inelastic collision"], meaning: "An inelastic collision conserves momentum but not kinetic energy.", why_it_matters: "It keeps momentum conservation separate from energy distribution." },
    { term: "Centripetal acceleration", aliases: ["centripetal acceleration"], meaning: "Centripetal acceleration is the inward acceleration required for circular motion.", why_it_matters: "It explains why the velocity direction keeps changing." },
    { term: "Centripetal force", aliases: ["centripetal force"], meaning: "Centripetal force is the inward resultant force producing the circular path.", why_it_matters: "It is not a separate outward force." },
    { term: "Tangential velocity", aliases: ["tangential velocity"], meaning: "Tangential velocity is the instantaneous velocity along the tangent to the circular path.", why_it_matters: "It keeps speed and direction distinct." },
    { term: "Radius", aliases: ["radius"], meaning: "Radius is the distance from the center of the circle to the moving object.", why_it_matters: "It sets the curvature scale of the path." },
    { term: "Spring constant", aliases: ["spring constant"], meaning: "The spring constant measures how stiff a spring is in Hooke's-law behavior.", why_it_matters: "It links force to extension." },
    { term: "Stress", aliases: ["stress"], meaning: "Stress is force per unit cross-sectional area.", why_it_matters: "It compares load with the size of the material." },
    { term: "Strain", aliases: ["strain"], meaning: "Strain is extension divided by original length.", why_it_matters: "It compares change in length with the starting size." },
    { term: "Young modulus", aliases: ["young modulus", "young's modulus"], meaning: "Young modulus is the ratio of stress to strain in the elastic region.", why_it_matters: "It measures material stiffness rather than spring stiffness." },
  ],
  A5: [
    { term: "Oscillation", aliases: ["oscillation", "oscillations"], meaning: "An oscillation is a repeated motion about an equilibrium position.", why_it_matters: "It defines the whole module world." },
    { term: "Equilibrium position", aliases: ["equilibrium position"], meaning: "The equilibrium position is the balance point about which the motion occurs.", why_it_matters: "It anchors the return story." },
    { term: "Restoring force", aliases: ["restoring force"], meaning: "A restoring force acts toward the equilibrium position.", why_it_matters: "It is the reason the motion keeps returning." },
    { term: "Amplitude", aliases: ["amplitude"], meaning: "Amplitude is the maximum displacement from equilibrium.", why_it_matters: "It measures the size of the oscillation." },
    { term: "Simple harmonic motion", aliases: ["simple harmonic motion", "shm"], meaning: "Simple harmonic motion is oscillation where acceleration is proportional to displacement and directed toward equilibrium.", why_it_matters: "It gives the formal condition for SHM." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the signed distance from equilibrium.", why_it_matters: "It sets the restoring response." },
    { term: "Acceleration", aliases: ["acceleration"], meaning: "Acceleration is the rate of change of velocity.", why_it_matters: "In SHM it points toward equilibrium." },
    { term: "Angular frequency", aliases: ["angular frequency"], meaning: "Angular frequency sets how quickly the SHM cycles repeat.", why_it_matters: "It connects the motion to the equations." },
    { term: "Phase", aliases: ["phase"], meaning: "Phase tells where the oscillator is in its cycle.", why_it_matters: "It connects the different graphs." },
    { term: "Period", aliases: ["period"], meaning: "The period is the time for one complete oscillation.", why_it_matters: "It links the graph spacing to frequency." },
    { term: "Frequency", aliases: ["frequency"], meaning: "Frequency is the number of oscillations per second.", why_it_matters: "It is the reciprocal of the period." },
    { term: "Sinusoidal graph", aliases: ["sinusoidal graph"], meaning: "A sinusoidal graph is the smooth periodic trace associated with ideal SHM.", why_it_matters: "It gives the recognizable time pattern." },
    { term: "Kinetic energy", aliases: ["kinetic energy"], meaning: "Kinetic energy is the motion energy of the oscillator.", why_it_matters: "It is largest as the oscillator passes equilibrium." },
    { term: "Potential energy", aliases: ["potential energy"], meaning: "Potential energy is the stored energy associated with displacement in the restoring system.", why_it_matters: "It is largest at maximum displacement." },
    { term: "Total energy", aliases: ["total energy"], meaning: "Total energy is the sum of kinetic and potential energy in the ideal oscillator.", why_it_matters: "It stays constant when no damping is present." },
    { term: "Forced oscillation", aliases: ["forced oscillation", "forced oscillations"], meaning: "A forced oscillation is maintained by an external periodic driving force.", why_it_matters: "It separates self-return from continued driving." },
    { term: "Natural frequency", aliases: ["natural frequency"], meaning: "The natural frequency is the frequency at which the system oscillates most readily on its own.", why_it_matters: "It sets the preferred timing of the oscillator." },
    { term: "Resonance", aliases: ["resonance"], meaning: "Resonance is the large-amplitude response when the driving frequency matches the natural frequency closely.", why_it_matters: "It is the key amplification idea." },
    { term: "Driving frequency", aliases: ["driving frequency"], meaning: "The driving frequency is the frequency of the external periodic force.", why_it_matters: "It is compared against the system's own timing." },
    { term: "Damping", aliases: ["damping"], meaning: "Damping is the removal of oscillation energy by resistive effects.", why_it_matters: "It explains why real oscillations often fade." },
    { term: "Underdamped", aliases: ["underdamped"], meaning: "Underdamped means the system still oscillates while the amplitude decreases.", why_it_matters: "It is the repeated-but-fading case." },
    { term: "Critically damped", aliases: ["critically damped"], meaning: "Critically damped means the system returns to equilibrium quickly without oscillating.", why_it_matters: "It is often the design target for fast settling." },
    { term: "Overdamped", aliases: ["overdamped"], meaning: "Overdamped means the system returns without oscillating but more slowly than the critically damped case.", why_it_matters: "It contrasts slow return with oscillatory fading." },
  ],
};

const FORMULA_SYMBOL_TECHNICAL_WORDS: TechnicalWordSeed[] = [
  { term: "e", aliases: ["e", "charge in e", "elementary charge"], meaning: "e is the magnitude of the elementary charge, used as the standard charge unit for particles.", why_it_matters: "It lets charge values be compared cleanly in particle and atomic physics." },
  { term: "eV", aliases: ["ev", "electronvolt", "electron volt"], meaning: "An electronvolt is the energy gained by one elementary charge moving through a potential difference of one volt.", why_it_matters: "It is a convenient small energy unit in atomic and particle physics." },
  { term: "keV", aliases: ["kev", "kiloelectronvolt"], meaning: "A kiloelectronvolt is one thousand electronvolts.", why_it_matters: "It keeps medium-sized atomic energies readable." },
  { term: "MeV", aliases: ["mev", "megaelectronvolt", "mega electronvolt"], meaning: "A megaelectronvolt is one million electronvolts.", why_it_matters: "It is a standard energy unit in nuclear and particle physics." },
  { term: "GeV", aliases: ["gev", "gigaelectronvolt", "giga electronvolt"], meaning: "A gigaelectronvolt is one billion electronvolts.", why_it_matters: "It is useful for high-energy particle events." },
  { term: "Hz", aliases: ["hz", "hertz"], meaning: "Hertz is the unit of frequency and means cycles per second.", why_it_matters: "It connects repeating behavior to a measurable rate." },
  { term: "nm", aliases: ["nm", "nanometre", "nanometer"], meaning: "A nanometre is one billionth of a metre.", why_it_matters: "It is a standard unit for wavelengths of light." },
  { term: "Pa", aliases: ["pa", "pascal", "pascals"], meaning: "A pascal is one newton of force per square metre.", why_it_matters: "It is the standard unit for pressure and stress." },
  { term: "h", aliases: ["h", "planck constant"], meaning: "h is Planck's constant, the constant that links photon energy with frequency.", why_it_matters: "It anchors several key quantum relations." },
  { term: "lambda (wavelength symbol)", aliases: ["lambda", "wavelength symbol"], meaning: "lambda is the symbol commonly used for wavelength.", why_it_matters: "It makes wave and quantum equations easier to read." },
  { term: "omega (angular-frequency symbol)", aliases: ["omega", "angular frequency"], meaning: "omega is the symbol used for angular frequency in oscillation and SHM formulas.", why_it_matters: "It connects the algebra to the oscillator's cycle rate." },
  { term: "phi (work-function symbol)", aliases: ["phi", "work function symbol"], meaning: "phi is the symbol often used for work function in photoelectric equations.", why_it_matters: "It keeps the threshold-energy term identifiable inside the formula." },
];

type TechnicalWordSeed = TechnicalWordEntry & {
  aliases?: string[];
};

const STRICT_AUTHORED_TECHNICAL_WORD_MODULES = new Set([
  "F5",
  "M9",
  "M10",
  "M11",
  "M12",
  "M13",
  "M14",
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "A6",
  "A7",
  "A8",
  "A9",
  "A10",
  "A11",
]);

const MODULE_TECHNICAL_WORDS: Record<string, TechnicalWordSeed[]> = {
  F1: [
    { term: "Physical quantity", aliases: ["quantity", "physical quantity"], meaning: "A physical quantity is something measurable, such as length, mass, or time.", why_it_matters: "It tells you what kind of thing the number is describing." },
    { term: "Unit", aliases: ["unit", "units", "si unit", "si units"], meaning: "A unit is the agreed size used to measure a quantity, such as metre, kilogram, or second.", why_it_matters: "A number without a unit does not fully describe a measurement." },
    { term: "Prefix", aliases: ["prefix", "kilo", "centi", "milli"], meaning: "A prefix changes the size of a unit, making it larger or smaller by a known factor.", why_it_matters: "Prefixes let you choose a unit size that matches the scale of the object." },
    { term: "Scalar", aliases: ["scalar", "scalars"], meaning: "A scalar quantity has size only, with no direction attached.", why_it_matters: "It helps you separate simple amounts from direction-based quantities." },
    { term: "Vector", aliases: ["vector", "vectors"], meaning: "A vector quantity has both size and direction.", why_it_matters: "Direction changes the meaning, so vectors cannot be treated like plain scalars." },
    { term: "Resolution", aliases: ["resolution"], meaning: "Resolution is the smallest change an instrument can show clearly.", why_it_matters: "It limits how much detail a measurement can honestly claim." },
    { term: "Uncertainty", aliases: ["uncertainty"], meaning: "Uncertainty is the range within which the true value is likely to lie.", why_it_matters: "It shows how trustworthy the reading is, not just what the reading says." },
    { term: "Significant figures", aliases: ["significant figures", "significant figure"], meaning: "Significant figures are the digits that carry meaningful precision in a measured value.", why_it_matters: "They stop you from pretending a result is more exact than it really is." },
    { term: "Density", aliases: ["density"], meaning: "Density is the mass packed into each unit of volume.", why_it_matters: "It compares how much matter is in a given amount of space." },
    { term: "Accuracy", aliases: ["accuracy"], meaning: "Accuracy describes how close a measurement is to the accepted or true value.", why_it_matters: "It answers whether the result is close to the target." },
    { term: "Precision", aliases: ["precision"], meaning: "Precision describes how closely repeated measurements agree with one another.", why_it_matters: "It answers whether the method gives a tight cluster of readings." },
  ],
  F2: [
    { term: "Distance", aliases: ["distance"], meaning: "Distance is the total path length travelled, without direction.", why_it_matters: "It tells how much ground was covered, not where the journey finished." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the straight-line change in position from start to finish, including direction.", why_it_matters: "It keeps the final position story separate from the total path story." },
    { term: "Speed", aliases: ["speed"], meaning: "Speed is distance travelled each second, with no direction attached.", why_it_matters: "It is a scalar rate, so it is different from velocity." },
    { term: "Velocity", aliases: ["velocity"], meaning: "Velocity is speed in a specified direction.", why_it_matters: "It tells both how fast and which way the motion is happening." },
    { term: "Acceleration", aliases: ["acceleration"], meaning: "Acceleration is the rate at which velocity changes.", why_it_matters: "It can come from changing speed, changing direction, or both." },
    { term: "Force", aliases: ["force"], meaning: "A force is a push or pull that can change an object's motion.", why_it_matters: "Forces explain why acceleration happens." },
    { term: "Resultant force", aliases: ["resultant force", "net force"], meaning: "The resultant force is the single overall force after combining all the individual forces.", why_it_matters: "Motion changes because of the overall force, not because of one force viewed alone." },
    { term: "Friction", aliases: ["friction"], meaning: "Friction is a force that opposes motion between touching surfaces.", why_it_matters: "It helps explain why moving objects slow down or need a driving force." },
    { term: "Air resistance", aliases: ["air resistance", "drag"], meaning: "Air resistance is the resistive force from moving through air.", why_it_matters: "It can reduce acceleration or create a balanced-speed situation." },
    { term: "Inertia", aliases: ["inertia"], meaning: "Inertia is the tendency of an object to resist changes to its motion.", why_it_matters: "It helps explain why objects keep their current state unless a resultant force acts." },
  ],
  F3: [
    { term: "Energy", aliases: ["energy"], meaning: "Energy is a quantity that can be stored and transferred between objects or systems.", why_it_matters: "It tracks what can cause changes even when the form changes." },
    { term: "Energy store", aliases: ["energy store", "store"], meaning: "An energy store is a way energy is held in a system, such as kinetic or thermal store.", why_it_matters: "It helps learners track where the energy is rather than treating energy as vague substance." },
    { term: "Transfer", aliases: ["transfer", "energy transfer"], meaning: "An energy transfer is energy moving from one store, place, or system to another.", why_it_matters: "It explains change without saying energy disappears." },
    { term: "Work done", aliases: ["work", "work done"], meaning: "Work done is energy transferred when a force acts through a distance.", why_it_matters: "It links force-and-motion stories to energy change." },
    { term: "Power", aliases: ["power"], meaning: "Power is the rate of energy transfer.", why_it_matters: "It tells how quickly energy is being transferred, not how much in total." },
    { term: "Conservation of energy", aliases: ["conservation of energy", "conserved"], meaning: "Conservation of energy means total energy is accounted for even when it changes store or spreads out.", why_it_matters: "It stops students from saying energy is destroyed when it becomes less useful." },
    { term: "Efficiency", aliases: ["efficiency"], meaning: "Efficiency is the fraction of the input energy that becomes useful output.", why_it_matters: "It separates useful transfer from wasted transfer." },
  ],
  F4: [
    { term: "Wave", aliases: ["wave", "waves"], meaning: "A wave is a travelling disturbance that transfers energy without the whole medium moving with it.", why_it_matters: "It is the anchor idea behind reflection, refraction, and wave properties." },
    { term: "Amplitude", aliases: ["amplitude"], meaning: "Amplitude is the maximum displacement from the rest position.", why_it_matters: "It tells how large the oscillation is." },
    { term: "Wavelength", aliases: ["wavelength"], meaning: "Wavelength is the distance between matching points on neighbouring waves.", why_it_matters: "It links pattern spacing to wave speed and frequency." },
    { term: "Frequency", aliases: ["frequency"], meaning: "Frequency is the number of complete oscillations or wave cycles each second.", why_it_matters: "It measures how often the source repeats the pattern." },
    { term: "Reflection", aliases: ["reflection"], meaning: "Reflection is the change in wave direction when it bounces from a boundary.", why_it_matters: "It explains echoes, mirrors, and boundary rebounds." },
    { term: "Refraction", aliases: ["refraction"], meaning: "Refraction is the change in direction caused when a wave changes speed in a new medium.", why_it_matters: "It keeps turning-by-speed-change separate from simple bouncing." },
    { term: "Current", aliases: ["current"], meaning: "Current is the rate of charge flow in a circuit.", why_it_matters: "It is not the same as voltage or stored energy." },
    { term: "Voltage", aliases: ["voltage", "potential difference"], meaning: "Voltage is the energy transferred per unit charge between two points.", why_it_matters: "It tells what each charge gets, not how much charge passes each second." },
    { term: "Circuit", aliases: ["circuit"], meaning: "A circuit is a complete conducting path that allows charge to move.", why_it_matters: "No complete loop means no sustained current." },
  ],
  M1: [
    { term: "Distance-time graph", aliases: ["distance time graph", "distance-time graph"], meaning: "A distance-time graph shows how total distance changes with time.", why_it_matters: "Its slope tells speed, not acceleration." },
    { term: "Speed-time graph", aliases: ["speed time graph", "speed-time graph", "velocity time graph", "velocity-time graph"], meaning: "A speed-time or velocity-time graph shows how speed or velocity changes with time.", why_it_matters: "Its slope and area answer different motion questions." },
    { term: "Gradient", aliases: ["gradient", "slope"], meaning: "The gradient is the steepness of a graph line, found by change in vertical value divided by change in horizontal value.", why_it_matters: "In motion graphs, the meaning of the gradient depends on the axes." },
    { term: "Area under a graph", aliases: ["area under the graph", "area under graph"], meaning: "The area under a graph is the total quantity represented by the vertical axis accumulated over the horizontal interval.", why_it_matters: "For speed-time graphs, the area gives distance travelled." },
    { term: "Constant acceleration", aliases: ["constant acceleration"], meaning: "Constant acceleration means the velocity changes by equal amounts in equal times.", why_it_matters: "It is the condition behind the standard equations of motion." },
    { term: "Equation of motion", aliases: ["equation of motion", "equations of motion", "suvat"], meaning: "An equation of motion links displacement, velocity, acceleration, and time under constant acceleration.", why_it_matters: "You choose the equation by matching the known and unknown quantities." },
    { term: "Velocity", aliases: ["velocity"], meaning: "Velocity is speed in a stated direction.", why_it_matters: "It matters because acceleration depends on changes in velocity, not speed alone." },
    { term: "Acceleration", aliases: ["acceleration"], meaning: "Acceleration is the rate of change of velocity.", why_it_matters: "A flat speed-time graph means zero acceleration even if the speed is not zero." },
  ],
  M2: [
    { term: "Resultant force", aliases: ["resultant force", "net force"], meaning: "The resultant force is the combined overall force after all forces are added with direction.", why_it_matters: "Acceleration depends on the resultant, not on one isolated force." },
    { term: "Newton's first law", aliases: ["newtons first law", "newton's first law"], meaning: "Newton's first law says an object stays at rest or in uniform motion unless a resultant force acts.", why_it_matters: "It explains balanced-force situations and inertia." },
    { term: "Newton's second law", aliases: ["newtons second law", "newton's second law"], meaning: "Newton's second law links resultant force to the rate of change of momentum, often written as F = ma for constant mass.", why_it_matters: "It explains why more resultant force gives greater acceleration." },
    { term: "Newton's third law", aliases: ["newtons third law", "newton's third law"], meaning: "Newton's third law says forces between two interacting bodies come in equal and opposite pairs.", why_it_matters: "It keeps action-reaction pairs separate from balanced forces on one object." },
    { term: "Momentum", aliases: ["momentum"], meaning: "Momentum is the quantity of motion given by mass multiplied by velocity.", why_it_matters: "It is useful for collisions and explosions where forces act over short times." },
    { term: "Moment", aliases: ["moment", "turning effect"], meaning: "A moment is the turning effect of a force about a pivot.", why_it_matters: "It depends on both force and perpendicular distance from the pivot." },
    { term: "Centre of mass", aliases: ["centre of mass", "center of mass"], meaning: "The centre of mass is the point where an object's mass can be treated as concentrated for many calculations.", why_it_matters: "It helps explain balance and stability." },
    { term: "Stability", aliases: ["stability", "stable"], meaning: "Stability describes how resistant an object is to toppling when disturbed.", why_it_matters: "A wide base and a low centre of mass usually increase stability." },
    { term: "Vector component", aliases: ["component", "vector component", "resolve"], meaning: "A vector component is one part of a vector along a chosen axis.", why_it_matters: "Components make diagonal forces easier to combine and compare." },
    { term: "Conservation of momentum", aliases: ["conservation of momentum"], meaning: "Conservation of momentum means total momentum stays constant in an isolated system.", why_it_matters: "It lets you compare the system before and after an interaction." },
  ],
  M3: [
    { term: "Kinetic energy", aliases: ["kinetic energy"], meaning: "Kinetic energy is the energy store associated with motion.", why_it_matters: "It rises strongly when speed increases." },
    { term: "Gravitational potential energy", aliases: ["gravitational potential energy", "gpe"], meaning: "Gravitational potential energy is the energy store associated with position in a gravitational field.", why_it_matters: "Lifting an object increases its capacity to transfer energy as it falls." },
    { term: "Work done", aliases: ["work done", "work"], meaning: "Work done is the energy transferred when a force acts through a distance.", why_it_matters: "It is a hand-off story, not just a feeling-of-effort story." },
    { term: "Power", aliases: ["power"], meaning: "Power is the rate of energy transfer or work done.", why_it_matters: "It tells how quickly the transfer happens." },
    { term: "Efficiency", aliases: ["efficiency"], meaning: "Efficiency is the fraction or percentage of the input that becomes useful output.", why_it_matters: "It separates useful energy change from wasted energy spread." },
    { term: "Energy transfer", aliases: ["energy transfer", "transfer"], meaning: "Energy transfer is energy moving between stores or systems.", why_it_matters: "It lets you track what changes without saying energy vanishes." },
    { term: "Conserved", aliases: ["conserved", "conservation of energy"], meaning: "A conserved quantity is one that stays fully accounted for overall.", why_it_matters: "Energy can spread or change store without being destroyed." },
  ],
  M4: [
    { term: "Pressure", aliases: ["pressure"], meaning: "Pressure is force per unit area.", why_it_matters: "It tells how concentrated a push is, not just how large the push is." },
    { term: "Area", aliases: ["area", "contact area"], meaning: "Area is the amount of surface over which a force is spread.", why_it_matters: "Changing area can change pressure even if the force stays the same." },
    { term: "Density", aliases: ["density", "rho", "ρ"], meaning: "Density is mass per unit volume.", why_it_matters: "In liquids, a denser fluid gives a larger pressure increase with depth." },
    { term: "Depth", aliases: ["depth"], meaning: "Depth is the distance below the liquid surface.", why_it_matters: "Greater depth means more liquid above, so the pressure is larger." },
    { term: "Atmospheric pressure", aliases: ["atmospheric pressure", "air pressure"], meaning: "Atmospheric pressure is the pressure caused by the weight of the air above a surface.", why_it_matters: "It explains why air can press on us and on liquid surfaces." },
    { term: "Pascal", aliases: ["pascal", "pascals", "pa"], meaning: "A pascal is the SI unit of pressure, equal to one newton per square metre.", why_it_matters: "It keeps the pressure unit tied to force and area." },
  ],
  M5: [
    { term: "Particle", aliases: ["particle", "particles"], meaning: "A particle is one tiny unit of matter, such as an atom or molecule.", why_it_matters: "The particle model explains large-scale material behaviour from tiny moving units." },
    { term: "Solid", aliases: ["solid"], meaning: "A solid has particles packed closely that mainly vibrate about fixed positions.", why_it_matters: "It explains why solids keep their shape." },
    { term: "Liquid", aliases: ["liquid"], meaning: "A liquid has particles still close together but able to move past one another.", why_it_matters: "It explains why liquids flow while staying fairly dense." },
    { term: "Gas", aliases: ["gas"], meaning: "A gas has particles far apart that move freely between collisions.", why_it_matters: "It explains expansion, low density, and compressibility." },
    { term: "Brownian motion", aliases: ["brownian motion"], meaning: "Brownian motion is the random zigzag movement of visible particles caused by uneven collisions with invisible molecules.", why_it_matters: "It provides evidence that tiny particles are in constant random motion." },
    { term: "Temperature", aliases: ["temperature"], meaning: "Temperature tells how energetic the average particle motion is.", why_it_matters: "It is about average particle energy, not total energy of the whole system." },
    { term: "Internal energy", aliases: ["internal energy"], meaning: "Internal energy is the total kinetic and potential energy of all the particles in a system.", why_it_matters: "A system can have the same temperature as another but a different internal energy." },
    { term: "Potential energy", aliases: ["potential energy"], meaning: "In the particle model, potential energy is energy stored because of particle positions and interactions.", why_it_matters: "It helps explain why state changes can absorb energy without much temperature rise." },
  ],
  M6: [
    { term: "Specific heat capacity", aliases: ["specific heat capacity"], meaning: "Specific heat capacity is the energy needed to raise the temperature of one kilogram of a substance by one degree Celsius or one kelvin.", why_it_matters: "It explains why some materials warm up more slowly than others." },
    { term: "Latent heat", aliases: ["latent heat"], meaning: "Latent heat is energy transferred during a change of state without a temperature change.", why_it_matters: "It shows that energy can loosen particle bonds instead of raising average motion." },
    { term: "Conduction", aliases: ["conduction"], meaning: "Conduction is thermal energy transfer through a material by particle or electron interactions.", why_it_matters: "It is strongest in good conductors and along direct contact paths." },
    { term: "Convection", aliases: ["convection"], meaning: "Convection is thermal energy transfer by the bulk movement of a fluid.", why_it_matters: "Warmer, less dense fluid can rise and carry energy with it." },
    { term: "Radiation", aliases: ["radiation"], meaning: "Radiation is thermal energy transfer by electromagnetic waves.", why_it_matters: "It can travel through empty space, unlike conduction and convection." },
    { term: "Thermal equilibrium", aliases: ["thermal equilibrium"], meaning: "Thermal equilibrium is the state in which there is no net thermal energy transfer between objects in contact.", why_it_matters: "It marks the point where temperatures have balanced out." },
    { term: "Insulator", aliases: ["insulator", "thermal insulator"], meaning: "An insulator is a material that resists the transfer of thermal energy.", why_it_matters: "It slows conduction and helps retain energy." },
    { term: "Conductor", aliases: ["conductor", "thermal conductor"], meaning: "A conductor is a material that allows thermal energy to transfer easily.", why_it_matters: "It helps explain why metals often heat up and cool down quickly." },
  ],
  M7: [
    { term: "Transverse wave", aliases: ["transverse", "transverse wave"], meaning: "A transverse wave has oscillations perpendicular to the direction of travel.", why_it_matters: "You must compare local motion with propagation to classify the wave correctly." },
    { term: "Longitudinal wave", aliases: ["longitudinal", "longitudinal wave"], meaning: "A longitudinal wave has oscillations parallel to the direction of travel.", why_it_matters: "It helps explain sound and compression-based patterns." },
    { term: "Frequency", aliases: ["frequency"], meaning: "Frequency is the number of wave cycles produced each second.", why_it_matters: "It is set by the source, not by how the medium later changes the wave speed." },
    { term: "Wavelength", aliases: ["wavelength", "lambda", "λ"], meaning: "Wavelength is the spacing between matching points on successive wavefronts.", why_it_matters: "It changes when wave speed changes while frequency stays fixed." },
    { term: "Wave speed", aliases: ["wave speed", "speed"], meaning: "Wave speed is how fast the wavefront travels through the medium.", why_it_matters: "It is linked to frequency and wavelength by v = fλ." },
    { term: "Reflection", aliases: ["reflection"], meaning: "Reflection is the turning back of a wave at a boundary.", why_it_matters: "It follows a predictable geometry rather than random bouncing." },
    { term: "Refraction", aliases: ["refraction"], meaning: "Refraction is the change in direction caused when a wave changes speed in a new medium.", why_it_matters: "It is a speed-change story, not a strange kind of reflection." },
    { term: "Diffraction", aliases: ["diffraction"], meaning: "Diffraction is the spreading or bending of a wave around an edge or through an opening.", why_it_matters: "It becomes stronger when the opening size is similar to the wavelength." },
    { term: "Wavefront", aliases: ["wavefront", "wavefronts", "front line"], meaning: "A wavefront joins points that are oscillating in the same phase.", why_it_matters: "It makes reflection, refraction, and diffraction geometry easier to read." },
  ],
  M8: [
    { term: "Normal", aliases: ["normal", "guide line"], meaning: "The normal is the line drawn perpendicular to a surface at the point where a ray strikes it.", why_it_matters: "Optics angles are measured from the normal, not from the surface itself." },
    { term: "Incident ray", aliases: ["incident ray", "incoming ray", "incoming route"], meaning: "The incident ray is the ray approaching a surface or boundary.", why_it_matters: "It sets the incoming angle for reflection or refraction." },
    { term: "Reflected ray", aliases: ["reflected ray", "reflected route"], meaning: "The reflected ray is the ray leaving a mirror after bouncing from it.", why_it_matters: "Its angle to the normal matches the incident angle in a plane mirror." },
    { term: "Refraction", aliases: ["refraction"], meaning: "Refraction is the bending of a ray when light changes speed in a new medium.", why_it_matters: "It explains lens behaviour and boundary bending." },
    { term: "Principal axis", aliases: ["principal axis", "axis"], meaning: "The principal axis is the straight reference line through the centre of a lens or mirror.", why_it_matters: "It organizes focal points and standard rays in ray diagrams." },
    { term: "Focal point", aliases: ["focal point", "focus"], meaning: "The focal point is the point where parallel rays meet, or appear to come from, after passing through a lens or reflecting from a curved surface.", why_it_matters: "It is one of the anchor landmarks for proper ray diagrams." },
    { term: "Virtual image", aliases: ["virtual image", "ghost image"], meaning: "A virtual image is formed where rays only appear to come from; the light does not actually meet there.", why_it_matters: "It is found using dashed backward extensions, not real converging rays." },
    { term: "Real image", aliases: ["real image"], meaning: "A real image is formed where light rays actually meet.", why_it_matters: "It can usually be projected onto a screen." },
    { term: "Critical angle", aliases: ["critical angle"], meaning: "The critical angle is the angle of incidence in the denser medium that gives a refracted ray along the boundary.", why_it_matters: "It is the threshold for total internal reflection." },
    { term: "Total internal reflection", aliases: ["total internal reflection"], meaning: "Total internal reflection happens when light inside a denser medium hits the boundary above the critical angle and reflects entirely back inside.", why_it_matters: "It explains optical fibres and strong internal mirror-like behaviour." },
  ],
  M9: [
    { term: "Vibration", aliases: ["vibration", "vibrate"], meaning: "A vibration is a repeated back-and-forth motion about a rest position.", why_it_matters: "A sound starts with a vibrating source." },
    { term: "Compression", aliases: ["compression", "compressions"], meaning: "A compression is a crowded high-pressure region in a sound wave.", why_it_matters: "It is one half of the repeating longitudinal pattern." },
    { term: "Rarefaction", aliases: ["rarefaction", "rarefactions"], meaning: "A rarefaction is a spread-out low-pressure region in a sound wave.", why_it_matters: "It alternates with compressions in a longitudinal wave." },
    { term: "Longitudinal wave", aliases: ["longitudinal", "longitudinal wave"], meaning: "A longitudinal wave has local particle motion parallel to the direction of travel.", why_it_matters: "That is the correct particle-picture for sound in air." },
    { term: "Pitch", aliases: ["pitch"], meaning: "Pitch is how high or low a sound seems and is mainly linked to frequency.", why_it_matters: "It keeps frequency separate from loudness." },
    { term: "Frequency", aliases: ["frequency"], meaning: "Frequency is the number of wave cycles or source vibrations each second.", why_it_matters: "It sets the pitch of a sound." },
    { term: "Echo", aliases: ["echo"], meaning: "An echo is a reflected sound heard again after bouncing from a surface.", why_it_matters: "It is a reflection-and-timing story, not a new sound source." },
    { term: "Ultrasound", aliases: ["ultrasound"], meaning: "Ultrasound is sound with frequency above the upper limit of human hearing.", why_it_matters: "It is used in imaging and ranging because high frequency gives short wavelength." },
  ],
  M10: [
    { term: "Charge", aliases: ["charge"], meaning: "Charge is the conserved electrical quantity carried by particles such as electrons.", why_it_matters: "It is the moving stuff in the circuit story." },
    { term: "Current", aliases: ["current"], meaning: "Current is the rate of charge flow past a point.", why_it_matters: "It is about flow rate, not about how much charge exists in total." },
    { term: "Voltage", aliases: ["voltage", "potential difference"], meaning: "Voltage is the energy transferred per unit charge.", why_it_matters: "It tells what each carrier gets from the source." },
    { term: "Resistance", aliases: ["resistance"], meaning: "Resistance is how strongly a component or path opposes current.", why_it_matters: "It belongs to the route, not to the battery." },
    { term: "Ohm's law", aliases: ["ohms law", "ohm's law"], meaning: "Ohm's law states that current is proportional to voltage for an ohmic conductor when other conditions stay constant.", why_it_matters: "It connects voltage, current, and resistance without treating them as the same thing." },
    { term: "Cell or battery", aliases: ["cell", "battery"], meaning: "A cell or battery provides an energy rise per unit charge for the circuit.", why_it_matters: "It is a source of energy per charge, not a tank of current." },
    { term: "Conductor", aliases: ["conductor"], meaning: "A conductor is a material that allows charge carriers to move fairly easily.", why_it_matters: "It helps explain why some paths carry current better than others." },
  ],
  M11: [
    { term: "Series circuit", aliases: ["series circuit", "series"], meaning: "A series circuit has one path, so the same current passes through each component in that path.", why_it_matters: "One open component can stop the whole chain." },
    { term: "Parallel circuit", aliases: ["parallel circuit", "parallel"], meaning: "A parallel circuit has branches connected between the same two junctions.", why_it_matters: "Each branch shares the same potential difference while the current can split." },
    { term: "Potential difference", aliases: ["potential difference", "voltage"], meaning: "Potential difference is the energy transferred per unit charge between two points.", why_it_matters: "It is shared across parallel branches between the same nodes." },
    { term: "Power", aliases: ["power"], meaning: "Power is the rate at which a component transfers or dissipates energy.", why_it_matters: "It explains why one lamp glows brighter or one resistor gets hotter than another." },
    { term: "Equivalent resistance", aliases: ["equivalent resistance", "combined resistance"], meaning: "Equivalent resistance is the single resistance that would have the same overall effect as the whole network.", why_it_matters: "It simplifies series, parallel, and mixed circuits step by step." },
    { term: "Circuit diagram", aliases: ["circuit diagram", "schematic", "route map"], meaning: "A circuit diagram is a symbolic map of the electrical connections, not a realistic picture of the hardware layout.", why_it_matters: "It shows connection logic clearly and compactly." },
    { term: "Fuse", aliases: ["fuse"], meaning: "A fuse is a safety device that melts and opens the circuit if the current becomes too large.", why_it_matters: "It protects wires and devices from overheating." },
    { term: "Circuit breaker", aliases: ["circuit breaker", "breaker"], meaning: "A circuit breaker is a resettable device that opens the circuit when the current is unsafe.", why_it_matters: "It plays the same protective role as a fuse but can be reset." },
    { term: "Short circuit", aliases: ["short circuit", "fault bridge"], meaning: "A short circuit is an unintended very-low-resistance path that allows a dangerously large current.", why_it_matters: "It can overheat wires quickly and must be interrupted by protection." },
  ],
  M12: [
    { term: "Magnetic field", aliases: ["magnetic field"], meaning: "A magnetic field is the region where a magnetic force would act on magnets, magnetic materials, or moving charges.", why_it_matters: "It is the invisible structure behind many magnetic effects." },
    { term: "Field line", aliases: ["field line", "field lines"], meaning: "Field lines are drawn lines that show the direction and pattern of a field.", why_it_matters: "They are a map of the field, not actual physical strings." },
    { term: "Electromagnet", aliases: ["electromagnet"], meaning: "An electromagnet is a magnet created by electric current, often using a coil and an iron core.", why_it_matters: "It links electricity and magnetism in a controllable way." },
    { term: "Solenoid", aliases: ["solenoid", "coil"], meaning: "A solenoid is a coil of wire that can produce a magnetic field when current flows through it.", why_it_matters: "It is a standard structure for electromagnets." },
    { term: "Motor effect", aliases: ["motor effect"], meaning: "The motor effect is the force on a current-carrying conductor in a magnetic field.", why_it_matters: "It explains how electric motors produce motion." },
    { term: "Electromagnetic induction", aliases: ["electromagnetic induction", "induction"], meaning: "Electromagnetic induction is the creation of an emf when magnetic flux through a conductor changes.", why_it_matters: "It is the central idea behind generators and transformers." },
    { term: "Generator", aliases: ["generator"], meaning: "A generator is a device that converts mechanical energy into electrical energy by induction.", why_it_matters: "It reverses the energy-conversion story of a motor." },
    { term: "Transformer", aliases: ["transformer"], meaning: "A transformer is a device that uses induction between coils to change voltage in alternating-current systems.", why_it_matters: "It is essential for efficient power transmission." },
    { term: "Magnetic flux", aliases: ["magnetic flux", "flux"], meaning: "Magnetic flux measures how much magnetic field passes through an area.", why_it_matters: "Changing flux is what drives induction." },
    { term: "Commutator", aliases: ["commutator"], meaning: "A commutator is the rotating contact system that reverses or manages current connections in some machines.", why_it_matters: "It helps keep motor torque or generator output working as intended." },
  ],
  M13: [
    { term: "Atom", aliases: ["atom", "atomic"], meaning: "An atom is the basic unit of ordinary matter, with a nucleus surrounded by electrons.", why_it_matters: "Radioactivity comes from changes in unstable nuclei, not whole atoms behaving randomly." },
    { term: "Nucleus", aliases: ["nucleus", "nuclei"], meaning: "The nucleus is the tiny dense centre of an atom containing protons and neutrons.", why_it_matters: "It is the source of radioactive decay." },
    { term: "Isotope", aliases: ["isotope", "isotopes"], meaning: "Isotopes are atoms of the same element with the same number of protons but different numbers of neutrons.", why_it_matters: "Some isotopes are stable and some are radioactive." },
    { term: "Radioactive decay", aliases: ["radioactive decay", "decay"], meaning: "Radioactive decay is the spontaneous change of an unstable nucleus into a more stable form.", why_it_matters: "It is random for one nucleus but predictable for large numbers of nuclei." },
    { term: "Alpha particle", aliases: ["alpha", "alpha particle"], meaning: "An alpha particle is a helium nucleus emitted in some radioactive decays.", why_it_matters: "It is strongly ionising but not very penetrating." },
    { term: "Beta particle", aliases: ["beta", "beta particle"], meaning: "A beta particle is a high-speed electron or positron emitted from the nucleus during beta decay.", why_it_matters: "It has intermediate penetrating power and ionisation." },
    { term: "Gamma ray", aliases: ["gamma", "gamma ray"], meaning: "A gamma ray is high-energy electromagnetic radiation emitted from the nucleus.", why_it_matters: "It is very penetrating and weakly ionising compared with alpha." },
    { term: "Half-life", aliases: ["half life", "half-life"], meaning: "Half-life is the time taken for the number of undecayed nuclei, or the activity, to fall to half its value.", why_it_matters: "It turns random decay into a measurable pattern for large samples." },
    { term: "Ionisation", aliases: ["ionisation", "ionization"], meaning: "Ionisation is the process of removing or adding electrons so atoms become charged.", why_it_matters: "It is the main biological effect behind radiation hazard and detection." },
    { term: "Background radiation", aliases: ["background radiation"], meaning: "Background radiation is the low-level radiation always present in the environment from natural and human-made sources.", why_it_matters: "It is why detectors often record counts even without a nearby source." },
  ],
  M14: [
    { term: "Star", aliases: ["star", "stars"], meaning: "A star is a self-luminous ball of gas powered by nuclear fusion in its core.", why_it_matters: "It makes stars different from planets or mirrors that only reflect light." },
    { term: "Fusion", aliases: ["fusion"], meaning: "Fusion is the joining of light nuclei to form heavier nuclei, releasing energy.", why_it_matters: "It is the process that powers stars." },
    { term: "Galaxy", aliases: ["galaxy", "galaxies"], meaning: "A galaxy is a huge gravitationally bound collection of stars, gas, dust, and dark matter.", why_it_matters: "It is far larger than a star system but smaller than the whole universe." },
    { term: "Milky Way", aliases: ["milky way"], meaning: "The Milky Way is the galaxy that contains our Solar System.", why_it_matters: "It keeps our home galaxy separate from the wider universe and from one local star system." },
    { term: "Light-year", aliases: ["light year", "light-year"], meaning: "A light-year is a distance: the distance light travels in one year.", why_it_matters: "The word year is part of the definition, but the quantity measured is distance." },
    { term: "Redshift", aliases: ["redshift"], meaning: "Redshift is the increase in observed wavelength compared with the emitted wavelength.", why_it_matters: "It is evidence that distant galaxies are moving away in the expansion story." },
    { term: "Big Bang", aliases: ["big bang"], meaning: "The Big Bang model describes the universe expanding from an earlier hot, dense state.", why_it_matters: "It is a model of cosmic history, not an ordinary explosion into empty space." },
    { term: "Supernova", aliases: ["supernova"], meaning: "A supernova is a violent stellar explosion near the end of some stars' lives.", why_it_matters: "It helps create heavy elements and different stellar remnants." },
    { term: "Remnant", aliases: ["remnant", "remnants"], meaning: "A remnant is the dense object left after a star finishes its main life or explodes.", why_it_matters: "The remnant type depends strongly on the star's mass." },
  ],
  A1: [
    { term: "Subatomic particle", aliases: ["subatomic particle", "subatomic particles"], meaning: "A subatomic particle is a component or messenger smaller than an atom.", why_it_matters: "It gives the module a clean starting inventory before later structure and interaction stories." },
    { term: "Photon", aliases: ["photon", "photons"], meaning: "A photon is the quantum messenger of electromagnetic radiation.", why_it_matters: "It keeps radiation inside the particle story without turning it into ordinary matter." },
    { term: "Lepton", aliases: ["lepton", "leptons"], meaning: "A lepton is a matter particle such as an electron or neutrino that is not built from quarks.", why_it_matters: "It stops every particle from being collapsed into the hadron family." },
    { term: "Hadron", aliases: ["hadron", "hadrons"], meaning: "A hadron is a composite particle built from quarks and held together by the strong interaction.", why_it_matters: "It is the umbrella family that contains baryons and mesons." },
    { term: "Nucleon", aliases: ["nucleon", "nucleons"], meaning: "A nucleon is a proton or neutron in the nucleus.", why_it_matters: "It separates nuclear bundles from electrons and other non-nuclear particles." },
    { term: "Baryon", aliases: ["baryon", "baryons"], meaning: "A baryon is a hadron made from three quarks.", why_it_matters: "It gives protons and neutrons a structural classification rule." },
    { term: "Meson", aliases: ["meson", "mesons"], meaning: "A meson is a hadron made from a quark-antiquark pair.", why_it_matters: "It distinguishes pair-built hadrons from three-quark baryons." },
    { term: "Antiparticle", aliases: ["antiparticle", "antiparticles"], meaning: "An antiparticle has the same mass as its partner but opposite charge and matching opposite quantum numbers where relevant.", why_it_matters: "It makes pair production and annihilation readable as balanced events." },
    { term: "Pair production", aliases: ["pair production"], meaning: "Pair production is the creation of a particle-antiparticle pair from radiation with enough energy.", why_it_matters: "It links photon energy to matter creation while keeping conservation checks in view." },
    { term: "Annihilation", aliases: ["annihilation"], meaning: "Annihilation is the process in which a particle and its antiparticle turn into allowed radiation or other products.", why_it_matters: "It shows matter-radiation exchange without treating particles as simply disappearing." },
    { term: "Exchange particle", aliases: ["exchange particle", "exchange particles", "messenger particle", "messenger particles"], meaning: "An exchange particle is the messenger that carries an interaction between particles.", why_it_matters: "It helps students explain forces as carried interactions rather than unexplained pushes." },
    { term: "Baryon number", aliases: ["baryon number"], meaning: "Baryon number is a conserved bookkeeping quantity used in particle reactions.", why_it_matters: "It blocks impossible reaction stories even when charge alone looks acceptable." },
    { term: "Lepton number", aliases: ["lepton number"], meaning: "Lepton number is a conserved bookkeeping quantity that tracks lepton-family balance in particle events.", why_it_matters: "It is essential for checking weak-interaction events and decay chains." },
  ],
  A2: [
    { term: "Electric field", aliases: ["electric field"], meaning: "An electric field is the force per unit positive charge at a location.", why_it_matters: "It belongs to the location, not to the test charge itself." },
    { term: "Electric potential", aliases: ["electric potential", "potential"], meaning: "Electric potential is electric potential energy per unit charge at a point.", why_it_matters: "It is the height map behind voltage." },
    { term: "Potential difference", aliases: ["potential difference", "voltage", "delta v", "Δv"], meaning: "Potential difference is the change in electric potential between two points.", why_it_matters: "It is the electric-height drop or rise between positions." },
    { term: "Equipotential", aliases: ["equipotential", "equipotential line", "equipotential surface"], meaning: "An equipotential is a line or surface on which the electric potential is the same everywhere.", why_it_matters: "Moving along it requires no change in electric potential energy." },
    { term: "Capacitance", aliases: ["capacitance"], meaning: "Capacitance is the charge stored per unit potential difference.", why_it_matters: "It tells how much charge a capacitor can hold for each volt." },
    { term: "Capacitor", aliases: ["capacitor"], meaning: "A capacitor is two conductors separated by an insulating gap that stores separated charge and energy in an electric field.", why_it_matters: "It is an energy-store device built from electric field structure." },
    { term: "EMF", aliases: ["emf"], meaning: "EMF is the energy supplied per unit charge by a source.", why_it_matters: "It is the lift given by a source, especially in circuit loop reasoning." },
    { term: "Node", aliases: ["node", "node platform"], meaning: "A node is a set of circuit points connected by ideal wire and therefore at the same potential.", why_it_matters: "Node heights make complex circuit analysis manageable." },
    { term: "Kirchhoff's current law", aliases: ["kirchhoffs current law", "kirchhoff current law", "kcl"], meaning: "Kirchhoff's current law states that the total current entering a junction equals the total current leaving it.", why_it_matters: "It is charge conservation written in circuit language." },
    { term: "Kirchhoff's voltage law", aliases: ["kirchhoffs voltage law", "kirchhoff voltage law", "kvl"], meaning: "Kirchhoff's voltage law states that the algebraic sum of potential rises and drops around a closed loop is zero.", why_it_matters: "It is energy conservation written in loop language." },
  ],
  A3: [
    { term: "Magnetic flux", aliases: ["magnetic flux", "flux"], meaning: "Magnetic flux measures how much magnetic field passes through an area.", why_it_matters: "Changing flux is central to induction." },
    { term: "Flux linkage", aliases: ["flux linkage"], meaning: "Flux linkage is the magnetic flux multiplied by the number of turns in a coil.", why_it_matters: "It helps describe induction in multi-turn coils." },
    { term: "Electromagnetic induction", aliases: ["electromagnetic induction", "induction"], meaning: "Electromagnetic induction is the production of an emf from changing magnetic flux.", why_it_matters: "It is the underlying idea behind generators and transformers." },
    { term: "Alternating current", aliases: ["alternating current", "ac"], meaning: "Alternating current changes direction periodically.", why_it_matters: "It is the form of current needed for transformers and many transmission systems." },
    { term: "Direct current", aliases: ["direct current", "dc"], meaning: "Direct current flows in one direction only.", why_it_matters: "It contrasts with alternating current in behaviour and use." },
    { term: "RMS value", aliases: ["rms", "rms value"], meaning: "The RMS value of an alternating current or voltage is the steady DC-equivalent value for power effects.", why_it_matters: "It lets AC values be compared fairly with DC effects." },
    { term: "Phase", aliases: ["phase"], meaning: "Phase describes where an oscillation is in its cycle compared with another oscillation.", why_it_matters: "It matters when comparing AC waves or signals." },
    { term: "Frequency", aliases: ["frequency"], meaning: "Frequency is the number of cycles each second.", why_it_matters: "It sets how quickly AC quantities repeat." },
  ],
  A4: [
    { term: "Ideal gas", aliases: ["ideal gas"], meaning: "An ideal gas is a simplified model gas whose particles have negligible volume and no intermolecular forces except during collisions.", why_it_matters: "It gives a clean starting point for gas-law reasoning." },
    { term: "Pressure", aliases: ["pressure"], meaning: "Gas pressure comes from particle collisions with container walls.", why_it_matters: "It ties the macroscopic gas story to microscopic particle behaviour." },
    { term: "Volume", aliases: ["volume"], meaning: "Volume is the amount of space the gas occupies.", why_it_matters: "Changing volume changes collision rates and therefore pressure." },
    { term: "Temperature", aliases: ["temperature"], meaning: "For gases, temperature is linked to the average kinetic energy of the particles.", why_it_matters: "It connects thermal state to particle motion." },
    { term: "Kinetic theory", aliases: ["kinetic theory"], meaning: "Kinetic theory explains gas behaviour in terms of tiny particles moving randomly and colliding.", why_it_matters: "It links particle ideas to gas laws." },
    { term: "Internal energy", aliases: ["internal energy"], meaning: "Internal energy is the total microscopic kinetic and potential energy in the system.", why_it_matters: "It tracks energy change beyond just temperature labels." },
    { term: "Entropy", aliases: ["entropy"], meaning: "Entropy is a measure related to how spread out energy is and how many microscopic arrangements are possible.", why_it_matters: "It adds direction and probability ideas to thermal change." },
    { term: "Absolute temperature", aliases: ["absolute temperature", "kelvin"], meaning: "Absolute temperature is temperature measured from absolute zero, usually in kelvin.", why_it_matters: "Gas-law equations require an absolute temperature scale." },
  ],
  A5: [
    { term: "Photoelectric effect", aliases: ["photoelectric effect"], meaning: "The photoelectric effect is the emission of electrons from a surface when light of high enough frequency shines on it.", why_it_matters: "It shows that light transfers energy in packets, not as a smooth continuous wave alone." },
    { term: "Photon", aliases: ["photon", "photons"], meaning: "A photon is a quantum of electromagnetic radiation.", why_it_matters: "It is the packet model that explains threshold-frequency behaviour." },
    { term: "Work function", aliases: ["work function"], meaning: "The work function is the minimum energy needed to free an electron from a material's surface.", why_it_matters: "It sets the threshold for photoelectric emission." },
    { term: "Threshold frequency", aliases: ["threshold frequency"], meaning: "Threshold frequency is the minimum light frequency needed to produce photoelectric emission from a material.", why_it_matters: "Below it, increasing brightness alone will not eject electrons." },
    { term: "Wave-particle duality", aliases: ["wave-particle duality", "duality"], meaning: "Wave-particle duality is the idea that matter and radiation show both wave-like and particle-like behaviour depending on the experiment.", why_it_matters: "It is a central modern-physics shift away from simple either-or pictures." },
    { term: "de Broglie wavelength", aliases: ["de broglie wavelength", "debroglie wavelength"], meaning: "The de Broglie wavelength is the wavelength associated with a moving particle.", why_it_matters: "It extends wave ideas to matter." },
    { term: "Mass defect", aliases: ["mass defect"], meaning: "Mass defect is the difference between the mass of a bound nucleus and the total mass of its separated nucleons.", why_it_matters: "It reveals that some mass is tied up as binding energy." },
    { term: "Binding energy", aliases: ["binding energy"], meaning: "Binding energy is the energy needed to separate a nucleus into its individual nucleons.", why_it_matters: "It explains nuclear stability and nuclear energy release." },
    { term: "Time dilation", aliases: ["time dilation"], meaning: "Time dilation is the relativity effect in which time intervals differ for observers in relative motion.", why_it_matters: "It shows that time is not absolute in all frames." },
    { term: "Length contraction", aliases: ["length contraction"], meaning: "Length contraction is the relativity effect in which a moving object's length along the direction of motion is measured shorter by another observer.", why_it_matters: "It shows that distance and time both depend on frame of reference." },
  ],
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeGlossaryText(value: unknown): string {
  return text(value)
    .replace(/[Δδ]/g, " delta ")
    .replace(/[ρΡ]/g, " rho ")
    .replace(/[λΛ]/g, " lambda ")
    .replace(/['’]/g, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function corpusHasAlias(corpus: string, alias: string): boolean {
  if (!corpus || !alias) return false;
  return ` ${corpus} `.includes(` ${alias} `);
}

function collectLessonStrings(value: unknown, sink: string[], depth = 0): void {
  if (depth > 7 || value == null) return;
  if (typeof value === "string") {
    if (value.trim()) sink.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectLessonStrings(item, sink, depth + 1));
    return;
  }
  if (typeof value === "object") {
    Object.entries(value as UnknownRecord).forEach(([key, item]) => {
      if (key === "technical_words") return;
      collectLessonStrings(item, sink, depth + 1);
    });
  }
}

function uniqueEntries(entries: TechnicalWordEntry[]): TechnicalWordEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = normalizeGlossaryText(entry.term);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function moduleCodeFromLessonCode(code: string): string {
  return text(code).split("_")[0].toUpperCase();
}

function authoredTechnicalWords(lesson: UnknownRecord): TechnicalWordEntry[] {
  const authoring = asRecord(lesson.authoring_contract);
  return uniqueEntries(
    asList(authoring.technical_words)
      .map(asRecord)
      .map((entry) => ({
        term: text(entry.term),
        meaning: text(entry.meaning),
        why_it_matters: text(entry.why_it_matters || entry.whyItMatters),
        source: text(entry.source).toLowerCase(),
      }))
      .filter((entry) => entry.term && entry.meaning),
  );
}

function scoreSeedAgainstCorpus(seed: TechnicalWordSeed, corpus: string): number {
  const aliases = [seed.term, ...(seed.aliases || [])]
    .map((alias) => normalizeGlossaryText(alias))
    .filter(Boolean);
  return aliases.reduce((total, alias) => (corpusHasAlias(corpus, alias) ? total + Math.max(1, alias.split(" ").length) : total), 0);
}

function moduleFallbackWords(lesson: UnknownRecord, lessonCode: string): TechnicalWordEntry[] {
  const moduleCode = moduleCodeFromLessonCode(lessonCode);
  const seeds = CURRICULUM_TECHNICAL_WORD_SUPPLEMENTS[moduleCode] || MODULE_TECHNICAL_WORDS[moduleCode] || [];
  if (seeds.length === 0) return [];

  const corpus = lessonCorpus(lesson);

  const scored = seeds
    .map((seed, index) => ({
      seed,
      index,
      score: scoreSeedAgainstCorpus(seed, corpus),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    });

  const chosen = scored.filter((entry) => entry.score > 0);

  return uniqueEntries(
    chosen.map(({ seed }) => ({
      term: seed.term,
      meaning: seed.meaning,
      why_it_matters: seed.why_it_matters,
    })),
  );
}

function lessonFormulaCorpus(lesson: UnknownRecord): string {
  const authoring = asRecord(lesson.authoring_contract);
  const formulaStrings: string[] = [];

  asList(authoring.formulas)
    .map(asRecord)
    .forEach((formula) => {
      collectLessonStrings(
        {
          equation: formula.equation,
          meaning: formula.meaning,
          conditions: formula.conditions,
          units: formula.units,
        },
        formulaStrings,
      );
    });

  return normalizeGlossaryText(formulaStrings.join(" "));
}

function formulaDrivenTechnicalWords(lesson: UnknownRecord): TechnicalWordEntry[] {
  const formulaCorpus = lessonFormulaCorpus(lesson);
  if (!formulaCorpus) return [];

  return uniqueEntries(
    FORMULA_SYMBOL_TECHNICAL_WORDS
      .map((seed, index) => ({
        seed,
        index,
        score: scoreSeedAgainstCorpus(seed, formulaCorpus),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.index - right.index;
      })
      .map(({ seed }) => ({
        term: seed.term,
        meaning: seed.meaning,
        why_it_matters: seed.why_it_matters,
      })),
  );
}

function lessonCorpus(lesson: UnknownRecord): string {
  const strings: string[] = [];
  collectLessonStrings(lesson, strings);
  return normalizeGlossaryText(strings.join(" "));
}

function scoreEntryAgainstCorpus(entry: TechnicalWordEntry, corpus: string): number {
  const key = normalizeGlossaryText(entry.term);
  if (!key) return 0;
  return corpusHasAlias(corpus, key) ? Math.max(1, key.split(" ").length) : 0;
}

function rankLessonTechnicalWords(
  entries: TechnicalWordEntry[],
  corpus: string,
  authoredCount: number,
  minimumCount = 0,
): TechnicalWordEntry[] {
  const scored = uniqueEntries(entries)
    .map((entry, index) => ({
      entry,
      index,
      score: scoreEntryAgainstCorpus(entry, corpus) + (index < authoredCount ? 0.25 : 0),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    });

  const chosen = scored.filter((item) => item.score > 0);
  if (chosen.length < minimumCount) {
    scored.forEach((item) => {
      if (chosen.length >= minimumCount) return;
      if (chosen.some((current) => normalizeGlossaryText(current.entry.term) === normalizeGlossaryText(item.entry.term))) return;
      chosen.push(item);
    });
  }

  return chosen.map((item) => item.entry);
}

export function technicalWordsForLesson(lesson: UnknownRecord, lessonCode: string): TechnicalWordEntry[] {
  const moduleCode = moduleCodeFromLessonCode(lessonCode);
  const authored = authoredTechnicalWords(lesson);
  const corpus = lessonCorpus(lesson);
  const formulaDriven = formulaDrivenTechnicalWords(lesson);
  const fallback = moduleFallbackWords(lesson, lessonCode);

  if (STRICT_AUTHORED_TECHNICAL_WORD_MODULES.has(moduleCode) && authored.length > 0) {
    const primary = rankLessonTechnicalWords([...authored], corpus, authored.length);
    const supplemental = rankLessonTechnicalWords([...formulaDriven, ...fallback], corpus, formulaDriven.length);
    return uniqueEntries([...primary, ...supplemental]);
  }

  return rankLessonTechnicalWords([...authored, ...formulaDriven, ...fallback], corpus, authored.length + formulaDriven.length, 4);
}
