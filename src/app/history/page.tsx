'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getReadingHistory, 
  ReadingHistoryItem, 
  formatTimestamp, 
  getSpreadEnglishName,
  getSpreadChineseName,
  getSpreadIconPath,
  filterReadingsByDateRange,
  cleanDuplicateHistoryIfNeeded 
} from '@/lib/history';
import { getCardImageByName, CARDBACK_PATH } from '@/lib/card-images';

export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReadingHistoryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  const generateWeekDates = (date: Date) => {
    const week: Date[] = [];
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push(d);
    }
    setCurrentWeek(week);
  };

  const filterByDate = useCallback((date: Date, data: ReadingHistoryItem[]) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return filterReadingsByDateRange(data, startOfDay, endOfDay);
  }, []);

  useEffect(() => {
    cleanDuplicateHistoryIfNeeded();
    const data = getReadingHistory();
    setHistory(data);

    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        generateWeekDates(date);
        setFilteredHistory(filterByDate(date, data));
        return;
      }
    }

    setFilteredHistory(data);
    generateWeekDates(new Date());
  }, [filterByDate, searchParams]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
    generateWeekDates(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setFilteredHistory(filterByDate(date, history));
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const handleCardClick = (item: ReadingHistoryItem) => {
    sessionStorage.setItem('readingResult', JSON.stringify(item.fullReading));
    router.push('/reading?fromHistory=true');
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* 导航栏 */}
      <header 
        className="relative px-6 py-4 text-white"
        style={{
          backgroundImage: 'url(/history_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="返回"
          >
            <img src="/white_arrow.png" alt="返回" className="h-6 w-6" />
          </button>
          
          <h1 
            className="text-white"
            style={{
              fontFamily: 'Red Rose',
              fontWeight: 'regular',
              fontSize: '38px',
              letterSpacing: '-0.24px',
              color: '#FFFFFF'
            }}
          >
            History
          </h1>
          
          <button 
            onClick={() => router.push('/calendar')}
            className="p-2 -mr-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="打开日历"
          >
            <img src="/calendar.png" alt="日历" className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 日期选择栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-2 py-3">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
            aria-label="上一周"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex justify-center gap-1 mx-1 flex-1">
            {currentWeek.map((date, index) => {
              const dayNumber = date.getDate();
              const isSelectedDate = isSelected(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => selectDate(date)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 flex-shrink-0
                    ${isSelectedDate 
                      ? 'bg-black text-white' 
                      : isTodayDate 
                        ? 'border text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  style={isTodayDate ? { borderColor: '#000000', borderWidth: '0.8px' } : {}}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
            aria-label="下一周"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 历史记录列表 */}
      <main className="flex-1 px-4 py-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">暂无读牌记录</p>
            <p className="text-gray-400 text-sm mt-1">
              {selectedDate.toDateString() === new Date().toDateString() 
                ? '今天还没有进行过塔罗牌解读' 
                : '这一天没有读牌记录'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="bg-white rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0px',
                  paddingTop: '20px',
                  paddingBottom: '20px', 
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              >
                {/* 1. 牌阵类型：icon + 英文名 + 中文名 */}
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    <img 
                      src={getSpreadIconPath(item.spread)}
                      alt={`${item.spread} icon`}
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const svg = target.nextElementSibling as SVGElement;
                        if (svg) svg.style.display = 'block';
                      }}
                    />
                    <svg 
                      className="w-4 h-4 text-gray-600 hidden" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span 
                      style={{
                        fontFamily: 'Red Rose',
                        fontSize: '10px',
                        fontWeight: 400,
                        lineHeight: '12px',
                        letterSpacing: '0.35px',
                        color: 'rgb(0, 0, 0)'
                      }}
                    >
                      {getSpreadEnglishName(item.spread)}
                    </span>
                  </div>
                  <span 
                    style={{
                      fontFamily: 'PingFang SC',
                      fontSize: '10px',
                      fontWeight: 400,
                      lineHeight: '12px',
                      letterSpacing: '0.35px',
                      color: 'rgb(138, 138, 138)'
                    }}
                  >
                    {getSpreadChineseName(item.spread)}
                  </span>
                </div>

                {/* 2. 分隔线 */}
                <div 
                  style={{
                    width: '100%',
                    height: '0.2px',
                    backgroundColor: 'rgb(171, 171, 171)',
                    marginTop: '4px'
                  }}
                />

                {/* 3. 问题 */}
                <div className="w-full text-left" style={{ marginTop: '33px' }}>
                  <p 
                    style={{
                      fontFamily: 'Roboto',
                      fontSize: '18px',
                      fontWeight: 500,
                      lineHeight: '20px',
                      letterSpacing: '0.35px',
                      color: 'rgb(0, 0, 0)'
                    }}
                  >
                    Q: {item.question}
                  </p>
                </div>

                {/* 4. 解读标题+日期 与 塔罗牌预览 */}
                <div className="flex items-center justify-between w-full" style={{ marginTop: '33px' }}>
                  <div className="flex flex-col items-start gap-2">
                    <p 
                      style={{
                        fontFamily: 'PingFang SC',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '14px',
                        letterSpacing: '0.35px',
                        color: 'rgb(0, 0, 0)'
                      }}
                    >
                      {item.summary || '解读总结'}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        style={{
                          fontFamily: 'PingFang SC',
                          fontSize: '10px',
                          fontWeight: 400,
                          lineHeight: '24px',
                          letterSpacing: '0.35px',
                          color: 'rgb(138, 138, 138)'
                        }}
                      >
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <img 
                        src="/black_arrow.png"
                        alt="arrow"
                        className="w-5 h-5"
                        style={{ transform: 'rotate(180deg)' }}
                      />
                    </div>
                  </div>

                  <div className="flex -space-x-2">
                    {item.cards.map((card, index) => (
                      <div
                        key={index}
                        className="w-12 h-18 rounded-lg border-2 border-white shadow-sm bg-white overflow-hidden"
                        style={{
                          transform: `rotate(${index * 5}deg)`,
                          zIndex: item.cards.length - index
                        }}
                      >
                        <img
                          src={getCardImageByName(card.name)}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CARDBACK_PATH;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
