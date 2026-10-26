import { NEWS_CACHE, NEWS_CACHE_MS, NEWS_FEED_URL } from '@/lib/constants/news';
import { REQUEST_TIMEOUT_MS } from '@/lib/constants/http';
import { pickHeadlines } from '@/lib/news/headline';
import { respond } from '@/lib/respond';
import type { NewsResponse } from '@/lib/types';

let cache: { headlines: string[]; expires: number } | null = null;

export async function GET() {
  if (cache && cache.expires > Date.now()) return respond<NewsResponse>({ headlines: cache.headlines }, 200, NEWS_CACHE);

  try {
    const response = await fetch(NEWS_FEED_URL, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`NRK responded ${response.status}`);

    const headlines = pickHeadlines(await response.text());
    cache = { headlines, expires: Date.now() + NEWS_CACHE_MS };
    return respond<NewsResponse>({ headlines }, 200, NEWS_CACHE);
  } catch (error) {
    console.error('News fetch failed:', error instanceof Error ? error.message : error);
    return respond<NewsResponse>({ headlines: [] });
  }
}
