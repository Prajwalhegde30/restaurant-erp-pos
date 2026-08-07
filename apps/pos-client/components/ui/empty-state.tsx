import { SearchX } from 'lucide-react';
import { Button } from '@repo/ui';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No records found',
  description = 'Get started by creating a new record.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-muted/20 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1 px-4">
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
