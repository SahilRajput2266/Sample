export const generateWithGemini = async ({ systemPrompt, userPrompt, model }) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: 'POST', signal: AbortSignal.timeout(60000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4000 } }),
  });
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const data = await response.json(), text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  if (!text) throw new Error('Gemini returned an empty response');
  return { text, inputTokens: data.usageMetadata?.promptTokenCount || 0, outputTokens: data.usageMetadata?.candidatesTokenCount || 0 };
};
