import { minutesToMilliseconds } from 'date-fns';
import { DAY_SECONDS } from './time';

export const WORKOUT_REFRESH_MS = minutesToMilliseconds(30);
export const PAIR_COOKIE = 'tavla_key';
export const PAIR_MAX_AGE_SECONDS = 400 * DAY_SECONDS;
export const PLAN_PREFIX = /^.*? - /;
