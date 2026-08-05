import { AlertCircle } from 'lucide-react';
import { Button } from '@repo/ui';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'An error occurred while loading data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 text-center shadow-sm">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div className="space-y-1 px-4">
        <h3 className="font-semibold text-destructive">Error Loading Data</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
