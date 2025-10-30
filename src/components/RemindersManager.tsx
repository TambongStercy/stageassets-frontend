import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, CheckCircle2, XCircle, Clock, X, Mail } from 'lucide-react';
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
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

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
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setSelectedReminder(reminder)}
            >
              <div className="flex gap-3 flex-1">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getStatusIcon(reminder.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      Scheduled for {format(new Date(reminder.scheduledFor), 'MMM d, yyyy h:mm a')}
                    </h4>
                    {getStatusBadge(reminder.status)}
                  </div>
                  {reminder.speaker && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Sent to:</span>{' '}
                      {reminder.speaker.firstName} {reminder.speaker.lastName}{' '}
                      <span className="text-gray-500">({reminder.speaker.email})</span>
                    </p>
                  )}
                  {reminder.emailSubject && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Subject:</span> {reminder.emailSubject}
                    </p>
                  )}
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
              <div className="text-gray-400 hover:text-blue-600 flex-shrink-0 ml-2">
                <Mail className="w-5 h-5" />
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

      {/* Email Details Modal */}
      {selectedReminder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReminder(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Details</h3>
                  <p className="text-sm text-blue-100">
                    {selectedReminder.speaker
                      ? `${selectedReminder.speaker.firstName} ${selectedReminder.speaker.lastName}`
                      : 'Reminder Details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReminder(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  {getStatusBadge(selectedReminder.status)}
                </div>
                {selectedReminder.speaker && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Recipient:</span>
                    <span className="text-sm text-gray-900">
                      {selectedReminder.speaker.firstName} {selectedReminder.speaker.lastName}{' '}
                      <span className="text-gray-500">({selectedReminder.speaker.email})</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Scheduled:</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(selectedReminder.scheduledFor), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {selectedReminder.sentAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Sent:</span>
                    <span className="text-sm text-gray-900">
                      {format(new Date(selectedReminder.sentAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
              </div>

              {/* Email Subject */}
              {selectedReminder.emailSubject && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Subject:</h4>
                  <p className="text-gray-900 font-medium">{selectedReminder.emailSubject}</p>
                </div>
              )}

              {/* Email Body */}
              {selectedReminder.emailBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Message:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans leading-relaxed">
                      {selectedReminder.emailBody}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {selectedReminder.errorMessage && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Error:</h4>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-900">{selectedReminder.errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Failure Reason (legacy field) */}
              {selectedReminder.failureReason && !selectedReminder.errorMessage && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Failure Reason:</h4>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-900">{selectedReminder.failureReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <Button
                onClick={() => setSelectedReminder(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
