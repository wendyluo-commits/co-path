import knowledgeBase from '@/data/tarot-knowledge-base.json';

export interface CardKnowledge {
  card_id: string;
  card_name_zh: string;
  card_name_en: string;
  arcana: string;
  number: number;
  suit: string | null;
  rank: string | null;
  upright_keywords: string[];
  reversed_keywords: string[];
  core_theme: string;
  symbolism_summary: string;
  imagery_elements: { element: string; meaning: string }[];
  upright_meaning: string;
  reversed_meaning: string;
  light_shadow: { light: string; shadow: string };
  one_sentence_summary: string;
}

const nameMap = new Map<string, CardKnowledge>();
for (const entry of knowledgeBase as CardKnowledge[]) {
  nameMap.set(entry.card_name_en.toLowerCase(), entry);
  nameMap.set(entry.card_name_zh, entry);
}

export function getCardKnowledge(cardName: string): CardKnowledge | undefined {
  return nameMap.get(cardName.toLowerCase()) || nameMap.get(cardName);
}
