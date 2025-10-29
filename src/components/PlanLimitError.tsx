import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui';

interface PlanLimitErrorProps {
  message: string;
  onUpgrade?: () => void;
}

export function PlanLimitError({ message, onUpgrade }: PlanLimitErrorProps) {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-700" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Limit Reached</h3>
          <p className="text-gray-700 mb-4">{message}</p>
          {onUpgrade && (
            <Button
              onClick={onUpgrade}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Upgrade Plan
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
