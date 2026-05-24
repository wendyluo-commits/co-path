// Local persistence for reading feedback. Source of truth for the user's own
// feedback history; the remote (Airtable) write is best-effort.
//
// Browser-only — guards against SSR by checking `typeof window`.

import type { TarotReading, MixedTarotReading } from '@/schemas/reading.schema';

const STORAGE_KEY = 'feedback_history';
const SUBMITTED_FLAG_PREFIX = 'feedback_submitted:';
const MAX_ENTRIES = 100; // bound localStorage growth

export interface FeedbackEntry {
  readingId: string;
  rating: number;
  comment?: string;
  spread?: string;
  improvementAreas?: string[];
  submittedAt: number; // ms epoch
}

/**
 * Stable identifier for a single reading session. Prefers the timestamp the
 * loading page baked in; falls back to the API-side generated_at; finally to a
 * deterministic shape-hash so feedback dedup still works in odd cases.
 *
 * Used by /reading (to key the feedback) AND /history (to look it back up).
 */
export function readingId(r: TarotReading | MixedTarotReading | null): string {
  if (!r) return '';
  const meta = r as unknown as { _metadata?: { timestamp?: number }; metadata?: { generated_at?: string } };
  if (meta._metadata?.timestamp) return `t-${meta._metadata.timestamp}`;
  if (meta.metadata?.generated_at) return `g-${meta.metadata.generated_at}`;
  return `s-${r.spread}-${(r.question || '').length}-${(r.cards?.length ?? 0)}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** Save one feedback entry. Keeps the most recent MAX_ENTRIES. */
export function saveFeedback(entry: FeedbackEntry): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Per-reading flag so we don't re-prompt within the same session
    // (and even across sessions — once you've rated a reading, you're done).
    localStorage.setItem(SUBMITTED_FLAG_PREFIX + entry.readingId, '1');
  } catch {
    // localStorage may be unavailable in private mode / over quota — fail silently.
  }
}

/** Returns true if the user has already submitted feedback for this reading. */
export function hasSubmittedFeedback(readingId: string): boolean {
  if (!isBrowser()) return false;
  try {
    return localStorage.getItem(SUBMITTED_FLAG_PREFIX + readingId) === '1';
  } catch {
    return false;
  }
}

/** Read all stored feedback, newest first. */
export function getFeedbackHistory(): FeedbackEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Build a Map from readingId → feedback entry. Caller passes this around when
 * rendering a list (e.g. /history) so we don't re-read localStorage per row.
 */
export function getFeedbackByReadingId(): Map<string, FeedbackEntry> {
  const map = new Map<string, FeedbackEntry>();
  for (const entry of getFeedbackHistory()) {
    map.set(entry.readingId, entry);
  }
  return map;
}
