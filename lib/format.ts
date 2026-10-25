import { TIME_ZONE } from '@/lib/constants/time';

export const pad = (n: number) => String(n).padStart(2, '0');

const DAY_KEY = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });
const CLOCK = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const HOUR = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: 'numeric', hourCycle: 'h23' });
const DATE_PARTS = new Intl.DateTimeFormat('nb-NO', { timeZone: TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short' });

export const dateKey = (date: Date) => DAY_KEY.format(date);

export const nextDayKey = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + 1)).toISOString().slice(0, 10);
};

export const hhmm = (date: Date) => CLOCK.format(date);

export const hourOf = (date: Date) => Number(HOUR.format(date));

export function dateLabel(date: Date) {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    DATE_PARTS.formatToParts(date).find((p) => p.type === type)?.value.replace('.', '') ?? '';
  return `${part('weekday')} ${part('day')}. ${part('month')}`;
}
