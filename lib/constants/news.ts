import { minutesToMilliseconds } from 'date-fns';

export const NEWS_FEED_URL = 'https://www.nrk.no/toppsaker.rss';
export const NEWS_REFRESH_MS = minutesToMilliseconds(15);
export const NEWS_CACHE_MS = minutesToMilliseconds(10);
export const NEWS_CACHE = 's-maxage=600';
export const NEWS_MAX_LENGTH = 200;
export const NEWS_EMPHASIS_DOMAIN = 'emphasis';
export const NEWS_EMPHASIS_HIGH = 'high';
