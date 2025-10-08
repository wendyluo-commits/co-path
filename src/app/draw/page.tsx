'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DeckGrid } from '@/components/DeckGrid';
import { ShuffleAnimation } from '@/components/ShuffleAnimation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ArrowLeft, Shield, Copy, Eye } from 'lucide-react';
import Link from 'next/link';

interface SessionData {
  sessionId: string;
  commitHash: string;
  timestamp: number;
  spread: string;
}

interface DrawResponse {
  cards: Array<{
    name: string;
    suit: string;
    number: number;
    orientation: 'upright' | 'reversed';
    index: number;
    position: string;
    keywords: string[];
  }>;
  serverSeed: string;
  commitHash: string;
  timestamp: number;
  algo: string;
  verification: {
    sessionId: string;
    positions: number[];
    instructions: string;
  };
}

type DrawPhase = 'loading' | 'ready' | 'shuffling' | 'selecting' | 'revealing' | 'complete' | 'error';

function DrawPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从 URL 参数获取配置
  const spread = searchParams.get('spread') || 'single';
  const question = searchParams.get('question') || '';
  const tone = searchParams.get('tone') || 'gentle';
  
  // 状态管理
  const [phase, setPhase] = useState<DrawPhase>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [, setDrawResult] = useState<DrawResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [countdown, setCountdown] = useState(2);

  const maxCards = spread === 'single' ? 1 : 3;
  const totalCards = 78; // 完整塔罗牌组

  // 初始化会话
  useEffect(() => {
    if (!question) {
      router.push('/');
      return;
    }

    const initSession = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spread,
            tone
          }),
        });

        if (!response.ok) {
          throw new Error('创建会话失败');
        }

        const sessionData = await response.json();
        setSession(sessionData);
        setPhase('ready');
        
      } catch (err) {
        console.error('Session creation failed:', err);
        setError(err instanceof Error ? err.message : '创建会话失败');
        setPhase('error');
      }
    };

    initSession();
  }, [spread, tone, question, router]);

  // 处理洗牌完成
  const handleShuffleComplete = () => {
    setPhase('selecting');
  };

  // 自动开始洗牌 - 进入页面后2秒自动开始
  useEffect(() => {
    console.log('Auto shuffle effect triggered:', { phase, session: !!session });
    if (phase === 'ready' && session) {
      console.log('Starting 2-second countdown...');
      
      // 立即显示倒计时
      setCountdown(2);
      
      // 1秒后显示1
      setTimeout(() => {
        console.log('Countdown: 1');
        setCountdown(1);
      }, 1000);
      
      // 2秒后自动开始洗牌
      setTimeout(() => {
        console.log('Auto shuffle completed!');
        setCountdown(0);
        handleShuffleComplete();
      }, 2000);
    }
  }, [phase, session]);

  // 处理选牌变化
  const handleSelectionChange = useCallback((positions: number[]) => {
    setSelectedPositions(positions);
  }, []);

  // 提交选牌并揭示
  const handleRevealCards = async () => {
    if (!session || selectedPositions.length !== maxCards) {
      return;
    }

    setPhase('revealing');
    
    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          positions: selectedPositions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '抽牌失败');
      }

      const result = await response.json();
      setDrawResult(result);
      
      // 将结果存储到 sessionStorage 以便结果页使用
      const readingData = {
        spread,
        question,
        cards: result.cards.map((card: DrawResponse['cards'][0]) => ({
          name: card.name,
          suit: card.suit,
          number: card.number,
          position: card.position,
          orientation: card.orientation,
          keywords: card.keywords,
          interpretation: '', // 将在结果页通过 AI 生成
          advice: ''
        })),
        verification: result.verification,
        serverSeed: result.serverSeed,
        commitHash: result.commitHash,
        algo: result.algo
      };
      
      sessionStorage.setItem('drawResult', JSON.stringify(readingData));
      
      // 延迟跳转，让用户看到翻牌动画
      setTimeout(() => {
        router.push(`/reading?fromDraw=true&question=${encodeURIComponent(question)}&tone=${tone}`);
      }, 2000);
      
    } catch (err) {
      console.error('Draw failed:', err);
      setError(err instanceof Error ? err.message : '抽牌失败');
      setPhase('error');
    }
  };

  // 复制承诺哈希
  const copyCommitHash = async () => {
    if (!session) return;
    
    try {
      await navigator.clipboard.writeText(session.commitHash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // 重新开始
  const handleRestart = () => {
    router.push('/');
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在创建抽牌会话..." />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <ErrorMessage 
            message={error || '发生未知错误'} 
            onRetry={handleRestart}
            showRetry={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 调试标识 */}
        <div className="fixed top-20 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50">
          🔥 自动洗牌版本
        </div>
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回重新开始
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">交互式抽牌</h1>
            <p className="text-lg text-gray-600">您的问题：&ldquo;{question}&rdquo;</p>
            <p className="text-sm text-gray-500 mt-2">
              {spread === 'single' ? '单张牌解读' : '三张牌解读（过去-现在-未来）'}
            </p>
          </div>
        </div>

        {/* 承诺证明 */}
        {session && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-green-800 font-medium mb-2">随机性承诺证明</h3>
                  <p className="text-green-700 text-sm mb-3">
                    系统已生成随机种子并创建承诺哈希，确保抽牌结果的公平性和可验证性。
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-2 py-1 bg-white rounded text-xs font-mono text-gray-800 border">
                      {session.commitHash}
                    </code>
                    <button
                      onClick={copyCommitHash}
                      className="flex items-center px-2 py-1 text-xs text-green-700 hover:text-green-800 focus:outline-none focus:ring-1 focus:ring-green-500 rounded"
                      title="复制承诺哈希"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copySuccess ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="max-w-6xl mx-auto">
          {phase === 'ready' && (
            <div>
              <ShuffleAnimation 
                onShuffleComplete={handleShuffleComplete}
                disabled={true}
              />
              <div className="text-center mt-6 text-sm text-gray-600">
                <p>🚀 系统将在 {countdown} 秒后自动开始洗牌...</p>
                <p className="text-xs text-blue-500 mt-2">调试信息：phase={phase}, session={session ? '已创建' : '未创建'}</p>
              </div>
            </div>
          )}

          {phase === 'selecting' && (
            <div>
              <DeckGrid
                totalCards={totalCards}
                maxSelection={maxCards}
                onSelectionChange={handleSelectionChange}
                isShuffling={false}
                disabled={false}
              />
              
              {/* 确认按钮 */}
              <div className="text-center mt-8">
                <button
                  onClick={handleRevealCards}
                  disabled={selectedPositions.length !== maxCards}
                  className={`
                    px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200
                    ${selectedPositions.length === maxCards
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Eye className="inline h-5 w-5 mr-2" />
                  揭示并解读 ({selectedPositions.length}/{maxCards})
                </button>
              </div>
            </div>
          )}

          {phase === 'revealing' && (
            <div className="text-center py-16">
              <LoadingSpinner size="lg" text="正在揭示牌面并生成解读..." />
              <div className="mt-6 text-sm text-gray-600">
                <p>正在验证选择并生成专属解读</p>
              </div>
            </div>
          )}
        </div>

        {/* 说明文档 */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white/50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">公平性保证</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">承诺-揭示协议</h4>
              <p>
                系统首先生成随机种子并创建承诺哈希，在您选牌后才揭示种子。
                这确保了系统无法根据您的选择来操纵结果。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">无偏置洗牌</h4>
              <p>
                使用 Fisher-Yates 算法和 HMAC_DRBG 进行洗牌，
                确保每种排列的概率完全相等，没有任何偏向性。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DrawPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载页面中..." />
      </div>
    }>
      <DrawPageContent />
    </Suspense>
  );
}
