const fs = require('fs');
const path = require('path');

// 读取塔罗牌数据
const tarotData = JSON.parse(fs.readFileSync('src/data/tarot-cards.json', 'utf8'));

// 读取实际的图片文件名
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'tarot-cards');
const actualFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg'));

console.log('📁 实际的图片文件:');
actualFiles.forEach(file => console.log(`   - ${file}`));

// 创建映射
const imageMapping = {};

// 遍历所有塔罗牌数据，找到对应的图片文件
Object.entries(tarotData).forEach(([chineseName, cardData]) => {
  const englishName = cardData.name;
  
  // 查找匹配的文件名（不区分大小写，支持各种变体）
  const possibleNames = [
    englishName.toUpperCase() + '.jpg',
    englishName.toUpperCase() + '..jpg',
    englishName.toLowerCase() + '.jpg',
    englishName + '.jpg',
    // 处理特殊字符
    englishName.toUpperCase().replace(/[•·]/g, ' ') + '.jpg',
    englishName.toUpperCase().replace(/[•·]/g, '') + '.jpg',
  ];
  
  let foundFile = null;
  
  // 在实际文件中查找匹配
  for (const possibleName of possibleNames) {
    const found = actualFiles.find(file => 
      file.toLowerCase() === possibleName.toLowerCase() ||
      file.replace(/[•·\s]/g, '').toLowerCase() === possibleName.replace(/[•·\s]/g, '').toLowerCase()
    );
    if (found) {
      foundFile = found;
      break;
    }
  }
  
  if (foundFile) {
    imageMapping[chineseName] = foundFile;
    console.log(`✅ ${chineseName} -> ${foundFile}`);
  } else {
    console.log(`❌ 未找到匹配文件: ${chineseName} (${englishName})`);
    // 检查可能的近似匹配
    const similar = actualFiles.filter(file => 
      file.toLowerCase().includes(englishName.split(' ')[0].toLowerCase()) ||
      englishName.split(' ').some(word => file.toLowerCase().includes(word.toLowerCase()))
    );
    if (similar.length > 0) {
      console.log(`   可能的匹配: ${similar.join(', ')}`);
    }
  }
});

// 保存新的映射文件
const outputPath = path.join(__dirname, '..', 'src', 'data', 'tarot-image-mapping.json');
fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2), 'utf8');

// 重新生成辅助函数
const helperCode = `
// 获取塔罗牌图片路径的辅助函数
export function getTarotCardImage(cardName: string): string {
  const mapping = ${JSON.stringify(imageMapping, null, 2)};
  const filename = mapping[cardName];
  return filename ? \`/images/tarot-cards/\${filename}\` : '/images/tarot-cards/card-back.jpg';
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

console.log(`\n📊 映射统计:`);
console.log(`   - 成功映射: ${Object.keys(imageMapping).length} 张`);
console.log(`   - 总塔罗牌: ${Object.keys(tarotData).length} 张`);
console.log(`   - 总图片文件: ${actualFiles.length} 张`);

console.log(`\n💾 文件已更新:`);
console.log(`   - 映射文件: ${outputPath}`);
console.log(`   - 辅助函数: ${helperPath}`);
