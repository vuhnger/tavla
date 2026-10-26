import { TZDate, tz } from '@date-fns/tz';
import { addDays, format, getHours, getISODay, startOfMinute } from 'date-fns';
import { nb } from 'date-fns/locale/nb';
import { useEffect, useState } from 'react';
import { MINUTE_MS, TIME_ZONE } from '@/lib/constants/time';

const IN_OSLO = { in: tz(TIME_ZONE) };

export const dateKey = (date: Date) => format(date, 'yyyy-MM-dd', IN_OSLO);

export const nextDayKey = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  return dateKey(addDays(new TZDate(year, month - 1, date, 12, TIME_ZONE), 1));
};

export const hhmm = (date: Date) => format(date, 'HH:mm', IN_OSLO);

export const hourOf = (date: Date) => getHours(date, IN_OSLO);

export const isoWeekdayOf = (date: Date) => getISODay(date, IN_OSLO);

export const hourLabel = (hour: number) => String(hour).padStart(2, '0');

export const dateLabel = (date: Date) => format(date, 'EEE d. MMM', { ...IN_OSLO, locale: nb }).replace(/\.$/, '');

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
