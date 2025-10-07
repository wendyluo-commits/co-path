import { NextResponse } from 'next/server';
import { checkOpenAIConnection } from '@/lib/openai';

export async function GET() {
  try {
    // 检查 OpenAI 连接
    const openaiHealthy = await checkOpenAIConnection();
    
    // 检查环境变量
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const modelName = process.env.MODEL_NAME || 'gpt-4o';
    
    // 确定环境
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 
                       process.env.VERCEL_ENV === 'preview' ? 'preview' : 'development';
    
    const healthStatus = {
      ok: openaiHealthy && hasOpenAIKey,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment,
      services: {
        openai: {
          status: openaiHealthy ? 'healthy' : 'unhealthy',
          model: modelName,
          key_configured: hasOpenAIKey
        }
      },
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'AI塔罗解读',
        uptime: process.uptime()
      }
    };
    
    const statusCode = healthStatus.ok ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        environment: process.env.NODE_ENV || 'unknown'
      },
      { status: 503 }
    );
  }
}
