import { NextRequest, NextResponse } from 'next/server';
import { ReadingRequestSchema, TarotReadingSchema, MixedTarotReadingSchema } from '@/schemas/reading.schema';
import { drawCards, composeContext, lookupCard } from '@/lib/tarot';
import { generateTarotReadingWithAgent, generateNewTarotReading } from '@/lib/openai';
import { detectSensitiveContent } from '@/prompts/reading';

/**
 * 生成与问题相关的解读内容
 */
function generateQuestionSpecificInterpretation(card: any, question: string, position: string): string {
  const cardName = card.name;
  const orientation = card.orientation === 'upright' ? '正位' : '逆位';
  const keywords = card.data[card.orientation].keywords;
  
  // 根据问题类型生成相关解读
  if (question.includes('事业') || question.includes('工作') || question.includes('职业')) {
    return `${cardName}${orientation}出现在${position}的位置，针对您的事业发展问题，这张牌提示您${keywords.join('、')}。结合您的问题，这张牌建议您在当前的事业探索中保持开放的心态，同时关注内在的指引。`;
  } else if (question.includes('关系') || question.includes('感情') || question.includes('人际')) {
    return `${cardName}${orientation}出现在${position}的位置，关于您的人际关系问题，这张牌提醒您${keywords.join('、')}。在您当前的关系状况中，这张牌建议您倾听内心的声音，做出符合自己价值观的选择。`;
  } else if (question.includes('选择') || question.includes('决定') || question.includes('决策')) {
    return `${cardName}${orientation}出现在${position}的位置，面对您需要做出的选择，这张牌提示您${keywords.join('、')}。结合您当前面临的决策，这张牌建议您仔细权衡各种因素，相信自己的判断力。`;
  } else {
    return `${cardName}${orientation}出现在${position}的位置，针对您的问题"${question}"，这张牌提示您${keywords.join('、')}。结合您当前的情况，这张牌建议您保持开放的心态，从中获得洞察。`;
  }
}

/**
 * 生成与问题相关的建议
 */
function generateQuestionSpecificAdvice(card: any, question: string, position: string): string {
  const advice = card.data[card.orientation].advice;
  
  if (question.includes('事业') || question.includes('工作') || question.includes('职业')) {
    return `在事业发展方面，建议您${advice.join('；')}。结合您当前的事业探索，保持对机会的敏感度，同时相信自己的专业能力。`;
  } else if (question.includes('关系') || question.includes('感情') || question.includes('人际')) {
    return `在人际关系方面，建议您${advice.join('；')}。在您当前的关系状况中，保持真诚的沟通，同时尊重彼此的边界。`;
  } else if (question.includes('选择') || question.includes('决定') || question.includes('决策')) {
    return `在做出决定时，建议您${advice.join('；')}。面对您当前的选择，相信自己的判断力，同时考虑长远的影响。`;
  } else {
    return `针对您的问题，建议您${advice.join('；')}。结合您当前的情况，保持开放的心态，相信自己的判断力。`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    const validationResult = ReadingRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { question, spread, seed, tone, cards: preselectedCards } = validationResult.data;
    
    // 检查是否使用新格式（可以通过查询参数或请求体控制）
    const useNewFormat = body.useNewFormat === true;

    // 检测敏感内容
    const safetyNote = detectSensitiveContent(question);
    
    let drawnCards;
    if (preselectedCards && preselectedCards.length > 0) {
      // 使用预选的牌（从抽牌页面传来）
      drawnCards = preselectedCards.map(card => {
        // 查找完整的卡牌数据
        const fullCardData = lookupCard(card.name);
        return {
          name: card.name,
          orientation: card.orientation as 'upright' | 'reversed',
          position: card.position,
          data: fullCardData || {
            name: card.name,
            chinese_name: card.name,
            suit: card.suit,
            number: card.number,
            arcana: card.suit === 'Major' ? 'Major' : 'Minor',
            upright: { 
              keywords: card.keywords || [], 
              love: '', 
              career: '', 
              advice: [] 
            },
            reversed: { 
              keywords: card.keywords || [], 
              love: '', 
              career: '', 
              advice: [] 
            }
          }
        };
      });
    } else {
      // 传统随机抽牌
      drawnCards = drawCards(spread, seed);
    }
    
    // 组织上下文
    const cardContext = composeContext(drawnCards, question, tone);
    
    // 根据参数选择使用新格式还是旧格式
    const result = useNewFormat 
      ? await generateNewTarotReading(question, cardContext)
      : await generateTarotReadingWithAgent(question, cardContext);
    
    if (!result.success) {
      console.error('OpenAI API failed:', result.error);
      
      // 降级处理 - 返回基础模板响应
      const fallbackReading = useNewFormat 
        ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote)
        : createFallbackReading(question, spread, drawnCards, tone, safetyNote);
      
      return NextResponse.json(fallbackReading, { status: 200 });
    }

    // 规范化 AI 返回的卡牌数量与顺序：必须与抽到的牌数量一致
    const expectedCount = drawnCards.length;
    const aiData = result.data;
    let aiCards = Array.isArray(aiData.cards) ? aiData.cards : [];

    if (aiCards.length !== expectedCount) {
      if (aiCards.length > expectedCount) {
        aiCards = aiCards.slice(0, expectedCount);
      } else {
        // 少于期望数量，采用降级模板，避免前端出现牌数不一致
        const fallbackReading = useNewFormat 
          ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote)
          : createFallbackReading(question, spread, drawnCards, tone, safetyNote);
        return NextResponse.json(fallbackReading, { status: 200 });
      }
    }

    // 确保位置与抽到的牌对应，避免位置错乱
    aiCards = aiCards.map((c: any, i: number) => ({ ...c, position: drawnCards[i].position }));

    // 根据格式选择不同的验证schema
    const readingValidation = useNewFormat 
      ? MixedTarotReadingSchema.safeParse({
          ...aiData,
          cards: aiCards,
          safety_note: safetyNote || aiData.safety_note || "本解读仅供娱乐和自我反思使用，不构成专业建议。"
        })
      : TarotReadingSchema.safeParse({
          ...aiData,
          cards: aiCards,
          safety_note: safetyNote || aiData.safety_note || "本解读仅供娱乐和自我反思使用，不构成专业建议。"
        });
    
    if (!readingValidation.success) {
      console.error('AI response validation failed:', readingValidation.error);
      
      // 降级处理
      const fallbackReading = useNewFormat 
        ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote)
        : createFallbackReading(question, spread, drawnCards, tone, safetyNote);
      return NextResponse.json(fallbackReading, { status: 200 });
    }

    // 添加元数据
    const response = {
      ...readingValidation.data,
      metadata: {
        model_used: process.env.MODEL_NAME || 'gpt-4o',
        tokens_used: result.usage?.total_tokens || 0,
        attempt_count: result.attempt,
        generated_at: new Date().toISOString(),
        seed: seed
      }
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '服务暂时不可用，请稍后重试'
      },
      { status: 500 }
    );
  }
}

/**
 * 创建混合格式的降级响应
 */
function createMixedFormatFallbackReading(
  question: string,
  spread: string,
  drawnCards: Array<{
    name: string;
    orientation: 'upright' | 'reversed';
    position: string;
    data: {
      upright: { keywords: string[]; advice: string[] };
      reversed: { keywords: string[]; advice: string[] };
    };
  }>,
  tone: string,
  safetyNote: string | null
) {
  // 保留原有的卡牌结构
  const cards = drawnCards.map(card => ({
    name: card.name,
    suit: card.data.suit || "Major",
    number: card.data.number || 0,
    position: card.position,
    orientation: card.orientation,
    keywords: card.data[card.orientation].keywords,
    interpretation: generateQuestionSpecificInterpretation(card, question, card.position),
    advice: generateQuestionSpecificAdvice(card, question, card.position)
  }));

  // 添加新的解读内容结构
  const readingResults = drawnCards.map(card => ({
    heading: `${card.position} - ${card.name}`,
    body: generateQuestionSpecificInterpretation(card, question, card.position),
    bodyFull: null,
    truncated: false,
    tip: `${card.name}牌提示你——\n${generateQuestionSpecificAdvice(card, question, card.position)}`
  }));

  return {
    // 保留原有的基础字段
    spread,
    question,
    tone,
    cards,
    
    // 添加新的解读内容结构
    readingResultsTitle: "READING RESULTS",
    readingResults,
    separatorDecorations: [
      { type: "starLine", positionAfterSection: 1 },
      { type: "starLine", positionAfterSection: 2 }
    ],
    keyMessages: {
      label: "KEY MESSAGES",
      decorationImageUrl: null,
      title: "关键信息",
      body: "塔罗牌为您提供了当前情况的洞察。每张牌都承载着特殊的含义，请结合您的实际情况进行理解。记住，塔罗只是一个自我反思的工具，最终的决定权在您手中。",
      bodyFull: null,
      truncated: false
    },
    button: {
      text: "生成好运御守 →",
      action: "generateCharm",
      styleHint: "primary" as const
    },
    layoutHints: {
      maxBodyLines: 6,
      cardCount: drawnCards.length,
      decorations: [
        { type: "star", xPct: 20, yPct: 30, opacity: 0.8 },
        { type: "star", xPct: 80, yPct: 70, opacity: 0.6 }
      ]
    },
    
    // 保留原有的其他字段
    overall: "塔罗牌为您提供了当前情况的洞察。每张牌都承载着特殊的含义，请结合您的实际情况进行理解。记住，塔罗只是一个自我反思的工具，最终的决定权在您手中。",
    action_steps: [
      "仔细思考每张牌传达的信息",
      "结合您的实际情况进行判断",
      "制定具体的行动计划",
      "保持积极乐观的心态"
    ],
    safety_note: safetyNote || "本解读仅供娱乐和自我反思使用，不构成专业建议。"
  };
}

/**
 * 创建降级响应
 */
function createFallbackReading(
  question: string,
  spread: string,
  drawnCards: Array<{
    name: string;
    orientation: 'upright' | 'reversed';
    position: string;
    data: {
      upright: { keywords: string[]; advice: string[] };
      reversed: { keywords: string[]; advice: string[] };
    };
  }>,
  tone: string,
  safetyNote: string | null
) {
  const cards = drawnCards.map(card => ({
    name: card.name,
    suit: card.data.suit || "Major",
    number: card.data.number || 0,
    position: card.position,
    orientation: card.orientation,
    keywords: card.data[card.orientation].keywords,
    interpretation: generateQuestionSpecificInterpretation(card, question, card.position),
    advice: generateQuestionSpecificAdvice(card, question, card.position)
  }));

  return {
    spread,
    question,
    cards,
    overall: "塔罗牌为您提供了当前情况的洞察。每张牌都承载着特殊的含义，请结合您的实际情况进行理解。记住，塔罗只是一个自我反思的工具，最终的决定权在您手中。",
    action_steps: [
      "仔细思考每张牌传达的信息",
      "结合您的实际情况进行判断",
      "制定具体的行动计划",
      "保持积极乐观的心态"
    ],
    safety_note: safetyNote || "本解读仅供娱乐和自我反思使用，不构成专业建议。",
    tone
  };
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
