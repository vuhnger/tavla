import { expect, test } from 'bun:test';
import type { WeatherHour } from '@/lib/types';
import { workoutLines } from './today';

const plan = [
  { date: '2026-10-25', title: 'Long 16km' },
  { date: '2026-10-26', title: 'Easy 8km' },
  { date: '2026-10-26', title: 'Akilles' },
  { date: '2026-11-01', title: 'Long 18km' },
];

const hour = (time: string, precipitation = 0): WeatherHour => ({
  time: new Date(time).toISOString(),
  temperatureC: 8,
  wind: 2,
  precipitation,
  cloud: 0,
  symbol: 'cloudy',
});

test('shows today and tomorrow in Oslo on one line each', () => {
  expect(workoutLines(plan, new Date('2026-10-25T22:59:00Z'), [])).toEqual(['Long 16km', 'imrg Easy 8km + Akilles']);
  expect(workoutLines(plan, new Date('2026-10-25T23:05:00Z'), [])).toEqual(['Easy 8km + Akilles']);
});

test('shows only tomorrow on a rest day and nothing when both days are free', () => {
  expect(workoutLines(plan, new Date('2026-10-31T07:00:00+01:00'), [])).toEqual(['imrg Long 18km']);
  expect(workoutLines(plan, new Date('2026-10-28T07:00:00+01:00'), [])).toEqual([]);
});

test('finds tomorrow late on the day the clocks spring forward', () => {
  const spring = [{ date: '2027-03-29', title: 'Easy 8km' }];
  expect(workoutLines(spring, new Date('2027-03-28T21:30:00Z'), [])).toEqual(['imrg Easy 8km']);
});

test('puts the best running hour after the first run today and tomorrow', () => {
  const days = [
    { date: '2026-10-26', title: 'Akilles' },
    { date: '2026-10-26', title: 'Long 16km' },
    { date: '2026-10-26', title: 'Easy 4km' },
    { date: '2026-10-27', title: 'Easy 8km' },
  ];
  const hours = [
    hour('2026-10-26T11:00:00+01:00', 1),
    hour('2026-10-26T12:00:00+01:00'),
    hour('2026-10-27T07:00:00+01:00', 2),
    hour('2026-10-27T16:00:00+01:00'),
  ];
  const morning = new Date('2026-10-26T07:00:00+01:00');
  expect(workoutLines(days, morning, hours)).toEqual(['Akilles + Long 16km (12:00) + Easy 4km', 'imrg Easy 8km (16:00)']);
  expect(workoutLines(days, morning, [])).toEqual(['Akilles + Long 16km + Easy 4km', 'imrg Easy 8km']);
});

test('leaves strength and cycling days without an hour', () => {
  const day = [
    { date: '2026-10-26', title: 'Styrke Underkropp' },
    { date: '2026-10-26', title: 'Sykkel rolig 45min' },
  ];
  const hours = [hour('2026-10-26T11:00:00+01:00', 1), hour('2026-10-26T12:00:00+01:00')];
  expect(workoutLines(day, new Date('2026-10-26T07:00:00+01:00'), hours)).toEqual(['Styrke Underkropp + Sykkel rolig 45min']);
});
