import { FLOOR_MIN, VIEW, VIEW_MARGIN } from '@/lib/constants/scene';
import type { Precip } from '@/lib/weather/forecast';
import { type Fall, fallOf } from '@/lib/weather/fall';
import { hash } from './backdrop';

interface Particle {
  x: number;
  y: number;
  speed: number;
  floor: number;
  snow: boolean;
}

export interface Particles {
  fall: Fall;
  list: Particle[];
}

const LEFT = VIEW.x - VIEW_MARGIN;
const SPAN = VIEW.w + 2 * VIEW_MARGIN;
const TOP = VIEW.y - 4;
const BOTTOM = VIEW.y + VIEW.h;

export function makeParticles(precip: Precip, mm: number): Particles | null {
  if (precip === 'none') return null;
  const fall = fallOf(precip, mm);
  const list = Array.from({ length: fall.count }, (_, i) => {
    const snow = precip === 'snow' || (precip === 'sleet' && i % 2 === 0);
    const floor = FLOOR_MIN + hash(i, 5) * (BOTTOM - FLOOR_MIN);
    return {
      x: LEFT + hash(i, 1) * SPAN,
      y: TOP + hash(i, 2) * (floor - TOP),
      speed: (snow ? fall.snowSpeed : fall.speed) * (0.85 + hash(i, 3) * 0.3),
      floor,
      snow,
    };
  });
  return { fall, list };
}

export function stepParticles(ctx: CanvasRenderingContext2D, { fall, list }: Particles, wind: number, tick: number) {
  const slant = Math.min(wind, 12) * 0.08;
  ctx.fillStyle = `rgba(196,210,236,${fall.alpha})`;
  for (const p of list) {
    p.y += p.speed;
    p.x -= p.snow ? Math.sin((tick + p.floor) / 9) * 0.3 + slant * 0.5 : slant * p.speed;
    if (p.y > p.floor) {
      p.y = TOP;
      p.x += 97;
    }
    p.x = LEFT + ((((p.x - LEFT) % SPAN) + SPAN) % SPAN);
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (p.snow) ctx.fillRect(x, y, 1, 1);
    else for (let i = 0; i < fall.length; i++) ctx.fillRect(Math.round(x + i * slant), y - i, 1, 1);
  }
}
