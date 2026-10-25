'use client';

import { useState } from 'react';
import { SEARCH_MAX_LENGTH } from '@/lib/constants/departures';
import { useStationSearch } from '@/lib/hooks/use-station-search';
import type { Stop } from '@/lib/types';

export function StationField({ label, stop, onPick }: { label: string; stop: Stop; onPick: (stop: Stop) => void }) {
  const [query, setQuery] = useState(stop.name);
  const hits = useStationSearch(query === stop.name ? '' : query);

  return (
    <div>
      <input
        aria-label={label}
        className="field focusable"
        value={query}
        maxLength={SEARCH_MAX_LENGTH}
        onFocus={(event) => event.target.select()}
        onChange={(event) => setQuery(event.target.value)}
      />
      {hits.length > 0 && (
        <ul className="mt-4 min-w-[28.75rem] text-[2.75rem]">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="focusable w-full px-4 py-1.5 text-left uppercase hover:bg-osd hover:text-panel focus-visible:bg-osd focus-visible:text-panel"
                onClick={() => {
                  setQuery(hit.name);
                  onPick(hit);
                }}
              >
                {hit.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
