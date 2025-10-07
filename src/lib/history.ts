import { TarotReading, MixedTarotReading } from '@/schemas/reading.schema';

export interface ReadingHistoryItem {
  id: string;
  timestamp: number;
  question: string;
  spread: string;
  cards: Array<{
    name: string;
    suit: string;
    number: number;
    position?: string;
    orientation: 'upright' | 'reversed';
  }>;
  fullReading: TarotReading | MixedTarotReading; // 完整的解读数据
  summary?: string; // 用于历史记录列表显示的简要信息
}

const HISTORY_STORAGE_KEY = 'tarot_reading_history';
const MAX_HISTORY_ITEMS = 50; // 最多保存50条记录

/**
 * 保存读牌记录到本地存储
 */
export function saveReadingToHistory(
  question: string,
  spread: string,
  cards: Array<{
    name: string;
    suit: string;
    number: number;
    position?: string;
    orientation: 'upright' | 'reversed';
  }>,
  readingData: TarotReading | MixedTarotReading
): void {
  try {
    const history = getReadingHistory();
    
    // 检查是否已经存在相同的记录（基于时间戳和问题内容）
    const now = Date.now();
    const timeWindow = 5000; // 5秒内的记录视为重复
    
    const isDuplicate = history.some(item => {
      const timeDiff = Math.abs(item.timestamp - now);
      return timeDiff < timeWindow && 
             item.question === question && 
             item.spread === spread;
    });
    
    if (isDuplicate) {
      console.log('检测到重复记录，跳过保存');
      return;
    }
    
    const newItem: ReadingHistoryItem = {
      id: generateHistoryId(),
      timestamp: now,
      question,
      spread,
      cards,
      fullReading: readingData,
      summary: generateSummary(readingData, question)
    };
    
    // 将新记录添加到开头
    history.unshift(newItem);
    
    // 限制记录数量
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    console.log('成功保存历史记录:', newItem.id);
  } catch (error) {
    console.error('保存读牌记录失败:', error);
  }
}

/**
 * 获取所有读牌历史记录
 */
export function getReadingHistory(): ReadingHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('读取读牌历史失败:', error);
    return [];
  }
}

/**
 * 根据ID获取特定的读牌记录
 */
export function getReadingById(id: string): ReadingHistoryItem | null {
  const history = getReadingHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * 删除指定的读牌记录
 */
export function deleteReadingFromHistory(id: string): void {
  try {
    const history = getReadingHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除读牌记录失败:', error);
  }
}

/**
 * 清空所有读牌历史记录
 */
export function clearReadingHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('清空读牌历史失败:', error);
  }
}

/**
 * 清理重复的历史记录
 */
export function cleanDuplicateHistory(): void {
  try {
    const history = getReadingHistory();
    const cleaned: ReadingHistoryItem[] = [];
    
    history.forEach(item => {
      // 检查是否已存在相同的记录（基于问题、牌阵和时间）
      const isDuplicate = cleaned.some(existing => {
        const timeDiff = Math.abs(existing.timestamp - item.timestamp);
        return timeDiff < 10000 && // 10秒内
               existing.question === item.question &&
               existing.spread === item.spread;
      });
      
      if (!isDuplicate) {
        cleaned.push(item);
      }
    });
    
    if (cleaned.length !== history.length) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(cleaned));
      console.log(`清理了 ${history.length - cleaned.length} 条重复记录`);
    }
  } catch (error) {
    console.error('清理重复记录失败:', error);
  }
}

/**
 * 根据日期范围筛选读牌记录
 */
export function filterReadingsByDateRange(
  history: ReadingHistoryItem[],
  startDate: Date,
  endDate: Date
): ReadingHistoryItem[] {
  return history.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * 生成唯一的历史记录ID
 */
function generateHistoryId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成读牌记录的摘要信息
 */
function generateSummary(readingData: TarotReading | MixedTarotReading, question: string): string {
  // 检查是否是新的数据结构
  const isNewFormat = (data: any): data is MixedTarotReading => {
    return data && 'readingResults' in data && Array.isArray(data.readingResults);
  };

  if (isNewFormat(readingData)) {
    // 新格式：使用第一个readingResult的heading
    const firstResult = readingData.readingResults?.[0];
    return firstResult?.heading || question.substring(0, 30) + '...';
  } else {
    // 旧格式：使用overall字段的前50个字符
    return readingData.overall?.substring(0, 50) + '...' || question.substring(0, 30) + '...';
  }
}

/**
 * 格式化时间显示
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // 格式：9. 30. 2025  9:23
  return `${month}. ${day}. ${year}  ${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 获取牌阵类型的中文名称
 */
export function getSpreadDisplayName(spread: string): string {
  const spreadNames: { [key: string]: string } = {
    'single': '单张牌',
    'situation-action-outcome': '现状行动结果',
    'five-card': '五张牌阵'
  };
  return spreadNames[spread] || spread;
}
