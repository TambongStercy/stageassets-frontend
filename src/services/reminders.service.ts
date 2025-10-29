import apiClient from '../lib/axios';
import type { Reminder } from '../types/reminders.types';

export const remindersService = {
  /**
   * Get all reminders for a specific event
   */
  async getReminders(eventId: number): Promise<Reminder[]> {
    const response = await apiClient.get<Reminder[]>(`/reminders/events/${eventId}`);
    return response.data;
  },

  /**
   * Manually trigger a reminder for a specific speaker
   */
  async triggerReminder(speakerId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/reminders/trigger', {
      speakerId,
    });
    return response.data;
  },

  /**
   * Get all failed reminders
   */
  async getFailedReminders(): Promise<Reminder[]> {
    const response = await apiClient.get<Reminder[]>('/reminders/failed');
    return response.data;
  },

  /**
   * Retry a failed reminder
   */
  async retryReminder(reminderId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/reminders/${reminderId}/retry`
    );
    return response.data;
  },
};
