type Palette = {
  bgStart: string;
  bgEnd: string;
  boardFill: string;
  boardStroke: string;
  panelFill: string;
  panelStroke: string;
  title: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  accentAlt: string;
  accentAltSoft: string;
  accentThird: string;
  pillFill: string;
  pillStroke: string;
  pillText: string;
  labelText: string;
  guide: string;
};

type ConceptVisualConfig = {
  title: string;
  subtitle: string;
  footer: string;
  palette: Palette;
  diagram: () => string;
};

const PANEL_X = 124;
const PANEL_Y = 192;
const PANEL_W = 1032;
const PANEL_H = 340;

const MODULE_PALETTES: Record<string, Palette> = {
  A2: {
    bgStart: "#081425",
    bgEnd: "#15365d",
    boardFill: "#0f1b30",
    boardStroke: "#35547c",
    panelFill: "#13243f",
    panelStroke: "#365882",
    title: "#f8fafc",
    subtitle: "#cbd5e1",
    accent: "#facc15",
    accentSoft: "#fde68a",
    accentAlt: "#38bdf8",
    accentAltSoft: "#bae6fd",
    accentThird: "#a78bfa",
    pillFill: "#162743",
    pillStroke: "#3d628e",
    pillText: "#e2e8f0",
    labelText: "#f8fafc",
    guide: "#7dd3fc",
  },
  A3: {
    bgStart: "#081423",
    bgEnd: "#1c355f",
    boardFill: "#0f1b31",
    boardStroke: "#3d5d89",
    panelFill: "#152541",
    panelStroke: "#446695",
    title: "#f8fafc",
    subtitle: "#dbeafe",
    accent: "#34d399",
    accentSoft: "#a7f3d0",
    accentAlt: "#f472b6",
    accentAltSoft: "#fbcfe8",
    accentThird: "#fbbf24",
    pillFill: "#18314d",
    pillStroke: "#4674a7",
    pillText: "#e5f3ff",
    labelText: "#f8fafc",
    guide: "#c4b5fd",
  },
  A4: {
    bgStart: "#0b1220",
    bgEnd: "#26446b",
    boardFill: "#101b2f",
    boardStroke: "#4a6891",
    panelFill: "#172742",
    panelStroke: "#55769d",
    title: "#f8fafc",
    subtitle: "#dbeafe",
    accent: "#60a5fa",
    accentSoft: "#bfdbfe",
    accentAlt: "#f59e0b",
    accentAltSoft: "#fcd34d",
    accentThird: "#34d399",
    pillFill: "#1b314f",
    pillStroke: "#5f80a8",
    pillText: "#eff6ff",
    labelText: "#f8fafc",
    guide: "#a5b4fc",
  },
  A5: {
    bgStart: "#0f172a",
    bgEnd: "#304164",
    boardFill: "#131c30",
    boardStroke: "#536784",
    panelFill: "#1a2640",
    panelStroke: "#61789a",
    title: "#f8fafc",
    subtitle: "#e2e8f0",
    accent: "#22c55e",
    accentSoft: "#86efac",
    accentAlt: "#fb7185",
    accentAltSoft: "#fecdd3",
    accentThird: "#facc15",
    pillFill: "#1f2d48",
    pillStroke: "#6c83a4",
    pillText: "#f8fafc",
    labelText: "#f8fafc",
    guide: "#cbd5e1",
  },
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function n(value: number): string {
  return value.toFixed(1);
}

function wrapText(value: string, maxLineLength: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length <= maxLineLength) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function textLines(
  x: number,
  y: number,
  lines: string[],
  fontSize: number,
  fill: string,
  options?: {
    anchor?: "start" | "middle" | "end";
    weight?: number;
    lineHeight?: number;
    family?: string;
  },
): string {
  const anchor = options?.anchor ?? "start";
  const weight = options?.weight ?? 600;
  const lineHeight = options?.lineHeight ?? fontSize + 10;
  const family = options?.family ?? "Arial";
  return `<text x="${n(x)}" y="${n(y)}" fill="${fill}" text-anchor="${anchor}" font-size="${fontSize}" font-family="${family}" font-weight="${weight}">${lines
    .map((line, index) => `<tspan x="${n(x)}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function rectLabel(x: number, y: number, text: string | string[], palette: Palette, minWidth = 132): string {
  const lines = Array.isArray(text) ? text : [text];
  const longestLineLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const width = Math.max(minWidth, longestLineLength * 12 + 34);
  const height = Math.max(42, 20 + lines.length * 23);
  return `
    <rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="16" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    ${textLines(x + width / 2, y + 26, lines, 19, palette.pillText, { anchor: "middle", weight: 700, lineHeight: 21 })}
  `;
}

function circle(cx: number, cy: number, r: number, fill: string, stroke = "", strokeWidth = 0): string {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : ""}/>`;
}

function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 5): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const head = 16 + width;
  const baseX = x2 - ux * head;
  const baseY = y2 - uy * head;
  const px = -uy;
  const py = ux;
  const wing = 8 + width;
  return `
    <line x1="${n(x1)}" y1="${n(y1)}" x2="${n(baseX)}" y2="${n(baseY)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
    <polygon points="${n(x2)},${n(y2)} ${n(baseX + px * wing)},${n(baseY + py * wing)} ${n(baseX - px * wing)},${n(baseY - py * wing)}" fill="${color}"/>
  `;
}

function buildWavePath(
  x: number,
  y: number,
  width: number,
  cycles: number,
  amplitude: number,
  phase = 0,
  samples = 96,
  decay = 0,
): string {
  const points: string[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const px = x + width * t;
    const scale = decay > 0 ? Math.exp(-decay * t) : 1;
    const py = y - Math.sin(t * Math.PI * 2 * cycles + phase) * amplitude * scale;
    points.push(`${index === 0 ? "M" : "L"} ${n(px)} ${n(py)}`);
  }
  return points.join(" ");
}

function renderFrame(key: string, config: ConceptVisualConfig): string {
  const { palette } = config;
  const titleLines = wrapText(config.title, 28);
  const subtitleLines = wrapText(config.subtitle, 46);
  const footerLines = wrapText(config.footer, 34);
  const titleY = titleLines.length > 1 ? 102 : 124;
  const subtitleY = titleY + titleLines.length * 34 + 8;
  const footerX = 640 - Math.max(220, footerLines.reduce((max, line) => Math.max(max, line.length * 6), 0));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.bgStart}"/>
          <stop offset="100%" stop-color="${palette.bgEnd}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="18%" r="68%">
          <stop offset="0%" stop-color="${palette.accentAlt}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="${palette.accentAlt}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)"/>
      <rect width="1280" height="720" fill="url(#glow)"/>
      <rect x="48" y="42" width="1184" height="636" rx="40" fill="${palette.boardFill}" fill-opacity="0.93" stroke="${palette.boardStroke}" stroke-width="4"/>
      <rect x="${n(PANEL_X)}" y="${n(PANEL_Y)}" width="${n(PANEL_W)}" height="${n(PANEL_H)}" rx="30" fill="${palette.panelFill}" stroke="${palette.panelStroke}" stroke-width="3"/>
      ${rectLabel(86, 78, key.replace("_", " "), palette, 118)}
      ${textLines(640, titleY, titleLines, 46, palette.title, { anchor: "middle", weight: 700, lineHeight: 48 })}
      ${textLines(640, subtitleY, subtitleLines, 23, palette.subtitle, { anchor: "middle", weight: 500, lineHeight: 28 })}
      ${config.diagram()}
      ${rectLabel(footerX, 578, footerLines, palette, 440)}
    </svg>
  `;
  return svgDataUri(svg);
}

function quantumLadderDiagram(palette: Palette): string {
  const left = 250;
  const right = 530;
  const levels = [470, 400, 330, 260];
  return `
    ${levels
      .map(
        (level, index) => `
          <line x1="${left}" y1="${level}" x2="${right}" y2="${level}" stroke="${palette.accentSoft}" stroke-width="5"/>
          ${textLines(560, level + 8, [`n = ${index + 1}`], 20, palette.labelText)}
        `,
      )
      .join("")}
    <line x1="${left}" y1="250" x2="${left}" y2="480" stroke="${palette.guide}" stroke-width="4"/>
    <line x1="${right}" y1="250" x2="${right}" y2="480" stroke="${palette.guide}" stroke-width="4"/>
    ${circle(332, 470, 18, palette.accentAlt, palette.accentAltSoft, 3)}
    ${arrow(362, 454, 430, 332, palette.accent, 7)}
    <rect x="402" y="356" width="118" height="44" rx="18" fill="${palette.accent}" fill-opacity="0.18" stroke="${palette.accent}" stroke-width="2"/>
    ${textLines(461, 384, ["packet = gap"], 20, palette.accent, { anchor: "middle", weight: 700 })}
    ${textLines(232, 518, ["ground state"], 19, palette.subtitle)}
    ${textLines(518, 518, ["excited state"], 19, palette.subtitle)}
  `;
}

function spectralBarcodeDiagram(palette: Palette): string {
  const barX = [720, 760, 804, 860, 920];
  const colors = ["#f87171", "#fb7185", "#facc15", "#38bdf8", "#c084fc"];
  return `
    <rect x="200" y="246" width="230" height="210" rx="24" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    <line x1="250" y1="410" x2="370" y2="410" stroke="${palette.accentSoft}" stroke-width="5"/>
    <line x1="250" y1="340" x2="370" y2="340" stroke="${palette.accentSoft}" stroke-width="5"/>
    <line x1="250" y1="280" x2="370" y2="280" stroke="${palette.accentSoft}" stroke-width="5"/>
    ${arrow(320, 286, 320, 334, palette.accentAlt, 6)}
    ${arrow(350, 344, 350, 288, palette.accent, 6)}
    ${textLines(316, 236, ["same gaps"], 20, palette.subtitle, { anchor: "middle" })}
    ${textLines(320, 368, ["emission"], 18, palette.accentAltSoft, { anchor: "middle" })}
    ${textLines(350, 272, ["absorption"], 18, palette.accentSoft, { anchor: "middle" })}
    <rect x="610" y="238" width="360" height="236" rx="24" fill="#08111f" stroke="${palette.pillStroke}" stroke-width="2"/>
    ${barX
      .map(
        (x, index) => `<line x1="${x}" y1="264" x2="${x}" y2="448" stroke="${colors[index]}" stroke-width="${index === 2 ? 12 : 9}" stroke-linecap="round"/>`,
      )
      .join("")}
    ${textLines(790, 516, ["line spectrum"], 24, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function photoelectricThresholdDiagram(palette: Palette): string {
  return `
    <rect x="520" y="260" width="150" height="210" rx="24" fill="#334155" stroke="${palette.accentSoft}" stroke-width="3"/>
    ${textLines(595, 494, ["metal surface"], 21, palette.labelText, { anchor: "middle" })}
    <line x1="252" y1="302" x2="454" y2="302" stroke="${palette.accentThird}" stroke-width="8" stroke-linecap="round"/>
    <line x1="252" y1="396" x2="454" y2="396" stroke="${palette.accentAlt}" stroke-width="8" stroke-linecap="round"/>
    <rect x="444" y="278" width="54" height="48" rx="12" fill="${palette.accentThird}" fill-opacity="0.24" stroke="${palette.accentThird}" stroke-width="3"/>
    <rect x="444" y="372" width="54" height="48" rx="12" fill="${palette.accentAlt}" fill-opacity="0.24" stroke="${palette.accentAlt}" stroke-width="3"/>
    ${textLines(204, 307, ["below f0"], 21, palette.accentSoft)}
    ${textLines(202, 401, ["above f0"], 21, palette.accentAltSoft)}
    ${textLines(700, 300, ["no electron"], 20, palette.subtitle)}
    ${arrow(676, 382, 796, 340, palette.accentAlt, 7)}
    ${circle(826, 330, 16, palette.accentAlt, palette.accentAltSoft, 3)}
    ${textLines(846, 336, ["ejected electron"], 20, palette.labelText)}
    <line x1="476" y1="232" x2="476" y2="490" stroke="${palette.guide}" stroke-width="3" stroke-dasharray="12 10"/>
    ${textLines(476, 216, ["threshold"], 19, palette.guide, { anchor: "middle" })}
  `;
}

function excitationIonisationDiagram(palette: Palette): string {
  const levels = [468, 402, 336, 270];
  return `
    ${levels
      .map((level) => `<line x1="250" y1="${level}" x2="470" y2="${level}" stroke="${palette.accentSoft}" stroke-width="5"/>`)
      .join("")}
    <line x1="250" y1="244" x2="470" y2="244" stroke="${palette.accentAltSoft}" stroke-width="4" stroke-dasharray="12 10"/>
    ${textLines(494, 250, ["ionisation threshold"], 19, palette.accentAltSoft)}
    ${circle(320, 468, 17, palette.accentAlt, palette.accentAltSoft, 3)}
    ${arrow(348, 454, 414, 338, palette.accentThird, 7)}
    ${arrow(384, 452, 520, 192, palette.accent, 7)}
    ${circle(540, 176, 16, palette.accent, palette.accentSoft, 3)}
    ${textLines(560, 182, ["free electron"], 20, palette.labelText)}
    ${textLines(370, 314, ["excited but still bound"], 19, palette.subtitle, { anchor: "middle" })}
    ${textLines(280, 520, ["ground"], 18, palette.subtitle)}
    ${textLines(528, 152, ["continuum"], 19, palette.accentSoft)}
  `;
}

function deBroglieDiagram(palette: Palette): string {
  return `
    ${circle(226, 362, 18, palette.accentAlt, palette.accentAltSoft, 3)}
    ${textLines(226, 410, ["single particle"], 19, palette.subtitle, { anchor: "middle" })}
    <rect x="432" y="246" width="34" height="230" rx="14" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    <rect x="430" y="308" width="38" height="20" fill="${palette.panelFill}"/>
    <rect x="430" y="376" width="38" height="20" fill="${palette.panelFill}"/>
    ${arrow(248, 362, 420, 362, palette.accentAlt, 6)}
    <path d="${buildWavePath(250, 314, 170, 1.3, 20, 0)}" fill="none" stroke="${palette.accent}" stroke-width="4"/>
    <path d="${buildWavePath(472, 320, 256, 2.2, 30, 0)}" fill="none" stroke="${palette.accentSoft}" stroke-width="3" stroke-dasharray="8 8"/>
    <rect x="760" y="236" width="58" height="252" rx="18" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    ${[268, 296, 334, 372, 404, 430]
      .map((spot, index) => circle(790, spot, index % 2 === 0 ? 7 : 5, palette.accentAlt))
      .join("")}
    ${textLines(790, 526, ["pattern builds"], 21, palette.labelText, { anchor: "middle" })}
    ${textLines(516, 474, ["two slits"], 19, palette.subtitle, { anchor: "middle" })}
  `;
}

function quantumEvidenceDiagram(palette: Palette): string {
  return `
    <rect x="172" y="248" width="258" height="212" rx="24" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    <rect x="510" y="248" width="258" height="212" rx="24" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    <rect x="848" y="248" width="258" height="212" rx="24" fill="${palette.pillFill}" stroke="${palette.pillStroke}" stroke-width="2"/>
    ${textLines(301, 286, ["spectra"], 24, palette.title, { anchor: "middle", weight: 700 })}
    ${textLines(639, 286, ["photoelectric"], 24, palette.title, { anchor: "middle", weight: 700 })}
    ${textLines(977, 286, ["matter waves"], 24, palette.title, { anchor: "middle", weight: 700 })}
    ${["#f87171", "#facc15", "#38bdf8", "#c084fc"]
      .map((color, index) => `<line x1="${250 + index * 22}" y1="326" x2="${250 + index * 22}" y2="420" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`)
      .join("")}
    <rect x="594" y="332" width="70" height="92" rx="18" fill="#334155" stroke="${palette.accentSoft}" stroke-width="2"/>
    ${arrow(564, 362, 584, 362, palette.accentThird, 6)}
    ${arrow(672, 356, 736, 332, palette.accentAlt, 6)}
    <rect x="930" y="316" width="22" height="112" rx="11" fill="${palette.panelStroke}"/>
    <rect x="924" y="344" width="34" height="14" fill="${palette.panelFill}"/>
    <rect x="924" y="388" width="34" height="14" fill="${palette.panelFill}"/>
    ${[1004, 1032, 1060, 1088]
      .map((x, index) => circle(x, 344 + index * 22, index % 2 === 0 ? 5.5 : 7, palette.accentAlt))
      .join("")}
    ${textLines(640, 492, ["three experiments,", "one quantum model"], 24, palette.labelText, { anchor: "middle", weight: 700, lineHeight: 28 })}
  `;
}

function progressiveSuperpositionDiagram(palette: Palette): string {
  return `
    <path d="${buildWavePath(190, 290, 700, 2.2, 26, 0)}" fill="none" stroke="${palette.accent}" stroke-width="5"/>
    <path d="${buildWavePath(190, 372, 700, 2.2, 26, Math.PI / 2)}" fill="none" stroke="${palette.accentAlt}" stroke-width="5"/>
    <path d="${buildWavePath(190, 464, 700, 2.2, 46, Math.PI / 4)}" fill="none" stroke="${palette.accentThird}" stroke-width="6"/>
    ${textLines(930, 284, ["wave 1"], 20, palette.accentSoft)}
    ${textLines(930, 366, ["wave 2"], 20, palette.accentAltSoft)}
    ${textLines(930, 458, ["sum"], 20, "#fde68a")}
    ${textLines(238, 520, ["same place + same time"], 24, palette.labelText)}
  `;
}

function stationaryWaveDiagram(palette: Palette): string {
  return `
    <line x1="180" y1="360" x2="1100" y2="360" stroke="${palette.guide}" stroke-width="2" stroke-dasharray="10 8"/>
    <path d="${buildWavePath(200, 360, 860, 3, 78)}" fill="none" stroke="${palette.accent}" stroke-width="6"/>
    ${[200, 344, 488, 632, 776, 920, 1060]
      .map((x) => `${circle(x, 360, 9, palette.accentAlt)}${textLines(x, 392, ["node"], 16, palette.subtitle, { anchor: "middle", weight: 600 })}`)
      .join("")}
    ${textLines(314, 274, ["antinode"], 18, palette.labelText, { anchor: "middle" })}
    ${textLines(640, 520, ["boundary-fit standing pattern"], 24, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function interferenceDiagram(palette: Palette): string {
  return `
    ${circle(240, 360, 22, palette.accent, palette.accentSoft, 3)}
    <path d="M 262 360 Q 420 248 620 302" fill="none" stroke="${palette.accentAlt}" stroke-width="6"/>
    <path d="M 262 360 Q 420 472 620 418" fill="none" stroke="${palette.accent}" stroke-width="6"/>
    <rect x="632" y="286" width="20" height="150" rx="10" fill="${palette.pillStroke}"/>
    <rect x="846" y="248" width="24" height="224" rx="12" fill="${palette.pillStroke}"/>
    ${[286, 322, 356, 390, 424]
      .map((y, index) => `<line x1="884" y1="${y}" x2="1084" y2="${y}" stroke="${index % 2 === 0 ? palette.accentSoft : palette.accentAltSoft}" stroke-width="${index === 2 ? 12 : 8}" stroke-linecap="round"/>`)
      .join("")}
    ${textLines(460, 250, ["path A"], 18, palette.accentAltSoft, { anchor: "middle" })}
    ${textLines(460, 480, ["path B"], 18, palette.accentSoft, { anchor: "middle" })}
    ${textLines(972, 514, ["bright / dark fringes"], 24, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function diffractionGratingDiagram(palette: Palette): string {
  return `
    ${[432, 448, 464, 480, 496, 512]
      .map((x) => `<line x1="${x}" y1="246" x2="${x}" y2="470" stroke="${palette.pillStroke}" stroke-width="4"/>`)
      .join("")}
    ${arrow(214, 360, 412, 360, palette.accent, 7)}
    ${arrow(522, 360, 860, 226, palette.accentAlt, 6)}
    ${arrow(522, 360, 888, 360, palette.accentThird, 6)}
    ${arrow(522, 360, 860, 494, palette.accentAlt, 6)}
    ${textLines(890, 236, ["m = 1"], 18, palette.accentAltSoft)}
    ${textLines(920, 370, ["m = 0"], 18, "#fde68a")}
    ${textLines(890, 520, ["m = -1"], 18, palette.accentAltSoft)}
    <path d="M 520 360 A 190 190 0 0 1 694 222" fill="none" stroke="${palette.guide}" stroke-width="3" stroke-dasharray="10 8"/>
    ${textLines(654, 258, ["theta"], 18, palette.guide)}
  `;
}

function refractionTirDiagram(palette: Palette): string {
  return `
    <line x1="170" y1="356" x2="1110" y2="356" stroke="${palette.pillStroke}" stroke-width="4"/>
    ${textLines(194, 336, ["lower index"], 20, palette.subtitle)}
    ${textLines(194, 396, ["higher index"], 20, palette.subtitle)}
    <line x1="640" y1="208" x2="640" y2="520" stroke="${palette.guide}" stroke-width="3" stroke-dasharray="12 8"/>
    ${arrow(466, 230, 640, 356, palette.accentAlt, 7)}
    ${arrow(640, 356, 838, 446, palette.accent, 7)}
    ${arrow(640, 356, 868, 356, palette.accentThird, 7)}
    ${arrow(640, 356, 834, 252, palette.accentAltSoft, 7)}
    ${textLines(860, 454, ["refracted"], 19, palette.accentSoft)}
    ${textLines(884, 364, ["critical"], 19, "#fde68a")}
    ${textLines(854, 260, ["TIR"], 19, palette.accentAltSoft)}
  `;
}

function oscilloscopeDiagram(palette: Palette): string {
  return `
    ${Array.from({ length: 8 }, (_, index) => `<line x1="${200 + index * 90}" y1="250" x2="${200 + index * 90}" y2="472" stroke="${palette.pillStroke}" stroke-width="1.5" opacity="0.55"/>`).join("")}
    ${Array.from({ length: 5 }, (_, index) => `<line x1="200" y1="${260 + index * 52}" x2="1010" y2="${260 + index * 52}" stroke="${palette.pillStroke}" stroke-width="1.5" opacity="0.55"/>`).join("")}
    <path d="${buildWavePath(220, 366, 760, 2.4, 68)}" fill="none" stroke="${palette.accent}" stroke-width="6"/>
    ${arrow(914, 236, 914, 298, palette.accentAlt, 5)}
    ${textLines(928, 274, ["amplitude"], 18, palette.accentAltSoft)}
    <line x1="358" y1="450" x2="652" y2="450" stroke="${palette.accentThird}" stroke-width="4"/>
    ${textLines(506, 480, ["one period"], 18, "#fde68a", { anchor: "middle" })}
    ${textLines(1024, 486, ["time axis"], 18, palette.subtitle)}
  `;
}

function vectorEquilibriumDiagram(palette: Palette): string {
  return `
    <line x1="246" y1="460" x2="246" y2="246" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="246" y1="460" x2="560" y2="460" stroke="${palette.guide}" stroke-width="3"/>
    ${arrow(246, 460, 520, 270, palette.accentAlt, 8)}
    ${arrow(246, 460, 520, 460, palette.accent, 7)}
    ${arrow(520, 460, 520, 270, palette.accentThird, 7)}
    <line x1="520" y1="270" x2="520" y2="460" stroke="${palette.pillStroke}" stroke-width="3" stroke-dasharray="10 8"/>
    <line x1="246" y1="270" x2="520" y2="270" stroke="${palette.pillStroke}" stroke-width="3" stroke-dasharray="10 8"/>
    ${textLines(380, 250, ["vertical component"], 18, "#fde68a", { anchor: "middle" })}
    ${textLines(384, 492, ["horizontal component"], 18, palette.accentSoft, { anchor: "middle" })}
    ${textLines(542, 256, ["full force"], 18, palette.accentAltSoft)}
  `;
}

function kinematicsMapDiagram(palette: Palette): string {
  return `
    <line x1="252" y1="472" x2="1022" y2="472" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="252" y1="472" x2="252" y2="228" stroke="${palette.guide}" stroke-width="3"/>
    ${circle(462, 344, 18, palette.accentAlt, palette.accentAltSoft, 3)}
    ${arrow(462, 344, 648, 344, palette.accent, 7)}
    ${arrow(462, 344, 462, 454, palette.accentThird, 7)}
    <path d="M 340 416 Q 510 280 688 320" fill="none" stroke="${palette.accentAltSoft}" stroke-width="5" stroke-dasharray="12 10"/>
    ${textLines(672, 336, ["velocity x"], 18, palette.accentSoft)}
    ${textLines(480, 454, ["acceleration y"], 18, "#fde68a")}
    ${textLines(718, 288, ["same motion,", "separate components"], 21, palette.labelText, { lineHeight: 24 })}
  `;
}

function projectileDiagram(palette: Palette): string {
  return `
    <line x1="190" y1="468" x2="1088" y2="468" stroke="${palette.guide}" stroke-width="3"/>
    <path d="M 274 436 Q 526 176 914 436" fill="none" stroke="${palette.accentAlt}" stroke-width="6"/>
    ${arrow(274, 436, 394, 352, palette.accentAlt, 7)}
    ${arrow(274, 436, 420, 436, palette.accent, 6)}
    ${arrow(394, 352, 394, 454, palette.accentThird, 6)}
    ${arrow(882, 248, 882, 340, palette.accentThird, 6)}
    ${textLines(438, 444, ["vx"], 18, palette.accentSoft)}
    ${textLines(408, 350, ["vy"], 18, palette.accentAltSoft)}
    ${textLines(900, 346, ["g"], 18, "#fde68a")}
    ${textLines(676, 490, ["horizontal and vertical", "share the same time"], 22, palette.labelText, { anchor: "middle", weight: 700, lineHeight: 26 })}
  `;
}

function momentumCollisionDiagram(palette: Palette): string {
  return `
    <rect x="210" y="286" width="108" height="84" rx="20" fill="${palette.accentAlt}" fill-opacity="0.9"/>
    <rect x="360" y="306" width="146" height="64" rx="20" fill="${palette.accent}" fill-opacity="0.9"/>
    ${arrow(184, 328, 204, 328, palette.accentAlt, 5)}
    ${arrow(330, 338, 352, 338, palette.accent, 5)}
    ${textLines(360, 256, ["before"], 24, palette.title, { anchor: "middle", weight: 700 })}
    <rect x="724" y="298" width="236" height="84" rx="22" fill="${palette.accentThird}" fill-opacity="0.92"/>
    ${arrow(964, 340, 1038, 340, palette.accentThird, 5)}
    ${textLines(842, 256, ["after"], 24, palette.title, { anchor: "middle", weight: 700 })}
    <line x1="606" y1="232" x2="606" y2="472" stroke="${palette.guide}" stroke-width="3" stroke-dasharray="12 8"/>
    ${textLines(606, 214, ["system check"], 18, palette.guide, { anchor: "middle" })}
    ${textLines(640, 500, ["total momentum first"], 24, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function circularMotionDiagram(palette: Palette): string {
  return `
    <circle cx="522" cy="364" r="144" fill="none" stroke="${palette.accentAlt}" stroke-width="6"/>
    ${circle(664, 364, 16, palette.accentThird, palette.accentAltSoft, 3)}
    ${arrow(664, 364, 664, 238, palette.accent, 7)}
    ${arrow(664, 364, 542, 364, palette.accentAlt, 7)}
    ${textLines(680, 244, ["tangent v"], 18, palette.accentSoft)}
    ${textLines(560, 340, ["ac inward"], 18, palette.accentAltSoft)}
    ${textLines(410, 526, ["direction keeps changing"], 22, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function materialsDiagram(palette: Palette): string {
  return `
    <rect x="236" y="264" width="78" height="182" rx="24" fill="${palette.accentAlt}" fill-opacity="0.85"/>
    <rect x="388" y="264" width="146" height="182" rx="24" fill="${palette.accentAlt}" fill-opacity="0.48"/>
    ${arrow(274, 214, 274, 252, palette.accent, 6)}
    ${arrow(460, 214, 460, 252, palette.accent, 6)}
    ${textLines(274, 206, ["same force"], 18, palette.accentSoft, { anchor: "middle" })}
    <line x1="694" y1="252" x2="694" y2="470" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="886" y1="280" x2="886" y2="470" stroke="${palette.guide}" stroke-width="3"/>
    <rect x="658" y="280" width="72" height="170" rx="22" fill="${palette.accentThird}" fill-opacity="0.84"/>
    <rect x="850" y="280" width="72" height="112" rx="22" fill="${palette.accent}" fill-opacity="0.84"/>
    ${textLines(274, 486, ["area changes stress"], 19, palette.labelText, { anchor: "middle" })}
    ${textLines(790, 490, ["extension /", "original length"], 19, palette.labelText, { anchor: "middle", lineHeight: 22 })}
  `;
}

function oscillationBasicsDiagram(palette: Palette): string {
  return `
    <line x1="210" y1="362" x2="1066" y2="362" stroke="${palette.guide}" stroke-width="3" stroke-dasharray="10 8"/>
    <rect x="270" y="320" width="156" height="82" rx="24" fill="${palette.accentAlt}" fill-opacity="0.92"/>
    ${arrow(426, 360, 582, 360, palette.accent, 7)}
    ${arrow(814, 360, 658, 360, palette.accent, 7)}
    <line x1="582" y1="286" x2="582" y2="438" stroke="${palette.accentThird}" stroke-width="4"/>
    <line x1="426" y1="432" x2="582" y2="432" stroke="${palette.accentThird}" stroke-width="4"/>
    ${textLines(504, 456, ["amplitude"], 19, "#fde68a", { anchor: "middle" })}
    ${textLines(582, 332, ["equilibrium"], 19, palette.labelText, { anchor: "middle" })}
    ${textLines(716, 326, ["restoring pull"], 19, palette.accentSoft)}
  `;
}

function shmDiagram(palette: Palette): string {
  return `
    <line x1="224" y1="470" x2="1028" y2="470" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="626" y1="222" x2="626" y2="510" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="306" y1="440" x2="946" y2="250" stroke="${palette.accentAlt}" stroke-width="6"/>
    ${textLines(964, 252, ["a"], 22, palette.accentAltSoft)}
    ${textLines(1016, 494, ["x"], 22, palette.subtitle)}
    ${textLines(392, 276, ["a = - omega^2 x"], 24, palette.labelText)}
    ${textLines(642, 524, ["farther out ->", "stronger return"], 23, palette.labelText, { anchor: "middle", weight: 700, lineHeight: 27 })}
  `;
}

function shmTracesDiagram(palette: Palette): string {
  return `
    <path d="${buildWavePath(220, 286, 760, 2.1, 42)}" fill="none" stroke="${palette.accent}" stroke-width="5"/>
    <path d="${buildWavePath(220, 366, 760, 2.1, 42, Math.PI / 2)}" fill="none" stroke="${palette.accentAlt}" stroke-width="5"/>
    <path d="${buildWavePath(220, 446, 760, 2.1, 42, Math.PI)}" fill="none" stroke="${palette.accentThird}" stroke-width="5"/>
    ${textLines(1000, 292, ["x"], 20, palette.accentSoft)}
    ${textLines(1000, 372, ["v"], 20, palette.accentAltSoft)}
    ${textLines(1000, 452, ["a"], 20, "#fde68a")}
    ${textLines(642, 504, ["same oscillation, three linked traces"], 24, palette.labelText, { anchor: "middle", weight: 700 })}
  `;
}

function shmEnergyDiagram(palette: Palette): string {
  return `
    <line x1="230" y1="420" x2="1018" y2="420" stroke="${palette.guide}" stroke-width="3"/>
    <rect x="286" y="292" width="70" height="128" rx="20" fill="${palette.accentThird}" fill-opacity="0.92"/>
    <rect x="370" y="374" width="70" height="46" rx="20" fill="${palette.accent}" fill-opacity="0.92"/>
    <rect x="600" y="298" width="70" height="122" rx="20" fill="${palette.accent}" fill-opacity="0.92"/>
    <rect x="684" y="366" width="70" height="54" rx="20" fill="${palette.accentThird}" fill-opacity="0.92"/>
    ${textLines(362, 446, ["edge"], 18, palette.subtitle, { anchor: "middle" })}
    ${textLines(676, 446, ["center"], 18, palette.subtitle, { anchor: "middle" })}
    ${textLines(320, 276, ["PE"], 18, "#fde68a", { anchor: "middle" })}
    ${textLines(404, 360, ["KE"], 18, palette.accentSoft, { anchor: "middle" })}
    ${textLines(634, 282, ["KE"], 18, palette.accentSoft, { anchor: "middle" })}
    ${textLines(718, 352, ["PE"], 18, "#fde68a", { anchor: "middle" })}
    <line x1="872" y1="240" x2="872" y2="420" stroke="${palette.accentAlt}" stroke-width="8"/>
    ${textLines(872, 226, ["total"], 18, palette.accentAltSoft, { anchor: "middle" })}
  `;
}

function resonanceDiagram(palette: Palette): string {
  const points = [
    "M 240 448",
    "C 350 442 470 430 560 384",
    "C 626 348 676 272 722 248",
    "C 764 228 824 250 856 306",
    "C 904 388 984 430 1048 438",
  ].join(" ");
  return `
    <line x1="232" y1="448" x2="1058" y2="448" stroke="${palette.guide}" stroke-width="3"/>
    <line x1="248" y1="470" x2="248" y2="232" stroke="${palette.guide}" stroke-width="3"/>
    <path d="${points}" fill="none" stroke="${palette.accent}" stroke-width="7"/>
    <line x1="720" y1="448" x2="720" y2="248" stroke="${palette.accentThird}" stroke-width="4" stroke-dasharray="12 8"/>
    ${textLines(720, 230, ["natural f"], 18, "#fde68a", { anchor: "middle" })}
    ${textLines(848, 504, ["driving frequency"], 19, palette.subtitle, { anchor: "middle" })}
    ${textLines(206, 244, ["response"], 19, palette.subtitle)}
  `;
}

function dampingDiagram(palette: Palette): string {
  return `
    <line x1="220" y1="392" x2="1040" y2="392" stroke="${palette.guide}" stroke-width="2" stroke-dasharray="10 8"/>
    <path d="${buildWavePath(236, 330, 250, 2.2, 72, 0, 88, 1.8)}" fill="none" stroke="${palette.accent}" stroke-width="5"/>
    <path d="M 540 280 C 610 300 658 338 722 392 C 782 444 820 450 864 392" fill="none" stroke="${palette.accentThird}" stroke-width="5"/>
    <path d="M 850 280 C 924 300 980 334 1040 392" fill="none" stroke="${palette.accentAlt}" stroke-width="5"/>
    ${textLines(330, 476, ["under"], 18, palette.accentSoft, { anchor: "middle" })}
    ${textLines(702, 476, ["critical"], 18, "#fde68a", { anchor: "middle" })}
    ${textLines(948, 476, ["over"], 18, palette.accentAltSoft, { anchor: "middle" })}
  `;
}

const ADVANCED_VISUALS: Record<string, ConceptVisualConfig> = {
  A2_L1: {
    title: "Energy ladder",
    subtitle: "Allowed floors and exact packet jumps only",
    footer: "Discrete levels, not a continuous ramp",
    palette: MODULE_PALETTES.A2,
    diagram: () => quantumLadderDiagram(MODULE_PALETTES.A2),
  },
  A2_L2: {
    title: "Spectrum barcode",
    subtitle: "The same energy gaps reappear as line patterns",
    footer: "Emission and absorption both trace the allowed gaps",
    palette: MODULE_PALETTES.A2,
    diagram: () => spectralBarcodeDiagram(MODULE_PALETTES.A2),
  },
  A2_L3: {
    title: "Photoelectric threshold",
    subtitle: "Frequency decides whether emission is possible",
    footer: "Brightness is not enough below threshold",
    palette: MODULE_PALETTES.A2,
    diagram: () => photoelectricThresholdDiagram(MODULE_PALETTES.A2),
  },
  A2_L4: {
    title: "Excitation and ionisation",
    subtitle: "Bound-state jumps are not the same as full escape",
    footer: "Ionisation sits above the bound ladder",
    palette: MODULE_PALETTES.A2,
    diagram: () => excitationIonisationDiagram(MODULE_PALETTES.A2),
  },
  A2_L5: {
    title: "Matter-wave evidence",
    subtitle: "Single hits can still build a diffraction pattern",
    footer: "Localized detections and wave patterns belong together",
    palette: MODULE_PALETTES.A2,
    diagram: () => deBroglieDiagram(MODULE_PALETTES.A2),
  },
  A2_L6: {
    title: "Quantum evidence board",
    subtitle: "Several experiments point to one packet-and-level model",
    footer: "Spectra, thresholds, and matter waves support one story",
    palette: MODULE_PALETTES.A2,
    diagram: () => quantumEvidenceDiagram(MODULE_PALETTES.A2),
  },
  A3_L1: {
    title: "Wave superposition",
    subtitle: "Add displacements where the waves overlap",
    footer: "Phase decides reinforcement or cancellation",
    palette: MODULE_PALETTES.A3,
    diagram: () => progressiveSuperpositionDiagram(MODULE_PALETTES.A3),
  },
  A3_L2: {
    title: "Standing-wave pattern",
    subtitle: "Nodes stay fixed while antinodes oscillate",
    footer: "Only boundary-fitting harmonics survive cleanly",
    palette: MODULE_PALETTES.A3,
    diagram: () => stationaryWaveDiagram(MODULE_PALETTES.A3),
  },
  A3_L3: {
    title: "Interference routes",
    subtitle: "Path difference becomes a bright-or-dark phase story",
    footer: "Compare both routes before reading the fringe",
    palette: MODULE_PALETTES.A3,
    diagram: () => interferenceDiagram(MODULE_PALETTES.A3),
  },
  A3_L4: {
    title: "Diffraction grating orders",
    subtitle: "Wavelength and spacing set the allowed angles",
    footer: "Orders are discrete directions, not a blur",
    palette: MODULE_PALETTES.A3,
    diagram: () => diffractionGratingDiagram(MODULE_PALETTES.A3),
  },
  A3_L5: {
    title: "Refraction and TIR",
    subtitle: "Critical angle is the last escape before full reflection",
    footer: "Keep the boundary-speed story visible",
    palette: MODULE_PALETTES.A3,
    diagram: () => refractionTirDiagram(MODULE_PALETTES.A3),
  },
  A3_L6: {
    title: "Oscilloscope trace",
    subtitle: "Read the graph as amplitude against time",
    footer: "The trace is a time graph, not the wave path in space",
    palette: MODULE_PALETTES.A3,
    diagram: () => oscilloscopeDiagram(MODULE_PALETTES.A3),
  },
  A4_L1: {
    title: "Vector balance check",
    subtitle: "Resolve the diagonal force before judging equilibrium",
    footer: "Zero resultant has to be checked on shared axes",
    palette: MODULE_PALETTES.A4,
    diagram: () => vectorEquilibriumDiagram(MODULE_PALETTES.A4),
  },
  A4_L2: {
    title: "Component motion map",
    subtitle: "Position, velocity, and acceleration need separate stories",
    footer: "One zero component does not erase the other",
    palette: MODULE_PALETTES.A4,
    diagram: () => kinematicsMapDiagram(MODULE_PALETTES.A4),
  },
  A4_L3: {
    title: "Projectile split",
    subtitle: "Horizontal and vertical motion share one clock",
    footer: "Solve the components before rebuilding the path",
    palette: MODULE_PALETTES.A4,
    diagram: () => projectileDiagram(MODULE_PALETTES.A4),
  },
  A4_L4: {
    title: "Momentum ledger",
    subtitle: "Before-and-after totals come before collision labels",
    footer: "Momentum is the first safe collision check",
    palette: MODULE_PALETTES.A4,
    diagram: () => momentumCollisionDiagram(MODULE_PALETTES.A4),
  },
  A4_L5: {
    title: "Circular turning",
    subtitle: "Constant speed still needs inward acceleration",
    footer: "Changing direction means acceleration is present",
    palette: MODULE_PALETTES.A4,
    diagram: () => circularMotionDiagram(MODULE_PALETTES.A4),
  },
  A4_L6: {
    title: "Materials response",
    subtitle: "Load, area, and extension must stay on one board",
    footer: "Stress and strain are stronger than force-only comparison",
    palette: MODULE_PALETTES.A4,
    diagram: () => materialsDiagram(MODULE_PALETTES.A4),
  },
  A5_L1: {
    title: "Oscillation about equilibrium",
    subtitle: "Repeated motion needs a restoring tendency toward center",
    footer: "Amplitude is the maximum displacement from equilibrium",
    palette: MODULE_PALETTES.A5,
    diagram: () => oscillationBasicsDiagram(MODULE_PALETTES.A5),
  },
  A5_L2: {
    title: "SHM rule",
    subtitle: "The restoring acceleration grows with displacement size",
    footer: "SHM is the special proportional-return case",
    palette: MODULE_PALETTES.A5,
    diagram: () => shmDiagram(MODULE_PALETTES.A5),
  },
  A5_L3: {
    title: "Linked SHM traces",
    subtitle: "Displacement, velocity, and acceleration stay phase-linked",
    footer: "Graphs and equations are views of one oscillation",
    palette: MODULE_PALETTES.A5,
    diagram: () => shmTracesDiagram(MODULE_PALETTES.A5),
  },
  A5_L4: {
    title: "Energy swap in SHM",
    subtitle: "Kinetic and potential energy trade roles through the cycle",
    footer: "In the ideal model the total stays constant",
    palette: MODULE_PALETTES.A5,
    diagram: () => shmEnergyDiagram(MODULE_PALETTES.A5),
  },
  A5_L5: {
    title: "Resonance peak",
    subtitle: "The strongest response appears near natural-frequency match",
    footer: "Damping changes the shape of the response peak",
    palette: MODULE_PALETTES.A5,
    diagram: () => resonanceDiagram(MODULE_PALETTES.A5),
  },
  A5_L6: {
    title: "Damping responses",
    subtitle: "Underdamped, critical, and overdamped returns are distinct",
    footer: "Choose the settling style to match the application",
    palette: MODULE_PALETTES.A5,
    diagram: () => dampingDiagram(MODULE_PALETTES.A5),
  },
};

export function advancedConceptVisual(key: string): string {
  const config = ADVANCED_VISUALS[key];
  return config ? renderFrame(key, config) : "";
}
