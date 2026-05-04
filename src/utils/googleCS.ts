export async function googleCustomSearch(apiKey: string, cx: string, query: string) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data.items || [];
}
