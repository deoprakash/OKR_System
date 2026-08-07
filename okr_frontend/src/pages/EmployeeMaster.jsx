import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ToastProvider';
import { createEmployee, listEmployees } from '../lib/api';

const EMPLOYEE_LEVELS = ['1', '2', '3', '4', '5', '6', '7'];

const EmployeeMaster = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    userId: '', name: '', designation: '', level: '',
    emailId: '', cellNumber: '', isAdmin: 'No'
  });

  const hasChanges = Object.values(formData).some(v => v && v !== 'No');
  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const reset = () => setFormData({ userId: '', name: '', designation: '', level: '', emailId: '', cellNumber: '', isAdmin: 'No' });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.send('Employee Name is required', 'error');
    if (!formData.level) return toast.send('Employee Level is required', 'error');
    if (!formData.emailId.trim()) return toast.send('Email ID is required', 'error');
    if (!formData.cellNumber.trim()) return toast.send('Cell Number is required', 'error');

    setSaving(true);
    try {
      const payload = {
        empName: formData.name, empDesignation: formData.designation,
        empLevel: Number(formData.level || 0), emailId: formData.emailId.trim(),
        cellNumber: formData.cellNumber.trim(), isAdmin: formData.isAdmin === 'Yes',
      };
      const res = await createEmployee(payload);
      if (res?.data?.userId) reset();
      toast.send('Employee added successfully!', 'success');
    } catch (err) {
      toast.send('Failed: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-md mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 shadow-card transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Add Employee</h1>
              <p className="text-sm text-neutral-500">Create a new employee record in the system.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSave}>
              {/* Identity section */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-1">Identity</h2>
                <p className="text-xs text-neutral-400 mb-5">Basic identity information for the employee.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="User ID"
                    value={formData.userId || 'Auto-generated'}
                    readOnly
                    hint="Will be assigned automatically after saving."
                  />
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Jane Doe"
                    required
                    autoFocus
                  />
                  <Input
                    label="Designation"
                    value={formData.designation}
                    onChange={e => update('designation', e.target.value)}
                    placeholder="Senior Engineer"
                  />
                  <Select
                    label="Organizational Level"
                    value={formData.level}
                    onChange={e => update('level', e.target.value)}
                    required
                  >
                    <option value="">Select Level</option>
                    {EMPLOYEE_LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
                  </Select>
                </div>
              </div>

              {/* Contact section */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-5">
                <h2 className="text-sm font-semibold text-neutral-700 mb-1">Contact Details</h2>
                <p className="text-xs text-neutral-400 mb-5">Used for login and communication.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    label="Email Address"
                    value={formData.emailId}
                    onChange={e => update('emailId', e.target.value)}
                    placeholder="jane@company.com"
                    required
                  />
                  <Input
                    label="Cell Number"
                    value={formData.cellNumber}
                    onChange={e => update('cellNumber', e.target.value)}
                    placeholder="+1 234 567 890"
                    required
                  />
                </div>
              </div>

              {/* Permissions section */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-6">
                <h2 className="text-sm font-semibold text-neutral-700 mb-1">Permissions</h2>
                <p className="text-xs text-neutral-400 mb-5">Admin users can manage employees and view analytics.</p>
                <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Administrator Access</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Grant full admin privileges to this employee.</p>
                  </div>
                  <Select
                    value={formData.isAdmin}
                    onChange={e => update('isAdmin', e.target.value)}
                    className="w-24"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => hasChanges ? reset() : navigate('/admin-users')}>
                  {hasChanges ? 'Reset Form' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  {saving ? 'Saving...' : 'Save Employee'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeMaster;
