import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getMe, updateEmployee } from '../lib/api';
import { useAuth } from '../context/useAuth';

export default function MyProfile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    userId: '', empName: '', empDesignation: '', emailId: '',
    cellNumber: '', empLevel: '', isAdmin: false
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
          isAdmin: Boolean(me.isAdmin),
        });
      } catch {
        if (mounted) setError('Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = { empName: form.empName, empDesignation: form.empDesignation, emailId: form.emailId, cellNumber: form.cellNumber };
      const res = await updateEmployee(auth.user?.empCode, payload);
      const updated = res?.data || {};
      auth.loginWithSession({
        token: auth.token,
        user: { ...auth.user, empName: updated.empName || form.empName, empDesignation: updated.empDesignation || form.empDesignation, emailId: updated.emailId || form.emailId, cellNumber: updated.cellNumber || form.cellNumber }
      });
      setForm(prev => ({ ...prev, empName: updated.empName || prev.empName, empDesignation: updated.empDesignation || prev.empDesignation, emailId: updated.emailId || prev.emailId, cellNumber: updated.cellNumber || prev.cellNumber }));
      setSuccess('Profile updated successfully');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const initial = (form.empName || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-md mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 shadow-card transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">My Profile</h1>
              <p className="text-sm text-neutral-500">Manage your personal information and preferences.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                <p className="text-sm text-neutral-500">Loading profile…</p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {initial}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">{form.empName}</h2>
                  <p className="text-sm text-neutral-500">{form.empDesignation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="blue" size="sm">Level {form.empLevel}</Badge>
                    {form.isAdmin && <Badge variant="indigo" size="sm">Administrator</Badge>}
                    <span className="text-xs text-neutral-400 font-mono">{form.userId}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave}>
                {/* Editable info */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-5">
                  <h2 className="text-sm font-semibold text-neutral-700 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={form.empName} onChange={e => setForm(p => ({ ...p, empName: e.target.value }))} />
                    <Input label="Designation" value={form.empDesignation} onChange={e => setForm(p => ({ ...p, empDesignation: e.target.value }))} />
                    <Input type="email" label="Email Address" value={form.emailId} onChange={e => setForm(p => ({ ...p, emailId: e.target.value }))} />
                    <Input label="Cell Number" value={form.cellNumber} onChange={e => setForm(p => ({ ...p, cellNumber: e.target.value }))} />
                  </div>
                </div>

                {/* Read-only system info */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-6">
                  <h2 className="text-sm font-semibold text-neutral-700 mb-1">System Information</h2>
                  <p className="text-xs text-neutral-400 mb-4">These fields are managed by your administrator.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Organizational Level" value={`Level ${form.empLevel}`} readOnly />
                    <Input label="Administrator" value={form.isAdmin ? 'Yes' : 'No'} readOnly />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 mb-4 bg-danger-light border border-danger-border rounded-xl text-sm text-danger-text">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-4 mb-4 bg-success-light border border-success-border rounded-xl text-sm text-success-text">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
