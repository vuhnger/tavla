'use client';

import { useEffect, useState } from 'react';
import { TrainFront } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DeparturesResponse, Departure } from '@/lib/types';

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

function formatDepartureTime(minutesUntil: number): string {
  if (minutesUntil === 0) {
    return 'Nå';
  }
  return `${minutesUntil} min`;
}

export function Departures() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [stationName, setStationName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchDepartures = async () => {
    try {
      const response = await fetch('/api/departures', {
        cache: 'no-store',
      });

      if (response.ok) {
        const data: DeparturesResponse = await response.json();
        if (data.departures) {
          setDepartures(data.departures);
        }
        if (data.stationName) {
          setStationName(data.stationName);
        }
      } else {
        console.error('Failed to fetch departures:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching departures:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();

    const interval = setInterval(fetchDepartures, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Show placeholder rows while loading or if no data
  const rowCount = Math.max(departures.length, 8);
  const placeholderRows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <TrainFront className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
          <div>
            <h2 className="text-3xl md:text-4xl font-pixel">Avganger</h2>
            {stationName && (
              <p className="text-lg md:text-xl font-pixel text-primary opacity-80 mt-1">
                {stationName}
              </p>
            )}
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-pixel text-lg md:text-xl">Linje</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl">Destinasjon</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl">Plattform</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl text-right">Tid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading || departures.length === 0 ? (
            placeholderRows.map((i) => (
              <TableRow key={`placeholder-${i}`} className="border-border hover:bg-transparent">
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4 text-right">--</TableCell>
              </TableRow>
            ))
          ) : (
            departures.map((departure, index) => (
              <TableRow
                key={`${departure.line}-${departure.time}-${index}`}
                className="border-border hover:bg-transparent"
              >
                <TableCell className="font-pixel text-base md:text-lg py-4">{departure.line}</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">{departure.destination}</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">
                  {departure.platform || '--'}
                </TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4 text-right">
                  {formatDepartureTime(departure.minutesUntil)}
                  {!departure.realtime && (
                    <span className="ml-1 opacity-50">*</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
