import { MAX_WALK_MINUTES, STOP_ID_PATTERN } from '@/lib/constants/departures';
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

export function parseSettings(raw: string | null): Settings {
  const value = parseJson(raw);
  const stop = value?.stop;
  const validStop = typeof stop?.name === 'string' && typeof stop.id === 'string' && STOP_ID_PATTERN.test(stop.id);
  return {
    stop: validStop ? { id: stop.id, name: stop.name } : DEFAULT_SETTINGS.stop,
    quay: validStop && typeof value?.quay === 'string' ? value.quay : DEFAULT_SETTINGS.quay,
    walk: isWalk(value?.walk) ? value.walk : DEFAULT_SETTINGS.walk,
  };
}
