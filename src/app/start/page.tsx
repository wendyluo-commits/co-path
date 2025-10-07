'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReadingRequestSchema, SpreadType } from '@/schemas/reading.schema';
import { X, RefreshCw } from 'lucide-react';

function StartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const presetSpread = searchParams.get('spread') as SpreadType || 'single';
  const presetQuestion = searchParams.get('question') || '';
  
  // 调试信息
  console.log('Start page - presetSpread:', presetSpread);
  console.log('Start page - searchParams:', Object.fromEntries(searchParams.entries()));

  const [question, setQuestion] = useState(presetQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

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

  const glowStyle = {
    boxShadow: isFocused
      ? '0 0 0 2px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)'
      : '0 0 0 1px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2), 0 0 30px rgba(59, 130, 246, 0.15)'
  };

  const baseSuggestionPool = [
    // 职业方向探索（4个）
    "我当下的事业主线应该是什么？",
    "我的经历正把我推向哪条事业路径？",
    "我目前最大的职业瓶颈是什么？",
    "什么因素能助我更顺利地找到理想工作？",
    
    
    // 情感与成长（4个）
    "现在是什么正在消耗我的力量？",
    "我怎样才能更勇敢地面对未知与变化？",
    "我内心最深的焦虑是什么？",
    "我如何在职业发展中保持平衡？",
  ];
  const [suggestions, setSuggestions] = useState<string[]>(baseSuggestionPool.slice(0, 7));

  const refreshSuggestions = () => {
    // Simple shuffle and take 7
    const pool = [...baseSuggestionPool].sort(() => Math.random() - 0.5).slice(0, 7);
    setSuggestions(pool);
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
        lang: 'zh' as const
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
        spread: formData.spread
      });
      router.push(`/ritual?${params.toString()}`);
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
          <div className="w-10" />
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
                <h2 className="text-2xl font-semibold text-white text-left">我的疑问是</h2>
              </div>
              <div className="relative w-full">
                {/* glow */}
                <div className="pointer-events-none absolute inset-0 rounded-[8px]" style={{ ...glowStyle, transition: 'box-shadow 180ms ease' }} />
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
                  placeholder=""
                  className="relative w-full bg-white rounded-[8px] border-2 border-blue-300 px-6 py-4 h-16 placeholder-gray-400 text-[16px] text-black focus:outline-none focus:ring-2 focus:ring-blue-300/20"
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
              {error && (
                <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
              )}
            </div>
          </form>
        </div>

         {/* 第二部分：建议问题列表 - 相对位置 */}
         <div className="px-8 mt-12 max-h-[200px] overflow-hidden">
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
            className={`w-full h-[56px] rounded-[8px] bg-black text-white text-[15.5px] font-medium border border-white transition active:opacity-90 disabled:opacity-40 disabled:text-white`}
          >
            选好了
          </button>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => router.push('/ritual?spread=' + encodeURIComponent(presetSpread))}
              className="text-[14px] text-white hover:text-gray-200 px-4 py-2"
              aria-label="跳过"
            >
              跳过
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