import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi } from '../lib/api';
import { useAuth } from '../context/useAuth';

export default function ChangePassword() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!oldPassword || !newPassword) return setError('All fields required');
    if (newPassword !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await changePasswordApi(oldPassword, newPassword);
      // refresh user info
      auth.loginWithSession({ token: auth.token, user: { ...auth.user, mustChangePassword: false } });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving...' : 'Change Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
