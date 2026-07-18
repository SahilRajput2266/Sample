const extractText = (response) => response.output_text || response.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text).join('\n') || '';

export const generateWithOpenAI = async ({ systemPrompt, userPrompt, model }) => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, instructions: systemPrompt, input: userPrompt, max_output_tokens: 4000 }),
  });
  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);
  const data = await response.json(), text = extractText(data);
  if (!text) throw new Error('OpenAI returned an empty response');
  return { text, inputTokens: data.usage?.input_tokens || 0, outputTokens: data.usage?.output_tokens || 0 };
};
