export default function TestPtPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8">测试 pt-52 类</h1>
      
      <div className="bg-blue-200 p-4 mb-4">
        <p>这是第一个容器</p>
      </div>
      
      <div className="pt-52 bg-red-200 p-4">
        <p>这是 pt-52 容器（应该有208px的上边距）</p>
        <p>如果这个容器距离上面的蓝色容器很远，说明 pt-52 工作正常</p>
      </div>
      
      <div className="bg-green-200 p-4 mt-4">
        <p>这是第三个容器</p>
      </div>
    </div>
  );
}
