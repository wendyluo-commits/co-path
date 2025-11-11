'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollHintProps {
  className?: string;
}

export function ScrollHint({ className = '' }: ScrollHintProps) {
  return (
    <motion.div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: [20, 0, 0, -10]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown 
            size={24} 
            className="text-white drop-shadow-lg"
          />
        </motion.div>
        <motion.p
          className="text-white text-sm font-medium drop-shadow-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          向下滑动查看更多
        </motion.p>
      </div>
    </motion.div>
  );
}




