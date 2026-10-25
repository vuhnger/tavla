import { CLOUD_STEP, LIGHT_STEPS } from '@/lib/constants/scene';
import type { WeatherHour } from '@/lib/types';
import { type Precip, hourAt, precipOf } from '@/lib/weather/forecast';
import type { Outfit } from '@/lib/weather/outfit';
import { lightAt } from '@/lib/weather/sun';
import type { Look } from './backdrop';

export interface SceneSpec {
  look: Look;
  outfit: Outfit;
  precip: Precip;
  mm: number;
  wind: number;
}

export function sceneSpec(hours: WeatherHour[], now: Date, outfit: Outfit): SceneSpec {
  const hour = hourAt(hours, now);
  const precip = hour ? precipOf(hour) : 'none';
  return {
    look: {
      light: Math.round(lightAt(now) * LIGHT_STEPS) / LIGHT_STEPS,
      cloud: Math.round((hour?.cloud ?? 0) / CLOUD_STEP) * CLOUD_STEP,
      wet: precip === 'rain' || precip === 'sleet',
      snowRoofs: precip === 'snow',
      month: now.getMonth(),
    },
    outfit,
    precip,
    mm: hour?.precipitation ?? 0,
    wind: hour?.wind ?? 0,
  };
}
