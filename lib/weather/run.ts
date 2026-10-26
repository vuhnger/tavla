import { RUN_LAST_HOUR } from '@/lib/constants/run';
import { HOUR_MS } from '@/lib/constants/time';
import { dateKey, hourOf } from '@/lib/time';
import type { WeatherHour } from '@/lib/types';

export function runHour(hours: WeatherHour[], now: Date): Date | null {
  const today = dateKey(now);
  const candidates = hours.filter((hour) => {
    const at = new Date(hour.time);
    return at.getTime() > now.getTime() - HOUR_MS && dateKey(at) === today && hourOf(at) <= RUN_LAST_HOUR;
  });
  if (candidates.length < 2) return null;
  const best = candidates.reduce((a, b) =>
    b.precipitation < a.precipitation || (b.precipitation === a.precipitation && b.wind < a.wind) ? b : a,
  );
  return new Date(best.time);
}
