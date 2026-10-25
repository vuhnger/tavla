import { ALL_QUAYS, MAX_WALK_MINUTES, QUAY_ID_PATTERN, STOP_ID_PATTERN } from '@/lib/constants/departures';
import { DEFAULT_SETTINGS } from '@/lib/constants/settings';
import type { Settings } from '@/lib/types';

function parseJson(raw: string | null): Partial<Settings> | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const isWalk = (walk: unknown): walk is number => Number.isInteger(walk) && (walk as number) >= 0 && (walk as number) <= MAX_WALK_MINUTES;

const isQuay = (quay: unknown): quay is string =>
  quay === ALL_QUAYS || (typeof quay === 'string' && QUAY_ID_PATTERN.test(quay));

export function parseSettings(raw: string | null): Settings {
  const value = parseJson(raw);
  const stop = value?.stop;
  const validStop = typeof stop?.name === 'string' && typeof stop.id === 'string' && STOP_ID_PATTERN.test(stop.id);
  return {
    stop: validStop ? { id: stop.id, name: stop.name } : DEFAULT_SETTINGS.stop,
    quay: !validStop ? DEFAULT_SETTINGS.quay : isQuay(value?.quay) ? value.quay : ALL_QUAYS,
    walk: isWalk(value?.walk) ? value.walk : DEFAULT_SETTINGS.walk,
  };
}
