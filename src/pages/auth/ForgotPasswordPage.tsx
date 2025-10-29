import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Container, Button } from '../../components/ui';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send reset email');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    forgotPasswordMutation.mutate(email);
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
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {forgotPasswordMutation.isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-emerald-900 mb-1">
                      Check your email
                    </h3>
                    <p className="text-sm text-emerald-700">
                      If an account with that email exists, we've sent you a password reset link.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-600 mt-4">
            Remember your password?{' '}
            <Link to="/login" className="text-emerald-700 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
