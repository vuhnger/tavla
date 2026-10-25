import { expect, test } from 'bun:test';
import { ALL_QUAYS } from '@/lib/constants/departures';
import { directionOptions } from './directions';

const call = (quay: string, destination: string) => ({ quay, destination, time: '', situations: [] });

test('names each platform after its most common destination and adds begge', () => {
  const options = directionOptions([
    call('2', 'Østerås'),
    call('1', 'Ryen'),
    call('1', 'Ellingsrudåsen'),
    call('1', 'Ellingsrudåsen'),
  ]);
  expect(options).toEqual([
    { id: '1', label: 'mot Ellingsrudåsen' },
    { id: '2', label: 'mot Østerås' },
    { id: ALL_QUAYS, label: 'begge' },
  ]);
});

test('says alle for more than two platforms and lets a single platform stand for all', () => {
  expect(directionOptions([call('a', 'X'), call('b', 'Y'), call('c', 'Z')]).at(-1)?.label).toBe('alle');
  expect(directionOptions([call('a', 'X')])).toEqual([{ id: ALL_QUAYS, label: 'mot X' }]);
});
