export type SubmissionStatus = 'pending' | 'partial' | 'complete';

export interface Speaker {
  id: number;
  eventId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
  accessToken: string;
  submissionStatus: SubmissionStatus;
  submittedAt: string | null;
  lastReminderSentAt: string | null;
  reminderCount: number;
  invitedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteSpeakerData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
}

export interface UpdateSpeakerData {
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
}

export interface Submission {
  id: number;
  speakerId: number;
  assetRequirementId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storageProvider: 'local' | 'gcs';
  storagePath: string;
  imageWidth: number | null;
  imageHeight: number | null;
  version: number;
  replacesSubmissionId: number | null;
  isLatest: boolean;
  uploadedAt: string;
  createdAt: string;
}

export interface CreateSubmissionData {
  assetRequirementId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
}
