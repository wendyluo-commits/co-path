'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { LiveAnnouncer } from './LiveAnnouncer';

interface DeckGridProps {
  totalCards: number;
  maxSelection: number;
  onSelectionChange: (selectedPositions: number[]) => void;
  isShuffling?: boolean;
  disabled?: boolean;
}

interface CardState {
  position: number;
  isSelected: boolean;
  selectionOrder: number;
}

/**
 * DeckGrid - 支持键盘导航和无障碍访问的牌组网格
 * 遵循 ARIA Grid 模式和 APG 最佳实践
 */
export function DeckGrid({ 
  totalCards, 
  maxSelection, 
  onSelectionChange,
  isShuffling = false,
  disabled = false
}: DeckGridProps) {
  const [cards, setCards] = useState<CardState[]>(() => 
    Array.from({ length: totalCards }, (_, i) => ({
      position: i,
      isSelected: false,
      selectionOrder: -1
    }))
  );
  
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announceMessage, setAnnounceMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const toggleCardRef = useRef<((position: number) => void) | null>(null);

  // 计算网格布局
  const cols = Math.ceil(Math.sqrt(totalCards));
  const rows = Math.ceil(totalCards / cols);

  // 获取选中的牌位（使用 useMemo 避免不必要的重新计算）
  const selectedPositions = useMemo(() => 
    cards
      .filter(card => card.isSelected)
      .sort((a, b) => a.selectionOrder - b.selectionOrder)
      .map(card => card.position),
    [cards]
  );

  // 选择/取消选择牌
  const toggleCard = useCallback((position: number) => {
    if (disabled || isShuffling) return;

    setCards(prevCards => {
      const newCards = prevCards.map(card => ({ ...card })); // 深拷贝每个卡片对象
      const card = newCards[position];
      
      if (card.isSelected) {
        // 取消选择
        card.isSelected = false;
        const oldOrder = card.selectionOrder;
        card.selectionOrder = -1;
        
        // 更新其他牌的选择顺序
        newCards.forEach(c => {
          if (c.selectionOrder > oldOrder) {
            c.selectionOrder--;
          }
        });
        
        const newSelectedCount = newCards.filter(c => c.isSelected).length;
        setAnnounceMessage(`已取消选择第 ${position + 1} 张牌。当前已选择 ${newSelectedCount} 张，还需 ${maxSelection - newSelectedCount} 张。`);
      } else {
        // 检查是否已达到最大选择数
        const currentSelected = newCards.filter(c => c.isSelected).length;
        if (currentSelected >= maxSelection) {
          setAnnounceMessage(`最多只能选择 ${maxSelection} 张牌。请先取消其他选择。`);
          return prevCards;
        }
        
        // 选择牌
        card.isSelected = true;
        card.selectionOrder = currentSelected;
        
        setAnnounceMessage(`已选择第 ${position + 1} 张牌。当前已选择 ${currentSelected + 1} 张，还需 ${maxSelection - (currentSelected + 1)} 张。`);
      }
      
      return newCards;
    });
  }, [disabled, isShuffling, maxSelection]);

  // 更新 ref
  toggleCardRef.current = toggleCard;

  // 键盘导航
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || isShuffling) return;

    let newFocusIndex = focusedIndex;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newFocusIndex = Math.min(focusedIndex + 1, totalCards - 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newFocusIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newFocusIndex = Math.min(focusedIndex + cols, totalCards - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newFocusIndex = Math.max(focusedIndex - cols, 0);
        break;
      case 'Home':
        event.preventDefault();
        newFocusIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newFocusIndex = totalCards - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleCardRef.current?.(focusedIndex);
        return;
      default:
        return;
    }
    
    setFocusedIndex(newFocusIndex);
  }, [focusedIndex, totalCards, cols, disabled, isShuffling]);

  // 更新焦点
  useEffect(() => {
    const focusedCard = cardRefs.current[focusedIndex];
    if (focusedCard) {
      focusedCard.focus();
    }
  }, [focusedIndex]);

  // 使用 ref 来跟踪之前的选择状态
  const prevSelectedPositionsRef = useRef<number[]>([]);
  
  // 通知父组件选择变化（只在实际变化时）
  useEffect(() => {
    const prev = prevSelectedPositionsRef.current;
    if (selectedPositions.length !== prev.length || 
        !selectedPositions.every((pos, index) => pos === prev[index])) {
      onSelectionChange(selectedPositions);
      prevSelectedPositionsRef.current = [...selectedPositions];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPositions]); // 故意移除 onSelectionChange 依赖，避免无限重渲染

  // 洗牌动画效果
  const getCardStyle = (index: number) => {
    if (!isShuffling) return {};
    
    // 简单的洗牌动画 - 随机位移
    const angle = (index * 137.5) % 360; // 黄金角度
    const radius = 20 + (index % 3) * 10;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px) rotate(${angle / 10}deg)`,
      transition: 'transform 0.5s ease-in-out'
    };
  };

  return (
    <div className="w-full">
      <LiveAnnouncer message={announceMessage} />
      
      {/* 网格说明 */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          使用鼠标点击或键盘方向键选择 {maxSelection} 张牌
        </p>
        <p className="text-xs text-gray-500">
          键盘操作：方向键移动，回车或空格选择，Home/End 快速跳转
        </p>
      </div>

      {/* 选择状态 */}
      <div className="mb-4 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
          已选择 {selectedPositions.length} / {maxSelection} 张牌
        </span>
      </div>

      {/* 牌组网格 */}
      <div
        ref={gridRef}
        role="grid"
        aria-label={`塔罗牌牌组，共 ${totalCards} 张牌，请选择 ${maxSelection} 张`}
        aria-rowcount={rows}
        aria-colcount={cols}
        className="grid gap-2 max-w-6xl mx-auto p-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
        onKeyDown={handleKeyDown}
      >
        {cards.map((card, index) => (
          <button
            key={card.position}
            ref={el => { cardRefs.current[index] = el; }}
            role="gridcell"
            aria-rowindex={Math.floor(index / cols) + 1}
            aria-colindex={(index % cols) + 1}
            aria-selected={card.isSelected}
            aria-label={`第 ${card.position + 1} 张牌${card.isSelected ? `，已选择，选择顺序第 ${card.selectionOrder + 1}` : '，未选择'}`}
            tabIndex={index === focusedIndex ? 0 : -1}
            disabled={disabled || isShuffling}
            onClick={() => toggleCard(card.position)}
            className={`
              relative aspect-[2/3] rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 overflow-hidden
              ${card.isSelected 
                ? 'border-purple-500 shadow-lg scale-105' 
                : 'border-gray-300 hover:border-purple-400 hover:shadow-md'
              }
              ${disabled || isShuffling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${index === focusedIndex ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
            `}
            style={getCardStyle(index)}
          >
            {/* 牌背图案 */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/tarot-cards/cardback.png"
                alt="塔罗牌背面"
                fill
                className="object-contain"
                sizes="(max-width: 100px) 100vw, 100px"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {card.isSelected && (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-500/90 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {card.selectionOrder + 1}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 位置编号（用于调试，生产环境可移除） */}
            <div className="absolute top-1 left-1 text-xs text-white/60 font-mono">
              {card.position + 1}
            </div>
          </button>
        ))}
      </div>

      {/* 减少动画用户的静态提示 */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .grid button {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
