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
  fullReading: TarotReading | MixedTarotReading;
  summary?: string;
}

const HISTORY_STORAGE_KEY = 'tarot_reading_history';
const LAST_CLEANED_KEY = 'tarot_history_last_cleaned';
const MAX_HISTORY_ITEMS = 50;
const DEDUP_TIME_WINDOW_MS = 10_000;

// --------------- Spread display helpers (single source of truth) ---------------

const SPREAD_INFO: Record<string, { en: string; zh: string; zhTag: string; icon: string }> = {
  single:                     { en: 'One-Card Spread',   zh: '单张牌',     zhTag: '单一牌阵', icon: '/one_card_icon.png' },
  'situation-action-outcome': { en: 'Three-Card Spread', zh: '现状行动结果', zhTag: '经典牌阵', icon: '/three_card_icon.png' },
  'five-card':                { en: 'Cross-Card Spread', zh: '五张牌阵',    zhTag: '复杂牌阵', icon: '/cross_card_icon.png' },
};

export function getSpreadDisplayName(spread: string): string {
  return SPREAD_INFO[spread]?.zh ?? spread;
}

export function getSpreadEnglishName(spread: string): string {
  return SPREAD_INFO[spread]?.en ?? spread;
}

export function getSpreadChineseName(spread: string): string {
  const tag = SPREAD_INFO[spread]?.zhTag ?? spread;
  return `{${tag}}`;
}

export function getSpreadIconPath(spread: string): string {
  return SPREAD_INFO[spread]?.icon ?? '/one_card_icon.png';
}

// --------------- In-memory cache ---------------

let _cache: ReadingHistoryItem[] | null = null;

function _readFromStorage(): ReadingHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function _persist(history: ReadingHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    _cache = history;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Drop oldest entries until it fits
      while (history.length > 1) {
        history.pop();
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
          _cache = history;
          return;
        } catch {
          // keep trimming
        }
      }
    }
    console.error('保存历史记录失败:', e);
  }
}

/** Invalidate cache so next read re-parses from storage. */
export function invalidateHistoryCache(): void {
  _cache = null;
}

// --------------- Public API ---------------

export function getReadingHistory(): ReadingHistoryItem[] {
  if (_cache) return _cache;
  _cache = _readFromStorage();
  return _cache;
}

export function getReadingById(id: string): ReadingHistoryItem | null {
  return getReadingHistory().find(item => item.id === id) ?? null;
}

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
    const now = Date.now();

    const isDuplicate = history.some(item => {
      return Math.abs(item.timestamp - now) < DEDUP_TIME_WINDOW_MS &&
             item.question === question &&
             item.spread === spread;
    });

    if (isDuplicate) return;

    const newItem: ReadingHistoryItem = {
      id: `reading_${now}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: now,
      question,
      spread,
      cards,
      fullReading: readingData,
      summary: generateSummary(readingData, question),
    };

    history.unshift(newItem);

    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    _persist(history);
  } catch (error) {
    console.error('保存读牌记录失败:', error);
  }
}

export function deleteReadingFromHistory(id: string): void {
  try {
    const filtered = getReadingHistory().filter(item => item.id !== id);
    _persist(filtered);
  } catch (error) {
    console.error('删除读牌记录失败:', error);
  }
}

export function clearReadingHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    _cache = null;
  } catch (error) {
    console.error('清空读牌历史失败:', error);
  }
}

/**
 * Remove duplicate entries. Uses a Map keyed by (question+spread) → earliest timestamp
 * to achieve O(n) instead of O(n²).
 *
 * Runs at most once per day to avoid unnecessary work on every page load.
 */
export function cleanDuplicateHistoryIfNeeded(): void {
  try {
    const lastCleaned = Number(localStorage.getItem(LAST_CLEANED_KEY) || '0');
    if (Date.now() - lastCleaned < 86_400_000) return; // once per day

    const history = getReadingHistory();
    const seen = new Map<string, number>(); // key → earliest timestamp
    const cleaned: ReadingHistoryItem[] = [];

    for (const item of history) {
      const key = `${item.question}|${item.spread}`;
      const prev = seen.get(key);

      if (prev !== undefined && Math.abs(prev - item.timestamp) < DEDUP_TIME_WINDOW_MS) {
        continue; // duplicate within time window
      }

      seen.set(key, item.timestamp);
      cleaned.push(item);
    }

    if (cleaned.length !== history.length) {
      _persist(cleaned);
      console.log(`清理了 ${history.length - cleaned.length} 条重复记录`);
    }

    localStorage.setItem(LAST_CLEANED_KEY, String(Date.now()));
  } catch (error) {
    console.error('清理重复记录失败:', error);
  }
}

export function filterReadingsByDateRange(
  history: ReadingHistoryItem[],
  startDate: Date,
  endDate: Date
): ReadingHistoryItem[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return history.filter(item => item.timestamp >= start && item.timestamp <= end);
}

// --------------- Formatting helpers ---------------

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month}. ${day}. ${year}  ${hours}:${minutes}`;
}

// --------------- Internal helpers ---------------

function generateSummary(
  readingData: TarotReading | MixedTarotReading,
  question: string,
): string {
  const isNewFormat = (data: unknown): data is MixedTarotReading =>
    !!data && typeof data === 'object' && 'readingResults' in data &&
    Array.isArray((data as MixedTarotReading).readingResults);

  if (isNewFormat(readingData)) {
    const heading = readingData.readingResults?.[0]?.heading;
    return heading || question.substring(0, 30) + '...';
  }

  const overall = (readingData as TarotReading).overall;
  return (overall ? overall.substring(0, 50) : question.substring(0, 30)) + '...';
}
