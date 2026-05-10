'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { isLimitReached, consumeQuota, DAILY_LIMIT, minutesUntilReset } from '@/lib/daily-limit';

function LoadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRitual = searchParams.get('fromRitual');
  const spread = searchParams.get('spread');
  const question = searchParams.get('question');
  const langParam = searchParams.get('lang') as 'zh' | 'en' | null;
  const [currentScreen, setCurrentScreen] = useState(1);
  const [limitReached, setLimitReached] = useState(false);
  const hasStartedRef = useRef(false);

  const isEn = langParam === 'en';

  const getPhaseText = (percent: number): string => {
    if (isEn) {
      if (percent < 25) return "Connecting to tarot energy…";
      if (percent < 50) return "Reading the cards…";
      if (percent < 75) return "Composing your reading…";
      if (percent < 100) return "Almost ready…";
      return "Reading complete!";
    }
    if (percent < 25) return "正在接入塔罗牌能量…";
    if (percent < 50) return "解读卡牌含义…";
    if (percent < 75) return "正在生成解读结果…";
    if (percent < 100) return "解读即将完成…";
    return "解读完成！";
  };

  const [progress, setProgress] = useState({
    percent: 0,
    phaseText: isEn ? "Connecting to tarot energy…" : "正在接入塔罗牌能量…",
    stage: "connecting"
  });

  // 根据牌阵类型获取进度条配置
  const getProgressConfig = (spreadType: string) => {
    switch (spreadType) {
      case 'single':
        return {
          interval: 500, // 0.4秒
          increment: { min: 1, max: 4 } // 1-4%
        };
      case 'three-card':
      case 'situation-action-outcome':
        return {
          interval: 900, // 0.6秒
          increment: { min: 0.8, max: 2 } // 0.8-2.5%
        };
      case 'five-card':
        return {
          interval: 900, // 0.8秒
          increment: { min: 0.8, max: 2 } // 0.5-1.8%
        };
      default:
        return {
          interval: 600, // 默认0.6秒
          increment: { min: 0.8, max: 3 } // 0.8-2.5%
        };
    }
  };

  // 启动假进度
  const startFakeProgress = (spreadType: string = 'single') => {
    const config = getProgressConfig(spreadType);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev.percent >= 99) {
          clearInterval(timer);
          return prev;
        }
        const inc = Math.random() * (config.increment.max - config.increment.min) + config.increment.min;
        const next = Math.min(prev.percent + inc, 99);
        return {
          ...prev,
          percent: next,
          phaseText: getPhaseText(next)
        };
      });
    }, config.interval);

    return timer;
  };

  // 停止假进度
  const stopFakeProgress = (timer: NodeJS.Timeout) => {
    if (timer) {
      clearInterval(timer);
    }
  };

  useEffect(() => {
    // 清除全局背景，防止闪烁
    const originalBackground = document.body.style.background;
    document.body.style.background = 'none';
    
    
    // 组件卸载时恢复原始背景
    return () => {
      document.body.style.background = originalBackground;
    };
  }, []);

  // 屏幕切换动画逻辑
  useEffect(() => {
    const screenSequence = [1, 2, 5, 1]; // 循环顺序：1251
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % screenSequence.length;
      setCurrentScreen(screenSequence[currentIndex]);
    }, 1200); // 1200ms统一timing
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!fromRitual) {
      router.push('/reading');
      return;
    }

    // 调用API进行塔罗牌解读
    const performReading = async () => {
      // Guard against StrictMode double-fire: only one execution per mount lifecycle
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      // 检查每日限额 — read-only, quota not consumed until successful response
      if (isLimitReached()) {
        setLimitReached(true);
        return;
      }

      let progressTimer: NodeJS.Timeout | null = null;
      try {
        // 启动假进度，根据牌阵类型调整速度
        progressTimer = startFakeProgress(spread || 'single');

        // 从sessionStorage获取选中的卡牌数据
        let cards;
        if (fromRitual) {
          const drawResult = sessionStorage.getItem('drawResult');
          if (drawResult) {
            const drawData = JSON.parse(drawResult);
            cards = drawData.cards;
            console.log('Using cards from drawResult:', cards);
          } else {
            console.error('No drawResult found in sessionStorage');
            // 如果没有数据，使用默认数据
            cards = buildDefaultCards();
          }
        } else {
          // 其他来源使用默认数据
          cards = buildDefaultCards();
        }

        // 获取当前语言设置 — prefer URL param, fall back to localStorage
        const currentLanguage: 'zh' | 'en' = langParam ?? (localStorage.getItem('language') as 'zh' | 'en') ?? 'zh';
        console.log('Loading页面发送的语言参数:', currentLanguage);
        
        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: question || '我的塔罗牌问题', 
            spread: spread || 'single', 
            tone: 'gentle', 
            lang: currentLanguage, 
            seed: Math.floor(Math.random() * 1000000), 
            cards,
            useNewFormat: true  // 启用新的解读格式
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        // Quota consumed only here — after a confirmed successful response
        consumeQuota();

        // 停止假进度定时器
        if (progressTimer) stopFakeProgress(progressTimer);
        
        // 最终推进到100%
        setProgress({
          percent: 100,
          phaseText: "解读完成！",
          stage: "done"
        });
        
        
        // 存储结果到sessionStorage，包含更多信息用于历史记录
        const extendedResult = {
          ...result,
          _metadata: {
            question: question || '我的塔罗牌问题',
            spread: spread || 'single',
            timestamp: Date.now()
          }
        };
        sessionStorage.setItem('readingResult', JSON.stringify(extendedResult));
        
        // 给一点缓冲时间让动画自然完成
        setTimeout(() => {
          // 跳转到reading页面，传递问题参数
          const params = new URLSearchParams({
            fromRitual: 'true',
            question: question || ''
          });
          router.push(`/reading?${params.toString()}`);
        }, 500);
        
      } catch (error) {
        console.error('解读失败:', error);
        
        // 停止假进度定时器
        if (progressTimer) stopFakeProgress(progressTimer);
        
        // 显示错误状态
        setProgress({
          percent: 0,
          phaseText: "加载失败，请重试",
          stage: "error"
        });
        
        // 存储错误信息
        sessionStorage.setItem('readingResult', JSON.stringify({
          error: true,
          message: '解读失败，请重试'
        }));
        router.push('/reading?error=true');
      }
    };

    // 构建默认卡牌数据的辅助函数
    const buildDefaultCards = () => {
      const out: Array<{name: string, suit: string, number: number, orientation: string, position: string}> = [];
      const positions = spread === 'single' 
        ? ['当前状况'] 
        : spread === 'situation-action-outcome' 
        ? ['现状', '行动', '结果'] 
        : ['过去', '现在', '未来', '建议', '结果'];
      
      // 默认数据（仅在其他来源时使用）
      for (let i = 0; i < positions.length; i++) {
        out.push({
          name: '测试卡牌',
          orientation: 'upright',
          position: positions[i],
          suit: 'major',
          number: i + 1
        });
      }
      return out;
    };

    performReading();
  }, [router, fromRitual, spread, question]);

  // 获取当前屏幕的图片路径
  const getScreenImage = (screenNumber: number) => {
    return `/screen${screenNumber}.svg`;
  };

  // 每日限额已用完 — 显示专属屏幕
  if (limitReached) {
    const mins = minutesUntilReset();
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    const resetText = hours > 0
      ? (isEn ? `${hours}h ${remainMins}m` : `${hours} 小时 ${remainMins} 分钟`)
      : (isEn ? `${remainMins} minutes` : `${remainMins} 分钟`);
    const limit = DAILY_LIMIT;

    return (
      <>
        <style jsx global>{`body { background: none !important; }`}</style>
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
          style={{
            backgroundImage: 'url(/screen1.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            {/* 星形图标 */}
            <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-2xl text-white/80">
              ✦
            </div>

            <div className="space-y-2">
              <p className="text-white text-lg font-light tracking-wide">
                {isEn ? 'Daily readings used up' : '今日解读次数已用完'}
              </p>
              <p className="text-white/55 text-sm leading-relaxed">
                {isEn
                  ? `Each day allows ${limit} readings. Come back in ${resetText}.`
                  : `每天最多进行 ${limit} 次解读，距离明日重置还有 ${resetText}。`}
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="mt-2 px-8 py-3 rounded-full border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors"
            >
              {isEn ? 'Back to home' : '返回首页'}
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background: none !important;
        }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* 基础层 - Screen 1 */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${getScreenImage(1)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          animate={{
            opacity: currentScreen === 1 ? 1 : 0.3
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        
        {/* 叠加层 - Screen 2 */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${getScreenImage(2)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          animate={{
            opacity: currentScreen === 2 ? 1 : 0.3
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        
        {/* 叠加层 - Screen 5 */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${getScreenImage(5)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          animate={{
            opacity: currentScreen === 5 ? 1 : 0.3
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* 中心动画层：漂浮卡片 + 光晕 + 星光 */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          {/* 光晕 */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [0.9, 1.05, 0.9],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* 漂浮卡片 */}
          <motion.div
            className="relative w-40 h-64 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            animate={{
              y: [-8, 8, -8],
              rotate: [-3, 3, -3],
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.25)',
                '0 0 40px rgba(255,255,255,0.45)',
                '0 0 20px rgba(255,255,255,0.25)',
              ],
              scale: progress.percent > 90 ? [1, 1.03, 1] : 1,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center text-sm text-white/90">
                ✶
              </div>
              <p className="text-xs text-center text-white/80 px-4 leading-relaxed whitespace-pre-line">
                {isEn ? "Connecting to\nyour tarot energy…" : "正在为你接入\n塔罗牌能量…"}
              </p>
            </div>
          </motion.div>

          {/* 星光粒子 */}
          <motion.div
            className="absolute w-64 h-64"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{
                  top: i % 2 === 0 ? '10%' : '80%',
                  left: i < 2 ? '15%' : '85%',
                }}
                animate={{
                  scale: [0.6, 1.2, 0.6],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* 进度条层 */}
        <div className="absolute bottom-20 left-0 right-0 z-20 px-8">
          <div className="max-w-md mx-auto">
            {/* 进度条背景 */}
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              {/* 进度条填充 */}
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            {/* 进度文字 */}
            <div className="text-center mt-4">
              <p className="text-white text-sm opacity-80">{progress.phaseText}</p>
              <p className="text-white text-xs opacity-60 mt-1">{Math.round(progress.percent)}%</p>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoadingPageContent />
    </Suspense>
  );
}
