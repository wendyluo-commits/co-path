'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function LoadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRitual = searchParams.get('fromRitual');
  const spread = searchParams.get('spread');
  const question = searchParams.get('question');
  const [loadingText, setLoadingText] = useState('正在解读塔罗牌...');
  const [currentScreen, setCurrentScreen] = useState(1);
  const [progress, setProgress] = useState({
    percent: 0,
    phaseText: "连接宇宙能量…",
    stage: "connecting"
  });

  // 音效相关状态
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // 生成神秘音效
  const createMysticalSound = (frequency: number, duration: number, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
    if (!audioEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    // 音量渐变
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // 播放连接宇宙能量的音效
  const playConnectionSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    // 低频神秘音调
    createMysticalSound(220, 2, 'sine');
    setTimeout(() => createMysticalSound(330, 1.5, 'triangle'), 200);
    setTimeout(() => createMysticalSound(440, 1, 'sine'), 400);
  };

  // 播放解读完成的音效
  const playCompletionSound = () => {
    if (!audioEnabled || !audioContext) return;
    
    // 上升音阶
    createMysticalSound(440, 0.5, 'sine');
    setTimeout(() => createMysticalSound(554, 0.5, 'sine'), 100);
    setTimeout(() => createMysticalSound(659, 0.5, 'sine'), 200);
    setTimeout(() => createMysticalSound(880, 1, 'sine'), 300);
  };

  // 辅助函数：根据百分比返回阶段文字
  const getPhaseText = (percent: number): string => {
    if (percent < 25) return "连接宇宙能量…";
    if (percent < 50) return "解读卡牌含义…";
    if (percent < 75) return "正在生成解读结果…";
    if (percent < 100) return "解读即将完成…";
    return "解读完成！";
  };

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
    
    // 初始化音效
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
        
        // 播放连接宇宙能量的音效
        setTimeout(() => {
          playConnectionSound();
        }, 500);
      } catch (error) {
        console.log('Audio not supported:', error);
        setAudioEnabled(false);
      }
    };
    
    initAudio();
    
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

        // 获取当前语言设置
        const currentLanguage = localStorage.getItem('language') as 'zh' | 'en' || 'zh';
        
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
        
        // 停止假进度定时器
        if (progressTimer) stopFakeProgress(progressTimer);
        
        // 最终推进到100%
        setProgress({
          percent: 100,
          phaseText: "解读完成！",
          stage: "done"
        });
        
        // 播放解读完成音效
        playCompletionSound();
        
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

  return (
    <>
      <style jsx global>{`
        body {
          background: none !important;
        }
      `}</style>
      
      {/* 音效控制按钮 */}
      <div className="fixed top-4 right-4 z-60">
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
          aria-label={audioEnabled ? "关闭音效" : "开启音效"}
        >
          {audioEnabled ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          )}
        </button>
      </div>
      
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
