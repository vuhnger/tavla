import { expect, test } from 'bun:test';
import { parsePlan } from './parse';

const event = (date: string, summary: string) =>
  ['BEGIN:VEVENT', 'DTSTAMP:20261025T212451Z', `SUMMARY:${summary}`, `DTSTART;VALUE=DATE:${date}`, `UID:${date}-${summary.length}@tavla`, 'END:VEVENT'];

const feed = (...events: string[][]) =>
  ['BEGIN:VCALENDAR', 'PRODID:-//Garmin Connect//ICalProvider 1.0//EN', 'VERSION:2.0', ...events.flat(), 'END:VCALENDAR'].join('\r\n');

test('reads the date and the title without the plan name', () => {
  expect(parsePlan(feed(event('20261026', 'Host 26 - Easy 8km'), event('20261026', 'Host 26 - Akilles')))).toEqual([
    { date: '2026-10-26', title: 'Easy 8km' },
    { date: '2026-10-26', title: 'Akilles' },
  ]);
});

test('keeps a title that has no plan name and the dash inside a title', () => {
  expect(parsePlan(feed(event('20261103', 'Rolig 8km + 6x100m'), event('20261104', 'Host 26 - Bakker - 6x2min')))).toEqual([
    { date: '2026-11-03', title: 'Rolig 8km + 6x100m' },
    { date: '2026-11-04', title: 'Bakker - 6x2min' },
  ]);
});

test('gives an empty plan for a feed without events', () => {
  expect(parsePlan(feed())).toEqual([]);
});
