'use client';

import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  
  // 从localStorage读取保存的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'zh' | 'en' || 'zh';
    setLanguage(savedLanguage);
  }, []);
  
  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // 触发自定义事件，通知其他组件语言已切换
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }));
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-xs font-medium transition-colors duration-200 ${
        language === 'zh' ? 'text-white' : 'text-white/50'
      }`}>
        中
      </span>
      <button
        onClick={toggleLanguage}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 ${
          language === 'en' ? 'bg-blue-500' : 'bg-gray-400'
        }`}
        aria-label={`Switch to ${language === 'zh' ? 'English' : 'Chinese'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
          language === 'en' ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
      <span className={`text-xs font-medium transition-colors duration-200 ${
        language === 'en' ? 'text-white' : 'text-white/50'
      }`}>
        EN
      </span>
    </div>
  );
}
