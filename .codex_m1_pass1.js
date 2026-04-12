const fs = require('fs');
const p = 'C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts';
let s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
function rep(oldText, newText, label) {
  if (!s.includes(oldText)) throw new Error('Missing snippet: ' + label);
  s = s.replace(oldText, newText);
}
const newTop = [
  'const SUPPLEMENTAL_LESSON_CODES = ["F1_L1", "F1_L2", "F1_L3", "F1_L4", "F1_L5", "F1_L6", "F2_L1", "F2_L2", "F2_L3", "F2_L4", "F2_L5", "F2_L6", "F3_L1", "F3_L2", "F3_L3", "F3_L4", "F3_L5", "F3_L6", "F4_L1", "F4_L2", "F4_L3", "F4_L4", "F4_L5", "F4_L6", "M1_L1", "M1_L2", "M1_L3", "M1_L4", "M1_L5", "M1_L6"];',
  '',
  'function isExtendedNextgenLessonCode(code: string): boolean {',
  '  return code.startsWith("F2_") || code.startsWith("F3_") || code.startsWith("F4_") || code.startsWith("M1_");',
  '}',
  '',
  'function isStructuredMasteryPaddingLessonCode(code: string): boolean {',
  '  return code.startsWith("F3_") || code.startsWith("F4_") || code.startsWith("M1_");',
  '}',
].join('\\n');
s = s.replace(/const SUPPLEMENTAL_LESSON_CODES = \[[^\n]+\];/, newTop);
s = s.split('if (code.startsWith("F2_") || code.startsWith("F3_") || code.startsWith("F4_")) {').join('if (isExtendedNextgenLessonCode(code)) {');
rep(
  'const paddingHint = code.startsWith("F3_") || code.startsWith("F4_") ? "Choose the statement that directly answers this lesson point." : "Pick the statement that matches this lesson\'s main distinction.";',
  'const paddingHint = isStructuredMasteryPaddingLessonCode(code) ? "Choose the statement that directly answers this lesson point." : "Pick the statement that matches this lesson\'s main distinction.";',
  'padding hint'
);
rep(
  '    if (code === "F4_L6") return "Which option is the clearest match for this power and safety lesson?";\n    if (code.startsWith("F3_")) return "Which option directly answers this lesson point?";',
  '    if (code === "F4_L6") return "Which option is the clearest match for this power and safety lesson?";\n    if (code.startsWith("M1_")) return index % 2 === 0 ? "Which statement best matches this motion-graph lesson point?" : "Choose the option that keeps the motion representation and its meaning aligned.";\n    if (code.startsWith("F3_")) return "Which option directly answers this lesson point?";',
  'prompt stem'
);
rep(
  '      case "F4_L6":\n        return ["F3_L3", "F3_L6", "F4_L2", "F4_L3", "F4_L5"];\n      default:\n        return [];',
  '      case "F4_L6":\n        return ["F3_L3", "F3_L6", "F4_L2", "F4_L3", "F4_L5"];\n      case "M1_L1":\n        return ["F2_L1", "F2_L3", "M1_L2", "M1_L5", "M1_L6"];\n      case "M1_L2":\n        return ["F2_L2", "F2_L4", "M1_L1", "M1_L3", "M1_L5"];\n      case "M1_L3":\n        return ["F2_L2", "F2_L6", "M1_L2", "M1_L4", "M1_L5"];\n      case "M1_L4":\n        return ["M1_L3", "M1_L5", "M1_L6", "F2_L6", "F3_L6"];\n      case "M1_L5":\n        return ["F2_L3", "F2_L4", "M1_L1", "M1_L2", "M1_L6"];\n      case "M1_L6":\n        return ["F2_L4", "F3_L1", "M1_L2", "M1_L4", "M1_L5"];\n      default:\n        return [];',
  'contrast codes'
);
fs.writeFileSync(p, s.replace(/\n/g, '\r\n'));
console.log('pass1 ok');
