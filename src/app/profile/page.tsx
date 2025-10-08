'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    days: 0,
    readings: 0,
    amulets: 0,
  });

  useEffect(() => {
    // 读取历史记录统计
    try {
      const history = localStorage.getItem('tarotHistory');
      if (history) {
        const records = JSON.parse(history);
        setStats({
          days: 1, // TODO: 计算实际使用天数
          readings: records.length,
          amulets: 0, // TODO: 计算实际御守数量
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

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
          我
        </h1>
      </div>

      {/* 个人信息卡片 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-semibold">塔罗探索者</h2>
              <p className="text-gray-500 text-sm">开启你的塔罗之旅</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.days}</div>
              <div className="text-xs text-gray-500 mt-1">使用天数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.readings}</div>
              <div className="text-xs text-gray-500 mt-1">读牌次数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.amulets}</div>
              <div className="text-xs text-gray-500 mt-1">获得御守</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能网格 */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          {/* 我的御守 */}
          <button
            onClick={() => router.push('/amulet')}
            className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl">🛡️</div>
            <span className="text-gray-700 font-medium">我的御守</span>
          </button>

          {/* 历史记录 */}
          <button
            onClick={() => router.push('/history')}
            className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl">📚</div>
            <span className="text-gray-700 font-medium">历史记录</span>
          </button>

          {/* 立即抽牌 */}
          <button
            onClick={() => router.push('/')}
            className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl">🎯</div>
            <span className="text-gray-700 font-medium">立即抽牌</span>
          </button>

          {/* 设置 */}
          <button
            onClick={() => router.push('/settings')}
            className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="text-4xl">⚙️</div>
            <span className="text-gray-700 font-medium">设置</span>
          </button>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => alert('小组件功能即将上线')}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center space-x-2 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📱</span>
            <span className="text-gray-700 text-sm">设为小组件</span>
          </button>

          <button
            onClick={() => alert('帮助中心即将上线')}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-center space-x-2 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">❓</span>
            <span className="text-gray-700 text-sm">帮助中心</span>
          </button>
        </div>
      </div>

      {/* 底部导航栏 */}
      <BottomNav />
    </div>
  );
}

