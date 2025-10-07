import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Face } from './useCardPreview';

interface CardDetailOverlayProps {
  face: Face;
  onClose: () => void;
}

export function CardDetailOverlay({ face, onClose }: CardDetailOverlayProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/30"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center p-4 pt-safe pb-safe"
        >
          {/* 白底容器（移动端可滚动） */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] max-h-[92dvh] overflow-y-auto">
            {/* 顶栏 */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100 z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 text-gray-700 hover:text-gray-900 rounded-lg transition-colors"
                aria-label="返回"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="w-10" />
            </div>

            {/* 内容区域（无 3D 跟手） */}
            <div className="p-6 w-full">
              {/* 牌图 */}
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-[280px] rounded-lg shadow-2xl overflow-hidden">
                  <motion.img
                    layoutId={`card-${face.id}`}
                    src={face.imageUrl}
                    alt={face.name}
                    className="w-full h-auto rounded-lg"
                    style={{
                      width: 'clamp(220px, 62vw, 280px)',
                      rotate: face.orientation === 'reversed' ? 180 : 0,
                      transformOrigin: '50% 50%'
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              {/* 标题 */}
              <h1 className="text-lg font-semibold text-slate-900 text-center mb-2">
                {face.name}（{face.orientation === 'upright' ? '正位' : '逆位'}）
              </h1>

              {/* 副标题 */}
              <p className="text-xs text-slate-400 text-center mb-4 tracking-[0.08em]">
                TAROT.CARD
              </p>

              {/* 描述段落 */}
              <p className="text-[15px] text-gray-700 text-center leading-[1.8] mb-6 px-2">
                这张牌代表着内在的智慧与直觉，通过正位与逆位的不同展现，为我们揭示人生的不同面向与可能性。
              </p>

              {/* 分隔装饰 */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-2 h-2 rounded-full bg-pink-300"></div>
                <div className="mx-3 text-pink-300">✦</div>
                <div className="w-2 h-2 rounded-full bg-teal-300"></div>
              </div>

              {/* 要点列表 */}
              <div className="space-y-3">
                {face.orientation === 'upright' ? (
                  <>
                    <div className="flex items-start">
                      <span className="text-pink-300 mr-2">•</span>
                      <span className="text-gray-700 text-[15px] leading-[1.8]">
                        情感机会与内心成长，积极面对挑战
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-teal-300 mr-2">•</span>
                      <span className="text-gray-700 text-[15px] leading-[1.8]">
                        直觉敏锐，创造力丰富，适合新开始
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start">
                      <span className="text-pink-300 mr-2">•</span>
                      <span className="text-gray-700 text-[15px] leading-[1.8]">
                        情绪封闭，需要释放内心压力
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-teal-300 mr-2">•</span>
                      <span className="text-gray-700 text-[15px] leading-[1.8]">
                        直觉受阻，建议重新审视方向
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 关闭按钮 - 已移除 */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
