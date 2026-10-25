import { expect, test } from 'bun:test';
import { type EnturCall, toDepartures } from './entur';

const call = (overrides: Partial<EnturCall> = {}): EnturCall => ({
  aimedDepartureTime: '2026-10-26T21:00:00+01:00',
  destinationDisplay: { frontText: 'Ringen' },
  quay: { id: 'q' },
  ...overrides,
});

test('drops cancelled calls', () => {
  const departures = toDepartures([call({ cancellation: true }), call({ cancellation: false })]);
  expect(departures).toHaveLength(1);
});

test('prefers the Norwegian summary and falls back to the first text', () => {
  const [norwegian, fallback] = toDepartures([
    call({
      situations: [
        {
          summary: [
            { value: 'Replacement bus', language: 'en' },
            { value: 'Buss for tog', language: 'no' },
          ],
        },
      ],
    }),
    call({ situations: [{ summary: [{ value: 'Replacement bus', language: 'en' }] }] }),
  ]);
  expect(norwegian.situations).toEqual(['Buss for tog']);
  expect(fallback.situations).toEqual(['Replacement bus']);
});

test('a call without situations gives an empty list', () => {
  expect(toDepartures([call(), call({ situations: [] })]).map((d) => d.situations)).toEqual([[], []]);
});
