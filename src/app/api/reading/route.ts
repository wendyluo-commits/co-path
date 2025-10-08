import { NextRequest, NextResponse } from 'next/server';
import { generateTarotReadingWithAgent } from '@/lib/openai';
import { lookupCard } from '@/lib/tarot';

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

    console.log('API请求:', { question, spread, cardsCount: drawnCards.length });

    // 构建卡牌上下文
    const cardContext = drawnCards.map((card: any) => {
      const cardData = lookupCard(card.name);
      if (!cardData) {
        return `${card.name} (${card.orientation}) - 位置: ${card.position}`;
      }
      
      const orientation = card.orientation === 'upright' ? '正位' : '逆位';
      const cardOrientation = card.orientation as 'upright' | 'reversed';
      const keywords = cardData[cardOrientation].keywords.join('、');
      const advice = cardData[cardOrientation].advice.join('；');
      
      return `${card.name} (${orientation}) - 位置: ${card.position}\n关键词: ${keywords}\n建议: ${advice}`;
    }).join('\n\n');

    // 生成解读
    try {
      const agentResponse = await generateTarotReadingWithAgent(question, cardContext);
      
      if (agentResponse.success && agentResponse.data) {
        console.log('AI解读成功:', agentResponse.data);
        return NextResponse.json(agentResponse.data);
      } else {
        throw new Error(agentResponse.error || 'Agent failed to generate reading');
      }
    } catch (error) {
      console.error('AI解读生成失败，使用降级响应:', error);
      
      // 修复：确保降级响应格式正确
      const isFiveCard = spread === 'five-card';
      
      if (isFiveCard) {
        // 五张牌格式 - 需要 readingResults
        const readingResults = drawnCards.map((card: any, index: number) => ({
          heading: `${card.position} - ${card.name}`,
          body: `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置，针对您的问题"${question}"，这张牌为您提供了深刻的洞察。结合您当前的情况，这张牌建议您保持开放的心态，相信自己的判断力。`,
          bodyFull: null,
          truncated: false,
          tip: `${card.name}牌提示你——\n结合您当前的情况，保持开放的心态，相信自己的判断力。`
        }));

        const fallbackReading = {
          spread,
          question,
          cards: drawnCards.map((card: any) => ({
            name: card.name,
            suit: "Major",
            number: 0,
            position: card.position,
            orientation: card.orientation,
            keywords: card.data[card.orientation].keywords,
            interpretation: `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置，针对您的问题"${question}"，这张牌为您提供了深刻的洞察。`,
            advice: `结合您当前的情况，建议您保持开放的心态，相信自己的判断力。`
          })),
          readingResults, // 关键：五张牌格式需要这个字段
          overall: `基于您的问题"${question}"，${spread}牌阵为您提供了深刻的洞察。每张牌都针对您当前的情况给出了具体的指导，帮助您更好地理解现状并做出明智的选择。`,
          action_steps: [
            "仔细思考每张牌的含义与您问题的关联",
            "将牌面的建议应用到您的实际生活中",
            "保持开放的心态，相信自己的直觉"
          ],
          safety_note: "塔罗牌解读仅供参考，最终决定权在您手中。请结合实际情况做出明智的选择。"
        };

        console.log('降级响应(五张牌):', fallbackReading);
        return NextResponse.json(fallbackReading);
      } else {
        // 单张牌或三张牌格式 - 不需要 readingResults
        const fallbackReading = {
          spread,
          question,
          cards: drawnCards.map((card: any) => ({
            name: card.name,
            suit: "Major",
            number: 0,
            position: card.position,
            orientation: card.orientation,
            keywords: card.data[card.orientation].keywords,
            interpretation: `${card.name}${card.orientation === 'upright' ? '正位' : '逆位'}出现在${card.position}的位置，针对您的问题"${question}"，这张牌为您提供了深刻的洞察。`,
            advice: `结合您当前的情况，建议您保持开放的心态，相信自己的判断力。`
          })),
          overall: `基于您的问题"${question}"，${spread}牌阵为您提供了深刻的洞察。每张牌都针对您当前的情况给出了具体的指导，帮助您更好地理解现状并做出明智的选择。`,
          action_steps: [
            "仔细思考每张牌的含义与您问题的关联",
            "将牌面的建议应用到您的实际生活中",
            "保持开放的心态，相信自己的直觉"
          ],
          safety_note: "塔罗牌解读仅供参考，最终决定权在您手中。请结合实际情况做出明智的选择。"
        };

        console.log('降级响应(单张/三张牌):', fallbackReading);
        return NextResponse.json(fallbackReading);
      }
    }
  } catch (error) {
    console.error('解读生成失败:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}
