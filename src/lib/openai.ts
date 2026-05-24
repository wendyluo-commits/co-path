import OpenAI from 'openai';
import { TarotReadingJSONSchema } from '@/schemas/reading.schema';
import { NEW_SYSTEM_PROMPT, NEW_SYSTEM_PROMPT_EN } from '@/prompts/reading';

const API_KEY = process.env.OPENAI_API_KEY;

// 25s — leaves 5s headroom under the Vercel function maxDuration of 30s
// so the route can still return a fallback instead of timing out at the edge.
const REQUEST_TIMEOUT_MS = 25_000;

export const openai = new OpenAI({
  apiKey: API_KEY || 'dummy-key-for-build',
  timeout: REQUEST_TIMEOUT_MS,
  maxRetries: 0, // we handle retries ourselves in callOpenAI
});

export const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

function hasUsableKey(): boolean {
  return !!API_KEY && API_KEY !== 'dummy-key-for-build';
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
): Promise<{ success: true; data: any; usage: { input_tokens: number; output_tokens: number }; attempt: number }
         | { success: false; error: string; attempt: number }> {
  // Short-circuit when no API key is configured. Otherwise the SDK still tries
  // to dial out and burns ~60s of wall clock per request before failing.
  if (!hasUsableKey()) {
    return { success: false, error: 'OPENAI_API_KEY not configured', attempt: 0 };
  }

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

export interface FollowUpContext {
  previousQuestion?: string;
  previousSummary?: string;
}

function buildUserPrompt(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en',
  followUp?: FollowUpContext
): string {
  if (lang === 'en') {
    const parts = [`## User Question\n${question}`, `## Cards Drawn\n${cardContext}`];
    if (followUp?.previousQuestion || followUp?.previousSummary) {
      const ctxLines: string[] = ['## Follow-up Context'];
      if (followUp.previousQuestion) ctxLines.push(`Previous question: ${followUp.previousQuestion}`);
      if (followUp.previousSummary) ctxLines.push(`Summary of previous reading:\n${followUp.previousSummary}`);
      ctxLines.push('Extend the reading using the same cards drawn; focus on the new question.');
      parts.push(ctxLines.join('\n'));
    }
    return `Please provide a tarot reading based on the following:\n\n${parts.join('\n\n')}`;
  }

  const parts = [`## 用户问题\n${question}`, `## 抽到的牌\n${cardContext}`];
  if (followUp?.previousQuestion || followUp?.previousSummary) {
    const ctxLines: string[] = ['## 追问上下文'];
    if (followUp.previousQuestion) ctxLines.push(`此前问题：${followUp.previousQuestion}`);
    if (followUp.previousSummary) ctxLines.push(`上一轮解读摘要：\n${followUp.previousSummary}`);
    ctxLines.push('请结合同一组已抽出的牌，针对新的追问给出延伸解读。');
    parts.push(ctxLines.join('\n'));
  }
  return `请根据以下信息进行塔罗解读：\n\n${parts.join('\n\n')}`;
}

export async function generateTarotReadingWithAgent(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en' = 'zh',
  maxRetries: number = 1,
  followUp?: FollowUpContext
) {
  const systemPrompt = lang === 'en'
    ? `You are a warm and rigorous tarot reader. Combine traditional tarot wisdom with modern psychological insights. Use an understanding, supportive, and encouraging tone. Avoid fatalism — emphasize possibilities and choices.

For each card: write at least 2 sentences for interpretation (explaining the card's meaning in the context of the question), and at least 2 sentences for advice (specific, actionable guidance). The overall summary should be at least 3 sentences.`
    : `你是一位温暖而严谨的塔罗解读师。结合传统塔罗智慧与现代心理学洞察。用理解、支持、鼓励的语气与用户交流。避免宿命论，强调可能性和选择。

每张牌的 interpretation 字段至少写 2 句话（结合问题背景解释牌义），advice 字段至少写 2 句具体可行的建议。overall 整体总结至少 3 句话。`;

  return callOpenAI(systemPrompt, buildUserPrompt(question, cardContext, lang, followUp), maxRetries);
}

export async function generateNewTarotReading(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en' = 'zh',
  maxRetries: number = 1,
  followUp?: FollowUpContext
) {
  const systemPrompt = lang === 'en' ? NEW_SYSTEM_PROMPT_EN : NEW_SYSTEM_PROMPT;
  return callOpenAI(systemPrompt, buildUserPrompt(question, cardContext, lang, followUp), maxRetries);
}

export async function generateTarotReading(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
) {
  return callOpenAI(systemPrompt, userPrompt, maxRetries);
}

export async function checkOpenAIConnection(): Promise<boolean> {
  if (!hasUsableKey()) return false;
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
