import { Link } from 'react-router-dom';
import { Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Event, EventStats } from '../types/event.types';
import { Badge } from './ui';

interface EventCardProps {
  event: Event;
  stats?: EventStats;
}

export function EventCard({ event, stats }: EventCardProps) {
  const deadlineDate = new Date(event.deadline);
  const isOverdue = deadlineDate < new Date();

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-emerald-200 hover:shadow-sm transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
            {event.isArchived && (
              <Badge variant="secondary" className="text-xs">
                Archived
              </Badge>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {stats.completedSpeakers} / {stats.totalSpeakers} completed
              </span>
            </div>
            <span className="font-medium">{stats.completionRate}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {event.eventDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            Deadline: {format(deadlineDate, 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Link>
  );
}
