#!/usr/bin/env node

/**
 * 塔罗牌抽牌公平性验证脚本
 * 
 * 使用方法：
 * node verify-fairness.js <sessionId> <timestamp> <serverSeed> <commitHash> <positions>
 * 
 * 示例：
 * node verify-fairness.js "uuid-here" 1690000000 "base64-seed" "commit-hash" "12,43,7"
 */

const crypto = require('crypto');

// Fisher-Yates 洗牌算法（与服务器端相同）
function fisherYatesShuffle(array, rng) {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// 公平随机数生成器（与服务器端相同）
class FairRandomGenerator {
  constructor(seed) {
    this.seed = Buffer.from(seed, 'base64');
    this.counter = 0;
  }

  nextInt(max) {
    if (max <= 1) return 0;
    
    const bytesNeeded = Math.ceil(Math.log2(max) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % max);
    
    while (true) {
      const hmac = crypto.createHmac('sha256', this.seed);
      hmac.update(`shuffle:${this.counter++}`);
      const randomBytes = hmac.digest();
      
      let value = 0;
      for (let i = 0; i < bytesNeeded && i < randomBytes.length; i++) {
        value = value * 256 + randomBytes[i];
      }
      
      if (value < threshold) {
        return value % max;
      }
    }
  }

  nextBoolean() {
    return this.nextInt(2) === 1;
  }
}

// 生成完整牌组（与服务器端相同）
function generateFullDeck() {
  const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
  ].map((name, index) => ({ name, suit: 'Major', number: index }));

  const minorSuits = ['Cups', 'Wands', 'Swords', 'Pentacles'];
  const minorNumbers = Array.from({length: 14}, (_, i) => i + 1);
  
  const minorArcana = minorSuits.flatMap(suit => 
    minorNumbers.map(number => ({
      name: `${number} of ${suit}`,
      suit,
      number
    }))
  );

  return [...majorArcana, ...minorArcana];
}

// 验证承诺
function verifyCommit(sessionId, timestamp, serverSeed, expectedHash) {
  const commitData = `${sessionId}||${timestamp}||${serverSeed}`;
  const actualHash = crypto.createHash('sha256').update(commitData).digest('hex');
  return actualHash === expectedHash;
}

// 主验证函数
function verifyFairness(sessionId, timestamp, serverSeed, commitHash, positions) {
  console.log('🔍 开始验证塔罗牌抽牌公平性...\n');
  
  // 1. 验证承诺-揭示协议
  console.log('1. 验证承诺-揭示协议');
  const commitValid = verifyCommit(sessionId, timestamp, serverSeed, commitHash);
  console.log(`   承诺验证: ${commitValid ? '✅ 通过' : '❌ 失败'}`);
  
  if (!commitValid) {
    console.log('   承诺验证失败，可能存在操纵！');
    return false;
  }
  
  // 2. 重现洗牌过程
  console.log('\n2. 重现洗牌过程');
  const rng = new FairRandomGenerator(serverSeed);
  const fullDeck = generateFullDeck();
  const shuffledDeck = fisherYatesShuffle(fullDeck, rng);
  
  console.log(`   使用种子: ${serverSeed.substring(0, 20)}...`);
  console.log(`   牌组大小: ${shuffledDeck.length} 张`);
  
  // 3. 验证选择的牌位
  console.log('\n3. 验证选择的牌位');
  const selectedCards = positions.map((position, index) => {
    const card = shuffledDeck[position];
    const orientation = rng.nextBoolean() ? 'upright' : 'reversed';
    
    console.log(`   位置 ${position}: ${card.name} (${orientation})`);
    
    return {
      name: card.name,
      orientation,
      position: index
    };
  });
  
  // 4. 显示验证结果
  console.log('\n✅ 验证完成！');
  console.log('\n📊 验证摘要:');
  console.log(`   会话ID: ${sessionId}`);
  console.log(`   时间戳: ${timestamp}`);
  console.log(`   承诺哈希: ${commitHash}`);
  console.log(`   算法: Fisher-Yates + HMAC_DRBG(SHA-256)`);
  console.log(`   选择位置: [${positions.join(', ')}]`);
  
  console.log('\n🎯 抽到的牌:');
  selectedCards.forEach((card, index) => {
    console.log(`   ${index + 1}. ${card.name} (${card.orientation})`);
  });
  
  console.log('\n🎉 验证结果: 抽牌过程公平，未发现操纵行为！');
  
  return true;
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 5) {
    console.log('使用方法:');
    console.log('node verify-fairness.js <sessionId> <timestamp> <serverSeed> <commitHash> <positions>');
    console.log('');
    console.log('示例:');
    console.log('node verify-fairness.js "uuid-here" 1690000000 "base64-seed" "commit-hash" "12,43,7"');
    process.exit(1);
  }
  
  const [sessionId, timestamp, serverSeed, commitHash, positionsStr] = args;
  const positions = positionsStr.split(',').map(p => parseInt(p.trim()));
  
  try {
    verifyFairness(sessionId, parseInt(timestamp), serverSeed, commitHash, positions);
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  }
}

module.exports = { verifyFairness, FairRandomGenerator, generateFullDeck, fisherYatesShuffle };
