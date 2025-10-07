'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { History } from 'lucide-react';

const spreads = [
  { 
    key: "single", 
    title: "单张指引", 
    sub: "快速答案", 
    img: "/images/tarot-cards/cardback.png" 
  },
  { 
    key: "three_card", 
    title: "对照二选一", 
    sub: "方案A / 方案B", 
    img: "/images/tarot-cards/cardback.png" 
  },
  { 
    key: "three_card", 
    title: "三张牌阵", 
    sub: "过去 / 现在 / 未来", 
    img: "/images/tarot-cards/cardback.png" 
  },
] as const;

export default function DailyTarot() {
  const [spreadType, setSpreadType] = useState<string | null>(null);
  const router = useRouter();

  const handleSpreadSelect = (key: string) => {
    setSpreadType(key);
  };

  const handleCardPick = (index: number) => {
    if (!spreadType) {
      alert("请先选择牌阵");
      return;
    }

    // 生成随机种子
    const seed = Math.floor(Math.random() * 1000000);
    
    // 跳转到解读页面
    const params = new URLSearchParams({
      spread: spreadType,
      chosenIndex: index.toString(),
      seed: seed.toString(),
      fromDaily: 'true'
    });
    
    router.push(`/reading?${params.toString()}`);
  };

  const handleHistoryClick = () => {
    // 暂时跳转到首页
    router.push('/');
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen px-2">
      {/* 顶部 */}
      <div className="pt-safe pb-4 px-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">每日塔罗</h1>
            <p className="text-sm text-slate-400 mt-1">今天想用哪种牌阵？</p>
          </div>
          <button
            onClick={handleHistoryClick}
            className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
            aria-label="历史记录"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 牌阵滑动区 */}
      <div className="mt-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-3 px-1 pb-2">
          {spreads.map((spread, index) => (
            <button
              key={spread.key}
              onClick={() => handleSpreadSelect(spread.key)}
              className={`
                snap-center shrink-0 relative overflow-hidden
                bg-slate-800 rounded-2xl transition-all duration-200
                shadow-[0_12px_32px_rgba(0,0,0,0.35)]
                active:scale-[0.98]
                ${spreadType === spread.key 
                  ? "ring-2 ring-amber-600 scale-102" 
                  : "ring-1 ring-white/5"
                }
              `}
              style={{
                width: '92vw',
                height: 'calc(92vw * 1.33)',
                maxWidth: '360px',
                maxHeight: '480px'
              }}
              aria-label={`选择牌阵：${spread.title}`}
            >
              {/* 牌背预览 */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="relative w-full h-2/3">
                  <Image
                    src={spread.img}
                    alt={`${spread.title}牌阵预览`}
                    fill
                    className="object-cover opacity-95"
                    sizes="92vw"
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-800" />
                </div>
              </div>
              
              {/* 底部信息 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-800 to-transparent">
                <div className="text-base font-semibold text-slate-100">
                  {spread.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {spread.sub}
                </div>
                {/* 进度指示器 */}
                <div 
                  className={`
                    mt-3 h-[3px] w-6 rounded-full transition-colors
                    ${spreadType === spread.key ? "bg-amber-600" : "bg-white/10"}
                  `} 
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 抽牌区 */}
      <div className="mt-8 mb-safe flex flex-col items-center px-4">
        <p className="text-sm text-slate-400 text-center mb-6">
          点击任意卡牌进入解读
        </p>

        <div className="relative h-[210px] w-full flex items-end justify-center">
          {[-16, 0, 16].map((rotation, index) => (
            <button
              key={index}
              onClick={() => handleCardPick(index)}
              disabled={!spreadType}
              className={`
                absolute bottom-0 w-[120px] h-[192px] rounded-xl overflow-hidden
                shadow-[0_6px_16px_rgba(0,0,0,0.35)]
                transition-all duration-150
                ${index === 1 ? "z-30" : "z-20"}
                ${!spreadType 
                  ? "opacity-60 cursor-not-allowed" 
                  : "hover:-translate-y-1 active:-translate-y-1 cursor-pointer"
                }
              `}
              style={{
                transform: `translateX(${index === 0 ? -20 : index === 2 ? 20 : 0}px) rotate(${rotation}deg)`,
              }}
              aria-label={`抽牌 第 ${index + 1} 张`}
            >
              <Image
                src="/images/tarot-cards/cardback.png"
                alt="塔罗牌背面"
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
