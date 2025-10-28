import { Mail, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Speaker } from '../types/speaker.types';
import { Badge } from './ui';
import { speakersService } from '../services/speakers.service';

interface SpeakerTableProps {
  speakers: Speaker[];
  eventId: number;
}

export function SpeakerTable({ speakers, eventId }: SpeakerTableProps) {
  const queryClient = useQueryClient();

  const resendMutation = useMutation({
    mutationFn: (speakerId: number) => speakersService.resendInvitation(eventId, speakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', eventId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (speakerId: number) => speakersService.deleteSpeaker(eventId, speakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events-stats'] });
    },
  });

  const getStatusBadge = (status: Speaker['submissionStatus']) => {
    const variants = {
      complete: 'default' as const,
      partial: 'secondary' as const,
      pending: 'secondary' as const,
    };

    const labels = {
      complete: 'Submitted',
      partial: 'Partial',
      pending: 'Pending',
    };

    return (
      <Badge variant={variants[status]} className={status === 'complete' ? 'bg-emerald-50 text-emerald-700' : ''}>
        {labels[status]}
      </Badge>
    );
  };

  if (speakers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No speakers invited yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
            <th className="pb-3 font-medium">Speaker</th>
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Invited</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {speakers.map((speaker) => (
            <tr key={speaker.id} className="text-sm">
              <td className="py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {speaker.firstName || speaker.lastName
                      ? `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim()
                      : speaker.email}
                  </div>
                  <div className="text-gray-500">{speaker.email}</div>
                </div>
              </td>
              <td className="py-4 text-gray-700">
                {speaker.company || '—'}
                {speaker.jobTitle && <div className="text-gray-500 text-xs">{speaker.jobTitle}</div>}
              </td>
              <td className="py-4">{getStatusBadge(speaker.submissionStatus)}</td>
              <td className="py-4 text-gray-600">
                {format(new Date(speaker.invitedAt), 'MMM d, yyyy')}
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => resendMutation.mutate(speaker.id)}
                    disabled={resendMutation.isPending}
                    className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                    title="Resend invitation"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this speaker?')) {
                        deleteMutation.mutate(speaker.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Delete speaker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
