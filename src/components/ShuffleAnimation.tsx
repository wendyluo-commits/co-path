'use client';

import { useState, useEffect } from 'react';
import { Shuffle, Sparkles } from 'lucide-react';

interface ShuffleAnimationProps {
  onShuffleComplete: () => void;
  disabled?: boolean;
}

/**
 * ShuffleAnimation - 洗牌动画组件
 * 支持 prefers-reduced-motion 用户的降级体验
 */
export function ShuffleAnimation({ onShuffleComplete, disabled = false }: ShuffleAnimationProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleProgress, setShuffleProgress] = useState(0);

  // 检测用户是否偏好减少动画
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const startShuffle = async () => {
    if (disabled || isShuffling) return;

    setIsShuffling(true);
    setShuffleProgress(0);

    if (prefersReducedMotion) {
      // 减少动画模式：直接完成
      setTimeout(() => {
        setShuffleProgress(100);
        setIsShuffling(false);
        onShuffleComplete();
      }, 300);
    } else {
      // 正常动画模式：渐进式进度
      const duration = 2000; // 2秒
      const steps = 20;
      const stepDuration = duration / steps;
      
      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          setShuffleProgress((i / steps) * 100);
          
          if (i === steps) {
            setIsShuffling(false);
            onShuffleComplete();
          }
        }, i * stepDuration);
      }
    }
  };

  return (
    <div className="text-center py-8">
      {/* 洗牌按钮 */}
      <button
        onClick={startShuffle}
        disabled={disabled || isShuffling}
        className={`
          inline-flex items-center px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200
          ${isShuffling 
            ? 'bg-purple-400 text-white cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label={isShuffling ? '正在洗牌中' : '开始洗牌'}
      >
        {isShuffling ? (
          <>
            <div className="animate-spin mr-3">
              <Shuffle className="h-6 w-6" />
            </div>
            正在洗牌中...
          </>
        ) : (
          <>
            <Sparkles className="h-6 w-6 mr-3" />
            开始洗牌
          </>
        )}
      </button>

      {/* 洗牌进度 */}
      {isShuffling && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>洗牌进度</span>
            <span>{Math.round(shuffleProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-100 ease-out rounded-full"
              style={{ width: `${shuffleProgress}%` }}
              role="progressbar"
              aria-valuenow={shuffleProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="洗牌进度"
            />
          </div>
        </div>
      )}

      {/* 洗牌说明 */}
      <div className="mt-6 text-sm text-gray-600 max-w-md mx-auto">
        <p className="mb-2">
          点击&ldquo;开始洗牌&rdquo;后，系统将使用加密强随机数进行无偏置洗牌。
        </p>
        <p className="text-xs text-gray-500">
          洗牌过程使用 Fisher-Yates 算法和 HMAC_DRBG，确保公平性和可验证性。
        </p>
      </div>

      {/* 可访问性增强：屏幕阅读器状态播报 */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {isShuffling ? `洗牌进行中，进度 ${Math.round(shuffleProgress)}%` : ''}
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-spin {
            animation: none;
          }
          
          button {
            transform: none !important;
            transition: background-color 0.2s ease !important;
          }
          
          .transition-all {
            transition: background-color 0.2s ease !important;
          }
        }
      `}</style>
    </div>
  );
}
