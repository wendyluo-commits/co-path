import { useState, useEffect } from 'react';

export type Face = {
  id: number;                // 稳定且全局唯一（与卡牌资源 id 一致）
  name: string;              // 例如 "Ace of Cups"
  imageUrl: string;          // 牌面图片
  orientation: 'upright' | 'reversed';
};

export function useCardPreview() {
  const [openFace, setOpenFace] = useState<Face | null>(null);

  useEffect(() => {
    if (openFace) {
      // 锁定页面滚动
      document.body.style.overflow = 'hidden';
      
      // 绑定 ESC 键关闭
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpenFace(null);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
      };
    } else {
      // 恢复页面滚动
      document.body.style.overflow = '';
    }
  }, [openFace]);

  return { openFace, setOpenFace };
}
