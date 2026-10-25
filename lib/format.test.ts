import { expect, test } from 'bun:test';
import { dateKey, dateLabel, hhmm, hourOf, nextDayKey } from './format';

test('formats the clock and the short Norwegian date without dots', () => {
  expect(hhmm(new Date('2026-10-26T07:05:00+01:00'))).toBe('07:05');
  expect(dateLabel(new Date('2026-10-25T20:55:00+01:00'))).toBe('søn 25. okt');
});

test('reads time and day in Oslo, whatever the device timezone', () => {
  expect(hhmm(new Date('2026-10-25T23:30:00Z'))).toBe('00:30');
  expect(hourOf(new Date('2026-10-25T23:30:00Z'))).toBe(0);
  expect(dateKey(new Date('2026-10-25T23:30:00Z'))).toBe('2026-10-26');
  expect(hhmm(new Date('2026-07-01T21:59:00Z'))).toBe('23:59');
  expect(dateKey(new Date('2026-07-01T22:00:00Z'))).toBe('2026-07-02');
});

test('steps to the next calendar day across months and years', () => {
  expect(nextDayKey('2026-10-31')).toBe('2026-11-01');
  expect(nextDayKey('2026-12-31')).toBe('2027-01-01');
  expect(nextDayKey('2027-03-28')).toBe('2027-03-29');
});
