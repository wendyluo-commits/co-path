import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">服务条款</h1>
            <p className="text-gray-600 mt-2">最后更新：2024年8月</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 服务性质</h2>
              <p className="text-gray-700 mb-6">
                AI塔罗解读是一个基于人工智能技术的娱乐性塔罗牌解读服务。本服务旨在为用户提供自我反思和娱乐体验，不构成任何形式的专业建议。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 免责声明</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">重要提醒</h3>
                  <ul className="text-yellow-700 text-sm space-y-2">
                    <li>• 本服务仅供娱乐和自我反思使用</li>
                    <li>• 不提供医疗、法律、财务或其他专业建议</li>
                    <li>• 不应作为重大决策的唯一依据</li>
                    <li>• 结果基于算法生成，不具有预测未来的能力</li>
                  </ul>
                </div>
                
                <p className="text-gray-700">
                  用户理解并同意，塔罗解读结果仅为娱乐性质的内容，不应替代专业咨询。对于健康问题，请咨询医生；对于法律问题，请咨询律师；对于财务问题，请咨询专业理财顾问。
                </p>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 使用限制</h2>
              <ul className="text-gray-700 space-y-2 mb-6">
                <li>• 用户必须年满18岁使用本服务</li>
                <li>• 未满18岁的用户需要在成年人指导下使用</li>
                <li>• 禁止使用本服务进行非法活动</li>
                <li>• 禁止滥用或过度依赖本服务</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 数据处理</h2>
              <p className="text-gray-700 mb-6">
                我们重视您的隐私。用户提交的问题仅用于生成塔罗解读，不会被存储或用于其他目的。详细信息请参阅我们的
                <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline ml-1">
                  隐私政策
                </Link>
                。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 服务可用性</h2>
              <p className="text-gray-700 mb-6">
                我们努力保持服务的稳定运行，但不保证服务的持续可用性。服务可能因维护、升级或其他原因暂时中断。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. 责任限制</h2>
              <p className="text-gray-700 mb-6">
                在法律允许的最大范围内，我们不对因使用本服务而导致的任何直接或间接损失承担责任。用户使用本服务的风险由其自行承担。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. 紧急情况</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-800 mb-2">如果您遇到紧急情况</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• 自伤或自杀想法：请立即拨打心理危机干预热线 400-161-9995</li>
                  <li>• 医疗急救：请拨打 120</li>
                  <li>• 其他紧急情况：请拨打 110 或 119</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. 条款变更</h2>
              <p className="text-gray-700 mb-6">
                我们保留随时修改这些条款的权利。重大变更将通过网站通知用户。继续使用服务即表示接受修改后的条款。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. 联系我们</h2>
              <p className="text-gray-700">
                如有任何问题或建议，请通过网站提供的联系方式与我们联系。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
