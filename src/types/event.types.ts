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
  totalSpeakers: number;
  completedSpeakers: number;
  partialSpeakers: number;
  pendingSpeakers: number;
  completionRate: number;
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
