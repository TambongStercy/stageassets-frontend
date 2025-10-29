import apiClient from '../lib/axios';
import type { ActivityLog, ActivityLogFilters } from '../types/activity-logs.types';

export const activityLogsService = {
  /**
   * Get activity logs for the current user with optional filters
   */
  async getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
    const params = new URLSearchParams();

    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<ActivityLog[]>(`/activity-logs?${params.toString()}`);
    return response.data;
  },
};
