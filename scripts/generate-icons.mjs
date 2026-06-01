import sharp from "sharp";
import { mkdirSync } from "fs";

const BG = "#0a0a0b";
const GREEN = "#1B9E5B";

function makeSVG(size) {
  const fontSize = Math.round(size * 0.32);
  const subtitleSize = Math.round(size * 0.09);
  const ballSize = Math.round(size * 0.06);
  const cy = Math.round(size * 0.48);
  const subY = Math.round(size * 0.68);
  const ballY = Math.round(size * 0.28);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}" rx="${Math.round(size * 0.15)}"/>
  <circle cx="${size / 2}" cy="${ballY}" r="${ballSize}" fill="${GREEN}" opacity="0.8"/>
  <text x="${size / 2}" y="${cy}" text-anchor="middle" dominant-baseline="central"
    font-family="system-ui,sans-serif" font-weight="700" font-size="${fontSize}" fill="#fafafa" letter-spacing="-0.02em">PM</text>
  <text x="${size / 2}" y="${subY}" text-anchor="middle"
    font-family="system-ui,sans-serif" font-weight="600" font-size="${subtitleSize}" fill="${GREEN}">2026</text>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  const svg = Buffer.from(makeSVG(size));
  await sharp(svg).png().toFile(`public/icons/icon-${size}.png`);
  console.log(`✓ icon-${size}.png`);
}

console.log("Done.");
