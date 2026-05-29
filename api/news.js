import { XMLParser } from 'fast-xml-parser';

const SOURCES = [
  { name: 'Mosaique FM',        url: 'https://www.mosaiquefm.net/fr/rss' },
  { name: 'Tunisie Numérique',  url: 'https://www.tunisienumerique.com/feed/' },
  { name: 'Kapitalis',          url: 'https://www.kapitalis.com/feed/' },
  { name: 'Business News TN',   url: 'https://www.businessnews.com.tn/feed/' },
  { name: 'Webdo',              url: 'https://www.webdo.tn/feed/' },
  { name: 'HuffPost Tunisie',   url: 'https://www.huffpostmaghreb.com/tunisie/feed/' },
  { name: 'Shems FM',           url: 'https://www.shemsfm.net/fr/rss' },
  { name: 'TAP',                url: 'https://www.tap.info.tn/en/rss.xml' },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: name => name === 'item' || name === 'entry',
});

function stripHtml(str) {
  return String(str ?? '')
    .replace(/<[^>]*>/g, '')
    .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#039;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item) {
  const mc = item['media:content'];
  if (mc?.['@_url']) return mc['@_url'];
  if (Array.isArray(mc) && mc[0]?.['@_url']) return mc[0]['@_url'];
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url'];
  if (item.enclosure?.['@_url']) return item.enclosure['@_url'];
  const src = /<img[^>]+src=["']([^"']+)["']/i.exec(String(item['content:encoded'] ?? item.description ?? ''));
  return src?.[1] ?? null;
}

async function fetchRSS({ name, url }) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'TunisiaWeatherNews/1.0 RSS Reader' },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const doc = parser.parse(xml);

    const items = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
    const arr = Array.isArray(items) ? items : [items];

    return arr.slice(0, 6).map(item => {
      const link = typeof item.link === 'string'
        ? item.link
        : item.link?.['@_href'] ?? item.guid ?? '';
      return {
        title: stripHtml(item.title),
        url: link,
        source: { name },
        publishedAt: item.pubDate ?? item.updated ?? item.published ?? null,
        description: stripHtml(item.description ?? item.summary ?? '').slice(0, 220),
        urlToImage: extractImage(item),
      };
    }).filter(a => a.title && a.url);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const { city } = req.query;

  const settled = await Promise.allSettled(SOURCES.map(fetchRSS));
  const seen = new Set();
  let articles = settled
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return a.title && a.url;
    });

  articles.sort((a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0));

  // Filter by city keyword if provided
  if (city) {
    const q = city.toLowerCase();
    const cityArticles = articles.filter(a =>
      (a.title + ' ' + a.description).toLowerCase().includes(q)
    );
    if (cityArticles.length >= 2) {
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300');
      return res.json({ articles: cityArticles.slice(0, 8), label: city });
    }
  }

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300');
  return res.json({ articles: articles.slice(0, 8), label: 'Tunisia' });
}
