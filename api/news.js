export default async function handler(req, res) {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'city is required' });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NEWS_API_KEY not configured' });
  }

  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', city);
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', '8');
  url.searchParams.set('language', 'en');
  url.searchParams.set('apiKey', apiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `NewsAPI error: ${response.status}`);
    }
    const data = await response.json();
    const articles = (data.articles || []).filter(
      (a) => a.title && a.title !== '[Removed]' && a.url
    );
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.json({ articles });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
