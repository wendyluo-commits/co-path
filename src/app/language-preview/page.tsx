'use client';

import LanguageToggle from '@/components/LanguageToggle';

export default function LanguagePreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          语言切换按钮设计预览
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 卡片1: 简洁文字按钮 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">设计1: 简洁文字按钮</h3>
            <p className="text-white/70 text-sm mb-4">适合：现代简约风格</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <button className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30">
                EN
              </button>
            </div>
          </div>
          
          {/* 卡片2: 国旗图标按钮 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">设计2: 国旗图标按钮</h3>
            <p className="text-white/70 text-sm mb-4">适合：国际化应用</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30 flex items-center justify-center text-lg">
                🇺🇸
              </button>
            </div>
          </div>
          
          {/* 卡片3: 切换开关样式 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">设计3: 切换开关样式</h3>
            <p className="text-white/70 text-sm mb-4">适合：设置页面</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-white/50">中</span>
                <button className="relative w-12 h-6 rounded-full bg-gray-400 transition-all duration-300">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 translate-x-0" />
                </button>
                <span className="text-xs text-white">EN</span>
              </div>
            </div>
          </div>
          
          {/* 卡片4: 下拉选择器样式 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">设计4: 下拉选择器样式</h3>
            <p className="text-white/70 text-sm mb-4">适合：专业应用</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30">
                <span>🇺🇸</span>
                <span>English</span>
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 卡片5: 极简风格 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">设计5: 极简风格</h3>
            <p className="text-white/70 text-sm mb-4">适合：简洁界面</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <button className="px-2 py-1 text-white/80 hover:text-white text-sm font-light hover:bg-white/10 rounded transition-all duration-200">
                EN
              </button>
            </div>
          </div>
          
          {/* 卡片6: 实际组件预览 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">实际组件预览</h3>
            <p className="text-white/70 text-sm mb-4">点击按钮体验实际效果</p>
            <div className="flex items-center justify-center h-20 bg-black/20 rounded-lg">
              <LanguageToggle />
            </div>
          </div>
        </div>
        
        {/* 使用建议 */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">💡 使用建议</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
            <div>
              <h4 className="font-medium text-white mb-2">推荐位置：</h4>
              <ul className="space-y-1">
                <li>• 顶部导航栏右上角</li>
                <li>• 设置页面</li>
                <li>• 底部导航栏（作为第四个选项）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">设计选择：</h4>
              <ul className="space-y-1">
                <li>• 简洁文字：适合大多数场景</li>
                <li>• 国旗图标：国际化应用</li>
                <li>• 切换开关：设置页面</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
