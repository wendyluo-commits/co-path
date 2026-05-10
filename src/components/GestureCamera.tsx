'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHandGesture } from '@/hooks/useHandGesture';

interface GestureCameraProps {
  onPinch?: () => void;
  onSwipe?: () => void;
}

type GuidePhase =
  | 'loading'
  | 'idle'
  | 'hand-detected'
  | 'pinching'
  | 'confirmed';

const PHASE_CONFIG: Record<
  GuidePhase,
  { emoji: string; text: string; color: string }
> = {
  loading: { emoji: '⋯', text: '初始化中', color: 'text-white/50' },
  idle: { emoji: '👋', text: '把手放到镜头前', color: 'text-white/80' },
  'hand-detected': {
    emoji: '🤏',
    text: '捏合选牌 / 挥手翻牌',
    color: 'text-white'
  },
  pinching: { emoji: '🤏', text: '保持捏合...', color: 'text-purple-300' },
  confirmed: { emoji: '✅', text: '已触发', color: 'text-purple-200' }
};

export function GestureCamera({ onPinch, onSwipe }: GestureCameraProps) {
  const [gestureMode, setGestureMode] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  const handlePinch = useCallback(() => {
    setConfirmed(true);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmed(false), 800);
    onPinch?.();
  }, [onPinch]);

  const {
    videoRef,
    isLoading,
    isReady,
    error,
    isHandVisible,
    isPinching,
    pinchProgress
  } = useHandGesture({
    enabled: gestureMode,
    onPinch: handlePinch,
    onSwipe,
    videoConstraints: {
      width: { ideal: 320 },
      height: { ideal: 240 },
      facingMode: 'user'
    }
  });

  const phase: GuidePhase = !isReady
    ? 'loading'
    : confirmed
      ? 'confirmed'
      : isPinching
        ? 'pinching'
        : isHandVisible
          ? 'hand-detected'
          : 'idle';

  const config = PHASE_CONFIG[phase];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      {gestureMode && (
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ width: 200, height: 150 }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
            width={320}
            height={240}
            playsInline
            muted
          />

          <div className="absolute inset-0 bg-black/30" />

          {pinchProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                aria-hidden
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(167,139,250,0.3)"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgb(167,139,250)"
                  strokeWidth="4"
                  strokeDasharray={`${pinchProgress * 176} 176`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                  style={{ transition: 'stroke-dasharray 60ms linear' }}
                />
              </svg>
            </div>
          )}

          {confirmed && (
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(167,139,250,0.4)',
                animation: 'gesture-flash 0.8s ease-out forwards'
              }}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/50 backdrop-blur-sm flex items-center gap-2">
            <span className="text-base">{config.emoji}</span>
            <span className={`text-xs font-medium ${config.color}`}>
              {config.text}
            </span>
          </div>

          {error && (
            <div className="absolute top-2 left-2 right-2 text-xs text-red-400 bg-black/60 rounded-lg px-2 py-1 text-center">
              {error}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setGestureMode(v => !v)}
        title={gestureMode ? '关闭手势模式' : '开启手势模式'}
        className={[
          'w-12 h-12 rounded-full flex items-center justify-center text-xl',
          'shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          gestureMode
            ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2'
            : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-105'
        ].join(' ')}
      >
        {gestureMode ? '🤏' : '✋'}
      </button>

      <style>{`@keyframes gesture-flash { 0% { opacity:1 } 100% { opacity:0 } }`}</style>
    </div>
  );
}
