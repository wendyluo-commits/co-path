'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollHintProps {
  className?: string;
  /** Auto-dismiss timeout in ms (default 6000) */
  timeout?: number;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

export function ScrollHint({ className = '', timeout = 6000 }: ScrollHintProps) {
  const [visible, setVisible] = useState(true);
  const sentinelRef = useRef<HTMLSpanElement>(null);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollContainer = findScrollParent(sentinel);

    const handleScroll = () => {
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 80;
        if (scrollTop > 60 || nearBottom) dismiss();
      } else {
        const scrollTop = window.scrollY;
        const { scrollHeight, clientHeight } = document.documentElement;
        const nearBottom = scrollTop + clientHeight >= scrollHeight - 80;
        if (scrollTop > 60 || nearBottom) dismiss();
      }
    };

    const target = scrollContainer ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });

    const timer = setTimeout(dismiss, timeout);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dismiss, timeout]);

  return (
    <>
      <span ref={sentinelRef} className="sr-only" aria-hidden="true" />
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none ${className}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center gap-0.5 px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15 shadow-lg">
              <span className="text-white/90 text-xs font-medium tracking-wide">
                向下滑动查看更多
              </span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={14} className="text-white/70" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
