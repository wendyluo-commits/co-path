import { SpreadType, SPREAD_POSITIONS } from '@/schemas/reading.schema';
import tarotCardsData from '@/data/tarot-cards.json';

export interface TarotCardData {
  name: string;
  chinese_name: string;
  suit: string;
  number: number;
  arcana: string;
  upright: {
    keywords: string[];
    love: string;
    career: string;
    advice: string[];
  };
  reversed: {
    keywords: string[];
    love: string;
    career: string;
    advice: string[];
  };
}

export interface DrawnCard {
  name: string;
  orientation: 'upright' | 'reversed';
  position: string;
  data: TarotCardData;
}

/**
 * Fisher-Yates 洗牌算法
 */
function shuffle<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  // 简单的伪随机数生成器（如果提供了 seed）
  let currentSeed = seed;
  const random = seed ? 
    (() => {
      const x = Math.sin(currentSeed!) * 10000;
      currentSeed!++;
      return x - Math.floor(x);
    }) :
    Math.random;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = 
    [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

/**
 * 抽取塔罗牌
 */
export function drawCards(spread: SpreadType, seed?: number): DrawnCard[] {
  const cardNames = Object.keys(tarotCardsData);
  const shuffledCards = shuffle(cardNames, seed);
  const positions = SPREAD_POSITIONS[spread];
  const cardCount = spread === 'single' ? 1 : spread === 'situation-action-outcome' ? 3 : 5;
  
  const drawnCards: DrawnCard[] = [];
  
  for (let i = 0; i < cardCount; i++) {
    const cardName = shuffledCards[i];
    const cardData = tarotCardsData[cardName as keyof typeof tarotCardsData];
    
    // 随机决定正逆位（50% 概率）
    const orientationRandom = seed ? 
      Math.sin(seed + i + 100) * 10000 - Math.floor(Math.sin(seed + i + 100) * 10000) :
      Math.random();
    
    const orientation: 'upright' | 'reversed' = orientationRandom > 0.5 ? 'upright' : 'reversed';
    
    drawnCards.push({
      name: cardData.chinese_name || cardName, // 使用中文名称
      orientation,
      position: positions[i],
      data: cardData as TarotCardData
    });
  }
  
  return drawnCards;
}

/**
 * 根据卡牌名称查询卡牌信息（支持中文名称或英文名称）
 */
export function lookupCard(cardName: string): TarotCardData | null {
  // 首先尝试直接查找（中文名称）
  let cardData = tarotCardsData[cardName as keyof typeof tarotCardsData];
  
  // 如果没找到，尝试通过英文名称查找
  if (!cardData) {
    const entries = Object.entries(tarotCardsData);
    const found = entries.find(([, card]) => card.name === cardName);
    if (found) {
      cardData = found[1];
    }
  }
  
  if (!cardData) return null;
  
  return cardData as TarotCardData;
}

/**
 * 为 AI 组织上下文信息
 */
export function composeContext(drawnCards: DrawnCard[], question: string, tone: 'gentle' | 'direct'): string {
  const cardContexts = drawnCards.map(card => {
    const cardInfo = card.orientation === 'upright' ? card.data.upright : card.data.reversed;
    
    return `
卡牌：${card.name} (${card.orientation === 'upright' ? '正位' : '逆位'})
位置：${card.position}
关键词：${cardInfo.keywords.join(', ')}
爱情含义：${cardInfo.love}
事业含义：${cardInfo.career}
建议：${cardInfo.advice.join('; ')}
    `.trim();
  }).join('\n\n');

  const toneDescription = tone === 'gentle' ? '温和、关怀' : '直接、务实';
  
  return `
用户问题：${question}

抽到的卡牌信息：
${cardContexts}

请以${toneDescription}的语气，根据以上卡牌信息为用户提供塔罗解读。
  `.trim();
}

/**
 * 获取所有卡牌名称
 */
export function getAllCardNames(): string[] {
  return Object.keys(tarotCardsData);
}

/**
 * 验证卡牌名称是否存在
 */
export function isValidCardName(cardName: string): boolean {
  return cardName in tarotCardsData;
}
