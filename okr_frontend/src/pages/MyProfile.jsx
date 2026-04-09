import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { getMe, updateEmployee } from '../lib/api';
import { useAuth } from '../context/useAuth';

export default function MyProfile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    userId: '',
    empName: '',
    empDesignation: '',
    emailId: '',
    cellNumber: '',
    empLevel: '',
    isAdmin: false
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMe();
        const me = res?.data || {};
        if (!mounted) return;
        setForm({
          userId: me.userId || '',
          empName: me.empName || '',
          empDesignation: me.empDesignation || '',
          emailId: me.emailId || '',
          cellNumber: me.cellNumber || '',
          empLevel: String(me.empLevel || ''),
          isAdmin: Boolean(me.isAdmin)
        });
      } catch {
        if (!mounted) return;
        setError('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        empName: form.empName,
        empDesignation: form.empDesignation,
        emailId: form.emailId,
        cellNumber: form.cellNumber
      };

      const res = await updateEmployee(auth.user?.empCode, payload);
      const updated = res?.data || {};

      auth.loginWithSession({
        token: auth.token,
        user: {
          ...auth.user,
          empName: updated.empName || form.empName,
          empDesignation: updated.empDesignation || form.empDesignation,
          emailId: updated.emailId || form.emailId,
          cellNumber: updated.cellNumber || form.cellNumber
        }
      });

      setForm((prev) => ({
        ...prev,
        empName: updated.empName || prev.empName,
        empDesignation: updated.empDesignation || prev.empDesignation,
        emailId: updated.emailId || prev.emailId,
        cellNumber: updated.cellNumber || prev.cellNumber
      }));

      setMessage('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1724] flex flex-col">
      <NavBar />
      <div className="flex-1 p-8 mt-10">
        <div className="bg-white rounded-2xl shadow-blue-glow-lg p-8 max-w-3xl mx-auto professional-panel">
          <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">My Profile</h1>

          {loading ? (
            <div className="text-center text-gray-600">Loading profile...</div>
          ) : (
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-2">User ID</label>
                  <input className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gray-100" value={form.userId} readOnly />
                </div>
              </div>

              <div>
                <label className="block text-blue-900 font-semibold mb-2">Name</label>
                <input
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                  value={form.empName}
                  onChange={(e) => setForm((prev) => ({ ...prev, empName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-blue-900 font-semibold mb-2">Designation</label>
                <input
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                  value={form.empDesignation}
                  onChange={(e) => setForm((prev) => ({ ...prev, empDesignation: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                    value={form.emailId}
                    onChange={(e) => setForm((prev) => ({ ...prev, emailId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-blue-900 font-semibold mb-2">Cell Number</label>
                  <input
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                    value={form.cellNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, cellNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-2">Level</label>
                  <input className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gray-100" value={form.empLevel} readOnly />
                </div>
                <div>
                  <label className="block text-blue-900 font-semibold mb-2">Admin</label>
                  <input className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gray-100" value={form.isAdmin ? 'Yes' : 'No'} readOnly />
                </div>
              </div>

              {error && <div className="p-3 rounded bg-red-100 text-red-700">{error}</div>}
              {message && <div className="p-3 rounded bg-green-100 text-green-700">{message}</div>}

              <div className="flex gap-3 justify-center pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700" onClick={() => navigate('/')}>
                  Close
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
