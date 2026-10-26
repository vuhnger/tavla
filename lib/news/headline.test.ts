import { expect, test } from 'bun:test';
import { NEWS_MAX_LENGTH } from '@/lib/constants/news';
import { pickHeadline } from './headline';

const item = (title: string, ...categories: string[]) => `<item><title>${title}</title><link>https://nrk.no/x</link>${categories.join('')}</item>`;
const high = '<category domain="emphasis">high</category>';
const low = '<category domain="emphasis">low</category>';
const feed = (...items: string[]) => `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NRK</title>${items.join('')}</channel></rss>`;

test('picks the first item with emphasis high', () => {
  expect(pickHeadline(feed(item('Ordinary', low), item('First', high), item('Second', high)))).toBe('First');
});

test('returns null when no item has emphasis high', () => {
  expect(pickHeadline(feed(item('A', low), item('B')))).toBeNull();
});

test('ignores ordinary categories and finds emphasis among several', () => {
  const ordinary = '<category>high</category>';
  const other = '<category domain="topic">high</category>';
  expect(pickHeadline(feed(item('Not it', ordinary, other), item('It', '<category>Innenriks</category>', high, '<category>Politikk</category>')))).toBe('It');
});

test('decodes named and numeric entities', () => {
  expect(pickHeadline(feed(item('Bj&#248;rn &amp; &#229;ge &lt;3', high)))).toBe('Bjørn & åge <3');
});

test('caps the length and trims', () => {
  const headline = pickHeadline(feed(item(`  ${'a'.repeat(NEWS_MAX_LENGTH + 50)}  `, high)));
  expect(headline).toBe('a'.repeat(NEWS_MAX_LENGTH));
});

test('returns null for bad xml or an empty title', () => {
  expect(pickHeadline('not xml at all')).toBeNull();
  expect(pickHeadline('')).toBeNull();
  expect(pickHeadline(feed(item('   ', high)))).toBeNull();
});
