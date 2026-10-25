import { dateKey } from '@/lib/format';
import type { Workout } from '@/lib/types';

export const workoutsOn = (plan: Workout[], now: Date) =>
  plan.filter((workout) => workout.date === dateKey(now)).map((workout) => workout.title);
