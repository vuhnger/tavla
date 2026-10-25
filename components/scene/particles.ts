import type { Precip } from '@/lib/weather/forecast';
import { HEIGHT, WIDTH, hash } from './backdrop';

interface Particle {
  x: number;
  y: number;
  speed: number;
  floor: number;
  snow: boolean;
}

const MAX = 60;

export function makeParticles(precip: Precip, mm: number): Particle[] {
  if (precip === 'none') return [];
  const count = Math.min(MAX, Math.round(12 + mm * 18));
  return Array.from({ length: count }, (_, i) => {
    const snow = precip === 'snow' || (precip === 'sleet' && i % 2 === 0);
    return {
      x: hash(i, 1) * WIDTH,
      y: hash(i, 2) * HEIGHT,
      speed: snow ? 0.5 + hash(i, 3) * 0.4 : 2.4 + hash(i, 3) * 1.2,
      floor: 120 + hash(i, 5) * (HEIGHT - 120),
      snow,
    };
  });
}

export function stepParticles(ctx: CanvasRenderingContext2D, particles: Particle[], wind: number, tick: number) {
  const slant = Math.min(wind, 12) * 0.08;
  ctx.fillStyle = 'rgba(196,210,236,0.5)';
  for (const p of particles) {
    p.y += p.speed;
    p.x -= p.snow ? Math.sin((tick + p.floor) / 9) * 0.3 + slant * 0.5 : slant * p.speed;
    if (p.y > p.floor) {
      p.y = -4;
      p.x = ((p.x + 97) % WIDTH + WIDTH) % WIDTH;
    }
    if (p.x < 0) p.x += WIDTH;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (p.snow) ctx.fillRect(x, y, 1, 1);
    else for (let i = 0; i < 3; i++) ctx.fillRect(Math.round(x + i * slant), y - i, 1, 1);
  }
}
