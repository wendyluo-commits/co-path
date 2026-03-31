'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReadingRequestSchema, SpreadType } from '@/schemas/reading.schema';
import { X, RefreshCw } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { questionCategories, uiTexts } from '@/data/questions';

function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const presetSpread = searchParams.get('spread') as SpreadType || 'single';
  const presetQuestion = searchParams.get('question') || '';

  const getDefaultCategoryId = (lang: 'zh' | 'en') => questionCategories[lang]?.[0]?.id ?? '';

  const [question, setQuestion] = useState(presetQuestion);

  // 解读页「重新抽牌」写入的预填问题（URL 无 question 时使用）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const pre = sessionStorage.getItem('prefillQuestion');
      if (!pre) return;
      if (!presetQuestion.trim()) {
        setQuestion(pre);
      }
      sessionStorage.removeItem('prefillQuestion');
    } catch {
      /* ignore */
    }
  }, [presetQuestion]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [activeCategory, setActiveCategory] = useState<string>(getDefaultCategoryId('zh'));

  // 禁止页面滑动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // 语言切换监听
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'zh' | 'en' || 'zh';
    setLanguage(savedLanguage);
    const defaultCategoryId = getDefaultCategoryId(savedLanguage);
    setActiveCategory(defaultCategoryId);
    setSuggestions(getCategorySuggestions(savedLanguage, defaultCategoryId));
    
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail.language;
      setLanguage(newLanguage);
      const defaultCategoryId = getDefaultCategoryId(newLanguage);
      setActiveCategory(defaultCategoryId);
      setSuggestions(getCategorySuggestions(newLanguage, defaultCategoryId));
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, []);

  const starSpeed = isFocused ? '4s' : '6s';
  const starOpacity = isFocused ? 0.9 : 0.6;

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getCategorySuggestions = (lang: 'zh' | 'en', categoryId: string, randomized = false) => {
    const category = questionCategories[lang]?.find((item) => item.id === categoryId);
    if (!category) return [];
    const source = randomized ? [...category.questions].sort(() => Math.random() - 0.5) : category.questions;
    return source.slice(0, 7);
  };

  const refreshSuggestions = () => {
    if (!activeCategory) return;
    setSuggestions(getCategorySuggestions(language, activeCategory, true));
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSuggestions(getCategorySuggestions(language, categoryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const formData = {
        question: question.trim(),
        spread: presetSpread,
        tone: 'gentle' as const,
        lang: language as 'zh' | 'en'
      };

      const validationResult = ReadingRequestSchema.safeParse({
        ...formData,
        seed: Math.floor(Math.random() * 1000000)
      });

      if (!validationResult.success) {
        setError('请检查输入内容');
        return;
      }

      const params = new URLSearchParams({
        question: formData.question,
        spread: formData.spread,
        autoshuffle: '1',
        lang: language,
      });
      router.push(`/canvas?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh text-white overflow-hidden" style={{ backgroundImage: 'url(/bg2.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', touchAction: 'none' }}>
      {/* Header */}
      <header className="pt-safe px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-lg transition-colors"
            aria-label="返回首页"
          >
            <img src="/white_arrow.png" alt="返回" className="h-6 w-6" />
          </button>
          <LanguageToggle />
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center overflow-hidden max-h-[calc(100vh-200px)]">
        {/* 第一部分：输入区域 - 完全独立 */}
        <div className="px-8">
          <form id="question-form" onSubmit={handleSubmit}>
            {/* 输入区：固定宽度，不受建议问题影响 */}
            <div className="mt-8 w-full">
              {/* 添加"我的疑问是"文字 */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white text-left">
                  {uiTexts[language].title}
                </h2>
              </div>
              <div className="relative w-full rounded-[16px] overflow-hidden bg-white/15" style={{ padding: '2px' }}>
                {/* star border gradients */}
                <div
                  className="pointer-events-none absolute rounded-[50%]"
                  style={{
                    width: '300%',
                    height: '50%',
                    bottom: '-11px',
                    right: '-250%',
                    opacity: starOpacity,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 6%)',
                    animation: `star-move-bottom ${starSpeed} linear infinite alternate`,
                    transition: 'opacity 300ms ease',
                    zIndex: 0,
                  }}
                />
                <div
                  className="pointer-events-none absolute rounded-[50%]"
                  style={{
                    width: '300%',
                    height: '50%',
                    top: '-11px',
                    left: '-250%',
                    opacity: starOpacity,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 6%)',
                    animation: `star-move-top ${starSpeed} linear infinite alternate`,
                    transition: 'opacity 300ms ease',
                    zIndex: 0,
                  }}
                />
                <div className="relative z-[1]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      if (error) setError(null);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={uiTexts[language].placeholder}
                    className="w-full bg-black rounded-[14px] border border-white/10 px-6 py-4 h-16 placeholder-gray-500 text-[16px] text-white focus:outline-none"
                    aria-invalid={error ? 'true' : 'false'}
                  />
                  {question && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestion('');
                        inputRef.current?.focus();
                      }}
                      className="absolute top-1/2 -translate-y-1/2 right-2 p-2 text-gray-400 hover:text-gray-600 rounded"
                      aria-label="清空输入"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
              )}
            </div>
          </form>
        </div>

         {/* 第二部分：分类切换 */}
         <div className="px-8 mt-10">
           <div className="flex gap-3 overflow-x-auto pb-2">
             {questionCategories[language]?.map((category) => {
               const isActive = category.id === activeCategory;
               return (
                 <button
                   key={category.id}
                   type="button"
                   onClick={() => handleCategoryChange(category.id)}
                   className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 border ${
                     isActive
                       ? 'bg-white text-black border-white'
                       : 'bg-white/10 text-white/70 border-white/30 hover:bg-white/20'
                   }`}
                   aria-pressed={isActive}
                 >
                   {category.label}
                 </button>
               );
             })}
           </div>
         </div>

         {/* 第三部分：建议问题列表 - 相对位置 */}
         <div className="px-8 mt-6 max-h-[220px] overflow-hidden">
            <div className="relative w-full">
              <ul className="space-y-2 pr-16 w-full">
                {suggestions.map((s, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => setQuestion(s)}
                      className="text-[14.5px] leading-[22px] text-white hover:underline text-left block w-full"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 刷新按钮 - 固定在最上面 */}
         <div className="fixed top-66 right-8 z-20">
           <button
             type="button"
             onClick={refreshSuggestions}
             className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-white/60"
             aria-label="刷新建议"
           >
             <RefreshCw className="h-[22px] w-[22px] text-white" />
           </button>
         </div>
      </div>

      {/* 固定底部 CTA 区域：对齐内容宽度 */}
      <div className="fixed left-0 right-0 bottom-0 pb-safe">
        <div className="px-9 pb-6">
          <button
            form="question-form"
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`w-full h-[56px] rounded-[8px] bg-black text-white text-[17px] font-medium border border-white transition active:opacity-90 disabled:opacity-40 disabled:text-white`}
          >
            {uiTexts[language].submit}
          </button>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() =>
                router.push(
                  '/canvas?spread=' +
                    encodeURIComponent(presetSpread) +
                    '&autoshuffle=1' +
                    '&lang=' + language
                )
              }
              className="text-[14px] text-white hover:text-gray-200 px-4 py-2"
              aria-label="跳过"
            >
              {uiTexts[language].skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}>
      <StartPageContent />
    </Suspense>
  );
}