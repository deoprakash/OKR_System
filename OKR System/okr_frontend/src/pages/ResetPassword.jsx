import React, { useState } from 'react';
import { resetPassword } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!token || !newPassword) return setError('All fields required');
    if (newPassword !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-shell shift-bg flex items-center justify-center px-4 py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-6 sm:p-8 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <BackButton onClick={() => navigate('/forgot-password')} />
          </div>

          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-sm text-(--muted) mb-6">Enter the reset code sent to your email and choose a new password.</p>

          {success && <div className="mb-4 rounded p-3 bg-green-500/10 border border-green-500/20 text-green-200">{success}</div>}
          {error && <div className="mb-4 rounded p-3 bg-red-500/10 border border-red-500/20 text-red-200">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Reset Code</label>
              <input autoFocus className="w-full rounded-lg px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" className="w-full rounded-lg px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" className="w-full rounded-lg px-4 py-3 border border-white/10 bg-white/3 outline-none focus:border-cyan-400/40" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <button disabled={loading} type="submit" className="hero-primary">{loading ? 'Saving...' : 'Reset Password'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>Back to sign in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
