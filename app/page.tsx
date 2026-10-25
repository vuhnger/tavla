'use client';

import Link from 'next/link';
import { Clothing } from '@/components/board/clothing';
import { Departures } from '@/components/board/departures';
import { Foot } from '@/components/board/foot';
import { Head } from '@/components/board/head';
import { Screen } from '@/components/board/screen';
import { sceneSpec } from '@/components/scene/spec';
import { BOARD_ROWS, DEPARTURES_REFRESH_MS } from '@/lib/constants/departures';
import { WEATHER_REFRESH_MS } from '@/lib/constants/weather';
import { upcomingLeaves } from '@/lib/departures/leave';
import { departuresUrl } from '@/lib/departures/url';
import { useNow } from '@/lib/hooks/use-now';
import { usePoll } from '@/lib/hooks/use-poll';
import { useSettings } from '@/lib/hooks/use-settings';
import type { DeparturesResponse, WeatherResponse } from '@/lib/types';
import { hourAt, laterForecast, precipSpell } from '@/lib/weather/forecast';
import { outfitAt } from '@/lib/weather/outfit';
import { sunLine } from '@/lib/weather/sun';

export default function Board() {
  const [settings] = useSettings();
  const now = useNow();
  const departures = usePoll<DeparturesResponse>(settings && departuresUrl(settings.stop.id), DEPARTURES_REFRESH_MS);
  const weather = usePoll<WeatherResponse>('/api/weather', WEATHER_REFRESH_MS);
  if (!settings || !now) return <Screen />;

  const hours = weather?.hours ?? [];
  const outfit = outfitAt(hours, now);
  const leaves = upcomingLeaves(departures?.departures ?? [], now, settings.quay, settings.walk, BOARD_ROWS);
  const notes = [precipSpell(hours), laterForecast(hours, now), sunLine(now)].filter((note) => note !== null);

  return (
    <Screen>
      <Head now={now} hour={hourAt(hours, now)} />
      <Departures leaves={leaves} now={now} />
      {outfit && <Clothing spec={sceneSpec(hours, now, outfit)} />}
      <Foot>
        {notes.map((note) => (
          <span key={note}>{note}</span>
        ))}
        <Link href="/innstillinger" className="focusable ml-auto">
          meny
        </Link>
      </Foot>
    </Screen>
  );
}
