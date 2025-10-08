'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 flex items-center p-6 bg-gradient-to-b from-gray-900 to-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2"
          aria-label="返回"
        >
          <img
            src="/white_arrow.png"
            alt="back"
            className="h-6 w-6"
          />
        </button>
        <h1
          className="flex-1 text-4xl text-white text-center tracking-tight pr-10"
          style={{
            fontFamily: "'Red Rose', serif",
            fontWeight: 400,
            letterSpacing: '-0.24px',
          }}
        >
          设置
        </h1>
      </div>

      {/* 设置内容 */}
      <div className="px-4 py-6 space-y-4">
        {/* 通知设置 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">通知提醒</h3>
              <p className="text-sm text-gray-500 mt-1">每日抽牌提醒</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 主题设置 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-medium text-gray-900 mb-3">主题设置</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 transition-colors ${
                theme === 'light'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-2xl mb-2">☀️</div>
              <div className="text-sm font-medium">浅色模式</div>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-2xl mb-2">🌙</div>
              <div className="text-sm font-medium">深色模式</div>
            </button>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="font-medium text-gray-900">数据管理</h3>
          
          <button
            onClick={() => {
              if (confirm('确定要清除所有缓存吗？')) {
                alert('清除缓存功能即将上线');
              }
            }}
            className="w-full p-3 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">清除缓存</span>
              <img
                src="/black_arrow.png"
                alt="arrow"
                className="h-4 w-4 transform rotate-180"
              />
            </div>
          </button>

          <button
            onClick={() => alert('导出数据功能即将上线')}
            className="w-full p-3 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">导出数据</span>
              <img
                src="/black_arrow.png"
                alt="arrow"
                className="h-4 w-4 transform rotate-180"
              />
            </div>
          </button>
        </div>

        {/* 关于应用 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="font-medium text-gray-900">关于应用</h3>
          
          <button
            onClick={() => router.push('/privacy')}
            className="w-full p-3 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">隐私政策</span>
              <img
                src="/black_arrow.png"
                alt="arrow"
                className="h-4 w-4 transform rotate-180"
              />
            </div>
          </button>

          <button
            onClick={() => router.push('/terms')}
            className="w-full p-3 rounded-xl bg-gray-50 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">服务条款</span>
              <img
                src="/black_arrow.png"
                alt="arrow"
                className="h-4 w-4 transform rotate-180"
              />
            </div>
          </button>

          <div className="pt-3 border-t border-gray-100">
            <div className="text-center text-sm text-gray-500">
              版本 1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

