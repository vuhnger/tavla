import { RAIN_BANDS, SNOW_MM_FACTOR } from '@/lib/constants/weather';
import type { Precip } from './forecast';

export interface Fall {
  band: (typeof RAIN_BANDS)[number]['name'];
  count: number;
  speed: number;
  snowSpeed: number;
  length: number;
  alpha: number;
}

export function fallOf(precip: Exclude<Precip, 'none'>, mm: number): Fall {
  const rainMm = Math.max(0, precip === 'snow' ? mm * SNOW_MM_FACTOR : mm);
  const found = RAIN_BANDS.findIndex((band) => rainMm < band.upTo);
  const index = found === -1 ? RAIN_BANDS.length - 1 : found;
  const band = RAIN_BANDS[index];
  const lo = index === 0 ? 0 : RAIN_BANDS[index - 1].upTo;
  const t = Math.min(1, (rainMm - lo) / (band.upTo - lo));
  return {
    band: band.name,
    count: Math.round(band.min + (band.max - band.min) * t),
    speed: band.speed,
    snowSpeed: band.snowSpeed,
    length: band.length,
    alpha: band.alpha,
  };
}
