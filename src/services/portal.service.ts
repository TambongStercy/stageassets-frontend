import apiClient from '../lib/axios';
import type { Speaker, UpdateSpeakerData } from '../types/speaker.types';
import type { Event } from '../types/event.types';

export const portalService = {
  /**
   * Get event by slug (public)
   */
  async getEventBySlug(slug: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/portal/events/${slug}`);
    return response.data;
  },

  /**
   * Get speaker by access token (public)
   */
  async getSpeakerByToken(accessToken: string): Promise<Speaker> {
    const response = await apiClient.get<Speaker>(`/portal/speakers/${accessToken}`);
    return response.data;
  },

  /**
   * Update speaker profile (public)
   */
  async updateSpeakerProfile(
    accessToken: string,
    data: UpdateSpeakerData
  ): Promise<Speaker> {
    const response = await apiClient.put<Speaker>(`/portal/speakers/${accessToken}`, data);
    return response.data;
  },
};
