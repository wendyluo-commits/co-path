import { motion, AnimatePresence } from 'framer-motion';
import { Face } from './useCardPreview';
import { getCardKnowledge } from '@/lib/tarot-knowledge';

interface CardDetailOverlayProps {
  face: Face;
  onClose: () => void;
}

export function CardDetailOverlay({ face, onClose }: CardDetailOverlayProps) {
  const knowledge = getCardKnowledge(face.name);
  const isUpright = face.orientation === 'upright';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const keywords = knowledge
    ? (isUpright ? knowledge.upright_keywords : knowledge.reversed_keywords)
    : [];
  const meaning = knowledge
    ? (isUpright ? knowledge.upright_meaning : knowledge.reversed_meaning)
    : null;
  const insight = knowledge
    ? (isUpright ? knowledge.light_shadow.light : knowledge.light_shadow.shadow)
    : null;

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
            <div className="sticky top-0 bg-white flex items-center justify-end p-6 border-b border-gray-100 z-10">
              <button
                onClick={onClose}
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="关闭"
              >
                <img 
                  src="/close.png" 
                  alt="Close" 
                  className="h-6 w-6"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
                    }
                  }}
                />
              </button>
            </div>

            {/* 内容区域 */}
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
              <h1 className="text-lg font-semibold text-slate-900 text-center mb-1">
                {knowledge ? knowledge.card_name_zh : face.name}（{isUpright ? '正位' : '逆位'}）
              </h1>

              {/* 副标题：英文名 + 一句话总结 */}
              <p className="text-xs text-slate-400 text-center mb-1 tracking-[0.08em]">
                {knowledge ? knowledge.card_name_en : face.name}
              </p>
              {knowledge && (
                <p className="text-sm text-slate-500 text-center mb-4 italic">
                  {knowledge.one_sentence_summary}
                </p>
              )}

              {/* 核心主题 */}
              <p className="text-[15px] text-gray-700 text-center leading-[1.8] mb-6 px-2">
                {knowledge ? knowledge.core_theme : '这张牌代表着内在的智慧与直觉，通过正位与逆位的不同展现，为我们揭示人生的不同面向与可能性。'}
              </p>

              {/* 关键词标签 */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUpright
                          ? 'bg-pink-50 text-pink-500 border border-pink-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* 分隔装饰 */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-2 h-2 rounded-full bg-pink-300"></div>
                <div className="mx-3 text-pink-300">✦</div>
                <div className="w-2 h-2 rounded-full bg-teal-300"></div>
              </div>

              {/* 牌义详解 */}
              {meaning ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-600 tracking-wide">
                    {isUpright ? '正位牌义' : '逆位牌义'}
                  </h2>
                  <p className="text-[15px] text-gray-700 leading-[1.8]">
                    {meaning}
                  </p>

                  {/* 光明面 / 阴影面 */}
                  {insight && (
                    <div className={`mt-4 p-4 rounded-xl ${
                      isUpright ? 'bg-amber-50/60' : 'bg-slate-50'
                    }`}>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        {isUpright ? '✦ 光明面' : '✦ 阴影面'}
                      </p>
                      <p className="text-[14px] text-gray-600 leading-[1.7]">
                        {insight}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-pink-300 mr-2">•</span>
                    <span className="text-gray-700 text-[15px] leading-[1.8]">
                      {isUpright ? '情感机会与内心成长，积极面对挑战' : '情绪封闭，需要释放内心压力'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-teal-300 mr-2">•</span>
                    <span className="text-gray-700 text-[15px] leading-[1.8]">
                      {isUpright ? '直觉敏锐，创造力丰富，适合新开始' : '直觉受阻，建议重新审视方向'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 关闭按钮 - 已移除 */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
