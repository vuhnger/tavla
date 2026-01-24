'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Stop, StopLocation } from '@/lib/types';

interface StopSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStopSelect: (stopId: string, stopName: string, location?: StopLocation) => void;
}

export function StopSearch({ open, onOpenChange, onStopSelect }: StopSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const searchStops = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setStops([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stops/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setStops(data.stops || []);
      } else {
        console.error('Failed to search stops:', response.statusText);
        setStops([]);
      }
    } catch (error) {
      console.error('Error searching stops:', error);
      setStops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStops(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStops]);

  const handleStopClick = (stop: Stop) => {
    const hasCoordinates =
      typeof stop.latitude === 'number' && typeof stop.longitude === 'number';
    const location = hasCoordinates
      ? { latitude: stop.latitude as number, longitude: stop.longitude as number }
      : undefined;

    onStopSelect(stop.id, stop.name, location);
    onOpenChange(false);
    setSearchQuery('');
    setStops([]);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setStops([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-pixel text-2xl">Velg stasjon</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--olive))]" />
            <Input
              placeholder="Søk etter stasjon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-pixel"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="text-center py-8 text-muted-foreground font-pixel">
                Søker...
              </div>
            )}
            {!loading && searchQuery.trim().length > 0 && stops.length === 0 && (
              <div className="text-center py-8 text-muted-foreground font-pixel">
                Ingen stasjoner funnet
              </div>
            )}
            {!loading && stops.length > 0 && (
              <div className="space-y-1">
                {stops.map((stop) => (
                  <button
                    key={stop.id}
                    onClick={() => handleStopClick(stop)}
                    className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--olive-muted))]/20 border-l-2 border-transparent hover:border-l-[hsl(var(--olive))] rounded-md transition-all font-pixel"
                  >
                    <div className="font-medium">{stop.name}</div>
                    {stop.locality && (
                      <div className="text-sm text-muted-foreground">{stop.locality}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
