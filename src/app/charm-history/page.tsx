'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

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
      isActive: true,
      endTime: "21:18"
    },
    {
      id: 2,
      name: "智慧之剑",
      type: "charm_sword", 
      description: "思维与决断的守护",
      isActive: false,
      endTime: "已结束"
    },
    {
      id: 3,
      name: "力量之杖",
      type: "charm_wand",
      description: "行动与意志的守护", 
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
    <div className="min-h-screen pb-24" style={{
      backgroundImage: 'url(/bg_charm_history.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 导航栏 */}
      <div className="flex items-center justify-center p-6 pt-safe relative" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        <button
          onClick={() => router.back()}
          className="absolute left-6 p-2 hover:opacity-70 transition-opacity"
        >
          <img src="/black_arrow.png" alt="Back" className="h-6 w-6" />
        </button>
        <h1 
          className="text-4xl text-black font-semibold"
          style={{
            fontFamily: "'Red Rose', serif",
            fontWeight: 400,
          }}
        >
          Charm
        </h1>
      </div>

      {/* 星期bar */}
      <div className="flex justify-around px-6 mb-8">
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
        {/* 左右箭头 */}
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/black_arrow.png" alt="Previous" className="h-8 w-8 object-contain" />
          </button>
          
          <div className="flex-1 flex justify-center items-center">
            <div className="relative w-96 h-[480px]">
              {/* 堆叠的御守卡片 */}
              {sortedCharms.map((charm, index) => (
                <div
                  key={charm.id}
                  className={`absolute cursor-pointer transition-all duration-300 ${
                    index === 0 ? 'z-30' : 'z-20'
                  }`}
                  style={{
                    transform: `translateY(${index * 8}px) translateX(${index * 4}px)`,
                    opacity: index === 0 ? 1 : 0.5,
                    left: index === 0 ? 0 : index * 8,
                  }}
                  onClick={() => handleCardClick(mockCharms.findIndex(c => c.id === charm.id))}
                >
                  <div className="w-96 h-[480px] relative">
                    {/* 御守图标 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={`/${charm.type}.png`}
                        alt={charm.name}
                        className="w-40 h-40 object-contain"
                      />
                    </div>

                    {/* 御守信息 - 只在第一张卡片显示 */}
                    {index === 0 && (
                      <div className="absolute bottom-4 left-4 right-4 text-center text-black">
                        <div className="text-sm font-medium">{charm.name}</div>
                        <div className="text-xs opacity-75">{charm.endTime}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:opacity-70 transition-opacity"
          >
            <img src="/black_arrow.png" alt="Next" className="h-8 w-8 rotate-180 object-contain" />
          </button>
        </div>

        {/* 当前选中的御守信息 */}
        {sortedCharms.length > 0 && (
          <div className="text-center text-black mt-8">
            <h2 className="text-2xl font-semibold mb-2">
              {`{${sortedCharms[0].name}}`}
            </h2>
            <p className="text-lg mb-3">
              {sortedCharms[0].description}
            </p>
            <p className="text-base mb-3 italic">
              {sortedCharms[0].isActive ? `剩余时间: ${sortedCharms[0].endTime}` : `结束时间: ${sortedCharms[0].endTime}`}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
