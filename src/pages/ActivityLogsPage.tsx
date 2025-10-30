import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Avatar } from '../components/Avatar';
import { Button, Card, CardContent } from '../components/ui';
import { activityLogsService } from '../services/activity-logs.service';
import { useAuth } from '../hooks/useAuth';
import type { ActivityLogFilters } from '../types/activity-logs.types';

export default function ActivityLogsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ActivityLogFilters>({
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch activity logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => activityLogsService.getActivityLogs(filters),
  });

  const handleFilterChange = (key: keyof ActivityLogFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 50 });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-emerald-50 text-emerald-700';
    if (action.includes('update')) return 'bg-blue-50 text-blue-700';
    if (action.includes('delete')) return 'bg-red-50 text-red-700';
    if (action.includes('login') || action.includes('logout')) return 'bg-purple-50 text-purple-700';
    return 'bg-gray-50 text-gray-700';
  };

  const formatEntityType = (entityType: string) => {
    return entityType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
            <p className="text-gray-600">View your account activity and actions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Avatar
              avatarUrl={user?.avatarUrl}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="md"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <input
                    type="text"
                    value={filters.action || ''}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    placeholder="e.g., create_event"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={filters.entityType || ''}
                    onChange={(e) => handleFilterChange('entityType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">All types</option>
                    <option value="event">Event</option>
                    <option value="speaker">Speaker</option>
                    <option value="submission">Submission</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit
                  </label>
                  <select
                    value={filters.limit || 50}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="25">25 logs</option>
                    <option value="50">50 logs</option>
                    <option value="100">100 logs</option>
                    <option value="200">200 logs</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={clearFilters}
                  variant="secondary"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Timestamp</th>
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">Entity</th>
                      <th className="pb-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="text-sm">
                        <td className="py-4 text-gray-600">
                          <div>{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 text-gray-700">
                          <div>{formatEntityType(log.entityType)}</div>
                          {log.entityId && (
                            <div className="text-xs text-gray-500">ID: {log.entityId}</div>
                          )}
                        </td>
                        <td className="py-4">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="text-gray-600 hover:text-gray-900">
                                View details
                              </summary>
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                                {JSON.stringify(log.details, null, 2)}
                              </div>
                            </details>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No activity logs found</p>
                {(filters.action || filters.entityType) && (
                  <Button
                    onClick={clearFilters}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
