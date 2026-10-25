import type { Outfit, Top } from '@/lib/weather/outfit';

export const FIGURE_COLORS: Record<string, string> = {
  k: '#14151f',
  s: '#f1c7a3',
  S: '#d8a37f',
  h: '#e2c172',
  H: '#c4a053',
  e: '#2b2d3a',
  m: '#b97862',
  p: '#3d5679',
  P: '#2e4463',
  d: '#5b739a',
  u: '#e9e7e1',
  U: '#c8c5bd',
  l: '#b4a585',
  L: '#93856a',
  j: '#5a6248',
  J: '#454c37',
  y: '#2b3b5f',
  Y: '#1f2c48',
  w: '#252a3b',
  W: '#191d29',
  g: '#6e4c33',
  G: '#543926',
  o: '#e6e3da',
  O: '#bdb9ae',
  b: '#8a8d95',
  B: '#6f727a',
  f: '#a8865c',
  F: '#8a6b47',
  n: '#4d5058',
  N: '#3b3e45',
  c: '#2a2d36',
  C: '#1d1f26',
  r: '#eaf3ff',
  R: '#a9c4df',
  x: '#c9ced6',
};

const TOP_COLORS: Record<Top, [string, string]> = {
  tshirt: ['u', 'U'],
  light: ['l', 'L'],
  jacket: ['j', 'J'],
  rain: ['y', 'Y'],
  winter: ['w', 'W'],
};

type Hit = (u: number, v: number) => boolean;
type Paint = string | ((u: number) => string);
interface Layer {
  color: Paint;
  hit: Hit;
  shade?: string;
  shadeFrom?: number;
}

const rect = (x0: number, y0: number, x1: number, y1: number): Hit => (u, v) => u >= x0 && u < x1 && v >= y0 && v < y1;
const ell = (cx: number, cy: number, rx: number, ry: number): Hit => (u, v) =>
  ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
const trap = (y0: number, y1: number, a0: number, b0: number, a1: number, b1: number): Hit => (u, v) => {
  if (v < y0 || v >= y1) return false;
  const t = (v - y0) / (y1 - y0);
  return u >= a0 + (a1 - a0) * t && u < b0 + (b1 - b0) * t;
};
const both = (f: Hit, g: Hit): Hit => (u, v) => f(u, v) && g(u, v);

function outfitLayers(o: Outfit): Layer[] {
  const layers: Layer[] = [];
  const add = (color: Paint, hit: Hit, shade?: string, shadeFrom?: number) => layers.push({ color, hit, shade, shadeFrom });
  const [main, dark] = TOP_COLORS[o.top];
  const hood = o.top === 'rain' && !o.umbrella && !o.beanie;

  if (o.umbrella) add('k', rect(23.6, 3, 24.6, 37));
  add('p', rect(10, 38, 15.6, 56));
  add('p', rect(16.4, 38, 22, 56), 'P', 19.5);
  add('d', rect(10, 54.4, 15.6, 56));
  add('d', rect(16.4, 54.4, 22, 56));
  if (o.boots) {
    add('g', rect(9.4, 51, 15.8, 60), 'G', 13.5);
    add('g', rect(16.2, 51, 22.8, 60), 'G', 20.5);
  } else {
    add('o', rect(9.4, 56, 15.8, 60));
    add('o', rect(16.2, 56, 22.8, 60), 'O', 20.5);
  }
  if (o.spikes) for (const x of [10, 12.6, 15, 17, 19.6, 22]) add('x', rect(x, 60, x + 1, 61.4));

  add('s', rect(6.6, 22, 9.6, 37));
  add('s', rect(22.4, 22, 25.4, 37), 'S', 24);
  add(o.mittens ? 'n' : 's', ell(8.1, 37.6, 2, 2));
  add(o.mittens ? 'n' : 's', ell(23.9, 37.6, 2, 2), o.mittens ? 'N' : 'S', 24.5);
  add('S', rect(14, 18, 18, 22));

  if (o.top === 'tshirt') {
    add(main, trap(21, 39, 9, 23, 10, 22), dark, 19.5);
    add(main, rect(6, 21.5, 10, 28));
    add(main, rect(22, 21.5, 26, 28), dark, 24);
  } else {
    const long = o.top === 'rain' || o.top === 'winter';
    const wide = o.top === 'winter' ? 1 : 0;
    const bottom = long ? 46 : 40;
    add(main, trap(21, bottom, 8.5 - wide, 23.5 + wide, long ? 8 - wide : 9.5, long ? 24 + wide : 22.5), dark, 19.5);
    add(main, rect(5.8 - wide, 21.5, 9.8, 36.6));
    add(main, rect(22.2, 21.5, 26.2 + wide, 36.6), dark, 24);
    add(dark, rect(15.6, 23, 16.4, bottom));
    if (o.top === 'winter') {
      for (let y = 26; y < 46; y += 5) add('W', both(trap(21, 46, 7.5, 24.5, 7, 25), rect(0, y, 32, y + 0.9)));
      for (let y = 26; y < 37; y += 5) {
        add('W', rect(4.8, y, 9.8, y + 0.9));
        add('W', rect(22.2, y, 27.2, y + 0.9));
      }
    }
  }

  if (hood) add(main, ell(16, 12.6, 8.6, 9), dark, 20.5);
  else add('h', ell(16, 11.6, 7.2, 7.6), 'H', 20);
  add('s', hood ? ell(16, 14, 5.6, 6) : ell(16, 13.6, 6.1, 6.5), 'S', 19.6);
  if (!hood) {
    if (!o.beanie) add('h', both(ell(16, 11.6, 7.2, 7.6), rect(0, 0, 32, 9.6)), 'H', 20);
    add('h', trap(8.6, 11.4, 9.6, 20.5, 10.2, 15.5));
    add('h', rect(9.1, 9, 10.4, 15.5));
    add('H', rect(21.6, 9, 22.9, 15.5));
  }
  add('e', rect(13, 13, 14.2, 14.6));
  add('e', rect(17.8, 13, 19, 14.6));
  add('m', rect(14.8, 17, 17.2, 18));
  if (o.shades) add('k', rect(11.6, 12.4, 20.4, 15));
  if (o.beanie && !hood) {
    add('b', both(ell(16, 10.2, 7.6, 7.4), rect(0, 0, 32, 10)), 'B', 20);
    add('B', rect(8.4, 8.2, 23.6, 10.4));
  }
  if (o.scarf) {
    add('f', rect(11.5, 19, 20.5, 23), 'F', 18);
    add('f', rect(17.5, 22, 20.2, 31), 'F', 19.2);
  }
  if (o.reflector) {
    add('k', rect(20.6, 36, 21.2, 39.6));
    add('r', (u, v) => Math.abs(u - 20.9) + Math.abs(v - 41.6) <= 2.3, 'R', 21.6);
  }
  if (o.umbrella) {
    add(
      (u) => (Math.floor(u / 5.2) % 2 ? 'C' : 'c'),
      (u, v) => v <= 6.2 && ((u - 16) / 15.6) ** 2 + ((v - 6.2) / 6.6) ** 2 <= 1,
    );
  }
  return layers;
}

export type Grid = (string | null)[][];

export function rasterFigure(o: Outfit, width = 32, height = 64): Grid {
  const layers = outfitLayers(o);
  const grid: Grid = Array.from({ length: height }, () => Array(width).fill(null));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = ((x + 0.5) * 32) / width;
      const v = ((y + 0.5) * 64) / height;
      for (const layer of layers) {
        if (!layer.hit(u, v)) continue;
        const base = typeof layer.color === 'function' ? layer.color(u) : layer.color;
        grid[y][x] = layer.shade && layer.shadeFrom !== undefined && u >= layer.shadeFrom ? layer.shade : base;
      }
    }
  }
  return grid.map((row, y) =>
    row.map((cell, x) => cell ?? ([grid[y - 1]?.[x], grid[y + 1]?.[x], row[x - 1], row[x + 1]].some(Boolean) ? 'k' : null)),
  );
}

export function paintGrid(ctx: CanvasRenderingContext2D, grid: Grid, ox: number, oy: number) {
  grid.forEach((row, y) =>
    row.forEach((key, x) => {
      if (!key) return;
      ctx.fillStyle = FIGURE_COLORS[key];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }),
  );
}
