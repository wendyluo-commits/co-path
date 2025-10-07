import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorMessage({ 
  title = "出现错误",
  message, 
  onRetry,
  showRetry = false 
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium mb-1">{title}</h3>
          <p className="text-red-700 text-sm mb-4">{message}</p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
