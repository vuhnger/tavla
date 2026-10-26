import { expect, test } from 'bun:test';
import { workoutLines } from './today';

const plan = [
  { date: '2026-10-25', title: 'Long 16km' },
  { date: '2026-10-26', title: 'Easy 8km' },
  { date: '2026-10-26', title: 'Akilles' },
  { date: '2026-11-01', title: 'Long 18km' },
];

test('shows today and tomorrow in Oslo on one line each', () => {
  expect(workoutLines(plan, new Date('2026-10-25T22:59:00Z'), null)).toEqual(['Long 16km', 'i morgen Easy 8km, Akilles']);
  expect(workoutLines(plan, new Date('2026-10-25T23:05:00Z'), null)).toEqual(['Easy 8km, Akilles']);
});

test('shows only tomorrow on a rest day and nothing when both days are free', () => {
  expect(workoutLines(plan, new Date('2026-10-31T07:00:00+01:00'), null)).toEqual(['i morgen Long 18km']);
  expect(workoutLines(plan, new Date('2026-10-28T07:00:00+01:00'), null)).toEqual([]);
});

test('finds tomorrow late on the day the clocks spring forward', () => {
  const spring = [{ date: '2027-03-29', title: 'Easy 8km' }];
  expect(workoutLines(spring, new Date('2027-03-28T21:30:00Z'), null)).toEqual(['i morgen Easy 8km']);
});

test('puts the best running hour after the first run of the day', () => {
  const day = [
    { date: '2026-10-26', title: 'Akilles' },
    { date: '2026-10-26', title: 'Long 16km' },
    { date: '2026-10-26', title: 'Easy 4km' },
  ];
  const morning = new Date('2026-10-26T07:00:00+01:00');
  expect(workoutLines(day, morning, new Date('2026-10-26T12:00:00+01:00'))).toEqual(['Akilles, Long 16km (12:00), Easy 4km']);
  expect(workoutLines(day, morning, null)).toEqual(['Akilles, Long 16km, Easy 4km']);
});

test('leaves strength and cycling days without an hour', () => {
  const day = [
    { date: '2026-10-26', title: 'Styrke Underkropp' },
    { date: '2026-10-26', title: 'Sykkel rolig 45min' },
  ];
  const morning = new Date('2026-10-26T07:00:00+01:00');
  expect(workoutLines(day, morning, new Date('2026-10-26T12:00:00+01:00'))).toEqual(['Styrke Underkropp, Sykkel rolig 45min']);
});
