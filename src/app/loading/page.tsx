'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { isLimitReached, consumeQuota, DAILY_LIMIT, minutesUntilReset } from '@/lib/daily-limit';

const TEXTS = {
  zh: {
    phaseConnecting: '正在接入塔罗牌能量…',
    phaseReading: '解读卡牌含义…',
    phaseComposing: '正在生成解读结果…',
    phaseFinalizing: '解读即将完成…',
    phaseDone: '解读完成！',
    phaseError: '加载失败，请重试',
    cardCopy: '正在为你接入\n塔罗牌能量…',
    limitTitle: '今日解读次数已用完',
    limitBody: (limit: number, when: string) => `每天最多进行 ${limit} 次解读，距离明日重置还有 ${when}。`,
    limitCta: '返回首页',
    fallbackError: '解读失败，请重试',
    defaultQuestion: '我的塔罗牌问题',
  },
  en: {
    phaseConnecting: 'Connecting to tarot energy…',
    phaseReading: 'Reading the cards…',
    phaseComposing: 'Composing your reading…',
    phaseFinalizing: 'Almost ready…',
    phaseDone: 'Reading complete!',
    phaseError: 'Failed to load. Please retry.',
    cardCopy: 'Connecting to\nyour tarot energy…',
    limitTitle: 'Daily readings used up',
    limitBody: (limit: number, when: string) => `Each day allows ${limit} readings. Come back in ${when}.`,
    limitCta: 'Back to home',
    fallbackError: 'Reading failed. Please retry.',
    defaultQuestion: 'My tarot question',
  },
} as const;

function getLang(urlParam: string | null): 'zh' | 'en' {
  if (urlParam === 'en' || urlParam === 'zh') return urlParam;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'zh') return stored;
  }
  return 'zh';
}

function getProgressConfig(spread: string) {
  switch (spread) {
    case 'single':
      return { interval: 500, increment: { min: 1, max: 4 } };
    case 'three-card':
    case 'situation-action-outcome':
      return { interval: 900, increment: { min: 0.8, max: 2 } };
    case 'five-card':
      return { interval: 900, increment: { min: 0.8, max: 2 } };
    default:
      return { interval: 600, increment: { min: 0.8, max: 3 } };
  }
}

function LoadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRitual = searchParams.get('fromRitual');
  const spread = searchParams.get('spread');
  const question = searchParams.get('question');
  const isFollowUp = searchParams.get('followUp') === '1';
  const lang = getLang(searchParams.get('lang') as 'zh' | 'en' | null);
  const t = TEXTS[lang];

  const [currentScreen, setCurrentScreen] = useState(1);
  const [limitReached, setLimitReached] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; phaseText: string }>({
    percent: 0,
    phaseText: t.phaseConnecting,
  });

  const getPhaseText = (percent: number): string => {
    if (percent < 25) return t.phaseConnecting;
    if (percent < 50) return t.phaseReading;
    if (percent < 75) return t.phaseComposing;
    if (percent < 100) return t.phaseFinalizing;
    return t.phaseDone;
  };

  // Body background reset — keep cleanup in the same effect.
  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = 'none';
    return () => {
      document.body.style.background = original;
    };
  }, []);

  // Background screen-cycle animation. Independent of the data fetch.
  useEffect(() => {
    const sequence = [1, 2, 5, 1];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % sequence.length;
      setCurrentScreen(sequence[i]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Data fetch — runs once per mount; cleans up its timer on unmount.
  // No ref-based double-fire guard: in React StrictMode (dev), the effect
  // mounts twice. A ref-based guard would let Mount 1 start the work, then
  // cleanup cancels it, then Mount 2 sees the ref set and skips — leaving
  // the progress bar at 0% forever. The cancelled flag is enough.
  useEffect(() => {
    if (!fromRitual) {
      router.push('/reading');
      return;
    }

    if (isLimitReached()) {
      setLimitReached(true);
      return;
    }

    let cancelled = false;
    let progressTimer: ReturnType<typeof setInterval> | null = null;
    const abortController = new AbortController();

    const startFakeProgress = () => {
      const config = getProgressConfig(spread || 'single');
      progressTimer = setInterval(() => {
        if (cancelled) return;
        setProgress(prev => {
          if (prev.percent >= 99) return prev;
          const inc = Math.random() * (config.increment.max - config.increment.min) + config.increment.min;
          const next = Math.min(prev.percent + inc, 99);
          return { percent: next, phaseText: getPhaseText(next) };
        });
      }, config.interval);
    };

    const stopFakeProgress = () => {
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
    };

    const buildDefaultCards = () => {
      const positions = spread === 'single'
        ? (lang === 'en' ? ['Current Situation'] : ['当前状况'])
        : spread === 'situation-action-outcome'
        ? (lang === 'en' ? ['Situation', 'Action', 'Outcome'] : ['现状', '行动', '结果'])
        : (lang === 'en'
          ? ['Past', 'Present', 'Future', 'Advice', 'Outcome']
          : ['过去', '现在', '未来', '建议', '结果']);
      // The Fool / upright is a safe, well-defined default. Better than a
      // placeholder string that the server can't look up.
      return positions.map((position) => ({
        name: 'The Fool',
        orientation: 'upright',
        position,
        suit: 'Major',
        number: 0,
      }));
    };

    const performReading = async () => {
      try {
        startFakeProgress();

        let cards;
        const drawResult = sessionStorage.getItem('drawResult');
        if (drawResult) {
          try {
            cards = JSON.parse(drawResult).cards;
          } catch {
            cards = buildDefaultCards();
          }
        } else {
          cards = buildDefaultCards();
        }

        let followUpContext: { previousQuestion?: string; previousSummary?: string } | undefined;
        if (isFollowUp) {
          try {
            const raw = sessionStorage.getItem('followUpContext');
            if (raw) followUpContext = JSON.parse(raw);
          } catch {
            /* ignore — best effort */
          }
        }

        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            question: question || t.defaultQuestion,
            spread: spread || 'single',
            tone: 'gentle',
            lang,
            seed: Math.floor(Math.random() * 1000000),
            cards,
            useNewFormat: true,
            ...(followUpContext ? { followUpContext } : {}),
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (cancelled) return;

        // Quota: only consume when the response was genuinely AI-generated.
        if (result.ai_generated === true) {
          consumeQuota();
        }

        stopFakeProgress();
        setProgress({ percent: 100, phaseText: t.phaseDone });

        const extendedResult = {
          ...result,
          _metadata: {
            question: question || t.defaultQuestion,
            spread: spread || 'single',
            timestamp: Date.now(),
          },
        };
        sessionStorage.setItem('readingResult', JSON.stringify(extendedResult));
        // Clear follow-up context after consuming it so a fresh reading
        // doesn't accidentally inherit prior summary.
        if (isFollowUp) {
          try { sessionStorage.removeItem('followUpContext'); } catch { /* ignore */ }
        }

        setTimeout(() => {
          if (cancelled) return;
          const params = new URLSearchParams({
            fromRitual: 'true',
            question: question || '',
            lang,
          });
          router.push(`/reading?${params.toString()}`);
        }, 500);
      } catch (error) {
        // Aborts (StrictMode unmount, user navigation) are expected — swallow.
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return;
        console.error('Reading failed:', error);
        stopFakeProgress();
        setProgress({ percent: 0, phaseText: t.phaseError });
        sessionStorage.setItem('readingResult', JSON.stringify({
          error: true,
          message: t.fallbackError,
        }));
        router.push(`/reading?error=true&lang=${lang}`);
      }
    };

    performReading();

    return () => {
      cancelled = true;
      stopFakeProgress();
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getScreenImage = (n: number) => `/screen${n}.svg`;

  if (limitReached) {
    const mins = minutesUntilReset();
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    const when = hours > 0
      ? (lang === 'en' ? `${hours}h ${remainMins}m` : `${hours} 小时 ${remainMins} 分钟`)
      : (lang === 'en' ? `${remainMins} minutes` : `${remainMins} 分钟`);

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
            <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-2xl text-white/80">
              ✦
            </div>
            <div className="space-y-2">
              <p className="text-white text-lg font-light tracking-wide">{t.limitTitle}</p>
              <p className="text-white/55 text-sm leading-relaxed">{t.limitBody(DAILY_LIMIT, when)}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-2 px-8 py-3 rounded-full border border-white/40 text-white/80 text-sm hover:bg-white/10 transition-colors"
            >
              {t.limitCta}
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`body { background: none !important; }`}</style>

      <div className="fixed inset-0 z-50 overflow-hidden">
        {[1, 2, 5].map((n) => (
          <motion.div
            key={n}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${getScreenImage(n)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            animate={{ opacity: currentScreen === n ? 1 : 0.3 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        ))}

        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
            animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

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
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center text-sm text-white/90">
                ✶
              </div>
              <p className="text-xs text-center text-white/80 px-4 leading-relaxed whitespace-pre-line">
                {t.cardCopy}
              </p>
            </div>
          </motion.div>

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
                animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-20 left-0 right-0 z-20 px-8">
          <div className="max-w-md mx-auto">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
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
