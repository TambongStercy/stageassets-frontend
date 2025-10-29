import apiClient from '../lib/axios';
import type { User } from '../types/auth.types';
import type { Subscription, PlanUsage } from '../types/subscription.types';

export const usersService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<User> {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/users/profile/change-password',
      data
    );
    return response.data;
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<User>('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/profile');
  },

  /**
   * Get user's subscription history
   */
  async getSubscriptionHistory(userId: number): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>(`/subscriptions/user/${userId}`);
    return response.data;
  },

  /**
   * Get plan usage statistics
   */
  async getPlanUsage(): Promise<PlanUsage> {
    const response = await apiClient.get<PlanUsage>('/users/profile/plan-usage');
    return response.data;
  },
};
