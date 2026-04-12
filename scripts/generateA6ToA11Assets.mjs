import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.resolve(__dirname, "..");
const sourcePath = path.join(baseDir, "lib", "a6ToA11LessonContentData.json");
const lessonData = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const WIDTH = 1400;
const HEIGHT = 820;

const THEMES = {
  A6: { accent: "#f97316", soft: "#fff7ed", ink: "#7c2d12" },
  A7: { accent: "#2563eb", soft: "#eff6ff", ink: "#1d4ed8" },
  A8: { accent: "#7c3aed", soft: "#f5f3ff", ink: "#5b21b6" },
  A9: { accent: "#0f766e", soft: "#ecfeff", ink: "#115e59" },
  A10: { accent: "#dc2626", soft: "#fef2f2", ink: "#991b1b" },
  A11: { accent: "#1d4ed8", soft: "#eef2ff", ink: "#1e3a8a" },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function textBlock(lines, x, y, size, fill, weight = 400, lineHeight = Math.round(size * 1.35), anchor = "start") {
  const tspan = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="${weight}" text-anchor="${anchor}">${tspan}</text>`;
}

function roundedRect(x, y, width, height, fill, stroke, radius = 28) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
}

function badge(x, y, label, theme) {
  const width = Math.max(130, label.length * 10 + 30);
  return [
    roundedRect(x, y, width, 40, "#ffffff", theme.accent, 18),
    textBlock([label], x + width / 2, y + 26, 16, theme.ink, 800, 22, "middle"),
  ].join("");
}

function centralBoard(lesson, theme) {
  return [
    roundedRect(70, 242, 740, 518, "#ffffff", theme.accent, 36),
    roundedRect(106, 284, 668, 94, theme.soft, theme.accent, 28),
    textBlock(wrap(lesson.lessonTitle, 34), 440, 322, 28, theme.ink, 800, 34, "middle"),
    ...[118, 326, 534].map((x, index) =>
      [
        roundedRect(x, 400, 160, 136, theme.soft, theme.accent, 28),
        textBlock(wrap(lesson.visualCallouts[index], 18), x + 80, 436, 18, theme.ink, 700, 23, "middle"),
      ].join(""),
    ),
    `<line x1="280" y1="468" x2="314" y2="468" stroke="${theme.accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<line x1="488" y1="468" x2="522" y2="468" stroke="${theme.accent}" stroke-width="8" stroke-linecap="round"/>`,
    roundedRect(106, 566, 668, 156, "#f8fafc", theme.accent, 28),
    textBlock(["Try it in action"], 136, 602, 16, theme.ink, 800),
    textBlock(wrap(lesson.tryFirst, 58), 136, 638, 24, "#334155", 500, 31),
  ].join("");
}

function calloutCards(lesson, theme) {
  return lesson.visualCallouts
    .map((callout, index) => {
      const y = 280 + index * 124;
      return [
        roundedRect(860, y, 470, 96, "#ffffff", theme.accent, 24),
        textBlock([`Key ${index + 1}`], 890, y + 28, 15, theme.ink, 800),
        textBlock(wrap(callout, 32), 890, y + 58, 22, "#334155", 600, 29),
      ].join("");
    })
    .join("");
}

function svgForLesson(code, lesson) {
  const moduleCode = code.split("_")[0];
  const theme = THEMES[moduleCode];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  ${roundedRect(24, 24, WIDTH - 48, HEIGHT - 48, theme.soft, theme.accent, 40)}
  ${badge(70, 56, `${moduleCode} lesson board`, theme)}
  ${textBlock(wrap(lesson.visualTitle, 38), 70, 144, 35, "#0f172a", 800, 43)}
  ${textBlock(wrap(lesson.visualCaption, 92), 70, 202, 23, "#475569", 400, 31)}
  ${centralBoard(lesson, theme)}
  ${calloutCards(lesson, theme)}
  ${roundedRect(860, 652, 470, 108, "#ffffff", theme.accent, 28)}
  ${textBlock(["Lesson takeaway"], 890, 686, 16, theme.ink, 800)}
  ${textBlock(wrap(lesson.takeaway, 64), 890, 720, 23, "#334155", 600, 31)}
</svg>`;
}

for (const [code, lesson] of Object.entries(lessonData)) {
  const moduleCode = code.split("_")[0];
  const outputDir = path.join(baseDir, "public", "lesson_assets", moduleCode, code, "diagrams");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, `${lesson.slug}.svg`), svgForLesson(code, lesson), "utf8");
}

console.log(`Generated ${Object.keys(lessonData).length} A6-A11 lesson SVGs.`);
