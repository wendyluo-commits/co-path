import { NextResponse } from 'next/server';
import { checkOpenAIConnection } from '@/lib/openai';

export async function GET() {
  try {
    const openaiHealthy = await checkOpenAIConnection();
    const hasKey = !!process.env.OPENAI_API_KEY;
    const modelName = process.env.MODEL_NAME || 'gpt-4o-mini';
    const environment = process.env.NODE_ENV === 'production' ? 'production'
      : process.env.VERCEL_ENV === 'preview' ? 'preview' : 'development';

    const status = {
      ok: openaiHealthy && hasKey,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment,
      services: {
        openai: {
          status: openaiHealthy ? 'healthy' : 'unhealthy',
          model: modelName,
          key_configured: hasKey,
        },
      },
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'AI Tarot',
        uptime: process.uptime(),
      },
    };

    return NextResponse.json(status, { status: status.ok ? 200 : 503 });
  } catch {
    return NextResponse.json(
      { ok: false, timestamp: new Date().toISOString(), error: 'Health check failed' },
      { status: 503 }
    );
  }
}
