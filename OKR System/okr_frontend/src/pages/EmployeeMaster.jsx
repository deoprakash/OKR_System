import React, { useState } from 'react';
import LabelInput from '../components/LabelInput';
import EmployeeLevelSelect from '../components/EmployeeLevelSelect';
import ActionButton from '../components/ActionButton';
import BackButton from '../components/BackButton';

const EMPLOYEE_LEVELS = ['1', '2', '3', '4', '5', '6', '7'];

import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { createEmployee, listEmployees } from '../lib/api';

const EmployeeMaster = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [level, setLevel] = useState('');
  const [emailId, setEmailId] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState('No');
  const [isRecordAdded, setIsRecordAdded] = useState(false);

  // Handlers
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!name.trim()) return toast.send('Employee Name is required', 'error');
      if (!level) return toast.send('Employee Level is required', 'error');
      if (!emailId.trim()) return toast.send('Email ID is required', 'error');

      // Client-side duplicate email check
      try {
        const all = await listEmployees();
        const exists = (all.data || []).some(e => String(e.emailId || '').toLowerCase() === String(emailId || '').toLowerCase().trim());
        if (exists) return toast.send('Email already in use', 'error');
      } catch (err) {
        // non-fatal: proceed and let server validate if list fetch fails
        console.warn('Failed to fetch employee list for duplicate check', err);
      }
      if (!cellNumber.trim()) return toast.send('Cell Number is required', 'error');

      const payload = {
        empName: name,
        empDesignation: designation,
        empLevel: Number(level || 0),
        emailId: String(emailId || '').trim(),
        cellNumber: String(cellNumber || '').trim(),
        isAdmin: isAdmin === 'Yes'
      };

      const res = await createEmployee(payload);
      const created = res?.data;
      if (created?.userId) {
        setUserId(String(created.userId));
        // mark record as added and lock the form; user must Close or Back to modify again
        setIsRecordAdded(true);
      }
      const message = { type: 'info', title: 'Employee Master', message: 'Record has been updated successfully' };
      if (window.__electron && typeof window.__electron.showMessage === 'function') {
        await window.__electron.showMessage(message);
      } else {
        window.alert(message.message);
      }
      try { window.focus && window.focus(); } catch {}
      // keep the created record visible and locked on screen; do not auto-clear
    } catch (err) {
      console.error(err);
      toast.send('Failed to update: ' + (err.message || err), 'error');
    }
  };
  const handleCancel = () => {
    // behave like Back/Close: navigate to main screen
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <div className="card w-[95%] max-w-5xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">Employee Master</h1>

        <div className="flex w-full gap-8">
          <form className="flex-1">
            <LabelInput label="Employee User ID:">
              <input
                id="userId"
                className="md:w-40 w-full p-2 border rounded text-lg"
                value={userId}
                placeholder="Auto-generated after save"
                readOnly
              />
            </LabelInput>

            <LabelInput label="Employee Name:">
              <input
                id="employeename"
                className="w-full p-2 border rounded text-lg"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isRecordAdded}
              />
            </LabelInput>

            <LabelInput label="Employee Designation:">
              <input
                id="employeedesignation"
                className="w-full p-2 border rounded text-lg"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                disabled={isRecordAdded}
              />
            </LabelInput>

            <LabelInput label="Employee Level:">
              <EmployeeLevelSelect
                value={level}
                onChange={e => setLevel(e.target.value)}
                options={EMPLOYEE_LEVELS}
                disabled={isRecordAdded}
              />
            </LabelInput>

            <LabelInput label="Email ID:">
              <input
                id="employeeemail"
                type="email"
                className="w-full p-2 border rounded text-lg"
                value={emailId}
                onChange={e => setEmailId(e.target.value)}
                disabled={isRecordAdded}
              />
            </LabelInput>

            <LabelInput label="Cell Number:">
              <input
                id="employeecell"
                type="text"
                className="w-full p-2 border rounded text-lg"
                value={cellNumber}
                onChange={e => setCellNumber(e.target.value)}
                disabled={isRecordAdded}
              />
            </LabelInput>

            <LabelInput label="Admin User:">
              <select
                id="employeeadmin"
                className="w-full p-2 border rounded text-lg"
                value={isAdmin}
                onChange={e => setIsAdmin(e.target.value)}
                disabled={isRecordAdded}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </LabelInput>

            <div className="flex flex-row gap-6 mt-8 justify-start">
              <ActionButton onClick={handleUpdate} disabled={isRecordAdded} className="btn btn-primary">Update Record</ActionButton>
              <ActionButton onClick={(e) => { e.preventDefault(); navigate('/'); }} className="btn btn-ghost">{isRecordAdded ? 'Close' : 'Cancel'}</ActionButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMaster;
