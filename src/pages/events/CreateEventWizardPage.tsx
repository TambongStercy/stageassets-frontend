import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Palette,
  Image as ImageIcon,
  Bell,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui';
import { ImageUpload } from '../../components/ImageUpload';
import { PlanLimitError } from '../../components/PlanLimitError';
import { WizardSteps } from '../../components/WizardSteps';
import { AssetRequirementPresets, ASSET_PRESETS } from '../../components/AssetRequirementPresets';
import { CustomRequirementModal } from '../../components/CustomRequirementModal';
import { ErrorModal } from '../../components/ErrorModal';
import { eventsService } from '../../services/events.service';
import { eventSchema, type EventFormData } from '../../schemas/event.schema';
import type { CreateAssetRequirementData } from '../../types/asset-requirements.types';

const WIZARD_STEPS = [
  { number: 1, title: 'Event Details', description: 'Basic information' },
  { number: 2, title: 'Asset Requirements', description: 'What speakers submit' },
  { number: 3, title: 'Review', description: 'Confirm and create' },
];

export default function CreateEventWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPlanLimitError, setIsPlanLimitError] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState<CreateAssetRequirementData[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [errorModalInfo, setErrorModalInfo] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
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
    mutationFn: async ({ data, logo }: { data: EventFormData; logo: File | null }) => {
      // Transform datetime-local strings to ISO 8601 format
      const transformedData = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : data.deadline,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
      };

      // Create the event first
      const event = logo
        ? await eventsService.createEventWithLogo(transformedData, logo)
        : await eventsService.createEvent(transformedData);

      // Then create asset requirements if any were selected
      const assetRequirements = getSelectedRequirements();
      if (assetRequirements.length > 0) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('access_token');

        // Create each requirement
        await Promise.all(
          assetRequirements.map((req, index) =>
            fetch(`${apiUrl}/events/${event.id}/asset-requirements`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...req, sortOrder: index }),
            })
          )
        );
      }

      return event;
    },
    onSuccess: (data) => {
      navigate(`/events/${data.id}`);
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 'Failed to create event';
      setError(errorMessage);
      setIsPlanLimitError(err.response?.status === 403);
    },
  });

  const getSelectedRequirements = (): CreateAssetRequirementData[] => {
    const requirements: CreateAssetRequirementData[] = [];

    // Add requirements from selected presets
    selectedPresets.forEach((presetId) => {
      const preset = ASSET_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        requirements.push(...preset.requirements);
      }
    });

    // Add custom requirements
    requirements.push(...customRequirements);

    return requirements;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate step 1 fields before proceeding
      const isValid = await trigger(['name', 'deadline']);
      if (!isValid) return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTogglePreset = (presetId: string) => {
    setSelectedPresets((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
  };

  const onSubmit = (data: EventFormData) => {
    setError(null);
    setIsPlanLimitError(false);
    createMutation.mutate({ data, logo: logoFile });
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const renderStep1 = () => (
    <div className="space-y-8">
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
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
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
            <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-900 mb-2">
              Event Date
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Optional: When does your event take place?
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                {...register('eventDate')}
                type="datetime-local"
                id="eventDate"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
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
            <label htmlFor="brandColor" className="block text-sm font-semibold text-gray-900 mb-2">
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
          </div>

          {/* Event Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Event Logo</label>
            <p className="text-xs text-gray-500 mb-2">
              Optional: Upload your event or company logo
            </p>
            <ImageUpload label="Upload Logo" onFileSelect={setLogoFile} maxSizeMB={10} />
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
            <p className="text-sm text-gray-600">
              Set up automated reminders and provide speaker guidance
            </p>
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
          <p className="text-xs text-gray-500 mb-2">
            Optional: Provide specific guidelines or requirements for asset submissions
          </p>
          <textarea
            {...register('customInstructions')}
            id="customInstructions"
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder-gray-400 resize-none"
            placeholder="Example: Please submit high-resolution images (at least 300 DPI). Ensure your headshot has a professional background. Presentations should be in PDF format..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Asset Requirements</h2>
          <p className="text-sm text-gray-600">
            Define what assets speakers need to submit (optional - can be added later)
          </p>
        </div>
      </div>

      <AssetRequirementPresets
        selectedPresets={selectedPresets}
        onTogglePreset={handleTogglePreset}
        onAddCustom={() => setIsCustomModalOpen(true)}
      />

      {/* Display custom requirements */}
      {customRequirements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Custom Requirements ({customRequirements.length})</h4>
          {customRequirements.map((req, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-gray-900">{req.label}</h5>
                  {req.isRequired && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Required
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {req.assetType}
                  </span>
                </div>
                {req.description && <p className="text-sm text-gray-600">{req.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomRequirements((prev) => prev.filter((_, i) => i !== index));
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-100 rounded transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> You can skip this step and add asset requirements later from the
          event details page. However, adding them now will help speakers know what to prepare.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const formData = watch();
    const selectedRequirements = getSelectedRequirements();

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review & Create</h2>
            <p className="text-sm text-gray-600">Confirm your event details before creating</p>
          </div>
        </div>

        {/* Event Details Summary */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Event Name</p>
              <p className="text-sm font-medium text-gray-900">{formData.name || '—'}</p>
            </div>

            {formData.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700">{formData.description}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Submission Deadline
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formData.deadline
                  ? new Date(formData.deadline).toLocaleString()
                  : '—'}
              </p>
            </div>

            {formData.eventDate && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Event Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(formData.eventDate).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Brand Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: formData.brandColor }}
                />
                <p className="text-sm font-mono text-gray-700">{formData.brandColor}</p>
              </div>
            </div>

            {logoFile && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Event Logo</p>
                <p className="text-sm text-gray-700">{logoFile.name}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Auto Reminders
              </p>
              <p className="text-sm text-gray-700">
                {formData.enableAutoReminders
                  ? `Enabled (${formData.reminderDaysBefore} days before deadline)`
                  : 'Disabled'}
              </p>
            </div>

            {formData.customInstructions && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Custom Instructions
                </p>
                <p className="text-sm text-gray-700">{formData.customInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Asset Requirements Summary */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Requirements</h3>

          {selectedRequirements.length > 0 ? (
            <div className="space-y-3">
              {selectedRequirements.map((req, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{req.label}</p>
                      {req.isRequired && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          Required
                        </span>
                      )}
                    </div>
                    {req.description && (
                      <p className="text-xs text-gray-600 mt-1">{req.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {req.acceptedFileTypes?.join(', ')} • Max {req.maxFileSizeMb}MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No asset requirements added. You can add them later from the event details page.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create New Event</h1>
            <p className="text-lg text-gray-600">
              Follow these steps to set up your event and start collecting assets
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Steps */}
      <WizardSteps steps={WIZARD_STEPS} currentStep={currentStep} />

      {/* Form */}
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
        {error && isPlanLimitError && (
          <div className="p-6 pb-0">
            <PlanLimitError message={error} onUpgrade={handleUpgrade} />
          </div>
        )}
        {error && !isPlanLimitError && (
          <div className="p-6 pb-0">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {/* Render current step */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t-2 border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={currentStep === 1 ? () => navigate('/dashboard') : handlePreviousStep}
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 py-3 px-6 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all py-3 px-6 font-semibold"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all py-3 px-8 font-semibold"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Event...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Custom Requirement Modal */}
      <CustomRequirementModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAdd={(requirement) => {
          setCustomRequirements((prev) => [...prev, requirement]);
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModalInfo.isOpen}
        onClose={() => setErrorModalInfo({ isOpen: false, title: '', message: '' })}
        title={errorModalInfo.title}
        message={errorModalInfo.message}
        type="info"
      />
    </DashboardLayout>
  );
}
