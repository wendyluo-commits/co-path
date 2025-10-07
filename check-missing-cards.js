#!/usr/bin/env node

/**
 * 检查缺失牌义数据的脚本
 */

const fs = require('fs');
const path = require('path');

const cardDataPath = path.join(__dirname, 'src/data/tarot-cards.json');
const cardData = JSON.parse(fs.readFileSync(cardDataPath, 'utf8'));

console.log('🔍 检查缺失的牌义数据...\n');

let missingStoryInterpretation = [];
let missingCareerKeywords = [];
let totalCards = 0;

for (const [cardName, cardInfo] of Object.entries(cardData)) {
  totalCards++;
  
  if (!cardInfo.upright || !cardInfo.upright.story_interpretation) {
    missingStoryInterpretation.push(cardName);
  }
  
  if (!cardInfo.upright || !cardInfo.upright.career_keywords) {
    missingCareerKeywords.push(cardName);
  }
}

console.log(`📊 数据质量报告:`);
console.log(`   总牌数: ${totalCards}`);
console.log(`   故事解读: ${totalCards - missingStoryInterpretation.length}/${totalCards} (${Math.round((totalCards - missingStoryInterpretation.length) / totalCards * 100)}%)`);
console.log(`   职业关键词: ${totalCards - missingCareerKeywords.length}/${totalCards} (${Math.round((totalCards - missingCareerKeywords.length) / totalCards * 100)}%)`);

if (missingStoryInterpretation.length > 0) {
  console.log(`\n❌ 缺少故事解读的牌 (${missingStoryInterpretation.length}张):`);
  missingStoryInterpretation.forEach(card => console.log(`   - ${card}`));
}

if (missingCareerKeywords.length > 0) {
  console.log(`\n❌ 缺少职业关键词的牌 (${missingCareerKeywords.length}张):`);
  missingCareerKeywords.forEach(card => console.log(`   - ${card}`));
}

if (missingStoryInterpretation.length === 0 && missingCareerKeywords.length === 0) {
  console.log('\n🎉 所有牌义数据完整！');
} else {
  console.log(`\n⚠️  需要更新 ${Math.max(missingStoryInterpretation.length, missingCareerKeywords.length)} 张牌的数据`);
}
