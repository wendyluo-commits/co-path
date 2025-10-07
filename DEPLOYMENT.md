# 部署指南

## 🚀 Vercel 部署步骤

### 1. 准备工作

确保您已经：
- 拥有 OpenAI API Key
- 项目代码已推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）
- 拥有 Vercel 账户

### 2. 部署步骤

1. **登录 Vercel 控制台**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择您的 Git 仓库
   - 选择包含 Next.js 项目的目录（如果是 monorepo）

3. **配置项目**
   - Framework Preset: Next.js
   - Root Directory: `web`（如果项目在子目录中）
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **设置环境变量**
   在 Vercel 项目设置中添加以下环境变量：

   **Production 环境：**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   MODEL_NAME=gpt-4o
   NEXT_PUBLIC_APP_NAME=AI塔罗解读
   ```

   **Preview 环境（可选）：**
   ```
   OPENAI_API_KEY=your_preview_openai_api_key_here
   MODEL_NAME=gpt-4o
   NEXT_PUBLIC_APP_NAME=AI塔罗解读 (Preview)
   ```

   **Development 环境（可选）：**
   ```
   OPENAI_API_KEY=your_dev_openai_api_key_here
   MODEL_NAME=gpt-4o
   NEXT_PUBLIC_APP_NAME=AI塔罗解读 (Dev)
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 1-2 分钟）

### 3. 验证部署

部署完成后：

1. **检查主页**
   - 访问分配的域名
   - 确保页面正常加载

2. **测试健康检查**
   - 访问 `https://your-domain.vercel.app/api/health`
   - 应该返回服务状态信息

3. **测试核心功能**
   - 输入测试问题
   - 选择牌阵类型
   - 提交并检查是否能正常生成解读

### 4. 自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS 记录

### 5. 监控和维护

- **查看部署日志**: Vercel 控制台 → Functions → View Function Logs
- **监控使用情况**: Vercel Analytics
- **设置告警**: Vercel 集成或第三方监控服务

## 🔧 本地开发

如需本地开发和测试：

```bash
# 克隆项目
git clone <your-repo-url>
cd web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加 OpenAI API Key

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 🐛 常见问题

### 构建失败

**问题**: OpenAI API Key 相关错误
**解决**: 确保在 Vercel 环境变量中正确设置了 `OPENAI_API_KEY`

### 运行时错误

**问题**: API 请求失败
**解决**: 检查 OpenAI API Key 是否有效，余额是否充足

**问题**: 解读生成失败
**解决**: 查看 Vercel Function 日志，检查具体错误信息

### 性能问题

**问题**: API 响应慢
**解决**: 
- 检查 OpenAI API 状态
- 考虑优化提示词长度
- 检查网络连接

## 📊 成本估算

- **Vercel**: Hobby 计划免费，Pro 计划 $20/月
- **OpenAI API**: 按使用量计费，GPT-4o 约 $0.0025/1K tokens
- **域名**: 可选，约 $10-15/年

## 🔒 安全建议

1. **API Key 安全**
   - 不要在代码中硬编码 API Key
   - 定期轮换 API Key
   - 监控 API 使用量

2. **访问控制**
   - 考虑添加速率限制
   - 监控异常访问模式

3. **数据保护**
   - 确保用户问题不被记录
   - 遵循数据保护法规

## 📈 扩展建议

1. **功能增强**
   - 添加更多牌阵类型
   - 支持多语言
   - 添加用户账户系统

2. **技术优化**
   - 添加缓存机制
   - 实现流式响应
   - 集成分析工具

3. **商业化**
   - 集成 Stripe 支付
   - 添加订阅功能
   - 实现使用次数限制
