#!/usr/bin/env node

/**
 * 塔罗解读系统 QA 测试套件
 * 专业质量保证测试
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_CASES = [
  {
    name: "单张牌解读测试",
    question: "我当下的事业主线应该是什么？",
    spread: "single",
    expectedElements: ["interpretation", "advice", "overall", "action_steps", "safety_note"]
  },
  {
    name: "三张牌解读测试", 
    question: "我的经历正把我推向哪条事业路径？",
    spread: "situation-action-outcome",
    expectedElements: ["interpretation", "advice", "overall", "action_steps", "safety_note"]
  },
  {
    name: "五张牌解读测试",
    question: "我目前最大的职业瓶颈是什么？",
    spread: "five-card", 
    expectedElements: ["interpretation", "advice", "overall", "action_steps", "safety_note"]
  }
];

const CARD_QUALITY_TESTS = [
  {
    cardName: "The Fool",
    expectedKeywords: ["新开始", "冒险精神", "无限可能"],
    testOrientation: "upright"
  },
  {
    cardName: "Ace of Cups", 
    expectedKeywords: ["创造力", "新的机会", "稳定收入"],
    testOrientation: "upright"
  },
  {
    cardName: "Death",
    expectedKeywords: ["转变", "结束", "重生"],
    testOrientation: "upright"
  }
];

class TarotQATester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 开始塔罗解读系统 QA 测试...\n');
    
    await this.testAPIHealth();
    await this.testSessionCreation();
    await this.testCardDrawing();
    await this.testReadingGeneration();
    await this.testCardDataQuality();
    await this.testPerformanceMetrics();
    
    this.generateReport();
  }

  async testAPIHealth() {
    console.log('📡 测试 API 健康状态...');
    try {
      const response = await this.makeRequest('/api/health');
      if (response.ok && response.data.services.openai.status === 'healthy') {
        this.logSuccess('API 健康检查通过');
      } else {
        this.logError('API 健康检查失败', response);
      }
    } catch (error) {
      this.logError('API 健康检查异常', error.message);
    }
  }

  async testSessionCreation() {
    console.log('🎯 测试会话创建...');
    for (const testCase of TEST_CASES) {
      try {
        const response = await this.makeRequest('/api/session', 'POST', {
          spread: testCase.spread,
          question: testCase.question
        });
        
        if (response.ok && response.data.sessionId) {
          this.logSuccess(`${testCase.name} - 会话创建成功`);
        } else {
          this.logError(`${testCase.name} - 会话创建失败`, response);
        }
      } catch (error) {
        this.logError(`${testCase.name} - 会话创建异常`, error.message);
      }
    }
  }

  async testCardDrawing() {
    console.log('🎴 测试抽牌功能...');
    try {
      // 创建会话
      const sessionResponse = await this.makeRequest('/api/session', 'POST', {
        spread: 'single',
        question: '测试问题'
      });
      
      if (!sessionResponse.ok) {
        this.logError('无法创建测试会话');
        return;
      }
      
      const sessionId = sessionResponse.data.sessionId;
      
      // 测试抽牌
      const drawResponse = await this.makeRequest('/api/draw', 'POST', {
        sessionId: sessionId,
        positions: [0]
      });
      
      if (drawResponse.ok && drawResponse.data.cards && drawResponse.data.cards.length > 0) {
        this.logSuccess('抽牌功能正常');
        console.log(`   抽到的牌: ${drawResponse.data.cards[0].name}`);
      } else {
        this.logError('抽牌功能失败', drawResponse);
      }
    } catch (error) {
      this.logError('抽牌功能异常', error.message);
    }
  }

  async testReadingGeneration() {
    console.log('🔮 测试解读生成...');
    for (const testCase of TEST_CASES) {
      try {
        const response = await this.makeRequest('/api/reading', 'POST', {
          question: testCase.question,
          spread: testCase.spread,
          cards: [{
            name: "The Fool",
            suit: "Major",
            number: 0,
            position: "当前状况",
            orientation: "upright",
            keywords: ["新开始", "冒险精神", "无限可能"]
          }]
        });
        
        if (response.ok) {
          // 检查必需元素
          const missingElements = testCase.expectedElements.filter(
            element => !response.data[element]
          );
          
          if (missingElements.length === 0) {
            this.logSuccess(`${testCase.name} - 解读生成完整`);
          } else {
            this.logError(`${testCase.name} - 缺少元素: ${missingElements.join(', ')}`);
          }
        } else {
          this.logError(`${testCase.name} - 解读生成失败`, response);
        }
      } catch (error) {
        this.logError(`${testCase.name} - 解读生成异常`, error.message);
      }
    }
  }

  async testCardDataQuality() {
    console.log('🃏 测试牌义数据质量...');
    try {
      // 这里可以添加对 tarot-cards.json 的验证
      const fs = require('fs');
      const path = require('path');
      
      const cardDataPath = path.join(__dirname, 'src/data/tarot-cards.json');
      const cardData = JSON.parse(fs.readFileSync(cardDataPath, 'utf8'));
      
      let qualityScore = 0;
      let totalCards = 0;
      
      for (const [cardName, cardInfo] of Object.entries(cardData)) {
        totalCards++;
        let cardScore = 0;
        
        // 检查必需字段
        if (cardInfo.name && cardInfo.suit && cardInfo.number !== undefined) {
          cardScore += 1;
        }
        
        // 检查正位解读
        if (cardInfo.upright && cardInfo.upright.keywords && cardInfo.upright.career) {
          cardScore += 1;
        }
        
        // 检查新增字段
        if (cardInfo.upright && cardInfo.upright.story_interpretation) {
          cardScore += 1;
        }
        
        if (cardInfo.upright && cardInfo.upright.career_keywords) {
          cardScore += 1;
        }
        
        qualityScore += cardScore;
      }
      
      const averageQuality = (qualityScore / (totalCards * 4)) * 100;
      
      if (averageQuality >= 90) {
        this.logSuccess(`牌义数据质量: ${averageQuality.toFixed(1)}% (优秀)`);
      } else if (averageQuality >= 80) {
        this.logSuccess(`牌义数据质量: ${averageQuality.toFixed(1)}% (良好)`);
      } else {
        this.logError(`牌义数据质量: ${averageQuality.toFixed(1)}% (需要改进)`);
      }
      
    } catch (error) {
      this.logError('牌义数据质量检查失败', error.message);
    }
  }

  async testPerformanceMetrics() {
    console.log('⚡ 测试性能指标...');
    const performanceTests = [
      { name: 'API响应时间', endpoint: '/api/health', maxTime: 1000 },
      { name: '抽牌响应时间', endpoint: '/api/draw', maxTime: 2000 },
      { name: '解读生成时间', endpoint: '/api/reading', maxTime: 15000 }
    ];
    
    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        
        if (test.endpoint === '/api/health') {
          await this.makeRequest(test.endpoint);
        } else if (test.endpoint === '/api/draw') {
          const sessionResponse = await this.makeRequest('/api/session', 'POST', {
            spread: 'single',
            question: '性能测试'
          });
          if (sessionResponse.ok) {
            await this.makeRequest('/api/draw', 'POST', {
              sessionId: sessionResponse.data.sessionId,
              positions: [0]
            });
          }
        } else if (test.endpoint === '/api/reading') {
          await this.makeRequest('/api/reading', 'POST', {
            question: '性能测试',
            spread: 'single',
            cards: [{
              name: "The Fool",
              suit: "Major", 
              number: 0,
              position: "当前状况",
              orientation: "upright",
              keywords: ["新开始"]
            }]
          });
        }
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (responseTime <= test.maxTime) {
          this.logSuccess(`${test.name}: ${responseTime}ms (通过)`);
        } else {
          this.logError(`${test.name}: ${responseTime}ms (超时，限制: ${test.maxTime}ms)`);
        }
        
      } catch (error) {
        this.logError(`${test.name} 性能测试失败`, error.message);
      }
    }
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              ok: res.statusCode >= 200 && res.statusCode < 300,
              data: JSON.parse(body)
            };
            resolve(response);
          } catch (error) {
            resolve({
              status: res.statusCode,
              ok: false,
              data: body
            });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  logSuccess(message) {
    console.log(`✅ ${message}`);
    this.passed++;
  }

  logError(message, details = '') {
    console.log(`❌ ${message}`);
    if (details) {
      console.log(`   详情: ${details}`);
    }
    this.failed++;
  }

  generateReport() {
    console.log('\n📊 QA 测试报告');
    console.log('================');
    console.log(`✅ 通过: ${this.passed}`);
    console.log(`❌ 失败: ${this.failed}`);
    console.log(`📈 成功率: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 所有测试通过！系统质量优秀！');
    } else {
      console.log('\n⚠️  发现问题，需要修复。');
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new TarotQATester();
  tester.runAllTests().catch(console.error);
}

module.exports = TarotQATester;
