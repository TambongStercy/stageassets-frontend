import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button } from '../../components/ui';
import { eventsService } from '../../services/events.service';
import type { Event, EventStats } from '../../types/event.types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', showArchived],
    queryFn: () => eventsService.getEvents(showArchived),
  });

  // Fetch stats for each event
  const { data: statsMap } = useQuery({
    queryKey: ['events-stats', events?.map((e) => e.id)],
    queryFn: async () => {
      if (!events) return {};
      const statsPromises = events.map((event) =>
        eventsService.getEventStats(event.id).then((stats) => ({ [event.id]: stats }))
      );
      const statsArray = await Promise.all(statsPromises);
      return Object.assign({}, ...statsArray) as Record<number, EventStats>;
    },
    enabled: !!events && events.length > 0,
  });

  if (eventsLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullScreen />
      </DashboardLayout>
    );
  }

  const hasEvents = events && events.length > 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-gray-600">Manage your event asset collections</p>
        </div>
        <Button
          onClick={() => navigate('/events/new')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Archive Toggle */}
      {hasEvents && (
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Show archived events
          </label>
        </div>
      )}

      {/* Events Grid */}
      {hasEvents ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} stats={statsMap?.[event.id]} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Create your first event to start collecting assets from speakers"
          actionLabel="Create Event"
          onAction={() => navigate('/events/new')}
        />
      )}
    </DashboardLayout>
  );
}
