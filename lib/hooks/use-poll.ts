import { useEffect, useState } from 'react';

export function usePoll<T>(url: string | null, intervalMs: number): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    setData(null);
    if (!url) return;
    let live = true;
    const load = () =>
      fetch(url, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: T | null) => live && body && setData(body))
        .catch(() => undefined);
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [url, intervalMs]);
  return data;
}
