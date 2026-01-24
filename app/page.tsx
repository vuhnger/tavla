'use client';

import { useState } from 'react';
import { Clock } from '@/components/clock';
import { Weather } from '@/components/weather';
import { Departures } from '@/components/departures';
import type { StopLocation } from '@/lib/types';

export default function Home() {
  const [stopLocation, setStopLocation] = useState<StopLocation | undefined>();

  return (
    <main className="min-h-screen p-8 md:p-12 flex flex-col gap-12 md:gap-16">
      {/* Time - Large and prominent */}
      <div className="flex justify-center">
        <Clock />
      </div>

      {/* Weather - Compact block */}
      <div className="flex justify-center">
        <Weather location={stopLocation} />
      </div>

      {/* Departures - Primary visual weight */}
      <div className="flex-1 flex flex-col">
        <Departures onLocationChange={setStopLocation} />
      </div>
    </main>
  );
}
