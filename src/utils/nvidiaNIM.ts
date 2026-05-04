export async function callNVIDIANIM(apiKey: string, model: string, prompt: string) {
  const resp = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  });
  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}
