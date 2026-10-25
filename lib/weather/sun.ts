import { getPosition, getTimes } from 'suncalc';
import { STATION } from '@/lib/constants/weather';
import { hhmm } from '@/lib/format';

const DAY = 86_400_000;

const timesOn = (date: Date) => getTimes(date, STATION.latitude, STATION.longitude);

export const sunAltitude = (at: Date) => getPosition(at, STATION.latitude, STATION.longitude).altitude;

export const lightAt = (at: Date) => Math.min(1, Math.max(0, (sunAltitude(at) + 6) / 12));

export function sunLine(now: Date): string | null {
  const { sunrise, sunset } = timesOn(now);
  if (!sunrise || !sunset) return null;
  const [word, time]: [string, Date | null] =
    now < sunrise ? ['opp', sunrise]
    : now < sunset ? ['ned', sunset]
    : ['opp', timesOn(new Date(now.getTime() + DAY)).sunrise];
  return time ? `sol ${word} ${hhmm(time)}` : null;
}
