import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ArrowLeft } from 'lucide-react';
import { subscriptionPlansService } from '../services/subscription-plans.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button, Container } from '../components/ui';

export default function PricingPage() {
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', 'public'],
    queryFn: () => subscriptionPlansService.getPublicPlans(),
  });

  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const featureLabels: Record<string, string> = {
    branded_portal: 'Branded portal pages',
    auto_reminders: 'Automated reminders',
    priority_support: 'Priority support',
    custom_domains: 'Custom domains',
    advanced_analytics: 'Advanced analytics',
    api_access: 'API access',
    white_label: 'White-label branding',
    dedicated_support: 'Dedicated account manager',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-16">
        <Container>
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that's right for your event. All plans include core features.
            </p>
          </div>

          {/* Plans Grid */}
          {plans && plans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const isFree = plan.priceMonthly === 0;
                const isPopular = plan.name === 'professional' || plan.name === 'starter';

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-xl border-2 ${
                      isPopular
                        ? 'border-emerald-500 shadow-lg scale-105'
                        : 'border-gray-200'
                    } p-8`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.displayName}
                      </h3>
                      {plan.description && (
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {isFree ? (
                        <div className="text-4xl font-bold text-gray-900">Free</div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900">
                              {formatPrice(plan.priceMonthly)}
                            </span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            or {formatPrice(plan.priceYearly)}/year (save{' '}
                            {Math.round(
                              ((plan.priceMonthly * 12 - plan.priceYearly) /
                                (plan.priceMonthly * 12)) *
                                100
                            )}
                            %)
                          </div>
                        </>
                      )}
                    </div>

                    {/* Limits */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Events:</span>
                          <span className="font-semibold text-gray-900">
                            {plan.maxActiveEvents === -1 ? 'Unlimited' : plan.maxActiveEvents}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speakers per Event:</span>
                          <span className="font-semibold text-gray-900">
                            {plan.maxSpeakersPerEvent === -1
                              ? 'Unlimited'
                              : plan.maxSpeakersPerEvent}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-8">
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {featureLabels[feature] || feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => navigate('/register')}
                      className={
                        isPopular
                          ? 'w-full bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'w-full'
                      }
                      variant={isPopular ? 'default' : 'secondary'}
                    >
                      {isFree ? 'Get Started' : 'Start Free Trial'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No subscription plans available at this time.</p>
            </div>
          )}

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              Need a custom plan?{' '}
              <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                Contact us
              </button>
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
