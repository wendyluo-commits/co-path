import { NextResponse } from 'next/server';
import { checkOpenAIConnection } from '@/lib/openai';

export async function GET() {
  try {
    const claudeHealthy = await checkOpenAIConnection();
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    const modelName = process.env.MODEL_NAME || 'claude-haiku-4-5-20251001';
    const environment = process.env.NODE_ENV === 'production' ? 'production'
      : process.env.VERCEL_ENV === 'preview' ? 'preview' : 'development';

    const status = {
      ok: claudeHealthy && hasKey,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment,
      services: {
        claude: {
          status: claudeHealthy ? 'healthy' : 'unhealthy',
          model: modelName,
          key_configured: hasKey,
        },
      },
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'AI塔罗解读',
        uptime: process.uptime(),
      },
    };

    return NextResponse.json(status, { status: status.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, timestamp: new Date().toISOString(), error: 'Health check failed' },
      { status: 503 }
    );
  }
}
