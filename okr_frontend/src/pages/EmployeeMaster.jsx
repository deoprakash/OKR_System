import React, { useState } from 'react';
import LabelInput from '../components/LabelInput';
import BackButton from '../components/BackButton';
import EmployeeLevelSelect from '../components/EmployeeLevelSelect';
import ActionButton from '../components/ActionButton';
import HelpText from '../components/HelpText';

const EMPLOYEE_LEVELS = ['1', '2', '3', '4', '5', '6', '7'];

import { useNavigate } from 'react-router-dom';

const EmployeeMaster = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [level, setLevel] = useState('');

  // Placeholder handlers
  const handleUpdate = () => {};
  const handleFetch = () => {};
  const handleDelete = () => {};
  const handleCancel = () => {
    setCode(''); setName(''); setDesignation(''); setLevel('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 relative">
      <div className="absolute top-8 left-8">
        <BackButton onClick={() => navigate('/')} />
      </div>
      <h1 className="text-4xl font-bold mb-12 mt-4">Employee Master</h1>
      <div className="flex w-full max-w-5xl">
        {/* Left: Form */}
        <form className="flex-1 flex flex-col justify-center pl-8">
          <LabelInput label="Employee Code:">
            <input
              id="employeecode"
              className="w-40 p-2 border border-gray-300 rounded text-lg text-gray-900 placeholder-gray-400"
              value={code}
              onChange={e => setCode(e.target.value)}
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
            <ActionButton className="bg-green-600 hover:bg-green-800 shadow-lg shadow-green-200 border-2 border-green-700" onClick={handleFetch}>Fetch Record</ActionButton>
            <ActionButton className="bg-red-600 hover:bg-red-800 shadow-lg shadow-red-200 border-2 border-red-700" onClick={handleDelete}>Delete Record</ActionButton>
            <ActionButton className="bg-gray-500 hover:bg-gray-700 shadow-lg shadow-gray-200 border-2 border-gray-600" onClick={handleCancel}>Cancel</ActionButton>
          </div>
        </form>
        {/* Right: Help Texts */}
        <div className="flex-1 flex flex-col justify-center pl-16">
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
  );
};

export default EmployeeMaster;
