'use client';

import Link from 'next/link';
import { Clothing } from '@/components/board/clothing';
import { Departures } from '@/components/board/departures';
import { Foot } from '@/components/board/foot';
import { Head } from '@/components/board/head';
import { News } from '@/components/board/news';
import { Screen } from '@/components/board/screen';
import { Workouts } from '@/components/board/workouts';
import { sceneSpec } from '@/components/scene/spec';
import { BOARD_ROWS, DEPARTURES_REFRESH_MS } from '@/lib/constants/departures';
import { NEWS_REFRESH_MS } from '@/lib/constants/news';
import { WEATHER_REFRESH_MS } from '@/lib/constants/weather';
import { WORKOUT_REFRESH_MS } from '@/lib/constants/workout';
import { upcomingLeaves } from '@/lib/departures/leave';
import { departuresUrl } from '@/lib/departures/url';
import { useNow } from '@/lib/time';
import { usePoll } from '@/lib/hooks/use-poll';
import { useReloadOnDeploy } from '@/lib/hooks/use-reload-on-deploy';
import { useSettings } from '@/lib/hooks/use-settings';
import { useWakeLock } from '@/lib/hooks/use-wake-lock';
import { isScreenOff } from '@/lib/screen';
import type { DeparturesResponse, NewsResponse, WeatherResponse, WorkoutResponse } from '@/lib/types';
import { hourAt, laterForecast, precipSpell } from '@/lib/weather/forecast';
import { outfitAt } from '@/lib/weather/outfit';
import { runLine } from '@/lib/weather/run';
import { sunLine } from '@/lib/weather/sun';
import { workoutLines } from '@/lib/workout/today';

export default function Board() {
  useReloadOnDeploy();
  const [settings] = useSettings();
  const now = useNow();
  const awake = now !== null && !isScreenOff(now);
  const departures = usePoll<DeparturesResponse>(awake && settings && departuresUrl(settings.stop.id), DEPARTURES_REFRESH_MS);
  const weather = usePoll<WeatherResponse>(awake && '/api/weather', WEATHER_REFRESH_MS);
  const plan = usePoll<WorkoutResponse>(awake && '/api/workout', WORKOUT_REFRESH_MS);
  const news = usePoll<NewsResponse>(awake && '/api/news', NEWS_REFRESH_MS);
  useWakeLock();
  if (!settings || !now) return <Screen className="cursor-none" />;
  if (isScreenOff(now)) return null;

  const hours = weather?.hours ?? [];
  const outfit = outfitAt(hours, now);
  const leaves = upcomingLeaves(departures?.departures ?? [], now, settings.quay, settings.walk, BOARD_ROWS);
  const workouts = workoutLines(plan?.workouts ?? [], now);
  const notes = [precipSpell(hours), laterForecast(hours, now), runLine(hours, now), sunLine(now)].filter((note) => note !== null);

  return (
    <Screen className="cursor-none">
      <Head now={now} hour={hourAt(hours, now)} />
      <Departures leaves={leaves} now={now} />
      {outfit && <Clothing spec={sceneSpec(hours, now, outfit)} />}
      {workouts.length > 0 && <Workouts lines={workouts} />}
      {news?.headline && <News headline={news.headline} />}
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
