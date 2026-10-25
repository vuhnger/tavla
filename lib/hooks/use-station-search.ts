import { useEffect, useState } from 'react';
import { SEARCH_DELAY_MS, SEARCH_MIN_LENGTH } from '@/lib/constants/departures';
import { stopSearchUrl } from '@/lib/departures/url';
import type { Stop, StopsResponse } from '@/lib/types';

export function useStationSearch(query: string): Stop[] {
  const [stops, setStops] = useState<Stop[]>([]);
  useEffect(() => {
    if (query.trim().length < SEARCH_MIN_LENGTH) {
      setStops([]);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(
      () =>
        fetch(stopSearchUrl(query), { signal: controller.signal })
          .then((response) => (response.ok ? response.json() : { stops: [] }))
          .then((body: StopsResponse) => setStops(body.stops))
          .catch(() => undefined),
      SEARCH_DELAY_MS,
    );
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);
  return stops;
}
