import { expect, test } from 'bun:test';
import { workoutsOn } from './today';

const plan = [
  { date: '2026-10-25', title: 'Long 16km' },
  { date: '2026-10-26', title: 'Easy 8km' },
  { date: '2026-10-26', title: 'Akilles' },
];

test('shows only the workouts planned for the local day', () => {
  expect(workoutsOn(plan, new Date(2026, 9, 26, 0, 5))).toEqual(['Easy 8km', 'Akilles']);
  expect(workoutsOn(plan, new Date(2026, 9, 25, 23, 59))).toEqual(['Long 16km']);
  expect(workoutsOn(plan, new Date(2026, 9, 27, 7))).toEqual([]);
});
