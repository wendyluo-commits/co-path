'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  spread?:  string;
  language: 'zh' | 'en';
  onDone:   () => void;
}

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  zh: {
    prelude:      '离开前',
    question:     '这次的解读体验如何？',
    improveTitle: '请问我们可以改进哪里？',
    improvements: [
      { id: 'result',    label: '塔罗牌的结果不符合预期' },
      { id: 'accuracy',  label: '抽牌的时候不够准确'     },
      { id: 'interface', label: '界面操作不顺畅'         },
      { id: 'other',     label: '其他'                  },
    ],
    placeholder: '还有其他想说的吗？（选填）',
    skip:        '跳过',
    submit:      '提交',
    thanks:      '感谢反馈',
    thanksSub:   '您的意见已收到',
  },
  en: {
    prelude:      'Before You Go',
    question:     'How was your reading?',
    improveTitle: 'What can we improve?',
    improvements: [
      { id: 'result',    label: 'Reading results were inaccurate' },
      { id: 'accuracy',  label: 'Card selection was imprecise'    },
      { id: 'interface', label: 'Interface was hard to use'       },
      { id: 'other',     label: 'Other'                          },
    ],
    placeholder: 'Anything else to share? (optional)',
    skip:        'Skip',
    submit:      'Submit',
    thanks:      'Thank you',
    thanksSub:   'Your feedback is received',
  },
} as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 0.5 L7.7 5.3 L12.5 7 L7.7 8.7 L7 13.5 L6.3 8.7 L1.5 7 L6.3 5.3 Z"
        fill={filled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.13)'}
        style={{ transition: 'fill 0.15s' }}
      />
    </svg>
  );
}

function Rule({ dim }: { dim?: boolean }) {
  return (
    <div
      className="w-full"
      style={{ height: 1, background: dim ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)' }}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FeedbackOverlay({ spread, language, onDone }: Props) {
  const t = T[language];

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [areas,     setAreas]     = useState<string[]>([]);
  const [comment,   setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const showImprove = rating > 0 && rating <= 3;

  const toggleArea = (id: string) =>
    setAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          rating,
          comment,
          spread,
          improvementAreas: areas.length ? areas.join(', ') : undefined,
        }),
      });
    } catch {
      // fail silently — don't block the user
    }
    setSubmitted(true);
    setTimeout(onDone, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[400] flex items-center justify-center"
      style={{ background: 'rgba(4,3,12,0.96)', backdropFilter: 'blur(14px)' }}
    >
      <div className="w-full max-w-[300px] flex flex-col">

        <Rule />

        {/* Ornament row */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Rule dim />
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 0.5 L7.7 5.3 L12.5 7 L7.7 8.7 L7 13.5 L6.3 8.7 L1.5 7 L6.3 5.3 Z"
              fill="rgba(255,255,255,0.60)" />
          </svg>
          <Rule dim />
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (

            /* ── Thank-you ── */
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6"
            >
              <p className="text-[18px] text-white/80 mb-2"
                style={{ fontFamily: 'Red Rose, serif', fontWeight: 300 }}>
                {t.thanks}
              </p>
              <p className="text-[10px] text-white/30 tracking-widest uppercase"
                style={{ fontFamily: 'Roboto, sans-serif' }}>
                {t.thanksSub}
              </p>
            </motion.div>

          ) : (

            /* ── Form ── */
            <motion.div key="form" className="flex flex-col">

              {/* Header */}
              <div className="text-center px-6 py-6">
                <p className="text-[8px] tracking-[0.4em] text-white/28 uppercase mb-3"
                  style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(255,255,255,0.28)' }}>
                  {t.prelude}
                </p>
                <h2 className="text-[19px] text-white/85 leading-snug"
                  style={{ fontFamily: 'Red Rose, serif', fontWeight: 300 }}>
                  {t.question}
                </h2>
              </div>

              <Rule />

              {/* Star rating */}
              <div className="flex justify-center gap-4 py-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} ${language === 'zh' ? '星' : 'stars'}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => { setRating(n); setAreas([]); }}
                    className="transition-transform duration-100 hover:scale-110 active:scale-95"
                  >
                    <StarIcon filled={n <= (hover || rating)} />
                  </button>
                ))}
              </div>

              {/* Low-rating improvement chips — animate in when rating 1-3 */}
              <AnimatePresence>
                {showImprove && (
                  <motion.div
                    key="improve"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <Rule />
                    <div className="px-6 py-5">
                      <p className="text-[9px] tracking-[0.3em] text-white/35 uppercase mb-4"
                        style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {t.improveTitle}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {t.improvements.map(opt => {
                          const active = areas.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleArea(opt.id)}
                              className="px-3 py-1.5 rounded-full text-[11px] transition-all duration-150"
                              style={{
                                fontFamily:  'Roboto, sans-serif',
                                border:      `1px solid ${active ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.15)'}`,
                                background:  active ? 'rgba(255,255,255,0.10)' : 'transparent',
                                color:       active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)',
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Rule />

              {/* Comment */}
              <div className="px-6 py-5">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t.placeholder}
                  rows={3}
                  className="w-full bg-transparent resize-none text-[12px] text-white/55 placeholder-white/18 outline-none leading-relaxed"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>

              <Rule />

              {/* Actions */}
              <div className="flex">
                <button
                  type="button"
                  onClick={onDone}
                  className="flex-1 py-5 text-[10px] text-white/25 tracking-widest uppercase hover:text-white/45 transition-colors duration-200"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {t.skip}
                </button>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.10)' }} />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating === 0 || loading}
                  className="flex-1 py-5 text-[14px] text-white/75 hover:text-white/95 transition-colors duration-200 disabled:text-white/20 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Red Rose, serif', fontWeight: 300 }}
                >
                  {loading ? '…' : t.submit}
                </button>
              </div>

              <Rule />

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
