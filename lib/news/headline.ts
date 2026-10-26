import { XMLParser } from 'fast-xml-parser';
import { NEWS_EMPHASIS_DOMAIN, NEWS_EMPHASIS_HIGH, NEWS_MAX_LENGTH } from '@/lib/constants/news';

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

export function pickHeadline(xml: string): string | null {
  const items: Item[] = parser.parse(xml)?.rss?.channel?.item ?? [];
  const title = items.find(isHigh)?.title;
  const text = typeof title === 'string' ? title.trim().slice(0, NEWS_MAX_LENGTH).trim() : '';
  return text || null;
}
