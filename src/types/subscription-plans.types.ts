export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxActiveEvents: number;
    maxSpeakersPerEvent: number;
    maxStorageGB: number;
  };
  isPopular?: boolean;
  ctaText?: string;
  ctaAction?: 'trial' | 'contact';
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}
