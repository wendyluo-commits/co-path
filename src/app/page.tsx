'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EmblaCarousel from '@/components/EmblaCarousel';
import BottomNav from '@/components/BottomNav';

const spreads = [
  { 
    key: "single", 
    title: "YES or NO", 
    sub: "简单决策", 
    img: "/card_spread_1.png" 
  },
  { 
    key: "situation-action-outcome", 
    title: "现状行动结果", 
    sub: "过-现-未", 
    img: "/card_spread_3.png" 
  },
  { 
    key: "five-card", 
    title: "五张牌阵", 
    sub: "深度解读", 
    img: "/card_spread_5.png" 
  },
];

export default function DailyTarotEntry() {
  const [spreadType, setSpreadType] = useState<string | null>(null);
  const router = useRouter();

  const handleSpreadSelect = (key: string, index: number) => {
    // 滑到的牌阵即选中
    setSpreadType(key);
  };

  const goToStartWithSpread = (spreadKey: string) => {
    const seed = Math.floor(Math.random() * 1000000);
    const params = new URLSearchParams({
      spread: spreadKey,
      seed: seed.toString(),
      fromDaily: 'true'
    });
    router.push(`/start?${params.toString()}`);
  };

  // Embla Carousel 配置
  const emblaOptions = { 
    align: 'center',
    slidesToScroll: 1,          // 一次滚 1 张
    containScroll: 'keepSnaps', // 不裁剪/合并 snap
    skipSnaps: false,
    loop: true                  // 无限循环
  };



  return (
    <div className="h-dvh relative text-gray-900 overflow-hidden hero">
      {/* 主容器（移动端优先） */}
      <div className="relative w-full max-w-[1440px] mx-auto min-h-dvh flex flex-col px-4 md:px-6 pb-24">
        
        {/* Header: 顶部信息区 */}
        <header className="pt-safe pb-24 md:pb-28" style={{ paddingTop: '62px', paddingLeft: '12px', paddingRight: '8px' }}>
          <div className="flex items-center justify-between">
            {/* Co-Path标题和日期 */}
            <div className="block">
              <h1 
                className="text-black" 
                style={{ 
                  fontFamily: 'Red Rose', 
                  fontWeight: 'regular', 
                  fontSize: '36px' 
                }}
              >
                Co-Path
              </h1>
              <button
                onClick={() => router.push('/calendar')}
                className="text-black text-sm font-normal mt-1 hover:opacity-70 transition-opacity duration-200 block"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </button>
            </div>
            
            {/* 历史记录按钮 - 两张重叠的卡牌图标 */}
            <button
              onClick={() => router.push('/history')}
              className="relative w-20 h-16 hover:opacity-70 transition-opacity duration-200"
              aria-label="查看历史记录"
            >
              <img 
                src="/history.png" 
                alt="History" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // 如果图片不存在，使用SVG作为fallback
                  target.style.display = 'none';
                  const svg = target.nextElementSibling as SVGElement;
                  if (svg) svg.style.display = 'block';
                }}
              />
              <svg
                className="w-8 h-8 text-black hidden"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          </div>
        </header>


        {/* SpreadGrid: 中部牌阵选择区（居中轮播3张卡） */}
        <section className="py-4 md:py-6 h-[46vh] md:h-[52vh] lg:h-[560px]" style={{ marginTop: '20px' }}>
          <div className="-mx-4 md:-mx-6">
            <EmblaCarousel 
              slides={spreads}
              options={emblaOptions}
              onSlideSelect={handleSpreadSelect}
              onSlideClick={(key) => goToStartWithSpread(key)}
              selectedSpread={spreadType}
            />
          </div>
        </section>

      </div>

      {/* 底部导航栏 */}
      <BottomNav />
    </div>
  );
}
