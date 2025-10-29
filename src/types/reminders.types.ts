export interface Reminder {
  id: number;
  eventId: number;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}
