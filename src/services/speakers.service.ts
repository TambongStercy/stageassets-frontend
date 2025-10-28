import apiClient from '../lib/axios';
import type { Speaker, InviteSpeakerData, UpdateSpeakerData } from '../types/speaker.types';

export const speakersService = {
  /**
   * Get all speakers for an event
   */
  async getSpeakers(eventId: number): Promise<Speaker[]> {
    const response = await apiClient.get<Speaker[]>(`/events/${eventId}/speakers`);
    return response.data;
  },

  /**
   * Get a single speaker
   */
  async getSpeaker(eventId: number, speakerId: number): Promise<Speaker> {
    const response = await apiClient.get<Speaker>(`/events/${eventId}/speakers/${speakerId}`);
    return response.data;
  },

  /**
   * Invite a speaker to an event
   */
  async inviteSpeaker(eventId: number, data: InviteSpeakerData): Promise<Speaker> {
    const response = await apiClient.post<Speaker>(`/events/${eventId}/speakers`, data);
    return response.data;
  },

  /**
   * Update speaker information
   */
  async updateSpeaker(
    eventId: number,
    speakerId: number,
    data: UpdateSpeakerData
  ): Promise<Speaker> {
    const response = await apiClient.put<Speaker>(
      `/events/${eventId}/speakers/${speakerId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a speaker
   */
  async deleteSpeaker(eventId: number, speakerId: number): Promise<void> {
    await apiClient.delete(`/events/${eventId}/speakers/${speakerId}`);
  },

  /**
   * Resend invitation to a speaker
   */
  async resendInvitation(eventId: number, speakerId: number): Promise<{ message: string; speaker: Speaker }> {
    const response = await apiClient.post<{ message: string; speaker: Speaker }>(
      `/events/${eventId}/speakers/${speakerId}/resend-invitation`
    );
    return response.data;
  },
};
