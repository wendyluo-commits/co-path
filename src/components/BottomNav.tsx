'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      id: 'amulet',
      label: '御守',
      path: '/amulet',
      iconOff: '/御守_off.png',
      iconOn: '/御守_on.png',
    },
    {
      id: 'reading',
      label: '解读',
      path: '/',
      iconOff: '/解读_off.png',
      iconOn: '/解读_on.png',
    },
    {
      id: 'profile',
      label: '我',
      path: '/profile',
      iconOff: '/我_off.png',
      iconOn: '/我_on.png',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      // 首页及其相关页面都算激活
      return pathname === '/' || 
             pathname.startsWith('/start') || 
             pathname.startsWith('/ritual') || 
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
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'transparent' }}>
      <div className="flex items-center justify-around h-20 max-w-screen-lg mx-auto px-8">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-opacity hover:opacity-70"
            >
              <img
                src={active ? item.iconOn : item.iconOff}
                alt={item.label}
                className="h-12 w-12 object-contain"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

