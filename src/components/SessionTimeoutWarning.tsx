import { AlertCircle, X, Clock } from 'lucide-react';
import { Button } from './ui';

interface SessionTimeoutWarningProps {
  timeRemaining: string;
  onExtend: () => void;
  onDismiss: () => void;
  isExtending?: boolean;
}

export function SessionTimeoutWarning({
  timeRemaining,
  onExtend,
  onDismiss,
  isExtending = false,
}: SessionTimeoutWarningProps) {
  return (
    <div
      className="fixed bottom-4 right-4 bg-amber-50 border-2 border-amber-300 rounded-lg p-4 shadow-lg max-w-sm z-50 animate-in slide-in-from-bottom-5"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-amber-900">
              Session Expiring Soon
            </h4>
            <button
              onClick={onDismiss}
              className="text-amber-600 hover:text-amber-900 transition-colors"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-amber-800 mb-1">
            Your session will expire in:
          </p>
          <div className="text-2xl font-bold text-amber-900 mb-3">
            {timeRemaining}
          </div>
          <p className="text-xs text-amber-700 mb-3">
            Any unsaved work will be lost. Click the button below to extend your session.
          </p>
          <Button
            size="sm"
            onClick={onExtend}
            disabled={isExtending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}
