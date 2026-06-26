import React, { useState } from 'react';
import { forgotPassword } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!identifier) return setError('Enter your email or user id');
    setLoading(true);
    try {
      await forgotPassword(identifier);
      setMessage('If an account exists, a reset code was sent to the email on file.');
      setTimeout(() => navigate('/reset-password'), 1600);
    } catch (err) {
      setError(err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-shell shift-bg flex items-center justify-center px-4 py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-6 sm:p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <BackButton onClick={() => navigate('/login')} />
          </div>

          <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
          <p className="text-sm text-(--muted) mb-6">Enter your email or user id and we'll send a reset code to your registered email address.</p>

          {message && <div className="mb-4 rounded p-3 bg-green-500/10 border border-green-500/20 text-green-200">{message}</div>}
          {error && <div className="mb-4 rounded p-3 bg-red-500/10 border border-red-500/20 text-red-200">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Email or User ID</label>
              <input autoFocus className="w-full rounded-lg px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>

            <div className="flex items-center gap-3">
              <button disabled={loading} type="submit" className="hero-primary">{loading ? 'Sending...' : 'Send Reset Code'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>Back to sign in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
