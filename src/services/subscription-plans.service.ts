import apiClient from '../lib/axios';
import type { SubscriptionPlan } from '../types/subscription-plans.types';

export const subscriptionPlansService = {
  /**
   * Get all public subscription plans (no auth required)
   */
  async getPublicPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>('/subscription-plans/public');
    return response.data;
  },
};
