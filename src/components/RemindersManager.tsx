import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui';
import { remindersService } from '../services/reminders.service';
import { speakersService } from '../services/speakers.service';
import type { Reminder } from '../types/reminders.types';

interface RemindersManagerProps {
  eventId: number;
}

export function RemindersManager({ eventId }: RemindersManagerProps) {
  const queryClient = useQueryClient();
  const [triggeringForSpeaker, setTriggeringForSpeaker] = useState<number | null>(null);

  // Get speakers for this event
  const { data: speakers } = useQuery({
    queryKey: ['speakers', eventId],
    queryFn: () => speakersService.getSpeakers(eventId),
  });

  // Get reminders
  const { data: reminders, isLoading, isError, error } = useQuery({
    queryKey: ['reminders', eventId],
    queryFn: () => remindersService.getReminders(eventId),
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (endpoint not implemented)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Trigger reminder mutation
  const triggerMutation = useMutation({
    mutationFn: (speakerId: number) => remindersService.triggerReminder(speakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', eventId] });
      setTriggeringForSpeaker(null);
    },
    onError: (err: any) => {
      // Silently fail for 404 errors (endpoint not implemented)
      if (err?.response?.status !== 404) {
        console.error('Failed to trigger reminder:', err);
      }
      setTriggeringForSpeaker(null);
    },
  });

  // Get pending speakers (not yet submitted)
  const pendingSpeakers = speakers?.filter(
    (speaker) => speaker.submissionStatus !== 'complete'
  ) || [];

  const handleTriggerForAll = async () => {
    for (const speaker of pendingSpeakers) {
      setTriggeringForSpeaker(speaker.id);
      await triggerMutation.mutateAsync(speaker.id);
    }
  };

  const getStatusIcon = (status: Reminder['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: Reminder['status']) => {
    const variants = {
      sent: 'bg-emerald-50 text-emerald-700',
      failed: 'bg-red-50 text-red-700',
      pending: 'bg-yellow-50 text-yellow-700',
    };

    const labels = {
      sent: 'Sent',
      failed: 'Failed',
      pending: 'Pending',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Check if endpoint is not available (404)
  const isEndpointUnavailable = isError && (error as any)?.response?.status === 404;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
          <p className="text-sm text-gray-600">
            Automatic and manual reminders sent to speakers
          </p>
        </div>
        <Button
          onClick={handleTriggerForAll}
          disabled={
            triggerMutation.isPending ||
            isEndpointUnavailable ||
            pendingSpeakers.length === 0
          }
          className="bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {triggerMutation.isPending
            ? 'Sending...'
            : `Send to All Pending (${pendingSpeakers.length})`}
        </Button>
      </div>

      {isEndpointUnavailable ? (
        <div className="text-center py-12 bg-blue-50 border border-blue-200 rounded-lg">
          <Bell className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-blue-900 font-medium mb-2">Reminders Feature Coming Soon</p>
          <p className="text-sm text-blue-700">
            The reminders functionality is not yet available in your backend.
            <br />
            This feature will be enabled once the backend endpoints are implemented.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : reminders && reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getStatusIcon(reminder.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      Scheduled for {format(new Date(reminder.scheduledFor), 'MMM d, yyyy h:mm a')}
                    </h4>
                    {getStatusBadge(reminder.status)}
                  </div>
                  {reminder.sentAt && (
                    <p className="text-sm text-gray-600 mb-1">
                      Sent at {format(new Date(reminder.sentAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                  {reminder.failureReason && (
                    <p className="text-sm text-red-600">
                      Failed: {reminder.failureReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No reminders scheduled yet</p>
          <p className="text-sm text-gray-500">
            Reminders are automatically scheduled based on your event settings
          </p>
        </div>
      )}
    </div>
  );
}
