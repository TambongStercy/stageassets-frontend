import { useState } from 'react';
import { Mail, Trash2, Copy, ExternalLink, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Speaker } from '../types/speaker.types';
import { Badge } from './ui';
import { ConfirmationModal } from './ConfirmationModal';
import { speakersService } from '../services/speakers.service';

interface SpeakerTableProps {
  speakers: Speaker[];
  eventId: number;
}

export function SpeakerTable({ speakers, eventId }: SpeakerTableProps) {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<{ id: number; name: string; email: string } | null>(null);
  const [copiedSpeakerId, setCopiedSpeakerId] = useState<number | null>(null);

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

  const handleDeleteClick = (speaker: Speaker) => {
    const name = speaker.firstName || speaker.lastName
      ? `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim()
      : speaker.email;
    setSpeakerToDelete({ id: speaker.id, name, email: speaker.email });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (speakerToDelete) {
      deleteMutation.mutate(speakerToDelete.id);
      setIsDeleteModalOpen(false);
      setSpeakerToDelete(null);
    }
  };

  const getPortalLink = (accessToken: string) => {
    return `${window.location.origin}/portal/speakers/${accessToken}`;
  };

  const handleCopyLink = async (speaker: Speaker) => {
    const link = getPortalLink(speaker.accessToken);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSpeakerId(speaker.id);
      setTimeout(() => setCopiedSpeakerId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

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
            <th className="pb-3 font-medium">Portal Link</th>
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
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(speaker)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                    title="Copy portal link"
                  >
                    {copiedSpeakerId === speaker.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </>
                    )}
                  </button>
                  <a
                    href={getPortalLink(speaker.accessToken)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                    title="Open portal in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </td>
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
                    onClick={() => handleDeleteClick(speaker)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSpeakerToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Speaker?"
        message={`Are you sure you want to delete ${speakerToDelete?.name}? This will permanently remove the speaker and all their submissions from this event.`}
        confirmText="Delete Speaker"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
