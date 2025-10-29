import { Button } from './ui';
import type { FC } from 'react';

interface EmptyStateProps {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-6 shadow-sm border border-gray-200">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto text-center leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
