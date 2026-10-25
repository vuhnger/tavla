import { CLOUD_EDGE } from '@/lib/constants/scene';
import { CLOUD_CLEAR_PCT, CLOUD_OVERCAST_PCT } from '@/lib/constants/weather';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const cloudiness = (pct: number) => clamp01((pct - CLOUD_CLEAR_PCT) / (CLOUD_OVERCAST_PCT - CLOUD_CLEAR_PCT));

export const isCloud = (noise: number, dither: number, pct: number) =>
  noise + (dither - 0.5) * CLOUD_EDGE < clamp01(pct / 100) * (1 + 2 * CLOUD_EDGE) - CLOUD_EDGE;
