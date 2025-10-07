'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TarotReading, MixedTarotReading } from '@/schemas/reading.schema';
import { Copy, AlertTriangle, Shield } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FlipCard } from '@/components/FlipCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { motion } from 'framer-motion';
import { useCardPreview, Face } from '@/components/useCardPreview';
import { CardDetailOverlay } from '@/components/CardDetailOverlay';
import { saveReadingToHistory } from '@/lib/history';

function ReadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reading, setReading] = useState<TarotReading | MixedTarotReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openFace, setOpenFace } = useCardPreview();

  // 检查是否是新的数据结构
  const isNewFormat = (data: any): data is MixedTarotReading => {
    return data && 'readingResults' in data && Array.isArray(data.readingResults);
  };

  // 卡牌对象到图片文件名的映射函数
  const getCardImagePath = (card: any): string => {
    // 直接使用抽牌页面的原始数据构建图片路径
    const { suit, number, orientation, name } = card;
    
    // 大阿卡纳处理
    if (suit === 'major' || suit === 'Major') {
      const majorArcanaMap: { [key: number]: string } = {
        0: 'the fool.jpg',
        1: 'THE MAGICIAN..jpg',
        2: 'THE HIGH PRIESTESS.jpg',
        3: 'THE EMPRESS..jpg',
        4: 'THE EMPEROR..jpg',
        5: 'THE HIEROPHANT.jpg',
        6: 'THE LOVERS..jpg',
        7: 'THE CHARIOT..jpg',
        8: 'STRENGTH..jpg',
        9: 'THE HERMIT..jpg',
        10: 'WHEEL • FORTUNE.jpg',
        11: 'TUSTICE ..jpg',
        12: 'THE HANGED MAN..jpg',
        13: 'DEATH..jpg',
        14: 'TEMPERANCE..jpg',
        15: 'THE DEVIL •.jpg',
        16: 'THE TOWER..jpg',
        17: 'THE STAR..jpg',
        18: 'THE MOON.jpg',
        19: 'THE SUN.jpg',
        20: 'JUDGEMENT..jpg',
        21: 'THE VYORLD..jpg'
      };
      
      const fileName = majorArcanaMap[number];
      if (fileName) {
        return `/images/tarot-cards/${fileName}`;
      }
    }
    
    // 小阿卡纳处理
    if (suit && number !== undefined) {
      let prefix = '';
      switch (suit.toLowerCase()) {
        case 'cups':
        case '圣杯':
          prefix = 'c';
          break;
        case 'pentacles':
        case '星币':
          prefix = 'p';
          break;
        case 'swords':
        case '宝剑':
          prefix = 's';
          break;
        case 'wands':
        case '权杖':
          prefix = 'w';
          break;
        default:
          // 如果suit不匹配，尝试从name中提取
          const cardName = name || '';
          if (cardName.includes('Cups') || cardName.includes('圣杯')) prefix = 'c';
          else if (cardName.includes('Pentacles') || cardName.includes('星币')) prefix = 'p';
          else if (cardName.includes('Swords') || cardName.includes('宝剑')) prefix = 's';
          else if (cardName.includes('Wands') || cardName.includes('权杖')) prefix = 'w';
          break;
      }
      
      if (prefix) {
        const paddedNumber = number.toString().padStart(2, '0');
        return `/images/tarot-cards/${prefix}${paddedNumber}.jpg`;
      }
    }
    
    // 如果无法从suit和number构建，回退到原来的名称匹配方式
    const cardName = name || '';
    const nameMap: { [key: string]: string } = {
      // 英文名称映射
      'The Fool': 'the fool.jpg',
      'The Magician': 'THE MAGICIAN..jpg',
      'The High Priestess': 'THE HIGH PRIESTESS.jpg',
      'The Empress': 'THE EMPRESS..jpg',
      'The Emperor': 'THE EMPEROR..jpg',
      'The Hierophant': 'THE HIEROPHANT.jpg',
      'The Lovers': 'THE LOVERS..jpg',
      'The Chariot': 'THE CHARIOT..jpg',
      'Strength': 'STRENGTH..jpg',
      'The Hermit': 'THE HERMIT..jpg',
      'Wheel of Fortune': 'WHEEL • FORTUNE.jpg',
      'Justice': 'TUSTICE ..jpg',
      'The Hanged Man': 'THE HANGED MAN..jpg',
      'Death': 'DEATH..jpg',
      'Temperance': 'TEMPERANCE..jpg',
      'The Devil': 'THE DEVIL •.jpg',
      'The Tower': 'THE TOWER..jpg',
      'The Star': 'THE STAR..jpg',
      'The Moon': 'THE MOON.jpg',
      'The Sun': 'THE SUN.jpg',
      'Judgement': 'JUDGEMENT..jpg',
      'The World': 'THE VYORLD..jpg',
      // 小阿卡纳
      'Ace of Cups': 'c01.jpg',
      'Two of Cups': 'c02.jpg',
      'Three of Cups': 'c03.jpg',
      'Four of Cups': 'c04.jpg',
      'Five of Cups': 'c05.jpg',
      'Six of Cups': 'c06.jpg',
      'Seven of Cups': 'c07.jpg',
      'Eight of Cups': 'c08.jpg',
      'Nine of Cups': 'c09.jpg',
      'Ten of Cups': 'c10.jpg',
      'Page of Cups': 'c11.jpg',
      'Knight of Cups': 'c12.jpg',
      'Queen of Cups': 'c13.jpg',
      'King of Cups': 'c14.jpg',
      'Ace of Pentacles': 'p01.jpg',
      'Two of Pentacles': 'p02.jpg',
      'Three of Pentacles': 'p03.jpg',
      'Four of Pentacles': 'p04.jpg',
      'Five of Pentacles': 'p05.jpg',
      'Six of Pentacles': 'p06.jpg',
      'Seven of Pentacles': 'p07.jpg',
      'Eight of Pentacles': 'p08.jpg',
      'Nine of Pentacles': 'p09.jpg',
      'Ten of Pentacles': 'p10.jpg',
      'Page of Pentacles': 'p11.jpg',
      'Knight of Pentacles': 'p12.jpg',
      'Queen of Pentacles': 'p13.jpg',
      'King of Pentacles': 'p14.jpg',
      'Ace of Swords': 's01.jpg',
      'Two of Swords': 's02.jpg',
      'Three of Swords': 's03.jpg',
      'Four of Swords': 's04.jpg',
      'Five of Swords': 's05.jpg',
      'Six of Swords': 's06.jpg',
      'Seven of Swords': 's07.jpg',
      'Eight of Swords': 's08.jpg',
      'Nine of Swords': 's09.jpg',
      'Ten of Swords': 's10.jpg',
      'Page of Swords': 's11.jpg',
      'Knight of Swords': 's12.jpg',
      'Queen of Swords': 's13.jpg',
      'King of Swords': 's14.jpg',
      'Ace of Wands': 'w01.jpg',
      'Two of Wands': 'w02.jpg',
      'Three of Wands': 'w03.jpg',
      'Four of Wands': 'w04.jpg',
      'Five of Wands': 'w05.jpg',
      'Six of Wands': 'w06.jpg',
      'Seven of Wands': 'w07.jpg',
      'Eight of Wands': 'w08.jpg',
      'Nine of Wands': 'w09.jpg',
      'Ten of Wands': 'w10.jpg',
      'Page of Wands': 'w11.jpg',
      'Knight of Wands': 'w12.jpg',
      'Queen of Wands': 'w13.jpg',
      'King of Wands': 'w14.jpg',
      // 中文名称映射
      '测试卡牌': 'the fool.jpg', // 临时映射，用于测试
      '愚者': 'the fool.jpg',
      '魔术师': 'THE MAGICIAN..jpg',
      '女祭司': 'THE HIGH PRIESTESS.jpg',
      '女皇': 'THE EMPRESS..jpg',
      '皇帝': 'THE EMPEROR..jpg',
      '教皇': 'THE HIEROPHANT.jpg',
      '恋人': 'THE LOVERS..jpg',
      '战车': 'THE CHARIOT..jpg',
      '力量': 'STRENGTH..jpg',
      '隐者': 'THE HERMIT..jpg',
      '命运之轮': 'WHEEL • FORTUNE.jpg',
      '正义': 'TUSTICE ..jpg',
      '倒吊人': 'THE HANGED MAN..jpg',
      '死神': 'DEATH..jpg',
      '节制': 'TEMPERANCE..jpg',
      '恶魔': 'THE DEVIL •.jpg',
      '塔': 'THE TOWER..jpg',
      '星星': 'THE STAR..jpg',
      '月亮': 'THE MOON.jpg',
      '太阳': 'THE SUN.jpg',
      '审判': 'JUDGEMENT..jpg',
      '世界': 'THE VYORLD..jpg',
      // 小阿卡纳中文名称映射
      '圣杯一': 'c01.jpg',
      '圣杯二': 'c02.jpg',
      '圣杯三': 'c03.jpg',
      '圣杯四': 'c04.jpg',
      '圣杯五': 'c05.jpg',
      '圣杯六': 'c06.jpg',
      '圣杯七': 'c07.jpg',
      '圣杯八': 'c08.jpg',
      '圣杯九': 'c09.jpg',
      '圣杯十': 'c10.jpg',
      '圣杯侍从': 'c11.jpg',
      '圣杯骑士': 'c12.jpg',
      '圣杯王后': 'c13.jpg',
      '圣杯皇后': 'c13.jpg',
      '圣杯国王': 'c14.jpg',
      '星币一': 'p01.jpg',
      '星币二': 'p02.jpg',
      '星币三': 'p03.jpg',
      '星币四': 'p04.jpg',
      '星币五': 'p05.jpg',
      '星币六': 'p06.jpg',
      '星币七': 'p07.jpg',
      '星币八': 'p08.jpg',
      '星币九': 'p09.jpg',
      '星币十': 'p10.jpg',
      '星币侍从': 'p11.jpg',
      '星币骑士': 'p12.jpg',
      '星币王后': 'p13.jpg',
      '星币皇后': 'p13.jpg',
      '星币国王': 'p14.jpg',
      '宝剑一': 's01.jpg',
      '宝剑二': 's02.jpg',
      '宝剑三': 's03.jpg',
      '宝剑四': 's04.jpg',
      '宝剑五': 's05.jpg',
      '宝剑六': 's06.jpg',
      '宝剑七': 's07.jpg',
      '宝剑八': 's08.jpg',
      '宝剑九': 's09.jpg',
      '宝剑十': 's10.jpg',
      '宝剑侍从': 's11.jpg',
      '宝剑骑士': 's12.jpg',
      '宝剑王后': 's13.jpg',
      '宝剑皇后': 's13.jpg',
      '宝剑国王': 's14.jpg',
      '权杖一': 'w01.jpg',
      '权杖二': 'w02.jpg',
      '权杖三': 'w03.jpg',
      '权杖四': 'w04.jpg',
      '权杖五': 'w05.jpg',
      '权杖六': 'w06.jpg',
      '权杖七': 'w07.jpg',
      '权杖八': 'w08.jpg',
      '权杖九': 'w09.jpg',
      '权杖十': 'w10.jpg',
      '权杖侍从': 'w11.jpg',
      '权杖骑士': 'w12.jpg',
      '权杖王后': 'w13.jpg',
      '权杖皇后': 'w13.jpg',
      '权杖国王': 'w14.jpg'
    };

    // 处理逆位情况
    let baseCardName = cardName;
    let isReversed = false;
    
    if (cardName.includes('逆位')) {
      baseCardName = cardName.replace('逆位', '').trim();
      isReversed = true;
    }
    
    // 尝试直接匹配
    if (nameMap[baseCardName]) {
      const path = `/images/tarot-cards/${nameMap[baseCardName]}`;
      return path;
    }

    // 如果没有直接匹配，尝试构建通用路径
    const normalizedName = baseCardName
      .replace(/\s+/g, '_')
      .toUpperCase();
    
    const fallbackPath = `/images/tarot-cards/${normalizedName}.jpg`;
    return fallbackPath;
  };

  const fromDraw = searchParams.get('fromDraw') === 'true';
  const fromStart = searchParams.get('fromStart') === 'true';
  const fromRitual = searchParams.get('fromRitual') === 'true';
  const fromHistory = searchParams.get('fromHistory') === 'true';
  const hasError = searchParams.get('error') === 'true';
  const question = searchParams.get('question') || '';
  const tone = searchParams.get('tone') || 'gentle';

  useEffect(() => {
    const loadReading = async () => {
      try {
        if (fromDraw) {
          const drawResult = sessionStorage.getItem('drawResult');
          if (!drawResult) {
            router.push('/');
            return;
          }
          
          const drawData = JSON.parse(drawResult);
          
          const response = await fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: question,
              spread: drawData.spread,
              tone: tone,
              lang: 'zh',
              cards: drawData.cards
            }),
          });

          if (!response.ok) {
            throw new Error('生成解读失败');
          }

          const aiReading = await response.json();
          setReading(aiReading);
          
          // 保存到历史记录
          saveReadingToHistory(
            question,
            drawData.spread,
            drawData.cards,
            aiReading
          );
          
          sessionStorage.removeItem('drawResult');
        } else if (fromHistory) {
          const readingResult = sessionStorage.getItem('readingResult');
          
          if (readingResult) {
            try {
              const result = JSON.parse(readingResult);
              setReading(result);
              // 不删除sessionStorage，保持数据供后续使用
            } catch (e) {
              console.error('解析readingResult失败:', e);
              setError('数据解析失败');
            }
          } else {
            console.log('sessionStorage中没有readingResult，跳转到首页');
            router.push('/');
            return;
          }
        } else if (fromStart || fromRitual) {
          const readingResult = sessionStorage.getItem('readingResult');
          
          if (readingResult) {
            try {
              const result = JSON.parse(readingResult);
              setReading(result);
              
              // 保存到历史记录（如果有metadata）
              if (result._metadata) {
                const { question: metaQuestion, spread: metaSpread } = result._metadata;
                
                // 构建卡牌信息用于历史记录
                const cardsForHistory = result.cards?.map((card: any) => ({
                  name: card.name,
                  suit: card.suit,
                  number: card.number,
                  position: card.position,
                  orientation: card.orientation
                })) || [];
                
                saveReadingToHistory(
                  metaQuestion,
                  metaSpread,
                  cardsForHistory,
                  result
                );
              }
              
              setTimeout(() => {
                sessionStorage.removeItem('readingResult');
              }, 1000);
            } catch (e) {
              console.error('解析readingResult失败:', e);
              setError('数据解析失败');
            }
          } else {
            console.log('sessionStorage中没有readingResult，跳转到首页');
            router.push('/');
            return;
          }
        }
      } catch (e) {
        console.error('加载解读失败:', e);
        setError('加载解读失败');
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, [fromDraw, fromStart, fromRitual, fromHistory, question, tone, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || hasError) {
    return <ErrorMessage message={error || '解读失败，请重试'} />;
  }

  if (!reading) {
    return <ErrorMessage message="未找到解读结果" />;
  }

  return (
    <>
      <style jsx global>{`
        body {
          background: none !important;
        }
      `}</style>
      <div 
        className="min-h-dvh flex flex-col relative"
        style={{
          backgroundImage: 'url(/bg4.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      >
      {/* Header */}
      <header className="pt-safe px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            aria-label="返回"
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-lg transition-colors"
          >
            <img src="/white_arrow.png" alt="返回" className="h-6 w-6" />
          </button>
          <div className="w-11" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-6">
          {/* Question Display */}
          {question && (
            <div className="mt-4 mb-6 text-center">
              <p className="text-base text-white leading-relaxed">{question}</p>
            </div>
          )}
          
          {/* Cards Row */}
          <div className="mt-4">
            {reading?.cards?.length === 5 ? (
              // 5张牌的十字布局
              <div className="flex flex-col items-center gap-4">
                {/* 第一行：过去 */}
                <div className="flex justify-center">
                  {reading.cards[0] && (() => {
                    const card = reading.cards[0];
                    const face: Face = {
                      id: card.number || 0,
                      name: card.name,
                      imageUrl: getCardImagePath(card),
                      orientation: card.orientation
                    };
                    return (
                      <div key={0}
                        className="rounded border border-slate-300 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                        style={{ 
                          width: 'clamp(120px,30vw,160px)', 
                          height: 'calc(1.5 * clamp(120px,30vw,160px))' 
                        }}
                        onClick={() => setOpenFace(face)}
                      >
                        <motion.img 
                          layoutId={`card-${face.id}`}
                          src={face.imageUrl}
                          alt={`${card.name} ${card.orientation === 'reversed' ? '逆位' : '正位'}`}
                          className="w-full h-full object-contain rounded" 
                          style={{
                            rotate: card.orientation === 'reversed' ? 180 : 0,
                            transformOrigin: '50% 50%'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/tarot-cards/cardback.png';
                          }}
                          draggable={false}
                        />
                      </div>
                    );
                  })()}
                </div>
                {/* 第二行：现在、未来、建议 */}
                <div className="flex gap-4">
                  {reading.cards.slice(1, 4).map((card, index) => {
                    const face: Face = {
                      id: card.number || (index + 1),
                      name: card.name,
                      imageUrl: getCardImagePath(card),
                      orientation: card.orientation
                    };
                    return (
                      <div key={index + 1}
                        className="rounded border border-slate-300 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                        style={{ 
                          width: 'clamp(120px,30vw,160px)', 
                          height: 'calc(1.5 * clamp(120px,30vw,160px))' 
                        }}
                        onClick={() => setOpenFace(face)}
                      >
                        <motion.img 
                          layoutId={`card-${face.id}`}
                          src={face.imageUrl}
                          alt={`${card.name} ${card.orientation === 'reversed' ? '逆位' : '正位'}`}
                          className="w-full h-full object-contain rounded" 
                          style={{
                            rotate: card.orientation === 'reversed' ? 180 : 0,
                            transformOrigin: '50% 50%'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/tarot-cards/cardback.png';
                          }}
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* 第三行：结果 */}
                <div className="flex justify-center">
                  {reading.cards[4] && (() => {
                    const card = reading.cards[4];
                    const face: Face = {
                      id: card.number || 4,
                      name: card.name,
                      imageUrl: getCardImagePath(card),
                      orientation: card.orientation
                    };
                    return (
                      <div key={4}
                        className="rounded border border-slate-300 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                        style={{ 
                          width: 'clamp(120px,30vw,160px)', 
                          height: 'calc(1.5 * clamp(120px,30vw,160px))' 
                        }}
                        onClick={() => setOpenFace(face)}
                      >
                        <motion.img 
                          layoutId={`card-${face.id}`}
                          src={face.imageUrl}
                          alt={`${card.name} ${card.orientation === 'reversed' ? '逆位' : '正位'}`}
                          className="w-full h-full object-contain rounded" 
                          style={{
                            rotate: card.orientation === 'reversed' ? 180 : 0,
                            transformOrigin: '50% 50%'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/tarot-cards/cardback.png';
                          }}
                          draggable={false}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // 其他牌数的水平布局
              <div className="flex items-start justify-center gap-8">
                {reading?.cards?.map((card, index) => {
                  // 创建 Face 对象用于预览
                  const face: Face = {
                    id: card.number || index,
                    name: card.name,
                    imageUrl: getCardImagePath(card),
                    orientation: card.orientation
                  };
                  
                  return (
                    <div key={index}
                      className="rounded-xl border border-slate-300 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                      style={{ 
                        width: 'clamp(120px,30vw,160px)', 
                        height: 'calc(1.5 * clamp(120px,30vw,160px))' 
                      }}
                      onClick={() => setOpenFace(face)}
                    >
                      <motion.img 
                        layoutId={`card-${face.id}`}
                        src={face.imageUrl}
                        alt={`${card.name} ${card.orientation === 'reversed' ? '逆位' : '正位'}`}
                        className="w-full h-full object-contain rounded-[10px]" 
                        style={{
                          rotate: card.orientation === 'reversed' ? 180 : 0,
                          transformOrigin: '50% 50%'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/tarot-cards/cardback.png';
                        }}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reading Results Title */}
          <div className="mt-8 mb-6">
            <h2 className="text-[18px] font-normal text-[#ABABAB] leading-[27px] tracking-wide">
              READING RESULTS
            </h2>
            <div className="mt-3 mx-2 h-px bg-[#ABABAB]"></div>
          </div>

          {/* Reading Body */}
          <article className="pb-[96px] space-y-4 text-[15px] leading-8 text-white">
            {isNewFormat(reading) ? (
              // 新格式：显示 readingResults
              <>
                {reading.readingResults?.map((result, index) => (
                  <div key={index}>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-white">
                        {`{${result.heading}}`}
                      </h3>
                      {result.body && (
                        <p className="text-white leading-relaxed">{result.body}</p>
                      )}
                      {result.tip && (
                        <div className="text-white text-sm leading-relaxed">
                          {(() => {
                            // 解析tip，提取牌名和具体提醒
                            const tipMatch = result.tip.match(/^(.+?牌提示你——)\s*(.+)$/);
                            if (tipMatch) {
                              const cardPrompt = tipMatch[1].replace('提示你——', '提示/提醒你 --');
                              const specificTip = tipMatch[2];
                              return (
                                <>
                                  <p className="font-medium">{`{${cardPrompt}}`}</p>
                                  <p className="mt-1">{specificTip}</p>
                                </>
                              );
                            }
                            // 如果没有匹配到标准格式，直接显示原内容
                            return <p>{result.tip}</p>;
                          })()}
                        </div>
                      )}
                    </div>
                    {/* 每段解读之间的灰色分割线 */}
                    {index < reading.readingResults.length - 1 && (
                      <div className="relative my-6">
                        {/* 第一段和第二段之间的分割线添加Component 1 */}
                        {index === 0 && (
                          <div 
                            className="absolute z-10"
                            style={{
                              right: '-8%',
                              top: '-70%',
                              transform: 'translateY(-60px)'
                            }}
                          >
                            <img 
                              src="/component1.png" 
                              alt="Component 1" 
                              className="max-w-[100px] h-auto object-contain"
                            />
                          </div>
                        )}
                        {/* 第二段和第三段之间的分割线添加Component 3 */}
                        {index === 1 && (
                          <div className="absolute right-0 top-0 transform -translate-y-[44%] translate-x-6 z-10">
                            <img 
                              src="/component3.png" 
                              alt="Component 3" 
                              className="max-w-[310px] h-auto object-contain"
                            />
                          </div>
                        )}
                        <div className="ml-2 mr-20 h-px bg-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              // 旧格式：显示 cards
              <>
                {reading?.overall && (
                  <p className="text-lg leading-relaxed">{reading.overall}</p>
                )}
                
                {reading?.cards?.map((card, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold text-lg text-white">
                      {card.position}: {card.name}
                      {card.orientation === 'reversed' && <span className="text-sm text-slate-600 ml-2">(逆位)</span>}
                    </h3>
                    {card.interpretation && (
                      <p className="text-white leading-relaxed">{card.interpretation}</p>
                    )}
                    {card.advice && (
                      <p className="text-slate-700 text-sm leading-relaxed">
                        <span className="font-medium">建议：</span>{card.advice}
                      </p>
                    )}
                  </div>
                ))}
                
                {reading?.safety_note && (
                  <p className="text-slate-600 text-xs leading-relaxed mt-6 p-3 bg-white/80 rounded-lg border border-slate-200">
                    {reading.safety_note}
                  </p>
                )}
              </>
            )}
          </article>
        </div>
        
        {/* 最后一段解读和Key Messages之间的灰色粗分割线 */}
        {isNewFormat(reading) && reading.keyMessages && (
          <div className="mt-2 mb-8 h-5 bg-gray-400"></div>
        )}
        
        {/* Component 2 Image */}
        {isNewFormat(reading) && reading.keyMessages && (
          <div className="max-w-[480px] mx-auto px-6 mb-6">
            <div className="flex justify-start">
              <img 
                src="/component2.png" 
                alt="Component 2" 
                className="max-w-[50%] h-auto object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Key Messages Title */}
        {isNewFormat(reading) && reading.keyMessages && (
          <div className="max-w-[480px] mx-auto px-6">
            <div className="mt-6 mb-6">
              <h2 className="text-[18px] font-normal text-[#ABABAB] leading-[27px] tracking-wide">
                KEYMESSAGES
              </h2>
              <div className="mt-3 mx-2 h-px bg-[#ABABAB]"></div>
            </div>
          </div>
        )}
        
        {/* Key Messages Content */}
        {isNewFormat(reading) && reading.keyMessages && (
          <div className="max-w-[480px] mx-auto px-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-white">
                {`{${reading.keyMessages.title}}`}
              </h3>
              {reading.keyMessages.body && (
                <p className="text-white leading-relaxed">{reading.keyMessages.body}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Safety Note */}
        {reading.safety_note && (
          <div className="max-w-[480px] mx-auto px-6">
            <p className="text-white text-xs leading-relaxed mt-6">
              {reading.safety_note}
            </p>
          </div>
        )}
        
        {/* Bottom CTA Section */}
        <section className="relative pt-8">
          {/* CTA Button Image */}
          <div className="px-6">
            <div className="max-w-[480px] mx-auto">
              <img 
                src="/button.png" 
                alt="获取塔罗牌的祝福" 
                className="w-1/2 h-auto cursor-pointer transition-all duration-150 ease-out hover:transform hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,0,0,0.22)] active:transform active:translate-y-0 active:opacity-90 block"
                onClick={() => {
                  // 随机跳转到4个祝福页面之一
                  const blessingPages = ['/sword', '/wand', '/cup', '/coins'];
                  const randomIndex = Math.floor(Math.random() * blessingPages.length);
                  const randomPage = blessingPages[randomIndex];
                  window.location.href = randomPage;
                }}
              />
            </div>
          </div>
          
          {/* Component 4 Image */}
          <div className="pt-8" style={{ paddingTop: '32px' }}>
            <div className="max-w-[480px] mx-auto px-6">
              <div className="overflow-hidden" style={{ height: '200px' }}>
                <img 
                  src="/component4.png" 
                  alt="Component 4" 
                  className="w-full h-auto object-cover object-top"
                  style={{ transform: 'translateY(0)' }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Card Detail Overlay */}
      {openFace && (
        <CardDetailOverlay 
          face={openFace} 
          onClose={() => setOpenFace(null)} 
        />
      )}

    </div>
    </>
  );
}

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ReadingPageContent />
    </Suspense>
  );
}
