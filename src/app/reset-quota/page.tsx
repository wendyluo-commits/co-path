'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetQuotaPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('tarot-daily-limit');
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-black text-white text-sm">
      正在重置使用限制…
    </div>
  );
}
