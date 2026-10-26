import { NEWS_CACHE, NEWS_CACHE_MS, NEWS_FEED_URL } from '@/lib/constants/news';
import { REQUEST_TIMEOUT_MS } from '@/lib/constants/http';
import { pickHeadline } from '@/lib/news/headline';
import { respond } from '@/lib/respond';
import type { NewsResponse } from '@/lib/types';

let cache: { headline: string | null; expires: number } | null = null;

export async function GET() {
  if (cache && cache.expires > Date.now()) return respond<NewsResponse>({ headline: cache.headline }, 200, NEWS_CACHE);

  try {
    const response = await fetch(NEWS_FEED_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`NRK responded ${response.status}`);

    const headline = pickHeadline(await response.text());
    cache = { headline, expires: Date.now() + NEWS_CACHE_MS };
    return respond<NewsResponse>({ headline }, 200, NEWS_CACHE);
  } catch (error) {
    console.error('News fetch failed:', error instanceof Error ? error.message : error);
    return respond<NewsResponse>({ headline: null });
  }
}
