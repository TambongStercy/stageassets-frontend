import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { subscriptionPlansService } from '../services/subscription-plans.service';

export function useSubscriptionGate() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState('');
  const [gateMessage, setGateMessage] = useState('');

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => usersService.getProfile(),
  });

  // Fetch current plan details
  const { data: currentPlan } = useQuery({
    queryKey: ['subscription-plan', profile?.currentPlanId],
    queryFn: () => subscriptionPlansService.getPlan(profile!.currentPlanId!),
    enabled: !!profile?.currentPlanId,
  });

  const checkLimit = (
    currentCount: number,
    limit: number | null,
    featureName: string,
    customMessage?: string
  ): boolean => {
    // -1 means unlimited
    if (limit === -1 || limit === null) {
      return true;
    }

    if (currentCount >= limit) {
      setGateFeature(featureName);
      setGateMessage(
        customMessage ||
          `You've reached the limit of ${limit} ${featureName.toLowerCase()} on your current plan.`
      );
      setIsGateOpen(true);
      return false;
    }

    return true;
  };

  const checkSpeakerLimit = (currentSpeakerCount: number): boolean => {
    if (!currentPlan) return true;
    return checkLimit(
      currentSpeakerCount,
      currentPlan.maxSpeakersPerEvent,
      'Speakers per Event',
      `You've reached the limit of ${currentPlan.maxSpeakersPerEvent} speakers for this event on your current plan. Upgrade to add more speakers.`
    );
  };

  const checkEventLimit = (currentEventCount: number): boolean => {
    if (!currentPlan) return true;
    return checkLimit(
      currentEventCount,
      currentPlan.maxActiveEvents,
      'Active Events',
      `You've reached the limit of ${currentPlan.maxActiveEvents} active events on your current plan. Upgrade to create more events.`
    );
  };

  const checkPremiumFeature = (featureName: string, customMessage?: string): boolean => {
    // Check if user is on free plan
    if (!currentPlan || currentPlan.priceMonthly === 0) {
      setGateFeature(featureName);
      setGateMessage(customMessage || '');
      setIsGateOpen(true);
      return false;
    }
    return true;
  };

  const closeGate = () => {
    setIsGateOpen(false);
    setGateFeature('');
    setGateMessage('');
  };

  return {
    currentPlan,
    isGateOpen,
    gateFeature,
    gateMessage,
    checkSpeakerLimit,
    checkEventLimit,
    checkPremiumFeature,
    closeGate,
  };
}
