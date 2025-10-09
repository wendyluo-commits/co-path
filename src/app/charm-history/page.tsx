'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CharmHistoryPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  // 获取当前周的日期
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一开始
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  // 模拟御守数据
  const mockCharms = [
    {
      id: 1,
      name: "心灵之杯",
      type: "charm_cup",
      description: "情感与连结的守护",
      quote: "爱是灵魂的食粮",
      greekQuote: "εὐδαιμονία ἐστὶν ἐνέργεια ψυχῆς",
      isActive: true,
      endTime: "21:18"
    },
    {
      id: 2,
      name: "智慧之剑",
      type: "charm_sword", 
      description: "思维与决断的守护",
      quote: "智慧是力量的源泉",
      greekQuote: "σοφία ἐστὶν δύναμις",
      isActive: false,
      endTime: "已结束"
    },
    {
      id: 3,
      name: "力量之杖",
      type: "charm_wand",
      description: "行动与意志的守护",
      quote: "意志决定命运",
      greekQuote: "ἡ βούλησις κρίνει τὴν μοίραν",
      isActive: false,
      endTime: "已结束"
    }
  ];

  const weekDates = getWeekDates(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // 获取当前选中的日期索引
  const getCurrentDayIndex = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    return weekDates.findIndex(date => date.toDateString() === todayStr);
  };

  const currentDayIndex = getCurrentDayIndex();

  // 切换到上一天
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // 切换到下一天
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // 点击卡片切换层级
  const handleCardClick = (index: number) => {
    setSelectedCardIndex(index);
  };

  // 重新排列卡片，被点击的卡片移到最上层
  const sortedCharms = [...mockCharms].sort((a, b) => {
    const aIndex = mockCharms.findIndex(charm => charm.id === a.id);
    const bIndex = mockCharms.findIndex(charm => charm.id === b.id);
    
    if (aIndex === selectedCardIndex) return -1;
    if (bIndex === selectedCardIndex) return 1;
    return aIndex - bIndex;
  });

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{
      backgroundImage: 'url("/bg_charm_history.png")',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      height: '100vh'
    }}>
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="absolute z-50 p-2 -ml-2 rounded-lg transition-colors hover:bg-white/10"
        style={{ 
          top: 'calc(env(safe-area-inset-top) + 24px)',
          left: '24px'
        }}
        aria-label="返回"
      >
        <img src="/black_arrow.png" alt="返回" className="h-6 w-6" />
      </button>

      {/* 星期bar */}
      <div className="flex justify-around px-6 mb-8 pt-20" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}>
        {weekDays.map((day, index) => (
          <button
            key={index}
            className={`text-center py-2 ${
              index === currentDayIndex 
                ? 'text-black' 
                : 'text-black opacity-50'
            }`}
            onClick={() => {
              const newDate = new Date(weekDates[index]);
              setCurrentDate(newDate);
            }}
          >
            <div className="text-sm font-medium">{day}</div>
            <div className="text-xs">{weekDates[index].getDate()}</div>
          </button>
        ))}
      </div>

      {/* 御守卡片区域 */}
      <main className="flex flex-col items-center px-6">
        {/* 御守卡片区域 */}
        <div className="relative w-full flex justify-center items-center mb-8">
          {/* 左右箭头 - 绝对定位 */}
          <button
            onClick={goToPreviousDay}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/black_left.png" alt="Previous" className="h-8 w-8 object-contain" />
          </button>

          <button
            onClick={goToNextDay}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/black_left.png" alt="Next" className="h-8 w-8 rotate-180 object-contain" />
          </button>

          {/* 御守卡片容器 - 居中，需要更大的容器来容纳旋转的卡片 */}
          <div className="relative w-[90vw] max-w-[600px] h-[400px] sm:h-[500px] overflow-visible">
            {/* 堆叠的御守卡片 */}
            {sortedCharms.map((charm, index) => (
              <div
                key={charm.id}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  index === 0 ? 'z-30' : 'z-20'
                }`}
                style={{
                  transform: `rotate(${index * 5}deg)`,
                  transformOrigin: 'center bottom',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-50vw',
                  marginTop: '-25vh',
                  width: '100vw',
                  height: '50vh',
                  maxWidth: '400px',
                  maxHeight: '500px',
                  opacity: index === 0 ? 1 : 0.5,
                }}
                onClick={() => handleCardClick(mockCharms.findIndex(c => c.id === charm.id))}
              >
                <div className="w-full h-full relative">
                  {/* 御守图标 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={`/${charm.type}.png`}
                      alt={charm.name}
                      className="w-64 h-64 sm:w-96 sm:h-96 object-contain"
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 当前选中的御守信息 */}
        {sortedCharms.length > 0 && (
          <div className="text-center text-black mt-4 sm:mt-6 pb-16 sm:pb-32 max-w-sm mx-auto px-4 sm:px-6">
            <div className="mb-8 sm:mb-12">
              {/* 第一部分：御守名称和描述 */}
              <div className="mb-[60px]">
                <h2 className="text-2xl font-semibold mb-2 text-black">
                  {`{${sortedCharms[0].name}}`}
                </h2>
                <p className="text-lg text-black mb-3">
                  {sortedCharms[0].description}
                </p>
              </div>
              
              {/* 第二部分：引言和希腊文 */}
              <div>
                <p className="text-base text-black mb-3 italic">
                  {sortedCharms[0].quote}
                </p>
                <p className="text-sm text-black font-mono mb-4">
                  {sortedCharms[0].greekQuote}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
