'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function CupPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative">
      <img 
        src="/cup.png" 
        alt="Cup Blessing" 
        className="w-full h-full object-cover"
      />
      {/* 返回按钮 */}
      <button 
        className="absolute top-6 left-6 p-2 -ml-2 text-black hover:text-gray-800 rounded-lg transition-colors"
        onClick={() => router.push('/')}
        aria-label="返回"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
