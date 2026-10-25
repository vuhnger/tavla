import { DARK_LIGHT } from '@/lib/constants/weather';
import type { WeatherHour } from '@/lib/types';
import { type Conditions, conditionsAt, skyOf } from './forecast';
import { lightAt } from './sun';

export type Top = 'tshirt' | 'light' | 'jacket' | 'rain' | 'winter';

export interface Outfit {
  top: Top;
  wool: boolean;
  umbrella: boolean;
  beanie: boolean;
  scarf: boolean;
  mittens: boolean;
  boots: boolean;
  spikes: boolean;
  reflector: boolean;
  shades: boolean;
}

export interface Light {
  dark: boolean;
  sunny: boolean;
}

function baseTop(feels: number): Top {
  if (feels >= 18) return 'tshirt';
  if (feels >= 12) return 'light';
  if (feels >= 4) return 'jacket';
  return 'winter';
}

export function outfitFor(c: Conditions, light: Light): Outfit {
  const wet = c.maxPrecip >= 0.3 && c.precip !== 'snow';
  const umbrella = wet && c.wind < 5;
  const base = baseTop(c.feels);
  return {
    top: wet && !umbrella && base !== 'winter' ? 'rain' : base,
    wool: c.feels < -5,
    umbrella,
    beanie: c.feels < 6,
    scarf: c.feels < 2,
    mittens: c.feels < 0,
    boots: c.maxPrecip >= 1 || c.precip === 'snow',
    spikes: c.temperature >= -3 && c.temperature <= 2 && c.maxPrecip > 0,
    reflector: light.dark,
    shades: light.sunny && c.temperature >= 15,
  };
}

export function outfitAt(hours: WeatherHour[], now: Date): Outfit | null {
  const conditions = conditionsAt(hours, now);
  if (!conditions) return null;
  const light = lightAt(now);
  return outfitFor(conditions, { dark: light < DARK_LIGHT, sunny: light === 1 && skyOf(conditions.symbol) === 'clear' });
}

const TOP_WORDS: Record<Top, string> = {
  tshirt: 't-skjorte',
  light: 'lett jakke',
  jacket: 'jakke',
  rain: 'regnjakke',
  winter: 'vinterjakke',
};

const EXTRA_WORDS = [
  ['wool', 'ull'],
  ['umbrella', 'paraply'],
  ['beanie', 'lue'],
  ['scarf', 'skjerf'],
  ['mittens', 'votter'],
  ['boots', 'støvler'],
  ['spikes', 'brodder'],
  ['reflector', 'refleks'],
  ['shades', 'solbriller'],
] as const;

export const outfitWords = (o: Outfit) => [TOP_WORDS[o.top], ...EXTRA_WORDS.filter(([key]) => o[key]).map(([, word]) => word)];
