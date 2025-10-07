import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getSession, 
  deleteSession, 
  FairRandomGenerator, 
  fisherYatesShuffle, 
  generateFullDeck 
} from '@/lib/fair-random';
import { lookupCard } from '@/lib/tarot';

const DrawRequestSchema = z.object({
  sessionId: z.string().uuid('无效的会话ID'),
  positions: z.array(z.number().int().min(0).max(77))
    .min(1, '至少需要选择一张牌')
    .max(3, '最多只能选择三张牌')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validationResult = DrawRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { sessionId, positions } = validationResult.data;

    // 获取会话数据
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Session not found',
          message: '会话不存在或已过期，请重新开始'
        },
        { status: 404 }
      );
    }

    // 验证选牌数量与牌阵匹配
    const expectedCount = session.spread === 'single' ? 1 : 3;
    if (positions.length !== expectedCount) {
      return NextResponse.json(
        { 
          error: 'Invalid card count',
          message: `${session.spread === 'single' ? '单张牌' : '三张牌'}解读需要选择${expectedCount}张牌`
        },
        { status: 400 }
      );
    }

    // 检查位置是否重复
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      return NextResponse.json(
        { 
          error: 'Duplicate positions',
          message: '不能选择重复的牌位'
        },
        { status: 400 }
      );
    }

    try {
      // 使用服务器种子进行确定性洗牌
      const rng = new FairRandomGenerator(session.serverSeed);
      const fullDeck = generateFullDeck();
      const shuffledDeck = fisherYatesShuffle(fullDeck, rng);

      // 根据用户选择的位置获取对应的牌
      const selectedCards = positions.map((position, index) => {
        const card = shuffledDeck[position];
        const orientation = rng.nextBoolean() ? 'upright' : 'reversed';
        
        // 查找牌的详细信息
        const cardData = lookupCard(card.name);
        
        return {
          name: card.name,
          suit: card.suit,
          number: card.number,
          orientation,
          index: position,
          position: session.spread === 'single' ? '当前状况' : 
                   index === 0 ? '过去/原因' : 
                   index === 1 ? '现在/状况' : '未来/建议',
          // 添加关键词用于前端显示
          keywords: cardData ? 
            (orientation === 'upright' ? cardData.upright.keywords : cardData.reversed.keywords) : 
            []
        };
      });

      // 准备响应数据
      const response = {
        cards: selectedCards,
        serverSeed: session.serverSeed.toString('base64'),
        commitHash: session.commitHash,
        timestamp: session.timestamp,
        algo: 'Fisher-Yates + HMAC_DRBG(SHA-256)',
        verification: {
          sessionId: session.sessionId,
          positions: positions,
          instructions: '使用相同的 sessionId、timestamp、serverSeed 和算法可以验证此次抽牌结果'
        }
      };

      // 清理会话（reveal 后即可删除）
      deleteSession(sessionId);

      return NextResponse.json(response, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

    } catch (shuffleError) {
      console.error('Shuffle error:', shuffleError);
      return NextResponse.json(
        { 
          error: 'Shuffle failed',
          message: '洗牌过程出错，请重新开始'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Draw API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '抽牌失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'draw',
    timestamp: new Date().toISOString()
  });
}
