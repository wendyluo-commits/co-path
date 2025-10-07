'use client';

import { getTarotCardImage } from '@/lib/tarot-images';
import Image from 'next/image';
import Link from 'next/link';

export default function TestImagesPage() {
  const testCards = [
    "愚者",      // m00.jpg
    "魔术师",    // m01.jpg  
    "宝剑王牌",  // s01.jpg
    "宝剑侍从",  // s11.jpg
    "宝剑骑士",  // s12.jpg
    "宝剑王后",  // s13.jpg
    "宝剑国王",  // s14.jpg
    "圣杯王牌",  // c01.jpg
    "权杖王牌",  // w01.jpg
    "星币王牌"   // p01.jpg
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">塔罗牌图片测试</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {testCards.map((cardName) => {
            const imagePath = getTarotCardImage(cardName);
            return (
              <div key={cardName} className="text-center">
                <div className="relative w-32 h-52 mx-auto mb-2 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={imagePath}
                    alt={cardName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 128px) 100vw, 128px"
                    onError={(e) => {
                      console.error(`图片加载失败: ${cardName} -> ${imagePath}`);
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-700">{cardName}</div>
                <div className="text-xs text-gray-500">{imagePath}</div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
