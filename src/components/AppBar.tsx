'use client';

interface AppBarProps {
  title: string;
  leftAction?: {
    text: string;
    onClick: () => void;
  };
  rightAction?: {
    text: string;
    onClick: () => void;
  };
}

export function AppBar({ title, leftAction, rightAction }: AppBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white h-14 flex items-center justify-between px-4 safe-area-top">
      {/* Left Action */}
      <div className="w-16">
        {leftAction && (
          <button
            onClick={leftAction.onClick}
            className="text-sm text-gray-800 hover:text-gray-600 transition-colors"
            aria-label={leftAction.text}
          >
            {leftAction.text}
          </button>
        )}
      </div>
      
      {/* Center Title */}
      <h1 className="text-base font-semibold text-gray-900">
        {title}
      </h1>
      
      {/* Right Action */}
      <div className="w-16 flex justify-end">
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            className="text-sm text-gray-800 hover:text-gray-600 transition-colors"
            aria-label={rightAction.text}
          >
            {rightAction.text}
          </button>
        )}
      </div>
    </div>
  );
}
