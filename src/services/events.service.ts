import apiClient from '../lib/axios';
import type {
  Event,
  EventStats,
  CreateEventData,
  UpdateEventData,
} from '../types/event.types';

export const eventsService = {
  /**
   * Get all events for the current user
   */
  async getEvents(includeArchived = false): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events', {
      params: { includeArchived },
    });
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  /**
   * Get event statistics
   */
  async getEventStats(id: number): Promise<EventStats> {
    const response = await apiClient.get<EventStats>(`/events/${id}/stats`);
    return response.data;
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  /**
   * Create a new event with logo file upload
   */
  async createEventWithLogo(data: CreateEventData, logoFile: File): Promise<Event> {
    const formData = new FormData();

    // Append all event data with proper handling
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          // Convert all values to string for FormData
          formData.append(key, String(value));
        }
      }
    });

    // Ensure required reminder fields are included with defaults if missing
    if (!formData.has('enableAutoReminders')) {
      formData.append('enableAutoReminders', 'true');
    }
    if (!formData.has('reminderDaysBefore')) {
      formData.append('reminderDaysBefore', '3');
    }

    // Append logo file
    formData.append('logo', logoFile);

    const response = await apiClient.post<Event>('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an event
   */
  async updateEvent(id: number, data: UpdateEventData): Promise<Event> {
    const response = await apiClient.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  /**
   * Update an event with logo file upload
   */
  async updateEventWithLogo(id: number, data: UpdateEventData, logoFile: File): Promise<Event> {
    const formData = new FormData();

    // Append all event data with proper handling
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          // Convert all values to string for FormData
          formData.append(key, String(value));
        }
      }
    });

    // Append logo file
    formData.append('logo', logoFile);

    const response = await apiClient.put<Event>(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Archive an event
   */
  async archiveEvent(id: number): Promise<Event> {
    const response = await apiClient.put<Event>(`/events/${id}/archive`);
    return response.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
