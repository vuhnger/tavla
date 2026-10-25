import { convertIcsCalendar } from 'ts-ics';
import { PLAN_PREFIX } from '@/lib/constants/workout';
import type { Workout } from '@/lib/types';

export const parsePlan = (ics: string): Workout[] =>
  (convertIcsCalendar(undefined, ics).events ?? []).map((event) => ({
    date: event.start.date.toISOString().slice(0, 10),
    title: (event.summary ?? '').replace(PLAN_PREFIX, ''),
  }));
