import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui';
import { ImageUpload } from './ImageUpload';
import { eventsService } from '../services/events.service';
import { eventSchema, type EventFormData } from '../schemas/event.schema';
import type { Event } from '../types/event.types';
import { getFileUrl } from '../lib/file-url';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function EditEventModal({ isOpen, onClose, event }: EditEventModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      description: event.description || '',
      deadline: new Date(event.deadline).toISOString().slice(0, 16),
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      brandColor: event.brandColor || '#3B82F6',
      enableAutoReminders: event.enableAutoReminders,
      reminderDaysBefore: event.reminderDaysBefore || 3,
      customInstructions: event.customInstructions || '',
    },
  });

  const brandColor = watch('brandColor');

  const updateMutation = useMutation({
    mutationFn: ({ data, logo }: { data: EventFormData; logo: File | null }) => {
      if (logo) {
        return eventsService.updateEventWithLogo(event.id, data, logo);
      }
      return eventsService.updateEvent(event.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to update event';
      setError(errorMessage);
    },
  });

  const onSubmit = (data: EventFormData) => {
    setError(null);
    updateMutation.mutate({ data, logo: logoFile });
  };

  useEffect(() => {
    if (isOpen) {
      reset({
        name: event.name,
        description: event.description || '',
        deadline: new Date(event.deadline).toISOString().slice(0, 16),
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
        brandColor: event.brandColor || '#3B82F6',
        enableAutoReminders: event.enableAutoReminders,
        reminderDaysBefore: event.reminderDaysBefore || 3,
        customInstructions: event.customInstructions || '',
      });
      setError(null);
      setLogoFile(null);
    }
  }, [isOpen, event, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 duration-200 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Event Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Dates Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Submission Deadline *
              </label>
              <input
                {...register('deadline')}
                type="datetime-local"
                id="deadline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date
              </label>
              <input
                {...register('eventDate')}
                type="datetime-local"
                id="eventDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.eventDate && (
                <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
              )}
            </div>
          </div>

          {/* Branding Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brandColor" className="block text-sm font-medium text-gray-700 mb-1">
                Brand Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setValue('brandColor', e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  {...register('brandColor')}
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {errors.brandColor && (
                <p className="mt-1 text-sm text-red-600">{errors.brandColor.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Logo
              </label>
              {event.logoUrl && !logoFile && (
                <div className="mb-2">
                  <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={getFileUrl(event.logoUrl)!}
                      alt="Current logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current logo</p>
                </div>
              )}
              <ImageUpload label="Update Event Logo" onFileSelect={setLogoFile} maxSizeMB={10} />
            </div>
          </div>

          {/* Reminders Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Automatic Reminders</h3>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('enableAutoReminders')}
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Send automatic reminders to speakers</span>
              </label>
            </div>

            <div>
              <label
                htmlFor="reminderDaysBefore"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Send reminder this many days before deadline
              </label>
              <input
                {...register('reminderDaysBefore', { valueAsNumber: true })}
                type="number"
                id="reminderDaysBefore"
                min="1"
                max="30"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.reminderDaysBefore && (
                <p className="mt-1 text-sm text-red-600">{errors.reminderDaysBefore.message}</p>
              )}
            </div>
          </div>

          {/* Custom Instructions */}
          <div>
            <label
              htmlFor="customInstructions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Custom Instructions for Speakers
            </label>
            <textarea
              {...register('customInstructions')}
              id="customInstructions"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.customInstructions && (
              <p className="mt-1 text-sm text-red-600">{errors.customInstructions.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
