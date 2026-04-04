import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE from '../api.js';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google auth error:', error);
        navigate('/login', { state: { error: 'Google authentication failed' } });
        return;
      }

      if (token) {
        // Save token and get user info
        localStorage.setItem('token', token);
        window.dispatchEvent(new Event('authChanged'));

        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            navigate('/jobs');
          } else {
            navigate('/login', { state: { error: 'Failed to get user info' } });
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          navigate('/login', { state: { error: 'Authentication failed' } });
        }
      } else {
        navigate('/login', { state: { error: 'No token received' } });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your Google authentication.</p>
      </div>
    </div>
  );
}
