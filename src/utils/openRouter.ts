export async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction: string
) {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`OpenRouter API error: ${resp.status} ${error}`);
  }

  const data = await resp.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error(`OpenRouter unexpected response: ${JSON.stringify(data)}`);
  }

  return JSON.parse(data.choices[0].message.content);
}
