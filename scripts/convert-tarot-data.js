const fs = require('fs');
const path = require('path');

// 读取原始数据
const rawData = JSON.parse(fs.readFileSync('temp_tarot.json', 'utf8'));

// 塔罗牌中文翻译映射
const translations = {
  // 大阿尔卡纳
  "The Fool": "愚者",
  "The Magician": "魔术师", 
  "The High Priestess": "女祭司",
  "The Empress": "皇后",
  "The Emperor": "皇帝",
  "The Hierophant": "教皇",
  "The Lovers": "恋人",
  "The Chariot": "战车",
  "Strength": "力量",
  "The Hermit": "隐者",
  "Wheel of Fortune": "命运之轮",
  "Justice": "正义",
  "The Hanged Man": "倒吊人",
  "Death": "死神",
  "Temperance": "节制",
  "The Devil": "恶魔",
  "The Tower": "高塔",
  "The Star": "星星",
  "The Moon": "月亮",
  "The Sun": "太阳",
  "Judgement": "审判",
  "The World": "世界",
  
  // 权杖套牌
  "Ace of Wands": "权杖王牌",
  "Two of Wands": "权杖二",
  "Three of Wands": "权杖三",
  "Four of Wands": "权杖四",
  "Five of Wands": "权杖五",
  "Six of Wands": "权杖六",
  "Seven of Wands": "权杖七",
  "Eight of Wands": "权杖八",
  "Nine of Wands": "权杖九",
  "Ten of Wands": "权杖十",
  "Page of Wands": "权杖侍从",
  "Knight of Wands": "权杖骑士",
  "Queen of Wands": "权杖王后",
  "King of Wands": "权杖国王",
  
  // 杯子套牌
  "Ace of Cups": "圣杯王牌",
  "Two of Cups": "圣杯二",
  "Three of Cups": "圣杯三",
  "Four of Cups": "圣杯四",
  "Five of Cups": "圣杯五",
  "Six of Cups": "圣杯六",
  "Seven of Cups": "圣杯七",
  "Eight of Cups": "圣杯八",
  "Nine of Cups": "圣杯九",
  "Ten of Cups": "圣杯十",
  "Page of Cups": "圣杯侍从",
  "Knight of Cups": "圣杯骑士",
  "Queen of Cups": "圣杯王后",
  "King of Cups": "圣杯国王",
  
  // 宝剑套牌
  "Ace of Swords": "宝剑王牌",
  "Two of Swords": "宝剑二",
  "Three of Swords": "宝剑三",
  "Four of Swords": "宝剑四",
  "Five of Swords": "宝剑五",
  "Six of Swords": "宝剑六",
  "Seven of Swords": "宝剑七",
  "Eight of Swords": "宝剑八",
  "Nine of Swords": "宝剑九",
  "Ten of Swords": "宝剑十",
  "Page of Swords": "宝剑侍从",
  "Knight of Swords": "宝剑骑士",
  "Queen of Swords": "宝剑王后",
  "King of Swords": "宝剑国王",
  
  // 星币套牌
  "Ace of Pentacles": "星币王牌",
  "Two of Pentacles": "星币二",
  "Three of Pentacles": "星币三",
  "Four of Pentacles": "星币四",
  "Five of Pentacles": "星币五",
  "Six of Pentacles": "星币六",
  "Seven of Pentacles": "星币七",
  "Eight of Pentacles": "星币八",
  "Nine of Pentacles": "星币九",
  "Ten of Pentacles": "星币十",
  "Page of Pentacles": "星币侍从",
  "Knight of Pentacles": "星币骑士",
  "Queen of Pentacles": "星币王后",
  "King of Pentacles": "星币国王"
};

// 套牌映射
const suitMapping = {
  "Wands": "权杖",
  "Cups": "圣杯", 
  "Swords": "宝剑",
  "Pentacles": "星币"
};

// 基础牌义数据（可以后续扩展）
const basicMeanings = {
  // 大阿尔卡纳基础含义
  "The Fool": {
    upright: {
      keywords: ["新开始", "冒险", "天真", "潜能"],
      love: "新恋情的开始，保持开放心态",
      career: "新机会出现，勇于尝试",
      advice: ["拥抱新的开始", "保持好奇心", "相信直觉"]
    },
    reversed: {
      keywords: ["冲动", "鲁莽", "缺乏方向"],
      love: "感情中过于冲动或犹豫不决",
      career: "缺乏明确目标，需要谨慎计划",
      advice: ["三思而后行", "制定明确计划", "寻求指导"]
    }
  },
  "The Magician": {
    upright: {
      keywords: ["意志力", "技能", "集中", "创造"],
      love: "主动追求，展现魅力",
      career: "发挥才能，把握机会",
      advice: ["相信自己的能力", "专注目标", "运用所有资源"]
    },
    reversed: {
      keywords: ["缺乏信心", "滥用权力", "欺骗"],
      love: "感情中缺乏真诚或自信",
      career: "技能不足或方向错误",
      advice: ["提升自信", "诚实面对", "重新评估目标"]
    }
  }
  // 可以继续添加更多牌的详细含义...
};

// 生成默认牌义
function generateDefaultMeaning(cardName, suit) {
  if (basicMeanings[cardName]) {
    return basicMeanings[cardName];
  }
  
  // 为没有详细定义的牌生成基础含义
  return {
    upright: {
      keywords: ["正面能量", "积极发展", "和谐"],
      love: "感情方面呈现正面发展趋势",
      career: "事业上有积极的进展机会",
      advice: ["保持积极态度", "把握机会", "相信自己"]
    },
    reversed: {
      keywords: ["阻碍", "挑战", "需要调整"],
      love: "感情中可能遇到一些挑战",
      career: "工作上需要重新调整方向",
      advice: ["耐心等待", "调整策略", "寻求帮助"]
    }
  };
}

// 转换数据
const convertedData = {};

rawData.cards.forEach(card => {
  const chineseName = translations[card.name] || card.name;
  const suit = card.suit ? suitMapping[card.suit] || card.suit : "Major";
  
  convertedData[chineseName] = {
    name: card.name,
    chinese_name: chineseName,
    suit: suit,
    number: parseInt(card.number) || 0,
    arcana: card.arcana,
    ...generateDefaultMeaning(card.name, card.suit)
  };
});

// 写入新文件
const outputPath = path.join(__dirname, '..', 'src', 'data', 'tarot-cards-full.json');
fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2), 'utf8');

console.log(`✅ 转换完成！共处理 ${Object.keys(convertedData).length} 张塔罗牌`);
console.log(`📁 输出文件: ${outputPath}`);

// 显示一些统计信息
const majorArcana = Object.values(convertedData).filter(card => card.arcana === "Major Arcana");
const minorArcana = Object.values(convertedData).filter(card => card.arcana === "Minor Arcana");

console.log(`📊 统计信息:`);
console.log(`   - 大阿尔卡纳: ${majorArcana.length} 张`);
console.log(`   - 小阿尔卡纳: ${minorArcana.length} 张`);

// 按套牌统计
const suits = {};
Object.values(convertedData).forEach(card => {
  suits[card.suit] = (suits[card.suit] || 0) + 1;
});

console.log(`   - 套牌分布:`);
Object.entries(suits).forEach(([suit, count]) => {
  console.log(`     * ${suit}: ${count} 张`);
});
