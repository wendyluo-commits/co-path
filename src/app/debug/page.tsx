'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DebugPageContent() {
  const searchParams = useSearchParams();
  
  const fromRitual = searchParams.get('fromRitual');
  const allParams = Object.fromEntries(searchParams.entries());
  
  console.log('Debug页面参数:', { fromRitual, allParams });
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">调试页面</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">URL参数:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(allParams, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">fromRitual参数:</h2>
            <p className="text-lg">
              fromRitual = &quot;{fromRitual}&quot; (类型: {typeof fromRitual})
            </p>
            <p className="text-lg">
              fromRitual === &apos;true&apos; = {fromRitual === 'true' ? 'true' : 'false'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">SessionStorage:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {sessionStorage.getItem('readingResult') || '没有找到readingResult'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebugPageContent />
    </Suspense>
  );
}
