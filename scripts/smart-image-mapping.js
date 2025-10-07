const fs = require('fs');
const path = require('path');

// 读取塔罗牌数据
const tarotData = JSON.parse(fs.readFileSync('src/data/tarot-cards.json', 'utf8'));

// 读取实际的图片文件名
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'tarot-cards');
const actualFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));

console.log('📁 实际的图片文件 (78张):');
console.log('大阿尔卡纳:');
actualFiles.filter(f => !f.match(/^[cwsp]\d/)).forEach(file => console.log(`   - ${file}`));
console.log('小阿尔卡纳:');
actualFiles.filter(f => f.match(/^[cwsp]\d/)).forEach(file => console.log(`   - ${file}`));

// 手动创建精确映射
const imageMapping = {};

// 大阿尔卡纳映射（基于您重命名的文件）
const majorArcanaMapping = {
  "愚者": "the fool.jpg",
  "魔术师": "THE MAGICIAN..jpg", 
  "女祭司": "THE HIGH PRIESTESS.jpg",
  "皇后": "THE EMPRESS..jpg",
  "皇帝": "THE EMPEROR..jpg",
  "教皇": "THE HIEROPHANT.jpg",
  "恋人": "THE LOVERS..jpg",
  "战车": "THE CHARIOT..jpg",
  "力量": "STRENGTH..jpg",
  "隐者": "THE HERMIT..jpg",
  "命运之轮": "WHEEL • FORTUNE.jpg",
  "正义": "TUSTICE ..jpg", // 注意这个文件名有拼写错误
  "倒吊人": "THE HANGED MAN..jpg",
  "死神": "DEATH..jpg",
  "节制": "TEMPERANCE..jpg", 
  "恶魔": "THE DEVIL •.jpg",
  "高塔": "THE TOWER..jpg",
  "星星": "THE STAR..jpg",
  "月亮": "THE MOON.jpg",
  "太阳": "THE SUN.jpg",
  "审判": "JUDGEMENT..jpg",
  "世界": "THE VYORLD..jpg" // 注意这个文件名有拼写错误
};

// 添加大阿尔卡纳映射
Object.assign(imageMapping, majorArcanaMapping);

// 小阿尔卡纳映射（使用原有的数字编码）
const suits = {
  "权杖": "w",  // Wands
  "圣杯": "c",  // Cups  
  "宝剑": "s",  // Swords
  "星币": "p"   // Pentacles
};

// 数字牌 1-10 + 宫廷牌 11-14
const minorArcanaTypes = [
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
  minorArcanaTypes.forEach((cardType, index) => {
    const cardName = suitName + cardType;
    const fileNumber = (index + 1).toString().padStart(2, '0');
    const filename = `${prefix}${fileNumber}.jpg`;
    
    // 验证文件是否存在
    if (actualFiles.includes(filename)) {
      imageMapping[cardName] = filename;
      console.log(`✅ ${cardName} -> ${filename}`);
    } else {
      console.log(`❌ 文件不存在: ${cardName} -> ${filename}`);
    }
  });
});

// 验证映射完整性
console.log(`\n📊 映射统计:`);
console.log(`   - 成功映射: ${Object.keys(imageMapping).length} 张`);
console.log(`   - 总塔罗牌: ${Object.keys(tarotData).length} 张`);
console.log(`   - 总图片文件: ${actualFiles.length} 张`);

// 查找未映射的卡牌
const tarotCardNames = Object.keys(tarotData);
const unmappedCards = tarotCardNames.filter(name => !imageMapping[name]);
if (unmappedCards.length > 0) {
  console.log(`\n❌ 未映射的卡牌 (${unmappedCards.length} 张):`);
  unmappedCards.forEach(card => {
    console.log(`   - ${card} (${tarotData[card].name})`);
  });
}

// 保存映射文件
const outputPath = path.join(__dirname, '..', 'src', 'data', 'tarot-image-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2), 'utf8');

// 重新生成辅助函数
const helperCode = `// 获取塔罗牌图片路径的辅助函数
export function getTarotCardImage(cardName: string): string {
  const mapping = ${JSON.stringify(imageMapping, null, 2)};
  const filename = mapping[cardName];
  return filename ? \`/images/tarot-cards/\${encodeURIComponent(filename)}\` : '/images/tarot-cards/card-back.jpg';
}

// 获取所有可用的塔罗牌图片
export function getAllTarotCardImages(): Record<string, string> {
  const mapping = ${JSON.stringify(imageMapping, null, 2)};
  const result: Record<string, string> = {};
  Object.entries(mapping).forEach(([cardName, filename]) => {
    result[cardName] = \`/images/tarot-cards/\${encodeURIComponent(filename)}\`;
  });
  return result;
}
`;

const helperPath = path.join(__dirname, '..', 'src', 'lib', 'tarot-images.ts');
fs.writeFileSync(helperPath, helperCode, 'utf8');

console.log(`\n💾 文件已更新:`);
console.log(`   - 映射文件: ${outputPath}`);
console.log(`   - 辅助函数: ${helperPath}`);
