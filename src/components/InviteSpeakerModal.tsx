import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { Button } from './ui';
import { PlanLimitError } from './PlanLimitError';
import { speakersService } from '../services/speakers.service';
import { inviteSpeakerSchema, type InviteSpeakerFormData } from '../schemas/event.schema';

interface InviteSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
}

export function InviteSpeakerModal({ isOpen, onClose, eventId }: InviteSpeakerModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isPlanLimitError, setIsPlanLimitError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteSpeakerFormData>({
    resolver: zodResolver(inviteSpeakerSchema),
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteSpeakerFormData) => speakersService.inviteSpeaker(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events-stats'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to invite speaker';
      setError(errorMessage);
      setIsPlanLimitError(err.response?.status === 403);
    },
  });

  const onSubmit = (data: InviteSpeakerFormData) => {
    setError(null);
    setIsPlanLimitError(false);
    inviteMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setError(null);
    setIsPlanLimitError(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Speaker">
      {error && isPlanLimitError && (
        <div className="mb-4">
          <PlanLimitError message={error} />
        </div>
      )}
      {error && !isPlanLimitError && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="speaker@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Smith"
            />
          </div>
        </div>

        {/* Company & Title */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              {...register('jobTitle')}
              type="text"
              id="jobTitle"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Senior Engineer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            type="submit"
            disabled={inviteMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {inviteMutation.isPending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Sending...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
