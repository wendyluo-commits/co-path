'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function AmuletPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(21 * 60 + 18); // 21:18 剩余时间（秒）

  // 模拟倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 模拟当前激活的御守数据
  const currentAmulet = {
    name: "心灵之杯",
    type: "charm_cup",
    description: "情感与连结的守护",
    quote: "爱是灵魂的食粮",
    greekQuote: "εὐδαιμονία ἐστὶν ἐνέργεια ψυχῆς"
  };

  return (
    <div className="min-h-screen pb-24" style={{
      backgroundImage: 'url(/bg_charm.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between p-6 pt-safe" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        {/* 左侧：御守守护时间 */}
        <div className="flex flex-col">
          <span className="text-black text-sm mb-1">御守守护时间还有</span>
          <span 
            className="text-black font-bold"
            style={{
              fontFamily: "'Red Rose', serif",
              fontSize: '36px',
              fontWeight: 400,
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* 右侧：历史御守入口 */}
        <button
          onClick={() => router.push('/charm-history')}
          className="p-2 hover:opacity-70 transition-opacity"
        >
          <img
            src="/charm_history.png"
            alt="历史御守"
            className="h-12 w-12 object-contain"
          />
        </button>
      </div>

      {/* 中部：激活的御守牌 */}
      <main className="flex flex-col items-center justify-start flex-1 px-6 text-black pt-16">
        {/* 御守牌 */}
        <div className="relative mb-8">
          {/* 御守图标 */}
          <div className="flex items-center justify-center">
            <img
              src={`/${currentAmulet.type}.png`}
              alt={currentAmulet.name}
              className="w-[384px] h-[384px] object-contain"
            />
          </div>
        </div>

        {/* 御守信息文字 */}
        <div className="text-center max-w-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              {`{${currentAmulet.name}}`}
            </h2>
            <p className="text-lg text-black mb-3">
              {currentAmulet.description}
            </p>
            <p className="text-base text-black mb-3 italic">
              {currentAmulet.quote}
            </p>
            <p className="text-sm text-black font-mono">
              {currentAmulet.greekQuote}
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}