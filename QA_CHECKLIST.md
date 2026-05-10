# QA Checklist — 塔罗解读应用

---

## 1. Critical Path
> 用户从选牌阵到拿到解读结果的完整路径。这条路径上任何一步失败，应用的核心价值就无法交付。与交互方式（鼠标/手势）无关。

- [ ] 用户选择牌阵类型，页面正确跳转到问题输入页 `/start`
- [ ] 用户输入问题后点击开始，跳转到 `/ritual`，URL 携带正确的 `spread`、`question`、`lang` 参数
- [ ] 用户完成抽牌（填满所有卡槽），自动跳转到 `/loading`
- [ ] Loading 页发起 API 请求；无论 API 成功还是失败，均跳转到 `/reading`（不卡死、不空白、不报错）
- [ ] 解读页展示的卡牌数量与所选牌阵一致（单张 1 张、三张牌阵 3 张、五张牌阵 5 张）
- [ ] 解读内容与用户的问题相关（API 成功时），或展示完整的 fallback 内容（API 失败时）
- [ ] 解读页语言与用户选择的语言一致（中文/英文）

---

## 2. Supporting Flows
> Critical path 之外的功能。单独失败不影响核心价值交付，但影响整体体验质量。

### 2.1 鼠标模式 — 抽牌交互
- [ ] Mode select overlay 出现；选择「鼠标」后自动开始洗牌（无需用户点击）
- [ ] 洗牌动画播放约 900ms，随后扇形自动展开（约 400ms 后）
- [ ] Hover 扇形牌时显示放大 + 光晕效果，粒子特效触发
- [ ] 点击一张牌放入下一个空槽，翻牌动画播放
- [ ] 重复点击依次填满所有槽位

### 2.2 手势模式 — 抽牌交互
- [ ] 选择「手势」触发摄像头权限请求
- [ ] 摄像头加载后手部检测激活，手势引导文案出现
- [ ] 手势模式下 OS 光标隐藏（`cursor: none`）
- [ ] Tinkerbell 星形光标跟随食指移动，带粒子尾迹
- [ ] Hover 牌时卡片上浮（`translateY(-36px)`）并显示脉冲选中动画
- [ ] Pinch 动作抓取已 hover 的牌（即使 pinch 时手指轻微位移也不漏抓）
- [ ] 抓取后浮动卡片图像随手指移动，无 EMA 延迟感
- [ ] 松开 pinch 将牌放入最近的空槽
- [ ] 所有槽填满后，在屏幕中央区域 pinch 触发跳转
- [ ] 手离开画面时，hover/drag 状态正确清除

### 2.3 语言切换
- [ ] `lang=en` URL 参数切换所有 UI 文案为英文
- [ ] `lang=zh` URL 参数显示中文
- [ ] 卡槽标签随语言切换（中文：当前状况 / 英文：Current 等）
- [ ] Loading 页进度文案随语言切换
- [ ] Fallback 解读内容语言与 `lang` 参数一致

### 2.4 历史记录与日历
- [ ] 完成解读后，记录出现在 `/history`
- [ ] 5 秒内重复保存不产生重复条目
- [ ] 最多保留 50 条，超出后自动删除最旧的
- [ ] `/calendar` 按日期展示解读记录，点击日期可查看对应解读
- [ ] 历史条目显示问题内容、牌阵类型、时间戳

---

## 3. API & Backend

### 3.1 `/api/reading`（POST）
- [ ] 缺少 `question` 或 `spread` 字段时返回 400
- [ ] `spread` 传入枚举以外的值时返回 400
- [ ] API 成功时返回 200，格式为 `MixedTarotReading`，包含 `cards`、`readingResults`、`keyMessages`
- [ ] API 失败时返回 200 + fallback 内容，**不返回 500**
- [ ] Fallback 卡牌数量与 `spread` 类型一致
- [ ] `lang` 参数传入 AI 提示词，fallback 内容也使用对应语言
- [ ] 传入 `cards` 时使用预选牌，而非随机抽牌
- [ ] 429 错误立即触发 fallback，服务器日志中只出现一次请求记录（无重试）
- [ ] GET `/api/reading` 返回 `{ status: 'healthy' }`

### 3.2 `/api/session` + `/api/draw`（公平随机协议）
- [ ] POST `/api/session` 返回 `sessionId`、`commitHash`、`timestamp`
- [ ] POST `/api/draw` 使用有效 session，返回确定性卡牌集合
- [ ] 相同 `sessionId` + 相同位置参数，每次返回相同的牌（确定性验证）
- [ ] 抽牌后 session 删除；用同一 `sessionId` 再次抽牌返回 400 或 404
- [ ] 无效或缺失的 `sessionId` 返回 400 或 404

### 3.3 `/api/feedback`（POST）
- [ ] `AIRTABLE_TOKEN` 已配置时，评分和评论成功写入 Airtable
- [ ] Airtable 凭证未配置时，返回 200，不报错（graceful fallback）
- [ ] 评论为空时不报错

### 3.4 `/api/health`（GET）
- [ ] 返回 `{ status: 'healthy', openai: true/false }`
- [ ] API key 无效或 quota 超限时，`openai` 字段为 `false`
- [ ] 响应中不包含原始 API key 值

---

## 4. 安全

### 4.1 密钥与敏感信息
- [ ] `OPENAI_API_KEY` 不出现在任何 API 响应或客户端 bundle 中
- [ ] `AIRTABLE_TOKEN` 不暴露在客户端
- [ ] `/api/health` 只返回布尔状态，不返回密钥明文

### 4.2 输入校验
- [ ] `question` 字段内容不以原始 HTML 渲染（防 XSS）
- [ ] `question` 字段有最大长度限制（Zod schema 层面执行）
- [ ] `spread` 枚举值在服务端校验，非法值返回 400
- [ ] `lang` 只接受 `'zh' | 'en'`，其他值回退到默认语言

### 4.3 Session / 公平随机
- [ ] Session seed 使用 HMAC-SHA256，无法从 `commitHash` 反推
- [ ] Session 使用后立即删除，不可重放
- [ ] `sessionId` 为 UUID，不可预测、不可枚举

### 4.4 内容安全
- [ ] 涉及敏感话题（自伤、医疗、法律）的问题触发 `detectSensitiveContent`，解读结果附加免责声明
- [ ] 解读内容不作出绝对性预测或替代专业建议

---

## 5. 性能

### 5.1 加载时长
- [ ] 首页初始加载 < 3 秒（4G 网络条件）
- [ ] Loading 页 → 解读页跳转：quota 超限时 < 6 秒（fallback 路径）
- [ ] Loading 页 → 解读页跳转：`gpt-4o-mini` 正常工作时 < 6 秒

### 5.2 手势响应
- [ ] 缓慢移动时光标延迟 < 2 帧（EMA base alpha 0.28）
- [ ] 快速移动时光标近乎即时跟随（alpha → 1.0）
- [ ] 拖拽时浮动卡片使用 raw 坐标，无 EMA 延迟
- [ ] 卡片可见 hover 状态下，pinch 抓取成功率 > 95%

### 5.3 渲染效率
- [ ] 15 张手势牌的 hover 效果通过 DOM 直接操作实现，不触发 React 重渲染
- [ ] 78 张扇形牌的 hover 效果使用 CSS `onMouseEnter`，不触发 React 重渲染
- [ ] 粒子画布使用 `requestAnimationFrame`，切换标签页时自动暂停
- [ ] 粒子数量上限：trail ≤ 200，drag ≤ 150，不存在内存泄漏
- [ ] 浏览器窗口 resize 时粒子画布尺寸正确更新

---

## 6. 错误处理与边界场景

### 6.1 网络故障
- [ ] Loading 页 fetch 抛出异常时，跳转到 `/reading?error=true`，不显示空白页
- [ ] 解读页检测到 `sessionStorage` 中 `{ error: true }` 时，显示错误提示

### 6.2 摄像头 / 手势错误
- [ ] 摄像头权限拒绝 → 引导文案显示「摄像头不可用」，不崩溃
- [ ] 设备无摄像头硬件 → 手势模式失败时显示友好提示，鼠标模式仍可正常使用
- [ ] 从手势模式切换到鼠标模式时，摄像头流正确关闭

### 6.3 API 失败
- [ ] 429 quota 超限 → fallback 内容正确渲染（非空白）
- [ ] 模型名称无效 → fallback 内容正确渲染
- [ ] OpenAI 返回格式错误的 JSON → Zod 校验失败 → fallback 触发
- [ ] AI 返回卡牌数量与牌阵不符 → 规范化为正确数量或触发 fallback

### 6.4 存储边界
- [ ] `localStorage` 不可用（隐私浏览模式）→ 历史记录静默禁用，不崩溃
- [ ] `sessionStorage` 不可用 → Loading 页使用默认卡牌数据
- [ ] `/reading` 加载时 `sessionStorage` 中无 `readingResult` → 显示错误状态

### 6.5 各牌阵类型
- [ ] 单张牌阵：1 个槽位，解读显示 1 张牌
- [ ] 三张牌阵（现状-行动-结果）：3 个槽位，解读显示 3 张牌
- [ ] 五张牌阵：5 个槽位，解读显示 5 张牌
- [ ] 以上三种牌阵的卡槽标签在中英文下均正确显示

---

## 7. UI 与布局

### 7.1 移动端（390px，iPhone 14 为基准）
- [ ] 所有页面在 390px 宽度内无横向滚动条
- [ ] 所有可点击元素触控区域 ≥ 44×44px
- [ ] 扇形牌不被顶部 header 或底部导航遮挡，全部可点击
- [ ] 解读页文字在系统默认字号下可正常阅读
- [ ] 卡槽标签无截断

### 7.2 桌面端（> 768px）
- [ ] 应用内容居中显示，宽度受限（手机壳形态）
- [ ] 手势光标在更宽屏幕上位置准确
- [ ] 粒子画布覆盖完整视口

### 7.3 屏幕方向
- [ ] 竖屏：所有流程正常
- [ ] 横屏（移动端）：牌组和卡槽无需滚动即可看到

### 7.4 动画
- [ ] 卡槽翻牌：3D 旋转流畅，无闪烁
- [ ] Mode select overlay：淡入淡出正常
- [ ] Tinkerbell 光标：3.5 秒/圈自转，每 2 秒呼吸一次
- [ ] 手势 hover 卡片：180ms 内平滑上浮，脉冲环每 1.2 秒循环
- [ ] 「正在进入解读…」文字在跳转等待时持续脉冲

---

## 8. 无障碍访问

- [ ] 所有可交互元素有 `aria-label` 或可见文字标签
- [ ] 装饰性元素（光标、画布、浮动牌）标注 `aria-hidden`
- [ ] `LiveAnnouncer` 在关键状态变化时触发（牌已抽取、解读已生成）
- [ ] 键盘导航在鼠标模式下可用（Tab 选牌，Enter 确认）
- [ ] 深色背景上正文颜色对比度 ≥ 4.5:1
- [ ] 可交互元素获取焦点时有可见的 focus ring

---

## 9. 回归测试（每次代码改动后执行）
> 每次改动后只需跑这 10 条，5 分钟内可完成。

| 测试项 | 涉及模块 |
|---|---|
| Critical path 全程可走通（选牌阵 → 输入问题 → 抽牌 → 解读） | 全链路 |
| 鼠标模式：自动洗牌 + 自动展开扇形，无需用户点击 | ritual/mouse |
| 手势模式：hover 显示脉冲环动画（非静态光晕） | ritual/gesture |
| 手势模式：pinch 时即使手指轻微位移也能成功抓牌 | ritual/gesture |
| Tinkerbell 星形光标自转且带粒子尾迹 | ritual/gesture |
| API 失败时 fallback 解读内容正常渲染（非空白页） | api/reading |
| 429 错误只触发一次请求，无重试（查看服务器日志） | openai.ts |
| 解读完成后历史记录正确保存 | reading/history |
| 语言参数完整传递：ritual → loading URL → API → 解读页 | i18n 链路 |
| 卡槽标签语言正确（中文：当前状况 / 英文：Current） | ritual labels |

---

## 10. 发布前检查

- [ ] `MODEL_NAME=gpt-4o-mini` 已配置到生产环境变量
- [ ] `OPENAI_API_KEY` 有足够余额（通过 `/api/health` 验证）
- [ ] `NEXT_PUBLIC_APP_NAME` 已设置
- [ ] Airtable 凭证已配置；若未配置，确认 graceful fallback 正常
- [ ] 代码中无 `console.log` 输出敏感信息（API key、用户问题明文）
- [ ] `/debug`、`/test-api`、`/test-images`、`/test-pt` 页面在生产环境不可访问或已删除
- [ ] 用户可见的错误提示不包含原始 stack trace
- [ ] 在真实 iOS Safari 和 Android Chrome 上完整跑一遍 Critical Path
