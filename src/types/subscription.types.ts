export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'expired' | 'cancelled';
  amountPaid: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxActiveEvents: number;
  maxSpeakersPerEvent: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  authProvider: 'email' | 'google';
  currentPlanId: number | null;
  currentSubscriptionId: number | null;
  createdAt: string;
  updatedAt: string;
  currentPlan?: SubscriptionPlan;
}

export interface PlanUsage {
  activeEvents: number;
  maxActiveEvents: number;
  eventsUsagePercent: number;
}
