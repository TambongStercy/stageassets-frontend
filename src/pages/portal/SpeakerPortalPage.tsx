import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Upload, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { FileUpload } from '../../components/FileUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button, Container, Card, CardContent } from '../../components/ui';
import { portalService } from '../../services/portal.service';
import { submissionsService } from '../../services/submissions.service';

export default function SpeakerPortalPage() {
  const { accessToken } = useParams<{ accessToken: string }>();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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
    queryKey: ['portal-event', speaker?.eventId],
    queryFn: () => portalService.getEventBySlug(''), // We'll need the slug from speaker/event
    enabled: false, // Disable for now, would need event slug
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
      fileName: string;
      fileUrl: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      width?: number;
      height?: number;
    }) =>
      submissionsService.createSubmission(speaker!.id, {
        assetRequirementId: 1, // Would come from event requirements
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-semibold text-gray-900">StageAsset</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <Container size="narrow">
          {/* Event Info */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Event Assets</h1>
            <p className="text-gray-600">
              Please upload your materials for the event
            </p>
          </div>

          {/* Status Badge */}
          {speaker.submissionStatus === 'complete' && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Submission Complete!</p>
                <p className="text-sm text-emerald-700">
                  Thank you for submitting your assets.
                </p>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Profile</h3>
                    <p className="text-sm text-gray-600">{speaker.email}</p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <Button variant="secondary" onClick={handleProfileEdit} size="sm">
                    Edit
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
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
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

          {/* File Upload */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Upload Assets</h3>
              </div>
              <FileUpload
                onUploadComplete={(fileData) => createSubmissionMutation.mutate(fileData)}
              />
            </CardContent>
          </Card>

          {/* Submitted Files */}
          {submissions && submissions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Submitted Files</h3>
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {submission.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Version {submission.version} •{' '}
                            {format(new Date(submission.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </div>
  );
}
