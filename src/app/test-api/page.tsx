'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('开始测试API调用...');
      
      const response = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: '测试问题',
          spread: 'single',
          tone: 'gentle',
          lang: 'zh',
          seed: 123456,
          useNewFormat: true,  // 启用新的解读格式
          cards: [{
            name: '愚者',
            orientation: 'upright',
            position: '当前状况',
            suit: 'major',
            number: 0,
            keywords: ['开始', '冒险', '自由']
          }]
        })
      });

      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API调用成功:', data);
      
      // 测试保存到sessionStorage
      sessionStorage.setItem('readingResult', JSON.stringify(data));
      console.log('已保存到sessionStorage');
      
      // 测试从sessionStorage读取
      const stored = sessionStorage.getItem('readingResult');
      console.log('从sessionStorage读取:', stored);
      
      setResult(data);
      
    } catch (err) {
      console.error('测试失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API测试页面</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '测试中...' : '测试API调用'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold">错误:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-bold">成功!</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
