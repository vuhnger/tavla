'use client';

import { useEffect, useState } from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  Wind
} from 'lucide-react';
import type { WeatherResponse, StopLocation } from '@/lib/types';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

interface WeatherProps {
  location?: StopLocation;
}

// Map MET symbol codes to Norwegian labels
function getWeatherLabel(symbol: string): string {
  const baseSymbol = symbol.replace(/_day|_night|_polartwilight/g, '');

  const symbolMap: Record<string, string> = {
    clearsky: 'Klarvær',
    fair: 'Lettskyet',
    partlycloudy: 'Delvis skyet',
    cloudy: 'Skyet',
    fog: 'Tåke',
    lightrain: 'Lett regn',
    rain: 'Regn',
    heavyrain: 'Kraftig regn',
    lightsleet: 'Lett sludd',
    sleet: 'Sludd',
    heavysleet: 'Kraftig sludd',
    lightsnow: 'Lett snø',
    snow: 'Snø',
    heavysnow: 'Kraftig snø',
    rainshowers: 'Regnbyger',
    sleetshowers: 'Sluddbyger',
    snowshowers: 'Snøbyger',
    lightrainshowers: 'Lette regnbyger',
    heavyrainshowers: 'Kraftige regnbyger',
    lightssleetshowers: 'Lette sluddbyger',
    heavysleetshowers: 'Kraftige sluddbyger',
    lightsnowshowers: 'Lette snøbyger',
    heavysnowshowers: 'Kraftige snøbyger',
  };

  return symbolMap[baseSymbol] || baseSymbol;
}

// Map MET symbol codes to Lucide icons
function getWeatherIcon(symbol: string) {
  const baseSymbol = symbol.replace(/_day|_night|_polartwilight/g, '');

  // Return icon name for dynamic import
  const iconMap: Record<string, string> = {
    clearsky: 'Sun',
    fair: 'Sun',
    partlycloudy: 'CloudSun',
    cloudy: 'Cloud',
    fog: 'CloudFog',
    lightrain: 'CloudDrizzle',
    rain: 'CloudRain',
    heavyrain: 'CloudRain',
    lightsleet: 'CloudSnow',
    sleet: 'CloudSnow',
    heavysleet: 'CloudSnow',
    lightsnow: 'Snowflake',
    snow: 'Snowflake',
    heavysnow: 'Snowflake',
    rainshowers: 'CloudRain',
    sleetshowers: 'CloudSnow',
    snowshowers: 'Snowflake',
    lightrainshowers: 'CloudDrizzle',
    heavyrainshowers: 'CloudRain',
    lightssleetshowers: 'CloudSnow',
    heavysleetshowers: 'CloudSnow',
    lightsnowshowers: 'Snowflake',
    heavysnowshowers: 'Snowflake',
  };

  return iconMap[baseSymbol] || 'Cloud';
}

// Get the icon component based on symbol
function getWeatherIconComponent(symbol: string) {
  const iconName = getWeatherIcon(symbol);

  const icons: Record<string, typeof Sun> = {
    Sun,
    Cloud,
    CloudSun,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    CloudSnow,
    Snowflake,
  };

  return icons[iconName] || Cloud;
}

export function Weather({ location }: WeatherProps) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const latitude = location?.latitude;
  const longitude = location?.longitude;

  useEffect(() => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      setWeather(null);
      setLoading(true);
      return;
    }

    let active = true;

    const fetchWeather = async (showLoading: boolean) => {
      try {
        let url = '/api/weather';

        // Use location coordinates if provided
        const params = new URLSearchParams({
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
        url = `/api/weather?${params.toString()}`;

        if (showLoading) {
          setLoading(true);
        }
        const response = await fetch(url, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data: WeatherResponse = await response.json();
          if (active) {
            setWeather(data);
          }
        } else {
          console.error('Failed to fetch weather:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        if (active && showLoading) {
          setLoading(false);
        }
      }
    };

    // Fetch weather immediately when location changes
    setWeather(null);
    fetchWeather(true);

    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchWeather(false);
    }, REFRESH_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [latitude, longitude]);

  if (loading || !weather?.weather) {
    return (
      <div className="flex items-center gap-6 font-pixel">
        <Cloud className="w-14 h-14 md:w-16 md:h-16 text-[hsl(var(--olive))]" strokeWidth={1.5} />
        <div className="space-y-2">
          <div className="text-6xl md:text-7xl">--°</div>
          <div className="text-lg md:text-xl opacity-80">--</div>
        </div>
      </div>
    );
  }

  const { temperatureC, symbol, wind, precipitation } = weather.weather;
  const WeatherIcon = getWeatherIconComponent(symbol);

  return (
    <div className="flex items-center gap-6 font-pixel border-2 border-[hsl(var(--olive-muted))] p-6 md:p-8">
      <WeatherIcon className="w-14 h-14 md:w-16 md:h-16 text-[hsl(var(--olive))]" strokeWidth={1.5} />
      <div className="space-y-2">
        <div className="text-6xl md:text-7xl">{Math.round(temperatureC)}°</div>
        <div className="text-lg md:text-xl opacity-80">{getWeatherLabel(symbol)}</div>
        <div className="flex items-center gap-4 text-base md:text-lg opacity-70">
          {wind !== null && (
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--olive-light))]" strokeWidth={1.5} />
              <span>{wind.toFixed(1)} m/s</span>
            </div>
          )}
          {precipitation !== null && precipitation > 0 && (
            <div>{precipitation.toFixed(1)} mm</div>
          )}
        </div>
      </div>
    </div>
  );
}
