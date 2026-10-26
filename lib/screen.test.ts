import { expect, test } from 'bun:test';
import { DEFAULT_DAY_OFF } from '@/lib/constants/screen';
import { isScreenOff } from './screen';

const on = { dayOff: DEFAULT_DAY_OFF };
const off = { dayOff: null };

test('is dark from midnight until 06:00 Oslo time', () => {
  expect(isScreenOff(new Date('2026-10-25T23:00:00Z'), off)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T04:59:00Z'), off)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T05:00:00Z'), off)).toBe(false);
  expect(isScreenOff(new Date('2026-10-25T22:59:00Z'), off)).toBe(false);
  expect(isScreenOff(new Date('2026-07-01T03:59:00Z'), off)).toBe(true);
  expect(isScreenOff(new Date('2026-07-01T04:00:00Z'), off)).toBe(false);
});

test('keeps the night window with the day window on', () => {
  expect(isScreenOff(new Date('2026-10-26T04:59:00Z'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T05:00:00Z'), on)).toBe(false);
});

test('is dark on weekdays from the start hour up to but not including the end hour', () => {
  expect(isScreenOff(new Date('2026-10-26T08:00:00Z'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T09:00:00+01:00'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T11:30:00+01:00'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T14:59:00+01:00'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T15:00:00+01:00'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-10-26T08:59:00+01:00'), on)).toBe(false);
});

test('is lit at the same hours on Saturday and Sunday', () => {
  expect(isScreenOff(new Date('2026-10-24T11:00:00+02:00'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-10-25T11:00:00+01:00'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-10-30T11:00:00+01:00'), on)).toBe(true);
});

test('is lit in the daytime when the window is off', () => {
  expect(isScreenOff(new Date('2026-10-26T11:00:00+01:00'), off)).toBe(false);
});

test('uses the Oslo weekday and hour around the DST changes', () => {
  expect(isScreenOff(new Date('2026-10-26T08:00:00Z'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T07:59:00Z'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-03-30T07:00:00Z'), on)).toBe(true);
  expect(isScreenOff(new Date('2026-03-30T06:59:00Z'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-03-27T07:00:00Z'), on)).toBe(false);
  expect(isScreenOff(new Date('2026-03-27T08:00:00Z'), on)).toBe(true);
});
