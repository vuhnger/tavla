import { expect, test } from 'bun:test';
import { cloudiness, isCloud } from './cloud';
import { fallOf } from './fall';
import { precipOf } from './forecast';

test('rain bands follow the AMS limits of 2.5 and 7.6 mm/h', () => {
  expect(fallOf('rain', 0.1).band).toBe('drizzle');
  expect(fallOf('rain', 0.49).band).toBe('drizzle');
  expect(fallOf('rain', 0.5).band).toBe('light');
  expect(fallOf('rain', 2.49).band).toBe('light');
  expect(fallOf('rain', 2.5).band).toBe('moderate');
  expect(fallOf('rain', 7.59).band).toBe('moderate');
  expect(fallOf('rain', 7.6).band).toBe('heavy');
  expect(fallOf('rain', 50).band).toBe('heavy');
});

test('particle count rises with intensity and stays within the cap', () => {
  const counts = [0.1, 1, 4, 10, 100].map((mm) => fallOf('rain', mm).count);
  expect(counts).toEqual([...counts].sort((a, b) => a - b));
  expect(new Set(counts).size).toBe(counts.length);
  expect(counts.at(-1)).toBe(200);
  expect(fallOf('rain', 0).count).toBe(8);
  expect(fallOf('rain', -1).count).toBe(8);
});

test('rain falls faster and longer as it gets heavier', () => {
  const light = fallOf('rain', 1);
  const heavy = fallOf('rain', 10);
  expect(heavy.speed).toBeGreaterThan(light.speed);
  expect(heavy.length).toBeGreaterThan(light.length);
});

test('snow counts double the water equivalent and falls slower than rain', () => {
  expect(fallOf('snow', 1.25).band).toBe('moderate');
  expect(fallOf('snow', 1.25).count).toBe(fallOf('rain', 2.5).count);
  const snow = fallOf('snow', 1);
  expect(snow.snowSpeed).toBeLessThan(snow.speed);
});

test('cloudiness is 0 up to 1 okta, 1 from 7 oktas, linear between', () => {
  expect(cloudiness(0)).toBe(0);
  expect(cloudiness(12.5)).toBe(0);
  expect(cloudiness(50)).toBe(0.5);
  expect(cloudiness(87.5)).toBe(1);
  expect(cloudiness(100)).toBe(1);
  expect(cloudiness(-5)).toBe(0);
  expect(cloudiness(140)).toBe(1);
});

test('cloud cover is empty at 0 percent and full at 100 percent for any noise', () => {
  const samples = [0, 0.25, 0.5, 0.75, 1];
  for (const n of samples) for (const d of samples) {
    expect(isCloud(n, d, 0)).toBe(false);
    expect(isCloud(n, d, 100)).toBe(true);
  }
});

test('cloud cover grows with the fraction', () => {
  const covered = (pct: number) => {
    let count = 0;
    for (let i = 0; i < 100; i++) if (isCloud(i / 99, (i * 7 % 16) / 16, pct)) count++;
    return count;
  };
  expect(covered(25)).toBeLessThan(covered(50));
  expect(covered(50)).toBeLessThan(covered(75));
  expect(covered(75)).toBeLessThan(covered(100));
});

test('a rain-free symbol with measurable precipitation uses the temperature', () => {
  const base = { symbol: 'cloudy', precipitation: 0.5 };
  expect(precipOf({ ...base, temperatureC: -3 })).toBe('snow');
  expect(precipOf({ ...base, temperatureC: 0 })).toBe('snow');
  expect(precipOf({ ...base, temperatureC: 1 })).toBe('sleet');
  expect(precipOf({ ...base, temperatureC: 1.5 })).toBe('sleet');
  expect(precipOf({ ...base, temperatureC: 4 })).toBe('rain');
  expect(precipOf(base)).toBe('rain');
  expect(precipOf({ symbol: 'cloudy', precipitation: 0.05, temperatureC: -3 })).toBe('none');
  expect(precipOf({ symbol: 'rain', precipitation: 0.5, temperatureC: -3 })).toBe('rain');
});
