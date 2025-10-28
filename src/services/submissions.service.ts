import apiClient from '../lib/axios';
import type {
  Submission,
  CreateSubmissionData,
  FileUploadResponse,
} from '../types/speaker.types';

export const submissionsService = {
  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Create a submission
   */
  async createSubmission(
    speakerId: number,
    data: CreateSubmissionData
  ): Promise<Submission> {
    const response = await apiClient.post<Submission>(
      `/portal/speakers/${speakerId}/submissions`,
      data
    );
    return response.data;
  },

  /**
   * Get speaker's submissions
   */
  async getSubmissions(speakerId: number): Promise<Submission[]> {
    const response = await apiClient.get<Submission[]>(
      `/portal/speakers/${speakerId}/submissions`
    );
    return response.data;
  },

  /**
   * Delete a submission
   */
  async deleteSubmission(speakerId: number, submissionId: number): Promise<void> {
    await apiClient.delete(`/portal/speakers/${speakerId}/submissions/${submissionId}`);
  },
};
