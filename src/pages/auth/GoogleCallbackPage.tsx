import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No authentication token received');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        // Store the token
        localStorage.setItem('access_token', token);

        // Fetch user profile
        const userData = await authService.getProfile();
        setUser(userData);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        localStorage.removeItem('access_token');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing sign in with Google...</p>
      </div>
    </div>
  );
}
