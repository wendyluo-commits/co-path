export const DAILY_LIMIT = 5;
const STORAGE_KEY = 'tarot-daily-limit';

interface DailyLimitData {
  date: string; // YYYY-MM-DD
  count: number;
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function readData(): DailyLimitData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyLimitData = JSON.parse(raw);
      if (parsed.date === todayKey()) return parsed;
    }
  } catch { /* localStorage unavailable */ }
  return { date: todayKey(), count: 0 };
}

/** Pure read — call before the fetch to decide whether to proceed. */
export function isLimitReached(): boolean {
  return readData().count >= DAILY_LIMIT;
}

/** Pure write — call only after a successful reading response. */
export function consumeQuota(): void {
  try {
    const data = readData();
    data.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* localStorage unavailable */ }
}

/** Minutes until midnight (local time). */
export function minutesUntilReset(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 60000);
}
