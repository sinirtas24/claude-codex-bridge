import sharp from "sharp";
import type { ThumbnailConcept } from "./types";

const WIDTH = 1280;
const HEIGHT = 720;

export function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[char] as string);
}

export function wrapTitle(title: string, maxChars = 13) {
  const words = title.toLocaleUpperCase("tr-TR").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars && lines.length < 2) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function overlaySvg(concept: ThumbnailConcept) {
  const lines = wrapTitle(concept.title);
  const titleOnLeft = concept.composition !== "subject-left";
  const x = titleOnLeft ? 68 : 1212;
  const anchor = titleOnLeft ? "start" : "end";
  const fontSize = lines.some((line) => line.length > 14) ? 72 : 82;
  const startY = 240 - (lines.length - 1) * 36;
  const accent = /^#[0-9a-f]{6}$/i.test(concept.accentColor) ? concept.accentColor : "#ffbd2e";

  const text = lines.map((line, index) => {
    const fill = index === Math.min(1, lines.length - 1) ? accent : "#ffffff";
    return `<text x="${x}" y="${startY + index * (fontSize + 7)}" text-anchor="${anchor}" fill="${fill}" stroke="#08090b" stroke-width="13" paint-order="stroke" stroke-linejoin="round">${escapeXml(line)}</text>`;
  }).join("");

  const badgeX = titleOnLeft ? 68 : 960;
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" x2="1">
          <stop offset="0" stop-color="#000" stop-opacity="${titleOnLeft ? ".72" : ".02"}"/>
          <stop offset=".52" stop-color="#000" stop-opacity=".08"/>
          <stop offset="1" stop-color="#000" stop-opacity="${titleOnLeft ? ".02" : ".72"}"/>
        </linearGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-opacity=".65"/></filter>
      </defs>
      <rect width="1280" height="720" fill="url(#shade)"/>
      <g font-family="Arial Black, DejaVu Sans" font-weight="900" font-size="${fontSize}" letter-spacing="-2" filter="url(#shadow)">${text}</g>
      <rect x="${badgeX}" y="535" width="252" height="6" rx="3" fill="${accent}"/>
      <text x="${titleOnLeft ? 68 : 1212}" y="585" text-anchor="${anchor}" fill="#f4f4f5" font-family="Arial, DejaVu Sans" font-weight="700" font-size="24" letter-spacing="2">${escapeXml(concept.hook.toLocaleUpperCase("tr-TR").slice(0, 34))}</text>
    </svg>
  `);
}

export async function finalizeThumbnail(imageBuffer: Buffer, concept: ThumbnailConcept) {
  return sharp(imageBuffer)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .composite([{ input: overlaySvg(concept), top: 0, left: 0 }])
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

export async function createDemoThumbnail(imageBuffer: Buffer, concept: ThumbnailConcept, variant: number) {
  const tint = ["#ff522e", "#08a8d8", "#f0b429"][variant % 3];
  const background = await sharp(imageBuffer)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .blur(18)
    .modulate({ brightness: 0.46, saturation: 1.25 })
    .toBuffer();

  const foregroundWidth = concept.composition === "subject-center" ? 680 : 620;
  const foreground = await sharp(imageBuffer)
    .resize(foregroundWidth, 660, { fit: "cover", position: "attention" })
    .sharpen()
    .toBuffer();
  const left = concept.composition === "subject-left" ? 0 : concept.composition === "subject-right" ? WIDTH - foregroundWidth : Math.round((WIDTH - foregroundWidth) / 2);

  const composed = await sharp(background)
    .composite([
      { input: Buffer.from(`<svg width="1280" height="720"><defs><radialGradient id="g"><stop offset="0" stop-color="${tint}" stop-opacity=".62"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1280" height="720" fill="url(#g)"/></svg>`), top: 0, left: 0 },
      { input: foreground, top: 38, left, blend: "over" },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  return finalizeThumbnail(composed, concept);
}
