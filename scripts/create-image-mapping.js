const fs = require('fs');
const path = require('path');

// 读取塔罗牌数据
const tarotData = JSON.parse(fs.readFileSync('src/data/tarot-cards.json', 'utf8'));

// 图片文件名映射规则
// m00-m21: 大阿尔卡纳 (Major Arcana) 0-21
// w01-w14: 权杖 (Wands) 1-14
// c01-c14: 圣杯 (Cups) 1-14
// s01-s14: 宝剑 (Swords) 1-14
// p01-p14: 星币 (Pentacles) 1-14

// 创建文件名到卡牌名称的映射
const imageMapping = {};

// 大阿尔卡纳映射
const majorArcanaOrder = [
  "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人", "战车", 
  "力量", "隐者", "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔",
  "高塔", "星星", "月亮", "太阳", "审判", "世界"
];

majorArcanaOrder.forEach((cardName, index) => {
  const filename = `m${index.toString().padStart(2, '0')}.jpg`;
  imageMapping[cardName] = filename;
});

// 小阿尔卡纳映射 - 根据实际文件名规则
const suits = {
  "权杖": "w",  // Wands
  "圣杯": "c",  // Cups
  "宝剑": "s",  // Swords
  "星币": "p"   // Pentacles
};

// 正确的映射：1-10是数字牌，11=Page，12=Knight，13=Queen，14=King
const minorArcanaMapping = [
  "王牌",    // 01
  "二",      // 02
  "三",      // 03
  "四",      // 04
  "五",      // 05
  "六",      // 06
  "七",      // 07
  "八",      // 08
  "九",      // 09
  "十",      // 10
  "侍从",    // 11 (Page)
  "骑士",    // 12 (Knight)
  "王后",    // 13 (Queen)
  "国王"     // 14 (King)
];

Object.entries(suits).forEach(([suitName, prefix]) => {
  minorArcanaMapping.forEach((cardType, index) => {
    const cardName = suitName + cardType;
    const fileNumber = (index + 1).toString().padStart(2, '0');
    const filename = `${prefix}${fileNumber}.jpg`;
    imageMapping[cardName] = filename;
  });
});

// 验证映射
console.log('🔍 验证映射结果:');
const tarotCardNames = Object.keys(tarotData);
const mappedCards = Object.keys(imageMapping);

console.log(`📊 统计:`);
console.log(`   - 塔罗牌数据: ${tarotCardNames.length} 张`);
console.log(`   - 图片映射: ${mappedCards.length} 张`);

// 查找未映射的卡牌
const unmappedCards = tarotCardNames.filter(name => !imageMapping[name]);
if (unmappedCards.length > 0) {
  console.log(`❌ 未映射的卡牌 (${unmappedCards.length} 张):`);
  unmappedCards.forEach(card => {
    console.log(`   - ${card} (英文: ${tarotData[card].name})`);
  });
}

// 查找多余的映射
const extraMappings = mappedCards.filter(name => !tarotCardNames.includes(name));
if (extraMappings.length > 0) {
  console.log(`⚠️ 多余的映射 (${extraMappings.length} 个):`);
  extraMappings.forEach(card => {
    console.log(`   - ${card} -> ${imageMapping[card]}`);
  });
}

// 显示一些成功的映射示例
console.log(`✅ 映射示例:`);
const sampleMappings = Object.entries(imageMapping).slice(0, 10);
sampleMappings.forEach(([cardName, filename]) => {
  console.log(`   - ${cardName} -> ${filename}`);
});

// 保存映射文件
const outputPath = path.join(__dirname, '..', 'src', 'data', 'tarot-image-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2), 'utf8');

console.log(`💾 映射文件已保存: ${outputPath}`);

// 生成图片路径辅助函数
const helperCode = `
// 获取塔罗牌图片路径的辅助函数
export function getTarotCardImage(cardName: string): string {
  const mapping = ${JSON.stringify(imageMapping, null, 2)};
  const filename = mapping[cardName];
  return filename ? \`/images/tarot-cards/\${filename}\` : '/images/tarot-cards/default.jpg';
}

// 获取所有可用的塔罗牌图片
export function getAllTarotCardImages(): Record<string, string> {
  const mapping = ${JSON.stringify(imageMapping, null, 2)};
  const result: Record<string, string> = {};
  Object.entries(mapping).forEach(([cardName, filename]) => {
    result[cardName] = \`/images/tarot-cards/\${filename}\`;
  });
  return result;
}
`;

const helperPath = path.join(__dirname, '..', 'src', 'lib', 'tarot-images.ts');
fs.writeFileSync(helperPath, helperCode, 'utf8');

console.log(`🔧 辅助函数已生成: ${helperPath}`);
