import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50 h-full min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-50 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-2 max-w-sm">{description}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-6 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
