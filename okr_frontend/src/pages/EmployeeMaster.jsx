import React, { useState, useEffect } from 'react';
import LabelInput from '../components/LabelInput';
import EmployeeLevelSelect from '../components/EmployeeLevelSelect';
import ActionButton from '../components/ActionButton';
import HelpText from '../components/HelpText';

const EMPLOYEE_LEVELS = ['1', '2', '3', '4', '5', '6', '7'];

import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { createEmployee, listEmployees } from '../lib/api';

const EmployeeMaster = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [level, setLevel] = useState('');

  const computeNextCode = (items) => {
    const maxCode = (items || []).reduce((max, emp) => Math.max(max, Number(emp.empCode) || 0), 0);
    return String(maxCode + 1);
  };

  const refreshNextCode = async () => {
    try {
      const res = await listEmployees();
      setCode(computeNextCode(res?.data || []));
    } catch (err) {
      setCode('');
    }
  };

  // Handlers
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const trimmed = String(code || '').trim();
      if (!trimmed) {
        await refreshNextCode();
      }
      const finalCode = String(code || '').trim();
      if (!finalCode) return toast.send('Employee Code is required', 'error');
      const parsedCode = Number(finalCode);
      if (!Number.isFinite(parsedCode)) return toast.send('Employee Code must be a valid number', 'error');

      const payload = {
        empCode: parsedCode,
        empName: name,
        empDesignation: designation,
        empLevel: Number(level || 0)
      };

      const res = await createEmployee(payload);
      const created = res?.data;
      if (created?.empCode != null) {
        setCode(String(created.empCode));
      }
      const message = { type: 'info', title: 'Employee Master', message: 'Record has been updated successfully' };
      if (window.__electron && typeof window.__electron.showMessage === 'function') {
        await window.__electron.showMessage(message);
      } else {
        window.alert(message.message);
      }
      try { window.focus && window.focus(); } catch {}
      handleCancel();
      await refreshNextCode();
    } catch (err) {
      console.error(err);
      toast.send('Failed to update: ' + (err.message || err), 'error');
    }
  };
  const handleCancel = () => {
    setName(''); setDesignation(''); setLevel('');
  };

  useEffect(() => {
    refreshNextCode();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1724] flex items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-2xl w-[95%] max-w-5xl p-8 overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center">Employee Master</h1>

        <div className="flex w-full gap-8">
          <form className="flex-1">
            <LabelInput label="Employee Code:">
              <input
                id="employeecode"
                className="w-40 p-2 border border-gray-300 rounded text-lg text-gray-900 placeholder-gray-400 bg-gray-100"
                value={code}
                readOnly
              />
            </LabelInput>

            <LabelInput label="Employee Name:">
              <input
                id="employeename"
                className="w-full p-2 border border-gray-300 rounded text-lg text-gray-900 placeholder-gray-400"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </LabelInput>

            <LabelInput label="Employee Designation:">
              <input
                id="employeedesignation"
                className="w-full p-2 border border-gray-300 rounded text-lg text-gray-900 placeholder-gray-400"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
              />
            </LabelInput>

            <LabelInput label="Employee Level:">
              <EmployeeLevelSelect
                value={level}
                onChange={e => setLevel(e.target.value)}
                options={EMPLOYEE_LEVELS}
              />
            </LabelInput>

            <div className="flex flex-row gap-6 mt-8 justify-start">
              <ActionButton className="bg-blue-700 hover:bg-blue-900 shadow-lg shadow-blue-200 border-2 border-blue-800" onClick={handleUpdate}>Update Record</ActionButton>
              <ActionButton className="bg-gray-500 hover:bg-gray-700 shadow-lg shadow-gray-200 border-2 border-gray-600" onClick={() => navigate('/')}>Close</ActionButton>
            </div>
          </form>

          <div className="flex-1 flex flex-col justify-center pl-8">
            <HelpText title="Update Record">
              Update Record will insert new record or update exisiting record.
            </HelpText>
            <HelpText title="Fetch Record">
              Fetch record will retrieve record based on the given Employee Code and then user can modify it
            </HelpText>
            <HelpText title="Delete Record">
              Delete record will allow user to delete the record once he or she fetches the record post clicking the Fetch Record button.
            </HelpText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMaster;
