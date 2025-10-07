'use client';

import { TarotCardBack } from './TarotCardBack';

interface DrawAreaProps {
  enabled: boolean;
  onPick: (index: number) => void;
}

export function DrawArea({ enabled, onPick }: DrawAreaProps) {
  const handleCardClick = (index: number) => {
    if (!enabled) {
      alert('请先选择牌阵');
      return;
    }
    onPick(index);
  };

  return (
    <div className="px-4 py-8 safe-area-bottom">
      {/* 说明文字 */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 mb-1">
          点击任意卡牌进入解读
        </p>
        <p className="text-xs text-gray-400">
          支持点击跳读
        </p>
      </div>
      
      {/* 三张牌扇形布局 */}
      <div className="relative flex justify-center items-end h-48">
        {/* 左卡 */}
        <div 
          className="absolute z-10"
          style={{ 
            transform: 'rotate(-18deg) translateX(-40pt)',
            transformOrigin: 'bottom center'
          }}
        >
          <TarotCardBack
            width={120}
            height={192}
            onClick={() => handleCardClick(0)}
            disabled={!enabled}
            ariaLabel="抽牌 第 1 张"
            className="shadow-lg"
          />
        </div>
        
        {/* 中卡（最上层） */}
        <div className="relative z-30">
          <TarotCardBack
            width={120}
            height={192}
            onClick={() => handleCardClick(1)}
            disabled={!enabled}
            ariaLabel="抽牌 第 2 张"
            className="shadow-xl"
          />
        </div>
        
        {/* 右卡 */}
        <div 
          className="absolute z-10"
          style={{ 
            transform: 'rotate(18deg) translateX(40pt)',
            transformOrigin: 'bottom center'
          }}
        >
          <TarotCardBack
            width={120}
            height={192}
            onClick={() => handleCardClick(2)}
            disabled={!enabled}
            ariaLabel="抽牌 第 3 张"
            className="shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
