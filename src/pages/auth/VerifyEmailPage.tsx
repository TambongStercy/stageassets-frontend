import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Container, Button } from '../../components/ui';
import { authService } from '../../services/auth.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resendEmail, setResendEmail] = useState('');

  const verifyMutation = useMutation({
    mutationFn: authService.verifyEmail,
  });

  const resendMutation = useMutation({
    mutationFn: authService.resendVerification,
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (resendEmail) {
      resendMutation.mutate(resendEmail);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-semibold text-gray-900">StageAsset</span>
            </Link>
          </div>
        </Container>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Verification</h1>

            {/* Loading State */}
            {verifyMutation.isPending && (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Verifying your email...</p>
              </div>
            )}

            {/* Success State */}
            {verifyMutation.isSuccess && (
              <div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-emerald-900 mb-1">
                        Email verified successfully
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Your email has been verified. You can now sign in to your account.
                      </p>
                    </div>
                  </div>
                </div>
                <Link to="/login">
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
                    Continue to login
                  </Button>
                </Link>
              </div>
            )}

            {/* Error State */}
            {verifyMutation.isError && (
              <div>
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-900 mb-1">
                        Verification failed
                      </h3>
                      <p className="text-sm text-red-700">
                        {(verifyMutation.error as any)?.response?.data?.message ||
                          'The verification link is invalid or has expired.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resend verification form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Need a new verification link?
                  </h3>
                  {resendMutation.isSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                      <p className="text-sm text-emerald-700">
                        Verification email sent! Check your inbox.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleResend} className="space-y-3">
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={resendMutation.isPending}
                        variant="secondary"
                        className="w-full"
                      >
                        {resendMutation.isPending ? 'Sending...' : 'Resend verification email'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* No token state */}
            {!token && !verifyMutation.isPending && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  No verification token provided. Please check your email for the verification
                  link.
                </p>
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    Go to login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Need help?{' '}
            <Link to="/" className="text-emerald-700 hover:underline font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
