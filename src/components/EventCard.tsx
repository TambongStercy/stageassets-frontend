import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, FileText, AlertCircle, CheckCircle2, Archive, ArchiveRestore } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { Event, EventStats } from '../types/event.types';
import { Badge } from './ui';
import { getFileUrl } from '../lib/file-url';

interface EventCardProps {
  event: Event;
  stats?: EventStats;
  viewMode?: 'grid' | 'list';
  onArchiveToggle?: (eventId: number, isArchived: boolean) => void;
}

export function EventCard({ event, stats, viewMode = 'grid', onArchiveToggle }: EventCardProps) {
  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onArchiveToggle) {
      onArchiveToggle(event.id, !event.isArchived);
    }
  };
  const deadlineDate = new Date(event.deadline);
  const isOverdue = deadlineDate < new Date();
  const daysUntilDeadline = differenceInDays(deadlineDate, new Date());

  const getDeadlineStatus = () => {
    if (isOverdue) {
      return { text: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle };
    } else if (daysUntilDeadline <= 3) {
      return {
        text: `${daysUntilDeadline}d left`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: AlertCircle,
      };
    } else if (daysUntilDeadline <= 7) {
      return {
        text: `${daysUntilDeadline}d left`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
      };
    }
    return {
      text: `${daysUntilDeadline}d left`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: CheckCircle2,
    };
  };

  const deadlineStatus = getDeadlineStatus();
  const DeadlineIcon = deadlineStatus.icon;

  if (viewMode === 'list') {
    return (
      <Link
        to={`/events/${event.id}`}
        className="block bg-white border border-gray-200 rounded-lg p-5 hover:border-emerald-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-6">
          {/* Logo */}
          {event.logoUrl ? (
            <img
              src={getFileUrl(event.logoUrl)!}
              alt={`${event.name} logo`}
              className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{event.name}</h3>
                  {event.isArchived && (
                    <Badge variant="secondary" className="text-xs">
                      Archived
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{event.description}</p>
                )}
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Assets</div>
                    <div className="text-sm font-semibold text-gray-900">{stats.assets.received}/{stats.assets.expected}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Progress</div>
                    <div className="text-sm font-semibold text-emerald-600">
                      {stats.assets.progress}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4">
              {event.eventDate && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${deadlineStatus.bgColor} ${deadlineStatus.color}`}
              >
                <DeadlineIcon className="w-3.5 h-3.5" />
                <span>{deadlineStatus.text}</span>
              </div>

              {/* Progress Bar */}
              {stats && (
                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${stats.assets.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {onArchiveToggle && (
                <button
                  onClick={handleArchiveClick}
                  className={`p-1.5 rounded-lg transition-all ml-auto ${
                    event.isArchived
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={event.isArchived ? 'Restore event' : 'Archive event'}
                >
                  {event.isArchived ? (
                    <ArchiveRestore className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Event Logo */}
        {event.logoUrl ? (
          <img
            src={getFileUrl(event.logoUrl)!}
            alt={`${event.name} logo`}
            className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
              {event.name}
            </h3>
            {event.isArchived && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
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
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="font-medium">
                {stats.assets.received}/{stats.assets.expected}
              </span>
              <span className="text-gray-500">assets</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600">
              {stats.assets.progress}%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.assets.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-1">
          {event.eventDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(new Date(event.eventDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${deadlineStatus.bgColor} ${deadlineStatus.color}`}
          >
            <DeadlineIcon className="w-3.5 h-3.5" />
            <span>{deadlineStatus.text}</span>
          </div>
        </div>
        {onArchiveToggle && (
          <button
            onClick={handleArchiveClick}
            className={`p-1.5 rounded-lg transition-all ${
              event.isArchived
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title={event.isArchived ? 'Restore event' : 'Archive event'}
          >
            {event.isArchived ? (
              <ArchiveRestore className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </Link>
  );
}
