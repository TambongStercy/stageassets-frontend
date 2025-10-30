export interface Event {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description: string | null;
  deadline: string;
  eventDate: string | null;
  brandColor: string;
  logoUrl: string | null;
  enableAutoReminders: boolean;
  reminderDaysBefore: number;
  customInstructions: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  speakers: {
    total: number;
    completed: number;
    partial: number;
    pending: number;
    completionRate: number;
  };
  assetTypes: {
    total: number;
    required: number;
    optional: number;
  };
  assets: {
    expected: number;
    received: number;
    missing: number;
    progress: number;
  };
  requiredAssets: {
    expected: number;
    received: number;
    missing: number;
    progress: number;
  };
  optionalAssets: {
    expected: number;
    received: number;
    missing: number;
    progress: number;
  };
}

export interface CreateEventData {
  name: string;
  description?: string;
  deadline: string;
  eventDate?: string;
  brandColor?: string;
  logoUrl?: string;
  enableAutoReminders?: boolean;
  reminderDaysBefore?: number;
  customInstructions?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}
