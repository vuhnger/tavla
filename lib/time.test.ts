import { expect, test } from 'bun:test';
import { dateKey, dateLabel, floorMinute, hhmm, hourLabel, hourOf, nextDayKey } from './time';

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

test('spring forward skips 02:00 to 03:00 Oslo', () => {
  expect(hhmm(new Date('2027-03-28T00:59:00Z'))).toBe('01:59');
  expect(hhmm(new Date('2027-03-28T01:00:00Z'))).toBe('03:00');
  expect(hourOf(new Date('2027-03-28T01:00:00Z'))).toBe(3);
  expect(dateKey(new Date('2027-03-28T21:59:00Z'))).toBe('2027-03-28');
  expect(dateKey(new Date('2027-03-28T22:00:00Z'))).toBe('2027-03-29');
  expect(nextDayKey('2027-03-27')).toBe('2027-03-28');
});

test('fall back repeats 02:00 to 03:00 Oslo', () => {
  expect(hhmm(new Date('2026-10-25T00:30:00Z'))).toBe('02:30');
  expect(hhmm(new Date('2026-10-25T01:30:00Z'))).toBe('02:30');
  expect(hhmm(new Date('2026-10-25T02:00:00Z'))).toBe('03:00');
  expect(dateKey(new Date('2026-10-25T22:59:00Z'))).toBe('2026-10-25');
  expect(dateKey(new Date('2026-10-25T23:00:00Z'))).toBe('2026-10-26');
  expect(nextDayKey('2026-10-24')).toBe('2026-10-25');
  expect(nextDayKey('2026-10-25')).toBe('2026-10-26');
});

test('midnight and the year boundary read in Oslo', () => {
  expect(hhmm(new Date('2026-12-31T23:00:00Z'))).toBe('00:00');
  expect(hourOf(new Date('2026-12-31T23:00:00Z'))).toBe(0);
  expect(dateKey(new Date('2026-12-31T22:59:00Z'))).toBe('2026-12-31');
  expect(dateKey(new Date('2026-12-31T23:00:00Z'))).toBe('2027-01-01');
  expect(dateLabel(new Date('2026-12-31T23:00:00Z'))).toBe('fre 1. jan');
});

test('leap day and month ends step correctly', () => {
  expect(nextDayKey('2028-02-28')).toBe('2028-02-29');
  expect(nextDayKey('2028-02-29')).toBe('2028-03-01');
  expect(nextDayKey('2026-02-28')).toBe('2026-03-01');
  expect(nextDayKey('2026-04-30')).toBe('2026-05-01');
});

test('pads hours and floors to the minute', () => {
  expect(hourLabel(8)).toBe('08');
  expect(hourLabel(16)).toBe('16');
  expect(floorMinute(new Date('2026-10-26T07:05:59.999+01:00'))).toEqual(new Date('2026-10-26T07:05:00+01:00'));
});
