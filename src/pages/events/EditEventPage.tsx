import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Palette, Image as ImageIcon, Bell, FileText } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui';
import { ImageUpload } from '../../components/ImageUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { eventsService } from '../../services/events.service';
import { eventSchema, type EventFormData } from '../../schemas/event.schema';
import { getFileUrl } from '../../lib/file-url';

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEvent(Number(id)),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const brandColor = watch('brandColor');

  // Reset form when event data loads
  useEffect(() => {
    if (event) {
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
    }
  }, [event, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ data, logo }: { data: EventFormData; logo: File | null }) => {
      // Transform datetime-local strings to ISO 8601 format
      const transformedData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : data.deadline,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
      };

      if (logo) {
        return eventsService.updateEventWithLogo(Number(id), transformedData, logo);
      }
      return eventsService.updateEvent(Number(id), transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${id}`);
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Event not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event details
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Edit Event</h1>
            <p className="text-lg text-gray-600">Update your event details and settings</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
        {error && (
          <div className="p-6 pb-0">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-600">Tell us about your event</p>
                </div>
              </div>

              {/* Event Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Tech Summit 2025, Annual Conference"
                />
                {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Description
                </label>
                <p className="text-xs text-gray-500 mb-2">Optional: Provide context about your event</p>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Brief description of your event, its purpose, and what attendees can expect..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Section 2: Dates & Deadlines */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Dates & Deadlines</h2>
                  <p className="text-sm text-gray-600">When is your event and submission deadline?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Deadline */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-gray-900 mb-2">
                    Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Last date for speakers to submit assets</p>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      {...register('deadline')}
                      type="datetime-local"
                      id="deadline"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  {errors.deadline && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.deadline.message}</p>
                  )}
                </div>

                {/* Event Date */}
                <div>
                  <label
                    htmlFor="eventDate"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Event Date
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Optional: When does your event take place?</p>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      {...register('eventDate')}
                      type="datetime-local"
                      id="eventDate"
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  {errors.eventDate && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.eventDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Branding */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Branding</h2>
                  <p className="text-sm text-gray-600">Customize the look of your speaker portal</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Brand Color */}
                <div>
                  <label
                    htmlFor="brandColor"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Brand Color
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Choose a color that matches your brand</p>
                  <div className="flex gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setValue('brandColor', e.target.value)}
                        className="h-12 w-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <Palette className="absolute -top-1 -right-1 w-4 h-4 text-purple-600 bg-white rounded-full" />
                    </div>
                    <input
                      {...register('brandColor')}
                      type="text"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                      placeholder="#3B82F6"
                    />
                  </div>
                  {errors.brandColor && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.brandColor.message}</p>
                  )}
                </div>

                {/* Event Logo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Logo
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Optional: Upload your event or company logo</p>
                  {event.logoUrl && !logoFile && (
                    <div className="mb-3">
                      <div className="relative w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={getFileUrl(event.logoUrl)!}
                          alt="Current logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">Current logo</p>
                    </div>
                  )}
                  <ImageUpload
                    label={event.logoUrl ? "Update Logo" : "Upload Logo"}
                    onFileSelect={setLogoFile}
                    maxSizeMB={10}
                  />
                  {logoFile && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {logoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Reminders & Instructions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reminders & Instructions</h2>
                  <p className="text-sm text-gray-600">Set up automated reminders and provide speaker guidance</p>
                </div>
              </div>

              {/* Enable Reminders */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    {...register('enableAutoReminders')}
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                      Send automatic reminders to speakers
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Automatically remind speakers to submit their assets before the deadline
                    </p>
                  </div>
                </label>

                {/* Reminder Days - Conditional */}
                {watch('enableAutoReminders') && (
                  <div className="mt-4 pl-8">
                    <label
                      htmlFor="reminderDaysBefore"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Days before deadline to send reminder
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        {...register('reminderDaysBefore', { valueAsNumber: true })}
                        type="number"
                        id="reminderDaysBefore"
                        min="1"
                        max="30"
                        className="w-24 px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-center font-semibold"
                      />
                      <span className="text-sm text-gray-700">days before deadline</span>
                    </div>
                    {errors.reminderDaysBefore && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.reminderDaysBefore.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Instructions */}
              <div>
                <label
                  htmlFor="customInstructions"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Custom Instructions for Speakers
                </label>
                <p className="text-xs text-gray-500 mb-2">Optional: Provide specific guidelines or requirements for asset submissions</p>
                <textarea
                  {...register('customInstructions')}
                  id="customInstructions"
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="Example: Please submit high-resolution images (at least 300 DPI). Ensure your headshot has a professional background. Presentations should be in PDF format..."
                />
                {errors.customInstructions && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.customInstructions.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-100">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all text-base py-3 px-8 font-semibold"
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/events/${id}`)}
                className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 py-3 px-8 font-medium"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
    </DashboardLayout>
  );
}
