import { NON_RUN_WORDS } from '@/lib/constants/workout';
import { dateKey, hhmm, nextDayKey } from '@/lib/time';
import type { WeatherHour, Workout } from '@/lib/types';
import { runHour } from '@/lib/weather/run';

const isRun = (title: string) => !NON_RUN_WORDS.some((word) => title.toLowerCase().includes(word));

function dayLine(plan: Workout[], day: string, runAt: Date | null) {
  const titles = plan.filter((workout) => workout.date === day).map((workout) => workout.title);
  const run = runAt ? titles.findIndex(isRun) : -1;
  return titles.map((title, i) => (runAt && i === run ? `${title} (${hhmm(runAt)})` : title)).join(' + ');
}

export function workoutLines(plan: Workout[], now: Date, hours: WeatherHour[]): string[] {
  const today = dateKey(now);
  const tomorrow = nextDayKey(today);
  const later = dayLine(plan, tomorrow, runHour(hours, now, tomorrow));
  return [dayLine(plan, today, runHour(hours, now, today)), later && `imrg ${later}`].filter(Boolean);
}
