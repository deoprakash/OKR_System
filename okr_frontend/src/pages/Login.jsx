import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../lib/api';
import { useAuth } from '../context/useAuth';
import BackButton from '../components/BackButton';

const OTP_RESEND_SECONDS = 60;

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (step !== 'verify' || !otpExpiresAt) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, otpExpiresAt]);

  const otpExpired = step === 'verify' && otpExpiresAt > 0 && now >= otpExpiresAt;

  const resendOtp = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await requestOtp(email);
      const data = res?.data || {};
      const expiresInSeconds = Math.min(
        OTP_RESEND_SECONDS,
        Math.max(1, Number(data.expiresInSeconds || OTP_RESEND_SECONDS))
      );
      setOtp('');
      setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
      setNow(Date.now());
      setMessage(`OTP resent to ${data.email || '-'}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  async function onRequestOtp(e) {
    e.preventDefault();
    setRequestLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await requestOtp(email);
      const data = res?.data || {};
      const expiresInSeconds = Math.min(
        OTP_RESEND_SECONDS,
        Math.max(1, Number(data.expiresInSeconds || OTP_RESEND_SECONDS))
      );
      setMessage(`OTP sent to ${data.email || '-'}.`);
      setOtp('');
      setOtpExpiresAt(Date.now() + expiresInSeconds * 1000);
      setNow(Date.now());
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setRequestLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    if (otpExpired) {
      setError('OTP expired.');
      return;
    }

    setVerifyLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      auth.loginWithSession(res?.data || {});
      navigate('/');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-blue-glow-lg w-full max-w-md p-8 professional-panel">
        <BackButton onClick={() => navigate('/')} className="mb-4 mr-0" />
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">Login</h1>
        <p className="text-gray-600 text-center mb-6">Use your registered email and verify OTP</p>

        {step === 'request' ? (
          <form onSubmit={onRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Employee Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button
              disabled={requestLoading}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {requestLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              {otpExpiresAt > 0 && !otpExpired && (
                <p className="mt-2 text-xs text-gray-500">
                  Resend available in {Math.max(0, Math.ceil((otpExpiresAt - now) / 1000))}s
                </p>
              )}
              {otpExpired && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  OTP expired.
                </p>
              )}
            </div>
            <button
              disabled={verifyLoading || otpExpired}
              className="w-full px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              Verify OTP
            </button>
            {otpExpired && (
              <button
                type="button"
                disabled={resendLoading}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                onClick={resendOtp}
              >
                {resendLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
            <button
              type="button"
              className="w-full px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              onClick={() => {
                setStep('request');
                setOtp('');
                setError('');
                setOtpExpiresAt(0);
                setNow(Date.now());
              }}
            >
              Back
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</p>}
      </div>
    </div>
  );
}
