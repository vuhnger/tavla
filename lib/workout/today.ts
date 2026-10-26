import { NON_RUN_WORDS } from '@/lib/constants/workout';
import { dateKey, hhmm, nextDayKey } from '@/lib/time';
import type { Workout } from '@/lib/types';

const titlesOn = (plan: Workout[], day: string) =>
  plan.filter((workout) => workout.date === day).map((workout) => workout.title);

const isRun = (title: string) => !NON_RUN_WORDS.some((word) => title.toLowerCase().includes(word));

export function workoutLines(plan: Workout[], now: Date, runAt: Date | null): string[] {
  const today = dateKey(now);
  const titles = titlesOn(plan, today);
  const run = runAt ? titles.findIndex(isRun) : -1;
  const timed = titles.map((title, i) => (runAt && i === run ? `${title} (${hhmm(runAt)})` : title));
  const tomorrow = titlesOn(plan, nextDayKey(today));
  return [timed.join(', '), tomorrow.length ? `i morgen ${tomorrow.join(', ')}` : ''].filter(Boolean);
}
