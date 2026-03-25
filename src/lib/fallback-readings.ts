// 预设的塔罗牌解读内容（当API配额超限时使用）
export const FALLBACK_READINGS = {
  en: {
    "The Fool": {
      meaning: "The Fool represents new beginnings, spontaneity, and taking a leap of faith. This card encourages you to embrace the unknown with optimism and trust in your journey.",
      interpretation: "You are at the start of an exciting new chapter. Trust your instincts and don't be afraid to take calculated risks. The universe is supporting your fresh start. This card suggests that your current situation requires a fresh perspective and the courage to step into the unknown. Embrace the journey ahead with an open heart and mind."
    },
    "The Magician": {
      meaning: "The Magician symbolizes manifestation, willpower, and the ability to turn dreams into reality. You have all the tools you need to succeed.",
      interpretation: "Your question shows that you have the power to create the outcome you desire. Focus your energy and take decisive action towards your goals. The Magician reminds you that you possess all the necessary skills and resources to achieve what you want. Channel your inner strength and direct your willpower toward your objectives."
    },
    "The High Priestess": {
      meaning: "The High Priestess represents intuition, mystery, and inner wisdom. Trust your subconscious mind and pay attention to your dreams.",
      interpretation: "The answer lies within you. Take time for quiet reflection and listen to your inner voice. Your intuition will guide you to the right path. This card encourages you to trust your gut feelings and pay attention to the subtle signs and synchronicities around you. Your inner wisdom holds the key to your question."
    },
    "The Empress": {
      meaning: "The Empress represents abundance, creativity, and nurturing energy. This card suggests a time of growth and fertility in your life.",
      interpretation: "You are in a period of creative abundance. Trust your natural instincts and allow your projects to flourish. Nurture what matters most to you. This card indicates a time of growth, both personally and professionally. Focus on creating and nurturing the things that bring you joy and fulfillment."
    },
    "The Emperor": {
      meaning: "The Emperor represents authority, structure, and leadership. This card suggests taking control and establishing order in your life.",
      interpretation: "It's time to take charge of your situation. Use your experience and wisdom to create a solid foundation for your goals. The Emperor encourages you to be decisive and take leadership in your current circumstances. Structure and discipline will be key to your success."
    },
    "The Lovers": {
      meaning: "The Lovers represent choices, relationships, and alignment of values. This card often appears when you need to make an important decision.",
      interpretation: "You are facing a significant choice that will shape your path forward. Consider your values and what truly matters to you. This card suggests that the decision you make should align with your deepest beliefs and desires. Trust your heart to guide you toward the right choice."
    },
    "The Chariot": {
      meaning: "The Chariot represents determination, willpower, and overcoming obstacles through focused effort.",
      interpretation: "You have the strength and determination to overcome any challenges in your path. Stay focused on your goals and don't let distractions derail you. This card suggests that success comes through disciplined action and unwavering commitment to your objectives."
    },
    "Strength": {
      meaning: "Strength represents inner power, courage, and the ability to overcome challenges through gentleness and patience.",
      interpretation: "Your true strength lies in your ability to remain calm and patient in difficult situations. Trust in your inner power and approach challenges with compassion and understanding. This card reminds you that sometimes the greatest strength is shown through gentleness."
    }
  },
  zh: {
    "愚者": {
      meaning: "愚者代表新的开始、自发性和冒险精神。这张牌鼓励你以乐观的态度拥抱未知，相信自己的旅程。",
      interpretation: "你正处在一个令人兴奋的新章节的开始。相信你的直觉，不要害怕承担经过计算的风险。宇宙正在支持你的新开始。这张牌暗示你当前的情况需要全新的视角和踏入未知的勇气。以开放的心态拥抱前方的旅程。"
    },
    "魔术师": {
      meaning: "魔术师象征着显化、意志力和将梦想变为现实的能力。你拥有成功所需的所有工具。",
      interpretation: "你的问题显示你有能力创造你想要的结果。集中你的能量，朝着你的目标采取果断的行动。魔术师提醒你，你拥有实现目标所需的所有技能和资源。引导你的内在力量，将意志力指向你的目标。"
    },
    "女祭司": {
      meaning: "女祭司代表直觉、神秘和内在智慧。相信你的潜意识，注意你的梦境。",
      interpretation: "答案就在你内心。花时间安静地反思，倾听你内心的声音。你的直觉会引导你走向正确的道路。这张牌鼓励你相信自己的直觉，注意周围微妙的迹象和同步性。你的内在智慧掌握着问题的答案。"
    },
    "皇后": {
      meaning: "皇后代表丰盛、创造力和滋养能量。这张牌暗示你生活中成长和丰饶的时期。",
      interpretation: "你正处于创造丰盛的时期。相信你的自然直觉，让你的项目蓬勃发展。滋养对你最重要的事物。这张牌表明个人和职业的成长时期。专注于创造和滋养那些带给你快乐和满足感的事物。"
    },
    "皇帝": {
      meaning: "皇帝代表权威、结构和领导力。这张牌暗示掌控局面并在生活中建立秩序。",
      interpretation: "是时候掌控你的情况了。运用你的经验和智慧为你的目标建立坚实的基础。皇帝鼓励你在当前情况下果断行动并发挥领导作用。结构和纪律将是成功的关键。"
    },
    "恋人": {
      meaning: "恋人代表选择、关系和价值观的协调。这张牌经常在你需要做重要决定时出现。",
      interpretation: "你正面临一个将塑造你前进道路的重要选择。考虑你的价值观和对你真正重要的事物。这张牌暗示你做的决定应该与你最深的信念和愿望保持一致。相信你的内心会引导你做出正确的选择。"
    },
    "战车": {
      meaning: "战车代表决心、意志力和通过专注努力克服障碍。",
      interpretation: "你有力量和决心克服前进道路上的任何挑战。专注于你的目标，不要让干扰使你偏离轨道。这张牌暗示成功来自于有纪律的行动和对目标的坚定承诺。"
    },
    "力量": {
      meaning: "力量代表内在力量、勇气和通过温柔和耐心克服挑战的能力。",
      interpretation: "你真正的力量在于在困难情况下保持冷静和耐心的能力。相信你的内在力量，以同情和理解的态度面对挑战。这张牌提醒你，有时最大的力量是通过温柔表现出来的。"
    }
  }
};

// 生成预设解读内容
export function generateFallbackReading(userPrompt: string, question?: string, preferredLang?: 'zh' | 'en') {
  const isEnglish = preferredLang
    ? preferredLang === 'en'
    : /[a-zA-Z]/.test(userPrompt);
  const fallbackData = isEnglish ? FALLBACK_READINGS.en : FALLBACK_READINGS.zh;
  const cards = Object.keys(fallbackData);
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  const cardData = fallbackData[randomCard];
  
  // 根据问题类型生成更相关的解读
  const questionText = question || userPrompt;
  const isCareerQuestion = /career|job|work|职业|工作|事业/.test(questionText.toLowerCase());
  const isLoveQuestion = /love|relationship|感情|爱情|恋爱/.test(questionText.toLowerCase());
  const isGeneralQuestion = !isCareerQuestion && !isLoveQuestion;
  
  let overallReading, advice;
  
  if (isEnglish) {
    if (isCareerQuestion) {
      overallReading = "This career-focused reading provides deep insights into your professional path and future opportunities. The cards reveal not only the current challenges you face in your work life, but also the hidden potential and strengths you possess to overcome them. Your career journey is at a pivotal moment where your decisions and actions will significantly impact your professional growth. The universe is aligning to support your career aspirations, and the cards suggest that your hard work and dedication are about to bear fruit.";
      advice = "Focus on your core strengths and unique talents. Be open to new opportunities that align with your values and long-term vision. Trust your professional instincts and don't be afraid to take calculated risks that could advance your career. Network with like-minded professionals and seek mentorship from those who have walked a similar path.";
    } else if (isLoveQuestion) {
      overallReading = "This relationship reading offers profound guidance on matters of the heart and emotional connections. The cards speak to your emotional journey, revealing both the challenges and opportunities in your love life. Whether you're seeking a new relationship, working on an existing one, or healing from past heartbreak, the cards provide clarity on your emotional path forward. Your heart is ready for the next chapter in your love story, and the universe is preparing to bring meaningful connections into your life.";
      advice = "Trust your heart and communicate openly with those who matter to you. Be authentic in your relationships and don't settle for connections that don't honor your true self. Take time to heal from past wounds before opening your heart to new possibilities. Remember that the most important relationship is the one you have with yourself.";
    } else {
      overallReading = "This comprehensive reading offers deep guidance for your current life situation and the path ahead. The cards reveal the hidden forces at work in your life, showing you both the challenges you face and the opportunities that await. Your current circumstances are part of a larger journey of growth and transformation. The universe is conspiring to support your highest good, and the cards provide the clarity you need to make empowered decisions about your future.";
      advice = "Stay open to new possibilities and trust the journey ahead. Listen to your intuition and pay attention to the synchronicities and signs around you. Take inspired action toward your goals while remaining flexible to unexpected opportunities. Remember that every challenge is an opportunity for growth and every ending is a new beginning.";
    }
  } else {
    if (isCareerQuestion) {
      overallReading = "这个职业解读为你的工作道路提供深刻的洞察和未来机遇。牌面不仅揭示了你在职场中面临的当前挑战，还展现了你克服这些挑战所拥有的隐藏潜力和优势。你的职业旅程正处于关键时刻，你的决定和行动将显著影响你的职业发展。宇宙正在协调支持你的职业抱负，牌面暗示你的努力和奉献即将结出硕果。";
      advice = "专注于你的核心优势和独特才能。对符合你价值观和长期愿景的新机会保持开放。相信你的职业直觉，不要害怕采取可能推进你职业发展的经过计算的风险。与志同道合的专业人士建立联系，寻求那些走过类似道路的人的指导。";
    } else if (isLoveQuestion) {
      overallReading = "这个感情解读为你的情感事务和情感连接提供深刻的指导。牌面诉说着你的情感旅程，揭示了你在爱情生活中面临的挑战和机遇。无论你是在寻求新的关系、努力经营现有关系，还是从过去的心碎中疗愈，牌面都为你的情感道路提供了清晰的方向。你的心已准备好迎接你爱情故事的下一个章节，宇宙正在准备将有意义的关系带入你的生活。";
      advice = "相信你的内心，与重要的人坦诚沟通。在你的关系中保持真实，不要满足于不尊重你真实自我的连接。在向新的可能性敞开心扉之前，花时间从过去的创伤中疗愈。记住，最重要的关系是你与自己的关系。";
    } else {
      overallReading = "这个全面的解读为你的当前生活情况和前方的道路提供深刻的指导。牌面揭示了你生活中隐藏的力量，向你展示了你面临的挑战和等待的机遇。你当前的情况是更大成长和转变旅程的一部分。宇宙正在协调支持你的最高利益，牌面提供了你做出关于未来的有力决定所需的清晰度。";
      advice = "对新可能性保持开放，相信前方的旅程。倾听你的直觉，注意周围的同步性和迹象。朝着你的目标采取有灵感的行动，同时对意外的机会保持灵活。记住，每一个挑战都是成长的机会，每一个结束都是新的开始。";
    }
  }
  
  return {
    cards: [
      {
        name: randomCard,
        position: "present",
        meaning: cardData.meaning,
        interpretation: cardData.interpretation
      }
    ],
    overall_reading: overallReading,
    advice: advice
  };
}
