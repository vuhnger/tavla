import { AFTERNOON_HOUR, MORNING_HOUR, NOON_HOUR } from '@/lib/constants/weather';
import { HOUR_MS } from '@/lib/constants/time';
import { dateKey, hourLabel, hourOf, nextDayKey } from '@/lib/time';
import type { WeatherHour } from '@/lib/types';

export type Sky = 'clear' | 'partly' | 'overcast';
export type Precip = 'none' | 'rain' | 'sleet' | 'snow';

const WET_MM = 0.1;

export function feelsLike(temperature: number, wind: number): number {
  const kmh = wind * 3.6;
  if (temperature > 10 || kmh <= 4.8) return temperature;
  const v = kmh ** 0.16;
  return 13.12 + 0.6215 * temperature - 11.37 * v + 0.3965 * temperature * v;
}

export function skyOf(symbol: string): Sky {
  if (symbol.startsWith('clearsky') || symbol.startsWith('fair')) return 'clear';
  if (symbol.startsWith('partlycloudy')) return 'partly';
  return 'overcast';
}

export function precipOf(hour: Pick<WeatherHour, 'symbol' | 'precipitation'>): Precip {
  const { symbol, precipitation } = hour;
  if (symbol.includes('snow')) return 'snow';
  if (symbol.includes('sleet')) return 'sleet';
  if (symbol.includes('rain') || precipitation >= WET_MM) return 'rain';
  return 'none';
}

const PRECIP_WORDS: Record<Exclude<Precip, 'none'>, string> = { rain: 'regn', sleet: 'sludd', snow: 'snø' };

export function conditionWord(symbol: string): string {
  if (symbol.includes('thunder')) return 'torden';
  const precip = precipOf({ symbol, precipitation: 0 });
  if (precip !== 'none') return PRECIP_WORDS[precip];
  if (symbol.startsWith('fog')) return 'tåke';
  if (symbol.startsWith('clearsky')) return 'klart';
  if (symbol.startsWith('fair')) return 'lettskyet';
  if (symbol.startsWith('partlycloudy')) return 'delvis skyet';
  return 'skyet';
}

export function precipSpell(hours: WeatherHour[]): string | null {
  const [current, ...later] = hours;
  if (!current) return null;
  if (current.precipitation >= WET_MM) {
    const dry = later.find((hour) => hour.precipitation < WET_MM);
    const precip = precipOf(current);
    return dry && precip !== 'none' ? `${PRECIP_WORDS[precip]} til kl ${hourLabel(hourOf(new Date(dry.time)))}` : null;
  }
  const wet = later.slice(0, 6).find((hour) => hour.precipitation >= 0.3);
  if (!wet) return null;
  const precip = precipOf(wet);
  return precip === 'none' ? null : `${PRECIP_WORDS[precip]} fra kl ${hourLabel(hourOf(new Date(wet.time)))}`;
}

export interface Conditions {
  temperature: number;
  wind: number;
  feels: number;
  maxPrecip: number;
  precip: Precip;
  symbol: string;
}

const hoursFrom = (hours: WeatherHour[], at: Date, windowHours: number) =>
  hours.filter((hour) => {
    const t = new Date(hour.time).getTime();
    return t > at.getTime() - HOUR_MS && t < at.getTime() + windowHours * HOUR_MS;
  });

export const hourAt = (hours: WeatherHour[], at: Date): WeatherHour | undefined => hoursFrom(hours, at, 1)[0];

export function laterForecast(hours: WeatherHour[], now: Date): string | null {
  const tomorrow = hourOf(now) >= NOON_HOUR;
  const day = tomorrow ? nextDayKey(dateKey(now)) : dateKey(now);
  const targetHour = tomorrow ? MORNING_HOUR : AFTERNOON_HOUR;
  const hour = hours.find((h) => dateKey(new Date(h.time)) === day && hourOf(new Date(h.time)) === targetHour);
  if (!hour) return null;
  return `${tomorrow ? 'i morgen ' : ''}kl ${hourLabel(targetHour)} ${Math.round(hour.temperatureC)}° ${conditionWord(hour.symbol)}`;
}

export function conditionsAt(hours: WeatherHour[], at: Date, windowHours = 2): Conditions | null {
  const span = hoursFrom(hours, at, windowHours);
  const first = span[0];
  if (!first) return null;
  const wettest = span.reduce((a, b) => (b.precipitation > a.precipitation ? b : a));
  return {
    temperature: first.temperatureC,
    wind: first.wind,
    feels: feelsLike(first.temperatureC, first.wind),
    maxPrecip: wettest.precipitation,
    precip: precipOf(wettest),
    symbol: first.symbol,
  };
}
