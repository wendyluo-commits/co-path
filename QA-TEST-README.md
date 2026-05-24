# 🔮 英文塔罗牌解读质量保证测试

## 概述

这套质量保证测试确保英文模式下的塔罗牌解读内容始终是英文，不会出现中文内容。

## 测试文件

### 1. `qa-simple-test.js` - 简化API测试
- **用途**: 直接通过API测试，无需浏览器
- **优点**: 快速、简单、无依赖
- **适用**: 日常开发和CI/CD

### 2. `qa-test-english-reading.js` - 完整浏览器测试
- **用途**: 模拟真实用户操作流程
- **优点**: 测试完整用户体验
- **适用**: 深度测试和用户验收测试

## 快速开始

### 1. 确保开发服务器运行
```bash
npm run dev
```

### 2. 运行简化测试
```bash
npm run test:qa
```

### 3. 运行完整测试（需要安装Playwright）
```bash
npm install playwright
npm run test:qa:full
```

## 测试内容

### 英文模式测试
- ✅ 问题输入为英文
- ✅ 解读标题为英文
- ✅ 解读内容为英文
- ✅ 关键信息为英文
- ✅ 建议内容为英文

### 中文模式测试（对比）
- ✅ 问题输入为中文
- ✅ 解读内容为中文
- ✅ 确保中英文模式不互相干扰

## 测试指标

### 语言检测规则
1. **中文字符检测**: 不允许出现 `[\u4e00-\u9fff]` 字符
2. **英文关键词检测**: 必须包含英文关键词
3. **句子结构检测**: 符合英文语法模式

### 评分系统
- **100分**: 完全符合英文要求
- **80-99分**: 基本符合，有少量问题
- **60-79分**: 部分符合，需要改进
- **0-59分**: 不符合要求，需要修复

## 测试报告

### 控制台输出
```
🧪 开始测试: Test 1: EN - "What should be my main career path..."
✅ 测试通过: Test 1: EN - "What should be my main career path..." (分数: 100)

📊 测试报告
==================================================
总测试数: 6
通过测试: 6
失败测试: 0
成功率: 100.0%
```

### 详细报告文件
- `qa-simple-test-report.json`: JSON格式详细报告
- `qa-test-report.html`: HTML格式可视化报告

## 故障排除

### 常见问题

#### 1. 测试失败：API请求失败
```bash
# 检查开发服务器是否运行
curl http://localhost:3000/api/health
```

#### 2. 测试失败：解读内容包含中文
- 检查语言参数是否正确传递
- 检查LLM prompt是否正确
- 检查API路由语言处理

#### 3. 测试失败：Playwright依赖问题
```bash
# 安装Playwright
npm install playwright
npx playwright install
```

### 调试模式

#### 启用详细日志
```javascript
// 在测试文件中添加
console.log('调试信息:', data);
```

#### 检查语言参数传递
```bash
# 查看浏览器控制台日志
# Loading页面发送的语言参数: en
# API路由接收到的语言参数: en
# LLM 函数接收到的语言参数: en
```

## 持续集成

### GitHub Actions示例
```yaml
name: QA Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev &
      - run: sleep 10
      - run: npm run test:qa
```

## 自定义测试

### 添加新的测试问题
```javascript
const TEST_CONFIG = {
  testQuestions: {
    en: [
      "What should be my main career path right now?",
      "Your new question here..."
    ]
  }
};
```

### 修改检测规则
```javascript
const ENGLISH_DETECTION_RULES = {
  requiredWords: ['the', 'and', 'you', 'your'],
  forbiddenChars: /[\u4e00-\u9fff]/,
  sentencePatterns: [
    /\b(you|your)\b.*\b(is|are|will|can)\b/i
  ]
};
```

## 最佳实践

1. **定期运行测试**: 每次代码更改后运行
2. **监控测试结果**: 关注成功率趋势
3. **及时修复问题**: 测试失败时立即修复
4. **更新测试用例**: 根据新功能更新测试
5. **文档化问题**: 记录和分享解决方案

## 联系支持

如果测试遇到问题，请检查：
1. 开发服务器是否正常运行
2. 网络连接是否正常
3. 依赖包是否完整安装
4. 环境变量是否正确设置
