import { dateLabel, hhmm } from '@/lib/time';
import type { WeatherHour } from '@/lib/types';
import { conditionWord, feelsLike } from '@/lib/weather/forecast';

function Weather({ hour }: { hour: WeatherHour }) {
  const temperature = Math.round(hour.temperatureC);
  const feels = Math.round(feelsLike(hour.temperatureC, hour.wind));
  return (
    <p className="text-right text-[4rem]">
      {temperature}° {conditionWord(hour.symbol)}
      {feels !== temperature && <span className="mt-3 block text-[2.5rem] text-soft">føles {feels}°</span>}
    </p>
  );
}

export function Head({ now, hour }: { now: Date; hour?: WeatherHour }) {
  return (
    <header className="absolute inset-x-24 top-[4.5rem] flex items-baseline justify-between">
      <p>
        <span className="text-[4rem]">{hhmm(now)}</span>
        <span className="ml-8 text-[2.5rem] text-soft">{dateLabel(now)}</span>
      </p>
      {hour && <Weather hour={hour} />}
    </header>
  );
}
