import OpenAI from 'openai';
import { TarotReadingJSONSchema } from '@/schemas/reading.schema';
import { NEW_SYSTEM_PROMPT } from '@/prompts/reading';

// 初始化 OpenAI 客户端
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// 模型配置
export const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o';

/**
 * 使用 Structured Outputs 调用 OpenAI API
 */
export async function generateTarotReading(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 2
) {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "tarot_reading",
            strict: true,
            schema: TarotReadingJSONSchema
          }
        },
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      // 解析 JSON 响应
      const parsedResponse = JSON.parse(content);
      
      return {
        success: true,
        data: parsedResponse,
        usage: response.usage,
        attempt: attempt + 1
      };
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempt: maxRetries + 1
  };
}

/**
 * 流式生成（用于未来扩展）
 */
export async function generateTarotReadingStream(
  systemPrompt: string,
  userPrompt: string
) {
  try {
    const stream = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    });

    return stream;
  } catch (error) {
    console.error('Stream generation failed:', error);
    throw error;
  }
}

/**
 * 使用Custom GPT Agent进行塔罗解读
 * 基于您的"温暖严谨塔罗解读师"agent的配置
 */
export async function generateTarotReadingWithAgent(
  question: string,
  cardContext: string,
  maxRetries: number = 2
) {
  let lastError: Error | null = null;
  
  // 基于您的Custom GPT Agent"温暖严谨塔罗解读师"的完整配置
  const systemPrompt = `# 温暖严谨塔罗解读师

你是一位专业的塔罗解读师，具有以下特质：

## 核心身份
- 温暖而严谨的塔罗解读师
- 专门输出严格JSON格式供前端渲染
- 结合传统塔罗智慧与现代心理学洞察

## 解读风格
- **温暖关怀**：用理解、支持、鼓励的语气与用户交流
- **严谨专业**：基于塔罗牌的传统含义和象征体系
- **实用导向**：提供具体可行的建议和行动步骤
- **积极正面**：强调用户的自主选择权和改变能力
- **避免宿命论**：不做绝对化预测，强调可能性和选择

## 解读原则
1. **直接回答用户问题**：每张牌的解释都必须直接回应用户提出的具体问题
2. **结合问题情境**：将牌面含义与用户的问题情境紧密结合，而不是给出通用解释
3. **提供针对性洞察**：基于用户的问题，提供个性化的洞察和建议
4. **保持塔罗牌本质**：在回答问题的同时，保持塔罗牌的象征性和启发性
5. **避免通用解释**：不要只解释牌面含义，要说明这张牌如何回答用户的问题

## 输出要求
- 必须严格遵循JSON Schema格式
- 每张卡的解释不少于50字
- 每张卡的建议不少于40字
- 整体总结不少于80字
- 包含安全提示和免责声明

## 语言风格
- 使用温暖、理解的语调
- 避免过于神秘或恐吓的表达
- 用"您"称呼用户，保持尊重
- 语言简洁明了，易于理解

请严格按照JSON Schema格式输出结果。`;

  const userPrompt = `请根据以下信息进行塔罗解读：

## 用户问题
${question}

## 抽到的牌
${cardContext}

## 解读要求
- **必须直接回答用户的问题**：每段解读都要针对用户的具体问题进行分析
- **结合问题情境**：将牌面含义与用户的问题情境紧密结合
- **避免通用解释**：不要只解释牌面含义，要说明这张牌如何回答用户的问题
- **提供针对性洞察**：基于用户的问题，提供个性化的洞察和建议
- **保持塔罗牌本质**：在回答问题的同时，保持塔罗牌的象征性和启发性

请按照JSON格式返回解读结果，确保每段解读都直接回应用户的问题。`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "tarot_reading",
            strict: true,
            schema: TarotReadingJSONSchema
          }
        },
        temperature: 0.7,
        max_tokens: 3000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      // 解析 JSON 响应
      const parsedResponse = JSON.parse(content);
      
      return {
        success: true,
        data: parsedResponse,
        usage: response.usage,
        attempt: attempt + 1
      };
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Agent attempt ${attempt + 1} failed:`, error);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempt: maxRetries + 1
  };
}

/**
 * 使用新的提示词和schema生成塔罗解读
 */
export async function generateNewTarotReading(
  question: string,
  cardContext: string,
  maxRetries: number = 2
) {
  let lastError: Error | null = null;
  
  const userPrompt = `请根据以下信息进行塔罗解读：

## 用户问题
${question}

## 抽到的牌
${cardContext}

请按照新的JSON格式返回解读结果，包含cards、readingResults、keyMessages等字段。`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: NEW_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "new_tarot_reading",
            strict: true,
            schema: TarotReadingJSONSchema
          }
        },
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      // 解析 JSON 响应
      const parsedResponse = JSON.parse(content);
      
      return {
        success: true,
        data: parsedResponse,
        usage: response.usage,
        attempt: attempt + 1
      };
      
    } catch (error) {
      lastError = error as Error;
      console.error(`New format attempt ${attempt + 1} failed:`, error);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempt: maxRetries + 1
  };
}

/**
 * 检查 OpenAI API 连接状态
 */
export async function checkOpenAIConnection(): Promise<boolean> {
  try {
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('OpenAI connection check failed:', error);
    return false;
  }
}
