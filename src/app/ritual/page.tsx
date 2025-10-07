'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { ArrowLeft } from 'lucide-react'; // 不再使用
import { SpreadType } from '@/schemas/reading.schema';
import type React from 'react';
import { motion } from 'framer-motion';
import { useCardPreview } from '@/components/useCardPreview';
import { CardDetailOverlay } from '@/components/CardDetailOverlay';

interface SelectedCard {
  id: number;
  offset: { x: number; y: number };
  rotation: number;
  zIndex: number;
}

function RitualPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const spread = (searchParams.get('spread') as SpreadType) || 'single';
  const question = searchParams.get('question') || '';

  const getCardCount = (spreadType: SpreadType): number => {
    switch (spreadType) {
      case 'single':
        return 1;
      case 'situation-action-outcome':
        return 3;
      case 'five-card':
        return 5;
      default:
        return 1;
    }
  };

  const cardCount = getCardCount(spread);
  const [selectedSlots, setSelectedSlots] = useState<(SelectedCard | null)[]>(
    Array(cardCount).fill(null)
  );
  const [scatteredCards, setScatteredCards] = useState<SelectedCard[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false); // 新增状态，用于控制提示文字的显示

  const [arcHome, setArcHome] = useState<
    Map<number, { x: number; y: number; rotation: number; zIndex: number }>
  >(new Map());

  const [revealedSlots, setRevealedSlots] = useState<boolean[]>(
    Array(cardCount).fill(false)
  );

  type Face = {
    id: number;
    name: string;
    imageUrl: string;
    orientation: 'upright' | 'reversed';
  };
  const [slotFaces, setSlotFaces] = useState<(Face | null)[]>(
    Array(cardCount).fill(null)
  );
  const [usedFaceIds, setUsedFaceIds] = useState<Set<number>>(new Set());
  // 圆圈旋转与手势状态
  const [circleRotation, setCircleRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartAngle, setDragStartAngle] = useState(0);
  const [dragStartRotation, setDragStartRotation] = useState(0);
  // 动画过渡控制（非拖动阶段）
  const [animMs, setAnimMs] = useState<number>(600);
  const [animEase, setAnimEase] = useState<string>('ease-in-out');
  
  const { openFace, setOpenFace } = useCardPreview();

  // 渲染单个卡牌槽的函数
  const renderCardSlot = (index: number) => {
    const card = selectedSlots[index];
    const key = card ? `slot-${card.id}` : `slot-empty-${index}`;
    const labels = spread === 'single' ? ['当前状况'] : spread === 'situation-action-outcome' ? ['现状', '行为', '结果'] : ['过去', '现在', '未来', '建议', '结果'];
    
    return (
      <div key={key} className="flex flex-col items-center">
        <button
          role="button"
          aria-pressed={revealedSlots[index] ? 'true' : 'false'}
          aria-label={`选择${labels[index]}牌槽`}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onClick={() => {
            if (!selectedSlots[index]) return;
            setRevealedSlots(prev => {
              const next = [...prev];
              if (!next[index] && !slotFaces[index]) {
                const face = dealOneFace();
                if (face) setSlotFaces(arr => { const copy = [...arr]; copy[index] = face; return copy; });
              }
              next[index] = !next[index];
              return next;
            });
          }}
          className={`relative w-24 h-[154px] bg-white rounded border transition-all duration-120 hover:scale-98 active:scale-95 ${
            selectedSlots[index] 
              ? 'border-purple-500/30 shadow-[0_0_0_2px_rgba(124,58,237,0.15)]' 
              : 'border-slate-900/20 shadow-sm'
          }`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          <div className="absolute inset-0 rounded z-0" style={{ perspective: '1000px' }}>
            <div
              className="h-full w-full rounded"
              style={{ transformStyle: 'preserve-3d', transition: 'transform 600ms', transform: revealedSlots[index] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Card back */}
              <div
                className="absolute inset-0 rounded overflow-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: '1px solid #475569', transform: 'rotateY(0deg)' }}
              >
                {!selectedSlots[index] ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-400 text-sm text-center px-2">选择<br />第 {index + 1} 张</div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img 
                      src="/images/tarot-cards/cardback.png" 
                      alt="塔罗牌背面" 
                      className="w-full h-full object-cover" 
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-medium text-shadow-lg text-sm">点击翻面</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card face */}
              <div
                className="absolute inset-0 rounded overflow-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#fff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              >
                {slotFaces[index] ? (
                  <motion.img
                    layoutId={`card-${slotFaces[index]!.id}`}
                    src={slotFaces[index]!.imageUrl}
                    alt={slotFaces[index]!.name}
                    draggable="false"
                    onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={() => setOpenFace(slotFaces[index]!)}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain', 
                      borderRadius: '4px', 
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      cursor: 'pointer',
                      rotate: slotFaces[index]!.orientation === 'reversed' ? 180 : 0,
                      transformOrigin: '50% 50%'
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm">发牌中...</div>
                )}
              </div>
            </div>
          </div>
        </button>
        <div className="mt-2 text-xs leading-4 text-slate-400">
          {labels[index]}
        </div>
      </div>
    );
  };

  const TAROT_CARDS: {
    id: number;
    name: string;
    imageUrl: string;
    suit: string;
    number: number;
  }[] = [
    { id: 0, name: 'The Fool', imageUrl: '/images/tarot-cards/the fool.jpg', suit: 'major', number: 0 },
    { id: 1, name: 'The Magician', imageUrl: '/images/tarot-cards/THE MAGICIAN..jpg', suit: 'major', number: 1 },
    { id: 2, name: 'The High Priestess', imageUrl: '/images/tarot-cards/THE HIGH PRIESTESS.jpg', suit: 'major', number: 2 },
    { id: 3, name: 'The Empress', imageUrl: '/images/tarot-cards/THE EMPRESS..jpg', suit: 'major', number: 3 },
    { id: 4, name: 'The Emperor', imageUrl: '/images/tarot-cards/THE EMPEROR..jpg', suit: 'major', number: 4 },
    { id: 5, name: 'The Hierophant', imageUrl: '/images/tarot-cards/THE HIEROPHANT.jpg', suit: 'major', number: 5 },
    { id: 6, name: 'The Lovers', imageUrl: '/images/tarot-cards/THE LOVERS..jpg', suit: 'major', number: 6 },
    { id: 7, name: 'The Chariot', imageUrl: '/images/tarot-cards/THE CHARIOT..jpg', suit: 'major', number: 7 },
    { id: 8, name: 'Strength', imageUrl: '/images/tarot-cards/STRENGTH..jpg', suit: 'major', number: 8 },
    { id: 9, name: 'The Hermit', imageUrl: '/images/tarot-cards/THE HERMIT..jpg', suit: 'major', number: 9 },
    { id: 10, name: 'Wheel of Fortune', imageUrl: '/images/tarot-cards/WHEEL • FORTUNE.jpg', suit: 'major', number: 10 },
    { id: 11, name: 'Justice', imageUrl: '/images/tarot-cards/TUSTICE ..jpg', suit: 'major', number: 11 },
    { id: 12, name: 'The Hanged Man', imageUrl: '/images/tarot-cards/THE HANGED MAN..jpg', suit: 'major', number: 12 },
    { id: 13, name: 'Death', imageUrl: '/images/tarot-cards/DEATH..jpg', suit: 'major', number: 13 },
    { id: 14, name: 'Temperance', imageUrl: '/images/tarot-cards/TEMPERANCE..jpg', suit: 'major', number: 14 },
    { id: 15, name: 'The Devil', imageUrl: '/images/tarot-cards/THE DEVIL •.jpg', suit: 'major', number: 15 },
    { id: 16, name: 'The Tower', imageUrl: '/images/tarot-cards/THE TOWER..jpg', suit: 'major', number: 16 },
    { id: 17, name: 'The Star', imageUrl: '/images/tarot-cards/THE STAR..jpg', suit: 'major', number: 17 },
    { id: 18, name: 'The Moon', imageUrl: '/images/tarot-cards/THE MOON.jpg', suit: 'major', number: 18 },
    { id: 19, name: 'The Sun', imageUrl: '/images/tarot-cards/THE SUN.jpg', suit: 'major', number: 19 },
    { id: 20, name: 'Judgement', imageUrl: '/images/tarot-cards/JUDGEMENT..jpg', suit: 'major', number: 20 },
    { id: 21, name: 'The World', imageUrl: '/images/tarot-cards/THE VYORLD..jpg', suit: 'major', number: 21 },
    { id: 22, name: 'Ace of Wands', imageUrl: '/images/tarot-cards/w01.jpg', suit: 'wands', number: 1 },
    { id: 23, name: 'Two of Wands', imageUrl: '/images/tarot-cards/w02.jpg', suit: 'wands', number: 2 },
    { id: 24, name: 'Three of Wands', imageUrl: '/images/tarot-cards/w03.jpg', suit: 'wands', number: 3 },
    { id: 25, name: 'Four of Wands', imageUrl: '/images/tarot-cards/w04.jpg', suit: 'wands', number: 4 },
    { id: 26, name: 'Five of Wands', imageUrl: '/images/tarot-cards/w05.jpg', suit: 'wands', number: 5 },
    { id: 27, name: 'Six of Wands', imageUrl: '/images/tarot-cards/w06.jpg', suit: 'wands', number: 6 },
    { id: 28, name: 'Seven of Wands', imageUrl: '/images/tarot-cards/w07.jpg', suit: 'wands', number: 7 },
    { id: 29, name: 'Eight of Wands', imageUrl: '/images/tarot-cards/w08.jpg', suit: 'wands', number: 8 },
    { id: 30, name: 'Nine of Wands', imageUrl: '/images/tarot-cards/w09.jpg', suit: 'wands', number: 9 },
    { id: 31, name: 'Ten of Wands', imageUrl: '/images/tarot-cards/w10.jpg', suit: 'wands', number: 10 },
    { id: 32, name: 'Page of Wands', imageUrl: '/images/tarot-cards/w11.jpg', suit: 'wands', number: 11 },
    { id: 33, name: 'Knight of Wands', imageUrl: '/images/tarot-cards/w12.jpg', suit: 'wands', number: 12 },
    { id: 34, name: 'Queen of Wands', imageUrl: '/images/tarot-cards/w13.jpg', suit: 'wands', number: 13 },
    { id: 35, name: 'King of Wands', imageUrl: '/images/tarot-cards/w14.jpg', suit: 'wands', number: 14 },
    { id: 36, name: 'Ace of Cups', imageUrl: '/images/tarot-cards/c01.jpg', suit: 'cups', number: 1 },
    { id: 37, name: 'Two of Cups', imageUrl: '/images/tarot-cards/c02.jpg', suit: 'cups', number: 2 },
    { id: 38, name: 'Three of Cups', imageUrl: '/images/tarot-cards/c03.jpg', suit: 'cups', number: 3 },
    { id: 39, name: 'Four of Cups', imageUrl: '/images/tarot-cards/c04.jpg', suit: 'cups', number: 4 },
    { id: 40, name: 'Five of Cups', imageUrl: '/images/tarot-cards/c05.jpg', suit: 'cups', number: 5 },
    { id: 41, name: 'Six of Cups', imageUrl: '/images/tarot-cards/c06.jpg', suit: 'cups', number: 6 },
    { id: 42, name: 'Seven of Cups', imageUrl: '/images/tarot-cards/c07.jpg', suit: 'cups', number: 7 },
    { id: 43, name: 'Eight of Cups', imageUrl: '/images/tarot-cards/c08.jpg', suit: 'cups', number: 8 },
    { id: 44, name: 'Nine of Cups', imageUrl: '/images/tarot-cards/c09.jpg', suit: 'cups', number: 9 },
    { id: 45, name: 'Ten of Cups', imageUrl: '/images/tarot-cards/c10.jpg', suit: 'cups', number: 10 },
    { id: 46, name: 'Page of Cups', imageUrl: '/images/tarot-cards/c11.jpg', suit: 'cups', number: 11 },
    { id: 47, name: 'Knight of Cups', imageUrl: '/images/tarot-cards/c12.jpg', suit: 'cups', number: 12 },
    { id: 48, name: 'Queen of Cups', imageUrl: '/images/tarot-cards/c13.jpg', suit: 'cups', number: 13 },
    { id: 49, name: 'King of Cups', imageUrl: '/images/tarot-cards/c14.jpg', suit: 'cups', number: 14 },
    { id: 50, name: 'Ace of Swords', imageUrl: '/images/tarot-cards/s01.jpg', suit: 'swords', number: 1 },
    { id: 51, name: 'Two of Swords', imageUrl: '/images/tarot-cards/s02.jpg', suit: 'swords', number: 2 },
    { id: 52, name: 'Three of Swords', imageUrl: '/images/tarot-cards/s03.jpg', suit: 'swords', number: 3 },
    { id: 53, name: 'Four of Swords', imageUrl: '/images/tarot-cards/s04.jpg', suit: 'swords', number: 4 },
    { id: 54, name: 'Five of Swords', imageUrl: '/images/tarot-cards/s05.jpg', suit: 'swords', number: 5 },
    { id: 55, name: 'Six of Swords', imageUrl: '/images/tarot-cards/s06.jpg', suit: 'swords', number: 6 },
    { id: 56, name: 'Seven of Swords', imageUrl: '/images/tarot-cards/s07.jpg', suit: 'swords', number: 7 },
    { id: 57, name: 'Eight of Swords', imageUrl: '/images/tarot-cards/s08.jpg', suit: 'swords', number: 8 },
    { id: 58, name: 'Nine of Swords', imageUrl: '/images/tarot-cards/s09.jpg', suit: 'swords', number: 9 },
    { id: 59, name: 'Ten of Swords', imageUrl: '/images/tarot-cards/s10.jpg', suit: 'swords', number: 10 },
    { id: 60, name: 'Page of Swords', imageUrl: '/images/tarot-cards/s11.jpg', suit: 'swords', number: 11 },
    { id: 61, name: 'Knight of Swords', imageUrl: '/images/tarot-cards/s12.jpg', suit: 'swords', number: 12 },
    { id: 62, name: 'Queen of Swords', imageUrl: '/images/tarot-cards/s13.jpg', suit: 'swords', number: 13 },
    { id: 63, name: 'King of Swords', imageUrl: '/images/tarot-cards/s14.jpg', suit: 'swords', number: 14 },
    { id: 64, name: 'Ace of Pentacles', imageUrl: '/images/tarot-cards/p01.jpg', suit: 'pentacles', number: 1 },
    { id: 65, name: 'Two of Pentacles', imageUrl: '/images/tarot-cards/p02.jpg', suit: 'pentacles', number: 2 },
    { id: 66, name: 'Three of Pentacles', imageUrl: '/images/tarot-cards/p03.jpg', suit: 'pentacles', number: 3 },
    { id: 67, name: 'Four of Pentacles', imageUrl: '/images/tarot-cards/p04.jpg', suit: 'pentacles', number: 4 },
    { id: 68, name: 'Five of Pentacles', imageUrl: '/images/tarot-cards/p05.jpg', suit: 'pentacles', number: 5 },
    { id: 69, name: 'Six of Pentacles', imageUrl: '/images/tarot-cards/p06.jpg', suit: 'pentacles', number: 6 },
    { id: 70, name: 'Seven of Pentacles', imageUrl: '/images/tarot-cards/p07.jpg', suit: 'pentacles', number: 7 },
    { id: 71, name: 'Eight of Pentacles', imageUrl: '/images/tarot-cards/p08.jpg', suit: 'pentacles', number: 8 },
    { id: 72, name: 'Nine of Pentacles', imageUrl: '/images/tarot-cards/p09.jpg', suit: 'pentacles', number: 9 },
    { id: 73, name: 'Ten of Pentacles', imageUrl: '/images/tarot-cards/p10.jpg', suit: 'pentacles', number: 10 },
    { id: 74, name: 'Page of Pentacles', imageUrl: '/images/tarot-cards/p11.jpg', suit: 'pentacles', number: 11 },
    { id: 75, name: 'Knight of Pentacles', imageUrl: '/images/tarot-cards/p12.jpg', suit: 'pentacles', number: 12 },
    { id: 76, name: 'Queen of Pentacles', imageUrl: '/images/tarot-cards/p13.jpg', suit: 'pentacles', number: 13 },
    { id: 77, name: 'King of Pentacles', imageUrl: '/images/tarot-cards/p14.jpg', suit: 'pentacles', number: 14 }
  ];

  const deg2rad = (deg: number) => (deg * Math.PI) / 180;

  function layoutOnArc(cards: SelectedCard[], container: HTMLDivElement, spreadDeg = 300) {
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const R = Math.max(100, Math.min(W, H) / 2 - 140);
    const n = cards.length;
    
    // 确保角度分布更加均匀
    const start = -spreadDeg / 2;
    const end = spreadDeg / 2;
    
    // 如果卡牌数量很少，减少角度范围以避免过度分散
    const actualSpread = n <= 3 ? spreadDeg * 0.6 : spreadDeg;
    const actualStart = -actualSpread / 2;
    const actualEnd = actualSpread / 2;

    return cards
      .map((c, i) => {
        // 使用更均匀的角度分布
        const t = n <= 1 ? 0.5 : i / (n - 1);
        const deg = actualStart + t * (actualEnd - actualStart) + circleRotation;
        const rad = deg2rad(deg);
        const x = R * Math.cos(rad) + 10;
        const y = R * Math.sin(rad) - 60;
        const tilt = deg + 90 ;
        return { ...c, offset: { x, y }, rotation: tilt, zIndex: c.zIndex };
      })
      .map((c, i, arr) => ({ ...c, zIndex: arr.length - i }));
  }

  // 显式角度版本，避免一帧闭包使用旧角度导致的错位插值
  function layoutOnArcWithRotation(
    cards: SelectedCard[],
    container: HTMLDivElement,
    spreadDeg = 320,
    rotationDeg = 0
  ) {
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const R = Math.max(100, Math.min(W, H) / 2 - 140);
    const n = cards.length;

    const actualSpread = n <= 3 ? spreadDeg * 0.6 : spreadDeg;
    const actualStart = -actualSpread / 2;
    const actualEnd = actualSpread / 2;

    return cards
      .map((c, i) => {
        const t = n <= 1 ? 0.5 : i / (n - 1);
        const deg = actualStart + t * (actualEnd - actualStart) + rotationDeg;
        const rad = (deg * Math.PI) / 180;
        const x = R * Math.cos(rad) + 10;
        const y = R * Math.sin(rad) - 60;
        const tilt = deg + 90;
        return { ...c, offset: { x, y }, rotation: tilt, zIndex: c.zIndex };
      })
      .map((c, i, arr) => ({ ...c, zIndex: arr.length - i }));
  }

  const shortestAngleDelta = (a: number, b: number) => {
    let d = a - b;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  // 角度插值 + 非线性（S 曲线）分布 + 统一铰点
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const easeInOutSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

  function generateFannedStack(total = 28) {
    const FAN_MIN = -4;      // 左端角度（稍微增加角度范围）
    const FAN_MAX =  4;      // 右端角度（稍微增加角度范围）
    const THICK_X = 0.4;     // 每张卡的水平"厚度"偏移（像素，稍微增加横向展开）
    const SAG_Y   = 0.6;     // 随角度产生的轻微下垂（像素，减少下垂）
    
    const cards: SelectedCard[] = [];
    
    for (let i = 0; i < total; i++) {
      const progress = i / (total - 1);
      // 使用更均匀的角度分布
      const angle = lerp(FAN_MIN, FAN_MAX, progress);
      const rad = (angle * Math.PI) / 180;
      
      // 主要改为竖向堆叠，减少横向偏移
      const x = Math.cos(rad) * THICK_X * i;
      const y = Math.sin(rad) * SAG_Y * i;
      
      cards.push({
        id: i,
        offset: { x, y },
        rotation: angle,
        zIndex: total - i, // 前面的卡z-index更高
      });
    }
    
    return cards;
  }

  const generateStackedCards = () => {
    return generateFannedStack(78);
  };

  useEffect(() => {
    setScatteredCards(generateStackedCards());
  }, []);

  const handleCardClick = (card: SelectedCard) => {
    const selectedCount = selectedSlots.filter(Boolean).length;
    // 洗牌前：点击任意卡牌触发洗牌动画
    if (!isShuffled) {
      if (!isShuffling) shuffleCards();
      return;
    }
    // 洗牌完成后正常选牌
    if (isAnimating || selectedCount >= cardCount || isShuffling) return;
    setIsAnimating(true);
    
    // 为选中的卡牌分配一个面（Face）
    const face = dealOneFace();
    
    setSelectedSlots(prev => {
      const next = [...prev];
      const idx = next.findIndex(s => s === null);
      if (idx !== -1) {
        next[idx] = card;
        // 同时设置对应的slotFaces
        setSlotFaces(prevFaces => {
          const nextFaces = [...prevFaces];
          nextFaces[idx] = face;
          return nextFaces;
        });
      }
      return next;
    });
    
    setScatteredCards(prev => prev.filter(c => c.id !== card.id));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const D1 = 700;
  const D2 = 500;
  const D3 = 500;
  const D4 = 600;

  const shuffleCards = () => {
    const selectedCount = selectedSlots.filter(Boolean).length;
    if (isShuffling || selectedCount > 0) return;
    setIsShuffling(true);
    setArcHome(new Map());
    setRevealedSlots(Array(cardCount).fill(false));
    setSlotFaces(Array(cardCount).fill(null));
    setUsedFaceIds(new Set());
    setIsShuffled(false); // 重置洗牌状态

    // 第一阶段：随机分散，但保持相对均匀
    setAnimMs(D1);
    setAnimEase('cubic-bezier(0.45, 0.05, 0.1, 0.95)'); // 柔和缓动
    setScatteredCards(prev =>
      prev.map((c, i) => ({
        ...c,
        offset: { 
          x: (Math.random() - 0.5) * 400, // 减少随机范围
          y: (Math.random() - 0.5) * 300 
        },
        rotation: (Math.random() - 0.5) * 80 // 减少旋转范围
      }))
    );

    setTimeout(() => {
      setAnimMs(D2);
      // 第二阶段：稍微聚集，但保持分布
      setScatteredCards(prev =>
        prev.map(c => ({
          ...c,
          offset: { 
            x: (Math.random() - 0.5) * 200, // 进一步减少范围
            y: (Math.random() - 0.5) * 150 
          },
          rotation: (Math.random() - 0.5) * 40
        }))
      );
    }, D1);

    setTimeout(() => {
      setAnimMs(D3);
      // 第三阶段：准备最终布局
      setScatteredCards(prev => prev.map((c, i) => ({ 
        ...c, 
        offset: { 
          x: -30 + i * 1.5, // 更均匀的线性分布
          y: 0 
        }, 
        rotation: (Math.random() - 0.5) * 20 // 最小旋转
      })));
    }, D1 + D2);

    setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      setAnimMs(D4);
      setScatteredCards(prev => {
        const laid = layoutOnArc(prev, el, 320);
        const map = new Map<number, { x: number; y: number; rotation: number; zIndex: number }>();
        for (const c of laid) map.set(c.id, { x: c.offset.x, y: c.offset.y, rotation: c.rotation, zIndex: c.zIndex });
        setArcHome(map);
        return laid;
      });
      setTimeout(() => {
        setIsShuffled(true); // 洗牌完成后显示提示文字
        setIsShuffling(false);
      }, D4);
    }, D1 + D2 + D3);
  };

  // 触摸手势：在容器任意位置滑动旋转整个圆圈
  const handleTouchStart = (e: React.TouchEvent) => {
    // 洗牌前不允许旋转
    if (!isShuffled || isAnimating || isShuffling) return;
    const touch = e.touches[0];
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    setIsDragging(true);
    setDragStartAngle(angle);
    setDragStartRotation(circleRotation);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isShuffled || isAnimating || isShuffling) return;
    const touch = e.touches[0];
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const currentAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    const angleDiff = shortestAngleDelta(currentAngle, dragStartAngle);
    const nextRotation = dragStartRotation + angleDiff;
    setCircleRotation(nextRotation);
    setScatteredCards(prev => (el ? layoutOnArcWithRotation(prev, el, 320, nextRotation) : prev));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const removeFromSlot = (slotIndex: number) => {
    const card = selectedSlots[slotIndex];
    if (!card) return;

    // 释放被移除卡牌的面，允许重新使用
    const face = slotFaces[slotIndex];
    if (face) {
      setUsedFaceIds(prev => {
        const next = new Set(prev);
        next.delete(face.id);
        return next;
      });
    }

    setSlotFaces(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setRevealedSlots(prev => {
      const next = [...prev];
      next[slotIndex] = false;
      return next;
    });

    const home = arcHome.get(card.id);
    const returned: SelectedCard = home
      ? { ...card, offset: { x: home.x, y: home.y }, rotation: home.rotation, zIndex: home.zIndex }
      : { ...card, offset: { x: 0, y: 0 }, rotation: 0, zIndex: 1 };
    setScatteredCards(prev => [...prev, returned]);

    setSelectedSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const removeFromSlotById = (cardId: number) => {
    const slotIndex = selectedSlots.findIndex(c => c?.id === cardId);
    if (slotIndex < 0) return;
    removeFromSlot(slotIndex);
  };

  const handleStartReading = async () => {
    if (selectedSlots.filter(Boolean).length !== cardCount || isAnimating) return;
    setIsAnimating(true);
    
    // 构建卡牌数据用于解读
    const positions =
      spread === 'single'
        ? ['当前状况']
        : spread === 'situation-action-outcome'
        ? ['现状', '行动', '结果']
        : ['过去', '现在', '未来', '建议', '结果'];

    const buildCardsForReading = () => {
      const out: any[] = [];
      for (let i = 0; i < cardCount; i++) {
        let face = slotFaces[i];
        if (!face) {
          face = dealOneFace();
          if (face) setSlotFaces(prev => { const copy = [...prev]; copy[i] = face!; return copy; });
        }
        if (face) {
          const cardData = TAROT_CARDS.find(c => c.id === face!.id);
          out.push({
            name: face!.name,
            orientation: face!.orientation,
            position: positions[i],
            suit: cardData?.suit || 'major',
            number: cardData?.number || face!.id,
            keywords: ['直觉', '选择', '变化']
          });
        }
      }
      return out;
    };

    const cards = buildCardsForReading();
    
    // 保存卡牌数据到sessionStorage
    const cardData = {
      spread,
      cards
    };
    sessionStorage.setItem('drawResult', JSON.stringify(cardData));
    
    // 跳转到loading页面，传递必要的参数
    const params = new URLSearchParams({
      fromRitual: 'true',
      spread: spread,
      question: question || ''
    });
    router.push(`/loading?${params.toString()}`);
  };

  const dealOneFace = (): Face | null => {
    const pool = TAROT_CARDS.filter(c => !usedFaceIds.has(c.id));
    if (pool.length === 0) return null;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const orientation: 'upright' | 'reversed' = Math.random() > 0.5 ? 'upright' : 'reversed';
    setUsedFaceIds(prev => new Set(prev).add(pick.id));
    return { id: pick.id, name: pick.name, imageUrl: pick.imageUrl, orientation };
  };

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundImage: 'url(/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '100dvh' }}>
      {/* Header */}
      <header className="pt-safe px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const params = new URLSearchParams({ spread, question });
              router.push(`/start?${params.toString()}`);
            }}
            className="p-2 -ml-2 rounded transition-colors"
            aria-label="返回"
          >
            <img src="/black_arrow.png" alt="返回" className="h-6 w-6" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">抽牌仪式</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main container: max-width 480px, centered */}
      <div className={`mx-auto px-6 ${
        cardCount === 1 ? 'max-w-[200px]' : 'max-w-[480px]'
      }`}>
        {/* Title: 8-12px from header, 16px font, 600 weight */}
        <div className="mt-0 text-center"> {/* 从mt-3减少到mt-0，向上移动 */}
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {/* 请根据宇宙的指引选择你的牌 */}
          </h1>
        </div>

        {/* Card slots area: 16px from title, dynamic grid layout */}
        <div className="mt-1"> {/* 从mt-4减少到mt-1，向上移动 */}
          <div className={`${
            cardCount === 1 
              ? 'grid grid-cols-1 justify-items-center gap-4' 
              : cardCount === 3 
                ? 'grid grid-cols-3 gap-4' 
                : cardCount === 5
                  ? 'flex flex-col items-center gap-4'
                  : 'grid grid-cols-3 gap-4'
          }`}>
            {cardCount === 5 ? (
              // 5张牌的十字布局
              <>
                {/* 第一行：过去 */}
                <div className="flex justify-center">
                  {renderCardSlot(0)}
                </div>
                {/* 第二行：现在、未来、建议 */}
                <div className="flex gap-4">
                  {renderCardSlot(1)}
                  {renderCardSlot(2)}
                  {renderCardSlot(3)}
                </div>
                {/* 第三行：结果 */}
                <div className="flex justify-center">
                  {renderCardSlot(4)}
                </div>
              </>
            ) : (
              // 其他牌阵的原有布局
              Array.from({ length: cardCount }, (_, index) => {
                const card = selectedSlots[index];
                const key = card ? `slot-${card.id}` : `slot-empty-${index}`;
                const labels = spread === 'single' ? ['当前状况'] : spread === 'situation-action-outcome' ? ['现状', '行为', '结果'] : ['过去', '现在', '未来', '建议', '结果'];
                
                return (
                  <div key={key} className={`flex flex-col items-center ${
                    cardCount === 1 ? 'col-span-1' : ''
                  }`}>
                  {/* Card slot: 96×154, 5:8 ratio */}
                  <button
                    role="button"
                    aria-pressed={revealedSlots[index] ? 'true' : 'false'}
                    aria-label={`选择${labels[index]}牌槽`}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!selectedSlots[index]) return;
                      setRevealedSlots(prev => {
                        const next = [...prev];
                        if (!next[index] && !slotFaces[index]) {
                          const face = dealOneFace();
                          if (face) setSlotFaces(arr => { const copy = [...arr]; copy[index] = face; return copy; });
                        }
                        next[index] = !next[index];
                        return next;
                      });
                    }}
                    className={`relative w-24 h-[154px] bg-white rounded border transition-all duration-120 hover:scale-98 active:scale-95 ${
                      selectedSlots[index] 
                        ? 'border-purple-500/30 shadow-[0_0_0_2px_rgba(124,58,237,0.15)]' 
                        : 'border-slate-900/20 shadow-sm'
                    }`}
                    style={{
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                    }}
                  >
                    <div className="absolute inset-0 rounded z-0" style={{ perspective: '1000px' }}>
                      <div
                        className="h-full w-full rounded"
                        style={{ transformStyle: 'preserve-3d', transition: 'transform 600ms', transform: revealedSlots[index] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                      >
                        {/* Card back */}
                        <div
                          className="absolute inset-0 rounded overflow-hidden"
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: '1px solid #475569', transform: 'rotateY(0deg)' }}
                        >
                          {!selectedSlots[index] ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-gray-400 text-sm text-center px-2">选择<br />第 {index + 1} 张</div>
                            </div>
                          ) : (
                            <div className="w-full h-full relative">
                              <img 
                                src="/images/tarot-cards/cardback.png" 
                                alt="塔罗牌背面" 
                                className="w-full h-full object-cover" 
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                style={{
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  MozUserSelect: 'none',
                                  msUserSelect: 'none',
                                  pointerEvents: 'none'
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white font-medium text-shadow-lg text-sm">点击翻面</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Card face */}
                        <div
                          className="absolute inset-0 rounded overflow-hidden"
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#fff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                        >
                          {slotFaces[index] ? (
                            <motion.img
                              layoutId={`card-${slotFaces[index]!.id}`}
                              src={slotFaces[index]!.imageUrl}
                              alt={slotFaces[index]!.name}
                              draggable="false"
                              onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                              onClick={() => setOpenFace(slotFaces[index]!)}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain', 
                                borderRadius: '4px', 
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                cursor: 'pointer',
                                rotate: slotFaces[index]!.orientation === 'reversed' ? 180 : 0,
                                transformOrigin: '50% 50%'
                              }}
                            />
                          ) : (
                            <div className="text-gray-400 text-sm">发牌中...</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove button - 已移除 */}
                    {/* Slot number - 已移除 */}
                  </button>
                  
                  {/* Slot label: 8px from card slot, 12px font */}
                  <div className="mt-2 text-xs leading-4 text-slate-400">
                    {labels[index]}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* 中央牌堆（抽牌入口） */}
        <div className="mt-[-60px] flex justify-center relative"> {/* 添加relative定位 */}

          {/* 开始解读按钮 - 使用和洗牌按钮相同的样式和定位，独立层 */}
          {selectedSlots.filter(Boolean).length === cardCount && (
            <div className="absolute top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" style={{ marginLeft: '5px' }}> {/* 向左移动，从60px减少到20px */}
              <button
                onClick={handleStartReading}
                disabled={isAnimating}
                className={`pointer-events-auto px-8 py-3 rounded font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/70 border border-white/60 shadow-lg hover:shadow-xl hover:bg-white/80 active:bg-white/90 ${
                  isAnimating 
                    ? 'bg-gray-300/50 text-gray-500 cursor-not-allowed backdrop-blur-none' 
                    : 'text-black hover:text-black/90 active:text-black/80'
                }`}
                style={{
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                  // 去除 backdrop-filter 以避免模糊卡堆
                  minWidth: '120px', // 确保按钮有足够宽度显示横向文字
                  whiteSpace: 'nowrap' // 防止文字换行
                }}
              >
                {isAnimating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    正在解读...
                  </div>
                ) : (
                  '开始解读'
                )}
              </button>
            </div>
          )}

          {/* Realistic card stack with layered shadows and offsets */}
          <div
            ref={containerRef}
            className="relative mx-auto bg-transparent rounded overflow-visible z-20"
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              height: '560px', 
              paddingTop: '120px', // 从60px增加到120px，让卡堆向下移动60px
              perspective: '1200px', // 3D 透视
              marginLeft: '-9px', // 向左移动60px
              touchAction: 'none',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {scatteredCards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                disabled={isAnimating || selectedSlots.filter(Boolean).length >= cardCount || isShuffling}
                aria-disabled={isAnimating || selectedSlots.filter(Boolean).length >= cardCount || isShuffling}
                className={`absolute rounded-xl ${
                  isDragging ? '' : 'transition-transform'
                } ${
                  isAnimating || selectedSlots.filter(Boolean).length >= cardCount || isShuffling
                    ? 'cursor-not-allowed filter grayscale-[25%]'
                    : isDragging
                      ? ''
                      : 'cursor-pointer hover:scale-105 active:scale-95'
                }`}
                style={{
                  left: '50%',
                  top: 'calc(50% + 53px)', // 从calc(50% + 30px)改为calc(50% + 30px)，让卡堆向下移动60px
                  width: '80px',  // 从60px增加到80px
                  height: '120px', // 从90px增加到120px
                  // ❶ 把铰点放到卡片下方 24px 处（也可以微调成 26~36px）
                  transformOrigin: '50% calc(100% + 24px)',
                  // ❷ 只做轻位移 + 围绕统一铰点旋转
                  transform: `translate3d(${card.offset.x - 40}px, ${card.offset.y - 60}px, 0) rotate(${card.rotation}deg)`, // 调整偏移量以匹配新尺寸
                  zIndex: card.zIndex,
                  willChange: 'transform',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  transition: isDragging ? 'none' : `transform ${animMs}ms ${animEase}`,
                }}
                aria-label="抽一张牌"
              >
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <img 
                    src="/images/tarot-cards/cardback.png" 
                    alt="塔罗牌背面" 
                    className="w-full h-full object-contain p-0" 
                    draggable="false"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </button>
            ))}

            {/* 提示文字 - 只在洗牌完成后显示 */}
            {isShuffled && !isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-500 text-center" style={{ transform: 'translateX(12px) translateY(25px)' }}> {/* 向右移动12px，向下移动13px */}
                  <p className="text-sm"></p>
                  <p className="text-xs text-gray-500 mt-3" style={{ marginTop: '+100px' }}>
                    请凭直觉选择你的牌
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Detail Overlay */}
      {openFace && (
        <CardDetailOverlay 
          face={openFace} 
          onClose={() => setOpenFace(null)} 
        />
      )}
    </div>
  );
}

export default function RitualPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RitualPageContent />
    </Suspense>
  );
}


