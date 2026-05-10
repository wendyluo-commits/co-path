import Anthropic from '@anthropic-ai/sdk';
import { TarotReadingJSONSchema } from '@/schemas/reading.schema';
import { NEW_SYSTEM_PROMPT, NEW_SYSTEM_PROMPT_EN } from '@/prompts/reading';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-build',
});

export const MODEL_NAME = process.env.MODEL_NAME || 'claude-haiku-4-5-20251001';

// Shared tool definition — Claude returns the reading as a tool call input,
// giving us the same structured-output guarantee as OpenAI's json_schema mode.
const READING_TOOL: Anthropic.Tool = {
  name: 'tarot_reading',
  description: 'Return the complete tarot reading in structured JSON format.',
  input_schema: TarotReadingJSONSchema as unknown as Anthropic.Tool['input_schema'],
};

async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
): Promise<{ success: true; data: unknown; usage: Anthropic.Usage; attempt: number }
         | { success: false; error: string; attempt: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL_NAME,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        tools: [READING_TOOL],
        tool_choice: { type: 'tool', name: 'tarot_reading' },
      });

      const toolBlock = response.content.find(b => b.type === 'tool_use');
      if (!toolBlock || toolBlock.type !== 'tool_use') {
        throw new Error('No tool_use block in response');
      }

      return {
        success: true,
        data: toolBlock.input,
        usage: response.usage,
        attempt: attempt + 1,
      };
    } catch (error) {
      lastError = error as Error;
      const status = (error as any)?.status;
      // Permanent errors — retrying won't help
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

/**
 * 使用Custom Agent风格的提示词进行塔罗解读
 */
export async function generateTarotReadingWithAgent(
  question: string,
  cardContext: string,
  lang: 'zh' | 'en' = 'zh',
  maxRetries: number = 1
) {
  const systemPrompt = lang === 'en'
    ? `You are a warm and rigorous tarot reader. Combine traditional tarot wisdom with modern psychological insights. Use an understanding, supportive, and encouraging tone. Avoid fatalism — emphasize possibilities and choices. You must call the tarot_reading tool with the complete structured reading.`
    : `你是一位温暖而严谨的塔罗解读师。结合传统塔罗智慧与现代心理学洞察。用理解、支持、鼓励的语气与用户交流。避免宿命论，强调可能性和选择。你必须调用 tarot_reading 工具返回完整的结构化解读。`;

  const userPrompt = lang === 'en'
    ? `Please provide a tarot reading based on the following:\n\n## User Question\n${question}\n\n## Cards Drawn\n${cardContext}`
    : `请根据以下信息进行塔罗解读：\n\n## 用户问题\n${question}\n\n## 抽到的牌\n${cardContext}`;

  return callClaude(systemPrompt, userPrompt, maxRetries);
}

/**
 * 使用新版提示词和schema生成塔罗解读
 */
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

  return callClaude(systemPrompt, userPrompt, maxRetries);
}

/**
 * 通用生成函数（供外部直接传入 system/user prompt 时使用）
 */
export async function generateTarotReading(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 1
) {
  return callClaude(systemPrompt, userPrompt, maxRetries);
}

/**
 * 检查 Claude API 连接状态
 */
export async function checkOpenAIConnection(): Promise<boolean> {
  try {
    await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'hi' }],
    });
    return true;
  } catch {
    return false;
  }
}
