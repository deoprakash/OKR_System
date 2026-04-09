import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../lib/api';
import { useAuth } from '../context/useAuth';
import BackButton from '../components/BackButton';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onRequestOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await requestOtp(userId);
      const data = res?.data || {};
      setMessage(`OTP sent to ${data.email || '-'}.`);
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(userId, otp);
      auth.loginWithSession(res?.data || {});
      navigate('/');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-blue-glow-lg w-full max-w-md p-8 professional-panel">
        <BackButton onClick={() => navigate('/')} className="mb-4 mr-0" />
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">Login</h1>
        <p className="text-gray-600 text-center mb-6">Use your generated User ID and verify OTP</p>

        {step === 'request' ? (
          <form onSubmit={onRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">Employee User ID</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
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
            </div>
            <button
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
            <button
              type="button"
              className="w-full px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              onClick={() => {
                setStep('request');
                setOtp('');
                setError('');
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
