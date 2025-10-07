'use client';

import { useState } from 'react';
import { TarotCard as TarotCardType } from '@/schemas/reading.schema';
import { getTarotCardImage } from '@/lib/tarot-images';
import Image from 'next/image';

interface FlipCardProps {
  card: TarotCardType;
  index: number;
  size?: 'default' | 'ritual'; // 新增尺寸选项
}

export function FlipCard({ card, index, size = 'default' }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`relative perspective-1000 ${size === 'ritual' ? 'w-full h-full' : 'w-80 h-120'}`}>
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* 卡片正面 - 塔罗牌背面 */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer" onClick={handleFlip}>
            <div className="relative w-full h-full">
              <Image
                src="/images/tarot-cards/cardback.png"
                alt="塔罗牌背面"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* 点击提示 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-600">点击翻开</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片背面 - 详细信息 */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-xl p-8 overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-gray-800 truncate">{card.name}</h3>
              <button
                onClick={handleFlip}
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 状态标签 */}
            <div className="flex flex-wrap gap-3 mb-5">
              <span className={`px-5 py-2 rounded-full text-lg font-medium ${
                card.orientation === 'upright' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {card.orientation === 'upright' ? '正位' : '逆位'}
              </span>
              {card.position && (
                <span className="px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-lg">
                  {card.position}
                </span>
              )}
            </div>

            {/* 关键词 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">关键词</h4>
              <div className="flex flex-wrap gap-3">
                {card.keywords.slice(0, 6).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-5 py-2 bg-purple-100 text-purple-700 text-lg rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* 牌意解释 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-4"></div>
                牌意解释
              </h4>
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-gray-700 text-lg leading-relaxed line-clamp-7">
                  {card.interpretation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
