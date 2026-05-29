async function search(query, apiKey, pageSize = 8) {
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', String(pageSize));
  url.searchParams.set('language', 'en');
  url.searchParams.set('apiKey', apiKey);
  const r = await fetch(url.toString());
  if (!r.ok) return [];
  const data = await r.json();
  return (data.articles || []).filter(a => a.title && a.title !== '[Removed]' && a.url);
}

async function topHeadlines(apiKey) {
  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('language', 'en');
  url.searchParams.set('pageSize', '8');
  url.searchParams.set('apiKey', apiKey);
  const r = await fetch(url.toString());
  if (!r.ok) return [];
  const data = await r.json();
  return (data.articles || []).filter(a => a.title && a.title !== '[Removed]' && a.url);
}

export default async function handler(req, res) {
  const { city, country } = req.query;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'NEWS_API_KEY not configured' });

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  // 1. Try city name
  if (city) {
    const articles = await search(city, apiKey).catch(() => []);
    if (articles.length >= 2) return res.json({ articles, label: city });
  }

  // 2. Try country name
  if (country) {
    const articles = await search(country, apiKey).catch(() => []);
    if (articles.length >= 2) return res.json({ articles, label: country });
  }

  // 3. Global top headlines fallback
  const articles = await topHeadlines(apiKey).catch(() => []);
  return res.json({ articles, label: 'Top Headlines' });
}
