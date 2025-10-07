#!/bin/bash

# 塔罗解读系统 QA 测试脚本
# 专业质量保证测试

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "🧪 开始塔罗解读系统 QA 测试..."
echo ""

# 测试1: API健康检查
echo "📡 测试 API 健康状态..."
HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/health")
if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ API 健康检查通过"
    ((PASSED++))
else
    echo "❌ API 健康检查失败"
    ((FAILED++))
fi
echo ""

# 测试2: 会话创建
echo "🎯 测试会话创建..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/session" \
  -H "Content-Type: application/json" \
  -d '{"spread": "single", "question": "我当下的事业主线应该是什么？"}')

if echo "$SESSION_RESPONSE" | grep -q '"sessionId"'; then
    echo "✅ 会话创建成功"
    SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
    ((PASSED++))
else
    echo "❌ 会话创建失败"
    ((FAILED++))
fi
echo ""

# 测试3: 抽牌功能
echo "🎴 测试抽牌功能..."
if [ ! -z "$SESSION_ID" ]; then
    DRAW_RESPONSE=$(curl -s -X POST "$BASE_URL/api/draw" \
      -H "Content-Type: application/json" \
      -d "{\"sessionId\": \"$SESSION_ID\", \"positions\": [0]}")
    
    if echo "$DRAW_RESPONSE" | grep -q '"cards"'; then
        echo "✅ 抽牌功能正常"
        CARD_NAME=$(echo "$DRAW_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo "   抽到的牌: $CARD_NAME"
        ((PASSED++))
    else
        echo "❌ 抽牌功能失败"
        ((FAILED++))
    fi
else
    echo "❌ 无法测试抽牌功能（会话创建失败）"
    ((FAILED++))
fi
echo ""

# 测试4: 解读生成
echo "🔮 测试解读生成..."
READING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/reading" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "我当下的事业主线应该是什么？",
    "spread": "single",
    "cards": [{
      "name": "The Fool",
      "suit": "Major",
      "number": 0,
      "position": "当前状况",
      "orientation": "upright",
      "keywords": ["新开始", "冒险精神", "无限可能"]
    }]
  }')

if echo "$READING_RESPONSE" | grep -q '"interpretation"'; then
    echo "✅ 解读生成成功"
    
    # 检查必需元素
    if echo "$READING_RESPONSE" | grep -q '"advice"' && \
       echo "$READING_RESPONSE" | grep -q '"overall"' && \
       echo "$READING_RESPONSE" | grep -q '"action_steps"' && \
       echo "$READING_RESPONSE" | grep -q '"safety_note"'; then
        echo "✅ 解读结构完整"
        ((PASSED++))
    else
        echo "❌ 解读结构不完整"
        ((FAILED++))
    fi
else
    echo "❌ 解读生成失败"
    ((FAILED++))
fi
echo ""

# 测试5: 性能测试
echo "⚡ 测试性能指标..."

# API响应时间测试
echo "  测试 API 响应时间..."
START_TIME=$(date +%s)
curl -s -X GET "$BASE_URL/api/health" > /dev/null
END_TIME=$(date +%s)
API_TIME=$((END_TIME - START_TIME))

if [ $API_TIME -lt 2 ]; then
    echo "✅ API 响应时间: ${API_TIME}s (优秀)"
    ((PASSED++))
elif [ $API_TIME -lt 5 ]; then
    echo "✅ API 响应时间: ${API_TIME}s (良好)"
    ((PASSED++))
else
    echo "❌ API 响应时间: ${API_TIME}s (需要优化)"
    ((FAILED++))
fi

# 解读生成时间测试
echo "  测试解读生成时间..."
START_TIME=$(date +%s)
curl -s -X POST "$BASE_URL/api/reading" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "性能测试",
    "spread": "single",
    "cards": [{
      "name": "The Fool",
      "suit": "Major",
      "number": 0,
      "position": "当前状况",
      "orientation": "upright",
      "keywords": ["新开始"]
    }]
  }' > /dev/null
END_TIME=$(date +%s)
READING_TIME=$((END_TIME - START_TIME))

if [ $READING_TIME -lt 15 ]; then
    echo "✅ 解读生成时间: ${READING_TIME}s (优秀)"
    ((PASSED++))
elif [ $READING_TIME -lt 30 ]; then
    echo "✅ 解读生成时间: ${READING_TIME}s (良好)"
    ((PASSED++))
else
    echo "❌ 解读生成时间: ${READING_TIME}s (需要优化)"
    ((FAILED++))
fi
echo ""

# 测试6: 数据质量检查
echo "🃏 测试牌义数据质量..."
if [ -f "src/data/tarot-cards.json" ]; then
    CARD_COUNT=$(grep -c '"name":' src/data/tarot-cards.json)
    STORY_COUNT=$(grep -c '"story_interpretation":' src/data/tarot-cards.json)
    CAREER_COUNT=$(grep -c '"career_keywords":' src/data/tarot-cards.json)
    
    echo "   总牌数: $CARD_COUNT"
    echo "   故事解读: $STORY_COUNT"
    echo "   职业关键词: $CAREER_COUNT"
    
    if [ $CARD_COUNT -ge 78 ] && [ $STORY_COUNT -ge 70 ] && [ $CAREER_COUNT -ge 70 ]; then
        echo "✅ 牌义数据质量优秀"
        ((PASSED++))
    else
        echo "❌ 牌义数据质量需要改进"
        ((FAILED++))
    fi
else
    echo "❌ 牌义数据文件不存在"
    ((FAILED++))
fi
echo ""

# 生成测试报告
echo "📊 QA 测试报告"
echo "=================="
echo "✅ 通过: $PASSED"
echo "❌ 失败: $FAILED"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 所有测试通过！系统质量优秀！"
    echo ""
    echo "📈 质量指标:"
    echo "   - API 健康状态: ✅"
    echo "   - 功能完整性: ✅"
    echo "   - 性能表现: ✅"
    echo "   - 数据质量: ✅"
    echo ""
    echo "🎯 系统已准备好投入生产使用！"
else
    echo ""
    echo "⚠️  发现问题，需要修复。"
    echo ""
    echo "🔧 建议检查项目:"
    echo "   - 检查服务器状态"
    echo "   - 验证API配置"
    echo "   - 检查数据完整性"
fi
