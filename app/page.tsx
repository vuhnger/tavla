import { Clock } from '@/components/clock';
import { Weather } from '@/components/weather';
import { Departures } from '@/components/departures';

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-12 flex flex-col gap-12 md:gap-16">
      {/* Time - Large and prominent */}
      <div className="flex justify-center">
        <Clock />
      </div>

      {/* Weather - Compact block */}
      <div className="flex justify-center">
        <Weather />
      </div>

      {/* Departures - Primary visual weight */}
      <div className="flex-1 flex flex-col">
        <Departures />
      </div>
    </main>
  );
}
