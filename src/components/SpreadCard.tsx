'use client';

import { TarotCardBack } from './TarotCardBack';

export type SpreadSize = 'sm' | 'md';
export type SpreadType = 'single' | 'dual' | 'triple';

interface SpreadCardProps {
  title: string;
  subtitle: string;
  spreadType: SpreadType;
  selected: boolean;
  onSelect: (spreadType: SpreadType) => void;
  size: SpreadSize;
}

export function SpreadCard({ 
  title, 
  subtitle, 
  spreadType, 
  selected, 
  onSelect, 
  size 
}: SpreadCardProps) {
  const dimensions = size === 'md' 
    ? { width: 160, height: 220 } 
    : { width: 120, height: 200 };
  
  const cardBackHeight = Math.floor(dimensions.width * 1.6); // 5:8 比例
  
  return (
    <div 
      className={`
        flex flex-col items-center p-4 rounded-2xl transition-all duration-200
        ${selected 
          ? 'border-2 border-amber-600 bg-amber-50' 
          : 'border border-gray-200 bg-white hover:shadow-lg hover:scale-102'
        }
        cursor-pointer
      `}
      style={{ width: `${dimensions.width}pt` }}
      onClick={() => onSelect(spreadType)}
      role="button"
      aria-label={`选择牌阵：${title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(spreadType);
        }
      }}
    >
      {/* 牌背预览 */}
      <div className="mb-4">
        <TarotCardBack
          width={dimensions.width * 0.6}
          height={cardBackHeight * 0.6}
          ariaLabel={`${title}牌阵预览`}
        />
      </div>
      
      {/* 标题 */}
      <h3 className="text-sm font-semibold text-gray-900 mb-1 text-center">
        {title}
      </h3>
      
      {/* 副标题 */}
      <p className="text-xs text-gray-600 mb-4 text-center">
        {subtitle}
      </p>
      
      {/* 选择按钮 */}
      <button
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${selected 
            ? 'bg-amber-600 text-white shadow-md' 
            : 'border border-amber-600 text-amber-600 hover:bg-amber-50'
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(spreadType);
        }}
      >
        选择
      </button>
    </div>
  );
}
