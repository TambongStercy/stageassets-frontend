import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Archive, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '../../components/DashboardLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { InviteSpeakerModal } from '../../components/InviteSpeakerModal';
import { SpeakerTable } from '../../components/SpeakerTable';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { eventsService } from '../../services/events.service';
import { speakersService } from '../../services/speakers.service';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eventId = parseInt(id!, 10);

  const [activeTab, setActiveTab] = useState<'speakers' | 'settings'>('speakers');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
            {event.description && <p className="text-gray-600">{event.description}</p>}
          </div>
          <div className="flex gap-2">
            {!event.isArchived && (
              <Button
                variant="secondary"
                onClick={() => {
                  if (confirm('Are you sure you want to archive this event?')) {
                    archiveMutation.mutate();
                  }
                }}
                disabled={archiveMutation.isPending}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalSpeakers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {stats?.completedSpeakers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.completionRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Info */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Deadline</div>
              <div className="font-medium text-gray-900">
                {format(new Date(event.deadline), 'MMMM d, yyyy h:mm a')}
              </div>
            </div>
            {event.eventDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Event Date</div>
                <div className="font-medium text-gray-900">
                  {format(new Date(event.eventDate), 'MMMM d, yyyy h:mm a')}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 mb-1">Event URL</div>
              <div className="font-mono text-sm text-gray-900">
                {window.location.origin}/portal/events/{event.slug}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Brand Color</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: event.brandColor }}
                ></div>
                <span className="font-mono text-sm text-gray-900">{event.brandColor}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'speakers'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Speakers
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'speakers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Speakers</h2>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Speaker
            </Button>
          </div>

          {speakersLoading ? (
            <LoadingSpinner />
          ) : (
            <SpeakerTable speakers={speakers || []} eventId={eventId} />
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardContent className="pt-6">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <InviteSpeakerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        eventId={eventId}
      />
    </DashboardLayout>
  );
}
