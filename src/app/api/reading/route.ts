import { NextRequest, NextResponse } from 'next/server';
import { generateTarotReadingWithAgent } from '@/lib/openai';
import { lookupCard } from '@/lib/tarot';
import { TarotReading, MixedTarotReading } from '@/schemas/reading.schema';

// 生成问题特定的解读
function generateQuestionSpecificInterpretation(card: any, question: string, position: string): string {
  const cardName = card.name;
  const orientation = card.orientation === 'upright' ? '正位' : '逆位';
  const keywords = card.data[card.orientation].keywords;
  
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
    suit: "Major",
    number: 0,
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
    overall: `基于您的问题"${question}"，${spread}牌阵为您提供了深刻的洞察。每张牌都针对您当前的情况给出了具体的指导，帮助您更好地理解现状并做出明智的选择。`,
    action_steps: [
      "仔细思考每张牌的含义与您问题的关联",
      "将牌面的建议应用到您的实际生活中",
      "保持开放的心态，相信自己的直觉"
    ],
    safety_note: safetyNote || "塔罗牌解读仅供参考，最终决定权在您手中。请结合实际情况做出明智的选择。"
  };
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
  const cards = drawnCards.map(card => ({
    name: card.name,
    suit: "Major",
    number: 0,
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
    tip: `${card.name}牌提示你——\n结合您当前的情况，保持开放的心态，相信自己的判断力。`
  }));

  return {
    spread,
    question,
    cards,
    readingResults,
    overall: `基于您的问题"${question}"，${spread}牌阵为您提供了深刻的洞察。每张牌都针对您当前的情况给出了具体的指导，帮助您更好地理解现状并做出明智的选择。`,
    action_steps: [
      "仔细思考每张牌的含义与您问题的关联",
      "将牌面的建议应用到您的实际生活中",
      "保持开放的心态，相信自己的直觉"
    ],
    safety_note: safetyNote || "塔罗牌解读仅供参考，最终决定权在您手中。请结合实际情况做出明智的选择。"
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, spread, cards: drawnCards } = body;

    if (!question || !spread || !drawnCards) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 构建卡牌上下文 - 修复类型问题
    const cardContext = drawnCards.map((card: any) => {
      const cardData = lookupCard(card.name);
      if (!cardData) {
        return `${card.name} (${card.orientation}) - 位置: ${card.position}`;
      }
      
      const orientation = card.orientation === 'upright' ? '正位' : '逆位';
      // 修复类型问题：明确指定orientation类型
      const cardOrientation = card.orientation as 'upright' | 'reversed';
      const keywords = cardData[cardOrientation].keywords.join('、');
      const advice = cardData[cardOrientation].advice.join('；');
      
      return `${card.name} (${orientation}) - 位置: ${card.position}\n关键词: ${keywords}\n建议: ${advice}`;
    }).join('\n\n');

    // 确定解读格式
    const isMixedFormat = spread === 'five-card';
    
    // 生成解读
    let reading: TarotReading | MixedTarotReading;
    
    try {
      reading = await generateTarotReadingWithAgent(question, cardContext);
    } catch (error) {
      console.error('AI解读生成失败，使用降级响应:', error);
      
      // 使用降级响应
      const tone = 'gentle';
      const safetyNote = "由于技术原因，本次解读使用了预设内容。塔罗牌解读仅供参考，最终决定权在您手中。";
      
      if (isMixedFormat) {
        reading = createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote);
      } else {
        reading = createFallbackReading(question, spread, drawnCards, tone, safetyNote);
      }
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error('解读生成失败:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}
