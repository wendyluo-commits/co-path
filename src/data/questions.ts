export const questionCategories = {
  zh: [
    {
      id: 'career',
      label: '事业',
      questions: [
        "我当下的事业主线应该是什么？",
        "我的经历正把我推向哪条事业路径？",
        "我目前最大的职业瓶颈是什么？",
        "什么因素能助我更顺利地找到理想工作？",
      ],
    },
    {
      id: 'love',
      label: '爱情',
      questions: [
        "我与伴侣之间最需要修复的是什么？",
        "我应如何面对当前的情感不确定性？",
        "我如何吸引真正适合我的关系？",
        "我和对方的关系下一步需要什么样的努力？",
      ],
    },
    {
      id: 'growth',
      label: '自我成长',
      questions: [
        "现在是什么正在消耗我的力量？",
        "我怎样才能更勇敢地面对未知与变化？",
        "我内心最深的焦虑是什么？",
        "我如何在职业发展中保持平衡？",
      ],
    },
  ],
  en: [
    {
      id: 'career',
      label: 'Career',
      questions: [
        "What should be my main career path right now?",
        "Which career direction is my experience pushing me towards?",
        "What is my biggest career bottleneck currently?",
        "What factors can help me find my ideal job more smoothly?",
      ],
    },
    {
      id: 'love',
      label: 'Love',
      questions: [
        "What needs healing most between my partner and me?",
        "How should I navigate the uncertainty in my current relationship?",
        "How can I attract a relationship that truly fits me?",
        "What effort is needed for the next step in our relationship?",
      ],
    },
    {
      id: 'growth',
      label: 'Growth',
      questions: [
        "What is currently draining my energy?",
        "How can I be braver in facing the unknown and change?",
        "What is my deepest anxiety?",
        "How can I maintain balance in my career development?",
      ],
    },
  ],
};

export const questions = {
  zh: questionCategories.zh.flatMap((category) => category.questions),
  en: questionCategories.en.flatMap((category) => category.questions),
};

export const uiTexts = {
  zh: {
    title: "我的疑问是",
    placeholder: "请输入您的问题...",
    submit: "选好了",
    skip: "跳过",
    refresh: "刷新建议"
  },
  en: {
    title: "My question is",
    placeholder: "Enter your question...",
    submit: "Ready",
    skip: "Skip",
    refresh: "Refresh suggestions"
  }
};
