'use client';

import { SpreadCard, SpreadType } from './SpreadCard';

interface SpreadSelectorProps {
  selectedSpread: SpreadType | null;
  onSpreadSelect: (spreadType: SpreadType) => void;
}

export function SpreadSelector({ selectedSpread, onSpreadSelect }: SpreadSelectorProps) {
  const spreads = [
    {
      type: 'single' as SpreadType,
      title: '单张指引',
      subtitle: '快速答案',
      size: 'sm' as const
    },
    {
      type: 'dual' as SpreadType,
      title: '对照二选一',
      subtitle: '方案 A / 方案 B',
      size: 'md' as const
    },
    {
      type: 'triple' as SpreadType,
      title: '三张牌阵',
      subtitle: '过去 / 现在 / 未来',
      size: 'sm' as const
    }
  ];

  return (
    <div className="px-4 py-8">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
        选择牌阵
      </h2>
      
      <div className="flex justify-center items-end gap-3 max-w-lg mx-auto">
        {spreads.map((spread) => (
          <SpreadCard
            key={spread.type}
            title={spread.title}
            subtitle={spread.subtitle}
            spreadType={spread.type}
            selected={selectedSpread === spread.type}
            onSelect={onSpreadSelect}
            size={spread.size}
          />
        ))}
      </div>
    </div>
  );
}
