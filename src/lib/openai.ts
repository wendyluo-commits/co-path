import OpenAI from 'openai';
import { TarotReadingJSONSchema } from '@/schemas/reading.schema';
import { NEW_SYSTEM_PROMPT, NEW_SYSTEM_PROMPT_EN } from '@/prompts/reading';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
): Promise<{ success: true; data: any; usage: { input_tokens: number; output_tokens: number }; attempt: number }
         | { success: false; error: string; attempt: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'tarot_reading',
            strict: true,
            schema: TarotReadingJSONSchema as any,
          },
        },
        max_completion_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const data = JSON.parse(content);
      return {
        success: true,
        data,
        usage: {
          input_tokens: response.usage?.prompt_tokens || 0,
          output_tokens: response.usage?.completion_tokens || 0,
        },
        attempt: attempt + 1,
      };
    } catch (error) {
      lastError = error as Error;
      const status = (error as any)?.status;
      if (status === 429 || status === 401 || status === 403) break;
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempt: maxRetries + 1,
  };
}

export async function generateTarotReadingWithAgent(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en' = 'zh',
  maxRetries: number = 1
) {
  const systemPrompt = lang === 'en'
    ? `You are a warm and rigorous tarot reader. Combine traditional tarot wisdom with modern psychological insights. Use an understanding, supportive, and encouraging tone. Avoid fatalism — emphasize possibilities and choices.

For each card: write at least 2 sentences for interpretation (explaining the card's meaning in the context of the question), and at least 2 sentences for advice (specific, actionable guidance). The overall summary should be at least 3 sentences.`
    : `你是一位温暖而严谨的塔罗解读师。结合传统塔罗智慧与现代心理学洞察。用理解、支持、鼓励的语气与用户交流。避免宿命论，强调可能性和选择。

每张牌的 interpretation 字段至少写 2 句话（结合问题背景解释牌义），advice 字段至少写 2 句具体可行的建议。overall 整体总结至少 3 句话。`;

  const userPrompt = lang === 'en'
    ? `Please provide a tarot reading based on the following:\n\n## User Question\n${question}\n\n## Cards Drawn\n${cardContext}`
    : `请根据以下信息进行塔罗解读：\n\n## 用户问题\n${question}\n\n## 抽到的牌\n${cardContext}`;

  return callOpenAI(systemPrompt, userPrompt, maxRetries);
}

export async function generateNewTarotReading(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en' = 'zh',
  maxRetries: number = 1
) {
  const systemPrompt = lang === 'en' ? NEW_SYSTEM_PROMPT_EN : NEW_SYSTEM_PROMPT;

  const userPrompt = lang === 'en'
    ? `Please provide a tarot reading based on the following:\n\n## User Question\n${question}\n\n## Cards Drawn\n${cardContext}`
    : `请根据以下信息进行塔罗解读：\n\n## 用户问题\n${question}\n\n## 抽到的牌\n${cardContext}`;

  return callOpenAI(systemPrompt, userPrompt, maxRetries);
}

export async function generateTarotReading(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
) {
  return callOpenAI(systemPrompt, userPrompt, maxRetries);
}

export async function checkOpenAIConnection(): Promise<boolean> {
  try {
    await openai.chat.completions.create({
      model: MODEL_NAME,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'hi' }],
    });
    return true;
  } catch {
    return false;
  }
}
