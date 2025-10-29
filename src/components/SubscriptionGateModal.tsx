import { useNavigate } from 'react-router-dom';
import { Crown, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './ui';

interface SubscriptionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  message?: string;
}

export function SubscriptionGateModal({
  isOpen,
  onClose,
  feature = 'this feature',
  message,
}: SubscriptionGateModalProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/settings?tab=subscription');
  };

  const benefits = [
    'Unlimited events and speakers',
    'Advanced asset requirements',
    'Custom email reminders',
    'Priority support',
    'Analytics and reporting',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-in zoom-in duration-500">
          <Crown className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message || (
            <>
              <span className="font-medium text-gray-900">{feature}</span> is a premium feature.
              Upgrade your plan to unlock this and many more powerful features.
            </>
          )}
        </p>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 mb-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-gray-900">Premium Benefits</h4>
          </div>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUpgrade}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Crown className="w-4 h-4 mr-2" />
            View Pricing Plans
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
