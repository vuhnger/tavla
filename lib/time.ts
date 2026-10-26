import { addDays, format, startOfMinute } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { formatInTimeZone } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import { MINUTE_MS, TIME_ZONE } from '@/lib/constants/time';

const inOslo = (date: Date, pattern: string) => formatInTimeZone(date, TIME_ZONE, pattern, { locale: nb });

export const dateKey = (date: Date) => inOslo(date, 'yyyy-MM-dd');

export const nextDayKey = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return format(addDays(new Date(year, month - 1, date, 12), 1), 'yyyy-MM-dd');
};

export const hhmm = (date: Date) => inOslo(date, 'HH:mm');

export const hourOf = (date: Date) => Number(inOslo(date, 'H'));

export const isoWeekdayOf = (date: Date) => Number(inOslo(date, 'i'));

export const hourLabel = (hour: number) => String(hour).padStart(2, '0');

export const dateLabel = (date: Date) => inOslo(date, 'EEE d. MMM').replace(/\.$/, '');

export const floorMinute = (date: Date) => startOfMinute(date);

export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const date = new Date();
      setNow(date);
      id = setTimeout(tick, MINUTE_MS - (date.getTime() % MINUTE_MS));
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  return now;
}
