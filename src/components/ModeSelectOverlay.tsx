'use client';
import { motion } from 'framer-motion';

interface Props {
  onSelect:  (mode: 'gesture' | 'mouse') => void;
  language?: 'zh' | 'en';
}

function StarMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 0 L7.7 5.3 L13 7 L7.7 8.7 L7 14 L6.3 8.7 L1 7 L6.3 5.3 Z"
        fill="rgba(255,255,255,0.7)"
      />
    </svg>
  );
}

function Rule({ dim }: { dim?: boolean }) {
  return (
    <div
      className="w-full"
      style={{ height: '1px', background: dim ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}
    />
  );
}

const T = {
  zh: {
    prelude:  '开始之前',
    title:    '选择你的方式',
    i_label:  '手势控制',
    i_sub:    '摄像头 · 手势追踪',
    ii_label: '鼠标 / 触屏',
    ii_sub:   '点击 · 拖拽 · 轻触',
    footer:   '仪式过程中可随时切换',
  },
  en: {
    prelude:  'Before You Begin',
    title:    'Choose Your Path',
    i_label:  'Hand Gesture',
    i_sub:    'Camera · gesture tracking',
    ii_label: 'Mouse & Touch',
    ii_sub:   'Click · drag · tap',
    footer:   'Switch anytime during the ritual',
  },
} as const;

export function ModeSelectOverlay({ onSelect, language = 'zh' }: Props) {
  const t = T[language];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(4,3,12,0.97)', backdropFilter: 'blur(14px)' }}
    >
      <div className="w-full max-w-[300px] px-0 flex flex-col">

        <Rule />

        <div className="flex items-center justify-center gap-4 py-5">
          <Rule dim />
          <StarMark />
          <Rule dim />
        </div>

        {/* Header */}
        <div className="text-center pb-7 px-6">
          <p
            className="text-[8px] tracking-[0.4em] text-white/30 uppercase mb-4"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {t.prelude}
          </p>
          <h2
            className="text-[20px] text-white/88 leading-snug"
            style={{ fontFamily: 'Red Rose, serif', fontWeight: 300, color: 'rgba(255,255,255,0.88)' }}
          >
            {t.title}
          </h2>
        </div>

        <Rule />

        {/* Option I */}
        <motion.button
          onClick={() => onSelect('gesture')}
          className="group w-full text-left px-6 py-6 transition-colors duration-300"
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-baseline gap-3 mb-1">
            <span
              className="text-[11px] text-white/28 group-hover:text-white/50 transition-colors duration-300 tabular-nums"
              style={{ fontFamily: 'Red Rose, serif', fontWeight: 300, color: 'rgba(255,255,255,0.28)' }}
            >
              Ⅰ
            </span>
            <span
              className="text-[17px] text-white/75 group-hover:text-white/95 transition-colors duration-300 leading-none"
              style={{ fontFamily: 'Red Rose, serif', fontWeight: 300 }}
            >
              {t.i_label}
            </span>
          </div>
          <p
            className="text-[10px] text-white/22 group-hover:text-white/38 transition-colors duration-300 pl-[22px] tracking-wide"
            style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(255,255,255,0.22)' }}
          >
            {t.i_sub}
          </p>
        </motion.button>

        <Rule dim />

        {/* Option II */}
        <motion.button
          onClick={() => onSelect('mouse')}
          className="group w-full text-left px-6 py-6 transition-colors duration-300"
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-baseline gap-3 mb-1">
            <span
              className="text-[11px] text-white/28 group-hover:text-white/50 transition-colors duration-300 tabular-nums"
              style={{ fontFamily: 'Red Rose, serif', fontWeight: 300, color: 'rgba(255,255,255,0.28)' }}
            >
              Ⅱ
            </span>
            <span
              className="text-[17px] text-white/75 group-hover:text-white/95 transition-colors duration-300 leading-none"
              style={{ fontFamily: 'Red Rose, serif', fontWeight: 300 }}
            >
              {t.ii_label}
            </span>
          </div>
          <p
            className="text-[10px] text-white/22 group-hover:text-white/38 transition-colors duration-300 pl-[22px] tracking-wide"
            style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(255,255,255,0.22)' }}
          >
            {t.ii_sub}
          </p>
        </motion.button>

        <Rule />

        <p
          className="text-center text-[8px] tracking-[0.3em] uppercase mt-5 mb-1"
          style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(255,255,255,0.18)' }}
        >
          {t.footer}
        </p>

      </div>
    </motion.div>
  );
}
