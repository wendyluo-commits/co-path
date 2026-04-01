const MAJOR_ARCANA_MAP: Record<number, string> = {
  0: 'the fool.jpg',
  1: 'THE MAGICIAN..jpg',
  2: 'THE HIGH PRIESTESS.jpg',
  3: 'THE EMPRESS..jpg',
  4: 'THE EMPEROR..jpg',
  5: 'THE HIEROPHANT.jpg',
  6: 'THE LOVERS..jpg',
  7: 'THE CHARIOT..jpg',
  8: 'STRENGTH..jpg',
  9: 'THE HERMIT..jpg',
  10: 'WHEEL • FORTUNE.jpg',
  11: 'TUSTICE ..jpg',
  12: 'THE HANGED MAN..jpg',
  13: 'DEATH..jpg',
  14: 'TEMPERANCE..jpg',
  15: 'THE DEVIL •.jpg',
  16: 'THE TOWER..jpg',
  17: 'THE STAR..jpg',
  18: 'THE MOON.jpg',
  19: 'THE SUN.jpg',
  20: 'JUDGEMENT..jpg',
  21: 'THE VYORLD..jpg',
};

const NAME_MAP: Record<string, string> = {
  'The Fool': 'the fool.jpg',
  'The Magician': 'THE MAGICIAN..jpg',
  'The High Priestess': 'THE HIGH PRIESTESS.jpg',
  'The Empress': 'THE EMPRESS..jpg',
  'The Emperor': 'THE EMPEROR..jpg',
  'The Hierophant': 'THE HIEROPHANT.jpg',
  'The Lovers': 'THE LOVERS..jpg',
  'The Chariot': 'THE CHARIOT..jpg',
  'Strength': 'STRENGTH..jpg',
  'The Hermit': 'THE HERMIT..jpg',
  'Wheel of Fortune': 'WHEEL • FORTUNE.jpg',
  'Justice': 'TUSTICE ..jpg',
  'The Hanged Man': 'THE HANGED MAN..jpg',
  'Death': 'DEATH..jpg',
  'Temperance': 'TEMPERANCE..jpg',
  'The Devil': 'THE DEVIL •.jpg',
  'The Tower': 'THE TOWER..jpg',
  'The Star': 'THE STAR..jpg',
  'The Moon': 'THE MOON.jpg',
  'The Sun': 'THE SUN.jpg',
  'Judgement': 'JUDGEMENT..jpg',
  'The World': 'THE VYORLD..jpg',
  'Ace of Cups': 'c01.jpg',
  'Two of Cups': 'c02.jpg',
  'Three of Cups': 'c03.jpg',
  'Four of Cups': 'c04.jpg',
  'Five of Cups': 'c05.jpg',
  'Six of Cups': 'c06.jpg',
  'Seven of Cups': 'c07.jpg',
  'Eight of Cups': 'c08.jpg',
  'Nine of Cups': 'c09.jpg',
  'Ten of Cups': 'c10.jpg',
  'Page of Cups': 'c11.jpg',
  'Knight of Cups': 'c12.jpg',
  'Queen of Cups': 'c13.jpg',
  'King of Cups': 'c14.jpg',
  'Ace of Pentacles': 'p01.jpg',
  'Two of Pentacles': 'p02.jpg',
  'Three of Pentacles': 'p03.jpg',
  'Four of Pentacles': 'p04.jpg',
  'Five of Pentacles': 'p05.jpg',
  'Six of Pentacles': 'p06.jpg',
  'Seven of Pentacles': 'p07.jpg',
  'Eight of Pentacles': 'p08.jpg',
  'Nine of Pentacles': 'p09.jpg',
  'Ten of Pentacles': 'p10.jpg',
  'Page of Pentacles': 'p11.jpg',
  'Knight of Pentacles': 'p12.jpg',
  'Queen of Pentacles': 'p13.jpg',
  'King of Pentacles': 'p14.jpg',
  'Ace of Swords': 's01.jpg',
  'Two of Swords': 's02.jpg',
  'Three of Swords': 's03.jpg',
  'Four of Swords': 's04.jpg',
  'Five of Swords': 's05.jpg',
  'Six of Swords': 's06.jpg',
  'Seven of Swords': 's07.jpg',
  'Eight of Swords': 's08.jpg',
  'Nine of Swords': 's09.jpg',
  'Ten of Swords': 's10.jpg',
  'Page of Swords': 's11.jpg',
  'Knight of Swords': 's12.jpg',
  'Queen of Swords': 's13.jpg',
  'King of Swords': 's14.jpg',
  'Ace of Wands': 'w01.jpg',
  'Two of Wands': 'w02.jpg',
  'Three of Wands': 'w03.jpg',
  'Four of Wands': 'w04.jpg',
  'Five of Wands': 'w05.jpg',
  'Six of Wands': 'w06.jpg',
  'Seven of Wands': 'w07.jpg',
  'Eight of Wands': 'w08.jpg',
  'Nine of Wands': 'w09.jpg',
  'Ten of Wands': 'w10.jpg',
  'Page of Wands': 'w11.jpg',
  'Knight of Wands': 'w12.jpg',
  'Queen of Wands': 'w13.jpg',
  'King of Wands': 'w14.jpg',
  '测试卡牌': 'the fool.jpg',
  '愚者': 'the fool.jpg',
  '魔术师': 'THE MAGICIAN..jpg',
  '女祭司': 'THE HIGH PRIESTESS.jpg',
  '女皇': 'THE EMPRESS..jpg',
  '皇帝': 'THE EMPEROR..jpg',
  '教皇': 'THE HIEROPHANT.jpg',
  '恋人': 'THE LOVERS..jpg',
  '战车': 'THE CHARIOT..jpg',
  '力量': 'STRENGTH..jpg',
  '隐者': 'THE HERMIT..jpg',
  '命运之轮': 'WHEEL • FORTUNE.jpg',
  '正义': 'TUSTICE ..jpg',
  '倒吊人': 'THE HANGED MAN..jpg',
  '死神': 'DEATH..jpg',
  '节制': 'TEMPERANCE..jpg',
  '恶魔': 'THE DEVIL •.jpg',
  '塔': 'THE TOWER..jpg',
  '星星': 'THE STAR..jpg',
  '月亮': 'THE MOON.jpg',
  '太阳': 'THE SUN.jpg',
  '审判': 'JUDGEMENT..jpg',
  '世界': 'THE VYORLD..jpg',
  '圣杯一': 'c01.jpg',
  '圣杯二': 'c02.jpg',
  '圣杯三': 'c03.jpg',
  '圣杯四': 'c04.jpg',
  '圣杯五': 'c05.jpg',
  '圣杯六': 'c06.jpg',
  '圣杯七': 'c07.jpg',
  '圣杯八': 'c08.jpg',
  '圣杯九': 'c09.jpg',
  '圣杯十': 'c10.jpg',
  '圣杯侍从': 'c11.jpg',
  '圣杯骑士': 'c12.jpg',
  '圣杯王后': 'c13.jpg',
  '圣杯皇后': 'c13.jpg',
  '圣杯国王': 'c14.jpg',
  '星币一': 'p01.jpg',
  '星币二': 'p02.jpg',
  '星币三': 'p03.jpg',
  '星币四': 'p04.jpg',
  '星币五': 'p05.jpg',
  '星币六': 'p06.jpg',
  '星币七': 'p07.jpg',
  '星币八': 'p08.jpg',
  '星币九': 'p09.jpg',
  '星币十': 'p10.jpg',
  '星币侍从': 'p11.jpg',
  '星币骑士': 'p12.jpg',
  '星币王后': 'p13.jpg',
  '星币皇后': 'p13.jpg',
  '星币国王': 'p14.jpg',
  '宝剑一': 's01.jpg',
  '宝剑二': 's02.jpg',
  '宝剑三': 's03.jpg',
  '宝剑四': 's04.jpg',
  '宝剑五': 's05.jpg',
  '宝剑六': 's06.jpg',
  '宝剑七': 's07.jpg',
  '宝剑八': 's08.jpg',
  '宝剑九': 's09.jpg',
  '宝剑十': 's10.jpg',
  '宝剑侍从': 's11.jpg',
  '宝剑骑士': 's12.jpg',
  '宝剑王后': 's13.jpg',
  '宝剑皇后': 's13.jpg',
  '宝剑国王': 's14.jpg',
  '权杖一': 'w01.jpg',
  '权杖二': 'w02.jpg',
  '权杖三': 'w03.jpg',
  '权杖四': 'w04.jpg',
  '权杖五': 'w05.jpg',
  '权杖六': 'w06.jpg',
  '权杖七': 'w07.jpg',
  '权杖八': 'w08.jpg',
  '权杖九': 'w09.jpg',
  '权杖十': 'w10.jpg',
  '权杖侍从': 'w11.jpg',
  '权杖骑士': 'w12.jpg',
  '权杖王后': 'w13.jpg',
  '权杖皇后': 'w13.jpg',
  '权杖国王': 'w14.jpg',
};

const SUIT_PREFIX: Record<string, string> = {
  cups: 'c', '圣杯': 'c',
  pentacles: 'p', '星币': 'p',
  swords: 's', '宝剑': 's',
  wands: 'w', '权杖': 'w',
};

export const CARDBACK_PATH = '/images/tarot-cards/cardback.png';

/**
 * Build the image path for a tarot card, using suit+number first,
 * then falling back to the name-based mapping.
 */
export function getCardImagePath(card: {
  suit?: string;
  number?: number;
  name?: string;
}): string {
  const { suit, number, name } = card;

  if ((suit === 'major' || suit === 'Major') && number !== undefined) {
    const fileName = MAJOR_ARCANA_MAP[number];
    if (fileName) return `/images/tarot-cards/${fileName}`;
  }

  if (suit && number !== undefined) {
    const prefix =
      SUIT_PREFIX[suit.toLowerCase()] ??
      (name?.includes('Cups') || name?.includes('圣杯')
        ? 'c'
        : name?.includes('Pentacles') || name?.includes('星币')
          ? 'p'
          : name?.includes('Swords') || name?.includes('宝剑')
            ? 's'
            : name?.includes('Wands') || name?.includes('权杖')
              ? 'w'
              : '');

    if (prefix) {
      return `/images/tarot-cards/${prefix}${number.toString().padStart(2, '0')}.jpg`;
    }
  }

  const cardName = name || '';
  const baseCardName = cardName.includes('逆位')
    ? cardName.replace('逆位', '').trim()
    : cardName;

  if (NAME_MAP[baseCardName]) {
    return `/images/tarot-cards/${NAME_MAP[baseCardName]}`;
  }

  const normalized = baseCardName.replace(/\s+/g, '_').toUpperCase();
  return `/images/tarot-cards/${normalized}.jpg`;
}

/**
 * Simplified version for history page where only cardName is available.
 */
export function getCardImageByName(cardName: string): string {
  return NAME_MAP[cardName]
    ? `/images/tarot-cards/${NAME_MAP[cardName]}`
    : CARDBACK_PATH;
}
