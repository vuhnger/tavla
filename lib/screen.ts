import { LAST_WEEKDAY, SCREEN_OFF_UNTIL_HOUR } from '@/lib/constants/screen';
import { hourOf, isoWeekdayOf } from '@/lib/time';
import type { Settings } from '@/lib/types';

export const isScreenOff = (now: Date, { dayOff }: Pick<Settings, 'dayOff'>) => {
  const hour = hourOf(now);
  if (hour < SCREEN_OFF_UNTIL_HOUR) return true;
  return dayOff !== null && isoWeekdayOf(now) <= LAST_WEEKDAY && hour >= dayOff.from && hour < dayOff.to;
};
