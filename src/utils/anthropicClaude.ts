export async function callAnthropicClaude(
  apiKey: string,
  prompt: string,
  systemInstruction: string
): Promise<any[]> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
      "content-type": "application/json",
      "anthropic-dangerous-allow-browser": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemInstruction + "\n\nIMPORTANT: Your final response must be ONLY a valid JSON array of lead objects, no prose before or after.",
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: prompt + "\n\nReturn ONLY a raw JSON array, no markdown fences." }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();

  // Collect all text blocks (pre-search + post-search text)
  const text = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text as string)
    .join("\n");

  if (!text) throw new Error("Claude returned no text content");

  // Find all candidate JSON arrays, pick the largest (most complete) one
  const candidates = [...text.matchAll(/\[[\s\S]*?\]/g)].map(m => m[0]);
  for (const candidate of candidates.sort((a, b) => b.length - a.length)) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      continue;
    }
  }

  throw new Error("No valid JSON array found in Claude response");
}
