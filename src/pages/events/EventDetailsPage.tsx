import { useState } from 'react';
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
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { DashboardLayout } from '../../components/DashboardLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { InviteSpeakerModal } from '../../components/InviteSpeakerModal';
import { EditEventModal } from '../../components/EditEventModal';
import { SpeakerTable } from '../../components/SpeakerTable';
import { AssetRequirementsManager } from '../../components/AssetRequirementsManager';
import { RemindersManager } from '../../components/RemindersManager';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { SubscriptionGateModal } from '../../components/SubscriptionGateModal';
import { StatsCardSkeleton, TableRowSkeleton } from '../../components/Skeleton';
import { Button, Card, CardContent, Badge } from '../../components/ui';
import { useSubscriptionGate } from '../../hooks/useSubscriptionGate';
import { eventsService } from '../../services/events.service';
import { speakersService } from '../../services/speakers.service';
import { getFileUrl } from '../../lib/file-url';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eventId = parseInt(id!, 10);

  const [activeTab, setActiveTab] = useState<'speakers' | 'assets' | 'reminders' | 'settings'>('speakers');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

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

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: () => eventsService.getEventStats(eventId),
  });

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

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Event Logo */}
              {event.logoUrl ? (
                <img
                  src={getFileUrl(event.logoUrl)!}
                  alt={`${event.name} logo`}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                  {event.isArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                )}

                {/* Quick Info */}
                <div className="flex items-center gap-4 text-sm">
                  {event.eventDate && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
                      isOverdue
                        ? 'bg-red-50 text-red-600'
                        : daysUntilDeadline <= 3
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {isOverdue
                        ? 'Deadline passed'
                        : `${daysUntilDeadline}d until deadline`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {!event.isArchived && (
                <>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="secondary"
                    className="shadow-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsArchiveModalOpen(true)}
                    disabled={archiveMutation.isPending}
                    className="shadow-sm"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Speakers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalSpeakers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {stats?.completedSpeakers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                </div>
              </div>
              <div className="w-16">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${stats?.completionRate || 0}, 100`}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6">
        <div className="flex items-center gap-1 p-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'speakers'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Speakers
            {stats && stats.totalSpeakers > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'speakers'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {stats.totalSpeakers}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'assets'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Assets
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'reminders'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
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

          {activeTab === 'assets' && <AssetRequirementsManager eventId={eventId} />}

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

      {/* Edit Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
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
