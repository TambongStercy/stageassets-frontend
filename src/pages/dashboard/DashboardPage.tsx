import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Search, Grid3x3, List, Filter, Archive, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EventCardSkeleton, StatsCardSkeleton } from '../../components/Skeleton';
import { Button, Card, CardContent } from '../../components/ui';
import { Avatar } from '../../components/Avatar';
import { eventsService } from '../../services/events.service';
import { useAuth } from '../../hooks/useAuth';
import type { Event, EventStats } from '../../types/event.types';

type FilterType = 'all' | 'active' | 'archived';
type ViewMode = 'grid' | 'list';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all events (active and archived)
  const { data: allEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', user?.id, true], // Include user ID to invalidate on user change
    queryFn: () => eventsService.getEvents(true),
    enabled: !!user, // Only fetch when user is authenticated
  });

  // Fetch stats for each event
  const { data: statsMap } = useQuery({
    queryKey: ['events-stats', allEvents?.map((e) => e.id)],
    queryFn: async () => {
      if (!allEvents) return {};
      const statsPromises = allEvents.map((event) =>
        eventsService.getEventStats(event.id).then((stats) => ({ [event.id]: stats }))
      );
      const statsArray = await Promise.all(statsPromises);
      return Object.assign({}, ...statsArray) as Record<number, EventStats>;
    },
    enabled: !!allEvents && allEvents.length > 0,
  });

  // Archive/unarchive event mutation
  const archiveMutation = useMutation({
    mutationFn: ({ eventId, isArchived }: { eventId: number; isArchived: boolean }) =>
      eventsService.updateEvent(eventId, { isArchived }),
    onSuccess: () => {
      // Invalidate queries to refresh the events list
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Handle archive toggle
  const handleArchiveToggle = (eventId: number, isArchived: boolean) => {
    archiveMutation.mutate({ eventId, isArchived });
  };

  // Filter and search events
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];

    return allEvents.filter((event) => {
      // Filter by status
      if (filter === 'active' && event.isArchived) return false;
      if (filter === 'archived' && !event.isArchived) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [allEvents, filter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!allEvents) return { total: 0, active: 0, archived: 0 };
    return {
      total: allEvents.length,
      active: allEvents.filter((e) => !e.isArchived).length,
      archived: allEvents.filter((e) => e.isArchived).length,
    };
  }, [allEvents]);

  if (eventsLoading) {
    return (
      <DashboardLayout>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your event asset collections</p>
            </div>
            <Button
              onClick={() => navigate('/events/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>

          {/* Filters and Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-900">
                All
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600">
                Active
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600">
                Archived
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  disabled
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 bg-gray-50"
                />
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <button className="p-2 rounded-md bg-gray-100 text-gray-900">
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-md text-gray-400">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const hasEvents = filteredEvents.length > 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your event asset collections</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/events/new')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
            <button
              onClick={() => navigate('/settings')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Go to Settings"
            >
              <Avatar
                avatarUrl={user?.avatarUrl}
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="md"
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-2 border-gray-100 hover:border-yellow-200 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 hover:border-emerald-200 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.archived}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Archive className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'active'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'archived'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {hasEvents ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-4'
          }
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              stats={statsMap?.[event.id]}
              viewMode={viewMode}
              onArchiveToggle={handleArchiveToggle}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={filter === 'archived' ? Archive : Calendar}
          title={
            filter === 'archived'
              ? 'No archived events'
              : searchQuery
              ? 'No events found'
              : 'No events yet'
          }
          description={
            filter === 'archived'
              ? 'Archived events will appear here'
              : searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first event to start collecting assets from speakers'
          }
          actionLabel={!searchQuery && filter !== 'archived' ? 'Create Event' : undefined}
          onAction={!searchQuery && filter !== 'archived' ? () => navigate('/events/new') : undefined}
        />
      )}
    </DashboardLayout>
  );
}
