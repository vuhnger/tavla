'use client';

import { useEffect, useRef, useState } from 'react';
import { TrainFront } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StopSearch } from '@/components/stop-search';
import type { DeparturesResponse, Departure, StopLocation } from '@/lib/types';

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds
const STORAGE_KEY = 'tavla-selected-stop';
const DIRECTION_STORAGE_KEY = 'tavla-direction-filter';
const LOCATION_STORAGE_KEY = 'tavla-stop-location';
const DIRECTION_OPTIONS = [
  { value: 'both', label: 'Begge' },
  { value: 'mot', label: 'Til sentrum' },
  { value: 'fra', label: 'Fra sentrum' },
] as const;

type DirectionFilter = (typeof DIRECTION_OPTIONS)[number]['value'];

interface StoredStop {
  id: string;
  name: string;
}

function formatDepartureTime(minutesUntil: number): string {
  if (minutesUntil === 0) {
    return 'Nå';
  }
  return `${minutesUntil} min`;
}

function formatDirection(direction: Departure['direction']): string {
  return direction === 'mot sentrum' ? 'Til sentrum' : 'Fra sentrum';
}

interface DeparturesProps {
  onLocationChange?: (location: StopLocation) => void;
}

export function Departures({ onLocationChange }: DeparturesProps) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [stationName, setStationName] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('both');
  const [directionOpen, setDirectionOpen] = useState(false);
  const directionMenuRef = useRef<HTMLDivElement | null>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const fetchDepartures = async (stopId?: string) => {
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      const url = stopId
        ? `/api/departures?stopPlaceId=${encodeURIComponent(stopId)}`
        : '/api/departures';

      const response = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.ok) {
        const data: DeparturesResponse = await response.json();
        if (data.departures) {
          setDepartures(data.departures);
        }
        if (data.stationName) {
          setStationName(data.stationName);
        }
        if (data.stopLocation) {
          if (onLocationChange) {
            onLocationChange(data.stopLocation);
          }
          try {
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data.stopLocation));
          } catch (error) {
            console.error('Error saving stop location to localStorage:', error);
          }
        }
      } else {
        console.error('Failed to fetch departures:', response.statusText);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching departures:', error);
    } finally {
      if (fetchControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  const handleStopSelect = (stopId: string, stopName: string, location?: StopLocation) => {
    setSelectedStopId(stopId);
    setStationName(stopName);
    setLoading(true);

    // Save to localStorage
    try {
      const storedStop: StoredStop = { id: stopId, name: stopName };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedStop));
      if (location) {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      } else {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving stop to localStorage:', error);
    }

    if (location && onLocationChange) {
      onLocationChange(location);
    }

    // Fetch departures for new stop
    fetchDepartures(stopId);
  };

  useEffect(() => {
    // Try to load saved stop from localStorage
    let hasStoredStop = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { id, name } = JSON.parse(stored) as StoredStop;
        setSelectedStopId(id);
        setStationName(name);
        if (onLocationChange) {
          try {
            const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
            if (storedLocation) {
              const parsed = JSON.parse(storedLocation) as StopLocation;
              if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
                onLocationChange(parsed);
              }
            }
          } catch (error) {
            console.error('Error loading saved stop location:', error);
          }
        }
        fetchDepartures(id);
        hasStoredStop = true;
      }
    } catch (error) {
      console.error('Error loading saved stop:', error);
    }

    // Try to load saved direction filter
    try {
      const storedDirection = localStorage.getItem(DIRECTION_STORAGE_KEY);
      if (storedDirection === 'both' || storedDirection === 'mot' || storedDirection === 'fra') {
        setDirectionFilter(storedDirection);
      }
    } catch (error) {
      console.error('Error loading direction filter:', error);
    }

    if (!hasStoredStop) {
      // No saved stop, fetch default
      fetchDepartures();
    }
  }, []);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DIRECTION_STORAGE_KEY, directionFilter);
    } catch (error) {
      console.error('Error saving direction filter:', error);
    }
  }, [directionFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDepartures(selectedStopId || undefined);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedStopId]);

  useEffect(() => {
    if (!directionOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!directionMenuRef.current) {
        return;
      }
      if (!directionMenuRef.current.contains(event.target as Node)) {
        setDirectionOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDirectionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [directionOpen]);

  const visibleDepartures = departures.filter((departure) => {
    if (directionFilter === 'both') {
      return true;
    }
    if (directionFilter === 'mot') {
      return departure.direction === 'mot sentrum';
    }
    return departure.direction === 'fra sentrum';
  });

  // Show placeholder rows while loading or if no data
  const rowCount = Math.max(visibleDepartures.length, 8);
  const placeholderRows = Array.from({ length: rowCount }, (_, i) => i);
  const selectedDirectionLabel =
    DIRECTION_OPTIONS.find((option) => option.value === directionFilter)?.label ?? 'Begge';
  const showEmptyFiltered =
    !loading && departures.length > 0 && visibleDepartures.length === 0;

  return (
    <>
      <StopSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onStopSelect={handleStopSelect}
      />
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <TrainFront className="w-10 h-10 md:w-12 md:h-12 text-[hsl(var(--olive))]" strokeWidth={1.5} />
            <div>
              <h2 className="text-3xl md:text-4xl font-pixel">Avganger</h2>
              <button
                onClick={() => setSearchOpen(true)}
                className="text-lg md:text-xl font-pixel text-primary opacity-80 mt-1 hover:opacity-100 hover:underline cursor-pointer transition-all"
                aria-label="Velg stoppested"
              >
                {stationName || 'Velg stoppested'}
              </button>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg md:text-xl font-pixel text-primary opacity-70">
                  Retning:
                </span>
                <div className="relative" ref={directionMenuRef}>
                  <button
                    onClick={() => setDirectionOpen((open) => !open)}
                    className="text-lg md:text-xl font-pixel text-primary opacity-80 hover:opacity-100 hover:underline cursor-pointer transition-all"
                    aria-haspopup="menu"
                    aria-expanded={directionOpen}
                    aria-label="Velg retning"
                  >
                    {selectedDirectionLabel}
                  </button>
                  {directionOpen && (
                    <div
                      role="menu"
                      className="absolute z-10 mt-2 min-w-[180px] rounded-md border border-[hsl(var(--olive-muted))] bg-[hsl(var(--background))] shadow-lg"
                    >
                      {DIRECTION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          role="menuitem"
                          onClick={() => {
                            setDirectionFilter(option.value);
                            setDirectionOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 font-pixel text-base md:text-lg transition-colors ${
                            option.value === directionFilter
                              ? 'bg-[hsl(var(--olive-muted))]/30'
                              : 'hover:bg-[hsl(var(--olive-muted))]/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-[hsl(var(--olive-muted))] hover:bg-transparent">
            <TableHead className="font-pixel text-lg md:text-xl">Linje</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl">Destinasjon</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl">Retning</TableHead>
            <TableHead className="font-pixel text-lg md:text-xl text-right">Tid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading || departures.length === 0 ? (
            placeholderRows.map((i) => (
              <TableRow
                key={`placeholder-${i}`}
                className={`border-border hover:bg-transparent ${i % 2 === 1 ? 'border-l-2 border-l-[hsl(var(--olive-muted))]' : ''}`}
              >
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">--</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4 text-right">--</TableCell>
              </TableRow>
            ))
          ) : showEmptyFiltered ? (
            <TableRow className="border-border hover:bg-transparent">
              <TableCell className="font-pixel text-base md:text-lg py-6 text-center opacity-70" colSpan={4}>
                Ingen avganger i valgt retning
              </TableCell>
            </TableRow>
          ) : (
            visibleDepartures.map((departure, index) => (
              <TableRow
                key={`${departure.line}-${departure.time}-${index}`}
                className={`border-border hover:bg-transparent ${index % 2 === 1 ? 'border-l-2 border-l-[hsl(var(--olive-muted))]' : ''}`}
              >
                <TableCell className="font-pixel text-base md:text-lg py-4">{departure.line}</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">{departure.destination}</TableCell>
                <TableCell className="font-pixel text-base md:text-lg py-4">
                  {formatDirection(departure.direction)}
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
    </>
  );
}
