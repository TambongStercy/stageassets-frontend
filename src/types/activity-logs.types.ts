export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogFilters {
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
