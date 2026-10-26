import { LAST_HOUR } from '@/lib/constants/screen';
import { ALL_QUAYS, MAX_WALK_MINUTES, QUAY_ID_PATTERN, STOP_ID_PATTERN } from '@/lib/constants/departures';
import { DEFAULT_SETTINGS } from '@/lib/constants/settings';
import type { DayOff, Settings } from '@/lib/types';

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

const isHour = (hour: unknown): hour is number => Number.isInteger(hour) && (hour as number) >= 0 && (hour as number) <= LAST_HOUR;

const isDayOff = (dayOff: unknown): dayOff is DayOff => {
  const { from, to } = (dayOff ?? {}) as Partial<DayOff>;
  return isHour(from) && isHour(to) && from < to;
};

const parseDayOff = (dayOff: unknown) => (dayOff === null ? null : isDayOff(dayOff) ? { from: dayOff.from, to: dayOff.to } : DEFAULT_SETTINGS.dayOff);

export function parseSettings(raw: string | null): Settings {
  const value = parseJson(raw);
  const stop = value?.stop;
  const validStop = typeof stop?.name === 'string' && typeof stop.id === 'string' && STOP_ID_PATTERN.test(stop.id);
  return {
    stop: validStop ? { id: stop.id, name: stop.name } : DEFAULT_SETTINGS.stop,
    quay: !validStop ? DEFAULT_SETTINGS.quay : isQuay(value?.quay) ? value.quay : ALL_QUAYS,
    walk: isWalk(value?.walk) ? value.walk : DEFAULT_SETTINGS.walk,
    dayOff: parseDayOff(value?.dayOff),
  };
}
