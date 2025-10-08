import { NextRequest, NextResponse } from 'next/server';
import { generateTarotReadingWithAgent } from '@/lib/openai';
import { lookupCard } from '@/lib/tarot';

export async function POST(request: NextRequest) {
  console.log('=== API开始处理请求 ===');
  
  try {
    const body = await request.json();
    console.log('请求体:', JSON.stringify(body, null, 2));
    
    const { question, spread, cards: drawnCards } = body;

    if (!question || !spread || !drawnCards) {
      console.error('缺少必需字段:', { question: !!question, spread: !!spread, cards: !!drawnCards });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('API请求验证通过:', { 
      question: question.substring(0, 50) + '...', 
      spread, 
      cardsCount: drawnCards.length 
    });

    // 生成解读
    try {
      console.log('开始调用AI解读...');
      const agentResponse = await generateTarotReadingWithAgent(question, '');
      
      if (agentResponse.success && agentResponse.data) {
        console.log('AI解读成功，返回数据');
        return NextResponse.json(agentResponse.data);
      } else {
        console.error('AI解读失败:', agentResponse.error);
        throw new Error(agentResponse.error || 'Agent failed to generate reading');
      }
    } catch (error) {
      console.error('AI解读生成失败，使用降级响应:', error);
      
      // 修复：确保降级响应格式正确，不依赖card.data
      const isFiveCard = spread === 'five-card';
      console.log('牌阵类型:', spread, '是否五张牌:', isFiveCard);
      
      if (isFiveCard) {
        // 五张牌格式 - 需要 readingResults
        console.log('生成五张牌格式降级响应...');
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
            keywords: card.keywords || ["直觉", "选择", "变化"], // 使用传入的keywords
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

        console.log('五张牌降级响应生成完成');
        return NextResponse.json(fallbackReading);
      } else {
        // 单张牌或三张牌格式 - 不需要 readingResults
        console.log('生成单张/三张牌格式降级响应...');
        const fallbackReading = {
          spread,
          question,
          cards: drawnCards.map((card: any) => ({
            name: card.name,
            suit: "Major",
            number: 0,
            position: card.position,
            orientation: card.orientation,
            keywords: card.keywords || ["直觉", "选择", "变化"], // 使用传入的keywords
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

        console.log('单张/三张牌降级响应生成完成');
        return NextResponse.json(fallbackReading);
      }
    }
  } catch (error) {
    console.error('=== API处理失败 ===');
    console.error('错误详情:', error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate reading',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
