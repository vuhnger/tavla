import { expect, test } from 'bun:test';
import { dateLabel, hhmm } from './format';

test('formats the clock and the short Norwegian date without dots', () => {
  expect(hhmm(new Date(2026, 9, 26, 7, 5))).toBe('07:05');
  expect(dateLabel(new Date(2026, 9, 25, 20, 55))).toBe('søn 25. okt');
});
