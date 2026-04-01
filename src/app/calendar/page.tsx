'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { getReadingHistory, ReadingHistoryItem } from '@/lib/history';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function generateMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = firstDay.getDay();
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const days: (Date | null)[] = new Array(mondayOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
}

// --- Memoized DayCell to avoid re-rendering all ~480 cells on selection change ---

interface DayCellProps {
  date: Date;
  day: number;
  dateStr: string;
  hasReading: boolean;
  isToday: boolean;
  isSelected: boolean;
  yearLabel: number;
  monthLabel: number;
  onSelect: (date: Date) => void;
}

const DayCell = memo(function DayCell({
  date, day, hasReading, isToday, isSelected, yearLabel, monthLabel, onSelect,
}: DayCellProps) {
  return (
    <button
      onClick={() => onSelect(date)}
      aria-label={`${yearLabel}年${monthLabel}月${day}日`}
      aria-current={isToday ? 'date' : undefined}
      className="flex flex-col items-center justify-start transition-colors duration-150"
    >
      <div
        className={`h-8 w-8 flex items-center justify-center text-sm font-medium rounded-full ${
          isSelected
            ? 'bg-black text-white'
            : isToday
              ? 'text-black border border-black/60'
              : 'text-black hover:bg-gray-100'
        }`}
      >
        {day}
      </div>

      {hasReading && (
        <div className="mt-1 w-1 h-1 rounded-full bg-gray-400" />
      )}
    </button>
  );
});

// --- Main page component ---

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [displayYear, setDisplayYear] = useState(() => new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);
  const currentMonthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getReadingHistory());
  }, []);

  // Scroll to current month before paint, only within the scroll container
  useLayoutEffect(() => {
    const container = containerRef.current;
    const monthEl = currentMonthRef.current;
    if (container && monthEl) {
      const containerTop = container.getBoundingClientRect().top;
      const monthTop = monthEl.getBoundingClientRect().top;
      container.scrollTop += monthTop - containerTop;
    }
  }, []);

  // IntersectionObserver on individual month cards to detect year in viewport center
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const yr = Number((entry.target as HTMLElement).dataset.year);
            if (!Number.isNaN(yr)) setDisplayYear(yr);
          }
        }
      },
      { root: container, rootMargin: '-45% 0px -45% 0px' },
    );

    const monthEls = container.querySelectorAll<HTMLElement>('[data-year]');
    monthEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const todayStr = useMemo(() => new Date().toDateString(), []);

  const selectedDateStr = useMemo(
    () => selectedDate?.toDateString() ?? null,
    [selectedDate],
  );

  const datesWithReadings = useMemo(() => {
    const set = new Set<string>();
    for (const item of history) {
      set.add(new Date(item.timestamp).toDateString());
    }
    return set;
  }, [history]);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    router.push(`/history?date=${y}-${m}-${d}`);
  }, [router]);

  const yearGroups = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startYear = currentYear - 1;
    const endYear = currentYear;

    const groups: {
      year: number;
      months: {
        year: number;
        month: number;
        monthNumber: number;
        isCurrent: boolean;
        days: (Date | null)[];
      }[];
    }[] = [];

    for (let yr = startYear; yr <= endYear; yr++) {
      const months = [];
      for (let mo = 0; mo < 12; mo++) {
        months.push({
          year: yr,
          month: mo,
          monthNumber: mo + 1,
          isCurrent: yr === currentYear && mo === currentMonth,
          days: generateMonthDays(yr, mo),
        });
      }
      groups.push({ year: yr, months });
    }
    return groups;
  }, []);

  return (
    <div
      className="h-dvh bg-[#F0F0F0] flex flex-col overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <header
        className="shrink-0 px-6 py-4 text-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/history_background.png)' }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/history')}
            className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="返回"
          >
            <img src="/white_arrow.png" alt="返回" className="h-6 w-6" />
          </button>

          <h1
            className="text-white tracking-tight"
            style={{ fontFamily: 'Red Rose', fontWeight: 400, fontSize: '38px' }}
          >
            Calendar
          </h1>

          <span className="text-white/80 text-xl font-normal">
            {displayYear}
          </span>
        </div>
      </header>

      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="grid grid-cols-7 px-4 py-3">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-black">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto overscroll-contain bg-[#F0F0F0] px-4 py-4 space-y-6">
        {yearGroups.map((yearGroup) => (
          <div key={yearGroup.year} data-yeargroup={yearGroup.year}>
            <div
              className="sticky top-0 z-10 py-2 px-1 mb-2"
              style={{ backgroundColor: '#F0F0F0' }}
            >
              <span
                className="text-black/80"
                style={{ fontFamily: 'Red Rose', fontWeight: 400, fontSize: '20px' }}
              >
                {yearGroup.year}
              </span>
            </div>

            <div className="space-y-4">
              {yearGroup.months.map((monthData) => {
                const dateKey = `${monthData.year}-${monthData.month}`;
                return (
                  <div
                    key={dateKey}
                    ref={monthData.isCurrent ? currentMonthRef : undefined}
                    data-year={monthData.year}
                  >
                    <div className="bg-white rounded-lg p-4">
                      <div className="h-10 flex items-center mb-2">
                        <span
                          className="text-black w-[calc(100%/7)] text-center"
                          style={{ fontFamily: 'Red Rose', fontWeight: 400, fontSize: '36px' }}
                        >
                          {monthData.monthNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {monthData.days.map((date, dayIndex) => {
                          if (!date) {
                            return <div key={dayIndex} className="h-8" />;
                          }

                          const dateStr = date.toDateString();

                          return (
                            <DayCell
                              key={dayIndex}
                              date={date}
                              day={date.getDate()}
                              dateStr={dateStr}
                              hasReading={datesWithReadings.has(dateStr)}
                              isToday={dateStr === todayStr}
                              isSelected={dateStr === selectedDateStr}
                              yearLabel={monthData.year}
                              monthLabel={monthData.monthNumber}
                              onSelect={selectDate}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
