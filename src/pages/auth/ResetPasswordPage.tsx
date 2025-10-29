import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Container, Button } from '../../components/ui';
import { authService } from '../../services/auth.service';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      setError(null);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    resetPasswordMutation.mutate({ token, password: newPassword });
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create new password</h1>
            <p className="text-gray-600 mb-6">Enter your new password below.</p>

            {resetPasswordMutation.isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-emerald-900 mb-1">
                      Password reset successful
                    </h3>
                    <p className="text-sm text-emerald-700">
                      Your password has been reset. Redirecting to login...
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
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Repeat your new password"
                    required
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending || !token}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
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
