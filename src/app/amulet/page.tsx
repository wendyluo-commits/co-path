'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function AmuletPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-24 hero">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 flex items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <h1
          className="text-4xl text-white text-center tracking-tight"
          style={{
            fontFamily: "'Red Rose', serif",
            fontWeight: 400,
            letterSpacing: '-0.24px',
          }}
        >
          御守
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-8">
        {/* 空状态 - 没有激活的御守 */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="text-6xl">🛡️</div>
            <p className="text-gray-600 text-lg">暂无激活的御守</p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              去抽牌获得御守
            </button>
          </div>
        </div>

        {/* 历史御守入口 */}
        <div className="mt-8">
          <button
            onClick={() => {
              // TODO: 跳转到历史御守页面
              alert('历史御守功能即将上线');
            }}
            className="w-full p-4 bg-white rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <span className="text-gray-700">历史御守</span>
            <img
              src="/black_arrow.png"
              alt="arrow"
              className="h-4 w-4 transform rotate-180"
            />
          </button>
        </div>
      </div>

      {/* 底部导航栏 */}
      <BottomNav />
    </div>
  );
}

