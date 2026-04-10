"use client";

import type { FormulaFallbackEntry } from "./coreFormulaFallbacks";

const SUPPLEMENTAL_EQUATION_FALLBACKS: Record<string, FormulaFallbackEntry[]> = {
  M8_L2: [
    {
      standardFormula: "n1 sin(θ1) = n2 sin(θ2)",
      meaning: "Snell's law links the angles and refractive indices across a boundary.",
      conditions: "Use for refraction at a boundary between two media.",
      unitsText: "dimensionless refractive index, degrees or radians",
    },
  ],
  M8_L3: [
    {
      standardFormula: "1/f = 1/u + 1/v",
      meaning: "The thin-lens relation links focal length, object distance, and image distance.",
      conditions: "Use for the thin-lens model with the lesson's sign convention.",
      unitsText: "m",
    },
    {
      standardFormula: "magnification = image height / object height = image distance / object distance",
      meaning: "Magnification compares image size and object size, and in the thin-lens model it also matches the distance ratio.",
      conditions: "Use after the image and object distances or heights are identified consistently.",
      unitsText: "no unit",
    },
  ],
  M8_L4: [
    {
      standardFormula: "1/f = 1/u + 1/v",
      meaning: "The thin-lens relation still organizes object distance, image distance, and focal length for diverging-lens work.",
      conditions: "Use with the lesson's sign convention for virtual images.",
      unitsText: "m",
    },
    {
      standardFormula: "magnification = image height / object height",
      meaning: "Magnification compares image size with object size, even when the image is virtual.",
      conditions: "Use when the image is located from a ray diagram or the thin-lens relation.",
      unitsText: "no unit",
    },
  ],
  M8_L5: [
    {
      standardFormula: "sin(c) = 1 / n",
      meaning: "For light leaving a denser medium into air, the critical angle is set by the refractive index of the denser medium.",
      conditions: "Use when light travels from a denser medium into air or a much less optically dense medium.",
      unitsText: "degrees or radians",
    },
  ],
  M8_L6: [
    {
      standardFormula: "magnification = image height / object height = image distance / object distance",
      meaning: "Magnification compares image size and object size, and in thin-lens work it also matches the distance ratio.",
      conditions: "Use when comparing image size and object size in a lens system.",
      unitsText: "no unit",
    },
  ],
  M12_L3: [
    {
      standardFormula: "F = BIL sin(θ)",
      meaning: "The magnetic force on a current-carrying conductor depends on field strength, current, conductor length, and angle.",
      conditions: "Use when a straight conductor carries current in a magnetic field.",
      unitsText: "N, T, A, m",
    },
  ],
  M12_L4: [
    {
      standardFormula: "turning moment = B I N A",
      meaning: "The turning effect on a current-carrying coil depends on the field, current, turns, and coil area.",
      conditions: "Use for a motor coil in the position of maximum turning effect.",
      unitsText: "N m",
    },
  ],
  M12_L5: [
    {
      standardFormula: "induced emf = -N delta(Phi) / delta(t)",
      meaning: "Faraday's law links induced emf to the rate of change of magnetic flux linkage.",
      conditions: "Use when the magnetic flux through the coil changes.",
      unitsText: "V, Wb, s",
    },
  ],
  M13_L1: [
    {
      standardFormula: "A = Z + N",
      meaning: "Mass number equals proton number plus neutron number.",
      conditions: "Use when comparing atomic number, neutron number, and nucleon number.",
      unitsText: "count",
    },
    {
      standardFormula: "charge in e units = protons - electrons",
      meaning: "The ion charge comes from the imbalance between proton count and electron count.",
      conditions: "Use when finding the charge state of an ion.",
      unitsText: "e",
    },
  ],
  M13_L2: [
    {
      standardFormula: "N = A - Z",
      meaning: "Neutron number equals mass number minus atomic number.",
      conditions: "Use when identifying isotopes or comparing nuclei.",
      unitsText: "count",
    },
  ],
  M14_L6: [
    {
      standardFormula: "v = H₀d",
      meaning: "Hubble's law links recession speed to distance for distant galaxies.",
      conditions: "Use for large-scale cosmological recession in the simple Hubble-law model.",
      unitsText: "m/s or km/s",
      constants: "Use H₀ in the form given by the question, often about 70 km s^-1 Mpc^-1.",
    },
  ],
  A1_L1: [
    {
      standardFormula: "q = n e",
      meaning: "Particle charge is an integer multiple of the elementary charge.",
      conditions: "Use when turning a charge tag into the physical charge of a particle.",
      unitsText: "C or e",
      constants: "Use e = 1.60 × 10^-19 C.",
    },
  ],
  A1_L3: [
    {
      standardFormula: "E = hf",
      meaning: "Photon energy depends on Planck's constant and frequency.",
      conditions: "Use for photon-energy reasoning in pair production or annihilation chains.",
      unitsText: "J or eV",
    },
    {
      standardFormula: "E_gamma >= 2 m c^2",
      meaning: "A photon needs at least the combined rest energy of the created pair.",
      conditions: "Use for threshold reasoning in pair production to one particle-antiparticle pair.",
      unitsText: "J or eV",
    },
  ],
  A1_L4: [
    {
      standardFormula: "F = k q1 q2 / r^2",
      meaning: "Electromagnetic interaction strength between point charges follows the inverse-square law.",
      conditions: "Use when the interaction is mediated by electric charge in the point-charge model.",
      unitsText: "N",
      constants: "Use Coulomb's constant k = 8.99 × 10^9 N m^2 C^-2 in vacuum.",
    },
  ],
  A1_L5: [
    {
      standardFormula: "sum(charge)_before = sum(charge)_after",
      meaning: "Charge conservation requires the total charge to balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "e or C",
    },
    {
      standardFormula: "sum(baryon number)_before = sum(baryon number)_after",
      meaning: "Baryon number conservation must balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "no unit",
    },
    {
      standardFormula: "sum(lepton number)_before = sum(lepton number)_after",
      meaning: "Lepton number conservation must balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "no unit",
    },
  ],
  A1_L6: [
    {
      standardFormula: "sum(charge)_before = sum(charge)_after",
      meaning: "Particle-event analysis starts by checking that total charge balances.",
      conditions: "Use when screening a proposed decay, collision, or reaction channel.",
      unitsText: "e or C",
    },
    {
      standardFormula: "sum(momentum)_before = sum(momentum)_after",
      meaning: "Momentum conservation helps distinguish allowed event stories from impossible ones.",
      conditions: "Use when the before-and-after particle event includes moving particles.",
      unitsText: "kg m/s",
    },
    {
      standardFormula: "sum(energy)_before = sum(energy)_after",
      meaning: "Total energy must balance across the full particle event.",
      conditions: "Use when interpreting products, thresholds, and missing-energy clues.",
      unitsText: "J or eV",
    },
  ],
  A2_L2: [
    {
      standardFormula: "ΔE = hf = hc / λ",
      meaning: "A spectral line comes from an energy gap matched by the emitted or absorbed photon.",
      conditions: "Use for emission or absorption lines tied to atomic energy-level transitions.",
      unitsText: "J, Hz, m",
    },
  ],
  A2_L4: [
    {
      standardFormula: "ΔE = hf",
      meaning: "Excitation needs a photon energy that matches the allowed energy gap.",
      conditions: "Use when a photon excites an electron between allowed levels.",
      unitsText: "J, Hz",
    },
    {
      standardFormula: "hf >= ionisation energy",
      meaning: "Ionisation requires photon energy at least equal to the ionisation threshold.",
      conditions: "Use when deciding whether an incident photon can ionise the atom.",
      unitsText: "J or eV",
    },
  ],
  A2_L6: [
    {
      standardFormula: "ΔE = hf",
      meaning: "Photon packets reveal quantized atomic gaps through the energy they carry.",
      conditions: "Use when tying spectral evidence back to atomic energy levels.",
      unitsText: "J, Hz",
    },
    {
      standardFormula: "λ = h / p",
      meaning: "de Broglie wavelength links matter momentum to wave behaviour.",
      conditions: "Use when connecting particle momentum to wave-like evidence.",
      unitsText: "m, kg m/s",
    },
  ],
  A5_L1: [
    {
      standardFormula: "F = -k x",
      meaning: "For a Hooke's-law oscillator, the restoring force is proportional to displacement and directed back toward equilibrium.",
      conditions: "Use for spring-based simple harmonic motion with the displacement measured from equilibrium.",
      unitsText: "N, N/m, m",
    },
  ],
  A5_L4: [
    {
      standardFormula: "E_total = E_k + E_p",
      meaning: "The total energy is the sum of the kinetic and potential energy in the oscillator.",
      conditions: "Use for ideal SHM when damping is negligible.",
      unitsText: "J",
    },
    {
      standardFormula: "E_p = 1/2 k x^2",
      meaning: "Elastic potential energy depends on spring stiffness and displacement from equilibrium.",
      conditions: "Use for spring-based SHM.",
      unitsText: "J",
    },
  ],
  A5_L5: [
    {
      standardFormula: "f_drive approx= f_natural at resonance",
      meaning: "The largest steady response appears when the driving frequency is close to the natural frequency.",
      conditions: "Use for forced oscillation and resonance reasoning.",
      unitsText: "Hz",
    },
  ],
  A5_L6: [
    {
      standardFormula: "F_d = -b v",
      meaning: "In the simple damping model, the resistive force opposes the motion and is proportional to speed.",
      conditions: "Use for light linear damping in an oscillating system.",
      unitsText: "N, kg/s, m/s",
    },
    {
      standardFormula: "A = A0 e^(-b t / 2m)",
      meaning: "For an underdamped oscillator, amplitude falls exponentially with time.",
      conditions: "Use for linear damping when the oscillation still repeats while shrinking.",
      unitsText: "m",
    },
  ],
  A6_L1: [
    {
      standardFormula: "average kinetic energy = 3/2 k T",
      meaning: "For an ideal gas, average particle kinetic energy is proportional to absolute temperature.",
      conditions: "Use for ideal-gas particle-model reasoning with temperature measured in kelvin.",
      unitsText: "J, K",
    },
    {
      standardFormula: "U = 3/2 N k T",
      meaning: "For an ideal gas, the total internal energy depends on both the number of particles and the absolute temperature.",
      conditions: "Use when comparing whole-sample internal energy for ideal-gas samples with different amounts of gas or different temperatures.",
      unitsText: "J, K",
    },
  ],
  A6_L2: [
    {
      standardFormula: "Q = m c Delta T",
      meaning: "Heating energy depends on the sample mass, the material specific heat capacity, and the temperature change together.",
      conditions: "Use for heating or cooling stages where the temperature changes but the state does not.",
      unitsText: "J, kg, J/(kg K), K",
    },
  ],
  A6_L3: [
    {
      standardFormula: "Q = m L",
      meaning: "Latent heat is the energy needed per kilogram for a change of state at constant temperature.",
      conditions: "Use for melting, boiling, freezing, or condensing stages where the temperature stays constant during the state change.",
      unitsText: "J, kg, J/kg",
    },
  ],
  A6_L4: [
    {
      standardFormula: "p V = n R T",
      meaning: "The ideal-gas law links pressure, volume, amount of gas, and absolute temperature in one state relation.",
      conditions: "Use for ideal-gas state calculations with temperature measured in kelvin and SI units for pressure and volume.",
      unitsText: "Pa, m^3, mol, K",
    },
  ],
  A6_L5: [
    {
      standardFormula: "p1 V1 = p2 V2",
      meaning: "For a fixed amount of gas at constant temperature, pressure and volume vary inversely.",
      conditions: "Use for isothermal processes.",
      unitsText: "Pa, m^3",
    },
    {
      standardFormula: "V1 / T1 = V2 / T2",
      meaning: "For a fixed amount of gas at constant pressure, volume is proportional to absolute temperature.",
      conditions: "Use for isobaric processes with temperature in kelvin.",
      unitsText: "m^3, K",
    },
    {
      standardFormula: "p1 / T1 = p2 / T2",
      meaning: "For a fixed amount of gas at constant volume, pressure is proportional to absolute temperature.",
      conditions: "Use for isochoric processes with temperature in kelvin.",
      unitsText: "Pa, K",
    },
  ],
  A6_L6: [
    {
      standardFormula: "p = 1/3 rho c_rms^2",
      meaning: "Gas pressure can be linked to particle motion through the gas density and the rms particle speed.",
      conditions: "Use for kinetic-theory calculations that connect macroscopic pressure to microscopic motion.",
      unitsText: "Pa, kg/m^3, m/s",
    },
    {
      standardFormula: "average kinetic energy = 3/2 k T",
      meaning: "Higher absolute temperature means greater average kinetic energy per gas particle.",
      conditions: "Use when linking temperature changes to particle-speed changes in kinetic-theory reasoning.",
      unitsText: "J, K",
    },
  ],
  A7_L1: [
    {
      standardFormula: "V = epsilon - I r",
      meaning: "Terminal p.d. equals emf minus the internal voltage drop inside the source.",
      conditions: "Use for loaded sources when current flows through internal resistance.",
      unitsText: "V, A, ohm",
    },
    {
      standardFormula: "P_internal = I^2 r",
      meaning: "Internal resistance dissipates power inside the source when current flows.",
      conditions: "Use when finding heating or lost power inside a non-ideal source.",
      unitsText: "W",
    },
  ],
  A7_L2: [
    {
      standardFormula: "sum I_in = sum I_out",
      meaning: "Current is conserved at a junction.",
      conditions: "Use for branch-current bookkeeping at nodes.",
      unitsText: "A",
    },
    {
      standardFormula: "sum V_rises = sum V_drops",
      meaning: "Potential changes balance around a closed loop.",
      conditions: "Use for Kirchhoff loop equations.",
      unitsText: "V",
    },
  ],
  A7_L3: [
    {
      standardFormula: "V_out = V_supply x R_lower / (R_upper + R_lower)",
      meaning: "A potential divider output is a fraction of the supply set by the resistance ratio.",
      conditions: "Use for unloaded two-resistor potential dividers.",
      unitsText: "V, ohm",
    },
  ],
  A7_L4: [
    {
      standardFormula: "Q = C V",
      meaning: "Capacitance links stored charge to potential difference.",
      conditions: "Use for capacitor charge-storage calculations.",
      unitsText: "C, F, V",
    },
  ],
  A7_L5: [
    {
      standardFormula: "tau = R C",
      meaning: "The RC time constant sets the timescale for charging and discharging.",
      conditions: "Use for RC response timing.",
      unitsText: "s, ohm, F",
    },
    {
      standardFormula: "V_C = V_supply (1 - e^(-t / R C))",
      meaning: "Charging capacitor p.d. rises exponentially toward the supply.",
      conditions: "Use for capacitor charging through a resistor.",
      unitsText: "V, s",
    },
    {
      standardFormula: "V_C = V_0 e^(-t / R C)",
      meaning: "Discharging capacitor p.d. falls exponentially with time.",
      conditions: "Use for capacitor discharge through a resistor.",
      unitsText: "V, s",
    },
  ],
  A7_L6: [
    {
      standardFormula: "E = 1/2 C V^2",
      meaning: "Capacitor energy depends on both capacitance and potential difference.",
      conditions: "Use for energy stored in a charged capacitor.",
      unitsText: "J, F, V",
    },
    {
      standardFormula: "C proportional to epsilon_r A / d",
      meaning: "Capacitance increases with dielectric response and plate area, and decreases with plate separation.",
      conditions: "Use when comparing how geometry or dielectric insertion changes capacitance.",
      unitsText: "F",
    },
  ],
  A8_L1: [
    {
      standardFormula: "E = F / q",
      meaning: "Electric field strength is the force per unit positive charge at a location.",
      conditions: "Use when inferring the field from the force on a known test charge.",
      unitsText: "N/C, N, C",
    },
    {
      standardFormula: "F = q E",
      meaning: "A charge placed in an electric field feels a force set by both its charge and the local field.",
      conditions: "Use when finding the electric force on a charge in a known field.",
      unitsText: "N, C, N/C",
    },
  ],
  A8_L2: [
    {
      standardFormula: "delta(E_p) = q delta(V)",
      meaning: "A change in electric potential corresponds to a change in electric potential energy for a charge.",
      conditions: "Use when linking potential difference to energy transfer.",
      unitsText: "J, C, V",
    },
    {
      standardFormula: "V = W / Q",
      meaning: "Potential difference is work done per unit charge.",
      conditions: "Use when reasoning about equipotentials, energy per charge, or work between points.",
      unitsText: "V, J, C",
    },
  ],
  A8_L3: [
    {
      standardFormula: "E = V / d",
      meaning: "Uniform electric field strength between parallel plates is the potential gradient across the gap.",
      conditions: "Use for parallel-plate uniform fields.",
      unitsText: "N/C, V, m",
    },
    {
      standardFormula: "F = q E",
      meaning: "A charge in a uniform electric field feels a constant electric force.",
      conditions: "Use when connecting field strength to charged-particle motion between plates.",
      unitsText: "N, C, N/C",
    },
    {
      standardFormula: "a = F / m",
      meaning: "A constant electric force produces a constant acceleration on the particle.",
      conditions: "Use after finding the electric force on a particle of known mass.",
      unitsText: "m/s^2, N, kg",
    },
  ],
  A8_L4: [
    {
      standardFormula: "F = k Q q / r^2",
      meaning: "Coulomb force depends on both charge sizes and falls with the square of separation.",
      conditions: "Use for point-charge interactions.",
      unitsText: "N, C, m",
    },
  ],
  A8_L5: [
    {
      standardFormula: "F = B q v sin(theta)",
      meaning: "A moving charge feels magnetic force from the component of its motion perpendicular to the field.",
      conditions: "Use for magnetic force on charged particles.",
      unitsText: "N, T, C, m/s",
    },
    {
      standardFormula: "F = B I L sin(theta)",
      meaning: "A current-carrying conductor in a magnetic field feels a force from the active length perpendicular to the field.",
      conditions: "Use for magnetic force on wires and motor-effect calculations.",
      unitsText: "N, T, A, m",
    },
  ],
  A8_L6: [
    {
      standardFormula: "q v B = m v^2 / r",
      meaning: "Magnetic force can provide the centripetal force for circular motion.",
      conditions: "Use when a charged particle moves perpendicular to a magnetic field in a circular path.",
      unitsText: "N, T, C, m/s, kg, m",
    },
    {
      standardFormula: "r = m v / (q B)",
      meaning: "The radius of the magnetic orbit grows with particle momentum and shrinks with stronger field or larger charge.",
      conditions: "Use after equating magnetic force with centripetal force.",
      unitsText: "m, kg, m/s, C, T",
    },
    {
      standardFormula: "F = B I L",
      meaning: "Each active side of a coil can feel a magnetic force that contributes to a turning couple.",
      conditions: "Use for simple motor-effect force calculations when the wire is perpendicular to the field.",
      unitsText: "N, T, A, m",
    },
  ],
  A9_L1: [
    {
      standardFormula: "induced emf = N delta(Phi) / delta(t)",
      meaning: "An induced emf appears when magnetic flux linkage changes with time.",
      conditions: "Use for Faraday-law magnitude calculations before considering the Lenz-law sign.",
      unitsText: "V, Wb, s",
    },
    {
      standardFormula: "Phi = B A cos(theta)",
      meaning: "Magnetic flux depends on field strength, loop area, and the tilt of the loop relative to the field.",
      conditions: "Use when geometry changes the flux through a loop.",
      unitsText: "Wb, T, m^2",
    },
  ],
  A9_L2: [
    {
      standardFormula: "induced emf = -N delta(Phi) / delta(t)",
      meaning: "The minus sign shows the induced response opposes the change in magnetic flux linkage.",
      conditions: "Use when both Faraday's law and Lenz's-law direction must be kept together.",
      unitsText: "V, Wb, s",
    },
  ],
  A9_L3: [
    {
      standardFormula: "induced emf = N delta(Phi) / delta(t)",
      meaning: "Generator emf comes from repeated changes in flux linkage as the coil rotates.",
      conditions: "Use for average emf calculations over part of a cycle.",
      unitsText: "V, Wb, s",
    },
    {
      standardFormula: "f = 1 / T",
      meaning: "Frequency and period describe the timing of the alternating output.",
      conditions: "Use when converting between cycle time and a.c. frequency.",
      unitsText: "Hz, s",
    },
  ],
  A9_L4: [
    {
      standardFormula: "V_p / V_s = N_p / N_s",
      meaning: "In an ideal transformer, the voltage ratio matches the turns ratio.",
      conditions: "Use for primary-secondary voltage comparisons.",
      unitsText: "V",
    },
    {
      standardFormula: "V_p I_p = V_s I_s",
      meaning: "Ideal transformers approximately conserve power between primary and secondary.",
      conditions: "Use when relating transformer voltage and current on opposite sides.",
      unitsText: "W, V, A",
    },
  ],
  A9_L5: [
    {
      standardFormula: "V_rms = V_peak / sqrt(2)",
      meaning: "The rms voltage is the d.c.-equivalent value for the heating effect of a sinusoidal a.c. signal.",
      conditions: "Use for sinusoidal a.c. peak-to-rms conversions.",
      unitsText: "V",
    },
    {
      standardFormula: "I_rms = I_peak / sqrt(2)",
      meaning: "The rms current gives the d.c.-equivalent heating effect of a sinusoidal a.c. current.",
      conditions: "Use for sinusoidal a.c. current conversions.",
      unitsText: "A",
    },
    {
      standardFormula: "P_loss = I^2 R",
      meaning: "Transmission losses in cables rise with the square of the current.",
      conditions: "Use when comparing line heating losses at different transmission currents.",
      unitsText: "W, A, ohm",
    },
  ],
  A9_L6: [
    {
      standardFormula: "induced emf = -N delta(Phi) / delta(t)",
      meaning: "Changing flux drives the eddy-current loop through the conductor.",
      conditions: "Use when a conductor experiences changing magnetic flux.",
      unitsText: "V, Wb, s",
    },
    {
      standardFormula: "P = I^2 R",
      meaning: "Eddy currents can cause heating because current in a resistive conductor dissipates power.",
      conditions: "Use when the application depends on induction heating or resistive loss in the conductor.",
      unitsText: "W",
    },
  ],
  A10_L2: [
    {
      standardFormula: "E_k = q V",
      meaning: "A charged particle gains kinetic energy when accelerated through a potential difference.",
      conditions: "Use for accelerator-beam energy calculations.",
      unitsText: "J, C, V",
    },
    {
      standardFormula: "r = m v / (q B)",
      meaning: "A magnetic field bends a charged-particle beam into a circular path with radius set by momentum per unit charge.",
      conditions: "Use for detector-track curvature or accelerator beam steering when the motion is perpendicular to the field.",
      unitsText: "m, kg, m/s, C, T",
    },
  ],
  A10_L3: [
    {
      standardFormula: "A = lambda N",
      meaning: "Activity depends on the decay constant and the number of undecayed nuclei.",
      conditions: "Use when linking decay rate to the number of unstable nuclei present.",
      unitsText: "Bq, s^-1",
    },
    {
      standardFormula: "lambda = ln(2) / t_(1/2)",
      meaning: "The decay constant is linked directly to the half-life.",
      conditions: "Use when converting between half-life and decay constant.",
      unitsText: "s^-1",
    },
    {
      standardFormula: "N = N_0 (1/2)^(t / t_(1/2))",
      meaning: "The number of undecayed nuclei falls exponentially with successive half-lives.",
      conditions: "Use for remaining-nuclei or count-rate questions expressed in half-life form.",
      unitsText: "count",
    },
  ],
  A10_L4: [
    {
      standardFormula: "Delta E = Delta m c^2",
      meaning: "A mass defect corresponds to binding energy through mass-energy equivalence.",
      conditions: "Use when comparing separated nucleons with the bound nucleus.",
      unitsText: "J, kg",
    },
    {
      standardFormula: "binding energy per nucleon = total binding energy / A",
      meaning: "Binding energy per nucleon compares how tightly nucleons are bound in different nuclei.",
      conditions: "Use after calculating or being given the total binding energy of a nucleus.",
      unitsText: "J or MeV per nucleon",
    },
    {
      standardFormula: "R = R0 A^(1/3)",
      meaning: "Nuclear radius grows with the cube root of nucleon number in the simple nuclear-size model.",
      conditions: "Use for approximate nuclear-size estimates.",
      unitsText: "m",
      constants: "Use R0 about 1.2 x 10^-15 m unless the question gives a different value.",
    },
  ],
  A10_L5: [
    {
      standardFormula: "Delta E = Delta m c^2",
      meaning: "The released fission energy comes from the mass defect between the starting and final states.",
      conditions: "Use when linking nuclear-energy release to binding-energy change in fission.",
      unitsText: "J, kg",
    },
    {
      standardFormula: "P = E / t",
      meaning: "Reactor power is the energy released per unit time.",
      conditions: "Use when connecting fission energy per event to total reactor output.",
      unitsText: "W, J, s",
    },
    {
      standardFormula: "fission rate = power / energy per fission",
      meaning: "The required number of fission events each second is set by reactor power divided by the energy released per event.",
      conditions: "Use for reactor-output and fuel-use calculations.",
      unitsText: "s^-1",
    },
  ],
  A10_L6: [
    {
      standardFormula: "Delta E = Delta m c^2",
      meaning: "Fusion releases energy when the products are more tightly bound and the total mass decreases.",
      conditions: "Use when linking nuclear-energy release to binding-energy change in fusion.",
      unitsText: "J, kg",
    },
    {
      standardFormula: "binding energy per nucleon = total binding energy / A",
      meaning: "Fusion of light nuclei is favorable when the products move to a higher binding energy per nucleon.",
      conditions: "Use when comparing fusion with other nuclear processes using the binding-energy-per-nucleon curve.",
      unitsText: "J or MeV per nucleon",
    },
  ],
  A11_L1: [
    {
      standardFormula: "g = G M / r^2",
      meaning: "Gravitational field strength around a spherical mass follows the inverse-square law.",
      conditions: "Use outside a spherical mass distribution.",
      unitsText: "N/kg",
    },
    {
      standardFormula: "V = -G M / r",
      meaning: "Gravitational potential is the work done per unit mass in bringing a test mass from infinity.",
      conditions: "Use outside a spherical mass distribution with zero potential taken at infinity.",
      unitsText: "J/kg",
    },
  ],
  A11_L2: [
    {
      standardFormula: "G M m / r^2 = m v^2 / r",
      meaning: "For a circular orbit, gravity provides the centripetal force.",
      conditions: "Use for circular satellite orbits around a much larger central mass.",
      unitsText: "N",
    },
    {
      standardFormula: "T² = 4π²r³ / (GM)",
      meaning: "Orbital period depends on orbital radius and the central mass.",
      conditions: "Use for circular or nearly circular orbits around a dominant central mass.",
      unitsText: "s",
    },
  ],
  A11_L3: [
    {
      standardFormula: "λ_max T = b",
      meaning: "Wien's displacement law links a star's peak wavelength to its surface temperature.",
      conditions: "Use when estimating stellar surface temperature from the spectrum peak.",
      unitsText: "m, K",
      constants: "Use Wien's constant b = 2.90 × 10^-3 m K.",
    },
    {
      standardFormula: "L = 4πR²σT⁴",
      meaning: "A star's luminosity depends on radius and surface temperature.",
      conditions: "Use for blackbody-style stellar luminosity estimates.",
      unitsText: "W",
      constants: "Use σ = 5.67 x 10^-8 W m^-2 K^-4 when the relation is used quantitatively.",
    },
  ],
  A11_L4: [
    {
      standardFormula: "d(pc) = 1 / p(arcsec)",
      meaning: "Parallax distance in parsecs is the reciprocal of the parallax angle in arcseconds.",
      conditions: "Use for nearby stars where the parallax angle can be measured.",
      unitsText: "pc, arcsec",
    },
    {
      standardFormula: "I = L / (4 pi d^2)",
      meaning: "Apparent brightness falls with the square of distance from a source of fixed luminosity.",
      conditions: "Use when a standard candle's luminosity is known.",
      unitsText: "W/m^2, W, m",
    },
  ],
  A11_L6: [
    {
      standardFormula: "z = Δλ / λ_emitted",
      meaning: "Redshift compares the wavelength change with the emitted wavelength.",
      conditions: "Use when measuring cosmological redshift from spectral lines.",
      unitsText: "no unit",
    },
    {
      standardFormula: "v = H₀d",
      meaning: "Hubble's law links recession speed to distance for distant galaxies.",
      conditions: "Use for large-scale cosmological recession in the simple Hubble-law model.",
      unitsText: "m/s or km/s",
      constants: "Use H₀ in the form given by the question, often about 70 km s^-1 Mpc^-1.",
    },
  ],
};

const A1_FORMULA_OVERRIDES: Record<string, FormulaFallbackEntry[]> = {
  A1_L1: [
    {
      standardFormula: "q = n e",
      meaning: "Particle charge is an integer multiple of the elementary charge.",
      conditions: "Use when turning a charge tag into the physical charge of a particle.",
      unitsText: "C or e",
      constants: "Use e = 1.60 x 10^-19 C.",
    },
    {
      standardFormula: "Q_total = sum(individual particle charges)",
      meaning: "A system charge is found by adding the charge tags of the particles present.",
      conditions: "Use when comparing the total charge of a particle set or event side.",
      unitsText: "e or C",
    },
  ],
  A1_L2: [
    {
      standardFormula: "Q_hadron = sum(quark charges)",
      meaning: "The net charge of a hadron comes from adding the charges of its constituent quarks or antiquarks.",
      conditions: "Use when checking whether a proposed quark bundle matches the named hadron.",
      unitsText: "e",
    },
    {
      standardFormula: "baryon -> qqq ; meson -> q qbar",
      meaning: "Quark packing distinguishes the two main hadron subclasses.",
      conditions: "Use when classifying a hadron by structure rather than by size or charge alone.",
      unitsText: "classification rule",
    },
  ],
  A1_L3: [
    {
      standardFormula: "E = h f",
      meaning: "Photon energy depends on Planck's constant and frequency.",
      conditions: "Use for photon-energy reasoning in pair production or annihilation chains.",
      unitsText: "J or eV",
    },
    {
      standardFormula: "E = h c / lambda",
      meaning: "Photon energy can also be found from wavelength instead of frequency.",
      conditions: "Use when pair-production or annihilation work is phrased in wavelength terms.",
      unitsText: "J or eV",
    },
    {
      standardFormula: "E_gamma >= 2 m c^2",
      meaning: "A photon needs at least the combined rest energy of the created pair.",
      conditions: "Use for threshold reasoning in pair production to one particle-antiparticle pair.",
      unitsText: "J or eV",
    },
  ],
  A1_L4: [
    {
      standardFormula: "particle identity changes -> weak interaction clue",
      meaning: "A particle-changing event points to the weak interaction rather than to a simple binding story.",
      conditions: "Use when classifying beta-decay-style or flavor-changing particle events.",
      unitsText: "classification rule",
    },
    {
      standardFormula: "nuclear or hadron binding without particle change -> strong interaction clue",
      meaning: "Binding quarks or nucleons together is a strong-interaction signature in this lesson's model.",
      conditions: "Use when separating binding events from particle-changing events.",
      unitsText: "classification rule",
    },
  ],
  A1_L5: [
    {
      standardFormula: "sum(charge)_before = sum(charge)_after",
      meaning: "Charge conservation requires the total charge to balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "e or C",
    },
    {
      standardFormula: "sum(baryon number)_before = sum(baryon number)_after",
      meaning: "Baryon number conservation must balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "no unit",
    },
    {
      standardFormula: "sum(lepton number)_before = sum(lepton number)_after",
      meaning: "Lepton number conservation must balance across the event.",
      conditions: "Use for particle reactions, decays, and collision events.",
      unitsText: "no unit",
    },
  ],
  A1_L6: [
    {
      standardFormula: "sum(charge)_before = sum(charge)_after",
      meaning: "Particle-event analysis starts by checking that total charge balances.",
      conditions: "Use when screening a proposed decay, collision, or reaction channel.",
      unitsText: "e or C",
    },
    {
      standardFormula: "sum(baryon number)_before = sum(baryon number)_after",
      meaning: "A full event analysis should still check baryon number, not just electric charge.",
      conditions: "Use when screening a proposed decay, collision, or reaction channel.",
      unitsText: "no unit",
    },
    {
      standardFormula: "sum(lepton number)_before = sum(lepton number)_after",
      meaning: "Lepton-number balance helps identify missing neutrinos or impossible channels.",
      conditions: "Use when screening a proposed decay, collision, or reaction channel.",
      unitsText: "no unit",
    },
    {
      standardFormula: "sum(energy)_before = sum(energy)_after",
      meaning: "Total energy must balance across the full particle event.",
      conditions: "Use when interpreting products, thresholds, and missing-energy clues.",
      unitsText: "J or eV",
    },
  ],
};

const A11_FORMULA_OVERRIDES: Record<string, FormulaFallbackEntry[]> = {
  A11_L1: [
    {
      standardFormula: "g = G M / r^2",
      meaning: "Gravitational field strength around a spherical mass follows the inverse-square law.",
      conditions: "Use outside a spherical mass distribution.",
      unitsText: "N/kg",
    },
    {
      standardFormula: "V = -G M / r",
      meaning: "Gravitational potential is the work done per unit mass in bringing a test mass from infinity.",
      conditions: "Use outside a spherical mass distribution with zero potential taken at infinity.",
      unitsText: "J/kg",
    },
  ],
  A11_L2: [
    {
      standardFormula: "v = sqrt(G M / r)",
      meaning: "Circular orbital speed is set by the central mass and orbital radius.",
      conditions: "Use for circular satellite orbits around a much larger central mass.",
      unitsText: "m/s",
    },
    {
      standardFormula: "T^2 = 4 pi^2 r^3 / (G M)",
      meaning: "Orbital period depends on orbital radius and the central mass.",
      conditions: "Use for circular or nearly circular orbits around a dominant central mass.",
      unitsText: "s",
    },
  ],
  A11_L3: [
    {
      standardFormula: "lambda_max T = b",
      meaning: "Wien's displacement law links a star's peak wavelength to its surface temperature.",
      conditions: "Use when estimating stellar surface temperature from the spectrum peak.",
      unitsText: "m, K",
      constants: "Use Wien's constant b = 2.90 x 10^-3 m K.",
    },
    {
      standardFormula: "L = 4 pi R^2 sigma T^4",
      meaning: "A star's luminosity depends on radius and surface temperature.",
      conditions: "Use for blackbody-style stellar luminosity estimates.",
      unitsText: "W",
      constants: "Use sigma = 5.67 x 10^-8 W m^-2 K^-4 when the relation is used quantitatively.",
    },
  ],
  A11_L4: [
    {
      standardFormula: "d(pc) = 1 / p(arcsec)",
      meaning: "Parallax distance in parsecs is the reciprocal of the parallax angle in arcseconds.",
      conditions: "Use for nearby stars where the parallax angle can be measured.",
      unitsText: "pc, arcsec",
    },
    {
      standardFormula: "I = L / (4 pi d^2)",
      meaning: "Apparent brightness falls with the square of distance from a source of fixed luminosity.",
      conditions: "Use when a standard candle's luminosity is known.",
      unitsText: "W/m^2, W, m",
    },
  ],
  A11_L5: [
    {
      standardFormula: "R_s = 2 G M / c^2",
      meaning: "The Schwarzschild radius gives the event-horizon radius for a non-rotating black hole.",
      conditions: "Use when checking whether a compact remnant of given mass would be inside its event horizon.",
      unitsText: "m",
    },
  ],
  A11_L6: [
    {
      standardFormula: "z = Delta lambda / lambda_emitted",
      meaning: "Redshift compares the wavelength change with the emitted wavelength.",
      conditions: "Use when measuring cosmological redshift from spectral lines.",
      unitsText: "no unit",
    },
    {
      standardFormula: "v approx z c",
      meaning: "For modest cosmological redshifts, recession speed can be estimated from redshift times the speed of light.",
      conditions: "Use as the low-redshift approximation before applying Hubble's law.",
      unitsText: "m/s or km/s",
    },
    {
      standardFormula: "v = H0 d",
      meaning: "Hubble's law links recession speed to distance for distant galaxies.",
      conditions: "Use for large-scale cosmological recession in the simple Hubble-law model.",
      unitsText: "m/s or km/s",
      constants: "Use H0 in the form given by the question, often about 70 km s^-1 Mpc^-1.",
    },
  ],
};

export function supplementalEquationFallbacksForLesson(code: string): FormulaFallbackEntry[] {
  if (A1_FORMULA_OVERRIDES[code]) {
    return A1_FORMULA_OVERRIDES[code];
  }
  if (A11_FORMULA_OVERRIDES[code]) {
    return A11_FORMULA_OVERRIDES[code];
  }
  return SUPPLEMENTAL_EQUATION_FALLBACKS[code] || [];
}
