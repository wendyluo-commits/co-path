'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getReadingHistory, ReadingHistoryItem } from '@/lib/history';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [displayYear, setDisplayYear] = useState(2025);
  const containerRef = useRef<HTMLDivElement>(null);

  // 星期缩写 - 英文
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const historyData = getReadingHistory();
    setHistory(historyData);
  }, []);

  // 监听滚动，更新显示的年份
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      // 计算当前可见区域中心点
      const centerY = scrollTop + containerHeight / 2;
      
      // 查找最接近中心点的月份
      const monthElements = container.querySelectorAll('[data-year]');
      let closestMonth = null;
      let minDistance = Infinity;
      
      monthElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2 - container.getBoundingClientRect().top;
        const distance = Math.abs(elementCenter - centerY);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestMonth = element;
        }
      });
      
      if (closestMonth) {
        const year = parseInt(closestMonth.getAttribute('data-year') || '2025');
        setDisplayYear(year);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // 初始调用一次
      handleScroll();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // 检查某天是否有读牌记录
  const hasReadingOnDate = (date: Date) => {
    return history.some(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.toDateString() === date.toDateString();
    });
  };

  // 选择日期
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    // 将选择的日期存储到sessionStorage，供历史页面使用
    sessionStorage.setItem('selectedCalendarDate', date.toISOString());
    router.push('/history');
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 检查是否是选中的日期
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // 生成月份数据
  const generateMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取当月第一天是星期几（0=Sunday, 1=Monday...）
    const firstDayOfWeek = firstDay.getDay();
    // 转换为Monday=0的格式
    const mondayFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days: (Date | null)[] = [];
    
    // 添加上个月的空白日期
    for (let i = 0; i < mondayFirstDay; i++) {
      days.push(null);
    }
    
    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // 生成多个月份的日历数据
  const generateMultipleMonths = () => {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // 生成更多月份，包括2026年
    for (let i = 0; i < 15; i++) { // 生成15个月，确保包含2026年
      const year = currentMonth + i > 11 ? currentYear + 1 : currentYear;
      const month = (currentMonth + i) % 12;
      months.push({
        year,
        month,
        monthNumber: month + 1,
        days: generateMonthData(year, month)
      });
    }
    
    return months;
  };

  const monthsData = generateMultipleMonths();

  return (
    <div className="min-h-dvh" style={{ backgroundColor: '#F0F0F0' }}>
      {/* 1. 固定导航栏 */}
      <header 
        className="sticky top-0 z-50 relative px-6 py-4 text-white"
        style={{
          backgroundImage: 'url(/history_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="flex items-center justify-between">
          {/* 返回按钮 */}
          <button 
            onClick={() => router.push('/history')}
            className="p-2 -ml-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="返回"
          >
            <img 
              src="/white_arrow.png" 
              alt="返回" 
              className="h-6 w-6"
            />
          </button>
          
          {/* 标题 */}
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
            Calendar
          </h1>
          
          {/* 年份在右侧 */}
          <span 
            className="text-white/80"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '20px',
              fontWeight: '400'
            }}
          >
            {displayYear}
          </span>
        </div>
      </header>

      {/* 2. 星期栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex justify-between px-4 py-3">
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="flex-1 text-center text-sm font-medium text-black"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* 3. 月日历 */}
      <div ref={containerRef} className="px-4 py-4 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
        {monthsData.map((monthData, monthIndex) => (
          <div key={`${monthData.year}-${monthData.month}`} className="space-y-4" data-year={monthData.year}>
            {/* 日历网格 */}
            <div className="bg-white rounded-lg p-4">
              {/* 月份数字 - 占据第一行，与日期第一列的数字居中对齐 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                <div className="h-8 flex items-center justify-center">
                  <span 
                    className="text-black"
                    style={{
                      fontFamily: 'Red Rose',
                      fontSize: '36px',
                      fontWeight: 'regular'
                    }}
                  >
                    {monthData.monthNumber}
                  </span>
                </div>
                <div className="h-8"></div>
                <div className="h-8"></div>
                <div className="h-8"></div>
                <div className="h-8"></div>
                <div className="h-8"></div>
                <div className="h-8"></div>
              </div>
              
              {/* 日期网格 - 从第二行开始 */}
              <div className="grid grid-cols-7 gap-1">
                {monthData.days.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="h-8" />;
                }
                
                const day = date.getDate();
                const hasReading = hasReadingOnDate(date);
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);
                const isCurrentMonth = date.getMonth() === new Date().getMonth();
                
                return (
                  <button
                    key={dayIndex}
                    onClick={() => selectDate(date)}
                    className="relative transition-all duration-200 flex flex-col items-center justify-start"
                  >
                    {/* 日期数字容器 - 所有日期都在同一水平线上 */}
                    <div 
                      className={`
                        h-8 w-8 flex items-center justify-center text-sm font-medium
                        ${isSelectedDate 
                          ? 'bg-black text-white rounded-full' // 选中：黑色圆形背景，白色数字
                          : isTodayDate 
                            ? 'bg-transparent text-black border border-black rounded-full' // 今天：透明背景，黑色数字，细黑边框
                            : isCurrentMonth
                              ? 'text-black hover:bg-gray-100 rounded-full' // 当前月：透明背景，黑色数字
                              : 'text-gray-400' // 其他月：浅灰色数字
                        }
                      `}
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        ...(isTodayDate ? { borderWidth: '0.8px' } : {})
                      }}
                    >
                      {day}
                    </div>
                    
                    {/* 读牌记录指示器 - 小圆点，位于日期数字下方 */}
                    {hasReading && (
                      <div className="mt-1">
                        <div 
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: '#9CA3AF' }}
                        />
                      </div>
                    )}
                  </button>
                );
            })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
