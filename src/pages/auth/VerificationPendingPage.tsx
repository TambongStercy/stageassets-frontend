import { Link } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';

export default function VerificationPendingPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement resend verification email API call
      // await authService.resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">StageAsset</span>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-300">
              <Mail className="w-10 h-10 text-emerald-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check your email
            </h1>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to your email address. Click the link in the email to verify your account and start using StageAsset.
            </p>

            {/* Steps */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">What to do next:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-700">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Check your inbox (and spam folder)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-700">2</span>
                  </div>
                  <p className="text-sm text-gray-700">Click the verification link in the email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-700">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Sign in and start using your account</p>
                </div>
              </div>
            </div>

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-800">Verification email sent successfully!</p>
              </div>
            )}

            {/* Resend Button */}
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="secondary"
              className="w-full mb-4"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend verification email
                </>
              )}
            </Button>

            {/* Back to Login */}
            <Link
              to="/login"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}
