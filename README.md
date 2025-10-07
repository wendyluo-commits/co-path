# AI 塔罗解读 Web 应用

基于 Next.js 和 OpenAI 的 AI 驱动塔罗牌解读服务，提供单张牌和三张牌解读功能。

## 🌟 特性

- **AI 驱动解读**: 使用 OpenAI GPT-4o 和 Structured Outputs 确保高质量、结构化的解读结果
- **多种牌阵**: 支持单张牌快速洞察和三张牌（过去-现在-未来）全面解读
- **个性化体验**: 可选择温和或直接的解读语气
- **安全边界**: 内置安全检测，对敏感话题提供适当的边界提示
- **响应式设计**: 适配桌面和移动设备
- **隐私保护**: 不存储用户问题，仅在解读期间临时处理

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI 模型**: OpenAI GPT-4o
- **验证**: Zod
- **部署**: Vercel
- **图标**: Lucide React

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- OpenAI API Key

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，添加必要的环境变量：
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MODEL_NAME=gpt-4o
   NEXT_PUBLIC_APP_NAME=AI塔罗解读
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── reading/       # 塔罗解读 API
│   │   └── health/        # 健康检查 API
│   ├── reading/           # 解读结果页
│   ├── terms/             # 服务条款页
│   ├── privacy/           # 隐私政策页
│   └── page.tsx           # 主页
├── components/            # 可复用组件
├── lib/                   # 工具库
│   ├── openai.ts         # OpenAI 客户端
│   └── tarot.ts          # 塔罗牌逻辑
├── data/                  # 静态数据
│   └── tarot-cards.json  # 塔罗牌知识库
├── schemas/               # 数据验证
│   └── reading.schema.ts  # 解读数据结构
└── prompts/               # AI 提示词
    └── reading.ts         # 解读提示词模板
```

## 🔧 API 接口

### POST /api/reading

生成塔罗解读

**请求体:**
```json
{
  "question": "我该如何准备下周面试？",
  "spread": "three_card",
  "seed": 123456,
  "lang": "zh",
  "tone": "direct"
}
```

**响应:**
```json
{
  "spread": "three_card",
  "question": "我该如何准备下周面试？",
  "cards": [...],
  "overall": "整体解读内容...",
  "action_steps": ["具体行动建议..."],
  "safety_note": "安全提示（如有）",
  "tone": "direct"
}
```

### GET /api/health

服务健康检查

**响应:**
```json
{
  "ok": true,
  "timestamp": "2024-08-20T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## 🛡 安全特性

- **内容安全**: 自动检测敏感话题并提供适当的边界提示
- **数据保护**: 不长期存储用户问题，仅在解读期间临时处理
- **错误处理**: 完善的错误处理和降级机制
- **速率限制**: 防止滥用的保护机制

## 📋 部署到 Vercel

1. **连接 Git 仓库**
   - 登录 Vercel 控制台
   - 导入 Git 仓库

2. **配置环境变量**
   在 Vercel 项目设置中添加环境变量：
   - `OPENAI_API_KEY`
   - `MODEL_NAME`
   - `NEXT_PUBLIC_APP_NAME`

3. **部署**
   Vercel 会自动检测 Next.js 项目并部署

## 🧪 测试

```bash
# 运行类型检查
npm run type-check

# 运行 linter
npm run lint

# 构建项目
npm run build
```

## 📄 许可证

本项目仅供学习和娱乐使用。

## ⚠️ 免责声明

本服务仅用于娱乐与自我反思，不提供医疗、法律或财务建议。如遇到安全或健康风险，请立即联系当地专业机构或紧急服务。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📞 联系我们

如有任何问题或建议，请通过项目 Issue 与我们联系。