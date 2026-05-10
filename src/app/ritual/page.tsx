'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpreadType } from '@/schemas/reading.schema';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardPreview } from '@/components/useCardPreview';
import type { Face } from '@/components/useCardPreview';
import { CardDetailOverlay } from '@/components/CardDetailOverlay';
import { useHandGesture } from '@/hooks/useHandGesture';
import { ModeSelectOverlay } from '@/components/ModeSelectOverlay';

// ─── Constants ─────────────────────────────────────────────────────────────────

const DECK_N          = 78;
const GESTURE_DECK_N  = 15;  // gesture mode shows 15 cards — ~22px spacing, finger-reachable
const CARD_W      = 72;
const CARD_H      = 116;
const ARC_CARD_W  = 54;   // smaller cards for mouse-mode arc fan
const ARC_CARD_H  = 88;
const REVEAL_MS   = 700;
const PINCH_ON    = 0.095;
const PINCH_OFF   = 0.135;
const IDX_TIP     = 8;
const THUMB_TIP   = 4;
const D1 = 500, D2 = 400, D3 = 700;

// ─── Spread helpers ────────────────────────────────────────────────────────────

function getCardCount(s: SpreadType) {
  return s === 'single' ? 1 : s === 'situation-action-outcome' ? 3 : 5;
}
function getLabels(s: SpreadType, lang: 'zh' | 'en' = 'zh') {
  if (lang === 'en') {
    return s === 'single'
      ? ['Current']
      : s === 'situation-action-outcome'
      ? ['Situation', 'Action', 'Outcome']
      : ['Past', 'Present', 'Future', 'Advice', 'Outcome'];
  }
  return s === 'single'
    ? ['当前状况']
    : s === 'situation-action-outcome'
    ? ['现状', '行为', '结果']
    : ['过去', '现在', '未来', '建议', '结果'];
}

// ─── TAROT_CARDS (78 card pool) ────────────────────────────────────────────────

const TAROT_CARDS: { id: number; name: string; imageUrl: string; suit: string; number: number }[] = [
  { id: 0,  name: 'The Fool',           imageUrl: '/images/tarot-cards/the fool.jpg',           suit: 'major', number: 0  },
  { id: 1,  name: 'The Magician',       imageUrl: '/images/tarot-cards/THE MAGICIAN..jpg',       suit: 'major', number: 1  },
  { id: 2,  name: 'The High Priestess', imageUrl: '/images/tarot-cards/THE HIGH PRIESTESS.jpg', suit: 'major', number: 2  },
  { id: 3,  name: 'The Empress',        imageUrl: '/images/tarot-cards/THE EMPRESS..jpg',        suit: 'major', number: 3  },
  { id: 4,  name: 'The Emperor',        imageUrl: '/images/tarot-cards/THE EMPEROR..jpg',        suit: 'major', number: 4  },
  { id: 5,  name: 'The Hierophant',     imageUrl: '/images/tarot-cards/THE HIEROPHANT.jpg',      suit: 'major', number: 5  },
  { id: 6,  name: 'The Lovers',         imageUrl: '/images/tarot-cards/THE LOVERS..jpg',         suit: 'major', number: 6  },
  { id: 7,  name: 'The Chariot',        imageUrl: '/images/tarot-cards/THE CHARIOT..jpg',        suit: 'major', number: 7  },
  { id: 8,  name: 'Strength',           imageUrl: '/images/tarot-cards/STRENGTH..jpg',           suit: 'major', number: 8  },
  { id: 9,  name: 'The Hermit',         imageUrl: '/images/tarot-cards/THE HERMIT..jpg',         suit: 'major', number: 9  },
  { id: 10, name: 'Wheel of Fortune',   imageUrl: '/images/tarot-cards/WHEEL • FORTUNE.jpg',    suit: 'major', number: 10 },
  { id: 11, name: 'Justice',            imageUrl: '/images/tarot-cards/TUSTICE ..jpg',           suit: 'major', number: 11 },
  { id: 12, name: 'The Hanged Man',     imageUrl: '/images/tarot-cards/THE HANGED MAN..jpg',     suit: 'major', number: 12 },
  { id: 13, name: 'Death',              imageUrl: '/images/tarot-cards/DEATH..jpg',              suit: 'major', number: 13 },
  { id: 14, name: 'Temperance',         imageUrl: '/images/tarot-cards/TEMPERANCE..jpg',         suit: 'major', number: 14 },
  { id: 15, name: 'The Devil',          imageUrl: '/images/tarot-cards/THE DEVIL •.jpg',         suit: 'major', number: 15 },
  { id: 16, name: 'The Tower',          imageUrl: '/images/tarot-cards/THE TOWER..jpg',          suit: 'major', number: 16 },
  { id: 17, name: 'The Star',           imageUrl: '/images/tarot-cards/THE STAR..jpg',           suit: 'major', number: 17 },
  { id: 18, name: 'The Moon',           imageUrl: '/images/tarot-cards/THE MOON.jpg',            suit: 'major', number: 18 },
  { id: 19, name: 'The Sun',            imageUrl: '/images/tarot-cards/THE SUN.jpg',             suit: 'major', number: 19 },
  { id: 20, name: 'Judgement',          imageUrl: '/images/tarot-cards/JUDGEMENT..jpg',          suit: 'major', number: 20 },
  { id: 21, name: 'The World',          imageUrl: '/images/tarot-cards/THE VYORLD..jpg',         suit: 'major', number: 21 },
  { id: 22, name: 'Ace of Wands',       imageUrl: '/images/tarot-cards/w01.jpg', suit: 'wands',   number: 1  },
  { id: 23, name: 'Two of Wands',       imageUrl: '/images/tarot-cards/w02.jpg', suit: 'wands',   number: 2  },
  { id: 24, name: 'Three of Wands',     imageUrl: '/images/tarot-cards/w03.jpg', suit: 'wands',   number: 3  },
  { id: 25, name: 'Four of Wands',      imageUrl: '/images/tarot-cards/w04.jpg', suit: 'wands',   number: 4  },
  { id: 26, name: 'Five of Wands',      imageUrl: '/images/tarot-cards/w05.jpg', suit: 'wands',   number: 5  },
  { id: 27, name: 'Six of Wands',       imageUrl: '/images/tarot-cards/w06.jpg', suit: 'wands',   number: 6  },
  { id: 28, name: 'Seven of Wands',     imageUrl: '/images/tarot-cards/w07.jpg', suit: 'wands',   number: 7  },
  { id: 29, name: 'Eight of Wands',     imageUrl: '/images/tarot-cards/w08.jpg', suit: 'wands',   number: 8  },
  { id: 30, name: 'Nine of Wands',      imageUrl: '/images/tarot-cards/w09.jpg', suit: 'wands',   number: 9  },
  { id: 31, name: 'Ten of Wands',       imageUrl: '/images/tarot-cards/w10.jpg', suit: 'wands',   number: 10 },
  { id: 32, name: 'Page of Wands',      imageUrl: '/images/tarot-cards/w11.jpg', suit: 'wands',   number: 11 },
  { id: 33, name: 'Knight of Wands',    imageUrl: '/images/tarot-cards/w12.jpg', suit: 'wands',   number: 12 },
  { id: 34, name: 'Queen of Wands',     imageUrl: '/images/tarot-cards/w13.jpg', suit: 'wands',   number: 13 },
  { id: 35, name: 'King of Wands',      imageUrl: '/images/tarot-cards/w14.jpg', suit: 'wands',   number: 14 },
  { id: 36, name: 'Ace of Cups',        imageUrl: '/images/tarot-cards/c01.jpg', suit: 'cups',    number: 1  },
  { id: 37, name: 'Two of Cups',        imageUrl: '/images/tarot-cards/c02.jpg', suit: 'cups',    number: 2  },
  { id: 38, name: 'Three of Cups',      imageUrl: '/images/tarot-cards/c03.jpg', suit: 'cups',    number: 3  },
  { id: 39, name: 'Four of Cups',       imageUrl: '/images/tarot-cards/c04.jpg', suit: 'cups',    number: 4  },
  { id: 40, name: 'Five of Cups',       imageUrl: '/images/tarot-cards/c05.jpg', suit: 'cups',    number: 5  },
  { id: 41, name: 'Six of Cups',        imageUrl: '/images/tarot-cards/c06.jpg', suit: 'cups',    number: 6  },
  { id: 42, name: 'Seven of Cups',      imageUrl: '/images/tarot-cards/c07.jpg', suit: 'cups',    number: 7  },
  { id: 43, name: 'Eight of Cups',      imageUrl: '/images/tarot-cards/c08.jpg', suit: 'cups',    number: 8  },
  { id: 44, name: 'Nine of Cups',       imageUrl: '/images/tarot-cards/c09.jpg', suit: 'cups',    number: 9  },
  { id: 45, name: 'Ten of Cups',        imageUrl: '/images/tarot-cards/c10.jpg', suit: 'cups',    number: 10 },
  { id: 46, name: 'Page of Cups',       imageUrl: '/images/tarot-cards/c11.jpg', suit: 'cups',    number: 11 },
  { id: 47, name: 'Knight of Cups',     imageUrl: '/images/tarot-cards/c12.jpg', suit: 'cups',    number: 12 },
  { id: 48, name: 'Queen of Cups',      imageUrl: '/images/tarot-cards/c13.jpg', suit: 'cups',    number: 13 },
  { id: 49, name: 'King of Cups',       imageUrl: '/images/tarot-cards/c14.jpg', suit: 'cups',    number: 14 },
  { id: 50, name: 'Ace of Swords',      imageUrl: '/images/tarot-cards/s01.jpg', suit: 'swords',  number: 1  },
  { id: 51, name: 'Two of Swords',      imageUrl: '/images/tarot-cards/s02.jpg', suit: 'swords',  number: 2  },
  { id: 52, name: 'Three of Swords',    imageUrl: '/images/tarot-cards/s03.jpg', suit: 'swords',  number: 3  },
  { id: 53, name: 'Four of Swords',     imageUrl: '/images/tarot-cards/s04.jpg', suit: 'swords',  number: 4  },
  { id: 54, name: 'Five of Swords',     imageUrl: '/images/tarot-cards/s05.jpg', suit: 'swords',  number: 5  },
  { id: 55, name: 'Six of Swords',      imageUrl: '/images/tarot-cards/s06.jpg', suit: 'swords',  number: 6  },
  { id: 56, name: 'Seven of Swords',    imageUrl: '/images/tarot-cards/s07.jpg', suit: 'swords',  number: 7  },
  { id: 57, name: 'Eight of Swords',    imageUrl: '/images/tarot-cards/s08.jpg', suit: 'swords',  number: 8  },
  { id: 58, name: 'Nine of Swords',     imageUrl: '/images/tarot-cards/s09.jpg', suit: 'swords',  number: 9  },
  { id: 59, name: 'Ten of Swords',      imageUrl: '/images/tarot-cards/s10.jpg', suit: 'swords',  number: 10 },
  { id: 60, name: 'Page of Swords',     imageUrl: '/images/tarot-cards/s11.jpg', suit: 'swords',  number: 11 },
  { id: 61, name: 'Knight of Swords',   imageUrl: '/images/tarot-cards/s12.jpg', suit: 'swords',  number: 12 },
  { id: 62, name: 'Queen of Swords',    imageUrl: '/images/tarot-cards/s13.jpg', suit: 'swords',  number: 13 },
  { id: 63, name: 'King of Swords',     imageUrl: '/images/tarot-cards/s14.jpg', suit: 'swords',  number: 14 },
  { id: 64, name: 'Ace of Pentacles',   imageUrl: '/images/tarot-cards/p01.jpg', suit: 'pentacles', number: 1  },
  { id: 65, name: 'Two of Pentacles',   imageUrl: '/images/tarot-cards/p02.jpg', suit: 'pentacles', number: 2  },
  { id: 66, name: 'Three of Pentacles', imageUrl: '/images/tarot-cards/p03.jpg', suit: 'pentacles', number: 3  },
  { id: 67, name: 'Four of Pentacles',  imageUrl: '/images/tarot-cards/p04.jpg', suit: 'pentacles', number: 4  },
  { id: 68, name: 'Five of Pentacles',  imageUrl: '/images/tarot-cards/p05.jpg', suit: 'pentacles', number: 5  },
  { id: 69, name: 'Six of Pentacles',   imageUrl: '/images/tarot-cards/p06.jpg', suit: 'pentacles', number: 6  },
  { id: 70, name: 'Seven of Pentacles', imageUrl: '/images/tarot-cards/p07.jpg', suit: 'pentacles', number: 7  },
  { id: 71, name: 'Eight of Pentacles', imageUrl: '/images/tarot-cards/p08.jpg', suit: 'pentacles', number: 8  },
  { id: 72, name: 'Nine of Pentacles',  imageUrl: '/images/tarot-cards/p09.jpg', suit: 'pentacles', number: 9  },
  { id: 73, name: 'Ten of Pentacles',   imageUrl: '/images/tarot-cards/p10.jpg', suit: 'pentacles', number: 10 },
  { id: 74, name: 'Page of Pentacles',  imageUrl: '/images/tarot-cards/p11.jpg', suit: 'pentacles', number: 11 },
  { id: 75, name: 'Knight of Pentacles',imageUrl: '/images/tarot-cards/p12.jpg', suit: 'pentacles', number: 12 },
  { id: 76, name: 'Queen of Pentacles', imageUrl: '/images/tarot-cards/p13.jpg', suit: 'pentacles', number: 13 },
  { id: 77, name: 'King of Pentacles',  imageUrl: '/images/tarot-cards/p14.jpg', suit: 'pentacles', number: 14 },
];

// ─── Guidance ──────────────────────────────────────────────────────────────────

type GK =
  | 'cam-load' | 'cam-err' | 'no-hand'
  | 'hover-deck' | 'hovering' | 'dragging'
  | 'mouse-shuffle' | 'mouse-fan' | 'mouse-pick'
  | 'all-drawn' | 'gesture-ready';

type GuideEntry = { main: string; sub: string };
type GuideLang  = Record<GK, GuideEntry>;

const GUIDE: Record<'zh' | 'en', GuideLang> = {
  zh: {
    'cam-load':      { main: '正在启动摄像头',    sub: '手部追踪加载中…'             },
    'cam-err':       { main: '摄像头不可用',      sub: '请检查摄像头权限'             },
    'no-hand':       { main: '请将手放在画面中',  sub: '张开手掌，对准摄像头'         },
    'hover-deck':    { main: '移到一张牌上方',    sub: '食指指向你想选的牌'           },
    'hovering':      { main: '捏合抽牌',          sub: '拇指与食指靠拢'               },
    'dragging':      { main: '拖到槽位',          sub: '在槽位上方松开手指放置牌'     },
    'mouse-shuffle': { main: '洗牌中…',           sub: '正在准备牌组'                 },
    'mouse-fan':     { main: '点击展开',          sub: '将牌展开成扇形'               },
    'mouse-pick':    { main: '抽一张牌',          sub: '点击任意一张牌放入槽位'       },
    'all-drawn':     { main: '牌已抽完',          sub: '点击「开始解读」继续'         },
    'gesture-ready': { main: '捏合进入解读',      sub: '在屏幕中央区域捏合手指'       },
  },
  en: {
    'cam-load':      { main: 'Setting up camera',    sub: 'Loading hand detection…'                 },
    'cam-err':       { main: 'Camera unavailable',   sub: 'Please check camera permissions'         },
    'no-hand':       { main: 'Show your hand',       sub: 'Hold your open palm toward the camera'   },
    'hover-deck':    { main: 'Move over a card',     sub: 'Your index finger selects which card'    },
    'hovering':      { main: 'Pinch to draw',        sub: 'Bring thumb and index finger together'   },
    'dragging':      { main: 'Drag to a slot',       sub: 'Open your fingers above a slot to place' },
    'mouse-shuffle': { main: 'Shuffling…',           sub: 'The deck is being prepared'              },
    'mouse-fan':     { main: 'Click to spread',      sub: 'Open the cards into a fan'               },
    'mouse-pick':    { main: 'Draw a card',          sub: 'Click any card to place it in a slot'    },
    'all-drawn':     { main: 'All cards drawn',      sub: 'Tap "Begin Reading" to continue'         },
    'gesture-ready': { main: 'Pinch to enter',       sub: 'Pinch your fingers in the center area'   },
  },
};

function LargeGuidance({ gk, lang }: { gk: GK | null; lang: 'zh' | 'en' }) {
  const c = gk ? GUIDE[lang][gk] : null;
  return (
    <div className="flex h-[80px] items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {c && (
          <motion.div
            key={gk}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={   { opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="text-center px-6"
          >
            <p className="text-[17px] font-semibold leading-tight tracking-tight text-white drop-shadow-lg">
              {c.main}
            </p>
            <p className="mt-1.5 text-[11px] text-white/50 leading-snug">{c.sub}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PlacedCard extends Face { revealed: boolean; }

type ArcCard = {
  id: number; offset: { x: number; y: number };
  rotation: number; zIndex: number;
};

// Tinkerbell pixie-dust particle — all white stars
type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  size: number;
  rotation: number;      // current star rotation angle
  rotationSpeed: number; // spin per frame
  phase: number;         // twinkle phase offset
};

// ─── Château du Tarot background elements ──────────────────────────────────────

function TinyStarSvg({ opacity, size }: { opacity: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 0.5 L7.7 5.3 L12.5 7 L7.7 8.7 L7 13.5 L6.3 8.7 L1.5 7 L6.3 5.3 Z"
        fill={`rgba(255,255,255,${opacity})`}
      />
    </svg>
  );
}

function ChateauBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Thin outer border frame */}
      <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(255,255,255,0.055)' }} />

      {/* Corner L-ornaments */}
      <svg className="absolute top-[14px] left-[14px]" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M5,31 L5,5 L31,5" stroke="rgba(255,255,255,0.11)" strokeWidth="0.7" />
      </svg>
      <svg className="absolute top-[14px] right-[14px]" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M5,5 L31,5 L31,31" stroke="rgba(255,255,255,0.11)" strokeWidth="0.7" />
      </svg>
      <svg className="absolute bottom-[14px] left-[14px]" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M5,5 L5,31 L31,31" stroke="rgba(255,255,255,0.11)" strokeWidth="0.7" />
      </svg>
      <svg className="absolute bottom-[14px] right-[14px]" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M31,5 L31,31 L5,31" stroke="rgba(255,255,255,0.11)" strokeWidth="0.7" />
      </svg>

      {/* Stars — scattered at atmospheric positions */}
      <div style={{ position: 'absolute', top: '7%',  left: '50%', transform: 'translateX(-50%)' }}><TinyStarSvg opacity={0.18} size={13} /></div>
      <div style={{ position: 'absolute', top: '22%', left: '10%' }}><TinyStarSvg opacity={0.08} size={7} /></div>
      <div style={{ position: 'absolute', top: '19%', right: '10%' }}><TinyStarSvg opacity={0.08} size={7} /></div>
      <div style={{ position: 'absolute', top: '44%', left: '4%'  }}><TinyStarSvg opacity={0.09} size={9} /></div>
      <div style={{ position: 'absolute', top: '40%', right: '4%' }}><TinyStarSvg opacity={0.09} size={9} /></div>
      <div style={{ position: 'absolute', bottom: '22%', left: '9%'  }}><TinyStarSvg opacity={0.07} size={6} /></div>
      <div style={{ position: 'absolute', bottom: '19%', right: '9%' }}><TinyStarSvg opacity={0.07} size={6} /></div>
      <div style={{ position: 'absolute', bottom: '7%', left: '50%', transform: 'translateX(-50%)' }}><TinyStarSvg opacity={0.11} size={10} /></div>

      {/* Very faint horizontal rules at thirds — structural depth */}
      <div style={{ position: 'absolute', top: '33%', left: 14, right: 14, height: 1, background: 'rgba(255,255,255,0.025)' }} />
      <div style={{ position: 'absolute', top: '67%', left: 14, right: 14, height: 1, background: 'rgba(255,255,255,0.025)' }} />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function RitualPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const spread    = (searchParams.get('spread') as SpreadType) ?? 'single';
  const question  = searchParams.get('question') ?? '';
  const lang      = (searchParams.get('lang') as 'zh' | 'en') ?? 'zh';
  const cardCount = getCardCount(spread);
  const labels    = getLabels(spread, lang);

  // ── interaction mode ────────────────────────────────────────────────────────
  const [interactionMode, setInteractionMode] = useState<'gesture' | 'mouse' | null>(null);
  const [handControlEnabled, setHandControlEnabled] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false); // stable guard for rAF loop + handleStartReading

  // ── shared placed cards ─────────────────────────────────────────────────────
  const [placed, setPlaced] = useState<(PlacedCard | null)[]>(Array(cardCount).fill(null));
  const placedRef  = useRef<(PlacedCard | null)[]>(Array(cardCount).fill(null));
  const usedIdsRef = useRef(new Set<number>());
  useEffect(() => { placedRef.current = placed; }, [placed]);

  // ── gesture-mode hover / drag ───────────────────────────────────────────────
  const [hoverIdx,    setHoverIdx]    = useState<number | null>(null);
  const [dragIdx,     setDragIdx]     = useState<number | null>(null);
  const [mouseHoverId, setMouseHoverId] = useState<number | null>(null);
  const hoverIdxRef    = useRef<number | null>(null);
  const dragIdxRef     = useRef<number | null>(null);
  const deckCardRefs   = useRef<(HTMLElement | null)[]>(Array(GESTURE_DECK_N).fill(null));

  // ── mouse-mode arc fan ──────────────────────────────────────────────────────
  const [arcCards,     setArcCards]     = useState<ArcCard[]>(() =>
    TAROT_CARDS.map((c, i) => ({ id: c.id, offset: { x: 0, y: 0 }, rotation: 0, zIndex: DECK_N - i }))
  );
  const [isShuffling,  setIsShuffling]  = useState(false);
  const [isShuffled,   setIsShuffled]   = useState(false);
  const [awaitingFan,  setAwaitingFan]  = useState(false);
  const [arcAnimMs,    setArcAnimMs]    = useState(D1);
  const arcContainerRef = useRef<HTMLDivElement>(null);
  const isShufflingRef  = useRef(false);
  const isShuffledRef   = useRef(false);
  const awaitingFanRef  = useRef(false);
  useEffect(() => { isShufflingRef.current = isShuffling; }, [isShuffling]);
  useEffect(() => { isShuffledRef.current  = isShuffled;  }, [isShuffled]);
  useEffect(() => { awaitingFanRef.current = awaitingFan; }, [awaitingFan]);

  // ── card detail overlay ─────────────────────────────────────────────────────
  const { openFace, setOpenFace } = useCardPreview();

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const deckRef       = useRef<HTMLDivElement>(null);
  const handCursorRef = useRef<HTMLDivElement>(null);
  const dragFloatRef  = useRef<HTMLDivElement>(null);

  // ── stable refs for rAF loop access ────────────────────────────────────────
  const allDrawnRef        = useRef(false);
  const startReadingFnRef  = useRef<() => void>(() => {});

  // ── particle system (Tinkerbell white stars) ────────────────────────────────
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef      = useRef<Particle[]>([]);
  const emitRef = useRef({
    trail: (_x: number, _y: number) => {},
    spark: (_x: number, _y: number, _n?: number) => {},
  });

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Pixie-dust trail: white twinkling stars that drift and fall
    emitRef.current.trail = (x, y) => {
      if (particlesRef.current.length > 200) return;
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 2.2,
          vy: -(Math.random() * 1.8 + 0.3),
          life: 1,
          size: Math.random() * 5 + 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Burst: white stars explode outward
    emitRef.current.spark = (x, y, n = 12) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          life: 1,
          size: Math.random() * 8 + 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Draw a 4-pointed star (Tinkerbell shape)
    const drawStar = (cx: number, cy: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a      = (i / 8) * Math.PI * 2 + rot;
        const radius = i % 2 === 0 ? r : r * 0.28;
        const px     = cx + Math.cos(a) * radius;
        const py     = cy + Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      particlesRef.current = particlesRef.current.filter(p => p.life > 0.01);

      ctx.fillStyle   = 'white';
      ctx.shadowColor = 'rgba(255,255,255,0.85)';

      for (const p of particlesRef.current) {
        p.x        += p.vx;
        p.y        += p.vy;
        p.vy       += 0.055;
        p.vx       *= 0.98;
        p.rotation += p.rotationSpeed;
        p.life     -= 0.022;

        const r         = Math.max(0.1, p.size * Math.sqrt(p.life));
        const twinkle   = 0.65 + 0.35 * Math.sin(now * 0.006 + p.phase);
        ctx.shadowBlur  = r * 2.5;
        ctx.globalAlpha = Math.max(0, p.life) * twinkle;
        drawStar(p.x, p.y, r, p.rotation);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── hand frame ──────────────────────────────────────────────────────────────
  const handFrameRef = useRef<{
    hasHand: boolean;
    landmarks: Array<{ x: number; y: number; z: number }> | null;
  } | null>(null);

  const onHandFrame = useCallback(
    (p: { hasHand: boolean; landmarks: Array<{ x: number; y: number; z: number }> | null }) => {
      handFrameRef.current = p;
    }, []
  );
  const videoConstraints = useMemo<MediaTrackConstraints>(
    () => ({ width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' as const }), []
  );
  const { videoRef, error: camError, isLoading, isHandVisible } = useHandGesture({
    enabled: handControlEnabled, onHandFrame, videoConstraints,
  });

  // ── gesture loop refs ───────────────────────────────────────────────────────
  const wasPinchRef        = useRef(false);
  const pinchLatch         = useRef(false);
  const startFiredRef      = useRef(false); // prevents re-firing within one continuous pinch
  const smoothX            = useRef(0);
  const smoothY            = useRef(0);
  const smoothInit         = useRef(false);
  const lastValidHoverRef  = useRef<number | null>(null); // last card hovered — used for pinch grab

  // ── deal a random face ──────────────────────────────────────────────────────
  const dealFace = useCallback((): PlacedCard | null => {
    const pool = TAROT_CARDS.filter(c => !usedIdsRef.current.has(c.id));
    if (!pool.length) return null;
    const pick        = pool[Math.floor(Math.random() * pool.length)]!;
    const orientation = (Math.random() > 0.5 ? 'upright' : 'reversed') as Face['orientation'];
    usedIdsRef.current.add(pick.id);
    return { id: pick.id, name: pick.name, imageUrl: pick.imageUrl, orientation, revealed: false };
  }, []);

  // ── place random card (gesture) ─────────────────────────────────────────────
  const placeCard = useCallback((slotIdx: number) => {
    if (placedRef.current[slotIdx] !== null) return;
    const card = dealFace();
    if (!card) return;
    const next = [...placedRef.current];
    next[slotIdx] = card;
    placedRef.current = next;
    setPlaced([...next]);
    setTimeout(() => setPlaced(prev => {
      const c = [...prev];
      if (c[slotIdx]) c[slotIdx] = { ...c[slotIdx]!, revealed: true };
      return c;
    }), REVEAL_MS);
  }, [dealFace]);

  // ── place specific card (mouse — the clicked card is what reveals) ───────────
  const placeCardById = useCallback((slotIdx: number, cardId: number) => {
    if (placedRef.current[slotIdx] !== null) return;
    if (usedIdsRef.current.has(cardId)) return;
    const tc = TAROT_CARDS.find(c => c.id === cardId);
    if (!tc) return;
    const orientation = (Math.random() > 0.5 ? 'upright' : 'reversed') as Face['orientation'];
    usedIdsRef.current.add(cardId);
    const card: PlacedCard = { id: tc.id, name: tc.name, imageUrl: tc.imageUrl, orientation, revealed: false };
    const next = [...placedRef.current];
    next[slotIdx] = card;
    placedRef.current = next;
    setPlaced([...next]);
    setTimeout(() => setPlaced(prev => {
      const c = [...prev];
      if (c[slotIdx]) c[slotIdx] = { ...c[slotIdx]!, revealed: true };
      return c;
    }), REVEAL_MS);
  }, []);

  const nextEmpty = useCallback((): number | null => {
    for (let i = 0; i < cardCount; i++) if (!placedRef.current[i]) return i;
    return null;
  }, [cardCount]);

  const pickSlot = useCallback((cx: number, cy: number): number | null => {
    const els = document.querySelectorAll<HTMLElement>('[data-slot]');
    for (const el of Array.from(els)) {
      const r = el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom)
        return Number(el.dataset.slot);
    }
    return null;
  }, []);

  const pickDeckIdx = useCallback((cx: number, cy: number): number | null => {
    const el = deckRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // Generous vertical tolerance so cursor near bottom edge still counts
    if (cx < r.left || cx > r.right || cy < r.top - 20 || cy > r.bottom + 20) return null;
    // Snap to nearest card center rather than pure linear interpolation
    const n       = GESTURE_DECK_N;
    const spacing = (r.width - CARD_W) / (n - 1);
    const idx     = Math.round((cx - r.left - CARD_W / 2) / spacing);
    return Math.max(0, Math.min(n - 1, idx));
  }, []);

  // ── arc layout (300° fan) ───────────────────────────────────────────────────
  const layoutOnArc = useCallback((cards: ArcCard[], container: HTMLElement): ArcCard[] => {
    const rect      = container.getBoundingClientRect();
    // Radius sized so the tallest card doesn't overflow the container height
    const R         = Math.max(80, Math.min(rect.width * 0.33, rect.height * 0.52));
    const n         = cards.length;
    // 160° upward-only fan — no cards dip below the pivot point
    const spreadDeg = 160;
    const centerDeg = -90; // pointing straight up
    const start     = centerDeg - spreadDeg / 2;
    return cards.map((c, i) => {
      const t   = n <= 1 ? 0.5 : i / (n - 1);
      const deg = start + t * spreadDeg;
      const rad = (deg * Math.PI) / 180;
      return {
        ...c,
        offset:   { x: R * Math.cos(rad) + 10, y: R * Math.sin(rad) },
        rotation: deg + 90,
        zIndex:   n - i,
      };
    });
  }, []);

  // ── mouse shuffle ───────────────────────────────────────────────────────────
  const shuffleCards = useCallback(() => {
    if (isShufflingRef.current) return;
    isShufflingRef.current = true;
    setIsShuffling(true); setIsShuffled(false);
    setAwaitingFan(false); awaitingFanRef.current = false;

    setArcAnimMs(D1);
    setArcCards(prev => prev.map(c => ({
      ...c,
      offset:   { x: (Math.random() - 0.5) * 280, y: (Math.random() - 0.5) * 170 },
      rotation: (Math.random() - 0.5) * 60,
    })));
    setTimeout(() => {
      setArcAnimMs(D2);
      setArcCards(prev => prev.map((c, i) => ({
        ...c,
        offset:   { x: (i - DECK_N / 2) * 0.5, y: (Math.random() - 0.5) * 12 },
        rotation: (Math.random() - 0.5) * 10,
      })));
    }, D1);
    setTimeout(() => {
      isShufflingRef.current = false; setIsShuffling(false);
      awaitingFanRef.current = true;  setAwaitingFan(true);
    }, D1 + D2);
  }, []);

  // ── complete fan spread ─────────────────────────────────────────────────────
  const completeFanSpread = useCallback(() => {
    const el = arcContainerRef.current;
    if (!el) return;
    awaitingFanRef.current = false; setAwaitingFan(false);
    setArcAnimMs(D3);
    setArcCards(prev => layoutOnArc(prev, el));
    setTimeout(() => { isShuffledRef.current = true; setIsShuffled(true); }, D3);
  }, [layoutOnArc]);

  // ── mouse card click ────────────────────────────────────────────────────────
  const handleCardClick = useCallback((cardId: number, ex: number, ey: number) => {
    emitRef.current.spark(ex, ey, 20);
    if (isShufflingRef.current) return;
    if (awaitingFanRef.current) { completeFanSpread(); return; }
    if (!isShuffledRef.current) { shuffleCards(); return; }
    const slot = nextEmpty();
    if (slot === null) return;
    placeCardById(slot, cardId);
    setArcCards(prev => prev.filter(c => c.id !== cardId));
  }, [completeFanSpread, shuffleCards, nextEmpty, placeCardById]);

  // ── mode-change side-effects ────────────────────────────────────────────────
  useEffect(() => {
    if (interactionMode === null) return;
    setHandControlEnabled(interactionMode === 'gesture');
    if (interactionMode === 'mouse') {
      setArcCards(TAROT_CARDS.map((c, i) => ({ id: c.id, offset: { x: 0, y: 0 }, rotation: 0, zIndex: DECK_N - i })));
      setIsShuffled(false); setIsShuffling(false); setAwaitingFan(false);
      isShufflingRef.current = false; isShuffledRef.current = false; awaitingFanRef.current = false;
      setTimeout(() => shuffleCards(), 350);
    }
  }, [interactionMode, shuffleCards]);

  // ── auto-fan: when shuffle finishes, open the fan without user click ────────
  useEffect(() => {
    if (!awaitingFan) return;
    const t = setTimeout(() => completeFanSpread(), 400);
    return () => clearTimeout(t);
  }, [awaitingFan, completeFanSpread]);

  // ── rAF gesture loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!handControlEnabled) {
      pinchLatch.current = false; wasPinchRef.current = false; smoothInit.current = false;
      dragIdxRef.current = null;  hoverIdxRef.current = null; lastValidHoverRef.current = null;
      setDragIdx(null); setHoverIdx(null);
      const cEl = handCursorRef.current;
      if (cEl) cEl.style.opacity = '0';
      return;
    }

    let raf = 0;
    const d2 = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const loop = () => {
      const fr = handFrameRef.current;

      if (!fr?.hasHand || !fr.landmarks?.length) {
        pinchLatch.current = false; wasPinchRef.current = false; smoothInit.current = false;
        if (dragIdxRef.current !== null) {
          const el = deckCardRefs.current[dragIdxRef.current];
          if (el) { el.style.transform = ''; el.style.zIndex = String(GESTURE_DECK_N - dragIdxRef.current); el.style.opacity = ''; }
          dragIdxRef.current = null; setDragIdx(null);
        }
        if (hoverIdxRef.current !== null) {
          const el = deckCardRefs.current[hoverIdxRef.current];
          if (el) { el.style.transform = ''; el.style.zIndex = String(GESTURE_DECK_N - hoverIdxRef.current); el.style.animation = ''; }
          hoverIdxRef.current = null; setHoverIdx(null);
        }
        lastValidHoverRef.current = null;
        const cEl = handCursorRef.current;
        if (cEl) cEl.style.opacity = '0';
        const dEl = dragFloatRef.current;
        if (dEl) dEl.style.opacity = '0';
        raf = requestAnimationFrame(loop);
        return;
      }

      const lm = fr.landmarks;
      const ix = lm[IDX_TIP]!;
      const th = lm[THUMB_TIP]!;

      // Mirror X; Y × 1.25 so deck is reachable without hand at camera bottom
      const rawX = (1 - ix.x) * window.innerWidth;
      const rawY = Math.min(ix.y * window.innerHeight * 1.25, window.innerHeight);

      // Adaptive EMA: instant when moving fast, light smoothing when slow
      if (!smoothInit.current) {
        smoothX.current = rawX; smoothY.current = rawY; smoothInit.current = true;
      } else {
        const vel   = Math.hypot(rawX - smoothX.current, rawY - smoothY.current);
        const alpha = Math.min(1.0, 0.28 + vel / 120);
        smoothX.current = smoothX.current * (1 - alpha) + rawX * alpha;
        smoothY.current = smoothY.current * (1 - alpha) + rawY * alpha;
      }
      const smx = smoothX.current;
      const smy = smoothY.current;

      // Pinch hysteresis
      const dp = d2(ix, th);
      if (pinchLatch.current) { if (dp >= PINCH_OFF) pinchLatch.current = false; }
      else                    { if (dp <= PINCH_ON)  pinchLatch.current = true;  }
      const pinching = pinchLatch.current;

      // Tinkerbell star cursor — GPU-composited via transform
      const cEl = handCursorRef.current;
      if (cEl) {
        cEl.style.opacity   = '1';
        // Center the 34px star on the fingertip; shrink when pinching
        cEl.style.transform = `translate(${smx - 17}px,${smy - 17}px) scale(${pinching ? 0.55 : 1})`;
      }

      // Tinkerbell pixie-dust trail
      emitRef.current.trail(smx, smy);

      let handledByUI = false;

      // Reset one-shot guard when fingers fully open
      if (!pinching) startFiredRef.current = false;

      // Spark burst on pinch start (rising edge only — visual feedback)
      if (pinching && !wasPinchRef.current) {
        emitRef.current.spark(smx, smy, 20);
      }

      // Start reading: fire on any active pinch in the center zone (no button needed).
      // Zone = middle 80% width × middle 70% height of the screen.
      if (allDrawnRef.current && pinching && !startFiredRef.current) {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const inZone = Math.abs(smx - cx) < window.innerWidth  * 0.40 &&
                       Math.abs(smy - cy) < window.innerHeight * 0.35;
        if (inZone) {
          startFiredRef.current = true;
          startReadingFnRef.current();
          handledByUI = true;
        }
      }

      if (!handledByUI) {
        if (dragIdxRef.current !== null) {
          // Float card follows raw finger position (no EMA lag during drag)
          const dEl = dragFloatRef.current;
          if (dEl) { dEl.style.left = `${rawX - 36}px`; dEl.style.top = `${rawY - 58}px`; }

          // White sparkle trail from dragged card
          if (particlesRef.current.length < 150) {
            particlesRef.current.push({
              x: rawX + (Math.random() - 0.5) * 18,
              y: rawY + CARD_H / 2,
              vx: (Math.random() - 0.5) * 2.5,
              vy: -(Math.random() * 3 + 1),
              life: 1, size: Math.random() * 4 + 2,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.18,
              phase: Math.random() * Math.PI * 2,
            });
          }

          // Release → drop into slot (try cursor pos first, fallback to next empty slot)
          if (!pinching && wasPinchRef.current) {
            emitRef.current.spark(rawX, rawY, 16);
            const slotIdx = pickSlot(rawX, rawY) ?? nextEmpty();
            if (slotIdx !== null) placeCard(slotIdx);
            const drIdx = dragIdxRef.current;
            if (drIdx !== null) {
              const el = deckCardRefs.current[drIdx];
              if (el) { el.style.transform = ''; el.style.zIndex = String(GESTURE_DECK_N - drIdx); el.style.opacity = ''; }
            }
            dragIdxRef.current = null; setDragIdx(null);
            lastValidHoverRef.current = null;
            if (dEl) dEl.style.opacity = '0';
          }
        } else {
          // Hover detection — DOM only, no React state re-renders for visual
          const hi = pickDeckIdx(smx, smy);

          // Track last valid hover separately — used for pinch grab so finger-tip shift during
          // pinch doesn't cause hi=null and silently fail the grab
          if (hi !== null) lastValidHoverRef.current = hi;
          else if (!pinching) lastValidHoverRef.current = null; // only clear when not mid-pinch

          if (hi !== hoverIdxRef.current) {
            // Reset previous hover via DOM
            if (hoverIdxRef.current !== null) {
              const old = deckCardRefs.current[hoverIdxRef.current];
              if (old) { old.style.transform = ''; old.style.zIndex = String(GESTURE_DECK_N - hoverIdxRef.current); old.style.animation = ''; }
            }
            // Apply new hover via DOM
            if (hi !== null) {
              const el = deckRef.current;
              if (el) {
                const r      = el.getBoundingClientRect();
                const spacing = (r.width - CARD_W) / (GESTURE_DECK_N - 1);
                const cardCX = r.left + hi * spacing + CARD_W / 2;
                const cardCY = r.top  + CARD_H / 2;
                emitRef.current.spark(cardCX, cardCY, 12);
              }
              const newEl = deckCardRefs.current[hi];
              if (newEl) {
                newEl.style.transform = 'translateY(-36px) scale(1.08)';
                newEl.style.zIndex    = '30';
                newEl.style.animation = 'gestureCardSelected 1.2s ease-in-out infinite';
              }
            }
            hoverIdxRef.current = hi;
            setHoverIdx(hi); // guidance text only — no deck re-render
          }

          // Pinch → grab: use lastValidHoverRef so finger-tip shift during pinch doesn't break it
          const grabTarget = lastValidHoverRef.current;
          if (pinching && !wasPinchRef.current && grabTarget !== null && nextEmpty() !== null) {
            // Reset any animation on the grabbed card
            const grabEl = deckCardRefs.current[grabTarget];
            if (grabEl) {
              grabEl.style.animation = '';
              grabEl.style.transform = 'translateY(-100px) scale(1.12)';
              grabEl.style.opacity   = '0.35';
            }
            dragIdxRef.current = grabTarget; setDragIdx(grabTarget);
            hoverIdxRef.current = null; setHoverIdx(null);
            const dEl = dragFloatRef.current;
            if (dEl) dEl.style.opacity = '1';
          }
        }
      }

      wasPinchRef.current = pinching;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [handControlEnabled, placeCard, nextEmpty, pickDeckIdx, pickSlot]);

  // ── guidance key ────────────────────────────────────────────────────────────
  const gk = useMemo<GK | null>(() => {
    if (placed.every(c => c !== null))
      return interactionMode === 'gesture' ? 'gesture-ready' : 'all-drawn';
    if (interactionMode === 'gesture') {
      if (isLoading)          return 'cam-load';
      if (camError)           return 'cam-err';
      if (!isHandVisible)     return 'no-hand';
      if (dragIdx !== null)   return 'dragging';
      if (hoverIdx !== null)  return 'hovering';
      return 'hover-deck';
    }
    if (interactionMode === 'mouse') {
      if (isShuffling) return 'mouse-shuffle';
      if (awaitingFan) return 'mouse-fan';
      if (isShuffled)  return 'mouse-pick';
      return null;
    }
    return null;
  }, [interactionMode, isLoading, camError, isHandVisible,
      dragIdx, hoverIdx, placed, isShuffling, awaitingFan, isShuffled]);

  const allDrawn = placed.every(c => c !== null);

  // ── start reading ───────────────────────────────────────────────────────────
  const handleStartReading = useCallback(() => {
    if (!allDrawnRef.current) return;
    if (isStartingRef.current) return; // prevent double-fire
    isStartingRef.current = true;
    setIsStarting(true);

    const positions = getLabels(spread, lang);
    const cards = placed
      .map((c, i) => {
        if (!c) return null;
        const td = TAROT_CARDS.find(t => t.id === c.id);
        return {
          name: c.name, orientation: c.orientation,
          position: positions[i],
          suit: td?.suit ?? 'major', number: td?.number ?? c.id,
          keywords: ['直觉', '选择', '变化'],
        };
      })
      .filter(Boolean);
    sessionStorage.setItem('drawResult', JSON.stringify({ spread, cards }));
    // Delay navigation so the fade-to-black overlay is visible
    setTimeout(() => {
      router.push(`/loading?${new URLSearchParams({ fromRitual: 'true', spread, question, lang }).toString()}`);
    }, 650);
  }, [placed, spread, question, router]);

  // Keep stable refs in sync with latest values (used by rAF loop)
  useEffect(() => { allDrawnRef.current       = allDrawn;          }, [allDrawn]);
  useEffect(() => { startReadingFnRef.current = handleStartReading;}, [handleStartReading]);

  // ── auto-proceed when all cards placed ─────────────────────────────────────
  useEffect(() => {
    if (!allDrawn) return;
    // Small delay so user sees the last card snap into place
    const t = setTimeout(() => handleStartReading(), 900);
    return () => clearTimeout(t);
  }, [allDrawn, handleStartReading]);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ background: '#000', minHeight: '100dvh', cursor: handControlEnabled ? 'none' : undefined }}
    >
      <style>{`
        @keyframes gestureCardSelected {
          0%, 100% { box-shadow: 0 0 0 2px rgba(255,255,255,0.85), 0 8px 28px rgba(255,255,255,0.3); }
          50%       { box-shadow: 0 0 0 3px rgba(255,255,255,1),    0 12px 44px rgba(255,255,255,0.55), 0 0 0 8px rgba(255,255,255,0.12); }
        }
        @keyframes tinkerbellSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes tinkerbellPulse {
          0%, 100% { opacity: 1;    filter: drop-shadow(0 0 5px rgba(255,255,255,1)) drop-shadow(0 0 12px rgba(255,255,255,0.6)); }
          50%      { opacity: 0.75; filter: drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 20px rgba(255,255,255,0.85)); }
        }
      `}</style>
      {/* Château du Tarot decorative layer */}
      <ChateauBackground />

      {/* Confirmation overlay — fades to black when start reading fires */}
      <AnimatePresence>
        {isStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[200] pointer-events-none flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="flex flex-col items-center gap-3"
            >
              <TinyStarSvg opacity={0.6} size={18} />
              <p
                className="text-[10px] text-white/55 tracking-[0.4em] uppercase"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Entering the reading
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle canvas — above deck cards, below cursor */}
      <canvas ref={particleCanvasRef} className="pointer-events-none fixed inset-0 z-[80]" aria-hidden />

      {/* Mode select overlay */}
      {interactionMode === null && <ModeSelectOverlay onSelect={setInteractionMode} language={lang} />}

      {/* Hidden camera */}
      <video ref={videoRef} className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0" playsInline muted aria-hidden />

      {/* Tinkerbell star cursor */}
      {handControlEnabled && (
        <div
          ref={handCursorRef}
          className="pointer-events-none fixed z-[90] opacity-0"
          style={{ left: 0, top: 0, width: 34, height: 34, willChange: 'transform,opacity' }}
          aria-hidden
        >
          <svg
            width="34" height="34" viewBox="0 0 14 14" fill="none"
            style={{ animation: 'tinkerbellSpin 3.5s linear infinite, tinkerbellPulse 2s ease-in-out infinite' }}
          >
            <path
              d="M7 0.5 L7.7 5.3 L12.5 7 L7.7 8.7 L7 13.5 L6.3 8.7 L1.5 7 L6.3 5.3 Z"
              fill="white"
            />
          </svg>
        </div>
      )}

      {/* Floating card while dragging */}
      <div
        ref={dragFloatRef}
        className="pointer-events-none fixed z-[95] rounded-xl overflow-hidden opacity-0 shadow-2xl ring-2 ring-white/40"
        style={{
          left: 0, top: 0, width: CARD_W, height: CARD_H, willChange: 'left,top',
          filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.5))',
        }}
        aria-hidden
      >
        <img src="/images/tarot-cards/cardback.png" alt="" className="w-full h-full object-cover" draggable={false} />
      </div>

      {/* All content above dim overlay */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Header */}
        <header className="shrink-0 px-5 py-4 flex items-center justify-between relative z-[50]">
          <button
            onClick={() => router.push(`/start?spread=${spread}&question=${encodeURIComponent(question)}`)}
            className="p-2 -ml-2 rounded" aria-label="返回"
          >
            <img src="/black_arrow.png" alt="返回" className="h-6 w-6 invert opacity-80" />
          </button>
          <h1 className="text-base font-semibold text-white/90">
            {lang === 'zh' ? '抽牌仪式' : 'Card Drawing'}
          </h1>
          {interactionMode !== null && (
            <button
              onClick={() => setInteractionMode(null)}
              className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px] text-white/60"
            >
              {lang === 'zh'
                ? (interactionMode === 'gesture' ? '手势模式' : '鼠标模式')
                : (interactionMode === 'gesture' ? 'Gesture' : 'Mouse')}
            </button>
          )}
        </header>

        {/* Card slots — z-[50] so arc cards can't float above them */}
        <div className="shrink-0 px-4 pt-1 relative z-[50]">
          <div className={`flex justify-center ${cardCount <= 3 ? 'gap-5' : 'flex-wrap gap-3'}`}>
            {Array.from({ length: cardCount }, (_, i) => {
              const p = placed[i];
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    data-slot={i}
                    className="relative overflow-hidden rounded-xl"
                    style={{
                      width: CARD_W, height: CARD_H,
                      border: p
                        ? '2px solid rgba(255,255,255,0.4)'
                        : dragIdx !== null
                        ? '2px solid rgba(255,255,255,0.35)'
                        : '2px dashed rgba(255,255,255,0.20)',
                      boxShadow: p ? '0 0 24px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.4)' : undefined,
                    }}
                  >
                    {p ? (
                      <div className="w-full h-full" style={{ perspective: 900 }}>
                        <motion.div
                          className="w-full h-full relative"
                          initial={false}
                          animate={{ rotateY: p.revealed ? 180 : 0 }}
                          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <div className="absolute inset-0 rounded-xl overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
                            <img src="/images/tarot-cards/cardback.png" alt="" className="w-full h-full object-cover" draggable={false} />
                          </div>
                          <div
                            className="absolute inset-0 rounded-xl overflow-hidden bg-white flex items-center justify-center p-0.5 cursor-pointer"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            onClick={() => p.revealed && setOpenFace({ id: p.id, name: p.name, imageUrl: p.imageUrl, orientation: p.orientation })}
                          >
                            <img
                              src={p.imageUrl} alt={p.name}
                              className="w-full h-full object-contain rounded-lg"
                              style={{ transform: p.orientation === 'reversed' ? 'rotate(180deg)' : 'none' }}
                              draggable={false}
                            />
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white/20 text-[11px] text-center leading-tight">
                          {dragIdx !== null
                            ? (lang === 'zh' ? '放\n这里' : 'Drop\nhere')
                            : `${i + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-white/45 leading-none">{labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guidance — z-[50] ensures arc cards never cover this */}
        <div className="shrink-0 relative z-[50]">
          {allDrawn ? (
            /* All cards placed — show entering indicator */
            <div className="flex h-[80px] items-center justify-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[14px] text-white/60 tracking-widest"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {lang === 'zh' ? '正在进入解读…' : 'Entering reading…'}
              </motion.p>
            </div>
          ) : (
            <LargeGuidance gk={gk} lang={lang} />
          )}
        </div>

        {/* Gesture mode: 15-card horizontal spread — large enough hit zones for hand tracking */}
        {interactionMode === 'gesture' && (
          <div className="flex-1 flex items-center px-4">
            <div ref={deckRef} className="relative w-full" style={{ height: CARD_H + 52 }}>
              {Array.from({ length: GESTURE_DECK_N }, (_, i) => (
                <div
                  key={i}
                  ref={el => { deckCardRefs.current[i] = el; }}
                  className="absolute select-none"
                  style={{
                    bottom:       0,
                    left:         `calc(${i} * (100% - ${CARD_W}px) / ${GESTURE_DECK_N - 1})`,
                    width:        CARD_W,
                    height:       CARD_H,
                    zIndex:       GESTURE_DECK_N - i,
                    borderRadius: '12px',
                    boxShadow:    '0 4px 12px rgba(0,0,0,0.45)',
                    transition:   'transform 180ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 150ms ease, opacity 150ms ease',
                    willChange:   'transform',
                  }}
                >
                  <div className="w-full h-full rounded-xl overflow-hidden">
                    <img src="/images/tarot-cards/cardback.png" alt="Tarot card" className="w-full h-full object-cover" draggable={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mouse mode: arc fan — overflow-visible so cards fan beyond container bounds */}
        {interactionMode === 'mouse' && (
          <div
            ref={arcContainerRef}
            className="flex-1 relative overflow-visible"
            style={{ zIndex: 10 }}
            onClick={() => {
              if (!isShuffled && !isShuffling && !awaitingFan) shuffleCards();
            }}
          >
            {arcCards.map(card => (
              /* Outer div: arc position only */
              <div
                key={card.id}
                className="absolute"
                style={{
                  left:   '50%',
                  top:    '85%',
                  width:  ARC_CARD_W,
                  height: ARC_CARD_H,
                  transform: `translate3d(${card.offset.x - ARC_CARD_W / 2}px, ${card.offset.y - ARC_CARD_H}px, 0) rotate(${card.rotation}deg)`,
                  transition: `transform ${arcAnimMs}ms ease-in-out`,
                  zIndex: card.zIndex,
                  willChange: 'transform',
                }}
              >
                {/* Inner button: hover via CSS only — zero React re-renders */}
                <button
                  type="button"
                  className="w-full h-full rounded-xl overflow-hidden focus:outline-none"
                  style={{
                    cursor:     isShuffled && !allDrawn ? 'pointer' : 'default',
                    transition: 'transform 100ms ease-out, box-shadow 100ms ease-out',
                  }}
                  onMouseEnter={e => {
                    if (!isShuffled || allDrawn) return;
                    e.currentTarget.style.transform  = 'scale(1.12)';
                    e.currentTarget.style.boxShadow  = '0 0 0 2px rgba(255,255,255,0.85), 0 8px 24px rgba(255,255,255,0.35)';
                    emitRef.current.spark(e.clientX, e.clientY, 12);
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  onClick={e => { e.stopPropagation(); handleCardClick(card.id, e.clientX, e.clientY); }}
                  aria-label="Draw tarot card"
                >
                  <img src="/images/tarot-cards/cardback.png" alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {openFace && <CardDetailOverlay face={openFace} onClose={() => setOpenFace(null)} />}
    </div>
  );
}

export default function RitualPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50" />
      </div>
    }>
      <RitualPageContent />
    </Suspense>
  );
}
