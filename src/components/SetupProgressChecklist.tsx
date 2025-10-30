import { CheckCircle2, Circle, AlertCircle, Users, FileStack, TestTube2 } from 'lucide-react';
import { Button } from './ui';

interface SetupProgressChecklistProps {
  hasAssets: boolean;
  hasSpeakers: boolean;
  onInviteSpeakers: () => void;
  onSetupAssets: () => void;
  onViewPortal: () => void;
  hideWhenComplete?: boolean;
}

export function SetupProgressChecklist({
  hasAssets,
  hasSpeakers,
  onInviteSpeakers,
  onSetupAssets,
  onViewPortal,
  hideWhenComplete = false,
}: SetupProgressChecklistProps) {
  const completedCount = [hasAssets, hasSpeakers].filter(Boolean).length;
  const totalSteps = 2;
  const progressPercentage = (completedCount / totalSteps) * 100;

  // If everything is complete and hideWhenComplete is true, don't render anything
  if (completedCount === totalSteps && hideWhenComplete) {
    return null;
  }

  // If everything is complete, show simplified version
  if (completedCount === totalSteps) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Event Setup Complete!</h3>
              <p className="text-sm text-emerald-700">Your event is ready to collect submissions</p>
            </div>
          </div>
          <Button
            onClick={onViewPortal}
            variant="secondary"
            className="bg-white hover:bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-semibold shadow-sm"
          >
            <TestTube2 className="w-4 h-4 mr-2" />
            View Speaker Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Setup Progress</h3>
          <p className="text-sm text-gray-600">Complete these steps to launch your event</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completedCount}/{totalSteps}</div>
            <div className="text-xs text-gray-600 font-medium">completed</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {/* Asset Requirements */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
            hasAssets
              ? 'bg-white border-2 border-emerald-200'
              : 'bg-white border-2 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasAssets ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 animate-pulse" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Define Asset Requirements</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {hasAssets
                  ? 'Asset requirements configured'
                  : 'Specify what assets speakers need to submit'}
              </p>
            </div>
          </div>
          {!hasAssets && (
            <Button
              onClick={onSetupAssets}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
            >
              <FileStack className="w-3.5 h-3.5 mr-1.5" />
              Setup Now
            </Button>
          )}
        </div>

        {/* Invite Speakers */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
            hasSpeakers
              ? 'bg-white border-2 border-emerald-200'
              : 'bg-white border-2 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasSpeakers ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 animate-pulse" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Invite Speakers</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {hasSpeakers
                  ? 'Speakers have been invited'
                  : 'Send invitations to your speakers'}
              </p>
            </div>
          </div>
          {!hasSpeakers && (
            <Button
              onClick={onInviteSpeakers}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Invite Now
            </Button>
          )}
        </div>
      </div>

      {/* Footer Tip */}
      {completedCount > 0 && completedCount < totalSteps && (
        <div className="mt-4 pt-4 border-t-2 border-blue-100">
          <p className="text-xs text-gray-600 italic">
            Great progress! Complete the remaining {totalSteps - completedCount} step{totalSteps - completedCount > 1 ? 's' : ''} to launch your event.
          </p>
        </div>
      )}
    </div>
  );
}
