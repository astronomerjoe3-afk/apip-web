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
    { term: "Elementary charge", aliases: ["elementary charge", "e"], meaning: "The elementary charge is the fundamental charge unit carried by particles such as the proton and electron.", why_it_matters: "It anchors charge-tag bookkeeping and fractional quark charge." },
    { term: "Photon", aliases: ["photon", "photons"], meaning: "A photon is the quantum messenger of electromagnetic radiation.", why_it_matters: "It keeps radiation inside the particle story without turning it into ordinary matter." },
    { term: "Lepton", aliases: ["lepton", "leptons"], meaning: "A lepton is a matter particle such as an electron or neutrino that is not built from quarks.", why_it_matters: "It stops every particle from being collapsed into the hadron family." },
    { term: "Neutrino", aliases: ["neutrino", "neutrinos"], meaning: "A neutrino is a neutral lepton that often appears in weak-interaction events.", why_it_matters: "It is often the hidden particle needed to complete the conservation ledger." },
    { term: "Antineutrino", aliases: ["antineutrino", "electron antineutrino"], meaning: "An antineutrino is the antiparticle partner of a neutrino.", why_it_matters: "It helps restore lepton-number balance in beta-decay-style events." },
    { term: "Positron", aliases: ["positron", "e+"], meaning: "A positron is the electron's antiparticle with the same mass and opposite charge.", why_it_matters: "It is the standard antiparticle partner in pair production and annihilation." },
    { term: "Nucleon", aliases: ["nucleon", "nucleons"], meaning: "A nucleon is a proton or neutron in the nucleus.", why_it_matters: "It separates nuclear bundles from electrons and other non-nuclear particles." },
    { term: "Hadron", aliases: ["hadron", "hadrons"], meaning: "A hadron is a composite particle built from quarks and held together by the strong interaction.", why_it_matters: "It is the umbrella family that contains baryons and mesons." },
    { term: "Quark", aliases: ["quark", "quarks"], meaning: "A quark is a fundamental particle that combines to form hadrons.", why_it_matters: "It explains hadron structure." },
    { term: "Antiquark", aliases: ["antiquark", "antiquarks"], meaning: "An antiquark is the antimatter partner of a quark with opposite charge.", why_it_matters: "It is essential for meson structure and charge bookkeeping." },
    { term: "Baryon", aliases: ["baryon", "baryons"], meaning: "A baryon is a hadron made from three quarks.", why_it_matters: "It gives protons and neutrons a structural classification rule." },
    { term: "Meson", aliases: ["meson", "mesons"], meaning: "A meson is a hadron made from a quark-antiquark pair.", why_it_matters: "It distinguishes pair-built hadrons from three-quark baryons." },
    { term: "Antiparticle", aliases: ["antiparticle", "antiparticles"], meaning: "An antiparticle has the same mass as its partner but opposite charge and matching opposite quantum numbers where relevant.", why_it_matters: "It makes pair production and annihilation readable as balanced events." },
    { term: "Pair production", aliases: ["pair production"], meaning: "Pair production is the creation of a particle-antiparticle pair from radiation with enough energy.", why_it_matters: "It links photon energy to matter creation while keeping conservation checks in view." },
    { term: "Annihilation", aliases: ["annihilation"], meaning: "Annihilation is the process in which a particle and its antiparticle turn into allowed radiation or other products.", why_it_matters: "It shows matter-radiation exchange without treating particles as simply disappearing." },
    { term: "Rest energy", aliases: ["rest energy"], meaning: "Rest energy is the energy equivalent of a particle's mass.", why_it_matters: "It sets the threshold condition for pair production." },
    { term: "Fundamental interaction", aliases: ["fundamental interaction", "fundamental interactions"], meaning: "A fundamental interaction is a basic way particles influence one another.", why_it_matters: "It organizes particle events into families." },
    { term: "Exchange particle", aliases: ["exchange particle", "exchange particles", "messenger particle", "messenger particles"], meaning: "An exchange particle is the messenger that carries an interaction between particles.", why_it_matters: "It helps students explain forces as carried interactions rather than unexplained pushes." },
    { term: "Strong interaction", aliases: ["strong interaction"], meaning: "The strong interaction binds quarks inside hadrons and helps bind nucleons in nuclei.", why_it_matters: "It explains hadron and nucleus stability." },
    { term: "Weak interaction", aliases: ["weak interaction"], meaning: "The weak interaction is involved in processes such as beta decay and neutrino interactions.", why_it_matters: "It connects particle change to nuclear and lepton events." },
    { term: "Beta decay", aliases: ["beta decay"], meaning: "Beta decay is a weak-interaction process in which one nucleon changes identity and leptons appear in the final state.", why_it_matters: "It is the clearest particle-change example in this module." },
    { term: "Baryon number", aliases: ["baryon number"], meaning: "Baryon number is a conserved bookkeeping quantity used in particle reactions.", why_it_matters: "It blocks impossible reaction stories even when charge alone looks acceptable." },
    { term: "Lepton number", aliases: ["lepton number"], meaning: "Lepton number is a conserved bookkeeping quantity that tracks lepton-family balance in particle events.", why_it_matters: "It is essential for checking weak-interaction events and decay chains." },
    { term: "Conservation law", aliases: ["conservation law", "conservation laws"], meaning: "A conservation law is a rule that requires a physical total to remain balanced before and after an event.", why_it_matters: "It gives a reliable first filter for accepting or rejecting a particle reaction." },
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
  A6: [
    { term: "Temperature", aliases: ["temperature"], meaning: "Temperature tracks the average kinetic energy level of the particles in the thermal model.", why_it_matters: "It prevents average particle energy from being confused with the whole-sample store." },
    { term: "Internal energy", aliases: ["internal energy"], meaning: "Internal energy is the total microscopic kinetic and potential energy store of the sample.", why_it_matters: "It belongs to the whole system rather than to one particle." },
    { term: "Specific heat capacity", aliases: ["specific heat capacity"], meaning: "Specific heat capacity is the energy needed per kilogram per degree rise in temperature.", why_it_matters: "It sets the heating cost in Q = m c Delta T." },
    { term: "Latent heat", aliases: ["latent heat"], meaning: "Latent heat is the energy transferred during a state change without temperature change.", why_it_matters: "It keeps thermal plateaus from being mistaken for zero-transfer stages." },
    { term: "Specific latent heat", aliases: ["specific latent heat"], meaning: "Specific latent heat is the energy needed per kilogram for a state change.", why_it_matters: "It gives the per-mass state-change cost in Q = mL." },
    { term: "Latent heat of fusion", aliases: ["latent heat of fusion", "specific latent heat of fusion"], meaning: "Latent heat of fusion is the specific latent heat for melting or freezing.", why_it_matters: "It covers the solid-liquid phase-change payment." },
    { term: "Latent heat of vaporization", aliases: ["latent heat of vaporization", "latent heat of vaporisation", "specific latent heat of vaporization", "specific latent heat of vaporisation"], meaning: "Latent heat of vaporization is the specific latent heat for boiling or condensation.", why_it_matters: "It covers the liquid-gas phase-change payment." },
    { term: "Ideal gas", aliases: ["ideal gas"], meaning: "An ideal gas is the simplified gas model that obeys pV = nRT and is explained by particle motion without intermolecular complications in the model.", why_it_matters: "It is the standard state-variable system for this module." },
    { term: "Pressure", aliases: ["pressure", "gas pressure"], meaning: "Gas pressure is the force per unit area caused by particle collisions with the walls.", why_it_matters: "It ties the macroscopic reading back to wall-hit physics." },
    { term: "Volume", aliases: ["volume"], meaning: "Volume is the space available to the gas.", why_it_matters: "Changing the space changes how often particles hit the walls." },
    { term: "Amount of substance", aliases: ["amount of substance"], meaning: "Amount of substance is the mole count n used in the gas law.", why_it_matters: "It keeps particle amount visible in pV = nRT." },
    { term: "Mole", aliases: ["mole", "moles", "mol"], meaning: "A mole is the SI unit used for amount of substance.", why_it_matters: "It is the unit paired with the gas constant in the ideal-gas law." },
    { term: "Kelvin", aliases: ["kelvin", "k"], meaning: "Kelvin is the absolute temperature scale used in thermal and gas-law relations.", why_it_matters: "Absolute-temperature ratios only work safely in kelvin." },
    { term: "Isothermal", aliases: ["isothermal"], meaning: "An isothermal process is a gas change at constant temperature.", why_it_matters: "It is the condition needed for Boyle's law." },
    { term: "Isobaric", aliases: ["isobaric"], meaning: "An isobaric process is a gas change at constant pressure.", why_it_matters: "It is the condition needed for Charles's law." },
    { term: "Isochoric", aliases: ["isochoric"], meaning: "An isochoric process is a gas change at constant volume.", why_it_matters: "It is the condition needed for the pressure law." },
    { term: "Kinetic theory", aliases: ["kinetic theory", "kinetic theory of gases"], meaning: "Kinetic theory explains gas pressure and temperature from particle motion and collisions.", why_it_matters: "It keeps the module mechanism-first rather than formula-first." },
    { term: "Root-mean-square speed", aliases: ["root-mean-square speed", "rms speed", "c_rms"], meaning: "Root-mean-square speed is the representative particle-speed measure used in the kinetic-theory pressure relation.", why_it_matters: "It appears in p = 1/3 rho c_rms^2." },
    { term: "Density", aliases: ["density", "gas density"], meaning: "Density is mass per unit volume.", why_it_matters: "It helps connect particle-content-in-space to kinetic-theory pressure." },
  ],
  A7: [
    { term: "EMF", aliases: ["emf", "epsilon"], meaning: "EMF is the full source energy transfer per unit charge provided by the source.", why_it_matters: "It must be separated from the delivered terminal p.d. in a real source." },
    { term: "Terminal potential difference", aliases: ["terminal potential difference", "terminal p.d.", "terminal pd", "terminal voltage"], meaning: "Terminal potential difference is the p.d. delivered across the external circuit.", why_it_matters: "It is what remains after the internal voltage drop inside the source." },
    { term: "Internal resistance", aliases: ["internal resistance"], meaning: "Internal resistance is the resistance inside a real source that causes lost volts and internal heating.", why_it_matters: "It makes the source non-ideal under load." },
    { term: "Junction rule", aliases: ["junction rule", "kirchhoff's first law", "kirchhoff first law"], meaning: "The junction rule says current into a node equals current out.", why_it_matters: "It is the current-conservation rule for branching circuits." },
    { term: "Loop rule", aliases: ["loop rule", "kirchhoff's second law", "kirchhoff second law"], meaning: "The loop rule says voltage rises and drops balance around a closed path.", why_it_matters: "It is the p.d.-balance rule for full circuit loops." },
    { term: "Potential divider", aliases: ["potential divider", "voltage divider"], meaning: "A potential divider shares one supply p.d. across a series route so the output is a chosen fraction of the supply.", why_it_matters: "It links output voltage to the resistance ratio." },
    { term: "Output voltage", aliases: ["output voltage", "output p.d.", "output pd"], meaning: "Output voltage is the selected p.d. taken from one part of the divider.", why_it_matters: "It is the measured share of the full supply." },
    { term: "Capacitance", aliases: ["capacitance"], meaning: "Capacitance is the storage ratio linking charge and p.d.", why_it_matters: "It is charge stored per volt, not the charge itself." },
    { term: "Capacitor", aliases: ["capacitor", "capacitors"], meaning: "A capacitor is a component that stores charge and energy in an electric field.", why_it_matters: "It is the core storage component in this module." },
    { term: "Charge", aliases: ["charge"], meaning: "Charge is the stored electrical quantity on the capacitor plates.", why_it_matters: "It is linked to capacitance and p.d. by Q = C V." },
    { term: "Time constant", aliases: ["time constant", "tau"], meaning: "The time constant is the RC timescale for charging and discharging.", why_it_matters: "It sets the pace of exponential RC response." },
    { term: "Charging curve", aliases: ["charging curve"], meaning: "A charging curve shows capacitor p.d. rising exponentially toward the supply.", why_it_matters: "It prevents RC charging from being mistaken for a straight-line fill." },
    { term: "Discharging curve", aliases: ["discharging curve"], meaning: "A discharging curve shows capacitor p.d. falling exponentially with time.", why_it_matters: "It makes the changing-rate fall explicit." },
    { term: "Dielectric", aliases: ["dielectric", "dielectrics"], meaning: "A dielectric is an insulating material placed between capacitor plates that changes the field response and raises capacitance.", why_it_matters: "It changes storage behaviour without being the stored charge itself." },
    { term: "Capacitor energy", aliases: ["capacitor energy", "stored energy"], meaning: "Capacitor energy is the energy stored in the electric field of the capacitor.", why_it_matters: "It links capacitance, voltage, and field storage." },
    { term: "Unloaded divider", aliases: ["unloaded divider"], meaning: "An unloaded divider is a divider whose output is not significantly altered by an attached load.", why_it_matters: "It is the condition assumed by the simple two-resistor divider formula." },
  ],
  A8: [
    { term: "Electric field", aliases: ["electric field", "electric fields"], meaning: "An electric field is the region where a charge experiences electric force.", why_it_matters: "It separates the source pattern in space from the force on one chosen test charge." },
    { term: "Field strength", aliases: ["field strength", "electric field strength"], meaning: "Field strength is the force per unit positive charge at a point.", why_it_matters: "It gives the local push-per-charge value of the field." },
    { term: "Test charge", aliases: ["test charge", "test charges"], meaning: "A test charge is a small probe charge used to reveal the field at a location.", why_it_matters: "It helps students distinguish the field from the particular force on one probe." },
    { term: "Electric potential", aliases: ["electric potential"], meaning: "Electric potential is potential energy per unit charge at a point.", why_it_matters: "It turns the electric field into a height-map style quantity." },
    { term: "Potential difference", aliases: ["potential difference", "voltage"], meaning: "Potential difference is the energy transferred per unit charge between two points.", why_it_matters: "It links field ideas to work and energy changes." },
    { term: "Equipotential", aliases: ["equipotential", "equipotentials", "equipotential line", "equipotential lines"], meaning: "An equipotential is a line or surface joining points with the same electric potential.", why_it_matters: "It helps separate same-height routes from field direction." },
    { term: "Potential gradient", aliases: ["potential gradient"], meaning: "Potential gradient is the rate of change of electric potential with distance.", why_it_matters: "It is the slope idea behind E = V / d in a uniform field." },
    { term: "Uniform field", aliases: ["uniform field", "uniform electric field"], meaning: "A uniform field has the same magnitude and direction throughout the region considered.", why_it_matters: "It makes constant-force and constant-acceleration reasoning possible." },
    { term: "Parallel plates", aliases: ["parallel plates"], meaning: "Parallel plates are two oppositely charged conducting plates used to produce an approximately uniform electric field.", why_it_matters: "They are the standard setup for potential-gradient reasoning." },
    { term: "Point charge", aliases: ["point charge", "point charges"], meaning: "A point charge is an idealized charge concentrated at one point in space.", why_it_matters: "It supports radial field and Coulomb-law reasoning." },
    { term: "Coulomb's law", aliases: ["coulomb's law", "coulomb law"], meaning: "Coulomb's law gives the force between point charges in terms of charge size and separation.", why_it_matters: "It is the formal inverse-square rule for electrostatic interactions." },
    { term: "Inverse-square law", aliases: ["inverse-square law", "inverse square law"], meaning: "An inverse-square law means a quantity falls as one over the square of the distance.", why_it_matters: "It explains why point-charge force and field weaken rapidly with separation." },
    { term: "Magnetic flux density", aliases: ["magnetic flux density"], meaning: "Magnetic flux density is the measure of magnetic field strength used in force equations.", why_it_matters: "It appears as B in motor-effect and charged-particle formulas." },
    { term: "Motor effect", aliases: ["motor effect"], meaning: "The motor effect is the force on a current-carrying conductor in a magnetic field.", why_it_matters: "It is the bridge from magnetic force to turning motion in motors." },
    { term: "Centripetal force", aliases: ["centripetal force"], meaning: "Centripetal force is the inward resultant force needed for circular motion.", why_it_matters: "It explains how magnetic force can keep a charged particle in a curved path." },
    { term: "Turning couple", aliases: ["turning couple", "couple", "torque"], meaning: "A turning couple is a pair of equal and opposite forces separated by a distance that causes rotation.", why_it_matters: "It is the mechanism behind the turning of a current loop in a motor." },
  ],
  A9: [
    { term: "Magnetic flux", aliases: ["magnetic flux", "flux"], meaning: "Magnetic flux is the magnetic field passing through a chosen area.", why_it_matters: "It is the quantity that must change for electromagnetic induction to occur." },
    { term: "Flux linkage", aliases: ["flux linkage"], meaning: "Flux linkage is the magnetic flux linked with all the turns of a coil.", why_it_matters: "Faraday's law uses the change in flux linkage to set the induced emf." },
    { term: "Induced emf", aliases: ["induced emf", "emf"], meaning: "An induced emf is the voltage produced when magnetic flux linkage changes.", why_it_matters: "It is the electrical response in induction, generators, and transformers." },
    { term: "Faraday's law", aliases: ["faraday's law", "faradays law"], meaning: "Faraday's law states that induced emf depends on the rate of change of magnetic flux linkage.", why_it_matters: "It connects change in flux to voltage generation." },
    { term: "Lenz's law", aliases: ["lenz's law", "lenzs law"], meaning: "Lenz's law states that the induced effect opposes the change that produces it.", why_it_matters: "It fixes the direction of induced current or field." },
    { term: "Generator", aliases: ["generator", "ac generator", "a.c. generator"], meaning: "A generator converts mechanical energy into electrical energy by electromagnetic induction.", why_it_matters: "It shows how repeated flux change produces alternating output." },
    { term: "Alternating current", aliases: ["alternating current", "ac", "a.c."], meaning: "Alternating current is current that reverses direction periodically.", why_it_matters: "It is the natural output of a simple generator and the required input for transformer action." },
    { term: "Slip rings", aliases: ["slip ring", "slip rings"], meaning: "Slip rings are conducting rings that maintain contact with a rotating coil in an a.c. generator.", why_it_matters: "They allow alternating output without reversing the external connection." },
    { term: "Transformer", aliases: ["transformer", "transformers"], meaning: "A transformer is a device that uses changing magnetic flux to transfer energy between coils.", why_it_matters: "It changes voltage and current levels in a.c. systems." },
    { term: "Primary coil", aliases: ["primary coil", "primary winding"], meaning: "The primary coil is the input coil of a transformer.", why_it_matters: "Its alternating current creates the changing core flux." },
    { term: "Secondary coil", aliases: ["secondary coil", "secondary winding"], meaning: "The secondary coil is the output coil of a transformer.", why_it_matters: "It receives the induced emf from the changing flux in the core." },
    { term: "Turns ratio", aliases: ["turns ratio"], meaning: "The turns ratio compares the number of turns on the primary and secondary coils.", why_it_matters: "It sets the voltage ratio in the ideal transformer model." },
    { term: "Rms value", aliases: ["rms", "rms value", "root mean square"], meaning: "The rms value of an a.c. supply is the d.c.-equivalent value for heating effect.", why_it_matters: "It is the practical value used for mains ratings and power calculations." },
    { term: "Peak value", aliases: ["peak value", "peak voltage", "peak current"], meaning: "The peak value is the maximum magnitude reached in an a.c. cycle.", why_it_matters: "It is converted to rms value when comparing practical power effects." },
    { term: "Transmission loss", aliases: ["transmission loss", "line loss", "cable loss"], meaning: "Transmission loss is power wasted as heating in power lines.", why_it_matters: "It explains why high-voltage, low-current transmission is useful." },
    { term: "Eddy current", aliases: ["eddy current", "eddy currents"], meaning: "An eddy current is an induced circulating current inside a bulk conductor.", why_it_matters: "It explains induction heating, magnetic braking, and unwanted core losses." },
    { term: "Lamination", aliases: ["lamination", "laminations", "laminated core"], meaning: "Laminations are thin insulated layers used to break up large eddy-current paths.", why_it_matters: "They reduce unwanted heating loss in transformer cores." },
    { term: "Magnetic braking", aliases: ["magnetic braking"], meaning: "Magnetic braking is motion slowdown caused by induced currents whose magnetic effect opposes the motion.", why_it_matters: "It is a practical Lenz's-law application." },
  ],
  A10: [
    { term: "Alpha scattering", aliases: ["alpha scattering", "rutherford scattering"], meaning: "Alpha scattering is the deflection of alpha particles by the electric field of atomic nuclei.", why_it_matters: "It provides evidence that atoms are mostly empty space with a tiny dense nucleus." },
    { term: "Impact parameter", aliases: ["impact parameter"], meaning: "The impact parameter is the offset between the incoming alpha-particle path and the center of the nucleus.", why_it_matters: "It helps explain why only a few particles suffer large deflections." },
    { term: "Backscattering", aliases: ["backscattering"], meaning: "Backscattering is a very large deflection that sends the particle back toward the source side.", why_it_matters: "It is the strongest clue that positive charge is highly concentrated." },
    { term: "Particle accelerator", aliases: ["particle accelerator", "accelerator"], meaning: "A particle accelerator gives charged particles high kinetic energy before they are used in collisions or probing.", why_it_matters: "It prepares the beam for nuclear and particle experiments." },
    { term: "Particle detector", aliases: ["particle detector", "detector"], meaning: "A particle detector turns invisible particle interactions into measurable signals such as tracks or pulses.", why_it_matters: "It is how particle events become readable evidence." },
    { term: "Radioactive decay", aliases: ["radioactive decay", "decay"], meaning: "Radioactive decay is the spontaneous random change of an unstable nucleus.", why_it_matters: "It is the basis for half-life, activity, and decay-equation work." },
    { term: "Activity", aliases: ["activity"], meaning: "Activity is the decay rate of a radioactive sample.", why_it_matters: "It separates how many nuclei are left from how fast they are decaying." },
    { term: "Decay constant", aliases: ["decay constant"], meaning: "The decay constant is the per-unit-time measure that sets how quickly a nuclide decays.", why_it_matters: "It links half-life to activity through A = lambda N." },
    { term: "Half-life", aliases: ["half-life", "half life"], meaning: "Half-life is the time taken for the number of undecayed nuclei or the activity to fall to half its value.", why_it_matters: "It is the standard time marker for radioactive change." },
    { term: "Mass defect", aliases: ["mass defect"], meaning: "Mass defect is the difference between the mass of separated nucleons and the mass of the bound nucleus.", why_it_matters: "It reveals that nuclear binding has an energy cost or credit." },
    { term: "Binding energy", aliases: ["binding energy"], meaning: "Binding energy is the energy needed to separate a nucleus completely into free nucleons.", why_it_matters: "It explains nuclear stability and nuclear energy release." },
    { term: "Binding energy per nucleon", aliases: ["binding energy per nucleon"], meaning: "Binding energy per nucleon is the total binding energy divided by the number of nucleons.", why_it_matters: "It is the stronger comparison quantity for nuclear stability." },
    { term: "Fission", aliases: ["fission"], meaning: "Fission is the splitting of a heavy nucleus into lighter nuclei with energy release.", why_it_matters: "It is the basis of chain reactions and thermal reactors." },
    { term: "Chain reaction", aliases: ["chain reaction"], meaning: "A chain reaction is a sequence in which neutrons from one fission trigger further fissions.", why_it_matters: "It explains why reactor control matters." },
    { term: "Thermal neutron", aliases: ["thermal neutron", "thermal neutrons"], meaning: "A thermal neutron is a slow neutron suited to capture in a thermal reactor.", why_it_matters: "It is the moderator's target product." },
    { term: "Moderator", aliases: ["moderator"], meaning: "A moderator is a reactor material used to slow fast neutrons down.", why_it_matters: "It helps make the chain reaction sustainable in a thermal reactor." },
    { term: "Control rod", aliases: ["control rod", "control rods"], meaning: "A control rod is a neutron-absorbing rod used to regulate the fission rate.", why_it_matters: "It helps keep neutron multiplication near the desired value." },
    { term: "Critical state", aliases: ["critical state", "critical reactor", "critical"], meaning: "The critical state is the condition in which each fission event leads on average to one more fission event.", why_it_matters: "It is the steady chain-reaction target for a power reactor." },
    { term: "Fusion", aliases: ["fusion"], meaning: "Fusion is the joining of light nuclei to form a heavier nucleus.", why_it_matters: "It is the stellar nuclear process and the comparison partner to fission." },
    { term: "Coulomb barrier", aliases: ["coulomb barrier"], meaning: "The Coulomb barrier is the electrostatic repulsion that light nuclei must overcome before they can get close enough to fuse.", why_it_matters: "It explains why fusion needs very high temperature." },
    { term: "Plasma", aliases: ["plasma"], meaning: "A plasma is a hot ionized gas made of free nuclei and electrons.", why_it_matters: "Fusion fuel is commonly handled in this state." },
  ],
  A11: [
    { term: "Gravitational field strength", aliases: ["gravitational field strength", "field strength"], meaning: "Gravitational field strength is the force per unit mass at a point in a gravitational field.", why_it_matters: "It keeps the local pull per kilogram separate from energy ideas." },
    { term: "Gravitational potential", aliases: ["gravitational potential", "potential"], meaning: "Gravitational potential is the work done or energy transferred per unit mass in bringing a small test mass from infinity to a point.", why_it_matters: "It makes orbit and escape questions into energy-per-kilogram bookkeeping." },
    { term: "Geostationary orbit", aliases: ["geostationary orbit", "geostationary"], meaning: "A geostationary orbit is an equatorial orbit whose period matches Earth's rotation so the satellite appears fixed above one point.", why_it_matters: "It links orbital mechanics to communication use." },
    { term: "Polar orbit", aliases: ["polar orbit"], meaning: "A polar orbit passes over or near the poles so Earth rotates underneath the path.", why_it_matters: "It is useful for global coverage and mapping." },
    { term: "Orbital period", aliases: ["orbital period", "period"], meaning: "Orbital period is the time taken for one complete orbit.", why_it_matters: "It helps compare low orbit with geostationary-style orbit." },
    { term: "Spectrum", aliases: ["spectrum", "stellar spectrum"], meaning: "A stellar spectrum is the spread of wavelengths from a star, often with absorption features.", why_it_matters: "It carries temperature and composition clues." },
    { term: "Absorption line", aliases: ["absorption line", "absorption lines"], meaning: "An absorption line is a dark line in a spectrum where light of a specific wavelength has been absorbed.", why_it_matters: "It helps identify elements in a star's atmosphere." },
    { term: "H-R diagram", aliases: ["h-r diagram", "hr diagram", "hertzsprung-russell diagram"], meaning: "The H-R diagram plots stellar luminosity against temperature.", why_it_matters: "It connects spectra to stellar type and stage." },
    { term: "Luminosity", aliases: ["luminosity"], meaning: "Luminosity is the total power output of a star.", why_it_matters: "It must not be confused with apparent brightness at Earth." },
    { term: "Standard candle", aliases: ["standard candle", "standard candles"], meaning: "A standard candle is an object whose intrinsic luminosity is known or can be inferred.", why_it_matters: "It lets astronomers estimate distance from apparent brightness." },
    { term: "Apparent brightness", aliases: ["apparent brightness", "brightness"], meaning: "Apparent brightness is the power received per unit area from a source at the observer.", why_it_matters: "It is the measurable quantity used with standard candles." },
    { term: "Parallax", aliases: ["parallax"], meaning: "Parallax is the apparent shift in position of a nearby star when viewed from different positions in Earth's orbit.", why_it_matters: "It is the geometric rung for nearby-star distances." },
    { term: "Parsec", aliases: ["parsec", "parsecs", "pc"], meaning: "A parsec is the distance at which a star has parallax angle of one arcsecond.", why_it_matters: "It is the natural unit of the parallax relation." },
    { term: "Red giant", aliases: ["red giant", "red giants"], meaning: "A red giant is an expanded late stage of a lower-mass star after core hydrogen is exhausted.", why_it_matters: "It is part of the stellar-evolution pathway before white-dwarf formation." },
    { term: "White dwarf", aliases: ["white dwarf", "white dwarfs"], meaning: "A white dwarf is a dense compact remnant left by a lower-mass star.", why_it_matters: "It is one endpoint in the mass-dependent stellar pathway." },
    { term: "Neutron star", aliases: ["neutron star", "neutron stars"], meaning: "A neutron star is an extremely dense remnant formed after core collapse in a massive star.", why_it_matters: "It is the more extreme remnant branch beyond white dwarfs." },
    { term: "Black hole", aliases: ["black hole", "black holes"], meaning: "A black hole is an object whose event horizon prevents light from escaping.", why_it_matters: "It is the most extreme compact-object outcome in the school model." },
    { term: "Event horizon", aliases: ["event horizon"], meaning: "The event horizon is the boundary around a black hole from inside which escape would require faster-than-light speed.", why_it_matters: "It is the defining no-escape condition." },
    { term: "Schwarzschild radius", aliases: ["schwarzschild radius"], meaning: "The Schwarzschild radius is the event-horizon radius for a non-rotating black hole of a given mass.", why_it_matters: "It lets remnant mass and radius be compared quantitatively." },
    { term: "Redshift", aliases: ["redshift"], meaning: "Redshift is the increase in observed wavelength compared with emitted wavelength.", why_it_matters: "It is the starting measurable clue in expansion questions." },
    { term: "Hubble's law", aliases: ["hubble's law", "hubbles law"], meaning: "Hubble's law states that recession speed is proportional to distance on large scales.", why_it_matters: "It ties galaxy redshift evidence to the expanding-universe model." },
    { term: "Dark energy", aliases: ["dark energy"], meaning: "Dark energy is the name used in modern cosmology for the cause of accelerated cosmic expansion.", why_it_matters: "It extends the simple expansion story into the modern model." },
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
    { term: "Base unit", aliases: ["base unit", "si base unit"], meaning: "A base unit is the agreed starting unit in SI, such as metre, kilogram, or second.", why_it_matters: "It gives a common reference point before prefixes or conversions are applied." },
    { term: "Prefix", aliases: ["prefix", "kilo", "centi", "milli"], meaning: "A prefix changes the size of a unit, making it larger or smaller by a known factor.", why_it_matters: "Prefixes let you choose a unit size that matches the scale of the object." },
    { term: "Scalar", aliases: ["scalar", "scalars"], meaning: "A scalar quantity has size only, with no direction attached.", why_it_matters: "It helps you separate simple amounts from direction-based quantities." },
    { term: "Vector", aliases: ["vector", "vectors"], meaning: "A vector quantity has both size and direction.", why_it_matters: "Direction changes the meaning, so vectors cannot be treated like plain scalars." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the directed change in position from start to finish.", why_it_matters: "It keeps route length separate from the final position change." },
    { term: "Resolution", aliases: ["resolution"], meaning: "Resolution is the smallest change an instrument can show clearly.", why_it_matters: "It limits how much detail a measurement can honestly claim." },
    { term: "Uncertainty", aliases: ["uncertainty"], meaning: "Uncertainty is the range within which the true value is likely to lie.", why_it_matters: "It shows how trustworthy the reading is, not just what the reading says." },
    { term: "Random error", aliases: ["random error", "random errors"], meaning: "Random error makes repeated readings scatter unpredictably around a best estimate.", why_it_matters: "It affects precision and is reduced by careful repeats and averaging." },
    { term: "Systematic error", aliases: ["systematic error", "systematic errors"], meaning: "Systematic error shifts readings the same way each time, often because of zero error or poor calibration.", why_it_matters: "It can make results consistently wrong even when the readings look precise." },
    { term: "Zero error", aliases: ["zero error"], meaning: "Zero error is a built-in offset shown by an instrument before the real measurement begins.", why_it_matters: "It is a common source of systematic error that must be checked or corrected." },
    { term: "Significant figures", aliases: ["significant figures", "significant figure"], meaning: "Significant figures are the digits that carry meaningful precision in a measured value.", why_it_matters: "They stop you from pretending a result is more exact than it really is." },
    { term: "Density", aliases: ["density"], meaning: "Density is the mass packed into each unit of volume.", why_it_matters: "It compares how much matter is in a given amount of space." },
    { term: "Accuracy", aliases: ["accuracy"], meaning: "Accuracy describes how close a measurement is to the accepted or true value.", why_it_matters: "It answers whether the result is close to the target." },
    { term: "Precision", aliases: ["precision"], meaning: "Precision describes how closely repeated measurements agree with one another.", why_it_matters: "It answers whether the method gives a tight cluster of readings." },
    { term: "Percentage uncertainty", aliases: ["percentage uncertainty"], meaning: "Percentage uncertainty compares the uncertainty with the measured value as a percentage.", why_it_matters: "It helps you compare the relative quality of measurements of different sizes." },
  ],
  F2: [
    { term: "Distance", aliases: ["distance"], meaning: "Distance is the total path length travelled, without direction.", why_it_matters: "It tells how much ground was covered, not where the journey finished." },
    { term: "Displacement", aliases: ["displacement"], meaning: "Displacement is the straight-line change in position from start to finish, including direction.", why_it_matters: "It keeps the final position story separate from the total path story." },
    { term: "Speed", aliases: ["speed"], meaning: "Speed is distance travelled each second, with no direction attached.", why_it_matters: "It is a scalar rate, so it is different from velocity." },
    { term: "Average speed", aliases: ["average speed"], meaning: "Average speed is the total distance travelled divided by the total time taken.", why_it_matters: "It keeps route length and elapsed time tied together for whole-journey calculations." },
    { term: "Velocity", aliases: ["velocity"], meaning: "Velocity is speed in a specified direction.", why_it_matters: "It tells both how fast and which way the motion is happening." },
    { term: "Acceleration", aliases: ["acceleration"], meaning: "Acceleration is the rate at which velocity changes.", why_it_matters: "It can come from changing speed, changing direction, or both." },
    { term: "Distance-time graph", aliases: ["distance-time graph", "distance time graph"], meaning: "A distance-time graph shows how total distance covered changes as time passes.", why_it_matters: "Its gradient tells speed while its height tells total distance covered." },
    { term: "Velocity-time graph", aliases: ["velocity-time graph", "velocity time graph"], meaning: "A velocity-time graph shows how velocity changes with time.", why_it_matters: "Its slope gives acceleration and its area gives displacement." },
    { term: "Force", aliases: ["force"], meaning: "A force is a push or pull that can change an object's motion.", why_it_matters: "Forces explain why acceleration happens." },
    { term: "Resultant force", aliases: ["resultant force", "net force"], meaning: "The resultant force is the single overall force after combining all the individual forces.", why_it_matters: "Motion changes because of the overall force, not because of one force viewed alone." },
    { term: "Balanced forces", aliases: ["balanced forces", "balanced force"], meaning: "Balanced forces are forces that cancel to give zero resultant force.", why_it_matters: "They explain why an object can stay at rest or keep a constant velocity without accelerating." },
    { term: "Unbalanced forces", aliases: ["unbalanced forces", "unbalanced force"], meaning: "Unbalanced forces leave a non-zero resultant force.", why_it_matters: "They explain why an object's velocity changes." },
    { term: "Friction", aliases: ["friction"], meaning: "Friction is a force that opposes motion between touching surfaces.", why_it_matters: "It helps explain why moving objects slow down or need a driving force." },
    { term: "Air resistance", aliases: ["air resistance", "drag"], meaning: "Air resistance is the resistive force from moving through air.", why_it_matters: "It can reduce acceleration or create a balanced-speed situation." },
    { term: "Inertia", aliases: ["inertia"], meaning: "Inertia is the tendency of an object to resist changes to its motion.", why_it_matters: "It helps explain why objects keep their current state unless a resultant force acts." },
    { term: "Newton's second law", aliases: ["newton's second law", "newtons second law", "f = ma"], meaning: "Newton's second law links resultant force, mass, and acceleration with F = ma.", why_it_matters: "It turns the force-change relationship into a usable quantitative rule." },
  ],
  F3: [
    { term: "Energy", aliases: ["energy"], meaning: "Energy is a quantity that can be stored and transferred between objects or systems.", why_it_matters: "It tracks what can cause changes even when the form changes." },
    { term: "Energy store", aliases: ["energy store", "store"], meaning: "An energy store is a way energy is held in a system, such as kinetic or thermal store.", why_it_matters: "It helps learners track where the energy is rather than treating energy as vague substance." },
    { term: "Transfer", aliases: ["transfer", "energy transfer"], meaning: "An energy transfer is energy moving from one store, place, or system to another.", why_it_matters: "It explains change without saying energy disappears." },
    { term: "Work done", aliases: ["work", "work done"], meaning: "Work done is energy transferred when a force acts through a distance.", why_it_matters: "It links force-and-motion stories to energy change." },
    { term: "Kinetic energy", aliases: ["kinetic energy", "ke"], meaning: "Kinetic energy is the energy store an object has because it is moving.", why_it_matters: "It rises strongly with speed and helps explain why faster motion is harder to stop." },
    { term: "Gravitational potential energy", aliases: ["gravitational potential energy", "gpe"], meaning: "Gravitational potential energy is the energy store an object has because of its height in a gravitational field.", why_it_matters: "It keeps position-based energy separate from motion-based energy." },
    { term: "Power", aliases: ["power"], meaning: "Power is the rate of energy transfer.", why_it_matters: "It tells how quickly energy is being transferred, not how much in total." },
    { term: "Conservation of energy", aliases: ["conservation of energy", "conserved"], meaning: "Conservation of energy means total energy is accounted for even when it changes store or spreads out.", why_it_matters: "It stops students from saying energy is destroyed when it becomes less useful." },
    { term: "Efficiency", aliases: ["efficiency"], meaning: "Efficiency is the fraction of the input energy that becomes useful output.", why_it_matters: "It separates useful transfer from wasted transfer." },
    { term: "Momentum", aliases: ["momentum"], meaning: "Momentum is mass multiplied by velocity, so it keeps both size and direction in one motion quantity.", why_it_matters: "It is the quantity conserved for isolated collision systems." },
    { term: "Impulse", aliases: ["impulse"], meaning: "Impulse is the force-time effect that equals the change in momentum.", why_it_matters: "It explains why increasing stopping time can reduce average force." },
    { term: "Crumple zone", aliases: ["crumple zone"], meaning: "A crumple zone is a vehicle design feature that lengthens stopping time during a crash.", why_it_matters: "It lowers the average force on passengers for the same momentum change." },
  ],
  F4: [
    { term: "Charge", aliases: ["charge", "electric charge"], meaning: "Charge is the quantity of electricity carried by particles such as electrons, measured in coulombs.", why_it_matters: "It is the quantity that current moves and voltage energises." },
    { term: "Current", aliases: ["current", "electric current"], meaning: "Current is the rate of charge flow in a circuit, measured in amperes.", why_it_matters: "It tells how much charge passes each point per second in a complete route." },
    { term: "Potential difference", aliases: ["potential difference", "voltage"], meaning: "Potential difference is the energy transferred per unit charge between two points in a circuit.", why_it_matters: "It tells what each coulomb gains or loses, not how much charge passes each second." },
    { term: "Resistance", aliases: ["resistance"], meaning: "Resistance is how strongly a component opposes charge flow.", why_it_matters: "It links voltage and current and explains why some routes are harder for charge to move through." },
    { term: "Ohmic component", aliases: ["ohmic component", "ohmic resistor"], meaning: "An ohmic component is one for which current is proportional to voltage under steady conditions.", why_it_matters: "It is the condition behind the straight I-V graph and the regular use of Ohm's law." },
    { term: "I-V graph", aliases: ["i-v graph", "iv graph", "current-voltage graph"], meaning: "An I-V graph shows how current changes as voltage changes for a component.", why_it_matters: "Its shape and slope help compare resistance and identify ohmic behaviour." },
    { term: "Series circuit", aliases: ["series circuit", "series"], meaning: "A series circuit has one complete route, so the same current passes every component while the supply voltage is shared.", why_it_matters: "It keeps one-path current logic separate from split-path circuit logic." },
    { term: "Parallel circuit", aliases: ["parallel circuit", "parallel"], meaning: "A parallel circuit has multiple routes between the same two points, so branch voltage stays the same while current splits and recombines.", why_it_matters: "It explains why branches can work independently and why total current is the sum of branch currents." },
    { term: "Power", aliases: ["power"], meaning: "Power is the rate at which electrical energy is transferred, measured in watts.", why_it_matters: "It separates energy transferred each second from total energy transferred over time." },
    { term: "Fuse", aliases: ["fuse"], meaning: "A fuse is a safety device that melts and breaks the circuit if the current becomes too large.", why_it_matters: "It protects wires and components from dangerous overheating caused by excessive current." },
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
    { term: "Charge", aliases: ["charge"], meaning: "Charge is the conserved electrical quantity carried through a circuit by particles such as electrons.", why_it_matters: "It is the quantity that flows; it is not used up by a lamp or resistor." },
    { term: "Current", aliases: ["current"], meaning: "Current is the rate of charge flow past a point in the circuit.", why_it_matters: "It helps separate charge-flow rate from energy transfer." },
    { term: "Potential difference", aliases: ["potential difference", "voltage"], meaning: "Potential difference is the energy transferred per unit charge between two points.", why_it_matters: "It tells how much energy each coulomb gains or loses." },
    { term: "Resistance", aliases: ["resistance"], meaning: "Resistance is how strongly a component or route opposes the flow of current.", why_it_matters: "It belongs to the path or component, not to the battery." },
    { term: "Ohm's law", aliases: ["ohm's law", "ohms law"], meaning: "Ohm's law states that current is proportional to potential difference for an ohmic conductor when other conditions stay constant.", why_it_matters: "It links voltage, current, and resistance in a disciplined way." },
    { term: "I-V characteristic", aliases: ["i-v characteristic", "iv characteristic", "i-v graph", "iv graph"], meaning: "An I-V characteristic is the graph showing how current responds to potential difference for a component.", why_it_matters: "It distinguishes constant-resistance ohmic behaviour from components whose resistance changes." },
    { term: "Equivalent resistance", aliases: ["equivalent resistance", "combined resistance"], meaning: "Equivalent resistance is the single resistance that has the same overall effect as a network or section of network.", why_it_matters: "It makes series, parallel, and mixed-circuit analysis manageable." },
    { term: "Complete circuit", aliases: ["complete circuit", "closed circuit"], meaning: "A complete circuit is an unbroken conducting loop that lets charge keep flowing.", why_it_matters: "Without a complete route, a steady current cannot be sustained." },
    { term: "Series circuit", aliases: ["series circuit", "series"], meaning: "A series circuit has one route, so the same current passes through each component in turn.", why_it_matters: "It explains why one broken component can stop the whole loop." },
    { term: "Parallel circuit", aliases: ["parallel circuit", "parallel"], meaning: "A parallel circuit has branches connected between the same two junctions.", why_it_matters: "It explains why each branch shares the same potential difference while current can split." },
    { term: "Junction", aliases: ["junction", "junctions"], meaning: "A junction is a point where current can split into branches or recombine.", why_it_matters: "It is where branch-current comparisons and current-sum rules matter." },
  ],
  M10: [
    { term: "Magnetic field", aliases: ["magnetic field"], meaning: "A magnetic field is the region where a magnetic force would act on magnets, magnetic materials, or moving charges.", why_it_matters: "It is the invisible structure behind many magnetic effects." },
    { term: "Field line", aliases: ["field line", "field lines"], meaning: "Field lines are drawn lines that show the direction and pattern of a field.", why_it_matters: "They are a map of the field, not actual physical strings." },
    { term: "Electromagnet", aliases: ["electromagnet"], meaning: "An electromagnet is a magnet created by electric current, often using a coil and an iron core.", why_it_matters: "It links electricity and magnetism in a controllable way." },
    { term: "Solenoid", aliases: ["solenoid", "coil"], meaning: "A solenoid is a coil of wire that can produce a magnetic field when current flows through it.", why_it_matters: "It is a standard structure for electromagnets." },
    { term: "Soft-iron core", aliases: ["soft-iron core", "soft iron core"], meaning: "A soft-iron core is an easily magnetized core placed inside a coil to strengthen an electromagnet.", why_it_matters: "It strengthens the field while still allowing the electromagnet to switch off effectively." },
    { term: "Motor effect", aliases: ["motor effect"], meaning: "The motor effect is the force on a current-carrying conductor in a magnetic field.", why_it_matters: "It explains how electric motors produce motion." },
    { term: "Electromagnetic induction", aliases: ["electromagnetic induction", "induction"], meaning: "Electromagnetic induction is the creation of an emf when magnetic flux through a conductor changes.", why_it_matters: "It is the central idea behind generators and transformers." },
    { term: "Magnetic flux", aliases: ["magnetic flux", "flux"], meaning: "Magnetic flux measures how much magnetic field passes through an area.", why_it_matters: "Changing flux is what drives induction." },
    { term: "Generator", aliases: ["generator"], meaning: "A generator is a device that converts mechanical energy into electrical energy by induction.", why_it_matters: "It reverses the energy-conversion story of a motor." },
    { term: "Transformer", aliases: ["transformer"], meaning: "A transformer is a device that uses induction between coils to change voltage in alternating-current systems.", why_it_matters: "It is essential for efficient power transmission." },
    { term: "Commutator", aliases: ["commutator", "split-ring commutator", "split ring commutator"], meaning: "A commutator is the rotating contact system that reverses or manages current connections in some machines.", why_it_matters: "It helps keep motor torque or generator output working as intended." },
    { term: "Primary coil", aliases: ["primary coil", "primary winding"], meaning: "The primary coil is the input coil connected to the source in a transformer.", why_it_matters: "Its changing current creates the changing flux that links the transformer coils." },
    { term: "Secondary coil", aliases: ["secondary coil", "secondary winding"], meaning: "The secondary coil is the output coil where the transformed voltage appears.", why_it_matters: "Its turns count helps set the output voltage and current in transformer problems." },
  ],
  M11: [
    { term: "Atom", aliases: ["atom", "atomic"], meaning: "An atom is the basic unit of ordinary matter, with a nucleus surrounded by electrons.", why_it_matters: "Radioactivity begins with the structure of the atom rather than with a vague idea of particles floating freely." },
    { term: "Nucleus", aliases: ["nucleus", "nuclei"], meaning: "The nucleus is the tiny dense centre of an atom containing protons and neutrons.", why_it_matters: "Radioactive change happens in the nucleus, not in the electron shell." },
    { term: "Proton", aliases: ["proton", "protons"], meaning: "A proton is a positively charged particle in the nucleus.", why_it_matters: "Proton number fixes the element identity." },
    { term: "Neutron", aliases: ["neutron", "neutrons"], meaning: "A neutron is an uncharged particle in the nucleus.", why_it_matters: "Changing neutron number changes the isotope without changing the element." },
    { term: "Electron", aliases: ["electron", "electrons"], meaning: "An electron is a negatively charged particle outside the nucleus.", why_it_matters: "Changing electron number changes ion charge but not the element identity." },
    { term: "Atomic number", aliases: ["atomic number", "proton number", "z"], meaning: "Atomic number is the number of protons in the nucleus.", why_it_matters: "It is the clean test for which element you are describing." },
    { term: "Mass number", aliases: ["mass number", "nucleon number", "a"], meaning: "Mass number is the total number of protons and neutrons in the nucleus.", why_it_matters: "It helps separate isotope identity from charge state." },
    { term: "Ion", aliases: ["ion", "ions"], meaning: "An ion is an atom or group of atoms with an overall electric charge because the numbers of protons and electrons are unequal.", why_it_matters: "It keeps charge-state reasoning separate from nuclear identity." },
    { term: "Isotope", aliases: ["isotope", "isotopes"], meaning: "Isotopes are atoms of the same element with the same number of protons but different numbers of neutrons.", why_it_matters: "Some isotopes are stable and some are radioactive." },
    { term: "Radioactive decay", aliases: ["radioactive decay", "decay"], meaning: "Radioactive decay is the spontaneous change of an unstable nucleus into a more stable form.", why_it_matters: "It is random for one nucleus but statistically predictable for a large sample." },
    { term: "Alpha particle", aliases: ["alpha", "alpha particle"], meaning: "An alpha particle is a helium nucleus emitted in some radioactive decays.", why_it_matters: "It is strongly ionising but not very penetrating." },
    { term: "Beta particle", aliases: ["beta", "beta particle", "beta-minus", "beta minus"], meaning: "A beta particle is a high-speed electron emitted from the nucleus during beta-minus decay.", why_it_matters: "It has intermediate penetrating power and changes atomic number without changing mass number." },
    { term: "Gamma ray", aliases: ["gamma", "gamma ray"], meaning: "A gamma ray is high-energy electromagnetic radiation emitted from the nucleus.", why_it_matters: "It is very penetrating and leaves both atomic number and mass number unchanged." },
    { term: "Ionisation", aliases: ["ionisation", "ionization"], meaning: "Ionisation is the process of removing or adding electrons so atoms become charged.", why_it_matters: "It is the main mechanism behind radiation detection and many radiation hazards." },
    { term: "Half-life", aliases: ["half life", "half-life"], meaning: "Half-life is the time taken for the number of undecayed nuclei, or the activity, to fall to half its value.", why_it_matters: "It turns random decay into a measurable pattern for large samples." },
    { term: "Background radiation", aliases: ["background radiation"], meaning: "Background radiation is the low-level radiation always present in the environment from natural and human-made sources.", why_it_matters: "Detector readings must be corrected for background before a source is judged fairly." },
    { term: "Count rate", aliases: ["count rate", "counts per second", "counts per minute"], meaning: "Count rate is the number of detector counts recorded each second or each minute.", why_it_matters: "It is the measurable evidence used in source comparisons and half-life work." },
  ],
  M12: [
    { term: "Binding energy", aliases: ["binding energy"], meaning: "Binding energy is the energy needed to separate a nucleus completely into free nucleons.", why_it_matters: "It explains why some nuclear changes release large amounts of energy." },
    { term: "Mass defect", aliases: ["mass defect"], meaning: "Mass defect is the difference between the mass of separated nucleons and the smaller mass of the bound nucleus.", why_it_matters: "It links nuclear stability to the mass-energy relation." },
    { term: "Fission", aliases: ["fission"], meaning: "Fission is the splitting of a heavy nucleus into smaller nuclei with energy release.", why_it_matters: "It is the process used in nuclear reactors." },
    { term: "Chain reaction", aliases: ["chain reaction"], meaning: "A chain reaction is a self-propagating sequence in which one fission event helps trigger later ones.", why_it_matters: "It explains why reactor control is necessary." },
    { term: "Fusion", aliases: ["fusion"], meaning: "Fusion is the joining of light nuclei to form a heavier nucleus with energy release.", why_it_matters: "It is the process that powers stars." },
    { term: "Moderator", aliases: ["moderator"], meaning: "A moderator is a material that slows neutrons so further fission is more likely in a thermal reactor.", why_it_matters: "It belongs to neutron control, not to electrical generation directly." },
    { term: "Control rod", aliases: ["control rod", "control rods"], meaning: "A control rod is a neutron-absorbing component used to reduce the fission rate in a reactor.", why_it_matters: "It helps keep the chain reaction under control." },
    { term: "Coolant", aliases: ["coolant"], meaning: "A coolant is a fluid or gas that transfers thermal energy away from the reactor core.", why_it_matters: "It links the core to later steam and turbine stages." },
    { term: "Radioisotope", aliases: ["radioisotope", "radioisotopes"], meaning: "A radioisotope is an unstable isotope that emits ionising radiation as it decays.", why_it_matters: "Different radioisotopes are chosen for different practical jobs." },
    { term: "Tracer", aliases: ["tracer", "radioactive tracer"], meaning: "A tracer is a radioisotope used to follow the movement or distribution of a substance.", why_it_matters: "It is useful only when the decay properties fit the task." },
    { term: "Shielding", aliases: ["shielding"], meaning: "Shielding is the use of absorbing material to reduce radiation reaching people or equipment.", why_it_matters: "It is one of the main ways nuclear exposure is controlled." },
    { term: "Contamination", aliases: ["contamination"], meaning: "Contamination is the unwanted presence of radioactive material on or inside an object or person.", why_it_matters: "It is different from simple irradiation and can create continuing exposure." },
    { term: "Irradiation", aliases: ["irradiation"], meaning: "Irradiation is exposure to radiation from a source without the source itself necessarily entering the object.", why_it_matters: "It keeps source exposure separate from radioactive material transfer." },
    { term: "Nuclear waste", aliases: ["nuclear waste", "radioactive waste"], meaning: "Nuclear waste is radioactive material remaining after nuclear processes or uses that must be managed safely.", why_it_matters: "It keeps long-term storage and hazard part of the full nuclear-technology story." },
  ],
  M13: [
    { term: "Orbit", aliases: ["orbit", "orbits", "orbital path"], meaning: "An orbit is the curved path followed by one body around another because gravity keeps pulling it inward.", why_it_matters: "It keeps Solar System motion tied to gravity and sideways motion together." },
    { term: "Rotation", aliases: ["rotation", "rotate", "rotates"], meaning: "Rotation is the spinning of a body about its own axis.", why_it_matters: "It is the cause of day and night on Earth." },
    { term: "Axis", aliases: ["axis", "axial"], meaning: "An axis is the imaginary line about which a body rotates.", why_it_matters: "Earth's tilted axis is the key seasonal idea." },
    { term: "Axial tilt", aliases: ["axial tilt", "tilt of the axis", "tilted axis"], meaning: "Axial tilt is the angle between a planet's rotation axis and the perpendicular to its orbital plane.", why_it_matters: "It explains why sunlight angle changes through the year." },
    { term: "Orbital period", aliases: ["orbital period", "period of orbit"], meaning: "Orbital period is the time taken for one complete orbit.", why_it_matters: "It links route size to year length in the Solar System." },
    { term: "Hemisphere", aliases: ["hemisphere", "hemispheres"], meaning: "A hemisphere is one half of a spherical body such as Earth.", why_it_matters: "Opposite hemispheres experience opposite seasons at the same time." },
    { term: "Phase", aliases: ["phase", "phases", "moon phase", "moon phases"], meaning: "A phase is the apparent shape of the lit part of the Moon seen from Earth.", why_it_matters: "It comes from viewing geometry, not from Earth shadow." },
    { term: "Eclipse", aliases: ["eclipse", "eclipses"], meaning: "An eclipse is an event in which one body moves into the shadow of another because of a special alignment.", why_it_matters: "It must be kept separate from ordinary Moon phases." },
    { term: "Planet", aliases: ["planet", "planets"], meaning: "A planet is a large body that orbits the Sun and does not produce its own light.", why_it_matters: "It helps sort Solar System family members by role rather than by appearance." },
    { term: "Moon", aliases: ["moon", "moons", "natural satellite"], meaning: "A moon is a natural satellite that mainly orbits a planet or dwarf planet.", why_it_matters: "It keeps the Moon's main host body separate from the wider Sun-centered system." },
    { term: "Solar System", aliases: ["solar system"], meaning: "The Solar System is the Sun and the collection of planets, moons, and smaller bodies bound to it by gravity.", why_it_matters: "It is the full family structure for this module, not just a list of planet names." },
    { term: "Astronomical unit", aliases: ["astronomical unit", "au"], meaning: "An astronomical unit is the mean Earth-Sun distance used as a convenient Solar System distance scale.", why_it_matters: "It reminds learners that classroom sketches are heavily compressed and not literal." },
  ],
  M14: [
    { term: "Star", aliases: ["star", "stars"], meaning: "A star is a self-luminous ball of gas powered by nuclear fusion in its core.", why_it_matters: "It makes stars different from planets or mirrors that only reflect light." },
    { term: "Fusion", aliases: ["fusion"], meaning: "Fusion is the joining of light nuclei to form heavier nuclei, releasing energy.", why_it_matters: "It is the process that powers stars." },
    { term: "Nebula", aliases: ["nebula", "nebulae"], meaning: "A nebula is a large cloud of gas and dust in space from which stars can form.", why_it_matters: "It gives stellar evolution a real starting state rather than turning the lifecycle into a list of endings." },
    { term: "Protostar", aliases: ["protostar", "protostars"], meaning: "A protostar is a forming star that is still contracting before the long main-sequence stage begins.", why_it_matters: "It keeps stellar birth causal instead of making stars seem to appear fully formed." },
    { term: "Main sequence", aliases: ["main sequence"], meaning: "The main sequence is the long stable stage of a star's life when fusion in the core is balancing the star for most of its lifetime.", why_it_matters: "It keeps the shared middle stage visible before low-mass and high-mass routes split." },
    { term: "Red giant", aliases: ["red giant", "red giants"], meaning: "A red giant is a swollen later stage of a lower-mass star after the main sequence.", why_it_matters: "It keeps the low-mass route distinct from the supernova route." },
    { term: "Red supergiant", aliases: ["red supergiant", "red supergiants"], meaning: "A red supergiant is a very large later stage of a high-mass star before supernova.", why_it_matters: "It signals that the star is on the high-mass branch rather than the white-dwarf branch." },
    { term: "Galaxy", aliases: ["galaxy", "galaxies"], meaning: "A galaxy is a huge gravitationally bound collection of stars, gas, dust, and dark matter.", why_it_matters: "It is far larger than a star system but smaller than the whole universe." },
    { term: "Milky Way", aliases: ["milky way"], meaning: "The Milky Way is the galaxy that contains our Solar System.", why_it_matters: "It keeps our home galaxy separate from the wider universe and from one local star system." },
    { term: "Light-year", aliases: ["light year", "light-year"], meaning: "A light-year is a distance: the distance light travels in one year.", why_it_matters: "The word year is part of the definition, but the quantity measured is distance." },
    { term: "Redshift", aliases: ["redshift"], meaning: "Redshift is the increase in observed wavelength compared with the emitted wavelength.", why_it_matters: "It is evidence that distant galaxies are moving away in the expansion story." },
    { term: "Recession speed", aliases: ["recession speed", "recession speeds"], meaning: "Recession speed is the speed at which a distant galaxy appears to move away on the large-scale expansion model.", why_it_matters: "It is the quantity linked to distance in Hubble's law." },
    { term: "White dwarf", aliases: ["white dwarf", "white dwarfs"], meaning: "A white dwarf is the hot dense remnant left after a low-mass star has shed its outer layers.", why_it_matters: "It keeps the low-mass stellar ending separate from supernova routes." },
    { term: "Neutron star", aliases: ["neutron star", "neutron stars"], meaning: "A neutron star is an extremely dense stellar remnant that can be left after a high-mass star explodes as a supernova.", why_it_matters: "It keeps compact supernova remnants separate from ordinary stars and from black holes." },
    { term: "Black hole", aliases: ["black hole", "black holes"], meaning: "A black hole is a collapsed object whose gravity is so strong that not even light can escape from within its event horizon.", why_it_matters: "It is the more extreme compact-remnant idea on the very-high-mass stellar route." },
    { term: "Big Bang", aliases: ["big bang"], meaning: "The Big Bang model describes the universe expanding from an earlier hot, dense state.", why_it_matters: "It is a model of cosmic history, not an ordinary explosion into empty space." },
    { term: "Hubble's law", aliases: ["hubbles law", "hubble law", "hubble's law"], meaning: "Hubble's law states that, on large scales, the recession speed of a galaxy is proportional to its distance.", why_it_matters: "It turns the expansion story into a quantitative relation that can be tested with data." },
    { term: "Hubble constant", aliases: ["hubble constant", "h0"], meaning: "The Hubble constant is the proportionality constant in Hubble's law.", why_it_matters: "It lets students convert between galaxy distance and recession speed in school-level calculations." },
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
    { term: "Energy level", aliases: ["energy level", "energy levels"], meaning: "An energy level is a discrete allowed energy state for an electron in an atom.", why_it_matters: "It anchors spectra and transition reasoning." },
    { term: "Quantized", aliases: ["quantized", "quantised"], meaning: "Quantized means restricted to specific allowed values rather than a continuous spread.", why_it_matters: "It protects the discrete-ladder model." },
    { term: "Ground state", aliases: ["ground state"], meaning: "The ground state is the lowest allowed energy level of an atom.", why_it_matters: "It gives a fixed reference level for transitions." },
    { term: "Excitation", aliases: ["excitation", "excited state", "excited"], meaning: "Excitation raises an electron to a higher allowed bound energy level.", why_it_matters: "It explains upward transitions without ionisation." },
    { term: "Emission spectrum", aliases: ["emission spectrum", "emission line", "emission lines"], meaning: "An emission spectrum is the set of discrete wavelengths released when electrons fall to lower levels.", why_it_matters: "It turns atomic gaps into visible evidence." },
    { term: "Absorption spectrum", aliases: ["absorption spectrum", "absorption line", "absorption lines"], meaning: "An absorption spectrum is the set of wavelengths removed when electrons absorb specific photon energies.", why_it_matters: "It shows the same level gaps from the opposite direction." },
    { term: "Work function", aliases: ["work function"], meaning: "The work function is the minimum energy needed to release an electron from a metal surface.", why_it_matters: "It sets the photoelectric threshold." },
    { term: "Threshold frequency", aliases: ["threshold frequency"], meaning: "Threshold frequency is the minimum light frequency that can cause photoelectric emission.", why_it_matters: "It stops brightness language from replacing packet-energy reasoning." },
    { term: "Ionisation", aliases: ["ionisation", "ionization"], meaning: "Ionisation is the complete removal of an electron from the atom.", why_it_matters: "It distinguishes full escape from mere excitation." },
    { term: "de Broglie wavelength", aliases: ["de broglie wavelength", "matter wavelength"], meaning: "The de Broglie wavelength is the wavelength associated with a moving particle.", why_it_matters: "It links momentum to diffraction behavior." },
  ],
  A3: [
    { term: "Progressive wave", aliases: ["progressive wave", "progressive waves"], meaning: "A progressive wave transfers energy as the disturbance travels through space.", why_it_matters: "It separates traveling patterns from stationary ones." },
    { term: "Superposition", aliases: ["superposition"], meaning: "Superposition says the total displacement is the sum of the overlapping displacements.", why_it_matters: "It is the core addition rule for waves." },
    { term: "Stationary wave", aliases: ["stationary wave", "stationary waves", "standing wave", "standing waves"], meaning: "A stationary wave is a standing pattern formed by two opposite-traveling waves of the same frequency.", why_it_matters: "It explains fixed nodes and antinodes." },
    { term: "Node", aliases: ["node", "nodes"], meaning: "A node is a point that remains at zero displacement in a stationary wave.", why_it_matters: "It is the fixed quiet point in the pattern." },
    { term: "Antinode", aliases: ["antinode", "antinodes"], meaning: "An antinode is a point of maximum oscillation amplitude in a stationary wave.", why_it_matters: "It marks where the oscillation is strongest." },
    { term: "Interference", aliases: ["interference"], meaning: "Interference is the pattern produced when coherent waves superpose.", why_it_matters: "It turns phase comparison into visible outcomes." },
    { term: "Diffraction grating", aliases: ["diffraction grating"], meaning: "A diffraction grating is a large set of equally spaced slits.", why_it_matters: "It creates sharp interference maxima." },
    { term: "Critical angle", aliases: ["critical angle"], meaning: "The critical angle is the incident angle in the denser medium that gives a refracted angle of 90 degrees.", why_it_matters: "It marks the threshold for total internal reflection." },
    { term: "Total internal reflection", aliases: ["total internal reflection"], meaning: "Total internal reflection occurs when no refracted ray emerges and the wave is reflected back into the denser medium.", why_it_matters: "It explains light guiding in optical systems." },
    { term: "Oscilloscope", aliases: ["oscilloscope"], meaning: "An oscilloscope displays voltage against time as a trace.", why_it_matters: "It makes fast wave behavior readable." },
  ],
  A4: [
    { term: "Vector", aliases: ["vector", "vectors"], meaning: "A vector has magnitude and direction.", why_it_matters: "It is the natural language for forces and directed motion." },
    { term: "Component", aliases: ["component", "components"], meaning: "A component is the projection of a vector on a chosen axis.", why_it_matters: "It makes diagonal mechanics problems calculable." },
    { term: "Equilibrium", aliases: ["equilibrium"], meaning: "Equilibrium means the resultant force is zero for the situation being studied.", why_it_matters: "It is the balance condition for vector-rig questions." },
    { term: "Projectile", aliases: ["projectile", "projectiles"], meaning: "A projectile moves under gravity after launch in the ideal model.", why_it_matters: "It frames the split horizontal-vertical motion story." },
    { term: "Momentum", aliases: ["momentum"], meaning: "Momentum is the product of mass and velocity.", why_it_matters: "It is the first safe collision ledger." },
    { term: "Impulse", aliases: ["impulse"], meaning: "Impulse is the change in momentum produced during a force-time interaction.", why_it_matters: "It links collision force and duration to momentum change." },
    { term: "Centripetal acceleration", aliases: ["centripetal acceleration"], meaning: "Centripetal acceleration is the inward acceleration required for circular motion.", why_it_matters: "It explains why turning counts as acceleration even at constant speed." },
    { term: "Stress", aliases: ["stress"], meaning: "Stress is force per unit cross-sectional area.", why_it_matters: "It normalizes load before materials are compared." },
    { term: "Strain", aliases: ["strain"], meaning: "Strain is extension divided by original length.", why_it_matters: "It normalizes stretch before materials are compared." },
    { term: "Young modulus", aliases: ["young modulus", "young's modulus"], meaning: "Young modulus is the ratio of stress to strain in the elastic region.", why_it_matters: "It compares elastic material stiffness rather than force alone." },
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

function isGeneratedTechnicalWord(entry: TechnicalWordEntry): boolean {
  const source = text(entry.source).toLowerCase();
  return source === "lesson_generated" || source === "generated";
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
      score:
        scoreEntryAgainstCorpus(entry, corpus) +
        (index < authoredCount && !isGeneratedTechnicalWord(entry) ? 0.25 : 0),
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
