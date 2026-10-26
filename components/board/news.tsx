import { useEffect, useState } from 'react';
import { NEWS_ROTATE_MS } from '@/lib/constants/news';

export function News({ headlines }: { headlines: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => i + 1), NEWS_ROTATE_MS);
    return () => clearInterval(id);
  }, []);
  return <p className="absolute inset-x-24 bottom-[10.5rem] truncate text-[2.25rem] text-soft">{headlines[index % headlines.length]}</p>;
}
