import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ShuffleAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  cardCount?: number;
}

export function ShuffleAnimation({ isVisible, onComplete, cardCount = 3 }: ShuffleAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState<'shuffle' | 'reveal' | 'complete'>('shuffle');

  useEffect(() => {
    if (!isVisible) return;

    // 洗牌阶段
    const shuffleTimer = setTimeout(() => {
      setCurrentPhase('reveal');
    }, 2000);

    // 揭示阶段
    const revealTimer = setTimeout(() => {
      setCurrentPhase('complete');
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(shuffleTimer);
      clearTimeout(revealTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      >
        <div className="relative w-full max-w-md h-64 flex items-center justify-center">
          {/* 洗牌动画 */}
          {currentPhase === 'shuffle' && (
            <div className="relative">
              {Array.from({ length: cardCount }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute w-16 h-24 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-lg border-2 border-amber-300"
                  style={{
                    left: `${index * 20}px`,
                    top: `${index * 5}px`,
                  }}
                  animate={{
                    x: [0, 50, -30, 20, 0],
                    y: [0, -20, 10, -5, 0],
                    rotate: [0, 15, -10, 5, 0],
                    scale: [1, 1.1, 0.9, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  {/* 卡牌背面图案 */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-amber-600 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 揭示动画 */}
          {currentPhase === 'reveal' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center"
            >
              <div className="w-20 h-32 bg-gradient-to-b from-purple-100 to-purple-200 rounded-lg shadow-xl border-2 border-purple-300 mx-auto mb-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-2xl">🔮</div>
                </div>
              </div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white text-lg font-medium"
              >
                正在揭示你的命运...
              </motion.p>
            </motion.div>
          )}

          {/* 完成动画 */}
          {currentPhase === 'complete' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="w-16 h-16 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <div className="text-2xl">✨</div>
              </motion.div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white text-lg font-medium"
              >
                洗牌完成！
              </motion.p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}