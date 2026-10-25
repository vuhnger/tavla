import { dateKey, nextDayKey } from '@/lib/time';
import type { Workout } from '@/lib/types';

const titlesOn = (plan: Workout[], day: string) =>
  plan.filter((workout) => workout.date === day).map((workout) => workout.title);

export function workoutLines(plan: Workout[], now: Date): string[] {
  const today = dateKey(now);
  const tomorrow = titlesOn(plan, nextDayKey(today));
  return [titlesOn(plan, today).join(', '), tomorrow.length ? `i morgen ${tomorrow.join(', ')}` : ''].filter(Boolean);
}
