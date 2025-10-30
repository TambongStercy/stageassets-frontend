export interface Reminder {
  id: number;
  eventId: number;
  speakerId?: number;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  emailSubject?: string;
  emailBody?: string;
  errorMessage?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  speaker?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
