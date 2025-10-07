'use client';

import { useEffect, useRef } from 'react';

interface LiveAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearOnUnmount?: boolean;
}

/**
 * LiveAnnouncer - 无障碍屏幕阅读器播报组件
 * 遵循 ARIA Live Regions 规范
 */
export function LiveAnnouncer({ 
  message, 
  priority = 'polite', 
  clearOnUnmount = true 
}: LiveAnnouncerProps) {
  const liveRef = useRef<HTMLDivElement>(null);
  const previousMessage = useRef<string>('');

  useEffect(() => {
    if (message && message !== previousMessage.current) {
      if (liveRef.current) {
        // 清空后重新设置，确保屏幕阅读器能够检测到变化
        liveRef.current.textContent = '';
        setTimeout(() => {
          if (liveRef.current) {
            liveRef.current.textContent = message;
          }
        }, 100);
      }
      previousMessage.current = message;
    }
  }, [message]);

  useEffect(() => {
    const currentRef = liveRef.current;
    return () => {
      if (clearOnUnmount && currentRef) {
        currentRef.textContent = '';
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={liveRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    />
  );
}

/**
 * useAnnouncer Hook - 用于程序化播报
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;

    // 创建临时播报元素
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(announcer);
    
    // 延迟设置内容确保屏幕阅读器检测到
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // 清理
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  };

  return { announce };
}
