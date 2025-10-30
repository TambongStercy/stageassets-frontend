import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Archive,
  Settings,
  FileText,
  Trash2,
  Bell,
  Building2,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Download,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DashboardLayout } from '../../components/DashboardLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { InviteSpeakerModal } from '../../components/InviteSpeakerModal';
import { SpeakerTable } from '../../components/SpeakerTable';
import { AssetRequirementsManager } from '../../components/AssetRequirementsManager';
import { SubmissionsGallery } from '../../components/SubmissionsGallery';
import { RemindersManager } from '../../components/RemindersManager';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { SubscriptionGateModal } from '../../components/SubscriptionGateModal';
import { SetupProgressChecklist } from '../../components/SetupProgressChecklist';
import { StatsCardSkeleton, TableRowSkeleton } from '../../components/Skeleton';
import { Button, Card, CardContent, Badge } from '../../components/ui';
import { useSubscriptionGate } from '../../hooks/useSubscriptionGate';
import { eventsService } from '../../services/events.service';
import { speakersService } from '../../services/speakers.service';
import { submissionsService } from '../../services/submissions.service';
import { getFileUrl } from '../../lib/file-url';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eventId = parseInt(id!, 10);

  const [activeTab, setActiveTab] = useState<'speakers' | 'assets' | 'reminders' | 'settings'>('speakers');
  const [assetsSubTab, setAssetsSubTab] = useState<'submissions' | 'requirements'>('submissions');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Ref for scrolling to tabs section
  const tabsSectionRef = useRef<HTMLDivElement>(null);

  // Helper function to scroll to tabs section smoothly
  const scrollToTabs = () => {
    setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Subscription gate hook
  const { isGateOpen, gateFeature, gateMessage, checkSpeakerLimit, closeGate } = useSubscriptionGate();

  // Fetch event
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsService.getEvent(eventId),
  });

  // Fetch speakers
  const { data: speakers, isLoading: speakersLoading } = useQuery({
    queryKey: ['speakers', eventId],
    queryFn: () => speakersService.getSpeakers(eventId),
  });

  // Fetch asset requirements (for progress checklist)
  const { data: assetRequirements } = useQuery({
    queryKey: ['asset-requirements', eventId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/events/${eventId}/asset-requirements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return response.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: () => eventsService.getEventStats(eventId),
  });

  // Fetch submissions for download functionality
  const { data: submissions } = useQuery({
    queryKey: ['submissions', eventId],
    queryFn: () => submissionsService.getEventSubmissions(eventId),
  });

  // Download all assets handler
  const handleDownloadAllAssets = async () => {
    if (!event || !stats || stats.assets.received === 0) {
      return;
    }

    try {
      await eventsService.downloadEventAssets(eventId, event.name);
    } catch (error) {
      console.error('Failed to download assets:', error);
      alert('Failed to download assets. Please try again.');
    }
  };

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => eventsService.archiveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => eventsService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard');
    },
  });

  if (eventLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const deadlineDate = new Date(event.deadline);
  const daysUntilDeadline = differenceInDays(deadlineDate, new Date());
  const isOverdue = daysUntilDeadline < 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
              {/* Event Logo */}
              {event.logoUrl ? (
                <img
                  src={getFileUrl(event.logoUrl)!}
                  alt={`${event.name} logo`}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{event.name}</h1>
                  {event.isArchived && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      Archived
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                )}

                {/* Quick Info */}
                <div className="flex items-center gap-2 md:gap-4 text-sm flex-wrap">
                  {event.eventDate && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium flex-shrink-0 ${
                      isOverdue
                        ? 'bg-red-50 text-red-600'
                        : daysUntilDeadline <= 3
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-xs whitespace-nowrap">
                      {isOverdue
                        ? 'Deadline passed'
                        : `${daysUntilDeadline}d until deadline`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Button
                onClick={handleDownloadAllAssets}
                disabled={!stats || stats.assets.received === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Download All</span>
                {stats && stats.assets.received > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs flex-shrink-0">
                    {stats.assets.received}
                  </span>
                )}
              </Button>
              {!event.isArchived && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    variant="secondary"
                    className="shadow-sm flex-1 sm:flex-initial"
                  >
                    <Edit3 className="w-4 h-4 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsArchiveModalOpen(true)}
                    disabled={archiveMutation.isPending}
                    className="shadow-sm flex-1 sm:flex-initial"
                  >
                    <Archive className="w-4 h-4 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Archive</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Progress Checklist */}
      {!event.isArchived && (
        <div className="mb-6">
          <SetupProgressChecklist
            hasAssets={Array.isArray(assetRequirements) && assetRequirements.length > 0}
            hasSpeakers={Array.isArray(speakers) && speakers.length > 0}
            onInviteSpeakers={() => {
              setIsInviteModalOpen(true);
              setActiveTab('speakers');
              scrollToTabs();
            }}
            onSetupAssets={() => {
              setActiveTab('assets');
              scrollToTabs();
            }}
            onViewPortal={() => {
              if (speakers && speakers.length > 0) {
                window.open(`/portal/speakers/${speakers[0].accessToken}`, '_blank');
              }
            }}
            hideWhenComplete={true}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        {/* Speakers Stats */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Speakers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.speakers.total || 0}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-emerald-600 font-medium">{stats?.speakers.completed || 0} done</span>
                  <span className="text-amber-600 font-medium">{stats?.speakers.partial || 0} partial</span>
                  <span className="text-gray-500">{stats?.speakers.pending || 0} pending</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Types Stats */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asset Types</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.assetTypes.total || 0}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-red-600 font-medium">{stats?.assetTypes.required || 0} required</span>
                  <span className="text-gray-500">{stats?.assetTypes.optional || 0} optional</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Progress */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Assets Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.assets.received || 0}/{stats?.assets.expected || 0}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{stats?.assets.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                      style={{ width: `${stats?.assets.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Assets */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Required Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.requiredAssets.received || 0}/{stats?.requiredAssets.expected || 0}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{stats?.requiredAssets.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                      style={{ width: `${stats?.requiredAssets.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div ref={tabsSectionRef} className="bg-white border border-gray-200 rounded-xl mb-6">
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'speakers'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>Speakers</span>
            {stats && stats.speakers.total > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                activeTab === 'speakers'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {stats.speakers.total}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'assets'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Assets</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'reminders'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span>Reminders</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>Settings</span>
          </button>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'speakers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Speakers</h2>
                <Button
                  onClick={() => {
                    const currentSpeakerCount = speakers?.length || 0;
                    if (checkSpeakerLimit(currentSpeakerCount)) {
                      setIsInviteModalOpen(true);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Speaker
                </Button>
              </div>

              {speakersLoading ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Speaker
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Deadline
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Progress
                        </th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <TableRowSkeleton columns={5} />
                      <TableRowSkeleton columns={5} />
                      <TableRowSkeleton columns={5} />
                    </tbody>
                  </table>
                </div>
              ) : (
                <SpeakerTable speakers={speakers || []} eventId={eventId} />
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div>
              {/* Assets Sub-Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setAssetsSubTab('submissions')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    assetsSubTab === 'submissions'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Submitted Assets
                </button>
                <button
                  onClick={() => setAssetsSubTab('requirements')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    assetsSubTab === 'requirements'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Requirements Setup
                </button>
              </div>

              {/* Assets Sub-Tab Content */}
              {assetsSubTab === 'submissions' && <SubmissionsGallery eventId={eventId} />}
              {assetsSubTab === 'requirements' && <AssetRequirementsManager eventId={eventId} />}
            </div>
          )}

          {activeTab === 'reminders' && <RemindersManager eventId={eventId} />}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Auto Reminders</div>
                    <div className="text-sm text-gray-600">
                      {event.enableAutoReminders ? 'Enabled' : 'Disabled'}
                      {event.enableAutoReminders &&
                        ` - ${event.reminderDaysBefore} days before deadline`}
                    </div>
                  </div>
                  {event.customInstructions && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Custom Instructions
                      </div>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                        {event.customInstructions}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                <p className="text-gray-700 mb-4">
                  Deleting this event will permanently remove all associated speakers, submissions,
                  and data. This action cannot be undone.
                </p>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteSpeakerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        eventId={eventId}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={() => {
          archiveMutation.mutate();
          setIsArchiveModalOpen(false);
        }}
        title="Archive Event?"
        message={`Are you sure you want to archive "${event?.name}"? Archived events are hidden from your active events list but can be restored later.`}
        confirmText="Archive Event"
        isLoading={archiveMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate();
          setIsDeleteModalOpen(false);
        }}
        title="Delete Event?"
        message={`Are you sure you want to delete "${event?.name}"? This will permanently delete all speakers, submissions, and data associated with this event. This action cannot be undone.`}
        confirmText="Delete Event"
        isDangerous
        isLoading={deleteMutation.isPending}
      />

      {/* Subscription Gate Modal */}
      <SubscriptionGateModal
        isOpen={isGateOpen}
        onClose={closeGate}
        feature={gateFeature}
        message={gateMessage}
      />
    </DashboardLayout>
  );
}
