/**
 * 简化的英文塔罗牌解读质量保证测试
 * 通过API直接测试，无需浏览器
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  apiUrl: 'http://localhost:3000/api/reading',
  testTimeout: 30000,
  testQuestions: {
    en: [
      "What should be my main career path right now?",
      "What is currently draining my energy?",
      "How can I face the unknown and changes more bravely?"
    ],
    zh: [
      "我当下的事业主线应该是什么？",
      "现在是什么正在消耗我的力量？",
      "我怎样才能更勇敢地面对未知与变化？"
    ]
  }
};

// 测试结果
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
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
  const chineseChars = /[\u4e00-\u9fff]/;
  if (chineseChars.test(text)) {
    return false;
  }

  // 检查是否包含英文关键词
  const englishWords = ['the', 'and', 'you', 'your', 'this', 'that', 'with', 'for', 'from', 'will', 'can', 'should'];
  const hasEnglishWords = englishWords.some(word => 
    text.toLowerCase().includes(word)
  );

  return hasEnglishWords;
}

/**
 * 分析解读内容
 */
function analyzeReadingContent(reading, expectedLanguage) {
  const analysis = {
    isCorrectLanguage: true,
    issues: [],
    score: 0,
    sections: {}
  };

  // 检查各个部分
  const sections = [
    { name: 'overall', content: reading.overall },
    { name: 'keyMessages', content: reading.keyMessages },
    { name: 'readingResults', content: reading.readingResults }
  ];

  sections.forEach(section => {
    analysis.sections[section.name] = { isEnglish: true, issues: [] };
    
    if (section.content) {
      if (Array.isArray(section.content)) {
        section.content.forEach((item, index) => {
          if (typeof item === 'string') {
            const isEnglish = isEnglishText(item);
            if (expectedLanguage === 'en' && !isEnglish) {
              analysis.isCorrectLanguage = false;
              analysis.sections[section.name].isEnglish = false;
              analysis.sections[section.name].issues.push(`Item ${index} contains non-English content`);
              analysis.issues.push(`${section.name}[${index}] contains non-English content`);
            }
          } else if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => {
              if (typeof item[key] === 'string') {
                const isEnglish = isEnglishText(item[key]);
                if (expectedLanguage === 'en' && !isEnglish) {
                  analysis.isCorrectLanguage = false;
                  analysis.sections[section.name].isEnglish = false;
                  analysis.sections[section.name].issues.push(`${key} contains non-English content`);
                  analysis.issues.push(`${section.name}[${index}].${key} contains non-English content`);
                }
              }
            });
          }
        });
      } else if (typeof section.content === 'string') {
        const isEnglish = isEnglishText(section.content);
        if (expectedLanguage === 'en' && !isEnglish) {
          analysis.isCorrectLanguage = false;
          analysis.sections[section.name].isEnglish = false;
          analysis.sections[section.name].issues.push('Contains non-English content');
          analysis.issues.push(`${section.name} contains non-English content`);
        }
      }
    }
  });

  // 计算分数
  analysis.score = analysis.isCorrectLanguage ? 100 : Math.max(0, 100 - (analysis.issues.length * 20));

  return analysis;
}

/**
 * 执行单个API测试
 */
async function runSingleTest(question, language, testIndex) {
  const testName = `Test ${testIndex + 1}: ${language.toUpperCase()} - "${question.substring(0, 30)}..."`;
  
  try {
    console.log(`\n🧪 开始测试: ${testName}`);
    
    // 构建测试数据
    const testData = {
      question: question,
      spread: 'single',
      tone: 'gentle',
      lang: language,
      seed: Math.floor(Math.random() * 1000000),
      cards: [
        {
          name: 'The Fool',
          orientation: 'upright',
          position: '当前状况',
          suit: 'Major',
          number: 0,
          keywords: ['新开始', '冒险', '天真']
        }
      ],
      useNewFormat: true
    };

    // 发送API请求
    const response = await fetch(TEST_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const readingData = await response.json();
    
    // 分析解读内容
    const analysis = analyzeReadingContent(readingData, language);

    // 记录测试结果
    const testResult = {
      testName,
      question,
      language,
      success: analysis.isCorrectLanguage,
      score: analysis.score,
      issues: analysis.issues,
      sections: analysis.sections,
      readingData: {
        overall: readingData.overall?.substring(0, 100) + '...',
        keyMessages: readingData.keyMessages?.slice(0, 2),
        readingResults: readingData.readingResults?.slice(0, 1)
      }
    };

    testResults.details.push(testResult);
    testResults.totalTests++;

    if (analysis.isCorrectLanguage) {
      testResults.passedTests++;
      console.log(`✅ 测试通过: ${testName} (分数: ${analysis.score})`);
    } else {
      testResults.failedTests++;
      console.log(`❌ 测试失败: ${testName}`);
      console.log(`   问题: ${analysis.issues.join(', ')}`);
    }

    return testResult;

  } catch (error) {
    testResults.totalTests++;
    testResults.failedTests++;
    
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
  console.log('📝 测试英文模式...');
  for (const question of TEST_CONFIG.testQuestions.en) {
    await runSingleTest(question, 'en', testIndex);
    testIndex++;
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 测试中文模式（作为对比）
  console.log('\n📝 测试中文模式...');
  for (const question of TEST_CONFIG.testQuestions.zh) {
    await runSingleTest(question, 'zh', testIndex);
    testIndex++;
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    timestamp: new Date().toISOString()
  };

  // 保存报告到文件
  const reportPath = path.join(__dirname, 'qa-simple-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 生成控制台报告
  console.log('\n📊 测试报告');
  console.log('='.repeat(50));
  console.log(`总测试数: ${report.summary.totalTests}`);
  console.log(`通过测试: ${report.summary.passedTests}`);
  console.log(`失败测试: ${report.summary.failedTests}`);
  console.log(`成功率: ${report.summary.successRate}%`);
  
  if (report.summary.failedTests > 0) {
    console.log('\n❌ 失败的测试:');
    report.details
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  - ${test.testName}`);
        console.log(`    问题: ${test.issues.join(', ')}`);
        console.log(`    分数: ${test.score}/100`);
      });
  }
  
  console.log('\n📄 详细报告已保存到: qa-simple-test-report.json');
  
  return report;
}

/**
 * 主函数
 */
async function main() {
  try {
    await runAllTests();
    const report = generateReport();
    
    if (report.summary.failedTests > 0) {
      console.log('\n⚠️  发现失败的测试，请检查语言设置和API实现');
      process.exit(1);
    } else {
      console.log('\n🎉 所有测试通过！英文解读功能正常工作');
    }
    
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
