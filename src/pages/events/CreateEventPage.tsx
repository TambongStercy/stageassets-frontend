import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui';
import { ImageUpload } from '../../components/ImageUpload';
import { PlanLimitError } from '../../components/PlanLimitError';
import { eventsService } from '../../services/events.service';
import { eventSchema, type EventFormData } from '../../schemas/event.schema';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPlanLimitError, setIsPlanLimitError] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      brandColor: '#3B82F6',
      enableAutoReminders: true,
      reminderDaysBefore: 3,
    },
  });

  const brandColor = watch('brandColor');

  const createMutation = useMutation({
    mutationFn: ({ data, logo }: { data: EventFormData; logo: File | null }) => {
      if (logo) {
        return eventsService.createEventWithLogo(data, logo);
      }
      return eventsService.createEvent(data);
    },
    onSuccess: (data) => {
      navigate(`/events/${data.id}`);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      // Check if it's a plan limit error (403 status)
      setIsPlanLimitError(err.response?.status === 403);
    },
  });

  const onSubmit = (data: EventFormData) => {
    setError(null);
    setIsPlanLimitError(false);
    createMutation.mutate({ data, logo: logoFile });
  };

  const handleUpgrade = () => {
    // TODO: Navigate to pricing/subscription page when implemented
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">Set up a new event to collect assets from speakers</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {error && isPlanLimitError && (
            <div className="mb-6">
              <PlanLimitError message={error} onUpgrade={handleUpgrade} />
            </div>
          )}
          {error && !isPlanLimitError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Tech Summit 2025"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Brief description of your event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Dates Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Deadline *
                </label>
                <input
                  {...register('deadline')}
                  type="datetime-local"
                  id="deadline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>

              {/* Event Date */}
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Date
                </label>
                <input
                  {...register('eventDate')}
                  type="datetime-local"
                  id="eventDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                )}
              </div>
            </div>

            {/* Branding Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Brand Color */}
              <div>
                <label
                  htmlFor="brandColor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
                {errors.brandColor && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandColor.message}</p>
                )}
              </div>

              {/* Event Logo */}
              <div>
                <ImageUpload
                  label="Event Logo"
                  onFileSelect={setLogoFile}
                  maxSizeMB={10}
                />
              </div>
            </div>

            {/* Reminders Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Automatic Reminders</h3>

              {/* Enable Reminders */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('enableAutoReminders')}
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Send automatic reminders to speakers
                  </span>
                </label>
              </div>

              {/* Reminder Days */}
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
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Please submit high-resolution images (at least 300 DPI)..."
              />
              {errors.customInstructions && (
                <p className="mt-1 text-sm text-red-600">{errors.customInstructions.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
