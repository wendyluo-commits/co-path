import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession } from '@/lib/fair-random';

const SessionRequestSchema = z.object({
  spread: z.enum(['single', 'two-options', 'situation-action-outcome']).default('single'),
  lang: z.enum(['zh', 'en']).default('zh'),
  tone: z.enum(['gentle', 'direct']).default('gentle')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // 验证请求数据
    const validationResult = SessionRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { spread } = validationResult.data;

    // 创建会话和承诺
    const session = createSession(spread);

    const response = {
      sessionId: session.sessionId,
      commitHash: session.commitHash,
      timestamp: session.timestamp,
      spread,
      message: '会话已创建，承诺已生成。请开始选牌流程。'
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Session creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: '会话创建失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}

// 健康检查
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'session',
    timestamp: new Date().toISOString()
  });
}
