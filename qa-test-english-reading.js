/**
 * 英文塔罗牌解读质量保证测试
 * 确保英文模式下的解读内容始终是英文
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 30000, // 30秒超时
  maxRetries: 3,
  languages: ['zh', 'en'],
  testQuestions: {
    zh: [
      "我当下的事业主线应该是什么？",
      "现在是什么正在消耗我的力量？",
      "我怎样才能更勇敢地面对未知与变化？"
    ],
    en: [
      "What should be my main career path right now?",
      "What is currently draining my energy?",
      "How can I face the unknown and changes more bravely?"
    ]
  }
};

// 英文内容检测规则
const ENGLISH_DETECTION_RULES = {
  // 必须包含的英文关键词
  requiredWords: [
    'the', 'and', 'you', 'your', 'this', 'that', 'with', 'for', 'from',
    'will', 'can', 'should', 'may', 'might', 'could', 'would'
  ],
  
  // 禁止出现的中文字符
  forbiddenChars: /[\u4e00-\u9fff]/,
  
  // 英文句子结构模式
  sentencePatterns: [
    /\b(you|your|this|that)\b.*\b(is|are|will|can|should)\b/i,
    /\b(the|a|an)\b.*\b(card|reading|interpretation)\b/i,
    /\b(it|this)\b.*\b(suggests|indicates|reveals)\b/i
  ]
};

// 测试结果存储
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: [],
  details: []
};

/**
 * 检测文本是否为英文
 */
function isEnglishText(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // 检查是否包含中文字符
  if (ENGLISH_DETECTION_RULES.forbiddenChars.test(text)) {
    return false;
  }

  // 检查是否包含英文关键词
  const hasEnglishWords = ENGLISH_DETECTION_RULES.requiredWords.some(word => 
    text.toLowerCase().includes(word)
  );

  // 检查英文句子结构
  const hasEnglishStructure = ENGLISH_DETECTION_RULES.sentencePatterns.some(pattern => 
    pattern.test(text)
  );

  return hasEnglishWords || hasEnglishStructure;
}

/**
 * 分析解读内容
 */
function analyzeReadingContent(reading) {
  const analysis = {
    isEnglish: true,
    issues: [],
    score: 0
  };

  // 检查各个部分
  const sections = [
    { name: 'overall', content: reading.overall },
    { name: 'keyMessages', content: reading.keyMessages },
    { name: 'readingResults', content: reading.readingResults }
  ];

  sections.forEach(section => {
    if (section.content) {
      if (Array.isArray(section.content)) {
        // 处理数组内容
        section.content.forEach((item, index) => {
          if (typeof item === 'string') {
            if (!isEnglishText(item)) {
              analysis.isEnglish = false;
              analysis.issues.push(`${section.name}[${index}] contains non-English content`);
            }
          } else if (typeof item === 'object') {
            // 处理对象内容
            Object.keys(item).forEach(key => {
              if (typeof item[key] === 'string' && !isEnglishText(item[key])) {
                analysis.isEnglish = false;
                analysis.issues.push(`${section.name}[${index}].${key} contains non-English content`);
              }
            });
          }
        });
      } else if (typeof section.content === 'string') {
        if (!isEnglishText(section.content)) {
          analysis.isEnglish = false;
          analysis.issues.push(`${section.name} contains non-English content`);
        }
      }
    }
  });

  // 计算分数
  analysis.score = analysis.isEnglish ? 100 : Math.max(0, 100 - (analysis.issues.length * 20));

  return analysis;
}

/**
 * 执行单个测试
 */
async function runSingleTest(question, language, testIndex) {
  const testName = `Test ${testIndex + 1}: ${language.toUpperCase()} - "${question.substring(0, 30)}..."`;
  
  try {
    console.log(`\n🧪 开始测试: ${testName}`);
    
    // 模拟浏览器环境
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 设置语言偏好
    await page.evaluate((lang) => {
      localStorage.setItem('language', lang);
    }, language);

    // 导航到开始页面
    await page.goto(`${TEST_CONFIG.baseUrl}/start?spread=single&seed=${Date.now()}&fromDaily=true`);
    await page.waitForLoadState('networkidle');

    // 等待语言切换完成
    await page.waitForTimeout(1000);

    // 检查当前语言设置
    const currentLanguage = await page.evaluate(() => {
      return localStorage.getItem('language');
    });

    if (currentLanguage !== language) {
      throw new Error(`Language not set correctly. Expected: ${language}, Got: ${currentLanguage}`);
    }

    // 输入问题
    await page.fill('input[placeholder*="question"], input[placeholder*="问题"]', question);
    await page.click('button[type="submit"], button:has-text("选好了"), button:has-text("Confirm")');

    // 等待跳转到ritual页面
    await page.waitForURL('**/ritual**');
    await page.waitForLoadState('networkidle');

    // 等待自动洗牌完成
    await page.waitForTimeout(2000);

    // 点击开始解读
    await page.click('button:has-text("开始解读"), button:has-text("Start Reading")');

    // 等待跳转到loading页面
    await page.waitForURL('**/loading**');
    await page.waitForLoadState('networkidle');

    // 等待解读完成（最多30秒）
    await page.waitForURL('**/reading**', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    // 获取解读结果
    const readingData = await page.evaluate(() => {
      const result = sessionStorage.getItem('readingResult');
      return result ? JSON.parse(result) : null;
    });

    if (!readingData) {
      throw new Error('No reading data found in sessionStorage');
    }

    // 分析解读内容
    const analysis = analyzeReadingContent(readingData);

    // 记录测试结果
    const testResult = {
      testName,
      question,
      language,
      success: analysis.isEnglish,
      score: analysis.score,
      issues: analysis.issues,
      readingData: {
        overall: readingData.overall?.substring(0, 100) + '...',
        keyMessages: readingData.keyMessages?.slice(0, 2),
        readingResults: readingData.readingResults?.slice(0, 1)
      }
    };

    testResults.details.push(testResult);
    testResults.totalTests++;

    if (analysis.isEnglish) {
      testResults.passedTests++;
      console.log(`✅ 测试通过: ${testName} (分数: ${analysis.score})`);
    } else {
      testResults.failedTests++;
      console.log(`❌ 测试失败: ${testName}`);
      console.log(`   问题: ${analysis.issues.join(', ')}`);
    }

    await browser.close();
    return testResult;

  } catch (error) {
    testResults.totalTests++;
    testResults.failedTests++;
    testResults.errors.push({
      testName,
      error: error.message
    });
    
    console.log(`❌ 测试错误: ${testName}`);
    console.log(`   错误: ${error.message}`);
    
    return { testName, success: false, error: error.message };
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始英文塔罗牌解读质量保证测试...\n');
  
  let testIndex = 0;
  
  // 测试英文模式
  for (const question of TEST_CONFIG.testQuestions.en) {
    await runSingleTest(question, 'en', testIndex);
    testIndex++;
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 测试中文模式（作为对比）
  for (const question of TEST_CONFIG.testQuestions.zh) {
    await runSingleTest(question, 'zh', testIndex);
    testIndex++;
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  const report = {
    summary: {
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      successRate: testResults.totalTests > 0 ? 
        ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2) : 0
    },
    details: testResults.details,
    errors: testResults.errors,
    timestamp: new Date().toISOString()
  };

  // 保存报告到文件
  const reportPath = path.join(__dirname, 'qa-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 生成HTML报告
  const htmlReport = generateHTMLReport(report);
  const htmlPath = path.join(__dirname, 'qa-test-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  return report;
}

/**
 * 生成HTML报告
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>英文塔罗牌解读质量保证测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .passed { background: #d4edda; border-left: 4px solid #28a745; }
        .failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .error { background: #fff3cd; border-left: 4px solid #ffc107; }
        .details { margin-left: 20px; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <h1>🔮 英文塔罗牌解读质量保证测试报告</h1>
    
    <div class="summary">
        <h2>📊 测试摘要</h2>
        <p><strong>总测试数:</strong> ${report.summary.totalTests}</p>
        <p><strong>通过测试:</strong> ${report.summary.passedTests}</p>
        <p><strong>失败测试:</strong> ${report.summary.failedTests}</p>
        <p><strong>成功率:</strong> ${report.summary.successRate}%</p>
        <p><strong>测试时间:</strong> ${report.timestamp}</p>
    </div>
    
    <h2>📋 测试详情</h2>
    ${report.details.map(test => `
        <div class="test-result ${test.success ? 'passed' : 'failed'}">
            <h3>${test.testName}</h3>
            <p><strong>问题:</strong> ${test.question}</p>
            <p><strong>语言:</strong> ${test.language}</p>
            <p><strong>结果:</strong> ${test.success ? '✅ 通过' : '❌ 失败'}</p>
            <p><strong>分数:</strong> ${test.score}/100</p>
            ${test.issues.length > 0 ? `<p><strong>问题:</strong> ${test.issues.join(', ')}</p>` : ''}
            <div class="details">
                <p><strong>解读内容预览:</strong></p>
                <pre>${JSON.stringify(test.readingData, null, 2)}</pre>
            </div>
        </div>
    `).join('')}
    
    ${report.errors.length > 0 ? `
    <h2>⚠️ 测试错误</h2>
    ${report.errors.map(error => `
        <div class="test-result error">
            <h3>${error.testName}</h3>
            <p><strong>错误:</strong> ${error.error}</p>
        </div>
    `).join('')}
    ` : ''}
    
    <footer>
        <p>报告生成时间: ${new Date().toLocaleString()}</p>
    </footer>
</body>
</html>`;
}

/**
 * 主函数
 */
async function main() {
  try {
    await runAllTests();
    const report = generateReport();
    
    console.log('\n📊 测试完成！');
    console.log(`总测试数: ${report.summary.totalTests}`);
    console.log(`通过测试: ${report.summary.passedTests}`);
    console.log(`失败测试: ${report.summary.failedTests}`);
    console.log(`成功率: ${report.summary.successRate}%`);
    
    if (report.summary.failedTests > 0) {
      console.log('\n❌ 发现失败的测试:');
      report.details
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`  - ${test.testName}: ${test.issues.join(', ')}`);
        });
    }
    
    console.log('\n📄 详细报告已保存到:');
    console.log('  - qa-test-report.json');
    console.log('  - qa-test-report.html');
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runSingleTest,
  analyzeReadingContent,
  isEnglishText,
  generateReport
};
