import { TarotCard as TarotCardType } from '@/schemas/reading.schema';
import { getTarotCardImage } from '@/lib/tarot-images';
import Image from 'next/image';

interface TarotCardProps {
  card: TarotCardType;
  index: number;
}

export function TarotCard({ card, index }: TarotCardProps) {
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-purple-600 to-blue-600',
      'from-blue-600 to-indigo-600',
      'from-indigo-600 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
      {/* Card Visual */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-52 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-200">
          <Image
            src={getTarotCardImage(card.name)}
            alt={`${card.name} - ${card.orientation === 'upright' ? '正位' : '逆位'}`}
            fill
            className={`object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`}
            sizes="(max-width: 128px) 100vw, 128px"
            onError={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
            {card.orientation === 'upright' ? '正位' : '逆位'}
          </div>
        </div>
        
        {/* Card Header */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {card.name}
        </h3>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span className={`px-2 py-1 rounded-full text-xs ${
            card.orientation === 'upright' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {card.orientation === 'upright' ? '正位' : '逆位'}
          </span>
          {card.position && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {card.position}
            </span>
          )}
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3 text-center">关键词</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {card.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            牌意解释
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {card.interpretation}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            实用建议
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {card.advice}
          </p>
        </div>
      </div>
    </div>
  );
}
