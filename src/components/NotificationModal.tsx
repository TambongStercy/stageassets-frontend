import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Button } from './ui';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export function NotificationModal({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      defaultTitle: 'Success',
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      defaultTitle: 'Error',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      defaultTitle: 'Warning',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      defaultTitle: 'Information',
    },
  };

  const { icon: Icon, iconBg, iconColor, titleColor, defaultTitle } = config[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            {/* Title */}
            <h3 className={`text-lg font-semibold ${titleColor} mb-2`}>
              {title || defaultTitle}
            </h3>

            {/* Message */}
            <p className="text-gray-600 mb-6">{message}</p>

            {/* Action */}
            <Button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
