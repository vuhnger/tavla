import { SCREEN_OFF_UNTIL_HOUR } from '@/lib/constants/screen';
import { hourOf } from '@/lib/format';

export const isScreenOff = (now: Date) => hourOf(now) < SCREEN_OFF_UNTIL_HOUR;
