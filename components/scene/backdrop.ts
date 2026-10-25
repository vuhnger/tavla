import { CLOUD_CELL } from '@/lib/constants/scene';
import { cloudiness, isCloud } from '@/lib/weather/cloud';

export const WIDTH = 320;
export const HEIGHT = 180;
export const GROUND = 126;
export const LAMP_X = 240;

export interface Look {
  light: number;
  cloud: number;
  wet: boolean;
  snowRoofs: boolean;
  month: number;
  lampX?: number;
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
export const bayer = (x: number, y: number) => (BAYER[y & 3][x & 3] + 0.5) / 16;
export const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (night: string, day: string, t: number) => {
  const a = rgb(night);
  const b = rgb(day);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};

const SKY = {
  clear: { night: ['#060818', '#0a0e26', '#0f1533', '#161c40'], day: ['#2f5684', '#3b6697', '#4a77a8', '#5b86b5'] },
  overcast: { night: ['#0c0e1a', '#101321', '#151829', '#1a1d30'], day: ['#4d545f', '#58606b', '#636b76', '#6e7681'] },
};
const CLOUD = {
  day: { lit: '#e6eaf0', shade: '#c3cad6' },
  night: { lit: '#2a3152', shade: '#1f2542' },
  stormDay: { lit: '#646b76', shade: '#535a64' },
  stormNight: { lit: '#1b1e30', shade: '#12141f' },
};
const GLOW = '#7c4f63';
const LIT = ['#e9b860', '#cf9447', '#f0cf8a'];

const LEAVES: Record<number, string | null> = {
  0: null, 1: null, 2: null, 3: '#7d8f4c', 4: '#56743c', 5: '#4c6b3a', 6: '#4c6b3a', 7: '#4f6a38',
  8: '#6f7338', 9: '#b08a3a', 10: '#7a5a35', 11: null,
};

type Ctx = CanvasRenderingContext2D;

const fill = (ctx: Ctx, color: string, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

const lerpHex = (a: string, b: string, t: number) =>
  `#${rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;

const noise = (x: number, y: number) => {
  const fx = x / CLOUD_CELL.x;
  const fy = y / CLOUD_CELL.y;
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const u = fx - i;
  const v = fy - j;
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  const top = hash(i, j) + (hash(i + 1, j) - hash(i, j)) * su;
  const bottom = hash(i, j + 1) + (hash(i + 1, j + 1) - hash(i, j + 1)) * su;
  return top + (bottom - top) * sv;
};

const cloudNoise = (x: number, y: number) => 0.65 * noise(x, y) + 0.35 * noise(x * 2.3 + 40, y * 2.3 + 17);

function drawSky(ctx: Ctx, look: Look) {
  const dark = cloudiness(look.cloud);
  const stops = SKY.clear.night.map((night, i) =>
    mix(lerpHex(night, SKY.overcast.night[i], dark), lerpHex(SKY.clear.day[i], SKY.overcast.day[i], dark), look.light),
  );
  const glow = (1 - Math.abs(look.light - 0.5) * 2) * (0.3 - 0.18 * dark);
  for (let y = 0; y < GROUND; y++) {
    const t = y / GROUND;
    for (let x = 0; x < WIDTH; x++) {
      const i = Math.max(0, Math.min(stops.length - 1, Math.round(t * (stops.length - 1) + bayer(x, y) - 0.5)));
      const warm = glow > 0 && t > 0.7 && bayer(x, y) < glow * (t - 0.7) * 3;
      fill(ctx, warm ? GLOW : stops[i], x, y, 1, 1);
    }
  }
  if (look.light < 0.35) {
    ctx.globalAlpha = ((0.35 - look.light) / 0.35) * (1 - dark);
    for (let i = 0; i < 40; i++) fill(ctx, '#c9d2f0', Math.floor(hash(i, 9) * WIDTH), Math.floor(hash(i, 4) * 50), 1, 1);
    ctx.globalAlpha = 1;
  }
  if (look.cloud <= 0) return;
  const lit = mix(lerpHex(CLOUD.night.lit, CLOUD.stormNight.lit, dark), lerpHex(CLOUD.day.lit, CLOUD.stormDay.lit, dark), look.light);
  const shade = mix(lerpHex(CLOUD.night.shade, CLOUD.stormNight.shade, dark), lerpHex(CLOUD.day.shade, CLOUD.stormDay.shade, dark), look.light);
  for (let y = 0; y < GROUND; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const n = cloudNoise(x, y);
      if (isCloud(n, bayer(x, y), look.cloud)) fill(ctx, n < (look.cloud / 100) * 0.6 ? lit : shade, x, y, 1, 1);
    }
  }
}

function drawCrown(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string) {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d < 1 && bayer(x, y) > d * 0.7) fill(ctx, color, x, y, 1, 1);
    }
  }
}

function drawSpruce(ctx: Ctx, x: number, base: number, height: number, color: string) {
  for (let y = 0; y < height; y++) {
    const half = Math.floor((y / height) * height * 0.28);
    fill(ctx, color, x - half, base - height + y, half * 2 + 1, 1);
  }
}

function drawWoods(ctx: Ctx, look: Look) {
  const spruce = mix('#0a0f20', '#2b3d33', look.light);
  for (let x = 0; x < WIDTH; x++) {
    const top = Math.round(70 + 7 * Math.sin(x / 46) + 3 * Math.sin(x / 15 + 2));
    fill(ctx, spruce, x, top, 1, GROUND - top);
  }
  for (let i = 0; i < 64; i++) {
    const x = Math.floor(hash(i, 21) * WIDTH);
    const top = Math.round(70 + 7 * Math.sin(x / 46) + 3 * Math.sin(x / 15 + 2));
    drawSpruce(ctx, x, top + 4, 6 + Math.floor(hash(i, 22) * 8), spruce);
  }
}

function drawWindow(ctx: Ctx, look: Look, x: number, y: number, w: number, h: number) {
  const seed = hash(x, y);
  const lit = look.light < 0.5 && seed > 0.8;
  fill(ctx, lit ? LIT[Math.floor(hash(y, x) * LIT.length)] : mix('#0c0f1e', '#38404c', look.light), x, y, w, h);
}

function drawRoofEdge(ctx: Ctx, look: Look, x: number, y: number, w: number) {
  fill(ctx, look.snowRoofs ? mix('#3a4060', '#c9cfd8', look.light) : mix('#05060f', '#3d3833', look.light), x, y, w, 1);
}

function drawBrickBlock(ctx: Ctx, look: Look, x0: number, x1: number, roof: number) {
  const brick = mix('#16141e', '#86705d', look.light);
  const mortar = mix('#131119', '#7a6553', look.light);
  for (let y = roof; y < GROUND; y++) fill(ctx, y % 3 === 0 ? mortar : brick, x0, y, x1 - x0, 1);
  drawRoofEdge(ctx, look, x0, roof, x1 - x0);
  const rail = mix('#05060c', '#1d1e23', look.light);
  for (let y = roof + 4; y < GROUND - 6; y += 8) {
    for (let x = x0 + 3, col = 0; x < x1 - 5; x += 9, col++) {
      drawWindow(ctx, look, x, y, 5, 5);
      if (col % 3 === 2) fill(ctx, rail, x - 2, y + 3, 9, 3);
    }
  }
}

function drawTower(ctx: Ctx, look: Look, x0: number, x1: number, roof: number) {
  const face = mix('#181c2a', '#7e8478', look.light);
  const frame = mix('#222737', '#979d90', look.light);
  const recess = mix('#0b0d16', '#2e2b28', look.light);
  const wood = mix('#1a1512', '#8a6142', look.light);
  fill(ctx, face, x0, roof, x1 - x0, GROUND - roof);
  drawRoofEdge(ctx, look, x0, roof, x1 - x0);
  for (let y = roof + 3, floor = 0; y < GROUND - 6; y += 8, floor++) {
    for (let x = x0 + 4; x < x1 - 4; x += 7) if (hash(x, floor) > 0.35) drawWindow(ctx, look, x, y + 1, 3, 4);
    const left = floor % 2 === 0;
    const bx = left ? x0 - 3 : x1 - 9;
    fill(ctx, frame, bx, y - 1, 12, 7);
    fill(ctx, recess, bx + 1, y, 10, 5);
    fill(ctx, wood, left ? bx + 1 : bx + 10, y, 1, 5);
    if (look.light < 0.5 && hash(bx, y) > 0.6) fill(ctx, LIT[0], bx + 3, y + 1, 5, 3);
  }
}

function drawGround(ctx: Ctx, look: Look) {
  const grassDay = LEAVES[look.month] ? '#4d5b36' : '#55574a';
  const grass = look.snowRoofs ? mix('#2a3050', '#b9bfc8', look.light) : mix('#0d1222', grassDay, look.light);
  fill(ctx, grass, 0, GROUND, WIDTH, HEIGHT - GROUND);
  const damp = look.wet ? 0.82 : 1;
  const paver = mix('#161a2c', '#6c6e72', look.light * damp);
  const joint = mix('#121527', '#5f6165', look.light * damp);
  for (let y = GROUND; y < HEIGHT; y++) {
    const t = (y - GROUND) / (HEIGHT - GROUND);
    const left = Math.round(182 - 60 * t);
    const right = Math.round(262 + 58 * t);
    for (let x = left; x < right; x++) fill(ctx, (x + (y >> 1)) % 4 === 0 || y % 3 === 0 ? joint : paver, x, y, 1, 1);
  }
}

function drawLamp(ctx: Ctx, look: Look) {
  const x = look.lampX ?? LAMP_X;
  const lit = look.light < 0.55;
  fill(ctx, mix('#05071a', '#2c2f36', look.light), x, 56, 2, GROUND + 18 - 56);
  fill(ctx, mix('#05071a', '#2c2f36', look.light), x - 8, 55, 10, 2);
  fill(ctx, lit ? '#fff0c8' : '#9aa0a8', x - 7, 57, 6, 1);
  if (!lit) return;
  const strength = (0.55 - look.light) / 0.55;
  const cx = x - 4;
  for (let y = 58; y < GROUND + 22; y++) {
    const half = (y - 58) * 0.36;
    for (let px = Math.floor(cx - half); px <= cx + half; px++) {
      if (bayer(px, y) < (0.08 * (1 - (y - 58) / 120) + 0.01) * strength) fill(ctx, 'rgba(255,236,190,0.18)', px, y, 1, 1);
    }
  }
}

export function drawBackdrop(look: Look): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;
  drawSky(ctx, look);
  drawWoods(ctx, look);
  drawTower(ctx, look, 284, 334, 64);
  drawBrickBlock(ctx, look, -4, 104, 56);
  drawTower(ctx, look, 206, 258, 50);
  const leaves = LEAVES[look.month];
  drawSpruce(ctx, 118, GROUND + 2, 30, mix('#0a0f20', '#26372d', look.light));
  if (leaves) drawCrown(ctx, 136, 100, 9, 12, mix('#121427', leaves, look.light * 0.85));
  fill(ctx, mix('#0e0f18', '#d9d4c6', look.light), 136, 104, 1, GROUND - 104);
  drawGround(ctx, look);
  drawLamp(ctx, look);
  return canvas;
}
