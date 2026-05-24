import { NextRequest, NextResponse } from 'next/server';
import { ReadingRequestSchema, TarotReadingSchema, MixedTarotReadingSchema } from '@/schemas/reading.schema';
import { drawCards, composeContext, lookupCard } from '@/lib/tarot';
import { generateTarotReadingWithAgent, generateNewTarotReading } from '@/lib/openai';
import { detectSensitiveContent } from '@/prompts/reading';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = ReadingRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { question, spread, seed, tone, lang, cards: preselectedCards } = validationResult.data;

    const useNewFormat = body.useNewFormat === true;

    const safetyNote = detectSensitiveContent(question);

    let drawnCards;
    if (preselectedCards && preselectedCards.length > 0) {
      drawnCards = preselectedCards.map(card => {
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
            upright: { keywords: card.keywords || [], love: '', career: '', advice: [] },
            reversed: { keywords: card.keywords || [], love: '', career: '', advice: [] },
          },
        };
      });
    } else {
      drawnCards = drawCards(spread, seed);
    }

    const cardContext = composeContext(drawnCards, question, tone);

    const result = useNewFormat
      ? await generateNewTarotReading(question, cardContext, lang)
      : await generateTarotReadingWithAgent(question, cardContext, lang);

    if (!result.success) {
      console.error('OpenAI API failed:', result.error);
      const fallbackReading = useNewFormat
        ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote, lang)
        : createFallbackReading(question, spread, drawnCards, tone, safetyNote, lang);
      return NextResponse.json(fallbackReading, { status: 200 });
    }

    const expectedCount = drawnCards.length;
    const aiData = result.data;
    let aiCards = Array.isArray(aiData.cards) ? aiData.cards : [];

    if (aiCards.length !== expectedCount) {
      if (aiCards.length > expectedCount) {
        aiCards = aiCards.slice(0, expectedCount);
      } else {
        const fallbackReading = useNewFormat
          ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote, lang)
          : createFallbackReading(question, spread, drawnCards, tone, safetyNote, lang);
        return NextResponse.json(fallbackReading, { status: 200 });
      }
    }

    aiCards = aiCards.map((c: any, i: number) => ({ ...c, position: drawnCards[i].position }));

    const readingValidation = useNewFormat
      ? MixedTarotReadingSchema.safeParse({
          ...aiData,
          cards: aiCards,
          safety_note: safetyNote || aiData.safety_note || '本解读仅供娱乐和自我反思使用，不构成专业建议。',
        })
      : TarotReadingSchema.safeParse({
          ...aiData,
          cards: aiCards,
          safety_note: safetyNote || aiData.safety_note || '本解读仅供娱乐和自我反思使用，不构成专业建议。',
        });

    if (!readingValidation.success) {
      console.error('AI response validation failed:', readingValidation.error);
      const fallbackReading = useNewFormat
        ? createMixedFormatFallbackReading(question, spread, drawnCards, tone, safetyNote, lang)
        : createFallbackReading(question, spread, drawnCards, tone, safetyNote, lang);
      return NextResponse.json(fallbackReading, { status: 200 });
    }

    const response = {
      ...readingValidation.data,
      metadata: {
        model_used: process.env.MODEL_NAME || 'gpt-4o-mini',
        tokens_used: result.usage ? result.usage.input_tokens + result.usage.output_tokens : 0,
        attempt_count: result.attempt,
        generated_at: new Date().toISOString(),
        seed,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}

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
  safetyNote: string | null,
  lang: 'zh' | 'en' = 'zh'
) {
  const positionTranslations: Record<string, string> = {
    '当前状况': 'Current Situation',
    '现状': 'Present',
    '行动': 'Action',
    '结果': 'Outcome',
    '过去': 'Past',
    '现在': 'Present',
    '未来': 'Future',
    '建议': 'Advice',
    '现状/瓶颈': 'Current Bottleneck',
    '行动/策略': 'Action / Strategy',
    '结果/走向': 'Outcome / Direction',
  };

  const cards = drawnCards.map(card => {
    const positionLabel = lang === 'en'
      ? positionTranslations[card.position] || card.position
      : card.position;
    const interpretation = lang === 'en'
      ? `${card.name} (${card.orientation === 'upright' ? 'upright' : 'reversed'}) appears in the position of ${positionLabel}. This card invites you to reflect on the current situation and draw insight from it.`
      : `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置。这张牌提醒您关注当前的情况，并从中获得洞察。`;
    const adviceText = lang === 'en'
      ? 'Stay open-minded and trust your intuition.'
      : '保持开放的心态，相信自己的判断力。';
    return {
      name: card.name,
      suit: 'Major' as const,
      number: 0,
      position: card.position,
      orientation: card.orientation,
      keywords: card.data[card.orientation].keywords,
      interpretation,
      advice: card.data[card.orientation].advice.join(lang === 'en' ? '; ' : '；') || adviceText,
    };
  });

  const readingResults = drawnCards.map(card => {
    const positionLabel = lang === 'en'
      ? positionTranslations[card.position] || card.position
      : card.position;
    const heading = lang === 'en'
      ? `${positionLabel} - ${card.name}`
      : `${card.position} - ${card.name}`;
    const body = lang === 'en'
      ? `${card.name} (${card.orientation === 'upright' ? 'upright' : 'reversed'}) appears in the position of ${positionLabel}. This card invites you to examine your present circumstances and extract deeper meaning.`
      : `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置。这张牌提醒您关注当前的情况，并从中获得洞察。`;
    const tip = lang === 'en'
      ? `${card.name} card reminds you —\nStay open-minded and trust your intuition before taking action.`
      : `${card.name}牌提示你——\n保持开放的心态，相信自己的判断力。`;
    return { heading, body, bodyFull: null, truncated: false, tip };
  });

  const overallText = lang === 'en'
    ? 'The tarot spread offers insight into your present situation. Each card carries a symbolic message—reflect on it and apply it to your lived experience. Remember, tarot is a tool for self-reflection; you remain in control of your decisions.'
    : '塔罗牌为您提供了当前情况的洞察。每张牌都承载着特殊的含义，请结合您的实际情况进行理解。记住，塔罗只是一个自我反思的工具，最终的决定权在您手中。';

  return {
    spread,
    question,
    tone,
    cards,
    readingResultsTitle: lang === 'en' ? 'READING RESULTS' : '解读结果',
    readingResults,
    separatorDecorations: [
      { type: 'starLine', positionAfterSection: 1 },
      { type: 'starLine', positionAfterSection: 2 },
    ],
    keyMessages: {
      label: 'KEY MESSAGES',
      decorationImageUrl: null,
      title: lang === 'en' ? 'KEY MESSAGES' : '关键信息',
      body: overallText,
      bodyFull: null,
      truncated: false,
    },
    button: {
      text: lang === 'en' ? 'Generate a Good-Luck Charm →' : '生成好运御守 →',
      action: 'generateCharm',
      styleHint: 'primary' as const,
    },
    layoutHints: {
      maxBodyLines: 6,
      cardCount: drawnCards.length,
      decorations: [
        { type: 'star', xPct: 20, yPct: 30, opacity: 0.8 },
        { type: 'star', xPct: 80, yPct: 70, opacity: 0.6 },
      ],
    },
    overall: overallText,
    action_steps: lang === 'en'
      ? ['Reflect carefully on each card\'s message', 'Compare the symbolism with your real-life circumstances', 'Draft a specific plan of action', 'Maintain a positive, optimistic mindset']
      : ['仔细思考每张牌传达的信息', '结合您的实际情况进行判断', '制定具体的行动计划', '保持积极乐观的心态'],
    safety_note: safetyNote || (lang === 'en'
      ? 'This reading is for entertainment and self-reflection purposes only and does not constitute professional advice.'
      : '本解读仅供娱乐和自我反思使用，不构成专业建议。'),
  };
}

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
  safetyNote: string | null,
  lang: 'zh' | 'en' = 'zh'
) {
  const positionTranslations: Record<string, string> = {
    '当前状况': 'Current Situation',
    '现状': 'Present',
    '行动': 'Action',
    '结果': 'Outcome',
    '过去': 'Past',
    '现在': 'Present',
    '未来': 'Future',
    '建议': 'Advice',
    '现状/瓶颈': 'Current Bottleneck',
    '行动/策略': 'Action / Strategy',
    '结果/走向': 'Outcome / Direction',
  };

  const cards = drawnCards.map(card => {
    const positionLabel = lang === 'en'
      ? positionTranslations[card.position] || card.position
      : card.position;
    const interpretation = lang === 'en'
      ? `${card.name} (${card.orientation === 'upright' ? 'upright' : 'reversed'}) appears in the position of ${positionLabel}. This card invites you to stay aware of your current situation and draw insight from it.`
      : `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置。这张牌提醒您关注当前的情况，并从中获得洞察。`;
    const adviceText = lang === 'en'
      ? 'Stay open-minded and trust your judgment.'
      : '保持开放的心态，相信自己的判断力。';
    return {
      name: card.name,
      suit: 'Major',
      number: 0,
      position: card.position,
      orientation: card.orientation,
      keywords: card.data[card.orientation].keywords,
      interpretation,
      advice: card.data[card.orientation].advice.join(lang === 'en' ? '; ' : '；') || adviceText,
    };
  });

  const overallText = lang === 'en'
    ? 'The tarot cards offer you insight into your current situation. Each card carries a unique message—apply it to your life thoughtfully. Remember, tarot serves as a tool for reflection; you remain responsible for your ultimate choices.'
    : '塔罗牌为您提供了当前情况的洞察。每张牌都承载着特殊的含义，请结合您的实际情况进行理解。记住，塔罗只是一个自我反思的工具，最终的决定权在您手中。';

  return {
    spread,
    question,
    cards,
    overall: overallText,
    action_steps: lang === 'en'
      ? ['Reflect carefully on each card\'s message', 'Relate the symbolism to your real-life circumstances', 'Create a concrete plan of action', 'Maintain a positive and optimistic mindset']
      : ['仔细思考每张牌传达的信息', '结合您的实际情况进行判断', '制定具体的行动计划', '保持积极乐观的心态'],
    safety_note: safetyNote || (lang === 'en'
      ? 'This reading is for entertainment and self-reflection purposes only and does not constitute professional advice.'
      : '本解读仅供娱乐和自我反思使用，不构成专业建议。'),
    tone,
  };
}

export async function GET() {
  return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
