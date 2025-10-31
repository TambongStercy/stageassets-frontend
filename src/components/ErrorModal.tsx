import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './ui';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  confirmText?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
  confirmText = 'OK',
}: ErrorModalProps) {
  if (!isOpen) return null;

  const iconConfig = {
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  };

  const { icon: Icon, color, bg } = iconConfig[type];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-xl">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
