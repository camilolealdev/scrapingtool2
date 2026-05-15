export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Ocp-Apim-Subscription-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const params = new URLSearchParams(req.query);
    const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params}`, {
      headers: { 'Ocp-Apim-Subscription-Key': req.headers['ocp-apim-subscription-key'] || '' },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
