const fs = require('fs');
const p = 'C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
function rep(oldText, newText, label) {
  if (!s.includes(oldText)) throw new Error('Missing snippet: ' + label);
  s = s.replace(oldText, newText);
}
rep(
  '    case "F4_L6": return "Power and safety explorer";\n    default: return "Simulation inquiry";',
  '    case "F4_L6": return "Power and safety explorer";\n    case "M1_L1": return "Route-log story explorer";\n    case "M1_L2": return "Speed-strip explorer";\n    case "M1_L3": return "Change-rate explorer";\n    case "M1_L4": return "Forecast-console explorer";\n    case "M1_L5": return "Slope-gauge explorer";\n    case "M1_L6": return "Area-accumulator explorer";\n    default: return "Simulation inquiry";',
  'simulation titles'
);
rep(
  '    case "F4_L6": return "Use the Flow-Grid source station, stream rate, and safety gate together so power, total energy transfer, and protective cut-off become one system story.";\n    default: return text(inquiry[0]?.prompt) || "Explore the activity and notice what changes as you test the idea.";',
  '    case "F4_L6": return "Use the Flow-Grid source station, stream rate, and safety gate together so power, total energy transfer, and protective cut-off become one system story.";\n    case "M1_L1": return "Use the Motion Control Wall route log to keep graph height, graph steepness, and pauses separate while you compare journeys that can end at the same distance with different stories.";\n    case "M1_L2": return "Use the Motion Control Wall speed strip to separate graph height from graph slope so current speed and rate of change do not collapse into one idea.";\n    case "M1_L3": return "Use the change-rate dial to compare signed velocity changes over time so acceleration becomes a rate with direction, not a synonym for going faster.";\n    case "M1_L4": return "Use the forecast console only when acceleration stays constant, then choose the equation by the missing variable instead of by pattern matching.";\n    case "M1_L5": return "Lay the same slope gauge across different motion graphs so the same tilt is seen to mean different things when the axes change.";\n    case "M1_L6": return "Build rectangle, triangle, and trapezium regions under a speed-time graph so area becomes total distance and different shapes can still represent the same distance.";\n    default: return text(inquiry[0]?.prompt) || "Explore the activity and notice what changes as you test the idea.";',
  'simulation instructions'
);
rep(
  '    case "F4_L6": return "Use one route to compare a safe case, a higher-current case, and a longer-running case, then explain how power, total energy, and fuse action are linked in the Flow-Grid story.";\n    default: return text(inquiry[1]?.prompt) || text(inquiry[0]?.hint);',
  '    case "F4_L6": return "Use one route to compare a safe case, a higher-current case, and a longer-running case, then explain how power, total energy, and fuse action are linked in the Flow-Grid story.";\n    case "M1_L1": return "Build one route-log story with motion, a pause, and more motion, then compare it with a different graph that reaches the same final distance.";\n    case "M1_L2": return "Create one flat, one rising, and one falling speed-time line, then explain what height and slope each say at the same instant.";\n    case "M1_L3": return "Choose one positive, one negative, and one zero-acceleration case, then explain each sign from the signed velocity change over time.";\n    case "M1_L4": return "Use one constant-acceleration story to decide which equation finds the missing value, then explain why the same console should not be trusted when acceleration changes.";\n    case "M1_L5": return "Hold one common gradient across two graph types and explain why the same tilt means speed on one graph but acceleration on another.";\n    case "M1_L6": return "Split one speed-time graph into rectangle and triangle parts, then compare it with a different graph that encloses the same total area.";\n    default: return text(inquiry[1]?.prompt) || text(inquiry[0]?.hint);',
  'simulation task prompt'
);
rep(
  '    case "F4_L6":\n      return [\n        "Hold the voltage fixed and raise the current so power rises as the Flow-Grid moves more energy each second.",\n        "Keep the power fixed but run the route for longer so total transferred energy keeps increasing.",\n        "Raise the current above the safety-gate threshold and explain why the protective cut-off opens the route.",\n      ];\n    default:\n      return [];',
  '    case "F4_L6":\n      return [\n        "Hold the voltage fixed and raise the current so power rises as the Flow-Grid moves more energy each second.",\n        "Keep the power fixed but run the route for longer so total transferred energy keeps increasing.",\n        "Raise the current above the safety-gate threshold and explain why the protective cut-off opens the route.",\n      ];\n    case "M1_L1":\n      return [\n        "Start with one steady segment, then add a pause so only the flat part of the route log changes.",\n        "Rebuild the journey with different segment slopes but a similar finishing height so the final distance stays separate from the story of how it was reached.",\n        "Name which information comes from graph height and which comes from graph steepness before you describe the motion.",\n      ];\n    case "M1_L2":\n      return [\n        "Begin with a flat speed-time line so the speed is constant and the slope is zero.",\n        "Raise the end speed to create a positive slope, then lower it below the start to create a negative slope.",\n        "Compare one instant on two graphs and decide what the height says there and what the slope says there.",\n      ];\n    case "M1_L3":\n      return [\n        "Choose a positive direction and write the initial and final velocities with signs.",\n        "Compare the same velocity change over a short time and a longer time so the rate idea becomes visible.",\n        "Build one positive, one negative, and one zero case, then decide whether the object is speeding up, slowing down, or changing direction.",\n      ];\n    case "M1_L4":\n      return [\n        "Start with a constant-acceleration story and list the known and unknown variables.",\n        "Choose the equation whose missing-variable pattern fits the story instead of the one that simply looks familiar.",\n        "Switch off the constant-acceleration condition and explain why the forecast console should no longer be used directly.",\n      ];\n    case "M1_L5":\n      return [\n        "Set one common tilt and read it first on a distance-time graph, then on a speed-time graph.",\n        "Keep the gradient fixed while changing the starting height on the speed-time graph so height and slope stay separate.",\n        "Explain the meaning from the axes before you name the quantity.",\n      ];\n    case "M1_L6":\n      return [\n        "Choose start speed, end speed, and time for one straight-line speed-time graph.",\n        "Split the shaded area into a rectangle and a triangle, then add them for the total distance.",\n        "Compare that total with a different graph that encloses the same area so equal distance does not imply identical motion.",\n      ];\n    default:\n      return [];',
  'simulation explore steps'
);
rep(
  '    case "F4_L6":\n      return [\n        "Power tells how fast electrical energy is transferred: P = VI.",\n        "Total electrical energy still depends on how long that power runs: E = Pt.",\n        "Safety devices protect circuits by cutting off dangerously large current before overheating becomes severe.",\n      ];\n    default:\n      return [];',
  '    case "F4_L6":\n      return [\n        "Power tells how fast electrical energy is transferred: P = VI.",\n        "Total electrical energy still depends on how long that power runs: E = Pt.",\n        "Safety devices protect circuits by cutting off dangerously large current before overheating becomes severe.",\n      ];\n    case "M1_L1":\n      return [\n        "Graph height tells the recorded total distance by that time.",\n        "Graph steepness tells how quickly distance is being added, so it represents speed.",\n        "A flat section means the object is stopped for that interval, and the same finishing height can still come from a different journey story.",\n      ];\n    case "M1_L2":\n      return [\n        "On a speed-time graph, height tells the speed at that instant.",\n        "Slope tells how the speed or velocity is changing, so it is about acceleration, not distance.",\n        "A flat section above zero still means motion, and equal graph height does not guarantee equal acceleration.",\n      ];\n    case "M1_L3":\n      return [\n        "Acceleration is change in velocity divided by time.",\n        "The sign of acceleration depends on the chosen positive direction and the signed change in velocity.",\n        "Negative acceleration does not automatically mean slowing down in every situation.",\n      ];\n    case "M1_L4":\n      return [\n        "The standard motion equations in this lesson assume constant acceleration.",\n        "Equation choice should come from the known variables, the unknown variable, and which variable you want to avoid.",\n        "A sensible unit check and motion-story check help catch a wrong equation choice.",\n      ];\n    case "M1_L5":\n      return [\n        "Gradient meaning depends on the axes, not on steepness alone.",\n        "Distance-time gradient gives speed, while speed-time gradient gives acceleration.",\n        "Graph height and graph gradient must be kept separate on both graph types.",\n      ];\n    case "M1_L6":\n      return [\n        "Area under a speed-time graph gives total distance traveled over the interval.",\n        "Rectangle and triangle pieces can be added to build the total distance.",\n        "Two different graph shapes can enclose the same total area and therefore the same total distance.",\n      ];\n    default:\n      return [];',
  'simulation watch-for'
);
const oldTry = [
  '    case "F4_L6":',
  '      return "Try 12 V, 2 A, and 10 s first. The power is 24 W and the total transferred energy is 240 J. Then raise the current to 4 A and compare the larger power.";',
  '    default:',
  '      return undefined;',
].join('\n');
const newTry = [
  '    case "F4_L6":',
  '      return "Try 12 V, 2 A, and 10 s first. The power is 24 W and the total transferred energy is 240 J. Then raise the current to 4 A and compare the larger power.";',
  '    case "M1_L1":',
  '      return "Try 3 m/s, pause 2 s, then 5 m/s. The graph should rise, go flat, then rise more steeply.";',
  '    case "M1_L2":',
  '      return "Try 6 m/s to 12 m/s over 3 s. Height shows speed; slope is +2 m/s^2.";',
  '    case "M1_L3":',
  '      return "Try +8 m/s to +2 m/s in 3 s with east positive. The acceleration is -2 m/s^2.";',
  '    case "M1_L4":',
  '      return "Try u = 4 m/s, a = 3 m/s^2, and v = 16 m/s. The first choice should be v = u + at.";',
  '    case "M1_L5":',
  '      return "Try a gradient of 3. On distance-time it means 3 m/s; on speed-time it means 3 m/s^2.";',
  '    case "M1_L6":',
  '      return "Try u = 4 m/s, v = 10 m/s, and t = 6 s. Rectangle plus triangle gives 42 m.";',
  '    default:',
  '      return undefined;',
].join('\n');
rep(oldTry, newTry, 'simulation try-first');
const oldTakeaway = [
  '    case "F4_L6":',
  '      return "Electrical power, total energy transfer, and safety all fit one story: how fast energy moves, how long it moves, and when excessive current must be cut off.";',
  '    default:',
  '      return undefined;',
].join('\n');
const newTakeaway = [
  '    case "F4_L6":',
  '      return "Electrical power, total energy transfer, and safety all fit one story: how fast energy moves, how long it moves, and when excessive current must be cut off.";',
  '    case "M1_L1":',
  '      return "A distance-time graph becomes readable when height and slope are kept separate.";',
  '    case "M1_L2":',
  '      return "A speed-time graph only makes sense when height and slope are read as different motion ideas.";',
  '    case "M1_L3":',
  '      return "Acceleration is a signed rate of velocity change, not a synonym for speed.";',
  '    case "M1_L4":',
  '      return "The constant-acceleration equations are a forecast toolkit: choose the relation that matches the story.";',
  '    case "M1_L5":',
  '      return "The same slope can tell a different physics story when the graph axes change.";',
  '    case "M1_L6":',
  '      return "Area under a speed-time graph is a distance story built from time width and speed height together.";',
  '    default:',
  '      return undefined;',
].join('\n');
rep(oldTakeaway, newTakeaway, 'simulation takeaway');
fs.writeFileSync(p, s.replace(/\n/g, '\r\n'));
console.log('simulation api ok');
