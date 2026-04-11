"use client";

export type FormulaFallbackEntry = {
  standardFormula: string;
  meaning?: string;
  conditions?: string;
  unitsText?: string;
  constants?: string;
};

const CORE_FORMULA_FALLBACKS: Record<string, FormulaFallbackEntry[]> = {
  M1_L1: [
    { standardFormula: "average speed = total distance / total time", meaning: "Average speed compares total route length with elapsed time.", conditions: "Use for a whole journey or chosen interval.", unitsText: "m/s" },
    { standardFormula: "displacement = final position - initial position", meaning: "Displacement tracks directed change in position.", conditions: "Use when direction matters.", unitsText: "m" },
  ],
  M1_L2: [
    { standardFormula: "velocity = displacement / time", meaning: "Velocity compares directed position change with time.", conditions: "Use when the sign or direction of motion matters.", unitsText: "m/s" },
    { standardFormula: "speed = distance / time", meaning: "Speed compares route length with elapsed time.", conditions: "Use when only how fast matters.", unitsText: "m/s" },
  ],
  M1_L3: [
    { standardFormula: "a = Δv / t", meaning: "Acceleration is the rate of change of velocity.", conditions: "Use when velocity changes over a known time interval.", unitsText: "m/s^2" },
  ],
  M1_L4: [
    { standardFormula: "v = u + at", meaning: "Final velocity comes from initial velocity plus constant acceleration over time.", conditions: "Use only for constant acceleration.", unitsText: "m/s" },
    { standardFormula: "s = ut + 1/2 at^2", meaning: "Displacement during constant acceleration depends on the starting velocity, time, and acceleration.", conditions: "Use only for constant acceleration.", unitsText: "m" },
    { standardFormula: "v^2 = u^2 + 2as", meaning: "This constant-acceleration relation links velocity change directly to displacement.", conditions: "Use when time is not needed or not given, and acceleration is constant.", unitsText: "m^2/s^2" },
  ],
  M1_L5: [
    { standardFormula: "gradient of displacement-time graph = velocity", meaning: "Graph slope depends on the axis meaning, not on steepness alone.", conditions: "Use for displacement-time graphs.", unitsText: "m/s" },
    { standardFormula: "gradient of velocity-time graph = acceleration", meaning: "Velocity-time slope tells how quickly velocity changes.", conditions: "Use for velocity-time graphs.", unitsText: "m/s^2" },
  ],
  M1_L6: [
    { standardFormula: "displacement = area under a velocity-time graph", meaning: "The accumulated area gives the directed change in position.", conditions: "Use for velocity-time graphs.", unitsText: "m" },
    { standardFormula: "distance traveled = total area under a speed-time graph", meaning: "Total area gives how much ground is covered overall.", conditions: "Use when every area contribution is counted positively.", unitsText: "m" },
  ],
  M2_L1: [
    { standardFormula: "F_resultant = sum of forces", meaning: "The overall push is the vector sum of all forces acting on the object.", conditions: "Combine all forces before predicting motion.", unitsText: "N" },
  ],
  M2_L2: [
    { standardFormula: "F = ma", meaning: "Resultant force links mass and acceleration.", conditions: "Use the resultant force, not one isolated force.", unitsText: "N" },
  ],
  M2_L3: [
    { standardFormula: "p = mv", meaning: "Momentum combines mass and velocity.", conditions: "Keep the sign or direction from the velocity.", unitsText: "kg m/s" },
    { standardFormula: "sum of momentum before = sum of momentum after", meaning: "Total momentum is conserved in a closed system.", conditions: "Use only when the whole interacting system is treated as the boundary.", unitsText: "kg m/s" },
  ],
  M2_L4: [
    { standardFormula: "moment = force × perpendicular distance", meaning: "Turning effect depends on force size and perpendicular reach from the pivot.", conditions: "Use the perpendicular distance to the line of action.", unitsText: "N m" },
  ],
  M2_L5: [
    { standardFormula: "sum of clockwise moments = sum of anticlockwise moments", meaning: "Rotational equilibrium needs balanced turning effects.", conditions: "Use when the object is balanced and not rotating.", unitsText: "N m" },
    { standardFormula: "stable if the line of action of weight falls within the base", meaning: "Stability depends on where the weight line falls relative to the support area.", conditions: "Use when comparing tipping and balance.", unitsText: "" },
  ],
  M2_L6: [
    { standardFormula: "Fx = F cos(θ)", meaning: "The horizontal component is the part of the vector along the x-axis.", conditions: "Use when resolving a vector into perpendicular components.", unitsText: "N" },
    { standardFormula: "Fy = F sin(θ)", meaning: "The vertical component is the part of the vector along the y-axis.", conditions: "Use when resolving a vector into perpendicular components.", unitsText: "N" },
    { standardFormula: "resultant = sqrt(Fx^2 + Fy^2)", meaning: "Perpendicular components rebuild into one resultant vector geometrically.", conditions: "Use after all x-components and y-components are combined separately.", unitsText: "N" },
  ],
  M3_L1: [
    { standardFormula: "total input energy = useful output energy + wasted energy", meaning: "Energy accounting must balance useful gain and losses.", conditions: "Use when tracing an energy transfer or machine process.", unitsText: "J" },
    { standardFormula: "ΔE = energy transferred", meaning: "A transfer changes the energy stored in a system.", conditions: "Use when the store change is known or easier to track than the mechanism.", unitsText: "J" },
  ],
  M3_L2: [
    { standardFormula: "gravitational potential energy = mgh", meaning: "Energy stored by height depends on mass, gravitational field strength, and height.", conditions: "Use near Earth's surface or when g is supplied.", unitsText: "J" },
  ],
  M3_L3: [
    { standardFormula: "kinetic energy = 1/2 mv^2", meaning: "Energy stored in motion depends on mass and speed squared.", conditions: "Use for translational motion.", unitsText: "J" },
  ],
  M3_L4: [
    { standardFormula: "work done = force × distance", meaning: "Aligned force transfers energy when it acts through a distance.", conditions: "Use in the simple aligned-force case.", unitsText: "J" },
    { standardFormula: "work done = change in energy", meaning: "Work is another name for an energy transfer into or out of a store.", conditions: "Use when the store change is already known.", unitsText: "J" },
  ],
  M3_L5: [
    { standardFormula: "power = energy transferred / time", meaning: "Power measures how quickly energy is transferred.", conditions: "Use for the rate of working or transfer.", unitsText: "W" },
    { standardFormula: "efficiency = (useful output / total input) × 100%", meaning: "Efficiency measures the fraction of input that becomes useful output.", conditions: "Use when comparing useful energy or power with the total supplied.", unitsText: "%" },
  ],
  M3_L6: [
    { standardFormula: "total energy in = total useful energy out + total wasted energy", meaning: "Multi-stage energy missions still obey one overall energy ledger.", conditions: "Use when a problem has several linked energy stages.", unitsText: "J" },
    { standardFormula: "output of one stage = input of the next stage", meaning: "Linked energy problems are solved in sequence because one stage feeds the next.", conditions: "Use before choosing the next equation in a multi-step problem.", unitsText: "" },
  ],
  M4_L1: [
    { standardFormula: "p = F / A", meaning: "Pressure in solids is force spread over area.", conditions: "Use for patch load in solids.", unitsText: "Pa or N/m^2" },
  ],
  M4_L2: [
    { standardFormula: "A = F / p", meaning: "Required area can be found from force and a safe pressure limit.", conditions: "Use when designing a safe footprint or contact area.", unitsText: "m^2" },
    { standardFormula: "F = pA", meaning: "Force on a surface equals pressure times area.", conditions: "Use when pressure and contact area are known.", unitsText: "N" },
  ],
  M4_L3: [
    { standardFormula: "p = ρgh", meaning: "Liquid pressure depends on density, gravitational field strength, and depth.", conditions: "Use for pressure in a static liquid column.", unitsText: "Pa" },
  ],
  M4_L4: [
    { standardFormula: "p1 = p2", meaning: "Two points in the same resting liquid at the same depth have the same pressure.", conditions: "Use only when the liquid is the same and both points are at the same level.", unitsText: "Pa" },
    { standardFormula: "p = ρgh", meaning: "The equal-pressure result comes from the same rho, g, and h at matching depths.", conditions: "Use for points in a resting liquid.", unitsText: "Pa" },
  ],
  M4_L5: [
    { standardFormula: "F = pA", meaning: "Force due to pressure depends on local pressure and patch area.", conditions: "Use after the pressure at that point is known.", unitsText: "N" },
  ],
  M4_L6: [
    { standardFormula: "p_total = p_atm + ρgh", meaning: "Open-surface liquid pressure adds atmospheric pressure to the liquid contribution.", conditions: "Use for pressure below the surface of a liquid open to the air.", unitsText: "Pa", constants: "Use atmospheric pressure about 1.0 × 10^5 Pa at sea level unless the question gives a different value." },
  ],
  M5_L1: [
    { standardFormula: "state description = particle spacing + particle motion + particle attractions", meaning: "A particle-model state needs spacing, motion, and attraction together.", conditions: "Use when classifying the state of matter.", unitsText: "" },
    { standardFormula: "heating changes motion and spacing, not particle size", meaning: "Bulk changes belong to the crowd pattern rather than one particle growing bigger.", conditions: "Use in the simple particle model.", unitsText: "" },
  ],
  M5_L2: [
    { standardFormula: "solid = close particles + fixed positions + vibration", meaning: "A solid keeps particles close while they vibrate around fixed positions.", conditions: "Use when describing the solid state.", unitsText: "" },
    { standardFormula: "liquid = close particles + changing neighbors + flow", meaning: "A liquid stays close-packed but its particles can move past one another.", conditions: "Use when describing the liquid state.", unitsText: "" },
  ],
  M5_L3: [
    { standardFormula: "gas = wide spacing + random motion + collisions", meaning: "A gas has large gaps between particles and frequent random collisions.", conditions: "Use when describing the gas state.", unitsText: "" },
    { standardFormula: "Brownian motion = visible evidence of invisible particle collisions", meaning: "Brownian motion is caused by uneven hits from surrounding particles.", conditions: "Use when explaining particle evidence.", unitsText: "" },
  ],
  M5_L4: [
    { standardFormula: "temperature is proportional to average kinetic energy per particle", meaning: "Temperature answers an average-particle motion question, not a total-energy question.", conditions: "Use when comparing equal temperatures with different sample sizes.", unitsText: "" },
  ],
  M5_L5: [
    { standardFormula: "internal energy = total kinetic energy + total potential energy of particles", meaning: "Internal energy counts both motion energy and arrangement energy in the whole sample.", conditions: "Use for the whole system, not one particle.", unitsText: "J" },
  ],
  M5_L6: [
    { standardFormula: "increase in internal energy = energy transferred by heating", meaning: "Heating raises the sample's internal energy even when the temperature response is not large.", conditions: "Use when thermal energy enters the sample.", unitsText: "J" },
    { standardFormula: "during a state change, added energy can raise potential energy more than temperature", meaning: "State-change energy can mainly loosen links instead of sharply raising temperature.", conditions: "Use near melting or boiling.", unitsText: "" },
  ],
  M6_L1: [
    { standardFormula: "temperature change depends on energy transferred, mass, and material", meaning: "The same energy input does not force the same temperature rise in every sample.", conditions: "Use before choosing which thermal quantity is being compared.", unitsText: "" },
  ],
  M6_L2: [
    { standardFormula: "Q = mcΔT", meaning: "Energy for heating depends on mass, specific heat capacity, and temperature change.", conditions: "Use for a temperature-rise or temperature-drop stage with no state change.", unitsText: "J" },
  ],
  M6_L3: [
    { standardFormula: "Q = mL", meaning: "Latent-heat energy depends on mass and the latent heat of the material.", conditions: "Use only for a state-change stage.", unitsText: "J" },
  ],
  M6_L4: [
    { standardFormula: "better conduction -> faster energy transfer by direct contact", meaning: "Conduction rate depends on material and the contact route.", conditions: "Use when the transfer path is through matter by direct contact.", unitsText: "" },
  ],
  M6_L5: [
    { standardFormula: "warmer fluid -> lower density -> rise", meaning: "Heating a fluid can reduce density so it rises.", conditions: "Use for one part of a convection current.", unitsText: "" },
    { standardFormula: "cooler fluid -> higher density -> sink", meaning: "Cooler fluid moves in or sinks to complete the convection loop.", conditions: "Use for the returning part of a convection current.", unitsText: "" },
  ],
  M6_L6: [
    { standardFormula: "Q_total = mcΔT + mL", meaning: "A full thermal mission can include a warm-up stage and a state-change stage that must be added separately.", conditions: "Use when both a temperature change and a state change occur.", unitsText: "J" },
    { standardFormula: "radiation can cross a vacuum", meaning: "Thermal radiation does not need a material medium.", conditions: "Use when identifying the transfer route across a gap.", unitsText: "" },
  ],
  M7_L1: [
    { standardFormula: "wave speed = distance traveled by the front / time", meaning: "Wave speed belongs to front travel, not to one particle moving across the whole medium.", conditions: "Use when front distance and time are known.", unitsText: "m/s" },
  ],
  M7_L2: [
    { standardFormula: "transverse wave = local motion perpendicular to wave travel", meaning: "Wave type is defined by comparing local motion with propagation direction.", conditions: "Use when classifying wave type.", unitsText: "" },
    { standardFormula: "longitudinal wave = local motion parallel to wave travel", meaning: "Longitudinal motion stays along the same line as propagation.", conditions: "Use when classifying wave type.", unitsText: "" },
  ],
  M7_L3: [
    { standardFormula: "v = fλ", meaning: "Wave speed depends on frequency and wavelength together.", conditions: "Use when any two of speed, frequency, and wavelength are known.", unitsText: "m/s, Hz, m" },
  ],
  M7_L4: [
    { standardFormula: "angle of incidence = angle of reflection", meaning: "Reflection at a flat surface keeps equal angles to the normal.", conditions: "Measure both angles from the normal.", unitsText: "degrees" },
  ],
  M7_L5: [
    { standardFormula: "v = fλ", meaning: "Across a boundary the speed and wavelength can change together while the source keeps the frequency fixed.", conditions: "Use when comparing one medium with another.", unitsText: "m/s, Hz, m" },
    { standardFormula: "frequency stays constant across a boundary", meaning: "The source sets the frequency even when the medium changes.", conditions: "Use in refraction reasoning.", unitsText: "Hz" },
  ],
  M7_L6: [
    { standardFormula: "strongest diffraction happens when gap size is comparable to wavelength", meaning: "Wave spreading depends on comparing the opening size with the wavelength.", conditions: "Use when judging how much a wave will spread.", unitsText: "" },
  ],
  M8_L1: [
    { standardFormula: "angle of incidence = angle of reflection", meaning: "Mirror reflection keeps equal angles to the normal.", conditions: "Measure from the guide line or normal, not from the mirror surface.", unitsText: "degrees" },
    { standardFormula: "object distance = image distance", meaning: "A plane mirror puts the virtual image the same distance behind the mirror as the object is in front.", conditions: "Use for plane mirrors.", unitsText: "m" },
  ],
  M8_L2: [
    { standardFormula: "toward the normal -> slower medium", meaning: "A refracted ray bends toward the normal when light slows down.", conditions: "Use when comparing fast and slow media.", unitsText: "" },
    { standardFormula: "away from the normal -> faster medium", meaning: "A refracted ray bends away from the normal when light speeds up.", conditions: "Use when comparing fast and slow media.", unitsText: "" },
  ],
  M8_L3: [
    { standardFormula: "parallel ray through a converging lens -> through the far focus", meaning: "A key ray rule locates the real image for a converging lens.", conditions: "Use in the thin-lens ray model.", unitsText: "" },
    { standardFormula: "central ray -> approximately undeviated", meaning: "The center ray gives a second reliable construction line for image location.", conditions: "Use in the thin-lens ray model.", unitsText: "" },
  ],
  M8_L4: [
    { standardFormula: "parallel ray through a diverging lens -> appears to come from the near focus", meaning: "A diverging lens spreads real rays but their backward extensions locate the virtual image.", conditions: "Use in the thin-lens ray model.", unitsText: "" },
    { standardFormula: "virtual image = backward extensions meet, not real rays", meaning: "The image location is apparent rather than a true crossing of real light rays.", conditions: "Use when classifying the image formed by a diverging lens.", unitsText: "" },
  ],
  M8_L5: [
    { standardFormula: "critical angle = incident angle in the denser medium that gives a 90 degree refracted ray", meaning: "The critical angle is the last possible escape angle.", conditions: "Use only when light travels from a denser medium to a less dense medium.", unitsText: "degrees" },
    { standardFormula: "total internal reflection happens for angle > critical angle", meaning: "Above the critical angle there is no refracted escape ray.", conditions: "Use only when light is leaving the denser medium.", unitsText: "" },
  ],
  M8_L6: [
    { standardFormula: "true image = actual ray intersection", meaning: "A real image comes from real rays meeting.", conditions: "Use when checking whether the image can form on a screen.", unitsText: "" },
    { standardFormula: "virtual image = apparent intersection of backward extensions", meaning: "A virtual image comes from extension lines rather than real crossings.", conditions: "Use when real rays do not actually meet at the image point.", unitsText: "" },
  ],
  M9_L1: [
    { standardFormula: "a steady current needs a complete circuit", meaning: "Charge carriers need one unbroken conducting path for sustained flow.", conditions: "Use when explaining why current stops or continues in a simple loop.", unitsText: "" },
    { standardFormula: "charge is conserved around the circuit", meaning: "Charge carriers circulate through the loop rather than being used up by a component.", conditions: "Use when separating charge flow from energy transfer.", unitsText: "C" },
  ],
  M9_L2: [
    { standardFormula: "I = Q / t", meaning: "Current is charge flow rate.", conditions: "Use when the charge passing a point and the time taken are known.", unitsText: "A, C, s" },
    { standardFormula: "Q = It", meaning: "Charge passed depends on current and time.", conditions: "Use when the current is steady over the stated interval.", unitsText: "C" },
  ],
  M9_L3: [
    { standardFormula: "v = fλ", meaning: "Sound speed, frequency, and wavelength are linked by the wave equation.", conditions: "Use when any two sound-wave quantities are known.", unitsText: "m/s, Hz, m" },
  ],
  M9_L4: [
    { standardFormula: "audible range is about 20 Hz to 20 kHz", meaning: "Most human hearing lies between the lower hearing limit and the ultrasound boundary.", conditions: "Use when classifying audible sound versus ultrasound.", unitsText: "Hz" },
    { standardFormula: "ultrasound > 20 kHz", meaning: "Ultrasound is still sound but at a frequency above the usual human hearing range.", conditions: "Use when classifying high-frequency sound.", unitsText: "Hz" },
  ],
  M9_L5: [
    { standardFormula: "depth = v t / 2", meaning: "Pulse-echo depth uses sound speed and half the round-trip distance.", conditions: "Use when the measured time is the echo return time.", unitsText: "m", constants: "Use the sound speed for the medium given in the question, or about 1500 m/s for soft tissue in typical ultrasound scans." },
  ],
  M9_L6: [
    { standardFormula: "Doppler shift = returned frequency - transmitted frequency", meaning: "Comparing returned and transmitted frequency reveals motion toward or away from the probe.", conditions: "Use when frequency shift is measured in Doppler ultrasound.", unitsText: "Hz" },
    { standardFormula: "toward probe -> higher returned frequency; away -> lower returned frequency", meaning: "The sign of the shift is the first clue to flow direction.", conditions: "Use when interpreting a Doppler trace.", unitsText: "" },
  ],
  M10_L1: [
    { standardFormula: "field direction = direction a north pole would point", meaning: "Field lines show the direction of the magnetic field at each point.", conditions: "Use when reading field maps around magnets and wires.", unitsText: "" },
    { standardFormula: "closer field lines -> stronger magnetic field", meaning: "Field-line density is the school-model clue to relative field strength.", conditions: "Use when comparing stronger and weaker regions of a field map.", unitsText: "" },
  ],
  M10_L2: [
    { standardFormula: "electromagnet strength is proportional to current x turns", meaning: "For the same coil geometry, increasing current or turn count strengthens the solenoid field.", conditions: "Use qualitatively when comparing simple school electromagnets built from the same basic setup.", unitsText: "" },
    { standardFormula: "a soft-iron core strengthens the electromagnet", meaning: "The core concentrates the magnetic field of the solenoid.", conditions: "Use for a temporary electromagnet rather than a permanent magnet.", unitsText: "" },
  ],
  M10_L3: [
    { standardFormula: "F = B I L sin(theta)", meaning: "The motor-effect force on a straight current-carrying conductor depends on field strength, current, active length, and crossing angle.", conditions: "Use for a straight conductor in a uniform magnetic field, with theta measured between the current direction and the field.", unitsText: "N" },
    { standardFormula: "force direction is perpendicular to both field and current", meaning: "The motor effect gives a sideways force rather than a push along the field lines.", conditions: "Use with the left-hand rule or equivalent direction reasoning after the force magnitude has been found.", unitsText: "" },
  ],
  M10_L4: [
    { standardFormula: "torque = B I N A sin(theta)", meaning: "The turning effect on a motor coil depends on field strength, current, turn count, coil area, and coil angle.", conditions: "Use for a current-carrying coil in a magnetic field, with theta taken between the field and the normal to the coil.", unitsText: "N m" },
    { standardFormula: "maximum torque = B I N A", meaning: "The motor gives its largest turning effect when the sin(theta) factor is 1.", conditions: "Use at the position of maximum turning effect.", unitsText: "N m" },
  ],
  M10_L5: [
    { standardFormula: "emf = N delta(Phi) / delta(t)", meaning: "The magnitude of induced emf depends on the rate of change of magnetic flux linkage.", conditions: "Use for induction and generator problems when the flux change and time interval are known.", unitsText: "V" },
    { standardFormula: "faster flux change -> larger induced emf", meaning: "A changing magnetic field link is what produces induction.", conditions: "Use when comparing stronger and weaker induction cases qualitatively.", unitsText: "" },
  ],
  M10_L6: [
    { standardFormula: "Vp / Vs = Np / Ns", meaning: "In the school transformer model, the voltage ratio follows the turns ratio.", conditions: "Use for an ideal transformer with changing current in the primary.", unitsText: "V" },
    { standardFormula: "Vp Ip = Vs Is", meaning: "In the ideal transformer model, the electrical power into the primary equals the electrical power out of the secondary.", conditions: "Use for ideal-transformer power-transfer questions.", unitsText: "W" },
    { standardFormula: "Ip / Is = Ns / Np", meaning: "For an ideal transformer, current ratio is inverse to the turns ratio.", conditions: "Use when the transformer is treated as ideal and the turns ratio is known.", unitsText: "A" },
    { standardFormula: "P = VI", meaning: "Power in transmission depends on voltage and current together.", conditions: "Use when comparing high-voltage low-current transmission with lower-voltage higher-current transmission.", unitsText: "W" },
    { standardFormula: "power loss in lines = I^2 R", meaning: "Cable heating losses rise strongly with transmission current.", conditions: "Use when comparing why higher transmission voltage lowers resistive losses for the same delivered power.", unitsText: "W" },
  ],
  M11_L1: [
    { standardFormula: "atomic number Z = number of protons", meaning: "Proton count fixes the element identity.", conditions: "Use when identifying the element.", unitsText: "" },
    { standardFormula: "mass number A = number of protons + number of neutrons", meaning: "Mass number counts the nucleons in the nucleus.", conditions: "Use when comparing nuclei or ions of the same element.", unitsText: "" },
    { standardFormula: "charge = number of protons - number of electrons", meaning: "Ion charge depends on the imbalance between protons and electrons.", conditions: "Use when finding the charge state of an atom or ion.", unitsText: "" },
  ],
  M11_L2: [
    { standardFormula: "number of neutrons = mass number - atomic number", meaning: "Neutron count is found by subtracting proton number from mass number.", conditions: "Use when comparing isotopes.", unitsText: "" },
    { standardFormula: "same proton number -> same element", meaning: "Element identity is fixed by proton number even when neutron number changes.", conditions: "Use when deciding whether two nuclei are isotopes or different elements.", unitsText: "" },
  ],
  M11_L3: [
    { standardFormula: "alpha decay: A decreases by 4 and Z decreases by 2", meaning: "Alpha emission removes two protons and two neutrons from the nucleus.", conditions: "Use for alpha decay.", unitsText: "" },
    { standardFormula: "beta-minus decay: A unchanged and Z increases by 1", meaning: "Beta-minus decay changes a neutron into a proton so atomic number rises.", conditions: "Use for beta-minus decay.", unitsText: "" },
    { standardFormula: "gamma emission: A unchanged and Z unchanged", meaning: "Gamma emission changes nuclear energy state without changing nucleon counts.", conditions: "Use for gamma emission.", unitsText: "" },
  ],
  M11_L4: [
    { standardFormula: "N = N0 x (1/2)^(t / half-life)", meaning: "Equal half-life intervals halve the number that remains.", conditions: "Use for a large-sample radioactive decay calculation.", unitsText: "" },
    { standardFormula: "remaining fraction halves each half-life", meaning: "Half-life is a multiplicative halving rule, not repeated subtraction of a fixed amount.", conditions: "Use when reasoning without a full calculation.", unitsText: "" },
  ],
  M11_L5: [
    { standardFormula: "corrected count rate = measured count rate - background count rate", meaning: "Background radiation must be subtracted before the source count rate is interpreted.", conditions: "Use when detector readings include normal environmental background.", unitsText: "counts/s" },
  ],
  M11_L6: [
    { standardFormula: "mass number before = mass number after", meaning: "Nuclear equations must conserve mass number.", conditions: "Use when balancing a nuclear equation.", unitsText: "" },
    { standardFormula: "atomic number before = atomic number after", meaning: "Nuclear equations must also conserve atomic number.", conditions: "Use when balancing a nuclear equation.", unitsText: "" },
  ],
  M12_L1: [
    { standardFormula: "field direction = direction a north pole would point", meaning: "Field lines show the direction of the magnetic field at each point.", conditions: "Use when reading field maps around magnets and wires.", unitsText: "" },
    { standardFormula: "closer field lines -> stronger magnetic field", meaning: "Field-line density is the school-model clue to relative field strength.", conditions: "Use when comparing stronger and weaker regions of a field map.", unitsText: "" },
  ],
  M12_L2: [
    { standardFormula: "electromagnet strength increases with current and number of turns", meaning: "A coil's field gets stronger when the current or turn count increases.", conditions: "Use when comparing electromagnets built from the same basic setup.", unitsText: "" },
    { standardFormula: "a soft-iron core strengthens the electromagnet", meaning: "The core concentrates the magnetic field of the solenoid.", conditions: "Use for a temporary electromagnet rather than a permanent magnet.", unitsText: "" },
  ],
  M12_L3: [
    { standardFormula: "magnetic force on a current-carrying conductor is perpendicular to both field and current", meaning: "The motor effect gives a sideways force rather than a push along the field lines.", conditions: "Use when a conductor carries current across a magnetic field.", unitsText: "" },
  ],
  M12_L4: [
    { standardFormula: "opposite magnetic forces on opposite sides of a coil create torque", meaning: "A motor turns because the magnetic forces form a couple on the coil.", conditions: "Use when explaining why a motor rotates rather than translating sideways.", unitsText: "" },
  ],
  M12_L5: [
    { standardFormula: "induced emf depends on the rate of change of magnetic flux", meaning: "A changing magnetic field link is what produces induction.", conditions: "Use when the magnet, coil, or orientation changes.", unitsText: "" },
  ],
  M12_L6: [
    { standardFormula: "Vp / Vs = Np / Ns", meaning: "In the school transformer model, the voltage ratio follows the turns ratio.", conditions: "Use for an ideal transformer with changing current in the primary.", unitsText: "V" },
    { standardFormula: "P = VI", meaning: "Power in transmission depends on voltage and current together.", conditions: "Use when comparing high-voltage low-current transmission with lower-voltage higher-current transmission.", unitsText: "W" },
  ],
  M13_L1: [
    { standardFormula: "atomic number Z = number of protons", meaning: "Proton count fixes the element identity.", conditions: "Use when identifying the element.", unitsText: "" },
    { standardFormula: "mass number A = number of protons + number of neutrons", meaning: "Mass number counts the nucleons in the nucleus.", conditions: "Use when comparing nuclei or isotopes.", unitsText: "" },
    { standardFormula: "charge = number of protons - number of electrons", meaning: "Ion charge depends on the imbalance between protons and electrons.", conditions: "Use when finding the charge state of an atom or ion.", unitsText: "" },
  ],
  M13_L2: [
    { standardFormula: "number of neutrons = mass number - atomic number", meaning: "Neutron count is found by subtracting proton number from mass number.", conditions: "Use when comparing isotopes.", unitsText: "" },
  ],
  M13_L3: [
    { standardFormula: "alpha decay: A decreases by 4 and Z decreases by 2", meaning: "Alpha emission removes two protons and two neutrons from the nucleus.", conditions: "Use for alpha decay.", unitsText: "" },
    { standardFormula: "beta-minus decay: A unchanged and Z increases by 1", meaning: "Beta-minus decay changes a neutron into a proton so atomic number rises.", conditions: "Use for beta-minus decay.", unitsText: "" },
    { standardFormula: "gamma emission: A unchanged and Z unchanged", meaning: "Gamma emission changes nuclear energy state without changing nucleon counts.", conditions: "Use for gamma emission.", unitsText: "" },
  ],
  M13_L4: [
    { standardFormula: "N = N₀ × (1/2)^(t / half-life)", meaning: "Equal half-life intervals halve the number that remains.", conditions: "Use for a large-sample radioactive decay calculation.", unitsText: "" },
    { standardFormula: "remaining fraction halves each half-life", meaning: "Half-life is a multiplicative halving rule, not repeated subtraction of a fixed amount.", conditions: "Use when reasoning without a full calculation.", unitsText: "" },
  ],
  M13_L5: [
    { standardFormula: "corrected count rate = measured count rate - background count rate", meaning: "Background radiation must be subtracted before the source count rate is interpreted.", conditions: "Use when detector readings include normal environmental background.", unitsText: "counts/s" },
  ],
  M13_L6: [
    { standardFormula: "mass number before = mass number after", meaning: "Nuclear equations must conserve mass number.", conditions: "Use when balancing a nuclear equation.", unitsText: "" },
    { standardFormula: "atomic number before = atomic number after", meaning: "Nuclear equations must also conserve atomic number.", conditions: "Use when balancing a nuclear equation.", unitsText: "" },
  ],
  M14_L1: [
    { standardFormula: "star = self-luminous body powered by fusion", meaning: "A star makes its own light because fusion in the core is the energy source.", conditions: "Use when classifying stars versus planets.", unitsText: "" },
    { standardFormula: "planet = body seen mainly by reflected starlight", meaning: "A planet can look bright without producing its own light.", conditions: "Use when comparing luminous and reflective bodies.", unitsText: "" },
  ],
  M14_L2: [
    { standardFormula: "stellar mass controls the later life cycle and remnant", meaning: "Low-mass and high-mass stars share early stages but branch later because mass changes the path.", conditions: "Use when comparing white-dwarf endings with supernova routes.", unitsText: "" },
  ],
  M14_L3: [
    { standardFormula: "galaxy = gravitationally bound system of many stars, gas, and dust", meaning: "Gravity is the reason a galaxy counts as one physical system.", conditions: "Use when separating a star, a Solar System, a galaxy, and the universe.", unitsText: "" },
  ],
  M14_L4: [
    { standardFormula: "1 light-year = c × 1 year", meaning: "A light-year is the distance light travels in one year.", conditions: "Use when converting the meaning of a light-year into a distance idea.", unitsText: "m or light-years" },
  ],
  M14_L5: [
    { standardFormula: "z = (λ_observed - λ_emitted) / λ_emitted", meaning: "Redshift compares the wavelength change with the emitted wavelength.", conditions: "Use when quantifying cosmological redshift.", unitsText: "" },
  ],
  M14_L6: [
    { standardFormula: "greater galaxy distance -> greater cosmological redshift", meaning: "The distance-redshift trend is evidence for cosmic expansion.", conditions: "Use when linking observation to the Big Bang model.", unitsText: "" },
    { standardFormula: "Big Bang model = expanding-space model from an early hot dense state", meaning: "The model describes expansion of space rather than an ordinary explosion from one point.", conditions: "Use when explaining why the Big Bang is an expansion story.", unitsText: "" },
  ],
};

const M9_FORMULA_OVERRIDES: Record<string, FormulaFallbackEntry[]> = {
  M9_L3: [
    { standardFormula: "V = E / Q", meaning: "Potential difference is energy transferred per unit charge.", conditions: "Use when the energy gained or lost by each coulomb is being compared.", unitsText: "V, J/C" },
    { standardFormula: "E = VQ", meaning: "Total electrical energy transferred depends on the voltage and the charge moved.", conditions: "Use when the potential difference and the charge are known.", unitsText: "J" },
  ],
  M9_L4: [
    { standardFormula: "R is proportional to length / area", meaning: "For the same material, longer wires have greater resistance and wider wires have lower resistance.", conditions: "Use when comparing route geometry rather than battery strength.", unitsText: "" },
    { standardFormula: "resistance depends on material and geometry", meaning: "Resistance belongs to the route or component, not to the source.", conditions: "Use when explaining why the same supply can drive different currents in different wires.", unitsText: "" },
  ],
  M9_L5: [
    { standardFormula: "V = IR", meaning: "For an ohmic conductor under fixed conditions, voltage, current, and resistance are linked by Ohm's law.", conditions: "Use for ohmic components when temperature and other relevant conditions are fixed.", unitsText: "V, A, ohm" },
    { standardFormula: "straight I-V graph through the origin -> constant resistance", meaning: "A straight origin-passing I-V characteristic is the school-level clue for ohmic behaviour over the measured range.", conditions: "Use when interpreting I-V data or graph shape.", unitsText: "" },
  ],
  M9_L6: [
    { standardFormula: "R_total = R1 + R2 + ...", meaning: "Series resistances add because there is one common current path through the whole chain.", conditions: "Use for valid series sections of a circuit.", unitsText: "ohm" },
    { standardFormula: "1 / R_total = 1 / R1 + 1 / R2 + ...", meaning: "Parallel branches reduce equivalent resistance because they provide additional current routes.", conditions: "Use for valid parallel sections between the same two junctions.", unitsText: "1/ohm" },
    { standardFormula: "I_total = I1 + I2 + ...", meaning: "At a junction, the source current equals the sum of the branch currents.", conditions: "Use when current splits or recombines in a parallel section.", unitsText: "A" },
    { standardFormula: "voltage is the same across parallel branches", meaning: "Each branch connected between the same two junctions has the same potential difference.", conditions: "Use for parallel sections and mixed networks after the branch endpoints are identified.", unitsText: "V" },
  ],
};

export function coreFormulaFallbacksForLesson(code: string): FormulaFallbackEntry[] {
  return M9_FORMULA_OVERRIDES[code] || CORE_FORMULA_FALLBACKS[code] || [];
}
