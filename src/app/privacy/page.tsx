import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold text-gray-800">隐私政策</h1>
            <p className="text-gray-600 mt-2">最后更新：2024年8月</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="prose max-w-none">
              {/* Privacy Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-800">数据保护</h3>
                  <p className="text-sm text-green-700">严格保护用户隐私</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-blue-800">透明处理</h3>
                  <p className="text-sm text-blue-700">明确告知数据用途</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-purple-800">最小收集</h3>
                  <p className="text-sm text-purple-700">仅收集必要信息</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Lock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-medium text-orange-800">安全存储</h3>
                  <p className="text-sm text-orange-700">加密传输和存储</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. 信息收集</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">我们收集的信息：</h3>
                  <ul className="text-gray-700 space-y-2 ml-4">
                    <li>• <strong>用户问题</strong>：您输入的塔罗解读问题</li>
                    <li>• <strong>偏好设置</strong>：选择的牌阵类型、语气偏好等</li>
                    <li>• <strong>技术信息</strong>：IP地址、浏览器类型、访问时间（用于服务优化）</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">我们不收集的信息：</h3>
                  <ul className="text-gray-700 space-y-2 ml-4">
                    <li>• 个人身份信息（姓名、电话、邮箱等）</li>
                    <li>• 财务信息</li>
                    <li>• 敏感个人数据</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 信息使用</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">数据使用目的</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 生成个性化的塔罗解读结果</li>
                  <li>• 改进服务质量和用户体验</li>
                  <li>• 进行匿名的使用统计分析</li>
                  <li>• 确保服务安全和稳定运行</li>
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. 数据存储和安全</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">存储方式：</h3>
                  <ul className="text-gray-700 space-y-2 ml-4">
                    <li>• <strong>临时存储</strong>：用户问题仅在生成解读期间临时存储</li>
                    <li>• <strong>会话存储</strong>：解读结果在用户浏览器中本地存储</li>
                    <li>• <strong>无长期存储</strong>：我们不在服务器端长期保存用户问题</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">安全措施：</h3>
                  <ul className="text-gray-700 space-y-2 ml-4">
                    <li>• HTTPS 加密传输</li>
                    <li>• 服务器端数据加密</li>
                    <li>• 定期安全审查</li>
                    <li>• 访问控制和权限管理</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. 第三方服务</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">OpenAI API</h3>
                  <p className="text-yellow-700 text-sm">
                    我们使用 OpenAI 的 API 来生成塔罗解读。您的问题会被发送到 OpenAI 进行处理，但不会被 OpenAI 用于训练模型。
                    请查看 <a href="https://openai.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">OpenAI 隐私政策</a> 了解更多信息。
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">分析服务</h3>
                  <p className="text-gray-700 text-sm">
                    我们可能使用匿名分析工具来了解服务使用情况，这些工具不会收集个人身份信息。
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 用户权利</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">您有权：</h3>
                  <ul className="text-gray-700 space-y-2 ml-4">
                    <li>• <strong>访问权</strong>：了解我们收集了哪些关于您的信息</li>
                    <li>• <strong>删除权</strong>：要求删除您的个人信息</li>
                    <li>• <strong>更正权</strong>：更正不准确的个人信息</li>
                    <li>• <strong>拒绝权</strong>：拒绝某些数据处理活动</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Cookie 和本地存储</h2>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  我们使用浏览器本地存储来保存您的解读结果，这样您可以在会话期间查看结果。这些数据存储在您的设备上，不会发送到我们的服务器。
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">清除数据</h3>
                  <p className="text-green-700 text-sm">
                    您可以随时通过清除浏览器数据或关闭浏览器标签页来删除本地存储的解读结果。
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. 儿童隐私</h2>
              <p className="text-gray-700 mb-6">
                我们的服务主要面向成年用户。我们不会故意收集13岁以下儿童的个人信息。如果您发现我们无意中收集了儿童信息，请联系我们，我们将立即删除。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. 政策更新</h2>
              <p className="text-gray-700 mb-6">
                我们可能会定期更新此隐私政策。重大更改将通过网站通知用户。建议您定期查看此页面以了解最新信息。
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. 联系我们</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2">隐私问题咨询</h3>
                <p className="text-purple-700 text-sm">
                  如果您对我们的隐私政策有任何问题或担忧，请通过网站提供的联系方式与我们联系。我们承诺在收到询问后及时回复。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
