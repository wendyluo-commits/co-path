'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollHintProps {
  className?: string;
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

const CHEVRON_COUNT = 3;
const STAGGER = 0.28;
const CYCLE = 1.6;

function FlowChevron({ index }: { index: number }) {
  const delay = index * STAGGER;

  return (
    <motion.div
      animate={{
        y: [0, 7, 0],
        opacity: [0.18, 0.85, 0.18],
      }}
      transition={{
        duration: CYCLE,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
        repeatDelay: 0,
      }}
      style={{ lineHeight: 0 }}
    >
      <ChevronDown size={50} strokeWidth={1.2} className="text-white" />
    </motion.div>
  );
}

export function ScrollHint({ className = '', timeout = 8000 }: ScrollHintProps) {
  const [visible, setVisible] = useState(true);
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let cleanupFn: (() => void) | undefined;

    const setup = () => {
      const scrollContainer = findScrollParent(sentinel);
      const target: HTMLElement | Window = scrollContainer ?? window;

      const handleScroll = () => {
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          if (scrollHeight <= clientHeight + 50) return;
          if (scrollTop > 80 || scrollTop + clientHeight >= scrollHeight - 80) {
            setVisible(false);
          }
        } else {
          const scrollTop = window.scrollY;
          const { scrollHeight, clientHeight } = document.documentElement;
          if (scrollHeight <= clientHeight + 50) return;
          if (scrollTop > 80 || scrollTop + clientHeight >= scrollHeight - 80) {
            setVisible(false);
          }
        }
      };

      target.addEventListener('scroll', handleScroll, { passive: true });
      cleanupFn = () => target.removeEventListener('scroll', handleScroll);
    };

    const initTimer = setTimeout(setup, 500);

    return () => {
      clearTimeout(initTimer);
      cleanupFn?.();
    };
  }, []);

  return (
    <>
      <span ref={sentinelRef} className="sr-only" aria-hidden="true" />
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-0 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {Array.from({ length: CHEVRON_COUNT }, (_, i) => (
              <FlowChevron key={i} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
