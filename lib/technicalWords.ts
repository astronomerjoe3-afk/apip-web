"use client";

type UnknownRecord = Record<string, unknown>;

export type TechnicalWordEntry = {
  term: string;
  meaning: string;
  why_it_matters?: string;
  source?: string;
};

type TechnicalWordSeed = TechnicalWordEntry & {
  aliases?: string[];
};

const STRICT_AUTHORED_TECHNICAL_WORD_MODULES = new Set(["A6", "A7", "A8", "A9", "A10", "A11"]);

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
    { term: "SUVAT", aliases: ["suvat"], meaning: "SUVAT is the set of constant-acceleration equations linking displacement, initial velocity, final velocity, acceleration, and time.", why_it_matters: "It works only when acceleration stays constant." },
    { term: "Projectile motion", aliases: ["projectile motion", "projectile"], meaning: "Projectile motion is two-dimensional motion under gravity after launch, often with horizontal and vertical parts analysed separately.", why_it_matters: "It helps break a curved path into simpler component stories." },
    { term: "Horizontal velocity", aliases: ["horizontal velocity"], meaning: "Horizontal velocity is the component of velocity parallel to the ground or chosen x-axis.", why_it_matters: "In simple projectile motion without air resistance, it stays constant." },
    { term: "Vertical velocity", aliases: ["vertical velocity"], meaning: "Vertical velocity is the component of velocity along the vertical or chosen y-axis.", why_it_matters: "It changes because gravity acts vertically." },
    { term: "Circular motion", aliases: ["circular motion"], meaning: "Circular motion is motion around a circular path.", why_it_matters: "Even at constant speed, the velocity direction changes, so there is acceleration." },
    { term: "Centripetal force", aliases: ["centripetal force"], meaning: "Centripetal force is the inward resultant force needed to keep an object moving in a circle.", why_it_matters: "It is not a new extra force but the inward role of the resultant." },
    { term: "Gravitational field", aliases: ["gravitational field"], meaning: "A gravitational field is the region where masses experience gravitational force.", why_it_matters: "It supports orbital and field-based reasoning." },
    { term: "Orbital speed", aliases: ["orbital speed"], meaning: "Orbital speed is the speed needed for an object to remain in a stable orbit under gravity.", why_it_matters: "It links circular motion with gravitational attraction." },
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
      .filter(
        (entry) =>
          entry.term &&
          entry.meaning &&
          entry.source !== "generated" &&
          entry.source !== "lesson_generated",
      ),
  );
}

function scoreSeedAgainstCorpus(seed: TechnicalWordSeed, corpus: string): number {
  const aliases = [seed.term, ...(seed.aliases || [])]
    .map((alias) => normalizeGlossaryText(alias))
    .filter(Boolean);
  return aliases.reduce((total, alias) => (corpus.includes(alias) ? total + Math.max(1, alias.split(" ").length) : total), 0);
}

function moduleFallbackWords(lesson: UnknownRecord, lessonCode: string): TechnicalWordEntry[] {
  const moduleCode = moduleCodeFromLessonCode(lessonCode);
  const seeds = MODULE_TECHNICAL_WORDS[moduleCode] || [];
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

  const chosen = scored.filter((entry) => entry.score > 0).slice(0, 6);
  if (chosen.length < 4) {
    scored.forEach((entry) => {
      if (chosen.length >= 6) return;
      if (chosen.some((current) => normalizeGlossaryText(current.seed.term) === normalizeGlossaryText(entry.seed.term))) return;
      chosen.push(entry);
    });
  }

  return uniqueEntries(
    chosen.slice(0, 6).map(({ seed }) => ({
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
  return corpus.includes(key) ? Math.max(1, key.split(" ").length) : 0;
}

function rankLessonTechnicalWords(
  entries: TechnicalWordEntry[],
  corpus: string,
  authoredCount: number,
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

  const chosen = scored.filter((item) => item.score > 0).slice(0, 6);
  if (chosen.length < 4) {
    scored.forEach((item) => {
      if (chosen.length >= 6) return;
      if (chosen.some((current) => normalizeGlossaryText(current.entry.term) === normalizeGlossaryText(item.entry.term))) return;
      chosen.push(item);
    });
  }

  return chosen.slice(0, 6).map((item) => item.entry);
}

export function technicalWordsForLesson(lesson: UnknownRecord, lessonCode: string): TechnicalWordEntry[] {
  const moduleCode = moduleCodeFromLessonCode(lessonCode);
  const authored = authoredTechnicalWords(lesson);
  const corpus = lessonCorpus(lesson);

  if (STRICT_AUTHORED_TECHNICAL_WORD_MODULES.has(moduleCode) && authored.length >= 4) {
    return rankLessonTechnicalWords([...authored], corpus, authored.length);
  }

  return rankLessonTechnicalWords([...authored, ...moduleFallbackWords(lesson, lessonCode)], corpus, authored.length);
}
