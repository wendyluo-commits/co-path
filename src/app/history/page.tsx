'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getReadingHistory, 
  ReadingHistoryItem, 
  formatTimestamp, 
  getSpreadDisplayName,
  filterReadingsByDateRange,
  cleanDuplicateHistory 
} from '@/lib/history';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReadingHistoryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  // 初始化数据
  useEffect(() => {
    // 先清理重复记录
    cleanDuplicateHistory();
    const historyData = getReadingHistory();
    setHistory(historyData);
    setFilteredHistory(historyData);
    
    // 检查是否有从日历页面传来的选择日期
    const selectedCalendarDate = sessionStorage.getItem('selectedCalendarDate');
    if (selectedCalendarDate) {
      const date = new Date(selectedCalendarDate);
      setSelectedDate(date);
      generateWeekDates(date);
      selectDate(date);
      sessionStorage.removeItem('selectedCalendarDate');
    } else {
      // 生成当前周的日期
      generateWeekDates(new Date());
    }
  }, []);

  // 生成指定日期所在周的日期数组
  const generateWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 周一为第一天
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    setCurrentWeek(week);
  };

  // 切换周
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
    generateWeekDates(newDate);
  };

  // 选择日期
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    
    // 根据选择的日期筛选历史记录
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const filtered = filterReadingsByDateRange(history, startOfDay, endOfDay);
    setFilteredHistory(filtered);
  };

  // 检查是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 检查是否是选中的日期
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // 获取牌阵类型的英文名称
  const getSpreadEnglishName = (spread: string) => {
    const spreadNames: { [key: string]: string } = {
      'single': 'One-Card Spread',
      'situation-action-outcome': 'Three-Card Spread',
      'five-card': 'Cross-Card Spread'
    };
    return spreadNames[spread] || spread;
  };

  // 获取牌阵图标文件名
  const getSpreadIconPath = (spread: string) => {
    const iconPaths: { [key: string]: string } = {
      'single': '/one_card_icon.png',
      'situation-action-outcome': '/three_card_icon.png',
      'five-card': '/cross_card_icon.png'
    };
    return iconPaths[spread] || '/one_card_icon.png';
  };

  // 获取牌阵类型的中文名称（带花括号）
  const getSpreadChineseName = (spread: string) => {
    const spreadNames: { [key: string]: string } = {
      'single': '单一牌阵',
      'situation-action-outcome': '经典牌阵',
      'five-card': '复杂牌阵'
    };
    return `{${spreadNames[spread] || spread}}`;
  };

  // 点击历史记录卡片
  const handleCardClick = (item: ReadingHistoryItem) => {
    // 将读牌数据存储到sessionStorage，然后跳转到读牌页面
    sessionStorage.setItem('readingResult', JSON.stringify(item.fullReading));
    router.push('/reading?fromHistory=true');
  };

  // 打开日历页面
  const openCalendar = () => {
    router.push('/calendar');
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
          {/* 返回按钮 */}
          <button 
            onClick={() => router.push('/')}
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
            History
          </h1>
          
          {/* 日历按钮 */}
          <button 
            onClick={openCalendar}
            className="p-2 -mr-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="打开日历"
          >
            <img 
              src="/calendar.png" 
              alt="日历" 
              className="h-6 w-6"
            />
          </button>
        </div>
      </header>

      {/* 日期选择栏 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-2 py-3">
          {/* 上一周按钮 */}
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
            aria-label="上一周"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>

          {/* 日期列表 */}
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
                  style={isTodayDate ? {
                    borderColor: '#000000',
                    borderWidth: '0.8px'
                  } : {}}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          {/* 下一周按钮 */}
          <button 
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
            aria-label="下一周"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
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
                  // Figma Auto Layout from history_three_card:
                  // Layout Mode: VERTICAL
                  display: 'flex',
                  flexDirection: 'column',
                  // Counter Axis Align: CENTER
                  alignItems: 'center',
                  // Primary Axis Sizing: (default)
                  // Counter Axis Sizing: FIXED
                  // Item Spacing: 33.0 - 但分隔线需要更靠近上方
                  gap: '0px',
                  // Padding: L=16.0 R=16.0 T=20.0 B=20.0
                  paddingTop: '20px',
                  paddingBottom: '20px', 
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  // Layout Sizing Horizontal: FIXED
                  width: '100%',
                  maxWidth: '100%',
                  // Layout Sizing Vertical: HUG
                  height: 'auto'
                }}
              >
                {/* 1. 牌阵类型：icon + 英文名 + 中文名 */}
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    {/* 根据牌阵类型显示对应图标 */}
                    <img 
                      src={getSpreadIconPath(item.spread)}
                      alt={`${item.spread} icon`}
                      className="w-4 h-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // 如果图片不存在，使用SVG作为fallback
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
                    {/* Three-Card Spread */}
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
                  {/* {经典牌阵} */}
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

                {/* 2. 分隔线：颜色ABABAB，粗细0.2，与牌阵类型文字间距4px */}
                <div 
                  style={{
                    width: '100%',
                    height: '0.2px',
                    backgroundColor: 'rgb(171, 171, 171)',
                    marginTop: '4px'
                  }}
                />

                {/* 3. 问题：向左对齐 */}
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

                {/* 4. 具体内容：左侧（解读标题+日期+箭头）与右侧（塔罗牌预览）水平分布 */}
                <div className="flex items-center justify-between w-full" style={{ marginTop: '33px' }}>
                  {/* 左侧：黄色框 - 解读标题、日期、箭头 */}
                  <div className="flex flex-col items-start gap-2">
                    {/* 解读标题 */}
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
                      {item.fullReading?.summary?.title || item.fullReading?.summary || '解读总结'}
                    </p>
                    
                    {/* 日期和箭头 */}
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

                  {/* 右侧：红色框 - 塔罗牌预览 */}
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
                          src={`/images/tarot-cards/${getCardImageName(card.name)}`}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/tarot-cards/cardback.png';
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

// 辅助函数：获取卡牌图片名称
function getCardImageName(cardName: string): string {
  // 这里可以使用与reading页面相同的映射逻辑
  const nameMap: { [key: string]: string } = {
    '愚者': 'the fool.jpg',
    '魔术师': 'THE MAGICIAN..jpg',
    '女祭司': 'THE HIGH PRIESTESS.jpg',
    '女皇': 'THE EMPRESS..jpg',
    '皇帝': 'THE EMPEROR..jpg',
    '教皇': 'THE HIEROPHANT.jpg',
    '恋人': 'THE LOVERS..jpg',
    '战车': 'THE CHARIOT..jpg',
    '力量': 'STRENGTH..jpg',
    '隐者': 'THE HERMIT..jpg',
    '命运之轮': 'WHEEL • FORTUNE.jpg',
    '正义': 'TUSTICE ..jpg',
    '倒吊人': 'THE HANGED MAN..jpg',
    '死神': 'DEATH..jpg',
    '节制': 'TEMPERANCE..jpg',
    '恶魔': 'THE DEVIL •.jpg',
    '塔': 'THE TOWER..jpg',
    '星星': 'THE STAR..jpg',
    '月亮': 'THE MOON.jpg',
    '太阳': 'THE SUN.jpg',
    '审判': 'JUDGEMENT..jpg',
    '世界': 'THE VYORLD..jpg',
    // 小阿卡纳
    '圣杯一': 'c01.jpg',
    '圣杯二': 'c02.jpg',
    '圣杯三': 'c03.jpg',
    '圣杯四': 'c04.jpg',
    '圣杯五': 'c05.jpg',
    '圣杯六': 'c06.jpg',
    '圣杯七': 'c07.jpg',
    '圣杯八': 'c08.jpg',
    '圣杯九': 'c09.jpg',
    '圣杯十': 'c10.jpg',
    '圣杯侍从': 'c11.jpg',
    '圣杯骑士': 'c12.jpg',
    '圣杯王后': 'c13.jpg',
    '圣杯皇后': 'c13.jpg',
    '圣杯国王': 'c14.jpg',
    '星币一': 'p01.jpg',
    '星币二': 'p02.jpg',
    '星币三': 'p03.jpg',
    '星币四': 'p04.jpg',
    '星币五': 'p05.jpg',
    '星币六': 'p06.jpg',
    '星币七': 'p07.jpg',
    '星币八': 'p08.jpg',
    '星币九': 'p09.jpg',
    '星币十': 'p10.jpg',
    '星币侍从': 'p11.jpg',
    '星币骑士': 'p12.jpg',
    '星币王后': 'p13.jpg',
    '星币皇后': 'p13.jpg',
    '星币国王': 'p14.jpg',
    '宝剑一': 's01.jpg',
    '宝剑二': 's02.jpg',
    '宝剑三': 's03.jpg',
    '宝剑四': 's04.jpg',
    '宝剑五': 's05.jpg',
    '宝剑六': 's06.jpg',
    '宝剑七': 's07.jpg',
    '宝剑八': 's08.jpg',
    '宝剑九': 's09.jpg',
    '宝剑十': 's10.jpg',
    '宝剑侍从': 's11.jpg',
    '宝剑骑士': 's12.jpg',
    '宝剑王后': 's13.jpg',
    '宝剑皇后': 's13.jpg',
    '宝剑国王': 's14.jpg',
    '权杖一': 'w01.jpg',
    '权杖二': 'w02.jpg',
    '权杖三': 'w03.jpg',
    '权杖四': 'w04.jpg',
    '权杖五': 'w05.jpg',
    '权杖六': 'w06.jpg',
    '权杖七': 'w07.jpg',
    '权杖八': 'w08.jpg',
    '权杖九': 'w09.jpg',
    '权杖十': 'w10.jpg',
    '权杖侍从': 'w11.jpg',
    '权杖骑士': 'w12.jpg',
    '权杖王后': 'w13.jpg',
    '权杖皇后': 'w13.jpg',
    '权杖国王': 'w14.jpg'
  };

  return nameMap[cardName] || 'cardback.png';
}
