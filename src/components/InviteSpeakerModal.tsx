import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { Button } from './ui';
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
      setError(err.response?.data?.message || 'Failed to invite speaker');
    },
  });

  const onSubmit = (data: InviteSpeakerFormData) => {
    setError(null);
    inviteMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Speaker">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="speaker@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Smith"
            />
          </div>
        </div>

        {/* Company & Title */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              {...register('jobTitle')}
              type="text"
              id="jobTitle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Senior Engineer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={inviteMutation.isPending}
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
