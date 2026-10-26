import { XMLParser } from 'fast-xml-parser';
import { NEWS_COUNT, NEWS_EMPHASIS_DOMAIN, NEWS_EMPHASIS_HIGH, NEWS_MAX_LENGTH } from '@/lib/constants/news';

interface Category {
  '#text'?: unknown;
  '@_domain'?: string;
}

interface Item {
  title?: unknown;
  category?: Category[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  htmlEntities: true,
  parseTagValue: false,
  isArray: (name) => name === 'item' || name === 'category',
});

const isHigh = (item: Item) =>
  (item.category ?? []).some(
    (category) => typeof category === 'object' && category['@_domain'] === NEWS_EMPHASIS_DOMAIN && String(category['#text']).trim() === NEWS_EMPHASIS_HIGH,
  );

const titleOf = (item: Item) => (typeof item.title === 'string' ? item.title.trim().slice(0, NEWS_MAX_LENGTH).trim() : '');

export function pickHeadlines(xml: string): string[] {
  const items: Item[] = parser.parse(xml)?.rss?.channel?.item ?? [];
  const ranked = [...items.filter(isHigh), ...items.filter((item) => !isHigh(item))];
  return [...new Set(ranked.map(titleOf).filter(Boolean))].slice(0, NEWS_COUNT);
}
