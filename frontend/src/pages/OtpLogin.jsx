import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import API_BASE from '../api.js';

export default function OtpLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Please start over</p>
          <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('authChanged'));
        navigate('/jobs');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

      setOtp('');
      setError('');
      alert('OTP resent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Enter OTP</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleVerifyOtp}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              One-Time Password
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength="6"
              required
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="flex items-center text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
            <Link to="/login" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
