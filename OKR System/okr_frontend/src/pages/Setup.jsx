import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '../lib/api';

export default function Setup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupEnabled, setSetupEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await (await fetch((import.meta.env.VITE_API_URL || '') + '/api/setup')).json();
        if (!resp || !resp.setupEnabled) {
          setSetupEnabled(false);
        }
      } catch (err) {
        // allow showing form if check fails
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !cellNumber) return setError('All fields are required');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const payload = { empName: name, emailId: email, cellNumber: cellNumber, isAdmin: true, password };
      await createEmployee(payload);
      setSuccess('Admin account created. Registration is now disabled.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Create Administrator Account</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {!setupEnabled && <div className="mb-3 text-yellow-700">Admin already exists. Registration disabled.</div>}
        {success && <div className="mb-3 text-green-600">{success}</div>}
        {!success && setupEnabled && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cell Number</label>
              <input type="text" className="w-full border px-3 py-2 rounded" value={cellNumber} onChange={(e) => setCellNumber(e.target.value)} placeholder="e.g. 919999999999" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" className="w-full border px-3 py-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" className="w-full border px-3 py-2 rounded" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create Administrator'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
