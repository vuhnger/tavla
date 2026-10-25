import { ALL_QUAYS } from '@/lib/constants/departures';
import { MINUTE_MS } from '@/lib/constants/time';
import { floorMinute } from '@/lib/time';
import type { Departure } from '@/lib/types';

export interface Leave {
  leaveAt: Date;
  departAt: Date;
}

export function upcomingLeaves(departures: Departure[], now: Date, quay: string, walkMinutes: number, count: number): Leave[] {
  const thisMinute = floorMinute(now).getTime();
  return departures
    .filter((departure) => quay === ALL_QUAYS || departure.quay === quay)
    .map((departure) => {
      const departAt = new Date(departure.time);
      return { leaveAt: floorMinute(new Date(departAt.getTime() - walkMinutes * MINUTE_MS)), departAt };
    })
    .filter((leave) => leave.leaveAt.getTime() >= thisMinute)
    .sort((a, b) => a.departAt.getTime() - b.departAt.getTime())
    .filter((leave, i, all) => i === 0 || floorMinute(leave.departAt).getTime() !== floorMinute(all[i - 1].departAt).getTime())
    .slice(0, count);
}

export const minutesUntil = (leaveAt: Date, now: Date) =>
  Math.round((leaveAt.getTime() - floorMinute(now).getTime()) / MINUTE_MS);
