'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      id: 'reading',
      label: 'Read',
      path: '/',
      iconOff: '/%E8%A7%A3%E8%AF%BB_off.png',
      iconOn: '/%E8%A7%A3%E8%AF%BB_on.png',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      // 首页及其相关页面都算激活（/ 经 rewrite 会显示为 /home）
      return pathname === '/' ||
             pathname === '/home' ||
             pathname.startsWith('/start') || 
             pathname.startsWith('/ritual') ||
             pathname.startsWith('/canvas') ||
             pathname.startsWith('/draw') || 
             pathname.startsWith('/reading') ||
             pathname.startsWith('/daily') ||
             pathname.startsWith('/coins') ||
             pathname.startsWith('/cup') ||
             pathname.startsWith('/sword') ||
             pathname.startsWith('/wand');
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-gray-600">
      <div className="flex items-center justify-around h-20 max-w-screen-lg mx-auto px-8">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={active ? item.iconOn : item.iconOff}
                alt={item.label}
                className={`h-8 w-8 object-contain mb-1 ${
                  active ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''
                }`}
              />
              <span className={`text-xs font-medium ${
                active ? 'text-white' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}