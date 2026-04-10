import { useState, useEffect } from 'react';
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
  const [sending, setSending] = useState(false);

  // ================= AUTO SEND OTP =================
  useEffect(() => {
    const sendOtp = async () => {
      setSending(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/login-otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to send OTP');
        }

        console.log('✅ OTP sent automatically');
      } catch (err) {
        console.error('❌ OTP send failed:', err.message);
        setError('Failed to send OTP. Please try again.');
      } finally {
        setSending(false);
      }
    };

    if (email) {
      sendOtp();
    }
  }, [email]);

  // ================= VERIFY OTP =================
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

  // ================= RESEND OTP =================
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
      alert('OTP resent successfully');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  // ================= NO EMAIL CASE =================
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-bold">Session Expired</h2>
          <Link to="/login" className="text-blue-600">Go to Login</Link>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">

        <div className="text-center mb-4">
          <Shield className="mx-auto h-10 w-10 text-blue-600" />
          <h2 className="text-xl font-bold">Enter OTP</h2>
          <p className="text-sm text-gray-600">
            {sending ? 'Sending OTP...' : `OTP sent to ${email}`}
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className="w-full border p-2 text-center text-xl mb-3"
            placeholder="000000"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="flex justify-between mt-3 text-sm">
          <button onClick={handleResendOtp} disabled={resending}>
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
          <Link to="/login">Back</Link>
        </div>

      </div>
    </div>
  );
}
