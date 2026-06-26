import React from 'react';

const EmployeeLevelSelect = ({ value, onChange, options, disabled = false }) => (
  <select
    className={`w-full p-2 border border-gray-300 rounded text-lg ${disabled ? 'bg-gray-100' : ''}`}
    value={value}
    onChange={onChange}
    disabled={disabled}
  >
    <option value="">Select Level</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>{opt}</option>
    ))}
  </select>
);

export default EmployeeLevelSelect;
