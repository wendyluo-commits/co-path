'use client';

import Image from 'next/image';

interface TarotCardBackProps {
  width: number;
  height: number;
  rotation?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function TarotCardBack({ 
  width, 
  height, 
  rotation = 0, 
  className = '',
  onClick,
  disabled = false,
  ariaLabel = '塔罗牌'
}: TarotCardBackProps) {
  const isClickable = !!onClick && !disabled;
  
  return (
    <div
      className={`
        relative rounded-xl overflow-hidden shadow-lg
        ${isClickable ? 'cursor-pointer hover:scale-103 hover:-translate-y-1 transition-all duration-120' : ''}
        ${disabled ? 'opacity-60' : ''}
        ${className}
      `}
      style={{
        width: `${width}pt`,
        height: `${height}pt`,
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={ariaLabel}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <Image
        src="/images/tarot-cards/cardback.png"
        alt="塔罗牌背面"
        fill
        className="object-contain"
        sizes={`${width}pt`}
      />
    </div>
  );
}
