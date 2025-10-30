import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, User, CheckCircle, AlertCircle, ExternalLink, Download, Clock, ChevronDown, ChevronUp, History, RefreshCw, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { FileUpload } from '../../components/FileUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SessionTimeoutWarning } from '../../components/SessionTimeoutWarning';
import { Button, Container, Card, CardContent } from '../../components/ui';
import { portalService } from '../../services/portal.service';
import { submissionsService } from '../../services/submissions.service';
import { assetRequirementsService } from '../../services/asset-requirements.service';
import { eventsService } from '../../services/events.service';
import { getFileUrl } from '../../lib/file-url';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

export default function SpeakerPortalPage() {
  const { accessToken } = useParams<{ accessToken: string }>();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [uploadingNewVersion, setUploadingNewVersion] = useState<number | null>(null);
  const [viewingVersionHistory, setViewingVersionHistory] = useState<number | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    bio: '',
  });

  // Fetch speaker data
  const { data: speaker, isLoading: speakerLoading } = useQuery({
    queryKey: ['speaker-portal', accessToken],
    queryFn: () => portalService.getSpeakerByToken(accessToken!),
    enabled: !!accessToken,
  });

  // Fetch event data
  const { data: event } = useQuery({
    queryKey: ['event-public', speaker?.eventId],
    queryFn: () => eventsService.getEvent(speaker!.eventId),
    enabled: !!speaker?.eventId,
  });

  // Fetch asset requirements for the event
  const { data: assetRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ['asset-requirements-public', speaker?.eventId],
    queryFn: () => assetRequirementsService.getPublicAssetRequirements(speaker!.eventId),
    enabled: !!speaker?.eventId,
  });

  // Fetch submissions
  const { data: submissions } = useQuery({
    queryKey: ['submissions', speaker?.id],
    queryFn: () => submissionsService.getSubmissions(speaker!.id),
    enabled: !!speaker,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profileData) =>
      portalService.updateSpeakerProfile(accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speaker-portal', accessToken] });
      setIsEditingProfile(false);
    },
  });

  // Create submission mutation
  const createSubmissionMutation = useMutation({
    mutationFn: (data: {
      assetRequirementId: number;
      fileName: string;
      fileUrl: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      width?: number;
      height?: number;
    }) =>
      submissionsService.createSubmission(speaker!.id, {
        assetRequirementId: data.assetRequirementId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        storagePath: data.filePath,
        imageWidth: data.width,
        imageHeight: data.height,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', speaker?.id] });
      setUploadingNewVersion(null); // Close upload form after success
    },
  });

  // Get version history - single query for the currently viewing requirement
  const { data: versionHistory, isLoading: versionHistoryLoading } = useQuery({
    queryKey: ['version-history', speaker?.id, viewingVersionHistory],
    queryFn: () => {
      if (!speaker?.id || !viewingVersionHistory) {
        return Promise.resolve([]);
      }
      return submissionsService.getVersionHistory(speaker.id, viewingVersionHistory);
    },
    enabled: !!speaker && !!viewingVersionHistory,
  });

  // Helper to check if a requirement has been fulfilled
  const isRequirementFulfilled = (requirementId: number) => {
    return submissions?.some(
      (sub) => sub.assetRequirementId === requirementId && sub.isLatest
    );
  };

  // Helper to get submission for a requirement
  const getSubmissionForRequirement = (requirementId: number) => {
    return submissions?.find(
      (sub) => sub.assetRequirementId === requirementId && sub.isLatest
    );
  };

  // Session timeout warning
  const {
    showWarning: showSessionWarning,
    formatTimeRemaining,
    extendSession,
    isExtending,
    dismissWarning,
  } = useSessionTimeout({
    warningTime: 25 * 60 * 1000, // 25 minutes
    expiryTime: 30 * 60 * 1000, // 30 minutes
    onExpire: () => {
      window.location.reload();
    },
    onExtend: async () => {
      // Refresh the speaker data to extend session
      await queryClient.invalidateQueries({ queryKey: ['speaker-portal', accessToken] });
    },
  });

  if (speakerLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid access link</h2>
          <p className="text-gray-600">This speaker portal link is not valid.</p>
        </div>
      </div>
    );
  }

  const handleProfileEdit = () => {
    setProfileData({
      firstName: speaker.firstName || '',
      lastName: speaker.lastName || '',
      company: speaker.company || '',
      jobTitle: speaker.jobTitle || '',
      bio: speaker.bio || '',
    });
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  // Calculate completion progress
  const totalRequirements = assetRequirements?.length || 0;
  const completedRequirements = assetRequirements?.filter(req =>
    isRequirementFulfilled(req.id)
  ).length || 0;
  const progressPercent = totalRequirements > 0
    ? Math.round((completedRequirements / totalRequirements) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: event?.brandColor
                    ? `linear-gradient(to bottom right, ${event.brandColor}, ${event.brandColor}dd)`
                    : 'linear-gradient(to bottom right, #10b981, #059669)'
                }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">StageAsset</span>
                <p className="text-xs text-gray-500">Speaker Portal</p>
              </div>
            </div>
            {totalRequirements > 0 && (
              <div className="hidden sm:flex items-center gap-2" role="status" aria-label="Upload progress">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Progress</p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: event?.brandColor || '#059669' }}
                    aria-label={`${completedRequirements} of ${totalRequirements} assets completed`}
                  >
                    {completedRequirements}/{totalRequirements}
                  </p>
                </div>
                <div
                  className="w-24 bg-gray-200 rounded-full h-2"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${progressPercent}% complete`}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: event?.brandColor
                        ? `linear-gradient(to right, ${event.brandColor}, ${event.brandColor}dd)`
                        : 'linear-gradient(to right, #10b981, #059669)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12">
        <Container size="narrow">
          {/* Event Info Banner */}
          {event && (
            <Card className="mb-8 overflow-hidden shadow-lg border-2" style={{ borderColor: event.brandColor || '#10b981' }}>
              <div className="p-6" style={{
                background: `linear-gradient(to right, ${event.brandColor || '#10b981'}15, ${event.brandColor || '#3b82f6'}10)`
              }}>
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Event Logo */}
                  {event.logoUrl ? (
                    <img
                      src={getFileUrl(event.logoUrl)!}
                      alt={event.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-2 border-white shadow-md mx-auto sm:mx-0"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl flex items-center justify-center border-2 border-white shadow-md mx-auto sm:mx-0"
                      style={{
                        background: `linear-gradient(to bottom right, ${event.brandColor || '#10b981'}, ${event.brandColor || '#059669'}dd)`
                      }}
                    >
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{event.name}</h2>
                    {event.description && (
                      <div className="mb-4">
                        <p className={`text-gray-700 transition-all duration-300 ${
                          isDescriptionExpanded ? '' : 'line-clamp-2'
                        }`}>
                          {event.description}
                        </p>
                        {event.description.length > 150 && (
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="mt-1 text-sm font-medium flex items-center gap-1 hover:underline mx-auto sm:mx-0"
                            style={{ color: event.brandColor || '#10b981' }}
                          >
                            {isDescriptionExpanded ? (
                              <>
                                Show less <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Event Metadata */}
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      {event.eventDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${event.brandColor || '#10b981'}20`,
                            }}
                          >
                            <Clock className="w-4 h-4" style={{ color: event.brandColor || '#059669' }} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Event Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {format(new Date(event.eventDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Submission Deadline</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(event.deadline), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Days remaining */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          differenceInDays(new Date(event.deadline), new Date()) <= 3
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}>
                          <Clock className={`w-4 h-4 ${
                            differenceInDays(new Date(event.deadline), new Date()) <= 3
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Time Remaining</p>
                          <p className={`text-sm font-semibold ${
                            differenceInDays(new Date(event.deadline), new Date()) <= 3
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}>
                            {differenceInDays(new Date(event.deadline), new Date())} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Instructions */}
                {event.customInstructions && (
                  <div className="mt-6 p-4 bg-white rounded-lg border-2" style={{ borderColor: `${event.brandColor || '#10b981'}40` }}>
                    <div className="flex items-start gap-2">
                      <FileText
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: event.brandColor || '#059669' }}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Special Instructions</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.customInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Reassurance Message */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Your Access Link is Secure</h4>
                <p className="text-sm text-gray-700">
                  This link will remain active until the submission deadline{event && ` (${format(new Date(event.deadline), 'MMM d, yyyy')})`}.
                  You can safely bookmark this page and return anytime to upload or update your assets.
                  Your progress is automatically saved.
                </p>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          {speaker.submissionStatus === 'complete' ? (
            <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900 text-lg">All Done! 🎉</p>
                <p className="text-sm text-emerald-700">
                  Thank you for submitting all your assets. We'll be in touch soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-3 mb-3">
                <Upload className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Upload Progress</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {completedRequirements} of {totalRequirements} assets submitted
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Profile Card */}
          <Card className="mb-8 shadow-lg border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center border-2 border-emerald-200 shadow-sm">
                    <User className="w-7 h-7 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Your Profile</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                      {speaker.email}
                    </p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button variant="secondary" onClick={handleProfileEdit} size="sm" className="shadow-sm">
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) =>
                          setProfileData({ ...profileData, company: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) =>
                          setProfileData({ ...profileData, jobTitle: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleProfileSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {speaker.firstName && (
                    <div>
                      <span className="text-gray-500">Name: </span>
                      <span className="text-gray-900">
                        {speaker.firstName} {speaker.lastName}
                      </span>
                    </div>
                  )}
                  {speaker.company && (
                    <div>
                      <span className="text-gray-500">Company: </span>
                      <span className="text-gray-900">{speaker.company}</span>
                    </div>
                  )}
                  {speaker.jobTitle && (
                    <div>
                      <span className="text-gray-500">Title: </span>
                      <span className="text-gray-900">{speaker.jobTitle}</span>
                    </div>
                  )}
                  {speaker.bio && (
                    <div>
                      <span className="text-gray-500">Bio: </span>
                      <span className="text-gray-900">{speaker.bio}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asset Requirements */}
          {requirementsLoading ? (
            <Card className="mb-8 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-gray-600 text-center py-8">Loading requirements...</p>
              </CardContent>
            </Card>
          ) : assetRequirements && assetRequirements.length > 0 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Required Assets</h2>
                <p className="text-sm text-gray-600">Upload each asset according to the specifications below</p>
              </div>
              <div className="space-y-6 mb-8">
                {assetRequirements.map((requirement, index) => {
                  const submission = getSubmissionForRequirement(requirement.id);
                  const isFulfilled = isRequirementFulfilled(requirement.id);

                  return (
                    <Card key={requirement.id} className={`shadow-lg transition-all ${
                      isFulfilled ? 'border-2 border-emerald-300 bg-emerald-50/30' : 'border-gray-300'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                isFulfilled
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {index + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 text-lg">{requirement.label}</h3>
                              {requirement.isRequired && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full" role="status" aria-label="This asset is required">
                                  Required
                                </span>
                              )}
                              {isFulfilled && (
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full" role="status" aria-label="Asset completed">
                                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Completed</span>
                                </div>
                              )}
                            </div>
                          {requirement.description && (
                            <p className="text-sm text-gray-600 mb-3">{requirement.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                            {requirement.acceptedFileTypes && (
                              <span>Formats: {requirement.acceptedFileTypes.join(', ')}</span>
                            )}
                            {requirement.maxFileSizeMb && (
                              <span>• Max size: {requirement.maxFileSizeMb}MB</span>
                            )}
                            {requirement.minImageWidth && requirement.minImageHeight && (
                              <span>
                                • Min dimensions: {requirement.minImageWidth}x
                                {requirement.minImageHeight}px
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isFulfilled && submission ? (
                        <div className="space-y-3">
                          {/* Current Version Display */}
                          {uploadingNewVersion !== requirement.id && (
                            <>
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-emerald-900">
                                          {submission.fileName}
                                        </p>
                                        {submission.version > 1 && (
                                          <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
                                            v{submission.version}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-emerald-700">
                                        Uploaded {format(new Date(submission.uploadedAt || submission.createdAt), 'MMM d, yyyy h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-emerald-200">
                                  <button
                                    onClick={() => setUploadingNewVersion(requirement.id)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 bg-white border border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors font-medium"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    Upload New Version
                                  </button>
                                  {submission.version > 1 && (
                                    <button
                                      onClick={() => setViewingVersionHistory(
                                        viewingVersionHistory === requirement.id ? null : requirement.id
                                      )}
                                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-purple-700 bg-white border border-purple-300 rounded-md hover:bg-purple-50 transition-colors font-medium min-h-[44px]"
                                      aria-expanded={viewingVersionHistory === requirement.id}
                                      aria-controls={`version-history-${requirement.id}`}
                                      aria-label={viewingVersionHistory === requirement.id ? 'Hide version history' : 'View version history'}
                                    >
                                      <History className="w-4 h-4" aria-hidden="true" />
                                      {viewingVersionHistory === requirement.id ? 'Hide History' : 'View History'}
                                    </button>
                                  )}
                                  <a
                                    href={getFileUrl(submission.fileUrl)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    View File
                                  </a>
                                  <a
                                    href={getFileUrl(submission.fileUrl)!}
                                    download={submission.fileName}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </a>
                                </div>
                              </div>

                              {/* Image Preview for image files */}
                              {submission.fileUrl &&
                                submission.mimeType?.startsWith('image/') &&
                                submission.imageWidth &&
                                submission.imageHeight && (
                                  <div className="rounded-md overflow-hidden border border-emerald-200">
                                    <img
                                      src={getFileUrl(submission.fileUrl)!}
                                      alt={submission.fileName}
                                      className="w-full h-auto max-h-64 object-contain bg-gray-50"
                                    />
                                  </div>
                                )}

                              {/* Version History */}
                              {viewingVersionHistory === requirement.id && (
                                versionHistoryLoading ? (
                                  <div
                                    id={`version-history-${requirement.id}`}
                                    className="p-4 bg-purple-50 border border-purple-200 rounded-md text-center"
                                    role="status"
                                    aria-label="Loading version history"
                                  >
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                                  </div>
                                ) : versionHistory && versionHistory.length > 0 ? (
                                  <div
                                    id={`version-history-${requirement.id}`}
                                    className="p-4 bg-purple-50 border border-purple-200 rounded-md"
                                    role="region"
                                    aria-label="Version history"
                                  >
                                    <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                      <History className="w-4 h-4" aria-hidden="true" />
                                      Version History ({versionHistory.length} {versionHistory.length === 1 ? 'version' : 'versions'})
                                    </h4>
                                    <div className="space-y-2">
                                      {versionHistory.map((version) => (
                                        <div
                                          key={version.id}
                                          className={`p-3 rounded-md border ${
                                            version.isLatest
                                              ? 'bg-white border-purple-300'
                                              : 'bg-purple-100/50 border-purple-200'
                                          }`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded-full">
                                                  v{version.version}
                                                </span>
                                                {version.isLatest && (
                                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    Current
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-sm font-medium text-gray-900">{version.fileName}</p>
                                              <p className="text-xs text-gray-600 mt-1">
                                                {format(new Date(version.uploadedAt || version.createdAt), 'MMM d, yyyy h:mm a')}
                                              </p>
                                            </div>
                                            {!version.isLatest && (
                                              <a
                                                href={getFileUrl(version.fileUrl)!}
                                                download={version.fileName}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-700 bg-white border border-purple-300 rounded hover:bg-purple-50 transition-colors"
                                              >
                                                <Download className="w-3 h-3" />
                                                Download
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null
                              )}
                            </>
                          )}

                          {/* Upload New Version Form */}
                          {uploadingNewVersion === requirement.id && (
                            <div className="space-y-3">
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Upload New Version</h4>
                                    <p className="text-xs text-blue-700">
                                      This will create version {(submission.version || 1) + 1}. Previous versions will be saved in history.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setUploadingNewVersion(null)}
                                    className="text-blue-700 hover:text-blue-900"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <FileUpload
                                  onUploadComplete={(fileData) =>
                                    createSubmissionMutation.mutate({
                                      ...fileData,
                                      assetRequirementId: requirement.id,
                                    })
                                  }
                                  accept={requirement.acceptedFileTypes?.join(',')}
                                  maxSizeMB={requirement.maxFileSizeMb || 10}
                                  minImageWidth={requirement.minImageWidth}
                                  minImageHeight={requirement.minImageHeight}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <FileUpload
                          onUploadComplete={(fileData) =>
                            createSubmissionMutation.mutate({
                              ...fileData,
                              assetRequirementId: requirement.id,
                            })
                          }
                          accept={requirement.acceptedFileTypes?.join(',')}
                          maxSizeMB={requirement.maxFileSizeMb || 10}
                          minImageWidth={requirement.minImageWidth}
                          minImageHeight={requirement.minImageHeight}
                        />
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card className="mb-8 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Requirements Yet</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    No asset requirements have been configured for this event yet. Please check back later or contact the event organizer.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>

      {/* Session Timeout Warning */}
      {showSessionWarning && (
        <SessionTimeoutWarning
          timeRemaining={formatTimeRemaining()}
          onExtend={extendSession}
          onDismiss={dismissWarning}
          isExtending={isExtending}
        />
      )}
    </div>
  );
}
