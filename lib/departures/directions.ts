import { ALL_QUAYS } from '@/lib/constants/departures';
import type { Departure } from '@/lib/types';

export interface Direction {
  id: string;
  label: string;
}

const mostCommon = (names: string[]) => {
  const count = (name: string) => names.filter((n) => n === name).length;
  return names.reduce((best, name) => (count(name) > count(best) ? name : best));
};

export function directionOptions(departures: Departure[]): Direction[] {
  const byQuay = new Map<string, string[]>();
  for (const { quay, destination } of departures) byQuay.set(quay, [...(byQuay.get(quay) ?? []), destination]);
  const quays = [...byQuay]
    .map(([id, names]) => ({ id, label: `mot ${mostCommon(names)}` }))
    .sort((a, b) => a.label.localeCompare(b.label, 'nb'));
  if (quays.length < 2) return quays;
  return [...quays, { id: ALL_QUAYS, label: quays.length === 2 ? 'begge' : 'alle' }];
}
