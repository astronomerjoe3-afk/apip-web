const fs = require('fs');
const p = 'C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
function rep(oldText, newText, label) {
  if (!s.includes(oldText)) throw new Error('Missing snippet: ' + label);
  s = s.replace(oldText, newText);
}
rep(
`    case "F4_L6":
      return [
        "Electrical power is the rate of energy transfer, so it depends on both voltage and current.",
        "Total energy transferred still depends on how long that rate continues.",
        "Large current increases heating risk, so safety devices are designed to interrupt dangerous current.",
        "A complete explanation should link power, total energy over time, and protection in one circuit story.",
      ];
    default:`,
`    case "F4_L6":
      return [
        "Electrical power is the rate of energy transfer, so it depends on both voltage and current.",
        "Total energy transferred still depends on how long that rate continues.",
        "Large current increases heating risk, so safety devices are designed to interrupt dangerous current.",
        "A complete explanation should link power, total energy over time, and protection in one circuit story.",
      ];
    case "M1_L1":
      return [
        "The mission log is a record of motion, not a picture of the lane.",
        "A higher point means more distance has been recorded by that time, not that the avatar is moving faster there.",
        "Compare the graph one segment at a time before telling the whole motion story.",
        "Steeper distance-time sections mean more distance is added each second.",
      ];
    case "M1_L2":
      return [
        "Separate speed-now from change-in-speed whenever you read a speed-time graph.",
        "A speed-time graph does not encode direction by itself, so a downward slope is not reverse travel automatically.",
        "Compare flat, rising, and falling sections as different speed stories across time.",
        "Two sections can show similar speeds but different accelerations if their slopes differ.",
      ];
    case "M1_L3":
      return [
        "Choose a positive direction before you interpret any acceleration sign.",
        "Keep the signs on both velocities before you subtract to find the velocity change.",
        "A negative acceleration does not automatically mean slowing down; it depends on the velocity direction too.",
        "A direction change can create acceleration even when the speed does not change.",
      ];
    case "M1_L4":
      return [
        "Check the constant-acceleration condition before you use a forecast equation.",
        "The equations compress one steady boost pattern; they are not magic spells for every motion story.",
        "The block-plus-triangle picture explains why displacement grows from both starting pace and added pace.",
        "Use consistent units and signs before substituting into the equation board.",
      ];
    case "M1_L5":
      return [
        "Name the graph type before you interpret any slope.",
        "Zero gradient means different physics on different graphs, so context comes first.",
        "Height and gradient answer different questions even on the same graph.",
        "The same numerical slope can carry different units and meanings when the axes change.",
      ];
    case "M1_L6":
      return [
        "Area meaning comes from the speed-time axes, not from the word graph alone.",
        "The final graph height is final speed, not total distance.",
        "Mixed journeys need the areas from all sections added together.",
        "Words, equations, and graphs must still tell the same motion story after the area is found.",
      ];
    default:`,
'focus');
rep(
`    case "F4_L6":
      return [
        "Electrical power = VI.",
        "Electrical energy transferred = Pt.",
        "Electrical energy transferred can also be written as VIt.",
        "Fuses and circuit breakers protect circuits by breaking the route when current becomes too large.",
      ];
    default:`,
`    case "F4_L6":
      return [
        "Electrical power = VI.",
        "Electrical energy transferred = Pt.",
        "Electrical energy transferred can also be written as VIt.",
        "Fuses and circuit breakers protect circuits by breaking the route when current becomes too large.",
      ];
    case "M1_L1":
      return [
        "A distance-time graph shows how recorded distance changes with time.",
        "Distance-time graph slope gives speed on that segment.",
        "A flat section means distance stays unchanged, so the avatar is paused.",
        "The same final distance can come from different motion stories.",
      ];
    case "M1_L2":
      return [
        "A speed-time graph shows the speed at each moment.",
        "Speed-time graph slope gives acceleration.",
        "A flat line above zero means constant speed, not rest.",
        "A downward slope means the speed is decreasing.",
      ];
    case "M1_L3":
      return [
        "Acceleration is the rate of change of velocity.",
        "The sign of acceleration comes from the signed velocity change.",
        "Zero acceleration can still describe steady non-zero motion.",
        "Velocity and acceleration directions together decide whether speed grows or shrinks.",
      ];
    case "M1_L4":
      return [
        "Constant-acceleration equations summarize one steady-change motion pattern.",
        "Choose the equation from the knowns, the unknown, and the conditions.",
        "v = u + at updates velocity under constant acceleration.",
        "s = ut + 1/2at^2 combines starting pace with added pace.",
      ];
    case "M1_L5":
      return [
        "Gradient meaning depends on the graph type.",
        "Distance-time gradient = speed.",
        "Speed-time gradient = acceleration.",
        "The same steepness can represent different physical quantities.",
      ];
    case "M1_L6":
      return [
        "Area under a speed-time graph = total distance traveled.",
        "Rectangle area handles constant-speed sections.",
        "Triangle or trapezium area handles uniformly changing-speed sections.",
        "Different speed-time shapes can still produce the same total distance.",
      ];
    default:`,
'core');rep(
`      if (isExtendedNextgenLessonCode(code)) {
        const essentials = [...scaffoldCoreBullets(code), ...scaffoldFocusExtras(code)].filter(Boolean);
        const isFlowGrid = code.startsWith("F4_");
        return [{ title: isFlowGrid ? "Circuit essentials" : "Lesson essentials", caption: isFlowGrid ? "Keep these Flow-Grid and circuit ideas visible while you work through the lesson." : "Keep these key motion or force ideas visible while you work through the lesson.", columns: ["Key idea", "Why it matters"], rows: essentials.slice(0, 6).map((item, index) => ["Idea " + String(index + 1), item]) }];
      }`,
`      if (isExtendedNextgenLessonCode(code)) {
        const essentials = [...scaffoldCoreBullets(code), ...scaffoldFocusExtras(code)].filter(Boolean);
        const isFlowGrid = code.startsWith("F4_");
        const isModuleOne = code.startsWith("M1_");        return [{ title: isFlowGrid ? "Circuit essentials" : "Lesson essentials", caption: isFlowGrid ? "Keep these Flow-Grid and circuit ideas visible while you work through the lesson." : isModuleOne ? "Keep these key graph, motion, and acceleration ideas visible while you work through the lesson." : "Keep these key motion or force ideas visible while you work through the lesson.", columns: ["Key idea", "Why it matters"], rows: essentials.slice(0, 6).map((item, index) => ["Idea " + String(index + 1), item]) }];
      }`,
'caption');
fs.writeFileSync(p, s.replace(/\n/g, '\r\n'));