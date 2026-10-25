import { useEffect, useState } from 'react';

const MINUTE = 60_000;

export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const date = new Date();
      setNow(date);
      id = setTimeout(tick, MINUTE - (date.getTime() % MINUTE));
    };
    tick();
    return () => clearTimeout(id);
  }, []);
  return now;
}
