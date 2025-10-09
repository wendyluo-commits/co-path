#!/bin/bash

# 英文塔罗牌解读质量保证测试运行脚本

echo "🔮 英文塔罗牌解读质量保证测试"
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查开发服务器是否运行
echo "🔍 检查开发服务器状态..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "⚠️  开发服务器未运行，正在启动..."
    echo "请先运行: npm run dev"
    echo "然后在另一个终端运行此测试"
    exit 1
fi

echo "✅ 开发服务器正在运行"

# 运行测试
echo "🚀 开始运行质量保证测试..."
node qa-simple-test.js

# 检查测试结果
if [ $? -eq 0 ]; then
    echo "🎉 所有测试通过！"
else
    echo "❌ 测试失败，请检查报告"
    exit 1
fi
