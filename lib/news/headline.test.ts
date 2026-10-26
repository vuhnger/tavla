import { expect, test } from 'bun:test';
import { NEWS_COUNT, NEWS_MAX_LENGTH } from '@/lib/constants/news';
import { pickHeadlines } from './headline';

const item = (title: string, ...categories: string[]) => `<item><title>${title}</title><link>https://nrk.no/x</link>${categories.join('')}</item>`;
const high = '<category domain="emphasis">high</category>';
const low = '<category domain="emphasis">low</category>';
const feed = (...items: string[]) => `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>NRK</title>${items.join('')}</channel></rss>`;

test('puts emphasis high first and keeps feed order within each group', () => {
  expect(pickHeadlines(feed(item('A', low), item('B', high), item('C'), item('D', high)))).toEqual(['B', 'D', 'A', 'C']);
});

test('drops repeated titles and stops at the headline count', () => {
  const titles = ['One', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  expect(pickHeadlines(feed(...titles.map((title) => item(title))))).toEqual(['One', 'Two', 'Three', 'Four', 'Five', 'Six'].slice(0, NEWS_COUNT));
});

test('ignores ordinary categories and finds emphasis among several', () => {
  const ordinary = '<category>high</category>';
  const other = '<category domain="topic">high</category>';
  expect(pickHeadlines(feed(item('Not it', ordinary, other), item('It', '<category>Innenriks</category>', high, '<category>Politikk</category>')))).toEqual([
    'It',
    'Not it',
  ]);
});

test('decodes named and numeric entities', () => {
  expect(pickHeadlines(feed(item('Bj&#248;rn &amp; &#229;ge &lt;3', high)))).toEqual(['Bjørn & åge <3']);
});

test('caps the length and trims', () => {
  expect(pickHeadlines(feed(item(`  ${'a'.repeat(NEWS_MAX_LENGTH + 50)}  `, high)))).toEqual(['a'.repeat(NEWS_MAX_LENGTH)]);
});

test('returns nothing for bad xml or empty titles', () => {
  expect(pickHeadlines('not xml at all')).toEqual([]);
  expect(pickHeadlines('')).toEqual([]);
  expect(pickHeadlines(feed(item('   ', high)))).toEqual([]);
});
